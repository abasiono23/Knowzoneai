import { execSync } from 'node:child_process';

/** Brings the test database schema up to date and loads the catalogue before any test runs. */
export default function setup() {
  const url = process.env.TEST_DATABASE_URL ?? 'postgresql://knowzone:knowzone@localhost:5433/knowzone_testing';
  const env = { ...process.env, DATABASE_URL: url };
  execSync('npx prisma migrate deploy', { stdio: 'pipe', env });
  execSync('npx tsx prisma/seed/index.ts', { stdio: 'pipe', env });
}
