import type { DigSite, HistoryGameId } from '@/lib/api';

import type { Place } from './lab';

/**
 * The Museum of Time (2.5D): a museum hall the student walks around as a young explorer, the eras
 * the time machine visits, dig sites and landmarks. Positions are fractions of each scene picture.
 * Art: apps/server/scripts/history-art.ts.
 */
export type MuseumStation = 'timemachine' | 'dig' | 'maptable';

const img = {
  museum: require('@/assets/images/world/history/scene-museum.webp'),
  timemachine: require('@/assets/images/world/history/scene-timemachine.webp'),
  dig: require('@/assets/images/world/history/scene-dig.webp'),
  maptable: require('@/assets/images/world/history/scene-maptable.webp'),
  sea: require('@/assets/images/world/history/map-sea.webp'),
};
export const MUSEUM_SCENES: Record<MuseumStation | 'museum' | 'sea', number> = img;

export const ERA_SCENES: Record<string, number> = {
  nok: require('@/assets/images/world/history/era-nok.webp'),
  egypt: require('@/assets/images/world/history/era-egypt.webp'),
  ife: require('@/assets/images/world/history/era-ife.webp'),
  mali: require('@/assets/images/world/history/era-mali.webp'),
  benin: require('@/assets/images/world/history/era-benin.webp'),
  oyo: require('@/assets/images/world/history/era-oyo.webp'),
  sokoto: require('@/assets/images/world/history/era-sokoto.webp'),
  colonial: require('@/assets/images/world/history/era-colonial.webp'),
  independence: require('@/assets/images/world/history/era-independence.webp'),
  abuja: require('@/assets/images/world/history/era-abuja.webp'),
};

export const DIG_SCENES: Record<DigSite, number> = {
  savanna: require('@/assets/images/world/history/dig-savanna.webp'),
  desert: require('@/assets/images/world/history/dig-desert.webp'),
  stone: require('@/assets/images/world/history/dig-stone.webp'),
};

/** Artifacts: each civilization's own find, and the everyday ones. */
export const ARTIFACTS: Record<string, { src: number; aspect: number }> = {
  nok: { src: require('@/assets/images/world/history/artifact-nok.webp'), aspect: 167 / 300 },
  ife: { src: require('@/assets/images/world/history/artifact-ife.webp'), aspect: 150 / 300 },
  benin: { src: require('@/assets/images/world/history/artifact-benin.webp'), aspect: 232 / 300 },
  igboukwu: { src: require('@/assets/images/world/history/artifact-igboukwu.webp'), aspect: 210 / 300 },
  zimbabwe: { src: require('@/assets/images/world/history/artifact-zimbabwe.webp'), aspect: 157 / 300 },
  egypt: { src: require('@/assets/images/world/history/artifact-egypt.webp'), aspect: 230 / 300 },
  mali: { src: require('@/assets/images/world/history/artifact-mali.webp'), aspect: 441 / 300 },
  aksum: { src: require('@/assets/images/world/history/artifact-aksum.webp'), aspect: 301 / 300 },
  kush: { src: require('@/assets/images/world/history/artifact-kush.webp'), aspect: 375 / 300 },
  pottery: { src: require('@/assets/images/world/history/artifact-pottery.webp'), aspect: 265 / 300 },
  beads: { src: require('@/assets/images/world/history/artifact-beads.webp'), aspect: 252 / 300 },
  tool: { src: require('@/assets/images/world/history/artifact-tool.webp'), aspect: 303 / 300 },
};

export const LANDMARKS: Record<string, number> = {
  nigeria: require('@/assets/images/world/history/land-zuma.webp'),
  egypt: require('@/assets/images/world/history/land-pyramids.webp'),
  kenya: require('@/assets/images/world/history/land-maasaimara.webp'),
  southafrica: require('@/assets/images/world/history/land-tablemountain.webp'),
  ghana: require('@/assets/images/world/history/land-kakum.webp'),
  tanzania: require('@/assets/images/world/history/land-kilimanjaro.webp'),
  ethiopia: require('@/assets/images/world/history/land-lalibela.webp'),
  morocco: require('@/assets/images/world/history/land-sahara.webp'),
  mali: require('@/assets/images/world/history/land-djenne.webp'),
  zambia: require('@/assets/images/world/history/land-victoriafalls.webp'),
  senegal: require('@/assets/images/world/history/land-lacrose.webp'),
  botswana: require('@/assets/images/world/history/land-okavango.webp'),
  madagascar: require('@/assets/images/world/history/land-baobabs.webp'),
  namibia: require('@/assets/images/world/history/land-namib.webp'),
  drc: require('@/assets/images/world/history/land-congo.webp'),
  uganda: require('@/assets/images/world/history/land-murchison.webp'),
};

