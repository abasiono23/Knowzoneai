/**
 * Knowzone World (the adventure): seven worlds, each a ladder of ten levels from early secondary school
 * (level 1, Starter) to postgraduate / olympiad (level 10, Super hard). The question banks are written by
 * scripts/world-content.ts and checked by a second model and by code.
 */
export const WORLD_IDS = ['space', 'math', 'nature', 'language', 'history', 'code', 'art'] as const;
export type WorldId = (typeof WORLD_IDS)[number];
export const WORLD_LEVELS = 10;

/** A multiple-choice question: `answer` is the index of the one right option. */
export type BankQuestion = { id: string; q: string; options: string[]; answer: number; why: string; hint: string };
/** A statement for the lightning round. */
export type BankTruth = { id: string; s: string; answer: boolean; why: string };
/** A key term for the word puzzle (capital letters A–Z). */
export type BankTerm = { id: string; word: string; clue: string };
export type BankLevel = { questions: BankQuestion[]; truths: BankTruth[]; terms: BankTerm[] };
/** Levels 1–10. */
export type WorldBank = Record<number, BankLevel>;

/**
 * The adventure's ladder (the app's lib/world/levels.ts has the same): what kind of game each level is
 * and how its rules tighten. Levels 1–4 are open to everyone; each later level opens with a star on the
 * level before. Levels 1–6 kept their numbers from when a world had six levels, so stars stay put.
 */
export const WORLD_OPEN_LEVELS = 4;
export type WorldRung = {
  kind: 'mission' | 'sprint' | 'puzzle' | 'battle' | 'boss';
  /** Options per question in the level's bank. */
  options: number;
  hearts: number;
  /** 2 = a hint and 50:50, 1 = a hint only, 0 = none. */
  hints: number;
  /** Duel rival: share of right answers. */
  rival?: number;
};
export const WORLD_LADDER: WorldRung[] = [
  { kind: 'mission', options: 4, hearts: 3, hints: 2 },
  { kind: 'sprint', options: 4, hearts: 0, hints: 0 },
  { kind: 'puzzle', options: 4, hearts: 0, hints: 2 },
  { kind: 'mission', options: 4, hearts: 3, hints: 2 },
  { kind: 'battle', options: 4, hearts: 0, hints: 0, rival: 0.6 },
  { kind: 'mission', options: 4, hearts: 3, hints: 1 },
  { kind: 'sprint', options: 4, hearts: 0, hints: 0 },
  { kind: 'puzzle', options: 5, hearts: 0, hints: 1 },
  { kind: 'battle', options: 5, hearts: 0, hints: 0, rival: 0.8 },
  { kind: 'boss', options: 5, hearts: 2, hints: 0 },
];
