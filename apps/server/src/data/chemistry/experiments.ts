/**
 * Chemical Mixture Lab: real school experiments (WAEC/NECO practical chemistry). Each mixes two
 * reagents from the shelves in a piece of glassware, shows what a learner would actually see, and
 * asks what it shows. Colours are the ones seen in the lab (hex, for the app's drawing).
 */
export type Glassware = 'beaker' | 'tube' | 'flask';

export type Reagent = {
  id: string;
  name: string;
  /** Plain digits (H2SO4); the app shows them as subscripts. */
  formula: string;
  /** What it looks like in the bottle. */
  colour: string;
  bottle: 'clear' | 'brown' | 'dropper' | 'solid';
};

export const REAGENTS: Reagent[] = [
  { id: 'cuso4', name: 'Copper(II) sulfate solution', formula: 'CuSO4', colour: '#3BA4F6', bottle: 'clear' },
  { id: 'naoh', name: 'Sodium hydroxide solution', formula: 'NaOH', colour: '#EAF4FF', bottle: 'clear' },
  { id: 'hcl', name: 'Dilute hydrochloric acid', formula: 'HCl', colour: '#EAF4FF', bottle: 'clear' },
  { id: 'h2so4', name: 'Dilute sulfuric acid', formula: 'H2SO4', colour: '#EAF4FF', bottle: 'clear' },
  { id: 'agno3', name: 'Silver nitrate solution', formula: 'AgNO3', colour: '#EAF4FF', bottle: 'brown' },
  { id: 'nacl', name: 'Sodium chloride solution', formula: 'NaCl', colour: '#EAF4FF', bottle: 'clear' },
  { id: 'na2co3', name: 'Sodium carbonate solution', formula: 'Na2CO3', colour: '#EAF4FF', bottle: 'clear' },
  { id: 'mg', name: 'Magnesium ribbon', formula: 'Mg', colour: '#C9CED6', bottle: 'solid' },
  { id: 'zn', name: 'Zinc granules', formula: 'Zn', colour: '#B8BEC6', bottle: 'solid' },
  { id: 'fe', name: 'Iron nail', formula: 'Fe', colour: '#8A8F96', bottle: 'solid' },
  { id: 'phth', name: 'Phenolphthalein indicator', formula: 'phenolphthalein', colour: '#F4F7FB', bottle: 'dropper' },
  { id: 'univ', name: 'Universal indicator', formula: 'universal indicator', colour: '#5BBF6A', bottle: 'dropper' },
  { id: 'fecl3', name: 'Iron(III) chloride solution', formula: 'FeCl3', colour: '#D99A2B', bottle: 'clear' },
  { id: 'feso4', name: 'Iron(II) sulfate solution', formula: 'FeSO4', colour: '#B9DDB0', bottle: 'clear' },
  { id: 'pbno3', name: 'Lead(II) nitrate solution', formula: 'Pb(NO3)2', colour: '#EAF4FF', bottle: 'clear' },
  { id: 'ki', name: 'Potassium iodide solution', formula: 'KI', colour: '#EAF4FF', bottle: 'clear' },
  { id: 'bacl2', name: 'Barium chloride solution', formula: 'BaCl2', colour: '#EAF4FF', bottle: 'clear' },
  { id: 'na2so4', name: 'Sodium sulfate solution', formula: 'Na2SO4', colour: '#EAF4FF', bottle: 'clear' },
  { id: 'nh3', name: 'Ammonia solution', formula: 'NH3', colour: '#EAF4FF', bottle: 'clear' },
  { id: 'znso4', name: 'Zinc sulfate solution', formula: 'ZnSO4', colour: '#EAF4FF', bottle: 'clear' },
  { id: 'kmno4', name: 'Acidified potassium manganate(VII)', formula: 'KMnO4', colour: '#7B1FA2', bottle: 'brown' },
  { id: 'iodine', name: 'Iodine solution', formula: 'I2', colour: '#B5651D', bottle: 'brown' },
  { id: 'starch', name: 'Starch solution', formula: 'starch', colour: '#F1F1EC', bottle: 'clear' },
  { id: 'nh4cl', name: 'Ammonium chloride', formula: 'NH4Cl', colour: '#FFFFFF', bottle: 'solid' },
];

export type Observation = {
  /** Colour of the liquid after mixing. */
  liquid: string;
  /** A solid that forms and settles (precipitate), if any. */
  precipitate?: string;
  /** Bubbles of gas. */
  gas?: boolean;
  /** A coating forms on a solid (displacement). */
  coating?: string;
  /** What the learner reads under the drawing. */
  text: string;
};

export type Experiment = {
  id: string;
  title: string;
  reagents: [string, string];
  glassware: Glassware;
  observation: Observation;
  question: string;
  answer: string;
  wrong: [string, string];
  /** Shown after answering, to teach. */
  equation: string;
};

