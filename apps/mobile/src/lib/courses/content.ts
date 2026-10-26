import type { Question } from '../studio/types';
import type { Block } from '../tutor/types';
import type { Course, CourseLesson, Interaction, LessonContent } from './types';

/**
 * Starter course catalogue. Mirrors the JSON the content service will return: modules of
 * lessons, each with authored content or a link to a catalogue lesson to derive it from.
 */

const p = (text: string): Block => ({ type: 'p', text });
const list = (...items: string[]): Block => ({ type: 'list', items });
const formula = (text: string): Block => ({ type: 'formula', text });
const tip = (text: string): Block => ({ type: 'tip', text });
const warn = (text: string): Block => ({ type: 'warning', text });

let qn = 0;
function q(
  question: string,
  options: string[],
  correctIndex: number,
  explanation: string,
  concept: string,
  difficulty: Question['difficulty'] = 'medium',
): Question {
  qn += 1;
  return {
    id: `cq${qn}`,
    type: options.length === 2 && options[0] === 'True' ? 'tf' : 'mcq',
    question,
    options,
    correctIndex,
    explanation,
    concept,
    difficulty,
  };
}
const tf = (statement: string, isTrue: boolean, explanation: string, concept: string) =>
  q(statement, ['True', 'False'], isTrue ? 0 : 1, explanation, concept, 'easy');

const lesson = (
  id: string,
  title: string,
  kind: CourseLesson['kind'],
  minutes: number,
  summary: string,
  extra: { catalogId?: string; content?: LessonContent } = {},
): CourseLesson => ({ id, title, kind, minutes, summary, ...extra });

// ─── Biology ─────────────────────────────────────────────────────────────────

const CELL_BUILD: Interaction[] = [
  {
    kind: 'match',
    prompt: 'Match each organelle to its job.',
    pairs: [
      ['Nucleus', 'Holds DNA and controls the cell'],
      ['Mitochondrion', 'Releases energy by respiration'],
      ['Ribosome', 'Makes proteins'],
      ['Cell membrane', 'Controls what enters and leaves'],
    ],
    feedback: 'Remember the job, not just the name. Examiners ask “state the function of…” far more than “label…”.',
  },
  {
    kind: 'choice',
    prompt: 'A cell has a cell wall, chloroplasts and a large permanent vacuole. What is it?',
    options: ['An animal cell', 'A plant cell', 'A bacterium', 'A red blood cell'],
    correctIndex: 1,
    feedback: 'Cell wall + chloroplasts + large vacuole is the classic plant-cell trio.',
  },
  {
    kind: 'fill',
    prompt: 'Complete the sentence.',
    before: 'Water moves into a cell by',
    after: 'through its partially permeable membrane.',
    options: ['osmosis', 'active transport', 'photosynthesis'],
    correctIndex: 0,
    feedback: 'Osmosis is the diffusion of water across a partially permeable membrane.',
  },
  {
    kind: 'order',
    prompt: 'Put these levels of organisation in order, smallest first.',
    items: ['Cell', 'Tissue', 'Organ', 'Organ system', 'Organism'],
    feedback: 'Cells → tissues → organs → organ systems → organism. A favourite one-mark question.',
  },
  {
    kind: 'reveal',
    prompt: 'Why do muscle cells contain lots of mitochondria?',
    answer:
      'Muscles need a lot of energy to contract, and mitochondria release that energy through aerobic respiration.',
  },
];

const PUNNETT: Interaction[] = [
  {
    kind: 'reveal',
    prompt: 'In pea plants, tall (T) is dominant over short (t). What does a plant with genotype Tt look like?',
    answer: 'Tall. One dominant allele is enough to show the dominant trait.',
  },
  {
    kind: 'choice',
    prompt: 'Two Tt plants are crossed. What fraction of the offspring will be short?',
    options: ['None', '1 in 4', '1 in 2', '3 in 4'],
    correctIndex: 1,
    feedback: 'TT, Tt, Tt, tt: only tt is short, so 1 in 4 (25%). The ratio is 3 tall : 1 short.',
  },
  {
    kind: 'match',
    prompt: 'Match each word to its meaning.',
    pairs: [
      ['Genotype', 'The alleles an organism has, e.g. Tt'],
      ['Phenotype', 'The trait you can see, e.g. tall'],
      ['Homozygous', 'Two identical alleles, e.g. TT or tt'],
      ['Heterozygous', 'Two different alleles, e.g. Tt'],
    ],
    feedback: 'Geno = genes, pheno = physical. Homo = same, hetero = different.',
  },
  {
    kind: 'fill',
    prompt: 'Complete the sentence.',
    before: 'A recessive trait only shows when the organism is',
    after: 'recessive.',
    options: ['heterozygous', 'homozygous', 'dominant'],
    correctIndex: 1,
    feedback: 'Recessive traits need two copies, e.g. tt.',
  },
];

