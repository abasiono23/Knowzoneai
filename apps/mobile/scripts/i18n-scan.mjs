/**
 * Finds user-visible English that isn't going through t(): JSX text and common text props
 * (title, placeholder, label, accessibilityLabel…) holding literal strings.
 *   node scripts/i18n-scan.mjs [dir…]
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dirs = process.argv.slice(2).length ? process.argv.slice(2) : ['src/app', 'src/components'];
const PROPS = /\b(title|subtitle|placeholder|label|accessibilityLabel|accessibilityHint|eyebrow|body|hint|footer|badge|cancelLabel|confirmLabel|description|value)=["']([^"']*[A-Za-z]{3,}[^"']*)["']/g;
const JSX_TEXT = />\s*([A-Z][A-Za-z’'?!,.\- ]{3,})\s*</g;

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* files(p);
    else if (/\.tsx$/.test(name)) yield p;
  }
}

let count = 0;
for (const d of dirs)
  for (const f of files(resolve(root, d))) {
    const lines = readFileSync(f, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
      for (const m of [...line.matchAll(PROPS), ...line.matchAll(JSX_TEXT)]) {
        const text = m[2] ?? m[1];
        // Names and codes that stay in English everywhere.
        if (/^(Knowzone( AI| World| Plus| Pro)?|Google|Apple|WhatsApp|Paystack|AI|XP|OK)$/.test(text.trim())) continue;
        count++;
        console.log(`${relative(root, f)}:${i + 1}: ${text.trim()}`);
      }
    });
  }
console.log(`\n${count} possible untranslated strings`);
