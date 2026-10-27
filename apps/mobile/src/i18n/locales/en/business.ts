/**
 * The Business District in Knowzone World: walking around the square, its five places, and the five
 * Business, Finance & Economics games. The server runs the simulations and sends ids and numbers; all
 * the words (dilemmas, life events, news, lessons) are here so they follow the learner's language.
 * Money is a made-up currency shown as "$".
 */
export default {
  title: 'Business District',
  entryEyebrow: 'BUSINESS & FINANCE · NEW',
  entryTitle: 'Business District',
  entryBody:
    'Run a startup, master a budget, price a market stall, keep a factory profitable and invest practice money',
  leave: 'Leave the Business District',
  offline: 'The Business District needs an internet connection, because every decision is run on our server.',
  result: {
    back: 'Back to the Business District',
  },
  hall: {
    walkTo: 'Walk to the {{station}}',
    you: 'You, in your Knowzone blazer',
    open: 'Enter the {{station}}',
    goHere: 'Go here',
    stars: '{{count}} of {{max}} stars',
    tip: 'Walk to a building to start a game. Tap a name to walk there.',
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
      how: 'Run your own company month by month: hire makers, sellers and support staff, spend on marketing and handle tough management decisions. Grow its value without running out of cash.',
    },
    'budget-master': {
      name: 'Budget Master',
      how: 'Plan a monthly paycheck: pay the bills, eat well, save for a goal, build an emergency fund and handle surprises without falling into debt.',
    },
    'market-master': {
      name: 'Market Master',
      how: 'Run a market stall: choose your price and how much stock to buy each day as the weather, crowds and a rival change demand.',
    },
    'profit-quest': {
      name: 'Profit Quest',
      how: 'Master the maths of a business (margins, break-even, profit), then run a factory week by week: set the price, how many to make and when to invest.',
    },
    'market-simulator': {
      name: 'Market Simulator',
      how: 'Invest practice money in made-up companies, bonds and an index fund. News moves the market: spread your risk and learn how investing works. No real money.',
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
    fair: 'Fair choice',
    poor: 'Poor choice',
    bestWas: 'The best choice was: {{choice}}',
    lesson: 'BUSINESS LESSON',
    left: 'Left to plan: ${{amount}}',
    over: 'Over by ${{amount}}',
    points: '+{{points}} points',
    more: 'More',
    less: 'Less',
    pick: 'Choose an option first.',
    unbalanced: 'Plan every dollar: the total must match exactly.',
    invalid: 'That plan isn’t allowed. Check the numbers.',
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
      bakery: 'cakes and coffees',
      repair: 'repairs',
      apps: 'app projects',
      fashion: 'clothes',
      solar: 'installations',
    },
    month: 'Month {{n}} of {{total}}',
    goal: 'Goal: your share worth ${{goal}}',
    value: 'Company value',
    cash: 'Cash',
    morale: 'Morale',
    rep: 'Reputation',
    owned: 'You own {{pct}}%',
    decision: 'THIS MONTH’S DECISION',
    team: 'YOUR TEAM',
    roles: {
      maker: 'Makers',
      seller: 'Sellers',
      support: 'Support',
    },
    roleHint: {
      maker: 'Each makes about {{n}} {{sale}} a month',
      seller: 'Each brings about {{n}} more customers a month',
      support: 'Handles admin and customers; each looks after 4 teammates',
    },
    salary: '${{amount}}/month each',
    hireCost: 'Hiring costs: ${{amount}} (recruiting and training)',
    payroll: 'Payroll: ${{amount}}/month',
    marketing: 'MARKETING THIS MONTH',
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
      other: 'One-off costs and income',
      loan: 'Loan repayment',
      net: 'Net profit',
      cash: 'Cash in the bank',
      runway: 'At this rate, cash lasts {{count}} more months',
    },
    ops: {
      line: '{{demand}} customers wanted to buy · your team could serve {{capacity}} · you sold {{sold}}',
      order: 'Plus a special order of {{count}}',
      turnedAway: 'You turned {{count}} customers away. More makers would have earned more.',
      idle: 'Your makers had spare time. More sellers or marketing would bring in customers.',
      balanced: 'Your team’s output matched demand well.',
      overload: 'Your team is too big for its support staff: everyone slowed down.',
      saturated: 'Your market is getting full: each extra seller brings fewer new customers.',
    },
    bankrupt: 'Out of cash! A company can be profitable on paper and still fail if it runs out of money.',
    dilemmas: {
      poach: {
        title: 'Your best maker is leaving?',
        body: 'A rival company offers your most skilled maker a better-paid job. They’d rather stay, but they need a raise.',
        options: {
          match: 'Give every maker a $120/month raise',
          letGo: 'Wish them well and let them go',
          threaten: 'Tell them they’ll regret leaving',
        },
        lesson:
          'Replacing a good employee usually costs far more than keeping them: recruiting, training and lost output while the new person learns. Fair pay keeps your best people and keeps morale up.',
      },
      bigOrder: {
        title: 'A huge order, at a big discount',
        body: 'A large customer wants a big order this month, but only at 40% off your normal price.',
        options: {
          negotiate: 'Negotiate: a smaller order at 15% off',
          accept: 'Accept the 40% discount',
          decline: 'Politely say no',
        },
        lesson:
          'A discount comes straight out of your profit margin. Before saying yes, check that the price still covers the cost of making each one, and that you have spare capacity. Negotiating is normal in business.',
      },
      review: {
        title: 'An angry online review',
        body: 'A customer posts that your service was slow and rude. Other people are reading it.',
        options: {
          fix: 'Apologise publicly, fix the problem and refund them',
          ignore: 'Ignore it, it will be forgotten',
          argue: 'Reply that the customer is lying',
        },
        lesson:
          'Your reputation brings customers back and makes them recommend you. A public, honest response to a complaint often wins more trust than having no complaints at all.',
      },
      burnout: {
        title: 'The team is exhausted',
        body: 'After weeks of overtime, your staff are tired and making mistakes.',
        options: {
          rest: 'Give everyone a paid day off and bring in temporary help',
          pizza: 'Buy pizza for the team',
          push: 'Ask for even more overtime this month',
        },
        lesson:
          'Tired people produce less and quit more. Pushing harder gives a short burst of output but costs you later in morale and staff turnover. Good managers protect their team’s energy.',
      },
      agency: {
        title: 'A "viral" marketing promise',
        body: 'An agency promises that a $2,000 campaign will make you famous overnight.',
        options: {
          test: 'Try a small $300 test and measure the results',
          pay: 'Pay the full $2,000',
          skip: 'Skip it',
        },
        lesson:
          'Test before you spend big. A small, measured trial shows whether marketing really brings customers, so you only scale up what works. Big promises are not evidence.',
      },
      fancyOffice: {
        title: 'A fancy new office?',
        body: 'You could move to a stylish office with a games room. It costs $2,500 to move and 30% more rent.',
        options: {
          stay: 'Stay, and spend money on what customers notice',
          move: 'Move in, the team will love it',
        },
        lesson:
          'Fixed costs like rent must be paid every month whether you sell or not. Keep them low, especially early on, so your business survives slow months.',
      },
      sponsor: {
        title: 'Sponsor the school sports day?',
        body: 'A local school asks you to sponsor its sports day for $300. Your name would be on the T-shirts.',
        options: {
          sponsor: 'Sponsor it',
          decline: 'Decline politely',
        },
        lesson:
          'Supporting your community builds goodwill and local awareness of your brand. It’s a form of marketing that also does good.',
      },
      supplier: {
        title: 'Your supplier raises prices',
        body: 'The materials you buy now cost 20% more.',
        options: {
          shop: 'Compare other suppliers and negotiate',
          raise: 'Pass the cost on: raise your price 8%',
          cheap: 'Switch to much cheaper, lower-quality materials',
        },
        lesson:
          'When costs rise, shop around and negotiate first. Cutting quality protects your margin for a month but damages your reputation for much longer.',
      },
      latePayer: {
        title: 'A customer hasn’t paid',
        body: 'A big customer still owes you $1,500 from 60 days ago, and cash is getting tight.',
        options: {
          remind: 'Send a polite reminder and offer a small discount for paying now',
          wait: 'Wait and hope they pay',
          threaten: 'Threaten them with lawyers',
        },
        lesson:
          'Profit is not the same as cash. Money customers owe you (receivables) can’t pay your bills until it arrives. Chasing payments politely and quickly keeps cash flowing.',
      },
      newLine: {
        title: 'A new product idea',
        body: 'Someone on the team has an idea for a new product line.',
        options: {
          pilot: 'Run a small pilot with a few customers first',
          bigLaunch: 'Launch it big with lots of stock and adverts',
          later: 'Not now',
        },
        lesson:
          'Innovation keeps a business growing, but launching small lets you learn what customers really want before risking a lot of money. This is called a pilot or a minimum viable product.',
      },
      training: {
        title: 'Train the team?',
        body: 'A $500 course would make your staff faster and more skilled.',
        options: {
          train: 'Pay for the course',
          free: 'Share free online videos instead',
          skip: 'Skip training',
        },
        lesson:
          'Training is an investment in people: skilled staff produce more and feel valued, which pays back the cost over the following months.',
      },
      loan: {
        title: 'A bank loan',
        body: 'The bank offers $4,000, repaid at $190 a month (about 12% interest a year).',
        options: {
          machine: 'Borrow it to buy a machine that makes 25% more',
          party: 'Borrow it for a team party and new furniture',
          no: 'Don’t borrow',
        },
        lesson:
          'Good debt pays for things that earn more than the interest, like equipment that raises output. Borrowing for things that don’t earn money just leaves you with repayments.',
      },
      rent: {
        title: 'The landlord raises the rent',
        body: 'Your landlord wants 25% more rent from next month.',
        options: {
          lease: 'Offer to sign a longer lease for a smaller rise',
          accept: 'Accept the rise',
          moveFar: 'Move to a cheaper place far from your customers',
        },
        lesson:
          'Almost everything in business can be negotiated. Offering something the other side values (a long, reliable lease) can get you a better deal. Location matters too: moving away from customers loses sales.',
      },
      competitor: {
        title: 'A competitor opens nearby',
        body: 'A new business opens down the street with lower prices.',
        options: {
          quality: 'Compete on quality and service, with a loyalty card',
          priceWar: 'Cut your prices by 25% to beat them',
          nothing: 'Do nothing',
        },
        lesson:
          'A price war can destroy both businesses’ profits. It’s often smarter to compete on what makes you different: quality, service and loyal customers.',
      },
      safety: {
        title: 'A safety inspection',
        body: 'An inspector finds a safety problem in your workplace.',
        options: {
          fixNow: 'Fix it properly right away',
          later: 'Patch it cheaply and fix it later',
        },
        lesson:
          'Businesses must keep workers and customers safe. Fixing problems early is cheaper than fines, accidents and a damaged reputation.',
      },
      remote: {
        title: 'Working from home?',
        body: 'Your staff ask to work from home some days.',
        options: {
          trial: 'Try it for a month and measure the results',
          refuse: 'Refuse',
          always: 'Allow it for everyone, every day, with no checks',
        },
        lesson:
          'Flexibility can raise morale, but good managers test changes and measure the effect on output before deciding for good.',
      },
      investor: {
        title: 'An investor wants in',
        body: 'An investor offers $10,000 in exchange for 40% of your company.',
        options: {
          counter: 'Counter-offer: $8,000 for 20%',
          accept: 'Accept $10,000 for 40%',
          refuse: 'Refuse and grow on your own money',
        },
        lesson:
          'Selling shares (equity) brings cash without debt, but you give up part of every future profit and of the company’s value. This is called dilution. Negotiate the price of your shares.',
      },
      tax: {
        title: 'The tax bill is due',
        body: 'You owe $700 in business taxes this month.',
        options: {
          pay: 'Pay it on time',
          plan: 'Ask for an official payment plan',
          ignore: 'Ignore it for now',
        },
        lesson:
          'Taxes pay for roads, schools and hospitals, and every business must pay them. Late payment brings penalties, so smart businesses save for tax as they earn.',
      },
      bigClient: {
        title: 'One giant customer',
        body: 'A huge client offers to buy half of everything you make, but only if you drop your other customers.',
        options: {
          balance: 'Take a smaller deal and keep your other customers',
          allIn: 'Drop everyone else and sign',
          decline: 'Decline',
        },
        lesson:
          'Depending on one customer is risky: if they leave, most of your business goes with them. Spreading sales across many customers makes a company stronger.',
      },
      ethics: {
        title: 'A secret "gift"',
        body: 'A supplier offers you a secret personal gift if you keep buying from them at higher prices.',
        options: {
          refuse: 'Refuse and report it',
          accept: 'Accept the gift',
        },
        lesson:
          'That gift is a bribe. It costs your company money, it’s often illegal, and it destroys trust. Ethical businesses last longer.',
      },
    },
  },

  // ─── Budget Master ─────────────────────────────────────────────────────────
  budget: {
    month: 'Month {{n}} of {{total}}',
    income: 'Income this month',
    bills: 'BILLS (MUST PAY)',
    afterBills: 'Left after bills',
    plan: 'YOUR PLAN',
    billNames: {
      rent: 'Rent',
      utilities: 'Electricity and water',
      phone: 'Phone and data',
      transport: 'Transport',
      minimum: 'Card minimum payment',
      subscription: 'Streaming subscription',
      bankFees: 'Bank fees',
      carDeal: 'Car payment',
    },
    keys: {
      food: 'Food',
      fun: 'Fun',
      clothes: 'Clothes',
      emergency: 'Emergency fund',
      goal: 'Savings goal',
      debt: 'Extra card payment',
    },
    keyHint: {
      food: 'You need at least ${{min}}',
      fun: 'Going out, games, treats',
      clothes: 'New clothes and shoes',
      emergency: '${{have}} saved · target ${{target}}',
      goal: '{{goal}}: ${{have}} of ${{target}}',
      debt: 'Card debt ${{have}} · {{rate}}% interest a month',
    },
    goals: {
      laptop: 'New laptop',
      bike: 'Bike',
      course: 'Coding course',
      travel: 'Trip',
      deposit: 'Flat deposit',
    },
    rule: 'Needs {{needs}}% · Wants {{wants}}% · Savings {{savings}}%',
    ruleHint: 'A good guide: needs about 50%, wants up to 30%, save at least 20%.',
    restToGoal: 'Put the rest in savings',
    event: 'THIS MONTH',
    costFrom: {
      fun: '−${{amount}} from fun money',
      emergency: '−${{amount}} from the emergency fund',
      goal: '−${{amount}} from savings',
      card: '−${{amount}} on the credit card',
    },
    gain: '+${{amount}} to savings',
    newBill: '+${{amount}} every month',
    run: 'Live the month',
    report: 'MONTH {{n}} REPORT',
    check: {
      food: 'Ate well',
      noFood: 'Not enough for food',
      saved: 'Saved {{pct}}% of income',
      wants: 'Spent {{pct}}% on wants',
      card: '${{amount}} went on the credit card',
      interest: 'Card interest this month: ${{amount}}',
      debt: 'Card debt now: ${{amount}}',
      emergency: 'Emergency fund: ${{amount}}',
      goal: 'Savings goal: ${{amount}} of ${{target}}',
    },
    events: {
      concert: {
        title: 'Concert invitation',
        body: 'A friend invites you to a concert. Tickets cost $80.',
        options: {
          funMoney: 'Go, paying from your fun money',
          freePlan: 'Suggest a free picnic instead',
          card: 'Go, and put it on the credit card',
        },
        lesson:
          'Fun is part of a healthy budget: that’s what your fun money is for. Paying for wants on credit means paying interest on a night out for months.',
      },
      phone: {
        title: 'Cracked phone screen',
        body: 'You drop your phone. A screen repair costs $150.',
        options: {
          emergency: 'Pay from your emergency fund',
          card: 'Put it on the credit card',
          newPhone: 'Buy a brand-new $700 phone on credit',
        },
        lesson:
          'This is exactly what an emergency fund is for: surprises you can’t avoid. Repairing is usually far cheaper than replacing.',
      },
      sale: {
        title: '"50% off, today only!"',
        body: 'A shop has a flash sale on trainers you don’t really need: $120.',
        options: { skip: 'Skip it', funMoney: 'Buy them with fun money', card: 'Buy them on the credit card' },
        lesson:
          'A discount on something you don’t need isn’t a saving, it’s spending. "Today only" is designed to rush you. Wait a day before buying wants.',
      },
      gift: {
        title: 'Mum’s birthday',
        body: 'It’s your mum’s birthday this month.',
        options: {
          funMoney: 'A $40 gift from your fun money',
          handmade: 'A handmade card and cooking her dinner',
          card: 'An expensive $150 gift on the credit card',
        },
        lesson:
          'Thoughtful doesn’t have to mean expensive. Gifts belong in your planned spending, not on a credit card.',
      },
      bonus: {
        title: 'A $300 bonus!',
        body: 'Your manager gives you a $300 bonus for great work.',
        options: { save: 'Save all of it', split: 'Save $240 and enjoy $60', spend: 'Spend it all this weekend' },
        lesson:
          'Extra money is the easiest money to save, because you were already living without it. Saving most of a windfall and enjoying a little is a great habit.',
      },
      scam: {
        title: '"Double your money in a week!"',
        body: 'A group chat promises to double any money you send them in one week.',
        options: { ignore: 'Ignore it and warn your friends', invest: 'Send them $200 of your savings' },
        lesson:
          'Nobody can safely double money in a week. Guaranteed high returns are the sign of a scam: your money disappears.',
      },
      bike: {
        title: 'Bike repair',
        body: 'The bike you ride to work needs a $220 repair.',
        options: {
          emergency: 'Pay from your emergency fund',
          card: 'Put it on the credit card',
          taxis: 'Skip the repair and take taxis all month ($380)',
        },
        lesson:
          'Putting off a necessary repair often costs more. Your emergency fund lets you fix problems quickly without borrowing.',
      },
      subscription: {
        title: 'Free trial ending',
        body: 'Your free streaming trial ends. From now on it costs $15 every month.',
        options: { cancel: 'Cancel it', keep: 'Keep it' },
        lesson:
          'Small monthly subscriptions add up: $15 a month is $180 a year. Check your subscriptions regularly and cancel what you don’t use.',
      },
      sideHustle: {
        title: 'Weekend tutoring',
        body: 'A neighbour offers to pay you $150 to tutor their child on weekends.',
        options: { takeSave: 'Take it and save what you earn', decline: 'Decline and keep your weekends' },
        lesson:
          'A side income speeds up your goals. Saving extra income, rather than spending it, gets you there much faster.',
      },
      dentist: {
        title: 'Toothache',
        body: 'You have a toothache. The dentist costs $180.',
        options: {
          emergency: 'Go now, paying from your emergency fund',
          card: 'Go now, paying by credit card',
          wait: 'Wait until it gets worse ($450 later)',
        },
        lesson:
          'Looking after your health early is cheaper than treating a bigger problem later. Never skip care you need to save money.',
      },
      loanApp: {
        title: 'Instant loan app',
        body: 'An app offers you $500 instantly. You’d pay back $650 in just two weeks.',
        options: { decline: 'Decline', take: 'Take it' },
        lesson:
          'Paying back $650 for $500 in two weeks is a huge interest rate, many times more than a credit card. Payday-style loans trap people in debt.',
      },
      foodPrices: {
        title: 'Food prices rise',
        body: 'Prices at the shops go up 10% this month: food costs you $30 more.',
        options: { cutWants: 'Spend less on wants this month', card: 'Put the extra on the credit card' },
        lesson: 'When prices rise (inflation), adjust your budget by cutting wants, not by borrowing for needs.',
      },
      bankFees: {
        title: 'Bank fees',
        body: 'Your bank charges you $12 every month just for having an account.',
        options: { switch: 'Switch to a free account', stay: 'Stay with this bank' },
        lesson:
          'Fees quietly eat your money every month. Comparing banks and switching to a free account is an easy win.',
      },
      friendLoan: {
        title: 'A friend needs money',
        body: 'A friend asks to borrow $100 until next month.',
        options: {
          afford: 'Lend $100 from fun money, money you could live without',
          kindNo: 'Kindly explain you can’t this month',
          savings: 'Lend it from your emergency fund',
        },
        lesson:
          'Only lend what you could afford never to get back, and never from your emergency fund. Saying no kindly is fine too.',
      },
      matching: {
        title: 'Free money from work',
        body: 'Your employer adds $1 to your retirement savings for every $1 you save there, up to $100 a month.',
        options: { join: 'Join: save $100 and get $100 extra', later: 'Maybe later' },
        lesson:
          'An employer match is an instant 100% return on your money. It’s one of the best deals in personal finance: always take it if you can.',
      },
      carDeal: {
        title: '"Only $250 a month!"',
        body: 'A dealer offers you a shiny car for "only $250 a month" over six years.',
        options: { decline: 'Decline: you don’t need a car', sign: 'Sign the deal' },
        lesson:
          'Look at the total, not the monthly price: $250 × 72 months is $18,000. A long payment plan is a big commitment.',
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
    day: 'Day {{n}} of {{total}}',
    costEach: 'Stock costs ${{cost}} each',
    fee: 'Stall fee ${{fee}} a day · unsold stock is thrown away',
    rival: 'Rival stall price: ${{price}}',
    research: 'MARKET RESEARCH',
    researchRow: 'At ${{price}}: about {{count}} customers',
    noResearch: 'No research today: use the forecast and what you’ve learnt.',
    yesterday: 'Yesterday: priced ${{price}}, {{wanted}} customers wanted to buy',
    price: 'Your price',
    stock: 'Stock to buy',
    preview: 'If you sell it all: ${{revenue}} in sales, ${{profit}} profit',
    open: 'Open the stall',
    report: 'DAY {{n}} REPORT',
    line: {
      wanted: '{{count}} customers wanted to buy',
      sold: 'You sold {{count}}',
      wasted: '{{count}} thrown away unsold',
      missed: '{{count}} customers left empty-handed',
      revenue: 'Sales',
      stock: 'Stock bought',
      fee: 'Stall fee',
      profit: 'Profit',
      best: 'Best today: ${{price}} with {{count}} in stock, for ${{profit}} profit',
    },
    days: {
      sunny: { title: 'A normal sunny day', body: 'Steady crowds in the market today.' },
      hot: { title: 'Heatwave!', body: 'It’s scorching hot: everyone wants something cold.' },
      cloudy: { title: 'Grey and cool', body: 'Clouds and a chilly wind keep many shoppers at home.' },
      rainy: { title: 'Rain all day', body: 'Heavy rain: only half the usual shoppers come out.' },
      festival: { title: 'Festival day!', body: 'A music festival fills the streets with crowds.' },
      rival: { title: 'A rival stall opens', body: 'A new stall across the street sells the same thing.' },
      rivalSale: { title: 'The rival’s big sale', body: 'The rival stall slashes its price to win customers.' },
      shortage: { title: 'Supply shortage', body: 'A poor harvest: your supplies cost 60% more today.' },
      tourists: { title: 'Tour bus arrives', body: 'Tourists fill the market. They care less about price.' },
      payday: { title: 'Payday', body: 'The factory next door just paid its workers.' },
      cold: { title: 'Cold snap', body: 'It’s freezing: fewer shoppers, and they hunt for bargains.' },
      bulk: { title: 'Bumper harvest', body: 'Suppliers have too much: your stock is 25% cheaper today.' },
    },
    ideas: {
      demand:
        'The law of demand: when the price goes up, people buy less; when it goes down, they buy more. The best price balances how many you sell with how much you make on each.',
      shiftRight:
        'Demand increased: at every price, more people want to buy. When demand rises you can sell more and often charge a bit more too.',
      shiftLeft:
        'Demand fell: at every price, fewer people want to buy. Buy less stock so you don’t waste it, and don’t expect high prices to work.',
      peak: 'Peak demand: on busy days businesses earn most of their money. Have enough stock ready: running out means turning away paying customers.',
      competition:
        'Competition: when a rival sells the same thing, customers compare prices. Charge much more than them and customers walk across the street.',
      substitutes:
        'Substitutes: when a similar product gets cheaper, demand for yours falls. You can match them a little, but a price war can wipe out profit.',
      supplyShock:
        'A supply shock: when costs rise, each sale earns less. Businesses usually raise prices and sell a little less.',
      inelastic:
        'Inelastic demand: some customers barely react to price. When buyers care less about price, a higher price earns more.',
      income: 'Income effect: when people have more money, they buy more and care a little less about price.',
      elastic:
        'Elastic demand: price-sensitive customers buy much less when prices rise. Keep prices low on days like this.',
      supplyGlut:
        'Lower costs: when supplies are cheap, each sale earns more, and a slightly lower price can win extra customers.',
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
    factory: 'Your factory makes {{product}}',
    step: 'Challenge {{n}} of {{total}}',
    calcTitle: 'BUSINESS MATHS',
    calc: {
      contribution:
        'You sell {{product}} for ${{price}} each. Making one costs ${{unit}} in materials and labour. How much does each sale contribute towards your fixed costs?',
      breakeven:
        'Each of your {{product}} sells for ${{price}} and costs ${{unit}} to make. Fixed costs (rent, machines, managers) are ${{fixed}} a week. How many must you sell each week to break even?',
      profit:
        'You sell {{units}} {{product}} at ${{price}}. Each costs ${{unit}} to make and fixed costs are ${{fixed}}. What is your profit?',
      margin:
        'You sell {{units}} {{product}} at ${{price}}. Each costs ${{unit}} to make and fixed costs are ${{fixed}}. What is your profit margin (profit as a % of revenue)?',
      priceForTarget:
        'You expect to sell {{units}} {{product}}. Each costs ${{unit}} to make and fixed costs are ${{fixed}}. What price gives you a ${{target}} profit?',
      machine:
        'Your {{product}} sell for ${{price}} and cost ${{unit}} to make; fixed costs are ${{fixed}}. A new machine adds ${{extra}} to fixed costs but saves ${{saving}} on each one made. What is the new break-even quantity?',
    },
    formula: {
      contribution:
        'Contribution per unit = price − variable cost. It’s what each sale adds towards paying fixed costs, then towards profit.',
      breakeven:
        'Break-even quantity = fixed costs ÷ contribution per unit (round up). Sell more than this and you make a profit.',
      profit: 'Profit = units × (price − variable cost) − fixed costs.',
      margin: 'Profit margin = profit ÷ revenue × 100. It shows how much of every dollar of sales you keep.',
      priceForTarget: 'Price = variable cost + (fixed costs + target profit) ÷ units.',
      machine:
        'New break-even = (fixed costs + extra fixed cost) ÷ (price − new variable cost). Machines raise fixed costs but lower the cost of each unit.',
    },
    percent: '{{n}}%',
    right: 'Correct! +{{points}}',
    wrong: 'Not quite: the answer is {{answer}}.',
    week: 'FACTORY WEEK',
    numbers: 'Making one costs ${{unit}} · fixed costs ${{fixed}} a week · {{stock}} in the warehouse',
    research: 'MARKET RESEARCH',
    researchRow: 'At ${{price}}: {{count}} customers a week',
    researchAbout: 'At ${{price}}: about {{count}} customers a week',
    price: 'Price',
    make: 'Make this week',
    breakEven: 'At this price you break even after {{count}} sales',
    noBreakEven: 'At this price you lose money on every sale!',
    upgrades: 'INVEST THIS WEEK?',
    upgrade: {
      none: { title: 'No investment', body: 'Keep things as they are.' },
      machine: { title: 'New machine', body: 'Fixed costs +25%, but each one costs 25% less to make.' },
      ads: { title: 'Advertising', body: 'Fixed costs +15%, and 20% more customers at every price.' },
    },
    owned: 'Already bought',
    run: 'Run the week',
    report: 'WEEK REPORT',
    line: {
      demand: '{{wanted}} customers wanted to buy · you sold {{sold}} · {{stock}} left in the warehouse',
      revenue: 'Revenue',
      cogs: 'Cost of the units sold',
      fixed: 'Fixed costs',
      storage: 'Storage of unsold stock',
      profit: 'Profit',
      best: 'Best price this week: ${{price}}, for ${{profit}} profit',
      over: 'You made more than you could sell: unsold stock costs money to store.',
      under: 'You ran out: more customers wanted to buy.',
    },
  },

  // ─── Market Simulator ──────────────────────────────────────────────────────
  invest: {
    practice: 'Practice money only · made-up companies',
    quarter: 'Quarter {{n}} of {{total}}',
    portfolio: 'Your portfolio',
    indexCompare: 'The whole market (index fund): ${{value}}',
    news: 'NEWS',
    quizTitle: 'INVESTOR QUESTION',
    allocate: 'SPREAD YOUR ${{value}}',
    total: 'Total: {{pct}}%',
    totalHint: 'Your choices must add up to 100%.',
    limit: 'Keep any one company at {{pct}}% or less to spread your risk.',
    feesNote: 'Fees each quarter: index fund 0.05%, bonds 0.1%, each company’s shares 0.3%.',
    run: 'Next quarter',
    report: 'QUARTER {{n}} RESULTS',
    yourReturn: 'Your return: {{pct}}',
    indexReturn: 'Whole market: {{pct}}',
    fees: 'Fees: {{pct}}',
    value: 'Portfolio now: ${{value}}',
    concentrated: 'Too much in one company! If it falls, your whole portfolio falls with it.',
    risk: {
      low: 'Low risk',
      medium: 'Medium risk',
      high: 'High risk',
    },
    assets: {
      cash: { name: 'Cash savings', body: 'Safe, but grows very slowly' },
      bonds: { name: 'Bond fund', body: 'Loans to governments and companies: steady, small returns' },
      index: { name: 'Index fund', body: 'A little of every company: spreads your risk' },
      sunpower: { name: 'SunPower Energy', body: 'Solar and electricity' },
      greenleaf: { name: 'GreenLeaf Foods', body: 'Food and groceries' },
      roboworks: { name: 'RoboWorks', body: 'Robots and technology' },
      citybank: { name: 'City Bank', body: 'Banking and loans' },
      vitahealth: { name: 'VitaHealth', body: 'Medicines and health' },
      shopstream: { name: 'ShopStream', body: 'Online and high-street shops' },
    },
    newsItems: {
      heatwave: 'Heatwave! Electricity demand soars.',
      robotOrder: 'RoboWorks wins a giant order for factory robots.',
      harvest: 'Record harvest lowers costs for food companies.',
      recall: 'RoboWorks recalls thousands of faulty robots.',
      shopping: 'Holiday shopping breaks records.',
      medicine: 'VitaHealth’s new medicine is approved.',
      rateRise: 'The central bank raises interest rates.',
      oilDrop: 'Energy prices fall sharply.',
      recession: 'Recession fears: shoppers cut back.',
      boom: 'The economy grows faster than expected.',
      bankScandal: 'City Bank fined for hiding losses.',
      hype: 'Everyone online says RoboWorks will "go to the moon"!',
      rumour: 'Anonymous post: "ShopStream will be bought out!" (unconfirmed)',
      quietQuarter: 'A quiet quarter: no big news.',
      crash: 'Market crash! Prices fall everywhere.',
      rebound: 'Markets bounce back after the crash.',
    },
    quiz: {
      share: {
        q: 'What do you own when you buy a share?',
        options: [
          'A loan to the company',
          'A small part of the company',
          'A guaranteed profit',
          'A job at the company',
        ],
        why: 'A share is a small piece of ownership in a company. If the company does well, your share can rise in value and may pay dividends.',
      },
      diversify: {
        q: 'What does it mean to diversify?',
        options: [
          'Buy only the best company',
          'Keep all your money in cash',
          'Spread money across many different investments',
          'Sell whenever prices fall',
        ],
        why: 'Diversifying means not putting all your eggs in one basket. If one investment falls, the others can hold your portfolio steady.',
      },
      riskReturn: {
        q: 'Investments that can earn more usually…',
        options: ['Carry more risk', 'Are completely safe', 'Never lose money', 'Are only for banks'],
        why: 'Higher possible returns usually come with higher risk: the price can swing a lot in both directions.',
      },
      index: {
        q: 'What is an index fund?',
        options: [
          'A savings account',
          'A single tech company',
          'A government loan',
          'A fund that holds many companies in a market',
        ],
        why: 'An index fund buys a little of every company in a market, so you get the market’s average return with low fees and less risk than single companies.',
      },
      bond: {
        q: 'When you buy a bond, you are…',
        options: [
          'Buying part of a company',
          'Lending money that is paid back with interest',
          'Buying gold',
          'Paying a tax',
        ],
        why: 'A bond is a loan to a government or company. They pay you interest and return your money later, so bonds are usually steadier than shares.',
      },
      dividend: {
        q: 'What is a dividend?',
        options: [
          'Part of a company’s profit paid to shareholders',
          'A fee for buying shares',
          'A type of loan',
          'A fall in share price',
        ],
        why: 'Some companies share part of their profits with their owners (shareholders) as dividends.',
      },
      compound: {
        q: 'Why does starting to invest early help so much?',
        options: [
          'Prices are always lower',
          'Banks give bonuses to young people',
          'Returns earn more returns over time (compounding)',
          'You pay no fees',
        ],
        why: 'With compounding, your gains start earning gains of their own. The longer your money grows, the faster it grows.',
      },
      emergencyFirst: {
        q: 'What should you usually have before you invest?',
        options: ['A car', 'A credit card', 'A stock tip from a friend', 'An emergency fund'],
        why: 'Investments can fall in the short term. An emergency fund means you won’t be forced to sell at a bad time to pay for a surprise.',
      },
      pastPerformance: {
        q: 'A company’s share price doubled last year. This means…',
        options: [
          'It will double again',
          'Nothing certain about next year',
          'It is now risk-free',
          'You must buy it now',
        ],
        why: 'Past performance doesn’t guarantee future results. Prices depend on what happens next, not on what happened before.',
      },
      inflation: {
        q: 'Why can keeping all your money in cash lose value over time?',
        options: [
          'Inflation makes prices rise faster than cash grows',
          'Banks take it',
          'Cash expires',
          'Shares replace cash',
        ],
        why: 'Inflation means prices rise each year. If your money grows more slowly than prices, it buys less over time.',
      },
      longTerm: {
        q: 'Which approach usually works best for ordinary investors?',
        options: [
          'Trading every day',
          'Following online tips',
          'Investing regularly for the long term',
          'Putting everything in one company',
        ],
        why: 'Regular, long-term investing in a diversified portfolio has historically beaten trying to guess short-term moves.',
      },
      fees: {
        q: 'Why do investment fees matter?',
        options: [
          'They don’t, they’re tiny',
          'They make returns bigger',
          'Only banks pay them',
          'They are taken every year and reduce your returns',
        ],
        why: 'Fees come out every year whatever happens. Over many years, even small fees add up to a big difference.',
      },
      hype: {
        q: 'Everyone online says a share will "go to the moon". What is wise?',
        options: [
          'Buy as much as possible',
          'Be careful: hype is often already in the price',
          'Borrow money to buy it',
          'Tell everyone to buy it',
        ],
        why: 'By the time something is hyped everywhere, its price has usually already risen. Hype often ends in sharp falls.',
      },
      bearMarket: {
        q: 'What is a bear market?',
        options: [
          'A long period when prices fall',
          'A market for animals',
          'A time when prices rise fast',
          'A market that is closed',
        ],
        why: 'A bear market is a long fall in prices; a bull market is a long rise. Both are normal parts of investing.',
      },
      pricedIn: {
        q: 'Good news that everyone already knows is often…',
        options: ['A guaranteed profit', 'Illegal to use', 'Already priced in', 'Ignored by the market'],
        why: 'Markets react quickly. When news is widely known, buyers have usually already pushed the price up.',
      },
      rates: {
        q: 'When interest rates rise, what often happens?',
        options: [
          'All shares rise',
          'Cash savings earn less',
          'Nothing changes',
          'Borrowing costs more, and some shares fall',
        ],
        why: 'Higher interest rates make borrowing dearer, which can slow companies that rely on loans, while banks can earn more.',
      },
      panicSell: {
        q: 'The market crashes 12%. What do patient investors usually do?',
        options: [
          'Sell everything at once',
          'Stay calm and stick to their plan',
          'Borrow to buy one share',
          'Stop saving forever',
        ],
        why: 'Selling in a panic locks in losses. Markets have historically recovered over time, and investors who stayed the course were rewarded.',
      },
      rebalance: {
        q: 'What does rebalancing a portfolio mean?',
        options: [
          'Bringing it back to your planned mix of investments',
          'Selling everything',
          'Buying more of what rose most',
          'Changing banks',
        ],
        why: 'As prices move, your mix drifts. Rebalancing brings it back to the risk level you planned.',
      },
    },
  },
};
