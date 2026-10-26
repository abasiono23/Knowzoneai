import { randomBytes } from 'node:crypto';

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { z } from 'zod';

import { config } from '../config.js';
import { prisma } from '../db.js';
import { Prisma } from '../generated/prisma/client.js';
import { AppError, notFound } from '../lib/errors.js';
import {
  TICKETS_PER_HOUR,
  newCopyrightReference,
  openTicket,
  restrictionOf,
  ticketsThisHour,
  toPublicTicket,
  withMessages,
  type Restriction,
} from '../services/help.js';
import { unfriendOnBlock } from '../services/friends.js';
import { sendEmail } from '../services/mailer.js';
import { me, optionalAuth, requireAuth } from '../services/sessions.js';
import { toPublicUser } from '../services/users.js';

export const helpRouter = Router();
helpRouter.use(['/me/help', '/me/help/*rest', '/me/safety', '/me/safety/*rest', '/me/report', '/me/appeal'], requireAuth);

const Topic = z.enum(['account', 'learning', 'ai', 'payments', 'technical', 'safety', 'other']);
const ItemType = z.enum(['video', 'course', 'lesson', 'study-pack', 'tutor-answer', 'player', 'other']);
const Meta = z
  .record(z.string().max(40), z.string().max(2000))
  .refine((m) => Object.keys(m).length <= 30, 'Too many details')
  .optional();

async function underLimit(userId: string) {
  if ((await ticketsThisHour(userId)) >= TICKETS_PER_HOUR)
    throw new AppError(429, 'You’ve sent a lot of requests in the last hour. Please wait a little and try again.', 'rate-limited');
}

// ─── Support tickets (221–224) ────────────────────────────────────────────────

helpRouter.get('/me/help/tickets', async (req, res) => {
  const tickets = await prisma.helpTicket.findMany({ where: { userId: me(req).id }, orderBy: { updatedAt: 'desc' }, take: 100, include: withMessages });
  res.json({ tickets: tickets.map(toPublicTicket) });
});

const NewTicket = z.object({
  /** Reports, copyright notices and appeals have their own endpoints. */
  kind: z.enum(['support', 'bug', 'feedback']),
  topic: Topic.optional(),
  subject: z.string().trim().min(3, 'Add a short subject').max(120),
  message: z.string().trim().min(10, 'Tell us a little more (at least 10 characters)').max(5000),
  meta: Meta,
});

/** Contact support (221), feedback (223) and bug reports (224). */
helpRouter.post('/me/help/tickets', async (req, res) => {
  const user = me(req);
  const input = NewTicket.parse(req.body);
  await underLimit(user.id);
  res.status(201).json({ ticket: toPublicTicket(await openTicket(user, input)) });
});

async function ownTicket(userId: string, id: unknown) {
  const ticket = await prisma.helpTicket.findFirst({ where: { id: String(id ?? ''), userId } });
  if (!ticket) throw notFound('Ticket not found');
  return ticket;
}

/** Replying reopens a request (222). */
helpRouter.post('/me/help/tickets/reply', async (req, res) => {
  const user = me(req);
  const { id, text } = z.object({ id: z.string().max(20), text: z.string().trim().min(1, 'Write a message first').max(5000) }).parse(req.body);
  await ownTicket(user.id, id);
  const ticket = await prisma.helpTicket.update({
    where: { id },
    data: { status: 'open', messages: { create: { from: 'me', text } } },
    include: withMessages,
  });
  res.json({ ticket: toPublicTicket(ticket) });
});

