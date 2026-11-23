import i18n from '../../i18n';

import { findBankItem, type BankLevel, type BankQuestion, type BankTerm, type BankTruth } from './bank';
import { getWorld, WORLDS } from './content';
import type { Level, LevelKind, World, WorldId } from './types';

/** Deterministic random numbers, so a level always deals the same cards and screenshots match. */
export function seeded(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
export function shuffle<T>(items: readonly T[], seed: string): T[] {
  const rand = seeded(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * The ladder every world climbs: ten levels from Starter (early secondary school) to Super hard
 * (postgraduate / olympiad), the same names as the word games. The questions come from each level's
 * own bank, and the rules tighten as well: fewer hearts and hints, more options, a stronger and faster
 * rival, more words with fewer letters shown. Levels 1–4 are open to everyone; each later level opens
 * with a star on the one before. Levels 1–6 keep the numbers they had when a world had six levels, so
 * stars won then stay where they were.
 */
export type Rung = {
  kind: LevelKind;
  /** Questions dealt (quiz, duel, final test) or words (puzzle). */
  count: number;
  /** Seconds per question, or the whole round for the lightning round. */
  seconds: number;
  hearts: number;
  /** 2 = a nudge and 50:50, 1 = a nudge only, 0 = no help. */
  hints: 0 | 1 | 2;
  /** Duel: how often the rival is right and how fast it answers (seconds). */
  rival?: { right: number; fastest: number; slowest: number };
  /** Puzzle: letters you may reveal per word. */
  reveals?: number;
  xp: number;
  coins: number;
};
export const DAILY_ID = 'daily';
export const MAX_LEVEL = 10;
export const OPEN_LEVELS = 4;
export const LADDER: Rung[] = [
  { kind: 'mission', count: 6, seconds: 30, hearts: 3, hints: 2, xp: 40, coins: 10 },
  { kind: 'sprint', count: 0, seconds: 60, hearts: 0, hints: 0, xp: 40, coins: 10 },
  { kind: 'puzzle', count: 4, seconds: 0, hearts: 0, hints: 2, reveals: 3, xp: 45, coins: 10 },
  { kind: 'mission', count: 8, seconds: 30, hearts: 3, hints: 2, xp: 55, coins: 12 },
  { kind: 'battle', count: 8, seconds: 25, hearts: 0, hints: 0, rival: { right: 0.6, fastest: 5, slowest: 14 }, xp: 60, coins: 15 },
  { kind: 'mission', count: 8, seconds: 40, hearts: 3, hints: 1, xp: 70, coins: 16 },
  { kind: 'sprint', count: 0, seconds: 50, hearts: 0, hints: 0, xp: 75, coins: 18 },
  { kind: 'puzzle', count: 5, seconds: 0, hearts: 0, hints: 1, reveals: 1, xp: 85, coins: 20 },
  { kind: 'battle', count: 10, seconds: 35, hearts: 0, hints: 0, rival: { right: 0.8, fastest: 6, slowest: 16 }, xp: 95, coins: 22 },
  { kind: 'boss', count: 10, seconds: 45, hearts: 2, hints: 0, xp: 120, coins: 30 },
];
export const rungOf = (level: Pick<Level, 'number'>): Rung => LADDER[Math.min(MAX_LEVEL, Math.max(1, level.number)) - 1];
/** Stars a world can hold (3 per level). */
export const WORLD_STARS = MAX_LEVEL * 3;

/** A level whose title and blurb are read in the current language (getters, never fixed at import time). */
function makeLevel<T extends object>(base: Omit<Level, 'title' | 'blurb'>, extra?: T): Level & T {
  const level = { ...base, ...extra } as Level & T;
  const daily = base.id === DAILY_ID;
  Object.defineProperties(level, {
    title: { enumerable: true, get: () => (daily ? i18n.t('world:levelPlan.daily.title') : i18n.t(`world:adv.kinds.${base.kind}.name`)) },
    blurb: { enumerable: true, get: () => (daily ? i18n.t('world:adv.dailyBlurb') : i18n.t(`world:adv.kinds.${base.kind}.blurb`)) },
  });
  return level;
}

export const levelsOf = (worldId: WorldId): Level[] =>
  LADDER.map(({ kind, xp, coins }, i) => makeLevel({ id: `${worldId}-${i + 1}`, worldId, number: i + 1, kind, xp, coins }));

export const ALL_LEVELS = WORLDS.flatMap((w) => levelsOf(w.id));


/** Local date key, e.g. 2026-10-18. */
export function dayKey(t = Date.now()) {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Today's challenge: one world and a middle level of its ladder (3 to 6), the same for everyone. */
export function dailyLevel(day = dayKey()): Level & { world: World; tier: number } {
  const rand = seeded(day);
  const world = WORLDS[(rand() * WORLDS.length) | 0];
  const tier = 3 + ((rand() * 4) | 0);
  return makeLevel({ id: DAILY_ID, worldId: world.id, number: 0, kind: 'mission', xp: 30, coins: 15 }, { world, tier });
}

export function getLevel(id: string): (Level & { world: World }) | undefined {
  if (id === DAILY_ID) return dailyLevel();
  const level = ALL_LEVELS.find((l) => l.id === id);
  const world = level && getWorld(level.worldId);
  if (!level || !world) return undefined;
  const { title: _title, blurb: _blurb, ...base } = level;
  return makeLevel(base, { world });
}

/** The bank level a level's questions come from (the daily challenge borrows one). */
export const bankTier = (level: Level & { tier?: number }) => (level.id === DAILY_ID ? (level.tier ?? 4) : level.number);

/** The questions dealt for a level: a fresh mix from its bank each round. */
export function questionsFor(level: Level, bank: BankLevel, round = 0): BankQuestion[] {
  const count = level.id === DAILY_ID ? 6 : rungOf(level).count || 8;
  return shuffle(bank.questions, `${level.id}-${dayKey()}-${round}`).slice(0, count);
}
/** Words for the puzzle: the level's terms, a fresh mix each round. */
export function wordsFor(level: Level, bank: BankLevel, round = 0): BankTerm[] {
  const words = bank.terms.filter((t) => /^[A-Z]+$/.test(t.word));
  return shuffle(words, `${level.id}-${round}`).slice(0, rungOf(level).count);
}

/**
 * Lightning-round deck: the level's true/false statements, plus one statement made from each short
 * question (half pairing it with the right answer, half with a wrong one).
 */
export function sprintDeck(level: Level, bank: BankLevel, round = 0): BankTruth[] {
  const rand = seeded(`${level.id}-deck-${round}`);
  const fromQuestions: BankTruth[] = bank.questions
    .filter((q) => q.q.length < 80 && q.options.every((o) => o.length < 40) && !/which|choose|pick|not\b|except/i.test(q.q))
    .map((q) => {
      const truthy = rand() < 0.5;
      const wrong = q.options.filter((_, k) => k !== q.answer);
      const option = truthy ? q.options[q.answer] : wrong[Math.floor(rand() * wrong.length)];
      return { id: `${q.id}-tf`, s: `${q.q.replace(/\?$/, '')}: ${option}`, answer: truthy, why: `${q.options[q.answer]}. ${q.why}` };
    });
  return shuffle([...bank.truths, ...fromQuestions], `${level.id}-sprint-${round}`);
}

/** Stars for a finished play. Hints never cost stars, only points. */
export function starsFor(
  kind: LevelKind,
  m: { correct: number; total: number; failed?: boolean; reveals?: number; mistakes?: number; rival?: number },
): 0 | 1 | 2 | 3 {
  if (m.failed) return 0;
  const acc = m.total ? m.correct / m.total : 0;
  switch (kind) {
    case 'sprint':
      if (m.correct >= 14 && acc >= 0.85) return 3;
      if (m.correct >= 10 && acc >= 0.7) return 2;
      return m.correct >= 6 ? 1 : 0;
    case 'puzzle':
      if (m.correct < m.total) return 0;
      if (!m.reveals && (m.mistakes ?? 0) <= 2) return 3;
      return (m.reveals ?? 0) <= 1 ? 2 : 1;
    case 'battle': {
      const rival = m.rival ?? 0;
      if (m.correct < rival) return 0;
      if (m.correct === rival) return 1;
      return m.correct === m.total || m.correct - rival >= 2 ? 3 : 2;
    }
    default:
      if (acc === 1) return 3;
      if (acc >= 0.75) return 2;
      return acc >= 0.5 ? 1 : 0;
  }
}

/** Reward for a play: XP scales with stars, but replays only pay for stars you didn't have yet. */
export function rewardFor(level: Level, stars: number, previousBest: number) {
  if (level.id === DAILY_ID) return stars > 0 ? { xp: level.xp, coins: level.coins } : { xp: 5, coins: 0 };
  const gained = Math.max(0, stars - previousBest);
  return {
    xp: Math.round((level.xp * gained) / 3) + (stars > 0 ? 5 : 2),
    coins: Math.round((level.coins * gained) / 3) + (stars === 3 && previousBest < 3 ? 5 : 0),
  };
}

/** Scrambled letters for a word: never the word itself. */
export function scrambled(word: string, seed: string) {
  const letters = word.split('');
  let out = shuffle(letters, seed);
  for (let i = 1; out.join('') === word && i < 6; i++) out = shuffle(letters, `${seed}-${i}`);
  return out;
}

/** Turns a mistake id back into something to revisit: what was asked, the answer and why. */
export function describeMistake(id: string): { prompt: string; answer: string; why: string } | undefined {
  const hit = findBankItem(id) ?? findBankItem(id.replace(/-tf$/, ''));
  if (hit) {
    if ('q' in hit) return { prompt: hit.q, answer: hit.options[hit.answer], why: hit.why };
    if ('s' in hit) return { prompt: hit.s, answer: i18n.t(hit.answer ? 'world:sprint.true' : 'world:sprint.false'), why: hit.why };
    return { prompt: hit.clue, answer: hit.word, why: i18n.t('world:puzzle.wordWas', { word: hit.word }) };
  }
  // Mistakes made before the banks (or offline) point at the built-in questions.
  for (const w of WORLDS) {
    const q = w.questions.find((x) => x.id === id || `${x.id}-tf` === id);
    if (q) return { prompt: q.question, answer: q.options[q.correctIndex], why: q.explanation };
    const t = w.truths.find((x) => x.id === id);
    if (t) return { prompt: t.statement, answer: i18n.t(t.answer ? 'world:sprint.true' : 'world:sprint.false'), why: t.explanation };
    const s = w.words.find((x) => x.id === id);
    if (s) return { prompt: s.clue, answer: s.word, why: i18n.t('world:puzzle.wordWas', { word: s.word }) };
  }
  return undefined;
}
