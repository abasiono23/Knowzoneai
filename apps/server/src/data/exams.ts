/**
 * Past Questions: the exams, their subjects and paper formats, and each subject's syllabus topics
 * (used to spread AI practice papers across the syllabus and to break scores down by topic).
 * Formats follow the real objective papers closely; topics follow the public JAMB UTME and
 * WAEC/NECO SSCE syllabuses, the College Board's digital SAT content domains and AP course units, the
 * ACT's reporting categories, the GCSE and A-level subject content the AQA, Edexcel and OCR
 * specifications share, Kenya's secondary syllabus (KICD, examined by KNEC) and South Africa's CAPS
 * curriculum for Grades 10–12. Topic names are shown in English, like the questions themselves.
 *
 * Which exams a student sees first depends on their study region (see REGION_EXAMS below).
 */
export const EXAMS = ['jamb', 'waec', 'neco', 'sat', 'act', 'ap', 'gcse', 'alevel', 'kcse', 'nsc'] as const;
export type Exam = (typeof EXAMS)[number];

/** The West African school-certificate subjects (JAMB, WAEC and NECO share them). */
export const SSCE_SUBJECTS = [
  'english',
  'mathematics',
  'physics',
  'chemistry',
  'biology',
  'economics',
  'government',
  'literature',
  'geography',
  'commerce',
] as const;
export type SsceSubject = (typeof SSCE_SUBJECTS)[number];

export const SAT_SUBJECTS = ['reading-writing', 'math'] as const;
export const GCSE_SUBJECTS = ['maths', 'english-language', 'biology', 'chemistry', 'physics'] as const;

export const ACT_SUBJECTS = ['english', 'math', 'reading', 'science'] as const;
/** AP: the multiple-choice section of each exam. */
export const AP_SUBJECTS = ['calculus-ab', 'biology', 'chemistry', 'physics-1', 'us-history', 'english-language'] as const;
export const ALEVEL_SUBJECTS = ['maths', 'biology', 'chemistry', 'physics', 'economics'] as const;
/** Kenya Certificate of Secondary Education. */
export const KCSE_SUBJECTS = ['mathematics', 'english', 'biology', 'chemistry', 'physics'] as const;
/** South Africa's National Senior Certificate ("Matric"). */
export const NSC_SUBJECTS = ['mathematics', 'physical-sciences', 'life-sciences', 'accounting', 'geography'] as const;

/** Every subject id any exam uses. An exam only has the ones in EXAM_SUBJECTS_OF. */
export const EXAM_SUBJECTS = [
  ...SSCE_SUBJECTS,
  ...SAT_SUBJECTS,
  'maths',
  'english-language',
  'reading',
  'science',
  'calculus-ab',
  'physics-1',
  'us-history',
  'physical-sciences',
  'life-sciences',
  'accounting',
] as const;
export type ExamSubject = (typeof EXAM_SUBJECTS)[number];

export const EXAM_SUBJECTS_OF: Record<Exam, readonly ExamSubject[]> = {
  jamb: SSCE_SUBJECTS,
  waec: SSCE_SUBJECTS,
  neco: SSCE_SUBJECTS,
  sat: SAT_SUBJECTS,
  act: ACT_SUBJECTS,
  ap: AP_SUBJECTS,
  gcse: GCSE_SUBJECTS,
  alevel: ALEVEL_SUBJECTS,
  kcse: KCSE_SUBJECTS,
  nsc: NSC_SUBJECTS,
};

/**
 * Exams whose papers here are our own practice in another shape than the exam's: topic quizzes for
 * exams that are mostly written answers. Nothing may call these the exam's format.
 */
export const TOPIC_QUIZ_EXAMS: readonly Exam[] = ['gcse', 'alevel', 'kcse', 'nsc'];
export const hasSubject = (exam: Exam, subject: ExamSubject) => EXAM_SUBJECTS_OF[exam].includes(subject);

