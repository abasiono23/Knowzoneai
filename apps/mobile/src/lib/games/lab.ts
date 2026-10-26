import type { ChemGameId, Glassware, LabReagent, LabTest } from '@/lib/api';

/**
 * The chemistry lab (2.5D): a realistic lab hall the student walks around, and close-up stations.
 * Positions are fractions of each scene picture (x across, y down). Art: apps/server/scripts/lab-art.ts.
 */
export type StationId = 'shelves' | 'glassware' | 'bench' | 'cabinet' | 'models' | 'board';

export const SCENES: Record<'hall' | StationId, number> = {
  hall: require('@/assets/images/world/chemistry/scene-hall.webp'),
  shelves: require('@/assets/images/world/chemistry/scene-shelves.webp'),
  glassware: require('@/assets/images/world/chemistry/scene-glassware.webp'),
  bench: require('@/assets/images/world/chemistry/scene-bench.webp'),
  cabinet: require('@/assets/images/world/chemistry/scene-cabinet.webp'),
  models: require('@/assets/images/world/chemistry/scene-models.webp'),
  board: require('@/assets/images/world/chemistry/scene-board.webp'),
};
/** Scene pictures are 2:3 portrait. */
export const SCENE_ASPECT = 2 / 3;

export const STUDENT = {
  back: { src: require('@/assets/images/world/chemistry/student-back.webp'), aspect: 284 / 900 },
  walk: { src: require('@/assets/images/world/chemistry/student-walk.webp'), aspect: 324 / 900 },
  side: { src: require('@/assets/images/world/chemistry/student-side.webp'), aspect: 517 / 900 },
};

export const ITEMS = {
  bottle: { src: require('@/assets/images/world/chemistry/item-bottle.webp'), aspect: 187 / 360 },
  brown: { src: require('@/assets/images/world/chemistry/item-bottle-brown.webp'), aspect: 190 / 360 },
  dropper: { src: require('@/assets/images/world/chemistry/item-dropper.webp'), aspect: 144 / 360 },
  jar: { src: require('@/assets/images/world/chemistry/item-jar.webp'), aspect: 292 / 360 },
  beaker: { src: require('@/assets/images/world/chemistry/item-beaker.webp'), aspect: 282 / 360 },
  flask: { src: require('@/assets/images/world/chemistry/item-flask.webp'), aspect: 237 / 360 },
  tube: { src: require('@/assets/images/world/chemistry/item-tube.webp'), aspect: 72 / 360 },
  litmus: { src: require('@/assets/images/world/chemistry/item-litmus.webp'), aspect: 437 / 360 },
  magnesium: { src: require('@/assets/images/world/chemistry/item-magnesium.webp'), aspect: 427 / 360 },
  burner: { src: require('@/assets/images/world/chemistry/item-burner.webp'), aspect: 163 / 360 },
  phmeter: { src: require('@/assets/images/world/chemistry/item-phmeter.webp'), aspect: 92 / 360 },
} as const;
export type ItemArt = keyof typeof ITEMS;

export const bottleArt = (r: Pick<LabReagent, 'bottle'>): ItemArt =>
  r.bottle === 'brown' ? 'brown' : r.bottle === 'dropper' ? 'dropper' : r.bottle === 'solid' ? 'jar' : 'bottle';

/** The equipment used for each Mystery Substance test. */
export const TEST_ART: Record<LabTest, ItemArt> = {
  litmus: 'litmus',
  ph: 'phmeter',
  mg: 'magnesium',
  flame: 'burner',
  agno3: 'dropper',
  naoh: 'dropper',
  bacl2: 'dropper',
};

// ─── The hall ─────────────────────────────────────────────────────────────────

/** Where the student stands to use a station, and where its label floats. */
export const STATIONS: Record<
  StationId,
  { stand: [number, number]; label: [number, number]; games: ChemGameId[]; icon: string }
> = {
  shelves: { stand: [0.43, 0.565], label: [0.2, 0.34], games: [], icon: 'flask' },
  board: { stand: [0.5, 0.54], label: [0.45, 0.28], games: ['reaction-rush'], icon: 'easel' },
  cabinet: { stand: [0.6, 0.545], label: [0.71, 0.3], games: ['element-quest'], icon: 'cube' },
  glassware: { stand: [0.61, 0.6], label: [0.86, 0.46], games: [], icon: 'beaker' },
  models: { stand: [0.385, 0.7], label: [0.18, 0.56], games: ['molecule-builder'], icon: 'git-network' },
  bench: { stand: [0.5, 0.86], label: [0.76, 0.66], games: ['mixture-lab', 'mystery-substance'], icon: 'color-filter' },
};
export const STATION_OF: Record<ChemGameId, StationId> = {
  'mixture-lab': 'bench',
  'mystery-substance': 'bench',
  'element-quest': 'cabinet',
  'molecule-builder': 'models',
  'reaction-rush': 'board',
};

