import { randomBytes } from 'node:crypto';

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { z } from 'zod';

import { prisma } from '../db.js';
import { Prisma, type Material, type QuizAttempt } from '../generated/prisma/client.js';
import { AppError, notFound } from '../lib/errors.js';
import { learningLanguageOf } from '../services/personalization.js';
import { recordActivity, requestTimeZone } from '../services/progress.js';
import { confirmReferralIfEligible } from '../services/referrals.js';
import { me, requireAuth } from '../services/sessions.js';
import {
  generateStudyContent,
  readSource,
  StudyError,
  studyDiagram,
  youtubeId,
  type GenerateOptions,
  type Source,
  type StudyContent,
} from '../services/study-ai.js';
import { toPublicUser } from '../services/users.js';

export const materialsRouter = Router();
materialsRouter.use(['/materials', '/materials/*rest'], (req, res, next) =>
  // Files are fetched by <Image> tags, which can't send a token; their long random token is the key.
  req.originalUrl.startsWith('/materials/files/') ? next() : requireAuth(req, res, next),
);

/** A study pack costs 1 AI credit, held while it's made and returned if it fails. */
export const PACK_CREDITS = 1;
export const DIAGRAM_CREDITS = 1;
/** A pack still "processing" this long after its last update was interrupted (e.g. a server restart). */
const STALE_MS = 10 * 60_000;

// AI calls cost money: a per-minute cap on top of credits.
const aiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 6,
  keyGenerator: (req) => req.userId ?? 'anon',
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'Slow down a little — try again in a minute.', reason: 'rate-limited' },
});

const MAX_FILE = 20 * 1024 * 1024;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_FILE } });
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

// ─── Shapes the app reads ─────────────────────────────────────────────────────

type Options = GenerateOptions & { titleSet?: boolean };
type MaterialWith = Material & { quizAttempts?: QuizAttempt[]; files?: { kind: string; token: string }[] };

const fileUrl = (token: string) => `/materials/files/${token}`;

function toPublicAttempt(a: QuizAttempt) {
  return {
    id: a.id,
    createdAt: a.createdAt.getTime(),
    questionIds: a.questionIds,
    answers: a.answers as (number | null)[],
    score: a.score,
    total: a.total,
    seconds: a.seconds,
    settings: a.settings,
  };
}

function toPublicMaterial(m: MaterialWith) {
  const { titleSet: _t, ...options } = m.options as Options;
  const diagram = m.files?.find((f) => f.kind === 'diagram');
  return {
    id: m.id,
    title: m.title,
    subject: m.subject,
    folder: m.folder,
    tags: m.tags,
    source: {
      type: m.sourceType,
      label: m.sourceLabel,
      ...(m.sourceUrl && { url: m.sourceUrl }),
      ...(m.fileName && { fileName: m.fileName }),
      ...(m.fileSize && { size: m.fileSize }),
    },
    options,
    status: m.status === 'READY' ? 'ready' : m.status === 'FAILED' ? 'failed' : 'processing',
    progress: 1,
    stage: m.stage,
    ...(m.error && { error: m.error as { code: string; retryable: boolean } }),
    ...(m.content && { content: m.content as StudyContent }),
    attempts: (m.quizAttempts ?? []).map(toPublicAttempt),
    cards: m.cards,
    saved: m.saved,
    offline: m.offline,
    mastery: m.mastery,
    ...(diagram && { image: fileUrl(diagram.token) }),
    createdAt: m.createdAt.getTime(),
    updatedAt: m.updatedAt.getTime(),
  };
}

const include = {
  quizAttempts: { orderBy: { createdAt: 'desc' }, take: 50 },
  files: { where: { kind: 'diagram' }, select: { kind: true, token: true } },
} satisfies Prisma.MaterialInclude;

async function ownMaterial(id: string, userId: string) {
  const m = await prisma.material.findFirst({ where: { id, userId }, include });
  if (!m) throw notFound('Study pack not found');
  return failIfStale(m);
}

// ─── Processing ───────────────────────────────────────────────────────────────

/** Ends a generation: the pack is ready, or failed with its held credit returned. */
async function fail(id: string, code: StudyError['code'], retryable: boolean) {
  await prisma.$transaction(async (tx) => {
    const m = await tx.material.findUnique({ where: { id }, select: { creditHeld: true, userId: true } });
    if (!m) return;
    await tx.material.update({
      where: { id },
      data: { status: 'FAILED', error: { code, retryable }, creditHeld: false },
    });
    if (m.creditHeld) await tx.user.update({ where: { id: m.userId }, data: { aiCredits: { increment: PACK_CREDITS } } });
  });
}

