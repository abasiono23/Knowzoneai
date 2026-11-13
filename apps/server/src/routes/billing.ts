import { randomBytes } from 'node:crypto';

import { Router } from 'express';
import { z } from 'zod';

import { config } from '../config.js';
import { CURRENCIES, PRICES, PROMOS, REFUND_DAYS, fromMinor, toMinor, type BillingPeriod, type Currency, type PaidPlan } from '../data/plans.js';
import { prisma } from '../db.js';
import { AppError, notFound } from '../lib/errors.js';
import { billingOf, markGoogleRefund, settle, syncGooglePurchase, toPublicPayment } from '../services/billing.js';
import { bankTransfer, hostedPayment, refund, ussd, validWebhook } from '../services/flutterwave.js';
import { GooglePlayRejected, googlePlayConfigured, validWebhook as validGoogleWebhook } from '../services/google-play.js';
import { me, requireAuth } from '../services/sessions.js';
import { toPublicUser } from '../services/users.js';

export const billingRouter = Router();
billingRouter.use(['/me/billing', '/me/billing/*rest'], requireAuth);

const DAY = 86_400_000;
const Plan = z.enum(['PLUS', 'PRO']);
const Period = z.enum(['month', 'term', 'year']);

const fresh = (id: string) => prisma.user.findUniqueOrThrow({ where: { id } });

/** A Google Play subscription is cancelled, resumed and changed in Google Play, never here. */
const inGooglePlay = () =>
  new AppError(
    409,
    'Your plan is a Google Play subscription. Manage it in Google Play, under Payments and subscriptions.',
    'store-managed',
  );

/** Subscription management (209), billing history (210) and support requests (218). */
billingRouter.get('/me/billing', async (req, res) => {
  const user = me(req);
  res.json({
    billing: await billingOf(user.id),
    user: toPublicUser(await fresh(user.id)),
  });
});

/** A promo code for this plan and period (217): exists, not expired, right period, not used before. */
async function promoFor(userId: string, code: string | undefined, period: BillingPeriod) {
  if (!code) return null;
  const c = code.trim().toUpperCase();
  const promo = PROMOS[c];
  if (!promo) throw new AppError(404, 'That code isn’t valid. Check the spelling and try again.', 'promo-invalid');
  if (promo.expired) throw new AppError(410, 'That code has expired.', 'promo-expired');
  if (promo.months && !promo.months.includes(period)) throw new AppError(400, 'That code only works on monthly plans.', 'promo-period');
  if (
    await prisma.payment.findFirst({
      where: { userId, promo: c, status: 'paid' },
      select: { id: true },
    })
  )
    throw new AppError(409, 'You’ve already used that code.', 'promo-used');
  return { code: c, ...promo };
}

billingRouter.post('/me/billing/promo', async (req, res) => {
  const { code, period } = z.object({ code: z.string().trim().min(1).max(30), period: Period }).parse(req.body);
  const promo = (await promoFor(me(req).id, code, period))!;
  res.json({
    promo: { code: promo.code, percent: promo.percent, label: promo.label },
  });
});

/** Where Flutterwave may send the learner back to: the app's own web addresses only. */
function allowedRedirect(url: string | undefined) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const origins = [config.APP_URL, ...(config.CORS_ORIGIN === '*' ? [] : config.CORS_ORIGIN.split(','))].map((o) => new URL(o).origin);
    const local = config.NODE_ENV !== 'production' && /^(localhost|127\.0\.0\.1)$/.test(u.hostname);
    return origins.includes(u.origin) || local || u.protocol === 'knowzone:' ? url : null;
  } catch {
    return null;
  }
}

const Checkout = z.object({
  plan: Plan,
  period: Period,
  /** Naira or dollars; dollars are card only. */
  currency: z.enum(CURRENCIES as [Currency, ...Currency[]]).default('NGN'),
  method: z.object({
    type: z.enum(['card', 'transfer', 'ussd']),
    label: z.string().max(60),
  }),
  promo: z.string().trim().max(30).optional(),
  /** Where Flutterwave's payment page returns to. */
  redirectUrl: z.string().max(500).optional(),
});

