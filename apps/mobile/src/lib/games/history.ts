import './history-text';

/** The ten-level ladder (the server's services/games/history.ts has the same): levels 1–4 are open to everyone, later ones open with a star on the level before. */
export const MAX_LEVEL = 10;
export const OPEN_LEVELS = 4;

/** The Museum of Time's picture (World Quests show it). Art: apps/server/scripts/history-art.ts. */
export const MUSEUM_SCENES: Record<'museum', number> = {
  museum: require('@/assets/images/world/history/scene-museum.webp'),
};

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
