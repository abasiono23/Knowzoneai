/**
 * Reaction Rush calculations, made fresh for every run from a seed and worked out in code: formula
 * masses, moles, reacting masses, limiting reagents, titrations, pH, gas laws, equilibria (with the
 * quadratic solved exactly), solubility products, free energy, cell potentials and rates. Each problem
 * has one right answer and three wrong ones built from the usual mistakes (ratio ignored or upside
 * down, ×1000 slips, a forgotten square root…), all different once rounded.
 */
import { balance, molarMass, parseSpecies, SCHOOL_AR } from './formula.js';

type Rand = () => number;
export type Calc = { kind: string; prompt: string; answer: string; options: string[]; working: string };

const pick = <T>(r: Rand, list: readonly T[]) => list[Math.floor(r() * list.length)]!;
const between = (r: Rand, lo: number, hi: number, step: number) => lo + step * Math.floor(r() * (Math.round((hi - lo) / step) + 1));

/** A number to `sf` significant figures, written plainly (no exponent for 1e-4 … 1e6). */
export function sig(x: number, sf = 3): string {
  if (!Number.isFinite(x)) return '—';
  if (x === 0) return '0';
  const abs = Math.abs(x);
  if (abs >= 1e6 || abs < 1e-4) {
    const [m, e] = x.toExponential(sf - 1).split('e');
    return `${m} × 10^${Number(e)}`;
  }
  const digits = Math.max(0, sf - 1 - Math.floor(Math.log10(abs)));
  return x.toFixed(Math.min(digits, 8));
}

/** The right answer and three distinct wrong ones, shuffled. */
function options(r: Rand, right: string, wrong: string[], fallback: (k: number) => string) {
  const set = [right];
  for (const w of wrong) if (!set.includes(w) && set.length < 4) set.push(w);
  for (let k = 1; set.length < 4 && k < 40; k++) {
    const w = fallback(k);
    if (!set.includes(w)) set.push(w);
  }
  for (let i = set.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [set[i], set[j]] = [set[j]!, set[i]!];
  }
  return set;
}
const numeric = (r: Rand, x: number, wrong: number[], unit: string, sf = 3): Pick<Calc, 'answer' | 'options'> => {
  const f = (v: number) => `${sig(v, sf)}${unit === '%' ? '%' : unit ? ` ${unit}` : ''}`;
  const answer = f(x);
  return { answer, options: options(r, answer, wrong.map(f), (k) => f(x * [1.5, 0.5, 2, 0.75, 1.25, 3][k % 6]! * (1 + k / 97))) };
};

/** Formula masses as they're written in exams: 17, 159.5. */
const plain = (r: Rand, x: number, wrong: number[]): Pick<Calc, 'answer' | 'options'> => {
  const f = (v: number) => String(Math.round(v * 10) / 10);
  const answer = f(x);
  return { answer, options: options(r, answer, wrong.map(f), (k) => f(x + (k % 2 ? 2 * k : -k))) };
};
const arList = (formulas: string[], table: Record<string, number>) => {
  const els = [...new Set(formulas.flatMap((f) => Object.keys(atomsIn(f))))].sort();
  return els.map((el) => `${el} = ${table[el]}`).join(', ');
};
const atomsIn = (f: string) => parseSpecies(f).atoms;
const mr = (f: string) => Math.round(molarMass(f, SCHOOL_AR) * 100) / 100;


// ─── Reactions used in the problems (coefficients are worked out, not typed) ───

type Rx = { reactants: string[]; products: string[]; name: string };
const RX: Rx[] = [
  { reactants: ['CaCO3'], products: ['CaO', 'CO2'], name: 'Heating calcium carbonate' },
  { reactants: ['Mg', 'O2'], products: ['MgO'], name: 'Burning magnesium' },
  { reactants: ['Zn', 'HCl'], products: ['ZnCl2', 'H2'], name: 'Zinc with hydrochloric acid' },
  { reactants: ['Fe2O3', 'CO'], products: ['Fe', 'CO2'], name: 'Iron from its ore' },
  { reactants: ['CH4', 'O2'], products: ['CO2', 'H2O'], name: 'Burning methane' },
  { reactants: ['Na2CO3', 'HCl'], products: ['NaCl', 'H2O', 'CO2'], name: 'Sodium carbonate with acid' },
  { reactants: ['Al', 'O2'], products: ['Al2O3'], name: 'Burning aluminium' },
  { reactants: ['C3H8', 'O2'], products: ['CO2', 'H2O'], name: 'Burning propane' },
  { reactants: ['N2', 'H2'], products: ['NH3'], name: 'Making ammonia' },
  { reactants: ['CuO', 'H2SO4'], products: ['CuSO4', 'H2O'], name: 'Copper(II) oxide with sulfuric acid' },
];
const coeffs = (rx: Rx) => balance(rx.reactants, rx.products)!;
const eqText = (rx: Rx) => {
  const c = coeffs(rx);
  const side = (list: string[], o: number) => list.map((s, k) => `${c[o + k] === 1 ? '' : c[o + k]}${s}`).join(' + ');
  return `${side(rx.reactants, 0)} → ${side(rx.products, rx.reactants.length)}`;
};

// ─── Generators by level ──────────────────────────────────────────────────────

