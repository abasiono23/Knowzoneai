import type { CryptoKey } from 'jose';

/** The test signing key, filled in by setup.ts. */
export const testKeys: { kid: string; privateKey?: CryptoKey } = { kid: 'test-key-1' };