const BIOLOGY: Course = {
  id: 'bio-cells',
  title: 'Biology: From Cells to Systems',
  subtitle: 'Everything WAEC and JAMB ask about cells, genetics and the body',
  subjectId: 'biology',
  level: 'Beginner',
  instructorId: 'ngozi',
  emoji: '🧬',
  colors: ['#0E8F6E', '#2DD4BF'],
  rating: 4.9,
  ratingCount: 3140,
  learners: 28400,
  description:
    'Start with a single cell and finish with whole body systems. Short readings, animated videos and hands-on activities build each idea, and a checkpoint quiz after every module tells you exactly what to revise.',
  outcomes: [
    'Name every organelle and explain its function',
    'Explain respiration and why cells need energy',
    'Solve genetics questions with Punnett squares',
    'Describe how blood circulates through the heart',
    'Answer WAEC-style theory questions with confidence',
  ],
  requirements: ['No prior biology needed', 'About 20 minutes a day'],
  exams: ['WAEC', 'NECO', 'JAMB'],
  tags: ['Cells', 'Genetics', 'Human biology', 'Ecology'],
  featured: true,
  updated: 'September 2026',
  modules: [
    {
      id: 'm1',
      title: 'The living cell',
      summary: 'What cells are made of and how they get energy.',
      lessons: [
        lesson(
          'b1',
          'What is a cell?',
          'reading',
          6,
          'Cell theory, organelles and the difference between plant and animal cells.',
          {
            content: {
              objectives: [
                'State the three ideas of cell theory',
                'Name the main organelles and their functions',
                'List three differences between plant and animal cells',
              ],
              reading: [
                {
                  heading: 'The smallest unit of life',
                  blocks: [
                    p(
                      'Every living thing, from a mango tree to you, is made of cells. A cell is the smallest unit that can carry out all the processes of life: feeding, respiring, growing, responding and reproducing.',
                    ),
                    p('Cell theory sums this up in three statements, and examiners love to ask for them:'),
                    list(
                      'All living things are made of one or more cells.',
                      'The cell is the basic unit of structure and function in living things.',
                      'All cells come from pre-existing cells.',
                    ),
                  ],
                },
                {
                  heading: 'Inside a cell',
                  blocks: [
                    p(
                      'A cell is a little factory. Each organelle has a job, and the cell only works because they work together.',
                    ),
                    list(
                      'Nucleus: contains DNA and controls the activities of the cell.',
                      'Cytoplasm: jelly-like fluid where most chemical reactions happen.',
                      'Cell membrane: partially permeable; controls what enters and leaves.',
                      'Mitochondria: release energy from food by aerobic respiration.',
                      'Ribosomes: where proteins are made.',
                    ),
                    tip(
                      'Learn each organelle as a pair: name + function. “Mitochondria release energy” earns the mark; “mitochondria are the powerhouse” usually does not.',
                    ),
                  ],
                },
                {
                  heading: 'Plant cells vs animal cells',
                  blocks: [
                    p('Plant cells have everything an animal cell has, plus three extra structures:'),
                    list(
                      'A cellulose cell wall that gives a fixed shape and support.',
                      'Chloroplasts containing chlorophyll for photosynthesis.',
                      'A large permanent vacuole filled with cell sap.',
                    ),
                    warn(
                      'Animal cells do NOT have a cell wall. Writing “animal cells have a cell membrane and a cell wall” loses the mark.',
                    ),
                  ],
                },
              ],
              keyPoints: [
                'All living things are made of cells, and all cells come from other cells',
                'Each organelle has one main job; learn the name and function together',
                'Plant cells have a cell wall, chloroplasts and a large vacuole',
              ],
            },
          },
        ),
        lesson('b2', 'How cells make energy', 'video', 5, 'Respiration in the mitochondria, aerobic and anaerobic.', {
          catalogId: 'l1',
        }),
        lesson(
          'b3',
          'Build a cell',
          'interactive',
          7,
          'Match organelles, sort structures and test your cell knowledge.',
          {
            content: { interactive: CELL_BUILD },
          },
        ),
        lesson('b4', 'Checkpoint: cells', 'quiz', 6, 'Five questions on module 1. Score 60% to pass.', {
          content: {
            quiz: [
              q(
                'Which organelle releases energy from glucose?',
                ['Nucleus', 'Ribosome', 'Mitochondrion', 'Vacuole'],
                2,
                'Aerobic respiration happens in the mitochondria and releases energy as ATP.',
                'Organelles',
                'easy',
              ),
              q(
                'Which structure is found in plant cells but NOT animal cells?',
                ['Cell membrane', 'Cell wall', 'Nucleus', 'Cytoplasm'],
                1,
                'Only plant cells (and some microbes) have a cellulose cell wall.',
                'Plant vs animal',
              ),
              tf(
                'All cells come from pre-existing cells.',
                true,
                'This is the third statement of cell theory.',
                'Cell theory',
              ),
              q(
                'What is the word equation for aerobic respiration?',
                [
                  'Glucose + oxygen → carbon dioxide + water + energy',
                  'Carbon dioxide + water → glucose + oxygen',
                  'Glucose → lactic acid + energy',
                  'Oxygen + water → glucose',
                ],
                0,
                'Aerobic respiration uses oxygen. The second option is photosynthesis; the third is anaerobic respiration in muscles.',
                'Respiration',
              ),
              q(
                'Where are proteins made?',
                ['Ribosomes', 'Chloroplasts', 'Cell wall', 'Vacuole'],
                0,
                'Ribosomes assemble proteins from amino acids.',
                'Organelles',
                'easy',
              ),
            ],
          },
        }),
      ],
    },
    {
      id: 'm2',
      title: 'Genetics',
      summary: 'How traits pass from parents to children.',
      lessons: [
        lesson(
          'b5',
          'Genes, alleles and DNA',
          'reading',
          7,
          'The language of inheritance, explained without the jargon headache.',
          {
            content: {
              objectives: [
                'Explain what genes and alleles are',
                'Use genotype and phenotype correctly',
                'Tell dominant and recessive alleles apart',
              ],
              reading: [
                {
                  heading: 'From DNA to traits',
                  blocks: [
                    p(
                      'DNA is a long molecule in the nucleus that carries instructions for building you. A gene is a section of DNA that codes for one characteristic, such as blood group or the ability to roll your tongue.',
                    ),
                    p(
                      'Genes come in different versions called alleles. You inherit one allele for each gene from your mother and one from your father.',
                    ),
                  ],
                },
                {
                  heading: 'Dominant and recessive',
                  blocks: [
                    p(
                      'A dominant allele shows its effect even if only one copy is present. We write it with a capital letter, like T for tall. A recessive allele only shows when both copies are recessive, like tt for short.',
                    ),
                    list(
                      'TT: homozygous dominant → tall',
                      'Tt: heterozygous → tall',
                      'tt: homozygous recessive → short',
                    ),
                    tip(
                      'Genotype is the letters (Tt). Phenotype is what you see (tall). Mixing them up is the most common mistake in genetics answers.',
                    ),
                  ],
                },
                {
                  heading: 'Why siblings look different',
                  blocks: [
                    p(
                      'Each child receives a random mix of alleles from each parent, so brothers and sisters inherit different combinations. That is why two brown-eyed parents can have a blue-eyed child: both can carry a hidden recessive allele.',
                    ),
                  ],
                },
              ],
              keyPoints: [
                'A gene codes for one characteristic; alleles are its versions',
                'Dominant alleles show with one copy; recessive need two',
                'Genotype = alleles, phenotype = observable trait',
              ],
            },
          },
        ),
        lesson(
          'b6',
          'Dominant vs recessive',
          'video',
          6,
          'Alleles, genotypes and Punnett squares in one short explainer.',
          { catalogId: 'l2' },
        ),
        lesson('b7', 'Punnett square lab', 'interactive', 8, 'Predict offspring and decode genetics vocabulary.', {
          content: { interactive: PUNNETT },
        }),
        lesson('b8', 'Checkpoint: genetics', 'quiz', 6, 'Five questions on module 2.', {
          content: {
            quiz: [
              q(
                'A plant has genotype Tt. Tall (T) is dominant. What is its phenotype?',
                ['Short', 'Tall', 'Medium', 'Cannot tell'],
                1,
                'One dominant allele is enough, so the plant is tall.',
                'Dominance',
                'easy',
              ),
              q(
                'Two heterozygous parents (Tt × Tt) are crossed. What is the expected phenotype ratio?',
                ['1 : 1', '3 : 1', '1 : 2 : 1', 'All tall'],
                1,
                'TT, Tt, Tt, tt gives 3 tall : 1 short. 1 : 2 : 1 is the genotype ratio.',
                'Punnett squares',
                'hard',
              ),
              tf(
                'Genotype describes the trait you can see.',
                false,
                'That is phenotype. Genotype is the combination of alleles.',
                'Vocabulary',
              ),
              q(
                'What is an allele?',
                ['A type of cell', 'A different version of a gene', 'A chromosome pair', 'A protein'],
                1,
                'Alleles are alternative forms of the same gene.',
                'Vocabulary',
                'easy',
              ),
              q(
                'Which genotype is homozygous recessive?',
                ['TT', 'Tt', 'tt', 'tT'],
                2,
                'Homozygous means two identical alleles; recessive means lowercase.',
                'Vocabulary',
              ),
            ],
          },
        }),
      ],
    },
    {
      id: 'm3',
      title: 'Body systems and ecology',
      summary: 'Blood, the heart, and how energy flows through nature.',
      lessons: [
        lesson(
          'b9',
          'The heart and circulation',
          'video',
          6,
          'Follow one drop of blood around the double circulation.',
          { catalogId: 'l31' },
        ),
        lesson('b10', 'Food chains and energy flow', 'reading', 5, 'Producers, consumers and the 10% rule.', {
          catalogId: 'l3',
        }),
        lesson(
          'b11',
          'Final exam',
          'quiz',
          10,
          'Eight questions across the whole course. Pass to earn your certificate.',
          {
            content: {
              quiz: [
                q(
                  'Which organelle controls the activities of the cell?',
                  ['Nucleus', 'Cytoplasm', 'Vacuole', 'Ribosome'],
                  0,
                  'The nucleus contains DNA, the cell’s instructions.',
                  'Organelles',
                  'easy',
                ),
                q(
                  'Muscles with too little oxygen produce…',
                  ['Glucose', 'Lactic acid', 'Starch', 'Chlorophyll'],
                  1,
                  'Anaerobic respiration in muscles produces lactic acid, causing cramp and fatigue.',
                  'Respiration',
                ),
                q(
                  'Which chamber of the heart pumps blood to the body?',
                  ['Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle'],
                  3,
                  'The left ventricle has the thickest wall because it pumps blood all around the body.',
                  'Circulation',
                  'hard',
                ),
                tf(
                  'Arteries carry blood away from the heart.',
                  true,
                  'Arteries = away. Veins carry blood back to the heart.',
                  'Circulation',
                ),
                q(
                  'About how much energy passes from one trophic level to the next?',
                  ['1%', '10%', '50%', '90%'],
                  1,
                  'Most energy is lost as heat, movement and waste, so only about 10% passes on.',
                  'Ecology',
                ),
                q(
                  'What do decomposers do?',
                  [
                    'Make food by photosynthesis',
                    'Hunt other consumers',
                    'Break down dead matter and recycle nutrients',
                    'Pump blood',
                  ],
                  2,
                  'Bacteria and fungi break down dead organisms and return nutrients to the soil.',
                  'Ecology',
                  'easy',
                ),
                q(
                  'Tt × tt. What fraction of offspring are short (tt)?',
                  ['None', '1/4', '1/2', 'All'],
                  2,
                  'Tt × tt gives Tt, Tt, tt, tt, so half are short.',
                  'Punnett squares',
                  'hard',
                ),
                tf(
                  'Animal cells have a cellulose cell wall.',
                  false,
                  'Only plant cells have a cellulose cell wall.',
                  'Plant vs animal',
                ),
              ],
            },
          },
        ),
      ],
    },
  ],
};

