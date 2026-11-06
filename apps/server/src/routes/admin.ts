import { Router, type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';

import { config } from '../config.js';
import { prisma } from '../db.js';
import { Prisma } from '../generated/prisma/client.js';
import { forbidden, notFound } from '../lib/errors.js';
import { allCountries, allCourseBooks } from '../services/books.js';
import { decideAppeal, staffReply, type Restriction } from '../services/help.js';
import { requireAuth } from '../services/sessions.js';
import { adminLibraryRouter } from './admin-library.js';
import { allSkills } from '../services/skills.js';
import { allVideoTopics } from '../services/subject-videos.js';
import { allSummaryCards } from '../services/summaries.js';

/**
 * The staff dashboard's API (the page is apps/web/admin.html). Only the emails in ADMIN_EMAILS get in;
 * with none set, nobody does. It shows what staff need to run the service and answer people, and leaves
 * out learners' chats, notes, uploads and study answers. Every change is written to the server log.
 */
export const adminRouter = Router();

const DAY = 86_400_000;
const PAGE = 50;

export const adminEmails = () =>
  config.ADMIN_EMAILS.split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

function onlyAdmins(req: Request, _res: Response, next: NextFunction) {
  if (!adminEmails().includes(req.user!.email.toLowerCase())) throw forbidden('This account is not on the staff list');
  next();
}

adminRouter.use('/admin', requireAuth, onlyAdmins);
adminRouter.use(adminLibraryRouter);

const audit = (req: Request, action: string, target: string) =>
  console.info(`[admin] ${req.user!.email} ${action} ${target}`);

const param = (req: Request, name: string) => String(req.params[name]);

const Listing = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  status: z.string().trim().max(20).optional(),
  kind: z.string().trim().max(20).optional(),
  q: z.string().trim().max(120).optional(),
});
const paging = (page: number) => ({ skip: (page - 1) * PAGE, take: PAGE });

adminRouter.get('/admin/me', (req, res) => {
  res.json({ email: req.user!.email, name: req.user!.name });
});

adminRouter.get('/admin/overview', async (_req, res) => {
  const now = Date.now();
  const week = new Date(now - 7 * DAY);
  const month = new Date(now - 30 * DAY);
  const [
    users,
    newUsers,
    activeWeek,
    plans,
    subscriptions,
    revenue,
    tickets,
    billing,
    videoReports,
    comments,
    copyright,
    restricted,
    waitlist,
    waitlistWeek,
    ai,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: week } } }),
    prisma.user.count({ where: { lastActiveDate: { gte: week } } }),
    prisma.user.groupBy({ by: ['plan'], _count: true }),
    prisma.subscription.count({ where: { status: 'active', currentPeriodEnd: { gt: new Date(now) } } }),
    prisma.payment.groupBy({
      by: ['currency'],
      where: { status: 'paid', paidAt: { gte: month } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.helpTicket.count({ where: { status: 'open' } }),
    prisma.billingTicket.count({ where: { status: 'open' } }),
    prisma.videoReport.count({ where: { status: 'open' } }),
    prisma.reelComment.count({ where: { reports: { gt: 0 }, hidden: false } }),
    prisma.copyrightNotice.count({ where: { status: 'open' } }),
    prisma.user.count({ where: { NOT: { restriction: { equals: Prisma.DbNull } } } }),
    prisma.waitlistEntry.count(),
    prisma.waitlistEntry.count({ where: { createdAt: { gte: week } } }),
    prisma.usageEvent.aggregate({
      where: { createdAt: { gte: month } },
      _count: true,
      _sum: { inputTokens: true, outputTokens: true },
    }),
  ]);
  const bookTitles = new Set([
    ...[...allCountries().values()].flatMap((c) => c.books.map((b) => b.title.toLowerCase())),
    ...allCourseBooks().map((b) => b.title.toLowerCase()),
  ]);
  res.json({
    users: { total: users, newThisWeek: newUsers, activeThisWeek: activeWeek, restricted },
    plans: plans.map((p) => ({ plan: p.plan, count: p._count })),
    money: {
      activeSubscriptions: subscriptions,
      last30Days: revenue.map((r) => ({ currency: r.currency, amount: r._sum.amount ?? 0, payments: r._count })),
    },
    queues: { support: tickets, billing, videoReports, comments, copyright },
    waitlist: { total: waitlist, newThisWeek: waitlistWeek },
    ai: {
      requests: ai._count,
      inputTokens: ai._sum.inputTokens ?? 0,
      outputTokens: ai._sum.outputTokens ?? 0,
    },
    content: {
      summaries: allSummaryCards('en').length,
      subjectVideos: new Set(allVideoTopics('en').flatMap((t) => t.videos.map((v) => v.youtubeId))).size,
      books: bookTitles.size,
      futureSkills: allSkills().length,
    },
  });
});

