import { describe, expect, it, vi } from 'vitest';

import { makeCalc } from '../src/data/chemistry/calc.js';
import { COMPLETIONS, HARD_EQUATIONS } from '../src/data/chemistry/equations.js';
import { EXPERIMENTS, REAGENTS } from '../src/data/chemistry/experiments.js';
import { balance, isBalancedWith, molarMass, parseEquation, parseSpecies, SCHOOL_AR } from '../src/data/chemistry/formula.js';
import { GEN_COMPLETIONS, GEN_EXPERIMENTS, GEN_REAGENTS } from '../src/data/chemistry/generated.js';
import { ELEMENT_LEVELS, makeMissions } from '../src/data/chemistry/missions.js';
import { MOLECULES } from '../src/data/chemistry/molecules.js';
import { BY_SYMBOL, configOf, configText, ionConfig, PERIODIC, unpaired } from '../src/data/chemistry/periodic.js';
import { countsOf, fromSmiles, hillFormula, sameStructure } from '../src/data/chemistry/structure.js';
import { TESTS_BY_LEVEL } from '../src/data/chemistry/substances.js';
import { prisma } from '../src/db.js';
import {
  ALL_SUBSTANCES,
  atomsOf,
  BALANCE_SETS,
  buildChemPuzzle,
  CHEM_MAX_LEVEL,
  CHEM_OPEN_LEVELS,
  CHEMISTRY_GAMES,
  moleculeProblem,
  MYSTERY_MAX_TESTS,
  type ChemState,
} from '../src/services/games/chemistry.js';
import { random } from '../src/services/games/english.js';
import { http, signIn } from './helpers.js';

// Kora's AI is faked; the coins and limits around it are real.
vi.mock('../src/services/games/help-ai.js', () => ({ ASK_COST: 10, askKora: vi.fn(async () => 'Look at the colour of the precipitate.') }));

type As = Awaited<ReturnType<typeof signIn>>['as'];
const start = (as: As, game: string, level = 1) => as.post(`/me/games/chemistry/${game}/runs`, { level });
const secret = async (id: string) => ((await prisma.gameRun.findUniqueOrThrow({ where: { id } })).state as unknown as ChemState).puzzle;

