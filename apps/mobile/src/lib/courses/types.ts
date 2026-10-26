import type { Ionicons } from '@expo/vector-icons';

import i18n, { formatNumber } from '../../i18n';
import type { Level } from '../catalog';
import type { Question } from '../studio/types';
import type { Block } from '../tutor/types';

export type LessonKind = 'reading' | 'video' | 'interactive' | 'quiz';

type KindInfo = {
  /** "Reading", "Video"… in the current language. */
  readonly label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  /** The button that starts this kind of lesson, in the current language. */
  readonly verb: string;
};

const kind = (id: LessonKind, icon: KindInfo['icon'], color: string): KindInfo => ({
  get label() {
    return i18n.t(`courses:kinds.${id}`);
  },
  icon,
  color,
  get verb() {
    return i18n.t(`courses:verbs.${id}`);
  },
});

export const KIND_META: Record<LessonKind, KindInfo> = {
  reading: kind('reading', 'book', '#9B82FF'),
  video: kind('video', 'play', '#2DD4BF'),
  interactive: kind('interactive', 'hand-left', '#FFC857'),
  quiz: kind('quiz', 'help-circle', '#FF7A93'),
};

/** One step of an interactive lesson. Each kind is a small, self-checking activity. */
export type Interaction =
  | { kind: 'reveal'; prompt: string; answer: string }
  | { kind: 'choice'; prompt: string; options: string[]; correctIndex: number; feedback: string }
  | { kind: 'order'; prompt: string; items: string[]; feedback: string }
  | {
      kind: 'fill';
      prompt: string;
      before: string;
      after: string;
      options: string[];
      correctIndex: number;
      feedback: string;
    }
  | { kind: 'match'; prompt: string; pairs: [string, string][]; feedback: string };

export type Resource = {
  id: string;
  kind: 'pdf' | 'worksheet' | 'link' | 'audio' | 'past-paper';
  title: string;
  meta: string;
  /** Text content for in-app viewing and sharing until files are hosted. */
  body?: string;
};

/** A chapter video on YouTube, played in YouTube's own player. */
export type LessonVideo = { youtubeId: string; title: string; channel: string; seconds: number };

/** Authored content for one course lesson. Missing parts are derived from the linked catalogue lesson. */
export type LessonContent = {
  video?: LessonVideo;
  objectives?: string[];
  reading?: { heading: string; blocks: Block[] }[];
  interactive?: Interaction[];
  quiz?: Question[];
  keyPoints?: string[];
  resources?: Resource[];
};

export type CourseLesson = {
  id: string;
  title: string;
  kind: LessonKind;
  minutes: number;
  summary: string;
  /** Catalogue lesson this one is built from (video scenes, key points). */
  catalogId?: string;
  content?: LessonContent;
};

export type Module = { id: string; title: string; summary: string; lessons: CourseLesson[] };

export type Course = {
  id: string;
  title: string;
  subtitle: string;
  subjectId: string;
  level: Level;
  instructorId: string;
  emoji: string;
  colors: readonly [string, string];
  rating: number;
  ratingCount: number;
  /** Real mode: how many learners gave 1, 2, 3, 4 and 5 stars. */
  ratingBreakdown?: number[];
  learners: number;
  description: string;
  outcomes: string[];
  requirements: string[];
  exams?: string[];
  tags: string[];
  featured?: boolean;
  updated: string;
  modules: Module[];
  /** The open textbook a course is adapted from; shown as its licence requires. */
  source?: CourseSource;
};

export type CourseSource = {
  book: string;
  authors: string;
  publisher: string;
  url: string;
  license: string;
  licenseUrl: string;
  attribution: string;
};

export type Instructor = {
  id: string;
  name: string;
  title: string;
  initials: string;
  colors: readonly [string, string];
  location: string;
  bio: string;
  highlights: string[];
  students: number;
  rating: number;
  years: number;
  verified: boolean;
};

/** A finished quiz attempt on a course lesson. */
export type CourseAttempt = {
  id: string;
  at: number;
  answers: number[];
  score: number;
  total: number;
  seconds: number;
};

export type LessonNote = { id: string; text: string; at: number; quote?: string };

export type CourseRating = { stars: number; tags: string[]; text: string; at: number };

export type Certificate = { id: string; issuedAt: number; name: string; score: number };

export const PASS_MARK = 0.6;

export const lessonKey = (courseId: string, lessonId: string) => `${courseId}/${lessonId}`;
export const allLessons = (c: Course) => c.modules.flatMap((m) => m.lessons);
export const courseMinutes = (c: Course) => allLessons(c).reduce((n, l) => n + l.minutes, 0);
/** A star rating with one decimal in the current language, e.g. 4.8. */
export const formatRating = (r: number) => formatNumber(r, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Course or lesson length in the current language, e.g. "45 min" or "2h 30m". */
export function formatDuration(minutes: number) {
  if (minutes < 60) return i18n.t('courses:duration.minutes', { count: minutes });
  const hours = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m
    ? i18n.t('courses:duration.hoursMinutes', { hours, minutes: m })
    : i18n.t('courses:duration.hours', { hours });
}
