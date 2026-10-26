import { createLocalJWKSet, createRemoteJWKSet, jwtVerify, type JSONWebKeySet, type JWTVerifyGetKey } from 'jose';

import { config } from '../config.js';

const AUTH_URL = `${config.SUPABASE_URL.replace(/\/$/, '')}/auth/v1`;

/** What we read from a Supabase access token. */
export type SupabaseClaims = {
  /** auth.users.id */
  sub: string;
  email: string;
  session_id: string;
  app_metadata?: { provider?: string; providers?: string[] };
  user_metadata?: {
    name?: string;
    full_name?: string;
    email_verified?: boolean;
    /** Sent at sign-up so consent is recorded the moment the account exists. */
    consent?: { terms?: boolean; privacy?: boolean; age?: boolean; marketing?: boolean };
  };
};

let keys: JWTVerifyGetKey = createRemoteJWKSet(new URL(`${AUTH_URL}/.well-known/jwks.json`));

/** Tests sign their own tokens; this swaps in their public keys. Never used outside tests. */
export function useTestKeys(jwks: JSONWebKeySet) {
  if (config.NODE_ENV !== 'test') throw new Error('useTestKeys is for tests only');
  keys = createLocalJWKSet(jwks);
}

/**
 * Checks a Supabase access token: signature (the project's published ES256 keys), issuer,
 * audience and expiry. Returns null for anything that isn't a valid, signed-in user token.
 */
export async function verifyAccessToken(token: string): Promise<SupabaseClaims | null> {
  try {
    const { payload } = await jwtVerify(token, keys, { issuer: AUTH_URL, audience: 'authenticated' });
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string' || typeof payload.session_id !== 'string')
      return null;
    return payload as unknown as SupabaseClaims;
  } catch {
    return null;
  }
}

/** Removes the sign-in record from Supabase Auth (needs SUPABASE_SECRET_KEY). Returns false when not configured. */
export async function deleteAuthUser(userId: string) {
  if (!config.SUPABASE_SECRET_KEY) return false;
  const res = await fetch(`${AUTH_URL}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: { apikey: config.SUPABASE_SECRET_KEY, Authorization: `Bearer ${config.SUPABASE_SECRET_KEY}` },
  });
  if (!res.ok && res.status !== 404) throw new Error(`Supabase user delete failed: ${res.status}`);
  return true;
}
