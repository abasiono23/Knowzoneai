import { timingSafeEqual } from 'node:crypto';

import { config } from '../config.js';
import { AppError } from '../lib/errors.js';

/**
 * Flutterwave payments (API v3): cards in NGN or USD on Flutterwave's hosted payment page (card
 * details never touch Knowzone), plus NGN bank transfers to a one-time account and USSD codes.
 * Docs: developer.flutterwave.com. Test keys (FLWSECK_TEST-…) use the same address as live ones.
 */

export type Currency = 'NGN' | 'USD';

export const flutterwaveConfigured = () => !!config.FLW_SECRET_KEY;

const notConfigured = () => new AppError(503, 'Payments aren’t set up on this server yet', 'not-configured');

async function call<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  if (!flutterwaveConfigured()) throw notConfigured();
  const res = await fetch(`${config.FLW_BASE_URL}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${config.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    ...(init.body !== undefined && { body: JSON.stringify(init.body) }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    status?: string;
    message?: string;
    data?: T;
    meta?: unknown;
  };
  if (!res.ok || body.status !== 'success') throw new Error(`Flutterwave ${path}: ${body.message ?? res.status}`);
  return {
    ...(body.data as object),
    ...(body.meta ? { meta: body.meta } : {}),
  } as T;
}

/** Starts a payment on Flutterwave's hosted page; the learner pays on `link`. */
export async function hostedPayment(input: {
  reference: string;
  amount: number;
  currency: Currency;
  redirectUrl: string;
  customer: { email: string; name: string };
  description: string;
  meta?: Record<string, string>;
}) {
  const r = await call<{ link: string }>('/v3/payments', {
    method: 'POST',
    body: {
      tx_ref: input.reference,
      amount: input.amount,
      currency: input.currency,
      redirect_url: input.redirectUrl,
      // Dollar payments are by card; naira payments can use card, transfer or USSD on the page.
      payment_options: input.currency === 'USD' ? 'card' : 'card,banktransfer,ussd',
      customer: input.customer,
      customizations: { title: 'Knowzone AI', description: input.description },
      meta: input.meta ?? {},
    },
  });
  return { link: r.link };
}

type Authorization = {
  meta?: {
    authorization?: {
      transfer_account?: string;
      transfer_bank?: string;
      transfer_amount?: number;
      account_expiration?: string;
      note?: string;
    };
  };
};

/** A one-time naira account to pay into (bank transfer). */
export async function bankTransfer(input: { reference: string; amount: number; email: string }) {
  const r = await call<Authorization>('/v3/charges?type=bank_transfer', {
    method: 'POST',
    body: {
      tx_ref: input.reference,
      amount: input.amount,
      currency: 'NGN',
      email: input.email,
      is_permanent: false,
    },
  });
  const a = r.meta?.authorization ?? {};
  return {
    bank: a.transfer_bank ?? 'Bank',
    accountNumber: a.transfer_account ?? '',
    accountName: 'Knowzone AI (Flutterwave)',
    expiresAt: a.account_expiration ? Date.parse(a.account_expiration) : Date.now() + 60 * 60_000,
  };
}

/** Flutterwave bank codes for USSD payments. */
export const USSD_BANKS: Record<string, string> = {
  GTBank: '058',
  'Access Bank': '044',
  'Zenith Bank': '057',
  'First Bank': '011',
  UBA: '033',
  'Fidelity Bank': '070',
};

/** A USSD code to dial (naira only). */
export async function ussd(input: { reference: string; amount: number; email: string; bank: string }) {
  const account_bank = USSD_BANKS[input.bank];
  if (!account_bank) throw new AppError(400, 'Choose a bank that supports USSD payments', 'invalid');
  const r = await call<Authorization>('/v3/charges?type=ussd', {
    method: 'POST',
    body: {
      tx_ref: input.reference,
      account_bank,
      amount: input.amount,
      currency: 'NGN',
      email: input.email,
    },
  });
  return {
    bank: input.bank,
    code: r.meta?.authorization?.note ?? '',
    expiresAt: Date.now() + 15 * 60_000,
  };
}

export type FlwStatus = 'successful' | 'failed' | 'pending' | string;

/** Where a payment stands, by our reference. Null when Flutterwave hasn't seen it (not paid yet). */
export async function verify(reference: string) {
  try {
    const r = await call<{
      id: number;
      status: FlwStatus;
      amount: number;
      charged_amount?: number;
      currency: string;
      payment_type?: string;
    }>(`/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`);
    return {
      id: String(r.id),
      status: r.status,
      amount: Number(r.amount ?? 0),
      currency: r.currency,
      method: r.payment_type,
    };
  } catch (e) {
    if (e instanceof AppError) throw e;
    // "No transaction was found for this id": the learner hasn't paid yet.
    return null;
  }
}

/** Refunds a paid transaction (by Flutterwave's transaction id). */
export function refund(transactionId: string, amount: number) {
  return call<{ status: string }>(`/v3/transactions/${encodeURIComponent(transactionId)}/refund`, { method: 'POST', body: { amount } });
}

/**
 * Webhooks carry the secret hash set in the Flutterwave dashboard (Settings → Webhooks) in
 * `verif-hash`; anything without it is ignored.
 */
export function validWebhook(hash: string | undefined) {
  if (!hash || !config.FLW_SECRET_HASH) return false;
  const a = Buffer.from(hash);
  const b = Buffer.from(config.FLW_SECRET_HASH);
  return a.length === b.length && timingSafeEqual(a, b);
}
