/** Knowzone World Museum of Time (Nigerian Pidgin): walking around the museum, its stations and the History & Geography games. */
import type { Translation } from '../../types';
import type en from '../en/history';

const history: Translation<typeof en> = {
  title: 'Museum of Time',
  entryEyebrow: 'HISTORY & GEOGRAPHY · NEW',
  entryTitle: 'Museum of Time',
  entryBody: 'Travel go inside history, dig find old cities wey don lost and go explore Africa',
  leave: 'Comot from the museum',
  offline: 'Museum of Time need internet, because na our server dey check every answer.',
  result: {
    back: 'Go back to the museum',
  },
  hall: {
    walkTo: 'Waka go the {{station}}',
    you: 'Na you be dis, the explorer',
    open: 'Enter the {{station}}',
    goHere: 'Go here',
    stars: '{{count}} out of {{max}} stars',
    tip: 'Waka go one exhibit to start game. Tap any name to waka go there.',
  },
  stations: {
    timemachine: 'Time machine',
    dig: 'Old civilizations wey don lost',
    maptable: 'Africa map',
  },
  games: {
    'time-machine': {
      name: 'History Time Machine',
      how: 'Travel go real moments for history, from the pyramids reach Nigeria independence. Waka round each era and solve the challenges wey dey there.',
    },
    'lost-civilization': {
      name: 'Lost Civilization',
      how: 'Dig find old things for ancient places, read the clues, and talk which civilization make them so you fit open their city.',
    },
    'africa-explorer': {
      name: 'Africa Explorer',
      how: 'Find countries for Africa map, visit the famous places wey dey there, and collect passport stamp for each one.',
    },
  },
  time: {
    objective: 'Era {{n}} out of {{total}}: {{title}}',
    travelling: 'We dey travel go {{when}}…',
    spot: 'Waka go any place wey dey shine to find challenge.',
    challenge: 'CHALLENGE {{n}} OUT OF {{total}}',
    nextEra: 'Next era',
    order: {
      earliest: 'THE FIRST ONE',
      latest: 'THE LAST ONE',
      up: 'Move “{{item}}” go before',
      down: 'Move “{{item}}” go after',
      check: 'Check the order',
      right: 'Correct timeline! +{{points}}',
      wrong: 'E never correct. See the correct order for here.',
    },
  },
  dig: {
    objective: 'Dig {{n}} out of {{total}}',
    spot: 'Dig place {{n}}',
    dig: 'Dig',
    tap: 'Tap to dig small-small',
    digA11y: 'Dig here',
    found: 'YOU DON FIND ARTIFACT',
    finds: '{{done}} out of {{total}} artifacts',
    collect: 'Collect am',
    solve: 'Solve the mystery',
    unlocked: 'City don open!',
    cities: '{{count}} out of {{total}} cities don open',
    next: 'Next dig',
  },
  africa: {
    objective: 'Stop {{n}} out of {{total}}',
    find: 'Find {{name}} for the map',
    hint: 'Hint: {{region}}',
    tap: 'Tap where you think say e dey, then check.',
    check: 'Check',
    found: 'You don find am! +{{points}}',
    missed: 'E never correct. {{name}} dey here.',
    visit: 'Visit {{landmark}}',
    passport: 'PASSPORT',
    stamp: '{{name}} don get stamp',
    facts: 'YOU KNOW SAY?',
    question: 'QUESTION',
    next: 'Next country',
    mapA11y: 'Map of Africa. Tap to put pin.',
  },
};

export default history;
