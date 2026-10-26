/** Knowzone World Museum of Time (Swahili): walking around the museum, its stations and the History & Geography games. */
import type { Translation } from '../../types';
import type en from '../en/history';

const history: Translation<typeof en> = {
  title: 'Makumbusho ya Wakati',
  entryEyebrow: 'HISTORIA & JIOGRAFIA · MPYA',
  entryTitle: 'Makumbusho ya Wakati',
  entryBody: 'Safiri katika historia, chimbua miji iliyopotea na uchunguze Afrika',
  leave: 'Ondoka makumbushoni',
  offline: 'Makumbusho ya Wakati yanahitaji intaneti, kwa sababu kila jibu hukaguliwa kwenye seva yetu.',
  result: {
    back: 'Rudi makumbushoni',
  },
  hall: {
    walkTo: 'Tembea hadi {{station}}',
    you: 'Wewe, mvumbuzi',
    open: 'Ingia {{station}}',
    goHere: 'Nenda hapa',
    stars: 'Nyota {{count}} kati ya {{max}}',
    tip: 'Tembea hadi kwenye maonyesho ili kuanza mchezo. Gusa jina ili kutembea huko.',
  },
  stations: {
    timemachine: 'Mashine ya wakati',
    dig: 'Ustaarabu uliopotea',
    maptable: 'Ramani ya Afrika',
  },
  games: {
    'time-machine': {
      name: 'Mashine ya Wakati ya Historia',
      how: 'Safiri hadi nyakati halisi za historia, kuanzia piramidi hadi uhuru wa Nigeria. Tembea katika kila enzi na utatue changamoto zake.',
    },
    'lost-civilization': {
      name: 'Ustaarabu Uliopotea',
      how: 'Chimbua vitu vya kale kwenye maeneo ya zamani, soma vidokezo, na utaje ustaarabu uliovitengeneza ili kufungua mji wake.',
    },
    'africa-explorer': {
      name: 'Mvumbuzi wa Afrika',
      how: 'Tafuta nchi kwenye ramani ya Afrika, tembelea maeneo yao maarufu, na ukusanye muhuri wa pasipoti kwa kila moja.',
    },
  },
  time: {
    objective: 'Enzi {{n}} kati ya {{total}}: {{title}}',
    travelling: 'Tunasafiri hadi {{when}}…',
    spot: 'Tembea hadi sehemu inayong’aa ili kupata changamoto.',
    challenge: 'CHANGAMOTO {{n}} KATI YA {{total}}',
    nextEra: 'Enzi inayofuata',
    order: {
      earliest: 'YA ZAMANI ZAIDI',
      latest: 'YA KARIBUNI ZAIDI',
      up: 'Sogeza “{{item}}” mapema zaidi',
      down: 'Sogeza “{{item}}” baadaye zaidi',
      check: 'Kagua mpangilio',
      right: 'Mfuatano kamili! +{{points}}',
      wrong: 'Bado kidogo. Huu ndio mpangilio sahihi.',
    },
  },
  dig: {
    objective: 'Uchimbaji {{n}} kati ya {{total}}',
    spot: 'Eneo la kuchimba {{n}}',
    dig: 'Chimba',
    tap: 'Gusa ili kuchimba kwa uangalifu',
    digA11y: 'Chimba hapa',
    found: 'KITU CHA KALE KIMEPATIKANA',
    finds: 'Vitu vya kale {{done}} kati ya {{total}}',
    collect: 'Chukua',
    solve: 'Tatua fumbo',
    unlocked: 'Mji umefunguliwa!',
    cities: 'Miji {{count}} kati ya {{total}} imefunguliwa',
    next: 'Uchimbaji unaofuata',
  },
  africa: {
    objective: 'Kituo {{n}} kati ya {{total}}',
    find: 'Tafuta {{name}} kwenye ramani',
    hint: 'Kidokezo: {{region}}',
    tap: 'Gusa mahali unapofikiri ilipo, kisha kagua.',
    check: 'Kagua',
    found: 'Umeipata! +{{points}}',
    missed: 'Bado kidogo. {{name}} iko hapa.',
    visit: 'Tembelea {{landmark}}',
    passport: 'PASIPOTI',
    stamp: '{{name}} imegongwa muhuri',
    facts: 'JE, WAJUA?',
    question: 'SWALI',
    next: 'Nchi inayofuata',
    mapA11y: 'Ramani ya Afrika. Gusa ili kuweka pini.',
  },
};

export default history;
