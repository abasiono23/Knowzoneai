/**
 * Mock tutor "brain" for frontend-first development. Produces the same structured
 * TutorAnswer the real OpenAI-backed endpoint will return, from a small knowledge base.
 */
import type { Attachment, TutorAnswer, TutorLevel, TutorMode } from './types';

type Topic = { keywords: string[]; build: (level: TutorLevel) => TutorAnswer };

const base = (subject: string): Omit<TutorAnswer, 'summary' | 'body'> => ({
  keyTerms: [],
  steps: [],
  examples: [],
  commonMistakes: [],
  followUps: [],
  flashcards: [],
  quiz: [],
  subject,
  sources: [],
});

const TOPICS: Topic[] = [
  {
    keywords: ['photosynthesis', 'chlorophyll', 'plants make food'],
    build: (level) => ({
      ...base('Biology'),
      summary:
        level === 'beginner'
          ? 'Photosynthesis is how plants make their own food: they use sunlight to turn water and carbon dioxide into sugar, and release oxygen.'
          : 'Photosynthesis converts light energy into chemical energy, fixing CO₂ into glucose via the light-dependent reactions and the Calvin cycle.',
      body: [
        {
          type: 'p',
          text: 'Think of a leaf as a tiny solar-powered kitchen. Sunlight is the energy, water and carbon dioxide are the ingredients, and glucose is the meal.',
        },
        { type: 'formula', text: '6CO₂ + 6H₂O  →(light, chlorophyll)→  C₆H₁₂O₆ + 6O₂' },
        { type: 'h', text: 'Where it happens' },
        {
          type: 'list',
          items: [
            'In chloroplasts, mostly in the leaves',
            'Chlorophyll (the green pigment) absorbs the light',
            'Stomata let CO₂ in and O₂ out',
          ],
        },
        { type: 'h', text: 'The two stages' },
        {
          type: 'list',
          items: [
            'Light stage: water is split, oxygen is released, energy (ATP) is made',
            'Dark stage (Calvin cycle): CO₂ is turned into glucose using that energy',
          ],
        },
        {
          type: 'tip',
          text: 'Exam tip: WAEC often asks for the raw materials (CO₂, water) and the products (glucose, oxygen). Learn the equation by heart.',
        },
      ],
      keyTerms: [
        { term: 'Chlorophyll', meaning: 'Green pigment that absorbs light energy' },
        { term: 'Stomata', meaning: 'Tiny pores on leaves for gas exchange' },
        { term: 'Glucose', meaning: 'The sugar plants make and use for energy' },
      ],
      examples: [
        {
          level: 'Real life',
          title: 'Why plants die in the dark',
          scenario: 'A potted plant kept in a cupboard for two weeks turns yellow.',
          explanation: 'With no light, photosynthesis stops, so the plant can’t make glucose and uses up its stores.',
        },
        {
          level: 'Easy',
          title: 'Bubbles from pondweed',
          scenario: 'Pondweed under a lamp gives off bubbles.',
          explanation: 'The bubbles are oxygen, a product of photosynthesis. Brighter light means more bubbles.',
        },
        {
          level: 'Medium',
          title: 'Limiting factors',
          scenario: 'A greenhouse farmer adds extra CO₂ on sunny days.',
          explanation:
            'When light is plentiful, CO₂ becomes the limiting factor, so adding it speeds up photosynthesis.',
        },
      ],
      commonMistakes: [
        'Saying plants “breathe in” CO₂ for respiration. CO₂ is used for photosynthesis.',
        'Forgetting that oxygen is a by-product, not the main purpose.',
      ],
      followUps: [
        'What are limiting factors?',
        'How is respiration different?',
        'Give me a WAEC question on this',
        'Explain the Calvin cycle',
      ],
      flashcards: [
        { front: 'What are the raw materials of photosynthesis?', back: 'Carbon dioxide and water' },
        { front: 'What are the products of photosynthesis?', back: 'Glucose and oxygen' },
        { front: 'Where does photosynthesis take place?', back: 'In the chloroplasts (mainly in leaves)' },
        { front: 'What does chlorophyll do?', back: 'Absorbs light energy' },
      ],
      quiz: [
        {
          question: 'Which gas is released during photosynthesis?',
          options: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'],
          correctIndex: 1,
          explanation: 'Water is split in the light stage, releasing oxygen.',
        },
        {
          question: 'Photosynthesis takes place in the…',
          options: ['Mitochondria', 'Nucleus', 'Chloroplast', 'Ribosome'],
          correctIndex: 2,
          explanation: 'Chloroplasts contain chlorophyll, which captures light.',
        },
        {
          question: 'Which is NOT a raw material of photosynthesis?',
          options: ['Water', 'Carbon dioxide', 'Light energy', 'Oxygen'],
          correctIndex: 3,
          explanation: 'Oxygen is a product, not a raw material.',
        },
      ],
    }),
  },
  {
    keywords: ['mole', 'moles', 'molar mass', 'avogadro'],
    build: () => ({
      ...base('Chemistry'),
      summary:
        'A mole is a counting unit: 1 mole of anything contains 6.02 × 10²³ particles. To find moles from mass, divide the mass by the molar mass.',
      body: [
        {
          type: 'p',
          text: 'Just like a “dozen” means 12, a “mole” means 6.02 × 10²³. Chemists use it because atoms are far too small to count one by one.',
        },
        { type: 'formula', text: 'moles (n) = mass (g) ÷ molar mass (g/mol)' },
        { type: 'formula', text: 'number of particles = n × 6.02 × 10²³' },
        {
          type: 'tip',
          text: 'Write the formula triangle: mass on top, moles and molar mass underneath. Cover what you need to find.',
        },
      ],
      keyTerms: [
        { term: 'Mole', meaning: 'Amount containing 6.02 × 10²³ particles' },
        { term: 'Molar mass', meaning: 'Mass of 1 mole of a substance, in g/mol' },
        { term: 'Avogadro’s constant', meaning: '6.02 × 10²³ per mole' },
      ],
      steps: [
        { title: 'Write down what you know', detail: 'Mass of water = 36 g. We need the number of moles.' },
        {
          title: 'Find the molar mass',
          detail: 'H₂O = (2 × 1) + 16 = 18 g/mol.',
          why: 'Add the relative atomic masses of every atom in the formula.',
        },
        { title: 'Use the formula', detail: 'n = 36 ÷ 18', formula: 'n = mass ÷ molar mass' },
        { title: 'Calculate', detail: 'n = 2 moles' },
      ],
      finalAnswer: '36 g of water is 2 moles.',
      examples: [
        {
          level: 'Easy',
          title: 'Moles of carbon',
          scenario: 'How many moles are in 24 g of carbon (C = 12)?',
          explanation: 'n = 24 ÷ 12 = 2 mol.',
        },
        {
          level: 'Medium',
          title: 'Mass from moles',
          scenario: 'What is the mass of 0.5 mol of NaCl (Na = 23, Cl = 35.5)?',
          explanation: 'Molar mass = 58.5 g/mol, so mass = 0.5 × 58.5 = 29.25 g.',
        },
        {
          level: 'Hard',
          title: 'Counting particles',
          scenario: 'How many molecules are in 8.8 g of CO₂?',
          explanation: 'Molar mass = 44 g/mol, n = 0.2 mol, molecules = 0.2 × 6.02 × 10²³ = 1.204 × 10²³.',
        },
        {
          level: 'Real life',
          title: 'Baking with chemistry',
          scenario: 'A recipe needs “a dozen” eggs.',
          explanation: 'A mole works the same way, just a much bigger number, because particles are tiny.',
        },
      ],
      commonMistakes: [
        'Using the atomic number instead of the relative atomic mass.',
        'Forgetting to multiply by the number of atoms in the formula (H₂ has two hydrogens).',
      ],
      followUps: [
        'How do I use moles in balanced equations?',
        'Give me 3 practice questions',
        'What is molar volume of a gas?',
        'Explain it more simply',
      ],
      flashcards: [
        { front: 'What is a mole?', back: 'The amount of substance containing 6.02 × 10²³ particles' },
        { front: 'Formula for moles from mass', back: 'n = mass ÷ molar mass' },
        { front: 'Avogadro’s constant', back: '6.02 × 10²³ mol⁻¹' },
        { front: 'Molar mass of water', back: '18 g/mol' },
      ],
      quiz: [
        {
          question: 'How many moles are in 44 g of CO₂? (C = 12, O = 16)',
          options: ['0.5', '1', '2', '44'],
          correctIndex: 1,
          explanation: 'Molar mass of CO₂ = 44 g/mol, so 44 ÷ 44 = 1 mol.',
        },
        {
          question: 'What is the molar mass of NaOH? (Na = 23, O = 16, H = 1)',
          options: ['30', '39', '40', '41'],
          correctIndex: 2,
          explanation: '23 + 16 + 1 = 40 g/mol.',
        },
        {
          question: '2 moles of any substance contain…',
          options: ['6.02 × 10²³ particles', '1.204 × 10²⁴ particles', '3.01 × 10²³ particles', '12 particles'],
          correctIndex: 1,
          explanation: '2 × 6.02 × 10²³ = 1.204 × 10²⁴.',
        },
      ],
    }),
  },
  {
    keywords: ['quadratic', 'x²', 'x^2', '2x² + 5x', 'factorise', 'factorize'],
    build: () => ({
      ...base('Mathematics'),
      summary: 'Solve 2x² + 5x − 3 = 0 by factorising: (2x − 1)(x + 3) = 0, so x = ½ or x = −3.',
      body: [
        {
          type: 'p',
          text: 'A quadratic equation has an x² term. There are three main methods: factorising, completing the square and the quadratic formula. Try factorising first because it’s the fastest when it works.',
        },
        { type: 'formula', text: 'x = (−b ± √(b² − 4ac)) / 2a' },
        {
          type: 'tip',
          text: 'Check the discriminant b² − 4ac first: if it’s a perfect square, the equation factorises neatly.',
        },
      ],
      steps: [
        { title: 'Identify a, b and c', detail: 'In 2x² + 5x − 3 = 0: a = 2, b = 5, c = −3.' },
        {
          title: 'Find two numbers',
          detail: 'Multiply a × c = 2 × (−3) = −6. Find two numbers that multiply to −6 and add to 5: 6 and −1.',
          why: 'These let us split the middle term so we can factorise in pairs.',
        },
        { title: 'Split the middle term', detail: '2x² + 6x − x − 3 = 0' },
        { title: 'Factorise in pairs', detail: '2x(x + 3) − 1(x + 3) = 0  →  (2x − 1)(x + 3) = 0' },
        {
          title: 'Solve each bracket',
          detail: '2x − 1 = 0 gives x = ½. x + 3 = 0 gives x = −3.',
          why: 'If two things multiply to make 0, one of them must be 0.',
        },
        { title: 'Check your answers', detail: 'Substitute x = ½: 2(¼) + 5(½) − 3 = 0.5 + 2.5 − 3 = 0 ✓' },
      ],
      finalAnswer: 'x = ½ or x = −3',
      keyTerms: [
        { term: 'Roots', meaning: 'The values of x that make the equation equal zero' },
        { term: 'Discriminant', meaning: 'b² − 4ac; tells you how many real roots there are' },
      ],
      examples: [
        {
          level: 'Easy',
          title: 'Simple factorising',
          scenario: 'Solve x² + 5x + 6 = 0',
          explanation: '(x + 2)(x + 3) = 0, so x = −2 or x = −3.',
        },
        {
          level: 'Medium',
          title: 'Using the formula',
          scenario: 'Solve x² − 4x + 1 = 0',
          explanation: 'x = (4 ± √12) / 2 = 2 ± √3.',
        },
        {
          level: 'Hard',
          title: 'Word problem',
          scenario: 'A rectangle’s length is 3 cm more than its width and its area is 40 cm². Find the width.',
          explanation: 'w(w + 3) = 40 → w² + 3w − 40 = 0 → (w + 8)(w − 5) = 0 → w = 5 cm.',
        },
        {
          level: 'Real life',
          title: 'Throwing a ball',
          scenario: 'A ball’s height is h = −5t² + 20t. When does it land?',
          explanation: 'Set h = 0: −5t(t − 4) = 0, so it lands after 4 seconds.',
        },
      ],
      commonMistakes: ['Forgetting the ± in the formula, so missing one root.', 'Sign errors when c is negative.'],
      followUps: [
        'Solve it with the formula instead',
        'What does the discriminant tell me?',
        'Give me a similar question',
        'Why do we split the middle term?',
      ],
      flashcards: [
        { front: 'Quadratic formula', back: 'x = (−b ± √(b² − 4ac)) / 2a' },
        { front: 'What is the discriminant?', back: 'b² − 4ac' },
        { front: 'If the discriminant < 0…', back: 'There are no real roots' },
        { front: 'Roots of 2x² + 5x − 3 = 0', back: 'x = ½ or x = −3' },
      ],
      quiz: [
        {
          question: 'What are the roots of x² − 9 = 0?',
          options: ['x = 9', 'x = ±3', 'x = 3 only', 'x = −9'],
          correctIndex: 1,
          explanation: 'x² = 9, so x = 3 or x = −3.',
        },
        {
          question: 'For 3x² + 2x − 1 = 0, what is c?',
          options: ['3', '2', '−1', '1'],
          correctIndex: 2,
          explanation: 'c is the constant term: −1.',
        },
        {
          question: 'If b² − 4ac = 0, the equation has…',
          options: ['No real roots', 'One repeated root', 'Two different roots', 'Infinite roots'],
          correctIndex: 1,
          explanation: 'A zero discriminant gives one repeated root.',
        },
      ],
    }),
  },
  {
    keywords: ['newton', 'inertia', 'f = ma', 'force', 'motion'],
    build: () => ({
      ...base('Physics'),
      summary:
        'Newton’s three laws: objects keep doing what they’re doing unless a force acts; force = mass × acceleration; every action has an equal and opposite reaction.',
      body: [
        { type: 'h', text: '1st law: inertia' },
        {
          type: 'p',
          text: 'When a danfo bus brakes suddenly, passengers lurch forward. Their bodies want to keep moving.',
        },
        { type: 'h', text: '2nd law' },
        { type: 'formula', text: 'F = m × a' },
        {
          type: 'p',
          text: 'Pushing an empty wheelbarrow is easier than a full one: more mass needs more force for the same acceleration.',
        },
        { type: 'h', text: '3rd law' },
        {
          type: 'p',
          text: 'When you kick a football, the ball pushes back on your foot with the same force. That’s why it hurts to kick a wall!',
        },
      ],
      keyTerms: [
        { term: 'Inertia', meaning: 'Resistance of an object to a change in motion' },
        { term: 'Newton (N)', meaning: 'The unit of force: 1 N = 1 kg·m/s²' },
      ],
      steps: [
        { title: 'Write the formula', detail: 'F = m × a' },
        { title: 'Substitute', detail: 'F = 1200 kg × 2 m/s²' },
        { title: 'Calculate', detail: 'F = 2400 N' },
      ],
      finalAnswer: 'A 1200 kg car accelerating at 2 m/s² needs 2400 N of force.',
      examples: [
        {
          level: 'Real life',
          title: 'Seatbelts',
          scenario: 'Why do cars have seatbelts?',
          explanation:
            'Inertia keeps your body moving when the car stops suddenly. The belt provides the force to stop you.',
        },
        {
          level: 'Easy',
          title: 'Finding force',
          scenario: 'A 5 kg box accelerates at 3 m/s². What is the force?',
          explanation: 'F = 5 × 3 = 15 N.',
        },
        {
          level: 'Medium',
          title: 'Finding acceleration',
          scenario: 'A 20 N force acts on a 4 kg trolley.',
          explanation: 'a = F ÷ m = 20 ÷ 4 = 5 m/s².',
        },
      ],
      commonMistakes: [
        'Thinking a moving object needs a constant force to keep moving (it doesn’t without friction).',
        'Mixing up mass (kg) and weight (N).',
      ],
      followUps: [
        'What’s the difference between mass and weight?',
        'Explain the 3rd law with rockets',
        'Give me a calculation to try',
        'How does friction fit in?',
      ],
      flashcards: [
        {
          front: 'Newton’s 1st law',
          back: 'An object stays at rest or keeps moving at constant velocity unless a resultant force acts on it',
        },
        { front: 'Newton’s 2nd law', back: 'F = m × a' },
        { front: 'Newton’s 3rd law', back: 'Every action has an equal and opposite reaction' },
      ],
      quiz: [
        {
          question: 'A 2 kg ball accelerates at 4 m/s². The force is…',
          options: ['2 N', '6 N', '8 N', '0.5 N'],
          correctIndex: 2,
          explanation: 'F = 2 × 4 = 8 N.',
        },
        {
          question: 'Passengers jerk forward when a bus stops because of…',
          options: ['Gravity', 'Inertia', 'Friction', 'Reaction'],
          correctIndex: 1,
          explanation: 'Inertia: their bodies keep moving forward.',
        },
      ],
    }),
  },
  {
    keywords: ['demand', 'supply', 'price', 'market', 'equilibrium'],
    build: () => ({
      ...base('Economics'),
      summary:
        'Demand falls as price rises; supply rises as price rises. The market settles where they meet, at the equilibrium price.',
      body: [
        {
          type: 'p',
          text: 'Picture tomatoes at Mile 12 market. When tomatoes are scarce in the dry season, prices shoot up. Buyers buy less (demand falls) and farmers rush to sell more (supply rises).',
        },
        {
          type: 'list',
          items: [
            'Law of demand: higher price → lower quantity demanded',
            'Law of supply: higher price → higher quantity supplied',
            'Equilibrium: quantity demanded = quantity supplied',
          ],
        },
        {
          type: 'tip',
          text: 'In diagrams, demand slopes down, supply slopes up. Label both axes: price (vertical), quantity (horizontal).',
        },
      ],
      keyTerms: [
        { term: 'Equilibrium price', meaning: 'Price where demand equals supply' },
        { term: 'Excess demand', meaning: 'Shortage: buyers want more than is supplied' },
      ],
      examples: [
        {
          level: 'Real life',
          title: 'Fuel scarcity',
          scenario: 'During fuel scarcity, black-market prices rise.',
          explanation: 'Supply falls sharply while demand stays high, so the price rises.',
        },
        {
          level: 'Easy',
          title: 'Festive season',
          scenario: 'Chicken prices rise at Christmas.',
          explanation: 'Demand increases, shifting the demand curve right and raising price.',
        },
      ],
      commonMistakes: [
        'Confusing a movement along the curve (price change) with a shift of the curve (other factors).',
      ],
      followUps: [
        'What shifts the demand curve?',
        'Explain elasticity',
        'Draw it as a diagram',
        'Give me a JAMB question',
      ],
      flashcards: [
        { front: 'Law of demand', back: 'As price rises, quantity demanded falls (all else equal)' },
        { front: 'Law of supply', back: 'As price rises, quantity supplied rises' },
        { front: 'Equilibrium', back: 'Where quantity demanded equals quantity supplied' },
      ],
      quiz: [
        {
          question: 'If the price of a good rises, quantity demanded will…',
          options: ['Rise', 'Fall', 'Stay the same', 'Double'],
          correctIndex: 1,
          explanation: 'Law of demand.',
        },
        {
          question: 'A shortage happens when price is…',
          options: ['Above equilibrium', 'Below equilibrium', 'At equilibrium', 'Zero'],
          correctIndex: 1,
          explanation: 'Below equilibrium, demand exceeds supply.',
        },
      ],
    }),
  },
];

