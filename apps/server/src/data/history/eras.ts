/**
 * History Time Machine: the moments the time machine visits (mostly Nigerian and African history),
 * their challenges, and a timeline of real events for "put these in order" challenges.
 */
import type { Question } from '../space/questions.js';

export type Era = {
  id: string;
  title: string;
  /** Shown on the timeline ("c. 500 BC", "1960"). */
  when: string;
  /** For sorting the timeline (negative = BC). */
  year: number;
  place: string;
  intro: string;
  /** The two places in the scene where a challenge waits. */
  spots: [string, string];
  /** The first level it can come up on. */
  level: number;
  questions: Question[];
};

const q = (text: string, answer: string, ...wrong: [string, string, string]): Question => ({ q: text, answer, wrong });

export const ERAS: Era[] = [
  {
    id: 'egypt',
    title: 'The pyramids of Giza',
    when: 'c. 2560 BC',
    year: -2560,
    place: 'Giza, Egypt',
    intro: 'Workers are building the Great Pyramid for the pharaoh Khufu beside the river Nile.',
    spots: ['Pyramid ramp', 'Reed boats on the Nile'],
    level: 1,
    questions: [
      q('The pyramids of Giza were built as…', 'Tombs for pharaohs', 'Palaces for kings to live in', 'Markets', 'Grain stores'),
      q('Which river made life possible in ancient Egypt?', 'The Nile', 'The Niger', 'The Congo', 'The Zambezi'),
      q('Ancient Egyptian writing with pictures and symbols is called…', 'Hieroglyphics', 'Cuneiform', 'Nsibidi', 'Ajami'),
      q('What was the title of the kings of ancient Egypt?', 'Pharaoh', 'Oba', 'Mansa', 'Emir'),
    ],
  },
  {
    id: 'independence',
    title: 'Independence Day',
    when: '1960',
    year: 1960,
    place: 'Lagos, Nigeria',
    intro: 'On 1 October 1960 the green-white-green flag is raised: Nigeria is independent.',
    spots: ['Flag-raising ceremony', 'Celebrating crowd'],
    level: 1,
    questions: [
      q('Nigeria became independent on 1 October of which year?', '1960', '1963', '1957', '1914'),
      q('Who was Nigeria’s Prime Minister at independence?', 'Abubakar Tafawa Balewa', 'Nnamdi Azikiwe', 'Obafemi Awolowo', 'Ahmadu Bello'),
      q('Nigeria became a republic in 1963. Who was its first President?', 'Nnamdi Azikiwe', 'Abubakar Tafawa Balewa', 'Yakubu Gowon', 'Olusegun Obasanjo'),
      q('Which country ruled Nigeria as a colony before independence?', 'Britain', 'France', 'Portugal', 'Germany'),
    ],
  },
  {
    id: 'abuja',
    title: 'A new capital',
    when: '1991',
    year: 1991,
    place: 'Abuja, Nigeria',
    intro: 'Nigeria’s seat of government moves from Lagos to Abuja, a new city in the centre of the country.',
    spots: ['Aso Rock', 'City avenue'],
    level: 1,
    questions: [
      q('In which year did Abuja officially replace Lagos as Nigeria’s capital?', '1991', '1960', '1976', '2000'),
      q(
        'Why was Abuja chosen for the new capital?',
        'It is near the centre of the country',
        'It is on the coast',
        'It was the biggest city',
        'It has the biggest seaport',
      ),
      q('Which huge rock stands behind Abuja’s government buildings?', 'Aso Rock', 'Zuma Rock', 'Olumo Rock', 'Idanre Hills'),
      q(
        'Nigeria returned to democratic rule in 1999. Who became President then?',
        'Olusegun Obasanjo',
        'Umaru Musa Yar’Adua',
        'Goodluck Jonathan',
        'Shehu Shagari',
      ),
    ],
  },
  {
    id: 'colonial',
    title: 'The amalgamation',
    when: '1914',
    year: 1914,
    place: 'Lagos, Nigeria',
    intro: 'The Northern and Southern Protectorates are joined into one colony called Nigeria.',
    spots: ['Railway station', 'Harbour'],
    level: 2,
    questions: [
      q('Joining the Northern and Southern Protectorates in 1914 is called…', 'The amalgamation', 'Independence', 'The partition', 'The civil war'),
      q('Which British governor joined them in 1914?', 'Frederick Lugard', 'Cecil Rhodes', 'Mungo Park', 'Richard Lander'),
      q('Who suggested the name “Nigeria” in 1897?', 'Flora Shaw', 'Queen Victoria', 'Mungo Park', 'Herbert Macaulay'),
      q('The name Nigeria comes from which river?', 'The Niger', 'The Benue', 'The Nile', 'The Ogun'),
    ],
  },
  {
    id: 'nok',
    title: 'The Nok culture',
    when: 'c. 500 BC',
    year: -500,
    place: 'Central Nigeria',
    intro: 'In the hills of central Nigeria, Nok people smelt iron and make terracotta sculptures.',
    spots: ['Iron-smelting furnace', 'Sculptor’s yard'],
    level: 2,
    questions: [
      q('The Nok culture is famous for its…', 'Terracotta sculptures', 'Bronze heads', 'Stone pyramids', 'Gold coins'),
      q('The Nok culture was in present-day…', 'Central Nigeria', 'Egypt', 'Ghana', 'Kenya'),
      q('The Nok people were among the first in West Africa to…', 'Smelt iron', 'Build pyramids', 'Print books', 'Use paper money'),
      q('About how old are Nok sculptures?', 'Over 2 000 years old', 'About 200 years old', 'About 50 years old', 'About 600 years old'),
    ],
  },
  {
    id: 'ife',
    title: 'The royal city of Ife',
    when: 'c. 1300',
    year: 1300,
    place: 'Ile-Ife, Nigeria',
    intro: 'Ife artists cast life-like heads in bronze and shape them in terracotta for the royal court.',
    spots: ['Palace courtyard', 'Artists’ workshop'],
    level: 3,
    questions: [
      q('Ile-Ife is regarded as the spiritual home of which people?', 'The Yoruba', 'The Hausa', 'The Igbo', 'The Kanuri'),
      q('Ife artists made life-like heads from…', 'Bronze and terracotta', 'Gold and silver', 'Glass', 'Ivory only'),
      q('The traditional ruler of Ife is called the…', 'Ooni', 'Oba', 'Emir', 'Alaafin'),
      q('Ife’s famous “potsherd pavements” were made of…', 'Broken pieces of pottery', 'Gold bars', 'Iron sheets', 'Glass bottles'),
    ],
  },
  {
    id: 'benin',
    title: 'The Kingdom of Benin',
    when: 'c. 1500',
    year: 1500,
    place: 'Benin City, Nigeria',
    intro: 'Brass plaques showing court life cover the pillars of the Oba’s palace.',
    spots: ['Oba’s palace', 'City walls'],
    level: 3,
    questions: [
      q('The ruler of the Benin Kingdom is called the…', 'Oba', 'Ooni', 'Mansa', 'Pharaoh'),
      q('Benin’s famous plaques and heads are made mostly of…', 'Brass and bronze', 'Stone', 'Wood only', 'Gold'),
      q('In 1897 British soldiers attacked Benin City and took thousands of…', 'Artworks (the Benin Bronzes)', 'Cattle', 'Ships', 'Books'),
      q('Benin City was protected by huge…', 'Earth walls and moats', 'Glass walls', 'Stone pyramids', 'Iron fences'),
    ],
  },
  {
    id: 'mali',
    title: 'The Mali Empire',
    when: '1324',
    year: 1324,
    place: 'Timbuktu, Mali',
    intro: 'Mansa Musa rules the rich Mali Empire, and Timbuktu becomes a city of scholars and trade.',
    spots: ['Great mosque', 'Salt caravan'],
    level: 4,
    questions: [
      q('Which Mali emperor made a famously rich pilgrimage to Mecca in 1324?', 'Mansa Musa', 'Sundiata Keita', 'Askia Muhammad', 'Sunni Ali'),
      q('Who founded the Mali Empire?', 'Sundiata Keita', 'Mansa Musa', 'Usman dan Fodio', 'Askia Muhammad'),
      q('Timbuktu was famous as a centre of…', 'Learning and trade', 'Fishing only', 'Car making', 'Oil drilling'),
      q('The Mali Empire grew rich from trading…', 'Gold and salt', 'Oil and gas', 'Cocoa', 'Tea'),
    ],
  },
  {
    id: 'oyo',
    title: 'The Oyo Empire',
    when: 'c. 1700',
    year: 1700,
    place: 'Oyo-Ile, Nigeria',
    intro: 'The Oyo Empire is at its height, with a powerful army of horsemen.',
    spots: ['Alaafin’s palace', 'Cavalry stables'],
    level: 4,
    questions: [
      q('The ruler of the Oyo Empire was called the…', 'Alaafin', 'Ooni', 'Oba', 'Shehu'),
      q('Oyo’s army was powerful because of its…', 'Cavalry (soldiers on horses)', 'Navy', 'Camels', 'Elephants'),
      q('The council of nobles that could check the Alaafin’s power was the…', 'Oyo Mesi', 'Ekpe', 'Ozo', 'Ndichie'),
      q('The Oyo Empire was mainly in present-day…', 'South-western Nigeria', 'North-eastern Nigeria', 'Ghana', 'Cameroon'),
    ],
  },
  {
    id: 'sokoto',
    title: 'The Sokoto Caliphate',
    when: 'c. 1810',
    year: 1810,
    place: 'Sokoto, Nigeria',
    intro: 'After the jihad of 1804, the Sokoto Caliphate becomes one of the largest states in Africa.',
    spots: ['Quranic school', 'Sultan’s court'],
    level: 5,
    questions: [
      q('Who led the jihad that founded the Sokoto Caliphate in 1804?', 'Usman dan Fodio', 'Mansa Musa', 'Ahmadu Bello', 'Queen Amina'),
      q('The leader of the Sokoto Caliphate became known as the…', 'Sultan of Sokoto', 'Alaafin', 'Oba', 'Pharaoh'),
      q('Which daughter of Usman dan Fodio was a famous scholar, poet and teacher?', 'Nana Asma’u', 'Queen Amina', 'Moremi', 'Idia'),
      q('British forces captured Sokoto, ending the Caliphate’s independence, in…', '1903', '1804', '1960', '1851'),
    ],
  },
];

