// Written by scripts/world-content.ts (writer deepseek-v4.1-flash-1017, checker qwen3.8-27b, auditor glm-5.3-flash). Don't edit by hand.
import type { WorldBank } from '../types.js';

export const HISTORY_BANK: WorldBank = {
 "1": {
  "questions": [
   {
    "id": "history-L1-q1",
    "q": "Which ancient civilisation built the pyramids at Giza?",
    "options": [
     "Ancient Egypt",
     "Ancient Greece",
     "Ancient Rome",
     "Ancient China"
    ],
    "answer": 0,
    "why": "The pyramids at Giza were built in ancient Egypt as tombs for pharaohs.",
    "hint": "Think of the Nile and pharaohs."
   },
   {
    "id": "history-L1-q2",
    "q": "Which river was the centre of the earliest civilisations in Mesopotamia?",
    "options": [
     "The Tigris and Euphrates",
     "The Indus",
     "The Yellow River",
     "The Nile"
    ],
    "answer": 0,
    "why": "Mesopotamia means 'land between rivers', referring to the Tigris and Euphrates.",
    "hint": "Mesopotamia is a Greek name meaning 'between rivers'."
   },
   {
    "id": "history-L1-q3",
    "q": "Who was the leader of the Mongol Empire who united the tribes in the early 1200s?",
    "options": [
     "Attila",
     "Genghis Khan",
     "Alexander the Great",
     "Kublai Khan"
    ],
    "answer": 1,
    "why": "Genghis Khan united the Mongol tribes and founded the Mongol Empire.",
    "hint": "His name is also a title meaning 'universal ruler'."
   },
   {
    "id": "history-L1-q4",
    "q": "Which empire was ruled from Constantinople after the Roman Empire split?",
    "options": [
     "The Mughal Empire",
     "The Ottoman Empire",
     "The Persian Empire",
     "The Byzantine Empire"
    ],
    "answer": 3,
    "why": "The eastern Roman Empire, known as the Byzantine Empire, had its capital at Constantinople.",
    "hint": "It is the eastern half of the old Roman Empire."
   },
   {
    "id": "history-L1-q5",
    "q": "In which country did the French Revolution begin in 1789?",
    "options": [
     "Spain",
     "Italy",
     "Britain",
     "France"
    ],
    "answer": 3,
    "why": "The French Revolution began in France in 1789 with the storming of the Bastille.",
    "hint": "The Bastille was a prison in its capital city."
   },
   {
    "id": "history-L1-q6",
    "q": "Which continent was colonised by European powers in the 'Scramble' of the late 1800s?",
    "options": [
     "Europe",
     "Antarctica",
     "Africa",
     "Australia"
    ],
    "answer": 2,
    "why": "The Scramble for Africa was the rapid European colonisation of Africa in the late 19th century.",
    "hint": "The Berlin Conference of 1884–85 divided this continent."
   },
   {
    "id": "history-L1-q7",
    "q": "Who was the leader of India's non-violent independence movement?",
    "options": [
     "Nelson Mandela",
     "Mahatma Gandhi",
     "Kwame Nkrumah",
     "Jawaharlal Nehru"
    ],
    "answer": 1,
    "why": "Mahatma Gandhi led India's movement for independence using non-violent protest.",
    "hint": "He is famous for the Salt March."
   },
   {
    "id": "history-L1-q8",
    "q": "What is a system of government in which citizens vote for their leaders called?",
    "options": [
     "Monarchy",
     "Theocracy",
     "Democracy",
     "Dictatorship"
    ],
    "answer": 2,
    "why": "In a democracy, citizens choose their leaders by voting.",
    "hint": "The word comes from Greek for 'rule by the people'."
   },
   {
    "id": "history-L1-q9",
    "q": "Which ancient civilisation developed along the Indus River?",
    "options": [
     "The Aztec Empire",
     "Ancient Egypt",
     "The Indus Valley civilisation",
     "Ancient Rome"
    ],
    "answer": 2,
    "why": "The Indus Valley civilisation grew along the Indus River in what is now Pakistan and India.",
    "hint": "Its cities include Mohenjo-daro and Harappa."
   },
   {
    "id": "history-L1-q10",
    "q": "Which country was the first to industrialise in the 1700s?",
    "options": [
     "Britain",
     "Germany",
     "France",
     "The United States"
    ],
    "answer": 0,
    "why": "Britain was the first country to industrialise, starting in the 18th century.",
    "hint": "Think of steam engines and textile mills in the north of this country."
   },
   {
    "id": "history-L1-q11",
    "q": "Who was the Aztec capital conquered by the Spanish in 1521?",
    "options": [
     "Chichen Itza",
     "Machu Picchu",
     "Tenochtitlan",
     "Cusco"
    ],
    "answer": 2,
    "why": "The Spanish under Cortés conquered Tenochtitlan, the Aztec capital, in 1521.",
    "hint": "It is now the site of Mexico City."
   },
   {
    "id": "history-L1-q12",
    "q": "Which organisation was founded in 1945 to keep world peace?",
    "options": [
     "The United Nations",
     "The League of Nations",
     "The European Union",
     "NATO"
    ],
    "answer": 0,
    "why": "The United Nations was founded in 1945 after the Second World War to promote peace.",
    "hint": "Its headquarters are in New York."
   }
  ],
  "truths": [
   {
    "id": "history-L1-t1",
    "s": "The pyramids at Giza were built in ancient Egypt.",
    "answer": true,
    "why": "The Giza pyramids were built as tombs for Egyptian pharaohs."
   },
   {
    "id": "history-L1-t2",
    "s": "The Roman Empire was ruled from Athens.",
    "answer": false,
    "why": "Rome was the capital of the Roman Empire, not Athens."
   },
   {
    "id": "history-L1-t3",
    "s": "Genghis Khan led the Mongol Empire.",
    "answer": true,
    "why": "Genghis Khan founded and led the Mongol Empire."
   },
   {
    "id": "history-L1-t4",
    "s": "The French Revolution began in 1789.",
    "answer": true,
    "why": "The storming of the Bastille took place in 1789."
   },
   {
    "id": "history-L1-t5",
    "s": "The Scramble for Africa took place in the 1600s.",
    "answer": false,
    "why": "The Scramble for Africa happened in the late 1800s, not the 1600s."
   },
   {
    "id": "history-L1-t6",
    "s": "Mahatma Gandhi led India's independence movement.",
    "answer": true,
    "why": "Gandhi was a leader of India's non-violent independence struggle."
   },
   {
    "id": "history-L1-t7",
    "s": "The Second World War ended in 1945.",
    "answer": true,
    "why": "The war in Europe ended in May 1945 and in Asia in September 1945."
   },
   {
    "id": "history-L1-t8",
    "s": "The United Nations was founded in 1919.",
    "answer": false,
    "why": "The United Nations was founded in 1945; the League of Nations was founded in 1919."
   },
   {
    "id": "history-L1-t9",
    "s": "The Indus Valley civilisation grew along the Indus River.",
    "answer": true,
    "why": "Its cities such as Harappa and Mohenjo-daro were on the Indus and its tributaries."
   },
   {
    "id": "history-L1-t10",
    "s": "Britain was the first country to industrialise.",
    "answer": true,
    "why": "The Industrial Revolution began in Britain in the 18th century."
   },
   {
    "id": "history-L1-t11",
    "s": "The Aztec capital was called Cusco.",
    "answer": false,
    "why": "The Aztec capital was Tenochtitlan; Cusco was the Inca capital."
   },
   {
    "id": "history-L1-t12",
    "s": "A democracy is a system where citizens vote for their leaders.",
    "answer": true,
    "why": "Democracy means rule by the people, usually through elections."
   },
   {
    "id": "history-L1-t13",
    "s": "The Byzantine Empire had its capital at Rome.",
    "answer": false,
    "why": "The Byzantine capital was Constantinople, not Rome."
   },
   {
    "id": "history-L1-t14",
    "s": "Alexander the Great came from Macedon.",
    "answer": true,
    "why": "Alexander was king of Macedon in ancient Greece."
   },
   {
    "id": "history-L1-t15",
    "s": "The Ottoman Empire conquered Constantinople in 1453.",
    "answer": true,
    "why": "The Ottomans captured Constantinople in 1453, ending the Byzantine Empire."
   },
   {
    "id": "history-L1-t16",
    "s": "The American Declaration of Independence was signed in 1776.",
    "answer": true,
    "why": "The Declaration was adopted on 4 July 1776."
   },
   {
    "id": "history-L1-t17",
    "s": "Nelson Mandela was the first president of independent India.",
    "answer": false,
    "why": "Mandela was president of South Africa; India's first prime minister was Nehru."
   },
   {
    "id": "history-L1-t18",
    "s": "The League of Nations was set up after the First World War.",
    "answer": true,
    "why": "The League was founded in 1920 following the First World War."
   }
  ],
  "terms": [
   {
    "id": "history-L1-w1",
    "word": "PHARAOH",
    "clue": "Ancient Egyptian king treated as a god"
   },
   {
    "id": "history-L1-w2",
    "word": "EMPIRE",
    "clue": "A group of lands ruled by one leader"
   },
   {
    "id": "history-L1-w3",
    "word": "COLONY",
    "clue": "A territory ruled by a distant country"
   },
   {
    "id": "history-L1-w4",
    "word": "TREATY",
    "clue": "A formal written agreement between countries"
   },
   {
    "id": "history-L1-w5",
    "word": "MONARCHY",
    "clue": "A system ruled by a king or queen"
   },
   {
    "id": "history-L1-w6",
    "word": "SENATE",
    "clue": "A council of lawmakers, as in ancient Rome"
   },
   {
    "id": "history-L1-w7",
    "word": "DYNASTY",
    "clue": "A line of rulers from the same family"
   },
   {
    "id": "history-L1-w8",
    "word": "CITIZEN",
    "clue": "A person with legal rights in a state"
   }
  ]
 },
 "2": {
  "questions": [
   {
    "id": "history-L2-q1",
    "q": "Who was the queen of ancient Egypt whose name is linked to a famous bust and to the city of Amarna?",
    "options": [
     "Hatshepsut",
     "Cleopatra",
     "Boudicca",
     "Nefertiti"
    ],
    "answer": 3,
    "why": "Nefertiti was the wife of Pharaoh Akhenaten and is famous for a well-known sculpture of her head.",
    "hint": "She lived in the 1300s BCE, not in Roman times."
   },
   {
    "id": "history-L2-q2",
    "q": "Which country did Japan attack at Pearl Harbor in 1941, bringing it into the Second World War?",
    "options": [
     "United States",
     "United Kingdom",
     "Australia",
     "China"
    ],
    "answer": 0,
    "why": "Japan's attack on the US naval base at Pearl Harbor led the United States to enter the war.",
    "hint": "The base is in Hawaii."
   },
   {
    "id": "history-L2-q3",
    "q": "Which document, signed in England in 1215, limited the power of the king?",
    "options": [
     "Bill of Rights",
     "Magna Carta",
     "Treaty of Versailles",
     "Declaration of Independence"
    ],
    "answer": 1,
    "why": "Magna Carta was sealed by King John in 1215 and set limits on royal power.",
    "hint": "Its Latin name means 'Great Charter'."
   },
   {
    "id": "history-L2-q4",
    "q": "Which ancient civilisation was based in the Andes and built the city of Machu Picchu?",
    "options": [
     "Aztec",
     "Inca",
     "Olmec",
     "Maya"
    ],
    "answer": 1,
    "why": "The Inca civilisation of South America built Machu Picchu high in the Andes.",
    "hint": "Their empire was centred in what is now Peru."
   },
   {
    "id": "history-L2-q5",
    "q": "Which revolution in the 1700s led to the United States becoming independent from Britain?",
    "options": [
     "Industrial Revolution",
     "American Revolution",
     "French Revolution",
     "Russian Revolution"
    ],
    "answer": 1,
    "why": "The American Revolution ended with independence from Britain in 1783.",
    "hint": "It began in the thirteen colonies."
   },
   {
    "id": "history-L2-q6",
    "q": "Who led the expedition that first sailed around the world, though he died before the voyage ended?",
    "options": [
     "James Cook",
     "Vasco da Gama",
     "Christopher Columbus",
     "Ferdinand Magellan"
    ],
    "answer": 3,
    "why": "Magellan's expedition began the first circumnavigation of the globe in 1519.",
    "hint": "A strait at the tip of South America is named after him."
   },
   {
    "id": "history-L2-q7",
    "q": "Which form of government is ruled by a king or queen whose power is usually inherited?",
    "options": [
     "Monarchy",
     "Republic",
     "Federation",
     "Democracy"
    ],
    "answer": 0,
    "why": "In a monarchy, a king or queen is head of state, often inheriting the position.",
    "hint": "The word comes from Greek for 'rule by one'."
   },
   {
    "id": "history-L2-q8",
    "q": "Which country was divided into East and West during the Cold War, with a wall through its capital?",
    "options": [
     "Hungary",
     "Poland",
     "Austria",
     "Germany"
    ],
    "answer": 3,
    "why": "Germany was split after the Second World War, and Berlin was divided by a wall from 1961.",
    "hint": "The wall fell in 1989."
   },
   {
    "id": "history-L2-q9",
    "q": "Which ancient empire was centred on Rome and spread across the Mediterranean?",
    "options": [
     "Ottoman Empire",
     "Roman Empire",
     "Byzantine Empire",
     "Persian Empire"
    ],
    "answer": 1,
    "why": "The Roman Empire grew from the city of Rome and controlled lands around the Mediterranean.",
    "hint": "Its capital city gave the empire its name."
   },
   {
    "id": "history-L2-q10",
    "q": "Which movement in the 1800s campaigned to end slavery in the British Empire?",
    "options": [
     "Abolitionism",
     "Suffragism",
     "Militarism",
     "Nationalism"
    ],
    "answer": 0,
    "why": "Abolitionists campaigned against slavery, which Britain abolished in its empire in 1833.",
    "hint": "The word comes from 'abolish'."
   },
   {
    "id": "history-L2-q11",
    "q": "Which empire was ruled by Suleiman the Magnificent in the 1500s?",
    "options": [
     "Spanish Empire",
     "Songhai Empire",
     "Mughal Empire",
     "Ottoman Empire"
    ],
    "answer": 3,
    "why": "Suleiman the Magnificent ruled the Ottoman Empire at its height in the 1500s.",
    "hint": "Its capital was Istanbul, formerly Constantinople."
   },
   {
    "id": "history-L2-q12",
    "q": "Which organisation of countries was set up in 1945 to keep peace after the Second World War?",
    "options": [
     "League of Nations",
     "NATO",
     "European Union",
     "United Nations"
    ],
    "answer": 3,
    "why": "The United Nations was founded in 1945 to promote peace and cooperation.",
    "hint": "Its headquarters are in New York."
   }
  ],
  "truths": [
   {
    "id": "history-L2-t1",
    "s": "The Great Wall of China was built to defend against invaders from the north.",
    "answer": true,
    "why": "Chinese rulers built and extended walls over centuries to protect against northern attacks."
   },
   {
    "id": "history-L2-t2",
    "s": "The French Revolution began in 1789.",
    "answer": true,
    "why": "The storming of the Bastille in Paris took place in July 1789."
   },
   {
    "id": "history-L2-t3",
    "s": "Julius Caesar was the first emperor of Rome.",
    "answer": false,
    "why": "Julius Caesar was a dictator; Augustus became the first Roman emperor."
   },
   {
    "id": "history-L2-t4",
    "s": "The First World War ended in 1918.",
    "answer": true,
    "why": "Fighting stopped with the armistice of November 1918."
   },
   {
    "id": "history-L2-t5",
    "s": "The Aztec Empire was located in what is now Mexico.",
    "answer": true,
    "why": "The Aztec capital, Tenochtitlan, stood where Mexico City is today."
   },
   {
    "id": "history-L2-t6",
    "s": "The Industrial Revolution began in France in the 1700s.",
    "answer": false,
    "why": "It began in Britain, not France."
   },
   {
    "id": "history-L2-t7",
    "s": "Nelson Mandela became president of South Africa in 1994.",
    "answer": true,
    "why": "He was elected after the end of apartheid."
   },
   {
    "id": "history-L2-t8",
    "s": "The Roman Empire was founded by Alexander the Great.",
    "answer": false,
    "why": "Alexander the Great led Macedon and Persia, not Rome."
   },
   {
    "id": "history-L2-t9",
    "s": "The Berlin Wall fell in 1989.",
    "answer": true,
    "why": "The wall was opened in November 1989."
   },
   {
    "id": "history-L2-t10",
    "s": "The American Civil War was fought between Britain and the United States.",
    "answer": false,
    "why": "It was fought between northern and southern states of the United States."
   },
   {
    "id": "history-L2-t11",
    "s": "The Ottoman Empire captured Constantinople in 1453.",
    "answer": true,
    "why": "The city fell to Sultan Mehmed II in 1453."
   },
   {
    "id": "history-L2-t12",
    "s": "The Silk Road was a sea route between Europe and Australia.",
    "answer": false,
    "why": "It was a network of land and sea trade routes between Asia and Europe."
   },
   {
    "id": "history-L2-t13",
    "s": "Mahatma Gandhi led India's non-violent movement for independence.",
    "answer": true,
    "why": "Gandhi used peaceful protest to campaign for Indian independence."
   },
   {
    "id": "history-L2-t14",
    "s": "The League of Nations was created after the Second World War.",
    "answer": false,
    "why": "It was created after the First World War; the United Nations followed the Second."
   },
   {
    "id": "history-L2-t15",
    "s": "The pyramids at Giza were built in ancient Egypt.",
    "answer": true,
    "why": "They were built as tombs for Egyptian pharaohs."
   },
   {
    "id": "history-L2-t16",
    "s": "Christopher Columbus sailed to India in 1492.",
    "answer": false,
    "why": "He sailed west and reached the Americas, not India."
   },
   {
    "id": "history-L2-t17",
    "s": "The Russian Revolution of 1917 brought the Bolsheviks to power.",
    "answer": true,
    "why": "The Bolsheviks, led by Lenin, took power in 1917."
   },
   {
    "id": "history-L2-t18",
    "s": "The Magna Carta was signed by King Henry VIII.",
    "answer": false,
    "why": "It was sealed by King John in 1215."
   }
  ],
  "terms": [
   {
    "id": "history-L2-w1",
    "word": "PHARAOH",
    "clue": "Title of the ruler of ancient Egypt, seen as a god-king."
   },
   {
    "id": "history-L2-w2",
    "word": "REPUBLIC",
    "clue": "A state whose head is an elected president, not a monarch."
   },
   {
    "id": "history-L2-w3",
    "word": "COLONY",
    "clue": "A territory controlled by another country and settled by its people."
   },
   {
    "id": "history-L2-w4",
    "word": "EMPIRE",
    "clue": "A group of lands or peoples ruled by one powerful state or ruler."
   },
   {
    "id": "history-L2-w5",
    "word": "REVOLT",
    "clue": "A rising up against a ruler or government, often by force."
   },
   {
    "id": "history-L2-w6",
    "word": "TREATY",
    "clue": "A formal written agreement between countries, often ending a war."
   },
   {
    "id": "history-L2-w7",
    "word": "DYNASTY",
    "clue": "A line of rulers from the same family, as in ancient China."
   },
   {
    "id": "history-L2-w8",
    "word": "SENATE",
    "clue": "A law-making council, especially in ancient Rome."
   },
   {
    "id": "history-L2-w9",
    "word": "CONSUL",
    "clue": "One of two chief officials who led the Roman Republic."
   }
  ]
 },
 "3": {
  "questions": [
   {
    "id": "history-L3-q1",
    "q": "Which wall was built across northern Britain by the Romans to mark the edge of their empire?",
    "options": [
     "Hadrian's Wall",
     "Antonine Wall",
     "Great Wall",
     "Berlin Wall"
    ],
    "answer": 0,
    "why": "Hadrian's Wall was built in the 120s CE to mark the northern limit of Roman Britain.",
    "hint": "It is named after a Roman emperor."
   },
   {
    "id": "history-L3-q2",
    "q": "Which city was the capital of the Byzantine Empire?",
    "options": [
     "Constantinople",
     "Athens",
     "Alexandria",
     "Rome"
    ],
    "answer": 0,
    "why": "Constantinople (modern Istanbul) was the capital of the Byzantine Empire for centuries.",
    "hint": "It sits on the strait between Europe and Asia."
   },
   {
    "id": "history-L3-q3",
    "q": "Which trade route linked China with the Mediterranean and carried silk and ideas?",
    "options": [
     "Spice Route",
     "Amber Road",
     "Silk Road",
     "Trans-Saharan route"
    ],
    "answer": 2,
    "why": "The Silk Road was the network of routes linking East Asia with the Mediterranean world.",
    "hint": "It is named after a luxury cloth."
   },
   {
    "id": "history-L3-q4",
    "q": "Which West African empire was famous for its wealth and for the city of Timbuktu?",
    "options": [
     "Songhai Empire",
     "Mali Empire",
     "Ghana Empire",
     "Ethiopian Empire"
    ],
    "answer": 1,
    "why": "The Mali Empire controlled trans-Saharan trade and included Timbuktu, a centre of learning.",
    "hint": "Its most famous ruler was Mansa Musa."
   },
   {
    "id": "history-L3-q5",
    "q": "Which document, adopted in 1789, set out the rights of citizens during the French Revolution?",
    "options": [
     "Magna Carta",
     "Treaty of Versailles",
     "Bill of Rights",
     "Declaration of the Rights of Man"
    ],
    "answer": 3,
    "why": "The Declaration of the Rights of Man and of the Citizen was adopted in 1789.",
    "hint": "It was passed in the first year of the revolution."
   },
   {
    "id": "history-L3-q6",
    "q": "Which country was ruled by the Tokugawa shogunate until 1868?",
    "options": [
     "China",
     "Japan",
     "Vietnam",
     "Korea"
    ],
    "answer": 1,
    "why": "The Tokugawa shoguns ruled Japan from 1603 until the Meiji Restoration in 1868.",
    "hint": "It is an island nation in East Asia."
   },
   {
    "id": "history-L3-q7",
    "q": "Which European country colonised Brazil?",
    "options": [
     "Portugal",
     "Spain",
     "Netherlands",
     "France"
    ],
    "answer": 0,
    "why": "Portugal claimed and colonised Brazil from the 1500s, and Portuguese is still its main language.",
    "hint": "Its language is spoken in Brazil today."
   },
   {
    "id": "history-L3-q8",
    "q": "Which revolution in 1917 led to the creation of a communist state in Russia?",
    "options": [
     "Bolshevik Revolution",
     "French Revolution",
     "American Revolution",
     "Industrial Revolution"
    ],
    "answer": 0,
    "why": "The Bolshevik Revolution of 1917 brought the communists led by Lenin to power in Russia.",
    "hint": "It happened during the First World War."
   },
   {
    "id": "history-L3-q9",
    "q": "Which country was the first to grant women the right to vote in national elections, in 1893?",
    "options": [
     "United Kingdom",
     "Australia",
     "United States",
     "New Zealand"
    ],
    "answer": 3,
    "why": "New Zealand gave women the vote in national elections in 1893.",
    "hint": "It is in Oceania."
   },
   {
    "id": "history-L3-q10",
    "q": "Which organisation was set up in 1949 as a military alliance of Western countries?",
    "options": [
     "European Union",
     "United Nations",
     "NATO",
     "Warsaw Pact"
    ],
    "answer": 2,
    "why": "NATO (North Atlantic Treaty Organisation) was founded in 1949 as a defence alliance.",
    "hint": "Its name includes 'North Atlantic'."
   },
   {
    "id": "history-L3-q11",
    "q": "Which type of government is run by elected representatives and must follow a constitution?",
    "options": [
     "Constitutional democracy",
     "Absolute monarchy",
     "Military dictatorship",
     "One-party state"
    ],
    "answer": 0,
    "why": "In a constitutional democracy, elected representatives govern within limits set by a constitution.",
    "hint": "It combines voting with a set of basic rules."
   }
  ],
  "truths": [
   {
    "id": "history-L3-t1",
    "s": "The Roman Empire was divided into eastern and western parts in 395 CE.",
    "answer": true,
    "why": "The empire was split into East and West in 395 CE, with separate capitals."
   },
   {
    "id": "history-L3-t2",
    "s": "The Magna Carta was signed by King John of England in 1215.",
    "answer": true,
    "why": "King John sealed Magna Carta at Runnymede in 1215."
   },
   {
    "id": "history-L3-t3",
    "s": "The Ottoman Empire captured Constantinople in 1453.",
    "answer": true,
    "why": "The Ottomans took Constantinople in 1453, ending the Byzantine Empire."
   },
   {
    "id": "history-L3-t4",
    "s": "The Industrial Revolution began in France in the 1700s.",
    "answer": false,
    "why": "It began in Britain, not France, in the 1700s."
   },
   {
    "id": "history-L3-t5",
    "s": "The Aztec Empire was conquered by the Spanish led by Hernán Cortés.",
    "answer": true,
    "why": "Cortés and his Spanish forces conquered the Aztecs by 1521."
   },
   {
    "id": "history-L3-t6",
    "s": "The United Nations was founded in 1919 after the First World War.",
    "answer": false,
    "why": "The UN was founded in 1945; the League of Nations was set up in 1920."
   },
   {
    "id": "history-L3-t7",
    "s": "Mahatma Gandhi led India's movement for independence using non-violent protest.",
    "answer": true,
    "why": "Gandhi is famous for leading non-violent resistance to British rule."
   },
   {
    "id": "history-L3-t8",
    "s": "The Berlin Wall was built in 1961 and divided the city of Berlin.",
    "answer": true,
    "why": "The wall went up in 1961 and separated East and West Berlin until 1989."
   },
   {
    "id": "history-L3-t9",
    "s": "The Mongol Empire was founded by Kublai Khan in the 1200s.",
    "answer": false,
    "why": "It was founded by Genghis Khan; Kublai Khan was a later ruler."
   },
   {
    "id": "history-L3-t10",
    "s": "The transatlantic slave trade transported millions of Africans to the Americas.",
    "answer": true,
    "why": "The trade forcibly moved millions of Africans across the Atlantic."
   },
   {
    "id": "history-L3-t11",
    "s": "The French Revolution began in 1789 with the storming of the Bastille.",
    "answer": true,
    "why": "The Bastille was stormed on 14 July 1789, a key moment of the revolution."
   },
   {
    "id": "history-L3-t12",
    "s": "The Inca Empire was based in the rainforests of the Amazon.",
    "answer": false,
    "why": "The Inca Empire was centred in the Andes mountains of South America."
   },
   {
    "id": "history-L3-t13",
    "s": "The Meiji Restoration in 1868 began the modernisation of Japan.",
    "answer": true,
    "why": "The Meiji Restoration led to rapid industrial and political change in Japan."
   },
   {
    "id": "history-L3-t14",
    "s": "The First World War ended in 1918.",
    "answer": true,
    "why": "The armistice ending the fighting came into effect in November 1918."
   },
   {
    "id": "history-L3-t15",
    "s": "The Cold War was a direct military war between the United States and the Soviet Union.",
    "answer": false,
    "why": "The Cold War was a rivalry without direct fighting between the two superpowers."
   },
   {
    "id": "history-L3-t16",
    "s": "Apartheid was a system of racial segregation in South Africa.",
    "answer": true,
    "why": "Apartheid legally separated people by race in South Africa until the 1990s."
   },
   {
    "id": "history-L3-t17",
    "s": "The League of Nations was founded after the Second World War.",
    "answer": false,
    "why": "It was founded after the First World War, in 1920."
   },
   {
    "id": "history-L3-t18",
    "s": "The Columbian Exchange moved plants, animals and diseases between the Americas and Europe.",
    "answer": true,
    "why": "After 1492, crops, animals and diseases spread between the two regions."
   }
  ],
  "terms": [
   {
    "id": "history-L3-w1",
    "word": "PHARAOH",
    "clue": "Title of the ruler of ancient Egypt"
   },
   {
    "id": "history-L3-w2",
    "word": "REPUBLIC",
    "clue": "A state whose head is elected, not a monarch"
   },
   {
    "id": "history-L3-w3",
    "word": "COLONY",
    "clue": "A territory ruled by another country"
   },
   {
    "id": "history-L3-w4",
    "word": "EMPEROR",
    "clue": "Male ruler of an empire"
   },
   {
    "id": "history-L3-w5",
    "word": "TREATY",
    "clue": "A formal agreement between countries"
   },
   {
    "id": "history-L3-w6",
    "word": "DYNASTY",
    "clue": "A family that rules a country over generations"
   },
   {
    "id": "history-L3-w7",
    "word": "SENATE",
    "clue": "A law-making body, as in ancient Rome"
   },
   {
    "id": "history-L3-w8",
    "word": "FEUDAL",
    "clue": "Relating to land-for-service system in medieval Europe"
   },
   {
    "id": "history-L3-w9",
    "word": "REFORM",
    "clue": "A change made to improve a system"
   }
  ]
 },
 "4": {
  "questions": [
   {
    "id": "history-L4-q1",
    "q": "Which reform movement in the 1500s challenged the authority of the Pope and led to the founding of Protestant churches?",
    "options": [
     "The Reformation",
     "The Renaissance",
     "The Enlightenment",
     "The Crusades"
    ],
    "answer": 0,
    "why": "The Reformation began with figures such as Martin Luther criticising Catholic practices, leading to new Protestant churches.",
    "hint": "Think of a word meaning 're-forming' the Church."
   },
   {
    "id": "history-L4-q2",
    "q": "A country where the monarch's power is limited by a parliament and a constitution is best described as which of the following?",
    "options": [
     "An absolute monarchy",
     "A constitutional monarchy",
     "A dictatorship",
     "A theocracy"
    ],
    "answer": 1,
    "why": "In a constitutional monarchy the monarch is head of state but real governing power rests with an elected parliament under a constitution.",
    "hint": "The monarch still exists but does not rule alone."
   },
   {
    "id": "history-L4-q3",
    "q": "Which of these was a direct cause of the First World War in 1914?",
    "options": [
     "The assassination of Archduke Franz Ferdinand",
     "The bombing of Pearl Harbor",
     "The fall of the Berlin Wall",
     "The Russian Revolution"
    ],
    "answer": 0,
    "why": "The assassination of the Austrian archduke in Sarajevo triggered the chain of alliances that led to war in 1914.",
    "hint": "It happened in a Balkan city."
   },
   {
    "id": "history-L4-q4",
    "q": "The Industrial Revolution first transformed which country's economy in the late 1700s?",
    "options": [
     "France",
     "Britain",
     "Germany",
     "The United States"
    ],
    "answer": 1,
    "why": "Britain led early industrialisation with textile factories, coal and steam power in the late 1700s.",
    "hint": "It is the same country that had the first major railway."
   },
   {
    "id": "history-L4-q5",
    "q": "Which body of the United Nations has five permanent members with veto power?",
    "options": [
     "The Secretariat",
     "The General Assembly",
     "The Security Council",
     "The International Court of Justice"
    ],
    "answer": 2,
    "why": "The Security Council's five permanent members (China, France, Russia, the UK and the US) can veto resolutions.",
    "hint": "It is the body responsible for peace and security."
   },
   {
    "id": "history-L4-q6",
    "q": "Which ancient American civilisation built the city of Tenochtitlan on an island in a lake?",
    "options": [
     "The Olmec",
     "The Inca",
     "The Aztec",
     "The Maya"
    ],
    "answer": 2,
    "why": "The Aztec founded Tenochtitlan on an island in Lake Texcoco, where modern Mexico City now stands.",
    "hint": "The Spanish conquered this city in 1521."
   },
   {
    "id": "history-L4-q7",
    "q": "Which trade network carried goods such as salt and gold across the Sahara to North Africa?",
    "options": [
     "The Indian Ocean spice trade",
     "The Atlantic triangular trade",
     "The trans-Saharan caravan trade",
     "The Silk Road"
    ],
    "answer": 2,
    "why": "Camel caravans crossed the Sahara carrying salt, gold and other goods between West Africa and North Africa.",
    "hint": "It crossed the world's largest hot desert."
   },
   {
    "id": "history-L4-q8",
    "q": "Which event in 1989 symbolised the end of the Cold War division of Europe?",
    "options": [
     "The founding of NATO",
     "The Korean War",
     "The fall of the Berlin Wall",
     "The Cuban Missile Crisis"
    ],
    "answer": 2,
    "why": "The opening of the Berlin Wall in 1989 became the symbol of the collapse of communist control in Eastern Europe.",
    "hint": "It happened in a divided German city."
   },
   {
    "id": "history-L4-q9",
    "q": "Which principle means that everyone, including rulers, must obey the law?",
    "options": [
     "Feudalism",
     "Absolute monarchy",
     "The rule of law",
     "Divine right"
    ],
    "answer": 2,
    "why": "The rule of law holds that no one is above the law, including government officials.",
    "hint": "It is the opposite of 'I am the state'."
   },
   {
    "id": "history-L4-q10",
    "q": "Which empire was defeated at the Battle of Hastings in 1066, leading to Norman rule in England?",
    "options": [
     "The Roman Empire",
     "The Anglo-Saxon kingdom",
     "The Byzantine Empire",
     "The Ottoman Empire"
    ],
    "answer": 1,
    "why": "Harold's Anglo-Saxon forces were defeated by William of Normandy at Hastings in 1066.",
    "hint": "The loser was an English king, not a foreign empire."
   },
   {
    "id": "history-L4-q11",
    "q": "Which leader came to power in Cuba after a revolution in 1959?",
    "options": [
     "Che Guevara",
     "Salvador Allende",
     "Juan Perón",
     "Fidel Castro"
    ],
    "answer": 3,
    "why": "Fidel Castro took power in Cuba in 1959 after overthrowing the Batista government.",
    "hint": "He ruled Cuba for decades afterwards."
   },
   {
    "id": "history-L4-q12",
    "q": "Which of these best describes a 'coup d'état'?",
    "options": [
     "A sudden seizure of power, often by the military",
     "A peaceful election",
     "A treaty between two states",
     "A colonial trade agreement"
    ],
    "answer": 0,
    "why": "A coup is an abrupt, often violent takeover of government, usually by a small group such as military officers.",
    "hint": "It is French for a 'blow of state'."
   },
   {
    "id": "history-L4-q13",
    "q": "Which ancient Greek city is often called the birthplace of democracy?",
    "options": [
     "Sparta",
     "Thebes",
     "Corinth",
     "Athens"
    ],
    "answer": 3,
    "why": "Athens developed a system in which citizens voted directly on laws, often called the first democracy.",
    "hint": "It was also famous for philosophy and theatre."
   }
  ],
  "truths": [
   {
    "id": "history-L4-t1",
    "s": "The Magna Carta, signed in 1215, limited the power of the English king.",
    "answer": true,
    "why": "It established that the king was subject to law and granted certain rights to nobles."
   },
   {
    "id": "history-L4-t2",
    "s": "The French Revolution began in 1789 with the storming of the Bastille.",
    "answer": true,
    "why": "The Bastille was stormed on 14 July 1789, a key early event of the Revolution."
   },
   {
    "id": "history-L4-t3",
    "s": "The Ottoman Empire was centred on Vienna and ruled much of Central Europe.",
    "answer": false,
    "why": "The Ottoman Empire was centred on Istanbul (Constantinople) and ruled Anatolia, the Balkans and the Middle East."
   },
   {
    "id": "history-L4-t4",
    "s": "The Silk Road linked China with the Mediterranean and carried goods and ideas.",
    "answer": true,
    "why": "It was a network of trade routes connecting East Asia with Europe and the Middle East."
   },
   {
    "id": "history-L4-t5",
    "s": "The Berlin Wall was built in 1961 to divide East and West Berlin.",
    "answer": true,
    "why": "It was erected by East Germany to stop people fleeing to West Berlin."
   },
   {
    "id": "history-L4-t6",
    "s": "The Aztec capital Tenochtitlan was conquered by the Spanish in 1521.",
    "answer": true,
    "why": "Hernán Cortés captured the city in 1521, ending Aztec rule."
   },
   {
    "id": "history-L4-t7",
    "s": "The Russian Revolution of 1917 brought the Tsar back to power.",
    "answer": false,
    "why": "It overthrew the Tsar and led to a communist state under the Bolsheviks."
   },
   {
    "id": "history-L4-t8",
    "s": "NATO was founded in 1949 as a military alliance of Western countries.",
    "answer": true,
    "why": "The North Atlantic Treaty Organisation was set up in 1949 for collective defence."
   },
   {
    "id": "history-L4-t9",
    "s": "The Roman Empire was ruled from Constantinople after the split in 395 CE.",
    "answer": false,
    "why": "The Western Roman Empire was ruled from Rome or Ravenna; Constantinople ruled the Eastern (Byzantine) Empire."
   },
   {
    "id": "history-L4-t10",
    "s": "The Tokugawa shogunate ruled Japan until 1868.",
    "answer": true,
    "why": "The Tokugawa period ended in 1868 with the Meiji Restoration."
   },
   {
    "id": "history-L4-t11",
    "s": "Portugal was the European country that colonised Brazil.",
    "answer": true,
    "why": "Portugal claimed Brazil in 1500 and ruled it until the early 1800s."
   },
   {
    "id": "history-L4-t12",
    "s": "New Zealand was the first country to grant women the right to vote in national elections, in 1893.",
    "answer": true,
    "why": "New Zealand led the world in 1893 by giving women the national vote."
   },
   {
    "id": "history-L4-t13",
    "s": "The Industrial Revolution began in France in the 1600s.",
    "answer": false,
    "why": "It began in Britain in the late 1700s, not France in the 1600s."
   },
   {
    "id": "history-L4-t14",
    "s": "The Crusades were a series of religious wars fought mainly between Christians and Muslims over holy sites.",
    "answer": true,
    "why": "The Crusades (from the 11th century) were campaigns by European Christians to control Jerusalem and other holy places."
   },
   {
    "id": "history-L4-t15",
    "s": "The Inca Empire was based in the Andes and built Machu Picchu.",
    "answer": true,
    "why": "The Inca ruled the Andes and constructed Machu Picchu in Peru."
   },
   {
    "id": "history-L4-t16",
    "s": "The United Nations was founded in 1919 after the First World War.",
    "answer": false,
    "why": "The UN was founded in 1945; the League of Nations was set up in 1920 after the First World War."
   },
   {
    "id": "history-L4-t17",
    "s": "The Mali Empire was famous for its wealth and for the city of Timbuktu.",
    "answer": true,
    "why": "Mali, especially under Mansa Musa, was renowned for gold and for Timbuktu's scholarship."
   },
   {
    "id": "history-L4-t18",
    "s": "The Declaration of the Rights of Man was adopted during the French Revolution in 1789.",
    "answer": true,
    "why": "The National Assembly adopted it in August 1789, setting out citizens' rights."
   }
  ],
  "terms": [
   {
    "id": "history-L4-w1",
    "word": "FEUDALISM",
    "clue": "Medieval system of land and service between lords and vassals"
   },
   {
    "id": "history-L4-w2",
    "word": "COLONIALISM",
    "clue": "Rule by one country over another territory and its people"
   },
   {
    "id": "history-L4-w3",
    "word": "REFORMATION",
    "clue": "Sixteenth-century movement that split Western Christianity"
   },
   {
    "id": "history-L4-w4",
    "word": "IMPERIALISM",
    "clue": "Policy of extending a country's power over other lands"
   },
   {
    "id": "history-L4-w5",
    "word": "DEMOCRACY",
    "clue": "Government in which citizens hold power, usually by voting"
   },
   {
    "id": "history-L4-w6",
    "word": "REVOLUTION",
    "clue": "Rapid and often violent overthrow of a government or order"
   },
   {
    "id": "history-L4-w7",
    "word": "DIPLOMACY",
    "clue": "Managing relations between countries through negotiation"
   },
   {
    "id": "history-L4-w8",
    "word": "CIVILISATION",
    "clue": "Complex society with cities, writing and organised government"
   },
   {
    "id": "history-L4-w9",
    "word": "MONARCHY",
    "clue": "Form of rule headed by a king or queen"
   }
  ]
 },
 "5": {
  "questions": [
   {
    "id": "history-L5-q1",
    "q": "A country has a parliament elected by the people, but the monarch still formally appoints the prime minister and can dissolve parliament. Which term best describes this system?",
    "options": [
     "Oligarchy",
     "Theocracy",
     "Constitutional monarchy",
     "Absolute monarchy"
    ],
    "answer": 2,
    "why": "In a constitutional monarchy the monarch's powers are limited by a constitution and parliament, even if some formal powers remain.",
    "hint": "The monarch rules within limits set by law and parliament."
   },
   {
    "id": "history-L5-q2",
    "q": "Which statement best explains why the Berlin Wall fell in 1989?",
    "options": [
     "The Soviet Union invaded West Germany",
     "NATO forces captured the city",
     "East Germany relaxed border controls after mass protests and reform pressure",
     "The United Nations ordered its removal"
    ],
    "answer": 2,
    "why": "Mass protests and the reform pressure in East Germany led the government to relax border controls, and the wall was opened on 9 November 1989.",
    "hint": "It followed protests and a change in border policy, not a military attack."
   },
   {
    "id": "history-L5-q3",
    "q": "The Meiji Restoration of 1868 in Japan is best described as:",
    "options": [
     "A peasant revolt against all foreign trade",
     "A movement that restored imperial rule and pushed rapid modernisation",
     "A return to rule by the shogun",
     "A treaty that ended Japanese isolation forever"
    ],
    "answer": 1,
    "why": "The Meiji Restoration ended the Tokugawa shogunate and restored imperial rule, launching rapid industrial and military modernisation.",
    "hint": "It brought the emperor back to power and began sweeping reforms."
   },
   {
    "id": "history-L5-q4",
    "q": "Which of these was a consequence of the Columbian Exchange after 1492?",
    "options": [
     "Africa and Asia were completely unaffected by new crops",
     "The Americas and Europe exchanged no plants or animals",
     "Only European goods moved to the Americas",
     "Potatoes and maize spread to Europe, while wheat and horses reached the Americas"
    ],
    "answer": 3,
    "why": "The Columbian Exchange moved crops, animals and diseases between the Americas and the Old World in both directions.",
    "hint": "Think of foods now common in Europe that originated in the Americas."
   },
   {
    "id": "history-L5-q5",
    "q": "A country's constitution says the prime minister is chosen by the parliament and can be removed by a vote of no confidence. This system is best called:",
    "options": [
     "A presidential system",
     "A parliamentary system",
     "A military junta",
     "An absolute monarchy"
    ],
    "answer": 1,
    "why": "In a parliamentary system the executive is drawn from and accountable to the legislature, which can remove it by a no-confidence vote.",
    "hint": "The executive depends on the legislature's confidence."
   },
   {
    "id": "history-L5-q6",
    "q": "Which best explains why the Industrial Revolution began in Britain rather than elsewhere in the 1700s?",
    "options": [
     "Britain had coal, capital and a large domestic market for goods",
     "Britain had no banks or credit system",
     "Britain had banned all overseas trade",
     "Britain had no overseas colonies"
    ],
    "answer": 0,
    "why": "Coal deposits, available capital, colonial trade and a large market helped Britain industrialise first.",
    "hint": "Think of resources, money and markets together."
   },
   {
    "id": "history-L5-q7",
    "q": "Which of these best describes the principle of 'rule of law'?",
    "options": [
     "The ruler may ignore laws in a crisis",
     "Everyone, including rulers, is subject to the law",
     "Only judges must obey the law",
     "Laws apply only to citizens, not to officials"
    ],
    "answer": 1,
    "why": "The rule of law means that law applies equally to all, including those in power.",
    "hint": "No one is above the law."
   },
   {
    "id": "history-L5-q8",
    "q": "Which statement about the Ottoman Empire is correct?",
    "options": [
     "It was a Christian empire based in Rome",
     "It was a Muslim empire that lasted from about 1300 until 1922",
     "It was founded in the 1500s by Suleiman",
     "It never controlled Constantinople"
    ],
    "answer": 1,
    "why": "The Ottoman Empire began around 1300 and lasted until it was abolished in 1922, and it captured Constantinople in 1453.",
    "hint": "It lasted over six centuries and ended after the First World War."
   },
   {
    "id": "history-L5-q9",
    "q": "Which of these was a cause of the First World War in 1914?",
    "options": [
     "The assassination of Archduke Franz Ferdinand in Sarajevo",
     "The fall of the Berlin Wall",
     "The Japanese attack on Pearl Harbor",
     "The Cuban Revolution"
    ],
    "answer": 0,
    "why": "The assassination of Archduke Franz Ferdinand in Sarajevo in June 1914 triggered the July Crisis that led to war.",
    "hint": "It happened in a Balkan city in June 1914."
   },
   {
    "id": "history-L5-q10",
    "q": "Which statement about the Silk Roads is most accurate?",
    "options": [
     "They were a network of trade routes linking China with Central Asia and the Mediterranean",
     "They carried only silk and nothing else",
     "They were a single paved road from China to Rome",
     "They were used only by Chinese merchants"
    ],
    "answer": 0,
    "why": "The Silk Roads were a network of overland and sea routes carrying goods, ideas and religions between East and West.",
    "hint": "It was a network, not one road, and carried far more than silk."
   },
   {
    "id": "history-L5-q11",
    "q": "Which statement about the French Revolution's 'Declaration of the Rights of Man' (1789) is correct?",
    "options": [
     "It restored the absolute monarchy",
     "It set out rights such as liberty and equality before the law",
     "It applied only to nobles",
     "It was issued by the king alone"
    ],
    "answer": 1,
    "why": "The 1789 Declaration set out principles such as liberty, equality before the law and popular sovereignty.",
    "hint": "It listed rights and equality, not royal power."
   },
   {
    "id": "history-L5-q12",
    "q": "Which of these best explains why the Suez Canal (opened 1869) was strategically important?",
    "options": [
     "It was built to carry oil pipelines",
     "It connected the Mediterranean and the Black Sea",
     "It shortened the sea route between Europe and Asia",
     "It linked the Atlantic and Pacific oceans"
    ],
    "answer": 2,
    "why": "The Suez Canal linked the Mediterranean and Red Sea, greatly shortening the sea route between Europe and Asia.",
    "hint": "It saved ships a long voyage around Africa."
   }
  ],
  "truths": [
   {
    "id": "history-L5-t1",
    "s": "The Magna Carta was sealed by King John of England in 1215.",
    "answer": true,
    "why": "King John sealed the Magna Carta at Runnymede in 1215."
   },
   {
    "id": "history-L5-t2",
    "s": "The Treaty of Versailles was signed in 1919 and formally ended the First World War.",
    "answer": true,
    "why": "The treaty was signed in June 1919 and formally ended the war with Germany."
   },
   {
    "id": "history-L5-t3",
    "s": "The Aztec capital Tenochtitlan was built on an island in Lake Texcoco.",
    "answer": true,
    "why": "Tenochtitlan was founded on an island in Lake Texcoco in the Valley of Mexico."
   },
   {
    "id": "history-L5-t4",
    "s": "The United Nations was founded in 1945.",
    "answer": true,
    "why": "The UN Charter was signed in 1945, and the organisation began that year."
   },
   {
    "id": "history-L5-t5",
    "s": "The ancient city of Great Zimbabwe was built in the 1800s by Portuguese traders.",
    "answer": false,
    "why": "Great Zimbabwe was built by local Shona people between about the 11th and 15th centuries, long before the Portuguese arrived."
   },
   {
    "id": "history-L5-t6",
    "s": "The Roman Empire was divided into eastern and western parts, with the eastern part ruled from Constantinople.",
    "answer": true,
    "why": "The empire was divided, and the eastern (Byzantine) part was ruled from Constantinople."
   },
   {
    "id": "history-L5-t7",
    "s": "The Haitian Revolution led to the abolition of slavery and independence from France in 1804.",
    "answer": true,
    "why": "Haiti became independent in 1804 after a revolution that ended slavery there."
   },
   {
    "id": "history-L5-t8",
    "s": "The Berlin Conference of 1884–85 was called to divide Africa among European powers.",
    "answer": true,
    "why": "The conference set rules for European colonisation and trade in Africa."
   },
   {
    "id": "history-L5-t9",
    "s": "The Tokugawa shogunate ruled Japan until it was overthrown in 1868.",
    "answer": true,
    "why": "The Tokugawa shogunate ended in 1868 with the Meiji Restoration."
   },
   {
    "id": "history-L5-t10",
    "s": "The American Declaration of Independence was signed in 1776.",
    "answer": true,
    "why": "The Declaration was adopted on 4 July 1776."
   },
   {
    "id": "history-L5-t11",
    "s": "The Inca Empire was based in the Amazon rainforest of Brazil.",
    "answer": false,
    "why": "The Inca Empire was based in the Andes of Peru and neighbouring countries, not in Brazil's rainforest."
   },
   {
    "id": "history-L5-t12",
    "s": "The Cold War was a period of direct large-scale fighting between NATO and the Warsaw Pact in Europe.",
    "answer": false,
    "why": "The Cold War was mainly a period of tension and proxy conflict, not direct large-scale fighting between the two alliances in Europe."
   },
   {
    "id": "history-L5-t13",
    "s": "The Reformation began in the 1500s when Martin Luther challenged the authority of the Pope.",
    "answer": true,
    "why": "Luther's protests from 1517 helped launch the Reformation."
   },
   {
    "id": "history-L5-t14",
    "s": "The Battle of Hastings in 1066 led to Norman rule in England under William the Conqueror.",
    "answer": true,
    "why": "William defeated Harold at Hastings and became king of England."
   },
   {
    "id": "history-L5-t15",
    "s": "The Ottoman Empire captured Constantinople in 1453.",
    "answer": true,
    "why": "Mehmed II captured Constantinople in 1453, ending the Byzantine Empire."
   },
   {
    "id": "history-L5-t16",
    "s": "The League of Nations was set up in 1945 to keep peace after the Second World War.",
    "answer": false,
    "why": "The League of Nations was set up in 1920 after the First World War; the UN was founded in 1945."
   },
   {
    "id": "history-L5-t17",
    "s": "The Russian Revolution of 1917 led to the creation of a communist state.",
    "answer": true,
    "why": "The Bolsheviks took power in 1917 and created a communist state."
   },
   {
    "id": "history-L5-t18",
    "s": "The ancient Greek city of Sparta is often called the birthplace of democracy.",
    "answer": false,
    "why": "Athens, not Sparta, is often called the birthplace of democracy."
   }
  ],
  "terms": [
   {
    "id": "history-L5-w1",
    "word": "FEUDALISM",
    "clue": "Medieval system of land and loyalty between lords and vassals"
   },
   {
    "id": "history-L5-w2",
    "word": "IMPERIALISM",
    "clue": "Policy of extending a country's power by colonising other lands"
   },
   {
    "id": "history-L5-w3",
    "word": "REFORMATION",
    "clue": "Sixteenth-century movement that challenged the Pope's authority"
   },
   {
    "id": "history-L5-w4",
    "word": "ABOLITION",
    "clue": "Campaign to end the slave trade and slavery"
   },
   {
    "id": "history-L5-w5",
    "word": "SUFFRAGE",
    "clue": "The right to vote in elections"
   },
   {
    "id": "history-L5-w6",
    "word": "COLONIALISM",
    "clue": "Control by one country over another territory and its people"
   },
   {
    "id": "history-L5-w7",
    "word": "ARMISTICE",
    "clue": "An agreement to stop fighting, often before a peace treaty"
   },
   {
    "id": "history-L5-w8",
    "word": "DIPLOMACY",
    "clue": "Managing relations between countries through negotiation"
   },
   {
    "id": "history-L5-w9",
    "word": "CONSTITUTION",
    "clue": "Fundamental set of rules for governing a state"
   }
  ]
 },
 "6": {
  "questions": [
   {
    "id": "history-L6-q1",
    "q": "Which best explains why the Ottoman Empire is called a 'gunpowder empire'?",
    "options": [
     "It used gunpowder only for ceremonial displays",
     "It invented gunpowder and sold it to Europe",
     "It banned firearms among its subject peoples",
     "It relied on firearms and cannon to conquer and hold fortified cities"
    ],
    "answer": 3,
    "why": "The term describes states such as the Ottomans, Safavids and Mughals whose artillery-based armies underpinned expansion.",
    "hint": "Think about siege warfare against Constantinople's walls."
   },
   {
    "id": "history-L6-q2",
    "q": "The Haitian Revolution (1791–1804) is significant because it produced:",
    "options": [
     "the first European colony to gain dominion status",
     "the first constitutional monarchy in the Caribbean",
     "the first republic in South America",
     "the first state founded by formerly enslaved people who abolished slavery"
    ],
    "answer": 3,
    "why": "Saint-Domingue's uprising led to Haiti, the first independent Black republic and the first state to abolish slavery permanently.",
    "hint": "Think about who led and fought in the revolution."
   },
   {
    "id": "history-L6-q3",
    "q": "Which statement best captures the difference between the 'Old Imperialism' and the 'New Imperialism' of the 1800s?",
    "options": [
     "The old imperialism was driven by industrial capitalism",
     "The new imperialism was confined to the Americas",
     "The new imperialism sought direct territorial control and economic monopoly rather than trading posts",
     "The new imperialism avoided military force entirely"
    ],
    "answer": 2,
    "why": "Late-19th-century powers pursued formal annexation and exclusive markets, unlike earlier coastal trading enclaves.",
    "hint": "Compare chartered trading companies with the Scramble for Africa."
   },
   {
    "id": "history-L6-q4",
    "q": "The doctrine of 'popular sovereignty' in political thought holds that:",
    "options": [
     "the monarch rules by divine right",
     "sovereignty belongs to the armed forces",
     "political authority derives from the consent of the governed",
     "only property owners may exercise authority"
    ],
    "answer": 2,
    "why": "It locates ultimate authority in the people, underpinning constitutional and revolutionary claims.",
    "hint": "Contrast it with divine right."
   },
   {
    "id": "history-L6-q5",
    "q": "Which of these was the most direct trigger for the outbreak of war in Europe in August 1914?",
    "options": [
     "The assassination of Archduke Franz Ferdinand and the ensuing alliance escalations",
     "The invasion of Poland",
     "The sinking of the Lusitania",
     "The Russian Revolution"
    ],
    "answer": 0,
    "why": "The Sarajevo assassination set off the July Crisis and mobilisation chain among the alliances.",
    "hint": "Think of an event in Sarajevo."
   },
   {
    "id": "history-L6-q6",
    "q": "Which best describes the 'mandate system' established after the First World War?",
    "options": [
     "Territories administered by victorious powers under League of Nations supervision",
     "A court for prosecuting war crimes",
     "Direct annexation of colonies by the victors",
     "A free-trade zone across former empires"
    ],
    "answer": 0,
    "why": "Mandates transferred former Ottoman and German colonies to Allied administration accountable to the League.",
    "hint": "It involved oversight by an international body."
   },
   {
    "id": "history-L6-q7",
    "q": "The 'Nanjing Decade' (1927–1937) in China refers to:",
    "options": [
     "a treaty port administration",
     "a Communist base area",
     "a Japanese occupation government",
     "a period of Nationalist consolidation under Chiang Kai-shek based at Nanjing"
    ],
    "answer": 3,
    "why": "The Guomindang government established its capital at Nanjing and pursued state-building before war with Japan.",
    "hint": "Which party and leader were in power?"
   },
   {
    "id": "history-L6-q8",
    "q": "Which statement best explains the failure of the League of Nations to stop aggression in the 1930s?",
    "options": [
     "Major powers were absent or unwilling to enforce collective security",
     "It lacked a permanent headquarters",
     "It was dissolved before 1930",
     "It had no member states from Europe"
    ],
    "answer": 0,
    "why": "The USA never joined and members would not impose effective sanctions or force, as with Manchuria and Abyssinia.",
    "hint": "Consider which great power never joined."
   },
   {
    "id": "history-L6-q9",
    "q": "The principle of 'collective security' in international organisations rests on the idea that:",
    "options": [
     "an attack on one member is treated as a concern of all",
     "each state must defend only its own borders",
     "military alliances are prohibited",
     "economic sanctions are the only permitted response"
    ],
    "answer": 0,
    "why": "Members pledge joint response to aggression, as in the League Covenant and the UN Charter.",
    "hint": "Think of 'one for all'."
   },
   {
    "id": "history-L6-q10",
    "q": "Which best describes the significance of the Bandung Conference (1955)?",
    "options": [
     "It founded the United Nations",
     "It partitioned India",
     "It created a military alliance against the USSR",
     "It asserted Afro-Asian solidarity and non-alignment in the Cold War"
    ],
    "answer": 3,
    "why": "Bandung brought newly independent states together to oppose colonialism and avoid bloc alignment.",
    "hint": "Think of newly independent states in Asia and Africa."
   },
   {
    "id": "history-L6-q11",
    "q": "A state in which the head of government is accountable to an elected legislature and the head of state is a ceremonial figure is best classified as:",
    "options": [
     "a parliamentary republic",
     "a presidential republic",
     "an absolute monarchy",
     "a one-party state"
    ],
    "answer": 0,
    "why": "Executive power derives from and answers to the legislature, with a mostly symbolic head of state.",
    "hint": "Compare with systems where the president is both head of state and government."
   },
   {
    "id": "history-L6-q12",
    "q": "Which statement best explains the economic rationale behind the 'Scramble for Africa'?",
    "options": [
     "Industrial powers sought raw materials and captive markets amid growing competition",
     "Missionary activity was the main driver",
     "African states invited European rule for defence",
     "Europeans needed land for surplus population only"
    ],
    "answer": 0,
    "why": "Industrialisation and inter-imperial rivalry drove the partition for resources and markets, alongside strategic and prestige motives.",
    "hint": "Link it to factories needing inputs and outlets."
   }
  ],
  "truths": [
   {
    "id": "history-L6-t1",
    "s": "The Magna Carta of 1215 established the principle that the monarch was subject to law.",
    "answer": true,
    "why": "It bound the king to legal limits and became a foundation of constitutional government."
   },
   {
    "id": "history-L6-t2",
    "s": "The Meiji Restoration of 1868 restored the shogun's power in Japan.",
    "answer": false,
    "why": "It overthrew the shogunate and restored imperial rule while driving rapid modernisation."
   },
   {
    "id": "history-L6-t3",
    "s": "The Berlin Conference of 1884–85 set rules for European claims in Africa without African representation.",
    "answer": true,
    "why": "It formalised the partition among European powers, excluding African states."
   },
   {
    "id": "history-L6-t4",
    "s": "The Treaty of Versailles (1919) imposed no reparations on Germany.",
    "answer": false,
    "why": "It imposed substantial reparations and territorial losses on Germany."
   },
   {
    "id": "history-L6-t5",
    "s": "The Silk Roads carried not only goods but also religions and technologies between Asia and Europe.",
    "answer": true,
    "why": "Ideas, faiths and techniques travelled alongside trade goods."
   },
   {
    "id": "history-L6-t6",
    "s": "The 'Glorious Revolution' of 1688 in England replaced an absolute monarchy with a republic.",
    "answer": false,
    "why": "It established a constitutional monarchy under William and Mary, not a republic."
   },
   {
    "id": "history-L6-t7",
    "s": "The Universal Declaration of Human Rights was adopted by the UN General Assembly in 1948.",
    "answer": true,
    "why": "It set out civil, political and other rights without binding treaty force."
   },
   {
    "id": "history-L6-t8",
    "s": "The Cuban Missile Crisis of 1962 ended with a Soviet withdrawal of missiles from Cuba.",
    "answer": true,
    "why": "The USSR removed missiles in exchange for US assurances and missile removal from Turkey."
   },
   {
    "id": "history-L6-t9",
    "s": "The Roman Republic had a written constitution codified in a single document.",
    "answer": false,
    "why": "It relied on custom, laws and institutions rather than one codified constitution."
   },
   {
    "id": "history-L6-t10",
    "s": "The Aztec and Inca empires both lacked wheeled vehicles and large draught animals.",
    "answer": true,
    "why": "Neither used wheeled transport or animals such as horses for haulage."
   },
   {
    "id": "history-L6-t11",
    "s": "The French Revolution's Declaration of the Rights of Man (1789) granted equal political rights to women.",
    "answer": false,
    "why": "It excluded women from political rights, prompting Olympe de Gouges's counter-declaration."
   },
   {
    "id": "history-L6-t12",
    "s": "The Congress of Vienna (1814–15) aimed to restore a balance of power in Europe after Napoleon.",
    "answer": true,
    "why": "It reshaped borders and sought stability through conservative balance."
   },
   {
    "id": "history-L6-t13",
    "s": "India gained independence from Britain in 1947 and was partitioned into India and Pakistan.",
    "answer": true,
    "why": "Partition created two states amid massive population movement."
   },
   {
    "id": "history-L6-t14",
    "s": "The Ottoman Empire abolished the caliphate before the First World War.",
    "answer": false,
    "why": "The caliphate was abolished in 1924, after the war, by the Turkish Republic."
   },
   {
    "id": "history-L6-t15",
    "s": "The Marshall Plan provided US economic aid to rebuild Western European economies after 1945.",
    "answer": true,
    "why": "It financed reconstruction and countered communist influence."
   },
   {
    "id": "history-L6-t16",
    "s": "The Zulu kingdom was annexed by Britain before the Anglo-Zulu War of 1879.",
    "answer": false,
    "why": "The war preceded annexation; Britain defeated the Zulu in 1879 and annexed territory afterwards."
   },
   {
    "id": "history-L6-t17",
    "s": "The Hanseatic League was a commercial confederation of merchant guilds and towns in northern Europe.",
    "answer": true,
    "why": "It dominated Baltic and North Sea trade from the late Middle Ages."
   },
   {
    "id": "history-L6-t18",
    "s": "The Russian Revolution of 1917 immediately established a stable multi-party democracy.",
    "answer": false,
    "why": "It led to Bolshevik rule and civil war, not stable multi-party democracy."
   }
  ],
  "terms": [
   {
    "id": "history-L6-w1",
    "word": "FEUDALISM",
    "clue": "System of land tenure and obligations between lords and vassals in medieval Europe."
   },
   {
    "id": "history-L6-w2",
    "word": "MERCANTILISM",
    "clue": "Economic doctrine that a state's power grows by maximising exports and hoarding bullion."
   },
   {
    "id": "history-L6-w3",
    "word": "ABSOLUTISM",
    "clue": "Form of monarchy claiming unlimited authority by divine right."
   },
   {
    "id": "history-L6-w4",
    "word": "COLONIALISM",
    "clue": "Practice of one state establishing political control over another territory and people."
   },
   {
    "id": "history-L6-w5",
    "word": "SUFFRAGE",
    "clue": "The right to vote in political elections."
   },
   {
    "id": "history-L6-w6",
    "word": "SECULARISM",
    "clue": "Principle that the state is separate from religious authority."
   },
   {
    "id": "history-L6-w7",
    "word": "FEDERALISM",
    "clue": "Division of power between a central government and constituent units."
   },
   {
    "id": "history-L6-w8",
    "word": "PROTECTORATE",
    "clue": "Territory under the protection and partial control of a stronger state."
   },
   {
    "id": "history-L6-w9",
    "word": "REFERENDUM",
    "clue": "Direct vote by the electorate on a single political question."
   }
  ]
 },
 "7": {
  "questions": [
   {
    "id": "history-L7-q1",
    "q": "The Peace of Westphalia (1648) is often said to have established which principle in international relations?",
    "options": [
     "Collective security through alliance",
     "Sovereignty of territorial states",
     "Free trade across all borders",
     "Universal monarchy under the Pope"
    ],
    "answer": 1,
    "why": "Westphalia recognised the territorial sovereignty of states and non-interference in domestic affairs, a cornerstone of the modern state system.",
    "hint": "Think about what each state gained in relation to its own territory."
   },
   {
    "id": "history-L7-q2",
    "q": "In the Congress of Vienna (1815), the principle of 'legitimacy' championed by Metternich primarily meant:",
    "options": [
     "Granting independence to Latin America",
     "Abolishing the slave trade worldwide",
     "Extending voting rights to propertied men",
     "Restoring legitimate dynasties displaced by Napoleon"
    ],
    "answer": 3,
    "why": "Metternich sought to restore the pre-revolutionary dynasties and balance of power, not to expand political rights.",
    "hint": "It concerned who should sit on thrones, not who should vote."
   },
   {
    "id": "history-L7-q3",
    "q": "Which best explains why the British 'dual mandate' in tropical Africa was criticised by later historians?",
    "options": [
     "It transferred colonies to the League",
     "It justified colonial rule as a trust while extracting resources",
     "It gave Africans immediate self-government",
     "It banned all European settlement"
    ],
    "answer": 1,
    "why": "The dual mandate claimed to serve both coloniser and colonised, but critics argue it masked economic exploitation.",
    "hint": "Consider the gap between stated ideals and actual practice."
   },
   {
    "id": "history-L7-q4",
    "q": "The 'Long Parliament' in England (1640–1660) is significant chiefly because it:",
    "options": [
     "Asserted parliamentary authority against Charles I",
     "Restored the Catholic Church in England",
     "Granted independence to Scotland",
     "Abolished the monarchy permanently in 1641"
    ],
    "answer": 0,
    "why": "It passed the Triennial Act, impeached royal ministers and ultimately fought the king, asserting parliamentary power.",
    "hint": "Its name reflects duration, but its importance lies in its conflict with the crown."
   },
   {
    "id": "history-L7-q5",
    "q": "Which statement best captures the 'Atlantic System' of the 17th–18th centuries?",
    "options": [
     "A religious movement across the Atlantic",
     "A treaty dividing the New World between Spain and Portugal",
     "A naval alliance against Spain",
     "A triangular trade linking Europe, Africa and the Americas"
    ],
    "answer": 3,
    "why": "The Atlantic system denotes the circulation of goods, enslaved people and capital among three continents.",
    "hint": "Three continents were connected by ships carrying very different cargoes."
   },
   {
    "id": "history-L7-q6",
    "q": "The 'mandate system' established after the First World War meant that:",
    "options": [
     "The League directly governed all colonies",
     "Germany retained its overseas territories",
     "Former Ottoman and German colonies were administered by Allied powers under League oversight",
     "Colonies were granted immediate independence"
    ],
    "answer": 2,
    "why": "Mandates placed territories under mandatory powers accountable to the League, not full sovereignty.",
    "hint": "It was a form of trusteeship, not outright annexation."
   },
   {
    "id": "history-L7-q7",
    "q": "The principle of 'collective security' in international organisations rests on the idea that:",
    "options": [
     "Aggression against one member is met by all members",
     "Each state may act unilaterally when threatened",
     "Economic sanctions are always sufficient",
     "Great powers alone enforce peace"
    ],
    "answer": 0,
    "why": "Collective security obliges members to respond jointly to aggression, as in the League Covenant and UN Charter.",
    "hint": "It is about many states responding together to one aggressor."
   },
   {
    "id": "history-L7-q8",
    "q": "Which best describes the Ottoman Empire as a 'gunpowder empire'?",
    "options": [
     "It relied solely on cavalry archers",
     "It invented gunpowder independently",
     "Its power rested on early mastery of firearms and artillery",
     "It banned firearms among its subjects"
    ],
    "answer": 2,
    "why": "The term denotes empires (Ottoman, Safavid, Mughal) whose expansion relied on superior firearm technology.",
    "hint": "Think about the technology that gave them military advantage."
   },
   {
    "id": "history-L7-q9",
    "q": "The Peace of Westphalia (1648) is often said to have established the modern states system. Which principle did it most directly strengthen?",
    "options": [
     "Free trade across borders",
     "Sovereignty of territorial states",
     "Divine right of kings",
     "Universal papal authority"
    ],
    "answer": 1,
    "why": "The treaties recognised the territorial sovereignty of states and non-interference in their internal affairs, a cornerstone of the later states system.",
    "hint": "Think about what rulers gained over their own territories and religions."
   },
   {
    "id": "history-L7-q10",
    "q": "A country's president is directly elected by the people for a fixed term, while a separately elected legislature cannot be dissolved by the president. This arrangement is best described as:",
    "options": [
     "A parliamentary system",
     "A presidential system",
     "A constitutional monarchy",
     "A confederal system"
    ],
    "answer": 1,
    "why": "Separate election of executive and legislature with fixed terms is the defining feature of a presidential system, unlike parliamentary fusion of powers.",
    "hint": "Ask whether the executive depends on the legislature's confidence."
   },
   {
    "id": "history-L7-q11",
    "q": "Which development most directly enabled the 'New Imperialism' of the late nineteenth century?",
    "options": [
     "The invention of the printing press",
     "Steam navigation and quinine",
     "The Crusades",
     "The feudal system"
    ],
    "answer": 1,
    "why": "Steamships and quinine allowed Europeans to penetrate African rivers and survive tropical disease, facilitating rapid conquest and colonisation.",
    "hint": "Consider transport and medicine rather than ideology alone."
   },
   {
    "id": "history-L7-q12",
    "q": "Mansa Musa's hajj of 1324 is best remembered for:",
    "options": [
     "Introducing Christianity to Mali",
     "Conquering Egypt",
     "Distributing so much gold that it depressed prices in Cairo",
     "Founding the Songhai Empire"
    ],
    "answer": 2,
    "why": "Contemporary accounts describe his lavish spending of gold in Cairo, which reportedly disrupted local prices, highlighting Mali's wealth.",
    "hint": "Think about the economic impact of his journey, not its destination."
   },
   {
    "id": "history-L7-q13",
    "q": "The 'Long March' (1934–1935) is significant in Chinese history because it:",
    "options": [
     "Ended the Qing dynasty",
     "Allowed the Communists to survive and regroup",
     "Established the Nanjing government",
     "Defeated the Japanese army"
    ],
    "answer": 1,
    "why": "The Communist forces escaped encirclement and relocated to Yan'an, preserving the movement and cementing Mao's leadership.",
    "hint": "Consider survival and relocation rather than victory in battle."
   }
  ],
  "truths": [
   {
    "id": "history-L7-t1",
    "s": "The Treaty of Versailles (1919) imposed reparations on Germany and limited its army.",
    "answer": true,
    "why": "It set reparations, territorial losses and military restrictions on Germany."
   },
   {
    "id": "history-L7-t2",
    "s": "The League of Nations could enforce its decisions with its own standing army.",
    "answer": false,
    "why": "The League had no independent military force and relied on member states."
   },
   {
    "id": "history-L7-t3",
    "s": "The Berlin Conference of 1884–85 divided Africa among European powers without African representation.",
    "answer": true,
    "why": "It set rules for partition; no African leaders were present."
   },
   {
    "id": "history-L7-t4",
    "s": "The Universal Declaration of Human Rights was adopted by the UN General Assembly in 1948.",
    "answer": true,
    "why": "It was adopted on 10 December 1948."
   },
   {
    "id": "history-L7-t5",
    "s": "The Ottoman Empire was dissolved after the First World War and replaced by the Republic of Turkey in 1923.",
    "answer": true,
    "why": "The sultanate was abolished and the republic proclaimed in 1923."
   },
   {
    "id": "history-L7-t6",
    "s": "The Treaty of Tordesillas (1494) divided newly discovered lands between Spain and Portugal.",
    "answer": true,
    "why": "It split the non-European world between the two crowns."
   },
   {
    "id": "history-L7-t7",
    "s": "The Meiji Restoration abolished the emperor's role entirely.",
    "answer": false,
    "why": "It restored the emperor to a central symbolic and political role."
   },
   {
    "id": "history-L7-t8",
    "s": "The Cuban Missile Crisis of 1962 ended with the removal of Soviet missiles from Cuba.",
    "answer": true,
    "why": "The USSR withdrew missiles in exchange for US concessions."
   },
   {
    "id": "history-L7-t9",
    "s": "The Congress of Vienna (1815) aimed to spread republicanism across Europe.",
    "answer": false,
    "why": "It aimed to restore monarchy and balance of power, not republicanism."
   },
   {
    "id": "history-L7-t10",
    "s": "The Nuremberg Trials after the Second World War established that individuals could be held responsible for crimes against humanity.",
    "answer": true,
    "why": "They set a precedent for individual accountability under international law."
   },
   {
    "id": "history-L7-t11",
    "s": "The Indian National Congress was founded in 1885.",
    "answer": true,
    "why": "It was established in 1885, initially seeking greater Indian representation."
   },
   {
    "id": "history-L7-t12",
    "s": "The Marshall Plan was a Soviet programme to rebuild Eastern Europe.",
    "answer": false,
    "why": "It was a US programme to rebuild Western Europe."
   },
   {
    "id": "history-L7-t13",
    "s": "The Suez Canal opened in 1869 and linked the Mediterranean and the Red Sea.",
    "answer": true,
    "why": "It opened in 1869, shortening the route to Asia."
   },
   {
    "id": "history-L7-t14",
    "s": "The Treaty of Versailles (1919) imposed reparations on Germany and limited its army to 100,000 men.",
    "answer": true,
    "why": "Both the reparations and the 100,000-man limit are standard terms of the treaty."
   },
   {
    "id": "history-L7-t15",
    "s": "The Meiji Constitution of 1889 created a parliament, but the emperor retained substantial sovereign powers.",
    "answer": true,
    "why": "The Diet existed, yet sovereignty resided in the emperor under the constitution."
   },
   {
    "id": "history-L7-t16",
    "s": "The Berlin Conference of 1884–1885 divided Africa among European powers and included African representatives as equal participants.",
    "answer": false,
    "why": "No African representatives took part; the conference set rules for European claims."
   },
   {
    "id": "history-L7-t17",
    "s": "The Marshall Plan provided American economic aid to Western European countries after the Second World War.",
    "answer": true,
    "why": "It channelled billions of dollars in aid to rebuild Western Europe from 1948."
   }
  ],
  "terms": [
   {
    "id": "history-L7-w1",
    "word": "ABSOLUTISM",
    "clue": "Rule by a monarch with unrestricted, centralised power"
   },
   {
    "id": "history-L7-w2",
    "word": "MERCANTILISM",
    "clue": "Economic policy stressing exports and colonial trade surplus"
   },
   {
    "id": "history-L7-w3",
    "word": "IMPERIALISM",
    "clue": "Extension of a state's power over other territories and peoples"
   },
   {
    "id": "history-L7-w4",
    "word": "NATIONALISM",
    "clue": "Identification with and loyalty to one's nation"
   },
   {
    "id": "history-L7-w5",
    "word": "REFORMATION",
    "clue": "Sixteenth-century challenge to papal authority in Europe"
   },
   {
    "id": "history-L7-w6",
    "word": "PROTECTORATE",
    "clue": "Territory controlled and protected by a stronger state"
   },
   {
    "id": "history-L7-w7",
    "word": "REFERENDUM",
    "clue": "Direct vote by the electorate on a single political question"
   }
  ]
 },
 "8": {
  "questions": [
   {
    "id": "history-L8-q1",
    "q": "The 'Nanjing Decade' (1927–1937) is best characterised as a period when the Nationalist government:",
    "options": [
     "abolished the treaty ports and ended foreign concessions",
     "completed land reform across the whole countryside",
     "established a Soviet-style planned economy",
     "consolidated urban-based state building while facing Communist insurgency and Japanese pressure",
     "allied formally with Japan against the Soviet Union"
    ],
    "answer": 3,
    "why": "The Nanjing government built modern urban institutions and military forces but never fully controlled rural areas, while fighting Communists and facing Japanese encroachment.",
    "hint": "Consider where Nationalist power was strongest geographically."
   },
   {
    "id": "history-L8-q2",
    "q": "The Treaty of Tordesillas (1494) divided newly discovered lands between Spain and Portugal along a meridian. Which later development most directly undermined the basis of that division?",
    "options": [
     "The fall of Constantinople in 1453",
     "The Dutch and English rejection of papal authority to grant overseas territory",
     "The founding of the Hanseatic League",
     "The Portuguese conquest of Ceuta in 1415",
     "The Spanish expulsion of the Moors from Granada in 1492"
    ],
    "answer": 1,
    "why": "The treaty rested on papal grants; Protestant states like England and the Dutch Republic rejected papal authority to allocate lands, sailing and settling regardless.",
    "hint": "Think about which European powers became Protestant and challenged papal grants."
   },
   {
    "id": "history-L8-q3",
    "q": "Kwame Nkrumah's concept of 'positive action' in the Gold Coast before independence referred primarily to:",
    "options": [
     "armed guerrilla warfare against British troops",
     "boycotting all Western manufactured goods permanently",
     "forming a military alliance with the Soviet Union",
     "non-violent protest, strikes and boycotts to pressure the colonial government",
     "appealing to the United Nations to impose sanctions"
    ],
    "answer": 3,
    "why": "Nkrumah advocated disciplined non-violent resistance modelled partly on Gandhi's methods, alongside political mobilisation, before Ghana's independence in 1957.",
    "hint": "It resembles methods used in India but was applied in West Africa."
   },
   {
    "id": "history-L8-q4",
    "q": "The 'dual mandate' doctrine articulated by Frederick Lugard held that colonial powers in tropical Africa should govern for the benefit of:",
    "options": [
     "the League of Nations exclusively",
     "chartered companies exclusively",
     "missionary societies exclusively",
     "European settlers exclusively",
     "both the indigenous peoples and the wider world economy"
    ],
    "answer": 4,
    "why": "Lugard argued colonial administration should develop African resources for the world while also advancing the welfare of Africans, a claim later critics called self-serving.",
    "hint": "The word 'dual' points to two beneficiaries."
   },
   {
    "id": "history-L8-q5",
    "q": "Which of these best explains why the Industrial Revolution began in Britain rather than elsewhere in the late 18th century?",
    "options": [
     "State subsidies for steam engines",
     "The absence of guild restrictions across Europe",
     "Abundant silver from American mines",
     "A large standing army and state-owned factories",
     "Cheap coal near coalfields and a large colonial market for textiles"
    ],
    "answer": 4,
    "why": "Britain combined accessible coal, capital, and overseas demand, especially for cotton textiles.",
    "hint": "Think about energy and markets together."
   },
   {
    "id": "history-L8-q6",
    "q": "Which statement best captures the difference between 'Old Imperialism' and 'New Imperialism'?",
    "options": [
     "Old imperialism was Asian; new imperialism was African",
     "Old imperialism was formal; new imperialism was informal",
     "Old imperialism used gunboats; new imperialism used only diplomacy",
     "Old imperialism was mainly coastal trading posts; new imperialism involved formal territorial conquest of the interior",
     "Old imperialism was after 1880; new imperialism was before 1800"
    ],
    "answer": 3,
    "why": "Before the 19th century, European empires mostly held ports and trade routes; after 1880 they annexed and administered interiors.",
    "hint": "Consider the extent of territorial control."
   },
   {
    "id": "history-L8-q7",
    "q": "The Bandung Conference (1955) is significant chiefly because it:",
    "options": [
     "Established the United Nations",
     "Created the Non-Aligned Movement as a formal organisation",
     "Ended the Suez Crisis",
     "Asserted Afro-Asian solidarity and non-alignment in the Cold War",
     "Founded the Organisation of African Unity"
    ],
    "answer": 3,
    "why": "Bandung brought newly independent Afro-Asian states together to oppose colonialism and avoid alignment with either superpower.",
    "hint": "It was a meeting of newly independent states."
   },
   {
    "id": "history-L8-q8",
    "q": "Which statement best captures the difference between 'Old Imperialism' and the 'New Imperialism'?",
    "options": [
     "Old Imperialism was driven by nationalism; New Imperialism by religion",
     "Old Imperialism was largely mercantile and coastal; New Imperialism pursued formal territorial partition and industrial raw materials",
     "Old Imperialism was republican; New Imperialism was monarchical",
     "Old Imperialism used gunboats; New Imperialism avoided military force",
     "Old Imperialism occurred only in Asia; New Imperialism only in Africa"
    ],
    "answer": 1,
    "why": "Old colonial empires centred on trade posts and mercantile monopoly, whereas the late nineteenth-century New Imperialism sought formal annexation, markets and raw materials amid industrial rivalry.",
    "hint": "Compare the map of empires in 1750 and 1900."
   },
   {
    "id": "history-L8-q9",
    "q": "The Bandung Conference (1955) is most significant because it:",
    "options": [
     "founded the Organisation of African Unity",
     "articulated Afro-Asian solidarity and non-alignment amid the Cold War",
     "created a formal military alliance against the Soviet Union",
     "established the United Nations Security Council",
     "launched the Marshall Plan in Asia"
    ],
    "answer": 1,
    "why": "Bandung brought newly independent Asian and African states together to assert anti-colonialism and non-alignment between the superpowers.",
    "hint": "Consider which countries were newly independent after 1945."
   },
   {
    "id": "history-L8-q10",
    "q": "The principle of 'collective security' in the League of Nations and the UN rests on the idea that:",
    "options": [
     "aggression against one member is treated as a concern for all members",
     "neutral states must join any war that breaks out",
     "each state may use force freely to protect its own interests",
     "great powers may veto any enforcement action",
     "only regional organisations may respond to aggression"
    ],
    "answer": 0,
    "why": "Collective security obliges members to treat an attack on one as an attack on all, pooling responses against the aggressor.",
    "hint": "Think of the phrase 'one for all'."
   },
   {
    "id": "history-L8-q11",
    "q": "The 'Atlantic System' of the seventeenth and eighteenth centuries is best described as:",
    "options": [
     "a migration scheme for European settlers to the Americas",
     "a system of transatlantic telegraph cables",
     "an alliance of Atlantic naval powers against Spain",
     "a network of North Atlantic fishing fleets",
     "a triangular trade linking European manufactures, African enslaved labour and American plantation produce"
    ],
    "answer": 4,
    "why": "The Atlantic System denotes the interlocking trade in goods, enslaved Africans and colonial staples that bound Europe, Africa and the Americas.",
    "hint": "The 'triangular trade' is a common name for it."
   },
   {
    "id": "history-L8-q12",
    "q": "Which development most directly enabled the 'New Imperialism' after 1870?",
    "options": [
     "Steamships, railways and quinine supporting rapid inland expansion",
     "The invention of gunpowder in Europe",
     "The collapse of the Ottoman Empire",
     "The end of the Atlantic slave trade",
     "The spread of the printing press"
    ],
    "answer": 0,
    "why": "Steam transport and quinine prophylaxis allowed Europeans to penetrate and control interiors, notably in Africa, far more cheaply and safely than before.",
    "hint": "Think about transport and medicine."
   },
   {
    "id": "history-L8-q13",
    "q": "The 'Meiji Constitution' of 1889 created which kind of political system in Japan?",
    "options": [
     "A constitutional monarchy with an appointed upper house",
     "A liberal democracy with universal suffrage",
     "A military junta",
     "A socialist republic",
     "A federation of semi-independent daimyo domains"
    ],
    "answer": 0,
    "why": "It established a constitutional monarchy with an elected lower house but a peerage-based upper house and sovereign emperor.",
    "hint": "The emperor retained substantial prerogative powers."
   },
   {
    "id": "history-L8-q14",
    "q": "Which event is generally taken as the start of the 'Reign of Terror' in revolutionary France?",
    "options": [
     "The storming of the Bastille",
     "The execution of Louis XVI",
     "The establishment of the Directory",
     "The Thermidorian Reaction",
     "The fall of the Girondins in June 1793"
    ],
    "answer": 4,
    "why": "The purge of the Girondins in June 1793 and the rise of the Committee of Public Safety marked the start of the Terror.",
    "hint": "It followed a factional purge, not a royal execution."
   },
   {
    "id": "history-L8-q15",
    "q": "Which Mughal emperor's reign is associated with the construction of the Taj Mahal?",
    "options": [
     "Akbar",
     "Aurangzeb",
     "Babur",
     "Shah Jahan",
     "Humayun"
    ],
    "answer": 3,
    "why": "Shah Jahan built the Taj Mahal as a mausoleum for his wife Mumtaz Mahal in the 17th century.",
    "hint": "The builder was a grandson of Akbar."
   },
   {
    "id": "history-L8-q16",
    "q": "The Treaty of Waitangi (1840) was signed between the British Crown and which indigenous people?",
    "options": [
     "Aboriginal Australians",
     "Māori",
     "Zulu",
     "Iroquois",
     "Inuit"
    ],
    "answer": 1,
    "why": "The treaty was signed by representatives of the British Crown and Māori chiefs in New Zealand.",
    "hint": "The signatories lived in Aotearoa."
   }
  ],
  "truths": [
   {
    "id": "history-L8-t1",
    "s": "In the French Third Republic, the president could dissolve the Chamber of Deputies at will, like a British prime minister calling an election.",
    "answer": false,
    "why": "The French president's dissolution power was tightly constrained after 1877; the system was markedly less parliament-dominant than Westminster."
   },
   {
    "id": "history-L8-t2",
    "s": "The Bandung Conference of 1955 included Latin American states as full participants.",
    "answer": false,
    "why": "It was an Afro-Asian gathering; Latin America was not represented as a participating region."
   },
   {
    "id": "history-L8-t3",
    "s": "The League of Nations could impose binding military sanctions on member states without their consent.",
    "answer": false,
    "why": "The League had no standing army and sanctions required member cooperation; this weakness helped it fail against aggression."
   },
   {
    "id": "history-L8-t4",
    "s": "The Berlin Conference of 1884–85 laid down rules for European partition of Africa but did not itself divide the continent.",
    "answer": true,
    "why": "It set principles such as effective occupation and free trade; actual boundaries were drawn later in bilateral treaties."
   },
   {
    "id": "history-L8-t5",
    "s": "The 'mandate system' after 1918 granted former German and Ottoman territories immediate full independence.",
    "answer": false,
    "why": "Mandates were administered by powers under League supervision, with independence envisaged only gradually for some classes."
   },
   {
    "id": "history-L8-t6",
    "s": "The Peace of Westphalia recognised the sovereignty of the Dutch Republic and the Swiss Confederacy.",
    "answer": true,
    "why": "Both were formally recognised as independent of the Holy Roman Empire and Spain in the settlements."
   },
   {
    "id": "history-L8-t7",
    "s": "The Industrial Revolution in Britain was aided by high wages and cheap coal, encouraging labour-saving mechanisation.",
    "answer": true,
    "why": "Economic historians argue expensive labour and accessible coal made mechanisation profitable in Britain earlier than elsewhere."
   },
   {
    "id": "history-L8-t8",
    "s": "The Ottoman Empire's 'millet' system placed all religious communities under a single uniform legal code.",
    "answer": false,
    "why": "Millets allowed recognised religious communities considerable autonomy in personal law and communal affairs."
   },
   {
    "id": "history-L8-t9",
    "s": "The British North America Act of 1867 created a federal Dominion of Canada with a division of powers.",
    "answer": true,
    "why": "It united Ontario, Quebec, Nova Scotia and New Brunswick in a federal system with provincial and federal jurisdictions."
   },
   {
    "id": "history-L8-t10",
    "s": "The 'Long March' of 1934–35 ended with the Chinese Communists establishing a base at Yan'an.",
    "answer": true,
    "why": "The survivors regrouped in Shaanxi, basing themselves at Yan'an and rebuilding the party's strength."
   },
   {
    "id": "history-L8-t11",
    "s": "The Universal Declaration of Human Rights (1948) is a legally binding treaty obliging states to enforce its articles.",
    "answer": false,
    "why": "It is a non-binding declaration; binding obligations came through later covenants and treaties."
   },
   {
    "id": "history-L8-t12",
    "s": "The 'Zimmermann Telegram' of 1917 was a German proposal to Mexico that helped bring the United States into the First World War.",
    "answer": true,
    "why": "Its interception and publication inflamed American opinion against Germany."
   },
   {
    "id": "history-L8-t13",
    "s": "The 'Haitian Revolution' was the only successful large-scale slave revolt that created an independent state.",
    "answer": true,
    "why": "It led to Haiti's independence in 1804."
   },
   {
    "id": "history-L8-t14",
    "s": "The Treaty of Versailles (1919) imposed reparations on Germany under a 'war guilt' clause (Article 231).",
    "answer": true,
    "why": "Article 231 assigned responsibility for the war to Germany and its allies and underpinned the reparations regime."
   },
   {
    "id": "history-L8-t15",
    "s": "The Meiji Restoration of 1868 restored the shogun to power in Japan.",
    "answer": false,
    "why": "It abolished the shogunate and restored imperial rule under the emperor, launching rapid modernisation."
   },
   {
    "id": "history-L8-t16",
    "s": "The Haitian Revolution produced the first independent black republic in the Americas.",
    "answer": true,
    "why": "Haiti declared independence in 1804 after the only successful large-scale slave revolt leading to statehood."
   },
   {
    "id": "history-L8-t17",
    "s": "The Congress of Vienna in 1815 restored the Bourbon monarchy in France.",
    "answer": true,
    "why": "Louis XVIII was restored under the Charter, with France kept within its pre-revolutionary frontiers and a balance of power."
   },
   {
    "id": "history-L8-t18",
    "s": "The 'Scramble for Africa' was driven mainly by the abolition of slavery in Europe.",
    "answer": false,
    "why": "Motives were chiefly strategic rivalry, markets, raw materials and prestige; abolition was not the driving cause."
   },
   {
    "id": "history-L8-t19",
    "s": "The 'Middle Passage' referred to the sea route carrying enslaved Africans from Africa to the Americas.",
    "answer": true,
    "why": "It was the middle leg of the triangular trade across the Atlantic."
   },
   {
    "id": "history-L8-t20",
    "s": "The 'Salt March' of 1930 was led by Jawaharlal Nehru.",
    "answer": false,
    "why": "It was led by Mohandas Gandhi, not Nehru."
   },
   {
    "id": "history-L8-t21",
    "s": "The 'Congress of Vienna' met in 1815 to reorganise Europe after the Napoleonic Wars.",
    "answer": true,
    "why": "It ran from 1814 to 1815 and reshaped the European order."
   },
   {
    "id": "history-L8-t22",
    "s": "The 'Ming Dynasty' of China was overthrown by the Manchus, who founded the Qing Dynasty.",
    "answer": true,
    "why": "Manchu forces took Beijing in 1644, ending Ming rule."
   },
   {
    "id": "history-L8-t23",
    "s": "The 'Berlin Conference' of 1884–1885 divided Africa among European powers without African representation.",
    "answer": true,
    "why": "The conference set rules for the scramble for Africa among European states."
   },
   {
    "id": "history-L8-t24",
    "s": "The 'Russian Revolution' of February 1917 overthrew the Tsarist autocracy.",
    "answer": true,
    "why": "It ended Romanov rule and led to a provisional government."
   }
  ],
  "terms": [
   {
    "id": "history-L8-w1",
    "word": "ABSOLUTISM",
    "clue": "Form of monarchy in which the ruler claims unlimited authority."
   },
   {
    "id": "history-L8-w2",
    "word": "MERCANTILISM",
    "clue": "Economic doctrine stressing exports and colonial wealth for the mother country."
   },
   {
    "id": "history-L8-w3",
    "word": "IMPERIALISM",
    "clue": "Extension of a state's power over other territories, often by conquest or settlement."
   },
   {
    "id": "history-L8-w4",
    "word": "NATIONALISM",
    "clue": "Identification with a nation and advocacy of its interests and sovereignty."
   },
   {
    "id": "history-L8-w5",
    "word": "REFORMATION",
    "clue": "Sixteenth-century movement that challenged papal authority and split Western Christianity."
   },
   {
    "id": "history-L8-w6",
    "word": "COLONIALISM",
    "clue": "Practice of acquiring and governing overseas territories and their peoples."
   },
   {
    "id": "history-L8-w7",
    "word": "ABOLITION",
    "clue": "Movement to end the transatlantic slave trade and slavery itself."
   },
   {
    "id": "history-L8-w8",
    "word": "CALIPHATE",
    "clue": "Political and religious leadership of the Muslim community after Muhammad."
   },
   {
    "id": "history-L8-w9",
    "word": "DECOLONISATION",
    "clue": "Process by which colonies gained independence after the Second World War."
   },
   {
    "id": "history-L8-w10",
    "word": "PROTECTORATE",
    "clue": "Territory under a stronger state's control while keeping its own ruler"
   },
   {
    "id": "history-L8-w11",
    "word": "REFERENDUM",
    "clue": "Direct vote by the electorate on a specific policy or constitutional question"
   },
   {
    "id": "history-L8-w12",
    "word": "FEDERALISM",
    "clue": "Division of power between central and regional governments in one state"
   }
  ]
 },
 "9": {
  "questions": [
   {
    "id": "history-L9-q1",
    "q": "The 'Military Revolution' thesis associated with Geoffrey Parker links the rise of the early modern state chiefly to which development?",
    "options": [
     "The adoption of universal conscription",
     "The decline of cavalry in favour of infantry",
     "The spread of gunpowder to the Americas",
     "The construction of oceanic fleets",
     "The trace italienne and the growth of standing armies"
    ],
    "answer": 4,
    "why": "Parker argued that the trace italienne fortifications forced rulers to fund large standing armies, driving fiscal-military state growth.",
    "hint": "Think about fortification design that resisted cannon fire."
   },
   {
    "id": "history-L9-q2",
    "q": "In the 'developmental state' literature, East Asian industrial policy after 1945 is best characterised by:",
    "options": [
     "Import substitution without export orientation",
     "Reliance on foreign direct investment alone",
     "Nationalisation of all heavy industry",
     "Complete laissez-faire with no tariffs",
     "State-directed credit and selective protection of strategic industries"
    ],
    "answer": 4,
    "why": "Scholars such as Amsden and Wade stress state allocation of credit and selective protection in Japan, Korea and Taiwan.",
    "hint": "Consider how banks were steered by the state."
   },
   {
    "id": "history-L9-q3",
    "q": "The 'Glorious Revolution' of 1688 is best understood in fiscal-military terms as:",
    "options": [
     "A reaction against colonial expansion",
     "A victory of Catholic absolutism",
     "A revolt of the rural peasantry",
     "A settlement that enabled Parliament to fund a large war against France",
     "A popular uprising against all taxation"
    ],
    "answer": 3,
    "why": "The post-1688 settlement allowed Parliament to finance a vastly expanded army and navy for war with Louis XIV.",
    "hint": "Think about the Nine Years' War that followed."
   },
   {
    "id": "history-L9-q4",
    "q": "Which best explains the 'resource curse' argument in comparative politics?",
    "options": [
     "Resource rents strengthen parliamentary oversight",
     "Resource exports reduce inequality",
     "Resource wealth inevitably causes civil war",
     "Resource-rich states always grow faster",
     "Resource rents weaken accountability by freeing rulers from taxation of citizens"
    ],
    "answer": 4,
    "why": "Rentier-state theory holds that non-tax revenue reduces the ruler's dependence on citizens, weakening accountability.",
    "hint": "Think about the link between taxation and representation."
   },
   {
    "id": "history-L9-q5",
    "q": "The 'Congress System' after 1815 was weakened most directly by:",
    "options": [
     "Divergent great-power interests over intervention in revolutions",
     "The death of Metternich in 1821",
     "The unification of Germany in 1871",
     "The Crimean War of 1853",
     "The French Revolution of 1848"
    ],
    "answer": 0,
    "why": "Disagreement over intervention in Spain, Italy and the Americas eroded the concert's cohesion in the 1820s.",
    "hint": "Consider disagreements over suppressing revolts."
   },
   {
    "id": "history-L9-q6",
    "q": "The 'Nuremberg Principles' of 1950 established which key doctrine in international law?",
    "options": [
     "Individual criminal responsibility for crimes under international law",
     "The immunity of heads of state from prosecution",
     "The legality of pre-emptive war",
     "The supremacy of domestic courts over international tribunals",
     "The abolition of the crime of aggression"
    ],
    "answer": 0,
    "why": "The principles affirmed that individuals, including officials, bear criminal responsibility under international law.",
    "hint": "Think about who can be tried, not just states."
   },
   {
    "id": "history-L9-q7",
    "q": "Which best captures the 'second slavery' thesis in Atlantic history?",
    "options": [
     "Slavery was confined to the Caribbean after 1800",
     "Slavery declined steadily after 1807 everywhere",
     "The nineteenth-century expansion of slavery in the Americas was modern and capitalist, not residual",
     "Abolition preceded the Industrial Revolution everywhere",
     "Slavery was abolished by the Congress of Vienna"
    ],
    "answer": 2,
    "why": "Historians such as Tomich argue that slavery expanded and modernised in Brazil, Cuba and the US South in the 19th century.",
    "hint": "Think about cotton and sugar after 1800."
   },
   {
    "id": "history-L9-q8",
    "q": "The 'totalitarian' model in comparative politics is most criticised for:",
    "options": [
     "Understating differences between Nazi Germany and Stalinist USSR",
     "Treating democracies as totalitarian",
     "Overemphasising pluralism in one-party states",
     "Ignoring ideology altogether",
     "Denying the role of terror"
    ],
    "answer": 0,
    "why": "Critics argue the model flattens important distinctions between fascist and communist regimes.",
    "hint": "Think about comparisons between Hitler and Stalin."
   },
   {
    "id": "history-L9-q9",
    "q": "In the 'fiscal-military state' framework, Britain's 18th-century advantage is attributed mainly to:",
    "options": [
     "An efficient excise and public credit system",
     "Reliance on colonial tribute alone",
     "The abolition of the national debt",
     "A huge standing army in peacetime",
     "The absence of taxation"
    ],
    "answer": 0,
    "why": "Brewer and others stress excise taxation and credible public credit as the basis of Britain's fiscal capacity.",
    "hint": "Think about how wars were financed."
   },
   {
    "id": "history-L9-q10",
    "q": "The 'dependency theory' of Prebisch and Frank argued that:",
    "options": [
     "Peripheral economies are structurally disadvantaged by trade with the core",
     "Free trade benefits all parties equally",
     "Core states are impoverished by the periphery",
     "Colonialism had no economic effects",
     "Industrialisation is impossible in the periphery"
    ],
    "answer": 0,
    "why": "Dependency theorists held that terms of trade and structural relations keep the periphery subordinate.",
    "hint": "Think about centre and periphery in trade."
   },
   {
    "id": "history-L9-q11",
    "q": "The 'Military Revolution' thesis associated with Geoffrey Parker argues that which combination of changes in early modern Europe most transformed warfare and state formation?",
    "options": [
     "Mercenary armies, siege artillery and city-state leagues",
     "Naval galleys, boarding actions and coastal fortresses",
     "Guerrilla warfare, partisan militias and decentralised command",
     "Chivalric cavalry tactics, feudal levies and castle-building",
     "Trace italienne fortifications, mass infantry firepower and fiscal-military bureaucracy"
    ],
    "answer": 4,
    "why": "Parker links the trace italienne, massed gunpowder infantry and the growth of fiscal-military states into a single transformative package.",
    "hint": "Think of the response to cannon: low, thick-walled fortresses and trained infantry paid by bureaucracies."
   },
   {
    "id": "history-L9-q12",
    "q": "In the 'staples thesis' of Canadian economic history, which mechanism best explains the long-run pattern of settlement and institutions?",
    "options": [
     "Indigenous trade networks were replaced by a single monopoly company",
     "Railway subsidies eliminated dependence on resource exports",
     "Immigration policy alone determined regional population distribution",
     "Industrialisation driven by protective tariffs created the national market",
     "Export of a succession of primary commodities shaped transport, capital and social structure"
    ],
    "answer": 4,
    "why": "The staples approach holds that successive resource exports (fur, timber, wheat) conditioned institutions, transport and settlement.",
    "hint": "It is about what was exported, not about tariffs or railways per se."
   },
   {
    "id": "history-L9-q13",
    "q": "Which statement best explains why the 'Glorious Revolution' of 1688 is treated as a constitutional turning point rather than merely a dynastic change?",
    "options": [
     "It ended the royal prerogative of declaring war entirely",
     "It permanently devolved power to Scotland and Ireland",
     "It introduced universal male suffrage and annual parliaments",
     "It abolished the monarchy and established a republic",
     "Parliament asserted a contractual basis for monarchy through the Bill of Rights and financial control"
    ],
    "answer": 4,
    "why": "The settlement of 1689 made royal power conditional on parliamentary statute and control of finance.",
    "hint": "Focus on what Parliament secured in 1689, not on who sat on the throne."
   },
   {
    "id": "history-L9-q14",
    "q": "The 'dependency theory' of Andre Gunder Frank and others explains persistent underdevelopment primarily through which relationship?",
    "options": [
     "Excessive state planning in developing economies",
     "Surplus extraction from peripheral satellites by metropolitan centres",
     "Cultural differences in entrepreneurial values",
     "Absence of natural resources in poor regions",
     "Rapid population growth outpacing agricultural output"
    ],
    "answer": 1,
    "why": "Dependency theory posits a structured metropole–satellite relation in which surplus is drained from the periphery.",
    "hint": "It is a structural, not cultural or Malthusian, explanation."
   },
   {
    "id": "history-L9-q15",
    "q": "Which feature most distinguishes a 'consociational' democracy from a majoritarian one?",
    "options": [
     "A single-party system with regular plebiscites",
     "Judicial review of all legislation",
     "A unitary rather than federal territorial structure",
     "Power-sharing through grand coalitions, mutual veto and segmental autonomy",
     "Direct election of the head of government"
    ],
    "answer": 3,
    "why": "Lijphart's consociational model rests on grand coalition, mutual veto, proportionality and segmental autonomy.",
    "hint": "Think of divided societies and shared executive power."
   }
  ],
  "truths": [
   {
    "id": "history-L9-t1",
    "s": "The Peace of Westphalia (1648) recognised the sovereignty of the Dutch Republic and the Swiss Confederacy.",
    "answer": true,
    "why": "Both were recognised as independent from the Empire and Spain."
   },
   {
    "id": "history-L9-t2",
    "s": "The 'Nanjing Decade' refers to the period when the Chinese Communist Party governed from Nanjing.",
    "answer": false,
    "why": "It was the Nationalist government under Chiang Kai-shek that governed from Nanjing."
   },
   {
    "id": "history-L9-t3",
    "s": "The 'dual mandate' doctrine held that colonial powers should govern primarily for the benefit of settlers.",
    "answer": false,
    "why": "It held that they should govern for the benefit of indigenous peoples as well as for themselves."
   },
   {
    "id": "history-L9-t4",
    "s": "The 'Long Telegram' of 1946 was written by George Kennan and advocated containment of the Soviet Union.",
    "answer": true,
    "why": "Kennan's telegram shaped the containment doctrine."
   },
   {
    "id": "history-L9-t5",
    "s": "The 'Berlin Conference' of 1884–85 formally partitioned Africa among European powers with detailed boundary maps.",
    "answer": false,
    "why": "It set rules for the scramble but did not itself draw detailed boundaries."
   },
   {
    "id": "history-L9-t6",
    "s": "The 'Meiji Constitution' of 1889 established a parliamentary system in Japan with the emperor as sovereign.",
    "answer": true,
    "why": "It created a diet while reserving sovereignty in the emperor."
   },
   {
    "id": "history-L9-t7",
    "s": "The 'Hundred Flowers Campaign' in China (1956–57) encouraged criticism of the Communist Party before repression followed.",
    "answer": true,
    "why": "Intellectuals were invited to criticise, then many were persecuted."
   },
   {
    "id": "history-L9-t8",
    "s": "The 'Long Parliament' first met in 1640 and was dissolved permanently in 1653 by Oliver Cromwell.",
    "answer": false,
    "why": "It was dissolved in 1660, not 1653, after the Restoration."
   },
   {
    "id": "history-L9-t9",
    "s": "The Meiji Restoration of 1868 abolished the han domains and replaced them with prefectures by 1871.",
    "answer": true,
    "why": "The abolition of the han and establishment of prefectures came in 1871."
   },
   {
    "id": "history-L9-t10",
    "s": "The Berlin Conference of 1884–1885 established the principle of effective occupation for colonial claims in Africa.",
    "answer": true,
    "why": "Effective occupation was a key principle agreed at Berlin."
   },
   {
    "id": "history-L9-t11",
    "s": "Haiti's revolution produced the first independent black republic in the Americas in 1804.",
    "answer": true,
    "why": "Haiti declared independence in 1804 as a black republic."
   },
   {
    "id": "history-L9-t12",
    "s": "The 'Atlantic System' relied on the triangular trade linking Europe, Africa and the Americas, with enslaved labour central to plantation economies.",
    "answer": true,
    "why": "The triangular trade and plantation slavery were central to the Atlantic system."
   },
   {
    "id": "history-L9-t13",
    "s": "The Bandung Conference of 1955 was attended mainly by Latin American states.",
    "answer": false,
    "why": "It was predominantly Asian and African states; Latin America was largely absent."
   },
   {
    "id": "history-L9-t14",
    "s": "Mansa Musa's hajj of 1324 is chiefly remembered for the gold he distributed in Cairo and the effect on its economy.",
    "answer": true,
    "why": "His gold distribution in Cairo is the best-remembered feature."
   },
   {
    "id": "history-L9-t15",
    "s": "The Congress of Vienna's principle of 'legitimacy' meant restoring dynasties displaced by the French Revolution and Napoleon.",
    "answer": true,
    "why": "Legitimacy meant restoring pre-revolutionary dynasties."
   },
   {
    "id": "history-L9-t16",
    "s": "The 'Scramble for Africa' was driven solely by the search for new markets, with no role for strategic rivalry.",
    "answer": false,
    "why": "Strategic rivalry and prestige were also central, not markets alone."
   },
   {
    "id": "history-L9-t17",
    "s": "The 'mandate system' after the First World War placed former Ottoman and German territories under League of Nations supervision.",
    "answer": true,
    "why": "Mandates were administered under League supervision."
   },
   {
    "id": "history-L9-t18",
    "s": "The Treaty of Westphalia (1648) is often said to have established the principle of sovereign equality among states.",
    "answer": true,
    "why": "It is conventionally credited with enshrining territorial sovereignty and non-interference."
   },
   {
    "id": "history-L9-t19",
    "s": "The 'Open Door Notes' of 1899 were issued by Britain to secure exclusive trading rights in China.",
    "answer": false,
    "why": "They were issued by the United States and sought equal access, not exclusive rights."
   },
   {
    "id": "history-L9-t20",
    "s": "The 'Zollverein' was a customs union that promoted economic integration among German states before unification.",
    "answer": true,
    "why": "It removed internal tariffs and fostered Prussian-led integration."
   },
   {
    "id": "history-L9-t21",
    "s": "The 'Balfour Declaration' of 1917 supported a Jewish national home in Palestine.",
    "answer": true,
    "why": "It was a British statement of support for a Jewish homeland."
   },
   {
    "id": "history-L9-t22",
    "s": "The 'Suez Crisis' of 1956 saw Britain, France and Israel intervene after Egypt nationalised the canal.",
    "answer": true,
    "why": "Nasser's nationalisation prompted the tripartite intervention."
   },
   {
    "id": "history-L9-t23",
    "s": "The 'Congress of Vienna' of 1815 was convened mainly to punish France by permanent occupation.",
    "answer": false,
    "why": "It aimed at a balance of power and restoration, not permanent occupation."
   },
   {
    "id": "history-L9-t24",
    "s": "The 'Fourteen Points' of 1918 included the principle of self-determination of peoples.",
    "answer": true,
    "why": "Wilson's programme endorsed self-determination."
   }
  ],
  "terms": [
   {
    "id": "history-L9-w1",
    "word": "RENTIER",
    "clue": "State living off resource revenues rather than taxation"
   },
   {
    "id": "history-L9-w2",
    "word": "CONTAINMENT",
    "clue": "Cold War policy of limiting Soviet expansion"
   },
   {
    "id": "history-L9-w3",
    "word": "MERCANTILISM",
    "clue": "Economic doctrine stressing exports and colonial trade surpluses"
   },
   {
    "id": "history-L9-w4",
    "word": "DECOLONISATION",
    "clue": "Withdrawal of colonial rule and emergence of independent states"
   },
   {
    "id": "history-L9-w5",
    "word": "CONSOCIATIONAL",
    "clue": "Power-sharing model for divided societies, associated with Lijphart"
   },
   {
    "id": "history-L9-w6",
    "word": "FEUDALISM",
    "clue": "Land-for-service social order of lords, vassals and peasants"
   },
   {
    "id": "history-L9-w7",
    "word": "GUERRILLA",
    "clue": "Irregular warfare by small mobile bands against larger forces"
   },
   {
    "id": "history-L9-w8",
    "word": "PROTECTORATE",
    "clue": "Territory under a stronger state's protection and partial control"
   }
  ]
 },
 "10": {
  "questions": [
   {
    "id": "history-L10-q1",
    "q": "The 'Tricontinental Conference' of 1966, which helped launch the Organisation of Solidarity of the Peoples of Africa, Asia and Latin America, was held in which city?",
    "options": [
     "Havana",
     "Algiers",
     "Accra",
     "Cairo",
     "Bandung"
    ],
    "answer": 0,
    "why": "The first Tricontinental Conference met in Havana in January 1966, hosted by Castro's Cuba and attended by delegates from three continents.",
    "hint": "The host was a Caribbean island state with a revolutionary government."
   },
   {
    "id": "history-L10-q2",
    "q": "The 1552 'Capitulations' granted by Suleiman I to France are best understood as:",
    "options": [
     "A military alliance against the Habsburgs",
     "An Ottoman acceptance of French religious authority",
     "Commercial privileges within Ottoman lands, not a surrender of sovereignty",
     "A treaty ceding Ottoman territory to France",
     "A loan agreement with French bankers"
    ],
    "answer": 2,
    "why": "The Capitulations were unilateral grants of commercial and legal privileges to French merchants; the term never meant political surrender, though later treaties were interpreted that way.",
    "hint": "Think about what 'capitulation' meant in the sixteenth-century Ottoman chancery, not in modern English."
   },
   {
    "id": "history-L10-q3",
    "q": "The 'Kabaka Crisis' of 1953–55 in Buganda arose most directly from:",
    "options": [
     "Taxation of cash crops",
     "The deportation of Kabaka Muteesa II by the British governor",
     "A dispute over Indian immigration",
     "Boundary changes with Tanganyika",
     "The introduction of a legislative council in Uganda"
    ],
    "answer": 1,
    "why": "Governor Cohen exiled Muteesa II for demanding Buganda's independence from the Uganda protectorate; the crisis shaped the independence settlement.",
    "hint": "It involved a monarch sent into exile."
   },
   {
    "id": "history-L10-q4",
    "q": "Which development most directly made the 'New Imperialism' of 1870–1914 militarily possible in Africa?",
    "options": [
     "Quinine alone",
     "Railway construction alone",
     "The telegraph alone",
     "The breech-loading rifle and the Maxim gun",
     "The steamship alone"
    ],
    "answer": 3,
    "why": "Rapid-fire small arms gave small European forces decisive firepower; quinine, steam and telegraph helped but were not the direct combat enabler.",
    "hint": "Think of the weapon used at Omdurman."
   },
   {
    "id": "history-L10-q5",
    "q": "The 'Nanjing Decade' (1927–1937) is best characterised as a period when the Nationalist government:",
    "options": [
     "Achieved full unification of China",
     "Modernised urban administration and finance while fighting the Communists and Japan",
     "Abolished private property",
     "Ended all foreign concessions by treaty",
     "Dissolved the Nationalist army"
    ],
    "answer": 1,
    "why": "The Nanjing government carried out currency, tax and legal reforms in the cities while facing Communist insurgency and Japanese encroachment.",
    "hint": "Reform in the cities, war in the countryside."
   },
   {
    "id": "history-L10-q6",
    "q": "In the 'fiscal-military state' framework, Britain's eighteenth-century advantage is attributed mainly to:",
    "options": [
     "Efficient public credit and excise taxation sustained by Parliament",
     "A large standing army funded by direct taxation",
     "A gold standard adopted in 1717",
     "Privateering profits alone",
     "Colonial tribute alone"
    ],
    "answer": 0,
    "why": "Brewer and others stress Parliament-backed public credit and excise revenue, which let Britain borrow and spend on a scale rivals could not match.",
    "hint": "It is about credit and excise, not the size of the army."
   },
   {
    "id": "history-L10-q7",
    "q": "The 'staples thesis' of Canadian economic history, associated with Harold Innis, explains:",
    "options": [
     "The rise of Canadian manufacturing",
     "How export staples shaped regional economies and institutions",
     "The decline of the fur trade",
     "The origins of Confederation",
     "The pattern of immigration"
    ],
    "answer": 1,
    "why": "Innis argued that successive staples — fur, fish, timber, wheat — shaped settlement patterns, transport and political institutions.",
    "hint": "It is about what was exported, not what was made."
   },
   {
    "id": "history-L10-q8",
    "q": "The 'Nihon Shoki' and 'Kojiki' are chiefly valuable to historians because they:",
    "options": [
     "document the Kamakura shogunate in detail",
     "provide exact contemporary records of the Jōmon period",
     "record only Buddhist monastic rules",
     "are Chinese-language copies of Korean royal annals",
     "preserve myth and genealogy legitimating the Yamato court while also recording continental and clan traditions"
    ],
    "answer": 4,
    "why": "Both are early Japanese chronicles mixing myth with genealogical and clan material used to legitimate Yamato rule.",
    "hint": "Think about what these eighth-century texts were for."
   },
   {
    "id": "history-L10-q9",
    "q": "The 'Mfecane' debate in southern African historiography chiefly concerns whether:",
    "options": [
     "Shaka was a historical figure at all",
     "the kingdom of Mapungubwe was Bantu or Khoisan",
     "the Great Trek preceded or followed the arrival of the Dutch",
     "the Cape Colony was founded by the Dutch or the Portuguese",
     "the upheavals of the early nineteenth century were driven mainly by Zulu expansion or by broader regional and environmental pressures"
    ],
    "answer": 4,
    "why": "Historians dispute whether Shaka's Zulu kingdom caused the upheavals or whether wider pressures such as drought and trade were primary.",
    "hint": "It is a dispute about causation of early nineteenth-century upheaval."
   },
   {
    "id": "history-L10-q10",
    "q": "Which best explains why the 'Mughal mansabdari' system is often described as a system of 'transferable' service elites?",
    "options": [
     "Mansabdars owned their lands hereditarily",
     "Mansabdars were elected by village councils",
     "Mansabdars received revenue assignments but were frequently posted and their jagirs reassigned to prevent local power bases",
     "Mansabdars were exclusively religious scholars",
     "Mansabdars paid no revenue to the state"
    ],
    "answer": 2,
    "why": "Mansabdars held rank and revenue rights but were rotated and reassigned, limiting hereditary local entrenchment.",
    "hint": "Consider how the state prevented officers becoming local lords."
   },
   {
    "id": "history-L10-q11",
    "q": "The 'Tacky's War' (1760–1761) in Jamaica is significant in Atlantic history because it:",
    "options": [
     "was a large slave rebellion that forced extensive militia mobilisation and shaped later colonial fear of uprisings",
     "was a revolt of white indentured servants",
     "ended the transatlantic slave trade immediately",
     "established Jamaica's independence",
     "was a naval battle between Britain and Spain"
    ],
    "answer": 0,
    "why": "Tacky's War was a major enslaved rebellion requiring large-scale militia response and had lasting impact on colonial policy and fear.",
    "hint": "It involved enslaved people, not sailors or servants."
   },
   {
    "id": "history-L10-q12",
    "q": "In the 'Glorious Revolution' settlement, the 'Mutiny Act' and later annual 'Army Acts' mattered constitutionally because they:",
    "options": [
     "granted universal male suffrage",
     "ended the royal veto permanently",
     "required parliamentary approval for maintaining a standing army, tying military funding to regular parliamentary sessions",
     "abolished the monarchy's power to declare war",
     "created the office of prime minister"
    ],
    "answer": 2,
    "why": "Annual army legislation forced frequent parliaments and subjected standing armies to parliamentary control.",
    "hint": "It links military funding to parliamentary meetings."
   },
   {
    "id": "history-L10-q13",
    "q": "In comparative politics, 'militant democracy' (streitbare Demokratie) refers to:",
    "options": [
     "a system requiring coalition governments",
     "a democracy governed by generals",
     "a system of compulsory military service",
     "a constitutional order that restricts anti-democratic parties and groups to protect democracy itself",
     "rule by referendum alone"
    ],
    "answer": 3,
    "why": "The concept, associated with post-war Germany, allows restrictions on parties and rights deemed to threaten the democratic order.",
    "hint": "The adjective is about defending democracy, not the army."
   },
   {
    "id": "history-L10-q14",
    "q": "The 'Statute of Anne' (1710) is significant in legal and political history because it:",
    "options": [
     "granted freedom of the press",
     "established the Bank of England",
     "established a statutory copyright regime vesting limited-term rights in authors",
     "created the first police force",
     "abolished the House of Lords' judicial role"
    ],
    "answer": 2,
    "why": "It created the first statutory copyright in Britain, vesting limited-term rights in authors rather than only printers.",
    "hint": "It concerns authors and copies, not policing or banking."
   },
   {
    "id": "history-L10-q15",
    "q": "Which best explains why the 'Kanun-i Esasi' (1876) is described as a constitution that was 'granted' rather than 'won'?",
    "options": [
     "It was promulgated by Sultan Abdülhamid II, who later suspended it and the parliament, so sovereignty remained with the monarch",
     "It was imposed by foreign powers",
     "It was drafted by an elected constituent assembly",
     "It abolished the sultanate",
     "It established a republic"
    ],
    "answer": 0,
    "why": "The Ottoman constitution was an octroi from the sultan, who retained sovereignty and soon suspended it.",
    "hint": "Consider who gave it and who could take it away."
   }
  ],
  "truths": [
   {
    "id": "history-L10-t1",
    "s": "The 'Long Parliament' of 1640 was dissolved by Charles I in 1642 after it refused to grant him subsidies.",
    "answer": false,
    "why": "It was not dissolved in 1642; it sat (in various forms) until 1660 and was purged by Pride in 1648, not dissolved by Charles."
   },
   {
    "id": "history-L10-t2",
    "s": "The Nanjing Decade (1927–1937) was a period of Nationalist rule during which the Guomindang government at Nanjing carried out land reform and defeated the Chinese Communist Party.",
    "answer": false,
    "why": "The Nanjing government largely failed at land reform and did not defeat the CCP; the Communists survived the Long March (1934–35)."
   },
   {
    "id": "history-L10-t3",
    "s": "The 'dual mandate' doctrine held that colonial powers had a duty to develop tropical Africa's resources for the benefit of the whole world as well as for local peoples.",
    "answer": true,
    "why": "Lugard's Dual Mandate in Tropical Africa (1922) framed colonial rule as a trust for both local and global interests."
   },
   {
    "id": "history-L10-t4",
    "s": "The 'Military Revolution' thesis associated with Geoffrey Parker links European global expansion to improvements in fortification, firearms and drill.",
    "answer": true,
    "why": "Parker argued that trace italienne fortifications and gunpowder infantry tactics gave European states a decisive edge."
   },
   {
    "id": "history-L10-t5",
    "s": "The 'dependency theory' of Andre Gunder Frank argued that underdevelopment in the global South was caused primarily by internal cultural factors rather than by integration into the world economy.",
    "answer": false,
    "why": "Frank argued the opposite: that peripheral regions were actively underdeveloped by their integration into a capitalist world system."
   },
   {
    "id": "history-L10-t6",
    "s": "A 'consociational' democracy, as described by Arend Lijphart, relies on power-sharing among segmented groups through grand coalitions, mutual vetoes and proportional representation.",
    "answer": true,
    "why": "Lijphart's model of consociationalism includes grand coalition, mutual veto, proportionality and segmental autonomy."
   },
   {
    "id": "history-L10-t7",
    "s": "The 'dual mandate' doctrine held that colonial powers had obligations to both the colonised peoples and the wider world economy.",
    "answer": true,
    "why": "Lugard argued trusteeship served both African development and global commerce."
   },
   {
    "id": "history-L10-t8",
    "s": "The principle of collective security holds that aggression against one member is to be met by the collective response of all members.",
    "answer": true,
    "why": "That is the defining idea behind the League Covenant and the UN Charter."
   },
   {
    "id": "history-L10-t9",
    "s": "Dependency theory argues that peripheral economies are kept underdeveloped by their integration into the world capitalist system.",
    "answer": true,
    "why": "Frank and others held that surplus extraction by the core perpetuates peripheral underdevelopment."
   },
   {
    "id": "history-L10-t10",
    "s": "The 'Military Revolution' thesis argues that the key change was the introduction of gunpowder artillery and new fortification styles in early modern Europe.",
    "answer": true,
    "why": "Parker linked trace italienne fortifications and artillery to larger, costlier armies."
   },
   {
    "id": "history-L10-t11",
    "s": "The Ottoman 'Capitulations' were agreements in which the sultan surrendered sovereignty over his empire to European powers.",
    "answer": false,
    "why": "They granted commercial and legal privileges, not sovereignty."
   },
   {
    "id": "history-L10-t12",
    "s": "The 'second slavery' thesis holds that slavery expanded in new capitalist zones in the nineteenth century, notably Cuba and Brazil.",
    "answer": true,
    "why": "Tomich and others stress the modern, expansive character of nineteenth-century slavery."
   },
   {
    "id": "history-L10-t13",
    "s": "The 'mandate system' allowed mandatory powers to annex territories outright.",
    "answer": false,
    "why": "Annexation was expressly excluded; mandates were held under League supervision."
   },
   {
    "id": "history-L10-t14",
    "s": "The 'resource curse' argument holds that abundant natural resources can undermine democratic governance and economic diversification.",
    "answer": true,
    "why": "It links resource rents to authoritarianism and weak diversification."
   },
   {
    "id": "history-L10-t15",
    "s": "The 'Long Parliament' passed the Triennial Act requiring Parliament to be summoned at least every three years.",
    "answer": true,
    "why": "The 1641 Triennial Act required regular parliaments, a key check on royal rule without Parliament."
   },
   {
    "id": "history-L10-t16",
    "s": "The 'Treaty of Lausanne' (1923) established the League of Nations mandate over Palestine.",
    "answer": false,
    "why": "Lausanne dealt with Turkey's borders and population exchange; the Palestine mandate came from the San Remo/Sèvres process."
   },
   {
    "id": "history-L10-t17",
    "s": "The 'Ara Pacis Augustae' was an altar dedicated to peace and linked to Augustus's consolidation of power.",
    "answer": true,
    "why": "It celebrated Augustus's return and the peace he claimed to have brought."
   },
   {
    "id": "history-L10-t18",
    "s": "In the 'Dual Monarchy' of Austria-Hungary after 1867, Hungary had complete independence in foreign policy.",
    "answer": false,
    "why": "Foreign affairs, defence and finance remained common to both halves under the monarch."
   },
   {
    "id": "history-L10-t19",
    "s": "The 'Maji Maji' rebellion (1905–1907) took place in German East Africa.",
    "answer": true,
    "why": "It was an anti-colonial uprising in German East Africa, violently suppressed."
   },
   {
    "id": "history-L10-t20",
    "s": "The 'Bretton Woods' system operated a freely floating exchange rate regime from its inception.",
    "answer": false,
    "why": "It used pegged but adjustable exchange rates tied to the dollar, not free floating."
   },
   {
    "id": "history-L10-t21",
    "s": "The 'Tordesillas' line was later modified by the Treaty of Zaragoza in 1529.",
    "answer": true,
    "why": "Zaragoza adjusted the anti-meridian in the Pacific, complementing Tordesillas."
   }
  ],
  "terms": [
   {
    "id": "history-L10-w1",
    "word": "SATRAPY",
    "clue": "Province governed by a Persian viceroy under the Achaemenid kings."
   },
   {
    "id": "history-L10-w2",
    "word": "BURGHER",
    "clue": "Dutch-descended free citizen of a Cape Colony town, later a term for middle-class townsman."
   },
   {
    "id": "history-L10-w3",
    "word": "CAPITULATIONS",
    "clue": "Ottoman grants of commercial privileges to European powers"
   },
   {
    "id": "history-L10-w4",
    "word": "JANISSARY",
    "clue": "Ottoman infantry corps recruited through the boy levy"
   },
   {
    "id": "history-L10-w5",
    "word": "CONSOCIATION",
    "clue": "Power-sharing democracy across segmented social groups"
   },
   {
    "id": "history-L10-w6",
    "word": "STAPLES",
    "clue": "Innis's thesis on export commodities shaping economies"
   },
   {
    "id": "history-L10-w7",
    "word": "MANDATE",
    "clue": "League-supervised trusteeship after the First World War"
   }
  ]
 }
};
