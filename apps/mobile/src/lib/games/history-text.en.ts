/**
 * English source for the Museum of Time words added with the ten-level ladder and the redesign: the
 * games' rules for the how-to-play sheet, their taglines, and the labels of the new boards. The other
 * nine languages are made from this by apps/server/scripts/business-history-content.ts into
 * history-text.ts, which adds them all to the "history" namespace. Eras, finds, countries and questions
 * still come from the server in English, like the other subject games' content.
 */
const en = {
  games: {
    'time-machine': {
      tagline: 'Travel to real moments in history and put events in order.',
      rules: {
        r1: 'Each stop is a real moment in history, from ancient Egypt to the fall of the Berlin Wall. Read the museum label first.',
        r2: 'Answer two challenges at each stop: a question, or putting events in order with the earliest at the top.',
        r3: 'Higher levels bring more stops, events closer together in time, questions about historians and sources, and a shorter clock (unless the timer is off).',
        example: 'Ghana’s independence (1957) comes before the founding of the Organisation of African Unity (1963).',
      },
    },
    'lost-civilization': {
      tagline: 'Excavate real artefacts and name the civilisation that made them.',
      rules: {
        r1: 'Uncover the squares of the trench to find the artefacts. Each find comes with a clue from real archaeology.',
        r2: 'Name the civilisation that left them behind, then answer a question about it.',
        r3: 'From Upper-intermediate the clues get subtler and the wrong answers come from the same part of the world; at the top you see only two finds.',
        example: 'Terracotta heads with triangular eyes and iron-smelting slag, from central Nigeria: the Nok culture.',
      },
    },
    'africa-explorer': {
      tagline: 'Find all of Africa’s countries on the map and learn their history.',
      rules: {
        r1: 'Tap the map where you think the country is, then check. Prefer not to tap? Use “Choose from markers” instead.',
        r2: 'Then visit its landmark, read two facts and answer a question about it.',
        r3: 'Higher levels hide the region hint, need a closer tap and bring smaller countries.',
        example: 'Nigeria is in West Africa, on the Gulf of Guinea, where the Niger and Benue rivers meet.',
      },
    },
  },
  quiz: {
    timeUp: 'Time’s up',
    stop: 'Stop {{n}} of {{total}}',
    challenge: 'Challenge {{n}} of 2',
    next: 'Next',
    nextStop: 'Next stop',
    finish: 'See results',
  },
  order: {
    keys: 'On a computer: number keys choose a line, ↑ and ↓ move it, Enter checks.',
    youHad: 'You put this at number {{n}}',
    bc: '{{year}} BC',
    ad: 'AD {{year}}',
  },
  timeline: {
    label: 'MUSEUM LABEL',
    a11y: 'Timeline of this journey: {{list}}',
    now: 'You are here',
  },
  excavation: {
    trench: 'TRENCH {{n}} OF {{total}}',
    uncover: 'Uncover the squares to find the artefacts.',
    square: 'Square {{n}}: dig here',
    empty: 'Square {{n}}: only soil',
    foundA11y: 'Square {{n}}: {{name}} found',
    found: '{{done}} of {{total}} finds',
    digAll: 'Uncover all',
    identify: 'Name the civilisation',
    who: 'Which civilisation left these behind?',
    finds: 'FINDS',
    about: 'ABOUT THEM',
  },
  atlas: {
    find: 'Find {{name}}',
    hint: 'Hint: {{region}}',
    tap: 'Tap the map where you think it is, then check.',
    markers: 'Choose from markers',
    useMap: 'Tap the map instead',
    markerHint: 'Which marker is {{name}}?',
    marker: 'Marker {{letter}}',
    check: 'Check',
    found: 'Found it',
    missed: 'Not quite: {{name}} is marked in green.',
    landmark: 'LANDMARK',
    facts: 'DID YOU KNOW?',
    passport: 'Passport: {{done}} of {{total}} stamps',
    mapA11y: 'Map of Africa. Tap to place a pin.',
    pinA11y: 'Your pin',
  },
  review: {
    era: '{{title}} ({{when}})',
  },
};
export default en;
