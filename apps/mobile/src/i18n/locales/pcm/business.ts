/** Knowzone World Business District (Nigerian Pidgin): walking around the square, its five places and the five business & finance games. */
import type { Translation } from '../../types';
import type en from '../en/business';

const business: Translation<typeof en> = {
  title: 'Business District',
  entryEyebrow: 'BUSINESS & FINANCE · NEW',
  entryTitle: 'Business District',
  entryBody: 'Run startup, control budget, price market stall, make factory dey gain and invest practice money',
  leave: 'Comot from the Business District',
  offline: 'Business District need internet, because na our server dey run every decision.',
  result: {
    back: 'Go back to the Business District',
  },
  hall: {
    walkTo: 'Waka go the {{station}}',
    you: 'Na you be dis, inside your Knowzone blazer',
    open: 'Enter the {{station}}',
    goHere: 'Go here',
    stars: '{{count}} out of {{max}} stars',
    tip: 'Waka go any building to start game. Tap any name to waka go there.',
  },
  stations: {
    startup: 'Startup HQ',
    budget: 'Budget Bank',
    market: 'Market Square',
    factory: 'Profit Factory',
    exchange: 'Stock Exchange',
  },
  games: {
    'startup-tycoon': {
      name: 'Startup Tycoon',
      how: 'Run your own company month by month: hire makers, sellers and support staff, spend for marketing and handle hard management decision. Grow the value without say cash finish.',
    },
    'budget-master': {
      name: 'Budget Master',
      how: 'Plan your monthly salary: pay bills, chop well, save for goal, build emergency fund and handle surprise without entering debt.',
    },
    'market-master': {
      name: 'Market Master',
      how: 'Run market stall: choose your price and how much market to buy every day as weather, crowd and rival dey change demand.',
    },
    'profit-quest': {
      name: 'Profit Quest',
      how: 'Sabi the maths of business (margin, break-even, profit), then run factory week by week: set price, how many to make and when to invest.',
    },
    'market-simulator': {
      name: 'Market Simulator',
      how: 'Invest practice money for made-up companies, bonds and index fund. News dey move the market: spread your risk and learn how investing dey work. No be real money.',
    },
  },

  ui: {
    money: '${{amount}}',
    minus: '−${{amount}}',
    perMonth: '${{amount}}/month',
    next: 'Next',
    finish: 'See results',
    best: 'Best choice',
    good: 'Good choice',
    fair: 'E manage',
    poor: 'Bad choice',
    bestWas: 'The best choice na: {{choice}}',
    lesson: 'BUSINESS LESSON',
    left: 'Wetin remain to plan: ${{amount}}',
    over: 'E pass by ${{amount}}',
    points: '+{{points}} points',
    more: 'More',
    less: 'Less',
    pick: 'Choose one option first.',
    unbalanced: 'Plan every dollar: the total must match exactly.',
    invalid: 'Dat plan no allowed. Check the numbers.',
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
      bakery: 'cake and coffee',
      repair: 'repairs',
      apps: 'app projects',
      fashion: 'clothes',
      solar: 'installations',
    },
    month: 'Month {{n}} out of {{total}}',
    goal: 'Goal: make your share worth ${{goal}}',
    value: 'Company value',
    cash: 'Cash',
    morale: 'Morale',
    rep: 'Reputation',
    owned: 'You own {{pct}}%',
    decision: 'DIS MONTH DECISION',
    team: 'YOUR TEAM',
    roles: {
      maker: 'Makers',
      seller: 'Sellers',
      support: 'Support',
    },
    roleHint: {
      maker: 'Each one dey make about {{n}} {{sale}} every month',
      seller: 'Each one dey bring about {{n}} more customers every month',
      support: 'Dey handle admin and customers; each one dey take care of 4 workers',
    },
    salary: '${{amount}}/month for each person',
    hireCost: 'Hiring cost: ${{amount}} (recruiting and training)',
    payroll: 'Salary total: ${{amount}}/month',
    marketing: 'MARKETING DIS MONTH',
    none: 'None',
    run: 'Run the month',
    report: 'MONTH {{n}} REPORT',
    statement: {
      revenue: 'Revenue (sales)',
      cogs: 'Cost of sales',
      gross: 'Gross profit ({{pct}}% margin)',
      payroll: 'Salaries',
      rent: 'Rent',
      marketing: 'Marketing',
      other: 'One-time cost and income',
      loan: 'Loan repayment',
      net: 'Net profit',
      cash: 'Cash for bank',
      runway: 'If e continue like dis, cash go last {{count}} more months',
    },
    ops: {
      line: '{{demand}} customers wan buy · your team fit serve {{capacity}} · you sell {{sold}}',
      order: 'Plus special order of {{count}}',
      turnedAway: 'You turn {{count}} customers back. More makers for don bring more money.',
      idle: 'Your makers get free time. More sellers or marketing go bring customers.',
      balanced: 'Wetin your team produce match demand well well.',
      overload: 'Your team too big for the support staff: everybody slow down.',
      saturated: 'Your market don dey full: every extra seller dey bring fewer new customers.',
    },
    bankrupt: 'Cash don finish! Company fit dey make profit for paper and still fail if money finish.',
    dilemmas: {
      poach: {
        title: 'Your best maker wan comot?',
        body: 'Another company wan give your best maker job wey pay more. E prefer to stay, but e need increase.',
        options: {
          match: 'Give every maker $120/month increase',
          letGo: 'Wish am well make e go',
          threaten: 'Tell am say e go regret am',
        },
        lesson:
          'To replace good worker dey cost pass to keep am: recruiting, training and work wey you lose while the new person dey learn. Fair pay dey keep your best people and keep morale high.',
      },
      bigOrder: {
        title: 'Big order, but with big discount',
        body: 'One big customer want big order dis month, but only if you remove 40% from your normal price.',
        options: {
          negotiate: 'Negotiate: smaller order with 15% discount',
          accept: 'Accept the 40% discount',
          decline: 'Politely say no',
        },
        lesson:
          'Discount dey comot straight from your profit margin. Before you talk yes, check say the price still cover wetin e cost to make each one, and say you get space to produce am. Negotiation normal for business.',
      },
      review: {
        title: 'Angry review for online',
        body: 'One customer post say your service slow and rude. Other people dey read am.',
        options: {
          fix: 'Apologise for public, fix the problem and refund am',
          ignore: 'Ignore am, people go forget',
          argue: 'Reply say the customer dey lie',
        },
        lesson:
          'Your reputation dey bring customers back and make dem recommend you. To answer complaint for public with honesty fit win more trust pass to no get complaint at all.',
      },
      burnout: {
        title: 'The team don tire',
        body: 'After many weeks of overtime, your staff don tire and dem dey make mistake.',
        options: {
          rest: 'Give everybody one paid day off and bring temporary help',
          pizza: 'Buy pizza for the team',
          push: 'Ask for even more overtime dis month',
        },
        lesson:
          'People wey don tire dey produce less and dey quit more. To push dem hard go give small output for short time but e go cost you later for morale and staff wey dey leave. Good manager dey protect the team energy.',
      },
      agency: {
        title: 'Marketing wey go "go viral"',
        body: 'One agency promise say $2,000 campaign go make you famous overnight.',
        options: {
          test: 'Try small $300 test and measure the result',
          pay: 'Pay the full $2,000',
          skip: 'Leave am',
        },
        lesson:
          'Test before you spend big. Small trial wey you measure go show if marketing really dey bring customers, so you go only grow wetin dey work. Big promise no be evidence.',
      },
      fancyOffice: {
        title: 'New fancy office?',
        body: 'You fit move go fine office wey get games room. To move go cost $2,500 and rent go increase by 30%.',
        options: {
          stay: 'Stay, and spend money for wetin customers dey notice',
          move: 'Move enter, the team go like am',
        },
        lesson:
          'Fixed cost like rent, you must pay am every month whether you sell or not. Keep am low, especially for beginning, so your business fit survive slow months.',
      },
      sponsor: {
        title: 'Sponsor school sports day?',
        body: 'One school for area ask you to sponsor their sports day for $300. Your name go dey for the T-shirts.',
        options: {
          sponsor: 'Sponsor am',
          decline: 'Politely say no',
        },
        lesson:
          'To support your community dey build goodwill and make people for area know your brand. E be marketing wey still dey do good.',
      },
      supplier: {
        title: 'Your supplier increase price',
        body: 'The materials wey you dey buy now cost 20% more.',
        options: {
          shop: 'Compare other suppliers and negotiate',
          raise: 'Pass the cost to customers: increase your price by 8%',
          cheap: 'Change to very cheap, low-quality materials',
        },
        lesson:
          'When cost go up, check other places and negotiate first. To reduce quality go protect your margin for one month but e go spoil your reputation for long time.',
      },
      latePayer: {
        title: 'One customer never pay',
        body: 'One big customer still owe you $1,500 from 60 days ago, and cash don dey tight.',
        options: {
          remind: 'Send polite reminder and offer small discount if e pay now',
          wait: 'Wait and hope say e go pay',
          threaten: 'Threaten am with lawyer',
        },
        lesson:
          'Profit no be the same thing as cash. Money wey customers owe you (receivables) no fit pay your bills until e enter. To follow up payment politely and fast dey keep cash dey flow.',
      },
      newLine: {
        title: 'New product idea',
        body: 'One person for the team get idea for new product line.',
        options: {
          pilot: 'Do small pilot with few customers first',
          bigLaunch: 'Launch am big with plenty stock and adverts',
          later: 'No be now',
        },
        lesson:
          'New ideas dey keep business growing, but to start small dey help you learn wetin customers really want before you risk plenty money. Dem dey call am pilot or minimum viable product.',
      },
      training: {
        title: 'Train the team?',
        body: '$500 course go make your staff faster and more skilled.',
        options: {
          train: 'Pay for the course',
          free: 'Share free online videos instead',
          skip: 'No do training',
        },
        lesson:
          'Training na investment for people: skilled staff dey produce more and dem dey feel valued, and e go pay back the cost for the next months.',
      },
      loan: {
        title: 'Bank loan',
        body: 'Bank offer $4,000, wey you go pay back $190 every month (about 12% interest every year).',
        options: {
          machine: 'Borrow am buy machine wey dey produce 25% more',
          party: 'Borrow am for team party and new furniture',
          no: 'No borrow',
        },
        lesson:
          'Good debt dey pay for things wey go bring more money pass the interest, like equipment wey dey increase output. To borrow for things wey no dey bring money go just leave you with repayment.',
      },
      rent: {
        title: 'Landlord increase rent',
        body: 'Your landlord want 25% more rent from next month.',
        options: {
          lease: 'Offer to sign longer lease for smaller increase',
          accept: 'Accept the increase',
          moveFar: 'Move go cheaper place wey far from your customers',
        },
        lesson:
          'Almost everything for business, you fit negotiate am. If you offer something wey the other side value (long, reliable lease), you fit get better deal. Location matter too: if you move far from customers, you go lose sales.',
      },
      competitor: {
        title: 'Competitor open near you',
        body: 'New business open for your street with lower price.',
        options: {
          quality: 'Compete with quality and service, plus loyalty card',
          priceWar: 'Cut your price by 25% to beat dem',
          nothing: 'No do anything',
        },
        lesson:
          'Price war fit destroy the profit of both businesses. E dey smarter to compete with wetin make you different: quality, service and loyal customers.',
      },
      safety: {
        title: 'Safety inspection',
        body: 'Inspector find safety problem for your workplace.',
        options: {
          fixNow: 'Fix am well well immediately',
          later: 'Patch am cheap and fix am later',
        },
        lesson:
          'Business must keep workers and customers safe. To fix problem early cheap pass fines, accidents and spoiled reputation.',
      },
      remote: {
        title: 'Work from house?',
        body: 'Your staff ask to dey work from house some days.',
        options: {
          trial: 'Try am for one month and measure the result',
          refuse: 'Refuse',
          always: 'Allow am for everybody, every day, without any check',
        },
        lesson:
          'Flexibility fit raise morale, but good manager dey test changes and measure how e affect output before e decide for good.',
      },
      investor: {
        title: 'Investor wan join',
        body: 'One investor offer $10,000 for 40% of your company.',
        options: {
          counter: 'Counter-offer: $8,000 for 20%',
          accept: 'Accept $10,000 for 40%',
          refuse: 'Refuse and grow with your own money',
        },
        lesson:
          'To sell shares (equity) dey bring cash without debt, but you go give out part of every future profit and part of the company value. Dem dey call am dilution. Negotiate the price of your shares.',
      },
      tax: {
        title: 'Tax bill don reach',
        body: 'You owe $700 business tax dis month.',
        options: {
          pay: 'Pay am on time',
          plan: 'Ask for official payment plan',
          ignore: 'Ignore am for now',
        },
        lesson:
          'Tax dey pay for roads, schools and hospitals, and every business must pay am. Late payment dey bring penalty, so smart businesses dey save for tax as dem dey earn.',
      },
      bigClient: {
        title: 'One very big customer',
        body: 'One big client wan buy half of everything wey you dey make, but only if you drop your other customers.',
        options: {
          balance: 'Take smaller deal and keep your other customers',
          allIn: 'Drop everybody else and sign',
          decline: 'Say no',
        },
        lesson:
          'To depend on one customer get risk: if e leave, most of your business go follow am go. To spread sales across many customers dey make company strong.',
      },
      ethics: {
        title: 'Secret "gift"',
        body: 'One supplier offer you secret personal gift if you continue to buy from am at higher price.',
        options: {
          refuse: 'Refuse and report am',
          accept: 'Collect the gift',
        },
        lesson:
          'Dat gift na bribe. E dey cost your company money, e fit be illegal, and e dey destroy trust. Business wey get good character dey last long.',
      },
    },
  },

  // ─── Budget Master ─────────────────────────────────────────────────────────
  budget: {
    month: 'Month {{n}} out of {{total}}',
    income: 'Income dis month',
    bills: 'BILLS (YOU MUST PAY)',
    afterBills: 'Wetin remain after bills',
    plan: 'YOUR PLAN',
    billNames: {
      rent: 'Rent',
      utilities: 'Light and water',
      phone: 'Phone and data',
      transport: 'Transport',
      minimum: 'Card minimum payment',
      subscription: 'Streaming subscription',
      bankFees: 'Bank charges',
      carDeal: 'Car payment',
    },
    keys: {
      food: 'Food',
      fun: 'Enjoyment',
      clothes: 'Clothes',
      emergency: 'Emergency fund',
      goal: 'Savings goal',
      debt: 'Extra card payment',
    },
    keyHint: {
      food: 'You need at least ${{min}}',
      fun: 'Outing, games, small treat',
      clothes: 'New clothes and shoes',
      emergency: '${{have}} saved · target ${{target}}',
      goal: '{{goal}}: ${{have}} out of ${{target}}',
      debt: 'Card debt ${{have}} · {{rate}}% interest every month',
    },
    goals: {
      laptop: 'New laptop',
      bike: 'Bicycle',
      course: 'Coding course',
      travel: 'Trip',
      deposit: 'House rent deposit',
    },
    rule: 'Needs {{needs}}% · Wants {{wants}}% · Savings {{savings}}%',
    ruleHint: 'Good guide: needs about 50%, wants reach 30%, save at least 20%.',
    restToGoal: 'Put the rest for savings',
    event: 'DIS MONTH',
    costFrom: {
      fun: '−${{amount}} from enjoyment money',
      emergency: '−${{amount}} from emergency fund',
      goal: '−${{amount}} from savings',
      card: '−${{amount}} for credit card',
    },
    gain: '+${{amount}} enter savings',
    newBill: '+${{amount}} every month',
    run: 'Live the month',
    report: 'MONTH {{n}} REPORT',
    check: {
      food: 'You chop well',
      noFood: 'Money no reach for food',
      saved: 'You save {{pct}}% of income',
      wants: 'You spend {{pct}}% for wants',
      card: '${{amount}} go for credit card',
      interest: 'Card interest dis month: ${{amount}}',
      debt: 'Card debt now: ${{amount}}',
      emergency: 'Emergency fund: ${{amount}}',
      goal: 'Savings goal: ${{amount}} out of ${{target}}',
    },
    events: {
      concert: {
        title: 'Concert invitation',
        body: 'Your friend invite you go concert. Ticket na $80.',
        options: {
          funMoney: 'Go, pay from your enjoyment money',
          freePlan: 'Suggest free picnic instead',
          card: 'Go, and put am for credit card',
        },
        lesson:
          'Enjoyment na part of healthy budget: na wetin your enjoyment money dey for. To pay for wants with credit mean say you go dey pay interest for one night outing for months.',
      },
      phone: {
        title: 'Phone screen don crack',
        body: 'Your phone fall. To repair the screen na $150.',
        options: {
          emergency: 'Pay from your emergency fund',
          card: 'Put am for credit card',
          newPhone: 'Buy brand-new $700 phone with credit',
        },
        lesson:
          'Na exactly wetin emergency fund dey for: surprise wey you no fit avoid. To repair dey usually cheap pass to buy new one.',
      },
      sale: {
        title: '"50% off, only today!"',
        body: 'One shop get flash sale for canvas wey you no really need: $120.',
        options: { skip: 'Leave am', funMoney: 'Buy am with enjoyment money', card: 'Buy am with credit card' },
        lesson:
          'Discount for something wey you no need no be saving, na spending. "Only today" dey there to rush you. Wait one day before you buy wants.',
      },
      gift: {
        title: 'Mama birthday',
        body: 'Your mama birthday dey dis month.',
        options: {
          funMoney: '$40 gift from your enjoyment money',
          handmade: 'Card wey you make with hand and cook dinner for am',
          card: 'Expensive $150 gift with credit card',
        },
        lesson:
          'To show love no mean say e must cost plenty. Gift suppose dey your planned spending, no be for credit card.',
      },
      bonus: {
        title: '$300 bonus!',
        body: 'Your manager give you $300 bonus because you work well.',
        options: { save: 'Save all of am', split: 'Save $240 and enjoy $60', spend: 'Spend everything dis weekend' },
        lesson:
          'Extra money na the easiest money to save, because you don dey live without am before. To save most of money wey just land and enjoy small na better habit.',
      },
      scam: {
        title: '"Double your money in one week!"',
        body: 'One group chat promise to double any money wey you send dem in one week.',
        options: { ignore: 'Ignore am and warn your friends', invest: 'Send dem $200 from your savings' },
        lesson:
          'Nobody fit double money safely in one week. Guaranteed high return na sign of scam: your money go disappear.',
      },
      bike: {
        title: 'Bicycle repair',
        body: 'The bicycle wey you dey use go work need $220 repair.',
        options: {
          emergency: 'Pay from your emergency fund',
          card: 'Put am for credit card',
          taxis: 'No repair am, take taxi the whole month ($380)',
        },
        lesson:
          'To dey postpone repair wey you need dey cost more. Your emergency fund dey make you fix problem fast without borrowing.',
      },
      subscription: {
        title: 'Free trial don end',
        body: 'Your free streaming trial don end. From now e go cost $15 every month.',
        options: { cancel: 'Cancel am', keep: 'Keep am' },
        lesson:
          'Small monthly subscriptions dey add up: $15 every month na $180 every year. Check your subscriptions regularly and cancel the ones wey you no dey use.',
      },
      sideHustle: {
        title: 'Weekend lesson teaching',
        body: 'Your neighbour wan pay you $150 to teach their pikin for weekends.',
        options: { takeSave: 'Take am and save wetin you earn', decline: 'Say no and keep your weekends' },
        lesson:
          'Side hustle dey make you reach your goals fast. To save the extra income instead of to spend am go carry you reach there quick quick.',
      },
      dentist: {
        title: 'Toothache',
        body: 'Your tooth dey pain you. Dentist go cost $180.',
        options: {
          emergency: 'Go now, pay from your emergency fund',
          card: 'Go now, pay with credit card',
          wait: 'Wait until e worse ($450 later)',
        },
        lesson:
          'To take care of your health early cheap pass to treat bigger problem later. No ever skip care wey you need just to save money.',
      },
      loanApp: {
        title: 'Instant loan app',
        body: 'One app wan give you $500 sharp sharp. You go pay back $650 in just two weeks.',
        options: { decline: 'Say no', take: 'Take am' },
        lesson:
          'To pay back $650 for $500 in two weeks na very big interest, many times pass credit card. Dis kind quick loan dey trap people for debt.',
      },
      foodPrices: {
        title: 'Food price don go up',
        body: 'Price for shops increase by 10% dis month: food go cost you $30 more.',
        options: { cutWants: 'Spend less for wants dis month', card: 'Put the extra for credit card' },
        lesson: 'When price dey go up (inflation), adjust your budget by reducing wants, no borrow for needs.',
      },
      bankFees: {
        title: 'Bank charges',
        body: 'Your bank dey charge you $12 every month just because you get account.',
        options: { switch: 'Change to free account', stay: 'Stay with dis bank' },
        lesson:
          'Charges dey quietly chop your money every month. To compare banks and change to free account na easy win.',
      },
      friendLoan: {
        title: 'Your friend need money',
        body: 'Your friend wan borrow $100 until next month.',
        options: {
          afford: 'Lend am $100 from enjoyment money, money wey you fit do without',
          kindNo: 'Explain gently say you no fit dis month',
          savings: 'Lend am from your emergency fund',
        },
        lesson:
          'Only lend wetin you fit afford make e no come back, and no ever lend from your emergency fund. To say no with kindness still dey okay.',
      },
      matching: {
        title: 'Free money from work',
        body: 'Your employer go add $1 to your retirement savings for every $1 wey you save there, reach $100 every month.',
        options: { join: 'Join: save $100 and collect extra $100', later: 'Maybe later' },
        lesson:
          'Employer match na instant 100% return for your money. E be one of the best deals for personal finance: always take am if you fit.',
      },
      carDeal: {
        title: '"Only $250 every month!"',
        body: 'One dealer offer you shiny car for "only $250 every month" for six years.',
        options: { decline: 'Say no: you no need car', sign: 'Sign the deal' },
        lesson:
          'Look the total, no be the monthly price: $250 × 72 months na $18,000. Long payment plan na big commitment.',
      },
    },
  },

  // ─── Market Master ─────────────────────────────────────────────────────────
  market: {
    products: {
      lemonade: 'Lemonade',
      fruit: 'Fruit cups',
      icePops: 'Ice pops',
      sandwiches: 'Sandwiches',
    },
    day: 'Day {{n}} out of {{total}}',
    costEach: 'Each stock cost ${{cost}}',
    fee: 'Stall fee ${{fee}} every day · stock wey no sell go waste',
    rival: 'Rival stall price: ${{price}}',
    research: 'MARKET RESEARCH',
    researchRow: 'For ${{price}}: about {{count}} customers',
    noResearch: 'No research today: use the forecast and wetin you don learn.',
    yesterday: 'Yesterday: price na ${{price}}, {{wanted}} customers wan buy',
    price: 'Your price',
    stock: 'Stock to buy',
    preview: 'If you sell everything: ${{revenue}} sales, ${{profit}} profit',
    open: 'Open the stall',
    report: 'DAY {{n}} REPORT',
    line: {
      wanted: '{{count}} customers wan buy',
      sold: 'You sell {{count}}',
      wasted: '{{count}} waste because dem no sell',
      missed: '{{count}} customers go back empty hand',
      revenue: 'Sales',
      stock: 'Stock wey you buy',
      fee: 'Stall fee',
      profit: 'Profit',
      best: 'Best today: ${{price}} with {{count}} stock, for ${{profit}} profit',
    },
    days: {
      sunny: { title: 'Normal sunny day', body: 'Normal crowd for market today.' },
      hot: { title: 'Heatwave!', body: 'Sun dey burn well well: everybody want something cold.' },
      cloudy: { title: 'Cloudy and cool', body: 'Cloud and cold breeze keep many buyers for house.' },
      rainy: { title: 'Rain all day', body: 'Heavy rain: only half of the normal buyers comot.' },
      festival: { title: 'Festival day!', body: 'Music festival full the streets with crowd.' },
      rival: { title: 'Rival stall open', body: 'New stall for the other side of road dey sell the same thing.' },
      rivalSale: { title: 'Rival big sale', body: 'The rival stall cut their price well well to win customers.' },
      shortage: { title: 'Supply shortage', body: 'Bad harvest: your supplies cost 60% more today.' },
      tourists: { title: 'Tourist bus don land', body: 'Tourists full the market. Price no too matter to dem.' },
      payday: { title: 'Salary day', body: 'The factory wey dey near just pay their workers.' },
      cold: { title: 'Cold weather', body: 'E cold die: fewer buyers, and dem dey find cheap price.' },
      bulk: { title: 'Plenty harvest', body: 'Suppliers get too much: your stock cheap by 25% today.' },
    },
    ideas: {
      demand:
        'Law of demand: when price go up, people dey buy less; when e come down, dem dey buy more. The best price balance how many you sell with how much you gain for each one.',
      shiftRight:
        'Demand don increase: for every price, more people wan buy. When demand rise you fit sell more and you fit even charge small more.',
      shiftLeft:
        'Demand don fall: for every price, fewer people wan buy. Buy less stock so e no go waste, and no expect high price to work.',
      peak: 'Peak demand: for busy days, businesses dey make most of their money. Get enough stock ready: if e finish, you go dey turn back customers wey get money.',
      competition:
        'Competition: when rival dey sell the same thing, customers dey compare price. If you charge pass dem too much, customers go cross road go their side.',
      substitutes:
        'Substitutes: when similar product cheap pass, demand for your own go fall. You fit match dem small, but price war fit wipe your profit.',
      supplyShock:
        'Supply shock: when cost go up, each sale dey bring less. Businesses dey usually raise price and sell small less.',
      inelastic:
        'Inelastic demand: some customers no too send price. When buyers no too care about price, higher price dey bring more money.',
      income: 'Income effect: when people get more money, dem dey buy more and dem no too dey look price.',
      elastic:
        'Elastic demand: customers wey dey look price go buy much less when price go up. Keep price low for days like dis.',
      supplyGlut:
        'Lower cost: when supplies cheap, each sale dey bring more, and price wey low small fit win extra customers.',
    },
  },

  // ─── Profit Quest ──────────────────────────────────────────────────────────
  profit: {
    products: {
      backpacks: 'backpacks',
      bikes: 'bicycles',
      phoneCases: 'phone cases',
      shoes: 'school shoes',
    },
    factory: 'Your factory dey make {{product}}',
    step: 'Challenge {{n}} out of {{total}}',
    calcTitle: 'BUSINESS MATHS',
    calc: {
      contribution:
        'You dey sell {{product}} for ${{price}} each. To make one cost ${{unit}} for materials and labour. How much each sale dey contribute to pay your fixed costs?',
      breakeven:
        'Each of your {{product}} dey sell for ${{price}} and e cost ${{unit}} to make. Fixed costs (rent, machines, managers) na ${{fixed}} every week. How many you must sell every week to break even?',
      profit:
        'You sell {{units}} {{product}} for ${{price}}. Each one cost ${{unit}} to make and fixed costs na ${{fixed}}. Wetin be your profit?',
      margin:
        'You sell {{units}} {{product}} for ${{price}}. Each one cost ${{unit}} to make and fixed costs na ${{fixed}}. Wetin be your profit margin (profit as % of revenue)?',
      priceForTarget:
        'You expect to sell {{units}} {{product}}. Each one cost ${{unit}} to make and fixed costs na ${{fixed}}. Which price go give you ${{target}} profit?',
      machine:
        'Your {{product}} dey sell for ${{price}} and e cost ${{unit}} to make; fixed costs na ${{fixed}}. New machine go add ${{extra}} to fixed costs but e go save ${{saving}} for each one wey you make. Wetin be the new break-even quantity?',
    },
    formula: {
      contribution:
        'Contribution per unit = price − variable cost. Na wetin each sale dey add to pay fixed costs, then for profit.',
      breakeven:
        'Break-even quantity = fixed costs ÷ contribution per unit (round am up). Sell pass dis one and you go make profit.',
      profit: 'Profit = units × (price − variable cost) − fixed costs.',
      margin: 'Profit margin = profit ÷ revenue × 100. E dey show how much from every dollar of sales you dey keep.',
      priceForTarget: 'Price = variable cost + (fixed costs + target profit) ÷ units.',
      machine:
        'New break-even = (fixed costs + extra fixed cost) ÷ (price − new variable cost). Machines dey raise fixed costs but dem dey reduce the cost of each unit.',
    },
    percent: '{{n}}%',
    right: 'Correct! +{{points}}',
    wrong: 'E no reach: the answer na {{answer}}.',
    week: 'FACTORY WEEK',
    numbers: 'To make one cost ${{unit}} · fixed costs ${{fixed}} every week · {{stock}} dey warehouse',
    research: 'MARKET RESEARCH',
    researchRow: 'For ${{price}}: {{count}} customers every week',
    researchAbout: 'For ${{price}}: about {{count}} customers every week',
    price: 'Price',
    make: 'Make dis week',
    breakEven: 'For dis price you go break even after {{count}} sales',
    noBreakEven: 'For dis price you dey lose money for every sale!',
    upgrades: 'INVEST DIS WEEK?',
    upgrade: {
      none: { title: 'No investment', body: 'Leave things as dem be.' },
      machine: { title: 'New machine', body: 'Fixed costs +25%, but to make each one go cost 25% less.' },
      ads: { title: 'Advertising', body: 'Fixed costs +15%, and 20% more customers for every price.' },
    },
    owned: 'You don buy am',
    run: 'Run the week',
    report: 'WEEK REPORT',
    line: {
      demand: '{{wanted}} customers wan buy · you sell {{sold}} · {{stock}} remain for warehouse',
      revenue: 'Revenue',
      cogs: 'Cost of the units wey you sell',
      fixed: 'Fixed costs',
      storage: 'Storage for stock wey no sell',
      profit: 'Profit',
      best: 'Best price dis week: ${{price}}, for ${{profit}} profit',
      over: 'You make pass wetin you fit sell: to store stock wey no sell dey cost money.',
      under: 'E finish: more customers still wan buy.',
    },
  },

  // ─── Market Simulator ──────────────────────────────────────────────────────
  invest: {
    practice: 'Na practice money only · made-up companies',
    quarter: 'Quarter {{n}} out of {{total}}',
    portfolio: 'Your portfolio',
    indexCompare: 'The whole market (index fund): ${{value}}',
    news: 'NEWS',
    quizTitle: 'INVESTOR QUESTION',
    allocate: 'SPREAD YOUR ${{value}}',
    total: 'Total: {{pct}}%',
    totalHint: 'Your choices must add up to 100%.',
    limit: 'No put pass {{pct}}% for any one company, so you go spread your risk.',
    feesNote: 'Fees every quarter: index fund 0.05%, bonds 0.1%, each company shares 0.3%.',
    run: 'Next quarter',
    report: 'QUARTER {{n}} RESULTS',
    yourReturn: 'Your return: {{pct}}',
    indexReturn: 'Whole market: {{pct}}',
    fees: 'Fees: {{pct}}',
    value: 'Portfolio now: ${{value}}',
    concentrated: 'Too much money for one company! If e fall, your whole portfolio go fall with am.',
    risk: {
      low: 'Low risk',
      medium: 'Medium risk',
      high: 'High risk',
    },
    assets: {
      cash: { name: 'Cash savings', body: 'E safe, but e dey grow very slowly' },
      bonds: { name: 'Bond fund', body: 'Loans to government and companies: steady, small returns' },
      index: { name: 'Index fund', body: 'Small of every company: e dey spread your risk' },
      sunpower: { name: 'SunPower Energy', body: 'Solar and electricity' },
      greenleaf: { name: 'GreenLeaf Foods', body: 'Food and provisions' },
      roboworks: { name: 'RoboWorks', body: 'Robots and technology' },
      citybank: { name: 'City Bank', body: 'Banking and loans' },
      vitahealth: { name: 'VitaHealth', body: 'Medicine and health' },
      shopstream: { name: 'ShopStream', body: 'Online and street shops' },
    },
    newsItems: {
      heatwave: 'Heatwave! Demand for electricity don high well well.',
      robotOrder: 'RoboWorks win one giant order for factory robots.',
      harvest: 'Record harvest reduce cost for food companies.',
      recall: 'RoboWorks call back thousands of robots wey get fault.',
      shopping: 'Holiday shopping break record.',
      medicine: 'Government approve VitaHealth new medicine.',
      rateRise: 'Central bank increase interest rates.',
      oilDrop: 'Energy price fall well well.',
      recession: 'Fear of recession: buyers dey reduce spending.',
      boom: 'Economy grow fast pass wetin people expect.',
      bankScandal: 'City Bank collect fine because dem hide losses.',
      hype: 'Everybody for online dey talk say RoboWorks go "reach moon"!',
      rumour: 'Anonymous post: "Dem go buy over ShopStream!" (no confirm)',
      quietQuarter: 'Quiet quarter: no big news.',
      crash: 'Market crash! Price dey fall everywhere.',
      rebound: 'Markets bounce back after the crash.',
    },
    quiz: {
      share: {
        q: 'Wetin you own when you buy share?',
        options: ['Loan to the company', 'Small part of the company', 'Guaranteed profit', 'Job for the company'],
        why: 'Share na small piece of ownership for company. If the company do well, your share value fit rise and e fit pay dividends.',
      },
      diversify: {
        q: 'Wetin diversify mean?',
        options: [
          'Buy only the best company',
          'Keep all your money as cash',
          'Spread money across many different investments',
          'Sell anytime price fall',
        ],
        why: 'To diversify mean say you no put all your eggs inside one basket. If one investment fall, the others fit hold your portfolio steady.',
      },
      riskReturn: {
        q: 'Investments wey fit bring more money usually…',
        options: ['Carry more risk', 'Dey completely safe', 'No dey ever lose money', 'Na only for banks'],
        why: 'Higher return wey possible dey usually come with higher risk: the price fit swing well well both sides.',
      },
      index: {
        q: 'Wetin be index fund?',
        options: [
          'Savings account',
          'One tech company',
          'Government loan',
          'Fund wey hold many companies for one market',
        ],
        why: 'Index fund dey buy small of every company for one market, so you go get the market average return with low fees and less risk pass single companies.',
      },
      bond: {
        q: 'When you buy bond, you dey…',
        options: ['Buy part of company', 'Lend money wey dem go pay back with interest', 'Buy gold', 'Pay tax'],
        why: 'Bond na loan to government or company. Dem dey pay you interest and return your money later, so bonds dey usually steady pass shares.',
      },
      dividend: {
        q: 'Wetin be dividend?',
        options: [
          'Part of company profit wey dem pay shareholders',
          'Fee to buy shares',
          'One type of loan',
          'When share price fall',
        ],
        why: 'Some companies dey share part of their profit with their owners (shareholders) as dividends.',
      },
      compound: {
        q: 'Why to start investing early dey help so much?',
        options: [
          'Price dey always low',
          'Banks dey give young people bonus',
          'Returns dey earn more returns over time (compounding)',
          'You no go pay any fee',
        ],
        why: 'With compounding, your gains go start to earn their own gains. The longer your money dey grow, the faster e go grow.',
      },
      emergencyFirst: {
        q: 'Wetin you suppose usually get before you invest?',
        options: ['Car', 'Credit card', 'Stock tip from friend', 'Emergency fund'],
        why: 'Investments fit fall for short time. Emergency fund mean say nothing go force you sell for bad time to pay for surprise.',
      },
      pastPerformance: {
        q: 'Company share price double last year. Dis one mean…',
        options: ['E go double again', 'Nothing sure about next year', 'E no get risk again', 'You must buy am now'],
        why: 'Wetin happen before no guarantee wetin go happen. Price dey depend on wetin go happen next, no be wetin don happen.',
      },
      inflation: {
        q: 'Why to keep all your money as cash fit lose value over time?',
        options: [
          'Inflation dey make price rise fast pass how cash dey grow',
          'Banks dey take am',
          'Cash dey expire',
          'Shares dey replace cash',
        ],
        why: 'Inflation mean say price dey rise every year. If your money dey grow slow pass price, e go dey buy less over time.',
      },
      longTerm: {
        q: 'Which way dey usually work best for ordinary investors?',
        options: [
          'Trading every day',
          'Following online tips',
          'Investing regularly for long term',
          'Putting everything for one company',
        ],
        why: 'To invest regularly for long term inside diversified portfolio don beat to dey guess short-term moves, as history show.',
      },
      fees: {
        q: 'Why investment fees matter?',
        options: [
          'E no matter, dem small',
          'Dem dey make returns big',
          'Na only banks dey pay dem',
          'Dem dey collect am every year and e dey reduce your returns',
        ],
        why: 'Fees dey comot every year no matter wetin happen. For many years, even small fees go add up to big difference.',
      },
      hype: {
        q: 'Everybody for online dey talk say one share go "reach moon". Wetin be wisdom?',
        options: [
          'Buy as much as you fit',
          'Shine your eye: the hype don dey inside the price already',
          'Borrow money to buy am',
          'Tell everybody make dem buy am',
        ],
        why: 'By the time everybody dey hype something, the price don usually rise already. Hype dey often end with sharp fall.',
      },
      bearMarket: {
        q: 'Wetin be bear market?',
        options: [
          'Long time wey price dey fall',
          'Market for animals',
          'Time wey price dey rise fast',
          'Market wey close',
        ],
        why: 'Bear market na long fall for price; bull market na long rise. Both na normal part of investing.',
      },
      pricedIn: {
        q: 'Good news wey everybody don already know dey often…',
        options: ['Guaranteed profit', 'Illegal to use', 'Don already enter the price', 'Market no dey look am'],
        why: 'Markets dey react fast. When plenty people don know the news, buyers don usually push the price up already.',
      },
      rates: {
        q: 'When interest rates rise, wetin dey usually happen?',
        options: [
          'All shares go rise',
          'Cash savings go earn less',
          'Nothing go change',
          'To borrow go cost more, and some shares go fall',
        ],
        why: 'Higher interest rates dey make borrowing cost more, and e fit slow companies wey depend on loans, while banks fit earn more.',
      },
      panicSell: {
        q: 'Market crash 12%. Wetin patient investors dey usually do?',
        options: [
          'Sell everything at once',
          'Calm down and follow their plan',
          'Borrow to buy one share',
          'Stop to save forever',
        ],
        why: 'To sell because of panic dey lock in losses. Markets don recover over time before, and investors wey hold on collect reward.',
      },
      rebalance: {
        q: 'Wetin rebalancing portfolio mean?',
        options: [
          'To bring am back to the mix of investments wey you plan',
          'To sell everything',
          'To buy more of wetin rise pass',
          'To change bank',
        ],
        why: 'As price dey move, your mix go shift. Rebalancing dey bring am back to the risk level wey you plan.',
      },
    },
  },
};

export default business;
