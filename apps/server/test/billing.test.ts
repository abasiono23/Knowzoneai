import { describe, expect, it, vi } from 'vitest';

import { prisma } from '../src/db.js';
import { billingUpkeep } from '../src/services/billing.js';
import { http, signIn } from './helpers.js';

// Flutterwave is replaced with a fake that keeps transactions in memory; the webhook hash check is real.
const flw = vi.hoisted(() => ({
  tx: new Map<string, { id: string; amount: number; currency: string; status: string }>(),
  refunds: [] as { id: string; amount: number }[],
  failInit: false,
  failDirect: false,
}));

vi.mock('../src/services/flutterwave.js', async (importOriginal) => {
  const real = await importOriginal<typeof import('../src/services/flutterwave.js')>();
  const start = (reference: string, amount: number, currency: string) =>
    flw.tx.set(reference, {
      id: String(1000 + flw.tx.size),
      amount,
      currency,
      status: 'pending',
    });
  return {
    ...real,
    flutterwaveConfigured: () => true,
    hostedPayment: vi.fn(async (i: { reference: string; amount: number; currency: string }) => {
      if (flw.failInit) throw new Error('Flutterwave down');
      start(i.reference, i.amount, i.currency);
      return {
        link: `https://checkout.flutterwave.com/v3/hosted/pay/${i.reference}`,
      };
    }),
    bankTransfer: vi.fn(async (i: { reference: string; amount: number }) => {
      if (flw.failDirect) throw new Error('not enabled');
      start(i.reference, i.amount, 'NGN');
      return {
        bank: 'Wema Bank',
        accountNumber: '7812345678',
        accountName: 'Knowzone AI (Flutterwave)',
        expiresAt: Date.now() + 60 * 60_000,
      };
    }),
    ussd: vi.fn(async (i: { reference: string; amount: number; bank: string }) => {
      start(i.reference, i.amount, 'NGN');
      return {
        bank: i.bank,
        code: '*737*000*1234#',
        expiresAt: Date.now() + 15 * 60_000,
      };
    }),
    verify: vi.fn(async (ref: string) => {
      const t = flw.tx.get(ref);
      return t
        ? {
            id: t.id,
            status: t.status,
            amount: t.amount,
            currency: t.currency,
            method: 'card',
          }
        : null;
    }),
    refund: vi.fn(async (id: string, amount: number) => {
      flw.refunds.push({ id, amount });
      return { status: 'completed' };
    }),
  };
});

const pay = (reference: string, status = 'successful') => {
  flw.tx.get(reference)!.status = status;
};
const CARD = { type: 'card', label: 'Card' };

const checkout = (as: Awaited<ReturnType<typeof signIn>>['as'], body: object = {}) =>
  as.post('/me/billing/checkout', {
    plan: 'PLUS',
    period: 'month',
    method: CARD,
    redirectUrl: 'http://localhost:8081/billing/pending?id={id}',
    ...body,
  });

