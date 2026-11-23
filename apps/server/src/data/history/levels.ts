/**
 * The Museum of Time content on the ten-level ladder: the hand-written eras, civilisations and African
 * countries (eras.ts, civilizations.ts, countries.ts; first written for a five-level ladder) together
 * with the generated ones and their upper-level questions (more.ts, made and checked by
 * scripts/business-history-content.ts). Every question has a level from 1 (famous facts) to 10
 * (source criticism and historiography).
 */
import { CIVILIZATIONS as HAND_CIVS } from './civilizations.js';
import { COUNTRIES as HAND_COUNTRIES } from './countries.js';
import { ERAS as HAND_ERAS, EVENTS as HAND_EVENTS } from './eras.js';
import { EXTRA_QUESTIONS, MORE_CIVILIZATIONS, MORE_COUNTRIES, MORE_ERAS, MORE_EVENTS } from './more.js';

export type LeveledQuestion = { q: string; answer: string; wrong: string[]; level: number };
export type Region = 'africa' | 'americas' | 'asia' | 'europe' | 'middle-east' | 'world';
export type Era = {
  id: string;
  title: string;
  when: string;
  year: number;
  place: string;
  region: Region;
  intro: string;
  /** The first level it can come up on. */
  level: number;
  questions: LeveledQuestion[];
};
export type Find = { name: string; clue: string; art: string; subtle?: boolean };
export type Civilization = {
  id: string;
  name: string;
  dig: 'savanna' | 'desert' | 'stone';
  region: Region;
  level: number;
  about: string;
  finds: Find[];
  questions: LeveledQuestion[];
};
export type Country = {
  id: string;
  name: string;
  region: string;
  at: [number, number];
  radius: number;
  level: number;
  landmark: string;
  facts: [string, string];
  questions: LeveledQuestion[];
};
export type TimelineEvent = { text: string; year: number; level: number; region?: Region };

/**
 * An item of the old five-level ladder: level L becomes 2L − 1 (its first two questions there, the
 * rest one level up), so nothing is harder than it was at that level number.
 */
const relevel = <Q extends { q: string; answer: string; wrong: string[] }>(old: number, list: Q[]): LeveledQuestion[] =>
  list.map((x, k) => ({ q: x.q, answer: x.answer, wrong: [...x.wrong], level: Math.min(10, 2 * old - (k < 2 ? 1 : 0)) }));
const extra = (key: string) => EXTRA_QUESTIONS[key] ?? [];

const AFRICAN_ERAS = new Set(['egypt', 'independence', 'abuja', 'colonial', 'nok', 'ife', 'benin', 'mali', 'oyo', 'sokoto']);
export const ERAS: Era[] = [
  ...HAND_ERAS.map((e) => ({
    id: e.id,
    title: e.title,
    when: e.when,
    year: e.year,
    place: e.place,
    region: (AFRICAN_ERAS.has(e.id) ? 'africa' : 'world') as Region,
    intro: e.intro,
    level: 2 * e.level - 1,
    questions: [...relevel(e.level, e.questions), ...extra(`era:${e.id}`)],
  })),
  ...MORE_ERAS,
];

const OUTSIDE_AFRICA = new Set<string>();
export const CIVILIZATIONS: Civilization[] = [
  ...HAND_CIVS.map((c) => ({
    id: c.id,
    name: c.name,
    dig: c.dig,
    region: (OUTSIDE_AFRICA.has(c.id) ? 'world' : 'africa') as Region,
    level: 2 * c.level - 1,
    about: c.about,
    // The hand-written finds are the clear ones.
    finds: c.finds.map((f) => ({ ...f, subtle: false })),
    questions: [...relevel(c.level, c.questions), ...extra(`civ:${c.id}`)],
  })),
  // Generated civilisations that share an id with a hand-written one (none expected) are left out.
  ...MORE_CIVILIZATIONS.filter((c) => !HAND_CIVS.some((h) => h.id === c.id)),
];

export const COUNTRIES: Country[] = [
  ...HAND_COUNTRIES.map((c) => ({
    id: c.id,
    name: c.name,
    region: c.region,
    at: c.at,
    radius: c.radius,
    level: 2 * c.level - 1,
    landmark: c.landmark,
    facts: c.facts,
    questions: [...relevel(c.level, c.questions), ...extra(`country:${c.id}`)],
  })),
  ...MORE_COUNTRIES.filter((c) => !HAND_COUNTRIES.some((h) => h.id === c.id)),
];

/** The timeline for "put in order" challenges, earliest first. Duplicated wording keeps the hand-written one. */
export const EVENTS: TimelineEvent[] = [
  ...HAND_EVENTS.map((e) => ({ ...e, level: 2 * e.level - 1, region: 'africa' as Region })),
  ...MORE_EVENTS.filter((e) => !HAND_EVENTS.some((h) => h.text.toLowerCase() === e.text.toLowerCase())),
].sort((a, b) => a.year - b.year);

export { mapDistance } from './countries.js';
