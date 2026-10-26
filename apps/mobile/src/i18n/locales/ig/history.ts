/** Knowzone World Museum of Time (Igbo): walking around the museum, its stations and the History & Geography games. */
import type { Translation } from '../../types';
import type en from '../en/history';

const history: Translation<typeof en> = {
  title: 'Ụlọ Ngosi Oge',
  entryEyebrow: 'AKỤKỌ IHE MERE EME & JỌGRAFI · ỌHỤRỤ',
  entryTitle: 'Ụlọ Ngosi Oge',
  entryBody: 'Gaa njem n’akụkọ ihe mere eme, gwupụta obodo ndị furu efu ma nyochaa Afrịka',
  leave: 'Pụọ n’ụlọ ngosi ahụ',
  offline: 'Ụlọ Ngosi Oge chọrọ ịntanetị, n’ihi na ọ bụ sava anyị na-enyocha azịza ọ bụla.',
  result: {
    back: 'Laghachi n’ụlọ ngosi ahụ',
  },
  hall: {
    walkTo: 'Gaa na {{station}}',
    you: 'Gị onwe gị, onye nyocha',
    open: 'Banye na {{station}}',
    goHere: 'Gaa ebe a',
    stars: 'Kpakpando {{count}} n’ime {{max}}',
    tip: 'Gaa n’ebe ngosi iji malite egwuregwu. Pịa aha iji gaa ebe ahụ.',
  },
  stations: {
    timemachine: 'Igwe oge',
    dig: 'Mmepeanya ndị furu efu',
    maptable: 'Maapụ Afrịka',
  },
  games: {
    'time-machine': {
      name: 'Igwe Oge Akụkọ',
      how: 'Gaa njem n’oge ndị ezi n’akụkọ ihe mere eme, site na pyramid ruo nnwere onwe Naịjirịa. Jegharịa n’oge ọ bụla ma dozie ihe ịma aka ya.',
    },
    'lost-civilization': {
      name: 'Mmepeanya Furu Efu',
      how: 'Gwupụta ihe ochie n’ebe ndị mgbe ochie, gụọ ihe ngosi, ma kpọọ aha mmepeanya mere ha iji meghee obodo ya.',
    },
    'africa-explorer': {
      name: 'Onye Nyocha Afrịka',
      how: 'Chọta mba dị iche iche na maapụ Afrịka, gaa leta ebe ama ama ha, ma nakọta stampụ paspọtụ maka nke ọ bụla.',
    },
  },
  time: {
    objective: 'Oge {{n}} n’ime {{total}}: {{title}}',
    travelling: 'Anyị na-aga {{when}}…',
    spot: 'Gaa n’ebe na-enwu enwu iji chọta ihe ịma aka.',
    challenge: 'IHE ỊMA AKA {{n}} N’IME {{total}}',
    nextEra: 'Oge na-esote',
    order: {
      earliest: 'NKE BỤ ỤZỌ',
      latest: 'NKE IKPEAZỤ',
      up: 'Bulie “{{item}}” gaa n’ihu',
      down: 'Weghachi “{{item}}” azụ',
      check: 'Nyochaa usoro',
      right: 'Usoro oge zuru oke! +{{points}}',
      wrong: 'O zubeghị. Lee usoro ziri ezi.',
    },
  },
  dig: {
    objective: 'Ngwupụta {{n}} n’ime {{total}}',
    spot: 'Ebe ngwupụta {{n}}',
    dig: 'Gwuo',
    tap: 'Pịa iji gwuo nwayọ nwayọ',
    digA11y: 'Gwuo ebe a',
    found: 'Ị CHỌTARA IHE OCHIE',
    finds: 'Ihe ochie {{done}} n’ime {{total}}',
    collect: 'Nara ya',
    solve: 'Dozie ihe omimi ahụ',
    unlocked: 'Emeghere obodo ahụ!',
    cities: 'Emeghere obodo {{count}} n’ime {{total}}',
    next: 'Ngwupụta na-esote',
  },
  africa: {
    objective: 'Nkwụsị {{n}} n’ime {{total}}',
    find: 'Chọta {{name}} na maapụ',
    hint: 'Ntụaka: {{region}}',
    tap: 'Pịa ebe i chere na ọ dị, wee nyochaa.',
    check: 'Nyochaa',
    found: 'Ị chọtala ya! +{{points}}',
    missed: 'O zubeghị. {{name}} dị ebe a.',
    visit: 'Gaa leta {{landmark}}',
    passport: 'PASPỌTỤ',
    stamp: 'Etinyela stampụ {{name}}',
    facts: 'Ị MARA?',
    question: 'AJỤJỤ',
    next: 'Mba na-esote',
    mapA11y: 'Maapụ Afrịka. Pịa iji tinye pin.',
  },
};

export default history;
