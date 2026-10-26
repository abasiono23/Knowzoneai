import type { Translation } from '../../types';
import type en from '../en/referrals';

const referrals: Translation<typeof en> = {
  eyebrow: 'NKPỌKU',
  inviteEyebrow: 'KPỌỌ NDỊ ENYI',
  errors: {
    load: 'Anyị enweghị ike ibulite ndị ị kpọrọ',
  },
  status: {
    pending: 'Na-eche',
    confirmed: 'Enwetala ihe nrite',
    rejected: 'Ọ ruteghị eru',
  },
  templates: {
    buddy: {
      label: 'Enyi ọmụmụ',
      text: 'Anọ m na-eji Knowzone AI amụ ihe: ọ na-eme ka ndetu ghọọ nchịkọta, flashcard na ajụjụ nyocha n’ime otu nkeji. Jiri koodu m {{code}} sonye, anyị abụọ ga-enweta kredit AI {{credits}} n’efu: {{link}}',
    },
    exams: {
      label: 'Nkwado ule',
      text: 'Nkwado WAEC/JAMB dị mfe nke ukwuu na Knowzone AI: ajụjụ omume, onye nkuzi AI na obere vidiyo ihe ọmụmụ. Jiri koodu m {{code}} nweta kredit AI {{credits}} ọzọ: {{link}}',
    },
    game: {
      label: 'Knowzone World',
      text: 'Bịa lụso m ọgụ na Knowzone World! 🪐 Agha ajụjụ, ndị isi na egwuregwu uche, ha niile sitere n’isiokwu ụlọ akwụkwọ anyị. Jiri koodu m {{code}} debanye aha (+kredit AI {{credits}} nye onye ọ bụla): {{link}}',
    },
  },
  emailSubject: 'Soro m mụọ akwụkwọ na Knowzone AI',
  milestones: {
    firstFriend: { title: 'Enyi mbụ', reward: 'Baajị enyi mbụ' },
    studyCircle: { title: 'Otu ọmụmụ', reward: 'Baajị otu ọmụmụ' },
    classCaptain: { title: 'Onye isi klaasị', reward: 'Baajị onye isi klaasị' },
    ambassador: { title: 'Onye nnọchite Knowzone', reward: 'Baajị onye nnọchite' },
  },
  invalid: {
    notFound: {
      title: 'Anyị ahụghị koodu ahụ',
      body: 'Lelee nsụpe ya na enyi gị. Koodu nwere mkpụrụedemede na ọnụọgụ 6–8, dịka ADA2026.',
    },
    expired: {
      title: 'Oge nkpọku a agafeela',
      body: 'Koodu ahụ so na mkpọsa kwụsịrị. Rịọ enyi gị maka koodu nke ya kama; oge ha anaghị agafe.',
    },
    ownCode: {
      title: 'Nke ahụ bụ koodu nke gị',
      body: 'Ị gaghị akpọ onwe gị, mana ị nwere ike ikesa ya na ndị enyi site na ihuenyo Kpọọ ndị enyi.',
    },
    alreadyReferred: {
      title: 'Ị jirila nkpọku mee ihe',
      body: 'Akaụntụ ọhụrụ ọ bụla nwere ike iji otu koodu nkpọku. Nke mbụ gị ka na-arụ ọrụ.',
    },
    notNew: {
      title: 'Nkpọku bụ maka ụmụ akwụkwọ ọhụrụ',
      body: 'Koodu nkpọku na-arụ ọrụ naanị mgbe a na-emepụta akaụntụ ọhụrụ. Ị ka nwere ike iji koodu nke gị kpọọ ndị enyi.',
    },
    capReached: {
      title: 'Enyi gị eruola oke ọnwa a',
      body: 'Nwa akwụkwọ ọ bụla nwere ike inweta ihe nrite nkpọku maka ihe ruru ndị enyi 10 kwa ọnwa. Ị ka nwere ike isonye; naanị na ihe ndabara ahụ agaghị adị.',
    },
  },
  steps: {
    joined: 'Ji koodu gị sonye',
    verified: 'Kwadoro email ya',
    qualified: 'Mechara ihe ọmụmụ, ajụjụ nyocha ma ọ bụ ọkwa mbụ',
    reward: '+kredit AI {{credits}} nye onye ọ bụla',
    waiting: 'Na-eche',
    paid: 'Akwụọla',
  },
  dashboard: {
    title: 'Nkpọku',
    headline: 'Nye {{credits}}, nweta {{credits}}',
    body: 'Mgbe enyi ji koodu gị sonye ma mechaa ihe ọmụmụ, ajụjụ nyocha ma ọ bụ ọkwa mbụ ya, unu abụọ ga-enweta kredit AI {{credits}}.',
    codeA11y: 'Koodu gị {{code}}. Meghee koodu na njikọ',
    yourCode: 'KOODU GỊ',
    copyCode: 'Detuo koodu',
    copy: 'DETUO',
    copied: 'EDETUOLA',
    invite: 'Kpọọ ndị enyi',
    shareCode: 'Kesaa koodu m',
    pendingA11y: 'Ihe nrite nkpọku gị na-eche',
    pendingTitle: 'Ihe ndabara nnabata gị na-eche',
    pendingBody: 'Mechaa ihe ọmụmụ, ajụjụ nyocha ma ọ bụ ọkwa mbụ gị ka ị meghee kredit +{{credits}} site na nkpọku {{name}}.',
    stats: {
      invited: 'akpọrọ',
      pending: 'na-eche',
      rewarded: 'enwetala ihe nrite',
      credits: 'kredit',
    },
    thisMonth: 'Ọnwa a',
    monthCount: 'Ihe nrite {{count}} n’ime {{cap}}',
    monthCap: 'Ị nwere ike inweta ihe nrite nkpọku maka ihe ruru ndị enyi {{cap}} kwa ọnwa.',
    friends: 'Ndị enyi gị',
    seeProgress: 'Hụ ọganihu',
    noFriends: 'Ọ dịbeghị onye ji koodu gị sonye. Kesaa ya na onye klaasị gị ka ị malite.',
    friendA11y: '{{name}}, {{status}}',
    joined: 'Sonyere {{date}}',
    links: {
      history: 'Akụkọ ihe nrite',
      eligibility: 'Ntozu',
      terms: 'Usoro',
    },
  },
  code: {
    title: 'Koodu gị',
    brand: 'KNOWZONE AI · NKPỌKU',
    codeA11y: 'Koodu {{code}}',
    credits: 'Kredit AI {{credits}} n’efu maka gị na enyi gị',
    copyLinkA11y: 'Detuo njikọ {{link}}',
    codeCopied: 'Edetuola koodu',
    linkCopied: 'Edetuola njikọ',
    copyCode: 'Detuo koodu',
    copyLink: 'Detuo njikọ',
    moreWays: 'Ụzọ ndị ọzọ isi kpọọ',
    howTitle: 'Otú enyi gị ga-esi jiri ya',
    how: {
      open: 'Ọ ga-emeghe njikọ gị, ma ọ bụ budata Knowzone ma pịa “Ị nwere koodu nkpọku?”',
      enter: 'Ọ ga-etinye koodu gị mgbe ọ na-emepụta akaụntụ ya.',
      finish: 'Ọ ga-emecha ihe ọmụmụ, ajụjụ nyocha ma ọ bụ ọkwa Knowzone World mbụ ya.',
      reward: 'Unu abụọ ga-enweta kredit AI {{credits}} n’onwe ya.',
    },
    neverExpires: 'Oge koodu nke gị anaghị agafe.',
  },
  invite: {
    title: 'Kpọọ ndị enyi',
    intro: 'Họrọ ozi, wee họrọ otú ị ga-esi ziga ya. A na-agbakwunye koodu na njikọ gị n’onwe ha.',
    preview: 'NLELE OZI',
    channels: {
      whatsapp: 'WhatsApp',
      sms: 'Ozi ederede',
      email: 'Email',
      copy: 'Detuo ozi',
      more: 'Ngwa ndị ọzọ',
    },
    sendWith: 'Ziga site na {{channel}}',
    copied: 'Edetuola ozi. Mado ya ebe ọ bụla',
    cantOpen: 'Anyị enweghị ike imeghe {{channel}} na ngwaọrụ a',
    sent_one: 'Ị zigala nkpọku {{count}} site na ekwentị a. Ndị enyi na-apụta na dashboard gị ozugbo ha sonyere.',
    sent_other:
      'Ị zigala nkpọku {{count}} site na ekwentị a. Ndị enyi na-apụta na dashboard gị ozugbo ha sonyere.',
    noneSent: 'Ị zibeghị nkpọku ọ bụla. Ndị enyi na-apụta na dashboard gị ozugbo ha sonyere.',
    privacy: 'Kpọọ naanị ndị ị maara. Knowzone anaghị agụ kọntaktị gị ma ọ bụ zigara ndị enyi ozi n’aha gị.',
  },
  progress: {
    title: 'Ọganihu',
    milestones: 'Ihe mmezu',
    rewarded_one: 'Enyi {{count}} enwetala ihe nrite',
    rewarded_other: 'Ndị enyi {{count}} enwetala ihe nrite',
    next_one: '{{count}} ọzọ ruo <b>{{title}}</b> · {{reward}}',
    next_other: '{{count}} ọzọ ruo <b>{{title}}</b> · {{reward}}',
    allDone: 'Emeghela ihe mmezu niile. Ị bụ onye nnọchite Knowzone!',
    all: 'Niile',
    filter: '{{label}} ({{count}})',
    empty: 'Enweghị ndị enyi ebe a ugbu a',
    emptyBody: 'Ndị enyi ji koodu gị sonye na-apụta ebe a ya na nzọụkwụ ọ bụla ruo ihe nrite.',
    invite: 'Kpọọ ndị enyi',
    remind: 'Chetara {{name}} ka o mechaa ihe ọmụmụ mbụ n’ime ụbọchị 30 o sonyere.',
  },
  eligibility: {
    title: 'Ntozu',
    fullTitle: 'Ntozu na ndị na-eche',
    yourInvite: 'NKPỌKU GỊ',
    invitedBy: '{{name}} kpọrọ gị',
    oneStep:
      'Otu nzọụkwụ fọdụrụ: mechaa ihe ọmụmụ, ajụjụ nyocha ma ọ bụ ọkwa Knowzone World ọ bụla, gị na {{name}} ga-enweta kredit AI {{credits}}.',
    verifyFirst: 'Buru ụzọ kwado email gị, wee mechaa ihe ọmụmụ, ajụjụ nyocha ma ọ bụ ọkwa ọ bụla.',
    play: 'Kpọọ',
    courses: 'Kọọsụ',
    done: 'Emechaala! Etinyela ihe ndabara nnabata gị na kredit AI gị.',
    howQualify: 'Otú ndị enyi si eru eru',
    rules: {
      new: 'Ndị enyi ga-abụrịrị ndị ọhụrụ na Knowzone ma jiri koodu gị mgbe ha na-edebanye aha',
      verified: 'Ekwenyela email (ma ọ bụ ịbanye site na Google / Apple)',
      activity: 'Ihe ọmụmụ, ajụjụ nyocha ma ọ bụ ọkwa mbụ n’ime ụbọchị 30',
      cap: 'Ruo ndị enyi {{cap}} enwetara ihe nrite kwa ọnwa ({{count}} ugbu a)',
    },
    capped: 'Ị ruola oke ọnwa a. Ndị enyi ọhụrụ ka nwere ike isonye; ihe nrite ga-amalite ọzọ n’ọnwa na-abịa.',
    pending: 'Ihe nrite na-eche ({{count}})',
    nothingPending: 'Ọ dịghị ihe na-eche. Mgbe enyi sonyere, ị ga-ahụ ihe ọ ka ga-eme ebe a.',
    daysLeft_one: 'Ụbọchị {{count}} fọdụrụ iru eru',
    daysLeft_other: 'Ụbọchị {{count}} fọdụrụ iru eru',
    readTerms: 'Gụọ usoro zuru oke',
  },
  history: {
    title: 'Akụkọ ihe nrite',
    creditsNow: 'Kredit AI ugbu a',
    fromInvites: 'site na nkpọku',
    welcome: 'Kredit nnabata',
    inviter: '{{name}} ji koodu gị sonye',
    inviterUnknown: 'Otu enyi ji koodu gị sonye',
    invitee: 'Ihe ndabara nkpọku si n’aka {{name}}',
    inviteeUnknown: 'Ihe ndabara nkpọku si n’aka enyi',
    plan: 'Kredit atụmatụ kwa ọnwa',
    used: 'E jiri ya: {{name}}',
    usedAi: 'E jiri ya maka mmepụta AI',
    plusA11y_one: '{{label}}, gbakwunye kredit {{count}}',
    plusA11y_other: '{{label}}, gbakwunye kredit {{count}}',
    minusA11y_one: '{{label}}, wepụ kredit {{count}}',
    minusA11y_other: '{{label}}, wepụ kredit {{count}}',
    note: 'A na-eji kredit AI emepụta ngwugwu ọmụmụ, vidiyo na azịza onye nkuzi. Ha dị iche na coin, enweghịkwa ike ịgbanwe ha ka ha ghọọ ego.',
  },
  terms: {
    title: 'Usoro nkpọku',
    intro: 'Nke dị mkpụmkpụ: kpọọ ezigbo ndị enyi, nyere ha aka ịmalite ịmụ ihe, unu abụọ ga-enweta ihe ndabara.',
    heading: '{{number}}. {{title}}',
    sections: {
      reward: {
        title: 'Ihe nrite',
        points: {
          credits: 'Mgbe enyi ji koodu gị sonye ma ruo eru, onye ọ bụla n’ime unu ga-enweta kredit AI {{credits}}.',
          automatic: 'A na-etinye kredit n’onwe ha. Ọ dịghị ihe ị ga-anara.',
          noCash: 'Kredit AI enweghị uru ego, enweghịkwa ike ibufe, ire ma ọ bụ gbanwee ha ka ha ghọọ coin ma ọ bụ ego.',
        },
      },
      qualifies: {
        title: 'Onye ruru eru',
        points: {
          new: 'Enyi gị ga-abụrịrị onye na-emepụta akaụntụ Knowzone ọhụrụ kpamkpam ma tinye koodu gị mgbe ọ na-edebanye aha.',
          verify: 'Ọ ga-akwadorịrị email ya (ma ọ bụ banye site na Google ma ọ bụ Apple).',
          activity:
            'Ọ ga-emecharịrị ezigbo ọrụ ọmụmụ (ihe ọmụmụ kọọsụ, ajụjụ nyocha ma ọ bụ ọkwa Knowzone World) n’ime ụbọchị 30 o sonyere.',
          oneCode: 'Akaụntụ ọhụrụ ọ bụla nwere ike iji otu koodu nkpọku.',
        },
      },
      limits: {
        title: 'Oke',
        points: {
          monthly:
            'Ị nwere ike inweta ihe nrite maka ihe ruru ndị enyi 10 kwa ọnwa kalenda. Ndị enyi karịrị nke ahụ ka nwere ike isonye; naanị na ihe ndabara ahụ agaghị adị.',
          campaign: 'Oge koodu mkpọsa (dịka site na pọsta ma ọ bụ mmemme) nwere ike ịgafe. Nke koodu nkeonwe anaghị agafe.',
        },
      },
      fairUse: {
        title: 'Ojiji ziri ezi',
        points: {
          self: 'Ị gaghị akpọ onwe gị, jiri ọtụtụ akaụntụ ma ọ bụ mepụtara ndị ọzọ akaụntụ.',
          device: 'A na-akara nkpọku si n’otu ngwaọrụ, ma ọ bụ ndị yiri ihe akpaka mere, dị ka “ọ ruteghị eru”.',
          reverse:
            'Knowzone nwere ike iweghachi ihe nrite enwetara site n’imebi iwu ndị a, ma nwee ike ịgbanwe mmemme a site n’ọkwa na ngwa ahụ.',
        },
      },
      privacy: {
        title: 'Nzuzo',
        points: {
          names:
            'Enyi gị na-ahụ aha mbụ gị na mkpụrụedemede mbụ nke aha ọzọ gị. Ị na-ahụ nke ya, gbakwunyere ebe ọ nọ na nzọụkwụ ndị dị n’elu.',
          contacts: 'Knowzone anaghị agụ kọntaktị gị ma ọ bụ ziga ozi n’aha gị.',
        },
      },
    },
    updated: 'Emelitere ikpeazụ na 1 Ọktoba 2026. Usoro ndị a so Usoro Ọrụ Knowzone.',
    fullTerms: 'Usoro Ọrụ zuru oke',
  },
};

export default referrals;
