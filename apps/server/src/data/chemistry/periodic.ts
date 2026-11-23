/**
 * The whole periodic table (118 elements) for Element Quest and the chemistry calculations, with the
 * electron configurations worked out in code. Sources: IUPAC standard atomic weights (abridged, 2021;
 * mass numbers in brackets for elements with no stable isotope), Pauling electronegativities and first
 * ionisation energies (CRC Handbook) for elements 1–36, where the game asks about trends. Rows were
 * checked by a second model (scripts/chemistry-content.ts, stage `periodic`) and by test/chemistry.test.ts.
 */
import { ELEMENTS as SCHOOL } from './elements.js';

export type Category =
  | 'alkali'
  | 'alkaline-earth'
  | 'transition'
  | 'post-transition'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble'
  | 'lanthanide'
  | 'actinide';
export type State = 'solid' | 'liquid' | 'gas';
export type Block = 's' | 'p' | 'd' | 'f';

export type Atom = {
  number: number;
  symbol: string;
  name: string;
  /** Standard atomic weight (g/mol); a mass number for elements with no stable isotope. */
  mass: number;
  /** 1–18; 0 for the f-block rows (lanthanides and actinides, drawn under the table). */
  group: number;
  period: number;
  block: Block;
  category: Category;
  /** At 25 °C and 1 atm. */
  state: State;
  /** Pauling electronegativity (elements 1–36; none for He, Ne, Ar). */
  en?: number;
  /** First ionisation energy, kJ/mol (elements 1–36). */
  ie1?: number;
  diatomic?: boolean;
  /** A short school fact, for the common elements. */
  fact?: string;
};

// number symbol name mass
const ROWS = `1 H Hydrogen 1.008|2 He Helium 4.0026|3 Li Lithium 6.94|4 Be Beryllium 9.0122|5 B Boron 10.81|6 C Carbon 12.011|7 N Nitrogen 14.007|8 O Oxygen 15.999|9 F Fluorine 18.998|10 Ne Neon 20.180|11 Na Sodium 22.990|12 Mg Magnesium 24.305|13 Al Aluminium 26.982|14 Si Silicon 28.085|15 P Phosphorus 30.974|16 S Sulfur 32.06|17 Cl Chlorine 35.45|18 Ar Argon 39.95|19 K Potassium 39.098|20 Ca Calcium 40.078|21 Sc Scandium 44.956|22 Ti Titanium 47.867|23 V Vanadium 50.942|24 Cr Chromium 51.996|25 Mn Manganese 54.938|26 Fe Iron 55.845|27 Co Cobalt 58.933|28 Ni Nickel 58.693|29 Cu Copper 63.546|30 Zn Zinc 65.38|31 Ga Gallium 69.723|32 Ge Germanium 72.630|33 As Arsenic 74.922|34 Se Selenium 78.971|35 Br Bromine 79.904|36 Kr Krypton 83.798|37 Rb Rubidium 85.468|38 Sr Strontium 87.62|39 Y Yttrium 88.906|40 Zr Zirconium 91.224|41 Nb Niobium 92.906|42 Mo Molybdenum 95.95|43 Tc Technetium 98|44 Ru Ruthenium 101.07|45 Rh Rhodium 102.91|46 Pd Palladium 106.42|47 Ag Silver 107.87|48 Cd Cadmium 112.41|49 In Indium 114.82|50 Sn Tin 118.71|51 Sb Antimony 121.76|52 Te Tellurium 127.60|53 I Iodine 126.90|54 Xe Xenon 131.29|55 Cs Caesium 132.91|56 Ba Barium 137.33|57 La Lanthanum 138.91|58 Ce Cerium 140.12|59 Pr Praseodymium 140.91|60 Nd Neodymium 144.24|61 Pm Promethium 145|62 Sm Samarium 150.36|63 Eu Europium 151.96|64 Gd Gadolinium 157.25|65 Tb Terbium 158.93|66 Dy Dysprosium 162.50|67 Ho Holmium 164.93|68 Er Erbium 167.26|69 Tm Thulium 168.93|70 Yb Ytterbium 173.05|71 Lu Lutetium 174.97|72 Hf Hafnium 178.49|73 Ta Tantalum 180.95|74 W Tungsten 183.84|75 Re Rhenium 186.21|76 Os Osmium 190.23|77 Ir Iridium 192.22|78 Pt Platinum 195.08|79 Au Gold 196.97|80 Hg Mercury 200.59|81 Tl Thallium 204.38|82 Pb Lead 207.2|83 Bi Bismuth 208.98|84 Po Polonium 209|85 At Astatine 210|86 Rn Radon 222|87 Fr Francium 223|88 Ra Radium 226|89 Ac Actinium 227|90 Th Thorium 232.04|91 Pa Protactinium 231.04|92 U Uranium 238.03|93 Np Neptunium 237|94 Pu Plutonium 244|95 Am Americium 243|96 Cm Curium 247|97 Bk Berkelium 247|98 Cf Californium 251|99 Es Einsteinium 252|100 Fm Fermium 257|101 Md Mendelevium 258|102 No Nobelium 259|103 Lr Lawrencium 266|104 Rf Rutherfordium 267|105 Db Dubnium 268|106 Sg Seaborgium 269|107 Bh Bohrium 270|108 Hs Hassium 277|109 Mt Meitnerium 278|110 Ds Darmstadtium 281|111 Rg Roentgenium 282|112 Cn Copernicium 285|113 Nh Nihonium 286|114 Fl Flerovium 289|115 Mc Moscovium 290|116 Lv Livermorium 293|117 Ts Tennessine 294|118 Og Oganesson 294`;

