/**
 * The analyst's desk: business and finance questions whose numbers are made and checked in code, for
 * the upper levels of the Business District games (personal finance up to retirement maths, market
 * structure up to deadweight loss, project appraisal, investing up to portfolio risk, and startup
 * valuation up to a two-stage DCF). Every answer is computed here; the wrong options are the mistakes
 * people really make (forgetting to discount, using the wrong rate, dropping a step), so a guess
 * rarely lands. The words live in the app (lib/games/business-text.ts, by kind) and take `vars`.
 */
export type Rand = () => number;

export const ANALYST_KINDS = [
  // Personal finance (Budget Master)
  'saveWeeks',
  'shareOf',
  'simpleInterest',
  'cardInterest',
  'compound',
  'realRate',
  'ear',
  'loanPayment',
  'taxBands',
  'retirement',
  // Markets (Market Master)
  'revenue',
  'profitDay',
  'demandAt',
  'elasticity',
  'bestPrice',
  'monopolyQ',
  'hhi',
  'cournot',
  'deadweight',
  // Projects (Profit Quest)
  'operatingLeverage',
  'npv',
  'wacc',
  'projectNpv',
  // Investing (Market Simulator)
  'dividendYield',
  'portfolioReturn',
  'peValue',
  'capm',
  'sharpe',
  'gordon',
  'bondPrice',
  'twoAssetSd',
  // Startups (Startup Tycoon)
  'grossMargin',
  'runway',
  'ltvCac',
  'dilution',
  'evMultiple',
  'dcfPerpetuity',
  'convertible',
  'twoStageDcf',
] as const;
export type AnalystKind = (typeof ANALYST_KINDS)[number];

/** How long a question takes to work out: seconds on the clock before the level's factor. */
export const KIND_SECONDS: Record<AnalystKind, number> = {
  saveWeeks: 50,
  shareOf: 45,
  simpleInterest: 60,
  cardInterest: 45,
  compound: 75,
  realRate: 75,
  ear: 75,
  loanPayment: 120,
  taxBands: 120,
  retirement: 120,
  revenue: 40,
  profitDay: 50,
  demandAt: 60,
  elasticity: 100,
  bestPrice: 75,
  monopolyQ: 75,
  hhi: 75,
  cournot: 90,
  deadweight: 120,
  operatingLeverage: 90,
  npv: 120,
  wacc: 100,
  projectNpv: 180,
  dividendYield: 45,
  portfolioReturn: 60,
  peValue: 45,
  capm: 60,
  sharpe: 60,
  gordon: 75,
  bondPrice: 150,
  twoAssetSd: 150,
  grossMargin: 45,
  runway: 50,
  ltvCac: 90,
  dilution: 90,
  evMultiple: 75,
  dcfPerpetuity: 75,
  convertible: 90,
  twoStageDcf: 210,
};

export type AnalystQuestion = {
  kind: AnalystKind;
  /** Values for the question's words, already written out ("$1,200", "8%"). */
  vars: Record<string, string>;
  answer: string;
  options: string[];
};

// ─── Writing numbers ──────────────────────────────────────────────────────────

const round = (n: number, dp: number) => Math.round(n * 10 ** dp) / 10 ** dp;
/**
 * "1,234.5": commas between thousands, at most `dp` decimals (exactly `dp` when `fixed`). Written by
 * hand because toLocaleString is slow enough on some servers to matter when building a run.
 */
