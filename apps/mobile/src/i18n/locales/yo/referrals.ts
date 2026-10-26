import type { Translation } from '../../types';
import type en from '../en/referrals';

const referrals: Translation<typeof en> = {
  eyebrow: 'ÌPÈ Ọ̀RẸ́',
  inviteEyebrow: 'PE ÀWỌN Ọ̀RẸ́',
  errors: {
    load: 'A kò lè gbé àwọn ìpè rẹ wá',
  },
  status: {
    pending: 'Ó ń dúró',
    confirmed: 'A ti san ẹ̀bùn',
    rejected: 'Kò yẹ',
  },
  templates: {
    buddy: {
      label: 'Ọ̀rẹ́ ẹ̀kọ́',
      text: 'Mo ti ń kẹ́kọ̀ọ́ pẹ̀lú Knowzone AI: ó ń sọ àkọsílẹ̀ di àkópọ̀, káàdì ìrántí àti ìdánwò láàárín ìṣẹ́jú kan. Darapọ̀ pẹ̀lú kóòdù mi {{code}}, àwa méjèèjì yóò sì gba kírẹ́dìtì AI ọ̀fẹ́ {{credits}}: {{link}}',
    },
    exams: {
      label: 'Ìmúrasílẹ̀ ìdánwò',
      text: 'Ìmúrasílẹ̀ WAEC/JAMB rọrùn gan-an pẹ̀lú Knowzone AI: ìdánwò ìdánrawò, olùkọ́ AI àti ẹ̀kọ́ fídíò kúkúrú. Lo kóòdù mi {{code}} fún kírẹ́dìtì AI àfikún {{credits}}: {{link}}',
    },
    game: {
      label: 'Knowzone World',
      text: 'Wá bá mi jà nínú Knowzone World! 🪐 Ìjà ìdánwò, ọ̀gá àti àlọ́, gbogbo rẹ̀ láti inú àwọn ẹ̀kọ́ ilé-ìwé wa. Forúkọ sílẹ̀ pẹ̀lú kóòdù mi {{code}} (+{{credits}} kírẹ́dìtì AI fún ẹnìkọ̀ọ̀kan): {{link}}',
    },
  },
  emailSubject: 'Wá bá mi kẹ́kọ̀ọ́ lórí Knowzone AI',
  milestones: {
    firstFriend: { title: 'Ọ̀rẹ́ àkọ́kọ́', reward: 'Báàjì ọ̀rẹ́ àkọ́kọ́' },
    studyCircle: { title: 'Ẹgbẹ́ ẹ̀kọ́', reward: 'Báàjì ẹgbẹ́ ẹ̀kọ́' },
    classCaptain: { title: 'Olórí kíláàsì', reward: 'Báàjì olórí kíláàsì' },
    ambassador: { title: 'Aṣojú Knowzone', reward: 'Báàjì aṣojú' },
  },
  invalid: {
    notFound: {
      title: 'A kò rí kóòdù yẹn',
      body: 'Ṣàyẹ̀wò bí a ṣe kọ ọ́ pẹ̀lú ọ̀rẹ́ rẹ. Kóòdù jẹ́ lẹ́tà àti nọ́ńbà 6–8, bíi ADA2026.',
    },
    expired: {
      title: 'Ìpè yìí ti parí',
      body: 'Kóòdù yẹn jẹ́ ara ìpolongo kan tí ó ti parí. Béèrè kóòdù ti ara ẹni lọ́wọ́ ọ̀rẹ́ rẹ dípò bẹ́ẹ̀; àwọn yẹn kì í parí láéláé.',
    },
    ownCode: {
      title: 'Kóòdù tìrẹ nìyẹn',
      body: 'O kò lè pe ara rẹ, ṣùgbọ́n o lè pín in fún àwọn ọ̀rẹ́ rẹ láti ojú-ìwé Pe àwọn ọ̀rẹ́.',
    },
    alreadyReferred: {
      title: 'O ti lo ìpè kan tẹ́lẹ̀',
      body: 'Àkọọ́lẹ̀ tuntun kọ̀ọ̀kan lè lo kóòdù ìpè kan ṣoṣo. Èyí àkọ́kọ́ rẹ ṣì ń ṣiṣẹ́.',
    },
    notNew: {
      title: 'Ìpè wà fún akẹ́kọ̀ọ́ tuntun',
      body: 'Kóòdù ìpè ń ṣiṣẹ́ nígbà tí o bá ń ṣẹ̀dá àkọọ́lẹ̀ tuntun nìkan. O ṣì lè pe àwọn ọ̀rẹ́ pẹ̀lú kóòdù tìrẹ.',
    },
    capReached: {
      title: 'Ọ̀rẹ́ rẹ ti dé òpin oṣù yìí',
      body: 'Akẹ́kọ̀ọ́ kọ̀ọ̀kan lè jèrè ẹ̀bùn ìpè fún ọ̀rẹ́ tó tó 10 lóṣù. O ṣì lè darapọ̀; àfikún náà nìkan ni kò ní ṣiṣẹ́.',
    },
  },
  steps: {
    joined: 'Ó darapọ̀ pẹ̀lú kóòdù rẹ',
    verified: 'Ó jẹ́rìísí ímeèlì rẹ̀',
    qualified: 'Ó parí ẹ̀kọ́, ìdánwò tàbí ìpele àkọ́kọ́',
    reward: '+{{credits}} kírẹ́dìtì AI fún ẹnìkọ̀ọ̀kan',
    waiting: 'Ó ń dúró',
    paid: 'A ti san án',
  },
  dashboard: {
    title: 'Ìpè ọ̀rẹ́',
    headline: 'Fún wọn ní {{credits}}, gba {{credits}}',
    body: 'Nígbà tí ọ̀rẹ́ kan bá darapọ̀ pẹ̀lú kóòdù rẹ tí ó sì parí ẹ̀kọ́, ìdánwò tàbí ìpele rẹ̀ àkọ́kọ́, ẹ̀yin méjèèjì yóò gba kírẹ́dìtì AI {{credits}}.',
    codeA11y: 'Kóòdù rẹ {{code}}. Ṣí kóòdù àti líǹkì',
    yourCode: 'KÓÒDÙ RẸ',
    copyCode: 'Dà kóòdù kọ',
    copy: 'DÀ Á KỌ',
    copied: 'A TI DÀ Á KỌ',
    invite: 'Pe àwọn ọ̀rẹ́',
    shareCode: 'Pín kóòdù mi',
    pendingA11y: 'Ẹ̀bùn ìpè rẹ tó ń dúró',
    pendingTitle: 'Àfikún ìkíni káàbọ̀ rẹ ń dúró',
    pendingBody: 'Parí ẹ̀kọ́, ìdánwò tàbí ìpele rẹ àkọ́kọ́ láti ṣí +{{credits}} kírẹ́dìtì láti inú ìpè {{name}}.',
    stats: {
      invited: 'tí o pè',
      pending: 'tó ń dúró',
      rewarded: 'tí a san ẹ̀bùn fún',
      credits: 'kírẹ́dìtì',
    },
    thisMonth: 'Oṣù yìí',
    monthCount: 'Ẹ̀bùn {{count}} nínú {{cap}}',
    monthCap: 'O lè jèrè ẹ̀bùn ìpè fún ọ̀rẹ́ tó tó {{cap}} lóṣù.',
    friends: 'Àwọn ọ̀rẹ́ rẹ',
    seeProgress: 'Wo ìlọsíwájú',
    noFriends: 'Kò tíì sí ẹni tó darapọ̀ pẹ̀lú kóòdù rẹ. Pín in fún ọmọ kíláàsì kan láti bẹ̀rẹ̀.',
    friendA11y: '{{name}}, {{status}}',
    joined: 'Ó darapọ̀ ní {{date}}',
    links: {
      history: 'Ìtàn ẹ̀bùn',
      eligibility: 'Ẹ̀tọ́ láti kópa',
      terms: 'Àwọn òfin',
    },
  },
  code: {
    title: 'Kóòdù rẹ',
    brand: 'KNOWZONE AI · ÌPÈ',
    codeA11y: 'Kóòdù {{code}}',
    credits: 'Kírẹ́dìtì AI ọ̀fẹ́ {{credits}} fún ìwọ àti ọ̀rẹ́ rẹ',
    copyLinkA11y: 'Dà líǹkì kọ {{link}}',
    codeCopied: 'A ti dà kóòdù kọ',
    linkCopied: 'A ti dà líǹkì kọ',
    copyCode: 'Dà kóòdù kọ',
    copyLink: 'Dà líǹkì kọ',
    moreWays: 'Ọ̀nà mìíràn láti pè',
    howTitle: 'Bí ọ̀rẹ́ rẹ ṣe máa lò ó',
    how: {
      open: 'Wọn yóò ṣí líǹkì rẹ, tàbí ṣe ìgbàsílẹ̀ Knowzone kí wọ́n sì tẹ “Ṣé o ní kóòdù ìpè?”',
      enter: 'Wọn yóò tẹ kóòdù rẹ nígbà tí wọ́n bá ń ṣẹ̀dá àkọọ́lẹ̀ wọn.',
      finish: 'Wọn yóò parí ẹ̀kọ́, ìdánwò tàbí ìpele Knowzone World wọn àkọ́kọ́.',
      reward: 'Ẹ̀yin méjèèjì yóò gba kírẹ́dìtì AI {{credits}}, fúnra rẹ̀.',
    },
    neverExpires: 'Kóòdù ti ara rẹ kì í parí láéláé.',
  },
  invite: {
    title: 'Pe àwọn ọ̀rẹ́',
    intro: 'Yan ọ̀rọ̀ kan, lẹ́yìn náà yan bí o ṣe fẹ́ fi ránṣẹ́. A ó fi kóòdù àti líǹkì rẹ kún un fúnra rẹ̀.',
    preview: 'ÌWÒṢÁÁJÚ Ọ̀RỌ̀',
    channels: {
      whatsapp: 'WhatsApp',
      sms: 'Àtẹ̀jíṣẹ́',
      email: 'Ímeèlì',
      copy: 'Dà ọ̀rọ̀ kọ',
      more: 'Áàpù mìíràn',
    },
    sendWith: 'Fi ránṣẹ́ pẹ̀lú {{channel}}',
    copied: 'A ti dà ọ̀rọ̀ náà kọ. Lẹ̀ ẹ́ mọ́ ibikíbi',
    cantOpen: 'A kò lè ṣí {{channel}} lórí ẹ̀rọ yìí',
    sent_one: 'O ti fi ìpè {{count}} ránṣẹ́ láti fóònù yìí. Àwọn ọ̀rẹ́ yóò hàn lórí pẹpẹ rẹ ní kété tí wọ́n bá darapọ̀.',
    sent_other:
      'O ti fi ìpè {{count}} ránṣẹ́ láti fóònù yìí. Àwọn ọ̀rẹ́ yóò hàn lórí pẹpẹ rẹ ní kété tí wọ́n bá darapọ̀.',
    noneSent: 'O kò tíì fi ìpè kankan ránṣẹ́. Àwọn ọ̀rẹ́ yóò hàn lórí pẹpẹ rẹ ní kété tí wọ́n bá darapọ̀.',
    privacy: 'Pe àwọn ènìyàn tí o mọ̀ nìkan. Knowzone kì í ka àwọn olùbásọ̀rọ̀ rẹ, kì í sì í fi ọ̀rọ̀ ránṣẹ́ sí àwọn ọ̀rẹ́ fún ọ.',
  },
  progress: {
    title: 'Ìlọsíwájú',
    milestones: 'Àmì-àṣeyọrí',
    rewarded_one: 'A ti san ẹ̀bùn fún ọ̀rẹ́ {{count}}',
    rewarded_other: 'A ti san ẹ̀bùn fún ọ̀rẹ́ {{count}}',
    next_one: '{{count}} sí i sí <b>{{title}}</b> · {{reward}}',
    next_other: '{{count}} sí i sí <b>{{title}}</b> · {{reward}}',
    allDone: 'O ti ṣí gbogbo àmì-àṣeyọrí. Aṣojú Knowzone ni ọ́!',
    all: 'Gbogbo',
    filter: '{{label}} ({{count}})',
    empty: 'Kò tíì sí ọ̀rẹ́ kankan níbí',
    emptyBody: 'Àwọn ọ̀rẹ́ tó darapọ̀ pẹ̀lú kóòdù rẹ yóò hàn níbí pẹ̀lú gbogbo ìgbésẹ̀ títí dé ẹ̀bùn.',
    invite: 'Pe àwọn ọ̀rẹ́',
    remind: 'Rán {{name}} létí láti parí ẹ̀kọ́ àkọ́kọ́ láàárín ọjọ́ 30 tí wọ́n darapọ̀.',
  },
  eligibility: {
    title: 'Ẹ̀tọ́ láti kópa',
    fullTitle: 'Ẹ̀tọ́ láti kópa & èyí tó ń dúró',
    yourInvite: 'ÌPÈ RẸ',
    invitedBy: '{{name}} ló pè ọ́',
    oneStep:
      'Ìgbésẹ̀ kan ló kù: parí ẹ̀kọ́, ìdánwò tàbí ìpele Knowzone World èyíkéyìí, ìwọ àti {{name}} yóò sì gba kírẹ́dìtì AI {{credits}}.',
    verifyFirst: 'Kọ́kọ́ jẹ́rìísí ímeèlì rẹ, lẹ́yìn náà parí ẹ̀kọ́, ìdánwò tàbí ìpele èyíkéyìí.',
    play: 'Ṣeré',
    courses: 'Kọ́ọ̀sì',
    done: 'Ó ti parí! A ti fi àfikún ìkíni káàbọ̀ rẹ kún kírẹ́dìtì AI rẹ.',
    howQualify: 'Bí àwọn ọ̀rẹ́ ṣe ń yẹ',
    rules: {
      new: 'Àwọn ọ̀rẹ́ gbọ́dọ̀ jẹ́ tuntun ní Knowzone kí wọ́n sì lo kóòdù rẹ nígbà ìforúkọsílẹ̀',
      verified: 'Ímeèlì tí a ti jẹ́rìísí (tàbí ìwọlé Google / Apple)',
      activity: 'Ẹ̀kọ́, ìdánwò tàbí ìpele àkọ́kọ́ láàárín ọjọ́ 30',
      cap: 'Ọ̀rẹ́ tó tó {{cap}} tí a san ẹ̀bùn fún lóṣù ({{count}} títí di báyìí)',
    },
    capped: 'O ti dé òpin oṣù yìí. Àwọn ọ̀rẹ́ tuntun ṣì lè darapọ̀; ẹ̀bùn yóò tún bẹ̀rẹ̀ lóṣù tó ń bọ̀.',
    pending: 'Ẹ̀bùn tó ń dúró ({{count}})',
    nothingPending: 'Kò sí nǹkan tó ń dúró. Nígbà tí ọ̀rẹ́ kan bá darapọ̀, ìwọ yóò rí ohun tí wọ́n ṣì nílò láti ṣe níbí.',
    daysLeft_one: 'Ọjọ́ {{count}} ló kù láti yẹ',
    daysLeft_other: 'Ọjọ́ {{count}} ló kù láti yẹ',
    readTerms: 'Ka àwọn òfin kíkún',
  },
  history: {
    title: 'Ìtàn ẹ̀bùn',
    creditsNow: 'Kírẹ́dìtì AI báyìí',
    fromInvites: 'láti inú ìpè',
    welcome: 'Kírẹ́dìtì ìkíni káàbọ̀',
    inviter: '{{name}} darapọ̀ pẹ̀lú kóòdù rẹ',
    inviterUnknown: 'Ọ̀rẹ́ kan darapọ̀ pẹ̀lú kóòdù rẹ',
    invitee: 'Àfikún ìpè láti ọ̀dọ̀ {{name}}',
    inviteeUnknown: 'Àfikún ìpè láti ọ̀dọ̀ ọ̀rẹ́ kan',
    plan: 'Kírẹ́dìtì ètò oṣooṣù',
    used: 'O lò ó: {{name}}',
    usedAi: 'O lò ó fún ìṣẹ̀dá AI',
    plusA11y_one: '{{label}}, àfikún kírẹ́dìtì {{count}}',
    plusA11y_other: '{{label}}, àfikún kírẹ́dìtì {{count}}',
    minusA11y_one: '{{label}}, ìyọkúrò kírẹ́dìtì {{count}}',
    minusA11y_other: '{{label}}, ìyọkúrò kírẹ́dìtì {{count}}',
    note: 'A ń lo kírẹ́dìtì AI láti ṣẹ̀dá àpò ẹ̀kọ́, fídíò àti ìdáhùn olùkọ́. Wọ́n yàtọ̀ sí owó-ẹyọ, a kò sì lè pàṣípààrọ̀ wọn fún owó.',
  },
  terms: {
    title: 'Àwọn òfin ìpè ọ̀rẹ́',
    intro: 'Ní ṣókí: pe àwọn ọ̀rẹ́ gidi, ràn wọ́n lọ́wọ́ láti bẹ̀rẹ̀ ẹ̀kọ́, ẹ̀yin méjèèjì yóò sì gba àfikún.',
    heading: '{{number}}. {{title}}',
    sections: {
      reward: {
        title: 'Ẹ̀bùn náà',
        points: {
          credits: 'Nígbà tí ọ̀rẹ́ kan bá darapọ̀ pẹ̀lú kóòdù rẹ tí ó sì yẹ, ẹnìkọ̀ọ̀kan yín yóò gba kírẹ́dìtì AI {{credits}}.',
          automatic: 'A ń fi kírẹ́dìtì kún un fúnra rẹ̀. Kò sí nǹkan láti gbà.',
          noCash: 'Kírẹ́dìtì AI kò ní iye owó gidi, a kò sì lè gbé e fún ẹlòmíì, tà á tàbí pàṣípààrọ̀ rẹ̀ fún owó-ẹyọ tàbí owó.',
        },
      },
      qualifies: {
        title: 'Ta ló yẹ',
        points: {
          new: 'Ọ̀rẹ́ rẹ gbọ́dọ̀ máa ṣẹ̀dá àkọọ́lẹ̀ Knowzone tuntun pátápátá kí ó sì tẹ kóòdù rẹ nígbà ìforúkọsílẹ̀.',
          verify: 'Wọ́n gbọ́dọ̀ jẹ́rìísí ímeèlì wọn (tàbí wọlé pẹ̀lú Google tàbí Apple).',
          activity:
            'Wọ́n gbọ́dọ̀ parí iṣẹ́ ẹ̀kọ́ gidi kan (ẹ̀kọ́ kọ́ọ̀sì, ìdánwò tàbí ìpele Knowzone World) láàárín ọjọ́ 30 tí wọ́n darapọ̀.',
          oneCode: 'Àkọọ́lẹ̀ tuntun kọ̀ọ̀kan lè lo kóòdù ìpè kan ṣoṣo.',
        },
      },
      limits: {
        title: 'Ààlà',
        points: {
          monthly:
            'O lè jèrè ẹ̀bùn fún ọ̀rẹ́ tó tó 10 ní oṣù kàlẹ́ńdà kọ̀ọ̀kan. Àwọn ọ̀rẹ́ tó ju ìyẹn lọ ṣì lè darapọ̀; àfikún náà nìkan ni kò ní ṣiṣẹ́.',
          campaign: 'Kóòdù ìpolongo (fún àpẹẹrẹ láti inú pátákó ìpolówó tàbí ayẹyẹ) lè parí. Kóòdù ti ara ẹni kì í parí.',
        },
      },
      fairUse: {
        title: 'Ìlò tó tọ́',
        points: {
          self: 'O kò lè pe ara rẹ, lo àkọọ́lẹ̀ púpọ̀ tàbí ṣẹ̀dá àkọọ́lẹ̀ fún àwọn ẹlòmíì.',
          device: 'Ìpè láti ẹ̀rọ kan náà, tàbí èyí tó dà bí ẹ̀rọ aládàáṣe, ni a ó sàmì sí “kò yẹ”.',
          reverse:
            'Knowzone lè gba ẹ̀bùn tí a rí nípa rírú àwọn òfin wọ̀nyí padà, ó sì lè yí ètò yìí padà pẹ̀lú ìkéde nínú áàpù.',
        },
      },
      privacy: {
        title: 'Ìpamọ́',
        points: {
          names:
            'Ọ̀rẹ́ rẹ ń rí orúkọ àkọ́kọ́ rẹ àti lẹ́tà àkọ́kọ́ orúkọ ìdílé rẹ. Ìwọ náà ń rí tiwọn, pẹ̀lú ibi tí wọ́n dé nínú àwọn ìgbésẹ̀ lókè.',
          contacts: 'Knowzone kì í ka àwọn olùbásọ̀rọ̀ rẹ, kì í sì í fi ọ̀rọ̀ ránṣẹ́ ní orúkọ rẹ láéláé.',
        },
      },
    },
    updated: 'Àtúnṣe tó kẹ́yìn 1 Ọ̀wàrà 2026. Àwọn òfin wọ̀nyí wà pẹ̀lú Àwọn Òfin Iṣẹ́ Knowzone.',
    fullTerms: 'Àwọn Òfin Iṣẹ́ kíkún',
  },
};

export default referrals;
