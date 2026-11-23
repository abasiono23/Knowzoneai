import { describe, expect, it, vi } from 'vitest';

import { DESTINATIONS } from '../src/data/space/planets.js';
import { PLACE_QUESTIONS } from '../src/data/space/explorer-ladder.js';
import { PROBLEMS_BY_LEVEL, sig } from '../src/data/space/problems.js';
import { MORE_QUESTIONS } from '../src/data/space/questions-ladder.js';
import { QUESTIONS } from '../src/data/space/questions.js';
import { allDesigns as designsAt, MISSIONS, rocketProblem, rocketStats } from '../src/data/space/rockets.js';
import { prisma } from '../src/db.js';
import { random } from '../src/services/games/english.js';
import { fly, placementOk } from '../src/services/games/gravity.js';
import { buildSpacePuzzle, defenderPool, MAX_LEVEL, OPEN_LEVELS, rocketQuestion, SPACE_GAMES, type SpaceState } from '../src/services/games/space.js';
import { http, signIn } from './helpers.js';

vi.mock('../src/services/games/help-ai.js', () => ({ ASK_COST: 10, askKora: vi.fn(async () => 'Think about which way the planet pulls.') }));

type As = Awaited<ReturnType<typeof signIn>>['as'];
const start = (as: As, game: string, level = 1) => as.post(`/me/games/space/${game}/runs`, { level });
const secret = async (id: string) => ((await prisma.gameRun.findUniqueOrThrow({ where: { id } })).state as unknown as SpaceState).puzzle;
const answer = (as: As, id: string, body: object) => as.post(`/me/games/runs/${id}/answer`, body).expect(200);

/** Every rocket that can be built at level 1: one engine and 1–5 tanks. */
const allDesigns = () => designsAt(1);