function group(n: number, dp: number, fixed = false) {
  const r = round(Math.abs(n), dp);
  const [whole = '0', frac = ''] = (fixed ? r.toFixed(dp) : String(r)).split('.');
  const digits = whole.includes('e') ? Math.round(r).toFixed(0) : whole;
  let out = '';
  for (let k = 0; k < digits.length; k++) out += (k > 0 && (digits.length - k) % 3 === 0 ? ',' : '') + digits[k];
  return `${n < 0 && r !== 0 ? '−' : ''}${out}${frac ? `.${frac}` : ''}`;
}
/** "$1,234" or "$12.50"; whole numbers lose their cents. */
export function usd(n: number) {
  const r = round(n, 2);
  return `${r < 0 ? '−' : ''}$${group(Math.abs(r), 2, !Number.isInteger(r))}`;
}
/** Whole dollars, for big amounts. */
const usd0 = (n: number) => usd(Math.round(n));
/** A share as a percent with up to one decimal: 0.125 → "12.5%". */
export const pct = (share: number, dp = 1) => `${group(share * 100, dp, dp === 2)}%`;
const num = (n: number, dp = 0) => group(n, dp, true);

// ─── Picking numbers ──────────────────────────────────────────────────────────

const between = (r: Rand, lo: number, hi: number, step = 1) => lo + Math.floor(r() * (Math.floor((hi - lo) / step) + 1)) * step;
const pickOne = <T>(r: Rand, list: readonly T[]) => list[Math.floor(r() * list.length)]!;
function shuffle<T>(r: Rand, list: readonly T[]) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Monthly payment on a loan (annuity). */
export const payment = (principal: number, monthlyRate: number, months: number) =>
  monthlyRate === 0 ? principal / months : (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -months);
/** Present value of `cash` at the end of each of `years` years. */
export const annuityPv = (cash: number, rate: number, years: number) => (cash * (1 - (1 + rate) ** -years)) / rate;

type Made = { vars: Record<string, string>; answer: number; wrong: number[]; fmt: (n: number) => string; nudge: number };

/**
 * The question for a kind, with numbers drawn from `r`. `nudge` is how far apart made-up extra wrong
 * options sit when the real mistakes happen to give the same number.
 */