const MR_POOL = ['H2O', 'CO2', 'NaCl', 'CaCO3', 'H2SO4', 'NaOH', 'MgO', 'NH3', 'CuSO4', 'KMnO4', 'C6H12O6', 'Ca(OH)2', 'Al2(SO4)3', '(NH4)2SO4', 'HNO3', 'Na2CO3'];

function formulaMass(r: Rand): Calc {
  const f = pick(r, MR_POOL);
  const right = mr(f);
  const atoms = atomsIn(f);
  const flat = Object.keys(atoms).reduce((s, el) => s + SCHOOL_AR[el]!, 0); // subscripts ignored
  return {
    kind: 'formula-mass',
    prompt: `Relative formula mass (Mr) of ${(f)}? (Ar: ${arList([f], SCHOOL_AR)})`,
    ...plain(r, right, [flat, right + 16, right - 1]),
    working: Object.entries(atoms)
      .map(([el, n]) => `${n} × ${SCHOOL_AR[el]}`)
      .join(' + ')
      .concat(` = ${sig(right, 4)}`),
  };
}

function moles(r: Rand): Calc {
  const f = pick(r, ['CO2', 'NaOH', 'CaCO3', 'H2O', 'NaCl', 'MgO', 'H2SO4', 'NH3']);
  const m = mr(f);
  const mass = Math.round(m * between(r, 0.1, 2.5, 0.05) * 10) / 10;
  const n = mass / m;
  return {
    kind: 'moles',
    prompt: `How many moles are in ${mass} g of ${(f)}? (Mr = ${m})`,
    ...numeric(r, n, [mass * m, m / mass, n * 2], 'mol'),
    working: `n = m ÷ Mr = ${mass} ÷ ${m} = ${sig(n)} mol`,
  };
}

function percentMass(r: Rand): Calc {
  const [f, el] = pick(r, [
    ['NH4NO3', 'N'],
    ['CaCO3', 'Ca'],
    ['H2O', 'O'],
    ['Fe2O3', 'Fe'],
    ['CuSO4', 'Cu'],
    ['(NH4)2SO4', 'N'],
    ['Al2O3', 'Al'],
    ['C6H12O6', 'C'],
  ] as const);
  const n = atomsIn(f)[el]!;
  const p = ((n * SCHOOL_AR[el]!) / mr(f)) * 100;
  return {
    kind: 'percent',
    prompt: `Percentage by mass of ${el} in ${(f)}? (Ar: ${arList([f], SCHOOL_AR)})`,
    ...numeric(r, p, [(SCHOOL_AR[el]! / mr(f)) * 100, (n * SCHOOL_AR[el]! * 100) / (mr(f) - n * SCHOOL_AR[el]!), 100 - p], '%'),
    working: `${n} × ${SCHOOL_AR[el]} ÷ ${mr(f)} × 100 = ${sig(p)}%`,
  };
}

/** Mass of a product from the mass of a reactant. */
function reactingMass(r: Rand): Calc {
  const rx = pick(r, RX.filter((x) => !x.products.every((p) => p === 'H2O')));
  const c = coeffs(rx);
  const a = pick(r, rx.reactants.filter((x) => !['O2', 'HCl', 'H2SO4', 'CO'].includes(x)).concat(rx.reactants[0]!));
  const ai = rx.reactants.indexOf(a);
  const productChoices = rx.products.filter((p) => p !== 'H2O');
  const b = pick(r, productChoices);
  const bi = rx.reactants.length + rx.products.indexOf(b);
  const mass = between(r, 2, 50, 0.5);
  const nA = mass / mr(a);
  const nB = (nA * c[bi]!) / c[ai]!;
  const right = nB * mr(b);
  return {
    kind: 'reacting-mass',
    prompt: `${eqText(rx)}. What mass of ${(b)} forms from ${mass} g of ${(a)}? (Ar: ${arList([a, b], SCHOOL_AR)})`,
    ...numeric(r, right, [nA * mr(b), (nA * c[ai]! * mr(b)) / c[bi]!, (mass / mr(b)) * mr(a)], 'g'),
    working: `n(${a}) = ${mass} ÷ ${mr(a)} = ${sig(nA)} mol; n(${b}) = ${sig(nA)} × ${c[bi]}/${c[ai]} = ${sig(nB)} mol; mass = ${sig(nB)} × ${mr(b)} = ${sig(right)} g`,
  };
}

function gasVolume(r: Rand): Calc {
  const rx = pick(r, RX.filter((x) => x.products.some((p) => ['CO2', 'H2'].includes(p)) && !x.reactants.includes('CH4') && !x.reactants.includes('C3H8')));
  const c = coeffs(rx);
  const a = rx.reactants[0]!;
  const gas = rx.products.find((p) => ['CO2', 'H2'].includes(p))!;
  const gi = rx.reactants.length + rx.products.indexOf(gas);
  const mass = between(r, 1, 25, 0.5);
  const n = ((mass / mr(a)) * c[gi]!) / c[0]!;
  const v = n * 24;
  return {
    kind: 'gas-volume',
    prompt: `${eqText(rx)}. Volume of ${(gas)} at room temperature and pressure from ${mass} g of ${(a)}? (1 mol of gas = 24 dm³; Ar: ${arList([a], SCHOOL_AR)})`,
    ...numeric(r, v, [n * 22.4, n, (mass / mr(a)) * 24 * (c[0]! / c[gi]!) * (c[gi] === c[0] ? 2 : 1)], 'dm³'),
    working: `n(${gas}) = ${sig(n)} mol; V = ${sig(n)} × 24 = ${sig(v)} dm³`,
  };
}

