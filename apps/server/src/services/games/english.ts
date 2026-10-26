import { createHash } from 'node:crypto';

import { HUNT_THEMES } from '../../data/english/hunts.js';
import { SENTENCES, type GrammarTopic, type Sentence } from '../../data/english/sentences.js';
import { VOCAB } from '../../data/english/vocab.js';
import { counts, fits, isWord, wordsFromRack } from './dictionary.js';

/**
 * The five English word games of Knowzone World. Each run is built from a seed, so the same seed
 * always gives the same puzzles (Word Clash uses that to replay another learner's racks). The
 * answers stay in the run's state on the server; `publicState` is all the app ever sees.
 */
export const ENGLISH_GAMES = ['hidden-letters', 'word-clash', 'word-hunter', 'spellcaster', 'sentence-master'] as const;
export type EnglishGame = (typeof ENGLISH_GAMES)[number];
export const MAX_LEVEL = 5;
export const HEARTS = 3;

// ─── Seeded randomness ────────────────────────────────────────────────────────

export function random(seed: string) {
  const h = createHash('sha256').update(seed).digest();
  let a = h.readUInt32LE(0);
  let b = h.readUInt32LE(4);
  let c = h.readUInt32LE(8);
  let d = h.readUInt32LE(12);
  // sfc32: small, fast and well distributed.
  return () => {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    const t = (a + b + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

type Rand = () => number;
const pick = <T>(r: Rand, list: readonly T[]) => list[Math.floor(r() * list.length)]!;
function shuffle<T>(r: Rand, list: readonly T[]) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}
const sample = <T>(r: Rand, list: readonly T[], n: number) => shuffle(r, list).slice(0, n);

/** Letters weighted by how common they are in English, for filling grids and racks. */
const LETTER_BAG = 'EEEEEEEEEEEEAAAAAAAAAIIIIIIIIIOOOOOOOONNNNNNRRRRRRTTTTTTLLLLSSSSUUUUDDDDGGGBBCCMMPPFFHHVVWWYYKJXQZ';
const randomLetter = (r: Rand) => pick(r, LETTER_BAG.split(''));

const lvl = (level: number) => Math.min(MAX_LEVEL, Math.max(1, level)) - 1;

// ─── Hidden Letters ───────────────────────────────────────────────────────────

const HL_WORDS = 8;
const HL_BLANKS = [1, 2, 2, 3, 3];
const HL_SECONDS = [40, 35, 30, 30, 25];
export const HL_HINT_COST = 15;

type HiddenStep = { word: string; clue: string; blanks: number[]; choices: string[]; seconds: number };

function buildHiddenLetters(level: number, r: Rand) {
  const steps: HiddenStep[] = sample(r, VOCAB[level]!, HL_WORDS).map(({ word, clue }) => {
    const positions = shuffle(
      r,
      word.split('').map((_, i) => i),
    )
      .slice(0, Math.min(HL_BLANKS[lvl(level)]!, word.length - 2))
      .sort((x, y) => x - y);
    const needed = [...new Set(positions.map((i) => word[i]!))];
    const extra: string[] = [];
    while (needed.length + extra.length < 8) {
      const ch = randomLetter(r);
      if (!needed.includes(ch) && !extra.includes(ch)) extra.push(ch);
    }
    return { word, clue, blanks: positions, choices: shuffle(r, [...needed, ...extra]), seconds: HL_SECONDS[lvl(level)]! };
  });
  return { kind: 'hidden-letters' as const, steps };
}

// ─── Word Clash ───────────────────────────────────────────────────────────────

const WC_ROUNDS = 5;
const WC_SECONDS = [60, 55, 50, 45, 45];
const WC_RARE_ROUNDS = [1, 1, 2, 2, 3];
/** Scrabble-style letter values; rare letters are gold tiles that count double. */
export const LETTER_POINTS: Record<string, number> = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
};
export const RARE_LETTERS = ['J', 'K', 'Q', 'X', 'Z'];
const LENGTH_BONUS: Record<number, number> = { 5: 5, 6: 10, 7: 20 };
/** Common words with rare letters, so a gold tile can always be used. */
export const RARE_SEEDS = [
  'QUIZ',
  'ZEBRA',
  'JUICE',
  'KNIFE',
  'BOXER',
  'JOKER',
  'MAIZE',
  'OXYGEN',
  'QUEEN',
  'JACKET',
  'PUZZLE',
  'KETTLE',
  'EXAMINE',
  'JOURNEY',
  'QUIET',
  'JOYFUL',
  'WIZARD',
  'JUNGLE',
  'SQUARE',
  'KING',
];
const BOT_SHARE = [0.35, 0.45, 0.55, 0.65, 0.72];

export function clashPoints(word: string) {
  const letters = word.split('').map((ch) => ({ ch, points: LETTER_POINTS[ch]! * (RARE_LETTERS.includes(ch) ? 2 : 1) }));
  const bonus = LENGTH_BONUS[word.length] ?? 0;
  return { total: letters.reduce((s, l) => s + l.points, 0) + bonus, letters, bonus };
}

let commonSeeds: string[] | null = null;
function seedWords() {
  commonSeeds ??= [
    ...new Set(
      [
        ...Object.values(VOCAB)
          .flat()
          .map((v) => v.word),
        ...HUNT_THEMES.flatMap((t) => t.words),
      ].filter((w) => w.length >= 5 && w.length <= 7),
    ),
  ];
  return commonSeeds;
}

function makeRack(r: Rand, seed: string) {
  const letters = seed.split('');
  while (letters.length < 7) {
    const ch = randomLetter(r);
    // A Q is only fair with a U; otherwise keep rare letters to the seed word.
    if (!RARE_LETTERS.includes(ch)) letters.push(ch);
  }
  if (letters.includes('Q') && !letters.includes('U')) letters[letters.findIndex((ch) => ch !== 'Q')] = 'U';
  return shuffle(r, letters);
}

export function bestWord(rack: string[]) {
  let best = { word: '', points: 0 };
  for (const w of wordsFromRack(rack)) {
    const points = clashPoints(w).total;
    if (points > best.points) best = { word: w, points };
  }
  return best;
}

function buildWordClash(level: number, r: Rand) {
  const rareRounds = new Set(sample(r, [0, 1, 2, 3, 4], WC_RARE_ROUNDS[lvl(level)]!));
  const rounds = Array.from({ length: WC_ROUNDS }, (_, i) => {
    const rack = makeRack(r, rareRounds.has(i) ? pick(r, RARE_SEEDS) : pick(r, seedWords()));
    return { rack, seconds: WC_SECONDS[lvl(level)]!, best: bestWord(rack) };
  });
  return { kind: 'word-clash' as const, rounds };
}

/** A practice rival's score for a round: a share of the best possible word, varying a little. */
export function botRounds(level: number, seed: string, best: number[]) {
  const r = random(`${seed}:bot`);
  return best.map((b) => Math.round(b * BOT_SHARE[lvl(level)]! * (0.8 + r() * 0.4)));
}

// ─── Word Hunter ──────────────────────────────────────────────────────────────

const WH_SIZE = [6, 7, 8, 9, 10];
const WH_WORDS = [5, 6, 6, 7, 8];
const WH_SECONDS = [90, 100, 120, 135, 150];
const DIRECTIONS: [number, number][][] = [
  [
    [0, 1],
    [1, 0],
  ],
  [
    [0, 1],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 1],
    [1, 0],
    [1, 1],
    [0, -1],
    [-1, 0],
  ],
  [
    [0, 1],
    [1, 0],
    [1, 1],
    [0, -1],
    [-1, 0],
    [-1, 1],
    [1, -1],
  ],
  [
    [0, 1],
    [1, 0],
    [1, 1],
    [0, -1],
    [-1, 0],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ],
];
export type Cell = [number, number];

