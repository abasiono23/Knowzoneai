/**
 * In-app mock of the Knowzone API so the frontend can be built and demoed
 * before the backend endpoints exist. Enabled with EXPO_PUBLIC_USE_MOCKS=true.
 * Data persists on the device so reloads keep you signed in.
 */
import type {
  AppSettings,
  Billing,
  HelpTicket,
  Safety,
  Payment,
  Connections,
  Consent,
  CreditEntry,
  DeviceSession,
  Redemption,
  ReferralInvalidReason,
  ReferralStatus,
  Transaction,
  User,
} from './api';
import { MOCK_CODE, REFERRAL_CREDITS, WELCOME_CREDITS } from './config';
import { findClassByCode, seedTeacher, teacherMock, type TeacherDb } from './mock-teacher';
import type { Personalization } from './personalization';
import { MONTHLY_CREDITS, PERIOD, PRICES, PROMOS, discountOf } from './billing/plans';
import { blockerFor, DAILY_CYCLE, getReward } from './rewards/catalog';
import { storage } from './storage';

type MockUser = User & {
  password: string;
  pendingReferral?: string;
  personalization?: Personalization;
  joinedClasses?: string[];
  /** Id of the referral this account was created through. */
  referredBy?: string;
  settings?: AppSettings;
  googleEmail?: string;
  appleEmail?: string;
  /** Set when deletion is requested; signing in again before then cancels it. */
  deleteAt?: number;
};
type Ledger = { transactions: Transaction[]; redemptions: Redemption[]; dailyNext: number; dailyLast: string | null };
type StoredReferral = {
  id: string;
  inviterId: string;
  inviteeId: string;
  friendName: string;
  joinedAt: number;
  emailVerified: boolean;
  qualifiedAt?: number;
  status: ReferralStatus;
  rejectReason?: string;
  credits: number;
};
type Db = {
  users: MockUser[];
  teachers?: Record<string, TeacherDb>;
  ledgers?: Record<string, Ledger>;
  referrals?: StoredReferral[];
  credits?: Record<string, CreditEntry[]>;
  referralSeeded?: string[];
  sessions?: Record<string, DeviceSession[]>;
  billing?: Record<string, Billing>;
  help?: Record<string, HelpTicket[]>;
  safety?: Record<string, Safety>;
  copyright?: { reference: string; at: number; notice: Record<string, string> }[];
};

const DB_KEY = 'knowzone.mockdb';
const DEMO_INVITER: MockUser = {
  id: 'demo-inviter',
  name: 'Ada',
  email: 'ada@example.com',
  password: 'password123',
  authProvider: 'email',
  emailVerified: true,
  termsAccepted: true,
  onboardingComplete: true,
  role: 'learner',
  xp: 640,
  coins: 120,
  level: 3,
  levelProgress: 0.6,
  streak: 6,
  dailyGoalMinutes: 15,
  todayMinutes: 0,
  aiCredits: 8,
  plan: 'FREE',
  referralCode: 'ADA2026',
};

class MockError extends Error {
  constructor(
    public status: number,
    message: string,
    public reason?: string,
  ) {
    super(message);
  }
}

const delay = (ms = 650) => new Promise((r) => setTimeout(r, ms));

async function load(): Promise<Db> {
  const raw = await storage.get(DB_KEY);
  const db: Db = raw ? JSON.parse(raw) : { users: [] };
  if (!db.users.some((u) => u.id === DEMO_INVITER.id)) db.users.push(DEMO_INVITER);
  return db;
}
const save = (db: Db) => storage.set(DB_KEY, JSON.stringify(db));

const publicUser = ({
  password: _p,
  pendingReferral: _r,
  personalization: _z,
  joinedClasses: _j,
  referredBy: _b,
  settings: _s,
  googleEmail: _g,
  appleEmail: _a,
  deleteAt: _d,
  ...u
}: MockUser): User => u;

function newUser(input: { name: string; email: string; password: string; provider: User['authProvider'] }): MockUser {
  return {
    id: Math.random().toString(36).slice(2, 12),
    name: input.name,
    email: input.email.toLowerCase(),
    password: input.password,
    authProvider: input.provider,
    emailVerified: input.provider !== 'email',
    termsAccepted: false,
    onboardingComplete: false,
    role: 'learner',
    xp: 0,
    coins: 0,
    level: 1,
    levelProgress: 0,
    streak: 0,
    dailyGoalMinutes: 15,
    todayMinutes: 0,
    aiCredits: WELCOME_CREDITS,
    plan: 'FREE',
    referralCode: Math.random().toString(36).slice(2, 9).toUpperCase(),
  };
}

/** Every level needs the same amount of XP, so progress always feels reachable. */
const XP_PER_LEVEL = 250;

const localDay = (t = Date.now()) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const mockId = () => Math.random().toString(36).slice(2, 10);

/** Per-user coin ledger. Accounts created before the ledger existed get an opening balance. */
function ledgerOf(db: Db, user: MockUser): Ledger {
  db.ledgers ??= {};
  if (!db.ledgers[user.id]) {
    db.ledgers[user.id] = { transactions: [], redemptions: [], dailyNext: 0, dailyLast: null };
    if (user.coins || user.xp)
      db.ledgers[user.id].transactions.push({
        id: mockId(),
        at: Date.now() - 86400000 * 3,
        coins: user.coins,
        xp: user.xp,
        reason: 'opening',
      });
  }
  return db.ledgers[user.id];
}