function concentration(r: Rand): Calc {
  const f = pick(r, ['NaOH', 'NaCl', 'HCl', 'CuSO4', 'Na2CO3', 'KMnO4']);
  const mass = between(r, 0.5, 20, 0.5);
  const v = pick(r, [100, 200, 250, 500, 1000]);
  const c = mass / mr(f) / (v / 1000);
  return {
    kind: 'concentration',
    prompt: `${mass} g of ${(f)} is dissolved to make ${v} cm³ of solution. Concentration? (Mr = ${mr(f)})`,
    ...numeric(r, c, [mass / mr(f) / v, mass / (v / 1000), (mass / mr(f)) * (v / 1000)], 'mol/dm³'),
    working: `n = ${mass} ÷ ${mr(f)} = ${sig(mass / mr(f))} mol; c = n ÷ ${v / 1000} dm³ = ${sig(c)} mol/dm³`,
  };
}

function limiting(r: Rand): Calc {
  const rx = pick(r, RX.filter((x) => x.reactants.length === 2));
  const c = coeffs(rx);
  const [a, b] = rx.reactants as [string, string];
  const p = rx.products.find((x) => x !== 'H2O')!;
  const pi = 2 + rx.products.indexOf(p);
  const ma = between(r, 2, 30, 1);
  const mb = between(r, 2, 30, 1);
  const na = ma / mr(a);
  const nb = mb / mr(b);
  const fromA = (na * c[pi]!) / c[0]!;
  const fromB = (nb * c[pi]!) / c[1]!;
  if (Math.abs(fromA - fromB) / Math.max(fromA, fromB) < 0.15) return limiting(r);
  const right = Math.min(fromA, fromB) * mr(p);
  const wrong = Math.max(fromA, fromB) * mr(p);
  const limit = fromA < fromB ? a : b;
  return {
    kind: 'limiting',
    prompt: `${eqText(rx)}. ${ma} g of ${(a)} reacts with ${mb} g of ${(b)}. Greatest mass of ${(p)}? (Ar: ${arList([a, b, p], SCHOOL_AR)})`,
    ...numeric(r, right, [wrong, (fromA + fromB) * mr(p), Math.min(na, nb) * mr(p)], 'g'),
    working: `${a} gives ${sig(fromA)} mol and ${b} gives ${sig(fromB)} mol of ${p}: ${limit} runs out first, so ${sig(Math.min(fromA, fromB))} × ${mr(p)} = ${sig(right)} g`,
  };
}

function titration(r: Rand): Calc {
  const [acid, base, ratio] = pick(r, [
    ['H2SO4', 'NaOH', 2],
    ['HCl', 'NaOH', 1],
    ['HCl', 'Na2CO3', 0.5],
    ['H2SO4', 'KOH', 2],
    ['HNO3', 'Ca(OH)2', 0.5],
  ] as const);
  const ca = pick(r, [0.05, 0.1, 0.15, 0.2, 0.25]);
  const va = between(r, 12, 30, 0.1);
  const vb = pick(r, [20, 25]);
  // ratio = moles of base per mole of acid
  const cb = (ca * va * ratio) / vb;
  return {
    kind: 'titration',
    prompt: `${vb}.0 cm³ of ${(base)} solution is neutralised by ${va.toFixed(1)} cm³ of ${ca.toFixed(2)} mol/dm³ ${(acid)}. Concentration of the ${(base)}?`,
    ...numeric(r, cb, [(ca * va) / vb, (ca * va) / (vb * ratio), (ca * vb * ratio) / va], 'mol/dm³'),
    working: `n(acid) = ${ca} × ${va.toFixed(1)}/1000; n(base) = n(acid) × ${ratio}; c = n ÷ ${vb}/1000 = ${sig(cb)} mol/dm³`,
  };
}

function empirical(r: Rand): Calc {
  const f = pick(r, [
    { formula: 'CH2O', els: { C: 1, H: 2, O: 1 } },
    { formula: 'C2H6O', els: { C: 2, H: 6, O: 1 } },
    { formula: 'CH4N2O', els: { C: 1, H: 4, N: 2, O: 1 } },
    { formula: 'C3H8O', els: { C: 3, H: 8, O: 1 } },
    { formula: 'Fe2O3', els: { Fe: 2, O: 3 } },
    { formula: 'Fe3O4', els: { Fe: 3, O: 4 } },
    { formula: 'C2H3Cl', els: { C: 2, H: 3, Cl: 1 } },
    { formula: 'Na2S2O3', els: { Na: 2, S: 2, O: 3 } },
  ]);
  const total = Object.entries(f.els).reduce((s, [el, n]) => s + n * SCHOOL_AR[el]!, 0);
  const pcts = Object.entries(f.els).map(([el, n]) => `${el} ${((n * SCHOOL_AR[el]!) / total * 100).toFixed(1)}%`);
  const wrongs = Object.entries(f.els).map(([el]) => el);
  const entries = Object.entries(f.els);
  const write = (e: (readonly [string, number])[]) => e.map(([el, n]) => `${el}${n === 1 ? '' : n}`).join('');
  const variants = [
    ...entries.map((_, k) => write(entries.map(([el, n], i) => [el, i === k ? n + 1 : n] as const))),
    ...entries.map((_, k) => write(entries.map(([el, n], i) => [el, i === k && n > 1 ? n - 1 : n] as const))),
    write(entries.map(([el, n]) => [el, n * 2] as const)),
    write(entries.map(([el, n], i) => [el, entries[(i + 1) % entries.length]![1]] as const)),
  ].filter((v) => v !== f.formula);
  const swap = (k: number) => variants[k % variants.length]!;
  const answer = f.formula;
  return {
    kind: 'empirical',
    prompt: `A compound is ${pcts.join(', ')} by mass. Its empirical formula? (Ar: ${arList([f.formula], SCHOOL_AR)})`,
    answer,
    options: options(r, answer, [swap(Math.floor(r() * 9)), swap(0), swap(1), swap(2), swap(3)], (k) => swap(k + 3)),
    working: `Divide each percentage by its Ar, then by the smallest: ${answer}`,
  };
}

