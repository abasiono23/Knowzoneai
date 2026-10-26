import { EQUATIONS, COMPLETIONS, type Equation } from '../../data/chemistry/equations.js';
import { ELEMENTS, MISSIONS, type CardField, type Element } from '../../data/chemistry/elements.js';
import { EXPERIMENTS, REAGENTS } from '../../data/chemistry/experiments.js';
import { MOLECULES, VALENCY } from '../../data/chemistry/molecules.js';
import { SUBSTANCES, TESTS_BY_LEVEL, type TestId } from '../../data/chemistry/substances.js';
import { random, type Answer, type Outcome, type Progress } from './english.js';

/**
 * The chemistry lab games. Like the English games, every run is built from a seed and the answers
 * stay on the server: `publicState` is all the app sees, and `check` decides every answer.
 */
export const CHEMISTRY_GAMES = ['mixture-lab', 'element-quest', 'molecule-builder', 'reaction-rush', 'mystery-substance'] as const;
export type ChemistryGame = (typeof CHEMISTRY_GAMES)[number];

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
const sameSet = (a: string[], b: string[]) => a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|');

// ─── Formulas ─────────────────────────────────────────────────────────────────

/** Atoms in a formula: "Ca(OH)2" → { Ca: 1, O: 2, H: 2 }. Handles nested brackets. */
export function atomsOf(formula: string): Record<string, number> {
  let i = 0;
  const group = (): Record<string, number> => {
    const out: Record<string, number> = {};
    const add = (part: Record<string, number>, times: number) => {
      for (const [el, n] of Object.entries(part)) out[el] = (out[el] ?? 0) + n * times;
    };
    while (i < formula.length && formula[i] !== ')') {
      if (formula[i] === '(') {
        i++;
        const inner = group();
        i++; // ')'
        add(inner, number());
      } else {
        const m = /^[A-Z][a-z]?/.exec(formula.slice(i));
        if (!m) throw new Error(`Bad formula ${formula}`);
        i += m[0].length;
        add({ [m[0]]: 1 }, number());
      }
    }
    return out;
  };
  const number = () => {
    const m = /^\d+/.exec(formula.slice(i));
    if (!m) return 1;
    i += m[0].length;
    return Number(m[0]);
  };
  return group();
}

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

/** Balanced with the smallest whole numbers (no zeros, no common factor). */
export function isBalanced(e: Pick<Equation, 'reactants' | 'products'>, coefficients: number[]) {
  const species = [...e.reactants, ...e.products];
  if (coefficients.length !== species.length || coefficients.some((c) => !Number.isInteger(c) || c < 1 || c > 30)) return false;
  if (coefficients.reduce(gcd) !== 1) return false;
  const side = (list: string[], offset: number) => {
    const total: Record<string, number> = {};
    list.forEach((f, k) => {
      for (const [el, n] of Object.entries(atomsOf(f))) total[el] = (total[el] ?? 0) + n * coefficients[offset + k]!;
    });
    return total;
  };
  const left = side(e.reactants, 0);
  const right = side(e.products, e.reactants.length);
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  return [...keys].every((k) => left[k] === right[k]);
}

// ─── Molecules ────────────────────────────────────────────────────────────────

export type BuiltMolecule = { atoms: string[]; bonds: [number, number, number][] };

/** Why a built molecule is wrong, or null when it's right. */
export function moleculeProblem(target: Record<string, number>, m: BuiltMolecule): 'count' | 'valency' | 'disconnected' | null {
  const counts: Record<string, number> = {};
  for (const a of m.atoms) counts[a] = (counts[a] ?? 0) + 1;
  if (!sameSet(Object.keys(counts), Object.keys(target)) || Object.entries(target).some(([el, n]) => counts[el] !== n)) return 'count';
  const used = m.atoms.map(() => 0);
  const seen = new Set<string>();
  for (const [a, b, order] of m.bonds) {
    if (a === b || a < 0 || b < 0 || a >= m.atoms.length || b >= m.atoms.length || order < 1 || order > 3) return 'valency';
    const key = [Math.min(a, b), Math.max(a, b)].join('-');
    if (seen.has(key)) return 'valency';
    seen.add(key);
    used[a]! += order;
    used[b]! += order;
  }
  if (m.atoms.some((el, k) => used[k] !== VALENCY[el])) return 'valency';
  // Everything joined into one molecule.
  const parent = m.atoms.map((_, k) => k);
  const find = (k: number): number => (parent[k] === k ? k : (parent[k] = find(parent[k]!)));
  for (const [a, b] of m.bonds) parent[find(a)] = find(b);
  return new Set(m.atoms.map((_, k) => find(k))).size === 1 ? null : 'disconnected';
}