function generic(question: string, level: TutorLevel): TutorAnswer {
  const topic = question
    .replace(/[?.!]+$/, '')
    .replace(/^(what is|what are|explain|how does|how do|why does|why do)\s+/i, '');
  return {
    ...base('General'),
    summary: `Here’s a clear explanation of ${topic}${level === 'beginner' ? ', in simple words' : ''}.`,
    body: [
      {
        type: 'p',
        text: `Let’s break “${topic}” into small pieces. First we’ll look at what it means, then why it matters, and finally an example you can picture.`,
      },
      { type: 'h', text: 'The big idea' },
      {
        type: 'p',
        text: 'Every topic has one core idea that everything else hangs on. Once you understand it, the details become much easier to remember.',
      },
      {
        type: 'list',
        items: [
          'Start with the definition in your own words',
          'Connect it to something you already know',
          'Test yourself with one quick question',
        ],
      },
      {
        type: 'tip',
        text: 'Upload your class notes in AI Studio and I can answer using exactly what your teacher taught.',
      },
    ],
    keyTerms: [{ term: topic.slice(0, 40), meaning: 'The main idea of your question' }],
    examples: [
      {
        level: 'Easy',
        title: 'A simple case',
        scenario: `A basic situation involving ${topic}.`,
        explanation: 'Start here to make sure the core idea is clear.',
      },
      {
        level: 'Real life',
        title: 'In everyday life',
        scenario: `Where you might see ${topic} around you.`,
        explanation: 'Linking ideas to real life makes them stick.',
      },
    ],
    commonMistakes: ['Memorising definitions without understanding them.'],
    followUps: ['Explain it more simply', 'Give me an example', 'Quiz me on this', 'What should I learn next?'],
    flashcards: [
      { front: `What is ${topic}?`, back: 'Write the definition in your own words, then check it against your notes.' },
    ],
    quiz: [
      {
        question: `Which is the best way to learn ${topic}?`,
        options: ['Read it once', 'Explain it in your own words and test yourself', 'Copy it out', 'Skip it'],
        correctIndex: 1,
        explanation: 'Active recall and explaining in your own words are the most effective study methods.',
      },
    ],
  };
}