describe('checkout and payment', () => {
  it('charges the server price, unlocks only after Flutterwave confirms, and adds credits (203–206)', async () => {
    const { as, sub } = await signIn();
    const before = (await prisma.user.findUniqueOrThrow({ where: { id: sub } })).aiCredits;
    const res = await checkout(as).expect(201);
    expect(res.body.payment).toMatchObject({
      status: 'pending',
      amount: 3500,
      currency: 'NGN',
      plan: 'PLUS',
      checkoutUrl: expect.stringContaining('flutterwave'),
    });
    expect(res.body.user.plan).toBe('FREE');

    // Not paid yet: still pending, still Free.
    const waiting = await as.post('/me/billing/confirm', { id: res.body.payment.id }).expect(200);
    expect(waiting.body.payment.status).toBe('pending');

    pay(res.body.payment.reference);
    const done = await as.post('/me/billing/confirm', { id: res.body.payment.id }).expect(200);
    expect(done.body.payment.status).toBe('paid');
    expect(done.body.user.plan).toBe('PLUS');
    expect(done.body.user.aiCredits).toBe(before + 60);
    // Confirming again changes nothing (webhook and app can both arrive).
    await as.post('/me/billing/confirm', { id: res.body.payment.id }).expect(200);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: sub } })).aiCredits).toBe(before + 60);

    const billing = (await as.get('/me/billing').expect(200)).body.billing;
    expect(billing.subscription).toMatchObject({
      plan: 'PLUS',
      period: 'month',
      status: 'active',
      autoRenew: false,
    });
    expect(billing.subscription.currentPeriodEnd - Date.now()).toBeGreaterThan(29 * 86_400_000);
  });

  it('charges dollars by card only, at the dollar price (USD)', async () => {
    const { as } = await signIn();
    const usd = await checkout(as, {
      currency: 'USD',
      period: 'year',
      promo: 'EXAM25',
    }).expect(201);
    // $44.99 less 25% = $33.74 (the discount rounded to the cent).
    expect(usd.body.payment).toMatchObject({
      currency: 'USD',
      amount: 33.74,
      discount: 11.25,
      checkoutUrl: expect.any(String),
    });
    const { hostedPayment } = await import('../src/services/flutterwave.js');
    expect(vi.mocked(hostedPayment).mock.calls.at(-1)![0]).toMatchObject({
      amount: 33.74,
      currency: 'USD',
    });
    expect(
      (
        await checkout(as, {
          currency: 'USD',
          method: { type: 'transfer', label: 'Bank transfer' },
        }).expect(400)
      ).body.reason,
    ).toBe('method-currency');

    // Paid in the wrong currency: nothing unlocks.
    flw.tx.get(usd.body.payment.reference)!.currency = 'NGN';
    pay(usd.body.payment.reference);
    expect((await as.post('/me/billing/confirm', { id: usd.body.payment.id }).expect(200)).body.user.plan).toBe('FREE');
    flw.tx.get(usd.body.payment.reference)!.currency = 'USD';
    const done = await as.post('/me/billing/confirm', { id: usd.body.payment.id }).expect(200);
    expect(done.body).toMatchObject({
      payment: { status: 'paid' },
      user: { plan: 'PLUS' },
    });
    expect((await as.get('/me/billing')).body.billing.subscription.period).toBe('year');
  });

  it('gives bank-transfer and USSD details in the app, and marks failed ones (204, 207, 208)', async () => {
    const { as } = await signIn();
    const transfer = await checkout(as, {
      method: { type: 'transfer', label: 'Bank transfer' },
    }).expect(201);
    expect(transfer.body.payment.transfer).toMatchObject({
      bank: 'Wema Bank',
      accountNumber: '7812345678',
    });
    expect(transfer.body.payment.checkoutUrl).toBeUndefined();
    const code = await checkout(as, {
      method: { type: 'ussd', label: 'USSD · GTBank' },
    }).expect(201);
    expect(code.body.payment.ussd).toMatchObject({
      bank: 'GTBank',
      code: '*737*000*1234#',
    });

    // Direct transfer unavailable: the payment page is offered instead.
    flw.failDirect = true;
    const page = await checkout(as, {
      method: { type: 'transfer', label: 'Bank transfer' },
    }).expect(201);
    flw.failDirect = false;
    expect(page.body.payment.transfer).toBeUndefined();
    expect(page.body.payment.checkoutUrl).toContain('flutterwave');

    pay(transfer.body.payment.reference, 'failed');
    const failed = await as.post('/me/billing/confirm', { id: transfer.body.payment.id }).expect(200);
    expect(failed.body.payment).toMatchObject({
      status: 'failed',
      failureReason: expect.stringContaining('didn’t go through'),
    });
  });

  it('refuses tampered prices, unknown plans and redirects elsewhere; a down provider charges nothing', async () => {
    const { as } = await signIn();
    await checkout(as, { plan: 'GOLD' }).expect(400);
    await checkout(as, { currency: 'EUR' }).expect(400);
    await checkout(as, { amount: 1 })
      .expect(201)
      .then((r) => expect(r.body.payment.amount).toBe(3500));
    flw.failInit = true;
    const down = await checkout(as).expect(502);
    expect(down.body.reason).toBe('provider');
    flw.failInit = false;
    const last = await prisma.payment.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    expect(last?.status).toBe('failed');
    // A redirect to another site is replaced with the app's own page.
    const { hostedPayment } = await import('../src/services/flutterwave.js');
    await checkout(as, {
      redirectUrl: 'https://evil.example.com/steal',
    }).expect(201);
    expect(vi.mocked(hostedPayment).mock.calls.at(-1)![0].redirectUrl).not.toContain('evil');
  });

  it('accepts only webhooks with the secret hash, and checks with Flutterwave before unlocking', async () => {
    const { as, sub } = await signIn();
    const res = await checkout(as).expect(201);
    const body = {
      event: 'charge.completed',
      data: { tx_ref: res.body.payment.reference, status: 'successful' },
    };
    const { config } = await import('../src/config.js');
    (config as { FLW_SECRET_HASH?: string }).FLW_SECRET_HASH = 'test-hash';
    await http().post('/webhooks/flutterwave').send(body).expect(401);
    await http().post('/webhooks/flutterwave').set('verif-hash', 'fake').send(body).expect(401);
    // Genuine, but Flutterwave says it isn't paid yet (the "successful" in the body isn't trusted).
    await http().post('/webhooks/flutterwave').set('verif-hash', 'test-hash').send(body).expect(200);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: sub } })).plan).toBe('FREE');
    pay(res.body.payment.reference);
    await http().post('/webhooks/flutterwave').set('verif-hash', 'test-hash').send(body).expect(200);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: sub } })).plan).toBe('PLUS');
  });
});

