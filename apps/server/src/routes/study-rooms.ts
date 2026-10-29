import { Router } from 'express';
import { z } from 'zod';

import { EXAM_SUBJECTS, EXAMS } from '../data/exams.js';
import { prisma } from '../db.js';
import { AppError, notFound } from '../lib/errors.js';
import { localDayKey } from '../lib/time.js';
import { friendIds } from '../services/friends.js';
import { restrictionOf } from '../services/help.js';
import { requestLanguage } from '../services/language.js';
import { flagged } from '../services/moderation.js';
import { notify } from '../services/notifications.js';
import { koraReply } from '../services/room-kora.js';
import { me, requireAuth } from '../services/sessions.js';
import {
  closesAt,
  drawQuestions,
  listedFor,
  liveStreak,
  MAX_MEMBERS,
  MAX_ROOMS,
  newCode,
  opensAt,
  points,
  QUIZ,
  QUIZ_MS,
  roomState,
  roomSummary,
  systemMessage,
  type QuizQuestion,
} from '../services/study-rooms.js';
import type { User } from '../generated/prisma/client.js';
import { requireAllowance } from './tutor.js';

/**
 * Study Rooms (Core): create a room, invite friends or share its code, study together with a shared
 * focus timer, chat (screened before anyone sees it, items like study packs can be shared) and a room
 * goal. Rooms hold up to 8 people.
 */
export const studyRoomsRouter = Router();
studyRoomsRouter.use(['/me/study-rooms', '/me/study-rooms/*rest'], requireAuth);

const REPORTS_TO_HIDE = 2;
const DAY = 86_400_000;
/** A quiz answer sent just as time runs out still counts. */
const GRACE_MS = 1500;
const firstName = (u: Pick<User, 'name'>) => u.name.trim().split(/\s+/)[0] ?? '';

async function member(roomId: string, user: User) {
  const m = await prisma.studyRoomMember.findUnique({ where: { roomId_userId: { roomId, userId: user.id } }, include: { room: true } });
  if (!m) throw notFound('Room not found');
  return m;
}
async function host(roomId: string, user: User) {
  const m = await member(roomId, user);
  if (m.room.hostId !== user.id) throw new AppError(403, 'Only the room’s host can do that.', 'host');
  return m;
}
/** Text people post for others: no chat for restricted accounts, and screened before it's saved. */
async function screened(user: User, text: string) {
  if (restrictionOf(user)?.limits?.includes('comments')) throw new AppError(403, 'Chat is turned off on your account for now.', 'restricted');
  if (await flagged(text)) throw new AppError(422, 'This can’t be posted. Please keep it kind and about studying.', 'blocked');
}

async function join(roomId: string, user: User) {
  const already = await prisma.studyRoomMember.findUnique({ where: { roomId_userId: { roomId, userId: user.id } } });
  if (already) return;
  const [count, mine] = await Promise.all([prisma.studyRoomMember.count({ where: { roomId } }), prisma.studyRoomMember.count({ where: { userId: user.id } })]);
  if (count >= MAX_MEMBERS) throw new AppError(409, 'This room is full (8 people).', 'full');
  if (mine >= MAX_ROOMS) throw new AppError(409, 'You’re in 10 rooms already. Leave one to join another.', 'too-many');
  await prisma.studyRoomMember.create({ data: { roomId, userId: user.id } });
  await prisma.studyRoomInvite.updateMany({ where: { roomId, toId: user.id, status: 'pending' }, data: { status: 'accepted' } });
  await systemMessage(roomId, 'joined', firstName(user));
}

/** Your rooms, rooms open to your school, and invitations waiting for you. */
studyRoomsRouter.get('/me/study-rooms', async (req, res) => {
  const user = me(req);
  const mine = await prisma.studyRoom.findMany({
    where: { members: { some: { userId: user.id } } },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { members: true } } },
  });
  const school = user.school
    ? await prisma.studyRoom.findMany({
        where: { visibility: 'school', school: { equals: user.school.trim(), mode: 'insensitive' }, id: { notIn: mine.map((r) => r.id) } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { _count: { select: { members: true } } },
      })
    : [];
  const invites = await prisma.studyRoomInvite.findMany({
    where: { toId: user.id, status: 'pending' },
    orderBy: { createdAt: 'desc' },
    include: { room: { include: { _count: { select: { members: true } } } } },
  });
  const senders = await prisma.user.findMany({ where: { id: { in: invites.map((i) => i.fromId) } }, select: { id: true, name: true } });
  res.json({
    rooms: mine.map((r) => roomSummary(r, user)),
    school: school.map((r) => roomSummary(r, user)),
    invites: invites.map((i) => ({ id: i.id, room: roomSummary(i.room, user), from: firstName(senders.find((s) => s.id === i.fromId) ?? { name: '' }) })),
  });
});

