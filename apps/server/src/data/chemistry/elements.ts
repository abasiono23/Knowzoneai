/**
 * Element Quest: element samples in the lab cabinet. Data is standard (IUPAC atomic numbers, groups
 * 1–18, state at room temperature). `shells` is the electron arrangement taught in school (2,8,1);
 * only given for the first 20 elements.
 */
export type Category = 'alkali' | 'alkaline-earth' | 'transition' | 'post-transition' | 'metalloid' | 'nonmetal' | 'halogen' | 'noble';
export type State = 'solid' | 'liquid' | 'gas';

export type Element = {
  symbol: string;
  name: string;
  number: number;
  group: number;
  period: number;
  category: Category;
  state: State;
  shells?: string;
  /** Exists as two-atom molecules (H₂, O₂, Cl₂…). */
  diatomic?: boolean;
  fact: string;
};

export const ELEMENTS: Element[] = [
  {
    symbol: 'H',
    name: 'Hydrogen',
    number: 1,
    group: 1,
    period: 1,
    category: 'nonmetal',
    state: 'gas',
    shells: '1',
    diatomic: true,
    fact: 'The lightest element; it burns with a squeaky pop.',
  },
  {
    symbol: 'He',
    name: 'Helium',
    number: 2,
    group: 18,
    period: 1,
    category: 'noble',
    state: 'gas',
    shells: '2',
    fact: 'Lighter than air, so it fills party balloons.',
  },
  {
    symbol: 'Li',
    name: 'Lithium',
    number: 3,
    group: 1,
    period: 2,
    category: 'alkali',
    state: 'solid',
    shells: '2,1',
    fact: 'Used in phone and laptop batteries.',
  },
  {
    symbol: 'Be',
    name: 'Beryllium',
    number: 4,
    group: 2,
    period: 2,
    category: 'alkaline-earth',
    state: 'solid',
    shells: '2,2',
    fact: 'A light, strong metal used in aircraft parts.',
  },
  {
    symbol: 'B',
    name: 'Boron',
    number: 5,
    group: 13,
    period: 2,
    category: 'metalloid',
    state: 'solid',
    shells: '2,3',
    fact: 'Used in heat-resistant glassware.',
  },
  {
    symbol: 'C',
    name: 'Carbon',
    number: 6,
    group: 14,
    period: 2,
    category: 'nonmetal',
    state: 'solid',
    shells: '2,4',
    fact: 'Diamond and graphite are both made of it.',
  },
  {
    symbol: 'N',
    name: 'Nitrogen',
    number: 7,
    group: 15,
    period: 2,
    category: 'nonmetal',
    state: 'gas',
    shells: '2,5',
    diatomic: true,
    fact: 'Makes up about 78% of the air.',
  },
  {
    symbol: 'O',
    name: 'Oxygen',
    number: 8,
    group: 16,
    period: 2,
    category: 'nonmetal',
    state: 'gas',
    shells: '2,6',
    diatomic: true,
    fact: 'Relights a glowing splint.',
  },
  {
    symbol: 'F',
    name: 'Fluorine',
    number: 9,
    group: 17,
    period: 2,
    category: 'halogen',
    state: 'gas',
    shells: '2,7',
    diatomic: true,
    fact: 'The most reactive non-metal; fluoride protects teeth.',
  },
  {
    symbol: 'Ne',
    name: 'Neon',
    number: 10,
    group: 18,
    period: 2,
    category: 'noble',
    state: 'gas',
    shells: '2,8',
    fact: 'Glows orange-red in advertising signs.',
  },
  {
    symbol: 'Na',
    name: 'Sodium',
    number: 11,
    group: 1,
    period: 3,
    category: 'alkali',
    state: 'solid',
    shells: '2,8,1',
    fact: 'A soft metal kept under oil because it reacts with water.',
  },
  {
    symbol: 'Mg',
    name: 'Magnesium',
    number: 12,
    group: 2,
    period: 3,
    category: 'alkaline-earth',
    state: 'solid',
    shells: '2,8,2',
    fact: 'Burns with a dazzling white flame.',
  },
  {
    symbol: 'Al',
    name: 'Aluminium',
    number: 13,
    group: 13,
    period: 3,
    category: 'post-transition',
    state: 'solid',
    shells: '2,8,3',
    fact: 'Light and rust-free, used for cooking pots and cans.',
  },
  {
    symbol: 'Si',
    name: 'Silicon',
    number: 14,
    group: 14,
    period: 3,
    category: 'metalloid',
    state: 'solid',
    shells: '2,8,4',
    fact: 'Computer chips and solar cells are made from it.',
  },
  {
    symbol: 'P',
    name: 'Phosphorus',
    number: 15,
    group: 15,
    period: 3,
    category: 'nonmetal',
    state: 'solid',
    shells: '2,8,5',
    fact: 'Found in matches and in fertilisers.',
  },
  {
    symbol: 'S',
    name: 'Sulfur',
    number: 16,
    group: 16,
    period: 3,
    category: 'nonmetal',
    state: 'solid',
    shells: '2,8,6',
    fact: 'A yellow solid that burns with a blue flame.',
  },
  {
    symbol: 'Cl',
    name: 'Chlorine',
    number: 17,
    group: 17,
    period: 3,
    category: 'halogen',
    state: 'gas',
    shells: '2,8,7',
    diatomic: true,
    fact: 'A green-yellow gas used to make water safe to drink.',
  },
  {
    symbol: 'Ar',
    name: 'Argon',
    number: 18,
    group: 18,
    period: 3,
    category: 'noble',
    state: 'gas',
    shells: '2,8,8',
    fact: 'Fills light bulbs so the filament does not burn.',
  },
  {
    symbol: 'K',
    name: 'Potassium',
    number: 19,
    group: 1,
    period: 4,
    category: 'alkali',
    state: 'solid',
    shells: '2,8,8,1',
    fact: 'Gives a lilac flame; bananas contain it.',
  },
  {
    symbol: 'Ca',
    name: 'Calcium',
    number: 20,
    group: 2,
    period: 4,
    category: 'alkaline-earth',
    state: 'solid',
    shells: '2,8,8,2',
    fact: 'Bones, teeth and chalk all contain it.',
  },
  { symbol: 'Fe', name: 'Iron', number: 26, group: 8, period: 4, category: 'transition', state: 'solid', fact: 'Rusts in damp air; used to make steel.' },
  {
    symbol: 'Cu',
    name: 'Copper',
    number: 29,
    group: 11,
    period: 4,
    category: 'transition',
    state: 'solid',
    fact: 'Conducts electricity well, so it is used in wires.',
  },
  {
    symbol: 'Zn',
    name: 'Zinc',
    number: 30,
    group: 12,
    period: 4,
    category: 'transition',
    state: 'solid',
    fact: 'Coats iron roofing sheets to stop rust (galvanising).',
  },
  {
    symbol: 'Br',
    name: 'Bromine',
    number: 35,
    group: 17,
    period: 4,
    category: 'halogen',
    state: 'liquid',
    diatomic: true,
    fact: 'A red-brown liquid that gives off a choking vapour.',
  },
  { symbol: 'Kr', name: 'Krypton', number: 36, group: 18, period: 4, category: 'noble', state: 'gas', fact: 'Used in some bright camera flashes.' },
  {
    symbol: 'Ag',
    name: 'Silver',
    number: 47,
    group: 11,
    period: 5,
    category: 'transition',
    state: 'solid',
    fact: 'The best conductor of electricity of all metals.',
  },
  { symbol: 'Sn', name: 'Tin', number: 50, group: 14, period: 5, category: 'post-transition', state: 'solid', fact: 'Coats steel cans to stop them rusting.' },
  {
    symbol: 'I',
    name: 'Iodine',
    number: 53,
    group: 17,
    period: 5,
    category: 'halogen',
    state: 'solid',
    diatomic: true,
    fact: 'A grey-black solid that gives off purple vapour.',
  },
  { symbol: 'Xe', name: 'Xenon', number: 54, group: 18, period: 5, category: 'noble', state: 'gas', fact: 'Used in very bright car headlamps.' },
  { symbol: 'Au', name: 'Gold', number: 79, group: 11, period: 6, category: 'transition', state: 'solid', fact: 'So unreactive it never tarnishes.' },
  {
    symbol: 'Hg',
    name: 'Mercury',
    number: 80,
    group: 12,
    period: 6,
    category: 'transition',
    state: 'liquid',
    fact: 'The only metal that is liquid at room temperature.',
  },
  { symbol: 'Pb', name: 'Lead', number: 82, group: 14, period: 6, category: 'post-transition', state: 'solid', fact: 'A dense, soft metal; it is toxic.' },
];

