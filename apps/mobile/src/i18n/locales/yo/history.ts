/** Knowzone World Museum of Time (Yoruba): walking around the museum, its stations and the History & Geography games. */
import type { Translation } from '../../types';
import type en from '../en/history';

const history: Translation<typeof en> = {
  title: 'Ilé Ìṣúra Àkókò',
  entryEyebrow: 'ÌTÀN & JỌ́GÍRÁFÌ · TUNTUN',
  entryTitle: 'Ilé Ìṣúra Àkókò',
  entryBody: 'Rìnrìn àjò nínú ìtàn, wa àwọn ìlú tó ti sọnù jáde, kí o sì ṣàwárí Áfíríkà',
  leave: 'Kúrò nínú ilé ìṣúra náà',
  offline: 'Ilé Ìṣúra Àkókò nílò íntánẹ́ẹ̀tì, nítorí pé sáfà wa ló ń ṣàyẹ̀wò gbogbo ìdáhùn.',
  result: {
    back: 'Padà sí ilé ìṣúra náà',
  },
  hall: {
    walkTo: 'Rìn lọ sí {{station}}',
    you: 'Ìwọ rèé, aṣàwárí',
    open: 'Wọ inú {{station}}',
    goHere: 'Lọ síbí',
    stars: 'Ìràwọ̀ {{count}} nínú {{max}}',
    tip: 'Rìn lọ sí ibi ìfihàn kan láti bẹ̀rẹ̀ eré. Tẹ orúkọ kan láti rìn lọ síbẹ̀.',
  },
  stations: {
    timemachine: 'Ẹ̀rọ àkókò',
    dig: 'Àwọn ọ̀làjú tó ti sọnù',
    maptable: 'Máàpù Áfíríkà',
  },
  games: {
    'time-machine': {
      name: 'Ẹ̀rọ Àkókò Ìtàn',
      how: 'Rìnrìn àjò lọ sí àwọn àkókò gidi nínú ìtàn, láti àwọn pyramid dé òmìnira Nàìjíríà. Rìn yíká sáà kọ̀ọ̀kan kí o sì yanjú àwọn ìpèníjà rẹ̀.',
    },
    'lost-civilization': {
      name: 'Ọ̀làjú Tó Sọnù',
      how: 'Wa àwọn ohun àtijọ́ jáde ní àwọn ibi ìgbàanì, ka àwọn àmì, kí o sì dárúkọ ọ̀làjú tó ṣe wọ́n láti ṣí ìlú rẹ̀.',
    },
    'africa-explorer': {
      name: 'Aṣàwárí Áfíríkà',
      how: 'Wá àwọn orílẹ̀-èdè lórí máàpù Áfíríkà, ṣèbẹ̀wò sí àwọn ibi olókìkí wọn, kí o sì gba òǹtẹ̀ ìwé ìrìnnà fún ọ̀kọ̀ọ̀kan.',
    },
  },
  time: {
    objective: 'Sáà {{n}} nínú {{total}}: {{title}}',
    travelling: 'À ń rìnrìn àjò lọ sí {{when}}…',
    spot: 'Rìn lọ sí ibi tó ń tàn láti rí ìpèníjà kan.',
    challenge: 'ÌPÈNÍJÀ {{n}} NÍNÚ {{total}}',
    nextEra: 'Sáà tó kàn',
    order: {
      earliest: 'ÈYÍ TÓ KỌ́KỌ́ ṢẸLẸ̀',
      latest: 'ÈYÍ TÓ ṢẸLẸ̀ GBẸ̀YÌN',
      up: 'Gbé “{{item}}” sí ìṣáájú',
      down: 'Gbé “{{item}}” sí ẹ̀yìn',
      check: 'Ṣàyẹ̀wò ètò náà',
      right: 'Ìtòlẹ́sẹẹsẹ pípé! +{{points}}',
      wrong: 'Kò tíì tọ́ pátápátá. Ètò tó tọ́ nìyí.',
    },
  },
  dig: {
    objective: 'Wíwalẹ̀ {{n}} nínú {{total}}',
    spot: 'Ibi wíwalẹ̀ {{n}}',
    dig: 'Walẹ̀',
    tap: 'Tẹ̀ láti walẹ̀ pẹ̀lú ìṣọ́ra',
    digA11y: 'Walẹ̀ níbí',
    found: 'A RÍ OHUN ÀTIJỌ́ KAN',
    finds: 'Ohun àtijọ́ {{done}} nínú {{total}}',
    collect: 'Gbà á',
    solve: 'Yanjú àdììtú náà',
    unlocked: 'A ti ṣí ìlú náà!',
    cities: 'A ti ṣí ìlú {{count}} nínú {{total}}',
    next: 'Wíwalẹ̀ tó kàn',
  },
  africa: {
    objective: 'Ibùdó {{n}} nínú {{total}}',
    find: 'Wá {{name}} lórí máàpù',
    hint: 'Àmì: {{region}}',
    tap: 'Tẹ ibi tí o rò pé ó wà, lẹ́yìn náà ṣàyẹ̀wò.',
    check: 'Ṣàyẹ̀wò',
    found: 'O rí i! +{{points}}',
    missed: 'Kò tíì tọ́. {{name}} wà níbí.',
    visit: 'Ṣèbẹ̀wò sí {{landmark}}',
    passport: 'ÌWÉ ÌRÌNNÀ',
    stamp: 'A ti tẹ òǹtẹ̀ {{name}}',
    facts: 'ṢÉ O MỌ̀?',
    question: 'ÌBÉÈRÈ',
    next: 'Orílẹ̀-èdè tó kàn',
    mapA11y: 'Máàpù Áfíríkà. Tẹ̀ láti fi pin kan sí i.',
  },
};

export default history;
