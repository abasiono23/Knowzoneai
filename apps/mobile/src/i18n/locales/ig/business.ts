/** Knowzone World Business District (Igbo): walking around the square, its five places and the five business games. */
import type { Translation } from '../../types';
import type en from '../en/business';

const business: Translation<typeof en> = {
  title: 'Ebe Azụmahịa',
  entryEyebrow: 'AZỤMAHỊA & EGO · ỌHỤRỤ',
  entryTitle: 'Ebe Azụmahịa',
  entryBody:
    'Malite ụlọ ọrụ ọhụrụ, mụta ịhazi ego (budget), kpebie ọnụahịa n’ahịa, mee ka ụlọ nrụpụta nweta uru ma tinye ego mmụta n’ahịa',
  leave: 'Pụọ n’Ebe Azụmahịa',
  offline: 'Ebe Azụmahịa chọrọ ịntanetị, n’ihi na ọ bụ sava anyị na-arụ mkpebi ọ bụla.',
  result: {
    back: 'Laghachi n’Ebe Azụmahịa',
  },
  hall: {
    walkTo: 'Gaa na {{station}}',
    you: 'Gị onwe gị, n’uwe blazer Knowzone gị',
    open: 'Banye na {{station}}',
    goHere: 'Gaa ebe a',
    stars: 'Kpakpando {{count}} n’ime {{max}}',
    tip: 'Gaa n’otu ụlọ iji malite egwuregwu. Pịa aha iji gaa ebe ahụ.',
  },
  stations: {
    startup: 'Isi Ụlọ Ọrụ Ọhụrụ',
    budget: 'Ụlọ Akụ Budget',
    market: 'Ama Ahịa',
    factory: 'Ụlọ Nrụpụta Uru',
    exchange: 'Ahịa Mbụrụ (Stock Exchange)',
  },
  games: {
    'startup-tycoon': {
      name: 'Onyeisi Ụlọ Ọrụ Ọhụrụ',
      how: 'Na-achị ụlọ ọrụ nke gị kwa ọnwa: were ndị na-emepụta, ndị na-ere ahịa na ndị enyemaka n’ọrụ, mefuo ego n’mgbasa ozi ma dozie mkpebi siri ike. Mee ka uru ya too na-agwụghị ego n’aka.',
    },
    'budget-master': {
      name: 'Ọkachamara Budget',
      how: 'Hazie ụgwọ ọnwa gị: kwụọ ụgwọ, rie nri nke ọma, chekwaa ego maka ebumnuche, kwadebe ego mberede ma dozie ihe mberede na-abanyeghị n’ụgwọ.',
    },
    'market-master': {
      name: 'Ọkachamara Ahịa',
      how: 'Na-elekọta tebụl ahịa: họrọ ọnụahịa gị na ole ngwa ahịa ị ga-azụ kwa ụbọchị ka ihu igwe, igwe mmadụ na onye asọmpi na-agbanwe ọchịchọ ndị mmadụ.',
    },
    'profit-quest': {
      name: 'Ọchịchọ Uru',
      how: 'Mụta mgbakọ azụmahịa (margin, break-even, uru), wee na-achị ụlọ nrụpụta kwa izu: kpebie ọnụahịa, ole ị ga-emepụta na mgbe ị ga-etinye ego.',
    },
    'market-simulator': {
      name: 'Ahịa Mmụta',
      how: 'Tinye ego mmụta n’ụlọ ọrụ akpụrụ akpụ, bond na index fund. Akụkọ na-akpali ahịa: kesaa ihe ize ndụ gị ma mụta otú itinye ego si arụ ọrụ. Ọ bụghị ezigbo ego.',
    },
  },

  ui: {
    money: '${{amount}}',
    minus: '−${{amount}}',
    perMonth: '${{amount}}/ọnwa',
    next: 'Ọzọ',
    finish: 'Hụ nsonaazụ',
    best: 'Nhọrọ kacha mma',
    good: 'Nhọrọ dị mma',
    fair: 'Nhọrọ dị nkezi',
    poor: 'Nhọrọ adịghị mma',
    bestWas: 'Nhọrọ kacha mma bụ: {{choice}}',
    lesson: 'IHE MMỤTA AZỤMAHỊA',
    left: 'Ego fọdụrụ ịhazi: ${{amount}}',
    over: 'Karịrị site na ${{amount}}',
    points: '+{{points}} akara',
    more: 'Karịa',
    less: 'Belata',
    pick: 'Buru ụzọ họrọ otu.',
    unbalanced: 'Hazie dọla ọ bụla: mkpokọta ga-adaba kpọmkwem.',
    invalid: 'Atụmatụ ahụ anaghị ekwe. Lelee ọnụọgụ ndị ahụ.',
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
      bakery: 'achịcha na kọfị',
      repair: 'mmezi',
      apps: 'ọrụ app',
      fashion: 'uwe',
      solar: 'nrụnye',
    },
    month: 'Ọnwa {{n}} n’ime {{total}}',
    goal: 'Ebumnuche: òkè gị ruo ${{goal}}',
    value: 'Uru ụlọ ọrụ',
    cash: 'Ego n’aka',
    morale: 'Obi ụtọ ndị ọrụ',
    rep: 'Aha ọma',
    owned: 'Ị nwere {{pct}}%',
    decision: 'MKPEBI ỌNWA A',
    team: 'NDỊ OTU GỊ',
    roles: {
      maker: 'Ndị na-emepụta',
      seller: 'Ndị na-ere ahịa',
      support: 'Ndị enyemaka',
    },
    roleHint: {
      maker: 'Onye ọ bụla na-emepụta ihe dị ka {{n}} {{sale}} kwa ọnwa',
      seller: 'Onye ọ bụla na-eweta ihe dị ka ndị ahịa {{n}} ọzọ kwa ọnwa',
      support: 'Na-elekọta akwụkwọ na ndị ahịa; onye ọ bụla na-elekọta ndị otu 4',
    },
    salary: '${{amount}}/ọnwa onye ọ bụla',
    hireCost: 'Ọnụ iwe mmadụ n’ọrụ: ${{amount}} (ịchọ na ịzụ ha)',
    payroll: 'Ụgwọ ọnwa niile: ${{amount}}/ọnwa',
    marketing: 'MGBASA OZI ỌNWA A',
    none: 'Ọ dịghị',
    run: 'Bie ọnwa a',
    report: 'AKỤKỌ ỌNWA {{n}}',
    statement: {
      revenue: 'Ego mbata (ire ahịa)',
      cogs: 'Ọnụ ihe e rere',
      gross: 'Uru mbụ ({{pct}}% margin)',
      payroll: 'Ụgwọ ọnwa',
      rent: 'Ụgwọ ụlọ',
      marketing: 'Mgbasa ozi',
      other: 'Mmefu na mbata otu ugboro',
      loan: 'Ịkwụghachi mbinye ego',
      net: 'Uru ikpeazụ',
      cash: 'Ego dị n’ụlọ akụ',
      runway: 'Ọ bụrụ otu a, ego ga-ezu ọnwa {{count}} ọzọ',
    },
    ops: {
      line: 'Ndị ahịa {{demand}} chọrọ ịzụ · ndị otu gị nwere ike ijere {{capacity}} ozi · ị rere {{sold}}',
      order: 'Gbakwunye otu ọda pụrụ iche nke {{count}}',
      turnedAway: 'Ị chụghachiri ndị ahịa {{count}}. Ndị na-emepụta karịa gaara eweta ego karịa.',
      idle: 'Ndị na-emepụta gị nwere oge efu. Ndị na-ere ahịa ma ọ bụ mgbasa ozi karịa ga-eweta ndị ahịa.',
      balanced: 'Ihe ndị otu gị mepụtara dabara nke ọma n’ọchịchọ ndị ahịa.',
      overload: 'Ndị otu gị buru ibu karịa ndị enyemaka ya: onye ọ bụla dalatara ọsọ.',
      saturated: 'Ahịa gị na-ejupụta: onye na-ere ahịa ọ bụla gbakwụnyere na-eweta obere ndị ahịa ọhụrụ.',
    },
    bankrupt: 'Ego agwụla! Ụlọ ọrụ nwere ike inwe uru n’akwụkwọ ma daa ma ọ bụrụ na ego agwụ ya.',
    dilemmas: {
      poach: {
        title: 'Onye kacha mma na-emepụta ihe na-apụ?',
        body: 'Ụlọ ọrụ asọmpi na-enye onye kacha nwee nka n’ndị na-emepụta gị ọrụ ka ụgwọ ya dị elu. Ọ chọrọ ịnọ, mana ọ chọrọ mmụba ụgwọ.',
        options: {
          match: 'Bulie ụgwọ onye ọ bụla na-emepụta ihe ji $120/ọnwa',
          letGo: 'Kelee ya ma hapụ ya ka ọ laa',
          threaten: 'Gwa ya na ọ ga-akwa ụta ịpụ',
        },
        lesson:
          'Ịdochi ezigbo onye ọrụ na-akarị ego karịa idobe ya: ịchọ onye ọhụrụ, ịzụ ya na ọrụ furu efu ka ọ na-amụ. Ụgwọ ziri ezi na-edobe ndị kacha mma gị ma mee ka obi dị ha ụtọ.',
      },
      bigOrder: {
        title: 'Nnukwu ọda, na nnukwu mbelata ọnụahịa',
        body: 'Otu nnukwu onye ahịa chọrọ nnukwu ọda n’ọnwa a, mana naanị ma ọ bụrụ na ị belatara ọnụahịa gị 40%.',
        options: {
          negotiate: 'Kpaa ụka: obere ọda na mbelata 15%',
          accept: 'Kwere mbelata 40%',
          decline: 'Jiri nkwanye ugwu jụ',
        },
        lesson:
          'Mbelata ọnụahịa na-esi n’uru gị (margin) apụ. Tupu ị kwere, lee ma ọnụahịa ahụ ka na-ekpuchi ọnụ imepụta otu, na ma ị nwere ikike imepụta ọzọ. Ịkpa ụka bụ ihe nkịtị n’azụmahịa.',
      },
      review: {
        title: 'Nkwupụta iwe n’ịntanetị',
        body: 'Otu onye ahịa dere na ọrụ gị dị nwayọ ma ndị ọrụ enweghị nkwanye ugwu. Ndị ọzọ na-agụ ya.',
        options: {
          fix: 'Rịọ mgbaghara n’ihu ọha, dozie nsogbu ahụ ma nyeghachi ya ego',
          ignore: 'Leghara ya anya, a ga-echefu ya',
          argue: 'Zaa na onye ahịa ahụ na-agha ụgha',
        },
        lesson:
          'Aha ọma gị na-eme ka ndị ahịa laghachi ma kọọrọ ndị ọzọ banyere gị. Nzaghachi n’eziokwu n’ihu ọha na mkpesa na-enwetakarị ntụkwasị obi karịa enweghị mkpesa ọ bụla.',
      },
      burnout: {
        title: 'Ike agwụla ndị otu gị',
        body: 'Mgbe izu ole na ole nke ọrụ karịrị oge gasịrị, ike agwụla ndị ọrụ gị ma ha na-emehie ihe.',
        options: {
          rest: 'Nye onye ọ bụla ụbọchị ezumike a na-akwụ ụgwọ ma wetara ndị enyemaka nwa oge',
          pizza: 'Zụtara ndị otu pizza',
          push: 'Rịọ ka ha rụkwuo ọrụ karịrị oge n’ọnwa a',
        },
        lesson:
          'Ndị ike gwụrụ na-arụpụta obere ma na-ahapụ ọrụ karịa. Ịmanye ha na-enye obere mmụba nwa oge mana ọ na-efu gị mgbe e mesịrị n’obi ụtọ na ndị na-apụ. Ezigbo ndị isi na-echekwa ike ndị otu ha.',
      },
      agency: {
        title: 'Nkwa mgbasa ozi "viral"',
        body: 'Otu ụlọ ọrụ mgbasa ozi kwere nkwa na mgbasa ozi $2,000 ga-eme ka a mara gị n’otu abalị.',
        options: {
          test: 'Nwaa obere nnwale $300 ma tụọ nsonaazụ ya',
          pay: 'Kwụọ $2,000 niile',
          skip: 'Hapụ ya',
        },
        lesson:
          'Nwalee tupu ị mefuo nnukwu ego. Obere nnwale e tụrụ atụ na-egosi ma mgbasa ozi na-eweta ndị ahịa n’ezie, ka ị bulie naanị ihe na-arụ ọrụ. Nnukwu nkwa abụghị ihe akaebe.',
      },
      fancyOffice: {
        title: 'Ọfịs ọhụrụ mara mma?',
        body: 'Ị nwere ike ịkwaga n’ọfịs mara mma nwere ọnụ ụlọ egwuregwu. Ịkwaga ga-efu $2,500 ma ụgwọ ụlọ ga-abawanye 30%.',
        options: {
          stay: 'Nọrọ, ma mefuo ego n’ihe ndị ahịa na-ahụ',
          move: 'Kwaga, ndị otu ga-ahụ ya n’anya',
        },
        lesson:
          'A ga-akwụ mmefu kwụ ọtọ (fixed costs) dị ka ụgwọ ụlọ kwa ọnwa ma ị rere ma ị reghị. Mee ka ha dị ala, karịsịa na mmalite, ka azụmahịa gị dịgide n’ọnwa ahịa adịghị.',
      },
      sponsor: {
        title: 'Kwado ụbọchị egwuregwu ụlọ akwụkwọ?',
        body: 'Otu ụlọ akwụkwọ dị nso na-arịọ gị ka ị kwado ụbọchị egwuregwu ya ji $300. Aha gị ga-anọ n’elu T-shirt.',
        options: {
          sponsor: 'Kwado ya',
          decline: 'Jiri nkwanye ugwu jụ',
        },
        lesson:
          'Ịkwado obodo gị na-ewulite ihunanya na ịmata aha ụlọ ọrụ gị n’ime obodo. Ọ bụ ụdị mgbasa ozi na-emekwa ihe ọma.',
      },
      supplier: {
        title: 'Onye na-enye gị ngwa na-ebuli ọnụahịa',
        body: 'Ihe ndị ị na-azụ ugbu a dị oke ọnụ karịa 20%.',
        options: {
          shop: 'Tụnyere ndị ọzọ na-enye ngwa ma kpaa ụka',
          raise: 'Bufee mmefu ahụ: bulie ọnụahịa gị 8%',
          cheap: 'Gbanwee gaa n’ihe dị ọnụ ala nke ukwuu, nke adịghị mma',
        },
        lesson:
          'Mgbe mmefu na-arị elu, buru ụzọ chọgharịa ma kpaa ụka. Ibelata ịdị mma na-echekwa uru gị otu ọnwa mana ọ na-emebi aha ọma gị ogologo oge.',
      },
      latePayer: {
        title: 'Otu onye ahịa akwụghị ụgwọ',
        body: 'Otu nnukwu onye ahịa ka ji gị $1,500 site n’ụbọchị 60 gara aga, ego n’aka gị na-adịkwa ntakịrị.',
        options: {
          remind: 'Ziga ncheta n’ụzọ dị nro ma nye obere mbelata ma ọ kwụọ ugbu a',
          wait: 'Chere ma tụọ anya na ọ ga-akwụ',
          threaten: 'Yie ya egwu na ị ga-ewere ndị ọka iwu',
        },
        lesson:
          'Uru abụghị otu ihe ahụ dị ka ego n’aka. Ego ndị ahịa ji gị (receivables) enweghị ike ịkwụ ụgwọ gị ruo mgbe ọ batara. Ịchụ ụgwọ ngwa ngwa n’ụzọ dị nro na-eme ka ego na-asọ.',
      },
      newLine: {
        title: 'Echiche ngwaahịa ọhụrụ',
        body: 'Otu onye n’ime ndị otu nwere echiche maka ụdị ngwaahịa ọhụrụ.',
        options: {
          pilot: 'Buru ụzọ mee obere nnwale na ndị ahịa ole na ole',
          bigLaunch: 'Mepee ya n’ike, jiri ọtụtụ ngwa na mgbasa ozi',
          later: 'Ọ bụghị ugbu a',
        },
        lesson:
          'Ihe ọhụrụ na-eme ka azụmahịa too, mana ịmalite obere na-enyere gị aka ịmụta ihe ndị ahịa chọrọ n’ezie tupu itinye ọtụtụ ego n’ihe ize ndụ. A na-akpọ nke a pilot ma ọ bụ minimum viable product.',
      },
      training: {
        title: 'Zụọ ndị otu?',
        body: 'Ọmụmụ $500 ga-eme ka ndị ọrụ gị dị ọsọ ma nwee nka karịa.',
        options: {
          train: 'Kwụọ ụgwọ ọmụmụ ahụ',
          free: 'Kekọrịta vidiyo efu n’ịntanetị kama',
          skip: 'Hapụ ọzụzụ',
        },
        lesson:
          'Ọzụzụ bụ itinye ego na ndị mmadụ: ndị ọrụ nwere nka na-arụpụta karịa ma na-enwe mmetụta na a ji ha kpọrọ ihe, nke na-akwụghachi ọnụ ya n’ọnwa ndị na-esote.',
      },
      loan: {
        title: 'Mbinye ego n’ụlọ akụ',
        body: 'Ụlọ akụ na-enye $4,000, ị ga-akwụghachi $190 kwa ọnwa (ihe dị ka ọmụrụ nwa 12% kwa afọ).',
        options: {
          machine: 'Binye ya zụta igwe na-emepụta 25% karịa',
          party: 'Binye ya maka oriri ndị otu na arịa ụlọ ọhụrụ',
          no: 'Ebinyela ego',
        },
        lesson:
          'Ezigbo ụgwọ na-akwụ maka ihe na-eweta ego karịa ọmụrụ nwa, dị ka igwe na-ebuli mmepụta. Ịbinye ego maka ihe na-adịghị eweta ego na-ahapụ gị naanị ịkwụghachi ụgwọ.',
      },
      rent: {
        title: 'Onye nwe ụlọ na-ebuli ụgwọ ụlọ',
        body: 'Onye nwe ụlọ gị chọrọ ụgwọ ụlọ karịrị 25% site n’ọnwa na-abịa.',
        options: {
          lease: 'Kwe ka ị binye aka n’nkwekọrịta ogologo oge maka obere mmụba',
          accept: 'Kwere mmụba ahụ',
          moveFar: 'Kwaga ebe dị ọnụ ala nke dị anya n’ebe ndị ahịa gị nọ',
        },
        lesson:
          'Ihe fọrọ nke nta ka ọ bụrụ ihe niile n’azụmahịa nwere ike ịkpa ụka. Inye ihe onye nke ọzọ ji kpọrọ ihe (nkwekọrịta ogologo oge a pụrụ ịtụkwasị obi) nwere ike inweta gị nkwekọrịta ka mma. Ebe ị nọ dịkwa mkpa: ịkwapụ n’ebe ndị ahịa nọ na-efu ahịa.',
      },
      competitor: {
        title: 'Onye asọmpi mepere nso',
        body: 'Azụmahịa ọhụrụ mepere n’okporo ụzọ ahụ, ọnụahịa ya dị ala.',
        options: {
          quality: 'Sọọ mpi n’ịdị mma na ọrụ, ya na kaadị ndị ahịa kwesịrị ntụkwasị obi',
          priceWar: 'Belata ọnụahịa gị 25% iji merie ha',
          nothing: 'Emela ihe ọ bụla',
        },
        lesson:
          'Agha ọnụahịa nwere ike ibibi uru azụmahịa abụọ ahụ. Ọ na-akakarị mma ịsọ mpi n’ihe mere gị iche: ịdị mma, ọrụ na ndị ahịa kwesịrị ntụkwasị obi.',
      },
      safety: {
        title: 'Nyocha nchekwa',
        body: 'Onye nyocha chọpụtara nsogbu nchekwa n’ebe ọrụ gị.',
        options: {
          fixNow: 'Dozie ya nke ọma ozugbo',
          later: 'Kwachie ya n’ọnụ ala ma dozie ya mgbe e mesịrị',
        },
        lesson:
          'Azụmahịa ga-echekwa ndị ọrụ na ndị ahịa. Idozi nsogbu n’oge dị ọnụ ala karịa ntaramahụhụ, ihe mberede na aha mebiri emebi.',
      },
      remote: {
        title: 'Ịrụ ọrụ n’ụlọ?',
        body: 'Ndị ọrụ gị na-arịọ ka ha rụọ ọrụ n’ụlọ ụbọchị ụfọdụ.',
        options: {
          trial: 'Nwaa ya otu ọnwa ma tụọ nsonaazụ ya',
          refuse: 'Jụ',
          always: 'Kwe ka onye ọ bụla mee ya kwa ụbọchị, na-enweghị nyocha',
        },
        lesson:
          'Ịdị nro nwere ike ime ka obi dị ndị ọrụ ụtọ, mana ezigbo ndị isi na-anwale mgbanwe ma tụọ mmetụta ya na mmepụta tupu ha ekpebie kpamkpam.',
      },
      investor: {
        title: 'Onye na-etinye ego chọrọ ịbanye',
        body: 'Onye na-etinye ego na-enye $10,000 maka 40% nke ụlọ ọrụ gị.',
        options: {
          counter: 'Zaa n’onyinye nke gị: $8,000 maka 20%',
          accept: 'Kwere $10,000 maka 40%',
          refuse: 'Jụ ma too n’ego nke gị',
        },
        lesson:
          'Ire òkè (equity) na-eweta ego na-enweghị ụgwọ, mana ị na-enye akụkụ nke uru ọ bụla n’ọdịnihu na nke uru ụlọ ọrụ. A na-akpọ nke a dilution. Kpaa ụka maka ọnụahịa òkè gị.',
      },
      tax: {
        title: 'Oge ịkwụ ụtụ isi eruola',
        body: 'Ị ji $700 ụtụ isi azụmahịa n’ọnwa a.',
        options: {
          pay: 'Kwụọ ya n’oge',
          plan: 'Rịọ maka atụmatụ ịkwụ ụgwọ gọọmentị kwadoro',
          ignore: 'Leghara ya anya ugbu a',
        },
        lesson:
          'Ụtụ isi na-akwụ maka okporo ụzọ, ụlọ akwụkwọ na ụlọ ọgwụ, azụmahịa ọ bụla ga-akwụkwa ya. Ịkwụ ya n’azụ oge na-eweta ntaramahụhụ, ya mere azụmahịa maara ihe na-echekwa ego maka ụtụ isi ka ha na-enweta ego.',
      },
      bigClient: {
        title: 'Otu nnukwu onye ahịa',
        body: 'Otu nnukwu onye ahịa kwere ịzụ ọkara nke ihe niile ị na-emepụta, mana naanị ma ọ bụrụ na ị hapụ ndị ahịa gị ndị ọzọ.',
        options: {
          balance: 'Were obere nkwekọrịta ma debe ndị ahịa gị ndị ọzọ',
          allIn: 'Hapụ ndị ọzọ niile ma binye aka',
          decline: 'Jụ',
        },
        lesson:
          'Ịdabere n’otu onye ahịa dị ize ndụ: ọ bụrụ na ọ hapụ, ọtụtụ azụmahịa gị ga-eso ya. Ire ihe nye ọtụtụ ndị ahịa na-eme ka ụlọ ọrụ sie ike.',
      },
      ethics: {
        title: '"Onyinye" nzuzo',
        body: 'Onye na-enye gị ngwa kwere inye gị onyinye nzuzo ma ọ bụrụ na ị na-azụ n’aka ya n’ọnụahịa dị elu.',
        options: {
          refuse: 'Jụ ma kọọ ya',
          accept: 'Nara onyinye ahụ',
        },
        lesson:
          'Onyinye ahụ bụ ngarị (bribe). Ọ na-efu ụlọ ọrụ gị ego, ọ na-abụkarị megidere iwu, ọ na-ebibikwa ntụkwasị obi. Azụmahịa na-eme ihe ziri ezi na-adịte aka.',
      },
    },
  },

  // ─── Budget Master ─────────────────────────────────────────────────────────
  budget: {
    month: 'Ọnwa {{n}} n’ime {{total}}',
    income: 'Ego mbata ọnwa a',
    bills: 'ỤGWỌ (A GA-AKWỤRỊRỊ)',
    afterBills: 'Ihe fọdụrụ mgbe ụgwọ gasịrị',
    plan: 'ATỤMATỤ GỊ',
    billNames: {
      rent: 'Ụgwọ ụlọ',
      utilities: 'Ọkụ latrik na mmiri',
      phone: 'Ekwentị na data',
      transport: 'Njem',
      minimum: 'Obere ụgwọ kaadị',
      subscription: 'Ndebanye aha streaming',
      bankFees: 'Ụgwọ ụlọ akụ',
      carDeal: 'Ụgwọ ụgbọ ala',
    },
    keys: {
      food: 'Nri',
      fun: 'Egwuregwu na obi ụtọ',
      clothes: 'Uwe',
      emergency: 'Ego mberede',
      goal: 'Ebumnuche nchekwa',
      debt: 'Ụgwọ kaadị ọzọ',
    },
    keyHint: {
      food: 'Ị chọrọ opekata mpe ${{min}}',
      fun: 'Ịpụ apụ, egwuregwu, ihe ụtọ',
      clothes: 'Uwe na akpụkpọ ụkwụ ọhụrụ',
      emergency: '${{have}} echekwara · ebumnuche ${{target}}',
      goal: '{{goal}}: ${{have}} n’ime ${{target}}',
      debt: 'Ụgwọ kaadị ${{have}} · ọmụrụ nwa {{rate}}% kwa ọnwa',
    },
    goals: {
      laptop: 'Laptọọpụ ọhụrụ',
      bike: 'Igwe ịnyịnya',
      course: 'Ọmụmụ koodu',
      travel: 'Njem',
      deposit: 'Ego mbụ maka ụlọ',
    },
    rule: 'Mkpa {{needs}}% · Ọchịchọ {{wants}}% · Nchekwa {{savings}}%',
    ruleHint: 'Ụzọ dị mma: mkpa ihe dị ka 50%, ọchịchọ ruo 30%, chekwaa opekata mpe 20%.',
    restToGoal: 'Tinye nke fọdụrụ na nchekwa',
    event: 'ỌNWA A',
    costFrom: {
      fun: '−${{amount}} site n’ego obi ụtọ',
      emergency: '−${{amount}} site n’ego mberede',
      goal: '−${{amount}} site na nchekwa',
      card: '−${{amount}} na kaadị kredit',
    },
    gain: '+${{amount}} na nchekwa',
    newBill: '+${{amount}} kwa ọnwa',
    run: 'Bie ọnwa a',
    report: 'AKỤKỌ ỌNWA {{n}}',
    check: {
      food: 'Riri nri nke ọma',
      noFood: 'Ego nri ezughị',
      saved: 'Chekwara {{pct}}% nke ego mbata',
      wants: 'Mefuru {{pct}}% n’ọchịchọ',
      card: '${{amount}} gara na kaadị kredit',
      interest: 'Ọmụrụ nwa kaadị ọnwa a: ${{amount}}',
      debt: 'Ụgwọ kaadị ugbu a: ${{amount}}',
      emergency: 'Ego mberede: ${{amount}}',
      goal: 'Ebumnuche nchekwa: ${{amount}} n’ime ${{target}}',
    },
    events: {
      concert: {
        title: 'Òkù egwu',
        body: 'Enyi gị kpọrọ gị gaa egwu. Tiketi bụ $80.',
        options: {
          funMoney: 'Gaa, jiri ego obi ụtọ gị kwụọ',
          freePlan: 'Tụọ aro ka unu mee picnic efu kama',
          card: 'Gaa, ma tinye ya na kaadị kredit',
        },
        lesson:
          'Obi ụtọ bụ akụkụ nke budget dị mma: ọ bụ ya mere ego obi ụtọ gị ji dị. Iji kredit kwụọ maka ọchịchọ pụtara ịkwụ ọmụrụ nwa n’otu abalị ọṅụ ruo ọtụtụ ọnwa.',
      },
      phone: {
        title: 'Ihu ekwentị gbawara agbawa',
        body: 'Ekwentị gị dara. Imezi ihu ya bụ $150.',
        options: {
          emergency: 'Kwụọ site n’ego mberede gị',
          card: 'Tinye ya na kaadị kredit',
          newPhone: 'Zụta ekwentị ọhụrụ $700 na kredit',
        },
        lesson:
          'Nke a bụ kpọmkwem ihe ego mberede dị maka ya: ihe mberede ị na-enweghị ike izere. Imezi na-adịkarị ọnụ ala karịa ịzụ ọhụrụ.',
      },
      sale: {
        title: '"Mbelata 50%, naanị taa!"',
        body: 'Otu ụlọ ahịa na-ere akpụkpọ ụkwụ egwuregwu ị na-achọghị n’ezie ọnụ ala ngwa ngwa: $120.',
        options: { skip: 'Hapụ ya', funMoney: 'Jiri ego obi ụtọ zụta ha', card: 'Zụta ha na kaadị kredit' },
        lesson:
          'Mbelata n’ihe ị na-achọghị abụghị nchekwa, ọ bụ mmefu. E mere "naanị taa" ka ọ mee ka ị mee ngwa ngwa. Chere otu ụbọchị tupu ịzụta ọchịchọ.',
      },
      gift: {
        title: 'Ụbọchị ọmụmụ nne',
        body: 'Ọ bụ ụbọchị ọmụmụ nne gị n’ọnwa a.',
        options: {
          funMoney: 'Onyinye $40 site n’ego obi ụtọ gị',
          handmade: 'Kaadị i ji aka mee na isi nri abalị maka ya',
          card: 'Onyinye dị oke ọnụ $150 na kaadị kredit',
        },
        lesson:
          'Ihe e chere echiche maka ya ekwesịghị ịdị oke ọnụ. Onyinye kwesịrị ịnọ na mmefu ị haziri, ọ bụghị na kaadị kredit.',
      },
      bonus: {
        title: 'Ego mgbakwunye $300!',
        body: 'Onyeisi gị nyere gị ego mgbakwunye $300 maka ezigbo ọrụ.',
        options: {
          save: 'Chekwaa ya niile',
          split: 'Chekwaa $240 ma were $60 nwee obi ụtọ',
          spend: 'Mefuo ya niile na ngwụsị izu a',
        },
        lesson:
          'Ego mgbakwunye bụ ego kacha dị mfe ichekwa, n’ihi na ị na-ebi ndụ na-enweghị ya. Ichekwa ọtụtụ n’ime ego a na-atụghị anya ya ma were ntakịrị nwee obi ụtọ bụ omume dị mma.',
      },
      scam: {
        title: '"Mee ka ego gị baa okpukpu abụọ n’otu izu!"',
        body: 'Otu group chat kwere nkwa ime ka ego ọ bụla i zigara ha baa okpukpu abụọ n’otu izu.',
        options: { ignore: 'Leghara ya anya ma dọọ ndị enyi gị aka na ntị', invest: 'Ziga ha $200 site na nchekwa gị' },
        lesson:
          'Ọ dịghị onye nwere ike ime ka ego baa okpukpu abụọ n’otu izu n’enweghị ihe ize ndụ. Nkwa uru dị elu e kwere n’ezie bụ ihe ịrịba ama nke aghụghọ (scam): ego gị ga-efu.',
      },
      bike: {
        title: 'Mmezi igwe ịnyịnya',
        body: 'Igwe ị na-agba gaa ọrụ chọrọ mmezi $220.',
        options: {
          emergency: 'Kwụọ site n’ego mberede gị',
          card: 'Tinye ya na kaadị kredit',
          taxis: 'Hapụ mmezi ma were taksi ọnwa niile ($380)',
        },
        lesson:
          'Iyigharị mmezi dị mkpa na-efukarị ego karịa. Ego mberede gị na-enyere gị aka idozi nsogbu ngwa ngwa na-ebinyeghị ego.',
      },
      subscription: {
        title: 'Nnwale efu na-agwụ',
        body: 'Nnwale streaming efu gị na-agwụ. Site ugbu a, ọ ga-efu $15 kwa ọnwa.',
        options: { cancel: 'Kagbuo ya', keep: 'Debe ya' },
        lesson:
          'Obere ndebanye aha kwa ọnwa na-agbakọ: $15 kwa ọnwa bụ $180 kwa afọ. Na-elele ndebanye aha gị mgbe niile ma kagbuo nke ị na-adịghị eji.',
      },
      sideHustle: {
        title: 'Nkuzi ngwụsị izu',
        body: 'Onye agbata obi kwere ịkwụ gị $150 ka ị kuzie nwa ya na ngwụsị izu.',
        options: { takeSave: 'Were ya ma chekwaa ihe ị nwetara', decline: 'Jụ ma debe ngwụsị izu gị' },
        lesson:
          'Ego mbata nke abụọ na-eme ka ebumnuche gị ruo ngwa ngwa. Ichekwa ego mgbakwunye kama imefu ya na-eme ka ị ruo ebe ahụ ọsọ ọsọ.',
      },
      dentist: {
        title: 'Ọrịa eze',
        body: 'Eze na-afụ gị ụfụ. Dọkịta eze ga-efu $180.',
        options: {
          emergency: 'Gaa ugbu a, jiri ego mberede kwụọ',
          card: 'Gaa ugbu a, jiri kaadị kredit kwụọ',
          wait: 'Chere ruo mgbe ọ ka njọ ($450 mgbe e mesịrị)',
        },
        lesson:
          'Ilekọta ahụike gị n’oge dị ọnụ ala karịa ịgwọ nnukwu nsogbu mgbe e mesịrị. Ahapụla nlekọta ị chọrọ iji chekwaa ego.',
      },
      loanApp: {
        title: 'App mbinye ego ozugbo',
        body: 'Otu app na-enye gị $500 ozugbo. Ị ga-akwụghachi $650 n’ime naanị izu abụọ.',
        options: { decline: 'Jụ', take: 'Were ya' },
        lesson:
          'Ịkwụghachi $650 maka $500 n’izu abụọ bụ ọmụrụ nwa dị oke elu, ọtụtụ ugboro karịa kaadị kredit. Mbinye ego ụdị a na-ejide ndị mmadụ n’ụgwọ.',
      },
      foodPrices: {
        title: 'Ọnụahịa nri na-arị elu',
        body: 'Ọnụahịa n’ụlọ ahịa rịgoro 10% n’ọnwa a: nri na-efu gị $30 karịa.',
        options: { cutWants: 'Mefuo obere n’ọchịchọ n’ọnwa a', card: 'Tinye nke karịrị na kaadị kredit' },
        lesson:
          'Mgbe ọnụahịa na-arị elu (inflation), gbanwee budget gị site n’ibelata ọchịchọ, ọ bụghị site n’ịbinye ego maka mkpa.',
      },
      bankFees: {
        title: 'Ụgwọ ụlọ akụ',
        body: 'Ụlọ akụ gị na-ana gị $12 kwa ọnwa naanị maka inwe akaụntụ.',
        options: { switch: 'Gbanwee gaa n’akaụntụ efu', stay: 'Nọgide n’ụlọ akụ a' },
        lesson:
          'Ụgwọ na-eri ego gị nwayọ nwayọ kwa ọnwa. Itụnyere ụlọ akụ ma gbanwee gaa n’akaụntụ efu bụ mmeri dị mfe.',
      },
      friendLoan: {
        title: 'Enyi chọrọ ego',
        body: 'Otu enyi na-arịọ ka ị binye ya $100 ruo ọnwa na-abịa.',
        options: {
          afford: 'Binye $100 site n’ego obi ụtọ, ego ị nwere ike ịnọ na-enweghị ya',
          kindNo: 'Jiri obiọma kọwaa na ị nweghị ike n’ọnwa a',
          savings: 'Binye ya site n’ego mberede gị',
        },
        lesson:
          'Binye naanị ihe ị nwere ike ịtụfu ma a kwụghachighị ya, ma ọ bụghị site n’ego mberede gị. Iji obiọma sị mba dịkwa mma.',
      },
      matching: {
        title: 'Ego efu site n’ọrụ',
        body: 'Onye were gị n’ọrụ na-agbakwunye $1 na nchekwa ezumike nka gị maka $1 ọ bụla ị chekwara ebe ahụ, ruo $100 kwa ọnwa.',
        options: { join: 'Banye: chekwaa $100 ma nweta $100 ọzọ', later: 'Ma eleghị anya mgbe ọzọ' },
        lesson:
          'Mgbakwunye onye were gị n’ọrụ bụ uru 100% ozugbo n’ego gị. Ọ bụ otu n’ime nkwekọrịta kacha mma n’ego onwe onye: were ya mgbe niile ma ị nwee ike.',
      },
      carDeal: {
        title: '"Naanị $250 kwa ọnwa!"',
        body: 'Onye na-ere ụgbọ ala na-enye gị ụgbọ ala na-egbuke egbuke maka "naanị $250 kwa ọnwa" ruo afọ isii.',
        options: { decline: 'Jụ: ị chọghị ụgbọ ala', sign: 'Binye aka na nkwekọrịta ahụ' },
        lesson:
          'Lee mkpokọta, ọ bụghị ọnụahịa kwa ọnwa: $250 × ọnwa 72 bụ $18,000. Atụmatụ ịkwụ ụgwọ ogologo oge bụ nnukwu nkwa.',
      },
    },
  },

  // ─── Market Master ─────────────────────────────────────────────────────────
  market: {
    products: {
      lemonade: 'Lemonade',
      fruit: 'Iko mkpụrụ osisi',
      icePops: 'Ice pop',
      sandwiches: 'Sandwich',
    },
    day: 'Ụbọchị {{n}} n’ime {{total}}',
    costEach: 'Ngwa ahịa bụ ${{cost}} otu',
    fee: 'Ụgwọ tebụl ${{fee}} kwa ụbọchị · a na-atụfu ngwa a na-erepụghị',
    rival: 'Ọnụahịa tebụl onye asọmpi: ${{price}}',
    research: 'NNYOCHA AHỊA',
    researchRow: 'Na ${{price}}: ihe dị ka ndị ahịa {{count}}',
    noResearch: 'Enweghị nnyocha taa: jiri amụma ihu igwe na ihe ị mụtara.',
    yesterday: 'Ụnyaahụ: ọnụahịa ${{price}}, ndị ahịa {{wanted}} chọrọ ịzụ',
    price: 'Ọnụahịa gị',
    stock: 'Ngwa ị ga-azụ',
    preview: 'Ọ bụrụ na ị ree ha niile: ${{revenue}} n’ire ahịa, ${{profit}} uru',
    open: 'Mepee tebụl',
    report: 'AKỤKỌ ỤBỌCHỊ {{n}}',
    line: {
      wanted: 'Ndị ahịa {{count}} chọrọ ịzụ',
      sold: 'Ị rere {{count}}',
      wasted: 'A tụfuru {{count}} a na-erepụghị',
      missed: 'Ndị ahịa {{count}} lara n’aka efu',
      revenue: 'Ire ahịa',
      stock: 'Ngwa a zụrụ',
      fee: 'Ụgwọ tebụl',
      profit: 'Uru',
      best: 'Kacha mma taa: ${{price}} na {{count}} ngwa, maka uru ${{profit}}',
    },
    days: {
      sunny: { title: 'Ụbọchị anwụ nkịtị', body: 'Igwe mmadụ kwụ ọtọ n’ahịa taa.' },
      hot: { title: 'Oke okpomọkụ!', body: 'Ọ na-ekpo ọkụ nke ukwuu: onye ọ bụla chọrọ ihe dị oyi.' },
      cloudy: { title: 'Igwe ojii na oyi', body: 'Igwe ojii na ikuku oyi na-eme ka ọtụtụ ndị na-azụ ahịa nọrọ n’ụlọ.' },
      rainy: { title: 'Mmiri ozuzo ụbọchị niile', body: 'Oke mmiri ozuzo: naanị ọkara ndị na-azụ ahịa pụtara.' },
      festival: { title: 'Ụbọchị ememe!', body: 'Ememe egwu jupụtara okporo ụzọ na igwe mmadụ.' },
      rival: { title: 'Tebụl onye asọmpi mepere', body: 'Tebụl ọhụrụ n’ofe okporo ụzọ na-ere otu ihe ahụ.' },
      rivalSale: {
        title: 'Nnukwu mbelata onye asọmpi',
        body: 'Tebụl onye asọmpi belatara ọnụahịa ya nke ukwuu iji nweta ndị ahịa.',
      },
      shortage: { title: 'Ụkọ ngwa', body: 'Owuwe ihe ubi adịghị mma: ngwa gị dị oke ọnụ karịa 60% taa.' },
      tourists: {
        title: 'Ụgbọ ndị njem nlegharị anya bịara',
        body: 'Ndị njem jupụtara ahịa. Ọnụahịa anaghị echegbu ha nke ukwuu.',
      },
      payday: { title: 'Ụbọchị ụgwọ ọnwa', body: 'Ụlọ nrụpụta dị nso ka kwụrụ ndị ọrụ ya ụgwọ.' },
      cold: {
        title: 'Oyi siri ike',
        body: 'Oyi na-atụ nke ukwuu: ndị na-azụ ahịa dị ole na ole, ha na-achọkwa ihe dị ọnụ ala.',
      },
      bulk: { title: 'Owuwe ihe ubi buru ibu', body: 'Ndị na-enye ngwa nwere ọtụtụ: ngwa gị dị ọnụ ala 25% taa.' },
    },
    ideas: {
      demand:
        'Iwu ọchịchọ (law of demand): mgbe ọnụahịa rịrị elu, ndị mmadụ na-azụ obere; mgbe ọ dara, ha na-azụ karịa. Ọnụahịa kacha mma na-edozi ole ị na-ere na ole ị na-enweta n’otu ọ bụla.',
      shiftRight:
        'Ọchịchọ mụbara: n’ọnụahịa ọ bụla, ọtụtụ ndị chọrọ ịzụ. Mgbe ọchịchọ rịrị elu, ị nwere ike ire karịa ma na-anakwa ntakịrị karịa.',
      shiftLeft:
        'Ọchịchọ dara: n’ọnụahịa ọ bụla, obere ndị chọrọ ịzụ. Zụta obere ngwa ka ị ghara itufu ya, atụkwala anya na ọnụahịa dị elu ga-arụ ọrụ.',
      peak: 'Oke ọchịchọ: n’ụbọchị ọrụ juru, azụmahịa na-enweta ọtụtụ ego ha. Nwee ngwa zuru ezu: ịgwụ ngwa pụtara ịchụghachi ndị ahịa nwere ego.',
      competition:
        'Asọmpi: mgbe onye asọmpi na-ere otu ihe ahụ, ndị ahịa na-atụnyere ọnụahịa. Nara karịa ha nke ukwuu, ndị ahịa ga-agafe okporo ụzọ.',
      substitutes:
        'Ihe nnọchi (substitutes): mgbe ngwaahịa yiri nke gị dị ọnụ ala, ọchịchọ nke gị na-ada. Ị nwere ike ibelata ntakịrị, mana agha ọnụahịa nwere ike ihichapụ uru.',
      supplyShock:
        'Ujo ngwa (supply shock): mgbe mmefu rịrị elu, ire ọ bụla na-enweta obere. Azụmahịa na-ebulikarị ọnụahịa ma na-ere ntakịrị obere.',
      inelastic:
        'Ọchịchọ anaghị agbanwe (inelastic demand): ndị ahịa ụfọdụ anaghị eche maka ọnụahịa. Mgbe ọnụahịa anaghị echegbu ndị na-azụ, ọnụahịa dị elu na-eweta karịa.',
      income:
        'Mmetụta ego mbata: mgbe ndị mmadụ nwere ego karịa, ha na-azụ karịa ma ọnụahịa anaghị echegbu ha nke ukwuu.',
      elastic:
        'Ọchịchọ na-agbanwe (elastic demand): ndị ahịa na-eche maka ọnụahịa na-azụ obere nke ukwuu mgbe ọnụahịa rịrị elu. Mee ka ọnụahịa dị ala n’ụbọchị dị otu a.',
      supplyGlut:
        'Mmefu dị ala: mgbe ngwa dị ọnụ ala, ire ọ bụla na-enweta karịa, ọnụahịa dị ntakịrị ala nwere ike inweta ndị ahịa ọzọ.',
    },
  },

  // ─── Profit Quest ──────────────────────────────────────────────────────────
  profit: {
    products: {
      backpacks: 'akpa azụ',
      bikes: 'igwe ịnyịnya',
      phoneCases: 'okpuchi ekwentị',
      shoes: 'akpụkpọ ụkwụ ụlọ akwụkwọ',
    },
    factory: 'Ụlọ nrụpụta gị na-emepụta {{product}}',
    step: 'Ihe ịma aka {{n}} n’ime {{total}}',
    calcTitle: 'MGBAKỌ AZỤMAHỊA',
    calc: {
      contribution:
        'Ị na-ere {{product}} ${{price}} otu. Imepụta otu na-efu ${{unit}} n’ihe na ọrụ aka. Ole ka ire ọ bụla na-enye maka mmefu kwụ ọtọ gị?',
      breakeven:
        'Otu {{product}} gị ọ bụla na-ere ${{price}} ma imepụta ya bụ ${{unit}}. Mmefu kwụ ọtọ (ụgwọ ụlọ, igwe, ndị isi) bụ ${{fixed}} kwa izu. Ole ka ị ga-ere kwa izu iji kwụ ọtọ (break even)?',
      profit:
        'Ị rere {{units}} {{product}} na ${{price}}. Imepụta otu bụ ${{unit}}, mmefu kwụ ọtọ bụ ${{fixed}}. Gịnị bụ uru gị?',
      margin:
        'Ị rere {{units}} {{product}} na ${{price}}. Imepụta otu bụ ${{unit}}, mmefu kwụ ọtọ bụ ${{fixed}}. Gịnị bụ profit margin gị (uru dị ka % nke ego mbata)?',
      priceForTarget:
        'Ị na-atụ anya ire {{units}} {{product}}. Imepụta otu bụ ${{unit}}, mmefu kwụ ọtọ bụ ${{fixed}}. Kedu ọnụahịa ga-enye gị uru ${{target}}?',
      machine:
        '{{product}} gị na-ere ${{price}} ma imepụta otu bụ ${{unit}}; mmefu kwụ ọtọ bụ ${{fixed}}. Igwe ọhụrụ na-agbakwunye ${{extra}} na mmefu kwụ ọtọ mana ọ na-echekwa ${{saving}} n’otu ọ bụla e mepụtara. Gịnị bụ ọnụọgụ break-even ọhụrụ?',
    },
    formula: {
      contribution:
        'Ntinye n’otu (contribution) = ọnụahịa − mmefu na-agbanwe. Ọ bụ ihe ire ọ bụla na-enye maka ịkwụ mmefu kwụ ọtọ, wee maka uru.',
      breakeven: 'Ọnụọgụ break-even = mmefu kwụ ọtọ ÷ ntinye n’otu (gbakọọ elu). Ree karịa nke a, ị ga-enweta uru.',
      profit: 'Uru = ọnụọgụ × (ọnụahịa − mmefu na-agbanwe) − mmefu kwụ ọtọ.',
      margin: 'Profit margin = uru ÷ ego mbata × 100. Ọ na-egosi ole n’ime dọla ọ bụla e rere ị na-edebe.',
      priceForTarget: 'Ọnụahịa = mmefu na-agbanwe + (mmefu kwụ ọtọ + uru a chọrọ) ÷ ọnụọgụ.',
      machine:
        'Break-even ọhụrụ = (mmefu kwụ ọtọ + mmefu kwụ ọtọ mgbakwunye) ÷ (ọnụahịa − mmefu na-agbanwe ọhụrụ). Igwe na-ebuli mmefu kwụ ọtọ mana ọ na-ebelata ọnụ otu ọ bụla.',
    },
    percent: '{{n}}%',
    right: 'Ọ dị mma! +{{points}}',
    wrong: 'Ọ bụghị ya: azịza ya bụ {{answer}}.',
    week: 'IZU ỤLỌ NRỤPỤTA',
    numbers: 'Imepụta otu bụ ${{unit}} · mmefu kwụ ọtọ ${{fixed}} kwa izu · {{stock}} n’ụlọ nkwakọba',
    research: 'NNYOCHA AHỊA',
    researchRow: 'Na ${{price}}: ndị ahịa {{count}} kwa izu',
    researchAbout: 'Na ${{price}}: ihe dị ka ndị ahịa {{count}} kwa izu',
    price: 'Ọnụahịa',
    make: 'Mepụta n’izu a',
    breakEven: 'N’ọnụahịa a, ị ga-akwụ ọtọ mgbe ire {{count}} gasịrị',
    noBreakEven: 'N’ọnụahịa a, ị na-efunahụ ego n’ire ọ bụla!',
    upgrades: 'TINYE EGO N’IZU A?',
    upgrade: {
      none: { title: 'Enweghị ntinye ego', body: 'Hapụ ihe ka ha dị.' },
      machine: { title: 'Igwe ọhụrụ', body: 'Mmefu kwụ ọtọ +25%, mana imepụta otu ọ bụla dị ọnụ ala 25%.' },
      ads: { title: 'Mgbasa ozi', body: 'Mmefu kwụ ọtọ +15%, na ndị ahịa karịrị 20% n’ọnụahịa ọ bụla.' },
    },
    owned: 'Ezụtala ya',
    run: 'Bie izu a',
    report: 'AKỤKỌ IZU',
    line: {
      demand: 'Ndị ahịa {{wanted}} chọrọ ịzụ · ị rere {{sold}} · {{stock}} fọdụrụ n’ụlọ nkwakọba',
      revenue: 'Ego mbata',
      cogs: 'Ọnụ ihe e rere',
      fixed: 'Mmefu kwụ ọtọ',
      storage: 'Nchekwa ngwa a na-erepụghị',
      profit: 'Uru',
      best: 'Ọnụahịa kacha mma n’izu a: ${{price}}, maka uru ${{profit}}',
      over: 'Ị mepụtara karịa ihe ị nwere ike ire: ichekwa ngwa a na-erepụghị na-efu ego.',
      under: 'Ngwa gị gwụrụ: ndị ahịa ọzọ chọrọ ịzụ.',
    },
  },

  // ─── Market Simulator ──────────────────────────────────────────────────────
  invest: {
    practice: 'Naanị ego mmụta · ụlọ ọrụ akpụrụ akpụ',
    quarter: 'Nkeji {{n}} n’ime {{total}}',
    portfolio: 'Portfolio gị',
    indexCompare: 'Ahịa niile (index fund): ${{value}}',
    news: 'AKỤKỌ',
    quizTitle: 'AJỤJỤ ONYE NTINYE EGO',
    allocate: 'KESAA ${{value}} GỊ',
    total: 'Mkpokọta: {{pct}}%',
    totalHint: 'Nhọrọ gị ga-agbakọ ruo 100%.',
    limit: 'Etinyela karịa {{pct}}% n’otu ụlọ ọrụ iji kesaa ihe ize ndụ gị.',
    feesNote: 'Ụgwọ kwa nkeji: index fund 0.05%, bond 0.1%, òkè ụlọ ọrụ ọ bụla 0.3%.',
    run: 'Nkeji na-esote',
    report: 'NSONAAZỤ NKEJI {{n}}',
    yourReturn: 'Uru gị: {{pct}}',
    indexReturn: 'Ahịa niile: {{pct}}',
    fees: 'Ụgwọ: {{pct}}',
    value: 'Portfolio ugbu a: ${{value}}',
    concentrated: 'Ọ karịrị akarị n’otu ụlọ ọrụ! Ọ bụrụ na ọ daa, portfolio gị niile ga-eso ya daa.',
    risk: {
      low: 'Obere ihe ize ndụ',
      medium: 'Ihe ize ndụ etiti',
      high: 'Nnukwu ihe ize ndụ',
    },
    assets: {
      cash: { name: 'Nchekwa ego', body: 'Ọ dị nchebe, mana ọ na-eto nwayọ nwayọ' },
      bonds: { name: 'Bond fund', body: 'Mbinye ego nye gọọmentị na ụlọ ọrụ: uru kwụ ọtọ, nke dị obere' },
      index: { name: 'Index fund', body: 'Ntakịrị n’ụlọ ọrụ ọ bụla: na-ekesa ihe ize ndụ gị' },
      sunpower: { name: 'SunPower Energy', body: 'Ike anyanwụ na ọkụ latrik' },
      greenleaf: { name: 'GreenLeaf Foods', body: 'Nri na ihe oriri' },
      roboworks: { name: 'RoboWorks', body: 'Robot na teknụzụ' },
      citybank: { name: 'City Bank', body: 'Ụlọ akụ na mbinye ego' },
      vitahealth: { name: 'VitaHealth', body: 'Ọgwụ na ahụike' },
      shopstream: { name: 'ShopStream', body: 'Ụlọ ahịa n’ịntanetị na n’okporo ụzọ' },
    },
    newsItems: {
      heatwave: 'Oke okpomọkụ! Ọchịchọ ọkụ latrik rịgoro elu nke ukwuu.',
      robotOrder: 'RoboWorks nwetara nnukwu ọda robot ụlọ nrụpụta.',
      harvest: 'Owuwe ihe ubi kacha ibu belatara mmefu ụlọ ọrụ nri.',
      recall: 'RoboWorks na-akpọghachi ọtụtụ puku robot mebiri emebi.',
      shopping: 'Ịzụ ahịa oge ezumike gafere ndekọ niile.',
      medicine: 'A kwadola ọgwụ ọhụrụ VitaHealth.',
      rateRise: 'Ụlọ akụ etiti buliri ọmụrụ nwa.',
      oilDrop: 'Ọnụahịa ike dara nke ukwuu.',
      recession: 'Egwu ndakpọ akụ na ụba: ndị na-azụ ahịa na-ebelata mmefu.',
      boom: 'Akụ na ụba na-eto ngwa ngwa karịa ka a tụrụ anya.',
      bankScandal: 'A tara City Bank ụgwọ maka izo ego o funahụrụ.',
      hype: 'Onye ọ bụla n’ịntanetị na-ekwu na RoboWorks ga-"aga ọnwa"!',
      rumour: 'Ozi onye amaghị aha: "A ga-azụta ShopStream!" (a kwadoghị ya)',
      quietQuarter: 'Nkeji dị jụụ: enweghị nnukwu akụkọ.',
      crash: 'Ahịa dakpọrọ! Ọnụahịa na-ada ebe niile.',
      rebound: 'Ahịa na-ebili ọzọ mgbe ndakpọ ahụ gasịrị.',
    },
    quiz: {
      share: {
        q: 'Gịnị ka ị nwere mgbe ị zụtara òkè (share)?',
        options: [
          'Mbinye ego nye ụlọ ọrụ ahụ',
          'Obere akụkụ nke ụlọ ọrụ ahụ',
          'Uru e kwere nkwa ya',
          'Ọrụ n’ụlọ ọrụ ahụ',
        ],
        why: 'Òkè bụ obere akụkụ nke inwe ụlọ ọrụ. Ọ bụrụ na ụlọ ọrụ ahụ mere nke ọma, uru òkè gị nwere ike ịrị elu ma o nwekwara ike ịkwụ dividend.',
      },
      diversify: {
        q: 'Gịnị ka ikesa ntinye ego (diversify) pụtara?',
        options: [
          'Zụta naanị ụlọ ọrụ kacha mma',
          'Debe ego gị niile dị ka ego n’aka',
          'Kesaa ego n’ọtụtụ ntinye ego dị iche iche',
          'Ree mgbe ọ bụla ọnụahịa dara',
        ],
        why: 'Ikesa pụtara ịghara itinye akwa gị niile n’otu nkata. Ọ bụrụ na otu ntinye ego dara, ndị ọzọ nwere ike ijide portfolio gị kwụ ọtọ.',
      },
      riskReturn: {
        q: 'Ntinye ego nwere ike inweta karịa na-abụkarị…',
        options: ['Ndị nwere ihe ize ndụ karịa', 'Ndị dị nchebe kpamkpam', 'Ndị anaghị efu ego', 'Naanị maka ụlọ akụ'],
        why: 'Uru nwere ike ịdị elu na-esokarị ihe ize ndụ dị elu: ọnụahịa nwere ike ịgbanwe nke ukwuu n’akụkụ abụọ.',
      },
      index: {
        q: 'Gịnị bụ index fund?',
        options: [
          'Akaụntụ nchekwa',
          'Otu ụlọ ọrụ teknụzụ',
          'Mbinye ego gọọmentị',
          'Fund nwere ọtụtụ ụlọ ọrụ n’otu ahịa',
        ],
        why: 'Index fund na-azụ ntakịrị n’ụlọ ọrụ ọ bụla n’ahịa, ya mere ị na-enweta uru nkezi nke ahịa na obere ụgwọ na obere ihe ize ndụ karịa otu ụlọ ọrụ.',
      },
      bond: {
        q: 'Mgbe ị zụtara bond, ị na-…',
        options: [
          'Azụ akụkụ nke ụlọ ọrụ',
          'Abinye ego a ga-akwụghachi gị ya na ọmụrụ nwa',
          'Azụ ọla edo',
          'Akwụ ụtụ isi',
        ],
        why: 'Bond bụ mbinye ego nye gọọmentị ma ọ bụ ụlọ ọrụ. Ha na-akwụ gị ọmụrụ nwa ma weghachi ego gị mgbe e mesịrị, ya mere bond na-akwụkarị ọtọ karịa òkè.',
      },
      dividend: {
        q: 'Gịnị bụ dividend?',
        options: [
          'Akụkụ nke uru ụlọ ọrụ a na-akwụ ndị nwe òkè',
          'Ụgwọ maka ịzụ òkè',
          'Ụdị mbinye ego',
          'Ọdịda ọnụahịa òkè',
        ],
        why: 'Ụfọdụ ụlọ ọrụ na-ekekọrịta akụkụ nke uru ha na ndị nwe ha (ndị nwe òkè) dị ka dividend.',
      },
      compound: {
        q: 'Gịnị mere ịmalite itinye ego n’oge ji enye aka nke ukwuu?',
        options: [
          'Ọnụahịa na-adị ala mgbe niile',
          'Ụlọ akụ na-enye ndị ntorobịa ego mgbakwunye',
          'Uru na-amụta uru ọzọ ka oge na-aga (compounding)',
          'Ị naghị akwụ ụgwọ ọ bụla',
        ],
        why: 'Na compounding, uru gị na-amalite inweta uru nke ha. Ka ego gị na-eto ogologo oge, ka ọ na-eto ọsọ ọsọ.',
      },
      emergencyFirst: {
        q: 'Gịnị ka ị kwesịrị inwe tupu ị tinye ego?',
        options: ['Ụgbọ ala', 'Kaadị kredit', 'Ndụmọdụ òkè site n’aka enyi', 'Ego mberede'],
        why: 'Ntinye ego nwere ike ịda na obere oge. Ego mberede pụtara na a gaghị amanye gị ire n’oge ọjọọ iji kwụọ maka ihe mberede.',
      },
      pastPerformance: {
        q: 'Ọnụahịa òkè otu ụlọ ọrụ baara okpukpu abụọ n’afọ gara aga. Nke a pụtara…',
        options: [
          'Ọ ga-aba okpukpu abụọ ọzọ',
          'Ọ dịghị ihe doro anya maka afọ na-abịa',
          'Ọ nweghị ihe ize ndụ ugbu a',
          'Ị ga-azụrịrị ya ugbu a',
        ],
        why: 'Ihe mere n’oge gara aga anaghị ekwe nkwa nsonaazụ n’ọdịnihu. Ọnụahịa na-adabere n’ihe na-esote, ọ bụghị n’ihe mere na mbụ.',
      },
      inflation: {
        q: 'Gịnị mere idebe ego gị niile dị ka ego n’aka ji nwee ike ifunahụ uru ka oge na-aga?',
        options: [
          'Inflation na-eme ka ọnụahịa rịa elu ọsọ karịa ka ego na-eto',
          'Ụlọ akụ na-ewere ya',
          'Ego n’aka na-emebi',
          'Òkè na-anọchi ego n’aka',
        ],
        why: 'Inflation pụtara na ọnụahịa na-arị elu kwa afọ. Ọ bụrụ na ego gị na-eto nwayọ karịa ọnụahịa, ọ na-azụ obere ka oge na-aga.',
      },
      longTerm: {
        q: 'Kedu ụzọ na-arụkarị ọrụ nke ọma maka ndị nkịtị na-etinye ego?',
        options: [
          'Ịzụ na ire kwa ụbọchị',
          'Ịgbaso ndụmọdụ n’ịntanetị',
          'Itinye ego mgbe niile ogologo oge',
          'Itinye ihe niile n’otu ụlọ ọrụ',
        ],
        why: 'Itinye ego mgbe niile ogologo oge n’ime portfolio e kesara akesa emeriela ịnwa ịkọ mgbanwe obere oge n’akụkọ ihe mere eme.',
      },
      fees: {
        q: 'Gịnị mere ụgwọ ntinye ego ji dị mkpa?',
        options: [
          'Ha adịghị mkpa, ha pere mpe',
          'Ha na-eme ka uru bawanye',
          'Naanị ụlọ akụ na-akwụ ha',
          'A na-ewere ha kwa afọ, ha na-ebelatakwa uru gị',
        ],
        why: 'A na-ewepụ ụgwọ kwa afọ, ihe ọ bụla mee. Ka ọtụtụ afọ na-aga, ọbụna obere ụgwọ na-aghọ nnukwu ọdịiche.',
      },
      hype: {
        q: 'Onye ọ bụla n’ịntanetị na-ekwu na otu òkè ga-"aga ọnwa". Gịnị bụ amamihe?',
        options: [
          'Zụta ọtụtụ dị ka o kwere mee',
          'Kpachara anya: mkpọtụ (hype) na-adịkarị n’ọnụahịa ugbu a',
          'Binye ego zụta ya',
          'Gwa onye ọ bụla ka ọ zụta ya',
        ],
        why: 'Mgbe a na-eto ihe ebe niile, ọnụahịa ya na-arịgokarịrị elu. Mkpọtụ na-ejedebekarị n’ọdịda siri ike.',
      },
      bearMarket: {
        q: 'Gịnị bụ bear market?',
        options: [
          'Ogologo oge ọnụahịa na-ada',
          'Ahịa maka anụmanụ',
          'Oge ọnụahịa na-arị elu ọsọ ọsọ',
          'Ahịa mechiri emechi',
        ],
        why: 'Bear market bụ ogologo ọdịda ọnụahịa; bull market bụ ogologo mmụba. Ha abụọ bụ akụkụ nkịtị nke itinye ego.',
      },
      pricedIn: {
        q: 'Ozi ọma onye ọ bụla maralarị na-abụkarị…',
        options: [
          'Uru e kwere nkwa ya',
          'Megidere iwu iji ya',
          'Ọ dịlarị n’ọnụahịa (priced in)',
          'Ahịa na-eleghara ya anya',
        ],
        why: 'Ahịa na-emeghachi omume ngwa ngwa. Mgbe ọtụtụ mmadụ maara ozi, ndị na-azụ ebulilarị ọnụahịa elu.',
      },
      rates: {
        q: 'Mgbe ọmụrụ nwa rịrị elu, gịnị na-emekarị?',
        options: [
          'Òkè niile na-arị elu',
          'Nchekwa ego n’aka na-enweta obere',
          'Ọ dịghị ihe na-agbanwe',
          'Ịbinye ego na-akarị ọnụ, ụfọdụ òkè na-adakwa',
        ],
        why: 'Ọmụrụ nwa dị elu na-eme ka ịbinye ego dị oke ọnụ, nke nwere ike ime ka ụlọ ọrụ dabere na mbinye ego dalata, ebe ụlọ akụ nwere ike inweta karịa.',
      },
      panicSell: {
        q: 'Ahịa dakpọrọ 12%. Gịnị ka ndị na-etinye ego nwere ndidi na-emekarị?',
        options: [
          'Ree ihe niile ozugbo',
          'Nọrọ jụụ ma jidesie atụmatụ ha ike',
          'Binye ego zụta otu òkè',
          'Kwụsị ichekwa ego ruo mgbe ebighị ebi',
        ],
        why: 'Ire n’ụjọ na-eme ka ọnwụ ego ahụ bụrụ nke kwụ ọtọ. N’akụkọ ihe mere eme, ahịa na-ebili ọzọ ka oge na-aga, a kwụkwara ndị nọgidere ụgwọ ọrụ ha.',
      },
      rebalance: {
        q: 'Gịnị ka ịhazighachi (rebalance) portfolio pụtara?',
        options: [
          'Iweghachi ya n’ngwakọta ntinye ego ị haziri',
          'Ire ihe niile',
          'Ịzụkwu nke rịgoro elu kacha',
          'Ịgbanwe ụlọ akụ',
        ],
        why: 'Ka ọnụahịa na-agbanwe, ngwakọta gị na-agbagọ. Ịhazighachi na-eweghachi ya n’ọkwa ihe ize ndụ ị haziri.',
      },
    },
  },
};

export default business;
