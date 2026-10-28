import { createReadStream, existsSync } from 'node:fs';
import { join } from 'node:path';

import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../db.js';
import { AppError, notFound } from '../lib/errors.js';
import { settingsOf } from '../services/account.js';
import { openaiClient } from '../services/ai.js';
import { restrictionOf } from '../services/help.js';
import { requestLanguage } from '../services/language.js';
import { allReels, cardText, feedOrder, reelById, reelsFolder } from '../services/reels.js';
import { me, optionalAuth, requireAuth } from '../services/sessions.js';
import type { User } from '../generated/prisma/client.js';

/**
 * "Did you know?" reels (the dashboard's Flashcards): a feed like short videos, where each reel is
 * one fun fact explained in 5 cards. Learners like reels and comment on them; comments are screened
 * by OpenAI moderation before they appear and hidden once several people report them.
 */
export const reelsRouter = Router();

const REPORTS_TO_HIDE = 3;
const COMMENTS_PER_HOUR = 10;

/** "Tobi A." when the learner shows their profile to everyone; otherwise no name. */
function author(u: Pick<User, 'name' | 'photo' | 'settings'>) {
  if (settingsOf(u as User).privacy.profileVisibility !== 'everyone') return { name: null };
  const [first, last] = u.name.trim().split(/\s+/);
  const photo = u.photo as { kind?: string; uri?: string } | null;
  return { name: `${first}${last ? ` ${last[0]}.` : ''}`, ...(photo?.kind === 'photo' && photo.uri && { photo: photo.uri }) };
}

/** The feed: every reel in the learner's language, with likes and comment counts. */
reelsRouter.get('/reels', optionalAuth, async (req, res) => {
  const lang = requestLanguage(req);
  const subject = typeof req.query.subject === 'string' ? req.query.subject : null;
  const list = feedOrder(
    allReels().filter((r) => !subject || r.subject === subject),
    req.user?.id ?? 'guest',
  );
  const ids = list.map((r) => r.id);
  const [likes, comments, mine] = await Promise.all([
    prisma.reelLike.groupBy({ by: ['reelId'], where: { reelId: { in: ids } }, _count: { _all: true } }),
    prisma.reelComment.groupBy({ by: ['reelId'], where: { reelId: { in: ids }, hidden: false }, _count: { _all: true } }),
    req.user ? prisma.reelLike.findMany({ where: { userId: req.user.id, reelId: { in: ids } }, select: { reelId: true } }) : [],
  ]);
  const count = (rows: { reelId: string; _count: { _all: number } }[], id: string) => rows.find((x) => x.reelId === id)?._count._all ?? 0;
  res.json({
    reels: list.map((r) => ({
      id: r.id,
      subject: r.subject,
      cards: r.cards.map((c, k) => ({
        text: cardText(c.text, lang),
        image: `/reels/media/${r.id}-${k + 1}.webp`,
        ...(c.seconds && { audio: `/reels/media/${r.id}-${k + 1}.mp3`, seconds: c.seconds }),
      })),
      likes: count(likes, r.id),
      comments: count(comments, r.id),
      liked: mine.some((m) => m.reelId === r.id),
    })),
  });
});

/** A card's picture or narration. */
reelsRouter.get('/reels/media/:file', (req, res) => {
  const file = String(req.params.file);
  const m = file.match(/^([a-z0-9-]+)-(\d)\.(webp|mp3)$/);
  const dir = reelsFolder();
  if (!m || !dir) throw notFound('Not found');
  const path = join(dir, m[3] === 'webp' ? 'img' : 'audio', file);
  if (!existsSync(path)) throw notFound('Not found');
  res.set({
    'Content-Type': m[3] === 'webp' ? 'image/webp' : 'audio/mpeg',
    'Cache-Control': 'public, max-age=604800, immutable',
    // The app on the web loads these from another origin.
    'Cross-Origin-Resource-Policy': 'cross-origin',
  });
  createReadStream(path).pipe(res);
});

/** Comments on a reel, newest first, without hidden ones or people the learner blocked. */
reelsRouter.get('/reels/:id/comments', optionalAuth, async (req, res) => {
  const reel = reelById(String(req.params.id));
  if (!reel) throw notFound('Reel not found');
  const blocked = req.user ? (await prisma.blockedUser.findMany({ where: { userId: req.user.id }, select: { blockedId: true } })).map((b) => b.blockedId) : [];
  const rows = await prisma.reelComment.findMany({
    where: { reelId: reel.id, hidden: false, userId: { notIn: blocked } },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { user: { select: { name: true, photo: true, settings: true } } },
  });
  res.json({
    comments: rows.map((c) => ({
      id: c.id,
      text: c.text,
      createdAt: c.createdAt.getTime(),
      mine: c.userId === req.user?.id,
      ...author(c.user),
    })),
  });
});

reelsRouter.use(['/me/reels', '/me/reels/*rest'], requireAuth);

reelsRouter.post('/me/reels/:id/like', async (req, res) => {
  const user = me(req);
  const reel = reelById(String(req.params.id));
  if (!reel) throw notFound('Reel not found');
  const { liked } = z.object({ liked: z.boolean() }).parse(req.body);
  if (liked)
    await prisma.reelLike.upsert({ where: { userId_reelId: { userId: user.id, reelId: reel.id } }, create: { userId: user.id, reelId: reel.id }, update: {} });
  else await prisma.reelLike.deleteMany({ where: { userId: user.id, reelId: reel.id } });
  res.json({ liked, likes: await prisma.reelLike.count({ where: { reelId: reel.id } }) });
});

reelsRouter.post('/me/reels/:id/comments', async (req, res) => {
  const user = me(req);
  const reel = reelById(String(req.params.id));
  if (!reel) throw notFound('Reel not found');
  if (restrictionOf(user)?.limits?.includes('comments')) throw new AppError(403, 'Commenting is turned off on your account for now.', 'restricted');
  const text = z.string().trim().min(1).max(300).parse(req.body?.text);
  const recent = await prisma.reelComment.count({ where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 3_600_000) } } });
  if (recent >= COMMENTS_PER_HOUR) throw new AppError(429, 'You’ve commented a lot this hour. Try again a little later.', 'rate');
  // Screened before anyone sees it (OpenAI's moderation endpoint, free to use).
  const check = await openaiClient().moderations.create({ model: 'omni-moderation-latest', input: text });
  if (check.results.some((r) => r.flagged)) throw new AppError(422, 'This comment can’t be posted. Please keep comments kind and on topic.', 'blocked');
  const c = await prisma.reelComment.create({ data: { reelId: reel.id, userId: user.id, text } });
  res.status(201).json({ comment: { id: c.id, text: c.text, createdAt: c.createdAt.getTime(), mine: true, ...author(user) } });
});

reelsRouter.delete('/me/reels/comments/:id', async (req, res) => {
  const { count } = await prisma.reelComment.deleteMany({ where: { id: String(req.params.id), userId: me(req).id } });
  if (!count) throw notFound('Comment not found');
  res.json({ ok: true });
});

/** Reporting a comment: it's hidden for everyone once several people have reported it. */
reelsRouter.post('/me/reels/comments/:id/report', async (req, res) => {
  const c = await prisma.reelComment.findUnique({ where: { id: String(req.params.id) } });
  if (!c) throw notFound('Comment not found');
  if (c.userId === me(req).id) throw new AppError(400, 'You can’t report your own comment.', 'own');
  const reports = c.reports + 1;
  await prisma.reelComment.update({ where: { id: c.id }, data: { reports, hidden: reports >= REPORTS_TO_HIDE } });
  res.json({ ok: true });
});
