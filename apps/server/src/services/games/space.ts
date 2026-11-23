import { PLACE_QUESTIONS } from '../../data/space/explorer-ladder.js';
import { DESTINATIONS, type Destination } from '../../data/space/planets.js';
import { num, PROBLEMS_BY_LEVEL, sig, type Problem } from '../../data/space/problems.js';
import { MORE_QUESTIONS } from '../../data/space/questions-ladder.js';
import { QUESTIONS } from '../../data/space/questions.js';
import {
  ENGINES,
  enginesAt,
  FINS,
  G0,
  MAX_TANKS,
  MAX_UPPER_TANKS,
  MISSIONS,
  rocketProblem,
  rocketStats,
  STAGING_LEVEL,
  TANKS,
  tanksAt,
  UPPER_TWR,
  type Design,
  type EngineId,
  type Mission,
  type TankId,
} from '../../data/space/rockets.js';
import { nearest, random, type Answer, type Outcome, type Progress } from './english.js';
import { fly, MASSES, placementOk, type Body, type Launch } from './gravity.js';

/**
 * The Space Academy games. Like the other games, every run is built from a seed and the answers stay
 * on the server: `spacePublicState` is all the app sees, and `spaceCheck` decides every answer.
 *
 * The ladder has ten levels, like the word games (services/games/english.ts): 1–3 early secondary
 * (planets and basic forces), 4–5 senior secondary exams, 6–7 A-level and first-year university
 * (gravitational fields, orbits, the rocket equation, stellar physics), 8–9 upper university (orbital
 * manoeuvres, astrophysics), 10 olympiad and postgraduate. Higher levels have harder content, more
 * steps, more options to choose from, fewer hints and less time. Progress from the old five-level
 * ladder keeps its level number: levels 1–5 still hold the same content.
 */
export const SPACE_GAMES = ['galaxy-defender', 'rocket-builder', 'gravity-master', 'solar-explorer', 'asteroid-survival'] as const;
export type SpaceGame = (typeof SPACE_GAMES)[number];
export const MAX_LEVEL = 10;
export const OPEN_LEVELS = 4;

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
/** A value from a per-level table (index 0 is level 1). */
const at = <T>(table: readonly T[], level: number) => table[lvl(level) - 1]!;
/** Wrong options shown: three up to level 7, four from level 8 (five options in all). */
const wrongShown = (level: number) => (lvl(level) >= 8 ? 4 : 3);

type Choice = { q: string; answer: string; wrong: readonly string[] };
const asked = (r: Rand, x: Choice, level: number) => ({ q: x.q, answer: x.answer, options: shuffle(r, [x.answer, ...x.wrong.slice(0, wrongShown(level))]) });

// ─── Building runs ────────────────────────────────────────────────────────────

/** Galaxy Defender: questions per run and seconds per question. */
const DEFENDER_STEPS = [8, 8, 8, 8, 8, 10, 10, 10, 12, 12];
const DEFENDER_SECONDS = [25, 24, 22, 22, 20, 20, 18, 18, 16, 15];

/** The question pool of a level: the hand-written questions and the checked ones from the ladder file. */
export function defenderPool(level: number): Choice[] {
  const own = (l: number): Choice[] | undefined => {
    const list = [...(QUESTIONS[l] ?? []), ...(MORE_QUESTIONS[l] ?? [])];
    return list.length >= 8 ? list : undefined;
  };
  const pools: Record<number, Choice[]> = {};
  for (let l = 1; l <= MAX_LEVEL; l++) {
    const p = own(l);
    if (p) pools[l] = p;
  }
  return nearest(pools, lvl(level));
}

function buildDefender(level: number, r: Rand) {
  return {
    kind: 'galaxy-defender' as const,
    seconds: at(DEFENDER_SECONDS, level),
    questions: sample(r, defenderPool(level), at(DEFENDER_STEPS, level)).map((x) => asked(r, x, level)),
  };
}

