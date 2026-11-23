/**
 * Solar System Explorer: places the learner lands on, what their scanner finds there, and
 * questions about them. Gas and ice giants have no surface, so you land on one of their moons and
 * see the planet in the sky.
 */
import type { Question } from './questions.js';

export type Destination = {
  id: string;
  name: string;
  /** The planet seen on the map (the moon's planet for giants). */
  planet: string;
  /** The first level it can come up on. */
  level: number;
  mission: string;
  facts: [string, string, string];
  questions: Question[];
  /** The numbers on the probe's readout (NASA fact sheets). Period: d = days, h = hours, y = years. */
  data: { radius: number; gravity?: number; around: string; period?: [number, 'h' | 'd' | 'y']; distance?: [number, 'km' | 'AU'] };
};

const DATA: Record<string, Destination['data']> = {
  moon: { radius: 1_737, gravity: 1.62, around: 'earth', period: [27.3, 'd'], distance: [384_400, 'km'] },
  mars: { radius: 3_390, gravity: 3.71, around: 'sun', period: [687, 'd'], distance: [1.52, 'AU'] },
  venus: { radius: 6_052, gravity: 8.87, around: 'sun', period: [225, 'd'], distance: [0.723, 'AU'] },
  mercury: { radius: 2_440, gravity: 3.7, around: 'sun', period: [88, 'd'], distance: [0.387, 'AU'] },
  europa: { radius: 1_561, gravity: 1.31, around: 'jupiter', period: [3.55, 'd'], distance: [671_000, 'km'] },
  titan: { radius: 2_575, gravity: 1.35, around: 'saturn', period: [15.9, 'd'], distance: [1_222_000, 'km'] },
  miranda: { radius: 236, gravity: 0.079, around: 'uranus', period: [1.41, 'd'], distance: [129_900, 'km'] },
  triton: { radius: 1_353, gravity: 0.78, around: 'neptune', period: [5.88, 'd'], distance: [354_800, 'km'] },
  io: { radius: 1_822, gravity: 1.8, around: 'jupiter', period: [1.77, 'd'], distance: [421_700, 'km'] },
  enceladus: { radius: 252, gravity: 0.113, around: 'saturn', period: [1.37, 'd'], distance: [238_000, 'km'] },
  ceres: { radius: 470, gravity: 0.28, around: 'sun', period: [4.6, 'y'], distance: [2.77, 'AU'] },
  pluto: { radius: 1_188, gravity: 0.62, around: 'sun', period: [248, 'y'], distance: [39.5, 'AU'] },
  phobos: { radius: 11.1, gravity: 0.0057, around: 'mars', period: [7.65, 'h'], distance: [9_380, 'km'] },
  bennu: { radius: 0.245, gravity: 0.00008, around: 'sun', period: [1.2, 'y'], distance: [1.13, 'AU'] },
  sun: { radius: 696_000, gravity: 274, around: 'galaxy' },
  arrokoth: { radius: 18, around: 'sun', period: [298, 'y'], distance: [44.6, 'AU'] },
};

const q = (text: string, answer: string, ...wrong: [string, string, string]): Question => ({ q: text, answer, wrong });