helpRouter.post('/me/help/tickets/close', async (req, res) => {
  const user = me(req);
  const { id } = z.object({ id: z.string().max(20) }).parse(req.body);
  await ownTicket(user.id, id);
  const ticket = await prisma.helpTicket.update({ where: { id }, data: { status: 'resolved' }, include: withMessages });
  res.json({ ticket: toPublicTicket(ticket) });
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

/** A screenshot for a bug report (224), stored in the database. The app puts the link in the ticket. */
helpRouter.post('/me/help/attachments', upload.single('file'), async (req, res) => {
  const user = me(req);
  const file = req.file;
  if (!file) throw new AppError(400, 'Choose a screenshot', 'invalid');
  if (!IMAGE_TYPES.includes(file.mimetype)) throw new AppError(415, 'Use a JPG, PNG or WebP image', 'unsupported-file');
  if ((await prisma.helpFile.count({ where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 60 * 60_000) } } })) >= TICKETS_PER_HOUR)
    throw new AppError(429, 'Please wait a little before adding more screenshots.', 'rate-limited');
  const token = randomBytes(24).toString('base64url');
  await prisma.helpFile.create({ data: { token, userId: user.id, mimeType: file.mimetype, data: new Uint8Array(file.buffer) } });
  res.status(201).json({ url: `${req.protocol}://${req.get('host')}/help/files/${token}` });
});

helpRouter.get('/help/files/:token', async (req, res) => {
  const file = await prisma.helpFile.findUnique({ where: { token: String(req.params.token) } });
  if (!file) throw notFound('File not found');
  res
    .set({ 'Content-Type': file.mimeType, 'Cache-Control': 'private, max-age=86400', 'Cross-Origin-Resource-Policy': 'cross-origin' })
    .send(Buffer.from(file.data));
});

// ─── Safety: reports, blocking and hidden content (225, 231) ──────────────────

async function safetyOf(userId: string) {
  const [blocked, hidden] = await Promise.all([
    prisma.blockedUser.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.hiddenItem.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
  ]);
  return {
    blockedUsers: blocked.map((b) => ({ id: b.blockedId, name: b.name, at: b.createdAt.getTime() })),
    hidden: hidden.map((h) => ({ type: h.type, id: h.itemId, title: h.title, at: h.createdAt.getTime() })),
  };
}

helpRouter.get('/me/safety', async (req, res) => {
  res.json({ safety: await safetyOf(me(req).id) });
});

const Report = z.object({
  type: ItemType,
  id: z.string().trim().min(1).max(200),
  title: z.string().trim().max(200).default(''),
  reason: z.string().trim().min(1, 'Choose a reason').max(100),
  details: z.string().trim().max(2000).default(''),
  hide: z.boolean().optional(),
  block: z.boolean().optional(),
});

/** Report inappropriate content (225): goes to moderation; can also hide the item or block the person. */
helpRouter.post('/me/report', async (req, res) => {
  const user = me(req);
  const r = Report.parse(req.body);
  await underLimit(user.id);
  const ticket = await openTicket(user, {
    kind: 'report',
    topic: 'safety',
    subject: `Report: ${r.title || r.type}`,
    message: [r.reason, r.details].filter(Boolean).join('\n\n'),
    meta: { type: r.type, itemId: r.id, title: r.title, reason: r.reason },
  });
  if (r.hide)
    await prisma.hiddenItem.upsert({
      where: { userId_type_itemId: { userId: user.id, type: r.type, itemId: r.id } },
      create: { userId: user.id, type: r.type, itemId: r.id, title: r.title },
      update: {},
    });
  if (r.block) await block(user.id, r.id, r.title);
  res.status(201).json({ ticket: toPublicTicket(ticket), safety: await safetyOf(user.id) });
});

const block = (userId: string, blockedId: string, name: string) =>
  prisma.blockedUser.upsert({ where: { userId_blockedId: { userId, blockedId } }, create: { userId, blockedId, name }, update: {} });

helpRouter.post('/me/safety/block', async (req, res) => {
  const user = me(req);
  const { id, name } = z.object({ id: z.string().trim().min(1).max(200), name: z.string().trim().max(200).default('') }).parse(req.body);
  if (id === user.id) throw new AppError(400, 'You can’t block yourself', 'invalid');
  await block(user.id, id, name);
  await unfriendOnBlock(user.id, id);
  res.json({ safety: await safetyOf(user.id) });
});

