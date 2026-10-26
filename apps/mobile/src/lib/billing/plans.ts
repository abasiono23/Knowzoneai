import type { Ionicons } from '@expo/vector-icons';
import { getLocales } from 'expo-localization';
import type { TFunction } from 'i18next';

import i18n, { formatNumber } from '../../i18n';
import type en from '../../i18n/locales/en/billing';

/**
 * Plans and prices. Figures sit inside the PRD's proposed ranges (Plus ₦2,500–5,000, Pro ₦6,000–10,000 a month)
 * and are experiments to validate with students and parents, not fixed market rates.
 */

export type PlanId = 'FREE' | 'PLUS' | 'PRO';
export type PaidPlan = Exclude<PlanId, 'FREE'>;
export type BillingPeriod = 'month' | 'term' | 'year';

export type Currency = 'NGN' | 'USD';
export const CURRENCIES: Currency[] = ['NGN', 'USD'];

/** Price per period in naira and in dollars; the server charges the same figures. Dollar payments are by card. */
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

/** Naira for learners in Nigeria (by region or time zone), dollars elsewhere. They can switch at checkout. */
export function defaultCurrency(): Currency {
  let zone = '';
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
  } catch {}
  return getLocales()[0]?.regionCode === 'NG' || zone === 'Africa/Lagos' ? 'NGN' : 'USD';
}

type PeriodInfo = {
  /** "Monthly", "School term", "Yearly" in the current language. */
  readonly label: string;
  /** The label for use inside a sentence ("monthly"). */
  readonly lower: string;
  readonly short: string;
  readonly note: string;
  days: number;
  months: number;
};

/** Text is read through getters, so it follows the current language and is never fixed at import time. */
const period = (id: BillingPeriod, days: number, months: number): PeriodInfo => ({
  days,
  months,
  get label() {
    return i18n.t(`billing:periods.${id}.label`);
  },
  get lower() {
    return i18n.t(`billing:periods.${id}.lower`);
  },
  get short() {
    return i18n.t(`billing:periods.${id}.short`);
  },
  get note() {
    return i18n.t(`billing:periods.${id}.note`);
  },
});

export const PERIOD: Record<BillingPeriod, PeriodInfo> = {
  month: period('month', 30, 1),
  term: period('term', 91, 3),
  year: period('year', 365, 12),
};

/** AI credits added each month of a paid plan (fair use). Free accounts get welcome and invite credits. */
export const MONTHLY_CREDITS: Record<PaidPlan, number> = { PLUS: 60, PRO: 200 };
export const TUTOR_DAILY: Record<PlanId, number> = { FREE: 10, PLUS: 100, PRO: 300 };

type Icon = keyof typeof Ionicons.glyphMap;
/** `text` is translated each time it's read. */
export type Feature = { icon: Icon; readonly text: string };

const feature = (icon: Icon, text: () => string): Feature => ({
  icon,
  get text() {
    return text();
  },
});

type Plan = {
  readonly name: string;
  readonly tagline: string;
  colors: readonly [string, string];
  features: Feature[];
};

/** "Knowzone Plus" and "Knowzone Pro" are brand names; "Free" is translated. */
export const PLANS: Record<PlanId, Plan> = {
  FREE: {
    get name() {
      return i18n.t('billing:plans.free');
    },
    get tagline() {
      return i18n.t('billing:plans.taglines.FREE');
    },
    colors: ['#262E66', '#1A2150'],
    features: [
      feature('chatbubbles', () => i18n.t('billing:features.tutorDaily', { count: TUTOR_DAILY.FREE })),
      feature('flash', () => i18n.t('billing:features.welcomeCredits')),
      feature('layers', () => i18n.t('billing:features.studyTools')),
      feature('play-circle', () => i18n.t('billing:features.videoFeed')),
      feature('planet', () => i18n.t('billing:features.world')),
      feature('stats-chart', () => i18n.t('billing:features.basicProgress')),
    ],
  },
  PLUS: {
    name: 'Knowzone Plus',
    get tagline() {
      return i18n.t('billing:plans.taglines.PLUS');
    },
    colors: ['#6A45FF', '#B04CFF'],
    features: [
      feature('chatbubbles', () => i18n.t('billing:features.tutorDaily', { count: TUTOR_DAILY.PLUS })),
      feature('flash', () => i18n.t('billing:features.monthlyCredits', { count: MONTHLY_CREDITS.PLUS })),
      feature('videocam', () => i18n.t('billing:features.longerVideos')),
      feature('school', () => i18n.t('billing:features.advancedQuizzes')),
      feature('cloud-download', () => i18n.t('billing:features.offline')),
      feature('calendar', () => i18n.t('billing:features.studyPlans')),
      feature('analytics', () => i18n.t('billing:features.insights')),
    ],
  },
  PRO: {
    name: 'Knowzone Pro',
    get tagline() {
      return i18n.t('billing:plans.taglines.PRO');
    },
    colors: ['#9C6B1E', '#FFC857'],
    features: [
      feature('chatbubbles', () => i18n.t('billing:features.tutorDailyFair', { count: TUTOR_DAILY.PRO })),
      feature('flash', () => i18n.t('billing:features.monthlyCredits', { count: MONTHLY_CREDITS.PRO })),
      feature('trophy', () => i18n.t('billing:features.examPapers')),
      feature('library', () => i18n.t('billing:features.library')),
      feature('rocket', () => i18n.t('billing:features.priority')),
      feature('checkmark-done', () => i18n.t('billing:features.everythingPlus')),
    ],
  },
};

