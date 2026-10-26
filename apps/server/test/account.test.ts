import { describe, expect, it } from 'vitest';

import { outbox } from '../src/services/mailer.js';
import { http, signIn } from './helpers.js';

describe('profile', () => {
  it('updates details and enforces unique, valid usernames', async () => {
    const { as } = await signIn();
    const { body } = await as
      .post('/me/profile', {
        name: 'Amara O.',
        username: 'Amara_Learns',
        school: 'Kings College',
        bio: 'Future doctor',
        photo: { kind: 'initials', color: '#FF7A93' },
      })
      .expect(200);
    expect(body.user).toMatchObject({
      name: 'Amara O.',
      username: 'amara_learns',
      school: 'Kings College',
      photo: { kind: 'initials', color: '#FF7A93' },
    });
    const other = await signIn({ email: 'b@example.com', metadata: { name: 'Bola' } });
    const taken = await other.as.post('/me/profile', { username: 'amara_learns' }).expect(409);
    expect(taken.body.reason).toBe('username-taken');
    await other.as.post('/me/profile', { username: 'no spaces' }).expect(400);
    await other.as.post('/me/profile', { bio: 'x'.repeat(161) }).expect(400);
    const cleared = await as.post('/me/profile', { username: '' }).expect(200);
    expect(cleared.body.user).not.toHaveProperty('username');
  });
});

describe('settings and onboarding', () => {
  it('fills defaults from onboarding answers and merges partial updates', async () => {
    const { as } = await signIn();
    const saved = await as
      .post('/me/personalization', {
        learnerType: 'school',
        dailyMinutes: 30,
        subjects: ['Biology'],
        reminders: { time: '18:30', days: [1, 3], enabled: true },
      })
      .expect(200);
    expect(saved.body.user.dailyGoalMinutes).toBe(30);
    expect((await as.get('/me/personalization')).body.personalization.subjects).toEqual(['Biology']);
    const defaults = await as.get('/me/settings').expect(200);
    expect(defaults.body.settings.reminders[0]).toMatchObject({ time: '18:30', days: [1, 3] });
    expect(defaults.body.settings.privacy.improveAi).toBe(false);
    const patched = await as
      .post('/me/settings', { privacy: { profileVisibility: 'private' }, notifications: { push: false } })
      .expect(200);
    expect(patched.body.settings.privacy).toMatchObject({ profileVisibility: 'private', improveAi: false });
    expect(patched.body.settings.notifications).toMatchObject({ push: false, email: true });
    await as.post('/me/settings', { privacy: { profileVisibility: 'world' } }).expect(400);
  });

  it('makes teachers teachers when onboarding completes', async () => {
    const { as } = await signIn({ email: 't@example.com', metadata: { name: 'Mrs Bello' } });
    await as.post('/me/personalization', { learnerType: 'teacher' }).expect(200);
    const done = await as.post('/me/onboarding/complete').expect(200);
    expect(done.body.user).toMatchObject({ onboardingComplete: true, role: 'teacher' });
  });
});

describe('data export', () => {
  it('exports everything and can email it as an attachment', async () => {
    const { as } = await signIn();
    const { body } = await as.get('/me/export').expect(200);
    expect(Object.keys(body.export)).toEqual(
      expect.arrayContaining(['account', 'personalization', 'settings', 'connections', 'devices', 'coins', 'aiCredits', 'referralsSent']),
    );
    expect(body.export.aiCredits).toEqual([expect.objectContaining({ credits: 5, reason: 'welcome' })]);
    outbox.length = 0;
    await as.post('/me/export/email').expect(200);
    expect(outbox[0].attachments?.[0].filename).toBe('knowzone-data.json');
  });
});

describe('profile photo', () => {
  it('stores an uploaded photo in the database and serves it by its link (179)', async () => {
    const { token } = await signIn();
    const res = await http()
      .post('/me/photo')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from([0xff, 0xd8, 0xff, 0xd9]), { filename: 'me.jpg', contentType: 'image/jpeg' })
      .expect(200);
    const uri: string = res.body.user.photo.uri;
    expect(res.body.user.photo.kind).toBe('photo');
    expect(uri).toMatch(/\/users\/photos\/[\w-]{20,}$/);
    const path = uri.replace(/^https?:\/\/[^/]+/, '');
    expect((await http().get(path).expect(200)).headers['content-type']).toBe('image/jpeg');
    // A new photo replaces the old one, and the old link stops working.
    const again = await http()
      .post('/me/photo')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from([0x89, 0x50, 0x4e, 0x47]), { filename: 'me.png', contentType: 'image/png' })
      .expect(200);
    expect(again.body.user.photo.uri).not.toBe(uri);
    await http().get(path).expect(404);
    await http()
      .post('/me/photo')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('hi'), { filename: 'x.txt', contentType: 'text/plain' })
      .expect(415);
  });
});
