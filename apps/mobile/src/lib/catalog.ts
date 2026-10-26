import type { Ionicons } from '@expo/vector-icons';
import type { TFunction } from 'i18next';

import { formatNumber, type LanguageId } from '@/i18n';
import { bundledTranslation } from '@/i18n/catalog';
import type home from '@/i18n/locales/en/home';

/**
 * Content catalogue for Explore, search, subjects and recommendations. The lists below are the
 * English starter content built into the app. At runtime CatalogProvider swaps their contents for
 * the reader's language: first the translation bundled with the app, then the server's GET /catalog
 * (which also carries lessons added after this build). The exports stay the same arrays, so
 * screens keep reading SUBJECTS / LESSONS / getLesson() as before.
 */

type Icon = keyof typeof Ionicons.glyphMap;

export type Format = 'video' | 'summary' | 'quiz' | 'flashcards' | 'audio';
export type Level = 'Beginner' | 'Intermediate' | 'Advanced';

export type Subject = {
  id: string;
  name: string;
  emoji: string;
  category: string;
  colors: readonly [string, string];
  description: string;
  topics: string[];
};

export type Lesson = {
  id: string;
  title: string;
  subjectId: string;
  topic: string;
  format: Format;
  minutes: number;
  level: Level;
  views: number;
  rating: number;
  /** 0–100, how fast it's growing this week. */
  trend: number;
  summary: string;
  keyPoints: string[];
  exams?: string[];
};

/** Display names live in the `home` namespace: use formatLabel(format, t). */
export const FORMAT_META: Record<Format, { icon: Icon; color: string }> = {
  video: { icon: 'play', color: '#2DD4BF' },
  summary: { icon: 'document-text', color: '#9B82FF' },
  quiz: { icon: 'help-circle', color: '#FF7A93' },
  flashcards: { icon: 'albums', color: '#FFC857' },
  audio: { icon: 'headset', color: '#4CC9FF' },
};

/** `name` is the English fallback; show categoryName(category, t). */
export const CATEGORIES: { id: string; name: string; icon: Icon; color: string }[] = [
  { id: 'sciences', name: 'Sciences', icon: 'flask', color: '#2DD4BF' },
  { id: 'maths', name: 'Mathematics', icon: 'calculator', color: '#9B82FF' },
  { id: 'languages', name: 'Languages & Literature', icon: 'chatbubbles', color: '#4CC9FF' },
  { id: 'humanities', name: 'Humanities', icon: 'globe', color: '#FFC857' },
  { id: 'business', name: 'Business & Money', icon: 'briefcase', color: '#FF9F43' },
  { id: 'tech', name: 'Tech & Future Skills', icon: 'code-slash', color: '#FF7A93' },
];

