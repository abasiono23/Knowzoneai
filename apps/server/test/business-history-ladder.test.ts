import { describe, expect, it, vi } from 'vitest';

import { ANALYST_KINDS, analystQuestion, analystSeconds, annuityPv, payment } from '../src/data/business/analyst.js';
import { CIVILIZATIONS, COUNTRIES, ERAS, EVENTS } from '../src/data/history/levels.js';
import { prisma } from '../src/db.js';
import * as business from '../src/services/games/business.js';
import * as history from '../src/services/games/history.js';
import { signIn } from './helpers.js';

vi.mock('../src/services/games/help-ai.js', () => ({ ASK_COST: 10, askKora: vi.fn(async () => 'Think it through.') }));

/** A small seeded random, so failures can be replayed. */
const rand = (seed: number) => {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};
/** "$1,234.50" / "−$12" / "12.5%" / "3.40×" / "1,234" → a number. */
const value = (text: string) => Number(text.replace(/[$,%×]/g, '').replace('−', '-'));

describe('the ten-level ladder', () => {
  it('opens levels 1–4 to everyone and later levels with a star on the level before', () => {
    for (const lib of [business, history]) {
      expect(lib.MAX_LEVEL).toBe(10);
      expect(lib.OPEN_LEVELS).toBe(4);
      expect(lib.levelOpen(4, 0)).toBe(true);
      expect(lib.levelOpen(5, 0)).toBe(false);
      expect(lib.levelOpen(5, 1)).toBe(true);
    }
  });

  it('serves ten levels, refuses a locked one, and keeps a won level open', async () => {
    const { as, sub } = await signIn();
    for (const subject of ['business', 'history'] as const) {
      const cat = (await as.get(`/me/games/${subject}`).expect(200)).body;
      for (const g of cat.games) {
        expect(g.levels).toHaveLength(10);
        expect(g.levels.map((l: { unlocked: boolean }) => l.unlocked)).toEqual([true, true, true, true, false, false, false, false, false, false]);
      }
    }
    await as.post('/me/games/business/budget-master/runs', { level: 4 }).expect(201);
    await as.post('/me/games/history/time-machine/runs', { level: 5 }).expect(403);
    // Stars from the old five-level ladder keep their level numbers: level 5 won opens level 6.
    await prisma.gameProgress.create({ data: { userId: sub, game: 'time-machine', level: 5, bestStars: 2, bestScore: 500, plays: 1 } });
    await as.post('/me/games/history/time-machine/runs', { level: 6 }).expect(201);
    await as.post('/me/games/history/time-machine/runs', { level: 5 }).expect(201);
    await as.post('/me/games/history/time-machine/runs', { level: 11 }).expect(400);
  });

  it('gets harder level by level: more steps, more options, less time, fewer hints', () => {
    for (const game of business.BUSINESS_GAMES) {
      const steps = Array.from({ length: 10 }, (_, i) => business.businessStepCount(business.buildBusinessPuzzle(game, i + 1, 'x')));
      expect(steps[9]!, game).toBeGreaterThan(steps[0]!);
      for (let i = 1; i < 10; i++) expect(steps[i]!, `${game} L${i + 1}`).toBeGreaterThanOrEqual(steps[i - 1]! - 1);
    }
    const desk = (level: number) => {
      const p = business.buildBusinessPuzzle('startup-tycoon', level, 'd');
      return p.kind === 'startup-tycoon' ? p.analyst : [];
    };
    expect(desk(1)).toHaveLength(0);
    expect(desk(10)).toHaveLength(3);
    expect(desk(10)[0]!.options).toHaveLength(5);
    expect(desk(10)[0]!.kind).toBe('twoStageDcf');
    expect(analystSeconds('npv', 3)).toBe(0);
    expect(analystSeconds('npv', 4)).toBeGreaterThan(analystSeconds('npv', 10));
    expect(history.SECONDS[0]).toBe(0);
    expect(history.SECONDS[9]).toBeLessThan(history.SECONDS[3]!);
    expect(history.FIND_SLACK[9]).toBeLessThan(history.FIND_SLACK[0]!);
    // Digs show fewer finds and more look-alike names at the top.
    const dig = (level: number) => {
      const p = history.buildHistoryPuzzle('lost-civilization', level, 'q');
      return p.kind === 'lost-civilization' ? p.digs[0]! : null;
    };
    expect(dig(1)!.finds).toHaveLength(3);
    expect(dig(10)!.finds).toHaveLength(2);
    expect(dig(10)!.mystery.options).toHaveLength(6);
    // The views say when hints fade.
    const view = (level: number) =>
      business.businessPublicState({ puzzle: business.buildBusinessPuzzle('market-master', level, 'v'), progress: { at: 0, results: {}, streak: 0, found: [] } });
    expect(view(3).hints).toBe(true);
    expect(view(9).hints).toBe(false);
  });
});

