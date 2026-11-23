import { makeCalc } from '../../data/chemistry/calc.js';
import { COMPLETIONS, EQUATIONS, HARD_EQUATIONS, type Completion, type Equation } from '../../data/chemistry/equations.js';
import { EXPERIMENTS, REAGENTS, type Experiment } from '../../data/chemistry/experiments.js';
import { atomsOf, balance, isBalancedWith } from '../../data/chemistry/formula.js';
import { GEN_COMPLETIONS, GEN_EXPERIMENTS, GEN_REAGENTS, GEN_RESULTS, GEN_SUBSTANCES } from '../../data/chemistry/generated.js';
import { ELEMENT_LEVELS, makeMissions, type InfoField } from '../../data/chemistry/missions.js';
import { MOLECULES, VALENCY } from '../../data/chemistry/molecules.js';
import { configOf, configText, PERIODIC, shellsText } from '../../data/chemistry/periodic.js';
import { countsOf, fromSmiles, hillFormula, sameStructure, structureProblem, type Graph } from '../../data/chemistry/structure.js';
import { SUBSTANCES, TESTS_BY_LEVEL, type Substance, type TestId } from '../../data/chemistry/substances.js';
import { MAX_LEVEL, nearest, OPEN_LEVELS, random, type Answer, type Outcome, type Progress } from './english.js';

export { atomsOf };

/**
 * The chemistry lab games. Like the English games, every run is built from a seed and the answers
 * stay on the server: `publicState` is all the app sees, and `check` decides every answer.
 *
 * The ladder has ten levels, like the word games (1 Starter … 10 Super hard), mapped to curriculum
 * depth: 1–3 early secondary, 4–5 WAEC / GCSE / SAT, 6–7 A-level / AP / first-year university, 8–9
 * upper university, 10 olympiad. Levels 1–4 are open to everyone; later ones open with a star on the
 * level before. The old ladder had five levels of school content (now levels 1–5, made from the same
 * data), so stars won there stay on the same level numbers and open the same next levels.
 */
export const CHEMISTRY_GAMES = ['mixture-lab', 'element-quest', 'molecule-builder', 'reaction-rush', 'mystery-substance'] as const;
export type ChemistryGame = (typeof CHEMISTRY_GAMES)[number];
export const CHEM_MAX_LEVEL = MAX_LEVEL;
export const CHEM_OPEN_LEVELS = OPEN_LEVELS;

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
const lvl = (level: number) => Math.min(MAX_LEVEL, Math.max(1, level));
/** Per-level tables (index 0 = level 1). */
const at = <T>(table: readonly T[], level: number) => table[lvl(level) - 1]!;

// ─── Content by level ─────────────────────────────────────────────────────────

const ALL_REAGENTS = [...REAGENTS, ...GEN_REAGENTS.filter((g) => !REAGENTS.some((r) => r.id === g.id))];
const reagent = (id: string) => ALL_REAGENTS.find((x) => x.id === id)!;
const experimentsAt = (level: number): Experiment[] => nearest({ ...EXPERIMENTS, ...nonEmpty(GEN_EXPERIMENTS) }, lvl(level));
const completionsAt = (level: number): Completion[] => nearest({ ...COMPLETIONS, ...nonEmpty(GEN_COMPLETIONS) }, lvl(level));
function nonEmpty<T>(table: Record<number, T[]>) {
  return Object.fromEntries(Object.entries(table).filter(([, v]) => v.length >= 4)) as Record<number, T[]>;
}

/** Equations to balance: the school ones (1–5) with their numbers, the ionic and redox ones worked out. */
export const BALANCE_SETS: Record<number, Equation[]> = {
  ...EQUATIONS,
  ...Object.fromEntries(
    Object.entries(HARD_EQUATIONS).map(([level, list]) => [
      level,
      list.map(([reactants, products]) => ({ reactants, products, coefficients: balance(reactants, products)! })),
    ]),
  ),
};

/** Every unknown, with the results of the newer tests filled in. */
export const ALL_SUBSTANCES: Substance[] = [
  ...SUBSTANCES.map((s) => ({ ...s, results: { ...GEN_RESULTS[s.id], ...s.results } })),
  ...GEN_SUBSTANCES,
];
const substance = (id: string) => ALL_SUBSTANCES.find((s) => s.id === id)!;

