import type { Body } from '@/lib/api';

/**
 * Gravity Master physics: the same simulation the server runs (apps/server/src/services/games/
 * gravity.ts), so the path drawn here is the path the server checks. Keep the two identical.
 */
export const BOARD = { w: 1, h: 1.5 };
const K = 0.005;
const DT = 1 / 120;
export const MAX_STEPS = 1200;
export const GOAL_R = 0.06;
export const planetRadius = (mass: number) => 0.035 + 0.012 * mass;

export type Launch = { x: number; y: number; vx: number; vy: number };
export type Flight = { end: 'goal' | 'crash' | 'lost' | 'time'; steps: number; path: [number, number][] };

export function fly(
  launch: Launch,
  planets: Body[],
  goal: { x: number; y: number } | null,
  every = 4,
  maxSteps = MAX_STEPS,
): Flight {
  let { x, y, vx, vy } = launch;
  const path: [number, number][] = [[x, y]];
  for (let step = 1; step <= maxSteps; step++) {
    let ax = 0;
    let ay = 0;
    for (const p of planets) {
      const dx = p.x - x;
      const dy = p.y - y;
      const d2 = dx * dx + dy * dy;
      const d = Math.sqrt(d2);
      if (d < planetRadius(p.mass)) return { end: 'crash', steps: step, path: [...path, [x, y]] };
      const a = (K * p.mass) / d2;
      ax += (a * dx) / d;
      ay += (a * dy) / d;
    }
    vx += ax * DT;
    vy += ay * DT;
    x += vx * DT;
    y += vy * DT;
    if (step % every === 0) path.push([x, y]);
    if (goal && Math.hypot(goal.x - x, goal.y - y) < GOAL_R)
      return { end: 'goal', steps: step, path: [...path, [x, y]] };
    if (x < -0.05 || x > BOARD.w + 0.05 || y < -0.05 || y > BOARD.h + 0.05) return { end: 'lost', steps: step, path };
  }
  return { end: 'time', steps: maxSteps, path };
}

/** Same rule as the server: on the board, clear of the start, the goal and the other planets. */
export function placementOk(p: Body, others: Body[], launch: Launch, goal: { x: number; y: number }) {
  const r = planetRadius(p.mass);
  if (p.x < r || p.x > BOARD.w - r || p.y < r || p.y > BOARD.h - r) return false;
  if (Math.hypot(p.x - launch.x, p.y - launch.y) < r + 0.08) return false;
  if (Math.hypot(p.x - goal.x, p.y - goal.y) < r + GOAL_R + 0.02) return false;
  return others.every((o) => Math.hypot(p.x - o.x, p.y - o.y) >= r + planetRadius(o.mass) + 0.01);
}
