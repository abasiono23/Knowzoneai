import { CIVILIZATIONS } from '../../data/history/civilizations.js';
import { COUNTRIES, mapDistance } from '../../data/history/countries.js';
import { ERAS, EVENTS } from '../../data/history/eras.js';
import type { Question } from '../../data/space/questions.js';
import { random, type Answer, type Outcome, type Progress } from './english.js';

/**
 * The Museum of Time games (History & Geography). Like the other games, every run is built from a
 * seed and the answers stay on the server: `historyPublicState` is all the app sees.
 */
export const HISTORY_GAMES = ['time-machine', 'lost-civilization', 'africa-explorer'] as const;
export type HistoryGame = (typeof HISTORY_GAMES)[number];

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
const lvl = (level: number) => Math.min(5, Math.max(1, level));
const asked = (r: Rand, x: Question) => ({ q: x.q, answer: x.answer, options: shuffle(r, [x.answer, ...x.wrong]) });

/** Picks `n` from what's open at this level; from level 2, one of them is new at this level. */
function trip<T extends { level: number }>(r: Rand, all: readonly T[], level: number, n: number) {
  const pool = all.filter((x) => x.level <= level);
  const fresh = pool.filter((x) => x.level === level);
  const first = level > 1 && fresh.length ? [fresh[Math.floor(r() * fresh.length)]!] : [];
  return shuffle(r, [
    ...first,
    ...sample(
      r,
      pool.filter((x) => !first.includes(x)),
      n - first.length,
    ),
  ]);
}

// ─── Building runs ────────────────────────────────────────────────────────────

/** Four real events far enough apart to put in order (earliest first). */
function orderChallenge(r: Rand, level: number) {
  const pool = EVENTS.filter((e) => e.level <= level);
  for (;;) {
    const picked = sample(r, pool, 4);
    const years = picked.map((e) => e.year).sort((a, b) => a - b);
    if (years.every((y, k) => k === 0 || y - years[k - 1]! >= 10)) {
      const answer = [...picked].sort((a, b) => a.year - b.year).map((e) => e.text);
      return { type: 'order' as const, q: 'Put these events in order, earliest first.', items: shuffle(r, answer), answer };
    }
  }
}

function buildTimeMachine(level: number, r: Rand) {
  // Visited in time order, like a real journey through history.
  const eras = trip(r, ERAS, lvl(level), 3).sort((a, b) => a.year - b.year);
  const orders = level >= 4 ? 2 : level >= 2 ? 1 : 0;
  return {
    kind: 'time-machine' as const,
    eras: eras.map((era, k) => {
      const [first, second] = sample(r, era.questions, 2);
      return {
        id: era.id,
        challenges: [
          { type: 'choice' as const, ...asked(r, first!) },
          k >= eras.length - orders ? orderChallenge(r, lvl(level)) : { type: 'choice' as const, ...asked(r, second!) },
        ],
      };
    }),
  };
}

function buildLostCivilization(level: number, r: Rand) {
  const civs = trip(r, CIVILIZATIONS, lvl(level), 3);
  return {
    kind: 'lost-civilization' as const,
    digs: civs.map((c) => {
      const others = sample(
        r,
        CIVILIZATIONS.filter((x) => x.id !== c.id),
        3,
      ).map((x) => x.name);
      return {
        id: c.id,
        mystery: { q: 'Which civilization left these behind?', answer: c.name, options: shuffle(r, [c.name, ...others]) },
        followUp: asked(r, sample(r, c.questions, 1)[0]!),
      };
    }),
  };
}

/** How close a tap must be at each level (easier at first). */
const FIND_SLACK = [1.35, 1.2, 1.1, 1, 1];

function buildAfricaExplorer(level: number, r: Rand) {
  return {
    kind: 'africa-explorer' as const,
    slack: FIND_SLACK[lvl(level) - 1]!,
    stops: trip(r, COUNTRIES, lvl(level), 4).map((c) => ({ id: c.id, question: asked(r, sample(r, c.questions, 1)[0]!) })),
  };
}

export type HistoryPuzzle = ReturnType<typeof buildTimeMachine> | ReturnType<typeof buildLostCivilization> | ReturnType<typeof buildAfricaExplorer>;
export type HistoryState = { puzzle: HistoryPuzzle; progress: Progress };

export function buildHistoryPuzzle(game: HistoryGame, level: number, seed: string): HistoryPuzzle {
  const r = random(`${game}:${level}:${seed}`);
  switch (game) {
    case 'time-machine':
      return buildTimeMachine(level, r);
    case 'lost-civilization':
      return buildLostCivilization(level, r);
    case 'africa-explorer':
      return buildAfricaExplorer(level, r);
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

export function historyPublicState({ puzzle: p, progress }: HistoryState, level: number) {
  const results = progress.results;
  switch (p.kind) {
    case 'time-machine':
      return {
        eras: p.eras.map((x, k) => {
          const e = era(x.id);
          return {
            id: e.id,
            title: e.title,
            when: e.when,
            year: e.year,
            place: e.place,
            intro: e.intro,
            spots: e.spots,
            challenges: x.challenges.map((c, j) => {
              const i = 2 * k + j;
              const result = results[i] && { result: { ...results[i], answer: c.answer } };
              return c.type === 'order'
                ? { id: i, type: c.type, q: c.q, items: c.items, ...result }
                : { id: i, type: c.type, q: c.q, options: c.options, ...result };
            }),
          };
        }),
      };
    case 'lost-civilization':
      return {
        digs: p.digs.map((x, k) => {
          const c = civ(x.id);
          const named = results[2 * k];
          return {
            id: k,
            dig: c.dig,
            // The hero find's picture is the civilization's; the app shows it once dug up.
            art: c.id,
            finds: c.finds,
            mystery: { id: 2 * k, q: x.mystery.q, options: x.mystery.options, ...(named && { result: { ...named, answer: c.name, about: c.about } }) },
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
        stops: p.stops.map((x, k) => {
          const c = country(x.id);
          const found = results[2 * k];
          return {
            id: k,
            name: c.name,
            // A hint on the first levels.
            ...(level <= 2 && { region: c.region }),
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
        const correct = !a.timeout && (a.order ?? []).length === c.answer.length && c.answer.every((t, j) => a.order![j] === t);
        return choiceOutcome(correct, c.answer);
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
        const correct = !a.timeout && !!a.point && mapDistance(a.point, c.at) <= c.radius * p.slack;
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
  const share = Object.values(progress.results).filter((x) => x.correct).length / historyStepCount(p);
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
          ? `Identify the civilization from these finds: ${c.finds.map((f) => `${f.name} (${f.clue})`).join('; ')}. Options: ${x.mystery.options.join('; ')}. Correct: ${c.name}.`
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
