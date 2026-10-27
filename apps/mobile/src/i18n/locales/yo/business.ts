/** Knowzone World Business District (Yoruba): walking around the square, its places and the five business games. */
import type { Translation } from '../../types';
import type en from '../en/business';

const business: Translation<typeof en> = {
  title: 'Agbègbè Iṣẹ́-Ajé',
  entryEyebrow: 'IṢẸ́-AJÉ & ÌṢÚNÁ · TUNTUN',
  entryTitle: 'Agbègbè Iṣẹ́-Ajé',
  entryBody:
    'Darí ilé-iṣẹ́ tuntun, mọ ètò ìnáwó dáadáa, fi iye lé ọjà ní ọjà, jẹ́ kí ilé-iṣẹ́ ẹ̀rọ máa jèrè, kí o sì fi owó ìdánrawò ṣe ìdókòwò',
  leave: 'Kúrò nínú Agbègbè Iṣẹ́-Ajé',
  offline: 'Agbègbè Iṣẹ́-Ajé nílò íntánẹ́ẹ̀tì, nítorí pé sáfà wa ló ń ṣiṣẹ́ lórí gbogbo ìpinnu.',
  result: {
    back: 'Padà sí Agbègbè Iṣẹ́-Ajé',
  },
  hall: {
    walkTo: 'Rìn lọ sí {{station}}',
    you: 'Ìwọ rèé, nínú blazer Knowzone rẹ',
    open: 'Wọ inú {{station}}',
    goHere: 'Lọ síbí',
    stars: 'Ìràwọ̀ {{count}} nínú {{max}}',
    tip: 'Rìn lọ sí ilé kan láti bẹ̀rẹ̀ eré. Tẹ orúkọ kan láti rìn lọ síbẹ̀.',
  },
  stations: {
    startup: 'Olú-ilé Startup',
    budget: 'Báńkì Ètò Ìnáwó',
    market: 'Gbàgede Ọjà',
    factory: 'Ilé-iṣẹ́ Èrè',
    exchange: 'Ọjà Ìpín (Stock Exchange)',
  },
  games: {
    'startup-tycoon': {
      name: 'Ọ̀gá Startup',
      how: 'Darí ilé-iṣẹ́ tìrẹ lóṣooṣù: gba àwọn olùṣe, olùtajà àti òṣìṣẹ́ ìrànlọ́wọ́, ná owó sórí ìpolówó, kí o sì ṣe àwọn ìpinnu ìṣàkóso tó le. Mú kí iye rẹ̀ pọ̀ sí i láìjẹ́ kí owó tán.',
    },
    'budget-master': {
      name: 'Ọ̀gá Ètò Ìnáwó',
      how: 'Ṣètò owó oṣù kan: san àwọn owó tó yẹ, jẹun dáadáa, fi owó pamọ́ fún àfojúsùn kan, kó owó pàjáwìrì jọ, kí o sì kojú ohun àìròtẹ́lẹ̀ láìjẹ gbèsè.',
    },
    'market-master': {
      name: 'Ọ̀gá Ọjà',
      how: 'Darí àtẹ ọjà kan: yan iye owó rẹ àti iye ọjà tí o máa rà lójoojúmọ́ bí ojú ọjọ́, èrò àti alátakò ṣe ń yí ìfẹ́ àwọn oníbàárà padà.',
    },
    'profit-quest': {
      name: 'Ìrìn-àjò Èrè',
      how: 'Mọ ìṣirò iṣẹ́-ajé (margin, break-even, èrè), lẹ́yìn náà darí ilé-iṣẹ́ ẹ̀rọ lọ́sọ̀ọ̀sẹ̀: fi iye owó lélẹ̀, iye tí o máa ṣe àti ìgbà tí o máa dókòwò.',
    },
    'market-simulator': {
      name: 'Ìfarawé Ọjà Ìpín',
      how: 'Fi owó ìdánrawò dókòwò sínú àwọn ilé-iṣẹ́ àròsọ, bond àti index fund. Ìròyìn ń mú ọjà yí padà: pín ewu rẹ ká, kí o sì kọ́ bí ìdókòwò ṣe ń ṣiṣẹ́. Kì í ṣe owó gidi.',
    },
  },

  ui: {
    money: '${{amount}}',
    minus: '−${{amount}}',
    perMonth: '${{amount}}/oṣù',
    next: 'Tó kàn',
    finish: 'Wo èsì',
    best: 'Ìyàn tó dára jù',
    good: 'Ìyàn tó dára',
    fair: 'Ìyàn tó tẹ́wọ́gbà',
    poor: 'Ìyàn tí kò dára',
    bestWas: 'Ìyàn tó dára jù ni: {{choice}}',
    lesson: 'ẸKỌ́ IṢẸ́-AJÉ',
    left: 'Ó kù láti ṣètò: ${{amount}}',
    over: 'Ó pọ̀ jù ní ${{amount}}',
    points: '+{{points}} máàkì',
    more: 'Púpọ̀ sí i',
    less: 'Kéré sí i',
    pick: 'Kọ́kọ́ yan ìyàn kan.',
    unbalanced: 'Ṣètò gbogbo dọ́là: àpapọ̀ gbọ́dọ̀ bá a mu gẹ́lẹ́.',
    invalid: 'A kò gba ètò yẹn láàyè. Ṣàyẹ̀wò àwọn nọ́ńbà náà.',
  },

  // ─── Startup Tycoon ────────────────────────────────────────────────────────
  startup: {
    companies: {
      bakery: 'Sunrise Bakery & Café',
      repair: 'FixIt Phone Repair',
      apps: 'Pixel App Studio',
      fashion: 'Thread Fashion Label',
      solar: 'BrightSun Solar Installers',
    },
    sale: {
      bakery: 'kéèkì àti kọfí',
      repair: 'àtúnṣe',
      apps: 'iṣẹ́ app',
      fashion: 'aṣọ',
      solar: 'ìfisílẹ̀ solar',
    },
    month: 'Oṣù {{n}} nínú {{total}}',
    goal: 'Àfojúsùn: kí ìpín rẹ tó ${{goal}}',
    value: 'Iye ilé-iṣẹ́',
    cash: 'Owó lọ́wọ́',
    morale: 'Ẹ̀mí òṣìṣẹ́',
    rep: 'Orúkọ rere',
    owned: 'Ìwọ ní {{pct}}%',
    decision: 'ÌPINNU OṢÙ YÌÍ',
    team: 'ẸGBẸ́ RẸ',
    roles: {
      maker: 'Olùṣe',
      seller: 'Olùtajà',
      support: 'Ìrànlọ́wọ́',
    },
    roleHint: {
      maker: 'Ẹnìkọ̀ọ̀kan ń ṣe nǹkan bí {{n}} {{sale}} lóṣù',
      seller: 'Ẹnìkọ̀ọ̀kan ń mú nǹkan bí oníbàárà {{n}} sí i wá lóṣù',
      support: 'Ń bójú tó ìwé àti oníbàárà; ẹnìkọ̀ọ̀kan ń tọ́jú ẹlẹgbẹ́ mẹ́rin',
    },
    salary: '${{amount}}/oṣù fún ẹnìkọ̀ọ̀kan',
    hireCost: 'Owó gbígbà síṣẹ́: ${{amount}} (wíwá àti ìdánilẹ́kọ̀ọ́)',
    payroll: 'Owó oṣù òṣìṣẹ́: ${{amount}}/oṣù',
    marketing: 'ÌPOLÓWÓ OṢÙ YÌÍ',
    none: 'Kò sí',
    run: 'Ṣe oṣù náà',
    report: 'ÌRÒYÌN OṢÙ {{n}}',
    statement: {
      revenue: 'Owó tó wọlé (títà)',
      cogs: 'Iye owó ọjà tí a tà',
      gross: 'Èrè àkọ́kọ́ ({{pct}}% margin)',
      payroll: 'Owó oṣù',
      rent: 'Owó ilé',
      marketing: 'Ìpolówó',
      other: 'Ìnáwó àti owó-wọlé ẹ̀ẹ̀kan',
      loan: 'Ìsan gbèsè',
      net: 'Èrè gidi',
      cash: 'Owó ní báńkì',
      runway: 'Bí ó ṣe ń lọ yìí, owó máa tó fún oṣù {{count}} sí i',
    },
    ops: {
      line: 'Oníbàárà {{demand}} ló fẹ́ rà · ẹgbẹ́ rẹ lè sin {{capacity}} · o tà {{sold}}',
      order: 'Pẹ̀lú àṣẹ pàtàkì ti {{count}}',
      turnedAway: 'O dá oníbàárà {{count}} padà. Olùṣe púpọ̀ sí i ì bá ti mú owó púpọ̀ wá.',
      idle: 'Àwọn olùṣe rẹ ní àkókò àṣeṣẹ́. Olùtajà tàbí ìpolówó púpọ̀ sí i máa mú oníbàárà wá.',
      balanced: 'Ohun tí ẹgbẹ́ rẹ ṣe bá ìfẹ́ oníbàárà mu dáadáa.',
      overload: 'Ẹgbẹ́ rẹ ti tóbi jù fún òṣìṣẹ́ ìrànlọ́wọ́: gbogbo ènìyàn ló falẹ̀.',
      saturated: 'Ọjà rẹ ti ń kún: olùtajà tuntun kọ̀ọ̀kan ń mú oníbàárà díẹ̀ wá.',
    },
    bankrupt: 'Owó ti tán! Ilé-iṣẹ́ lè máa jèrè lórí ìwé, kí ó sì tún ṣubú tí owó lọ́wọ́ bá tán.',
    dilemmas: {
      poach: {
        title: 'Olùṣe rẹ tó dára jù fẹ́ lọ?',
        body: 'Ilé-iṣẹ́ alátakò kan fún olùṣe rẹ tó mọṣẹ́ jù ní iṣẹ́ tí owó rẹ̀ pọ̀ jù. Ó fẹ́ dúró, ṣùgbọ́n ó nílò àfikún owó oṣù.',
        options: {
          match: 'Fi $120/oṣù kún owó oṣù gbogbo olùṣe',
          letGo: 'Kí i pé ó dàbọ̀, kí o sì jẹ́ kí ó lọ',
          threaten: 'Sọ fún un pé yóò kábàámọ̀ tí ó bá lọ',
        },
        lesson:
          'Rírọ́pò òṣìṣẹ́ rere sábà máa ń náni ju dídá a dúró lọ: wíwá ẹlòmíì, ìdánilẹ́kọ̀ọ́ àti iṣẹ́ tó sọnù nígbà tí ẹni tuntun ń kọ́ṣẹ́. Owó oṣù tó tọ́ ń dá àwọn tó dára jù dúró, ó sì ń gbé ẹ̀mí wọn ró.',
      },
      bigOrder: {
        title: 'Àṣẹ ńlá, pẹ̀lú ẹ̀dínwó ńlá',
        body: 'Oníbàárà ńlá kan fẹ́ àṣẹ ńlá lóṣù yìí, ṣùgbọ́n ní ẹ̀dínwó 40% lórí iye owó rẹ nìkan.',
        options: {
          negotiate: 'Ṣe ìdúnàádúrà: àṣẹ kékeré ní ẹ̀dínwó 15%',
          accept: 'Gba ẹ̀dínwó 40% náà',
          decline: 'Kọ̀ ọ́ pẹ̀lú ọ̀wọ̀',
        },
        lesson:
          'Ẹ̀dínwó ń yọ tààrà kúrò nínú èrè rẹ. Kí o tó gbà, rí i dájú pé iye owó náà ṣì bo ohun tí ó ná ọ láti ṣe ọ̀kọ̀ọ̀kan, àti pé o ní agbára àṣeṣẹ́. Ìdúnàádúrà jẹ́ ohun àṣà nínú iṣẹ́-ajé.',
      },
      review: {
        title: 'Àtúnyẹ̀wò ìbínú lórí íntánẹ́ẹ̀tì',
        body: 'Oníbàárà kan kọ pé iṣẹ́ rẹ falẹ̀, ó sì ní ìwà àìdára. Àwọn ènìyàn mìíràn ń kà á.',
        options: {
          fix: 'Tọrọ àforíjìn ní gbangba, ṣàtúnṣe ìṣòro náà kí o sì dá owó rẹ̀ padà',
          ignore: 'Má kọbi ara sí i, wọn yóò gbàgbé rẹ̀',
          argue: 'Fèsì pé oníbàárà náà ń purọ́',
        },
        lesson:
          'Orúkọ rere rẹ ń mú oníbàárà padà wá, ó sì ń mú kí wọ́n dámọ̀ràn rẹ. Ìdáhùn òtítọ́ ní gbangba sí ẹ̀sùn sábà máa ń jèrè ìgbẹ́kẹ̀lé ju àìní ẹ̀sùn rárá lọ.',
      },
      burnout: {
        title: 'Ẹgbẹ́ náà ti rẹ̀',
        body: 'Lẹ́yìn ọ̀sẹ̀ púpọ̀ iṣẹ́ àṣekún, ó ti rẹ àwọn òṣìṣẹ́ rẹ, wọ́n sì ń ṣe àṣìṣe.',
        options: {
          rest: 'Fún gbogbo ènìyàn ní ọjọ́ ìsinmi tí a sanwó fún, kí o sì gba olùrànlọ́wọ́ fún ìgbà díẹ̀',
          pizza: 'Ra pizza fún ẹgbẹ́ náà',
          push: 'Béèrè fún iṣẹ́ àṣekún púpọ̀ sí i lóṣù yìí',
        },
        lesson:
          'Ènìyàn tí ó rẹ̀ ń ṣe díẹ̀, ó sì máa ń fiṣẹ́ sílẹ̀. Títì wọ́n ju ààlà lọ ń mú iṣẹ́ pọ̀ fún ìgbà díẹ̀, ṣùgbọ́n ó ń ná ọ lẹ́yìn náà nínú ẹ̀mí òṣìṣẹ́ àti òṣìṣẹ́ tí ń kúrò. Alákòóso rere ń dáàbò bo agbára ẹgbẹ́ rẹ̀.',
      },
      agency: {
        title: 'Ìlérí ìpolówó "viral"',
        body: 'Ilé-iṣẹ́ ìpolówó kan ṣèlérí pé ìpolówó $2,000 yóò sọ ọ́ di olókìkí lóru ọjọ́ kan.',
        options: {
          test: 'Gbìyànjú ìdánwò kékeré $300 kí o sì wọn èsì rẹ̀',
          pay: 'San $2,000 náà pátá',
          skip: 'Fò ó',
        },
        lesson:
          'Dán an wò kí o tó ná owó ńlá. Ìdánwò kékeré tí a wọn ń fi hàn bóyá ìpolówó ń mú oníbàárà wá lóòótọ́, kí o lè fẹ̀ ohun tó ń ṣiṣẹ́ nìkan. Ìlérí ńlá kì í ṣe ẹ̀rí.',
      },
      fancyOffice: {
        title: 'Ọ́fíìsì tuntun tó rẹwà?',
        body: 'O lè kó lọ sí ọ́fíìsì aláràbarà tó ní yàrá eré. Kíkó lọ ń ná $2,500, owó ilé sì máa lé ní 30%.',
        options: {
          stay: 'Dúró, kí o sì ná owó sórí ohun tí oníbàárà ń kíyèsí',
          move: 'Kó lọ, inú ẹgbẹ́ náà máa dùn',
        },
        lesson:
          'Owó tí kò yí padà (fixed cost) bí owó ilé gbọ́dọ̀ di sísan lóṣooṣù, bóyá o tà tàbí o kò tà. Jẹ́ kí ó kéré, pàápàá ní ìbẹ̀rẹ̀, kí iṣẹ́-ajé rẹ lè la àwọn oṣù tí títà kò pọ̀ já.',
      },
      sponsor: {
        title: 'Ṣe onígbọ̀wọ́ ọjọ́ eré-ìdárayá ilé-ìwé?',
        body: 'Ilé-ìwé kan nítòsí ní kí o ṣe onígbọ̀wọ́ ọjọ́ eré-ìdárayá wọn fún $300. Orúkọ rẹ yóò wà lórí T-shirt.',
        options: {
          sponsor: 'Ṣe onígbọ̀wọ́ rẹ̀',
          decline: 'Kọ̀ ọ́ pẹ̀lú ọ̀wọ̀',
        },
        lesson:
          'Ríran àwùjọ rẹ lọ́wọ́ ń kọ́ ìfẹ́ inú rere, ó sì ń mú kí àwọn ará àdúgbò mọ orúkọ ọjà rẹ. Ó jẹ́ ìpolówó tí ó tún ń ṣe rere.',
      },
      supplier: {
        title: 'Olùpèsè rẹ fi owó kún iye ọjà',
        body: 'Àwọn ohun èlò tí o ń rà ti wọ́n sí i ní 20%.',
        options: {
          shop: 'Fi àwọn olùpèsè mìíràn wé ara wọn kí o sì ṣe ìdúnàádúrà',
          raise: 'Gbé ìnáwó náà lọ: fi 8% kún iye owó rẹ',
          cheap: 'Yí padà sí ohun èlò tí ó dín owó púpọ̀ ṣùgbọ́n tí kò dára tó',
        },
        lesson:
          'Nígbà tí ìnáwó bá gòkè, kọ́kọ́ wá káàkiri kí o sì ṣe ìdúnàádúrà. Dídín dídára ọjà kù ń dáàbò bo èrè rẹ fún oṣù kan, ṣùgbọ́n ó ń ba orúkọ rere rẹ jẹ́ fún ìgbà pípẹ́.',
      },
      latePayer: {
        title: 'Oníbàárà kan kò tíì sanwó',
        body: 'Oníbàárà ńlá kan ṣì jẹ ọ́ ní $1,500 láti ọjọ́ 60 sẹ́yìn, owó lọ́wọ́ sì ti ń wọ́n.',
        options: {
          remind: 'Rán ìránnilétí oníwà-rere kí o sì fún un ní ẹ̀dínwó kékeré tí ó bá san báyìí',
          wait: 'Dúró kí o sì retí pé yóò san',
          threaten: 'Fi agbẹjọ́rò dẹ́rù bà á',
        },
        lesson:
          'Èrè kò dàbí owó lọ́wọ́. Owó tí oníbàárà jẹ ọ́ (receivables) kò lè san owó rẹ títí yóò fi dé. Bíbéèrè owó pẹ̀lú ọ̀wọ̀ àti kíákíá ń jẹ́ kí owó máa ṣàn.',
      },
      newLine: {
        title: 'Èrò ọjà tuntun',
        body: 'Ẹnìkan nínú ẹgbẹ́ ní èrò fún irú ọjà tuntun kan.',
        options: {
          pilot: 'Kọ́kọ́ ṣe ìdánwò kékeré pẹ̀lú oníbàárà díẹ̀',
          bigLaunch: 'Ṣí i ní títóbi pẹ̀lú ọjà àti ìpolówó púpọ̀',
          later: 'Kì í ṣe báyìí',
        },
        lesson:
          'Ìmọ̀tuntun ń jẹ́ kí iṣẹ́-ajé máa dàgbà, ṣùgbọ́n bíbẹ̀rẹ̀ kékeré ń jẹ́ kí o mọ ohun tí oníbàárà fẹ́ lóòótọ́ kí o tó fi owó púpọ̀ wewu. Èyí ni a ń pè ní pilot tàbí minimum viable product.',
      },
      training: {
        title: 'Kọ́ ẹgbẹ́ náà?',
        body: 'Ẹ̀kọ́ $500 kan yóò mú kí àwọn òṣìṣẹ́ rẹ yára sí i, kí wọ́n sì mọṣẹ́ sí i.',
        options: {
          train: 'Sanwó fún ẹ̀kọ́ náà',
          free: 'Pín fídíò ọ̀fẹ́ lórí íntánẹ́ẹ̀tì dípò rẹ̀',
          skip: 'Fo ìdánilẹ́kọ̀ọ́',
        },
        lesson:
          'Ìdánilẹ́kọ̀ọ́ jẹ́ ìdókòwò nínú ènìyàn: òṣìṣẹ́ tó mọṣẹ́ ń ṣe púpọ̀ sí i, wọ́n sì ń rí i pé a mọyì wọn, èyí sì ń dá owó náà padà láàárín àwọn oṣù tó tẹ̀lé e.',
      },
      loan: {
        title: 'Gbèsè láti báńkì',
        body: 'Báńkì fún ọ ní $4,000, tí o máa san padà ní $190 lóṣù (nǹkan bí èlé 12% lọ́dún).',
        options: {
          machine: 'Yá a láti ra ẹ̀rọ tí ó ń ṣe 25% sí i',
          party: 'Yá a fún àpèjẹ ẹgbẹ́ àti àga tuntun',
          no: 'Má yá owó',
        },
        lesson:
          'Gbèsè rere ń sanwó fún ohun tí ó ń mú owó wọlé ju èlé lọ, bí ẹ̀rọ tí ó ń mú iṣẹ́ pọ̀ sí i. Yíyá owó fún ohun tí kò mú owó wọlé kàn ń fi ọ́ sílẹ̀ pẹ̀lú ìsan gbèsè.',
      },
      rent: {
        title: 'Onílé fi owó kún owó ilé',
        body: 'Onílé rẹ fẹ́ fi 25% kún owó ilé láti oṣù tó ń bọ̀.',
        options: {
          lease: 'Fi ara rẹ lélẹ̀ láti fọwọ́ sí àdéhùn gígùn fún àfikún kékeré',
          accept: 'Gba àfikún náà',
          moveFar: 'Kó lọ sí ibi tí ó dín owó, tí ó jìnnà sí oníbàárà rẹ',
        },
        lesson:
          'Ó fẹ́rẹ̀ẹ́ jẹ́ pé gbogbo nǹkan nínú iṣẹ́-ajé ló ṣeé dúnàádúrà. Fífi ohun tí ẹnìkejì mọyì lélẹ̀ (àdéhùn gígùn tó ṣeé gbẹ́kẹ̀lé) lè mú àdéhùn tó dára jù wá. Ibi tí o wà náà ṣe pàtàkì: kíkúrò lọ́dọ̀ oníbàárà ń dín títà kù.',
      },
      competitor: {
        title: 'Alátakò kan ṣí sítòsí',
        body: 'Iṣẹ́-ajé tuntun kan ṣí ní òpópónà rẹ pẹ̀lú iye owó tí ó kéré jù.',
        options: {
          quality: 'Bá wọn díje nínú dídára àti iṣẹ́ ìsìn, pẹ̀lú káàdì ìdúróṣinṣin',
          priceWar: 'Dín iye owó rẹ kù ní 25% láti borí wọn',
          nothing: 'Má ṣe nǹkankan',
        },
        lesson:
          'Ogun iye owó lè ba èrè iṣẹ́-ajé méjèèjì jẹ́. Ó sábà máa ń jẹ́ ọgbọ́n láti díje lórí ohun tó yà ọ́ sọ́tọ̀: dídára, iṣẹ́ ìsìn àti oníbàárà adúróṣinṣin.',
      },
      safety: {
        title: 'Àyẹ̀wò ààbò',
        body: 'Olùyẹ̀wò kan rí ìṣòro ààbò ní ibi iṣẹ́ rẹ.',
        options: {
          fixNow: 'Ṣàtúnṣe rẹ̀ dáadáa lẹ́sẹ̀kẹsẹ̀',
          later: 'Fi nǹkan olówó pọ́ọ́kú bò ó, kí o sì tún un ṣe lẹ́yìn',
        },
        lesson:
          'Iṣẹ́-ajé gbọ́dọ̀ pa òṣìṣẹ́ àti oníbàárà mọ́ láìléwu. Títún ìṣòro ṣe ní kùtùkùtù dín owó ju owó ìtanràn, ìjàǹbá àti orúkọ rere tí ó bàjẹ́ lọ.',
      },
      remote: {
        title: 'Ṣíṣiṣẹ́ láti ilé?',
        body: 'Àwọn òṣìṣẹ́ rẹ béèrè láti máa ṣiṣẹ́ láti ilé ní àwọn ọjọ́ kan.',
        options: {
          trial: 'Gbìyànjú rẹ̀ fún oṣù kan kí o sì wọn èsì rẹ̀',
          refuse: 'Kọ̀',
          always: 'Gbà á fún gbogbo ènìyàn, lójoojúmọ́, láìsí àyẹ̀wò',
        },
        lesson:
          'Ìrọ̀rùn lè gbé ẹ̀mí òṣìṣẹ́ ró, ṣùgbọ́n alákòóso rere ń dán àyípadà wò, ó sì ń wọn ipa rẹ̀ lórí iṣẹ́ kí ó tó pinnu pátápátá.',
      },
      investor: {
        title: 'Olùdókòwò kan fẹ́ wọlé',
        body: 'Olùdókòwò kan fẹ́ fún ọ ní $10,000 ní pàṣípààrọ̀ fún 40% ilé-iṣẹ́ rẹ.',
        options: {
          counter: 'Dá àbá tirẹ padà: $8,000 fún 20%',
          accept: 'Gba $10,000 fún 40%',
          refuse: 'Kọ̀, kí o sì dàgbà pẹ̀lú owó tìrẹ',
        },
        lesson:
          'Títà ìpín (equity) ń mú owó wá láìsí gbèsè, ṣùgbọ́n o ń fi apá kan gbogbo èrè ọjọ́ iwájú àti iye ilé-iṣẹ́ sílẹ̀. Èyí ni a ń pè ní dilution. Ṣe ìdúnàádúrà lórí iye owó ìpín rẹ.',
      },
      tax: {
        title: 'Àkókò owó-orí ti tó',
        body: 'O jẹ $700 owó-orí iṣẹ́-ajé lóṣù yìí.',
        options: {
          pay: 'San án lásìkò',
          plan: 'Béèrè fún ètò ìsanwó ìjọba',
          ignore: 'Fi í sílẹ̀ ná',
        },
        lesson:
          'Owó-orí ń sanwó fún ọ̀nà, ilé-ìwé àti ilé-ìwòsàn, gbogbo iṣẹ́-ajé ló sì gbọ́dọ̀ san án. Ìsanwó pẹ́ ń mú ìtanràn wá, nítorí náà iṣẹ́-ajé ọlọ́gbọ́n ń fi owó-orí pamọ́ bí wọ́n ṣe ń jèrè.',
      },
      bigClient: {
        title: 'Oníbàárà ńlá kan ṣoṣo',
        body: 'Oníbàárà ńlá kan fẹ́ ra ìdajì gbogbo ohun tí o ń ṣe, ṣùgbọ́n kìkì tí o bá fi àwọn oníbàárà rẹ yòókù sílẹ̀.',
        options: {
          balance: 'Gba àdéhùn kékeré kí o sì dá àwọn oníbàárà yòókù dúró',
          allIn: 'Fi gbogbo àwọn yòókù sílẹ̀ kí o sì fọwọ́ sí i',
          decline: 'Kọ̀',
        },
        lesson:
          'Gbígbára lé oníbàárà kan ṣoṣo léwu: tí ó bá lọ, ọ̀pọ̀ jù lọ iṣẹ́-ajé rẹ yóò bá a lọ. Títa fún ọ̀pọ̀ oníbàárà ń mú ilé-iṣẹ́ lágbára sí i.',
      },
      ethics: {
        title: '"Ẹ̀bùn" ìkọ̀kọ̀',
        body: 'Olùpèsè kan fẹ́ fún ọ ní ẹ̀bùn ìkọ̀kọ̀ tí o bá ń bá a lọ ní rírà lọ́wọ́ rẹ̀ ní iye owó tó ga jù.',
        options: {
          refuse: 'Kọ̀ ọ́ kí o sì fi tó àwọn aláṣẹ létí',
          accept: 'Gba ẹ̀bùn náà',
        },
        lesson:
          'Ẹ̀bùn yẹn jẹ́ àbẹ̀tẹ́lẹ̀. Ó ń ná ilé-iṣẹ́ rẹ lówó, ó sábà máa ń lòdì sófin, ó sì ń ba ìgbẹ́kẹ̀lé jẹ́. Iṣẹ́-ajé olóòótọ́ ń pẹ́ jù.',
      },
    },
  },

  // ─── Budget Master ─────────────────────────────────────────────────────────
  budget: {
    month: 'Oṣù {{n}} nínú {{total}}',
    income: 'Owó-wọlé oṣù yìí',
    bills: 'ÀWỌN OWÓ TÍ A GBỌ́DỌ̀ SAN',
    afterBills: 'Ohun tó kù lẹ́yìn owó tí a san',
    plan: 'ÈTÒ RẸ',
    billNames: {
      rent: 'Owó ilé',
      utilities: 'Iná àti omi',
      phone: 'Fóònù àti data',
      transport: 'Owó ọkọ̀',
      minimum: 'Ìsanwó tó kéré jù fún káàdì',
      subscription: 'Àsansílẹ̀ streaming',
      bankFees: 'Owó báńkì',
      carDeal: 'Ìsanwó ọkọ̀ ayọ́kẹ́lẹ́',
    },
    keys: {
      food: 'Oúnjẹ',
      fun: 'Ìgbádùn',
      clothes: 'Aṣọ',
      emergency: 'Owó pàjáwìrì',
      goal: 'Àfojúsùn ìfowópamọ́',
      debt: 'Àfikún ìsanwó káàdì',
    },
    keyHint: {
      food: 'O nílò ó kéré tán ${{min}}',
      fun: 'Jíjáde, eré, ìpápánu',
      clothes: 'Aṣọ àti bàtà tuntun',
      emergency: '${{have}} ti wà nípamọ́ · àfojúsùn ${{target}}',
      goal: '{{goal}}: ${{have}} nínú ${{target}}',
      debt: 'Gbèsè káàdì ${{have}} · èlé {{rate}}% lóṣù',
    },
    goals: {
      laptop: 'Kọ̀ǹpútà alágbèérìn tuntun',
      bike: 'Kẹ̀kẹ́',
      course: 'Ẹ̀kọ́ kóòdù',
      travel: 'Ìrìn-àjò',
      deposit: 'Owó ìdógò ilé',
    },
    rule: 'Àìní {{needs}}% · Ìfẹ́ {{wants}}% · Ìfowópamọ́ {{savings}}%',
    ruleHint: 'Ìtọ́sọ́nà rere: àìní nǹkan bí 50%, ìfẹ́ tó 30%, fi ó kéré tán 20% pamọ́.',
    restToGoal: 'Fi èyí tó kù pamọ́',
    event: 'OṢÙ YÌÍ',
    costFrom: {
      fun: '−${{amount}} láti inú owó ìgbádùn',
      emergency: '−${{amount}} láti inú owó pàjáwìrì',
      goal: '−${{amount}} láti inú ìfowópamọ́',
      card: '−${{amount}} lórí káàdì ìyáwó (credit card)',
    },
    gain: '+${{amount}} sí ìfowópamọ́',
    newBill: '+${{amount}} lóṣooṣù',
    run: 'Gbé oṣù náà',
    report: 'ÌRÒYÌN OṢÙ {{n}}',
    check: {
      food: 'O jẹun dáadáa',
      noFood: 'Owó oúnjẹ kò tó',
      saved: 'O fi {{pct}}% owó-wọlé pamọ́',
      wants: 'O ná {{pct}}% sórí ìfẹ́',
      card: '${{amount}} lọ sórí káàdì ìyáwó',
      interest: 'Èlé káàdì oṣù yìí: ${{amount}}',
      debt: 'Gbèsè káàdì báyìí: ${{amount}}',
      emergency: 'Owó pàjáwìrì: ${{amount}}',
      goal: 'Àfojúsùn ìfowópamọ́: ${{amount}} nínú ${{target}}',
    },
    events: {
      concert: {
        title: 'Ìpè sí eré orin',
        body: 'Ọ̀rẹ́ kan pè ọ́ sí eré orin. Tíkẹ́ẹ̀tì jẹ́ $80.',
        options: {
          funMoney: 'Lọ, kí o sì sanwó láti inú owó ìgbádùn',
          freePlan: 'Dábàá pikiniki ọ̀fẹ́ dípò rẹ̀',
          card: 'Lọ, kí o sì fi sórí káàdì ìyáwó',
        },
        lesson:
          'Ìgbádùn jẹ́ apá kan ètò ìnáwó tó dára: ohun tí owó ìgbádùn wà fún nìyẹn. Sísan fún ìfẹ́ pẹ̀lú gbèsè túmọ̀ sí sísan èlé lórí alẹ́ ìgbádùn kan fún ọ̀pọ̀ oṣù.',
      },
      phone: {
        title: 'Ojú fóònù tó fọ́',
        body: 'Fóònù rẹ já bọ́. Títún ojú rẹ̀ ṣe jẹ́ $150.',
        options: {
          emergency: 'San án láti inú owó pàjáwìrì',
          card: 'Fi sórí káàdì ìyáwó',
          newPhone: 'Ra fóònù tuntun $700 pẹ̀lú gbèsè',
        },
        lesson:
          'Ohun tí owó pàjáwìrì wà fún gan-an nìyí: ìṣẹ̀lẹ̀ àìròtẹ́lẹ̀ tí o kò lè yẹ̀. Títúnṣe sábà máa ń dín owó púpọ̀ ju rírà tuntun lọ.',
      },
      sale: {
        title: '"Ẹ̀dínwó 50%, òní nìkan!"',
        body: 'Ṣọ́ọ̀bù kan ń ta bàtà eré-ìdárayá tí o kò nílò gan-an ní ẹ̀dínwó: $120.',
        options: {
          skip: 'Fò ó',
          funMoney: 'Fi owó ìgbádùn rà á',
          card: 'Rà á lórí káàdì ìyáwó',
        },
        lesson:
          'Ẹ̀dínwó lórí ohun tí o kò nílò kì í ṣe ìfowópamọ́, ìnáwó ni. A ṣe "òní nìkan" láti kán ọ lójú. Dúró fún ọjọ́ kan kí o tó ra ohun tí o kàn fẹ́.',
      },
      gift: {
        title: 'Ọjọ́ ìbí Màmá',
        body: 'Ọjọ́ ìbí màmá rẹ ló bọ́ sí oṣù yìí.',
        options: {
          funMoney: 'Ẹ̀bùn $40 láti inú owó ìgbádùn',
          handmade: 'Káàdì tí o fọwọ́ ṣe àti sísè oúnjẹ alẹ́ fún un',
          card: 'Ẹ̀bùn olówó ńlá $150 lórí káàdì ìyáwó',
        },
        lesson: 'Ẹ̀bùn tó ní ìrònú kò ní láti wọ́n. Ẹ̀bùn yẹ kí ó wà nínú ìnáwó tí o ti ṣètò, kì í ṣe lórí káàdì ìyáwó.',
      },
      bonus: {
        title: 'Ẹ̀bùn owó $300!',
        body: 'Ọ̀gá rẹ fún ọ ní ẹ̀bùn $300 fún iṣẹ́ rere.',
        options: {
          save: 'Fi gbogbo rẹ̀ pamọ́',
          split: 'Fi $240 pamọ́ kí o sì gbádùn $60',
          spend: 'Ná gbogbo rẹ̀ ní ìparí ọ̀sẹ̀ yìí',
        },
        lesson:
          'Owó àfikún ni owó tó rọrùn jù láti fi pamọ́, nítorí o ti ń gbé láìsí i tẹ́lẹ̀. Fífi ọ̀pọ̀ jù lọ owó òjijì pamọ́ àti gbígbádùn díẹ̀ jẹ́ àṣà tó dára gan-an.',
      },
      scam: {
        title: '"Ṣe owó rẹ ní ìlọ́po méjì láàárín ọ̀sẹ̀ kan!"',
        body: 'Ẹgbẹ́ chat kan ṣèlérí láti sọ owó tí o bá fi ránṣẹ́ di ìlọ́po méjì láàárín ọ̀sẹ̀ kan.',
        options: {
          ignore: 'Má kọbi ara sí i kí o sì kìlọ̀ fún àwọn ọ̀rẹ́ rẹ',
          invest: 'Fi $200 láti inú ìfowópamọ́ rẹ ránṣẹ́ sí wọn',
        },
        lesson:
          'Kò sí ẹni tí ó lè sọ owó di ìlọ́po méjì láìléwu láàárín ọ̀sẹ̀ kan. Èrè ńlá tí a "ṣèlérí" jẹ́ àmì jìbìtì: owó rẹ yóò pòórá.',
      },
      bike: {
        title: 'Àtúnṣe kẹ̀kẹ́',
        body: 'Kẹ̀kẹ́ tí o fi ń lọ síbi iṣẹ́ nílò àtúnṣe $220.',
        options: {
          emergency: 'San án láti inú owó pàjáwìrì',
          card: 'Fi sórí káàdì ìyáwó',
          taxis: 'Fo àtúnṣe náà kí o sì máa wọ taxi ní gbogbo oṣù ($380)',
        },
        lesson:
          'Fífi àtúnṣe tó pọn dandan sílẹ̀ sábà máa ń náni jù. Owó pàjáwìrì ń jẹ́ kí o tún ìṣòro ṣe kíákíá láìyá owó.',
      },
      subscription: {
        title: 'Ìdánwò ọ̀fẹ́ ń parí',
        body: 'Ìdánwò streaming ọ̀fẹ́ rẹ ti parí. Láti ìsinsìnyí, ó máa jẹ́ $15 lóṣooṣù.',
        options: { cancel: 'Fagilé e', keep: 'Pa á mọ́' },
        lesson:
          'Àsansílẹ̀ kékeré oṣooṣù máa ń kó ara jọ: $15 lóṣù jẹ́ $180 lọ́dún. Máa ṣàyẹ̀wò àwọn àsansílẹ̀ rẹ déédéé kí o sì fagilé èyí tí o kò lò.',
      },
      sideHustle: {
        title: 'Kíkọ́ ọmọ ní ìparí ọ̀sẹ̀',
        body: 'Aládùúgbò kan fẹ́ san $150 fún ọ láti máa kọ́ ọmọ rẹ̀ ní ìparí ọ̀sẹ̀.',
        options: {
          takeSave: 'Gbà á kí o sì fi owó tí o rí pamọ́',
          decline: 'Kọ̀ kí o sì pa ìparí ọ̀sẹ̀ rẹ mọ́',
        },
        lesson:
          'Owó-wọlé àfikún ń mú kí o dé àfojúsùn rẹ kíákíá. Fífi owó àfikún pamọ́ dípò níná rẹ̀ ń mú ọ débẹ̀ yára jù.',
      },
      dentist: {
        title: 'Ìrora eyín',
        body: 'Eyín ń dùn ọ́. Dókítà eyín jẹ́ $180.',
        options: {
          emergency: 'Lọ báyìí, kí o sì sanwó láti inú owó pàjáwìrì',
          card: 'Lọ báyìí, kí o sì sanwó pẹ̀lú káàdì ìyáwó',
          wait: 'Dúró títí yóò fi burú sí i ($450 lẹ́yìn náà)',
        },
        lesson:
          'Títọ́jú ìlera rẹ ní kùtùkùtù dín owó ju títọ́jú ìṣòro ńlá lẹ́yìn náà lọ. Má ṣe fi ìtọ́jú tí o nílò sílẹ̀ láti fi owó pamọ́.',
      },
      loanApp: {
        title: 'App gbèsè lẹ́sẹ̀kẹsẹ̀',
        body: 'App kan fẹ́ fún ọ ní $500 lẹ́sẹ̀kẹsẹ̀. Ìwọ yóò san $650 padà láàárín ọ̀sẹ̀ méjì péré.',
        options: { decline: 'Kọ̀', take: 'Gbà á' },
        lesson:
          'Sísan $650 padà fún $500 láàárín ọ̀sẹ̀ méjì jẹ́ èlé tó ga gan-an, ó ju ti káàdì ìyáwó lọ ní ìlọ́po púpọ̀. Irú gbèsè bẹ́ẹ̀ ń há àwọn ènìyàn mọ́ inú gbèsè.',
      },
      foodPrices: {
        title: 'Iye oúnjẹ gòkè',
        body: 'Iye ọjà ní ṣọ́ọ̀bù gòkè ní 10% lóṣù yìí: oúnjẹ ń ná ọ ní $30 sí i.',
        options: {
          cutWants: 'Ná díẹ̀ sórí ìfẹ́ lóṣù yìí',
          card: 'Fi àfikún náà sórí káàdì ìyáwó',
        },
        lesson:
          'Nígbà tí iye ọjà bá gòkè (inflation), ṣàtúnṣe ètò ìnáwó rẹ nípa dídín ìfẹ́ kù, kì í ṣe nípa yíyá owó fún àìní.',
      },
      bankFees: {
        title: 'Owó báńkì',
        body: 'Báńkì rẹ ń gba $12 lọ́wọ́ rẹ lóṣooṣù nítorí pé o ní àkáǹtì nìkan.',
        options: { switch: 'Yí padà sí àkáǹtì ọ̀fẹ́', stay: 'Dúró ní báńkì yìí' },
        lesson:
          'Owó báńkì ń jẹ owó rẹ ní pẹ̀lẹ́ lóṣooṣù. Fífi báńkì wé ara wọn àti yíyí padà sí àkáǹtì ọ̀fẹ́ jẹ́ ìṣẹ́gun tó rọrùn.',
      },
      friendLoan: {
        title: 'Ọ̀rẹ́ kan nílò owó',
        body: 'Ọ̀rẹ́ kan béèrè láti yá $100 títí di oṣù tó ń bọ̀.',
        options: {
          afford: 'Yá a ní $100 láti inú owó ìgbádùn, owó tí o lè gbé láìsí',
          kindNo: 'Ṣàlàyé pẹ̀lú inú rere pé o kò lè ṣe é lóṣù yìí',
          savings: 'Yá a láti inú owó pàjáwìrì rẹ',
        },
        lesson:
          'Yá ènìyàn ní ohun tí o lè fara dà tí kò bá padà nìkan, má sì ṣe é láti inú owó pàjáwìrì. Kíkọ̀ pẹ̀lú inú rere náà dára.',
      },
      matching: {
        title: 'Owó ọ̀fẹ́ láti ibi iṣẹ́',
        body: 'Agbanisíṣẹ́ rẹ ń fi $1 kún ìfowópamọ́ ìfẹ̀yìntì rẹ fún gbogbo $1 tí o fi pamọ́ síbẹ̀, títí dé $100 lóṣù.',
        options: {
          join: 'Darapọ̀: fi $100 pamọ́ kí o sì gba $100 àfikún',
          later: 'Bóyá lẹ́yìn náà',
        },
        lesson:
          'Àfikún láti ọ̀dọ̀ agbanisíṣẹ́ jẹ́ èrè 100% lẹ́sẹ̀kẹsẹ̀ lórí owó rẹ. Ó jẹ́ ọ̀kan lára àdéhùn tó dára jù nínú ìṣúná ara ẹni: máa gbà á nígbà gbogbo tí o bá lè ṣe é.',
      },
      carDeal: {
        title: '"$250 péré lóṣù!"',
        body: 'Olùtajà kan fẹ́ fún ọ ní ọkọ̀ dídán kan fún "$250 péré lóṣù" fún ọdún mẹ́fà.',
        options: {
          decline: 'Kọ̀: o kò nílò ọkọ̀',
          sign: 'Fọwọ́ sí àdéhùn náà',
        },
        lesson: 'Wo àpapọ̀, kì í ṣe iye oṣooṣù: $250 × oṣù 72 jẹ́ $18,000. Ètò ìsanwó gígùn jẹ́ ẹ̀jẹ́ ńlá.',
      },
    },
  },

  // ─── Market Master ─────────────────────────────────────────────────────────
  market: {
    products: {
      lemonade: 'Omi lẹ́mọ́ọ̀nù',
      fruit: 'Ife èso',
      icePops: 'Ice pop',
      sandwiches: 'Sandwich',
    },
    day: 'Ọjọ́ {{n}} nínú {{total}}',
    costEach: 'Ọjà jẹ́ ${{cost}} ọ̀kọ̀ọ̀kan',
    fee: 'Owó àtẹ ${{fee}} lójúmọ́ · a ń da ọjà tí a kò tà nù',
    rival: 'Iye owó àtẹ alátakò: ${{price}}',
    research: 'ÌWÁDÌÍ ỌJÀ',
    researchRow: 'Ní ${{price}}: nǹkan bí oníbàárà {{count}}',
    noResearch: 'Kò sí ìwádìí lónìí: lo àsọtẹ́lẹ̀ àti ohun tí o ti kọ́.',
    yesterday: 'Àná: iye owó ${{price}}, oníbàárà {{wanted}} ló fẹ́ rà',
    price: 'Iye owó rẹ',
    stock: 'Ọjà tí o máa rà',
    preview: 'Tí o bá tà á tán: ${{revenue}} owó títà, ${{profit}} èrè',
    open: 'Ṣí àtẹ náà',
    report: 'ÌRÒYÌN ỌJỌ́ {{n}}',
    line: {
      wanted: 'Oníbàárà {{count}} ló fẹ́ rà',
      sold: 'O tà {{count}}',
      wasted: 'A da {{count}} nù láìtà',
      missed: 'Oníbàárà {{count}} lọ lọ́wọ́ òfo',
      revenue: 'Owó títà',
      stock: 'Ọjà tí a rà',
      fee: 'Owó àtẹ',
      profit: 'Èrè',
      best: 'Èyí tó dára jù lónìí: ${{price}} pẹ̀lú ọjà {{count}}, fún èrè ${{profit}}',
    },
    days: {
      sunny: { title: 'Ọjọ́ oòrùn àṣà', body: 'Èrò ń wá déédéé sí ọjà lónìí.' },
      hot: { title: 'Ooru gbígbóná!', body: 'Ooru mú gan-an: gbogbo ènìyàn fẹ́ ohun tútù.' },
      cloudy: { title: 'Ojú ọjọ́ ṣú, ó sì tutù', body: 'Ìkùukùu àti atẹ́gùn tútù mú ọ̀pọ̀ olùrajà dúró sílé.' },
      rainy: { title: 'Òjò ní gbogbo ọjọ́', body: 'Òjò ńlá: ìdajì olùrajà àṣà nìkan ló jáde.' },
      festival: { title: 'Ọjọ́ àjọ̀dún!', body: 'Àjọ̀dún orin kan mú kí èrò kún òpópónà.' },
      rival: { title: 'Àtẹ alátakò kan ṣí', body: 'Àtẹ tuntun kan ní òdìkejì òpópónà ń ta ohun kan náà.' },
      rivalSale: { title: 'Ẹ̀dínwó ńlá alátakò', body: 'Àtẹ alátakò dín iye owó rẹ̀ kù gan-an láti gba oníbàárà.' },
      shortage: { title: 'Àìtó ọjà', body: 'Ìkórè burú: ọjà rẹ wọ́n ní 60% sí i lónìí.' },
      tourists: { title: 'Bọ́ọ̀sì arìnrìn-àjò dé', body: 'Àwọn arìnrìn-àjò kún ọjà. Iye owó kò jẹ wọ́n lógún púpọ̀.' },
      payday: { title: 'Ọjọ́ owó oṣù', body: 'Ilé-iṣẹ́ ẹ̀rọ tó wà nítòsí ṣẹ̀ṣẹ̀ san owó oṣù àwọn òṣìṣẹ́ rẹ̀.' },
      cold: { title: 'Òtútù òjijì', body: 'Òtútù mú gan-an: olùrajà díẹ̀, wọ́n sì ń wá ọjà olówó pọ́ọ́kú.' },
      bulk: { title: 'Ìkórè rẹpẹtẹ', body: 'Àwọn olùpèsè ní ọjà jù: ọjà rẹ dín owó ní 25% lónìí.' },
    },
    ideas: {
      demand:
        'Òfin ìbéèrè (demand): tí iye owó bá gòkè, àwọn ènìyàn máa rà díẹ̀; tí ó bá wálẹ̀, wọ́n máa rà púpọ̀. Iye owó tó dára jù ń ṣe ìwọ̀ntúnwọ̀nsì iye tí o tà àti èrè lórí ọ̀kọ̀ọ̀kan.',
      shiftRight:
        'Ìbéèrè pọ̀ sí i: ní gbogbo iye owó, ènìyàn púpọ̀ sí i fẹ́ rà. Nígbà tí ìbéèrè bá gòkè, o lè tà púpọ̀ sí i, o sì lè gba owó díẹ̀ sí i.',
      shiftLeft:
        'Ìbéèrè dín kù: ní gbogbo iye owó, ènìyàn díẹ̀ ló fẹ́ rà. Ra ọjà díẹ̀ kí ó má bàa ṣòfò, má sì retí pé iye owó gíga yóò ṣiṣẹ́.',
      peak: 'Ìbéèrè tó ga jù: ní àwọn ọjọ́ èrò, iṣẹ́-ajé ń rí ọ̀pọ̀ jù lọ owó wọn. Ní ọjà tó tó: tí ọjà bá tán, o ń lé oníbàárà tó fẹ́ sanwó lọ.',
      competition:
        'Ìdíje: tí alátakò bá ń ta ohun kan náà, oníbàárà máa fi iye owó wé ara wọn. Tí o bá gba owó ju tiwọn lọ púpọ̀, oníbàárà máa sọdá òpópónà.',
      substitutes:
        'Ọjà àfidípò (substitutes): tí ọjà tó jọ tìrẹ bá dín owó, ìbéèrè fún tìrẹ máa dín kù. O lè dín tìrẹ kù díẹ̀, ṣùgbọ́n ogun iye owó lè pa èrè rẹ́.',
      supplyShock:
        'Ìjayà ìpèsè (supply shock): tí ìnáwó bá gòkè, títà kọ̀ọ̀kan ń mú èrè díẹ̀ wá. Iṣẹ́-ajé sábà máa ń gbé iye owó sókè, wọ́n sì ń tà díẹ̀.',
      inelastic:
        'Ìbéèrè tí kò rọ̀ (inelastic): iye owó kò fi bẹ́ẹ̀ kan àwọn oníbàárà kan. Tí iye owó kò bá jẹ olùrajà lógún, iye owó gíga máa mú èrè púpọ̀ wá.',
      income: 'Ipa owó-wọlé: tí àwọn ènìyàn bá ní owó púpọ̀, wọ́n máa rà púpọ̀, iye owó kò sì ní jẹ wọ́n lógún tó bẹ́ẹ̀.',
      elastic:
        'Ìbéèrè tó rọ̀ (elastic): oníbàárà tí iye owó ń kàn máa rà díẹ̀ gan-an tí iye owó bá gòkè. Jẹ́ kí iye owó kéré ní irú ọjọ́ yìí.',
      supplyGlut:
        'Ìnáwó tó kéré: tí ọjà bá dín owó, títà kọ̀ọ̀kan ń mú èrè púpọ̀ wá, iye owó tí ó kéré díẹ̀ sì lè fa oníbàárà àfikún.',
    },
  },

  // ─── Profit Quest ──────────────────────────────────────────────────────────
  profit: {
    products: {
      backpacks: 'àpò ẹ̀yìn',
      bikes: 'kẹ̀kẹ́',
      phoneCases: 'ìbora fóònù',
      shoes: 'bàtà ilé-ìwé',
    },
    factory: 'Ilé-iṣẹ́ rẹ ń ṣe {{product}}',
    step: 'Ìpèníjà {{n}} nínú {{total}}',
    calcTitle: 'ÌṢIRÒ IṢẸ́-AJÉ',
    calc: {
      contribution:
        'O ń ta {{product}} ní ${{price}} ọ̀kọ̀ọ̀kan. Ṣíṣe ọ̀kan ń ná ${{unit}} fún ohun èlò àti iṣẹ́. Èló ni títà kọ̀ọ̀kan ń dá sí owó tí kò yí padà (fixed costs)?',
      breakeven:
        'Ọ̀kọ̀ọ̀kan {{product}} rẹ ń tà ní ${{price}}, ó sì ń ná ${{unit}} láti ṣe. Owó tí kò yí padà (owó ilé, ẹ̀rọ, alákòóso) jẹ́ ${{fixed}} lọ́sẹ̀. Mélòó ni o gbọ́dọ̀ tà lọ́sẹ̀ láti dé break-even?',
      profit:
        'O tà {{units}} {{product}} ní ${{price}}. Ọ̀kọ̀ọ̀kan ń ná ${{unit}} láti ṣe, owó tí kò yí padà sì jẹ́ ${{fixed}}. Kí ni èrè rẹ?',
      margin:
        'O tà {{units}} {{product}} ní ${{price}}. Ọ̀kọ̀ọ̀kan ń ná ${{unit}} láti ṣe, owó tí kò yí padà sì jẹ́ ${{fixed}}. Kí ni profit margin rẹ (èrè gẹ́gẹ́ bí % owó títà)?',
      priceForTarget:
        'O retí láti tà {{units}} {{product}}. Ọ̀kọ̀ọ̀kan ń ná ${{unit}} láti ṣe, owó tí kò yí padà sì jẹ́ ${{fixed}}. Iye owó wo ni yóò fún ọ ní èrè ${{target}}?',
      machine:
        '{{product}} rẹ ń tà ní ${{price}}, ó sì ń ná ${{unit}} láti ṣe; owó tí kò yí padà jẹ́ ${{fixed}}. Ẹ̀rọ tuntun kan ń fi ${{extra}} kún owó tí kò yí padà, ṣùgbọ́n ó ń dín ${{saving}} kù lórí ọ̀kọ̀ọ̀kan. Kí ni iye break-even tuntun?',
    },
    formula: {
      contribution:
        'Ìdáwọ́lé fún ọ̀kọ̀ọ̀kan = iye owó − owó tó ń yí padà (variable cost). Ohun tí títà kọ̀ọ̀kan ń fi kún sísan owó tí kò yí padà nìyí, lẹ́yìn náà sí èrè.',
      breakeven: 'Iye break-even = owó tí kò yí padà ÷ ìdáwọ́lé fún ọ̀kọ̀ọ̀kan (yí i sókè). Tà ju èyí lọ, o sì máa jèrè.',
      profit: 'Èrè = iye ọjà × (iye owó − owó tó ń yí padà) − owó tí kò yí padà.',
      margin: 'Profit margin = èrè ÷ owó títà × 100. Ó fi iye tí o ń pa mọ́ nínú dọ́là kọ̀ọ̀kan owó títà hàn.',
      priceForTarget: 'Iye owó = owó tó ń yí padà + (owó tí kò yí padà + èrè àfojúsùn) ÷ iye ọjà.',
      machine:
        'Break-even tuntun = (owó tí kò yí padà + àfikún owó tí kò yí padà) ÷ (iye owó − owó tó ń yí padà tuntun). Ẹ̀rọ ń gbé owó tí kò yí padà sókè, ṣùgbọ́n ó ń dín owó ọ̀kọ̀ọ̀kan kù.',
    },
    percent: '{{n}}%',
    right: 'Ó tọ̀nà! +{{points}}',
    wrong: 'Kò tíì tọ̀nà: ìdáhùn ni {{answer}}.',
    week: 'Ọ̀SẸ̀ ILÉ-IṢẸ́',
    numbers: 'Ṣíṣe ọ̀kan ń ná ${{unit}} · owó tí kò yí padà ${{fixed}} lọ́sẹ̀ · {{stock}} nínú ilé ìkẹ́rùsí',
    research: 'ÌWÁDÌÍ ỌJÀ',
    researchRow: 'Ní ${{price}}: oníbàárà {{count}} lọ́sẹ̀',
    researchAbout: 'Ní ${{price}}: nǹkan bí oníbàárà {{count}} lọ́sẹ̀',
    price: 'Iye owó',
    make: 'Ṣe ní ọ̀sẹ̀ yìí',
    breakEven: 'Ní iye owó yìí, o máa dé break-even lẹ́yìn títà {{count}}',
    noBreakEven: 'Ní iye owó yìí, o ń pàdánù owó lórí gbogbo títà!',
    upgrades: 'ṢE ÌDÓKÒWÒ Ọ̀SẸ̀ YÌÍ?',
    upgrade: {
      none: { title: 'Kò sí ìdókòwò', body: 'Fi nǹkan sílẹ̀ bí wọ́n ṣe wà.' },
      machine: { title: 'Ẹ̀rọ tuntun', body: 'Owó tí kò yí padà +25%, ṣùgbọ́n ṣíṣe ọ̀kọ̀ọ̀kan dín owó ní 25%.' },
      ads: { title: 'Ìpolówó', body: 'Owó tí kò yí padà +15%, àti oníbàárà 20% sí i ní gbogbo iye owó.' },
    },
    owned: 'O ti rà á tẹ́lẹ̀',
    run: 'Ṣe ọ̀sẹ̀ náà',
    report: 'ÌRÒYÌN Ọ̀SẸ̀',
    line: {
      demand: 'Oníbàárà {{wanted}} ló fẹ́ rà · o tà {{sold}} · {{stock}} kù nínú ilé ìkẹ́rùsí',
      revenue: 'Owó títà',
      cogs: 'Owó àwọn ọjà tí a tà',
      fixed: 'Owó tí kò yí padà',
      storage: 'Ìkẹ́rùsí ọjà tí a kò tà',
      profit: 'Èrè',
      best: 'Iye owó tó dára jù ní ọ̀sẹ̀ yìí: ${{price}}, fún èrè ${{profit}}',
      over: 'O ṣe ju ohun tí o lè tà lọ: ọjà tí a kò tà ń náni lówó láti kó pamọ́.',
      under: 'Ọjà rẹ tán: oníbàárà púpọ̀ sí i fẹ́ rà.',
    },
  },

  // ─── Market Simulator ──────────────────────────────────────────────────────
  invest: {
    practice: 'Owó ìdánrawò nìkan · ilé-iṣẹ́ àròsọ',
    quarter: 'Ìdá-ọdún {{n}} nínú {{total}}',
    portfolio: 'Àkójọ ìdókòwò rẹ (portfolio)',
    indexCompare: 'Gbogbo ọjà (index fund): ${{value}}',
    news: 'ÌRÒYÌN',
    quizTitle: 'ÌBÉÈRÈ OLÙDÓKÒWÒ',
    allocate: 'PÍN ${{value}} RẸ KÁ',
    total: 'Àpapọ̀: {{pct}}%',
    totalHint: 'Àwọn ìyàn rẹ gbọ́dọ̀ jẹ́ 100% lápapọ̀.',
    limit: 'Má fi ju {{pct}}% sínú ilé-iṣẹ́ kan ṣoṣo, láti pín ewu rẹ ká.',
    feesNote: 'Owó ìdá-ọdún kọ̀ọ̀kan: index fund 0.05%, bond 0.1%, ìpín ilé-iṣẹ́ kọ̀ọ̀kan 0.3%.',
    run: 'Ìdá-ọdún tó kàn',
    report: 'ÈSÌ ÌDÁ-ỌDÚN {{n}}',
    yourReturn: 'Èrè rẹ: {{pct}}',
    indexReturn: 'Gbogbo ọjà: {{pct}}',
    fees: 'Owó ìsanwó: {{pct}}',
    value: 'Portfolio báyìí: ${{value}}',
    concentrated: 'Ó pọ̀ jù nínú ilé-iṣẹ́ kan! Tí ó bá wálẹ̀, gbogbo portfolio rẹ yóò wálẹ̀ pẹ̀lú rẹ̀.',
    risk: {
      low: 'Ewu kékeré',
      medium: 'Ewu àárín',
      high: 'Ewu ńlá',
    },
    assets: {
      cash: { name: 'Owó ìfowópamọ́', body: 'Kò léwu, ṣùgbọ́n ó ń dàgbà díẹ̀díẹ̀ gan-an' },
      bonds: { name: 'Bond fund', body: 'Owó tí a yá ìjọba àti ilé-iṣẹ́: èrè kékeré tó dúró ṣinṣin' },
      index: { name: 'Index fund', body: 'Díẹ̀ nínú gbogbo ilé-iṣẹ́: ó ń pín ewu rẹ ká' },
      sunpower: { name: 'SunPower Energy', body: 'Solar àti iná mànàmáná' },
      greenleaf: { name: 'GreenLeaf Foods', body: 'Oúnjẹ àti ohun jíjẹ' },
      roboworks: { name: 'RoboWorks', body: 'Rọ́bọ́ọ̀tì àti ìmọ̀-ẹ̀rọ' },
      citybank: { name: 'City Bank', body: 'Báńkì àti gbèsè' },
      vitahealth: { name: 'VitaHealth', body: 'Oògùn àti ìlera' },
      shopstream: { name: 'ShopStream', body: 'Ṣọ́ọ̀bù orí íntánẹ́ẹ̀tì àti ti òpópónà' },
    },
    newsItems: {
      heatwave: 'Ooru gbígbóná! Ìbéèrè fún iná mànàmáná gòkè gan-an.',
      robotOrder: 'RoboWorks gba àṣẹ ńlá fún rọ́bọ́ọ̀tì ilé-iṣẹ́.',
      harvest: 'Ìkórè tí kò rí bẹ́ẹ̀ rí dín ìnáwó ilé-iṣẹ́ oúnjẹ kù.',
      recall: 'RoboWorks kó ẹgbẹẹgbẹ̀rún rọ́bọ́ọ̀tì tí ó ní àbùkù padà.',
      shopping: 'Ìrajà ọdún ju ti ìgbàkígbà rí lọ.',
      medicine: 'A fọwọ́ sí oògùn tuntun VitaHealth.',
      rateRise: 'Báńkì àpapọ̀ gbé èlé sókè.',
      oilDrop: 'Iye owó agbára wálẹ̀ gan-an.',
      recession: 'Ìbẹ̀rù ọrọ̀-ajé tó dẹnu kọlẹ̀: olùrajà dín ìnáwó kù.',
      boom: 'Ọrọ̀-ajé dàgbà yára ju bí a ṣe retí lọ.',
      bankScandal: 'A bu ìtanràn lé City Bank fún fífi àdánù pamọ́.',
      hype: 'Gbogbo ènìyàn lórí íntánẹ́ẹ̀tì ń sọ pé RoboWorks yóò "lọ sí òṣùpá"!',
      rumour: 'Ìfiránṣẹ́ aláìlórúkọ: "Wọ́n máa ra ShopStream!" (a kò tíì fìdí rẹ̀ múlẹ̀)',
      quietQuarter: 'Ìdá-ọdún tí ó dákẹ́: kò sí ìròyìn ńlá.',
      crash: 'Ọjà wó! Iye owó wálẹ̀ níbi gbogbo.',
      rebound: 'Ọjà padà sókè lẹ́yìn wíwó náà.',
    },
    quiz: {
      share: {
        q: 'Kí ni o ní nígbà tí o bá ra ìpín (share)?',
        options: [
          'Owó tí o yá ilé-iṣẹ́ náà',
          'Apá kékeré kan nínú ilé-iṣẹ́ náà',
          'Èrè tí a ṣèlérí',
          'Iṣẹ́ ní ilé-iṣẹ́ náà',
        ],
        why: 'Ìpín jẹ́ apá kékeré kan nínú níní ilé-iṣẹ́. Tí ilé-iṣẹ́ náà bá ṣe dáadáa, iye ìpín rẹ lè gòkè, ó sì lè san dividend.',
      },
      diversify: {
        q: 'Kí ni ó túmọ̀ sí láti diversify?',
        options: [
          'Ra ilé-iṣẹ́ tó dára jù nìkan',
          'Pa gbogbo owó rẹ mọ́ ní owó lọ́wọ́',
          'Pín owó ká sínú ọ̀pọ̀ ìdókòwò tó yàtọ̀',
          'Tà nígbàkígbà tí iye owó bá wálẹ̀',
        ],
        why: 'Diversify túmọ̀ sí kí o má kó gbogbo ẹyin rẹ sínú apẹ̀rẹ̀ kan. Tí ìdókòwò kan bá wálẹ̀, àwọn yòókù lè dá portfolio rẹ dúró.',
      },
      riskReturn: {
        q: 'Ìdókòwò tí ó lè mú èrè púpọ̀ wá sábà máa ń…',
        options: ['Ní ewu púpọ̀ sí i', 'Wà láìléwu pátápátá', 'Kì í pàdánù owó láé', 'Wà fún báńkì nìkan'],
        why: 'Èrè tó ga tó ṣeé ṣe sábà máa ń wá pẹ̀lú ewu tó ga: iye owó lè yí gidigidi sí ọ̀nà méjèèjì.',
      },
      index: {
        q: 'Kí ni index fund?',
        options: [
          'Àkáǹtì ìfowópamọ́',
          'Ilé-iṣẹ́ ìmọ̀-ẹ̀rọ kan ṣoṣo',
          'Owó tí a yá ìjọba',
          'Owó àkójọ tí ó ní ọ̀pọ̀ ilé-iṣẹ́ nínú ọjà kan',
        ],
        why: 'Index fund ń ra díẹ̀ nínú gbogbo ilé-iṣẹ́ nínú ọjà kan, nítorí náà o ń rí èrè àròpín ọjà pẹ̀lú owó ìsanwó kékeré àti ewu tí ó kéré ju ilé-iṣẹ́ kan ṣoṣo lọ.',
      },
      bond: {
        q: 'Nígbà tí o bá ra bond, ìwọ ń…',
        options: ['Ra apá kan ilé-iṣẹ́', 'Yá owó tí wọn yóò san padà pẹ̀lú èlé', 'Ra wúrà', 'San owó-orí'],
        why: 'Bond jẹ́ owó tí o yá ìjọba tàbí ilé-iṣẹ́. Wọ́n ń san èlé fún ọ, wọ́n sì ń dá owó rẹ padà lẹ́yìn náà, nítorí náà bond sábà máa ń dúró ṣinṣin ju ìpín lọ.',
      },
      dividend: {
        q: 'Kí ni dividend?',
        options: [
          'Apá kan èrè ilé-iṣẹ́ tí a san fún àwọn olóhun ìpín',
          'Owó fún rírà ìpín',
          'Irú gbèsè kan',
          'Ìwálẹ̀ iye owó ìpín',
        ],
        why: 'Àwọn ilé-iṣẹ́ kan ń pín apá kan èrè wọn fún àwọn olóhun wọn (shareholders) gẹ́gẹ́ bí dividend.',
      },
      compound: {
        q: 'Kí ló dé tí bíbẹ̀rẹ̀ ìdókòwò ní kùtùkùtù fi ń ṣèrànwọ́ tó bẹ́ẹ̀?',
        options: [
          'Iye owó máa ń kéré nígbà gbogbo',
          'Báńkì ń fún ọ̀dọ́ ní ẹ̀bùn',
          'Èrè ń mú èrè mìíràn wá bí àkókò ti ń lọ (compounding)',
          'O kò ní san owó kankan',
        ],
        why: 'Pẹ̀lú compounding, èrè rẹ náà máa bẹ̀rẹ̀ sí í mú èrè tirẹ̀ wá. Bí owó rẹ ṣe pẹ́ tó nínú ìdàgbà, bẹ́ẹ̀ ni yóò ṣe máa yára dàgbà tó.',
      },
      emergencyFirst: {
        q: 'Kí ló yẹ kí o ní kí o tó ṣe ìdókòwò?',
        options: ['Ọkọ̀ ayọ́kẹ́lẹ́', 'Káàdì ìyáwó', 'Ìmọ̀ràn ìpín láti ọ̀dọ̀ ọ̀rẹ́', 'Owó pàjáwìrì'],
        why: 'Ìdókòwò lè wálẹ̀ fún ìgbà díẹ̀. Owó pàjáwìrì túmọ̀ sí pé o kò ní fi tipátipá tà ní àkókò búburú láti sanwó fún ìṣẹ̀lẹ̀ àìròtẹ́lẹ̀.',
      },
      pastPerformance: {
        q: 'Iye owó ìpín ilé-iṣẹ́ kan di ìlọ́po méjì ní ọdún tó kọjá. Èyí túmọ̀ sí…',
        options: [
          'Yóò tún di ìlọ́po méjì',
          'Kò sí ohun tó dájú nípa ọdún tó ń bọ̀',
          'Kò léwu mọ́ báyìí',
          'O gbọ́dọ̀ rà á báyìí',
        ],
        why: 'Ohun tó ṣẹlẹ̀ sẹ́yìn kò ṣèlérí èsì ọjọ́ iwájú. Iye owó dá lórí ohun tí yóò ṣẹlẹ̀ tókàn, kì í ṣe ohun tí ó ti ṣẹlẹ̀.',
      },
      inflation: {
        q: 'Kí ló dé tí fífi gbogbo owó rẹ pamọ́ ní owó lọ́wọ́ fi lè pàdánù iye rẹ̀ bí àkókò ti ń lọ?',
        options: [
          'Inflation ń mú iye ọjà gòkè yára ju bí owó ṣe ń dàgbà',
          'Báńkì ń gbà á',
          'Owó ń parí àkókò rẹ̀',
          'Ìpín ń rọ́pò owó',
        ],
        why: 'Inflation túmọ̀ sí pé iye ọjà ń gòkè lọ́dọọdún. Tí owó rẹ bá ń dàgbà lọ́ra ju iye ọjà lọ, yóò máa ra díẹ̀ bí àkókò ti ń lọ.',
      },
      longTerm: {
        q: 'Ọ̀nà wo ló sábà máa ń ṣiṣẹ́ jù fún olùdókòwò lásán?',
        options: [
          'Títà àti rírà lójoojúmọ́',
          'Títẹ̀lé ìmọ̀ràn orí íntánẹ́ẹ̀tì',
          'Ṣíṣe ìdókòwò déédéé fún ìgbà pípẹ́',
          'Kíkó gbogbo nǹkan sínú ilé-iṣẹ́ kan',
        ],
        why: 'Ìdókòwò déédéé fún ìgbà pípẹ́ nínú portfolio tí a pín ká ti borí gbígbìyànjú láti fojú inú wo ìyípadà kúkúrú nínú ìtàn.',
      },
      fees: {
        q: 'Kí ló dé tí owó ìsanwó ìdókòwò fi ṣe pàtàkì?',
        options: [
          'Kò ṣe pàtàkì, ó kéré jù',
          'Ó ń mú èrè pọ̀ sí i',
          'Báńkì nìkan ló ń san án',
          'A ń gbà á lọ́dọọdún, ó sì ń dín èrè rẹ kù',
        ],
        why: 'Owó ìsanwó ń jáde lọ́dọọdún, ohunkóhun tó wù kí ó ṣẹlẹ̀. Láàárín ọ̀pọ̀ ọdún, kódà owó kékeré máa ń kó ara jọ di ìyàtọ̀ ńlá.',
      },
      hype: {
        q: 'Gbogbo ènìyàn lórí íntánẹ́ẹ̀tì ń sọ pé ìpín kan yóò "lọ sí òṣùpá". Kí ni ọgbọ́n?',
        options: [
          'Ra púpọ̀ bí o ṣe lè ṣe tó',
          'Ṣọ́ra: ariwo náà sábà máa ń wà nínú iye owó tẹ́lẹ̀',
          'Yá owó láti rà á',
          'Sọ fún gbogbo ènìyàn láti rà á',
        ],
        why: 'Nígbà tí ariwo nípa nǹkan bá ti gbòde, iye owó rẹ̀ sábà máa ti gòkè tẹ́lẹ̀. Ariwo sábà máa ń parí pẹ̀lú ìwálẹ̀ òjijì.',
      },
      bearMarket: {
        q: 'Kí ni bear market?',
        options: [
          'Àkókò gígùn tí iye owó ń wálẹ̀',
          'Ọjà fún ẹranko',
          'Àkókò tí iye owó ń gòkè kíákíá',
          'Ọjà tí a ti tì',
        ],
        why: 'Bear market jẹ́ ìwálẹ̀ iye owó fún ìgbà pípẹ́; bull market jẹ́ ìgòkè fún ìgbà pípẹ́. Méjèèjì jẹ́ apá àṣà nínú ìdókòwò.',
      },
      pricedIn: {
        q: 'Ìròyìn rere tí gbogbo ènìyàn ti mọ̀ tẹ́lẹ̀ sábà máa ń…',
        options: [
          'Jẹ́ èrè tí a ṣèlérí',
          'Lòdì sófin láti lò',
          'Wà nínú iye owó tẹ́lẹ̀ (priced in)',
          'Jẹ́ ohun tí ọjà kò kọbi ara sí',
        ],
        why: 'Ọjà ń fèsì kíákíá. Nígbà tí ìròyìn bá ti tàn ká, àwọn olùrajà sábà máa ti gbé iye owó sókè tẹ́lẹ̀.',
      },
      rates: {
        q: 'Nígbà tí èlé bá gòkè, kí ló sábà máa ń ṣẹlẹ̀?',
        options: [
          'Gbogbo ìpín ń gòkè',
          'Owó ìfowópamọ́ ń mú èrè díẹ̀ wá',
          'Kò sí ohun tó yí padà',
          'Yíyá owó ń wọ́n sí i, àwọn ìpín kan sì ń wálẹ̀',
        ],
        why: 'Èlé tó ga ń mú kí yíyá owó wọ́n, èyí sì lè dá àwọn ilé-iṣẹ́ tó gbára lé gbèsè dúró, nígbà tí báńkì lè rí èrè púpọ̀ sí i.',
      },
      panicSell: {
        q: 'Ọjà wó ní 12%. Kí ni olùdókòwò onísùúrù sábà máa ń ṣe?',
        options: [
          'Ta gbogbo nǹkan lẹ́ẹ̀kan náà',
          'Fara balẹ̀ kí wọ́n sì dúró lórí ètò wọn',
          'Yá owó láti ra ìpín kan',
          'Dẹ́kun ìfowópamọ́ títí láé',
        ],
        why: 'Títà nínú ìbẹ̀rù ń sọ àdánù di ti gidi. Nínú ìtàn, ọjà ti máa ń padà bọ̀ sípò bí àkókò ti ń lọ, àwọn olùdókòwò tí wọ́n dúró ṣinṣin sì jèrè.',
      },
      rebalance: {
        q: 'Kí ni rebalancing portfolio túmọ̀ sí?',
        options: [
          'Dídá a padà sí àdàlù ìdókòwò tí o ṣètò',
          'Títa gbogbo nǹkan',
          'Rírà púpọ̀ sí i nínú èyí tó gòkè jù',
          'Yíyí báńkì padà',
        ],
        why: 'Bí iye owó ṣe ń yí, àdàlù rẹ ń yí kúrò. Rebalancing ń dá a padà sí ìpele ewu tí o ṣètò.',
      },
    },
  },
};

export default business;
