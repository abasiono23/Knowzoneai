import { prisma } from '../db.js';
import type { User } from '../generated/prisma/client.js';
import { leagueWeek } from '../lib/time.js';
import { restrictionOf } from './help.js';
import { blockedBetween, playerView } from './world.js';

/**
 * Weekly leagues. Learners who earn XP in a week join a group of up to 30 in their tier (bronze,
 * silver, gold, diamond), ranked by XP earned that week. Next week the top 5 move up a tier and the
 * bottom 5 (or anyone who earned nothing) move down.
 */
export const TIERS = ['bronze', 'silver', 'gold', 'diamond'] as const;
export const GROUP_SIZE = 30;
export const PROMOTE = 5;
export const DEMOTE = 5;

/** Is this learner kept off leaderboards (a moderation limit that's still in force)? */
export function limited(u: Pick<User, 'restriction'>, limit: string, now = Date.now()) {
  const r = restrictionOf(u);
  return !!r?.limits?.includes(limit) && (!r.until || r.until > now);
}

/** XP each learner earned in a time window (from the reward ledger). */
async function xpBetween(userIds: string[], from: Date, to: Date) {
  if (!userIds.length) return new Map<string, number>();
  const rows = await prisma.coinTransaction.groupBy({
    by: ['userId'],
    where: { userId: { in: userIds }, xp: { gt: 0 }, createdAt: { gte: from, lt: to } },
    _sum: { xp: true },
  });
  return new Map(rows.map((r) => [r.userId, r._sum.xp ?? 0]));
}

/** Where a learner finished last week, which decides this week's tier. */
async function tierAfter(userId: string, now: Date) {
  const last = leagueWeek(new Date(leagueWeek(now).start.getTime() - 1));
  const was = await prisma.leagueMember.findUnique({ where: { userId_week: { userId, week: last.key } } });
  if (!was) return 0;
  const group = await prisma.leagueMember.findMany({ where: { week: last.key, group: was.group }, select: { userId: true } });
  const xp = await xpBetween(
    group.map((g) => g.userId),
    last.start,
    last.end,
  );
  const mine = xp.get(userId) ?? 0;
  const ranked = [...group].sort((a, b) => (xp.get(b.userId) ?? 0) - (xp.get(a.userId) ?? 0));
  const rank = ranked.findIndex((g) => g.userId === userId) + 1;
  if (mine > 0 && rank <= PROMOTE) return Math.min(TIERS.length - 1, was.tier + 1);
  if (mine === 0 || (group.length > PROMOTE + DEMOTE && rank > group.length - DEMOTE)) return Math.max(0, was.tier - 1);
  return was.tier;
}

/**
 * Puts the learner in this week's league if they've earned XP and aren't in it yet. Called when XP is
 * earned and when the league is opened. Never throws.
 */
export async function joinLeague(userId: string, now = new Date()) {
  try {
    const week = leagueWeek(now);
    const existing = await prisma.leagueMember.findUnique({ where: { userId_week: { userId, week: week.key } } });
    if (existing) return existing;
    const earned = (await xpBetween([userId], week.start, week.end)).get(userId) ?? 0;
    if (!earned) return null;
    const tier = await tierAfter(userId, now);
    const groups = await prisma.leagueMember.groupBy({ by: ['group'], where: { week: week.key, tier }, _count: { _all: true }, orderBy: { group: 'asc' } });
    const open = groups.find((g) => g._count._all < GROUP_SIZE)?.group ?? `${week.key}:${tier}:${groups.length + 1}`;
    return await prisma.leagueMember.upsert({
      where: { userId_week: { userId, week: week.key } },
      create: { userId, week: week.key, tier, group: open },
      update: {},
    });
  } catch (err) {
    console.error('leagues: could not join', err);
    return null;
  }
}

const shown = {
  id: true,
  name: true,
  school: true,
  settings: true,
  streak: true,
  restriction: true,
  worldProfile: { select: { avatar: true, onLeaderboards: true, anonymous: true } },
} as const;

/** Ranks learners by XP, hiding blocked learners and those who chose (or were told) to stay off boards. */
async function board(viewer: User, ids: string[], from: Date, to: Date, friends = new Set<string>()) {
  const blocked = await blockedBetween(viewer.id);
  const [people, xp] = await Promise.all([prisma.user.findMany({ where: { id: { in: ids } }, select: shown }), xpBetween(ids, from, to)]);
  return people
    .filter(
      (p) => p.id === viewer.id || (!blocked.has(p.id) && (friends.has(p.id) || (p.worldProfile?.onLeaderboards !== false && !limited(p, 'leaderboards')))),
    )
    .map((p) => playerView(viewer, p, { friend: friends.has(p.id), xp: xp.get(p.id) ?? 0 }))
    .sort((a, b) => b.xp! - a.xp! || Number(b.me) - Number(a.me))
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

/** This week's league for the learner (joining it if they've earned XP). */
export async function leagueView(viewer: User, now = new Date()) {
  const week = leagueWeek(now);
  const member = await joinLeague(viewer.id, now);
  const base = { week: week.key, endsIn: week.end.getTime() - now.getTime(), promote: PROMOTE, groupSize: GROUP_SIZE };
  if (!member) return { ...base, joined: false as const, tier: TIERS[await tierAfter(viewer.id, now)], demote: 0, rows: [] };
  const group = await prisma.leagueMember.findMany({ where: { week: week.key, group: member.group }, select: { userId: true } });
  const rows = await board(
    viewer,
    group.map((g) => g.userId),
    week.start,
    week.end,
  );
  return { ...base, joined: true as const, tier: TIERS[member.tier], demote: member.tier > 0 ? DEMOTE : 0, rows };
}

/** This week's top learners at the viewer's school. */
export async function schoolView(viewer: User, now = new Date()) {
  const week = leagueWeek(now);
  if (!viewer.school?.trim()) return { week: week.key, school: null, rows: [] };
  const mates = await prisma.user.findMany({ where: { school: { equals: viewer.school.trim(), mode: 'insensitive' } }, select: { id: true }, take: 500 });
  const rows = (
    await board(
      viewer,
      mates.map((m) => m.id),
      week.start,
      week.end,
    )
  ).slice(0, 50);
  return { week: week.key, school: viewer.school.trim(), rows };
}

/** The viewer and their friends, by XP this week. */
export async function friendsBoard(viewer: User, friendIds: string[], now = new Date()) {
  const week = leagueWeek(now);
  return board(viewer, [viewer.id, ...friendIds], week.start, week.end, new Set(friendIds));
}
