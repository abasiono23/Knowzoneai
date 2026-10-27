/**
 * UI concept art for Knowzone World mini-games, made with OpenAI, to agree on a look before building.
 * Run from apps/server:
 *
 *   npx tsx scripts/ui-concepts.ts <output folder> [game id] [--set english|chemistry|chemistry-lab|space|history|quests|tech|business] [--n 2] [--quality medium|high]
 *
 * Cost with gpt-image-1-mini: about $0.02–0.03 per portrait picture at medium quality.
 * These are mock-ups: the real screens are built in the app (real text, real fonts, translations).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { config } from '../src/config.js';
import { openaiClient } from '../src/services/ai.js';

/** Knowzone's look, so every concept matches the app. */
const STYLE = [
  'A single polished mobile game screen, portrait phone screenshot (no phone frame, no hands), for a learning game app for Nigerian secondary-school students.',
  'Art style: premium casual mobile game UI like the top learning games on the App Store: glossy rounded 3D tiles, soft glows, subtle particles, juicy and beautiful but clean and readable.',
  'Colour palette: deep navy to violet gradient background (#0B0F2A to #3B2DBF), violet and magenta accents (#7C5CFF, #B04CFF), warm gold for coins and stars (#FFC857), coral pink for hearts (#FF5A7A), teal for correct answers (#2DD4BF).',
  'Top bar: round pause button on the left, three pink hearts, a gold coin counter with a "K" coin on the right. Rounded cards with soft inner glow. Big pill-shaped gradient buttons.',
  'Kora, the helper: a small round cartoon owl with soft violet-purple feathers, a lavender belly and big round eyes with gold rims, appears in a corner with a speech bubble.',
  'Bold geometric sans-serif font. All English text must be spelled exactly as given; keep text short and large. No other words, no watermark, no logos.',
].join(' ');

const GAMES: Record<string, { title: string; prompt: string }> = {
  'hidden-letters': {
    title: 'Hidden Letters',
    prompt: [
      'Game: "Hidden Letters". Small label at top: "HIDDEN LETTERS · LEVEL 3".',
      'A circular countdown timer ring in gold showing "0:18" and a flame streak badge "x4".',
      'In the centre, a big word made of glossy letter tiles with two empty glowing slots: E L E _ H A _ T (the blanks are empty dashed tiles).',
      'Below it a clue card: "A large grey animal with a trunk".',
      'Below, a grid of 8 round bubble letter buttons to choose from: P, N, R, M, S, T, O, B.',
      'Bottom row: a "Hint" button with a lightbulb icon and a cost of 10 coins, and a big gradient button "Check".',
    ].join(' '),
  },
  'word-clash': {
    title: 'Word Clash',
    prompt: [
      'Game: "Word Clash", a head-to-head word battle.',
      'Header: two player cards facing each other with a glowing "VS" between them: on the left a cartoon Nigerian girl avatar labelled "You 128", on the right a cartoon boy avatar labelled "Tobi 96". A round counter "Round 3 of 5" and a timer bar.',
      'Centre: a word being built on a glowing board from wooden-style glossy tiles: Q U I Z, each tile with a small point value in the corner; the Q and Z tiles are gold "rare letter" tiles with a sparkle and "x2".',
      'A floating score pop "+42" in gold.',
      'Bottom: a tile rack of 7 glossy letter tiles: A, E, R, T, S, O, L, with small point numbers. Buttons: shuffle icon, "Clear", and a big gradient "Play word" button.',
    ].join(' '),
  },
  'word-hunter': {
    title: 'Word Hunter',
    prompt: [
      'Game: "Word Hunter", a word search.',
      'Top: a horizontal countdown bar glowing gold to coral, "0:45", and "Found 3 of 6".',
      'Centre: a 6 by 6 grid of letters on rounded square cells. Three found words are highlighted with translucent coloured capsules over the letters (one teal horizontal, one magenta vertical, one gold diagonal), and a finger-drag trail is selecting a fourth word in violet.',
      'Below: chips listing the target words: PLANET, ORBIT, COMET (crossed out with a check mark, found), and STAR, MOON, SUN still to find.',
      'Kora the owl peeks from the bottom corner holding a magnifying glass.',
    ].join(' '),
  },
  spellcaster: {
    title: 'Spellcaster',
    prompt: [
      'Game: "Spellcaster", a fantasy spelling battle.',
      'Upper half: a magical moonlit floating-island battlefield. A cute but menacing purple slime monster with horns and a red health bar above it on the right; on the left a cartoon Nigerian student wizard in a violet robe holding a glowing staff.',
      'A blazing fireball spell flying from the staff towards the monster, with "-35" damage numbers.',
      'Lower half: a spell book panel with the prompt "Spell: a word that means very big" and letter slots filled G I A N T glowing gold.',
      'Below: a ring of glowing rune-style letter stones to tap, and a big gradient button "Cast spell" with a sparkle icon. Small mana bar in teal.',
    ].join(' '),
  },
  'sentence-master': {
    title: 'Sentence Master',
    prompt: [
      'Game: "Sentence Master", a grammar puzzle.',
      'Top: label "GRAMMAR · PAST TENSE" and a progress bar with 4 of 8 stars.',
      'Centre: a sentence track with lined slots where word chips are dropped, partly built: "Yesterday" "she" "visited" then two empty dashed slots.',
      'Below: a pool of scrambled rounded word chips with soft shadows: "her", "grandmother", "visits", "in", "Lagos" (one chip "visits" is subtly marked as a trap in a darker shade).',
      'A small card from Kora the owl: "Tip: use the past tense".',
      'Bottom: big gradient "Check" button and a small "Hint" button.',
    ].join(' '),
  },
};

