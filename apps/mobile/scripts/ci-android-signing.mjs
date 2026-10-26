/**
 * Codemagic: after `expo prebuild`, makes the release build sign with the keystore uploaded to
 * Codemagic (it sets CM_KEYSTORE_PATH, CM_KEYSTORE_PASSWORD, CM_KEY_ALIAS and CM_KEY_PASSWORD).
 * Without a keystore the release APK keeps Expo's debug signature, which is fine for testing on a
 * phone but not for the Play Store.
 *
 *   node scripts/ci-android-signing.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const file = resolve(import.meta.dirname, '../android/app/build.gradle');
let gradle = readFileSync(file, 'utf8');

if (!process.env.CM_KEYSTORE_PATH) {
  console.log('No Codemagic keystore: the release APK is signed with the debug key (testing only).');
  process.exit(0);
}
if (gradle.includes('CM_KEYSTORE_PATH')) {
  console.log('Release signing is already set up.');
  process.exit(0);
}

const release = `
        release {
            storeFile file(System.getenv("CM_KEYSTORE_PATH"))
            storePassword System.getenv("CM_KEYSTORE_PASSWORD")
            keyAlias System.getenv("CM_KEY_ALIAS")
            keyPassword System.getenv("CM_KEY_PASSWORD")
        }`;
gradle = gradle.replace(/signingConfigs\s*\{/, (m) => `${m}${release}`);

// In buildTypes { release { … signingConfig signingConfigs.debug … } } use the release key instead.
const types = gradle.indexOf('buildTypes');
const rel = gradle.indexOf('release {', types);
const line = gradle.indexOf('signingConfig signingConfigs.debug', rel);
if (types < 0 || rel < 0 || line < 0) throw new Error('Could not find the release build type in android/app/build.gradle');
gradle = `${gradle.slice(0, line)}signingConfig signingConfigs.release${gradle.slice(line + 'signingConfig signingConfigs.debug'.length)}`;

writeFileSync(file, gradle);
console.log('Release builds now sign with the Codemagic keystore.');
