import i18n from '../../i18n';
import type en from '../../i18n/locales/en/world';

import type { Collectible, GameQuestion, Scramble, TrueFalse, World, WorldId } from './types';

/**
 * Starter game content for the seven worlds. Mirrors the JSON the content service will
 * return; the AI engine will add fresh questions matched to each student's level.
 */

type Q = [question: string, options: string[], correct: number, explanation: string, hint: string, hard?: boolean];
type T = [statement: string, answer: boolean, explanation: string];
type W = [word: string, clue: string];

const qs = (prefix: string, list: Q[]): GameQuestion[] =>
  list.map(([question, options, correctIndex, explanation, hint, hard], i) => ({
    id: `${prefix}-q${i + 1}`,
    question,
    options,
    correctIndex,
    explanation,
    hint,
    hard,
  }));
const tfs = (prefix: string, list: T[]): TrueFalse[] =>
  list.map(([statement, answer, explanation], i) => ({ id: `${prefix}-t${i + 1}`, statement, answer, explanation }));
const words = (prefix: string, list: W[]): Scramble[] =>
  list.map(([word, clue], i) => ({ id: `${prefix}-w${i + 1}`, word, clue }));
/** Collectible names and descriptions are getters, so they follow the current language. */
const loot = (prefix: WorldId, emojis: string[]): Collectible[] =>
  emojis.map((emoji, i) => {
    const key = `world:worlds.${prefix}.collectibles.c${i + 1}` as 'world:worlds.space.collectibles.c1';
    return {
      id: `${prefix}-c${i + 1}`,
      emoji,
      atStars: [3, 9, 18][i],
      get name() {
        return i18n.t(`${key}.name`);
      },
      get description() {
        return i18n.t(`${key}.description`);
      },
    };
  });

type SubjectId = keyof (typeof en)['subjects'];

/** The world as written below: everything visible is translated by `localize`. */
type WorldData = Omit<World, 'name' | 'tagline' | 'story' | 'subjects' | 'boss'> & {
  subjects: SubjectId[];
  boss: { emoji: string };
};

/** Name, tagline, story, subjects and boss text are getters, so they follow the current language. */
function localize(w: WorldData): World {
  const tr = (field: 'name' | 'tagline' | 'story' | 'bossName' | 'bossTaunt') =>
    i18n.t(`world:worlds.${w.id}.${field}`);
  const { subjects, boss, ...rest } = w;
  return {
    ...rest,
    get name() {
      return tr('name');
    },
    get tagline() {
      return tr('tagline');
    },
    get story() {
      return tr('story');
    },
    get subjects() {
      return subjects.map((s) => i18n.t(`world:subjects.${s}`));
    },
    boss: {
      emoji: boss.emoji,
      get name() {
        return tr('bossName');
      },
      get taunt() {
        return tr('bossTaunt');
      },
    },
  };
}