/** A generation interrupted by a restart is shown as failed (retryable) instead of spinning forever. */
async function failIfStale<T extends Material>(m: T): Promise<T> {
  if (m.status !== 'PROCESSING' || Date.now() - m.updatedAt.getTime() < STALE_MS) return m;
  await fail(m.id, 'ai-failed', true);
  return { ...m, ...(await prisma.material.findUniqueOrThrow({ where: { id: m.id } })) };
}

/**
 * Reads the source and writes the pack with OpenAI, updating `stage` as it goes. Runs after the
 * request has been answered; the app follows along by polling.
 */
export async function processMaterial(id: string) {
  const m = await prisma.material.findUnique({
    where: { id },
    include: { user: true, files: { where: { kind: 'source' } } },
  });
  if (!m) return;
  try {
    const file = m.files[0];
    const source: Source =
      m.sourceType === 'text'
        ? { type: 'text', text: m.sourceText }
        : m.sourceType === 'topic'
          ? { type: 'topic', topic: m.sourceLabel }
          : m.sourceType === 'video'
            ? { type: 'video', url: m.sourceUrl ?? '' }
            : {
                type: m.sourceType as 'pdf' | 'doc' | 'image',
                file: { data: Buffer.from(file?.data ?? []), mimeType: file?.mimeType ?? '', name: file?.name ?? '' },
              };
    const read = await readSource(m.userId, source);
    await prisma.material.update({ where: { id }, data: { sourceText: read.text } });

    const options = m.options as Options;
    const { content, title, subject } = await generateStudyContent(
      m.userId,
      { text: read.text, pdf: read.pdf, topic: m.sourceType === 'topic' ? m.sourceLabel : undefined },
      options,
      learningLanguageOf(m.user),
      (stage) => prisma.material.update({ where: { id }, data: { stage } }),
    );

    await prisma.$transaction(async (tx) => {
      const cur = await tx.material.findUnique({ where: { id } });
      // Deleted while it was being made: nothing to save, and the credit was spent on nothing.
      if (!cur) return;
      await tx.material.update({
        where: { id },
        data: {
          status: 'READY',
          stage: 4,
          error: Prisma.DbNull,
          content,
          creditHeld: false,
          title: options.titleSet ? cur.title : read.title || title,
          subject: cur.subject === 'General' ? subject : cur.subject,
          folder: cur.folder || (subject === 'General' ? '' : subject),
        },
      });
      if (cur.creditHeld)
        await tx.creditEntry.create({ data: { userId: m.userId, credits: -PACK_CREDITS, reason: 'spend' } });
    });
    await recordActivity(m.userId, { xp: 20, coins: 5, minutes: 3 }, { reason: `study-pack:${id}` });
  } catch (err) {
    if (err instanceof StudyError) return fail(id, err.code, err.retryable);
    if (err instanceof AppError && err.reason === 'not-configured') return fail(id, 'not-configured', true);
    console.error('Study pack failed', id, err);
    return fail(id, 'ai-failed', true);
  }
}

/** Starts processing without making the request wait for it. */
const startProcessing = (id: string) => {
  processMaterial(id).catch((e) => console.error('Study pack crashed', id, e));
};

async function holdCredit(userId: string) {
  const held = await prisma.user.updateMany({
    where: { id: userId, aiCredits: { gte: PACK_CREDITS } },
    data: { aiCredits: { decrement: PACK_CREDITS } },
  });
  if (!held.count)
    throw new AppError(402, 'You are out of AI credits. Invite a friend or upgrade to Plus for more.', 'no-credits');
}

// ─── Create (62–70) ───────────────────────────────────────────────────────────

const MaterialId = z.string().regex(/^[A-Za-z0-9_-]{6,40}$/, 'Invalid id');

const jsonField = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (typeof v === 'string' && v ? JSON.parse(v) : v), schema);

