import type { FoundTopic, Topic } from './types';

/**
 * Demo topic lists for mock mode (no server). The file name picks a believable table of contents;
 * anything else gets the general science book.
 */
const BOOKS: { match: RegExp; chapters: [string, string[]][] }[] = [
  {
    match: /bio|cell|life/i,
    chapters: [
      ['Cell biology', ['Cell structure and organelles', 'Cell division: mitosis and meiosis', 'Transport across membranes']],
      ['Nutrition', ['Photosynthesis', 'Enzymes', 'Human digestion']],
      ['Transport and exchange', ['The heart and circulation', 'Breathing and gas exchange']],
      ['Genetics', ['DNA and genes', 'Inheritance and Punnett squares', 'Variation and natural selection']],
      ['Ecology', ['Ecosystems and food webs', 'Nutrient cycles']],
    ],
  },
  {
    match: /chem/i,
    chapters: [
      ['Matter', ['States of matter', 'Separating mixtures', 'Atomic structure']],
      ['The periodic table', ['Periodic trends', 'Groups 1, 7 and 0']],
      ['Bonding', ['Ionic bonding', 'Covalent bonding', 'Metallic bonding and structures']],
      ['Quantitative chemistry', ['The mole concept', 'Balancing equations', 'Concentration of solutions']],
      ['Reactions', ['Acids, bases and salts', 'Rates of reaction', 'Electrolysis']],
    ],
  },
  {
    match: /phys/i,
    chapters: [
      ['Motion', ['Speed, velocity and acceleration', 'Newton’s laws of motion', 'Momentum']],
      ['Energy', ['Work, energy and power', 'Energy transfers and efficiency']],
      ['Waves', ['Properties of waves', 'Sound', 'Light and refraction']],
      ['Electricity', ['Current, voltage and resistance', 'Series and parallel circuits', 'Electrical power']],
      ['Magnetism', ['Magnetic fields', 'Electromagnetic induction']],
    ],
  },
  {
    match: /math|calc|algebra/i,
    chapters: [
      ['Number', ['Fractions, decimals and percentages', 'Indices and standard form', 'Surds']],
      ['Algebra', ['Linear equations', 'Quadratic equations', 'Simultaneous equations', 'Inequalities']],
      ['Geometry', ['Angles and polygons', 'Pythagoras’ theorem', 'Trigonometry: SOH CAH TOA', 'Circle theorems']],
      ['Statistics and probability', ['Averages and spread', 'Probability']],
    ],
  },
  {
    match: /econ|business|commerce|account/i,
    chapters: [
      ['Basic economic concepts', ['Scarcity, choice and opportunity cost', 'Production possibility curves']],
      ['Markets', ['Demand and supply', 'Elasticity', 'Market equilibrium and price']],
      ['Production', ['Factors of production', 'Costs and revenue', 'Economies of scale']],
      ['Money and the economy', ['Money and banking', 'Inflation', 'Unemployment', 'International trade']],
    ],
  },
];

const GENERAL: [string, string[]][] = [
  ['Introduction', ['How to use this book', 'Thinking like a scientist']],
  ['Living things', ['Cells and organisms', 'Photosynthesis and respiration']],
  ['Materials', ['Atoms, elements and compounds', 'Acids and bases']],
  ['Forces and energy', ['Forces and motion', 'Energy and its forms', 'Electricity in the home']],
  ['Earth and space', ['The water cycle', 'The solar system']],
];

/** A topic list for a demo book, with page ranges that add up to a plausible book. */
export function demoTopics(fileName: string): { topics: Topic[]; pageCount: number } {
  const chapters = BOOKS.find((b) => b.match.test(fileName))?.chapters ?? GENERAL;
  const topics: Topic[] = [];
  let page = 3;
  chapters.forEach(([chapter, titles], c) => {
    titles.forEach((title, i) => {
      const length = 5 + ((c * 7 + i * 3) % 9);
      topics.push({ id: `t${c}-${i}`, title, chapter, startPage: page, endPage: page + length - 1 });
      page += length;
    });
  });
  return { topics, pageCount: page + 4 };
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

/** Mock "find": a listed topic that matches, or null when the book doesn't cover the words typed. */
export function demoFind(topics: Topic[], query: string): FoundTopic | null {
  const q = norm(query);
  if (!q) return null;
  const words = q.split(' ').filter((w) => w.length > 2);
  const hit = topics.find((t) => {
    const title = norm(t.title);
    return title.includes(q) || q.includes(title) || words.some((w) => title.includes(w));
  });
  return hit ? { title: hit.title, startPage: hit.startPage, endPage: hit.endPage, listed: true } : null;
}
