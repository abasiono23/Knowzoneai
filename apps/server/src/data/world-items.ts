/**
 * Knowzone World cosmetics the server needs to know about. Items you buy are in the reward
 * catalogue (`rewards.ts`, kept as Redemptions); these are the ones you win.
 */

/** Won from achievements (worked out in the app); the app may report them. Cosmetic only. */
export const ACHIEVEMENT_ITEMS = ['hat-graduate', 'hat-crown', 'outfit-astronaut', 'bg-gold'];

/** Won only from the weekly journey chest, one per finished journey, in this order. */
export const QUEST_ITEMS = ['hat-explorer', 'outfit-explorer', 'bg-nebula', 'bg-savanna'];

/** What a drawn avatar may be made of. Free choices first; item ids must be owned. */
export const AVATAR_PARTS = {
  hairs: ['short', 'afro', 'puffs', 'braids', 'bun', 'fade', 'locs'],
  eyes: ['round', 'happy', 'wink'],
  mouths: ['smile', 'grin', 'open'],
  /** Free backgrounds (others are bg-* items). */
  backgrounds: ['violet', 'teal', 'sunset'],
};
