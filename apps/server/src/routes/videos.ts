import { randomBytes } from 'node:crypto';

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

import { prisma } from '../db.js';
import { Prisma, type Video } from '../generated/prisma/client.js';
import { AppError, notFound } from '../lib/errors.js';
import { catalogFor } from '../services/catalog.js';
import { requestLanguage } from '../services/language.js';
import { LANGUAGES, type LanguageId } from '../services/personalization.js';
import { me, optionalAuth, requireAuth } from '../services/sessions.js';
import {
  hasNarration,
  illustrate,
  LENGTHS,
  mapLimit,
  narrate,
  secondsFor,
  writeScript,
  type Scene,
  type VideoSettings,
} from '../services/video-ai.js';

export const videosRouter = Router();

/** Regenerating (new voice or length) costs 1 credit; a new video costs its length's credits. */
export const REGENERATE_CREDITS = 1;
/** A video still "generating" this long after its last update was interrupted (e.g. a server restart). */
const STALE_MS = 15 * 60_000;
const BUILT_IN_COLLECTIONS = ['Watch later', 'Exam revision'];

// AI calls cost money: a per-minute cap on top of credits.
const aiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 6,
  keyGenerator: (req) => req.userId ?? 'anon',
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'Slow down a little — try again in a minute.', reason: 'rate-limited' },
});

const fileUrl = (token: string) => `/videos/files/${token}`;
const newToken = () => randomBytes(24).toString('base64url');

// ─── Shapes the app reads ─────────────────────────────────────────────────────

/**
 * Originals are shown as `v-<lessonId>` whatever their language, so likes, saves and progress
 * follow the lesson when the learner switches language.
 */
const publicId = (v: Pick<Video, 'id' | 'origin' | 'lessonId'>) => (v.origin === 'catalog' ? `v-${v.lessonId}` : v.id);

function toPublicVideo(v: Video, likes = 0) {
  return {
    id: publicId(v),
    title: v.title,
    subject: v.subject,
    level: v.level,
    description: v.description,
    creator: v.origin === 'catalog' ? 'Knowzone Originals' : 'You',
    scenes: v.scenes as Scene[],
    settings: v.settings as VideoSettings,
    origin: v.origin,
    ...(v.lessonId && { lessonId: v.lessonId }),
    ...(v.source && { source: v.source }),
    views: v.views,
    likes: v.baseLikes + likes,
    createdAt: v.createdAt.getTime(),
    ...(v.origin === 'generated' && {
      status: v.status,
      stage: v.stage,
      revision: v.revision,
      ...(v.error && { error: v.error }),
      updatedAt: v.updatedAt.getTime(),
    }),
  };
}

const likesFor = async (ids: string[]) =>
  new Map(
    (
      await prisma.videoUserState.groupBy({ by: ['videoId'], where: { videoId: { in: ids }, liked: true }, _count: true })
    ).map((g) => [g.videoId, g._count]),
  );

// ─── Making a video ───────────────────────────────────────────────────────────

type ErrorCode = 'render-timeout' | 'lesson-missing' | 'material-missing' | 'not-configured';

async function fail(id: string, code: ErrorCode, retryable: boolean) {
  await prisma.$transaction(async (tx) => {
    const v = await tx.video.findUnique({ where: { id }, select: { creditsHeld: true, userId: true } });
    if (!v) return;
    await tx.video.update({ where: { id }, data: { status: 'failed', error: { code, retryable }, creditsHeld: 0 } });
    if (v.creditsHeld && v.userId)
      await tx.user.update({ where: { id: v.userId }, data: { aiCredits: { increment: v.creditsHeld } } });
  });
}

async function failIfStale(v: Video): Promise<Video> {
  if (v.status !== 'generating' || Date.now() - v.updatedAt.getTime() < STALE_MS) return v;
  await fail(v.id, 'render-timeout', true);
  return prisma.video.findUniqueOrThrow({ where: { id: v.id } });
}

class SourceMissing extends Error {
  constructor(public code: 'lesson-missing' | 'material-missing') {
    super(code);
  }
}

type Source =
  | { kind: 'topic'; topic: string }
  | { kind: 'material'; materialId: string; label: string }
  | { kind: 'lesson'; lessonId: string; label: string }
  | { kind: 'text'; text: string; label: string };

