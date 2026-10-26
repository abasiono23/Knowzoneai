import { describe, expect, it, vi } from 'vitest';

import { DESTINATIONS } from '../src/data/space/planets.js';
import { PROBLEMS_BY_LEVEL } from '../src/data/space/problems.js';
import { QUESTIONS } from '../src/data/space/questions.js';
import { ENGINES, MAX_TANKS, MISSIONS, rocketProblem, type Design, type EngineId, type TankId } from '../src/data/space/rockets.js';
import { prisma } from '../src/db.js';
import { random } from '../src/services/games/english.js';
import { fly } from '../src/services/games/gravity.js';
import { buildSpacePuzzle, rocketQuestion, SPACE_GAMES, type SpaceState } from '../src/services/games/space.js';
import { http, signIn } from './helpers.js';

vi.mock('../src/services/games/help-ai.js', () => ({ ASK_COST: 10, askKora: vi.fn(async () => 'Think about which way the planet pulls.') }));

type As = Awaited<ReturnType<typeof signIn>>['as'];
const start = (as: As, game: string, level = 1) => as.post(`/me/games/space/${game}/runs`, { level });
const secret = async (id: string) => ((await prisma.gameRun.findUniqueOrThrow({ where: { id } })).state as unknown as SpaceState).puzzle;
const answer = (as: As, id: string, body: object) => as.post(`/me/games/runs/${id}/answer`, body).expect(200);

/** Every rocket that can be built: one engine and 1–5 tanks. */
function allDesigns(): Design[] {
  const kinds: TankId[] = ['small', 'medium', 'large'];
  const out: Design[] = [];
  const rec = (from: number, tanks: TankId[]) => {
    if (tanks.length) for (const engine of Object.keys(ENGINES) as EngineId[]) out.push({ engine, tanks });
    if (tanks.length === MAX_TANKS) return;
    for (let i = from; i < kinds.length; i++) rec(i, [...tanks, kinds[i]!]);
  };
  rec(0, []);
  return out;
}

describe('space content is correct', () => {
  it('has well-formed questions with one right answer each', () => {
    for (const list of [...Object.values(QUESTIONS), ...DESTINATIONS.map((d) => d.questions)])
      for (const x of list) {
        expect(new Set([x.answer, ...x.wrong]).size, x.q).toBe(4);
      }
    for (let level = 1; level <= 5; level++) expect(QUESTIONS[level]!.length).toBeGreaterThanOrEqual(8);
  });

  it('makes physics calculations with four different options', () => {
    const r = random('physics');
    for (const makers of Object.values(PROBLEMS_BY_LEVEL))
      for (const make of makers)
        for (let i = 0; i < 30; i++) {
          const x = make(r);
          expect(new Set([x.answer, ...x.wrong]).size, x.q).toBe(4);
          expect(x.q).not.toMatch(/NaN|undefined/);
        }
  });

  it('every rocket mission can be flown, but not by just taking the biggest parts', () => {
    const designs = allDesigns();
    for (const missions of Object.values(MISSIONS))
      for (const m of missions) {
        expect(designs.filter((d) => rocketProblem(m, d) === null).length, m.id).toBeGreaterThanOrEqual(2);
        expect(rocketProblem(m, { engine: 'titan', tanks: ['large', 'large', 'large', 'large', 'large'] }), m.id).not.toBeNull();
      }
    // The ion drive never lifts off from Earth.
    expect(rocketProblem(MISSIONS[1]![0]!, { engine: 'ion', tanks: ['small'] })).toBe('no-liftoff');
  });

  it('asks rocket questions with four different options', () => {
    for (let level = 1; level <= 5; level++)
      for (const m of MISSIONS[level]!)
        for (const d of allDesigns().filter((x) => rocketProblem(m, x) === null)) {
          const x = rocketQuestion(7, 1, level, m, d);
          expect(new Set(x.options).size, x.q).toBe(4);
          expect(x.options).toContain(x.answer);
        }
  });

  it('builds gravity puzzles that the planned planets solve and that need your planets', () => {
    for (let level = 1; level <= 5; level++)
      for (let k = 0; k < 6; k++) {
        const p = buildSpacePuzzle('gravity-master', level, `seed-${k}`);
        if (p.kind !== 'gravity-master') throw new Error('kind');
        for (const x of p.puzzles) {
          expect(fly(x.launch, [...x.fixed, ...x.solution], x.goal).end).toBe('goal');
          expect(fly(x.launch, x.fixed, x.goal).end).not.toBe('goal');
        }
      }
  });

  it('Solar System Explorer visits three different places, including a new one from level 2', () => {
    for (let level = 1; level <= 5; level++) {
      const p = buildSpacePuzzle('solar-explorer', level, 'trip');
      if (p.kind !== 'solar-explorer') throw new Error('kind');
      const ids = p.visits.map((v) => v.id);
      expect(new Set(ids).size).toBe(3);
      if (level > 1 && DESTINATIONS.some((d) => d.level === level)) expect(ids.some((id) => DESTINATIONS.find((d) => d.id === id)!.level === level)).toBe(true);
    }
  });
});

