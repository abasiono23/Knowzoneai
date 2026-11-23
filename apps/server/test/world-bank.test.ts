import { describe, expect, it } from 'vitest';

import { evalArithmetic, numberIn } from '../scripts/world-content.js';
import { BANKS, bankLevel } from '../src/data/world/bank.js';
import { WORLD_IDS, WORLD_LADDER, WORLD_LEVELS, WORLD_OPEN_LEVELS } from '../src/data/world/types.js';
import { http } from './helpers.js';

/**
 * Knowzone World's question banks: seven worlds × ten levels, each with enough checked questions,
 * statements and terms for its game, in the shapes the app plays.
 */
describe('world question banks', () => {
  it('has every level of every world, with enough of each kind of item', () => {
    for (const world of WORLD_IDS)
      for (let level = 1; level <= WORLD_LEVELS; level++) {
        const b = BANKS[world][level];
        expect(b, `${world} level ${level}`).toBeDefined();
        // A quiz deals up to 10 questions; the lightning round needs a deck; puzzles need 4–5 words.
        expect(b!.questions.length, `${world} L${level} questions`).toBeGreaterThanOrEqual(10);
        expect(b!.truths.length, `${world} L${level} truths`).toBeGreaterThanOrEqual(12);
        expect(b!.terms.length, `${world} L${level} terms`).toBeGreaterThanOrEqual(level === 3 ? 4 : level === 8 ? 5 : 2);
      }
  });

  it('gives each question one right answer among distinct options, more options at the top of the ladder', () => {
    for (const world of WORLD_IDS)
      for (let level = 1; level <= WORLD_LEVELS; level++)
        for (const q of BANKS[world][level]!.questions) {
          expect(q.options.length, q.id).toBe(WORLD_LADDER[level - 1]!.options);
          expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
          expect(q.answer, q.id).toBeLessThan(q.options.length);
          expect(new Set(q.options.map((o) => o.toLowerCase().trim())).size, q.id).toBe(q.options.length);
          expect(q.options.some((o) => /all of the above|none of the above/i.test(o)), q.id).toBe(false);
          expect(q.why.length, q.id).toBeGreaterThan(10);
          expect(q.hint.length, q.id).toBeGreaterThan(4);
        }
  });

  it('spreads the right answer across positions (not always where the writer put it)', () => {
    const at = [0, 0, 0, 0, 0];
    for (const world of WORLD_IDS) for (let l = 1; l <= WORLD_LEVELS; l++) for (const q of BANKS[world][l]!.questions) at[q.answer]!++;
    const total = at.reduce((a, b) => a + b, 0);
    for (const n of at.slice(0, 4)) expect(n / total).toBeGreaterThan(0.12);
  });

  it('keeps puzzle terms to capital letters, longer higher up, and never in their own clue', () => {
    for (const world of WORLD_IDS)
      for (let level = 1; level <= WORLD_LEVELS; level++)
        for (const t of BANKS[world][level]!.terms) {
          expect(t.word, t.id).toMatch(/^[A-Z]+$/);
          expect(t.word.length, t.id).toBeGreaterThanOrEqual(level <= 3 ? 4 : level <= 7 ? 5 : 7);
          expect(t.clue.toUpperCase().includes(t.word), t.id).toBe(false);
        }
  });

  it('never repeats an item id, and ids say where they belong', () => {
    const ids = new Set<string>();
    for (const world of WORLD_IDS)
      for (let level = 1; level <= WORLD_LEVELS; level++) {
        const b = BANKS[world][level]!;
        for (const x of [...b.questions, ...b.truths, ...b.terms]) {
          expect(x.id.startsWith(`${world}-L${level}-`), x.id).toBe(true);
          expect(ids.has(x.id), x.id).toBe(false);
          ids.add(x.id);
        }
      }
  });

  it('serves one level at a time, and 404s for anything else', async () => {
    const res = await http().get('/world/bank/math/10').expect(200);
    expect(res.body.questions.length).toBeGreaterThanOrEqual(10);
    expect(res.body.questions[0]).toHaveProperty('answer');
    await http().get('/world/bank/math/11').expect(404);
    await http().get('/world/bank/math/0').expect(404);
    await http().get('/world/bank/potions/1').expect(404);
    expect(bankLevel('space', 1)).not.toBeNull();
    expect(bankLevel('space', 1.5)).toBeNull();
  });
});

describe('the ten-level ladder', () => {
  it('has ten levels: four open to all, ending in the final test, keeping the old six levels’ kinds where it can', () => {
    expect(WORLD_LADDER).toHaveLength(WORLD_LEVELS);
    expect(WORLD_OPEN_LEVELS).toBe(4);
    expect(WORLD_LADDER.map((r) => r.kind).slice(0, 5)).toEqual(['mission', 'sprint', 'puzzle', 'mission', 'battle']);
    expect(WORLD_LADDER[9]!.kind).toBe('boss');
  });

  it('only gets tighter as you climb: more options, fewer hearts and hints, a stronger rival', () => {
    const quizzes = WORLD_LADDER.filter((r) => r.kind === 'mission' || r.kind === 'boss');
    for (let i = 1; i < WORLD_LADDER.length; i++) expect(WORLD_LADDER[i]!.options).toBeGreaterThanOrEqual(WORLD_LADDER[i - 1]!.options);
    for (let i = 1; i < quizzes.length; i++) {
      expect(quizzes[i]!.hearts).toBeLessThanOrEqual(quizzes[i - 1]!.hearts);
      expect(quizzes[i]!.hints).toBeLessThanOrEqual(quizzes[i - 1]!.hints);
    }
    const rivals = WORLD_LADDER.filter((r) => r.rival).map((r) => r.rival!);
    expect(rivals).toEqual([...rivals].sort((a, b) => a - b));
    expect(WORLD_LADDER[9]).toMatchObject({ hearts: 2, hints: 0 });
  });

  it('gets harder in the content too: longer questions and longer terms at the top than at the bottom', () => {
    const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    const qLen = (l: number) => avg(WORLD_IDS.flatMap((w) => BANKS[w][l]!.questions.map((q) => q.q.length)));
    const tLen = (l: number) => avg(WORLD_IDS.flatMap((w) => BANKS[w][l]!.terms.map((t) => t.word.length)));
    expect(qLen(10)).toBeGreaterThan(qLen(1) * 1.5);
    expect(qLen(5)).toBeGreaterThan(qLen(1));
    expect(tLen(8)).toBeGreaterThan(tLen(3));
  });
});

describe('the maths check in the content script', () => {
  it('evaluates plain arithmetic and nothing else', () => {
    expect(evalArithmetic('(3/4)*120')).toBe(90);
    expect(evalArithmetic('2^10')).toBe(1024);
    expect(evalArithmetic('Math.sqrt(2)*Math.sqrt(2)')).toBeCloseTo(2);
    expect(evalArithmetic('1,250 + 50')).toBe(1300);
    expect(evalArithmetic('process.exit(1)')).toBeNull();
    expect(evalArithmetic('alert(1)')).toBeNull();
  });
  it('reads the number an option states', () => {
    expect(numberIn('12 cm')).toBe(12);
    expect(numberIn('1,250')).toBe(1250);
    expect(numberIn('-3.5')).toBe(-3.5);
    expect(numberIn('x = 4')).toBeNull();
    expect(numberIn('Gravity')).toBeNull();
  });
});
