import { CIVILIZATIONS, COUNTRIES, ERAS, EVENTS, mapDistance, type LeveledQuestion } from '../../data/history/levels.js';
import { random, type Answer, type Outcome, type Progress } from './english.js';

/**
 * The Museum of Time games (History & Geography). Like the other games, every run is built from a
 * seed and the answers stay on the server: `historyPublicState` is all the app sees.
 *
 * The ladder has ten levels, like the word games: 1 Starter (famous facts) to 10 Super hard (source
 * criticism, historiography and fine chronology). Levels up to OPEN_LEVELS are open to everyone;
 * later ones open with a star on the level before. Progress from the old five-level ladder keeps its
 * level numbers: old level L content is now at levels 2L − 1 and 2L, so nobody is credited past what
 * they have shown. As the levels rise the questions get harder, the timeline gets tighter (more
 * events, closer together), digs show fewer and subtler finds with more look-alike civilisations, the
 * map needs a more exact tap without a region hint, and the clock gets shorter (unless the learner
 * has turned the timer off).
 */
export const HISTORY_GAMES = ['time-machine', 'lost-civilization', 'africa-explorer'] as const;
export type HistoryGame = (typeof HISTORY_GAMES)[number];
export const MAX_LEVEL = 10;
export const OPEN_LEVELS = 4;
export const levelOpen = (level: number, starsOnLevelBefore: number) => level <= OPEN_LEVELS || starsOnLevelBefore > 0;

type Rand = () => number;
function shuffle<T>(r: Rand, list: readonly T[]) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}
const sample = <T>(r: Rand, list: readonly T[], n: number) => shuffle(r, list).slice(0, n);
const lvl = (level: number) => Math.min(MAX_LEVEL, Math.max(1, Math.round(level)));
/** Per level (index 0 = level 1). */
const by = <T>(list: readonly T[], level: number) => list[lvl(level) - 1]!;

/** Seconds for a question at each level; 0 = no clock (the first three levels). Order challenges get double. */
export const SECONDS = [0, 0, 0, 45, 40, 35, 30, 25, 25, 20];

/** The question nearest a level: its own level first, then one below, one above, two below… */
function nearest(r: Rand, list: readonly LeveledQuestion[], level: number, avoid: Set<string> = new Set()) {
  const free = list.filter((x) => !avoid.has(x.q));
  for (const d of [0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -6, 6, -7, 7, -8, 8, -9, 9]) {
    const here = free.filter((x) => x.level === level + d);
    if (here.length) return here[Math.floor(r() * here.length)]!;
  }
  return null;
}
const asked = (r: Rand, x: LeveledQuestion) => ({ q: x.q, answer: x.answer, options: shuffle(r, [x.answer, ...x.wrong.slice(0, 3)]) });
/** How close a pool's questions are to a level (the best match counts). */
const fit = (list: readonly LeveledQuestion[], level: number) => Math.min(...list.map((x) => Math.abs(x.level - level)));

/**
 * Places for a run: `n` from those open at this level whose questions suit it, with at least one in
 * Africa and (from level 2) one elsewhere in the world, and from level 3 one that is new at about
 * this level.
 */
function places<T extends { id: string; level: number; region?: string; questions: LeveledQuestion[] }>(
  r: Rand,
  all: readonly T[],
  level: number,
  n: number,
  mix = true,
) {
  const open = all.filter((x) => x.level <= level && fit(x.questions, level) <= 2);
  const pool = open.length >= n ? open : all.filter((x) => x.level <= level);
  const picked: T[] = [];
  const take = (from: T[]) => {
    const left = from.filter((x) => !picked.includes(x));
    if (left.length) picked.push(left[Math.floor(r() * left.length)]!);
  };
  if (level >= 3) take(pool.filter((x) => x.level >= level - 2));
  if (mix) {
    if (!picked.some((x) => x.region === 'africa')) take(pool.filter((x) => x.region === 'africa'));
    if (level >= 2 && !picked.some((x) => x.region !== 'africa')) take(pool.filter((x) => x.region !== 'africa'));
  }
  while (picked.length < n && picked.length < pool.length) take(pool);
  return shuffle(r, picked);
}

// ─── Time machine ─────────────────────────────────────────────────────────────

const ERA_COUNT = [3, 3, 3, 3, 4, 4, 4, 4, 5, 5];
const ORDER_CHALLENGES = [0, 1, 1, 1, 2, 2, 2, 2, 3, 3];
const ORDER_ITEMS = [3, 4, 4, 4, 5, 5, 5, 6, 6, 6];
/** The fewest years between neighbouring events in an order challenge. */
const ORDER_GAP = [200, 100, 60, 40, 25, 15, 10, 5, 2, 1];

