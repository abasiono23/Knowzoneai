import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, USE_MOCKS } from './config';

/**
 * Supabase Auth client. Sign-up, passwords, email codes and Google / Apple sign-in go through it;
 * the Knowzone API trusts the access tokens it issues. Not used in mock mode.
 */
export const supabase = createClient(SUPABASE_URL || 'https://placeholder.supabase.co', SUPABASE_PUBLISHABLE_KEY || 'placeholder', {
  auth: {
    // Sessions are larger than SecureStore's limit, so native uses AsyncStorage; web uses localStorage.
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: !USE_MOCKS,
    persistSession: !USE_MOCKS,
    // On web, Google / Apple return to /social with a code that the client exchanges itself.
    detectSessionInUrl: Platform.OS === 'web',
    flowType: 'pkce',
  },
});

// Only refresh tokens while the app is open (Supabase's recommendation for React Native).
if (Platform.OS !== 'web' && !USE_MOCKS) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

/** The current access token for API calls, refreshed if it's about to expire. */
export async function accessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
