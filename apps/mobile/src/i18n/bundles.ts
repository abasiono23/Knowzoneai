import type { LanguageId } from './languages';
import { resources } from './resources';
import type en from './locales/en';
import type { Translation } from './types';

/**
 * Translations for the phone app: every language is built in, so switching works offline.
 * The web version (bundles.web.ts) downloads only the language it needs.
 */
export type Bundle = Translation<typeof en>;

export const initialResources: Partial<Record<LanguageId, Bundle>> = resources;

export const loadLanguage = async (lang: LanguageId): Promise<Bundle> => resources[lang];