function buildWordHunter(level: number, r: Rand) {
  const size = WH_SIZE[lvl(level)]!;
  const dirs = DIRECTIONS[lvl(level)]!;
  for (let attempt = 0; ; attempt++) {
    const theme = pick(r, HUNT_THEMES);
    const candidates = shuffle(
      r,
      theme.words.filter((w) => w.length <= size && w.length >= 3),
    ).sort((a, b) => b.length - a.length);
    const grid: (string | null)[][] = Array.from({ length: size }, () => Array<string | null>(size).fill(null));
    const placed: { word: string; cells: Cell[] }[] = [];
    for (const word of candidates) {
      if (placed.length >= WH_WORDS[lvl(level)]!) break;
      for (let t = 0; t < 150; t++) {
        const [dr, dc] = pick(r, dirs);
        const row = Math.floor(r() * size);
        const col = Math.floor(r() * size);
        const cells: Cell[] = word.split('').map((_, i) => [row + dr * i, col + dc * i]);
        const ok = cells.every(([y, x], i) => y >= 0 && x >= 0 && y < size && x < size && (grid[y]![x] === null || grid[y]![x] === word[i]));
        if (!ok) continue;
        cells.forEach(([y, x], i) => (grid[y]![x] = word[i]!));
        placed.push({ word, cells });
        break;
      }
    }
    // Small themes can't always fill a big grid; try another theme (or accept after a few tries).
    if (placed.length < WH_WORDS[lvl(level)]! && attempt < 8) continue;
    const letters = grid.map((row) => row.map((ch) => ch ?? randomLetter(r)));
    return { kind: 'word-hunter' as const, theme: theme.id, size, grid: letters, words: placed, seconds: WH_SECONDS[lvl(level)]! };
  }
}

