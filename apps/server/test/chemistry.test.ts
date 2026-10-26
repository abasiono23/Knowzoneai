import { describe, expect, it, vi } from 'vitest';

import { COMPLETIONS, EQUATIONS } from '../src/data/chemistry/equations.js';
import { ELEMENTS, MISSIONS } from '../src/data/chemistry/elements.js';
import { EXPERIMENTS, REAGENTS } from '../src/data/chemistry/experiments.js';
import { MOLECULES, VALENCY } from '../src/data/chemistry/molecules.js';
import { SUBSTANCES, TESTS_BY_LEVEL } from '../src/data/chemistry/substances.js';
import { prisma } from '../src/db.js';
import { atomsOf, buildChemPuzzle, isBalanced, moleculeProblem, type ChemState } from '../src/services/games/chemistry.js';
import { http, signIn } from './helpers.js';

// Kora's AI is faked; the coins and limits around it are real.
vi.mock('../src/services/games/help-ai.js', () => ({ ASK_COST: 10, askKora: vi.fn(async () => 'Look at the colour of the precipitate.') }));

type As = Awaited<ReturnType<typeof signIn>>['as'];
const start = (as: As, game: string, level = 1) => as.post(`/me/games/chemistry/${game}/runs`, { level });
const secret = async (id: string) => ((await prisma.gameRun.findUniqueOrThrow({ where: { id } })).state as unknown as ChemState).puzzle;

describe('chemistry content is correct', () => {
  it('parses formulas and every equation balances with its own numbers', () => {
    expect(atomsOf('Ca(OH)2')).toEqual({ Ca: 1, O: 2, H: 2 });
    expect(atomsOf('Al2(SO4)3')).toEqual({ Al: 2, S: 3, O: 12 });
    for (const list of Object.values(EQUATIONS))
      for (const e of list) {
        expect(isBalanced(e, e.coefficients), `${e.reactants.join('+')}`).toBe(true);
        // Doubling every number balances too, but isn't the simplest form.
        expect(
          isBalanced(
            e,
            e.coefficients.map((c) => c * 2),
          ),
        ).toBe(false);
      }
    for (const list of Object.values(COMPLETIONS)) for (const c of list) expect(c.wrong).not.toContain(c.answer);
  });

  it('uses real reagents, real elements and buildable molecules', () => {
    const ids = new Set(REAGENTS.map((r) => r.id));
    for (const list of Object.values(EXPERIMENTS))
      for (const e of list) {
        expect(e.reagents.every((r) => ids.has(r))).toBe(true);
        expect(e.wrong).not.toContain(e.answer);
      }
    for (const [level, missions] of Object.entries(MISSIONS))
      for (const m of missions) {
        const pool = ELEMENTS.filter((e) => !m.pool || m.pool(e));
        expect(pool.filter(m.test).length, `${level} ${m.id}`).toBeGreaterThanOrEqual(2);
        expect(pool.filter((e) => !m.test(e)).length).toBeGreaterThanOrEqual(5);
      }
    // A molecule can be built only if its bond ends pair up and can join every atom.
    for (const list of Object.values(MOLECULES))
      for (const mol of list) {
        const atoms = Object.values(mol.atoms).reduce((s, n) => s + n, 0);
        const ends = Object.entries(mol.atoms).reduce((s, [el, n]) => s + n * VALENCY[el]!, 0);
        expect(ends % 2, mol.name).toBe(0);
        expect(ends / 2).toBeGreaterThanOrEqual(atoms - 1);
      }
  });

  it('checks molecules by atoms, bonds and valency', () => {
    const water = { H: 2, O: 1 };
    expect(
      moleculeProblem(water, {
        atoms: ['O', 'H', 'H'],
        bonds: [
          [0, 1, 1],
          [0, 2, 1],
        ],
      }),
    ).toBeNull();
    expect(moleculeProblem(water, { atoms: ['O', 'H'], bonds: [[0, 1, 1]] })).toBe('count');
    expect(
      moleculeProblem(water, {
        atoms: ['O', 'H', 'H'],
        bonds: [
          [0, 1, 2],
          [0, 2, 1],
        ],
      }),
    ).toBe('valency');
    expect(
      moleculeProblem(
        { C: 1, O: 2 },
        {
          atoms: ['C', 'O', 'O'],
          bonds: [
            [0, 1, 2],
            [0, 2, 2],
          ],
        },
      ),
    ).toBeNull();
    expect(moleculeProblem({ N: 2 }, { atoms: ['N', 'N'], bonds: [[0, 1, 3]] })).toBeNull();
    expect(
      moleculeProblem(
        { H: 4 },
        {
          atoms: ['H', 'H', 'H', 'H'],
          bonds: [
            [0, 1, 1],
            [2, 3, 1],
          ],
        },
      ),
    ).toBe('disconnected');
  });

  it('gives every mystery case exactly one suspect that fits the available tests', () => {
    for (let level = 1; level <= 5; level++)
      for (let k = 0; k < 20; k++) {
        const p = buildChemPuzzle('mystery-substance', level, `m${level}-${k}`);
        if (p.kind !== 'mystery-substance') throw new Error('kind');
        for (const c of p.cases) {
          const sig = (id: string) => {
            const s = SUBSTANCES.find((x) => x.id === id)!;
            return [s.appearance, ...TESTS_BY_LEVEL[level]!.map((t) => s.results[t])].join('|');
          };
          const fits = c.suspects.filter((id) => sig(id) === sig(c.unknown));
          expect(fits).toEqual([c.unknown]);
        }
      }
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
    expect(run.missions[0].cabinet).toHaveLength(9);
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
  });

  it('Reaction Rush: only the simplest balanced numbers count, and combos grow', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'reaction-rush').expect(201)).body.run;
    expect(run.tasks).toHaveLength(9);
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
    const name = (id: string) => SUBSTANCES.find((s) => s.id === id)!.name;
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

  it('keeps English games working and refuses unknown subjects', async () => {
    const { as } = await signIn();
    expect((await as.get('/me/games/chemistry').expect(200)).body.games.map((g: { id: string }) => g.id)).toContain('mixture-lab');
    await as.post('/me/games/english/hidden-letters/runs', { level: 1 }).expect(201);
    await as.post('/me/games/chemistry/hidden-letters/runs', { level: 1 }).expect(400);
    await as.get('/me/games/physics').expect(400);
    await http().get('/me/games/chemistry').expect(401);
  });
});
