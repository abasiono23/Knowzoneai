/**
 * Chemical formulas worked out in code, so no number in the games rests on a model's word: atoms in a
 * formula (brackets, hydrates and ion charges), molar masses, and balancing equations exactly (the
 * smallest whole numbers, by solving the atom and charge equations with rational arithmetic).
 *
 * Notation (plain text, the app draws subscripts and superscripts): "Ca(OH)2", "CuSO4.5H2O",
 * "MnO4^-", "Fe^3+", "Cr2O7^2-", "e^-" (an electron).
 */
import { BY_SYMBOL } from './periodic.js';

export type Parsed = { atoms: Record<string, number>; charge: number };

/** Atoms and charge of one species: "Ca(OH)2" → { Ca: 1, O: 2, H: 2 }, charge 0. Throws on bad input. */
export function parseSpecies(species: string): Parsed {
  const text = species.trim();
  if (text === 'e^-' || text === 'e-') return { atoms: {}, charge: -1 };
  const [body, chargeText] = text.split('^') as [string, string | undefined];
  let charge = 0;
  if (chargeText !== undefined) {
    const m = /^(\d*)([+-])$/.exec(chargeText);
    if (!m) throw new Error(`Bad charge in ${species}`);
    charge = (m[1] ? Number(m[1]) : 1) * (m[2] === '+' ? 1 : -1);
  }
  const atoms: Record<string, number> = {};
  for (const part of body.split(/[.·]/)) {
    const lead = /^(\d+)/.exec(part);
    const times = lead ? Number(lead[1]) : 1;
    const inner = parseGroup(lead ? part.slice(lead[1]!.length) : part);
    for (const [el, n] of Object.entries(inner)) atoms[el] = (atoms[el] ?? 0) + n * times;
  }
  return { atoms, charge };
}

function parseGroup(formula: string): Record<string, number> {
  let i = 0;
  const number = () => {
    const m = /^\d+/.exec(formula.slice(i));
    if (!m) return 1;
    i += m[0].length;
    return Number(m[0]);
  };
  const group = (): Record<string, number> => {
    const out: Record<string, number> = {};
    const add = (part: Record<string, number>, times: number) => {
      for (const [el, n] of Object.entries(part)) out[el] = (out[el] ?? 0) + n * times;
    };
    while (i < formula.length && formula[i] !== ')' && formula[i] !== ']') {
      if (formula[i] === '(' || formula[i] === '[') {
        i++;
        const inner = group();
        if (formula[i] !== ')' && formula[i] !== ']') throw new Error(`Unclosed bracket in ${formula}`);
        i++;
        add(inner, number());
      } else {
        const m = /^[A-Z][a-z]?/.exec(formula.slice(i));
        if (!m || !BY_SYMBOL[m[0]]) throw new Error(`Bad formula ${formula}`);
        i += m[0].length;
        add({ [m[0]]: 1 }, number());
      }
    }
    return out;
  };
  const out = group();
  if (i !== formula.length) throw new Error(`Bad formula ${formula}`);
  return out;
}

/** Atoms only (the old helper's shape). */
export const atomsOf = (formula: string) => parseSpecies(formula).atoms;

/** Molar mass (g/mol) with the given relative atomic masses (standard ones by default). */
export function molarMass(formula: string, masses: Record<string, number> = {}) {
  const { atoms } = parseSpecies(formula);
  return Object.entries(atoms).reduce((sum, [el, n]) => sum + n * (masses[el] ?? BY_SYMBOL[el]!.mass), 0);
}

/** The relative atomic masses used in school exams (WAEC, GCSE), e.g. Cl = 35.5. */
export const SCHOOL_AR: Record<string, number> = {
  H: 1,
  He: 4,
  Li: 7,
  C: 12,
  N: 14,
  O: 16,
  F: 19,
  Na: 23,
  Mg: 24,
  Al: 27,
  Si: 28,
  P: 31,
  S: 32,
  Cl: 35.5,
  K: 39,
  Ca: 40,
  Cr: 52,
  Mn: 55,
  Fe: 56,
  Cu: 63.5,
  Zn: 65,
  Br: 80,
  Ag: 108,
  I: 127,
  Ba: 137,
  Pb: 207,
};

// ─── Balancing ────────────────────────────────────────────────────────────────

const babs = (a: bigint) => (a < 0n ? -a : a);
const bgcd = (a: bigint, b: bigint): bigint => (b === 0n ? babs(a) : bgcd(b, a % b));

/**
 * The smallest whole-number coefficients that balance atoms and charge, or null when there is no single
 * answer (no balance, or several independent ones).
 */