const OLD: Omit<Destination, 'data'>[] = [
  {
    id: 'moon',
    name: 'The Moon',
    planet: 'earth',
    level: 1,
    mission: 'Study the Moon’s surface',
    facts: [
      'Gravity here is about one sixth of Earth’s (1.6 N/kg).',
      'There is no air, so there is no wind, no weather and no sound.',
      'The same side of the Moon always faces Earth.',
    ],
    questions: [
      q('The Moon’s gravity is about what fraction of Earth’s?', 'One sixth', 'One half', 'Twice as strong', 'The same'),
      q(
        'Why do footprints on the Moon last for millions of years?',
        'There is no wind or rain to wear them away',
        'The ground is made of glue',
        'It is always night there',
        'Gravity there is very strong',
      ),
      q('Why does the Moon shine in our night sky?', 'It reflects light from the Sun', 'It makes its own light', 'It is very hot', 'It reflects city lights'),
      q('About how long does the Moon take to go round Earth?', 'About 27 days', 'About 24 hours', 'About 365 days', 'About 7 days'),
      q('In which year did people first walk on the Moon?', '1969', '1957', '1990', '2001'),
    ],
  },
  {
    id: 'mars',
    name: 'Mars',
    planet: 'mars',
    level: 1,
    mission: 'Find the ice',
    facts: [
      'Mars looks red because its soil has iron oxide (rust) in it.',
      'Mars has frozen water at its poles and under the ground.',
      'Olympus Mons on Mars is the tallest volcano in the Solar System.',
    ],
    questions: [
      q('Why is Mars red?', 'Its soil contains iron oxide (rust)', 'It is very hot', 'It is covered in red plants', 'It reflects red light from the Sun only'),
      q('How many moons does Mars have?', 'Two', 'None', 'One', 'Twelve'),
      q('Gravity on Mars is about 0.38 of Earth’s. Compared with Earth, you would weigh…', 'Less', 'More', 'Exactly the same', 'Nothing at all'),
      q('Mars is which planet from the Sun?', 'The 4th', 'The 3rd', 'The 5th', 'The 2nd'),
      q('A day on Mars lasts about…', '24.6 hours', '10 hours', '88 days', '7 hours'),
    ],
  },
  {
    id: 'venus',
    name: 'Venus',
    planet: 'venus',
    level: 1,
    mission: 'Measure the heat',
    facts: [
      'Venus is the hottest planet: about 465 °C, hot enough to melt lead.',
      'Its thick carbon dioxide air traps heat (a runaway greenhouse effect).',
      'Venus spins backwards, so the Sun rises in the west there.',
    ],
    questions: [
      q(
        'Why is Venus hotter than Mercury, even though Mercury is closer to the Sun?',
        'Its thick carbon dioxide atmosphere traps heat',
        'It has many volcanoes only',
        'It is bigger than the Sun',
        'It spins very fast',
      ),
      q('Which gas makes up most of Venus’s atmosphere?', 'Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'),
      q('Venus is often seen near sunrise or sunset. It is sometimes called…', 'The morning star', 'The red planet', 'The ringed planet', 'The ice giant'),
      q('On Venus, the Sun rises in the…', 'West', 'East', 'North', 'South'),
      q('Venus is which planet from the Sun?', 'The 2nd', 'The 1st', 'The 3rd', 'The 4th'),
    ],
  },
  {
    id: 'mercury',
    name: 'Mercury',
    planet: 'mercury',
    level: 2,
    mission: 'Survive the day and night',
    facts: [
      'Mercury is the closest planet to the Sun and the smallest planet.',
      'A year on Mercury is only 88 Earth days.',
      'With almost no air to trap heat, days reach 430 °C and nights fall to −180 °C.',
    ],
    questions: [
      q('How long is a year on Mercury?', '88 Earth days', '365 Earth days', '24 hours', '12 Earth years'),
      q(
        'Why are Mercury’s nights so cold?',
        'It has almost no atmosphere to trap heat',
        'It is far from the Sun',
        'It has oceans of ice',
        'Its moon blocks the light',
      ),
      q('How many moons does Mercury have?', 'None', 'One', 'Two', 'Sixteen'),
      q('Which is the smallest planet in the Solar System?', 'Mercury', 'Mars', 'Venus', 'Earth'),
      q('Mercury’s surface is covered with craters, like…', 'Our Moon', 'Jupiter', 'The Sun', 'Saturn’s rings'),
    ],
  },
  {
    id: 'europa',
    name: 'Europa (moon of Jupiter)',
    planet: 'jupiter',
    level: 3,
    mission: 'Look for the hidden ocean',
    facts: [
      'Europa is covered in ice, with a salty ocean of liquid water underneath.',
      'Jupiter is the largest planet: more than 1 300 Earths could fit inside it.',
      'Jupiter’s Great Red Spot is a storm wider than Earth.',
    ],
    questions: [
      q('What do scientists think is under Europa’s ice?', 'An ocean of liquid water', 'Molten iron', 'Nothing, it is hollow', 'A forest'),
      q('Jupiter is mostly made of…', 'Hydrogen and helium gas', 'Rock and iron', 'Water ice', 'Carbon dioxide'),
      q('What is the Great Red Spot?', 'A giant storm', 'A volcano', 'A red moon', 'A crater'),
      q('Jupiter spins so fast that its day is about…', '10 hours', '24 hours', '100 hours', '365 days'),
      q('Jupiter is which planet from the Sun?', 'The 5th', 'The 4th', 'The 6th', 'The 3rd'),
    ],
  },
  {
    id: 'titan',
    name: 'Titan (moon of Saturn)',
    planet: 'saturn',
    level: 4,
    mission: 'Sample the methane lakes',
    facts: [
      'Titan has a thick nitrogen atmosphere, thicker than Earth’s.',
      'Its lakes and rivers are liquid methane and ethane, not water.',
      'Saturn’s rings are made of countless pieces of ice and rock.',
    ],
    questions: [
      q('What are Saturn’s rings made of?', 'Pieces of ice and rock', 'Solid metal', 'Gas clouds', 'Light only'),
      q('Titan’s lakes are filled with…', 'Liquid methane and ethane', 'Water', 'Lava', 'Liquid oxygen'),
      q('Which gas makes up most of Titan’s atmosphere?', 'Nitrogen', 'Oxygen', 'Carbon dioxide', 'Hydrogen'),
      q('Saturn’s density is so low that it is less dense than…', 'Water', 'Air', 'Hydrogen', 'Feathers'),
      q('Saturn is which planet from the Sun?', 'The 6th', 'The 5th', 'The 7th', 'The 8th'),
    ],
  },
  {
    id: 'miranda',
    name: 'Miranda (moon of Uranus)',
    planet: 'uranus',
    level: 5,
    mission: 'Climb the giant cliffs',
    facts: [
      'Miranda has some of the tallest cliffs in the Solar System, about 20 km high.',
      'Uranus spins on its side: its axis is tilted by about 98°.',
      'Uranus looks blue-green because of methane gas in its atmosphere.',
    ],
    questions: [
      q('What is unusual about how Uranus spins?', 'It spins on its side', 'It does not spin at all', 'It spins once a year', 'It spins faster than light'),
      q('Why does Uranus look blue-green?', 'Methane in its atmosphere', 'Oceans on its surface', 'Green plants', 'Reflected light from Earth'),
      q('Uranus was the first planet discovered using…', 'A telescope', 'A spacecraft', 'The naked eye', 'Radio waves'),
      q('Uranus and Neptune are called…', 'Ice giants', 'Rocky planets', 'Dwarf planets', 'Stars'),
      q('One year on Uranus lasts about…', '84 Earth years', '1 Earth year', '12 Earth years', '365 Earth years'),
    ],
  },
  {
    id: 'triton',
    name: 'Triton (moon of Neptune)',
    planet: 'neptune',
    level: 5,
    mission: 'Watch the ice geysers',
    facts: [
      'Triton has geysers that shoot nitrogen gas and dark dust into the sky.',
      'Triton orbits Neptune backwards, against the way Neptune spins.',
      'Neptune has the fastest winds in the Solar System, over 2 000 km/h.',
    ],
    questions: [
      q('Which is the farthest planet from the Sun?', 'Neptune', 'Uranus', 'Saturn', 'Jupiter'),
      q('What shoots out of Triton’s geysers?', 'Nitrogen gas and dust', 'Lava', 'Liquid water', 'Oxygen'),
      q('What is unusual about Triton’s orbit?', 'It goes round Neptune backwards', 'It is a perfect square', 'It stands still', 'It orbits the Sun instead'),
      q(
        'Neptune was first found by…',
        'Using mathematics to predict where it was',
        'A space probe',
        'Looking with the naked eye',
        'Listening to radio signals',
      ),
      q('One year on Neptune lasts about…', '165 Earth years', '1 Earth year', '30 Earth years', '1 000 Earth years'),
    ],
  },
];

