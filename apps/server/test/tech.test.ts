import { describe, expect, it, vi } from 'vitest';

import { CYBER } from '../src/data/tech/cyber.js';
import { prisma } from '../src/db.js';
import { blockCount, buildTechPuzzle, runProgram, runRobot, TECH_GAMES, truthTable, type Card, type Op, type TechState } from '../src/services/games/tech.js';
import { http, signIn } from './helpers.js';

vi.mock('../src/services/games/help-ai.js', () => ({ ASK_COST: 10, askKora: vi.fn(async () => 'Look for the pattern that repeats.') }));

type As = Awaited<ReturnType<typeof signIn>>['as'];
const start = (as: As, game: string, level = 1) => as.post(`/me/games/tech/${game}/runs`, { level });
const secret = async (id: string) => ((await prisma.gameRun.findUniqueOrThrow({ where: { id } })).state as unknown as TechState).puzzle;
const answer = (as: As, id: string, body: object) => as.post(`/me/games/runs/${id}/answer`, body).expect(200);

/** Unrolls repeats: how many blocks the program would need without loops. */
const unrolled = (ops: Op[]): number => ops.reduce((n, o) => n + (o.op === 'repeat' ? o.times * unrolled(o.body) : 1), 0);

type Board = { w: number; h: number; blocked: [number, number][]; robot: [number, number]; kitten: [number, number]; home?: [number, number] };
/** A route as cards (shortest path, merged into straight runs). */
function route(b: Board, from: [number, number], to: [number, number]): Card[] {
  const blocked = new Set(b.blocked.map((c) => c.join(',')));
  const prev = new Map<string, [number, number] | null>([[from.join(','), null]]);
  const queue: [number, number][] = [from];
  while (queue.length) {
    const [x, y] = queue.shift()!;
    for (const [dx, dy] of [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ] as const) {
      const n: [number, number] = [x + dx, y + dy];
      if (n[0] < 0 || n[1] < 0 || n[0] >= b.w || n[1] >= b.h || blocked.has(n.join(',')) || prev.has(n.join(','))) continue;
      prev.set(n.join(','), [x, y]);
      queue.push(n);
    }
  }
  const path: [number, number][] = [];
  for (let c: [number, number] | null = to; c; c = prev.get(c.join(','))!) path.unshift(c);
  const cards: Card[] = [];
  for (let i = 1; i < path.length; i++) {
    const [dx, dy] = [path[i]![0] - path[i - 1]![0], path[i]![1] - path[i - 1]![1]];
    const dir = dy < 0 ? 'up' : dx > 0 ? 'right' : dy > 0 ? 'down' : 'left';
    const last = cards.at(-1);
    if (last && 'dir' in last && last.dir === dir) last.n += 1;
    else cards.push({ dir, n: 1 });
  }
  return cards;
}
const rescue = (b: Board): Card[] => [...route(b, b.robot, b.kitten), { op: 'pick' }, ...(b.home ? [...route(b, b.kitten, b.home), { op: 'drop' as const }] : [])];

describe('tech puzzles are solvable and fair', () => {
  it('Code Runner: the planned program reaches the goal within the block limit; from level 3 you need a loop', () => {
    for (let level = 1; level <= 5; level++)
      for (let k = 0; k < 5; k++) {
        const p = buildTechPuzzle('code-runner', level, `s${k}`);
        if (p.kind !== 'code-runner') throw new Error('kind');
        for (const x of p.puzzles) {
          expect(runProgram(x.solution, x).end).toBe('goal');
          expect(blockCount(x.solution)).toBeLessThanOrEqual(x.maxBlocks);
          if (level >= 3) expect(unrolled(x.solution)).toBeGreaterThan(x.maxBlocks);
        }
      }
    const board = { tiles: [[0, 0], [1, 0], [3, 0]] as [number, number][], start: { x: 0, y: 0, dir: 1 }, goal: [3, 0] as [number, number] };
    expect(runProgram([{ op: 'move' }, { op: 'jump' }], board).end).toBe('goal');
    expect(runProgram([{ op: 'move' }, { op: 'move' }], board).end).toBe('fell');
  });

  it('Robot Rescue: every board can be solved, and the robot stops at walls', () => {
    for (let level = 1; level <= 5; level++)
      for (let k = 0; k < 5; k++) {
        const p = buildTechPuzzle('robot-rescue', level, `r${k}`);
        if (p.kind !== 'robot-rescue') throw new Error('kind');
        for (const x of p.puzzles) {
          expect(runRobot(rescue(x), x).end).toBe('saved');
          expect(!!x.home).toBe(level >= 3);
        }
      }
    expect(runRobot([{ dir: 'left', n: 1 }], { w: 3, h: 3, blocked: [], robot: [0, 0], kitten: [2, 2] }).end).toBe('bump');
  });

  it('Circuit Master: the planned gates light the bulb exactly as asked, and it is never always on or off', () => {
    for (let level = 1; level <= 5; level++)
      for (let k = 0; k < 5; k++) {
        const p = buildTechPuzzle('circuit-master', level, `c${k}`);
        if (p.kind !== 'circuit-master') throw new Error('kind');
        for (const x of p.puzzles) {
          expect(truthTable(x.inputs, x.slots, x.out, x.solution)).toEqual(x.target);
          expect(new Set(x.target).size).toBe(2);
        }
      }
  });

  it('Cyber items each have one answer from their own choices', () => {
    for (const c of CYBER) {
      const choices = c.kind === 'password' ? ['weak', 'strong'] : c.kind === 'situation' ? ['risky', 'safe'] : ['phishing', 'safe'];
      expect(choices, c.id).toContain(c.answer);
    }
    expect(new Set(CYBER.map((c) => c.id)).size).toBe(CYBER.length);
  });
});