describe('promo codes, renewals and cancellation', () => {
  it('applies promo codes once, with their rules (217)', async () => {
    const { as } = await signIn();
    expect((await as.post('/me/billing/promo', { code: 'exam25', period: 'term' }).expect(200)).body.promo).toMatchObject({ code: 'EXAM25', percent: 25 });
    expect((await as.post('/me/billing/promo', { code: 'WELCOME50', period: 'year' }).expect(400)).body.reason).toBe('promo-period');
    expect((await as.post('/me/billing/promo', { code: 'SCHOOL2025', period: 'month' }).expect(410)).body.reason).toBe('promo-expired');
    expect((await as.post('/me/billing/promo', { code: 'NOPE', period: 'month' }).expect(404)).body.reason).toBe('promo-invalid');

    const res = await checkout(as, { promo: 'EXAM25' }).expect(201);
    expect(res.body.payment).toMatchObject({
      amount: 2625,
      discount: 875,
      promo: 'EXAM25',
    });
    pay(res.body.payment.reference);
    await as.post('/me/billing/confirm', { id: res.body.payment.id }).expect(200);
    expect((await as.post('/me/billing/promo', { code: 'EXAM25', period: 'month' }).expect(409)).body.reason).toBe('promo-used');
  });

  it('adds early renewals on top, keeps access after cancelling, and resumes (209, 213)', async () => {
    const { as } = await signIn();
    const first = await checkout(as).expect(201);
    pay(first.body.payment.reference);
    await as.post('/me/billing/confirm', { id: first.body.payment.id });
    const end1 = (await as.get('/me/billing')).body.billing.subscription.currentPeriodEnd;
    const again = await checkout(as).expect(201);
    pay(again.body.payment.reference);
    await as.post('/me/billing/confirm', { id: again.body.payment.id });
    const end2 = (await as.get('/me/billing')).body.billing.subscription.currentPeriodEnd;
    expect(Math.round((end2 - end1) / 86_400_000)).toBe(30);

    const cancelled = await as.post('/me/billing/cancel', { reason: 'Too expensive' }).expect(200);
    expect(cancelled.body.billing.subscription).toMatchObject({
      status: 'cancelled',
      cancelReason: 'Too expensive',
    });
    expect((await as.get('/me')).body.user.plan).toBe('PLUS');
    await as.post('/me/billing/resume').expect(200);
    expect((await as.get('/me/billing')).body.billing.subscription.status).toBe('active');
    await as.post('/me/billing/resume').expect(409);
  });

  it('expires ended plans, adds monthly credits and sends renewal reminders (214, 215)', async () => {
    const { as, sub } = await signIn();
    const res = await checkout(as, { period: 'term' }).expect(201);
    pay(res.body.payment.reference);
    await as.post('/me/billing/confirm', { id: res.body.payment.id });
    const credits = (await prisma.user.findUniqueOrThrow({ where: { id: sub } })).aiCredits;

    // A month later: the next month's credits.
    await billingUpkeep(Date.now() + 31 * 86_400_000);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: sub } })).aiCredits).toBe(credits + 60);
    // Six days before the end: a 7-day reminder, sent once.
    const end = (await prisma.subscription.findUniqueOrThrow({ where: { userId: sub } })).currentPeriodEnd.getTime();
    await billingUpkeep(end - 6 * 86_400_000);
    await billingUpkeep(end - 6 * 86_400_000 + 3_600_000);
    const reminders = await prisma.notification.findMany({
      where: { userId: sub, template: 'renewalReminder' },
    });
    expect(reminders).toHaveLength(1);
    expect(reminders[0].params).toMatchObject({ plan: 'Plus' });
    // After the end: back to Free, and told so.
    await billingUpkeep(end + 1000);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: sub } })).plan).toBe('FREE');
    expect((await as.get('/me/billing')).body.billing.subscription.status).toBe('expired');
    expect(
      await prisma.notification.count({
        where: { userId: sub, template: 'subscriptionExpired' },
      }),
    ).toBe(1);
  });
});