/** What the script is written from. */
async function sourceText(userId: string | null, source: Source, language: LanguageId) {
  if (source.kind === 'topic') return { topic: source.topic };
  if (source.kind === 'text') return { text: source.text };
  if (source.kind === 'lesson') {
    const lesson = (await catalogFor(language)).lessons.find((l) => l.id === source.lessonId);
    if (!lesson) throw new SourceMissing('lesson-missing');
    return { text: `${lesson.title}\n${lesson.summary}\n${lesson.keyPoints.map((k) => `- ${k}`).join('\n')}` };
  }
  const m = userId
    ? await prisma.material.findFirst({ where: { id: source.materialId, userId, status: 'READY' } })
    : null;
  if (!m) throw new SourceMissing('material-missing');
  const c = m.content as { summary?: { tldr: string; overview: string[] }; keyPoints?: { text: string }[] } | null;
  const notes = c?.summary ? [c.summary.tldr, ...c.summary.overview, ...(c.keyPoints ?? []).map((p) => `- ${p.text}`)].join('\n') : '';
  return { text: m.sourceText || notes };
}

/** Records narration for scenes (all, or just `only`) and stores each MP3; returns the timed scenes. */
export async function recordScenes(
  videoId: string,
  userId: string,
  scenes: Scene[],
  settings: VideoSettings,
  only?: Set<string>,
) {
  if (!hasNarration(settings.voiceId)) return scenes.map((s) => ({ ...s, audio: undefined, seconds: secondsFor(s.caption) }));
  return mapLimit(scenes, 4, async (s) => {
    if (only && !only.has(s.id)) return s;
    const { mp3, seconds } = await narrate(userId, s.caption, settings.voiceId, settings.language);
    const token = newToken();
    await prisma.videoFile.create({ data: { videoId, token, kind: 'audio', mimeType: 'audio/mpeg', data: new Uint8Array(mp3) } });
    // A short pause after each scene's narration.
    return { ...s, audio: fileUrl(token), seconds: Math.max(3, Math.round((seconds + 0.6) * 10) / 10) };
  });
}

/** Draws pictures for the scenes that describe one (up to the length's limit) and stores them. */
export async function drawScenes(videoId: string, userId: string, scenes: Scene[], settings: VideoSettings) {
  const wanted = scenes.filter((s) => s.illustration && s.kind !== 'check').slice(0, LENGTHS[settings.length].images);
  const drawn = new Map<string, string>();
  await mapLimit(wanted, 3, async (s) => {
    try {
      const jpeg = await illustrate(userId, s.illustration!, settings.styleId);
      const token = newToken();
      await prisma.videoFile.create({ data: { videoId, token, kind: 'image', mimeType: 'image/jpeg', data: new Uint8Array(jpeg) } });
      drawn.set(s.id, fileUrl(token));
    } catch (e) {
      // A missing picture isn't worth failing the video: the scene shows its emoji instead.
      console.warn('Scene picture failed', videoId, (e as Error).message);
    }
  });
  return scenes.map((s) => (drawn.has(s.id) ? { ...s, image: drawn.get(s.id) } : s));
}

/** Files no scene points to any more (after a regeneration or edit) are deleted. */
async function dropUnusedFiles(videoId: string, scenes: Scene[]) {
  const used = new Set(scenes.flatMap((s) => [s.audio, s.image]).filter(Boolean).map((u) => u!.split('/').pop()!));
  await prisma.videoFile.deleteMany({ where: { videoId, token: { notIn: [...used] } } });
}

/**
 * Makes (or remakes) a video: script (0), pictures (1), narration (2), captions (3), finishing (4).
 * `voiceOnly` re-records the narration of the existing script. Runs after the request returns.
 */
