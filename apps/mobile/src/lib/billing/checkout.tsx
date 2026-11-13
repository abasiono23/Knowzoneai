import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import type { PaymentMethodInfo } from '../api';
import {
  CURRENCIES,
  PERIOD,
  defaultCurrency,
  discountOf,
  money,
  perMonth,
  priceOf,
  type BillingPeriod,
  type Currency,
  type PaidPlan,
} from './plans';
import { STORE_UI, loadStorePrices, type StorePrices } from './store';

const CURRENCY_KEY = 'knowzone.currency';

export type Promo = { code: string; percent: number; label: string };

type Draft = {
  plan: PaidPlan;
  period: BillingPeriod;
  /** Naira or dollars; dollars are card only. Remembered on this device. */
  currency: Currency;
  promo: Promo | null;
  method: PaymentMethodInfo | null;
  /** Mock-only: lets testers see declined card payments. */
  outcome: 'success' | 'declined';
};

type Checkout = Draft & {
  set: (patch: Partial<Draft>) => void;
  price: number;
  discount: number;
  total: number;
  /**
   * A plan's price as it should be shown: the app store's own price on Android (Google Play sets the
   * currency and adds tax per country), otherwise ours in the chosen currency.
   */
  priceText: (plan: PaidPlan, period: BillingPeriod) => string;
  /** The same price as a monthly equivalent, for comparing periods. */
  perMonthText: (plan: PaidPlan, period: BillingPeriod) => string;
  /** The currency the prices above are in ("NGN", "USD", or whatever Google Play charges in). */
  shownCurrency: string;
};

const Ctx = createContext<Checkout | null>(null);

/** The order being built across checkout, payment method and processing. */
export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<Draft>({
    plan: 'PLUS',
    period: 'month',
    currency: defaultCurrency(),
    promo: null,
    method: null,
    outcome: 'success',
  });
  const [storePrices, setStorePrices] = useState<StorePrices | null>(null);
  useEffect(() => {
    AsyncStorage.getItem(CURRENCY_KEY)
      .then((c) => {
        if (CURRENCIES.includes(c as Currency)) setDraft((d) => ({ ...d, currency: c as Currency }));
      })
      .catch(() => {});
    // Google Play's prices for this person. Until they arrive (or if Play can't be reached) ours are shown.
    if (STORE_UI)
      loadStorePrices()
        .then(setStorePrices)
        .catch(() => {});
  }, []);
  const set = (patch: Partial<Draft>) => {
    if (patch.currency) AsyncStorage.setItem(CURRENCY_KEY, patch.currency).catch(() => {});
    setDraft((d) => {
      const next = { ...d, ...patch };
      // Transfer and USSD are naira only.
      if (next.currency === 'USD' && next.method && next.method.type !== 'card') next.method = null;
      // Our promo codes don't exist in the app store, which sets its own price.
      if (STORE_UI) next.promo = null;
      return next;
    });
  };
  const price = priceOf(draft.plan, draft.period, draft.currency);
  const discount = draft.promo ? discountOf(price, draft.promo.percent) : 0;
  const priceText = (plan: PaidPlan, period: BillingPeriod) =>
    storePrices?.[`${plan}:${period}`]?.text ?? money(priceOf(plan, period, draft.currency), draft.currency);
  const perMonthText = (plan: PaidPlan, period: BillingPeriod) => {
    const store = storePrices?.[`${plan}:${period}`];
    return store
      ? money(store.amount / PERIOD[period].months, store.currency)
      : money(perMonth(plan, period, draft.currency), draft.currency);
  };
  return (
    <Ctx.Provider
      value={{
        ...draft,
        set,
        price,
        discount,
        total: Math.round((price - discount) * 100) / 100,
        priceText,
        perMonthText,
        shownCurrency: Object.values(storePrices ?? {})[0]?.currency ?? draft.currency,
      }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCheckout() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCheckout must be used inside CheckoutProvider');
  return ctx;
}
