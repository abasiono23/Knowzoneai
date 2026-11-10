/** The app's language as a speech-recognition locale. Nigerian Pidgin is heard as Nigerian English. */
const LOCALES: Record<string, string> = {
  en: 'en-NG',
  pcm: 'en-NG',
  yo: 'yo-NG',
  ig: 'ig-NG',
  ha: 'ha-NG',
  fr: 'fr-FR',
  ar: 'ar-SA',
  sw: 'sw-KE',
  pt: 'pt-PT',
  es: 'es-ES',
};
export const speechLocale = (language: string) => LOCALES[language.split('-')[0]!] ?? 'en-NG';
