import { describe, expect, it, vi } from 'vitest';

import { CIVILIZATIONS } from '../src/data/history/civilizations.js';
import { COUNTRIES, mapDistance } from '../src/data/history/countries.js';
import { ERAS, EVENTS } from '../src/data/history/eras.js';
import { prisma } from '../src/db.js';
import { buildHistoryPuzzle, HISTORY_GAMES, type HistoryState } from '../src/services/games/history.js';
import { http, signIn } from './helpers.js';

vi.mock('../src/services/games/help-ai.js', () => ({ ASK_COST: 10, askKora: vi.fn(async () => 'Think about who ruled from Ile-Ife.') }));

type As = Awaited<ReturnType<typeof signIn>>['as'];
const start = (as: As, game: string, level = 1) => as.post(`/me/games/history/${game}/runs`, { level });
const secret = async (id: string) => ((await prisma.gameRun.findUniqueOrThrow({ where: { id } })).state as unknown as HistoryState).puzzle;
const answer = (as: As, id: string, body: object) => as.post(`/me/games/runs/${id}/answer`, body).expect(200);

describe('history content is correct', () => {
  it('has four different options for every question', () => {
    const all = [...ERAS.flatMap((e) => e.questions), ...CIVILIZATIONS.flatMap((c) => c.questions), ...COUNTRIES.flatMap((c) => c.questions)];
    for (const x of all) expect(new Set([x.answer, ...x.wrong]).size, x.q).toBe(4);
    expect(new Set(EVENTS.map((e) => e.text)).size).toBe(EVENTS.length);
  });

  it('has something new at every level, and finds never name their civilization', () => {
    for (let level = 1; level <= 5; level++) {
      expect(
        ERAS.some((e) => e.level === level),
        `era ${level}`,
      ).toBe(true);
      expect(COUNTRIES.filter((c) => c.level <= level).length).toBeGreaterThanOrEqual(4);
      expect(CIVILIZATIONS.filter((c) => c.level <= level).length).toBeGreaterThanOrEqual(3);
    }
    for (const c of CIVILIZATIONS) {
      const word = c.name
        .replace(/^The (Kingdom of |)/, '')
        .split(' ')[0]!
        .toLowerCase();
      for (const f of c.finds) expect(`${f.name} ${f.clue}`.toLowerCase(), c.id).not.toMatch(new RegExp(`\\b${word}\\b`));
    }
  });

  it('finds every country where it is, and not its neighbours', () => {
    for (const c of COUNTRIES) expect(mapDistance(c.at, c.at)).toBe(0);
    const at = (id: string) => COUNTRIES.find((c) => c.id === id)!;
    // Kenya and Uganda are next to each other; a tap in the middle of one doesn't count for the other.
    expect(mapDistance(at('uganda').at, at('kenya').at)).toBeGreaterThan(at('kenya').radius);
    expect(mapDistance(at('ghana').at, at('nigeria').at)).toBeGreaterThan(at('nigeria').radius);
  });

  it('visits eras in time order and puts events far enough apart', () => {
    for (let level = 1; level <= 5; level++)
      for (const seed of ['a', 'b', 'c']) {
        const p = buildHistoryPuzzle('time-machine', level, seed);
        if (p.kind !== 'time-machine') throw new Error('kind');
        const years = p.eras.map((e) => ERAS.find((x) => x.id === e.id)!.year);
        expect([...years].sort((a, b) => a - b)).toEqual(years);
        const orders = p.eras.flatMap((e) => e.challenges.filter((c) => c.type === 'order'));
        expect(orders.length).toBe(level >= 4 ? 2 : level >= 2 ? 1 : 0);
      }
  });
});

