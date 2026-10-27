/** Knowzone World Business District (Swahili): walking around the square, its five places and the five business & finance games. */
import type { Translation } from '../../types';
import type en from '../en/business';

const business: Translation<typeof en> = {
  title: 'Mtaa wa Biashara',
  entryEyebrow: 'BIASHARA & FEDHA · MPYA',
  entryTitle: 'Mtaa wa Biashara',
  entryBody:
    'Endesha kampuni changa, mudu bajeti, panga bei ya kibanda sokoni, weka kiwanda kipate faida na wekeza pesa za mazoezi',
  leave: 'Ondoka Mtaa wa Biashara',
  offline: 'Mtaa wa Biashara unahitaji intaneti, kwa sababu kila uamuzi huchakatwa kwenye seva yetu.',
  result: {
    back: 'Rudi Mtaa wa Biashara',
  },
  hall: {
    walkTo: 'Tembea hadi {{station}}',
    you: 'Wewe, ukiwa umevaa koti la Knowzone',
    open: 'Ingia {{station}}',
    goHere: 'Nenda hapa',
    stars: 'Nyota {{count}} kati ya {{max}}',
    tip: 'Tembea hadi jengo ili uanze mchezo. Gusa jina ili utembee huko.',
  },
  stations: {
    startup: 'Makao ya Kampuni Changa',
    budget: 'Benki ya Bajeti',
    market: 'Uwanja wa Soko',
    factory: 'Kiwanda cha Faida',
    exchange: 'Soko la Hisa',
  },
  games: {
    'startup-tycoon': {
      name: 'Bilionea wa Kampuni Changa',
      how: 'Endesha kampuni yako mwezi baada ya mwezi: ajiri watengenezaji, wauzaji na wahudumu, tumia pesa kwenye matangazo na fanya maamuzi magumu ya uongozi. Kuza thamani yake bila kuishiwa na pesa taslimu.',
    },
    'budget-master': {
      name: 'Bingwa wa Bajeti',
      how: 'Panga mshahara wa mwezi: lipa bili, kula vizuri, weka akiba kwa lengo, jenga mfuko wa dharura na kabili mambo ya ghafla bila kuingia kwenye madeni.',
    },
    'market-master': {
      name: 'Bingwa wa Soko',
      how: 'Endesha kibanda sokoni: chagua bei yako na kiasi cha bidhaa cha kununua kila siku huku hali ya hewa, umati na mshindani vikibadilisha mahitaji.',
    },
    'profit-quest': {
      name: 'Safari ya Faida',
      how: 'Mudu hesabu za biashara (faida ghafi, kiwango cha kurudisha gharama, faida), kisha endesha kiwanda wiki baada ya wiki: weka bei, idadi ya kutengeneza na wakati wa kuwekeza.',
    },
    'market-simulator': {
      name: 'Kiigaji cha Soko',
      how: 'Wekeza pesa za mazoezi katika kampuni za kubuni, hati fungani na mfuko wa fahirisi. Habari husogeza soko: sambaza hatari yako na ujifunze jinsi uwekezaji unavyofanya kazi. Hakuna pesa halisi.',
    },
  },

  ui: {
    money: '${{amount}}',
    minus: '−${{amount}}',
    perMonth: '${{amount}}/mwezi',
    next: 'Endelea',
    finish: 'Tazama matokeo',
    best: 'Chaguo bora',
    good: 'Chaguo zuri',
    fair: 'Chaguo la wastani',
    poor: 'Chaguo baya',
    bestWas: 'Chaguo bora lilikuwa: {{choice}}',
    lesson: 'SOMO LA BIASHARA',
    left: 'Kilichobaki kupanga: ${{amount}}',
    over: 'Umezidi kwa ${{amount}}',
    points: '+{{points}} pointi',
    more: 'Zaidi',
    less: 'Pungua',
    pick: 'Chagua kwanza.',
    unbalanced: 'Panga kila dola: jumla lazima ilingane kabisa.',
    invalid: 'Mpango huo hauruhusiwi. Kagua namba.',
  },

  // ─── Startup Tycoon ────────────────────────────────────────────────────────
  startup: {
    companies: {
      bakery: 'Mkate na Mgahawa wa Macheo',
      repair: 'FixIt Matengenezo ya Simu',
      apps: 'Pixel Studio ya Programu',
      fashion: 'Thread Lebo ya Mitindo',
      solar: 'BrightSun Wafungaji wa Sola',
    },
    sale: {
      bakery: 'keki na kahawa',
      repair: 'matengenezo',
      apps: 'miradi ya programu',
      fashion: 'nguo',
      solar: 'ufungaji',
    },
    month: 'Mwezi {{n}} kati ya {{total}}',
    goal: 'Lengo: hisa yako iwe na thamani ya ${{goal}}',
    value: 'Thamani ya kampuni',
    cash: 'Pesa taslimu',
    morale: 'Ari',
    rep: 'Sifa',
    owned: 'Unamiliki {{pct}}%',
    decision: 'UAMUZI WA MWEZI HUU',
    team: 'TIMU YAKO',
    roles: {
      maker: 'Watengenezaji',
      seller: 'Wauzaji',
      support: 'Wahudumu',
    },
    roleHint: {
      maker: 'Kila mmoja hutengeneza takriban {{n}} {{sale}} kwa mwezi',
      seller: 'Kila mmoja huleta takriban wateja {{n}} zaidi kwa mwezi',
      support: 'Hushughulikia utawala na wateja; kila mmoja huhudumia wenzake 4',
    },
    salary: '${{amount}}/mwezi kila mmoja',
    hireCost: 'Gharama za kuajiri: ${{amount}} (kutafuta na kufunza)',
    payroll: 'Mishahara: ${{amount}}/mwezi',
    marketing: 'MATANGAZO MWEZI HUU',
    none: 'Hakuna',
    run: 'Endesha mwezi',
    report: 'RIPOTI YA MWEZI {{n}}',
    statement: {
      revenue: 'Mapato (mauzo)',
      cogs: 'Gharama ya mauzo',
      gross: 'Faida ghafi (kiwango cha {{pct}}%)',
      payroll: 'Mishahara',
      rent: 'Kodi ya pango',
      marketing: 'Matangazo',
      other: 'Gharama na mapato ya mara moja',
      loan: 'Marejesho ya mkopo',
      net: 'Faida halisi',
      cash: 'Pesa benki',
      runway: 'Kwa kasi hii, pesa zitadumu miezi {{count}} zaidi',
    },
    ops: {
      line: 'Wateja {{demand}} walitaka kununua · timu yako ingeweza kuhudumia {{capacity}} · uliuza {{sold}}',
      order: 'Pamoja na oda maalum ya {{count}}',
      turnedAway: 'Uliwarudisha wateja {{count}}. Watengenezaji zaidi wangeleta mapato zaidi.',
      idle: 'Watengenezaji wako walikuwa na muda wa ziada. Wauzaji au matangazo zaidi yangeleta wateja.',
      balanced: 'Uzalishaji wa timu yako ulilingana vizuri na mahitaji.',
      overload: 'Timu yako ni kubwa mno kwa wahudumu wake: kila mtu alipunguza kasi.',
      saturated: 'Soko lako linajaa: kila muuzaji wa ziada huleta wateja wapya wachache.',
    },
    bankrupt: 'Pesa zimeisha! Kampuni inaweza kupata faida kwenye karatasi na bado ikaanguka ikiishiwa na pesa.',
    dilemmas: {
      poach: {
        title: 'Mtengenezaji wako bora anaondoka?',
        body: 'Kampuni pinzani inampa mtengenezaji wako stadi zaidi kazi yenye mshahara mkubwa. Angependa kubaki, lakini anahitaji nyongeza.',
        options: {
          match: 'Mpe kila mtengenezaji nyongeza ya $120 kwa mwezi',
          letGo: 'Mtakie heri na umwache aende',
          threaten: 'Mwambie atajutia kuondoka',
        },
        lesson:
          'Kumbadilisha mfanyakazi mzuri kwa kawaida hugharimu zaidi sana kuliko kumbakiza: kutafuta, kufunza na uzalishaji unaopotea mtu mpya akijifunza. Malipo ya haki hubakiza watu wako bora na kudumisha ari.',
      },
      bigOrder: {
        title: 'Oda kubwa, kwa punguzo kubwa',
        body: 'Mteja mkubwa anataka oda kubwa mwezi huu, lakini kwa punguzo la 40% tu kutoka bei yako ya kawaida.',
        options: {
          negotiate: 'Jadiliana: oda ndogo kwa punguzo la 15%',
          accept: 'Kubali punguzo la 40%',
          decline: 'Kataa kwa adabu',
        },
        lesson:
          'Punguzo hutoka moja kwa moja kwenye faida yako. Kabla ya kukubali, hakikisha bei bado inalipia gharama ya kutengeneza kila kimoja, na kwamba una uwezo wa ziada. Majadiliano ni kawaida katika biashara.',
      },
      review: {
        title: 'Maoni ya hasira mtandaoni',
        body: 'Mteja anaandika kwamba huduma yako ilikuwa ya polepole na ya dharau. Watu wengine wanaisoma.',
        options: {
          fix: 'Omba radhi hadharani, rekebisha tatizo na umrudishie pesa',
          ignore: 'Ipuuze, itasahaulika',
          argue: 'Jibu kwamba mteja anadanganya',
        },
        lesson:
          'Sifa yako huwarudisha wateja na kuwafanya wakupendekeze. Jibu la wazi na la kweli kwa lalamiko mara nyingi hujenga imani zaidi kuliko kutokuwa na malalamiko kabisa.',
      },
      burnout: {
        title: 'Timu imechoka kabisa',
        body: 'Baada ya wiki za kazi ya ziada, wafanyakazi wako wamechoka na wanakosea.',
        options: {
          rest: 'Wape wote siku ya mapumziko yenye malipo na lete msaada wa muda',
          pizza: 'Inunulie timu piza',
          push: 'Omba kazi ya ziada zaidi mwezi huu',
        },
        lesson:
          'Watu waliochoka huzalisha kidogo na huacha kazi zaidi. Kusukuma zaidi huleta uzalishaji wa muda mfupi lakini hukugharimu baadaye kwa ari na wafanyakazi kuondoka. Meneja mzuri hulinda nguvu za timu yake.',
      },
      agency: {
        title: 'Ahadi ya matangazo "yatakayosambaa"',
        body: 'Wakala anaahidi kwamba kampeni ya $2,000 itakufanya maarufu usiku mmoja.',
        options: {
          test: 'Jaribu majaribio madogo ya $300 na upime matokeo',
          pay: 'Lipa $2,000 zote',
          skip: 'Achana nayo',
        },
        lesson:
          'Jaribu kabla ya kutumia pesa nyingi. Jaribio dogo linalopimwa huonyesha kama matangazo kweli huleta wateja, ili ukuze tu kinachofanya kazi. Ahadi kubwa si ushahidi.',
      },
      fancyOffice: {
        title: 'Ofisi mpya ya kifahari?',
        body: 'Unaweza kuhamia ofisi maridadi yenye chumba cha michezo. Kuhama kunagharimu $2,500 na kodi ni zaidi kwa 30%.',
        options: {
          stay: 'Baki, na utumie pesa kwa yale wateja wanayoyaona',
          move: 'Hamia, timu itaipenda',
        },
        lesson:
          'Gharama zisizobadilika kama kodi lazima zilipwe kila mwezi uuze au usiuze. Ziweke chini, hasa mwanzoni, ili biashara yako istahimili miezi ya mauzo madogo.',
      },
      sponsor: {
        title: 'Kudhamini siku ya michezo ya shule?',
        body: 'Shule ya karibu inakuomba udhamini siku yake ya michezo kwa $300. Jina lako litakuwa kwenye fulana.',
        options: {
          sponsor: 'Dhamini',
          decline: 'Kataa kwa adabu',
        },
        lesson:
          'Kusaidia jamii yako hujenga nia njema na huwafanya watu wa eneo lako waijue chapa yako. Ni aina ya matangazo inayofanya wema pia.',
      },
      supplier: {
        title: 'Msambazaji wako anapandisha bei',
        body: 'Malighafi unazonunua sasa zinagharimu 20% zaidi.',
        options: {
          shop: 'Linganisha wasambazaji wengine na ujadiliane',
          raise: 'Hamishia gharama kwa wateja: panda bei kwa 8%',
          cheap: 'Badili kwa malighafi rahisi sana zenye ubora wa chini',
        },
        lesson:
          'Gharama zikipanda, tafuta na ujadiliane kwanza. Kupunguza ubora hulinda faida yako kwa mwezi mmoja lakini huharibu sifa yako kwa muda mrefu zaidi.',
      },
      latePayer: {
        title: 'Mteja hajalipa',
        body: 'Mteja mkubwa bado anadaiwa $1,500 tangu siku 60 zilizopita, na pesa zinaanza kubana.',
        options: {
          remind: 'Tuma ukumbusho wa adabu na umpe punguzo dogo akilipa sasa',
          wait: 'Subiri na tumaini atalipa',
          threaten: 'Mtishie kwa mawakili',
        },
        lesson:
          'Faida si sawa na pesa taslimu. Pesa unazodai wateja (madeni ya wateja) haziwezi kulipa bili zako hadi zifike. Kufuatilia malipo kwa adabu na haraka huweka pesa zikitiririka.',
      },
      newLine: {
        title: 'Wazo la bidhaa mpya',
        body: 'Mtu katika timu ana wazo la aina mpya ya bidhaa.',
        options: {
          pilot: 'Fanya majaribio madogo na wateja wachache kwanza',
          bigLaunch: 'Izindue kwa kishindo na bidhaa na matangazo mengi',
          later: 'Si sasa',
        },
        lesson:
          'Ubunifu huifanya biashara ikue, lakini kuanza kidogo hukuwezesha kujifunza wateja wanataka nini hasa kabla ya kuhatarisha pesa nyingi. Hii huitwa majaribio au bidhaa ya awali inayofaa (MVP).',
      },
      training: {
        title: 'Kufunza timu?',
        body: 'Kozi ya $500 ingewafanya wafanyakazi wako wawe wepesi na stadi zaidi.',
        options: {
          train: 'Lipia kozi',
          free: 'Shiriki video za bure mtandaoni badala yake',
          skip: 'Achana na mafunzo',
        },
        lesson:
          'Mafunzo ni uwekezaji kwa watu: wafanyakazi stadi huzalisha zaidi na huhisi kuthaminiwa, na hilo hurudisha gharama katika miezi inayofuata.',
      },
      loan: {
        title: 'Mkopo wa benki',
        body: 'Benki inatoa $4,000, yanayolipwa $190 kwa mwezi (takriban riba ya 12% kwa mwaka).',
        options: {
          machine: 'Kopa ununue mashine inayozalisha 25% zaidi',
          party: 'Kopa kwa sherehe ya timu na samani mpya',
          no: 'Usikope',
        },
        lesson:
          'Deni zuri hulipia vitu vinavyoingiza zaidi ya riba, kama vifaa vinavyoongeza uzalishaji. Kukopa kwa vitu visivyoingiza pesa hukuachia marejesho tu.',
      },
      rent: {
        title: 'Mwenye nyumba anapandisha kodi',
        body: 'Mwenye nyumba wako anataka kodi zaidi kwa 25% kuanzia mwezi ujao.',
        options: {
          lease: 'Pendekeza mkataba mrefu zaidi kwa nyongeza ndogo',
          accept: 'Kubali nyongeza',
          moveFar: 'Hamia mahali rahisi mbali na wateja wako',
        },
        lesson:
          'Karibu kila kitu katika biashara kinaweza kujadiliwa. Kutoa kitu ambacho upande mwingine unakithamini (mkataba mrefu na wa kuaminika) kunaweza kukupa mpango bora. Mahali pia ni muhimu: kuhama mbali na wateja hupoteza mauzo.',
      },
      competitor: {
        title: 'Mshindani afungua karibu',
        body: 'Biashara mpya inafungua mtaani kwa bei za chini.',
        options: {
          quality: 'Shindana kwa ubora na huduma, na kadi ya uaminifu',
          priceWar: 'Punguza bei zako kwa 25% uwashinde',
          nothing: 'Usifanye chochote',
        },
        lesson:
          'Vita vya bei vinaweza kuharibu faida za biashara zote mbili. Mara nyingi ni busara zaidi kushindana kwa kile kinachokutofautisha: ubora, huduma na wateja waaminifu.',
      },
      safety: {
        title: 'Ukaguzi wa usalama',
        body: 'Mkaguzi anagundua tatizo la usalama mahali pako pa kazi.',
        options: {
          fixNow: 'Lirekebishe ipasavyo mara moja',
          later: 'Liziba kwa bei nafuu na urekebishe baadaye',
        },
        lesson:
          'Biashara lazima ziwaweke wafanyakazi na wateja salama. Kurekebisha matatizo mapema ni nafuu kuliko faini, ajali na sifa iliyoharibika.',
      },
      remote: {
        title: 'Kufanya kazi ukiwa nyumbani?',
        body: 'Wafanyakazi wako wanaomba kufanya kazi nyumbani baadhi ya siku.',
        options: {
          trial: 'Jaribu kwa mwezi mmoja na upime matokeo',
          refuse: 'Kataa',
          always: 'Ruhusu kwa wote, kila siku, bila ufuatiliaji',
        },
        lesson:
          'Unyumbufu unaweza kuongeza ari, lakini meneja mzuri hujaribu mabadiliko na kupima athari kwenye uzalishaji kabla ya kuamua kabisa.',
      },
      investor: {
        title: 'Mwekezaji anataka kuingia',
        body: 'Mwekezaji anatoa $10,000 kwa kubadilishana na 40% ya kampuni yako.',
        options: {
          counter: 'Toa ofa mbadala: $8,000 kwa 20%',
          accept: 'Kubali $10,000 kwa 40%',
          refuse: 'Kataa na ukue kwa pesa zako mwenyewe',
        },
        lesson:
          'Kuuza hisa (umiliki) huleta pesa bila deni, lakini unaachia sehemu ya kila faida ya baadaye na ya thamani ya kampuni. Hii huitwa kupunguzwa kwa umiliki. Jadiliana bei ya hisa zako.',
      },
      tax: {
        title: 'Bili ya kodi imefika',
        body: 'Unadaiwa $700 za kodi ya biashara mwezi huu.',
        options: {
          pay: 'Lipa kwa wakati',
          plan: 'Omba mpango rasmi wa malipo',
          ignore: 'Ipuuze kwa sasa',
        },
        lesson:
          'Kodi hulipia barabara, shule na hospitali, na kila biashara lazima ilipe. Kuchelewa kulipa huleta adhabu, hivyo biashara werevu huweka akiba ya kodi wanapopata mapato.',
      },
      bigClient: {
        title: 'Mteja mmoja mkubwa sana',
        body: 'Mteja mkubwa anajitolea kununua nusu ya kila unachotengeneza, lakini ukiwaacha wateja wako wengine.',
        options: {
          balance: 'Chukua mpango mdogo na uwabakize wateja wengine',
          allIn: 'Waache wengine wote na usaini',
          decline: 'Kataa',
        },
        lesson:
          'Kutegemea mteja mmoja ni hatari: akiondoka, sehemu kubwa ya biashara yako huondoka naye. Kusambaza mauzo kwa wateja wengi huifanya kampuni kuwa imara zaidi.',
      },
      ethics: {
        title: '"Zawadi" ya siri',
        body: 'Msambazaji anakupa zawadi ya siri ukiendelea kununua kwake kwa bei za juu.',
        options: {
          refuse: 'Kataa na uripoti',
          accept: 'Pokea zawadi',
        },
        lesson:
          'Zawadi hiyo ni rushwa. Inaigharimu kampuni yako pesa, mara nyingi ni kinyume cha sheria, na huharibu uaminifu. Biashara zenye maadili hudumu zaidi.',
      },
    },
  },

  // ─── Budget Master ─────────────────────────────────────────────────────────
  budget: {
    month: 'Mwezi {{n}} kati ya {{total}}',
    income: 'Mapato ya mwezi huu',
    bills: 'BILI (LAZIMA KULIPA)',
    afterBills: 'Kilichobaki baada ya bili',
    plan: 'MPANGO WAKO',
    billNames: {
      rent: 'Kodi ya nyumba',
      utilities: 'Umeme na maji',
      phone: 'Simu na data',
      transport: 'Usafiri',
      minimum: 'Malipo ya chini ya kadi',
      subscription: 'Usajili wa kutazama mtandaoni',
      bankFees: 'Ada za benki',
      carDeal: 'Malipo ya gari',
    },
    keys: {
      food: 'Chakula',
      fun: 'Burudani',
      clothes: 'Nguo',
      emergency: 'Mfuko wa dharura',
      goal: 'Lengo la akiba',
      debt: 'Malipo ya ziada ya kadi',
    },
    keyHint: {
      food: 'Unahitaji angalau ${{min}}',
      fun: 'Matembezi, michezo, vitu vitamu',
      clothes: 'Nguo na viatu vipya',
      emergency: '${{have}} zimewekwa · lengo ${{target}}',
      goal: '{{goal}}: ${{have}} kati ya ${{target}}',
      debt: 'Deni la kadi ${{have}} · riba {{rate}}% kwa mwezi',
    },
    goals: {
      laptop: 'Kompyuta mpakato mpya',
      bike: 'Baiskeli',
      course: 'Kozi ya kuandika msimbo',
      travel: 'Safari',
      deposit: 'Amana ya nyumba',
    },
    rule: 'Mahitaji {{needs}}% · Matakwa {{wants}}% · Akiba {{savings}}%',
    ruleHint: 'Mwongozo mzuri: mahitaji takriban 50%, matakwa hadi 30%, weka akiba angalau 20%.',
    restToGoal: 'Weka kilichobaki kwenye akiba',
    event: 'MWEZI HUU',
    costFrom: {
      fun: '−${{amount}} kutoka pesa za burudani',
      emergency: '−${{amount}} kutoka mfuko wa dharura',
      goal: '−${{amount}} kutoka akiba',
      card: '−${{amount}} kwenye kadi ya mkopo',
    },
    gain: '+${{amount}} kwenye akiba',
    newBill: '+${{amount}} kila mwezi',
    run: 'Ishi mwezi',
    report: 'RIPOTI YA MWEZI {{n}}',
    check: {
      food: 'Ulikula vizuri',
      noFood: 'Hakukuwa na pesa za kutosha kwa chakula',
      saved: 'Uliweka akiba {{pct}}% ya mapato',
      wants: 'Ulitumia {{pct}}% kwa matakwa',
      card: '${{amount}} zilienda kwenye kadi ya mkopo',
      interest: 'Riba ya kadi mwezi huu: ${{amount}}',
      debt: 'Deni la kadi sasa: ${{amount}}',
      emergency: 'Mfuko wa dharura: ${{amount}}',
      goal: 'Lengo la akiba: ${{amount}} kati ya ${{target}}',
    },
    events: {
      concert: {
        title: 'Mwaliko wa tamasha',
        body: 'Rafiki anakualika kwenye tamasha la muziki. Tiketi ni $80.',
        options: {
          funMoney: 'Nenda, ulipe kutoka pesa za burudani',
          freePlan: 'Pendekeza pikiniki ya bure badala yake',
          card: 'Nenda, na ulipe kwa kadi ya mkopo',
        },
        lesson:
          'Burudani ni sehemu ya bajeti yenye afya: ndiyo kazi ya pesa zako za burudani. Kulipia matakwa kwa mkopo kunamaanisha kulipa riba kwa matembezi ya usiku mmoja kwa miezi.',
      },
      phone: {
        title: 'Skrini ya simu imepasuka',
        body: 'Simu yako inaanguka. Kurekebisha skrini kunagharimu $150.',
        options: {
          emergency: 'Lipa kutoka mfuko wako wa dharura',
          card: 'Lipa kwa kadi ya mkopo',
          newPhone: 'Nunua simu mpya kabisa ya $700 kwa mkopo',
        },
        lesson:
          'Hii ndiyo hasa kazi ya mfuko wa dharura: mambo ya ghafla usiyoweza kuepuka. Kurekebisha kwa kawaida ni nafuu sana kuliko kununua mpya.',
      },
      sale: {
        title: '"Punguzo la 50%, leo tu!"',
        body: 'Duka lina punguzo la ghafla la viatu vya michezo usivyovihitaji kweli: $120.',
        options: { skip: 'Achana nayo', funMoney: 'Vinunue kwa pesa za burudani', card: 'Vinunue kwa kadi ya mkopo' },
        lesson:
          'Punguzo kwa kitu usichohitaji si akiba, ni matumizi. "Leo tu" imebuniwa kukuharakisha. Subiri siku moja kabla ya kununua matakwa.',
      },
      gift: {
        title: 'Siku ya kuzaliwa ya Mama',
        body: 'Ni siku ya kuzaliwa ya mama yako mwezi huu.',
        options: {
          funMoney: 'Zawadi ya $40 kutoka pesa za burudani',
          handmade: 'Kadi uliyotengeneza mwenyewe na kumpikia chakula cha jioni',
          card: 'Zawadi ghali ya $150 kwa kadi ya mkopo',
        },
        lesson: 'Kujali si lazima kuwe ghali. Zawadi ziwe kwenye matumizi yako yaliyopangwa, si kwenye kadi ya mkopo.',
      },
      bonus: {
        title: 'Bonasi ya $300!',
        body: 'Meneja wako anakupa bonasi ya $300 kwa kazi nzuri.',
        options: {
          save: 'Iweke akiba yote',
          split: 'Weka $240 akiba na ufurahie $60',
          spend: 'Itumie yote wikendi hii',
        },
        lesson:
          'Pesa za ziada ndizo rahisi zaidi kuweka akiba, kwa sababu ulikuwa tayari unaishi bila hizo. Kuweka akiba sehemu kubwa ya pesa za bahati na kufurahia kidogo ni tabia nzuri.',
      },
      scam: {
        title: '"Zidisha pesa zako mara mbili kwa wiki!"',
        body: 'Kikundi cha gumzo kinaahidi kuzidisha mara mbili pesa yoyote utakayowatumia ndani ya wiki moja.',
        options: { ignore: 'Kipuuze na uwaonye marafiki zako', invest: 'Watumie $200 za akiba yako' },
        lesson:
          'Hakuna anayeweza kuzidisha pesa mara mbili kwa usalama ndani ya wiki. Faida kubwa zinazohakikishwa ni dalili ya utapeli: pesa zako hupotea.',
      },
      bike: {
        title: 'Kurekebisha baiskeli',
        body: 'Baiskeli unayotumia kwenda kazini inahitaji matengenezo ya $220.',
        options: {
          emergency: 'Lipa kutoka mfuko wako wa dharura',
          card: 'Lipa kwa kadi ya mkopo',
          taxis: 'Acha kurekebisha na utumie teksi mwezi mzima ($380)',
        },
        lesson:
          'Kuahirisha matengenezo ya lazima mara nyingi hugharimu zaidi. Mfuko wa dharura hukuwezesha kutatua matatizo haraka bila kukopa.',
      },
      subscription: {
        title: 'Kipindi cha majaribio bure kinaisha',
        body: 'Majaribio yako ya bure ya kutazama yanaisha. Kuanzia sasa ni $15 kila mwezi.',
        options: { cancel: 'Sitisha', keep: 'Endelea nao' },
        lesson:
          'Usajili mdogo wa kila mwezi hujumlika: $15 kwa mwezi ni $180 kwa mwaka. Kagua usajili wako mara kwa mara na usitishe usioutumia.',
      },
      sideHustle: {
        title: 'Kufundisha wikendi',
        body: 'Jirani anakupa $150 umfundishe mtoto wake wikendi.',
        options: { takeSave: 'Kubali na uweke akiba unachopata', decline: 'Kataa na ubaki na wikendi zako' },
        lesson:
          'Kipato cha pembeni huharakisha malengo yako. Kuweka akiba kipato cha ziada, badala ya kukitumia, hukufikisha haraka zaidi.',
      },
      dentist: {
        title: 'Maumivu ya jino',
        body: 'Una maumivu ya jino. Daktari wa meno anagharimu $180.',
        options: {
          emergency: 'Nenda sasa, ulipe kutoka mfuko wa dharura',
          card: 'Nenda sasa, ulipe kwa kadi ya mkopo',
          wait: 'Subiri hadi liwe baya zaidi ($450 baadaye)',
        },
        lesson:
          'Kutunza afya yako mapema ni nafuu kuliko kutibu tatizo kubwa baadaye. Usiache kamwe huduma unayohitaji ili kuokoa pesa.',
      },
      loanApp: {
        title: 'Programu ya mkopo wa papo hapo',
        body: 'Programu inakupa $500 papo hapo. Utarudisha $650 ndani ya wiki mbili tu.',
        options: { decline: 'Kataa', take: 'Chukua' },
        lesson:
          'Kurudisha $650 kwa $500 ndani ya wiki mbili ni riba kubwa mno, mara nyingi zaidi ya kadi ya mkopo. Mikopo ya aina hii huwanasa watu kwenye madeni.',
      },
      foodPrices: {
        title: 'Bei za chakula zapanda',
        body: 'Bei madukani zinapanda 10% mwezi huu: chakula kinakugharimu $30 zaidi.',
        options: { cutWants: 'Tumia kidogo kwa matakwa mwezi huu', card: 'Weka ziada kwenye kadi ya mkopo' },
        lesson: 'Bei zikipanda (mfumuko wa bei), rekebisha bajeti kwa kupunguza matakwa, si kwa kukopa kwa mahitaji.',
      },
      bankFees: {
        title: 'Ada za benki',
        body: 'Benki yako inakutoza $12 kila mwezi kwa kuwa tu na akaunti.',
        options: { switch: 'Hamia akaunti ya bure', stay: 'Baki na benki hii' },
        lesson:
          'Ada hula pesa zako kimya kimya kila mwezi. Kulinganisha benki na kuhamia akaunti ya bure ni ushindi rahisi.',
      },
      friendLoan: {
        title: 'Rafiki anahitaji pesa',
        body: 'Rafiki anaomba kukopa $100 hadi mwezi ujao.',
        options: {
          afford: 'Mkopeshe $100 kutoka pesa za burudani, pesa unazoweza kuishi bila hizo',
          kindNo: 'Eleza kwa upole kwamba huwezi mwezi huu',
          savings: 'Mkopeshe kutoka mfuko wako wa dharura',
        },
        lesson:
          'Kopesha tu kile unachoweza kumudu kisirudi kamwe, na usikopeshe kamwe kutoka mfuko wa dharura. Kukataa kwa upole pia ni sawa.',
      },
      matching: {
        title: 'Pesa za bure kutoka kazini',
        body: 'Mwajiri wako anaongeza $1 kwenye akiba yako ya kustaafu kwa kila $1 unayoweka huko, hadi $100 kwa mwezi.',
        options: { join: 'Jiunge: weka $100 upate $100 za ziada', later: 'Labda baadaye' },
        lesson:
          'Mchango wa mwajiri unaolingana ni faida ya papo hapo ya 100% kwa pesa zako. Ni mojawapo ya mipango bora katika fedha binafsi: ichukue kila unapoweza.',
      },
      carDeal: {
        title: '"$250 tu kwa mwezi!"',
        body: 'Muuzaji anakupa gari linalong’aa kwa "$250 tu kwa mwezi" kwa miaka sita.',
        options: { decline: 'Kataa: huhitaji gari', sign: 'Saini mkataba' },
        lesson:
          'Angalia jumla, si bei ya kila mwezi: $250 × miezi 72 ni $18,000. Mpango mrefu wa malipo ni ahadi kubwa.',
      },
    },
  },

  // ─── Market Master ─────────────────────────────────────────────────────────
  market: {
    products: {
      lemonade: 'Juisi ya limau',
      fruit: 'Vikombe vya matunda',
      icePops: 'Barafu za kunyonya',
      sandwiches: 'Sandwichi',
    },
    day: 'Siku {{n}} kati ya {{total}}',
    costEach: 'Bidhaa zinagharimu ${{cost}} kila moja',
    fee: 'Ada ya kibanda ${{fee}} kwa siku · bidhaa zisizouzwa hutupwa',
    rival: 'Bei ya kibanda pinzani: ${{price}}',
    research: 'UTAFITI WA SOKO',
    researchRow: 'Kwa ${{price}}: takriban wateja {{count}}',
    noResearch: 'Hakuna utafiti leo: tumia utabiri na ulichojifunza.',
    yesterday: 'Jana: bei ${{price}}, wateja {{wanted}} walitaka kununua',
    price: 'Bei yako',
    stock: 'Bidhaa za kununua',
    preview: 'Ukiuza zote: ${{revenue}} za mauzo, ${{profit}} za faida',
    open: 'Fungua kibanda',
    report: 'RIPOTI YA SIKU {{n}}',
    line: {
      wanted: 'Wateja {{count}} walitaka kununua',
      sold: 'Uliuza {{count}}',
      wasted: '{{count}} zilitupwa bila kuuzwa',
      missed: 'Wateja {{count}} waliondoka mikono mitupu',
      revenue: 'Mauzo',
      stock: 'Bidhaa zilizonunuliwa',
      fee: 'Ada ya kibanda',
      profit: 'Faida',
      best: 'Bora leo: ${{price}} na {{count}} stoo, kwa faida ya ${{profit}}',
    },
    days: {
      sunny: { title: 'Siku ya kawaida yenye jua', body: 'Umati wa kawaida sokoni leo.' },
      hot: { title: 'Joto kali!', body: 'Kuna joto jingi: kila mtu anataka kitu baridi.' },
      cloudy: { title: 'Mawingu na baridi', body: 'Mawingu na upepo wa baridi vinawabakiza wanunuzi wengi nyumbani.' },
      rainy: { title: 'Mvua siku nzima', body: 'Mvua kubwa: nusu tu ya wanunuzi wa kawaida wanatoka.' },
      festival: { title: 'Siku ya tamasha!', body: 'Tamasha la muziki linajaza mitaa umati.' },
      rival: {
        title: 'Kibanda pinzani chafunguliwa',
        body: 'Kibanda kipya ng’ambo ya barabara kinauza kitu kilekile.',
      },
      rivalSale: { title: 'Punguzo kubwa la mshindani', body: 'Kibanda pinzani kinashusha bei sana kuvutia wateja.' },
      shortage: { title: 'Upungufu wa bidhaa', body: 'Mavuno duni: bidhaa zako zinagharimu 60% zaidi leo.' },
      tourists: { title: 'Basi la watalii lafika', body: 'Watalii wanajaza soko. Hawajali sana bei.' },
      payday: { title: 'Siku ya mshahara', body: 'Kiwanda jirani kimewalipa wafanyakazi wake sasa hivi.' },
      cold: { title: 'Baridi kali', body: 'Kuna baridi kali: wanunuzi wachache, na wanatafuta bei nafuu.' },
      bulk: { title: 'Mavuno mengi', body: 'Wasambazaji wana bidhaa nyingi mno: bidhaa zako ni nafuu kwa 25% leo.' },
    },
    ideas: {
      demand:
        'Kanuni ya mahitaji: bei ikipanda, watu hununua kidogo; ikishuka, hununua zaidi. Bei bora husawazisha idadi unayouza na kiasi unachopata kwa kila moja.',
      shiftRight:
        'Mahitaji yameongezeka: kwa kila bei, watu wengi zaidi wanataka kununua. Mahitaji yakipanda unaweza kuuza zaidi na mara nyingi kuongeza bei kidogo pia.',
      shiftLeft:
        'Mahitaji yameshuka: kwa kila bei, watu wachache wanataka kununua. Nunua bidhaa chache ili usipoteze, na usitarajie bei za juu kufanya kazi.',
      peak: 'Kilele cha mahitaji: siku zenye watu wengi biashara hupata pesa nyingi zaidi. Kuwa na bidhaa za kutosha: kuishiwa kunamaanisha kuwarudisha wateja wenye pesa.',
      competition:
        'Ushindani: mshindani akiuza kitu kilekile, wateja hulinganisha bei. Ukitoza zaidi sana kuliko yeye, wateja huvuka barabara.',
      substitutes:
        'Mbadala: bidhaa inayofanana ikishuka bei, mahitaji ya yako hupungua. Unaweza kumfuata kidogo, lakini vita vya bei vinaweza kufuta faida.',
      supplyShock:
        'Mshtuko wa ugavi: gharama zikipanda, kila mauzo huleta kidogo. Kwa kawaida biashara hupandisha bei na kuuza kidogo zaidi.',
      inelastic:
        'Mahitaji yasiyobadilika: baadhi ya wateja hawajali sana bei. Wanunuzi wasipojali sana bei, bei ya juu huleta zaidi.',
      income: 'Athari ya kipato: watu wakiwa na pesa zaidi, hununua zaidi na kujali bei kidogo.',
      elastic:
        'Mahitaji yanayobadilika: wateja wanaojali bei hununua kidogo sana bei zikipanda. Weka bei chini siku kama hizi.',
      supplyGlut:
        'Gharama za chini: bidhaa zikiwa nafuu, kila mauzo huleta zaidi, na bei ya chini kidogo inaweza kuvutia wateja zaidi.',
    },
  },

  // ─── Profit Quest ──────────────────────────────────────────────────────────
  profit: {
    products: {
      backpacks: 'mabegi ya mgongoni',
      bikes: 'baiskeli',
      phoneCases: 'makasha ya simu',
      shoes: 'viatu vya shule',
    },
    factory: 'Kiwanda chako kinatengeneza {{product}}',
    step: 'Changamoto {{n}} kati ya {{total}}',
    calcTitle: 'HESABU ZA BIASHARA',
    calc: {
      contribution:
        'Unauza {{product}} kwa ${{price}} kila kimoja. Kutengeneza kimoja kunagharimu ${{unit}} kwa malighafi na kazi. Kila mauzo yanachangia kiasi gani kulipia gharama zako zisizobadilika?',
      breakeven:
        'Kila moja ya {{product}} zako huuzwa kwa ${{price}} na hugharimu ${{unit}} kutengeneza. Gharama zisizobadilika (kodi, mashine, mameneja) ni ${{fixed}} kwa wiki. Lazima uuze ngapi kila wiki ili kurudisha gharama?',
      profit:
        'Unauza {{product}} {{units}} kwa ${{price}}. Kila kimoja hugharimu ${{unit}} kutengeneza na gharama zisizobadilika ni ${{fixed}}. Faida yako ni kiasi gani?',
      margin:
        'Unauza {{product}} {{units}} kwa ${{price}}. Kila kimoja hugharimu ${{unit}} kutengeneza na gharama zisizobadilika ni ${{fixed}}. Kiwango chako cha faida (faida kama % ya mapato) ni kipi?',
      priceForTarget:
        'Unatarajia kuuza {{product}} {{units}}. Kila kimoja hugharimu ${{unit}} kutengeneza na gharama zisizobadilika ni ${{fixed}}. Bei gani itakupa faida ya ${{target}}?',
      machine:
        '{{product}} zako huuzwa kwa ${{price}} na hugharimu ${{unit}} kutengeneza; gharama zisizobadilika ni ${{fixed}}. Mashine mpya inaongeza ${{extra}} kwenye gharama zisizobadilika lakini inaokoa ${{saving}} kwa kila kimoja. Idadi mpya ya kurudisha gharama ni ipi?',
    },
    formula: {
      contribution:
        'Mchango kwa kila kipande = bei − gharama inayobadilika. Ndicho kila mauzo huongeza kulipia gharama zisizobadilika, kisha kwa faida.',
      breakeven:
        'Idadi ya kurudisha gharama = gharama zisizobadilika ÷ mchango kwa kila kipande (kadiria juu). Uza zaidi ya hapo upate faida.',
      profit: 'Faida = vipande × (bei − gharama inayobadilika) − gharama zisizobadilika.',
      margin: 'Kiwango cha faida = faida ÷ mapato × 100. Kinaonyesha unabaki na kiasi gani cha kila dola ya mauzo.',
      priceForTarget: 'Bei = gharama inayobadilika + (gharama zisizobadilika + faida lengwa) ÷ vipande.',
      machine:
        'Kurudisha gharama mpya = (gharama zisizobadilika + gharama ya ziada isiyobadilika) ÷ (bei − gharama mpya inayobadilika). Mashine huongeza gharama zisizobadilika lakini hupunguza gharama ya kila kipande.',
    },
    percent: '{{n}}%',
    right: 'Sahihi! +{{points}}',
    wrong: 'Si hasa: jibu ni {{answer}}.',
    week: 'WIKI YA KIWANDA',
    numbers: 'Kutengeneza kimoja ${{unit}} · gharama zisizobadilika ${{fixed}} kwa wiki · {{stock}} ghalani',
    research: 'UTAFITI WA SOKO',
    researchRow: 'Kwa ${{price}}: wateja {{count}} kwa wiki',
    researchAbout: 'Kwa ${{price}}: takriban wateja {{count}} kwa wiki',
    price: 'Bei',
    make: 'Tengeneza wiki hii',
    breakEven: 'Kwa bei hii unarudisha gharama baada ya mauzo {{count}}',
    noBreakEven: 'Kwa bei hii unapoteza pesa kwa kila mauzo!',
    upgrades: 'UWEKEZE WIKI HII?',
    upgrade: {
      none: { title: 'Hakuna uwekezaji', body: 'Acha mambo yalivyo.' },
      machine: {
        title: 'Mashine mpya',
        body: 'Gharama zisizobadilika +25%, lakini kila kimoja ni nafuu kwa 25% kutengeneza.',
      },
      ads: { title: 'Matangazo', body: 'Gharama zisizobadilika +15%, na wateja 20% zaidi kwa kila bei.' },
    },
    owned: 'Tayari imenunuliwa',
    run: 'Endesha wiki',
    report: 'RIPOTI YA WIKI',
    line: {
      demand: 'Wateja {{wanted}} walitaka kununua · uliuza {{sold}} · {{stock}} zimebaki ghalani',
      revenue: 'Mapato',
      cogs: 'Gharama ya vipande vilivyouzwa',
      fixed: 'Gharama zisizobadilika',
      storage: 'Kuhifadhi bidhaa zisizouzwa',
      profit: 'Faida',
      best: 'Bei bora wiki hii: ${{price}}, kwa faida ya ${{profit}}',
      over: 'Ulitengeneza zaidi ya ulivyoweza kuuza: kuhifadhi bidhaa zisizouzwa kunagharimu pesa.',
      under: 'Ziliisha: wateja zaidi walitaka kununua.',
    },
  },

  // ─── Market Simulator ──────────────────────────────────────────────────────
  invest: {
    practice: 'Pesa za mazoezi tu · kampuni za kubuni',
    quarter: 'Robo {{n}} kati ya {{total}}',
    portfolio: 'Jalada lako la uwekezaji',
    indexCompare: 'Soko zima (mfuko wa fahirisi): ${{value}}',
    news: 'HABARI',
    quizTitle: 'SWALI LA MWEKEZAJI',
    allocate: 'SAMBAZA ${{value}} ZAKO',
    total: 'Jumla: {{pct}}%',
    totalHint: 'Machaguo yako lazima yafikie jumla ya 100%.',
    limit: 'Weka kila kampuni moja kwa {{pct}}% au chini ili kusambaza hatari yako.',
    feesNote: 'Ada kila robo: mfuko wa fahirisi 0.05%, hati fungani 0.1%, hisa za kila kampuni 0.3%.',
    run: 'Robo inayofuata',
    report: 'MATOKEO YA ROBO {{n}}',
    yourReturn: 'Faida yako: {{pct}}',
    indexReturn: 'Soko zima: {{pct}}',
    fees: 'Ada: {{pct}}',
    value: 'Jalada sasa: ${{value}}',
    concentrated: 'Pesa nyingi mno kwenye kampuni moja! Ikishuka, jalada lako lote hushuka nayo.',
    risk: {
      low: 'Hatari ndogo',
      medium: 'Hatari ya wastani',
      high: 'Hatari kubwa',
    },
    assets: {
      cash: { name: 'Akiba ya pesa taslimu', body: 'Salama, lakini hukua polepole sana' },
      bonds: { name: 'Mfuko wa hati fungani', body: 'Mikopo kwa serikali na kampuni: faida ndogo na thabiti' },
      index: { name: 'Mfuko wa fahirisi', body: 'Kidogo cha kila kampuni: husambaza hatari yako' },
      sunpower: { name: 'SunPower Energy', body: 'Sola na umeme' },
      greenleaf: { name: 'GreenLeaf Foods', body: 'Chakula na mahitaji ya nyumbani' },
      roboworks: { name: 'RoboWorks', body: 'Roboti na teknolojia' },
      citybank: { name: 'City Bank', body: 'Huduma za benki na mikopo' },
      vitahealth: { name: 'VitaHealth', body: 'Dawa na afya' },
      shopstream: { name: 'ShopStream', body: 'Maduka ya mtandaoni na ya mitaani' },
    },
    newsItems: {
      heatwave: 'Joto kali! Mahitaji ya umeme yapaa.',
      robotOrder: 'RoboWorks yashinda oda kubwa ya roboti za viwandani.',
      harvest: 'Mavuno ya rekodi yapunguza gharama za kampuni za chakula.',
      recall: 'RoboWorks yarudisha maelfu ya roboti zenye kasoro.',
      shopping: 'Manunuzi ya sikukuu yavunja rekodi.',
      medicine: 'Dawa mpya ya VitaHealth yaidhinishwa.',
      rateRise: 'Benki kuu yapandisha viwango vya riba.',
      oilDrop: 'Bei za nishati zashuka sana.',
      recession: 'Hofu ya mdororo: wanunuzi wapunguza matumizi.',
      boom: 'Uchumi wakua haraka kuliko ilivyotarajiwa.',
      bankScandal: 'City Bank yatozwa faini kwa kuficha hasara.',
      hype: 'Kila mtu mtandaoni anasema RoboWorks "itapaa hadi mwezini"!',
      rumour: 'Chapisho la mtu asiyejulikana: "ShopStream itanunuliwa!" (haijathibitishwa)',
      quietQuarter: 'Robo tulivu: hakuna habari kubwa.',
      crash: 'Soko laporomoka! Bei zashuka kila mahali.',
      rebound: 'Masoko yarejea baada ya kuporomoka.',
    },
    quiz: {
      share: {
        q: 'Unamiliki nini unaponunua hisa?',
        options: ['Mkopo kwa kampuni', 'Sehemu ndogo ya kampuni', 'Faida iliyohakikishwa', 'Kazi katika kampuni'],
        why: 'Hisa ni kipande kidogo cha umiliki wa kampuni. Kampuni ikifanya vizuri, thamani ya hisa yako inaweza kupanda na inaweza kulipa gawio.',
      },
      diversify: {
        q: 'Kusambaza uwekezaji kunamaanisha nini?',
        options: [
          'Kununua kampuni bora pekee',
          'Kuweka pesa zako zote taslimu',
          'Kusambaza pesa katika uwekezaji mwingi tofauti',
          'Kuuza kila bei zinaposhuka',
        ],
        why: 'Kusambaza kunamaanisha kutoweka mayai yako yote kwenye kikapu kimoja. Uwekezaji mmoja ukishuka, mingine inaweza kuliweka jalada lako imara.',
      },
      riskReturn: {
        q: 'Uwekezaji unaoweza kuleta zaidi kwa kawaida…',
        options: ['Una hatari kubwa zaidi', 'Ni salama kabisa', 'Haupotezi pesa kamwe', 'Ni kwa benki tu'],
        why: 'Faida kubwa zinazowezekana kwa kawaida huja na hatari kubwa: bei inaweza kuyumba sana pande zote mbili.',
      },
      index: {
        q: 'Mfuko wa fahirisi ni nini?',
        options: [
          'Akaunti ya akiba',
          'Kampuni moja ya teknolojia',
          'Mkopo wa serikali',
          'Mfuko unaomiliki kampuni nyingi sokoni',
        ],
        why: 'Mfuko wa fahirisi hununua kidogo cha kila kampuni sokoni, hivyo unapata faida ya wastani ya soko kwa ada ndogo na hatari ndogo kuliko kampuni moja moja.',
      },
      bond: {
        q: 'Unaponunua hati fungani, wewe…',
        options: [
          'Unanunua sehemu ya kampuni',
          'Unakopesha pesa zinazorudishwa na riba',
          'Unanunua dhahabu',
          'Unalipa kodi',
        ],
        why: 'Hati fungani ni mkopo kwa serikali au kampuni. Wanakulipa riba na kukurudishia pesa zako baadaye, hivyo hati fungani kwa kawaida ni thabiti kuliko hisa.',
      },
      dividend: {
        q: 'Gawio ni nini?',
        options: [
          'Sehemu ya faida ya kampuni inayolipwa kwa wenye hisa',
          'Ada ya kununua hisa',
          'Aina ya mkopo',
          'Kushuka kwa bei ya hisa',
        ],
        why: 'Baadhi ya kampuni hugawana sehemu ya faida zao na wamiliki wao (wenye hisa) kama gawio.',
      },
      compound: {
        q: 'Kwa nini kuanza kuwekeza mapema husaidia sana?',
        options: [
          'Bei huwa chini kila wakati',
          'Benki huwapa vijana bonasi',
          'Faida huzaa faida zaidi kwa muda (riba mchanganyiko)',
          'Hulipi ada yoyote',
        ],
        why: 'Kwa riba mchanganyiko, faida zako huanza kuzaa faida zao wenyewe. Kadiri pesa zako zinavyokua kwa muda mrefu, ndivyo zinavyokua haraka.',
      },
      emergencyFirst: {
        q: 'Unapaswa kuwa na nini kwa kawaida kabla ya kuwekeza?',
        options: ['Gari', 'Kadi ya mkopo', 'Kidokezo cha hisa kutoka kwa rafiki', 'Mfuko wa dharura'],
        why: 'Uwekezaji unaweza kushuka kwa muda mfupi. Mfuko wa dharura unamaanisha hutalazimika kuuza wakati mbaya kulipia jambo la ghafla.',
      },
      pastPerformance: {
        q: 'Bei ya hisa ya kampuni iliongezeka mara mbili mwaka jana. Hii inamaanisha…',
        options: [
          'Itaongezeka mara mbili tena',
          'Hakuna uhakika wowote kuhusu mwaka ujao',
          'Sasa haina hatari',
          'Lazima uinunue sasa',
        ],
        why: 'Utendaji wa zamani hauhakikishi matokeo ya baadaye. Bei hutegemea kitakachotokea, si kilichotokea awali.',
      },
      inflation: {
        q: 'Kwa nini kuweka pesa zako zote taslimu kunaweza kupoteza thamani kwa muda?',
        options: [
          'Mfumuko wa bei hupandisha bei haraka kuliko pesa taslimu zinavyokua',
          'Benki huzichukua',
          'Pesa taslimu huisha muda',
          'Hisa huchukua nafasi ya pesa taslimu',
        ],
        why: 'Mfumuko wa bei unamaanisha bei hupanda kila mwaka. Pesa zako zikikua polepole kuliko bei, zitanunua kidogo kwa muda.',
      },
      longTerm: {
        q: 'Mbinu ipi kwa kawaida hufanya kazi vizuri zaidi kwa wawekezaji wa kawaida?',
        options: [
          'Kufanya biashara kila siku',
          'Kufuata vidokezo vya mtandaoni',
          'Kuwekeza mara kwa mara kwa muda mrefu',
          'Kuweka kila kitu kwenye kampuni moja',
        ],
        why: 'Kuwekeza mara kwa mara kwa muda mrefu katika jalada lililosambazwa kumeshinda kihistoria kujaribu kubashiri mienendo ya muda mfupi.',
      },
      fees: {
        q: 'Kwa nini ada za uwekezaji ni muhimu?',
        options: [
          'Si muhimu, ni ndogo sana',
          'Huongeza faida',
          'Benki pekee ndizo hulipa',
          'Hukatwa kila mwaka na hupunguza faida yako',
        ],
        why: 'Ada hukatwa kila mwaka liwalo liwe. Kwa miaka mingi, hata ada ndogo hujumlika kuwa tofauti kubwa.',
      },
      hype: {
        q: 'Kila mtu mtandaoni anasema hisa "itapaa hadi mwezini". Busara ni ipi?',
        options: [
          'Nunua kadiri uwezavyo',
          'Kuwa makini: mvumo mara nyingi tayari umo kwenye bei',
          'Kopa pesa uinunue',
          'Mwambie kila mtu ainunue',
        ],
        why: 'Kitu kinapovumishwa kila mahali, bei yake kwa kawaida tayari imepanda. Mvumo mara nyingi huishia kwa kushuka kwa kasi.',
      },
      bearMarket: {
        q: 'Soko la dubu (bear market) ni nini?',
        options: [
          'Kipindi kirefu bei zinaposhuka',
          'Soko la wanyama',
          'Wakati bei zinapopanda haraka',
          'Soko lililofungwa',
        ],
        why: 'Soko la dubu ni kushuka kwa muda mrefu kwa bei; soko la fahali ni kupanda kwa muda mrefu. Yote ni sehemu ya kawaida ya uwekezaji.',
      },
      pricedIn: {
        q: 'Habari njema ambayo kila mtu tayari anaijua mara nyingi…',
        options: [
          'Ni faida iliyohakikishwa',
          'Ni kinyume cha sheria kuitumia',
          'Tayari imo kwenye bei',
          'Hupuuzwa na soko',
        ],
        why: 'Masoko huitikia haraka. Habari ikijulikana sana, wanunuzi kwa kawaida tayari wamepandisha bei.',
      },
      rates: {
        q: 'Viwango vya riba vikipanda, nini hutokea mara nyingi?',
        options: [
          'Hisa zote hupanda',
          'Akiba ya pesa taslimu huleta kidogo',
          'Hakuna kinachobadilika',
          'Kukopa kunagharimu zaidi, na baadhi ya hisa hushuka',
        ],
        why: 'Riba za juu hufanya kukopa kuwe ghali, jambo linaloweza kupunguza kasi ya kampuni zinazotegemea mikopo, huku benki zikiweza kupata zaidi.',
      },
      panicSell: {
        q: 'Soko linaporomoka 12%. Wawekezaji wavumilivu kwa kawaida hufanya nini?',
        options: [
          'Huuza kila kitu mara moja',
          'Hutulia na kushikilia mpango wao',
          'Hukopa kununua hisa moja',
          'Huacha kuweka akiba milele',
        ],
        why: 'Kuuza kwa hofu hufunga hasara. Kihistoria masoko yamerejea kwa muda, na wawekezaji waliovumilia walituzwa.',
      },
      rebalance: {
        q: 'Kusawazisha upya jalada kunamaanisha nini?',
        options: [
          'Kulirudisha kwenye mchanganyiko wa uwekezaji uliopanga',
          'Kuuza kila kitu',
          'Kununua zaidi ya kilichopanda zaidi',
          'Kubadilisha benki',
        ],
        why: 'Bei zinaposogea, mchanganyiko wako hubadilika. Kusawazisha upya huurudisha kwenye kiwango cha hatari ulichopanga.',
      },
    },
  },
};

export default business;