/** Asteroid Survival: problems per run and seconds per problem (harder problems, more of them). */
const SURVIVAL_STEPS = [6, 6, 6, 6, 6, 6, 6, 7, 7, 8];
const SURVIVAL_SECONDS = [40, 40, 45, 45, 50, 75, 90, 100, 110, 120];
/** The formula is shown on levels up to this one. */
const HINT_LEVELS = 4;

function buildSurvival(level: number, r: Rand) {
  const makers = PROBLEMS_BY_LEVEL[lvl(level)]!;
  const steps = at(SURVIVAL_STEPS, level);
  // Every kind of calculation once before any repeats.
  const order = [...shuffle(r, makers), ...shuffle(r, makers)].slice(0, steps);
  return {
    kind: 'asteroid-survival' as const,
    seconds: at(SURVIVAL_SECONDS, level),
    challenges: order.map((make) => {
      const p: Problem = make(r);
      return {
        ...asked(r, p, level),
        ...(p.given && { given: p.given }),
        ...(p.hint && lvl(level) <= HINT_LEVELS && { hint: p.hint }),
      };
    }),
  };
}

function buildRocket(level: number, r: Rand) {
  return { kind: 'rocket-builder' as const, seed: Math.floor(r() * 1e9), missions: shuffle(r, MISSIONS[lvl(level)]!) };
}

/**
 * Gravity Master by level: planets already on the board, planets you place, how much of the predicted
 * path is drawn while you place them (in simulation steps), and the masses you choose from.
 */
const GRAVITY = {
  fixed: [0, 0, 1, 1, 2, 2, 3, 3, 3, 4],
  move: [1, 1, 1, 2, 2, 2, 2, 3, 3, 3],
  preview: [420, 340, 280, 220, 180, 140, 110, 80, 60, 40],
  puzzles: [3, 3, 3, 3, 3, 3, 4, 4, 4, 4],
};

/** A gravity puzzle made backwards: place planets, fly, and put the goal on the path. */
function gravityPuzzle(level: number, r: Rand) {
  const between = (a: number, b: number) => a + (b - a) * r();
  const fixedCount = at(GRAVITY.fixed, level);
  const moveCount = at(GRAVITY.move, level);
  for (;;) {
    const angle = between(-0.45, 0.45);
    const speed = between(0.32, 0.4);
    const launch: Launch = { x: 0.08, y: between(0.35, 1.15), vx: speed * Math.cos(angle), vy: speed * Math.sin(angle) };
    const fixed: Body[] = Array.from({ length: fixedCount }, () => ({ x: between(0.3, 0.85), y: between(0.15, 1.35), mass: 1 + Math.floor(r() * 3) }));
    const solution: Body[] = Array.from({ length: moveCount }, () => ({
      x: between(0.2, 0.85),
      y: between(0.15, 1.35),
      mass: level === 1 ? 2 : 1 + Math.floor(r() * 3),
    }));
    const all = [...fixed, ...solution];
    const flight = fly(launch, all, null, 1);
    if (flight.end === 'crash') continue;
    const spots = flight.path.filter(
      ([x, y], i) => i > 120 && x > 0.55 && x < 0.95 && y > 0.1 && y < 1.4 && all.every((p) => Math.hypot(p.x - x, p.y - y) > 0.14),
    );
    if (!spots.length) continue;
    const [gx, gy] = spots[Math.floor(r() * spots.length)]!;
    const goal = { x: Math.round(gx * 1000) / 1000, y: Math.round(gy * 1000) / 1000 };
    if (!all.every((p, i) => placementOk(p, all.filter((_, j) => j !== i), launch, goal))) continue;
    if (fly(launch, fixed, goal).end === 'goal') continue; // Too easy: it gets there without your planets.
    if (fly(launch, all, goal).end !== 'goal') continue;
    return {
      launch,
      fixed,
      goal,
      // Level 1: the planet's mass is set; then you choose it.
      movable: solution.map((p) => (level === 1 ? [p.mass] : [...MASSES])),
      solution,
    };
  }
}

