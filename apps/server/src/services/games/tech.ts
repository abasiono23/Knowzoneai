import { MORE_CYBER } from '../../data/tech/cyber-ladder.js';
import { CYBER, type CyberItem } from '../../data/tech/cyber.js';
import { random, type Answer, type Outcome, type Progress } from './english.js';

/**
 * The Tech Hub games (Technology & Computer Science). Like the other games, every run is built from a
 * seed and checked on the server: programs are run here, circuits are tested against every input.
 */
export const TECH_GAMES = ['code-runner', 'cyber-defender', 'robot-rescue', 'binary-breaker', 'circuit-master'] as const;
export type TechGame = (typeof TECH_GAMES)[number];
/**
 * The ten-level ladder, like the word games (services/games/english.ts): from binary basics and first
 * programs (levels 1–3) through exam computing (4–5), A-level and first-year topics (6–7: bitwise
 * logic, two's complement, nested loops, multi-gate circuits, web attacks) to upper-university and
 * specialist work (8–10: subnets, floating point, Gray code, four-input logic design, real security
 * incidents). Levels 1–5 keep the old content, so stars already won stay on the same level numbers.
 */
export const MAX_LEVEL = 10;
export const OPEN_LEVELS = 4;

type Rand = () => number;
function shuffle<T>(r: Rand, list: readonly T[]) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}
const pick = <T>(r: Rand, list: readonly T[]) => list[Math.floor(r() * list.length)]!;
const int = (r: Rand, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
const lvl = (level: number) => Math.min(MAX_LEVEL, Math.max(1, Math.round(level)));
/** A value from a per-level table (index 0 is level 1). */
const at = <T>(table: readonly T[], level: number) => table[lvl(level) - 1]!;
type Cell = [number, number];
const key = ([x, y]: Cell) => `${x},${y}`;
/** Up, right, down, left (y grows downwards). */
const STEP: Cell[] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

// ─── Code Runner ──────────────────────────────────────────────────────────────

export type Op = { op: 'move' | 'jump' | 'left' | 'right' } | { op: 'repeat'; times: number; body: Op[] };
export type Runner = { x: number; y: number; dir: number };

/** Blocks a program uses (a repeat counts as one, plus what's inside it). */
export const blockCount = (ops: Op[]): number => ops.reduce((n, o) => n + 1 + (o.op === 'repeat' ? blockCount(o.body) : 0), 0);

/**
 * Runs a program on a path of tiles. Move goes one tile forward, jump goes two (over a gap); stepping
 * where there's no tile is a fall. Stops on the goal. Gems are picked up where the runner lands.
 */
export function runProgram(ops: Op[], board: { tiles: Cell[]; start: Runner; goal: Cell; gems?: Cell[] }) {
  const tiles = new Set(board.tiles.map(key));
  const gems = new Set((board.gems ?? []).map(key));
  const got = new Set<string>();
  let { x, y, dir } = board.start;
  const trail: Runner[] = [{ x, y, dir }];
  let steps = 0;
  let end = 'short' as 'goal' | 'fell' | 'short' | 'long';
  const exec = (list: Op[]): boolean => {
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
        if (gems.has(key([x, y]))) got.add(key([x, y]));
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
  return { end, trail, gems: got.size };
}

/** Pieces a level's path is built from: a short run of instructions repeated a few times. */
function motif(r: Rand, level: number): Op[] {
  for (;;) {
    const len = int(r, 2, level >= 4 ? 5 : 4);
    const out: Op[] = [];
    let turn = 0;
    for (let i = 0; i < len; i++) {
      const last = out.at(-1)?.op;
      const turning = last !== 'left' && last !== 'right' && i > 0 && r() < 0.35;
      if (turning) {
        // Turns come in opposite pairs so the path keeps heading the same way overall.
        const t = turn === 0 ? pick(r, ['left', 'right'] as const) : turn > 0 ? 'left' : 'right';
        turn += t === 'right' ? 1 : -1;
        out.push({ op: t });
      } else out.push({ op: level >= 2 && r() < 0.3 ? 'jump' : 'move' });
    }
    if (turn !== 0) out.push({ op: turn > 0 ? 'left' : 'right' }, { op: 'move' });
    if (out.some((o) => o.op === 'move' || o.op === 'jump')) return out;
  }
}

/** Lays out the tiles the program walks on (and the gaps it jumps); false if the path crosses itself. */
function layOut(program: Op[], start: Runner) {
  const flat: Op[] = [];
  const unroll = (list: Op[]) => list.forEach((o) => (o.op === 'repeat' ? Array.from({ length: o.times }, () => unroll(o.body)) : flat.push(o)));
  unroll(program);
  let { x, y, dir } = start;
  const tiles: Cell[] = [[x, y]];
  const used = new Set([key([x, y])]);
  for (const o of flat) {
    if (o.op === 'left') dir = (dir + 3) % 4;
    else if (o.op === 'right') dir = (dir + 1) % 4;
    else {
      if (o.op === 'jump') {
        x += STEP[dir]![0];
        y += STEP[dir]![1];
        if (used.has(key([x, y]))) return null;
        used.add(key([x, y])); // the gap: nothing may be built here
      }
      x += STEP[dir]![0];
      y += STEP[dir]![1];
      if (used.has(key([x, y]))) return null;
      used.add(key([x, y]));
      tiles.push([x, y]);
    }
  }
  return { tiles, goal: [x, y] as Cell };
}

/** Code Runner by level: puzzles per run, extra blocks allowed over the planned program, biggest board. */
const CODE = {
  puzzles: [4, 4, 4, 4, 4, 4, 5, 5, 5, 5],
  slack: [2, 2, 1, 1, 1, 1, 0, 0, 0, 0],
  board: [10, 10, 10, 10, 10, 12, 12, 12, 14, 14],
};

/** A loop with a loop inside it (levels 6 and up): the inner loop is a straight run, the outer adds turns. */
function nested(r: Rand, level: number): Op {
  const inner: Op = { op: 'repeat', times: int(r, 2, 3), body: [{ op: level >= 8 && r() < 0.4 ? 'jump' : 'move' }] };
  const turn: Op = { op: pick(r, ['left', 'right'] as const) };
  const back: Op = { op: turn.op === 'left' ? 'right' : 'left' };
  // A staircase: run, turn, step, turn back.
  return { op: 'repeat', times: int(r, 2, 3), body: [inner, turn, { op: 'move' }, back] };
}

function codePuzzle(level: number, r: Rand) {
  for (;;) {
    const start: Runner = { x: 0, y: 0, dir: 1 };
    let solution: Op[];
    if (level === 1) solution = Array.from({ length: int(r, 2, 3) }, () => motif(r, 1)).flat();
    else if (level === 2) solution = Array.from({ length: 3 }, () => motif(r, 2)).flat();
    else if (level < 5) solution = [{ op: 'repeat', times: int(r, 3, 4), body: motif(r, level) }];
    else if (level === 5)
      solution = [
        { op: 'repeat', times: int(r, 2, 3), body: motif(r, level) },
        { op: 'repeat', times: int(r, 2, 3), body: motif(r, level) },
      ];
    else if (level <= 7) solution = [...motif(r, 4).slice(0, 2), nested(r, level)];
    else solution = [nested(r, level), { op: 'repeat', times: int(r, 2, 3), body: motif(r, level) }, ...(level >= 10 ? [nested(r, level)] : [])];
    const laid = layOut(solution, start);
    if (!laid || laid.tiles.length < 4) continue;
    // Normalise to positive coordinates.
    const minX = Math.min(...laid.tiles.map((t) => t[0]));
    const minY = Math.min(...laid.tiles.map((t) => t[1]));
    const shift = (c: Cell): Cell => [c[0] - minX, c[1] - minY];
    const tiles = laid.tiles.map(shift);
    const size = at(CODE.board, level);
    if (Math.max(...tiles.map((t) => t[0])) >= size || Math.max(...tiles.map((t) => t[1])) >= size) continue;
    const gems = shuffle(r, tiles.slice(1, -1)).slice(0, Math.min(3, Math.floor(tiles.length / 3)));
    const blocks = blockCount(solution);
    return {
      tiles,
      gems,
      start: { x: start.x - minX, y: start.y - minY, dir: start.dir },
      goal: shift(laid.goal),
      maxBlocks: blocks + at(CODE.slack, level),
      ops: [...(level >= 2 ? ['move', 'jump', 'left', 'right'] : ['move', 'left', 'right']), ...(level >= 3 ? ['repeat'] : [])],
      solution,
    };
  }
}

// ─── Robot Rescue ─────────────────────────────────────────────────────────────

export type Card = { dir: 'up' | 'right' | 'down' | 'left'; n: number } | { op: 'pick' | 'drop' };
const DIRS = ['up', 'right', 'down', 'left'] as const;

type RescueBoard = { w: number; h: number; blocked: Cell[]; robot: Cell; kitten: Cell; home?: Cell };

/** Runs the robot's cards. It stops at walls; it must pick up the kitten (and drop it home, if there is one). */
export function runRobot(cards: Card[], b: RescueBoard) {
  const blocked = new Set(b.blocked.map(key));
  let [x, y] = b.robot;
  let carrying = false;
  let saved = false;
  const trail: Cell[] = [[x, y]];
  let end = 'short' as 'saved' | 'bump' | 'missed' | 'short';
  outer: for (const c of cards) {
    if ('op' in c) {
      if (c.op === 'pick') {
        if (carrying || x !== b.kitten[0] || y !== b.kitten[1]) {
          end = 'missed';
          break;
        }
        carrying = true;
        if (!b.home) {
          saved = true;
          break;
        }
      } else {
        if (!carrying || !b.home || x !== b.home[0] || y !== b.home[1]) {
          end = 'missed';
          break;
        }
        saved = true;
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
      trail.push([x, y]);
    }
  }
  if (saved) end = 'saved';
  return { end, trail };
}

/** Fewest cards from one cell to another (a card is a straight run), or null if there's no way. */
function fewestCards(b: RescueBoard, from: Cell, to: Cell) {
  const blocked = new Set(b.blocked.map(key));
  const best = new Map<string, number>();
  const queue: [Cell, number, number][] = [[from, -1, 0]];
  while (queue.length) {
    queue.sort((p, q) => p[2] - q[2]);
    const [[x, y], d, cost] = queue.shift()!;
    if (x === to[0] && y === to[1]) return cost;
    const k = `${x},${y},${d}`;
    if ((best.get(k) ?? Infinity) <= cost) continue;
    best.set(k, cost);
    for (let nd = 0; nd < 4; nd++) {
      const nx = x + STEP[nd]![0];
      const ny = y + STEP[nd]![1];
      if (nx < 0 || ny < 0 || nx >= b.w || ny >= b.h || blocked.has(key([nx, ny]))) continue;
      queue.push([[nx, ny], nd, cost + (nd === d ? 0 : 1)]);
    }
  }
  return null;
}

/** Robot Rescue by level: board size, spare cards over the shortest programme, and the shortest route. */
const RESCUE = {
  size: [5, 5, 6, 6, 7, 7, 8, 8, 9, 9],
  spare: [4, 4, 2, 2, 2, 1, 1, 0, 0, 0],
  /** The fewest turns (cards) the shortest route may take. */
  minCards: [2, 3, 3, 4, 4, 5, 6, 7, 8, 9],
  puzzles: [3, 3, 3, 3, 3, 3, 4, 4, 4, 4],
};

function rescuePuzzle(level: number, r: Rand) {
  const size = at(RESCUE.size, level);
  for (let tries = 0; ; tries++) {
    const cells: Cell[] = [];
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) cells.push([x, y]);
    const [robot, kitten, home] = shuffle(r, cells);
    const blocked = shuffle(
      r,
      cells.filter((c) => c !== robot && c !== kitten && c !== home),
    ).slice(0, Math.floor(cells.length * Math.min(0.36, 0.18 + level * 0.025)));
    const carry = level >= 3;
    const board: RescueBoard = { w: size, h: size, blocked, robot: robot!, kitten: kitten!, ...(carry && { home: home! }) };
    const there = fewestCards(board, robot!, kitten!);
    const back = carry ? fewestCards(board, kitten!, home!) : 0;
    // A winding route at higher levels (eased off if a board takes too long to find).
    const need = Math.max(2, at(RESCUE.minCards, level) - Math.floor(tries / 400));
    if (there === null || back === null || there + back < need) continue;
    const best = there + back + (carry ? 2 : 1);
    // Water and crates are just looks: both block the robot.
    const kinds = blocked.map(() => (r() < 0.5 ? 'crate' : 'water'));
    return { ...board, kinds, best, maxCards: best + at(RESCUE.spare, level) };
  }
}

// ─── Binary Breaker ───────────────────────────────────────────────────────────

const toBits = (n: number, bits: number) => Array.from({ length: bits }, (_, i) => Math.floor(n / 2 ** (bits - 1 - i)) % 2);
const fromBits = (b: number[]) => b.reduce((n, d) => n * 2 + d, 0);
const hex = (n: number, digits: number) => n.toString(16).toUpperCase().padStart(digits, '0');
/** Two's complement: the bit pattern of a (possibly negative) number. */
const wrap = (n: number, bits: number) => ((n % 2 ** bits) + 2 ** bits) % 2 ** bits;
const signed = (n: number, bits: number) => (n >= 2 ** (bits - 1) ? n - 2 ** bits : n);
const dotted = (n: number) => [24, 16, 8, 0].map((sh) => Math.floor(n / 2 ** sh) % 256).join('.');

/**
 * Vault kinds. "Set" kinds are answered by switching bits on and off; the others by choosing from
 * `options`. Every answer is worked out here.
 *   set: a number → its bits             read: bits → the number           add: a + b → bits
 *   ascii: bits → the letter             hex: a hex number → bits           signed: bits → signed value
 *   and / or / xor: a ∘ b → bits         shl / shr: a shifted → bits        neg: −n in two's complement
 *   sub: x − y in two's complement       hosts: usable hosts in a /p subnet
 *   network: network address of an IPv4 address   hamming: bits that differ   gray: n → Gray code
 *   float: a 16-bit IEEE 754 half-precision pattern → its value
 */
export type VaultType =
  | 'set'
  | 'read'
  | 'add'
  | 'ascii'
  | 'hex'
  | 'signed'
  | 'and'
  | 'or'
  | 'xor'
  | 'shl'
  | 'shr'
  | 'neg'
  | 'sub'
  | 'hosts'
  | 'network'
  | 'hamming'
  | 'gray'
  | 'float';
/** Kinds answered by setting bits. */
export const SET_TYPES: VaultType[] = ['set', 'add', 'hex', 'and', 'or', 'xor', 'shl', 'shr', 'neg', 'sub', 'gray'];

/** Kinds, switch count and vaults per run, by level. */
const VAULTS: { bits: number; types: VaultType[]; count: number }[] = [
  { bits: 4, types: ['set', 'read'], count: 5 },
  { bits: 6, types: ['set', 'read'], count: 5 },
  { bits: 8, types: ['set', 'read', 'add'], count: 5 },
  { bits: 8, types: ['read', 'add', 'ascii', 'hex'], count: 5 },
  { bits: 8, types: ['hex', 'signed', 'add', 'ascii'], count: 6 },
  { bits: 8, types: ['and', 'or', 'xor', 'shl', 'signed'], count: 6 },
  { bits: 8, types: ['neg', 'sub', 'xor', 'shr', 'hex'], count: 6 },
  { bits: 8, types: ['hosts', 'network', 'sub', 'gray', 'hamming'], count: 7 },
  { bits: 8, types: ['network', 'hamming', 'gray', 'neg', 'float'], count: 7 },
  { bits: 8, types: ['float', 'network', 'hamming', 'sub', 'gray'], count: 8 },
];

/** Different wrong options near the right one (the likely slips first). */
function nearMisses(r: Rand, right: string, candidates: string[], fill: () => string, count: number) {
  const wrong = new Set<string>();
  for (const c of candidates) if (c !== right && wrong.size < count) wrong.add(c);
  for (let k = 0; wrong.size < count && k < 200; k++) {
    const c = fill();
    if (c !== right) wrong.add(c);
  }
  return shuffle(r, [...wrong]);
}

function vault(level: number, r: Rand, k: number) {
  const spec = at(VAULTS, level);
  const type = spec.types[k % spec.types.length]!;
  const bits = type === 'hex' && level >= 7 ? 12 : type === 'float' ? 16 : spec.bits;
  const max = 2 ** bits - 1;
  const count = level >= 8 ? 4 : 3;
  const choice = (answer: string, slips: string[], fill: () => string, extra: Record<string, unknown>) => ({
    type,
    bits,
    ...extra,
    answer,
    options: shuffle(r, [answer, ...nearMisses(r, answer, slips, fill, count)]),
  });
  const set = (n: number, extra: Record<string, unknown>) => ({ type, bits, ...extra, answer: String(wrap(n, bits)) });
  switch (type) {
    case 'read': {
      const n = int(r, 1, max);
      const slips = [n + 1, n - 1, n ^ 1, n ^ 2, n * 2, Math.floor(n / 2), fromBits(toBits(n, bits).reverse())].filter((v) => v >= 0 && v <= max);
      return choice(String(n), shuffle(r, slips).map(String), () => String(int(r, 1, max)), { shown: toBits(n, bits) });
    }
    case 'ascii': {
      const code = int(r, 65, 90);
      const letter = String.fromCharCode(code);
      const slips = [code + 1, code - 1, code + 32, code ^ 2].filter((c) => c >= 65 && c <= 90).map((c) => String.fromCharCode(c));
      return choice(letter, slips, () => String.fromCharCode(int(r, 65, 90)), { shown: toBits(code, 8) });
    }
    case 'signed': {
      const n = int(r, 129, 254);
      const v = signed(n, 8);
      return choice(String(v), [String(n), String(-v), String(-(n & 127)), String(v + 1), String(v - 1)], () => String(int(r, -128, -1)), { shown: toBits(n, 8) });
    }
    case 'add': {
      const a = int(r, 1, Math.floor(max / 2));
      const b = int(r, 1, max - a);
      return set(a + b, { a: toBits(a, bits), b: toBits(b, bits) });
    }
    case 'hex': {
      const n = int(r, 16, max);
      return set(n, { hex: hex(n, bits / 4) });
    }
    case 'and':
    case 'or':
    case 'xor': {
      const a = int(r, 1, max);
      const b = int(r, 1, max);
      return set(type === 'and' ? a & b : type === 'or' ? a | b : a ^ b, { a: toBits(a, bits), b: toBits(b, bits) });
    }
    case 'shl':
    case 'shr': {
      const a = int(r, 1, max);
      const n = int(r, 1, 3);
      return set(type === 'shl' ? (a << n) & max : a >> n, { a: toBits(a, bits), n });
    }
    case 'neg': {
      const n = int(r, 2, 120);
      return set(-n, { n });
    }
    case 'sub': {
      const x = int(r, 1, 100);
      const y = int(r, x + 1, 127);
      return set(x - y, { x, y });
    }
    case 'gray': {
      const n = int(r, 5, max);
      return set(n ^ (n >> 1), { n });
    }
    case 'hamming': {
      const a = int(r, 1, max);
      const flips = int(r, 2, 6);
      let b = a;
      for (const i of shuffle(r, Array.from({ length: bits }, (_, j) => j)).slice(0, flips)) b ^= 1 << i;
      const slips = [flips - 1, flips + 1, flips + 2, bits - flips, flips - 2].filter((x) => x >= 0 && x <= bits).map(String);
      return choice(String(flips), slips, () => String(int(r, 0, bits)), { a: toBits(a, bits), b: toBits(b, bits) });
    }
    case 'hosts': {
      const p = int(r, 22, 30);
      const n = 2 ** (32 - p) - 2;
      return choice(String(n), [String(n + 2), String(2 ** (31 - p)), String(2 ** (33 - p) - 2), String(n - 1)], () => String(2 ** int(r, 2, 10)), { prefix: p });
    }
    case 'network': {
      // From level 10 the prefix can fall inside the third octet too.
      const p = level >= 10 ? pick(r, [19, 20, 21, 22, 23, 26, 27, 28, 29]) : pick(r, [25, 26, 27, 28, 29]);
      const ip = [pick(r, [10, 172, 192]), int(r, 0, 255), int(r, 0, 255), int(r, 1, 254)];
      const addr = ip.reduce((n, o) => n * 256 + o, 0);
      const size = 2 ** (32 - p);
      const net = Math.floor(addr / size) * size;
      const slips = [dotted(net + size - 1), dotted(Math.floor(addr / 256) * 256), dotted(net + 1), dotted(Math.floor(addr / (size / 2)) * (size / 2)), dotted(Math.floor(addr / (size * 2)) * size * 2)];
      return choice(dotted(net), slips, () => dotted(net + int(r, 1, 3) * size), { address: `${ip.join('.')}/${p}` });
    }
    case 'float': {
      // ±(1 + f/1024) × 2^(e − 15) with a short fraction, so the value is exact.
      const sign = r() < 0.4 ? 1 : 0;
      const e = int(r, 11, 20);
      const f = pick(r, [0, 128, 256, 384, 512, 640, 768, 896]);
      const s = sign ? -1 : 1;
      const value = s * (1 + f / 1024) * 2 ** (e - 15);
      const pattern = sign * 2 ** 15 + e * 2 ** 10 + f;
      const show = (v: number) => String(Number(v.toPrecision(6)));
      const slips = [show(-value), show(s * (f / 1024) * 2 ** (e - 15)), show(s * (1 + f / 1024) * 2 ** (e - 16)), show(s * (1 + f / 1024) * 2 ** e), show(value * 2)];
      return choice(show(value), slips, () => show(value * pick(r, [4, 0.25, 8, 0.125])), { shown: toBits(pattern, 16) });
    }
    default: {
      const n = int(r, 1, max);
      return set(n, { target: n });
    }
  }
}

// ─── Circuit Master ───────────────────────────────────────────────────────────

export type Gate = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'WIRE';
/** A slot takes two signals (binary gates) or one (NOT, or a plain wire). Sources are inputs or other slots. */
type Slot = { id: string; kind: 'binary' | 'unary'; from: string[] };
const BINARY: Gate[] = ['AND', 'OR', 'NAND', 'NOR', 'XOR'];
const apply = (g: Gate, a: number, b = 0) =>
  ({ AND: a & b, OR: a | b, NAND: 1 - (a & b), NOR: 1 - (a | b), XOR: a ^ b, NOT: 1 - a, WIRE: a })[g];

/** The output for every combination of inputs (A, B[, C]) counting up from all OFF. */
export function truthTable(inputs: string[], slots: Slot[], out: string, gates: Record<string, Gate>) {
  return Array.from({ length: 2 ** inputs.length }, (_, row) => {
    const value: Record<string, number> = Object.fromEntries(inputs.map((name, i) => [name, (row >> (inputs.length - 1 - i)) & 1]));
    for (const s of slots) value[s.id] = apply(gates[s.id]!, value[s.from[0]!]!, value[s.from[1] ?? s.from[0]!]!);
    return value[out]!;
  });
}

/** Topologies by level: which slots, fed from which inputs (one or two to choose from per level). */
const b = (id: string, from: string[]): Slot => ({ id, kind: 'binary', from });
const u = (id: string, from: string): Slot => ({ id, kind: 'unary', from: [from] });
const LAYOUTS: { inputs: string[]; slots: Slot[] }[][] = [
  [{ inputs: ['A', 'B'], slots: [b('g1', ['A', 'B'])] }],
  [{ inputs: ['A', 'B'], slots: [u('u1', 'A'), b('g1', ['u1', 'B'])] }],
  [
    { inputs: ['A', 'B'], slots: [b('g1', ['A', 'B']), u('u1', 'g1')] },
    { inputs: ['A', 'B'], slots: [u('u1', 'B'), b('g1', ['A', 'u1'])] },
  ],
  [{ inputs: ['A', 'B', 'C'], slots: [b('g1', ['A', 'B']), b('g2', ['g1', 'C'])] }],
  [
    { inputs: ['A', 'B'], slots: [b('g1', ['A', 'B']), b('g2', ['A', 'B']), b('g3', ['g1', 'g2'])] },
    { inputs: ['A', 'B', 'C'], slots: [u('u1', 'C'), b('g1', ['A', 'B']), b('g2', ['g1', 'u1'])] },
  ],
  [
    { inputs: ['A', 'B', 'C'], slots: [b('g1', ['A', 'B']), b('g2', ['B', 'C']), b('g3', ['g1', 'g2'])] },
    { inputs: ['A', 'B', 'C'], slots: [u('u1', 'A'), b('g1', ['u1', 'B']), b('g2', ['g1', 'C'])] },
  ],
  [
    { inputs: ['A', 'B', 'C'], slots: [u('u1', 'A'), b('g1', ['u1', 'B']), b('g2', ['B', 'C']), b('g3', ['g1', 'g2'])] },
    { inputs: ['A', 'B', 'C'], slots: [b('g1', ['A', 'B']), b('g2', ['A', 'C']), b('g3', ['g1', 'g2']), u('u1', 'g3')] },
  ],
  [{ inputs: ['A', 'B', 'C'], slots: [b('g1', ['A', 'B']), b('g2', ['B', 'C']), b('g3', ['A', 'C']), b('g4', ['g1', 'g2']), b('g5', ['g4', 'g3'])] }],
  [
    { inputs: ['A', 'B', 'C', 'D'], slots: [b('g1', ['A', 'B']), b('g2', ['C', 'D']), b('g3', ['g1', 'g2'])] },
    { inputs: ['A', 'B', 'C'], slots: [u('u1', 'A'), b('g1', ['u1', 'B']), b('g2', ['A', 'C']), b('g3', ['g1', 'g2']), b('g4', ['g3', 'C'])] },
  ],
  [
    { inputs: ['A', 'B', 'C', 'D'], slots: [b('g1', ['A', 'B']), b('g2', ['C', 'D']), b('g3', ['g1', 'C']), b('g4', ['g2', 'g3']), u('u1', 'g4')] },
    { inputs: ['A', 'B', 'C', 'D'], slots: [b('g1', ['A', 'B']), b('g2', ['B', 'C']), b('g3', ['C', 'D']), b('g4', ['g1', 'g2']), b('g5', ['g4', 'g3'])] },
  ],
];
const ALL_GATES: Gate[] = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR'];
const GATES_BY_LEVEL: Gate[][] = [
  ['AND', 'OR'],
  ['AND', 'OR', 'NOT'],
  ['AND', 'OR', 'NOT'],
  ['AND', 'OR', 'NOT', 'NAND', 'NOR'],
  ALL_GATES,
  ALL_GATES,
  ALL_GATES,
  ALL_GATES,
  ALL_GATES,
  ALL_GATES,
];
/** Circuits per run, and whether the board shows the bulb's output for each row as you build (easier levels). */
const CIRCUITS = { puzzles: [3, 3, 3, 3, 3, 3, 4, 4, 4, 4], preview: 6 };

/** Every input changes the output somewhere (no input is wired in for nothing). */
function usesEveryInput(inputs: string[], target: number[]) {
  return inputs.every((_, i) => {
    const bit = 2 ** (inputs.length - 1 - i);
    return target.some((v, row) => (row & bit) === 0 && target[row | bit] !== v);
  });
}

function circuitPuzzle(level: number, r: Rand) {
  const gates = at(GATES_BY_LEVEL, level);
  for (;;) {
    const layout = pick(r, at(LAYOUTS, level));
    const solution: Record<string, Gate> = Object.fromEntries(
      layout.slots.map((s) => [s.id, s.kind === 'unary' ? pick(r, ['NOT', 'NOT', 'WIRE'] as Gate[]) : pick(r, BINARY.filter((g) => gates.includes(g)))]),
    );
    const out = layout.slots.at(-1)!.id;
    const target = truthTable(layout.inputs, layout.slots, out, solution);
    // Always on or always off isn't a puzzle; from level 6 every input must matter.
    if (target.every((v) => v === target[0])) continue;
    if (level >= 6 && !usesEveryInput(layout.inputs, target)) continue;
    return { inputs: layout.inputs, slots: layout.slots, out, gates, target, preview: level <= CIRCUITS.preview, solution };
  }
}

// ─── Building runs ────────────────────────────────────────────────────────────

/** Cyber Defender: cases per run and seconds per case (attack and code cases take longer to read). */
const CYBER_STEPS = [8, 8, 8, 8, 8, 10, 10, 10, 10, 10];
const CYBER_SECONDS = [30, 28, 26, 24, 24, 40, 40, 45, 45, 50];
export const ALL_CYBER: CyberItem[] = [...CYBER, ...MORE_CYBER];

/** A level's cases: its own first, then the levels just below (never above). */
export function cyberPool(level: number) {
  const L = lvl(level);
  const pool: CyberItem[] = [];
  for (let l = L; l >= 1 && pool.length < 2 * at(CYBER_STEPS, L); l--) pool.push(...ALL_CYBER.filter((c) => c.level === l));
  return pool;
}

function build(game: TechGame, level: number, r: Rand) {
  const L = lvl(level);
  switch (game) {
    case 'code-runner':
      return { kind: game, puzzles: Array.from({ length: at(CODE.puzzles, L) }, () => codePuzzle(L, r)) };
    case 'robot-rescue':
      return { kind: game, puzzles: Array.from({ length: at(RESCUE.puzzles, L) }, () => rescuePuzzle(L, r)) };
    case 'binary-breaker':
      return { kind: game, vaults: shuffle(r, Array.from({ length: at(VAULTS, L).count }, (_, k) => vault(L, r, k))) };
    case 'circuit-master':
      return { kind: game, puzzles: Array.from({ length: at(CIRCUITS.puzzles, L) }, () => circuitPuzzle(L, r)) };
    case 'cyber-defender': {
      const pool = cyberPool(L);
      const own = shuffle(r, pool.filter((c) => c.level === L));
      const rest = shuffle(r, pool.filter((c) => c.level !== L));
      const items = shuffle(r, [...own, ...rest].slice(0, at(CYBER_STEPS, L)));
      return {
        kind: game,
        seconds: at(CYBER_SECONDS, L),
        items: items.map((c) => c.id),
        // The options of attack and defence cases, in this run's order.
        order: Object.fromEntries(items.filter((c) => c.options).map((c) => [c.id, shuffle(r, c.options!)])),
      };
    }
  }
}

export type TechPuzzle =
  | { kind: 'code-runner'; puzzles: ReturnType<typeof codePuzzle>[] }
  | { kind: 'robot-rescue'; puzzles: ReturnType<typeof rescuePuzzle>[] }
  | { kind: 'binary-breaker'; vaults: ReturnType<typeof vault>[] }
  | { kind: 'circuit-master'; puzzles: ReturnType<typeof circuitPuzzle>[] }
  | { kind: 'cyber-defender'; seconds: number; items: string[]; order?: Record<string, string[]> };
export type TechState = { puzzle: TechPuzzle; progress: Progress };

export function buildTechPuzzle(game: TechGame, level: number, seed: string): TechPuzzle {
  return build(game, level, random(`${game}:${level}:${seed}`)) as TechPuzzle;
}

export function techStepCount(p: TechPuzzle) {
  switch (p.kind) {
    case 'code-runner':
    case 'robot-rescue':
    case 'circuit-master':
      return p.puzzles.length;
    case 'binary-breaker':
      return p.vaults.length;
    case 'cyber-defender':
      return p.items.length;
  }
}

const cyber = (id: string) => ALL_CYBER.find((c) => c.id === id)!;
/** A case's choices: a verdict pair, or (attacks and defences) its own options in this run's order. */
const choicesOf = (c: CyberItem, order?: Record<string, string[]>) =>
  c.options ? (order?.[c.id] ?? c.options) : c.kind === 'password' ? ['weak', 'strong'] : c.kind === 'situation' ? ['risky', 'safe'] : ['phishing', 'safe'];

// ─── What the app sees ────────────────────────────────────────────────────────

export function techPublicState({ puzzle: p, progress }: TechState) {
  const results = progress.results;
  const tries = (i: number) => progress.tries?.[i] ?? 0;
  switch (p.kind) {
    case 'code-runner':
      return {
        puzzles: p.puzzles.map(({ solution, ...x }, i) => ({ id: i, ...x, tries: tries(i), ...(results[i] && { result: { ...results[i], solution } }) })),
      };
    case 'robot-rescue':
      return {
        puzzles: p.puzzles.map((x, i) => ({ id: i, ...x, tries: tries(i), ...(results[i] && { result: results[i] }) })),
      };
    case 'circuit-master':
      return {
        puzzles: p.puzzles.map(({ solution, ...x }, i) => ({ id: i, ...x, tries: tries(i), ...(results[i] && { result: { ...results[i], solution } }) })),
      };
    case 'binary-breaker':
      return {
        vaults: p.vaults.map(({ answer, ...x }, i) => ({ id: i, ...x, ...(results[i] && { result: { ...results[i], answer } }) })),
      };
    case 'cyber-defender':
      return {
        seconds: p.seconds,
        items: p.items.map((id, i) => {
          const { answer, why, level: _level, options: _options, ...c } = cyber(id);
          return { ...c, id: i, options: choicesOf(cyber(id), p.order), ...(results[i] && { result: { ...results[i], answer, why } }) };
        }),
      };
  }
}

// ─── Checking ─────────────────────────────────────────────────────────────────

export type TechAnswer = Answer & { program?: Op[]; cards?: Card[]; bits?: number[]; gates?: Record<string, string> };

/** Points for a puzzle solved after some failed tries (fewer for each). */
const triedPoints = (tries: number) => Math.max(40, 100 - 20 * tries);
const retry = (reveal: Record<string, unknown>, tries: number): Outcome & { store: Record<string, unknown> } => ({
  correct: false,
  points: 0,
  heartLost: false,
  retry: true,
  advance: false,
  reveal,
  store: { tries: tries + 1 },
});

export function techCheck({ puzzle: p, progress }: TechState, a: TechAnswer): Outcome & { store?: Record<string, unknown> } {
  const at = progress.at;
  const tries = progress.tries?.[at] ?? 0;
  const giveUp: Outcome = { correct: false, points: 0, heartLost: false, advance: true, reveal: {} };
  switch (p.kind) {
    case 'code-runner': {
      const x = p.puzzles[at]!;
      if (a.timeout) return { ...giveUp, reveal: { solution: x.solution } };
      const program = a.program ?? [];
      const allowed = new Set(x.ops);
      const valid = (list: Op[], depth: number): boolean =>
        list.every((o) => allowed.has(o.op) && (o.op !== 'repeat' || (depth < 2 && o.times >= 2 && o.times <= 9 && valid(o.body, depth + 1))));
      if (!valid(program, 0)) return retry({ end: 'invalid' }, tries);
      if (blockCount(program) > x.maxBlocks) return retry({ end: 'blocks' }, tries);
      const run = runProgram(program, x);
      if (run.end !== 'goal') return retry({ end: run.end }, tries);
      return { correct: true, points: triedPoints(tries) + run.gems * 10, heartLost: false, advance: true, reveal: { end: 'goal', gems: run.gems } };
    }
    case 'robot-rescue': {
      const x = p.puzzles[at]!;
      if (a.timeout) return giveUp;
      const cards = (a.cards ?? []).slice(0, x.maxCards);
      if (!a.cards?.length || a.cards.length > x.maxCards) return retry({ end: 'cards' }, tries);
      const run = runRobot(cards, x);
      if (run.end !== 'saved') return retry({ end: run.end }, tries);
      // A bonus for the shortest programme.
      return { correct: true, points: triedPoints(tries) + (cards.length <= x.best ? 20 : 0), heartLost: false, advance: true, reveal: { end: 'saved', best: x.best } };
    }
    case 'circuit-master': {
      const x = p.puzzles[at]!;
      if (a.timeout) return { ...giveUp, reveal: { solution: x.solution } };
      const g = a.gates ?? {};
      const ok = x.slots.every((s) => (s.kind === 'unary' ? g[s.id] === 'NOT' || g[s.id] === 'WIRE' : x.gates.includes(g[s.id] as Gate) && g[s.id] !== 'NOT'));
      if (!ok) return retry({ end: 'invalid' }, tries);
      const table = truthTable(x.inputs, x.slots, x.out, g as Record<string, Gate>);
      const wrongRows = table.flatMap((v, row) => (v === x.target[row] ? [] : [row]));
      if (wrongRows.length) return retry({ end: 'wrong', table, wrongRows }, tries);
      return { correct: true, points: triedPoints(tries), heartLost: false, advance: true, reveal: { end: 'lit', table } };
    }
    case 'binary-breaker': {
      const v = p.vaults[at]!;
      const given = SET_TYPES.includes(v.type as VaultType) ? (a.bits && a.bits.length === v.bits && a.bits.every((b) => b === 0 || b === 1) ? String(fromBits(a.bits)) : null) : (a.choice ?? null);
      const correct = !a.timeout && given === v.answer;
      const combo = correct ? Math.min(progress.streak + 1, 5) : 0;
      return { correct, points: correct ? 100 + 20 * (combo - 1) : 0, heartLost: !correct, advance: true, reveal: { answer: v.answer, combo } };
    }
    case 'cyber-defender': {
      const c = cyber(p.items[at]!);
      const correct = !a.timeout && a.choice === c.answer;
      const combo = correct ? Math.min(progress.streak + 1, 5) : 0;
      return { correct, points: correct ? 100 + 20 * (combo - 1) : 0, heartLost: !correct, advance: true, reveal: { answer: c.answer, why: c.why, combo } };
    }
  }
}

export function techIsOver({ puzzle: p, progress }: TechState, hearts: number) {
  const puzzles = p.kind === 'code-runner' || p.kind === 'robot-rescue' || p.kind === 'circuit-master';
  return (!puzzles && hearts <= 0) || progress.at >= techStepCount(p);
}

export function techStars({ puzzle: p, progress }: TechState) {
  const results = Object.values(progress.results);
  const right = results.filter((x) => x.correct).length;
  const total = techStepCount(p);
  if (p.kind === 'code-runner' || p.kind === 'robot-rescue' || p.kind === 'circuit-master') {
    const points = results.reduce((s, x) => s + x.points, 0);
    return right === total && points >= total * 80 ? 3 : right >= total - 1 ? 2 : right >= 1 ? 1 : 0;
  }
  const share = right / total;
  return share >= 0.85 ? 3 : share >= 0.6 ? 2 : share >= 0.3 ? 1 : 0;
}

const opText = (ops: Op[]): string => ops.map((o) => (o.op === 'repeat' ? `repeat ${o.times} { ${opText(o.body)} }` : o.op)).join(', ');

/** What Kora needs to help on the current step (Kora is told to guide, not to give the answer away). */
export function techHelpContext({ puzzle: p, progress }: TechState) {
  const at = Math.min(progress.at, techStepCount(p) - 1);
  switch (p.kind) {
    case 'code-runner': {
      const x = p.puzzles[at]!;
      return `Coding puzzle: guide a runner along a path of tiles with blocks (move = 1 tile forward, jump = 2 tiles over a gap, left/right = turn on the spot, repeat N = loop). At most ${x.maxBlocks} blocks. A working program: ${opText(x.solution)}. Explain how to spot the repeating pattern; don't give the whole program.`;
    }
    case 'robot-rescue': {
      const x = p.puzzles[at]!;
      return `Robot programming puzzle on a ${x.w}x${x.h} grid (x right, y down). Robot at ${key(x.robot)}, kitten at ${key(x.kitten)}${x.home ? `, home pad at ${key(x.home)} (pick the kitten up, bring it home, drop it)` : ' (go there and pick it up)'}. Blocked cells: ${x.blocked.map(key).join(' ')}. Cards move the robot up/down/left/right N steps. The shortest programme uses ${x.best} cards. Hint at a route, not the full card list.`;
    }
    case 'circuit-master': {
      const x = p.puzzles[at]!;
      return `Logic circuit puzzle. Inputs ${x.inputs.join(', ')}; slots ${x.slots.map((s) => `${s.id} (${s.kind}, from ${s.from.join(' and ')})`).join('; ')}; the bulb is ${x.out}. Gates available: ${x.gates.join(', ')} (unary slots: NOT or a plain wire). Target output for each input combination counting up from all OFF: ${x.target.join(' ')}. One working choice: ${JSON.stringify(x.solution)}. Explain how to read the truth table; don't give the gates outright.`;
    }
    case 'binary-breaker': {
      const v = p.vaults[at]!;
      return `Binary puzzle (${v.type}) with ${v.bits} bits (place values ${Array.from({ length: v.bits }, (_, i) => 2 ** (v.bits - 1 - i)).join(', ')}). ${JSON.stringify({ ...v, answer: undefined })}. Correct answer: ${v.answer}${SET_TYPES.includes(v.type as VaultType) ? ` (as bits: ${toBits(Number(v.answer), v.bits).join('')})` : ''}. Explain the method (place values, two's complement, masks, subnetting or IEEE 754 as needed); don't say the answer.`;
    }
    case 'cyber-defender': {
      const c = cyber(p.items[at]!);
      return `Cyber safety: judge this ${c.kind} case: ${c.question ?? ''} Choices: ${choicesOf(c, p.order).join(' / ')}. ${c.from ? `From: ${c.from}. ` : ''}${c.subject ? `Subject: ${c.subject}. ` : ''}${c.body}${c.link ? ` Link: ${c.link}` : ''}${c.code ? ` Code/log: ${c.code}` : ''}. Correct: ${c.answer} (${c.why}). Point to the warning signs to look for; don't say the verdict.`;
    }
  }
}
