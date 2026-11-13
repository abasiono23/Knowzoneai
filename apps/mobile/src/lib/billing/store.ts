import type { BillingPeriod, PaidPlan } from './plans';
import { StoreError, type BuyResult, type StorePrices, type StorePurchase } from './store-types';

export * from './store-types';

/**
 * No app store here (the web, and iOS until it ships): payments go through Flutterwave.
 * Android loads store.android.ts instead of this file.
 */
export const STORE_PURCHASES = false;

export async function loadStorePrices(): Promise<StorePrices | null> {
  return null;
}

export async function buyPlan(_order: { plan: PaidPlan; period: BillingPeriod; userId: string }): Promise<BuyResult> {
  throw new StoreError('unavailable');
}

export async function finishPurchase(_purchase: StorePurchase): Promise<void> {}

export async function ownedPurchases(): Promise<StorePurchase[]> {
  return [];
}
