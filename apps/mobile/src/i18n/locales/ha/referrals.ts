import type { Translation } from '../../types';
import type en from '../en/referrals';

const referrals: Translation<typeof en> = {
  eyebrow: 'GAYYATA',
  inviteEyebrow: 'GAYYACI ABOKAI',
  errors: {
    load: 'Ba a iya loda gayyatarka ba',
  },
  status: {
    pending: 'Ana jira',
    confirmed: 'An ba da lada',
    rejected: 'Bai cancanta ba',
  },
  templates: {
    buddy: {
      label: 'Abokin karatu',
      text: 'Ina karatu da Knowzone AI: yana mayar da bayanai zuwa taƙaitawa, katunan bita da gwaje-gwaje cikin minti ɗaya. Shiga da lambata {{code}} kuma mu biyu za mu samu kiredit na AI {{credits}} kyauta: {{link}}',
    },
    exams: {
      label: 'Shirin jarrabawa',
      text: 'Shirin WAEC/JAMB ya fi sauƙi sosai da Knowzone AI: gwaje-gwajen atisaye, malamin AI da gajerun darussan bidiyo. Yi amfani da lambata {{code}} don ƙarin kiredit na AI {{credits}}: {{link}}',
    },
    game: {
      label: 'Knowzone World',
      text: 'Zo mu kara a Knowzone World! 🪐 Gasar tambayoyi, manyan abokan karawa da wasannin ƙwaƙwalwa, duka daga fannonin makarantarmu. Yi rajista da lambata {{code}} (+kiredit na AI {{credits}} kowannenmu): {{link}}',
    },
  },
  emailSubject: 'Yi karatu tare da ni a Knowzone AI',
  milestones: {
    firstFriend: { title: 'Aboki na farko', reward: 'Bajin aboki na farko' },
    studyCircle: { title: 'Da’irar karatu', reward: 'Bajin da’irar karatu' },
    classCaptain: { title: 'Shugaban aji', reward: 'Bajin shugaban aji' },
    ambassador: { title: 'Jakadan Knowzone', reward: 'Bajin jakada' },
  },
  invalid: {
    notFound: {
      title: 'Ba mu sami wannan lambar ba',
      body: 'Duba rubutun tare da abokinka. Lambobi haruffa da lambobi 6–8 ne, kamar ADA2026.',
    },
    expired: {
      title: 'Wannan gayyatar ta ƙare',
      body: 'Wannan lambar ta wani kamfe ne da ya ƙare. Ka roƙi abokinka ya ba ka lambarsa ta kansa; waɗannan ba sa ƙarewa.',
    },
    ownCode: {
      title: 'Wannan lambarka ce ta kanka',
      body: 'Ba za ka iya gayyatar kanka ba, amma za ka iya raba ta da abokai daga shafin Gayyaci abokai.',
    },
    alreadyReferred: {
      title: 'Ka riga ka yi amfani da gayyata',
      body: 'Kowane sabon asusu zai iya amfani da lambar gayyata ɗaya. Ta farkon har yanzu tana aiki.',
    },
    notNew: {
      title: 'Gayyata ta sababbin ɗalibai ce',
      body: 'Lambobin gayyata suna aiki ne kawai lokacin buɗe sabon asusu. Har yanzu za ka iya gayyatar abokai da lambarka.',
    },
    capReached: {
      title: 'Abokinka ya kai iyakar wannan watan',
      body: 'Kowane ɗalibi zai iya samun ladan gayyata na abokai har 10 a wata. Har yanzu za ka iya shiga; ƙarin ladan ne kawai ba zai yi aiki ba.',
    },
  },
  steps: {
    joined: 'Ya shiga da lambarka',
    verified: 'Ya tabbatar da imel ɗinsa',
    qualified: 'Ya kammala darasi, gwaji ko mataki na farko',
    reward: '+kiredit na AI {{credits}} kowannenku',
    waiting: 'Ana jira',
    paid: 'An biya',
  },
  dashboard: {
    title: 'Gayyata',
    headline: 'Bayar da {{credits}}, ka samu {{credits}}',
    body: 'Idan aboki ya shiga da lambarka kuma ya kammala darasinsa, gwajinsa ko matakinsa na farko, ku biyu za ku samu kiredit na AI {{credits}}.',
    codeA11y: 'Lambarka {{code}}. Buɗe lamba da hanyar haɗi',
    yourCode: 'LAMBARKA',
    copyCode: 'Kwafa lamba',
    copy: 'KWAFA',
    copied: 'AN KWAFA',
    invite: 'Gayyaci abokai',
    shareCode: 'Raba lambata',
    pendingA11y: 'Ladan gayyatarka da ke jira',
    pendingTitle: 'Ladan maraba naka yana jira',
    pendingBody: 'Kammala darasinka, gwajinka ko matakinka na farko don buɗe +kiredit {{credits}} daga gayyatar {{name}}.',
    stats: {
      invited: 'an gayyata',
      pending: 'ana jira',
      rewarded: 'an ba da lada',
      credits: 'kiredit',
    },
    thisMonth: 'Wannan watan',
    monthCount: 'Lada {{count}} cikin {{cap}}',
    monthCap: 'Za ka iya samun ladan gayyata na abokai har {{cap}} a wata.',
    friends: 'Abokanka',
    seeProgress: 'Duba ci gaba',
    noFriends: 'Babu wanda ya shiga da lambarka tukuna. Raba ta da abokin ajinka don farawa.',
    friendA11y: '{{name}}, {{status}}',
    joined: 'Ya shiga {{date}}',
    links: {
      history: 'Tarihin lada',
      eligibility: 'Cancanta',
      terms: 'Sharuɗɗa',
    },
  },
  code: {
    title: 'Lambarka',
    brand: 'KNOWZONE AI · GAYYATA',
    codeA11y: 'Lamba {{code}}',
    credits: 'Kiredit na AI {{credits}} kyauta gare ka da abokinka',
    copyLinkA11y: 'Kwafa hanyar haɗi {{link}}',
    codeCopied: 'An kwafa lamba',
    linkCopied: 'An kwafa hanyar haɗi',
    copyCode: 'Kwafa lamba',
    copyLink: 'Kwafa hanyar haɗi',
    moreWays: 'Ƙarin hanyoyin gayyata',
    howTitle: 'Yadda abokinka zai yi amfani da ita',
    how: {
      open: 'Zai buɗe hanyar haɗinka, ko ya sauke Knowzone ya taɓa “Kana da lambar gayyata?”',
      enter: 'Zai shigar da lambarka yayin buɗe asusunsa.',
      finish: 'Zai kammala darasinsa, gwajinsa ko matakin Knowzone World na farko.',
      reward: 'Ku biyu za ku samu kiredit na AI {{credits}}, kai tsaye.',
    },
    neverExpires: 'Lambarka ta kanka ba ta taɓa ƙarewa.',
  },
  invite: {
    title: 'Gayyaci abokai',
    intro: 'Zaɓi saƙo, sannan ka zaɓi yadda za ka aika shi. Ana ƙara lambarka da hanyar haɗinka kai tsaye.',
    preview: 'SAMFURIN SAƘO',
    channels: {
      whatsapp: 'WhatsApp',
      sms: 'Saƙon tes',
      email: 'Imel',
      copy: 'Kwafa saƙo',
      more: 'Ƙarin manhajoji',
    },
    sendWith: 'Aika ta {{channel}}',
    copied: 'An kwafa saƙo. Liƙa shi a ko’ina',
    cantOpen: 'Ba a iya buɗe {{channel}} a wannan na’ura ba',
    sent_one: 'Ka aika gayyata {{count}} daga wannan wayar. Abokai za su bayyana a allon bayananka da zarar sun shiga.',
    sent_other:
      'Ka aika gayyata {{count}} daga wannan wayar. Abokai za su bayyana a allon bayananka da zarar sun shiga.',
    noneSent: 'Ba ka aika kowace gayyata ba tukuna. Abokai za su bayyana a allon bayananka da zarar sun shiga.',
    privacy: 'Ka gayyaci mutanen da ka sani kawai. Knowzone ba ya taɓa karanta lambobin wayarka ko aika wa abokai saƙo a madadinka.',
  },
  progress: {
    title: 'Ci gaba',
    milestones: 'Muhimman matakai',
    rewarded_one: 'An ba aboki {{count}} lada',
    rewarded_other: 'An ba abokai {{count}} lada',
    next_one: 'Saura {{count}} zuwa <b>{{title}}</b> · {{reward}}',
    next_other: 'Saura {{count}} zuwa <b>{{title}}</b> · {{reward}}',
    allDone: 'An buɗe duk muhimman matakai. Kai Jakadan Knowzone ne!',
    all: 'Duka',
    filter: '{{label}} ({{count}})',
    empty: 'Babu abokai a nan tukuna',
    emptyBody: 'Abokan da suka shiga da lambarka za su bayyana a nan tare da kowane mataki har zuwa lada.',
    invite: 'Gayyaci abokai',
    remind: 'Tunatar da {{name}} ya kammala darasi na farko cikin kwana 30 da shigarsa.',
  },
  eligibility: {
    title: 'Cancanta',
    fullTitle: 'Cancanta da masu jira',
    yourInvite: 'GAYYATARKA',
    invitedBy: '{{name}} ne ya gayyace ka',
    oneStep:
      'Saura mataki ɗaya: kammala kowane darasi, gwaji ko matakin Knowzone World, kuma kai da {{name}} za ku samu kiredit na AI {{credits}}.',
    verifyFirst: 'Tabbatar da imel ɗinka tukuna, sannan ka kammala kowane darasi, gwaji ko mataki.',
    play: 'Wasa',
    courses: 'Kwasa-kwasai',
    done: 'An gama! An ƙara ladan maraba naka cikin kiredit na AI ɗinka.',
    howQualify: 'Yadda abokai ke cancanta',
    rules: {
      new: 'Dole abokai su zama sababbi a Knowzone kuma su yi amfani da lambarka lokacin rajista',
      verified: 'An tabbatar da imel (ko shiga ta Google / Apple)',
      activity: 'Darasi, gwaji ko mataki na farko cikin kwana 30',
      cap: 'Har abokai {{cap}} masu lada a wata ({{count}} zuwa yanzu)',
    },
    capped: 'Ka kai iyakar wannan watan. Sababbin abokai za su iya shiga har yanzu; lada zai dawo wata mai zuwa.',
    pending: 'Ladan da ke jira ({{count}})',
    nothingPending: 'Babu abin da ke jira. Idan aboki ya shiga, za ka ga abin da ya rage masa ya yi a nan.',
    daysLeft_one: 'Saura kwana {{count}} don cancanta',
    daysLeft_other: 'Saura kwanaki {{count}} don cancanta',
    readTerms: 'Karanta cikakkun sharuɗɗa',
  },
  history: {
    title: 'Tarihin lada',
    creditsNow: 'Kiredit na AI yanzu',
    fromInvites: 'daga gayyata',
    welcome: 'Kiredit na maraba',
    inviter: '{{name}} ya shiga da lambarka',
    inviterUnknown: 'Wani aboki ya shiga da lambarka',
    invitee: 'Ladan gayyata daga {{name}}',
    inviteeUnknown: 'Ladan gayyata daga aboki',
    plan: 'Kiredit na tsarin wata-wata',
    used: 'An yi amfani: {{name}}',
    usedAi: 'An yi amfani don ƙirƙira da AI',
    plusA11y_one: '{{label}}, ƙari kiredit {{count}}',
    plusA11y_other: '{{label}}, ƙari kiredit {{count}}',
    minusA11y_one: '{{label}}, ragi kiredit {{count}}',
    minusA11y_other: '{{label}}, ragi kiredit {{count}}',
    note: 'Ana amfani da kiredit na AI don ƙirƙirar fakitin karatu, bidiyo da amsoshin malamin AI. Sun bambanta da tsabobi kuma ba za a iya musanya su da kuɗi ba.',
  },
  terms: {
    title: 'Sharuɗɗan gayyata',
    intro: 'A taƙaice: gayyaci abokanka na gaske, taimaka musu su fara koyo, kuma ku biyu za ku samu ƙarin lada.',
    heading: '{{number}}. {{title}}',
    sections: {
      reward: {
        title: 'Ladan',
        points: {
          credits: 'Idan aboki ya shiga da lambarka kuma ya cancanta, kowannenku zai samu kiredit na AI {{credits}}.',
          automatic: 'Ana ƙara kiredit kai tsaye. Babu abin da za ka nema.',
          noCash: 'Kiredit na AI ba su da darajar kuɗi kuma ba za a iya tura su, sayar da su ko musanya su da tsabobi ko kuɗi ba.',
        },
      },
      qualifies: {
        title: 'Wanda ya cancanta',
        points: {
          new: 'Dole abokinka ya kasance yana buɗe sabon asusun Knowzone gaba ɗaya kuma ya shigar da lambarka yayin rajista.',
          verify: 'Dole ya tabbatar da imel ɗinsa (ko ya shiga ta Google ko Apple).',
          activity:
            'Dole ya kammala ainihin aikin koyo (darasin kwas, gwaji ko matakin Knowzone World) cikin kwana 30 da shigarsa.',
          oneCode: 'Kowane sabon asusu zai iya amfani da lambar gayyata ɗaya.',
        },
      },
      limits: {
        title: 'Iyakoki',
        points: {
          monthly:
            'Za ka iya samun lada na abokai har 10 a kowane wata na kalanda. Abokan da suka wuce haka za su iya shiga har yanzu; ƙarin ladan ne kawai ba zai yi aiki ba.',
          campaign: 'Lambobin kamfe (misali daga fosta ko taro) za su iya ƙarewa. Lambobi na kai ba sa ƙarewa.',
        },
      },
      fairUse: {
        title: 'Amfani mai adalci',
        points: {
          self: 'Ba za ka iya gayyatar kanka ba, ko amfani da asusu da yawa, ko buɗe wa wasu mutane asusu ba.',
          device: 'Gayyatar da ta fito daga na’ura ɗaya, ko wadda ta yi kama da ta na’ura mai sarrafa kanta, ana alamta ta da “bai cancanta ba”.',
          reverse:
            'Knowzone zai iya janye ladan da aka samu ta hanyar karya waɗannan dokoki, kuma zai iya sauya wannan shiri tare da sanarwa a cikin manhajar.',
        },
      },
      privacy: {
        title: 'Sirri',
        points: {
          names:
            'Abokinka yana ganin sunanka na farko da baƙin farko na sunanka na ƙarshe. Kai ma kana ganin nasa, tare da matakin da ya kai a cikin matakan da ke sama.',
          contacts: 'Knowzone ba ya taɓa karanta lambobin wayarka ko aika saƙonni a madadinka.',
        },
      },
    },
    updated: 'An sabunta ƙarshe 1 ga Oktoba 2026. Waɗannan sharuɗɗa suna tafiya tare da Sharuɗɗan Sabis na Knowzone.',
    fullTerms: 'Cikakkun Sharuɗɗan Sabis',
  },
};

export default referrals;