// ─── Building runs ────────────────────────────────────────────────────────────

const lvl = (level: number) => Math.min(5, Math.max(1, level));
const reagent = (id: string) => REAGENTS.find((x) => x.id === id)!;

function buildMixture(level: number, r: Rand) {
  const experiments = sample(r, EXPERIMENTS[lvl(level)]!, 3).map((e) => ({ ...e, options: shuffle(r, [e.answer, ...e.wrong]) }));
  const needed = [...new Set(experiments.flatMap((e) => e.reagents))];
  const others = sample(
    r,
    REAGENTS.filter((x) => !needed.includes(x.id)),
    Math.max(0, 12 - needed.length),
  ).map((x) => x.id);
  return { kind: 'mixture-lab' as const, experiments, shelf: shuffle(r, [...needed, ...others]) };
}

/** Card details shown for an element (fewer at harder levels). */
function card(e: Element, show: CardField[]) {
  return {
    symbol: e.symbol,
    name: e.name,
    ...Object.fromEntries(show.filter((f) => f !== 'shells' || e.shells).map((f) => [f, f === 'shells' ? e.shells : e[f]])),
  };
}

function buildElementQuest(level: number, r: Rand) {
  const missions = sample(r, MISSIONS[lvl(level)]!, 3).map((m) => {
    const pool = ELEMENTS.filter((e) => !m.pool || m.pool(e));
    const targets = sample(r, pool.filter(m.test), Math.min(4, Math.max(2, Math.floor(r() * 3) + 2)));
    const distractors = sample(
      r,
      pool.filter((e) => !m.test(e)),
      9 - targets.length,
    );
    return {
      id: m.id,
      text: m.text,
      show: m.show,
      cabinet: shuffle(r, [...targets, ...distractors]).map((e) => e.symbol),
      targets: targets.map((e) => e.symbol),
    };
  });
  return { kind: 'element-quest' as const, missions };
}

function buildMolecules(level: number, r: Rand) {
  const molecules = sample(r, MOLECULES[lvl(level)]!, 4).map((mol) => {
    // The tray holds the atoms you need plus one or two you don't.
    const extra = shuffle(
      r,
      Object.keys(VALENCY).filter((el) => !(el in mol.atoms)),
    ).slice(0, level >= 3 ? 2 : 1);
    return { ...mol, palette: [...Object.keys(mol.atoms), ...extra] };
  });
  return { kind: 'molecule-builder' as const, molecules };
}

const RUSH_SECONDS = [100, 95, 90, 90, 90];
function buildRush(level: number, r: Rand) {
  const balance = sample(r, EQUATIONS[lvl(level)]!, 6).map((e) => ({ type: 'balance' as const, ...e }));
  const complete = sample(r, COMPLETIONS[lvl(level)]!, 3).map((c) => ({ type: 'complete' as const, ...c, options: shuffle(r, [c.answer, ...c.wrong]) }));
  // Mostly balancing, with completions mixed in.
  const tasks = shuffle(r, [...balance, ...complete]);
  return { kind: 'reaction-rush' as const, seconds: RUSH_SECONDS[lvl(level) - 1]!, tasks };
}

function buildMystery(level: number, r: Rand) {
  const tests = TESTS_BY_LEVEL[lvl(level)]!;
  const pool = SUBSTANCES.filter((s) => s.level <= lvl(level));
  const signature = (id: string) => {
    const s = SUBSTANCES.find((x) => x.id === id)!;
    return [s.appearance, ...tests.map((t) => s.results[t])].join('|');
  };
  const cases = sample(r, pool, 3).map((unknown) => {
    // Suspects the available tests can tell apart from the unknown.
    const others = sample(
      r,
      pool.filter((s) => s.id !== unknown.id && signature(s.id) !== signature(unknown.id)),
      3,
    );
    return { unknown: unknown.id, suspects: shuffle(r, [unknown.id, ...others.map((s) => s.id)]) };
  });
  return { kind: 'mystery-substance' as const, tests, cases };
}

export type ChemPuzzle =
  | ReturnType<typeof buildMixture>
  | ReturnType<typeof buildElementQuest>
  | ReturnType<typeof buildMolecules>
  | ReturnType<typeof buildRush>
  | ReturnType<typeof buildMystery>;
export type ChemState = { puzzle: ChemPuzzle; progress: Progress };

