import Constants from 'expo-constants';
import { Linking, Platform } from 'react-native';

import { PLAY_PRODUCT } from './play-products';
import type { BillingPeriod, PaidPlan } from './plans';

/**
 * In-app purchases through the phone's app store. Android uses Google Play Billing (store.android.ts);
 * the web pays with Flutterwave and never loads any of this (store.ts answers "no store").
 * iOS isn't shipped yet: when it is, add store.ios.ts with the same functions (StoreKit through expo-iap),
 * a server check like /me/billing/google/verify, and switch on the screens that test `STORE_UI`.
 */

/** A plan's price as the store shows it to this person: their currency, tax included. */
export type StorePrice = { text: string; amount: number; currency: string };
export type StorePrices = Partial<Record<`${PaidPlan}:${BillingPeriod}`, StorePrice>>;

/** A purchase the store holds for the phone's store account. */
export type StorePurchase = {
  purchaseToken: string;
  productId: string;
  packageName?: string;
  /** Whether the store has been told the purchase was delivered. The server normally does this. */
  acknowledged: boolean;
  /** The library's own purchase object, needed to finish the purchase. */
  raw: unknown;
};

export type BuyResult =
  /** Paid. Not unlocked yet: the server confirms it with the store first. */
  | { kind: 'purchased'; purchase: StorePurchase }
  /** The store is waiting for the money (cash or a slow bank method). The server unlocks it when it clears. */
  | { kind: 'pending' }
  /** The person closed the store's payment sheet. */
  | { kind: 'cancelled' }
  /** The phone's store account already has this plan: restore it instead. */
  | { kind: 'owned' };

export type StoreErrorCode = 'unavailable' | 'network' | 'product' | 'failed';

/** Why a store call failed, in terms the screens can explain. */
export class StoreError extends Error {
  constructor(
    public code: StoreErrorCode,
    message?: string,
  ) {
    super(message ?? code);
  }
}

/** A plan the app store manages: it is cancelled, resumed and changed there, never in Knowzone. */
export const storeManaged = (sub: { provider?: string; method: { type: string } }) =>
  sub.provider === 'google_play' || sub.method.type === 'store';

/** Android shows Google Play's flow and prices; everything else keeps the Flutterwave screens. */
export const STORE_UI = Platform.OS === 'android';
export const STORE_NAME = Platform.OS === 'ios' ? 'App Store' : 'Google Play';

const ANDROID_PACKAGE = Constants.expoConfig?.android?.package ?? 'ai.knowzone.app';

/**
 * Opens the store's own page for managing a subscription (cancel, change card, re-subscribe).
 * With a plan, Google Play opens straight on that subscription.
 */
export function openStoreSubscriptions(plan?: PaidPlan | null) {
  const url =
    Platform.OS === 'ios'
      ? 'https://apps.apple.com/account/subscriptions'
      : plan
        ? `https://play.google.com/store/account/subscriptions?sku=${PLAY_PRODUCT[plan]}&package=${ANDROID_PACKAGE}`
        : 'https://play.google.com/store/account/subscriptions';
  return Linking.openURL(url).catch(() => {});
}

/** Where Google Play codes (gift cards and offer codes) are redeemed. */
export const openStoreRedeem = () => Linking.openURL('https://play.google.com/redeem').catch(() => {});