describe('the analyst’s desk computes every answer', () => {
  it('always offers the answer once among distinct options', () => {
    for (const kind of ANALYST_KINDS)
      for (let seed = 1; seed <= 40; seed++)
        for (const count of [4, 5]) {
          const q = analystQuestion(kind, rand(seed * 31 + count), count);
          expect(q.options, kind).toContain(q.answer);
          expect(new Set(q.options).size, `${kind} ${JSON.stringify(q)}`).toBe(count);
          expect(Object.values(q.vars).every((v) => v.length > 0)).toBe(true);
        }
  });

  it('agrees with the formulas worked out again from the question’s own numbers', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const r = rand(seed);
      const check = (kind: (typeof ANALYST_KINDS)[number], expected: (v: Record<string, number>) => number, tol: number) => {
        const q = analystQuestion(kind, r, 5);
        const v = Object.fromEntries(Object.entries(q.vars).map(([k, t]) => [k, value(t)]));
        expect(Math.abs(value(q.answer) - expected(v)), `${kind} ${JSON.stringify(q)}`).toBeLessThanOrEqual(tol);
      };
      check('compound', (v) => v.principal! * (1 + v.rate! / 100) ** v.years!, 1);
      check('loanPayment', (v) => payment(v.principal!, v.rate! / 1200, v.years! * 12), 0.01);
      check('npv', (v) => annuityPv(v.cash!, v.rate! / 100, v.years!) - v.cost!, 1);
      check('bondPrice', (v) => annuityPv((v.face! * v.coupon!) / 100, v.y! / 100, v.years!) + v.face! / (1 + v.y! / 100) ** v.years!, 0.01);
      check('dcfPerpetuity', (v) => v.fcf! / ((v.r! - v.g!) / 100), 1);
      check('gordon', (v) => (v.d0! * (1 + v.g! / 100)) / ((v.r! - v.g!) / 100), 0.01);
      check('cournot', (v) => (v.A! - v.mc!) / (3 * v.B!), 0.05);
      check('monopolyQ', (v) => (v.A! - v.mc!) / (2 * v.B!), 0.05);
      check('deadweight', (v) => (v.A! - v.mc!) ** 2 / (8 * v.B!), 1);
      check('capm', (v) => v.rf! + v.beta! * (v.rm! - v.rf!), 0.05);
      check('wacc', (v) => {
        const V = v.equity! + v.debt!;
        return (v.equity! / V) * v.re! + (v.debt! / V) * v.rd! * (1 - v.tax! / 100);
      }, 0.005);
      check('runway', (v) => Math.floor(v.cash! / (v.costs! - v.revenue!)), 0);
      check('evMultiple', (v) => v.ebitda! * v.multiple! - v.debt! + v.cash!, 1);
      check('dilution', (v) => (v.own! * v.pre!) / (v.pre! + v.invest!), 0.05);
      check('ear', (v) => ((1 + v.monthly! / 100) ** 12 - 1) * 100, 0.05);
      check('realRate', (v) => ((1 + v.nominal! / 100) / (1 + v.inflation! / 100) - 1) * 100, 0.05);
      check('taxBands', (v) => ((v.band2! - v.band1!) * v.rate2! + (v.income! - v.band2!) * v.rate3!) / 100, 1);
      check('retirement', (v) => (v.payment! * ((1 + v.rate! / 100) ** v.years! - 1)) / (v.rate! / 100), 1);
      // HHI: the sum of the squared shares.
      const h = analystQuestion('hhi', r, 5);
      expect(value(h.answer)).toBe(h.vars.shares!.split(', ').reduce((s, x) => s + value(x) ** 2, 0));
      expect(h.vars.shares!.split(', ').reduce((s, x) => s + value(x), 0)).toBe(100);
    }
  });
});

