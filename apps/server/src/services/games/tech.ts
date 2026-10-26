import { CYBER, type CyberItem } from '../../data/tech/cyber.js';
import { random, type Answer, type Outcome, type Progress } from './english.js';

/**
 * The Tech Hub games (Technology & Computer Science). Like the other games, every run is built from a
 * seed and checked on the server: programs are run here, circuits are tested against every input.
 */
export const TECH_GAMES = ['code-runner', 'cyber-defender', 'robot-rescue', 'binary-breaker', 'circuit-master'] as const;
export type TechGame = (typeof TECH_GAMES)[number];

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
const lvl = (level: number) => Math.min(5, Math.max(1, level));
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

function codePuzzle(level: number, r: Rand) {
  for (;;) {
    const start: Runner = { x: 0, y: 0, dir: 1 };
    let solution: Op[];
    if (level === 1) solution = Array.from({ length: int(r, 2, 3) }, () => motif(r, 1)).flat();
    else if (level === 2) solution = Array.from({ length: 3 }, () => motif(r, 2)).flat();
    else if (level < 5) solution = [{ op: 'repeat', times: int(r, 3, 4), body: motif(r, level) }];
    else
      solution = [
        { op: 'repeat', times: int(r, 2, 3), body: motif(r, level) },
        { op: 'repeat', times: int(r, 2, 3), body: motif(r, level) },
      ];
    const laid = layOut(solution, start);
    if (!laid || laid.tiles.length < 4) continue;
    // Normalise to positive coordinates.
    const minX = Math.min(...laid.tiles.map((t) => t[0]));
    const minY = Math.min(...laid.tiles.map((t) => t[1]));
    const shift = (c: Cell): Cell => [c[0] - minX, c[1] - minY];
    const tiles = laid.tiles.map(shift);
    if (Math.max(...tiles.map((t) => t[0])) > 9 || Math.max(...tiles.map((t) => t[1])) > 9) continue;
    const gems = shuffle(r, tiles.slice(1, -1)).slice(0, Math.min(3, Math.floor(tiles.length / 3)));
    const blocks = blockCount(solution);
    // Early levels allow a little extra; from level 3 you need the repeat block to fit.
    const maxBlocks = level <= 2 ? blocks + 2 : blocks + 1;
    return {
      tiles,
      gems,
      start: { x: start.x - minX, y: start.y - minY, dir: start.dir },
      goal: shift(laid.goal),
      maxBlocks,
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

function rescuePuzzle(level: number, r: Rand) {
  const size = [5, 5, 6, 6, 7][level - 1]!;
  for (;;) {
    const cells: Cell[] = [];
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) cells.push([x, y]);
    const [robot, kitten, home] = shuffle(r, cells);
    const blocked = shuffle(
      r,
      cells.filter((c) => c !== robot && c !== kitten && c !== home),
    ).slice(0, Math.floor(cells.length * (0.18 + level * 0.03)));
    const carry = level >= 3;
    const board: RescueBoard = { w: size, h: size, blocked, robot: robot!, kitten: kitten!, ...(carry && { home: home! }) };
    const there = fewestCards(board, robot!, kitten!);
    const back = carry ? fewestCards(board, kitten!, home!) : 0;
    if (there === null || back === null || there + back < (level === 1 ? 2 : 3)) continue;
    const best = there + back + (carry ? 2 : 1);
    // Water and crates are just looks: both block the robot.
    const kinds = blocked.map(() => (r() < 0.5 ? 'crate' : 'water'));
    return { ...board, kinds, best, maxCards: best + (level <= 2 ? 4 : 2) };
  }
}

// ─── Binary Breaker ───────────────────────────────────────────────────────────

const BITS = [4, 6, 8, 8, 8];
const toBits = (n: number, bits: number) => Array.from({ length: bits }, (_, i) => (n >> (bits - 1 - i)) & 1);
const fromBits = (b: number[]) => b.reduce((n, d) => n * 2 + d, 0);

function vault(level: number, r: Rand, k: number) {
  const bits = BITS[level - 1]!;
  const max = 2 ** bits - 1;
  const types = level >= 5 ? ['set', 'read', 'add', 'ascii'] : level >= 4 ? ['set', 'read', 'ascii'] : ['set', 'read'];
  const type = types[k % types.length]!;
  if (type === 'read') {
    const n = int(r, 1, max);
    const wrong = new Set<number>();
    while (wrong.size < 3) {
      const w = pick(r, [n + 1, n - 1, n ^ 1, n ^ 2, n * 2, Math.floor(n / 2), n + 8, n - 8, int(r, 1, max)].filter((v) => v >= 0 && v <= max && v !== n));
      wrong.add(w);
    }
    return { type, bits, shown: toBits(n, bits), answer: String(n), options: shuffle(r, [String(n), ...[...wrong].map(String)]) };
  }
  if (type === 'ascii') {
    const letter = String.fromCharCode(int(r, 65, 90));
    const others = shuffle(
      r,
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter((c) => c !== letter),
    ).slice(0, 3);
    return { type, bits: 8, shown: toBits(letter.charCodeAt(0), 8), answer: letter, options: shuffle(r, [letter, ...others]) };
  }
  if (type === 'add') {
    const a = int(r, 1, max / 2);
    const b = int(r, 1, max - a);
    return { type, bits, a: toBits(a, bits), b: toBits(b, bits), answer: String(a + b) };
  }
  const n = int(r, 1, max);
  return { type, bits, target: n, answer: String(n) };
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

/** Topologies by level: which slots, fed from which inputs. */
const LAYOUTS: { inputs: string[]; slots: Slot[] }[][] = [
  [{ inputs: ['A', 'B'], slots: [{ id: 'g1', kind: 'binary', from: ['A', 'B'] }] }],
  [
    {
      inputs: ['A', 'B'],
      slots: [
        { id: 'u1', kind: 'unary', from: ['A'] },
        { id: 'g1', kind: 'binary', from: ['u1', 'B'] },
      ],
    },
  ],
  [
    {
      inputs: ['A', 'B'],
      slots: [
        { id: 'g1', kind: 'binary', from: ['A', 'B'] },
        { id: 'u1', kind: 'unary', from: ['g1'] },
      ],
    },
    {
      inputs: ['A', 'B'],
      slots: [
        { id: 'u1', kind: 'unary', from: ['B'] },
        { id: 'g1', kind: 'binary', from: ['A', 'u1'] },
      ],
    },
  ],
  [
    {
      inputs: ['A', 'B', 'C'],
      slots: [
        { id: 'g1', kind: 'binary', from: ['A', 'B'] },
        { id: 'g2', kind: 'binary', from: ['g1', 'C'] },
      ],
    },
  ],
  [
    {
      inputs: ['A', 'B'],
      slots: [
        { id: 'g1', kind: 'binary', from: ['A', 'B'] },
        { id: 'g2', kind: 'binary', from: ['A', 'B'] },
        { id: 'g3', kind: 'binary', from: ['g1', 'g2'] },
      ],
    },
    {
      inputs: ['A', 'B', 'C'],
      slots: [
        { id: 'u1', kind: 'unary', from: ['C'] },
        { id: 'g1', kind: 'binary', from: ['A', 'B'] },
        { id: 'g2', kind: 'binary', from: ['g1', 'u1'] },
      ],
    },
  ],
];
const GATES_BY_LEVEL: Gate[][] = [['AND', 'OR'], ['AND', 'OR', 'NOT'], ['AND', 'OR', 'NOT'], ['AND', 'OR', 'NOT', 'NAND', 'NOR'], ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR']];

function circuitPuzzle(level: number, r: Rand) {
  const gates = GATES_BY_LEVEL[level - 1]!;
  for (;;) {
    const layout = pick(r, LAYOUTS[level - 1]!);
    const solution: Record<string, Gate> = Object.fromEntries(
      layout.slots.map((s) => [s.id, s.kind === 'unary' ? pick(r, ['NOT', 'NOT', 'WIRE'] as Gate[]) : pick(r, BINARY.filter((g) => gates.includes(g)))]),
    );
    const out = layout.slots.at(-1)!.id;
    const target = truthTable(layout.inputs, layout.slots, out, solution);
    // Always on or always off isn't a puzzle.
    if (target.every((v) => v === target[0])) continue;
    return { inputs: layout.inputs, slots: layout.slots, out, gates, target, solution };
  }
}

// ─── Building runs ────────────────────────────────────────────────────────────

const CYBER_SECONDS = [30, 26, 22, 20, 18];

function build(game: TechGame, level: number, r: Rand) {
  const L = lvl(level);
  switch (game) {
    case 'code-runner':
      return { kind: game, puzzles: Array.from({ length: 4 }, () => codePuzzle(L, r)) };
    case 'robot-rescue':
      return { kind: game, puzzles: Array.from({ length: 3 }, () => rescuePuzzle(L, r)) };
    case 'binary-breaker':
      return { kind: game, vaults: shuffle(r, Array.from({ length: 5 }, (_, k) => vault(L, r, k))) };
    case 'circuit-master':
      return { kind: game, puzzles: Array.from({ length: 3 }, () => circuitPuzzle(L, r)) };
    case 'cyber-defender': {
      const pool = CYBER.filter((c) => c.level <= L);
      // A mix: some messages, a password or two, and situations.
      const items = shuffle(r, pool).slice(0, 8);
      return { kind: game, seconds: CYBER_SECONDS[L - 1]!, items: items.map((c) => c.id) };
    }
  }
}

export type TechPuzzle =
  | { kind: 'code-runner'; puzzles: ReturnType<typeof codePuzzle>[] }
  | { kind: 'robot-rescue'; puzzles: ReturnType<typeof rescuePuzzle>[] }
  | { kind: 'binary-breaker'; vaults: ReturnType<typeof vault>[] }
  | { kind: 'circuit-master'; puzzles: ReturnType<typeof circuitPuzzle>[] }
  | { kind: 'cyber-defender'; seconds: number; items: string[] };
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

const cyber = (id: string) => CYBER.find((c) => c.id === id)!;
const choicesOf = (c: CyberItem) => (c.kind === 'password' ? ['weak', 'strong'] : c.kind === 'situation' ? ['risky', 'safe'] : ['phishing', 'safe']);

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
          const { answer, why, level: _level, ...c } = cyber(id);
          return { ...c, id: i, options: choicesOf(cyber(id)), ...(results[i] && { result: { ...results[i], answer, why } }) };
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
      const given = v.type === 'set' || v.type === 'add' ? (a.bits && a.bits.length === v.bits && a.bits.every((b) => b === 0 || b === 1) ? String(fromBits(a.bits)) : null) : (a.choice ?? null);
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
      return `Binary puzzle (${v.type}) with ${v.bits} bits (place values ${Array.from({ length: v.bits }, (_, i) => 2 ** (v.bits - 1 - i)).join(', ')}). ${JSON.stringify({ ...v, answer: undefined })}. Correct answer: ${v.answer}. Explain place values; don't say the answer.`;
    }
    case 'cyber-defender': {
      const c = cyber(p.items[at]!);
      return `Cyber safety: judge this ${c.kind} as ${choicesOf(c).join(' or ')}. ${c.from ? `From: ${c.from}. ` : ''}${c.subject ? `Subject: ${c.subject}. ` : ''}${c.body}${c.link ? ` Link: ${c.link}` : ''}. Correct: ${c.answer} (${c.why}). Point to the warning signs to look for; don't say the verdict.`;
    }
  }
}