export async function processVideo(id: string, opts: { voiceOnly?: boolean } = {}) {
  const v = await prisma.video.findUnique({ where: { id } });
  if (!v?.userId) return;
  const userId = v.userId;
  const settings = v.settings as VideoSettings;
  const stage = (n: number) => prisma.video.update({ where: { id }, data: { stage: n } });
  try {
    let scenes = v.scenes as Scene[];
    let meta: Partial<Pick<Video, 'subject' | 'level' | 'description'>> = {};
    if (!opts.voiceOnly || !scenes.length) {
      await stage(0);
      const script = await writeScript(userId, await sourceText(userId, v.source as Source, settings.language), settings);
      meta = { subject: script.subject, level: script.level, description: script.description };
      await stage(1);
      scenes = await drawScenes(id, userId, script.scenes, settings);
    }
    await stage(2);
    scenes = await recordScenes(id, userId, scenes, settings);
    await stage(3);
    await stage(4);

    await prisma.$transaction(async (tx) => {
      const cur = await tx.video.findUnique({ where: { id } });
      if (!cur) return;
      await tx.video.update({
        where: { id },
        data: { ...meta, scenes, status: 'ready', stage: 4, error: Prisma.DbNull, creditsHeld: 0 },
      });
      if (cur.creditsHeld) await tx.creditEntry.create({ data: { userId, credits: -cur.creditsHeld, reason: 'spend' } });
    });
    await dropUnusedFiles(id, scenes);
  } catch (err) {
    if (err instanceof SourceMissing) return fail(id, err.code, false);
    if (err instanceof AppError && err.reason === 'not-configured') return fail(id, 'not-configured', true);
    console.error('Video failed', id, err);
    return fail(id, 'render-timeout', true);
  }
}

const startProcessing = (id: string, opts?: { voiceOnly?: boolean }) => {
  processVideo(id, opts).catch((e) => console.error('Video crashed', id, e));
};

async function holdCredits(userId: string, credits: number) {
  const held = await prisma.user.updateMany({
    where: { id: userId, aiCredits: { gte: credits } },
    data: { aiCredits: { decrement: credits } },
  });
  if (!held.count)
    throw new AppError(402, 'You are out of AI credits. Invite a friend or upgrade to Plus for more.', 'no-credits');
}

// ─── Knowzone Originals feed (88–94) ──────────────────────────────────────────

/** The Originals in the reader's language; lessons without that language yet fall back to English. */
videosRouter.get('/videos/originals', optionalAuth, async (req, res) => {
  const lang = requestLanguage(req);
  const all = await prisma.video.findMany({
    where: { origin: 'catalog', status: 'ready', language: { in: [lang, 'en'] } },
    orderBy: { createdAt: 'desc' },
  });
  const byLesson = new Map<string, Video>();
  for (const v of all) if (!byLesson.has(v.lessonId!) || v.language === lang) byLesson.set(v.lessonId!, v);
  const videos = [...byLesson.values()];
  const likes = await likesFor(videos.map(publicId));
  res.json({ videos: videos.map((v) => toPublicVideo(v, likes.get(publicId(v)))) });
});

// ─── The learner's own videos (98–109) ────────────────────────────────────────

videosRouter.use(['/videos/mine', '/videos/mine/*rest', '/me/videos', '/me/video-collections'], requireAuth);

const VideoId = z.string().regex(/^[A-Za-z0-9_-]{6,40}$/, 'Invalid id');
const LanguageIdSchema = z.enum(Object.keys(LANGUAGES) as [LanguageId, ...LanguageId[]]);
const Settings = z.object({
  length: z.enum(['30s', '1m', '3m', '5m']),
  voiceId: z.enum(['ada', 'tunde', 'grace', 'sam', 'kemi', 'none']),
  styleId: z.enum(['galaxy', 'chalk', 'paper', 'blueprint', 'sunset']),
  captions: z.boolean(),
  captionStyle: z.enum(['classic', 'karaoke', 'bold']),
  language: LanguageIdSchema,
});
const SourceSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('topic'), topic: z.string().trim().min(2).max(200) }),
  z.object({ kind: z.literal('material'), materialId: z.string().max(40), label: z.string().max(120) }),
  z.object({ kind: z.literal('lesson'), lessonId: z.string().max(40), label: z.string().max(120) }),
  z.object({ kind: z.literal('text'), text: z.string().trim().min(100).max(100_000), label: z.string().max(120) }),
]);
const Create = z.object({ title: z.string().trim().min(1).max(120), source: SourceSchema, settings: Settings });