function make(kind: AnalystKind, r: Rand): Made {
  switch (kind) {
    // ── Personal finance ──
    case 'saveWeeks': {
      const weekly = between(r, 8, 25);
      const target = between(r, 12, 30) * 10 + 5;
      const exact = target / weekly;
      return {
        vars: { weekly: usd(weekly), target: usd(target) },
        answer: Math.ceil(exact),
        wrong: [Math.floor(exact) === Math.ceil(exact) ? Math.ceil(exact) + 1 : Math.floor(exact), Math.ceil(target / (weekly * 4)), Math.round(target / 10)],
        fmt: (n) => num(n),
        nudge: 2,
      };
    }
    case 'shareOf': {
      const income = between(r, 18, 60) * 50;
      const share = pickOne(r, [0.2, 0.3, 0.5] as const);
      return {
        vars: { income: usd(income), share: pct(share, 0) },
        answer: income * share,
        wrong: [income * (share === 0.2 ? 0.3 : 0.2), income * (share === 0.5 ? 0.3 : 0.5), income * share * 0.1],
        fmt: usd0,
        nudge: 50,
      };
    }
    case 'simpleInterest': {
      const principal = between(r, 10, 60) * 100;
      const rate = between(r, 3, 12) / 100;
      const years = between(r, 2, 5);
      return {
        vars: { principal: usd(principal), rate: pct(rate, 0), years: num(years) },
        answer: principal * rate * years,
        wrong: [principal * ((1 + rate) ** years - 1), principal * rate, principal * (1 + rate * years)],
        fmt: (n) => usd(round(n, 2)),
        nudge: 25,
      };
    }
    case 'cardInterest': {
      const balance = between(r, 8, 40) * 50;
      const rate = between(r, 15, 35, 5) / 1000;
      return {
        vars: { balance: usd(balance), rate: pct(rate) },
        answer: balance * rate,
        wrong: [balance * rate * 12, balance * (1 + rate), balance * rate * 10],
        fmt: (n) => usd(round(n, 2)),
        nudge: 5,
      };
    }
    case 'compound': {
      const principal = between(r, 10, 50) * 100;
      const rate = between(r, 4, 9) / 100;
      const years = between(r, 3, 8);
      return {
        vars: { principal: usd(principal), rate: pct(rate, 0), years: num(years) },
        answer: principal * (1 + rate) ** years,
        wrong: [principal * (1 + rate * years), principal * (1 + rate) ** (years - 1), principal * rate * years],
        fmt: usd0,
        nudge: 40,
      };
    }
    case 'realRate': {
      const nominal = between(r, 4, 12) / 100;
      const inflation = between(r, 2, 9) / 100;
      const real = (1 + nominal) / (1 + inflation) - 1;
      return {
        vars: { nominal: pct(nominal, 0), inflation: pct(inflation, 0) },
        answer: real,
        wrong: [nominal + inflation, nominal, inflation - nominal === 0 ? -0.01 : inflation - nominal],
        fmt: (n) => pct(n),
        nudge: 0.005,
      };
    }
    case 'ear': {
      const monthly = between(r, 10, 30, 5) / 1000;
      return {
        vars: { monthly: pct(monthly) },
        answer: (1 + monthly) ** 12 - 1,
        wrong: [monthly * 12, monthly, (1 + monthly) ** 12],
        fmt: (n) => pct(n),
        nudge: 0.01,
      };
    }
    case 'loanPayment': {
      const principal = between(r, 4, 30) * 1000;
      const rate = between(r, 5, 14) / 100;
      const years = between(r, 2, 6);
      const n = years * 12;
      return {
        vars: { principal: usd(principal), rate: pct(rate, 0), years: num(years) },
        answer: payment(principal, rate / 12, n),
        wrong: [principal / n, (principal * (1 + rate * years)) / n, payment(principal, rate, n)],
        fmt: (n) => usd(round(n, 2)),
        nudge: 15,
      };
    }
    case 'taxBands': {
      const band1 = between(r, 8, 14) * 1000;
      const band2 = band1 + between(r, 20, 40) * 1000;
      const rate2 = between(r, 15, 25, 5) / 100;
      const rate3 = rate2 + between(r, 10, 20, 5) / 100;
      const income = band2 + between(r, 5, 30) * 1000;
      const tax = (band2 - band1) * rate2 + (income - band2) * rate3;
      return {
        vars: { income: usd(income), band1: usd(band1), band2: usd(band2), rate2: pct(rate2, 0), rate3: pct(rate3, 0) },
        answer: tax,
        wrong: [income * rate3, (income - band1) * rate2, (income - band1) * rate3],
        fmt: usd0,
        nudge: 500,
      };
    }
    case 'retirement': {
      const pay = between(r, 10, 60) * 100;
      const rate = between(r, 4, 8) / 100;
      const years = between(r, 15, 35, 5);
      const fv = (pay * ((1 + rate) ** years - 1)) / rate;
      return {
        vars: { payment: usd(pay), rate: pct(rate, 0), years: num(years) },
        answer: fv,
        wrong: [pay * years, fv * (1 + rate), pay * years * (1 + rate) ** years],
        fmt: usd0,
        nudge: 2500,
      };
    }

    // ── Markets ──
    case 'revenue': {
      const qty = between(r, 20, 90);
      const price = between(r, 4, 16) / 4;
      const cost = between(r, 1, Math.max(1, Math.floor(price * 4) - 2)) / 4;
      return {
        vars: { qty: num(qty), price: usd(price), cost: usd(cost) },
        answer: qty * price,
        wrong: [qty * (price - cost), qty * cost, qty * (price + cost)],
        fmt: (n) => usd(round(n, 2)),
        nudge: 5,
      };
    }
    case 'profitDay': {
      const qty = between(r, 30, 90);
      const price = between(r, 6, 16) / 4;
      const cost = between(r, 1, 4) / 4;
      const bought = qty + between(r, 5, 25);
      const fee = between(r, 1, 3) * 5;
      return {
        vars: { qty: num(qty), bought: num(bought), price: usd(price), cost: usd(cost), fee: usd(fee) },
        answer: qty * price - bought * cost - fee,
        wrong: [qty * (price - cost) - fee, qty * price - bought * cost, qty * price - fee],
        fmt: (n) => usd(round(n, 2)),
        nudge: 5,
      };
    }
    case 'demandAt': {
      const b = between(r, 8, 30);
      const a = b * between(r, 5, 9);
      const p1 = between(r, 1, 2);
      const p2 = p1 + between(r, 1, 2);
      const p3 = p2 + 1;
      const q = (p: number) => a - b * p;
      return {
        vars: { p1: usd(p1), q1: num(q(p1)), p2: usd(p2), q2: num(q(p2)), p3: usd(p3) },
        answer: q(p3),
        wrong: [q(p2) - (q(p1) - q(p2)) / 2, (q(p2) * p2) / p3, q(p2) - b * 2],
        fmt: (n) => num(n),
        nudge: Math.max(2, Math.round(b / 3)),
      };
    }
    case 'elasticity': {
      const p1 = between(r, 2, 6);
      const p2 = p1 + between(r, 1, 2);
      const q1 = between(r, 60, 120);
      const q2 = q1 - between(r, 10, 50);
      const mid = Math.abs((q2 - q1) / ((q1 + q2) / 2) / ((p2 - p1) / ((p1 + p2) / 2)));
      const simple = Math.abs((q2 - q1) / q1 / ((p2 - p1) / p1));
      return {
        vars: { p1: usd(p1), p2: usd(p2), q1: num(q1), q2: num(q2) },
        answer: round(mid, 2),
        wrong: [round(1 / mid, 2), round(simple, 2), round((q1 - q2) / (p2 - p1), 2)],
        fmt: (n) => num(n, 2),
        nudge: 0.15,
      };
    }
    case 'bestPrice': {
      const b = between(r, 10, 40);
      const choke = between(r, 6, 14);
      const a = b * choke;
      const c = between(r, 1, choke - 3);
      return {
        vars: { a: num(a), b: num(b), cost: usd(c) },
        answer: (a / b + c) / 2,
        wrong: [a / b / 2, a / b - c, c * 2],
        fmt: (n) => usd(round(n, 2)),
        nudge: 0.5,
      };
    }
    case 'monopolyQ': {
      const B = between(r, 1, 4);
      const c = between(r, 10, 40);
      const A = c + 2 * B * between(r, 10, 40);
      return {
        vars: { A: num(A), B: num(B), mc: usd(c) },
        answer: (A - c) / (2 * B),
        wrong: [(A - c) / B, (A - c) / (3 * B), A / (2 * B)],
        fmt: (n) => num(n, 1),
        nudge: 3,
      };
    }
    case 'hhi': {
      // Four or five firms whose shares add up to 100.
      const firms = between(r, 4, 5);
      const shares: number[] = [];
      let left = 100;
      for (let k = 0; k < firms - 1; k++) {
        const s = between(r, 5, Math.max(6, Math.min(45, left - 5 * (firms - 1 - k))));
        shares.push(s);
        left -= s;
      }
      shares.push(left);
      shares.sort((x, y) => y - x);
      const hhi = shares.reduce((s, x) => s + x * x, 0);
      return {
        vars: { shares: shares.map((s) => `${s}%`).join(', '), firms: num(firms) },
        answer: hhi,
        // Mistakes: only the biggest three firms, treating them as equal, or adding shares instead of squares.
        wrong: [shares.slice(0, 3).reduce((s, x) => s + x * x, 0), Math.round(10000 / firms), shares.slice(0, 4).reduce((s, x) => s + x, 0) * 10],
        fmt: (n) => num(n),
        nudge: 150,
      };
    }
    case 'cournot': {
      const B = between(r, 1, 3);
      const c = between(r, 10, 30);
      const A = c + 3 * B * between(r, 10, 30);
      return {
        vars: { A: num(A), B: num(B), mc: usd(c) },
        answer: (A - c) / (3 * B),
        wrong: [(A - c) / (2 * B), (A - c) / (4 * B), (A - c) / B],
        fmt: (n) => num(n, 1),
        nudge: 3,
      };
    }
    case 'deadweight': {
      const B = between(r, 1, 2);
      const c = between(r, 10, 30);
      const A = c + 4 * B * between(r, 5, 15);
      return {
        vars: { A: num(A), B: num(B), mc: usd(c) },
        answer: (A - c) ** 2 / (8 * B),
        wrong: [(A - c) ** 2 / (4 * B), (A - c) ** 2 / (2 * B), (A - c) ** 2 / (16 * B)],
        fmt: usd0,
        nudge: 50,
      };
    }

    // ── Projects ──
    case 'operatingLeverage': {
      const units = between(r, 20, 60) * 100;
      const price = between(r, 20, 60);
      const unit = between(r, 8, price - 6);
      const contribution = units * (price - unit);
      const fixed = Math.round((contribution * between(r, 40, 75)) / 100 / 1000) * 1000;
      const profit = contribution - fixed;
      return {
        vars: { units: num(units), price: usd(price), unit: usd(unit), fixed: usd(fixed) },
        answer: round(contribution / profit, 2),
        wrong: [round(profit / contribution, 2), round((units * price) / profit, 2), round(fixed / profit, 2)],
        fmt: (n) => `${num(n, 2)}×`,
        nudge: 0.3,
      };
    }
    case 'npv': {
      const cost = between(r, 20, 90) * 1000;
      const years = between(r, 3, 6);
      const rate = between(r, 6, 14) / 100;
      const cash = Math.round((cost / years) * (1.05 + r() * 0.35) / 100) * 100;
      const pv = annuityPv(cash, rate, years);
      return {
        vars: { cost: usd(cost), cash: usd(cash), years: num(years), rate: pct(rate, 0) },
        answer: pv - cost,
        wrong: [cash * years - cost, pv, cash * years / (1 + rate * years) - cost],
        fmt: usd0,
        nudge: 1500,
      };
    }
    case 'wacc': {
      const equity = between(r, 4, 16) * 10;
      const debt = between(r, 2, 10) * 10;
      const re = between(r, 9, 16) / 100;
      const rd = between(r, 4, 8) / 100;
      const tax = between(r, 20, 35, 5) / 100;
      const v = equity + debt;
      return {
        vars: { equity: usd(equity * 1e6), debt: usd(debt * 1e6), re: pct(re, 0), rd: pct(rd, 0), tax: pct(tax, 0) },
        answer: (equity / v) * re + (debt / v) * rd * (1 - tax),
        wrong: [(equity / v) * re + (debt / v) * rd, (re + rd * (1 - tax)) / 2, (debt / v) * re + (equity / v) * rd * (1 - tax)],
        fmt: (n) => pct(n, 2),
        nudge: 0.004,
      };
    }
    case 'projectNpv': {
      const equity = between(r, 5, 12) * 10;
      const debt = between(r, 2, 8) * 10;
      const re = between(r, 10, 15) / 100;
      const rd = between(r, 5, 8) / 100;
      const tax = between(r, 20, 30, 5) / 100;
      const v = equity + debt;
      const wacc = (equity / v) * re + (debt / v) * rd * (1 - tax);
      const cost = between(r, 40, 120) * 1000;
      const years = between(r, 4, 7);
      const cash = Math.round((cost / years) * (1.15 + r() * 0.3) / 1000) * 1000;
      const at = (rate: number) => annuityPv(cash, rate, years) - cost;
      return {
        vars: {
          equity: usd(equity * 1e6),
          debt: usd(debt * 1e6),
          re: pct(re, 0),
          rd: pct(rd, 0),
          tax: pct(tax, 0),
          cost: usd(cost),
          cash: usd(cash),
          years: num(years),
        },
        answer: at(wacc),
        wrong: [at(re), at((equity / v) * re + (debt / v) * rd), at(rd)],
        fmt: usd0,
        nudge: 2000,
      };
    }

    // ── Investing ──
    case 'dividendYield': {
      const price = between(r, 10, 120);
      const dividend = round((price * between(r, 15, 70)) / 1000, 2);
      return {
        vars: { price: usd(price), dividend: usd(dividend) },
        answer: dividend / price,
        wrong: [price / dividend / 100, (dividend * 4) / price, dividend / 100],
        fmt: (n) => pct(n),
        nudge: 0.01,
      };
    }
    case 'portfolioReturn': {
      const w1 = between(r, 2, 7) / 10;
      const r1 = between(r, -6, 18) / 100;
      const r2 = between(r, -4, 10) / 100;
      return {
        vars: { w1: pct(w1, 0), w2: pct(1 - w1, 0), r1: pct(r1, 0), r2: pct(r2, 0) },
        answer: w1 * r1 + (1 - w1) * r2,
        wrong: [(r1 + r2) / 2 === w1 * r1 + (1 - w1) * r2 ? r1 + r2 : (r1 + r2) / 2, r1 + r2, (1 - w1) * r1 + w1 * r2],
        fmt: (n) => pct(n),
        nudge: 0.01,
      };
    }
    case 'peValue': {
      const eps = round(between(r, 50, 600) / 100, 2);
      const pe = between(r, 8, 30);
      return {
        vars: { eps: usd(eps), pe: num(pe) },
        answer: eps * pe,
        wrong: [pe / eps, eps * pe * 0.1, eps + pe],
        fmt: (n) => usd(round(n, 2)),
        nudge: 5,
      };
    }
    case 'capm': {
      const rf = between(r, 2, 5) / 100;
      const rm = rf + between(r, 4, 7) / 100;
      const beta = between(r, 5, 18) / 10;
      return {
        vars: { rf: pct(rf, 0), rm: pct(rm, 0), beta: num(beta, 1) },
        answer: rf + beta * (rm - rf),
        wrong: [beta * rm, rf + beta * rm, rm + beta * (rm - rf)],
        fmt: (n) => pct(n),
        nudge: 0.01,
      };
    }
    case 'sharpe': {
      const rp = between(r, 6, 16) / 100;
      const rf = between(r, 2, 4) / 100;
      const sd = between(r, 8, 25) / 100;
      return {
        vars: { rp: pct(rp, 0), rf: pct(rf, 0), sd: pct(sd, 0) },
        answer: round((rp - rf) / sd, 2),
        wrong: [round(rp / sd, 2), round(sd / (rp - rf), 2), round((rp - rf) / (sd * sd), 2)],
        fmt: (n) => num(n, 2),
        nudge: 0.12,
      };
    }
    case 'gordon': {
      const d0 = round(between(r, 100, 400) / 100, 2);
      const g = between(r, 2, 5) / 100;
      const rate = g + between(r, 4, 8) / 100;
      const d1 = d0 * (1 + g);
      return {
        vars: { d0: usd(d0), g: pct(g, 0), r: pct(rate, 0) },
        answer: d1 / (rate - g),
        wrong: [d0 / (rate - g), d1 / rate, d0 / (rate + g)],
        fmt: (n) => usd(round(n, 2)),
        nudge: 4,
      };
    }
    case 'bondPrice': {
      const face = 1000;
      const coupon = between(r, 3, 9) / 100;
      let y = between(r, 2, 10) / 100;
      if (y === coupon) y += 0.02;
      const years = between(r, 3, 10);
      const pv = annuityPv(face * coupon, y, years) + face / (1 + y) ** years;
      return {
        vars: { face: usd(face), coupon: pct(coupon, 0), y: pct(y, 0), years: num(years) },
        answer: pv,
        wrong: [face / (1 + y) ** years, face * coupon * years + face, annuityPv(face * coupon, y, years) + face],
        fmt: (n) => usd(round(n, 2)),
        nudge: 20,
      };
    }
    case 'twoAssetSd': {
      const w1 = between(r, 3, 7) / 10;
      const s1 = between(r, 10, 30) / 100;
      const s2 = between(r, 5, 20) / 100;
      const rho = between(r, -5, 6) / 10;
      const v = (w: number) => w1 * w1 * s1 * s1 + (1 - w1) * (1 - w1) * s2 * s2 + w * w1 * (1 - w1) * rho * s1 * s2;
      return {
        vars: { w1: pct(w1, 0), w2: pct(1 - w1, 0), s1: pct(s1, 0), s2: pct(s2, 0), rho: num(rho, 1) },
        answer: Math.sqrt(v(2)),
        wrong: [w1 * s1 + (1 - w1) * s2, Math.sqrt(v(0)), Math.sqrt(Math.max(0, v(1)))],
        fmt: (n) => pct(n),
        nudge: 0.01,
      };
    }

    // ── Startups ──
    case 'grossMargin': {
      const price = between(r, 10, 200);
      const unit = between(r, Math.round(price * 0.2), Math.round(price * 0.7));
      return {
        vars: { price: usd(price), unit: usd(unit) },
        answer: (price - unit) / price,
        wrong: [(price - unit) / unit, unit / price, (price - unit) / 100],
        fmt: (n) => pct(n),
        nudge: 0.05,
      };
    }
    case 'runway': {
      const cash = between(r, 20, 120) * 1000;
      const revenue = between(r, 5, 30) * 1000;
      const costs = revenue + between(r, 4, 15) * 1000;
      return {
        vars: { cash: usd(cash), revenue: usd(revenue), costs: usd(costs) },
        answer: Math.floor(cash / (costs - revenue)),
        wrong: [Math.floor(cash / costs), Math.floor(cash / revenue), Math.floor((cash + revenue) / (costs - revenue))],
        fmt: (n) => num(n),
        nudge: 2,
      };
    }
    case 'ltvCac': {
      const monthly = between(r, 10, 60);
      const gm = between(r, 50, 85, 5) / 100;
      const months = between(r, 8, 30);
      const cac = between(r, 60, 400, 10);
      const ltv = monthly * gm * months;
      return {
        vars: { monthly: usd(monthly), gm: pct(gm, 0), months: num(months), cac: usd(cac) },
        answer: round(ltv / cac, 1),
        wrong: [round((monthly * months) / cac, 1), round(cac / ltv, 1), round((monthly * gm) / cac, 1)],
        fmt: (n) => `${num(n, 1)}×`,
        nudge: 0.4,
      };
    }
    case 'dilution': {
      const own = between(r, 50, 100, 5) / 100;
      const pre = between(r, 2, 12) * 1e6;
      const invest = between(r, 5, 30) * 1e5;
      return {
        vars: { own: pct(own, 0), pre: usd(pre), invest: usd(invest) },
        answer: (own * pre) / (pre + invest),
        wrong: [own - invest / pre, own * (1 - invest / pre), (own * invest) / (pre + invest)],
        fmt: (n) => pct(n),
        nudge: 0.02,
      };
    }
    case 'evMultiple': {
      const ebitda = between(r, 2, 30) * 1e5;
      const multiple = between(r, 5, 14);
      const debt = between(r, 5, 40) * 1e5;
      const cash = between(r, 1, 15) * 1e5;
      const ev = ebitda * multiple;
      return {
        vars: { ebitda: usd(ebitda), multiple: num(multiple), debt: usd(debt), cash: usd(cash) },
        answer: ev - debt + cash,
        wrong: [ev, ev + debt - cash, ev - debt - cash],
        fmt: usd0,
        nudge: 2e5,
      };
    }
    case 'dcfPerpetuity': {
      const fcf = between(r, 2, 20) * 1e5;
      const g = between(r, 1, 4) / 100;
      const rate = g + between(r, 5, 9) / 100;
      return {
        vars: { fcf: usd(fcf), g: pct(g, 0), r: pct(rate, 0) },
        answer: fcf / (rate - g),
        wrong: [(fcf * (1 + g)) / (rate - g), fcf / rate, fcf / (rate + g)],
        fmt: usd0,
        nudge: 5e5,
      };
    }
    case 'convertible': {
      const note = between(r, 2, 20) * 1e5;
      const discount = between(r, 10, 25, 5) / 100;
      const price = round(between(r, 50, 400) / 100, 2);
      return {
        vars: { note: usd(note), discount: pct(discount, 0), price: usd(price) },
        answer: Math.round(note / (price * (1 - discount))),
        wrong: [Math.round(note / price), Math.round(note / (price * discount)), Math.round((note * (1 - discount)) / price)],
        fmt: (n) => num(n),
        nudge: 5000,
      };
    }
    case 'twoStageDcf': {
      const fcf = between(r, 5, 30) * 1e5;
      const g1 = between(r, 10, 25, 5) / 100;
      const g2 = between(r, 2, 3) / 100;
      const rate = between(r, 9, 13) / 100;
      // Years 1–3 grow at g1 from today's FCF; from year 4 at g2 forever (terminal value at the end of year 3).
      const flows = [1, 2, 3].map((t) => fcf * (1 + g1) ** t);
      const pvFlows = flows.reduce((s, f, k) => s + f / (1 + rate) ** (k + 1), 0);
      const tv = (flows[2]! * (1 + g2)) / (rate - g2);
      return {
        vars: { fcf: usd(fcf), g1: pct(g1, 0), g2: pct(g2, 0), r: pct(rate, 0) },
        answer: pvFlows + tv / (1 + rate) ** 3,
        wrong: [pvFlows + tv, pvFlows + tv / (1 + rate) ** 4, pvFlows + (flows[2]! * (1 + g2)) / rate / (1 + rate) ** 3],
        fmt: usd0,
        nudge: 1e6,
      };
    }
  }
}

