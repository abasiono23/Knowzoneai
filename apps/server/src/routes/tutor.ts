import { randomBytes } from 'node:crypto';

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { z } from 'zod';

import { prisma } from '../db.js';
import { Prisma, type Plan, type TutorConversation, type TutorMessage } from '../generated/prisma/client.js';
import { AppError, notFound } from '../lib/errors.js';
import { catalogFor } from '../services/catalog.js';
import { learningLanguageOf } from '../services/personalization.js';
import { me, requireAuth } from '../services/sessions.js';
import {
  answerAsText,
  answerDiagram,
  answerFlashcards,
  answerQuiz,
  tutorAnswer,
  type TutorAnswer,
  type TutorInput,
} from '../services/tutor-ai.js';

export const tutorRouter = Router();
tutorRouter.use(['/tutor', '/tutor/*rest'], (req, res, next) =>
  // Files are fetched by <Image> tags, which can't send a token; their long random token is the key.
  req.originalUrl.startsWith('/tutor/files/') ? next() : requireAuth(req, res, next),
);

// ─── Daily allowance (60) ─────────────────────────────────────────────────────

export const DAILY_LIMITS: Record<Plan, number> = { FREE: 10, PLUS: 100, PRO: 300 };
const DAY = 86_400_000;
/** Days start at midnight in Lagos (UTC+1, no daylight saving). */
const OFFSET = 3_600_000;
const dayStart = (now = Date.now()) => new Date(Math.floor((now + OFFSET) / DAY) * DAY - OFFSET);

async function usageOf(userId: string, plan: Plan) {
  const start = dayStart();
  const used = await prisma.usageEvent.count({
    where: { userId, feature: 'tutor_question', createdAt: { gte: start } },
  });
  const limit = DAILY_LIMITS[plan];
  return { limit, used, remaining: Math.max(0, limit - used), resetAt: start.getTime() + DAY };
}

export async function requireAllowance(userId: string, plan: Plan) {
  const usage = await usageOf(userId, plan);
  if (usage.remaining <= 0)
    throw new AppError(429, `You’ve used all ${usage.limit} tutor questions for today.`, 'tutor-limit');
  return usage;
}

tutorRouter.get('/tutor/usage', async (req, res) => {
  const user = me(req);
  res.json({ usage: await usageOf(user.id, user.plan) });
});

// AI calls cost money: a per-minute cap on top of the daily allowance.
const aiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 12,
  keyGenerator: (req) => req.userId ?? 'anon',
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'Slow down a little — try again in a minute.', reason: 'rate-limited' },
});

// ─── Shapes the app reads ─────────────────────────────────────────────────────

type Attachment = { kind: 'image' | 'pdf'; name: string; page?: number; fileId?: string; token?: string };
type Extras = { flashcards?: TutorAnswer['flashcards']; quiz?: TutorAnswer['quiz']; imageToken?: string };
type Context = { kind: 'lesson' | 'pack' | 'upload' | 'image'; label: string; refId?: string };

const fileUrl = (token: string) => `/tutor/files/${token}`;

function toPublicMessage(m: TutorMessage) {
  const at = m.createdAt.getTime();
  if (m.role === 'user') {
    const a = m.attachment as Attachment | null;
    return {
      id: m.id,
      role: 'user' as const,
      text: m.text,
      createdAt: at,
      ...(a && {
        attachment: { kind: a.kind, name: a.name, uri: a.token ? fileUrl(a.token) : '', ...(a.page && { page: a.page }) },
      }),
    };
  }
  const extras = m.extras as Extras;
  const answer = m.answer as TutorAnswer | null;
  return {
    id: m.id,
    role: 'assistant' as const,
    createdAt: at,
    status: m.status as 'ok' | 'error',
    replyTo: m.replyToId ?? '',
    ...(answer && {
      answer: { ...answer, flashcards: extras.flashcards ?? [], quiz: extras.quiz ?? [] },
    }),
    ...(m.error && { error: m.error as { kind: 'network' | 'server' | 'limit'; message: string } }),
    ...(extras.imageToken && { image: fileUrl(extras.imageToken) }),
  };
}

function toPublicConversation(c: TutorConversation, messages?: TutorMessage[]) {
  return {
    id: c.id,
    title: c.title,
    subject: c.subject,
    mode: c.mode,
    level: c.level,
    pinned: c.pinned,
    createdAt: c.createdAt.getTime(),
    updatedAt: c.updatedAt.getTime(),
    ...(c.context && { context: c.context as Context }),
    ...(messages && { messages: messages.map(toPublicMessage) }),
  };
}