/** Places for the higher levels: their questions come from explorer-ladder.ts. */
const MORE: Omit<Destination, 'data'>[] = [
  {
    id: 'io',
    name: 'Io',
    planet: 'jupiter',
    level: 6,
    mission: 'Measure the volcanoes',
    facts: [
      'Io is the most volcanically active world in the Solar System.',
      'Tides from Jupiter flex Io’s interior, and an orbital resonance with Europa and Ganymede keeps them going.',
      'Sulphur and sulphur dioxide from its volcanoes colour the surface yellow, red and white.',
    ],
    questions: [],
  },
  {
    id: 'enceladus',
    name: 'Enceladus',
    planet: 'saturn',
    level: 6,
    mission: 'Fly through the plumes',
    facts: [
      'Geysers at its south pole spray water ice into space and feed Saturn’s E ring.',
      'Cassini found salts, silica and organic molecules in the plumes, from an ocean under the ice.',
      'Its fresh ice reflects almost all the sunlight that falls on it.',
    ],
    questions: [],
  },
  {
    id: 'ceres',
    name: 'Ceres',
    planet: 'ceres',
    level: 7,
    mission: 'Map the bright spots',
    facts: [
      'Ceres is the largest object in the asteroid belt and the only dwarf planet in the inner Solar System.',
      'The bright spots in Occator crater are salts left behind by briny water.',
      'The Dawn probe orbited Ceres from 2015 to 2018, driven by ion engines.',
    ],
    questions: [],
  },
  {
    id: 'pluto',
    name: 'Pluto',
    planet: 'pluto',
    level: 7,
    mission: 'Fly past Pluto and Charon',
    facts: [
      'Pluto has been called a dwarf planet since 2006 because it has not cleared its orbit of other objects.',
      'Pluto and its moon Charon always show each other the same face.',
      'Sputnik Planitia, a vast plain of nitrogen ice, was seen by New Horizons in 2015.',
    ],
    questions: [],
  },
  {
    id: 'phobos',
    name: 'Phobos',
    planet: 'mars',
    level: 8,
    mission: 'Survey a doomed moon',
    facts: [
      'Phobos goes round Mars about three times a day, faster than Mars turns.',
      'Tides are pulling Phobos slowly inwards: in tens of millions of years it will break up or crash.',
      'Its largest crater, Stickney, is about 9 km across.',
    ],
    questions: [],
  },
  {
    id: 'bennu',
    name: 'Bennu',
    planet: 'bennu',
    level: 8,
    mission: 'Collect a sample',
    facts: [
      'Bennu is a loose pile of rubble held together by its very weak gravity.',
      'OSIRIS-REx took a sample from Bennu in 2020 and brought it to Earth in 2023.',
      'Sunlight it absorbs and gives off again as heat slowly changes its orbit (the Yarkovsky effect).',
    ],
    questions: [],
  },
  {
    id: 'sun',
    name: 'The Sun’s corona',
    planet: 'sun',
    level: 9,
    mission: 'Touch the Sun',
    facts: [
      'The corona, the Sun’s outer atmosphere, is over a million kelvin: far hotter than the surface below it.',
      'Parker Solar Probe was the first spacecraft to fly through the corona.',
      'The solar wind streams out from the corona at 300 to 800 km/s.',
    ],
    questions: [],
  },
  {
    id: 'arrokoth',
    name: 'Arrokoth',
    planet: 'arrokoth',
    level: 10,
    mission: 'Visit the edge of the Solar System',
    facts: [
      'Arrokoth is the most distant object a spacecraft has visited (New Horizons, 2019).',
      'It is a contact binary: two lobes that came together gently.',
      'Its red colour comes from organic molecules made by radiation over billions of years.',
    ],
    questions: [],
  },
];

export const DESTINATIONS: Destination[] = [...OLD, ...MORE].map((d) => ({ ...d, data: DATA[d.id]! }));