/**
 * Questions and minutes in one paper.
 * - JAMB: one subject's share of the 2-hour CBT. WAEC and NECO: the objective paper.
 * - SAT: one whole section of the digital SAT (both modules together): Reading and Writing is 54
 *   questions in 64 minutes, Math is 44 questions in 70 minutes. Ours are multiple choice only (the
 *   real Math section also has student-produced answers).
 * - ACT: one whole section of the enhanced ACT (2025): English 50 questions in 35 minutes, Math 45
 *   in 50, Reading 36 in 40, Science 40 in 40.
 * - AP: the multiple-choice section of each exam, never the free-response one: Calculus AB 45
 *   questions in 105 minutes, Biology and Chemistry 60 in 90, Physics 1 40 in 80, US History 55 in
 *   55, English Language 45 in 60.
 * - GCSE, A-level, KCSE and Matric (NSC): the real papers are mostly written answers, so these are our
 *   own topic quizzes, not the exam's format: 30 multiple-choice questions in 35 minutes (40 for
 *   A-level, whose questions take longer).
 */
export function paperFormat(exam: Exam, subject: ExamSubject) {
  if (exam === 'jamb') return subject === 'english' ? { questions: 60, minutes: 40 } : { questions: 40, minutes: 27 };
  if (exam === 'waec') return { questions: 50, minutes: 60 };
  if (exam === 'sat') return subject === 'math' ? { questions: 44, minutes: 70 } : { questions: 54, minutes: 64 };
  if (exam === 'act')
    return (
      { english: { questions: 50, minutes: 35 }, math: { questions: 45, minutes: 50 }, reading: { questions: 36, minutes: 40 } } as Partial<
        Record<ExamSubject, { questions: number; minutes: number }>
      >
    )[subject] ?? { questions: 40, minutes: 40 };
  if (exam === 'ap')
    return (
      {
        'calculus-ab': { questions: 42, minutes: 100 },
        'physics-1': { questions: 42, minutes: 85 },
        'us-history': { questions: 55, minutes: 55 },
        'english-language': { questions: 45, minutes: 60 },
      } as Partial<Record<ExamSubject, { questions: number; minutes: number }>>
    )[subject] ?? { questions: 60, minutes: 90 };
  if (exam === 'alevel') return { questions: 30, minutes: 40 };
  if (exam === 'gcse' || exam === 'kcse' || exam === 'nsc') return { questions: 30, minutes: 35 };
  return { questions: 60, minutes: 60 };
}

// ─── Study regions ────────────────────────────────────────────────────────────

/**
 * A study region is an ISO 3166-1 alpha-2 country code ("ZZ" = another country). Accounts made
 * before regions existed have none and count as Nigeria, which is what they always saw.
 */
export const DEFAULT_REGION = 'NG';
export const OTHER_REGION = 'ZZ';
export const isRegion = (code: unknown): code is string => typeof code === 'string' && /^[A-Z]{2}$/.test(code);

/**
 * The exams with papers here that each region sits. JAMB and NECO are Nigeria-only; the other WAEC
 * member countries sit the WASSCE. Regions that aren't listed have no papers yet, so they get none
 * rather than another country's exams.
 * The app has the same table (apps/mobile/src/lib/region.ts): keep them in step.
 */
export const REGION_EXAMS: Record<string, readonly Exam[]> = {
  NG: ['jamb', 'waec', 'neco'],
  GH: ['waec'],
  SL: ['waec'],
  LR: ['waec'],
  GM: ['waec'],
  US: ['sat', 'act', 'ap'],
  GB: ['gcse', 'alevel'],
  KE: ['kcse'],
  ZA: ['nsc'],
};
export const examsForRegion = (region: string | null | undefined): readonly Exam[] =>
  REGION_EXAMS[region ?? DEFAULT_REGION] ?? [];

/** How the tutor names a region's exams when it writes exam-style answers. None for a region whose exams we don't know. */
export const REGION_EXAM_NAMES: Record<string, string> = {
  NG: 'WAEC/NECO/JAMB',
  GH: 'WAEC (WASSCE)',
  SL: 'WAEC (WASSCE)',
  LR: 'WAEC (WASSCE)',
  GM: 'WAEC (WASSCE)',
  US: 'SAT/ACT/AP',
  GB: 'GCSE/A-level',
  KE: 'KCSE',
  ZA: 'NSC (Matric)',
};