/** Real events, for "put these in order" challenges. */
export const EVENTS: { text: string; year: number; level: number }[] = [
  { text: 'The Great Pyramid of Giza is built', year: -2560, level: 1 },
  { text: 'Nigeria becomes independent', year: 1960, level: 1 },
  { text: 'Abuja becomes Nigeria’s capital', year: 1991, level: 1 },
  { text: 'Nigeria returns to democratic rule', year: 1999, level: 1 },
  { text: 'The amalgamation of Nigeria', year: 1914, level: 2 },
  { text: 'Nigeria becomes a republic', year: 1963, level: 2 },
  { text: 'Nok people make terracotta sculptures', year: -500, level: 2 },
  { text: 'Britain takes control of Lagos', year: 1861, level: 2 },
  { text: 'Ife artists cast bronze heads', year: 1300, level: 3 },
  { text: 'Portuguese traders reach Benin', year: 1485, level: 3 },
  { text: 'British soldiers attack Benin City', year: 1897, level: 3 },
  { text: 'Sundiata Keita founds the Mali Empire', year: 1235, level: 4 },
  { text: 'Mansa Musa’s pilgrimage to Mecca', year: 1324, level: 4 },
  { text: 'The Oyo Empire is at its height', year: 1700, level: 4 },
  { text: 'Usman dan Fodio begins the Sokoto jihad', year: 1804, level: 5 },
  { text: 'British forces capture Sokoto', year: 1903, level: 5 },
];