export const EXPLORER = {
  back: { src: require('@/assets/images/world/history/student-back.webp'), aspect: 306 / 900 },
  walk: { src: require('@/assets/images/world/history/student-walk.webp'), aspect: 368 / 900 },
  side: { src: require('@/assets/images/world/history/student-side.webp'), aspect: 452 / 900 },
  front: { src: require('@/assets/images/world/history/student-front.webp'), aspect: 423 / 900 },
};

// ─── The museum ───────────────────────────────────────────────────────────────

export const MUSEUM_STATIONS: Record<
  MuseumStation,
  { stand: [number, number]; label: [number, number]; icon: string; games: HistoryGameId[] }
> = {
  timemachine: { stand: [0.32, 0.79], label: [0.22, 0.32], icon: 'time', games: ['time-machine'] },
  dig: { stand: [0.55, 0.71], label: [0.53, 0.44], icon: 'hammer', games: ['lost-civilization'] },
  maptable: { stand: [0.7, 0.82], label: [0.82, 0.38], icon: 'earth', games: ['africa-explorer'] },
};
export const MUSEUM_STATION_OF: Record<HistoryGameId, MuseumStation> = {
  'time-machine': 'timemachine',
  'lost-civilization': 'dig',
  'africa-explorer': 'maptable',
};

const walkers = { back: EXPLORER.back, walk: EXPLORER.walk, side: EXPLORER.side };

export const MUSEUM: Place<MuseumStation> = {
  scene: img.museum,
  stations: MUSEUM_STATIONS,
  walk: [
    [0.7, 0.45, 0.66],
    [0.78, 0.3, 0.7],
    [0.97, 0.06, 0.94],
  ],
  start: [0.5, 0.93],
  height: [0.36, 0.2],
  sprites: walkers,
};

/** Outdoor places (eras, digs): open ground in the lower half, spots to walk to. */
function outdoors<S extends string>(scene: number, stations: Place<S>['stations']): Place<S> {
  return {
    scene,
    stations,
    walk: [
      [0.64, 0.2, 0.8],
      [0.95, 0.08, 0.92],
    ],
    start: [0.5, 0.94],
    height: [0.36, 0.2],
    sprites: walkers,
  };
}

export type EraSpot = 'a' | 'b';
export const eraPlace = (id: string) =>
  outdoors<EraSpot>(ERA_SCENES[id] ?? ERA_SCENES.independence!, {
    a: { stand: [0.3, 0.72], label: [0.27, 0.6], icon: 'help-circle' },
    b: { stand: [0.7, 0.7], label: [0.73, 0.58], icon: 'help-circle' },
  });

export type DigSpot = 'a' | 'b' | 'c';
export const digPlace = (site: DigSite) =>
  outdoors<DigSpot>(DIG_SCENES[site], {
    a: { stand: [0.26, 0.7], label: [0.24, 0.6], icon: 'hammer' },
    b: { stand: [0.72, 0.68], label: [0.76, 0.58], icon: 'hammer' },
    c: { stand: [0.5, 0.86], label: [0.5, 0.76], icon: 'hammer' },
  });

// ─── The map of Africa ────────────────────────────────────────────────────────