/**
 * Chemistry lab games. Formulas are written with subscript digits (H₂O) so the picture shows them as
 * chemists write them; the chemistry in each scene is real (the reaction, colours and pH all match).
 */
const LAB = 'Science-lab touches: glowing glassware, soft bubbles and vapour, a subtle hexagon (benzene-ring) pattern in the background.';
const CHEMISTRY: Record<string, { title: string; prompt: string }> = {
  'mixture-lab': {
    title: 'Chemical Mixture Lab',
    prompt: [
      'Game: "Chemical Mixture Lab". Small label at top: "MIXTURE LAB · EXPERIMENT 4". ' + LAB,
      'Centre: a glossy lab bench. Two beakers tilt and pour into a big round glass flask: a bright blue liquid labelled "CuSO₄" and a clear liquid labelled "NaOH".',
      'Inside the flask the mixture turns cloudy pale blue with a blue solid settling at the bottom (a precipitate), with a little sparkle burst.',
      'Below the flask an observation card: "Observation: blue precipitate".',
      'Under it a question "What formed?" and three rounded answer cards: "Copper(II) hydroxide", "Sodium chloride", "Hydrogen gas".',
      'Bottom: a shelf of five small glowing reagent bottles to choose from, and a big gradient button "Mix".',
    ].join(' '),
  },
  'element-quest': {
    title: 'Element Quest',
    prompt: [
      'Game: "Element Quest", collecting chemical elements. Label at top: "ELEMENT QUEST". ' + LAB,
      'Top: a mission card with a gold progress bar: "Mission: collect the noble gases 2/3".',
      'Centre: a big glowing collectible element card like a trading card: large symbol "Na", name "Sodium", atomic number "11", a category ribbon "Alkali metal" in orange, and a small 3D atom illustration (a nucleus with electrons on 3 shells).',
      'Under it two property chips: "Soft metal" and "Reacts with water".',
      'Below: a mini periodic table of the first 20 elements as small rounded squares; collected ones glow in their group colours (H, He, Li, C, O, Ne, Na), the rest are dim locked silhouettes.',
      'Bottom: a big gradient button "Collect" and a small "Card book" button.',
    ].join(' '),
  },
  'molecule-builder': {
    title: 'Molecule Builder',
    prompt: [
      'Game: "Molecule Builder". Label at top: "MOLECULE BUILDER · LEVEL 2". ' + LAB,
      'Top: a target card "Build: Water H₂O" with a small ghost outline of the molecule.',
      'Centre: a glowing workspace where glossy 3D ball-and-stick atoms are being connected: one red oxygen ball labelled "O" joined by two white sticks to two white hydrogen balls labelled "H", in a bent shape; a third bond is being dragged as a glowing line.',
      'A small info bubble: "Oxygen makes 2 bonds".',
      'Bottom: an atom tray of round glossy balls with small count badges: "C" black, "H" white, "O" red, "N" blue; a toggle with "Single" and "Double" bond buttons; and a big gradient button "Check molecule".',
    ].join(' '),
  },
  'reaction-rush': {
    title: 'Reaction Rush',
    prompt: [
      'Game: "Reaction Rush", a fast equation-balancing game. Label at top: "REACTION RUSH". ' + LAB,
      'Top: a glowing countdown bar from gold to coral showing "0:24", a combo flame badge "x3" and a score "1,250".',
      'Centre: a big chemical equation card: [2] H₂ + [1] O₂ → [2] H₂O, where each number in square brackets is a glowing stepper bubble with small up and down arrows.',
      'Under it an atom tally panel in two columns, "Left" and "Right": "H 4 | 4" and "O 2 | 2", each row with a teal check mark.',
      'A floating "Balanced!" burst with sparkles and "+150".',
      'Bottom: the next card sliding in: "Match: Mg + O₂ → ?" with three answer chips "MgO", "MgO₂", "Mg₂O", and a big gradient button "Next".',
    ].join(' '),
  },
  'mystery-substance': {
    title: 'Mystery Substance',
    prompt: [
      'Game: "Mystery Substance", a chemistry detective game. Label at top: "CASE 3 · MYSTERY SUBSTANCE". ' + LAB,
      'Centre top: a sealed glowing test tube with a pale colourless liquid and a big "?" floating in front of it, on a detective desk with a magnifying glass.',
      'A rainbow pH scale bar from 0 to 14 with a marker pointing at "pH 2", red end highlighted.',
      'Three clue cards stacked like evidence notes: "Turns blue litmus red", "Fizzes with magnesium", "Colourless liquid".',
      'A row of test buttons with icons: "Litmus", "Add Mg", "Flame test".',
      'Bottom: a 2 by 2 grid of suspect cards: "Hydrochloric acid", "Sodium hydroxide", "Distilled water", "Ethanol", and a big gradient button "Identify".',
      'Kora the owl wears a small detective hat.',
    ].join(' '),
  },
};

/**
 * The chemistry lab, realistic: a 3D school laboratory the learner walks around as a real-looking
 * student in a lab coat, picking up equipment and chemicals. Help from the AI costs coins.
 */