function applyReward(db: Db, user: MockUser, xp: number, coins: number, reason: string) {
  user.xp += xp;
  user.coins += coins;
  user.level = Math.floor(user.xp / XP_PER_LEVEL) + 1;
  user.levelProgress = (user.xp % XP_PER_LEVEL) / XP_PER_LEVEL;
  ledgerOf(db, user).transactions.unshift({ id: mockId(), at: Date.now(), coins, xp, reason });
  // A real learning activity is what qualifies a referral (PRD: “completes a qualifying learning activity”).
  if (xp > 0 && /^(game|course-lesson|course|quiz):/.test(reason)) qualifyReferral(db, user);
}

// ─── Referrals ──────────────────────────────────────────────────────────────

const REFERRAL_MONTHLY_CAP = 10;
/** Retired campaign codes, kept so old links explain themselves. */
const EXPIRED_CODES = ['KZ2025', 'SUMMER25', 'BACK2SCHOOL'];
const shortName = (name: string) => {
  const [first, last] = name.trim().split(/\s+/);
  return last ? `${first} ${last[0]}.` : first;
};

function creditsOf(db: Db, user: MockUser) {
  db.credits ??= {};
  if (!db.credits[user.id])
    db.credits[user.id] = [
      { id: mockId(), at: Date.now() - 4 * 86400000, credits: WELCOME_CREDITS, reason: 'welcome' },
    ];
  return db.credits[user.id];
}

