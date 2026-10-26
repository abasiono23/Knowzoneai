import { Router } from 'express';
import { z } from 'zod';

import { toPublicPayment } from '../services/billing.js';
import { toPublicTicket, withMessages } from '../services/help.js';
import { prisma } from '../db.js';
import { Prisma } from '../generated/prisma/client.js';
import { conflict } from '../lib/errors.js';
import { DAY, ms } from '../lib/time.js';
import { connectionsOf, mergeSettings, ProfilePatch, settingsOf, SettingsPatch } from '../services/account.js';
import { emails, sendEmail } from '../services/mailer.js';
import { Personalization, settingsFromPersonalization } from '../services/personalization.js';
import { me, requireAuth } from '../services/sessions.js';
import { toPublicUser } from '../services/users.js';

export const accountRouter = Router();
accountRouter.use(['/me', '/me/*rest'], requireAuth);

accountRouter.get('/me', (req, res) => {
  res.json({ user: toPublicUser(me(req)) });
});

accountRouter.post('/me/consent', async (req, res) => {
  const c = z.object({ terms: z.boolean(), privacy: z.boolean(), age: z.boolean(), marketing: z.boolean().default(false) }).parse(req.body);
  const accepted = c.terms && c.privacy && c.age;
  const user = await prisma.user.update({
    where: { id: me(req).id },
    data: { termsAccepted: accepted, marketingConsent: c.marketing, consentAt: accepted ? new Date() : null },
  });
  res.json({ user: toPublicUser(user) });
});

accountRouter.get('/me/personalization', (req, res) => {
  res.json({ personalization: me(req).personalization ?? null });
});

accountRouter.post('/me/personalization', async (req, res) => {
  const current = me(req);
  const p = Personalization.parse(req.body);
  const user = await prisma.user.update({
    where: { id: current.id },
    data: {
      personalization: p as Prisma.InputJsonValue,
      dailyGoalMinutes: p.dailyMinutes,
      settings: settingsFromPersonalization(current, p),
    },
  });
  res.json({ user: toPublicUser(user) });
});

accountRouter.post('/me/onboarding/complete', async (req, res) => {
  const current = me(req);
  const teacher = (current.personalization as { learnerType?: string } | null)?.learnerType === 'teacher';
  const user = await prisma.user.update({
    where: { id: current.id },
    data: { onboardingComplete: true, ...(teacher && { role: 'teacher' }) },
  });
  res.json({ user: toPublicUser(user) });
});

accountRouter.post('/me/profile', async (req, res) => {
  const patch = ProfilePatch.parse(req.body);
  const { username, photo, ...rest } = patch;
  try {
    const user = await prisma.user.update({
      where: { id: me(req).id },
      data: {
        ...rest,
        ...(username !== undefined && { username: username || null }),
        ...(photo !== undefined && { photo }),
      },
    });
    res.json({ user: toPublicUser(user) });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') throw conflict('That username is taken', 'username-taken');
    throw e;
  }
});

accountRouter.get('/me/connections', (req, res) => {
  res.json({ connections: connectionsOf(me(req)) });
});

async function sessionsFor(userId: string, currentId: string | undefined) {
  const rows = await prisma.session.findMany({
    where: { userId, revokedAt: null },
    orderBy: { lastActiveAt: 'desc' },
  });
  return rows.map((s) => ({
    id: s.id,
    device: s.device,
    platform: s.platform,
    location: s.location,
    lastActive: s.lastActiveAt.getTime(),
    current: s.id === currentId,
  }));
}

accountRouter.get('/me/sessions', async (req, res) => {
  res.json({ sessions: await sessionsFor(me(req).id, req.sessionId) });
});

accountRouter.post('/me/sessions/revoke', async (req, res) => {
  const user = me(req);
  const { id } = z.object({ id: z.string() }).parse(req.body);
  await prisma.session.updateMany({
    where:
      id === 'others'
        ? { userId: user.id, revokedAt: null, id: { not: req.sessionId } }
        : // Use Log out for this device; revoke only signs out others.
          { userId: user.id, revokedAt: null, id: id === req.sessionId ? '__none__' : id },
    data: { revokedAt: new Date() },
  });
  res.json({ sessions: await sessionsFor(user.id, req.sessionId) });
});