/* ---------- People ---------- */

adminRouter.get('/admin/users', async (req, res) => {
  const { page, q } = Listing.parse(req.query);
  const where: Prisma.UserWhereInput = q
    ? {
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
          { username: { contains: q, mode: 'insensitive' } },
          { id: q },
        ],
      }
    : {};
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paging(page),
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        lastActiveDate: true,
        restriction: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);
  res.json({ items, total, pageSize: PAGE });
});

adminRouter.get('/admin/users/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: param(req, 'id') },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      school: true,
      grade: true,
      role: true,
      plan: true,
      authProvider: true,
      providers: true,
      emailVerified: true,
      onboardingComplete: true,
      xp: true,
      coins: true,
      aiCredits: true,
      streak: true,
      lastActiveDate: true,
      restriction: true,
      deleteAt: true,
      createdAt: true,
      subscription: { select: { plan: true, period: true, status: true, currentPeriodEnd: true, autoRenew: true } },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { reference: true, plan: true, amount: true, currency: true, status: true, createdAt: true },
      },
      helpTickets: {
        orderBy: { updatedAt: 'desc' },
        take: 10,
        select: { id: true, kind: true, subject: true, status: true, updatedAt: true },
      },
    },
  });
  if (!user) throw notFound('No such account');
  res.json(user);
});

const RestrictionBody = z.object({
  kind: z.enum(['restricted', 'suspended']),
  reason: z.string().trim().min(3).max(500),
  days: z.number().int().min(1).max(3650).optional(),
  limits: z
    .array(z.enum(['leaderboards', 'battles', 'invites', 'sharing']))
    .min(1)
    .optional(),
});

adminRouter.post('/admin/users/:id/restriction', async (req, res) => {
  const body = RestrictionBody.parse(req.body);
  const id = param(req, 'id');
  if (id === req.user!.id) throw forbidden('You can’t restrict your own account');
  const now = Date.now();
  const restriction: Restriction = {
    kind: body.kind,
    reason: body.reason,
    at: now,
    ...(body.days && { until: now + body.days * DAY }),
    ...(body.kind === 'restricted' && { limits: body.limits ?? ['leaderboards', 'battles', 'invites', 'sharing'] }),
  };
  await prisma.user.update({ where: { id }, data: { restriction } }).catch(() => {
    throw notFound('No such account');
  });
  audit(req, body.kind, id);
  res.json({ ok: true, restriction });
});

adminRouter.delete('/admin/users/:id/restriction', async (req, res) => {
  const id = param(req, 'id');
  await prisma.user.update({ where: { id }, data: { restriction: Prisma.DbNull } }).catch(() => {
    throw notFound('No such account');
  });
  audit(req, 'lifted restriction on', id);
  res.json({ ok: true });
});

/* ---------- Support ---------- */

adminRouter.get('/admin/tickets', async (req, res) => {
  const { page, status, kind } = Listing.parse(req.query);
  const where: Prisma.HelpTicketWhereInput = {
    ...(status && status !== 'all' && { status }),
    ...(kind && kind !== 'all' && { kind }),
  };
  const [items, total, kinds] = await Promise.all([
    prisma.helpTicket.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      ...paging(page),
      select: {
        id: true,
        kind: true,
        topic: true,
        subject: true,
        status: true,
        updatedAt: true,
        user: { select: { email: true } },
      },
    }),
    prisma.helpTicket.count({ where }),
    prisma.helpTicket.groupBy({ by: ['kind'], _count: true }),
  ]);
  res.json({ items, total, pageSize: PAGE, kinds: kinds.map((k) => k.kind).sort() });
});

