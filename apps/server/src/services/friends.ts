import { prisma } from '../db.js';
import type { User } from '../generated/prisma/client.js';
import { AppError } from '../lib/errors.js';
import { friendsBoard, limited } from './leagues.js';
import { notify } from './notifications.js';
import { blockedBetween, playerView } from './world.js';

/**
 * Friends in Knowzone World. You add someone with their Knowzone code (or username) — there's no
 * search, so learners only connect with people they know. They accept or decline; either can remove.
 */
export const MAX_FRIENDS = 100;

const person = { id: true, name: true, school: true, settings: true, streak: true, worldProfile: { select: { avatar: true } } } as const;

export async function friendIds(userId: string) {
  const rows = await prisma.friendship.findMany({
    where: { status: 'accepted', OR: [{ requesterId: userId }, { addresseeId: userId }] },
    select: { requesterId: true, addresseeId: true },
  });
  return rows.map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId));
}

/** Friends (with this week's XP), requests waiting for you, and ones you sent. */
export async function friendsView(viewer: User) {
  const blocked = await blockedBetween(viewer.id);
  const ids = (await friendIds(viewer.id)).filter((id) => !blocked.has(id));
  const pending = await prisma.friendship.findMany({
    where: { status: 'pending', OR: [{ requesterId: viewer.id }, { addresseeId: viewer.id }] },
    include: { requester: { select: person }, addressee: { select: person } },
    orderBy: { createdAt: 'desc' },
  });
  // Someone who sent a request can be seen by name, so you know who it is.
  const view = (u: Parameters<typeof playerView>[1]) => playerView(viewer, u, { friend: true });
  return {
    code: viewer.referralCode,
    friends: (await friendsBoard(viewer, ids)).filter((r) => !r.me),
    incoming: pending.filter((p) => p.addresseeId === viewer.id && !blocked.has(p.requesterId)).map((p) => ({ requestId: p.id, ...view(p.requester) })),
    outgoing: pending.filter((p) => p.requesterId === viewer.id).map((p) => ({ requestId: p.id, ...view(p.addressee) })),
  };
}

/** Sends a request to the learner with this code or username (or accepts theirs if they asked first). */
export async function addFriend(viewer: User, code: string) {
  if (limited(viewer, 'invites')) throw new AppError(403, 'Adding friends is paused on your account', 'restricted');
  const clean = code.trim().replace(/^@/, '');
  const target = await prisma.user.findFirst({
    where: { OR: [{ referralCode: { equals: clean, mode: 'insensitive' } }, { username: { equals: clean, mode: 'insensitive' } }] },
  });
  if (!target) throw new AppError(404, 'No learner has that code', 'not-found');
  if (target.id === viewer.id) throw new AppError(400, 'That’s your own code', 'self');
  if ((await blockedBetween(viewer.id)).has(target.id)) throw new AppError(404, 'No learner has that code', 'not-found');
  if ((await friendIds(viewer.id)).length >= MAX_FRIENDS) throw new AppError(409, `You can have up to ${MAX_FRIENDS} friends`, 'limit');

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: viewer.id, addresseeId: target.id },
        { requesterId: target.id, addresseeId: viewer.id },
      ],
    },
  });
  if (existing?.status === 'accepted') throw new AppError(409, 'You’re already friends', 'already');
  if (existing && existing.requesterId === target.id) return acceptFriend(viewer, existing.id);
  if (existing) throw new AppError(409, 'You already sent a request', 'already');
  const f = await prisma.friendship.create({ data: { requesterId: viewer.id, addresseeId: target.id, status: 'pending' } });
  await notify(target.id, { type: 'system', template: 'friendRequest', params: { name: viewer.name.split(/\s+/)[0]! }, href: '/world/friends' });
  return { status: 'pending' as const, id: f.id };
}

export async function acceptFriend(viewer: User, requestId: string) {
  const f = await prisma.friendship.findFirst({ where: { id: requestId, addresseeId: viewer.id, status: 'pending' } });
  if (!f) throw new AppError(404, 'That request isn’t there any more', 'not-found');
  await prisma.friendship.update({ where: { id: f.id }, data: { status: 'accepted', respondedAt: new Date() } });
  await notify(f.requesterId, { type: 'system', template: 'friendAccepted', params: { name: viewer.name.split(/\s+/)[0]! }, href: '/world/friends' });
  return { status: 'accepted' as const, id: f.id };
}

/** Declines a request, cancels one you sent, or removes a friend (by request id or the other learner's id). */
export async function removeFriend(viewer: User, id: string) {
  await prisma.friendship.deleteMany({
    where: {
      AND: [{ OR: [{ requesterId: viewer.id }, { addresseeId: viewer.id }] }, { OR: [{ id }, { requesterId: id }, { addresseeId: id }] }],
    },
  });
}

/** Blocking someone also ends any friendship or request between you. */
export async function unfriendOnBlock(userId: string, blockedId: string) {
  await prisma.friendship.deleteMany({
    where: {
      OR: [
        { requesterId: userId, addresseeId: blockedId },
        { requesterId: blockedId, addresseeId: userId },
      ],
    },
  });
}
