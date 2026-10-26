import { describe, expect, it } from 'vitest';

import { prisma } from '../src/db.js';
import { confirmReferralIfEligible } from '../src/services/referrals.js';
import { http, signIn } from './helpers.js';

const give = (id: string, data: { coins?: number; xp?: number }) => prisma.user.update({ where: { id }, data });

describe('wallet and rewards', () => {
  it('serves the catalogue rules and an empty wallet (155–158, 163)', async () => {
    const rules = (await http().get('/rewards/rules').expect(200)).body;
    expect(rules.rules.find((r: { id: string }) => r.id === 'frame-gold')).toMatchObject({ price: 120 });
    expect(rules.daily).toHaveLength(7);
    const { as } = await signIn();
    const w = (await as.get('/me/wallet').expect(200)).body.wallet;
    expect(w).toMatchObject({ transactions: [], redemptions: [], daily: { next: 0, claimedToday: false } });
    await http().get('/me/wallet').expect(401);
  });

  it('pays the daily reward once per local day and moves the cycle on (162)', async () => {
    const { as } = await signIn();
    const res = await as.post('/me/daily-reward').set('X-Timezone', 'Africa/Lagos').expect(200);
    expect(res.body.reward).toMatchObject({ day: 0, coins: 5, xp: 10 });
    expect(res.body.user).toMatchObject({ coins: 5, xp: 10, streak: 1 });
    const again = await as.post('/me/daily-reward').set('X-Timezone', 'Africa/Lagos').expect(409);
    expect(again.body.reason).toBe('claimed');
    const w = (await as.get('/me/wallet').set('X-Timezone', 'Africa/Lagos')).body.wallet;
    expect(w.daily).toMatchObject({ next: 1, claimedToday: true });
    expect(w.transactions[0]).toMatchObject({ coins: 5, xp: 10, reason: 'daily-reward:1' });
  });

  it('redeems rewards with server-checked rules, atomically (164–168)', async () => {
    const { as, sub } = await signIn();
    const poor = await as.post('/me/redeem', { rewardId: 'frame-gold' }).expect(402);
    expect(poor.body.reason).toBe('insufficient');
    await give(sub, { coins: 300, xp: 0 });
    // Level 5 needed; level 1 has it locked.
    expect((await as.post('/me/redeem', { rewardId: 'frame-kente' }).expect(403)).body.reason).toBe('level');
    expect((await as.post('/me/redeem', { rewardId: 'frame-independence' }).expect(410)).body.reason).toMatch(/expired|not-yet/);
    await as.post('/me/redeem', { rewardId: 'nope' }).expect(404);

    const ok = await as.post('/me/redeem', { rewardId: 'frame-gold' }).expect(200);
    expect(ok.body.redemption).toMatchObject({ rewardId: 'frame-gold', cost: 120, code: expect.stringMatching(/^KZR-[0-9A-F]{8}$/) });
    expect(ok.body.user.coins).toBe(180);
    expect((await as.post('/me/redeem', { rewardId: 'frame-gold' }).expect(409)).body.reason).toBe('owned');
    // Boosts can be redeemed again.
    await as.post('/me/redeem', { rewardId: 'boost-freeze' }).expect(200);
    await as.post('/me/redeem', { rewardId: 'boost-freeze' }).expect(200);

    // Two taps at once can't spend the same coins twice.
    await give(sub, { coins: 40 });
    const both = await Promise.all([
      as.post('/me/redeem', { rewardId: 'boost-freeze' }),
      as.post('/me/redeem', { rewardId: 'boost-freeze' }),
    ]);
    expect(both.map((r) => r.status).sort()).toEqual([200, 402]);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: sub } })).coins).toBe(0);

    const w = (await as.get('/me/wallet')).body.wallet;
    expect(w.redemptions.map((r: { rewardId: string }) => r.rewardId)).toEqual(['boost-freeze', 'boost-freeze', 'boost-freeze', 'frame-gold']);
    expect(w.transactions.filter((t: { reason: string }) => t.reason.startsWith('redeem:'))).toHaveLength(4);
  });

  it('accepts only capped, one-off game and quest rewards from the app', async () => {
    const { as } = await signIn();
    const first = await as.post('/me/rewards', { xp: 50, coins: 20, reason: 'game:level-1' }).expect(200);
    expect(first.body.user).toMatchObject({ xp: 50, coins: 20 });
    const again = await as.post('/me/rewards', { xp: 50, coins: 20, reason: 'game:level-1' }).expect(200);
    expect(again.body).toMatchObject({ duplicate: true, user: { xp: 50, coins: 20 } });
    await as.post('/me/rewards', { xp: 5000, coins: 0, reason: 'game:level-2' }).expect(400);
    await as.post('/me/rewards', { xp: 10, coins: 10, reason: 'course:biology' }).expect(400);
    await as.post('/me/rewards', { xp: 0, coins: -50, reason: 'quest:q1' }).expect(400);
  });

  it('records learning in the reward history (157, 161)', async () => {
    const { as, sub } = await signIn();
    await as.post('/me/rewards', { xp: 30, coins: 10, reason: 'quest:first-steps' }).expect(200);
    const t = await prisma.coinTransaction.findMany({ where: { userId: sub } });
    expect(t).toEqual([expect.objectContaining({ xp: 30, coins: 10, reason: 'quest:first-steps' })]);
  });
});

