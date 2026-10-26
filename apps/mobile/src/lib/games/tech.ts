import type { CircuitSlot, CodeOp, GridCell, LogicGate, RobotCard, TechGameId } from '@/lib/api';

import type { Place } from './lab';

/**
 * The Tech Hub (2.5D): a neon innovation hub the student walks around in a Knowzone hoodie, and its
 * stations. Positions are fractions of each scene picture. Art: apps/server/scripts/tech-art.ts.
 * The simulators below match the server's (apps/server/src/services/games/tech.ts): they animate
 * moves and let you test a circuit; the server's run decides.
 */
export type TechStation = 'code' | 'cyber' | 'robot' | 'vault' | 'circuit';

const img = {
  hub: require('@/assets/images/world/tech/scene-hub.webp'),
  code: require('@/assets/images/world/tech/scene-code.webp'),
  cyber: require('@/assets/images/world/tech/scene-cyber.webp'),
  robot: require('@/assets/images/world/tech/scene-robot.webp'),
  vault: require('@/assets/images/world/tech/scene-vault.webp'),
  circuit: require('@/assets/images/world/tech/scene-circuit.webp'),
};
export const TECH_SCENES: Record<TechStation | 'hub', number> = img;

export const TECH_SPRITES = {
  runner: { src: require('@/assets/images/world/tech/runner.webp'), aspect: 240 / 300 },
  robot: { src: require('@/assets/images/world/tech/robot.webp'), aspect: 227 / 300 },
  kitten: { src: require('@/assets/images/world/tech/kitten.webp'), aspect: 246 / 300 },
  crate: { src: require('@/assets/images/world/tech/crate.webp'), aspect: 290 / 300 },
  gem: { src: require('@/assets/images/world/tech/gem.webp'), aspect: 351 / 300 },
  flag: { src: require('@/assets/images/world/tech/flag.webp'), aspect: 213 / 300 },
};

export const CODER = {
  back: { src: require('@/assets/images/world/tech/student-back.webp'), aspect: 368 / 900 },
  walk: { src: require('@/assets/images/world/tech/student-walk.webp'), aspect: 406 / 900 },
  side: { src: require('@/assets/images/world/tech/student-side.webp'), aspect: 490 / 900 },
  front: { src: require('@/assets/images/world/tech/student-front.webp'), aspect: 360 / 900 },
};

export const TECH_STATIONS: Record<
  TechStation,
  { stand: [number, number]; label: [number, number]; icon: string; games: TechGameId[] }
> = {
  code: { stand: [0.28, 0.74], label: [0.14, 0.56], icon: 'code-slash', games: ['code-runner'] },
  cyber: { stand: [0.34, 0.6], label: [0.15, 0.3], icon: 'shield-checkmark', games: ['cyber-defender'] },
  vault: { stand: [0.5, 0.58], label: [0.58, 0.22], icon: 'keypad', games: ['binary-breaker'] },
  robot: { stand: [0.56, 0.68], label: [0.42, 0.46], icon: 'hardware-chip', games: ['robot-rescue'] },
  circuit: { stand: [0.52, 0.88], label: [0.84, 0.62], icon: 'flash', games: ['circuit-master'] },
};
export const TECH_STATION_OF: Record<TechGameId, TechStation> = {
  'code-runner': 'code',
  'cyber-defender': 'cyber',
  'binary-breaker': 'vault',
  'robot-rescue': 'robot',
  'circuit-master': 'circuit',
};

export const TECH_HUB: Place<TechStation> = {
  scene: img.hub,
  stations: TECH_STATIONS,
  walk: [
    [0.56, 0.32, 0.72],
    [0.72, 0.22, 0.64],
    [0.96, 0.06, 0.56],
  ],
  start: [0.36, 0.92],
  height: [0.4, 0.18],
  sprites: { back: CODER.back, walk: CODER.walk, side: CODER.side },
};

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