type ComparisonValue = string | boolean;
type ComparisonValues = [ComparisonValue, ComparisonValue, ComparisonValue];
export type ComparisonGroup = {
  id: string;
  group: string;
  rows: { id: string; label: string; values: ComparisonValues }[];
};

/** Rows for the comparison table: value per plan (true / false / text), in the current language. */
export function comparison(t: TFunction<'billing'>): ComparisonGroup[] {
  const n = (x: number) => formatNumber(x);
  const upTo = (x: number) => t('comparison.values.upToMin', { n: n(x) });
  const row = (id: keyof typeof en.comparison.rows, values: ComparisonValues) => ({
    id,
    label: t(`comparison.rows.${id}`),
    values,
  });
  return [
    {
      id: 'ai',
      group: t('comparison.groups.ai'),
      rows: [
        row('tutorDaily', [
          n(TUTOR_DAILY.FREE),
          n(TUTOR_DAILY.PLUS),
          t('comparison.values.fairUse', { n: n(TUTOR_DAILY.PRO) }),
        ]),
        row('monthlyCredits', [
          t('comparison.values.toStart', { n: n(5) }),
          n(MONTHLY_CREDITS.PLUS),
          n(MONTHLY_CREDITS.PRO),
        ]),
        row('studyTools', [true, true, true]),
        row('videos', [upTo(1), upTo(5), upTo(5)]),
        row('priority', [false, false, true]),
      ],
    },
    {
      id: 'learning',
      group: t('comparison.groups.learning'),
      rows: [
        row('courses', [true, true, true]),
        row('advancedQuizzes', [false, true, true]),
        row('studyPlans', [false, true, true]),
        row('examPapers', [
          t('comparison.values.samples'),
          t('comparison.values.samples'),
          t('comparison.values.fullPapers'),
        ]),
        row('offline', [false, true, true]),
      ],
    },
    {
      id: 'other',
      group: t('comparison.groups.other'),
      rows: [
        row('world', [true, true, true]),
        row('insights', [
          t('comparison.values.basic'),
          t('comparison.values.detailed'),
          t('comparison.values.detailed'),
        ]),
        row('ads', [t('comparison.values.never'), t('comparison.values.never'), t('comparison.values.never')]),
      ],
    },
  ];
}

/**
 * Promo codes the mock server accepts. The real list lives on the server. `label` is the server's
 * (English) text; the app shows a translation with promoLabel() when it knows the code.
 */
export const PROMOS: Record<string, { percent: number; label: string; months?: BillingPeriod[]; expired?: boolean }> = {
  EXAM25: { percent: 25, label: '25% off your first payment' },
  WELCOME50: { percent: 50, label: '50% off your first month', months: ['month'] },
  SCHOOL2025: { percent: 20, label: 'Back-to-school 2025', expired: true },
};

/** A promo's label in the current language, falling back to the server's text for unknown codes. */
export function promoLabel(promo: { code: string; label: string }, t: TFunction<'billing'>) {
  const key = `promos.${promo.code}` as `promos.${keyof typeof en.promos}`;
  return i18n.exists(`billing:${key}`) ? t(key) : promo.label;
}

/** An amount with its currency symbol (₦3,500, $4.99); digits and grouping follow the current language. */
export const money = (n: number, currency: Currency) =>
  currency === 'USD'
    ? `$${formatNumber(n, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `₦${formatNumber(Math.round(n))}`;
export const priceOf = (plan: PaidPlan, period: BillingPeriod, currency: Currency) => PRICES[currency][plan][period];
/** Monthly equivalent, for comparing periods. */
export const perMonth = (plan: PaidPlan, period: BillingPeriod, currency: Currency) =>
  PRICES[currency][plan][period] / PERIOD[period].months;
export const savingVsMonthly = (plan: PaidPlan, period: BillingPeriod, currency: Currency) =>
  period === 'month' ? 0 : Math.round((1 - perMonth(plan, period, currency) / PRICES[currency][plan].month) * 100);
/** A promo discount, rounded to the kobo or cent as the server does. */
export const discountOf = (price: number, percent: number) => Math.round(price * percent) / 100;