// ─── Python ──────────────────────────────────────────────────────────────────

const PY_PREDICT: Interaction[] = [
  {
    kind: 'choice',
    prompt: 'What does this print?\n\nname = "Ada"\nprint("Hello, " + name)',
    options: ['Hello, name', 'Hello, Ada', 'Hello, "Ada"', 'An error'],
    correctIndex: 1,
    feedback: 'The variable name holds "Ada", and + joins the two strings.',
  },
  {
    kind: 'choice',
    prompt: 'What does this print?\n\nx = 5\nx = x + 3\nprint(x)',
    options: ['5', '3', '8', 'x + 3'],
    correctIndex: 2,
    feedback: 'The right side is worked out first (5 + 3 = 8), then stored back in x.',
  },
  {
    kind: 'fill',
    prompt: 'Fill in the blank to ask the user for their name.',
    before: 'name =',
    after: '("What is your name? ")',
    options: ['print', 'input', 'ask'],
    correctIndex: 1,
    feedback: 'input() shows a prompt and returns what the user types, as a string.',
  },
  {
    kind: 'order',
    prompt: 'Put these lines in the right order to greet the user.',
    items: ['name = input("Name? ")', 'greeting = "Hi " + name', 'print(greeting)'],
    feedback: 'You must create a variable before you can use it. Python runs top to bottom.',
  },
  {
    kind: 'reveal',
    prompt: 'Why does print("2" + "3") show 23 and not 5?',
    answer: 'The quotes make them strings (text). + joins strings end to end. To add numbers, use print(2 + 3).',
  },
];

const PY_IF: Interaction[] = [
  {
    kind: 'choice',
    prompt: 'score = 72\nif score >= 50:\n    print("Pass")\nelse:\n    print("Try again")\n\nWhat prints?',
    options: ['Pass', 'Try again', 'Both', 'Nothing'],
    correctIndex: 0,
    feedback: '72 >= 50 is True, so only the if-block runs.',
  },
  {
    kind: 'match',
    prompt: 'Match each operator to its meaning.',
    pairs: [
      ['==', 'is equal to'],
      ['!=', 'is not equal to'],
      ['>=', 'greater than or equal to'],
      ['=', 'store a value in a variable'],
    ],
    feedback: 'One = stores a value; two == compares. Mixing them up is the number-one beginner bug.',
  },
  {
    kind: 'fill',
    prompt: 'Complete the check for an even number.',
    before: 'if n % 2',
    after: '0: print("even")',
    options: ['=', '==', '!='],
    correctIndex: 1,
    feedback: 'n % 2 is the remainder after dividing by 2. Even numbers leave 0.',
  },
  {
    kind: 'reveal',
    prompt: 'What is wrong with this code?\n\nif age > 18\n    print("Adult")',
    answer: 'It is missing the colon. It should be  if age > 18:  Python needs the colon to start the indented block.',
  },
];

