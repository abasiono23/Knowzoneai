import type { User } from './api';

/**
 * Details typed on "Create account", held in memory until the student accepts
 * the terms. The account is only created after consent, and the password never
 * goes into route params.
 */
type PendingSignup = { name: string; email: string; password: string };
let pendingSignup: PendingSignup | null = null;

export const signupDraft = {
  set: (draft: PendingSignup) => {
    pendingSignup = draft;
  },
  get: () => pendingSignup,
  clear: () => {
    pendingSignup = null;
  },
};

/** Where a signed-in student who hasn't finished onboarding should resume. */
export function nextOnboardingStep(user: User) {
  if (!user.termsAccepted) return '/terms' as const;
  if (!user.emailVerified) return '/verify-email' as const;
  return '/referral' as const;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export type StrengthLevel = 'tooShort' | 'weak' | 'okay' | 'strong' | 'excellent';

/** `level` is an id; screens show it with t(`shared.strength.${level}`) from the auth namespace. */
export function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; level: StrengthLevel } {
  if (pw.length < 8) return { score: 0, level: 'tooShort' };
  let score = 1;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  const levels: StrengthLevel[] = ['tooShort', 'weak', 'okay', 'strong', 'excellent'];
  return { score: score as 0 | 1 | 2 | 3 | 4, level: levels[score] };
}