const SPACE: WorldData = {
  id: 'space',
  emoji: '🪐',
  icon: 'planet',
  subjects: ['physics', 'geography', 'science'],
  unlockStars: 0,
  boss: { emoji: '🕳️' },
  rival: { name: 'Cosmo', emoji: '👩🏾‍🚀' },
  questions: qs('space', [
    [
      'Which planet is closest to the Sun?',
      ['Venus', 'Mercury', 'Earth', 'Mars'],
      1,
      'Mercury orbits closest to the Sun, at about 58 million km.',
      'It’s also the smallest planet.',
    ],
    [
      'What keeps the planets in orbit around the Sun?',
      ['Magnetism', 'Wind', 'Gravity', 'Light'],
      2,
      'The Sun’s gravity pulls on each planet, bending its path into an orbit.',
      'It’s the same force that makes a mango fall.',
    ],
    [
      'Which planet is known as the Red Planet?',
      ['Jupiter', 'Mars', 'Saturn', 'Neptune'],
      1,
      'Iron oxide (rust) in its soil makes Mars look red.',
      'Rust has this colour.',
    ],
    [
      'How long does Earth take to orbit the Sun?',
      ['24 hours', '30 days', 'About 365 days', '10 years'],
      2,
      'One orbit takes about 365¼ days, which is why we have leap years.',
      'Think about the length of a year.',
    ],
    [
      'What causes day and night?',
      ['Earth orbiting the Sun', 'Earth spinning on its axis', 'The Moon blocking light', 'Clouds'],
      1,
      'Earth rotates once every 24 hours, so each side faces the Sun, then away.',
      'It happens every 24 hours.',
    ],
    [
      'What is the largest planet in our solar system?',
      ['Saturn', 'Earth', 'Jupiter', 'Uranus'],
      2,
      'Jupiter is so big that more than 1,300 Earths could fit inside it.',
      'It has a giant red storm.',
    ],
    [
      'What is the Sun?',
      ['A planet', 'A star', 'A moon', 'A comet'],
      1,
      'The Sun is a star: a huge ball of hot gas producing energy by nuclear fusion.',
      'It’s the same kind of object as the dots you see at night.',
    ],
    [
      'Which planet has the most famous rings?',
      ['Mars', 'Saturn', 'Venus', 'Mercury'],
      1,
      'Saturn’s rings are made of ice and rock. Jupiter, Uranus and Neptune have faint rings too.',
      'Its name sounds like Saturday.',
    ],
    [
      'Why does the Moon seem to change shape?',
      [
        'It grows and shrinks',
        'Clouds cover it',
        'We see different amounts of its sunlit side',
        'Earth’s shadow always covers it',
      ],
      2,
      'Moon phases come from how much of the Moon’s sunlit half faces Earth.',
      'The Moon doesn’t make its own light.',
    ],
    [
      'What is a light-year?',
      ['A unit of time', 'The distance light travels in a year', 'A very bright year', 'The age of a star'],
      1,
      'Despite the name, a light-year measures distance: about 9.5 trillion km.',
      'It sounds like time but measures something else.',
      true,
    ],
    [
      'A solar eclipse happens when…',
      [
        'Earth passes between the Sun and Moon',
        'The Moon passes between the Sun and Earth',
        'The Sun goes out',
        'Mars blocks the Sun',
      ],
      1,
      'The Moon blocks the Sun’s light from part of Earth.',
      'Something passes in front of the Sun.',
      true,
    ],
    [
      'Your weight on the Moon would be…',
      ['The same', 'About 6 times more', 'About 1/6 of Earth weight', 'Zero'],
      2,
      'The Moon’s gravity is about one-sixth of Earth’s, so you’d weigh less (your mass stays the same).',
      'The Moon is much smaller than Earth.',
      true,
    ],
    [
      'Which galaxy do we live in?',
      ['Andromeda', 'The Milky Way', 'Whirlpool', 'Sombrero'],
      1,
      'Our solar system sits in a spiral arm of the Milky Way.',
      'It’s named after something you can drink.',
    ],
    [
      'What tilts to give Earth its seasons?',
      ['The Sun', 'Earth’s axis', 'The Moon’s orbit', 'The equator'],
      1,
      'Earth’s axis is tilted about 23.5°, so each hemisphere gets more direct sunlight at different times of year.',
      'Earth spins around an imaginary line.',
      true,
    ],
  ]),
  truths: tfs('space', [
    ['The Sun is a star.', true, 'It’s the closest star to Earth.'],
    ['The Moon makes its own light.', false, 'It reflects sunlight.'],
    ['There are eight planets in our solar system.', true, 'Pluto was reclassified as a dwarf planet in 2006.'],
    ['Mars is bigger than Earth.', false, 'Mars is about half Earth’s width.'],
    ['Gravity pulls objects towards each other.', true, 'Every object with mass attracts every other.'],
    ['Venus is the hottest planet.', true, 'Its thick CO₂ atmosphere traps heat, making it hotter than Mercury.'],
    [
      'Stars are tiny compared with Earth.',
      false,
      'Most stars are far bigger than Earth; they only look small because they’re far away.',
    ],
    [
      'Astronauts float in orbit because there is no gravity there.',
      false,
      'Gravity is still strong in orbit; they float because they’re falling around Earth.',
    ],
    ['Jupiter is a gas giant.', true, 'It’s mostly hydrogen and helium.'],
    ['Earth takes 24 hours to spin once.', true, 'That’s one day.'],
  ]),
  words: words('space', [
    ['ORBIT', 'The curved path of a planet around the Sun'],
    ['COMET', 'An icy body with a glowing tail'],
    ['GALAXY', 'A huge system of stars, like the Milky Way'],
    ['GRAVITY', 'The force that keeps you on the ground'],
    ['ECLIPSE', 'When one body blocks another’s light'],
    ['METEOR', 'A “shooting star” burning up in the sky'],
  ]),
  collectibles: loot('space', ['🌑', '🗺️', '🔭']),
};

