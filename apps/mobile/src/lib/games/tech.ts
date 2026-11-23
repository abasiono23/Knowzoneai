import type { CircuitSlot, CodeOp, GridCell, LogicGate, RobotCard } from '@/lib/api';

/**
 * The Tech Hub's simulators match the server's (apps/server/src/services/games/tech.ts): they animate
 * moves and let you test a circuit; the server's run decides.
 */
/** The ten-level ladder (the server's services/games/*.ts has the same); levels 1–4 are open to everyone. */
export const MAX_LEVEL = 10;
export const OPEN_LEVELS = 4;

// ─── Simulators (same rules as the server) ────────────────────────────────────

const key = ([x, y]: GridCell) => `${x},${y}`;
/** Up, right, down, left (y grows downwards). */
export const STEP: GridCell[] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];
export type RunnerState = { x: number; y: number; dir: number };

export const blockCount = (ops: CodeOp[]): number =>
  ops.reduce((n, o) => n + 1 + (o.op === 'repeat' ? blockCount(o.body) : 0), 0);

export function runProgram(
  ops: CodeOp[],
  board: { tiles: GridCell[]; start: RunnerState; goal: GridCell; gems?: GridCell[] },
) {
  const tiles = new Set(board.tiles.map(key));
  const gems = new Set((board.gems ?? []).map(key));
  const got: string[] = [];
  let { x, y, dir } = board.start;
  const trail: RunnerState[] = [{ x, y, dir }];
  let steps = 0;
  let end = 'short' as 'goal' | 'fell' | 'short' | 'long';
  const exec = (list: CodeOp[]): boolean => {
    for (const o of list) {
      if (++steps > 300) {
        end = 'long';
        return false;
      }
      if (o.op === 'repeat') {
        for (let k = 0; k < o.times; k++) if (!exec(o.body)) return false;
        continue;
      }
      if (o.op === 'left') dir = (dir + 3) % 4;
      else if (o.op === 'right') dir = (dir + 1) % 4;
      else {
        const n = o.op === 'jump' ? 2 : 1;
        x += STEP[dir]![0] * n;
        y += STEP[dir]![1] * n;
        if (!tiles.has(key([x, y]))) {
          trail.push({ x, y, dir });
          end = 'fell';
          return false;
        }
        if (gems.has(key([x, y])) && !got.includes(key([x, y]))) got.push(key([x, y]));
      }
      trail.push({ x, y, dir });
      if (x === board.goal[0] && y === board.goal[1]) {
        end = 'goal';
        return false;
      }
    }
    return true;
  };
  exec(ops);
  return { end, trail, gems: got };
}

const DIRS = ['up', 'right', 'down', 'left'] as const;

export function runRobot(
  cards: RobotCard[],
  b: { w: number; h: number; blocked: GridCell[]; robot: GridCell; kitten: GridCell; home?: GridCell },
) {
  const blocked = new Set(b.blocked.map(key));
  let [x, y] = b.robot;
  let carrying = false;
  const trail: { x: number; y: number; carrying: boolean }[] = [{ x, y, carrying }];
  let end = 'short' as 'saved' | 'bump' | 'missed' | 'short';
  outer: for (const c of cards) {
    if ('op' in c) {
      if (c.op === 'pick') {
        if (carrying || x !== b.kitten[0] || y !== b.kitten[1]) {
          end = 'missed';
          break;
        }
        carrying = true;
        trail.push({ x, y, carrying });
        if (!b.home) {
          end = 'saved';
          break;
        }
      } else {
        if (!carrying || !b.home || x !== b.home[0] || y !== b.home[1]) {
          end = 'missed';
          break;
        }
        end = 'saved';
        break;
      }
      continue;
    }
    const [dx, dy] = STEP[DIRS.indexOf(c.dir)]!;
    for (let k = 0; k < c.n; k++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= b.w || ny >= b.h || blocked.has(key([nx, ny]))) {
        end = 'bump';
        break outer;
      }
      x = nx;
      y = ny;
      trail.push({ x, y, carrying });
    }
  }
  return { end, trail };
}

const apply = (g: LogicGate, a: number, b = 0) =>
  ({ AND: a & b, OR: a | b, NAND: 1 - (a & b), NOR: 1 - (a | b), XOR: a ^ b, NOT: 1 - a, WIRE: a })[g];

/** Every signal's value (inputs and slots) for one set of switches; missing gates give 0. */
export function evaluate(
  inputs: Record<string, number>,
  slots: CircuitSlot[],
  gates: Partial<Record<string, LogicGate>>,
) {
  const value: Record<string, number> = { ...inputs };
  for (const s of slots) {
    const g = gates[s.id];
    value[s.id] = g ? apply(g, value[s.from[0]!] ?? 0, value[s.from[1] ?? s.from[0]!] ?? 0) : 0;
  }
  return value;
}

/** The inputs for a truth-table row (counting up from all OFF). */
export const rowInputs = (names: string[], row: number) =>
  Object.fromEntries(names.map((name, i) => [name, (row >> (names.length - 1 - i)) & 1]));