/** The straight line of cells between two cells, or null if they aren't in a line. */
export function lineBetween(from: Cell, to: Cell): Cell[] | null {
  const dr = Math.sign(to[0] - from[0]);
  const dc = Math.sign(to[1] - from[1]);
  const len = Math.max(Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1])) + 1;
  if (dr && dc && Math.abs(to[0] - from[0]) !== Math.abs(to[1] - from[1])) return null;
  return Array.from({ length: len }, (_, i) => [from[0] + dr * i, from[1] + dc * i] as Cell);
}

// ─── Spellcaster ──────────────────────────────────────────────────────────────

const SC_SPELLS = 9;
const SC_TO_WIN = 6;
const SC_EXTRA_STONES = [2, 3, 3, 4, 4];
const SC_SECONDS = [30, 30, 30, 35, 40];
/** Each level is a magical world with its own guardian (art and names live in the app). */
export const SC_MONSTERS = ['slime', 'crystal', 'ember', 'frost', 'shadow'];

export const spellDamage = (word: string, fast: boolean) => 15 + 2 * word.length + (fast ? 5 : 0);

function buildSpellcaster(level: number, r: Rand) {
  const pool = VOCAB[level]!.filter((v) => v.word.length <= 10);
  const spells = sample(r, pool, SC_SPELLS).map(({ word, clue }) => {
    const extra = Array.from({ length: SC_EXTRA_STONES[lvl(level)]! }, () => randomLetter(r));
    return { word, clue, stones: shuffle(r, [...word.split(''), ...extra]), seconds: SC_SECONDS[lvl(level)]! };
  });
  // Six right spells (without speed bonuses) defeat the guardian.
  const hp = spells.slice(0, SC_TO_WIN).reduce((s, sp) => s + spellDamage(sp.word, false), 0);
  return { kind: 'spellcaster' as const, monster: SC_MONSTERS[lvl(level)]!, hp, spells };
}

// ─── Sentence Master ──────────────────────────────────────────────────────────

const SM_SENTENCES = 8;
export const SM_HINT_COST = 10;

function buildSentenceMaster(level: number, r: Rand) {
  const { topic, sentences } = SENTENCES[level]!;
  const steps = sample(r, sentences, SM_SENTENCES).map((sentence) => ({ sentence, chips: shuffle(r, [...sentence.words, sentence.trap]) }));
  return { kind: 'sentence-master' as const, topic, steps };
}

