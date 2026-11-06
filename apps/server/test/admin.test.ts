import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { config } from '../src/config.js';
import { prisma } from '../src/db.js';
import { adminRouter } from '../src/routes/admin.js';
import { adminLibraryRouter } from '../src/routes/admin-library.js';
import { adminSettingsRouter } from '../src/routes/admin-settings.js';
import { CONSENT, http, signIn, supabaseToken } from './helpers.js';

const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const ADMIN = `boss-${unique()}@example.com`;
let boss: Awaited<ReturnType<typeof signIn>>;
let learner: Awaited<ReturnType<typeof signIn>>;
let learnerId: string;
const before = config.ADMIN_EMAILS;

const as = (who: { token: string }, method: 'get' | 'post' | 'delete', url: string) =>
  http()[method](url).set('Authorization', `Bearer ${who.token}`);

beforeEach(async () => {
  config.ADMIN_EMAILS = ` ${ADMIN.toUpperCase()} , other@example.com`;
  boss = await signIn({ email: ADMIN, metadata: { consent: CONSENT } });
  learner = await signIn({ email: `learner-${unique()}@example.com`, metadata: { name: 'Ada', consent: CONSENT } });
  learnerId = learner.sub;
});
afterAll(() => {
  config.ADMIN_EMAILS = before;
});

describe('who gets in', () => {
  it('turns away people who aren’t signed in', async () => {
    await http().get('/admin/overview').expect(401);
  });

  it('turns away learners from every part of it', async () => {
    for (const url of ['/admin/me', '/admin/overview', '/admin/users', '/admin/tickets', '/admin/waitlist.csv'])
      await as(learner, 'get', url).expect(403);
    await as(learner, 'post', `/admin/users/${learnerId}/restriction`)
      .send({ kind: 'suspended', reason: 'Not allowed' })
      .expect(403);
  });

  it('lets nobody in when no staff are set', async () => {
    config.ADMIN_EMAILS = '';
    await as(boss, 'get', '/admin/me').expect(403);
    config.ADMIN_EMAILS = ADMIN;
    await as(boss, 'get', '/admin/me').expect(200);
  });
});

describe('a normal account can’t get in', () => {
  /** Every route the staff dashboard has, read from the routers, so a new one can't be missed. */
  const routes = [adminRouter, adminLibraryRouter, adminSettingsRouter].flatMap((router) =>
    (router.stack as { route?: { path: string; methods: Record<string, boolean> } }[]).flatMap((layer) =>
      layer.route
        ? Object.keys(layer.route.methods).map((method) => ({
            method: method as 'get' | 'post' | 'delete',
            url: layer.route!.path.replace(/:\w+/g, 'x'),
          }))
        : [],
    ),
  );

  it('finds the routes it’s checking', () => {
    expect(routes.length).toBeGreaterThan(20);
    expect(routes.map((r) => r.url)).toEqual(expect.arrayContaining(['/admin/users', '/admin/library/hide']));
  });

  it('refuses every route without a sign-in, and with a normal account', async () => {
    for (const { method, url } of routes) {
      await http()[method](url).expect(401);
      await as(learner, method, url).expect(403);
    }
  });

  it('changes nothing when a normal account tries', async () => {
    await as(learner, 'post', '/admin/library/hide')
      .send({ kind: 'book', id: 'x', title: 'x', reason: 'Because' })
      .expect(403);
    expect(await prisma.hiddenContent.count()).toBe(0);
    await as(learner, 'post', `/admin/users/${boss.sub}/restriction`)
      .send({ kind: 'suspended', reason: 'Takeover' })
      .expect(403);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: boss.sub } })).restriction).toBeNull();
  });

  it('isn’t fooled by emails that only look like a staff one', async () => {
    const [name, domain] = ADMIN.split('@');
    for (const email of [`x${ADMIN}`, `${ADMIN}.evil.com`, `${name}+staff@${domain}`, `${name}@evil.com`]) {
      const who = await signIn({ email, metadata: { consent: CONSENT } });
      await as(who, 'get', '/admin/me').expect(403);
    }
  });

  it('isn’t fooled by a staff email put in the part of the account a person can edit', async () => {
    const who = await signIn({
      email: `spoof-${unique()}@example.com`,
      metadata: { consent: CONSENT, email: ADMIN, email_verified: true, role: 'admin' } as never,
    });
    await as(who, 'get', '/admin/me').expect(403);
  });

  it('refuses a token that didn’t come from Supabase, even with a staff email', async () => {
    const { privateKey, publicKey } = await generateKeyPair('ES256');
    await exportJWK(publicKey);
    const forged = await new SignJWT({ email: ADMIN, session_id: crypto.randomUUID(), role: 'authenticated' })
      .setProtectedHeader({ alg: 'ES256', kid: 'test-key-1' })
      .setSubject(boss.sub)
      .setIssuer('https://test-project.supabase.co/auth/v1')
      .setAudience('authenticated')
      .setExpirationTime('1h')
      .sign(privateKey);
    await as({ token: forged }, 'get', '/admin/me').expect(401);
    const unsigned = `${btoa(JSON.stringify({ alg: 'none' }))}.${btoa(JSON.stringify({ email: ADMIN, sub: boss.sub }))}.`;
    await as({ token: unsigned }, 'get', '/admin/me').expect(401);
    await as(
      { token: await supabaseToken({ email: ADMIN, issuer: 'https://evil.example/auth/v1' }) },
      'get',
      '/admin/me',
    ).expect(401);
    await as({ token: await supabaseToken({ email: ADMIN, audience: 'anon' }) }, 'get', '/admin/me').expect(401);
    await as(
      { token: await supabaseToken({ email: ADMIN, sub: boss.sub, expiresIn: '1 hour ago' }) },
      'get',
      '/admin/me',
    ).expect(401);
  });

  it('loses access as soon as the email leaves the list', async () => {
    await as(boss, 'get', '/admin/me').expect(200);
    config.ADMIN_EMAILS = 'someone-else@example.com';
    await as(boss, 'get', '/admin/me').expect(403);
  });

  it('can’t become staff by editing their own profile', async () => {
    for (const body of [{ email: ADMIN }, { role: 'admin' }, { isAdmin: true }])
      await as(learner, 'patch' as never, '/me').send(body);
    await as(learner, 'get', '/admin/me').expect(403);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: learner.sub } })).email).toBe(learner.user.email);
  });
});