// ─── Conversations (48, 49, 50) ───────────────────────────────────────────────

/** History (50): newest first, without messages; each has a preview of its first question. */
tutorRouter.get('/tutor/conversations', async (req, res) => {
  const conversations = await prisma.tutorConversation.findMany({
    where: { userId: me(req).id },
    orderBy: { updatedAt: 'desc' },
    take: 200,
    include: { _count: { select: { messages: true } } },
  });
  res.json({
    conversations: conversations.map((c) => ({ ...toPublicConversation(c), messageCount: c._count.messages })),
  });
});

async function ownConversation(id: string, userId: string) {
  const c = await prisma.tutorConversation.findFirst({ where: { id, userId } });
  if (!c) throw notFound('Conversation not found');
  return c;
}

tutorRouter.get('/tutor/conversations/:id', async (req, res) => {
  const c = await ownConversation(String(req.params.id), me(req).id);
  const messages = await prisma.tutorMessage.findMany({ where: { conversationId: c.id }, orderBy: { createdAt: 'asc' } });
  res.json({ conversation: toPublicConversation(c, messages) });
});

const Patch = z.object({ pinned: z.boolean().optional(), title: z.string().trim().min(1).max(80).optional() });

tutorRouter.patch('/tutor/conversations/:id', async (req, res) => {
  const c = await ownConversation(String(req.params.id), me(req).id);
  const updated = await prisma.tutorConversation.update({ where: { id: c.id }, data: Patch.parse(req.body) });
  res.json({ conversation: toPublicConversation(updated) });
});

tutorRouter.delete('/tutor/conversations/:id', async (req, res) => {
  await prisma.tutorConversation.deleteMany({ where: { id: String(req.params.id), userId: me(req).id } });
  res.json({ ok: true });
});

// ─── Asking (48, 51–56, 61) ───────────────────────────────────────────────────

const MAX_FILE = 10 * 1024 * 1024;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_FILE } });
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const NewConversation = z.object({
  mode: z.enum(['explain', 'steps', 'exam', 'teach-back']).default('explain'),
  level: z.enum(['beginner', 'advanced']).default('beginner'),
  subject: z.string().trim().max(60).optional(),
  context: z
    .object({
      kind: z.enum(['lesson', 'pack', 'upload', 'image']),
      label: z.string().trim().max(120),
      refId: z.string().max(60).optional(),
    })
    .optional(),
});

// Multipart forms send fields as strings, so the nested object may arrive as JSON text.
const jsonField = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (typeof v === 'string' && v ? JSON.parse(v) : v), schema);

const Ask = z.object({
  text: z.string().trim().max(4000).default(''),
  page: z.coerce.number().int().min(1).max(2000).optional(),
  conversation: jsonField(NewConversation.optional()),
});

const ConversationId = z.string().regex(/^[A-Za-z0-9_-]{6,40}$/, 'Invalid conversation id');
const titleFrom = (q: string) => {
  const t = q.trim().replace(/\s+/g, ' ');
  return t.length > 48 ? `${t.slice(0, 45)}…` : t;
};

/** Lesson or study-pack text a conversation was started from, so answers stay grounded in it. */
async function groundingFor(userId: string, context: Context | null, language: Parameters<typeof catalogFor>[0]) {
  if (!context?.refId) return undefined;
  if (context.kind === 'lesson') {
    const lesson = (await catalogFor(language)).lessons.find((l) => l.id === context.refId);
    return lesson && `${lesson.title}\n${lesson.summary}\n${lesson.keyPoints.map((k) => `- ${k}`).join('\n')}`;
  }
  if (context.kind === 'pack') {
    const m = await prisma.material.findFirst({
      where: { id: context.refId, userId },
      select: { sourceText: true, content: true },
    });
    if (m?.sourceText) return m.sourceText.slice(0, 30_000);
    // Packs made from a topic have no source text: their notes stand in for it.
    const c = m?.content as { summary?: { tldr: string; overview: string[] }; keyPoints?: { text: string }[] } | null;
    if (!c?.summary) return undefined;
    return [c.summary.tldr, ...c.summary.overview, ...(c.keyPoints ?? []).map((p) => `- ${p.text}`)].join('\n');
  }
  return undefined;
}

/**
 * Answers `question` and stores the reply (a new assistant message, or `replace` on retry).
 * AI failures become an error reply the chat shows with a Retry button (61), not an HTTP error.
 */
