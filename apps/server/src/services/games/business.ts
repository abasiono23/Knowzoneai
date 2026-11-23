import { BUDGET_LEVELS, LIFE_EVENTS, type BudgetSetup, type LifeEvent, type Pot } from '../../data/business/budget.js';
import { NEWS, QUIZ, STOCKS, type Sector } from '../../data/business/invest.js';
import { FACTORY_PRODUCTS, MARKET_DAYS, STALL_PRODUCTS, type FactoryProduct, type StallProduct } from '../../data/business/market.js';
import { COMPANIES, DILEMMAS, type Company, type Effect, type Grade } from '../../data/business/startup.js';
import { analystQuestion, analystSeconds, type AnalystKind, type AnalystQuestion } from '../../data/business/analyst.js';
import { random, type Answer, type Outcome, type Progress } from './english.js';

/**
 * The Business District games (Business, Finance & Economics). Four are simulations: each turn the
 * learner decides (hire, budget, price, invest), the server runs the month, day, week or quarter and
 * grades the decision. A run is rebuilt from its seed plus the decisions made so far (kept in
 * `progress.designs`), so nothing the app sends can change what already happened.
 */
export const BUSINESS_GAMES = ['startup-tycoon', 'budget-master', 'market-master', 'profit-quest', 'market-simulator'] as const;
export type BusinessGame = (typeof BUSINESS_GAMES)[number];

/**
 * The ladder: ten levels like the word games, from pocket-money budgeting and a lemonade stall
 * (1 Starter) to company valuation, market structure and case-level strategy (10 Super hard). Levels
 * up to OPEN_LEVELS are open to everyone; later ones open with a star on the level before. Progress
 * from the old five-level ladder keeps its level numbers; old level L's settings now sit at about
 * level 2L − 1, so nobody is credited past what they have shown. As the levels rise the simulations
 * get tighter (less cash, more turns, higher goals, noisier demand, fewer hints) and the analyst's
 * desk at the end of a run asks more, harder questions with more distractors and less time.
 */
export const MAX_LEVEL = 10;
export const OPEN_LEVELS = 4;
export const levelOpen = (level: number, starsOnLevelBefore: number) => level <= OPEN_LEVELS || starsOnLevelBefore > 0;
/** Per level (index 0 = level 1). */
const by = <T>(list: readonly T[], level: number) => list[Math.min(MAX_LEVEL, Math.max(1, level)) - 1]!;
/** The content pools were written for five levels: level L draws from those up to about L ÷ 2. */
const pool = (level: number) => Math.ceil(level / 2);

type Rand = () => number;
function shuffle<T>(r: Rand, list: readonly T[]) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}
const pick = <T>(r: Rand, list: readonly T[]) => list[Math.floor(r() * list.length)]!;
const lvl = (level: number) => Math.min(MAX_LEVEL, Math.max(1, Math.round(level)));
const round2 = (n: number) => Math.round(n * 100) / 100;
/** Returns keep a tenth of a percent. */
const round4 = (n: number) => Math.round(n * 10000) / 10000;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const GRADE_POINTS: Record<Grade, number> = { best: 60, ok: 35, poor: 0 };

type Plan = Record<string, number>;
type Decision = { plan: Plan; choice?: string };
/** The decisions of the simulation turns so far (the analyst's desk questions come after them). */
const decisions = (progress: Progress, turns = Infinity) =>
  Array.from({ length: Math.min(progress.at, turns) }, (_, i) => progress.designs?.[i] as Decision);

// ─── The analyst's desk ───────────────────────────────────────────────────────

/** Which questions each game asks at each level (index 0 = level 1), and how many. */
const DESK: Record<Exclude<BusinessGame, 'profit-quest'>, { kinds: AnalystKind[][]; count: number[] }> = {
  'budget-master': {
    kinds: [
      [],
      ['saveWeeks'],
      ['saveWeeks', 'shareOf'],
      ['shareOf', 'simpleInterest'],
      ['cardInterest', 'simpleInterest'],
      ['compound', 'cardInterest'],
      ['ear', 'realRate', 'compound'],
      ['loanPayment', 'realRate', 'ear'],
      ['taxBands', 'loanPayment', 'ear'],
      ['retirement', 'taxBands', 'loanPayment'],
    ],
    count: [0, 1, 1, 1, 2, 2, 2, 3, 3, 3],
  },
  'market-master': {
    kinds: [
      ['revenue'],
      ['profitDay'],
      ['demandAt', 'profitDay'],
      ['demandAt', 'revenue'],
      ['elasticity', 'demandAt'],
      ['bestPrice', 'elasticity'],
      ['monopolyQ', 'bestPrice'],
      ['hhi', 'monopolyQ', 'elasticity'],
      ['cournot', 'hhi', 'monopolyQ'],
      ['deadweight', 'cournot', 'hhi'],
    ],
    count: [1, 1, 1, 1, 2, 2, 2, 3, 3, 3],
  },
  'market-simulator': {
    kinds: [
      [],
      ['dividendYield'],
      ['portfolioReturn'],
      ['peValue', 'portfolioReturn'],
      ['peValue', 'dividendYield'],
      ['capm', 'peValue'],
      ['sharpe', 'capm'],
      ['gordon', 'sharpe', 'capm'],
      ['bondPrice', 'gordon', 'sharpe'],
      ['twoAssetSd', 'bondPrice', 'gordon'],
    ],
    count: [0, 1, 1, 1, 1, 2, 2, 2, 3, 3],
  },
  'startup-tycoon': {
    kinds: [
      [],
      ['grossMargin'],
      ['runway'],
      ['runway', 'grossMargin'],
      ['ltvCac', 'runway'],
      ['dilution', 'ltvCac'],
      ['evMultiple', 'dilution'],
      ['dcfPerpetuity', 'evMultiple', 'dilution'],
      ['convertible', 'dcfPerpetuity', 'evMultiple'],
      ['twoStageDcf', 'dcfPerpetuity', 'convertible'],
    ],
    count: [0, 1, 1, 1, 1, 2, 2, 2, 3, 3],
  },
};
/** Options per question: four, then five from Proficient (more distractors). */
const optionCount = (level: number) => (level >= 7 ? 5 : 4);

/** The desk questions for a run: the level's kinds in turn, the newest kind first. */
function desk(game: Exclude<BusinessGame, 'profit-quest'>, level: number, r: Rand): AnalystQuestion[] {
  const { kinds, count } = DESK[game];
  const list = by(kinds, level);
  return Array.from({ length: by(count, level) }, (_, k) => analystQuestion(list[k % list.length]!, r, optionCount(level)));
}
const deskOf = (p: { analyst?: AnalystQuestion[] }) => p.analyst ?? [];
/** How many simulation turns a run has (its steps before the desk). */
export function turnsOf(p: BusinessPuzzle) {
  switch (p.kind) {
    case 'startup-tycoon':
      return p.months;
    case 'budget-master':
      return p.income.length;
    case 'market-master':
      return p.days.length;
    case 'profit-quest':
      return p.steps.length;
    case 'market-simulator':
      return p.quarters.length;
  }
}
/** The desk as the app sees it: the question, its options and clock, and once answered the result. */
function deskView(p: BusinessPuzzle, progress: Progress) {
  const turns = turnsOf(p);
  const level = 'level' in p ? (p.level as number) : 1;
  return deskOf(p as { analyst?: AnalystQuestion[] }).map((q, k) => {
    const id = turns + k;
    const result = progress.results[id];
    return {
      id,
      kind: q.kind,
      vars: q.vars,
      options: q.options,
      seconds: analystSeconds(q.kind, level),
      ...(result && { result: { ...result, answer: q.answer, choice: (progress.designs?.[id] as Decision | undefined)?.choice ?? null } }),
    };
  });
}

