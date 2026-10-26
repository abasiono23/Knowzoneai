import type { TFunction } from 'i18next';

import type videos from '@/i18n/locales/en/videos';

import { levelLabel, subjectByEnglishName, subjectName } from '../catalog';
import { GENERATION_STAGES, type CaptionStyle, type GeneratedVideo, type LengthId, type VideoSource } from './types';

type VoiceId = keyof (typeof videos)['options']['voices'];
type StyleId = keyof (typeof videos)['options']['styles'];

export const LENGTHS: {
  id: LengthId;
  scenes: number;
  credits: number;
}[] = [
  {
    id: '30s',
    scenes: 4,
    credits: 1,
  },
  {
    id: '1m',
    scenes: 7,
    credits: 1,
  },
  {
    id: '3m',
    scenes: 14,
    credits: 2,
  },
  {
    id: '5m',
    scenes: 22,
    credits: 3,
  },
];

/**
 * Narration voices. `language` and pitch/rate shape the device's text-to-speech; the server will use neural voices.
 * `sample` is spoken by the voice itself in its own accent, so it is not translated. Names: voiceLabel(id, t).
 */
export const VOICES: {
  id: VoiceId;
  language: string;
  pitch: number;
  rate: number;
  sample: string;
}[] = [
  {
    id: 'ada',
    language: 'en-NG',
    pitch: 1.05,
    rate: 0.95,
    sample: 'Hi! I’m Ada. Let’s make this topic easy together.',
  },
  {
    id: 'tunde',
    language: 'en-NG',
    pitch: 0.9,
    rate: 1.05,
    sample: 'Hey! Tunde here. Ready? Let’s go!',
  },
  {
    id: 'grace',
    language: 'en-GB',
    pitch: 1.1,
    rate: 0.9,
    sample: 'Hello, I’m Grace. We’ll take this one step at a time.',
  },
  {
    id: 'sam',
    language: 'en-US',
    pitch: 1,
    rate: 1,
    sample: 'Hi, I’m Sam. Let’s break it down.',
  },
  {
    id: 'kemi',
    language: 'en-NG',
    pitch: 1.05,
    rate: 0.95,
    sample: 'How far! Na Kemi. Make we learn am small small.',
  },
];

export type VisualStyle = {
  id: StyleId;
  colors: readonly [string, string];
  text: string;
  accent: string;
  texture: 'stars' | 'grid' | 'chalk' | 'paper' | 'none';
  headingFont: string;
};

export const STYLES: VisualStyle[] = [
  {
    id: 'galaxy',
    colors: ['#3B2DBF', '#0B1026'],
    text: '#FFFFFF',
    accent: '#FFC857',
    texture: 'stars',
    headingFont: 'Manrope_800ExtraBold',
  },
  {
    id: 'chalk',
    colors: ['#1F3A2E', '#14271F'],
    text: '#F2F5EF',
    accent: '#FFE27A',
    texture: 'chalk',
    headingFont: 'Manrope_700Bold',
  },
  {
    id: 'paper',
    colors: ['#FFFDF6', '#F3EEDC'],
    text: '#1C2340',
    accent: '#7C5CFF',
    texture: 'paper',
    headingFont: 'Manrope_800ExtraBold',
  },
  {
    id: 'blueprint',
    colors: ['#0F3B7A', '#0A2550'],
    text: '#E8F1FF',
    accent: '#4CC9FF',
    texture: 'grid',
    headingFont: 'Manrope_700Bold',
  },
  {
    id: 'sunset',
    colors: ['#FF5A7A', '#7C3AED'],
    text: '#FFFFFF',
    accent: '#FFE27A',
    texture: 'none',
    headingFont: 'Manrope_800ExtraBold',
  },
];

export const CAPTION_STYLES: { id: CaptionStyle }[] = [{ id: 'classic' }, { id: 'karaoke' }, { id: 'bold' }];

/** Video narration languages, each named in its own language (not translated). */
export const VIDEO_LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'pcm', label: 'Naijá Pidgin', beta: true },
  { id: 'yo', label: 'Yorùbá', beta: true },
  { id: 'ha', label: 'Hausa', beta: true },
  { id: 'ig', label: 'Igbo', beta: true },
  { id: 'fr', label: 'Français' },
  { id: 'ar', label: 'العربية' },
  { id: 'sw', label: 'Kiswahili' },
  { id: 'pt', label: 'Português' },
  { id: 'es', label: 'Español' },
];