const OUTPUTS = ['summary', 'notes', 'concepts', 'points', 'flashcards', 'quiz', 'mindmap'] as const;
const Create = z.object({
  type: z.enum(['pdf', 'doc', 'text', 'topic', 'video', 'image']),
  title: z.string().trim().max(120).optional(),
  text: z.string().max(200_000).optional(),
  topic: z.string().trim().max(200).optional(),
  url: z.string().trim().max(500).optional(),
  options: jsonField(
    z
      .object({
        depth: z.enum(['Quick', 'Standard', 'Deep']).default('Standard'),
        difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Intermediate'),
        outputs: z.array(z.enum(OUTPUTS)).min(1).default([...OUTPUTS]),
      })
      .default({ depth: 'Standard', difficulty: 'Intermediate', outputs: [...OUTPUTS] }),
  ),
});

/**
 * Starts a study pack. JSON for text, topics and video links; multipart with `file` for PDFs,
 * Word documents and photos. Answers 202 at once; poll GET /materials/:id for progress.
 */
materialsRouter.post('/materials/:id', aiLimiter, upload.single('file'), async (req, res) => {
  const user = me(req);
  const id = MaterialId.parse(req.params.id);
  const input = Create.parse(req.body);
  if (await prisma.material.findUnique({ where: { id }, select: { id: true } }))
    throw new AppError(409, 'This study pack already exists', 'exists');

  const isFile = input.type === 'pdf' || input.type === 'doc' || input.type === 'image';
  const file = req.file;
  if (isFile) {
    if (!file) throw new AppError(400, 'Choose a file to upload', 'invalid');
    const ok =
      input.type === 'pdf'
        ? file.mimetype === 'application/pdf'
        : input.type === 'image'
          ? IMAGE_TYPES.includes(file.mimetype)
          : file.mimetype === DOCX || /\.docx$/i.test(file.originalname) || file.mimetype === 'text/plain';
    // Old .doc files can't be read reliably; the app asks for .docx or PDF.
    if (!ok) throw new AppError(415, 'Upload a PDF, a Word file (.docx), a text file or a photo', 'unsupported-file');
  }
  if (input.type === 'text' && (input.text ?? '').trim().length < 120)
    throw new AppError(400, 'Paste a bit more text — at least a few sentences', 'not-enough-text');
  if (input.type === 'topic' && !input.topic) throw new AppError(400, 'Enter a topic', 'invalid');
  if (input.type === 'video' && !youtubeId(input.url ?? ''))
    throw new AppError(400, 'Paste a YouTube link', 'not-youtube');

  await holdCredit(user.id);
  const label =
    input.type === 'topic'
      ? input.topic!
      : input.type === 'video'
        ? input.url!
        : isFile
          ? file!.originalname.slice(0, 120)
          : 'Pasted text';
  const created = await prisma.material.create({
    data: {
      id,
      userId: user.id,
      title: input.title || (input.type === 'topic' ? input.topic! : label),
      sourceType: input.type,
      sourceLabel: label,
      sourceUrl: input.type === 'video' ? input.url : null,
      fileName: isFile ? file!.originalname.slice(0, 120) : null,
      fileSize: isFile ? file!.size : null,
      sourceText: input.type === 'text' ? input.text!.slice(0, 200_000) : '',
      options: { ...input.options, titleSet: !!input.title },
      creditHeld: true,
      ...(isFile && {
        files: {
          create: {
            kind: 'source',
            token: randomBytes(24).toString('base64url'),
            name: file!.originalname.slice(0, 120),
            mimeType: file!.mimetype,
            data: new Uint8Array(file!.buffer),
          },
        },
      }),
    },
    include,
  });
  startProcessing(id);
  res.status(202).json({ material: toPublicMaterial(created) });
});

/** Tries a failed pack again (70). Holds a new credit; returned again if it fails. */
materialsRouter.post('/materials/:id/retry', aiLimiter, async (req, res) => {
  const user = me(req);
  const m = await ownMaterial(String(req.params.id), user.id);
  const error = m.error as { retryable?: boolean } | null;
  if (m.status !== 'FAILED' || !error?.retryable) throw new AppError(409, 'This study pack can’t be retried', 'not-retryable');
  await holdCredit(user.id);
  const updated = await prisma.material.update({
    where: { id: m.id },
    data: { status: 'PROCESSING', stage: 0, error: Prisma.DbNull, creditHeld: true },
    include,
  });
  startProcessing(m.id);
  res.status(202).json({ material: toPublicMaterial(updated) });
});

// ─── Library (84–87) ──────────────────────────────────────────────────────────