export function balance(reactants: string[], products: string[]): number[] | null {
  const species = [...reactants, ...products].map(parseSpecies);
  const elements = [...new Set(species.flatMap((s) => Object.keys(s.atoms)))];
  const rows = [...elements.map((el) => species.map((s) => s.atoms[el] ?? 0)), species.map((s) => s.charge)].map((row) =>
    row.map((v, k) => BigInt(k < reactants.length ? v : -v)),
  );
  const n = species.length;
  // Fraction-free row reduction to reduced row echelon form (each row scaled to whole numbers).
  const m = rows.map((r) => [...r]);
  const pivots: number[] = [];
  let r = 0;
  for (let c = 0; c < n && r < m.length; c++) {
    const p = m.findIndex((row, k) => k >= r && row[c] !== 0n);
    if (p < 0) continue;
    [m[r], m[p]] = [m[p]!, m[r]!];
    for (let k = 0; k < m.length; k++) {
      if (k === r || m[k]![c] === 0n) continue;
      const a = m[r]![c]!;
      const b = m[k]![c]!;
      m[k] = m[k]!.map((v, j) => v * a - m[r]![j]! * b);
      const g = m[k]!.reduce((x, y) => bgcd(x, y), 0n);
      if (g > 1n) m[k] = m[k]!.map((v) => v / g);
    }
    pivots.push(c);
    r++;
  }
  const free = [...Array(n).keys()].filter((c) => !pivots.includes(c));
  if (free.length !== 1) return null;
  const f = free[0]!;
  // x_f = L (common multiple of pivot values); each pivot variable from its row.
  const lcm = pivots.reduce((acc, c, k) => {
    const a = babs(m[k]![c]!);
    return (acc * a) / bgcd(acc, a);
  }, 1n);
  const x: bigint[] = Array(n).fill(0n);
  x[f] = lcm;
  pivots.forEach((c, k) => {
    x[c] = (-m[k]![f]! * lcm) / m[k]![c]!;
  });
  const sign = x[0]! < 0n ? -1n : 1n;
  const pos = x.map((v) => v * sign);
  if (pos.some((v) => v <= 0n)) return null;
  const g = pos.reduce((a, b) => bgcd(a, b), 0n);
  return pos.map((v) => Number(v / g));
}

/** Whether these coefficients balance atoms and charge with the smallest whole numbers. */
export function isBalancedWith(reactants: string[], products: string[], coefficients: number[]) {
  const species = [...reactants, ...products];
  if (coefficients.length !== species.length || coefficients.some((c) => !Number.isInteger(c) || c < 1)) return false;
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  if (coefficients.reduce(gcd) !== 1) return false;
  const total: Record<string, number> = {};
  species.forEach((s, k) => {
    const { atoms, charge } = parseSpecies(s);
    const sign = k < reactants.length ? 1 : -1;
    for (const [el, n] of Object.entries(atoms)) total[el] = (total[el] ?? 0) + sign * n * coefficients[k]!;
    total['^'] = (total['^'] ?? 0) + sign * charge * coefficients[k]!;
  });
  return Object.values(total).every((v) => v === 0);
}

/** "2H2 + O2 → 2H2O" */
export function equationText(reactants: string[], products: string[], coefficients: number[]) {
  const side = (list: string[], offset: number) =>
    list.map((s, k) => `${coefficients[offset + k] === 1 ? '' : coefficients[offset + k]}${s}`).join(' + ');
  return `${side(reactants, 0)} → ${side(products, reactants.length)}`;
}

/** Splits "Zn + 2HCl → ZnCl2 + H2" into species and coefficients (for checking written equations). */
export function parseEquation(text: string): { reactants: string[]; products: string[]; coefficients: number[] } | null {
  const sides = text.split(/→|->|⇌|=/);
  if (sides.length !== 2) return null;
  const coefficients: number[] = [];
  const read = (side: string) =>
    side
      .split(/\s\+\s/)
      .map((t) => t.trim().replace(/\((aq|s|l|g)\)/g, ''))
      .filter(Boolean)
      .map((t) => {
        const m = /^(\d+)\s*(?=[A-Z(\[e])/.exec(t);
        coefficients.push(m ? Number(m[1]) : 1);
        return m ? t.slice(m[0].length) : t;
      });
  try {
    const reactants = read(sides[0]!);
    const products = read(sides[1]!);
    [...reactants, ...products].forEach(parseSpecies);
    return { reactants, products, coefficients };
  } catch {
    return null;
  }
}
