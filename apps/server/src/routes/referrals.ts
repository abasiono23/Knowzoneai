import { Router } from 'express';
import { z } from 'zod';

import { config } from '../config.js';
import { prisma } from '../db.js';
import type { User } from '../generated/prisma/client.js';
import { AppError } from '../lib/errors.js';
import { notify } from '../services/notifications.js';
import { confirmedThisMonth, expireReferrals, REFERRAL_CREDITS, REFERRAL_MONTHLY_CAP } from '../services/referrals.js';
import { me, optionalAuth, requireAuth } from '../services/sessions.js';
import { shortName, toPublicUser } from '../services/users.js';

export const referralsRouter = Router();

/** Retired campaign codes, kept so old links explain themselves instead of saying "not found". */
const EXPIRED_CODES = ['KZ2025', 'SUMMER25', 'BACK2SCHOOL'];

type InvalidReason = 'not-found' | 'expired' | 'own-code' | 'already-referred' | 'not-new' | 'cap-reached';

const Code = z.object({ code: z.string().trim().toUpperCase().min(1, 'Enter an invite code').max(20) });

/** Who a code belongs to, or why it can't be used by this person (same rules as the app's mock). */
async function checkCode(code: string, user: User | undefined): Promise<{ inviter: User } | { reason: InvalidReason }> {
  if (EXPIRED_CODES.includes(code)) return { reason: 'expired' };
  const inviter = await prisma.user.findUnique({ where: { referralCode: code } });
  if (!inviter || inviter.deleteAt) return { reason: 'not-found' };
  if (user && inviter.id === user.id) return { reason: 'own-code' };
  if (user && (await prisma.referral.findUnique({ where: { inviteeId: user.id } }))) return { reason: 'already-referred' };
  // Invite codes are for new accounts, entered during sign-up.
  if (user?.onboardingComplete) return { reason: 'not-new' };
  if ((await confirmedThisMonth(inviter.id)) >= REFERRAL_MONTHLY_CAP) return { reason: 'cap-reached' };
  return { inviter };
}

/** Checks a code before applying it. Works signed in or out; never reveals more than a short name. */
referralsRouter.post('/referrals/validate', optionalAuth, async (req, res) => {
  const { code } = Code.parse(req.body);
  const result = await checkCode(code, req.user);
  res.json('inviter' in result ? { valid: true, inviterName: shortName(result.inviter.name) } : { valid: false, reason: result.reason });
});

/**
 * Applies an invite code to the signed-in account. The referral stays pending until the new
 * student verifies their email and finishes a first lesson, quiz or level; then both get credits.
 */
referralsRouter.post('/me/referral', requireAuth, async (req, res) => {
  const user = me(req);
  const { code } = Code.parse(req.body);
  const result = await checkCode(code, user);
  if (!('inviter' in result))
    throw new AppError(result.reason === 'not-found' ? 404 : 409, 'This invite code can’t be used', result.reason);
  try {
    await prisma.referral.create({
      data: {
        inviterId: result.inviter.id,
        inviteeId: user.id,
        friendName: shortName(user.name),
        credits: REFERRAL_CREDITS,
      },
    });
  } catch {
    // Two taps at once: the unique invitee constraint keeps only one.
    throw new AppError(409, 'This invite code can’t be used', 'already-referred');
  }
  await notify(result.inviter.id, {
    type: 'referral',
    template: 'referralJoined',
    params: { friend: shortName(user.name), credits: REFERRAL_CREDITS },
    href: '/referrals',
  });
  res.json({ user: toPublicUser(user) });
});

const ms = (d: Date | null | undefined) => (d ? d.getTime() : undefined);

/**
 * Referral dashboard (169–175): the learner's code and share link, the friends they invited and
 * where each stands, this month's confirmed count against the cap, the AI-credit history, and, if
 * they were invited, their own pending reward.
 */
referralsRouter.get('/me/referrals', requireAuth, async (req, res) => {
  const user = me(req);
  await expireReferrals();
  const [mine, credits, invite, confirmed] = await Promise.all([
    prisma.referral.findMany({
      where: { inviterId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { invitee: { select: { emailVerified: true } } },
    }),
    prisma.creditEntry.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 200 }),
    prisma.referral.findUnique({ where: { inviteeId: user.id }, include: { inviter: { select: { name: true } } } }),
    confirmedThisMonth(user.id),
  ]);
  res.json({
    code: user.referralCode,
    link: `${config.APP_URL.replace(/\/$/, '')}/invite/${user.referralCode}`,
    rewardCredits: REFERRAL_CREDITS,
    monthlyCap: REFERRAL_MONTHLY_CAP,
    confirmedThisMonth: confirmed,
    referrals: mine.map((r) => ({
      id: r.id,
      friendName: r.friendName,
      joinedAt: ms(r.createdAt),
      emailVerified: r.invitee.emailVerified,
      ...(r.qualifiedAt && { qualifiedAt: ms(r.qualifiedAt) }),
      status: r.status,
      ...(r.rejectReason && { rejectReason: r.rejectReason }),
      credits: r.credits,
    })),
    credits: credits.map((c) => ({
      id: c.id,
      at: ms(c.createdAt),
      credits: c.credits,
      reason: c.reason,
      ...(c.friendName && { friendName: c.friendName }),
    })),
    invitedBy: invite
      ? {
          inviterName: shortName(invite.inviter.name),
          status: invite.status,
          appliedAt: ms(invite.createdAt),
          emailVerified: user.emailVerified,
          ...(invite.qualifiedAt && { qualifiedAt: ms(invite.qualifiedAt) }),
        }
      : null,
    user: toPublicUser(user),
  });
});
