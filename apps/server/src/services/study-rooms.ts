import { randomInt } from 'node:crypto';

import { prisma } from '../db.js';
import type { StudyRoom, StudyRoomMessage, User } from '../generated/prisma/client.js';
import { friendIds } from './friends.js';
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

export async function systemMessage(roomId: string, event: string, name?: string | null) {
  await prisma.studyRoomMessage.create({ data: { roomId, kind: 'system', text: event, data: { event, ...(name && { name }) } } });
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
  const room = await advanceTimer(await prisma.studyRoom.findUniqueOrThrow({ where: { id: roomId } }));
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
    },
    members: people,
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
  };
}