async function ownVideo(id: string, userId: string) {
  const v = await prisma.video.findFirst({ where: { id, userId, origin: 'generated' } });
  if (!v) throw notFound('Video not found');
  return failIfStale(v);
}

const Since = z.object({ since: z.coerce.number().int().nonnegative().optional() });

/** Generated video library (107), synced like study packs: changed videos in full, plus every id. */
videosRouter.get('/videos/mine', async (req, res) => {
  const userId = me(req).id;
  const { since } = Since.parse(req.query);
  const serverTime = Date.now();
  const [changed, all] = await Promise.all([
    prisma.video.findMany({
      where: { userId, origin: 'generated', ...(since && { updatedAt: { gt: new Date(since - 1000) } }) },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.video.findMany({ where: { userId, origin: 'generated' }, select: { id: true }, orderBy: { createdAt: 'desc' } }),
  ]);
  const fresh = await Promise.all(changed.map(failIfStale));
  res.json({ videos: fresh.map((v) => toPublicVideo(v)), ids: all.map((v) => v.id), serverTime });
});

/** Generate a new video (98–104). Answers 202 at once; poll GET /videos/:id for progress. */
videosRouter.post('/videos/mine/:id', aiLimiter, async (req, res) => {
  const user = me(req);
  const id = VideoId.parse(req.params.id);
  const input = Create.parse(req.body);
  if (await prisma.video.findUnique({ where: { id }, select: { id: true } }))
    throw new AppError(409, 'This video already exists', 'exists');
  const credits = LENGTHS[input.settings.length].credits;
  await holdCredits(user.id, credits);
  const video = await prisma.video.create({
    data: {
      id,
      userId: user.id,
      origin: 'generated',
      language: input.settings.language,
      title: input.title,
      settings: input.settings,
      source: input.source,
      creditsHeld: credits,
    },
  });
  startProcessing(id);
  res.status(202).json({ video: toPublicVideo(video) });
});

/** Try a failed video again (109). Holds its credits again; returned if it fails. */
videosRouter.post('/videos/mine/:id/retry', aiLimiter, async (req, res) => {
  const user = me(req);
  const v = await ownVideo(String(req.params.id), user.id);
  if (v.status !== 'failed' || !(v.error as { retryable?: boolean } | null)?.retryable)
    throw new AppError(409, 'This video can’t be retried', 'not-retryable');
  const credits = v.revision > 1 ? REGENERATE_CREDITS : LENGTHS[(v.settings as VideoSettings).length].credits;
  await holdCredits(user.id, credits);
  const updated = await prisma.video.update({
    where: { id: v.id },
    data: { status: 'generating', stage: 0, error: Prisma.DbNull, creditsHeld: credits },
  });
  startProcessing(v.id);
  res.status(202).json({ video: toPublicVideo(updated) });
});

/**
 * Regenerate with new settings (106), for 1 credit. A new voice re-records the narration only;
 * a new length or language writes a new script too.
 */
videosRouter.post('/videos/mine/:id/regenerate', aiLimiter, async (req, res) => {
  const user = me(req);
  const v = await ownVideo(String(req.params.id), user.id);
  if (v.status === 'generating') throw new AppError(409, 'This video is still being made', 'busy');
  const settings = Settings.parse(req.body.settings);
  const prev = v.settings as VideoSettings;
  const voiceOnly = v.status === 'ready' && settings.length === prev.length && settings.language === prev.language;
  await holdCredits(user.id, REGENERATE_CREDITS);
  const updated = await prisma.video.update({
    where: { id: v.id },
    data: {
      settings,
      language: settings.language,
      status: 'generating',
      stage: voiceOnly ? 2 : 0,
      error: Prisma.DbNull,
      revision: { increment: 1 },
      creditsHeld: REGENERATE_CREDITS,
    },
  });
  startProcessing(v.id, { voiceOnly });
  res.status(202).json({ video: toPublicVideo(updated) });
});

const SceneEdit = z.object({
  id: z.string().max(40),
  heading: z.string().trim().min(1).max(120),
  caption: z.string().trim().min(1).max(600),
  body: z.string().max(400).optional(),
  bullets: z.array(z.string().max(200)).max(6).optional(),
});
const Edit = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  scenes: z.array(SceneEdit).optional(),
  settings: Settings.pick({ styleId: true, captions: true, captionStyle: true }).partial().optional(),
});