export const SUBJECTS: Subject[] = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    emoji: '➗',
    category: 'maths',
    colors: ['#5B2BB8', '#C26BFF'],
    description: 'Numbers, algebra, geometry and the logic behind them.',
    topics: ['Algebra', 'Quadratic equations', 'Geometry', 'Statistics', 'Trigonometry', 'Calculus'],
  },
  {
    id: 'further-maths',
    name: 'Further Mathematics',
    emoji: '∑',
    category: 'maths',
    colors: ['#3B2DBF', '#7C5CFF'],
    description: 'Matrices, vectors and advanced problem solving.',
    topics: ['Matrices', 'Vectors', 'Complex numbers', 'Differentiation'],
  },
  {
    id: 'physics',
    name: 'Physics',
    emoji: '⚛️',
    category: 'sciences',
    colors: ['#1663C7', '#4CC9FF'],
    description: 'How energy, forces and the universe behave.',
    topics: ['Motion', 'Forces', 'Waves', 'Electricity', 'Energy', 'Optics'],
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    emoji: '🧪',
    category: 'sciences',
    colors: ['#B8326A', '#FF7A93'],
    description: 'Atoms, reactions and the stuff everything is made of.',
    topics: ['Mole concept', 'Chemical bonding', 'Organic chemistry', 'Electrolysis', 'Rates of reaction'],
  },
  {
    id: 'biology',
    name: 'Biology',
    emoji: '🧬',
    category: 'sciences',
    colors: ['#0E8F6E', '#2DD4BF'],
    description: 'Living things, from cells to whole ecosystems.',
    topics: ['Cell biology', 'Genetics', 'Ecology', 'Nutrition', 'Human physiology'],
  },
  {
    id: 'agric',
    name: 'Agricultural Science',
    emoji: '🌾',
    category: 'sciences',
    colors: ['#4C7A1F', '#A3D65C'],
    description: 'Crops, soil, animals and farm business.',
    topics: ['Soil science', 'Crop production', 'Animal husbandry'],
  },
  {
    id: 'english',
    name: 'English Language',
    emoji: '📝',
    category: 'languages',
    colors: ['#0F7C9C', '#7CEBDD'],
    description: 'Reading, writing and speaking with confidence.',
    topics: ['Comprehension', 'Summary writing', 'Essay writing', 'Lexis & structure', 'Oral English'],
  },
  {
    id: 'literature',
    name: 'Literature in English',
    emoji: '📚',
    category: 'languages',
    colors: ['#7A3E9D', '#D38CFF'],
    description: 'Prose, poetry and drama, analysed clearly.',
    topics: ['Prose', 'Poetry', 'Drama', 'Literary devices'],
  },
  {
    id: 'french',
    name: 'French',
    emoji: '🇫🇷',
    category: 'languages',
    colors: ['#2B4C9B', '#7C9CFF'],
    description: 'Everyday French for school and travel.',
    topics: ['Greetings', 'Verbs', 'Grammar', 'Conversation'],
  },
  {
    id: 'government',
    name: 'Government',
    emoji: '🏛️',
    category: 'humanities',
    colors: ['#9C6B1E', '#FFC857'],
    description: 'How countries are run, and why it matters.',
    topics: ['Constitution', 'Arms of government', 'Electoral systems', 'Nigerian federalism'],
  },
  {
    id: 'history',
    name: 'History',
    emoji: '🏺',
    category: 'humanities',
    colors: ['#8A4B2A', '#FF9F43'],
    description: 'Stories of the past that shaped today.',
    topics: ['Pre-colonial Africa', 'Colonial era', 'Independence movements', 'World wars'],
  },
  {
    id: 'geography',
    name: 'Geography',
    emoji: '🌍',
    category: 'humanities',
    colors: ['#0B6E4F', '#4CC9FF'],
    description: 'Our planet, its people and its climate.',
    topics: ['Map reading', 'Climate', 'Population', 'Landforms'],
  },
  {
    id: 'economics',
    name: 'Economics',
    emoji: '📈',
    category: 'business',
    colors: ['#B35C00', '#FFC857'],
    description: 'Money, markets and how choices are made.',
    topics: ['Demand & supply', 'Elasticity', 'Inflation', 'National income', 'Market structures'],
  },
  {
    id: 'accounting',
    name: 'Financial Accounting',
    emoji: '🧾',
    category: 'business',
    colors: ['#7A5C00', '#FFDE99'],
    description: 'Books, ledgers and financial statements.',
    topics: ['Double entry', 'Trial balance', 'Final accounts', 'Depreciation'],
  },
  {
    id: 'entrepreneurship',
    name: 'Entrepreneurship',
    emoji: '🚀',
    category: 'business',
    colors: ['#C2410C', '#FF7A93'],
    description: 'Turning ideas into businesses that work.',
    topics: ['Business ideas', 'Marketing', 'Pricing', 'Pitching'],
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    emoji: '💻',
    category: 'tech',
    colors: ['#1E3A8A', '#4CC9FF'],
    description: 'How computers think, from logic to code.',
    topics: ['Algorithms', 'Programming basics', 'Data structures', 'Networks'],
  },
  {
    id: 'ai-literacy',
    name: 'AI Literacy',
    emoji: '🤖',
    category: 'tech',
    colors: ['#6A45FF', '#2DD4BF'],
    description: 'What AI is, how it works and how to use it well.',
    topics: ['What is AI', 'Machine learning', 'Prompting', 'AI ethics'],
  },
];

const L = (
  id: string,
  title: string,
  subjectId: string,
  topic: string,
  format: Format,
  minutes: number,
  level: Level,
  views: number,
  trend: number,
  summary: string,
  keyPoints: string[],
  exams?: string[],
): Lesson => ({
  id,
  title,
  subjectId,
  topic,
  format,
  minutes,
  level,
  views,
  rating: 4.4 + (views % 6) / 10,
  trend,
  summary,
  keyPoints,
  exams,
});