describe('chemistry content is correct', () => {
  it('parses formulas, ions and hydrates, and works out molar masses', () => {
    expect(atomsOf('Ca(OH)2')).toEqual({ Ca: 1, O: 2, H: 2 });
    expect(atomsOf('Al2(SO4)3')).toEqual({ Al: 2, S: 3, O: 12 });
    expect(parseSpecies('CuSO4.5H2O').atoms).toEqual({ Cu: 1, S: 1, O: 9, H: 10 });
    expect(parseSpecies('Cr2O7^2-')).toEqual({ atoms: { Cr: 2, O: 7 }, charge: -2 });
    expect(parseSpecies('[Cu(NH3)4]^2+')).toEqual({ atoms: { Cu: 1, N: 4, H: 12 }, charge: 2 });
    expect(parseSpecies('e^-')).toEqual({ atoms: {}, charge: -1 });
    expect(() => parseSpecies('Xx2')).toThrow();
    expect(molarMass('CaCO3', SCHOOL_AR)).toBe(100);
    expect(molarMass('H2O')).toBeCloseTo(18.015, 2);
  });

  it('balances equations exactly (atoms and charge, smallest whole numbers)', () => {
    expect(balance(['MnO4^-', 'H^+', 'Fe^2+'], ['Mn^2+', 'H2O', 'Fe^3+'])).toEqual([1, 8, 5, 1, 4, 5]);
    expect(balance(['Cl2', 'OH^-'], ['Cl^-', 'ClO3^-', 'H2O'])).toEqual([3, 6, 5, 1, 3]);
    // Two independent ways to balance: no single answer.
    expect(balance(['H2O2', 'MnO4^-', 'H^+'], ['O2', 'Mn^2+', 'H2O'])).toBeNull();
    for (const [level, list] of Object.entries(BALANCE_SETS))
      for (const e of list) {
        const label = `${level}: ${e.reactants.join(' + ')}`;
        expect(balance(e.reactants, e.products), label).toEqual(e.coefficients);
        expect(isBalancedWith(e.reactants, e.products, e.coefficients), label).toBe(true);
        expect(isBalancedWith(e.reactants, e.products, e.coefficients.map((c) => c * 2)), label).toBe(false);
        expect(Math.max(...e.coefficients), label).toBeLessThanOrEqual(30);
      }
    expect(Object.keys(HARD_EQUATIONS).map(Number)).toEqual([6, 7, 8, 9, 10]);
    for (const list of [...Object.values(COMPLETIONS), ...Object.values(GEN_COMPLETIONS)])
      for (const c of list) {
        expect(c.wrong).not.toContain(c.answer);
        expect(new Set(c.wrong).size).toBe(c.wrong.length);
      }
  });

  it('has a correct periodic table and electron configurations', () => {
    expect(PERIODIC).toHaveLength(118);
    expect(PERIODIC.map((a) => a.number)).toEqual(Array.from({ length: 118 }, (_, i) => i + 1));
    for (const a of PERIODIC) expect(Object.values(configOf(a.number)).reduce((x, y) => x + y, 0), a.symbol).toBe(a.number);
    expect(BY_SYMBOL.Fe).toMatchObject({ group: 8, period: 4, block: 'd' });
    expect(BY_SYMBOL.Ga).toMatchObject({ group: 13, period: 4, block: 'p' });
    expect(BY_SYMBOL.Hf).toMatchObject({ group: 4, period: 6 });
    expect(BY_SYMBOL.Ce).toMatchObject({ group: 0, block: 'f', category: 'lanthanide' });
    expect(configText(configOf(24))).toBe('[Ar] 3d⁵ 4s¹');
    expect(configText(configOf(29))).toBe('[Ar] 3d¹⁰ 4s¹');
    expect(configText(ionConfig(26, 3))).toBe('[Ar] 3d⁵');
    expect(unpaired(ionConfig(26, 2))).toBe(4);
    expect(unpaired(configOf(8))).toBe(2);
  });

  it('builds element missions whose answers come from the data, harder up the ladder', () => {
    for (let level = 1; level <= 10; level++) {
      expect(ELEMENT_LEVELS[level], `level ${level}`).toBeTruthy();
      for (let k = 0; k < 25; k++) {
        const ms = makeMissions(level, random(`t${level}-${k}`), 4);
        expect(ms.length, `level ${level}`).toBeGreaterThanOrEqual(3);
        for (const m of ms) {
          expect(m.targets.length, m.text).toBeGreaterThan(0);
          if (m.single) expect(m.targets, m.text).toHaveLength(1);
          for (const t of m.targets) expect(BY_SYMBOL[t]!.number, m.text).toBeLessThanOrEqual(m.view.upTo);
        }
      }
    }
    // Colour hints only at the bottom; a bigger table and fewer facts at the top.
    expect(ELEMENT_LEVELS[1]!.view.colours).toBe(true);
    expect(ELEMENT_LEVELS[10]!.view.colours).toBe(false);
    expect(ELEMENT_LEVELS[10]!.info.length).toBeLessThan(ELEMENT_LEVELS[1]!.info.length);
  });

  it('uses real reagents and buildable molecules, telling isomers apart', () => {
    const ids = new Set([...REAGENTS, ...GEN_REAGENTS].map((r) => r.id));
    for (const list of [...Object.values(EXPERIMENTS), ...Object.values(GEN_EXPERIMENTS)])
      for (const e of list) {
        expect(e.reagents.every((r) => ids.has(r)), e.title).toBe(true);
        expect(e.wrong).not.toContain(e.answer);
      }
    // The generated experiments' equations balance atoms and charge with their written numbers.
    for (const e of Object.values(GEN_EXPERIMENTS).flat())
      for (const part of e.equation.split(/;|\bthen\b/)) {
        if (!part.includes('→')) continue;
        const p = parseEquation(part.trim().replace(/\s*\((aq|s|l|g|excess|conc\.?|dilute)\)/g, ''));
        expect(p, part).not.toBeNull();
        const total: Record<string, number> = {};
        [...p!.reactants, ...p!.products].forEach((sp, k) => {
          const { atoms, charge } = parseSpecies(sp);
          const sign = k < p!.reactants.length ? 1 : -1;
          for (const [el, n] of Object.entries(atoms)) total[el] = (total[el] ?? 0) + sign * n * p!.coefficients[k]!;
          total['^'] = (total['^'] ?? 0) + sign * charge * p!.coefficients[k]!;
        });
        expect(Object.values(total).every((v) => v === 0), part).toBe(true);
      }
    for (let level = 1; level <= 10; level++) expect(MOLECULES[level]!.length, `level ${level}`).toBeGreaterThanOrEqual(4);
    for (const list of Object.values(MOLECULES)) for (const mol of list) expect(() => fromSmiles(mol.smiles), mol.name).not.toThrow();
    expect(hillFormula(countsOf(fromSmiles('CCO')))).toBe('C2H6O');
    expect(hillFormula(countsOf(fromSmiles('CC(=O)C(C)(C)C')))).toBe('C6H12O');
    expect(sameStructure(fromSmiles('CCCO'), fromSmiles('OCCC'))).toBe(true);
    expect(sameStructure(fromSmiles('CCCO'), fromSmiles('CC(C)O'))).toBe(false);
    expect(sameStructure(fromSmiles('C1=CC=CC=C1'), fromSmiles('C=1C=CC=CC=1'))).toBe(true);
  });

  it('checks molecules by atoms, bonds, valency and structure', () => {
    const ok = { atoms: ['O', 'H', 'H'], bonds: [[0, 1, 1], [0, 2, 1]] as [number, number, number][] };
    expect(moleculeProblem('O', ok)).toBeNull();
    expect(moleculeProblem('O', { atoms: ['O', 'H'], bonds: [[0, 1, 1]] })).toBe('count');
    expect(moleculeProblem('O', { atoms: ['O', 'H', 'H'], bonds: [[0, 1, 2], [0, 2, 1]] })).toBe('valency');
    expect(moleculeProblem('N#N', { atoms: ['N', 'N'], bonds: [[0, 1, 3]] })).toBeNull();
    expect(moleculeProblem('HH', { atoms: ['H', 'H', 'H', 'H'], bonds: [[0, 1, 1], [2, 3, 1]] })).toBe('count');
    expect(moleculeProblem('CC', { atoms: ['C', 'C', 'H', 'H', 'H', 'H', 'H', 'H'], bonds: [[0, 2, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1], [1, 6, 1], [1, 7, 1]] })).toBe('valency');
    // Ethanol asked, methoxymethane built: right formula, wrong structure.
    expect(moleculeProblem('CCO', fromSmiles('COC'))).toBe('isomer');
    expect(moleculeProblem('CCO', fromSmiles('OCC'))).toBeNull();
  });

  it('makes calculations with one right answer among four different options', () => {
    for (let level = 3; level <= 10; level++)
      for (let k = 0; k < 60; k++) {
        const c = makeCalc(level, random(`c${level}-${k}`));
        expect(c.options, `${c.kind}: ${c.prompt}`).toHaveLength(4);
        expect(new Set(c.options).size, c.prompt).toBe(4);
        expect(c.options).toContain(c.answer);
      }
    // A known case worked by hand: 11 g of CO2 is 0.25 mol.
    const moles = Array.from({ length: 400 }, (_, k) => makeCalc(4, random(`m${k}`))).find((c) => c.prompt.startsWith('How many moles are in 11 g of CO2'));
    if (moles) expect(moles.answer).toBe('0.250 mol');
  });

  it('gives every mystery case exactly one suspect that fits the available tests (within the test limit)', () => {
    for (let level = 1; level <= 10; level++)
      for (let k = 0; k < 15; k++) {
        const p = buildChemPuzzle('mystery-substance', level, `m${level}-${k}`);
        if (p.kind !== 'mystery-substance') throw new Error('kind');
        expect(p.cases.length, `level ${level}`).toBeGreaterThanOrEqual(3);
        expect(p.maxTests).toBe(MYSTERY_MAX_TESTS[level - 1]);
        for (const c of p.cases) {
          const sig = (id: string) => {
            const s = ALL_SUBSTANCES.find((x) => x.id === id)!;
            return [s.appearance, ...p.tests.map((t) => s.results[t])].join('|');
          };
          expect(c.suspects.filter((id) => sig(id) === sig(c.unknown))).toEqual([c.unknown]);
        }
      }
    expect(TESTS_BY_LEVEL[10]!.length).toBeGreaterThan(TESTS_BY_LEVEL[1]!.length);
  });

  it('has ten levels for every game, each one buildable and really harder', () => {
    expect([CHEM_MAX_LEVEL, CHEM_OPEN_LEVELS]).toEqual([10, 4]);
    for (const game of CHEMISTRY_GAMES)
      for (let level = 1; level <= 10; level++) expect(() => buildChemPuzzle(game, level, 'seed'), `${game} ${level}`).not.toThrow();
    const r1 = buildChemPuzzle('reaction-rush', 1, 's');
    const r10 = buildChemPuzzle('reaction-rush', 10, 's');
    if (r1.kind !== 'reaction-rush' || r10.kind !== 'reaction-rush') throw new Error('kind');
    expect(r1.tasks.some((t) => t.type === 'calc')).toBe(false);
    expect(r10.tasks.filter((t) => t.type === 'calc').length).toBeGreaterThanOrEqual(3);
    const mix1 = buildChemPuzzle('mixture-lab', 1, 's');
    const mix10 = buildChemPuzzle('mixture-lab', 10, 's');
    if (mix1.kind !== 'mixture-lab' || mix10.kind !== 'mixture-lab') throw new Error('kind');
    expect(mix10.experiments[0]!.options.length).toBeGreaterThan(mix1.experiments[0]!.options.length);
  });
});