export const EXPERIMENTS: Record<number, Experiment[]> = {
  1: [
    {
      id: 'cu-oh',
      title: 'Make copper(II) hydroxide',
      reagents: ['cuso4', 'naoh'],
      glassware: 'tube',
      observation: { liquid: '#9FD3FA', precipitate: '#4AA3E8', text: 'A pale blue precipitate forms' },
      question: 'What formed?',
      answer: 'Copper(II) hydroxide',
      wrong: ['Sodium chloride', 'Hydrogen gas'],
      equation: 'CuSO4 + 2NaOH → Cu(OH)2 + Na2SO4',
    },
    {
      id: 'phth-alkali',
      title: 'Test an alkali with an indicator',
      reagents: ['naoh', 'phth'],
      glassware: 'tube',
      observation: { liquid: '#E84393', text: 'The colourless solution turns pink' },
      question: 'What does this show?',
      answer: 'The solution is an alkali',
      wrong: ['The solution is an acid', 'The solution is neutral'],
      equation: 'Phenolphthalein is pink in alkalis and colourless in acids',
    },
    {
      id: 'mg-hcl',
      title: 'Add magnesium to an acid',
      reagents: ['hcl', 'mg'],
      glassware: 'tube',
      observation: { liquid: '#EAF4FF', gas: true, text: 'Fizzing; the magnesium disappears' },
      question: 'Which gas is given off?',
      answer: 'Hydrogen',
      wrong: ['Oxygen', 'Carbon dioxide'],
      equation: 'Mg + 2HCl → MgCl2 + H2',
    },
    {
      id: 'carbonate-acid',
      title: 'Add acid to a carbonate',
      reagents: ['na2co3', 'hcl'],
      glassware: 'beaker',
      observation: { liquid: '#EAF4FF', gas: true, text: 'Effervescence (lots of bubbles)' },
      question: 'Which gas is given off?',
      answer: 'Carbon dioxide',
      wrong: ['Hydrogen', 'Chlorine'],
      equation: 'Na2CO3 + 2HCl → 2NaCl + H2O + CO2',
    },
  ],
  2: [
    {
      id: 'agcl',
      title: 'Test for chloride ions',
      reagents: ['nacl', 'agno3'],
      glassware: 'tube',
      observation: { liquid: '#F2F4F7', precipitate: '#FFFFFF', text: 'A white precipitate forms' },
      question: 'What formed?',
      answer: 'Silver chloride',
      wrong: ['Sodium nitrate', 'Silver oxide'],
      equation: 'AgNO3 + NaCl → AgCl + NaNO3',
    },
    {
      id: 'fe3-oh',
      title: 'Test for iron(III) ions',
      reagents: ['fecl3', 'naoh'],
      glassware: 'tube',
      observation: { liquid: '#E9C08A', precipitate: '#9A4A1C', text: 'A red-brown precipitate forms' },
      question: 'What formed?',
      answer: 'Iron(III) hydroxide',
      wrong: ['Iron(II) hydroxide', 'Sodium chloride'],
      equation: 'FeCl3 + 3NaOH → Fe(OH)3 + 3NaCl',
    },
    {
      id: 'fe2-oh',
      title: 'Test for iron(II) ions',
      reagents: ['feso4', 'naoh'],
      glassware: 'tube',
      observation: { liquid: '#CFE3C8', precipitate: '#4E7D45', text: 'A dirty green precipitate forms' },
      question: 'What formed?',
      answer: 'Iron(II) hydroxide',
      wrong: ['Iron(III) hydroxide', 'Copper(II) hydroxide'],
      equation: 'FeSO4 + 2NaOH → Fe(OH)2 + Na2SO4',
    },
    {
      id: 'univ-acid',
      title: 'Measure an acid with universal indicator',
      reagents: ['hcl', 'univ'],
      glassware: 'tube',
      observation: { liquid: '#E53935', text: 'The indicator turns red' },
      question: 'What is the pH range?',
      answer: 'Strongly acidic (pH 1–2)',
      wrong: ['Neutral (pH 7)', 'Alkaline (pH 12)'],
      equation: 'Universal indicator: red for strong acids, green for neutral, purple for strong alkalis',
    },
  ],
  3: [
    {
      id: 'pbi2',
      title: 'Make a yellow precipitate',
      reagents: ['pbno3', 'ki'],
      glassware: 'tube',
      observation: { liquid: '#FFF4B8', precipitate: '#FFD400', text: 'A bright yellow precipitate forms' },
      question: 'What formed?',
      answer: 'Lead(II) iodide',
      wrong: ['Potassium nitrate', 'Lead(II) oxide'],
      equation: 'Pb(NO3)2 + 2KI → PbI2 + 2KNO3',
    },
    {
      id: 'baso4',
      title: 'Mix barium chloride and sulfuric acid',
      reagents: ['bacl2', 'h2so4'],
      glassware: 'tube',
      observation: { liquid: '#F2F4F7', precipitate: '#FFFFFF', text: 'A dense white precipitate forms' },
      question: 'What formed?',
      answer: 'Barium sulfate',
      wrong: ['Barium chloride', 'Hydrogen chloride gas'],
      equation: 'BaCl2 + H2SO4 → BaSO4 + 2HCl',
    },
    {
      id: 'neutralise',
      title: 'Neutralise an alkali',
      reagents: ['naoh', 'hcl'],
      glassware: 'flask',
      observation: { liquid: '#EAF4FF', text: 'The flask gets warm; the solution stays colourless' },
      question: 'What type of reaction is this?',
      answer: 'Neutralisation',
      wrong: ['Precipitation', 'Combustion'],
      equation: 'NaOH + HCl → NaCl + H2O',
    },
    {
      id: 'zn-acid',
      title: 'Add zinc to sulfuric acid',
      reagents: ['h2so4', 'zn'],
      glassware: 'tube',
      observation: { liquid: '#EAF4FF', gas: true, text: 'Steady bubbles; the zinc slowly dissolves' },
      question: 'Which salt forms?',
      answer: 'Zinc sulfate',
      wrong: ['Zinc chloride', 'Zinc oxide'],
      equation: 'Zn + H2SO4 → ZnSO4 + H2',
    },
  ],
  4: [
    {
      id: 'cu-nh3',
      title: 'Add excess ammonia to copper(II) ions',
      reagents: ['cuso4', 'nh3'],
      glassware: 'tube',
      observation: { liquid: '#1A3FB8', text: 'A precipitate forms, then dissolves into a deep blue solution' },
      question: 'Which ion does this test show?',
      answer: 'Copper(II) ions (Cu²⁺)',
      wrong: ['Iron(II) ions (Fe²⁺)', 'Zinc ions (Zn²⁺)'],
      equation: 'Excess ammonia gives a deep blue solution with Cu²⁺',
    },
    {
      id: 'agi',
      title: 'Test for iodide ions',
      reagents: ['ki', 'agno3'],
      glassware: 'tube',
      observation: { liquid: '#FFF9DA', precipitate: '#F2E28A', text: 'A pale yellow precipitate forms' },
      question: 'Which ion does this test show?',
      answer: 'Iodide ions (I⁻)',
      wrong: ['Chloride ions (Cl⁻)', 'Carbonate ions (CO₃²⁻)'],
      equation: 'AgNO3 + KI → AgI + KNO3',
    },
    {
      id: 'sulfate-test',
      title: 'Test for sulfate ions',
      reagents: ['na2so4', 'bacl2'],
      glassware: 'tube',
      observation: { liquid: '#F2F4F7', precipitate: '#FFFFFF', text: 'A white precipitate forms' },
      question: 'Which ion does this test show?',
      answer: 'Sulfate ions (SO₄²⁻)',
      wrong: ['Chloride ions (Cl⁻)', 'Nitrate ions (NO₃⁻)'],
      equation: 'BaCl2 + Na2SO4 → BaSO4 + 2NaCl',
    },
    {
      id: 'zn-oh',
      title: 'Test for zinc ions',
      reagents: ['znso4', 'naoh'],
      glassware: 'tube',
      observation: { liquid: '#F2F4F7', precipitate: '#FFFFFF', text: 'A white precipitate forms (it dissolves in excess)' },
      question: 'What is the white precipitate?',
      answer: 'Zinc hydroxide',
      wrong: ['Zinc oxide', 'Sodium sulfate'],
      equation: 'ZnSO4 + 2NaOH → Zn(OH)2 + Na2SO4',
    },
  ],
  5: [
    {
      id: 'fe-cu',
      title: 'Put an iron nail in copper(II) sulfate',
      reagents: ['cuso4', 'fe'],
      glassware: 'beaker',
      observation: { liquid: '#B9DDB0', coating: '#B5651D', text: 'The blue colour fades and a brown coating forms on the nail' },
      question: 'What type of reaction is this?',
      answer: 'Displacement (redox)',
      wrong: ['Neutralisation', 'Decomposition'],
      equation: 'Fe + CuSO4 → FeSO4 + Cu',
    },
    {
      id: 'mno4-fe',
      title: 'Add iron(II) sulfate to purple manganate(VII)',
      reagents: ['kmno4', 'feso4'],
      glassware: 'tube',
      observation: { liquid: '#F7EFC9', text: 'The purple colour disappears' },
      question: 'What happened to the iron(II) ions?',
      answer: 'They were oxidised',
      wrong: ['They were reduced', 'Nothing happened to them'],
      equation: 'MnO₄⁻ is reduced while Fe²⁺ is oxidised to Fe³⁺',
    },
    {
      id: 'starch',
      title: 'Test for starch',
      reagents: ['starch', 'iodine'],
      glassware: 'tube',
      observation: { liquid: '#1B1F3B', text: 'The solution turns blue-black' },
      question: 'What does this show?',
      answer: 'Starch is present',
      wrong: ['Glucose is present', 'Protein is present'],
      equation: 'Iodine turns blue-black with starch',
    },
    {
      id: 'ammonia-gas',
      title: 'Warm ammonium chloride with an alkali',
      reagents: ['nh4cl', 'naoh'],
      glassware: 'tube',
      observation: { liquid: '#EAF4FF', gas: true, text: 'A pungent gas turns damp red litmus blue' },
      question: 'Which gas is given off?',
      answer: 'Ammonia',
      wrong: ['Hydrogen', 'Chlorine'],
      equation: 'NH4Cl + NaOH → NaCl + H2O + NH3',
    },
  ],
};