const REALISTIC = [
  'A single mobile game screenshot, portrait phone screen (no phone frame, no hands), for a chemistry learning game for Nigerian secondary-school students.',
  'Visual style: realistic high-end 3D game render (Unreal Engine quality), physically based materials, soft natural lighting, shallow depth of field. NOT cartoon: real-looking people and objects.',
  'Setting: a modern, well-equipped secondary-school chemistry laboratory: white lab benches with black resin tops, sinks and gas taps, Bunsen burners, a fume cupboard, wall shelves of labelled reagent bottles, glassware racks, safety posters, a periodic table on the wall, an eyewash station, windows with daylight.',
  'The player character: a real-looking Nigerian teenage student (about 15) in a crisp white lab coat, clear safety goggles and gloves, seen from a third-person view slightly above and behind.',
  'Game UI overlaid with clean, modern, semi-transparent dark navy panels with violet (#7C5CFF) and gold (#FFC857) accents and rounded corners:',
  'top-left a round pause button; top-right a gold coin counter with a "K" coin and three small pink hearts;',
  'bottom-left a round virtual joystick for walking; bottom-right a big round action button;',
  'an AI help button with a small violet owl icon labelled "Ask AI · 10" with a gold coin.',
  'Bold sans-serif UI font. All English text must be spelled exactly as given; keep text short. No other words, no watermark, no logos.',
].join(' ');

const CHEMISTRY_LAB: Record<string, { title: string; prompt: string }> = {
  'lab-explore': {
    title: 'The Lab (walking around)',
    prompt: [
      'Screen: exploring the lab. Wide view of the whole laboratory from behind the student, who is walking between two benches towards the shelves.',
      'Floating markers above items that can be picked up: a glowing outline around a beaker on a bench with a label "Beaker", around a reagent bottle on the shelf with a label "Copper(II) sulfate", and around a Bunsen burner with "Bunsen burner".',
      'Top-centre an objective panel: "Experiment 4: Make copper(II) hydroxide" with a checklist: "Beaker ✓", "Copper(II) sulfate", "Sodium hydroxide".',
      'The action button bottom-right shows a hand icon with the text "Pick up".',
      'A bottom inventory bar with 5 slots; the first slot shows a beaker.',
    ].join(' '),
  },
  'mixture-lab': {
    title: 'Chemical Mixture Lab',
    prompt: [
      'Game: "Chemical Mixture Lab". Close-up over the student\'s shoulder at a lab bench: gloved hands pouring a clear liquid from a bottle labelled "NaOH" into a glass beaker of bright blue copper(II) sulfate solution; a pale blue cloudy solid (precipitate) is forming and settling in the beaker.',
      'A small top label "MIXTURE LAB · EXPERIMENT 4".',
      'An observation card appears: "Observation: blue precipitate".',
      'A question panel: "What formed?" with three answer buttons: "Copper(II) hydroxide", "Sodium chloride", "Hydrogen gas".',
      'Inventory bar at the bottom showing a beaker, a bottle and a stirring rod. Instead of the joystick, a "Pour" button.',
    ].join(' '),
  },
  'element-quest': {
    title: 'Element Quest',
    prompt: [
      'Game: "Element Quest". The student stands in the lab in front of a tall glass cabinet of element samples in sealed jars and ampoules (a lump of sodium stored in oil, copper wire, a sulfur powder, a neon tube glowing orange-red), with a large periodic table on the wall behind.',
      'The student holds a small jar labelled "Na" up to look at it.',
      'A realistic element card pops up beside the jar: "Na · Sodium · 11", category tag "Alkali metal", properties "Soft metal" and "Reacts with water".',
      'Top-centre mission panel: "Mission: collect the noble gases 2/3" with a gold progress bar.',
      'Action button: "Collect".',
    ].join(' '),
  },
  'molecule-builder': {
    title: 'Molecule Builder',
    prompt: [
      'Game: "Molecule Builder". The student sits at a lab bench building a real plastic molecular model kit: a red oxygen ball connected by two white connectors to two white hydrogen balls (a bent water molecule), with an open model-kit box of coloured atom balls (black carbon, white hydrogen, red oxygen, blue nitrogen) beside them.',
      'Top panel: "Build: Water H₂O".',
      'A small tip bubble: "Oxygen makes 2 bonds".',
      'Bottom: an atom tray with counts and two buttons "Single bond" and "Double bond", and a big gold button "Check molecule".',
    ].join(' '),
  },
  'reaction-rush': {
    title: 'Reaction Rush',
    prompt: [
      'Game: "Reaction Rush". The student hurries across the lab to the reagent shelf, reaching for a bottle, with motion blur suggesting speed; a large interactive whiteboard on the wall shows a chemical equation.',
      'A big overlay card over the top: equation "2 H₂ + O₂ → 2 H₂O" with the coefficients in glowing number boxes, and an atom count "H 4 | 4   O 2 | 2" with check marks.',
      'A countdown bar "0:24" in gold to red, a combo badge "x3" and a "+150" score pop.',
      'Action button: "Balance".',
    ].join(' '),
  },
  'mystery-substance': {
    title: 'Mystery Substance',
    prompt: [
      'Game: "Mystery Substance", a lab detective case. The student at a bench dips blue litmus paper into a test tube of an unknown colourless liquid; the paper turns red. A rack of test tubes, a strip of magnesium ribbon, and a digital pH meter reading "2.0" are on the bench. A test tube labelled "?" stands in front.',
      'Top label: "CASE 3 · MYSTERY SUBSTANCE".',
      'A clue notebook panel listing: "Turns blue litmus red", "Fizzes with magnesium", "pH 2".',
      'A row of test buttons: "Litmus", "Add Mg", "Flame test".',
      'Bottom: four suspect buttons: "Hydrochloric acid", "Sodium hydroxide", "Distilled water", "Ethanol", and a gold button "Identify".',
    ].join(' '),
  },
};

