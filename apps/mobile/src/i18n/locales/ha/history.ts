/** Knowzone World Museum of Time (Hausa): walking around the museum, its stations and the History & Geography games. */
import type { Translation } from '../../types';
import type en from '../en/history';

const history: Translation<typeof en> = {
  title: 'Gidan Tarihin Zamani',
  entryEyebrow: 'TARIHI & LABARIN ƘASA · SABO',
  entryTitle: 'Gidan Tarihin Zamani',
  entryBody: 'Yi tafiya cikin tarihi, tono biranen da suka ɓace kuma bincika Afirka',
  leave: 'Fita daga gidan tarihin',
  offline: 'Gidan Tarihin Zamani yana buƙatar intanet, saboda sabar mu ce ke duba kowace amsa.',
  result: {
    back: 'Koma gidan tarihin',
  },
  hall: {
    walkTo: 'Tafi zuwa {{station}}',
    you: 'Kai ne, mai bincike',
    open: 'Shiga {{station}}',
    goHere: 'Je nan',
    stars: 'Taurari {{count}} cikin {{max}}',
    tip: 'Tafi wurin wani nuni don fara wasa. Danna suna don tafiya can.',
  },
  stations: {
    timemachine: 'Injin lokaci',
    dig: 'Wayewar da suka ɓace',
    maptable: 'Taswirar Afirka',
  },
  games: {
    'time-machine': {
      name: 'Injin Lokaci na Tarihi',
      how: 'Yi tafiya zuwa lokuta na gaske a tarihi, daga pyramids har zuwa ’yancin kan Najeriya. Zagaya kowane zamani kuma warware ƙalubalensa.',
    },
    'lost-civilization': {
      name: 'Wayewar da ta Ɓace',
      how: 'Tono kayan tarihi a tsoffin wurare, karanta alamomi, kuma faɗi sunan wayewar da ta yi su don buɗe birninta.',
    },
    'africa-explorer': {
      name: 'Mai Binciken Afirka',
      how: 'Nemo ƙasashe a taswirar Afirka, ziyarci shahararrun wuraren su, kuma tattara tambarin fasfo don kowace ɗaya.',
    },
  },
  time: {
    objective: 'Zamani {{n}} cikin {{total}}: {{title}}',
    travelling: 'Ana tafiya zuwa {{when}}…',
    spot: 'Tafi wurin da ke haskakawa don samun ƙalubale.',
    challenge: 'ƘALUBALE {{n}} CIKIN {{total}}',
    nextEra: 'Zamani na gaba',
    order: {
      earliest: 'MAFI DAƊEWA',
      latest: 'MAFI KUSA',
      up: 'Matsar da “{{item}}” zuwa baya a lokaci',
      down: 'Matsar da “{{item}}” zuwa gaba a lokaci',
      check: 'Duba jerin',
      right: 'Jerin lokaci cikakke! +{{points}}',
      wrong: 'Ba daidai ba sosai. Ga jerin da ya dace.',
    },
  },
  dig: {
    objective: 'Tono {{n}} cikin {{total}}',
    spot: 'Wurin tono {{n}}',
    dig: 'Tona',
    tap: 'Danna don tona a hankali',
    digA11y: 'Tona nan',
    found: 'AN SAMI KAYAN TARIHI',
    finds: 'Kayan tarihi {{done}} cikin {{total}}',
    collect: 'Ɗauka',
    solve: 'Warware asirin',
    unlocked: 'An buɗe birnin!',
    cities: 'An buɗe birane {{count}} cikin {{total}}',
    next: 'Tono na gaba',
  },
  africa: {
    objective: 'Tasha {{n}} cikin {{total}}',
    find: 'Nemo {{name}} a taswira',
    hint: 'Alama: {{region}}',
    tap: 'Danna inda kake tsammani yake, sannan ka duba.',
    check: 'Duba',
    found: 'Ka same shi! +{{points}}',
    missed: 'Ba daidai ba sosai. {{name}} yana nan.',
    visit: 'Ziyarci {{landmark}}',
    passport: 'FASFO',
    stamp: 'An buga tambarin {{name}}',
    facts: 'KA SANI?',
    question: 'TAMBAYA',
    next: 'Ƙasa ta gaba',
    mapA11y: 'Taswirar Afirka. Danna don sanya fil.',
  },
};

export default history;