describe('the overview and people', () => {
  it('counts what staff need to see', async () => {
    const { body } = await as(boss, 'get', '/admin/overview').expect(200);
    expect(body.users.total).toBeGreaterThanOrEqual(2);
    expect(body.queues).toHaveProperty('support');
    expect(body.content.summaries).toBeGreaterThan(0);
  });

  it('finds a learner, without their personal study data', async () => {
    const found = await as(boss, 'get', `/admin/users?q=${encodeURIComponent(learner.user.email)}`).expect(200);
    expect(found.body.items.map((u: { id: string }) => u.id)).toEqual([learnerId]);
    const { body } = await as(boss, 'get', `/admin/users/${learnerId}`).expect(200);
    expect(body.email).toBe(learner.user.email);
    for (const secret of ['personalization', 'settings', 'photo', 'bio', 'tutorChats', 'tutorNotes'])
      expect(body).not.toHaveProperty(secret);
  });

  it('suspends and lifts, and the suspension really applies', async () => {
    await as(boss, 'post', `/admin/users/${learnerId}/restriction`)
      .send({ kind: 'suspended', reason: 'Testing the rules', days: 7 })
      .expect(200);
    await as(learner, 'get', '/me/library').expect(403);
    await as(boss, 'delete', `/admin/users/${learnerId}/restriction`).expect(200);
    await as(learner, 'get', '/me/library').expect(200);
  });

  it('won’t let staff suspend themselves', async () => {
    await as(boss, 'post', `/admin/users/${boss.sub}/restriction`)
      .send({ kind: 'suspended', reason: 'By mistake' })
      .expect(403);
  });
});

describe('support', () => {
  it('answers a request and the learner is told', async () => {
    const id = `KZ-${Math.floor(Math.random() * 900000) + 100000}`;
    await prisma.helpTicket.create({
      data: {
        id,
        userId: learnerId,
        kind: 'contact',
        subject: 'Help please',
        messages: { create: { from: 'me', text: 'Hi' } },
      },
    });
    const list = await as(boss, 'get', '/admin/tickets?status=open').expect(200);
    expect(list.body.items.map((t: { id: string }) => t.id)).toContain(id);
    await as(boss, 'post', `/admin/tickets/${id}/reply`).send({ text: 'Happy to help', resolve: true }).expect(200);
    const { body } = await as(boss, 'get', `/admin/tickets/${id}`).expect(200);
    expect(body.status).toBe('resolved');
    expect(body.messages.at(-1)).toMatchObject({ from: 'support', text: 'Happy to help', staff: ADMIN });
    expect(await prisma.notification.count({ where: { userId: learnerId, template: 'ticketReply' } })).toBeGreaterThan(
      0,
    );
  });

  it('accepting an appeal lifts the restriction, and only appeals can be decided', async () => {
    const id = `KZ-${Math.floor(Math.random() * 900000) + 100000}`;
    await prisma.user.update({
      where: { id: learnerId },
      data: { restriction: { kind: 'restricted', reason: 'x', at: Date.now(), limits: ['sharing'] } },
    });
    await prisma.helpTicket.create({ data: { id, userId: learnerId, kind: 'appeal', subject: 'Appeal' } });
    await as(boss, 'post', `/admin/tickets/${id}/appeal`)
      .send({ decision: 'accept', text: 'You’re right' })
      .expect(200);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: learnerId } });
    expect(user.restriction).toBeNull();

    const other = `KZ-${Math.floor(Math.random() * 900000) + 100000}`;
    await prisma.helpTicket.create({ data: { id: other, userId: learnerId, kind: 'contact', subject: 'Not one' } });
    await as(boss, 'post', `/admin/tickets/${other}/appeal`).send({ decision: 'accept', text: 'No' }).expect(404);
  });
});

describe('the waitlist export', () => {
  it('stops a sign-up from running as a spreadsheet formula', async () => {
    const email = `csv-${unique()}@example.com`;
    await prisma.waitlistEntry.create({
      data: { email, name: '=HYPERLINK("http://x")', role: 'student', interests: [] },
    });
    const { text } = await as(boss, 'get', '/admin/waitlist.csv').expect(200);
    const line = text.split('\n').find((l: string) => l.includes(email))!;
    expect(line.startsWith(`"'=HYPERLINK(""http://x"")"`)).toBe(true);
  });
});