const PYTHON: Course = {
  id: 'python-101',
  title: 'Python for Absolute Beginners',
  subtitle: 'Write real programs from your phone in two weeks',
  subjectId: 'computer-science',
  level: 'Beginner',
  instructorId: 'tobi',
  emoji: '🐍',
  colors: ['#1663C7', '#4CC9FF'],
  rating: 4.8,
  ratingCount: 2210,
  learners: 19300,
  description:
    'Never coded before? Perfect. You will learn how programs think, write your first lines of Python, and build small tools that make decisions. Every lesson includes a “predict the output” activity so you learn to read code, not just copy it.',
  outcomes: [
    'Write and run Python programs that use input and output',
    'Store and change data with variables',
    'Make decisions with if, elif and else',
    'Read short programs and predict what they do',
  ],
  requirements: ['A phone or computer', 'Curiosity. No maths beyond basic arithmetic'],
  tags: ['Coding', 'Python', 'Problem solving'],
  featured: true,
  updated: 'October 2026',
  modules: [
    {
      id: 'm1',
      title: 'First steps',
      summary: 'What programming is, and your first program.',
      lessons: [
        lesson(
          'p1',
          'What is programming?',
          'reading',
          5,
          'Programs are recipes for computers. Here’s how to write one.',
          {
            content: {
              objectives: [
                'Explain what a program is',
                'Know why Python is a great first language',
                'Understand the idea of an algorithm',
              ],
              reading: [
                {
                  heading: 'Programs are recipes',
                  blocks: [
                    p(
                      'A program is a list of instructions a computer follows exactly, in order. Like a recipe for jollof rice, it only works if the steps are clear and in the right order. Computers never guess what you meant.',
                    ),
                    p(
                      'The steps behind a program are called an algorithm. You already use algorithms every day: getting ready for school, finding the shortest route home, or deciding what to buy with ₦2,000.',
                    ),
                  ],
                },
                {
                  heading: 'Why Python?',
                  blocks: [
                    list(
                      'It reads almost like English: print("Hello") prints Hello.',
                      'It is used by Google, Instagram, NASA and Nigerian fintechs.',
                      'It runs on phones, laptops and in the browser.',
                    ),
                    tip('You can practise every example in this course with a free Python app on your phone.'),
                  ],
                },
                {
                  heading: 'How Python runs your code',
                  blocks: [
                    p(
                      'Python reads your program from top to bottom, one line at a time. If a line has a mistake, Python stops and shows an error message telling you which line went wrong. Errors are normal. Every programmer sees dozens a day.',
                    ),
                  ],
                },
              ],
              keyPoints: [
                'A program is a precise list of instructions',
                'An algorithm is the step-by-step plan behind it',
                'Python runs code top to bottom, one line at a time',
              ],
            },
          },
        ),
        lesson('p2', 'Your first Python program', 'video', 5, 'print, variables and input in one minute.', {
          catalogId: 'l24',
        }),
        lesson('p3', 'Predict the output', 'interactive', 8, 'Read code, guess what it does, then check.', {
          content: { interactive: PY_PREDICT },
        }),
        lesson('p4', 'Checkpoint: first steps', 'quiz', 5, 'Five quick questions on module 1.', {
          content: {
            quiz: [
              q(
                'What does print("Hi") do?',
                ['Stores Hi in a variable', 'Shows Hi on the screen', 'Asks the user for Hi', 'Nothing'],
                1,
                'print() displays output.',
                'Output',
                'easy',
              ),
              q(
                'Which line stores 10 in a variable called score?',
                ['score == 10', '10 = score', 'score = 10', 'print(score, 10)'],
                2,
                'The variable name goes on the left of a single =.',
                'Variables',
              ),
              tf(
                'input() always returns text (a string), even if the user types a number.',
                true,
                'Use int(input()) to turn it into a whole number.',
                'Input',
              ),
              q(
                'What does print(3 + 4) show?',
                ['3 + 4', '7', '34', 'An error'],
                1,
                'Without quotes these are numbers, so Python adds them.',
                'Output',
                'easy',
              ),
              q(
                'In what order does Python run lines of code?',
                ['Bottom to top', 'Randomly', 'Top to bottom', 'Shortest line first'],
                2,
                'Python runs one line at a time, from the top.',
                'Execution',
              ),
            ],
          },
        }),
      ],
    },
    {
      id: 'm2',
      title: 'Thinking like a programmer',
      summary: 'Data types, algorithms and decisions.',
      lessons: [
        lesson(
          'p5',
          'Variables and data types',
          'reading',
          6,
          'Strings, integers, floats and booleans, and why types matter.',
          {
            content: {
              objectives: [
                'Name four basic data types',
                'Convert between text and numbers',
                'Avoid the most common type errors',
              ],
              reading: [
                {
                  heading: 'Four types to know',
                  blocks: [
                    list(
                      'str (string): text in quotes, e.g. "Lagos"',
                      'int (integer): whole numbers, e.g. 42',
                      'float: decimals, e.g. 3.5',
                      'bool (boolean): True or False',
                    ),
                    p('Python decides the type from the value you store. You can check it with type(x).'),
                  ],
                },
                {
                  heading: 'Converting types',
                  blocks: [
                    p('input() always gives you a string. To do maths with it, convert it first:'),
                    formula('age = int(input("Age? "))'),
                    p('Going the other way, str(42) turns a number into text so you can join it to other text.'),
                    warn('"Score: " + 42 causes a TypeError. Use "Score: " + str(42), or print("Score:", 42).'),
                  ],
                },
              ],
              keyPoints: [
                'str, int, float and bool are the core types',
                'input() returns a string; convert with int() or float()',
                'You cannot join text and numbers without converting',
              ],
            },
          },
        ),
        lesson('p6', 'Algorithms in everyday life', 'video', 5, 'Spot the algorithms hiding in your day.', {
          catalogId: 'l25',
        }),
        lesson(
          'p7',
          'Making decisions with if',
          'interactive',
          8,
          'Conditions, comparisons and the colon that trips everyone up.',
          { content: { interactive: PY_IF } },
        ),
        lesson('p8', 'Final project quiz', 'quiz', 8, 'Six questions. Pass to earn your certificate.', {
          content: {
            quiz: [
              q(
                'What is the type of 3.14?',
                ['int', 'str', 'float', 'bool'],
                2,
                'Numbers with a decimal point are floats.',
                'Types',
                'easy',
              ),
              q(
                'Which operator checks whether two values are equal?',
                ['=', '==', '!=', '=>'],
                1,
                'A single = assigns; == compares.',
                'Conditions',
              ),
              q(
                'age = input("Age? ") and the user types 15. What is age?',
                ['The number 15', 'The string "15"', 'True', 'An error'],
                1,
                'input() always returns a string.',
                'Types',
                'hard',
              ),
              tf('Every if line must end with a colon.', true, 'The colon starts the indented block.', 'Syntax'),
              q(
                'What does 17 % 5 give?',
                ['3', '2', '3.4', '12'],
                1,
                '% gives the remainder: 17 = 3 × 5 + 2.',
                'Operators',
                'hard',
              ),
              q(
                'Which is a valid boolean?',
                ['"True"', 'true', 'True', 'YES'],
                2,
                'Python booleans are True and False with a capital letter, no quotes.',
                'Types',
              ),
            ],
          },
        }),
      ],
    },
  ],
};

// ─── Maths ───────────────────────────────────────────────────────────────────

const SOLVE_IT: Interaction[] = [
  {
    kind: 'order',
    prompt: 'Put the steps for solving x² − 5x + 6 = 0 in order.',
    items: [
      'Find two numbers that multiply to 6 and add to −5',
      'Write (x − 2)(x − 3) = 0',
      'Set each bracket to zero',
      'x = 2 or x = 3',
    ],
    feedback: 'Factorise, set each bracket to zero, solve. The same four steps every time.',
  },
  {
    kind: 'choice',
    prompt: 'Factorise x² + 7x + 12.',
    options: ['(x + 3)(x + 4)', '(x + 2)(x + 6)', '(x − 3)(x − 4)', '(x + 12)(x + 1)'],
    correctIndex: 0,
    feedback: '3 × 4 = 12 and 3 + 4 = 7.',
  },
  {
    kind: 'fill',
    prompt: 'Complete the quadratic formula.',
    before: 'x = (−b ± √(b² −',
    after: ')) ÷ 2a',
    options: ['4ac', '2ac', 'ac'],
    correctIndex: 0,
    feedback: 'b² − 4ac is called the discriminant.',
  },
  {
    kind: 'reveal',
    prompt: 'The discriminant b² − 4ac is negative. What does that tell you?',
    answer: 'The equation has no real roots. The graph never crosses the x-axis.',
  },
];

const STATS_LAB: Interaction[] = [
  {
    kind: 'choice',
    prompt: 'Scores: 4, 7, 7, 9, 13. What is the median?',
    options: ['7', '8', '9', '4'],
    correctIndex: 0,
    feedback: 'The numbers are already in order; the middle one is 7.',
  },
  {
    kind: 'choice',
    prompt: 'Same scores: 4, 7, 7, 9, 13. What is the mean?',
    options: ['7', '8', '9', '40'],
    correctIndex: 1,
    feedback: 'Sum = 40, count = 5, so the mean is 40 ÷ 5 = 8.',
  },
  {
    kind: 'match',
    prompt: 'Match each average to how you find it.',
    pairs: [
      ['Mean', 'Add them all, divide by how many'],
      ['Median', 'The middle value when in order'],
      ['Mode', 'The value that appears most often'],
      ['Range', 'Largest minus smallest'],
    ],
    feedback: 'Range is not an average, but it is often asked in the same question.',
  },
  {
    kind: 'reveal',
    prompt: 'House prices in an area: most are ₦20m, one is ₦900m. Which average best describes a typical house?',
    answer: 'The median. One extreme value drags the mean up, but barely moves the median.',
  },
];

