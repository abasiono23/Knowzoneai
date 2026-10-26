import { DESTINATIONS } from '../../data/space/planets.js';
import { num, PROBLEMS_BY_LEVEL } from '../../data/space/problems.js';
import { QUESTIONS, type Question } from '../../data/space/questions.js';
import {
  ENGINES,
  FINS,
  G0,
  MAX_TANKS,
  MISSIONS,
  rocketProblem,
  rocketStats,
  TANKS,
  type Design,
  type EngineId,
  type TankId,
} from '../../data/space/rockets.js';
import { random, type Answer, type Outcome, type Progress } from './english.js';
import { fly, MASSES, placementOk, type Body, type Launch } from './gravity.js';

/**
 * The Space Academy games. Like the other games, every run is built from a seed and the answers stay
 * on the server: `spacePublicState` is all the app sees, and `spaceCheck` decides every answer.
 * The flying and dodging happen in the app; what earns stars is checked here.
 */
export const SPACE_GAMES = ['galaxy-defender', 'rocket-builder', 'gravity-master', 'solar-explorer', 'asteroid-survival'] as const;
export type SpaceGame = (typeof SPACE_GAMES)[number];

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

// ─── Building runs ────────────────────────────────────────────────────────────

/** Seconds to answer a question while flying. */
const QUESTION_SECONDS = [25, 22, 20, 20, 18];

function buildDefender(level: number, r: Rand) {
  return {
    kind: 'galaxy-defender' as const,
    seconds: QUESTION_SECONDS[lvl(level) - 1]!,
    questions: sample(r, QUESTIONS[lvl(level)]!, 8).map((x) => asked(r, x)),
  };
}

function buildSurvival(level: number, r: Rand) {
  const makers = PROBLEMS_BY_LEVEL[lvl(level)]!;
  // Every kind of calculation once before any repeats.
  const order = [...shuffle(r, makers), ...shuffle(r, makers)].slice(0, 6);
  return {
    kind: 'asteroid-survival' as const,
    seconds: QUESTION_SECONDS[lvl(level) - 1]! + 10,
    challenges: order.map((make) => asked(r, make(r))),
  };
}

function buildRocket(level: number, r: Rand) {
  return { kind: 'rocket-builder' as const, seed: Math.floor(r() * 1e9), missions: shuffle(r, MISSIONS[lvl(level)]!) };
}

