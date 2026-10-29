import { randomInt } from 'node:crypto';

import type { Exam, ExamSubject } from '../data/exams.js';
import { prisma } from '../db.js';
import type { StudyRoom, StudyRoomMessage, StudyRoomQuiz, User } from '../generated/prisma/client.js';
import { localDayKey } from '../lib/time.js';
import { papersFor } from './exams.js';
import { friendIds } from './friends.js';
import { notify } from './notifications.js';
import { recordActivity } from './progress.js';
import { blockedBetween, playerView } from './world.js';

/**
 * Study Rooms: friends study together with one shared focus timer (25 min focus, 5 min break by
 * default), chat and a room goal. The app checks in every few seconds; the timer moves on lazily when
 * someone checks in after a phase has ended, and a finished focus session counts as study time (daily
 * goal, streak, XP) for everyone who was in the room.
 */
export const MAX_MEMBERS = 8;
export const MAX_ROOMS = 10;
/** Someone counts as "here" if their app checked in this recently. */
const ONLINE_MS = 20_000;
/** …and as present for a focus session if they checked in this close to its end. */
const PRESENT_MS = 90_000;

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const newCode = () => `KZ-${Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')}`;

const sameSchool = (a?: string | null, b?: string | null) => !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

/** Can this learner see (and join) the room without an invite or its code? */
export const listedFor = (room: Pick<StudyRoom, 'visibility' | 'school'>, user: Pick<User, 'school'>) =>
  room.visibility === 'school' && sameSchool(room.school, user.school);

export async function systemMessage(roomId: string, event: string, name?: string | null, extra?: Record<string, string | number>) {
  await prisma.studyRoomMessage.create({ data: { roomId, kind: 'system', text: event, data: { event, ...(name && { name }), ...extra } } });
}

/** Room streak: days in a row with a finished focus session. Shown as 0 once a day is missed. */
export function liveStreak(room: Pick<StudyRoom, 'streak' | 'lastStudyDay'>, now = new Date()) {
  const today = localDayKey(now);
  const yesterday = localDayKey(new Date(now.getTime() - 86_400_000));
  return room.lastStudyDay === today || room.lastStudyDay === yesterday ? room.streak : 0;
}

/** A finished focus session: history, and the room streak moves on (once per day). */
async function logSession(r: StudyRoom, ended: Date, people: number) {
  await prisma.studyRoomSession.create({ data: { roomId: r.id, endedAt: ended, minutes: r.focusMinutes, people } });
  const day = localDayKey(ended);
  if (r.lastStudyDay === day) return;
  const streak = r.lastStudyDay === localDayKey(new Date(ended.getTime() - 86_400_000)) ? r.streak + 1 : 1;
  await prisma.studyRoom.update({ where: { id: r.id }, data: { streak, bestStreak: Math.max(r.bestStreak, streak), lastStudyDay: day } });
  if (streak >= 2) await systemMessage(r.id, 'streak', null, { count: streak });
}

/** Scheduled sessions start on their own when the time comes (if nobody checks in within 30 minutes, they lapse). */
const LATE_MS = 30 * 60_000;
async function startScheduled(room: StudyRoom): Promise<StudyRoom> {
  const at = room.nextSessionAt;
  if (!at || at.getTime() > Date.now()) return room;
  const late = Date.now() - at.getTime();
  const minutes = room.nextSessionMinutes;
  const start = room.phase !== 'focus' && late < Math.min(LATE_MS, minutes * 60_000);
  const { count } = await prisma.studyRoom.updateMany({
    where: { id: room.id, nextSessionAt: at },
    data: start
      ? {
          nextSessionAt: null,
          phase: 'focus',
          phaseEndsAt: new Date(at.getTime() + minutes * 60_000),
          focusMinutes: minutes,
          breakMinutes: minutes >= 45 ? 10 : 5,
        }
      : { nextSessionAt: null },
  });
  if (count && start) await systemMessage(room.id, 'scheduledStarted');
  return count ? prisma.studyRoom.findUniqueOrThrow({ where: { id: room.id } }) : room;
}

