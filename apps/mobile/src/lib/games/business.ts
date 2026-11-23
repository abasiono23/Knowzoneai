import './business-text';

/** The ten-level ladder (the server's services/games/business.ts has the same): levels 1–4 are open to everyone, later ones open with a star on the level before. */
export const MAX_LEVEL = 10;
export const OPEN_LEVELS = 4;

/**
 * The Business District's games: the server runs every simulation turn
 * (apps/server/src/services/games/business.ts); the app only plans and shows the results.
 */

/** Money in the games: a made-up currency, whole dollars unless it has cents. */
export function money(n: number) {
  const abs = Math.abs(n);
  const text = abs.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(abs) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return n < 0 ? `−$${text}` : `$${text}`;
}
/** A share as a signed percent, e.g. 0.034 → "+3.4%". */
export const pct = (n: number) => `${n >= 0 ? '+' : '−'}${Math.abs(Math.round(n * 1000) / 10)}%`;