async function reply(
  conversation: TutorConversation,
  question: TutorMessage,
  user: ReturnType<typeof me>,
  replace?: string,
) {
  const language = learningLanguageOf(user);
  const earlier = await prisma.tutorMessage.findMany({
    where: { conversationId: conversation.id, createdAt: { lt: question.createdAt }, status: 'ok' },
    orderBy: { createdAt: 'asc' },
  });
  const history: TutorInput['history'] = earlier.map((m) =>
    m.role === 'user'
      ? { role: 'user', content: m.text || '(sent a photo or document)' }
      : { role: 'assistant', content: m.answer ? answerAsText(m.answer as TutorAnswer) : '' },
  );

  const a = question.attachment as Attachment | null;
  const file = a?.fileId ? await prisma.tutorFile.findUnique({ where: { id: a.fileId } }) : null;
  const context = conversation.context as Context | null;
  const sources = a
    ? [a.kind === 'pdf' ? `${a.name}${a.page ? ` · p. ${a.page}` : ''}` : a.name]
    : context?.refId
      ? [context.label]
      : [];

  let data: Pick<TutorMessage, 'status'> & { answer?: TutorAnswer; error?: { kind: string; message: string } };
  try {
    const answer = await tutorAnswer(user.id, {
      question: question.text,
      history,
      mode: conversation.mode as TutorInput['mode'],
      level: conversation.level as TutorInput['level'],
      language,
      ...(file && a?.kind === 'image' && { image: { data: Buffer.from(file.data), mimeType: file.mimeType } }),
      ...(file && a?.kind === 'pdf' && { pdf: { data: Buffer.from(file.data), name: a.name, page: a.page } }),
      grounding: await groundingFor(user.id, context, language),
      sources,
    });
    data = { status: 'ok', answer };
  } catch (err) {
    if (!(err instanceof AppError)) console.error('Tutor answer failed', err);
    // Stored in English; the app shows translated text for the error kind.
    data = {
      status: 'error',
      error: {
        kind: 'server',
        message:
          err instanceof AppError && err.reason === 'not-configured'
            ? 'The AI tutor isn’t set up on this server yet.'
            : 'The tutor couldn’t answer just now. Please try again.',
      },
    };
  }

  const saved = replace
    ? await prisma.tutorMessage.update({
        where: { id: replace },
        // A good retry clears the old error.
        data: { ...data, error: data.error ?? Prisma.DbNull, createdAt: new Date() },
      })
    : await prisma.tutorMessage.create({
        data: { conversationId: conversation.id, role: 'assistant', replyToId: question.id, ...data },
      });
  // The first good answer names the subject; the conversation moves to the top of the history.
  const updated = await prisma.tutorConversation.update({
    where: { id: conversation.id },
    data: {
      ...(conversation.subject === 'General' && data.answer && data.answer.subject !== 'General'
        ? { subject: data.answer.subject }
        : {}),
      updatedAt: new Date(),
    },
  });
  return { saved, updated };
}

/**
 * Asks the tutor (48, 52, 53, 54, 55, 56). JSON or multipart with an optional `file` (photo or
 * PDF). The conversation is created on its first question, with the id the app made for it.
 */