export const LESSONS: Lesson[] = [
  L(
    'l1',
    'How cells make energy',
    'biology',
    'Cell biology',
    'video',
    5,
    'Beginner',
    48200,
    72,
    'Mitochondria turn glucose and oxygen into ATP, the energy currency every cell spends.',
    [
      'Respiration happens in the mitochondria',
      'Glucose + oxygen → CO₂ + water + ATP',
      'Anaerobic respiration makes lactic acid in muscles',
    ],
    ['WAEC', 'JAMB'],
  ),
  L(
    'l2',
    'Genetics made simple: dominant vs recessive',
    'biology',
    'Genetics',
    'video',
    6,
    'Intermediate',
    39100,
    88,
    'Why you might have your mum’s eyes but your grandad’s height: alleles, genotypes and Punnett squares.',
    ['Each trait has two alleles', 'Dominant alleles mask recessive ones', 'Punnett squares predict offspring ratios'],
    ['WAEC', 'NECO', 'JAMB'],
  ),
  L(
    'l3',
    'Food chains and energy flow',
    'biology',
    'Ecology',
    'summary',
    4,
    'Beginner',
    15400,
    40,
    'Energy moves from producers to consumers, and only about 10% passes to each next level.',
    [
      'Producers make food by photosynthesis',
      'About 10% of energy passes up each level',
      'Decomposers recycle nutrients',
    ],
  ),
  L(
    'l4',
    'The mole concept in 5 minutes',
    'chemistry',
    'Mole concept',
    'video',
    5,
    'Intermediate',
    61300,
    95,
    'One mole is 6.02 × 10²³ particles. Learn to switch between mass, moles and particles with confidence.',
    ['1 mole = 6.02 × 10²³ particles', 'Moles = mass ÷ molar mass', 'Use ratios from balanced equations'],
    ['WAEC', 'JAMB'],
  ),
  L(
    'l5',
    'Ionic vs covalent bonding',
    'chemistry',
    'Chemical bonding',
    'flashcards',
    6,
    'Intermediate',
    22800,
    61,
    'Ionic bonds transfer electrons; covalent bonds share them. 20 cards to lock it in.',
    [
      'Ionic: metal + non-metal, electron transfer',
      'Covalent: non-metals sharing electrons',
      'Ionic compounds conduct when molten',
    ],
  ),
  L(
    'l6',
    'Organic chemistry: naming alkanes',
    'chemistry',
    'Organic chemistry',
    'quiz',
    8,
    'Advanced',
    12900,
    54,
    'Test yourself on IUPAC naming for alkanes, alkenes and alcohols.',
    ['Find the longest carbon chain', 'Number from the end nearest a branch', 'Prefixes: meth, eth, prop, but…'],
  ),
  L(
    'l7',
    'Newton’s three laws, explained',
    'physics',
    'Forces',
    'video',
    5,
    'Beginner',
    57400,
    81,
    'Inertia, F = ma, and action–reaction, with everyday examples from danfo buses to football.',
    [
      'An object stays at rest unless acted on',
      'Force = mass × acceleration',
      'Every action has an equal and opposite reaction',
    ],
    ['WAEC', 'JAMB'],
  ),
  L(
    'l8',
    'Ohm’s law and simple circuits',
    'physics',
    'Electricity',
    'summary',
    4,
    'Intermediate',
    26700,
    66,
    'V = IR. How voltage, current and resistance relate in series and parallel circuits.',
    ['V = I × R', 'Series: resistances add', 'Parallel: 1/R = 1/R₁ + 1/R₂'],
  ),
  L(
    'l9',
    'Waves: frequency, wavelength, speed',
    'physics',
    'Waves',
    'quiz',
    7,
    'Intermediate',
    11200,
    37,
    'Ten exam-style questions on v = fλ.',
    ['v = f × λ', 'Transverse vs longitudinal', 'Sound needs a medium'],
  ),
  L(
    'l10',
    'Solving quadratic equations',
    'mathematics',
    'Quadratic equations',
    'video',
    7,
    'Intermediate',
    70100,
    90,
    'Factorisation, completing the square and the formula. Pick the fastest method every time.',
    ['Try factorising first', 'x = (−b ± √(b²−4ac)) / 2a', 'The discriminant tells you how many roots'],
    ['WAEC', 'NECO', 'JAMB'],
  ),
  L(
    'l11',
    'Trigonometry: SOH CAH TOA',
    'mathematics',
    'Trigonometry',
    'flashcards',
    5,
    'Beginner',
    34600,
    58,
    'Sine, cosine and tangent ratios with memory tricks that stick.',
    ['sin = opposite / hypotenuse', 'cos = adjacent / hypotenuse', 'tan = opposite / adjacent'],
  ),
  L(
    'l12',
    'Statistics: mean, median and mode',
    'mathematics',
    'Statistics',
    'summary',
    4,
    'Beginner',
    29900,
    44,
    'Three ways to describe the “middle” of data, and when to use each.',
    ['Mean: add and divide', 'Median: the middle value', 'Mode: the most frequent'],
  ),
  L(
    'l13',
    'Differentiation from first principles',
    'further-maths',
    'Differentiation',
    'video',
    9,
    'Advanced',
    9800,
    49,
    'What a derivative really means, built up step by step.',
    ['The derivative is a rate of change', 'Limit of (f(x+h) − f(x)) / h', 'Power rule: d/dx xⁿ = nxⁿ⁻¹'],
  ),
  L(
    'l14',
    'Writing a strong essay introduction',
    'english',
    'Essay writing',
    'video',
    4,
    'Beginner',
    41700,
    77,
    'Hook, context, thesis: the three-part intro examiners love.',
    ['Start with a hook', 'Give brief context', 'End with a clear thesis'],
    ['WAEC', 'NECO'],
  ),
  L(
    'l15',
    'Summary writing that scores',
    'english',
    'Summary writing',
    'summary',
    5,
    'Intermediate',
    33300,
    70,
    'How to find the key points and rewrite them in your own words, within the word limit.',
    ['Read the question twice', 'One point per sentence', 'Never copy whole sentences'],
    ['WAEC'],
  ),
  L(
    'l16',
    'Lexis & structure practice',
    'english',
    'Lexis & structure',
    'quiz',
    10,
    'Intermediate',
    27500,
    63,
    'JAMB-style synonyms, antonyms and sentence completion.',
    ['Read the whole sentence first', 'Watch for tense clues', 'Eliminate obvious wrong options'],
    ['JAMB'],
  ),
  L(
    'l17',
    'Things Fall Apart: themes',
    'literature',
    'Prose',
    'audio',
    12,
    'Intermediate',
    18200,
    52,
    'Pride, tradition and change in Achebe’s classic, as a listen-anywhere audio lesson.',
    ['Okonkwo’s fear of weakness', 'Tradition vs colonial change', 'The tragic hero'],
  ),
  L(
    'l18',
    'Demand and supply, simply',
    'economics',
    'Demand & supply',
    'video',
    5,
    'Beginner',
    44800,
    74,
    'Why prices rise and fall, using the market for tomatoes as an example.',
    ['Demand falls as price rises', 'Supply rises as price rises', 'Equilibrium is where they meet'],
    ['WAEC', 'JAMB'],
  ),
  L(
    'l19',
    'Inflation: why prices keep rising',
    'economics',
    'Inflation',
    'summary',
    5,
    'Intermediate',
    25600,
    83,
    'Causes, effects and how central banks fight inflation.',
    ['Demand-pull vs cost-push', 'Inflation erodes purchasing power', 'Interest rates are the main tool'],
  ),
  L(
    'l20',
    'Double entry bookkeeping',
    'accounting',
    'Double entry',
    'video',
    8,
    'Beginner',
    16300,
    46,
    'Every transaction has two sides. Debits, credits and the accounting equation.',
    ['Assets = Liabilities + Capital', 'Every debit has a matching credit', 'Use T-accounts to practise'],
  ),
  L(
    'l21',
    'Arms of government',
    'government',
    'Arms of government',
    'flashcards',
    5,
    'Beginner',
    21400,
    41,
    'Legislature, executive and judiciary: who does what.',
    ['Legislature makes laws', 'Executive carries them out', 'Judiciary interprets them'],
  ),
  L(
    'l22',
    'Nigerian independence in 10 moments',
    'history',
    'Independence movements',
    'video',
    7,
    'Beginner',
    19900,
    57,
    'From the 1914 amalgamation to 1 October 1960.',
    ['1914 amalgamation', 'Nationalist movements', 'Independence on 1 October 1960'],
  ),
  L(
    'l23',
    'Reading contour maps',
    'geography',
    'Map reading',
    'summary',
    5,
    'Intermediate',
    8700,
    33,
    'Contours, spot heights and gradients, decoded.',
    ['Close contours = steep slope', 'Contour interval is constant', 'V-shapes point upstream'],
  ),
  L(
    'l24',
    'Your first Python program',
    'computer-science',
    'Programming basics',
    'video',
    8,
    'Beginner',
    52600,
    93,
    'Variables, print and input: write a program that greets you by name.',
    ['Variables store values', 'print() shows output', 'input() reads what the user types'],
  ),
  L(
    'l25',
    'Algorithms in everyday life',
    'computer-science',
    'Algorithms',
    'audio',
    6,
    'Beginner',
    14100,
    48,
    'Recipes, directions and sorting your playlist: algorithms are everywhere.',
    ['An algorithm is a set of steps', 'Order matters', 'Good algorithms are efficient'],
  ),
  L(
    'l26',
    'What is AI, really?',
    'ai-literacy',
    'What is AI',
    'video',
    6,
    'Beginner',
    66900,
    97,
    'How machines learn patterns from data, and what they still can’t do.',
    ['AI learns patterns from examples', 'It predicts, it doesn’t “know”', 'Always check AI answers'],
  ),
  L(
    'l27',
    'Prompting like a pro',
    'ai-literacy',
    'Prompting',
    'flashcards',
    5,
    'Beginner',
    38800,
    89,
    'Give context, set a role and ask for a format: get better answers from AI.',
    ['Be specific about the goal', 'Give examples', 'Ask for step-by-step reasoning'],
  ),
  L(
    'l28',
    'Pricing your first product',
    'entrepreneurship',
    'Pricing',
    'summary',
    5,
    'Beginner',
    13600,
    55,
    'Cost-plus, value-based and competitor pricing for young entrepreneurs.',
    ['Know your total costs', 'Price on value, not just cost', 'Test and adjust'],
  ),
  L(
    'l29',
    'French greetings & introductions',
    'french',
    'Greetings',
    'audio',
    6,
    'Beginner',
    11800,
    39,
    'Bonjour, ça va? Speak your first French sentences with confidence.',
    ['Bonjour / Bonsoir', 'Je m’appelle…', 'Comment ça va?'],
  ),
  L(
    'l30',
    'Electrolysis step by step',
    'chemistry',
    'Electrolysis',
    'video',
    7,
    'Advanced',
    17700,
    68,
    'What happens at the anode and cathode, and how to predict products.',
    ['Cations go to the cathode', 'Anions go to the anode', 'Oxidation at anode, reduction at cathode'],
    ['WAEC', 'JAMB'],
  ),
  L(
    'l31',
    'Human heart and circulation',
    'biology',
    'Human physiology',
    'quiz',
    8,
    'Intermediate',
    23900,
    60,
    'Twelve questions on the heart, blood vessels and double circulation.',
    ['Four chambers', 'Arteries carry blood away', 'Double circulation in mammals'],
    ['WAEC'],
  ),
  L(
    'l32',
    'Geometry: angles in circles',
    'mathematics',
    'Geometry',
    'video',
    6,
    'Intermediate',
    21100,
    62,
    'Circle theorems with diagrams you can actually follow.',
    [
      'Angle at centre = 2 × angle at circumference',
      'Angles in the same segment are equal',
      'Opposite angles of a cyclic quad sum to 180°',
    ],
  ),
];

