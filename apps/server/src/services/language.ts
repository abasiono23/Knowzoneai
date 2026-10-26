import type { Request } from 'express';

import { settingsOf } from './account.js';
import { LANGUAGES, type LanguageId } from './personalization.js';

const isLanguage = (x: unknown): x is LanguageId => typeof x === 'string' && x in LANGUAGES;

/**
 * The language to answer in: ?lang=, then the X-Language header the app sends, then the signed-in
 * person's app language, then English.
 */
export function requestLanguage(req: Request): LanguageId {
  const q = req.query.lang;
  if (isLanguage(q)) return q;
  const header = req.get('x-language');
  if (isLanguage(header)) return header;
  if (req.user) {
    const lang = settingsOf(req.user).appLanguage;
    if (isLanguage(lang)) return lang;
  }
  return 'en';
}
