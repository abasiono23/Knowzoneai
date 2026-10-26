import type { SpaceGameId } from '@/lib/api';

import type { Place } from './lab';

/**
 * The Space Academy (2.5D): a station hall the student walks around in a space suit, its stations,
 * and the planets' surfaces for Solar System Explorer. Positions are fractions of each scene picture
 * (x across, y down). Art: apps/server/scripts/space-art.ts.
 */
export type SpaceStation = 'hangar' | 'workshop' | 'gravity' | 'observatory';

const art = {
  academy: require('@/assets/images/world/space/scene-academy.webp'),
  hangar: require('@/assets/images/world/space/scene-hangar.webp'),
  workshop: require('@/assets/images/world/space/scene-workshop.webp'),
  gravity: require('@/assets/images/world/space/scene-gravity.webp'),
  observatory: require('@/assets/images/world/space/scene-observatory.webp'),
  space: require('@/assets/images/world/space/bg-space.webp'),
};
export const SPACE_SCENES: Record<SpaceStation | 'academy' | 'space', number> = art;

export const SURFACES: Record<string, number> = {
  moon: require('@/assets/images/world/space/surface-moon.webp'),
  mercury: require('@/assets/images/world/space/surface-mercury.webp'),
  venus: require('@/assets/images/world/space/surface-venus.webp'),
  mars: require('@/assets/images/world/space/surface-mars.webp'),
  europa: require('@/assets/images/world/space/surface-europa.webp'),
  titan: require('@/assets/images/world/space/surface-titan.webp'),
  miranda: require('@/assets/images/world/space/surface-miranda.webp'),
  triton: require('@/assets/images/world/space/surface-triton.webp'),
};

export const ASTRONAUT = {
  back: { src: require('@/assets/images/world/space/student-back.webp'), aspect: 616 / 900 },
  walk: { src: require('@/assets/images/world/space/student-walk.webp'), aspect: 616 / 900 },
  side: { src: require('@/assets/images/world/space/student-side.webp'), aspect: 627 / 900 },
};

export const SPRITES = {
  ship: { src: require('@/assets/images/world/space/ship-player.webp'), aspect: 321 / 300 },
  boss: { src: require('@/assets/images/world/space/boss.webp'), aspect: 446 / 420 },
  enemy: { src: require('@/assets/images/world/space/enemy.webp'), aspect: 346 / 300 },
  asteroid1: { src: require('@/assets/images/world/space/asteroid-1.webp'), aspect: 320 / 300 },
  asteroid2: { src: require('@/assets/images/world/space/asteroid-2.webp'), aspect: 294 / 300 },
};

/**
 * The rocket, in realistic sections that stack. `body` is the share of each picture's width taken by
 * the rocket body where it joins the next section, so every section is drawn at the same diameter.
 */
export const ROCKET = {
  nose: { src: require('@/assets/images/world/space/rocket-fairing.webp'), aspect: 203 / 700, body: 0.821 },
  capsule: { src: require('@/assets/images/world/space/rocket-capsule.webp'), aspect: 253 / 700, body: 0.943 },
  tank: { src: require('@/assets/images/world/space/rocket-tank.webp'), aspect: 130 / 900, body: 1 },
  spark: { src: require('@/assets/images/world/space/rocket-engine-spark.webp'), aspect: 236 / 800, body: 0.979 },
  nova: { src: require('@/assets/images/world/space/rocket-engine-nova.webp'), aspect: 531 / 800, body: 0.552 },
  titan: { src: require('@/assets/images/world/space/rocket-engine-titan.webp'), aspect: 219 / 800, body: 0.797 },
  ion: { src: require('@/assets/images/world/space/rocket-engine-ion.webp'), aspect: 318 / 800, body: 0.564 },
  plume: { src: require('@/assets/images/world/space/rocket-plume.webp'), aspect: 152 / 700 },
  smoke: { src: require('@/assets/images/world/space/rocket-smoke.webp'), aspect: 983 / 400 },
};

