/**
 * Checks every language against English: missing keys, extra keys, and {{placeholders}} or <tags>
 * that differ. Run with `npm run i18n:check`; exits with code 1 if anything is missing or broken.
 *
 *   npm run i18n:check            # summary per language
 *   npm run i18n:check -- --list  # also list each missing key
 */
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const LOCALES = resolve(import.meta.dirname, '../src/i18n/locales');
const PLURAL = /_(zero|one|two|few|many|other)$/;
const list = process.argv.includes('--list');

type Tree = { [k: string]: string | readonly string[] | Tree };

function flatten(t: Tree, prefix = '', out = new Map<string, string>()) {
  for (const [k, v] of Object.entries(t)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out.set(key, v);
    else if (Array.isArray(v)) v.forEach((s, i) => out.set(`${key}.${i}`, String(s)));
    else flatten(v as Tree, key, out);
  }
  return out;
}

const tokens = (s: string) => [...s.matchAll(/\{\{\s*(\w+)\s*\}\}|<\/?(\w+)\s*\/?>/g)].map((m) => m[0].replace(/\s/g, '')).sort().join(' ');

async function load(lang: string, ns: string): Promise<Tree | null> {
  try {
    return (await import(pathToFileURL(resolve(LOCALES, lang, `${ns}.ts`)).href)).default as Tree;
  } catch {
    return null;
  }
}

const namespaces = readdirSync(resolve(LOCALES, 'en'))
  .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
  .map((f) => f.replace(/\.ts$/, ''));
const languages = readdirSync(LOCALES).filter((d) => d !== 'en');

let failed = false;
for (const lang of languages) {
  let missing = 0;
  let mismatched = 0;
  let total = 0;
  const lines: string[] = [];
  for (const ns of namespaces) {
    const en = flatten((await load('en', ns)) ?? {});
    const tr = await load(lang, ns);
    const translated = flatten(tr ?? {});
    for (const [key, value] of en) {
      total++;
      // A language may express a plural with different forms; any form of the same base counts.
      const base = key.replace(PLURAL, '');
      const have =
        translated.get(key) ??
        (PLURAL.test(key) ? [...translated.keys()].find((k) => k.replace(PLURAL, '') === base) : undefined);
      if (have === undefined) {
        missing++;
        if (list) lines.push(`  missing ${ns}:${key}`);
        continue;
      }
      const t = translated.get(key);
      // Plural forms may leave the number out ("one day" instead of "1 day").
      const strip = (s: string) => (PLURAL.test(key) ? s.replace(/\{\{\s*count\s*\}\}/g, '') : s);
      if (t !== undefined && tokens(strip(t)) !== tokens(strip(value))) {
        mismatched++;
        lines.push(`  placeholders differ ${ns}:${key}\n    en: ${value}\n    ${lang}: ${t}`);
      }
    }
  }
  const done = total - missing;
  console.log(`${lang}: ${done}/${total} keys (${Math.round((done / total) * 100)}%), ${mismatched} placeholder mismatches`);
  if (lines.length) console.log(lines.join('\n'));
  if (missing || mismatched) failed = true;
}
process.exit(failed ? 1 : 0);