const MATH: WorldData = {
  id: 'math',
  emoji: '⛰️',
  icon: 'calculator',
  subjects: ['mathematics'],
  unlockStars: 0,
  boss: { emoji: '🦁' },
  rival: { name: 'Tunde', emoji: '🧑🏾‍🎓' },
  questions: qs('math', [
    ['What is 7 × 8?', ['54', '56', '64', '48'], 1, '7 × 8 = 56. Trick: 5, 6, 7, 8 → 56 = 7 × 8.', 'Count 5-6-7-8.'],
    [
      'What is 25% of 80?',
      ['20', '25', '40', '8'],
      0,
      '25% is a quarter, and 80 ÷ 4 = 20.',
      '25% is the same as one quarter.',
    ],
    [
      'Solve: x + 9 = 15',
      ['x = 24', 'x = 6', 'x = 9', 'x = 15'],
      1,
      'Subtract 9 from both sides: x = 6.',
      'Do the opposite of adding 9.',
    ],
    [
      'How many degrees are in a triangle?',
      ['90°', '180°', '270°', '360°'],
      1,
      'The interior angles of any triangle add up to 180°.',
      'Half of a full turn.',
    ],
    [
      'What is the next prime after 7?',
      ['9', '10', '11', '13'],
      2,
      '11 has only two factors, 1 and itself. 9 = 3 × 3.',
      'Check which numbers have only two factors.',
    ],
    [
      'Simplify 12/18.',
      ['2/3', '3/4', '6/9', '1/2'],
      0,
      'Divide top and bottom by 6: 12/18 = 2/3.',
      'Find the biggest number that divides both.',
    ],
    [
      'Area of a rectangle 6 cm by 4 cm?',
      ['10 cm²', '20 cm²', '24 cm²', '48 cm²'],
      2,
      'Area = length × width = 6 × 4 = 24 cm².',
      'Multiply the sides.',
    ],
    [
      'What is 3²+ 4²?',
      ['14', '25', '49', '12'],
      1,
      '9 + 16 = 25 (and √25 = 5, the famous 3-4-5 triangle).',
      'Square each number first.',
    ],
    [
      'Solve: 3x = 21',
      ['x = 7', 'x = 18', 'x = 24', 'x = 63'],
      0,
      'Divide both sides by 3: x = 7.',
      'Undo multiplying by 3.',
    ],
    [
      'A shirt costs ₦5,000 with 20% off. What do you pay?',
      ['₦1,000', '₦4,000', '₦4,800', '₦3,000'],
      1,
      '20% of ₦5,000 is ₦1,000, so you pay ₦4,000.',
      'Find 20%, then subtract it.',
    ],
    [
      'What is the mean of 4, 6 and 11?',
      ['6', '7', '21', '11'],
      1,
      '(4 + 6 + 11) ÷ 3 = 21 ÷ 3 = 7.',
      'Add them, then divide by how many there are.',
    ],
    [
      'Expand 2(x + 5).',
      ['2x + 5', '2x + 10', 'x + 10', '2x + 7'],
      1,
      'Multiply both terms by 2: 2x + 10.',
      'The 2 multiplies everything inside.',
      true,
    ],
    [
      'Solve x² = 49 (x > 0).',
      ['x = 7', 'x = 24.5', 'x = 49', 'x = 14'],
      0,
      '7 × 7 = 49.',
      'Which number times itself gives 49?',
      true,
    ],
    [
      'Circumference of a circle with radius 7 (use π = 22/7)?',
      ['22', '44', '154', '49'],
      1,
      'C = 2πr = 2 × 22/7 × 7 = 44.',
      'C = 2πr.',
      true,
    ],
  ]),
  truths: tfs('math', [
    ['Every even number is divisible by 2.', true, 'That’s the definition of even.'],
    ['0.5 is the same as 1/2.', true, 'One half = 0.5 = 50%.'],
    ['A square has five sides.', false, 'A square has four equal sides.'],
    ['1 is a prime number.', false, 'Primes have exactly two factors; 1 has only one.'],
    ['The angles in a quadrilateral add up to 360°.', true, 'It splits into two triangles: 2 × 180°.'],
    ['−3 is greater than −1.', false, '−1 is closer to zero, so it’s greater.'],
    ['10% of 300 is 30.', true, '300 ÷ 10 = 30.'],
    ['A right angle is 90°.', true, 'A quarter turn.'],
    ['7 × 0 = 7.', false, 'Anything times zero is zero.'],
    ['The square root of 81 is 9.', true, '9 × 9 = 81.'],
  ]),
  words: words('math', [
    ['PRIME', 'A number with exactly two factors'],
    ['ANGLE', 'Measured in degrees'],
    ['RADIUS', 'Centre of a circle to its edge'],
    ['FRACTION', 'Like 3/4'],
    ['EQUATION', 'A statement with an equals sign'],
    ['AVERAGE', 'Another word for the mean'],
  ]),
  collectibles: loot('math', ['🐚', '🧭', '🚩']),
};

