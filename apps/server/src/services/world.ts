import { z } from 'zod';

import { REWARD_RULES } from '../data/rewards.js';
import { ACHIEVEMENT_ITEMS, AVATAR_PARTS, QUEST_ITEMS } from '../data/world-items.js';
import { prisma } from '../db.js';
import type { User } from '../generated/prisma/client.js';
import { AppError } from '../lib/errors.js';
import { settingsOf } from './account.js';

/**
 * A learner's Knowzone World profile on the server: their avatar (what others see on leagues and
 * friends), the cosmetics they own, and whether they appear on leaderboards.
 */
const ITEMS = new Set([...REWARD_RULES.filter((r) => /^(hat|glasses|outfit|bg)-/.test(r.id)).map((r) => r.id), ...ACHIEVEMENT_ITEMS, ...QUEST_ITEMS]);
const HEX = /^#[0-9A-Fa-f]{6}$/;

export const Avatar = z.object({
  skin: z.string().regex(HEX),
  hair: z.enum(AVATAR_PARTS.hairs as [string, ...string[]]),
  hairColor: z.string().regex(HEX),
  eyes: z.enum(AVATAR_PARTS.eyes as [string, ...string[]]),
  mouth: z.enum(AVATAR_PARTS.mouths as [string, ...string[]]),
  /** A colour, or an outfit item. */
  outfit: z.string().max(30),
  /** A free background, or a background item. */
  background: z.string().max(30),
  hat: z.string().max(30).optional(),
  glasses: z.string().max(30).optional(),
  name: z.string().trim().max(30).default(''),
});
export type AvatarConfig = z.infer<typeof Avatar>;

export async function worldProfile(userId: string) {
  return prisma.worldProfile.upsert({ where: { userId }, create: { userId }, update: {} });
}

/** Everything the learner owns: won items plus bought ones. */
export async function ownedItems(userId: string, known?: { earned: string[] }) {
  // The profile is made first (making it twice at once would clash).
  const profile = known ?? (await worldProfile(userId));
  const bought = await prisma.redemption.findMany({ where: { userId }, select: { rewardId: true }, distinct: ['rewardId'] });
  return [...new Set([...profile.earned, ...bought.map((b) => b.rewardId).filter((id) => ITEMS.has(id))])];
}

/** Checks every item on an avatar is free or owned. */
export async function saveAvatar(userId: string, avatar: AvatarConfig) {
  const owned = new Set(await ownedItems(userId));
  const outfitOk = HEX.test(avatar.outfit) || owned.has(avatar.outfit);
  const backgroundOk = AVATAR_PARTS.backgrounds.includes(avatar.background) || owned.has(avatar.background);
  const extras = [avatar.hat, avatar.glasses].filter((x): x is string => !!x);
  if (!outfitOk || !backgroundOk || extras.some((x) => !owned.has(x))) throw new AppError(403, 'You don’t own one of those items yet', 'not-owned');
  return prisma.worldProfile.upsert({ where: { userId }, create: { userId, avatar }, update: { avatar } });
}

/** Adds items won (achievement items the app worked out, or quest items from chests). */
export async function earnItems(userId: string, items: string[]) {
  const profile = await worldProfile(userId);
  const fresh = items.filter((id) => !profile.earned.includes(id));
  if (fresh.length) await prisma.worldProfile.update({ where: { userId }, data: { earned: { push: fresh } } });
  return fresh;
}

/** The next quest item the learner hasn't won yet (or none once they have them all). */
export async function nextQuestItem(userId: string) {
  const profile = await worldProfile(userId);
  return QUEST_ITEMS.find((id) => !profile.earned.includes(id)) ?? null;
}

// ─── How other learners see you ───────────────────────────────────────────────

type Viewer = Pick<User, 'id' | 'school'>;
type Target = Pick<User, 'id' | 'name' | 'school' | 'settings' | 'streak'> & { worldProfile?: { avatar: unknown; anonymous?: boolean } | null };

const sameSchool = (a?: string | null, b?: string | null) => !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Another learner as the viewer may see them. Their name ("Tobi A.") and avatar show when their
 * privacy setting allows it: everyone, their school, or their friends. Otherwise they're "a learner".
 */
export function playerView(viewer: Viewer, t: Target, extra: { friend?: boolean; xp?: number } = {}) {
  const visibility = settingsOf(t as User).privacy.profileVisibility;
  const me = viewer.id === t.id;
  const visible =
    me || extra.friend || (!t.worldProfile?.anonymous && (visibility === 'everyone' || (visibility === 'school' && sameSchool(viewer.school, t.school))));
  const [first, last] = t.name.trim().split(/\s+/);
  return {
    id: t.id,
    me,
    name: visible ? `${first}${last ? ` ${last[0]}.` : ''}` : null,
    avatar: visible ? ((t.worldProfile?.avatar as AvatarConfig | null) ?? null) : null,
    streak: t.streak,
    ...(extra.xp !== undefined && { xp: extra.xp }),
  };
}

/** Learners who blocked the viewer or whom the viewer blocked: never shown to each other. */
export async function blockedBetween(userId: string) {
  const rows = await prisma.blockedUser.findMany({ where: { OR: [{ userId }, { blockedId: userId }] }, select: { userId: true, blockedId: true } });
  return new Set(rows.map((r) => (r.userId === userId ? r.blockedId : r.userId)));
}
