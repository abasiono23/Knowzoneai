import { randomBytes } from 'node:crypto';

import { Router } from 'express';
import { z } from 'zod';

import { config } from '../config.js';
import { CURRENCIES, PRICES, PROMOS, REFUND_DAYS, fromMinor, toMinor, type BillingPeriod, type Currency, type PaidPlan } from '../data/plans.js';
import { prisma } from '../db.js';
import { AppError, notFound } from '../lib/errors.js';
import { billingOf, settle, toPublicPayment } from '../services/billing.js';
import { bankTransfer, hostedPayment, refund, ussd, validWebhook } from '../services/flutterwave.js';
import { me, requireAuth } from '../services/sessions.js';
import { toPublicUser } from '../services/users.js';

export const billingRouter = Router();
billingRouter.use(['/me/billing', '/me/billing/*rest'], requireAuth);

const DAY = 86_400_000;
const Plan = z.enum(['PLUS', 'PRO']);
const Period = z.enum(['month', 'term', 'year']);

const fresh = (id: string) => prisma.user.findUniqueOrThrow({ where: { id } });

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

/** Cancel (213): keeps the plan until the end of what's paid; nothing renews by itself anyway. */
billingRouter.post('/me/billing/cancel', async (req, res) => {
  const user = me(req);
  const { reason } = z.object({ reason: z.string().trim().max(500).default('') }).parse(req.body);
  const { count } = await prisma.subscription.updateMany({
    where: { userId: user.id, status: 'active' },
    data: { status: 'cancelled', autoRenew: false, cancelReason: reason },
  });
  if (!count) throw new AppError(409, 'There’s no active subscription to cancel', 'none');
  res.json({ billing: await billingOf(user.id) });
});

billingRouter.post('/me/billing/resume', async (req, res) => {
  const user = me(req);
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
    if (eligible && payment.providerRef) {
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