function phStrong(r: Rand): Calc {
  const [f, perMol, acid] = pick(r, [
    ['HCl', 1, true],
    ['HNO3', 1, true],
    ['NaOH', 1, false],
    ['KOH', 1, false],
    ['Ba(OH)2', 2, false],
  ] as const);
  const c = pick(r, [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.25]);
  const ion = c * perMol;
  const ph = acid ? -Math.log10(ion) : 14 + Math.log10(ion);
  const wrong = acid ? [-Math.log10(c / 2), 14 + Math.log10(ion), -Math.log10(ion * 2)] : [-Math.log10(ion), 14 + Math.log10(c), 14 + Math.log10(ion / 2)];
  const f2 = (v: number) => v.toFixed(2);
  const answer = f2(ph);
  return {
    kind: 'ph',
    prompt: `pH of ${c} mol/dm³ ${(f)} at 25 °C? (Kw = 1.00 × 10^-14)`,
    answer,
    options: options(r, answer, (perMol === 2 ? [14 + Math.log10(c), ...wrong] : wrong).map(f2), (k) => f2(ph + (k % 2 ? 0.3 : -0.3) * k)),
    working: acid ? `[H⁺] = ${sig(ion)}; pH = −log[H⁺] = ${answer}` : `[OH⁻] = ${sig(ion)}; pOH = ${(-Math.log10(ion)).toFixed(2)}; pH = 14 − pOH = ${answer}`,
  };
}

function idealGas(r: Rand): Calc {
  const f = pick(r, ['CO2', 'O2', 'N2', 'CH4', 'NH3']);
  const mass = between(r, 1, 20, 0.5);
  const t = between(r, 15, 120, 5);
  const p = pick(r, [100, 101, 150, 200, 50]);
  const n = mass / mr(f);
  const v = ((n * 8.314 * (t + 273)) / (p * 1000)) * 1000; // dm³
  return {
    kind: 'ideal-gas',
    prompt: `Volume of ${mass} g of ${(f)} at ${t} °C and ${p} kPa? (R = 8.314 J/(mol·K), Mr = ${mr(f)})`,
    ...numeric(r, v, [(n * 8.314 * t) / p, v / 1000, (n * 8.314 * (t + 273)) / (p * 1000) / 1000], 'dm³'),
    working: `V = nRT/p = ${sig(n)} × 8.314 × ${t + 273} ÷ ${p * 1000} Pa = ${sig(v / 1000)} m³ = ${sig(v)} dm³`,
  };
}

function kcFrom(r: Rand): Calc {
  const sys = pick(r, [
    { eq: 'H2 + I2 ⇌ 2HI', top: [['HI', 2]], bottom: [['H2', 1], ['I2', 1]], unit: '' },
    { eq: 'N2 + 3H2 ⇌ 2NH3', top: [['NH3', 2]], bottom: [['N2', 1], ['H2', 3]], unit: 'dm⁶/mol²' },
    { eq: '2SO2 + O2 ⇌ 2SO3', top: [['SO3', 2]], bottom: [['SO2', 2], ['O2', 1]], unit: 'dm³/mol' },
    { eq: 'PCl5 ⇌ PCl3 + Cl2', top: [['PCl3', 1], ['Cl2', 1]], bottom: [['PCl5', 1]], unit: 'mol/dm³' },
  ] as const);
  const conc: Record<string, number> = {};
  for (const [s] of [...sys.top, ...sys.bottom]) conc[s] = between(r, 0.05, 0.8, 0.01);
  const prod = (list: readonly (readonly [string, number])[], usePow = true) => list.reduce((x, [s, p]) => x * conc[s]! ** (usePow ? p : 1), 1);
  const kc = prod(sys.top) / prod(sys.bottom);
  return {
    kind: 'kc',
    prompt: `${sys.eq}. At equilibrium: ${Object.entries(conc)
      .map(([s, c]) => `[${s}] = ${c.toFixed(2)}`)
      .join(', ')} mol/dm³. Kc?`,
    ...numeric(r, kc, [prod(sys.top, false) / prod(sys.bottom, false), prod(sys.bottom) / prod(sys.top), prod(sys.top) * prod(sys.bottom)], sys.unit),
    working: `Kc = ${sys.top.map(([s, p]) => `[${s}]${p > 1 ? `^${p}` : ''}`).join('')} ÷ ${sys.bottom.map(([s, p]) => `[${s}]${p > 1 ? `^${p}` : ''}`).join('')} = ${sig(kc)}`,
  };
}

