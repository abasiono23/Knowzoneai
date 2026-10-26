import i18n from '../../i18n';

import { getWorld, WORLDS } from './content';
import type { GameQuestion, Level, LevelKind, Scramble, TrueFalse, World, WorldId } from './types';

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

type PlanKey = 'firstSteps' | 'lightningRound' | 'wordVault' | 'deepDive' | 'rivalShowdown' | 'bossBattle' | 'daily';

const PLAN: { key: PlanKey; kind: LevelKind; xp: number; coins: number }[] = [
  { key: 'firstSteps', kind: 'mission', xp: 40, coins: 10 },
  { key: 'lightningRound', kind: 'sprint', xp: 30, coins: 8 },
  { key: 'wordVault', kind: 'puzzle', xp: 30, coins: 8 },
  { key: 'deepDive', kind: 'mission', xp: 50, coins: 12 },
  { key: 'rivalShowdown', kind: 'battle', xp: 50, coins: 15 },
  { key: 'bossBattle', kind: 'boss', xp: 80, coins: 25 },
];

/** A level whose title and blurb are read in the current language (getters, never fixed at import time). */
function makeLevel<T extends object>(base: Omit<Level, 'title' | 'blurb'>, key: PlanKey, extra?: T): Level & T {
  const level = { ...base, ...extra } as Level & T;
  Object.defineProperties(level, {
    title: { enumerable: true, get: () => i18n.t(`world:levelPlan.${key}.title`) },
    blurb: { enumerable: true, get: () => i18n.t(`world:levelPlan.${key}.blurb`) },
  });
  return level;
}

export const levelsOf = (worldId: WorldId): Level[] =>
  PLAN.map(({ key, ...p }, i) => makeLevel({ id: `${worldId}-${i + 1}`, worldId, number: i + 1, ...p }, key));

export const ALL_LEVELS = WORLDS.flatMap((w) => levelsOf(w.id));

export const DAILY_ID = 'daily';

/** Local date key, e.g. 2026-10-18. */
export function dayKey(t = Date.now()) {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function dailyLevel(day = dayKey()): Level & { world: World } {
  const world = WORLDS[(seeded(day)() * WORLDS.length) | 0];
  return makeLevel({ id: DAILY_ID, worldId: world.id, number: 0, kind: 'mission', xp: 30, coins: 15 }, 'daily', {
    world,
  });
}

export function getLevel(id: string): (Level & { world: World }) | undefined {
  if (id === DAILY_ID) return dailyLevel();
  const level = ALL_LEVELS.find((l) => l.id === id);
  const world = level && getWorld(level.worldId);
  if (!level || !world) return undefined;
  const { title: _title, blurb: _blurb, ...base } = level;
  return makeLevel(base, PLAN[level.number - 1].key, { world });
}

/** The questions dealt for a level. Daily mixes every world. */
export function questionsFor(level: Level, round = 0): GameQuestion[] {
  if (level.id === DAILY_ID) {
    const day = dayKey();
    return shuffle(
      WORLDS.flatMap((w) => w.questions.filter((q) => !q.hard)),
      `daily-${day}`,
    ).slice(0, 5);
  }
  const w = getWorld(level.worldId)!;
  const easy = w.questions.filter((q) => !q.hard);
  const hard = w.questions.filter((q) => q.hard);
  const seed = `${level.id}-${round}`;
  switch (level.number) {
    case 1:
      return shuffle(easy.slice(0, 6), seed);
    case 4:
      return shuffle([...easy.slice(6), ...hard].slice(0, 6), seed);
    case 5:
      return shuffle(w.questions, seed).slice(0, 7);
    default:
      return [...shuffle(hard, seed), ...shuffle(easy, seed)].slice(0, 8);
  }
}
export const truthsFor = (level: Level, round = 0): TrueFalse[] =>
  shuffle(getWorld(level.worldId)!.truths, `${level.id}-${round}`);
export const wordsFor = (level: Level, round = 0): Scramble[] =>
  shuffle(getWorld(level.worldId)!.words, `${level.id}-${round}`).slice(0, 4);

export const SPRINT_SECONDS = 45;
export const QUESTION_SECONDS = 25;
export const HEARTS = 3;

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

/**
 * Lightning-round deck: the world's true/false facts plus one statement made from each
 * question (half pairing it with the right answer, half with a wrong one).
 */
export function sprintDeck(level: Level, round = 0): TrueFalse[] {
  const w = getWorld(level.worldId)!;
  const rand = seeded(`${level.id}-deck-${round}`);
  const fromQuestions: TrueFalse[] = w.questions
    .filter((q) => q.question.length < 70 && !/which|choose|pick/i.test(q.question))
    .map((q) => {
      const truthy = rand() < 0.5;
      const wrong = q.options.filter((_, k) => k !== q.correctIndex);
      const option = truthy ? q.options[q.correctIndex] : wrong[Math.floor(rand() * wrong.length)];
      return {
        id: `${q.id}-tf`,
        statement: `${q.question.replace(/\?$/, '')}: ${option}`,
        answer: truthy,
        explanation: `${q.options[q.correctIndex]}. ${q.explanation}`,
      };
    });
  return shuffle([...w.truths, ...fromQuestions], `${level.id}-sprint-${round}`);
}

/** Turns a mistake id back into something to revisit: what was asked, the answer and why. */
export function describeMistake(id: string): { prompt: string; answer: string; why: string } | undefined {
  for (const w of WORLDS) {
    const q = w.questions.find((x) => x.id === id || `${x.id}-tf` === id);
    if (q) return { prompt: q.question, answer: q.options[q.correctIndex], why: q.explanation };
    const t = w.truths.find((x) => x.id === id);
    if (t)
      return {
        prompt: t.statement,
        answer: i18n.t(t.answer ? 'world:sprint.true' : 'world:sprint.false'),
        why: t.explanation,
      };
    const s = w.words.find((x) => x.id === id);
    if (s) return { prompt: s.clue, answer: s.word, why: i18n.t('world:puzzle.wordWas', { word: s.word }) };
  }
  return undefined;
}
