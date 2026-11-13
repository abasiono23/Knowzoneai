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
    PLUS: { month: 5000, term: 13000, year: 43000 },
    PRO: { month: 9000, term: 23500, year: 77000 },
  },
  USD: {
    PLUS: { month: 3.99, term: 10.49, year: 34.49 },
    PRO: { month: 7.49, term: 18.99, year: 61.49 },
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

/**
 * Google Play (the Android app): one subscription product per plan, each with three base plans, one per
 * period. The ids are typed into Play Console by hand (docs/play-billing-setup.md) and can't be renamed
 * there, so change them here and in apps/mobile/src/lib/billing/play-products.ts only before launch.
 */
export const PLAY_PRODUCTS: Record<string, PaidPlan> = { knowzone_plus: 'PLUS', knowzone_pro: 'PRO' };
/** Base plan id → period: monthly bills every month (P1M), term every 3 months (P3M), yearly every year (P1Y). */
export const PLAY_BASE_PLANS: Record<string, BillingPeriod> = { monthly: 'month', term: 'term', yearly: 'year' };

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
