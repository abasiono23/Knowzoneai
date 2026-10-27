/**
 * Startup Tycoon: the kinds of company you can run, and the management dilemmas that come up each
 * month. Only numbers and effects live here; the app has the words (and translations) for each id.
 * `note` is English for Kora (the help tutor). Every option has a grade: the best choice, a fair one,
 * or a poor one, and the app explains why after the month.
 */
export type Company = {
  id: 'bakery' | 'repair' | 'apps' | 'fashion' | 'solar';
  /** What one sale is worth, and what it costs to make (materials, parts, delivery). */
  price: number;
  unitCost: number;
  rent: number;
  salary: { maker: number; seller: number; support: number };
  note: string;
};

export const COMPANIES: Company[] = [
  {
    id: 'bakery',
    price: 6,
    unitCost: 2,
    rent: 900,
    salary: { maker: 1000, seller: 850, support: 800 },
    note: 'a bakery and café (sales are cakes and coffee)',
  },
  { id: 'repair', price: 45, unitCost: 15, rent: 800, salary: { maker: 1100, seller: 900, support: 800 }, note: 'a phone repair shop (sales are repairs)' },
  {
    id: 'apps',
    price: 150,
    unitCost: 30,
    rent: 1200,
    salary: { maker: 1500, seller: 1100, support: 900 },
    note: 'an app studio (sales are app projects and subscriptions)',
  },
  { id: 'fashion', price: 35, unitCost: 13, rent: 1000, salary: { maker: 1000, seller: 900, support: 800 }, note: 'a fashion brand (sales are clothes)' },
  {
    id: 'solar',
    price: 900,
    unitCost: 600,
    rent: 1100,
    salary: { maker: 1300, seller: 1000, support: 850 },
    note: 'a solar panel installer (sales are installations)',
  },
];

/** What a choice does. Fractions are of this month's (or every later month's) number. */
export type Effect = {
  /** One-off money out (or in, when negative). */
  cost?: number;
  morale?: number;
  rep?: number;
  /** Extra customers this month only, as a share of normal demand. */
  demand?: number;
  /** Lasting change to demand, capacity, the cost of each sale, the price, or the rent. */
  base?: number;
  cap?: number;
  /** Extra capacity this month only (e.g. overtime). */
  capNow?: number;
  unitCost?: number;
  price?: number;
  rent?: number;
  /** A raise for every maker, per month. */
  makerPay?: number;
  loseMaker?: boolean;
  /** A loan: money in now, a repayment every month after (1% interest a month on what's still owed). */
  loan?: { amount: number; monthly: number };
  /** Something the company buys and keeps (a machine): it still counts in the company's value. */
  asset?: number;
  /** Share of the company given to an investor (0.2 = 20%). */
  sell?: number;
  /** A one-off order on top of normal sales, as a share of normal demand, at a share of the price. */
  order?: { share: number; priceAt: number };
};
export type Grade = 'best' | 'ok' | 'poor';
export type Dilemma = { id: string; level: number; options: { id: string; grade: Grade; effect: Effect }[]; note: string };