const Since = z.object({ since: z.coerce.number().int().nonnegative().optional() });

/**
 * My materials (85). With ?since= (the `serverTime` of the last sync) only packs changed since
 * then are sent in full; `ids` lists every pack so the app can drop deleted ones.
 */
materialsRouter.get('/materials', async (req, res) => {
  const userId = me(req).id;
  const { since } = Since.parse(req.query);
  const serverTime = Date.now();
  const [changed, all] = await Promise.all([
    prisma.material.findMany({
      where: { userId, ...(since && { updatedAt: { gt: new Date(since - 1000) } }) },
      orderBy: { createdAt: 'desc' },
      include,
    }),
    prisma.material.findMany({ where: { userId }, select: { id: true }, orderBy: { createdAt: 'desc' } }),
  ]);
  const fresh = await Promise.all(changed.map(failIfStale));
  res.json({ materials: fresh.map(toPublicMaterial), ids: all.map((m) => m.id), serverTime });
});

materialsRouter.get('/materials/:id', async (req, res) => {
  res.json({ material: toPublicMaterial(await ownMaterial(String(req.params.id), me(req).id)) });
});

const Patch = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  subject: z.string().trim().min(1).max(60).optional(),
  folder: z.string().trim().max(60).optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(12).optional(),
  saved: z.boolean().optional(),
  offline: z.boolean().optional(),
});

/** Rename, file into a folder, tag (86), save to the study library or keep offline (84). */
materialsRouter.patch('/materials/:id', async (req, res) => {
  const m = await ownMaterial(String(req.params.id), me(req).id);
  const patch = Patch.parse(req.body);
  const updated = await prisma.material.update({
    where: { id: m.id },
    data: {
      ...patch,
      // A title the learner chose is kept when a retry finishes.
      ...(patch.title && { options: { ...(m.options as Options), titleSet: true } }),
    },
    include,
  });
  res.json({ material: toPublicMaterial(updated) });
});

/** Delete (87). Its file, diagram and quiz history go with it. */
materialsRouter.delete('/materials/:id', async (req, res) => {
  const m = await prisma.material.findFirst({ where: { id: String(req.params.id), userId: me(req).id } });
  if (m) {
    await prisma.$transaction(async (tx) => {
      // Deleted mid-generation: the held credit goes back.
      if (m.creditHeld) await tx.user.update({ where: { id: m.userId }, data: { aiCredits: { increment: PACK_CREDITS } } });
      await tx.material.delete({ where: { id: m.id } });
    });
  }
  res.json({ ok: true });
});

// ─── Practice (75–81) ─────────────────────────────────────────────────────────

const AttemptInput = z.object({
  questionIds: z.array(z.string().max(40)).min(1).max(100),
  answers: z.array(z.number().int().min(0).max(10).nullable()),
  seconds: z.number().int().min(0).max(24 * 3600).default(0),
  settings: z.object({
    count: z.number().int().min(1).max(100),
    difficulty: z.enum(['mixed', 'easy', 'hard']),
    types: z.array(z.enum(['mcq', 'tf'])).min(1),
    timed: z.boolean(),
  }),
});

/** A finished quiz (80). The server marks it, so scores and rewards can't be faked. */
materialsRouter.post('/materials/:id/attempts', async (req, res) => {
  const userId = me(req).id;
  const m = await ownMaterial(String(req.params.id), userId);
  const input = AttemptInput.parse(req.body);
  if (input.answers.length !== input.questionIds.length) throw new AppError(400, 'One answer per question', 'invalid');
  const bank = new Map(((m.content as StudyContent | null)?.quiz ?? []).map((q) => [q.id, q]));
  const questions = input.questionIds.map((qid) => bank.get(qid));
  if (questions.some((q) => !q)) throw new AppError(400, 'Unknown question', 'invalid');

  const missed = questions.filter((q, i) => input.answers[i] !== q!.correctIndex);
  const total = questions.length;
  const score = total - missed.length;
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      materialId: m.id,
      questionIds: input.questionIds,
      answers: input.answers,
      score,
      total,
      seconds: input.seconds,
      settings: input.settings,
      weakConcepts: [...new Set(missed.map((q) => q!.concept))],
    },
  });
  await prisma.material.update({ where: { id: m.id }, data: { mastery: Math.max(m.mastery, score / total) } });
  const xpEarned = 10 + score * 10;
  const coinsEarned = score === total ? 15 : 5;
  const user = await recordActivity(
    userId,
    { xp: xpEarned, coins: coinsEarned, minutes: Math.max(1, input.seconds / 60) },
    { reason: `quiz:${m.id}`, tz: requestTimeZone(req) },
  );
  await confirmReferralIfEligible(userId);
  res.status(201).json({ attempt: toPublicAttempt(attempt), xpEarned, coinsEarned, user: toPublicUser(user) });
});