export function buildChemPuzzle(game: ChemistryGame, level: number, seed: string): ChemPuzzle {
  const r = random(`${game}:${level}:${seed}`);
  switch (game) {
    case 'mixture-lab':
      return buildMixture(level, r);
    case 'element-quest':
      return buildElementQuest(level, r);
    case 'molecule-builder':
      return buildMolecules(level, r);
    case 'reaction-rush':
      return buildRush(level, r);
    case 'mystery-substance':
      return buildMystery(level, r);
  }
}

export function chemStepCount(p: ChemPuzzle) {
  switch (p.kind) {
    case 'mixture-lab':
      return p.experiments.length;
    case 'element-quest':
      return p.missions.length;
    case 'molecule-builder':
      return p.molecules.length;
    case 'reaction-rush':
      return p.tasks.length;
    case 'mystery-substance':
      return p.cases.length;
  }
}

// ─── What the app sees ────────────────────────────────────────────────────────

export function chemPublicState({ puzzle: p, progress }: ChemState) {
  const results = progress.results;
  switch (p.kind) {
    case 'mixture-lab':
      return {
        shelf: p.shelf.map(reagent),
        experiments: p.experiments.map((e, i) => ({
          id: i,
          title: e.title,
          glassware: e.glassware,
          needs: e.reagents,
          observation: e.observation,
          question: e.question,
          options: e.options,
          ...(results[i] && { result: { ...results[i], answer: e.answer, equation: e.equation } }),
        })),
      };
    case 'element-quest':
      return {
        missions: p.missions.map((m, i) => ({
          id: i,
          text: m.text,
          show: m.show,
          cabinet: m.cabinet.map((sym) =>
            card(
              ELEMENTS.find((e) => e.symbol === sym)!,
              m.show,
            ),
          ),
          ...(results[i] && { result: { ...results[i], answer: m.targets } }),
        })),
      };
    case 'molecule-builder':
      return {
        valency: VALENCY,
        molecules: p.molecules.map((m, i) => ({
          id: i,
          name: m.name,
          formula: m.formula,
          atoms: m.atoms,
          palette: m.palette,
          ...(results[i] && { result: results[i] }),
        })),
      };
    case 'reaction-rush':
      return {
        seconds: p.seconds,
        tasks: p.tasks.map((t, i) => ({
          id: i,
          ...(t.type === 'balance'
            ? { type: t.type, reactants: t.reactants, products: t.products }
            : { type: t.type, reactants: t.reactants, options: t.options }),
          ...(results[i] && { result: { ...results[i], answer: t.type === 'balance' ? t.coefficients : t.answer } }),
        })),
      };
    case 'mystery-substance':
      return {
        tests: p.tests,
        cases: p.cases.map((c, i) => {
          const unknown = SUBSTANCES.find((s) => s.id === c.unknown)!;
          const ran = (progress.tests?.[i] ?? []) as TestId[];
          return {
            id: i,
            appearance: unknown.appearance,
            suspects: c.suspects.map((id) => SUBSTANCES.find((s) => s.id === id)!.name),
            results: Object.fromEntries(ran.map((t) => [t, unknown.results[t]])),
            ...(results[i] && { result: { ...results[i], answer: unknown.name } }),
          };
        }),
      };
  }
}

// ─── Checking ─────────────────────────────────────────────────────────────────

