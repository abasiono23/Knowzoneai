/**
 * Asteroid Survival: physics calculations, made fresh for each run from the seed and worked out here
 * in code (no model writes these numbers). Levels 1–5 are school mechanics with g = 10 N/kg and
 * friendly numbers; levels 6–10 are gravitation, orbits, rockets and astrophysics with real constants,
 * answers to three significant figures. Wrong options are the usual slips: multiplying instead of
 * dividing, forgetting the ½ or a square root, using the altitude instead of the distance from the
 * centre, mixing units. The constants a problem needs are listed with it (`given`); levels 1–4 also
 * show the formula (`hint`).
 */

type Rand = () => number;
const pick = <T>(r: Rand, list: readonly T[]) => list[Math.floor(r() * list.length)]!;
const int = (r: Rand, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
/** A value between lo and hi, to `sig` significant figures. */
const between = (r: Rand, lo: number, hi: number, sig = 2) => Number((lo + (hi - lo) * r()).toPrecision(sig));

/** "1 200", "4.5": spaces between thousands, at most one decimal place. */
export const num = (n: number) => {
  const rounded = Math.round(n * 10) / 10;
  const [whole, dec] = String(Math.abs(rounded)).split('.');
  return `${rounded < 0 ? '−' : ''}${whole!.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}${dec ? `.${dec}` : ''}`;
};

const SUP: Record<string, string> = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
/**
 * Three significant figures: "7 670", "0.0452", "6.67 × 10⁻¹¹". Plain digits from 0.01 up to a
 * million, powers of ten beyond.
 */
export function sig(n: number, figures = 3): string {
  if (n === 0) return '0';
  const sign = n < 0 ? '−' : '';
  const a = Math.abs(n);
  const exp = Math.floor(Math.log10(Number(a.toPrecision(figures))));
  if (exp >= 6 || exp < -2) {
    const mant = (a / 10 ** exp).toFixed(figures - 1);
    return `${sign}${mant} × 10${String(exp)
      .split('')
      .map((c) => SUP[c])
      .join('')}`;
  }
  const fixed = Number(a.toPrecision(figures)).toFixed(Math.max(0, figures - 1 - exp));
  const [whole, dec] = fixed.split('.');
  return `${sign}${whole!.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}${dec ? `.${dec}` : ''}`;
}

export type Problem = {
  q: string;
  answer: string;
  /** Four wrong answers; easier levels show three of them. */
  wrong: string[];
  /** Constants and data the calculation needs. */
  given?: string[];
  /** The formula to use (shown on the easier levels). */
  hint?: string;
};

/**
 * A problem from a right value and the values the usual slips give. Slips that round to the right
 * answer, to each other, or aren't positive are dropped; plain multiples fill any gap.
 */
function make(text: string, unit: string, right: number, slips: number[], extra: { given?: string[]; hint?: string; school?: boolean } = {}): Problem {
  const show = extra.school ? num : sig;
  const seen = new Set([show(right)]);
  const wrong: string[] = [];
  for (const v of [...slips, right * 2, right / 2, right * 10, right / 10, right * 3, right / 3]) {
    if (!Number.isFinite(v) || v <= 0) continue;
    const s = show(v);
    if (seen.has(s)) continue;
    seen.add(s);
    wrong.push(`${s} ${unit}`.trim());
    if (wrong.length === 4) break;
  }
  return { q: text, answer: `${show(right)} ${unit}`.trim(), wrong, ...(extra.given && { given: extra.given }), ...(extra.hint && { hint: extra.hint }) };
}
/** School levels: friendly numbers, one decimal place at most. */
const school = (text: string, unit: string, right: number, slips: number[], hint: string) => make(text, unit, right, slips, { school: true, hint });

export type Maker = (r: Rand) => Problem;

// ─── Levels 1–5: school mechanics (g = 10 N/kg) ───────────────────────────────

const speed: Maker = (r) => {
  const t = int(r, 2, 9);
  const v = int(r, 3, 25);
  const d = v * t;
  return school(`An asteroid travels ${num(d)} m in ${t} s. What is its speed?`, 'm/s', v, [d * t, d + t, d - t], 'speed = distance ÷ time');
};
const distance: Maker = (r) => {
  const v = int(r, 4, 30);
  const t = int(r, 3, 12);
  return school(`Your ship flies at ${v} m/s for ${t} s. How far does it go?`, 'm', v * t, [v + t, v / t, (v * t) / 2], 'distance = speed × time');
};
const weight: Maker = (r) => {
  const m = pick(r, [2, 5, 8, 12, 20, 45, 60, 150]);
  return school(`A space crate has a mass of ${m} kg. What is its weight on Earth? (g = 10 N/kg)`, 'N', m * 10, [m, m / 10, m + 10], 'weight = mass × g');
};
const accel: Maker = (r) => {
  const t = int(r, 2, 8);
  const a = int(r, 2, 12);
  const u = int(r, 0, 10);
  const v = u + a * t;
  return school(`A rocket speeds up from ${u} m/s to ${v} m/s in ${t} s. What is its acceleration?`, 'm/s²', a, [v / t, (v + u) / t, (v - u) * t], 'a = (v − u) ÷ t');
};
const density: Maker = (r) => {
  const v = pick(r, [2, 4, 5, 8, 10]);
  const rho = pick(r, [500, 1000, 2500, 3000, 7800]);
  return school(`A space rock has a mass of ${num(rho * v)} kg and a volume of ${v} m³. What is its density?`, 'kg/m³', rho, [rho * v * v, rho * 2, rho / 10], 'density = mass ÷ volume');
};
const force: Maker = (r) => {
  const m = pick(r, [2, 4, 5, 10, 20, 50, 200]);
  const a = int(r, 2, 9);
  return school(`A ${m} kg probe accelerates at ${a} m/s². What resultant force acts on it?`, 'N', m * a, [m / a, m + a, m * a * a], 'F = m × a');
};
const momentum: Maker = (r) => {
  const m = int(r, 2, 12);
  const v = int(r, 2, 15);
  return school(`A ${m} kg rock moves at ${v} m/s. What is its momentum?`, 'kg·m/s', m * v, [m / v, m + v, (m * v * v) / 2], 'p = m × v');
};
const work: Maker = (r) => {
  const f = pick(r, [20, 50, 80, 120, 250]);
  const d = int(r, 2, 15);
  return school(`A robot arm pushes a crate with ${f} N over ${d} m. How much work is done?`, 'J', f * d, [f / d, f + d, f * d * 10], 'work = force × distance');
};
const pressure: Maker = (r) => {
  const a = pick(r, [2, 4, 5, 0.5]);
  const p = pick(r, [100, 250, 400, 1000]);
  return school(`A landing leg pushes down with ${num(p * a)} N on an area of ${a} m². What pressure does it exert?`, 'Pa', p, [p * a * a, p * 2, p + a], 'pressure = force ÷ area');
};
const kinetic: Maker = (r) => {
  const m = pick(r, [2, 4, 6, 10, 20]);
  const v = int(r, 2, 10);
  return school(`A ${m} kg chunk of ice moves at ${v} m/s. What is its kinetic energy?`, 'J', 0.5 * m * v * v, [m * v * v, m * v, 0.5 * m * v], 'KE = ½ m v²');
};
const potential: Maker = (r) => {
  const m = pick(r, [2, 5, 10, 25]);
  const h = pick(r, [3, 4, 8, 12, 20]);
  return school(
    `A ${m} kg toolbox is lifted ${h} m up the launch tower. What potential energy does it gain? (g = 10 N/kg)`,
    'J',
    m * 10 * h,
    [m * h, 0.5 * m * 10 * h, m * 10 + h],
    'GPE = m g h',
  );
};
const power: Maker = (r) => {
  const t = pick(r, [2, 4, 5, 10, 20]);
  const p = pick(r, [25, 50, 100, 150, 400]);
  return school(`A motor does ${num(p * t)} J of work in ${t} s. What is its power?`, 'W', p, [p * t * t, p * 2, p + t], 'power = work ÷ time');
};
const impulse: Maker = (r) => {
  const m = pick(r, [2, 4, 5, 10]);
  const dv = int(r, 3, 12);
  const t = pick(r, [0.5, 1, 2, 4]);
  return school(`A thruster changes a ${m} kg drone’s speed by ${dv} m/s in ${t} s. What average force does it give?`, 'N', (m * dv) / t, [m * dv, m * dv * t, dv / t], 'F = m Δv ÷ t');
};
const ohm: Maker = (r) => {
  const i = pick(r, [0.5, 2, 3, 4, 5]);
  const res = pick(r, [2, 4, 6, 10, 12]);
  return school(`A current of ${i} A flows through a ${res} Ω heater in the ship. What is the voltage across it?`, 'V', i * res, [res / i, i + res, i * res * res], 'V = I R');
};
const wave: Maker = (r) => {
  const f = pick(r, [5, 10, 20, 50, 100]);
  const l = pick(r, [0.5, 2, 3, 4, 6]);
  return school(`A signal wave has a frequency of ${f} Hz and a wavelength of ${l} m. What is its speed?`, 'm/s', f * l, [f / l, f + l, (f * l) / 2], 'v = f λ');
};

// ─── Levels 6–10: gravitation, orbits, rockets and astrophysics ───────────────

/** Constants as the problems show them (to three figures); answers are worked out from these values. */
const G = 6.67e-11;
const C = 3.0e8;
const SIGMA = 5.67e-8;
const WIEN = 2.9e-3;
const G0 = 9.81;
const AU = 1.5e11;
const M_SUN = 1.99e30;
const DAY = 86_400;
const PC = 3.09e16;
const LY_PER_PC = 3.26;
const H0 = 70;
const T_SUN = 5_770;

type Body = { name: string; the: string; M: number; R: number; day?: number };
const EARTH: Body = { name: 'Earth', the: 'Earth', M: 5.97e24, R: 6.37e6, day: 86_164 };
const MARS: Body = { name: 'Mars', the: 'Mars', M: 6.42e23, R: 3.39e6, day: 88_642 };
const MOON: Body = { name: 'the Moon', the: 'the Moon', M: 7.35e22, R: 1.74e6 };
const JUPITER: Body = { name: 'Jupiter', the: 'Jupiter', M: 1.9e27, R: 6.99e7 };
const BODIES = [EARTH, MARS, MOON];

const kg = (x: number) => `${sig(x)} kg`;
const km = (m: number) => `${sig(m / 1000)} km`;
const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);
const gGiven = `G = ${sig(G)} N·m²/kg²`;
const bodyGiven = (b: Body) => [gGiven, `Mass of ${b.name} = ${kg(b.M)}`, `Radius of ${b.name} = ${km(b.R)}`];

