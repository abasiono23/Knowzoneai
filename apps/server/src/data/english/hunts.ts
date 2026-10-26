/**
 * Word Hunter themes. Each puzzle picks a theme and the words that fit the level's grid. Theme names
 * are shown through the app's translations (world:english.themes.<id>); the words stay in English.
 */
export const HUNT_THEMES: { id: string; words: string[] }[] = [
  { id: 'space', words: ['PLANET', 'ORBIT', 'COMET', 'STAR', 'MOON', 'SUN', 'ROCKET', 'GALAXY', 'METEOR', 'SATURN', 'MARS', 'ASTEROID'] },
  { id: 'animals', words: ['LION', 'ZEBRA', 'GOAT', 'SNAKE', 'EAGLE', 'TIGER', 'MONKEY', 'PARROT', 'TORTOISE', 'ELEPHANT', 'GIRAFFE', 'CROCODILE'] },
  { id: 'fruits', words: ['MANGO', 'ORANGE', 'GUAVA', 'PAWPAW', 'BANANA', 'CASHEW', 'LEMON', 'APPLE', 'COCONUT', 'PINEAPPLE', 'AVOCADO', 'WATERMELON'] },
  { id: 'school', words: ['BOOK', 'PEN', 'RULER', 'CHALK', 'DESK', 'TEACHER', 'LIBRARY', 'PENCIL', 'ERASER', 'SCHOOL', 'EXAM', 'HOMEWORK'] },
  { id: 'weather', words: ['RAIN', 'WIND', 'CLOUD', 'STORM', 'SUNNY', 'THUNDER', 'HARMATTAN', 'FOG', 'HUMID', 'RAINBOW', 'LIGHTNING', 'DRIZZLE'] },
  { id: 'body', words: ['HEAD', 'HAND', 'KNEE', 'HEART', 'LUNGS', 'ELBOW', 'ANKLE', 'BRAIN', 'SHOULDER', 'STOMACH', 'SKELETON', 'EYEBROW'] },
  { id: 'jobs', words: ['NURSE', 'DOCTOR', 'FARMER', 'PILOT', 'LAWYER', 'TAILOR', 'BAKER', 'ENGINEER', 'TEACHER', 'DRIVER', 'CHEF', 'BANKER'] },
  { id: 'kitchen', words: ['POT', 'SPOON', 'KNIFE', 'PLATE', 'STOVE', 'OVEN', 'KETTLE', 'MORTAR', 'PESTLE', 'GRATER', 'FORK', 'BOWL'] },
  { id: 'sports', words: ['FOOTBALL', 'TENNIS', 'BOXING', 'SWIM', 'RACE', 'GOAL', 'MEDAL', 'TEAM', 'CHESS', 'RELAY', 'REFEREE', 'STADIUM'] },
  { id: 'colours', words: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE', 'BROWN', 'BLACK', 'WHITE', 'PINK', 'MAROON', 'VIOLET'] },
  { id: 'computers', words: ['MOUSE', 'SCREEN', 'KEYBOARD', 'LAPTOP', 'EMAIL', 'CODE', 'PRINTER', 'MEMORY', 'VIRUS', 'WEBSITE', 'PASSWORD', 'ROBOT'] },
  { id: 'farm', words: ['MAIZE', 'YAM', 'CASSAVA', 'COCOA', 'HOE', 'CUTLASS', 'TRACTOR', 'HARVEST', 'SEED', 'BARN', 'FARMER', 'GOAT'] },
  { id: 'music', words: ['DRUM', 'GUITAR', 'PIANO', 'FLUTE', 'SONG', 'CHOIR', 'RHYTHM', 'MELODY', 'VIOLIN', 'TRUMPET', 'BAND', 'NOTE'] },
  { id: 'ocean', words: ['WAVE', 'SHARK', 'WHALE', 'CORAL', 'CRAB', 'OCTOPUS', 'DOLPHIN', 'SEAWEED', 'TIDE', 'SHELL', 'ANCHOR', 'LAGOON'] },
  { id: 'transport', words: ['BUS', 'TRAIN', 'OKADA', 'KEKE', 'CANOE', 'FERRY', 'TRUCK', 'PLANE', 'BICYCLE', 'TAXI', 'HELICOPTER', 'MOTORCYCLE'] },
  { id: 'feelings', words: ['HAPPY', 'SAD', 'ANGRY', 'PROUD', 'BRAVE', 'CALM', 'JOYFUL', 'NERVOUS', 'EXCITED', 'LONELY', 'HOPEFUL', 'GRATEFUL'] },
];