/** Ends this device's session (Log out). */
accountRouter.post('/me/logout', async (req, res) => {
  await prisma.session.update({ where: { id: req.sessionId }, data: { revokedAt: new Date() } });
  res.json({ ok: true });
});

accountRouter.get('/me/settings', (req, res) => {
  res.json({ settings: settingsOf(me(req)) });
});

accountRouter.post('/me/settings', async (req, res) => {
  const user = me(req);
  const settings = mergeSettings(settingsOf(user), SettingsPatch.parse(req.body));
  await prisma.user.update({ where: { id: user.id }, data: { settings } });
  res.json({ settings });
});

/** Everything we hold about the account (NDPA right of access). */
async function exportFor(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      sessions: { where: { revokedAt: null } },
      coinTransactions: { orderBy: { createdAt: 'desc' } },
      redemptions: true,
      creditEntries: { orderBy: { createdAt: 'desc' } },
      referralsMade: true,
      referredBy: true,
      materials: { select: { id: true, title: true, subject: true, createdAt: true, mastery: true } },
      quizAttempts: { select: { materialId: true, score: true, total: true, createdAt: true } },
      payments: { orderBy: { createdAt: 'desc' } },
      helpTickets: { orderBy: { createdAt: 'desc' }, include: withMessages },
      blockedUsers: true,
      hiddenItems: true,
    },
  });
  return {
    exportedAt: new Date().toISOString(),
    account: toPublicUser(user),
    consent: { termsAccepted: user.termsAccepted, marketing: user.marketingConsent, at: ms(user.consentAt) },
    personalization: user.personalization ?? null,
    settings: settingsOf(user),
    connections: connectionsOf(user),
    devices: user.sessions.map((s) => ({
      device: s.device,
      platform: s.platform,
      location: s.location,
      lastActive: ms(s.lastActiveAt),
    })),
    coins: {
      transactions: user.coinTransactions.map((t) => ({ at: ms(t.createdAt), xp: t.xp, coins: t.coins, reason: t.reason })),
      redemptions: user.redemptions.map((r) => ({ rewardId: r.rewardId, cost: r.cost, at: ms(r.createdAt) })),
    },
    aiCredits: user.creditEntries.map((c) => ({ at: ms(c.createdAt), credits: c.credits, reason: c.reason })),
    referralsSent: user.referralsMade.map((r) => ({
      friendName: r.friendName,
      status: r.status,
      joinedAt: ms(r.createdAt),
      qualifiedAt: ms(r.qualifiedAt),
    })),
    referredBy: user.referredBy ? { status: user.referredBy.status, joinedAt: ms(user.referredBy.createdAt) } : null,
    studyMaterials: user.materials.map((m) => ({ ...m, createdAt: ms(m.createdAt) })),
    quizAttempts: user.quizAttempts.map((q) => ({ ...q, createdAt: ms(q.createdAt) })),
    payments: user.payments.map(toPublicPayment),
    helpRequests: user.helpTickets.map(toPublicTicket),
    blockedPlayers: user.blockedUsers.map((b) => ({ id: b.blockedId, name: b.name, at: ms(b.createdAt) })),
    hiddenContent: user.hiddenItems.map((h) => ({ type: h.type, id: h.itemId, title: h.title, at: ms(h.createdAt) })),
  };
}

accountRouter.get('/me/export', async (req, res) => {
  res.json({ export: await exportFor(me(req).id) });
});

accountRouter.post('/me/export/email', async (req, res) => {
  const user = me(req);
  const data = await exportFor(user.id);
  await sendEmail({
    to: user.email,
    ...emails.export(),
    attachments: [{ filename: 'knowzone-data.json', content: JSON.stringify(data, null, 2) }],
  });
  res.json({ requestedAt: Date.now() });
});

/**
 * Schedules deletion after a 14-day grace period; signing in again cancels it. Supabase holds the
 * password, so the app confirms it with Supabase before calling this.
 */
accountRouter.post('/me/delete', async (req, res) => {
  const user = me(req);
  z.object({ reason: z.string().max(500).optional() })
    .loose()
    .parse(req.body);
  const deleteAt = new Date(Date.now() + 14 * DAY);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { deleteAt } }),
    prisma.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);
  await sendEmail({
    to: user.email,
    ...emails.deletion(deleteAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })),
  });
  res.json({ deleteAt: deleteAt.getTime() });
});
