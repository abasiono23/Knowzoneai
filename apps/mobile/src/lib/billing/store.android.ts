import type { ProductSubscriptionAndroid, Purchase, SubscriptionOffer } from 'expo-iap';

import { USE_MOCKS } from '../config';
import { PLAY_BASE_PLAN, PLAY_PRODUCT, PLAY_SKUS } from './play-products';
import type { BillingPeriod, PaidPlan } from './plans';
import { StoreError, type BuyResult, type StorePrice, type StorePrices, type StorePurchase } from './store-types';

export * from './store-types';

/**
 * Google Play Billing through expo-iap (Play Billing Library). The app only starts the purchase and
 * passes the purchase token on: the server checks it with Google, unlocks the plan and acknowledges it.
 * Needs a development or store build; in Expo Go (no native module) every call says "unavailable".
 */
type Iap = typeof import('expo-iap');

/** Real purchases need the real server; demo mode keeps its pretend store. */
export const STORE_PURCHASES = !USE_MOCKS;

let connection: Promise<Iap> | null = null;

const codeOf = (e: unknown) => String((e as { code?: unknown } | null)?.code ?? '');
const NETWORK = ['network-error', 'service-timeout', 'service-disconnected', 'service-error', 'remote-error'];
const DROPPED = ['not-prepared', 'connection-closed', 'service-disconnected', 'init-connection'];

function storeError(e: unknown) {
  if (e instanceof StoreError) return e;
  const code = codeOf(e);
  const message = e instanceof Error ? e.message : undefined;
  if (NETWORK.includes(code)) return new StoreError('network', message);
  if (['billing-unavailable', 'iap-not-available', 'feature-not-supported', ...DROPPED].includes(code))
    return new StoreError('unavailable', message);
  if (['sku-not-found', 'item-unavailable', 'sku-offer-mismatch', 'empty-sku-list', 'query-product'].includes(code))
    return new StoreError('product', message);
  return new StoreError('failed', message);
}

/** One connection to Google Play for the life of the app, made the first time it's needed. */
function connect(): Promise<Iap> {
  if (!STORE_PURCHASES) return Promise.reject(new StoreError('unavailable'));
  connection ??= (async () => {
    const iap = await import('expo-iap');
    await iap.initConnection();
    return iap;
  })();
  return connection.catch((e) => {
    connection = null;
    // No native module (Expo Go), no Play Store on the phone, or Play not signed in.
    throw codeOf(e) ? storeError(e) : new StoreError('unavailable', e instanceof Error ? e.message : undefined);
  });
}

/** Runs a store call, reconnecting once if Google Play dropped the connection in the background. */
async function withStore<T>(run: (iap: Iap) => Promise<T>, retry = true): Promise<T> {
  try {
    return await run(await connect());
  } catch (e) {
    if (!retry || !DROPPED.includes(codeOf(e))) throw storeError(e);
    connection = null;
    try {
      return await run(await connect());
    } catch (again) {
      throw storeError(again);
    }
  }
}

type Offer = { sku: string; offerToken: string; price: StorePrice };
const key = (plan: PaidPlan, period: BillingPeriod) => `${plan}:${period}` as const;

/**
 * The plain offer of a base plan: Play lists the base plan itself (one price, repeating) next to any
 * special offers (free trials, intro prices) the person qualifies for. Special offers aren't used yet.
 */
function baseOffer(offers: SubscriptionOffer[], basePlan: string) {
  return offers
    .filter((o) => o.basePlanIdAndroid === basePlan && o.offerTokenAndroid)
    .sort(
      (a, b) =>
        (a.pricingPhasesAndroid?.pricingPhaseList.length ?? 1) - (b.pricingPhasesAndroid?.pricingPhaseList.length ?? 1),
    )[0];
}

async function loadOffers(iap: Iap) {
  const found = (await iap.fetchProducts({ skus: PLAY_SKUS, type: 'subs' })) ?? [];
  const products = found.filter((p): p is ProductSubscriptionAndroid => p.platform === 'android' && p.type === 'subs');
  const offers: Partial<Record<ReturnType<typeof key>, Offer>> = {};
  for (const plan of Object.keys(PLAY_PRODUCT) as PaidPlan[]) {
    const product = products.find((p) => p.id === PLAY_PRODUCT[plan]);
    if (!product) continue;
    for (const period of Object.keys(PLAY_BASE_PLAN) as BillingPeriod[]) {
      const offer = baseOffer(product.subscriptionOffers ?? [], PLAY_BASE_PLAN[period]);
      if (!offer?.offerTokenAndroid) continue;
      // The last phase is the price that repeats (earlier ones would be a trial or intro price).
      const phase = offer.pricingPhasesAndroid?.pricingPhaseList.at(-1);
      offers[key(plan, period)] = {
        sku: product.id,
        offerToken: offer.offerTokenAndroid,
        price: {
          text: phase?.formattedPrice ?? offer.displayPrice,
          amount: phase ? Number(phase.priceAmountMicros) / 1_000_000 : offer.price,
          currency: phase?.priceCurrencyCode ?? offer.currency ?? product.currency,
        },
      };
    }
  }
  return offers;
}