/** Level 6: gravitational force on a satellite. */
const gravForce: Maker = (r) => {
  const b = pick(r, BODIES);
  const m = pick(r, [250, 500, 800, 1200, 2000]);
  const h = int(r, 3, 20) * 100_000;
  const d = b.R + h;
  const F = (G * b.M * m) / d ** 2;
  return make(
    `A ${m} kg satellite orbits ${b.the} ${sig(h / 1000)} km above the surface. What gravitational force does ${b.the} exert on it?`,
    'N',
    F,
    [(G * b.M * m) / h ** 2, (G * b.M * m) / b.R ** 2, (G * b.M * m) / d, (G * b.M) / d ** 2],
    { given: bodyGiven(b), hint: 'F = G M m ÷ r²   (r from the centre)' },
  );
};
/** Level 6: field strength at a height. */
const gHeight: Maker = (r) => {
  const b = pick(r, BODIES);
  const h = int(r, 2, 30) * 100_000;
  const d = b.R + h;
  return make(
    `What is the gravitational field strength ${sig(h / 1000)} km above the surface of ${b.the}?`,
    'N/kg',
    (G * b.M) / d ** 2,
    [(G * b.M) / b.R ** 2, (G * b.M) / h ** 2, (G * b.M) / (b.R ** 2 + h ** 2), (G * b.M * b.R) / d ** 3],
    { given: bodyGiven(b), hint: 'g = G M ÷ r²' },
  );
};
/** Level 6: circular orbit speed. */
const orbitSpeed: Maker = (r) => {
  const b = pick(r, BODIES);
  const h = int(r, 2, 20) * 100_000;
  const d = b.R + h;
  const v = Math.sqrt((G * b.M) / d);
  return make(
    `A probe is in a circular orbit ${sig(h / 1000)} km above ${b.the}. What is its orbital speed?`,
    'm/s',
    v,
    [Math.sqrt((2 * G * b.M) / d), Math.sqrt((G * b.M) / h), Math.sqrt((G * b.M) / b.R), Math.sqrt((G * b.M) / d) / 2],
    { given: bodyGiven(b), hint: 'v = √(G M ÷ r)' },
  );
};
/** Level 6: centripetal acceleration. */
const centripetal: Maker = (r) => {
  const v = between(r, 6_500, 7_800, 3);
  const d = between(r, 6_600, 7_400, 3) * 1000;
  return make(
    `A space station moves at ${sig(v)} m/s in a circle of radius ${sig(d / 1000)} km. What is its centripetal acceleration?`,
    'm/s²',
    v ** 2 / d,
    [v / d, v ** 2 / (2 * d), (v ** 2 / d) * 1000, Math.sqrt(v / d)],
    { hint: 'a = v² ÷ r' },
  );
};
/** Level 6: period from speed. */
const periodFromSpeed: Maker = (r) => {
  const v = between(r, 6_800, 7_700, 3);
  const d = between(r, 6_700, 7_300, 3) * 1000;
  const T = (2 * Math.PI * d) / v / 60;
  return make(
    `A satellite moves at ${sig(v)} m/s in a circular orbit of radius ${sig(d / 1000)} km. How long does one orbit take?`,
    'minutes',
    T,
    [d / v / 60, (Math.PI * d) / v / 60, (2 * Math.PI * d) / v / 3600, (2 * Math.PI * d) / v],
    { hint: 'T = 2πr ÷ v' },
  );
};

