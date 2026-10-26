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
};

const q = (text: string, answer: string, ...wrong: [string, string, string]): Question => ({ q: text, answer, wrong });

export const DESTINATIONS: Destination[] = [
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
