import { randomBytes } from 'node:crypto';

import type { User } from '../generated/prisma/client.js';
import { dayKey } from '../lib/time.js';

export const WELCOME_CREDITS = 5;

/** Every level needs the same XP, so the next level always feels reachable (matches the app). */
export const XP_PER_LEVEL = 250;

export function levelFor(xp: number) {
  return { level: Math.floor(xp / XP_PER_LEVEL) + 1, levelProgress: (xp % XP_PER_LEVEL) / XP_PER_LEVEL };
}

export function newReferralCode() {
  // No 0/O/1/I so codes are easy to read aloud.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(randomBytes(7), (b) => alphabet[b % alphabet.length]).join('');
}

/** "Amara Okeke" → "Amara O.", how people appear to others. */
export function shortName(name: string) {
  const [first, last] = name.trim().split(/\s+/);
  return last ? `${first} ${last[0]}.` : first;
}

/** The account as the app sees it. Never includes secrets or linked-account ids. */
export function toPublicUser(u: User) {
  const activeToday = u.lastActiveDate && dayKey(u.lastActiveDate) === dayKey();
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    authProvider: u.authProvider,
    emailVerified: u.emailVerified,
    termsAccepted: u.termsAccepted,
    onboardingComplete: u.onboardingComplete,
    role: u.role,
    xp: u.xp,
    coins: u.coins,
    ...levelFor(u.xp),
    streak: u.streak,
    dailyGoalMinutes: u.dailyGoalMinutes,
    todayMinutes: activeToday ? Math.floor(u.todayMinutes) : 0,
    aiCredits: u.aiCredits,
    plan: u.plan,
    referralCode: u.referralCode,
    ...(u.username && { username: u.username }),
    ...(u.school && { school: u.school }),
    ...(u.grade && { grade: u.grade }),
    ...(u.bio && { bio: u.bio }),
    ...(u.photo != null && { photo: u.photo }),
    ...(u.restriction != null && { restriction: u.restriction }),
  };
}

export type PublicUser = ReturnType<typeof toPublicUser>;

/** At least 8 characters with letters and numbers (same rule as the app). */
export const strongEnough = (pw: string) => pw.length >= 8 && /[a-z]/i.test(pw) && /\d/.test(pw);