/** Level 7: escape speed. */
const escape: Maker = (r) => {
  const b = pick(r, [EARTH, MARS, MOON, JUPITER]);
  const v = Math.sqrt((2 * G * b.M) / b.R) / 1000;
  return make(`What is the escape speed from the surface of ${b.the}?`, 'km/s', v, [v / Math.SQRT2, v / 2, v * Math.SQRT2, v * Math.sqrt(1000)], {
    given: bodyGiven(b),
  });
};
/** Level 7: Kepler's third law for a satellite. */
const keplerSat: Maker = (r) => {
  const b = pick(r, [EARTH, MARS]);
  const h = int(r, 3, 40) * 100_000;
  const d = b.R + h;
  const T = 2 * Math.PI * Math.sqrt(d ** 3 / (G * b.M));
  return make(
    `A satellite orbits ${b.the} in a circle ${sig(h / 1000)} km above the surface. What is its orbital period?`,
    'minutes',
    T / 60,
    [Math.sqrt(d ** 3 / (G * b.M)) / 60, (2 * Math.PI * Math.sqrt(h ** 3 / (G * b.M))) / 60, (2 * Math.PI * Math.sqrt(d ** 3 / (2 * G * b.M))) / 60, T / 3600],
    { given: bodyGiven(b) },
  );
};
/** Level 7: a stationary orbit's height. */
const stationary: Maker = (r) => {
  const b = pick(r, [EARTH, MARS]);
  const T = b.day!;
  const d = Math.cbrt((G * b.M * T ** 2) / (4 * Math.PI ** 2));
  return make(
    `${cap(b.the)} turns once in ${num(T)} s. At what height above the surface must a satellite orbit to stay over the same spot?`,
    'km',
    (d - b.R) / 1000,
    [d / 1000, (Math.cbrt((G * b.M * 86_400 ** 2) / (4 * Math.PI ** 2)) - b.R) / 1000, (Math.cbrt(G * b.M * T ** 2) - b.R) / 1000, (Math.sqrt((G * b.M * T) / (4 * Math.PI ** 2)) - b.R) / 1000],
    { given: bodyGiven(b) },
  );
};
/** Level 7: Wien's law. */
const wien: Maker = (r) => {
  const star = pick(r, [
    ['a red dwarf', 3_100],
    ['the Sun', 5_770],
    ['Sirius A', 9_940],
    ['Rigel', 12_100],
    ['Betelgeuse', 3_600],
    ['a white dwarf', 25_000],
  ] as const);
  const lam = (WIEN / star[1]) * 1e9;
  return make(
    `The surface of ${star[0]} is at about ${sig(star[1])} K. At what wavelength does it give out the most light?`,
    'nm',
    lam,
    [lam * 1000, lam / 2, (star[1] / WIEN) * 1e-9 * 1e6, lam * 2],
    { given: [`Wien’s constant b = ${sig(WIEN)} m·K`] },
  );
};
/** Level 7: energy to lift a satellite into a higher orbit (potential only). */
const liftEnergy: Maker = (r) => {
  const m = pick(r, [500, 1000, 1500, 2500]);
  const h = int(r, 4, 30) * 100_000;
  const E = G * EARTH.M * m * (1 / EARTH.R - 1 / (EARTH.R + h));
  return make(
    `How much gravitational potential energy does a ${m} kg satellite gain when it is lifted from Earth’s surface to ${sig(h / 1000)} km up?`,
    'J',
    E,
    [m * G0 * h, (G * EARTH.M * m) / (EARTH.R + h), (G * EARTH.M * m) / EARTH.R, (G * EARTH.M * m) / h],
    { given: [...bodyGiven(EARTH), `g at the surface = ${G0} N/kg`] },
  );
};

