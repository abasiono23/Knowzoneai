import { ART_BANK } from './bank/art.js';
import { CODE_BANK } from './bank/code.js';
import { HISTORY_BANK } from './bank/history.js';
import { LANGUAGE_BANK } from './bank/language.js';
import { MATH_BANK } from './bank/math.js';
import { NATURE_BANK } from './bank/nature.js';
import { SPACE_BANK } from './bank/space.js';
import { WORLD_IDS, WORLD_LEVELS, type BankLevel, type WorldBank, type WorldId } from './types.js';

/** Every world's checked question bank, levels 1–10. */
export const BANKS: Record<WorldId, WorldBank> = {
  space: SPACE_BANK,
  math: MATH_BANK,
  nature: NATURE_BANK,
  language: LANGUAGE_BANK,
  history: HISTORY_BANK,
  code: CODE_BANK,
  art: ART_BANK,
};

export const isWorldId = (id: string): id is WorldId => (WORLD_IDS as readonly string[]).includes(id);

/** One level of a world's bank, or null when the world or level doesn't exist. */
export function bankLevel(world: string, level: number): BankLevel | null {
  if (!isWorldId(world) || !Number.isInteger(level) || level < 1 || level > WORLD_LEVELS) return null;
  return BANKS[world][level] ?? null;
}
