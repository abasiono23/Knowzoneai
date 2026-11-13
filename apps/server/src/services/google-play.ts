import { timingSafeEqual } from 'node:crypto';

import { SignJWT, importPKCS8 } from 'jose';

import { config } from '../config.js';
import { AppError } from '../lib/errors.js';

/**
 * Google Play Billing, server side (Google Play Developer API v3): reads a subscription purchase by
 * its token and acknowledges it. The server signs in as a service account (a robot Google account
 * the owner creates and invites to Play Console); its key lives in GOOGLE_PLAY_SERVICE_ACCOUNT.
 * Docs: developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptionsv2
 */

const API = 'https://androidpublisher.googleapis.com/androidpublisher/v3';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/androidpublisher';

type ServiceAccount = { client_email: string; private_key: string; token_uri?: string };

let account: ServiceAccount | null | undefined;

/** The service account key from the environment: raw JSON or base64 of it. Null if missing or unreadable. */
function serviceAccount() {
  if (account !== undefined) return account;
  const raw = config.GOOGLE_PLAY_SERVICE_ACCOUNT?.trim();
  account = null;
  if (raw) {
    try {
      const json = JSON.parse(raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')) as ServiceAccount;
      if (json.client_email && json.private_key) account = json;
    } catch {}
    if (!account) console.warn('GOOGLE_PLAY_SERVICE_ACCOUNT is set but is not a service account JSON key (raw or base64)');
  }
  return account;
}

export const googlePlayConfigured = () => !!serviceAccount();

const notConfigured = () => new AppError(503, 'Google Play purchases aren’t set up on this server yet', 'not-configured');

let cached: { token: string; expiresAt: number } | null = null;

/** A short-lived access token, from a JWT signed with the service account's key (OAuth 2.0 JWT bearer flow). */
async function accessToken() {
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;
  const sa = serviceAccount();
  if (!sa) throw notConfigured();
  const aud = sa.token_uri ?? TOKEN_URL;
  const assertion = await new SignJWT({ scope: SCOPE })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(sa.client_email)
    .setAudience(aud)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(await importPKCS8(sa.private_key, 'RS256'));
  const res = await fetch(aud, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error_description?: string;
  };
  if (!res.ok || !body.access_token) throw new Error(`Google sign-in failed: ${body.error_description ?? res.status}`);
  cached = { token: body.access_token, expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000 };
  return cached.token;
}

/** Google's answer was a clear "no" (unknown, malformed or long-expired token), not an outage. */
export class GooglePlayRejected extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function call<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = await accessToken();
  const res = await fetch(`${API}/applications/${encodeURIComponent(config.GOOGLE_PLAY_PACKAGE)}${path}`, {
    method: init.method ?? 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(init.body !== undefined && { body: JSON.stringify(init.body) }),
  });
  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  if (!res.ok) {
    const message = `Google Play ${res.status}: ${body.error?.message ?? 'request failed'}`;
    // 400 bad token, 404 not this app's, 410 expired over 60 days ago. 401/403/5xx are ours or Google's to fix.
    if ([400, 404, 410].includes(res.status)) throw new GooglePlayRejected(res.status, message);
    throw new Error(message);
  }
  return body as T;
}

export type PlayState =
  | 'SUBSCRIPTION_STATE_UNSPECIFIED'
  | 'SUBSCRIPTION_STATE_PENDING'
  | 'SUBSCRIPTION_STATE_ACTIVE'
  | 'SUBSCRIPTION_STATE_PAUSED'
  | 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD'
  | 'SUBSCRIPTION_STATE_ON_HOLD'
  | 'SUBSCRIPTION_STATE_CANCELED'
  | 'SUBSCRIPTION_STATE_EXPIRED'
  | 'SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED';

/** A subscription purchase as Google describes it, reduced to what Knowzone uses. */
export type PlaySubscription = {
  state: PlayState;
  productId: string;
  basePlanId: string;
  /** When the paid time ends (Google moves it forward on each renewal and during a grace period). */
  expiresAt: number | null;
  autoRenew: boolean;
  /** The latest order Google charged (GPA.1234-5678-9012-34567, with ..0, ..1 added for renewals). */
  orderId: string | null;
  /** The Knowzone user id the app attached when the purchase started. */
  accountId: string | null;
  /** The purchase this one replaced (upgrade, new period or re-subscribe). */
  linkedToken: string | null;
  acknowledged: boolean;
  /** The recurring price in minor units (kobo, cents) and its currency, when Google gives one. */
  price: { amount: number; currency: string } | null;
  /** Bought by a licence tester: no real money. */
  test: boolean;
};

type V2 = {
  subscriptionState?: PlayState;
  latestOrderId?: string;
  linkedPurchaseToken?: string;
  acknowledgementState?: string;
  externalAccountIdentifiers?: { obfuscatedExternalAccountId?: string };
  testPurchase?: object;
  lineItems?: {
    productId?: string;
    expiryTime?: string;
    latestSuccessfulOrderId?: string;
    autoRenewingPlan?: {
      autoRenewEnabled?: boolean;
      recurringPrice?: { currencyCode?: string; units?: string; nanos?: number };
    };
    offerDetails?: { basePlanId?: string };
  }[];
};

/** Where a subscription purchase stands (purchases.subscriptionsv2.get). Throws GooglePlayRejected for a bad token. */
export async function getSubscription(purchaseToken: string): Promise<PlaySubscription> {
  const r = await call<V2>(`/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`);
  // One product per purchase here; if Google lists several, the one that lasts longest counts.
  const item = [...(r.lineItems ?? [])].sort(
    (a, b) => Date.parse(b.expiryTime ?? '') - Date.parse(a.expiryTime ?? ''),
  )[0];
  const money = item?.autoRenewingPlan?.recurringPrice;
  const expiresAt = item?.expiryTime ? Date.parse(item.expiryTime) : NaN;
  return {
    state: r.subscriptionState ?? 'SUBSCRIPTION_STATE_UNSPECIFIED',
    productId: item?.productId ?? '',
    basePlanId: item?.offerDetails?.basePlanId ?? '',
    expiresAt: Number.isFinite(expiresAt) ? expiresAt : null,
    autoRenew: item?.autoRenewingPlan?.autoRenewEnabled === true,
    orderId: item?.latestSuccessfulOrderId ?? r.latestOrderId ?? null,
    accountId: r.externalAccountIdentifiers?.obfuscatedExternalAccountId ?? null,
    linkedToken: r.linkedPurchaseToken ?? null,
    acknowledged: r.acknowledgementState === 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED',
    price: money?.currencyCode
      ? { amount: Math.round(Number(money.units ?? 0) * 100 + (money.nanos ?? 0) / 1e7), currency: money.currencyCode }
      : null,
    test: !!r.testPurchase,
  };
}

/**
 * Tells Google the purchase was delivered (purchases.subscriptions.acknowledge). A purchase that
 * isn't acknowledged within 3 days is refunded by Google automatically.
 */
export async function acknowledge(productId: string, purchaseToken: string) {
  await call(
    `/purchases/subscriptions/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`,
    { method: 'POST', body: {} },
  );
}

/**
 * Google's notifications (Pub/Sub push) carry the shared secret we put in the push address
 * (…/webhooks/google-play?token=…); anything without it is ignored.
 */
export function validWebhook(token: string | undefined) {
  if (!token || !config.GOOGLE_PLAY_WEBHOOK_SECRET) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(config.GOOGLE_PLAY_WEBHOOK_SECRET);
  return a.length === b.length && timingSafeEqual(a, b);
}