/** Reminds members shortly before a scheduled session (the job runner calls this every minute). */
export async function roomReminders(now = new Date()) {
  const due = await prisma.studyRoom.findMany({
    where: { nextSessionAt: { gt: now, lte: new Date(now.getTime() + 10 * 60_000) }, remindedAt: null },
    include: { members: { select: { userId: true } } },
  });
  for (const r of due) {
    const { count } = await prisma.studyRoom.updateMany({ where: { id: r.id, remindedAt: null }, data: { remindedAt: now } });
    if (!count) continue;
    for (const m of r.members)
      await notify(m.userId, {
        type: 'reminder',
        template: 'studyRoomStarting',
        params: { room: r.name, at: r.nextSessionAt!.getTime() },
        href: `/rooms/${r.id}`,
      });
  }
  return due.length;
}

// ─── Quiz battle ──────────────────────────────────────────────────────────────
// 10 past-paper questions; everyone sees each one at the same moment and has 20 seconds to answer,
// then the answer shows for a few seconds. Faster right answers score more.

export const QUIZ = { count: 10, leadMs: 5_000, questionMs: 20_000, revealMs: 6_000 };
const SLOT = QUIZ.questionMs + QUIZ.revealMs;
export const opensAt = (q: Pick<StudyRoomQuiz, 'startedAt'>, i: number) => q.startedAt.getTime() + QUIZ.leadMs + i * SLOT;
export const closesAt = (q: Pick<StudyRoomQuiz, 'startedAt'>, i: number) => opensAt(q, i) + QUIZ.questionMs;
export const quizEnd = (q: Pick<StudyRoomQuiz, 'startedAt'>) => opensAt(q, QUIZ.count);
/** How long a whole quiz takes (about 4½ minutes: it fits in a break). */
export const QUIZ_MS = QUIZ.leadMs + QUIZ.count * SLOT;

export type QuizQuestion = { q: string; options: string[]; answer: number; explanation: string };

/** 10 random questions from the subject's papers that fit a phone screen (no long passages). */
export function drawQuestions(exam: Exam, subject: ExamSubject): QuizQuestion[] {
  const pool = papersFor(exam, subject)
    .flatMap((p) => p.questions)
    .filter((q) => !q.passage && q.q.length <= 400 && q.options.every((o) => o.length <= 160));
  const picked: QuizQuestion[] = [];
  while (picked.length < QUIZ.count && pool.length) {
    const [q] = pool.splice(randomInt(pool.length), 1);
    picked.push({ q: q!.q, options: q!.options, answer: q!.answer, explanation: q!.explanation.slice(0, 500) });
  }
  return picked;
}

/** 100 for a right answer, plus up to 50 for answering fast. */
export const points = (correct: boolean, answeredAt: number, closes: number) =>
  correct ? 100 + Math.round((50 * Math.max(0, closes - answeredAt)) / QUIZ.questionMs) : 0;

async function quizScores(quizId: string) {
  const [all, right] = await Promise.all([
    prisma.studyRoomQuizAnswer.groupBy({ by: ['userId'], where: { quizId }, _sum: { points: true } }),
    prisma.studyRoomQuizAnswer.groupBy({ by: ['userId'], where: { quizId, correct: true }, _count: { _all: true } }),
  ]);
  return all
    .map((r) => ({ userId: r.userId, points: r._sum.points ?? 0, correct: right.find((x) => x.userId === r.userId)?._count._all ?? 0 }))
    .sort((a, b) => b.points - a.points);
}

/** When a quiz is over: the winner in the chat, and XP (3 per right answer, 10 more for the winner). Once only. */
async function finishQuiz(quiz: StudyRoomQuiz) {
  if (quiz.finishedAt || Date.now() < quizEnd(quiz)) return;
  const { count } = await prisma.studyRoomQuiz.updateMany({ where: { id: quiz.id, finishedAt: null }, data: { finishedAt: new Date() } });
  if (!count) return;
  const scores = await quizScores(quiz.id);
  const top = scores[0]?.points ? scores[0] : null;
  for (const s of scores)
    if (s.correct) await recordActivity(s.userId, { xp: s.correct * 3 + (s === top ? 10 : 0), coins: 0, minutes: 0 }, { reason: 'room_quiz' });
  if (top) {
    const winner = await prisma.user.findUnique({ where: { id: top.userId }, select: { name: true } });
    await systemMessage(quiz.roomId, 'quizWon', winner?.name.trim().split(' ')[0] ?? null, { points: top.points });
  } else await systemMessage(quiz.roomId, 'quizEnded');
}