// ─── Startup Tycoon ───────────────────────────────────────────────────────────

export type Role = 'maker' | 'seller' | 'support';
const ROLES: Role[] = ['maker', 'seller', 'support'];
export const MARKETING = [0, 300, 600, 1200];
const START_CASH = [9000, 8500, 8000, 7500, 7000, 6500, 6000, 5500, 5000, 4500];
const MONTHS = [4, 5, 5, 6, 6, 7, 7, 8, 8, 9];
/** How many customers the market holds, as a multiple of the regulars: past a point, more selling brings few new ones. */
const MARKET_SIZE = 6;
/** The goal, as a share of what a sensible plan reaches (higher levels ask for more). */
const GOAL_SHARE = [0.8, 0.85, 0.88, 0.9, 0.9, 0.92, 0.93, 0.94, 0.95, 0.96];

/** How a company works, from its prices and pay: a maker's output pays for a maker and a seller together. */
export function companyNumbers(c: Company) {
  const margin = c.price - c.unitCost;
  const capPerMaker = Math.round((3.5 * c.salary.maker) / margin);
  return { margin, capPerMaker, perSeller: capPerMaker, founderCap: Math.round(capPerMaker * 0.5), base: capPerMaker };
}

type Firm = {
  cash: number;
  staff: Record<Role, number>;
  morale: number;
  rep: number;
  price: number;
  unitCost: number;
  rent: number;
  makerPay: number;
  baseMod: number;
  capMod: number;
  loans: number;
  /** What's still owed on loans, and what the company owns (machines). */
  loanBalance: number;
  assets: number;
  owned: number;
  lastNet: number;
  bankrupt: boolean;
};

function marketingCustomers(spend: number, margin: number) {
  return Math.round((spend / (0.5 * margin)) * (1 - spend / 3000));
}

/** One month of a company: hiring, the dilemma's effect, sales, costs. Returns the new firm and the month's report. */
function runMonth(p: StartupPuzzle, firm: Firm, d: Decision, month: number) {
  const c = COMPANIES.find((x) => x.id === p.company)!;
  const n = companyNumbers(c);
  const dilemma = DILEMMAS.find((x) => x.id === p.events[month])!;
  const option = dilemma.options.find((o) => o.id === d.choice) ?? dilemma.options.find((o) => o.grade === 'ok') ?? dilemma.options[0]!;
  const e: Effect = option.effect;
  const f: Firm = structuredClone(firm);

  // Hiring and letting people go.
  let hiring = 0;
  let severance = 0;
  for (const role of ROLES) {
    const want = clamp(Math.round(d.plan[role] ?? f.staff[role]), 0, 8);
    const pay = c.salary[role] + (role === 'maker' ? f.makerPay : 0);
    if (want > f.staff[role]) hiring += (want - f.staff[role]) * pay * 0.3;
    if (want < f.staff[role]) {
      severance += (f.staff[role] - want) * pay;
      f.morale -= 8 * (f.staff[role] - want);
    }
    f.staff[role] = want;
  }
  const marketing = MARKETING.includes(d.plan.marketing ?? 0) ? (d.plan.marketing ?? 0) : 0;

  // The dilemma's lasting effects.
  if (e.makerPay) f.makerPay += e.makerPay;
  if (e.loseMaker && f.staff.maker > 0) f.staff.maker -= 1;
  if (e.base) f.baseMod *= 1 + e.base;
  if (e.cap) f.capMod *= 1 + e.cap;
  if (e.unitCost) f.unitCost = round2(f.unitCost * (1 + e.unitCost));
  if (e.price) f.price = round2(f.price * (1 + e.price));
  if (e.rent) f.rent = Math.round(f.rent * (1 + e.rent));
  if (e.loan) {
    f.cash += e.loan.amount;
    f.loans += e.loan.monthly;
    f.loanBalance += e.loan.amount;
  }
  if (e.asset) f.assets += e.asset;
  if (e.sell) f.owned = round2(f.owned * (1 - e.sell));
  f.morale += e.morale ?? 0;
  f.rep += e.rep ?? 0;

  // Sales.
  // A bigger team needs support staff (admin, customer care): each support person looks after four others.
  const overload = Math.max(0, f.staff.maker + f.staff.seller - (4 + 4 * f.staff.support));
  const prod = (0.6 + (0.4 * clamp(f.morale, 0, 100)) / 100) * Math.max(0.4, 1 - 0.07 * overload);
  const capacity = Math.round((n.founderCap + f.staff.maker * n.capPerMaker) * prod * f.capMod * (1 + (e.capNow ?? 0)));
  // Customers: the regulars, what sellers and marketing bring in, all limited by the size of the market.
  const normal = n.base * (0.6 + f.rep / 125) * f.baseMod;
  const reach = normal * (1 + (e.demand ?? 0)) + f.staff.seller * n.perSeller * prod + marketingCustomers(marketing, n.margin);
  const market = normal * MARKET_SIZE;
  const demand = Math.round(market * (1 - Math.exp(-reach / market)));
  const sold = Math.min(capacity, demand);
  const orderUnits = e.order ? Math.min(Math.round(n.base * e.order.share), capacity - sold) : 0;
  const revenue = Math.round(sold * f.price + orderUnits * f.price * (e.order?.priceAt ?? 1));
  const cogs = Math.round((sold + orderUnits) * f.unitCost);
  const payroll = ROLES.reduce((s, role) => s + f.staff[role] * (c.salary[role] + (role === 'maker' ? f.makerPay : 0)), 0);
  const interest = Math.round(f.loanBalance * 0.01);
  const repay = Math.min(f.loans, f.loanBalance + interest);
  f.loanBalance -= repay - interest;
  const other = (e.cost ?? 0) + Math.round(hiring) + severance;
  const net = revenue - cogs - payroll - f.rent - marketing - other - repay;
  f.cash += net;
  // Operating profit: what the business earns month after month, without one-off costs.
  f.lastNet = net + other;

  // People and reputation react to the month.
  const unmet = demand > 0 ? Math.max(0, demand - sold) / demand : 0;
  if (demand > capacity * 1.1) f.morale -= 8;
  f.morale -= 3 * overload;
  f.morale += (70 - f.morale) * 0.2;
  f.rep += 3 * f.staff.support + (unmet > 0.05 ? -Math.round(25 * unmet) : 2) - 2 * overload;
  f.morale = Math.round(clamp(f.morale, 0, 100));
  f.rep = Math.round(clamp(f.rep, 0, 100));
  f.bankrupt = f.cash < 0;
  const burn = net < 0 ? -net : 0;

  const report = {
    month,
    dilemma: dilemma.id,
    choice: option.id,
    grade: option.grade,
    best: dilemma.options.filter((o) => o.grade === 'best').map((o) => o.id),
    demand,
    capacity,
    sold,
    order: orderUnits,
    revenue,
    cogs,
    gross: revenue - cogs,
    payroll,
    rent: f.rent,
    marketing,
    other,
    loan: repay,
    net,
    operating: f.lastNet,
    cash: f.cash,
    morale: f.morale,
    rep: f.rep,
    runway: burn ? Math.max(0, Math.floor(f.cash / burn)) : null,
    margin: revenue ? Math.round(((revenue - cogs) / revenue) * 100) : 0,
    overload,
    market: Math.round(market),
  };
  return { firm: f, report };
}