const MATHS: Course = {
  id: 'waec-maths',
  title: 'WAEC Maths: Algebra, Trig & Statistics',
  subtitle: 'The high-scoring topics, taught the way examiners mark',
  subjectId: 'mathematics',
  level: 'Intermediate',
  instructorId: 'funmi',
  emoji: '📐',
  colors: ['#5B2BB8', '#C26BFF'],
  rating: 4.9,
  ratingCount: 4870,
  learners: 41200,
  description:
    'Three topics appear on almost every WAEC Mathematics paper: quadratic equations, trigonometry and statistics. This course teaches each one with a worked method, a practice activity and an exam-style checkpoint.',
  outcomes: [
    'Solve quadratics by factorising and by formula',
    'Use SOH CAH TOA to find missing sides and angles',
    'Apply circle theorems to angle questions',
    'Calculate mean, median, mode and range, and know which to use',
  ],
  requirements: ['Comfortable with basic algebra (expanding brackets)', 'A calculator'],
  exams: ['WAEC', 'NECO', 'JAMB'],
  tags: ['Algebra', 'Trigonometry', 'Statistics', 'Exam prep'],
  featured: true,
  updated: 'October 2026',
  modules: [
    {
      id: 'm1',
      title: 'Quadratic equations',
      summary: 'Factorising and the formula.',
      lessons: [
        lesson('m1', 'Solving quadratic equations', 'video', 6, 'Three methods, one short explainer.', {
          catalogId: 'l10',
        }),
        lesson(
          'm2',
          'Factorising, step by step',
          'reading',
          7,
          'The method that solves most WAEC quadratics in under a minute.',
          {
            content: {
              objectives: [
                'Factorise x² + bx + c',
                'Solve by setting each bracket to zero',
                'Know when to switch to the formula',
              ],
              reading: [
                {
                  heading: 'The idea',
                  blocks: [
                    p(
                      'A quadratic equation has an x² term, like x² − 5x + 6 = 0. Factorising rewrites it as two brackets multiplied together. If two things multiply to make zero, one of them must be zero. That is the whole trick.',
                    ),
                  ],
                },
                {
                  heading: 'Worked example',
                  blocks: [
                    formula('x² − 5x + 6 = 0'),
                    list(
                      'Find two numbers that multiply to +6 and add to −5: they are −2 and −3.',
                      'Write the brackets: (x − 2)(x − 3) = 0.',
                      'Set each bracket to zero: x − 2 = 0 or x − 3 = 0.',
                      'Solve: x = 2 or x = 3.',
                    ),
                    tip('Always check by substituting back. 2² − 5(2) + 6 = 0 ✓'),
                  ],
                },
                {
                  heading: 'When factorising fails',
                  blocks: [
                    p(
                      'If you cannot find whole numbers that work in about 30 seconds, use the quadratic formula instead:',
                    ),
                    formula('x = (−b ± √(b² − 4ac)) ÷ 2a'),
                    warn('Bracket negative values of b when substituting. −(−5) is +5, a classic place to lose marks.'),
                  ],
                },
              ],
              keyPoints: [
                'If two brackets multiply to zero, one bracket is zero',
                'Find numbers that multiply to c and add to b',
                'Use the formula when factorising takes too long',
              ],
            },
          },
        ),
        lesson('m3', 'Solve it', 'interactive', 8, 'Order the steps, factorise and complete the formula.', {
          content: { interactive: SOLVE_IT },
        }),
        lesson('m4', 'Checkpoint: quadratics', 'quiz', 6, 'Exam-style questions on quadratics.', {
          content: {
            quiz: [
              q(
                'Solve x² − 9 = 0.',
                ['x = 9', 'x = ±3', 'x = 3 only', 'x = ±9'],
                1,
                'x² = 9, so x = 3 or x = −3.',
                'Quadratics',
                'easy',
              ),
              q(
                'Factorise x² + 5x + 6.',
                ['(x + 1)(x + 6)', '(x + 2)(x + 3)', '(x − 2)(x − 3)', '(x + 5)(x + 1)'],
                1,
                '2 × 3 = 6 and 2 + 3 = 5.',
                'Factorising',
              ),
              q(
                'What are the roots of (x − 4)(x + 1) = 0?',
                ['4 and −1', '−4 and 1', '4 and 1', '−4 and −1'],
                0,
                'Set each bracket to zero: x = 4 or x = −1.',
                'Roots',
              ),
              tf(
                'If b² − 4ac < 0, the equation has two real roots.',
                false,
                'A negative discriminant means no real roots.',
                'Discriminant',
              ),
              q(
                'For 2x² + 3x − 2 = 0, what is a?',
                ['3', '−2', '2', '1'],
                2,
                'a is the coefficient of x².',
                'Formula',
                'easy',
              ),
            ],
          },
        }),
      ],
    },
    {
      id: 'm2',
      title: 'Trigonometry and circles',
      summary: 'Right-angled triangles and circle theorems.',
      lessons: [
        lesson('m5', 'Trigonometry: SOH CAH TOA', 'video', 6, 'Find any side or angle in a right-angled triangle.', {
          catalogId: 'l11',
        }),
        lesson('m6', 'Angles in circles', 'reading', 6, 'The circle theorems that come up every year.', {
          catalogId: 'l32',
        }),
        lesson('m7', 'Checkpoint: trigonometry', 'quiz', 6, 'Five questions on module 2.', {
          content: {
            quiz: [
              q(
                'In a right-angled triangle, sin θ = …',
                ['adjacent ÷ hypotenuse', 'opposite ÷ hypotenuse', 'opposite ÷ adjacent', 'hypotenuse ÷ opposite'],
                1,
                'SOH: sin = opposite ÷ hypotenuse.',
                'SOH CAH TOA',
                'easy',
              ),
              q(
                'The hypotenuse is 10 cm and θ = 30°. What is the opposite side? (sin 30° = 0.5)',
                ['5 cm', '20 cm', '8.66 cm', '10 cm'],
                0,
                'opposite = 10 × sin 30° = 5 cm.',
                'SOH CAH TOA',
              ),
              q(
                'The angle at the centre is ___ the angle at the circumference on the same arc.',
                ['equal to', 'half', 'twice', 'three times'],
                2,
                'Angle at centre = 2 × angle at circumference.',
                'Circle theorems',
              ),
              tf(
                'The angle in a semicircle is 90°.',
                true,
                'Any angle subtended by a diameter at the circumference is a right angle.',
                'Circle theorems',
              ),
              q(
                'Opposite angles in a cyclic quadrilateral add up to…',
                ['90°', '180°', '270°', '360°'],
                1,
                'They are supplementary: they add to 180°.',
                'Circle theorems',
                'hard',
              ),
            ],
          },
        }),
      ],
    },
    {
      id: 'm3',
      title: 'Statistics',
      summary: 'Averages, spread and choosing the right one.',
      lessons: [
        lesson('m8', 'Mean, median and mode', 'reading', 5, 'Three averages and when each one tells the truth.', {
          catalogId: 'l12',
        }),
        lesson('m9', 'Statistics lab', 'interactive', 7, 'Work out averages and pick the best one.', {
          content: { interactive: STATS_LAB },
        }),
        lesson('m10', 'Final exam', 'quiz', 10, 'Eight questions across the course. Pass to earn your certificate.', {
          content: {
            quiz: [
              q('Find the mean of 2, 4, 6, 8.', ['4', '5', '6', '20'], 1, 'Sum 20 ÷ 4 = 5.', 'Statistics', 'easy'),
              q(
                'Find the mode of 3, 5, 5, 7, 9.',
                ['5', '7', '3', '5.8'],
                0,
                '5 appears most often.',
                'Statistics',
                'easy',
              ),
              q(
                'Solve x² − 7x + 10 = 0.',
                ['2 and 5', '−2 and −5', '1 and 10', '7 and 10'],
                0,
                '(x − 2)(x − 5) = 0.',
                'Quadratics',
              ),
              q(
                'tan θ = …',
                ['opposite ÷ adjacent', 'adjacent ÷ opposite', 'opposite ÷ hypotenuse', 'adjacent ÷ hypotenuse'],
                0,
                'TOA: tan = opposite ÷ adjacent.',
                'SOH CAH TOA',
                'easy',
              ),
              q('The range of 12, 4, 19, 7 is…', ['15', '12', '19', '10.5'], 0, '19 − 4 = 15.', 'Statistics'),
              tf(
                'The median is affected more by one extreme value than the mean is.',
                false,
                'It is the other way round. The mean is pulled by extreme values.',
                'Statistics',
              ),
              q(
                'An angle at the circumference is 40°. What is the angle at the centre on the same arc?',
                ['20°', '40°', '80°', '140°'],
                2,
                'Angle at centre = 2 × 40° = 80°.',
                'Circle theorems',
                'hard',
              ),
              q(
                'What is the discriminant of x² + 4x + 4?',
                ['0', '8', '16', '−16'],
                0,
                '4² − 4(1)(4) = 0, so there is one repeated root.',
                'Discriminant',
                'hard',
              ),
            ],
          },
        }),
      ],
    },
  ],
};