export const sentenceText = (s: Sentence) => s.text ?? `${s.words.join(' ')}${s.end}`;
const sameWords = (a: string[], b: string[]) => a.length === b.length && a.every((w, i) => w === b[i]);
export const sentenceCorrect = (s: Sentence, words: string[]) => sameWords(s.words, words) || !!s.also?.some((o) => sameWords(o, words));

// ─── Building and showing a run ───────────────────────────────────────────────

export type Puzzle =
  | ReturnType<typeof buildHiddenLetters>
  | ReturnType<typeof buildWordClash>
  | ReturnType<typeof buildWordHunter>
  | ReturnType<typeof buildSpellcaster>
  | ReturnType<typeof buildSentenceMaster>;

/** What happened so far, kept next to the puzzle in GameRun.state. */
export type Progress = {
  /** The step being played (unused by Word Hunter). */
  at: number;
  results: Record<number, { correct: boolean; points: number; answer?: unknown; hints?: number }>;
  streak: number;
  /** Word Hunter: words found. */
  found: string[];
  /** Spellcaster: guardian's health left. */
  hp?: number;
  /** Hidden Letters / Sentence Master hints used on the current step. */
  hintsAt?: Record<number, number[]>;
  /** Mystery Substance: tests run on each case. */
  tests?: Record<number, string[]>;
  /** Lab games: questions asked to Kora in this run. */
  asked?: number;
  /** Rocket Builder and Gravity Master: failed tries on each step. */
  tries?: Record<number, number>;
  /** Rocket Builder: the rocket that flew on each build step. */
  designs?: Record<number, unknown>;
};

export type Opponent = { kind: 'player' | 'bot'; runId?: string; name: string | null; photo?: string; rounds: number[] };
/** A run's saved state. Chemistry runs keep their own puzzle shape (see chemistry.ts). */
export type RunState = { puzzle: Puzzle; progress: Progress; opponent?: Opponent };

export function buildPuzzle(game: EnglishGame, level: number, seed: string): Puzzle {
  const r = random(`${game}:${level}:${seed}`);
  switch (game) {
    case 'hidden-letters':
      return buildHiddenLetters(level, r);
    case 'word-clash':
      return buildWordClash(level, r);
    case 'word-hunter':
      return buildWordHunter(level, r);
    case 'spellcaster':
      return buildSpellcaster(level, r);
    case 'sentence-master':
      return buildSentenceMaster(level, r);
  }
}

export const newProgress = (p: Puzzle): Progress => ({ at: 0, results: {}, streak: 0, found: [], ...(p.kind === 'spellcaster' && { hp: p.hp }) });

/** Number of steps (words, rounds, spells, sentences, hidden words) in a run. */
export function stepCount(p: Puzzle) {
  switch (p.kind) {
    case 'hidden-letters':
    case 'sentence-master':
      return p.steps.length;
    case 'word-clash':
      return p.rounds.length;
    case 'word-hunter':
      return p.words.length;
    case 'spellcaster':
      return p.spells.length;
  }
}