studyRoomsRouter.post('/me/study-rooms', async (req, res) => {
  const user = me(req);
  const body = z
    .object({
      name: z.string().trim().min(1).max(40),
      subject: z.string().trim().max(40).optional(),
      visibility: z.enum(['private', 'school']).default('private'),
    })
    .parse(req.body);
  if (body.visibility === 'school' && !user.school) throw new AppError(400, 'Add your school to your profile to open a room to your school.', 'no-school');
  await screened(user, `${body.name} ${body.subject ?? ''}`);
  if ((await prisma.studyRoomMember.count({ where: { userId: user.id } })) >= MAX_ROOMS)
    throw new AppError(409, 'You’re in 10 rooms already. Leave one to make another.', 'too-many');
  let room;
  for (let tries = 0; !room && tries < 5; tries++) {
    room = await prisma.studyRoom
      .create({
        data: {
          code: newCode(),
          name: body.name,
          subject: body.subject || null,
          visibility: body.visibility,
          school: body.visibility === 'school' ? user.school!.trim() : null,
          hostId: user.id,
        },
      })
      .catch((e: { code?: string }) => (e.code === 'P2002' ? undefined : Promise.reject(e)));
  }
  if (!room) throw new AppError(500, 'Couldn’t make a room code. Please try again.');
  await prisma.studyRoomMember.create({ data: { roomId: room.id, userId: user.id } });
  await systemMessage(room.id, 'created', firstName(user));
  res.status(201).json({ room: { id: room.id, code: room.code } });
});

/** Join with a code (or a school room from the list). */
studyRoomsRouter.post('/me/study-rooms/join', async (req, res) => {
  const user = me(req);
  const { code, roomId } = z.object({ code: z.string().trim().max(12).optional(), roomId: z.string().max(40).optional() }).parse(req.body);
  const room = code
    ? await prisma.studyRoom.findUnique({ where: { code: code.toUpperCase().replace(/^(KZ)?-?/, 'KZ-') } })
    : roomId
      ? await prisma.studyRoom.findUnique({ where: { id: roomId } })
      : null;
  if (!room) throw notFound('No room with that code');
  // Without a code, only school rooms (for that school) or rooms you were invited to can be joined.
  if (!code && !listedFor(room, user) && !(await prisma.studyRoomInvite.findFirst({ where: { roomId: room.id, toId: user.id } })))
    throw notFound('Room not found');
  await join(room.id, user);
  res.json({ room: { id: room.id, code: room.code } });
});

studyRoomsRouter.post('/me/study-rooms/invites/:id/decline', async (req, res) => {
  const { count } = await prisma.studyRoomInvite.updateMany({
    where: { id: String(req.params.id), toId: me(req).id, status: 'pending' },
    data: { status: 'declined' },
  });
  if (!count) throw notFound('Invitation not found');
  res.json({ ok: true });
});

/** The room screen's check-in: room, members, timer and new messages (the app calls this every few seconds). */
studyRoomsRouter.get('/me/study-rooms/:id', async (req, res) => {
  const user = me(req);
  await member(String(req.params.id), user);
  const since = Number(req.query.since) || undefined;
  res.json(await roomState(String(req.params.id), user, since));
});

/** Invite friends: they get a notification and the invitation in their Study Rooms. */
studyRoomsRouter.post('/me/study-rooms/:id/invite', async (req, res) => {
  const user = me(req);
  const m = await member(String(req.params.id), user);
  const { friends } = z.object({ friends: z.array(z.string().max(60)).min(1).max(MAX_MEMBERS) }).parse(req.body);
  const mine = new Set(await friendIds(user.id));
  const already = new Set((await prisma.studyRoomMember.findMany({ where: { roomId: m.roomId }, select: { userId: true } })).map((x) => x.userId));
  let sent = 0;
  for (const id of friends.filter((f) => mine.has(f) && !already.has(f))) {
    const invite = await prisma.studyRoomInvite.upsert({
      where: { roomId_toId: { roomId: m.roomId, toId: id } },
      create: { roomId: m.roomId, fromId: user.id, toId: id },
      update: { status: 'pending', fromId: user.id, createdAt: new Date() },
    });
    await notify(id, {
      type: 'system',
      template: 'studyRoomInvite',
      params: { name: firstName(user), room: m.room.name },
      href: `/rooms/${m.roomId}?invite=${invite.id}`,
    });
    sent++;
  }
  res.json({ sent });
});

