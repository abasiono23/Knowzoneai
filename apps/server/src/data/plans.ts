/**
 * Plans, prices and promo codes. The server is the source of truth for what a payment costs
 * (the app shows the same figures from apps/mobile/src/lib/billing/plans.ts; keep them in step).
 */
export type PaidPlan = 'PLUS' | 'PRO';
export type BillingPeriod = 'month' | 'term' | 'year';

export type Currency = 'NGN' | 'USD';
export const CURRENCIES: Currency[] = ['NGN', 'USD'];

/** Price per period in each currency (naira, dollars). Dollar payments are by card only. */
export const PRICES: Record<Currency, Record<PaidPlan, Record<BillingPeriod, number>>> = {
  NGN: {
    PLUS: { month: 3500, term: 9000, year: 30000 },
    PRO: { month: 7500, term: 19500, year: 66000 },
  },
  USD: {
    PLUS: { month: 4.99, term: 12.99, year: 44.99 },
    PRO: { month: 9.99, term: 26.99, year: 89.99 },
  },
};

/** Payments are stored in minor units (kobo, cents) so dollar prices stay exact. */
export const toMinor = (amount: number) => Math.round(amount * 100);
export const fromMinor = (minor: number) => minor / 100;

export const PERIOD_DAYS: Record<BillingPeriod, number> = {
  month: 30,
  term: 91,
  year: 365,
};

/** AI credits added each month of a paid plan (fair use). */
export const MONTHLY_CREDITS: Record<PaidPlan, number> = { PLUS: 60, PRO: 200 };

/** Promo codes: `months` limits a code to some periods; one use per account. */
export const PROMOS: Record<
  string,
  {
    percent: number;
    label: string;
    months?: BillingPeriod[];
    expired?: boolean;
  }
> = {
  EXAM25: { percent: 25, label: '25% off your first payment' },
  WELCOME50: {
    percent: 50,
    label: '50% off your first month',
    months: ['month'],
  },
  SCHOOL2025: { percent: 20, label: 'Back-to-school 2025', expired: true },
};

/** Full refund, no questions asked, within this many days of a first (non-renewal) payment. */
export const REFUND_DAYS = 7;
