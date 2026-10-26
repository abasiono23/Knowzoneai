/**
 * The reward catalogue's rules: what each reward costs and when it can be redeemed. The server is the
 * source of truth (it checks every redemption and sends these to the app, which uses them over its
 * built-in copy). Names, pictures and descriptions live in the app (apps/mobile/src/lib/rewards/catalog.ts).
 * Coins only buy cosmetic things: no cash-outs, subscriptions, answers or progress.
 */
export type RewardRule = {
  id: string;
  price: number;
  /** Account level needed. */
  minLevel?: number;
  /** Local dates (inclusive) for seasonal rewards. */
  from?: string;
  until?: string;
  /** Can be redeemed more than once (boosts). */
  repeatable?: boolean;
};

export const REWARD_RULES: RewardRule[] = [
  { id: 'frame-gold', price: 120 },
  { id: 'frame-galaxy', price: 90 },
  { id: 'frame-kente', price: 200, minLevel: 5 },
  { id: 'frame-independence', price: 60, from: '2026-10-01', until: '2026-10-07' },
  { id: 'title-explorer', price: 40 },
  { id: 'title-scholar', price: 100, minLevel: 3 },
  { id: 'title-genius', price: 250, minLevel: 8 },
  { id: 'boost-freeze', price: 40, repeatable: true },
  // Avatar items (earned-only items, like the graduate hat, can't be bought).
  { id: 'hat-cap', price: 40 },
  { id: 'hat-gele', price: 80 },
  { id: 'hat-headphones', price: 60 },
  { id: 'hat-wizard', price: 150 },
  { id: 'glasses-round', price: 30 },
  { id: 'glasses-shades', price: 70 },
  { id: 'glasses-goggles', price: 50 },
  { id: 'outfit-ankara', price: 90 },
  { id: 'outfit-labcoat', price: 60 },
  { id: 'outfit-jersey', price: 100 },
  { id: 'bg-galaxy', price: 50 },
  { id: 'bg-jungle', price: 50 },
  { id: 'bg-ocean', price: 50 },
];

/** Seven-day daily reward cycle (matches the app). Missing a day pauses the cycle rather than resetting it. */
export const DAILY_CYCLE = [
  { coins: 5, xp: 10 },
  { coins: 5, xp: 10 },
  { coins: 10, xp: 15 },
  { coins: 10, xp: 15 },
  { coins: 15, xp: 20 },
  { coins: 15, xp: 20 },
  { coins: 30, xp: 40 },
];

/**
 * Rewards the app may ask for until Knowzone World is checked by the server: a game level or quest,
 * once each, with at most these amounts.
 */
export const GAME_REWARD_LIMITS = { xp: 120, coins: 60 };
export const GAME_REWARD_REASON = /^(game|quest):[A-Za-z0-9_-]{1,60}$/;