export const SYLLABUS: Record<SsceSubject, string[]> = {
  english: [
    'Comprehension',
    'Synonyms and antonyms',
    'Sentence completion (lexis and structure)',
    'Concord and tenses',
    'Idioms and figurative expressions',
    'Vowel sounds',
    'Consonant sounds',
    'Word stress and emphatic stress',
    'Spelling and word formation',
    'Interpretation of sentences',
  ],
  mathematics: [
    'Number bases',
    'Fractions, decimals and percentages',
    'Indices and logarithms',
    'Surds',
    'Sets',
    'Variation',
    'Sequences and series',
    'Quadratic equations',
    'Simultaneous equations and inequalities',
    'Matrices and determinants',
    'Angles and circle geometry',
    'Mensuration',
    'Trigonometry',
    'Coordinate geometry',
    'Differentiation',
    'Integration',
    'Statistics',
    'Probability',
  ],
  physics: [
    'Measurement and units',
    'Scalars and vectors',
    'Motion',
    'Newton’s laws and momentum',
    'Work, energy and power',
    'Simple machines',
    'Elasticity and pressure',
    'Heat and temperature',
    'Gas laws',
    'Waves',
    'Light and optics',
    'Sound',
    'Electrostatics and capacitors',
    'Current electricity',
    'Magnetism and electromagnetic induction',
    'Atomic and nuclear physics',
  ],
  chemistry: [
    'Separation of mixtures',
    'Atomic structure',
    'Periodic table',
    'Chemical bonding',
    'Mole concept and stoichiometry',
    'Gas laws',
    'Acids, bases and salts',
    'Oxidation, reduction and electrolysis',
    'Rates of reaction and equilibrium',
    'Energy changes',
    'Metals and their compounds',
    'Non-metals and their compounds',
    'Hydrocarbons',
    'Functional groups in organic chemistry',
    'Water and solubility',
    'Environmental chemistry',
  ],
  biology: [
    'Cell structure and organisation',
    'Diffusion, osmosis and active transport',
    'Classification of living things',
    'Nutrition in plants and animals',
    'Respiration',
    'Transport systems',
    'Excretion',
    'Support and movement',
    'Reproduction',
    'Nervous and hormonal coordination',
    'Ecology',
    'Genetics',
    'Variation and evolution',
    'Diseases and their control',
  ],
  economics: [
    'Basic economic concepts',
    'Demand and supply',
    'Elasticity',
    'Theory of production',
    'Costs and revenue',
    'Market structures',
    'National income',
    'Money and inflation',
    'Banking and financial institutions',
    'Public finance',
    'International trade',
    'Population and labour',
    'Agriculture and industry in Nigeria',
    'Economic development and planning',
  ],
  government: [
    'Power, authority, legitimacy and sovereignty',
    'Forms of government',
    'Constitutions',
    'Separation of powers and checks and balances',
    'Legislature, executive and judiciary',
    'Political parties and pressure groups',
    'Elections and electoral systems',
    'Citizenship and public opinion',
    'Nigeria’s constitutional development',
    'Federalism in Nigeria',
    'Military rule in Nigeria',
    'International organisations (UN, AU, ECOWAS)',
    'Nigeria’s foreign policy',
  ],
  literature: [
    'Literary terms',
    'Figures of speech',
    'Poetry: form, rhyme and metre',
    'Drama: types and techniques',
    'Prose: narrative techniques',
    'Unseen poetry appreciation',
    'Unseen prose appreciation',
    'African oral literature',
  ],
  geography: [
    'Map reading and scale',
    'Latitude, longitude and time',
    'The earth and the solar system',
    'Rocks and minerals',
    'Landforms and processes',
    'Weather and climate',
    'Vegetation and soils',
    'Population',
    'Settlements',
    'Agriculture',
    'Industry and natural resources',
    'Transport and trade',
    'Geography of Nigeria',
    'Environmental hazards and conservation',
  ],
  commerce: [
    'Occupation and production',
    'Home trade: retail and wholesale',
    'Foreign trade',
    'Business units',
    'Money and banking',
    'Insurance',
    'Transport and communication',
    'Advertising and marketing',
    'The stock exchange',
    'Documents of trade',
    'Consumer protection',
    'E-commerce',
  ],
};

