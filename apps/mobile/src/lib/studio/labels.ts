import type { TFunction } from 'i18next';

import { formatNumber } from '@/i18n';
import { notebookLabel, subjectLabel } from '@/lib/tutor/format';

import type { Depth, Difficulty, Material, Output, QuizSettings, SourceType, StageId } from './types';

// Display labels for ids kept in lib/studio. The ids (and the English depth/difficulty values sent to
// the generator) stay unchanged; these translate them at render time with the `study` namespace's t.
type StudyT = TFunction<'study'>;

export const stageLabel = (id: StageId, t: StudyT) => t(`labels.stages.${id}`);
export const outputLabel = (id: Output, t: StudyT) => t(`labels.outputs.${id}`);
export const depthLabel = (d: Depth, t: StudyT) => t(`labels.depth.${d.toLowerCase() as Lowercase<Depth>}`);
export const difficultyLabel = (d: Difficulty, t: StudyT) =>
  t(`labels.difficulty.${d.toLowerCase() as Lowercase<Difficulty>}`);
export const sourceLabel = (s: SourceType, t: StudyT) => t(`labels.sources.${s}`);
export const fromSourceLabel = (s: SourceType, t: StudyT) => t(`labels.fromSource.${s}`);
export const quizTypeLabel = (type: 'mcq' | 'tf', t: StudyT) => t(`labels.quizTypes.${type}`);
export const quizDifficultyLabel = (d: QuizSettings['difficulty'], t: StudyT) => t(`labels.quizDifficulty.${d}`);
export const percentLabel = (fraction: number, t: StudyT) =>
  t('labels.percent', { value: formatNumber(Math.round(fraction * 100)) });

/** "1.4 MB" / "320 KB" in the current language. */
export const fileSize = (bytes = 0, t: StudyT) =>
  bytes > 1_000_000
    ? t('labels.sizeMb', {
        size: formatNumber(bytes / 1_048_576, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
      })
    : t('labels.sizeKb', { size: formatNumber(Math.max(1, Math.round(bytes / 1024))) });

/** The stored source label, with the built-in "Pasted text" placeholder translated. */
export const sourceText = (m: Material, t: StudyT) =>
  m.source.type === 'text' && m.source.label === 'Pasted text' ? t('shared.pastedText') : m.source.label;

const ERROR_KEYS = {
  'not-enough-text': 'notEnoughText',
  'unreadable-file': 'unreadableFile',
  'unsupported-file': 'unsupportedFile',
  'no-captions': 'noCaptions',
  'video-unavailable': 'videoUnavailable',
  'video-too-long': 'videoTooLong',
  'not-youtube': 'videoUnavailable',
  'ai-failed': 'aiFailed',
  'not-configured': 'notConfigured',
  'upload-failed': 'uploadFailed',
  'no-credits': 'noCredits',
} as const;

/** Why a pack failed, in the current language (the server sends a code; the demo sends text). */
export function materialError(error: Material['error'], t: StudyT) {
  const key = error?.code ? (ERROR_KEYS[error.code as keyof typeof ERROR_KEYS] ?? 'aiFailed') : null;
  if (!key) return { title: error?.title, message: error?.message };
  return { title: t(`errors.codes.${key}.title`), message: t(`errors.codes.${key}.body`) };
}

/** Display name for a stored subject (stays English in storage). */
export const materialSubject = (subject: string) => subjectLabel(subject);

/** Display name for a stored folder: a subject name, "Exam revision" or the learner's own name. */
export const folderLabel = (folder: string) => notebookLabel(folder);
