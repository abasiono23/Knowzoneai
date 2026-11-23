/**
 * The chemistry ladder (the server's services/games/chemistry.ts has the same): ten levels, Starter to
 * Super hard, named like the word games (t(`games:levels.names.<key>`)). Levels up to OPEN_LEVELS are open
 * to everyone; later ones open with a star on the level before.
 */
export const MAX_LEVEL = 10;
export const OPEN_LEVELS = 4;

/** The chemistry lab hall's picture (World Quests show it). Art: apps/server/scripts/lab-art.ts. */
export const SCENES: Record<'hall', number> = {
  hall: require('@/assets/images/world/chemistry/scene-hall.webp'),
};
/** Scene pictures are 2:3 portrait. */
export const SCENE_ASPECT = 2 / 3;

/** Maps a scene position to the screen when the picture covers a box of w × h. */
export function coverMap(w: number, h: number, aspect = SCENE_ASPECT, panX = 0) {
  const scale = Math.max(w / aspect, h);
  const dw = scale * aspect;
  const dh = scale;
  const ox = (w - dw) / 2 + panX;
  const oy = (h - dh) / 2;
  return { dw, dh, ox, oy, x: (fx: number) => ox + fx * dw, y: (fy: number) => oy + fy * dh };
}

/** The play area's mapping from scene fractions to the screen (given to the chemistry games). */
export type CoverMap = ReturnType<typeof coverMap>;

// ─── Chemistry helpers ────────────────────────────────────────────────────────

const SUB: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
};
const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻' };
/**
 * Chemistry as it's printed: "Ca(OH)2 + 2HCl" → "Ca(OH)₂ + 2HCl" (digits after an element or a bracket
 * become subscripts), "Fe^3+" → "Fe³⁺", "10^-14" → "10⁻¹⁴". Coefficients and plain numbers stay as they are.
 */
export const sub = (text: string) =>
  text
    .replace(/\^([0-9]*[+-]|[+-]?[0-9]+)/g, (_, s: string) => s.replace(/[0-9+-]/g, (c) => SUP[c]!))
    .replace(/([A-Z][a-z]?|[)\]])(\d+)/g, (_, a: string, d: string) => a + d.replace(/\d/g, (c) => SUB[c]!));

/** Atoms in a formula, for the live atom count while balancing ("Ca(OH)2" → Ca 1, O 2, H 2). */
export function atomsOf(formula: string): Record<string, number> {
  let i = 0;
  const number = () => {
    const m = /^\d+/.exec(formula.slice(i));
    if (!m) return 1;
    i += m[0].length;
    return Number(m[0]);
  };
  const group = (): Record<string, number> => {
    const out: Record<string, number> = {};
    const add = (part: Record<string, number>, times: number) => {
      for (const [el, n] of Object.entries(part)) out[el] = (out[el] ?? 0) + n * times;
    };
    while (i < formula.length && formula[i] !== ')') {
      if (formula[i] === '(') {
        i++;
        const inner = group();
        i++;
        add(inner, number());
      } else {
        const m = /^[A-Z][a-z]?/.exec(formula.slice(i));
        if (!m) return out;
        i += m[0].length;
        add({ [m[0]]: 1 }, number());
      }
    }
    return out;
  };
  return group();
}

/** Glossy colours for model-kit atoms (the usual CPK colours). */
export const ATOM_COLORS: Record<string, [string, string]> = {
  H: ['#FFFFFF', '#C9CED6'],
  C: ['#4A4F57', '#15181D'],
  O: ['#FF6B6B', '#C81E1E'],
  N: ['#6EA8FF', '#1F4FD1'],
  Cl: ['#7CE38B', '#1E9E35'],
  F: ['#C8F7A1', '#6CBF3A'],
  S: ['#FFE066', '#D4A300'],
  Br: ['#C0574A', '#7A2016'],
};
