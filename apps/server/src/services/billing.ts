import { createHash } from 'node:crypto';

import {
  PERIOD_DAYS,
  MONTHLY_CREDITS,
  PLAY_BASE_PLANS,
  PLAY_PRODUCTS,
  PRICES,
  fromMinor,
  toMinor,
  type BillingPeriod,
  type PaidPlan,
} from '../data/plans.js';
import { prisma } from '../db.js';
import type { Payment, Prisma, Subscription } from '../generated/prisma/client.js';
import { AppError } from '../lib/errors.js';
import { flutterwaveConfigured, verify } from './flutterwave.js';
import { acknowledge, getSubscription, googlePlayConfigured, type PlayState } from './google-play.js';
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
    /** flutterwave | google_play */
    provider: p.provider,
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
    /** Who manages the plan: flutterwave (cancel and renew in Knowzone) | google_play (in Google Play). */
    provider: s.provider,
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

type Tx = Prisma.TransactionClient;

/**
 * Gives a paid plan to an account: the subscription, the account's plan, and (for a new plan) the first
 * month's AI credits; the rest come month by month. Flutterwave payments and Google Play purchases both
 * end here. A prepaid payment adds its period on top of what's left of the same plan; Google Play says
 * itself when the paid time ends (`periodEnd`).
 */
async function givePlan(
  tx: Tx,
  p: { userId: string; plan: string; period: string; method: object },
  o: {
    provider: 'flutterwave' | 'google_play';
    providerToken?: string;
    periodEnd?: Date;
    autoRenew?: boolean;
    status?: 'active' | 'cancelled';
    /** False when this isn't a new charge (a re-check of one already counted): no credits again. */
    credits?: boolean;
  },
) {
  const prev = await tx.subscription.findUnique({ where: { userId: p.userId } });
  const now = Date.now();
  const live = prev && prev.status !== 'expired';
  // A new plan's first month of credits; renewals of the same plan keep the monthly schedule.
  const first = (!live || prev.plan !== p.plan) && o.credits !== false;
  const from = live && prev.plan === p.plan ? Math.max(now, prev.currentPeriodEnd.getTime()) : now;
  const data = {
    plan: p.plan as PaidPlan,
    period: p.period,
    status: o.status ?? 'active',
    startedAt: live ? prev.startedAt : new Date(now),
    currentPeriodEnd: o.periodEnd ?? new Date(from + PERIOD_DAYS[p.period as BillingPeriod] * DAY),
    autoRenew: o.autoRenew ?? false,
    method: p.method,
    cancelReason: null,
    remindersSent: [],
    provider: o.provider,
    providerToken: o.providerToken ?? null,
    ...(first ? { nextCreditAt: new Date(now + MONTH) } : {}),
  };
  await tx.subscription.upsert({
    where: { userId: p.userId },
    create: { userId: p.userId, ...data, nextCreditAt: new Date(now + MONTH) },
    update: data,
  });
  const credits = MONTHLY_CREDITS[p.plan as PaidPlan];
  await tx.user.update({
    where: { id: p.userId },
    data: {
      plan: p.plan as PaidPlan,
      ...(first ? { aiCredits: { increment: credits }, creditEntries: { create: { credits, reason: 'plan' } } } : {}),
    },
  });
}

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
    await givePlan(tx, { ...p, method: p.method as object }, { provider: 'flutterwave' });
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

// ─── Google Play (the Android app) ────────────────────────────────────────────

/** Stored and returned in English like the other methods; the app shows store names as they are. */
const PLAY_METHOD = { type: 'store', label: 'Google Play' };

/** States in which the learner has paid-for time left. Cancelled keeps access until the period ends. */
const ENTITLED: PlayState[] = [
  'SUBSCRIPTION_STATE_ACTIVE',
  'SUBSCRIPTION_STATE_IN_GRACE_PERIOD',
  'SUBSCRIPTION_STATE_CANCELED',
];

const otherAccount = () =>
  new AppError(
    409,
    'This Google Play subscription belongs to another Knowzone account. Sign in to that account, or use a different Google account.',
    'store-other-account',
  );

const isDuplicate = (e: unknown) => (e as { code?: string } | null)?.code === 'P2002';