/**
 * Space & Physics, stylised 3D: a space academy the learner walks around in a space suit (2.5D),
 * between a hangar, a rocket workshop, a gravity lab and an observatory. Real lighting and
 * materials, slightly cartoon proportions (Pixar-like), not flat cartoon.
 */
const STYLISED = [
  'A single mobile game screenshot, portrait phone screen (no phone frame, no hands), for a space and physics learning game for Nigerian secondary-school students.',
  'Visual style: stylised 3D game render, like a Pixar film or a premium console game: realistic lighting, reflections and physically based materials (brushed metal, glass, glowing screens), but slightly cartoon proportions and friendly rounded shapes. Rich colours: deep space blues and violets, warm orange engine glows, teal holograms.',
  'The player character: a Nigerian teenage student (about 15) in a white and violet space suit with orange details and a clear bubble helmet, stylised but believable, friendly face.',
  'Game UI overlaid with clean, modern, semi-transparent dark navy panels with violet (#7C5CFF) and gold (#FFC857) accents and rounded corners:',
  'top-left a round pause button; top-right a gold coin counter with a "K" coin and three small pink hearts;',
  'an AI help button with a small violet owl icon labelled "Ask AI · 10" with a gold coin.',
  'Bold sans-serif UI font. All English text must be spelled exactly as given; keep text short. No other words, no watermark, no logos.',
].join(' ');

const SPACE: Record<string, { title: string; prompt: string }> = {
  'academy-explore': {
    title: 'Space Academy (walking around)',
    prompt: [
      'Screen: exploring the space academy. A wide 2.5D view, from slightly above and behind, of a big round space-station hall with a huge window showing Earth and stars. The student walks across the shiny floor.',
      'Around the hall, four glowing doorways or areas with floating labels: "Hangar" (a small fighter spaceship parked), "Rocket Workshop" (a rocket on a launch frame), "Gravity Lab" (floating spheres in a glass dome), "Observatory" (a big telescope and a hologram of the solar system).',
      'Top-centre an objective panel: "Mission: Reach the Moon" with a checklist "Build rocket", "Launch".',
      'Bottom-left a round virtual joystick; bottom-right a big round action button "Enter".',
    ].join(' '),
  },
  'galaxy-defender': {
    title: 'Galaxy Defender',
    prompt: [
      'Game: "Galaxy Defender", a vertical space shooter. The student\'s small rounded fighter spaceship at the bottom, seen from behind and above, firing violet laser beams up at a big menacing but cartoonish alien boss mothership at the top with a health bar "BOSS".',
      'Asteroids and sparkles fly past; a nebula background.',
      'A question card slides in at the middle: "What force pulls objects towards Earth?" with three answer buttons "Gravity", "Friction", "Magnetism"; a label "Correct = Power up!".',
      'A weapon energy bar on the left side glowing gold, "Power 70%". Score "12 450" at the top.',
    ].join(' '),
  },
  'rocket-builder': {
    title: 'Rocket Builder',
    prompt: [
      'Game: "Rocket Builder". Inside a bright rocket workshop hangar, a half-built rocket stands on a launch frame in the centre; the student in the space suit holds a rocket engine part next to it.',
      'Right side panel: parts list cards with pictures: "Nose cone", "Fuel tank", "Engine", "Fins", each with a mass in kg.',
      'Left side panel: physics readout "Mass 1 200 kg", "Thrust 18 000 N", "Weight 11 760 N", and a green check "Thrust > Weight: Lift-off!".',
      'A fuel gauge bar "Fuel 80%". Top label: "Target: Mars". Bottom: a big orange button "Launch".',
    ].join(' '),
  },
  'gravity-master': {
    title: 'Gravity Master',
    prompt: [
      'Game: "Gravity Master", a physics puzzle in space. A small glowing comet ball starts on the left; two planets with gravity fields drawn as soft glowing rings bend its dotted predicted path around them towards a swirling goal portal on the right.',
      'The player drags a planet to change the path: a hand icon on one planet, a mass slider "Mass ×2".',
      'Top label: "PUZZLE 7". A star rating of three stars to earn. A tip bubble from the small violet owl: "Bigger mass = stronger pull".',
      'Bottom buttons: "Reset" and a big gold button "Launch".',
    ].join(' '),
  },
  'solar-explorer': {
    title: 'Solar System Explorer',
    prompt: [
      'Game: "Solar System Explorer". The student in the space suit stands on the red rocky surface of Mars beside a small parked lander, with a dusty sky and two tiny moons.',
      'A floating hologram fact card: "MARS · 4th planet", "Gravity 0.38 g", "Day 24.6 h", "Moons 2".',
      'A mission panel: "Mission: Find the ice" with a scanner progress bar "62%".',
      'Bottom: a small map strip of the solar system with planets, Mars highlighted. Bottom-left a joystick, bottom-right a round button "Scan".',
    ].join(' '),
  },
  'asteroid-survival': {
    title: 'Asteroid Survival',
    prompt: [
      'Game: "Asteroid Survival". A rounded spaceship in the middle dodging a dense wave of tumbling rocky asteroids of different sizes, with a shield bubble around it; a speed trail.',
      'Top: "WAVE 4" and a survival timer "1:12".',
      'A physics challenge card at the bottom: "A 2 kg rock moves at 3 m/s. Momentum?" with answer buttons "6 kg·m/s", "1.5 kg·m/s", "5 kg·m/s", and a reward label "Shield upgrade".',
      'Upgrade icons row: "Shield", "Thrusters", "Laser" with small level bars.',
    ].join(' '),
  },
};

