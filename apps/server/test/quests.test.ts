import { describe, expect, it, vi } from 'vitest';

import { PLACES, TEMPLATES, type QuestEvent } from '../src/data/quests.js';
import { prisma } from '../src/db.js';
import { recordQuestEvent, weekKey } from '../src/services/quests.js';
import type { HistoryState } from '../src/services/games/history.js';
import { http, signIn } from './helpers.js';

vi.mock('../src/services/games/help-ai.js', () => ({ ASK_COST: 10, askKora: vi.fn(async () => 'hint') }));

type Quest = { id: string; place: string; game?: string; target: number; progress: number; done: boolean; claimed: boolean };

/** A finished game that moves the given quest by at least its whole target. */
function eventFor(id: string): QuestEvent {
  const t = TEMPLATES.find((x) => x.id === id)!;
  const subject = t.place === 'any' ? 'english' : t.place;
  const game = t.game ?? (subject === 'english' ? 'hidden-letters' : 'x');
  const results = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i, { correct: true }]));
  return { subject, game, level: 1, stars: 3, results };
}

describe('world quests', () => {
  it('knows ISO weeks', () => {
    expect(weekKey('2026-10-26')).toBe('2026-W44');
    expect(weekKey('2026-01-01')).toBe('2026-W01');
    expect(weekKey('2027-01-01')).toBe('2026-W53');
  });

  it('every quest can be finished in one good game, and each place has quests', () => {
    for (const t of TEMPLATES) expect(t.count(eventFor(t.id)), t.id).toBeGreaterThanOrEqual(1);
    for (const p of PLACES) expect(TEMPLATES.filter((t) => t.place === p).length).toBeGreaterThanOrEqual(3);
  });

  it('gives a daily board with one quest per place, a weekly board and a 6-step journey, the same each time', async () => {
    const { as } = await signIn();
    const a = (await as.get('/me/quests').expect(200)).body;
    expect(a.daily.quests.map((q: Quest) => q.place).sort()).toEqual([...PLACES].sort());
    expect(a.daily.chests).toHaveLength(3);
    expect(a.weekly.quests).toHaveLength(4);
    expect(a.weekly.quests[0]).toMatchObject({ id: 'all-places', target: 4 });
    expect(a.journey.steps).toHaveLength(6);
    expect(
      a.journey.steps
        .slice(0, 4)
        .map((s: Quest) => s.place)
        .sort(),
    ).toEqual([...PLACES].sort());
    expect(a.journey.steps[0].current).toBe(true);
    expect(a.daily.resetsIn).toBeGreaterThan(0);
    const b = (await as.get('/me/quests').expect(200)).body;
    expect(b.daily.quests.map((q: Quest) => q.id)).toEqual(a.daily.quests.map((q: Quest) => q.id));
  });

  it('finished games move quests on; claiming pays once; chests open after enough claims', async () => {
    const { as, sub } = await signIn();
    const board = (await as.get('/me/quests').expect(200)).body;
    const first: Quest = board.daily.quests[0];
    expect((await as.post('/me/quests/claim', { board: 'daily', id: first.id }).expect(409)).body.reason).toBe('not-done');
    await recordQuestEvent(sub, eventFor(first.id));
    const after = (await as.get('/me/quests').expect(200)).body;
    expect(after.daily.quests[0]).toMatchObject({ done: true, claimed: false });
    const before = (await prisma.user.findUniqueOrThrow({ where: { id: sub } })).coins;
    const claimed = (await as.post('/me/quests/claim', { board: 'daily', id: first.id }).expect(200)).body;
    expect(claimed.reward).toEqual({ xp: 30, coins: 10 });
    expect(claimed.user.coins).toBe(before + 10);
    expect(claimed.quests.daily.quests[0].claimed).toBe(true);
    expect((await as.post('/me/quests/claim', { board: 'daily', id: first.id }).expect(409)).body.reason).toBe('claimed');
    // The first chest opens after one claim, the last only after four.
    expect((await as.post('/me/quests/chest', { chest: 'daily', index: 0 }).expect(200)).body.reward).toEqual({ xp: 0, coins: 10 });
    await as.post('/me/quests/chest', { chest: 'daily', index: 0 }).expect(409);
    expect((await as.post('/me/quests/chest', { chest: 'daily', index: 2 }).expect(409)).body.reason).toBe('not-done');
    const log = await prisma.coinTransaction.findMany({ where: { userId: sub } });
    expect(log.map((l) => l.reason)).toEqual(expect.arrayContaining([`quest:${first.id}`, 'quest-chest:daily']));
  });

  it('the journey moves one step at a time and ends in a chest; "every place" counts places', async () => {
    const { as, sub } = await signIn();
    const board = (await as.get('/me/quests').expect(200)).body;
    await as.post('/me/quests/chest', { chest: 'journey' }).expect(409);
    // A game for a later step does nothing to it while an earlier step is current.
    const last: Quest = board.journey.steps[5];
    const first: Quest = board.journey.steps[0];
    if (last.place !== first.place) {
      await recordQuestEvent(sub, { ...eventFor(last.id), results: { 0: { correct: false } }, stars: 0 });
      expect((await as.get('/me/quests').expect(200)).body.journey.at).toBe(0);
    }
    // Some steps need two games ("play 2 word games"), so each is played twice.
    for (const step of board.journey.steps as Quest[]) {
      await recordQuestEvent(sub, eventFor(step.id));
      await recordQuestEvent(sub, eventFor(step.id));
    }
    const done = (await as.get('/me/quests').expect(200)).body;
    expect(done.journey.at).toBe(6);
    expect(done.journey.chest.ready).toBe(true);
    expect(done.weekly.quests[0]).toMatchObject({ id: 'all-places', progress: 4, done: true });
    expect((await as.post('/me/quests/chest', { chest: 'journey' }).expect(200)).body.reward).toEqual({ xp: 150, coins: 80, item: 'hat-explorer' });
  });

  it('playing a real game counts (the finish endpoint feeds quests)', async () => {
    const { as } = await signIn();
    const run = (await as.post('/me/games/history/lost-civilization/runs', { level: 1 }).expect(201)).body.run;
    const p = ((await prisma.gameRun.findUniqueOrThrow({ where: { id: run.id } })).state as unknown as HistoryState).puzzle;
    if (p.kind !== 'lost-civilization') throw new Error('kind');
    for (let k = 0; k < 3; k++) {
      await as.post(`/me/games/runs/${run.id}/answer`, { step: 2 * k, choice: p.digs[k]!.mystery.answer }).expect(200);
      await as.post(`/me/games/runs/${run.id}/answer`, { step: 2 * k + 1, choice: p.digs[k]!.followUp.answer }).expect(200);
    }
    await as.post(`/me/games/runs/${run.id}/finish`).expect(200);
    const q = (await as.get('/me/quests').expect(200)).body;
    expect(q.weekly.quests[0]).toMatchObject({ id: 'all-places', progress: 1 });
    const history: Quest = q.daily.quests.find((x: Quest) => x.place === 'history');
    if (history.id === 'cities') expect(history.progress).toBe(2);
    await http().get('/me/quests').expect(401);
  });
});