function startFirm(p: StartupPuzzle): Firm {
  const c = COMPANIES.find((x) => x.id === p.company)!;
  return {
    cash: p.startCash,
    staff: { maker: 1, seller: 1, support: 0 },
    morale: 70,
    rep: 50,
    price: c.price,
    unitCost: c.unitCost,
    rent: c.rent,
    makerPay: 0,
    baseMod: 1,
    capMod: 1,
    loans: 0,
    loanBalance: 0,
    assets: 0,
    owned: 1,
    lastNet: 0,
    bankrupt: false,
  };
}

/** What the founder's share of the company is worth: cash and machines, less what's owed, plus a few months of operating profit. */
export const firmValue = (f: Firm) => Math.round((f.cash + f.assets - f.loanBalance + 3 * Math.max(0, f.lastNet)) * f.owned);

export function replayStartup(p: StartupPuzzle, ds: Decision[]) {
  let firm = startFirm(p);
  const reports: ReturnType<typeof runMonth>['report'][] = [];
  for (let i = 0; i < ds.length && !firm.bankrupt; i++) {
    const m = runMonth(p, firm, ds[i]!, i);
    firm = m.firm;
    reports.push(m.report);
  }
  return { firm, reports };
}

function startupPuzzle(level: number, r: Rand) {
  const company = pick(r, COMPANIES).id;
  const dilemmas = DILEMMAS.filter((x) => x.level <= pool(level));
  const months = by(MONTHS, level);
  // Each month has its own dilemma; long runs repeat the pool (never twice in a row).
  const order = shuffle(r, dilemmas);
  const events = Array.from({ length: months }, (_, k) => order[k % order.length]!.id);
  const startCash = by(START_CASH, level);
  const puzzle = { kind: 'startup-tycoon' as const, level, company, months, startCash, goal: 0, events, analyst: [] as AnalystQuestion[] };
  // The goal: most of what a sensible plan reaches (grow to a balanced team with support, a little
  // marketing, the best choices), so doing nothing falls short and good management gets there.
  const reference = events.map((id, i) => ({
    plan: i === 0 ? { maker: 2, seller: 2, support: 0, marketing: 300 } : { maker: 3, seller: 3, support: 1, marketing: 300 },
    choice: DILEMMAS.find((x) => x.id === id)!.options.find((o) => o.grade === 'best')!.id,
  }));
  puzzle.goal = Math.round((firmValue(replayStartup(puzzle, reference).firm) * by(GOAL_SHARE, level)) / 100) * 100;
  puzzle.analyst = desk('startup-tycoon', level, r);
  return puzzle;
}
type StartupPuzzle = ReturnType<typeof startupPuzzle>;

// ─── Budget Master ────────────────────────────────────────────────────────────

/** Where a month's money can go (besides the fixed bills). */
export const BUDGET_KEYS = ['food', 'fun', 'clothes', 'emergency', 'goal', 'debt'] as const;

type Wallet = { emergency: number; goal: number; debt: number; recurring: { id: string; amount: number }[] };

function budgetPuzzle(level: number, r: Rand) {
  const setup = by(BUDGET_LEVELS, level);
  const income = Array.from({ length: setup.months }, () => {
    const [lo, hi] = setup.income;
    return lo === hi ? lo : Math.round((lo + r() * (hi - lo)) / 50) * 50;
  });
  const order = shuffle(
    r,
    LIFE_EVENTS.filter((e) => e.level <= pool(level)),
  );
  const events = Array.from({ length: setup.months }, (_, k) => order[k % order.length]!.id);
  return { kind: 'budget-master' as const, level, income, events, analyst: desk('budget-master', level, r) };
}
type BudgetPuzzle = ReturnType<typeof budgetPuzzle>;
const setupOf = (p: BudgetPuzzle): BudgetSetup => by(BUDGET_LEVELS, p.level);

/** The bills a month must pay before anything else, including the card's minimum payment. */
export function billsFor(p: BudgetPuzzle, w: Wallet, interest: number) {
  const s = setupOf(p);
  const owed = w.debt + interest;
  return {
    // Bills of nothing (no rent on pocket money) aren't listed.
    ...Object.fromEntries(Object.entries(s.bills).filter(([, v]) => v > 0)),
    ...Object.fromEntries(w.recurring.map((x) => [x.id, x.amount])),
    ...(s.debt && owed > 0 && { minimum: Math.min(s.debt.min, owed) }),
  } as Record<string, number>;
}
const interestOn = (p: BudgetPuzzle, w: Wallet) => Math.round(w.debt * (setupOf(p).debt?.rate ?? 0));

function runBudgetMonth(p: BudgetPuzzle, w0: Wallet, d: Decision, month: number) {
  const s = setupOf(p);
  const w: Wallet = structuredClone(w0);
  const income = p.income[month]!;
  const interest = interestOn(p, w);
  w.debt += interest;
  const bills = billsFor(p, w0, interest);
  const billTotal = Object.values(bills).reduce((a, b) => a + b, 0);
  const plan = Object.fromEntries(BUDGET_KEYS.map((k) => [k, Math.max(0, Math.round(d.plan[k] ?? 0))])) as Record<(typeof BUDGET_KEYS)[number], number>;
  if (!s.debt) plan.debt = 0;

  w.debt -= bills.minimum ?? 0;
  const extra = Math.min(plan.debt, w.debt);
  w.debt -= extra;
  w.emergency += plan.emergency;
  w.goal += plan.goal + (plan.debt - extra);

  // What happened this month, paid from the chosen pot (whatever it can't cover goes on the card).
  const event = LIFE_EVENTS.find((x) => x.id === p.events[month])!;
  const option = event.options.find((o) => o.id === d.choice) ?? event.options.at(-1)!;
  let card = 0;
  const spend = (cost: number, from: Pot) => {
    if (from === 'card') return void (card += cost);
    const have = from === 'fun' ? plan.fun : from === 'emergency' ? w.emergency : w.goal;
    const used = Math.min(have, cost);
    if (from === 'emergency') w.emergency -= used;
    if (from === 'goal') w.goal -= used;
    card += cost - used;
  };
  if (option.cost) spend(option.cost, option.from ?? 'fun');
  if (option.income) w[option.to ?? 'goal'] += option.income;
  if (option.bill) w.recurring.push({ id: event.id, amount: option.bill });
  w.debt += card;

  const saved = plan.emergency + plan.goal + plan.debt;
  const savingRate = saved / income;
  const wantsRate = (plan.fun + plan.clothes) / income;
  const foodOk = plan.food >= s.foodMin;
  let points =
    (foodOk ? 15 : 0) + Math.min(30, Math.round((30 * savingRate) / 0.2)) + (wantsRate <= 0.3 ? 15 : 0) + { best: 30, ok: 15, poor: 0 }[option.grade];
  if (card > 0) points -= 10;
  points = clamp(points, 0, 100);

  return {
    wallet: w,
    report: {
      month,
      income,
      bills,
      billTotal,
      plan,
      event: event.id,
      choice: option.id,
      grade: option.grade,
      best: event.options.filter((o) => o.grade === 'best').map((o) => o.id),
      interest,
      card,
      debt: w.debt,
      emergency: w.emergency,
      goal: w.goal,
      savingRate: Math.round(savingRate * 100),
      wantsRate: Math.round(wantsRate * 100),
      foodOk,
      points,
    },
  };
}

