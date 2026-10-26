import { describe, expect, it } from 'vitest';

import { prisma } from '../src/db.js';
import { staffReply, TICKETS_PER_HOUR } from '../src/services/help.js';
import { http, signIn } from './helpers.js';

const shot = (token: string, buf: Buffer, filename: string, contentType: string) =>
  http().post('/me/help/attachments').set('Authorization', `Bearer ${token}`).attach('file', buf, { filename, contentType });

const ticket = (as: Awaited<ReturnType<typeof signIn>>['as'], body: object = {}) =>
  as.post('/me/help/tickets', {
    kind: 'support',
    topic: 'account',
    subject: 'Can’t change my email',
    message: 'The save button does nothing when I tap it.',
    ...body,
  });

describe('support tickets (221–224)', () => {
  it('opens a request with an automatic reply the app translates, and keeps the thread', async () => {
    const { as } = await signIn();
    const res = await ticket(as).expect(201);
    expect(res.body.ticket).toMatchObject({ id: expect.stringMatching(/^KZ-\d{6}$/), kind: 'support', topic: 'account', status: 'open' });
    expect(res.body.ticket.messages).toHaveLength(2);
    expect(res.body.ticket.messages[0]).toMatchObject({ from: 'me', text: 'The save button does nothing when I tap it.' });
    expect(res.body.ticket.messages[1]).toMatchObject({ from: 'support', template: 'ack' });

    const id = res.body.ticket.id;
    await as.post('/me/help/tickets/close', { id }).expect(200);
    const reopened = await as.post('/me/help/tickets/reply', { id, text: 'Still broken today' }).expect(200);
    expect(reopened.body.ticket).toMatchObject({ status: 'open' });
    expect(reopened.body.ticket.messages.at(-1)).toMatchObject({ from: 'me', text: 'Still broken today' });
    expect((await as.get('/me/help/tickets').expect(200)).body.tickets.map((t: { id: string }) => t.id)).toEqual([id]);
  });

  it('files feedback as resolved, checks input and only accepts its own kinds', async () => {
    const { as } = await signIn();
    const fb = await ticket(as, { kind: 'feedback', subject: 'Idea', message: 'Please add a dark mode timer.', meta: { rating: '5' } }).expect(201);
    expect(fb.body.ticket).toMatchObject({ status: 'resolved', meta: { rating: '5' } });
    await ticket(as, { subject: 'x' }).expect(400);
    await ticket(as, { message: 'short' }).expect(400);
    await ticket(as, { kind: 'appeal' }).expect(400);
  });

  it('lets staff reply, which notifies the learner and waits for them', async () => {
    const { as, sub } = await signIn();
    const res = await ticket(as).expect(201);
    await staffReply(res.body.ticket.id, 'Try signing out and in again.', { staff: 'ada' });
    const t = (await as.get('/me/help/tickets')).body.tickets[0];
    expect(t).toMatchObject({ status: 'waiting' });
    expect(t.messages.at(-1)).toEqual(expect.objectContaining({ from: 'support', text: 'Try signing out and in again.' }));
    expect(t.messages.at(-1).staff).toBeUndefined();
    const n = await prisma.notification.findFirst({ where: { userId: sub, template: 'ticketReply' } });
    expect(n).toMatchObject({ href: `/help/ticket/${t.id}` });
  });

  it('stores bug screenshots in the database and slows down floods', async () => {
    const { as, token } = await signIn();
    const png = Buffer.from('89504e470d0a1a0a0000000d4948445200000001000000010806000000', 'hex');
    const up = await shot(token, png, 'shot.png', 'image/png').expect(201);
    const path = new URL(up.body.url).pathname;
    const file = await http().get(path).expect(200);
    expect(file.headers['content-type']).toBe('image/png');
    await shot(token, Buffer.from('hi'), 'a.txt', 'text/plain').expect(415);

    for (let i = 1; i < TICKETS_PER_HOUR; i++) await ticket(as, { kind: 'bug', meta: { screenshot: up.body.url } }).expect(201);
    await ticket(as, { kind: 'bug' }).expect(201);
    expect((await ticket(as).expect(429)).body.reason).toBe('rate-limited');
  });

  it('keeps tickets private', async () => {
    const { as } = await signIn();
    const res = await ticket(as).expect(201);
    const other = await signIn({ email: 'tunde@example.com' });
    await other.as.post('/me/help/tickets/reply', { id: res.body.ticket.id, text: 'hi' }).expect(404);
    expect((await other.as.get('/me/help/tickets')).body.tickets).toEqual([]);
    await http().get('/me/help/tickets').expect(401);
  });
});