function percentYield(r: Rand): Calc {
  const rx = pick(r, RX.filter((x) => x.reactants.length <= 2 && x.products.some((p) => p !== 'H2O')));
  const c = coeffs(rx);
  const a = rx.reactants[0]!;
  const p = rx.products.find((x) => x !== 'H2O' && x !== 'O2')!;
  const pi = rx.reactants.length + rx.products.indexOf(p);
  const mass = between(r, 5, 40, 1);
  const theory = ((mass / mr(a)) * c[pi]! * mr(p)) / c[0]!;
  const actual = Math.round(theory * between(r, 0.55, 0.92, 0.01) * 10) / 10;
  const y = (actual / theory) * 100;
  return {
    kind: 'yield',
    prompt: `${eqText(rx)}. ${mass} g of ${(a)} gave ${actual} g of ${(p)}. Percentage yield? (Ar: ${arList([a, p], SCHOOL_AR)})`,
    ...numeric(r, y, [(actual / mass) * 100, (actual / ((mass / mr(a)) * mr(p))) * 100, (theory / actual) * 100], '%'),
    working: `Theoretical = ${sig(theory)} g; yield = ${actual} ÷ ${sig(theory)} × 100 = ${sig(y)}%`,
  };
}

/** Equilibrium amounts by an ICE table, solving the quadratic exactly. */
function ice(r: Rand): Calc {
  const kind = pick(r, ['HI', 'N2O4']);
  if (kind === 'HI') {
    // H2 + I2 ⇌ 2HI, start with a of H2 and b of I2 in V dm³; Kc dimensionless.
    const a = between(r, 0.5, 2, 0.1);
    const b = between(r, 0.5, 2, 0.1);
    const kc = pick(r, [25, 36, 49, 50, 54.3, 64]);
    // (2x)² / ((a−x)(b−x)) = Kc → (4 − Kc)x² + Kc(a+b)x − Kc·ab = 0
    const A = 4 - kc;
    const B = kc * (a + b);
    const C = -kc * a * b;
    const roots = [(-B + Math.sqrt(B * B - 4 * A * C)) / (2 * A), (-B - Math.sqrt(B * B - 4 * A * C)) / (2 * A)];
    const x = roots.find((v) => v > 0 && v < Math.min(a, b))!;
    const hi = 2 * x;
    return {
      kind: 'ice',
      prompt: `H2 + I2 ⇌ 2HI, Kc = ${kc}. ${a.toFixed(1)} mol H2 and ${b.toFixed(1)} mol I2 are sealed in a flask and reach equilibrium. Moles of HI at equilibrium?`,
      ...numeric(r, hi, [x, Math.min(a, b) * 2, (2 * Math.sqrt(kc) * ((a + b) / 2)) / (2 + Math.sqrt(kc)) + (a === b ? 0.05 : 0)], 'mol'),
      working: `Let x react: (2x)² ÷ ((${a.toFixed(1)} − x)(${b.toFixed(1)} − x)) = ${kc}; x = ${sig(x)}; n(HI) = 2x = ${sig(hi)} mol`,
    };
  }
  // N2O4 ⇌ 2NO2: start with c0 mol/dm³ N2O4, Kc in mol/dm³.
  const c0 = between(r, 0.05, 0.5, 0.01);
  const kc = pick(r, [0.0046, 0.0059, 0.012, 0.025, 0.061]);
  // 4x² = Kc(c0 − x) → 4x² + Kc x − Kc c0 = 0
  const x = (-kc + Math.sqrt(kc * kc + 16 * kc * c0)) / 8;
  const no2 = 2 * x;
  return {
    kind: 'ice',
    prompt: `N2O4 ⇌ 2NO2, Kc = ${kc} mol/dm³. Pure N2O4 at ${c0.toFixed(2)} mol/dm³ reaches equilibrium. [NO2] at equilibrium?`,
    ...numeric(r, no2, [x, Math.sqrt(kc * c0), 2 * Math.sqrt(kc * c0)], 'mol/dm³'),
    working: `(2x)² ÷ (${c0.toFixed(2)} − x) = ${kc}; 4x² + ${kc}x − ${sig(kc * c0)} = 0; x = ${sig(x)}; [NO2] = 2x = ${sig(no2)} mol/dm³`,
  };
}