/** Level 8: speed at the low point of an ellipse (vis-viva). */
const visViva: Maker = (r) => {
  const lo = int(r, 2, 6) * 100_000;
  const hi = int(r, 10, 360) * 100_000;
  const rp = EARTH.R + lo;
  const ra = EARTH.R + hi;
  const a = (rp + ra) / 2;
  const mu = G * EARTH.M;
  const v = Math.sqrt(mu * (2 / rp - 1 / a));
  return make(
    `A satellite’s elliptical orbit goes from ${sig(lo / 1000)} km to ${sig(hi / 1000)} km above Earth. How fast is it at its lowest point?`,
    'm/s',
    v,
    [Math.sqrt(mu / rp), Math.sqrt(mu * (2 / rp - 1 / ra)), Math.sqrt((2 * mu) / rp), Math.sqrt(mu * (2 / ra - 1 / a))],
    { given: bodyGiven(EARTH) },
  );
};
/** Level 8: the first burn of a Hohmann transfer. */
const hohmannBurn: Maker = (r) => {
  const lo = int(r, 2, 6) * 100_000;
  const hi = int(r, 50, 360) * 100_000;
  const r1 = EARTH.R + lo;
  const r2 = EARTH.R + hi;
  const mu = G * EARTH.M;
  const dv1 = Math.sqrt(mu / r1) * (Math.sqrt((2 * r2) / (r1 + r2)) - 1);
  const dv2 = Math.sqrt(mu / r2) * (1 - Math.sqrt((2 * r1) / (r1 + r2)));
  return make(
    `A spacecraft in a circular orbit ${sig(lo / 1000)} km up starts a Hohmann transfer to a circular orbit ${sig(hi / 1000)} km up. How much Δv does the first burn need?`,
    'm/s',
    dv1,
    [dv1 + dv2, Math.sqrt(mu / r1) - Math.sqrt(mu / r2), dv2, Math.sqrt(mu / r1) * Math.sqrt((2 * r2) / (r1 + r2))],
    { given: bodyGiven(EARTH) },
  );
};
/** Level 8: the rocket equation. */
const rocketEq: Maker = (r) => {
  const isp = pick(r, [290, 311, 348, 380, 421, 452]);
  const m0 = int(r, 20, 90) * 1000;
  const mf = Math.round(m0 * between(r, 0.18, 0.45, 2));
  const dv = isp * G0 * Math.log(m0 / mf);
  return make(
    `A stage has a mass of ${sig(m0)} kg when full and ${sig(mf)} kg when empty. Its engine has a specific impulse of ${isp} s. What Δv can it give?`,
    'm/s',
    dv,
    [isp * G0 * Math.log10(m0 / mf), isp * Math.log(m0 / mf), isp * G0 * (m0 / mf), isp * G0 * Math.log((m0 - mf) / mf)],
    { given: [`g₀ = ${G0} m/s²`] },
  );
};
/** Level 8: a star's luminosity from its size and temperature. */
const stefan: Maker = (r) => {
  const R = pick(r, [0.5, 1.7, 2.4, 6, 12, 40]);
  const T = pick(r, [3_500, 4_400, 6_500, 8_000, 9_900, 12_000]);
  const L = R ** 2 * (T / T_SUN) ** 4;
  return make(
    `A star has ${R} times the Sun’s radius and a surface temperature of ${sig(T)} K. How many times the Sun’s luminosity does it give out?`,
    '× L☉',
    L,
    [R * (T / T_SUN) ** 4, R ** 2 * (T / T_SUN) ** 2, R ** 2 * (T / T_SUN), R ** 4 * (T / T_SUN) ** 4],
    { given: [`Sun’s surface temperature = ${sig(T_SUN)} K`, 'L = 4πR²σT⁴'] },
  );
};
/** Level 8: synodic period. */
const synodic: Maker = (r) => {
  const p = pick(r, [
    ['Mars', 1.88],
    ['Jupiter', 11.9],
    ['Saturn', 29.5],
    ['Ceres', 4.6],
    ['Venus', 0.615],
    ['Mercury', 0.241],
  ] as const);
  const S = 1 / Math.abs(1 - 1 / p[1]);
  return make(
    `${p[0]} goes round the Sun once every ${p[1]} years. How often does Earth overtake it (or it overtake Earth), in years?`,
    'years',
    S,
    [Math.abs(p[1] - 1), 1 / (1 + 1 / p[1]), p[1] * 1, (p[1] + 1) / 2],
    { given: ['Earth’s year = 1.00 year'] },
  );
};

