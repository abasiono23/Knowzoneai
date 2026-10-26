import type { TFunction } from 'i18next';

import type home from '@/i18n/locales/en/home';

import { LESSONS, getSubject, matchSubject, subjectName, type Format, type Lesson } from './catalog';
import { EXAMS, learnerKey, type Personalization } from './personalization';

/** Why a lesson was picked. Turn it into text with reasonText(reason, t). */
export type RecommendationReason =
  | { kind: 'popular' }
  | { kind: 'interest'; interest: string }
  | { kind: 'studies'; subjectId: string }
  | { kind: 'exam'; exam: string };

export type Recommendation = { lesson: Lesson; reason: RecommendationReason; score: number };

/** The reason in the current language, e.g. "Because you study Chemistry". */
export function reasonText(r: RecommendationReason, t: TFunction<'home'>): string {
  switch (r.kind) {
    case 'interest':
      return t('reasons.interest', {
        interest: t(`reasons.interests.${r.interest as keyof typeof home.reasons.interests}`, {
          defaultValue: r.interest,
        }),
      });
    case 'studies': {
      const s = getSubject(r.subjectId);
      return t('reasons.studies', { subject: s ? subjectName(s, t) : '' });
    }
    case 'exam':
      return t('reasons.exam', { exam: r.exam });
    default:
      return t('reasons.popular');
  }
}

const FORMAT_FROM_PREF: Record<string, Format> = {
  videos: 'video',
  summaries: 'summary',
  quizzes: 'quiz',
  flashcards: 'flashcards',
  audio: 'audio',
};

const SUBJECTS_FOR_INTEREST: Record<string, string[]> = {
  coding: ['computer-science'],
  ai: ['ai-literacy', 'computer-science'],
  space: ['physics'],
  health: ['biology'],
  nature: ['biology', 'geography'],
  environment: ['geography', 'biology'],
  business: ['entrepreneurship', 'economics'],
  money: ['economics', 'accounting'],
  history: ['history', 'government'],
  writing: ['english', 'literature'],
  puzzles: ['mathematics', 'further-maths'],
};

/**
 * Scores every lesson against the student's personalization and history, and
 * explains each pick (see reasonText). Runs on device for now.
 */
export function recommend(p: Personalization | null, progress: Record<string, number>, limit = 12): Recommendation[] {
  const mySubjects = new Set((p?.subjects ?? []).map((s) => matchSubject(s)?.id).filter(Boolean) as string[]);
  const interestSubjects = new Map<string, string>();
  (p?.interests ?? []).forEach((i) => (SUBJECTS_FOR_INTEREST[i] ?? []).forEach((s) => interestSubjects.set(s, i)));
  const formats = new Set((p?.formats ?? []).map((f) => FORMAT_FROM_PREF[f]).filter(Boolean));
  const examLabels = (p?.examGoals ?? [])
    .map((id) => EXAMS[learnerKey(p?.learnerType ?? null)].find((e) => e.id === id)?.label.split(' ')[0])
    .filter(Boolean) as string[];

  return LESSONS.filter((l) => (progress[l.id] ?? 0) < 1)
    .map((l) => {
      let score = l.trend / 25;
      let reason: RecommendationReason = { kind: 'popular' };
      const exam = l.exams?.find((e) => examLabels.includes(e));
      if (interestSubjects.has(l.subjectId)) {
        score += 2;
        reason = { kind: 'interest', interest: interestSubjects.get(l.subjectId) ?? '' };
      }
      if (mySubjects.has(l.subjectId)) {
        score += 4;
        reason = { kind: 'studies', subjectId: l.subjectId };
      }
      if (exam) {
        score += 3;
        reason = { kind: 'exam', exam };
      }
      if (formats.has(l.format)) score += 1;
      if ((progress[l.id] ?? 0) > 0) score -= 2;
      return { lesson: l, reason, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