function buildGravity(level: number, r: Rand) {
  return {
    kind: 'gravity-master' as const,
    preview: at(GRAVITY.preview, level),
    puzzles: Array.from({ length: at(GRAVITY.puzzles, level) }, () => gravityPuzzle(lvl(level), r)),
  };
}

/** Solar System Explorer: places per trip (two questions at each). */
const EXPLORER_VISITS = [3, 3, 3, 3, 3, 4, 4, 4, 4, 4];

/** Questions about a place at a level: from level 6 the checked ladder questions of that level (or the nearest below). */
export function placeQuestions(d: Destination, level: number): Choice[] {
  const L = lvl(level);
  if (L >= 6)
    for (let l = L; l >= 6; l--) {
      const list = PLACE_QUESTIONS.filter((x) => x.place === d.id && x.level === l);
      if (list.length >= 2) return list;
    }
  return d.questions;
}

function buildExplorer(level: number, r: Rand) {
  const L = lvl(level);
  const pool = DESTINATIONS.filter((d) => d.level <= L && placeQuestions(d, L).length >= 2);
  // From level 2, one of the places new at this level (or the newest there is) is always on the trip.
  const newest = Math.max(...pool.map((d) => d.level));
  const fresh = pool.filter((d) => d.level === Math.min(L, newest));
  const first = L > 1 && fresh.length ? [fresh[Math.floor(r() * fresh.length)]!] : [];
  const rest = sample(
    r,
    pool.filter((d) => !first.includes(d)),
    at(EXPLORER_VISITS, L) - first.length,
  );
  return {
    kind: 'solar-explorer' as const,
    visits: shuffle(r, [...first, ...rest]).map((d) => ({ id: d.id, questions: sample(r, placeQuestions(d, L), 2).map((x) => asked(r, x, L)) })),
  };
}

export type SpacePuzzle =
  | ReturnType<typeof buildDefender>
  | ReturnType<typeof buildSurvival>
  | ReturnType<typeof buildRocket>
  | ReturnType<typeof buildGravity>
  | ReturnType<typeof buildExplorer>;
export type SpaceState = { puzzle: SpacePuzzle; progress: Progress };

export function buildSpacePuzzle(game: SpaceGame, level: number, seed: string): SpacePuzzle {
  const r = random(`${game}:${level}:${seed}`);
  switch (game) {
    case 'galaxy-defender':
      return buildDefender(level, r);
    case 'asteroid-survival':
      return buildSurvival(level, r);
    case 'rocket-builder':
      return buildRocket(level, r);
    case 'gravity-master':
      return buildGravity(level, r);
    case 'solar-explorer':
      return buildExplorer(level, r);
  }
}

export function spaceStepCount(p: SpacePuzzle) {
  switch (p.kind) {
    case 'galaxy-defender':
      return p.questions.length;
    case 'asteroid-survival':
      return p.challenges.length;
    case 'rocket-builder':
      // Each mission: build and launch, then a question about your rocket.
      return p.missions.length * 2;
    case 'gravity-master':
      return p.puzzles.length;
    case 'solar-explorer':
      return p.visits.reduce((n, v) => n + v.questions.length, 0);
  }
}

// ─── Rocket questions ─────────────────────────────────────────────────────────

/** Kinds of question about your own rocket, by level. */
const ROCKET_KINDS: string[][] = [
  ['weight'],
  ['weight', 'resultant'],
  ['resultant', 'acceleration'],
  ['acceleration', 'twr'],
  ['acceleration', 'twr'],
  ['twr', 'deltaV'],
  ['deltaV', 'burnTime', 'stageDv'],
  ['deltaV', 'burnTime', 'stageDv'],
  ['burnTime', 'stageDv', 'massRatio'],
  ['burnTime', 'stageDv', 'massRatio'],
];