/**
 * Instant adjustments (106): title, style, captions and script text. Edited narration lines are
 * re-recorded (only those), at no cost.
 */
videosRouter.patch('/videos/mine/:id', aiLimiter, async (req, res) => {
  const user = me(req);
  const v = await ownVideo(String(req.params.id), user.id);
  if (v.status !== 'ready') throw new AppError(409, 'The video isn’t ready yet', 'busy');
  const edit = Edit.parse(req.body);
  const settings = { ...(v.settings as VideoSettings), ...edit.settings };
  let scenes = v.scenes as Scene[];
  if (edit.scenes) {
    const byId = new Map(edit.scenes.map((s) => [s.id, s]));
    const changed = new Set(scenes.filter((s) => byId.get(s.id) && byId.get(s.id)!.caption !== s.caption).map((s) => s.id));
    scenes = scenes.map((s) => {
      const e = byId.get(s.id);
      return e
        ? { ...s, heading: e.heading, caption: e.caption, ...(e.body !== undefined && { body: e.body }), ...(e.bullets && { bullets: e.bullets }) }
        : s;
    });
    if (changed.size) scenes = await recordScenes(v.id, user.id, scenes, settings, changed);
  }
  const updated = await prisma.video.update({
    where: { id: v.id },
    data: { ...(edit.title && { title: edit.title }), settings, scenes, revision: { increment: 1 } },
  });
  await dropUnusedFiles(v.id, scenes);
  res.json({ video: toPublicVideo(updated) });
});

videosRouter.delete('/videos/mine/:id', async (req, res) => {
  const v = await prisma.video.findFirst({ where: { id: String(req.params.id), userId: me(req).id, origin: 'generated' } });
  if (v) {
    await prisma.$transaction(async (tx) => {
      // Deleted while being made: the held credits go back.
      if (v.creditsHeld && v.userId)
        await tx.user.update({ where: { id: v.userId }, data: { aiCredits: { increment: v.creditsHeld } } });
      await tx.video.delete({ where: { id: v.id } });
    });
  }
  res.json({ ok: true });
});

// ─── Likes, saves, progress, reports (95–97) ──────────────────────────────────

/** The learner's likes, saved videos (by collection), offline picks and watch progress. */
videosRouter.get('/me/videos', async (req, res) => {
  const user = me(req);
  const states = await prisma.videoUserState.findMany({ where: { userId: user.id } });
  res.json({
    liked: states.filter((s) => s.liked).map((s) => s.videoId),
    saved: Object.fromEntries(states.filter((s) => s.collection).map((s) => [s.videoId, s.collection!])),
    collections: [...new Set([...BUILT_IN_COLLECTIONS, ...user.videoCollections])],
    offline: states.filter((s) => s.offline).map((s) => s.videoId),
    progress: Object.fromEntries(states.filter((s) => s.progress > 0).map((s) => [s.videoId, s.progress])),
  });
});

const AnyVideoId = z.string().regex(/^[A-Za-z0-9_-]{2,60}$/, 'Invalid id');
const upsertState = (userId: string, videoId: string, data: Prisma.VideoUserStateUpdateInput & Record<string, unknown>) =>
  prisma.videoUserState.upsert({
    where: { userId_videoId: { userId, videoId } },
    create: { userId, videoId, ...(data as object) },
    update: data,
  });

videosRouter.post('/me/videos/:id/like', async (req, res) => {
  const { liked } = z.object({ liked: z.boolean() }).parse(req.body);
  await upsertState(me(req).id, AnyVideoId.parse(req.params.id), { liked });
  res.json({ liked });
});

const SaveInput = z.object({ collection: z.string().trim().min(1).max(60), offline: z.boolean().default(false) });

videosRouter.put('/me/videos/:id/save', async (req, res) => {
  const user = me(req);
  const { collection, offline } = SaveInput.parse(req.body);
  await upsertState(user.id, AnyVideoId.parse(req.params.id), { collection, offline });
  if (!BUILT_IN_COLLECTIONS.includes(collection) && !user.videoCollections.includes(collection))
    await prisma.user.update({ where: { id: user.id }, data: { videoCollections: { push: collection } } });
  res.json({ saved: true });
});

