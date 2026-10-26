/** Languages Knowzone speaks. Choosing one switches the whole app and the AI's explanations. */
export const LANGUAGE_IDS = ['en', 'pcm', 'yo', 'ig', 'ha', 'fr', 'ar', 'sw', 'pt', 'es'] as const;
export type LanguageId = (typeof LANGUAGE_IDS)[number];

export const LANGUAGES: { id: LanguageId; native: string; english: string; rtl?: boolean; beta?: boolean }[] = [
  { id: 'en', native: 'English', english: 'English' },
  { id: 'pcm', native: 'Naijá', english: 'Nigerian Pidgin', beta: true },
  { id: 'yo', native: 'Yorùbá', english: 'Yoruba', beta: true },
  { id: 'ig', native: 'Igbo', english: 'Igbo', beta: true },
  { id: 'ha', native: 'Hausa', english: 'Hausa', beta: true },
  { id: 'fr', native: 'Français', english: 'French' },
  { id: 'ar', native: 'العربية', english: 'Arabic', rtl: true, beta: true },
  { id: 'sw', native: 'Kiswahili', english: 'Swahili', beta: true },
  { id: 'pt', native: 'Português', english: 'Portuguese' },
  { id: 'es', native: 'Español', english: 'Spanish' },
];

export const isLanguage = (x: unknown): x is LanguageId => LANGUAGE_IDS.includes(x as LanguageId);
export const isRtl = (lang: LanguageId) => !!LANGUAGES.find((l) => l.id === lang)?.rtl;

/** Locale used for dates and numbers. Nigerian languages use Nigerian conventions. */
export const INTL_LOCALE: Record<LanguageId, string> = {
  en: 'en-GB',
  pcm: 'en-NG',
  yo: 'yo-NG',
  ig: 'ig-NG',
  ha: 'ha-NG',
  fr: 'fr-FR',
  ar: 'ar',
  sw: 'sw-KE',
  pt: 'pt-PT',
  es: 'es-ES',
};