export const getSubject = (id: string) => SUBJECTS.find((s) => s.id === id);
export const getLesson = (id: string) => LESSONS.find((l) => l.id === id);
export const lessonsFor = (subjectId: string) => LESSONS.filter((l) => l.subjectId === subjectId);
export const subjectsIn = (categoryId: string) => SUBJECTS.filter((s) => s.category === categoryId);

/**
 * Maps a free-text subject name (from personalization, stored in English) to a catalogue subject,
 * returned in the current language.
 */
export function matchSubject(name: string) {
  const n = name.toLowerCase();
  const en = ENGLISH.subjects.find(
    (s) => s.name.toLowerCase() === n || n.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(n),
  );
  return en && getSubject(en.id);
}

export function trending(subjectId?: string, limit = 20) {
  return LESSONS.filter((l) => !subjectId || l.subjectId === subjectId)
    .sort((a, b) => b.trend - a.trend)
    .slice(0, limit);
}

export type SearchResults = { lessons: Lesson[]; subjects: Subject[]; topics: { subject: Subject; topic: string }[] };

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

/**
 * Searches in the current language and in English (students often type English terms), ignoring
 * accents and tone marks. Every word must match. Same rules as the server's GET /search.
 */
export function search(query: string): SearchResults {
  const words = fold(query.trim()).split(/\s+/).filter(Boolean);
  if (!words.length) return { lessons: [], subjects: [], topics: [] };
  const enSubject = new Map(ENGLISH.subjects.map((s) => [s.id, s]));
  const enLesson = new Map(ENGLISH.lessons.map((l) => [l.id, l]));
  const hit = (...texts: (string | undefined)[]) => {
    const hay = fold(texts.filter(Boolean).join(' '));
    return words.every((w) => hay.includes(w));
  };
  return {
    subjects: SUBJECTS.filter((s) => hit(s.name, s.description, enSubject.get(s.id)?.name)),
    topics: SUBJECTS.flatMap((s) =>
      s.topics.filter((t, i) => hit(t, enSubject.get(s.id)?.topics[i])).map((topic) => ({ subject: s, topic })),
    ),
    lessons: LESSONS.filter((l) => {
      const e = enLesson.get(l.id);
      return hit(l.title, l.topic, getSubject(l.subjectId)?.name, l.summary, (l.exams ?? []).join(' '), e?.title, e?.topic);
    }).sort((a, b) => b.views - a.views),
  };
}