describe('playing the history games (server-checked)', () => {
  it('Time Machine: choices and putting events in order; answers stay secret', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'time-machine', 1).expect(201)).body.run;
    expect(run.eras).toHaveLength(3);
    expect(run.total).toBe(6);
    expect(JSON.stringify(run.eras)).not.toContain('"answer"');
    const p = await secret(run.id);
    if (p.kind !== 'time-machine') throw new Error('kind');
    const c0 = p.eras[0]!.challenges[0]!;
    const ok = await answer(as, run.id, { step: 0, choice: c0.answer });
    expect(ok.body.outcome).toMatchObject({ correct: true, points: 100 });
    const bad = await answer(as, run.id, { step: 1, choice: 'Nobody' });
    expect(bad.body.outcome).toMatchObject({ correct: false, heartLost: true });

    // Level 2 has a "put in order" challenge: only the true order counts.
    await prisma.gameProgress.create({
      data: { userId: (await as.get('/me').expect(200)).body.user.id, game: 'time-machine', level: 1, bestStars: 1, bestScore: 100, plays: 1 },
    });
    const run2 = (await start(as, 'time-machine', 2).expect(201)).body.run;
    const p2 = await secret(run2.id);
    if (p2.kind !== 'time-machine') throw new Error('kind');
    const step = p2.eras.flatMap((e) => e.challenges).findIndex((c) => c.type === 'order');
    for (let i = 0; i < step; i++) {
      const c = p2.eras[Math.floor(i / 2)]!.challenges[i % 2]!;
      await answer(as, run2.id, { step: i, choice: c.answer as string });
    }
    const order = p2.eras[Math.floor(step / 2)]!.challenges[step % 2]!;
    if (order.type !== 'order') throw new Error('type');
    const view = (await as.post(`/me/games/runs/${run2.id}/answer`, { step, order: [...order.answer].reverse() }).expect(200)).body;
    expect(view.outcome).toMatchObject({ correct: false, answer: order.answer });
  });

  it('Lost Civilization: name the civilization, then answer about it (revealed only after)', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'lost-civilization').expect(201)).body.run;
    expect(run.digs).toHaveLength(3);
    expect(run.digs[0].finds).toHaveLength(3);
    expect(run.digs[0]).not.toHaveProperty('followUp');
    const p = await secret(run.id);
    if (p.kind !== 'lost-civilization') throw new Error('kind');
    const named = await answer(as, run.id, { step: 0, choice: p.digs[0]!.mystery.answer });
    expect(named.body.outcome).toMatchObject({ correct: true, answer: p.digs[0]!.mystery.answer, about: expect.any(String) });
    expect(named.body.run.digs[0].followUp.options).toHaveLength(4);
    const follow = await answer(as, run.id, { step: 1, choice: p.digs[0]!.followUp.answer });
    expect(follow.body.outcome.correct).toBe(true);
  });

  it('Africa Explorer: tap the country on the map, then answer about its landmark', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'africa-explorer').expect(201)).body.run;
    expect(run.stops).toHaveLength(4);
    expect(run.total).toBe(8);
    expect(run.stops[0]).not.toHaveProperty('landmark');
    expect(run.stops[0].region).toBeTruthy();
    const p = await secret(run.id);
    if (p.kind !== 'africa-explorer') throw new Error('kind');
    const c = COUNTRIES.find((x) => x.id === p.stops[0]!.id)!;
    const near = await answer(as, run.id, { step: 0, point: [c.at[0] + 0.5, c.at[1] - 0.5] });
    expect(near.body.outcome).toMatchObject({ correct: true, at: c.at });
    expect(near.body.run.stops[0]).toMatchObject({ landmark: c.landmark, facts: c.facts });
    await answer(as, run.id, { step: 1, choice: p.stops[0]!.question.answer });
    // Tapping the far side of Africa misses.
    const c2 = COUNTRIES.find((x) => x.id === p.stops[1]!.id)!;
    const miss = await answer(as, run.id, { step: 2, point: [c2.at[0] > 20 ? -15 : 45, c2.at[1] > 0 ? -30 : 30] });
    expect(miss.body.outcome).toMatchObject({ correct: false, heartLost: true, at: c2.at });
  });

  it('finishes with stars, lists the history games, and lets you ask Kora', async () => {
    const { as, sub } = await signIn();
    await prisma.user.update({ where: { id: sub }, data: { coins: 20 } });
    const run = (await start(as, 'lost-civilization').expect(201)).body.run;
    const p = await secret(run.id);
    if (p.kind !== 'lost-civilization') throw new Error('kind');
    expect((await as.post(`/me/games/runs/${run.id}/ask`, {}).expect(200)).body.user.coins).toBe(10);
    for (let k = 0; k < 3; k++) {
      await answer(as, run.id, { step: 2 * k, choice: p.digs[k]!.mystery.answer });
      await answer(as, run.id, { step: 2 * k + 1, choice: p.digs[k]!.followUp.answer });
    }
    expect((await as.post(`/me/games/runs/${run.id}/finish`).expect(200)).body.summary).toMatchObject({ stars: 3, nextLevelUnlocked: true });
    expect((await as.get('/me/games/history').expect(200)).body.games.map((g: { id: string }) => g.id)).toEqual([...HISTORY_GAMES]);
    await http().get('/me/games/history').expect(401);
  });
});