export function replayBudget(p: BudgetPuzzle, ds: Decision[]) {
  let wallet: Wallet = { emergency: 0, goal: 0, debt: setupOf(p).debt?.balance ?? 0, recurring: [] };
  const reports: ReturnType<typeof runBudgetMonth>['report'][] = [];
  ds.forEach((d, i) => {
    const m = runBudgetMonth(p, wallet, d, i);
    wallet = m.wallet;
    reports.push(m.report);
  });
  return { wallet, reports };
}

// ─── Market Master ────────────────────────────────────────────────────────────

const DAYS = [4, 4, 5, 5, 5, 6, 6, 6, 7, 7];
/** From Upper-intermediate, real days differ from the forecast by up to this much either way. */
const DAY_NOISE = [0, 0, 0, 0, 0.08, 0.1, 0.12, 0.14, 0.16, 0.18];
export const STALL_FEE = 10;

function marketPuzzle(level: number, r: Rand) {
  const product = pick(r, STALL_PRODUCTS).id;
  const top = pool(level);
  const kinds = MARKET_DAYS.filter((x) => x.level <= top);
  // Each level's days include the newest kinds of day it introduces (repeating kinds if there are few).
  const fresh = shuffle(
    r,
    kinds.filter((x) => x.level === top),
  );
  const order = [...fresh.slice(0, 2), ...shuffle(r, [...kinds.filter((x) => x.level !== top), ...fresh.slice(2)])];
  const count = by(DAYS, level);
  const spread = by(DAY_NOISE, level);
  const days = shuffle(
    r,
    Array.from({ length: count }, (_, k) => order[k % order.length]!),
  ).map((x) => ({
    id: x.id,
    noise: spread ? round2(1 - spread + r() * 2 * spread) : 1,
  }));
  return { kind: 'market-master' as const, level, product, days, analyst: desk('market-master', level, r) };
}
type MarketPuzzle = ReturnType<typeof marketPuzzle>;

const stall = (p: MarketPuzzle) => STALL_PRODUCTS.find((x) => x.id === p.product)!;
export const priceSteps = (s: StallProduct) => Array.from({ length: Math.round(s.max / 0.25) }, (_, i) => round2((i + 1) * 0.25));

/** The rival's price (if there is one): a share of the price that would be best without them. */
function rivalPrice(s: StallProduct, day: (typeof MARKET_DAYS)[number]) {
  if (!day.rival) return null;
  const best = (s.a / (s.b * (day.sens ?? 1)) + s.cost * (day.costAt ?? 1)) / 2;
  return Math.round((best * day.rival) / 0.25) * 0.25;
}

/** Customers who'd buy at a price on a day. */
export function stallDemand(s: StallProduct, dayId: string, noise: number, price: number) {
  const day = MARKET_DAYS.find((x) => x.id === dayId)!;
  let q = day.shift * (s.a - s.b * (day.sens ?? 1) * price);
  const rival = rivalPrice(s, day);
  if (rival !== null) q += price > rival ? -1.5 * s.b * day.shift * (price - rival) : 0.5 * s.b * day.shift * (rival - price);
  return Math.max(0, Math.round(q * noise));
}

function bestDay(s: StallProduct, dayId: string, noise: number) {
  const day = MARKET_DAYS.find((x) => x.id === dayId)!;
  const cost = s.cost * (day.costAt ?? 1);
  let best = { price: 0, profit: -Infinity, stock: 0 };
  for (const price of priceSteps(s)) {
    const q = stallDemand(s, dayId, noise, price);
    const profit = round2(q * (price - cost) - STALL_FEE);
    if (profit > best.profit) best = { price, profit, stock: q };
  }
  return best;
}

function runDay(p: MarketPuzzle, plan: Plan, i: number) {
  const s = stall(p);
  const { id, noise } = p.days[i]!;
  const dayInfo = MARKET_DAYS.find((x) => x.id === id)!;
  const price = clamp(Math.round((plan.price ?? 0) / 0.25) * 0.25, 0.25, s.max);
  const stock = clamp(Math.round(plan.stock ?? 0), 0, 600);
  const cost = round2(s.cost * (dayInfo.costAt ?? 1));
  const wanted = stallDemand(s, id, noise, price);
  const sold = Math.min(stock, wanted);
  const revenue = round2(sold * price);
  const stockCost = round2(stock * cost);
  const profit = round2(revenue - stockCost - STALL_FEE);
  const best = bestDay(s, id, noise);
  const points = best.profit > 0 ? Math.round(100 * clamp(profit / best.profit, 0, 1)) : profit >= 0 ? 100 : 0;
  return {
    day: id,
    idea: dayInfo.idea,
    price,
    stock,
    cost,
    wanted,
    sold,
    wasted: stock - sold,
    missed: Math.max(0, wanted - stock),
    revenue,
    stockCost,
    fee: STALL_FEE,
    profit,
    bestPrice: best.price,
    bestStock: best.stock,
    bestProfit: best.profit,
    rival: rivalPrice(s, dayInfo),
    points,
  };
}

// ─── Profit Quest ─────────────────────────────────────────────────────────────

export type CalcKind = 'contribution' | 'breakeven' | 'profit' | 'margin' | 'priceForTarget' | 'machine';
/** The business maths each level asks: the factory's own sums, then project appraisal (analyst kinds). */
const CALCS: (CalcKind | AnalystKind)[][] = [
  ['contribution', 'breakeven'],
  ['contribution', 'breakeven', 'profit'],
  ['breakeven', 'profit', 'margin'],
  ['profit', 'margin', 'priceForTarget'],
  ['margin', 'priceForTarget', 'machine'],
  ['priceForTarget', 'machine', 'operatingLeverage'],
  ['machine', 'operatingLeverage', 'npv'],
  ['operatingLeverage', 'npv', 'wacc'],
  ['npv', 'wacc', 'projectNpv'],
  ['wacc', 'projectNpv', 'npv'],
];
const FACTORY_CALCS: readonly string[] = ['contribution', 'breakeven', 'profit', 'margin', 'priceForTarget', 'machine'];
const PROFIT_STEPS = [4, 6, 6, 6, 6, 8, 8, 8, 10, 10];
/** The clock on the factory's own sums (none up to Elementary). */
const CALC_SECONDS = [0, 0, 0, 120, 105, 90, 80, 70, 60, 60];
/** Weekly demand differs from research by up to this much either way (from Upper-intermediate). */
const WEEK_NOISE = [0, 0, 0, 0, 0.06, 0.08, 0.1, 0.12, 0.14, 0.16];
const money = (n: number) => String(round2(n));

