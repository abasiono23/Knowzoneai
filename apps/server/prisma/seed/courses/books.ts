/**
 * The openly licensed textbooks Knowzone courses are built from. Each is pinned to a commit whose
 * licence is CC BY 4.0, which allows commercial reuse with attribution. (Newer editions of several
 * of these books moved to CC BY-NC-SA, which a paid app can't use; a licence granted for a published
 * version still applies to that version.) Check the licence again before changing a pin.
 */
export type Book = {
  /** Course id in the app. */
  id: string;
  repo: string;
  /** Commit whose collection file says CC BY 4.0. */
  sha: string;
  collection: string;
  /** Where readers can find the book online. */
  url: string;
  course: {
    title: string;
    subtitle: string;
    subjectId: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    emoji: string;
    colors: [string, string];
    description: string;
    requirements: string[];
    exams: string[];
    tags: string[];
    featured?: boolean;
  };
  /** Words added to YouTube searches so results match the subject. */
  videoHint: string;
};

export const BOOKS: Book[] = [
  {
    id: 'biology',
    repo: 'osbooks-biology-bundle',
    sha: '6a02bc26a2e72702c1f96c41f2d98026b8127c4f',
    collection: 'biology-2e.collection.xml',
    url: 'https://openstax.org/details/books/biology-2e',
    course: {
      title: 'Biology',
      subtitle: 'From cells and genetics to evolution, ecology and the human body',
      subjectId: 'biology',
      level: 'Intermediate',
      emoji: '🧬',
      colors: ['#2DD4BF', '#0E7C66'],
      description:
        'A complete biology course built on the open textbook Biology 2e. Learn how life works, from the chemistry of cells and how genes are inherited, through evolution and the diversity of life, to plants, animals, the human body and ecosystems. Each chapter has readings with diagrams, a video, an interactive practice and a quiz.',
      requirements: ['Basic reading and arithmetic', 'No prior biology needed'],
      exams: ['WAEC', 'NECO', 'JAMB'],
      tags: ['cells', 'genetics', 'evolution', 'ecology', 'human body'],
      featured: true,
    },
    videoHint: 'biology',
  },
  {
    id: 'chemistry',
    repo: 'osbooks-chemistry-bundle',
    sha: '7d41ed008e9b83a6690c09c26a16f63f96046ec0',
    collection: 'chemistry-2e.collection.xml',
    url: 'https://openstax.org/details/books/chemistry-2e',
    course: {
      title: 'Chemistry',
      subtitle: 'Atoms, bonding, reactions, stoichiometry, acids and bases, and more',
      subjectId: 'chemistry',
      level: 'Intermediate',
      emoji: '🧪',
      colors: ['#FF7A93', '#B04CFF'],
      description:
        'A complete chemistry course built on the open textbook Chemistry 2e. Start with matter and atoms, then master the mole, chemical bonding, gases, thermochemistry, equilibrium, acids and bases, electrochemistry and organic chemistry. Each chapter has readings with worked examples, a video, an interactive practice and a quiz.',
      requirements: ['Comfortable with basic algebra', 'No prior chemistry needed'],
      exams: ['WAEC', 'NECO', 'JAMB'],
      tags: ['atoms', 'mole concept', 'bonding', 'reactions', 'organic chemistry'],
      featured: true,
    },
    videoHint: 'chemistry',
  },
  {
    id: 'physics',
    repo: 'osbooks-physics',
    sha: '56e71824e73e371c0d20eb68a77611aa438b5f89',
    collection: 'physics.collection.xml',
    url: 'https://openstax.org/details/books/physics',
    course: {
      title: 'Physics',
      subtitle: 'Motion, forces, energy, waves, electricity and modern physics',
      subjectId: 'physics',
      level: 'Beginner',
      emoji: '⚛️',
      colors: ['#4CC9FF', '#3B2DBF'],
      description:
        'A complete secondary-school physics course built on the open textbook Physics. Learn how things move and why, then explore energy, heat, waves, light, electricity, magnetism and the physics of atoms. Each chapter has readings with worked examples, a video, an interactive practice and a quiz.',
      requirements: ['Basic algebra'],
      exams: ['WAEC', 'NECO', 'JAMB'],
      tags: ['motion', 'forces', 'energy', 'waves', 'electricity'],
      featured: true,
    },
    videoHint: 'physics',
  },
  {
    id: 'algebra',
    repo: 'osbooks-college-algebra-bundle',
    sha: '2cd7155f580057eb210b4872a360d4b1013f42e2',
    collection: 'college-algebra-2e.collection.xml',
    url: 'https://openstax.org/details/books/college-algebra-2e',
    course: {
      title: 'Algebra',
      subtitle: 'Equations, functions, polynomials, exponentials and logarithms',
      subjectId: 'mathematics',
      level: 'Intermediate',
      emoji: '➗',
      colors: ['#9B82FF', '#5A3FD9'],
      description:
        'A complete algebra course built on the open textbook College Algebra 2e. Build strong foundations in expressions and equations, then work with functions, linear and quadratic models, polynomials, exponential and logarithmic functions, systems of equations and sequences. Each chapter has readings with worked examples, a video, an interactive practice and a quiz.',
      requirements: ['Arithmetic with fractions and negative numbers'],
      exams: ['WAEC', 'NECO', 'JAMB'],
      tags: ['equations', 'functions', 'quadratics', 'logarithms', 'sequences'],
    },
    videoHint: 'algebra',
  },
  {
    id: 'statistics',
    repo: 'osbooks-statistics',
    sha: '7dea80ae2800386d470b11f6528962f9c4992d15',
    collection: 'statistics.collection.xml',
    url: 'https://openstax.org/details/books/statistics',
    course: {
      title: 'Statistics',
      subtitle: 'Collecting data, averages, probability, distributions and hypothesis testing',
      subjectId: 'mathematics',
      level: 'Beginner',
      emoji: '📊',
      colors: ['#FFC857', '#FF9F43'],
      description:
        'A complete introductory statistics course built on the open textbook Statistics. Learn to describe data with charts and averages, understand probability, work with the normal distribution, and draw conclusions with confidence intervals and hypothesis tests. Each chapter has readings with worked examples, a video, an interactive practice and a quiz.',
      requirements: ['Basic algebra'],
      exams: ['WAEC', 'NECO'],
      tags: ['data', 'probability', 'normal distribution', 'hypothesis testing'],
    },
    videoHint: 'statistics',
  },
  {
    id: 'economics',
    repo: 'osbooks-principles-economics-bundle',
    sha: '8a7204788c947135c8567d3ad26e6db07ce90adf',
    collection: 'principles-economics-3e.collection.xml',
    url: 'https://openstax.org/details/books/principles-economics-3e',
    course: {
      title: 'Economics',
      subtitle: 'Demand and supply, markets, money, inflation and international trade',
      subjectId: 'economics',
      level: 'Beginner',
      emoji: '📈',
      colors: ['#2DD4BF', '#4CC9FF'],
      description:
        'A complete economics course built on the open textbook Principles of Economics 3e. Understand how markets work through demand and supply, then study firms and competition, labour, the role of government, national income, unemployment, inflation, money, banking and international trade. Each chapter has readings, a video, an interactive practice and a quiz.',
      requirements: ['No prior economics needed'],
      exams: ['WAEC', 'NECO', 'JAMB'],
      tags: ['demand and supply', 'markets', 'inflation', 'money', 'trade'],
    },
    videoHint: 'economics',
  },
  {
    id: 'python',
    repo: 'osbooks-introduction-python-programming',
    sha: 'a3f0ad346e0d77f8ed94440d7c39059d0c4d927c',
    collection: 'introduction-python-programming.collection.xml',
    url: 'https://openstax.org/details/books/introduction-python-programming',
    course: {
      title: 'Python Programming',
      subtitle: 'Write real programs: variables, decisions, loops, functions, files and data',
      subjectId: 'computer-science',
      level: 'Beginner',
      emoji: '🐍',
      colors: ['#4CC9FF', '#FFC857'],
      description:
        'A complete beginner programming course built on the open textbook Introduction to Python Programming. Learn to write Python step by step: expressions and types, decisions, loops, functions, strings, lists, dictionaries, classes, modules and files, with code examples throughout. Each chapter has readings, a video, an interactive practice and a quiz.',
      requirements: ['A phone or computer', 'No programming experience needed'],
      exams: [],
      tags: ['python', 'coding', 'programming', 'loops', 'functions'],
    },
    videoHint: 'python programming',
  },
  {
    id: 'entrepreneurship',
    repo: 'osbooks-entrepreneurship',
    sha: '4fd385dc7b75e5e7cbdccb59c4149b4af220a88b',
    collection: 'entrepreneurship.collection.xml',
    url: 'https://openstax.org/details/books/entrepreneurship',
    course: {
      title: 'Entrepreneurship',
      subtitle: 'From an idea to a business: opportunity, planning, marketing and money',
      subjectId: 'entrepreneurship',
      level: 'Beginner',
      emoji: '🚀',
      colors: ['#FF5A7A', '#FFC857'],
      description:
        'A complete entrepreneurship course built on the open textbook Entrepreneurship. Learn to spot opportunities, test ideas, understand customers, plan a business model, market and sell, manage money and grow, with real stories from entrepreneurs. Each chapter has readings, a video, an interactive practice and a quiz.',
      requirements: ['No business experience needed'],
      exams: ['WAEC', 'NECO'],
      tags: ['business ideas', 'business plan', 'marketing', 'finance', 'startups'],
    },
    videoHint: 'entrepreneurship',
  },
];

export const LICENSE = { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' };
