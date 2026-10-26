import type { Translation } from '../../types';
import type en from '../en/referrals';

const referrals: Translation<typeof en> = {
  eyebrow: 'MIALIKO',
  inviteEyebrow: 'ALIKA MARAFIKI',
  errors: {
    load: 'Imeshindikana kupakia mialiko yako',
  },
  status: {
    pending: 'Inasubiri',
    confirmed: 'Imetuzwa',
    rejected: 'Haistahili',
  },
  templates: {
    buddy: {
      label: 'Mwenzangu wa kusoma',
      text: 'Nimekuwa nikisoma na Knowzone AI: inageuza madokezo kuwa muhtasari, kadi za kujifunzia na majaribio kwa dakika moja. Jiunge kwa msimbo wangu {{code}} na sote wawili tutapata krediti {{credits}} za AI bure: {{link}}',
    },
    exams: {
      label: 'Maandalizi ya mtihani',
      text: 'Kujiandaa kwa WAEC/JAMB ni rahisi zaidi na Knowzone AI: majaribio ya mazoezi, mwalimu wa AI na masomo mafupi ya video. Tumia msimbo wangu {{code}} upate krediti {{credits}} za ziada za AI: {{link}}',
    },
    game: {
      label: 'Knowzone World',
      text: 'Njoo tushindane kwenye Knowzone World! 🪐 Mapambano ya maswali, mabosi na mafumbo, yote kutoka masomo yetu ya shule. Jisajili kwa msimbo wangu {{code}} (+krediti {{credits}} za AI kila mmoja): {{link}}',
    },
  },
  emailSubject: 'Soma nami kwenye Knowzone AI',
  milestones: {
    firstFriend: { title: 'Rafiki wa kwanza', reward: 'Beji ya rafiki wa kwanza' },
    studyCircle: { title: 'Kikundi cha kusoma', reward: 'Beji ya kikundi cha kusoma' },
    classCaptain: { title: 'Kiranja wa darasa', reward: 'Beji ya kiranja wa darasa' },
    ambassador: { title: 'Balozi wa Knowzone', reward: 'Beji ya balozi' },
  },
  invalid: {
    notFound: {
      title: 'Hatukuupata msimbo huo',
      body: 'Hakiki tahajia na rafiki yako. Misimbo ina herufi na namba 6–8, kama ADA2026.',
    },
    expired: {
      title: 'Mwaliko huu umeisha muda',
      body: 'Msimbo huo ulikuwa sehemu ya kampeni iliyokwisha. Muombe rafiki yako msimbo wake binafsi badala yake; hiyo haiishi muda kamwe.',
    },
    ownCode: {
      title: 'Huo ni msimbo wako mwenyewe',
      body: 'Huwezi kujialika mwenyewe, lakini unaweza kuushiriki na marafiki kutoka skrini ya Alika marafiki.',
    },
    alreadyReferred: {
      title: 'Tayari umetumia mwaliko',
      body: 'Kila akaunti mpya inaweza kutumia msimbo mmoja wa mwaliko. Wa kwanza wako bado unafanya kazi.',
    },
    notNew: {
      title: 'Mialiko ni kwa wanafunzi wapya',
      body: 'Misimbo ya mwaliko hufanya kazi tu wakati wa kufungua akaunti mpya. Bado unaweza kuwaalika marafiki kwa msimbo wako mwenyewe.',
    },
    capReached: {
      title: 'Rafiki yako amefikia kikomo cha mwezi huu',
      body: 'Kila mwanafunzi anaweza kupata zawadi za mwaliko kwa hadi marafiki 10 kwa mwezi. Bado unaweza kujiunga; ila zawadi ya ziada haitatumika.',
    },
  },
  steps: {
    joined: 'Amejiunga kwa msimbo wako',
    verified: 'Amethibitisha barua pepe yake',
    qualified: 'Amemaliza somo, jaribio au kiwango cha kwanza',
    reward: '+krediti {{credits}} za AI kila mmoja',
    waiting: 'Inasubiri',
    paid: 'Imelipwa',
  },
  dashboard: {
    title: 'Mialiko',
    headline: 'Toa {{credits}}, pata {{credits}}',
    body: 'Rafiki akijiunga kwa msimbo wako na kumaliza somo, jaribio au kiwango chake cha kwanza, nyote wawili mnapata krediti {{credits}} za AI.',
    codeA11y: 'Msimbo wako {{code}}. Fungua msimbo na kiungo',
    yourCode: 'MSIMBO WAKO',
    copyCode: 'Nakili msimbo',
    copy: 'NAKILI',
    copied: 'IMENAKILIWA',
    invite: 'Alika marafiki',
    shareCode: 'Shiriki msimbo wangu',
    pendingA11y: 'Zawadi yako ya mwaliko inayosubiri',
    pendingTitle: 'Zawadi yako ya kukaribishwa inasubiri',
    pendingBody: 'Maliza somo, jaribio au kiwango chako cha kwanza ili kufungua +krediti {{credits}} kutoka kwa mwaliko wa {{name}}.',
    stats: {
      invited: 'walioalikwa',
      pending: 'wanasubiri',
      rewarded: 'waliotuzwa',
      credits: 'krediti',
    },
    thisMonth: 'Mwezi huu',
    monthCount: 'Zawadi {{count}} kati ya {{cap}}',
    monthCap: 'Unaweza kupata zawadi za mwaliko kwa hadi marafiki {{cap}} kwa mwezi.',
    friends: 'Marafiki zako',
    seeProgress: 'Ona maendeleo',
    noFriends: 'Bado hakuna aliyejiunga kwa msimbo wako. Mshirikishe mwanafunzi mwenzako ili kuanza.',
    friendA11y: '{{name}}, {{status}}',
    joined: 'Alijiunga {{date}}',
    links: {
      history: 'Historia ya zawadi',
      eligibility: 'Ustahiki',
      terms: 'Masharti',
    },
  },
  code: {
    title: 'Msimbo wako',
    brand: 'KNOWZONE AI · MWALIKO',
    codeA11y: 'Msimbo {{code}}',
    credits: 'Krediti {{credits}} za AI bure kwako na kwa rafiki yako',
    copyLinkA11y: 'Nakili kiungo {{link}}',
    codeCopied: 'Msimbo umenakiliwa',
    linkCopied: 'Kiungo kimenakiliwa',
    copyCode: 'Nakili msimbo',
    copyLink: 'Nakili kiungo',
    moreWays: 'Njia zaidi za kualika',
    howTitle: 'Jinsi rafiki yako anavyoutumia',
    how: {
      open: 'Anafungua kiungo chako, au anapakua Knowzone na kugusa “Una msimbo wa mwaliko?”',
      enter: 'Anaweka msimbo wako wakati wa kufungua akaunti yake.',
      finish: 'Anamaliza somo, jaribio au kiwango chake cha kwanza cha Knowzone World.',
      reward: 'Nyote wawili mnapata krediti {{credits}} za AI, moja kwa moja.',
    },
    neverExpires: 'Msimbo wako binafsi hauishi muda kamwe.',
  },
  invite: {
    title: 'Alika marafiki',
    intro: 'Chagua ujumbe, kisha uchague jinsi ya kuutuma. Msimbo na kiungo chako vinaongezwa moja kwa moja.',
    preview: 'ONYESHO LA UJUMBE',
    channels: {
      whatsapp: 'WhatsApp',
      sms: 'Ujumbe mfupi',
      email: 'Barua pepe',
      copy: 'Nakili ujumbe',
      more: 'Programu zaidi',
    },
    sendWith: 'Tuma kwa {{channel}}',
    copied: 'Ujumbe umenakiliwa. Ubandike popote',
    cantOpen: 'Imeshindikana kufungua {{channel}} kwenye kifaa hiki',
    sent_one: 'Umetuma mwaliko {{count}} kutoka simu hii. Marafiki wataonekana kwenye dashibodi yako mara tu watakapojiunga.',
    sent_other:
      'Umetuma mialiko {{count}} kutoka simu hii. Marafiki wataonekana kwenye dashibodi yako mara tu watakapojiunga.',
    noneSent: 'Bado hujatuma mwaliko wowote. Marafiki wataonekana kwenye dashibodi yako mara tu watakapojiunga.',
    privacy: 'Alika watu unaowajua tu. Knowzone haisomi kamwe anwani zako wala haiwatumii marafiki ujumbe kwa niaba yako.',
  },
  progress: {
    title: 'Maendeleo',
    milestones: 'Hatua muhimu',
    rewarded_one: 'Rafiki {{count}} ametuzwa',
    rewarded_other: 'Marafiki {{count}} wametuzwa',
    next_one: 'Bado {{count}} kufikia <b>{{title}}</b> · {{reward}}',
    next_other: 'Bado {{count}} kufikia <b>{{title}}</b> · {{reward}}',
    allDone: 'Hatua zote muhimu zimefunguliwa. Wewe ni balozi wa Knowzone!',
    all: 'Zote',
    filter: '{{label}} ({{count}})',
    empty: 'Bado hakuna marafiki hapa',
    emptyBody: 'Marafiki wanaojiunga kwa msimbo wako wanaonekana hapa pamoja na kila hatua hadi zawadi.',
    invite: 'Alika marafiki',
    remind: 'Mkumbushe {{name}} amalize somo la kwanza ndani ya siku 30 tangu ajiunge.',
  },
  eligibility: {
    title: 'Ustahiki',
    fullTitle: 'Ustahiki na yanayosubiri',
    yourInvite: 'MWALIKO WAKO',
    invitedBy: 'Umealikwa na {{name}}',
    oneStep:
      'Imebaki hatua moja: maliza somo lolote, jaribio au kiwango cha Knowzone World na wewe pamoja na {{name}} mtapata krediti {{credits}} za AI.',
    verifyFirst: 'Thibitisha barua pepe yako kwanza, kisha maliza somo lolote, jaribio au kiwango.',
    play: 'Cheza',
    courses: 'Kozi',
    done: 'Tayari! Zawadi yako ya kukaribishwa imeongezwa kwenye krediti zako za AI.',
    howQualify: 'Jinsi marafiki wanavyostahiki',
    rules: {
      new: 'Marafiki lazima wawe wapya kwenye Knowzone na watumie msimbo wako wakati wa kujisajili',
      verified: 'Barua pepe imethibitishwa (au kuingia kwa Google / Apple)',
      activity: 'Somo, jaribio au kiwango cha kwanza ndani ya siku 30',
      cap: 'Hadi marafiki {{cap}} waliotuzwa kwa mwezi ({{count}} hadi sasa)',
    },
    capped: 'Umefikia kikomo cha mwezi huu. Marafiki wapya bado wanaweza kujiunga; zawadi zitaendelea mwezi ujao.',
    pending: 'Zawadi zinazosubiri ({{count}})',
    nothingPending: 'Hakuna kinachosubiri. Rafiki akijiunga, utaona hapa kile ambacho bado anahitaji kufanya.',
    daysLeft_one: 'Imebaki siku {{count}} ya kustahiki',
    daysLeft_other: 'Zimebaki siku {{count}} za kustahiki',
    readTerms: 'Soma masharti kamili',
  },
  history: {
    title: 'Historia ya zawadi',
    creditsNow: 'Krediti za AI sasa',
    fromInvites: 'kutoka kwa mialiko',
    welcome: 'Krediti za kukaribishwa',
    inviter: '{{name}} amejiunga kwa msimbo wako',
    inviterUnknown: 'Rafiki amejiunga kwa msimbo wako',
    invitee: 'Zawadi ya mwaliko kutoka kwa {{name}}',
    inviteeUnknown: 'Zawadi ya mwaliko kutoka kwa rafiki',
    plan: 'Krediti za mpango wa mwezi',
    used: 'Zimetumika: {{name}}',
    usedAi: 'Zimetumika kwa kutengeneza kwa AI',
    plusA11y_one: '{{label}}, ongeza krediti {{count}}',
    plusA11y_other: '{{label}}, ongeza krediti {{count}}',
    minusA11y_one: '{{label}}, toa krediti {{count}}',
    minusA11y_other: '{{label}}, toa krediti {{count}}',
    note: 'Krediti za AI hutumika kutengeneza vifurushi vya kusoma, video na majibu ya mwalimu. Ni tofauti na sarafu na haziwezi kubadilishwa kuwa pesa.',
  },
  terms: {
    title: 'Masharti ya mialiko',
    intro: 'Kwa ufupi: alika marafiki halisi, wasaidie kuanza kujifunza, na nyote wawili mtapata zawadi ya ziada.',
    heading: '{{number}}. {{title}}',
    sections: {
      reward: {
        title: 'Zawadi',
        points: {
          credits: 'Rafiki akijiunga kwa msimbo wako na kustahiki, kila mmoja wenu anapata krediti {{credits}} za AI.',
          automatic: 'Krediti huongezwa moja kwa moja. Hakuna cha kudai.',
          noCash: 'Krediti za AI hazina thamani ya pesa na haziwezi kuhamishwa, kuuzwa au kubadilishwa kuwa sarafu au pesa.',
        },
      },
      qualifies: {
        title: 'Nani anastahiki',
        points: {
          new: 'Rafiki yako lazima awe anafungua akaunti mpya kabisa ya Knowzone na aweke msimbo wako wakati wa kujisajili.',
          verify: 'Lazima athibitishe barua pepe yake (au aingie kwa Google au Apple).',
          activity:
            'Lazima amalize shughuli halisi ya kujifunza (somo la kozi, jaribio au kiwango cha Knowzone World) ndani ya siku 30 tangu ajiunge.',
          oneCode: 'Kila akaunti mpya inaweza kutumia msimbo mmoja wa mwaliko.',
        },
      },
      limits: {
        title: 'Vikomo',
        points: {
          monthly:
            'Unaweza kupata zawadi kwa hadi marafiki 10 kila mwezi wa kalenda. Marafiki zaidi ya hapo bado wanaweza kujiunga; ila zawadi ya ziada haitatumika.',
          campaign: 'Misimbo ya kampeni (kwa mfano kutoka kwenye bango au tukio) inaweza kuisha muda. Misimbo binafsi haiishi.',
        },
      },
      fairUse: {
        title: 'Matumizi ya haki',
        points: {
          self: 'Huwezi kujialika mwenyewe, kutumia akaunti nyingi au kufungua akaunti kwa ajili ya watu wengine.',
          device: 'Mialiko kutoka kifaa kimoja, au inayoonekana kufanywa kiotomatiki, huwekwa alama “haistahili”.',
          reverse:
            'Knowzone inaweza kurudisha zawadi zilizopatikana kwa kuvunja sheria hizi, na inaweza kubadilisha mpango huu kwa kutoa taarifa ndani ya programu.',
        },
      },
      privacy: {
        title: 'Faragha',
        points: {
          names:
            'Rafiki yako anaona jina lako la kwanza na herufi ya kwanza ya jina lako la pili. Wewe unaona yake, pamoja na hatua aliyofikia kati ya zilizo hapo juu.',
          contacts: 'Knowzone haisomi kamwe anwani zako wala haitumi ujumbe kwa niaba yako.',
        },
      },
    },
    updated: 'Ilisasishwa mwisho tarehe 1 Oktoba 2026. Masharti haya yanaenda pamoja na Masharti ya Huduma ya Knowzone.',
    fullTerms: 'Masharti Kamili ya Huduma',
  },
};

export default referrals;
