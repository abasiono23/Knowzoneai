import { randomUUID } from 'node:crypto';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { prisma } from '../src/db.js';
import { billingUpkeep } from '../src/services/billing.js';
import type { PlaySubscription } from '../src/services/google-play.js';
import { http, signIn } from './helpers.js';

// Google is replaced with a fake that keeps purchases in memory, so no test ever calls Google.
// The webhook's shared-secret check and the "Google says no" error are the real ones.
const play = vi.hoisted(() => ({
  purchases: new Map<string, object>(),
  acknowledged: [] as { productId: string; token: string }[],
  down: false,
  failAcknowledge: false,
}));

vi.mock('../src/services/google-play.js', async (importOriginal) => {
  const real = await importOriginal<typeof import('../src/services/google-play.js')>();
  return {
    ...real,
    googlePlayConfigured: () => true,
    getSubscription: vi.fn(async (token: string) => {
      if (play.down) throw new Error('Google Play 503: backend error');
      const p = play.purchases.get(token);
      if (!p) throw new real.GooglePlayRejected(404, 'Google Play 404: purchase token not found');
      return { ...p };
    }),
    acknowledge: vi.fn(async (productId: string, token: string) => {
      if (play.failAcknowledge) throw new Error('Google Play 500');
      play.acknowledged.push({ productId, token });
      (play.purchases.get(token) as PlaySubscription).acknowledged = true;
    }),
  };
});

// Flutterwave must never be reached from these tests either.
vi.mock('../src/services/flutterwave.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/services/flutterwave.js')>()),
  flutterwaveConfigured: () => true,
  hostedPayment: vi.fn(async () => ({ link: 'https://checkout.flutterwave.com/v3/hosted/pay/test' })),
  verify: vi.fn(async () => null),
  refund: vi.fn(async () => ({ status: 'completed' })),
}));

const DAY = 86_400_000;
const PACKAGE = 'ai.knowzone.app';
const SECRET = 'test-webhook-secret';

/** A purchase as Google would describe it: Plus monthly, paid, not yet acknowledged, bought by `accountId`. */
function purchase(accountId: string | null, over: Partial<PlaySubscription> = {}) {
  const token = `token-${randomUUID()}`;
  const p: PlaySubscription = {
    state: 'SUBSCRIPTION_STATE_ACTIVE',
    productId: 'knowzone_plus',
    basePlanId: 'monthly',
    expiresAt: Date.now() + 30 * DAY,
    autoRenew: true,
    orderId: `GPA.${randomUUID().slice(0, 18)}`,
    accountId,
    linkedToken: null,
    acknowledged: false,
    price: { amount: 500000, currency: 'NGN' },
    test: true,
    ...over,
  };
  play.purchases.set(token, p);
  return { token, p };
}

/** A Real-time developer notification as Cloud Pub/Sub pushes it. */
const notice = (data: object) => ({
  message: { data: Buffer.from(JSON.stringify(data)).toString('base64'), messageId: randomUUID() },
  subscription: 'projects/knowzone/subscriptions/play-billing',
});
const TYPES = { RECOVERED: 1, RENEWED: 2, CANCELED: 3, PURCHASED: 4, ON_HOLD: 5, REVOKED: 12, EXPIRED: 13 };
const push = (token: string, type: keyof typeof TYPES, secret = SECRET) =>
  http()
    .post(`/webhooks/google-play?token=${secret}`)
    .send(
      notice({
        version: '1.0',
        packageName: PACKAGE,
        eventTimeMillis: String(Date.now()),
        subscriptionNotification: { version: '1.0', notificationType: TYPES[type], purchaseToken: token },
      }),
    );

const account = (id: string) => prisma.user.findUniqueOrThrow({ where: { id } });
const subscription = (userId: string) => prisma.subscription.findUnique({ where: { userId } });

beforeEach(async () => {
  play.purchases.clear();
  play.acknowledged.length = 0;
  play.down = false;
  play.failAcknowledge = false;
  const { config } = await import('../src/config.js');
  (config as { GOOGLE_PLAY_WEBHOOK_SECRET?: string }).GOOGLE_PLAY_WEBHOOK_SECRET = SECRET;
});

