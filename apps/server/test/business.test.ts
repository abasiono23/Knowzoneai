import { describe, expect, it, vi } from 'vitest';

import { BUDGET_LEVELS, LIFE_EVENTS } from '../src/data/business/budget.js';
import { QUIZ } from '../src/data/business/invest.js';
import { DILEMMAS } from '../src/data/business/startup.js';
import { prisma } from '../src/db.js';
import {
  billsFor,
  BUSINESS_GAMES,
  businessCheck,
  businessIsOver,
  businessStars,
  buildBusinessPuzzle,
  firmValue,
  replayBudget,
  replayStartup,
  type BusinessPuzzle,
  type BusinessState,
} from '../src/services/games/business.js';
import type { Progress } from '../src/services/games/english.js';
import { http, signIn } from './helpers.js';

vi.mock('../src/services/games/help-ai.js', () => ({ ASK_COST: 10, askKora: vi.fn(async () => 'Think about what your customers want.') }));

type As = Awaited<ReturnType<typeof signIn>>['as'];
const start = (as: As, game: string, level = 1) => as.post(`/me/games/business/${game}/runs`, { level });
const secret = async (id: string) => ((await prisma.gameRun.findUniqueOrThrow({ where: { id } })).state as unknown as BusinessState).puzzle;
const answer = (as: As, id: string, body: object) => as.post(`/me/games/runs/${id}/answer`, body).expect(200);

/** Plays a whole run offline with `decide`, applying outcomes the way the server's route does. */
function play(puzzle: BusinessPuzzle, decide: (state: BusinessState) => { plan?: Record<string, number>; choice?: string }) {
  const state: BusinessState = { puzzle, progress: { at: 0, results: {}, streak: 0, found: [] } as Progress };
  let hearts = 3;
  while (!businessIsOver(state, hearts)) {
    const out = businessCheck(state, { step: state.progress.at, ...decide(state) });
    if (!out.advance) throw new Error(`refused: ${JSON.stringify(out.reveal)}`);
    const p = state.progress;
    p.designs = { ...p.designs, [p.at]: out.store!.designs };
    p.results[p.at] = { correct: out.correct, points: out.points };
    p.at += 1;
    if (out.heartLost) hearts -= 1;
  }
  return { state, stars: businessStars(state), hearts };
}

const bestOf = (options: { id: string; grade: string }[]) => options.find((o) => o.grade === 'best')!.id;

/** A sensible month's budget: needs first, at least 20% saved, a little fun, nothing left over. */
function sensibleBudget(state: BusinessState) {
  const p = state.puzzle;
  if (p.kind !== 'budget-master') throw new Error('kind');
  const s = BUDGET_LEVELS[p.level - 1]!;
  const { wallet } = replayBudget(
    p,
    Array.from({ length: state.progress.at }, (_, i) => state.progress.designs![i] as never),
  );
  const at = state.progress.at;
  const bills = Object.values(billsFor(p, wallet, Math.round(wallet.debt * (s.debt?.rate ?? 0)))).reduce((a, b) => a + b, 0);
  const income = p.income[at]!;
  const free = income - bills - s.foodMin;
  const fun = Math.min(Math.floor(income * 0.1), Math.floor(free * 0.25));
  const emergency = wallet.emergency < s.emergencyTarget ? Math.floor((free - fun) * 0.6) : 0;
  const goal = free - fun - emergency;
  const event = LIFE_EVENTS.find((e) => e.id === p.events[at])!;
  return { plan: { food: s.foodMin, fun, clothes: 0, emergency, goal, ...(s.debt && { debt: 0 }) }, choice: bestOf(event.options) };
}

