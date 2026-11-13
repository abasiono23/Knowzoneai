import type { BillingPeriod, PaidPlan } from './plans';

/**
 * Google Play product ids (the Android app). One subscription per plan, each with three base plans, one
 * per period. They are typed into Play Console by hand (docs/play-billing-setup.md) and can't be renamed
 * there; the server maps the same ids in apps/server/src/data/plans.ts. Keep the two in step.
 */
export const PLAY_PRODUCT: Record<PaidPlan, string> = { PLUS: 'knowzone_plus', PRO: 'knowzone_pro' };
/** monthly bills every month, term every 3 months, yearly every year. */
export const PLAY_BASE_PLAN: Record<BillingPeriod, string> = { month: 'monthly', term: 'term', year: 'yearly' };

export const PLAY_SKUS = Object.values(PLAY_PRODUCT);

export const planOfSku = (sku: string) =>
  (Object.keys(PLAY_PRODUCT) as PaidPlan[]).find((plan) => PLAY_PRODUCT[plan] === sku) ?? null;