/**
 * History & Geography, stylised 3D like the Space Academy: a museum of history the learner walks
 * around as an explorer, a time machine, an excavation, and a journey across Africa.
 */
const HISTORY_STYLE = [
  'A single mobile game screenshot, portrait phone screen (no phone frame, no hands), for a history and geography learning game for Nigerian secondary-school students.',
  'Visual style: stylised 3D game render, like a Pixar film or a premium console game: realistic lighting and materials (polished wood, brass, stone, cloth, warm sunlight), slightly cartoon proportions and friendly rounded shapes. Rich warm colours: golden amber, terracotta, deep teal, with violet accents.',
  'The player character: a Nigerian teenage student (about 15) dressed as a young explorer: khaki safari shirt with rolled sleeves, a brown leather satchel, dark trousers and boots, a small explorer hat; stylised but believable, friendly face.',
  'Game UI overlaid with clean, modern, semi-transparent dark navy panels with violet (#7C5CFF) and gold (#FFC857) accents and rounded corners:',
  'top-left a round pause button; top-right a gold coin counter with a "K" coin and three small pink hearts;',
  'an AI help button with a small violet owl icon labelled "Ask AI · 10" with a gold coin.',
  'Bold sans-serif UI font. All English text must be spelled exactly as given; keep text short. No other words, no watermark, no logos.',
].join(' ');

const HISTORY: Record<string, { title: string; prompt: string }> = {
  'museum-explore': {
    title: 'Museum of Time (walking around)',
    prompt: [
      'Screen: exploring a grand museum of history. A wide 2.5D view from slightly above and behind of a huge sunlit museum hall with marble floor and tall arched windows. The explorer student walks across the floor.',
      'Around the hall, three areas with floating labels: "Time Machine" (a glowing brass and wood time machine with a swirling portal), "Lost Civilizations" (an excavation pit with ancient stone ruins and a bronze head on a pedestal), "Africa Explorer" (a giant glowing 3D map of Africa on a round table with little landmarks).',
      'Top-centre an objective panel: "Explore the Museum of Time".',
      'Bottom-left a round virtual joystick; bottom-right a big round action button "Enter".',
    ].join(' '),
  },
  'time-machine': {
    title: 'History Time Machine',
    prompt: [
      'Game: "History Time Machine". The student has just stepped out of a glowing brass time machine into a historic scene: Lagos, Nigeria on 1 October 1960, Independence Day, a crowd celebrating as the green-white-green Nigerian flag is raised on a tall flagpole, colonial-era buildings, warm sunrise light.',
      'Top: a horizontal timeline bar with era dots "1500", "1800", "1900", "1960", "Today", the "1960" dot glowing.',
      'A challenge card at the bottom: "Who became Nigeria’s first Prime Minister in 1960?" with three answer buttons "Tafawa Balewa", "Nnamdi Azikiwe", "Obafemi Awolowo".',
      'A small badge "Era 3 of 5".',
    ].join(' '),
  },
  'lost-civilization': {
    title: 'Lost Civilization',
    prompt: [
      'Game: "Lost Civilization". An archaeological dig at the ruins of an ancient West African city with red earth walls; the student kneels in a dig pit gently brushing soil off a beautiful bronze head sculpture (like an Ife bronze head), tools around: brush, trowel, string grid.',
      'A glowing artifact card: "Artifact found: Bronze head" with a clue line "Made over 700 years ago by master metal-casters".',
      'A mystery panel: "Which civilization made this?" with answer buttons "Ife", "Mali Empire", "Ancient Egypt".',
      'A progress bar "City unlocked 2/3" with a small icon of an ancient city gate.',
    ].join(' '),
  },
  'africa-explorer': {
    title: 'Africa Explorer',
    prompt: [
      'Game: "Africa Explorer". The student stands on a viewpoint in front of the thundering Victoria Falls with mist and a rainbow, wearing the explorer outfit and holding a passport.',
      'A big map card on the right side showing the outline of Africa with country borders, Zambia and Zimbabwe highlighted in gold and a pin on the falls.',
      'A question card: "Victoria Falls lies on which river?" with answer buttons "Zambezi", "Nile", "Niger", "Congo".',
      'A row of passport stamps at the top: "Nigeria", "Egypt", "Kenya" stamped, and empty stamp circles.',
    ].join(' '),
  },
};

/**
 * World Quests: daily and weekly quests that run across every place in Knowzone World (Language
 * Island, the Chemistry lab, the Space Academy, the Museum of Time), in the same stylised 3D look.
 */