const DAY = 86_400_000;
/** Leitner boxes: days until the next review (same as the app). */
const BOX_DAYS = [0, 1, 3, 7, 16];
const Review = z.object({ knewIt: z.boolean() });

/** One flashcard reviewed in study mode (76): known cards space out, missed ones come back today. */
materialsRouter.post('/materials/:id/cards/:cardId/review', async (req, res) => {
  const userId = me(req).id;
  const m = await ownMaterial(String(req.params.id), userId);
  const cardId = String(req.params.cardId);
  if (!(m.content as StudyContent | null)?.flashcards.some((c) => c.id === cardId)) throw notFound('Card not found');
  const { knewIt } = Review.parse(req.body);
  const cards = m.cards as Record<string, { box: number; dueAt: number; reviews: number }>;
  const prev = cards[cardId] ?? { box: 0, dueAt: 0, reviews: 0 };
  const box = knewIt ? Math.min(prev.box + 1, BOX_DAYS.length - 1) : 0;
  const card = { box, reviews: prev.reviews + 1, dueAt: Date.now() + BOX_DAYS[box] * DAY };
  await prisma.material.update({ where: { id: m.id }, data: { cards: { ...cards, [cardId]: card } } });
  await recordActivity(userId, { xp: knewIt ? 2 : 1, coins: 0, minutes: 0.25 }, { reason: `flashcards:${m.id}`, tz: requestTimeZone(req) });
  res.json({ card });
});

// ─── Diagram (images) ─────────────────────────────────────────────────────────

/** A diagram of the pack, drawn by AI for 1 credit (refunded if drawing fails), stored in the database. */
materialsRouter.post('/materials/:id/diagram', aiLimiter, async (req, res) => {
  const user = me(req);
  const m = await ownMaterial(String(req.params.id), user.id);
  const existing = m.files?.find((f) => f.kind === 'diagram');
  if (existing) {
    res.json({ image: fileUrl(existing.token), credits: user.aiCredits });
    return;
  }
  if (m.status !== 'READY' || !m.content) throw new AppError(409, 'The study pack isn’t ready yet', 'not-ready');
  const held = await prisma.user.updateMany({
    where: { id: user.id, aiCredits: { gte: DIAGRAM_CREDITS } },
    data: { aiCredits: { decrement: DIAGRAM_CREDITS } },
  });
  if (!held.count)
    throw new AppError(402, 'You are out of AI credits. Invite a friend or upgrade to Plus for more.', 'no-credits');
  try {
    const jpeg = await studyDiagram(user.id, m.title, m.content as StudyContent);
    const token = randomBytes(24).toString('base64url');
    const [, updated] = await prisma.$transaction([
      prisma.materialFile.create({
        data: { materialId: m.id, kind: 'diagram', token, name: 'diagram.jpg', mimeType: 'image/jpeg', data: new Uint8Array(jpeg) },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { creditEntries: { create: { credits: -DIAGRAM_CREDITS, reason: 'spend' } } },
        select: { aiCredits: true },
      }),
      // Bumps updatedAt so other devices pick up the drawing on their next sync.
      prisma.material.update({ where: { id: m.id }, data: { updatedAt: new Date() } }),
    ]);
    res.json({ image: fileUrl(token), credits: updated.aiCredits });
  } catch (err) {
    await prisma.user.update({ where: { id: user.id }, data: { aiCredits: { increment: DIAGRAM_CREDITS } } });
    throw err;
  }
});

/** Source files and diagrams, by their unguessable token (no sign-in, so <Image> tags can load them). */
materialsRouter.get('/materials/files/:token', async (req, res) => {
  const file = await prisma.materialFile.findUnique({ where: { token: String(req.params.token) } });
  if (!file) throw notFound('File not found');
  res
    .set({
      'Content-Type': file.mimeType,
      'Cache-Control': 'private, max-age=31536000, immutable',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    })
    .send(Buffer.from(file.data));
});