/** The digital SAT's content domains and skills (College Board). */
export const SAT_SYLLABUS: Record<(typeof SAT_SUBJECTS)[number], string[]> = {
  'reading-writing': [
    'Central ideas and details',
    'Command of evidence (textual)',
    'Command of evidence (quantitative)',
    'Inferences',
    'Words in context',
    'Text structure and purpose',
    'Cross-text connections',
    'Rhetorical synthesis',
    'Transitions',
    'Boundaries (punctuation between clauses and sentences)',
    'Form, structure and sense (grammar and usage)',
  ],
  math: [
    'Linear equations in one variable',
    'Linear equations in two variables',
    'Linear functions',
    'Systems of two linear equations',
    'Linear inequalities',
    'Equivalent expressions',
    'Nonlinear equations and systems',
    'Nonlinear functions',
    'Ratios, rates, proportions and units',
    'Percentages',
    'One-variable data: center and spread',
    'Two-variable data: models and scatterplots',
    'Probability and conditional probability',
    'Inference from samples and margin of error',
    'Area and volume',
    'Lines, angles and triangles',
    'Right triangles and trigonometry',
    'Circles',
  ],
};

/** GCSE subject content the main exam boards share (AQA, Edexcel, OCR). */
export const GCSE_SYLLABUS: Record<(typeof GCSE_SUBJECTS)[number], string[]> = {
  maths: [
    'Fractions, decimals and percentages',
    'Indices, standard form and surds',
    'Ratio and proportion',
    'Algebraic expressions and formulae',
    'Linear equations and inequalities',
    'Quadratic equations',
    'Simultaneous equations',
    'Sequences',
    'Graphs of functions',
    'Angles and polygons',
    'Perimeter, area and volume',
    'Pythagoras’ theorem and trigonometry',
    'Transformations and vectors',
    'Circle theorems',
    'Probability',
    'Statistics',
  ],
  'english-language': [
    'Retrieving explicit information',
    'Inference and implied meaning',
    'Language techniques and their effects',
    'Structure of a text',
    'Writer’s viewpoint and purpose',
    'Vocabulary in context',
    'Spelling',
    'Punctuation',
    'Grammar and sentence structure',
    'Writing for audience and purpose',
  ],
  biology: [
    'Cell biology',
    'Organisation: tissues, organs and systems',
    'Infection and response',
    'Bioenergetics: photosynthesis and respiration',
    'Homeostasis and response',
    'Inheritance, variation and evolution',
    'Ecology',
  ],
  chemistry: [
    'Atomic structure and the periodic table',
    'Bonding, structure and the properties of matter',
    'Quantitative chemistry',
    'Chemical changes',
    'Energy changes',
    'The rate and extent of chemical change',
    'Organic chemistry',
    'Chemical analysis',
    'Chemistry of the atmosphere',
    'Using resources',
  ],
  physics: [
    'Energy',
    'Electricity',
    'Particle model of matter',
    'Atomic structure and radioactivity',
    'Forces and motion',
    'Waves',
    'Magnetism and electromagnetism',
    'Space physics',
  ],
};

/** The ACT's sections, by the skills its score report names. */
export const ACT_SYLLABUS: Record<(typeof ACT_SUBJECTS)[number], string[]> = {
  english: [
    'Topic development and purpose',
    'Organization, unity and cohesion',
    'Knowledge of language: word choice, style and tone',
    'Sentence structure and formation',
    'Punctuation',
    'Usage: agreement, verb forms and pronouns',
  ],
  math: [
    'Number and quantity',
    'Algebra: expressions and equations',
    'Linear equations, inequalities and systems',
    'Functions',
    'Quadratics, polynomials and exponents',
    'Plane geometry: angles, triangles and circles',
    'Coordinate geometry',
    'Trigonometry',
    'Statistics and data',
    'Probability',
    'Rates, ratios, proportions and percentages',
    'Area, surface area and volume',
  ],
  reading: [
    'Main ideas and themes',
    'Details and close reading',
    'Sequence, comparison and cause-and-effect relationships',
    'Inferences and conclusions',
    'Word and phrase meanings in context',
    'Text structure and author’s purpose',
    'Point of view and voice',
    'Arguments, claims and evidence',
  ],
  science: [
    'Data representation: reading tables and graphs',
    'Data representation: trends, interpolation and extrapolation',
    'Research summaries: experimental design',
    'Research summaries: interpreting results',
    'Conflicting viewpoints',
    'Scientific models, hypotheses and predictions',
  ],
};

