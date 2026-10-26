import { randomUUID } from 'node:crypto';

import { SignJWT } from 'jose';
import request from 'supertest';

import { createApp } from '../src/app.js';
import type { SupabaseClaims } from '../src/services/supabase.js';
import { testKeys } from './keys.js';

export const app = createApp();
export const http = () => request(app);

const ISSUER = 'https://test-project.supabase.co/auth/v1';

type TokenOptions = {
  sub?: string;
  email?: string;
  sessionId?: string;
  provider?: 'email' | 'google' | 'apple';
  providers?: string[];
  metadata?: SupabaseClaims['user_metadata'];
  issuer?: string;
  audience?: string;
  expiresIn?: string;
};

/** Signs an access token shaped like the ones Supabase Auth issues. */
export async function supabaseToken(o: TokenOptions = {}) {
  const provider = o.provider ?? 'email';
  return new SignJWT({
    email: o.email ?? 'amara@example.com',
    session_id: o.sessionId ?? randomUUID(),
    role: 'authenticated',
    app_metadata: { provider, providers: o.providers ?? [provider] },
    user_metadata: o.metadata ?? {},
  })
    .setProtectedHeader({ alg: 'ES256', kid: testKeys.kid })
    .setSubject(o.sub ?? randomUUID())
    .setIssuer(o.issuer ?? ISSUER)
    .setAudience(o.audience ?? 'authenticated')
    .setIssuedAt()
    .setExpirationTime(o.expiresIn ?? '1h')
    .sign(testKeys.privateKey!);
}

export const CONSENT = { terms: true, privacy: true, age: true, marketing: false };

/** A signed-in person: their Supabase user id, a token for one device session, and request helpers. */
export async function signIn(o: TokenOptions = {}) {
  const sub = o.sub ?? randomUUID();
  const token = await supabaseToken({ metadata: { name: 'Amara Okeke', consent: CONSENT }, ...o, sub });
  const as = authed(token);
  const { body } = await as.get('/me').expect(200);
  return { sub, token, as, user: body.user };
}

export function authed(token: string) {
  const set = (r: request.Test) => r.set('Authorization', `Bearer ${token}`);
  return {
    get: (path: string) => set(http().get(path)),
    post: (path: string, body?: object) => set(http().post(path)).send(body ?? {}),
    put: (path: string, body?: object) => set(http().put(path)).send(body ?? {}),
    patch: (path: string, body?: object) => set(http().patch(path)).send(body ?? {}),
    delete: (path: string) => set(http().delete(path)),
  };
}