export function chemCheck({ puzzle: p, progress }: ChemState, a: Answer): Outcome {
  const at = progress.at;
  switch (p.kind) {
    case 'mixture-lab': {
      const e = p.experiments[at]!;
      const correct = !a.timeout && sameSet(a.reagents ?? [], e.reagents) && a.choice === e.answer;
      return { correct, points: correct ? 100 : 0, heartLost: !correct, advance: true, reveal: { answer: e.answer, equation: e.equation } };
    }
    case 'element-quest': {
      const m = p.missions[at]!;
      const correct = !a.timeout && sameSet(a.symbols ?? [], m.targets);
      return { correct, points: correct ? 100 : 0, heartLost: !correct, advance: true, reveal: { answer: m.targets } };
    }
    case 'molecule-builder': {
      const m = p.molecules[at]!;
      if (a.timeout) return { correct: false, points: 0, heartLost: false, advance: true, reveal: {} };
      const problem = moleculeProblem(m.atoms, { atoms: a.atoms ?? [], bonds: a.bonds ?? [] });
      if (problem) return { correct: false, points: 0, heartLost: true, retry: true, advance: false, reveal: { problem } };
      return { correct: true, points: 100, heartLost: false, advance: true, reveal: {} };
    }
    case 'reaction-rush': {
      const t = p.tasks[at]!;
      const correct = !a.timeout && (t.type === 'balance' ? isBalanced(t, a.coefficients ?? []) : a.choice === t.answer);
      const combo = correct ? Math.min(progress.streak + 1, 5) : 0;
      return {
        correct,
        points: correct ? 100 + 25 * (combo - 1) : 0,
        heartLost: false,
        advance: true,
        reveal: { answer: t.type === 'balance' ? t.coefficients : t.answer, combo },
      };
    }
    case 'mystery-substance': {
      const c = p.cases[at]!;
      const unknown = SUBSTANCES.find((s) => s.id === c.unknown)!;
      if (a.test) {
        // Running a test: shows its result and moves nothing on.
        if (!p.tests.includes(a.test as TestId)) return { correct: false, points: 0, heartLost: false, advance: false, reveal: {} };
        return { correct: false, points: 0, heartLost: false, advance: false, reveal: { test: a.test, result: unknown.results[a.test as TestId] } };
      }
      const correct = !a.timeout && a.choice === unknown.name;
      // Fewer tests, more points.
      const ran = progress.tests?.[at]?.length ?? 0;
      const points = correct ? 100 + Math.max(0, p.tests.length - ran) * 20 : 0;
      return { correct, points, heartLost: !correct, advance: true, reveal: { answer: unknown.name } };
    }
  }
}

export function chemIsOver({ puzzle: p, progress }: ChemState, hearts: number) {
  if (p.kind !== 'reaction-rush' && hearts <= 0) return true;
  return progress.at >= chemStepCount(p);
}

export function chemStars({ puzzle: p, progress }: ChemState, hearts: number) {
  const right = Object.values(progress.results).filter((x) => x.correct).length;
  switch (p.kind) {
    case 'reaction-rush': {
      const share = right / p.tasks.length;
      return share >= 0.85 ? 3 : share >= 0.55 ? 2 : share >= 0.3 ? 1 : 0;
    }
    case 'molecule-builder':
      return right >= 4 ? (hearts >= 2 ? 3 : 2) : right >= 3 ? 2 : right >= 2 ? 1 : 0;
    default:
      return right >= 3 ? 3 : right >= 2 ? 2 : right >= 1 ? 1 : 0;
  }
}

/**
 * What Kora needs to help on the current step: the task and its answer (Kora is told to guide
 * towards it, not to give it away).
 */
export function chemHelpContext({ puzzle: p, progress }: ChemState) {
  const at = Math.min(progress.at, chemStepCount(p) - 1);
  switch (p.kind) {
    case 'mixture-lab': {
      const e = p.experiments[at]!;
      return `Experiment: ${e.title}. Mix ${reagent(e.reagents[0]).name} with ${reagent(e.reagents[1]).name} in a ${e.glassware}. Observation: ${e.observation.text}. Question: ${e.question} Options: ${e.options.join('; ')}. Correct answer: ${e.answer}. Equation: ${e.equation}.`;
    }
    case 'element-quest': {
      const m = p.missions[at]!;
      return `Mission: ${m.text}. Elements in the cabinet: ${m.cabinet.join(', ')}. Correct ones: ${m.targets.join(', ')}.`;
    }
    case 'molecule-builder': {
      const m = p.molecules[at]!;
      return `Build ${m.name} (${m.formula}) from atoms with bonds. Usual bonds per atom: ${Object.entries(VALENCY)
        .map(([k, v]) => `${k} ${v}`)
        .join(', ')}.`;
    }
    case 'reaction-rush': {
      const t = p.tasks[at]!;
      return t.type === 'balance'
        ? `Balance: ${t.reactants.join(' + ')} → ${t.products.join(' + ')}. Correct coefficients in order: ${t.coefficients.join(', ')}.`
        : `Complete: ${t.reactants} ?. Options: ${t.options.join('; ')}. Correct: ${t.answer}.`;
    }
    case 'mystery-substance': {
      const c = p.cases[at]!;
      const unknown = SUBSTANCES.find((s) => s.id === c.unknown)!;
      return `Identify an unknown liquid (${unknown.appearance}). Suspects: ${c.suspects.map((id) => SUBSTANCES.find((s) => s.id === id)!.name).join('; ')}. Tests available: ${p.tests.join(', ')}. Results already seen: ${JSON.stringify(progress.tests?.[at] ?? [])}. It is ${unknown.name}; its results: ${JSON.stringify(unknown.results)}.`;
    }
  }
}