/** Pauling electronegativity, elements 1–36 (0 = none: the lighter noble gases). */
const EN = [2.2, 0, 0.98, 1.57, 2.04, 2.55, 3.04, 3.44, 3.98, 0, 0.93, 1.31, 1.61, 1.9, 2.19, 2.58, 3.16, 0, 0.82, 1.0, 1.36, 1.54, 1.63, 1.66, 1.55, 1.83, 1.88, 1.91, 1.9, 1.65, 1.81, 2.01, 2.18, 2.55, 2.96, 3.0];
/** First ionisation energy (kJ/mol), elements 1–36. */
const IE1 = [1312, 2372, 520, 900, 801, 1086, 1402, 1314, 1681, 2081, 496, 738, 578, 787, 1012, 1000, 1251, 1521, 419, 590, 633, 659, 651, 653, 717, 762, 760, 737, 745, 906, 579, 762, 947, 941, 1140, 1351];
/** The first four ionisation energies (kJ/mol) of the Period 3 elements, for successive-IE puzzles. */
export const SUCCESSIVE_IE: Record<string, [number, number, number, number]> = {
  Na: [496, 4562, 6910, 9543],
  Mg: [738, 1451, 7733, 10543],
  Al: [578, 1817, 2745, 11577],
  Si: [787, 1577, 3232, 4356],
  P: [1012, 1907, 2914, 4964],
  S: [1000, 2252, 3357, 4556],
  Cl: [1251, 2298, 3822, 5159],
  Ar: [1521, 2666, 3931, 5771],
};

const ALKALI = ['Li', 'Na', 'K', 'Rb', 'Cs', 'Fr'];
const ALKALINE = ['Be', 'Mg', 'Ca', 'Sr', 'Ba', 'Ra'];
const POST = ['Al', 'Ga', 'In', 'Sn', 'Tl', 'Pb', 'Bi', 'Po', 'Nh', 'Fl', 'Mc', 'Lv'];
const METALLOID = ['B', 'Si', 'Ge', 'As', 'Sb', 'Te'];
const NONMETAL = ['H', 'C', 'N', 'O', 'P', 'S', 'Se'];
const HALOGEN = ['F', 'Cl', 'Br', 'I', 'At', 'Ts'];
const NOBLE = ['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn', 'Og'];
const GASES = ['H', 'He', 'N', 'O', 'F', 'Ne', 'Cl', 'Ar', 'Kr', 'Xe', 'Rn'];
const LIQUIDS = ['Br', 'Hg'];
const DIATOMIC = ['H', 'N', 'O', 'F', 'Cl', 'Br', 'I'];