function confirmedThisMonth(db: Db, inviterId: string) {
  const now = new Date();
  return (db.referrals ?? []).filter((r) => {
    if (r.inviterId !== inviterId || r.status !== 'confirmed' || !r.qualifiedAt) return false;
    const d = new Date(r.qualifiedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
}

function checkCode(
  db: Db,
  me: MockUser | undefined,
  raw: string,
): { inviter: MockUser } | { reason: ReferralInvalidReason } {
  const code = raw.trim().toUpperCase();
  if (EXPIRED_CODES.includes(code)) return { reason: 'expired' };
  const inviter = db.users.find((u) => u.referralCode === code);
  if (!inviter) return { reason: 'not-found' };
  if (me && inviter.id === me.id) return { reason: 'own-code' };
  if (me?.referredBy) return { reason: 'already-referred' };
  if (me?.onboardingComplete) return { reason: 'not-new' };
  if (confirmedThisMonth(db, inviter.id) >= REFERRAL_MONTHLY_CAP) return { reason: 'cap-reached' };
  return { inviter };
}

/** Pending referrals that miss the 30-day window are closed as not eligible. */
const REFERRAL_WINDOW = 30 * 86400000;
function expireReferrals(db: Db) {
  for (const r of db.referrals ?? [])
    if (r.status === 'pending' && Date.now() - r.joinedAt > REFERRAL_WINDOW) {
      r.status = 'rejected';
      r.rejectReason = 'Didn’t finish a first lesson, quiz or level within 30 days';
    }
}

function qualifyReferral(db: Db, user: MockUser) {
  expireReferrals(db);
  const r = (db.referrals ?? []).find((x) => x.id === user.referredBy);
  if (!r || r.status !== 'pending' || !user.emailVerified) return;
  const inviter = db.users.find((u) => u.id === r.inviterId);
  r.status = 'confirmed';
  r.qualifiedAt = Date.now();
  r.emailVerified = true;
  user.aiCredits += r.credits;
  creditsOf(db, user).unshift({
    id: mockId(),
    at: Date.now(),
    credits: r.credits,
    reason: 'referral-invitee',
    friendName: inviter ? shortName(inviter.name) : undefined,
  });
  if (inviter) {
    inviter.aiCredits += r.credits;
    creditsOf(db, inviter).unshift({
      id: mockId(),
      at: Date.now(),
      credits: r.credits,
      reason: 'referral-inviter',
      friendName: r.friendName,
    });
  }
}

/** Demo history so the dashboard shows every state: one confirmed, one pending, one rejected. */
function seedReferrals(db: Db, user: MockUser) {
  db.referralSeeded ??= [];
  // Only established demo learners get sample history; brand-new accounts start empty.
  if (db.referralSeeded.includes(user.id) || user.xp < 100) return;
  db.referralSeeded.push(user.id);
  db.referrals ??= [];
  const day = 86400000;
  const now = Date.now();
  const base = { inviterId: user.id, credits: REFERRAL_CREDITS };
  db.referrals.push(
    {
      ...base,
      id: mockId(),
      inviteeId: 'seed-1',
      friendName: 'Chioma A.',
      joinedAt: now - 9 * day,
      emailVerified: true,
      qualifiedAt: now - 8 * day,
      status: 'confirmed',
    },
    {
      ...base,
      id: mockId(),
      inviteeId: 'seed-2',
      friendName: 'Tunde B.',
      joinedAt: now - 2 * day,
      emailVerified: true,
      status: 'pending',
    },
    {
      ...base,
      id: mockId(),
      inviteeId: 'seed-3',
      friendName: 'Kemi L.',
      joinedAt: now - 5 * day,
      emailVerified: false,
      status: 'rejected',
      rejectReason: 'Signed up on a device that already has a Knowzone account',
    },
  );
  creditsOf(db, user);
  user.aiCredits += REFERRAL_CREDITS;
  db.credits![user.id].unshift({
    id: mockId(),
    at: now - 8 * day,
    credits: REFERRAL_CREDITS,
    reason: 'referral-inviter',
    friendName: 'Chioma A.',
  });
}

// ─── Profile and settings ───────────────────────────────────────────────────

function settingsOf(user: MockUser): AppSettings {
  const r = user.personalization?.reminders;
  user.settings ??= {
    notifications: {
      push: true,
      email: true,
      categories: { reminders: true, streak: true, quests: true, classes: true, referrals: true, news: false },
      quietHours: { enabled: true, from: '21:30', to: '07:00' },
    },
    reminders: [
      {
        id: 'r1',
        label: 'Daily study',
        time: r?.time ?? '16:00',
        days: r?.days?.length ? r.days : [1, 2, 3, 4, 5],
        enabled: r?.enabled ?? true,
      },
      { id: 'r2', label: 'Weekend revision', time: '10:00', days: [6], enabled: false },
    ],
    appLanguage: 'en',
    privacy: { profileVisibility: 'school', personalisedRecommendations: true, usageAnalytics: true, improveAi: false },
  };
  return user.settings;
}

function connectionsOf(user: MockUser): Connections {
  return {
    email: { address: user.email, verified: user.emailVerified, hasPassword: !!user.password },
    google: user.googleEmail
      ? { email: user.googleEmail }
      : user.authProvider === 'google'
        ? { email: user.email }
        : null,
    apple: user.appleEmail ? { email: user.appleEmail } : user.authProvider === 'apple' ? { email: user.email } : null,
  };
}

function sessionsOf(db: Db, user: MockUser): DeviceSession[] {
  db.sessions ??= {};
  if (!db.sessions[user.id]) {
    const now = Date.now();
    db.sessions[user.id] = [
      {
        id: 'this',
        device: 'This browser',
        platform: 'web',
        location: 'Lagos, Nigeria',
        lastActive: now,
        current: true,
      },
      {
        id: mockId(),
        device: 'Tecno Spark 20',
        platform: 'android',
        location: 'Lagos, Nigeria',
        lastActive: now - 3 * 3600000,
        current: false,
      },
      {
        id: mockId(),
        device: 'iPad (school)',
        platform: 'ios',
        location: 'Ibadan, Nigeria',
        lastActive: now - 6 * 86400000,
        current: false,
      },
    ];
  }
  db.sessions[user.id].forEach((x) => x.current && (x.lastActive = Date.now()));
  return db.sessions[user.id];
}

const strongEnough = (pw: string) => pw.length >= 8 && /[a-z]/i.test(pw) && /\d/.test(pw);

// ─── Billing ────────────────────────────────────────────────────────────────

const DAY = 86400000;

function billingOf(db: Db, user: MockUser): Billing {
  db.billing ??= {};
  const b = (db.billing[user.id] ??= { subscription: null, payments: [], tickets: [] });
  const sub = b.subscription;
  // Renew or expire whenever billing is read (the real server does this with a scheduler and webhooks).
  if (sub && sub.status !== 'expired' && Date.now() > sub.currentPeriodEnd) {
    if (sub.status === 'active' && sub.autoRenew) {
      const currency = b.payments.find((p) => p.status === 'paid')?.currency ?? 'NGN';
      const amount = PRICES[currency][sub.plan][sub.period];
      b.payments.unshift({
        id: mockId(),
        at: sub.currentPeriodEnd,
        plan: sub.plan,
        period: sub.period,
        amount,
        discount: 0,
        currency,
        status: 'paid',
        method: sub.method,
        reference: `KZ-${mockId().toUpperCase()}`,
        renewal: true,
      });
      sub.currentPeriodEnd += PERIOD[sub.period].days * DAY;
      grantPlanCredits(db, user, sub.plan, sub.period);
    } else {
      sub.status = 'expired';
      user.plan = 'FREE';
    }
  }
  return b;
}

function grantPlanCredits(db: Db, user: MockUser, plan: 'PLUS' | 'PRO', period: 'month' | 'term' | 'year') {
  const credits = MONTHLY_CREDITS[plan] * PERIOD[period].months;
  user.aiCredits += credits;
  creditsOf(db, user).unshift({ id: mockId(), at: Date.now(), credits, reason: 'plan' });
}

function activate(db: Db, user: MockUser, payment: Payment) {
  const b = billingOf(db, user);
  const now = Date.now();
  const prev = b.subscription;
  // Renewing the same plan early adds time on top of what's left; a different plan starts today.
  const from =
    prev && prev.status !== 'expired' && prev.plan === payment.plan ? Math.max(now, prev.currentPeriodEnd) : now;
  b.subscription = {
    plan: payment.plan,
    period: payment.period,
    status: 'active',
    startedAt: prev && prev.status !== 'expired' ? prev.startedAt : now,
    currentPeriodEnd: from + PERIOD[payment.period].days * DAY,
    autoRenew: payment.method.type === 'card' || payment.method.type === 'store',
    method: payment.method,
  };
  user.plan = payment.plan;
  grantPlanCredits(db, user, payment.plan, payment.period);
}

function promoFor(code: string | undefined, period: 'month' | 'term' | 'year', b: Billing) {
  if (!code) return null;
  const c = code.trim().toUpperCase();
  const promo = PROMOS[c];
  if (!promo) throw new MockError(404, 'That code isn’t valid. Check the spelling and try again.');
  if (promo.expired) throw new MockError(410, 'That code has expired.');
  if (promo.months && !promo.months.includes(period))
    throw new MockError(400, 'That code only works on monthly plans.');
  if (b.payments.some((p) => p.status === 'paid' && p.promo === c))
    throw new MockError(409, 'You’ve already used that code.');
  return { code: c, ...promo };
}

// ─── Help and safety ────────────────────────────────────────────────────────

const ACK: Record<HelpTicket['kind'], string> = {
  support: 'Thanks for getting in touch. A member of the Knowzone team will reply here, usually within 1 working day.',
  bug: 'Thanks for the report. Our engineers review every bug. We’ll update this ticket if we need more details or once it’s fixed.',
  feedback:
    'Thank you! Every suggestion is read by the product team. We don’t reply to each one, but it shapes what we build.',
  report:
    'Thanks for helping keep Knowzone safe. A moderator reviews reports within 24 hours. The person you reported isn’t told who reported them.',
  copyright: 'We’ve received your notice and will review it within 3 working days.',
  appeal:
    'We’ve received your appeal. A different moderator from the one who made the decision will review it within 3 working days.',
};

function ticketsOf(db: Db, user: MockUser) {
  db.help ??= {};
  return (db.help[user.id] ??= []);
}

function newTicket(
  db: Db,
  user: MockUser,
  t: Pick<HelpTicket, 'kind' | 'topic' | 'subject' | 'meta'> & { message: string },
): HelpTicket {
  const now = Date.now();
  const ticket: HelpTicket = {
    id: `KZ-${String(Math.floor(100000 + Math.random() * 900000))}`,
    kind: t.kind,
    topic: t.topic,
    subject: t.subject,
    status: t.kind === 'feedback' ? 'resolved' : 'open',
    createdAt: now,
    updatedAt: now,
    meta: t.meta,
    messages: [
      { id: mockId(), at: now, from: 'me', text: t.message },
      { id: mockId(), at: now + 1000, from: 'support', text: ACK[t.kind], template: 'ack' },
    ],
  };
  ticketsOf(db, user).unshift(ticket);
  return ticket;
}

function safetyOf(db: Db, user: MockUser): Safety {
  db.safety ??= {};
  return (db.safety[user.id] ??= { blockedUsers: [], hidden: [] });
}

/** While suspended, only these work (plus /me/help/*): appeal, data download, settings and sign-out. */
const SUSPENDED_ALLOWED = [
  '/me',
  '/me/logout',
  '/me/appeal',
  '/me/export',
  '/me/export/email',
  '/me/settings',
  '/me/sessions/revoke',
];

export async function mockRequest<T>(path: string, init: RequestInit, token: string | null): Promise<T> {
  // OAuth hand-offs take a moment in real life; keep the demo honest.
  await delay(path === '/auth/social' ? 2600 : 650);
  const body = typeof init.body === 'string' ? JSON.parse(init.body) : {};
  const db = await load();
  const me = db.users.find((u) => u.id === token);
  const requireMe = () => {
    if (!me) throw new MockError(401, 'Please sign in');
    return me;
  };
  if (me?.restriction?.until && Date.now() > me.restriction.until) {
    delete me.restriction; // temporary restrictions lift on their own
    await save(db);
  }
  if (
    me?.restriction?.kind === 'suspended' &&
    path.startsWith('/me/') &&
    !SUSPENDED_ALLOWED.includes(path) &&
    !path.startsWith('/me/help/')
  )
    throw new MockError(403, 'Your account is suspended', 'suspended');
  const done = async <R>(result: R) => {
    await save(db);
    return result as unknown as T;
  };

  if (path.startsWith('/teacher/')) {
    const user = requireMe();
    db.teachers ??= {};
    const teacherDb = (db.teachers[user.id] ??= { classes: [], ownerName: user.name });
    const result = teacherMock(path, init.method ?? 'GET', body, teacherDb);
    if (result === null) throw new MockError(404, 'Not found');
    if (result !== undefined) return done(result);
  }

  switch (path) {
    case '/auth/register': {
      const email = String(body.email).toLowerCase();
      if (db.users.some((u) => u.email === email))
        throw new MockError(409, 'An account with this email already exists');
      const user = newUser({ name: body.name, email, password: body.password, provider: 'email' });
      user.termsAccepted = !!(body.consent as Consent)?.terms;
      db.users.push(user);
      return done({ token: user.id, user: publicUser(user) });
    }
    case '/auth/login': {
      const user = db.users.find((u) => u.email === String(body.email).toLowerCase());
      if (!user || user.password !== body.password) throw new MockError(401, 'Email or password is incorrect');
      delete user.deleteAt; // signing in during the grace period cancels a deletion request
      return done({ token: user.id, user: publicUser(user) });
    }
    case '/auth/social': {
      const email = body.provider === 'google' ? 'student@gmail.com' : 'student@icloud.com';
      let user = db.users.find((u) => u.email === email);
      const isNewUser = !user;
      if (!user) {
        user = newUser({ name: 'Tobi', email, password: '', provider: body.provider });
        db.users.push(user);
      }
      return done({ token: user.id, user: publicUser(user), isNewUser });
    }
    case '/auth/verify-email': {
      const user = requireMe();
      if (body.code !== MOCK_CODE) throw new MockError(400, 'That code isn’t right. Check your email and try again.');
      user.emailVerified = true;
      return done({ user: publicUser(user) });
    }
    case '/auth/resend-verification':
      requireMe();
      return done({ ok: true });
    case '/auth/forgot-password':
      // Always succeed so the response never reveals which emails have accounts.
      return done({ ok: true });
    case '/auth/verify-reset-code': {
      if (body.code !== MOCK_CODE) throw new MockError(400, 'That code isn’t right. Check your email and try again.');
      return done({ resetToken: String(body.email).toLowerCase() });
    }
    case '/auth/reset-password': {
      const user = db.users.find((u) => u.email === body.resetToken);
      if (user) user.password = body.password;
      return done({ ok: true });
    }
    case '/me':
      return done({ user: publicUser(requireMe()) });
    case '/me/logout':
      return done({ ok: true });
    case '/me/billing': {
      const user = requireMe();
      return done({ billing: billingOf(db, user), user: publicUser(user) });
    }
    case '/me/billing/promo': {
      const user = requireMe();
      const promo = promoFor(String(body.code ?? ''), body.period, billingOf(db, user));
      return done({ promo: { code: promo!.code, percent: promo!.percent, label: promo!.label } });
    }
    case '/me/billing/checkout': {
      const user = requireMe();
      const b = billingOf(db, user);
      const plan = body.plan as 'PLUS' | 'PRO';
      const period = body.period as 'month' | 'term' | 'year';
      const currency = body.currency === 'USD' ? 'USD' : 'NGN';
      if (!PRICES[currency][plan]?.[period]) throw new MockError(400, 'Choose a plan first');
      const promo = promoFor(body.promo, period, b);
      const price = PRICES[currency][plan][period];
      const discount = promo ? discountOf(price, promo.percent) : 0;
      const method = body.method as Payment['method'];
      if (currency === 'USD' && method.type !== 'card')
        throw new MockError(400, 'Dollar payments are by card. Choose card, or pay in naira.');
      const now = Date.now();
      const payment: Payment = {
        id: mockId(),
        at: now,
        plan,
        period,
        amount: Math.round((price - discount) * 100) / 100,
        discount,
        currency,
        status: 'paid',
        method,
        reference: `KZ-${mockId().toUpperCase()}`,
        promo: promo?.code,
      };
      if (method.type === 'transfer') {
        payment.status = 'pending';
        payment.transfer = {
          bank: 'Wema Bank',
          accountNumber: `78${String(Math.floor(Math.random() * 1e8)).padStart(8, '0')}`,
          accountName: 'Knowzone AI (Flutterwave)',
          expiresAt: now + 30 * 60000,
        };
      } else if (method.type === 'ussd') {
        payment.status = 'pending';
        payment.ussd = {
          bank: method.label.replace(/^USSD · /, ''),
          code: `*737*000*${Math.floor(payment.amount)}#`,
          expiresAt: now + 15 * 60000,
        };
      } else if (body.outcome === 'declined') {
        payment.status = 'failed';
        payment.failureReason =
          'Your bank declined the payment. This is often a daily online-spending limit or low balance.';
      }
      b.payments.unshift(payment);
      if (payment.status === 'paid') activate(db, user, payment);
      return done({ payment, user: publicUser(user) });
    }
    case '/me/billing/confirm': {
      const user = requireMe();
      const b = billingOf(db, user);
      const payment = b.payments.find((x) => x.id === body.id);
      if (!payment) throw new MockError(404, 'Payment not found');
      if (payment.status === 'pending') {
        const exp = payment.transfer?.expiresAt ?? payment.ussd?.expiresAt ?? 0;
        if (Date.now() > exp) {
          payment.status = 'failed';
          payment.failureReason = 'We didn’t receive the money before the payment details expired.';
        } else {
          payment.status = 'paid';
          activate(db, user, payment);
        }
      }
      return done({ payment, user: publicUser(user) });
    }
    case '/me/billing/cancel': {
      const user = requireMe();
      const b = billingOf(db, user);
      if (!b.subscription || b.subscription.status !== 'active')
        throw new MockError(409, 'There’s no active subscription to cancel');
      b.subscription.status = 'cancelled';
      b.subscription.autoRenew = false;
      b.subscription.cancelReason = String(body.reason ?? '');
      return done({ billing: b });
    }
    case '/me/billing/resume': {
      const user = requireMe();
      const b = billingOf(db, user);
      if (!b.subscription || b.subscription.status !== 'cancelled') throw new MockError(409, 'Nothing to resume');
      b.subscription.status = 'active';
      b.subscription.autoRenew = true;
      delete b.subscription.cancelReason;
      return done({ billing: b });
    }
    case '/me/billing/restore': {
      const user = requireMe();
      const b = billingOf(db, user);
      // App-store purchases follow the store account, so they can be restored on a new phone.
      const storeSub = b.subscription?.method.type === 'store' && b.subscription.status !== 'expired';
      if (storeSub) user.plan = b.subscription!.plan;
      return done({ restored: !!storeSub, billing: b, user: publicUser(user) });
    }
    case '/me/billing/support': {
      const user = requireMe();
      const b = billingOf(db, user);
      const payment = b.payments.find((x) => x.id === body.paymentId);
      const ticket = {
        id: `T-${mockId().slice(0, 6).toUpperCase()}`,
        at: Date.now(),
        topic: body.topic,
        paymentId: payment?.id,
        message: String(body.message ?? ''),
        status: 'open' as 'open' | 'resolved',
        resolution: undefined as string | undefined,
      };
      // Refund policy: a full refund within 7 days of a first payment, no questions asked.
      if (
        body.topic === 'refund' &&
        payment?.status === 'paid' &&
        Date.now() - payment.at < 7 * DAY &&
        !payment.renewal
      ) {
        payment.status = 'refunded';
        payment.refundedAt = Date.now();
        if (b.subscription) b.subscription.status = 'expired';
        user.plan = 'FREE';
        ticket.status = 'resolved';
        ticket.resolution = 'Refund approved. It reaches your account in 5–10 working days, depending on your bank.';
      } else if (body.topic === 'refund') {
        ticket.resolution = 'A billing specialist will review this within 2 working days.';
      }
      b.tickets.unshift(ticket);
      return done({ ticket, billing: b, user: publicUser(user) });
    }
    case '/me/help/tickets': {
      const user = requireMe();
      if (init.method !== 'POST') return done({ tickets: ticketsOf(db, user) });
      const subject = String(body.subject ?? '').trim();
      const message = String(body.message ?? '').trim();
      if (subject.length < 3) throw new MockError(400, 'Add a short subject');
      if (message.length < 10) throw new MockError(400, 'Tell us a little more (at least 10 characters)');
      const ticket = newTicket(db, user, { kind: body.kind, topic: body.topic, subject, message, meta: body.meta });
      return done({ ticket });
    }
    case '/me/help/tickets/reply': {
      const user = requireMe();
      const ticket = ticketsOf(db, user).find((t) => t.id === body.id);
      if (!ticket) throw new MockError(404, 'Ticket not found');
      const text = String(body.text ?? '').trim();
      if (!text) throw new MockError(400, 'Write a message first');
      ticket.messages.push({ id: mockId(), at: Date.now(), from: 'me', text });
      ticket.status = 'open';
      ticket.updatedAt = Date.now();
      return done({ ticket });
    }
    case '/me/help/tickets/close': {
      const user = requireMe();
      const ticket = ticketsOf(db, user).find((t) => t.id === body.id);
      if (!ticket) throw new MockError(404, 'Ticket not found');
      ticket.status = 'resolved';
      ticket.updatedAt = Date.now();
      return done({ ticket });
    }
    case '/me/safety':
      return done({ safety: safetyOf(db, requireMe()) });
    case '/me/report': {
      const user = requireMe();
      const safety = safetyOf(db, user);
      const title = String(body.title ?? '');
      const ticket = newTicket(db, user, {
        kind: 'report',
        topic: 'safety',
        subject: `Report: ${title || body.type}`,
        message: [String(body.reason ?? ''), String(body.details ?? '').trim()].filter(Boolean).join('\n\n'),
        meta: { type: String(body.type), itemId: String(body.id), title, reason: String(body.reason ?? '') },
      });
      if (body.hide && !safety.hidden.some((h) => h.type === body.type && h.id === body.id))
        safety.hidden.unshift({ type: body.type, id: String(body.id), title, at: Date.now() });
      if (body.block && !safety.blockedUsers.some((b) => b.id === body.id))
        safety.blockedUsers.unshift({ id: String(body.id), name: title, at: Date.now() });
      return done({ ticket, safety });
    }
    case '/me/safety/block': {
      const safety = safetyOf(db, requireMe());
      if (!safety.blockedUsers.some((b) => b.id === body.id))
        safety.blockedUsers.unshift({ id: String(body.id), name: String(body.name ?? ''), at: Date.now() });
      return done({ safety });
    }
    case '/me/safety/unblock': {
      const safety = safetyOf(db, requireMe());
      safety.blockedUsers = safety.blockedUsers.filter((b) => b.id !== body.id);
      return done({ safety });
    }
    case '/me/safety/unhide': {
      const safety = safetyOf(db, requireMe());
      safety.hidden = safety.hidden.filter((h) => !(h.type === body.type && h.id === body.id));
      return done({ safety });
    }
    case '/legal/copyright': {
      for (const f of ['name', 'email', 'work', 'location'])
        if (!String(body[f] ?? '').trim()) throw new MockError(400, 'Please fill in every required field');
      if (body.statement !== 'true') throw new MockError(400, 'Please confirm the good-faith statement');
      const reference = `CR-${String(Math.floor(100000 + Math.random() * 900000))}`;
      (db.copyright ??= []).unshift({ reference, at: Date.now(), notice: body });
      if (me)
        newTicket(db, me, {
          kind: 'copyright',
          subject: `Copyright notice ${reference}`,
          message: `${body.work}\n\nWhere: ${body.location}`,
          meta: { reference },
        });
      return done({ reference });
    }
    case '/me/appeal': {
      const user = requireMe();
      if (!user.restriction) throw new MockError(409, 'Your account isn’t restricted');
      if (user.restriction.appeal?.status === 'pending')
        throw new MockError(409, 'You already have an appeal in review');
      const message = String(body.message ?? '').trim();
      if (message.length < 20) throw new MockError(400, 'Tell us why in a few sentences (at least 20 characters)');
      const ticket = newTicket(db, user, {
        kind: 'appeal',
        topic: 'safety',
        subject: 'Appeal: account restriction',
        message,
      });
      user.restriction.appeal = { ticketId: ticket.id, at: Date.now(), status: 'pending' };
      return done({ user: publicUser(user), ticket });
    }
    case '/me/credits/spend': {
      const user = requireMe();
      const credits = Math.max(0, Math.round(Number(body.credits) || 0));
      if (user.aiCredits < credits) throw new MockError(402, 'Not enough AI credits', 'no-credits');
      user.aiCredits -= credits;
      creditsOf(db, user).unshift({
        id: mockId(),
        at: Date.now(),
        credits: -credits,
        reason: 'spend',
        friendName: String(body.reason ?? ''),
      });
      return done({ user: publicUser(user) });
    }
    case '/me/profile': {
      const user = requireMe();
      const name = body.name !== undefined ? String(body.name).trim() : undefined;
      if (name !== undefined && name.length < 2) throw new MockError(400, 'Please enter your name');
      if (body.username !== undefined && body.username !== '') {
        const u = String(body.username).trim().toLowerCase();
        if (!/^[a-z0-9_]{3,20}$/.test(u))
          throw new MockError(400, 'Usernames are 3–20 letters, numbers or underscores');
        if (db.users.some((x) => x.id !== user.id && x.username === u))
          throw new MockError(409, 'That username is taken');
        user.username = u;
      } else if (body.username === '') delete user.username;
      if (body.bio !== undefined && String(body.bio).length > 160)
        throw new MockError(400, 'Keep your bio under 160 characters');
      if (name !== undefined) user.name = name;
      if (body.school !== undefined) user.school = String(body.school).trim().slice(0, 80);
      if (body.grade !== undefined) user.grade = String(body.grade).trim().slice(0, 40);
      if (body.bio !== undefined) user.bio = String(body.bio).trim();
      if (body.photo !== undefined) user.photo = body.photo;
      return done({ user: publicUser(user) });
    }
    case '/me/password': {
      const user = requireMe();
      if (user.password && user.password !== body.current)
        throw new MockError(401, 'Your current password is incorrect');
      if (!strongEnough(String(body.next ?? '')))
        throw new MockError(400, 'Use at least 8 characters with letters and numbers');
      if (body.next === user.password) throw new MockError(400, 'Choose a password you haven’t used before');
      user.password = String(body.next);
      return done({ ok: true });
    }
    case '/me/connections': {
      const user = requireMe();
      if (init.method === 'POST') {
        const provider = body.provider as 'google' | 'apple';
        const c = connectionsOf(user);
        if (body.action === 'unlink') {
          const methods = Number(c.email.hasPassword) + Number(!!c.google) + Number(!!c.apple);
          if (methods <= 1) throw new MockError(409, 'Add a password first, so you can still sign in.');
          if (provider === 'google') {
            delete user.googleEmail;
            if (user.authProvider === 'google') user.authProvider = 'email';
          } else {
            delete user.appleEmail;
            if (user.authProvider === 'apple') user.authProvider = 'email';
          }
        } else if (provider === 'google') user.googleEmail = user.email;
        else user.appleEmail = user.email;
      }
      return done({ connections: connectionsOf(user) });
    }
    case '/me/sessions':
      return done({ sessions: sessionsOf(db, requireMe()) });
    case '/me/sessions/revoke': {
      const user = requireMe();
      const list = sessionsOf(db, user);
      db.sessions![user.id] =
        body.id === 'others' ? list.filter((x) => x.current) : list.filter((x) => x.id !== body.id || x.current);
      return done({ sessions: db.sessions![user.id] });
    }
    case '/me/settings': {
      const user = requireMe();
      const cur = settingsOf(user);
      if (init.method === 'POST') {
        user.settings = {
          ...cur,
          ...body,
          notifications: { ...cur.notifications, ...(body.notifications ?? {}) },
          privacy: { ...cur.privacy, ...(body.privacy ?? {}) },
        };
      }
      return done({ settings: settingsOf(user) });
    }
    case '/me/export': {
      const user = requireMe();
      return done({
        export: {
          exportedAt: new Date().toISOString(),
          account: publicUser(user),
          personalization: user.personalization ?? null,
          settings: settingsOf(user),
          connections: connectionsOf(user),
          devices: sessionsOf(db, user),
          coins: ledgerOf(db, user),
          aiCredits: creditsOf(db, user),
          referralsSent: (db.referrals ?? [])
            .filter((r) => r.inviterId === user.id)
            .map(({ inviterId: _i, inviteeId: _e, ...r }) => r),
          classes: user.joinedClasses ?? [],
        },
      });
    }
    case '/me/export/email':
      requireMe();
      return done({ requestedAt: Date.now() });
    case '/me/delete': {
      const user = requireMe();
      if (user.password && user.password !== body.password) throw new MockError(401, 'That password isn’t right');
      user.deleteAt = Date.now() + 14 * 86400000;
      if (db.sessions) delete db.sessions[user.id];
      return done({ deleteAt: user.deleteAt });
    }
    case '/me/rewards': {
      const user = requireMe();
      const xp = Math.max(0, Math.round(Number(body.xp) || 0));
      const coins = Math.round(Number(body.coins) || 0);
      if (user.coins + coins < 0) throw new MockError(402, 'Not enough coins');
      ledgerOf(db, user);
      applyReward(db, user, xp, coins, String(body.reason ?? 'reward'));
      return done({ user: publicUser(user) });
    }
    case '/me/wallet': {
      const user = requireMe();
      const l = ledgerOf(db, user);
      const today = localDay();
      return done({
        wallet: {
          transactions: l.transactions.slice(0, 200),
          redemptions: l.redemptions,
          daily: { next: l.dailyNext, claimedToday: l.dailyLast === today, lastClaim: l.dailyLast },
        },
      });
    }
    case '/me/redeem': {
      const user = requireMe();
      const l = ledgerOf(db, user);
      const reward = getReward(String(body.rewardId));
      if (!reward) throw new MockError(404, 'That reward doesn’t exist');
      const blocker = blockerFor(reward, {
        coins: user.coins,
        level: user.level,
        owned: l.redemptions.some((r) => r.rewardId === reward.id),
        today: localDay(),
      });
      if (blocker === 'insufficient') throw new MockError(402, `You need ${reward.price - user.coins} more coins`);
      if (blocker === 'level') throw new MockError(403, `Reach level ${reward.minLevel} to redeem this`);
      if (blocker === 'owned') throw new MockError(409, 'You already have this reward');
      if (blocker)
        throw new MockError(
          410,
          blocker === 'expired' ? 'This reward is no longer available' : 'This reward isn’t available yet',
        );
      const redemption: Redemption = {
        id: mockId(),
        rewardId: reward.id,
        at: Date.now(),
        cost: reward.price,
        code: `KZR-${mockId().slice(0, 6).toUpperCase()}`,
      };
      l.redemptions.unshift(redemption);
      applyReward(db, user, 0, -reward.price, `redeem:${reward.id}`);
      return done({ user: publicUser(user), redemption });
    }
    case '/me/daily-reward': {
      const user = requireMe();
      const l = ledgerOf(db, user);
      const today = localDay();
      if (l.dailyLast === today) throw new MockError(409, 'You’ve already claimed today’s reward');
      const day = l.dailyNext;
      const reward = DAILY_CYCLE[day];
      l.dailyLast = today;
      l.dailyNext = (day + 1) % DAILY_CYCLE.length;
      applyReward(db, user, reward.xp, reward.coins, `daily-reward:${day + 1}`);
      return done({ user: publicUser(user), reward: { ...reward, day } });
    }
    case '/me/consent': {
      const user = requireMe();
      user.termsAccepted = !!body.terms && !!body.privacy && !!body.age;
      return done({ user: publicUser(user) });
    }
    case '/referrals/validate': {
      const result = checkCode(db, me, String(body.code ?? ''));
      return done(
        'inviter' in result
          ? { valid: true, inviterName: shortName(result.inviter.name) }
          : { valid: false, reason: result.reason },
      );
    }
    case '/me/referral': {
      const user = requireMe();
      const result = checkCode(db, user, String(body.code ?? ''));
      if (!('inviter' in result))
        throw new MockError(result.reason === 'not-found' ? 404 : 409, 'This invite code can’t be used', result.reason);
      db.referrals ??= [];
      const referral: StoredReferral = {
        id: mockId(),
        inviterId: result.inviter.id,
        inviteeId: user.id,
        friendName: shortName(user.name),
        joinedAt: Date.now(),
        emailVerified: user.emailVerified,
        status: 'pending',
        credits: REFERRAL_CREDITS,
      };
      db.referrals.push(referral);
      user.referredBy = referral.id;
      user.pendingReferral = String(body.code).trim().toUpperCase();
      return done({ user: publicUser(user) });
    }
    case '/me/referrals': {
      const user = requireMe();
      seedReferrals(db, user);
      expireReferrals(db);
      const mine = (db.referrals ?? []).filter((r) => r.inviterId === user.id).sort((a, b) => b.joinedAt - a.joinedAt);
      const invite = (db.referrals ?? []).find((r) => r.id === user.referredBy);
      const inviter = invite && db.users.find((u) => u.id === invite.inviterId);
      return done({
        code: user.referralCode,
        link: `https://knowzone.ai/invite/${user.referralCode}`,
        rewardCredits: REFERRAL_CREDITS,
        monthlyCap: REFERRAL_MONTHLY_CAP,
        confirmedThisMonth: confirmedThisMonth(db, user.id),
        referrals: mine.map(({ inviterId: _i, inviteeId: _e, ...r }) => r),
        credits: creditsOf(db, user),
        invitedBy: invite
          ? {
              inviterName: inviter ? shortName(inviter.name) : 'A friend',
              status: invite.status,
              appliedAt: invite.joinedAt,
              emailVerified: user.emailVerified,
              qualifiedAt: invite.qualifiedAt,
            }
          : null,
        user: publicUser(user),
      });
    }
    case '/me/personalization': {
      const user = requireMe();
      if (!init.method || init.method === 'GET') return done({ personalization: user.personalization ?? null });
      user.personalization = body;
      if (body.dailyMinutes) user.dailyGoalMinutes = body.dailyMinutes;
      return done({ user: publicUser(user) });
    }
    case '/classes/join': {
      const user = requireMe();
      const found = findClassByCode(db.teachers ?? {}, String(body.code));
      if (!found) throw new MockError(404, 'We couldn’t find a class with that code. Check it with your teacher.');
      user.joinedClasses = [...new Set([...(user.joinedClasses ?? []), found.cls.id])];
      return done({ className: found.cls.name, teacherName: found.teacherName });
    }
    case '/me/onboarding/complete': {
      const user = requireMe();
      user.onboardingComplete = true;
      if (user.personalization?.learnerType === 'teacher') {
        user.role = 'teacher';
        db.teachers ??= {};
        const teacherDb = (db.teachers[user.id] ??= { classes: [], ownerName: user.name });
        seedTeacher(teacherDb, user.personalization.firstClass);
      }
      return done({ user: publicUser(user) });
    }
    case '/materials':
      if (!init.method || init.method === 'GET') return done({ materials: [] });
      break;
  }
  throw new MockError(503, `Mock mode: ${path} needs the real backend. Set EXPO_PUBLIC_USE_MOCKS=false.`);
}