/**
 * Checkout (203–205). The price comes from the server, never the app. Cards continue on
 * Flutterwave's secure page (`checkoutUrl`); bank transfer and USSD (naira only) get their account
 * number or code here, or the payment page if those can't be made. The plan only unlocks once
 * Flutterwave confirms the money (webhook or /confirm).
 */
billingRouter.post('/me/billing/checkout', async (req, res) => {
  const user = me(req);
  const input = Checkout.parse(req.body);
  // A Google Play subscription that renews by itself would keep charging next to this payment.
  const running = await prisma.subscription.findUnique({ where: { userId: user.id } });
  if (running?.provider === 'google_play' && running.status === 'active' && running.currentPeriodEnd.getTime() > Date.now())
    throw inGooglePlay();
  if (input.currency === 'USD' && input.method.type !== 'card')
    throw new AppError(400, 'Dollar payments are by card. Choose card, or pay in naira.', 'method-currency');
  const promo = await promoFor(user.id, input.promo, input.period);
  const price = toMinor(PRICES[input.currency][input.plan as PaidPlan][input.period as BillingPeriod]);
  const discount = promo ? Math.round((price * promo.percent) / 100) : 0;
  const reference = `KZ-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`;
  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      plan: input.plan,
      period: input.period,
      amount: price - discount,
      discount,
      currency: input.currency,
      method: input.method,
      reference,
      promo: promo?.code ?? null,
    },
  });
  const amount = fromMinor(payment.amount);
  try {
    let instructions = null;
    if (input.method.type !== 'card') {
      try {
        instructions =
          input.method.type === 'transfer'
            ? await bankTransfer({ reference, amount, email: user.email })
            : await ussd({
                reference,
                amount,
                email: user.email,
                bank: input.method.label.replace(/^USSD · /, ''),
              });
      } catch (e) {
        if (e instanceof AppError) throw e;
        // Direct transfer/USSD isn't available right now: the payment page offers the same methods.
      }
    }
    let checkoutUrl = null;
    if (!instructions) {
      const redirect = allowedRedirect(input.redirectUrl) ?? `${config.APP_URL}/billing/pending?id={id}`;
      ({ link: checkoutUrl } = await hostedPayment({
        reference,
        amount,
        currency: input.currency,
        redirectUrl: redirect.replace('{id}', payment.id),
        customer: { email: user.email, name: user.name },
        description: `Knowzone ${input.plan === 'PRO' ? 'Pro' : 'Plus'} (${input.period})`,
        meta: { userId: user.id, paymentId: payment.id },
      }));
    }
    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { checkoutUrl, ...(instructions && { instructions }) },
    });
    res.status(201).json({ payment: toPublicPayment(updated), user: toPublicUser(user) });
  } catch (e) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'failed',
        failureReason: 'We couldn’t start the payment. Nothing was charged. Please try again.',
      },
    });
    throw e instanceof AppError ? e : new AppError(502, 'We couldn’t reach the payment service. Nothing was charged. Please try again.', 'provider');
  }
});

/** "I've paid" / returning from the payment page (205–208): asks Flutterwave where the payment stands. */
billingRouter.post('/me/billing/confirm', async (req, res) => {
  const user = me(req);
  const { id } = z.object({ id: z.string().max(40) }).parse(req.body);
  const payment = await prisma.payment.findFirst({
    where: { id, userId: user.id },
  });
  if (!payment) throw notFound('Payment not found');
  const after = await settle(payment);
  res.json({
    payment: toPublicPayment(after),
    user: toPublicUser(await fresh(user.id)),
  });
});

/**
 * Flutterwave's notice that a payment changed. The secret hash proves it's from Flutterwave, and the
 * payment is checked with Flutterwave again before anything unlocks (so a replayed or altered
 * notice can't).
 */