const NATURE: WorldData = {
  id: 'nature',
  emoji: '🌿',
  icon: 'leaf',
  subjects: ['biology', 'agriculture'],
  unlockStars: 6,
  boss: { emoji: '🥀' },
  rival: { name: 'Amina', emoji: '👩🏾‍🌾' },
  questions: qs('nature', [
    [
      'What do plants need to make food by photosynthesis?',
      ['Sunlight, water and CO₂', 'Soil and oxygen only', 'Darkness and sugar', 'Salt and wind'],
      0,
      'Chlorophyll captures light to turn CO₂ and water into glucose and oxygen.',
      'Plants breathe in what we breathe out.',
    ],
    [
      'Which of these is a mammal?',
      ['Crocodile', 'Bat', 'Ostrich', 'Shark'],
      1,
      'Bats feed their young on milk and have fur, so they are mammals.',
      'Mammals have fur and feed milk to their babies.',
    ],
    [
      'In a food chain, grass is a…',
      ['Consumer', 'Producer', 'Decomposer', 'Predator'],
      1,
      'Producers make their own food by photosynthesis.',
      'It makes its own food.',
    ],
    [
      'What do decomposers do?',
      ['Hunt animals', 'Break down dead matter', 'Make food from sunlight', 'Pollinate flowers'],
      1,
      'Fungi and bacteria break down dead matter and recycle nutrients.',
      'Think about mushrooms on a fallen log.',
    ],
    [
      'Which animal is a herbivore?',
      ['Lion', 'Elephant', 'Hyena', 'Eagle'],
      1,
      'Elephants eat only plants.',
      'Which one never eats meat?',
    ],
    [
      'Bees help flowers by…',
      ['Eating their leaves', 'Pollinating them', 'Watering them', 'Giving them shade'],
      1,
      'Bees carry pollen from flower to flower, helping plants make seeds.',
      'They carry a yellow powder.',
    ],
    [
      'Frogs start life as…',
      ['Caterpillars', 'Tadpoles', 'Chicks', 'Larvae in soil'],
      1,
      'Frogs go through metamorphosis: egg → tadpole → froglet → frog.',
      'They swim with a tail first.',
    ],
    [
      'Which gas do plants release in daylight?',
      ['Carbon dioxide', 'Nitrogen', 'Oxygen', 'Methane'],
      2,
      'Photosynthesis releases oxygen.',
      'It’s the gas you need to breathe.',
    ],
    [
      'A habitat is…',
      ['An animal’s diet', 'The place where an organism lives', 'A type of plant', 'A group of predators'],
      1,
      'A habitat provides food, water and shelter.',
      'Think “home”.',
    ],
    [
      'What is an omnivore?',
      ['Eats only plants', 'Eats only meat', 'Eats plants and animals', 'Eats nothing'],
      2,
      'Humans, pigs and bears are omnivores.',
      'Omni means “all”.',
    ],
    [
      'Which is NOT an insect?',
      ['Ant', 'Spider', 'Butterfly', 'Grasshopper'],
      1,
      'Spiders have eight legs; insects have six.',
      'Count the legs.',
      true,
    ],
    [
      'Deforestation can cause…',
      ['More rainfall everywhere', 'Soil erosion and habitat loss', 'Cooler cities', 'More oxygen'],
      1,
      'Without roots, soil washes away and animals lose their homes.',
      'Tree roots hold something in place.',
      true,
    ],
    [
      'About how much energy passes to the next level of a food chain?',
      ['10%', '50%', '90%', '100%'],
      0,
      'Most energy is lost as heat and movement; only about 10% passes on.',
      'It’s a small fraction.',
      true,
    ],
    [
      'Which part of a plant absorbs water from the soil?',
      ['Leaves', 'Flowers', 'Roots', 'Stem'],
      2,
      'Root hair cells absorb water by osmosis.',
      'It’s underground.',
    ],
  ]),
  truths: tfs('nature', [
    ['Whales are fish.', false, 'Whales are mammals: they breathe air and feed their young milk.'],
    ['Plants make oxygen.', true, 'It’s a product of photosynthesis.'],
    ['All snakes are venomous.', false, 'Most snakes are harmless to humans.'],
    ['Mushrooms are fungi, not plants.', true, 'Fungi can’t photosynthesise.'],
    ['Insects have six legs.', true, 'Three pairs.'],
    ['Lions are herbivores.', false, 'Lions are carnivores.'],
    ['Coral reefs are made by tiny animals.', true, 'Coral polyps build reefs.'],
    ['Bats are blind.', false, 'Bats can see; many also use echolocation.'],
    ['Decomposers return nutrients to the soil.', true, 'They recycle dead matter.'],
    ['Cactus leaves are spines.', true, 'Spines reduce water loss in hot places.'],
  ]),
  words: words('nature', [
    ['HABITAT', 'Where an organism lives'],
    ['POLLEN', 'Yellow powder bees carry'],
    ['PREDATOR', 'An animal that hunts others'],
    ['FOREST', 'Land covered with trees'],
    ['SPECIES', 'A group of organisms that can breed together'],
    ['CLIMATE', 'Long-term weather of a place'],
  ]),
  collectibles: loot('nature', ['🎖️', '🗝️', '🌳']),
};

