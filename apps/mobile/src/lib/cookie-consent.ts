import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

/**
 * The visitor's cookie choice on the web version. It lives in the first-party cookie `kz_consent`
 * ("analytics=1&v=1" or "analytics=0&v=1", kept for 12 months), shared by www and app.knowzoneai.com, so a
 * choice made on the site's pages (apps/webapp/site.js) carries into the app and back. Visit counts
 * (Vercel Web Analytics) load only once `analytics` is accepted: the loader that scripts/web-site.mjs
 * puts in every page waits for the `kz-consent` event sent here. The phone apps have no cookie notice.
 */
export type CookieChoice = { analytics: boolean };

const NAME = 'kz_consent';
const YEAR_SECONDS = 365 * 24 * 60 * 60;
const onWeb = Platform.OS === 'web' && typeof document !== 'undefined';

function read(): CookieChoice | null {
  if (!onWeb) return null;
  try {
    const m = document.cookie.match(/(?:^|; )kz_consent=([^;]*)/);
    return m ? { analytics: /(?:^|&)analytics=1(?:&|$)/.test(m[1] ?? '') } : null;
  } catch {
    return null;
  }
}

type State = {
  /** null until the visitor has chosen. */
  choice: CookieChoice | null;
  /** Opened again from Settings → Privacy. */
  open: boolean;
};

let state: State = { choice: read(), open: false };
const listeners = new Set<() => void>();
function set(next: State) {
  state = next;
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const snapshot = () => state;

/** The choice and whether the notice is open; redraws when either changes. */
export function useCookieConsent() {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** Shows the notice again with its settings open (Settings → Privacy → Cookie settings). */
export function openCookieSettings() {
  set({ ...state, open: true });
}

export function closeCookieSettings() {
  set({ ...state, open: false });
}

/** Saves the choice for 12 months and starts, or stops, the visit counts. */
export function saveCookieChoice(choice: CookieChoice) {
  if (!onWeb) return;
  const host = window.location.hostname;
  const shared = host === 'knowzoneai.com' || host.endsWith('.knowzoneai.com') ? '; Domain=.knowzoneai.com' : '';
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  try {
    document.cookie = `${NAME}=analytics=${choice.analytics ? 1 : 0}&v=1; Max-Age=${YEAR_SECONDS}; Path=/; SameSite=Lax${shared}${secure}`;
  } catch {
    // Cookies are blocked: the choice lasts until the page is closed.
  }
  set({ choice, open: false });
  if (choice.analytics) window.dispatchEvent(new CustomEvent('kz-consent', { detail: { analytics: true } }));
  // Counting that had already started in this visit stops with a fresh page.
  else if ((window as { __kzAnalytics?: unknown }).__kzAnalytics) window.location.reload();
}
