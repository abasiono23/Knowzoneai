import i18n from '../../i18n';

import type { AvatarConfig, ShopItem } from './types';

export const SKINS = ['#FFDBB4', '#E8B48A', '#C68642', '#A0612F', '#7B4423', '#4E2A17'];
export const HAIR_COLORS = ['#1B1B1B', '#4A2C1A', '#8B5A2B', '#D4A15A', '#B5462E', '#7C5CFF'];
/** Option labels are read through getters, so they follow the current language. */
const option = <T extends string>(group: 'hair' | 'eyes' | 'mouth', id: T) => ({
  id,
  get label() {
    return i18n.t(`world:avatarParts.${group}.${id}` as 'world:avatarParts.hair.short');
  },
});

export const HAIRS: { id: AvatarConfig['hair']; readonly label: string }[] = (
  ['short', 'afro', 'puffs', 'braids', 'bun', 'fade', 'locs'] as const
).map((id) => option('hair', id));
export const EYES: { id: AvatarConfig['eyes']; readonly label: string }[] = (['round', 'happy', 'wink'] as const).map(
  (id) => option('eyes', id),
);
export const MOUTHS: { id: AvatarConfig['mouth']; readonly label: string }[] = (['smile', 'grin', 'open'] as const).map(
  (id) => option('mouth', id),
);
/** Free outfit colours at creation; patterned outfits are in the shop. */
export const OUTFIT_COLORS = ['#7C5CFF', '#2DD4BF', '#FF7A93', '#FFC857', '#4CC9FF', '#1A2150'];
export const BACKGROUNDS: Record<string, readonly [string, string]> = {
  violet: ['#3B2DBF', '#7C5CFF'],
  teal: ['#0E8F6E', '#2DD4BF'],
  sunset: ['#D9467A', '#FF9F43'],
  galaxy: ['#0B1026', '#6A45FF'],
  jungle: ['#0E5A3A', '#7CEB8D'],
  gold: ['#9C6B1E', '#FFC857'],
  ocean: ['#0F4C9C', '#4CC9FF'],
  nebula: ['#2A0E5C', '#E0559B'],
  savanna: ['#B5651D', '#F6C453'],
};

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: SKINS[3],
  hair: 'afro',
  hairColor: HAIR_COLORS[0],
  eyes: 'round',
  mouth: 'smile',
  outfit: OUTFIT_COLORS[0],
  background: 'violet',
  name: '',
};

/**
 * Cosmetics only. Coins never buy answers, stars or progress, and there are no random
 * boxes: every item shows its price and what you get.
 */
/** Names (and how to earn earned-only items) are getters, so they follow the current language. */
function item(
  id: string,
  slot: ShopItem['slot'],
  price: number,
  rarity: ShopItem['rarity'],
  earned?: boolean,
): ShopItem {
  const key = (field: 'name' | 'earnedBy') => i18n.t(`world:items.${id}.${field}` as 'world:items.hat-cap.name');
  const out: ShopItem = {
    id,
    slot,
    price,
    rarity,
    get name() {
      return key('name');
    },
  };
  if (earned) Object.defineProperty(out, 'earnedBy', { enumerable: true, get: () => key('earnedBy') });
  return out;
}

export const SHOP: ShopItem[] = [
  item('hat-cap', 'hat', 40, 'common'),
  item('hat-gele', 'hat', 80, 'rare'),
  item('hat-headphones', 'hat', 60, 'common'),
  item('hat-graduate', 'hat', 0, 'rare', true),
  item('hat-crown', 'hat', 0, 'epic', true),
  item('hat-wizard', 'hat', 150, 'epic'),
  item('glasses-round', 'glasses', 30, 'common'),
  item('glasses-shades', 'glasses', 70, 'rare'),
  item('glasses-goggles', 'glasses', 50, 'common'),
  item('outfit-ankara', 'outfit', 90, 'rare'),
  item('outfit-labcoat', 'outfit', 60, 'common'),
  item('outfit-jersey', 'outfit', 100, 'rare'),
  item('outfit-astronaut', 'outfit', 0, 'epic', true),
  item('bg-galaxy', 'background', 50, 'common'),
  item('bg-jungle', 'background', 50, 'common'),
  item('bg-gold', 'background', 0, 'epic', true),
  item('bg-ocean', 'background', 50, 'common'),
  // Won only from the weekly journey chest (World Quests), one per finished journey.
  item('hat-explorer', 'hat', 0, 'epic', true),
  item('outfit-explorer', 'outfit', 0, 'epic', true),
  item('bg-nebula', 'background', 0, 'epic', true),
  item('bg-savanna', 'background', 0, 'epic', true),
  item('boost-freeze', 'boost', 40, 'common'),
];

export const getItem = (id: string) => SHOP.find((i) => i.id === id);
export const backgroundOf = (bg: string) => BACKGROUNDS[bg.replace(/^bg-/, '')] ?? BACKGROUNDS.violet;
export const RARITY_COLOR = { common: '#A6ADD6', rare: '#4CC9FF', epic: '#FFC857' } as const;