export const styleOf = (id: string) => STYLES.find((s) => s.id === id) ?? STYLES[0];
export const voiceOf = (id: string) => VOICES.find((v) => v.id === id) ?? VOICES[0];

// Display labels, translated at render time with the `videos` namespace's t. Ids above stay unchanged
// (they are stored in video settings).
type VideosT = TFunction<'videos'>;
type HomeT = TFunction<'home'>;

export const lengthLabel = (id: LengthId, t: VideosT) => t(`options.lengths.${id}.label`);
export const lengthDescription = (id: LengthId, t: VideosT) => t(`options.lengths.${id}.description`);

export const voiceLabel = (id: string, t: VideosT) => t(`options.voices.${voiceOf(id).id}.name`);
export const voiceDescription = (id: string, t: VideosT) => t(`options.voices.${voiceOf(id).id}.description`);
/** The voice's name, or "No narration" for silent videos. */
export const voiceName = (id: string, t: VideosT) => (id === 'none' ? t('labels.noNarration') : voiceLabel(id, t));

export const styleName = (id: string, t: VideosT) => t(`options.styles.${styleOf(id).id}.name`);
export const styleDescription = (id: string, t: VideosT) => t(`options.styles.${styleOf(id).id}.description`);

export const captionStyleLabel = (id: CaptionStyle, t: VideosT) => t(`options.captionStyles.${id}.label`);
export const captionStyleDescription = (id: CaptionStyle, t: VideosT) => t(`options.captionStyles.${id}.description`);

export const stageLabel = (index: number, t: VideosT) =>
  t(`stages.${GENERATION_STAGES[Math.min(Math.max(0, index), GENERATION_STAGES.length - 1)]}`);

/** Default collections are stored in English; show them in the current language. */
const DEFAULT_COLLECTIONS: Record<string, keyof (typeof videos)['collections']> = {
  'Watch later': 'watchLater',
  'Exam revision': 'examRevision',
};
export const collectionName = (name: string, t: VideosT) =>
  DEFAULT_COLLECTIONS[name] ? t(`collections.${DEFAULT_COLLECTIONS[name]}`) : name;

/** A video's subject: catalogue subjects and "General" are translated, free-text subjects shown as they are. */
export function subjectLabel(subject: string, t: VideosT, tHome: HomeT) {
  if (subject === 'General') return t('labels.general');
  const s = subjectByEnglishName(subject);
  return s ? subjectName(s, tHome) : subject;
}

export function levelText(level: string, t: VideosT, tHome: HomeT) {
  if (level === 'Your level') return t('labels.yourLevel');
  return level === 'Beginner' || level === 'Intermediate' || level === 'Advanced' ? levelLabel(level, tHome) : level;
}

/** "You" for the student's own videos; brand names (Knowzone Originals) stay as they are. */
export const creatorLabel = (creator: string, t: VideosT) => (creator === 'You' ? t('labels.you') : creator);

/** Where a generated video came from. */
export function sourceLabel(src: VideoSource | undefined, t: VideosT) {
  if (!src) return '—';
  if (src.kind === 'topic') return t('labels.topic', { topic: src.topic });
  if (src.kind === 'text') return t('labels.yourNotes');
  return src.label;
}

/** Translated title, message and tips for a failed generation (older saves without a code show their text). */
export function generationError(error: NonNullable<GeneratedVideo['error']>, t: VideosT) {
  switch (error.code) {
    case 'render-timeout':
      return {
        title: t('errors.renderTimeout.title'),
        message: t('errors.renderTimeout.message'),
        reasons: [t('errors.renderTimeout.reasons.busy'), t('errors.renderTimeout.reasons.shorter')],
      };
    case 'lesson-missing':
      return {
        title: t('errors.lessonMissing.title'),
        message: t('errors.lessonMissing.message'),
        reasons: [t('errors.differentSource')],
      };
    case 'material-missing':
      return {
        title: t('errors.materialMissing.title'),
        message: t('errors.materialMissing.message'),
        reasons: [t('errors.differentSource')],
      };
    case 'not-configured':
    case 'no-credits':
    case 'upload-failed': {
      const key = error.code === 'not-configured' ? 'notConfigured' : error.code === 'no-credits' ? 'noCredits' : 'uploadFailed';
      return { title: t(`errors.${key}.title`), message: t(`errors.${key}.message`), reasons: [] };
    }
    default:
      return { title: error.title ?? '', message: error.message ?? '', reasons: error.reasons ?? [] };
  }
}