helpRouter.post('/me/safety/unblock', async (req, res) => {
  const user = me(req);
  const { id } = z.object({ id: z.string().max(200) }).parse(req.body);
  await prisma.blockedUser.deleteMany({ where: { userId: user.id, blockedId: id } });
  res.json({ safety: await safetyOf(user.id) });
});

helpRouter.post('/me/safety/unhide', async (req, res) => {
  const user = me(req);
  const { type, id } = z.object({ type: ItemType, id: z.string().max(200) }).parse(req.body);
  await prisma.hiddenItem.deleteMany({ where: { userId: user.id, type, itemId: id } });
  res.json({ safety: await safetyOf(user.id) });
});

// ─── Copyright notices (230) ──────────────────────────────────────────────────

const copyrightLimiter = rateLimit({
  windowMs: 60 * 60_000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many notices from this connection. Please try again later.', reason: 'rate-limited' },
});

const Copyright = z.object({
  name: z.string().trim().min(2, 'Please fill in every required field').max(120),
  email: z.email('Enter a valid email address').max(200),
  organisation: z.string().trim().max(200).default(''),
  work: z.string().trim().min(10, 'Please fill in every required field').max(5000),
  location: z.string().trim().min(3, 'Please fill in every required field').max(2000),
  statement: z.literal('true', { error: 'Please confirm the good-faith statement' }),
});

/** Anyone can send one, signed in or not. Signed-in senders also get a ticket to follow it. */
helpRouter.post('/legal/copyright', copyrightLimiter, optionalAuth, async (req, res) => {
  const { statement: _confirmed, ...input } = Copyright.parse(req.body);
  let reference = '';
  for (let attempt = 0; !reference; attempt++) {
    try {
      const notice = await prisma.copyrightNotice.create({
        data: { reference: newCopyrightReference(), userId: req.user?.id ?? null, ...input },
      });
      reference = notice.reference;
    } catch (e) {
      if (!(attempt < 5 && e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')) throw e;
    }
  }
  if (req.user)
    await openTicket(req.user, {
      kind: 'copyright',
      subject: `Copyright notice ${reference}`,
      message: `${input.work}\n\nWhere: ${input.location}`,
      meta: { reference },
    });
  else if (config.SUPPORT_EMAIL)
    await sendEmail({
      to: config.SUPPORT_EMAIL,
      subject: `[copyright] ${reference}`,
      text: `From ${input.name} <${input.email}>${input.organisation ? ` (${input.organisation})` : ''}\n\n${input.work}\n\nWhere: ${input.location}`,
    }).catch((e) => console.error('Support alert failed:', e));
  res.status(201).json({ reference });
});

// ─── Appeals (232) ────────────────────────────────────────────────────────────

/** Appeal a restriction or suspension; a different moderator reviews it. One appeal in review at a time. */
helpRouter.post('/me/appeal', async (req, res) => {
  const user = me(req);
  const restriction = restrictionOf(user);
  if (!restriction) throw new AppError(409, 'Your account isn’t restricted', 'not-restricted');
  if (restriction.appeal?.status === 'pending') throw new AppError(409, 'You already have an appeal in review', 'appeal-pending');
  const { message } = z.object({ message: z.string().trim().min(20, 'Tell us why in a few sentences (at least 20 characters)').max(3000) }).parse(req.body);
  const ticket = await openTicket(user, {
    kind: 'appeal',
    topic: 'safety',
    subject: 'Appeal: account restriction',
    message,
    meta: { restriction: restriction.kind, reason: restriction.reason },
  });
  const next: Restriction = { ...restriction, appeal: { ticketId: ticket.id, at: Date.now(), status: 'pending' } };
  const updated = await prisma.user.update({ where: { id: user.id }, data: { restriction: next } });
  res.status(201).json({ user: toPublicUser(updated), ticket: toPublicTicket(ticket) });
});
