/**
 * Lost Civilization: ancient African civilizations, the artifacts you dig up at each (with clues),
 * and questions once you've named it. The finds never name the civilization.
 */
import type { Question } from '../space/questions.js';

export type Find = { name: string; clue: string; art: 'hero' | 'pottery' | 'beads' | 'tool' };
export type Civilization = {
  id: string;
  name: string;
  /** Which dig site picture it uses. */
  dig: 'savanna' | 'desert' | 'stone';
  level: number;
  /** Where and when, revealed once it's named. */
  about: string;
  finds: [Find, Find, Find];
  questions: Question[];
};

const q = (text: string, answer: string, ...wrong: [string, string, string]): Question => ({ q: text, answer, wrong });

export const CIVILIZATIONS: Civilization[] = [
  {
    id: 'nok',
    name: 'The Nok culture',
    dig: 'savanna',
    level: 1,
    about: 'Central Nigeria, about 1500 BC to AD 500.',
    finds: [
      { name: 'Clay head', clue: 'Fired clay, with triangular eyes and pierced pupils; more than 2 000 years old.', art: 'hero' },
      { name: 'Furnace slag', clue: 'Waste from smelting iron, one of the earliest signs of iron-making in West Africa.', art: 'tool' },
      { name: 'Pottery pieces', clue: 'Found in the hills near the Jos Plateau in central Nigeria.', art: 'pottery' },
    ],
    questions: [
      q('Nok sculptures are made of…', 'Terracotta (fired clay)', 'Bronze', 'Gold', 'Marble'),
      q('The Nok culture is known as one of the first in West Africa to work…', 'Iron', 'Plastic', 'Glass', 'Steel girders'),
    ],
  },
  {
    id: 'ife',
    name: 'The Kingdom of Ife',
    dig: 'savanna',
    level: 1,
    about: 'Ile-Ife, south-western Nigeria, flourishing around AD 1100 to 1400.',
    finds: [
      { name: 'Metal head', clue: 'A calm, life-like royal face cast in copper alloy, with fine lines down the face.', art: 'hero' },
      { name: 'Paving pieces', clue: 'Broken pottery set on edge in patterns to pave courtyards.', art: 'pottery' },
      { name: 'Glass beads', clue: 'Made in the city’s own glass workshops and traded far away.', art: 'beads' },
    ],
    questions: [
      q('Ife is in present-day…', 'Osun State, Nigeria', 'Kano State, Nigeria', 'Ghana', 'Egypt'),
      q('The traditional ruler of Ife is the…', 'Ooni', 'Oba', 'Shehu', 'Mansa'),
    ],
  },
  {
    id: 'egypt',
    name: 'Ancient Egypt',
    dig: 'desert',
    level: 1,
    about: 'Along the river Nile, about 3100 BC to 30 BC.',
    finds: [
      { name: 'Golden mask', clue: 'A burial mask of gold for a king, with a striped headdress.', art: 'hero' },
      { name: 'Storage jar', clue: 'Found beside a great river that floods every year in the desert.', art: 'pottery' },
      { name: 'Blue-green beads', clue: 'Glazed beads with tiny picture-symbols carved on them.', art: 'beads' },
    ],
    questions: [
      q('The kings of this civilization were called…', 'Pharaohs', 'Obas', 'Mansas', 'Alaafins'),
      q('Their picture-writing is called…', 'Hieroglyphics', 'Nsibidi', 'Ajami', 'Braille'),
    ],
  },
  {
    id: 'benin',
    name: 'The Kingdom of Benin',
    dig: 'savanna',
    level: 2,
    about: 'Benin City, Edo State, Nigeria, from about AD 1200; still has an Oba today.',
    finds: [
      { name: 'Brass plaque', clue: 'A metal panel showing a warrior chief; hundreds like it covered the king’s palace pillars.', art: 'hero' },
      { name: 'Coral beads', clue: 'Red coral beads worn only by the king and his chiefs.', art: 'beads' },
      { name: 'Casting tools', clue: 'Tools of a royal guild of brass-casters.', art: 'tool' },
    ],
    questions: [
      q('The ruler of this kingdom is called the…', 'Oba', 'Ooni', 'Pharaoh', 'Emir'),
      q('In 1897 thousands of its artworks were taken by…', 'British soldiers', 'Portuguese traders', 'Mali’s army', 'Egyptian pharaohs'),
    ],
  },
  {
    id: 'mali',
    name: 'The Mali Empire',
    dig: 'desert',
    level: 2,
    about: 'West Africa’s Sahel, about AD 1235 to 1600, with Timbuktu as a great city of learning.',
    finds: [
      { name: 'Old manuscript', clue: 'A hand-written book on science and law from a city of scholars on the edge of the Sahara.', art: 'hero' },
      { name: 'Trade beads', clue: 'Beads traded for gold along camel caravan routes.', art: 'beads' },
      { name: 'Mud-brick piece', clue: 'From a great mosque built of sun-dried mud brick.', art: 'pottery' },
    ],
    questions: [
      q('Which emperor of this empire went on a famous pilgrimage in 1324?', 'Mansa Musa', 'Usman dan Fodio', 'Shaka', 'Ramses II'),
      q('This empire grew rich trading…', 'Gold and salt', 'Oil', 'Cocoa', 'Rubber'),
    ],
  },
  {
    id: 'igboukwu',
    name: 'Igbo-Ukwu',
    dig: 'savanna',
    level: 3,
    about: 'Anambra State, south-eastern Nigeria, about the 9th to 10th century AD.',
    finds: [
      { name: 'Bronze vessel', clue: 'An extremely finely cast bronze pot with a rope-like cage, over 1 000 years old.', art: 'hero' },
      { name: 'Thousands of beads', clue: 'More than 100 000 glass and stone beads were found in one burial.', art: 'beads' },
      { name: 'Decorated pottery', clue: 'Found in south-eastern Nigeria, near Onitsha.', art: 'pottery' },
    ],
    questions: [
      q('Igbo-Ukwu is in present-day…', 'Anambra State, Nigeria', 'Lagos State, Nigeria', 'Mali', 'Zimbabwe'),
      q('Igbo-Ukwu bronzes are about how old?', 'Over 1 000 years old', 'About 100 years old', 'About 5 000 years old', 'About 20 years old'),
    ],
  },
  {
    id: 'zimbabwe',
    name: 'Great Zimbabwe',
    dig: 'stone',
    level: 3,
    about: 'South-eastern Zimbabwe, about AD 1100 to 1450.',
    finds: [
      { name: 'Stone bird', clue: 'A bird carved from soapstone that once stood on a stone column.', art: 'hero' },
      { name: 'Foreign pottery', clue: 'Pieces of pottery from China and Persia, brought by Indian Ocean trade.', art: 'pottery' },
      { name: 'Mining tools', clue: 'Tools used to mine gold that was traded to the coast.', art: 'tool' },
    ],
    questions: [
      q('Its great walls were built of…', 'Granite blocks without mortar', 'Mud brick', 'Concrete', 'Wood'),
      q('The modern country named after this city is…', 'Zimbabwe', 'Zambia', 'Ghana', 'Mali'),
    ],
  },
  {
    id: 'aksum',
    name: 'The Kingdom of Aksum',
    dig: 'stone',
    level: 4,
    about: 'Northern Ethiopia and Eritrea, about AD 100 to 940.',
    finds: [
      { name: 'Gold coin', clue: 'One of the first African states to make its own coins, showing a crowned king.', art: 'hero' },
      { name: 'Carved stone piece', clue: 'From giant carved granite pillars (stelae) over 20 metres tall.', art: 'pottery' },
      { name: 'Trade goods', clue: 'Ivory and incense traded with Rome, India and Arabia through the Red Sea.', art: 'beads' },
    ],
    questions: [
      q('This kingdom was in present-day…', 'Ethiopia and Eritrea', 'Nigeria', 'Morocco', 'South Africa'),
      q('King Ezana of this kingdom adopted which religion in the 4th century?', 'Christianity', 'Islam', 'Buddhism', 'Hinduism'),
    ],
  },
  {
    id: 'kush',
    name: 'The Kingdom of Kush',
    dig: 'desert',
    level: 5,
    about: 'Along the Nile in present-day Sudan, about 1070 BC to AD 350, with its capital at Meroë.',
    finds: [
      { name: 'Gold armband', clue: 'Gold jewellery with a ram’s head, from a queen’s pyramid tomb.', art: 'hero' },
      { name: 'Iron slag', clue: 'Heaps of iron waste: its capital was a great iron-working city.', art: 'tool' },
      { name: 'Painted pottery', clue: 'Found near small, steep pyramids south of Egypt.', art: 'pottery' },
    ],
    questions: [
      q('This kingdom was in present-day…', 'Sudan', 'Nigeria', 'Kenya', 'Morocco'),
      q('Its kings once conquered and ruled which land as pharaohs?', 'Egypt', 'Mali', 'Ethiopia', 'Libya'),
    ],
  },
];