/** A question about the learner's own rocket at lift-off (harder kinds at higher levels). */
export function rocketQuestion(seed: number, step: number, level: number, mission: Mission, design: Design) {
  const r = random(`rocket-q:${seed}:${step}`);
  const L = lvl(level);
  const s = rocketStats(mission, design);
  let kinds = at(ROCKET_KINDS, L);
  if (!design.upper) kinds = kinds.filter((k) => k !== 'stageDv');
  if (!kinds.length) kinds = ['deltaV'];
  const kind = kinds[Math.floor(r() * kinds.length)]!;
  const m = s.mass;
  const W = Math.round(m * G0);
  const T = s.thrust;
  const e = ENGINES[design.engine];
  const fuel = design.tanks.reduce((n, t) => n + TANKS[t].fuel, 0);
  let text: string;
  let right: string;
  let slips: string[];
  const fmt = (x: number, unit: string) => `${L >= 6 ? sig(x) : num(x)} ${unit}`;
  if (kind === 'weight') {
    text = `Your rocket has a mass of ${num(m)} kg at lift-off. What is its weight? (g = 9.8 N/kg)`;
    right = `${num(W)} N`;
    slips = [`${num(m)} N`, `${num(Math.round(m / G0))} N`, `${num(m * 10 * 2)} N`, `${num(W * 2)} N`];
  } else if (kind === 'resultant') {
    text = `Your rocket’s engine gives ${num(T)} N of thrust and the rocket weighs ${num(W)} N. What is the resultant (upward) force?`;
    right = `${num(T - W)} N`;
    slips = [`${num(T + W)} N`, `${num(T)} N`, `${num(W)} N`, `${num((T - W) / 2)} N`];
  } else if (kind === 'acceleration') {
    const a = ((T - W) / m) * 1;
    text = `Thrust ${num(T)} N, weight ${num(W)} N, mass ${num(m)} kg. What is the rocket’s acceleration at lift-off? (a = F ÷ m)`;
    right = `${num(a)} m/s²`;
    slips = [`${num(T / m)} m/s²`, `${num((T + W) / m)} m/s²`, `${num(a * 10)} m/s²`, `${num(a / 2)} m/s²`];
  } else if (kind === 'twr') {
    text = `Thrust ${num(T)} N, lift-off mass ${num(m)} kg (g = 9.8 N/kg). What is the rocket’s thrust-to-weight ratio?`;
    right = sig(T / W);
    slips = [sig(T / m), sig(W / T), sig((T - W) / W), sig(T / (m * 10)) === right ? sig(T / W + 0.5) : sig(T / (m * 10))];
  } else if (kind === 'deltaV') {
    const mf = s.dry;
    const dv = e.isp * G0 * Math.log(m / mf);
    text = `Your ${design.upper ? 'lower stage' : 'rocket'} burns ${sig(fuel)} kg of fuel: from ${sig(m)} kg down to ${sig(mf)} kg. Its engine has Isp = ${e.isp} s. What Δv does that burn give? (g₀ = 9.8 m/s²)`;
    right = fmt(dv, 'm/s');
    slips = [fmt(e.isp * G0 * Math.log10(m / mf), 'm/s'), fmt(e.isp * Math.log(m / mf), 'm/s'), fmt(e.isp * G0 * (m / mf), 'm/s'), fmt(dv * 2, 'm/s')];
  } else if (kind === 'burnTime') {
    const t = (fuel * e.isp * G0) / T;
    text = `Your ${design.upper ? 'lower stage’s' : ''} ${e.name} engine (thrust ${sig(T)} N, Isp ${e.isp} s) burns ${sig(fuel)} kg of fuel. How long does it burn? (mass flow = thrust ÷ (Isp × 9.8))`.replace('  ', ' ');
    right = fmt(t, 's');
    slips = [fmt((fuel * e.isp) / T, 's'), fmt(fuel / T, 's'), fmt(t / 60, 's'), fmt(t * 2, 's')];
  } else if (kind === 'stageDv') {
    const up = design.upper!;
    const ue = ENGINES[up.engine];
    const upFuel = up.tanks.reduce((n, t) => n + TANKS[t].fuel, 0);
    const full = s.stages[1]!.mass!;
    const dv = ue.isp * G0 * Math.log(full / (full - upFuel));
    text = `After separation your upper stage weighs ${sig(full)} kg with ${sig(upFuel)} kg of fuel, on a ${ue.name} engine (Isp ${ue.isp} s). What Δv does the upper stage add?`;
    right = fmt(dv, 'm/s');
    slips = [fmt(ue.isp * G0 * Math.log(full / upFuel), 'm/s'), fmt(ue.isp * G0 * Math.log10(full / (full - upFuel)), 'm/s'), fmt(ue.isp * Math.log(full / (full - upFuel)), 'm/s'), fmt(s.dv, 'm/s')];
  } else {
    // massRatio: what full ÷ empty mass a stage with this engine needs for the mission's Δv on its own.
    const R = Math.exp(mission.dv / (e.isp * G0));
    text = `With Isp ${e.isp} s, what full-to-empty mass ratio would one stage need to give the whole ${num(mission.dv)} m/s on its own? (Δv = Isp × 9.8 × ln R)`;
    right = sig(R);
    slips = [sig(mission.dv / (e.isp * G0)), sig(10 ** (mission.dv / (e.isp * G0))), sig(Math.exp(mission.dv / e.isp)), sig(Math.exp(mission.dv / (2 * e.isp * G0)))];
  }
  const wrong = [...new Set(slips.filter((x) => x !== right))];
  const unit = right.includes(' ') ? ` ${right.split(' ').at(-1)}` : '';
  const base = Number(right.split(' ')[0]!.replace(/\s|×.*$/g, '').replace('−', '-'));
  for (let k = 2; wrong.length < 4; k++) {
    const extra = `${L >= 6 ? sig(base * k) : num(base * k)}${unit}`;
    if (extra !== right && !wrong.includes(extra)) wrong.push(extra);
  }
  return { q: text, answer: right, options: shuffle(r, [right, ...wrong.slice(0, wrongShown(L))]) };
}

