import type { AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import i18n from '@/i18n';
import type common from '@/i18n/locales/en/common';

import { api, ApiError, type Consent, type User } from './api';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, USE_MOCKS } from './config';
import { supabase } from './supabase';

/**
 * Sign-up, sign-in, email codes and password reset. Real mode uses Supabase Auth (it sends the
 * emails and holds passwords); the Knowzone API then returns the app profile. Mock mode uses the
 * in-app mock API so the whole flow works offline.
 *
 * `token` is only set in mock mode; with Supabase the session lives in the Supabase client.
 */
export type SignedIn = { token: string; user: User };
export type Provider = 'google' | 'apple';

const PROVIDER_NAME: Record<Provider, string> = { google: 'Google', apple: 'Apple' };

type Reason = keyof (typeof common)['errors'];

/** Supabase Auth error codes and the shared `reason` each maps to (its text lives in common:errors). */
const REASONS: Record<string, Reason> = {
  invalid_credentials: 'bad-credentials',
  email_not_confirmed: 'email-not-confirmed',
  user_already_exists: 'email-taken',
  email_exists: 'email-taken',
  weak_password: 'weak-password',
  otp_expired: 'bad-code',
  over_email_send_rate_limit: 'rate-limited',
  over_request_rate_limit: 'rate-limited',
  email_address_invalid: 'bad-email',
  signup_disabled: 'signup-disabled',
  same_password: 'same-password',
};

/** An ApiError whose message is the translated text for a shared reason. */
const reasonError = (status: number, reason: Reason) => new ApiError(status, i18n.t(`common:errors.${reason}`), reason);

/**
 * Friendly messages for Supabase Auth errors; `reason` lets screens branch and lets errorText()
 * translate them. Messages are translated when the error happens, never at import time.
 */
function friendly(e: SupabaseAuthError | Error): ApiError {
  const code = (e as SupabaseAuthError).code ?? '';
  const status = (e as SupabaseAuthError).status ?? 400;
  if (code === 'over_email_send_rate_limit')
    return new ApiError(status, i18n.t('auth:errors.emailRateLimited'), 'rate-limited');
  const reason = REASONS[code];
  if (reason) return reasonError(status, reason);
  return new ApiError(status, e.message || i18n.t('common:errors.unknown'));
}

/** Recovery codes sign the person in; the session stays hidden from the app until the new password is set. */
let recovering = false;
export const isRecovering = () => recovering;

const nativeRedirect = (provider: Provider) => Linking.createURL('social', { queryParams: { provider } });

/** Opens the provider in a browser sheet and turns the returned code into a Supabase session. */
async function completeInBrowser(url: string, provider: Provider) {
  const result = await WebBrowser.openAuthSessionAsync(url, nativeRedirect(provider));
  if (result.type !== 'success') throw reasonError(0, 'cancelled');
  const params = new URL(result.url).searchParams;
  const failure = params.get('error_description');
  if (failure) throw new ApiError(400, failure, 'provider-error');
  const code = params.get('code');
  if (!code)
    throw new ApiError(
      400,
      i18n.t('auth:errors.providerUnfinished', { provider: PROVIDER_NAME[provider] }),
      'provider-error',
    );
  const exchanged = await supabase.auth.exchangeCodeForSession(code);
  if (exchanged.error) throw friendly(exchanged.error);
}

async function profile(): Promise<SignedIn> {
  const { user } = await api.me();
  return { token: '', user };
}