// ─── Shorter courses (content derived from catalogue lessons, with authored quizzes) ──────

const CHEMISTRY: Course = {
  id: 'chem-foundations',
  title: 'Chemistry Foundations',
  subtitle: 'Moles, bonding, organic chemistry and electrolysis',
  subjectId: 'chemistry',
  level: 'Intermediate',
  instructorId: 'emeka',
  emoji: '⚗️',
  colors: ['#3B2DBF', '#7C5CFF'],
  rating: 4.7,
  ratingCount: 1320,
  learners: 12600,
  description:
    'The four chemistry topics students find hardest, made visual. Each lesson builds on the last, and the checkpoints mirror WAEC objective questions.',
  outcomes: [
    'Convert between mass, moles and particles',
    'Tell ionic and covalent bonds apart',
    'Name simple alkanes',
    'Explain what happens at each electrode in electrolysis',
  ],
  requirements: ['Basic idea of atoms and elements'],
  exams: ['WAEC', 'JAMB'],
  tags: ['Mole concept', 'Bonding', 'Organic', 'Electrolysis'],
  updated: 'August 2026',
  modules: [
    {
      id: 'm1',
      title: 'Amounts and bonds',
      summary: 'Counting particles and how atoms join.',
      lessons: [
        lesson('c1', 'The mole concept', 'video', 5, 'Avogadro’s number and the moles triangle.', { catalogId: 'l4' }),
        lesson('c2', 'Ionic vs covalent bonding', 'reading', 6, 'Giving electrons away vs sharing them.', {
          catalogId: 'l5',
        }),
        lesson('c3', 'Checkpoint: moles and bonds', 'quiz', 5, 'Four questions on module 1.', {
          content: {
            quiz: [
              q(
                'How many particles are in one mole?',
                ['6.02 × 10²³', '6.02 × 10²²', '1 × 10²³', '12'],
                0,
                'Avogadro’s constant is 6.02 × 10²³.',
                'Moles',
                'easy',
              ),
              q(
                'How many moles are in 36 g of water (Mr = 18)?',
                ['0.5', '2', '18', '648'],
                1,
                'moles = mass ÷ Mr = 36 ÷ 18 = 2.',
                'Moles',
              ),
              q(
                'Sodium chloride is held together by…',
                ['Covalent bonds', 'Ionic bonds', 'Metallic bonds', 'Hydrogen bonds'],
                1,
                'A metal and a non-metal transfer electrons to form ions.',
                'Bonding',
                'easy',
              ),
              tf(
                'Covalent bonds form when atoms share electrons.',
                true,
                'Non-metal atoms share pairs of electrons.',
                'Bonding',
              ),
            ],
          },
        }),
      ],
    },
    {
      id: 'm2',
      title: 'Reactions in action',
      summary: 'Organic naming and electrolysis.',
      lessons: [
        lesson('c4', 'Naming alkanes', 'reading', 6, 'IUPAC rules in four steps.', { catalogId: 'l6' }),
        lesson('c5', 'Electrolysis step by step', 'video', 6, 'Ions, electrodes and what forms where.', {
          catalogId: 'l30',
        }),
        lesson('c6', 'Final exam', 'quiz', 8, 'Six questions. Pass to earn your certificate.', {
          content: {
            quiz: [
              q(
                'What is the name of the alkane with 3 carbon atoms?',
                ['Methane', 'Ethane', 'Propane', 'Butane'],
                2,
                'Meth 1, eth 2, prop 3, but 4.',
                'Organic',
                'easy',
              ),
              q(
                'In electrolysis, positive ions move to the…',
                ['Anode', 'Cathode', 'Electrolyte', 'Salt bridge'],
                1,
                'Positive ions (cations) are attracted to the negative cathode.',
                'Electrolysis',
              ),
              q(
                'Which is ionic?',
                ['CH₄', 'H₂O', 'MgO', 'CO₂'],
                2,
                'Magnesium (metal) and oxygen (non-metal) form ions.',
                'Bonding',
              ),
              tf(
                'Ionic compounds conduct electricity when molten.',
                true,
                'Melting frees the ions to move.',
                'Bonding',
              ),
              q(
                'Moles of 8 g of oxygen gas, O₂ (Mr = 32)?',
                ['0.25', '4', '0.5', '256'],
                0,
                '8 ÷ 32 = 0.25.',
                'Moles',
                'hard',
              ),
              q(
                'When naming alkanes, number the chain from the end…',
                ['furthest from a branch', 'nearest a branch', 'with the most hydrogens', 'on the left'],
                1,
                'This gives branches the lowest possible numbers.',
                'Organic',
              ),
            ],
          },
        }),
      ],
    },
  ],
};

const AI_SPOT: Interaction[] = [
  {
    kind: 'choice',
    prompt: 'Which of these uses AI?',
    options: [
      'A calculator adding 2 + 2',
      'A phone unlocking when it recognises your face',
      'A light switch',
      'A printed timetable',
    ],
    correctIndex: 1,
    feedback: 'Face unlock learned patterns from many examples; the others follow fixed rules.',
  },
  {
    kind: 'reveal',
    prompt: 'An AI chatbot confidently tells you a fact. Should you trust it?',
    answer:
      'Not automatically. AI can “hallucinate”: produce fluent answers that are wrong. Check important facts against a textbook or trusted source.',
  },
  {
    kind: 'match',
    prompt: 'Match each term to its meaning.',
    pairs: [
      ['Training data', 'The examples an AI learns from'],
      ['Model', 'What the AI learned, used to make predictions'],
      ['Bias', 'Unfair patterns copied from the data'],
      ['Prompt', 'The instruction you give an AI tool'],
    ],
    feedback: 'Good data in, good model out. Biased data in, biased model out.',
  },
];