const LANGUAGE: WorldData = {
  id: 'language',
  emoji: '🏝️',
  icon: 'chatbubbles',
  subjects: ['english', 'literature'],
  unlockStars: 12,
  boss: { emoji: '🐙' },
  rival: { name: 'Chidi', emoji: '🧑🏾‍💼' },
  questions: qs('language', [
    [
      'Which word is a noun?',
      ['Quickly', 'Happiness', 'Run', 'Beautiful'],
      1,
      'A noun names a person, place, thing or idea. Happiness is an idea.',
      'It names a thing or feeling.',
    ],
    [
      'Choose the correct sentence.',
      ['She don’t like rice.', 'She doesn’t like rice.', 'She not like rice.', 'She didn’t likes rice.'],
      1,
      'With he/she/it, use “doesn’t” + base verb.',
      'Think he/she/it + does.',
    ],
    [
      'What is the opposite of “ancient”?',
      ['Old', 'Modern', 'Broken', 'Large'],
      1,
      'Ancient means very old; modern means new.',
      'Think new.',
    ],
    [
      'Which word is a synonym of “happy”?',
      ['Sad', 'Joyful', 'Angry', 'Tired'],
      1,
      'Synonyms have similar meanings.',
      'A word that means almost the same.',
    ],
    [
      'Plural of “child”?',
      ['Childs', 'Children', 'Childes', 'Childrens'],
      1,
      'Child is an irregular noun: children.',
      'It’s irregular.',
    ],
    [
      'Identify the verb: “The girl sings beautifully.”',
      ['girl', 'sings', 'beautifully', 'the'],
      1,
      'Sings is the action.',
      'Which word is the action?',
    ],
    [
      'Which is an adverb?',
      ['Slowly', 'Slow', 'Slowness', 'Slower'],
      0,
      'Adverbs often end in -ly and describe how something is done.',
      'It often ends in -ly.',
    ],
    [
      'Pick the correct spelling.',
      ['Recieve', 'Receive', 'Receeve', 'Riceive'],
      1,
      '“I before E, except after C”: receive.',
      'I before E except after…',
    ],
    [
      '“As brave as a lion” is a…',
      ['Metaphor', 'Simile', 'Hyperbole', 'Pun'],
      1,
      'Similes compare using “like” or “as”.',
      'It uses the word “as”.',
    ],
    ['What punctuation ends a question?', ['.', '!', '?', ','], 2, 'A question mark.', 'It looks like a hook.'],
    [
      '“Their”, “there” or “they’re”: ___ going to school.',
      ['Their', 'There', 'They’re'],
      2,
      'They’re = they are.',
      'Can you replace it with “they are”?',
    ],
    [
      'Which sentence is in the passive voice?',
      ['Ada wrote the letter.', 'The letter was written by Ada.', 'Ada writes letters.', 'Ada is writing.'],
      1,
      'Passive voice: the object becomes the subject, with “was … by”.',
      'Look for “was … by”.',
      true,
    ],
    [
      '“The wind whispered through the trees” is…',
      ['Personification', 'Alliteration', 'Simile', 'Onomatopoeia'],
      0,
      'Giving human actions (whispering) to non-human things.',
      'The wind is doing something only people do.',
      true,
    ],
    [
      'Choose the word that means “to make something less severe”.',
      ['Aggravate', 'Mitigate', 'Exaggerate', 'Navigate'],
      1,
      'Mitigate means to reduce harm or severity.',
      'It’s the opposite of making worse.',
      true,
    ],
  ]),
  truths: tfs('language', [
    ['“Quickly” is an adverb.', true, 'It describes how an action is done.'],
    ['A sentence must always end with an exclamation mark.', false, 'Most end with a full stop.'],
    ['“Mice” is the plural of “mouse”.', true, 'An irregular plural.'],
    ['“Its” and “it’s” mean the same thing.', false, 'It’s = it is; its = belonging to it.'],
    ['A simile uses “like” or “as”.', true, 'E.g. “as cold as ice”.'],
    ['Proper nouns start with a capital letter.', true, 'E.g. Lagos, Amara.'],
    ['“Big” and “large” are antonyms.', false, 'They’re synonyms.'],
    ['A paragraph usually focuses on one main idea.', true, 'That keeps writing clear.'],
    ['“Ran” is the past tense of “run”.', true, 'Run → ran → run.'],
    ['“Beautiful” is a verb.', false, 'It’s an adjective.'],
  ]),
  words: words('language', [
    ['SIMILE', 'A comparison using like or as'],
    ['VERB', 'An action word'],
    ['NOUN', 'A naming word'],
    ['SYNONYM', 'A word with the same meaning'],
    ['ADJECTIVE', 'A describing word'],
    ['PARAGRAPH', 'A group of sentences about one idea'],
  ]),
  collectibles: loot('language', ['🍾', '🪶', '📖']),
};