/** Planet pictures (round, transparent); Saturn and Uranus are wider because of their rings. */
export const PLANETS: Record<string, { src: number; aspect: number }> = {
  sun: { src: require('@/assets/images/world/space/planet-sun.webp'), aspect: 291 / 300 },
  mercury: { src: require('@/assets/images/world/space/planet-mercury.webp'), aspect: 292 / 300 },
  venus: { src: require('@/assets/images/world/space/planet-venus.webp'), aspect: 295 / 300 },
  earth: { src: require('@/assets/images/world/space/planet-earth.webp'), aspect: 303 / 300 },
  moon: { src: require('@/assets/images/world/space/planet-moon.webp'), aspect: 299 / 300 },
  mars: { src: require('@/assets/images/world/space/planet-mars.webp'), aspect: 273 / 300 },
  jupiter: { src: require('@/assets/images/world/space/planet-jupiter.webp'), aspect: 300 / 300 },
  saturn: { src: require('@/assets/images/world/space/planet-saturn.webp'), aspect: 497 / 300 },
  uranus: { src: require('@/assets/images/world/space/planet-uranus.webp'), aspect: 339 / 300 },
  neptune: { src: require('@/assets/images/world/space/planet-neptune.webp'), aspect: 302 / 300 },
};
export const PLANET_ORDER = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'] as const;

// ─── The hub ──────────────────────────────────────────────────────────────────

export const SPACE_STATIONS: Record<
  SpaceStation,
  { stand: [number, number]; label: [number, number]; icon: string; games: SpaceGameId[] }
> = {
  hangar: { stand: [0.2, 0.8], label: [0.16, 0.6], icon: 'rocket', games: ['galaxy-defender', 'asteroid-survival'] },
  workshop: { stand: [0.26, 0.7], label: [0.18, 0.46], icon: 'construct', games: ['rocket-builder'] },
  gravity: { stand: [0.66, 0.72], label: [0.74, 0.44], icon: 'planet', games: ['gravity-master'] },
  observatory: { stand: [0.78, 0.84], label: [0.86, 0.62], icon: 'telescope', games: ['solar-explorer'] },
};
export const SPACE_STATION_OF: Record<SpaceGameId, SpaceStation> = {
  'galaxy-defender': 'hangar',
  'asteroid-survival': 'hangar',
  'rocket-builder': 'workshop',
  'gravity-master': 'gravity',
  'solar-explorer': 'observatory',
};

export const ACADEMY: Place<SpaceStation> = {
  scene: art.academy,
  stations: SPACE_STATIONS,
  walk: [
    [0.68, 0.18, 0.8],
    [0.8, 0.1, 0.88],
    [0.96, 0.06, 0.94],
  ],
  start: [0.5, 0.92],
  height: [0.36, 0.16],
  sprites: ASTRONAUT,
};

/** A planet's surface: three spots to scan. */
export type ScanSpot = 'a' | 'b' | 'c';
export const surfacePlace = (id: string): Place<ScanSpot> => ({
  scene: SURFACES[id] ?? SURFACES.moon!,
  stations: {
    a: { stand: [0.26, 0.7], label: [0.24, 0.6], icon: 'scan' },
    b: { stand: [0.72, 0.68], label: [0.76, 0.58], icon: 'scan' },
    c: { stand: [0.5, 0.86], label: [0.5, 0.76], icon: 'scan' },
  },
  walk: [
    [0.64, 0.2, 0.8],
    [0.95, 0.08, 0.92],
  ],
  start: [0.5, 0.94],
  height: [0.36, 0.18],
  sprites: ASTRONAUT,
});

// ─── Numbers ──────────────────────────────────────────────────────────────────

/** "1200" → "1 200", one decimal place at most (as the server writes them). */
export function num(n: number) {
  const rounded = Math.round(n * 10) / 10;
  const [whole, dec] = String(Math.abs(rounded)).split('.');
  return `${rounded < 0 ? '−' : ''}${whole!.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}${dec ? `.${dec}` : ''}`;
}