export const auth = {
  /** Mock mode signs in straight away; Supabase emails a 6-digit code first. */
  async signUp(input: { name: string; email: string; password: string; consent: Consent }) {
    if (USE_MOCKS) {
      const res = await api.register(input);
      return { kind: 'signed-in' as const, ...res };
    }
    await auth.cancelReset();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      // Read by the API when it creates the profile, so consent is recorded from the start.
      options: { data: { name: input.name, consent: input.consent } },
    });
    if (error) throw friendly(error);
    // With confirmations on, Supabase hides existing accounts by returning a user with no identities.
    if (data.user && data.user.identities?.length === 0) throw reasonError(409, 'email-taken');
    if (data.session) return { kind: 'signed-in' as const, ...(await profile()) };
    return { kind: 'verify' as const, email: input.email };
  },

  async verifySignUp(email: string, code: string): Promise<SignedIn> {
    if (USE_MOCKS) return { token: '', user: (await api.verifyEmail(code)).user };
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
    if (error) throw friendly(error);
    return profile();
  },

  async resendSignUp(email: string) {
    if (USE_MOCKS) return void (await api.resendVerification());
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw friendly(error);
  },

  async logIn(email: string, password: string): Promise<SignedIn> {
    if (USE_MOCKS) return api.login({ email, password });
    await auth.cancelReset();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw friendly(error);
    return profile();
  },

  async sendResetCode(email: string) {
    if (USE_MOCKS) return void (await api.forgotPassword(email));
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    // Rate limits are worth reporting; everything else stays quiet so we never reveal who has an account.
    if (error && (error.code ?? '').startsWith('over_')) throw friendly(error);
  },

  /** Returns a token for the new-password screen (mock), or a marker that Supabase holds a recovery session. */
  async verifyResetCode(email: string, code: string): Promise<string> {
    if (USE_MOCKS) return (await api.verifyResetCode(email, code)).resetToken;
    recovering = true;
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'recovery' });
    if (error) {
      recovering = false;
      throw friendly(error);
    }
    return 'supabase-recovery';
  },

  async resetPassword(resetToken: string, password: string) {
    if (USE_MOCKS) return void (await api.resetPassword(resetToken, password));
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw friendly(error);
    // Start fresh: they log in with the new password (and other devices keep their own sessions).
    await supabase.auth.signOut({ scope: 'local' });
    recovering = false;
  },

  /** Abandons a reset that was started but not finished. */
  async cancelReset() {
    if (!recovering) return;
    await supabase.auth.signOut({ scope: 'local' });
    recovering = false;
  },

  /**
   * Google / Apple through Supabase OAuth. On the web this leaves the page and comes back to
   * /social, where `finishRedirect` completes it.
   */
  async social(provider: Provider): Promise<SignedIn | 'redirecting'> {
    if (USE_MOCKS) return api.socialSignIn({ provider, idToken: `mock-${provider}-token` });
    const settings = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_PUBLISHABLE_KEY } })
      .then((r) => r.json() as Promise<{ external?: Record<string, boolean> }>)
      .catch(() => null);
    if (settings && !settings.external?.[provider])
      throw new ApiError(
        503,
        i18n.t('auth:errors.providerDisabled', { provider: PROVIDER_NAME[provider] }),
        'provider-disabled',
      );

    if (Platform.OS === 'web') {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/social?provider=${provider}` },
      });
      if (error) throw friendly(error);
      return 'redirecting';
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: nativeRedirect(provider), skipBrowserRedirect: true },
    });
    if (error || !data.url)
      throw friendly(error ?? new Error(i18n.t('auth:errors.providerStart', { provider: PROVIDER_NAME[provider] })));
    await completeInBrowser(data.url, provider);
    return profile();
  },

  /** Web: after Google / Apple sends the browser back, finish signing in (or report why it failed). */
  async finishRedirect(): Promise<SignedIn | null> {
    if (USE_MOCKS || Platform.OS !== 'web') return null;
    const params = new URLSearchParams(window.location.search);
    const failure = params.get('error_description');
    if (failure) throw new ApiError(400, failure, 'provider-error');
    // getSession waits for the client to exchange the ?code= it found in the URL.
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      if (params.get('code')) throw new ApiError(400, i18n.t('auth:errors.linkExpired'), 'provider-error');
      return null;
    }
    return profile();
  },

  async signOut() {
    if (USE_MOCKS) return;
    await supabase.auth.signOut({ scope: 'local' });
  },

  /** Confirms the signed-in person's password with Supabase (before sensitive changes). */
  async confirmPassword(password: string) {
    if (USE_MOCKS) return;
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email;
    if (!email) throw reasonError(401, 'signed-out');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw reasonError(401, 'bad-password');
  },

  /** Settings → Change password. Other devices are signed out, as before. */
  async changePassword(current: string, next: string) {
    if (USE_MOCKS) return void (await api.changePassword(current, next));
    const { data } = await supabase.auth.getUser();
    const hasPassword = data.user?.identities?.some((i) => i.provider === 'email');
    if (hasPassword) {
      try {
        await auth.confirmPassword(current);
      } catch {
        throw new ApiError(401, i18n.t('auth:errors.currentPassword'), 'bad-password');
      }
    }
    const { error } = await supabase.auth.updateUser({ password: next });
    if (error) throw friendly(error);
    await supabase.auth.signOut({ scope: 'others' });
  },

  /** Settings → Delete account: confirm the password (if there is one), then schedule deletion. */
  async deleteAccount(input: { password?: string; reason: string }) {
    if (USE_MOCKS) return api.deleteAccount(input);
    if (input.password !== undefined) await auth.confirmPassword(input.password);
    return api.deleteAccount({ reason: input.reason });
  },

  /** Settings → Connected accounts. Linking needs “Manual linking” switched on in Supabase. */
  async setConnection(provider: Provider, action: 'link' | 'unlink') {
    if (USE_MOCKS) return api.setConnection(provider, action);
    if (action === 'unlink') {
      const { data } = await supabase.auth.getUserIdentities();
      const identities = data?.identities ?? [];
      if (identities.length <= 1) throw reasonError(409, 'last-method');
      const identity = identities.find((i) => i.provider === provider);
      if (identity) {
        const { error } = await supabase.auth.unlinkIdentity(identity);
        if (error) throw friendly(error);
      }
    } else if (Platform.OS === 'web') {
      const { error } = await supabase.auth.linkIdentity({
        provider,
        options: { redirectTo: `${window.location.origin}/settings/connected` },
      });
      if (error) throw friendly(error);
    } else {
      const { data, error } = await supabase.auth.linkIdentity({
        provider,
        options: { redirectTo: nativeRedirect(provider), skipBrowserRedirect: true },
      });
      if (error || !data.url) throw friendly(error ?? new Error(i18n.t('auth:errors.linkStart')));
      await completeInBrowser(data.url, provider);
    }
    // New tokens carry the updated provider list the API reads.
    await supabase.auth.refreshSession();
    return api.getConnections();
  },
};