describe('buying in the Android app', () => {
  it('unlocks the plan once Google confirms, with the first month’s credits, a receipt and an acknowledgement', async () => {
    const { as, sub } = await signIn();
    const before = (await account(sub)).aiCredits;
    const { token, p } = purchase(sub);

    const res = await as
      .post('/me/billing/google/verify', { purchaseToken: token, productId: 'knowzone_plus', packageName: PACKAGE })
      .expect(200);
    expect(res.body).toMatchObject({ status: 'active', acknowledged: true });
    expect(res.body.user).toMatchObject({ plan: 'PLUS', aiCredits: before + 60 });
    expect(res.body.payment).toMatchObject({
      status: 'paid',
      provider: 'google_play',
      plan: 'PLUS',
      period: 'month',
      amount: 5000,
      currency: 'NGN',
      reference: p.orderId,
      method: { type: 'store', label: 'Google Play' },
    });
    expect(play.acknowledged).toEqual([{ productId: 'knowzone_plus', token }]);

    // GET /me/billing says who manages the plan, and when Google says it ends.
    const { body } = await as.get('/me/billing').expect(200);
    expect(body.billing.subscription).toMatchObject({
      plan: 'PLUS',
      period: 'month',
      status: 'active',
      provider: 'google_play',
      autoRenew: true,
      currentPeriodEnd: p.expiresAt,
    });
    expect(body.billing.payments).toHaveLength(1);
  });

  it('maps each product and base plan to its plan and period', async () => {
    const { as, sub } = await signIn();
    const { token } = purchase(sub, {
      productId: 'knowzone_pro',
      basePlanId: 'yearly',
      expiresAt: Date.now() + 365 * DAY,
      price: { amount: 7700000, currency: 'NGN' },
    });
    const res = await as.post('/me/billing/google/verify', { purchaseToken: token, productId: 'knowzone_pro' }).expect(200);
    expect(res.body.user.plan).toBe('PRO');
    expect(res.body.payment).toMatchObject({ plan: 'PRO', period: 'year', amount: 77000 });
    expect(res.body.billing.subscription.period).toBe('year');

    const term = purchase(sub, { basePlanId: 'term', linkedToken: token });
    const again = await as.post('/me/billing/google/verify', { purchaseToken: term.token, productId: 'knowzone_plus' });
    expect(again.body.billing.subscription).toMatchObject({ plan: 'PLUS', period: 'term' });
  });

  it('is safe to send twice: one receipt, one set of credits, one acknowledgement', async () => {
    const { as, sub } = await signIn();
    const before = (await account(sub)).aiCredits;
    const { token } = purchase(sub);
    const body = { purchaseToken: token, productId: 'knowzone_plus' };
    await as.post('/me/billing/google/verify', body).expect(200);
    await as.post('/me/billing/google/verify', body).expect(200);
    // …and Google's own notification about the same purchase changes nothing more.
    await push(token, 'PURCHASED').expect(200);
    expect((await account(sub)).aiCredits).toBe(before + 60);
    expect(await prisma.payment.count({ where: { userId: sub } })).toBe(1);
    expect(play.acknowledged).toHaveLength(1);
  });

  it('refuses a purchase made for another account, and a token already linked to one', async () => {
    const buyer = await signIn({ email: 'buyer@example.com' });
    const other = await signIn({ email: 'other@example.com' });
    const { token } = purchase(buyer.sub);

    // Google says it was bought for someone else.
    const res = await other.as.post('/me/billing/google/verify', { purchaseToken: token, productId: 'knowzone_plus' });
    expect(res.status).toBe(409);
    expect(res.body.reason).toBe('store-other-account');
    expect((await account(other.sub)).plan).toBe('FREE');
    expect(play.acknowledged).toHaveLength(0);

    // A purchase without an account id goes to whoever claims it first, and to nobody else after.
    const loose = purchase(null);
    await buyer.as.post('/me/billing/google/verify', { purchaseToken: loose.token, productId: 'knowzone_plus' }).expect(200);
    await other.as.post('/me/billing/google/verify', { purchaseToken: loose.token, productId: 'knowzone_plus' }).expect(409);
    expect((await account(other.sub)).plan).toBe('FREE');
  });

  it('refuses a purchase from another app, a token Google doesn’t know, and a product that isn’t a plan', async () => {
    const { as, sub } = await signIn();
    const { token } = purchase(sub);
    const wrong = await as.post('/me/billing/google/verify', {
      purchaseToken: token,
      productId: 'knowzone_plus',
      packageName: 'com.someone.else',
    });
    expect(wrong.status).toBe(400);
    expect(wrong.body.reason).toBe('store-package');

    // Google only knows tokens of this app's package: anything else comes back "not found".
    const unknown = await as.post('/me/billing/google/verify', { purchaseToken: 'made-up-token-123', productId: 'knowzone_plus' });
    expect(unknown.status).toBe(400);
    expect(unknown.body.reason).toBe('store-invalid');

    const odd = purchase(sub, { productId: 'coins_100' });
    const notPlan = await as.post('/me/billing/google/verify', { purchaseToken: odd.token, productId: 'coins_100' });
    expect(notPlan.status).toBe(400);
    expect((await account(sub)).plan).toBe('FREE');
    expect(await prisma.payment.count()).toBe(0);
  });

  it('doesn’t unlock a purchase that is still waiting for money, expired or on hold', async () => {
    const { as, sub } = await signIn();
    const waiting = purchase(sub, { state: 'SUBSCRIPTION_STATE_PENDING', orderId: null });
    const res = await as.post('/me/billing/google/verify', { purchaseToken: waiting.token, productId: 'knowzone_plus' }).expect(200);
    expect(res.body).toMatchObject({ status: 'pending', payment: null });
    expect(res.body.user.plan).toBe('FREE');
    expect(play.acknowledged).toHaveLength(0);

    for (const state of ['SUBSCRIPTION_STATE_EXPIRED', 'SUBSCRIPTION_STATE_ON_HOLD'] as const) {
      const { token } = purchase(sub, { state });
      const r = await as.post('/me/billing/google/verify', { purchaseToken: token, productId: 'knowzone_plus' }).expect(200);
      expect(r.body.status).toBe('inactive');
      expect(r.body.user.plan).toBe('FREE');
    }

    // The money arrives: Google's notification unlocks the plan without the app.
    Object.assign(waiting.p, { state: 'SUBSCRIPTION_STATE_ACTIVE', orderId: 'GPA.1111-2222-3333-44444' });
    await push(waiting.token, 'PURCHASED').expect(200);
    expect((await account(sub)).plan).toBe('PLUS');
    expect(play.acknowledged).toEqual([{ productId: 'knowzone_plus', token: waiting.token }]);
  });

  it('says so when Google can’t be reached, and leaves the acknowledgement to the app if that part fails', async () => {
    const { as, sub } = await signIn();
    const { token } = purchase(sub);
    play.down = true;
    const res = await as.post('/me/billing/google/verify', { purchaseToken: token, productId: 'knowzone_plus' });
    expect(res.status).toBe(502);
    expect((await account(sub)).plan).toBe('FREE');

    play.down = false;
    play.failAcknowledge = true;
    const ok = await as.post('/me/billing/google/verify', { purchaseToken: token, productId: 'knowzone_plus' }).expect(200);
    expect(ok.body).toMatchObject({ status: 'active', acknowledged: false });
    expect(ok.body.user.plan).toBe('PLUS');
  });

  it('needs a signed-in account', async () => {
    await http().post('/me/billing/google/verify').send({ purchaseToken: 'x'.repeat(20), productId: 'knowzone_plus' }).expect(401);
    await http().post('/me/billing/google/restore').send({ purchases: [] }).expect(401);
  });
});