/** Questions read from an uploaded photo or page, as OCR would return them. */
export const SCANNED_QUESTION = 'Solve: 2x² + 5x − 3 = 0';

export function generateAnswer(input: {
  question: string;
  mode: TutorMode;
  level: TutorLevel;
  attachment?: Attachment;
  contextLabel?: string;
}): TutorAnswer {
  const text = (input.attachment ? `${SCANNED_QUESTION} ${input.question}` : input.question).toLowerCase();
  const topic = TOPICS.find((t) => t.keywords.some((k) => text.includes(k)));
  const answer = topic ? topic.build(input.level) : generic(input.question, input.level);

  // Step-by-step mode puts the working first; teach-back turns the answer into a prompt for the student.
  if (input.mode === 'steps' && answer.steps.length === 0) {
    answer.steps = answer.body
      .filter((b): b is { type: 'p'; text: string } => b.type === 'p')
      .map((b, i) => ({ title: `Step ${i + 1}`, detail: b.text }));
  }
  if (input.mode === 'teach-back') {
    answer.body = [
      {
        type: 'p',
        text: 'Your turn! Explain this topic to me as if I were a younger student. I’ll check what you got right and what’s missing.',
      },
      ...answer.body.slice(0, 2),
    ];
    answer.followUps = ['Here’s my explanation…', 'Give me a hint first', 'Show me the full answer'];
  }
  if (input.attachment)
    answer.sources = [`From your ${input.attachment.kind === 'pdf' ? 'page' : 'photo'}: “${SCANNED_QUESTION}”`];
  else if (input.contextLabel) answer.sources = [`Grounded in: ${input.contextLabel}`];
  return answer;
}

export function titleFrom(question: string) {
  const q = question.trim().replace(/\s+/g, ' ');
  return q.length > 48 ? `${q.slice(0, 45)}…` : q || 'New conversation';
}