describe('playing the tech games (server-checked)', () => {
  it('Code Runner: a program that falls can be retried; the right one wins (gems add points); too many blocks is refused', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'code-runner').expect(201)).body.run;
    expect(run.puzzles).toHaveLength(4);
    expect(run.puzzles[0]).not.toHaveProperty('solution');
    const p = await secret(run.id);
    if (p.kind !== 'code-runner') throw new Error('kind');
    const x = p.puzzles[0]!;
    const fall = await answer(as, run.id, { step: 0, program: [{ op: 'left' }, { op: 'move' }] });
    expect(fall.body.outcome).toMatchObject({ correct: false, retry: true });
    const tooMany = Array.from({ length: x.maxBlocks + 1 }, () => ({ op: 'left' }));
    expect((await answer(as, run.id, { step: 0, program: tooMany })).body.outcome.end).toBe('blocks');
    const win = await answer(as, run.id, { step: 0, program: x.solution });
    expect(win.body.outcome).toMatchObject({ correct: true, end: 'goal' });
    expect(win.body.outcome.points).toBe(60 + 10 * win.body.outcome.gems);
  });

  it('Robot Rescue: the right cards save the kitten; the best programme earns a bonus', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'robot-rescue').expect(201)).body.run;
    const p = await secret(run.id);
    if (p.kind !== 'robot-rescue') throw new Error('kind');
    const cards = rescue(p.puzzles[0]!);
    const res = await answer(as, run.id, { step: 0, cards });
    expect(res.body.outcome).toMatchObject({ correct: true, end: 'saved' });
  });

  it('Binary Breaker and Circuit Master check the answer on the server', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'binary-breaker').expect(201)).body.run;
    expect(JSON.stringify(run.vaults)).not.toContain('"answer"');
    const p = await secret(run.id);
    if (p.kind !== 'binary-breaker') throw new Error('kind');
    for (let i = 0; i < p.vaults.length; i++) {
      const v = p.vaults[i]!;
      const n = Number(v.answer);
      const body = v.type === 'set' || v.type === 'add' ? { bits: Array.from({ length: v.bits }, (_, k) => (n >> (v.bits - 1 - k)) & 1) } : { choice: v.answer };
      expect((await answer(as, run.id, { step: i, ...body })).body.outcome.correct, v.type).toBe(true);
    }

    const c = (await start(as, 'circuit-master', 1).expect(201)).body.run;
    const pc = await secret(c.id);
    if (pc.kind !== 'circuit-master') throw new Error('kind');
    const x = pc.puzzles[0]!;
    const wrong = Object.fromEntries(x.slots.map((s) => [s.id, x.solution[s.id] === 'AND' ? 'OR' : 'AND']));
    expect((await answer(as, c.id, { step: 0, gates: wrong })).body.outcome).toMatchObject({ correct: false, retry: true, end: 'wrong' });
    expect((await answer(as, c.id, { step: 0, gates: x.solution })).body.outcome).toMatchObject({ correct: true, end: 'lit' });
  });

  it('Cyber Defender: verdicts are checked, with the reason shown after; the games are listed', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'cyber-defender').expect(201)).body.run;
    expect(run.items).toHaveLength(8);
    expect(run.items[0]).not.toHaveProperty('answer');
    const p = await secret(run.id);
    if (p.kind !== 'cyber-defender') throw new Error('kind');
    const c = CYBER.find((x) => x.id === p.items[0])!;
    const res = await answer(as, run.id, { step: 0, choice: c.answer });
    expect(res.body.outcome).toMatchObject({ correct: true, why: c.why });
    expect((await as.get('/me/games/tech').expect(200)).body.games.map((g: { id: string }) => g.id)).toEqual([...TECH_GAMES]);
    await http().get('/me/games/tech').expect(401);
  });
});