/** Each AP course's units (College Board course and exam descriptions). */
export const AP_SYLLABUS: Record<(typeof AP_SUBJECTS)[number], string[]> = {
  'calculus-ab': [
    'Limits and continuity',
    'Differentiation: definition and basic rules',
    'Differentiation: composite, implicit and inverse functions',
    'Contextual applications of differentiation',
    'Analytical applications of differentiation',
    'Integration and accumulation of change',
    'Differential equations',
    'Applications of integration',
  ],
  biology: [
    'Chemistry of life',
    'Cell structure and function',
    'Cellular energetics',
    'Cell communication and cell cycle',
    'Heredity',
    'Gene expression and regulation',
    'Natural selection',
    'Ecology',
  ],
  chemistry: [
    'Atomic structure and properties',
    'Compound structure and properties',
    'Properties of substances and mixtures',
    'Chemical reactions',
    'Kinetics',
    'Thermochemistry',
    'Equilibrium',
    'Acids and bases',
    'Thermodynamics and electrochemistry',
  ],
  'physics-1': [
    'Kinematics',
    'Force and translational dynamics',
    'Work, energy and power',
    'Linear momentum',
    'Torque and rotational dynamics',
    'Energy and momentum of rotating systems',
    'Oscillations',
    'Fluids',
  ],
  'us-history': [
    'Period 1: 1491–1607',
    'Period 2: 1607–1754',
    'Period 3: 1754–1800',
    'Period 4: 1800–1848',
    'Period 5: 1844–1877',
    'Period 6: 1865–1898',
    'Period 7: 1890–1945',
    'Period 8: 1945–1980',
    'Period 9: 1980–present',
  ],
  'english-language': [
    'Rhetorical situation: audience, purpose and context',
    'Claims and evidence',
    'Reasoning and organization',
    'Style: word choice, syntax and tone',
    'Thesis and line of reasoning',
    'Revising for clarity and coherence',
  ],
};

/** A-level subject content the main exam boards share (AQA, Edexcel, OCR). */
export const ALEVEL_SYLLABUS: Record<(typeof ALEVEL_SUBJECTS)[number], string[]> = {
  maths: [
    'Proof',
    'Algebra and functions',
    'Coordinate geometry',
    'Sequences and series',
    'Trigonometry',
    'Exponentials and logarithms',
    'Differentiation',
    'Integration',
    'Numerical methods',
    'Vectors',
    'Statistical sampling and data presentation',
    'Probability and statistical distributions',
    'Statistical hypothesis testing',
    'Kinematics',
    'Forces and Newton’s laws',
    'Moments',
  ],
  biology: [
    'Biological molecules',
    'Cells and microscopy',
    'Cell membranes and transport',
    'Exchange and transport in organisms',
    'DNA, genes and protein synthesis',
    'Genetic diversity, classification and evolution',
    'Photosynthesis and respiration',
    'Nervous and hormonal coordination',
    'Homeostasis',
    'Inheritance and populations',
    'Ecosystems and energy transfer',
    'Gene expression and gene technology',
    'Immunity and disease',
  ],
  chemistry: [
    'Atomic structure',
    'Amount of substance',
    'Bonding and structure',
    'Energetics',
    'Kinetics',
    'Chemical equilibria',
    'Redox and electrode potentials',
    'Thermodynamics: enthalpy, entropy and free energy',
    'Acids, bases and buffers',
    'Periodicity, Group 2 and Group 7',
    'Transition metals',
    'Alkanes, alkenes and halogenoalkanes',
    'Alcohols, carbonyls and carboxylic acids',
    'Aromatic chemistry and amines',
    'Polymers, amino acids and proteins',
    'Organic analysis: spectroscopy and chromatography',
  ],
  physics: [
    'Measurements and uncertainties',
    'Particles and radiation',
    'Quantum phenomena',
    'Waves and optics',
    'Mechanics',
    'Materials',
    'Electricity',
    'Circular motion and simple harmonic motion',
    'Thermal physics',
    'Gravitational fields',
    'Electric fields and capacitance',
    'Magnetic fields and electromagnetic induction',
    'Nuclear physics',
  ],
  economics: [
    'Scarcity, choice and opportunity cost',
    'Demand, supply and price determination',
    'Elasticity',
    'Market failure and government intervention',
    'Costs, revenue and profit',
    'Market structures',
    'The labour market',
    'National income and economic growth',
    'Aggregate demand and aggregate supply',
    'Inflation and unemployment',
    'Fiscal, monetary and supply-side policy',
    'International trade and exchange rates',
    'Development and globalisation',
  ],
};

