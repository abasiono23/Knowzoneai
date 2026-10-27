/** Knowzone World Business District (Hausa): the square, its five places and the five business & finance games. */
import type { Translation } from '../../types';
import type en from '../en/business';

const business: Translation<typeof en> = {
  title: 'Unguwar Kasuwanci',
  entryEyebrow: 'KASUWANCI & KUƊI · SABO',
  entryTitle: 'Unguwar Kasuwanci',
  entryBody:
    'Gudanar da sabon kamfani, ƙware a kasafin kuɗi, saka farashi a rumfar kasuwa, sa masana’anta ta ci riba kuma zuba jarin kuɗin gwaji',
  leave: 'Fita daga Unguwar Kasuwanci',
  offline: 'Unguwar Kasuwanci tana buƙatar intanet, saboda sabar mu ce ke gudanar da kowane zaɓi.',
  result: {
    back: 'Koma Unguwar Kasuwanci',
  },
  hall: {
    walkTo: 'Tafi zuwa {{station}}',
    you: 'Kai ne, cikin blazer ɗinka na Knowzone',
    open: 'Shiga {{station}}',
    goHere: 'Je nan',
    stars: 'Taurari {{count}} cikin {{max}}',
    tip: 'Tafi wani gini don fara wasa. Danna suna don tafiya can.',
  },
  stations: {
    startup: 'Hedkwatar Startup',
    budget: 'Bankin Kasafi',
    market: 'Dandalin Kasuwa',
    factory: 'Masana’antar Riba',
    exchange: 'Kasuwar Hannayen Jari',
  },
  games: {
    'startup-tycoon': {
      name: 'Hamshaƙin Startup',
      how: 'Gudanar da kamfaninka wata bayan wata: ɗauki masu ƙerawa, masu sayarwa da ma’aikatan taimako, kashe kuɗi a talla kuma ka magance zaɓuɓɓuka masu wuya. Ƙara darajarsa ba tare da kuɗi sun ƙare ba.',
    },
    'budget-master': {
      name: 'Gwanin Kasafi',
      how: 'Tsara albashin wata: biya kuɗaɗe, ci abinci mai kyau, tara kuɗi don wata manufa, gina asusun gaggawa kuma ka magance abubuwan mamaki ba tare da faɗawa cikin bashi ba.',
    },
    'market-master': {
      name: 'Gwanin Kasuwa',
      how: 'Gudanar da rumfar kasuwa: zaɓi farashinka da yawan kayan da za ka saya kowace rana yayin da yanayi, taron jama’a da abokin hamayya ke canza buƙata.',
    },
    'profit-quest': {
      name: 'Neman Riba',
      how: 'Ƙware a lissafin kasuwanci (gefen riba, break-even, riba), sannan gudanar da masana’anta mako bayan mako: saka farashi, yawan abin da za a ƙera da lokacin zuba jari.',
    },
    'market-simulator': {
      name: 'Kwaikwayon Kasuwar Jari',
      how: 'Zuba kuɗin gwaji a kamfanoni na ƙirƙira, bonds da index fund. Labarai suna motsa kasuwa: raba haɗarinka kuma koyi yadda zuba jari yake aiki. Ba kuɗi na gaske ba.',
    },
  },

  ui: {
    money: '${{amount}}',
    minus: '−${{amount}}',
    perMonth: '${{amount}}/wata',
    next: 'Na gaba',
    finish: 'Duba sakamako',
    best: 'Mafi kyawun zaɓi',
    good: 'Zaɓi mai kyau',
    fair: 'Zaɓi matsakaici',
    poor: 'Zaɓi mara kyau',
    bestWas: 'Mafi kyawun zaɓi shi ne: {{choice}}',
    lesson: 'DARASIN KASUWANCI',
    left: 'Saura don tsarawa: ${{amount}}',
    over: 'Ya wuce da ${{amount}}',
    points: '+maki {{points}}',
    more: 'Ƙari',
    less: 'Ƙasa',
    pick: 'Zaɓi wani zaɓi da farko.',
    unbalanced: 'Tsara kowace dala: jimlar dole ta yi daidai sosai.',
    invalid: 'Ba a yarda da wannan tsarin ba. Duba lambobin.',
  },

  // ─── Startup Tycoon ────────────────────────────────────────────────────────
  startup: {
    companies: {
      bakery: 'Gidan Burodi & Café na Sunrise',
      repair: 'FixIt Gyaran Waya',
      apps: 'Pixel Ɗakin Apps',
      fashion: 'Thread Alamar Kayan Sawa',
      solar: 'BrightSun Masu Saka Solar',
    },
    sale: {
      bakery: 'keki da kofi',
      repair: 'gyare-gyare',
      apps: 'ayyukan app',
      fashion: 'tufafi',
      solar: 'kafe-kafe na solar',
    },
    month: 'Wata {{n}} cikin {{total}}',
    goal: 'Manufa: rabonka ya kai ${{goal}}',
    value: 'Darajar kamfani',
    cash: 'Kuɗi a hannu',
    morale: 'Ƙwarin gwiwa',
    rep: 'Suna',
    owned: 'Kana da {{pct}}%',
    decision: 'ZAƁIN WANNAN WATA',
    team: 'TAWAGARKA',
    roles: {
      maker: 'Masu ƙerawa',
      seller: 'Masu sayarwa',
      support: 'Taimako',
    },
    roleHint: {
      maker: 'Kowanne yana yin kusan {{n}} {{sale}} a wata',
      seller: 'Kowanne yana kawo ƙarin abokan ciniki kusan {{n}} a wata',
      support: 'Yana kula da takardu da abokan ciniki; kowanne yana kula da abokan aiki 4',
    },
    salary: '${{amount}}/wata kowanne',
    hireCost: 'Kuɗin ɗaukar aiki: ${{amount}} (ɗauka da horo)',
    payroll: 'Albashi: ${{amount}}/wata',
    marketing: 'TALLA A WANNAN WATA',
    none: 'Babu',
    run: 'Gudanar da watan',
    report: 'RAHOTON WATA NA {{n}}',
    statement: {
      revenue: 'Kuɗin shiga (sayarwa)',
      cogs: 'Kuɗin kayan da aka sayar',
      gross: 'Babban riba (gefen riba {{pct}}%)',
      payroll: 'Albashi',
      rent: 'Haya',
      marketing: 'Talla',
      other: 'Kuɗaɗe da kuɗin shiga na lokaci ɗaya',
      loan: 'Biyan bashi',
      net: 'Riba ta ƙarshe',
      cash: 'Kuɗi a banki',
      runway: 'A wannan saurin, kuɗi za su ɗore ƙarin watanni {{count}}',
    },
    ops: {
      line: 'Abokan ciniki {{demand}} sun so saya · tawagarka za ta iya yi wa {{capacity}} hidima · ka sayar da {{sold}}',
      order: 'Tare da oda na musamman na {{count}}',
      turnedAway: 'Ka mayar da abokan ciniki {{count}}. Ƙarin masu ƙerawa da sun kawo ƙarin kuɗi.',
      idle: 'Masu ƙerawa suna da lokacin hutu. Ƙarin masu sayarwa ko talla za su kawo abokan ciniki.',
      balanced: 'Abin da tawagarka ta yi ya dace da buƙata sosai.',
      overload: 'Tawagarka ta yi yawa ga ma’aikatan taimako: kowa ya yi sannu a hankali.',
      saturated: 'Kasuwarka tana cika: kowane ƙarin mai sayarwa yana kawo ƙananan sababbin abokan ciniki.',
    },
    bankrupt: 'Kuɗi sun ƙare! Kamfani na iya samun riba a takarda amma ya rushe idan kuɗi sun ƙare masa.',
    dilemmas: {
      poach: {
        title: 'Mafi kyawun mai ƙerawarka zai tafi?',
        body: 'Wani kamfani mai hamayya ya ba wa mai ƙerawarka mafi ƙwarewa aiki mai albashi mafi tsoka. Ya fi so ya zauna, amma yana buƙatar ƙarin albashi.',
        options: {
          match: 'Ba kowane mai ƙerawa ƙarin $120/wata',
          letGo: 'Yi masa fatan alheri ka bar shi ya tafi',
          threaten: 'Faɗa masa zai yi nadamar tafiya',
        },
        lesson:
          'Maye gurbin ma’aikaci nagari yawanci yana tsada fiye da riƙe shi: ɗauka, horo da asarar aiki yayin da sabon yake koyo. Albashi mai adalci yana riƙe mafi kyawun mutanenka kuma yana kiyaye ƙwarin gwiwa.',
      },
      bigOrder: {
        title: 'Babban oda, da babban rangwame',
        body: 'Wani babban abokin ciniki yana son babban oda a wannan wata, amma sai da rangwamen 40% daga farashinka na yau da kullum.',
        options: {
          negotiate: 'Yi ciniki: ƙaramin oda da rangwamen 15%',
          accept: 'Karɓi rangwamen 40%',
          decline: 'Ƙi cikin ladabi',
        },
        lesson:
          'Rangwame yana fitowa kai tsaye daga gefen ribarka. Kafin ka amince, duba ko farashin har yanzu yana rufe kuɗin yin kowanne, kuma kana da sarari. Ciniki abu ne na yau da kullum a kasuwanci.',
      },
      review: {
        title: 'Sharhi mai fushi a intanet',
        body: 'Wani abokin ciniki ya rubuta cewa hidimarka ta yi jinkiri kuma ba ta da ladabi. Wasu mutane suna karantawa.',
        options: {
          fix: 'Nemi gafara a fili, gyara matsalar kuma mayar masa da kuɗinsa',
          ignore: 'Yi watsi da shi, za a manta',
          argue: 'Amsa cewa abokin ciniki yana ƙarya',
        },
        lesson:
          'Sunanka yana dawo da abokan ciniki kuma yana sa su ba da shawarar ka ga wasu. Amsa ta gaskiya a fili ga ƙorafi sau da yawa tana samun amincewa fiye da rashin ƙorafi kwata-kwata.',
      },
      burnout: {
        title: 'Tawagar ta gaji',
        body: 'Bayan makonni na ƙarin aiki, ma’aikatanka sun gaji kuma suna yin kurakurai.',
        options: {
          rest: 'Ba kowa hutun kwana ɗaya da albashi kuma kawo taimako na wucin gadi',
          pizza: 'Saya wa tawagar pizza',
          push: 'Nemi ƙarin aiki fiye da haka a wannan wata',
        },
        lesson:
          'Mutanen da suka gaji suna yin ƙasa kuma suna barin aiki. Matsawa sosai yana ba da ƙarin aiki na ɗan lokaci amma yana jawo asara daga baya a ƙwarin gwiwa da tafiyar ma’aikata. Shugabanni nagari suna kare ƙarfin tawagarsu.',
      },
      agency: {
        title: 'Alƙawarin talla mai "yaɗuwa"',
        body: 'Wani kamfanin talla ya yi alƙawarin cewa kamfen na $2,000 zai sa ka shahara cikin dare ɗaya.',
        options: {
          test: 'Gwada ƙaramin gwaji na $300 kuma auna sakamakon',
          pay: 'Biya cikakken $2,000',
          skip: 'Ƙyale shi',
        },
        lesson:
          'Gwada kafin ka kashe kuɗi mai yawa. Ƙaramin gwaji da aka auna yana nuna ko talla tana kawo abokan ciniki da gaske, don ka faɗaɗa abin da ke aiki kawai. Manyan alƙawura ba hujja ba ne.',
      },
      fancyOffice: {
        title: 'Sabon ofis mai kyau?',
        body: 'Za ka iya komawa ofis mai kyau mai ɗakin wasanni. Komawa yana kashe $2,500 kuma haya za ta ƙaru da 30%.',
        options: {
          stay: 'Zauna, ka kashe kuɗi a abin da abokan ciniki ke gani',
          move: 'Koma can, tawagar za ta so shi',
        },
        lesson:
          'Kuɗaɗe na dindindin kamar haya dole a biya su kowane wata ko ka sayar ko ba ka sayar ba. Rage su, musamman a farko, don kasuwancinka ya tsira a watanni marasa ciniki.',
      },
      sponsor: {
        title: 'Ɗauki nauyin ranar wasanni ta makaranta?',
        body: 'Wata makaranta ta unguwa tana roƙonka ka ɗauki nauyin ranar wasanninta da $300. Sunanka zai kasance a kan T-shirts.',
        options: {
          sponsor: 'Ɗauki nauyi',
          decline: 'Ƙi cikin ladabi',
        },
        lesson:
          'Taimakon al’ummarka yana gina fatan alheri da sanin alamarka a unguwa. Wani nau’in talla ne da kuma yake yin alheri.',
      },
      supplier: {
        title: 'Mai kawo maka kaya ya ƙara farashi',
        body: 'Kayan da kake saya yanzu sun ƙara tsada da 20%.',
        options: {
          shop: 'Kwatanta sauran masu kawo kaya kuma yi ciniki',
          raise: 'Tura tsadar: ƙara farashinka da 8%',
          cheap: 'Koma kayayyaki masu arha sosai, marasa inganci',
        },
        lesson:
          'Idan kuɗaɗe sun hau, fara da neman wasu da yin ciniki. Rage inganci yana kare gefen ribarka na wata ɗaya amma yana lalata sunanka na dogon lokaci.',
      },
      latePayer: {
        title: 'Wani abokin ciniki bai biya ba',
        body: 'Wani babban abokin ciniki har yanzu yana bin ka $1,500 tun kwanaki 60 da suka wuce, kuma kuɗi suna ƙaranci.',
        options: {
          remind: 'Aika tunatarwa cikin ladabi kuma ba da ɗan rangwame don biya yanzu',
          wait: 'Jira ka yi fatan zai biya',
          threaten: 'Yi masa barazana da lauyoyi',
        },
        lesson:
          'Riba ba ɗaya ba ce da kuɗi a hannu. Kuɗin da abokan ciniki ke bin ka (receivables) ba za su biya kuɗaɗenka ba sai sun iso. Bin bashin cikin ladabi da sauri yana sa kuɗi su ci gaba da shigowa.',
      },
      newLine: {
        title: 'Sabon ra’ayin kaya',
        body: 'Wani a cikin tawagar yana da ra’ayin sabon nau’in kaya.',
        options: {
          pilot: 'Fara da ƙaramin gwaji tare da ’yan abokan ciniki',
          bigLaunch: 'Ƙaddamar da shi sosai da kaya da tallace-tallace masu yawa',
          later: 'Ba yanzu ba',
        },
        lesson:
          'Ƙirƙira tana sa kasuwanci ya ci gaba da girma, amma farawa da ƙarami yana ba ka damar koyon abin da abokan ciniki ke so da gaske kafin ka yi kasadar kuɗi mai yawa. Ana kiran wannan pilot ko minimum viable product.',
      },
      training: {
        title: 'Horar da tawagar?',
        body: 'Kwas na $500 zai sa ma’aikatanka su yi sauri kuma su ƙara ƙwarewa.',
        options: {
          train: 'Biya kuɗin kwas ɗin',
          free: 'Raba bidiyoyin kyauta na intanet maimakon haka',
          skip: 'Ƙyale horon',
        },
        lesson:
          'Horo jari ne a cikin mutane: ma’aikata masu ƙwarewa suna yin ƙari kuma suna jin ana daraja su, wanda ke dawo da kuɗin a watanni masu zuwa.',
      },
      loan: {
        title: 'Bashin banki',
        body: 'Banki yana ba da $4,000, da biyan $190 a wata (kusan ruwa 12% a shekara).',
        options: {
          machine: 'Karɓi bashin don sayen injin da ke ƙera ƙarin 25%',
          party: 'Karɓi bashin don bikin tawaga da sababbin kayan ɗaki',
          no: 'Kada ka karɓi bashi',
        },
        lesson:
          'Bashi mai kyau yana biyan abubuwan da ke kawo fiye da ruwan bashin, kamar kayan aiki da ke ƙara yawan aiki. Karɓar bashi don abubuwan da ba sa kawo kuɗi yana bar ka da biyan bashi kawai.',
      },
      rent: {
        title: 'Mai gida ya ƙara haya',
        body: 'Mai gidanka yana son ƙarin haya 25% daga wata mai zuwa.',
        options: {
          lease: 'Ba da shawarar sa hannu kan dogon kwangilar haya don ƙaramin ƙari',
          accept: 'Karɓi ƙarin',
          moveFar: 'Koma wuri mai arha nesa da abokan cinikinka',
        },
        lesson:
          'Kusan komai a kasuwanci ana iya yin ciniki a kai. Ba da abin da ɗayan ɓangare ke daraja (dogon kwangilar haya amintacce) na iya samo maka yarjejeniya mafi kyau. Wuri ma yana da muhimmanci: nisantar abokan ciniki yana rage ciniki.',
      },
      competitor: {
        title: 'Abokin hamayya ya buɗe kusa',
        body: 'Wani sabon kasuwanci ya buɗe a ƙasan titi da farashi mai rahusa.',
        options: {
          quality: 'Yi gasa a inganci da hidima, da katin aminci',
          priceWar: 'Rage farashinka da 25% don ka doke su',
          nothing: 'Kada ka yi komai',
        },
        lesson:
          'Yaƙin farashi na iya lalata ribar kasuwancin biyu. Sau da yawa ya fi hikima a yi gasa a abin da ya bambanta ka: inganci, hidima da abokan ciniki masu aminci.',
      },
      safety: {
        title: 'Binciken tsaro',
        body: 'Wani mai bincike ya gano matsalar tsaro a wurin aikinka.',
        options: {
          fixNow: 'Gyara shi yadda ya kamata nan da nan',
          later: 'Faci shi da arha kuma gyara shi daga baya',
        },
        lesson:
          'Dole kasuwanci ya kiyaye lafiyar ma’aikata da abokan ciniki. Gyara matsaloli da wuri ya fi arha fiye da tara, haɗari da lalacewar suna.',
      },
      remote: {
        title: 'Aiki daga gida?',
        body: 'Ma’aikatanka suna roƙon yin aiki daga gida wasu kwanaki.',
        options: {
          trial: 'Gwada shi na wata ɗaya kuma auna sakamakon',
          refuse: 'Ƙi',
          always: 'Bar kowa ya yi, kowace rana, ba tare da dubawa ba',
        },
        lesson:
          'Sassauci na iya ƙara ƙwarin gwiwa, amma shugabanni nagari suna gwada canje-canje kuma suna auna tasirinsu a kan aiki kafin su yanke shawara ta ƙarshe.',
      },
      investor: {
        title: 'Wani mai zuba jari yana son shiga',
        body: 'Wani mai zuba jari yana ba da $10,000 domin samun 40% na kamfaninka.',
        options: {
          counter: 'Mayar da tayi: $8,000 domin 20%',
          accept: 'Karɓi $10,000 domin 40%',
          refuse: 'Ƙi kuma ka yi girma da kuɗinka',
        },
        lesson:
          'Sayar da hannayen jari (equity) yana kawo kuɗi ba tare da bashi ba, amma kana ba da wani ɓangare na kowace riba ta gaba da na darajar kamfanin. Ana kiran wannan dilution. Yi ciniki kan farashin hannayen jarinka.',
      },
      tax: {
        title: 'Lokacin biyan haraji ya yi',
        body: 'Ana bin ka $700 na harajin kasuwanci a wannan wata.',
        options: {
          pay: 'Biya shi a kan lokaci',
          plan: 'Nemi tsarin biya na hukuma',
          ignore: 'Yi watsi da shi a yanzu',
        },
        lesson:
          'Haraji yana biyan hanyoyi, makarantu da asibitoci, kuma dole kowane kasuwanci ya biya shi. Jinkirin biya yana jawo tara, don haka kasuwanci masu hikima suna ajiye kuɗin haraji yayin da suke samu.',
      },
      bigClient: {
        title: 'Babban abokin ciniki guda ɗaya',
        body: 'Wani babban abokin ciniki yana son sayen rabin duk abin da kake yi, amma sai idan ka bar sauran abokan cinikinka.',
        options: {
          balance: 'Karɓi ƙaramar yarjejeniya kuma ka riƙe sauran abokan cinikinka',
          allIn: 'Bar kowa ka sa hannu',
          decline: 'Ƙi',
        },
        lesson:
          'Dogaro da abokin ciniki ɗaya haɗari ne: idan ya tafi, yawancin kasuwancinka zai tafi tare da shi. Raba ciniki tsakanin abokan ciniki da yawa yana ƙarfafa kamfani.',
      },
      ethics: {
        title: '"Kyauta" ta sirri',
        body: 'Wani mai kawo kaya yana ba ka kyauta ta sirri idan ka ci gaba da saye daga gare shi a farashi mafi tsada.',
        options: {
          refuse: 'Ƙi kuma ka kai rahoto',
          accept: 'Karɓi kyautar',
        },
        lesson:
          'Wannan kyauta cin hanci ce. Tana jawo wa kamfaninka asarar kuɗi, sau da yawa haramun ce a doka, kuma tana lalata amincewa. Kasuwanci masu gaskiya suna daɗewa.',
      },
    },
  },

  // ─── Budget Master ─────────────────────────────────────────────────────────
  budget: {
    month: 'Wata {{n}} cikin {{total}}',
    income: 'Kuɗin shiga na wannan wata',
    bills: 'KUƊAƊEN BIYA (DOLE)',
    afterBills: 'Abin da ya rage bayan biyan kuɗaɗe',
    plan: 'TSARINKA',
    billNames: {
      rent: 'Haya',
      utilities: 'Wutar lantarki da ruwa',
      phone: 'Waya da data',
      transport: 'Sufuri',
      minimum: 'Mafi ƙarancin biyan kati',
      subscription: 'Biyan kuɗin kallo (streaming)',
      bankFees: 'Kuɗin banki',
      carDeal: 'Biyan mota',
    },
    keys: {
      food: 'Abinci',
      fun: 'Nishaɗi',
      clothes: 'Tufafi',
      emergency: 'Asusun gaggawa',
      goal: 'Manufar ajiya',
      debt: 'Ƙarin biyan kati',
    },
    keyHint: {
      food: 'Kana buƙatar aƙalla ${{min}}',
      fun: 'Fita, wasanni, kayan daɗi',
      clothes: 'Sababbin tufafi da takalma',
      emergency: 'An ajiye ${{have}} · manufa ${{target}}',
      goal: '{{goal}}: ${{have}} cikin ${{target}}',
      debt: 'Bashin kati ${{have}} · ruwa {{rate}}% a wata',
    },
    goals: {
      laptop: 'Sabuwar laptop',
      bike: 'Keke',
      course: 'Kwas na code',
      travel: 'Tafiya',
      deposit: 'Kuɗin farko na gida',
    },
    rule: 'Buƙatu {{needs}}% · Sha’awa {{wants}}% · Ajiya {{savings}}%',
    ruleHint: 'Jagora mai kyau: buƙatu kusan 50%, sha’awa har zuwa 30%, ajiye aƙalla 20%.',
    restToGoal: 'Saka sauran a ajiya',
    event: 'WANNAN WATA',
    costFrom: {
      fun: '−${{amount}} daga kuɗin nishaɗi',
      emergency: '−${{amount}} daga asusun gaggawa',
      goal: '−${{amount}} daga ajiya',
      card: '−${{amount}} a katin bashi',
    },
    gain: '+${{amount}} zuwa ajiya',
    newBill: '+${{amount}} kowane wata',
    run: 'Rayu a watan',
    report: 'RAHOTON WATA NA {{n}}',
    check: {
      food: 'An ci abinci mai kyau',
      noFood: 'Bai isa abinci ba',
      saved: 'An ajiye {{pct}}% na kuɗin shiga',
      wants: 'An kashe {{pct}}% a sha’awa',
      card: '${{amount}} ya tafi a katin bashi',
      interest: 'Ruwan kati a wannan wata: ${{amount}}',
      debt: 'Bashin kati yanzu: ${{amount}}',
      emergency: 'Asusun gaggawa: ${{amount}}',
      goal: 'Manufar ajiya: ${{amount}} cikin ${{target}}',
    },
    events: {
      concert: {
        title: 'Gayyatar wasan kiɗa',
        body: 'Wani aboki yana gayyatar ka zuwa wasan kiɗa. Tikiti $80 ne.',
        options: {
          funMoney: 'Je, ka biya daga kuɗin nishaɗinka',
          freePlan: 'Ba da shawarar fikinik na kyauta maimakon haka',
          card: 'Je, ka saka shi a katin bashi',
        },
        lesson:
          'Nishaɗi wani ɓangare ne na kasafi mai lafiya: abin da kuɗin nishaɗinka ke nufi ke nan. Biyan sha’awa da bashi yana nufin biyan ruwa a kan dare ɗaya na fita har tsawon watanni.',
      },
      phone: {
        title: 'Allon waya ya fashe',
        body: 'Wayarka ta faɗi. Gyaran allo yana kashe $150.',
        options: {
          emergency: 'Biya daga asusun gaggawarka',
          card: 'Saka shi a katin bashi',
          newPhone: 'Saya sabuwar waya ta $700 da bashi',
        },
        lesson:
          'Daidai abin da asusun gaggawa ke nufi ke nan: abubuwan mamaki da ba za ka iya gujewa ba. Gyara yawanci ya fi arha sosai fiye da maye gurbi.',
      },
      sale: {
        title: '"Rangwamen 50%, yau kawai!"',
        body: 'Wani shago yana da rangwame na gaggawa a kan takalman wasa da ba ka buƙata da gaske: $120.',
        options: { skip: 'Ƙyale shi', funMoney: 'Saya su da kuɗin nishaɗi', card: 'Saya su da katin bashi' },
        lesson:
          'Rangwame a kan abin da ba ka buƙata ba ajiya ba ne, kashe kuɗi ne. "Yau kawai" an tsara shi don ya gaggauta ka. Jira kwana ɗaya kafin ka sayi abubuwan sha’awa.',
      },
      gift: {
        title: 'Ranar haihuwar Mama',
        body: 'Ranar haihuwar mamarka ce a wannan wata.',
        options: {
          funMoney: 'Kyautar $40 daga kuɗin nishaɗinka',
          handmade: 'Kati da ka yi da hannu da dafa mata abincin dare',
          card: 'Kyauta mai tsada ta $150 a katin bashi',
        },
        lesson:
          'Kyauta mai ma’ana ba dole ta zama mai tsada ba. Kyaututtuka suna cikin kashe kuɗin da ka tsara, ba a katin bashi ba.',
      },
      bonus: {
        title: 'Kyautar aiki ta $300!',
        body: 'Manajanka ya ba ka kyautar $300 saboda aiki mai kyau.',
        options: { save: 'Ajiye duka', split: 'Ajiye $240 ka ji daɗin $60', spend: 'Kashe duka a ƙarshen makon nan' },
        lesson:
          'Ƙarin kuɗi shi ne mafi sauƙin ajiyewa, saboda dama kana rayuwa ba tare da shi ba. Ajiye mafi yawan kuɗin bazata da jin daɗin kaɗan ɗabi’a ce mai kyau.',
      },
      scam: {
        title: '"Ninka kuɗinka cikin mako ɗaya!"',
        body: 'Wani group chat yana alƙawarin ninka duk kuɗin da ka aika musu cikin mako ɗaya.',
        options: { ignore: 'Yi watsi da shi kuma gargaɗi abokanka', invest: 'Aika musu $200 daga ajiyarka' },
        lesson:
          'Babu wanda zai iya ninka kuɗi lafiya cikin mako ɗaya. Alƙawarin riba mai yawa da tabbas alamar damfara ce: kuɗinka za su ɓace.',
      },
      bike: {
        title: 'Gyaran keke',
        body: 'Kekenka da kake hawa zuwa aiki yana buƙatar gyara na $220.',
        options: {
          emergency: 'Biya daga asusun gaggawarka',
          card: 'Saka shi a katin bashi',
          taxis: 'Ƙyale gyaran ka hau taksi duk wata ($380)',
        },
        lesson:
          'Jinkirta gyara da ya zama dole sau da yawa yana ƙara tsada. Asusun gaggawarka yana ba ka damar gyara matsaloli da sauri ba tare da bashi ba.',
      },
      subscription: {
        title: 'Gwajin kyauta yana ƙarewa',
        body: 'Gwajin kallo na kyauta ya ƙare. Daga yanzu zai kashe $15 kowane wata.',
        options: { cancel: 'Soke shi', keep: 'Riƙe shi' },
        lesson:
          'Ƙananan biyan kuɗi na wata-wata suna taruwa: $15 a wata $180 ne a shekara. Duba biyan kuɗinka akai-akai kuma soke abin da ba ka amfani da shi.',
      },
      sideHustle: {
        title: 'Koyarwa a ƙarshen mako',
        body: 'Wani maƙwabci yana son biyan ka $150 don koyar da ɗansa a ƙarshen mako.',
        options: { takeSave: 'Karɓa kuma ajiye abin da ka samu', decline: 'Ƙi ka riƙe ƙarshen makonka' },
        lesson:
          'Ƙarin kuɗin shiga yana gaggauta manufofinka. Ajiye ƙarin kuɗin shiga, maimakon kashe shi, yana kai ka can da sauri sosai.',
      },
      dentist: {
        title: 'Ciwon haƙori',
        body: 'Kana da ciwon haƙori. Likitan haƙori yana kashe $180.',
        options: {
          emergency: 'Je yanzu, ka biya daga asusun gaggawarka',
          card: 'Je yanzu, ka biya da katin bashi',
          wait: 'Jira har ya ƙara muni ($450 daga baya)',
        },
        lesson:
          'Kula da lafiyarka da wuri ya fi arha fiye da magance babbar matsala daga baya. Kada ka taɓa ƙin kulawar da kake buƙata don ajiye kuɗi.',
      },
      loanApp: {
        title: 'App na bashi nan take',
        body: 'Wani app yana ba ka $500 nan take. Za ka mayar da $650 cikin makonni biyu kacal.',
        options: { decline: 'Ƙi', take: 'Karɓa' },
        lesson:
          'Mayar da $650 domin $500 cikin makonni biyu ruwa ne mai yawan gaske, ninki da yawa fiye da katin bashi. Irin waɗannan basussuka suna kama mutane cikin bashi.',
      },
      foodPrices: {
        title: 'Farashin abinci ya hau',
        body: 'Farashi a shaguna ya hau da 10% a wannan wata: abinci yana kashe maka ƙarin $30.',
        options: { cutWants: 'Rage kashe kuɗi a sha’awa a wannan wata', card: 'Saka ƙarin a katin bashi' },
        lesson:
          'Idan farashi ya hau (hauhawar farashi), daidaita kasafinka ta rage sha’awa, ba ta karɓar bashi don buƙatu ba.',
      },
      bankFees: {
        title: 'Kuɗin banki',
        body: 'Bankinka yana caje ka $12 kowane wata saboda kawai kana da asusu.',
        options: { switch: 'Koma asusu na kyauta', stay: 'Zauna da wannan bankin' },
        lesson:
          'Kuɗaɗen caji suna cinye kuɗinka a hankali kowane wata. Kwatanta bankuna da komawa asusu na kyauta nasara ce mai sauƙi.',
      },
      friendLoan: {
        title: 'Wani aboki yana buƙatar kuɗi',
        body: 'Wani aboki yana roƙon aron $100 har wata mai zuwa.',
        options: {
          afford: 'Ba da rancen $100 daga kuɗin nishaɗi, kuɗin da za ka iya rayuwa ba tare da su ba',
          kindNo: 'Bayyana cikin ladabi cewa ba za ka iya a wannan wata ba',
          savings: 'Ba da rancen daga asusun gaggawarka',
        },
        lesson:
          'Ka ba da rance abin da za ka iya jurewa idan ba a dawo da shi ba kawai, kuma kada ka taɓa ba da shi daga asusun gaggawarka. Cewa a’a cikin ladabi ma ba laifi ba ne.',
      },
      matching: {
        title: 'Kuɗi kyauta daga wurin aiki',
        body: 'Mai ɗaukar ka aiki yana ƙara $1 a ajiyar ritayarka ga kowane $1 da ka ajiye a can, har zuwa $100 a wata.',
        options: { join: 'Shiga: ajiye $100 ka samu ƙarin $100', later: 'Wataƙila daga baya' },
        lesson:
          'Daidaita ajiya daga mai ɗaukar aiki riba ce ta 100% nan take a kan kuɗinka. Yana ɗaya daga cikin mafi kyawun yarjejeniyoyi a kuɗin kai: koyaushe ka karɓa idan za ka iya.',
      },
      carDeal: {
        title: '"$250 kawai a wata!"',
        body: 'Wani dillali yana ba ka mota mai sheƙi a "$250 kawai a wata" na tsawon shekaru shida.',
        options: { decline: 'Ƙi: ba ka buƙatar mota', sign: 'Sa hannu kan yarjejeniyar' },
        lesson: 'Duba jimlar, ba farashin wata ba: $250 × watanni 72 $18,000 ne. Dogon tsarin biya babban alƙawari ne.',
      },
    },
  },

  // ─── Market Master ─────────────────────────────────────────────────────────
  market: {
    products: {
      lemonade: 'Lemun tsami',
      fruit: 'Kofunan ’ya’yan itace',
      icePops: 'Kankara mai daɗi',
      sandwiches: 'Sandwich',
    },
    day: 'Rana {{n}} cikin {{total}}',
    costEach: 'Kaya ${{cost}} kowanne',
    fee: 'Kuɗin rumfa ${{fee}} a rana · ana zubar da kayan da ba a sayar ba',
    rival: 'Farashin rumfar abokin hamayya: ${{price}}',
    research: 'BINCIKEN KASUWA',
    researchRow: 'A ${{price}}: kusan abokan ciniki {{count}}',
    noResearch: 'Babu bincike yau: yi amfani da hasashe da abin da ka koya.',
    yesterday: 'Jiya: farashi ${{price}}, abokan ciniki {{wanted}} sun so saya',
    price: 'Farashinka',
    stock: 'Kayan da za a saya',
    preview: 'Idan ka sayar da duka: ${{revenue}} na ciniki, ${{profit}} riba',
    open: 'Buɗe rumfar',
    report: 'RAHOTON RANA NA {{n}}',
    line: {
      wanted: 'Abokan ciniki {{count}} sun so saya',
      sold: 'Ka sayar da {{count}}',
      wasted: 'An zubar da {{count}} ba a sayar ba',
      missed: 'Abokan ciniki {{count}} sun tafi hannu wofi',
      revenue: 'Ciniki',
      stock: 'Kayan da aka saya',
      fee: 'Kuɗin rumfa',
      profit: 'Riba',
      best: 'Mafi kyau yau: ${{price}} da kaya {{count}}, don ribar ${{profit}}',
    },
    days: {
      sunny: { title: 'Rana ta yau da kullum mai haske', body: 'Jama’a sun zo kasuwa kamar yadda aka saba yau.' },
      hot: { title: 'Zafi mai tsanani!', body: 'Ana zafi sosai: kowa yana son abin sanyi.' },
      cloudy: { title: 'Gajimare da sanyi', body: 'Gajimare da iska mai sanyi sun hana masu saye da yawa fitowa.' },
      rainy: {
        title: 'Ruwan sama duk rana',
        body: 'Ruwan sama mai ƙarfi: rabin masu saye na yau da kullum kawai suka fito.',
      },
      festival: { title: 'Ranar biki!', body: 'Bikin kiɗa ya cika tituna da jama’a.' },
      rival: {
        title: 'Rumfar abokin hamayya ta buɗe',
        body: 'Wata sabuwar rumfa a ƙetaren titi tana sayar da abu ɗaya.',
      },
      rivalSale: {
        title: 'Babban rangwamen abokin hamayya',
        body: 'Rumfar abokin hamayya ta rage farashinta sosai don jawo abokan ciniki.',
      },
      shortage: { title: 'Ƙarancin kaya', body: 'Girbi mara kyau: kayanka sun ƙara tsada da 60% yau.' },
      tourists: {
        title: 'Motar ’yan yawon buɗe ido ta iso',
        body: '’Yan yawon buɗe ido sun cika kasuwa. Ba su damu da farashi sosai ba.',
      },
      payday: { title: 'Ranar albashi', body: 'Masana’antar maƙwabta ta biya ma’aikatanta albashi yanzu.' },
      cold: { title: 'Sanyi mai tsanani', body: 'Ana sanyi ƙwarai: masu saye kaɗan ne, kuma suna neman araha.' },
      bulk: { title: 'Girbi mai yawa', body: 'Masu kawo kaya suna da yawa: kayanka sun yi arha da 25% yau.' },
    },
    ideas: {
      demand:
        'Dokar buƙata: idan farashi ya hau, mutane suna saye ƙasa; idan ya sauka, suna saye ƙari. Mafi kyawun farashi yana daidaita yawan abin da ka sayar da abin da kake samu a kan kowanne.',
      shiftRight:
        'Buƙata ta ƙaru: a kowane farashi, mutane da yawa suna son saya. Idan buƙata ta hau za ka iya sayar da ƙari kuma sau da yawa ka ƙara farashi kaɗan.',
      shiftLeft:
        'Buƙata ta ragu: a kowane farashi, mutane kaɗan ne ke son saya. Saya ƙananan kaya don kada ka ɓata su, kuma kada ka sa ran farashi mai tsada zai yi aiki.',
      peak: 'Ƙololuwar buƙata: a kwanaki masu cunkoso kasuwanci ke samun mafi yawan kuɗinsu. Tanadi isassun kaya: ƙarewar kaya yana nufin mayar da abokan ciniki masu biya.',
      competition:
        'Gasa: idan abokin hamayya yana sayar da abu ɗaya, abokan ciniki suna kwatanta farashi. Ka caji fiye da shi sosai kuma abokan ciniki za su tsallaka titi.',
      substitutes:
        'Madadin kaya: idan kaya makamancin naka ya yi arha, buƙatar naka tana raguwa. Za ka iya rage kaɗan, amma yaƙin farashi na iya share riba.',
      supplyShock:
        'Girgizar wadata: idan kuɗaɗe sun hau, kowane ciniki yana kawo ƙasa. Kasuwanci yawanci suna ƙara farashi kuma suna sayar da ɗan ƙasa.',
      inelastic:
        'Buƙata mara sassauci (inelastic): wasu abokan ciniki ba sa damuwa da farashi sosai. Idan masu saye ba su damu da farashi ba, farashi mafi tsada yana kawo ƙari.',
      income: 'Tasirin kuɗin shiga: idan mutane suna da ƙarin kuɗi, suna saye ƙari kuma ba sa damuwa da farashi sosai.',
      elastic:
        'Buƙata mai sassauci (elastic): abokan ciniki masu kula da farashi suna saye ƙasa sosai idan farashi ya hau. Riƙe farashi ƙasa a kwanaki irin wannan.',
      supplyGlut:
        'Ƙananan kuɗaɗe: idan kaya sun yi arha, kowane ciniki yana kawo ƙari, kuma farashi ɗan ƙasa na iya jawo ƙarin abokan ciniki.',
    },
  },

  // ─── Profit Quest ──────────────────────────────────────────────────────────
  profit: {
    products: {
      backpacks: 'jakunkunan baya',
      bikes: 'kekuna',
      phoneCases: 'murfin waya',
      shoes: 'takalman makaranta',
    },
    factory: 'Masana’antarka tana ƙera {{product}}',
    step: 'Ƙalubale {{n}} cikin {{total}}',
    calcTitle: 'LISSAFIN KASUWANCI',
    calc: {
      contribution:
        'Kana sayar da {{product}} a ${{price}} kowanne. Yin ɗaya yana kashe ${{unit}} na kayan aiki da aiki. Nawa kowane ciniki ke bayarwa ga kuɗaɗenka na dindindin?',
      breakeven:
        'Kowane cikin {{product}} ɗinka ana sayar da shi a ${{price}} kuma yana kashe ${{unit}} wajen yi. Kuɗaɗe na dindindin (haya, injuna, manajoji) ${{fixed}} ne a mako. Nawa dole ka sayar kowane mako don ka kai break-even?',
      profit:
        'Ka sayar da {{product}} {{units}} a ${{price}}. Kowanne yana kashe ${{unit}} wajen yi kuma kuɗaɗe na dindindin ${{fixed}} ne. Menene ribarka?',
      margin:
        'Ka sayar da {{product}} {{units}} a ${{price}}. Kowanne yana kashe ${{unit}} wajen yi kuma kuɗaɗe na dindindin ${{fixed}} ne. Menene gefen ribarka (riba a matsayin % na kuɗin shiga)?',
      priceForTarget:
        'Kana sa ran sayar da {{product}} {{units}}. Kowanne yana kashe ${{unit}} wajen yi kuma kuɗaɗe na dindindin ${{fixed}} ne. Wane farashi zai ba ka ribar ${{target}}?',
      machine:
        '{{product}} ɗinka ana sayar da su a ${{price}} kuma suna kashe ${{unit}} wajen yi; kuɗaɗe na dindindin ${{fixed}} ne. Sabon inji yana ƙara ${{extra}} ga kuɗaɗe na dindindin amma yana rage ${{saving}} a kan kowanne da aka yi. Menene sabon yawan break-even?',
    },
    formula: {
      contribution:
        'Gudunmawa a kowane ɗaya = farashi − kuɗi mai canzawa. Abin da kowane ciniki ke ƙarawa ne wajen biyan kuɗaɗe na dindindin, sannan zuwa riba.',
      breakeven:
        'Yawan break-even = kuɗaɗe na dindindin ÷ gudunmawa a kowane ɗaya (zagaye sama). Sayar da fiye da haka kuma za ka ci riba.',
      profit: 'Riba = adadi × (farashi − kuɗi mai canzawa) − kuɗaɗe na dindindin.',
      margin: 'Gefen riba = riba ÷ kuɗin shiga × 100. Yana nuna nawa kake riƙewa daga kowace dala ta ciniki.',
      priceForTarget: 'Farashi = kuɗi mai canzawa + (kuɗaɗe na dindindin + ribar da ake nema) ÷ adadi.',
      machine:
        'Sabon break-even = (kuɗaɗe na dindindin + ƙarin kuɗi na dindindin) ÷ (farashi − sabon kuɗi mai canzawa). Injuna suna ƙara kuɗaɗe na dindindin amma suna rage kuɗin kowane ɗaya.',
    },
    percent: '{{n}}%',
    right: 'Daidai ne! +{{points}}',
    wrong: 'Ba daidai ba: amsar ita ce {{answer}}.',
    week: 'MAKON MASANA’ANTA',
    numbers: 'Yin ɗaya ${{unit}} · kuɗaɗe na dindindin ${{fixed}} a mako · {{stock}} a ma’aji',
    research: 'BINCIKEN KASUWA',
    researchRow: 'A ${{price}}: abokan ciniki {{count}} a mako',
    researchAbout: 'A ${{price}}: kusan abokan ciniki {{count}} a mako',
    price: 'Farashi',
    make: 'Ƙera a wannan mako',
    breakEven: 'A wannan farashi za ka kai break-even bayan ciniki {{count}}',
    noBreakEven: 'A wannan farashi kana asara a kan kowane ciniki!',
    upgrades: 'ZUBA JARI A WANNAN MAKO?',
    upgrade: {
      none: { title: 'Babu zuba jari', body: 'Bar abubuwa yadda suke.' },
      machine: { title: 'Sabon inji', body: 'Kuɗaɗe na dindindin +25%, amma kowanne yana kashe 25% ƙasa wajen yi.' },
      ads: { title: 'Talla', body: 'Kuɗaɗe na dindindin +15%, da ƙarin abokan ciniki 20% a kowane farashi.' },
    },
    owned: 'An riga an saya',
    run: 'Gudanar da makon',
    report: 'RAHOTON MAKO',
    line: {
      demand: 'Abokan ciniki {{wanted}} sun so saya · ka sayar da {{sold}} · {{stock}} sun rage a ma’aji',
      revenue: 'Kuɗin shiga',
      cogs: 'Kuɗin kayan da aka sayar',
      fixed: 'Kuɗaɗe na dindindin',
      storage: 'Ajiyar kayan da ba a sayar ba',
      profit: 'Riba',
      best: 'Mafi kyawun farashi a wannan mako: ${{price}}, don ribar ${{profit}}',
      over: 'Ka ƙera fiye da abin da za ka iya sayarwa: ajiyar kayan da ba a sayar ba tana kashe kuɗi.',
      under: 'Kaya sun ƙare maka: ƙarin abokan ciniki sun so saya.',
    },
  },

  // ─── Market Simulator ──────────────────────────────────────────────────────
  invest: {
    practice: 'Kuɗin gwaji kawai · kamfanoni na ƙirƙira',
    quarter: 'Kwata {{n}} cikin {{total}}',
    portfolio: 'Jakar jarinka',
    indexCompare: 'Dukan kasuwa (index fund): ${{value}}',
    news: 'LABARAI',
    quizTitle: 'TAMBAYAR MAI ZUBA JARI',
    allocate: 'RABA ${{value}} ƊINKA',
    total: 'Jimla: {{pct}}%',
    totalHint: 'Zaɓuɓɓukanka dole su kai 100%.',
    limit: 'Kada ka wuce {{pct}}% a kowane kamfani ɗaya don raba haɗarinka.',
    feesNote: 'Kuɗin caji kowane kwata: index fund 0.05%, bonds 0.1%, hannayen jarin kowane kamfani 0.3%.',
    run: 'Kwata na gaba',
    report: 'SAKAMAKON KWATA NA {{n}}',
    yourReturn: 'Ribarka: {{pct}}',
    indexReturn: 'Dukan kasuwa: {{pct}}',
    fees: 'Kuɗin caji: {{pct}}',
    value: 'Jakar jari yanzu: ${{value}}',
    concentrated: 'Ka saka da yawa a kamfani ɗaya! Idan ya faɗi, duk jakar jarinka za ta faɗi tare da shi.',
    risk: {
      low: 'Ƙaramin haɗari',
      medium: 'Matsakaicin haɗari',
      high: 'Babban haɗari',
    },
    assets: {
      cash: { name: 'Ajiyar kuɗi', body: 'Lafiya, amma yana girma a hankali sosai' },
      bonds: { name: 'Asusun bonds', body: 'Bashi ga gwamnatoci da kamfanoni: riba kaɗan amma tabbatacciya' },
      index: { name: 'Index fund', body: 'Ɗan kaɗan na kowane kamfani: yana raba haɗarinka' },
      sunpower: { name: 'SunPower Energy', body: 'Solar da wutar lantarki' },
      greenleaf: { name: 'GreenLeaf Foods', body: 'Abinci da kayan masarufi' },
      roboworks: { name: 'RoboWorks', body: 'Robots da fasaha' },
      citybank: { name: 'City Bank', body: 'Banki da basussuka' },
      vitahealth: { name: 'VitaHealth', body: 'Magunguna da lafiya' },
      shopstream: { name: 'ShopStream', body: 'Shagunan intanet da na titi' },
    },
    newsItems: {
      heatwave: 'Zafi mai tsanani! Buƙatar wutar lantarki ta yi tashin gwauron zabi.',
      robotOrder: 'RoboWorks ta samu babban oda na robots na masana’anta.',
      harvest: 'Girbi mafi girma a tarihi ya rage kuɗaɗen kamfanonin abinci.',
      recall: 'RoboWorks ta janye dubban robots masu lahani.',
      shopping: 'Siyayyar bukukuwa ta karya tarihi.',
      medicine: 'An amince da sabon maganin VitaHealth.',
      rateRise: 'Babban banki ya ƙara kuɗin ruwa.',
      oilDrop: 'Farashin makamashi ya faɗi sosai.',
      recession: 'Tsoron koma bayan tattalin arziki: masu saye sun rage kashewa.',
      boom: 'Tattalin arziki yana girma fiye da yadda aka zata.',
      bankScandal: 'An ci City Bank tara saboda ɓoye asara.',
      hype: 'Kowa a intanet yana cewa RoboWorks za ta "tashi zuwa wata"!',
      rumour: 'Rubutu mara suna: "Za a sayi ShopStream!" (ba a tabbatar ba)',
      quietQuarter: 'Kwata mai natsuwa: babu babban labari.',
      crash: 'Kasuwa ta rushe! Farashi ya faɗi ko’ina.',
      rebound: 'Kasuwanni sun farfaɗo bayan rushewar.',
    },
    quiz: {
      share: {
        q: 'Me kake mallaka idan ka sayi hannun jari?',
        options: ['Bashi ga kamfanin', 'Ƙaramin ɓangare na kamfanin', 'Riba tabbatacciya', 'Aiki a kamfanin'],
        why: 'Hannun jari ƙaramin ɓangare ne na mallakar kamfani. Idan kamfanin ya yi kyau, darajar hannun jarinka na iya hawa kuma yana iya biyan dividends.',
      },
      diversify: {
        q: 'Me ake nufi da raba jari (diversify)?',
        options: [
          'Saya mafi kyawun kamfani kawai',
          'Riƙe duk kuɗinka a matsayin kuɗi a hannu',
          'Raba kuɗi a jari daban-daban masu yawa',
          'Sayar duk lokacin da farashi ya faɗi',
        ],
        why: 'Raba jari yana nufin kada ka saka duk ƙwayayenka a kwando ɗaya. Idan jari ɗaya ya faɗi, sauran za su iya riƙe jakar jarinka a tsaye.',
      },
      riskReturn: {
        q: 'Jarin da zai iya kawo ƙari yawanci…',
        options: ['Yana da ƙarin haɗari', 'Yana da cikakken tsaro', 'Ba ya taɓa asara', 'Na bankuna ne kawai'],
        why: 'Yiwuwar riba mai yawa yawanci tana zuwa da haɗari mai yawa: farashi na iya juyawa sosai sama da ƙasa.',
      },
      index: {
        q: 'Menene index fund?',
        options: [
          'Asusun ajiya',
          'Kamfanin fasaha guda ɗaya',
          'Bashin gwamnati',
          'Asusun da ke riƙe kamfanoni da yawa a kasuwa',
        ],
        why: 'Index fund yana sayen ɗan kaɗan na kowane kamfani a kasuwa, don ka samu matsakaicin ribar kasuwa da ƙananan kuɗin caji da ƙasan haɗari fiye da kamfani ɗaya.',
      },
      bond: {
        q: 'Idan ka sayi bond, kana…',
        options: [
          'Sayen ɓangare na kamfani',
          'Ba da rancen kuɗi da za a mayar da ruwa',
          'Sayen zinariya',
          'Biyan haraji',
        ],
        why: 'Bond bashi ne ga gwamnati ko kamfani. Suna biyan ka ruwa kuma suna mayar da kuɗinka daga baya, don haka bonds yawanci sun fi hannayen jari natsuwa.',
      },
      dividend: {
        q: 'Menene dividend?',
        options: [
          'Ɓangaren ribar kamfani da ake biyan masu hannun jari',
          'Kuɗin caji na sayen hannun jari',
          'Wani nau’in bashi',
          'Faɗuwar farashin hannun jari',
        ],
        why: 'Wasu kamfanoni suna raba wani ɓangare na ribarsu da masu su (masu hannun jari) a matsayin dividends.',
      },
      compound: {
        q: 'Me ya sa fara zuba jari da wuri yake taimakawa sosai?',
        options: [
          'Farashi koyaushe ya fi ƙasa',
          'Bankuna suna ba matasa kyauta',
          'Riba tana kawo ƙarin riba a tsawon lokaci (compounding)',
          'Ba ka biyan kuɗin caji',
        ],
        why: 'Da compounding, ribarka tana fara samun nata ribar. Yayin da kuɗinka ke daɗewa yana girma, haka yake ƙara sauri.',
      },
      emergencyFirst: {
        q: 'Me ya kamata ka samu yawanci kafin ka zuba jari?',
        options: ['Mota', 'Katin bashi', 'Shawarar hannun jari daga aboki', 'Asusun gaggawa'],
        why: 'Jari na iya faɗuwa a ɗan gajeren lokaci. Asusun gaggawa yana nufin ba za a tilasta ka sayar a lokaci mara kyau don biyan abin mamaki ba.',
      },
      pastPerformance: {
        q: 'Farashin hannun jarin wani kamfani ya ninka a bara. Wannan yana nufin…',
        options: [
          'Zai sake ninkawa',
          'Babu tabbas game da shekara mai zuwa',
          'Yanzu ba shi da haɗari',
          'Dole ka saya yanzu',
        ],
        why: 'Abin da ya faru a baya ba ya tabbatar da sakamako na gaba. Farashi ya dogara da abin da zai faru a gaba, ba abin da ya faru a baya ba.',
      },
      inflation: {
        q: 'Me ya sa riƙe duk kuɗinka a hannu zai iya rasa daraja a tsawon lokaci?',
        options: [
          'Hauhawar farashi tana sa farashi ya hau fiye da yadda kuɗi ke girma',
          'Bankuna suna ɗauka',
          'Kuɗi suna ƙarewa',
          'Hannayen jari suna maye gurbin kuɗi',
        ],
        why: 'Hauhawar farashi (inflation) tana nufin farashi yana hawa kowace shekara. Idan kuɗinka suna girma a hankali fiye da farashi, suna sayen ƙasa a tsawon lokaci.',
      },
      longTerm: {
        q: 'Wace hanya ce yawanci ta fi aiki ga masu zuba jari na yau da kullum?',
        options: [
          'Ciniki kowace rana',
          'Bin shawarwarin intanet',
          'Zuba jari akai-akai na dogon lokaci',
          'Saka komai a kamfani ɗaya',
        ],
        why: 'Zuba jari akai-akai na dogon lokaci a jakar jari da aka raba ya doke ƙoƙarin hasashen motsi na ɗan gajeren lokaci a tarihi.',
      },
      fees: {
        q: 'Me ya sa kuɗin cajin jari ke da muhimmanci?',
        options: [
          'Ba su da muhimmanci, ƙanana ne',
          'Suna ƙara riba',
          'Bankuna kawai ke biyan su',
          'Ana ɗauke su kowace shekara kuma suna rage ribarka',
        ],
        why: 'Ana cire kuɗin caji kowace shekara ko me ya faru. A cikin shekaru masu yawa, ko ƙananan kuɗin caji suna haifar da babban bambanci.',
      },
      hype: {
        q: 'Kowa a intanet yana cewa wani hannun jari zai "tashi zuwa wata". Menene hikima?',
        options: [
          'Saya gwargwadon iko',
          'Yi hankali: zuga sau da yawa ya riga ya shiga farashi',
          'Karɓi bashi don saye',
          'Faɗa wa kowa ya saya',
        ],
        why: 'Idan ana zuga wani abu ko’ina, farashinsa yawanci ya riga ya hau. Zuga sau da yawa yana ƙarewa da faɗuwa mai tsanani.',
      },
      bearMarket: {
        q: 'Menene bear market?',
        options: [
          'Dogon lokaci da farashi ke faɗuwa',
          'Kasuwar dabbobi',
          'Lokacin da farashi ke hawa da sauri',
          'Kasuwar da aka rufe',
        ],
        why: 'Bear market dogon faɗuwar farashi ne; bull market dogon hawan farashi ne. Duka biyun ɓangarori ne na yau da kullum na zuba jari.',
      },
      pricedIn: {
        q: 'Labari mai daɗi da kowa ya riga ya sani sau da yawa…',
        options: [
          'Riba ce tabbatacciya',
          'Haramun ne a yi amfani da shi',
          'Ya riga ya shiga farashi',
          'Kasuwa ba ta kula da shi',
        ],
        why: 'Kasuwanni suna amsawa da sauri. Idan labari ya yaɗu, masu saye yawanci sun riga sun tura farashi sama.',
      },
      rates: {
        q: 'Idan kuɗin ruwa ya hau, me ke faruwa sau da yawa?',
        options: [
          'Duk hannayen jari suna hawa',
          'Ajiyar kuɗi tana samun ƙasa',
          'Babu abin da ke canzawa',
          'Karɓar bashi yana ƙara tsada, kuma wasu hannayen jari suna faɗuwa',
        ],
        why: 'Ƙarin kuɗin ruwa yana sa bashi ya yi tsada, wanda zai iya rage saurin kamfanonin da ke dogaro da bashi, yayin da bankuna za su iya samun ƙari.',
      },
      panicSell: {
        q: 'Kasuwa ta faɗi da 12%. Me masu zuba jari masu haƙuri ke yi yawanci?',
        options: [
          'Sayar da komai lokaci ɗaya',
          'Natsu kuma su bi tsarinsu',
          'Karɓi bashi don sayen hannun jari ɗaya',
          'Daina ajiya har abada',
        ],
        why: 'Sayarwa cikin firgici yana tabbatar da asara. Kasuwanni sun farfaɗo a tsawon lokaci a tarihi, kuma masu zuba jari da suka jure sun samu lada.',
      },
      rebalance: {
        q: 'Me ake nufi da daidaita jakar jari (rebalancing)?',
        options: [
          'Mayar da ita zuwa haɗin jarin da ka tsara',
          'Sayar da komai',
          'Sayen ƙarin abin da ya fi hawa',
          'Canza banki',
        ],
        why: 'Yayin da farashi ke motsi, haɗin jarinka yana canzawa. Daidaitawa yana mayar da shi zuwa matakin haɗarin da ka tsara.',
      },
    },
  },
};

export default business;
