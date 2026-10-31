import { describe, expect, it } from 'vitest';

import { prisma } from '../src/db.js';
import { outbox } from '../src/services/mailer.js';
import { http } from './helpers.js';

describe('website waitlist', () => {
  it('signs people up in order, keeps their place if they sign up again, and emails them once', async () => {
    const join = (email: string, extra: Record<string, unknown> = {}) =>
      http()
        .post('/waitlist')
        .send({ name: 'Amara Obi', email, role: 'student', interests: ['jamb', 'waec'], country: 'Nigeria', ...extra });
    expect((await join('amara@example.com').expect(201)).body).toEqual({ ok: true, position: 1, already: false });
    expect((await join('tobi@example.com', { name: 'Tobi', role: 'parent', interests: [] }).expect(201)).body.position).toBe(2);
    // Same email, different case: same place in line, no second email.
    expect((await join('AMARA@example.com').expect(200)).body).toEqual({ ok: true, position: 1, already: true });
    expect(outbox.filter((e) => e.subject.includes('waitlist')).map((e) => e.to)).toEqual(['amara@example.com', 'tobi@example.com']);
    expect(outbox[0]!.text).toContain('Hi Amara');
    expect(await prisma.waitlistEntry.findUnique({ where: { email: 'amara@example.com' } })).toMatchObject({
      role: 'student',
      interests: ['jamb', 'waec'],
      country: 'Nigeria',
    });
  });

  it('checks what people send, and quietly drops bots', async () => {
    await http().post('/waitlist').send({ name: 'X', email: 'not-an-email', role: 'student' }).expect(400);
    await http().post('/waitlist').send({ name: 'X', email: 'x@example.com', role: 'alien' }).expect(400);
    await http().post('/waitlist').send({ name: 'Bot', email: 'bot@example.com', role: 'student', website: 'http://spam' }).expect(201);
    expect(await prisma.waitlistEntry.count()).toBe(0);
  });
});
