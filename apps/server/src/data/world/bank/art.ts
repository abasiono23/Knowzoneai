// Written by scripts/world-content.ts (writer deepseek-v4.1-flash-1017, checker qwen3.8-27b, auditor glm-5.3-flash). Don't edit by hand.
import type { WorldBank } from '../types.js';

export const ART_BANK: WorldBank = {
 "1": {
  "questions": [
   {
    "id": "art-L1-q1",
    "q": "Which colour do you get by mixing red and yellow paint?",
    "options": [
     "Green",
     "Brown",
     "Orange",
     "Purple"
    ],
    "answer": 2,
    "why": "Red and yellow are both warm colours and mix to make orange, a secondary colour.",
    "hint": "Think of the colour of a carrot or a pumpkin."
   },
   {
    "id": "art-L1-q2",
    "q": "What is the name for the lightness or darkness of a colour?",
    "options": [
     "Hue",
     "Value",
     "Texture",
     "Pattern"
    ],
    "answer": 1,
    "why": "Value describes how light or dark a colour is, from white to black.",
    "hint": "It is also a word used for the worth of money."
   },
   {
    "id": "art-L1-q3",
    "q": "Which of these is a primary colour in painting?",
    "options": [
     "Purple",
     "Green",
     "Orange",
     "Blue"
    ],
    "answer": 3,
    "why": "The primary colours in paint are red, yellow and blue; the others are made by mixing.",
    "hint": "It is the colour of a clear daytime sky."
   },
   {
    "id": "art-L1-q4",
    "q": "A painting of a bowl of fruit on a table is called a what?",
    "options": [
     "Portrait",
     "Landscape",
     "Still life",
     "Seascape"
    ],
    "answer": 2,
    "why": "A still life shows objects such as fruit, flowers or bowls, not people or scenery.",
    "hint": "The objects do not move."
   },
   {
    "id": "art-L1-q5",
    "q": "Who painted the 'Mona Lisa'?",
    "options": [
     "Claude Monet",
     "Leonardo da Vinci",
     "Vincent van Gogh",
     "Pablo Picasso"
    ],
    "answer": 1,
    "why": "Leonardo da Vinci painted the 'Mona Lisa', which hangs in the Louvre in Paris.",
    "hint": "He also drew designs for flying machines."
   },
   {
    "id": "art-L1-q6",
    "q": "Which artist is famous for cutting off part of his own ear?",
    "options": [
     "Rembrandt",
     "Michelangelo",
     "Vincent van Gogh",
     "Andy Warhol"
    ],
    "answer": 2,
    "why": "Vincent van Gogh is famous for his swirling paintings and for cutting off part of his ear.",
    "hint": "He painted 'Sunflowers' and 'The Starry Night'."
   },
   {
    "id": "art-L1-q7",
    "q": "What do we call a very tall building with many floors?",
    "options": [
     "Skyscraper",
     "Tunnel",
     "Castle",
     "Cottage"
    ],
    "answer": 0,
    "why": "A skyscraper is a very tall building, usually found in big cities.",
    "hint": "The name suggests it scrapes the sky."
   },
   {
    "id": "art-L1-q8",
    "q": "In music, what is a group of notes played together called?",
    "options": [
     "A tempo",
     "A rhythm",
     "A melody",
     "A chord"
    ],
    "answer": 3,
    "why": "A chord is two or more notes sounded together, often three notes.",
    "hint": "Guitar players often learn these shapes first."
   },
   {
    "id": "art-L1-q9",
    "q": "Which instrument has black and white keys and is played by pressing them?",
    "options": [
     "Violin",
     "Flute",
     "Piano",
     "Drum"
    ],
    "answer": 2,
    "why": "The piano has a keyboard of black and white keys that you press to make sounds.",
    "hint": "It is often found in a living room or a concert hall."
   },
   {
    "id": "art-L1-q10",
    "q": "What does 'tempo' mean in music?",
    "options": [
     "How long to practise",
     "How high to sing",
     "How fast to play",
     "How loud to play"
    ],
    "answer": 2,
    "why": "Tempo is the speed of the music, such as fast or slow.",
    "hint": "It comes from an Italian word for time."
   },
   {
    "id": "art-L1-q11",
    "q": "Which of these is a string instrument?",
    "options": [
     "Guitar",
     "Trumpet",
     "Clarinet",
     "Tuba"
    ],
    "answer": 0,
    "why": "The guitar makes sound from vibrating strings, unlike the brass and woodwind options.",
    "hint": "It has a body, a neck and usually six strings."
   },
   {
    "id": "art-L1-q12",
    "q": "What is a photograph taken with a camera called?",
    "options": [
     "A sculpture",
     "A drawing",
     "A photograph",
     "A painting"
    ],
    "answer": 2,
    "why": "A camera uses light to record an image, and the result is a photograph.",
    "hint": "The word begins with 'photo', meaning light."
   },
   {
    "id": "art-L1-q13",
    "q": "Which shape is a circle?",
    "options": [
     "A shape with five sides",
     "A perfectly round shape",
     "A shape with four equal sides",
     "A shape with three straight sides"
    ],
    "answer": 1,
    "why": "A circle is a round shape where every point is the same distance from the centre.",
    "hint": "Think of a wheel or a coin."
   }
  ],
  "truths": [
   {
    "id": "art-L1-t1",
    "s": "Red, yellow and blue are the three primary colours in traditional painting.",
    "answer": true,
    "why": "Painters mix these three to make the other colours."
   },
   {
    "id": "art-L1-t2",
    "s": "The 'Mona Lisa' was painted by Vincent van Gogh.",
    "answer": false,
    "why": "It was painted by Leonardo da Vinci, not van Gogh."
   },
   {
    "id": "art-L1-t3",
    "s": "A sculpture is a three-dimensional work of art.",
    "answer": true,
    "why": "Sculptures have height, width and depth, unlike flat paintings."
   },
   {
    "id": "art-L1-t4",
    "s": "In music, a very fast piece has a slow tempo.",
    "answer": false,
    "why": "Tempo means speed, so a fast piece has a fast tempo."
   },
   {
    "id": "art-L1-t5",
    "s": "The piano is a keyboard instrument.",
    "answer": true,
    "why": "It is played by pressing black and white keys."
   },
   {
    "id": "art-L1-t6",
    "s": "Black and white are the only colours in a rainbow.",
    "answer": false,
    "why": "A rainbow shows many colours, including red, orange, yellow, green, blue and violet."
   },
   {
    "id": "art-L1-t7",
    "s": "A photographer uses a camera to take pictures.",
    "answer": true,
    "why": "The camera records light to make a photograph."
   },
   {
    "id": "art-L1-t8",
    "s": "The violin is a percussion instrument.",
    "answer": false,
    "why": "The violin is a string instrument; percussion instruments are hit or shaken."
   },
   {
    "id": "art-L1-t9",
    "s": "Mixing blue and yellow paint makes green.",
    "answer": true,
    "why": "Blue and yellow are the two colours that combine to make green."
   },
   {
    "id": "art-L1-t10",
    "s": "A portrait usually shows a landscape or scenery.",
    "answer": false,
    "why": "A portrait shows a person; a landscape shows scenery."
   },
   {
    "id": "art-L1-t11",
    "s": "Architecture is the art of designing buildings.",
    "answer": true,
    "why": "Architects plan and design buildings and other structures."
   },
   {
    "id": "art-L1-t12",
    "s": "A chord is a single note played on its own.",
    "answer": false,
    "why": "A chord is two or more notes played together, not a single note."
   },
   {
    "id": "art-L1-t13",
    "s": "The word 'typography' is about the design of letters and text.",
    "answer": true,
    "why": "Typography deals with fonts, letter shapes and how text looks on a page."
   },
   {
    "id": "art-L1-t14",
    "s": "Orange is a primary colour.",
    "answer": false,
    "why": "Orange is a secondary colour made by mixing red and yellow."
   },
   {
    "id": "art-L1-t15",
    "s": "A drum is usually played by striking it.",
    "answer": true,
    "why": "Drums are percussion instruments hit with sticks or hands."
   },
   {
    "id": "art-L1-t16",
    "s": "Pablo Picasso was a famous photographer who never painted.",
    "answer": false,
    "why": "Picasso was a famous painter and sculptor, not mainly a photographer."
   },
   {
    "id": "art-L1-t17",
    "s": "Pattern is a design principle that repeats shapes or lines.",
    "answer": true,
    "why": "Patterns repeat elements such as shapes, colours or lines."
   },
   {
    "id": "art-L1-t18",
    "s": "A melody is the same thing as a chord.",
    "answer": false,
    "why": "A melody is a line of single notes in turn; a chord is notes played together."
   }
  ],
  "terms": [
   {
    "id": "art-L1-w1",
    "word": "COLOUR",
    "clue": "What we see when light reflects off an object, such as red or blue."
   },
   {
    "id": "art-L1-w2",
    "word": "CANVAS",
    "clue": "Strong cloth that artists paint on, stretched over a frame."
   },
   {
    "id": "art-L1-w3",
    "word": "MELODY",
    "clue": "A tune made of notes played one after another."
   },
   {
    "id": "art-L1-w4",
    "word": "RHYTHM",
    "clue": "The pattern of long and short sounds in music."
   },
   {
    "id": "art-L1-w5",
    "word": "CAMERA",
    "clue": "A device that records light to make photographs."
   },
   {
    "id": "art-L1-w6",
    "word": "BRIDGE",
    "clue": "A structure built to carry a road or path over a river."
   },
   {
    "id": "art-L1-w7",
    "word": "SHAPE",
    "clue": "The outline or form of something, like a square or circle."
   },
   {
    "id": "art-L1-w8",
    "word": "SCALE",
    "clue": "A set of musical notes arranged in rising or falling order."
   },
   {
    "id": "art-L1-w9",
    "word": "FONT",
    "clue": "A particular design and style of printed letters."
   }
  ]
 },
 "2": {
  "questions": [
   {
    "id": "art-L2-q1",
    "q": "Which colour is made by mixing blue and yellow paint?",
    "options": [
     "Orange",
     "Purple",
     "Brown",
     "Green"
    ],
    "answer": 3,
    "why": "Blue and yellow are both primary colours, and mixing them makes green.",
    "hint": "Think of the colour of grass and leaves."
   },
   {
    "id": "art-L2-q2",
    "q": "What is the name for the way a surface feels, or how it looks as if it would feel?",
    "options": [
     "Pattern",
     "Form",
     "Texture",
     "Shape"
    ],
    "answer": 2,
    "why": "Texture describes surface quality, such as rough, smooth or bumpy.",
    "hint": "It is one of the elements of design, along with line and colour."
   },
   {
    "id": "art-L2-q3",
    "q": "Which art movement is famous for paintings made of small dabs of pure colour, such as those by Claude Monet?",
    "options": [
     "Impressionism",
     "Cubism",
     "Surrealism",
     "Baroque"
    ],
    "answer": 0,
    "why": "Impressionist painters used short brushstrokes of pure colour to capture light and atmosphere.",
    "hint": "The name comes from a painting called 'Impression, Sunrise'."
   },
   {
    "id": "art-L2-q4",
    "q": "In music, what do we call the steady pulse that runs through a piece?",
    "options": [
     "Scale",
     "Beat",
     "Chord",
     "Pitch"
    ],
    "answer": 1,
    "why": "The beat is the regular pulse you can tap your foot to.",
    "hint": "You might clap along to it."
   },
   {
    "id": "art-L2-q5",
    "q": "Which of these is a woodwind instrument?",
    "options": [
     "Violin",
     "Drum",
     "Trumpet",
     "Flute"
    ],
    "answer": 3,
    "why": "The flute is a woodwind instrument, played by blowing air across or into it.",
    "hint": "It is often made of metal today but belongs to the woodwind family."
   },
   {
    "id": "art-L2-q6",
    "q": "What is a quick drawing that captures the main idea of a subject called?",
    "options": [
     "Collage",
     "Portrait",
     "Mural",
     "Sketch"
    ],
    "answer": 3,
    "why": "A sketch is a rough, quick drawing used to plan or record an idea.",
    "hint": "Artists often make several before a finished painting."
   },
   {
    "id": "art-L2-q7",
    "q": "Which design principle describes the arrangement of parts so that one area draws more attention than others?",
    "options": [
     "Emphasis",
     "Balance",
     "Rhythm",
     "Proportion"
    ],
    "answer": 0,
    "why": "Emphasis makes a focal point stand out in a design or artwork.",
    "hint": "It is about what your eye goes to first."
   },
   {
    "id": "art-L2-q8",
    "q": "Who composed the 'Moonlight Sonata'?",
    "options": [
     "Ludwig van Beethoven",
     "Wolfgang Amadeus Mozart",
     "Johann Sebastian Bach",
     "Franz Schubert"
    ],
    "answer": 0,
    "why": "Beethoven wrote the 'Moonlight Sonata', his Piano Sonata No. 14.",
    "hint": "He continued composing even after losing his hearing."
   },
   {
    "id": "art-L2-q9",
    "q": "What is the name for the family of letters and characters used in printing and design, such as Arial or Times New Roman?",
    "options": [
     "Template",
     "Typeface",
     "Layout",
     "Grid"
    ],
    "answer": 1,
    "why": "A typeface is a particular design of letters, numbers and symbols.",
    "hint": "It is central to typography."
   },
   {
    "id": "art-L2-q10",
    "q": "In music, what is a sequence of notes moving mostly by step, going up or down, called?",
    "options": [
     "Scale",
     "Chord",
     "Harmony",
     "Rhythm"
    ],
    "answer": 0,
    "why": "A scale is an ordered set of notes, usually moving step by step.",
    "hint": "Singers practise them to warm up."
   },
   {
    "id": "art-L2-q11",
    "q": "Which of these is a primary colour of light?",
    "options": [
     "Yellow",
     "Purple",
     "Red",
     "Green"
    ],
    "answer": 2,
    "why": "The primary colours of light are red, green and blue.",
    "hint": "Think of the colours used in a television screen."
   },
   {
    "id": "art-L2-q12",
    "q": "What do we call a building designed for Muslim worship?",
    "options": [
     "Synagogue",
     "Cathedral",
     "Temple",
     "Mosque"
    ],
    "answer": 3,
    "why": "A mosque is a place of worship for Muslims, often with a dome and minarets.",
    "hint": "It often has a tall tower called a minaret."
   },
   {
    "id": "art-L2-q13",
    "q": "Which artist is famous for paintings of soup cans and other everyday objects in a style called Pop Art?",
    "options": [
     "Vincent van Gogh",
     "Leonardo da Vinci",
     "Pablo Picasso",
     "Andy Warhol"
    ],
    "answer": 3,
    "why": "Andy Warhol made Pop Art images of everyday objects and celebrities.",
    "hint": "He also made prints of Marilyn Monroe."
   }
  ],
  "truths": [
   {
    "id": "art-L2-t1",
    "s": "Orange is a secondary colour made by mixing red and yellow.",
    "answer": true,
    "why": "Red and yellow are primary colours, and their mixture is orange."
   },
   {
    "id": "art-L2-t2",
    "s": "A triangle has four sides.",
    "answer": false,
    "why": "A triangle has three sides; a four-sided shape is a quadrilateral."
   },
   {
    "id": "art-L2-t3",
    "s": "In music, a higher pitch means a higher sound.",
    "answer": true,
    "why": "Pitch describes how high or low a sound is."
   },
   {
    "id": "art-L2-t4",
    "s": "A photograph is made by exposing light-sensitive material or a sensor to light.",
    "answer": true,
    "why": "Cameras record light to form an image."
   },
   {
    "id": "art-L2-t5",
    "s": "The 'Mona Lisa' was painted by Michelangelo.",
    "answer": false,
    "why": "The 'Mona Lisa' was painted by Leonardo da Vinci."
   },
   {
    "id": "art-L2-t6",
    "s": "A sculpture that stands freely and can be walked around is called freestanding.",
    "answer": true,
    "why": "Freestanding sculpture is not attached to a wall or background."
   },
   {
    "id": "art-L2-t7",
    "s": "In colour theory, black and white are hues.",
    "answer": false,
    "why": "Black and white are not hues; hues are the pure colours of the spectrum."
   },
   {
    "id": "art-L2-t8",
    "s": "A drum is a percussion instrument.",
    "answer": true,
    "why": "Percussion instruments are played by striking or shaking them."
   },
   {
    "id": "art-L2-t9",
    "s": "The violin is played by blowing into it.",
    "answer": false,
    "why": "The violin is a string instrument played with a bow or by plucking."
   },
   {
    "id": "art-L2-t10",
    "s": "A mosaic is a picture or pattern made from small pieces of stone, glass or tile.",
    "answer": true,
    "why": "Mosaics are assembled from many small pieces called tesserae."
   },
   {
    "id": "art-L2-t11",
    "s": "In design, 'symmetry' means the two halves of an image are exactly alike.",
    "answer": true,
    "why": "Symmetrical designs have matching halves around a central axis."
   },
   {
    "id": "art-L2-t12",
    "s": "An architect designs buildings.",
    "answer": true,
    "why": "Architects plan the form and structure of buildings."
   },
   {
    "id": "art-L2-t13",
    "s": "A concerto is a piece of music for a solo instrument with an orchestra.",
    "answer": true,
    "why": "A concerto features a soloist accompanied by an orchestra."
   },
   {
    "id": "art-L2-t14",
    "s": "Typography is the art of arranging type and text for reading and design.",
    "answer": true,
    "why": "Typography deals with the selection and layout of type."
   },
   {
    "id": "art-L2-t15",
    "s": "Watercolour paint is mixed with oil.",
    "answer": false,
    "why": "Watercolour paint is mixed with water; oil paint is mixed with oil."
   },
   {
    "id": "art-L2-t16",
    "s": "The primary colours in painting are red, blue and yellow.",
    "answer": true,
    "why": "Traditional painting uses red, blue and yellow as primary colours."
   },
   {
    "id": "art-L2-t17",
    "s": "A portrait is a picture of a landscape.",
    "answer": false,
    "why": "A portrait shows a person or people; a landscape shows scenery."
   },
   {
    "id": "art-L2-t18",
    "s": "A choir is a group of people who sing together.",
    "answer": true,
    "why": "A choir is an organised group of singers."
   }
  ],
  "terms": [
   {
    "id": "art-L2-w1",
    "word": "CANVAS",
    "clue": "Strong cloth on which an artist paints"
   },
   {
    "id": "art-L2-w2",
    "word": "MELODY",
    "clue": "A tune made of notes in sequence"
   },
   {
    "id": "art-L2-w3",
    "word": "PENCIL",
    "clue": "Tool for drawing, often with a graphite core"
   },
   {
    "id": "art-L2-w4",
    "word": "RHYTHM",
    "clue": "Pattern of sounds and silences in time"
   },
   {
    "id": "art-L2-w5",
    "word": "STUDIO",
    "clue": "Room where an artist works"
   },
   {
    "id": "art-L2-w6",
    "word": "TEMPO",
    "clue": "Speed at which a piece of music is played"
   },
   {
    "id": "art-L2-w7",
    "word": "COLLAGE",
    "clue": "Picture made by gluing paper or objects"
   },
   {
    "id": "art-L2-w8",
    "word": "MUSEUM",
    "clue": "Place where artworks are kept and shown"
   },
   {
    "id": "art-L2-w9",
    "word": "OPERAS",
    "clue": "Dramatic works that are sung with orchestra"
   }
  ]
 },
 "3": {
  "questions": [
   {
    "id": "art-L3-q1",
    "q": "Which design principle is about the size relationship between different parts of a design?",
    "options": [
     "Contrast",
     "Balance",
     "Scale",
     "Rhythm"
    ],
    "answer": 2,
    "why": "Scale describes how the sizes of elements relate to one another.",
    "hint": "It is not about light and dark, but about big and small."
   },
   {
    "id": "art-L3-q2",
    "q": "Which art movement of the early 20th century was founded by Pablo Picasso and Georges Braque?",
    "options": [
     "Impressionism",
     "Surrealism",
     "Expressionism",
     "Cubism"
    ],
    "answer": 3,
    "why": "Cubism broke objects into geometric shapes and showed several viewpoints at once.",
    "hint": "The name suggests shapes like cubes."
   },
   {
    "id": "art-L3-q3",
    "q": "Who painted 'The Persistence of Memory', with its melting clocks?",
    "options": [
     "Salvador Dalí",
     "Vincent van Gogh",
     "Frida Kahlo",
     "Claude Monet"
    ],
    "answer": 0,
    "why": "Dalí, a Surrealist, painted this famous dreamlike work.",
    "hint": "This Spanish artist is linked with Surrealism."
   },
   {
    "id": "art-L3-q4",
    "q": "In music, what do we call the speed at which a piece is played?",
    "options": [
     "Tempo",
     "Timbre",
     "Dynamics",
     "Pitch"
    ],
    "answer": 0,
    "why": "Tempo is the speed of the music, often shown by terms such as allegro or adagio.",
    "hint": "It is not loudness or highness, but how fast."
   },
   {
    "id": "art-L3-q5",
    "q": "How many lines make up a standard musical staff?",
    "options": [
     "Four",
     "Five",
     "Six",
     "Seven"
    ],
    "answer": 1,
    "why": "The staff has five lines and four spaces between them.",
    "hint": "Count the lines in a typical piece of sheet music."
   },
   {
    "id": "art-L3-q6",
    "q": "Which family of instruments does the trumpet belong to?",
    "options": [
     "Percussion",
     "Woodwind",
     "String",
     "Brass"
    ],
    "answer": 3,
    "why": "The trumpet is made of brass and played by buzzing the lips into a mouthpiece.",
    "hint": "It is made of metal and has valves."
   },
   {
    "id": "art-L3-q7",
    "q": "In photography, what does the aperture of a lens control?",
    "options": [
     "The shutter speed",
     "The focus distance",
     "The amount of light entering",
     "The colour of the photo"
    ],
    "answer": 2,
    "why": "Aperture is the opening size, which controls how much light reaches the sensor or film.",
    "hint": "Think of the pupil of an eye opening wider or narrower."
   },
   {
    "id": "art-L3-q8",
    "q": "In typography, what is the name for the small line at the end of a stroke on a letter?",
    "options": [
     "Kerning",
     "Baseline",
     "Leading",
     "Serif"
    ],
    "answer": 3,
    "why": "A serif is the small finishing stroke; fonts without them are called sans-serif.",
    "hint": "It gives letters a traditional, formal look."
   },
   {
    "id": "art-L3-q9",
    "q": "Which of these is a cool colour?",
    "options": [
     "Red",
     "Orange",
     "Blue",
     "Yellow"
    ],
    "answer": 2,
    "why": "Blue and green are cool colours, while red, orange and yellow are warm.",
    "hint": "Think of the colour of ice and water."
   },
   {
    "id": "art-L3-q10",
    "q": "Which artist is famous for large paintings of flowers and skyscrapers and is associated with American modernism?",
    "options": [
     "Katsushika Hokusai",
     "Georgia O'Keeffe",
     "Pablo Picasso",
     "Henri Matisse"
    ],
    "answer": 1,
    "why": "O'Keeffe is known for magnified flowers and desert landscapes.",
    "hint": "This American painter made flowers look huge."
   },
   {
    "id": "art-L3-q11",
    "q": "In music, what is a chord made of three notes called?",
    "options": [
     "Interval",
     "Octave",
     "Triad",
     "Scale"
    ],
    "answer": 2,
    "why": "A triad is a three-note chord, usually built from stacked thirds.",
    "hint": "The name comes from the prefix meaning three."
   }
  ],
  "truths": [
   {
    "id": "art-L3-t1",
    "s": "Yellow and blue paint mix to make green.",
    "answer": true,
    "why": "Yellow and blue are primary colours in painting, and their mixture is a secondary colour, green."
   },
   {
    "id": "art-L3-t2",
    "s": "The colour wheel shows that orange is opposite blue.",
    "answer": true,
    "why": "Orange and blue are complementary colours and sit opposite each other on the wheel."
   },
   {
    "id": "art-L3-t3",
    "s": "In design, contrast means making all elements look exactly the same.",
    "answer": false,
    "why": "Contrast means creating differences, such as light against dark, to make parts stand out."
   },
   {
    "id": "art-L3-t4",
    "s": "The Bauhaus was a German school of art and design founded in 1919.",
    "answer": true,
    "why": "The Bauhaus combined craft and design and had a lasting influence on modern design."
   },
   {
    "id": "art-L3-t5",
    "s": "Impressionist painters aimed to show precise, sharp outlines and smooth surfaces.",
    "answer": false,
    "why": "Impressionists used loose brushstrokes and emphasised light and atmosphere rather than sharp detail."
   },
   {
    "id": "art-L3-t6",
    "s": "A photograph taken with a very short shutter speed can freeze fast movement.",
    "answer": true,
    "why": "Short shutter speeds capture a brief moment, so moving subjects appear sharp."
   },
   {
    "id": "art-L3-t7",
    "s": "In typography, 'leading' refers to the spacing between individual letters.",
    "answer": false,
    "why": "Leading is the space between lines of text; letter spacing is called tracking or kerning."
   },
   {
    "id": "art-L3-t8",
    "s": "The treble clef is also called the G clef.",
    "answer": true,
    "why": "The treble clef curls around the second line from the bottom, which is G."
   },
   {
    "id": "art-L3-t9",
    "s": "A concerto is a piece for a solo instrument with an orchestra.",
    "answer": true,
    "why": "A concerto features one or more soloists accompanied by an orchestra."
   },
   {
    "id": "art-L3-t10",
    "s": "In music, a major scale sounds the same as a minor scale.",
    "answer": false,
    "why": "Major and minor scales have different patterns of intervals and sound different."
   },
   {
    "id": "art-L3-t11",
    "s": "The Parthenon in Athens is a famous example of classical Greek architecture.",
    "answer": true,
    "why": "The Parthenon is a temple on the Acropolis built in the classical style."
   },
   {
    "id": "art-L3-t12",
    "s": "A mosaic is a picture made by pressing paint onto wet plaster.",
    "answer": false,
    "why": "A mosaic is made from small pieces of stone, glass or tile; painting on wet plaster is a fresco."
   },
   {
    "id": "art-L3-t13",
    "s": "Warm colours such as red and orange tend to appear to advance towards the viewer.",
    "answer": true,
    "why": "Warm colours usually seem closer, while cool colours seem to recede."
   },
   {
    "id": "art-L3-t14",
    "s": "The sitar is a percussion instrument from India.",
    "answer": false,
    "why": "The sitar is a stringed instrument, plucked like a lute or guitar."
   },
   {
    "id": "art-L3-t15",
    "s": "In photography, a wide aperture lets in more light than a narrow one.",
    "answer": true,
    "why": "A wider opening admits more light, which also reduces depth of field."
   },
   {
    "id": "art-L3-t16",
    "s": "Symmetrical balance means the two sides of a design are completely different.",
    "answer": false,
    "why": "Symmetrical balance means the two sides mirror each other."
   },
   {
    "id": "art-L3-t17",
    "s": "Beethoven composed nine symphonies.",
    "answer": true,
    "why": "Beethoven completed nine symphonies, the last being the Ninth with its 'Ode to Joy'."
   },
   {
    "id": "art-L3-t18",
    "s": "In graphic design, a logo is a short piece of music used in advertising.",
    "answer": false,
    "why": "A logo is a visual symbol or mark identifying a brand; a short piece of music is a jingle."
   }
  ],
  "terms": [
   {
    "id": "art-L3-w1",
    "word": "TEXTURE",
    "clue": "How a surface feels, or looks as if it would feel"
   },
   {
    "id": "art-L3-w2",
    "word": "RHYTHM",
    "clue": "Regular repetition that creates a sense of movement in design"
   },
   {
    "id": "art-L3-w3",
    "word": "FRESCO",
    "clue": "Painting done on wet plaster on a wall"
   },
   {
    "id": "art-L3-w4",
    "word": "SCALE",
    "clue": "The relative size of one part compared with another"
   },
   {
    "id": "art-L3-w5",
    "word": "PITCH",
    "clue": "How high or low a musical sound is"
   },
   {
    "id": "art-L3-w6",
    "word": "HARMONY",
    "clue": "Notes sounding together in a pleasing combination"
   },
   {
    "id": "art-L3-w7",
    "word": "SHUTTER",
    "clue": "Camera part that opens and closes to let in light"
   }
  ]
 },
 "4": {
  "questions": [
   {
    "id": "art-L4-q1",
    "q": "In colour theory, what is a tint made by adding white to a colour?",
    "options": [
     "A darker version of the colour",
     "A lighter version of the colour",
     "A duller, greyer colour",
     "A fully saturated colour"
    ],
    "answer": 1,
    "why": "Adding white lightens a colour, producing a tint; adding black produces a shade.",
    "hint": "Think about what white does to a colour's value."
   },
   {
    "id": "art-L4-q2",
    "q": "A designer places a small red square in a large empty white poster. Which principle is mainly at work?",
    "options": [
     "Balance",
     "Rhythm",
     "Contrast",
     "Proportion"
    ],
    "answer": 2,
    "why": "The strong difference between the small red shape and the large white field creates contrast.",
    "hint": "It is about difference between elements, not their size ratio."
   },
   {
    "id": "art-L4-q3",
    "q": "Which art movement, led by Salvador Dalí and René Magritte, painted dreamlike scenes with strange, impossible objects?",
    "options": [
     "Cubism",
     "Surrealism",
     "Futurism",
     "Impressionism"
    ],
    "answer": 1,
    "why": "Surrealism explored dreams and the unconscious, often with highly realistic but illogical scenes.",
    "hint": "It is linked to dreams and the unconscious mind."
   },
   {
    "id": "art-L4-q4",
    "q": "In music theory, what is the interval between two notes that are eight notes apart, such as C up to the next C?",
    "options": [
     "A semitone",
     "An octave",
     "A third",
     "A fifth"
    ],
    "answer": 1,
    "why": "An octave spans eight letter names, and the upper note has twice the frequency of the lower.",
    "hint": "It shares its name with a prefix meaning eight."
   },
   {
    "id": "art-L4-q5",
    "q": "Which architectural style, common in medieval Europe, is known for pointed arches, rib vaults and flying buttresses?",
    "options": [
     "Baroque",
     "Modernist",
     "Gothic",
     "Classical"
    ],
    "answer": 2,
    "why": "Pointed arches and flying buttresses are defining features of Gothic architecture, as at Chartres Cathedral.",
    "hint": "Think of the great medieval cathedrals of northern France."
   },
   {
    "id": "art-L4-q6",
    "q": "In photography, what does a fast shutter speed mainly do?",
    "options": [
     "Widens the angle of view",
     "Freezes moving subjects",
     "Blurs moving subjects",
     "Increases depth of field"
    ],
    "answer": 1,
    "why": "A short exposure time freezes motion, while a slow shutter speed records blur.",
    "hint": "Think about how long the sensor is exposed to light."
   },
   {
    "id": "art-L4-q7",
    "q": "Which typographic term describes the height of a capital letter measured from baseline to top?",
    "options": [
     "Cap height",
     "Point size",
     "Leading",
     "Kerning"
    ],
    "answer": 0,
    "why": "Cap height is the height of uppercase letters; leading is line spacing and kerning is space between letters.",
    "hint": "The name refers to uppercase letters."
   },
   {
    "id": "art-L4-q8",
    "q": "In music, what does a triad consist of?",
    "options": [
     "Two notes played alternately",
     "Three notes built in thirds",
     "Four notes of equal pitch",
     "A scale of five notes"
    ],
    "answer": 1,
    "why": "A triad is a three-note chord built from a root, a third and a fifth.",
    "hint": "Its name comes from the Greek word for three."
   },
   {
    "id": "art-L4-q9",
    "q": "Which design principle concerns the visual path the eye follows through a composition?",
    "options": [
     "Movement",
     "Unity",
     "Pattern",
     "Emphasis"
    ],
    "answer": 0,
    "why": "Movement describes how the eye is guided through a design by lines, shapes and repetition.",
    "hint": "It shares its name with the act of going from place to place."
   },
   {
    "id": "art-L4-q10",
    "q": "Who composed the orchestral work 'The Planets', including the movement 'Mars, the Bringer of War'?",
    "options": [
     "Igor Stravinsky",
     "Edward Elgar",
     "Gustav Holst",
     "Claude Debussy"
    ],
    "answer": 2,
    "why": "Gustav Holst composed 'The Planets' between 1914 and 1916.",
    "hint": "The composer was English and wrote a suite about the solar system."
   },
   {
    "id": "art-L4-q11",
    "q": "Which colour model is used for mixing light in screens and projectors?",
    "options": [
     "HSV",
     "RYB",
     "CMYK",
     "RGB"
    ],
    "answer": 3,
    "why": "Screens mix red, green and blue light additively; CMYK is used for printed ink.",
    "hint": "Think of the three colours your television pixels use."
   },
   {
    "id": "art-L4-q12",
    "q": "In graphic design, what is a logo that combines a symbol with the company name called?",
    "options": [
     "An emblem",
     "A wordmark",
     "A combination mark",
     "A lettermark"
    ],
    "answer": 2,
    "why": "A combination mark pairs a pictorial symbol with text, unlike a wordmark or lettermark.",
    "hint": "The name suggests two elements joined together."
   },
   {
    "id": "art-L4-q13",
    "q": "Which twentieth-century movement, associated with Piet Mondrian, reduced art to straight lines and primary colours?",
    "options": [
     "Pop Art",
     "Art Deco",
     "Bauhaus",
     "De Stijl"
    ],
    "answer": 3,
    "why": "De Stijl, founded in the Netherlands, used rectangular grids and primary colours, as in Mondrian's paintings.",
    "hint": "The movement's name is Dutch for 'the style'."
   }
  ],
  "truths": [
   {
    "id": "art-L4-t1",
    "s": "In subtractive colour mixing with paint, mixing all three primary colours gives black or a dark neutral.",
    "answer": true,
    "why": "Subtractive primaries absorb light, so combining them removes most reflected colour."
   },
   {
    "id": "art-L4-t2",
    "s": "Leonardo da Vinci painted 'The Scream'.",
    "answer": false,
    "why": "'The Scream' was painted by Edvard Munch, not Leonardo da Vinci."
   },
   {
    "id": "art-L4-t3",
    "s": "The treble clef is also known as the G clef because it curls around the line for G.",
    "answer": true,
    "why": "The spiral of the treble clef circles the second line from the bottom, which is G."
   },
   {
    "id": "art-L4-t4",
    "s": "In music, a higher number on a metronome marking means a slower tempo.",
    "answer": false,
    "why": "A higher metronome number means more beats per minute, so a faster tempo."
   },
   {
    "id": "art-L4-t5",
    "s": "The Parthenon in Athens is a famous example of ancient Greek architecture.",
    "answer": true,
    "why": "The Parthenon, built on the Acropolis, is a classical Greek temple."
   },
   {
    "id": "art-L4-t6",
    "s": "In photography, a smaller f-number such as f/2 gives a larger lens opening.",
    "answer": true,
    "why": "The f-number is a fraction, so f/2 is a wider aperture than f/16."
   },
   {
    "id": "art-L4-t7",
    "s": "Serif typefaces have no small strokes at the ends of letters.",
    "answer": false,
    "why": "Serif typefaces do have small finishing strokes; sans-serif faces lack them."
   },
   {
    "id": "art-L4-t8",
    "s": "The artist Frida Kahlo was born in Mexico.",
    "answer": true,
    "why": "Frida Kahlo was born in Coyoacán, Mexico City, in 1907."
   },
   {
    "id": "art-L4-t9",
    "s": "In music theory, a major scale contains three semitones between its first and second notes.",
    "answer": false,
    "why": "The first step of a major scale is a whole tone, which is two semitones."
   },
   {
    "id": "art-L4-t10",
    "s": "Complementary colours sit opposite each other on the colour wheel.",
    "answer": true,
    "why": "Complementary colours are directly opposite, such as red and green."
   },
   {
    "id": "art-L4-t11",
    "s": "The Sydney Opera House was designed by Frank Lloyd Wright.",
    "answer": false,
    "why": "It was designed by the Danish architect Jørn Utzon, not Frank Lloyd Wright."
   },
   {
    "id": "art-L4-t12",
    "s": "A bass clef is also called the F clef.",
    "answer": true,
    "why": "The bass clef's two dots surround the line for F."
   },
   {
    "id": "art-L4-t13",
    "s": "Pop Art artists often took imagery from comic strips, advertising and mass-produced goods.",
    "answer": true,
    "why": "Pop Art drew on popular and commercial culture, as in Andy Warhol's soup cans."
   },
   {
    "id": "art-L4-t14",
    "s": "In design, symmetrical balance means the two halves of a composition are completely different.",
    "answer": false,
    "why": "Symmetrical balance means the halves mirror each other; different halves suggest asymmetry."
   },
   {
    "id": "art-L4-t15",
    "s": "A photograph taken with a very long exposure can make moving water look smooth and blurred.",
    "answer": true,
    "why": "Long exposures record motion over time, softening the appearance of moving water."
   },
   {
    "id": "art-L4-t16",
    "s": "The composer Wolfgang Amadeus Mozart was born in Vienna.",
    "answer": false,
    "why": "Mozart was born in Salzburg, Austria, though he later lived and worked in Vienna."
   },
   {
    "id": "art-L4-t17",
    "s": "In typography, leading refers to the vertical space between lines of text.",
    "answer": true,
    "why": "Leading is the line spacing, traditionally set with strips of lead."
   },
   {
    "id": "art-L4-t18",
    "s": "The Bauhaus school was founded in Paris in 1919.",
    "answer": false,
    "why": "The Bauhaus was founded in Weimar, Germany, in 1919, not in Paris."
   }
  ],
  "terms": [
   {
    "id": "art-L4-w1",
    "word": "SATURATION",
    "clue": "The purity or intensity of a colour, from vivid to greyish."
   },
   {
    "id": "art-L4-w2",
    "word": "PERSPECTIVE",
    "clue": "Technique for showing depth on a flat surface using converging lines."
   },
   {
    "id": "art-L4-w3",
    "word": "SYMMETRY",
    "clue": "Balance in which one side mirrors the other across an axis."
   },
   {
    "id": "art-L4-w4",
    "word": "EXPOSURE",
    "clue": "The amount of light reaching a camera sensor during a shot."
   },
   {
    "id": "art-L4-w5",
    "word": "HARMONY",
    "clue": "Combination of notes sounded together that is pleasing to the ear."
   },
   {
    "id": "art-L4-w6",
    "word": "BAROQUE",
    "clue": "Ornate European style of the seventeenth century, seen in Bernini's sculpture."
   },
   {
    "id": "art-L4-w7",
    "word": "MOSAIC",
    "clue": "Picture or pattern made from small pieces of stone, glass or tile."
   },
   {
    "id": "art-L4-w8",
    "word": "TEMPO",
    "clue": "The speed at which a piece of music is performed."
   },
   {
    "id": "art-L4-w9",
    "word": "GOUACHE",
    "clue": "Opaque water-based paint with gum arabic, often used in illustration."
   }
  ]
 },
 "5": {
  "questions": [
   {
    "id": "art-L5-q1",
    "q": "A photographer wants a blurred background behind a sharp portrait subject. Which change helps most?",
    "options": [
     "A smaller aperture (higher f-number)",
     "A lower ISO setting",
     "A larger aperture (lower f-number)",
     "A faster shutter speed"
    ],
    "answer": 2,
    "why": "A wider aperture reduces depth of field, blurring the background.",
    "hint": "Depth of field depends mainly on the size of the lens opening."
   },
   {
    "id": "art-L5-q2",
    "q": "In typography, what does 'leading' refer to?",
    "options": [
     "The space between letters",
     "The alignment of text to a margin",
     "The vertical space between lines of text",
     "The thickness of a letter's strokes"
    ],
    "answer": 2,
    "why": "Leading is the line spacing; letter spacing is called tracking or kerning.",
    "hint": "It is named after strips of metal once placed between rows of type."
   },
   {
    "id": "art-L5-q3",
    "q": "Which architectural feature is characteristic of Gothic cathedrals but not of Romanesque ones?",
    "options": [
     "Thick stone walls",
     "Flying buttresses",
     "Small windows",
     "Round arches"
    ],
    "answer": 1,
    "why": "Flying buttresses allowed taller walls and larger windows, a Gothic innovation.",
    "hint": "Think of the external supports that hold up high walls."
   },
   {
    "id": "art-L5-q4",
    "q": "Which statement about a major triad is correct?",
    "options": [
     "It has a major third and a perfect fifth above the root",
     "It has a perfect fourth and a major sixth above the root",
     "It has a minor third and a diminished fifth above the root",
     "It has two major thirds stacked"
    ],
    "answer": 0,
    "why": "A major triad stacks a major third and then a minor third, giving a perfect fifth above the root.",
    "hint": "Build it in thirds from the root note."
   },
   {
    "id": "art-L5-q5",
    "q": "Which art movement is associated with the idea of the 'readymade', such as a urinal exhibited as art?",
    "options": [
     "Futurism",
     "Dada",
     "Realism",
     "Impressionism"
    ],
    "answer": 1,
    "why": "Marcel Duchamp's readymades were a Dada strategy challenging what counts as art.",
    "hint": "It was an anti-art movement born during the First World War."
   },
   {
    "id": "art-L5-q6",
    "q": "Which principle of design is chiefly concerned with differences in size between elements to create interest?",
    "options": [
     "Rhythm",
     "Proximity",
     "Contrast of scale",
     "Symmetry"
    ],
    "answer": 2,
    "why": "Contrast of scale uses size differences; rhythm concerns repeated movement.",
    "hint": "It is about big versus small."
   },
   {
    "id": "art-L5-q7",
    "q": "Who composed the 'Brandenburg Concertos'?",
    "options": [
     "George Frideric Handel",
     "Antonio Vivaldi",
     "Johann Sebastian Bach",
     "Wolfgang Amadeus Mozart"
    ],
    "answer": 2,
    "why": "Bach composed the six Brandenburg Concertos around 1721.",
    "hint": "The composer was a German who worked in Leipzig."
   },
   {
    "id": "art-L5-q8",
    "q": "Which twentieth-century artist is known for 'cut-outs', large works made from painted paper shapes?",
    "options": [
     "Pablo Picasso",
     "Henri Matisse",
     "Georgia O'Keeffe",
     "Jackson Pollock"
    ],
    "answer": 1,
    "why": "Matisse turned to paper cut-outs in his later years, such as 'The Snail'.",
    "hint": "The artist was French and also famous as a Fauvist painter."
   },
   {
    "id": "art-L5-q9",
    "q": "A printer mixes cyan ink with yellow ink. Which colour model is this process based on?",
    "options": [
     "HSL",
     "RGB",
     "Subtractive",
     "Additive"
    ],
    "answer": 2,
    "why": "Mixing inks and paints is subtractive: each pigment absorbs (subtracts) some wavelengths from white light. RGB is the additive model used for light on screens.",
    "hint": "Think about whether the mixture starts from white light or from darkness."
   },
   {
    "id": "art-L5-q10",
    "q": "Which musical term means that a piece should be played at a walking pace, faster than adagio but slower than allegro?",
    "options": [
     "Vivace",
     "Andante",
     "Presto",
     "Largo"
    ],
    "answer": 1,
    "why": "Andante literally means 'walking' and sits between adagio and allegro on the tempo scale; largo is very slow and presto very fast.",
    "hint": "The Italian word is related to walking."
   },
   {
    "id": "art-L5-q11",
    "q": "In photography, a lens set to f/16 compared with the same lens set to f/4 lets in how much light?",
    "options": [
     "Sixteen times as much",
     "Much less light",
     "Four times as much",
     "The same amount"
    ],
    "answer": 1,
    "why": "Each full f-stop halves the light, and f/4 to f/16 is four stops (4 to 5.6 to 8 to 11 to 16), so f/16 admits only 1/16 of the light of f/4.",
    "hint": "Count the full stops between the two settings."
   },
   {
    "id": "art-L5-q12",
    "q": "Which art movement of the 1960s took comic strips, advertising and everyday products as its subject matter, often using bold outlines and flat colour?",
    "options": [
     "Cubism",
     "Pop Art",
     "Op Art",
     "Fauvism"
    ],
    "answer": 1,
    "why": "Pop Art, associated with artists such as Andy Warhol and Roy Lichtenstein, drew directly on mass culture and commercial imagery. Op Art instead explored optical illusions.",
    "hint": "The name suggests popular culture."
   },
   {
    "id": "art-L5-q13",
    "q": "In typography, what is the name for the imaginary line on which the letters of a line of text sit?",
    "options": [
     "The ascender",
     "The cap height",
     "The baseline",
     "The x-height"
    ],
    "answer": 2,
    "why": "The baseline is the line on which most letters rest; x-height and cap height are measured from it.",
    "hint": "It is also a word used in surveying and in tennis."
   },
   {
    "id": "art-L5-q14",
    "q": "Which architectural movement of the early 20th century is associated with Walter Gropius and the Bauhaus?",
    "options": [
     "Art Nouveau",
     "Modernism",
     "Baroque",
     "Gothic Revival"
    ],
    "answer": 1,
    "why": "Gropius founded the Bauhaus in 1919, a key force in Modernist architecture with its emphasis on function and simple forms.",
    "hint": "It shares its name with a broad term for 'up-to-date' thinking."
   },
   {
    "id": "art-L5-q15",
    "q": "A photographer wants a blurred background behind a sharp portrait subject. Which change best achieves this?",
    "options": [
     "A larger aperture, such as f/2",
     "A smaller aperture, such as f/16",
     "A lower ISO setting",
     "A faster shutter speed"
    ],
    "answer": 0,
    "why": "A wide aperture (small f-number) gives a shallow depth of field, so the background goes out of focus.",
    "hint": "Remember that f-numbers work inversely to the size of the opening."
   }
  ],
  "truths": [
   {
    "id": "art-L5-t1",
    "s": "In subtractive colour mixing with paint, mixing all three primary colours together tends towards black or a dark neutral.",
    "answer": true,
    "why": "Subtractive primaries absorb light, so mixing them all removes most reflected colour."
   },
   {
    "id": "art-L5-t2",
    "s": "A colour's 'value' refers to how saturated or intense it is.",
    "answer": false,
    "why": "Value means lightness or darkness; saturation describes intensity."
   },
   {
    "id": "art-L5-t3",
    "s": "In photography, a lower f-number means a wider aperture.",
    "answer": true,
    "why": "The f-number is a ratio, so a smaller number indicates a larger opening."
   },
   {
    "id": "art-L5-t4",
    "s": "A serif is a small decorative stroke at the end of a letter's main strokes.",
    "answer": true,
    "why": "Serifs are the finishing strokes that distinguish serif from sans-serif typefaces."
   },
   {
    "id": "art-L5-t5",
    "s": "The Bauhaus was a German school of art and design founded in the 1930s.",
    "answer": false,
    "why": "The Bauhaus was founded in 1919 and closed in 1933."
   },
   {
    "id": "art-L5-t6",
    "s": "In music, a semitone is the smallest interval used in traditional Western notation.",
    "answer": true,
    "why": "Adjacent keys on a piano are a semitone apart, the smallest standard step."
   },
   {
    "id": "art-L5-t7",
    "s": "A concerto typically features a solo instrument with orchestra.",
    "answer": true,
    "why": "The concerto contrasts a soloist against the full orchestra."
   },
   {
    "id": "art-L5-t8",
    "s": "The treble clef is also known as the F clef.",
    "answer": false,
    "why": "The treble clef is the G clef; the F clef is the bass clef."
   },
   {
    "id": "art-L5-t9",
    "s": "The Parthenon in Athens is a famous example of the Doric order.",
    "answer": true,
    "why": "The Parthenon's exterior columns are Doric, though it also has Ionic features."
   },
   {
    "id": "art-L5-t10",
    "s": "In design, 'negative space' means the area occupied by the main subject.",
    "answer": false,
    "why": "Negative space is the empty space around and between subjects."
   },
   {
    "id": "art-L5-t11",
    "s": "Cubism was developed in the early twentieth century by Picasso and Braque.",
    "answer": true,
    "why": "Their collaboration around 1907–1912 established Cubism."
   },
   {
    "id": "art-L5-t12",
    "s": "The composer Ludwig van Beethoven wrote only one symphony.",
    "answer": false,
    "why": "Beethoven wrote nine symphonies, the last being the Ninth 'Choral'."
   },
   {
    "id": "art-L5-t13",
    "s": "In music, a scale that moves mainly by whole tones is called a whole-tone scale.",
    "answer": true,
    "why": "A whole-tone scale uses only whole-tone steps, as in Debussy's music."
   },
   {
    "id": "art-L5-t14",
    "s": "The colour wheel's primary colours for light are the same as those for paint.",
    "answer": false,
    "why": "Light uses red, green and blue; paint uses red, yellow and blue (or cyan, magenta, yellow)."
   },
   {
    "id": "art-L5-t15",
    "s": "A photograph taken with a very slow shutter speed can show moving objects as blurred.",
    "answer": true,
    "why": "Long exposure records motion as a blur across the frame."
   },
   {
    "id": "art-L5-t16",
    "s": "In typography, 'x-height' is the height of a capital letter.",
    "answer": false,
    "why": "X-height is the height of a lowercase letter such as x, not a capital."
   },
   {
    "id": "art-L5-t17",
    "s": "Jackson Pollock is associated with Abstract Expressionism and action painting.",
    "answer": true,
    "why": "Pollock's drip paintings are a hallmark of action painting."
   },
   {
    "id": "art-L5-t18",
    "s": "In music, 'piano' as a dynamic marking means to play loudly.",
    "answer": false,
    "why": "Piano means soft; forte means loud."
   }
  ],
  "terms": [
   {
    "id": "art-L5-w1",
    "word": "SATURATION",
    "clue": "The purity or intensity of a colour, from vivid to grey"
   },
   {
    "id": "art-L5-w2",
    "word": "PERSPECTIVE",
    "clue": "Technique for showing depth on a flat surface"
   },
   {
    "id": "art-L5-w3",
    "word": "SYMMETRY",
    "clue": "Balance achieved when one side mirrors the other"
   },
   {
    "id": "art-L5-w4",
    "word": "HARMONY",
    "clue": "Pleasing combination of notes sounded together"
   },
   {
    "id": "art-L5-w5",
    "word": "EXPOSURE",
    "clue": "Total light reaching a camera sensor or film"
   },
   {
    "id": "art-L5-w6",
    "word": "STACCATO",
    "clue": "Notes played short and detached, not smoothly joined"
   },
   {
    "id": "art-L5-w7",
    "word": "BAROQUE",
    "clue": "Ornate seventeenth-century style of art and music"
   },
   {
    "id": "art-L5-w8",
    "word": "KERNING",
    "clue": "Adjusting space between individual pairs of letters"
   },
   {
    "id": "art-L5-w9",
    "word": "MOSAIC",
    "clue": "Picture made from small pieces of stone, glass or tile"
   }
  ]
 },
 "6": {
  "questions": [
   {
    "id": "art-L6-q1",
    "q": "In a major key, which chord is built on the fifth degree of the scale and most strongly pulls back to the tonic?",
    "options": [
     "The dominant",
     "The subdominant",
     "The supertonic",
     "The mediant"
    ],
    "answer": 0,
    "why": "The dominant chord (V) creates the strongest cadential pull to the tonic (I).",
    "hint": "It shares its name with the idea of musical dominance or control."
   },
   {
    "id": "art-L6-q2",
    "q": "In colour theory for painting, which pair of colours are complementary?",
    "options": [
     "Red and orange",
     "Blue and green",
     "Yellow and purple",
     "Red and blue"
    ],
    "answer": 2,
    "why": "Yellow and purple (violet) sit opposite each other on the traditional painter's colour wheel.",
    "hint": "Look for the pair that lies directly opposite on the wheel."
   },
   {
    "id": "art-L6-q3",
    "q": "Which musical texture describes a single melody line performed alone, with no accompaniment or harmony?",
    "options": [
     "Polyphony",
     "Heterophony",
     "Homophony",
     "Monophony"
    ],
    "answer": 3,
    "why": "Monophony is a single unaccompanied melodic line; homophony adds chordal accompaniment.",
    "hint": "The prefix means 'one'."
   },
   {
    "id": "art-L6-q4",
    "q": "A designer uses thick, dark, heavy lettering for a headline and thin, light lettering for the body text. Which principle is chiefly being used?",
    "options": [
     "Unity",
     "Contrast",
     "Rhythm",
     "Proportion"
    ],
    "answer": 1,
    "why": "Deliberate differences in weight create contrast, which separates and emphasises elements.",
    "hint": "It is about making differences obvious rather than about size ratios."
   },
   {
    "id": "art-L6-q5",
    "q": "Which feature is characteristic of Gothic architecture but generally absent from Romanesque?",
    "options": [
     "Thick, small-windowed walls",
     "Pointed arches and ribbed vaults",
     "Barrel vaults",
     "Round arches"
    ],
    "answer": 1,
    "why": "Pointed arches and rib vaults, allowing taller, lighter walls, are hallmarks of Gothic building.",
    "hint": "Think about which arch shape lets builders reach greater heights."
   },
   {
    "id": "art-L6-q6",
    "q": "In the key of C major, which notes make up the dominant triad?",
    "options": [
     "G–B–D",
     "F–A–C",
     "C–E–G",
     "D–F–A"
    ],
    "answer": 0,
    "why": "The dominant is the fifth degree, G, and its major triad is G–B–D.",
    "hint": "Find the fifth note of the scale first."
   },
   {
    "id": "art-L6-q7",
    "q": "Which artistic movement is most closely associated with the idea of the 'readymade', such as an ordinary urinal presented as art?",
    "options": [
     "Impressionism",
     "Art Nouveau",
     "Futurism",
     "Dada"
    ],
    "answer": 3,
    "why": "Marcel Duchamp's readymades were a central Dada strategy challenging what counts as art.",
    "hint": "The movement's name suggests playful nonsense and anti-art provocation."
   },
   {
    "id": "art-L6-q8",
    "q": "A lens is changed from f/4 to f/16. How does the amount of light reaching the sensor change?",
    "options": [
     "It decreases to one-quarter",
     "It decreases to one-sixteenth",
     "It stays the same",
     "It increases fourfold"
    ],
    "answer": 1,
    "why": "f/4 to f/16 is four stops, each halving the light, so the light falls to 1/16.",
    "hint": "Each full stop halves the light; count the stops between the two settings."
   },
   {
    "id": "art-L6-q9",
    "q": "Which composer wrote the Brandenburg Concertos?",
    "options": [
     "Antonio Vivaldi",
     "George Frideric Handel",
     "Joseph Haydn",
     "Johann Sebastian Bach"
    ],
    "answer": 3,
    "why": "Bach composed the six Brandenburg Concertos between about 1711 and 1721.",
    "hint": "This composer also wrote the Mass in B minor."
   },
   {
    "id": "art-L6-q10",
    "q": "In typography, what does 'leading' measure?",
    "options": [
     "The width of a single character",
     "The vertical distance between successive lines of text",
     "The height of a capital letter",
     "The space between two words"
    ],
    "answer": 1,
    "why": "Leading is the line spacing, historically named after strips of lead placed between lines of type.",
    "hint": "It concerns the space between lines, not within them."
   }
  ],
  "truths": [
   {
    "id": "art-L6-t1",
    "s": "In additive colour mixing, combining red and green light produces yellow.",
    "answer": true,
    "why": "Red and green light add together to give yellow in the RGB model."
   },
   {
    "id": "art-L6-t2",
    "s": "A major triad consists of a root, a minor third and a perfect fifth above the root.",
    "answer": false,
    "why": "A major triad has a major third, not a minor third, above the root."
   },
   {
    "id": "art-L6-t3",
    "s": "The Bauhaus school, associated with Walter Gropius, united fine art, craft and design.",
    "answer": true,
    "why": "The Bauhaus (founded 1919) integrated art, craft and industrial design."
   },
   {
    "id": "art-L6-t4",
    "s": "Pop Art artists such as Roy Lichtenstein drew on comic strips and advertising imagery.",
    "answer": true,
    "why": "Pop Art famously appropriated mass-media and commercial imagery."
   },
   {
    "id": "art-L6-t5",
    "s": "In photography, a smaller f-number such as f/2 indicates a smaller lens opening than f/16.",
    "answer": false,
    "why": "A smaller f-number means a larger aperture opening."
   },
   {
    "id": "art-L6-t6",
    "s": "Cubism was developed in the early twentieth century by Pablo Picasso and Georges Braque.",
    "answer": true,
    "why": "Picasso and Braque pioneered Cubism around 1907–1914."
   },
   {
    "id": "art-L6-t7",
    "s": "In the CMYK model used for printing, cyan, magenta and yellow inks alone always produce a deep, rich black.",
    "answer": false,
    "why": "CMY inks give only a muddy dark brown, so black ink (K) is added for true black."
   },
   {
    "id": "art-L6-t8",
    "s": "Surrealist artists such as Salvador Dalí and René Magritte painted dreamlike, illogical scenes.",
    "answer": true,
    "why": "Surrealism explored dream imagery and the irrational."
   },
   {
    "id": "art-L6-t9",
    "s": "The treble clef is also known as the F clef.",
    "answer": false,
    "why": "The treble clef is the G clef; the bass clef is the F clef."
   },
   {
    "id": "art-L6-t10",
    "s": "A perfect fifth spans seven semitones.",
    "answer": true,
    "why": "From C up to G is seven semitones, a perfect fifth."
   },
   {
    "id": "art-L6-t11",
    "s": "In typography, the x-height is the height of a capital letter measured from the baseline.",
    "answer": false,
    "why": "The x-height is the height of a lower-case x, not of a capital letter."
   },
   {
    "id": "art-L6-t12",
    "s": "The principle of proportion concerns the size relationships between parts of a design.",
    "answer": true,
    "why": "Proportion deals with relative sizes of elements within a composition."
   },
   {
    "id": "art-L6-t13",
    "s": "In a 4/4 time signature, there are four minim (half-note) beats in each bar.",
    "answer": false,
    "why": "4/4 means four crotchet (quarter-note) beats per bar, not four minims."
   },
   {
    "id": "art-L6-t14",
    "s": "Flying buttresses allowed Gothic builders to make walls thinner and windows larger.",
    "answer": true,
    "why": "External buttresses carried the thrust, letting walls be lighter and more glazed."
   },
   {
    "id": "art-L6-t15",
    "s": "Marcel Duchamp's 'Fountain' was a painted landscape submitted to an art exhibition.",
    "answer": false,
    "why": "'Fountain' was a porcelain urinal presented as a readymade."
   },
   {
    "id": "art-L6-t16",
    "s": "The composer Gustav Holst wrote an orchestral suite called 'The Planets'.",
    "answer": true,
    "why": "Holst's 'The Planets' (1914–16) includes the movement 'Mars, the Bringer of War'."
   },
   {
    "id": "art-L6-t17",
    "s": "In music, 'andante' indicates a walking pace, faster than adagio.",
    "answer": true,
    "why": "Andante is a moderate walking pace, quicker than adagio."
   },
   {
    "id": "art-L6-t18",
    "s": "In graphic design, a logo that combines a symbol with the company name is called a combination mark.",
    "answer": true,
    "why": "A combination mark pairs a pictorial symbol with a wordmark."
   }
  ],
  "terms": [
   {
    "id": "art-L6-w1",
    "word": "SATURATION",
    "clue": "The purity or intensity of a colour, from vivid to dull"
   },
   {
    "id": "art-L6-w2",
    "word": "CHIAROSCURO",
    "clue": "Strong contrast of light and dark used to model form"
   },
   {
    "id": "art-L6-w3",
    "word": "COUNTERPOINT",
    "clue": "Two or more independent melodic lines sounded together"
   },
   {
    "id": "art-L6-w4",
    "word": "KERNING",
    "clue": "Adjusting space between individual pairs of letters"
   },
   {
    "id": "art-L6-w5",
    "word": "APERTURE",
    "clue": "The adjustable opening in a lens that controls light"
   },
   {
    "id": "art-L6-w6",
    "word": "IMPASTO",
    "clue": "Thickly applied paint showing visible brush or palette-knife marks"
   },
   {
    "id": "art-L6-w7",
    "word": "CADENCE",
    "clue": "A harmonic formula that closes a phrase or section"
   },
   {
    "id": "art-L6-w8",
    "word": "ASYMMETRY",
    "clue": "Balance achieved by unequal elements arranged off-centre"
   },
   {
    "id": "art-L6-w9",
    "word": "ENCAUSTIC",
    "clue": "Painting technique using heated pigmented wax"
   }
  ]
 },
 "7": {
  "questions": [
   {
    "id": "art-L7-q1",
    "q": "A designer wants to create a sense of unity in a poster made of many disparate photographs. Which principle is chiefly at work when she repeats a colour, a shape and a typeface across all the elements?",
    "options": [
     "Rhythm",
     "Contrast",
     "Proportion",
     "Unity through repetition"
    ],
    "answer": 3,
    "why": "Unity is achieved when repeated visual elements tie separate parts into a coherent whole; repetition of colour, shape and typeface is the classic route to unity.",
    "hint": "Think about what holds separate parts together as one."
   },
   {
    "id": "art-L7-q2",
    "q": "A painting uses a colour scheme of blue, blue-green and green. Which type of colour harmony is this?",
    "options": [
     "Split-complementary",
     "Triadic",
     "Analogous",
     "Complementary"
    ],
    "answer": 2,
    "why": "Analogous colours are neighbours on the colour wheel, such as blue, blue-green and green, producing a harmonious, low-contrast scheme.",
    "hint": "The colours sit next to each other on the wheel."
   },
   {
    "id": "art-L7-q3",
    "q": "In the key of G major, which notes form the dominant triad?",
    "options": [
     "D–F♯–A",
     "G–B–D",
     "C–E–G",
     "A–C–E"
    ],
    "answer": 0,
    "why": "The dominant is the chord on the fifth degree; in G major the fifth degree is D, and its major triad is D–F♯–A.",
    "hint": "Find the fifth degree of the scale first, then build a major triad on it."
   },
   {
    "id": "art-L7-q4",
    "q": "A photographer using a 50 mm lens at f/2.8 changes to f/8. By what factor does the light reaching the sensor change?",
    "options": [
     "It is quartered",
     "It is reduced to one sixteenth",
     "It is halved",
     "It is reduced to one eighth"
    ],
    "answer": 3,
    "why": "f/2.8 to f/8 is three full stops (2.8→4→5.6→8), and each stop halves the light, so the light falls to (1/2)³ = 1/8.",
    "hint": "Count the full stops between the two apertures."
   },
   {
    "id": "art-L7-q5",
    "q": "A designer sets a long paragraph in a serif typeface at 10 pt with 14 pt of space from baseline to baseline. What is the leading?",
    "options": [
     "14 pt",
     "24 pt",
     "10 pt",
     "4 pt"
    ],
    "answer": 0,
    "why": "Leading is the baseline-to-baseline distance, which here is given directly as 14 pt; the 4 pt is merely the extra space beyond the type size.",
    "hint": "Leading is measured between baselines, not between the letters themselves."
   },
   {
    "id": "art-L7-q6",
    "q": "In colour theory for mixing pigments, which pair of colours is complementary?",
    "options": [
     "Red and yellow",
     "Yellow and purple",
     "Blue and green",
     "Red and orange"
    ],
    "answer": 1,
    "why": "Yellow and purple (violet) lie opposite each other on the traditional painter's colour wheel and are complementary.",
    "hint": "Look for the pair directly opposite on the wheel."
   },
   {
    "id": "art-L7-q7",
    "q": "A building has pointed arches, rib vaults and flying buttresses. Which style is it?",
    "options": [
     "Gothic",
     "Byzantine",
     "Baroque",
     "Romanesque"
    ],
    "answer": 0,
    "why": "Pointed arches, rib vaults and flying buttresses are the defining structural features of Gothic architecture.",
    "hint": "These features allowed medieval builders to raise walls higher and fill them with glass."
   },
   {
    "id": "art-L7-q8",
    "q": "Which twentieth-century movement, founded by Marcel Duchamp, challenged the idea that art must be handmade by presenting manufactured objects as art?",
    "options": [
     "Dada",
     "De Stijl",
     "Futurism",
     "Constructivism"
    ],
    "answer": 0,
    "why": "Dada, and Duchamp's 'readymades' such as the urinal 'Fountain', questioned what counts as art and the artist's role.",
    "hint": "It arose during the First World War as an anti-art protest."
   },
   {
    "id": "art-L7-q9",
    "q": "A designer wants the eye to travel from a large photograph at the top left to a headline, then to a call-to-action button. Which principle is she chiefly manipulating?",
    "options": [
     "Emphasis",
     "Movement",
     "Balance",
     "Proportion"
    ],
    "answer": 1,
    "why": "Movement is the principle that guides the viewer's eye along a deliberate path through a composition.",
    "hint": "It concerns the route the eye takes, not the weight of the elements."
   },
   {
    "id": "art-L7-q10",
    "q": "Which composer wrote the set of six concertos known as the Brandenburg Concertos?",
    "options": [
     "Joseph Haydn",
     "George Frideric Handel",
     "Antonio Vivaldi",
     "Johann Sebastian Bach"
    ],
    "answer": 3,
    "why": "Bach composed the six Brandenburg Concertos around 1721, dedicating them to the Margrave of Brandenburg.",
    "hint": "The composer was a German working at Cöthen at the time."
   },
   {
    "id": "art-L7-q11",
    "q": "In typography, a capital letter's height measured from the baseline to its top is called the cap height. Which pair of letters best demonstrates that measurement?",
    "options": [
     "H and I",
     "a and e",
     "g and p",
     "x and z"
    ],
    "answer": 0,
    "why": "Cap height is measured on flat-topped capitals without curves or descenders, such as H and I; a and e are lowercase, g and p have descenders, and x and z give the x-height.",
    "hint": "Choose letters with flat tops and no descenders."
   }
  ],
  "truths": [
   {
    "id": "art-L7-t1",
    "s": "In the CMYK model used for printing, mixing cyan, magenta and yellow inks in equal amounts theoretically produces black.",
    "answer": true,
    "why": "Equal CMY overprints absorb all three primaries and yield black, which is why a separate K (black) ink is often added."
   },
   {
    "id": "art-L7-t2",
    "s": "A major triad consists of a root, a major third and a perfect fifth above the root.",
    "answer": true,
    "why": "The major triad's intervals are a major third and a perfect fifth, for example C–E–G."
   },
   {
    "id": "art-L7-t3",
    "s": "In photography, a smaller f-number such as f/2 indicates a smaller aperture and less light than f/16.",
    "answer": false,
    "why": "It is the reverse: f/2 is a wide aperture letting in much more light than f/16."
   },
   {
    "id": "art-L7-t4",
    "s": "The Bauhaus school, associated with Walter Gropius, combined craft and fine art and influenced modernist design and architecture.",
    "answer": true,
    "why": "Founded by Gropius in 1919, the Bauhaus united craft, design and art in a modernist programme."
   },
   {
    "id": "art-L7-t5",
    "s": "De Stijl artists such as Piet Mondrian restricted their palettes to primary colours plus black, white and grey, using straight horizontal and vertical lines.",
    "answer": true,
    "why": "Mondrian's neo-plastic style used only primary colours, non-colours and rectilinear grids."
   },
   {
    "id": "art-L7-t6",
    "s": "In a natural minor scale, the seventh degree is raised by a semitone compared with the natural minor.",
    "answer": false,
    "why": "The natural minor has a lowered seventh; raising the seventh produces the harmonic minor."
   },
   {
    "id": "art-L7-t7",
    "s": "The dominant chord in a major key is built on the fifth degree and has a strong tendency to resolve to the tonic.",
    "answer": true,
    "why": "The dominant (V) chord on the fifth degree creates tension that resolves to the tonic (I)."
   },
   {
    "id": "art-L7-t8",
    "s": "In colour theory, adding white to a colour produces a shade.",
    "answer": false,
    "why": "Adding white produces a tint; a shade is made by adding black."
   },
   {
    "id": "art-L7-t9",
    "s": "Flying buttresses were used in Gothic cathedrals to transfer the outward thrust of the vaults to external supports.",
    "answer": true,
    "why": "Flying buttresses carry the lateral thrust of the high vaults outward to piers, allowing thinner walls and larger windows."
   },
   {
    "id": "art-L7-t10",
    "s": "In typography, leading is the horizontal space between two adjacent letters.",
    "answer": false,
    "why": "Leading is the vertical baseline-to-baseline distance; letter spacing is called tracking or kerning."
   },
   {
    "id": "art-L7-t11",
    "s": "Pop Art, associated with artists such as Andy Warhol and Roy Lichtenstein, drew on advertising, comic strips and mass-produced objects.",
    "answer": true,
    "why": "Pop Art took imagery from commercial culture, comics and consumer goods."
   },
   {
    "id": "art-L7-t12",
    "s": "In music, a monophonic texture consists of a single melody line with no accompaniment.",
    "answer": true,
    "why": "Monophony is one melodic line alone, such as unaccompanied plainchant."
   },
   {
    "id": "art-L7-t13",
    "s": "The RGB colour model is used for mixing inks in commercial printing.",
    "answer": false,
    "why": "RGB is an additive model for screens and light; printing uses the subtractive CMYK model."
   },
   {
    "id": "art-L7-t14",
    "s": "In design, proportion concerns the size relationships between elements in a composition.",
    "answer": true,
    "why": "Proportion describes how the sizes of parts relate to each other and to the whole."
   },
   {
    "id": "art-L7-t15",
    "s": "Romanesque churches are characterised by pointed arches and large stained-glass windows.",
    "answer": false,
    "why": "Those are Gothic features; Romanesque churches typically have round arches and smaller windows."
   },
   {
    "id": "art-L7-t16",
    "s": "A triad is a chord of three notes, typically a root with a third and a fifth above it.",
    "answer": true,
    "why": "A triad stacks a third and a fifth on a root, giving three distinct pitch classes."
   },
   {
    "id": "art-L7-t17",
    "s": "In photography, a fast shutter speed such as 1/1000 s is used mainly to blur moving subjects.",
    "answer": false,
    "why": "A fast shutter speed freezes motion; slow speeds blur it."
   },
   {
    "id": "art-L7-t18",
    "s": "The relative major of A minor is C major, and they share the same key signature.",
    "answer": true,
    "why": "A minor and C major are relative keys, both with no sharps or flats."
   }
  ],
  "terms": [
   {
    "id": "art-L7-w1",
    "word": "SATURATION",
    "clue": "Intensity or purity of a colour, from vivid to muted"
   },
   {
    "id": "art-L7-w2",
    "word": "HARMONY",
    "clue": "Pleasing combination of simultaneous notes or of visual elements"
   },
   {
    "id": "art-L7-w3",
    "word": "KERNING",
    "clue": "Adjustment of space between individual pairs of letters"
   },
   {
    "id": "art-L7-w4",
    "word": "APERTURE",
    "clue": "Opening in a lens that controls how much light enters"
   },
   {
    "id": "art-L7-w5",
    "word": "VENEER",
    "clue": "Thin decorative layer of fine wood applied to a cheaper surface"
   },
   {
    "id": "art-L7-w6",
    "word": "FUGUE",
    "clue": "Contrapuntal form in which a subject is imitated by successive voices"
   },
   {
    "id": "art-L7-w7",
    "word": "MOSAIC",
    "clue": "Picture or pattern made from small pieces of stone, glass or tile"
   },
   {
    "id": "art-L7-w8",
    "word": "TEMPERA",
    "clue": "Painting medium in which pigment is bound with egg yolk"
   },
   {
    "id": "art-L7-w9",
    "word": "BALANCE",
    "clue": "Distribution of visual weight on either side of a composition"
   }
  ]
 },
 "8": {
  "questions": [
   {
    "id": "art-L8-q1",
    "q": "Which interval is enharmonically equivalent to a diminished seventh but is spelled as a major sixth?",
    "options": [
     "Augmented fifth",
     "Minor seventh",
     "Major sixth",
     "Diminished seventh",
     "Augmented sixth"
    ],
    "answer": 2,
    "why": "A major sixth and a diminished seventh sound the same in equal temperament but are spelled differently, so the major sixth is the enharmonic equivalent named.",
    "hint": "Both intervals span ten semitones; only the spelling differs."
   },
   {
    "id": "art-L8-q2",
    "q": "A designer specifies a colour as HSL(210, 50%, 40%). Approximately what RGB value results, given the standard HSL-to-RGB conversion?",
    "options": [
     "(51, 102, 153)",
     "(102, 51, 153)",
     "(51, 153, 102)",
     "(40, 40, 40)",
     "(153, 102, 51)"
    ],
    "answer": 0,
    "why": "Hue 210° is a blue-cyan; with S=0.5 and L=0.4, the maximum channel is L+S(1−L)=0.55 and minimum is L−S·L=0.2, giving roughly (51,102,153) after scaling by 255.",
    "hint": "Compute the max and min channel from L and S first."
   },
   {
    "id": "art-L8-q3",
    "q": "In sonata form, which section typically ends with a strong perfect cadence in the secondary key and may introduce new thematic material?",
    "options": [
     "The exposition",
     "The introduction",
     "The development",
     "The recapitulation",
     "The coda"
    ],
    "answer": 0,
    "why": "The exposition presents the primary and secondary subjects and closes with a cadence in the secondary key, usually the dominant or relative major.",
    "hint": "Which section comes first and establishes the key contrast?"
   },
   {
    "id": "art-L8-q4",
    "q": "In typography, a paragraph is set at 10 pt with 14 pt from baseline to baseline. What is the leading, expressed in the usual way?",
    "options": [
     "24 pt",
     "1.4 em of leading",
     "14/10",
     "10/14",
     "4 pt"
    ],
    "answer": 3,
    "why": "Leading is conventionally given as type size over baseline-to-baseline distance, so 10 pt type with 14 pt spacing is written 10/14.",
    "hint": "Typography states this as a pair: size first, then line spacing."
   },
   {
    "id": "art-L8-q5",
    "q": "Which feature distinguishes a serif typeface's italic from an oblique?",
    "options": [
     "Italic is always bolder",
     "Oblique is always condensed",
     "Italic is a true drawn variant; oblique is a slanted roman",
     "Italic is only used for headings",
     "Oblique has no descenders"
    ],
    "answer": 2,
    "why": "A true italic is a separately designed, often calligraphic form, whereas an oblique is a mechanically slanted version of the roman.",
    "hint": "One is drawn, the other is tilted."
   },
   {
    "id": "art-L8-q6",
    "q": "A Renaissance painter mixes the pigment ultramarine with a little yellow ochre. Which pair of complementary relationships best explains the resulting dulling of the blue?",
    "options": [
     "Orange and green",
     "Blue and yellow",
     "Red and green",
     "Yellow and violet",
     "Blue and orange"
    ],
    "answer": 4,
    "why": "Ultramarine is a blue, and its complement on the traditional painter's wheel is orange; yellow ochre lies near orange, so it neutralises the blue.",
    "hint": "Think of the colour directly opposite blue on a painter's wheel, not the colour being added."
   },
   {
    "id": "art-L8-q7",
    "q": "In sonata form, a movement in a major key typically moves to which key for its second subject in the exposition?",
    "options": [
     "The submediant",
     "The dominant",
     "The tonic minor",
     "The relative minor",
     "The supertonic"
    ],
    "answer": 1,
    "why": "Classical sonata-form expositions normally present the second subject in the dominant when the movement is in a major key.",
    "hint": "It is the key built on the fifth degree of the scale."
   },
   {
    "id": "art-L8-q8",
    "q": "A photographer changes from f/2.8 to f/8 at constant shutter speed. By what factor does the exposure change?",
    "options": [
     "It is halved",
     "It is quartered",
     "It is reduced to one eighth",
     "It is doubled",
     "It is unchanged"
    ],
    "answer": 2,
    "why": "f/2.8 to f/8 is three full stops (2.8→4→5.6→8), and each stop halves the light, so the exposure becomes one eighth.",
    "hint": "Count the full stops between the two apertures, then apply the halving rule."
   },
   {
    "id": "art-L8-q9",
    "q": "Which statement correctly describes the relationship between a natural minor scale and its relative major?",
    "options": [
     "They have opposite key signatures",
     "They share the same key signature",
     "The minor scale starts on the dominant",
     "The minor scale has a raised seventh",
     "They share the same tonic note"
    ],
    "answer": 1,
    "why": "A natural minor scale and its relative major share the same key signature and the same notes, differing only in their tonic.",
    "hint": "Compare the accidentals, not the starting notes."
   },
   {
    "id": "art-L8-q10",
    "q": "A designer places a small, intensely saturated red dot at the optical centre of a vast grey field. Which principle is most strongly activated?",
    "options": [
     "Repetition",
     "Rhythm",
     "Balance",
     "Proportion",
     "Emphasis"
    ],
    "answer": 4,
    "why": "A single contrasting element against a large neutral field creates a focal point, which is the principle of emphasis.",
    "hint": "Ask what the eye is forced to look at."
   },
   {
    "id": "art-L8-q11",
    "q": "A photographer using a 50 mm lens at f/2.8 changes to f/5.6. By what factor does the light reaching the sensor change?",
    "options": [
     "It is reduced to one eighth",
     "It is doubled",
     "It is halved",
     "It is quartered",
     "It is unchanged"
    ],
    "answer": 3,
    "why": "f/2.8 to f/5.6 is two full stops, and each stop halves the light, so the light becomes one quarter.",
    "hint": "Count the stops, then halve twice."
   },
   {
    "id": "art-L8-q12",
    "q": "A palette of oil paints contains ultramarine blue, alizarin crimson and cadmium yellow. Which pair, when mixed, most closely approaches a neutral grey rather than a muddy brown?",
    "options": [
     "Alizarin crimson and cadmium yellow",
     "Ultramarine blue and alizarin crimson",
     "Ultramarine blue and cadmium yellow",
     "Cadmium yellow with itself",
     "Alizarin crimson with white"
    ],
    "answer": 2,
    "why": "Ultramarine (a cool, violet-leaning blue) and cadmium yellow (a warm yellow) are near-complements across the colour wheel, so they neutralise toward grey; crimson and yellow make orange, and blue with crimson makes violet.",
    "hint": "Think about which two pigments sit roughly opposite each other on the wheel."
   },
   {
    "id": "art-L8-q13",
    "q": "In sonata form, which section typically ends with a strong perfect cadence in the dominant key and presents a contrasting second subject?",
    "options": [
     "The exposition",
     "The introduction",
     "The coda",
     "The development",
     "The recapitulation"
    ],
    "answer": 0,
    "why": "The exposition states the first subject in the tonic and the second subject in the dominant (or relative major), closing with a cadence in that new key; the recapitulation restates both in the tonic.",
    "hint": "Which section first announces the themes rather than working them over?"
   },
   {
    "id": "art-L8-q14",
    "q": "A designer sets a serif typeface at 10 pt with 14 pt baseline-to-baseline spacing. What is the leading, expressed as a percentage of the type size?",
    "options": [
     "114%",
     "128%",
     "140%",
     "120%",
     "104%"
    ],
    "answer": 2,
    "why": "Leading as a percentage is the baseline-to-baseline distance divided by the type size: 14 ÷ 10 = 1.4, i.e. 140%.",
    "hint": "Divide the line spacing by the point size."
   },
   {
    "id": "art-L8-q15",
    "q": "Which twentieth-century architectural movement, associated with Le Corbusier, stressed pilotis, free façades and roof gardens as a 'machine for living in'?",
    "options": [
     "Bauhaus Expressionism",
     "Postmodernism",
     "International Style",
     "Deconstructivism",
     "Art Nouveau"
    ],
    "answer": 2,
    "why": "The International Style, codified around Le Corbusier, Gropius and Mies, championed pilotis, free plan and façade, ribbon windows and roof gardens; Deconstructivism and Postmodernism came later and rejected its purism.",
    "hint": "It is the label given to the austere, white, cubic modernism of the 1920s–30s."
   },
   {
    "id": "art-L8-q16",
    "q": "In colour printing, a designer specifies a rich black made from 60% cyan, 40% magenta, 40% yellow and 100% black. What is this four-ink specification called?",
    "options": [
     "A duotone",
     "An RGB triplet",
     "A Pantone spot colour",
     "A hex value",
     "A CMYK build"
    ],
    "answer": 4,
    "why": "Mixing percentages of cyan, magenta, yellow and black defines a CMYK process build; a spot colour is a pre-mixed ink and RGB/hex describe screen light.",
    "hint": "Name the four process inks involved."
   }
  ],
  "truths": [
   {
    "id": "art-L8-t1",
    "s": "In the traditional painter's colour wheel, red and green are complementary colours.",
    "answer": true,
    "why": "On the traditional pigment wheel, red and green sit opposite each other."
   },
   {
    "id": "art-L8-t2",
    "s": "A diminished triad consists of a minor third and a perfect fifth above the root.",
    "answer": false,
    "why": "A diminished triad has a minor third and a diminished fifth, not a perfect fifth."
   },
   {
    "id": "art-L8-t3",
    "s": "The Doric order is the simplest of the three classical Greek orders and has no base on its column.",
    "answer": true,
    "why": "Doric columns stand directly on the stylobate without a base and carry a plain capital."
   },
   {
    "id": "art-L8-t4",
    "s": "In a major key, the subdominant chord is a diminished triad.",
    "answer": false,
    "why": "The subdominant in a major key is a major triad; the diminished triad occurs on the leading tone."
   },
   {
    "id": "art-L8-t5",
    "s": "A larger f-number on a lens corresponds to a smaller aperture opening.",
    "answer": true,
    "why": "The f-number is the focal length divided by the aperture diameter, so larger f-numbers mean smaller openings."
   },
   {
    "id": "art-L8-t6",
    "s": "Marcel Duchamp's 'Fountain' was a urinal submitted to the Society of Independent Artists in 1917.",
    "answer": true,
    "why": "Duchamp submitted the readymade urinal signed 'R. Mutt' to the 1917 exhibition."
   },
   {
    "id": "art-L8-t7",
    "s": "In typography, x-height is the distance from the baseline to the top of a capital letter.",
    "answer": false,
    "why": "X-height is the height of a lowercase x, not of a capital letter."
   },
   {
    "id": "art-L8-t8",
    "s": "The Brandenburg Concertos are a set of six concertos by Johann Sebastian Bach.",
    "answer": true,
    "why": "Bach composed six concertos dedicated to the Margrave of Brandenburg."
   },
   {
    "id": "art-L8-t9",
    "s": "In colour theory for additive mixing, red and green light combine to make magenta.",
    "answer": false,
    "why": "Red and green light combine to make yellow; red and blue make magenta."
   },
   {
    "id": "art-L8-t10",
    "s": "Flying buttresses are an external structural feature characteristic of Gothic architecture.",
    "answer": true,
    "why": "Flying buttresses transfer thrust outward and are a hallmark of Gothic construction."
   },
   {
    "id": "art-L8-t11",
    "s": "A natural minor scale contains a major seventh above its tonic.",
    "answer": false,
    "why": "A natural minor scale has a minor seventh above the tonic."
   },
   {
    "id": "art-L8-t12",
    "s": "Walter Gropius founded the Bauhaus in Weimar in 1919.",
    "answer": true,
    "why": "Gropius established the Bauhaus school in Weimar in 1919."
   },
   {
    "id": "art-L8-t13",
    "s": "In photography, halving the shutter time from 1/125 s to 1/250 s reduces exposure by one stop.",
    "answer": true,
    "why": "Halving the exposure time reduces the light reaching the sensor by one stop."
   },
   {
    "id": "art-L8-t14",
    "s": "Piet Mondrian's mature style used a wide range of secondary and tertiary colours.",
    "answer": false,
    "why": "Mondrian's mature abstraction was restricted to primary colours plus black, white and grey."
   },
   {
    "id": "art-L8-t15",
    "s": "A triad built on the leading tone of a major scale is diminished.",
    "answer": true,
    "why": "The leading-tone triad in a major key contains a diminished fifth above its root."
   },
   {
    "id": "art-L8-t16",
    "s": "In typography, an em dash is shorter than an en dash.",
    "answer": false,
    "why": "An em dash is longer than an en dash, not shorter."
   },
   {
    "id": "art-L8-t17",
    "s": "The term 'sfumato' describes a soft, smoky blending of tones associated with Leonardo da Vinci.",
    "answer": true,
    "why": "Sfumato is Leonardo's technique of subtle tonal transitions without hard outlines."
   },
   {
    "id": "art-L8-t18",
    "s": "In a major key, the mediant chord is minor.",
    "answer": true,
    "why": "The chord on the third degree of a major scale is a minor triad."
   },
   {
    "id": "art-L8-t19",
    "s": "In the CMYK printing model, adding more black ink while keeping the other inks constant always makes the printed colour appear lighter.",
    "answer": false,
    "why": "Black ink absorbs light, so increasing K darkens the printed result rather than lightening it."
   },
   {
    "id": "art-L8-t20",
    "s": "In a major key, the subdominant triad is a major triad built on the fourth degree of the scale.",
    "answer": true,
    "why": "In major keys the chords on degrees I, IV and V are major, so the fourth-degree triad is major."
   },
   {
    "id": "art-L8-t21",
    "s": "In a natural minor scale, the seventh degree is a semitone below the tonic.",
    "answer": false,
    "why": "In natural minor the seventh is a whole tone below the tonic; it is the harmonic minor that raises it to a semitone below."
   },
   {
    "id": "art-L8-t22",
    "s": "The principle of contrast depends on differences rather than similarities between elements.",
    "answer": true,
    "why": "Contrast is created by differences in size, colour, value, texture or shape that make elements distinguishable."
   }
  ],
  "terms": [
   {
    "id": "art-L8-w1",
    "word": "CHIAROSCURO",
    "clue": "Strong contrast of light and shade used to model form in painting"
   },
   {
    "id": "art-L8-w2",
    "word": "COUNTERPOINT",
    "clue": "Combining independent melodic lines that sound together harmonically"
   },
   {
    "id": "art-L8-w3",
    "word": "SERIGRAPHY",
    "clue": "Screen-printing technique used by Pop artists such as Warhol"
   },
   {
    "id": "art-L8-w4",
    "word": "ISOCHRONOUS",
    "clue": "Having equal time intervals, as in some musical or rhythmic patterns"
   },
   {
    "id": "art-L8-w5",
    "word": "PENTAMETER",
    "clue": "Five-beat line structure, as in much English verse and song text"
   },
   {
    "id": "art-L8-w6",
    "word": "ORTHOGONAL",
    "clue": "At right angles, describing lines in perspective drawing"
   },
   {
    "id": "art-L8-w7",
    "word": "HATCHING",
    "clue": "Parallel lines drawn closely to suggest tone or shadow"
   },
   {
    "id": "art-L8-w8",
    "word": "MODULATION",
    "clue": "Movement from one key to another within a composition"
   },
   {
    "id": "art-L8-w9",
    "word": "VIGNETTE",
    "clue": "Darkening or fading at the edges of a photograph or illustration"
   },
   {
    "id": "art-L8-w10",
    "word": "COMPLEMENTARY",
    "clue": "Colours opposite each other on the colour wheel."
   },
   {
    "id": "art-L8-w11",
    "word": "CONTRAPPOSTO",
    "clue": "Pose twisting the body so shoulders and hips face different ways."
   }
  ]
 },
 "9": {
  "questions": [
   {
    "id": "art-L9-q1",
    "q": "In sonata form, which section typically ends with a strong perfect cadence in the secondary key?",
    "options": [
     "The development",
     "The exposition",
     "The coda",
     "The introduction",
     "The recapitulation"
    ],
    "answer": 1,
    "why": "The exposition closes with a cadence in the secondary key, establishing the tonal contrast the form depends on.",
    "hint": "Which section first introduces the second subject?"
   },
   {
    "id": "art-L9-q2",
    "q": "Which feature distinguishes a true italic from an oblique typeface?",
    "options": [
     "It is always bolder",
     "It has different letterforms, often cursive",
     "It is condensed horizontally",
     "It has larger capitals",
     "It is used only for headings"
    ],
    "answer": 1,
    "why": "A true italic is a separate design with cursive, calligraphic letterforms, whereas an oblique is simply a slanted version of the roman.",
    "hint": "Think about whether the letters are redesigned or merely slanted."
   },
   {
    "id": "art-L9-q3",
    "q": "A designer specifies a colour as HSL(210, 50%, 40%). Approximately which RGB value results?",
    "options": [
     "(51, 102, 204)",
     "(102, 102, 153)",
     "(51, 51, 153)",
     "(102, 153, 204)",
     "(51, 102, 153)"
    ],
    "answer": 4,
    "why": "Hue 210° with 50% saturation and 40% lightness gives a mid blue-grey; the standard conversion yields roughly (51, 102, 153).",
    "hint": "Work out the chroma from saturation and lightness, then place the hue between cyan and blue."
   },
   {
    "id": "art-L9-q4",
    "q": "A composer writes a passage that modulates from C major to A-flat major by treating the diminished seventh chord on F-sharp as a pivot. Which relationship explains why this pivot works?",
    "options": [
     "F-sharp is the leading tone of A-flat major",
     "The chord is the dominant seventh of C major",
     "A-flat major is the relative minor of C major",
     "Diminished sevenths occur only on the tonic",
     "F-sharp diminished seventh contains notes shared with both keys"
    ],
    "answer": 4,
    "why": "A diminished seventh chord is symmetrical and can be reinterpreted as the leading-tone chord of several keys; the F-sharp diminished seventh shares notes with the pivot region of both C and A-flat.",
    "hint": "Think about the symmetry and enharmonic flexibility of the diminished seventh chord."
   },
   {
    "id": "art-L9-q5",
    "q": "In a twelve-tone row, the composer writes the prime form P0 and then applies the transformation R4. Which operation does R4 denote?",
    "options": [
     "Retrograde of the row transposed by four semitones",
     "Inversion of the row at the fourth pitch",
     "Rotation of the row by four pitch classes",
     "Prime form transposed up a major third",
     "Retrograde-inversion starting on the fourth degree"
    ],
    "answer": 0,
    "why": "In serial theory, R_n denotes the retrograde form transposed by n semitones, so R4 is the retrograde of P0 transposed four semitones.",
    "hint": "The letter tells you the direction of reading; the number tells you a transposition."
   },
   {
    "id": "art-L9-q6",
    "q": "A designer sets a text block in a serif face at 10 pt with 14 pt baseline-to-baseline spacing. What is the leading, and is the setting 'set solid'?",
    "options": [
     "4 pt leading; not set solid",
     "14 pt leading; not set solid",
     "4 pt leading; set solid",
     "14 pt leading; set solid",
     "10 pt leading; set solid"
    ],
    "answer": 0,
    "why": "Leading is the baseline-to-baseline distance minus the type size: 14 − 10 = 4 pt. 'Set solid' means leading equals the type size, which it does not here.",
    "hint": "Leading is the extra space between lines, not the total line spacing."
   },
   {
    "id": "art-L9-q7",
    "q": "A designer specifies CMYK 60/40/40/100 for a rich black. Which statement about this specification is correct?",
    "options": [
     "Equal CMY values without K would produce the same result",
     "The 60% cyan gives it a warm reddish cast",
     "The 40% magenta makes it a neutral grey",
     "The 100% K makes it a 'rich black' rather than a plain K-only black",
     "The 100% K alone produces a deep rich black"
    ],
    "answer": 3,
    "why": "Rich black combines a high K with some CMY; a K-only black (0/0/0/100) is a 'plain' black, while adding CMY deepens it.",
    "hint": "Distinguish a K-only black from a black built with all four inks."
   },
   {
    "id": "art-L9-q8",
    "q": "In sonata form, the second subject of a movement in a major key normally appears in which key, and why?",
    "options": [
     "The parallel minor, because it darkens the mood",
     "The dominant, because it is closely related and creates contrast",
     "The subdominant, because it is a fifth below the tonic",
     "The relative minor, because it shares the same key signature",
     "The mediant, because it is three semitones above the tonic"
    ],
    "answer": 1,
    "why": "In a major-key sonata movement, the second subject is conventionally in the dominant (or, in minor keys, the relative major).",
    "hint": "Think of the key a fifth above the tonic, the usual contrast key in major-key sonata form."
   },
   {
    "id": "art-L9-q9",
    "q": "A designer places a small, intensely saturated red dot on a vast neutral grey field. Which principle best explains why the red appears to advance toward the viewer?",
    "options": [
     "Neutral grey always advances relative to saturated hues",
     "The grey is complementary to red, so it recedes",
     "The red dot is a vanishing point",
     "Colour and size together create focal emphasis and spatial advance",
     "Saturation has no effect on perceived depth"
    ],
    "answer": 3,
    "why": "Warm, saturated hues tend to advance while large neutral areas recede; the small saturated accent becomes a focal point through contrast of colour, size and saturation.",
    "hint": "Consider how saturation and area interact to create emphasis and depth."
   },
   {
    "id": "art-L9-q10",
    "q": "In typography, which statement correctly distinguishes an italic from an oblique?",
    "options": [
     "An italic is only used for headings; an oblique only for body text",
     "An italic is a true drawn style, often with different letterforms; an oblique is a slanted roman",
     "An oblique is a true drawn style; an italic is a slanted roman",
     "Both are always mechanically slanted versions of the roman",
     "An oblique has serifs; an italic never does"
    ],
    "answer": 1,
    "why": "A true italic is a separately designed style with its own letterforms, whereas an oblique is a mechanically slanted version of the roman.",
    "hint": "One is drawn, the other is slanted."
   }
  ],
  "truths": [
   {
    "id": "art-L9-t1",
    "s": "In sonata form, the recapitulation restates the second subject in the tonic key.",
    "answer": true,
    "why": "The recapitulation resolves the tonal conflict by bringing both subjects into the tonic."
   },
   {
    "id": "art-L9-t2",
    "s": "An augmented sixth chord typically resolves outward to an octave on the dominant.",
    "answer": true,
    "why": "The augmented sixth expands to the octave, a standard predominant-to-dominant resolution."
   },
   {
    "id": "art-L9-t3",
    "s": "A true italic typeface is simply the roman design slanted to the right.",
    "answer": false,
    "why": "That describes an oblique; a true italic has redesigned, often cursive letterforms."
   },
   {
    "id": "art-L9-t4",
    "s": "In sonata form, the recapitulation introduces the secondary theme in the secondary key for the first time.",
    "answer": false,
    "why": "The secondary theme first appears in the secondary key in the exposition; the recapitulation restates it in the tonic."
   },
   {
    "id": "art-L9-t5",
    "s": "The development section of sonata form typically presents the second subject in the tonic key.",
    "answer": false,
    "why": "The second subject is presented in the tonic in the recapitulation, not the development."
   },
   {
    "id": "art-L9-t6",
    "s": "The natural minor scale raises the seventh degree when ascending.",
    "answer": false,
    "why": "That describes the melodic minor; the natural minor keeps the lowered seventh."
   },
   {
    "id": "art-L9-t7",
    "s": "A diminished seventh chord is built from three stacked minor thirds.",
    "answer": true,
    "why": "Root, minor third, diminished fifth and diminished seventh stack minor thirds."
   },
   {
    "id": "art-L9-t8",
    "s": "In sonata form, the recapitulation restates the main themes with the second subject in the tonic key.",
    "answer": true,
    "why": "The recapitulation resolves the key conflict by bringing the second subject back to the tonic."
   },
   {
    "id": "art-L9-t9",
    "s": "A true italic typeface is simply a slanted version of the roman, with no redrawing of letterforms.",
    "answer": false,
    "why": "A true italic is redesigned with cursive forms; a merely slanted roman is an oblique."
   },
   {
    "id": "art-L9-t10",
    "s": "A diminished seventh chord is built from a minor third, a minor third and another minor third, spanning a diminished seventh.",
    "answer": true,
    "why": "Stacking three minor thirds gives a diminished seventh chord."
   },
   {
    "id": "art-L9-t11",
    "s": "A true italic typeface is a separately drawn design, not merely a slanted roman.",
    "answer": true,
    "why": "Italic letterforms are drawn with cursive characteristics, whereas oblique is a slanted roman."
   },
   {
    "id": "art-L9-t12",
    "s": "A diminished seventh interval is enharmonically equivalent to a major sixth.",
    "answer": true,
    "why": "Both span nine semitones, though they are spelled and resolve differently."
   },
   {
    "id": "art-L9-t13",
    "s": "An oblique typeface is a separately drawn cursive design with different letterforms from the roman.",
    "answer": false,
    "why": "An oblique is a slanted roman; it is the italic that is separately drawn."
   },
   {
    "id": "art-L9-t14",
    "s": "In colour printing, a rich black typically combines 100% K with some cyan, magenta and yellow ink.",
    "answer": true,
    "why": "Rich black adds CMY to K to deepen the black, unlike a plain K-only black."
   },
   {
    "id": "art-L9-t15",
    "s": "A major triad consists of a major third followed by a minor third.",
    "answer": true,
    "why": "Root to third is a major third (four semitones), third to fifth a minor third (three)."
   },
   {
    "id": "art-L9-t16",
    "s": "An f/2 aperture admits four times as much light as f/4.",
    "answer": true,
    "why": "Two full stops separate f/2 and f/4, so the light ratio is 2² = 4."
   },
   {
    "id": "art-L9-t17",
    "s": "Flying buttresses are characteristic of Gothic architecture and rare in Romanesque.",
    "answer": true,
    "why": "They were developed to carry vault thrust outward, a hallmark of Gothic design."
   },
   {
    "id": "art-L9-t18",
    "s": "Marcel Duchamp was a leading figure of the Bauhaus.",
    "answer": false,
    "why": "Duchamp was associated with Dada; the Bauhaus was founded by Walter Gropius."
   },
   {
    "id": "art-L9-t19",
    "s": "Reducing a lens aperture from f/4 to f/5.6 halves the light reaching the sensor.",
    "answer": true,
    "why": "f/4 to f/5.6 is one full stop, halving the light."
   },
   {
    "id": "art-L9-t20",
    "s": "The dominant chord in a major key is a minor triad.",
    "answer": false,
    "why": "The dominant triad in a major key is major (e.g. G–B–D in C major)."
   },
   {
    "id": "art-L9-t21",
    "s": "Piet Mondrian's mature work reduced painting to straight lines and primary colours.",
    "answer": true,
    "why": "His De Stijl canvases use black grids with red, yellow and blue rectangles."
   },
   {
    "id": "art-L9-t22",
    "s": "In typography, leading is the vertical distance from one baseline to the next.",
    "answer": true,
    "why": "Leading measures baseline-to-baseline spacing, not the height of the letters."
   },
   {
    "id": "art-L9-t23",
    "s": "A diminished seventh chord is built from a root, minor third, diminished fifth and diminished seventh.",
    "answer": true,
    "why": "Stacking minor thirds above the root gives exactly those intervals."
   },
   {
    "id": "art-L9-t24",
    "s": "In colour theory for mixing light, cyan, magenta and yellow are the primary colours.",
    "answer": false,
    "why": "The additive primaries for light are red, green and blue; cyan, magenta and yellow are subtractive primaries."
   }
  ],
  "terms": [
   {
    "id": "art-L9-w1",
    "word": "COUNTERPOINT",
    "clue": "Combining independent melodic lines that sound together harmonically"
   },
   {
    "id": "art-L9-w2",
    "word": "HIERARCHY",
    "clue": "Ordering of elements by importance to guide the viewer's attention"
   },
   {
    "id": "art-L9-w3",
    "word": "MODULATION",
    "clue": "Change of key within a piece of music"
   },
   {
    "id": "art-L9-w4",
    "word": "BRUTALISM",
    "clue": "Post-war architectural style using raw exposed concrete"
   },
   {
    "id": "art-L9-w5",
    "word": "HARMONIC",
    "clue": "Minor scale with a raised seventh degree"
   },
   {
    "id": "art-L9-w6",
    "word": "READYMADE",
    "clue": "Ordinary manufactured object presented as art by Duchamp"
   },
   {
    "id": "art-L9-w7",
    "word": "CHIAROSCURO",
    "clue": "Strong contrast of light and shade used to model form in painting"
   },
   {
    "id": "art-L9-w8",
    "word": "KERNING",
    "clue": "Adjusting space between individual pairs of letters"
   },
   {
    "id": "art-L9-w9",
    "word": "ENHARMONIC",
    "clue": "Describes two spellings of the same pitch, such as F sharp and G flat"
   },
   {
    "id": "art-L9-w10",
    "word": "ORTHOGONAL",
    "clue": "Projection in which parallel lines stay parallel and do not converge"
   },
   {
    "id": "art-L9-w11",
    "word": "SYNCOPATION",
    "clue": "Displacement of musical accents onto weak or off beats"
   }
  ]
 },
 "10": {
  "questions": [
   {
    "id": "art-L10-q1",
    "q": "A composer writes a passage using the whole-tone scale. Which statement about the harmonic resources available is correct?",
    "options": [
     "It contains no perfect fifth or perfect fourth",
     "It is identical to the octatonic scale",
     "Its triads are all major or minor",
     "It contains all twelve chromatic pitches",
     "It has a leading tone a semitone below the tonic"
    ],
    "answer": 0,
    "why": "The whole-tone scale divides the octave into six equal tones, so no interval of a perfect fourth or fifth (5 or 7 semitones) can occur; only augmented triads and tritones are available.",
    "hint": "Count semitones between adjacent and non-adjacent scale degrees."
   },
   {
    "id": "art-L10-q2",
    "q": "Which statement about the enharmonic spelling of a diminished seventh chord is correct?",
    "options": [
     "It is enharmonically equivalent to a half-diminished seventh",
     "It is enharmonically equivalent to a major sixth chord and is always spelled as such",
     "It is enharmonically equivalent to a dominant seventh but must be spelled as stacked minor thirds",
     "It contains a perfect fifth when respelled",
     "It cannot be respelled because diminished sevenths are symmetrical"
    ],
    "answer": 2,
    "why": "A diminished seventh (e.g. B–D–F–Ab) sounds identical to a dominant seventh (B–D–F–G#) but is spelled in minor thirds; the spelling determines its function.",
    "hint": "Compare the interval content of the two chords note by note."
   },
   {
    "id": "art-L10-q3",
    "q": "Which feature most reliably distinguishes a true italic from a mechanically sloped oblique?",
    "options": [
     "A greater slant angle than 12 degrees",
     "A larger x-height than the roman",
     "Different letterforms, often a single-storey a and different serifs",
     "The absence of descenders",
     "A lighter stroke weight throughout"
    ],
    "answer": 2,
    "why": "True italics are separately drawn designs with altered letterforms (e.g. single-storey a, cursive f), whereas obliques are simply slanted romans.",
    "hint": "Compare the shape of the lowercase a in each."
   },
   {
    "id": "art-L10-q4",
    "q": "A composer writes a passage using only the notes of the whole-tone scale. Which harmonic consequence follows necessarily?",
    "options": [
     "No minor seconds occur",
     "No tritones occur",
     "No major thirds occur",
     "No perfect fifths occur",
     "No perfect fourths occur"
    ],
    "answer": 3,
    "why": "The whole-tone scale divides the octave into six equal whole steps, so it contains no perfect fourth or perfect fifth, only tritones, major thirds and minor thirds (and their inversions).",
    "hint": "Think about which interval divides the octave into two equal halves and is therefore present in every whole-tone collection."
   },
   {
    "id": "art-L10-q5",
    "q": "Which interval is enharmonically equivalent to a diminished seventh but is spelled as a major sixth?",
    "options": [
     "Augmented sixth",
     "Minor seventh",
     "Major seventh",
     "Tritone",
     "Minor sixth"
    ],
    "answer": 0,
    "why": "An augmented sixth (e.g. A♭–F♯) sounds like a minor seventh, while a diminished seventh (e.g. A–G♭) sounds like a major sixth; the spelling differs.",
    "hint": "Think of the chord in which the interval is conventionally spelled."
   },
   {
    "id": "art-L10-q6",
    "q": "A colour is specified in HSB as hue 0°, saturation 100%, brightness 50%. Which RGB triplet (0–255) best approximates it?",
    "options": [
     "255, 128, 128",
     "127, 127, 127",
     "64, 0, 0",
     "255, 0, 0",
     "128, 0, 0"
    ],
    "answer": 4,
    "why": "Hue 0° at full saturation is pure red; halving brightness halves the red channel, giving about 128, 0, 0.",
    "hint": "Brightness scales all channels proportionally from the pure hue."
   },
   {
    "id": "art-L10-q7",
    "q": "A designer specifies a colour as HSL(210, 50%, 40%). Which RGB value best approximates it?",
    "options": [
     "51, 51, 153",
     "51, 102, 153",
     "102, 153, 204",
     "0, 51, 102",
     "153, 153, 153"
    ],
    "answer": 1,
    "why": "HSL(210, 50%, 40%) gives a medium blue-grey; converting yields approximately 51, 102, 153.",
    "hint": "Hue 210° lies in the blue range; lightness 40% keeps it fairly dark."
   },
   {
    "id": "art-L10-q8",
    "q": "In a twelve-tone work, a composer writes the prime form P0 and then states the same row upside down, with every interval inverted. Which transformation has been applied?",
    "options": [
     "Retrograde",
     "Retrograde inversion",
     "Inversion",
     "Rotation",
     "Transposition"
    ],
    "answer": 2,
    "why": "Inversion mirrors every interval of the row about its first note; retrograde reverses order, transposition shifts pitch level, and retrograde inversion does both.",
    "hint": "Think about which operation flips intervals rather than reversing order."
   },
   {
    "id": "art-L10-q9",
    "q": "A composer moves from C major to A-flat major by treating the dominant seventh of the new key as a German sixth in the old key. Which chord is enharmonically reinterpreted?",
    "options": [
     "C dominant seventh",
     "A-flat dominant seventh",
     "G dominant seventh",
     "D-flat dominant seventh",
     "E-flat dominant seventh"
    ],
    "answer": 1,
    "why": "The German sixth on A-flat in C major is A-flat–C–E-flat–G-flat, enharmonically the dominant seventh of D-flat; but the classic pivot to A-flat uses E-flat7, which is enharmonically the German sixth in C (E-flat–G–B-flat–D-flat).",
    "hint": "Compare the spelling of the German sixth in C with a dominant seventh a semitone away."
   },
   {
    "id": "art-L10-q10",
    "q": "A twelve-tone row begins with the prime form P0. The composer then writes the retrograde of the inversion. Which transformation of P0 does this correspond to, and what is its standard label?",
    "options": [
     "Transposed prime, labelled P5",
     "Inversion, labelled I0",
     "Retrograde inversion, labelled RI0",
     "Retrograde, labelled R0",
     "Transposed inversion, labelled I5"
    ],
    "answer": 2,
    "why": "The retrograde of the inversion is the retrograde inversion (RI), and when it starts from the same row form it is labelled RI0.",
    "hint": "Combine the two operations: inversion reverses intervals, retrograde reverses order."
   },
   {
    "id": "art-L10-q11",
    "q": "A composer modulates from C major to A-flat major by treating the diminished seventh chord on F sharp as a common chord. Which pivot chord is being used?",
    "options": [
     "ii7 of A-flat major, enharmonically respelled",
     "IV of C major, enharmonically respelled",
     "vii°7 of G major, enharmonically respelled as vii°7 of A-flat",
     "vi of C major, enharmonically respelled",
     "V7 of A-flat major, enharmonically respelled"
    ],
    "answer": 2,
    "why": "The diminished seventh on F sharp can function as vii°7 of G, but respelled enharmonically it becomes vii°7 of A-flat (built on G sharp), enabling the modulation.",
    "hint": "Diminished seventh chords are enharmonically ambiguous and can pivot between distant keys."
   }
  ],
  "truths": [
   {
    "id": "art-L10-t1",
    "s": "The golden section ratio is approximately 1.618 and was explicitly prescribed by Vitruvius for all Roman temple column spacing.",
    "answer": false,
    "why": "Vitruvius discussed proportion and symmetry but did not prescribe the golden section for column spacing."
   },
   {
    "id": "art-L10-t2",
    "s": "In music theory, a Neapolitan sixth chord is a major triad built on the lowered second degree of the scale, usually in first inversion.",
    "answer": true,
    "why": "It is a flattened supertonic major triad, conventionally in first inversion, resolving to the dominant."
   },
   {
    "id": "art-L10-t3",
    "s": "The tritone is called 'diabolus in musica' and was banned by the Church in the Middle Ages.",
    "answer": false,
    "why": "The nickname is documented, but no formal ecclesiastical ban on the tritone existed; the claim is a popular myth."
   },
   {
    "id": "art-L10-t4",
    "s": "The whole-tone scale contains no perfect fifths.",
    "answer": true,
    "why": "Every interval in it is a whole tone or multiple thereof, so no perfect fifth occurs."
   },
   {
    "id": "art-L10-t5",
    "s": "An augmented sixth chord typically resolves outwards to an octave on the dominant.",
    "answer": true,
    "why": "The augmented sixth resolves outward to the dominant octave, a hallmark of the chord."
   },
   {
    "id": "art-L10-t6",
    "s": "A diminished seventh chord is built from a major triad plus a minor seventh.",
    "answer": false,
    "why": "It is built from a diminished triad plus a diminished seventh."
   },
   {
    "id": "art-L10-t7",
    "s": "An augmented sixth chord typically resolves outward to an octave.",
    "answer": true,
    "why": "The augmented sixth resolves outward by half step to the octave of the dominant."
   },
   {
    "id": "art-L10-t8",
    "s": "An oblique typeface is a slanted version of the roman, usually without redrawn letterforms.",
    "answer": true,
    "why": "Oblique is a mechanically slanted roman; italic is usually redrawn."
   },
   {
    "id": "art-L10-t9",
    "s": "A major sixth and a diminished seventh are enharmonically equivalent intervals.",
    "answer": true,
    "why": "Both span nine semitones, though they are spelled and function differently."
   },
   {
    "id": "art-L10-t10",
    "s": "Changing a lens from f/8 to f/11 halves the light reaching the sensor.",
    "answer": true,
    "why": "f/8 to f/11 is one full stop, which halves the light."
   },
   {
    "id": "art-L10-t11",
    "s": "An oblique typeface is a separately designed cursive letterform, distinct from a slanted roman.",
    "answer": false,
    "why": "An oblique is a mechanically slanted roman; a true italic is the separately designed cursive form."
   },
   {
    "id": "art-L10-t12",
    "s": "HSB and HSV describe the same colour model.",
    "answer": true,
    "why": "HSB (hue, saturation, brightness) is another name for HSV (hue, saturation, value)."
   },
   {
    "id": "art-L10-t13",
    "s": "In typography, a larger x-height generally makes a typeface appear larger at the same point size.",
    "answer": true,
    "why": "A larger x-height increases the apparent size of lowercase text at a given point size."
   },
   {
    "id": "art-L10-t14",
    "s": "A diminished seventh chord is built from a minor third, a diminished fifth and a diminished seventh above the root.",
    "answer": true,
    "why": "Stacking minor thirds gives root, minor third, diminished fifth and diminished seventh."
   }
  ],
  "terms": [
   {
    "id": "art-L10-w1",
    "word": "SERIGRAPHY",
    "clue": "Screen-printing technique used by Pop artists such as Warhol"
   },
   {
    "id": "art-L10-w2",
    "word": "COUNTERPOINT",
    "clue": "Combination of independent melodic lines sounding together"
   },
   {
    "id": "art-L10-w3",
    "word": "PENTATONIC",
    "clue": "Five-note scale common in folk music worldwide"
   },
   {
    "id": "art-L10-w4",
    "word": "ISOCHRONOUS",
    "clue": "Having equal time durations, as in some rhythmic patterns"
   },
   {
    "id": "art-L10-w5",
    "word": "HARMONOGRAPH",
    "clue": "Instrument drawing complex curves from combined harmonic motions"
   },
   {
    "id": "art-L10-w6",
    "word": "MODULATION",
    "clue": "Change of key within a musical composition"
   },
   {
    "id": "art-L10-w7",
    "word": "ENHARMONIC",
    "clue": "Relation of notes spelled differently but sounding the same pitch"
   },
   {
    "id": "art-L10-w8",
    "word": "MEGALOPOLIS",
    "clue": "Very large conurbation formed by merging neighbouring urban areas"
   },
   {
    "id": "art-L10-w9",
    "word": "PENTIMENTO",
    "clue": "Visible trace of an earlier layer of paint beneath the surface"
   }
  ]
 }
};
