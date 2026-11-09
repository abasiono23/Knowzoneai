import type { LanguageId } from './languages';
import en from './locales/en';
import type { Translation } from './types';

/**
 * Translations for the web version. All ten languages together are over half of the app's download,
 * so only English (the fallback for any missing word) comes with the app; each other language is its
 * own file, fetched when someone uses it. The phone app builds them all in (bundles.ts).
 */
export type Bundle = Translation<typeof en>;

export const initialResources: Partial<Record<LanguageId, Bundle>> = { en };

const LOADERS: Record<Exclude<LanguageId, 'en'>, () => Promise<{ default: Bundle }>> = {
  pcm: () => import('./locales/pcm'),
  yo: () => import('./locales/yo'),
  ig: () => import('./locales/ig'),
  ha: () => import('./locales/ha'),
  fr: () => import('./locales/fr'),
  ar: () => import('./locales/ar'),
  sw: () => import('./locales/sw'),
  pt: () => import('./locales/pt'),
  es: () => import('./locales/es'),
};

export async function loadLanguage(lang: LanguageId): Promise<Bundle> {
  if (lang === 'en') return en;
  return (await LOADERS[lang]()).default;
}