export type GoogleSync = {
  /**
   * active: the plan is on. pending: Google is still waiting for the money. inactive: no paid time
   * (expired, on hold, paused). unknown: nobody here owns it.
   */
  status: 'active' | 'pending' | 'inactive' | 'unknown';
  userId: string | null;
  /** The receipt for the latest charge, when the plan is on. */
  payment: Payment | null;
  /** Whether Google has been told the purchase was delivered (if not, the app does it). */
  acknowledged: boolean;
};

/**
 * Asks Google where a subscription purchase stands and makes the account match: plan on (with the
 * first month's credits and a receipt for each new charge), cancelled-but-running, or ended. The app
 * (after buying, or "restore") names the account with `claim`; Google's notifications don't, and the
 * owner is found from the purchase's history or the account id the app attached when buying.
 * Safe to run any number of times for the same purchase: each Google order is counted once, and a
 * purchase belongs to one account only. Throws GooglePlayRejected for a token Google doesn't know.
 */
export async function syncGooglePurchase(purchaseToken: string, claim?: { userId: string }): Promise<GoogleSync> {
  const sub = await getSubscription(purchaseToken);
  const run = () => applyGooglePurchase(purchaseToken, sub, claim);
  let result;
  try {
    result = await run();
  } catch (e) {
    // The app's check and Google's notification arrived together: the second one starts again and sees the first.
    if (!isDuplicate(e)) throw e;
    result = await run();
  }
  const { ended, ...sync } = result;
  if (ended && sync.userId)
    await notify(sync.userId, {
      type: 'system',
      template: 'subscriptionExpired',
      params: { plan: ended === 'PRO' ? 'Pro' : 'Plus' },
      href: '/billing/expired',
    });
  if (sync.status === 'active' && !sync.acknowledged) {
    try {
      await acknowledge(sub.productId, purchaseToken);
      await prisma.googlePlayPurchase.update({ where: { purchaseToken }, data: { acknowledged: true } });
      sync.acknowledged = true;
    } catch (e) {
      // The app acknowledges it instead; if neither manages within 3 days Google refunds and tells us.
      console.warn('Google Play acknowledge failed:', e instanceof Error ? e.message : e);
    }
  }
  return sync;
}