studyRoomsRouter.post('/me/study-rooms/:id/messages', async (req, res) => {
  const user = me(req);
  const m = await member(String(req.params.id), user);
  const body = z
    .union([
      z.object({ text: z.string().trim().min(1).max(500) }),
      z.object({
        share: z.object({ type: z.enum(['pack', 'reel', 'lesson', 'paper', 'course']), id: z.string().max(120), title: z.string().trim().min(1).max(120) }),
      }),
    ])
    .parse(req.body);
  // Slow mode: one message every 2 seconds.
  const last = await prisma.studyRoomMessage.findFirst({ where: { roomId: m.roomId, userId: user.id }, orderBy: { createdAt: 'desc' } });
  if (last && Date.now() - last.createdAt.getTime() < 2000) throw new AppError(429, 'Slow down a little.', 'slow');
  const text = 'text' in body ? body.text : body.share.title;
  await screened(user, text);
  const msg = await prisma.studyRoomMessage.create({
    data: { roomId: m.roomId, userId: user.id, kind: 'text' in body ? 'text' : 'share', text, ...('share' in body && { data: body.share }) },
  });
  res.status(201).json({ id: msg.id });
});

studyRoomsRouter.post('/me/study-rooms/:id/messages/:mid/report', async (req, res) => {
  const user = me(req);
  const m = await member(String(req.params.id), user);
  const msg = await prisma.studyRoomMessage.findFirst({ where: { id: String(req.params.mid), roomId: m.roomId } });
  if (!msg) throw notFound('Message not found');
  if (msg.userId === user.id || !msg.userId) throw new AppError(400, 'You can’t report that message.', 'own');
  const reports = msg.reports + 1;
  await prisma.studyRoomMessage.update({ where: { id: msg.id }, data: { reports, hidden: reports >= REPORTS_TO_HIDE } });
  res.json({ ok: true });
});

/** The shared timer (host): start a focus session, or stop; lengths can be set when starting. */
studyRoomsRouter.post('/me/study-rooms/:id/timer', async (req, res) => {
  const user = me(req);
  const m = await host(String(req.params.id), user);
  const body = z
    .object({
      action: z.enum(['start', 'stop']),
      focusMinutes: z.number().int().min(10).max(60).optional(),
      breakMinutes: z.number().int().min(3).max(20).optional(),
    })
    .parse(req.body);
  if (body.action === 'start') {
    const focus = body.focusMinutes ?? m.room.focusMinutes;
    await prisma.studyRoom.update({
      where: { id: m.roomId },
      data: { phase: 'focus', phaseEndsAt: new Date(Date.now() + focus * 60_000), focusMinutes: focus, breakMinutes: body.breakMinutes ?? m.room.breakMinutes },
    });
    await systemMessage(m.roomId, 'focusStarted', firstName(user));
  } else {
    await prisma.studyRoom.update({ where: { id: m.roomId }, data: { phase: 'idle', phaseEndsAt: null } });
    await systemMessage(m.roomId, 'timerStopped', firstName(user));
  }
  res.json(await roomState(m.roomId, user));
});

/** The room goal (host sets it; setting a new one resets everyone's tick). */
studyRoomsRouter.patch('/me/study-rooms/:id', async (req, res) => {
  const user = me(req);
  const m = await host(String(req.params.id), user);
  const body = z.object({ name: z.string().trim().min(1).max(40).optional(), goal: z.string().trim().max(120).nullable().optional() }).parse(req.body);
  await screened(user, `${body.name ?? ''} ${body.goal ?? ''}`);
  await prisma.studyRoom.update({
    where: { id: m.roomId },
    data: { ...(body.name && { name: body.name }), ...(body.goal !== undefined && { goal: body.goal || null }) },
  });
  if (body.goal !== undefined) {
    await prisma.studyRoomMember.updateMany({ where: { roomId: m.roomId }, data: { goalDone: false } });
    if (body.goal) await systemMessage(m.roomId, 'goalSet', firstName(user));
  }
  res.json(await roomState(m.roomId, user));
});