adminRouter.get('/admin/tickets/:id', async (req, res) => {
  const ticket = await prisma.helpTicket.findUnique({
    where: { id: param(req, 'id') },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
      user: { select: { id: true, email: true, name: true, plan: true, restriction: true } },
    },
  });
  if (!ticket) throw notFound('No such request');
  res.json(ticket);
});

const Reply = z.object({ text: z.string().trim().min(1).max(4000), resolve: z.boolean().default(false) });

adminRouter.post('/admin/tickets/:id/reply', async (req, res) => {
  const body = Reply.parse(req.body);
  const id = param(req, 'id');
  if (!(await prisma.helpTicket.findUnique({ where: { id }, select: { id: true } }))) throw notFound('No such request');
  await staffReply(id, body.text, { staff: req.user!.email, resolve: body.resolve });
  audit(req, body.resolve ? 'replied to and resolved' : 'replied to', id);
  res.json({ ok: true });
});

adminRouter.post('/admin/tickets/:id/resolve', async (req, res) => {
  const id = param(req, 'id');
  await prisma.helpTicket.update({ where: { id }, data: { status: 'resolved' } }).catch(() => {
    throw notFound('No such request');
  });
  audit(req, 'resolved', id);
  res.json({ ok: true });
});

const Appeal = z.object({ decision: z.enum(['accept', 'reject']), text: z.string().trim().min(1).max(4000) });

adminRouter.post('/admin/tickets/:id/appeal', async (req, res) => {
  const body = Appeal.parse(req.body);
  const id = param(req, 'id');
  const decided = await decideAppeal(id, body.decision === 'accept', body.text, req.user!.email);
  if (!decided) throw notFound('That isn’t an appeal');
  audit(req, `${body.decision}ed appeal`, id);
  res.json({ ok: true });
});

/* ---------- Reports ---------- */

adminRouter.get('/admin/video-reports', async (req, res) => {
  const { page, status } = Listing.parse(req.query);
  const where = status && status !== 'all' ? { status } : {};
  const [reports, total] = await Promise.all([
    prisma.videoReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paging(page),
      include: { user: { select: { email: true } } },
    }),
    prisma.videoReport.count({ where }),
  ]);
  const videos = await prisma.video.findMany({
    where: { id: { in: reports.map((r) => r.videoId) } },
    select: { id: true, title: true },
  });
  const titles = new Map(videos.map((v) => [v.id, v.title]));
  res.json({
    items: reports.map((r) => ({ ...r, videoTitle: titles.get(r.videoId) ?? null })),
    total,
    pageSize: PAGE,
  });
});

const ReportStatus = z.object({ status: z.enum(['open', 'reviewed', 'dismissed']) });

adminRouter.post('/admin/video-reports/:id', async (req, res) => {
  const { status } = ReportStatus.parse(req.body);
  const id = param(req, 'id');
  await prisma.videoReport.update({ where: { id }, data: { status } }).catch(() => {
    throw notFound('No such report');
  });
  audit(req, `marked report ${status}`, id);
  res.json({ ok: true });
});

adminRouter.get('/admin/comments', async (req, res) => {
  const { page } = Listing.parse(req.query);
  const where: Prisma.ReelCommentWhereInput = { OR: [{ reports: { gt: 0 } }, { hidden: true }] };
  const [items, total] = await Promise.all([
    prisma.reelComment.findMany({
      where,
      orderBy: [{ hidden: 'asc' }, { reports: 'desc' }, { createdAt: 'desc' }],
      ...paging(page),
      include: { user: { select: { id: true, email: true, name: true } } },
    }),
    prisma.reelComment.count({ where }),
  ]);
  res.json({ items, total, pageSize: PAGE });
});

const CommentState = z.object({ hidden: z.boolean() });

adminRouter.post('/admin/comments/:id', async (req, res) => {
  const { hidden } = CommentState.parse(req.body);
  const id = param(req, 'id');
  await prisma.reelComment.update({ where: { id }, data: { hidden } }).catch(() => {
    throw notFound('No such comment');
  });
  audit(req, hidden ? 'hid comment' : 'restored comment', id);
  res.json({ ok: true });
});

