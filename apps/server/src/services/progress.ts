import type { Request } from 'express';

import { prisma } from '../db.js';
import { localDayKey, validTimeZone } from '../lib/time.js';
import { joinLeague } from './leagues.js';

/** The learner's time zone, sent by the app (X-Timezone), for day-based things like streaks. */
export const requestTimeZone = (req: Request) => validTimeZone(req.get('x-timezone'));

/**
 * Records meaningful learning activity (not app opens): adds XP and coins, writes the reward
 * history (wallet and streak calendar), and updates the streak in the learner's own time zone.
 * Missing one day keeps the streak alive ("streak freeze") so it rewards consistency without
 * punishing students harshly.
 */
export async function recordActivity(userId: string, reward: { xp: number; coins: number; minutes: number }, opts: { reason?: string; tz?: string } = {}) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const today = localDayKey(new Date(), opts.tz);
  const last = user.lastActiveDate ? user.lastActiveDate.toISOString().slice(0, 10) : null;
  const daysSince = last ? Math.round((Date.parse(today) - Date.parse(last)) / 86_400_000) : null;

  let streak = user.streak;
  if (daysSince === null || daysSince > 2) streak = 1;
  else if (daysSince >= 1) streak += 1;

  const [updated] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: reward.xp },
        coins: { increment: reward.coins },
        streak,
        // Stored as the learner's local date (midnight UTC of that calendar day).
        lastActiveDate: new Date(today),
        todayMinutes: daysSince === 0 ? { increment: reward.minutes } : reward.minutes,
      },
    }),
    ...(reward.xp || reward.coins
      ? [prisma.coinTransaction.create({ data: { userId, xp: reward.xp, coins: reward.coins, reason: opts.reason ?? 'learning' } })]
      : []),
  ]);
  // Earning XP puts you in this week's league (best effort: it never fails the reward).
  if (reward.xp > 0) await joinLeague(userId);
  return updated;
}