/** Google Play's prices for this person (their country's currency, tax included). Null if Play can't be reached. */
export async function loadStorePrices(): Promise<StorePrices | null> {
  try {
    const offers = await withStore(loadOffers);
    const prices: StorePrices = {};
    for (const [k, offer] of Object.entries(offers)) prices[k as keyof StorePrices] = offer.price;
    return Object.keys(prices).length ? prices : null;
  } catch {
    return null;
  }
}

const toStorePurchase = (p: Purchase): StorePurchase | null =>
  p.purchaseToken
    ? {
        purchaseToken: p.purchaseToken,
        productId: p.productId,
        packageName: ('packageNameAndroid' in p && p.packageNameAndroid) || undefined,
        acknowledged: 'isAcknowledgedAndroid' in p && p.isAcknowledgedAndroid === true,
        raw: p,
      }
    : null;

const isOurs = (p: Purchase) => PLAY_SKUS.includes(p.productId) || !!p.ids?.some((id) => PLAY_SKUS.includes(id));

async function owned(iap: Iap) {
  const purchases = await iap.getAvailablePurchases();
  return purchases.filter((p) => isOurs(p) && p.purchaseState === 'purchased');
}

/** Knowzone subscriptions the phone's Google account holds (for "Restore purchases" and finishing a purchase). */
export async function ownedPurchases(): Promise<StorePurchase[]> {
  const purchases = await withStore(owned);
  return purchases.map(toStorePurchase).filter((p): p is StorePurchase => !!p);
}

/**
 * Opens Google Play's payment sheet for a plan and waits for the result. The Knowzone user id travels
 * with the purchase (Google calls it the obfuscated account id), so the server can tell whose it is.
 * If the Google account already has another Knowzone subscription, this one replaces it: a different
 * plan (Plus ↔ Pro) switches at once and what's left of the old one is turned into time on the new;
 * a different period of the same plan is charged in full and starts now, with the unused time added.
 */
export function buyPlan(order: { plan: PaidPlan; period: BillingPeriod; userId: string }): Promise<BuyResult> {
  return withStore(async (iap) => {
    const offer = (await loadOffers(iap))[key(order.plan, order.period)];
    if (!offer) throw new StoreError('product');

    const current = (await owned(iap).catch(() => []))[0];
    if (current?.productId === offer.sku && current.currentPlanId === PLAY_BASE_PLAN[order.period])
      return { kind: 'owned' } as const;

    return new Promise<BuyResult>((resolve, reject) => {
      let settled = false;
      const finish = (act: () => void) => {
        if (settled) return;
        settled = true;
        bought.remove();
        failed.remove();
        act();
      };
      const fail = (e: unknown) => {
        const code = codeOf(e);
        if (code === 'user-cancelled') finish(() => resolve({ kind: 'cancelled' }));
        else if (code === 'already-owned') finish(() => resolve({ kind: 'owned' }));
        else if (code === 'pending' || code === 'deferred-payment') finish(() => resolve({ kind: 'pending' }));
        else finish(() => reject(storeError(e)));
      };
      const bought = iap.purchaseUpdatedListener((p) => {
        if (p.productId !== offer.sku && !p.ids?.includes(offer.sku)) return;
        if (p.purchaseState === 'pending') return finish(() => resolve({ kind: 'pending' }));
        const purchase = toStorePurchase(p);
        if (purchase) finish(() => resolve({ kind: 'purchased', purchase }));
        else fail(new StoreError('failed'));
      });
      const failed = iap.purchaseErrorListener(fail);
      iap
        .requestPurchase({
          type: 'subs',
          request: {
            google: {
              skus: [offer.sku],
              subscriptionOffers: [{ sku: offer.sku, offerToken: offer.offerToken }],
              obfuscatedAccountId: order.userId,
              ...(current?.purchaseToken && {
                purchaseToken: current.purchaseToken,
                subscriptionProductReplacementParams: {
                  oldProductId: current.productId,
                  replacementMode: current.productId === offer.sku ? 'charge-full-price' : 'with-time-proration',
                },
              }),
            },
          },
        })
        .catch(fail);
    });
    // Never retried by itself: a second try could open a second payment sheet.
  }, false);
}

/**
 * Tells Google Play the purchase was delivered, when the server couldn't (it normally does). A purchase
 * nobody acknowledges within 3 days is refunded by Google.
 */
export async function finishPurchase(purchase: StorePurchase): Promise<void> {
  try {
    const iap = await connect();
    await iap.finishTransaction({ purchase: purchase.raw as Purchase, isConsumable: false });
  } catch {
    // Already acknowledged, or Play is unreachable: the server tries again when Google next reports on it.
  }
}