// ─── What the app sees ────────────────────────────────────────────────────────

const destination = (id: string) => DESTINATIONS.find((d) => d.id === id)!;
const withoutAnswer = ({ q, options }: { q: string; options: string[] }) => ({ q, options });

export function spacePublicState({ puzzle: p, progress }: SpaceState, level: number) {
  const results = progress.results;
  switch (p.kind) {
    case 'galaxy-defender':
      return {
        seconds: p.seconds,
        questions: p.questions.map((x, i) => ({ id: i, ...withoutAnswer(x), ...(results[i] && { result: { ...results[i], answer: x.answer } }) })),
      };
    case 'asteroid-survival':
      return {
        seconds: p.seconds,
        challenges: p.challenges.map((x, i) => {
          const extra = x as { given?: string[]; hint?: string };
          return {
            id: i,
            ...withoutAnswer(x),
            ...(extra.given && { given: extra.given }),
            ...(extra.hint && { hint: extra.hint }),
            ...(results[i] && { result: { ...results[i], answer: x.answer } }),
          };
        }),
      };
    case 'rocket-builder': {
      const engines = enginesAt(level);
      const tanks = tanksAt(level);
      return {
        parts: {
          engines: Object.fromEntries(engines.map((e) => [e, ENGINES[e]])),
          tanks: Object.fromEntries(tanks.map((t) => [t, TANKS[t]])),
          fins: FINS,
          maxTanks: MAX_TANKS,
          maxUpperTanks: MAX_UPPER_TANKS,
          g: G0,
          staging: lvl(level) >= STAGING_LEVEL,
          upperTwr: UPPER_TWR,
        },
        missions: p.missions.map((m, k) => {
          const design = progress.designs?.[2 * k] as Design | undefined;
          const question = design && rocketQuestion(p.seed, 2 * k + 1, level, m, design);
          const qResult = results[2 * k + 1];
          return {
            id: k,
            title: m.title,
            target: m.target,
            payload: m.payload,
            dv: m.dv,
            budget: m.budget,
            twr: m.twr ?? 1,
            tries: progress.tries?.[2 * k] ?? 0,
            ...(design && { design, stats: rocketStats(m, design) }),
            ...(question && { question: withoutAnswer(question) }),
            ...(qResult && { result: { ...qResult, answer: question?.answer } }),
          };
        }),
      };
    }
    case 'gravity-master':
      return {
        preview: p.preview,
        puzzles: p.puzzles.map((x, i) => ({
          id: i,
          launch: x.launch,
          fixed: x.fixed,
          goal: x.goal,
          movable: x.movable,
          tries: progress.tries?.[i] ?? 0,
          ...(results[i] && { result: { ...results[i], solution: x.solution } }),
        })),
      };
    case 'solar-explorer': {
      let k = 0;
      return {
        visits: p.visits.map((v) => {
          const d = destination(v.id);
          return {
            id: d.id,
            name: d.name,
            planet: d.planet,
            mission: d.mission,
            facts: d.facts,
            data: d.data,
            questions: v.questions.map((x) => {
              const i = k++;
              return { id: i, ...withoutAnswer(x), ...(results[i] && { result: { ...results[i], answer: x.answer } }) };
            }),
          };
        }),
      };
    }
  }
}