function place(z: number): { period: number; group: number } {
  const starts = [1, 3, 11, 19, 37, 55, 87, 119];
  const period = starts.findIndex((s, i) => z >= s && z < starts[i + 1]!) + 1;
  const k = z - starts[period - 1]!; // 0-based position in its period
  if (period === 1) return { period, group: z === 1 ? 1 : 18 };
  if (period <= 3) return { period, group: k < 2 ? k + 1 : k + 11 };
  if (period <= 5) return { period, group: k + 1 };
  // Periods 6 and 7: two s elements, fifteen f-row elements (La–Lu, Ac–Lr), then groups 4–18.
  if (k < 2) return { period, group: k + 1 };
  if (k < 17) return { period, group: 0 };
  return { period, group: k - 13 };
}

function categoryOf(symbol: string, z: number, group: number, period: number): Category {
  if (ALKALI.includes(symbol)) return 'alkali';
  if (ALKALINE.includes(symbol)) return 'alkaline-earth';
  if (HALOGEN.includes(symbol)) return 'halogen';
  if (NOBLE.includes(symbol)) return 'noble';
  if (METALLOID.includes(symbol)) return 'metalloid';
  if (NONMETAL.includes(symbol)) return 'nonmetal';
  if (POST.includes(symbol)) return 'post-transition';
  if (group === 0) return period === 6 ? 'lanthanide' : 'actinide';
  return z > 0 ? 'transition' : 'nonmetal';
}

export const PERIODIC: Atom[] = ROWS.split('|').map((row) => {
  const [n, symbol, name, mass] = row.split(' ') as [string, string, string, string];
  const number = Number(n);
  const { period, group } = place(number);
  const category = categoryOf(symbol, number, group, period);
  const block: Block = group === 0 ? 'f' : group <= 2 || symbol === 'He' ? 's' : group <= 12 ? 'd' : 'p';
  const school = SCHOOL.find((e) => e.symbol === symbol);
  return {
    number,
    symbol,
    name,
    mass: Number(mass),
    group,
    period,
    block,
    category,
    state: GASES.includes(symbol) ? 'gas' : LIQUIDS.includes(symbol) ? 'liquid' : 'solid',
    ...(number <= 36 && EN[number - 1] ? { en: EN[number - 1] } : {}),
    ...(number <= 36 ? { ie1: IE1[number - 1] } : {}),
    ...(DIATOMIC.includes(symbol) && { diatomic: true }),
    ...(school && { fact: school.fact }),
  };
});
export const BY_SYMBOL: Record<string, Atom> = Object.fromEntries(PERIODIC.map((a) => [a.symbol, a]));

// ─── Electron configurations ─────────────────────────────────────────────────

/** Subshells in filling (Madelung) order. */
const ORDER: [number, number][] = [];
for (let sum = 1; sum <= 8; sum++)
  for (let n = 1; n <= sum; n++) {
    const l = sum - n;
    if (l < n && l <= 3) ORDER.push([n, l]);
  }
const L = 'spdf';
const CAP = (l: number) => 2 * (2 * l + 1);

/** Ground states that break the filling order (elements up to 103), as changes to the Madelung filling. */
const EXCEPTIONS: Record<number, Record<string, number>> = {
  24: { '3d': 5, '4s': 1 },
  29: { '3d': 10, '4s': 1 },
  41: { '4d': 4, '5s': 1 },
  42: { '4d': 5, '5s': 1 },
  44: { '4d': 7, '5s': 1 },
  45: { '4d': 8, '5s': 1 },
  46: { '4d': 10, '5s': 0 },
  47: { '4d': 10, '5s': 1 },
  57: { '4f': 0, '5d': 1 },
  58: { '4f': 1, '5d': 1 },
  64: { '4f': 7, '5d': 1 },
  78: { '5d': 9, '6s': 1 },
  79: { '5d': 10, '6s': 1 },
  89: { '5f': 0, '6d': 1 },
  90: { '5f': 0, '6d': 2 },
  91: { '5f': 2, '6d': 1 },
  92: { '5f': 3, '6d': 1 },
  93: { '5f': 4, '6d': 1 },
  96: { '5f': 7, '6d': 1 },
};
/** Elements whose ground state is not the plain filling order. */
export const AUFBAU_EXCEPTIONS = Object.keys(EXCEPTIONS).map(Number);

export type Config = Record<string, number>; // "3d" → electrons

/** The ground-state configuration of a neutral atom. */
export function configOf(z: number): Config {
  const out: Config = {};
  let left = z;
  for (const [n, l] of ORDER) {
    if (left <= 0) break;
    const k = Math.min(left, CAP(l));
    out[`${n}${L[l]}`] = k;
    left -= k;
  }
  for (const [sub, k] of Object.entries(EXCEPTIONS[z] ?? {})) out[sub] = k;
  for (const sub of Object.keys(out)) if (!out[sub]) delete out[sub];
  return out;
}