// ─── Molecules ────────────────────────────────────────────────────────────────

export type BuiltMolecule = Graph;
const graphs = new Map<string, Graph>();
const graphOf = (smiles: string) => {
  if (!graphs.has(smiles)) graphs.set(smiles, fromSmiles(smiles));
  return graphs.get(smiles)!;
};

/** Why a built molecule is wrong (or 'isomer': valid, but a different structure), or null when right. */
export function moleculeProblem(smiles: string, m: BuiltMolecule): 'count' | 'valency' | 'disconnected' | 'isomer' | null {
  const target = graphOf(smiles);
  const problem = structureProblem(countsOf(target), m);
  if (problem) return problem;
  return sameStructure(target, m) ? null : 'isomer';
}

// ─── Building runs ────────────────────────────────────────────────────────────

const MIX_OPTIONS = [3, 3, 3, 3, 3, 4, 4, 4, 5, 5];
const MIX_SHELF = [10, 10, 12, 12, 12, 14, 14, 16, 16, 16];
function buildMixture(level: number, r: Rand) {
  const experiments = sample(r, experimentsAt(level), 3).map((e) => ({
    ...e,
    options: shuffle(r, [e.answer, ...sample(r, e.wrong, at(MIX_OPTIONS, level) - 1)]),
  }));
  const needed = [...new Set(experiments.flatMap((e) => e.reagents))];
  const others = sample(
    r,
    ALL_REAGENTS.filter((x) => !needed.includes(x.id)),
    Math.max(0, at(MIX_SHELF, level) - needed.length),
  ).map((x) => x.id);
  return { kind: 'mixture-lab' as const, level: lvl(level), experiments, shelf: shuffle(r, [...needed, ...others]) };
}

const QUEST_MISSIONS = [3, 3, 3, 3, 3, 4, 4, 4, 4, 4];
function buildElementQuest(level: number, r: Rand) {
  return { kind: 'element-quest' as const, level: lvl(level), missions: makeMissions(lvl(level), r, at(QUEST_MISSIONS, level)) };
}

