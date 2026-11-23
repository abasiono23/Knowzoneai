/**
 * Element Quest missions, worked out from the periodic table data (periodic.ts) rather than written by
 * hand, so every answer set is exact: from finding sodium (Starter) to riddles that combine ion
 * configurations, magnetic moments and ionisation-energy trends (Super hard), each checked to have the
 * answer set it says.
 */
import {
  AUFBAU_EXCEPTIONS,
  BY_SYMBOL,
  commonIon,
  configOf,
  configText,
  ionConfig,
  outerElectrons,
  PERIODIC,
  shellsText,
  spinOnly,
  SUCCESSIVE_IE,
  unpaired,
  type Atom,
} from './periodic.js';

type Rand = () => number;
const pick = <T>(r: Rand, list: readonly T[]) => list[Math.floor(r() * list.length)]!;

/** What the table shows: how many elements, and whether cells are coloured by family (a hint). */
export type TableView = { upTo: number; colours: boolean };
/** What tapping a cell tells you (the info line under the table). */
export type InfoField = 'name' | 'number' | 'category' | 'state' | 'shells' | 'config' | 'mass' | 'en' | 'ie1' | 'fact';

export type Mission = {
  id: string;
  text: string;
  targets: string[];
  /** Exactly one answer (the app says "Find…" rather than "Select all…"). */
  single: boolean;
  view: TableView;
  info: InfoField[];
  /** Shown after answering, to teach. */
  why: string;
};

