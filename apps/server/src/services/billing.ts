import { PERIOD_DAYS, MONTHLY_CREDITS, fromMinor, type BillingPeriod, type PaidPlan } from '../data/plans.js';
import { prisma } from '../db.js';
import type { Payment, Subscription } from '../generated/prisma/client.js';
import { flutterwaveConfigured, verify } from './flutterwave.js';
import { notify } from './notifications.js';

const DAY = 86_400_000;
const MONTH = 30 * DAY;
const ms = (d: Date | null | undefined) => (d ? d.getTime() : undefined);

// ─── Shapes the app reads ─────────────────────────────────────────────────────

export function toPublicPayment(p: Payment) {
  const i = p.instructions as Record<string, unknown> | null;
  const method = p.method as { type: string; label: string };
  return {
    id: p.id,
    at: p.createdAt.getTime(),
    plan: p.plan,
    period: p.period,
    amount: fromMinor(p.amount),
    discount: fromMinor(p.discount),
    currency: p.currency,
    status: p.status,
    method,
    reference: p.reference,
    ...(p.promo && { promo: p.promo }),
    ...(p.failureReason && { failureReason: p.failureReason }),
    ...(p.checkoutUrl && p.status === 'pending' && { checkoutUrl: p.checkoutUrl }),
    ...(i && method.type === 'transfer' && { transfer: i }),
    ...(i && method.type === 'ussd' && { ussd: i }),
    ...(p.refundedAt && { refundedAt: ms(p.refundedAt) }),
    ...(p.renewal && { renewal: true }),
  };
}

export function toPublicSubscription(s: Subscription | null) {
  if (!s) return null;
  return {
    plan: s.plan,
    period: s.period,
    status: s.status,
    startedAt: s.startedAt.getTime(),
    currentPeriodEnd: s.currentPeriodEnd.getTime(),
    autoRenew: s.autoRenew,
    method: s.method,
    ...(s.cancelReason && { cancelReason: s.cancelReason }),
  };
}

export async function billingOf(userId: string) {
  const [subscription, payments, tickets] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.billingTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  return {
    subscription: toPublicSubscription(subscription),
    payments: payments.map(toPublicPayment),
    tickets: tickets.map((t) => ({
      id: t.id,
      at: t.createdAt.getTime(),
      topic: t.topic,
      ...(t.paymentId && { paymentId: t.paymentId }),
      message: t.message,
      status: t.status,
      ...(t.resolution && { resolution: t.resolution }),
    })),
  };
}

// ─── Activating a paid plan ───────────────────────────────────────────────────

/**
 * Marks a payment paid and gives the plan. Safe to call twice (webhook and the app's check can both
 * arrive): only the first one changes anything. Renewing the same plan early adds the time on top of
 * what's left; a different plan starts today. The first month's AI credits come at once, the rest
 * month by month.
 */
export async function activate(paymentId: string) {
  return prisma.$transaction(async (tx) => {
    const marked = await tx.payment.updateMany({
      where: { id: paymentId, status: 'pending' },
      data: { status: 'paid', paidAt: new Date() },
    });
    if (!marked.count) return false;
    const p = await tx.payment.findUniqueOrThrow({ where: { id: paymentId } });
    const prev = await tx.subscription.findUnique({
      where: { userId: p.userId },
    });
    const now = Date.now();
    const live = prev && prev.status !== 'expired';
    const from = live && prev.plan === p.plan ? Math.max(now, prev.currentPeriodEnd.getTime()) : now;
    const data = {
      plan: p.plan,
      period: p.period,
      status: 'active',
      startedAt: live ? prev.startedAt : new Date(now),
      currentPeriodEnd: new Date(from + PERIOD_DAYS[p.period as BillingPeriod] * DAY),
      autoRenew: false,
      method: p.method as object,
      cancelReason: null,
      remindersSent: [],
      ...(!live || prev.plan !== p.plan ? { nextCreditAt: new Date(now + MONTH) } : {}),
    };
    await tx.subscription.upsert({
      where: { userId: p.userId },
      create: {
        userId: p.userId,
        ...data,
        nextCreditAt: new Date(now + MONTH),
      },
      update: data,
    });
    const credits = MONTHLY_CREDITS[p.plan as PaidPlan];
    await tx.user.update({
      where: { id: p.userId },
      data: {
        plan: p.plan,
        // A new plan's first month of credits; renewals of the same plan keep the monthly schedule.
        ...(!live || prev.plan !== p.plan
          ? {
              aiCredits: { increment: credits },
              creditEntries: { create: { credits, reason: 'plan' } },
            }
          : {}),
      },
    });
    return true;
  });
}