billingRouter.post('/webhooks/flutterwave', async (req, res) => {
  if (!validWebhook(req.get('verif-hash'))) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }
  const event = req.body as {
    event?: string;
    data?: { tx_ref?: string; txRef?: string };
  };
  const ref = event.data?.tx_ref ?? event.data?.txRef;
  if (ref) {
    const payment = await prisma.payment.findUnique({
      where: { reference: ref },
    });
    if (payment) await settle(payment);
  }
  // Always 200 for genuine notices, so Flutterwave doesn't keep retrying ones we've handled.
  res.json({ ok: true });
});

// ─── Google Play Billing (the Android app) ────────────────────────────────────

const Purchase = z.object({
  purchaseToken: z.string().min(10).max(2000),
  productId: z.string().max(100),
  /** The app the purchase was made in, as the device reports it. */
  packageName: z.string().max(200).optional(),
});

const wrongApp = () => new AppError(400, 'That purchase isn’t for the Knowzone app.', 'store-package');

/** Runs a check with Google for the signed-in learner, turning Google's "no" and outages into clear answers. */
async function checkWithGoogle(purchaseToken: string, userId: string) {
  try {
    return await syncGooglePurchase(purchaseToken, { userId });
  } catch (e) {
    if (e instanceof AppError) throw e;
    if (e instanceof GooglePlayRejected)
      throw new AppError(400, 'Google Play doesn’t recognise that purchase.', 'store-invalid');
    console.warn('Google Play check failed:', e instanceof Error ? e.message : e);
    throw new AppError(
      502,
      'We couldn’t reach Google Play to confirm your purchase. You won’t be charged twice. Please try again.',
      'provider',
    );
  }
}

/**
 * The Android app bought a plan in Google Play and sends the purchase token. The plan unlocks only
 * after Google itself confirms the purchase: it is for this app and this account, and it is paid
 * (active or in its grace period). The server then tells Google it was delivered (acknowledges it).
 * Safe to send twice. A purchase still waiting for money answers `pending`; Google's notification
 * unlocks the plan when it clears.
 */
billingRouter.post('/me/billing/google/verify', async (req, res) => {
  const user = me(req);
  const input = Purchase.parse(req.body);
  if (input.packageName && input.packageName !== config.GOOGLE_PLAY_PACKAGE) throw wrongApp();
  if (!googlePlayConfigured())
    throw new AppError(503, 'Google Play purchases aren’t set up on this server yet', 'not-configured');
  const r = await checkWithGoogle(input.purchaseToken, user.id);
  res.json({
    status: r.status,
    acknowledged: r.acknowledged,
    payment: r.payment ? toPublicPayment(r.payment) : null,
    billing: await billingOf(user.id),
    user: toPublicUser(await fresh(user.id)),
  });
});

/**
 * Restore purchases on Android: the app lists what the phone's Google account owns, and each is
 * checked with Google. A purchase that belongs to another Knowzone account is skipped.
 */
billingRouter.post('/me/billing/google/restore', async (req, res) => {
  const user = me(req);
  const { purchases } = z.object({ purchases: z.array(Purchase).max(20) }).parse(req.body);
  let otherAccount = false;
  if (purchases.length && !googlePlayConfigured())
    throw new AppError(503, 'Google Play purchases aren’t set up on this server yet', 'not-configured');
  for (const p of purchases) {
    if (p.packageName && p.packageName !== config.GOOGLE_PLAY_PACKAGE) continue;
    try {
      await checkWithGoogle(p.purchaseToken, user.id);
    } catch (e) {
      if (e instanceof AppError && e.reason === 'provider') throw e;
      if (e instanceof AppError && e.reason === 'store-other-account') otherAccount = true;
    }
  }
  const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
  res.json({
    restored: !!sub && sub.status !== 'expired' && sub.currentPeriodEnd.getTime() > Date.now(),
    /** The phone's Google account has a Knowzone subscription, but it belongs to a different Knowzone account. */
    otherAccount,
    billing: await billingOf(user.id),
    user: toPublicUser(await fresh(user.id)),
  });
});

