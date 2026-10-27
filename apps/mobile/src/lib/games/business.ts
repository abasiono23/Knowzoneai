import type { BusinessGameId } from '@/lib/api';

import type { Place } from './lab';

/**
 * The Business District (2.5D): a sunny city square the entrepreneur walks around in her emerald
 * blazer, and its five buildings. Positions are fractions of each scene picture. Art:
 * apps/server/scripts/business-art.ts. The server runs every simulation turn
 * (apps/server/src/services/games/business.ts); the app only plans and shows the results.
 */
export type BusinessStation = 'startup' | 'budget' | 'market' | 'factory' | 'exchange';

const img = {
  hub: require('@/assets/images/world/business/scene-hub.webp'),
  startup: require('@/assets/images/world/business/scene-startup.webp'),
  budget: require('@/assets/images/world/business/scene-budget.webp'),
  market: require('@/assets/images/world/business/scene-market.webp'),
  factory: require('@/assets/images/world/business/scene-factory.webp'),
  exchange: require('@/assets/images/world/business/scene-exchange.webp'),
};
export const BUSINESS_SCENES: Record<BusinessStation | 'hub', number> = img;

export const ENTREPRENEUR = {
  back: { src: require('@/assets/images/world/business/woman-back.webp'), aspect: 396 / 900 },
  walk: { src: require('@/assets/images/world/business/woman-walk.webp'), aspect: 425 / 900 },
  side: { src: require('@/assets/images/world/business/woman-side.webp'), aspect: 482 / 900 },
  front: { src: require('@/assets/images/world/business/woman-front.webp'), aspect: 382 / 900 },
};

export const BUSINESS_STATIONS: Record<
  BusinessStation,
  { stand: [number, number]; label: [number, number]; icon: string; games: BusinessGameId[] }
> = {
  budget: { stand: [0.2, 0.74], label: [0.14, 0.42], icon: 'wallet', games: ['budget-master'] },
  startup: { stand: [0.34, 0.7], label: [0.26, 0.24], icon: 'rocket', games: ['startup-tycoon'] },
  market: { stand: [0.47, 0.71], label: [0.46, 0.53], icon: 'storefront', games: ['market-master'] },
  factory: { stand: [0.62, 0.7], label: [0.6, 0.36], icon: 'construct', games: ['profit-quest'] },
  exchange: { stand: [0.8, 0.73], label: [0.85, 0.46], icon: 'trending-up', games: ['market-simulator'] },
};
export const BUSINESS_STATION_OF: Record<BusinessGameId, BusinessStation> = {
  'startup-tycoon': 'startup',
  'budget-master': 'budget',
  'market-master': 'market',
  'profit-quest': 'factory',
  'market-simulator': 'exchange',
};

export const BUSINESS_HUB: Place<BusinessStation> = {
  scene: img.hub,
  stations: BUSINESS_STATIONS,
  walk: [
    [0.69, 0.08, 0.92],
    [0.8, 0.02, 0.98],
    [0.96, 0.02, 0.98],
  ],
  start: [0.5, 0.92],
  height: [0.36, 0.2],
  sprites: { back: ENTREPRENEUR.back, walk: ENTREPRENEUR.walk, side: ENTREPRENEUR.side },
};

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