export const DILEMMAS: Dilemma[] = [
  {
    id: 'poach',
    level: 1,
    note: 'A rival offers your best maker a better-paid job.',
    options: [
      { id: 'match', grade: 'best', effect: { makerPay: 120, morale: 6 } },
      { id: 'letGo', grade: 'ok', effect: { loseMaker: true, morale: -4 } },
      { id: 'threaten', grade: 'poor', effect: { loseMaker: true, morale: -15, rep: -4 } },
    ],
  },
  {
    id: 'bigOrder',
    level: 1,
    note: 'A big customer wants a large order at a 40% discount.',
    options: [
      { id: 'negotiate', grade: 'best', effect: { order: { share: 0.3, priceAt: 0.85 } } },
      { id: 'accept', grade: 'ok', effect: { order: { share: 0.4, priceAt: 0.6 } } },
      { id: 'decline', grade: 'ok', effect: {} },
    ],
  },
  {
    id: 'review',
    level: 1,
    note: 'A customer posts an angry online review about slow service.',
    options: [
      { id: 'fix', grade: 'best', effect: { cost: 150, rep: 8 } },
      { id: 'ignore', grade: 'ok', effect: { rep: -6 } },
      { id: 'argue', grade: 'poor', effect: { rep: -18 } },
    ],
  },
  {
    id: 'burnout',
    level: 1,
    note: 'The team is tired after weeks of overtime.',
    options: [
      { id: 'rest', grade: 'best', effect: { cost: 300, morale: 16 } },
      { id: 'pizza', grade: 'ok', effect: { cost: 60, morale: 4 } },
      { id: 'push', grade: 'poor', effect: { morale: -20, capNow: 0.1 } },
    ],
  },
  {
    id: 'agency',
    level: 1,
    note: 'An agency promises a "viral" campaign for $2,000.',
    options: [
      { id: 'test', grade: 'best', effect: { cost: 300, demand: 0.1 } },
      { id: 'pay', grade: 'poor', effect: { cost: 2000, demand: 0.15 } },
      { id: 'skip', grade: 'ok', effect: {} },
    ],
  },
  {
    id: 'fancyOffice',
    level: 1,
    note: 'You could move to a fancy new office with a games room.',
    options: [
      { id: 'stay', grade: 'best', effect: {} },
      { id: 'move', grade: 'poor', effect: { cost: 2500, rent: 0.3, morale: 6 } },
    ],
  },
  {
    id: 'sponsor',
    level: 1,
    note: 'A local school asks you to sponsor its sports day for $300.',
    options: [
      { id: 'sponsor', grade: 'best', effect: { cost: 300, rep: 8, base: 0.03 } },
      { id: 'decline', grade: 'ok', effect: {} },
    ],
  },
  {
    id: 'supplier',
    level: 2,
    note: 'Your supplier raises the cost of materials by 20%.',
    options: [
      { id: 'shop', grade: 'best', effect: { cost: 100, unitCost: 0.05 } },
      { id: 'raise', grade: 'ok', effect: { unitCost: 0.2, price: 0.08, base: -0.05 } },
      { id: 'cheap', grade: 'poor', effect: { unitCost: -0.05, rep: -16 } },
    ],
  },
  {
    id: 'latePayer',
    level: 2,
    note: 'A big customer has not paid a $1,500 invoice for 60 days and cash is tight.',
    options: [
      { id: 'remind', grade: 'best', effect: { cost: -1450 } },
      { id: 'wait', grade: 'ok', effect: {} },
      { id: 'threaten', grade: 'poor', effect: { cost: 300, rep: -8 } },
    ],
  },
  {
    id: 'newLine',
    level: 2,
    note: 'Someone has an idea for a new product line.',
    options: [
      { id: 'pilot', grade: 'best', effect: { cost: 250, base: 0.07 } },
      { id: 'bigLaunch', grade: 'poor', effect: { cost: 2200, base: 0.1 } },
      { id: 'later', grade: 'ok', effect: {} },
    ],
  },
  {
    id: 'training',
    level: 2,
    note: 'A training course would make the team better at their jobs.',
    options: [
      { id: 'train', grade: 'best', effect: { cost: 500, cap: 0.1, morale: 6 } },
      { id: 'free', grade: 'ok', effect: { cap: 0.03, morale: 2 } },
      { id: 'skip', grade: 'ok', effect: {} },
    ],
  },
  {
    id: 'loan',
    level: 3,
    note: 'The bank offers a $4,000 loan, repaid at $190 a month (about 12% interest a year).',
    options: [
      { id: 'machine', grade: 'best', effect: { loan: { amount: 4000, monthly: 190 }, cost: 4000, asset: 4000, cap: 0.25 } },
      { id: 'party', grade: 'poor', effect: { loan: { amount: 4000, monthly: 190 }, cost: 4000, morale: 10 } },
      { id: 'no', grade: 'ok', effect: {} },
    ],
  },
  {
    id: 'rent',
    level: 3,
    note: 'The landlord wants to raise the rent by 25%.',
    options: [
      { id: 'lease', grade: 'best', effect: { rent: 0.08 } },
      { id: 'accept', grade: 'ok', effect: { rent: 0.25 } },
      { id: 'moveFar', grade: 'poor', effect: { cost: 800, rent: -0.2, base: -0.15, rep: -6 } },
    ],
  },
  {
    id: 'competitor',
    level: 3,
    note: 'A new competitor opens nearby with low prices.',
    options: [
      { id: 'quality', grade: 'best', effect: { cost: 300, rep: 6, base: -0.02 } },
      { id: 'priceWar', grade: 'poor', effect: { price: -0.25, base: 0.05 } },
      { id: 'nothing', grade: 'ok', effect: { base: -0.08 } },
    ],
  },
  {
    id: 'safety',
    level: 3,
    note: 'An inspector finds a safety problem in your workplace.',
    options: [
      { id: 'fixNow', grade: 'best', effect: { cost: 450 } },
      { id: 'later', grade: 'poor', effect: { cost: 1600, rep: -10 } },
    ],
  },
  {
    id: 'remote',
    level: 4,
    note: 'Staff ask to work from home some days.',
    options: [
      { id: 'trial', grade: 'best', effect: { morale: 10 } },
      { id: 'refuse', grade: 'ok', effect: { morale: -6 } },
      { id: 'always', grade: 'ok', effect: { morale: 12, cap: -0.05 } },
    ],
  },
  {
    id: 'investor',
    level: 4,
    note: 'An investor offers $10,000 for 40% of your company.',
    options: [
      { id: 'counter', grade: 'best', effect: { cost: -8000, sell: 0.2 } },
      { id: 'accept', grade: 'ok', effect: { cost: -10000, sell: 0.4 } },
      { id: 'refuse', grade: 'ok', effect: {} },
    ],
  },
  {
    id: 'tax',
    level: 4,
    note: 'A $700 tax bill is due this month.',
    options: [
      { id: 'pay', grade: 'best', effect: { cost: 700 } },
      { id: 'plan', grade: 'ok', effect: { cost: 400 } },
      { id: 'ignore', grade: 'poor', effect: { cost: 1400, rep: -5 } },
    ],
  },
  {
    id: 'bigClient',
    level: 5,
    note: 'One client wants to buy half of everything you make, but only if you drop all your other customers.',
    options: [
      { id: 'balance', grade: 'best', effect: { order: { share: 0.2, priceAt: 0.95 } } },
      { id: 'allIn', grade: 'poor', effect: { order: { share: 0.5, priceAt: 0.9 }, base: -0.35 } },
      { id: 'decline', grade: 'ok', effect: {} },
    ],
  },
  {
    id: 'ethics',
    level: 5,
    note: 'A supplier offers you a secret "gift" to keep buying from them at higher prices.',
    options: [
      { id: 'refuse', grade: 'best', effect: { rep: 4 } },
      { id: 'accept', grade: 'poor', effect: { cost: -500, unitCost: 0.12, rep: -12 } },
    ],
  },
];
