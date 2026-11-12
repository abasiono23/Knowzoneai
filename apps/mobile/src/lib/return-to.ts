import { Platform } from 'react-native';

/**
 * Where a signed-out visitor was trying to go (web version). Someone who opens a link to a paper, a topic
 * or the textbook tool from the public study pages is sent to the welcome screen first; once they have
 * signed in, or signed up and finished setting up, the start screen sends them on to that page instead
 * of Home. Kept for the browser tab only, and only for visitors who arrived signed out.
 */
const KEY = 'knowzone.returnTo';

/** The sign-in and set-up screens themselves, and the start: nothing to come back to there. */
const NOT_A_DESTINATION =
  /^\/(welcome|login|sign-up|get-started|onboarding|personalize|terms|referral|referral-invalid|verify-email|verified|reset-password|forgot-password|all-set|social|account-status|legal)?(\/|\?|$)/;

/** A path inside this app ("/exams/paper/x"), never another site ("//evil.com", "https://…"). */
const ownPath = (p: string | null | undefined): p is string => !!p && p.startsWith('/') && !p.startsWith('//') && !p.includes('\\');

function capture() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  try {
    // Signed-in visitors are already where they meant to be.
    if (Object.keys(localStorage).some((k) => /^sb-.*-auth-token$/.test(k) && localStorage.getItem(k))) return;
    const { pathname, search } = window.location;
    // A sign-up link can name the page to come back to: /sign-up?next=/exams/paper/x
    const next = new URLSearchParams(search).get('next');
    const target = ownPath(next) ? next : `${pathname}${search}`;
    if (ownPath(target) && !NOT_A_DESTINATION.test(target)) sessionStorage.setItem(KEY, target);
  } catch {
    // Storage blocked (private mode): the visitor simply lands on Home.
  }
}
capture();

/** The page to open after signing in, or null. Read while drawing; forget it once used (`forgetReturnTo`). */
export function returnTo(): string | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  try {
    const target = sessionStorage.getItem(KEY);
    return ownPath(target) && !NOT_A_DESTINATION.test(target) ? target : null;
  } catch {
    return null;
  }
}

export function forgetReturnTo() {
  try {
    if (typeof window !== 'undefined') sessionStorage.removeItem(KEY);
  } catch {
    // Nothing was kept.
  }
}