tutorRouter.post('/tutor/conversations/:id/messages', aiLimiter, upload.single('file'), async (req, res) => {
  const user = me(req);
  const id = ConversationId.parse(req.params.id);
  const input = Ask.parse(req.body);
  if (!input.text && !req.file) throw new AppError(400, 'Type a question or add a photo', 'invalid');
  const usage = await requireAllowance(user.id, user.plan);

  let conversation = await prisma.tutorConversation.findUnique({ where: { id } });
  if (conversation && conversation.userId !== user.id) throw notFound('Conversation not found');

  const isPdf = req.file?.mimetype === 'application/pdf';
  if (req.file && !isPdf && !IMAGE_TYPES.includes(req.file.mimetype))
    throw new AppError(415, 'Upload a photo (JPG, PNG, WebP) or a PDF', 'unsupported-file');
  const fileName = req.file && (req.file.originalname.slice(0, 120) || (isPdf ? 'document.pdf' : 'photo.jpg'));

  if (!conversation) {
    const c = input.conversation ?? NewConversation.parse({});
    conversation = await prisma.tutorConversation.create({
      data: {
        id,
        userId: user.id,
        title: titleFrom(input.text) || (fileName ? `Question from ${fileName}` : 'New conversation'),
        subject: c.subject || 'General',
        mode: c.mode,
        level: c.level,
        context: c.context ?? undefined,
      },
    });
  }

  // The photo or PDF is kept in the database with the conversation (and deleted with it).
  let attachment: Attachment | undefined;
  if (req.file && fileName) {
    const saved = await prisma.tutorFile.create({
      data: {
        userId: user.id,
        conversationId: id,
        token: randomBytes(24).toString('base64url'),
        kind: 'upload',
        mimeType: req.file.mimetype,
        data: new Uint8Array(req.file.buffer),
      },
    });
    attachment = {
      kind: isPdf ? 'pdf' : 'image',
      name: fileName,
      ...(input.page && { page: input.page }),
      fileId: saved.id,
      token: saved.token,
    };
  }

  const question = await prisma.tutorMessage.create({
    data: { conversationId: id, role: 'user', text: input.text, attachment: attachment ?? undefined },
  });
  const { saved, updated } = await reply(conversation, question, user);
  res.status(201).json({
    conversation: toPublicConversation(updated),
    question: toPublicMessage(question),
    reply: toPublicMessage(saved),
    usage: saved.status === 'ok' ? { ...usage, used: usage.used + 1, remaining: usage.remaining - 1 } : usage,
  });
});

/** Retry (61): answers the same question again in place of the failed reply. */
tutorRouter.post('/tutor/conversations/:id/messages/:messageId/retry', aiLimiter, async (req, res) => {
  const user = me(req);
  const conversation = await ownConversation(String(req.params.id), user.id);
  const failed = await prisma.tutorMessage.findFirst({
    where: { id: String(req.params.messageId), conversationId: conversation.id, role: 'assistant' },
  });
  const question = failed?.replyToId && (await prisma.tutorMessage.findUnique({ where: { id: failed.replyToId } }));
  if (!failed || !question) throw notFound('Message not found');
  const usage = await requireAllowance(user.id, user.plan);
  const { saved } = await reply(conversation, question, user, failed.id);
  res.json({
    reply: toPublicMessage(saved),
    usage: saved.status === 'ok' ? { ...usage, used: usage.used + 1, remaining: usage.remaining - 1 } : usage,
  });
});

// ─── Made from an answer (57, 58, 59, diagrams) ──────────────────────────────

async function ownAnswer(messageId: string, userId: string) {
  const m = await prisma.tutorMessage.findFirst({
    where: { id: messageId, role: 'assistant', status: 'ok', conversation: { userId } },
  });
  if (!m?.answer) throw notFound('Answer not found');
  return { message: m, answer: m.answer as TutorAnswer, extras: m.extras as Extras };
}

/** Flashcards from an answer (58). Made once with AI, then kept with the answer. */
tutorRouter.post('/tutor/messages/:id/flashcards', aiLimiter, async (req, res) => {
  const user = me(req);
  const { message, answer, extras } = await ownAnswer(String(req.params.id), user.id);
  if (extras.flashcards?.length) {
    res.json({ flashcards: extras.flashcards });
    return;
  }
  const flashcards = await answerFlashcards(user.id, answer, learningLanguageOf(user));
  await prisma.tutorMessage.update({ where: { id: message.id }, data: { extras: { ...extras, flashcards } } });
  res.json({ flashcards });
});

/** A quiz from an answer (59). Made once with AI, then kept with the answer. */
tutorRouter.post('/tutor/messages/:id/quiz', aiLimiter, async (req, res) => {
  const user = me(req);
  const { message, answer, extras } = await ownAnswer(String(req.params.id), user.id);
  if (extras.quiz?.length) {
    res.json({ quiz: extras.quiz });
    return;
  }
  const quiz = await answerQuiz(user.id, answer, learningLanguageOf(user));
  await prisma.tutorMessage.update({ where: { id: message.id }, data: { extras: { ...extras, quiz } } });
  res.json({ quiz });
});

export const DIAGRAM_CREDITS = 1;

