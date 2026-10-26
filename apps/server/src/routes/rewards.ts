import { randomBytes } from 'node:crypto';

import { Router } from 'express';
import { z } from 'zod';

import { DAILY_CYCLE, GAME_REWARD_LIMITS, GAME_REWARD_REASON, REWARD_RULES } from '../data/rewards.js';
import { prisma } from '../db.js';
import { AppError, notFound } from '../lib/errors.js';
import { localDayKey } from '../lib/time.js';
import { recordActivity, requestTimeZone } from '../services/progress.js';
import { confirmReferralIfEligible } from '../services/referrals.js';
import { me, requireAuth } from '../services/sessions.js';
import { levelFor, toPublicUser } from '../services/users.js';

export const rewardsRouter = Router();

/** The catalogue's prices and rules (163); the app uses these over its built-in copy. */
rewardsRouter.get('/rewards/rules', (_req, res) => {
  res.set('Cache-Control', 'public, max-age=300').json({ rules: REWARD_RULES, daily: DAILY_CYCLE });
});

rewardsRouter.use(['/me/wallet', '/me/redeem', '/me/daily-reward', '/me/rewards'], requireAuth);

const ms = (d: Date) => d.getTime();

/** Coin wallet (156), transaction history (157), redemptions (167) and the daily reward cycle (162). */
rewardsRouter.get('/me/wallet', async (req, res) => {
  const user = me(req);
  const [transactions, redemptions] = await Promise.all([
    prisma.coinTransaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 200 }),
    prisma.redemption.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }),
  ]);
  const today = localDayKey(new Date(), requestTimeZone(req));
  res.json({
    wallet: {
      transactions: transactions.map((t) => ({ id: t.id, at: ms(t.createdAt), coins: t.coins, xp: t.xp, reason: t.reason })),
      redemptions: redemptions.map((r) => ({ id: r.id, rewardId: r.rewardId, at: ms(r.createdAt), cost: r.cost, code: r.code })),
      daily: { next: user.dailyNext, claimedToday: user.dailyLast === today, lastClaim: user.dailyLast },
    },
  });
});

/** Why a reward can't be redeemed (168), checked in the learner's local day. */
function blockerFor(rule: (typeof REWARD_RULES)[number], ctx: { coins: number; level: number; owned: boolean; today: string }) {
  if (!rule.repeatable && ctx.owned) return { status: 409, reason: 'owned', message: 'You already have this reward' };
  if (rule.until && ctx.today > rule.until) return { status: 410, reason: 'expired', message: 'This reward is no longer available' };
  if (rule.from && ctx.today < rule.from) return { status: 410, reason: 'not-yet', message: 'This reward isn’t available yet' };
  if (rule.minLevel && ctx.level < rule.minLevel)
    return { status: 403, reason: 'level', message: `Reach level ${rule.minLevel} to redeem this` };
  if (ctx.coins < rule.price)
    return { status: 402, reason: 'insufficient', message: `You need ${rule.price - ctx.coins} more coins` };
  return null;
}

/**
 * Redeem a reward (165, 166). Coins are taken atomically, so two taps can't spend them twice, and
 * every rule is checked here, whatever the app shows.
 */
rewardsRouter.post('/me/redeem', async (req, res) => {
  const user = me(req);
  const { rewardId } = z.object({ rewardId: z.string().max(60) }).parse(req.body);
  const rule = REWARD_RULES.find((r) => r.id === rewardId);
  if (!rule) throw notFound('That reward doesn’t exist');
  const owned = !!(await prisma.redemption.findFirst({ where: { userId: user.id, rewardId }, select: { id: true } }));
  const blocker = blockerFor(rule, {
    coins: user.coins,
    level: levelFor(user.xp).level,
    owned,
    today: localDayKey(new Date(), requestTimeZone(req)),
  });
  if (blocker) throw new AppError(blocker.status, blocker.message, blocker.reason);

  const redemption = await prisma.$transaction(async (tx) => {
    const paid = await tx.user.updateMany({ where: { id: user.id, coins: { gte: rule.price } }, data: { coins: { decrement: rule.price } } });
    if (!paid.count) throw new AppError(402, 'Not enough coins', 'insufficient');
    if (!rule.repeatable && (await tx.redemption.count({ where: { userId: user.id, rewardId } })))
      throw new AppError(409, 'You already have this reward', 'owned');
    await tx.coinTransaction.create({ data: { userId: user.id, xp: 0, coins: -rule.price, reason: `redeem:${rewardId}` } });
    return tx.redemption.create({
      data: { userId: user.id, rewardId, cost: rule.price, code: `KZR-${randomBytes(4).toString('hex').toUpperCase()}` },
    });
  });
  const fresh = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  res.json({
    user: toPublicUser(fresh),
    redemption: { id: redemption.id, rewardId, at: ms(redemption.createdAt), cost: redemption.cost, code: redemption.code },
  });
});

/** Claim today's daily reward (162): once a local day; missing a day pauses the 7-day cycle. */
rewardsRouter.post('/me/daily-reward', async (req, res) => {
  const user = me(req);
  const tz = requestTimeZone(req);
  const today = localDayKey(new Date(), tz);
  const day = user.dailyNext % DAILY_CYCLE.length;
  // Only one claim per day, even with two taps at once.
  const claimed = await prisma.user.updateMany({
    where: { id: user.id, OR: [{ dailyLast: null }, { dailyLast: { not: today } }] },
    data: { dailyLast: today, dailyNext: (day + 1) % DAILY_CYCLE.length },
  });
  if (!claimed.count) throw new AppError(409, 'You’ve already claimed today’s reward', 'claimed');
  const reward = DAILY_CYCLE[day];
  const fresh = await recordActivity(user.id, { xp: reward.xp, coins: reward.coins, minutes: 0 }, { reason: `daily-reward:${day + 1}`, tz });
  res.json({ user: toPublicUser(fresh), reward: { ...reward, day } });
});

const Grant = z.object({
  xp: z.number().int().min(0),
  coins: z.number().int().min(0),
  reason: z.string().regex(GAME_REWARD_REASON, 'Unknown reward'),
});

/**
 * Rewards for Knowzone World levels and quests, which are still checked on the device: each one
 * can be earned once, and amounts are capped. (Everything else is awarded by the server itself.)
 */
rewardsRouter.post('/me/rewards', async (req, res) => {
  const user = me(req);
  const { xp, coins, reason } = Grant.parse(req.body);
  if (xp > GAME_REWARD_LIMITS.xp || coins > GAME_REWARD_LIMITS.coins) throw new AppError(400, 'That reward is too large', 'invalid');
  if (await prisma.coinTransaction.findFirst({ where: { userId: user.id, reason }, select: { id: true } })) {
    res.json({ user: toPublicUser(user), duplicate: true });
    return;
  }
  const fresh = await recordActivity(user.id, { xp, coins, minutes: 1 }, { reason, tz: requestTimeZone(req) });
  // A finished level counts as the first activity that confirms an invite.
  await confirmReferralIfEligible(user.id);
  res.json({ user: toPublicUser(fresh) });
});