const upTo = (n: number) => PERIODIC.filter((a) => a.number <= n);
const syms = (list: Atom[]) => list.map((a) => a.symbol);
const SUP: Record<string, string> = { '+': '⁺', '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const ionText = (sym: string, charge: number) =>
  `${sym}${`${Math.abs(charge) === 1 ? '' : Math.abs(charge)}${charge > 0 ? '+' : '-'}`.replace(/./g, (c) => SUP[c]!)}`;
const CATEGORY_TEXT: Record<string, string> = {
  alkali: 'alkali metals',
  'alkaline-earth': 'alkaline earth metals',
  halogen: 'halogens',
  noble: 'noble gases',
  transition: 'transition metals',
  metalloid: 'metalloids',
};

/** The ions Period 4 d-block metals really form (for ion puzzles). */
const IONS: Record<string, number[]> = { Sc: [3], Ti: [2, 3], V: [2, 3], Cr: [2, 3], Mn: [2, 3], Fe: [2, 3], Co: [2, 3], Ni: [2], Cu: [1, 2], Zn: [2] };
const forms = (a: Atom, charge: number) => (IONS[a.symbol] ?? []).includes(charge);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

type Gen = (r: Rand) => Omit<Mission, 'view' | 'info'> | null;

// ─── 1 Starter: names and families in the first 20, colours on ────────────────
const findByName: (n: number) => Gen = (n) => (r) => {
  const a = pick(r, upTo(n));
  return { id: `name-${a.symbol}`, text: `Find ${a.name}`, targets: [a.symbol], single: true, why: `${a.name} is ${a.symbol}, number ${a.number}.` };
};
const family: (n: number, cats: string[]) => Gen = (n, cats) => (r) => {
  const cat = pick(r, cats);
  const t = upTo(n).filter((a) => a.category === cat);
  return { id: `family-${cat}`, text: `Select all the ${CATEGORY_TEXT[cat]}`, targets: syms(t), single: false, why: `The ${CATEGORY_TEXT[cat]} here: ${syms(t).join(', ')}.` };
};
const gasesAt: (n: number) => Gen = (n) => () => {
  const t = upTo(n).filter((a) => a.state === 'gas');
  return { id: 'gases', text: 'Select all the elements that are gases at room temperature', targets: syms(t), single: false, why: `Gases at 25 °C: ${syms(t).join(', ')}.` };
};

// ─── 2 Beginner: groups, periods, metals ──────────────────────────────────────
const group: (n: number) => Gen = (n) => (r) => {
  const g = pick(r, [1, 2, 13, 14, 15, 16, 17, 18]);
  const t = upTo(n).filter((a) => a.group === g);
  return { id: `group-${g}`, text: `Select every element in Group ${g}`, targets: syms(t), single: false, why: `Group ${g} is a column: ${syms(t).join(', ')}.` };
};
const period: (n: number) => Gen = (n) => (r) => {
  const p = pick(r, [2, 3]);
  const t = upTo(n).filter((a) => a.period === p);
  return { id: `period-${p}`, text: `Select every element in Period ${p}`, targets: syms(t), single: false, why: `Period ${p} is a row: ${syms(t).join(', ')}.` };
};
const bySymbol: (n: number) => Gen = (n) => (r) => {
  const a = pick(r, upTo(n).filter((x) => x.symbol[0] !== x.name[0] || ['Na', 'K', 'Fe', 'Cu', 'Ag', 'Au', 'Pb', 'Sn', 'Hg'].includes(x.symbol)));
  return { id: `name-${a.symbol}`, text: `Find ${a.name}`, targets: [a.symbol], single: true, why: `${a.name}: ${a.symbol}.` };
};

// ─── 3 Elementary: electron arrangement (2,8,1) ──────────────────────────────
const arrangement: Gen = (r) => {
  const a = pick(r, upTo(20).filter((x) => x.number > 2));
  return { id: `shells-${a.symbol}`, text: `Find the element with electron arrangement ${shellsText(a.number)}`, targets: [a.symbol], single: true, why: `${shellsText(a.number)} adds up to ${a.number} electrons: ${a.name}.` };
};
const outer: Gen = (r) => {
  const k = pick(r, [1, 2, 3, 5, 6, 7]);
  const t = upTo(20).filter((a) => a.symbol !== 'He' && outerElectrons(a.number) === k);
  return { id: `outer-${k}`, text: `Select every element with ${k} electron${k > 1 ? 's' : ''} in its outer shell`, targets: syms(t), single: false, why: `${k} outer electrons: Group ${k <= 2 ? k : k + 10} — ${syms(t).join(', ')}.` };
};
const shellCount: Gen = (r) => {
  const k = pick(r, [2, 3]);
  const t = upTo(20).filter((a) => a.period === k);
  return { id: `shells-n-${k}`, text: `Select every element whose atoms have exactly ${k} occupied electron shells`, targets: syms(t), single: false, why: `${k} shells means Period ${k}.` };
};

// ─── 4 Intermediate: the first 36 ────────────────────────────────────────────
const byNumber: Gen = (r) => {
  const a = pick(r, upTo(36).filter((x) => x.number > 20));
  return { id: `z-${a.number}`, text: `Find the element with atomic number ${a.number}`, targets: [a.symbol], single: true, why: `Atomic number ${a.number} is ${a.name}.` };
};
const diatomic: Gen = () => {
  const t = upTo(36).filter((a) => a.diatomic);
  return { id: 'diatomic', text: 'Select every element that exists as two-atom molecules (like H₂)', targets: syms(t), single: false, why: `H₂, N₂, O₂, F₂, Cl₂ and Br₂.` };
};
const period4Transition: Gen = () => {
  const t = upTo(36).filter((a) => a.block === 'd');
  return { id: 'd4', text: 'Select every transition metal in Period 4', targets: syms(t), single: false, why: 'Scandium to zinc fill the 3d subshell.' };
};
const metalloids: Gen = () => {
  const t = upTo(36).filter((a) => a.category === 'metalloid');
  return { id: 'metalloids', text: 'Select every metalloid', targets: syms(t), single: false, why: 'B, Si, Ge and As sit on the staircase between metals and non-metals.' };
};

// ─── 5 Upper-intermediate: trends ────────────────────────────────────────────
const mostEn: Gen = (r) => {
  const p = pick(r, [2, 3, 4]);
  const row = upTo(36).filter((a) => a.period === p && a.en && a.category !== 'noble');
  const best = row.reduce((x, y) => (y.en! > x.en! ? y : x));
  return { id: `en-${p}`, text: `Find the most electronegative element in Period ${p}`, targets: [best.symbol], single: true, why: `Electronegativity rises across a period: ${best.symbol} (${best.en}).` };
};
const largestAtom: Gen = (r) => {
  const p = pick(r, [2, 3, 4]);
  const a = upTo(36).find((x) => x.period === p && x.group === 1)!;
  return { id: `radius-${p}`, text: `Find the element with the largest atoms in Period ${p}`, targets: [a.symbol], single: true, why: `Atoms shrink across a period as the nuclear charge grows, so Group 1 (${a.symbol}) is largest.` };
};
const lowestIeGroup: Gen = (r) => {
  const g = pick(r, [1, 2, 17]);
  const col = upTo(36).filter((a) => a.group === g && a.ie1 && a.symbol !== 'H');
  const best = col.reduce((x, y) => (y.ie1! < x.ie1! ? y : x));
  return { id: `ie-low-${g}`, text: `Find the element in Group ${g} (up to krypton) that loses an electron most easily`, targets: [best.symbol], single: true, why: `First ionisation energy falls down a group: ${best.symbol} (${best.ie1} kJ/mol).` };
};
const formsIon: Gen = (r) => {
  const charge = pick(r, [1, 2, -1, -2]);
  const t = upTo(20).filter((a) => commonIon(a) === charge);
  return { id: `ion-${charge}`, text: `Select every element (up to calcium) that usually forms ${charge > 0 ? '+' : '−'}${Math.abs(charge)} ions`, targets: syms(t), single: false, why: `Group ${charge > 0 ? charge : 18 + charge} elements ${charge > 0 ? 'lose' : 'gain'} ${Math.abs(charge)} electron${Math.abs(charge) > 1 ? 's' : ''}: ${syms(t).join(', ')}.` };
};

// ─── 6 Advanced: s, p, d configurations ──────────────────────────────────────
const byConfig: Gen = (r) => {
  const a = pick(r, upTo(36).filter((x) => x.number > 10));
  return { id: `config-${a.symbol}`, text: `Find the atom with ground state ${configText(configOf(a.number))}`, targets: [a.symbol], single: true, why: `${configText(configOf(a.number))} is ${a.name}.` };
};
const unpairedIn: Gen = (r) => {
  const p = pick(r, [2, 3, 4]);
  const n = pick(r, p === 4 ? [2, 3, 4, 5] : [1, 2, 3]);
  const t = upTo(36).filter((a) => a.period === p && unpaired(configOf(a.number)) === n);
  if (!t.length) return null;
  return { id: `unpaired-${p}-${n}`, text: `Select every Period ${p} atom with exactly ${plural(n, 'unpaired electron')} in its ground state`, targets: syms(t), single: false, why: t.map((a) => `${a.symbol} ${configText(configOf(a.number))}`).join('; ') };
};
const highestIe: Gen = (r) => {
  const p = pick(r, [2, 3, 4]);
  const row = upTo(36).filter((a) => a.period === p);
  const best = row.reduce((x, y) => (y.ie1! > x.ie1! ? y : x));
  return { id: `ie-high-${p}`, text: `Find the Period ${p} element with the highest first ionisation energy`, targets: [best.symbol], single: true, why: `The noble gas, with a full outer shell: ${best.symbol} (${best.ie1} kJ/mol).` };
};
const blockOf: Gen = (r) => {
  const [p, b] = pick(r, [
    [3, 'p'],
    [4, 'p'],
    [4, 's'],
    [2, 'p'],
  ] as const);
  const t = upTo(36).filter((a) => a.period === p && a.block === b);
  return { id: `block-${p}${b}`, text: `Select every ${b}-block element in Period ${p}`, targets: syms(t), single: false, why: `Their last electron goes into a ${b} subshell.` };
};

// ─── 7 Proficient: ions, anomalies ───────────────────────────────────────────
const ieDips: Gen = (r) => {
  const p = pick(r, [2, 3]);
  const row = upTo(18).filter((a) => a.period === p);
  const t = row.filter((a, k) => k > 0 && a.ie1! < row[k - 1]!.ie1!);
  return {
    id: `dips-${p}`,
    text: `Select every Period ${p} element whose first ionisation energy is LOWER than that of the element before it`,
    targets: syms(t),
    single: false,
    why: `${t[0]!.symbol}: a new p subshell starts; ${t[1]!.symbol}: the first paired p electron repels its partner.`,
  };
};
const ionConfigFind: Gen = (r) => {
  const charge = pick(r, [2, 3]);
  const a = pick(r, upTo(30).filter((x) => x.block === 'd' && forms(x, charge)));
  const c = ionConfig(a.number, charge);
  const text = configText(c);
  const t = upTo(30).filter((x) => x.block === 'd' && forms(x, charge) && configText(ionConfig(x.number, charge)) === text);
  return { id: `ion-config-${a.symbol}${charge}`, text: `Find the metal whose ${charge}+ ion has the configuration ${text}`, targets: syms(t), single: t.length === 1, why: `${ionText(a.symbol, charge)}: the 4s electrons leave first, then 3d.` };
};
const isoelectronic: Gen = (r) => {
  const core = pick(r, [10, 18]);
  const t = upTo(20).filter((a) => {
    const q = commonIon(a);
    return q !== null && a.number - q === core;
  });
  return {
    id: `iso-${core}`,
    text: `Select every element (up to calcium) whose usual ion has the same electron arrangement as ${core === 10 ? 'neon' : 'argon'}`,
    targets: syms(t),
    single: false,
    why: t.map((a) => ionText(a.symbol, commonIon(a)!)).join(', ') + ` all have ${core} electrons.`,
  };
};

// ─── 8 Expert: successive IEs, 4d exceptions, d-electron counts ──────────────
const successive: Gen = (r) => {
  const sym = pick(r, ['Na', 'Mg', 'Al', 'Si']);
  const ie = SUCCESSIVE_IE[sym]!;
  return { id: `successive-${sym}`, text: `A Period 3 element's first four ionisation energies are ${ie.join(', ')} kJ/mol. Find it`, targets: [sym], single: true, why: `The big jump comes after electron ${BY_SYMBOL[sym]!.group > 2 ? BY_SYMBOL[sym]!.group - 10 : BY_SYMBOL[sym]!.group}: that many outer electrons.` };
};
const exceptions: Gen = (r) => {
  const p = pick(r, [4, 5]);
  const t = PERIODIC.filter((a) => a.period === p && AUFBAU_EXCEPTIONS.includes(a.number));
  return { id: `aufbau-${p}`, text: `Select every Period ${p} element whose ground state breaks the usual filling order`, targets: syms(t), single: false, why: t.map((a) => `${a.symbol} ${configText(configOf(a.number))}`).join('; ') };
};
const dCount: Gen = (r) => {
  const charge = pick(r, [2, 3]);
  const n = pick(r, charge === 2 ? [3, 4, 5, 6, 7, 8, 9] : [0, 2, 3, 4, 5, 6]);
  const t = upTo(30).filter((a) => forms(a, charge) && (ionConfig(a.number, charge)['3d'] ?? 0) === n);
  if (!t.length) return null;
  return { id: `d${n}-${charge}`, text: `Select every Period 4 d-block metal whose ${charge}+ ion is d${n === 0 ? '⁰' : `${n}`.replace(/\d/g, (d) => SUP[d]!)}`, targets: syms(t), single: false, why: t.map((a) => `${ionText(a.symbol, charge)} ${configText(ionConfig(a.number, charge))}`).join('; ') };
};

// ─── 9 Master: magnetic moments, whole table ─────────────────────────────────
const moment: Gen = (r) => {
  const charge = pick(r, [2, 3]);
  const n = pick(r, [1, 2, 3, 4, 5]);
  const t = upTo(30).filter((a) => forms(a, charge) && unpaired(ionConfig(a.number, charge)) === n);
  if (!t.length) return null;
  return {
    id: `moment-${charge}-${n}`,
    text: `Select every Period 4 d-block metal whose ${charge}+ ion (high spin) has a spin-only magnetic moment of ${spinOnly(n).toFixed(2)} BM`,
    targets: syms(t),
    single: false,
    why: `μ = √(n(n+2)) gives n = ${n} unpaired electrons: ${t.map((a) => ionText(a.symbol, charge)).join(', ')}.`,
  };
};
const heavyFamily: Gen = (r) => {
  const [text, test, why] = pick(r, [
    ['Select every coinage metal (Group 11)', (a: Atom) => a.group === 11, 'Cu, Ag and Au (and Rg).'],
    ['Select every element that is liquid at room temperature', (a: Atom) => a.state === 'liquid', 'Only bromine and mercury.'],
    ['Select every noble gas', (a: Atom) => a.category === 'noble', 'Group 18.'],
    ['Select every metalloid', (a: Atom) => a.category === 'metalloid', 'B, Si, Ge, As, Sb and Te.'],
    ['Select every d-block element with a full d subshell in its ground state in Period 5', (a: Atom) => a.period === 5 && a.block === 'd' && (configOf(a.number)['4d'] ?? 0) === 10, 'Pd, Ag and Cd.'],
  ] as const);
  const t = upTo(86).filter(test);
  return { id: `heavy-${text.length}`, text, targets: syms(t), single: false, why };
};

// ─── 10 Super hard: riddles with a unique answer ─────────────────────────────
type Clue = { text: string; test: (a: Atom) => boolean };
const riddle: Gen = (r) => {
  const pool = upTo(54).filter((a) => a.block !== 'f');
  for (let tries = 0; tries < 40; tries++) {
    const a = pick(r, pool.filter((x) => x.number > 10));
    const clues: Clue[] = [];
    const cfg = configOf(a.number);
    const charges = IONS[a.symbol] ?? [];
    if (charges.length) {
      const charge = pick(r, charges);
      const n = unpaired(ionConfig(a.number, charge));
      clues.push({ text: `it forms a ${charge}+ ion with a spin-only moment of ${spinOnly(n).toFixed(2)} BM (high spin)`, test: (x) => forms(x, charge) && unpaired(ionConfig(x.number, charge)) === n });
      clues.push({ text: `the neutral atom has ${plural(unpaired(cfg), 'unpaired electron')}`, test: (x) => unpaired(configOf(x.number)) === unpaired(cfg) });
    } else if (a.block === 'd') {
      clues.push({ text: `it is a d-block metal whose atom has ${plural(unpaired(cfg), 'unpaired electron')}`, test: (x) => x.block === 'd' && unpaired(configOf(x.number)) === unpaired(cfg) });
      clues.push({ text: `its ground state has ${plural(cfg[`${a.period}s`] ?? 0, `${a.period}s electron`)}`, test: (x) => (configOf(x.number)[`${x.period}s`] ?? 0) === (cfg[`${a.period}s`] ?? 0) && x.block === 'd' });
    } else {
      clues.push({ text: `its atom has ${plural(unpaired(cfg), 'unpaired electron')}`, test: (x) => unpaired(configOf(x.number)) === unpaired(cfg) });
      clues.push({ text: `it is a main-group element with ${outerElectrons(a.number)} electrons in its outer shell`, test: (x) => outerElectrons(x.number) === outerElectrons(a.number) && x.block !== 'd' });
    }
    clues.push({ text: `it is in Period ${a.period}`, test: (x) => x.period === a.period });
    if (a.en) clues.push({ text: `its electronegativity is ${a.en > 2 ? 'above' : 'below'} 2.0`, test: (x) => !!x.en && (x.en > 2) === (a.en! > 2) });
    // Use the fewest clues (2 or 3) that leave one element.
    for (const k of [2, 3]) {
      const use = clues.slice(0, k);
      const fits = pool.filter((x) => use.every((c) => c.test(x)));
      if (fits.length === 1 && fits[0] === a) {
        const sentence = use.map((c) => c.text).join('; ');
        return { id: `riddle-${a.symbol}`, text: `${sentence[0]!.toUpperCase()}${sentence.slice(1)}. Find it (elements 1–54)`, targets: [a.symbol], single: true, why: `${a.name}: ${configText(cfg)}.` };
      }
    }
  }
  return null;
};
const momentPair: Gen = (r) => {
  const n = pick(r, [0, 2, 3, 4, 5]);
  const t = upTo(30).filter((a) => [2, 3].some((q) => forms(a, q) && unpaired(ionConfig(a.number, q)) === n));
  return {
    id: `pair-${n}`,
    text: `Select every Period 4 d-block metal with a 2+ OR 3+ ion that has ${n} unpaired electrons (high spin)`,
    targets: syms(t),
    single: false,
    why: t
      .map((a) => [2, 3].filter((q) => forms(a, q) && unpaired(ionConfig(a.number, q)) === n).map((q) => ionText(a.symbol, q)).join(', '))
      .join('; '),
  };
};

/** Each level: the table you see, what tapping a cell tells you, and the missions it draws from. */
export const ELEMENT_LEVELS: Record<number, { view: TableView; info: InfoField[]; gens: Gen[] }> = {
  1: { view: { upTo: 20, colours: true }, info: ['name', 'number', 'category', 'state', 'fact'], gens: [findByName(20), family(20, ['alkali', 'noble', 'halogen', 'alkaline-earth']), gasesAt(20)] },
  2: { view: { upTo: 20, colours: true }, info: ['name', 'number', 'category', 'state'], gens: [group(20), period(20), bySymbol(20)] },
  3: { view: { upTo: 20, colours: false }, info: ['name', 'number', 'shells'], gens: [arrangement, outer, shellCount] },
  4: { view: { upTo: 36, colours: false }, info: ['name', 'number', 'state'], gens: [byNumber, diatomic, period4Transition, metalloids, family(36, ['halogen', 'noble', 'alkali'])] },
  5: { view: { upTo: 36, colours: false }, info: ['name', 'number'], gens: [mostEn, largestAtom, lowestIeGroup, formsIon] },
  6: { view: { upTo: 36, colours: false }, info: ['name', 'number'], gens: [byConfig, unpairedIn, highestIe, blockOf] },
  7: { view: { upTo: 36, colours: false }, info: ['name', 'number'], gens: [ieDips, ionConfigFind, isoelectronic, unpairedIn] },
  8: { view: { upTo: 54, colours: false }, info: ['name', 'number'], gens: [successive, exceptions, dCount, ionConfigFind] },
  9: { view: { upTo: 86, colours: false }, info: ['name'], gens: [moment, heavyFamily, dCount, exceptions] },
  10: { view: { upTo: 54, colours: false }, info: [], gens: [riddle, momentPair, moment, riddle] },
};

/** Missions for a run: different kinds where possible, never the same mission twice. */
export function makeMissions(level: number, r: Rand, count: number): Mission[] {
  const spec = ELEMENT_LEVELS[Math.min(10, Math.max(1, level))]!;
  const out: Mission[] = [];
  const gens = [...spec.gens];
  for (let tries = 0; out.length < count && tries < 60; tries++) {
    const gen = gens[tries % gens.length]!;
    const m = gen(r);
    if (!m || !m.targets.length || out.some((o) => o.id === m.id)) continue;
    out.push({ ...m, view: spec.view, info: spec.info });
  }
  // Shuffle the order a little (the first kind isn't always first).
  return out.sort(() => r() - 0.5);
}
