/**
 * Copies the catalogue translations from the server (the source of truth, also used to seed the
 * database) into the app, which bundles them as the offline copy. Run after editing them:
 *
 *   npm run i18n:catalog          # copy
 *   npm run i18n:catalog -- --check  # fail if the app's copy is out of date (for CI)
 */
import { copyFileSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const from = resolve(import.meta.dirname, '../../server/prisma/seed/catalog-i18n');
const to = resolve(import.meta.dirname, '../src/i18n/catalog');
const check = process.argv.includes('--check');

mkdirSync(to, { recursive: true });
const files = readdirSync(from).filter((f) => f.endsWith('.json') && f !== 'en.json');
let stale = 0;
for (const f of files) {
  const src = readFileSync(resolve(from, f), 'utf8');
  let dst = '';
  try {
    dst = readFileSync(resolve(to, f), 'utf8');
  } catch {
    // Not copied yet.
  }
  if (src === dst) continue;
  stale++;
  if (check) console.error(`Out of date: src/i18n/catalog/${f}`);
  else copyFileSync(resolve(from, f), resolve(to, f));
}
if (check && stale) process.exit(1);
console.log(check ? 'Catalogue translations are up to date.' : `Copied ${stale} of ${files.length} file(s).`);