/**
 * Google's Real-time developer notifications: a Cloud Pub/Sub push each time a subscription changes
 * (bought, renewed, recovered, cancelled, on hold, in grace period, expired, revoked, restarted…).
 * The shared secret in the push address proves it's ours, and the notice only says "look again":
 * the purchase is re-read from Google before anything changes, so a forged or replayed notice can't
 * unlock or end a plan. Answers 2xx for everything handled or not ours (Pub/Sub retries anything
 * else for days); only a failure to reach Google asks for a retry.
 */
billingRouter.post('/webhooks/google-play', async (req, res) => {
  const bearer = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  const token = typeof req.query.token === 'string' ? req.query.token : (req.get('x-webhook-token') ?? bearer);
  if (!validGoogleWebhook(token)) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
  type Notice = {
    packageName?: string;
    subscriptionNotification?: { notificationType?: number; purchaseToken?: string };
    voidedPurchaseNotification?: { purchaseToken?: string; orderId?: string; productType?: number };
    testNotification?: object;
  };
  let notice: Notice;
  try {
    const data = (req.body as { message?: { data?: string } }).message?.data;
    notice = JSON.parse(Buffer.from(String(data ?? ''), 'base64').toString('utf8')) as Notice;
  } catch {
    // Not a notification we can read: nothing to retry.
    res.json({ ok: true, ignored: 'unreadable' });
    return;
  }
  if (notice.packageName !== config.GOOGLE_PLAY_PACKAGE) {
    res.json({ ok: true, ignored: notice.testNotification ? 'test' : 'package' });
    return;
  }
  // A refund or chargeback made in Play Console (productType 1 = subscription); one-time products aren't sold.
  const voided = notice.voidedPurchaseNotification;
  const purchaseToken = notice.subscriptionNotification?.purchaseToken ?? (voided?.productType === 1 ? voided.purchaseToken : undefined);
  if (!purchaseToken || !googlePlayConfigured()) {
    res.json({ ok: true, ignored: notice.testNotification ? 'test' : 'not-a-subscription' });
    return;
  }
  try {
    const before = await prisma.googlePlayPurchase.findUnique({ where: { purchaseToken } });
    const r = await syncGooglePurchase(purchaseToken);
    // 12 = SUBSCRIPTION_REVOKED: Google took the subscription away and refunded the latest charge.
    const refunded = voided?.orderId ?? (notice.subscriptionNotification?.notificationType === 12 ? before?.orderId : null);
    if (refunded && r.status !== 'active') await markGoogleRefund(refunded);
    res.json({ ok: true, status: r.status });
  } catch (e) {
    if (e instanceof GooglePlayRejected || e instanceof AppError) {
      res.json({ ok: true, ignored: 'unknown-purchase' });
      return;
    }
    console.warn('Google Play notification failed:', e instanceof Error ? e.message : e);
    res.status(503).json({ error: 'Try again' });
  }
});

/** Cancel (213): keeps the plan until the end of what's paid; nothing renews by itself anyway. */
billingRouter.post('/me/billing/cancel', async (req, res) => {
  const user = me(req);
  const { reason } = z.object({ reason: z.string().trim().max(500).default('') }).parse(req.body);
  const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
  if (sub?.provider === 'google_play' && sub.status === 'active') throw inGooglePlay();
  const { count } = await prisma.subscription.updateMany({
    where: { userId: user.id, status: 'active' },
    data: { status: 'cancelled', autoRenew: false, cancelReason: reason },
  });
  if (!count) throw new AppError(409, 'There’s no active subscription to cancel', 'none');
  res.json({ billing: await billingOf(user.id) });
});

