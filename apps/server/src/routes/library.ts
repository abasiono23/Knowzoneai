import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../db.js';
import type { User } from '../generated/prisma/client.js';
import { notFound } from '../lib/errors.js';
import { catalogFor, recommend, trendingIn } from '../services/catalog.js';
import { requestLanguage } from '../services/language.js';
import { toPublicNotification } from '../services/notifications.js';
import { confirmReferralIfEligible } from '../services/referrals.js';
import { me, requireAuth } from '../services/sessions.js';

export const libraryRouter = Router();

const RECENT_LIMIT = 30;
const SEARCH_HISTORY = 8;

/** Saved, recently viewed, progress and recent searches: what the app's library store holds. */
async function libraryOf(userId: string) {
  const [progress, saved, searches] = await Promise.all([
    prisma.lessonProgress.findMany({ where: { userId }, orderBy: { lastViewedAt: 'desc' }, take: 200 }),
    prisma.savedItem.findMany({ where: { userId, kind: 'lesson' }, orderBy: { createdAt: 'desc' } }),
    prisma.searchQuery.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: SEARCH_HISTORY }),
  ]);
  return {
    saved: saved.map((s) => s.itemId),
    recent: progress.slice(0, RECENT_LIMIT).map((p) => ({ id: p.lessonId, at: p.lastViewedAt.getTime() })),
    progress: Object.fromEntries(progress.filter((p) => p.progress > 0).map((p) => [p.lessonId, p.progress])),
    searches: searches.map((s) => s.query),
  };
}

libraryRouter.get('/me/library', requireAuth, async (req, res) => {
  res.json(await libraryOf(me(req).id));
});

async function requireLesson(id: string) {
  const lesson = await prisma.lesson.findUnique({ where: { id }, select: { id: true, published: true } });
  if (!lesson?.published) throw notFound('Lesson not found');
}

/** Opening a lesson (42 Recently viewed). The first view by a learner counts towards popularity. */
libraryRouter.post('/me/lessons/:id/view', requireAuth, async (req, res) => {
  const userId = me(req).id;
  const lessonId = String(req.params.id);
  await requireLesson(lessonId);
  const existing = await prisma.lessonProgress.findUnique({ where: { userId_lessonId: { userId, lessonId } } });
  if (existing) {
    await prisma.lessonProgress.update({ where: { userId_lessonId: { userId, lessonId } }, data: { lastViewedAt: new Date() } });
  } else {
    await prisma.$transaction([
      prisma.lessonProgress.create({ data: { userId, lessonId } }),
      prisma.lesson.update({ where: { id: lessonId }, data: { views: { increment: 1 } } }),
    ]);
  }
  res.json({ ok: true });
});

const Progress = z.object({ progress: z.number().min(0).max(1) });

/** How far through a lesson the learner is (41 Continue learning). Progress never goes backwards. */
libraryRouter.put('/me/lessons/:id/progress', requireAuth, async (req, res) => {
  const userId = me(req).id;
  const lessonId = String(req.params.id);
  const { progress } = Progress.parse(req.body);
  await requireLesson(lessonId);
  const existing = await prisma.lessonProgress.findUnique({ where: { userId_lessonId: { userId, lessonId } } });
  const value = Math.max(progress, existing?.progress ?? 0);
  const finished = value >= 1 && !existing?.completedAt;
  const now = new Date();
  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId, progress: value, lastViewedAt: now, completedAt: value >= 1 ? now : null },
    update: { progress: value, lastViewedAt: now, ...(finished && { completedAt: now }) },
  });
  // A first finished lesson is what qualifies a pending invite.
  if (finished) await confirmReferralIfEligible(userId);
  res.json({ progress: value, completed: value >= 1 });
});

/** Saving works for lessons today; `kind` leaves room for courses and study packs later. */
libraryRouter.put('/me/saved/:id', requireAuth, async (req, res) => {
  const userId = me(req).id;
  const itemId = String(req.params.id);
  await requireLesson(itemId);
  await prisma.savedItem.upsert({
    where: { userId_kind_itemId: { userId, kind: 'lesson', itemId } },
    create: { userId, kind: 'lesson', itemId },
    update: {},
  });
  res.json({ saved: true });
});

libraryRouter.delete('/me/saved/:id', requireAuth, async (req, res) => {
  await prisma.savedItem.deleteMany({ where: { userId: me(req).id, kind: 'lesson', itemId: String(req.params.id) } });
  res.json({ saved: false });
});

const Query = z.object({ query: z.string().trim().min(1).max(100) });

/** Recent searches (35). A repeated query moves to the top instead of appearing twice. */
libraryRouter.post('/me/searches', requireAuth, async (req, res) => {
  const userId = me(req).id;
  const { query } = Query.parse(req.body);
  await prisma.$transaction([
    prisma.searchQuery.deleteMany({ where: { userId, query: { equals: query, mode: 'insensitive' } } }),
    prisma.searchQuery.create({ data: { userId, query } }),
  ]);
  const keep = await prisma.searchQuery.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: SEARCH_HISTORY,
    select: { id: true, query: true },
  });
  await prisma.searchQuery.deleteMany({ where: { userId, id: { notIn: keep.map((k) => k.id) } } });
  res.json({ searches: keep.map((k) => k.query) });
});

libraryRouter.delete('/me/searches', requireAuth, async (req, res) => {
  await prisma.searchQuery.deleteMany({ where: { userId: me(req).id } });
  res.json({ searches: [] });
});

// ─── Recommendations and Home ────────────────────────────────────────────────

const progressMap = async (userId: string) =>
  new Map(
    (await prisma.lessonProgress.findMany({ where: { userId }, select: { lessonId: true, progress: true } })).map(
      (p) => [p.lessonId, p.progress],
    ),
  );

const profileOf = (user: User) => user.personalization as Parameters<typeof recommend>[1];

const Limit = z.object({ limit: z.coerce.number().int().min(1).max(50).default(12) });

/** Recommended learning (40), with the reason for each pick. */
libraryRouter.get('/me/recommendations', requireAuth, async (req, res) => {
  const user = me(req);
  const { limit } = Limit.parse(req.query);
  res.json({ items: await recommend(requestLanguage(req), profileOf(user), await progressMap(user.id), limit) });
});

/**
 * Everything the Home dashboard (33) shows in one request: continue learning, recommendations,
 * trending, saved count and unread notifications. Lessons are in the reader's language.
 */
libraryRouter.get('/me/home', requireAuth, async (req, res) => {
  const user = me(req);
  const lang = requestLanguage(req);
  const [catalog, library, progress, unread, latest] = await Promise.all([
    catalogFor(lang),
    libraryOf(user.id),
    progressMap(user.id),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 3 }),
  ]);
  const lessons = new Map(catalog.lessons.map((l) => [l.id, l]));
  res.json({
    continueLearning: library.recent
      .filter((r) => (library.progress[r.id] ?? 0) > 0 && library.progress[r.id] < 1 && lessons.has(r.id))
      .slice(0, 10)
      .map((r) => ({ lesson: lessons.get(r.id)!, progress: library.progress[r.id], at: r.at })),
    recommended: await recommend(lang, profileOf(user), progress, 8),
    trending: trendingIn(catalog, undefined, 8),
    savedCount: library.saved.length,
    notifications: { unread, latest: latest.map(toPublicNotification) },
  });
});