describe('Google’s notifications', () => {
  it('rejects a notification without the shared secret', async () => {
    const { as, sub } = await signIn();
    const { token } = purchase(sub);
    await as.post('/me/billing/google/verify', { purchaseToken: token, productId: 'knowzone_plus' }).expect(200);
    play.purchases.get(token)!.state = 'SUBSCRIPTION_STATE_EXPIRED';

    await push(token, 'EXPIRED', 'wrong-secret').expect(401);
    await http().post('/webhooks/google-play').send(notice({ packageName: PACKAGE })).expect(401);
    expect((await account(sub)).plan).toBe('PLUS');

    // With no secret set on the server, nothing gets in at all.
    const { config } = await import('../src/config.js');
    (config as { GOOGLE_PLAY_WEBHOOK_SECRET?: string }).GOOGLE_PLAY_WEBHOOK_SECRET = undefined;
    await push(token, 'EXPIRED', '').expect(401);
    await push(token, 'EXPIRED', 'undefined').expect(401);
    expect((await account(sub)).plan).toBe('PLUS');
  });

  it('renews: a new receipt and a later end date, without a second first-month credit grant', async () => {
    const { as, sub } = await signIn();
    const { token, p } = purchase(sub, { orderId: 'GPA.3333-4444-5555-66666' });
    await as.post('/me/billing/google/verify', { purchaseToken: token, productId: 'knowzone_plus' }).expect(200);
    const credits = (await account(sub)).aiCredits;

    Object.assign(p, { expiresAt: p.expiresAt! + 30 * DAY, orderId: 'GPA.3333-4444-5555-66666..0' });
    await push(token, 'RENEWED').expect(200);
    await push(token, 'RENEWED').expect(200); // Pub/Sub delivers at least once

    const s = await subscription(sub);
    expect(s).toMatchObject({ status: 'active', plan: 'PLUS', provider: 'google_play', autoRenew: true });
    expect(s!.currentPeriodEnd.getTime()).toBe(p.expiresAt);
    const payments = await prisma.payment.findMany({ where: { userId: sub }, orderBy: { createdAt: 'asc' } });
    expect(payments.map((x) => [x.reference, x.renewal, x.status])).toEqual([
      ['GPA.3333-4444-5555-66666', false, 'paid'],
      ['GPA.3333-4444-5555-66666..0', true, 'paid'],
    ]);
    // Monthly credits keep their own schedule (the hourly upkeep adds them).
    expect((await account(sub)).aiCredits).toBe(credits);
  });

  it('cancel keeps the plan until the paid time ends; expiry moves the account to Free and says so', async () => {
    const { as, sub } = await signIn();
    const { token, p } = purchase(sub);
    await as.post('/me/billing/google/verify', { purchaseToken: token, productId: 'knowzone_plus' }).expect(200);

    Object.assign(p, { state: 'SUBSCRIPTION_STATE_CANCELED', autoRenew: false });
    await push(token, 'CANCELED').expect(200);
    expect(await subscription(sub)).toMatchObject({ status: 'cancelled', autoRenew: false, plan: 'PLUS' });
    expect((await account(sub)).plan).toBe('PLUS');
    expect(await prisma.payment.count({ where: { userId: sub } })).toBe(1);

    Object.assign(p, { state: 'SUBSCRIPTION_STATE_EXPIRED', expiresAt: Date.now() - 1000 });
    await push(token, 'EXPIRED').expect(200);
    expect(await subscription(sub)).toMatchObject({ status: 'expired' });
    expect((await account(sub)).plan).toBe('FREE');
    const inbox = await prisma.notification.findMany({ where: { userId: sub } });
    expect(inbox.some((n) => n.template === 'subscriptionExpired')).toBe(true);
  });

  it('on hold takes the plan away, and recovering brings it back', async () => {
    const { as, sub } = await signIn();
    const { token, p } = purchase(sub, { orderId: 'GPA.7777-8888-9999-00000' });
    await as.post('/me/billing/google/verify', { purchaseToken: token, productId: 'knowzone_plus' }).expect(200);

    p.state = 'SUBSCRIPTION_STATE_ON_HOLD';
    await push(token, 'ON_HOLD').expect(200);
    expect((await account(sub)).plan).toBe('FREE');

    Object.assign(p, {
      state: 'SUBSCRIPTION_STATE_ACTIVE',
      expiresAt: Date.now() + 30 * DAY,
      orderId: 'GPA.7777-8888-9999-00000..0',
    });
    await push(token, 'RECOVERED').expect(200);
    expect((await account(sub)).plan).toBe('PLUS');
    expect(await subscription(sub)).toMatchObject({ status: 'active', provider: 'google_play' });
  });

  it('revoke ends the plan at once and marks the receipt refunded', async () => {
    const { as, sub } = await signIn();
    const { token, p } = purchase(sub);
    await as.post('/me/billing/google/verify', { purchaseToken: token, productId: 'knowzone_plus' }).expect(200);

    p.state = 'SUBSCRIPTION_STATE_EXPIRED';
    await push(token, 'REVOKED').expect(200);
    expect((await account(sub)).plan).toBe('FREE');
    const s = await subscription(sub);
    expect(s!.status).toBe('expired');
    expect(s!.currentPeriodEnd.getTime()).toBeLessThanOrEqual(Date.now());
    expect(await prisma.payment.findFirstOrThrow({ where: { userId: sub } })).toMatchObject({ status: 'refunded' });
  });

  it('an upgrade replaces the old purchase, and the old one expiring afterwards changes nothing', async () => {
    const { as, sub } = await signIn();
    const plus = purchase(sub);
    await as.post('/me/billing/google/verify', { purchaseToken: plus.token, productId: 'knowzone_plus' }).expect(200);
    const credits = (await account(sub)).aiCredits;

    const pro = purchase(sub, { productId: 'knowzone_pro', linkedToken: plus.token, price: { amount: 900000, currency: 'NGN' } });
    plus.p.state = 'SUBSCRIPTION_STATE_EXPIRED';
    const res = await as.post('/me/billing/google/verify', { purchaseToken: pro.token, productId: 'knowzone_pro' }).expect(200);
    expect(res.body.user).toMatchObject({ plan: 'PRO', aiCredits: credits + 200 });

    await push(plus.token, 'EXPIRED').expect(200);
    expect((await account(sub)).plan).toBe('PRO');
    expect(await subscription(sub)).toMatchObject({ status: 'active', plan: 'PRO' });
    expect(await prisma.googlePlayPurchase.findUniqueOrThrow({ where: { purchaseToken: plus.token } })).toMatchObject({
      userId: sub,
    });
  });

  it('answers 2xx for notices that aren’t ours or can’t be read, and asks for a retry only when Google is down', async () => {
    const { as, sub } = await signIn();
    const { token, p } = purchase(sub);
    await as.post('/me/billing/google/verify', { purchaseToken: token, productId: 'knowzone_plus' }).expect(200);
    p.state = 'SUBSCRIPTION_STATE_EXPIRED';
    const url = `/webhooks/google-play?token=${SECRET}`;

    // Another app's package: ignored, even though the token is real.
    await http()
      .post(url)
      .send(notice({ packageName: 'com.someone.else', subscriptionNotification: { notificationType: 13, purchaseToken: token } }))
      .expect(200);
    expect((await account(sub)).plan).toBe('PLUS');

    await http().post(url).send(notice({ version: '1.0', packageName: PACKAGE, testNotification: { version: '1.0' } })).expect(200);
    await http().post(url).send({ message: { data: 'not base64 json' } }).expect(200);
    await http().post(url).send({}).expect(200);
    await push('a-token-nobody-knows', 'RENEWED').expect(200);
    // A purchase Google knows but no account here owns.
    const stranger = purchase(randomUUID());
    await push(stranger.token, 'PURCHASED').expect(200);
    expect(await prisma.payment.count()).toBe(1);

    play.down = true;
    await push(token, 'EXPIRED').expect(503);
    expect((await account(sub)).plan).toBe('PLUS');
    play.down = false;
    await push(token, 'EXPIRED').expect(200);
    expect((await account(sub)).plan).toBe('FREE');
  });
});