/** Events far enough apart to put in order (earliest first). Ancient dates are approximate, so they need a wide gap. */
export function orderChallenge(r: Rand, level: number) {
  const items = by(ORDER_ITEMS, level);
  const gap = by(ORDER_GAP, level);
  // Mostly events about this well known; from level 3, at least one of this level's.
  const pool = EVENTS.filter((e) => e.level <= level && e.level >= level - 4);
  const wide = EVENTS.filter((e) => e.level <= level);
  for (let tries = 0; ; tries++) {
    const from = tries < 200 && pool.length >= items * 2 ? pool : wide;
    const picked = sample(r, from, items).sort((a, b) => a.year - b.year);
    const spaced = picked.every((e, k) => {
      if (k === 0) return true;
      const before = picked[k - 1]!;
      const need = Math.max(gap, Math.min(e.year, before.year) < 1000 ? 150 : 0);
      return e.year - before.year >= need;
    });
    if (spaced || tries > 2000) {
      const answer = picked.map((e) => e.text);
      return { type: 'order' as const, q: 'Put these events in order, earliest first.', items: shuffle(r, answer), answer, years: picked.map((e) => e.year) };
    }
  }
}

function buildTimeMachine(level: number, r: Rand) {
  // Visited in time order, like a real journey through history.
  const eras = places(r, ERAS, level, by(ERA_COUNT, level)).sort((a, b) => a.year - b.year);
  const orders = by(ORDER_CHALLENGES, level);
  return {
    kind: 'time-machine' as const,
    level,
    eras: eras.map((era, k) => {
      const first = nearest(r, era.questions, level)!;
      const second = nearest(r, era.questions, level, new Set([first.q])) ?? first;
      return {
        id: era.id,
        challenges: [
          { type: 'choice' as const, ...asked(r, first) },
          k >= eras.length - orders ? orderChallenge(r, level) : { type: 'choice' as const, ...asked(r, second) },
        ],
      };
    }),
  };
}

// ─── Lost civilization ────────────────────────────────────────────────────────

const DIG_COUNT = [3, 3, 3, 4, 4, 4, 4, 5, 5, 5];
/** Finds shown per dig, and how many of them are the subtle kind. */
const FINDS = [3, 3, 3, 3, 3, 3, 2, 2, 2, 2];
const SUBTLE = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2];
const NAME_OPTIONS = [4, 4, 4, 4, 5, 5, 6, 6, 6, 6];

function buildLostCivilization(level: number, r: Rand) {
  const civs = places(r, CIVILIZATIONS, level, by(DIG_COUNT, level));
  return {
    kind: 'lost-civilization' as const,
    level,
    digs: civs.map((c) => {
      const plain = c.finds.filter((f) => !f.subtle);
      const subtle = c.finds.filter((f) => f.subtle);
      const wantSubtle = Math.min(subtle.length, by(SUBTLE, level));
      const finds = [...sample(r, subtle, wantSubtle), ...sample(r, plain, by(FINDS, level) - wantSubtle)];
      // From level 5, the wrong names are from the same part of the world first (harder to tell apart).
      const others = CIVILIZATIONS.filter((x) => x.id !== c.id && x.name !== c.name);
      const near = level >= 5 ? shuffle(r, others.filter((x) => x.region === c.region)) : [];
      const names = [...new Set([...near, ...shuffle(r, others)].map((x) => x.name))].slice(0, by(NAME_OPTIONS, level) - 1);
      return {
        id: c.id,
        finds: shuffle(r, finds).map((f) => c.finds.indexOf(f)),
        mystery: { q: 'Which civilisation left these behind?', answer: c.name, options: shuffle(r, [c.name, ...names]) },
        followUp: asked(r, nearest(r, c.questions, level)!),
      };
    }),
  };
}

// ─── Africa explorer ──────────────────────────────────────────────────────────

const STOPS = [4, 4, 4, 5, 5, 5, 6, 6, 6, 6];
/** How close a tap must be, as a share of the country's size (easier at first). */
export const FIND_SLACK = [1.4, 1.3, 1.2, 1.1, 1, 1, 0.9, 0.85, 0.8, 0.75];

function buildAfricaExplorer(level: number, r: Rand) {
  const stops = places(r, COUNTRIES, level, by(STOPS, level), false);
  return {
    kind: 'africa-explorer' as const,
    level,
    slack: by(FIND_SLACK, level),
    stops: stops.map((c) => {
      // Markers to choose from instead of tapping the map (for anyone who can't place a pin): the
      // country and three others well away from it and each other.
      const others: [number, number][] = [];
      for (const o of shuffle(r, COUNTRIES)) {
        if (others.length >= 3) break;
        if (o.id === c.id) continue;
        if ([c.at, ...others].every((p) => mapDistance(p, o.at) > Math.max(5, c.radius * 2))) others.push(o.at);
      }
      return { id: c.id, choices: shuffle(r, [c.at, ...others]), question: asked(r, nearest(r, c.questions, level)!) };
    }),
  };
}