/** The coast of mainland Africa, simplified ([longitude, latitude], clockwise from Tangier). */
export const AFRICA: [number, number][] = [
  [-5.9, 35.8],
  [-1.9, 35.1],
  [3.0, 36.8],
  [10.2, 37.2],
  [11.1, 35.2],
  [10.1, 33.9],
  [11.5, 33.1],
  [15.2, 32.3],
  [18.0, 30.5],
  [20.1, 32.1],
  [23.0, 32.6],
  [25.1, 31.6],
  [29.9, 31.2],
  [32.3, 31.3],
  [34.2, 31.3],
  [34.9, 29.5],
  [33.9, 27.6],
  [32.6, 29.9],
  [33.9, 26.6],
  [35.5, 24.0],
  [37.2, 21.0],
  [37.4, 18.8],
  [38.6, 17.9],
  [39.7, 15.6],
  [41.7, 13.9],
  [43.3, 12.6],
  [43.1, 11.5],
  [44.5, 10.4],
  [47.0, 11.1],
  [51.2, 11.8],
  [51.0, 10.4],
  [49.0, 6.0],
  [46.9, 3.4],
  [45.3, 2.0],
  [42.5, -0.5],
  [41.5, -1.8],
  [39.7, -4.1],
  [39.3, -6.8],
  [40.4, -10.5],
  [40.6, -14.5],
  [39.0, -17.0],
  [34.8, -19.8],
  [35.5, -22.0],
  [35.5, -24.0],
  [32.6, -25.9],
  [31.0, -29.9],
  [27.9, -33.0],
  [25.6, -34.0],
  [20.0, -34.8],
  [18.4, -34.2],
  [17.9, -32.6],
  [16.5, -28.6],
  [15.2, -26.6],
  [14.5, -22.9],
  [11.8, -17.3],
  [12.2, -13.9],
  [13.4, -12.6],
  [13.2, -8.8],
  [12.3, -6.0],
  [11.8, -4.8],
  [9.3, -1.4],
  [8.8, -0.7],
  [9.5, 1.0],
  [9.8, 3.0],
  [9.7, 4.0],
  [8.5, 4.5],
  [6.0, 4.3],
  [5.3, 5.9],
  [3.4, 6.4],
  [-0.2, 5.6],
  [-2.1, 4.7],
  [-4.0, 5.3],
  [-7.7, 4.4],
  [-10.8, 6.3],
  [-13.2, 8.5],
  [-13.7, 9.5],
  [-15.6, 11.9],
  [-16.8, 13.5],
  [-17.5, 14.7],
  [-16.5, 16.0],
  [-16.0, 18.1],
  [-17.0, 20.8],
  [-15.9, 23.7],
  [-14.5, 26.1],
  [-12.9, 27.9],
  [-9.6, 30.4],
  [-7.6, 33.6],
  [-6.8, 34.0],
];
export const MADAGASCAR: [number, number][] = [
  [49.3, -12.0],
  [50.5, -15.5],
  [49.4, -18.0],
  [48.0, -22.5],
  [47.1, -24.9],
  [45.2, -25.6],
  [43.7, -23.4],
  [43.3, -21.0],
  [44.4, -16.2],
  [46.3, -15.7],
  [47.9, -13.6],
];
/** Big rivers and Lake Victoria, to find your way. */
export const RIVERS: [number, number][][] = [
  // Nile
  [
    [33.0, 0.0],
    [32.5, 4.0],
    [31.5, 9.5],
    [32.5, 15.6],
    [33.5, 19.0],
    [31.0, 22.0],
    [32.9, 24.0],
    [31.2, 30.0],
  ],
  // Niger
  [
    [-10.5, 9.2],
    [-8.0, 12.5],
    [-4.0, 14.5],
    [-3.0, 16.8],
    [0.0, 16.3],
    [2.0, 13.5],
    [4.5, 11.0],
    [6.7, 7.8],
    [6.2, 4.8],
  ],
  // Congo
  [
    [25.5, 0.5],
    [22.0, 2.0],
    [18.0, 1.0],
    [16.0, -2.0],
    [15.3, -4.3],
    [12.4, -6.0],
  ],
  // Zambezi
  [
    [22.5, -13.0],
    [24.0, -17.5],
    [25.8, -17.9],
    [28.5, -16.5],
    [31.0, -15.6],
    [33.5, -16.5],
    [35.5, -18.5],
  ],
];
export const LAKE_VICTORIA = { at: [33.0, -1.0] as [number, number], rx: 1.6, ry: 1.4 };

/** The map's edges ([west, east] longitude, [north, south] latitude). */
export const MAP_BOUNDS = { lon: [-19, 53] as [number, number], lat: [38, -36] as [number, number] };

/** Map ([lon, lat]) ↔ screen, for a map drawn in a box of w × h (aspect kept, centred). */
export function mapProjection(w: number, h: number) {
  const spanLon = MAP_BOUNDS.lon[1] - MAP_BOUNDS.lon[0];
  const spanLat = MAP_BOUNDS.lat[0] - MAP_BOUNDS.lat[1];
  const scale = Math.min(w / spanLon, h / spanLat);
  const ox = (w - spanLon * scale) / 2;
  const oy = (h - spanLat * scale) / 2;
  return {
    scale,
    x: (lon: number) => ox + (lon - MAP_BOUNDS.lon[0]) * scale,
    y: (lat: number) => oy + (MAP_BOUNDS.lat[0] - lat) * scale,
    toLonLat: (x: number, y: number): [number, number] => [
      Math.round(((x - ox) / scale + MAP_BOUNDS.lon[0]) * 100) / 100,
      Math.round((MAP_BOUNDS.lat[0] - (y - oy) / scale) * 100) / 100,
    ],
  };
}