export const TRENDING_SEARCHES = [
  'Mole concept',
  'Quadratic equations',
  'JAMB English',
  'What is AI',
  'Demand and supply',
  'Genetics',
];

/** Compact view count in the current language, e.g. 12K. */
export function formatViews(n: number) {
  return n >= 1000
    ? formatNumber(n, { notation: 'compact', maximumFractionDigits: n >= 10000 ? 0 : 1 })
    : formatNumber(n);
}

// Display labels. Ids and English names above stay unchanged (they are matched and stored);
// these translate them at render time with the `home` namespace's t.
type HomeT = TFunction<'home'>;
type Strings = typeof home.catalog;

export const formatLabel = (f: Format, t: HomeT) => t(`catalog.formats.${f}`);

export const levelLabel = (l: Level, t: HomeT) =>
  t(`catalog.levels.${l.toLowerCase() as keyof Strings['levels']}`, { defaultValue: l });

export const categoryName = (c: { id: string; name: string }, t: HomeT) =>
  t(`catalog.categories.${c.id as keyof Strings['categories']}`, { defaultValue: c.name });

export const subjectName = (s: { id: string; name: string }, t: HomeT) =>
  t(`catalog.subjects.${s.id as keyof Strings['subjects']}`, { defaultValue: s.name });

// ─── Language ─────────────────────────────────────────────────────────────────

