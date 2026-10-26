import type { LanguageId } from '../languages';

type Text = Record<string, string | string[]>;

/** Translated lesson content by id; the same files seed the server (npm run i18n:catalog copies them). */
export type CatalogTranslation = {
  categories: Record<string, Text>;
  subjects: Record<string, Text>;
  lessons: Record<string, Text>;
};

/** Loaded only when that language is used. */
const FILES: Record<Exclude<LanguageId, 'en'>, () => CatalogTranslation> = {
  pcm: () => require('./pcm.json'),
  yo: () => require('./yo.json'),
  ig: () => require('./ig.json'),
  ha: () => require('./ha.json'),
  fr: () => require('./fr.json'),
  ar: () => require('./ar.json'),
  sw: () => require('./sw.json'),
  pt: () => require('./pt.json'),
  es: () => require('./es.json'),
};

export const bundledTranslation = (lang: LanguageId): CatalogTranslation | null =>
  lang === 'en' ? null : FILES[lang]();