describe('history content on the ladder', () => {
  it('has questions at every level, four different options each, and a global mix with Africa strong', () => {
    const all = [...ERAS, ...CIVILIZATIONS, ...COUNTRIES].flatMap((x) => x.questions);
    for (const x of all) {
      expect(new Set([x.answer, ...x.wrong.slice(0, 3)]).size, x.q).toBe(4);
      expect(x.level).toBeGreaterThanOrEqual(1);
      expect(x.level).toBeLessThanOrEqual(10);
    }
    for (let level = 1; level <= 10; level++) expect(all.filter((x) => x.level === level).length, `L${level}`).toBeGreaterThanOrEqual(20);
    const african = ERAS.filter((e) => e.region === 'africa').length;
    expect(african / ERAS.length).toBeGreaterThan(0.3);
    expect(african / ERAS.length).toBeLessThan(0.7);
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(40);
    expect(new Set(COUNTRIES.map((c) => c.id)).size).toBe(COUNTRIES.length);
  });

  it('keeps dates consistent: the timeline is in order, era dates match their year, events are not repeated', () => {
    for (let k = 1; k < EVENTS.length; k++) expect(EVENTS[k]!.year).toBeGreaterThanOrEqual(EVENTS[k - 1]!.year);
    expect(new Set(EVENTS.map((e) => e.text.toLowerCase())).size).toBe(EVENTS.length);
    for (const e of ERAS) {
      const m = e.when.replace(/,/g, '').match(/(\d{1,4})\s*(BC|AD)?/i)!;
      const year = /BC/i.test(m[2] ?? '') ? -Number(m[1]) : Number(m[1]);
      expect(year, e.id).toBe(e.year);
    }
  });

  it('puts order challenges far enough apart for their level, and each one has a single true order', () => {
    for (let level = 1; level <= 10; level++)
      for (const seed of ['a', 'b', 'c', 'd']) {
        const c = history.orderChallenge(rand(level * 100 + seed.charCodeAt(0)), level);
        const years = c.years;
        expect(c.items).toHaveLength([3, 4, 4, 4, 5, 5, 5, 6, 6, 6][level - 1]!);
        for (let k = 1; k < years.length; k++) {
          const gap = [200, 100, 60, 40, 25, 15, 10, 5, 2, 1][level - 1]!;
          expect(years[k]! - years[k - 1]!, `L${level} ${c.answer.join(' / ')}`).toBeGreaterThanOrEqual(Math.max(gap, Math.min(years[k]!, years[k - 1]!) < 1000 ? 150 : 0));
        }
        expect([...c.items].sort()).toEqual([...c.answer].sort());
      }
  });

  it('gives the map markers the country itself and three others well away from it', () => {
    for (let level = 1; level <= 10; level++) {
      const p = history.buildHistoryPuzzle('africa-explorer', level, `m${level}`);
      if (p.kind !== 'africa-explorer') throw new Error('kind');
      for (const s of p.stops) {
        const c = COUNTRIES.find((x) => x.id === s.id)!;
        expect(s.choices).toHaveLength(4);
        expect(s.choices.filter((x) => x[0] === c.at[0] && x[1] === c.at[1])).toHaveLength(1);
      }
    }
  });
});
