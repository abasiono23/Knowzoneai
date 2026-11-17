export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

/**
 * The web app's address. The phone app reads the files the web app serves from here (the Lessons with
 * Kora in public/kora-lessons); the web app itself uses its own address.
 */
export const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL ?? 'https://app.knowzoneai.com').replace(/\/$/, '');

/** Supabase project (Auth). The publishable key is designed to ship inside apps. */
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

/** Frontend-first mode: every auth/onboarding call is served by lib/mock-api.ts. */
export const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';

/** Verification code accepted by the mock API. Shown on screen in mock mode only. */
export const MOCK_CODE = '123456';

export const LEGAL_URLS = {
  terms: 'https://knowzoneai.com/terms',
  privacy: 'https://knowzoneai.com/privacy',
};

export const WELCOME_CREDITS = 5;
export const REFERRAL_CREDITS = 5;