export type HistoryPuzzle = ReturnType<typeof buildTimeMachine> | ReturnType<typeof buildLostCivilization> | ReturnType<typeof buildAfricaExplorer>;
export type HistoryState = { puzzle: HistoryPuzzle; progress: Progress };

export function buildHistoryPuzzle(game: HistoryGame, level: number, seed: string): HistoryPuzzle {
  const r = random(`${game}:${level}:${seed}`);
  const L = lvl(level);
  switch (game) {
    case 'time-machine':
      return buildTimeMachine(L, r);
    case 'lost-civilization':
      return buildLostCivilization(L, r);
    case 'africa-explorer':
      return buildAfricaExplorer(L, r);
  }
}

/** Every game has two steps per place: two challenges per era, name-then-question per dig, find-then-question per country. */
export function historyStepCount(p: HistoryPuzzle) {
  switch (p.kind) {
    case 'time-machine':
      return p.eras.length * 2;
    case 'lost-civilization':
      return p.digs.length * 2;
    case 'africa-explorer':
      return p.stops.length * 2;
  }
}

// ─── What the app sees ────────────────────────────────────────────────────────

const era = (id: string) => ERAS.find((e) => e.id === id)!;
const civ = (id: string) => CIVILIZATIONS.find((c) => c.id === id)!;
const country = (id: string) => COUNTRIES.find((c) => c.id === id)!;
/** Runs started before the ten-level ladder have no level in their puzzle. */
const levelOf = (p: HistoryPuzzle, level: number) => ('level' in p && p.level ? p.level : lvl(level));

export function historyPublicState({ puzzle: p, progress }: HistoryState, runLevel: number) {
  const results = progress.results;
  const level = levelOf(p, runLevel);
  const seconds = by(SECONDS, level);
  switch (p.kind) {
    case 'time-machine':
      return {
        seconds,
        eras: p.eras.map((x, k) => {
          const e = era(x.id);
          return {
            id: e.id,
            title: e.title,
            when: e.when,
            year: e.year,
            place: e.place,
            region: e.region,
            intro: e.intro,
            challenges: x.challenges.map((c, j) => {
              const i = 2 * k + j;
              if (c.type === 'order') {
                const done = results[i];
                return {
                  id: i,
                  type: c.type,
                  q: c.q,
                  items: c.items,
                  ...(done && { result: { ...done, answer: c.answer, years: 'years' in c ? c.years : undefined } }),
                };
              }
              return { id: i, type: c.type, q: c.q, options: c.options, ...(results[i] && { result: { ...results[i], answer: c.answer } }) };
            }),
          };
        }),
      };
    case 'lost-civilization':
      return {
        seconds,
        digs: p.digs.map((x, k) => {
          const c = civ(x.id);
          const named = results[2 * k];
          // Old runs kept no list of finds: they showed all of them.
          const finds = 'finds' in x && Array.isArray(x.finds) ? x.finds.map((i) => c.finds[i]!) : c.finds;
          return {
            id: k,
            dig: c.dig,
            art: c.id,
            finds: finds.map((f) => ({ name: f.name, clue: f.clue, art: f.art })),
            mystery: {
              id: 2 * k,
              q: x.mystery.q,
              options: x.mystery.options,
              ...(named && { result: { ...named, answer: c.name, about: c.about } }),
            },
            ...(named && {
              followUp: {
                id: 2 * k + 1,
                q: x.followUp.q,
                options: x.followUp.options,
                ...(results[2 * k + 1] && { result: { ...results[2 * k + 1], answer: x.followUp.answer } }),
              },
            }),
          };
        }),
      };
    case 'africa-explorer':
      return {
        seconds,
        stops: p.stops.map((x, k) => {
          const c = country(x.id);
          const found = results[2 * k];
          return {
            id: k,
            name: c.name,
            // A hint on the first levels.
            ...(level <= 3 && { region: c.region }),
            ...(!found && 'choices' in x ? { choices: x.choices } : {}),
            ...(found && {
              find: { ...found, at: c.at },
              landmark: c.landmark,
              art: c.id,
              facts: c.facts,
              question: {
                id: 2 * k + 1,
                q: x.question.q,
                options: x.question.options,
                ...(results[2 * k + 1] && { result: { ...results[2 * k + 1], answer: x.question.answer } }),
              },
            }),
          };
        }),
      };
  }
}