const HISTORY: WorldData = {
  id: 'history',
  emoji: '🏛️',
  icon: 'hourglass',
  subjects: ['history', 'government', 'civicEducation'],
  unlockStars: 20,
  boss: { emoji: '🕰️' },
  rival: { name: 'Bayo', emoji: '🧔🏾' },
  questions: qs('history', [
    [
      'In what year did Nigeria gain independence?',
      ['1957', '1960', '1963', '1970'],
      1,
      'Nigeria became independent from Britain on 1 October 1960.',
      'It’s celebrated every 1 October.',
    ],
    [
      'In what year did Nigeria become a republic?',
      ['1960', '1963', '1966', '1979'],
      1,
      'Nigeria became a federal republic on 1 October 1963.',
      'Three years after independence.',
    ],
    [
      'What is the capital of Nigeria?',
      ['Lagos', 'Kano', 'Abuja', 'Ibadan'],
      2,
      'Abuja officially replaced Lagos as capital in 1991.',
      'It became capital in 1991.',
    ],
    [
      'The ancient Nok culture is famous for its…',
      ['Pyramids', 'Terracotta sculptures', 'Gold coins', 'Paper books'],
      1,
      'Nok terracotta heads date back over 2,000 years.',
      'Made from baked clay.',
    ],
    [
      'The Benin Kingdom is famous for its…',
      ['Bronze plaques', 'Ice sculptures', 'Rock music', 'Steam trains'],
      0,
      'The Benin Bronzes are world-famous artworks.',
      'A metal artwork.',
    ],
    [
      'Who was Nigeria’s first Prime Minister?',
      ['Nnamdi Azikiwe', 'Tafawa Balewa', 'Obafemi Awolowo', 'Ahmadu Bello'],
      1,
      'Sir Abubakar Tafawa Balewa led the government at independence.',
      'His first name is Abubakar.',
    ],
    [
      'Who was Nigeria’s first President?',
      ['Nnamdi Azikiwe', 'Yakubu Gowon', 'Olusegun Obasanjo', 'Shehu Shagari'],
      0,
      'Dr Nnamdi Azikiwe became President in 1963.',
      'Popularly called “Zik”.',
    ],
    [
      'The Great Pyramids are in which country?',
      ['Mali', 'Egypt', 'Ghana', 'Ethiopia'],
      1,
      'The pyramids of Giza are in Egypt.',
      'Think of the Nile.',
    ],
    [
      'How many states does Nigeria have?',
      ['30', '36', '19', '12'],
      1,
      'Nigeria has 36 states plus the FCT.',
      'Plus the FCT.',
    ],
    [
      'Mansa Musa ruled which empire?',
      ['Mali', 'Songhai', 'Oyo', 'Kanem-Bornu'],
      0,
      'Mansa Musa of Mali is often called the richest person in history.',
      'Same name as a modern country.',
    ],
    [
      'What are the three arms of government?',
      [
        'Army, police, courts',
        'Legislature, executive, judiciary',
        'Federal, state, local',
        'President, senate, governors',
      ],
      1,
      'They make, carry out and interpret laws.',
      'Make laws, run them, judge them.',
      true,
    ],
    [
      'Which came first?',
      [
        'Nigerian independence',
        'The amalgamation of Nigeria',
        'Abuja becoming capital',
        'The 1999 return to democracy',
      ],
      1,
      'Northern and Southern Nigeria were amalgamated in 1914.',
      'It happened in 1914.',
      true,
    ],
    [
      'The trans-Saharan trade mainly exchanged…',
      ['Oil and cars', 'Gold, salt and textiles', 'Computers', 'Ice'],
      1,
      'Caravans carried gold, salt, cloth and more across the Sahara.',
      'Desert caravans with camels.',
      true,
    ],
    [
      'Nigeria returned to civilian rule in…',
      ['1979', '1985', '1999', '2007'],
      2,
      'Democracy was restored on 29 May 1999, now Democracy Day is 12 June.',
      'Just before the year 2000.',
    ],
  ]),
  truths: tfs('history', [
    ['Nigeria gained independence in 1960.', true, '1 October 1960.'],
    ['Lagos is the current capital of Nigeria.', false, 'Abuja has been the capital since 1991.'],
    ['The Benin Bronzes were made in the Benin Kingdom.', true, 'In today’s Edo State.'],
    ['Nigeria has 36 states.', true, 'Plus the Federal Capital Territory.'],
    ['The pyramids were built in Nigeria.', false, 'They’re in Egypt.'],
    ['Nok terracottas are over 2,000 years old.', true, 'Some date to around 500 BC.'],
    ['The judiciary makes the laws.', false, 'The legislature makes laws; the judiciary interprets them.'],
    ['Mansa Musa travelled to Mecca with lots of gold.', true, 'His 1324 pilgrimage was legendary.'],
    ['Nigeria was amalgamated in 1914.', true, 'By Lord Lugard.'],
    ['Democracy Day in Nigeria is 12 June.', true, 'Since 2019.'],
  ]),
  words: words('history', [
    ['EMPIRE', 'A large group of lands under one ruler'],
    ['BRONZE', 'Metal used for the famous Benin artworks'],
    ['REPUBLIC', 'A state with an elected head, not a monarch'],
    ['TIMELINE', 'Events placed in order'],
    ['KINGDOM', 'Land ruled by a king or queen'],
    ['ARTEFACT', 'An object made by people long ago'],
  ]),
  collectibles: loot('history', ['🗿', '🛡️', '⏳']),
};