// ─── Checking ─────────────────────────────────────────────────────────────────

type StageAnswer = { engine: string; tanks: string[] };
export type SpaceAnswer = Answer & { engine?: string; tanks?: string[]; upper?: StageAnswer; placements?: Body[]; hits?: number };

/** Which question of an Explorer run a step is. */
function explorerQuestion(p: Extract<SpacePuzzle, { kind: 'solar-explorer' }>, at: number) {
  let k = 0;
  for (const v of p.visits)
    for (const x of v.questions) {
      if (k === at) return x;
      k++;
    }
  return null;
}

const choiceOutcome = (correct: boolean, points: number, answer: string): Outcome => ({
  correct,
  points: correct ? points : 0,
  heartLost: !correct,
  advance: true,
  reveal: { answer },
});
/** Right answers in a row add 20 points each (up to five in a row). */
const comboOutcome = (correct: boolean, streak: number, answer: string): Outcome => {
  const combo = correct ? Math.min(streak + 1, 5) : 0;
  return { ...choiceOutcome(correct, 100 + 20 * (combo - 1), answer), reveal: { answer, combo } };
};

/** A stage made of parts this level has, within the tank limit. */
function stageOk(s: StageAnswer | undefined, level: number, maxTanks: number): s is { engine: EngineId; tanks: TankId[] } {
  if (!s) return false;
  const engines = enginesAt(level) as string[];
  const tanks = tanksAt(level) as string[];
  return engines.includes(s.engine) && s.tanks.length <= maxTanks && s.tanks.every((t) => tanks.includes(t));
}

