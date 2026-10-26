import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../db.js';
import { notFound } from '../lib/errors.js';
import { toPublicNotification } from '../services/notifications.js';
import { me, requireAuth } from '../services/sessions.js';

export const notificationsRouter = Router();

const List = z.object({
  /** Pass the last item's createdAt to get the next page. */
  before: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(30),
});

/** Notifications inbox (44), newest first. */
notificationsRouter.get('/me/notifications', requireAuth, async (req, res) => {
  const userId = me(req).id;
  const { before, limit } = List.parse(req.query);
  const [items, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId, ...(before && { createdAt: { lt: new Date(before) } }) },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);
  res.json({ items: items.slice(0, limit).map(toPublicNotification), unread, hasMore: items.length > limit });
});

/** Notification detail (45). Opening it marks it read. */
notificationsRouter.get('/me/notifications/:id', requireAuth, async (req, res) => {
  const n = await prisma.notification.findFirst({ where: { id: String(req.params.id), userId: me(req).id } });
  if (!n) throw notFound('Notification not found');
  const read = n.readAt ? n : await prisma.notification.update({ where: { id: n.id }, data: { readAt: new Date() } });
  res.json({ notification: toPublicNotification(read) });
});

notificationsRouter.post('/me/notifications/:id/read', requireAuth, async (req, res) => {
  const { count } = await prisma.notification.updateMany({
    where: { id: String(req.params.id), userId: me(req).id, readAt: null },
    data: { readAt: new Date() },
  });
  res.json({ ok: true, changed: count });
});

notificationsRouter.post('/me/notifications/read-all', requireAuth, async (req, res) => {
  await prisma.notification.updateMany({ where: { userId: me(req).id, readAt: null }, data: { readAt: new Date() } });
  res.json({ ok: true, unread: 0 });
});

notificationsRouter.delete('/me/notifications/:id', requireAuth, async (req, res) => {
  await prisma.notification.deleteMany({ where: { id: String(req.params.id), userId: me(req).id } });
  res.json({ ok: true });
});