function weakAcid(r: Rand, exact: boolean): Calc {
  const [acid, ka] = pick(r, [
    ['ethanoic acid', 1.74e-5],
    ['methanoic acid', 1.78e-4],
    ['benzoic acid', 6.31e-5],
    ['hydrofluoric acid', 6.8e-4],
    ['chloroethanoic acid', 1.38e-3],
  ] as const);
  // The square-root shortcut only holds when the acid is barely dissociated (c ≥ 100 Ka).
  const c = pick(r, [0.001, 0.005, 0.01, 0.05, 0.1, 0.2].filter((x) => exact || x >= 100 * ka));
  const approx = Math.sqrt(ka * c);
  const h = exact ? (-ka + Math.sqrt(ka * ka + 4 * ka * c)) / 2 : approx;
  const ph = -Math.log10(h);
  const f2 = (v: number) => v.toFixed(2);
  const answer = f2(ph);
  const wrong = [-Math.log10(c), -Math.log10(ka * c), exact ? -Math.log10(approx) : -Math.log10(Math.sqrt(ka / c))];
  return {
    kind: exact ? 'weak-acid-exact' : 'weak-acid',
    prompt: exact
      ? `pH of ${c} mol/dm³ ${acid} (Ka = ${sig(ka)} mol/dm³)? Don't assume the acid barely dissociates: solve the quadratic.`
      : `pH of ${c} mol/dm³ ${acid} (Ka = ${sig(ka)} mol/dm³)? Assume [H⁺] = √(Ka × c).`,
    answer,
    options: options(r, answer, wrong.map(f2), (k) => f2(ph + 0.17 * k)),
    working: exact ? `x² ÷ (${c} − x) = Ka → x = ${sig(h)}; pH = ${answer}` : `[H⁺] = √(${sig(ka)} × ${c}) = ${sig(h)}; pH = ${answer}`,
  };
}

function buffer(r: Rand): Calc {
  const [acid, salt, pka] = pick(r, [
    ['ethanoic acid', 'sodium ethanoate', 4.76],
    ['methanoic acid', 'sodium methanoate', 3.75],
    ['ammonium chloride', 'ammonia', 9.25],
    ['dihydrogenphosphate', 'hydrogenphosphate', 7.21],
  ] as const);
  const ca = between(r, 0.05, 0.5, 0.05);
  const cb = between(r, 0.05, 0.5, 0.05);
  const ph = pka + Math.log10(cb / ca);
  const f2 = (v: number) => v.toFixed(2);
  const answer = f2(ph);
  return {
    kind: 'buffer',
    prompt: `A buffer holds ${ca.toFixed(2)} mol/dm³ ${acid} and ${cb.toFixed(2)} mol/dm³ ${salt} (pKa = ${pka}). pH?`,
    answer,
    options: options(r, answer, [f2(pka - Math.log10(cb / ca)), f2(pka), f2(pka + cb / ca)], (k) => f2(ph + 0.21 * k)),
    working: `pH = pKa + log([base]/[acid]) = ${pka} + log(${cb.toFixed(2)}/${ca.toFixed(2)}) = ${answer}`,
  };
}

function ksp(r: Rand): Calc {
  const [salt, ksp, a, b, mr2, ion] = pick(r, [
    ['AgCl', 1.8e-10, 1, 1, 143.4, 'Cl⁻'],
    ['BaSO4', 1.1e-10, 1, 1, 233.4, 'SO4²⁻'],
    ['CaF2', 3.9e-11, 1, 2, 78.1, 'F⁻'],
    ['PbI2', 9.8e-9, 1, 2, 461.0, 'I⁻'],
    ['Ag2CrO4', 1.1e-12, 2, 1, 331.7, 'Ag⁺'],
  ] as const);
  const common = r() < 0.5;
  if (!common) {
    // Ksp = (a s)^a (b s)^b
    const s = (ksp / (a ** a * b ** b)) ** (1 / (a + b));
    return {
      kind: 'ksp',
      prompt: `Ksp of ${salt} is ${sig(ksp)} at 25 °C. Its solubility in pure water, in g/dm³? (Mr = ${mr2})`,
      ...numeric(r, s * mr2, [Math.sqrt(ksp) * mr2, (ksp / (a + b)) ** (1 / (a + b)) * mr2, s], 'g/dm³'),
      working: `Ksp = ${a > 1 ? `(${a}s)^${a}` : 's'} × ${b > 1 ? `(${b}s)^${b}` : 's'} → s = ${sig(s)} mol/dm³; × ${mr2} = ${sig(s * mr2)} g/dm³`,
    };
  }
  // Common ion: c mol/dm³ of the ion that comes `b` (anion) times — treat ion as given.
  const c = pick(r, [0.01, 0.05, 0.1]);
  // The common ion is the anion for a:b salts listed with anion ion, cation for Ag2CrO4.
  const commonIsCation = salt === 'Ag2CrO4';
  const s = commonIsCation ? ksp / c ** 2 : ksp / c ** b;
  return {
    kind: 'ksp-common',
    prompt: `Ksp of ${salt} is ${sig(ksp)}. Its solubility (mol/dm³) in a solution already ${c} mol/dm³ in ${ion}? (Assume the dissolved salt adds little ${ion}.)`,
    ...numeric(r, s, [ksp / c, Math.sqrt(ksp), commonIsCation ? ksp / (4 * c * c) : ksp / (b * c) ** b], 'mol/dm³'),
    working: `Ksp = [other ion] × [${ion}]^n with [${ion}] = ${c}: s = ${sig(s)} mol/dm³`,
  };
}

