import { exportJWK, generateKeyPair } from 'jose';
import { beforeAll, beforeEach } from 'vitest';

import { prisma } from '../src/db.js';
import { outbox } from '../src/services/mailer.js';
import { useTestKeys } from '../src/services/supabase.js';
import { testKeys } from './keys.js';

/** A local ES256 key stands in for the Supabase project's signing key. */
beforeAll(async () => {
  const { publicKey, privateKey } = await generateKeyPair('ES256');
  testKeys.privateKey = privateKey;
  useTestKeys({ keys: [{ ...(await exportJWK(publicKey)), kid: testKeys.kid, alg: 'ES256' }] });
});

/** Reference data loaded once by global-setup (the seeded catalogue); everything else is per test. */
const KEEP = ['_prisma_migrations', 'Category', 'Subject', 'Lesson', 'Course', 'CourseModule', 'CourseLesson'];

/** Every test starts with no people or activity and an empty outbox. */
beforeEach(async () => {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> ALL(${KEEP})`;
  if (tables.length)
    await prisma.$executeRawUnsafe(`TRUNCATE ${tables.map((t) => `"${t.tablename}"`).join(', ')} CASCADE`);
  outbox.length = 0;
});
