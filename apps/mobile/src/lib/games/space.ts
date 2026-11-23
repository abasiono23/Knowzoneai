/** The ten-level ladder (the server's services/games/*.ts has the same); levels 1–4 are open to everyone. */
export const MAX_LEVEL = 10;
export const OPEN_LEVELS = 4;

/** The Space Academy's picture (World Quests show it). Art: apps/server/scripts/space-art.ts. */
export const SPACE_SCENES: Record<'academy', number> = {
  academy: require('@/assets/images/world/space/scene-academy.webp'),
};

// ─── Numbers ──────────────────────────────────────────────────────────────────

/** "1200" → "1 200", one decimal place at most (as the server writes them). */
export function num(n: number) {
  const rounded = Math.round(n * 10) / 10;
  const [whole, dec] = String(Math.abs(rounded)).split('.');
  return `${rounded < 0 ? '−' : ''}${whole!.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}${dec ? `.${dec}` : ''}`;
}