describe('referral dashboard', () => {
  it('shows the code, invited friends, credit history and the invitee’s pending reward (169–175)', async () => {
    const ada = await signIn({ email: 'ada.ref@example.com', metadata: { name: 'Ada Bello', consent: { terms: true, privacy: true, age: true } } });
    const amara = await signIn();
    await amara.as.post('/me/referral', { code: ada.user.referralCode }).expect(200);

    const pending = (await ada.as.get('/me/referrals').expect(200)).body;
    expect(pending).toMatchObject({
      code: ada.user.referralCode,
      link: expect.stringMatching(new RegExp(`/invite/${ada.user.referralCode}$`)),
      rewardCredits: 5,
      monthlyCap: 10,
      confirmedThisMonth: 0,
      invitedBy: null,
    });
    expect(pending.referrals).toEqual([expect.objectContaining({ friendName: 'Amara O.', status: 'pending', credits: 5 })]);
    expect(pending.credits.map((c: { reason: string }) => c.reason)).toEqual(['welcome']);

    const mine = (await amara.as.get('/me/referrals')).body;
    expect(mine.invitedBy).toMatchObject({ inviterName: 'Ada B.', status: 'pending' });

    await confirmReferralIfEligible(amara.sub);
    const after = (await ada.as.get('/me/referrals')).body;
    expect(after).toMatchObject({ confirmedThisMonth: 1 });
    expect(after.referrals[0].status).toBe('confirmed');
    expect(after.credits[0]).toMatchObject({ credits: 5, reason: 'referral-inviter', friendName: 'Amara O.' });
    expect((await amara.as.get('/me/referrals')).body.invitedBy.status).toBe('confirmed');
  });

  it('expires invites not completed within 30 days', async () => {
    const ada = await signIn({ email: 'ada.exp@example.com', metadata: { name: 'Ada Bello', consent: { terms: true, privacy: true, age: true } } });
    const amara = await signIn();
    await amara.as.post('/me/referral', { code: ada.user.referralCode }).expect(200);
    await prisma.referral.updateMany({ where: { inviteeId: amara.sub }, data: { createdAt: new Date(Date.now() - 31 * 86_400_000) } });
    const r = (await ada.as.get('/me/referrals')).body.referrals[0];
    expect(r).toMatchObject({ status: 'rejected', rejectReason: expect.stringContaining('30 days') });
  });

  it('a first finished game level confirms a pending invite', async () => {
    const ada = await signIn({ email: 'ada.game@example.com', metadata: { name: 'Ada Bello', consent: { terms: true, privacy: true, age: true } } });
    const amara = await signIn();
    await amara.as.post('/me/referral', { code: ada.user.referralCode }).expect(200);
    await amara.as.post('/me/rewards', { xp: 20, coins: 5, reason: 'game:level-1' }).expect(200);
    expect((await prisma.referral.findUniqueOrThrow({ where: { inviteeId: amara.sub } })).status).toBe('confirmed');
  });
});