/** A gravity puzzle made backwards: place planets, fly, and put the goal on the path. */
function gravityPuzzle(level: number, r: Rand) {
  const between = (a: number, b: number) => a + (b - a) * r();
  const fixedCount = level >= 5 ? 2 : level >= 3 ? 1 : 0;
  const moveCount = level >= 4 ? 2 : 1;
  for (;;) {
    const angle = between(-0.45, 0.45);
    const speed = between(0.32, 0.4);
    const launch: Launch = { x: 0.08, y: between(0.35, 1.15), vx: speed * Math.cos(angle), vy: speed * Math.sin(angle) };
    const fixed: Body[] = Array.from({ length: fixedCount }, () => ({ x: between(0.3, 0.8), y: between(0.2, 1.3), mass: 1 + Math.floor(r() * 3) }));
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
    if (
      !all.every((p, i) =>
        placementOk(
          p,
          all.filter((_, j) => j !== i),
          launch,
          goal,
        ),
      )
    )
      continue;
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

/** How much of the predicted path is drawn while you place planets (in simulation steps). */
const PREVIEW_STEPS = [420, 300, 200, 150, 110];

function buildGravity(level: number, r: Rand) {
  return {
    kind: 'gravity-master' as const,
    preview: PREVIEW_STEPS[lvl(level) - 1]!,
    puzzles: Array.from({ length: 3 }, () => gravityPuzzle(lvl(level), r)),
  };
}

function buildExplorer(level: number, r: Rand) {
  const pool = DESTINATIONS.filter((d) => d.level <= lvl(level));
  // From level 2, one of the places new at this level is always on the trip.
  const fresh = pool.filter((d) => d.level === lvl(level));
  const first = level > 1 && fresh.length ? [fresh[Math.floor(r() * fresh.length)]!] : [];
  const rest = sample(
    r,
    pool.filter((d) => !first.includes(d)),
    3 - first.length,
  );
  return {
    kind: 'solar-explorer' as const,
    visits: shuffle(r, [...first, ...rest]).map((d) => ({ id: d.id, questions: sample(r, d.questions, 2).map((x) => asked(r, x)) })),
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

/** A question about the learner's own rocket at lift-off (harder kinds at higher levels). */
export function rocketQuestion(seed: number, step: number, level: number, mission: (typeof MISSIONS)[number][number], design: Design) {
  const r = random(`rocket-q:${seed}:${step}`);
  const s = rocketStats(mission, design);
  const kinds = level <= 1 ? ['weight'] : level === 2 ? ['weight', 'resultant'] : ['weight', 'resultant', 'acceleration'];
  const kind = kinds[Math.floor(r() * kinds.length)]!;
  const m = s.mass;
  const W = Math.round(m * G0);
  const T = s.thrust;
  let text: string;
  let right: string;
  let slips: string[];
  if (kind === 'weight') {
    text = `Your rocket has a mass of ${num(m)} kg at lift-off. What is its weight? (g = 9.8 N/kg)`;
    right = `${num(W)} N`;
    slips = [`${num(m)} N`, `${num(Math.round(m / G0))} N`, `${num(m * 10 * 2)} N`];
  } else if (kind === 'resultant') {
    text = `Your rocket’s engine gives ${num(T)} N of thrust and the rocket weighs ${num(W)} N. What is the resultant (upward) force?`;
    right = `${num(T - W)} N`;
    slips = [`${num(T + W)} N`, `${num(T)} N`, `${num(W)} N`];
  } else {
    const a = Math.round(((T - W) / m) * 10) / 10;
    text = `Thrust ${num(T)} N, weight ${num(W)} N, mass ${num(m)} kg. What is the rocket’s acceleration at lift-off? (a = F ÷ m)`;
    right = `${num(a)} m/s²`;
    slips = [`${num(Math.round((T / m) * 10) / 10)} m/s²`, `${num(Math.round(((T + W) / m) * 10) / 10)} m/s²`, `${num(Math.round(a * 10 * 10) / 10)} m/s²`];
  }
  const wrong = [...new Set(slips.filter((x) => x !== right))];
  while (wrong.length < 3) wrong.push(`${num(Number(right.split(' ')[0]!.replace(/\s/g, '')) * (wrong.length + 2))} ${right.split(' ').at(-1)}`);
  return { q: text, answer: right, options: shuffle(r, [right, ...wrong.slice(0, 3)]) };
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
        challenges: p.challenges.map((x, i) => ({ id: i, ...withoutAnswer(x), ...(results[i] && { result: { ...results[i], answer: x.answer } }) })),
      };
    case 'rocket-builder':
      return {
        parts: { engines: ENGINES, tanks: TANKS, fins: FINS, maxTanks: MAX_TANKS, g: G0 },
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
            tries: progress.tries?.[2 * k] ?? 0,
            ...(design && { design, stats: rocketStats(m, design) }),
            ...(question && { question: withoutAnswer(question) }),
            ...(qResult && { result: { ...qResult, answer: question?.answer } }),
          };
        }),
      };
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

export type SpaceAnswer = Answer & { engine?: string; tanks?: string[]; placements?: Body[]; hits?: number };

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

export function spaceCheck({ puzzle: p, progress }: SpaceState, a: SpaceAnswer, level: number): Outcome & { store?: Record<string, unknown> } {
  const at = progress.at;
  switch (p.kind) {
    case 'galaxy-defender': {
      const x = p.questions[at]!;
      const correct = !a.timeout && a.choice === x.answer;
      const combo = correct ? Math.min(progress.streak + 1, 5) : 0;
      return { ...choiceOutcome(correct, 100 + 20 * (combo - 1), x.answer), reveal: { answer: x.answer, combo } };
    }
    case 'asteroid-survival': {
      const x = p.challenges[at]!;
      const correct = !a.timeout && a.choice === x.answer;
      // A small bonus for getting through the wave without being hit.
      const hits = Math.min(10, Math.max(0, Math.floor(a.hits ?? 3)));
      return choiceOutcome(correct, 100 + Math.max(0, 3 - hits) * 20, x.answer);
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
      const engine = a.engine as EngineId;
      const tanks = (a.tanks ?? []) as TankId[];
      if (!(engine in ENGINES) || tanks.length > MAX_TANKS || tanks.some((t) => !(t in TANKS)))
        return { correct: false, points: 0, heartLost: false, retry: true, advance: false, reveal: { problem: 'invalid' } };
      const design = { engine, tanks };
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
  const share = right / spaceStepCount(p);
  if (p.kind === 'gravity-master') {
    const points = results.reduce((s, x) => s + x.points, 0);
    return right === 3 && points >= 240 ? 3 : right >= 2 ? 2 : right >= 1 ? 1 : 0;
  }
  return share >= 0.85 ? 3 : share >= 0.6 ? 2 : share >= 0.3 ? 1 : 0;
}

/** What Kora needs to help on the current step (Kora is told to guide, not to give the answer away). */
export function spaceHelpContext({ puzzle: p, progress }: SpaceState, level: number) {
  const at = Math.min(progress.at, spaceStepCount(p) - 1);
  switch (p.kind) {
    case 'galaxy-defender': {
      const x = p.questions[at]!;
      return `Science question: ${x.q} Options: ${x.options.join('; ')}. Correct answer: ${x.answer}.`;
    }
    case 'asteroid-survival': {
      const x = p.challenges[at]!;
      return `Physics calculation (g = 10 N/kg): ${x.q} Options: ${x.options.join('; ')}. Correct answer: ${x.answer}. Explain the formula to use.`;
    }
    case 'rocket-builder': {
      const m = p.missions[Math.floor(at / 2)]!;
      if (at % 2 === 1) {
        const x = rocketQuestion(p.seed, at, level, m, progress.designs?.[at - 1] as Design);
        return `Question about the student's rocket: ${x.q} Options: ${x.options.join('; ')}. Correct answer: ${x.answer}.`;
      }
      const parts = Object.entries(ENGINES)
        .map(([, e]) => `${e.name} engine: ${e.mass} kg, thrust ${e.thrust} N, Isp ${e.isp} s, cost ${e.cost}`)
        .concat(Object.values(TANKS).map((t) => `${t.name}: empty ${t.dry} kg, fuel ${t.fuel} kg, cost ${t.cost}`));
      return `Build a rocket for "${m.title}" carrying ${m.payload.name} (${m.payload.mass} kg) plus fins (${FINS.mass} kg, cost ${FINS.cost}). Choose one engine and up to ${MAX_TANKS} tanks. It must lift off (thrust greater than weight = total mass × 9.8), reach Δv ${m.dv} m/s (Δv = Isp × 9.8 × ln(full mass ÷ empty mass)), and cost at most ${m.budget}. Parts: ${parts.join('; ')}. The Ion drive is too weak to lift off from Earth. Do not list a full working design; explain the trade-off (more fuel gives more Δv but more weight).`;
    }
    case 'gravity-master': {
      const x = p.puzzles[at]!;
      return `Gravity puzzle on a board 1 wide and 1.5 tall (y grows downwards). A comet starts at (${x.launch.x.toFixed(2)}, ${x.launch.y.toFixed(2)}) moving ${x.launch.vy < 0 ? 'up and ' : x.launch.vy > 0.05 ? 'down and ' : ''}right. The goal is at (${x.goal.x.toFixed(2)}, ${x.goal.y.toFixed(2)}). The student places ${x.movable.length} planet(s); a planet pulls the comet towards it, more strongly when it is heavier or closer. One working placement: ${x.solution.map((b) => `(${b.x.toFixed(2)}, ${b.y.toFixed(2)}) mass ${b.mass}`).join(' and ')}. Give a hint about which side of the path to put a planet and why, not exact numbers.`;
    }
    case 'solar-explorer': {
      const x = explorerQuestion(p, at)!;
      return `Question about the Solar System: ${x.q} Options: ${x.options.join('; ')}. Correct answer: ${x.answer}.`;
    }
  }
}
