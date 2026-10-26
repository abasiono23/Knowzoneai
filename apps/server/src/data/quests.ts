/**
 * World Quests: what a quest can ask for, counted from finished game runs (whose answers the server
 * already checked). Titles live in the app (`quests` translations, by id) so they follow the
 * learner's language; `{{count}}` there is the target.
 */
/** Places with their own quests (the Tech Hub's games count towards "anywhere" quests). */
export type Place = 'english' | 'chemistry' | 'space' | 'history';

/** A finished game, as quests see it. */
export type QuestEvent = {
  subject: Place | 'tech';
  game: string;
  level: number;
  stars: number;
  /** Step number → right or wrong. */
  results: Record<number, { correct: boolean }>;
};

export type QuestTemplate = {
  id: string;
  /** Where to go to do it (any = anywhere). */
  place: Place | 'any';
  /** The game to open, when it's about one game. */
  game?: string;
  /** Daily target (weekly quests multiply it). */
  target: number;
  /** How much one finished game moves it on. */
  count: (e: QuestEvent) => number;
};

const right = (e: QuestEvent) => Object.values(e.results).filter((r) => r.correct).length;
/** Right answers on even steps only (the first step of each pair: a build, a find, a name). */
const rightEven = (e: QuestEvent) => Object.entries(e.results).filter(([k, r]) => Number(k) % 2 === 0 && r.correct).length;
const q = (id: string, place: Place | 'any', target: number, count: QuestTemplate['count'], game?: string): QuestTemplate => ({
  id,
  place,
  game,
  target,
  count,
});
const inGame = (game: string, n: (e: QuestEvent) => number) => (e: QuestEvent) => (e.game === game ? n(e) : 0);

export const TEMPLATES: QuestTemplate[] = [
  // Language Island
  q('english-play', 'english', 2, (e) => (e.subject === 'english' ? 1 : 0)),
  q('english-three', 'english', 1, (e) => (e.subject === 'english' && e.stars === 3 ? 1 : 0)),
  q(
    'clash-star',
    'english',
    1,
    inGame('word-clash', (e) => (e.stars > 0 ? 1 : 0)),
    'word-clash',
  ),
  q('hunter-words', 'english', 8, inGame('word-hunter', right), 'word-hunter'),
  // Chemistry lab
  q('mix', 'chemistry', 2, inGame('mixture-lab', right), 'mixture-lab'),
  q('balance', 'chemistry', 5, inGame('reaction-rush', right), 'reaction-rush'),
  q('mystery', 'chemistry', 2, inGame('mystery-substance', right), 'mystery-substance'),
  q('molecules', 'chemistry', 3, inGame('molecule-builder', right), 'molecule-builder'),
  q('elements', 'chemistry', 2, inGame('element-quest', right), 'element-quest'),
  // Space Academy
  q('launch', 'space', 1, inGame('rocket-builder', rightEven), 'rocket-builder'),
  q(
    'boss',
    'space',
    1,
    inGame('galaxy-defender', (e) => (e.stars > 0 ? 1 : 0)),
    'galaxy-defender',
  ),
  q('comets', 'space', 2, inGame('gravity-master', right), 'gravity-master'),
  q('planets', 'space', 4, inGame('solar-explorer', right), 'solar-explorer'),
  q('asteroids', 'space', 3, inGame('asteroid-survival', right), 'asteroid-survival'),
  // Museum of Time
  q(
    'eras',
    'history',
    3,
    inGame('time-machine', (e) => Math.floor(Object.keys(e.results).length / 2)),
    'time-machine',
  ),
  q('cities', 'history', 2, inGame('lost-civilization', rightEven), 'lost-civilization'),
  q('countries', 'history', 3, inGame('africa-explorer', rightEven), 'africa-explorer'),
  // Anywhere
  q('any-stars', 'any', 6, (e) => e.stars),
  q('any-games', 'any', 3, () => 1),
  q('any-three', 'any', 1, (e) => (e.stars === 3 ? 1 : 0)),
];

/** Weekly only: play in every place (counted as different places, not games). */
export const ALL_PLACES = 'all-places';
export const PLACES: Place[] = ['english', 'chemistry', 'space', 'history'];

export const REWARDS = {
  daily: { xp: 30, coins: 10 },
  weekly: { xp: 80, coins: 30 },
  /** Daily chests open after this many quests are claimed. */
  dailyChests: [
    { after: 1, xp: 0, coins: 10 },
    { after: 2, xp: 20, coins: 20 },
    { after: 4, xp: 40, coins: 40 },
  ],
  journeyChest: { xp: 150, coins: 80 },
};
/** Weekly quests and journey steps ask for this many times the daily target. */
export const WEEKLY_TIMES = 3;
export const JOURNEY_STEPS = 6;
