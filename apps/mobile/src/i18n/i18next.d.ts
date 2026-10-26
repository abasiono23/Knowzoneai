import 'i18next';

import type en from './locales/en';

/** Type-checked keys: t('auth:login.title') fails to compile if the key doesn't exist in English. */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: typeof en;
    returnNull: false;
  }
}
