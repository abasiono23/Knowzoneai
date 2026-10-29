import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { prisma } from '../src/db.js';
import { usePapers, type Paper } from '../src/services/exams.js';
import { QUIZ, QUIZ_MS, roomReminders } from '../src/services/study-rooms.js';
import { signIn } from './helpers.js';

// Moderation: anything containing "nasty" is flagged. Kora answers with a fixed reply.
const kora = vi.fn(async (_: { input: string }) => ({ output_text: 'Speed = distance ÷ time.', usage: { input_tokens: 50, output_tokens: 20 } }));
vi.mock('../src/services/ai.js', async (original) => ({
  ...(await original<typeof import('../src/services/ai.js')>()),
  openaiClient: () => ({
    moderations: { create: async ({ input }: { input: string }) => ({ results: [{ flagged: /nasty/i.test(input) }] }) },
    responses: { create: kora },
  }),
}));

// A physics paper for quiz battles: the right answer is always option 2 ("c").
const PAPERS: Paper[] = [
  {
    id: 'jamb-physics-p1',
    exam: 'jamb',
    subject: 'physics',
    year: null,
    number: 1,
    source: 'ai',
    minutes: 40,
    questions: Array.from({ length: 12 }, (_, i) => ({
      n: i + 1,
      topic: 'Motion',
      q: `Question ${i + 1}?`,
      options: ['a', 'b', 'c', 'd'],
      answer: 2,
      explanation: 'Because c.',
    })),
  },
];
beforeAll(() => usePapers(PAPERS));
afterAll(() => usePapers(null));

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