adminRouter.get('/admin/copyright', async (req, res) => {
  const { page, status } = Listing.parse(req.query);
  const where = status && status !== 'all' ? { status } : {};
  const [items, total] = await Promise.all([
    prisma.copyrightNotice.findMany({ where, orderBy: { createdAt: 'desc' }, ...paging(page) }),
    prisma.copyrightNotice.count({ where }),
  ]);
  res.json({ items, total, pageSize: PAGE });
});

const NoticeStatus = z.object({ status: z.enum(['open', 'actioned', 'rejected']) });

adminRouter.post('/admin/copyright/:reference', async (req, res) => {
  const { status } = NoticeStatus.parse(req.body);
  const reference = param(req, 'reference');
  await prisma.copyrightNotice.update({ where: { reference }, data: { status } }).catch(() => {
    throw notFound('No such notice');
  });
  audit(req, `marked notice ${status}`, reference);
  res.json({ ok: true });
});

/* ---------- Billing (to look up and answer; money moves only in the payment provider) ---------- */

adminRouter.get('/admin/payments', async (req, res) => {
  const { page, status, q } = Listing.parse(req.query);
  const where: Prisma.PaymentWhereInput = {
    ...(status && status !== 'all' && { status }),
    ...(q && {
      OR: [
        { reference: { contains: q, mode: 'insensitive' } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
      ],
    }),
  };
  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paging(page),
      select: {
        reference: true,
        plan: true,
        period: true,
        amount: true,
        discount: true,
        currency: true,
        status: true,
        failureReason: true,
        renewal: true,
        paidAt: true,
        refundedAt: true,
        createdAt: true,
        user: { select: { id: true, email: true } },
      },
    }),
    prisma.payment.count({ where }),
  ]);
  res.json({ items, total, pageSize: PAGE });
});

adminRouter.get('/admin/billing-tickets', async (req, res) => {
  const { page, status } = Listing.parse(req.query);
  const where = status && status !== 'all' ? { status } : {};
  const [items, total] = await Promise.all([
    prisma.billingTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paging(page),
      include: { user: { select: { id: true, email: true } } },
    }),
    prisma.billingTicket.count({ where }),
  ]);
  res.json({ items, total, pageSize: PAGE });
});

const BillingAnswer = z.object({ resolution: z.string().trim().min(1).max(1000) });

adminRouter.post('/admin/billing-tickets/:id/resolve', async (req, res) => {
  const { resolution } = BillingAnswer.parse(req.body);
  const id = param(req, 'id');
  await prisma.billingTicket.update({ where: { id }, data: { status: 'resolved', resolution } }).catch(() => {
    throw notFound('No such request');
  });
  audit(req, 'resolved billing request', id);
  res.json({ ok: true });
});

/* ---------- Waitlist ---------- */

/** A spreadsheet would run a cell starting with one of these as a formula, and sign-ups are public. */
const csvCell = (value: string) => {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
};

adminRouter.get('/admin/waitlist.csv', async (req, res) => {
  const rows = await prisma.waitlistEntry.findMany({ orderBy: { createdAt: 'asc' } });
  audit(req, 'exported the waitlist', `(${rows.length} people)`);
  const lines = rows.map((r) =>
    [r.name, r.email, r.role, r.country ?? '', r.interests.join(' '), r.source ?? '', r.createdAt.toISOString()]
      .map(csvCell)
      .join(','),
  );
  res
    .type('text/csv')
    .send([['name', 'email', 'role', 'country', 'interests', 'source', 'joined'].join(','), ...lines].join('\n'));
});

adminRouter.get('/admin/waitlist', async (req, res) => {
  const { page, q } = Listing.parse(req.query);
  const where: Prisma.WaitlistEntryWhereInput = q
    ? { OR: [{ email: { contains: q, mode: 'insensitive' } }, { name: { contains: q, mode: 'insensitive' } }] }
    : {};
  const [items, total] = await Promise.all([
    prisma.waitlistEntry.findMany({ where, orderBy: { createdAt: 'desc' }, ...paging(page) }),
    prisma.waitlistEntry.count({ where }),
  ]);
  res.json({ items, total, pageSize: PAGE });
});