function freeEnergy(r: Rand): Calc {
  const t = pick(r, [298, 350, 400, 500, 700]);
  const toK = r() < 0.5;
  if (toK) {
    const dg = between(r, -40, 30, 1);
    const k = Math.exp((-dg * 1000) / (8.314 * t));
    return {
      kind: 'dg-k',
      prompt: `ΔG° = ${dg} kJ/mol at ${t} K. Equilibrium constant K? (R = 8.314 J/(mol·K))`,
      ...numeric(r, k, [Math.exp((dg * 1000) / (8.314 * t)), Math.exp(-dg / (8.314 * t)), 10 ** ((-dg * 1000) / (8.314 * t))], ''),
      working: `K = exp(−ΔG°/RT) = exp(${sig((-dg * 1000) / (8.314 * t))}) = ${sig(k)}`,
    };
  }
  const k = pick(r, [2.5e-3, 0.18, 4.6, 87, 1.2e4, 3.3e7]);
  const dg = (-8.314 * t * Math.log(k)) / 1000;
  return {
    kind: 'k-dg',
    prompt: `K = ${sig(k)} at ${t} K. ΔG°, in kJ/mol? (R = 8.314 J/(mol·K))`,
    ...numeric(r, dg, [-dg, (-8.314 * t * Math.log10(k)) / 1000, -8.314 * t * Math.log(k)], 'kJ/mol'),
    working: `ΔG° = −RT ln K = −8.314 × ${t} × ln(${sig(k)}) = ${sig(dg)} kJ/mol`,
  };
}

/** Two-step stoichiometry: pyrite to sulfuric acid, limestone to slaked lime, haematite to iron. */
function chain(r: Rand): Calc {
  const route = pick(r, [
    { start: 'FeS2', end: 'H2SO4', ratio: 2, text: '4FeS2 + 11O2 → 2Fe2O3 + 8SO2, then each SO2 becomes one H2SO4 (via SO3)' },
    { start: 'CaCO3', end: 'Ca(OH)2', ratio: 1, text: 'CaCO3 → CaO + CO2, then CaO + H2O → Ca(OH)2' },
    { start: 'Fe2O3', end: 'FeSO4', ratio: 2, text: 'Fe2O3 + 3CO → 2Fe + 3CO2, then Fe + H2SO4 → FeSO4 + H2' },
    { start: 'NH3', end: 'HNO3', ratio: 1, text: '4NH3 + 5O2 → 4NO + 6H2O, 2NO + O2 → 2NO2, 4NO2 + O2 + 2H2O → 4HNO3' },
  ]);
  const tonnes = between(r, 1, 12, 0.5);
  const yieldPct = pick(r, [100, 95, 90, 85, 80]);
  const right = (((tonnes * 1e6) / mr(route.start)) * route.ratio * mr(route.end) * (yieldPct / 100)) / 1e6;
  return {
    kind: 'chain',
    prompt: `${route.text}. Overall yield ${yieldPct}%. Mass of ${(route.end)} (tonnes) from ${tonnes} t of ${(route.start)}? (Ar: ${arList([route.start, route.end], SCHOOL_AR)})`,
    ...numeric(r, right, [route.ratio === 1 ? right * 2 : right / route.ratio, (right * 100) / yieldPct, (tonnes * mr(route.end)) / mr(route.start)], 't'),
    working: `n(${route.start}) × ${route.ratio} = n(${route.end}); × Mr(${route.end}) × ${yieldPct}% = ${sig(right)} t`,
  };
}

function nernst(r: Rand): Calc {
  const cell = pick(r, [
    { text: 'Zn | Zn²⁺ || Cu²⁺ | Cu', e0: 1.1, n: 2, q: (a: number, b: number) => a / b, ions: ['Zn²⁺', 'Cu²⁺'] },
    { text: 'Zn | Zn²⁺ || Ag⁺ | Ag', e0: 1.56, n: 2, q: (a: number, b: number) => a / (b * b), ions: ['Zn²⁺', 'Ag⁺'] },
    { text: 'Fe | Fe²⁺ || Cu²⁺ | Cu', e0: 0.78, n: 2, q: (a: number, b: number) => a / b, ions: ['Fe²⁺', 'Cu²⁺'] },
  ]);
  const a = pick(r, [0.001, 0.01, 0.1, 0.5, 1, 2]);
  const b = pick(r, [0.001, 0.01, 0.1, 0.5, 1, 2]);
  if (a === b) return nernst(r);
  const e = cell.e0 - ((8.314 * 298) / (cell.n * 96485)) * Math.log(cell.q(a, b));
  const f3 = (v: number) => `${v.toFixed(3)} V`;
  const answer = f3(e);
  return {
    kind: 'nernst',
    prompt: `${cell.text}, E°cell = ${cell.e0.toFixed(2)} V. Cell potential at 298 K with [${cell.ions[0]}] = ${a} and [${cell.ions[1]}] = ${b} mol/dm³? (F = 96 485 C/mol)`,
    answer,
    options: options(
      r,
      answer,
      [f3(cell.e0 + ((8.314 * 298) / (cell.n * 96485)) * Math.log(cell.q(a, b))), f3(cell.e0 - ((8.314 * 298) / 96485) * Math.log(cell.q(a, b))), f3(cell.e0)],
      (k) => f3(e + 0.013 * k),
    ),
    working: `E = E° − (RT/nF) ln Q, Q = ${sig(cell.q(a, b))}: E = ${answer}`,
  };
}