function calcQuestion(kind: CalcKind, f: FactoryProduct, r: Rand, count = 4) {
  const best = (f.a / f.b + f.unit) / 2;
  const price = Math.round((best * (0.9 + r() * 0.3)) / f.step) * f.step;
  const unit = f.unit;
  const fixed = f.fixed;
  const per = round2(price - unit);
  const units = Math.round(((fixed / per) * (1.2 + r() * 0.8)) / 10) * 10;
  const nums: Record<string, number> = { price, unit, fixed, units };
  let answer: number;
  let wrong: number[];
  switch (kind) {
    case 'contribution':
      answer = per;
      wrong = [price + unit, price, round2(per - fixed / Math.max(1, units))];
      break;
    case 'breakeven':
      answer = Math.ceil(fixed / per);
      wrong = [Math.ceil(fixed / price), Math.ceil(fixed / unit), Math.ceil(fixed / per) * 2];
      break;
    case 'profit':
      answer = Math.round(units * per - fixed);
      wrong = [Math.round(units * price - fixed), Math.round(units * per), Math.round(units * price - fixed - unit)];
      break;
    case 'margin': {
      const revenue = units * price;
      answer = Math.round(((units * per - fixed) / revenue) * 100);
      wrong = [Math.round((per / price) * 100), Math.round(((units * per - fixed) / (units * unit + fixed)) * 100), answer + 10];
      break;
    }
    case 'priceForTarget': {
      const target = Math.round(fixed / 2 / 100) * 100;
      nums.target = target;
      answer = round2(unit + (fixed + target) / units);
      wrong = [round2(unit + fixed / units), round2((fixed + target) / units), round2(answer + unit)];
      break;
    }
    case 'machine': {
      const extra = Math.round(fixed * 0.3);
      const saving = round2(unit * 0.25);
      nums.extra = extra;
      nums.saving = saving;
      answer = Math.ceil((fixed + extra) / (price - unit + saving));
      wrong = [Math.ceil(fixed / (price - unit + saving)), Math.ceil((fixed + extra) / (price - unit)), Math.ceil((fixed + extra) / per) + 10];
      break;
    }
  }
  const options = [...new Set([answer, ...wrong].map(money))];
  for (let k = 1; options.length < count; k++) {
    const extra = money(answer + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (kind === 'margin' ? 3 : f.step * 7));
    if (!options.includes(extra) && Number(extra) > 0) options.push(extra);
  }
  return { type: 'calc' as const, calc: kind, nums, answer: money(answer), options: shuffle(r, options.slice(0, count)) };
}

function profitPuzzle(level: number, r: Rand) {
  const f = pick(r, FACTORY_PRODUCTS);
  const steps = by(PROFIT_STEPS, level);
  const kinds = by(CALCS, level);
  const spread = by(WEEK_NOISE, level);
  const plan = Array.from({ length: steps }, (_, i) => {
    if (i % 2) return { type: 'week' as const, noise: spread ? round2(1 - spread + r() * 2 * spread) : 1 };
    const kind = kinds[(i / 2) % kinds.length]!;
    return FACTORY_CALCS.includes(kind)
      ? calcQuestion(kind as CalcKind, f, r, optionCount(level))
      : { type: 'analyst' as const, ...analystQuestion(kind as AnalystKind, r, optionCount(level)) };
  });
  return { kind: 'profit-quest' as const, level, product: f.id, steps: plan };
}
type ProfitPuzzle = ReturnType<typeof profitPuzzle>;

type Plant = { unit: number; fixed: number; a: number; inventory: number; machine: boolean; ads: boolean };
const factory = (p: ProfitPuzzle) => FACTORY_PRODUCTS.find((x) => x.id === p.product)!;
export const UPGRADES = { machine: { fixed: 0.25, unit: -0.25 }, ads: { fixed: 0.15, a: 0.2 } };

const weekDemand = (f: FactoryProduct, plant: Plant, noise: number, price: number) => Math.max(0, Math.round((plant.a - f.b * price) * noise));
export const factoryPrices = (f: FactoryProduct) => Array.from({ length: Math.floor(f.a / f.b / f.step) }, (_, i) => round2((i + 1) * f.step));

function bestWeek(f: FactoryProduct, plant: Plant, noise: number) {
  let best = { price: 0, profit: -Infinity };
  for (const price of factoryPrices(f)) {
    const q = weekDemand(f, plant, noise, price);
    const profit = Math.round(q * (price - plant.unit) - plant.fixed);
    if (profit > best.profit) best = { price, profit };
  }
  return best;
}

function runWeek(p: ProfitPuzzle, plant0: Plant, d: Decision, i: number) {
  const f = factory(p);
  const step = p.steps[i] as { type: 'week'; noise: number };
  const plant: Plant = structuredClone(plant0);
  const upgrade = p.level >= 4 && (d.choice === 'machine' || d.choice === 'ads') && !plant[d.choice] ? d.choice : null;
  if (upgrade === 'machine') {
    plant.machine = true;
    plant.fixed = Math.round(plant.fixed * (1 + UPGRADES.machine.fixed));
    plant.unit = round2(plant.unit * (1 + UPGRADES.machine.unit));
  }
  if (upgrade === 'ads') {
    plant.ads = true;
    plant.fixed = Math.round(plant.fixed * (1 + UPGRADES.ads.fixed));
    plant.a = Math.round(plant.a * (1 + UPGRADES.ads.a));
  }
  const prices = factoryPrices(f);
  const price = prices.reduce((a, b) => (Math.abs(b - (d.plan.price ?? 0)) < Math.abs(a - (d.plan.price ?? 0)) ? b : a));
  const made = clamp(Math.round(d.plan.make ?? 0), 0, 5000);
  const wanted = weekDemand(f, plant, step.noise, price);
  const sold = Math.min(wanted, plant.inventory + made);
  plant.inventory += made - sold;
  const storageEach = Math.max(0.5, round2(f.unit * 0.05));
  const revenue = Math.round(sold * price);
  const cogs = Math.round(sold * plant.unit);
  const storage = Math.round(plant.inventory * storageEach);
  const profit = revenue - cogs - plant.fixed - storage;
  const best = bestWeek(f, plant, step.noise);
  const points = best.profit > 0 ? Math.round(100 * clamp(profit / best.profit, 0, 1)) : profit >= best.profit ? 100 : 0;
  return {
    plant,
    report: {
      price,
      made,
      wanted,
      sold,
      inventory: plant.inventory,
      revenue,
      cogs,
      fixed: plant.fixed,
      storage,
      profit,
      unit: plant.unit,
      upgrade,
      breakEven: price > plant.unit ? Math.ceil(plant.fixed / (price - plant.unit)) : null,
      bestPrice: best.price,
      bestProfit: best.profit,
      points,
    },
  };
}

export function replayProfit(p: ProfitPuzzle, ds: Decision[]) {
  const f = factory(p);
  let plant: Plant = { unit: f.unit, fixed: f.fixed, a: f.a, inventory: 0, machine: false, ads: false };
  const reports: Record<number, ReturnType<typeof runWeek>['report']> = {};
  ds.forEach((d, i) => {
    if (p.steps[i]!.type !== 'week') return;
    const w = runWeek(p, plant, d, i);
    plant = w.plant;
    reports[i] = w.report;
  });
  return { plant, reports };
}

// ─── Market Simulator ─────────────────────────────────────────────────────────

const QUARTERS = [4, 4, 4, 5, 5, 6, 6, 6, 7, 7];
export const START_PORTFOLIO = 10_000;

