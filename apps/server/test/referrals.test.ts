import { describe, expect, it } from 'vitest';

import { prisma } from '../src/db.js';
import { confirmReferralIfEligible, REFERRAL_MONTHLY_CAP } from '../src/services/referrals.js';
import { http, signIn } from './helpers.js';

async function inviter() {
  return signIn({ email: 'ada@example.com', metadata: { name: 'Ada Bello', consent: { terms: true, privacy: true, age: true } } });
}

describe('referral code entry', () => {
  it('checks codes signed out, showing only a short name', async () => {
    const ada = await inviter();
    const ok = await http().post('/referrals/validate').send({ code: ` ${ada.user.referralCode.toLowerCase()} ` }).expect(200);
    expect(ok.body).toEqual({ valid: true, inviterName: 'Ada B.' });
    expect((await http().post('/referrals/validate').send({ code: 'NOPE123' })).body).toEqual({ valid: false, reason: 'not-found' });
    expect((await http().post('/referrals/validate').send({ code: 'SUMMER25' })).body).toEqual({ valid: false, reason: 'expired' });
    await http().post('/referrals/validate').send({ code: '' }).expect(400);
  });

  it('applies a code once to a new account', async () => {
    const ada = await inviter();
    const amara = await signIn();
    expect((await amara.as.post('/referrals/validate', { code: amara.user.referralCode })).body.reason).toBe('own-code');
    await amara.as.post('/me/referral', { code: ada.user.referralCode }).expect(200);
    const referral = await prisma.referral.findUnique({ where: { inviteeId: amara.sub } });
    expect(referral).toMatchObject({ inviterId: ada.sub, status: 'pending', friendName: 'Amara O.', credits: 5 });
    const again = await amara.as.post('/me/referral', { code: ada.user.referralCode }).expect(409);
    expect(again.body).toEqual({ error: 'This invite code can’t be used', reason: 'already-referred' });
    const missing = await amara.as.post('/me/referral', { code: 'NOPE123' }).expect(404);
    expect(missing.body.reason).toBe('not-found');
  });

  it('refuses accounts that already finished onboarding', async () => {
    const ada = await inviter();
    const amara = await signIn();
    await amara.as.post('/me/onboarding/complete').expect(200);
    const res = await amara.as.post('/me/referral', { code: ada.user.referralCode }).expect(409);
    expect(res.body.reason).toBe('not-new');
  });

  it('stops at the monthly cap', async () => {
    const ada = await inviter();
    for (let i = 0; i < REFERRAL_MONTHLY_CAP; i++) {
      const friend = await signIn({ email: `f${i}@example.com`, metadata: { name: `Friend ${i}` } });
      await prisma.referral.create({
        data: { inviterId: ada.sub, inviteeId: friend.sub, friendName: 'F.', credits: 5, status: 'confirmed', qualifiedAt: new Date() },
      });
    }
    expect((await http().post('/referrals/validate').send({ code: ada.user.referralCode })).body).toEqual({ valid: false, reason: 'cap-reached' });
  });

  it('rewards both people once the new student finishes a first activity', async () => {
    const ada = await inviter();
    const amara = await signIn();
    await amara.as.post('/me/referral', { code: ada.user.referralCode }).expect(200);
    await confirmReferralIfEligible(amara.sub);
    expect((await amara.as.get('/me')).body.user.aiCredits).toBe(10);
    expect((await ada.as.get('/me')).body.user.aiCredits).toBe(10);
    const entries = await prisma.creditEntry.findMany({ where: { userId: ada.sub, reason: 'referral-inviter' } });
    expect(entries).toEqual([expect.objectContaining({ credits: 5, friendName: 'Amara O.' })]);
    expect(await prisma.referral.findUnique({ where: { inviteeId: amara.sub } })).toMatchObject({ status: 'confirmed' });
  });
});