/** Kenya's secondary syllabus (KICD), as KNEC examines it in the KCSE. */
export const KCSE_SYLLABUS: Record<(typeof KCSE_SUBJECTS)[number], string[]> = {
  mathematics: [
    'Numbers: integers, fractions and decimals',
    'Indices and logarithms',
    'Algebraic expressions and equations',
    'Rates, ratio, proportion and percentages',
    'Commercial arithmetic',
    'Measurement: length, area and volume',
    'Angles, polygons and geometric constructions',
    'Coordinates, graphs and linear motion',
    'Trigonometry',
    'Quadratic expressions and equations',
    'Circles: chords, tangents and angle properties',
    'Matrices and transformations',
    'Sequences and series',
    'Vectors',
    'Statistics',
    'Probability',
    'Linear inequalities and linear programming',
    'Differentiation and integration',
  ],
  english: [
    'Comprehension',
    'Parts of speech',
    'Tenses and verb forms',
    'Phrases, clauses and sentence types',
    'Punctuation and capitalisation',
    'Vocabulary: synonyms, antonyms and idioms',
    'Pronunciation, stress and intonation',
    'Oral literature and literary devices',
    'Functional writing conventions',
  ],
  biology: [
    'Classification',
    'The cell',
    'Cell physiology',
    'Nutrition in plants and animals',
    'Transport in plants and animals',
    'Gaseous exchange',
    'Respiration',
    'Excretion and homeostasis',
    'Ecology',
    'Reproduction in plants and animals',
    'Growth and development',
    'Genetics',
    'Evolution',
    'Reception, response and coordination',
    'Support and movement',
  ],
  chemistry: [
    'Simple classification of substances',
    'Acids, bases and indicators',
    'Air and combustion',
    'Water and hydrogen',
    'Structure of the atom and the periodic table',
    'Chemical families and patterns in properties',
    'Structure and bonding',
    'Salts',
    'Carbon and some of its compounds',
    'Gas laws',
    'The mole: formulae and chemical equations',
    'Organic chemistry',
    'Nitrogen, sulphur and chlorine and their compounds',
    'Energy changes in chemical and physical processes',
    'Reaction rates and reversible reactions',
    'Electrochemistry',
    'Metals',
    'Radioactivity',
  ],
  physics: [
    'Measurement',
    'Force and pressure',
    'Particulate nature of matter and thermal expansion',
    'Heat transfer and quantity of heat',
    'Reflection and refraction of light',
    'Thin lenses',
    'Electrostatics',
    'Cells, simple circuits and current electricity',
    'Magnetism and the magnetic effect of an electric current',
    'Turning effect of a force and equilibrium',
    'Hooke’s law',
    'Waves and sound',
    'Linear motion and Newton’s laws of motion',
    'Work, energy, power and machines',
    'Gas laws',
    'Uniform circular motion',
    'Floating and sinking',
    'Electromagnetic induction and mains electricity',
    'Cathode rays, X-rays and the photoelectric effect',
    'Radioactivity and electronics',
  ],
};

