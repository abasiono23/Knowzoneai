/**
 * Budget Master: the life a month's money has to cover, and things that happen in a month. Words
 * live in the app (by id); `note` is English for Kora. An option's money comes out of a pot: the
 * month's fun money, the emergency fund, savings, or the credit card (debt, with interest).
 */
export type Pot = 'fun' | 'emergency' | 'goal' | 'card';
export type LifeOption = { id: string; grade: 'best' | 'ok' | 'poor'; cost?: number; from?: Pot; income?: number; to?: 'goal' | 'emergency'; bill?: number };
export type LifeEvent = { id: string; level: number; options: LifeOption[]; note: string };

export const LIFE_EVENTS: LifeEvent[] = [
  {
    id: 'concert',
    level: 1,
    note: 'A friend invites you to a concert that costs $80.',
    options: [
      { id: 'funMoney', grade: 'best', cost: 80, from: 'fun' },
      { id: 'freePlan', grade: 'best' },
      { id: 'card', grade: 'poor', cost: 80, from: 'card' },
    ],
  },
  {
    id: 'phone',
    level: 1,
    note: 'Your phone screen cracks; a repair costs $150.',
    options: [
      { id: 'emergency', grade: 'best', cost: 150, from: 'emergency' },
      { id: 'card', grade: 'ok', cost: 150, from: 'card' },
      { id: 'newPhone', grade: 'poor', cost: 700, from: 'card' },
    ],
  },
  {
    id: 'sale',
    level: 1,
    note: 'A shop has a "50% off today only" sale on trainers you don\'t need: $120.',
    options: [
      { id: 'skip', grade: 'best' },
      { id: 'funMoney', grade: 'ok', cost: 120, from: 'fun' },
      { id: 'card', grade: 'poor', cost: 120, from: 'card' },
    ],
  },
  {
    id: 'gift',
    level: 1,
    note: "It's your mum's birthday.",
    options: [
      { id: 'funMoney', grade: 'best', cost: 40, from: 'fun' },
      { id: 'handmade', grade: 'best', cost: 5, from: 'fun' },
      { id: 'card', grade: 'poor', cost: 150, from: 'card' },
    ],
  },
  {
    id: 'bonus',
    level: 1,
    note: 'You earn a $300 bonus at work.',
    options: [
      { id: 'save', grade: 'best', income: 300, to: 'goal' },
      { id: 'split', grade: 'best', income: 240, to: 'goal' },
      { id: 'spend', grade: 'poor' },
    ],
  },
  {
    id: 'scam',
    level: 1,
    note: 'A group chat promises to "double your money in a week".',
    options: [
      { id: 'ignore', grade: 'best' },
      { id: 'invest', grade: 'poor', cost: 200, from: 'goal' },
    ],
  },
  {
    id: 'bike',
    level: 2,
    note: 'Your bike for getting to work needs a $220 repair.',
    options: [
      { id: 'emergency', grade: 'best', cost: 220, from: 'emergency' },
      { id: 'card', grade: 'ok', cost: 220, from: 'card' },
      { id: 'taxis', grade: 'poor', cost: 380, from: 'card' },
    ],
  },
  {
    id: 'subscription',
    level: 2,
    note: 'A free streaming trial ends; it will now cost $15 every month.',
    options: [
      { id: 'cancel', grade: 'best' },
      { id: 'keep', grade: 'ok', bill: 15 },
    ],
  },
  {
    id: 'sideHustle',
    level: 2,
    note: 'You can tutor on weekends for an extra $150.',
    options: [
      { id: 'takeSave', grade: 'best', income: 150, to: 'goal' },
      { id: 'decline', grade: 'ok' },
    ],
  },
  {
    id: 'dentist',
    level: 2,
    note: 'You have a toothache; the dentist costs $180.',
    options: [
      { id: 'emergency', grade: 'best', cost: 180, from: 'emergency' },
      { id: 'card', grade: 'ok', cost: 180, from: 'card' },
      { id: 'wait', grade: 'poor', cost: 450, from: 'card' },
    ],
  },
  {
    id: 'loanApp',
    level: 3,
    note: 'An app offers an instant $500 loan, to pay back $650 in two weeks.',
    options: [
      { id: 'decline', grade: 'best' },
      { id: 'take', grade: 'poor', cost: 150, from: 'card' },
    ],
  },
  {
    id: 'foodPrices',
    level: 3,
    note: 'Food prices go up by 10% this month.',
    options: [
      { id: 'cutWants', grade: 'best', cost: 30, from: 'fun' },
      { id: 'card', grade: 'poor', cost: 30, from: 'card' },
    ],
  },
  {
    id: 'bankFees',
    level: 3,
    note: 'Your bank account charges $12 of fees every month.',
    options: [
      { id: 'switch', grade: 'best' },
      { id: 'stay', grade: 'ok', bill: 12 },
    ],
  },
  {
    id: 'friendLoan',
    level: 4,
    note: 'A friend asks to borrow $100.',
    options: [
      { id: 'afford', grade: 'best', cost: 100, from: 'fun' },
      { id: 'kindNo', grade: 'best' },
      { id: 'savings', grade: 'poor', cost: 100, from: 'emergency' },
    ],
  },
  {
    id: 'matching',
    level: 4,
    note: 'Your employer adds $1 to your retirement savings for every $1 you put in, up to $100 a month.',
    options: [
      { id: 'join', grade: 'best', cost: 100, from: 'fun', income: 200, to: 'goal' },
      { id: 'later', grade: 'ok' },
    ],
  },
  {
    id: 'carDeal',
    level: 5,
    note: 'A dealer offers a shiny car "for only $250 a month" over 6 years.',
    options: [
      { id: 'decline', grade: 'best' },
      { id: 'sign', grade: 'poor', bill: 250 },
    ],
  },
];