async function applyGooglePurchase(
  purchaseToken: string,
  sub: Awaited<ReturnType<typeof getSubscription>>,
  claim?: { userId: string },
): Promise<GoogleSync & { ended: string | null }> {
  const none = { userId: null, payment: null, acknowledged: sub.acknowledged, ended: null };
  const known = await prisma.googlePlayPurchase.findUnique({ where: { purchaseToken } });
  const linked =
    !known && sub.linkedToken
      ? await prisma.googlePlayPurchase.findUnique({ where: { purchaseToken: sub.linkedToken } })
      : null;

  let userId: string | null;
  if (claim) {
    // One purchase, one account: the one that bought it (Google keeps the id the app attached), or first to claim it.
    if (known && known.userId !== claim.userId) throw otherAccount();
    if (sub.accountId ? sub.accountId !== claim.userId : linked && linked.userId !== claim.userId) throw otherAccount();
    userId = claim.userId;
  } else {
    const buyer = sub.accountId
      ? await prisma.user.findUnique({ where: { id: sub.accountId }, select: { id: true } })
      : null;
    userId = known?.userId ?? buyer?.id ?? linked?.userId ?? null;
    if (!userId) return { status: 'unknown', ...none };
  }

  const plan = PLAY_PRODUCTS[sub.productId];
  const period = PLAY_BASE_PLANS[sub.basePlanId];
  if (!plan || !period) {
    if (claim) throw new AppError(400, 'That purchase isn’t a Knowzone plan.', 'store-product');
    return { status: 'unknown', ...none };
  }

  const now = Date.now();
  const pending = sub.state === 'SUBSCRIPTION_STATE_PENDING';
  const entitled = ENTITLED.includes(sub.state) && (sub.expiresAt ?? 0) > now;
  const owner = userId;

  return prisma.$transaction(async (tx) => {
    const seen = {
      productId: sub.productId,
      basePlanId: sub.basePlanId,
      state: sub.state,
      expiresAt: sub.expiresAt ? new Date(sub.expiresAt) : null,
      autoRenew: sub.autoRenew,
      orderId: sub.orderId,
      linkedToken: sub.linkedToken,
    };
    await tx.googlePlayPurchase.upsert({
      where: { purchaseToken },
      create: { purchaseToken, userId: owner, acknowledged: sub.acknowledged, ...seen },
      update: { ...seen, ...(sub.acknowledged && { acknowledged: true }) },
    });
    // An upgrade, a new period or a re-subscribe: the purchase it replaced no longer counts.
    if (sub.linkedToken)
      await tx.googlePlayPurchase.updateMany({
        where: { purchaseToken: sub.linkedToken, userId: owner },
        data: { state: 'REPLACED' },
      });

    if (entitled) {
      // Google's order id is the receipt number; renewals of the same purchase end in ..0, ..1, …
      const reference =
        sub.orderId ?? `GP-${createHash('sha256').update(purchaseToken).digest('hex').slice(0, 20).toUpperCase()}`;
      let payment = await tx.payment.findUnique({ where: { providerRef: reference } });
      if (payment && payment.userId !== owner) throw otherAccount();
      const charged = !payment;
      payment ??= await tx.payment.create({
        data: {
          userId: owner,
          plan,
          period,
          amount: sub.price?.amount ?? toMinor(PRICES.NGN[plan][period]),
          currency: sub.price?.currency ?? 'NGN',
          status: 'paid',
          method: PLAY_METHOD,
          reference,
          providerRef: reference,
          provider: 'google_play',
          renewal: /\.\.\d+$/.test(reference),
          paidAt: new Date(),
        },
      });
      const cancelled = sub.state === 'SUBSCRIPTION_STATE_CANCELED';
      await givePlan(
        tx,
        { userId: owner, plan, period, method: PLAY_METHOD },
        {
          provider: 'google_play',
          providerToken: purchaseToken,
          periodEnd: new Date(sub.expiresAt!),
          autoRenew: sub.autoRenew && !cancelled,
          status: cancelled ? 'cancelled' : 'active',
          credits: charged,
        },
      );
      return { status: 'active' as const, userId: owner, payment, acknowledged: sub.acknowledged, ended: null };
    }

    // No paid time (expired, revoked, on hold, paused): the plan ends, if this purchase is the one it came from.
    const current = await tx.subscription.findUnique({ where: { userId: owner } });
    let ended: string | null = null;
    if (
      !pending &&
      current?.provider === 'google_play' &&
      current.providerToken === purchaseToken &&
      current.status !== 'expired'
    ) {
      await tx.subscription.update({
        where: { userId: owner },
        data: {
          status: 'expired',
          autoRenew: false,
          currentPeriodEnd: new Date(Math.min(current.currentPeriodEnd.getTime(), now)),
        },
      });
      await tx.user.update({ where: { id: owner }, data: { plan: 'FREE' } });
      ended = current.plan;
    }
    return {
      status: pending ? ('pending' as const) : ('inactive' as const),
      userId: owner,
      payment: null,
      acknowledged: sub.acknowledged,
      ended,
    };
  });
}

/** Google refunded or revoked an order: its receipt shows as refunded. */
export async function markGoogleRefund(orderId: string) {
  await prisma.payment.updateMany({
    where: { providerRef: orderId, provider: 'google_play', status: 'paid' },
    data: { status: 'refunded', refundedAt: new Date() },
  });
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
    // Google Play renews by itself and tells us; if that notice is late or lost, ask before ending the plan.
    if (s.provider === 'google_play' && s.providerToken && googlePlayConfigured()) {
      try {
        await syncGooglePurchase(s.providerToken);
        const after = await prisma.subscription.findUnique({ where: { userId: s.userId } });
        if (!after || after.status === 'expired' || after.currentPeriodEnd.getTime() > now) continue;
      } catch {
        // Google unreachable: give it a few days before ending a plan that may well have renewed.
        if (now - s.currentPeriodEnd.getTime() < 3 * DAY) continue;
      }
    }
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

  // Renewal reminders: 7 days and 1 day before the end (prepaid plans don't renew by themselves;
  // Google Play subscriptions do, and Google sends its own notices).
  for (const r of REMINDERS) {
    const soon = await prisma.subscription.findMany({
      where: {
        status: 'active',
        autoRenew: false,
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