// ─── Walkable places ──────────────────────────────────────────────────────────

type Sprite = { src: number; aspect: number };
/**
 * A 2.5D place the student walks around (the lab hall, the Space Academy, a planet's surface):
 * its picture, its stations, and the floor you can walk on.
 */
export type Place<S extends string = string> = {
  scene: number;
  stations: Record<S, { stand: [number, number]; label: [number, number]; icon: string }>;
  /** The floor: x range at a few depths (y), interpolated between them. */
  walk: [number, number, number][];
  start: [number, number];
  /** The student's height (fraction of the scene height) at the nearest and furthest depth. */
  height: [near: number, far: number];
  sprites: { back: Sprite; walk: Sprite; side: Sprite };
};

function walkLimits(place: Place, y: number): [number, number] {
  const walk = place.walk;
  const k = Math.max(0, walk.findIndex(([wy]) => wy >= y) - 1);
  const [y0, a0, b0] = walk[k]!;
  const [y1, a1, b1] = walk[Math.min(k + 1, walk.length - 1)]!;
  const t = y1 === y0 ? 0 : Math.min(1, Math.max(0, (y - y0) / (y1 - y0)));
  return [a0 + (a1 - a0) * t, b0 + (b1 - b0) * t];
}

export function clampWalk(place: Place, x: number, y: number): [number, number] {
  const cy = Math.min(place.walk.at(-1)![0], Math.max(place.walk[0]![0], y));
  const [a, b] = walkLimits(place, cy);
  return [Math.min(b, Math.max(a, x)), cy];
}

/** The student's height (fraction of the scene height) at a depth: smaller further away. */
export function studentHeight(place: Place, y: number) {
  const top = place.walk[0]![0];
  const bottom = place.walk.at(-1)![0];
  const t = bottom === top ? 1 : (y - top) / (bottom - top);
  return place.height[1] + (place.height[0] - place.height[1]) * t;
}

export function nearestStation<S extends string>(place: Place<S>, x: number, y: number): S | null {
  let best: S | null = null;
  let dist = 0.07;
  for (const [id, s] of Object.entries(place.stations) as [S, Place['stations'][string]][]) {
    const d = Math.hypot((x - s.stand[0]) * SCENE_ASPECT, y - s.stand[1]);
    if (d < dist) {
      dist = d;
      best = id;
    }
  }
  return best;
}

/** The chemistry lab hall. */
export const LAB_PLACE: Place<StationId> = {
  scene: SCENES.hall,
  stations: STATIONS,
  walk: [
    [0.535, 0.42, 0.63],
    [0.64, 0.38, 0.62],
    [0.67, 0.37, 0.53],
    [0.9, 0.31, 0.55],
  ],
  start: [0.46, 0.8],
  height: [0.12 + (0.9 - 0.535) * 1.2, 0.12],
  sprites: STUDENT,
};

// ─── Stations: where things go ────────────────────────────────────────────────

/** Bottles stand on these lines (y) on the shelves picture, across this x range. */
/** Bottles stand on these lines (y); the top shelf is left free for the objective panel. */
export const SHELF_ROWS = [0.365, 0.525, 0.745];
export const SHELF_X: [number, number] = [0.2, 0.8];
export const CABINET_ROWS = [0.395, 0.515, 0.635];
export const CABINET_X = [0.34, 0.5, 0.66];
export const GLASSWARE_SPOTS: Record<Glassware, [number, number]> = {
  beaker: [0.26, 0.74],
  flask: [0.41, 0.74],
  tube: [0.54, 0.74],
};

/** Maps a scene position to the screen when the picture covers a box of w × h. */
export function coverMap(w: number, h: number, aspect = SCENE_ASPECT, panX = 0) {
  const scale = Math.max(w / aspect, h);
  const dw = scale * aspect;
  const dh = scale;
  const ox = (w - dw) / 2 + panX;
  const oy = (h - dh) / 2;
  return { dw, dh, ox, oy, x: (fx: number) => ox + fx * dw, y: (fy: number) => oy + fy * dh };
}

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
/** "Ca(OH)2 + 2HCl" → "Ca(OH)₂ + 2HCl": digits after a letter or bracket become subscripts. */
export const sub = (text: string) =>
  text.replace(/([A-Za-z)])(\d+)/g, (_, a: string, d: string) => a + d.replace(/\d/g, (c) => SUB[c]!));

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