/** Each level's month: income (a range when it varies), fixed bills, what food really costs, a debt, and goals. */
export type BudgetSetup = {
  months: number;
  income: [number, number];
  bills: { rent: number; utilities: number; phone: number; transport: number };
  foodMin: number;
  debt?: { balance: number; rate: number; min: number };
  goal: { id: 'laptop' | 'bike' | 'course' | 'travel' | 'deposit'; amount: number };
  emergencyTarget: number;
};

export const BUDGET_LEVELS: BudgetSetup[] = [
  {
    months: 3,
    income: [1200, 1200],
    bills: { rent: 450, utilities: 60, phone: 25, transport: 80 },
    foodMin: 180,
    goal: { id: 'laptop', amount: 300 },
    emergencyTarget: 300,
  },
  {
    months: 4,
    income: [1600, 1600],
    bills: { rent: 600, utilities: 80, phone: 30, transport: 100 },
    foodMin: 220,
    goal: { id: 'bike', amount: 500 },
    emergencyTarget: 500,
  },
  {
    months: 4,
    income: [2000, 2000],
    bills: { rent: 700, utilities: 90, phone: 40, transport: 120 },
    foodMin: 260,
    debt: { balance: 800, rate: 0.02, min: 40 },
    goal: { id: 'laptop', amount: 600 },
    emergencyTarget: 700,
  },
  {
    months: 5,
    income: [1900, 2600],
    bills: { rent: 750, utilities: 90, phone: 40, transport: 130 },
    foodMin: 280,
    debt: { balance: 1200, rate: 0.02, min: 50 },
    goal: { id: 'course', amount: 900 },
    emergencyTarget: 1000,
  },
  {
    months: 6,
    income: [2100, 3000],
    bills: { rent: 800, utilities: 100, phone: 45, transport: 140 },
    foodMin: 300,
    debt: { balance: 1600, rate: 0.025, min: 60 },
    goal: { id: 'deposit', amount: 1500 },
    emergencyTarget: 1400,
  },
];