billingRouter.post('/me/billing/resume', async (req, res) => {
  const user = me(req);
  const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
  if (sub?.provider === 'google_play' && sub.status === 'cancelled') throw inGooglePlay();
  const { count } = await prisma.subscription.updateMany({
    where: {
      userId: user.id,
      status: 'cancelled',
      currentPeriodEnd: { gt: new Date() },
    },
    data: { status: 'active', cancelReason: null },
  });
  if (!count) throw new AppError(409, 'Nothing to resume', 'none');
  res.json({ billing: await billingOf(user.id) });
});

/**
 * Restore purchases (212): plans belong to the account, so signing in restores them; this rechecks
 * any payment still waiting for confirmation and reports whether a plan is active.
 */
billingRouter.post('/me/billing/restore', async (req, res) => {
  const user = me(req);
  for (const p of await prisma.payment.findMany({
    where: { userId: user.id, status: 'pending' },
  }))
    await settle(p);
  const sub = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });
  res.json({
    restored: !!sub && sub.status !== 'expired' && sub.currentPeriodEnd.getTime() > Date.now(),
    billing: await billingOf(user.id),
    user: toPublicUser(await fresh(user.id)),
  });
});

const Support = z.object({
  topic: z.enum(['refund', 'double-charge', 'not-activated', 'other']),
  paymentId: z.string().max(40).optional(),
  message: z.string().trim().max(2000).default(''),
});

/**
 * Refund and payment support (218). A first payment is refunded in full within 7 days, no questions
 * asked (through Flutterwave); everything else is reviewed by the team. "Not activated" rechecks the payment.
 */
billingRouter.post('/me/billing/support', async (req, res) => {
  const user = me(req);
  const input = Support.parse(req.body);
  const payment = input.paymentId
    ? await prisma.payment.findFirst({
        where: { id: input.paymentId, userId: user.id },
      })
    : null;
  let status = 'open';
  let resolution: string | null = null;

  if (input.topic === 'not-activated' && payment?.status === 'pending') {
    const after = await settle(payment);
    if (after.status === 'paid') {
      status = 'resolved';
      resolution = 'We found your payment and your plan is now active.';
    }
  } else if (input.topic === 'refund') {
    const eligible = payment?.status === 'paid' && !payment.renewal && payment.paidAt && Date.now() - payment.paidAt.getTime() < REFUND_DAYS * DAY;
    // Google Play purchases are refunded through Google Play (by the team, in Play Console), not Flutterwave.
    if (eligible && payment.providerRef && payment.provider === 'flutterwave') {
      try {
        await refund(payment.providerRef, fromMinor(payment.amount));
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'refunded', refundedAt: new Date() },
          }),
          prisma.subscription.updateMany({
            where: { userId: user.id },
            data: { status: 'expired', currentPeriodEnd: new Date() },
          }),
          prisma.user.update({
            where: { id: user.id },
            data: { plan: 'FREE' },
          }),
        ]);
        status = 'resolved';
        resolution = 'Refund approved. It reaches your account in 5–10 working days, depending on your bank.';
      } catch {
        resolution = 'A billing specialist will process your refund within 2 working days.';
      }
    } else resolution = 'A billing specialist will review this within 2 working days.';
  }

  // Whatever isn't settled here goes to the team, and the learner is told when to expect an answer.
  resolution ??= 'A billing specialist will review this within 2 working days.';

  const ticket = await prisma.billingTicket.create({
    data: {
      id: `T-${randomBytes(3).toString('hex').toUpperCase()}`,
      userId: user.id,
      topic: input.topic,
      paymentId: payment?.id ?? null,
      message: input.message,
      status,
      resolution,
    },
  });
  res.status(201).json({
    ticket: {
      id: ticket.id,
      at: ticket.createdAt.getTime(),
      topic: ticket.topic,
      ...(ticket.paymentId && { paymentId: ticket.paymentId }),
      message: ticket.message,
      status,
      ...(resolution && { resolution }),
    },
    billing: await billingOf(user.id),
    user: toPublicUser(await fresh(user.id)),
  });
});