describe('playing the space games (server-checked)', () => {
  it('Galaxy Defender: right answers power up with combos, wrong ones cost a heart; answers stay secret', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'galaxy-defender').expect(201)).body.run;
    expect(run.questions).toHaveLength(8);
    expect(JSON.stringify(run.questions)).not.toContain('"answer"');
    const p = await secret(run.id);
    if (p.kind !== 'galaxy-defender') throw new Error('kind');
    const a = await answer(as, run.id, { step: 0, choice: p.questions[0]!.answer });
    const b = await answer(as, run.id, { step: 1, choice: p.questions[1]!.answer });
    expect(a.body.outcome).toMatchObject({ correct: true, combo: 1 });
    expect(b.body.outcome.points).toBeGreaterThan(a.body.outcome.points);
    const c = await answer(as, run.id, { step: 2, timeout: true });
    expect(c.body.outcome).toMatchObject({ correct: false, heartLost: true, answer: p.questions[2]!.answer });
    expect(c.body.run.hearts).toBe(2);
  });

  it('Rocket Builder: a rocket that cannot lift off is refused (for a heart); a good one flies and is asked about', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'rocket-builder').expect(201)).body.run;
    expect(run.missions).toHaveLength(3);
    expect(run.total).toBe(6);
    const p = await secret(run.id);
    if (p.kind !== 'rocket-builder') throw new Error('kind');
    const mission = p.missions[0]!;
    const bad = await answer(as, run.id, { step: 0, engine: 'ion', tanks: ['small'] });
    expect(bad.body.outcome).toMatchObject({ correct: false, retry: true, problem: 'no-liftoff' });
    expect(bad.body.run).toMatchObject({ at: 0, hearts: 2 });
    expect(bad.body.run.missions[0].tries).toBe(1);
    const good = allDesigns().find((d) => rocketProblem(mission, d) === null)!;
    const ok = await answer(as, run.id, { step: 0, ...good });
    expect(ok.body.outcome).toMatchObject({ correct: true, points: 85 });
    const m0 = ok.body.run.missions[0];
    expect(m0.design).toEqual(good);
    expect(m0.question.options).toHaveLength(4);
    expect(m0.question).not.toHaveProperty('answer');
    const right = rocketQuestion(p.seed, 1, 1, mission, good).answer;
    const q = await answer(as, run.id, { step: 1, choice: right });
    expect(q.body.outcome).toMatchObject({ correct: true, answer: right });
    expect(q.body.run.missions[0].result.answer).toBe(right);
  });

  it('Gravity Master: misses can be retried for fewer points; the planned planets reach the goal', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'gravity-master', 1).expect(201)).body.run;
    expect(run.puzzles[0]).not.toHaveProperty('solution');
    const p = await secret(run.id);
    if (p.kind !== 'gravity-master') throw new Error('kind');
    const x = p.puzzles[0]!;
    // A planet far in the corner doesn't bend the comet enough.
    const miss = await answer(as, run.id, { step: 0, placements: [{ x: 0.85, y: 1.4, mass: x.movable[0]![0] }] });
    expect(miss.body.outcome).toMatchObject({ correct: false, retry: true, heartLost: false });
    expect(miss.body.run.puzzles[0].tries).toBe(1);
    // On top of the goal is not allowed.
    const cheat = await answer(as, run.id, { step: 0, placements: [{ ...x.goal, mass: x.movable[0]![0] }] });
    expect(cheat.body.outcome).toMatchObject({ correct: false, end: 'invalid' });
    const hit = await answer(as, run.id, { step: 0, placements: x.solution });
    expect(hit.body.outcome).toMatchObject({ correct: true, points: 80, end: 'goal' });
    const giveUp = await answer(as, run.id, { step: 1, timeout: true });
    expect(giveUp.body.run.puzzles[1].result.solution).toEqual(p.puzzles[1]!.solution);
  });

  it('Solar System Explorer and Asteroid Survival: questions are checked; fewer hits score more', async () => {
    const { as } = await signIn();
    const ex = (await start(as, 'solar-explorer').expect(201)).body.run;
    expect(ex.visits).toHaveLength(3);
    expect(ex.visits[0].facts).toHaveLength(3);
    const pe = await secret(ex.id);
    if (pe.kind !== 'solar-explorer') throw new Error('kind');
    expect((await answer(as, ex.id, { step: 0, choice: pe.visits[0]!.questions[0]!.answer })).body.outcome.correct).toBe(true);

    const sv = (await start(as, 'asteroid-survival').expect(201)).body.run;
    expect(sv.challenges).toHaveLength(6);
    const ps = await secret(sv.id);
    if (ps.kind !== 'asteroid-survival') throw new Error('kind');
    const clean = await answer(as, sv.id, { step: 0, choice: ps.challenges[0]!.answer, hits: 0 });
    const battered = await answer(as, sv.id, { step: 1, choice: ps.challenges[1]!.answer, hits: 5 });
    expect(clean.body.outcome.points).toBe(160);
    expect(battered.body.outcome.points).toBe(100);
  });

  it('finishes with stars and rewards, lists the space games, and lets you ask Kora', async () => {
    const { as, sub } = await signIn();
    await prisma.user.update({ where: { id: sub }, data: { coins: 30 } });
    const run = (await start(as, 'galaxy-defender').expect(201)).body.run;
    const p = await secret(run.id);
    if (p.kind !== 'galaxy-defender') throw new Error('kind');
    const asked = await as.post(`/me/games/runs/${run.id}/ask`, { question: 'help' }).expect(200);
    expect(asked.body.user.coins).toBe(20);
    for (let i = 0; i < 8; i++) await answer(as, run.id, { step: i, choice: p.questions[i]!.answer });
    const fin = await as.post(`/me/games/runs/${run.id}/finish`).expect(200);
    expect(fin.body.summary).toMatchObject({ stars: 3, nextLevelUnlocked: true });
    const list = (await as.get('/me/games/space').expect(200)).body.games;
    expect(list.map((g: { id: string }) => g.id)).toEqual([...SPACE_GAMES]);
    expect(list.find((g: { id: string }) => g.id === 'galaxy-defender').levels[1].unlocked).toBe(true);
    await as.post('/me/games/space/hidden-letters/runs', { level: 1 }).expect(400);
    await http().get('/me/games/space').expect(401);
  });
});