videosRouter.delete('/me/videos/:id/save', async (req, res) => {
  await prisma.videoUserState.updateMany({
    where: { userId: me(req).id, videoId: AnyVideoId.parse(req.params.id) },
    data: { collection: null, offline: false },
  });
  res.json({ saved: false });
});

videosRouter.post('/me/video-collections', async (req, res) => {
  const user = me(req);
  const { name } = z.object({ name: z.string().trim().min(1).max(60) }).parse(req.body);
  if (!BUILT_IN_COLLECTIONS.includes(name) && !user.videoCollections.includes(name)) {
    if (user.videoCollections.length >= 50) throw new AppError(400, 'You have too many collections', 'too-many');
    await prisma.user.update({ where: { id: user.id }, data: { videoCollections: { push: name } } });
  }
  res.json({ ok: true });
});

/** Watch progress (resume where you left off). The first watch of an Original counts as a view. */
videosRouter.put('/me/videos/:id/progress', async (req, res) => {
  const userId = me(req).id;
  const videoId = AnyVideoId.parse(req.params.id);
  const { seconds } = z.object({ seconds: z.number().min(0).max(24 * 3600) }).parse(req.body);
  const prev = await prisma.videoUserState.findUnique({ where: { userId_videoId: { userId, videoId } } });
  await upsertState(userId, videoId, { progress: seconds, viewed: true });
  if (!prev?.viewed)
    await prisma.video.updateMany({
      // An Original counts the view on every language version of its lesson.
      where: videoId.startsWith('v-') ? { origin: 'catalog', lessonId: videoId.slice(2) } : { id: videoId },
      data: { views: { increment: 1 } },
    });
  res.json({ ok: true });
});

const Report = z.object({ reason: z.string().trim().min(1).max(60), details: z.string().trim().max(1000).default('') });

/** Report a video (97). Kept for moderation; the learner can hide it in the app. */
videosRouter.post('/me/videos/:id/report', async (req, res) => {
  const { reason, details } = Report.parse(req.body);
  const report = await prisma.videoReport.create({
    data: { userId: me(req).id, videoId: AnyVideoId.parse(req.params.id), reason, details },
  });
  res.status(201).json({ id: report.id });
});

// ─── One video, and its files ─────────────────────────────────────────────────

/** Narration and pictures, by their unguessable token (no sign-in, so players and <Image> can load them). */
videosRouter.get('/videos/files/:token', async (req, res) => {
  const file = await prisma.videoFile.findUnique({ where: { token: String(req.params.token) } });
  if (!file) throw notFound('File not found');
  const data = Buffer.from(file.data);
  res.set({
    'Content-Type': file.mimeType,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Accept-Ranges': 'bytes',
  });
  // Audio players on phones ask for byte ranges.
  const range = req.get('range')?.match(/^bytes=(\d*)-(\d*)$/);
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = Math.min(range[2] ? Number(range[2]) : data.length - 1, data.length - 1);
    if (start > end || start >= data.length) {
      res.status(416).set('Content-Range', `bytes */${data.length}`).end();
      return;
    }
    res.status(206).set('Content-Range', `bytes ${start}-${end}/${data.length}`).send(data.subarray(start, end + 1));
    return;
  }
  res.send(data);
});

/** An Original (v-<lessonId>, in the reader's language or English) or the learner's own video. */
videosRouter.get('/videos/:id', optionalAuth, async (req, res) => {
  const id = String(req.params.id);
  let v: Video | null;
  if (id.startsWith('v-')) {
    const lang = requestLanguage(req);
    const versions = await prisma.video.findMany({
      where: { origin: 'catalog', lessonId: id.slice(2), status: 'ready', language: { in: [lang, 'en'] } },
    });
    v = versions.find((x) => x.language === lang) ?? versions[0] ?? null;
  } else v = await prisma.video.findUnique({ where: { id } });
  if (!v || (v.origin === 'generated' && v.userId !== req.user?.id)) throw notFound('Video not found');
  const fresh = await failIfStale(v);
  const likes = await likesFor([publicId(v)]);
  res.json({ video: toPublicVideo(fresh, likes.get(publicId(v))) });
});
