/**
 * Africa Explorer: countries to find on the map, each with a landmark to visit, facts and questions.
 * `at` is roughly the middle of the country [longitude, latitude]; a tap within `radius` degrees finds it.
 */
import type { Question } from '../space/questions.js';

export type Country = {
  id: string;
  name: string;
  region: 'North Africa' | 'West Africa' | 'East Africa' | 'Central Africa' | 'Southern Africa';
  at: [number, number];
  radius: number;
  level: number;
  landmark: string;
  facts: [string, string];
  questions: Question[];
};

const q = (text: string, answer: string, ...wrong: [string, string, string]): Question => ({ q: text, answer, wrong });

export const COUNTRIES: Country[] = [
  {
    id: 'nigeria',
    name: 'Nigeria',
    region: 'West Africa',
    at: [8.7, 9.1],
    radius: 4.5,
    level: 1,
    landmark: 'Zuma Rock',
    facts: ['Zuma Rock, a huge granite rock near Abuja, appears on the ₦100 note.', 'Nigeria has the largest population in Africa: over 200 million people.'],
    questions: [
      q('What is the capital of Nigeria?', 'Abuja', 'Lagos', 'Kano', 'Ibadan'),
      q('Which river joins the Niger at Lokoja?', 'The Benue', 'The Ogun', 'The Osun', 'The Imo'),
      q('Zuma Rock appears on which Nigerian banknote?', '₦100', '₦50', '₦500', '₦1000'),
    ],
  },
  {
    id: 'egypt',
    name: 'Egypt',
    region: 'North Africa',
    at: [30.8, 26.8],
    radius: 5,
    level: 1,
    landmark: 'The pyramids of Giza',
    facts: ['The Great Pyramid was the tallest building in the world for almost 4 000 years.', 'The Nile flows north through Egypt to the Mediterranean Sea.'],
    questions: [
      q('What is the capital of Egypt?', 'Cairo', 'Alexandria', 'Luxor', 'Giza'),
      q('The Great Pyramid was built for which pharaoh?', 'Khufu', 'Tutankhamun', 'Ramses II', 'Cleopatra'),
      q('Egypt is on which two continents?', 'Africa and Asia', 'Africa and Europe', 'Africa and South America', 'Only Africa'),
    ],
  },
  {
    id: 'kenya',
    name: 'Kenya',
    region: 'East Africa',
    at: [37.9, 0.2],
    radius: 3.5,
    level: 1,
    landmark: 'The Maasai Mara',
    facts: ['Lions, elephants, cheetahs and millions of wildebeest live in the Maasai Mara.', 'The equator passes through Kenya.'],
    questions: [
      q('What is the capital of Kenya?', 'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'),
      q(
        'Each year over a million wildebeest cross between Tanzania and Kenya’s Maasai Mara. This is called…',
        'The Great Migration',
        'The Great Trek',
        'The Harmattan',
        'The Monsoon',
      ),
      q('Kenya’s highest mountain is…', 'Mount Kenya', 'Mount Kilimanjaro', 'Mount Elgon', 'Mount Cameroon'),
    ],
  },
  {
    id: 'southafrica',
    name: 'South Africa',
    region: 'Southern Africa',
    at: [24.5, -29.5],
    radius: 5,
    level: 1,
    landmark: 'Table Mountain',
    facts: ['Table Mountain, about 1 085 m high, is flat on top like a table.', 'South Africa has three capital cities: Pretoria, Cape Town and Bloemfontein.'],
    questions: [
      q('Table Mountain looks down on which city?', 'Cape Town', 'Durban', 'Johannesburg', 'Pretoria'),
      q('Who became South Africa’s first Black president in 1994?', 'Nelson Mandela', 'Desmond Tutu', 'Thabo Mbeki', 'Jacob Zuma'),
      q('South Africa’s three capitals are Pretoria, Cape Town and…', 'Bloemfontein', 'Johannesburg', 'Durban', 'Soweto'),
    ],
  },
  {
    id: 'ghana',
    name: 'Ghana',
    region: 'West Africa',
    at: [-1.0, 7.9],
    radius: 2.6,
    level: 1,
    landmark: 'Kakum canopy walkway',
    facts: ['Kakum’s canopy walkway is a chain of rope bridges high in the rainforest treetops.', 'Ghana is one of the world’s biggest growers of cocoa.'],
    questions: [
      q('What is the capital of Ghana?', 'Accra', 'Kumasi', 'Tamale', 'Cape Coast'),
      q('Ghana became independent from Britain in…', '1957', '1960', '1963', '1945'),
      q('Who was Ghana’s first President?', 'Kwame Nkrumah', 'Jerry Rawlings', 'John Kufuor', 'Kofi Annan'),
    ],
  },
  {
    id: 'tanzania',
    name: 'Tanzania',
    region: 'East Africa',
    at: [34.9, -6.4],
    radius: 4,
    level: 2,
    landmark: 'Mount Kilimanjaro',
    facts: [
      'Kilimanjaro (5 895 m) is the highest mountain in Africa, with snow near the equator.',
      'Tanzania is home to the Serengeti and the island of Zanzibar.',
    ],
    questions: [
      q('About how high is Mount Kilimanjaro?', '5 895 m', '3 895 m', '8 848 m', '1 085 m'),
      q('Tanzania’s official capital is…', 'Dodoma', 'Dar es Salaam', 'Arusha', 'Zanzibar City'),
      q('Kilimanjaro is a…', 'Dormant volcano', 'Sand dune', 'Coral reef', 'Plateau'),
    ],
  },
  {
    id: 'ethiopia',
    name: 'Ethiopia',
    region: 'East Africa',
    at: [39.6, 8.6],
    radius: 4.5,
    level: 2,
    landmark: 'The rock churches of Lalibela',
    facts: ['Lalibela’s 11 churches were carved down into solid rock about 800 years ago.', 'The African Union has its headquarters in Addis Ababa.'],
    questions: [
      q('What is the capital of Ethiopia?', 'Addis Ababa', 'Gondar', 'Lalibela', 'Aksum'),
      q('The churches of Lalibela are special because they are…', 'Carved out of solid rock', 'Made of glass', 'Floating on a lake', 'Built of ice'),
      q(
        'Which battle in 1896 kept Ethiopia free from colonial rule?',
        'The Battle of Adwa',
        'The Battle of Isandlwana',
        'The Battle of Omdurman',
        'The Battle of Waterloo',
      ),
    ],
  },
  {
    id: 'morocco',
    name: 'Morocco',
    region: 'North Africa',
    at: [-6.5, 31.8],
    radius: 3.5,
    level: 2,
    landmark: 'The Sahara at Merzouga',
    facts: ['The Sahara is the largest hot desert in the world.', 'Only the narrow Strait of Gibraltar separates Morocco from Spain.'],
    questions: [
      q('What is the capital of Morocco?', 'Rabat', 'Casablanca', 'Marrakesh', 'Fes'),
      q('The Sahara is the world’s largest…', 'Hot desert', 'Rainforest', 'Lake', 'Mountain range'),
      q('Which mountains cross Morocco?', 'The Atlas Mountains', 'The Drakensberg', 'The Rwenzori Mountains', 'The Andes'),
    ],
  },
  {
    id: 'mali',
    name: 'Mali',
    region: 'West Africa',
    at: [-2.5, 16.5],
    radius: 5,
    level: 3,
    landmark: 'The Great Mosque of Djenné',
    facts: ['The Great Mosque of Djenné is the largest mud-brick building in the world.', 'Every year the whole town re-plasters it with fresh mud.'],
    questions: [
      q('What is the capital of Mali?', 'Bamako', 'Timbuktu', 'Djenné', 'Gao'),
      q('The Great Mosque of Djenné is built of…', 'Mud brick', 'Marble', 'Steel', 'Glass'),
      q('Which great river flows through Mali?', 'The Niger', 'The Nile', 'The Congo', 'The Orange'),
    ],
  },
  {
    id: 'zambia',
    name: 'Zambia',
    region: 'Southern Africa',
    at: [27.8, -13.4],
    radius: 4,
    level: 3,
    landmark: 'Victoria Falls',
    facts: [
      'Victoria Falls is about 1.7 km wide, one of the largest curtains of falling water on Earth.',
      'It lies on the border between Zambia and Zimbabwe.',
    ],
    questions: [
      q('Victoria Falls is on which river?', 'The Zambezi', 'The Nile', 'The Niger', 'The Congo'),
      q('What is the capital of Zambia?', 'Lusaka', 'Livingstone', 'Harare', 'Ndola'),
      q('The local name for Victoria Falls, Mosi-oa-Tunya, means…', 'The smoke that thunders', 'The big river', 'The white mountain', 'The sleeping lion'),
    ],
  },
  {
    id: 'senegal',
    name: 'Senegal',
    region: 'West Africa',
    at: [-14.5, 14.5],
    radius: 2.6,
    level: 3,
    landmark: 'Lac Rose, the Pink Lake',
    facts: ['Lac Rose is very salty, and tiny algae in it turn the water pink.', 'Workers collect salt from the bottom of the lake by hand.'],
    questions: [
      q('What is the capital of Senegal?', 'Dakar', 'Saint-Louis', 'Bamako', 'Banjul'),
      q('What makes Lac Rose pink?', 'Tiny algae in the very salty water', 'Pink paint', 'Flowers floating on it', 'Red rocks under the water'),
      q('Dakar is on the most ___ point of mainland Africa.', 'Western', 'Eastern', 'Northern', 'Southern'),
    ],
  },
  {
    id: 'botswana',
    name: 'Botswana',
    region: 'Southern Africa',
    at: [24.0, -22.3],
    radius: 3.5,
    level: 4,
    landmark: 'The Okavango Delta',
    facts: [
      'The Okavango river spreads into the Kalahari Desert and never reaches the sea.',
      'Botswana has one of the largest elephant populations in Africa.',
    ],
    questions: [
      q('What is the capital of Botswana?', 'Gaborone', 'Francistown', 'Maun', 'Windhoek'),
      q(
        'The Okavango Delta is special because the river…',
        'Spreads into a desert instead of reaching the sea',
        'Flows uphill',
        'Is frozen all year',
        'Is made of salt',
      ),
      q('Botswana is famous for mining…', 'Diamonds', 'Oil', 'Coal only', 'Cocoa'),
    ],
  },
  {
    id: 'madagascar',
    name: 'Madagascar',
    region: 'Southern Africa',
    at: [46.8, -19.2],
    radius: 3.5,
    level: 4,
    landmark: 'The Avenue of the Baobabs',
    facts: ['Baobab trees can live for over 1 000 years and store water in their trunks.', 'Madagascar is the fourth-largest island in the world.'],
    questions: [
      q('What is the capital of Madagascar?', 'Antananarivo', 'Toamasina', 'Mahajanga', 'Port Louis'),
      q('Which animals live in the wild only in Madagascar?', 'Lemurs', 'Gorillas', 'Camels', 'Giraffes'),
      q('Madagascar is in which ocean?', 'The Indian Ocean', 'The Atlantic Ocean', 'The Pacific Ocean', 'The Arctic Ocean'),
    ],
  },
  {
    id: 'namibia',
    name: 'Namibia',
    region: 'Southern Africa',
    at: [17.5, -22.0],
    radius: 4,
    level: 4,
    landmark: 'The red dunes of Sossusvlei',
    facts: ['Some dunes at Sossusvlei are over 300 m high.', 'The Namib is thought to be the oldest desert in the world.'],
    questions: [
      q('What is the capital of Namibia?', 'Windhoek', 'Walvis Bay', 'Gaborone', 'Swakopmund'),
      q('The Namib is thought to be the world’s…', 'Oldest desert', 'Coldest desert', 'Smallest desert', 'Newest desert'),
      q('Namibia’s coast is called the Skeleton Coast because of its…', 'Shipwrecks and whale bones', 'White chalk cliffs', 'Ghost towns', 'Dinosaur fossils'),
    ],
  },
  {
    id: 'drc',
    name: 'DR Congo',
    region: 'Central Africa',
    at: [23.5, -3.0],
    radius: 6,
    level: 5,
    landmark: 'The Congo rainforest',
    facts: [
      'The Congo rainforest is the second-largest rainforest in the world.',
      'The Congo river is the deepest river in the world, over 220 m deep in places.',
    ],
    questions: [
      q('What is the capital of DR Congo?', 'Kinshasa', 'Brazzaville', 'Lubumbashi', 'Goma'),
      q('The Congo rainforest is the world’s…', 'Second-largest rainforest', 'Largest desert', 'Smallest forest', 'Only rainforest'),
      q('The Congo river is the world’s…', 'Deepest river', 'Longest river', 'Shortest river', 'Saltiest river'),
    ],
  },
  {
    id: 'uganda',
    name: 'Uganda',
    region: 'East Africa',
    at: [32.4, 1.4],
    radius: 2.6,
    level: 5,
    landmark: 'Murchison Falls',
    facts: [
      'At Murchison Falls the Nile squeezes through a gap in the rock only about 7 m wide.',
      'Uganda is home to about half of the world’s mountain gorillas.',
    ],
    questions: [
      q('What is the capital of Uganda?', 'Kampala', 'Entebbe', 'Nairobi', 'Kigali'),
      q('Murchison Falls is on which river?', 'The Nile', 'The Niger', 'The Zambezi', 'The Congo'),
      q('Uganda shares Africa’s largest lake. Which is it?', 'Lake Victoria', 'Lake Chad', 'Lake Tanganyika', 'Lake Malawi'),
    ],
  },
];

/** How far (in degrees, with longitude shrunk towards the poles) a tap is from a country's middle. */
export function mapDistance(a: [number, number], b: [number, number]) {
  const k = Math.cos(((a[1] + b[1]) / 2) * (Math.PI / 180));
  return Math.hypot((a[0] - b[0]) * k, a[1] - b[1]);
}