type Category = (typeof CATEGORIES)[number];
export type CatalogData = { categories: Category[]; subjects: Subject[]; lessons: Lesson[] };

const copy = <T>(x: T): T => JSON.parse(JSON.stringify(x));
/** The built-in English content, kept for matching stored English names and searching English terms. */
const ENGLISH: CatalogData = copy({ categories: CATEGORIES, subjects: SUBJECTS, lessons: LESSONS });

/** A subject's stored name. Saved values use the English name so they never change with the language. */
export const englishSubjectName = (id: string) => ENGLISH.subjects.find((s) => s.id === id)?.name ?? id;

/** The catalogue subject (in the current language) for a stored English name. */
export function subjectByEnglishName(name: string) {
  const en = ENGLISH.subjects.find((s) => s.name === name);
  return en && getSubject(en.id);
}

/** Replaces the catalogue's contents in place (the exported arrays stay the same objects). */
export function applyCatalog(data: CatalogData) {
  CATEGORIES.splice(0, CATEGORIES.length, ...data.categories);
  SUBJECTS.splice(0, SUBJECTS.length, ...data.subjects);
  LESSONS.splice(0, LESSONS.length, ...data.lessons);
}

/** The built-in content in one language, from the translation bundled with the app. */
export function bundledCatalog(lang: LanguageId): CatalogData {
  const tr = bundledTranslation(lang);
  const base = copy(ENGLISH);
  if (!tr) return base;
  // A translated list must line up item for item with the English one; otherwise keep English.
  const list = (v: unknown, fallback: string[]) =>
    Array.isArray(v) && v.length === fallback.length ? (v as string[]) : fallback;
  const text = (v: unknown, fallback: string) => (typeof v === 'string' && v ? v : fallback);
  return {
    categories: base.categories.map((c) => ({ ...c, name: text(tr.categories[c.id]?.name, c.name) })),
    subjects: base.subjects.map((s) => {
      const t = tr.subjects[s.id] ?? {};
      return { ...s, name: text(t.name, s.name), description: text(t.description, s.description), topics: list(t.topics, s.topics) };
    }),
    lessons: base.lessons.map((l) => {
      const t = tr.lessons[l.id] ?? {};
      return {
        ...l,
        title: text(t.title, l.title),
        topic: text(t.topic, l.topic),
        summary: text(t.summary, l.summary),
        keyPoints: list(t.keyPoints, l.keyPoints),
      };
    }),
  };
}