describe('restore, and living next to Flutterwave', () => {
  it('restores what the phone’s Google account owns onto the account that bought it', async () => {
    const { as, sub } = await signIn();
    const nothing = await as.post('/me/billing/google/restore', { purchases: [] }).expect(200);
    expect(nothing.body).toMatchObject({ restored: false, otherAccount: false });

    const { token } = purchase(sub, { acknowledged: true });
    const res = await as
      .post('/me/billing/google/restore', {
        purchases: [
          { purchaseToken: 'a-token-nobody-knows', productId: 'knowzone_plus' },
          { purchaseToken: token, productId: 'knowzone_plus', packageName: PACKAGE },
        ],
      })
      .expect(200);
    expect(res.body).toMatchObject({ restored: true, otherAccount: false });
    expect(res.body.user.plan).toBe('PLUS');
    expect(res.body.billing.subscription.provider).toBe('google_play');

    // Someone else signed in on the same phone doesn't get the plan.
    const other = await signIn({ email: 'other@example.com' });
    const no = await other.as
      .post('/me/billing/google/restore', { purchases: [{ purchaseToken: token, productId: 'knowzone_plus' }] })
      .expect(200);
    expect(no.body).toMatchObject({ restored: false, otherAccount: true });
    expect(no.body.user.plan).toBe('FREE');
  });

  it('sends cancel, resume and a second payment to Google Play instead of doing them here', async () => {
    const { as, sub } = await signIn();
    const { token, p } = purchase(sub);
    await as.post('/me/billing/google/verify', { purchaseToken: token, productId: 'knowzone_plus' }).expect(200);

    const cancel = await as.post('/me/billing/cancel', { reason: 'price' });
    expect(cancel.status).toBe(409);
    expect(cancel.body.reason).toBe('store-managed');
    const pay = await as.post('/me/billing/checkout', { plan: 'PRO', period: 'month', method: { type: 'card', label: 'Card' } });
    expect(pay.status).toBe(409);
    expect(await subscription(sub)).toMatchObject({ status: 'active', plan: 'PLUS' });

    Object.assign(p, { state: 'SUBSCRIPTION_STATE_CANCELED', autoRenew: false });
    await push(token, 'CANCELED').expect(200);
    const resume = await as.post('/me/billing/resume');
    expect(resume.status).toBe(409);
    expect(resume.body.reason).toBe('store-managed');
  });

  it('the hourly upkeep asks Google before ending a plan whose renewal notice never came', async () => {
    const { as, sub } = await signIn();
    const { token, p } = purchase(sub, { orderId: 'GPA.5555-6666-7777-88888' });
    await as.post('/me/billing/google/verify', { purchaseToken: token, productId: 'knowzone_plus' }).expect(200);
    await prisma.subscription.update({ where: { userId: sub }, data: { currentPeriodEnd: new Date(Date.now() - 60_000) } });

    // Google renewed it; the notice was lost.
    Object.assign(p, { expiresAt: Date.now() + 30 * DAY, orderId: 'GPA.5555-6666-7777-88888..0' });
    await billingUpkeep();
    expect((await account(sub)).plan).toBe('PLUS');
    expect((await subscription(sub))!.currentPeriodEnd.getTime()).toBe(p.expiresAt);

    // Google unreachable just after the end: the plan isn't taken away on a guess.
    await prisma.subscription.update({ where: { userId: sub }, data: { currentPeriodEnd: new Date(Date.now() - 60_000) } });
    play.down = true;
    await billingUpkeep();
    expect((await account(sub)).plan).toBe('PLUS');

    // It really ended.
    play.down = false;
    Object.assign(p, { state: 'SUBSCRIPTION_STATE_EXPIRED', expiresAt: Date.now() - 60_000 });
    await billingUpkeep();
    expect((await account(sub)).plan).toBe('FREE');
    expect(await subscription(sub)).toMatchObject({ status: 'expired' });
  });

  it('a Flutterwave payment still makes a Flutterwave-managed plan', async () => {
    const { as } = await signIn();
    const { body } = await as.get('/me/billing').expect(200);
    expect(body.billing.subscription).toBeNull();
    const res = await as
      .post('/me/billing/checkout', { plan: 'PLUS', period: 'month', method: { type: 'card', label: 'Card' } })
      .expect(201);
    expect(res.body.payment).toMatchObject({ provider: 'flutterwave', status: 'pending', amount: 5000 });
  });
});