const CODE: WorldData = {
  id: 'code',
  emoji: '🤖',
  icon: 'code-slash',
  subjects: ['computerScience', 'aiLiteracy'],
  unlockStars: 28,
  boss: { emoji: '🌀' },
  rival: { name: 'Byte', emoji: '🤖' },
  questions: qs('code', [
    [
      'What is an algorithm?',
      ['A type of computer', 'Step-by-step instructions to solve a problem', 'A programming error', 'A website'],
      1,
      'Recipes and directions are everyday algorithms.',
      'Think of a recipe.',
    ],
    [
      'What does a loop do?',
      ['Stops the program', 'Repeats instructions', 'Deletes data', 'Draws a circle'],
      1,
      'Loops repeat code while a condition is true or for a set number of times.',
      'It goes round and round.',
    ],
    [
      'A bug is…',
      ['An insect in the computer', 'A mistake in code', 'A fast program', 'A virus'],
      1,
      'Finding and fixing bugs is called debugging.',
      'Fixing it is called “debugging”.',
    ],
    [
      'What does print("Hi") show in Python?',
      ['print', '"Hi"', 'Hi', 'Nothing'],
      2,
      'print displays the text without the quotes.',
      'The quotes mark text but aren’t shown.',
    ],
    [
      'Which is a condition?',
      ['x = 5', 'if score > 50', 'print(x)', 'name'],
      1,
      'Conditions check if something is true.',
      'It starts with “if”.',
    ],
    [
      'Binary uses which digits?',
      ['0 and 1', '1 to 9', '0 to 9', 'A to Z'],
      0,
      'Computers store everything as 0s and 1s.',
      'On and off.',
    ],
    [
      'What is a variable?',
      ['A named place to store data', 'A broken computer', 'A type of screen', 'A loop'],
      0,
      'Like a labelled box that holds a value.',
      'A labelled box.',
    ],
    [
      'x = 3, then x = x + 2. What is x?',
      ['3', '2', '5', '32'],
      2,
      'The right side is worked out first: 3 + 2 = 5.',
      'Work out the right side first.',
    ],
    [
      'Which is an input device?',
      ['Monitor', 'Speaker', 'Keyboard', 'Printer'],
      2,
      'You put information in with a keyboard.',
      'You type on it.',
    ],
    [
      'What does AI stand for?',
      ['Automatic Internet', 'Artificial Intelligence', 'Advanced Input', 'Animated Image'],
      1,
      'Computer systems that learn patterns to make predictions.',
      'Intelligence that’s made, not born.',
    ],
    [
      'What does == mean in most languages?',
      ['Assign a value', 'Is equal to', 'Not equal', 'Add'],
      1,
      'One = assigns; two == compares.',
      'It compares two things.',
      true,
    ],
    ['In binary, what is 101?', ['3', '5', '101', '7'], 1, '1×4 + 0×2 + 1×1 = 5.', 'Place values are 4, 2, 1.', true],
    [
      'for i in range(3): runs how many times?',
      ['2', '3', '4', 'Forever'],
      1,
      'range(3) gives 0, 1, 2.',
      'Starts counting at 0.',
      true,
    ],
    [
      'Which keeps passwords safest?',
      ['Your birthday', '“password123”', 'A long phrase with numbers and symbols', 'Your name'],
      2,
      'Long, unpredictable passwords are hardest to guess.',
      'Longer and less guessable is better.',
    ],
  ]),
  truths: tfs('code', [
    ['Computers store data as 0s and 1s.', true, 'That’s binary.'],
    ['A loop can repeat instructions.', true, 'That’s what loops are for.'],
    ['Python was named after a snake.', false, 'It was named after Monty Python, a comedy group.'],
    ['An algorithm is a step-by-step plan.', true, 'Like a recipe.'],
    ['A mouse is an output device.', false, 'It’s an input device.'],
    ['= and == mean the same in Python.', false, '= assigns, == compares.'],
    ['Debugging means fixing errors in code.', true, 'Named after removing bugs.'],
    ['AI always gives correct answers.', false, 'AI can make confident mistakes. Always check.'],
    ['A variable stores a value.', true, 'Like a labelled box.'],
    ['RAM stands for Random Access Memory.', true, 'Short-term working memory.'],
  ]),
  words: words('code', [
    ['LOOP', 'Repeats instructions'],
    ['DEBUG', 'Find and fix errors'],
    ['PYTHON', 'A popular coding language'],
    ['BINARY', 'Counting with 0s and 1s'],
    ['VARIABLE', 'A named box for data'],
    ['ROBOT', 'A programmable machine'],
  ]),
  collectibles: loot('code', ['🦆', '🔌', '💾']),
};