function investPuzzle(level: number, r: Rand) {
  const stocks = (level <= 3 ? STOCKS.slice(0, 4) : STOCKS).map((s) => s.id);
  const quarters = by(QUARTERS, level);
  const news = shuffle(
    r,
    NEWS.filter((n) => n.level <= pool(level)),
  );
  const quiz = shuffle(
    r,
    QUIZ.filter((q) => q.level <= pool(level)),
  );
  const plan = Array.from({ length: quarters }, (_, i) => {
    const headlines = [news[(i * 2) % news.length]!.id, ...(level >= 5 && r() < (level >= 8 ? 0.8 : 0.5) ? [news[(i * 2 + 1) % news.length]!.id] : [])];
    const market = round2(-0.04 + r() * 0.1);
    const noise = Object.fromEntries(stocks.map((id) => [id, round2(r() * 2 - 1)]));
    return { news: [...new Set(headlines)], quiz: quiz[i % quiz.length]!.id, market, noise };
  });
  return { kind: 'market-simulator' as const, level, stocks, quarters: plan, analyst: desk('market-simulator', level, r) };
}
type InvestPuzzle = ReturnType<typeof investPuzzle>;

/** Assets you can hold. Fees a quarter (from level 3): a stock costs more to hold than an index fund. */
export const assetsOf = (p: InvestPuzzle) => ['cash', 'bonds', 'index', ...p.stocks];
/** The most in one company before it counts as too concentrated (from Upper-intermediate). */
const concentrationLimit = (level: number) => (level >= 9 ? 30 : level >= 7 ? 35 : 40);
const FEES: Record<string, number> = { cash: 0, bonds: 0.001, index: 0.0005 };
const STOCK_FEE = 0.003;

export function quarterReturns(p: InvestPuzzle, i: number) {
  const q = p.quarters[i]!;
  const effect = (sector: Sector) =>
    q.news.reduce((s, id) => s + (NEWS.find((n) => n.id === id)!.effect[sector] ?? 0) + (NEWS.find((n) => n.id === id)!.effect.all ?? 0), 0);
  const stocks = Object.fromEntries(
    p.stocks.map((id) => {
      const s = STOCKS.find((x) => x.id === id)!;
      return [id, round4(s.drift + q.market + effect(s.sector) + q.noise[id]! * s.vol) || 0];
    }),
  );
  const index = round4(Object.values(stocks).reduce((a, b) => a + b, 0) / p.stocks.length);
  return { cash: 0.004, bonds: round4(0.012 + q.market * 0.1), index, ...stocks } as Record<string, number>;
}

function runQuarter(p: InvestPuzzle, value: number, d: Decision, i: number) {
  const assets = assetsOf(p);
  const weights = Object.fromEntries(assets.map((a) => [a, clamp(Math.round((d.plan[a] ?? 0) / 10) * 10, 0, 100) / 100]));
  const returns = quarterReturns(p, i);
  const fees = p.level >= 5 ? assets.reduce((s, a) => s + weights[a]! * (FEES[a] ?? STOCK_FEE), 0) : 0;
  const r = assets.reduce((s, a) => s + weights[a]! * returns[a]!, 0) - fees;
  const after = Math.round(value * (1 + r));
  const topStock = Math.max(0, ...p.stocks.map((s) => weights[s]!));
  const concentrated = p.level >= 5 && topStock > concentrationLimit(p.level) / 100;
  const quiz = QUIZ.find((x) => x.id === p.quarters[i]!.quiz)!;
  const right = d.choice === String(quiz.answer);
  const perf = clamp(30 + Math.round((r - returns.index!) * 400), 0, 60);
  const points = clamp((right ? 40 : 0) + perf - (concentrated ? 15 : 0), 0, 100);
  return {
    value: after,
    report: {
      quarter: i,
      returns,
      weights,
      ret: round4(r),
      fees: round4(fees),
      before: value,
      value: after,
      index: returns.index!,
      concentrated,
      quiz: quiz.id,
      answer: String(quiz.answer),
      choice: d.choice ?? null,
      right,
      points,
    },
  };
}

export function replayInvest(p: InvestPuzzle, ds: Decision[]) {
  let value = START_PORTFOLIO;
  let index = START_PORTFOLIO;
  const reports: (ReturnType<typeof runQuarter>['report'] & { indexValue: number })[] = [];
  ds.forEach((d, i) => {
    const q = runQuarter(p, value, d, i);
    value = q.value;
    index = Math.round(index * (1 + q.report.index));
    reports.push({ ...q.report, indexValue: index });
  });
  return { value, index, reports };
}

// ─── Building runs ────────────────────────────────────────────────────────────

export type BusinessPuzzle = StartupPuzzle | BudgetPuzzle | MarketPuzzle | ProfitPuzzle | InvestPuzzle;
export type BusinessState = { puzzle: BusinessPuzzle; progress: Progress };

export function buildBusinessPuzzle(game: BusinessGame, level: number, seed: string): BusinessPuzzle {
  const r = random(`${game}:${level}:${seed}`);
  const L = lvl(level);
  switch (game) {
    case 'startup-tycoon':
      return startupPuzzle(L, r);
    case 'budget-master':
      return budgetPuzzle(L, r);
    case 'market-master':
      return marketPuzzle(L, r);
    case 'profit-quest':
      return profitPuzzle(L, r);
    case 'market-simulator':
      return investPuzzle(L, r);
  }
}

/** The simulation turns, then the analyst's desk questions. */
export function businessStepCount(p: BusinessPuzzle) {
  return turnsOf(p) + deskOf(p as { analyst?: AnalystQuestion[] }).length;
}

// ─── What the app sees ────────────────────────────────────────────────────────

export function businessPublicState(state: BusinessState) {
  const { puzzle: p } = state;
  const level = 'level' in p ? (p.level as number) : 1;
  // Hints (exact research, each maker's output) fade from Proficient.
  return { level, hints: level <= 6, turns: turnsOf(p), analyst: deskView(p, state.progress), ...gameView(state) };
}