const MOLECULE_COUNT = [4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
function buildMolecules(level: number, r: Rand) {
  const molecules = sample(r, nearest(MOLECULES, lvl(level)), at(MOLECULE_COUNT, level)).map((mol) => {
    const atoms = countsOf(graphOf(mol.smiles));
    // The tray holds the atoms you need plus decoys (more at higher levels).
    const extra = shuffle(
      r,
      Object.keys(VALENCY).filter((el) => !(el in atoms) && el !== 'P' && el !== 'B'),
    ).slice(0, level >= 6 ? 3 : level >= 3 ? 2 : 1);
    return { ...mol, atoms, palette: [...Object.keys(atoms), ...extra] };
  });
  return { kind: 'molecule-builder' as const, level: lvl(level), molecules };
}

/** Reaction Rush per level: how many of each task, and the clock (the relaxed mode has none). */
const RUSH_MIX: [balance: number, complete: number, calc: number][] = [
  [6, 2, 0],
  [6, 2, 0],
  [5, 2, 1],
  [4, 2, 2],
  [4, 2, 2],
  [3, 2, 2],
  [3, 1, 3],
  [2, 2, 3],
  [2, 1, 4],
  [2, 1, 4],
];
export const RUSH_SECONDS = [100, 100, 110, 120, 130, 170, 200, 220, 260, 300];
function buildRush(level: number, r: Rand) {
  const [nb, nc, nk] = at(RUSH_MIX, level);
  const balanceSet = nearest(BALANCE_SETS, lvl(level));
  const balanceTasks = sample(r, balanceSet, nb).map((e) => ({ type: 'balance' as const, reactants: e.reactants, products: e.products, coefficients: e.coefficients }));
  const completeTasks = sample(r, completionsAt(level), nc).map((c) => ({
    type: 'complete' as const,
    reactants: c.reactants,
    answer: c.answer,
    options: shuffle(r, [c.answer, ...sample(r, c.wrong, level >= 6 ? 3 : 2)]),
  }));
  const calcTasks = Array.from({ length: nk }, () => ({ type: 'calc' as const, ...makeCalc(lvl(level), r) }));
  // Balancing first at low levels; mixed in higher up.
  const tasks = level <= 5 ? [...shuffle(r, balanceTasks), ...shuffle(r, [...completeTasks, ...calcTasks])] : shuffle(r, [...balanceTasks, ...completeTasks, ...calcTasks]);
  return { kind: 'reaction-rush' as const, level: lvl(level), seconds: at(RUSH_SECONDS, level), tasks };
}

const MYSTERY_CASES = [3, 3, 3, 3, 3, 4, 4, 4, 4, 4];
const MYSTERY_SUSPECTS = [4, 4, 4, 4, 4, 5, 5, 6, 6, 6];
/** Most tests you may run on one unknown (none = no limit). */
export const MYSTERY_MAX_TESTS = [0, 0, 0, 0, 0, 0, 0, 5, 4, 3];

/** Whether some set of at most `max` tests tells `a` apart from every other suspect. */
function separable(a: Substance, others: Substance[], tests: TestId[], max: number) {
  const differs = (t: TestId, o: Substance) => a.results[t] !== o.results[t];
  if (!max) return others.every((o) => a.appearance !== o.appearance || tests.some((t) => differs(t, o)));
  const combos = (k: number, from = 0): TestId[][] =>
    k === 0 ? [[]] : tests.slice(from).flatMap((t, i) => combos(k - 1, from + i + 1).map((c) => [t, ...c]));
  for (let k = 0; k <= max; k++)
    for (const c of combos(k)) if (others.every((o) => a.appearance !== o.appearance || c.some((t) => differs(t, o)))) return true;
  return false;
}

function buildMystery(level: number, r: Rand) {
  const tests = nearest(TESTS_BY_LEVEL, lvl(level));
  const max = at(MYSTERY_MAX_TESTS, level);
  const pool = ALL_SUBSTANCES.filter((s) => s.level <= lvl(level) && tests.every((t) => s.results[t]));
  // Harder levels prefer the newer, closer-matched unknowns.
  const preferred = level >= 6 ? pool.filter((s) => s.level >= 4) : pool;
  const cases: { unknown: string; suspects: string[] }[] = [];
  for (const unknown of shuffle(r, preferred.length >= 6 ? preferred : pool)) {
    if (cases.length >= at(MYSTERY_CASES, level)) break;
    if (cases.some((c) => c.unknown === unknown.id)) continue;
    const others = sample(
      r,
      pool.filter((s) => s.id !== unknown.id && (s.appearance !== unknown.appearance || tests.some((t) => s.results[t] !== unknown.results[t]))),
      at(MYSTERY_SUSPECTS, level) - 1,
    );
    if (others.length < 3 || !separable(unknown, others, tests, max)) continue;
    cases.push({ unknown: unknown.id, suspects: shuffle(r, [unknown.id, ...others.map((s) => s.id)]) });
  }
  return { kind: 'mystery-substance' as const, level: lvl(level), tests, maxTests: max, cases };
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

/** One periodic-table cell, with only the facts this level lets you look up. */
function cell(a: (typeof PERIODIC)[number], info: InfoField[]) {
  const has = (f: InfoField) => info.includes(f);
  return {
    number: a.number,
    symbol: a.symbol,
    group: a.group,
    period: a.period,
    category: a.category,
    ...(has('name') && { name: a.name }),
    ...(has('state') && { state: a.state }),
    ...(has('shells') && a.number <= 20 && { shells: shellsText(a.number) }),
    ...(has('config') && { config: configText(configOf(a.number)) }),
    ...(has('mass') && { mass: a.mass }),
    ...(has('en') && a.en && { en: a.en }),
    ...(has('ie1') && a.ie1 && { ie1: a.ie1 }),
    ...(has('fact') && a.fact && { fact: a.fact }),
  };
}

/** "C2H6O" style formula of a molecule target. */
const formulaOf = (smiles: string) => hillFormula(countsOf(graphOf(smiles)));
/** Reaction levels hide the product's formula from level 9 (working it out is part of the task). */
const showFormula = (level: number, task?: string) => !task || level <= 8;

export function chemPublicState({ puzzle: p, progress }: ChemState) {
  const results = progress.results;
  switch (p.kind) {
    case 'mixture-lab':
      return {
        level: p.level,
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
    case 'element-quest': {
      const spec = ELEMENT_LEVELS[p.level ?? 1]!;
      const upTo = Math.max(...p.missions.map((m) => m.view.upTo));
      return {
        level: p.level,
        table: PERIODIC.filter((a) => a.number <= upTo).map((a) => cell(a, spec.info)),
        missions: p.missions.map((m, i) => ({
          id: i,
          text: m.text,
          single: m.single,
          upTo: m.view.upTo,
          colours: m.view.colours,
          ...(results[i] && { result: { ...results[i], answer: m.targets, why: m.why } }),
        })),
      };
    }
    case 'molecule-builder':
      return {
        level: p.level,
        valency: VALENCY,
        /** Hydrogens can be filled in with one tap from level 4 (the skeleton is the point). */
        autoHydrogens: p.level >= 4,
        molecules: p.molecules.map((m, i) => {
          const done = results[i];
          return {
            id: i,
            name: m.task && !done ? null : m.name,
            task: m.task ?? null,
            formula: showFormula(p.level, m.task) || done ? formulaOf(m.smiles) : null,
            atoms: showFormula(p.level, m.task) || done ? m.atoms : null,
            palette: m.palette,
            ...(done && { result: { ...done, smiles: m.smiles, structure: graphOf(m.smiles) } }),
          };
        }),
      };
    case 'reaction-rush':
      return {
        level: p.level,
        seconds: p.seconds,
        tasks: p.tasks.map((t, i) => ({
          id: i,
          ...(t.type === 'balance'
            ? { type: t.type, reactants: t.reactants, products: t.products }
            : t.type === 'complete'
              ? { type: t.type, reactants: t.reactants, options: t.options }
              : { type: t.type, prompt: t.prompt, options: t.options }),
          ...(results[i] && {
            result: {
              ...results[i],
              answer: t.type === 'balance' ? t.coefficients : t.answer,
              ...(t.type === 'calc' && { working: t.working }),
            },
          }),
        })),
      };
    case 'mystery-substance':
      return {
        level: p.level,
        tests: p.tests,
        maxTests: p.maxTests ?? 0,
        cases: p.cases.map((c, i) => {
          const unknown = substance(c.unknown);
          const ran = (progress.tests?.[i] ?? []) as TestId[];
          return {
            id: i,
            appearance: unknown.appearance,
            suspects: c.suspects.map((id) => substance(id).name),
            results: Object.fromEntries(ran.map((t) => [t, unknown.results[t]])),
            ...(results[i] && {
              result: { ...results[i], answer: unknown.name, all: Object.fromEntries(p.tests.map((t) => [t, unknown.results[t]])) },
            }),
          };
        }),
      };
  }
}

// ─── Checking ─────────────────────────────────────────────────────────────────

export function chemCheck({ puzzle: p, progress }: ChemState, a: Answer): Outcome {
  const step = progress.at;
  switch (p.kind) {
    case 'mixture-lab': {
      const e = p.experiments[step]!;
      const correct = !a.timeout && sameSet(a.reagents ?? [], e.reagents) && a.choice === e.answer;
      return { correct, points: correct ? 100 : 0, heartLost: !correct, advance: true, reveal: { answer: e.answer, equation: e.equation } };
    }
    case 'element-quest': {
      const m = p.missions[step]!;
      const correct = !a.timeout && sameSet(a.symbols ?? [], m.targets);
      return { correct, points: correct ? 100 : 0, heartLost: !correct, advance: true, reveal: { answer: m.targets, why: m.why } };
    }
    case 'molecule-builder': {
      const m = p.molecules[step]!;
      if (a.timeout) return { correct: false, points: 0, heartLost: false, advance: true, reveal: { answer: m.name } };
      const problem = moleculeProblem(m.smiles, { atoms: a.atoms ?? [], bonds: a.bonds ?? [] });
      if (problem) return { correct: false, points: 0, heartLost: true, retry: true, advance: false, reveal: { problem } };
      return { correct: true, points: 100, heartLost: false, advance: true, reveal: { answer: m.name } };
    }
    case 'reaction-rush': {
      const t = p.tasks[step]!;
      const correct =
        !a.timeout &&
        (t.type === 'balance' ? isBalancedWith(t.reactants, t.products, a.coefficients ?? []) : a.choice === t.answer);
      const combo = correct ? Math.min(progress.streak + 1, 5) : 0;
      return {
        correct,
        points: correct ? 100 + 25 * (combo - 1) : 0,
        heartLost: false,
        advance: true,
        reveal: { answer: t.type === 'balance' ? t.coefficients : t.answer, combo, ...(t.type === 'calc' && { working: t.working }) },
      };
    }
    case 'mystery-substance': {
      const c = p.cases[step]!;
      const unknown = substance(c.unknown);
      if (a.test) {
        // Running a test: shows its result and moves nothing on (within the level's test limit).
        const ran = progress.tests?.[step] ?? [];
        const limit = p.maxTests ?? 0;
        if (!p.tests.includes(a.test as TestId) || (limit && !ran.includes(a.test) && ran.length >= limit))
          return { correct: false, points: 0, heartLost: false, advance: false, reveal: {} };
        return { correct: false, points: 0, heartLost: false, advance: false, reveal: { test: a.test, result: unknown.results[a.test as TestId] } };
      }
      const correct = !a.timeout && a.choice === unknown.name;
      // Fewer tests, more points.
      const ran = progress.tests?.[step]?.length ?? 0;
      const points = correct ? 100 + Math.max(0, Math.min(p.tests.length, 6) - ran) * 20 : 0;
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
  const total = chemStepCount(p);
  switch (p.kind) {
    case 'reaction-rush': {
      const share = right / p.tasks.length;
      return share >= 0.85 ? 3 : share >= 0.55 ? 2 : share >= 0.3 ? 1 : 0;
    }
    case 'molecule-builder':
      return right >= total ? (hearts >= 2 ? 3 : 2) : right >= total - 1 ? 2 : right >= 2 ? 1 : 0;
    default:
      return right >= total ? 3 : right >= total - 1 ? 2 : right >= 1 ? 1 : 0;
  }
}

/**
 * What Kora needs to help on the current step: the task and its answer (Kora is told to guide
 * towards it, not to give it away).
 */
export function chemHelpContext({ puzzle: p, progress }: ChemState) {
  const step = Math.min(progress.at, chemStepCount(p) - 1);
  switch (p.kind) {
    case 'mixture-lab': {
      const e = p.experiments[step]!;
      return `Experiment: ${e.title}. Mix ${reagent(e.reagents[0]).name} with ${reagent(e.reagents[1]).name} in a ${e.glassware}. Observation: ${e.observation.text}. Question: ${e.question} Options: ${e.options.join('; ')}. Correct answer: ${e.answer}. Equation: ${e.equation}.`;
    }
    case 'element-quest': {
      const m = p.missions[step]!;
      return `Periodic table mission: ${m.text}. Correct elements: ${m.targets.join(', ')}. Why: ${m.why}`;
    }
    case 'molecule-builder': {
      const m = p.molecules[step]!;
      return `${m.task ? `Task: ${m.task}. The answer is ${m.name}` : `Build ${m.name}`} (${formulaOf(m.smiles)}, SMILES ${m.smiles}) from atoms with bonds. Usual bonds per atom: ${Object.entries(VALENCY)
        .map(([k, v]) => `${k} ${v}`)
        .join(', ')}.`;
    }
    case 'reaction-rush': {
      const t = p.tasks[step]!;
      return t.type === 'balance'
        ? `Balance: ${t.reactants.join(' + ')} → ${t.products.join(' + ')} (charges after ^). Correct coefficients in order: ${t.coefficients.join(', ')}.`
        : t.type === 'complete'
          ? `Complete: ${t.reactants} ?. Options: ${t.options.join('; ')}. Correct: ${t.answer}.`
          : `Calculation: ${t.prompt} Options: ${t.options.join('; ')}. Correct: ${t.answer}. Working: ${t.working}`;
    }
    case 'mystery-substance': {
      const c = p.cases[step]!;
      const unknown = substance(c.unknown);
      return `Identify an unknown (${unknown.appearance}). Suspects: ${c.suspects.map((id) => substance(id).name).join('; ')}. Tests available: ${p.tests.join(', ')}. Results already seen: ${JSON.stringify(progress.tests?.[step] ?? [])}. It is ${unknown.name}; its results: ${JSON.stringify(unknown.results)}.`;
    }
  }
}