/**
 * Applies what Flutterwave says about a pending payment. The plan unlocks only for a successful
 * payment of at least the full amount, in the same currency.
 */
export async function settle(payment: Payment) {
  if (payment.status !== 'pending' || !flutterwaveConfigured()) return payment;
  let tx;
  try {
    tx = await verify(payment.reference);
  } catch {
    // Flutterwave unreachable: still pending; the webhook or a later check will settle it.
    return payment;
  }
  if (!tx) return payment;
  if (tx.status === 'successful' && tx.currency === payment.currency && tx.amount >= fromMinor(payment.amount)) {
    await prisma.payment.updateMany({
      where: { id: payment.id, providerRef: null },
      data: { providerRef: tx.id },
    });
    await activate(payment.id);
  } else if (tx.status === 'failed') {
    await prisma.payment.updateMany({
      where: { id: payment.id, status: 'pending' },
      data: {
        status: 'failed',
        providerRef: tx.id,
        failureReason: 'The payment didn’t go through. Nothing was charged.',
      },
    });
  }
  return prisma.payment.findUniqueOrThrow({ where: { id: payment.id } });
}

// ─── Upkeep (hourly) ──────────────────────────────────────────────────────────

const REMINDERS: { key: string; days: number }[] = [
  { key: '7d', days: 7 },
  { key: '1d', days: 1 },
];

/**
 * Ends plans whose paid time is over, adds each month's AI credits, reminds learners before their
 * plan ends (215), and settles payments left pending.
 */
export async function billingUpkeep(now = Date.now()) {
  // Plans past their end become Free.
  const ended = await prisma.subscription.findMany({
    where: {
      status: { in: ['active', 'cancelled'] },
      currentPeriodEnd: { lte: new Date(now) },
    },
  });
  for (const s of ended) {
    await prisma.$transaction([
      prisma.subscription.update({
        where: { userId: s.userId },
        data: { status: 'expired' },
      }),
      prisma.user.update({ where: { id: s.userId }, data: { plan: 'FREE' } }),
    ]);
    await notify(s.userId, {
      type: 'system',
      template: 'subscriptionExpired',
      params: { plan: s.plan === 'PRO' ? 'Pro' : 'Plus' },
      href: '/billing/expired',
    });
  }

  // Monthly AI credits during a paid period.
  const due = await prisma.subscription.findMany({
    where: {
      status: { in: ['active', 'cancelled'] },
      nextCreditAt: { lte: new Date(now) },
      currentPeriodEnd: { gt: new Date(now) },
    },
  });
  for (const s of due) {
    const credits = MONTHLY_CREDITS[s.plan as PaidPlan];
    await prisma.$transaction([
      prisma.subscription.update({
        where: { userId: s.userId },
        data: { nextCreditAt: new Date(s.nextCreditAt.getTime() + MONTH) },
      }),
      prisma.user.update({
        where: { id: s.userId },
        data: {
          aiCredits: { increment: credits },
          creditEntries: { create: { credits, reason: 'plan' } },
        },
      }),
    ]);
  }

  // Renewal reminders: 7 days and 1 day before the end (prepaid plans don't renew by themselves).
  for (const r of REMINDERS) {
    const soon = await prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: {
          gt: new Date(now),
          lte: new Date(now + r.days * DAY),
        },
        NOT: { remindersSent: { has: r.key } },
      },
    });
    for (const s of soon) {
      await prisma.subscription.update({
        where: { userId: s.userId },
        data: { remindersSent: { push: r.key } },
      });
      await notify(s.userId, {
        type: 'reminder',
        template: 'renewalReminder',
        params: {
          plan: s.plan === 'PRO' ? 'Pro' : 'Plus',
          days: Math.max(1, Math.ceil((s.currentPeriodEnd.getTime() - now) / DAY)),
        },
        href: '/billing/renewal',
      });
    }
  }

  // Payments left pending for over an hour: ask Flutterwave; after a day, give up.
  const stale = await prisma.payment.findMany({
    where: {
      status: 'pending',
      createdAt: { lt: new Date(now - 60 * 60_000) },
    },
    take: 50,
  });
  for (const p of stale) {
    const after = await settle(p);
    if (after.status === 'pending' && now - p.createdAt.getTime() > DAY)
      await prisma.payment.update({
        where: { id: p.id },
        data: {
          status: 'failed',
          failureReason: 'The payment wasn’t completed.',
        },
      });
  }
  return { ended: ended.length, credited: due.length };
}
