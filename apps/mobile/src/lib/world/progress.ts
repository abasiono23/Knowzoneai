import type { Ionicons } from '@expo/vector-icons';

import i18n from '../../i18n';

/** Counters shared by quests (per day / week) and achievements (lifetime). */
export type Counts = {
  levels: number;
  correct: number;
  stars: number;
  battlesWon: number;
  bosses: number;
  words: number;
  daily: number;
  xp: number;
};
export const ZERO: Counts = { levels: 0, correct: 0, stars: 0, battlesWon: 0, bosses: 0, words: 0, daily: 0, xp: 0 };
export const addCounts = (a: Counts, b: Partial<Counts>): Counts =>
  Object.fromEntries(Object.entries(a).map(([k, v]) => [k, v + (b[k as keyof Counts] ?? 0)])) as Counts;

type Icon = keyof typeof Ionicons.glyphMap;

export type Quest = {
  id: string;
  /** Translated each time it's read. */
  readonly title: string;
  icon: Icon;
  key: keyof Counts;
  target: number;
  xp: number;
  coins: number;
};

/** Adds a title getter, so quest titles follow the current language. */
const quest = (q: Omit<Quest, 'title'>): Quest => ({
  ...q,
  get title() {
    return i18n.t(`world:questTitles.${q.id}` as 'world:questTitles.d-levels');
  },
});

export const DAILY_QUESTS: Quest[] = [
  quest({ id: 'd-levels', icon: 'game-controller', key: 'levels', target: 2, xp: 20, coins: 10 }),
  quest({
    id: 'd-correct',
    icon: 'checkmark-done',
    key: 'correct',
    target: 15,
    xp: 25,
    coins: 10,
  }),
  quest({ id: 'd-stars', icon: 'star', key: 'stars', target: 4, xp: 20, coins: 10 }),
  quest({ id: 'd-daily', icon: 'calendar', key: 'daily', target: 1, xp: 15, coins: 10 }),
];
export const WEEKLY_QUESTS: Quest[] = [
  quest({ id: 'w-battles', icon: 'flash', key: 'battlesWon', target: 2, xp: 60, coins: 30 }),
  quest({ id: 'w-boss', icon: 'skull', key: 'bosses', target: 1, xp: 60, coins: 30 }),
  quest({
    id: 'w-words',
    icon: 'extension-puzzle',
    key: 'words',
    target: 10,
    xp: 40,
    coins: 20,
  }),
  quest({
    id: 'w-daily',
    icon: 'calendar-number',
    key: 'daily',
    target: 3,
    xp: 50,
    coins: 25,
  }),
  quest({ id: 'w-stars', icon: 'sparkles', key: 'stars', target: 20, xp: 80, coins: 40 }),
];

/** Lifetime facts used by achievements. */
export type Facts = Counts & {
  totalStars: number;
  perfectLevels: number;
  worldsUnlocked: number;
  worldsMastered: number;
  dailyStreak: number;
  sprintBest: number;
  collectibles: number;
  itemsOwned: number;
  certificates: number;
};

export type Achievement = {
  id: string;
  /** Translated each time it's read. */
  readonly name: string;
  readonly description: string;
  icon: Icon;
  value: (f: Facts) => number;
  target: number;
  /** Cosmetic granted when unlocked (earned-only items). */
  grants?: string;
};

/** Adds name and description getters, so they follow the current language. */
const achievement = (a: Omit<Achievement, 'name' | 'description'>): Achievement => ({
  ...a,
  get name() {
    return i18n.t(`world:achievementList.${a.id}.name` as 'world:achievementList.first-steps.name');
  },
  get description() {
    return i18n.t(`world:achievementList.${a.id}.description` as 'world:achievementList.first-steps.name');
  },
});

export const ACHIEVEMENTS: Achievement[] = [
  achievement({
    id: 'first-steps',
    icon: 'footsteps',
    value: (f) => f.levels,
    target: 1,
  }),
  achievement({
    id: 'star-10',
    icon: 'star-half',
    value: (f) => f.totalStars,
    target: 10,
  }),
  achievement({
    id: 'star-50',
    icon: 'star',
    value: (f) => f.totalStars,
    target: 50,
  }),
  achievement({
    id: 'perfect',
    icon: 'sparkles',
    value: (f) => f.perfectLevels,
    target: 5,
  }),
  achievement({
    id: 'boss-1',
    icon: 'skull',
    value: (f) => f.bosses,
    target: 1,
  }),
  achievement({
    id: 'boss-3',
    icon: 'trophy',
    value: (f) => f.bosses,
    target: 3,
    grants: 'hat-crown',
  }),
  achievement({
    id: 'battle-5',
    icon: 'flash',
    value: (f) => f.battlesWon,
    target: 5,
  }),
  achievement({
    id: 'words-25',
    icon: 'extension-puzzle',
    value: (f) => f.words,
    target: 25,
  }),
  achievement({
    id: 'sprint-15',
    icon: 'speedometer',
    value: (f) => f.sprintBest,
    target: 15,
  }),
  achievement({
    id: 'explorer',
    icon: 'compass',
    value: (f) => f.worldsUnlocked,
    target: 4,
  }),
  achievement({
    id: 'master',
    icon: 'medal',
    value: (f) => f.worldsMastered,
    target: 1,
    grants: 'outfit-astronaut',
  }),
  achievement({
    id: 'daily-7',
    icon: 'calendar',
    value: (f) => f.daily,
    target: 7,
  }),
  achievement({
    id: 'streak-3',
    icon: 'flame',
    value: (f) => f.dailyStreak,
    target: 3,
  }),
  achievement({
    id: 'collector',
    icon: 'diamond',
    value: (f) => f.collectibles,
    target: 6,
  }),
  achievement({
    id: 'scholar',
    icon: 'school',
    value: (f) => f.correct,
    target: 200,
  }),
  achievement({
    id: 'graduate',
    icon: 'ribbon',
    value: (f) => f.certificates,
    target: 1,
    grants: 'hat-graduate',
  }),
];

/** Monday-based week key, e.g. 2026-W42. */
export function weekKey(t = Date.now()) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const jan4 = new Date(d.getFullYear(), 0, 4);
  const week = 1 + Math.round(((d.getTime() - jan4.getTime()) / 86400000 - 3 + ((jan4.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}