/** Level 9: parallax distance. */
const parallax: Maker = (r) => {
  const p = pick(r, [768, 379, 286, 129, 54.7, 19.2, 7.42]);
  const pc = 1000 / p;
  return make(
    `A star’s parallax is ${p} milliarcseconds. How far away is it, in light years?`,
    'light years',
    pc * LY_PER_PC,
    [pc, pc / LY_PER_PC, (1 / p) * LY_PER_PC, pc * LY_PER_PC * 2],
    { given: [`1 parsec = ${LY_PER_PC} light years`, 'd (parsecs) = 1 ÷ p (arcseconds)'] },
  );
};
/** Level 9: distance modulus. */
const distModulus: Maker = (r) => {
  const M = pick(r, [-3.2, -1.5, 0.6, 1.4, 4.8]);
  const m = Number((M + between(r, 3, 14, 3)).toFixed(1));
  const d = 10 ** ((m - M + 5) / 5);
  return make(
    `A star of absolute magnitude ${sig(M, 2)} appears at magnitude ${m.toFixed(1)}. Ignoring dust, how far away is it?`,
    'parsecs',
    d,
    [10 ** ((m - M) / 5), 10 ** ((m - M - 5) / 5), 10 ** ((m - M + 5) / 2.5), 10 ** ((m - M + 5) / 10)],
    { given: ['m − M = 5 log₁₀(d ÷ 10 pc)'] },
  );
};
/** Level 9: Hubble's law. */
const hubble: Maker = (r) => {
  const z = pick(r, [0.0042, 0.012, 0.023, 0.031, 0.047, 0.065]);
  const v = z * C / 1000;
  const d = v / H0;
  return make(
    `A galaxy’s light has a redshift z = ${z}. Using Hubble’s law, about how far away is it?`,
    'Mpc',
    d,
    [z * H0, v * H0, (z * C) / H0, d / LY_PER_PC],
    { given: [`H₀ = ${H0} km/s per Mpc`, `c = ${sig(C)} m/s`, 'v ≈ c z for small z'] },
  );
};
/** Level 9: Schwarzschild radius. */
const schwarz: Maker = (r) => {
  const sol = pick(r, [1, 3, 8, 14, 21, 4.3e6]);
  const M = sol * M_SUN;
  const rs = (2 * G * M) / C ** 2;
  return make(
    `What is the Schwarzschild radius (event horizon) of a black hole of ${sig(sol)} solar masses?`,
    'km',
    rs / 1000,
    [(G * M) / C ** 2 / 1000, (2 * G * M) / C / 1e6, Math.sqrt(2 * G * M) / C / 1000, (2 * G * M) / C ** 2],
    { given: [gGiven, `Sun’s mass = ${kg(M_SUN)}`, `c = ${sig(C)} m/s`] },
  );
};
/** Level 9: total mass of a binary star from Kepler's third law. */
const binary: Maker = (r) => {
  const a = pick(r, [5.5, 12, 20, 23.7, 34, 46]);
  const P = pick(r, [8.2, 18, 31, 50.1, 79, 120]);
  const M = a ** 3 / P ** 2;
  return make(
    `Two stars orbit each other every ${P} years, ${a} AU apart. What is their total mass?`,
    'solar masses',
    M,
    [a ** 2 / P ** 3, a ** 3 / P, a / P ** 2, a ** 2 / P ** 2],
    { given: ['With a in AU, P in years and M in solar masses: P² = a³ ÷ M'] },
  );
};
/** Level 9: specific orbital energy. */
const orbitEnergy: Maker = (r) => {
  const lo = int(r, 3, 10) * 100_000;
  const hi = int(r, 20, 400) * 100_000;
  const a = EARTH.R + (lo + hi) / 2;
  const mu = G * EARTH.M;
  const e = mu / (2 * a) / 1e6;
  // Asked as a size (energy needed to escape from it), so every option is positive.
  return make(
    `A satellite’s orbit goes from ${sig(lo / 1000)} km to ${sig(hi / 1000)} km above Earth. How much energy per kilogram would it need to escape from Earth completely?`,
    'MJ/kg',
    e,
    [mu / a / 1e6, mu / (2 * (EARTH.R + lo)) / 1e6, mu / (2 * (lo + hi) / 2) / 1e6, mu / (2 * (EARTH.R + hi)) / 1e6],
    { given: bodyGiven(EARTH) },
  );
};