/** The run as the app sees it: puzzles without answers, plus the results so far. */
export function publicState({ puzzle: p, progress, opponent }: RunState) {
  const results = progress.results;
  switch (p.kind) {
    case 'hidden-letters':
      return {
        steps: p.steps.map((s, i) => ({
          id: i,
          length: s.word.length,
          // Letters shown in place; null for the hidden ones (and hints revealed so far).
          tiles: s.word.split('').map((ch, k) => (s.blanks.includes(k) && !(progress.hintsAt?.[i] ?? []).includes(k) ? null : ch)),
          clue: s.clue,
          choices: s.choices,
          seconds: s.seconds,
          ...(results[i] && { result: { ...results[i], word: s.word } }),
        })),
        hintCost: HL_HINT_COST,
      };
    case 'word-clash':
      return {
        rounds: p.rounds.map((r, i) => ({
          id: i,
          rack: r.rack.map((ch) => ({ letter: ch, points: LETTER_POINTS[ch]!, rare: RARE_LETTERS.includes(ch) })),
          seconds: r.seconds,
          ...(results[i] && { result: { ...results[i], best: r.best, opponent: opponent?.rounds[i] ?? 0 } }),
        })),
        opponent: opponent && { kind: opponent.kind, name: opponent.name, ...(opponent.photo && { photo: opponent.photo }) },
      };
    case 'word-hunter':
      return {
        theme: p.theme,
        size: p.size,
        grid: p.grid,
        seconds: p.seconds,
        words: p.words.map((w) => w.word).sort((a, b) => a.length - b.length || a.localeCompare(b)),
        found: p.words.filter((w) => progress.found.includes(w.word)).map((w) => ({ word: w.word, cells: w.cells })),
      };
    case 'spellcaster':
      return {
        monster: p.monster,
        maxHp: p.hp,
        hp: progress.hp ?? p.hp,
        spells: p.spells.map((s, i) => ({
          id: i,
          prompt: s.clue,
          length: s.word.length,
          stones: s.stones,
          seconds: s.seconds,
          ...(results[i] && { result: { ...results[i], word: s.word } }),
        })),
      };
    case 'sentence-master':
      return {
        topic: p.topic as GrammarTopic,
        hintCost: SM_HINT_COST,
        steps: p.steps.map((s, i) => ({
          id: i,
          chips: s.chips,
          slots: s.sentence.words.length,
          end: s.sentence.end,
          ...(results[i] && { result: { ...results[i], sentence: sentenceText(s.sentence) } }),
        })),
      };
  }
}

// ─── Checking answers ─────────────────────────────────────────────────────────

export type Answer = {
  step?: number;
  letters?: string[];
  word?: string;
  words?: string[];
  from?: Cell;
  to?: Cell;
  /** How long the learner took, in milliseconds (only used for small speed bonuses). */
  ms?: number;
  /** The time ran out on this step. */
  timeout?: boolean;
  // Chemistry lab
  reagents?: string[];
  choice?: string;
  symbols?: string[];
  atoms?: string[];
  bonds?: [number, number, number][];
  coefficients?: number[];
  test?: string;
};

export type Outcome = {
  correct: boolean;
  points: number;
  /** Lose a heart (wrong answers and timeouts). */
  heartLost: boolean;
  /** Word Clash: an invalid word that doesn't use up the round. */
  retry?: boolean;
  reason?: 'not-a-word' | 'letters' | 'too-short';
  reveal?: Record<string, unknown>;
  /** The step was used up (move on to the next). */
  advance: boolean;
};

const seconds = (ms: number | undefined, limit: number) => Math.min(limit, Math.max(0, Math.round((ms ?? limit * 1000) / 1000)));