export function spaceCheck({ puzzle: p, progress }: SpaceState, a: SpaceAnswer, level: number): Outcome & { store?: Record<string, unknown> } {
  const at = progress.at;
  switch (p.kind) {
    case 'galaxy-defender': {
      const x = p.questions[at]!;
      return comboOutcome(!a.timeout && a.choice === x.answer, progress.streak, x.answer);
    }
    case 'asteroid-survival': {
      const x = p.challenges[at]!;
      return comboOutcome(!a.timeout && a.choice === x.answer, progress.streak, x.answer);
    }
    case 'rocket-builder': {
      const mission = p.missions[Math.floor(at / 2)]!;
      if (at % 2 === 1) {
        const design = progress.designs?.[at - 1] as Design;
        const x = rocketQuestion(p.seed, at, level, mission, design);
        return choiceOutcome(!a.timeout && a.choice === x.answer, 100, x.answer);
      }
      const tries = progress.tries?.[at] ?? 0;
      if (a.timeout) return { correct: false, points: 0, heartLost: false, advance: true, reveal: {} };
      const lower = { engine: a.engine ?? '', tanks: a.tanks ?? [] };
      const staged = !!a.upper;
      if (!stageOk(lower, level, MAX_TANKS) || (staged && (lvl(level) < STAGING_LEVEL || !stageOk(a.upper, level, MAX_UPPER_TANKS))))
        return { correct: false, points: 0, heartLost: false, retry: true, advance: false, reveal: { problem: 'invalid' } };
      const design: Design = { engine: lower.engine as EngineId, tanks: lower.tanks as TankId[], ...(staged && { upper: a.upper as Design['upper'] }) };
      const problem = rocketProblem(mission, design);
      const stats = rocketStats(mission, design);
      if (problem) return { correct: false, points: 0, heartLost: true, retry: true, advance: false, reveal: { problem, stats }, store: { tries: tries + 1 } };
      return { correct: true, points: Math.max(50, 100 - 15 * tries), heartLost: false, advance: true, reveal: { stats }, store: { designs: design } };
    }
    case 'gravity-master': {
      const x = p.puzzles[at]!;
      const tries = progress.tries?.[at] ?? 0;
      // Giving up (after a few tries) moves on with nothing.
      if (a.timeout) return { correct: false, points: 0, heartLost: false, advance: true, reveal: { solution: x.solution } };
      const placed = a.placements ?? [];
      const valid =
        placed.length === x.movable.length &&
        placed.every(
          (b, i) =>
            Number.isFinite(b.x) &&
            Number.isFinite(b.y) &&
            x.movable[i]!.includes(b.mass as 1 | 2 | 3) &&
            placementOk(b, [...x.fixed, ...placed.filter((_, j) => j !== i)], x.launch, x.goal),
        );
      if (!valid) return { correct: false, points: 0, heartLost: false, retry: true, advance: false, reveal: { end: 'invalid' } };
      const flight = fly(x.launch, [...x.fixed, ...placed], x.goal, 1);
      if (flight.end !== 'goal')
        return { correct: false, points: 0, heartLost: false, retry: true, advance: false, reveal: { end: flight.end }, store: { tries: tries + 1 } };
      return { correct: true, points: Math.max(40, 100 - 20 * tries), heartLost: false, advance: true, reveal: { end: 'goal' } };
    }
    case 'solar-explorer': {
      const x = explorerQuestion(p, at)!;
      return choiceOutcome(!a.timeout && a.choice === x.answer, 100, x.answer);
    }
  }
}

export function spaceIsOver({ puzzle: p, progress }: SpaceState, hearts: number) {
  if (p.kind !== 'gravity-master' && hearts <= 0) return true;
  return progress.at >= spaceStepCount(p);
}

export function spaceStars({ puzzle: p, progress }: SpaceState) {
  const results = Object.values(progress.results);
  const right = results.filter((x) => x.correct).length;
  const total = spaceStepCount(p);
  const share = right / total;
  if (p.kind === 'gravity-master') {
    const points = results.reduce((s, x) => s + x.points, 0);
    return right === total && points >= total * 80 ? 3 : right >= total - 1 ? 2 : right >= 1 ? 1 : 0;
  }
  return share >= 0.85 ? 3 : share >= 0.6 ? 2 : share >= 0.3 ? 1 : 0;
}