function gameView({ puzzle: p, progress }: BusinessState) {
  const ds = decisions(progress, turnsOf(p));
  switch (p.kind) {
    case 'startup-tycoon': {
      const { firm, reports } = replayStartup(p, ds);
      const c = COMPANIES.find((x) => x.id === p.company)!;
      const n = companyNumbers(c);
      return {
        company: p.company,
        months: p.months,
        goal: p.goal,
        startCash: p.startCash,
        salary: { ...c.salary, maker: c.salary.maker + firm.makerPay },
        perMaker: n.capPerMaker,
        perSeller: n.perSeller,
        firm: { ...firm, value: firmValue(firm) },
        dilemmas: p.events.map((id, i) => ({
          id,
          options: DILEMMAS.find((x) => x.id === id)!.options.map((o) => o.id),
          ...(reports[i] && { report: reports[i] }),
        })),
      };
    }
    case 'budget-master': {
      const { wallet, reports } = replayBudget(p, ds);
      const s = setupOf(p);
      const at = Math.min(progress.at, p.income.length - 1);
      return {
        income: p.income,
        foodMin: s.foodMin,
        goal: s.goal,
        emergencyTarget: s.emergencyTarget,
        debtRate: s.debt?.rate ?? 0,
        wallet,
        bills: billsFor(p, wallet, interestOn(p, wallet)),
        interest: interestOn(p, wallet),
        events: p.events.map((id, i) => ({
          id,
          options: LIFE_EVENTS.find((x) => x.id === id)!.options.map((o) => ({
            id: o.id,
            cost: o.cost ?? 0,
            income: o.income ?? 0,
            bill: o.bill ?? 0,
            from: o.from ?? null,
          })),
          ...(reports[i] && { report: reports[i] }),
        })),
        keys: BUDGET_KEYS.filter((k) => k !== 'debt' || !!s.debt),
        at,
      };
    }
    case 'market-master': {
      const s = stall(p);
      return {
        product: p.product,
        cost: s.cost,
        fee: STALL_FEE,
        maxPrice: s.max,
        days: p.days.map((d, i) => {
          const day = MARKET_DAYS.find((x) => x.id === d.id)!;
          const cost = round2(s.cost * (day.costAt ?? 1));
          const prices = [0.3, 0.5, 0.7].map((share) => Math.round((s.max * share) / 0.25) * 0.25);
          return {
            id: d.id,
            cost,
            rival: rivalPrice(s, day),
            // Market research: exact up to level 3, then only a forecast (and yesterday's sales).
            ...(p.level <= 4 && { research: prices.map((price) => ({ price, customers: stallDemand(s, d.id, d.noise, price) })) }),
            ...(i < progress.at && { report: runDay(p, (progress.designs?.[i] as Decision).plan, i) }),
          };
        }),
      };
    }
    case 'profit-quest': {
      const f = factory(p);
      const { plant, reports } = replayProfit(p, ds);
      const prices = factoryPrices(f);
      const research = [prices[Math.floor(prices.length * 0.35)]!, prices[Math.floor(prices.length * 0.6)]!];
      return {
        product: p.product,
        step: f.step,
        plant,
        upgrades: p.level >= 4,
        maxPrice: prices.at(-1)!,
        steps: p.steps.map((s, i) => {
          if (s.type === 'analyst') {
            const result = progress.results[i];
            return {
              type: s.type,
              kind: s.kind,
              vars: s.vars,
              options: s.options,
              seconds: analystSeconds(s.kind, p.level),
              ...(result && { result: { ...result, answer: s.answer, choice: (progress.designs?.[i] as Decision | undefined)?.choice } }),
            };
          }
          if (s.type === 'calc') {
            const { answer, ...q } = s;
            return {
              ...q,
              seconds: by(CALC_SECONDS, p.level),
              ...(progress.results[i] && { result: { ...progress.results[i], answer, choice: (progress.designs?.[i] as Decision | undefined)?.choice } }),
            };
          }
          return {
            type: s.type,
            // Research: exact at first, a forecast from Upper-intermediate, none at Master and above.
            ...(i <= progress.at &&
              p.level <= 8 && {
                research: research.map((price) => ({ price, customers: weekDemand(f, plant, 1, price), about: p.level >= 5 })),
              }),
            ...(reports[i] && { report: reports[i] }),
          };
        }),
      };
    }
    case 'market-simulator': {
      const { value, index, reports } = replayInvest(p, ds);
      return {
        stocks: p.stocks.map((id) => {
          const s = STOCKS.find((x) => x.id === id)!;
          return { id, sector: s.sector, risk: s.vol >= 0.1 ? 'high' : s.vol >= 0.07 ? 'medium' : 'low' };
        }),
        assets: assetsOf(p),
        value,
        index,
        fees: p.level >= 5,
        limit: p.level >= 5 ? concentrationLimit(p.level) : null,
        quarters: p.quarters.map((q, i) => ({
          news: q.news,
          quiz: { id: q.quiz, options: QUIZ.find((x) => x.id === q.quiz)!.options },
          ...(reports[i] && { report: reports[i] }),
        })),
      };
    }
  }
}

// ─── Checking ─────────────────────────────────────────────────────────────────

export type BusinessAnswer = Answer & { plan?: Plan };
type Checked = Outcome & { store?: Record<string, unknown> };
const retry = (why: string): Checked => ({ correct: false, points: 0, heartLost: false, retry: true, advance: false, reveal: { end: why } });

export function businessCheck({ puzzle: p, progress }: BusinessState, a: BusinessAnswer): Checked {
  const at = progress.at;
  const ds = decisions(progress, turnsOf(p));
  const plan = a.plan ?? {};
  const decision: Decision = { plan, ...(a.choice !== undefined && { choice: a.choice }) };
  const done = (points: number, correct: boolean, heartLost: boolean, reveal: Record<string, unknown>): Checked => ({
    correct,
    points,
    heartLost,
    advance: true,
    reveal,
    store: { designs: decision },
  });
  // The analyst's desk, after the simulation turns.
  const turns = turnsOf(p);
  if (at >= turns) {
    const q = deskOf(p as { analyst?: AnalystQuestion[] })[at - turns];
    if (!q) return retry('invalid');
    const correct = !a.timeout && a.choice === q.answer;
    return done(correct ? 100 : 0, correct, !correct, { answer: q.answer, kind: q.kind });
  }
  switch (p.kind) {
    case 'startup-tycoon': {
      const dilemma = DILEMMAS.find((x) => x.id === p.events[at])!;
      if (!dilemma.options.some((o) => o.id === a.choice)) return retry('choose');
      if (plan.marketing !== undefined && !MARKETING.includes(plan.marketing)) return retry('invalid');
      const { firm } = replayStartup(p, ds);
      for (const role of ROLES)
        if (plan[role] !== undefined && (plan[role] < 0 || plan[role] > 8 || Math.abs(plan[role] - firm.staff[role]) > 2)) return retry('invalid');
      const { firm: after, report } = runMonth(p, firm, decision, at);
      const points = GRADE_POINTS[report.grade] + (report.net >= 0 ? 40 : 0);
      return done(points, points >= 60, report.grade === 'poor' || after.bankrupt, { report, value: firmValue(after), bankrupt: after.bankrupt });
    }
    case 'budget-master': {
      const event = LIFE_EVENTS.find((x) => x.id === p.events[at])!;
      if (!event.options.some((o) => o.id === a.choice)) return retry('choose');
      const { wallet } = replayBudget(p, ds);
      const bills = billsFor(p, wallet, interestOn(p, wallet));
      const keys = Object.keys(plan);
      if (keys.some((k) => !(BUDGET_KEYS as readonly string[]).includes(k) || !Number.isInteger(plan[k]) || plan[k]! < 0)) return retry('invalid');
      const total = Object.values(bills).reduce((x, y) => x + y, 0) + keys.reduce((s, k) => s + plan[k]!, 0);
      if (total !== p.income[at]) return retry('unbalanced');
      const { report } = runBudgetMonth(p, wallet, decision, at);
      return done(report.points, report.points >= 60, report.grade === 'poor' || !report.foodOk, { report });
    }
    case 'market-master': {
      if (!(plan.price! > 0) || !(plan.stock! >= 0)) return retry('invalid');
      const report = runDay(p, plan, at);
      return done(report.points, report.points >= 60, report.profit < 0, { report });
    }
    case 'profit-quest': {
      const step = p.steps[at]!;
      if (step.type === 'analyst') {
        const correct = !a.timeout && a.choice === step.answer;
        return done(correct ? 100 : 0, correct, !correct, { answer: step.answer, kind: step.kind });
      }
      if (step.type === 'calc') {
        const correct = !a.timeout && a.choice === step.answer;
        return done(correct ? 100 : 0, correct, !correct, { answer: step.answer, calc: step.calc });
      }
      if (!(plan.price! > 0) || !(plan.make! >= 0)) return retry('invalid');
      const { plant } = replayProfit(p, ds);
      const { report } = runWeek(p, plant, decision, at);
      return done(report.points, report.points >= 60, report.profit < 0, { report });
    }
    case 'market-simulator': {
      const assets = assetsOf(p);
      const keys = Object.keys(plan);
      if (keys.some((k) => !assets.includes(k) || plan[k]! < 0 || plan[k]! % 10 !== 0)) return retry('invalid');
      if (keys.reduce((s, k) => s + plan[k]!, 0) !== 100) return retry('unbalanced');
      const { value } = replayInvest(p, ds);
      const { report } = runQuarter(p, value, decision, at);
      return done(report.points, report.right, !report.right, { report });
    }
  }
}

