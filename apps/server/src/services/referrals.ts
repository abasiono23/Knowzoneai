import { prisma } from '../db.js';
import type { Template } from './notifications.js';

export const REFERRAL_CREDITS = 5;
export const REFERRAL_MONTHLY_CAP = 10;
/** A referral that isn't qualified within this window is closed. */
export const REFERRAL_WINDOW_DAYS = 30;

const monthStart = () => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
};

export const confirmedThisMonth = (inviterId: string) =>
  prisma.referral.count({ where: { inviterId, status: 'confirmed', qualifiedAt: { gte: monthStart() } } });

/**
 * Confirms the invitee's pending referral once they finish a real learning activity and have a
 * verified email. Both people get credits; rewards are capped per inviter per month.
 */
export async function confirmReferralIfEligible(inviteeId: string) {
  const referral = await prisma.referral.findUnique({
    where: { inviteeId },
    include: { invitee: true, inviter: true },
  });
  if (!referral || referral.status !== 'pending' || !referral.invitee.emailVerified) return;
  if (Date.now() - referral.createdAt.getTime() > REFERRAL_WINDOW_DAYS * 86_400_000) {
    await prisma.referral.update({
      where: { id: referral.id },
      data: { status: 'rejected', rejectReason: 'Didn’t finish a first lesson, quiz or level within 30 days' },
    });
    return;
  }
  if ((await confirmedThisMonth(referral.inviterId)) >= REFERRAL_MONTHLY_CAP) return;

  const credits = referral.credits;
  await prisma.$transaction([
    prisma.referral.update({ where: { id: referral.id }, data: { status: 'confirmed', qualifiedAt: new Date() } }),
    prisma.user.update({
      where: { id: referral.inviterId },
      data: {
        aiCredits: { increment: credits },
        creditEntries: { create: { credits, reason: 'referral-inviter', friendName: referral.friendName } },
      },
    }),
    prisma.user.update({
      where: { id: inviteeId },
      data: {
        aiCredits: { increment: credits },
        creditEntries: { create: { credits, reason: 'referral-invitee', friendName: shortInviter(referral.inviter.name) } },
      },
    }),
    prisma.notification.create({
      data: {
        userId: referral.inviterId,
        type: 'referral',
        template: 'referralConfirmed' satisfies Template,
        params: { friend: referral.friendName, credits },
        href: '/rewards/wallet',
      },
    }),
  ]);
}

const shortInviter = (name: string) => {
  const [first, last] = name.trim().split(/\s+/);
  return last ? `${first} ${last[0]}.` : first;
};

/** Closes pending referrals whose 30-day window has passed (shown as "expired" on both sides). */
export async function expireReferrals(now = Date.now()) {
  const { count } = await prisma.referral.updateMany({
    where: { status: 'pending', createdAt: { lt: new Date(now - REFERRAL_WINDOW_DAYS * 86_400_000) } },
    data: { status: 'rejected', rejectReason: 'Didn’t finish a first lesson, quiz or level within 30 days' },
  });
  return count;
}