/**
 * A question of a kind with `count` options (4 up to Advanced, 5 above). The wrong options are the
 * usual mistakes; if two come out the same as the answer or each other, made-up neighbours fill in.
 */
export function analystQuestion(kind: AnalystKind, r: Rand, count = 4): AnalystQuestion {
  for (let attempt = 0; ; attempt++) {
    const m = make(kind, r);
    if (!Number.isFinite(m.answer) || m.wrong.some((w) => !Number.isFinite(w))) continue;
    const answer = m.fmt(m.answer);
    const options = [answer];
    for (const w of m.wrong) {
      const text = m.fmt(w);
      if (!options.includes(text)) options.push(text);
    }
    for (let k = 1; options.length < count && k < 40; k++) {
      const text = m.fmt(m.answer + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * m.nudge * (1 + (attempt % 3) * 0.37));
      if (!options.includes(text) && !text.startsWith('−') === !answer.startsWith('−')) options.push(text);
    }
    if (options.length < count && attempt < 5) continue;
    return { kind, vars: m.vars, answer, options: shuffle(r, options.slice(0, count)) };
  }
}

/** The seconds on the clock for a question at a level: none up to Elementary, then less and less. */
export function analystSeconds(kind: AnalystKind, level: number) {
  if (level <= 3) return 0;
  const factor = [1.6, 1.45, 1.3, 1.2, 1.1, 1, 1][Math.min(10, level) - 4]!;
  return Math.round((KIND_SECONDS[kind] * factor) / 5) * 5;
}