const AI_PROMPT: Interaction[] = [
  {
    kind: 'choice',
    prompt: 'Which prompt will get the most useful answer?',
    options: [
      'photosynthesis',
      'Explain photosynthesis',
      'Explain photosynthesis to an SS2 student in 5 bullet points, with one exam tip',
      'Tell me everything',
    ],
    correctIndex: 2,
    feedback: 'Great prompts say who it is for, the format you want and the goal.',
  },
  {
    kind: 'order',
    prompt: 'Order the parts of a strong prompt.',
    items: [
      'Role: “You are a patient maths tutor.”',
      'Task: “Explain how to factorise x² + 5x + 6.”',
      'Format: “Use numbered steps.”',
      'Check: “Then give me one practice question.”',
    ],
    feedback: 'Role, task, format, check. RTFC.',
  },
  {
    kind: 'reveal',
    prompt: 'Is it OK to paste an AI answer straight into your homework?',
    answer:
      'No. Use AI to understand, then write in your own words. Teachers can tell, and you lose the learning that the homework was for.',
  },
];

const AI_LITERACY: Course = {
  id: 'ai-literacy',
  title: 'AI Literacy for Students',
  subtitle: 'Understand AI, use it well and spot when it’s wrong',
  subjectId: 'ai-literacy',
  level: 'Beginner',
  instructorId: 'zainab',
  emoji: '🤖',
  colors: ['#6A45FF', '#FF7A93'],
  rating: 4.8,
  ratingCount: 980,
  learners: 9800,
  description:
    'AI is in your phone, your feed and your homework. Learn how it actually works, write prompts that get great answers, and build the judgement to know when not to trust it.',
  outcomes: [
    'Explain how AI learns from data',
    'Write clear, specific prompts',
    'Spot hallucinations and bias',
    'Use AI honestly for schoolwork',
  ],
  requirements: ['None'],
  tags: ['AI', 'Digital skills', 'Future skills'],
  featured: true,
  updated: 'October 2026',
  modules: [
    {
      id: 'm1',
      title: 'How AI works',
      summary: 'Data, patterns and predictions.',
      lessons: [
        lesson('a1', 'What is AI, really?', 'video', 5, 'No robots. Just patterns learned from data.', {
          catalogId: 'l26',
        }),
        lesson('a2', 'How machines learn', 'reading', 6, 'Training data, models and why bias happens.', {
          content: {
            objectives: [
              'Describe how AI learns from examples',
              'Explain what a model is',
              'Give an example of AI bias',
            ],
            reading: [
              {
                heading: 'Learning from examples',
                blocks: [
                  p(
                    'Traditional programs follow rules a person wrote. Machine learning flips that: you show the computer thousands of examples, and it finds the patterns itself. Show it 10,000 photos labelled “cat” or “dog” and it learns what makes a cat look like a cat.',
                  ),
                  p(
                    'What it learns is called a model. When you give the model something new, it makes a prediction based on the patterns it found.',
                  ),
                ],
              },
              {
                heading: 'Why AI gets things wrong',
                blocks: [
                  list(
                    'It only knows what was in its training data.',
                    'It predicts what sounds likely, not what is true.',
                    'If the data was unfair, the model copies that unfairness. This is bias.',
                  ),
                  warn(
                    'A face-recognition model trained mostly on lighter-skinned faces may perform worse on darker-skinned faces. Data choices are human choices.',
                  ),
                ],
              },
            ],
            keyPoints: [
              'AI finds patterns in example data',
              'A model makes predictions from those patterns',
              'Biased data produces biased AI',
            ],
          },
        }),
        lesson('a3', 'AI or not?', 'interactive', 5, 'Spot AI around you and learn the key words.', {
          content: { interactive: AI_SPOT },
        }),
      ],
    },
    {
      id: 'm2',
      title: 'Using AI well',
      summary: 'Prompting and honest use.',
      lessons: [
        lesson('a4', 'Prompting like a pro', 'video', 5, 'Role, task, format, check.', { catalogId: 'l27' }),
        lesson('a5', 'Fix the prompt', 'interactive', 6, 'Turn weak prompts into great ones.', {
          content: { interactive: AI_PROMPT },
        }),
        lesson('a6', 'Final quiz', 'quiz', 6, 'Five questions. Pass to earn your certificate.', {
          content: {
            quiz: [
              q(
                'How does machine learning mainly learn?',
                [
                  'From rules typed by a programmer',
                  'From patterns in example data',
                  'By reading minds',
                  'From the internet speed',
                ],
                1,
                'It finds patterns in training data.',
                'How AI works',
                'easy',
              ),
              tf(
                'If an AI sounds confident, its answer must be correct.',
                false,
                'AI can produce fluent but false answers (hallucinations).',
                'Hallucination',
              ),
              q(
                'What is AI bias?',
                ['A faster processor', 'Unfair patterns learned from data', 'A type of prompt', 'A virus'],
                1,
                'Models copy patterns, including unfair ones, from their data.',
                'Bias',
              ),
              q(
                'Which is the strongest prompt?',
                ['Maths', 'Help', 'Explain SOH CAH TOA for a JSS3 student with one worked example', 'Answer'],
                2,
                'It gives audience, task and format.',
                'Prompting',
              ),
              q(
                'The best way to use AI for homework is to…',
                [
                  'Copy its answer',
                  'Use it to understand, then write your own answer',
                  'Never use it',
                  'Ask it to pretend to be you',
                ],
                1,
                'Use AI as a tutor, not a ghost-writer.',
                'Ethics',
              ),
            ],
          },
        }),
      ],
    },
  ],
};

const PHYSICS: Course = {
  id: 'physics-core',
  title: 'Physics: Forces, Circuits & Waves',
  subtitle: 'Three core topics with everyday examples',
  subjectId: 'physics',
  level: 'Beginner',
  instructorId: 'emeka',
  emoji: '⚡',
  colors: ['#1663C7', '#7C5CFF'],
  rating: 4.7,
  ratingCount: 860,
  learners: 8700,
  description:
    'From why you jerk forward when a danfo brakes to how your phone charger works. A short, visual tour of the physics in the WAEC syllabus.',
  outcomes: [
    'State and apply Newton’s three laws',
    'Use V = IR in simple circuits',
    'Relate wave speed, frequency and wavelength',
  ],
  requirements: ['Basic algebra'],
  exams: ['WAEC', 'JAMB'],
  tags: ['Forces', 'Electricity', 'Waves'],
  updated: 'July 2026',
  modules: [
    {
      id: 'm1',
      title: 'Forces and electricity',
      summary: 'Newton’s laws and Ohm’s law.',
      lessons: [
        lesson('f1', 'Newton’s three laws', 'video', 5, 'Inertia, F = ma and action–reaction.', { catalogId: 'l7' }),
        lesson('f2', 'Ohm’s law and circuits', 'reading', 6, 'Voltage, current and resistance.', { catalogId: 'l8' }),
        lesson('f3', 'Waves', 'video', 5, 'Frequency, wavelength and speed.', { catalogId: 'l9' }),
        lesson('f4', 'Final quiz', 'quiz', 6, 'Five questions. Pass to earn your certificate.', {
          content: {
            quiz: [
              q(
                'F = ma. A 2 kg ball accelerates at 3 m/s². What is the force?',
                ['5 N', '6 N', '1.5 N', '0.67 N'],
                1,
                '2 × 3 = 6 N.',
                'Forces',
                'easy',
              ),
              q(
                'Passengers jerk forward when a bus brakes suddenly. Which law explains this?',
                ['First law (inertia)', 'Second law', 'Third law', 'Ohm’s law'],
                0,
                'Their bodies keep moving forward: inertia.',
                'Forces',
              ),
              q(
                'V = IR. A 12 V battery drives 2 A through a resistor. What is R?',
                ['24 Ω', '6 Ω', '10 Ω', '0.17 Ω'],
                1,
                'R = V ÷ I = 12 ÷ 2 = 6 Ω.',
                'Electricity',
              ),
              q(
                'Wave speed = …',
                ['frequency × wavelength', 'frequency ÷ wavelength', 'wavelength ÷ time²', 'amplitude × frequency'],
                0,
                'v = fλ.',
                'Waves',
                'easy',
              ),
              tf('Every action has an equal and opposite reaction.', true, 'Newton’s third law.', 'Forces'),
            ],
          },
        }),
      ],
    },
  ],
};

