/**
 * Asteroid Survival: short physics calculations, made fresh for each run from the seed. Numbers are
 * picked so the answers come out whole (or to one decimal place). Wrong options are the usual
 * slips: multiplying instead of dividing, forgetting the ½, and so on. g = 10 m/s² throughout.
 */
import type { Question } from './questions.js';

type Rand = () => number;
const pick = <T>(r: Rand, list: readonly T[]) => list[Math.floor(r() * list.length)]!;
const int = (r: Rand, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
/** "1 200", "4.5": spaces between thousands, at most one decimal place. */
export const num = (n: number) => {
  const rounded = Math.round(n * 10) / 10;
  const [whole, dec] = String(Math.abs(rounded)).split('.');
  return `${rounded < 0 ? '−' : ''}${whole!.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}${dec ? `.${dec}` : ''}`;
};

/** A question from a right value and slip values (repeats and the right value are swapped for near misses). */
function make(text: string, unit: string, right: number, slips: number[]): Question {
  const seen = new Set([num(right)]);
  const wrong: string[] = [];
  for (const v of [...slips, right * 2, right / 2, right + 10, right * 10, right - 1]) {
    const s = num(v);
    if (v > 0 && !seen.has(s)) {
      seen.add(s);
      wrong.push(`${s} ${unit}`);
    }
    if (wrong.length === 3) break;
  }
  return { q: text, answer: `${num(right)} ${unit}`, wrong: wrong as [string, string, string] };
}

type Maker = (r: Rand) => Question;

const speed: Maker = (r) => {
  const t = int(r, 2, 9);
  const v = int(r, 3, 25);
  const d = v * t;
  return make(`An asteroid travels ${num(d)} m in ${t} s. What is its speed?`, 'm/s', v, [d * t, d + t, d - t]);
};
const distance: Maker = (r) => {
  const v = int(r, 4, 30);
  const t = int(r, 3, 12);
  return make(`Your ship flies at ${v} m/s for ${t} s. How far does it go?`, 'm', v * t, [v + t, v / t, (v * t) / 2]);
};
const weight: Maker = (r) => {
  const m = pick(r, [2, 5, 8, 12, 20, 45, 60, 150]);
  return make(`A space crate has a mass of ${m} kg. What is its weight on Earth? (g = 10 N/kg)`, 'N', m * 10, [m, m / 10, m + 10]);
};
const accel: Maker = (r) => {
  const t = int(r, 2, 8);
  const a = int(r, 2, 12);
  const u = int(r, 0, 10);
  const v = u + a * t;
  return make(`A rocket speeds up from ${u} m/s to ${v} m/s in ${t} s. What is its acceleration?`, 'm/s²', a, [v / t, (v + u) / t, (v - u) * t]);
};
const density: Maker = (r) => {
  const v = pick(r, [2, 4, 5, 8, 10]);
  const rho = pick(r, [500, 1000, 2500, 3000, 7800]);
  return make(`A space rock has a mass of ${num(rho * v)} kg and a volume of ${v} m³. What is its density?`, 'kg/m³', rho, [rho * v * v, rho * 2, rho / 10]);
};
const force: Maker = (r) => {
  const m = pick(r, [2, 4, 5, 10, 20, 50, 200]);
  const a = int(r, 2, 9);
  return make(`A ${m} kg probe accelerates at ${a} m/s². What resultant force acts on it?`, 'N', m * a, [m / a, m + a, m * a * a]);
};
const momentum: Maker = (r) => {
  const m = int(r, 2, 12);
  const v = int(r, 2, 15);
  return make(`A ${m} kg rock moves at ${v} m/s. What is its momentum?`, 'kg·m/s', m * v, [m / v, m + v, (m * v * v) / 2]);
};
const work: Maker = (r) => {
  const f = pick(r, [20, 50, 80, 120, 250]);
  const d = int(r, 2, 15);
  return make(`A robot arm pushes a crate with ${f} N over ${d} m. How much work is done?`, 'J', f * d, [f / d, f + d, f * d * 10]);
};
const pressure: Maker = (r) => {
  const a = pick(r, [2, 4, 5, 0.5]);
  const p = pick(r, [100, 250, 400, 1000]);
  return make(`A landing leg pushes down with ${num(p * a)} N on an area of ${a} m². What pressure does it exert?`, 'Pa', p, [p * a * a, p * 2, p + a]);
};
const kinetic: Maker = (r) => {
  const m = pick(r, [2, 4, 6, 10, 20]);
  const v = int(r, 2, 10);
  return make(`A ${m} kg chunk of ice moves at ${v} m/s. What is its kinetic energy?`, 'J', 0.5 * m * v * v, [m * v * v, m * v, 0.5 * m * v]);
};
const potential: Maker = (r) => {
  const m = pick(r, [2, 5, 10, 25]);
  const h = pick(r, [3, 4, 8, 12, 20]);
  return make(`A ${m} kg toolbox is lifted ${h} m up the launch tower. What potential energy does it gain? (g = 10 N/kg)`, 'J', m * 10 * h, [
    m * h,
    0.5 * m * 10 * h,
    m * 10 + h,
  ]);
};
const power: Maker = (r) => {
  const t = pick(r, [2, 4, 5, 10, 20]);
  const p = pick(r, [25, 50, 100, 150, 400]);
  return make(`A motor does ${num(p * t)} J of work in ${t} s. What is its power?`, 'W', p, [p * t * t, p * 2, p + t]);
};
const impulse: Maker = (r) => {
  const m = pick(r, [2, 4, 5, 10]);
  const dv = int(r, 3, 12);
  const t = pick(r, [0.5, 1, 2, 4]);
  return make(`A thruster changes a ${m} kg drone’s speed by ${dv} m/s in ${t} s. What average force does it give?`, 'N', (m * dv) / t, [
    m * dv,
    m * dv * t,
    dv / t,
  ]);
};
const ohm: Maker = (r) => {
  const i = pick(r, [0.5, 2, 3, 4, 5]);
  const res = pick(r, [2, 4, 6, 10, 12]);
  return make(`A current of ${i} A flows through a ${res} Ω heater in the ship. What is the voltage across it?`, 'V', i * res, [
    res / i,
    i + res,
    i * res * res,
  ]);
};
const wave: Maker = (r) => {
  const f = pick(r, [5, 10, 20, 50, 100]);
  const l = pick(r, [0.5, 2, 3, 4, 6]);
  return make(`A signal wave has a frequency of ${f} Hz and a wavelength of ${l} m. What is its speed?`, 'm/s', f * l, [f / l, f + l, (f * l) / 2]);
};

/** The kinds of calculation open at each level (each level adds new ones). */
export const PROBLEMS_BY_LEVEL: Record<number, Maker[]> = {
  1: [speed, distance, weight],
  2: [speed, weight, accel, density, force],
  3: [accel, force, momentum, work, pressure],
  4: [momentum, work, kinetic, potential, power],
  5: [kinetic, potential, impulse, ohm, wave, power],
};