const QUEST_STYLE = [
  'A single mobile game screenshot, portrait phone screen (no phone frame, no hands), for a learning game app for Nigerian secondary-school students.',
  'Visual style: stylised 3D game render like a Pixar film or a premium mobile game: warm lighting, real materials (polished wood, parchment, brass, glowing magic light), slightly cartoon proportions, rich colours, deep navy and violet night-sky background with gold accents.',
  'Game UI with clean, modern, semi-transparent dark navy panels with violet (#7C5CFF) and gold (#FFC857) accents and rounded corners; a gold coin counter with a "K" coin at the top right.',
  'Small place icons used on quest cards: a green chemistry flask (Chemistry lab), a rocket (Space Academy), a brass time machine dial (Museum of Time), an open book with letters (Language Island).',
  'Bold sans-serif UI font. All English text must be spelled exactly as given; keep text short. No other words, no watermark, no logos.',
].join(' ');

const QUESTS: Record<string, { title: string; prompt: string }> = {
  'quest-board': {
    title: 'Quest board',
    prompt: [
      'Screen: the World Quests board. At the top the title "Quests" with a flame streak badge "5 days" and a small timer "New quests in 6h 12m".',
      'Tabs below it: "Daily" (selected, gold), "Weekly", "Journey".',
      'A big 3D wooden notice board with warm lantern light, with four parchment quest cards pinned to it with brass pins, stacked vertically, each with a place icon on the left, a title, a progress bar and reward chips on the right:',
      '1. flask icon, "Mix 2 experiments in the Chemistry lab", bar "1/2", chip "+30 XP".',
      '2. rocket icon, "Launch a rocket to orbit", bar "0/1", chip "+20 coins".',
      '3. time machine icon, "Visit 3 eras in the Time Machine", bar "3/3" full and glowing with a gold "Claim" button.',
      '4. book icon, "Win a Word Clash", bar "0/1", chip "+30 XP".',
      'At the bottom a daily chest progress bar with 3 treasure chest milestones, the first one open.',
    ].join(' '),
  },
  'quest-detail': {
    title: 'Quest details',
    prompt: [
      'Screen: one quest opened as a big card. The top half of the card is a picture of a stylised 3D space station hall with a white rocket on a launch tower, golden light.',
      'Below: a rocket icon and the title "Launch a rocket to orbit", a small label "Space Academy · Daily quest".',
      'A short line "Build a rocket in the Rocket workshop and reach Earth orbit."',
      'A progress bar "0/1".',
      'Reward row: "+40 XP", "+20 coins", and a small chest icon.',
      'A big gold button "Go to Space Academy" with a walking-person icon, and a smaller text button "Back to quests".',
    ].join(' '),
  },
  'quest-reward': {
    title: 'Quest complete',
    prompt: [
      'Screen: quest complete celebration. In the centre a big ornate 3D wooden and gold treasure chest bursting open with golden light, gold "K" coins and sparkles flying out, confetti.',
      'Above it the heading "Quest complete!" and below the title "Visit 3 eras in the Time Machine".',
      'Reward cards in a row: "+40 XP" with a lightning icon, "+20 coins" with a gold coin, and "Explorer hat" with a picture of a small khaki explorer hat (an avatar item).',
      'A big gold button "Collect".',
    ].join(' '),
  },
  'quest-journey': {
    title: 'Weekly journey',
    prompt: [
      'Screen: the weekly Journey quest. Title "This week’s journey" with "4 days left".',
      'A stylised 3D illustrated map with a winding golden dotted path connecting four glowing places: a tropical island with a giant open book (Language Island), a glass chemistry laboratory building, a space station with a rocket, and a grand museum with columns. Small flags mark completed steps; the path is lit up to the second place.',
      'At the end of the path a big glowing golden treasure chest labelled "Weekly chest".',
      'A panel at the bottom: "Step 3 of 6: Find 3 countries in Africa Explorer" with a progress bar "1/3" and a gold button "Go".',
    ].join(' '),
  },
};

/**
 * Technology & Computer Science, stylised 3D like the Space Academy: a tech hub the learner walks
 * around (coding arena, cyber security room, robotics bay, binary vault, electronics workbench).
 */
const TECH_STYLE = [
  'A single mobile game screenshot, portrait phone screen (no phone frame, no hands), for a technology and computer science learning game for Nigerian secondary-school students.',
  'Visual style: stylised 3D game render, like a Pixar film or a premium console game: realistic lighting and materials (glass, brushed metal, glowing screens, circuit boards, neon light strips), slightly cartoon proportions and friendly rounded shapes. Rich colours: deep navy and violet with teal and electric-green neon accents and warm orange highlights.',
  'The player character: a Nigerian teenage student (about 15) in a dark violet hoodie with a teal circuit pattern, jeans and sneakers, wireless headphones around the neck; stylised but believable, friendly face.',
  'Game UI overlaid with clean, modern, semi-transparent dark navy panels with violet (#7C5CFF) and gold (#FFC857) accents and rounded corners:',
  'top-left a round pause button; top-right a gold coin counter with a "K" coin and three small pink hearts;',
  'an AI help button with a small violet owl icon labelled "Ask AI · 10" with a gold coin.',
  'Bold sans-serif UI font. All English text must be spelled exactly as given; keep text short. No other words, no watermark, no logos.',
].join(' ');