const MONEY: Course = {
  id: 'money-smart',
  title: 'Money Smart: Economics & Business',
  subtitle: 'Prices, inflation, pricing and bookkeeping for real life',
  subjectId: 'economics',
  level: 'Beginner',
  instructorId: 'amaka',
  emoji: '💰',
  colors: ['#9C6B1E', '#FFC857'],
  rating: 4.7,
  ratingCount: 640,
  learners: 6100,
  description:
    'Why does the price of tomatoes jump? How do you price your first product? Learn the economics and business basics that matter in the market and in your exams.',
  outcomes: [
    'Explain demand and supply',
    'Describe causes and effects of inflation',
    'Price a product for profit',
    'Record transactions with double entry',
  ],
  requirements: ['None'],
  exams: ['WAEC'],
  tags: ['Economics', 'Business', 'Money'],
  updated: 'September 2026',
  modules: [
    {
      id: 'm1',
      title: 'How markets work',
      summary: 'Prices and inflation.',
      lessons: [
        lesson('e1', 'Demand and supply', 'video', 5, 'Why prices rise and fall.', { catalogId: 'l18' }),
        lesson('e2', 'Inflation explained', 'reading', 5, 'Why prices keep rising and who it hurts.', {
          catalogId: 'l19',
        }),
      ],
    },
    {
      id: 'm2',
      title: 'Running a small business',
      summary: 'Pricing and bookkeeping.',
      lessons: [
        lesson('e3', 'Pricing your first product', 'video', 5, 'Cost, margin and what customers will pay.', {
          catalogId: 'l28',
        }),
        lesson('e4', 'Double entry bookkeeping', 'reading', 6, 'Every transaction, recorded twice.', {
          catalogId: 'l20',
        }),
        lesson('e5', 'Final quiz', 'quiz', 6, 'Five questions. Pass to earn your certificate.', {
          content: {
            quiz: [
              q(
                'If demand rises and supply stays the same, price usually…',
                ['Falls', 'Rises', 'Stays the same', 'Becomes zero'],
                1,
                'More buyers competing for the same goods pushes prices up.',
                'Demand and supply',
                'easy',
              ),
              q(
                'Inflation means…',
                ['Prices are falling', 'A general rise in prices over time', 'More jobs', 'Lower taxes'],
                1,
                'Money buys less as prices rise.',
                'Inflation',
                'easy',
              ),
              q(
                'A bag costs you ₦4,000 to make. You sell it for ₦5,000. What is your profit margin?',
                ['₦1,000 (20% of the price)', '₦9,000', '₦5,000', '₦4,000'],
                0,
                '₦1,000 profit ÷ ₦5,000 price = 20%.',
                'Pricing',
              ),
              tf(
                'In double entry, every transaction is recorded as a debit in one account and a credit in another.',
                true,
                'That is the double in double entry.',
                'Bookkeeping',
              ),
              q(
                'Who is hurt most by high inflation?',
                ['People on fixed incomes', 'Nobody', 'Only the government', 'Only exporters'],
                0,
                'Their income stays the same while prices rise.',
                'Inflation',
              ),
            ],
          },
        }),
      ],
    },
  ],
};

const ENGLISH: Course = {
  id: 'write-to-score',
  title: 'Write to Score: English Language',
  subtitle: 'Essays, summaries and lexis that examiners reward',
  subjectId: 'english',
  level: 'Intermediate',
  instructorId: 'chidi',
  emoji: '✍️',
  colors: ['#0F7C9C', '#7CEBDD'],
  rating: 4.8,
  ratingCount: 1510,
  learners: 15800,
  description:
    'Writing is where most English marks are won or lost. Learn to open an essay strongly, write summaries that score, and handle lexis and structure, then apply it to a set text.',
  outcomes: [
    'Write a strong essay introduction',
    'Write summaries in your own words',
    'Answer lexis and structure questions',
    'Discuss themes in Things Fall Apart',
  ],
  requirements: ['None'],
  exams: ['WAEC', 'NECO', 'JAMB'],
  tags: ['Essay writing', 'Summary', 'Literature'],
  updated: 'September 2026',
  modules: [
    {
      id: 'm1',
      title: 'Writing that scores',
      summary: 'Essays and summaries.',
      lessons: [
        lesson('w1', 'Writing a strong introduction', 'video', 5, 'Hook, context, thesis.', { catalogId: 'l14' }),
        lesson('w2', 'Summary writing that scores', 'reading', 6, 'One point per sentence, in your own words.', {
          catalogId: 'l15',
        }),
        lesson('w3', 'Lexis and structure practice', 'reading', 6, 'Synonyms, antonyms and sentence structure.', {
          catalogId: 'l16',
        }),
      ],
    },
    {
      id: 'm2',
      title: 'Literature',
      summary: 'Reading a set text closely.',
      lessons: [
        lesson('w4', 'Things Fall Apart: themes', 'video', 6, 'Tradition, change and masculinity.', {
          catalogId: 'l17',
        }),
        lesson('w5', 'Final quiz', 'quiz', 6, 'Five questions. Pass to earn your certificate.', {
          content: {
            quiz: [
              q(
                'What should an essay introduction end with?',
                ['A joke', 'Your thesis: the main point you will argue', 'A list of quotes', 'Your name'],
                1,
                'The thesis tells the examiner where the essay is going.',
                'Essays',
                'easy',
              ),
              q(
                'In summary writing, you should…',
                [
                  'Copy sentences from the passage',
                  'Write one point per sentence in your own words',
                  'Add your opinion',
                  'Write as much as possible',
                ],
                1,
                'Examiners reward clear points in your own words.',
                'Summary',
              ),
              tf(
                'Lifting whole sentences from the passage earns full marks in summary.',
                false,
                'Lifting is penalised. Rephrase.',
                'Summary',
              ),
              q(
                'Who is the protagonist of Things Fall Apart?',
                ['Obierika', 'Okonkwo', 'Nwoye', 'Ezinma'],
                1,
                'The novel follows Okonkwo’s rise and fall.',
                'Literature',
                'easy',
              ),
              q(
                'A major theme of Things Fall Apart is…',
                ['Space travel', 'Tradition versus change', 'Online banking', 'Football'],
                1,
                'The arrival of missionaries and colonial rule clashes with Igbo tradition.',
                'Literature',
              ),
            ],
          },
        }),
      ],
    },
  ],
};

export const COURSES: Course[] = [BIOLOGY, MATHS, PYTHON, AI_LITERACY, CHEMISTRY, ENGLISH, PHYSICS, MONEY];
