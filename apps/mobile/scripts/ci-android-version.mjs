/**
 * Codemagic: gives each Android build a version Google Play will accept, before `expo prebuild`.
 *
 * - versionCode (the number Play compares; every upload must be higher than the last) comes from
 *   Codemagic's build number plus an offset, so it always rises and never repeats version 1, which
 *   the first internal-testing upload used.
 * - versionName (what people see in the store) comes from the release tag, e.g. tag v1.2.0 → "1.2.0".
 *   Without a tag it stays as app.json has it.
 *
 * The change is made in the CI copy of app.json only; nothing is committed.
 *
 *   node scripts/ci-android-version.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Added to Codemagic's build number, so release codes stay clear of any build uploaded by hand. */
const OFFSET = 1000;

const file = resolve(import.meta.dirname, '../app.json');
const app = JSON.parse(readFileSync(file, 'utf8'));

const build = Number(process.env.BUILD_NUMBER);
if (!Number.isInteger(build) || build < 1) {
  console.log('No BUILD_NUMBER (not on Codemagic): the version is left as it is.');
  process.exit(0);
}
const versionCode = OFFSET + build;

const tag = process.env.CM_TAG?.trim();
const fromTag = tag && /^v?(\d+\.\d+\.\d+)$/.exec(tag)?.[1];
if (tag && !fromTag) throw new Error(`Release tags look like v1.2.0; "${tag}" doesn't.`);

app.expo.android = { ...app.expo.android, versionCode };
if (fromTag) app.expo.version = fromTag;
writeFileSync(file, `${JSON.stringify(app, null, 2)}\n`);
console.log(`Android version ${app.expo.version} (code ${versionCode}).`);