/** South Africa's CAPS curriculum for Grades 10–12 (the FET phase), examined in the NSC. */
export const NSC_SYLLABUS: Record<(typeof NSC_SUBJECTS)[number], string[]> = {
  mathematics: [
    'Algebra, equations and inequalities',
    'Exponents and surds',
    'Number patterns, sequences and series',
    'Functions and graphs',
    'Finance, growth and decay',
    'Differential calculus',
    'Probability and the counting principle',
    'Analytical geometry',
    'Trigonometry',
    'Euclidean geometry',
    'Statistics',
  ],
  'physical-sciences': [
    'Vectors and scalars',
    'Motion in one dimension and vertical projectile motion',
    'Newton’s laws',
    'Momentum and impulse',
    'Work, energy and power',
    'Waves, sound and the Doppler effect',
    'Electrostatics',
    'Electric circuits',
    'Electrodynamics: motors, generators and alternating current',
    'Photoelectric effect and spectra',
    'Chemical bonding and intermolecular forces',
    'Stoichiometry and quantitative chemistry',
    'Organic chemistry',
    'Rates of reaction',
    'Chemical equilibrium',
    'Acids and bases',
    'Electrochemical reactions',
  ],
  'life-sciences': [
    'The chemistry of life and cells',
    'Cell division: mitosis and meiosis',
    'Plant and animal tissues',
    'Photosynthesis and cellular respiration',
    'Animal nutrition and gaseous exchange',
    'Excretion in humans',
    'DNA: the code of life',
    'Reproduction in vertebrates and human reproduction',
    'Genetics and inheritance',
    'The nervous system and the senses',
    'The endocrine system and homeostasis',
    'Plant hormones and responses',
    'Evolution by natural selection',
    'Human evolution',
    'Biodiversity and classification',
    'Population ecology and human impact on the environment',
  ],
  accounting: [
    'Accounting concepts, GAAP and ethics',
    'Journals, ledgers and the accounting equation',
    'Bank, debtors and creditors reconciliations',
    'Value-added tax (VAT)',
    'Inventory systems and stock valuation',
    'Fixed assets',
    'Partnerships',
    'Companies: financial statements',
    'Cash flow statement',
    'Analysis and interpretation of financial statements',
    'Cost accounting: manufacturing',
    'Budgeting',
    'Internal control and auditing',
  ],
  geography: [
    'The atmosphere: global circulation and weather',
    'Mid-latitude and tropical cyclones',
    'South Africa’s climate and weather',
    'Drainage systems and fluvial processes',
    'Geomorphology: landforms and slopes',
    'Rural settlements',
    'Urban settlements',
    'Economic geography of South Africa',
    'Development and population',
    'Resources and sustainability',
    'Mapwork: topographic maps and scale',
    'Geographical information systems (GIS)',
  ],
};

/** One subject's syllabus topics for an exam; empty when the exam doesn't have that subject. */
export function syllabusOf(exam: Exam, subject: ExamSubject): string[] {
  if (!hasSubject(exam, subject)) return [];
  if (exam === 'sat') return SAT_SYLLABUS[subject as keyof typeof SAT_SYLLABUS];
  if (exam === 'gcse') return GCSE_SYLLABUS[subject as keyof typeof GCSE_SYLLABUS];
  if (exam === 'act') return ACT_SYLLABUS[subject as keyof typeof ACT_SYLLABUS];
  if (exam === 'ap') return AP_SYLLABUS[subject as keyof typeof AP_SYLLABUS];
  if (exam === 'alevel') return ALEVEL_SYLLABUS[subject as keyof typeof ALEVEL_SYLLABUS];
  if (exam === 'kcse') return KCSE_SYLLABUS[subject as keyof typeof KCSE_SYLLABUS];
  if (exam === 'nsc') return NSC_SYLLABUS[subject as keyof typeof NSC_SYLLABUS];
  return SYLLABUS[subject as SsceSubject];
}