describe('business games are fair and teach the right thing', () => {
  it('every game builds at every level, and the same seed builds the same run', () => {
    for (const game of BUSINESS_GAMES)
      for (let level = 1; level <= 5; level++) {
        const a = buildBusinessPuzzle(game, level, 'same');
        expect(a.kind).toBe(game);
        expect(buildBusinessPuzzle(game, level, 'same')).toEqual(a);
        if (a.kind === 'market-master') expect(a.days).toHaveLength([4, 5, 5, 6, 6][level - 1]!);
      }
  });

  it('Startup Tycoon: good management reaches the goal; doing nothing falls short; a poor choice costs a heart', () => {
    for (let level = 1; level <= 5; level++)
      for (let k = 0; k < 4; k++) {
        const p = buildBusinessPuzzle('startup-tycoon', level, `s${k}`);
        if (p.kind !== 'startup-tycoon') throw new Error('kind');
        const grow = play(p, (s) => {
          const m = s.progress.at;
          const d = DILEMMAS.find((x) => x.id === p.events[m])!;
          return {
            plan: m === 0 ? { maker: 2, seller: 2, support: 0, marketing: 300 } : { maker: 3, seller: 3, support: 1, marketing: 600 },
            choice: bestOf(d.options),
          };
        });
        const g = replayStartup(p, Object.values(grow.state.progress.designs!) as never);
        expect(firmValue(g.firm), `${p.company} L${level}`).toBeGreaterThanOrEqual(p.goal);
        expect(grow.stars).toBe(3);

        const idle = play(p, (s) => {
          const d = DILEMMAS.find((x) => x.id === p.events[s.progress.at])!;
          return { plan: { maker: 1, seller: 1, support: 0, marketing: 0 }, choice: (d.options.find((o) => o.grade === 'ok') ?? d.options[0]!).id };
        });
        const i = replayStartup(p, Object.values(idle.state.progress.designs!) as never);
        expect(firmValue(i.firm), `${p.company} L${level}`).toBeLessThan(p.goal);
      }
    const p = buildBusinessPuzzle('startup-tycoon', 1, 'poor');
    if (p.kind !== 'startup-tycoon') throw new Error('kind');
    const state: BusinessState = { puzzle: p, progress: { at: 0, results: {}, streak: 0, found: [] } };
    const d = DILEMMAS.find((x) => x.id === p.events[0])!;
    const poor = d.options.find((o) => o.grade === 'poor');
    if (poor) expect(businessCheck(state, { step: 0, plan: {}, choice: poor.id }).heartLost).toBe(true);
    // You can't hire a whole team in one month.
    expect(businessCheck(state, { step: 0, plan: { maker: 6 }, choice: d.options[0]!.id }).retry).toBe(true);
  });

  it('Budget Master: a sensible budget scores well and reaches the savings goal; the plan must use every dollar', () => {
    for (let level = 1; level <= 5; level++)
      for (let k = 0; k < 4; k++) {
        const p = buildBusinessPuzzle('budget-master', level, `b${k}`);
        const { state, stars } = play(p, sensibleBudget);
        expect(
          Object.values(state.progress.results).every((r) => r.points >= 85),
          `L${level}`,
        ).toBe(true);
        expect(stars, `L${level}`).toBe(3);
      }
    const p = buildBusinessPuzzle('budget-master', 3, 'x');
    if (p.kind !== 'budget-master') throw new Error('kind');
    const state: BusinessState = { puzzle: p, progress: { at: 0, results: {}, streak: 0, found: [] } };
    const good = sensibleBudget(state);
    expect(businessCheck(state, { step: 0, plan: { ...good.plan, fun: good.plan.fun + 10 }, choice: good.choice }).reveal).toEqual({ end: 'unbalanced' });
    // Skipping food to save more loses a heart.
    const hungry = businessCheck(state, { step: 0, plan: { ...good.plan, food: 0, goal: good.plan.goal + good.plan.food }, choice: good.choice });
    expect(hungry.heartLost).toBe(true);
  });

  it('Budget Master: card debt grows with interest; paying extra shrinks it', () => {
    // A run whose first month's event costs nothing, so only the debt payment differs.
    const p = Array.from({ length: 40 }, (_, k) => buildBusinessPuzzle('budget-master', 3, `debt${k}`)).find(
      (x) => x.kind === 'budget-master' && !LIFE_EVENTS.find((e) => e.id === x.events[0])!.options.find((o) => o.grade === 'best')!.cost,
    );
    if (p?.kind !== 'budget-master') throw new Error('kind');
    const choice = bestOf(LIFE_EVENTS.find((e) => e.id === p.events[0])!.options);
    const pay = replayBudget(p, [{ plan: { food: 300, fun: 100, clothes: 0, emergency: 0, goal: 0, debt: 300 }, choice }] as never);
    const none = replayBudget(p, [{ plan: { food: 300, fun: 100, clothes: 0, emergency: 0, goal: 300, debt: 0 }, choice }] as never);
    expect(none.reports[0]!.interest).toBe(16);
    expect(pay.wallet.debt).toBe(none.wallet.debt - 300);
  });

  it('Market Master and Profit Quest: the best decisions score full points; a loss costs a heart', () => {
    for (let level = 1; level <= 5; level++) {
      const p = buildBusinessPuzzle('market-master', level, `m${level}`);
      const best = play(p, (s) => {
        const probe = businessCheck(s, { step: s.progress.at, plan: { price: 1, stock: 10 } }).reveal!.report as { bestPrice: number; bestStock: number };
        return { plan: { price: probe.bestPrice, stock: probe.bestStock } };
      });
      expect(Object.values(best.state.progress.results).every((r) => r.points === 100)).toBe(true);
      const state: BusinessState = { puzzle: p, progress: { at: 0, results: {}, streak: 0, found: [] } };
      expect(businessCheck(state, { step: 0, plan: { price: 0.25, stock: 500 } }).heartLost).toBe(true);

      const f = buildBusinessPuzzle('profit-quest', level, `f${level}`);
      if (f.kind !== 'profit-quest') throw new Error('kind');
      const run = play(f, (s) => {
        const step = f.steps[s.progress.at]!;
        if (step.type === 'calc') return { choice: step.answer };
        const probe = businessCheck(s, { step: s.progress.at, plan: { price: 1, make: 0 } }).reveal!.report as { bestPrice: number };
        const demand = businessCheck(s, { step: s.progress.at, plan: { price: probe.bestPrice, make: 0 } }).reveal!.report as {
          wanted: number;
          inventory: number;
        };
        return { plan: { price: probe.bestPrice, make: demand.wanted } };
      });
      expect(
        Object.values(run.state.progress.results).every((r) => r.points === 100),
        `L${level}`,
      ).toBe(true);
      for (const s of f.steps) if (s.type === 'calc') expect(new Set(s.options).size).toBe(4);
    }
  });

  it('Market Simulator: allocations must add up to 100%; quiz answers and putting everything in one stock are checked', () => {
    const p = buildBusinessPuzzle('market-simulator', 3, 'inv');
    if (p.kind !== 'market-simulator') throw new Error('kind');
    const state: BusinessState = { puzzle: p, progress: { at: 0, results: {}, streak: 0, found: [] } };
    const quiz = QUIZ.find((q) => q.id === p.quarters[0]!.quiz)!;
    expect(businessCheck(state, { step: 0, plan: { index: 50, bonds: 40 }, choice: '0' }).reveal).toEqual({ end: 'unbalanced' });
    const spread = businessCheck(state, { step: 0, plan: { index: 60, bonds: 30, cash: 10 }, choice: String(quiz.answer) });
    expect(spread).toMatchObject({ correct: true, heartLost: false });
    const allIn = businessCheck(state, { step: 0, plan: { [p.stocks[0]!]: 100 }, choice: String((quiz.answer + 1) % 4) });
    expect(allIn).toMatchObject({ correct: false, heartLost: true });
    expect((allIn.reveal!.report as { concentrated: boolean }).concentrated).toBe(true);
  });
});