describe('playing the lab games (server-checked)', () => {
  it('Mixture Lab: mixing the right reagents and naming the product scores; the answer stays secret until then', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'mixture-lab').expect(201)).body.run;
    expect(run.experiments).toHaveLength(3);
    expect(run.experiments[0].options).toHaveLength(3);
    expect(JSON.stringify(run.experiments)).not.toContain('"answer"');
    expect(run.shelf.length).toBeGreaterThanOrEqual(6);
    const p = await secret(run.id);
    if (p.kind !== 'mixture-lab') throw new Error('kind');
    // Right product but the wrong chemicals: not accepted.
    const wrong = await as.post(`/me/games/runs/${run.id}/answer`, { step: 0, reagents: ['nacl', 'hcl'], choice: p.experiments[0]!.answer }).expect(200);
    expect(wrong.body.outcome).toMatchObject({ correct: false, heartLost: true, answer: p.experiments[0]!.answer });
    for (let i = 1; i < 3; i++) {
      const e = p.experiments[i]!;
      const r = await as.post(`/me/games/runs/${run.id}/answer`, { step: i, reagents: [...e.reagents].reverse(), choice: e.answer }).expect(200);
      expect(r.body.outcome).toMatchObject({ correct: true, equation: e.equation });
    }
    const fin = await as.post(`/me/games/runs/${run.id}/finish`).expect(200);
    expect(fin.body.summary).toMatchObject({ stars: 2, nextLevelUnlocked: true });
    expect(fin.body.summary.xp).toBeGreaterThan(0);
  });

  it('Element Quest: the whole set must be right', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'element-quest').expect(201)).body.run;
    expect(run.table.length).toBeGreaterThanOrEqual(20);
    expect(JSON.stringify(run.missions)).not.toContain('targets');
    const p = await secret(run.id);
    if (p.kind !== 'element-quest') throw new Error('kind');
    const partial = await as.post(`/me/games/runs/${run.id}/answer`, { step: 0, symbols: p.missions[0]!.targets.slice(1) }).expect(200);
    expect(partial.body.outcome.correct).toBe(false);
    const ok = await as.post(`/me/games/runs/${run.id}/answer`, { step: 1, symbols: p.missions[1]!.targets }).expect(200);
    expect(ok.body.outcome.correct).toBe(true);
  });

  it('Molecule Builder: wrong structures can be fixed (for a heart); right ones move on', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'molecule-builder').expect(201)).body.run;
    const p = await secret(run.id);
    if (p.kind !== 'molecule-builder') throw new Error('kind');
    const bad = await as.post(`/me/games/runs/${run.id}/answer`, { step: 0, atoms: ['H'], bonds: [] }).expect(200);
    expect(bad.body.outcome).toMatchObject({ correct: false, retry: true, problem: 'count' });
    expect(bad.body.run).toMatchObject({ at: 0, hearts: 2 });
    // Skipping moves on without the points.
    const skip = await as.post(`/me/games/runs/${run.id}/answer`, { step: 0, timeout: true }).expect(200);
    expect(skip.body.run.at).toBe(1);
    expect(run.molecules[0].palette.length).toBeGreaterThan(Object.keys(run.molecules[0].atoms).length);
    expect(JSON.stringify(run.molecules)).not.toContain('smiles');
  });

  it('Reaction Rush: only the simplest balanced numbers count, and combos grow', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'reaction-rush').expect(201)).body.run;
    expect(run.tasks).toHaveLength(8);
    const p = await secret(run.id);
    if (p.kind !== 'reaction-rush') throw new Error('kind');
    let combo = 0;
    for (let i = 0; i < 3; i++) {
      const t = p.tasks[i]!;
      const body = t.type === 'balance' ? { coefficients: t.coefficients } : { choice: t.answer };
      const r = await as.post(`/me/games/runs/${run.id}/answer`, { step: i, ...body }).expect(200);
      expect(r.body.outcome.correct).toBe(true);
      expect(r.body.outcome.combo).toBe(++combo);
    }
    const t = p.tasks[3]!;
    const doubled = t.type === 'balance' ? { coefficients: t.coefficients.map((c) => c * 2) } : { choice: 'nonsense' };
    expect((await as.post(`/me/games/runs/${run.id}/answer`, { step: 3, ...doubled }).expect(200)).body.outcome.correct).toBe(false);
  });

  it('Mystery Substance: tests reveal clues; fewer tests score more', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'mystery-substance').expect(201)).body.run;
    expect(run.cases[0].suspects).toHaveLength(4);
    expect(run.cases[0].results).toEqual({});
    const p = await secret(run.id);
    if (p.kind !== 'mystery-substance') throw new Error('kind');
    const t = await as.post(`/me/games/runs/${run.id}/answer`, { step: 0, test: 'litmus' }).expect(200);
    expect(t.body.outcome.result).toBeTruthy();
    expect(t.body.run.cases[0].results.litmus).toBe(t.body.outcome.result);
    expect(t.body.run.at).toBe(0);
    const name = (id: string) => ALL_SUBSTANCES.find((s) => s.id === id)!.name;
    const r1 = await as.post(`/me/games/runs/${run.id}/answer`, { step: 0, choice: name(p.cases[0]!.unknown) }).expect(200);
    const r2 = await as.post(`/me/games/runs/${run.id}/answer`, { step: 1, choice: name(p.cases[1]!.unknown) }).expect(200);
    expect(r1.body.outcome.correct && r2.body.outcome.correct).toBe(true);
    expect(r2.body.outcome.points).toBeGreaterThan(r1.body.outcome.points);
  });

  it('Ask Kora costs 10 coins, only if you have them, up to 5 times a game', async () => {
    const { as, sub } = await signIn();
    await prisma.user.update({ where: { id: sub }, data: { coins: 25 } });
    const run = (await start(as, 'mixture-lab').expect(201)).body.run;
    const a = await as.post(`/me/games/runs/${run.id}/ask`, { question: 'What is the blue solid?' }).expect(200);
    expect(a.body).toMatchObject({ reply: expect.any(String), cost: 10, user: { coins: 15 } });
    await as.post(`/me/games/runs/${run.id}/ask`, {}).expect(200);
    expect((await as.post(`/me/games/runs/${run.id}/ask`, {}).expect(402)).body.reason).toBe('no-coins');
    expect((await prisma.user.findUniqueOrThrow({ where: { id: sub } })).coins).toBe(5);
  });

  it('has ten levels: 1–4 open to all, later ones with a star on the level before (old stars kept)', async () => {
    const { as, sub } = await signIn();
    const levelsOf = async () => (await as.get('/me/games/chemistry').expect(200)).body.games.find((g: { id: string }) => g.id === 'reaction-rush').levels;
    const levels = await levelsOf();
    expect(levels).toHaveLength(10);
    expect(levels.map((l: { unlocked: boolean }) => l.unlocked)).toEqual([true, true, true, true, false, false, false, false, false, false]);
    await start(as, 'reaction-rush', 5).expect(403);
    // A star won on the old five-level ladder stays on its level and opens the next.
    await prisma.gameProgress.create({ data: { userId: sub, game: 'reaction-rush', level: 5, bestStars: 2, bestScore: 500, plays: 1 } });
    const after = await levelsOf();
    expect(after[4]).toMatchObject({ level: 5, unlocked: true, bestStars: 2 });
    expect(after[5].unlocked).toBe(true);
    expect(after[6].unlocked).toBe(false);
    const run = (await start(as, 'reaction-rush', 6).expect(201)).body.run;
    expect(run.tasks.some((t: { type: string }) => t.type === 'calc')).toBe(true);
    expect(JSON.stringify(run.tasks)).not.toContain('working');
  });

  it('keeps English games working and refuses unknown subjects', async () => {
    const { as } = await signIn();
    expect((await as.get('/me/games/chemistry').expect(200)).body.games.map((g: { id: string }) => g.id)).toContain('mixture-lab');
    await as.post('/me/games/english/hidden-letters/runs', { level: 1 }).expect(201);
    await as.post('/me/games/chemistry/hidden-letters/runs', { level: 1 }).expect(400);
    await as.get('/me/games/physics').expect(400);
    await http().get('/me/games/chemistry').expect(401);
  });
});