/** What an element card shows at each level (harder levels show less, so you must reason). */
export type CardField = 'category' | 'group' | 'period' | 'state' | 'shells' | 'number' | 'fact';

export type Mission = {
  id: string;
  /** What the learner reads (English; the app shows it as is). */
  text: string;
  /** Which elements count. */
  test: (e: Element) => boolean;
  /** Elements that may be in the cabinet for this mission (targets and distractors). */
  pool?: (e: Element) => boolean;
  show: CardField[];
};

const first20 = (e: Element) => e.number <= 20;

export const MISSIONS: Record<number, Mission[]> = {
  1: [
    { id: 'noble', text: 'Collect the noble gases', test: (e) => e.category === 'noble', show: ['category', 'state', 'fact'] },
    { id: 'alkali', text: 'Collect the alkali metals', test: (e) => e.category === 'alkali', show: ['category', 'state', 'fact'] },
    { id: 'gases', text: 'Collect the elements that are gases at room temperature', test: (e) => e.state === 'gas', show: ['state', 'fact'] },
    { id: 'halogens', text: 'Collect the halogens', test: (e) => e.category === 'halogen', show: ['category', 'state', 'fact'] },
  ],
  2: [
    { id: 'group1', text: 'Collect the elements in Group 1', test: (e) => e.group === 1, show: ['group', 'period', 'fact'] },
    { id: 'group2', text: 'Collect the elements in Group 2', test: (e) => e.group === 2, show: ['group', 'period', 'fact'] },
    { id: 'period2', text: 'Collect the elements in Period 2', test: (e) => e.period === 2, show: ['group', 'period', 'fact'] },
    { id: 'transition', text: 'Collect the transition metals', test: (e) => e.category === 'transition', show: ['group', 'state', 'fact'] },
  ],
  3: [
    { id: 'outer1', text: 'Collect the elements with 1 electron in the outer shell', test: (e) => e.group === 1, pool: first20, show: ['shells', 'number'] },
    { id: 'outer7', text: 'Collect the elements with 7 electrons in the outer shell', test: (e) => e.group === 17, pool: first20, show: ['shells', 'number'] },
    { id: 'shells3', text: 'Collect the elements with exactly 3 electron shells', test: (e) => e.period === 3, pool: first20, show: ['shells', 'number'] },
    { id: 'full', text: 'Collect the elements with a full outer shell', test: (e) => e.group === 18, pool: first20, show: ['shells', 'number'] },
  ],
  4: [
    { id: 'liquid', text: 'Collect the elements that are liquid at room temperature', test: (e) => e.state === 'liquid', show: ['number', 'fact'] },
    { id: 'metalloid', text: 'Collect the metalloids', test: (e) => e.category === 'metalloid', show: ['number', 'fact'] },
    { id: 'conductors', text: 'Collect the Group 11 metals (the coinage metals)', test: (e) => e.group === 11, show: ['number', 'fact'] },
    { id: 'outer2', text: 'Collect the metals with 2 electrons in the outer shell', test: (e) => e.group === 2, pool: first20, show: ['shells', 'fact'] },
  ],
  5: [
    { id: 'diatomic', text: 'Collect the elements that exist as two-atom molecules', test: (e) => !!e.diatomic, show: ['number', 'state'] },
    { id: 'between', text: 'Collect the elements with atomic numbers between argon and iron', test: (e) => e.number > 18 && e.number < 26, show: ['number'] },
    {
      id: 'reactive-metals',
      text: 'Collect the metals that react with cold water to make hydrogen',
      test: (e) => e.category === 'alkali' || e.symbol === 'Ca',
      show: ['number', 'shells'],
    },
    {
      id: 'unreactive',
      text: 'Collect the elements that almost never react',
      test: (e) => e.category === 'noble' || e.symbol === 'Au',
      show: ['number', 'fact'],
    },
  ],
};