/** The room's quiz as the viewer sees it: each answer stays hidden until its question closes. */
async function quizView(roomId: string, viewer: User, names: Map<string, string | null>) {
  // A running quiz, or the results of one that ended in the last 10 minutes.
  const quiz = await prisma.studyRoomQuiz.findFirst({
    where: { roomId, startedAt: { gte: new Date(Date.now() - QUIZ_MS - 10 * 60_000) } },
    orderBy: { startedAt: 'desc' },
  });
  if (!quiz) return null;
  await finishQuiz(quiz);
  const questions = quiz.questions as QuizQuestion[];
  const now = Date.now();
  const [answers, scores] = await Promise.all([prisma.studyRoomQuizAnswer.findMany({ where: { quizId: quiz.id } }), quizScores(quiz.id)]);
  return {
    id: quiz.id,
    exam: quiz.exam,
    subject: quiz.subject,
    startedAt: quiz.startedAt.getTime(),
    leadMs: QUIZ.leadMs,
    questionMs: QUIZ.questionMs,
    revealMs: QUIZ.revealMs,
    finished: now >= quizEnd(quiz),
    questions: questions.map((q) => ({ q: q.q, options: q.options })),
    // Closed questions: the answer, why, and how many picked each option.
    reveals: questions
      .filter((_, i) => closesAt(quiz, i) <= now)
      .map((q, i) => ({
        answer: q.answer,
        explanation: q.explanation,
        picks: q.options.map((_, o) => answers.filter((a) => a.index === i && a.choice === o).length),
      })),
    mine: questions.map((_, i) => answers.find((a) => a.index === i && a.userId === viewer.id)?.choice ?? null),
    answered: questions.map((_, i) => answers.filter((a) => a.index === i).length),
    scores: scores.map((s) => ({ id: s.userId, name: names.get(s.userId) ?? null, me: s.userId === viewer.id, points: s.points, correct: s.correct })),
  };
}

/**
 * Moves the timer on if a phase has ended: focus → break (crediting the session to everyone who was
 * present) → idle. Guarded so two people checking in at once can't credit a session twice.
 */
export async function advanceTimer(room: StudyRoom): Promise<StudyRoom> {
  let r = room;
  for (let guard = 0; guard < 3 && r.phase !== 'idle' && r.phaseEndsAt && r.phaseEndsAt.getTime() <= Date.now(); guard++) {
    const ended = r.phaseEndsAt;
    if (r.phase === 'focus') {
      const next = new Date(ended.getTime() + r.breakMinutes * 60_000);
      const { count } = await prisma.studyRoom.updateMany({
        where: { id: r.id, phase: 'focus', phaseEndsAt: ended },
        data: { phase: 'break', phaseEndsAt: next },
      });
      if (count) {
        const present = await prisma.studyRoomMember.findMany({ where: { roomId: r.id, lastSeenAt: { gte: new Date(ended.getTime() - PRESENT_MS) } } });
        await logSession(r, ended, present.length);
        for (const m of present) {
          await prisma.studyRoomMember.update({
            where: { roomId_userId: { roomId: r.id, userId: m.userId } },
            data: { focusMinutes: { increment: r.focusMinutes } },
          });
          await recordActivity(m.userId, { xp: r.focusMinutes, coins: 0, minutes: r.focusMinutes }, { reason: 'study_room' });
        }
        await systemMessage(r.id, 'focusDone');
      }
    } else {
      const { count } = await prisma.studyRoom.updateMany({
        where: { id: r.id, phase: 'break', phaseEndsAt: ended },
        data: { phase: 'idle', phaseEndsAt: null, sessions: { increment: 1 } },
      });
      if (count) await systemMessage(r.id, 'breakDone');
    }
    r = await prisma.studyRoom.findUniqueOrThrow({ where: { id: r.id } });
  }
  return r;
}