/** A diagram for an answer (51). Images cost real money, so each new one uses an AI credit. */
tutorRouter.post('/tutor/messages/:id/diagram', aiLimiter, async (req, res) => {
  const user = me(req);
  const { message, answer, extras } = await ownAnswer(String(req.params.id), user.id);
  if (extras.imageToken) {
    res.json({ image: fileUrl(extras.imageToken), credits: user.aiCredits });
    return;
  }
  // Reserve the credit atomically so parallel taps can't overspend.
  const reserved = await prisma.user.updateMany({
    where: { id: user.id, aiCredits: { gte: DIAGRAM_CREDITS } },
    data: { aiCredits: { decrement: DIAGRAM_CREDITS } },
  });
  if (!reserved.count)
    throw new AppError(402, 'You are out of AI credits. Invite a friend or upgrade to Plus for more.', 'no-credits');
  const question = message.replyToId
    ? await prisma.tutorMessage.findUnique({ where: { id: message.replyToId }, select: { text: true } })
    : null;
  try {
    const jpeg = await answerDiagram(user.id, answer, question?.text || answer.summary);
    const file = await prisma.tutorFile.create({
      data: {
        userId: user.id,
        conversationId: message.conversationId,
        token: randomBytes(24).toString('base64url'),
        kind: 'diagram',
        mimeType: 'image/jpeg',
        data: new Uint8Array(jpeg),
      },
    });
    const [, updated] = await prisma.$transaction([
      prisma.tutorMessage.update({ where: { id: message.id }, data: { extras: { ...extras, imageToken: file.token } } }),
      prisma.user.update({
        where: { id: user.id },
        data: { creditEntries: { create: { credits: -DIAGRAM_CREDITS, reason: 'spend' } } },
        select: { aiCredits: true },
      }),
    ]);
    res.json({ image: fileUrl(file.token), credits: updated.aiCredits });
  } catch (err) {
    // A failed drawing gives the credit back.
    await prisma.user.update({ where: { id: user.id }, data: { aiCredits: { increment: DIAGRAM_CREDITS } } });
    throw err;
  }
});

/** Photos and diagrams, by their unguessable token (no sign-in, so <Image> tags can load them). */
tutorRouter.get('/tutor/files/:token', async (req, res) => {
  const file = await prisma.tutorFile.findUnique({ where: { token: String(req.params.token) } });
  if (!file) throw notFound('File not found');
  res
    .set({
      'Content-Type': file.mimeType,
      'Cache-Control': 'private, max-age=31536000, immutable',
      // The app runs on another origin (and in web views); let it show the image.
      'Cross-Origin-Resource-Policy': 'cross-origin',
    })
    .send(Buffer.from(file.data));
});

// ─── Notes and decks (57, 58) ─────────────────────────────────────────────────

const Block = z.discriminatedUnion('type', [
  z.object({ type: z.enum(['p', 'h', 'formula', 'tip', 'warning']), text: z.string().max(4000) }),
  z.object({ type: z.literal('list'), items: z.array(z.string().max(1000)).max(40) }),
]);
const NoteInput = z.object({
  title: z.string().trim().min(1).max(120),
  notebook: z.string().trim().min(1).max(60),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  summary: z.string().max(2000).default(''),
  body: z.array(Block).max(80).default([]),
  source: z.string().max(200).default(''),
});

const publicNote = (n: { createdAt: Date } & Record<string, unknown>) => ({ ...n, userId: undefined, createdAt: n.createdAt.getTime() });

tutorRouter.get('/tutor/notes', async (req, res) => {
  const [notes, decks] = await Promise.all([
    prisma.tutorNote.findMany({ where: { userId: me(req).id }, orderBy: { createdAt: 'desc' } }),
    prisma.tutorDeck.findMany({ where: { userId: me(req).id }, orderBy: { createdAt: 'desc' } }),
  ]);
  res.json({ notes: notes.map(publicNote), decks: decks.map(publicNote) });
});

tutorRouter.post('/tutor/notes', async (req, res) => {
  const note = await prisma.tutorNote.create({ data: { userId: me(req).id, ...NoteInput.parse(req.body) } });
  res.status(201).json({ note: publicNote(note) });
});

tutorRouter.delete('/tutor/notes/:id', async (req, res) => {
  await prisma.tutorNote.deleteMany({ where: { id: String(req.params.id), userId: me(req).id } });
  res.json({ ok: true });
});

const DeckInput = z.object({
  name: z.string().trim().min(1).max(80),
  subject: z.string().trim().max(60).default('General'),
  cards: z
    .array(z.object({ front: z.string().trim().min(1).max(500), back: z.string().trim().min(1).max(1000) }))
    .min(1)
    .max(100),
});

tutorRouter.post('/tutor/decks', async (req, res) => {
  const deck = await prisma.tutorDeck.create({ data: { userId: me(req).id, ...DeckInput.parse(req.body) } });
  res.status(201).json({ deck: publicNote(deck) });
});