describe('playing the business games (server-checked)', () => {
  it('a Startup Tycoon month runs on the server and reports the profit and loss', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'startup-tycoon').expect(201)).body.run;
    expect(run.dilemmas).toHaveLength(run.months);
    expect(JSON.stringify(run.dilemmas)).not.toContain('grade');
    const p = await secret(run.id);
    if (p.kind !== 'startup-tycoon') throw new Error('kind');
    const d = DILEMMAS.find((x) => x.id === p.events[0])!;
    const res = await answer(as, run.id, { step: 0, plan: { maker: 2, seller: 2, support: 0, marketing: 300 }, choice: bestOf(d.options) });
    expect(res.body.outcome.report).toMatchObject({ grade: 'best', marketing: 300 });
    expect(res.body.outcome.report.net).toBe(
      res.body.outcome.report.revenue -
        res.body.outcome.report.cogs -
        res.body.outcome.report.payroll -
        res.body.outcome.report.rent -
        300 -
        res.body.outcome.report.other -
        res.body.outcome.report.loan,
    );
    expect(res.body.run.firm.staff).toEqual({ maker: 2, seller: 2, support: 0 });
    expect(res.body.run.dilemmas[0].report.dilemma).toBe(d.id);
  });

  it('Profit Quest hides the answer until it is given; the games are listed', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'profit-quest').expect(201)).body.run;
    expect(run.steps[0]).not.toHaveProperty('answer');
    const p = await secret(run.id);
    if (p.kind !== 'profit-quest' || p.steps[0]!.type !== 'calc') throw new Error('kind');
    const res = await answer(as, run.id, { step: 0, choice: p.steps[0]!.answer });
    expect(res.body.outcome).toMatchObject({ correct: true, points: 100 });
    expect(res.body.run.steps[0].result.answer).toBe(p.steps[0]!.answer);
    expect((await as.get('/me/games/business').expect(200)).body.games.map((g: { id: string }) => g.id)).toEqual([...BUSINESS_GAMES]);
    await http().get('/me/games/business').expect(401);
  });

  it('a whole Market Master run finishes with stars and rewards', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'market-master').expect(201)).body.run;
    for (let i = 0; i < run.days.length; i++) {
      const probe = businessCheck(
        { puzzle: await secret(run.id), progress: { at: i, results: {}, streak: 0, found: [] } },
        { step: i, plan: { price: 1, stock: 1 } },
      ).reveal!.report as {
        bestPrice: number;
        bestStock: number;
      };
      await answer(as, run.id, { step: i, plan: { price: probe.bestPrice, stock: probe.bestStock } });
    }
    const done = await as.post(`/me/games/runs/${run.id}/finish`, {}).expect(200);
    expect(done.body.summary.stars).toBe(3);
  });
});
