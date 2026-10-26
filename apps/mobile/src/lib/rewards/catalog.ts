import i18n from '@/i18n';

import { getItem, SHOP } from '../world/avatar';

/**
 * The reward catalogue. Coins buy non-essential, cosmetic things only: no cash-outs, no
 * subscription credits, no answers or progress (PRD: “reward learning, not spending”).
 */

export type RewardKind = 'avatar' | 'frame' | 'title' | 'boost';
type AvatarSlot = 'hat' | 'glasses' | 'outfit' | 'background';

/**
 * Names, descriptions and title text are translated at render time with rewardName(),
 * rewardDescription() and rewardTitle(), looked up by id.
 */
export type Reward = {
  id: string;
  kind: RewardKind;
  price: number;
  rarity: 'common' | 'rare' | 'epic';
  emoji: string;
  /** Account level needed to redeem. */
  minLevel?: number;
  /** ISO dates (inclusive) for seasonal rewards. */
  from?: string;
  until?: string;
  /** Can be redeemed more than once (boosts). */
  repeatable?: boolean;
  /** Frame colours, for previews. */
  colors?: readonly [string, string];
  /** Avatar slot, for avatar items. */
  slot?: AvatarSlot;
};

const AVATAR_EMOJI: Record<string, string> = {
  hat: '🧢',
  glasses: '👓',
  outfit: '👕',
  background: '🖼️',
};

const AVATAR: Reward[] = SHOP.filter((i) => !i.earnedBy && i.slot !== 'boost').map((i) => ({
  id: i.id,
  kind: 'avatar',
  slot: i.slot as AvatarSlot,
  price: i.price,
  rarity: i.rarity,
  emoji: i.id === 'hat-gele' ? '👑' : AVATAR_EMOJI[i.slot],
}));

export const REWARDS: Reward[] = [
  {
    id: 'frame-gold',
    kind: 'frame',
    price: 120,
    rarity: 'rare',
    emoji: '🟡',
    colors: ['#FFC857', '#FF9F43'],
  },
  {
    id: 'frame-galaxy',
    kind: 'frame',
    price: 90,
    rarity: 'common',
    emoji: '🌌',
    colors: ['#7C5CFF', '#2DD4BF'],
  },
  {
    id: 'frame-kente',
    kind: 'frame',
    price: 200,
    rarity: 'epic',
    emoji: '🎨',
    minLevel: 5,
    colors: ['#FFC857', '#0E8F6E'],
  },
  {
    id: 'frame-independence',
    kind: 'frame',
    price: 60,
    rarity: 'rare',
    emoji: '🇳🇬',
    from: '2026-10-01',
    until: '2026-10-07',
    colors: ['#008751', '#FFFFFF'],
  },
  {
    id: 'title-explorer',
    kind: 'title',
    price: 40,
    rarity: 'common',
    emoji: '🧭',
  },
  {
    id: 'title-scholar',
    kind: 'title',
    price: 100,
    rarity: 'rare',
    emoji: '🎓',
    minLevel: 3,
  },
  {
    id: 'title-genius',
    kind: 'title',
    price: 250,
    rarity: 'epic',
    emoji: '💡',
    minLevel: 8,
  },
  {
    id: 'boost-freeze',
    kind: 'boost',
    price: 40,
    rarity: 'common',
    emoji: '❄️',
    repeatable: true,
  },
  ...AVATAR,
];

export const getReward = (id: string) => REWARDS.find((r) => r.id === id);

export type RewardRule = Pick<Reward, 'id' | 'price' | 'minLevel' | 'from' | 'until' | 'repeatable'>;

/**
 * Real mode: the server decides prices and availability (it checks every redemption), so its rules
 * replace the built-in ones. Rewards the server doesn't offer are removed. Changed in place, so
 * screens keep reading REWARDS and DAILY_CYCLE as before.
 */
export function applyRules(rules: RewardRule[], daily: { coins: number; xp: number }[]) {
  const byId = new Map(rules.map((r) => [r.id, r]));
  const kept = REWARDS.filter((r) => byId.has(r.id)).map((r) => {
    const rule = byId.get(r.id)!;
    return { ...r, price: rule.price, minLevel: rule.minLevel, from: rule.from, until: rule.until, repeatable: rule.repeatable };
  });
  REWARDS.splice(0, REWARDS.length, ...kept);
  if (daily.length) DAILY_CYCLE.splice(0, DAILY_CYCLE.length, ...daily);
}

/** Reward kinds in display order; labels are `rewards:kinds.<kind>`. */
export const KINDS: RewardKind[] = ['avatar', 'frame', 'title', 'boost'];

/** The reward's name in the current language. */
export const rewardName = (r: Pick<Reward, 'id'>): string =>
  i18n.t(`rewards:items.${r.id}.name` as 'rewards:items.frame-gold.name', {
    defaultValue: getItem(r.id)?.name ?? r.id,
  });

/** The reward's description in the current language. */
export function rewardDescription(r: Reward): string {
  if (r.kind === 'avatar' && r.slot) return i18n.t(`rewards:avatarDescription.${r.slot}`);
  return i18n.t(`rewards:items.${r.id}.description` as 'rewards:items.frame-gold.description');
}

/** The text a title reward shows under your name, or null for other rewards. */
export const rewardTitle = (r: Reward) =>
  r.kind === 'title' ? i18n.t(`rewards:items.${r.id}.title` as 'rewards:items.title-explorer.title') : null;

/** Why a reward can't be redeemed right now, or null if it can. */
export type Blocker = 'insufficient' | 'level' | 'not-yet' | 'expired' | 'owned';
export function blockerFor(
  r: Reward,
  ctx: { coins: number; level: number; owned: boolean; today: string },
): Blocker | null {
  if (!r.repeatable && ctx.owned) return 'owned';
  if (r.until && ctx.today > r.until) return 'expired';
  if (r.from && ctx.today < r.from) return 'not-yet';
  if (r.minLevel && ctx.level < r.minLevel) return 'level';
  if (ctx.coins < r.price) return 'insufficient';
  return null;
}

/** Seven-day daily-reward cycle. Missing a day pauses the cycle rather than resetting it. */
export const DAILY_CYCLE = [
  { coins: 5, xp: 10 },
  { coins: 5, xp: 10 },
  { coins: 10, xp: 15 },
  { coins: 10, xp: 15 },
  { coins: 15, xp: 20 },
  { coins: 15, xp: 20 },
  { coins: 30, xp: 40 },
];