/** Checks one answer. Pure: the caller saves the new progress. */
export function check(state: RunState, a: Answer): Outcome {
  const { puzzle: p, progress } = state;
  switch (p.kind) {
    case 'hidden-letters': {
      const s = p.steps[progress.at]!;
      const hinted = progress.hintsAt?.[progress.at] ?? [];
      const open = s.blanks.filter((k) => !hinted.includes(k));
      const guess = s.word.split('');
      (a.letters ?? []).slice(0, open.length).forEach((ch, i) => (guess[open[i]!] = String(ch).toUpperCase()));
      const correct = !a.timeout && (a.letters?.length ?? 0) === open.length && guess.join('') === s.word;
      const left = s.seconds - seconds(a.ms, s.seconds);
      const streak = correct ? progress.streak + 1 : 0;
      const points = correct ? Math.round((100 + left * 3 - hinted.length * 40) * (1 + Math.min(streak - 1, 5) * 0.1)) : 0;
      return { correct, points: Math.max(0, points), heartLost: !correct, advance: true, reveal: { word: s.word, streak } };
    }
    case 'word-clash': {
      const round = p.rounds[progress.at]!;
      if (a.timeout || !a.word) return { correct: false, points: 0, heartLost: false, advance: true, reveal: { best: round.best } };
      const word = a.word.toUpperCase().replace(/[^A-Z]/g, '');
      if (word.length < 3) return { correct: false, points: 0, heartLost: false, retry: true, reason: 'too-short', advance: false };
      if (!fits(counts(word), counts(round.rack.join(''))))
        return { correct: false, points: 0, heartLost: true, retry: true, reason: 'letters', advance: false };
      if (!isWord(word)) return { correct: false, points: 0, heartLost: true, retry: true, reason: 'not-a-word', advance: false };
      const { total, letters, bonus } = clashPoints(word);
      return { correct: true, points: total, heartLost: false, advance: true, reveal: { word, letters, bonus, best: round.best } };
    }
    case 'word-hunter': {
      if (!a.from || !a.to) return { correct: false, points: 0, heartLost: false, advance: false };
      const line = lineBetween(a.from, a.to);
      const same = (x: Cell[], y: Cell[]) => x.length === y.length && x.every(([r, c], i) => r === y[i]![0] && c === y[i]![1]);
      const hit = line && p.words.find((w) => !progress.found.includes(w.word) && (same(w.cells, line) || same([...w.cells].reverse(), line)));
      if (!hit) return { correct: false, points: 0, heartLost: false, advance: false };
      return { correct: true, points: 50 + 10 * hit.word.length, heartLost: false, advance: false, reveal: { word: hit.word, cells: hit.cells } };
    }
    case 'spellcaster': {
      const s = p.spells[progress.at]!;
      const correct = !a.timeout && (a.word ?? '').toUpperCase() === s.word;
      const fast = seconds(a.ms, s.seconds) <= 10;
      const damage = correct ? spellDamage(s.word, fast) : 0;
      return { correct, points: damage, heartLost: !correct, advance: true, reveal: { word: s.word, damage, fast: correct && fast } };
    }
    case 'sentence-master': {
      const s = p.steps[progress.at]!;
      const correct = !a.timeout && sentenceCorrect(s.sentence, a.words ?? []);
      const hints = progress.hintsAt?.[progress.at]?.length ?? 0;
      const points = correct ? Math.max(20, 100 - hints * 30) : 0;
      return { correct, points, heartLost: false, advance: true, reveal: { sentence: sentenceText(s.sentence) } };
    }
  }
}

/** Whether the run can't go on: out of hearts, guardian defeated, every step played or every word found. */
export function isOver(state: RunState, hearts: number) {
  const { puzzle: p, progress } = state;
  if (p.kind === 'word-hunter') return progress.found.length === p.words.length;
  if (hearts <= 0 && p.kind !== 'sentence-master') return true;
  if (p.kind === 'spellcaster' && (progress.hp ?? 1) <= 0) return true;
  return progress.at >= stepCount(p);
}

// ─── Stars ────────────────────────────────────────────────────────────────────

export function starsFor(state: RunState, hearts: number, score: number) {
  const { puzzle: p, progress } = state;
  const right = Object.values(progress.results).filter((r) => r.correct).length;
  switch (p.kind) {
    case 'hidden-letters':
      return right >= 8 ? 3 : right >= 6 ? 2 : right >= 4 ? 1 : 0;
    case 'sentence-master':
      return right >= 8 ? 3 : right >= 6 ? 2 : right >= 4 ? 1 : 0;
    case 'word-hunter': {
      const share = progress.found.length / p.words.length;
      return share >= 1 ? 3 : share >= 0.66 ? 2 : share >= 0.33 ? 1 : 0;
    }
    case 'spellcaster':
      return (progress.hp ?? 1) <= 0 ? (hearts >= 2 ? 3 : 2) : right >= 3 ? 1 : 0;
    case 'word-clash': {
      const theirs = (state.opponent?.rounds ?? []).reduce((s, n) => s + n, 0);
      if (score > theirs) return 3;
      if (score === theirs && score > 0) return 2;
      return score >= theirs / 2 && score > 0 ? 1 : 0;
    }
  }
}