describe('support and refunds (212, 218)', () => {
  it('refunds a first payment within 7 days through Flutterwave, and sends others for review', async () => {
    const { as, sub } = await signIn();
    const res = await checkout(as).expect(201);
    pay(res.body.payment.reference);
    await as.post('/me/billing/confirm', { id: res.body.payment.id });
    const r = await as
      .post('/me/billing/support', {
        topic: 'refund',
        paymentId: res.body.payment.id,
        message: 'Changed my mind',
      })
      .expect(201);
    expect(r.body.ticket).toMatchObject({
      status: 'resolved',
      resolution: expect.stringContaining('Refund approved'),
    });
    expect(flw.refunds.at(-1)).toEqual({
      id: flw.tx.get(res.body.payment.reference)!.id,
      amount: 3500,
    });
    expect(r.body.user.plan).toBe('FREE');
    expect(r.body.billing.payments[0].status).toBe('refunded');

    const other = await as
      .post('/me/billing/support', {
        topic: 'double-charge',
        message: 'Charged twice',
      })
      .expect(201);
    expect(other.body.ticket).toMatchObject({
      status: 'open',
      resolution: expect.stringContaining('2 working days'),
    });
    expect(await prisma.billingTicket.count({ where: { userId: sub } })).toBe(2);
  });

  it('restores: rechecks waiting payments and reports the plan', async () => {
    const { as } = await signIn();
    const res = await checkout(as).expect(201);
    expect((await as.post('/me/billing/restore').expect(200)).body.restored).toBe(false);
    pay(res.body.payment.reference);
    const restored = await as.post('/me/billing/restore').expect(200);
    expect(restored.body).toMatchObject({
      restored: true,
      user: { plan: 'PLUS' },
    });
  });

  it('keeps billing private', async () => {
    const { as } = await signIn();
    const res = await checkout(as).expect(201);
    const other = await signIn({ email: 'tunde@example.com' });
    await other.as.post('/me/billing/confirm', { id: res.body.payment.id }).expect(404);
    expect((await other.as.get('/me/billing')).body.billing.payments).toEqual([]);
    await http().get('/me/billing').expect(401);
  });
});