const TECH: Record<string, { title: string; prompt: string }> = {
  'tech-hub': {
    title: 'Tech Hub (walking around)',
    prompt: [
      'Screen: exploring the Tech Hub, a bright futuristic innovation centre with glass walls and neon strips. A wide 2.5D view from slightly above and behind; the student walks across the shiny floor.',
      'Around the hall, five areas with floating labels: "Code Arena" (a glowing grid floor with a little runner character), "Cyber Room" (screens with shields and padlocks), "Robot Bay" (a small friendly robot on a test track), "Binary Vault" (a big round vault door with glowing 0 and 1 digits), "Circuit Bench" (a workbench with wires, bulbs and logic chips).',
      'Bottom-left a round virtual joystick; bottom-right a big round action button "Enter".',
    ].join(' '),
  },
  'code-runner': {
    title: 'Code Runner',
    prompt: [
      'Game: "Code Runner". A glowing isometric tile path floating in a digital space with a small cartoon runner character standing on the start tile, gems and a goal flag on the path, a gap to jump.',
      'At the bottom a code panel where coloured instruction blocks snap together: "move forward", "move forward", "jump", "turn right", "repeat 3 times" (a loop block wrapping two blocks).',
      'A tray of blocks to drag: "move", "jump", "turn left", "turn right", "repeat".',
      'A big green "Run" button with a play icon, and a label "Level 4 · 6 blocks max".',
    ].join(' '),
  },
  'cyber-defender': {
    title: 'Cyber Defender',
    prompt: [
      'Game: "Cyber Defender". The student sits at a glowing security desk with three monitors showing a network map of computers connected by lines, one computer flashing red.',
      'A big message card in front: an email "From: support@bank-n1gerla.com  Subject: Your account is locked! Click here now" with the suspicious link and the misspelled address highlighted.',
      'Two big buttons: "Phishing" (red, with a hook icon) and "Safe" (green, with a check).',
      'A shield health bar "Network shield 80%" and a score "Threats stopped 7".',
    ].join(' '),
  },
  'robot-rescue': {
    title: 'Robot Rescue',
    prompt: [
      'Game: "Robot Rescue". A colourful 3D puzzle grid floor (like a small island of tiles) seen from above at an angle, with walls, a crate and a river; a cute round robot on one corner and a small kitten stuck on the far corner waiting to be rescued.',
      'A dotted planned path drawn on the tiles from the robot to the kitten.',
      'At the bottom a programme strip of arrow command cards: "↑", "↑", "→", "pick up", "↓", with an empty slot, and a tray of arrow cards to add.',
      'Buttons "Clear" and a big orange "Go!" button. A label "Rescue 2 of 3".',
    ].join(' '),
  },
  'binary-breaker': {
    title: 'Binary Breaker',
    prompt: [
      'Game: "Binary Breaker". A huge round high-tech vault door with glowing teal circuits, in the centre a lock panel with eight light switches showing a binary number: 0 1 0 0 1 0 1 1, with small place-value labels under them "128 64 32 16 8 4 2 1".',
      'A clue card: "Set the code to 75" and the current value "= 75" glowing green.',
      'A row of number keys and a big gold button "Unlock".',
      'A progress label "Stage 3 · Vault 2 of 5".',
    ].join(' '),
  },
  'circuit-master': {
    title: 'Circuit Master',
    prompt: [
      'Game: "Circuit Master". A workbench seen from above with a glowing circuit puzzle: a battery on the left, wires leading through logic gate chips labelled "AND", "OR" and "NOT" to a light bulb and a small fan on the right; two input switches labelled "A" and "B".',
      'Wires glow yellow where power flows; the bulb is lit.',
      'A goal card: "Make the bulb light only when A and B are both ON".',
      'A tray of gate chips to drag: "AND", "OR", "NOT", and a big gold button "Test circuit".',
    ].join(' '),
  },
};

/**
 * Business, Finance & Economics, stylised 3D like the Tech Hub: a business district the learner walks
 * around (startup office, bank, market square, factory, stock exchange). Led by a young white woman.
 */
const BUSINESS_STYLE = [
  'A single mobile game screenshot, portrait phone screen (no phone frame, no hands), for a business, finance and economics learning game for secondary-school students around the world.',
  'Visual style: stylised 3D game render, like a Pixar film or a premium console game: realistic lighting and materials (glass towers, polished wood, brass, paper money, coins, glowing charts), slightly cartoon proportions and friendly rounded shapes. Rich colours: warm cream and emerald green with deep navy, gold and coral accents.',
  'The player character: a young white woman (about 19) with wavy auburn hair in a ponytail, light freckles and green eyes, wearing a smart emerald-green blazer over a white top with a small violet "K" logo badge on the blazer pocket, navy trousers and white sneakers, holding a tablet; stylised but believable, confident friendly face.',
  'Game UI overlaid with clean, modern, semi-transparent dark navy panels with violet (#7C5CFF) and gold (#FFC857) accents and rounded corners:',
  'top-left a round pause button; top-right a gold coin counter with a "K" coin and three small pink hearts;',
  'an AI help button with a small violet owl icon labelled "Ask AI · 10" with a gold coin.',
  'Money in the games is a fictional currency shown with the symbol "$". Bold sans-serif UI font. All English text must be spelled exactly as given; keep text short. No other words, no watermark, no other logos.',
].join(' ');

