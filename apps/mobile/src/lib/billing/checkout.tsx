import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import type { PaymentMethodInfo } from '../api';
import {
  CURRENCIES,
  defaultCurrency,
  discountOf,
  priceOf,
  type BillingPeriod,
  type Currency,
  type PaidPlan,
} from './plans';

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
  useEffect(() => {
    AsyncStorage.getItem(CURRENCY_KEY)
      .then((c) => {
        if (CURRENCIES.includes(c as Currency)) setDraft((d) => ({ ...d, currency: c as Currency }));
      })
      .catch(() => {});
  }, []);
  const set = (patch: Partial<Draft>) => {
    if (patch.currency) AsyncStorage.setItem(CURRENCY_KEY, patch.currency).catch(() => {});
    setDraft((d) => {
      const next = { ...d, ...patch };
      // Transfer and USSD are naira only.
      if (next.currency === 'USD' && next.method && next.method.type !== 'card') next.method = null;
      return next;
    });
  };
  const price = priceOf(draft.plan, draft.period, draft.currency);
  const discount = draft.promo ? discountOf(price, draft.promo.percent) : 0;
  return (
    <Ctx.Provider
      value={{
        ...draft,
        set,
        price,
        discount,
        total: Math.round((price - discount) * 100) / 100,
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