/** Tick (or untick) the room goal for yourself. */
studyRoomsRouter.post('/me/study-rooms/:id/goal', async (req, res) => {
  const user = me(req);
  const m = await member(String(req.params.id), user);
  const { done } = z.object({ done: z.boolean() }).parse(req.body);
  if (!m.room.goal) throw new AppError(400, 'This room has no goal yet.', 'no-goal');
  await prisma.studyRoomMember.update({ where: { roomId_userId: { roomId: m.roomId, userId: user.id } }, data: { goalDone: done } });
  if (done && !m.goalDone) await systemMessage(m.roomId, 'goalDone', firstName(user));
  res.json(await roomState(m.roomId, user));
});

/** Kora answers a question in the room for everyone to read. Uses one of the asker's daily tutor questions. */
const koraBusy = new Set<string>();
studyRoomsRouter.post('/me/study-rooms/:id/kora', async (req, res) => {
  const user = me(req);
  const m = await member(String(req.params.id), user);
  const { question } = z.object({ question: z.string().trim().min(2).max(500) }).parse(req.body);
  if (koraBusy.has(m.roomId)) throw new AppError(429, 'Kora is answering another question. Try again in a moment.', 'kora-busy');
  await screened(user, question);
  await requireAllowance(user.id, user.plan);
  koraBusy.add(m.roomId);
  try {
    // The last few messages give Kora the context (without names).
    const recent = await prisma.studyRoomMessage.findMany({
      where: { roomId: m.roomId, hidden: false, kind: { in: ['text', 'kora'] } },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
    const asked = await prisma.studyRoomMessage.create({ data: { roomId: m.roomId, userId: user.id, kind: 'text', text: question, data: { toKora: true } } });
    try {
      const answer = await koraReply(user.id, {
        question,
        room: m.room.name,
        subject: m.room.subject,
        recent: recent.reverse().map((x) => ({ name: x.kind === 'kora' ? 'Kora' : x.userId === user.id ? 'Asker' : 'Student', text: x.text.slice(0, 300) })),
        language: requestLanguage(req),
      });
      await prisma.studyRoomMessage.create({ data: { roomId: m.roomId, kind: 'kora', text: answer, data: { replyTo: asked.id, askedBy: firstName(user) } } });
    } catch (e) {
      await systemMessage(m.roomId, 'koraFailed');
      throw e;
    }
  } finally {
    koraBusy.delete(m.roomId);
  }
  res.status(201).json(await roomState(m.roomId, user));
});

/** Quiz battle (host): 10 past-paper questions everyone answers at once. For breaks, not focus time. */
studyRoomsRouter.post('/me/study-rooms/:id/quiz', async (req, res) => {
  const user = me(req);
  const m = await host(String(req.params.id), user);
  const { exam, subject } = z.object({ exam: z.enum(EXAMS), subject: z.enum(EXAM_SUBJECTS) }).parse(req.body);
  if (m.room.phase === 'focus' && (m.room.phaseEndsAt?.getTime() ?? 0) > Date.now())
    throw new AppError(409, 'Quizzes are for breaks. Wait until focus time ends.', 'focus');
  if (await prisma.studyRoomQuiz.findFirst({ where: { roomId: m.roomId, startedAt: { gt: new Date(Date.now() - QUIZ_MS) } } }))
    throw new AppError(409, 'A quiz is already running.', 'running');
  const questions = drawQuestions(exam, subject);
  if (questions.length < QUIZ.count) throw new AppError(404, 'There aren’t enough questions for that subject yet.', 'no-questions');
  await prisma.studyRoomQuiz.create({ data: { roomId: m.roomId, exam, subject, questions, startedAt: new Date() } });
  await systemMessage(m.roomId, 'quizStarted', firstName(user), { exam, subject });
  res.status(201).json(await roomState(m.roomId, user));
});

/** One answer per question, while it's open. Whether it was right shows when the question closes. */
studyRoomsRouter.post('/me/study-rooms/:id/quiz/answer', async (req, res) => {
  const user = me(req);
  const m = await member(String(req.params.id), user);
  const body = z
    .object({
      quizId: z.string().max(40),
      index: z
        .number()
        .int()
        .min(0)
        .max(QUIZ.count - 1),
      choice: z.number().int().min(0).max(4),
    })
    .parse(req.body);
  const quiz = await prisma.studyRoomQuiz.findFirst({ where: { id: body.quizId, roomId: m.roomId } });
  if (!quiz) throw notFound('Quiz not found');
  const now = Date.now();
  const closes = closesAt(quiz, body.index);
  if (now < opensAt(quiz, body.index) || now > closes + GRACE_MS) throw new AppError(409, 'Time’s up for that question.', 'closed');
  const q = (quiz.questions as QuizQuestion[])[body.index];
  if (!q || body.choice >= q.options.length) throw new AppError(400, 'That isn’t one of the options.', 'option');
  const correct = body.choice === q.answer;
  await prisma.studyRoomQuizAnswer
    .create({ data: { quizId: quiz.id, userId: user.id, index: body.index, choice: body.choice, correct, points: points(correct, now, closes) } })
    .catch((e: { code?: string }) => Promise.reject(e.code === 'P2002' ? new AppError(409, 'You already answered this one.', 'answered') : e));
  res.json({ ok: true });
});

/** Schedule the next focus session (host): members are told now and reminded before it starts. */
studyRoomsRouter.post('/me/study-rooms/:id/schedule', async (req, res) => {
  const user = me(req);
  const m = await host(String(req.params.id), user);
  const body = z.object({ at: z.number().int().nullable(), minutes: z.union([z.literal(25), z.literal(50)]).default(25) }).parse(req.body);
  if (body.at === null) {
    if (m.room.nextSessionAt) {
      await prisma.studyRoom.update({ where: { id: m.roomId }, data: { nextSessionAt: null } });
      await systemMessage(m.roomId, 'scheduleCancelled', firstName(user));
    }
  } else {
    if (body.at < Date.now() + 60_000 || body.at > Date.now() + 7 * DAY) throw new AppError(400, 'Pick a time in the next 7 days.', 'time');
    await prisma.studyRoom.update({ where: { id: m.roomId }, data: { nextSessionAt: new Date(body.at), nextSessionMinutes: body.minutes, remindedAt: null } });
    await systemMessage(m.roomId, 'scheduled', firstName(user), { at: body.at, minutes: body.minutes });
    const others = await prisma.studyRoomMember.findMany({ where: { roomId: m.roomId, userId: { not: user.id } }, select: { userId: true } });
    for (const o of others)
      await notify(o.userId, {
        type: 'reminder',
        template: 'studyRoomScheduled',
        params: { name: firstName(user), room: m.room.name, at: body.at, minutes: body.minutes },
        href: `/rooms/${m.roomId}`,
      });
  }
  res.json(await roomState(m.roomId, user));
});

/** The room's history: streak, totals, minutes on each of the last 7 days and recent sessions. */
studyRoomsRouter.get('/me/study-rooms/:id/history', async (req, res) => {
  const m = await member(String(req.params.id), me(req));
  const since = new Date(Date.now() - 7 * DAY);
  const [recent, totals, quizzes] = await Promise.all([
    prisma.studyRoomSession.findMany({ where: { roomId: m.roomId, endedAt: { gte: since } }, orderBy: { endedAt: 'desc' } }),
    prisma.studyRoomSession.aggregate({ where: { roomId: m.roomId }, _sum: { minutes: true }, _count: { _all: true } }),
    prisma.studyRoomQuiz.count({ where: { roomId: m.roomId } }),
  ]);
  const days = Array.from({ length: 7 }, (_, i) => localDayKey(new Date(Date.now() - (6 - i) * DAY)));
  res.json({
    streak: liveStreak(m.room),
    bestStreak: m.room.bestStreak,
    totalSessions: totals._count._all,
    totalMinutes: totals._sum.minutes ?? 0,
    quizzes,
    days: days.map((day) => ({ day, minutes: recent.filter((s) => localDayKey(s.endedAt) === day).reduce((n, s) => n + s.minutes, 0) })),
    sessions: recent.slice(0, 10).map((s) => ({ endedAt: s.endedAt.getTime(), minutes: s.minutes, people: s.people })),
  });
});

// ─── Shared whiteboard ────────────────────────────────────────────────────────

/** Pen colours (white is the eraser on the white board). */
export const BOARD_COLORS = ['#1B1F3B', '#7C5CFF', '#E5484D', '#2F80ED', '#22A06B', '#F59E0B', '#FFFFFF'] as const;
const MAX_STROKES = 1500;

/**
 * The board: every stroke the first time (or after an undo or clear changed it), then only strokes
 * newer than `since`. Phones with the board open check in every second or two.
 */
studyRoomsRouter.get('/me/study-rooms/:id/board', async (req, res) => {
  const user = me(req);
  const m = await member(String(req.params.id), user);
  const since = Number(req.query.since) || 0;
  const full = !since || Number(req.query.version) !== m.room.boardVersion;
  const strokes = await prisma.studyRoomStroke.findMany({
    where: { roomId: m.roomId, ...(!full && { createdAt: { gt: new Date(since) } }) },
    orderBy: { createdAt: 'asc' },
    take: MAX_STROKES,
  });
  res.json({
    version: m.room.boardVersion,
    full,
    strokes: strokes.map((s) => ({ id: s.id, color: s.color, width: s.width, points: s.points, mine: s.userId === user.id })),
    last: strokes.at(-1)?.createdAt.getTime() ?? since,
  });
});

studyRoomsRouter.post('/me/study-rooms/:id/board', async (req, res) => {
  const user = me(req);
  const m = await member(String(req.params.id), user);
  const body = z
    .object({
      color: z.enum(BOARD_COLORS),
      width: z.number().int().min(2).max(60),
      // Board units: 1000 wide, 1333 tall (a little past the edge is fine).
      points: z
        .array(z.number().int().min(-50).max(1400))
        .min(2)
        .max(1200)
        .refine((p) => p.length % 2 === 0, 'Points come in x, y pairs'),
    })
    .parse(req.body);
  if ((await prisma.studyRoomStroke.count({ where: { roomId: m.roomId } })) >= MAX_STROKES)
    throw new AppError(409, 'The board is full. Ask the host to clear it.', 'board-full');
  const s = await prisma.studyRoomStroke.create({ data: { roomId: m.roomId, userId: user.id, ...body } });
  res.status(201).json({ stroke: { id: s.id, color: s.color, width: s.width, points: s.points, mine: true } });
});

/** Undo your own last stroke. */
studyRoomsRouter.post('/me/study-rooms/:id/board/undo', async (req, res) => {
  const user = me(req);
  const m = await member(String(req.params.id), user);
  const last = await prisma.studyRoomStroke.findFirst({ where: { roomId: m.roomId, userId: user.id }, orderBy: { createdAt: 'desc' } });
  if (last) {
    await prisma.studyRoomStroke.delete({ where: { id: last.id } });
    await prisma.studyRoom.update({ where: { id: m.roomId }, data: { boardVersion: { increment: 1 } } });
  }
  res.json({ ok: true });
});

/** The host wipes the board; anyone else wipes their own drawing. */
studyRoomsRouter.post('/me/study-rooms/:id/board/clear', async (req, res) => {
  const user = me(req);
  const m = await member(String(req.params.id), user);
  const isHost = m.room.hostId === user.id;
  await prisma.studyRoomStroke.deleteMany({ where: { roomId: m.roomId, ...(!isHost && { userId: user.id }) } });
  await prisma.studyRoom.update({ where: { id: m.roomId }, data: { boardVersion: { increment: 1 } } });
  if (isHost) await systemMessage(m.roomId, 'boardCleared', firstName(user));
  res.json({ ok: true, all: isHost });
});

studyRoomsRouter.post('/me/study-rooms/:id/leave', async (req, res) => {
  const user = me(req);
  const m = await member(String(req.params.id), user);
  await prisma.studyRoomMember.delete({ where: { roomId_userId: { roomId: m.roomId, userId: user.id } } });
  const left = await prisma.studyRoomMember.findMany({ where: { roomId: m.roomId }, orderBy: { joinedAt: 'asc' } });
  // An empty room closes; if the host leaves, the longest-standing member hosts.
  if (!left.length) await prisma.studyRoom.delete({ where: { id: m.roomId } });
  else {
    if (m.room.hostId === user.id) await prisma.studyRoom.update({ where: { id: m.roomId }, data: { hostId: left[0]!.userId } });
    await systemMessage(m.roomId, 'left', firstName(user));
  }
  res.json({ ok: true });
});

/** The host removes someone from the room. */
studyRoomsRouter.delete('/me/study-rooms/:id/members/:userId', async (req, res) => {
  const user = me(req);
  const m = await host(String(req.params.id), user);
  const target = String(req.params.userId);
  if (target === user.id) throw new AppError(400, 'Use Leave to leave your own room.', 'self');
  const { count } = await prisma.studyRoomMember.deleteMany({ where: { roomId: m.roomId, userId: target } });
  if (!count) throw notFound('Member not found');
  await prisma.studyRoomInvite.deleteMany({ where: { roomId: m.roomId, toId: target } });
  await systemMessage(m.roomId, 'removed');
  res.json(await roomState(m.roomId, user));
});

/** The host closes the room for everyone. */
studyRoomsRouter.delete('/me/study-rooms/:id', async (req, res) => {
  const m = await host(String(req.params.id), me(req));
  await prisma.studyRoom.delete({ where: { id: m.roomId } });
  res.json({ ok: true });
});
