// Written by scripts/world-content.ts (writer deepseek-v4.1-flash-1017, checker qwen3.8-27b, auditor glm-5.3-flash). Don't edit by hand.
import type { WorldBank } from '../types.js';

export const NATURE_BANK: WorldBank = {
 "1": {
  "questions": [
   {
    "id": "nature-L1-q1",
    "q": "What is the main job of red blood cells?",
    "options": [
     "Digest food",
     "Carry oxygen",
     "Fight infection",
     "Clot the blood"
    ],
    "answer": 1,
    "why": "Red blood cells contain haemoglobin, which carries oxygen around the body.",
    "hint": "Think about what the blood delivers to your muscles."
   },
   {
    "id": "nature-L1-q2",
    "q": "Which part of a plant cell is made of cellulose?",
    "options": [
     "The vacuole",
     "The cell wall",
     "The chloroplast",
     "The nucleus"
    ],
    "answer": 1,
    "why": "The cell wall of a plant cell is made of cellulose and gives the cell its shape.",
    "hint": "It is the tough outer layer."
   },
   {
    "id": "nature-L1-q3",
    "q": "Which gas do plants take in during photosynthesis?",
    "options": [
     "Hydrogen",
     "Oxygen",
     "Nitrogen",
     "Carbon dioxide"
    ],
    "answer": 3,
    "why": "Plants use carbon dioxide and water to make glucose during photosynthesis.",
    "hint": "It is the gas we breathe out."
   },
   {
    "id": "nature-L1-q4",
    "q": "What is the basic unit of life called?",
    "options": [
     "Cell",
     "Organ",
     "Atom",
     "Tissue"
    ],
    "answer": 0,
    "why": "All living things are made of cells, the smallest unit that can carry out life processes.",
    "hint": "It is smaller than a tissue."
   },
   {
    "id": "nature-L1-q5",
    "q": "Which organ pumps blood around the body?",
    "options": [
     "The kidneys",
     "The heart",
     "The liver",
     "The lungs"
    ],
    "answer": 1,
    "why": "The heart is a muscular pump that pushes blood through the blood vessels.",
    "hint": "You can feel it beating in your chest."
   },
   {
    "id": "nature-L1-q6",
    "q": "Which of these animals is a mammal?",
    "options": [
     "Frog",
     "Dolphin",
     "Shark",
     "Crocodile"
    ],
    "answer": 1,
    "why": "Dolphins are mammals: they breathe air, have hair when young and feed their young on milk.",
    "hint": "It lives in the sea but is not a fish."
   },
   {
    "id": "nature-L1-q7",
    "q": "What do we call an animal that eats only plants?",
    "options": [
     "Omnivore",
     "Carnivore",
     "Herbivore",
     "Predator"
    ],
    "answer": 2,
    "why": "A herbivore feeds only on plants, such as a rabbit or a cow.",
    "hint": "The word starts like 'herb', meaning plant."
   },
   {
    "id": "nature-L1-q8",
    "q": "Which structure in a cell contains the genetic material?",
    "options": [
     "The membrane",
     "The cytoplasm",
     "The ribosome",
     "The nucleus"
    ],
    "answer": 3,
    "why": "The nucleus contains the chromosomes, which carry the genetic material DNA.",
    "hint": "It is like the control centre of the cell."
   },
   {
    "id": "nature-L1-q9",
    "q": "Which of these is a fungus?",
    "options": [
     "Moss",
     "Seaweed",
     "Fern",
     "Mushroom"
    ],
    "answer": 3,
    "why": "Mushrooms are fungi; they absorb nutrients rather than making food by photosynthesis.",
    "hint": "It often grows on damp soil or rotting wood."
   },
   {
    "id": "nature-L1-q10",
    "q": "What is the process by which a caterpillar becomes a butterfly?",
    "options": [
     "Respiration",
     "Photosynthesis",
     "Metamorphosis",
     "Germination"
    ],
    "answer": 2,
    "why": "Metamorphosis is a change of body form during development, as when a caterpillar becomes a butterfly.",
    "hint": "The word means 'change of form'."
   },
   {
    "id": "nature-L1-q11",
    "q": "Which food group is needed mainly for growth and repair of the body?",
    "options": [
     "Proteins",
     "Carbohydrates",
     "Vitamins",
     "Fats"
    ],
    "answer": 0,
    "why": "Proteins are used for growth and for repairing body tissues.",
    "hint": "Meat, fish, eggs and beans are rich in it."
   },
   {
    "id": "nature-L1-q12",
    "q": "Which part of a flowering plant makes the seeds?",
    "options": [
     "The leaf",
     "The flower",
     "The root",
     "The stem"
    ],
    "answer": 1,
    "why": "Seeds develop inside the flower after pollination and fertilisation.",
    "hint": "It is the colourful part of the plant."
   },
   {
    "id": "nature-L1-q13",
    "q": "What do we call organisms that break down dead material and recycle nutrients?",
    "options": [
     "Consumers",
     "Producers",
     "Decomposers",
     "Predators"
    ],
    "answer": 2,
    "why": "Decomposers such as bacteria and fungi break down dead matter and return nutrients to the soil.",
    "hint": "Their name is linked to the word 'decay'."
   }
  ],
  "truths": [
   {
    "id": "nature-L1-t1",
    "s": "The heart pumps blood around the body.",
    "answer": true,
    "why": "The heart is the muscular pump of the circulatory system."
   },
   {
    "id": "nature-L1-t2",
    "s": "Humans have gills for breathing.",
    "answer": false,
    "why": "Humans breathe with lungs; gills are found in fish."
   },
   {
    "id": "nature-L1-t3",
    "s": "Photosynthesis takes place mainly in the leaves of a plant.",
    "answer": true,
    "why": "Leaves contain chloroplasts with chlorophyll, where photosynthesis happens."
   },
   {
    "id": "nature-L1-t4",
    "s": "Bacteria are a type of virus.",
    "answer": false,
    "why": "Bacteria and viruses are different kinds of microorganism; bacteria are living cells, viruses are not cells."
   },
   {
    "id": "nature-L1-t5",
    "s": "An insect has six legs.",
    "answer": true,
    "why": "All insects have six legs and a body in three parts."
   },
   {
    "id": "nature-L1-t6",
    "s": "All plants make their food by photosynthesis.",
    "answer": false,
    "why": "Some plants, such as parasitic plants, do not photosynthesise; fungi are not plants at all."
   },
   {
    "id": "nature-L1-t7",
    "s": "DNA carries genetic information.",
    "answer": true,
    "why": "DNA is the molecule that stores the instructions for building and running an organism."
   },
   {
    "id": "nature-L1-t8",
    "s": "Mammals are cold-blooded animals.",
    "answer": false,
    "why": "Mammals are warm-blooded; they keep a constant body temperature."
   },
   {
    "id": "nature-L1-t9",
    "s": "The lungs are part of the respiratory system.",
    "answer": true,
    "why": "The lungs exchange oxygen and carbon dioxide with the air."
   },
   {
    "id": "nature-L1-t10",
    "s": "Roots absorb water and minerals from the soil.",
    "answer": true,
    "why": "Roots take up water and dissolved minerals and anchor the plant."
   },
   {
    "id": "nature-L1-t11",
    "s": "A food chain always starts with an animal.",
    "answer": false,
    "why": "A food chain starts with a producer, usually a green plant."
   },
   {
    "id": "nature-L1-t12",
    "s": "Enzymes are proteins that speed up chemical reactions.",
    "answer": true,
    "why": "Enzymes are biological catalysts, and most are proteins."
   },
   {
    "id": "nature-L1-t13",
    "s": "Fish breathe air using lungs.",
    "answer": false,
    "why": "Fish absorb oxygen from water using gills."
   },
   {
    "id": "nature-L1-t14",
    "s": "The cell membrane controls what enters and leaves a cell.",
    "answer": true,
    "why": "The membrane is a selectively permeable barrier around the cell."
   },
   {
    "id": "nature-L1-t15",
    "s": "Viruses can be killed by antibiotics.",
    "answer": false,
    "why": "Antibiotics act on bacteria, not viruses."
   },
   {
    "id": "nature-L1-t16",
    "s": "Seeds need water to germinate.",
    "answer": true,
    "why": "Water is needed for germination, along with warmth and oxygen."
   },
   {
    "id": "nature-L1-t17",
    "s": "Fungi make their own food by photosynthesis.",
    "answer": false,
    "why": "Fungi cannot photosynthesise; they absorb nutrients from their surroundings."
   },
   {
    "id": "nature-L1-t18",
    "s": "Blood carries nutrients and oxygen to the body's cells.",
    "answer": true,
    "why": "Blood transports oxygen, nutrients and other substances around the body."
   }
  ],
  "terms": [
   {
    "id": "nature-L1-w1",
    "word": "NUCLEUS",
    "clue": "Control centre of a cell, holding the chromosomes"
   },
   {
    "id": "nature-L1-w2",
    "word": "HERBIVORE",
    "clue": "Animal that feeds only on plants"
   },
   {
    "id": "nature-L1-w3",
    "word": "ENZYME",
    "clue": "Protein that speeds up a chemical reaction in the body"
   },
   {
    "id": "nature-L1-w4",
    "word": "HABITAT",
    "clue": "The natural home of a plant or animal"
   },
   {
    "id": "nature-L1-w5",
    "word": "BACTERIA",
    "clue": "Tiny single-celled organisms, some of which cause disease"
   },
   {
    "id": "nature-L1-w6",
    "word": "SKELETON",
    "clue": "Framework of bones that supports the body"
   },
   {
    "id": "nature-L1-w7",
    "word": "DIGESTION",
    "clue": "Breaking down food into substances the body can absorb"
   }
  ]
 },
 "2": {
  "questions": [
   {
    "id": "nature-L2-q1",
    "q": "Which organelle is called the 'powerhouse' of the cell because it releases energy from food?",
    "options": [
     "Mitochondrion",
     "Nucleus",
     "Ribosome",
     "Vacuole"
    ],
    "answer": 0,
    "why": "Mitochondria carry out respiration, releasing energy from glucose.",
    "hint": "It has a folded inner membrane."
   },
   {
    "id": "nature-L2-q2",
    "q": "Which blood vessels carry blood away from the heart?",
    "options": [
     "Veins",
     "Capillaries",
     "Arteries",
     "Nerves"
    ],
    "answer": 2,
    "why": "Arteries carry blood away from the heart; veins return it.",
    "hint": "They have thick, elastic walls."
   },
   {
    "id": "nature-L2-q3",
    "q": "What is the green pigment in leaves that traps light energy called?",
    "options": [
     "Starch",
     "Chlorophyll",
     "Cellulose",
     "Glucose"
    ],
    "answer": 1,
    "why": "Chlorophyll absorbs light for photosynthesis.",
    "hint": "It gives leaves their colour."
   },
   {
    "id": "nature-L2-q4",
    "q": "Which of these is a vertebrate?",
    "options": [
     "Frog",
     "Jellyfish",
     "Snail",
     "Earthworm"
    ],
    "answer": 0,
    "why": "A frog has a backbone, so it is a vertebrate.",
    "hint": "Look for an animal with a spine."
   },
   {
    "id": "nature-L2-q5",
    "q": "Which gas do humans breathe out in the largest amount?",
    "options": [
     "Nitrogen",
     "Oxygen",
     "Carbon dioxide",
     "Hydrogen"
    ],
    "answer": 0,
    "why": "Exhaled air is mostly nitrogen, as is inhaled air.",
    "hint": "It makes up most of the air you breathe in."
   },
   {
    "id": "nature-L2-q6",
    "q": "What is the passing of features from parents to offspring called?",
    "options": [
     "Digestion",
     "Heredity",
     "Respiration",
     "Evolution"
    ],
    "answer": 1,
    "why": "Heredity is the transmission of characteristics from parents to children.",
    "hint": "It explains why children resemble parents."
   },
   {
    "id": "nature-L2-q7",
    "q": "Which part of the human digestive system absorbs most nutrients into the blood?",
    "options": [
     "Large intestine",
     "Oesophagus",
     "Small intestine",
     "Stomach"
    ],
    "answer": 2,
    "why": "The small intestine has a large folded surface for absorption.",
    "hint": "It is long and narrow, not the widest part."
   },
   {
    "id": "nature-L2-q8",
    "q": "Which of these is a producer in a food chain?",
    "options": [
     "Mushroom",
     "Fox",
     "Rabbit",
     "Grass"
    ],
    "answer": 3,
    "why": "Grass makes its own food by photosynthesis, so it is a producer.",
    "hint": "It is green and grows in sunlight."
   },
   {
    "id": "nature-L2-q9",
    "q": "Bacteria are best described as which type of organism?",
    "options": [
     "Fungi",
     "Viruses",
     "Microscopic single-celled organisms",
     "Protozoa"
    ],
    "answer": 2,
    "why": "Bacteria are single-celled organisms without a nucleus.",
    "hint": "They are far too small to see without a microscope."
   },
   {
    "id": "nature-L2-q10",
    "q": "Which process do plants use to make food from carbon dioxide and water?",
    "options": [
     "Photosynthesis",
     "Respiration",
     "Digestion",
     "Transpiration"
    ],
    "answer": 0,
    "why": "Photosynthesis uses light energy to make glucose from carbon dioxide and water.",
    "hint": "It needs light and chlorophyll."
   },
   {
    "id": "nature-L2-q11",
    "q": "Which of these is a reflex action?",
    "options": [
     "Blinking when something flies at your eye",
     "Reading a book",
     "Riding a bicycle",
     "Solving a puzzle"
    ],
    "answer": 0,
    "why": "Blinking is a fast, automatic response that protects the eye.",
    "hint": "It happens without you deciding to do it."
   },
   {
    "id": "nature-L2-q12",
    "q": "What is the main function of the roots of a plant?",
    "options": [
     "Absorbing water and minerals",
     "Attracting insects",
     "Making seeds",
     "Carrying out photosynthesis"
    ],
    "answer": 0,
    "why": "Roots anchor the plant and take up water and minerals from the soil.",
    "hint": "They are underground."
   },
   {
    "id": "nature-L2-q13",
    "q": "Which of these diseases is caused by a virus?",
    "options": [
     "Malaria",
     "Influenza",
     "Cholera",
     "Ringworm"
    ],
    "answer": 1,
    "why": "Influenza is caused by the influenza virus.",
    "hint": "It gives you a fever and aches each winter."
   }
  ],
  "truths": [
   {
    "id": "nature-L2-t1",
    "s": "The heart is a muscle that pumps blood around the body.",
    "answer": true,
    "why": "Cardiac muscle contracts to push blood through the vessels."
   },
   {
    "id": "nature-L2-t2",
    "s": "Plants take in oxygen only at night and release it only during the day.",
    "answer": false,
    "why": "Plants respire and take in oxygen all the time; they release oxygen only during photosynthesis in light."
   },
   {
    "id": "nature-L2-t3",
    "s": "Fish absorb oxygen from water using gills.",
    "answer": true,
    "why": "Gills take dissolved oxygen from the water."
   },
   {
    "id": "nature-L2-t4",
    "s": "All bacteria are harmful to humans.",
    "answer": false,
    "why": "Many bacteria are harmless or useful, such as those in the gut or in making yoghurt."
   },
   {
    "id": "nature-L2-t5",
    "s": "An insect has three pairs of legs.",
    "answer": true,
    "why": "Insects are defined by having six legs, in three pairs."
   },
   {
    "id": "nature-L2-t6",
    "s": "The nucleus of a cell contains the genetic material.",
    "answer": true,
    "why": "DNA is found mainly in the nucleus of eukaryotic cells."
   },
   {
    "id": "nature-L2-t7",
    "s": "Mammals are the only animals that give birth to live young.",
    "answer": false,
    "why": "Some reptiles and fish also give birth to live young; not all mammals do either (monotremes lay eggs)."
   },
   {
    "id": "nature-L2-t8",
    "s": "Fungi obtain their food by absorbing nutrients from their surroundings.",
    "answer": true,
    "why": "Fungi release enzymes and absorb the digested material."
   },
   {
    "id": "nature-L2-t9",
    "s": "During exercise, the breathing rate usually slows down.",
    "answer": false,
    "why": "Breathing rate increases during exercise to supply more oxygen."
   },
   {
    "id": "nature-L2-t10",
    "s": "A food chain always begins with a producer.",
    "answer": true,
    "why": "Producers capture energy from the sun, starting the chain."
   },
   {
    "id": "nature-L2-t11",
    "s": "The lungs are part of the circulatory system.",
    "answer": false,
    "why": "The lungs belong to the respiratory system."
   },
   {
    "id": "nature-L2-t12",
    "s": "Enzymes are proteins that speed up chemical reactions in the body.",
    "answer": true,
    "why": "Enzymes are biological catalysts made of protein."
   },
   {
    "id": "nature-L2-t13",
    "s": "All plants have flowers.",
    "answer": false,
    "why": "Ferns, mosses and conifers do not produce flowers."
   },
   {
    "id": "nature-L2-t14",
    "s": "Water moves from the roots to the leaves through tubes called xylem.",
    "answer": true,
    "why": "Xylem vessels transport water and minerals up the plant."
   },
   {
    "id": "nature-L2-t15",
    "s": "Viruses can be killed by antibiotics.",
    "answer": false,
    "why": "Antibiotics act on bacteria, not viruses."
   },
   {
    "id": "nature-L2-t16",
    "s": "The skull protects the brain.",
    "answer": true,
    "why": "Bones of the skull form a hard case around the brain."
   },
   {
    "id": "nature-L2-t17",
    "s": "In humans, the male parent determines the sex of the child.",
    "answer": true,
    "why": "The father supplies either an X or a Y chromosome."
   },
   {
    "id": "nature-L2-t18",
    "s": "Decomposers such as fungi and bacteria return nutrients to the soil.",
    "answer": true,
    "why": "They break down dead material, releasing minerals."
   }
  ],
  "terms": [
   {
    "id": "nature-L2-w1",
    "word": "ENZYME",
    "clue": "A protein that speeds up reactions in living things."
   },
   {
    "id": "nature-L2-w2",
    "word": "STOMATA",
    "clue": "Tiny pores on a leaf that let gases in and out."
   },
   {
    "id": "nature-L2-w3",
    "word": "SPINE",
    "clue": "The bony column that runs down the back."
   },
   {
    "id": "nature-L2-w4",
    "word": "POLLEN",
    "clue": "Fine dust made by flowers that carries male cells."
   },
   {
    "id": "nature-L2-w5",
    "word": "HABITAT",
    "clue": "The natural home of a plant or animal."
   },
   {
    "id": "nature-L2-w6",
    "word": "ANTIBODY",
    "clue": "A protein made by the body to fight germs."
   },
   {
    "id": "nature-L2-w7",
    "word": "GENE",
    "clue": "A unit of inheritance passed from parent to child."
   },
   {
    "id": "nature-L2-w8",
    "word": "LARVA",
    "clue": "The young form of an insect before it changes."
   },
   {
    "id": "nature-L2-w9",
    "word": "ORGAN",
    "clue": "A body part such as the heart or lung with a special job."
   }
  ]
 },
 "3": {
  "questions": [
   {
    "id": "nature-L3-q1",
    "q": "Which part of the human body produces insulin?",
    "options": [
     "Liver",
     "Kidneys",
     "Stomach",
     "Pancreas"
    ],
    "answer": 3,
    "why": "Insulin is a hormone made by the pancreas that helps control blood sugar levels.",
    "hint": "This organ also makes digestive enzymes."
   },
   {
    "id": "nature-L3-q2",
    "q": "What is the main function of white blood cells?",
    "options": [
     "Carrying oxygen",
     "Fighting infection",
     "Clotting blood",
     "Digesting food"
    ],
    "answer": 1,
    "why": "White blood cells defend the body against pathogens and foreign substances.",
    "hint": "They are part of the immune system."
   },
   {
    "id": "nature-L3-q3",
    "q": "Which structure in a plant cell controls what enters and leaves the cell?",
    "options": [
     "Vacuole",
     "Chloroplast",
     "Cell membrane",
     "Cell wall"
    ],
    "answer": 2,
    "why": "The cell membrane is a selectively permeable barrier around the cell.",
    "hint": "It is found in both plant and animal cells."
   },
   {
    "id": "nature-L3-q4",
    "q": "What is the name of the process by which water moves across a semi-permeable membrane from high to low concentration?",
    "options": [
     "Active transport",
     "Osmosis",
     "Evaporation",
     "Diffusion"
    ],
    "answer": 1,
    "why": "Osmosis is the movement of water molecules across a partially permeable membrane.",
    "hint": "It is a special type of diffusion involving water."
   },
   {
    "id": "nature-L3-q5",
    "q": "Which of these is a characteristic of all living things?",
    "options": [
     "They can move from place to place",
     "They respire",
     "They have leaves",
     "They make seeds"
    ],
    "answer": 1,
    "why": "All living organisms carry out respiration to release energy.",
    "hint": "Movement is not always possible for plants."
   },
   {
    "id": "nature-L3-q6",
    "q": "In a food chain, what do we call an organism that eats both plants and animals?",
    "options": [
     "Producer",
     "Herbivore",
     "Carnivore",
     "Omnivore"
    ],
    "answer": 3,
    "why": "An omnivore feeds on both plant and animal material.",
    "hint": "Humans are an example."
   },
   {
    "id": "nature-L3-q7",
    "q": "Which human organ is mainly responsible for absorbing water from undigested food?",
    "options": [
     "Liver",
     "Stomach",
     "Large intestine",
     "Small intestine"
    ],
    "answer": 2,
    "why": "The large intestine absorbs water and salts from waste material.",
    "hint": "It is wider and shorter than the small intestine."
   },
   {
    "id": "nature-L3-q8",
    "q": "What is the name of the tiny air sacs in the lungs where gas exchange takes place?",
    "options": [
     "Diaphragm",
     "Trachea",
     "Alveoli",
     "Bronchi"
    ],
    "answer": 2,
    "why": "Alveoli are tiny air sacs with thin walls and a rich blood supply for gas exchange.",
    "hint": "They look like bunches of grapes."
   },
   {
    "id": "nature-L3-q9",
    "q": "Which of these is a inherited characteristic in humans?",
    "options": [
     "Riding a bicycle",
     "Eye colour",
     "Speaking a language",
     "Having a scar"
    ],
    "answer": 1,
    "why": "Eye colour is determined by genes passed from parents to offspring.",
    "hint": "It is not learned after birth."
   },
   {
    "id": "nature-L3-q10",
    "q": "What is the main role of decomposers in an ecosystem?",
    "options": [
     "They provide oxygen",
     "They eat living plants",
     "They break down dead matter and recycle nutrients",
     "They produce food using sunlight"
    ],
    "answer": 2,
    "why": "Decomposers break down dead organisms and waste, releasing nutrients back into the soil.",
    "hint": "They include bacteria and fungi."
   },
   {
    "id": "nature-L3-q11",
    "q": "Which of these is a viral disease?",
    "options": [
     "Influenza",
     "Ringworm",
     "Cholera",
     "Tuberculosis"
    ],
    "answer": 0,
    "why": "Influenza is caused by a virus, while cholera and tuberculosis are bacterial and ringworm is fungal.",
    "hint": "It causes the flu."
   },
   {
    "id": "nature-L3-q12",
    "q": "What is the name of the process by which a plant loses water vapour through its leaves?",
    "options": [
     "Photosynthesis",
     "Germination",
     "Transpiration",
     "Respiration"
    ],
    "answer": 2,
    "why": "Transpiration is the loss of water vapour from plant leaves, mainly through stomata.",
    "hint": "It helps pull water up from the roots."
   },
   {
    "id": "nature-L3-q13",
    "q": "Which part of the human eye controls the amount of light entering?",
    "options": [
     "Iris",
     "Optic nerve",
     "Retina",
     "Cornea"
    ],
    "answer": 0,
    "why": "The iris muscles adjust the size of the pupil to control light entering the eye.",
    "hint": "It gives the eye its colour."
   }
  ],
  "truths": [
   {
    "id": "nature-L3-t1",
    "s": "The heart has four chambers: two atria and two ventricles.",
    "answer": true,
    "why": "The human heart has two upper atria and two lower ventricles."
   },
   {
    "id": "nature-L3-t2",
    "s": "Arteries always carry oxygenated blood.",
    "answer": false,
    "why": "The pulmonary artery carries deoxygenated blood from the heart to the lungs."
   },
   {
    "id": "nature-L3-t3",
    "s": "Plants make their own food using light energy, carbon dioxide and water.",
    "answer": true,
    "why": "This is the process of photosynthesis."
   },
   {
    "id": "nature-L3-t4",
    "s": "Bacteria are always harmful to humans.",
    "answer": false,
    "why": "Many bacteria are beneficial, such as those in the gut that help digestion."
   },
   {
    "id": "nature-L3-t5",
    "s": "DNA carries genetic information from parents to offspring.",
    "answer": true,
    "why": "DNA contains the instructions for inherited traits."
   },
   {
    "id": "nature-L3-t6",
    "s": "All fungi are unicellular.",
    "answer": false,
    "why": "Many fungi, such as mushrooms, are multicellular."
   },
   {
    "id": "nature-L3-t7",
    "s": "The small intestine is longer than the large intestine.",
    "answer": true,
    "why": "The small intestine is about 6 metres long, while the large intestine is about 1.5 metres."
   },
   {
    "id": "nature-L3-t8",
    "s": "Insulin is produced by the liver.",
    "answer": false,
    "why": "Insulin is produced by the pancreas."
   },
   {
    "id": "nature-L3-t9",
    "s": "A vaccine helps the body develop immunity against a disease.",
    "answer": true,
    "why": "Vaccines stimulate the immune system to recognise and fight pathogens."
   },
   {
    "id": "nature-L3-t10",
    "s": "In a food chain, energy is lost at each level.",
    "answer": true,
    "why": "Only about 10% of energy is passed on to the next trophic level."
   },
   {
    "id": "nature-L3-t11",
    "s": "Fish breathe using lungs.",
    "answer": false,
    "why": "Fish breathe using gills to extract oxygen from water."
   },
   {
    "id": "nature-L3-t12",
    "s": "Enzymes are biological catalysts that speed up reactions.",
    "answer": true,
    "why": "Enzymes are proteins that catalyse biochemical reactions."
   },
   {
    "id": "nature-L3-t13",
    "s": "The cell wall is found in animal cells.",
    "answer": false,
    "why": "Animal cells do not have a cell wall; plant cells do."
   },
   {
    "id": "nature-L3-t14",
    "s": "Photosynthesis takes place in the chloroplasts of plant cells.",
    "answer": true,
    "why": "Chloroplasts contain chlorophyll and are the site of photosynthesis."
   },
   {
    "id": "nature-L3-t15",
    "s": "Viruses can reproduce on their own without a host cell.",
    "answer": false,
    "why": "Viruses need a host cell to reproduce."
   },
   {
    "id": "nature-L3-t16",
    "s": "The pancreas produces digestive enzymes.",
    "answer": true,
    "why": "The pancreas produces enzymes like amylase and protease."
   },
   {
    "id": "nature-L3-t17",
    "s": "Roots absorb water and minerals from the soil.",
    "answer": true,
    "why": "Roots have root hair cells to absorb water and minerals."
   },
   {
    "id": "nature-L3-t18",
    "s": "All plants have flowers.",
    "answer": false,
    "why": "Some plants, like ferns and mosses, do not have flowers."
   }
  ],
  "terms": [
   {
    "id": "nature-L3-w1",
    "word": "ENZYME",
    "clue": "A protein that speeds up chemical reactions in the body."
   },
   {
    "id": "nature-L3-w2",
    "word": "ALVEOLI",
    "clue": "Tiny air sacs in the lungs where gas exchange occurs."
   },
   {
    "id": "nature-L3-w3",
    "word": "OSMOSIS",
    "clue": "Movement of water across a semi-permeable membrane."
   },
   {
    "id": "nature-L3-w4",
    "word": "VACCINE",
    "clue": "A substance that stimulates immunity against a disease."
   },
   {
    "id": "nature-L3-w5",
    "word": "ECOSYSTEM",
    "clue": "A community of organisms and their physical environment."
   },
   {
    "id": "nature-L3-w6",
    "word": "GENETICS",
    "clue": "The study of heredity and the variation of inherited traits."
   },
   {
    "id": "nature-L3-w7",
    "word": "BACTERIA",
    "clue": "Single-celled microorganisms that can be beneficial or harmful."
   }
  ]
 },
 "4": {
  "questions": [
   {
    "id": "nature-L4-q1",
    "q": "A cell is placed in a solution with a much higher water potential than its cytoplasm. What will most likely happen to an animal cell?",
    "options": [
     "It will stay exactly the same",
     "It will swell and may burst",
     "It will make a cell wall",
     "It will shrink and shrivel"
    ],
    "answer": 1,
    "why": "Water enters by osmosis when the outside solution has a higher water potential, so the animal cell swells and may lyse because it has no cell wall.",
    "hint": "Think about which way water moves across the membrane."
   },
   {
    "id": "nature-L4-q2",
    "q": "Which statement best explains why a person who lacks iron in the diet becomes tired easily?",
    "options": [
     "Carbon dioxide is not removed by the lungs",
     "Red blood cells cannot make antibodies",
     "The heart cannot pump blood as fast",
     "Less haemoglobin is made, so less oxygen is carried"
    ],
    "answer": 3,
    "why": "Iron is needed to make haemoglobin, which carries oxygen; less oxygen reaching muscles causes tiredness.",
    "hint": "Link the mineral to the oxygen-carrying pigment in red cells."
   },
   {
    "id": "nature-L4-q3",
    "q": "A plant is kept in darkness for several days. Which change is most likely to be observed?",
    "options": [
     "The plant produces more oxygen",
     "The leaves turn bright green",
     "Starch disappears from the leaves",
     "Roots stop absorbing water"
    ],
    "answer": 2,
    "why": "Without light, photosynthesis stops, so no new starch is made and existing starch is used up or transported away.",
    "hint": "Ask what happens when the light-dependent process stops."
   },
   {
    "id": "nature-L4-q4",
    "q": "In a cross between two heterozygous tall pea plants (Tt × Tt), what fraction of the offspring is expected to show the recessive short phenotype?",
    "options": [
     "All of them",
     "One quarter",
     "One half",
     "Three quarters"
    ],
    "answer": 1,
    "why": "The expected genotypes are TT, Tt, Tt and tt, so one quarter (tt) shows the recessive short trait.",
    "hint": "Draw a simple 2 × 2 genetic cross."
   },
   {
    "id": "nature-L4-q5",
    "q": "Which feature of an insect's gas exchange system allows rapid diffusion of oxygen directly to its tissues?",
    "options": [
     "A network of tracheae and tracheoles",
     "Lungs with many alveoli",
     "Gills with a counter-current flow",
     "A closed blood system with haemoglobin"
    ],
    "answer": 0,
    "why": "Insects use tracheae and fine tracheoles that carry air directly to cells, so oxygen diffuses straight to the tissues.",
    "hint": "Insects do not use lungs; think of tubes."
   },
   {
    "id": "nature-L4-q6",
    "q": "A student counts 40 bacteria at the start of an experiment and the number doubles every 30 minutes. How many bacteria are present after 2 hours?",
    "options": [
     "1280",
     "320",
     "640",
     "160"
    ],
    "answer": 2,
    "why": "Two hours is four 30-minute intervals, so the number is 40 × 2⁴ = 40 × 16 = 640.",
    "hint": "Count how many doubling steps fit into two hours."
   },
   {
    "id": "nature-L4-q7",
    "q": "Which of these best describes the role of a vaccine?",
    "options": [
     "It kills all bacteria in the blood immediately",
     "It stimulates an immune response and memory cells",
     "It provides ready-made antibodies permanently",
     "It replaces damaged red blood cells"
    ],
    "answer": 1,
    "why": "A vaccine exposes the body to harmless antigens so it makes antibodies and memory cells for future protection.",
    "hint": "Think about how the body 'remembers' a pathogen."
   },
   {
    "id": "nature-L4-q8",
    "q": "A food chain is: grass → grasshopper → frog → snake. If the snakes are removed, what is the most likely short-term effect?",
    "options": [
     "The frog population increases",
     "The grass population falls sharply",
     "The frogs become producers",
     "The grasshopper population falls"
    ],
    "answer": 0,
    "why": "With fewer predators, the frog population is likely to rise because fewer frogs are eaten.",
    "hint": "Consider which organism is eaten by the snake."
   },
   {
    "id": "nature-L4-q9",
    "q": "Which of these is the best explanation for why enzymes are described as specific?",
    "options": [
     "Enzymes can catalyse any reaction",
     "Each enzyme's active site fits only certain substrates",
     "Enzymes work only at one temperature",
     "Enzymes are used up during reactions"
    ],
    "answer": 1,
    "why": "The shape of the active site is complementary to a particular substrate, so each enzyme catalyses only certain reactions.",
    "hint": "Think about shape and fit."
   },
   {
    "id": "nature-L4-q10",
    "q": "A person's urine contains glucose. Which organ is most likely to be malfunctioning?",
    "options": [
     "The pancreas, which produces insulin",
     "The kidneys, which make urine",
     "The liver, which makes bile",
     "The lungs, which exchange gases"
    ],
    "answer": 0,
    "why": "Insulin lowers blood glucose; if it is insufficient, glucose can appear in the urine, pointing to the pancreas.",
    "hint": "Which hormone controls blood glucose concentration?"
   },
   {
    "id": "nature-L4-q11",
    "q": "Which of these is a correct description of anaerobic respiration in human muscle?",
    "options": [
     "Lactic acid is broken down to glucose using oxygen",
     "Glucose is converted to ethanol and carbon dioxide",
     "Glucose is broken down to carbon dioxide and water with oxygen",
     "Glucose is broken down to lactic acid, releasing little energy"
    ],
    "answer": 3,
    "why": "In human muscle without enough oxygen, glucose is converted to lactic acid and only a small amount of energy is released.",
    "hint": "Remember what builds up in muscles during hard exercise."
   },
   {
    "id": "nature-L4-q12",
    "q": "Which of these would most directly reduce the rate of transpiration in a leafy shoot?",
    "options": [
     "Increasing the wind speed",
     "Increasing the light intensity",
     "Raising the temperature",
     "Increasing the humidity of the surrounding air"
    ],
    "answer": 3,
    "why": "High humidity reduces the water potential gradient between the leaf and the air, so less water evaporates and transpiration slows.",
    "hint": "Transpiration depends on the water vapour gradient."
   },
   {
    "id": "nature-L4-q13",
    "q": "Two organisms are classified in the same genus but different species. Which statement is correct?",
    "options": [
     "They belong to different kingdoms",
     "They cannot share any features",
     "They are the same species",
     "They are closely related but cannot normally interbreed to produce fertile offspring"
    ],
    "answer": 3,
    "why": "Members of different species in the same genus are closely related but usually cannot produce fertile offspring together.",
    "hint": "Recall the definition of a species."
   }
  ],
  "truths": [
   {
    "id": "nature-L4-t1",
    "s": "Osmosis is the movement of water molecules from a region of higher water potential to a region of lower water potential through a partially permeable membrane.",
    "answer": true,
    "why": "This is the standard definition of osmosis."
   },
   {
    "id": "nature-L4-t2",
    "s": "All bacteria are harmful to humans and cause disease.",
    "answer": false,
    "why": "Many bacteria are harmless or beneficial, such as those in the gut and in food production."
   },
   {
    "id": "nature-L4-t3",
    "s": "In humans, the exchange of gases in the lungs takes place across the walls of the alveoli.",
    "answer": true,
    "why": "Alveoli are the tiny air sacs where oxygen and carbon dioxide diffuse across thin walls."
   },
   {
    "id": "nature-L4-t4",
    "s": "Photosynthesis takes place mainly in the mitochondria of plant cells.",
    "answer": false,
    "why": "Photosynthesis occurs in the chloroplasts; mitochondria are the site of aerobic respiration."
   },
   {
    "id": "nature-L4-t5",
    "s": "A dominant allele is expressed in the phenotype even when only one copy is present.",
    "answer": true,
    "why": "A dominant allele shows its effect whether the organism is heterozygous or homozygous for it."
   },
   {
    "id": "nature-L4-t6",
    "s": "Insulin is a hormone that raises blood glucose concentration.",
    "answer": false,
    "why": "Insulin lowers blood glucose concentration; glucagon raises it."
   },
   {
    "id": "nature-L4-t7",
    "s": "Decomposers such as fungi and bacteria return nutrients to the soil.",
    "answer": true,
    "why": "They break down dead material and release mineral ions into the soil."
   },
   {
    "id": "nature-L4-t8",
    "s": "Viruses can reproduce on their own without a host cell.",
    "answer": false,
    "why": "Viruses need a host cell's machinery to replicate; they cannot reproduce independently."
   },
   {
    "id": "nature-L4-t9",
    "s": "Enzymes are biological catalysts that are not used up in the reactions they catalyse.",
    "answer": true,
    "why": "Enzymes speed up reactions and remain unchanged, so they can be reused."
   },
   {
    "id": "nature-L4-t10",
    "s": "The xylem carries sugars from the leaves to the rest of the plant.",
    "answer": false,
    "why": "Xylem carries water and mineral ions; phloem carries sugars."
   },
   {
    "id": "nature-L4-t11",
    "s": "Antibiotics are effective against viral infections such as the common cold.",
    "answer": false,
    "why": "Antibiotics target bacteria and do not work against viruses."
   },
   {
    "id": "nature-L4-t12",
    "s": "A food chain always begins with a producer.",
    "answer": true,
    "why": "Producers, usually plants or algae, capture energy from sunlight and start the chain."
   },
   {
    "id": "nature-L4-t13",
    "s": "In the human body, the small intestine is the main site of nutrient absorption.",
    "answer": true,
    "why": "The small intestine has a large surface area with villi for absorbing nutrients."
   },
   {
    "id": "nature-L4-t14",
    "s": "Mitosis produces four genetically different daughter cells.",
    "answer": false,
    "why": "Mitosis produces two genetically identical daughter cells; meiosis produces four different ones."
   },
   {
    "id": "nature-L4-t15",
    "s": "Natural selection can lead to evolution when some individuals are better adapted to their environment.",
    "answer": true,
    "why": "Better-adapted individuals survive and reproduce more, so their alleles increase in frequency."
   },
   {
    "id": "nature-L4-t16",
    "s": "White blood cells mainly transport oxygen around the body.",
    "answer": false,
    "why": "Red blood cells transport oxygen; white blood cells defend against pathogens."
   },
   {
    "id": "nature-L4-t17",
    "s": "The cell wall of a plant cell is made mainly of cellulose.",
    "answer": true,
    "why": "Cellulose is the main structural polysaccharide of plant cell walls."
   },
   {
    "id": "nature-L4-t18",
    "s": "Anaerobic respiration in yeast produces lactic acid and carbon dioxide.",
    "answer": false,
    "why": "Yeast produces ethanol and carbon dioxide during anaerobic respiration."
   }
  ],
  "terms": [
   {
    "id": "nature-L4-w1",
    "word": "OSMOSIS",
    "clue": "Movement of water across a partially permeable membrane down a water potential gradient."
   },
   {
    "id": "nature-L4-w2",
    "word": "CHLOROPLAST",
    "clue": "Organelle in plant cells where light energy is used to make food."
   },
   {
    "id": "nature-L4-w3",
    "word": "HAEMOGLOBIN",
    "clue": "Red pigment in red blood cells that carries oxygen."
   },
   {
    "id": "nature-L4-w4",
    "word": "ALVEOLUS",
    "clue": "Tiny air sac in the lungs where gas exchange occurs."
   },
   {
    "id": "nature-L4-w5",
    "word": "MEIOSIS",
    "clue": "Cell division that produces gametes with half the chromosome number."
   },
   {
    "id": "nature-L4-w6",
    "word": "ECOSYSTEM",
    "clue": "Community of organisms interacting with each other and their environment."
   },
   {
    "id": "nature-L4-w7",
    "word": "ANTIBODY",
    "clue": "Protein made by white blood cells that binds to a specific antigen."
   },
   {
    "id": "nature-L4-w8",
    "word": "ENZYME",
    "clue": "Biological catalyst that speeds up a reaction without being used up."
   }
  ]
 },
 "5": {
  "questions": [
   {
    "id": "nature-L5-q1",
    "q": "Why does a person with iron-deficiency anaemia often feel tired?",
    "options": [
     "Their lungs cannot expand fully during breathing",
     "Their red blood cells carry less oxygen to respiring muscles",
     "Their white blood cells cannot fight infection",
     "Their kidneys remove too much water from the blood"
    ],
    "answer": 1,
    "why": "Iron is needed to make haemoglobin, which carries oxygen; less oxygen reaches muscles, so less aerobic respiration occurs.",
    "hint": "Link iron to haemoglobin and then to respiration."
   },
   {
    "id": "nature-L5-q2",
    "q": "A bean seedling is kept in complete darkness for a week. Which observation is most likely?",
    "options": [
     "The leaves turn dark green and grow wider",
     "The roots stop growing and the plant flowers",
     "The plant produces more oxygen than in light",
     "The stem grows tall and thin with yellow leaves"
    ],
    "answer": 3,
    "why": "Without light, chlorophyll is not maintained and photosynthesis cannot occur, so growth is spindly and leaves pale (etiolation).",
    "hint": "Think about what light is needed for in a plant."
   },
   {
    "id": "nature-L5-q3",
    "q": "In a cross Tt × Tt, what fraction of the offspring is expected to show the recessive phenotype?",
    "options": [
     "1/2",
     "3/4",
     "0",
     "1/4"
    ],
    "answer": 3,
    "why": "The expected genotypes are 1 TT : 2 Tt : 1 tt, so only the tt quarter shows the recessive phenotype.",
    "hint": "Draw a simple genetic diagram with four boxes."
   },
   {
    "id": "nature-L5-q4",
    "q": "Which feature of an insect's tracheal system allows oxygen to reach tissues rapidly?",
    "options": [
     "Gills extract oxygen from water flowing over them",
     "Air-filled tubes branch directly to the cells",
     "Blood carries oxygen at high pressure through closed vessels",
     "Lungs with many alveoli increase the surface area"
    ],
    "answer": 1,
    "why": "Tracheae and tracheoles deliver air close to every cell, so gases diffuse over a short distance without needing blood transport.",
    "hint": "Consider how close the air gets to the respiring cells."
   },
   {
    "id": "nature-L5-q5",
    "q": "A bacterial population doubles every 30 minutes. Starting with 40 bacteria, how many are present after 2 hours?",
    "options": [
     "640",
     "320",
     "1280",
     "160"
    ],
    "answer": 0,
    "why": "Two hours is four doubling periods: 40 × 2⁴ = 40 × 16 = 640.",
    "hint": "Count how many times the population doubles in 120 minutes."
   },
   {
    "id": "nature-L5-q6",
    "q": "Which statement best explains why enzymes are described as specific?",
    "options": [
     "They are used up completely in each reaction",
     "Their active site shape fits only certain substrates",
     "They catalyse every reaction in the cell equally",
     "They work only at one particular temperature"
    ],
    "answer": 1,
    "why": "The active site is complementary in shape to a particular substrate, so only that substrate forms an enzyme–substrate complex.",
    "hint": "Think about shape and fit at the active site."
   },
   {
    "id": "nature-L5-q7",
    "q": "A patient's urine contains glucose but blood tests show normal insulin levels. Which organ is most likely malfunctioning?",
    "options": [
     "The liver, which stores glycogen",
     "The kidney, which reabsorbs glucose from filtrate",
     "The pancreas, which secretes insulin",
     "The small intestine, which absorbs glucose"
    ],
    "answer": 1,
    "why": "Normally all glucose is reabsorbed in the kidney tubules; glucose in urine with normal insulin points to faulty reabsorption in the kidney.",
    "hint": "Which organ filters blood and reabsorbs useful molecules?"
   },
   {
    "id": "nature-L5-q8",
    "q": "Which description of anaerobic respiration in human muscle is correct?",
    "options": [
     "Glucose is completely oxidised to carbon dioxide and water",
     "Glucose is broken down to lactic acid, releasing little energy",
     "Fatty acids are converted to glycogen without oxygen",
     "Glucose is broken down to ethanol and carbon dioxide"
    ],
    "answer": 1,
    "why": "In muscles, glucose is converted to lactic acid anaerobically, releasing much less energy than aerobic respiration.",
    "hint": "Recall what builds up in muscles during vigorous exercise."
   },
   {
    "id": "nature-L5-q9",
    "q": "Which change would most directly reduce the rate of transpiration in a leafy shoot?",
    "options": [
     "Increasing the humidity of the surrounding air",
     "Increasing the light intensity on the leaves",
     "Increasing the wind speed around the shoot",
     "Increasing the temperature of the room"
    ],
    "answer": 0,
    "why": "High humidity reduces the water potential gradient between leaf air spaces and the outside air, slowing diffusion of water vapour.",
    "hint": "Transpiration depends on a diffusion gradient for water vapour."
   },
   {
    "id": "nature-L5-q10",
    "q": "Two organisms belong to the same genus but different species. Which statement must be correct?",
    "options": [
     "They have identical DNA sequences",
     "They are in different families",
     "They share more features with each other than with members of another genus",
     "They can always interbreed to produce fertile offspring"
    ],
    "answer": 2,
    "why": "Genus is a higher, broader rank than species, so members of one genus share more characteristics than they do with members of another genus.",
    "hint": "Think about the order of classification ranks."
   },
   {
    "id": "nature-L5-q11",
    "q": "In the food chain grass → grasshopper → frog → snake, what is the most likely short-term effect of removing the snakes?",
    "options": [
     "The grass population falls sharply",
     "The frog population initially increases",
     "The grasshopper population disappears",
     "The frogs become producers"
    ],
    "answer": 1,
    "why": "With fewer predators, frog numbers rise initially; more frogs then eat more grasshoppers, so the effect cascades down the chain.",
    "hint": "Follow the effect one trophic level at a time."
   },
   {
    "id": "nature-L5-q12",
    "q": "Which statement about a vaccine is correct?",
    "options": [
     "It contains antibiotics that kill pathogens directly",
     "It stimulates the body to produce antibodies and memory cells",
     "It provides immediate lifelong immunity without any immune response",
     "It cures a disease that is already fully developed"
    ],
    "answer": 1,
    "why": "Vaccines expose the immune system to antigens, triggering antibody production and memory cells for future protection.",
    "hint": "Think about how the immune system responds to antigens."
   }
  ],
  "truths": [
   {
    "id": "nature-L5-t1",
    "s": "Osmosis is the net movement of water molecules from a region of higher water potential to a region of lower water potential through a partially permeable membrane.",
    "answer": true,
    "why": "This is the standard definition of osmosis in biology textbooks."
   },
   {
    "id": "nature-L5-t2",
    "s": "All bacteria are harmful pathogens that cause disease in humans.",
    "answer": false,
    "why": "Most bacteria are harmless or beneficial; only some are pathogens."
   },
   {
    "id": "nature-L5-t3",
    "s": "In humans, the sex of a child is determined by the sex chromosome carried by the sperm.",
    "answer": true,
    "why": "Sperm carry either X or Y, while the egg carries X, so the sperm determines sex."
   },
   {
    "id": "nature-L5-t4",
    "s": "During photosynthesis, plants take in oxygen and release carbon dioxide.",
    "answer": false,
    "why": "Plants take in carbon dioxide and release oxygen during photosynthesis."
   },
   {
    "id": "nature-L5-t5",
    "s": "Insulin lowers blood glucose concentration by stimulating cells to take up glucose and the liver to store it as glycogen.",
    "answer": true,
    "why": "This is the main action of insulin in glucose regulation."
   },
   {
    "id": "nature-L5-t6",
    "s": "Arteries always carry oxygenated blood and veins always carry deoxygenated blood.",
    "answer": false,
    "why": "The pulmonary artery carries deoxygenated blood and the pulmonary vein carries oxygenated blood."
   },
   {
    "id": "nature-L5-t7",
    "s": "Enzymes are biological catalysts that lower the activation energy of reactions.",
    "answer": true,
    "why": "Enzymes speed up reactions by lowering activation energy without being used up."
   },
   {
    "id": "nature-L5-t8",
    "s": "In a food chain, energy is transferred completely from one trophic level to the next.",
    "answer": false,
    "why": "Only about 10% of energy is transferred; much is lost as heat and in waste."
   },
   {
    "id": "nature-L5-t9",
    "s": "Fungi obtain nutrients by absorbing soluble substances after digesting material externally.",
    "answer": true,
    "why": "Fungi are heterotrophs that secrete enzymes and absorb the products."
   },
   {
    "id": "nature-L5-t10",
    "s": "Antibiotics are effective against viral infections such as influenza.",
    "answer": false,
    "why": "Antibiotics target bacteria, not viruses; they do not treat viral infections."
   },
   {
    "id": "nature-L5-t11",
    "s": "Mitochondria are the site of aerobic respiration in eukaryotic cells.",
    "answer": true,
    "why": "Mitochondria house the reactions of aerobic respiration."
   },
   {
    "id": "nature-L5-t12",
    "s": "In humans, a zygote contains half the normal number of chromosomes.",
    "answer": false,
    "why": "A zygote is diploid, formed by fusion of two haploid gametes."
   },
   {
    "id": "nature-L5-t13",
    "s": "Transpiration is the loss of water vapour from plant surfaces, mainly through stomata.",
    "answer": true,
    "why": "Most transpiration occurs through stomata in the leaves."
   },
   {
    "id": "nature-L5-t14",
    "s": "Genotype refers to the observable characteristics of an organism.",
    "answer": false,
    "why": "Genotype is the genetic makeup; phenotype is the observable characteristics."
   },
   {
    "id": "nature-L5-t15",
    "s": "White blood cells called phagocytes engulf and digest pathogens by phagocytosis.",
    "answer": true,
    "why": "Phagocytes carry out phagocytosis as part of the immune response."
   },
   {
    "id": "nature-L5-t16",
    "s": "Plants respire only at night and photosynthesise only during the day.",
    "answer": false,
    "why": "Plants respire continuously, day and night; photosynthesis occurs only in light."
   },
   {
    "id": "nature-L5-t17",
    "s": "A mutation in a gene can sometimes produce a new allele that changes the protein made.",
    "answer": true,
    "why": "Mutations alter DNA sequence and can change the protein produced."
   },
   {
    "id": "nature-L5-t18",
    "s": "The villi in the small intestine reduce the surface area for absorption.",
    "answer": false,
    "why": "Villi increase the surface area for absorption."
   }
  ],
  "terms": [
   {
    "id": "nature-L5-w1",
    "word": "CHLOROPLAST",
    "clue": "Organelle in plant cells where photosynthesis takes place"
   },
   {
    "id": "nature-L5-w2",
    "word": "DIFFUSION",
    "clue": "Net movement of particles from high to low concentration"
   },
   {
    "id": "nature-L5-w3",
    "word": "PHAGOCYTE",
    "clue": "White blood cell that engulfs and digests pathogens"
   },
   {
    "id": "nature-L5-w4",
    "word": "PHENOTYPE",
    "clue": "Observable characteristics of an organism determined by genes and environment"
   },
   {
    "id": "nature-L5-w5",
    "word": "STOMATA",
    "clue": "Pores in leaves that allow gas exchange"
   },
   {
    "id": "nature-L5-w6",
    "word": "VACCINE",
    "clue": "Preparation that stimulates immunity against a pathogen"
   },
   {
    "id": "nature-L5-w7",
    "word": "GLYCOLYSIS",
    "clue": "First stage of respiration, breaking glucose into pyruvate"
   },
   {
    "id": "nature-L5-w8",
    "word": "HOMEOSTASIS",
    "clue": "Maintenance of a stable internal environment in the body"
   },
   {
    "id": "nature-L5-w9",
    "word": "BIODIVERSITY",
    "clue": "Variety of species and genetic variation in an ecosystem"
   }
  ]
 },
 "6": {
  "questions": [
   {
    "id": "nature-L6-q1",
    "q": "A red blood cell is placed in distilled water and swells until it bursts. Which property of the cell membrane best explains this?",
    "options": [
     "It actively pumps water inwards",
     "It is rigid and impermeable",
     "It is fully permeable to solutes",
     "It is partially permeable"
    ],
    "answer": 3,
    "why": "The membrane is partially permeable: water enters by osmosis down a water potential gradient but solutes cannot freely follow, so the cell swells and lyses.",
    "hint": "Think about which particles can cross the membrane freely and which cannot."
   },
   {
    "id": "nature-L6-q2",
    "q": "In the light-dependent reactions of photosynthesis, which statement correctly describes what happens to water?",
    "options": [
     "It is split, releasing oxygen and providing electrons and protons",
     "It acts as the final electron acceptor in the chain",
     "It is combined with carbon dioxide to form glucose",
     "It is reduced to hydrogen gas by NADP"
    ],
    "answer": 0,
    "why": "Photolysis of water supplies electrons to replace those lost by photosystem II and releases oxygen and protons.",
    "hint": "Consider where the oxygen released in photosynthesis actually comes from."
   },
   {
    "id": "nature-L6-q3",
    "q": "A mutation changes one base in a gene but the amino acid sequence of the protein is unchanged. Which term best describes this mutation?",
    "options": [
     "Silent",
     "Missense",
     "Nonsense",
     "Frameshift"
    ],
    "answer": 0,
    "why": "A silent mutation alters a codon but, because the genetic code is degenerate, still codes for the same amino acid.",
    "hint": "The genetic code has more codons than amino acids."
   },
   {
    "id": "nature-L6-q4",
    "q": "Which sequence correctly describes the path of blood through the mammalian heart?",
    "options": [
     "Right atrium → left atrium → lungs → right ventricle → left ventricle",
     "Left atrium → left ventricle → lungs → right atrium → right ventricle",
     "Left ventricle → lungs → right ventricle → right atrium → left atrium",
     "Right atrium → right ventricle → lungs → left atrium → left ventricle"
    ],
    "answer": 3,
    "why": "Deoxygenated blood enters the right atrium, passes to the right ventricle and lungs, then returns to the left atrium and left ventricle before the aorta.",
    "hint": "Blood must visit the lungs before being pumped around the body."
   },
   {
    "id": "nature-L6-q5",
    "q": "Enzyme activity rises with temperature up to an optimum and then falls sharply. Which explanation for the fall is correct?",
    "options": [
     "The active site is denatured so substrate no longer fits",
     "The substrate molecules stop moving at high temperature",
     "The enzyme is used up faster than it is made",
     "The pH of the solution falls as temperature rises"
    ],
    "answer": 0,
    "why": "Above the optimum, heat breaks bonds holding the enzyme's tertiary structure, distorting the active site so enzyme–substrate complexes cannot form.",
    "hint": "Think about the shape of the protein, not the energy of the particles."
   },
   {
    "id": "nature-L6-q6",
    "q": "Two heterozygous parents, both with blood group A (genotype IAi), have a child. What is the probability the child has blood group O?",
    "options": [
     "3 in 4",
     "0",
     "1 in 2",
     "1 in 4"
    ],
    "answer": 3,
    "why": "Each parent can pass on i, so ii offspring occur with probability ½ × ½ = ¼, giving group O.",
    "hint": "Work out the gametes each parent can produce, then use a Punnett square."
   },
   {
    "id": "nature-L6-q7",
    "q": "In an insect, air reaches the tissues through a system of tubes. Which feature most directly supports rapid gas exchange?",
    "options": [
     "The tubes are filled with water that dissolves oxygen",
     "Haemoglobin in the blood carries oxygen to the cells",
     "Tracheoles run directly to respiring cells and are filled with air",
     "Gases diffuse only through the exoskeleton"
    ],
    "answer": 2,
    "why": "The tracheal system delivers air close to every cell, so oxygen diffuses over a very short distance without needing blood transport.",
    "hint": "Consider the distance oxygen must travel to reach a muscle cell."
   },
   {
    "id": "nature-L6-q8",
    "q": "A bacterial culture starts with 200 cells and doubles every 20 minutes. How many cells are present after 2 hours?",
    "options": [
     "25600",
     "2400",
     "6400",
     "12800"
    ],
    "answer": 3,
    "why": "Two hours is six doubling times, so 200 × 2⁶ = 200 × 64 = 12 800 cells.",
    "hint": "Count how many 20-minute intervals fit into 2 hours."
   },
   {
    "id": "nature-L6-q9",
    "q": "Which statement best explains why a person with a blocked bile duct may struggle to digest fatty foods?",
    "options": [
     "Bile salts emulsify fats, increasing the surface area for lipase",
     "Bile contains lipase that hydrolyses triglycerides",
     "Bile neutralises stomach acid to activate pepsin",
     "Bile absorbs fatty acids directly into the blood"
    ],
    "answer": 0,
    "why": "Bile salts emulsify fats into small droplets, raising the surface area on which lipase can act; without bile, fat digestion is much slower.",
    "hint": "Think about the physical form of fat, not a chemical breakdown."
   },
   {
    "id": "nature-L6-q10",
    "q": "Which statement about the greenhouse effect is correct?",
    "options": [
     "Greenhouse gases destroy the ozone layer directly",
     "Greenhouse gases absorb and re-emit infrared radiation emitted by the Earth",
     "Greenhouse gases absorb incoming ultraviolet radiation from the Sun",
     "Greenhouse gases reflect visible light back towards space"
    ],
    "answer": 1,
    "why": "Greenhouse gases such as carbon dioxide absorb long-wave infrared radiated by the warm Earth and re-emit it in all directions, warming the surface.",
    "hint": "Consider which wavelength of radiation the warm Earth gives off."
   },
   {
    "id": "nature-L6-q11",
    "q": "Two populations of the same species become separated by a river for many generations. Which process is most likely to lead to them becoming separate species?",
    "options": [
     "Random mating between members of the two populations",
     "Identical selection pressures acting on both populations",
     "Increased gene flow between the two populations",
     "Accumulation of different mutations and selection in each population"
    ],
    "answer": 3,
    "why": "Geographic isolation stops gene flow, so mutations and selection act independently in each population until reproductive isolation evolves.",
    "hint": "Think about what happens to gene flow when populations are separated."
   },
   {
    "id": "nature-L6-q12",
    "q": "Which statement about the role of NAD in respiration is correct?",
    "options": [
     "It is oxidised to NADH when it donates hydrogen to a substrate",
     "It is reduced to NADH when it accepts hydrogen from a substrate",
     "It directly phosphorylates ADP to make ATP",
     "It is the final electron acceptor at the end of the chain"
    ],
    "answer": 1,
    "why": "NAD acts as a hydrogen carrier: it is reduced to NADH by accepting hydrogen removed during glycolysis and the Krebs cycle.",
    "hint": "Consider whether gaining hydrogen is oxidation or reduction."
   },
   {
    "id": "nature-L6-q13",
    "q": "A plant is well watered but its leaves are treated with a substance that blocks stomatal opening. Which effect is most likely?",
    "options": [
     "Photosynthesis increases as carbon dioxide is retained",
     "Root pressure increases sharply to compensate",
     "Transpiration rises because water cannot escape",
     "Transpiration falls but photosynthesis may also decline"
    ],
    "answer": 3,
    "why": "Closed stomata reduce water loss but also restrict carbon dioxide entry, so transpiration falls and photosynthesis is likely to slow.",
    "hint": "Remember what else enters the leaf through the same pores."
   }
  ],
  "truths": [
   {
    "id": "nature-L6-t1",
    "s": "Osmosis is the movement of water from a region of lower water potential to a region of higher water potential across a partially permeable membrane.",
    "answer": false,
    "why": "Water moves from higher to lower water potential, i.e. down the gradient, not the reverse."
   },
   {
    "id": "nature-L6-t2",
    "s": "The Krebs cycle takes place in the mitochondrial matrix and produces reduced NAD and FAD.",
    "answer": true,
    "why": "The matrix houses the enzymes of the cycle, which generates NADH and FADH₂."
   },
   {
    "id": "nature-L6-t3",
    "s": "In a DNA molecule, adenine always pairs with cytosine.",
    "answer": false,
    "why": "Adenine pairs with thymine; cytosine pairs with guanine."
   },
   {
    "id": "nature-L6-t4",
    "s": "Insulin is a hormone that lowers blood glucose concentration by promoting uptake of glucose into cells.",
    "answer": true,
    "why": "Insulin stimulates glucose uptake and glycogen synthesis, lowering blood glucose."
   },
   {
    "id": "nature-L6-t5",
    "s": "Antibiotics are effective against viruses because they destroy viral protein coats.",
    "answer": false,
    "why": "Antibiotics target bacterial structures and processes; they have no effect on viruses."
   },
   {
    "id": "nature-L6-t6",
    "s": "In a food chain, only about 10 per cent of the energy at one trophic level is transferred to the next.",
    "answer": true,
    "why": "Most energy is lost as heat and in waste, so transfer between levels is typically around 10 per cent."
   },
   {
    "id": "nature-L6-t7",
    "s": "Photolysis of water occurs in the light-independent reactions of photosynthesis.",
    "answer": false,
    "why": "Water is split in the light-dependent reactions, providing electrons to photosystem II."
   },
   {
    "id": "nature-L6-t8",
    "s": "A genotype describes the alleles an organism carries, while a phenotype describes its observable characteristics.",
    "answer": true,
    "why": "Genotype is the genetic makeup; phenotype is the expressed trait, influenced also by environment."
   },
   {
    "id": "nature-L6-t9",
    "s": "Arteries carry blood away from the heart and always carry oxygenated blood.",
    "answer": false,
    "why": "The pulmonary artery carries deoxygenated blood away from the heart to the lungs."
   },
   {
    "id": "nature-L6-t10",
    "s": "Enzymes lower the activation energy of a reaction by forming an enzyme–substrate complex.",
    "answer": true,
    "why": "Binding the substrate at the active site provides an alternative pathway with lower activation energy."
   },
   {
    "id": "nature-L6-t11",
    "s": "During anaerobic respiration in human muscle, glucose is converted to ethanol and carbon dioxide.",
    "answer": false,
    "why": "Human muscle produces lactate; ethanol and carbon dioxide are products of yeast fermentation."
   },
   {
    "id": "nature-L6-t12",
    "s": "Natural selection acts on the phenotype of organisms, not directly on their genotype.",
    "answer": true,
    "why": "Selection favours individuals whose expressed traits improve survival and reproduction."
   },
   {
    "id": "nature-L6-t13",
    "s": "Bile is produced by the pancreas and stored in the liver.",
    "answer": false,
    "why": "Bile is produced by the liver and stored in the gall bladder."
   },
   {
    "id": "nature-L6-t14",
    "s": "Nitrogen-fixing bacteria convert atmospheric nitrogen into ammonia compounds usable by plants.",
    "answer": true,
    "why": "Nitrogen fixation reduces N₂ to ammonia, which is then assimilated into organic compounds."
   },
   {
    "id": "nature-L6-t15",
    "s": "The xylem transports sugars from the leaves to the roots.",
    "answer": false,
    "why": "Xylem transports water and mineral ions; sugars are transported in the phloem."
   },
   {
    "id": "nature-L6-t16",
    "s": "A vaccine provides artificial active immunity by stimulating the production of antibodies and memory cells.",
    "answer": true,
    "why": "Vaccines expose the immune system to antigens, generating an adaptive response and immunological memory."
   },
   {
    "id": "nature-L6-t17",
    "s": "Mitosis produces four genetically different haploid daughter cells.",
    "answer": false,
    "why": "Mitosis produces two genetically identical diploid cells; meiosis produces four different haploid cells."
   },
   {
    "id": "nature-L6-t18",
    "s": "Carbon dioxide enters leaves through stomata, whose opening is controlled by guard cells.",
    "answer": true,
    "why": "Guard cells change shape to open and close stomata, regulating gas exchange and water loss."
   }
  ],
  "terms": [
   {
    "id": "nature-L6-w1",
    "word": "OSMOSIS",
    "clue": "Net movement of water down a water potential gradient through a partially permeable membrane."
   },
   {
    "id": "nature-L6-w2",
    "word": "MITOSIS",
    "clue": "Nuclear division producing two genetically identical diploid daughter cells."
   },
   {
    "id": "nature-L6-w3",
    "word": "ENZYME",
    "clue": "Biological catalyst that lowers activation energy and has a specific active site."
   },
   {
    "id": "nature-L6-w4",
    "word": "ALLELE",
    "clue": "One of the alternative forms of a gene at a particular locus."
   },
   {
    "id": "nature-L6-w5",
    "word": "HOMEOSTASIS",
    "clue": "Maintenance of a stable internal environment despite external change."
   },
   {
    "id": "nature-L6-w6",
    "word": "PATHOGEN",
    "clue": "Microorganism that causes disease in a host organism."
   },
   {
    "id": "nature-L6-w7",
    "word": "DIFFUSION",
    "clue": "Net movement of particles from higher to lower concentration without energy input."
   },
   {
    "id": "nature-L6-w8",
    "word": "ECOSYSTEM",
    "clue": "Community of organisms interacting with each other and their physical environment."
   }
  ]
 },
 "7": {
  "questions": [
   {
    "id": "nature-L7-q1",
    "q": "In the light-dependent reactions of photosynthesis, which statement correctly describes what happens to water?",
    "options": [
     "It acts as the final electron acceptor",
     "It combines with carbon dioxide directly",
     "It is reduced to form glucose",
     "It is split, releasing oxygen and providing electrons"
    ],
    "answer": 3,
    "why": "Photolysis of water supplies electrons to replace those lost by chlorophyll and releases oxygen as a by-product.",
    "hint": "Think about where the oxygen gas produced in photosynthesis comes from."
   },
   {
    "id": "nature-L7-q2",
    "q": "A mutation changes a single base in a gene but the amino acid sequence of the encoded protein stays the same. Which term best describes this?",
    "options": [
     "A nonsense mutation",
     "A silent mutation",
     "A frameshift mutation",
     "A missense mutation"
    ],
    "answer": 1,
    "why": "Because the genetic code is degenerate, a base change can still specify the same amino acid, giving a silent mutation.",
    "hint": "Consider that several codons can code for the same amino acid."
   },
   {
    "id": "nature-L7-q3",
    "q": "Enzyme activity rises with temperature up to an optimum and then falls sharply. Which explanation is correct?",
    "options": [
     "Above the optimum, substrate molecules move too slowly",
     "Below the optimum, enzymes are permanently destroyed",
     "The optimum marks the temperature at which enzymes are used up",
     "Above the optimum, denaturation alters the active site shape"
    ],
    "answer": 3,
    "why": "Excess heat breaks bonds maintaining tertiary structure, so the active site no longer fits the substrate.",
    "hint": "Think about what happens to protein structure at high temperature."
   },
   {
    "id": "nature-L7-q4",
    "q": "Two heterozygous parents, both with blood group A (genotype IAi), have a child. What is the probability that the child has blood group O?",
    "options": [
     "0",
     "3 in 4",
     "1 in 2",
     "1 in 4"
    ],
    "answer": 3,
    "why": "A cross of IAi × IAi gives IAIA, IAi, IAi and ii; only ii (one quarter) gives group O.",
    "hint": "Draw a simple 2×2 genetic cross diagram."
   },
   {
    "id": "nature-L7-q5",
    "q": "In an insect, air reaches the tissues through a system of tubes. Which feature most directly allows rapid oxygen delivery?",
    "options": [
     "Tracheoles penetrate directly into individual cells",
     "Gills extract oxygen from water",
     "Air is pumped by a muscular diaphragm",
     "Haemoglobin carries oxygen in the haemolymph"
    ],
    "answer": 0,
    "why": "Fine tracheoles branch to reach almost every cell, so gases diffuse directly without a circulatory carrier.",
    "hint": "Compare the insect system with lungs that rely on blood transport."
   },
   {
    "id": "nature-L7-q6",
    "q": "A bacterial culture starts with 200 cells and doubles every 20 minutes. How many cells are present after 2 hours?",
    "options": [
     "25,600",
     "2,400",
     "1,600",
     "12,800"
    ],
    "answer": 3,
    "why": "Two hours is six 20-minute doublings, so 200 × 2⁶ = 200 × 64 = 12,800.",
    "hint": "Work out how many doubling periods fit into two hours."
   },
   {
    "id": "nature-L7-q7",
    "q": "Which statement best explains why a person with a blocked bile duct may struggle to digest fatty foods?",
    "options": [
     "Bile salts are needed to emulsify fats into small droplets",
     "Bile contains lipase that hydrolyses triglycerides",
     "Bile absorbs fatty acids directly into the blood",
     "Bile neutralises gastric acid to activate pepsin"
    ],
    "answer": 0,
    "why": "Bile salts emulsify fats, increasing surface area for lipase; bile itself contains no digestive enzymes.",
    "hint": "Distinguish between emulsification and enzymatic breakdown."
   },
   {
    "id": "nature-L7-q8",
    "q": "Two populations of the same species become separated by a river for many generations. Which process most directly leads to them becoming separate species?",
    "options": [
     "Convergent evolution towards a similar form",
     "Accumulation of different mutations causing reproductive isolation",
     "Random mating between the two populations",
     "Increased gene flow between the populations"
    ],
    "answer": 1,
    "why": "Geographic isolation stops gene flow, so independent mutation and selection can eventually produce reproductive isolation.",
    "hint": "Consider what happens when gene flow between groups stops."
   },
   {
    "id": "nature-L7-q9",
    "q": "A plant is well watered but its leaves are treated with a substance that blocks stomatal opening. What is the most likely immediate effect?",
    "options": [
     "Transpiration rises because water cannot escape",
     "Root water uptake stops immediately",
     "Photosynthesis increases due to CO₂ accumulation",
     "Transpiration falls but photosynthesis may also decline"
    ],
    "answer": 3,
    "why": "Closed stomata reduce water loss but also restrict carbon dioxide entry, so both transpiration and photosynthesis fall.",
    "hint": "Remember that stomata are the main route for both water vapour and carbon dioxide."
   },
   {
    "id": "nature-L7-q10",
    "q": "Which statement best explains why a red blood cell bursts in distilled water?",
    "options": [
     "The cell actively pumps water inwards",
     "Water leaves by osmosis because the cell has a higher water potential",
     "Salts diffuse out, causing the cell to swell",
     "Water enters by osmosis because the external water potential is higher"
    ],
    "answer": 3,
    "why": "Distilled water has a higher water potential than cytoplasm, so water moves in by osmosis until the membrane ruptures.",
    "hint": "Compare the water potential outside with that inside the cell."
   }
  ],
  "truths": [
   {
    "id": "nature-L7-t1",
    "s": "In eukaryotes, transcription occurs in the nucleus and translation occurs on ribosomes in the cytoplasm.",
    "answer": true,
    "why": "mRNA is made in the nucleus and then translated by cytoplasmic ribosomes."
   },
   {
    "id": "nature-L7-t2",
    "s": "Insulin is a steroid hormone that enters cells to bind intracellular receptors.",
    "answer": false,
    "why": "Insulin is a protein hormone that binds to cell-surface receptors."
   },
   {
    "id": "nature-L7-t3",
    "s": "During the light-independent reactions of photosynthesis, carbon dioxide is fixed onto a five-carbon sugar.",
    "answer": true,
    "why": "RuBP, a five-carbon compound, accepts CO₂ in the Calvin cycle."
   },
   {
    "id": "nature-L7-t4",
    "s": "Antibiotics such as penicillin are effective against viruses because they destroy viral capsids.",
    "answer": false,
    "why": "Antibiotics target bacterial structures; they do not act on viruses."
   },
   {
    "id": "nature-L7-t5",
    "s": "In a DNA molecule, adenine pairs with thymine by two hydrogen bonds.",
    "answer": true,
    "why": "A–T pairs form two hydrogen bonds, while G–C pairs form three."
   },
   {
    "id": "nature-L7-t6",
    "s": "Osmosis is the movement of solute particles from high to low concentration through a membrane.",
    "answer": false,
    "why": "Osmosis is the movement of water molecules, not solutes, across a partially permeable membrane."
   },
   {
    "id": "nature-L7-t7",
    "s": "The sinoatrial node acts as the natural pacemaker of the mammalian heart.",
    "answer": true,
    "why": "The SA node initiates each heartbeat by generating electrical impulses."
   },
   {
    "id": "nature-L7-t8",
    "s": "In a food chain, only about 10% of energy is transferred between trophic levels; the rest is lost mainly as heat.",
    "answer": true,
    "why": "Most energy is lost through respiration as heat, with some in waste."
   },
   {
    "id": "nature-L7-t9",
    "s": "Meiosis produces four genetically identical daughter cells.",
    "answer": false,
    "why": "Meiosis produces four genetically varied cells with half the chromosome number."
   },
   {
    "id": "nature-L7-t10",
    "s": "Competitive inhibitors raise the apparent Km of an enzyme without changing its Vmax.",
    "answer": true,
    "why": "A competitive inhibitor can be outcompeted by more substrate, so Vmax is unchanged but Km increases."
   },
   {
    "id": "nature-L7-t11",
    "s": "Human mature red blood cells contain a nucleus and mitochondria.",
    "answer": false,
    "why": "Mature red blood cells lack a nucleus and mitochondria to maximise haemoglobin space."
   },
   {
    "id": "nature-L7-t12",
    "s": "In mammals, the alveoli provide a large surface area and thin walls to speed up gas exchange.",
    "answer": true,
    "why": "Many small alveoli give a huge surface area with a one-cell-thick barrier."
   },
   {
    "id": "nature-L7-t13",
    "s": "A frameshift mutation usually arises from the insertion or deletion of a number of bases not divisible by three.",
    "answer": true,
    "why": "Such changes shift the reading frame, altering all subsequent codons."
   },
   {
    "id": "nature-L7-t14",
    "s": "Photorespiration is the process by which plants make ATP in the mitochondria during daylight.",
    "answer": false,
    "why": "Photorespiration is a wasteful reaction of RuBisCO with oxygen, not ATP production."
   },
   {
    "id": "nature-L7-t15",
    "s": "Water potential is highest in pure water at atmospheric pressure.",
    "answer": true,
    "why": "Pure water has a water potential of zero, the maximum value."
   },
   {
    "id": "nature-L7-t16",
    "s": "Bacteria reproduce by mitosis, producing two identical daughter cells.",
    "answer": false,
    "why": "Bacteria reproduce by binary fission, not mitosis."
   },
   {
    "id": "nature-L7-t17",
    "s": "In the carbon cycle, decomposers return carbon to the atmosphere mainly as carbon dioxide through respiration.",
    "answer": true,
    "why": "Decomposers respire organic matter, releasing CO₂."
   },
   {
    "id": "nature-L7-t18",
    "s": "The polymerase chain reaction requires a heat-labile DNA polymerase that is destroyed at high temperature.",
    "answer": false,
    "why": "PCR uses a thermostable DNA polymerase such as Taq, which survives the high denaturation temperatures."
   }
  ],
  "terms": [
   {
    "id": "nature-L7-w1",
    "word": "CHLOROPLAST",
    "clue": "Plant organelle where light energy is captured for photosynthesis"
   },
   {
    "id": "nature-L7-w2",
    "word": "PERISTALSIS",
    "clue": "Wave-like muscular contractions that move food along the gut"
   },
   {
    "id": "nature-L7-w3",
    "word": "ALLELE",
    "clue": "Alternative version of a gene found at one locus"
   },
   {
    "id": "nature-L7-w4",
    "word": "HAEMOGLOBIN",
    "clue": "Iron-containing protein in red blood cells that binds oxygen"
   },
   {
    "id": "nature-L7-w5",
    "word": "ECOSYSTEM",
    "clue": "Community of organisms interacting with their physical environment"
   },
   {
    "id": "nature-L7-w6",
    "word": "DIFFUSION",
    "clue": "Net movement of particles from high to low concentration"
   },
   {
    "id": "nature-L7-w7",
    "word": "PATHOGEN",
    "clue": "Microorganism or agent that causes disease in a host"
   }
  ]
 },
 "8": {
  "questions": [
   {
    "id": "nature-L8-q1",
    "q": "A cell is treated with a drug that inhibits the enzyme that attaches ubiquitin to proteins destined for destruction. Which process is most directly affected?",
    "options": [
     "Proteasomal degradation of short-lived regulatory proteins",
     "Transcription of ribosomal RNA by RNA polymerase I",
     "Glycosylation of proteins in the Golgi apparatus",
     "Formation of the mitotic spindle from tubulin",
     "Import of proteins into the mitochondrial matrix"
    ],
    "answer": 0,
    "why": "Polyubiquitination tags proteins for recognition and destruction by the 26S proteasome; blocking ubiquitin attachment directly impairs this pathway.",
    "hint": "Think about the tag that marks proteins for disposal."
   },
   {
    "id": "nature-L8-q2",
    "q": "Which statement best explains why the Calvin cycle stops in darkness even though ATP and NADPH are temporarily present?",
    "options": [
     "NADPH is rapidly destroyed by oxygen in the stroma",
     "ATP cannot be hydrolysed outside the thylakoid membrane",
     "Rubisco requires photons to bind its substrate",
     "Several Calvin cycle enzymes are light-activated and deactivated in the dark",
     "Carbon dioxide cannot diffuse into the stroma at night"
    ],
    "answer": 3,
    "why": "Enzymes such as rubisco activase and several Calvin cycle enzymes are regulated by light-driven changes in stromal pH, ions and thioredoxin, so they switch off in darkness.",
    "hint": "Think about regulation of the enzymes rather than the substrates."
   },
   {
    "id": "nature-L8-q3",
    "q": "Which statement best explains why oxygen is a more efficient final electron acceptor than sulfate in anaerobic respiration?",
    "options": [
     "Sulfate is only used in photosynthesis",
     "Oxygen diffuses more slowly than sulfate",
     "Oxygen is a larger molecule than sulfate",
     "Sulfate cannot accept electrons at all",
     "Oxygen has a higher reduction potential, releasing more energy per electron"
    ],
    "answer": 4,
    "why": "Oxygen has a high (positive) reduction potential, so electrons passing to it release more free energy than transfer to sulfate.",
    "hint": "Compare the electron affinity of the two acceptors."
   },
   {
    "id": "nature-L8-q4",
    "q": "In a eukaryotic gene, a nonsense mutation arises in exon 3 of 5. Which outcome is most likely if the mRNA escapes nonsense-mediated decay?",
    "options": [
     "Loss of the poly(A) tail from the mRNA",
     "A truncated polypeptide lacking the C-terminal domains",
     "A full-length protein with a single amino acid substitution",
     "Complete failure of transcription of the gene",
     "A protein with an extra segment inserted in the middle"
    ],
    "answer": 1,
    "why": "A nonsense codon causes premature termination of translation, producing a shortened polypeptide missing downstream domains.",
    "hint": "Consider where translation stops relative to the mutation."
   },
   {
    "id": "nature-L8-q5",
    "q": "A neuron's resting membrane potential is −70 mV. The equilibrium potential for K+ is −90 mV. If K+ permeability increases, what happens to the membrane potential?",
    "options": [
     "It moves towards −90 mV",
     "It stays exactly at −70 mV",
     "It moves towards 0 mV",
     "It reverses to a positive value",
     "It moves towards +60 mV"
    ],
    "answer": 0,
    "why": "The membrane potential shifts towards the equilibrium potential of the ion whose permeability rises, i.e. towards −90 mV.",
    "hint": "The potential follows the dominant ion's equilibrium value."
   },
   {
    "id": "nature-L8-q6",
    "q": "Which feature of the mammalian kidney allows the production of concentrated urine?",
    "options": [
     "Secretion of hydrogen ions in the collecting duct",
     "Podocytes contracting to squeeze the filtrate",
     "Active reabsorption of glucose in the proximal tubule",
     "A countercurrent multiplier in the loop of Henle",
     "Filtration slits in the glomerular capillaries"
    ],
    "answer": 3,
    "why": "The loop of Henle acts as a countercurrent multiplier, creating an osmotic gradient in the medulla that allows water reabsorption and urine concentration.",
    "hint": "Think about the osmotic gradient in the medulla."
   },
   {
    "id": "nature-L8-q7",
    "q": "A patient has a mutation that prevents the cystic fibrosis transmembrane conductance regulator from reaching the apical membrane of epithelial cells. Which consequence is most direct?",
    "options": [
     "Failure of haemoglobin to bind oxygen",
     "Loss of insulin receptors on liver cells",
     "Inability to reabsorb glucose in the kidney",
     "Reduced chloride secretion and thickened mucus",
     "Increased chloride secretion and watery mucus"
    ],
    "answer": 3,
    "why": "CFTR normally secretes chloride; if it is absent from the membrane, chloride movement is reduced and mucus becomes thick and sticky.",
    "hint": "Link the channel to ion movement and mucus hydration."
   },
   {
    "id": "nature-L8-q8",
    "q": "A cell is treated with a drug that inhibits the enzyme responsible for attaching the mitotic spindle to kinetochores. Which phase of mitosis would be most directly prevented from completing correctly?",
    "options": [
     "Telophase",
     "Cytokinesis",
     "Anaphase",
     "Metaphase",
     "Prophase"
    ],
    "answer": 3,
    "why": "Kinetochore attachment is required for chromosomes to align at the metaphase plate; without it, metaphase cannot complete correctly.",
    "hint": "Think about the stage where chromosomes must align at the cell equator."
   },
   {
    "id": "nature-L8-q9",
    "q": "A patient has a mutation in the gene encoding the CFTR chloride channel, causing misfolded protein to be retained in the endoplasmic reticulum. Which cellular process is most directly impaired?",
    "options": [
     "Lipid bilayer formation",
     "ATP production in mitochondria",
     "DNA replication in the nucleus",
     "Protein folding and trafficking",
     "Protein synthesis on ribosomes"
    ],
    "answer": 3,
    "why": "Misfolded CFTR is retained by ER quality control, so folding and trafficking to the membrane are impaired, not synthesis itself.",
    "hint": "The protein is made but does not reach its destination."
   },
   {
    "id": "nature-L8-q10",
    "q": "Which statement best explains why a frameshift mutation near the start of a coding sequence is usually more damaging than a missense mutation?",
    "options": [
     "It prevents the mRNA from leaving the nucleus",
     "It alters every downstream codon, changing the whole protein",
     "It always creates a stop codon immediately",
     "It removes the promoter region of the gene",
     "It blocks the binding of the ribosome to the mRNA"
    ],
    "answer": 1,
    "why": "Insertions or deletions not in multiples of three shift the reading frame, so all subsequent codons and amino acids are changed.",
    "hint": "Consider what happens to codons downstream."
   },
   {
    "id": "nature-L8-q11",
    "q": "Which observation would best distinguish competitive from non-competitive inhibition in an enzyme assay?",
    "options": [
     "Competitive inhibition is overcome by raising substrate concentration",
     "Competitive inhibition lowers Vmax permanently",
     "Non-competitive inhibition is reversed by more substrate",
     "Both inhibitors change the enzyme's primary structure",
     "Non-competitive inhibitors bind only at the active site"
    ],
    "answer": 0,
    "why": "Competitive inhibitors compete with substrate at the active site, so a higher substrate concentration can overcome the inhibition; non-competitive inhibition cannot be overcome this way.",
    "hint": "Consider whether more substrate can outcompete the inhibitor."
   },
   {
    "id": "nature-L8-q12",
    "q": "In a pedigree, a condition appears in every generation and affects about half the offspring of an affected heterozygous parent, with males and females equally affected. Which mode of inheritance fits best?",
    "options": [
     "Y-linked",
     "Mitochondrial",
     "X-linked recessive",
     "Autosomal recessive",
     "Autosomal dominant"
    ],
    "answer": 4,
    "why": "Autosomal dominant traits appear in every generation, affect both sexes equally, and an affected heterozygote transmits the allele to about half of offspring.",
    "hint": "Equal sex ratio and vertical transmission point to an autosome."
   },
   {
    "id": "nature-L8-q13",
    "q": "A respirometer records oxygen uptake by germinating seeds. After 10 minutes the reading shows 0.4 cm3 of O2 used. Which additional measurement is needed to calculate the respiratory quotient?",
    "options": [
     "Volume of carbon dioxide released",
     "Mass of the seeds",
     "Temperature of the water bath",
     "Duration of the experiment",
     "Barometric pressure only"
    ],
    "answer": 0,
    "why": "RQ is the ratio of CO2 produced to O2 consumed, so the CO2 volume must also be measured.",
    "hint": "RQ compares two gas volumes."
   },
   {
    "id": "nature-L8-q14",
    "q": "In an ecosystem, net primary productivity is 2000 kJ m−2 yr−1 and respiration by primary producers is 1500 kJ m−2 yr−1. What is the gross primary productivity?",
    "options": [
     "3500 kJ m−2 yr−1",
     "500 kJ m−2 yr−1",
     "2000 kJ m−2 yr−1",
     "1500 kJ m−2 yr−1",
     "2500 kJ m−2 yr−1"
    ],
    "answer": 0,
    "why": "GPP = NPP + respiration of producers, so 2000 + 1500 = 3500 kJ m−2 yr−1.",
    "hint": "Gross equals net plus what is respired."
   },
   {
    "id": "nature-L8-q15",
    "q": "In a population at Hardy–Weinberg equilibrium, the frequency of a recessive allele is 0.3. What proportion of the population is expected to be heterozygous?",
    "options": [
     "0.21",
     "0.30",
     "0.42",
     "0.09",
     "0.49"
    ],
    "answer": 2,
    "why": "If q = 0.3 then p = 0.7, and heterozygote frequency is 2pq = 2 × 0.7 × 0.3 = 0.42.",
    "hint": "Use 2pq with p = 1 − q."
   },
   {
    "id": "nature-L8-q16",
    "q": "In a population at Hardy–Weinberg equilibrium, a recessive allele has a frequency of 0.3. What proportion of the population is expected to be heterozygous?",
    "options": [
     "0.42",
     "0.70",
     "0.21",
     "0.09",
     "0.49"
    ],
    "answer": 0,
    "why": "If q = 0.3, p = 0.7, so 2pq = 2 × 0.7 × 0.3 = 0.42.",
    "hint": "Use 2pq after finding p from p + q = 1."
   }
  ],
  "truths": [
   {
    "id": "nature-L8-t1",
    "s": "During the light-independent reactions of photosynthesis, carbon dioxide is fixed onto ribulose bisphosphate by the enzyme rubisco.",
    "answer": true,
    "why": "Rubisco catalyses the attachment of CO2 to RuBP in the Calvin cycle."
   },
   {
    "id": "nature-L8-t2",
    "s": "In a eukaryotic cell, the spliceosome removes introns from pre-mRNA and joins exons together.",
    "answer": true,
    "why": "Splicing removes introns and ligates exons to form mature mRNA."
   },
   {
    "id": "nature-L8-t3",
    "s": "The enzyme DNA ligase is responsible for unwinding the double helix during DNA replication.",
    "answer": false,
    "why": "Helicase unwinds the helix; ligase joins DNA fragments."
   },
   {
    "id": "nature-L8-t4",
    "s": "Antibodies produced by plasma cells are proteins with quaternary structure made of heavy and light chains.",
    "answer": true,
    "why": "Immunoglobulins consist of two heavy and two light polypeptide chains."
   },
   {
    "id": "nature-L8-t5",
    "s": "In the mammalian heart, the left ventricle pumps blood to the lungs through the pulmonary artery.",
    "answer": false,
    "why": "The right ventricle pumps blood to the lungs; the left ventricle pumps to the body via the aorta."
   },
   {
    "id": "nature-L8-t6",
    "s": "During meiosis, crossing over occurs between non-sister chromatids of homologous chromosomes in prophase I.",
    "answer": true,
    "why": "Chiasmata form between non-sister chromatids, exchanging genetic material."
   },
   {
    "id": "nature-L8-t7",
    "s": "A frameshift mutation caused by deletion of two nucleotides usually changes only a single amino acid.",
    "answer": false,
    "why": "A two-base deletion shifts the reading frame and alters all downstream codons."
   },
   {
    "id": "nature-L8-t8",
    "s": "In ecological pyramids, energy transfer between trophic levels is typically about 10% efficient.",
    "answer": true,
    "why": "Roughly 10% of energy is passed to the next trophic level; the rest is lost mainly as heat."
   },
   {
    "id": "nature-L8-t9",
    "s": "Insulin lowers blood glucose by stimulating glycogen breakdown in the liver.",
    "answer": false,
    "why": "Insulin stimulates glycogen synthesis and storage, not breakdown."
   },
   {
    "id": "nature-L8-t10",
    "s": "The oxygen produced in photosynthesis comes from the splitting of water molecules in the light-dependent reactions.",
    "answer": true,
    "why": "Photolysis of water in photosystem II releases oxygen."
   },
   {
    "id": "nature-L8-t11",
    "s": "Bacteria reproduce by mitosis, producing two genetically identical daughter cells.",
    "answer": false,
    "why": "Bacteria divide by binary fission; mitosis occurs in eukaryotic cells."
   },
   {
    "id": "nature-L8-t12",
    "s": "In the nephron, most reabsorption of glucose and amino acids occurs in the proximal convoluted tubule.",
    "answer": true,
    "why": "The proximal tubule actively reabsorbs glucose, amino acids and most ions and water."
   },
   {
    "id": "nature-L8-t13",
    "s": "Enzymes increase the activation energy of the reactions they catalyse.",
    "answer": false,
    "why": "Enzymes lower the activation energy, speeding up the reaction."
   },
   {
    "id": "nature-L8-t14",
    "s": "A vaccine can provide immunity by stimulating the production of memory cells without causing the full disease.",
    "answer": true,
    "why": "Vaccines expose the immune system to antigens safely, generating memory cells."
   },
   {
    "id": "nature-L8-t15",
    "s": "In the carbon cycle, decomposers release carbon dioxide by photosynthesis.",
    "answer": false,
    "why": "Decomposers release CO2 by respiration, not photosynthesis."
   },
   {
    "id": "nature-L8-t16",
    "s": "The genetic material of a typical bacterium is a circular DNA molecule located in the nucleoid region.",
    "answer": true,
    "why": "Bacteria usually have a single circular chromosome in the nucleoid, plus plasmids."
   },
   {
    "id": "nature-L8-t17",
    "s": "In human blood, red blood cells contain a nucleus and mitochondria to support aerobic respiration.",
    "answer": false,
    "why": "Mature human red blood cells lack a nucleus and mitochondria."
   },
   {
    "id": "nature-L8-t18",
    "s": "A keystone species has an influence on its community that is disproportionately large relative to its abundance.",
    "answer": true,
    "why": "Keystone species strongly affect community structure despite low biomass."
   },
   {
    "id": "nature-L8-t19",
    "s": "In the light-dependent reactions of photosynthesis, water is split to provide electrons and protons, releasing oxygen as a by-product.",
    "answer": true,
    "why": "Photolysis of water in photosystem II supplies electrons to replace those lost by chlorophyll and releases O2."
   },
   {
    "id": "nature-L8-t20",
    "s": "During glycolysis, one molecule of glucose is converted into two molecules of pyruvate with a net gain of four ATP molecules.",
    "answer": false,
    "why": "Glycolysis has a net gain of two ATP, not four; four ATP are produced but two are consumed."
   },
   {
    "id": "nature-L8-t21",
    "s": "DNA polymerase can only add nucleotides to the 3' end of a growing DNA strand, so replication proceeds in the 5' to 3' direction on the new strand.",
    "answer": true,
    "why": "DNA polymerase extends the new strand by adding to its free 3' hydroxyl group, so synthesis is 5' to 3'."
   },
   {
    "id": "nature-L8-t22",
    "s": "In a food chain, only about 10% of the energy at one trophic level is transferred to the next, with much lost as heat through respiration.",
    "answer": true,
    "why": "Ecological efficiency is typically around 10%, with energy lost in respiration, excretion and as heat."
   }
  ],
  "terms": [
   {
    "id": "nature-L8-w1",
    "word": "RIBOSOME",
    "clue": "Cellular machine that translates messenger RNA into polypeptide chains"
   },
   {
    "id": "nature-L8-w2",
    "word": "PHOTOLYSIS",
    "clue": "Light-driven splitting of water that supplies electrons in photosynthesis"
   },
   {
    "id": "nature-L8-w3",
    "word": "OSMOLARITY",
    "clue": "Total concentration of solute particles in a solution"
   },
   {
    "id": "nature-L8-w4",
    "word": "EPISTASIS",
    "clue": "Interaction where one gene masks the expression of another"
   },
   {
    "id": "nature-L8-w5",
    "word": "GLOMERULUS",
    "clue": "Capillary tuft in the kidney where blood is filtered"
   },
   {
    "id": "nature-L8-w6",
    "word": "PATHOGENIC",
    "clue": "Describes a microorganism able to cause disease in a host"
   },
   {
    "id": "nature-L8-w7",
    "word": "ENDOCRINE",
    "clue": "Describes glands that secrete hormones directly into the blood"
   },
   {
    "id": "nature-L8-w8",
    "word": "KINETOCHORE",
    "clue": "Protein structure on a chromosome where spindle fibres attach during cell division"
   }
  ]
 },
 "9": {
  "questions": [
   {
    "id": "nature-L9-q1",
    "q": "Which statement best explains why the Calvin cycle stops in darkness even though ATP and NADPH may still be present in the stroma?",
    "options": [
     "Carbon dioxide is not available at night",
     "NADPH is destroyed by darkness",
     "ATP cannot be used in the dark",
     "Several Calvin cycle enzymes are light-activated and deactivated in the dark",
     "Rubisco is inhibited by oxygen only in light"
    ],
    "answer": 3,
    "why": "Enzymes such as rubisco activase and others in the cycle are regulated by light-dependent thioredoxin and metabolite signals, so the cycle shuts down when light is removed.",
    "hint": "Think about regulation of the enzymes rather than the supply of cofactors."
   },
   {
    "id": "nature-L9-q2",
    "q": "A eukaryotic mRNA is translated, and a nonsense mutation in exon 3 of 5 produces a truncated protein, yet some full-length protein is still detected. Which mechanism best explains this?",
    "options": [
     "Nonsense-mediated decay of the mRNA",
     "Ribosomal proofreading of the stop codon",
     "Exon skipping that removes the mutated exon",
     "Reverse transcription of the mRNA",
     "Silencing of the mutant allele by imprinting"
    ],
    "answer": 2,
    "why": "Alternative splicing can skip the exon carrying the premature stop codon, restoring the reading frame and yielding some full-length protein.",
    "hint": "Think about how exons are chosen during splicing."
   },
   {
    "id": "nature-L9-q3",
    "q": "The Calvin cycle stops soon after a plant is moved to darkness, even though ATP and NADPH from the light reactions are still present briefly. Which explanation is most likely?",
    "options": [
     "Several Calvin cycle enzymes are light-activated and deactivate in darkness",
     "NADPH cannot be used without light",
     "Regeneration of RuBP requires ATP produced only in light",
     "Carbon dioxide cannot enter the stroma in darkness",
     "Rubisco is inhibited by light"
    ],
    "answer": 0,
    "why": "Enzymes such as rubisco and others in the cycle are light-regulated; in darkness they become inactive, halting carbon fixation.",
    "hint": "Consider regulation of the cycle's enzymes, not just energy supply."
   },
   {
    "id": "nature-L9-q4",
    "q": "Which statement best explains why the Calvin cycle stops in darkness even though ATP and NADPH may still be present briefly?",
    "options": [
     "NADPH is destroyed by darkness",
     "Carbon dioxide cannot diffuse at night",
     "Several Calvin cycle enzymes are light-activated",
     "Rubisco is inhibited by oxygen only in darkness",
     "ATP cannot be hydrolysed without light"
    ],
    "answer": 2,
    "why": "Enzymes such as rubisco activase and several Calvin cycle enzymes require light-driven activation; without it the cycle slows and stops.",
    "hint": "Consider regulation of the enzymes, not just the supply of ATP and NADPH."
   },
   {
    "id": "nature-L9-q5",
    "q": "A patient has a mutation that prevents the CFTR chloride channel from reaching the apical membrane. Which consequence is most direct?",
    "options": [
     "Excess chloride secretion and salty sweat only",
     "Increased sodium reabsorption with watery mucus",
     "Loss of aquaporin insertion in collecting ducts",
     "Failure of glucose reabsorption in the kidney",
     "Reduced chloride secretion and thickened mucus"
    ],
    "answer": 4,
    "why": "CFTR normally secretes chloride; without it at the membrane, chloride and water secretion fall, making mucus thick and sticky.",
    "hint": "Follow the ion and the water that follows it."
   },
   {
    "id": "nature-L9-q6",
    "q": "A cell is treated with a drug that inhibits the enzyme attaching ubiquitin to proteins. Which process is most directly affected?",
    "options": [
     "Transcription of ribosomal RNA",
     "Formation of the mitotic spindle",
     "Proteasomal degradation of damaged proteins",
     "Glycolysis in the cytoplasm",
     "Insertion of proteins into the ER membrane"
    ],
    "answer": 2,
    "why": "Polyubiquitination tags proteins for destruction by the proteasome; blocking ubiquitin attachment impairs this targeting.",
    "hint": "What molecular 'label' marks proteins for destruction?"
   },
   {
    "id": "nature-L9-q7",
    "q": "In a eukaryotic gene, a nonsense mutation arises in exon 3 of 5. Which outcome is most likely if the mRNA escapes nonsense-mediated decay?",
    "options": [
     "An mRNA with an intron retained",
     "A full-length protein with one amino acid substituted",
     "A protein with an extra exon inserted",
     "A truncated protein lacking the later exons' contribution",
     "No mRNA is produced at all"
    ],
    "answer": 3,
    "why": "A nonsense codon causes premature termination, so translation stops at exon 3 and the downstream exons are not translated into protein.",
    "hint": "Think about where translation stops when a stop codon appears early."
   },
   {
    "id": "nature-L9-q8",
    "q": "A neuron's resting membrane potential is −70 mV and the equilibrium potential for K+ is −90 mV. If K+ permeability increases while Na+ permeability is unchanged, what happens to the membrane potential?",
    "options": [
     "It hyperpolarises toward −90 mV",
     "It reverses to a positive value",
     "It depolarises toward threshold",
     "It stays exactly at −70 mV",
     "It moves toward the Na+ equilibrium potential"
    ],
    "answer": 0,
    "why": "The membrane potential is a weighted average of equilibrium potentials; increasing K+ permeability pulls it closer to E(K+), i.e. more negative.",
    "hint": "Consider which ion's equilibrium potential the membrane potential approaches as its conductance rises."
   },
   {
    "id": "nature-L9-q9",
    "q": "A patient has a mutation preventing the CFTR chloride channel from reaching the apical membrane. Which consequence is most likely in the airway?",
    "options": [
     "Loss of cilia entirely",
     "Increased sodium reabsorption with no mucus change",
     "Enhanced bicarbonate secretion",
     "Reduced chloride secretion and thickened mucus",
     "Increased chloride secretion and watery mucus"
    ],
    "answer": 3,
    "why": "Without apical CFTR, chloride secretion fails and ENaC-mediated sodium and water absorption increases, producing dehydrated, thick mucus.",
    "hint": "Consider what happens to mucus when chloride and water movement across the epithelium is reduced."
   },
   {
    "id": "nature-L9-q10",
    "q": "Which observation best distinguishes competitive from non-competitive inhibition in an enzyme assay?",
    "options": [
     "Competitive inhibition lowers Vmax; non-competitive raises Km",
     "Competitive inhibition raises apparent Km at unchanged Vmax; non-competitive lowers Vmax",
     "Both lower Vmax equally",
     "Non-competitive inhibition is reversed by more substrate",
     "Competitive inhibition requires a higher temperature"
    ],
    "answer": 1,
    "why": "A competitive inhibitor can be outcompeted by substrate, so Vmax is unchanged but apparent Km rises; non-competitive inhibition reduces Vmax.",
    "hint": "Think about whether adding more substrate can overcome each type of inhibition."
   },
   {
    "id": "nature-L9-q11",
    "q": "Which statement best explains why oxygen is a more efficient final electron acceptor than sulfate in anaerobic respiration?",
    "options": [
     "Oxygen has a higher reduction potential, releasing more energy per electron",
     "Sulfate is toxic to mitochondria",
     "Oxygen is produced by the cell",
     "Oxygen is smaller and diffuses faster",
     "Sulfate cannot accept electrons"
    ],
    "answer": 0,
    "why": "The greater (more positive) reduction potential of O2/H2O gives a larger free-energy drop along the electron transport chain, so more ATP is made.",
    "hint": "Compare the redox potentials of the terminal acceptors."
   },
   {
    "id": "nature-L9-q12",
    "q": "A neuron has a resting potential of −70 mV and a K+ equilibrium potential of −90 mV. If the membrane becomes more permeable to K+, what happens to the membrane potential?",
    "options": [
     "It depolarises toward threshold",
     "It hyperpolarises toward −90 mV",
     "It stays exactly at −70 mV",
     "It reverses to about +30 mV",
     "It becomes zero"
    ],
    "answer": 1,
    "why": "Greater K+ permeability pulls the membrane potential closer to E_K (−90 mV), which is hyperpolarisation.",
    "hint": "Compare the current potential with the K+ equilibrium potential."
   },
   {
    "id": "nature-L9-q13",
    "q": "Which feature of the mammalian kidney is most important for producing concentrated urine?",
    "options": [
     "The length of the loop of Henle and the countercurrent multiplier",
     "The number of podocytes",
     "The pH of the filtrate",
     "The diameter of the ureter",
     "The glomerular filtration rate"
    ],
    "answer": 0,
    "why": "The loop of Henle establishes an osmotic gradient in the medulla that allows water reabsorption and concentrated urine.",
    "hint": "Consider the medullary osmotic gradient."
   },
   {
    "id": "nature-L9-q14",
    "q": "A drug inhibits the CFTR chloride channel so that chloride cannot be secreted. What is the most direct effect on mucus in the airways?",
    "options": [
     "Mucus becomes more viscous and difficult to clear",
     "Mucus production stops entirely",
     "Mucus becomes alkaline",
     "Mucus becomes thinner and easier to clear",
     "Mucus is absorbed by cilia"
    ],
    "answer": 0,
    "why": "Loss of chloride secretion reduces water movement into the airway surface liquid, making mucus thick and sticky.",
    "hint": "Link ion movement to water movement in secretions."
   },
   {
    "id": "nature-L9-q15",
    "q": "An enzyme is studied with increasing substrate concentration. A drug reduces Vmax but leaves Km unchanged. What type of inhibition is this?",
    "options": [
     "Uncompetitive inhibition",
     "Non-competitive inhibition",
     "Competitive inhibition",
     "Irreversible activation",
     "Feedback activation"
    ],
    "answer": 1,
    "why": "Non-competitive inhibition reduces Vmax without changing Km because the inhibitor binds elsewhere than the active site.",
    "hint": "Compare effects on Vmax and Km."
   },
   {
    "id": "nature-L9-q16",
    "q": "Why is oxygen a more efficient final electron acceptor than nitrate in aerobic respiration?",
    "options": [
     "Oxygen has a higher reduction potential, releasing more energy",
     "Oxygen is smaller and diffuses faster",
     "Nitrate cannot accept electrons",
     "Nitrate is toxic to mitochondria",
     "Oxygen is produced by the cell"
    ],
    "answer": 0,
    "why": "Oxygen's high reduction potential makes the electron transfer chain release more energy per electron.",
    "hint": "Think about redox potentials."
   }
  ],
  "truths": [
   {
    "id": "nature-L9-t1",
    "s": "Rubisco is active in darkness as long as ATP and NADPH are present.",
    "answer": false,
    "why": "Rubisco is light-activated and becomes inactive in darkness."
   },
   {
    "id": "nature-L9-t2",
    "s": "Alternative splicing can remove an exon containing a premature stop codon.",
    "answer": true,
    "why": "Exon skipping can restore the reading frame."
   },
   {
    "id": "nature-L9-t3",
    "s": "A competitive inhibitor increases the apparent Km of an enzyme without changing its Vmax.",
    "answer": true,
    "why": "Competitive inhibitors can be overcome by more substrate, so Vmax is unchanged but apparent Km rises."
   },
   {
    "id": "nature-L9-t4",
    "s": "The loop of Henle in the mammalian kidney is longer in species that produce more concentrated urine.",
    "answer": true,
    "why": "Longer loops build a steeper medullary osmotic gradient, allowing greater water reabsorption."
   },
   {
    "id": "nature-L9-t5",
    "s": "Oxygen has a lower reduction potential than sulfate, so it releases less energy when reduced.",
    "answer": false,
    "why": "Oxygen has a higher (more positive) reduction potential than sulfate, releasing more energy."
   },
   {
    "id": "nature-L9-t6",
    "s": "Non-competitive inhibition can be reversed by increasing the substrate concentration.",
    "answer": false,
    "why": "Non-competitive inhibitors bind at a site other than the active site and cannot be outcompeted by substrate."
   },
   {
    "id": "nature-L9-t7",
    "s": "The CFTR protein is a chloride channel located in the apical membrane of epithelial cells.",
    "answer": true,
    "why": "CFTR mediates chloride transport across the apical surface of epithelial cells."
   },
   {
    "id": "nature-L9-t8",
    "s": "NADH donates electrons directly to complex II of the electron transport chain.",
    "answer": false,
    "why": "NADH donates electrons to complex I; FADH2 feeds into complex II."
   },
   {
    "id": "nature-L9-t9",
    "s": "Rubisco can catalyse both carboxylation and oxygenation reactions, which is the basis of photorespiration.",
    "answer": true,
    "why": "Rubisco's dual specificity leads to photorespiration when oxygen competes with carbon dioxide."
   },
   {
    "id": "nature-L9-t10",
    "s": "The resting membrane potential of a typical neuron is close to the potassium equilibrium potential because the membrane is more permeable to K+ than to Na+.",
    "answer": true,
    "why": "Higher K+ permeability makes the resting potential approach E(K+)."
   },
   {
    "id": "nature-L9-t11",
    "s": "A nonsense mutation always produces a shorter, non-functional protein.",
    "answer": false,
    "why": "Alternative splicing or readthrough can sometimes yield functional protein; it is not always non-functional."
   },
   {
    "id": "nature-L9-t12",
    "s": "The loop of Henle countercurrent multiplier creates a hypertonic medulla that aids water reabsorption.",
    "answer": true,
    "why": "The gradient allows concentrated urine formation."
   },
   {
    "id": "nature-L9-t13",
    "s": "Competitive inhibitors raise Km and reduce Vmax.",
    "answer": false,
    "why": "Competitive inhibitors raise Km but do not change Vmax."
   },
   {
    "id": "nature-L9-t14",
    "s": "CFTR is a chloride channel, and its dysfunction leads to thick mucus in cystic fibrosis.",
    "answer": true,
    "why": "Loss of chloride secretion reduces water movement, thickening mucus."
   },
   {
    "id": "nature-L9-t15",
    "s": "Oxygen has a lower reduction potential than nitrate, so it accepts electrons less readily.",
    "answer": false,
    "why": "Oxygen has a higher reduction potential and accepts electrons more readily."
   },
   {
    "id": "nature-L9-t16",
    "s": "The spindle assembly checkpoint prevents anaphase until all chromosomes are attached to the spindle.",
    "answer": true,
    "why": "It ensures proper kinetochore attachment before anaphase."
   },
   {
    "id": "nature-L9-t17",
    "s": "Non-competitive inhibitors reduce Vmax and increase Km.",
    "answer": false,
    "why": "Non-competitive inhibitors reduce Vmax but Km is usually unchanged."
   },
   {
    "id": "nature-L9-t18",
    "s": "Misfolded CFTR is retained in the endoplasmic reticulum and degraded.",
    "answer": true,
    "why": "ER quality control prevents its transport to the membrane."
   },
   {
    "id": "nature-L9-t19",
    "s": "The loop of Henle in a desert mammal is typically longer than in an aquatic mammal, aiding water conservation.",
    "answer": true,
    "why": "Longer loops build a steeper medullary gradient and allow more concentrated urine."
   },
   {
    "id": "nature-L9-t20",
    "s": "Ubiquitin tagging targets proteins for degradation by the proteasome.",
    "answer": true,
    "why": "Polyubiquitin chains mark proteins for recognition and breakdown by the proteasome."
   },
   {
    "id": "nature-L9-t21",
    "s": "The CFTR protein is a sodium channel found on the basolateral membrane of epithelial cells.",
    "answer": false,
    "why": "CFTR is a chloride channel located on the apical membrane of epithelial cells."
   },
   {
    "id": "nature-L9-t22",
    "s": "Resting membrane potential is maintained largely by the sodium-potassium pump and potassium leak channels.",
    "answer": true,
    "why": "The pump sets ion gradients and K+ leak channels keep the membrane near EK."
   },
   {
    "id": "nature-L9-t23",
    "s": "In eukaryotes, the majority of ATP produced from complete oxidation of glucose is generated by oxidative phosphorylation.",
    "answer": true,
    "why": "Most ATP comes from the electron transport chain and chemiosmosis, not from glycolysis or the Krebs cycle directly."
   },
   {
    "id": "nature-L9-t24",
    "s": "During the light-dependent reactions, water is split at photosystem II to replace electrons lost by chlorophyll.",
    "answer": true,
    "why": "Photolysis of water supplies electrons to P680 in photosystem II."
   }
  ],
  "terms": [
   {
    "id": "nature-L9-w1",
    "word": "UBIQUITIN",
    "clue": "Small protein tag marking others for proteasomal destruction"
   },
   {
    "id": "nature-L9-w2",
    "word": "PHOTOLYSIS",
    "clue": "Light-driven splitting of water at photosystem II"
   },
   {
    "id": "nature-L9-w3",
    "word": "MEIOSIS",
    "clue": "Reduction division producing haploid gametes from diploid cells"
   },
   {
    "id": "nature-L9-w4",
    "word": "ENDOSYMBIOSIS",
    "clue": "Theory that mitochondria and chloroplasts arose from engulfed bacteria"
   },
   {
    "id": "nature-L9-w5",
    "word": "TRANSCRIPTION",
    "clue": "Synthesis of RNA from a DNA template by RNA polymerase"
   },
   {
    "id": "nature-L9-w6",
    "word": "SUCCESSION",
    "clue": "Predictable sequence of community change over time in an area"
   },
   {
    "id": "nature-L9-w7",
    "word": "CHEMIOSMOSIS",
    "clue": "ATP synthesis driven by a proton gradient across a membrane"
   },
   {
    "id": "nature-L9-w8",
    "word": "EPISTASIS",
    "clue": "One gene masks the phenotypic effect of another gene"
   },
   {
    "id": "nature-L9-w9",
    "word": "OSMOREGULATION",
    "clue": "Control of water and solute balance in an organism"
   },
   {
    "id": "nature-L9-w10",
    "word": "BIODIVERSITY",
    "clue": "Variety of species and genetic variation in an ecosystem"
   },
   {
    "id": "nature-L9-w11",
    "word": "ALLOSTERIC",
    "clue": "Describes an enzyme regulated by binding at a site other than the active site"
   },
   {
    "id": "nature-L9-w12",
    "word": "KINETOCHORE",
    "clue": "Protein structure where spindle fibres attach to a chromosome"
   },
   {
    "id": "nature-L9-w13",
    "word": "COUNTERCURRENT",
    "clue": "Arrangement of flow in opposite directions in the loop of Henle"
   },
   {
    "id": "nature-L9-w14",
    "word": "NONSENSE",
    "clue": "Mutation creating a premature stop codon"
   },
   {
    "id": "nature-L9-w15",
    "word": "FRAMESHIFT",
    "clue": "Mutation shifting the reading frame of codons"
   }
  ]
 },
 "10": {
  "questions": [
   {
    "id": "nature-L10-q1",
    "q": "A cell is treated with a drug that blocks the enzyme that attaches ubiquitin to target proteins. Which process is most directly inhibited?",
    "options": [
     "Vesicular transport from ER to Golgi",
     "Transcription of ribosomal RNA",
     "Proteasomal degradation of damaged proteins",
     "Glycosylation of secreted proteins",
     "Translation initiation at the ribosome"
    ],
    "answer": 2,
    "why": "Ubiquitin tagging by E3 ligases marks proteins for recognition and destruction by the proteasome; blocking attachment prevents this degradation pathway.",
    "hint": "Think about what the ubiquitin tag is for."
   },
   {
    "id": "nature-L10-q2",
    "q": "In a eukaryotic gene with five exons, a nonsense mutation in exon 3 produces a truncated protein. Which outcome is most likely if the mutation lies more than 50 nucleotides upstream of the final exon–exon junction?",
    "options": [
     "Loss of the poly-A tail only",
     "Complete failure of transcription",
     "Silencing of the gene by methylation",
     "Duplication of exon 3",
     "Nonsense-mediated decay of the mRNA"
    ],
    "answer": 4,
    "why": "Nonsense-mediated decay is triggered when a premature termination codon lies more than about 50 nt upstream of the last exon junction.",
    "hint": "Consider quality-control of mRNA, not the protein."
   },
   {
    "id": "nature-L10-q3",
    "q": "A neuron has a resting potential of −70 mV and a K+ equilibrium potential of −90 mV. If the membrane becomes more permeable to K+, what happens to the membrane potential?",
    "options": [
     "It reverses to +70 mV",
     "It stays exactly at −70 mV",
     "It moves toward +30 mV",
     "It moves toward 0 mV",
     "It moves toward −90 mV"
    ],
    "answer": 4,
    "why": "Increasing K+ permeability pulls the membrane potential closer to the K+ equilibrium potential of −90 mV.",
    "hint": "The membrane potential follows the dominant ion's equilibrium potential."
   },
   {
    "id": "nature-L10-q4",
    "q": "The Calvin cycle stops soon after a plant is moved to darkness even though ATP and NADPH remain briefly available. Which explanation is most accurate?",
    "options": [
     "The cycle requires oxygen produced in light",
     "Stomata close immediately and stop all CO2 entry",
     "Several Calvin-cycle enzymes are light-activated and deactivate in darkness",
     "ATP and NADPH are destroyed instantly in darkness",
     "Rubisco cannot bind CO2 without light"
    ],
    "answer": 2,
    "why": "Enzymes such as rubisco activase and several Calvin-cycle enzymes are regulated by light-dependent thioredoxin systems and lose activity in darkness.",
    "hint": "Think about enzyme regulation by light, not just substrate supply."
   },
   {
    "id": "nature-L10-q5",
    "q": "A patient has a CFTR mutation causing misfolded protein retained in the ER. Which consequence is most direct at the apical membrane of airway epithelial cells?",
    "options": [
     "Increased chloride secretion and watery mucus",
     "Reduced chloride secretion and thickened mucus",
     "Loss of aquaporin insertion",
     "Loss of sodium-potassium pump activity",
     "Failure of glucose reabsorption"
    ],
    "answer": 1,
    "why": "Without CFTR at the apical membrane, chloride secretion falls and mucus becomes dehydrated and thick, as in cystic fibrosis.",
    "hint": "CFTR is a chloride channel at the apical surface."
   },
   {
    "id": "nature-L10-q6",
    "q": "Which observation best distinguishes competitive from non-competitive inhibition in an enzyme assay?",
    "options": [
     "Competitive inhibition raises apparent Km with unchanged Vmax",
     "Competitive inhibition lowers Vmax with unchanged Km",
     "Non-competitive inhibition is reversed by more substrate",
     "Non-competitive inhibition raises Vmax",
     "Both inhibitors raise Km and lower Vmax equally"
    ],
    "answer": 0,
    "why": "Competitive inhibitors are overcome by high substrate, so Vmax is unchanged but apparent Km rises; non-competitive inhibition lowers Vmax.",
    "hint": "Consider what excess substrate can overcome."
   },
   {
    "id": "nature-L10-q7",
    "q": "A drug prevents attachment of the mitotic spindle to kinetochores. Which cell-cycle checkpoint is most directly activated?",
    "options": [
     "The spindle assembly checkpoint at metaphase",
     "The G1/S restriction point",
     "The origin licensing checkpoint",
     "The DNA damage checkpoint in G2",
     "The cytokinesis checkpoint"
    ],
    "answer": 0,
    "why": "Unattached kinetochores activate the spindle assembly checkpoint, delaying anaphase until chromosomes are properly attached.",
    "hint": "Which checkpoint monitors chromosome attachment?"
   },
   {
    "id": "nature-L10-q8",
    "q": "In the mammalian kidney, which feature is most important for producing concentrated urine?",
    "options": [
     "A long loop of Henle with a steep medullary osmotic gradient",
     "High glomerular filtration rate",
     "Large numbers of podocytes",
     "A short loop of Henle",
     "High renal blood flow"
    ],
    "answer": 0,
    "why": "The countercurrent multiplier of a long loop of Henle establishes the medullary osmotic gradient needed for water reabsorption and concentrated urine.",
    "hint": "Think about the osmotic gradient in the medulla."
   },
   {
    "id": "nature-L10-q9",
    "q": "A frameshift mutation occurs near the start of a coding sequence. Which outcome is most likely?",
    "options": [
     "Premature stopping without any downstream change",
     "A single amino acid substitution only",
     "No change to the protein sequence",
     "A completely different, usually non-functional protein",
     "Duplication of the whole chromosome"
    ],
    "answer": 3,
    "why": "A frameshift near the start alters every downstream codon, producing a radically different and usually non-functional protein.",
    "hint": "Consider how the reading frame is affected."
   },
   {
    "id": "nature-L10-q10",
    "q": "In an operon under negative control, a repressor protein binds the operator. Which condition most directly relieves repression?",
    "options": [
     "Binding of an inducer to the repressor, reducing its DNA affinity",
     "Phosphorylation of the operator DNA",
     "Binding of a corepressor to the repressor",
     "Increased transcription of the repressor gene",
     "Binding of RNA polymerase to the operator"
    ],
    "answer": 0,
    "why": "An inducer binds the repressor and lowers its affinity for the operator, allowing transcription, as in the lac operon.",
    "hint": "What happens to a repressor when an inducer binds it?"
   },
   {
    "id": "nature-L10-q11",
    "q": "Which statement best explains why a nonsense mutation in the final exon of a gene often has a milder effect than one in an early exon?",
    "options": [
     "The final exon is not translated",
     "The mutation cannot change the amino acid sequence",
     "Ribosomes skip the final exon",
     "Nonsense-mediated decay is stronger for final exons",
     "The truncated protein retains more functional domains"
    ],
    "answer": 4,
    "why": "A mutation near the end removes fewer domains, so the truncated protein is more likely to retain partial function; such transcripts also escape nonsense-mediated decay.",
    "hint": "Think about how much of the protein is lost."
   },
   {
    "id": "nature-L10-q12",
    "q": "A cell is treated with a drug that blocks the enzyme that attaches ubiquitin to target proteins. Which outcome is most likely?",
    "options": [
     "Proteasomes stop recognising ubiquitin",
     "Autophagy is directly inhibited",
     "Ubiquitinated proteins accumulate",
     "Misfolded proteins are degraded faster",
     "Proteasomal degradation of short-lived proteins slows"
    ],
    "answer": 4,
    "why": "Ubiquitin attachment (E1/E2/E3 cascade) is the signal for proteasomal degradation; blocking it slows turnover of short-lived proteins.",
    "hint": "Think about what ubiquitin tags proteins for."
   },
   {
    "id": "nature-L10-q13",
    "q": "Which statement best explains why the Calvin cycle stops soon after a plant is moved to darkness, even though ATP and NADPH are still transiently present?",
    "options": [
     "Stomata close and stop all gas exchange",
     "ATP synthase reverses immediately",
     "Several Calvin cycle enzymes are light-activated via thioredoxin",
     "Regeneration of RuBP requires light directly",
     "Rubisco is denatured by darkness"
    ],
    "answer": 2,
    "why": "Light activates Calvin cycle enzymes (e.g. via thioredoxin reduction by ferredoxin), so darkness inactivates them even before ATP/NADPH run out.",
    "hint": "Consider enzyme regulation by light, not just energy supply."
   },
   {
    "id": "nature-L10-q14",
    "q": "A drug inhibits the CFTR chloride channel so that chloride cannot be secreted onto the airway surface. What is the most direct consequence for mucus?",
    "options": [
     "Mucus becomes more viscous and sticky",
     "Sodium absorption stops",
     "Cilia beat faster",
     "Bicarbonate secretion increases",
     "Mucus becomes more hydrated"
    ],
    "answer": 0,
    "why": "Loss of chloride secretion (and accompanying water) makes airway surface liquid hypotonic and mucus dehydrated and viscous.",
    "hint": "Chloride secretion drags water with it."
   }
  ],
  "truths": [
   {
    "id": "nature-L10-t1",
    "s": "In the lac operon, CAP–cAMP binding to the promoter region enhances transcription when glucose is scarce.",
    "answer": true,
    "why": "CAP–cAMP acts as a positive regulator that increases RNA polymerase binding when glucose is low."
   },
   {
    "id": "nature-L10-t2",
    "s": "Nonsense-mediated decay is triggered by premature stop codons located more than about 50 nucleotides upstream of the last exon–exon junction.",
    "answer": true,
    "why": "This positional rule distinguishes premature from normal termination codons in mammalian mRNAs."
   },
   {
    "id": "nature-L10-t3",
    "s": "Competitive inhibitors lower the Vmax of an enzyme-catalysed reaction.",
    "answer": false,
    "why": "Competitive inhibitors raise apparent Km but leave Vmax unchanged at saturating substrate."
   },
   {
    "id": "nature-L10-t4",
    "s": "The loop of Henle countercurrent multiplier is essential for producing concentrated urine in mammals.",
    "answer": true,
    "why": "It establishes the medullary osmotic gradient used for water reabsorption."
   },
   {
    "id": "nature-L10-t5",
    "s": "Oxygen has a lower standard reduction potential than nitrate, so it releases less energy per electron.",
    "answer": false,
    "why": "Oxygen has a higher reduction potential than nitrate and releases more energy per electron."
   },
   {
    "id": "nature-L10-t6",
    "s": "The spindle assembly checkpoint delays anaphase until all kinetochores are attached to spindle microtubules.",
    "answer": true,
    "why": "Unattached kinetochores generate a signal that inhibits anaphase onset."
   },
   {
    "id": "nature-L10-t7",
    "s": "Ubiquitin attachment targets proteins for degradation by the proteasome.",
    "answer": true,
    "why": "Polyubiquitin chains are the signal recognised by the proteasome."
   },
   {
    "id": "nature-L10-t8",
    "s": "A frameshift mutation near the start of a coding sequence usually leaves the protein unchanged.",
    "answer": false,
    "why": "A frameshift alters all downstream codons, usually producing a very different protein."
   },
   {
    "id": "nature-L10-t9",
    "s": "Rubisco activase and several Calvin-cycle enzymes are regulated by light through thioredoxin systems.",
    "answer": true,
    "why": "Light-driven redox regulation activates several Calvin-cycle enzymes."
   },
   {
    "id": "nature-L10-t10",
    "s": "In negative control of an operon, an inducer binds the operator DNA directly to relieve repression.",
    "answer": false,
    "why": "An inducer binds the repressor protein, not the operator DNA."
   },
   {
    "id": "nature-L10-t11",
    "s": "In stationary phase, bacterial growth rate equals death rate as nutrients become limiting.",
    "answer": true,
    "why": "The plateau reflects balanced division and death."
   },
   {
    "id": "nature-L10-t12",
    "s": "A nonsense mutation in the final exon of a gene is always more severe than one in the first exon.",
    "answer": false,
    "why": "Truncation near the end usually removes fewer functional domains and is often milder."
   },
   {
    "id": "nature-L10-t13",
    "s": "CFTR is a chloride channel located at the apical membrane of epithelial cells.",
    "answer": true,
    "why": "CFTR mediates apical chloride secretion in epithelia."
   },
   {
    "id": "nature-L10-t14",
    "s": "Non-competitive inhibitors are overcome by increasing substrate concentration.",
    "answer": false,
    "why": "Non-competitive inhibition lowers Vmax and is not reversed by more substrate."
   },
   {
    "id": "nature-L10-t15",
    "s": "The K+ equilibrium potential is typically more negative than the resting membrane potential of a neuron.",
    "answer": true,
    "why": "EK is often around −90 mV, more negative than the −70 mV resting potential."
   },
   {
    "id": "nature-L10-t16",
    "s": "A nonsense mutation in exon 3 of 5 always escapes nonsense-mediated decay.",
    "answer": false,
    "why": "It lies upstream of the last exon junction and is typically targeted by NMD."
   },
   {
    "id": "nature-L10-t17",
    "s": "Oxygen is the terminal electron acceptor in the mitochondrial electron transport chain.",
    "answer": true,
    "why": "Complex IV transfers electrons to oxygen to form water."
   },
   {
    "id": "nature-L10-t18",
    "s": "A mutation that prevents CFTR reaching the apical membrane increases chloride secretion.",
    "answer": false,
    "why": "Loss of apical CFTR reduces chloride secretion, thickening mucus."
   },
   {
    "id": "nature-L10-t19",
    "s": "In eukaryotes, the signal recognition particle (SRP) binds the signal peptide of proteins destined for the secretory pathway and pauses translation at the ribosome.",
    "answer": true,
    "why": "SRP binds the signal peptide and arrests translation until the ribosome docks at the ER translocon."
   },
   {
    "id": "nature-L10-t20",
    "s": "A nonsense mutation in exon 3 of a five-exon gene usually triggers nonsense-mediated decay if the premature stop codon lies more than about 50–55 nucleotides upstream of the last exon–exon junction.",
    "answer": true,
    "why": "That is the classic rule for NMD in mammalian cells."
   }
  ],
  "terms": [
   {
    "id": "nature-L10-w1",
    "word": "UBIQUITIN",
    "clue": "Small protein tag marking targets for proteasomal destruction"
   },
   {
    "id": "nature-L10-w2",
    "word": "KINETOCHORE",
    "clue": "Protein structure on centromere where spindle fibres attach"
   },
   {
    "id": "nature-L10-w3",
    "word": "THIOREDOXIN",
    "clue": "Redox protein activating Calvin-cycle enzymes in light"
   },
   {
    "id": "nature-L10-w4",
    "word": "PROTEASOME",
    "clue": "Cylindrical complex degrading ubiquitin-tagged proteins"
   },
   {
    "id": "nature-L10-w5",
    "word": "COUNTERCURRENT",
    "clue": "Opposite flows in loop of Henle building osmotic gradient"
   },
   {
    "id": "nature-L10-w6",
    "word": "NONSENSE",
    "clue": "Type of mutation creating a premature stop codon"
   },
   {
    "id": "nature-L10-w7",
    "word": "REPRESSOR",
    "clue": "Protein binding operator to block transcription"
   },
   {
    "id": "nature-L10-w8",
    "word": "EXOCYTOSIS",
    "clue": "Vesicle fusion releasing contents outside the cell"
   },
   {
    "id": "nature-L10-w9",
    "word": "CHEMIOSMOSIS",
    "clue": "Proton gradient driving ATP synthesis across a membrane"
   }
  ]
 }
};
