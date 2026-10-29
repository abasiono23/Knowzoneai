import { describe, expect, it, vi } from 'vitest';

import { prisma } from '../src/db.js';
import { signIn } from './helpers.js';

// Moderation: anything containing "nasty" is flagged.
vi.mock('../src/services/ai.js', async (original) => ({
  ...(await original<typeof import('../src/services/ai.js')>()),
  openaiClient: () => ({
    moderations: { create: async ({ input }: { input: string }) => ({ results: [{ flagged: /nasty/i.test(input) }] }) },
  }),
}));

type As = Awaited<ReturnType<typeof signIn>>['as'];
const person = (email: string, name: string, school?: string) =>
  signIn({ email, metadata: { name } }).then(async (p) => {
    if (school) await prisma.user.update({ where: { id: p.user.id }, data: { school } });
    return p;
  });
const befriend = (a: string, b: string) => prisma.friendship.create({ data: { requesterId: a, addresseeId: b, status: 'accepted' } });
const state = async (as: As, id: string, since?: number) => (await as.get(`/me/study-rooms/${id}${since ? `?since=${since}` : ''}`).expect(200)).body;

describe('Study Rooms', () => {
  it('creates a room with a code, invites friends (with a notification) and lets people join by code', async () => {
    const ada = await person('ada@example.com', 'Ada Obi');
    const tobi = await person('tobi@example.com', 'Tobi Ade');
    const stranger = await person('s@example.com', 'Sam Lee');
    await befriend(ada.user.id, tobi.user.id);

    const { room } = (await ada.as.post('/me/study-rooms', { name: 'Physics squad', subject: 'Physics' }).expect(201)).body;
    expect(room.code).toMatch(/^KZ-[A-Z2-9]{4}$/);
    expect((await ada.as.post('/me/study-rooms', { name: 'A nasty name' }).expect(422)).body.reason).toBe('blocked');

    // Invites only go to friends.
    expect((await ada.as.post(`/me/study-rooms/${room.id}/invite`, { friends: [tobi.user.id, stranger.user.id] }).expect(200)).body.sent).toBe(1);
    const inbox = (await tobi.as.get('/me/study-rooms').expect(200)).body;
    expect(inbox.invites).toHaveLength(1);
    expect(inbox.invites[0]).toMatchObject({ from: 'Ada', room: { name: 'Physics squad', members: 1 } });
    expect(await prisma.notification.count({ where: { userId: tobi.user.id, template: 'studyRoomInvite' } })).toBe(1);

    // A stranger can't open or join it without the code; the invited friend can join from the invite.
    await stranger.as.get(`/me/study-rooms/${room.id}`).expect(404);
    await stranger.as.post('/me/study-rooms/join', { roomId: room.id }).expect(404);
    await tobi.as.post('/me/study-rooms/join', { roomId: room.id }).expect(200);
    expect((await tobi.as.get('/me/study-rooms').expect(200)).body.invites).toEqual([]);
    // With the code (any spelling), anyone can join.
    await stranger.as.post('/me/study-rooms/join', { code: room.code.slice(3).toLowerCase() }).expect(200);

    const s = await state(ada.as, room.id);
    expect(s.room).toMatchObject({ name: 'Physics squad', host: true, timer: { phase: 'idle' } });
    expect(s.members.map((m: { name: string | null; host: boolean }) => [m.name, m.host])).toEqual([
      ['Ada O.', true],
      ['Tobi A.', false],
      // Not a friend and not at the same school: shown as "a learner".
      [null, false],
    ]);
    expect(s.messages.map((m: { kind: string; text: string }) => m.text)).toEqual(['created', 'joined', 'joined']);
  });

  it('chats (screened, slow mode, shares, reports) and only shows new messages after a check-in', async () => {
    const ada = await person('ada@example.com', 'Ada Obi');
    const tobi = await person('tobi@example.com', 'Tobi Ade');
    const { room } = (await ada.as.post('/me/study-rooms', { name: 'Maths' }).expect(201)).body;
    await tobi.as.post('/me/study-rooms/join', { code: room.code }).expect(200);
    const before = (await state(ada.as, room.id)).now;

    await ada.as.post(`/me/study-rooms/${room.id}/messages`, { text: 'Let us do quadratics' }).expect(201);
    expect((await ada.as.post(`/me/study-rooms/${room.id}/messages`, { text: 'again' }).expect(429)).body.reason).toBe('slow');
    expect((await tobi.as.post(`/me/study-rooms/${room.id}/messages`, { text: 'you are nasty' }).expect(422)).body.reason).toBe('blocked');
    await tobi.as
      .post(`/me/study-rooms/${room.id}/messages`, { share: { type: 'paper', id: 'jamb-mathematics-p1', title: 'JAMB Maths · Practice paper 1' } })
      .expect(201);

    const fresh = (await state(ada.as, room.id, before)).messages;
    expect(fresh.map((m: { kind: string; text: string; mine?: boolean }) => [m.kind, m.text, m.mine])).toEqual([
      ['text', 'Let us do quadratics', true],
      ['share', 'JAMB Maths · Practice paper 1', false],
    ]);
    expect(fresh[1].data).toEqual({ type: 'paper', id: 'jamb-mathematics-p1', title: 'JAMB Maths · Practice paper 1' });

    // Two reports hide a message; your own can't be reported.
    await ada.as.post(`/me/study-rooms/${room.id}/messages/${fresh[0].id}/report`).expect(400);
    const third = await person('c@example.com', 'Chi Eze');
    await third.as.post('/me/study-rooms/join', { code: room.code }).expect(200);
    await tobi.as.post(`/me/study-rooms/${room.id}/messages/${fresh[0].id}/report`).expect(200);
    await third.as.post(`/me/study-rooms/${room.id}/messages/${fresh[0].id}/report`).expect(200);
    expect((await state(tobi.as, room.id)).messages.some((m: { id: string }) => m.id === fresh[0].id)).toBe(false);
  });

  it('runs the shared timer: a finished focus session counts as study time for everyone present', async () => {
    const ada = await person('ada@example.com', 'Ada Obi');
    const tobi = await person('tobi@example.com', 'Tobi Ade');
    const { room } = (await ada.as.post('/me/study-rooms', { name: 'Focus' }).expect(201)).body;
    await tobi.as.post('/me/study-rooms/join', { code: room.code }).expect(200);
    expect((await tobi.as.post(`/me/study-rooms/${room.id}/timer`, { action: 'start' }).expect(403)).body.reason).toBe('host');
    const started = (await ada.as.post(`/me/study-rooms/${room.id}/timer`, { action: 'start', focusMinutes: 25, breakMinutes: 5 }).expect(200)).body;
    expect(started.room.timer).toMatchObject({ phase: 'focus', focusMinutes: 25 });
    await state(tobi.as, room.id);

    // Pretend the 25 minutes have passed.
    await prisma.studyRoom.update({ where: { id: room.id }, data: { phaseEndsAt: new Date(Date.now() - 1000) } });
    const [x, y] = await Promise.all([state(ada.as, room.id), state(tobi.as, room.id)]);
    expect(x.room.timer.phase).toBe('break');
    expect(y.room.timer.phase).toBe('break');
    // Credited once each, even with both checking in at the same time.
    expect(await prisma.coinTransaction.count({ where: { reason: 'study_room' } })).toBe(2);
    expect(x.members.map((m: { focusMinutes: number }) => m.focusMinutes)).toEqual([25, 25]);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: tobi.user.id } })).todayMinutes).toBeGreaterThanOrEqual(25);

    await prisma.studyRoom.update({ where: { id: room.id }, data: { phaseEndsAt: new Date(Date.now() - 1000) } });
    const after = await state(ada.as, room.id);
    expect(after.room.timer).toMatchObject({ phase: 'idle', sessions: 1 });
    expect(after.messages.map((m: { text: string }) => m.text)).toEqual(expect.arrayContaining(['focusStarted', 'focusDone', 'breakDone']));
  });

  it('sets a goal, ticks it, and lets the host remove people; leaving hands the room on', async () => {
    const ada = await person('ada@example.com', 'Ada Obi');
    const tobi = await person('tobi@example.com', 'Tobi Ade');
    const { room } = (await ada.as.post('/me/study-rooms', { name: 'Goals' }).expect(201)).body;
    await tobi.as.post('/me/study-rooms/join', { code: room.code }).expect(200);
    await tobi.as.post(`/me/study-rooms/${room.id}/goal`, { done: true }).expect(400);
    await tobi.as.patch(`/me/study-rooms/${room.id}`, { goal: 'Revise waves' }).expect(403);
    await ada.as.patch(`/me/study-rooms/${room.id}`, { goal: 'Revise waves' }).expect(200);
    const ticked = (await tobi.as.post(`/me/study-rooms/${room.id}/goal`, { done: true }).expect(200)).body;
    expect(ticked.room.goal).toBe('Revise waves');
    expect(ticked.members.map((m: { goalDone: boolean }) => m.goalDone)).toEqual([false, true]);

    await ada.as.delete(`/me/study-rooms/${room.id}/members/${tobi.user.id}`).expect(200);
    await tobi.as.get(`/me/study-rooms/${room.id}`).expect(404);
    await tobi.as.post('/me/study-rooms/join', { code: room.code }).expect(200);
    await ada.as.post(`/me/study-rooms/${room.id}/leave`).expect(200);
    expect((await state(tobi.as, room.id)).room.host).toBe(true);
    await tobi.as.post(`/me/study-rooms/${room.id}/leave`).expect(200);
    expect(await prisma.studyRoom.count({ where: { id: room.id } })).toBe(0);
  });

  it('lists school rooms to schoolmates only', async () => {
    const ada = await person('ada@example.com', 'Ada Obi', 'Kings College');
    const mate = await person('m@example.com', 'Mo Bello', 'kings college');
    const other = await person('o@example.com', 'Ola Ojo', 'Queens College');
    const { room } = (await ada.as.post('/me/study-rooms', { name: 'Kings maths', visibility: 'school' }).expect(201)).body;
    expect((await mate.as.get('/me/study-rooms').expect(200)).body.school.map((r: { id: string }) => r.id)).toEqual([room.id]);
    expect((await other.as.get('/me/study-rooms').expect(200)).body.school).toEqual([]);
    await mate.as.post('/me/study-rooms/join', { roomId: room.id }).expect(200);
    await other.as.post('/me/study-rooms/join', { roomId: room.id }).expect(404);
    const noSchool = await person('n@example.com', 'Nia Uche');
    expect((await noSchool.as.post('/me/study-rooms', { name: 'X', visibility: 'school' }).expect(400)).body.reason).toBe('no-school');
  });
});