const BUSINESS: Record<string, { title: string; prompt: string }> = {
  'business-hub': {
    title: 'Business District (walking around)',
    prompt: [
      'Screen: exploring the Business District, a sunny stylised city square with a fountain, trees and glass towers. A wide 2.5D view from slightly above and behind; the young woman walks across the plaza.',
      'Around the square, five buildings with floating labels: "Startup HQ" (a modern glass office with a rocket sign), "Budget Bank" (a classic bank with columns and a piggy bank sign), "Market Square" (colourful fruit and craft stalls with awnings), "Profit Factory" (a small brick factory with a conveyor and boxes), "Stock Exchange" (a grand building with a big glowing ticker board of rising and falling green and red arrows).',
      'Bottom-left a round virtual joystick; bottom-right a big round action button "Enter".',
    ].join(' '),
  },
  'startup-tycoon': {
    title: 'Startup Tycoon',
    prompt: [
      'Game: "Startup Tycoon". A cutaway 3D view of a small startup office building, two floors, like a dollhouse: desks with computers, a coffee corner, a few cartoon staff working; an empty room with a "+" sign to build.',
      'Top bar: "Month 6", cash "$12,400", a staff icon "5", a smiley "Morale 82%".',
      'At the bottom a row of candidate cards to hire: "Designer · $900/month", "Developer · $1,200/month", "Salesperson · $800/month", each with a small portrait and a "Hire" button.',
      'A small revenue chart going up, and a big gold button "Next month".',
    ].join(' '),
  },
  'budget-master': {
    title: 'Budget Master',
    prompt: [
      'Game: "Budget Master". The young woman sits at a cosy desk in a bright apartment, with a big paper-style budget planner in front.',
      'Card at the top: "Monthly income $2,000". Below, a list of bills to drag money into: "Rent $700" (paid, green check), "Food $300", "Transport $120", "Phone $40", and a goal jar "Savings: new laptop $600" half full.',
      'A pop-up event card: "Your friend invites you to a concert: $80" with two buttons "Go" and "Skip".',
      'A ring chart showing needs, wants and savings, and a label "Left to plan: $440".',
    ].join(' '),
  },
  'market-master': {
    title: 'Market Master',
    prompt: [
      'Game: "Market Master". A lively outdoor market street; the young woman runs a lemonade and fruit stall with a striped awning; a queue of cartoon customers, and a rival stall across the street.',
      'A price board on the stall: "Lemonade $2.50" with "−" and "+" buttons.',
      'A supply and demand chart panel: a blue demand curve sloping down and an orange supply curve sloping up, crossing at a glowing dot, with the label "Best price".',
      'Small labels: "Stock 40 cups", "Sold 26", "Hot day! Demand up", and a weather sun icon. A big gold button "Open stall".',
    ].join(' '),
  },
  'profit-quest': {
    title: 'Profit Quest',
    prompt: [
      'Game: "Profit Quest". Inside a cheerful small factory making cartoon backpacks on a conveyor belt; the young woman stands at a control panel.',
      'A big panel: "Price per bag $25", "Cost per bag $14", "Fixed costs $1,500 per week", with sliders for "Production 200 bags" and "Price".',
      'A profit result card: "Revenue $5,000 − Costs $4,300 = Profit $700" with the profit glowing green, and a small break-even chart.',
      'A label "Week 3 of 8" and a big gold button "Run the week".',
    ].join(' '),
  },
  'market-simulator': {
    title: 'Market Simulator',
    prompt: [
      'Game: "Market Simulator". The young woman stands in front of a grand stock exchange wall of glowing screens with candlestick charts.',
      'A portfolio card: "Portfolio $10,850 (+8.5%)" with a small pie chart of four fictional companies: "SunPower Energy", "GreenLeaf Foods", "RoboWorks", "City Bank".',
      'A news ticker card: "Breaking: heatwave boosts energy demand!" with an upward green arrow.',
      'Buttons "Buy" (green) and "Sell" (coral), and a label "Practice money only · Year 2, Q1". A big gold button "Next quarter".',
    ].join(' '),
  },
};

const SETS: Record<string, Record<string, { title: string; prompt: string }>> = {
  english: GAMES,
  chemistry: CHEMISTRY,
  'chemistry-lab': CHEMISTRY_LAB,
  space: SPACE,
  history: HISTORY,
  quests: QUESTS,
  tech: TECH,
  business: BUSINESS,
};
/** Sets drawn in another style than the cartoon one. */
const SET_STYLE: Record<string, string> = { 'chemistry-lab': REALISTIC, space: STYLISED, history: HISTORY_STYLE, quests: QUEST_STYLE, tech: TECH_STYLE, business: BUSINESS_STYLE };

const args = process.argv.slice(2);
const flag = (name: string) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined);
const set = SETS[flag('set') ?? 'english'];
if (!set) throw new Error(`--set must be one of: ${Object.keys(SETS).join(', ')}`);
const [outDir, only] = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
const n = Number(flag('n')) || 2;
const quality = (flag('quality') as 'medium' | 'high') ?? 'medium';
if (!outDir) throw new Error('Usage: npx tsx scripts/ui-concepts.ts <output folder> [game id] [--n 2] [--quality medium]');
mkdirSync(outDir, { recursive: true });

await Promise.all(
  Object.entries(set)
    .filter(([id]) => !only || only === id)
    .map(async ([id, game]) => {
      const result = await openaiClient().images.generate({
        model: config.OPENAI_MODEL_IMAGE,
        prompt: `${SET_STYLE[flag('set') ?? ''] ?? STYLE}\n${game.prompt}`,
        size: '1024x1536',
        quality,
        output_format: 'png',
        n,
      });
      result.data?.forEach((img, i) => {
        const file = join(outDir, `${id}-${i + 1}.png`);
        writeFileSync(file, Buffer.from(img.b64_json!, 'base64'));
        console.log('saved', file);
      });
      if (result.usage) console.log(`${game.title}: ${result.usage.output_tokens} image tokens`);
    }),
);