describe('space content is correct', () => {
  it('has well-formed questions with one right answer each', () => {
    for (const list of [...Object.values(QUESTIONS), ...DESTINATIONS.map((d) => d.questions)])
      for (const x of list) {
        expect(new Set([x.answer, ...x.wrong]).size, x.q).toBe(4);
      }
    for (let level = 1; level <= 5; level++) expect(QUESTIONS[level]!.length).toBeGreaterThanOrEqual(8);
    // The checked ladder questions: five options from level 8, and every level has a full run's worth.
    for (const [level, list] of Object.entries(MORE_QUESTIONS))
      for (const x of list) {
        expect(x.wrong.length, x.q).toBe(Number(level) >= 8 ? 4 : 3);
        expect(new Set([x.answer, ...x.wrong]).size, x.q).toBe(x.wrong.length + 1);
      }
    for (let level = 1; level <= MAX_LEVEL; level++) expect(defenderPool(level).length, `level ${level}`).toBeGreaterThanOrEqual(level >= 9 ? 24 : 16);
    for (const x of PLACE_QUESTIONS) {
      expect(DESTINATIONS.map((d) => d.id), x.q).toContain(x.place);
      expect(new Set([x.answer, ...x.wrong]).size, x.q).toBe(x.level >= 8 ? 5 : 4);
    }
  });

  it('has ten levels, the first four open to everyone, and every level really gets harder', () => {
    expect([MAX_LEVEL, OPEN_LEVELS]).toEqual([10, 4]);
    // Level 10 asks more questions, with more options and less time, than level 1.
    const easy = buildSpacePuzzle('galaxy-defender', 1, 'x');
    const hard = buildSpacePuzzle('galaxy-defender', 10, 'x');
    if (easy.kind !== 'galaxy-defender' || hard.kind !== 'galaxy-defender') throw new Error('kind');
    expect(hard.questions.length).toBeGreaterThan(easy.questions.length);
    expect(hard.questions[0]!.options).toHaveLength(5);
    expect(hard.seconds).toBeLessThan(easy.seconds);
    // Formula hints only on the easy levels.
    const s1 = buildSpacePuzzle('asteroid-survival', 1, 'x');
    const s9 = buildSpacePuzzle('asteroid-survival', 9, 'x');
    if (s1.kind !== 'asteroid-survival' || s9.kind !== 'asteroid-survival') throw new Error('kind');
    expect(s1.challenges.every((c) => 'hint' in c)).toBe(true);
    expect(s9.challenges.some((c) => 'hint' in c)).toBe(false);
    // Gravity puzzles: more planets in the way and less of the path shown.
    const g1 = buildSpacePuzzle('gravity-master', 1, 'x');
    const g10 = buildSpacePuzzle('gravity-master', 10, 'x');
    if (g1.kind !== 'gravity-master' || g10.kind !== 'gravity-master') throw new Error('kind');
    expect(g10.puzzles[0]!.fixed.length).toBeGreaterThan(g1.puzzles[0]!.fixed.length);
    expect(g10.preview).toBeLessThan(g1.preview);
  });

  it('works out the physics in code: three significant figures and real constants', () => {
    expect(sig(7670.4)).toBe('7 670');
    expect(sig(0.04517)).toBe('0.0452');
    expect(sig(6.674e-11)).toBe('6.67 × 10⁻¹¹');
    expect(sig(1.07e11)).toBe('1.07 × 10¹¹');
    // Low Earth orbit: about 7.7 km/s at 400 km; geostationary height about 35 800 km.
    const r = random('orbits');
    const leo = PROBLEMS_BY_LEVEL[6]!.find((m) => m.name === 'orbitSpeed')!;
    for (let i = 0; i < 20; i++) {
      const p = leo(r);
      const h = Number(/orbit ([\d ]+) km above Earth/.exec(p.q)?.[1]?.replace(/ /g, ''));
      if (!h) continue;
      const v = Math.sqrt((6.67e-11 * 5.97e24) / (6.37e6 + h * 1000));
      expect(p.answer).toBe(`${sig(v)} m/s`);
    }
    const geo = PROBLEMS_BY_LEVEL[7]!.find((m) => m.name === 'stationary')!;
    for (let i = 0; i < 10; i++) {
      const p = geo(r);
      if (p.q.startsWith('Earth')) expect(p.answer).toBe('35 800 km');
    }
  });

  it('makes physics calculations with four different options', () => {
    const r = random('physics');
    for (const makers of Object.values(PROBLEMS_BY_LEVEL))
      for (const make of makers)
        for (let i = 0; i < 30; i++) {
          const x = make(r);
          expect(new Set([x.answer, ...x.wrong]).size, x.q).toBe(5);
          expect(x.q).not.toMatch(/NaN|undefined/);
        }
  });

  it('every rocket mission can be flown, but not by just taking the biggest parts', () => {
    for (const [level, missions] of Object.entries(MISSIONS))
      for (const m of missions) {
        const designs = designsAt(Number(level));
        expect(designs.filter((d) => rocketProblem(m, d) === null).length, m.id).toBeGreaterThanOrEqual(Number(level) <= 5 ? 2 : 1);
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
    // From level 7 rockets can have two stages; a vacuum engine can't be the first stage.
    for (let level = 6; level <= 10; level++)
      for (const m of MISSIONS[level]!) {
        const good = designsAt(level).filter((d) => rocketProblem(m, d) === null);
        expect(good.length, m.id).toBeGreaterThanOrEqual(1);
        // Harder missions leave few ways to fly.
        expect(good.length, m.id).toBeLessThan(200);
        if (level >= 8) expect(good.every((d) => d.upper), m.id).toBe(true);
        for (const d of good.slice(0, 20)) {
          const x = rocketQuestion(3, 1, level, m, d);
          expect(new Set(x.options).size, x.q).toBe(level >= 8 ? 5 : 4);
          expect(x.options).toContain(x.answer);
          expect(x.q).not.toMatch(/NaN|undefined|Infinity/);
        }
      }
    expect(rocketProblem(MISSIONS[8]![0]!, { engine: 'vega', tanks: ['large'], upper: { engine: 'vega', tanks: ['small'] } })).toBe('vacuum');
    const staged = { engine: 'titan' as const, tanks: ['small' as const], upper: { engine: 'vega' as const, tanks: ['small' as const, 'large' as const, 'large' as const] } };
    const st = rocketStats(MISSIONS[9]![0]!, staged);
    expect(st.dv).toBeCloseTo(st.stages[0]!.dv + st.stages[1]!.dv, 6);
  });

  it('builds gravity puzzles that the planned planets solve and that need your planets', () => {
    for (let level = 1; level <= 10; level++)
      for (let k = 0; k < 4; k++) {
        const p = buildSpacePuzzle('gravity-master', level, `seed-${k}`);
        if (p.kind !== 'gravity-master') throw new Error('kind');
        for (const x of p.puzzles) {
          expect(fly(x.launch, [...x.fixed, ...x.solution], x.goal).end).toBe('goal');
          expect(fly(x.launch, x.fixed, x.goal).end).not.toBe('goal');
        }
      }
  });

  it('Solar System Explorer visits different places, including a new one from level 2', () => {
    for (let level = 1; level <= 10; level++) {
      const p = buildSpacePuzzle('solar-explorer', level, 'trip');
      if (p.kind !== 'solar-explorer') throw new Error('kind');
      const ids = p.visits.map((v) => v.id);
      expect(new Set(ids).size).toBe(level >= 6 ? 4 : 3);
      expect(p.visits.every((v) => v.questions.length === 2)).toBe(true);
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
    // A planet that is allowed there but sends the comet somewhere else.
    const corners = [0.1, 0.5, 0.9].flatMap((cx) => [0.1, 0.75, 1.4].map((cy) => ({ x: cx, y: cy, mass: x.movable[0]![0]! })));
    const wide = corners.find((b) => placementOk(b, x.fixed, x.launch, x.goal) && fly(x.launch, [...x.fixed, b], x.goal).end !== 'goal')!;
    const miss = await answer(as, run.id, { step: 0, placements: [wide] });
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

  it('Solar System Explorer and Asteroid Survival: questions are checked; combos score more', async () => {
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
    // No dodging any more: right answers in a row build a combo.
    const first = await answer(as, sv.id, { step: 0, choice: ps.challenges[0]!.answer });
    const second = await answer(as, sv.id, { step: 1, choice: ps.challenges[1]!.answer });
    expect(first.body.outcome.points).toBe(100);
    expect(second.body.outcome.points).toBe(120);
    expect(sv.challenges[0].hint).toBeTruthy();
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
    const levels = list.find((g: { id: string }) => g.id === 'galaxy-defender').levels;
    expect(levels).toHaveLength(10);
    expect(levels.map((l: { unlocked: boolean }) => l.unlocked)).toEqual([true, true, true, true, false, false, false, false, false, false]);
    await start(as, 'galaxy-defender', 10).expect(403);
    await start(as, 'galaxy-defender', 4).expect(201);
    await as.post('/me/games/space/hidden-letters/runs', { level: 1 }).expect(400);
    await http().get('/me/games/space').expect(401);
  });
});