describe('Study Rooms: quiz battles, Kora, scheduled sessions and streaks', () => {
  const room2 = async () => {
    const ada = await person('ada@example.com', 'Ada Obi');
    const tobi = await person('tobi@example.com', 'Tobi Ade');
    const { room } = (await ada.as.post('/me/study-rooms', { name: 'Physics squad', subject: 'Physics' }).expect(201)).body;
    await tobi.as.post('/me/study-rooms/join', { code: room.code }).expect(200);
    return { ada, tobi, room };
  };
  /** Moves the quiz back in time so `ms` has passed since it started. */
  const elapse = (id: string, ms: number) => prisma.studyRoomQuiz.updateMany({ where: { roomId: id }, data: { startedAt: new Date(Date.now() - ms) } });
  const open = (i: number) => QUIZ.leadMs + i * (QUIZ.questionMs + QUIZ.revealMs);

  it('runs a quiz battle: same questions for everyone, answers hidden until each closes, faster right answers score more', async () => {
    const { ada, tobi, room } = await room2();
    expect((await tobi.as.post(`/me/study-rooms/${room.id}/quiz`, { exam: 'jamb', subject: 'physics' }).expect(403)).body.reason).toBe('host');
    expect((await ada.as.post(`/me/study-rooms/${room.id}/quiz`, { exam: 'waec', subject: 'physics' }).expect(404)).body.reason).toBe('no-questions');
    const started = (await ada.as.post(`/me/study-rooms/${room.id}/quiz`, { exam: 'jamb', subject: 'physics' }).expect(201)).body;
    expect(started.quiz.questions).toHaveLength(10);
    // No answers in what the app gets.
    expect(JSON.stringify(started.quiz)).not.toContain('Because c');
    expect(started.quiz.questions[0]).toEqual({ q: expect.stringMatching(/^Question/), options: ['a', 'b', 'c', 'd'] });
    expect((await ada.as.post(`/me/study-rooms/${room.id}/quiz`, { exam: 'jamb', subject: 'physics' }).expect(409)).body.reason).toBe('running');

    const answer = (as: As, index: number, choice: number) => as.post(`/me/study-rooms/${room.id}/quiz/answer`, { quizId: started.quiz.id, index, choice });
    // Too early for question 1.
    expect((await answer(ada.as, 0, 2).expect(409)).body.reason).toBe('closed');
    await elapse(room.id, open(0) + 1000);
    await answer(ada.as, 0, 2).expect(200);
    await answer(tobi.as, 0, 1).expect(200);
    expect((await answer(ada.as, 0, 1).expect(409)).body.reason).toBe('answered');
    let s = await state(tobi.as, room.id);
    expect(s.quiz.reveals).toEqual([]);
    expect(s.quiz.mine[0]).toBe(1);
    expect(s.quiz.answered[0]).toBe(2);

    // Question 1 closes: its answer and how people picked show.
    await elapse(room.id, open(0) + QUIZ.questionMs + 2000);
    s = await state(tobi.as, room.id);
    expect(s.quiz.reveals).toEqual([{ answer: 2, explanation: 'Because c.', picks: [0, 1, 1, 0] }]);
    expect((await answer(tobi.as, 0, 2).expect(409)).body.reason).toBe('closed');
    await elapse(room.id, open(1) + 10_000);
    await answer(tobi.as, 1, 2).expect(200);

    // The end: results, the winner in the chat, XP once.
    await elapse(room.id, QUIZ_MS + 1000);
    const [end] = await Promise.all([state(ada.as, room.id), state(tobi.as, room.id)]);
    expect(end.quiz.finished).toBe(true);
    expect(end.quiz.reveals).toHaveLength(10);
    // Ada: right after about 1 s (about 148). Tobi: wrong, then right with about 10 s to spare (about 125).
    const [first, second] = end.quiz.scores;
    expect(first).toMatchObject({ me: true, name: 'Ada O.', correct: 1 });
    expect(first.points).toBeGreaterThanOrEqual(145);
    expect(second).toMatchObject({ me: false, correct: 1 });
    expect(second.points).toBeGreaterThanOrEqual(120);
    expect(second.points).toBeLessThanOrEqual(125);
    expect(end.messages.find((m: { text: string }) => m.text === 'quizWon').data).toMatchObject({ name: 'Ada', points: first.points });
    expect((await prisma.coinTransaction.findMany({ where: { reason: 'room_quiz' }, orderBy: { xp: 'desc' } })).map((t) => t.xp)).toEqual([13, 3]);
  });

  it('no quizzes during focus time', async () => {
    const { ada, room } = await room2();
    await ada.as.post(`/me/study-rooms/${room.id}/timer`, { action: 'start' }).expect(200);
    expect((await ada.as.post(`/me/study-rooms/${room.id}/quiz`, { exam: 'jamb', subject: 'physics' }).expect(409)).body.reason).toBe('focus');
  });

  it('asks Kora in the room: everyone sees the answer, and it uses one of the asker’s tutor questions', async () => {
    const { ada, tobi, room } = await room2();
    await ada.as.post(`/me/study-rooms/${room.id}/messages`, { text: 'What is speed?' }).expect(201);
    const res = (await tobi.as.post(`/me/study-rooms/${room.id}/kora`, { question: 'How do I find speed?' }).expect(201)).body;
    const [q, a] = res.messages.slice(-2);
    expect(q).toMatchObject({ kind: 'text', text: 'How do I find speed?', data: { toKora: true }, mine: true });
    expect(a).toMatchObject({ kind: 'kora', text: 'Speed = distance ÷ time.', data: { replyTo: q.id, askedBy: 'Tobi' } });
    // Kora got the recent chat as context, without names.
    expect(kora.mock.calls.at(-1)![0].input).toContain('Student: What is speed?');
    expect(kora.mock.calls.at(-1)![0].input).not.toContain('Ada');
    expect(await prisma.usageEvent.count({ where: { userId: tobi.user.id, feature: 'tutor_question' } })).toBe(1);
    expect((await state(ada.as, room.id)).messages.some((m: { kind: string }) => m.kind === 'kora')).toBe(true);
    // Screened like chat.
    expect((await tobi.as.post(`/me/study-rooms/${room.id}/kora`, { question: 'say something nasty' }).expect(422)).body.reason).toBe('blocked');
  });

  it('schedules a session: members are told and reminded, and it starts on its own', async () => {
    const { ada, tobi, room } = await room2();
    const at = Date.now() + 5 * 60_000;
    expect((await tobi.as.post(`/me/study-rooms/${room.id}/schedule`, { at }).expect(403)).body.reason).toBe('host');
    expect((await ada.as.post(`/me/study-rooms/${room.id}/schedule`, { at: Date.now() - 1000 }).expect(400)).body.reason).toBe('time');
    const s = (await ada.as.post(`/me/study-rooms/${room.id}/schedule`, { at, minutes: 50 }).expect(200)).body;
    expect(s.room.next).toEqual({ at, minutes: 50 });
    expect(await prisma.notification.count({ where: { userId: tobi.user.id, template: 'studyRoomScheduled' } })).toBe(1);
    expect((await tobi.as.get('/me/study-rooms').expect(200)).body.rooms[0].next).toBe(at);

    // Reminders go out once, a few minutes before.
    expect(await roomReminders()).toBe(1);
    expect(await roomReminders()).toBe(0);
    expect(await prisma.notification.count({ where: { template: 'studyRoomStarting' } })).toBe(2);

    // The time comes: focus starts by itself.
    await prisma.studyRoom.update({ where: { id: room.id }, data: { nextSessionAt: new Date(Date.now() - 2000) } });
    const live = await state(tobi.as, room.id);
    expect(live.room.timer).toMatchObject({ phase: 'focus', focusMinutes: 50 });
    expect(live.room.next).toBeNull();
    expect(live.messages.map((m: { text: string }) => m.text)).toContain('scheduledStarted');

    // Cancelling.
    await ada.as.post(`/me/study-rooms/${room.id}/schedule`, { at: Date.now() + 3_600_000 }).expect(200);
    expect((await ada.as.post(`/me/study-rooms/${room.id}/schedule`, { at: null }).expect(200)).body.room.next).toBeNull();
  });

  it('shares a whiteboard: strokes sync to everyone, undo and clear', async () => {
    const { ada, tobi, room } = await room2();
    const stranger = await person('s@example.com', 'Sam Lee');
    const draw = (as: As, color = '#7C5CFF') => as.post(`/me/study-rooms/${room.id}/board`, { color, width: 8, points: [100, 100, 200, 220, 300, 260] });
    const board = async (as: As, since?: number, version?: number) =>
      (
        await as
          .get(`/me/study-rooms/${room.id}/board`)
          .query({ ...(since && { since }), ...(version !== undefined && { version }) })
          .expect(200)
      ).body;

    await stranger.as.get(`/me/study-rooms/${room.id}/board`).expect(404);
    expect((await draw(ada.as).expect(201)).body.stroke).toMatchObject({ color: '#7C5CFF', mine: true });
    await draw(ada.as, '#nope').expect(400);
    await ada.as.post(`/me/study-rooms/${room.id}/board`, { color: '#1B1F3B', width: 8, points: [1, 2, 3] }).expect(400);

    // Tobi gets everything, then only what's new.
    const first = await board(tobi.as);
    expect(first).toMatchObject({ version: 0, full: true, strokes: [{ mine: false, points: [100, 100, 200, 220, 300, 260] }] });
    await new Promise((r) => setTimeout(r, 5));
    await draw(tobi.as, '#E5484D').expect(201);
    const next = await board(ada.as, first.last, first.version);
    expect(next).toMatchObject({ full: false, strokes: [{ color: '#E5484D', mine: false }] });

    // Undo takes back your own last stroke; everyone reloads the board.
    await tobi.as.post(`/me/study-rooms/${room.id}/board/undo`).expect(200);
    const after = await board(ada.as, next.last, next.version);
    expect(after).toMatchObject({ version: 1, full: true });
    expect(after.strokes).toHaveLength(1);

    // Not the host: clears only your own. The host clears everything (and the room hears about it).
    await draw(tobi.as).expect(201);
    expect((await tobi.as.post(`/me/study-rooms/${room.id}/board/clear`).expect(200)).body.all).toBe(false);
    expect((await board(ada.as)).strokes).toHaveLength(1);
    expect((await ada.as.post(`/me/study-rooms/${room.id}/board/clear`).expect(200)).body.all).toBe(true);
    expect((await board(tobi.as)).strokes).toEqual([]);
    expect((await state(tobi.as, room.id)).messages.map((m: { text: string }) => m.text)).toContain('boardCleared');
  });

  it('keeps a room streak and history from finished focus sessions', async () => {
    const { ada, tobi, room } = await room2();
    // Studied together yesterday too.
    const yesterday = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos' }).format(new Date(Date.now() - 86_400_000));
    await prisma.studyRoom.update({ where: { id: room.id }, data: { streak: 3, bestStreak: 3, lastStudyDay: yesterday } });
    expect((await state(ada.as, room.id)).room).toMatchObject({ streak: 3, studiedToday: false });

    await ada.as.post(`/me/study-rooms/${room.id}/timer`, { action: 'start' }).expect(200);
    await state(tobi.as, room.id);
    await prisma.studyRoom.update({ where: { id: room.id }, data: { phaseEndsAt: new Date(Date.now() - 1000) } });
    const s = await state(ada.as, room.id);
    expect(s.room).toMatchObject({ streak: 4, bestStreak: 4, studiedToday: true });
    expect(s.messages.find((m: { text: string }) => m.text === 'streak').data).toMatchObject({ count: 4 });

    const h = (await tobi.as.get(`/me/study-rooms/${room.id}/history`).expect(200)).body;
    expect(h).toMatchObject({ streak: 4, totalSessions: 1, totalMinutes: 25, quizzes: 0 });
    expect(h.days).toHaveLength(7);
    expect(h.days.at(-1).minutes).toBe(25);
    expect(h.sessions[0]).toMatchObject({ minutes: 25, people: 2 });

    // A missed day resets what's shown.
    await prisma.studyRoom.update({ where: { id: room.id }, data: { lastStudyDay: '2020-01-01' } });
    expect((await state(ada.as, room.id)).room.streak).toBe(0);
  });
});