/** An ion's configuration: electrons leave the highest shell first (4s before 3d), then the highest l. */
export function ionConfig(z: number, charge: number): Config {
  const out = { ...configOf(z) };
  if (charge < 0) {
    // Anions of main-group elements: fill the next free places in order.
    let add = -charge;
    for (const [n, l] of ORDER) {
      if (!add) break;
      const sub = `${n}${L[l]}`;
      const room = CAP(l) - (out[sub] ?? 0);
      const k = Math.min(room, add);
      if (k > 0) out[sub] = (out[sub] ?? 0) + k;
      add -= k;
    }
    return out;
  }
  let remove = charge;
  while (remove > 0) {
    const subs = Object.keys(out)
      .filter((s) => out[s]! > 0)
      .sort((a, b) => Number(b[0]) - Number(a[0]) || L.indexOf(b[1]!) - L.indexOf(a[1]!));
    const top = subs[0];
    if (!top) break;
    out[top]! -= 1;
    if (!out[top]) delete out[top];
    remove--;
  }
  return out;
}

/** Unpaired electrons by Hund's rule (high spin). */
export function unpaired(config: Config) {
  return Object.entries(config).reduce((sum, [sub, k]) => {
    const orbitals = 2 * L.indexOf(sub[1]!) + 1;
    return sum + (k <= orbitals ? k : 2 * orbitals - k);
  }, 0);
}

/** Spin-only magnetic moment (Bohr magnetons), to 2 decimal places. */
export const spinOnly = (n: number) => Math.round(Math.sqrt(n * (n + 2)) * 100) / 100;

const NOBLE_CORE = [86, 54, 36, 18, 10, 2];
const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const sup = (n: number) => String(n).replace(/\d/g, (d) => SUP[d]!);

/** "[Ar] 3d⁵ 4s¹": the noble-gas core, then the rest by shell. */
export function configText(config: Config) {
  const total = Object.values(config).reduce((a, b) => a + b, 0);
  let core = 0;
  for (const c of NOBLE_CORE) {
    if (c >= total) continue;
    const coreConfig = configOf(c);
    if (Object.entries(coreConfig).every(([s, k]) => (config[s] ?? 0) >= k)) {
      core = c;
      break;
    }
  }
  const coreConfig = core ? configOf(core) : {};
  const rest = Object.entries(config)
    .map(([s, k]) => [s, k - (coreConfig[s] ?? 0)] as const)
    .filter(([, k]) => k > 0)
    .sort(([a], [b]) => Number(a[0]) - Number(b[0]) || L.indexOf(a[1]!) - L.indexOf(b[1]!))
    .map(([s, k]) => `${s}${sup(k)}`);
  const head = core ? `[${PERIODIC[core - 1]!.symbol}]` : '';
  return [head, ...rest].filter(Boolean).join(' ') || '(no electrons)';
}

/** "2,8,1": electrons per shell, as taught for the first 20 elements. */
export function shellsText(z: number) {
  const shells: number[] = [];
  for (const [sub, k] of Object.entries(configOf(z))) {
    const n = Number(sub[0]);
    shells[n - 1] = (shells[n - 1] ?? 0) + k;
  }
  return shells.map((k) => k ?? 0).join(',');
}

/** Electrons in the outer shell. */
export function outerElectrons(z: number) {
  const c = configOf(z);
  const top = Math.max(...Object.keys(c).map((s) => Number(s[0])));
  return Object.entries(c)
    .filter(([s]) => Number(s[0]) === top)
    .reduce((a, [, k]) => a + k, 0);
}

/** The usual ion of a main-group element (Group 1 → +1 … Group 17 → −1), or null. */
export function commonIon(a: Atom): number | null {
  if (a.symbol === 'H') return null;
  if (a.group === 1) return 1;
  if (a.group === 2) return 2;
  if (a.symbol === 'Al') return 3;
  if (a.group === 15 && a.period <= 3) return -3;
  if (a.group === 16 && a.period <= 4) return -2;
  if (a.group === 17 && a.period <= 5) return -1;
  return null;
}