// ─── Checking ─────────────────────────────────────────────────────────────────

export type HistoryAnswer = Answer & { order?: string[]; point?: [number, number] };

const choiceOutcome = (correct: boolean, answer: string | string[]): Outcome => ({
  correct,
  points: correct ? 100 : 0,
  heartLost: !correct,
  advance: true,
  reveal: { answer },
});

export function historyCheck({ puzzle: p, progress }: HistoryState, a: HistoryAnswer): Outcome {
  const at = progress.at;
  const k = Math.floor(at / 2);
  switch (p.kind) {
    case 'time-machine': {
      const c = p.eras[k]!.challenges[at % 2]!;
      if (c.type === 'order') {
        const given = a.order ?? [];
        const correct = !a.timeout && given.length === c.answer.length && c.answer.every((t, j) => given[j] === t);
        // Partly right orders still earn something (each event in its right place).
        const placed = a.timeout ? 0 : c.answer.filter((t, j) => given[j] === t).length;
        return {
          ...choiceOutcome(correct, c.answer),
          points: correct ? 100 : Math.round((50 * placed) / c.answer.length),
          // The dates, shown once answered.
          reveal: { answer: c.answer, ...('years' in c && { years: c.years }) },
        };
      }
      return choiceOutcome(!a.timeout && a.choice === c.answer, c.answer);
    }
    case 'lost-civilization': {
      const x = p.digs[k]!;
      if (at % 2 === 0) {
        const correct = !a.timeout && a.choice === x.mystery.answer;
        return { ...choiceOutcome(correct, x.mystery.answer), reveal: { answer: x.mystery.answer, about: civ(x.id).about } };
      }
      return choiceOutcome(!a.timeout && a.choice === x.followUp.answer, x.followUp.answer);
    }
    case 'africa-explorer': {
      const x = p.stops[k]!;
      const c = country(x.id);
      if (at % 2 === 0) {
        // Never less than a degree, so the smallest countries can still be found.
        const reach = Math.max(1, c.radius * p.slack);
        const correct = !a.timeout && !!a.point && mapDistance(a.point, c.at) <= reach;
        return { correct, points: correct ? 100 : 0, heartLost: !correct, advance: true, reveal: { at: c.at } };
      }
      return choiceOutcome(!a.timeout && a.choice === x.question.answer, x.question.answer);
    }
  }
}

export function historyIsOver({ puzzle: p, progress }: HistoryState, hearts: number) {
  return hearts <= 0 || progress.at >= historyStepCount(p);
}

export function historyStars({ puzzle: p, progress }: HistoryState) {
  const points = Object.values(progress.results).reduce((s, x) => s + x.points, 0);
  const share = points / (100 * historyStepCount(p));
  return share >= 0.85 ? 3 : share >= 0.6 ? 2 : share >= 0.3 ? 1 : 0;
}

/** What Kora needs to help on the current step (Kora is told to guide, not to give the answer away). */
export function historyHelpContext({ puzzle: p, progress }: HistoryState) {
  const at = Math.min(progress.at, historyStepCount(p) - 1);
  const k = Math.floor(at / 2);
  switch (p.kind) {
    case 'time-machine': {
      const e = era(p.eras[k]!.id);
      const c = p.eras[k]!.challenges[at % 2]!;
      const task =
        c.type === 'order'
          ? `Put in order, earliest first: ${c.items.join('; ')}. Correct order: ${c.answer.join(' → ')}.`
          : `${c.q} Options: ${c.options.join('; ')}. Correct: ${c.answer}.`;
      return `History time travel to ${e.title} (${e.when}, ${e.place}): ${e.intro} Task: ${task}`;
    }
    case 'lost-civilization': {
      const x = p.digs[k]!;
      const c = civ(x.id);
      const task =
        at % 2 === 0
          ? `Identify the civilisation from these finds: ${c.finds.map((f) => `${f.name} (${f.clue})`).join('; ')}. Options: ${x.mystery.options.join('; ')}. Correct: ${c.name}.`
          : `About ${c.name} (${c.about}): ${x.followUp.q} Options: ${x.followUp.options.join('; ')}. Correct: ${x.followUp.answer}.`;
      return `Archaeology game. ${task}`;
    }
    case 'africa-explorer': {
      const x = p.stops[k]!;
      const c = country(x.id);
      return at % 2 === 0
        ? `Find ${c.name} on a map of Africa by tapping it. It is in ${c.region}. Describe where it is (neighbours, coast, rivers) without giving coordinates.`
        : `About ${c.name} (${c.landmark}): ${x.question.q} Options: ${x.question.options.join('; ')}. Correct: ${x.question.answer}.`;
    }
  }
}