/** A message as the viewer sees it. */
function messageView(m: StudyRoomMessage, names: Map<string, string | null>, viewerId: string) {
  return {
    id: m.id,
    kind: m.kind,
    text: m.text,
    ...(m.data !== null && { data: m.data }),
    createdAt: m.createdAt.getTime(),
    ...(m.userId && { userId: m.userId, name: names.get(m.userId) ?? null, mine: m.userId === viewerId }),
  };
}

/**
 * Everything the room screen needs: the room, its members (who's here), the timer and messages newer
 * than `since` (or the latest 60). Checking in marks the viewer as here.
 */
export async function roomState(roomId: string, viewer: User, since?: number) {
  await prisma.studyRoomMember.update({ where: { roomId_userId: { roomId, userId: viewer.id } }, data: { lastSeenAt: new Date() } });
  const room = await advanceTimer(await startScheduled(await prisma.studyRoom.findUniqueOrThrow({ where: { id: roomId } })));
  const [members, friends, blocked] = await Promise.all([
    prisma.studyRoomMember.findMany({
      where: { roomId },
      orderBy: { joinedAt: 'asc' },
      include: {
        user: { select: { id: true, name: true, school: true, settings: true, streak: true, worldProfile: { select: { avatar: true, anonymous: true } } } },
      },
    }),
    friendIds(viewer.id),
    blockedBetween(viewer.id),
  ]);
  const people = members.map((m) => ({
    ...playerView(viewer, m.user, { friend: friends.includes(m.userId) }),
    host: m.userId === room.hostId,
    online: Date.now() - m.lastSeenAt.getTime() < ONLINE_MS,
    goalDone: m.goalDone,
    focusMinutes: m.focusMinutes,
  }));
  const names = new Map(people.map((p) => [p.id, p.name]));
  const quiz = await quizView(roomId, viewer, names);
  const where = { roomId, hidden: false, ...(blocked.size && { OR: [{ userId: null }, { userId: { notIn: [...blocked] } }] }) };
  const messages = since
    ? await prisma.studyRoomMessage.findMany({ where: { ...where, createdAt: { gt: new Date(since) } }, orderBy: { createdAt: 'asc' }, take: 100 })
    : (await prisma.studyRoomMessage.findMany({ where, orderBy: { createdAt: 'desc' }, take: 60 })).reverse();
  return {
    room: {
      id: room.id,
      code: room.code,
      name: room.name,
      subject: room.subject,
      visibility: room.visibility,
      goal: room.goal,
      host: room.hostId === viewer.id,
      timer: {
        phase: room.phase,
        endsAt: room.phaseEndsAt?.getTime() ?? null,
        focusMinutes: room.focusMinutes,
        breakMinutes: room.breakMinutes,
        sessions: room.sessions,
      },
      streak: liveStreak(room),
      bestStreak: room.bestStreak,
      studiedToday: room.lastStudyDay === localDayKey(),
      next: room.nextSessionAt ? { at: room.nextSessionAt.getTime(), minutes: room.nextSessionMinutes } : null,
    },
    members: people,
    quiz,
    messages: messages.map((m) => messageView(m, names, viewer.id)),
    now: Date.now(),
  };
}

/** A room as a list item. */
export function roomSummary(r: StudyRoom & { _count: { members: number } }, viewer: Pick<User, 'id'>) {
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    subject: r.subject,
    visibility: r.visibility,
    members: r._count.members,
    host: r.hostId === viewer.id,
    phase: r.phase,
    endsAt: r.phaseEndsAt?.getTime() ?? null,
    streak: liveStreak(r),
    next: r.nextSessionAt && r.nextSessionAt.getTime() > Date.now() ? r.nextSessionAt.getTime() : null,
  };
}
