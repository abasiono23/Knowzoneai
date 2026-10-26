import {
  Cairo_500Medium,
  Cairo_600SemiBold,
  Cairo_700Bold,
  Cairo_800ExtraBold,
} from '@expo-google-fonts/cairo';
import * as Font from 'expo-font';
import { getLocales } from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager, Platform } from 'react-native';

import { storage } from '@/lib/storage';

import { INTL_LOCALE, isLanguage, isRtl, type LanguageId } from './languages';
import { resources } from './resources';

export { LANGUAGES, isLanguage, type LanguageId } from './languages';

const KEY = 'knowzone.language';

/** The phone's language if Knowzone speaks it, otherwise English. */
function deviceLanguage(): LanguageId {
  for (const l of getLocales()) {
    const code = l.languageCode?.toLowerCase();
    if (isLanguage(code)) return code;
  }
  return 'en';
}

/** The app's single i18next instance (everything imports this, never i18next directly). */
const i18n = i18next;

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage(),
  fallbackLng: 'en',
  defaultNS: 'common',
  // Strings are plain text in React Native, so nothing needs HTML escaping.
  interpolation: { escapeValue: false },
  returnNull: false,
});

/** Applies text direction. Web flips immediately; native layouts flip on the next app start. */
function applyDirection(lang: LanguageId) {
  const rtl = isRtl(lang);
  if (Platform.OS === 'web') {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
    return false;
  }
  I18nManager.allowRTL(rtl);
  if (I18nManager.isRTL === rtl) return false;
  I18nManager.forceRTL(rtl);
  return true;
}

/** App font → Arabic font of the same weight (Manrope has no Arabic letters). */
export const ARABIC_FONT: Record<string, string> = {
  Manrope_500Medium: 'Cairo_500Medium',
  Manrope_600SemiBold: 'Cairo_600SemiBold',
  Manrope_700Bold: 'Cairo_700Bold',
  Manrope_800ExtraBold: 'Cairo_800ExtraBold',
};

/** Loads the Arabic font only when someone picks Arabic, so other languages don't download it. */
async function ensureFonts(lang: LanguageId) {
  if (lang !== 'ar') return;
  await Font.loadAsync({ Cairo_500Medium, Cairo_600SemiBold, Cairo_700Bold, Cairo_800ExtraBold }).catch(() => {});
}

/**
 * Switches the whole app to a language and remembers it on this device. Returns true when the
 * layout direction changed on iOS/Android, where the app must restart to mirror it.
 */
export async function setLanguage(lang: LanguageId) {
  await ensureFonts(lang);
  await i18n.changeLanguage(lang);
  await storage.set(KEY, lang);
  return applyDirection(lang);
}

/** Restores the language chosen on this device (before anyone signs in). */
export async function restoreLanguage() {
  const saved = await storage.get(KEY);
  const lang = isLanguage(saved) ? saved : deviceLanguage();
  await ensureFonts(lang);
  if (lang !== i18n.language) await i18n.changeLanguage(lang);
  applyDirection(lang);
  return lang;
}

/** The language someone explicitly picked on this device, if any (not the phone's default). */
export async function chosenLanguage(): Promise<LanguageId | null> {
  const saved = await storage.get(KEY);
  return isLanguage(saved) ? saved : null;
}

export const currentLanguage = (): LanguageId => (isLanguage(i18n.language) ? i18n.language : 'en');

/** Formats dates for the current language (replaces toLocaleDateString(undefined, …)). */
export const formatDate = (t: number | Date, options: Intl.DateTimeFormatOptions) =>
  new Date(t).toLocaleDateString(INTL_LOCALE[currentLanguage()], options);

export const formatTime = (t: number | Date, options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }) =>
  new Date(t).toLocaleTimeString(INTL_LOCALE[currentLanguage()], options);

export const formatNumber = (n: number, options?: Intl.NumberFormatOptions) =>
  n.toLocaleString(INTL_LOCALE[currentLanguage()], options);

export default i18n;