describe('reports, blocking and hidden content (225, 231)', () => {
  it('reports to moderation, hides the item and blocks the person', async () => {
    const { as } = await signIn();
    const r = await as
      .post('/me/report', { type: 'player', id: 'p-77', title: 'Bolu', reason: 'Bullying', details: 'Mean messages in battles', hide: true, block: true })
      .expect(201);
    expect(r.body.ticket).toMatchObject({ kind: 'report', topic: 'safety', meta: { type: 'player', itemId: 'p-77', reason: 'Bullying' } });
    expect(r.body.safety.blockedUsers).toEqual([expect.objectContaining({ id: 'p-77', name: 'Bolu' })]);
    expect(r.body.safety.hidden).toEqual([expect.objectContaining({ type: 'player', id: 'p-77' })]);

    // Follows the account to another device.
    expect((await as.get('/me/safety')).body.safety.blockedUsers).toHaveLength(1);
    await as.post('/me/safety/unblock', { id: 'p-77' }).expect(200);
    const after = await as.post('/me/safety/unhide', { type: 'player', id: 'p-77' }).expect(200);
    expect(after.body.safety).toEqual({ blockedUsers: [], hidden: [] });

    await as.post('/me/safety/block', { id: 'p-9', name: 'Kemi' }).expect(200);
    await as.post('/me/safety/block', { id: 'p-9', name: 'Kemi' }).expect(200);
    expect((await as.get('/me/safety')).body.safety.blockedUsers).toHaveLength(1);
    await as.post('/me/report', { type: 'spaceship', id: 'x', reason: 'Spam' }).expect(400);
  });
});

describe('copyright notices (230)', () => {
  const notice = {
    name: 'Ada Publisher',
    email: 'rights@example.com',
    work: 'Chapter 3 of my chemistry textbook',
    location: 'Video “Moles made easy”',
    statement: 'true',
  };

  it('accepts notices from anyone and gives a reference; signed-in senders also get a ticket', async () => {
    const anon = await http().post('/legal/copyright').send(notice).expect(201);
    expect(anon.body.reference).toMatch(/^CR-\d{6}$/);
    expect(await prisma.copyrightNotice.findUnique({ where: { reference: anon.body.reference } })).toMatchObject({ userId: null, status: 'open' });

    const { as, sub } = await signIn();
    const mine = await as.post('/legal/copyright', notice).expect(201);
    expect(await prisma.helpTicket.findFirst({ where: { userId: sub, kind: 'copyright' } })).toMatchObject({ meta: { reference: mine.body.reference } });

    await http()
      .post('/legal/copyright')
      .send({ ...notice, statement: 'false' })
      .expect(400);
    await http()
      .post('/legal/copyright')
      .send({ ...notice, email: 'nope' })
      .expect(400);
  });
});

describe('restricted and suspended accounts (232)', () => {
  it('suspension blocks everything but status, help, settings, data and appeals; an appeal goes in once', async () => {
    const { as, sub } = await signIn();
    await prisma.user.update({ where: { id: sub }, data: { restriction: { kind: 'suspended', reason: 'Repeated bullying', at: Date.now() } } });

    expect((await as.get('/me').expect(200)).body.user.restriction).toMatchObject({ kind: 'suspended', reason: 'Repeated bullying' });
    expect((await as.get('/me/library').expect(403)).body.reason).toBe('suspended');
    expect((await as.get('/me/billing').expect(403)).body.reason).toBe('suspended');
    await as.get('/me/help/tickets').expect(200);
    await as.get('/me/export').expect(200);

    await as.post('/me/appeal', { message: 'too short' }).expect(400);
    const appeal = await as.post('/me/appeal', { message: 'I was defending a friend and did not bully anyone. Please review the chat.' }).expect(201);
    expect(appeal.body.user.restriction.appeal).toMatchObject({ status: 'pending', ticketId: appeal.body.ticket.id });
    expect(appeal.body.ticket.kind).toBe('appeal');
    expect((await as.post('/me/appeal', { message: 'Please, again, I really did not do anything wrong here.' }).expect(409)).body.reason).toBe(
      'appeal-pending',
    );
  });

  it('lifts temporary restrictions on their own, and refuses appeals from accounts in good standing', async () => {
    const { as, sub } = await signIn();
    expect((await as.post('/me/appeal', { message: 'Nothing is wrong but I want to appeal anyway, thanks.' }).expect(409)).body.reason).toBe('not-restricted');
    await prisma.user.update({
      where: { id: sub },
      data: { restriction: { kind: 'suspended', reason: 'Spam', at: Date.now() - 2000, until: Date.now() - 1000 } },
    });
    await as.get('/me/library').expect(200);
    expect((await as.get('/me')).body.user.restriction).toBeUndefined();
  });
});
