import type { Href } from 'expo-router';

import type { QuestItem, QuestPlace } from '@/lib/api';
import { COVERS } from '@/lib/games/english';
import { MUSEUM_SCENES } from '@/lib/games/history';
import { SCENES } from '@/lib/games/lab';
import { SPACE_SCENES } from '@/lib/games/space';

/** World Quests art (apps/server/scripts/quest-art.ts) and where each place's quests are played. */
export const QUEST_ART = {
  board: require('@/assets/images/world/quests/board-bg.webp'),
  map: require('@/assets/images/world/quests/journey-map.webp'),
  chestClosed: { src: require('@/assets/images/world/quests/chest-closed.webp'), aspect: 258 / 240 },
  chestOpen: { src: require('@/assets/images/world/quests/chest-open.webp'), aspect: 221 / 240 },
};

export const PLACE_ICON: Record<QuestPlace, { src: number; aspect: number }> = {
  english: { src: require('@/assets/images/world/quests/icon-english.webp'), aspect: 260 / 240 },
  chemistry: { src: require('@/assets/images/world/quests/icon-chemistry.webp'), aspect: 164 / 240 },
  space: { src: require('@/assets/images/world/quests/icon-space.webp'), aspect: 172 / 240 },
  history: { src: require('@/assets/images/world/quests/icon-history.webp'), aspect: 233 / 240 },
  any: { src: require('@/assets/images/world/quests/icon-any.webp'), aspect: 217 / 240 },
};

/** The picture at the top of a quest's details. */
export function questPicture(q: Pick<QuestItem, 'place' | 'game'>): number {
  switch (q.place) {
    case 'english':
      return COVERS[(q.game ?? 'word-clash') as keyof typeof COVERS] ?? COVERS['word-clash'];
    case 'chemistry':
      return SCENES.hall;
    case 'space':
      return SPACE_SCENES.academy;
    case 'history':
      return MUSEUM_SCENES.museum;
    case 'any':
      return QUEST_ART.map;
  }
}

/** Where "Go" takes you (English games open the game itself). */
export function questRoute(q: Pick<QuestItem, 'place' | 'game'>): Href | null {
  switch (q.place) {
    case 'english':
      return (q.game ? `/world/english/${q.game}` : '/world/english') as Href;
    case 'chemistry':
      return '/world/chemistry' as Href;
    case 'space':
      return '/world/space' as Href;
    case 'history':
      return '/world/history' as Href;
    case 'any':
      return null;
  }
}

/** Where each place is on the journey map picture (fractions of its width and height). */
export const MAP_SPOTS: Record<Exclude<QuestPlace, 'any'> | 'chest', [number, number]> = {
  english: [0.27, 0.33],
  space: [0.69, 0.27],
  chemistry: [0.27, 0.55],
  history: [0.74, 0.5],
  chest: [0.56, 0.73],
};
export const MAP_ASPECT = 2 / 3;