/** Level 10: Hohmann transfer time between planets. */
const transferTime: Maker = (r) => {
  const p = pick(r, [
    ['Mars', 1.52],
    ['Venus', 0.723],
    ['Jupiter', 5.2],
    ['Ceres', 2.77],
    ['Mercury', 0.387],
  ] as const);
  const a = ((1 + p[1]) / 2) * AU;
  const t = Math.PI * Math.sqrt(a ** 3 / (G * M_SUN));
  return make(
    `How many days does a Hohmann transfer from Earth’s orbit (1.00 AU) to ${p[0]}’s orbit (${p[1]} AU) take? (Treat both orbits as circles.)`,
    'days',
    t / DAY,
    [(2 * t) / DAY, (Math.PI * Math.sqrt((p[1] * AU) ** 3 / (G * M_SUN))) / DAY, (Math.PI * Math.sqrt(((1 + p[1]) * AU) ** 3 / (G * M_SUN))) / DAY, t / DAY / Math.PI],
    { given: [gGiven, `Sun’s mass = ${kg(M_SUN)}`, `1 AU = ${sig(AU)} m`] },
  );
};
/** Level 10: total Δv from low orbit to a high circular orbit. */
const hohmannTotal: Maker = (r) => {
  const lo = int(r, 2, 6) * 100_000;
  const hi = pick(r, [20_200_000, 35_786_000, 12_000_000, 26_000_000]);
  const r1 = EARTH.R + lo;
  const r2 = EARTH.R + hi;
  const mu = G * EARTH.M;
  const dv1 = Math.sqrt(mu / r1) * (Math.sqrt((2 * r2) / (r1 + r2)) - 1);
  const dv2 = Math.sqrt(mu / r2) * (1 - Math.sqrt((2 * r1) / (r1 + r2)));
  return make(
    `What total Δv does a Hohmann transfer need, from a circular orbit ${sig(lo / 1000)} km up to a circular orbit ${sig(hi / 1000)} km up around Earth?`,
    'km/s',
    (dv1 + dv2) / 1000,
    [dv1 / 1000, (Math.sqrt(mu / r1) - Math.sqrt(mu / r2)) / 1000, dv2 / 1000, (dv1 + dv2) / 500],
    { given: bodyGiven(EARTH) },
  );
};
/** Level 10: Hill sphere. */
const hill: Maker = (r) => {
  const p = pick(r, [
    ['Earth', 5.97e24, 1.0],
    ['Mars', 6.42e23, 1.52],
    ['Jupiter', 1.9e27, 5.2],
    ['Neptune', 1.02e26, 30.1],
  ] as const);
  const a = p[2] * AU;
  const rh = a * Math.cbrt(p[1] / (3 * M_SUN));
  return make(
    `${p[0]} (mass ${kg(p[1])}) orbits the Sun at ${p[2]} AU. What is the radius of its Hill sphere, the region where its gravity can hold moons?`,
    'km',
    rh / 1000,
    [(a * Math.cbrt(p[1] / M_SUN)) / 1000, (a * Math.sqrt(p[1] / (3 * M_SUN))) / 1000, (a * (p[1] / M_SUN) ** 0.4) / 1000, (a * Math.cbrt(p[1] / (2 * M_SUN))) / 1000],
    { given: [`Sun’s mass = ${kg(M_SUN)}`, `1 AU = ${sig(AU)} m`, 'r_H ≈ a ∛(m ÷ 3M)'] },
  );
};
/** Level 10: Roche limit for a fluid moon. */
const roche: Maker = (r) => {
  const p = pick(r, [
    ['Saturn', 58_200, 687],
    ['Jupiter', 69_900, 1_330],
    ['Earth', 6_370, 5_510],
    ['Neptune', 24_600, 1_640],
  ] as const);
  const rho = pick(r, [500, 900, 1_200, 2_000, 3_000]);
  const d = 2.44 * p[1] * Math.cbrt(p[2] / rho);
  return make(
    `${p[0]} has radius ${sig(p[1])} km and mean density ${sig(p[2])} kg/m³. Inside what distance from its centre would a fluid moon of density ${sig(rho)} kg/m³ be torn apart?`,
    'km',
    d,
    [1.26 * p[1] * Math.cbrt(p[2] / rho), 2.44 * p[1] * (p[2] / rho), 2.44 * p[1] * Math.cbrt(rho / p[2]), 2.44 * p[1] * Math.sqrt(p[2] / rho)],
    { given: ['Fluid Roche limit: d ≈ 2.44 R (ρ_planet ÷ ρ_moon)^(1/3)'] },
  );
};
/** Level 10: burn time from thrust and specific impulse. */
const burnTime: Maker = (r) => {
  const F = pick(r, [67_000, 110_000, 845_000, 1_860_000]);
  const isp = pick(r, [311, 348, 452]);
  const fuel = int(r, 8, 400) * 1000;
  const t = (fuel * isp * G0) / F;
  return make(
    `An engine gives ${sig(F)} N of thrust with a specific impulse of ${isp} s. How long can it burn on ${sig(fuel)} kg of propellant?`,
    's',
    t,
    [(fuel * isp) / F, fuel / F, (F * isp) / (fuel * G0), t / 60],
    { given: [`g₀ = ${G0} m/s²`, 'mass flow = F ÷ (Isp g₀)'] },
  );
};
/** Level 10: a galaxy's mass from its rotation speed. */
const rotationMass: Maker = (r) => {
  const v = pick(r, [180, 200, 220, 240, 260]);
  const kpc = pick(r, [5, 8, 12, 15, 25]);
  const M = ((v * 1000) ** 2 * kpc * 1000 * PC) / G / M_SUN;
  return make(
    `Stars ${kpc} kpc from a galaxy’s centre orbit at ${v} km/s. Treating the mass inside as a point, how much mass is inside their orbit, in solar masses?`,
    'solar masses',
    M,
    [(v * 1000 * kpc * 1000 * PC) / G / M_SUN, ((v * 1000) ** 2 * kpc * 1000 * PC) / (2 * G) / M_SUN, (v ** 2 * kpc * 1000 * PC) / G / M_SUN, M * 2],
    { given: [gGiven, `1 pc = ${sig(PC)} m`, `Sun’s mass = ${kg(M_SUN)}`] },
  );
};

/** The kinds of calculation open at each level (each level adds new ones). */
export const PROBLEMS_BY_LEVEL: Record<number, Maker[]> = {
  1: [speed, distance, weight],
  2: [speed, weight, accel, density, force],
  3: [accel, force, momentum, work, pressure],
  4: [momentum, work, kinetic, potential, power],
  5: [kinetic, potential, impulse, ohm, wave, power],
  6: [gravForce, gHeight, orbitSpeed, centripetal, periodFromSpeed],
  7: [escape, keplerSat, stationary, wien, liftEnergy, orbitSpeed],
  8: [visViva, hohmannBurn, rocketEq, stefan, synodic],
  9: [parallax, distModulus, hubble, schwarz, binary, orbitEnergy],
  10: [transferTime, hohmannTotal, hill, roche, burnTime, rotationMass],
};