function arrhenius(r: Rand): Calc {
  const t1 = pick(r, [290, 298, 300, 310]);
  const t2 = t1 + pick(r, [10, 15, 20, 25, 30]);
  const ea = between(r, 30, 120, 1);
  const ratio = Math.exp(((ea * 1000) / 8.314) * (1 / t1 - 1 / t2));
  const rr = Math.round(ratio * 100) / 100;
  const eaBack = (8.314 * Math.log(rr)) / (1 / t1 - 1 / t2) / 1000;
  return {
    kind: 'arrhenius',
    prompt: `A rate constant rises ${rr}-fold when the temperature goes from ${t1} K to ${t2} K. Activation energy, in kJ/mol? (R = 8.314 J/(mol·K))`,
    ...numeric(r, eaBack, [(8.314 * Math.log10(rr)) / (1 / t1 - 1 / t2) / 1000, (8.314 * Math.log(rr)) / (t2 - t1) / 1000, eaBack * 1000 / 8.314 / 10], 'kJ/mol'),
    working: `ln(k2/k1) = (Ea/R)(1/T1 − 1/T2) → Ea = 8.314 × ln ${rr} ÷ (${sig(1 / t1 - 1 / t2)}) = ${sig(eaBack)} kJ/mol`,
  };
}

/** Heating a NaHCO3 / Na2CO3 mixture: from the mass lost to the share of NaHCO3. */
function mixtureHeat(r: Rand): Calc {
  const total = between(r, 2, 10, 0.1);
  const share = between(r, 0.2, 0.85, 0.01);
  // 2NaHCO3 → Na2CO3 + H2O + CO2; mass lost per 2 mol NaHCO3 = H2O + CO2 = 62
  const loss = ((total * share) / (2 * mr('NaHCO3'))) * (mr('H2O') + mr('CO2'));
  const lost = Math.round(loss * 1000) / 1000;
  const right = ((lost / (mr('H2O') + mr('CO2'))) * 2 * mr('NaHCO3') * 100) / total;
  return {
    kind: 'mixture',
    prompt: `${total.toFixed(1)} g of a mixture of NaHCO3 and Na2CO3 is heated to constant mass and loses ${lost} g (2NaHCO3 → Na2CO3 + H2O + CO2). Percentage of NaHCO3 by mass? (Ar: Na 23, H 1, C 12, O 16)`,
    ...numeric(r, right, [right / 2, ((lost / mr('CO2')) * 2 * mr('NaHCO3') * 100) / total, (lost / total) * 100], '%'),
    working: `Loss = H2O + CO2 = 62 g per 2 mol NaHCO3: n = 2 × ${lost}/62; mass = n × 84; ÷ ${total.toFixed(1)} × 100 = ${sig(right)}%`,
  };
}

/** Back titration: limestone purity from excess acid. */
function backTitration(r: Rand): Calc {
  const mass = between(r, 0.8, 2.5, 0.05);
  const purity = between(r, 0.6, 0.98, 0.01);
  const acidC = 1;
  const acidV = 50;
  const nAcid = (acidC * acidV) / 1000;
  const used = (2 * (mass * purity)) / mr('CaCO3');
  const excess = nAcid - used;
  if (excess <= 0.004) return backTitration(r);
  const naohC = 1;
  const titre = Math.round(((excess / naohC) * 1000) * 100) / 100;
  const nCa = (nAcid - (naohC * titre) / 1000) / 2;
  const right = ((nCa * mr('CaCO3')) / mass) * 100;
  return {
    kind: 'back-titration',
    prompt: `${mass.toFixed(2)} g of limestone is dissolved in ${acidV}.0 cm³ of ${acidC.toFixed(2)} mol/dm³ HCl (excess). The leftover acid needs ${titre.toFixed(2)} cm³ of ${naohC.toFixed(2)} mol/dm³ NaOH. Percentage of CaCO3 in the limestone? (CaCO3 + 2HCl → CaCl2 + H2O + CO2; Mr CaCO3 = 100)`,
    ...numeric(r, right, [right * 2 > 100 ? right / 2 : right * 2, ((((naohC * titre) / 1000) / 2) * 100 * 100) / mass, (((nAcid - (naohC * titre) / 1000) * 100) / mass) * 100], '%'),
    working: `HCl left = ${sig((naohC * titre) / 1000)} mol; HCl used = ${sig(nAcid - (naohC * titre) / 1000)} mol; CaCO3 = half = ${sig(nCa)} mol = ${sig(nCa * 100)} g → ${sig(right)}%`,
  };
}

/** Which calculations each level draws from. */
export const CALCS_BY_LEVEL: Record<number, ((r: Rand) => Calc)[]> = {
  3: [formulaMass],
  4: [formulaMass, moles, percentMass],
  5: [moles, reactingMass, gasVolume, concentration],
  6: [reactingMass, limiting, titration, empirical],
  7: [limiting, titration, phStrong, idealGas, percentYield, kcFrom],
  8: [kcFrom, ice, (r) => weakAcid(r, false), buffer, phStrong],
  9: [ice, buffer, ksp, freeEnergy, chain],
  10: [ksp, freeEnergy, (r) => weakAcid(r, true), nernst, arrhenius, mixtureHeat, backTitration, chain],
};

export function makeCalc(level: number, r: Rand): Calc {
  const pool = CALCS_BY_LEVEL[Math.min(10, Math.max(3, level))]!;
  return pick(r, pool)(r);
}
