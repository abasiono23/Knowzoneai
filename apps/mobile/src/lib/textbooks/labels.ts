import type { TFunction } from 'i18next';

import type tutor from '@/i18n/locales/en/tutor';

import type { Textbook } from './types';

type TutorT = TFunction<'tutor'>;
type ErrorKey = keyof (typeof tutor)['textbook']['errors'];

const ERROR_KEYS: Record<string, ErrorKey> = {
  'scanned-book': 'scannedBook',
  'unreadable-file': 'unreadableFile',
  'unsupported-file': 'unsupportedFile',
  'file-too-large': 'fileTooLarge',
  'ai-failed': 'aiFailed',
  'not-configured': 'notConfigured',
  'upload-failed': 'uploadFailed',
  'no-credits': 'noCredits',
};

/** Why a book couldn't be read, in the current language. */
export function textbookError(error: Textbook['error'], t: TutorT) {
  const key: ErrorKey = (error?.code && ERROR_KEYS[error.code]) || 'unknown';
  return { title: t(`textbook.errors.${key}.title`), body: t(`textbook.errors.${key}.body`) };
}

/** "Pages 45–52", or "Page 45" for a single page. */
export const pageRange = (start: number, end: number, t: TutorT) =>
  start === end ? t('textbook.pageOne', { page: start }) : t('textbook.pageRange', { start, end });
