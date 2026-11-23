// Written by scripts/world-content.ts (writer deepseek-v4.1-flash-1017, checker qwen3.8-27b, auditor glm-5.3-flash). Don't edit by hand.
import type { WorldBank } from '../types.js';

export const SPACE_BANK: WorldBank = {
 "1": {
  "questions": [
   {
    "id": "space-L1-q1",
    "q": "Which force keeps the planets moving around the Sun?",
    "options": [
     "Air resistance",
     "Gravity",
     "Magnetism",
     "Friction"
    ],
    "answer": 1,
    "why": "Gravity is the attractive force between the Sun and each planet, and it provides the pull that keeps planets in orbit.",
    "hint": "It is the same force that pulls you down to the ground."
   },
   {
    "id": "space-L1-q2",
    "q": "What is the closest star to Earth?",
    "options": [
     "The Sun",
     "Sirius",
     "Polaris",
     "Alpha Centauri"
    ],
    "answer": 0,
    "why": "The Sun is the star at the centre of our solar system and is by far the closest star to Earth.",
    "hint": "You can see it in the sky every clear day."
   },
   {
    "id": "space-L1-q3",
    "q": "About how long does light from the Sun take to reach Earth?",
    "options": [
     "8 hours",
     "8 seconds",
     "8 days",
     "8 minutes"
    ],
    "answer": 3,
    "why": "Sunlight travels about 150 million kilometres to Earth and takes roughly 8 minutes to arrive.",
    "hint": "It is longer than a few seconds but much less than an hour."
   },
   {
    "id": "space-L1-q4",
    "q": "Which planet is known as the Red Planet?",
    "options": [
     "Mercury",
     "Mars",
     "Jupiter",
     "Venus"
    ],
    "answer": 1,
    "why": "Mars appears reddish because its surface contains iron-rich dust and rock.",
    "hint": "It is the fourth planet from the Sun."
   },
   {
    "id": "space-L1-q5",
    "q": "What causes day and night on Earth?",
    "options": [
     "Earth spinning on its axis",
     "Earth orbiting the Sun",
     "The Sun moving around Earth",
     "The Moon moving around Earth"
    ],
    "answer": 0,
    "why": "As Earth rotates on its axis, each part of the surface turns towards or away from the Sun, giving day and night.",
    "hint": "It happens once every 24 hours."
   },
   {
    "id": "space-L1-q6",
    "q": "Which of these is a natural satellite of Earth?",
    "options": [
     "Venus",
     "The Moon",
     "Mars",
     "The Sun"
    ],
    "answer": 1,
    "why": "The Moon is a natural body that orbits Earth, so it is Earth's natural satellite.",
    "hint": "You can often see it at night."
   },
   {
    "id": "space-L1-q7",
    "q": "What is the name of our galaxy?",
    "options": [
     "Orion",
     "The Solar System",
     "The Milky Way",
     "Andromeda"
    ],
    "answer": 2,
    "why": "The Sun and its planets are part of the Milky Way galaxy.",
    "hint": "It appears as a faint band of light across a dark sky."
   },
   {
    "id": "space-L1-q8",
    "q": "Which list puts these in order from smallest to largest?",
    "options": [
     "Earth, galaxy, Sun",
     "Galaxy, Earth, Sun",
     "Earth, Sun, galaxy",
     "Sun, Earth, galaxy"
    ],
    "answer": 2,
    "why": "Earth is a planet, the Sun is a star larger than Earth, and a galaxy contains many stars, so the order is Earth, Sun, galaxy.",
    "hint": "Think about how many stars a galaxy holds."
   },
   {
    "id": "space-L1-q9",
    "q": "What is the main source of energy for Earth's climate and weather?",
    "options": [
     "The Moon",
     "Geothermal heat",
     "The Sun",
     "The stars"
    ],
    "answer": 2,
    "why": "The Sun supplies almost all the energy that drives weather and heats Earth's surface.",
    "hint": "It is the star at the centre of the solar system."
   },
   {
    "id": "space-L1-q10",
    "q": "Which of these travels fastest?",
    "options": [
     "Light",
     "A jet plane",
     "Sound",
     "A racing car"
    ],
    "answer": 0,
    "why": "Light travels at about 300,000 kilometres per second, far faster than sound or any vehicle.",
    "hint": "It is why you see lightning before you hear thunder."
   },
   {
    "id": "space-L1-q11",
    "q": "What force pulls a dropped ball towards the ground?",
    "options": [
     "Tension",
     "Magnetism",
     "Friction",
     "Gravity"
    ],
    "answer": 3,
    "why": "Gravity is the force of attraction between the ball and Earth, pulling the ball downwards.",
    "hint": "It acts between any two masses."
   },
   {
    "id": "space-L1-q12",
    "q": "Which planet is the largest in the solar system?",
    "options": [
     "Earth",
     "Jupiter",
     "Neptune",
     "Saturn"
    ],
    "answer": 1,
    "why": "Jupiter is the largest planet, with a diameter more than ten times that of Earth.",
    "hint": "It has a famous Great Red Spot."
   },
   {
    "id": "space-L1-q13",
    "q": "What is the shape of Earth's orbit around the Sun?",
    "options": [
     "A square",
     "A straight line",
     "An ellipse",
     "A perfect circle"
    ],
    "answer": 2,
    "why": "Earth's orbit is an ellipse, a slightly flattened circle, with the Sun at one focus.",
    "hint": "It is a stretched circle."
   }
  ],
  "truths": [
   {
    "id": "space-L1-t1",
    "s": "The Sun is a star.",
    "answer": true,
    "why": "The Sun is a star: a huge ball of hot gas that gives out light and heat."
   },
   {
    "id": "space-L1-t2",
    "s": "The Moon produces its own light.",
    "answer": false,
    "why": "The Moon does not make light; it shines by reflecting sunlight."
   },
   {
    "id": "space-L1-t3",
    "s": "Jupiter is the largest planet in the solar system.",
    "answer": true,
    "why": "Jupiter is larger than any other planet in the solar system."
   },
   {
    "id": "space-L1-t4",
    "s": "Light travels more slowly than sound.",
    "answer": false,
    "why": "Light travels far faster than sound, about 300,000 km per second in a vacuum."
   },
   {
    "id": "space-L1-t5",
    "s": "Earth rotates on its axis once about every 24 hours.",
    "answer": true,
    "why": "One rotation of Earth takes about 24 hours and gives us day and night."
   },
   {
    "id": "space-L1-t6",
    "s": "The Sun orbits around Earth once each year.",
    "answer": false,
    "why": "Earth orbits the Sun, not the other way round."
   },
   {
    "id": "space-L1-t7",
    "s": "The Moon is a natural satellite of Earth.",
    "answer": true,
    "why": "The Moon orbits Earth, so it is Earth's natural satellite."
   },
   {
    "id": "space-L1-t8",
    "s": "A year is the time Earth takes to rotate once on its axis.",
    "answer": false,
    "why": "A year is the time Earth takes to orbit the Sun; one rotation takes about a day."
   },
   {
    "id": "space-L1-t9",
    "s": "The solar system contains eight planets.",
    "answer": true,
    "why": "The planets are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune."
   },
   {
    "id": "space-L1-t10",
    "s": "Venus is the closest planet to the Sun.",
    "answer": false,
    "why": "Mercury is the closest planet to the Sun; Venus is second."
   },
   {
    "id": "space-L1-t11",
    "s": "Stars give out their own light.",
    "answer": true,
    "why": "Stars shine because they produce light and heat in their cores."
   },
   {
    "id": "space-L1-t12",
    "s": "The Milky Way is the name of our solar system.",
    "answer": false,
    "why": "The Milky Way is our galaxy; the solar system is the Sun and the bodies orbiting it."
   },
   {
    "id": "space-L1-t13",
    "s": "Gravity is a force of attraction between objects with mass.",
    "answer": true,
    "why": "Any two objects with mass attract each other through gravity."
   },
   {
    "id": "space-L1-t14",
    "s": "Sound can travel through empty space.",
    "answer": false,
    "why": "Sound needs a medium such as air, water or a solid; it cannot travel through a vacuum."
   },
   {
    "id": "space-L1-t15",
    "s": "The Sun's light takes about 8 minutes to reach Earth.",
    "answer": true,
    "why": "Sunlight takes roughly 8 minutes to cross the 150 million kilometres to Earth."
   },
   {
    "id": "space-L1-t16",
    "s": "Mars is closer to the Sun than Earth is.",
    "answer": false,
    "why": "Earth is the third planet from the Sun and Mars is the fourth, so Mars is farther out."
   },
   {
    "id": "space-L1-t17",
    "s": "A galaxy is a huge group of stars, gas and dust.",
    "answer": true,
    "why": "Galaxies contain many stars together with gas and dust, held by gravity."
   },
   {
    "id": "space-L1-t18",
    "s": "The Sun is the largest object in the Milky Way galaxy.",
    "answer": false,
    "why": "The Sun is an ordinary star; the Milky Way contains many stars and is vastly larger than the Sun."
   }
  ],
  "terms": [
   {
    "id": "space-L1-w1",
    "word": "GRAVITY",
    "clue": "Force that pulls objects towards each other"
   },
   {
    "id": "space-L1-w2",
    "word": "PLANET",
    "clue": "Large body orbiting a star, such as Earth"
   },
   {
    "id": "space-L1-w3",
    "word": "ORBIT",
    "clue": "Curved path of one body around another"
   },
   {
    "id": "space-L1-w4",
    "word": "STAR",
    "clue": "Huge glowing ball of gas, like the Sun"
   },
   {
    "id": "space-L1-w5",
    "word": "GALAXY",
    "clue": "Vast system of stars, gas and dust"
   },
   {
    "id": "space-L1-w6",
    "word": "LIGHT",
    "clue": "Form of energy that lets us see"
   },
   {
    "id": "space-L1-w7",
    "word": "MOON",
    "clue": "Natural body orbiting a planet"
   },
   {
    "id": "space-L1-w8",
    "word": "SOLAR",
    "clue": "Word meaning to do with the Sun"
   },
   {
    "id": "space-L1-w9",
    "word": "ENERGY",
    "clue": "What is needed to do work or cause change"
   }
  ]
 },
 "2": {
  "questions": [
   {
    "id": "space-L2-q1",
    "q": "Which planet in the solar system is closest to the Sun?",
    "options": [
     "Mars",
     "Earth",
     "Venus",
     "Mercury"
    ],
    "answer": 3,
    "why": "Mercury orbits the Sun at about 58 million km, closer than any other planet.",
    "hint": "It is the smallest planet as well as the nearest to the Sun."
   },
   {
    "id": "space-L2-q2",
    "q": "What is the name of the force that keeps the Moon in orbit around Earth?",
    "options": [
     "Air resistance",
     "Gravity",
     "Friction",
     "Magnetism"
    ],
    "answer": 1,
    "why": "Gravity is the attractive force between Earth and the Moon that keeps the Moon in orbit.",
    "hint": "The same force makes objects fall to the ground."
   },
   {
    "id": "space-L2-q3",
    "q": "Roughly how many days does Earth take to complete one orbit of the Sun?",
    "options": [
     "7 days",
     "30 days",
     "24 hours",
     "365 days"
    ],
    "answer": 3,
    "why": "Earth takes about 365 days, one year, to go once around the Sun.",
    "hint": "It is the length of one year."
   },
   {
    "id": "space-L2-q4",
    "q": "Which of these is a moon of Jupiter?",
    "options": [
     "Titan",
     "Triton",
     "Ganymede",
     "Phobos"
    ],
    "answer": 2,
    "why": "Ganymede is Jupiter's largest moon and the largest moon in the solar system.",
    "hint": "Titan belongs to Saturn and Triton to Neptune."
   },
   {
    "id": "space-L2-q5",
    "q": "What type of object is the Sun?",
    "options": [
     "A planet",
     "A moon",
     "A comet",
     "A star"
    ],
    "answer": 3,
    "why": "The Sun is a star, a huge ball of hot gas that gives out its own light.",
    "hint": "It produces its own light rather than reflecting it."
   },
   {
    "id": "space-L2-q6",
    "q": "Which colour of visible light has the longest wavelength?",
    "options": [
     "Violet",
     "Red",
     "Green",
     "Blue"
    ],
    "answer": 1,
    "why": "Red light has the longest wavelength of the visible colours, around 700 nanometres.",
    "hint": "It is the colour at the warm end of a rainbow."
   },
   {
    "id": "space-L2-q7",
    "q": "What keeps the International Space Station in orbit around Earth?",
    "options": [
     "Its engines fire constantly",
     "Earth's gravity and its high speed",
     "Magnetic attraction",
     "Solar wind"
    ],
    "answer": 1,
    "why": "The station moves fast enough sideways that gravity curves its path into an orbit rather than letting it fall.",
    "hint": "It is in free fall but also moving sideways very fast."
   },
   {
    "id": "space-L2-q8",
    "q": "Which of these is the correct order of the planets from the Sun outwards?",
    "options": [
     "Earth, Mars, Jupiter, Saturn",
     "Mercury, Venus, Earth, Mars",
     "Mars, Earth, Saturn, Jupiter",
     "Venus, Mercury, Earth, Mars"
    ],
    "answer": 1,
    "why": "The order from the Sun is Mercury, Venus, Earth, Mars, then the outer planets.",
    "hint": "Mercury is nearest and Venus comes next."
   },
   {
    "id": "space-L2-q9",
    "q": "What happens to the force of gravity between two objects if the distance between them increases?",
    "options": [
     "It gets weaker",
     "It stays the same",
     "It disappears",
     "It gets stronger"
    ],
    "answer": 0,
    "why": "Gravity weakens as the distance between the objects increases.",
    "hint": "Think about how weight changes as you move far from Earth."
   },
   {
    "id": "space-L2-q10",
    "q": "Which of these is NOT a source of light?",
    "options": [
     "A burning candle",
     "The Sun",
     "A torch",
     "The Moon"
    ],
    "answer": 3,
    "why": "The Moon only reflects sunlight; it does not produce light of its own.",
    "hint": "Think about what lights up the Moon at night."
   },
   {
    "id": "space-L2-q11",
    "q": "Approximately how long does the Moon take to orbit Earth once?",
    "options": [
     "About 27 days",
     "About 7 days",
     "About 1 day",
     "About 365 days"
    ],
    "answer": 0,
    "why": "The Moon completes one orbit of Earth in roughly 27 days, close to a month.",
    "hint": "It is close to the length of a lunar month."
   },
   {
    "id": "space-L2-q12",
    "q": "What is the main cause of the seasons on Earth?",
    "options": [
     "The Moon's gravity",
     "The tilt of Earth's axis",
     "Changes in the Sun's brightness",
     "Earth's changing distance from the Sun"
    ],
    "answer": 1,
    "why": "Earth's axis is tilted, so different parts of Earth receive sunlight more directly at different times of year.",
    "hint": "The North and South Poles do not point straight up relative to the orbit."
   },
   {
    "id": "space-L2-q13",
    "q": "Which of these is a galaxy?",
    "options": [
     "Halley's Comet",
     "The Sun",
     "The Milky Way",
     "The Moon"
    ],
    "answer": 2,
    "why": "The Milky Way is the galaxy that contains our solar system.",
    "hint": "It is a huge collection of stars, not a single object."
   }
  ],
  "truths": [
   {
    "id": "space-L2-t1",
    "s": "Sound can travel through the vacuum of space.",
    "answer": false,
    "why": "Sound needs a medium such as air or water; in a vacuum there are no particles to carry it."
   },
   {
    "id": "space-L2-t2",
    "s": "The Sun is a star.",
    "answer": true,
    "why": "The Sun is a star, a hot ball of gas that produces its own light."
   },
   {
    "id": "space-L2-t3",
    "s": "The planets orbit the Sun in nearly circular paths.",
    "answer": true,
    "why": "Planetary orbits are slightly elliptical but close to circular."
   },
   {
    "id": "space-L2-t4",
    "s": "Jupiter is the smallest planet in the solar system.",
    "answer": false,
    "why": "Jupiter is the largest planet; Mercury is the smallest."
   },
   {
    "id": "space-L2-t5",
    "s": "Light from the Sun takes about 8 minutes to reach Earth.",
    "answer": true,
    "why": "Sunlight crosses about 150 million km in roughly 8 minutes."
   },
   {
    "id": "space-L2-t6",
    "s": "The Moon produces its own light.",
    "answer": false,
    "why": "The Moon shines only by reflecting light from the Sun."
   },
   {
    "id": "space-L2-t7",
    "s": "Earth rotates on its axis once roughly every 24 hours.",
    "answer": true,
    "why": "One rotation of Earth takes about 24 hours, giving day and night."
   },
   {
    "id": "space-L2-t8",
    "s": "A year on Earth is shorter than a day on Earth.",
    "answer": false,
    "why": "A year (about 365 days) is much longer than a day (about 24 hours)."
   },
   {
    "id": "space-L2-t9",
    "s": "Gravity is a force that pulls objects towards each other.",
    "answer": true,
    "why": "Gravity is an attractive force between any two objects with mass."
   },
   {
    "id": "space-L2-t10",
    "s": "The Sun orbits around Earth once each day.",
    "answer": false,
    "why": "Earth orbits the Sun; the Sun does not orbit Earth."
   },
   {
    "id": "space-L2-t11",
    "s": "Saturn is famous for its system of rings.",
    "answer": true,
    "why": "Saturn has a large, bright system of rings made of ice and rock."
   },
   {
    "id": "space-L2-t12",
    "s": "Stars are much closer to Earth than the Sun is.",
    "answer": false,
    "why": "The Sun is the nearest star; other stars are vastly farther away."
   },
   {
    "id": "space-L2-t13",
    "s": "An astronaut in orbit appears to float because there is no gravity in space.",
    "answer": false,
    "why": "Gravity is still present; astronauts float because they are in free fall around Earth."
   },
   {
    "id": "space-L2-t14",
    "s": "White light can be split into a spectrum of colours by a prism.",
    "answer": true,
    "why": "A prism separates white light into its component colours."
   },
   {
    "id": "space-L2-t15",
    "s": "Venus is the planet closest to the Sun.",
    "answer": false,
    "why": "Mercury is closest to the Sun; Venus is second."
   },
   {
    "id": "space-L2-t16",
    "s": "The solar system contains eight planets.",
    "answer": true,
    "why": "There are eight planets orbiting the Sun."
   },
   {
    "id": "space-L2-t17",
    "s": "The Moon is a planet.",
    "answer": false,
    "why": "The Moon is a natural satellite that orbits Earth, not a planet."
   },
   {
    "id": "space-L2-t18",
    "s": "Energy can be transferred from one form to another.",
    "answer": true,
    "why": "Energy changes form, for example from light to chemical energy in plants."
   }
  ],
  "terms": [
   {
    "id": "space-L2-w1",
    "word": "GRAVITY",
    "clue": "Attractive force between objects with mass that keeps planets in orbit"
   },
   {
    "id": "space-L2-w2",
    "word": "ORBIT",
    "clue": "The curved path of an object moving around a larger body"
   },
   {
    "id": "space-L2-w3",
    "word": "PLANET",
    "clue": "Large round body that orbits a star and has cleared its path"
   },
   {
    "id": "space-L2-w4",
    "word": "COMET",
    "clue": "Icy body that develops a tail when near the Sun"
   },
   {
    "id": "space-L2-w5",
    "word": "SOLAR",
    "clue": "Word describing anything relating to the Sun"
   },
   {
    "id": "space-L2-w6",
    "word": "ECLIPSE",
    "clue": "Event when one body blocks the light of another"
   },
   {
    "id": "space-L2-w7",
    "word": "PRISM",
    "clue": "Glass shape that splits white light into colours"
   },
   {
    "id": "space-L2-w8",
    "word": "ENERGY",
    "clue": "The capacity to do work, measured in joules"
   },
   {
    "id": "space-L2-w9",
    "word": "SATURN",
    "clue": "Ringed gas giant sixth from the Sun"
   }
  ]
 },
 "3": {
  "questions": [
   {
    "id": "space-L3-q1",
    "q": "Which planet is famous for its large system of rings?",
    "options": [
     "Mercury",
     "Mars",
     "Saturn",
     "Venus"
    ],
    "answer": 2,
    "why": "Saturn has the largest and most visible ring system of any planet in the solar system.",
    "hint": "Think of the planet often drawn with a ring around it."
   },
   {
    "id": "space-L3-q2",
    "q": "What is a light-year a unit of?",
    "options": [
     "Time",
     "Distance",
     "Brightness",
     "Mass"
    ],
    "answer": 1,
    "why": "A light-year is the distance light travels in one year, not a measure of time.",
    "hint": "The name contains 'year', but it measures how far light goes."
   },
   {
    "id": "space-L3-q3",
    "q": "Which type of electromagnetic radiation has the highest energy?",
    "options": [
     "Microwaves",
     "Gamma rays",
     "Infrared",
     "Radio waves"
    ],
    "answer": 1,
    "why": "Gamma rays have the shortest wavelengths and therefore the highest energy in the electromagnetic spectrum.",
    "hint": "It is at the far end beyond X-rays."
   },
   {
    "id": "space-L3-q4",
    "q": "What is the name for the path of an object around another object in space?",
    "options": [
     "Solstice",
     "Eclipse",
     "Axis",
     "Orbit"
    ],
    "answer": 3,
    "why": "An orbit is the curved path followed by a body moving around another under gravity.",
    "hint": "The Moon follows one around Earth."
   },
   {
    "id": "space-L3-q5",
    "q": "Which of these is a star?",
    "options": [
     "Halley's Comet",
     "Sirius",
     "Jupiter",
     "The Moon"
    ],
    "answer": 1,
    "why": "Sirius is the brightest star in the night sky; the others are a planet, a moon and a comet.",
    "hint": "It appears in the constellation Canis Major."
   },
   {
    "id": "space-L3-q6",
    "q": "What happens to an object's weight if it is taken from Earth to the Moon?",
    "options": [
     "It increases",
     "It stays the same",
     "It becomes zero",
     "It decreases"
    ],
    "answer": 3,
    "why": "The Moon's gravity is weaker, so the object weighs less, though its mass is unchanged.",
    "hint": "The Moon's surface gravity is about one-sixth of Earth's."
   },
   {
    "id": "space-L3-q7",
    "q": "Which of these best describes a galaxy?",
    "options": [
     "A single star and its planets",
     "A cloud of gas near Earth",
     "A group of moons",
     "A huge collection of stars"
    ],
    "answer": 3,
    "why": "A galaxy is a vast system of stars, gas and dust held together by gravity.",
    "hint": "The Milky Way is one example."
   },
   {
    "id": "space-L3-q8",
    "q": "What is the main reason a rocket can move in space where there is no air?",
    "options": [
     "It pushes against air",
     "It expels gas backwards",
     "It uses wings",
     "It is pulled by gravity"
    ],
    "answer": 1,
    "why": "By Newton's third law, expelling gas backwards pushes the rocket forwards.",
    "hint": "Think of action and reaction."
   },
   {
    "id": "space-L3-q9",
    "q": "Which planet has the shortest year?",
    "options": [
     "Jupiter",
     "Neptune",
     "Earth",
     "Mercury"
    ],
    "answer": 3,
    "why": "Mercury orbits closest to the Sun and completes an orbit in about 88 Earth days.",
    "hint": "It is the planet nearest the Sun."
   },
   {
    "id": "space-L3-q10",
    "q": "What is the name of the boundary around a black hole beyond which nothing can escape?",
    "options": [
     "Corona",
     "Kuiper belt",
     "Asteroid belt",
     "Event horizon"
    ],
    "answer": 3,
    "why": "The event horizon is the region around a black hole from which no light or matter can escape.",
    "hint": "It marks the 'point of no return'."
   },
   {
    "id": "space-L3-q11",
    "q": "Which of these is the correct order of these objects from smallest to largest?",
    "options": [
     "Earth, Moon, Sun, Milky Way",
     "Moon, Sun, Earth, Milky Way",
     "Moon, Earth, Sun, Milky Way",
     "Sun, Moon, Earth, Milky Way"
    ],
    "answer": 2,
    "why": "The Moon is smaller than Earth, Earth is smaller than the Sun, and the Sun is one star within the Milky Way.",
    "hint": "Start with the body that orbits Earth."
   }
  ],
  "truths": [
   {
    "id": "space-L3-t1",
    "s": "The Sun is a star.",
    "answer": true,
    "why": "The Sun is a medium-sized star at the centre of the solar system."
   },
   {
    "id": "space-L3-t2",
    "s": "The Moon produces its own light.",
    "answer": false,
    "why": "The Moon shines by reflecting sunlight, not by producing light itself."
   },
   {
    "id": "space-L3-t3",
    "s": "Jupiter is the largest planet in the solar system.",
    "answer": true,
    "why": "Jupiter is more massive and larger than any other planet."
   },
   {
    "id": "space-L3-t4",
    "s": "Sound travels through the vacuum of space.",
    "answer": false,
    "why": "Sound needs a medium such as air, so it cannot travel through a vacuum."
   },
   {
    "id": "space-L3-t5",
    "s": "The Earth orbits the Sun once in about 365 days.",
    "answer": true,
    "why": "One Earth year is approximately 365 days."
   },
   {
    "id": "space-L3-t6",
    "s": "Venus is the closest planet to the Sun.",
    "answer": false,
    "why": "Mercury, not Venus, is the closest planet to the Sun."
   },
   {
    "id": "space-L3-t7",
    "s": "Light travels faster than sound.",
    "answer": true,
    "why": "Light travels at about 300,000 km/s in a vacuum, far faster than sound."
   },
   {
    "id": "space-L3-t8",
    "s": "A year on Mars is shorter than a year on Earth.",
    "answer": false,
    "why": "Mars is farther from the Sun, so its year is longer, about 687 Earth days."
   },
   {
    "id": "space-L3-t9",
    "s": "Gravity is a force of attraction between objects with mass.",
    "answer": true,
    "why": "Any two objects with mass attract each other by gravity."
   },
   {
    "id": "space-L3-t10",
    "s": "The asteroid belt lies between Earth and Mars.",
    "answer": false,
    "why": "The main asteroid belt lies between Mars and Jupiter."
   },
   {
    "id": "space-L3-t11",
    "s": "Stars appear to move across the night sky because Earth rotates.",
    "answer": true,
    "why": "Earth's rotation makes the stars seem to move from east to west."
   },
   {
    "id": "space-L3-t12",
    "s": "The Sun revolves around the Earth.",
    "answer": false,
    "why": "Earth and the other planets orbit the Sun, not the other way round."
   },
   {
    "id": "space-L3-t13",
    "s": "The seasons are caused by Earth's axis being tilted.",
    "answer": true,
    "why": "The tilt of Earth's axis changes how sunlight falls on each hemisphere through the year."
   },
   {
    "id": "space-L3-t14",
    "s": "A comet is made mainly of rock and metal like an asteroid.",
    "answer": false,
    "why": "Comets are mainly ice, dust and gas, unlike rocky asteroids."
   },
   {
    "id": "space-L3-t15",
    "s": "The Milky Way is the galaxy that contains the Sun.",
    "answer": true,
    "why": "The Sun is one of many stars in the Milky Way galaxy."
   },
   {
    "id": "space-L3-t16",
    "s": "Weight is measured in kilograms.",
    "answer": false,
    "why": "Weight is a force measured in newtons; kilograms measure mass."
   },
   {
    "id": "space-L3-t17",
    "s": "Radio waves are a form of electromagnetic radiation.",
    "answer": true,
    "why": "Radio waves are part of the electromagnetic spectrum, with long wavelengths."
   },
   {
    "id": "space-L3-t18",
    "s": "The Earth is the centre of the solar system.",
    "answer": false,
    "why": "The Sun is at the centre of the solar system, with Earth orbiting it."
   }
  ],
  "terms": [
   {
    "id": "space-L3-w1",
    "word": "GRAVITY",
    "clue": "Force that pulls objects towards each other and keeps planets in orbit"
   },
   {
    "id": "space-L3-w2",
    "word": "ECLIPSE",
    "clue": "When one body in space blocks the light of another"
   },
   {
    "id": "space-L3-w3",
    "word": "COMET",
    "clue": "Icy body that grows a tail when near the Sun"
   },
   {
    "id": "space-L3-w4",
    "word": "ORBIT",
    "clue": "Curved path of a body around a larger body"
   },
   {
    "id": "space-L3-w5",
    "word": "PLANET",
    "clue": "Large round body that orbits a star and clears its path"
   },
   {
    "id": "space-L3-w6",
    "word": "GALAXY",
    "clue": "Vast system of stars, gas and dust held by gravity"
   },
   {
    "id": "space-L3-w7",
    "word": "TELESCOPE",
    "clue": "Instrument used to view distant objects in space"
   },
   {
    "id": "space-L3-w8",
    "word": "SATELLITE",
    "clue": "Object that orbits a planet, natural or artificial"
   },
   {
    "id": "space-L3-w9",
    "word": "METEOR",
    "clue": "Streak of light seen when space rock burns in the atmosphere"
   }
  ]
 },
 "4": {
  "questions": [
   {
    "id": "space-L4-q1",
    "q": "A spacecraft is in a circular orbit around Earth. If its speed is increased slightly, what happens to its orbit?",
    "options": [
     "It becomes a larger orbit",
     "It spirals inwards to Earth",
     "Its period becomes shorter",
     "It stops moving entirely"
    ],
    "answer": 0,
    "why": "A faster speed means a larger radius for a circular orbit, so the spacecraft moves into a higher orbit.",
    "hint": "Think about how orbital radius depends on speed."
   },
   {
    "id": "space-L4-q2",
    "q": "Which statement about the force of gravity is correct?",
    "options": [
     "It can be attractive or repulsive",
     "It is always attractive",
     "It needs air to act through",
     "It only acts on large masses"
    ],
    "answer": 1,
    "why": "Gravity is a purely attractive force between any two masses.",
    "hint": "Compare it with electric force, which can attract or repel."
   },
   {
    "id": "space-L4-q3",
    "q": "An object is moving at constant velocity. What must be true?",
    "options": [
     "Friction must be absent",
     "Its acceleration is increasing",
     "The resultant force on it is zero",
     "A large force acts forwards"
    ],
    "answer": 2,
    "why": "Constant velocity means zero acceleration, so by Newton's first law the resultant force is zero.",
    "hint": "Link constant velocity to acceleration."
   },
   {
    "id": "space-L4-q4",
    "q": "Which colour of visible light has the shortest wavelength?",
    "options": [
     "Yellow",
     "Green",
     "Red",
     "Violet"
    ],
    "answer": 3,
    "why": "Violet light has the shortest wavelength and highest frequency in the visible spectrum.",
    "hint": "Think of the order of colours in a rainbow."
   },
   {
    "id": "space-L4-q5",
    "q": "Two planets orbit the same star. Planet A is twice as far from the star as planet B. How does A's orbital period compare with B's?",
    "options": [
     "It is longer",
     "It cannot be compared",
     "It is shorter",
     "It is the same"
    ],
    "answer": 0,
    "why": "By Kepler's third law, a greater orbital radius gives a longer orbital period.",
    "hint": "Recall Kepler's third law relating period and radius."
   },
   {
    "id": "space-L4-q6",
    "q": "What is the main reason the Moon has no atmosphere?",
    "options": [
     "It spins too quickly",
     "It is too cold for gases",
     "Its gravity is too weak to retain gases",
     "It is made only of rock"
    ],
    "answer": 2,
    "why": "The Moon's low mass gives weak gravity, so gas molecules escape into space.",
    "hint": "Compare escape velocity with molecular speeds."
   },
   {
    "id": "space-L4-q7",
    "q": "Which of these is a correct example of energy transfer by radiation?",
    "options": [
     "Sound passing through a wall",
     "A rope pulling a sledge",
     "A kettle heating water by conduction",
     "Heat from a fire reaching you across a room"
    ],
    "answer": 3,
    "why": "Radiation transfers energy by electromagnetic waves and needs no medium, as with heat from a fire.",
    "hint": "Which method needs no particles in between?"
   },
   {
    "id": "space-L4-q8",
    "q": "A satellite in a low orbit around Earth is described as being in free fall. Why does it not hit the ground?",
    "options": [
     "It is beyond Earth's gravity",
     "There is no gravity in space",
     "It moves sideways fast enough to keep missing Earth",
     "Its engines push it upwards"
    ],
    "answer": 2,
    "why": "The satellite accelerates towards Earth but its forward speed makes it curve around Earth.",
    "hint": "Think about the direction of its velocity as well as gravity."
   },
   {
    "id": "space-L4-q9",
    "q": "Which of these best explains why a star appears to twinkle?",
    "options": [
     "Turbulence in Earth's atmosphere bends its light",
     "The star changes brightness rapidly",
     "Its light is blocked by planets",
     "It moves quickly across the sky"
    ],
    "answer": 0,
    "why": "Moving air in the atmosphere refracts starlight unevenly, causing twinkling.",
    "hint": "Think about what lies between the star and your eye."
   },
   {
    "id": "space-L4-q10",
    "q": "What happens to the wavelength of light from a galaxy moving away from us?",
    "options": [
     "It decreases",
     "It becomes zero",
     "It stays the same",
     "It increases"
    ],
    "answer": 3,
    "why": "Recession causes redshift, so the observed wavelength is longer than the emitted one.",
    "hint": "Recall the meaning of redshift."
   },
   {
    "id": "space-L4-q11",
    "q": "Which of these is the correct order of the main stages in the life of a Sun-like star?",
    "options": [
     "Red giant, nebula, main sequence, white dwarf",
     "White dwarf, red giant, nebula, main sequence",
     "Main sequence, nebula, white dwarf, red giant",
     "Nebula, main sequence, red giant, white dwarf"
    ],
    "answer": 3,
    "why": "A Sun-like star forms from a nebula, spends most of its life on the main sequence, then becomes a red giant and finally a white dwarf.",
    "hint": "Start with the cloud of gas and dust."
   },
   {
    "id": "space-L4-q12",
    "q": "Which statement about the electromagnetic spectrum is correct?",
    "options": [
     "Gamma rays have a higher frequency than radio waves",
     "Radio waves travel faster than light",
     "X-rays have a longer wavelength than microwaves",
     "Visible light is the only part that carries energy"
    ],
    "answer": 0,
    "why": "All electromagnetic waves travel at the same speed in a vacuum, and gamma rays have the highest frequency.",
    "hint": "All parts travel at the same speed in a vacuum."
   }
  ],
  "truths": [
   {
    "id": "space-L4-t1",
    "s": "The Sun is a star.",
    "answer": true,
    "why": "The Sun is a main-sequence star at the centre of the solar system."
   },
   {
    "id": "space-L4-t2",
    "s": "Sound can travel through the vacuum of space.",
    "answer": false,
    "why": "Sound needs a medium, so it cannot travel through a vacuum."
   },
   {
    "id": "space-L4-t3",
    "s": "Earth's gravity is stronger than the Moon's gravity.",
    "answer": true,
    "why": "Earth is more massive, so its surface gravity is about six times stronger than the Moon's."
   },
   {
    "id": "space-L4-t4",
    "s": "A light-year is a unit of time.",
    "answer": false,
    "why": "A light-year is a unit of distance, the distance light travels in one year."
   },
   {
    "id": "space-L4-t5",
    "s": "The seasons are caused by Earth's axis being tilted.",
    "answer": true,
    "why": "The tilt changes the angle and duration of sunlight through the year."
   },
   {
    "id": "space-L4-t6",
    "s": "The Moon produces its own visible light.",
    "answer": false,
    "why": "The Moon shines by reflecting sunlight, not by producing light itself."
   },
   {
    "id": "space-L4-t7",
    "s": "Weight is a force, while mass is a measure of the amount of matter.",
    "answer": true,
    "why": "Weight depends on gravity, but mass does not."
   },
   {
    "id": "space-L4-t8",
    "s": "In a vacuum, a heavy object falls faster than a light object.",
    "answer": false,
    "why": "In a vacuum all objects fall with the same acceleration due to gravity."
   },
   {
    "id": "space-L4-t9",
    "s": "Redshift of distant galaxies supports the idea that the universe is expanding.",
    "answer": true,
    "why": "Light from receding galaxies is shifted towards longer wavelengths."
   },
   {
    "id": "space-L4-t10",
    "s": "The planets orbit the Sun in perfect circles.",
    "answer": false,
    "why": "Planetary orbits are ellipses, not perfect circles."
   },
   {
    "id": "space-L4-t11",
    "s": "A black hole's event horizon is the boundary beyond which nothing can escape.",
    "answer": true,
    "why": "Inside the event horizon, escape velocity exceeds the speed of light."
   },
   {
    "id": "space-L4-t12",
    "s": "Newton's third law says that action and reaction forces act on the same object.",
    "answer": false,
    "why": "Action and reaction forces act on different objects."
   },
   {
    "id": "space-L4-t13",
    "s": "Ultraviolet radiation has a shorter wavelength than visible light.",
    "answer": true,
    "why": "Ultraviolet lies beyond violet, at shorter wavelengths."
   },
   {
    "id": "space-L4-t14",
    "s": "The International Space Station stays in orbit because there is no gravity at its altitude.",
    "answer": false,
    "why": "Gravity is still strong there; the station is in continuous free fall around Earth."
   },
   {
    "id": "space-L4-t15",
    "s": "Energy can be transferred but cannot be created or destroyed.",
    "answer": true,
    "why": "This is the law of conservation of energy."
   },
   {
    "id": "space-L4-t16",
    "s": "Jupiter is less massive than Earth.",
    "answer": false,
    "why": "Jupiter is far more massive than Earth, over 300 times as massive."
   },
   {
    "id": "space-L4-t17",
    "s": "A galaxy is a large system of stars, gas and dust held together by gravity.",
    "answer": true,
    "why": "This describes galaxies such as the Milky Way."
   },
   {
    "id": "space-L4-t18",
    "s": "The speed of light in a vacuum is about 300,000 km per second.",
    "answer": true,
    "why": "Light travels at roughly 3 × 10⁸ m/s, or 300,000 km/s."
   }
  ],
  "terms": [
   {
    "id": "space-L4-w1",
    "word": "WAVELENGTH",
    "clue": "Distance between successive crests of a wave"
   },
   {
    "id": "space-L4-w2",
    "word": "GRAVITY",
    "clue": "Attractive force between any two masses"
   },
   {
    "id": "space-L4-w3",
    "word": "ECLIPSE",
    "clue": "Event when one body blocks light from another"
   },
   {
    "id": "space-L4-w4",
    "word": "NEBULA",
    "clue": "Cloud of gas and dust where stars form"
   },
   {
    "id": "space-L4-w5",
    "word": "ORBIT",
    "clue": "Curved path of a body around another"
   },
   {
    "id": "space-L4-w6",
    "word": "FRICTION",
    "clue": "Force opposing relative motion between surfaces"
   },
   {
    "id": "space-L4-w7",
    "word": "MOMENTUM",
    "clue": "Product of mass and velocity of a body"
   },
   {
    "id": "space-L4-w8",
    "word": "SUPERNOVA",
    "clue": "Explosive death of a massive star"
   },
   {
    "id": "space-L4-w9",
    "word": "TELESCOPE",
    "clue": "Instrument used to observe distant objects in space"
   }
  ]
 },
 "5": {
  "questions": [
   {
    "id": "space-L5-q1",
    "q": "A probe orbits a small asteroid. If the probe's distance from the asteroid's centre is doubled, the gravitational force on it becomes",
    "options": [
     "unchanged",
     "one quarter as strong",
     "half as strong",
     "four times stronger"
    ],
    "answer": 1,
    "why": "Gravity follows an inverse-square law, so doubling the distance divides the force by 2² = 4.",
    "hint": "Think about what squaring the distance does to the force."
   },
   {
    "id": "space-L5-q2",
    "q": "Which statement about a geostationary satellite is correct?",
    "options": [
     "It orbits once per month over the poles",
     "It orbits once per day above the equator",
     "It stays still above a fixed point on the Moon",
     "It must orbit within Earth's atmosphere"
    ],
    "answer": 1,
    "why": "A geostationary satellite has a 24-hour orbital period and circles above the equator, so it appears fixed in the sky.",
    "hint": "Match its orbital period to Earth's rotation."
   },
   {
    "id": "space-L5-q3",
    "q": "Light from a distant galaxy shows its spectral lines shifted towards the red end. What does this indicate?",
    "options": [
     "The galaxy has no stars",
     "The galaxy is moving away from us",
     "The galaxy is getting hotter",
     "The galaxy is moving towards us"
    ],
    "answer": 1,
    "why": "Redshift means the observed wavelength is longer, which happens when the source recedes from the observer.",
    "hint": "Longer wavelength means the source is receding."
   },
   {
    "id": "space-L5-q4",
    "q": "A rocket fires its engine in deep space. Why does the rocket accelerate?",
    "options": [
     "Gravity from nearby stars pulls it forward",
     "Momentum is conserved as gas is ejected backwards",
     "The engine pushes on the rocket's own fuel",
     "Exhaust gases push against the vacuum"
    ],
    "answer": 1,
    "why": "By Newton's third law and conservation of momentum, ejecting gas one way pushes the rocket the other way; no air is needed.",
    "hint": "Think about action and reaction, not air to push against."
   },
   {
    "id": "space-L5-q5",
    "q": "Which sequence correctly orders these from smallest to largest?",
    "options": [
     "Solar system, star cluster, galaxy, universe",
     "Star cluster, solar system, galaxy, universe",
     "Solar system, galaxy, universe, star cluster",
     "Galaxy, solar system, star cluster, universe"
    ],
    "answer": 0,
    "why": "A planetary system is smaller than a star cluster, which sits within a galaxy, and galaxies lie within the universe.",
    "hint": "Start with the scale of one planetary system."
   },
   {
    "id": "space-L5-q6",
    "q": "An astronaut on the Moon has the same mass as on Earth but a smaller weight. Why?",
    "options": [
     "The astronaut's volume shrinks in low gravity",
     "The Moon has less mass than Earth, so g is smaller",
     "The astronaut's mass decreases on the Moon",
     "The Moon spins faster, reducing weight"
    ],
    "answer": 1,
    "why": "Weight equals mass times gravitational field strength; the Moon's smaller mass gives a weaker field, so weight falls while mass stays the same.",
    "hint": "Separate mass from gravitational field strength."
   },
   {
    "id": "space-L5-q7",
    "q": "Which of these is the main reason a satellite in a low circular orbit does not fall straight down?",
    "options": [
     "Air pressure holds it up",
     "It moves sideways fast enough to keep missing Earth",
     "Its engines fire continuously",
     "It is beyond Earth's gravity"
    ],
    "answer": 1,
    "why": "The satellite is in free fall, but its large horizontal speed means Earth's surface curves away beneath it.",
    "hint": "Think about free fall combined with a sideways speed."
   },
   {
    "id": "space-L5-q8",
    "q": "A star's spectrum peaks at a longer wavelength than the Sun's. What does this suggest about the star?",
    "options": [
     "It is cooler than the Sun",
     "It is larger than the Sun",
     "It is hotter than the Sun",
     "It is closer than the Sun"
    ],
    "answer": 0,
    "why": "By Wien's law, a cooler body radiates most strongly at longer wavelengths.",
    "hint": "Link peak wavelength to surface temperature."
   },
   {
    "id": "space-L5-q9",
    "q": "Why does the Moon show phases such as crescent and gibbous?",
    "options": [
     "Earth's shadow falls on the Moon each week",
     "We see different fractions of its sunlit half",
     "The Moon's surface brightness varies",
     "The Moon changes its distance from Earth"
    ],
    "answer": 1,
    "why": "The Moon is always half lit by the Sun, but from Earth we see varying portions of that lit half as it orbits.",
    "hint": "Think about how much of the lit half faces Earth."
   },
   {
    "id": "space-L5-q10",
    "q": "Which of these best explains why a comet's tail points away from the Sun?",
    "options": [
     "Sunlight and solar wind push gas and dust outward",
     "The tail follows the comet's direction of travel",
     "Earth's magnetic field attracts the tail",
     "The comet's own gravity repels the tail"
    ],
    "answer": 0,
    "why": "Radiation pressure and the solar wind sweep ionised gas and dust away from the Sun, so the tail points anti-sunward.",
    "hint": "Consider what streams outward from the Sun."
   },
   {
    "id": "space-L5-q11",
    "q": "Which statement about energy is correct for a falling object (ignoring air resistance)?",
    "options": [
     "Kinetic energy falls as it drops",
     "Potential energy is converted into kinetic energy",
     "Both potential and kinetic energy stay constant",
     "Total mechanical energy increases"
    ],
    "answer": 1,
    "why": "As height decreases, gravitational potential energy is converted into kinetic energy, keeping total mechanical energy constant.",
    "hint": "Track the exchange between height and speed."
   }
  ],
  "truths": [
   {
    "id": "space-L5-t1",
    "s": "Sound can travel through the vacuum of space.",
    "answer": false,
    "why": "Sound needs a medium; a vacuum has no particles to carry the vibration."
   },
   {
    "id": "space-L5-t2",
    "s": "The Sun's energy is produced by nuclear fusion in its core.",
    "answer": true,
    "why": "Hydrogen nuclei fuse into helium, releasing energy in the core."
   },
   {
    "id": "space-L5-t3",
    "s": "A light-year is a unit of time.",
    "answer": false,
    "why": "A light-year is a distance: the distance light travels in one year."
   },
   {
    "id": "space-L5-t4",
    "s": "The force of gravity between two masses increases if either mass increases.",
    "answer": true,
    "why": "Gravitational force is proportional to the product of the two masses."
   },
   {
    "id": "space-L5-t5",
    "s": "In a circular orbit, a satellite's speed is constant but its velocity changes.",
    "answer": true,
    "why": "Direction changes continuously, so velocity changes even though speed is steady."
   },
   {
    "id": "space-L5-t6",
    "s": "Red light has a higher frequency than blue light.",
    "answer": false,
    "why": "Red light has a longer wavelength and lower frequency than blue light."
   },
   {
    "id": "space-L5-t7",
    "s": "The seasons are caused by Earth's axis being tilted relative to its orbit.",
    "answer": true,
    "why": "The tilt changes the angle and duration of sunlight through the year."
   },
   {
    "id": "space-L5-t8",
    "s": "Galaxies are distributed evenly throughout the universe.",
    "answer": false,
    "why": "Galaxies form clusters and filaments with vast voids between them."
   },
   {
    "id": "space-L5-t9",
    "s": "A black hole's event horizon is the boundary beyond which nothing can escape.",
    "answer": true,
    "why": "Inside the event horizon, escape velocity exceeds the speed of light."
   },
   {
    "id": "space-L5-t10",
    "s": "Weight is measured in kilograms.",
    "answer": false,
    "why": "Weight is a force measured in newtons; kilograms measure mass."
   },
   {
    "id": "space-L5-t11",
    "s": "Ultraviolet radiation has more energy per photon than infrared radiation.",
    "answer": true,
    "why": "Higher frequency means higher photon energy, and ultraviolet has higher frequency than infrared."
   },
   {
    "id": "space-L5-t12",
    "s": "The Moon produces its own visible light.",
    "answer": false,
    "why": "The Moon shines by reflected sunlight, not by emitting its own visible light."
   },
   {
    "id": "space-L5-t13",
    "s": "According to Newton's first law, an object with no resultant force keeps a constant velocity.",
    "answer": true,
    "why": "Without a net force, velocity stays constant, including zero."
   },
   {
    "id": "space-L5-t14",
    "s": "The Andromeda galaxy is closer to us than the Sun.",
    "answer": false,
    "why": "Andromeda is about 2.5 million light-years away, far beyond the Sun."
   },
   {
    "id": "space-L5-t15",
    "s": "In a transverse wave, the oscillations are perpendicular to the direction of travel.",
    "answer": true,
    "why": "That is the definition of a transverse wave, as with light."
   },
   {
    "id": "space-L5-t16",
    "s": "Rockets need air to push against in order to accelerate in space.",
    "answer": false,
    "why": "They accelerate by ejecting exhaust, conserving momentum; no external air is needed."
   },
   {
    "id": "space-L5-t17",
    "s": "The greenhouse effect is caused entirely by the ozone layer.",
    "answer": false,
    "why": "Greenhouse gases such as carbon dioxide and water vapour trap infrared radiation; ozone is not the main cause."
   },
   {
    "id": "space-L5-t18",
    "s": "A satellite in a higher circular orbit moves more slowly than one in a lower orbit.",
    "answer": true,
    "why": "Orbital speed decreases with increasing orbital radius."
   }
  ],
  "terms": [
   {
    "id": "space-L5-w1",
    "word": "GRAVITY",
    "clue": "Attractive force between any two masses, weakening with distance squared."
   },
   {
    "id": "space-L5-w2",
    "word": "ECLIPSE",
    "clue": "Event when one body blocks light from another, as Sun or Moon."
   },
   {
    "id": "space-L5-w3",
    "word": "NEBULA",
    "clue": "Cloud of gas and dust where stars may form."
   },
   {
    "id": "space-L5-w4",
    "word": "FRICTION",
    "clue": "Force opposing relative motion between surfaces in contact."
   },
   {
    "id": "space-L5-w5",
    "word": "MOMENTUM",
    "clue": "Product of mass and velocity, conserved in collisions."
   },
   {
    "id": "space-L5-w6",
    "word": "SUPERNOVA",
    "clue": "Explosive death of a massive star, briefly outshining a galaxy."
   },
   {
    "id": "space-L5-w7",
    "word": "WAVELENGTH",
    "clue": "Distance between successive crests of a wave."
   },
   {
    "id": "space-L5-w8",
    "word": "SATELLITE",
    "clue": "Object orbiting a planet or star, natural or artificial."
   },
   {
    "id": "space-L5-w9",
    "word": "UNIVERSE",
    "clue": "All of space, matter and energy taken together."
   }
  ]
 },
 "6": {
  "questions": [
   {
    "id": "space-L6-q1",
    "q": "A comet orbits the Sun on an elliptical path. At which point is its speed greatest?",
    "options": [
     "At aphelion",
     "At the semi-minor axis",
     "At perihelion",
     "Speed is constant"
    ],
    "answer": 2,
    "why": "By Kepler's second law the comet sweeps equal areas in equal times, so it moves fastest where it is closest to the Sun, at perihelion.",
    "hint": "Think about where gravitational potential energy is lowest."
   },
   {
    "id": "space-L6-q2",
    "q": "A satellite in a circular orbit around Earth is moved to a circular orbit of twice the radius. What happens to its orbital speed?",
    "options": [
     "It doubles",
     "It halves",
     "It falls by a factor of √2",
     "It stays the same"
    ],
    "answer": 2,
    "why": "For circular orbits v = √(GM/r), so doubling r divides the speed by √2.",
    "hint": "Set gravitational force equal to centripetal force."
   },
   {
    "id": "space-L6-q3",
    "q": "Light from a star is observed to peak at 500 nm. Using Wien's law, roughly what is its surface temperature?",
    "options": [
     "About 1450 K",
     "About 2900 K",
     "About 5800 K",
     "About 11600 K"
    ],
    "answer": 2,
    "why": "Wien's law gives T ≈ 2.9×10⁻³ m·K divided by 500×10⁻⁹ m, about 5800 K.",
    "hint": "Divide the Wien constant by the peak wavelength in metres."
   },
   {
    "id": "space-L6-q4",
    "q": "A star's spectrum peaks at a longer wavelength than the Sun's, and it is much more luminous. Which classification fits best?",
    "options": [
     "A white dwarf",
     "A hot blue giant",
     "A cool red supergiant",
     "A hot main-sequence star"
    ],
    "answer": 2,
    "why": "A long-wavelength peak means a cool surface, while high luminosity with low temperature implies a very large radius, as in a red supergiant.",
    "hint": "Combine Wien's law with the luminosity–radius–temperature relation."
   },
   {
    "id": "space-L6-q5",
    "q": "A probe orbits a small asteroid. If the probe's distance from the asteroid's centre is doubled while it remains in a circular orbit, by what factor does the gravitational force on it change?",
    "options": [
     "It becomes one quarter",
     "It becomes four times",
     "It becomes one half",
     "It becomes double"
    ],
    "answer": 0,
    "why": "Newton's law gives F ∝ 1/r², so doubling r reduces the force to one quarter.",
    "hint": "Apply an inverse-square relationship."
   },
   {
    "id": "space-L6-q6",
    "q": "A satellite in a low circular orbit is described as being in free fall, yet it does not hit the ground. Why?",
    "options": [
     "Its engines continuously fire to keep it up",
     "Earth's gravity is negligible at that height",
     "Air resistance holds it up",
     "Its tangential speed carries it around Earth as it falls"
    ],
    "answer": 3,
    "why": "The satellite accelerates towards Earth but its large tangential velocity means the surface curves away beneath it at the same rate.",
    "hint": "Combine free-fall acceleration with horizontal motion."
   },
   {
    "id": "space-L6-q7",
    "q": "Which of these best explains why a comet's ion tail points away from the Sun?",
    "options": [
     "Radiation pressure and the solar wind push the ions outward",
     "The comet's motion drags the tail behind it",
     "The tail is left behind as the comet decelerates",
     "Gravity from the planets pulls the tail outward"
    ],
    "answer": 0,
    "why": "The ion tail consists of charged particles swept away from the Sun by the solar wind and radiation pressure, so it points anti-sunward regardless of motion.",
    "hint": "Consider forces from the Sun on charged particles."
   },
   {
    "id": "space-L6-q8",
    "q": "A planet orbits a star in a circular orbit. If the planet's orbital radius is doubled, by what factor does the gravitational force exerted by the star on the planet change?",
    "options": [
     "It becomes one quarter as large",
     "It becomes one half as large",
     "It becomes twice as large",
     "It stays the same"
    ],
    "answer": 0,
    "why": "Newton's law of gravitation gives force proportional to 1/r², so doubling r reduces the force to 1/4.",
    "hint": "Think about how force depends on the square of the distance."
   },
   {
    "id": "space-L6-q9",
    "q": "A spacecraft in a circular low Earth orbit fires its engine briefly in the direction of motion, increasing its speed. Assuming no further thrust, what happens to its orbit?",
    "options": [
     "It stays circular but at a lower altitude",
     "It spirals steadily outwards to escape",
     "It becomes an ellipse with a higher apogee",
     "It drops immediately into the atmosphere"
    ],
    "answer": 2,
    "why": "A prograde burn raises the opposite side of the orbit, producing an ellipse whose apogee is higher than the original circular radius.",
    "hint": "A single impulse changes the orbit at one point, not everywhere at once."
   },
   {
    "id": "space-L6-q10",
    "q": "Light from a distant galaxy shows its spectral lines shifted towards longer wavelengths. Which conclusion follows most directly?",
    "options": [
     "The galaxy is moving away from us",
     "The galaxy is moving towards us",
     "The galaxy contains no hydrogen",
     "The galaxy is much hotter than the Sun"
    ],
    "answer": 0,
    "why": "A redshift corresponds to a recession velocity (or cosmological expansion), so the galaxy is moving away.",
    "hint": "Longer wavelength means lower frequency; relate this to relative motion."
   },
   {
    "id": "space-L6-q11",
    "q": "A star's spectrum peaks at a much longer wavelength than the Sun's. What does this indicate about the star's surface?",
    "options": [
     "It is cooler than the Sun",
     "It is closer than the Sun",
     "It is hotter than the Sun",
     "It is more massive than the Sun"
    ],
    "answer": 0,
    "why": "By Wien's law, peak wavelength is inversely proportional to temperature, so a longer peak wavelength means a cooler surface.",
    "hint": "Recall how peak wavelength varies with temperature."
   },
   {
    "id": "space-L6-q12",
    "q": "A rocket fires its engine in deep space, far from any planet. Why does the rocket accelerate?",
    "options": [
     "The exhaust pushes against the vacuum of space",
     "The engine creates a pressure difference on the rocket's front",
     "The exhaust gas is expelled backwards, giving the rocket forward momentum",
     "The rocket's mass decreases, so gravity pulls it faster"
    ],
    "answer": 2,
    "why": "By conservation of momentum (Newton's third law), expelling gas in one direction gives the rocket momentum in the opposite direction.",
    "hint": "Consider conservation of momentum of the rocket plus exhaust."
   }
  ],
  "truths": [
   {
    "id": "space-L6-t1",
    "s": "For a satellite in a circular orbit, the gravitational force provides the centripetal force.",
    "answer": true,
    "why": "In a circular orbit gravity supplies exactly the required centripetal force, GMm/r² = mv²/r."
   },
   {
    "id": "space-L6-t2",
    "s": "Doubling the distance between two point masses halves the gravitational force between them.",
    "answer": false,
    "why": "The force follows an inverse-square law, so doubling the distance reduces it to one quarter, not one half."
   },
   {
    "id": "space-L6-t3",
    "s": "A body in uniform circular motion has a constant speed but a changing velocity.",
    "answer": true,
    "why": "The direction of motion changes continuously, so velocity changes even though its magnitude is constant."
   },
   {
    "id": "space-L6-t4",
    "s": "Redshift in a galaxy's spectrum indicates that the galaxy is moving towards us.",
    "answer": false,
    "why": "Redshift means the observed wavelengths are longer, indicating recession, not approach."
   },
   {
    "id": "space-L6-t5",
    "s": "A geostationary satellite must orbit above Earth's equator.",
    "answer": true,
    "why": "Only an equatorial orbit keeps the satellite fixed over one point on the ground."
   },
   {
    "id": "space-L6-t6",
    "s": "The escape velocity from a body depends on the mass of the escaping object.",
    "answer": false,
    "why": "Escape velocity is √(2GM/r) and depends on the mass and radius of the body being escaped, not on the escaping object's mass."
   },
   {
    "id": "space-L6-t7",
    "s": "Kepler's third law states that the square of a planet's orbital period is proportional to the cube of its semi-major axis.",
    "answer": true,
    "why": "This is the harmonic law, T² ∝ a³ for orbits around the same central body."
   },
   {
    "id": "space-L6-t8",
    "s": "In a perfectly elastic collision, kinetic energy is not conserved.",
    "answer": false,
    "why": "By definition, an elastic collision conserves kinetic energy as well as momentum."
   },
   {
    "id": "space-L6-t9",
    "s": "A white dwarf is supported against gravitational collapse by electron degeneracy pressure.",
    "answer": true,
    "why": "Electron degeneracy pressure balances gravity in a white dwarf, up to the Chandrasekhar limit."
   },
   {
    "id": "space-L6-t10",
    "s": "The cosmic microwave background has a temperature of about 300 K.",
    "answer": false,
    "why": "It is about 2.7 K, the cooled remnant of the early hot universe."
   },
   {
    "id": "space-L6-t11",
    "s": "For a star of given luminosity, a larger radius implies a lower surface temperature.",
    "answer": true,
    "why": "Since L = 4πR²σT⁴, larger R at fixed L requires lower T."
   },
   {
    "id": "space-L6-t12",
    "s": "The Moon's phases are caused by Earth's shadow falling on the Moon.",
    "answer": false,
    "why": "Phases arise from the changing angle at which we see the sunlit half of the Moon; Earth's shadow causes lunar eclipses."
   },
   {
    "id": "space-L6-t13",
    "s": "A body can have zero velocity and still be accelerating.",
    "answer": true,
    "why": "At the top of a vertical throw, velocity is momentarily zero while acceleration due to gravity remains non-zero."
   },
   {
    "id": "space-L6-t14",
    "s": "Wien's displacement law states that the peak wavelength of black-body radiation is proportional to temperature.",
    "answer": false,
    "why": "The peak wavelength is inversely proportional to temperature, λ_max T = constant."
   },
   {
    "id": "space-L6-t15",
    "s": "The Andromeda Galaxy is approaching the Milky Way, as shown by blueshift.",
    "answer": true,
    "why": "Andromeda's spectral lines are blueshifted, indicating approach within the Local Group."
   },
   {
    "id": "space-L6-t16",
    "s": "Work done on an object is independent of the angle between the force and the displacement.",
    "answer": false,
    "why": "Work is Fd cos θ, so the angle between force and displacement matters."
   },
   {
    "id": "space-L6-t17",
    "s": "Neutron stars are typically only a few tens of kilometres across but can have a mass greater than the Sun's.",
    "answer": true,
    "why": "Neutron stars are extremely dense remnants, roughly 10–20 km in radius with about 1–2 solar masses."
   },
   {
    "id": "space-L6-t18",
    "s": "Light from the Sun takes about 8 minutes to reach Earth, but the Sun's core photons reach the surface almost instantly.",
    "answer": false,
    "why": "Energy from the core diffuses outward over tens of thousands of years; only the final trip through space takes about 8 minutes."
   }
  ],
  "terms": [
   {
    "id": "space-L6-w1",
    "word": "PARSEC",
    "clue": "Distance at which one astronomical unit subtends one arcsecond"
   },
   {
    "id": "space-L6-w2",
    "word": "REDSHIFT",
    "clue": "Lengthening of observed wavelengths from a receding source"
   },
   {
    "id": "space-L6-w3",
    "word": "MOMENTUM",
    "clue": "Product of an object's mass and its velocity, conserved in collisions"
   },
   {
    "id": "space-L6-w4",
    "word": "LUMINOSITY",
    "clue": "Total power radiated by a star, measured in watts"
   },
   {
    "id": "space-L6-w5",
    "word": "PERIHELION",
    "clue": "Point in an orbit where a body is nearest the Sun"
   },
   {
    "id": "space-L6-w6",
    "word": "EXOPLANET",
    "clue": "World orbiting a star other than the Sun"
   },
   {
    "id": "space-L6-w7",
    "word": "ISOTOPE",
    "clue": "Atomic form differing in neutron number for the same element"
   },
   {
    "id": "space-L6-w8",
    "word": "SUPERNOVA",
    "clue": "Catastrophic explosion marking the end of some massive stars"
   },
   {
    "id": "space-L6-w9",
    "word": "IMPULSE",
    "clue": "Force multiplied by the time over which it acts"
   }
  ]
 },
 "7": {
  "questions": [
   {
    "id": "space-L7-q1",
    "q": "A satellite is in a circular orbit of radius r around Earth. It is moved to a circular orbit of radius 4r. By what factor does its orbital speed change?",
    "options": [
     "It stays the same",
     "It doubles",
     "It quarters",
     "It halves"
    ],
    "answer": 3,
    "why": "Orbital speed v = sqrt(GM/r), so quadrupling r halves v.",
    "hint": "Speed depends on the inverse square root of the orbital radius."
   },
   {
    "id": "space-L7-q2",
    "q": "A star's spectrum peaks at 400 nm. Using Wien's law (b = 2.9 × 10⁻³ m K), roughly what is its surface temperature?",
    "options": [
     "7250 K",
     "5800 K",
     "2900 K",
     "14500 K"
    ],
    "answer": 0,
    "why": "T = b/λmax = 2.9 × 10⁻³ / 4 × 10⁻⁷ ≈ 7250 K.",
    "hint": "Divide Wien's constant by the peak wavelength in metres."
   },
   {
    "id": "space-L7-q3",
    "q": "Two stars have the same luminosity, but star X has twice the surface temperature of star Y. How does the radius of X compare with that of Y?",
    "options": [
     "X is half the radius of Y",
     "X is four times the radius of Y",
     "X is one quarter the radius of Y",
     "X is twice the radius of Y"
    ],
    "answer": 2,
    "why": "L = 4πR²σT⁴; at equal L, R ∝ 1/T², so doubling T quarters R.",
    "hint": "Use the Stefan–Boltzmann law relating luminosity, radius and temperature."
   },
   {
    "id": "space-L7-q4",
    "q": "A spacecraft in a circular low Earth orbit briefly fires its engine in the direction of motion. What happens to its orbit?",
    "options": [
     "It becomes elliptical with a higher apogee",
     "It becomes elliptical with a lower perigee",
     "Its orbital period decreases",
     "It spirals directly into Earth"
    ],
    "answer": 0,
    "why": "Adding speed at a point raises the opposite side of the orbit, producing an ellipse with higher apogee.",
    "hint": "The burn point becomes the perigee of the new orbit."
   },
   {
    "id": "space-L7-q5",
    "q": "A planet orbits a star in a circular orbit. If the orbital radius is doubled, by what factor does the orbital period change?",
    "options": [
     "It increases by a factor of about 2.8",
     "It stays the same",
     "It doubles",
     "It increases by a factor of 4"
    ],
    "answer": 0,
    "why": "Kepler's third law gives T ∝ r^(3/2), and 2^(3/2) ≈ 2.8.",
    "hint": "Period scales as the 3/2 power of orbital radius."
   },
   {
    "id": "space-L7-q6",
    "q": "A star's spectrum peaks at a much longer wavelength than the Sun's and it is far more luminous. What does this suggest?",
    "options": [
     "It is cooler and much smaller than the Sun",
     "It is cooler but much larger than the Sun",
     "It is hotter and the same size as the Sun",
     "It is hotter but much smaller than the Sun"
    ],
    "answer": 1,
    "why": "Longer peak wavelength means cooler; high luminosity then requires a large radius.",
    "hint": "Combine Wien's law with the Stefan–Boltzmann law."
   },
   {
    "id": "space-L7-q7",
    "q": "A star's spectrum peaks at 290 nm. Using Wien's law (λmax·T ≈ 2.9×10⁻³ m·K), roughly what is its surface temperature?",
    "options": [
     "About 1 000 K",
     "About 10 000 K",
     "About 100 000 K",
     "About 5 800 K"
    ],
    "answer": 1,
    "why": "T = 2.9×10⁻³ / 290×10⁻⁹ ≈ 1.0×10⁴ K, so about 10 000 K.",
    "hint": "Convert nanometres to metres before dividing."
   },
   {
    "id": "space-L7-q8",
    "q": "A satellite in a circular orbit around Earth is moved to a circular orbit of twice the radius. By what factor does its orbital speed change?",
    "options": [
     "It decreases by a factor of the square root of 2",
     "It doubles",
     "It stays the same",
     "It halves"
    ],
    "answer": 0,
    "why": "For a circular orbit, v = sqrt(GM/r), so doubling r divides the speed by sqrt(2).",
    "hint": "Kepler's third law and the inverse-square law combine here."
   },
   {
    "id": "space-L7-q9",
    "q": "A star's spectrum peaks at 290 nm, while the Sun's peaks near 500 nm. Roughly what is the ratio of the star's surface temperature to the Sun's?",
    "options": [
     "About 0.58",
     "About 5.0",
     "About 1.7",
     "About 2.9"
    ],
    "answer": 2,
    "why": "By Wien's law, temperature is inversely proportional to peak wavelength: 500/290 is about 1.7.",
    "hint": "Wien's law: peak wavelength times temperature is constant."
   },
   {
    "id": "space-L7-q10",
    "q": "Two main-sequence stars have equal luminosity, but star X has twice the surface temperature of star Y. How do their radii compare?",
    "options": [
     "X has one quarter the radius of Y",
     "X has half the radius of Y",
     "X has twice the radius of Y",
     "X has four times the radius of Y"
    ],
    "answer": 0,
    "why": "L = 4πR²σT⁴; equal L with T doubled means R² ∝ 1/T⁴, so R_X = R_Y/4.",
    "hint": "Use the Stefan–Boltzmann law for a spherical star and set luminosities equal."
   },
   {
    "id": "space-L7-q11",
    "q": "A distant galaxy's spectral lines are observed at 1.25 times their laboratory wavelengths. Taking the recessional velocity as cz for small z, what is its approximate redshift?",
    "options": [
     "0.25",
     "1.25",
     "0.20",
     "0.80"
    ],
    "answer": 0,
    "why": "Redshift z = (λ_obs − λ_rest)/λ_rest = 1.25 − 1 = 0.25.",
    "hint": "Redshift is the fractional increase in wavelength."
   }
  ],
  "truths": [
   {
    "id": "space-L7-t1",
    "s": "A satellite in a circular orbit at twice Earth's radius has an orbital period of about 2.8 times that of a satellite at Earth's radius.",
    "answer": true,
    "why": "Kepler's third law gives T ∝ r^(3/2), and 2^(3/2) ≈ 2.8."
   },
   {
    "id": "space-L7-t2",
    "s": "The escape velocity from a body depends on the mass of the object trying to escape.",
    "answer": false,
    "why": "Escape velocity depends only on the mass and radius of the body being escaped from."
   },
   {
    "id": "space-L7-t3",
    "s": "In a geostationary orbit, a satellite remains above the same point on Earth's equator.",
    "answer": true,
    "why": "Its period matches Earth's rotation and it orbits in the equatorial plane."
   },
   {
    "id": "space-L7-t4",
    "s": "The Andromeda Galaxy is moving towards the Milky Way and is expected to merge with it in the distant future.",
    "answer": true,
    "why": "Andromeda's blueshift indicates approach, and a merger is predicted."
   },
   {
    "id": "space-L7-t5",
    "s": "Redshift of distant galaxies is caused by light losing energy as it travels through dust.",
    "answer": false,
    "why": "Cosmological redshift arises from the expansion of space, not dust absorption."
   },
   {
    "id": "space-L7-t6",
    "s": "A star with twice the surface temperature of the Sun emits about sixteen times as much energy per unit area.",
    "answer": true,
    "why": "Radiated power per unit area scales as T⁴, and 2⁴ = 16."
   },
   {
    "id": "space-L7-t7",
    "s": "The Sun's energy comes mainly from nuclear fission of heavy elements.",
    "answer": false,
    "why": "The Sun's energy comes from nuclear fusion of hydrogen into helium."
   },
   {
    "id": "space-L7-t8",
    "s": "Kepler's second law states that a line joining a planet to the Sun sweeps out equal areas in equal times.",
    "answer": true,
    "why": "This is the law of equal areas, equivalent to conservation of angular momentum."
   },
   {
    "id": "space-L7-t9",
    "s": "A photon of ultraviolet light has less energy than a photon of red light.",
    "answer": false,
    "why": "Ultraviolet has a shorter wavelength and therefore higher photon energy than red light."
   },
   {
    "id": "space-L7-t10",
    "s": "The cosmic microwave background radiation is a relic of the early, hot universe.",
    "answer": true,
    "why": "It is redshifted radiation from the recombination era of the early universe."
   },
   {
    "id": "space-L7-t11",
    "s": "For a body in circular orbit, the gravitational force provides the centripetal force.",
    "answer": true,
    "why": "Gravity acts as the centripetal force keeping the body in its circular path."
   },
   {
    "id": "space-L7-t12",
    "s": "The parallax of a nearby star is larger when the star is farther from Earth.",
    "answer": false,
    "why": "Parallax decreases with distance, so nearer stars show larger parallax."
   },
   {
    "id": "space-L7-t13",
    "s": "Main-sequence stars fuse hydrogen into helium in their cores.",
    "answer": true,
    "why": "Hydrogen fusion is the defining energy source of main-sequence stars."
   },
   {
    "id": "space-L7-t14",
    "s": "A body in a circular orbit is in free fall and experiences apparent weightlessness.",
    "answer": true,
    "why": "It accelerates toward Earth at the same rate as its surroundings, so no support force is felt."
   },
   {
    "id": "space-L7-t15",
    "s": "The James Webb Space Telescope observes mainly in the ultraviolet part of the spectrum.",
    "answer": false,
    "why": "JWST is optimised for infrared observations."
   },
   {
    "id": "space-L7-t16",
    "s": "The orbital speed of a satellite in a low circular orbit is greater than that of a satellite in a higher circular orbit.",
    "answer": true,
    "why": "Orbital speed v = sqrt(GM/r) decreases as r increases."
   },
   {
    "id": "space-L7-t17",
    "s": "A geostationary satellite must orbit above Earth's equator and have an orbital period of about 24 hours.",
    "answer": true,
    "why": "Geostationary means fixed above one point on the equator, which requires an equatorial orbit with a sidereal-day period."
   },
   {
    "id": "space-L7-t18",
    "s": "In a circular orbit, a satellite's acceleration points along its direction of motion, which is why its speed increases continuously.",
    "answer": false,
    "why": "The acceleration is centripetal, directed towards the centre of the orbit, perpendicular to the velocity, so the speed stays constant."
   },
   {
    "id": "space-L7-t19",
    "s": "A geostationary satellite must orbit above Earth's equator at a fixed altitude with a period of about 24 hours.",
    "answer": true,
    "why": "Only an equatorial orbit with a sidereal-day period keeps the satellite fixed over one point on the ground."
   },
   {
    "id": "space-L7-t20",
    "s": "A rocket in deep space needs something to push against, such as air or exhaust striking a surface, in order to accelerate.",
    "answer": false,
    "why": "It accelerates by conservation of momentum: ejecting exhaust in one direction pushes the rocket the other way, with no external medium needed."
   }
  ],
  "terms": [
   {
    "id": "space-L7-w1",
    "word": "PARALLAX",
    "clue": "Apparent shift of a nearby star against background as Earth orbits"
   },
   {
    "id": "space-L7-w2",
    "word": "REDSHIFT",
    "clue": "Increase in observed wavelength of light from a receding source"
   },
   {
    "id": "space-L7-w3",
    "word": "SUPERNOVA",
    "clue": "Explosive death of a massive star, leaving a neutron star or black hole"
   },
   {
    "id": "space-L7-w4",
    "word": "PERIHELION",
    "clue": "Point in an orbit where a body is closest to the Sun"
   },
   {
    "id": "space-L7-w5",
    "word": "LUMINOSITY",
    "clue": "Total power a star radiates across all wavelengths"
   },
   {
    "id": "space-L7-w6",
    "word": "PARSEC",
    "clue": "Distance at which one astronomical unit subtends one arcsecond"
   }
  ]
 },
 "8": {
  "questions": [
   {
    "id": "space-L8-q1",
    "q": "A spacecraft in a circular low Earth orbit briefly fires its engine in the direction of motion. What happens to its orbit?",
    "options": [
     "It becomes a smaller circular orbit",
     "It becomes an ellipse with a higher apoapsis",
     "Its orbital period decreases",
     "It spirals immediately into Earth",
     "Its orbital plane flips"
    ],
    "answer": 1,
    "why": "A prograde burn raises speed at that point, making it the periapsis of a new ellipse with a higher apoapsis.",
    "hint": "The burn point becomes one apsis of the new orbit; the opposite side rises."
   },
   {
    "id": "space-L8-q2",
    "q": "Which of these correctly describes the fate of a white dwarf in a close binary system that accretes matter beyond the Chandrasekhar limit?",
    "options": [
     "It forms a black hole without a visible event",
     "It collapses to a neutron star quietly",
     "It explodes as a Type Ia supernova",
     "It becomes a red giant and sheds its envelope",
     "It merges with the companion to form a pulsar"
    ],
    "answer": 2,
    "why": "Exceeding about 1.4 solar masses triggers carbon fusion and a Type Ia supernova, leaving no remnant.",
    "hint": "Think of the standard candle used in cosmology."
   },
   {
    "id": "space-L8-q3",
    "q": "A main-sequence star has a luminosity 100 times that of the Sun. Assuming the mass–luminosity relation L ∝ M^3.5, by what factor is its mass greater than the Sun's?",
    "options": [
     "About 100",
     "About 3.7",
     "About 1.9",
     "About 10",
     "About 32"
    ],
    "answer": 1,
    "why": "M/M☉ = 100^(1/3.5) ≈ 3.7, since 3.7^3.5 ≈ 100.",
    "hint": "Take the 3.5th root of the luminosity ratio."
   },
   {
    "id": "space-L8-q4",
    "q": "A spacecraft in a circular orbit at radius r around Earth fires its engine prograde, raising its orbit to radius 2r. What happens to its orbital speed and period?",
    "options": [
     "Speed falls by √2; period rises by 2√2",
     "Speed rises by √2; period rises by 2√2",
     "Speed falls by 2; period rises by 8",
     "Speed is unchanged; period doubles",
     "Speed falls by √2; period quadruples"
    ],
    "answer": 0,
    "why": "v ∝ r^(−1/2) so speed falls by √2; T ∝ r^(3/2) so period rises by 2^(3/2) = 2√2.",
    "hint": "Use v² = GM/r and Kepler's third law."
   },
   {
    "id": "space-L8-q5",
    "q": "Two stars have the same luminosity, but star X has twice the surface temperature of star Y. How do their radii compare?",
    "options": [
     "X has one quarter the radius of Y",
     "X has half the radius of Y",
     "X has twice the radius of Y",
     "X has four times the radius of Y",
     "They have equal radii"
    ],
    "answer": 0,
    "why": "L = 4πR²σT⁴, so with equal L, R ∝ T⁻²; doubling T reduces R by a factor of 4.",
    "hint": "Stefan–Boltzmann law links luminosity, radius and the fourth power of temperature."
   },
   {
    "id": "space-L8-q6",
    "q": "Two main-sequence stars have the same luminosity, but star X has twice the surface temperature of star Y. How do their radii compare?",
    "options": [
     "R_X = R_Y / 4",
     "R_X = R_Y / 2",
     "R_X = 2 R_Y",
     "R_X = R_Y / 16",
     "R_X = 4 R_Y"
    ],
    "answer": 0,
    "why": "L = 4πR²σT⁴, so equal L with double T gives R_X² = R_Y²/16, hence R_X = R_Y/4.",
    "hint": "Luminosity depends on R² and T⁴."
   },
   {
    "id": "space-L8-q7",
    "q": "A spacecraft in a circular low Earth orbit briefly fires its engine forwards (in the direction of motion). Immediately afterwards its orbit:",
    "options": [
     "becomes an ellipse with higher apogee",
     "becomes a parabola escaping the Sun",
     "stays exactly circular at the same radius",
     "becomes a smaller circle",
     "spirals inwards to Earth"
    ],
    "answer": 0,
    "why": "A prograde burn raises speed at that point, making it the perigee of an ellipse with a higher apogee.",
    "hint": "A forward burn adds energy and raises the opposite side of the orbit."
   },
   {
    "id": "space-L8-q8",
    "q": "A photon from a distant quasar has redshift z = 2. Its observed wavelength compared with the emitted wavelength is:",
    "options": [
     "half as long",
     "unchanged",
     "three times as long",
     "twice as long",
     "one third as long"
    ],
    "answer": 2,
    "why": "1 + z = λobs/λemit, so with z = 2 the wavelength is tripled.",
    "hint": "Redshift is defined by 1 + z = λobs/λemit."
   },
   {
    "id": "space-L8-q9",
    "q": "Two stars have equal luminosity, but star X has twice the surface temperature of star Y. What is the ratio of star X's radius to star Y's?",
    "options": [
     "4",
     "1/2",
     "1",
     "2",
     "1/4"
    ],
    "answer": 4,
    "why": "L = 4πR²σT⁴, so R ∝ T^(−2) at fixed L; doubling T quarters the radius.",
    "hint": "Use the Stefan–Boltzmann law with L fixed."
   },
   {
    "id": "space-L8-q10",
    "q": "A distant galaxy's spectral lines are observed at wavelengths 1.25 times their rest values. Taking the recessional speed as cz for small z, what is its approximate redshift and speed?",
    "options": [
     "z = 0.25, v ≈ 0.25c",
     "z = 0.80, v ≈ 0.80c",
     "z = 1.25, v ≈ 1.25c",
     "z = 0.25, v ≈ 0.22c",
     "z = 0.20, v ≈ 0.20c"
    ],
    "answer": 0,
    "why": "z = Δλ/λ = 0.25, and for modest z, v ≈ cz = 0.25c.",
    "hint": "z is the fractional increase in wavelength."
   },
   {
    "id": "space-L8-q11",
    "q": "A satellite is in a circular orbit of radius r around Earth. It is moved to a circular orbit of radius 4r. By what factor does its orbital speed change?",
    "options": [
     "It halves",
     "It doubles",
     "It quarters",
     "It stays the same",
     "It falls to one eighth"
    ],
    "answer": 0,
    "why": "Orbital speed v = √(GM/r), so increasing r by a factor of 4 reduces v by √4 = 2, i.e. it halves.",
    "hint": "Kepler's third law and the circular-orbit speed formula both show v ∝ r^(-1/2)."
   },
   {
    "id": "space-L8-q12",
    "q": "A star's spectrum peaks at 290 nm. Using Wien's law (λmax·T ≈ 2.9×10⁻³ m·K), roughly what is its surface temperature?",
    "options": [
     "2 900 K",
     "5 800 K",
     "20 000 K",
     "1 000 K",
     "10 000 K"
    ],
    "answer": 4,
    "why": "T = 2.9×10⁻³ / 290×10⁻⁹ ≈ 1.0×10⁴ K, so about 10 000 K.",
    "hint": "Convert nanometres to metres before dividing."
   },
   {
    "id": "space-L8-q13",
    "q": "A planet orbits a star in a circular orbit. If the orbital radius is doubled, by what factor does the orbital period change?",
    "options": [
     "It increases by a factor of about 2.8",
     "It doubles",
     "It increases by a factor of 4",
     "It halves",
     "It stays the same"
    ],
    "answer": 0,
    "why": "Kepler's third law gives T² ∝ r³, so doubling r multiplies T by 2^(3/2) ≈ 2.8.",
    "hint": "Take the square root of the cube of the radius ratio."
   },
   {
    "id": "space-L8-q14",
    "q": "A star's spectrum peaks at a much longer wavelength than the Sun's and it is far more luminous. What does this indicate?",
    "options": [
     "It is cooler and smaller than the Sun",
     "It is hotter and smaller than the Sun",
     "It is cooler but much larger than the Sun",
     "It is hotter and larger than the Sun",
     "It must be a white dwarf"
    ],
    "answer": 2,
    "why": "Longer peak wavelength means cooler; high luminosity with low temperature requires a very large radius (a red giant or supergiant).",
    "hint": "Use both Wien's law and the Stefan–Boltzmann law together."
   },
   {
    "id": "space-L8-q15",
    "q": "A star has a parallax of 0.02 arcseconds. Roughly how far away is it?",
    "options": [
     "10 parsecs",
     "2 parsecs",
     "50 parsecs",
     "20 parsecs",
     "200 parsecs"
    ],
    "answer": 2,
    "why": "Distance in parsecs is 1/p, so 1/0.02 = 50 pc.",
    "hint": "Parallax in arcseconds and distance in parsecs are reciprocals."
   },
   {
    "id": "space-L8-q16",
    "q": "A planet orbits a star with period T at radius r. If the radius is increased to 4r, the new period is:",
    "options": [
     "T/4",
     "16T",
     "8T",
     "4T",
     "2T"
    ],
    "answer": 2,
    "why": "Kepler's third law gives T ∝ r^(3/2), so (4)^(3/2) = 8.",
    "hint": "Use T² ∝ r³."
   }
  ],
  "truths": [
   {
    "id": "space-L8-t1",
    "s": "A star's colour index B−V becomes larger (redder) as its surface temperature increases.",
    "answer": false,
    "why": "Hotter stars are bluer, so B−V decreases with increasing temperature."
   },
   {
    "id": "space-L8-t2",
    "s": "For a main-sequence star, luminosity increases roughly as the cube of its mass.",
    "answer": true,
    "why": "The mass–luminosity relation gives L ∝ M^3 to 4 on the main sequence."
   },
   {
    "id": "space-L8-t3",
    "s": "The cosmic microwave background has a nearly perfect blackbody spectrum at about 2.7 K.",
    "answer": true,
    "why": "COBE and later missions confirmed a 2.725 K blackbody spectrum."
   },
   {
    "id": "space-L8-t4",
    "s": "In an elliptical orbit, a planet's angular momentum about the Sun changes as it moves around the orbit.",
    "answer": false,
    "why": "Angular momentum is conserved; only the speed and radius vary, not the angular momentum."
   },
   {
    "id": "space-L8-t5",
    "s": "A photon's energy is proportional to its frequency.",
    "answer": true,
    "why": "E = hf, Planck's relation."
   },
   {
    "id": "space-L8-t6",
    "s": "The escape velocity from a body of mass M and radius R is √(GM/R).",
    "answer": false,
    "why": "Escape velocity is √(2GM/R); the factor of 2 is missing."
   },
   {
    "id": "space-L8-t7",
    "s": "Type Ia supernovae are used as standardisable candles because their peak luminosity is fairly consistent.",
    "answer": true,
    "why": "Their similar peak luminosities make them distance indicators."
   },
   {
    "id": "space-L8-t8",
    "s": "A geostationary satellite must orbit at an altitude of about 36 000 km above the equator.",
    "answer": true,
    "why": "That altitude gives a sidereal-day period and an equatorial, fixed position."
   },
   {
    "id": "space-L8-t9",
    "s": "Hubble's law states that recession velocity is inversely proportional to distance.",
    "answer": false,
    "why": "Recession velocity is directly proportional to distance, v = H₀d."
   },
   {
    "id": "space-L8-t10",
    "s": "The Sun's core temperature is roughly 15 million kelvin.",
    "answer": true,
    "why": "Standard solar models give about 1.5×10⁷ K in the core."
   },
   {
    "id": "space-L8-t11",
    "s": "In a circular orbit, the orbital period is independent of the central mass.",
    "answer": false,
    "why": "Kepler's third law gives T² ∝ 1/M for a given radius."
   },
   {
    "id": "space-L8-t12",
    "s": "Gravitational waves are ripples in spacetime produced by accelerating masses.",
    "answer": true,
    "why": "Accelerating mass distributions, especially asymmetric ones, radiate gravitational waves."
   },
   {
    "id": "space-L8-t13",
    "s": "A red giant has a higher surface temperature than a main-sequence star of the same colour.",
    "answer": false,
    "why": "Colour and temperature are linked; same colour means roughly the same surface temperature."
   },
   {
    "id": "space-L8-t14",
    "s": "The ion tail of a comet generally points away from the Sun, while the dust tail curves along the orbit.",
    "answer": true,
    "why": "The solar wind sweeps ions anti-sunward; dust lags and curves."
   },
   {
    "id": "space-L8-t15",
    "s": "A satellite in a higher circular orbit moves faster than one in a lower circular orbit.",
    "answer": false,
    "why": "Orbital speed decreases with radius: v = √(GM/r)."
   },
   {
    "id": "space-L8-t16",
    "s": "The main-sequence lifetime of a star scales roughly as M⁻²·⁵ to M⁻³.",
    "answer": true,
    "why": "Higher mass gives much higher luminosity, so lifetime falls steeply with mass."
   },
   {
    "id": "space-L8-t17",
    "s": "Wien's displacement law states that peak wavelength is proportional to temperature.",
    "answer": false,
    "why": "Peak wavelength is inversely proportional to temperature, λmax ∝ 1/T."
   },
   {
    "id": "space-L8-t18",
    "s": "A body in a circular orbit at the Earth's surface would need a speed of about 7.9 km/s.",
    "answer": true,
    "why": "First cosmic velocity is √(GM/R) ≈ 7.9 km/s."
   },
   {
    "id": "space-L8-t19",
    "s": "The escape velocity from a body depends on the mass of the escaping object as well as the mass of the body.",
    "answer": false,
    "why": "Escape velocity v = √(2GM/r) depends only on the body's mass and radius, not on the escaping object's mass."
   },
   {
    "id": "space-L8-t20",
    "s": "In an elliptical orbit, a planet moves fastest when it is nearest the Sun.",
    "answer": true,
    "why": "Kepler's second law: equal areas in equal times means greater speed at perihelion."
   },
   {
    "id": "space-L8-t21",
    "s": "A star's absolute magnitude is its brightness as seen from Earth.",
    "answer": false,
    "why": "Absolute magnitude is brightness at a standard distance of 10 pc; apparent magnitude is brightness as seen from Earth."
   },
   {
    "id": "space-L8-t22",
    "s": "For a main-sequence star, increasing its mass increases its luminosity but decreases its surface temperature.",
    "answer": false,
    "why": "More massive main-sequence stars are both more luminous and hotter, not cooler."
   },
   {
    "id": "space-L8-t23",
    "s": "In a circular orbit, a satellite's acceleration is directed towards the central body and its magnitude is v²/r.",
    "answer": true,
    "why": "Centripetal acceleration v²/r points to the centre of the orbit."
   }
  ],
  "terms": [
   {
    "id": "space-L8-w1",
    "word": "REDSHIFT",
    "clue": "Increase in wavelength of light from a receding source"
   },
   {
    "id": "space-L8-w2",
    "word": "PERIHELION",
    "clue": "Point of a solar orbit closest to the Sun"
   },
   {
    "id": "space-L8-w3",
    "word": "LUMINOSITY",
    "clue": "Total power output of a star over all wavelengths"
   },
   {
    "id": "space-L8-w4",
    "word": "ECLIPTIC",
    "clue": "Plane of Earth's orbit projected on the celestial sphere"
   },
   {
    "id": "space-L8-w5",
    "word": "BLACKBODY",
    "clue": "Ideal emitter whose spectrum depends only on temperature"
   },
   {
    "id": "space-L8-w6",
    "word": "APOAPSIS",
    "clue": "Point of an orbit farthest from the central body"
   },
   {
    "id": "space-L8-w7",
    "word": "NEUTRINO",
    "clue": "Nearly massless particle produced copiously in stellar cores"
   },
   {
    "id": "space-L8-w8",
    "word": "APHELION",
    "clue": "Point in an orbit farthest from the Sun"
   },
   {
    "id": "space-L8-w9",
    "word": "CHANDRASEKHAR",
    "clue": "Upper mass limit for a white dwarf, near 1.4 solar masses"
   },
   {
    "id": "space-L8-w10",
    "word": "SIDEREAL",
    "clue": "Day measured against the fixed stars, about four minutes shorter"
   }
  ]
 },
 "9": {
  "questions": [
   {
    "id": "space-L9-q1",
    "q": "A spacecraft in a circular low Earth orbit briefly fires its engine forwards (in the direction of motion). What happens to its orbit?",
    "options": [
     "It rises to a higher elliptical orbit with the burn point as perigee",
     "It spirals inwards and re-enters the atmosphere",
     "It stays in the same orbit but moves faster permanently",
     "It escapes Earth immediately",
     "It stays circular but with a larger radius"
    ],
    "answer": 0,
    "why": "A prograde burn raises the opposite side of the orbit, making the burn point the perigee of a new ellipse.",
    "hint": "The burn point becomes the low point of the new path."
   },
   {
    "id": "space-L9-q2",
    "q": "A main-sequence star has a luminosity 100 times that of the Sun. Assuming the mass–luminosity relation L ∝ M³·⁵, roughly what is its mass in solar masses?",
    "options": [
     "About 3.7",
     "About 32",
     "About 1.5",
     "About 10",
     "About 100"
    ],
    "answer": 0,
    "why": "M ≈ 100^(1/3.5) ≈ 3.7 solar masses.",
    "hint": "Invert the exponent: M ∝ L^(1/3.5)."
   },
   {
    "id": "space-L9-q3",
    "q": "Which of these correctly describes the fate of a white dwarf in a close binary system that accretes matter beyond the Chandrasekhar limit?",
    "options": [
     "It collapses and may explode as a type Ia supernova",
     "It quietly cools into a brown dwarf",
     "It becomes a neutron star without any explosion",
     "It swells into a red giant and sheds its envelope",
     "It merges with its companion into a main-sequence star"
    ],
    "answer": 0,
    "why": "Exceeding about 1.4 solar masses triggers core collapse and a thermonuclear type Ia supernova.",
    "hint": "Think of the mass limit named after Chandrasekhar."
   },
   {
    "id": "space-L9-q4",
    "q": "Which statement about the cosmic microwave background is correct at master's level?",
    "options": [
     "It shows no measurable anisotropies at all",
     "It has a temperature of about 300 K",
     "It was emitted after galaxies formed",
     "Its temperature is about 2.7 K and it has a nearly perfect blackbody spectrum",
     "It originates from the surfaces of nearby stars"
    ],
    "answer": 3,
    "why": "The CMB is a 2.7 K relic blackbody from recombination, with tiny anisotropies.",
    "hint": "Recall the temperature of the relic radiation."
   },
   {
    "id": "space-L9-q5",
    "q": "A white dwarf in a close binary accretes matter from its companion and approaches the Chandrasekhar limit. What is the expected outcome?",
    "options": [
     "A Type II supernova from iron-core collapse",
     "A nova that leaves the white dwarf intact forever",
     "Formation of a black hole directly",
     "A Type Ia supernova from runaway carbon fusion",
     "Core collapse to a neutron star"
    ],
    "answer": 3,
    "why": "Near the Chandrasekhar limit the degenerate carbon–oxygen core ignites explosively, producing a Type Ia supernova.",
    "hint": "This is the standard thermonuclear, not core-collapse, explosion channel."
   },
   {
    "id": "space-L9-q6",
    "q": "A main-sequence star has a luminosity 100 times the Sun's. Assuming the mass–luminosity relation L ∝ M³·⁵, roughly what is its mass in solar masses?",
    "options": [
     "About 32",
     "About 1.4",
     "About 3.7",
     "About 10",
     "About 100"
    ],
    "answer": 2,
    "why": "M/M☉ = 100^(1/3.5) ≈ 3.7, since 3.7^3.5 ≈ 100.",
    "hint": "Invert L ∝ M^3.5 by taking the 1/3.5 power of 100."
   },
   {
    "id": "space-L9-q7",
    "q": "A white dwarf in a close binary accretes hydrogen-rich gas from its companion until its mass approaches the Chandrasekhar limit. What is the most likely outcome?",
    "options": [
     "Quiet contraction to a stable larger white dwarf",
     "A nova that permanently ends all accretion",
     "Collapse directly to a stellar-mass black hole",
     "A core-collapse supernova leaving a neutron star",
     "A thermonuclear supernova that largely destroys the white dwarf"
    ],
    "answer": 4,
    "why": "Accretion to near 1.4 M☉ ignites carbon fusion in the degenerate core, producing a Type Ia thermonuclear supernova.",
    "hint": "Degenerate carbon ignition, not core collapse, is the key."
   },
   {
    "id": "space-L9-q8",
    "q": "A satellite in a low circular orbit experiences a small drag force that slowly lowers its altitude. What happens to its speed as a result?",
    "options": [
     "It increases, because drag adds kinetic energy",
     "It decreases, because the period also decreases",
     "It stays constant, because gravity does no work",
     "It decreases, because drag removes kinetic energy",
     "It increases, because the orbit shrinks and v ∝ r^(-1/2)"
    ],
    "answer": 4,
    "why": "Drag removes orbital energy, lowering the orbit; in a lower circular orbit the speed √(GM/r) is larger, so the satellite speeds up.",
    "hint": "Think about how circular-orbit speed depends on radius, not just about energy loss."
   },
   {
    "id": "space-L9-q9",
    "q": "A distant galaxy's spectral lines are observed at wavelengths 1.25 times their laboratory rest values. What is the recession velocity as a fraction of the speed of light (using the relativistic Doppler formula for small-to-moderate z)?",
    "options": [
     "About 0.25c",
     "About 0.22c",
     "About 0.33c",
     "About 0.20c",
     "About 0.12c"
    ],
    "answer": 1,
    "why": "1 + z = 1.25 gives z = 0.25; the relativistic Doppler relation gives β = ((1+z)² − 1)/((1+z)² + 1) ≈ 0.22.",
    "hint": "Use the relativistic Doppler formula, not simply v = cz."
   },
   {
    "id": "space-L9-q10",
    "q": "A spacecraft in a circular low Earth orbit briefly fires its engine forwards (prograde). Immediately after the burn, which statement is correct?",
    "options": [
     "Its speed is lower and it falls to a lower orbit",
     "Its speed is unchanged and only its direction changes",
     "Its speed is lower and its orbit is circular at a larger radius",
     "Its speed is higher and its new orbit has a higher apogee but the same perigee",
     "Its speed is higher and its orbit is circular at a larger radius"
    ],
    "answer": 3,
    "why": "A prograde burn raises speed at that point, making it the perigee of an elliptical orbit with a higher apogee.",
    "hint": "A brief burn changes the velocity at one point, not the whole orbit shape at once."
   },
   {
    "id": "space-L9-q11",
    "q": "In a gravitational lens, a distant source lies almost exactly behind a massive foreground galaxy. What is observed?",
    "options": [
     "An Einstein ring or multiple images of the source",
     "A shadow of the foreground galaxy",
     "A single image shifted blueward",
     "A single image with no distortion",
     "A perfectly sharp image magnified without distortion"
    ],
    "answer": 0,
    "why": "Light from the source is bent by the foreground mass, producing rings or multiple images when alignment is nearly perfect.",
    "hint": "Think about how a massive object bends light paths from behind it."
   },
   {
    "id": "space-L9-q12",
    "q": "Two main-sequence stars have equal luminosity, but star X has twice the surface temperature of star Y. What is the ratio of star X's radius to star Y's radius?",
    "options": [
     "1/4",
     "1/2",
     "4",
     "1",
     "2"
    ],
    "answer": 0,
    "why": "L ∝ R²T⁴; equal L with T_X = 2T_Y gives R_X/R_Y = (T_Y/T_X)² = 1/4.",
    "hint": "Use the Stefan–Boltzmann law and hold luminosity fixed."
   },
   {
    "id": "space-L9-q13",
    "q": "A photon from a distant quasar is observed with redshift z = 2. By what factor has its wavelength been stretched relative to its rest wavelength?",
    "options": [
     "4",
     "1.5",
     "2",
     "√2",
     "3"
    ],
    "answer": 4,
    "why": "Observed wavelength is (1+z) times rest wavelength, so the factor is 3.",
    "hint": "Redshift z adds one to the stretch factor."
   },
   {
    "id": "space-L9-q14",
    "q": "In a close binary, a white dwarf accretes matter from its companion and its mass approaches the Chandrasekhar limit. What is the most likely outcome?",
    "options": [
     "It forms a planetary nebula",
     "It explodes as a Type Ia supernova",
     "It becomes a red giant",
     "It fades as a brown dwarf",
     "It collapses directly to a neutron star"
    ],
    "answer": 1,
    "why": "Accretion to near 1.4 solar masses triggers carbon ignition and a Type Ia supernova.",
    "hint": "Think of the standard candle produced by a white dwarf near 1.4 solar masses."
   },
   {
    "id": "space-L9-q15",
    "q": "A spacecraft in a circular low Earth orbit briefly fires its engine retrograde, lowering its perigee into the atmosphere. What happens to its orbit?",
    "options": [
     "It becomes a hyperbola",
     "It stops moving",
     "It stays circular but faster",
     "It becomes an ellipse with lower perigee",
     "It spirals outward to escape"
    ],
    "answer": 3,
    "why": "A retrograde burn reduces speed at that point, making it the apogee of an ellipse whose perigee is lower.",
    "hint": "A retrograde burn lowers the opposite side of the orbit."
   }
  ],
  "truths": [
   {
    "id": "space-L9-t1",
    "s": "The main-sequence lifetime of a star scales roughly as M⁻²·⁵ for a mass–luminosity exponent of 3.5.",
    "answer": true,
    "why": "t ∝ M/L ∝ M/M³·⁵ = M⁻²·⁵."
   },
   {
    "id": "space-L9-t2",
    "s": "In the relativistic Doppler effect, an object receding at speed v has observed wavelength multiplied by √((1+β)/(1−β)).",
    "answer": true,
    "why": "This is the standard relativistic redshift formula with β = v/c."
   },
   {
    "id": "space-L9-t3",
    "s": "A Type Ia supernova can be used as a standard candle because its peak luminosity is fairly uniform.",
    "answer": true,
    "why": "White dwarf explosions near the Chandrasekhar limit give similar peak brightness."
   },
   {
    "id": "space-L9-t4",
    "s": "A type Ia supernova results from the core collapse of a massive star that has exhausted its fuel.",
    "answer": false,
    "why": "Type Ia comes from a white dwarf accreting beyond the Chandrasekhar limit; core collapse gives type II."
   },
   {
    "id": "space-L9-t5",
    "s": "In a closed universe with density above the critical density, the expansion will continue forever.",
    "answer": false,
    "why": "Above critical density the universe recollapses; forever-expanding describes an open or flat universe."
   },
   {
    "id": "space-L9-t6",
    "s": "Gravitational lensing can produce multiple images of a single distant source.",
    "answer": true,
    "why": "Mass along the line of sight bends light and can create multiple images or arcs."
   },
   {
    "id": "space-L9-t7",
    "s": "The Chandrasekhar limit for a white dwarf is about 1.4 solar masses.",
    "answer": true,
    "why": "Above roughly 1.4 M☉ electron degeneracy pressure cannot support the star."
   },
   {
    "id": "space-L9-t8",
    "s": "Neutron stars are held up against gravity mainly by thermal gas pressure.",
    "answer": false,
    "why": "They are supported by neutron degeneracy pressure, not thermal pressure."
   },
   {
    "id": "space-L9-t9",
    "s": "In the mass–luminosity relation for main-sequence stars, luminosity is proportional to mass squared.",
    "answer": false,
    "why": "It is roughly L ∝ M³·⁵, not M², over the main sequence."
   },
   {
    "id": "space-L9-t10",
    "s": "A Type Ia supernova results from the core collapse of a massive star.",
    "answer": false,
    "why": "Type Ia comes from thermonuclear runaway of a white dwarf near the Chandrasekhar limit, not core collapse."
   },
   {
    "id": "space-L9-t11",
    "s": "The Chandrasekhar limit for a non-rotating white dwarf is about 1.4 solar masses.",
    "answer": true,
    "why": "Electron degeneracy pressure supports white dwarfs only up to roughly 1.4 M☉."
   },
   {
    "id": "space-L9-t12",
    "s": "A Type Ia supernova arises from the thermonuclear explosion of a white dwarf near the Chandrasekhar mass.",
    "answer": true,
    "why": "Accretion or merger pushes the white dwarf near 1.4 M☉, igniting carbon in a thermonuclear runaway."
   },
   {
    "id": "space-L9-t13",
    "s": "Gravitational lensing by a galaxy can produce multiple images of a single background quasar.",
    "answer": true,
    "why": "Strong lensing by a foreground mass bends light into several paths, giving multiple images or rings."
   },
   {
    "id": "space-L9-t14",
    "s": "In a binary system, the more massive star always evolves off the main sequence first.",
    "answer": false,
    "why": "The more massive star evolves faster and leaves the main sequence first, not the less massive one."
   },
   {
    "id": "space-L9-t15",
    "s": "The cosmic microwave background has a nearly perfect blackbody spectrum at about 2.7 K.",
    "answer": true,
    "why": "COBE and later missions confirmed a 2.725 K blackbody."
   },
   {
    "id": "space-L9-t16",
    "s": "In a prograde burn in circular orbit, the spacecraft's speed at the burn point increases but its new orbital period is shorter.",
    "answer": false,
    "why": "A prograde burn raises the orbit and increases the period, not shortens it."
   },
   {
    "id": "space-L9-t17",
    "s": "For a circular orbit, the orbital speed decreases as the orbital radius increases.",
    "answer": true,
    "why": "v = √(GM/r) falls with increasing r."
   },
   {
    "id": "space-L9-t18",
    "s": "Wien's law states that the peak wavelength of a blackbody is directly proportional to its temperature.",
    "answer": false,
    "why": "It is inversely proportional: λmax·T is constant."
   },
   {
    "id": "space-L9-t19",
    "s": "Kepler's third law for orbits around the Sun states that the square of the period is proportional to the cube of the semi-major axis.",
    "answer": true,
    "why": "T² ∝ a³ is Kepler's third law."
   },
   {
    "id": "space-L9-t20",
    "s": "The cosmic microwave background has a temperature of about 2.7 K.",
    "answer": true,
    "why": "Its blackbody temperature is roughly 2.725 K."
   },
   {
    "id": "space-L9-t21",
    "s": "The luminosity of a star is proportional to the square of its radius and the fourth power of its surface temperature.",
    "answer": true,
    "why": "L = 4πR²σT⁴ gives exactly this dependence."
   },
   {
    "id": "space-L9-t22",
    "s": "A geostationary satellite must orbit above the equator with a period of 24 hours.",
    "answer": true,
    "why": "Geostationary requires equatorial, synchronous 24-hour orbit."
   },
   {
    "id": "space-L9-t23",
    "s": "The escape velocity from a body of mass M and radius R is √(GM/R).",
    "answer": false,
    "why": "It is √(2GM/R); the given expression is the circular orbital speed."
   },
   {
    "id": "space-L9-t24",
    "s": "Redshift is caused by light losing energy as it climbs out of a gravitational field only, never by motion.",
    "answer": false,
    "why": "Redshift also arises from recession (Doppler) and cosmological expansion."
   }
  ],
  "terms": [
   {
    "id": "space-L9-w1",
    "word": "CHANDRASEKHAR",
    "clue": "Mass limit near 1.4 solar masses for white dwarfs"
   },
   {
    "id": "space-L9-w2",
    "word": "HERTZSPRUNG",
    "clue": "Surname in the diagram plotting luminosity against temperature"
   },
   {
    "id": "space-L9-w3",
    "word": "REDSHIFT",
    "clue": "Increase in wavelength of light from receding sources"
   },
   {
    "id": "space-L9-w4",
    "word": "LUMINOSITY",
    "clue": "Total power radiated by a star per second"
   },
   {
    "id": "space-L9-w5",
    "word": "DEGENERACY",
    "clue": "Quantum pressure that supports white dwarfs and neutron stars"
   },
   {
    "id": "space-L9-w6",
    "word": "ANISOTROPY",
    "clue": "Small directional variation in the cosmic microwave background"
   },
   {
    "id": "space-L9-w7",
    "word": "SUPERNOVA",
    "clue": "Explosive end of certain stars, briefly outshining a galaxy"
   },
   {
    "id": "space-L9-w8",
    "word": "PARALLAX",
    "clue": "Apparent shift of a star caused by Earth's orbital motion"
   },
   {
    "id": "space-L9-w9",
    "word": "BLACKBODY",
    "clue": "Ideal emitter whose spectrum depends only on temperature."
   }
  ]
 },
 "10": {
  "questions": [
   {
    "id": "space-L10-q1",
    "q": "A photon from a distant quasar has redshift z = 2. Its observed wavelength compared with the emitted wavelength is:",
    "options": [
     "1.5 times as long",
     "twice as long",
     "unchanged",
     "three times as long",
     "one third as long"
    ],
    "answer": 3,
    "why": "1 + z = λobs/λem, so z = 2 gives λobs = 3λem.",
    "hint": "Redshift is defined by 1 + z, not by z alone."
   },
   {
    "id": "space-L10-q2",
    "q": "A white dwarf in a close binary accretes hydrogen-rich gas until its mass approaches the Chandrasekhar limit. The most likely outcome is:",
    "options": [
     "merger into a black hole without explosion",
     "a nova that leaves the white dwarf intact",
     "quiet expansion into a red giant",
     "core collapse to a neutron star",
     "a type Ia supernova"
    ],
    "answer": 4,
    "why": "A carbon–oxygen white dwarf pushed near 1.4 M☉ ignites carbon fusion and explodes as a type Ia supernova.",
    "hint": "Think of the standard candle used in cosmology."
   },
   {
    "id": "space-L10-q3",
    "q": "In the Schwarzschild metric, a clock at rest at radius r near a non-rotating black hole runs slow relative to infinity by a factor:",
    "options": [
     "√(1 − r_s/r)",
     "1 − r_s/r",
     "√(1 + r_s/r)",
     "(1 − r_s/r)²",
     "1/√(1 − r_s/r)"
    ],
    "answer": 0,
    "why": "Gravitational time dilation gives dτ/dt = √(1 − r_s/r).",
    "hint": "It is the square root of the g_tt component."
   },
   {
    "id": "space-L10-q4",
    "q": "The cosmic microwave background has temperature 2.725 K. Its present photon energy density is closest to:",
    "options": [
     "about 4 × 10⁻¹⁴ J m⁻³",
     "about 4 × 10⁻¹⁰ J m⁻³",
     "about 4 × 10⁻¹⁸ J m⁻³",
     "about 4 × 10⁻⁶ J m⁻³",
     "about 4 × 10⁻²⁰ J m⁻³"
    ],
    "answer": 0,
    "why": "aT⁴ with a = 7.57×10⁻¹⁶ J m⁻³ K⁻⁴ gives ≈ 4.2×10⁻¹⁴ J m⁻³.",
    "hint": "Use the radiation constant a times T⁴."
   },
   {
    "id": "space-L10-q5",
    "q": "For a Keplerian orbit, the vis-viva equation gives v² at distance r as:",
    "options": [
     "GM(2/a − 1/r)",
     "GM/r only",
     "GM(1/r − 1/a)",
     "GM(2/r − 1/a)",
     "2GM/r always"
    ],
    "answer": 3,
    "why": "Vis-viva is v² = GM(2/r − 1/a), reducing to GM/r for a circular orbit.",
    "hint": "It reduces to the circular speed when r = a."
   },
   {
    "id": "space-L10-q6",
    "q": "A photon emitted radially outward from just outside a black hole's event horizon is observed far away. Its observed frequency is:",
    "options": [
     "imaginary",
     "unchanged",
     "higher than emitted",
     "zero",
     "lower than emitted (gravitational redshift)"
    ],
    "answer": 4,
    "why": "Climbing out of a gravitational well redshifts the photon.",
    "hint": "Energy is lost escaping the potential well."
   },
   {
    "id": "space-L10-q7",
    "q": "The matter density parameter Ω_m and curvature Ω_k of the Universe satisfy (with Ω_Λ):",
    "options": [
     "Ω_m + Ω_k = 1 always",
     "Ω_k = Ω_m Ω_Λ",
     "Ω_m − Ω_Λ = Ω_k",
     "Ω_m + Ω_Λ = 0",
     "Ω_m + Ω_Λ + Ω_k = 1"
    ],
    "answer": 4,
    "why": "The Friedmann equation normalises the density parameters so they sum to one including curvature.",
    "hint": "It is a normalisation identity from the Friedmann equation."
   },
   {
    "id": "space-L10-q8",
    "q": "In a close binary, a white dwarf accretes hydrogen-rich gas until its mass approaches the Chandrasekhar limit. What is the expected outcome?",
    "options": [
     "A helium flash on the companion",
     "A core-collapse supernova leaving a neutron star",
     "A Type Ia supernova that disrupts the white dwarf",
     "A nova that leaves the white dwarf intact",
     "Silent collapse to a black hole"
    ],
    "answer": 2,
    "why": "Near the Chandrasekhar limit, carbon fusion ignites explosively, producing a Type Ia supernova that destroys the white dwarf.",
    "hint": "Think of the standard candle produced by accreting white dwarfs."
   },
   {
    "id": "space-L10-q9",
    "q": "A spacecraft in a circular orbit of radius r around Earth fires its engine prograde, raising its apogee to 2r while the burn point remains perigee. What is the new orbital eccentricity?",
    "options": [
     "2/3",
     "0.25",
     "1/3",
     "0.5",
     "1"
    ],
    "answer": 2,
    "why": "e = (ra − rp)/(ra + rp) = (2r − r)/(2r + r) = 1/3.",
    "hint": "Perigee stays at r and apogee becomes 2r."
   },
   {
    "id": "space-L10-q10",
    "q": "In a close binary, a white dwarf accretes hydrogen-rich gas until its mass approaches the Chandrasekhar limit. Which outcome is expected for a carbon–oxygen white dwarf?",
    "options": [
     "It collapses directly to a black hole without a visible explosion.",
     "It ignites carbon fusion and explodes as a type Ia supernova.",
     "It becomes a red giant and then a planetary nebula.",
     "It spins up to become a millisecond pulsar.",
     "It quietly cools as a heavier white dwarf."
    ],
    "answer": 1,
    "why": "Near the Chandrasekhar limit, compressional heating ignites carbon fusion, leading to a thermonuclear runaway and a type Ia supernova.",
    "hint": "Consider what happens when electron degeneracy pressure can no longer balance gravity."
   },
   {
    "id": "space-L10-q11",
    "q": "A photon emitted near the event horizon of a Schwarzschild black hole escapes to infinity. For an observer at infinity, how does its energy compare with that measured by a static observer just outside the horizon?",
    "options": [
     "It is lower by exactly a factor of two",
     "It is unchanged because light has no rest mass",
     "It is higher by the blueshift factor",
     "It depends only on the photon's frequency, not the hole's mass",
     "It is lower by the gravitational redshift factor"
    ],
    "answer": 4,
    "why": "Static observers at smaller radii measure larger proper frequencies; light climbing out is redshifted by sqrt(1−r_s/r), so the distant observer sees lower energy.",
    "hint": "Compare proper time rates of static observers at different radii."
   },
   {
    "id": "space-L10-q12",
    "q": "In the parametrised post-Newtonian formalism, the deflection of starlight grazing the Sun is 4GM/(c²b) in general relativity. A scalar-tensor theory with a Brans–Dicke parameter ω gives a deflection suppressed by the factor (1+ω)/(2+ω). As ω→∞, what deflection does the theory predict relative to GR?",
    "options": [
     "The same as GR",
     "Twice the GR value",
     "Zero",
     "Half the GR value",
     "A quarter of the GR value"
    ],
    "answer": 0,
    "why": "As ω→∞ the factor (1+ω)/(2+ω)→1, recovering the GR deflection; only finite ω suppresses it.",
    "hint": "Take the limit of the suppression factor as the coupling becomes arbitrarily weak."
   },
   {
    "id": "space-L10-q13",
    "q": "A rigid ring of circumference C rotates about its axis with tangential speed v as measured in the inertial frame. An observer on the ring measures its own circumference. According to the Ehrenfest paradox analysis in special relativity, what does the ring observer find?",
    "options": [
     "The measured circumference is less than C but greater than C·sqrt(1−v²/c²)",
     "The measured circumference exceeds C/(sqrt(1−v²/c²))",
     "The measured circumference equals C",
     "The measured circumference is C·sqrt(1−v²/c²)",
     "The ring cannot remain rigid, so no consistent measurement exists"
    ],
    "answer": 4,
    "why": "A rotating ring cannot stay Born-rigid: circumferential length contraction is incompatible with fixed proper radius, so no rigid rotating disk exists in SR.",
    "hint": "Consider whether all parts of the ring can share a single simultaneity slice."
   },
   {
    "id": "space-L10-q14",
    "q": "A photon emitted from the surface of a neutron star of mass 1.4 solar masses and radius 10 km is observed far away. Taking GM/c² ≈ 1.48 km for one solar mass, the fractional gravitational redshift Δλ/λ is closest to",
    "options": [
     "0.002",
     "0.83",
     "0.42",
     "0.02",
     "0.21"
    ],
    "answer": 4,
    "why": "Δλ/λ ≈ GM/(Rc²) = (1.4 × 1.48 km)/(10 km) ≈ 0.207, about 0.21.",
    "hint": "Use GM/(Rc²) with the given compactness of one solar mass."
   }
  ],
  "truths": [
   {
    "id": "space-L10-t1",
    "s": "A type Ia supernova arises from the thermonuclear explosion of a white dwarf near the Chandrasekhar mass.",
    "answer": true,
    "why": "This is the standard model for type Ia supernovae."
   },
   {
    "id": "space-L10-t2",
    "s": "The cosmic microwave background has a perfect blackbody spectrum with temperature about 2.7 K.",
    "answer": true,
    "why": "COBE confirmed a blackbody at 2.725 K."
   },
   {
    "id": "space-L10-t3",
    "s": "In general relativity, a clock deeper in a gravitational potential runs faster than one higher up.",
    "answer": false,
    "why": "Clocks deeper in the potential run slower, not faster."
   },
   {
    "id": "space-L10-t4",
    "s": "A geostationary satellite must orbit above the equator and have a period of one sidereal day.",
    "answer": true,
    "why": "Both conditions are required for it to appear fixed."
   },
   {
    "id": "space-L10-t5",
    "s": "For a circular orbit, doubling the orbital radius halves the orbital period.",
    "answer": false,
    "why": "Kepler's third law gives T ∝ r^(3/2), so the period rises by 2^1.5, not halves."
   },
   {
    "id": "space-L10-t6",
    "s": "The Chandrasekhar limit for a carbon–oxygen white dwarf is about 1.4 solar masses.",
    "answer": true,
    "why": "This is the standard value."
   },
   {
    "id": "space-L10-t7",
    "s": "Gravitational lensing by a galaxy can produce multiple images of a background quasar.",
    "answer": true,
    "why": "This is a well-observed consequence of lensing."
   },
   {
    "id": "space-L10-t8",
    "s": "In an elliptical orbit, a satellite moves fastest at apocentre.",
    "answer": false,
    "why": "It moves fastest at pericentre, per Kepler's second law."
   },
   {
    "id": "space-L10-t9",
    "s": "The Sun's core temperature is roughly 15 million kelvin.",
    "answer": true,
    "why": "Standard solar models give about 1.5×10⁷ K."
   },
   {
    "id": "space-L10-t10",
    "s": "Dark energy causes the expansion of the Universe to decelerate.",
    "answer": false,
    "why": "Dark energy accelerates the expansion."
   },
   {
    "id": "space-L10-t11",
    "s": "A black hole's event horizon radius is proportional to its mass.",
    "answer": true,
    "why": "r_s = 2GM/c² is linear in mass."
   },
   {
    "id": "space-L10-t12",
    "s": "The cosmic microwave background was emitted when the Universe was about 380 000 years old.",
    "answer": true,
    "why": "Recombination occurred at that epoch."
   },
   {
    "id": "space-L10-t13",
    "s": "Neutron stars are held against gravity mainly by electron degeneracy pressure.",
    "answer": false,
    "why": "They are supported mainly by neutron degeneracy pressure (and nuclear forces)."
   },
   {
    "id": "space-L10-t14",
    "s": "The equivalence principle states that locally, free fall is indistinguishable from being in an inertial frame.",
    "answer": true,
    "why": "This is the weak equivalence principle."
   },
   {
    "id": "space-L10-t15",
    "s": "Type Ia supernovae are useful standard candles because they arise from white dwarfs near the Chandrasekhar limit.",
    "answer": true,
    "why": "Their similar peak luminosities make them distance indicators."
   },
   {
    "id": "space-L10-t16",
    "s": "A white dwarf is supported against gravity by electron degeneracy pressure.",
    "answer": true,
    "why": "Electron degeneracy pressure balances gravity in white dwarfs."
   },
   {
    "id": "space-L10-t17",
    "s": "The Chandrasekhar limit for a white dwarf is about 1.4 solar masses.",
    "answer": true,
    "why": "The Chandrasekhar limit is approximately 1.4 M☉."
   },
   {
    "id": "space-L10-t18",
    "s": "The main-sequence lifetime of a star is proportional to its mass.",
    "answer": false,
    "why": "Lifetime scales roughly as M/L, which decreases with mass; it is not simply proportional to mass."
   },
   {
    "id": "space-L10-t19",
    "s": "For a main-sequence star, the mass–luminosity relation is approximately L ∝ M^3.5.",
    "answer": true,
    "why": "This is the standard empirical relation for main-sequence stars."
   },
   {
    "id": "space-L10-t20",
    "s": "A prograde burn at perigee raises apogee while leaving perigee at the burn point.",
    "answer": true,
    "why": "Increasing speed at perigee increases the semi-major axis and apogee."
   },
   {
    "id": "space-L10-t21",
    "s": "A white dwarf near the Chandrasekhar limit explodes as a Type Ia supernova after carbon fusion ignites in its degenerate core.",
    "answer": true,
    "why": "Degenerate carbon ignition leads to runaway thermonuclear explosion."
   },
   {
    "id": "space-L10-t22",
    "s": "For main-sequence stars, luminosity scales roughly as the square of mass.",
    "answer": false,
    "why": "The standard relation is closer to L ∝ M^3.5, not M²."
   },
   {
    "id": "space-L10-t23",
    "s": "In a close binary, a white dwarf that accretes matter and approaches the Chandrasekhar limit will always collapse directly to a black hole without any thermonuclear explosion.",
    "answer": false,
    "why": "A carbon–oxygen white dwarf near the limit can ignite carbon and explode as a type Ia supernova."
   }
  ],
  "terms": [
   {
    "id": "space-L10-w1",
    "word": "CHANDRASEKHAR",
    "clue": "Upper mass limit for a white dwarf, near 1.4 solar masses."
   },
   {
    "id": "space-L10-w2",
    "word": "INFLATION",
    "clue": "Brief early epoch of exponential expansion of the Universe."
   },
   {
    "id": "space-L10-w3",
    "word": "DEGENERACY",
    "clue": "Quantum pressure supporting white dwarfs and neutron stars."
   },
   {
    "id": "space-L10-w4",
    "word": "SCHWARZSCHILD",
    "clue": "First exact solution of Einstein's field equations, describing a non-rotating black hole"
   }
  ]
 }
};