export function businessIsOver({ puzzle: p, progress }: BusinessState, hearts: number) {
  if (hearts <= 0 || progress.at >= businessStepCount(p)) return true;
  return p.kind === 'startup-tycoon' && replayStartup(p, decisions(progress, turnsOf(p))).firm.bankrupt;
}

export function businessStars({ puzzle: p, progress }: BusinessState) {
  const results = Object.values(progress.results);
  const total = businessStepCount(p);
  const points = results.reduce((s, x) => s + x.points, 0);
  const share = points / (total * 100);
  if (p.kind === 'startup-tycoon') {
    const { firm, reports } = replayStartup(p, decisions(progress, turnsOf(p)));
    if (firm.bankrupt || reports.length < turnsOf(p)) return 0;
    const reached = firmValue(firm) >= p.goal;
    const desk = deskOf(p);
    const deskShare = desk.length ? desk.reduce((s, _, k) => s + (progress.results[turnsOf(p) + k]?.points ?? 0), 0) / (100 * desk.length) : 1;
    const stars = reached && !reports.some((x) => x.grade === 'poor') ? 3 : reached || share >= 0.75 ? 2 : 1;
    return deskShare < 0.5 ? Math.min(2, stars) : stars;
  }
  if (p.kind === 'budget-master') {
    const { wallet } = replayBudget(p, decisions(progress, turnsOf(p)));
    const goal = wallet.goal >= setupOf(p).goal.amount;
    return share >= 0.85 && goal ? 3 : share >= 0.6 ? 2 : share >= 0.3 ? 1 : 0;
  }
  return share >= 0.85 ? 3 : share >= 0.6 ? 2 : share >= 0.3 ? 1 : 0;
}

/** What Kora needs to help on the current step (Kora is told to guide, not to give the answer away). */
export function businessHelpContext({ puzzle: p, progress }: BusinessState) {
  const at = Math.min(progress.at, businessStepCount(p) - 1);
  const asked = at >= turnsOf(p) ? deskOf(p as { analyst?: AnalystQuestion[] })[at - turnsOf(p)] : p.kind === 'profit-quest' && p.steps[at]?.type === 'analyst' ? (p.steps[at] as AnalystQuestion) : null;
  if (asked)
    return `Business and finance maths question (kind "${asked.kind}") with these numbers: ${JSON.stringify(asked.vars)}. Options: ${asked.options.join('; ')}. Correct: ${asked.answer}. Explain the method and formula step by step with the learner's numbers, but don't give the final answer or say which option is right.`;
  const ds = decisions(progress, turnsOf(p));
  switch (p.kind) {
    case 'startup-tycoon': {
      const c = COMPANIES.find((x) => x.id === p.company)!;
      const n = companyNumbers(c);
      const { firm } = replayStartup(p, ds);
      const d = DILEMMAS.find((x) => x.id === p.events[at])!;
      return `Business simulation: the learner runs ${c.note}, month ${at + 1} of ${p.months}. Each sale: price $${firm.price}, cost $${firm.unitCost}. Staff: ${firm.staff.maker} makers (each can make about ${n.capPerMaker} a month, $${c.salary.maker + firm.makerPay}/month), ${firm.staff.seller} sellers (each brings about ${n.perSeller} customers, $${c.salary.seller}/month), ${firm.staff.support} support (raise reputation, $${c.salary.support}/month). Cash $${firm.cash}, morale ${firm.morale}, reputation ${firm.rep}, rent $${firm.rent}. Goal: founder's share worth $${p.goal}. This month's dilemma: ${d.note} Options: ${d.options.map((o) => `${o.id} (${o.grade})`).join(', ')}. Teach the management idea (capacity vs demand, unit economics, cash flow, retention, debt, dilution); don't say which option is best.`;
    }
    case 'budget-master': {
      const { wallet } = replayBudget(p, ds);
      const s = setupOf(p);
      const e = LIFE_EVENTS.find((x) => x.id === p.events[at])!;
      return `Personal budgeting game, month ${at + 1}. Income $${p.income[at]}. Fixed bills: ${JSON.stringify(billsFor(p, wallet, interestOn(p, wallet)))}. Food needs at least $${s.foodMin}. Emergency fund $${wallet.emergency} (target $${s.emergencyTarget}), savings for a ${s.goal.id} $${wallet.goal} of $${s.goal.amount}, credit card debt $${wallet.debt}${s.debt ? ` at ${s.debt.rate * 100}% a month` : ''}. Scoring: needs first, save at least 20%, wants at most 30%, avoid new card debt. This month: ${e.note} Options: ${e.options.map((o) => `${o.id} (${o.grade})`).join(', ')}. Explain 50/30/20, emergency funds, interest; don't give the exact numbers or the best option.`;
    }
    case 'market-master': {
      const s = stall(p);
      const d = p.days[at]!;
      const day = MARKET_DAYS.find((x) => x.id === d.id)!;
      const best = bestDay(s, d.id, d.noise);
      return `Market stall game selling ${s.id}. Stock costs $${round2(s.cost * (day.costAt ?? 1))} each, stall fee $${STALL_FEE}, unsold stock is wasted. Today: ${day.note} Normal demand is about ${s.a} − ${s.b} × price customers${day.rival ? `; a rival sells at $${rivalPrice(s, day)}` : ''}. The best price today is about $${best.price} with about ${best.stock} sold. Explain supply and demand, price vs quantity and waste; hint at the direction, don't give the price.`;
    }
    case 'profit-quest': {
      const step = p.steps[at]!;
      const f = factory(p);
      if (step.type === 'calc')
        return `Business maths (${step.calc}) about a factory making ${f.id}: ${JSON.stringify(step.nums)}. Correct answer: ${step.answer}. Explain the formula (contribution = price − variable cost; break-even = fixed costs ÷ contribution; profit = units × contribution − fixed costs; margin = profit ÷ revenue); don't say the answer.`;
      const { plant } = replayProfit(p, ds);
      const best = bestWeek(f, plant, (step as { noise: number }).noise);
      return `Factory week making ${f.id}: variable cost $${plant.unit} each, fixed costs $${plant.fixed} a week, demand about ${plant.a} − ${f.b} × price, ${plant.inventory} in stock, storage costs for leftovers. Best price about $${best.price}. Explain making as many as you can sell, break-even and the price trade-off; don't give the numbers.`;
    }
    case 'market-simulator': {
      const q = p.quarters[at]!;
      const quiz = QUIZ.find((x) => x.id === q.quiz)!;
      return `Practice investing game (made-up companies, no real money), quarter ${at + 1}. Assets: cash, bonds, an index fund and ${p.stocks.join(', ')}. News: ${q.news.map((id) => NEWS.find((n) => n.id === id)!.note).join(' ')} The quiz question is "${quiz.id}" (option ${quiz.answer + 1} of ${quiz.options} is right). Explain diversification, risk and return, hype; never promise returns and don't give the quiz answer.`;
    }
  }
}

export type { LifeEvent };