const ART: WorldData = {
  id: 'art',
  emoji: '🎨',
  icon: 'color-palette',
  subjects: ['fineArt', 'design'],
  unlockStars: 36,
  boss: { emoji: '👾' },
  rival: { name: 'Zara', emoji: '👩🏾‍🎨' },
  questions: qs('art', [
    [
      'Which are the three primary colours (painting)?',
      ['Red, yellow, blue', 'Green, orange, purple', 'Black, white, grey', 'Red, green, blue'],
      0,
      'You can mix most other colours from red, yellow and blue.',
      'You can’t mix them from other paints.',
    ],
    [
      'Blue + yellow makes…',
      ['Purple', 'Green', 'Orange', 'Brown'],
      1,
      'Mixing blue and yellow gives green.',
      'The colour of leaves.',
    ],
    [
      'Red + yellow makes…',
      ['Orange', 'Pink', 'Green', 'Purple'],
      0,
      'Red and yellow mix to orange.',
      'The colour of a sunset.',
    ],
    [
      'Which is a warm colour?',
      ['Blue', 'Green', 'Orange', 'Purple'],
      2,
      'Reds, oranges and yellows feel warm, like fire.',
      'Think of fire.',
    ],
    [
      'A sculpture is…',
      ['A flat painting', 'A 3D artwork', 'A song', 'A photograph'],
      1,
      'Sculptures can be carved, modelled or cast.',
      'You can walk around it.',
    ],
    [
      'Adire is a traditional Yoruba…',
      ['Dance', 'Indigo-dyed cloth', 'Drum', 'Food'],
      1,
      'Adire uses resist-dyeing with indigo to create patterns.',
      'It’s usually blue.',
    ],
    [
      'Who painted the Mona Lisa?',
      ['Picasso', 'Leonardo da Vinci', 'Van Gogh', 'Ben Enwonwu'],
      1,
      'Leonardo da Vinci painted it in the early 1500s.',
      'An Italian Renaissance genius.',
    ],
    [
      'Ben Enwonwu was a famous…',
      ['Footballer', 'Nigerian artist', 'Scientist', 'Pilot'],
      1,
      'His painting “Tutu” is one of Africa’s most famous artworks.',
      'He painted “Tutu”.',
    ],
    [
      'Complementary colours are…',
      ['Next to each other on the colour wheel', 'Opposite each other on the colour wheel', 'Both dark', 'Both light'],
      1,
      'E.g. blue & orange. They make each other stand out.',
      'Opposites attract.',
    ],
    [
      'Lines that go into the distance and meet create…',
      ['Texture', 'Perspective', 'Pattern', 'Contrast'],
      1,
      'Perspective makes flat pictures look 3D.',
      'It creates depth.',
    ],
    [
      'A tint is a colour mixed with…',
      ['Black', 'White', 'Grey', 'Water'],
      1,
      'Tint = + white; shade = + black.',
      'It makes the colour lighter.',
      true,
    ],
    [
      'Which artwork style uses tiny dots of colour?',
      ['Cubism', 'Pointillism', 'Surrealism', 'Realism'],
      1,
      'Pointillism builds images from dots (Georges Seurat).',
      'The name has “point” in it.',
      true,
    ],
    [
      'Negative space in design is…',
      ['A bad drawing', 'The empty space around a subject', 'Dark colours', 'A mistake'],
      1,
      'Good designers use empty space on purpose.',
      'The space that isn’t the subject.',
      true,
    ],
    [
      'Nsibidi is an ancient system of…',
      ['Symbols used in south-eastern Nigeria', 'Music notes', 'Clay pots', 'Hair styles'],
      0,
      'Nsibidi symbols were used by the Ejagham, Efik and Igbo peoples.',
      'A way of writing ideas with signs.',
    ],
  ]),
  truths: tfs('art', [
    ['Red, yellow and blue are primary colours in painting.', true, 'They can’t be mixed from other paints.'],
    ['Mixing all paints together makes white.', false, 'It makes a muddy brown or black.'],
    ['A sculpture is three-dimensional.', true, 'It has height, width and depth.'],
    ['Blue is a warm colour.', false, 'Blue is cool.'],
    ['Adire cloth is often dyed with indigo.', true, 'A Yoruba textile tradition.'],
    ['Leonardo da Vinci painted the Mona Lisa.', true, 'Around 1503–1519.'],
    ['A shade is a colour mixed with white.', false, 'Shade = + black; tint = + white.'],
    ['Graphic design is a type of art.', true, 'Design communicates with images and type.'],
    ['Purple is made from red and blue.', true, 'Secondary colour.'],
    ['All art has to look realistic.', false, 'Abstract art doesn’t try to look real.'],
  ]),
  words: words('art', [
    ['CANVAS', 'Cloth artists paint on'],
    ['PALETTE', 'Board for mixing paint'],
    ['MURAL', 'A painting on a wall'],
    ['SKETCH', 'A quick rough drawing'],
    ['TEXTURE', 'How a surface feels or looks'],
    ['PORTRAIT', 'A picture of a person'],
  ]),
  collectibles: loot('art', ['🫙', '🖌️', '🖼️']),
};

export const WORLDS: World[] = [SPACE, MATH, NATURE, LANGUAGE, HISTORY, CODE, ART].map(localize);
export const getWorld = (id: string) => WORLDS.find((w) => w.id === id);
