/**
 * The Museum of Time in Knowzone World: walking around the museum, its stations, and the History &
 * Geography games. Eras, artifacts, countries and questions come from the server in English.
 */
export default {
  title: 'Museum of Time',
  entryEyebrow: 'HISTORY & GEOGRAPHY · NEW',
  entryTitle: 'Museum of Time',
  entryBody: 'Travel through history, dig up lost cities and explore Africa',
  leave: 'Leave the museum',
  offline: 'The Museum of Time needs an internet connection, because every answer is checked on our server.',
  result: {
    back: 'Back to the museum',
  },
  hall: {
    walkTo: 'Walk to the {{station}}',
    you: 'You, the explorer',
    open: 'Enter the {{station}}',
    goHere: 'Go here',
    stars: '{{count}} of {{max}} stars',
    tip: 'Walk to an exhibit to start a game. Tap a name to walk there.',
  },
  stations: {
    timemachine: 'Time machine',
    dig: 'Lost civilizations',
    maptable: 'Africa map',
  },
  games: {
    'time-machine': {
      name: 'History Time Machine',
      how: 'Travel to real moments in history, from the pyramids to Nigeria’s independence. Walk around each era and solve its challenges.',
    },
    'lost-civilization': {
      name: 'Lost Civilization',
      how: 'Dig up artifacts at ancient sites, read the clues, and name the civilization that made them to unlock its city.',
    },
    'africa-explorer': {
      name: 'Africa Explorer',
      how: 'Find countries on the map of Africa, visit their famous landmarks, and collect a passport stamp for each one.',
    },
  },
  time: {
    objective: 'Era {{n}} of {{total}}: {{title}}',
    travelling: 'Travelling to {{when}}…',
    spot: 'Walk to a glowing spot to find a challenge.',
    challenge: 'CHALLENGE {{n}} OF {{total}}',
    nextEra: 'Next era',
    order: {
      earliest: 'EARLIEST',
      latest: 'LATEST',
      up: 'Move “{{item}}” earlier',
      down: 'Move “{{item}}” later',
      check: 'Check order',
      right: 'Perfect timeline! +{{points}}',
      wrong: 'Not quite. The right order is shown.',
    },
  },
  dig: {
    objective: 'Dig {{n}} of {{total}}',
    spot: 'Dig spot {{n}}',
    dig: 'Dig',
    tap: 'Tap to dig carefully',
    digA11y: 'Dig here',
    found: 'ARTIFACT FOUND',
    finds: '{{done}} of {{total}} artifacts',
    collect: 'Collect',
    solve: 'Solve the mystery',
    unlocked: 'City unlocked!',
    cities: '{{count}} of {{total}} cities unlocked',
    next: 'Next dig',
  },
  africa: {
    objective: 'Stop {{n}} of {{total}}',
    find: 'Find {{name}} on the map',
    hint: 'Hint: {{region}}',
    tap: 'Tap where you think it is, then check.',
    check: 'Check',
    found: 'Found it! +{{points}}',
    missed: 'Not quite. {{name}} is here.',
    visit: 'Visit {{landmark}}',
    passport: 'PASSPORT',
    stamp: '{{name}} stamped',
    facts: 'DID YOU KNOW?',
    question: 'QUESTION',
    next: 'Next country',
    mapA11y: 'Map of Africa. Tap to place a pin.',
  },
};
