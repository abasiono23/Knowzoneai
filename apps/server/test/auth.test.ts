import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { prisma } from '../src/db.js';
import { purgeDeletedAccounts } from '../src/services/jobs.js';
import { authed, CONSENT, http, signIn, supabaseToken } from './helpers.js';

describe('Supabase access tokens', () => {
  it('creates the app profile on first contact, with welcome credits and sign-up consent', async () => {
    const { user, sub } = await signIn();
    expect(user).toMatchObject({
      id: sub,
      name: 'Amara Okeke',
      email: 'amara@example.com',
      authProvider: 'email',
      emailVerified: true,
      termsAccepted: true,
      onboardingComplete: false,
      role: 'learner',
      aiCredits: 5,
      plan: 'FREE',
      level: 1,
    });
    expect(user.referralCode).toMatch(/^[A-Z2-9]{7}$/);
    const entries = await prisma.creditEntry.findMany({ where: { userId: sub } });
    expect(entries).toEqual([expect.objectContaining({ credits: 5, reason: 'welcome' })]);
  });

  it('only provisions once, even when the first requests arrive together', async () => {
    const token = await supabaseToken({ metadata: { name: 'Ada' } });
    const results = await Promise.all([1, 2, 3].map(() => authed(token).get('/me')));
    expect(results.map((r) => r.status)).toEqual([200, 200, 200]);
    expect(await prisma.user.count()).toBe(1);
    expect(await prisma.creditEntry.count()).toBe(1);
  });

  it('rejects tokens that are unsigned, expired, or for another project or audience', async () => {
    await http().get('/me').expect(401, { error: 'Please sign in' });
    for (const token of [
      'not-a-jwt',
      await supabaseToken({ expiresIn: '-1m' }),
      await supabaseToken({ issuer: 'https://someone-else.supabase.co/auth/v1' }),
      await supabaseToken({ audience: 'anon' }),
    ]) {
      const res = await authed(token).get('/me').expect(401);
      expect(res.body.error).toMatch(/expired/);
    }
    expect(await prisma.user.count()).toBe(0);
  });

  it('records Google and Apple sign-ups and needs consent afterwards', async () => {
    const { user, as } = await signIn({
      email: 'tobi@gmail.com',
      provider: 'google',
      metadata: { full_name: 'Tobi Ade', email_verified: true },
    });
    expect(user).toMatchObject({ name: 'Tobi Ade', authProvider: 'google', termsAccepted: false, emailVerified: true });
    const conn = await as.get('/me/connections').expect(200);
    expect(conn.body.connections).toMatchObject({ google: { email: 'tobi@gmail.com' }, apple: null });
    const consent = await as.post('/me/consent', CONSENT).expect(200);
    expect(consent.body.user.termsAccepted).toBe(true);
    await as.post('/me/consent', { ...CONSENT, age: false }).expect(200);
    expect((await as.get('/me')).body.user.termsAccepted).toBe(false);
  });

  it('keeps the email and linked providers in step with Supabase', async () => {
    const { sub } = await signIn();
    const later = await supabaseToken({ sub, email: 'new@example.com', providers: ['email', 'google'] });
    const { body } = await authed(later).get('/me/connections').expect(200);
    expect(body.connections).toMatchObject({ email: { address: 'new@example.com', hasPassword: true }, google: { email: 'new@example.com' } });
  });
});

describe('device sessions', () => {
  it('lists each Supabase session as a device and signs others out for real', async () => {
    const { sub, as } = await signIn();
    const phone = await supabaseToken({ sub });
    await authed(phone).get('/me').set('X-Platform', 'android').set('X-Device-Name', 'Tecno Spark 20').expect(200);
    const list = await as.get('/me/sessions').expect(200);
    expect(list.body.sessions).toHaveLength(2);
    expect(list.body.sessions).toContainEqual(expect.objectContaining({ device: 'Tecno Spark 20', platform: 'android', current: false }));
    await as.post('/me/sessions/revoke', { id: 'others' }).expect(200);
    // The phone's refreshed tokens keep the same session id, so it stays signed out.
    await authed(phone).get('/me').expect(401);
    await as.get('/me').expect(200);
  });

  it('logs this device out', async () => {
    const { token, as } = await signIn();
    await as.post('/me/logout').expect(200);
    await authed(token).get('/me').expect(401);
  });
});

describe('account deletion', () => {
  it('schedules deletion, cancels it on a new sign-in and purges when due', async () => {
    const { sub, as } = await signIn();
    const { body } = await as.post('/me/delete', { reason: 'Not using it' }).expect(200);
    expect(body.deleteAt).toBeGreaterThan(Date.now() + 13 * 86400000);
    await as.get('/me').expect(401);
    // Signing in again (a new Supabase session) cancels the request.
    await authed(await supabaseToken({ sub })).get('/me').expect(200);
    expect((await prisma.user.findUnique({ where: { id: sub } }))?.deleteAt).toBeNull();

    await prisma.user.update({ where: { id: sub }, data: { deleteAt: new Date(Date.now() - 1000) } });
    expect(await purgeDeletedAccounts()).toBe(1);
    expect(await prisma.user.count()).toBe(0);
  });
});

describe('profile ids', () => {
  it('uses the Supabase user id as the profile id', async () => {
    const sub = randomUUID();
    await signIn({ sub });
    expect(await prisma.user.findUnique({ where: { id: sub } })).not.toBeNull();
  });
});
