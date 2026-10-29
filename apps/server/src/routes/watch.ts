import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../db.js';
import { optionalAuth } from '../services/sessions.js';
import { searchVideos, watchVideos } from '../services/watch.js';

/**
 * The Videos feed (the dashboard's Videos): the courses' YouTube videos one after another, like short
 * videos, with search. Likes and comments use the reel endpoints (`/me/reels/yt-…/like`, …).
 */
export const watchRouter = Router();

const PAGE = 8;

watchRouter.get('/watch', optionalAuth, async (req, res) => {
  const query = z
    .object({
      q: z.string().trim().max(80).default(''),
      subject: z.string().max(40).optional(),
      offset: z.coerce.number().int().min(0).default(0),
    })
    .parse(req.query);
  const all = await watchVideos();
  const found = searchVideos(
    all.filter((v) => !query.subject || v.subject === query.subject),
    query.q,
    req.user?.id ?? 'guest',
  );
  const page = found.slice(query.offset, query.offset + PAGE);
  const ids = page.map((v) => v.id);
  const [likes, comments, mine] = await Promise.all([
    prisma.reelLike.groupBy({ by: ['reelId'], where: { reelId: { in: ids } }, _count: { _all: true } }),
    prisma.reelComment.groupBy({ by: ['reelId'], where: { reelId: { in: ids }, hidden: false }, _count: { _all: true } }),
    req.user ? prisma.reelLike.findMany({ where: { userId: req.user.id, reelId: { in: ids } }, select: { reelId: true } }) : [],
  ]);
  const count = (rows: { reelId: string; _count: { _all: number } }[], id: string) => rows.find((x) => x.reelId === id)?._count._all ?? 0;
  res.json({
    videos: page.map((v) => ({
      ...v,
      likes: count(likes, v.id),
      comments: count(comments, v.id),
      liked: mine.some((m) => m.reelId === v.id),
    })),
    total: found.length,
    next: query.offset + PAGE < found.length ? query.offset + PAGE : null,
    // Subjects with videos, for the search chips (on the first page only).
    ...(query.offset === 0 && {
      subjects: [...new Set(all.map((v) => v.subject))].map((id) => ({ id, videos: all.filter((v) => v.subject === id).length })),
    }),
  });
});