/** What Kora needs to help on the current step (Kora is told to guide, not to give the answer away). */
export function spaceHelpContext({ puzzle: p, progress }: SpaceState, level: number) {
  const at = Math.min(progress.at, spaceStepCount(p) - 1);
  switch (p.kind) {
    case 'galaxy-defender': {
      const x = p.questions[at]!;
      return `Science question (level ${level} of 10): ${x.q} Options: ${x.options.join('; ')}. Correct answer: ${x.answer}.`;
    }
    case 'asteroid-survival': {
      const x = p.challenges[at]! as (typeof p.challenges)[number] & { given?: string[] };
      return `Physics calculation (level ${level} of 10): ${x.q} ${x.given ? `Data: ${x.given.join('; ')}.` : ''} Options: ${x.options.join('; ')}. Correct answer: ${x.answer}. Explain which formula to use and how to set it up; don't do the arithmetic for them.`;
    }
    case 'rocket-builder': {
      const m = p.missions[Math.floor(at / 2)]!;
      if (at % 2 === 1) {
        const x = rocketQuestion(p.seed, at, level, m, progress.designs?.[at - 1] as Design);
        return `Question about the student's rocket: ${x.q} Options: ${x.options.join('; ')}. Correct answer: ${x.answer}.`;
      }
      const parts = enginesAt(level)
        .map((id) => ENGINES[id])
        .map((e) => `${e.name} engine: ${e.mass} kg, thrust ${e.thrust} N, Isp ${e.isp} s, cost ${e.cost}${e.vacuum ? ' (vacuum engine: upper stage only)' : ''}`)
        .concat(tanksAt(level).map((id) => TANKS[id]).map((t) => `${t.name}: empty ${t.dry} kg, fuel ${t.fuel} kg, cost ${t.cost}`));
      const staging =
        lvl(level) >= STAGING_LEVEL
          ? ` A second (upper) stage is allowed: up to ${MAX_UPPER_TANKS} tanks and its own engine, which must push at least ${UPPER_TWR} × its own weight; the lower stage lifts the full upper stage and is dropped when empty, and the stages' Δv add up.`
          : '';
      return `Build a rocket for "${m.title}" carrying ${m.payload.name} (${m.payload.mass} kg) plus fins (${FINS.mass} kg, cost ${FINS.cost}). Choose one engine and up to ${MAX_TANKS} tanks. It must lift off with thrust-to-weight ratio at least ${m.twr ?? 1} (weight = total mass × 9.8), reach Δv ${m.dv} m/s (Δv = Isp × 9.8 × ln(full mass ÷ empty mass)), and cost at most ${m.budget}.${staging} Parts: ${parts.join('; ')}. The Ion drive is too weak to lift off from Earth. Do not list a full working design; explain the trade-off (more fuel gives more Δv but more weight; staging drops dead weight).`;
    }
    case 'gravity-master': {
      const x = p.puzzles[at]!;
      return `Gravity puzzle on a board 1 wide and 1.5 tall (y grows downwards). A comet starts at (${x.launch.x.toFixed(2)}, ${x.launch.y.toFixed(2)}) moving ${x.launch.vy < 0 ? 'up and ' : x.launch.vy > 0.05 ? 'down and ' : ''}right. The goal is at (${x.goal.x.toFixed(2)}, ${x.goal.y.toFixed(2)}). ${x.fixed.length ? `Planets already there: ${x.fixed.map((b) => `(${b.x.toFixed(2)}, ${b.y.toFixed(2)}) mass ${b.mass}`).join(', ')}. ` : ''}The student places ${x.movable.length} planet(s); a planet pulls the comet towards it (inverse-square law), more strongly when it is heavier or closer. One working placement: ${x.solution.map((b) => `(${b.x.toFixed(2)}, ${b.y.toFixed(2)}) mass ${b.mass}`).join(' and ')}. Give a hint about which side of the path to put a planet and why, not exact numbers.`;
    }
    case 'solar-explorer': {
      const x = explorerQuestion(p, at)!;
      return `Question about the Solar System (level ${level} of 10): ${x.q} Options: ${x.options.join('; ')}. Correct answer: ${x.answer}.`;
    }
  }
}
