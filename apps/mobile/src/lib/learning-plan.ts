import type { TFunction } from 'i18next';

import { formatDate } from '@/i18n';
import type en from '@/i18n/locales/en/personalize';

import { EXAMS, FORMATS, INTERESTS, learnerKey, subjectLabel, type Personalization } from './personalization';

export type PlanDay = {
  /** Short weekday name in the current language. */
  day: string;
  /** English subject name as stored in the profile (for matching lessons); null on the recap day. */
  subject: string | null;
  /** What the day is about, ready to show. */
  focus: string;
  minutes: number;
  activity: string;
  rest?: boolean;
};

export type LearningPlan = {
  headline: string;
  weeklyMinutes: number;
  days: PlanDay[];
  milestones: { week: number; title: string }[];
  exam: { label: string; month: string; weeksLeft: number } | null;
  formats: string[];
  startingWorld: { name: string; emoji: string };
  firstLesson: { subject: string; title: string; minutes: number };
};

type WorldId = keyof typeof en.plan.worlds;

const WORLD_BY_INTEREST: Record<string, { id: WorldId; emoji: string }> = {
  space: { id: 'spaceLab', emoji: '🪐' },
  coding: { id: 'codePlanet', emoji: '💻' },
  ai: { id: 'codePlanet', emoji: '🤖' },
  puzzles: { id: 'mathMountain', emoji: '⛰️' },
  nature: { id: 'natureQuest', emoji: '🌿' },
  environment: { id: 'natureQuest', emoji: '🌍' },
  health: { id: 'natureQuest', emoji: '🫀' },
  art: { id: 'artCity', emoji: '🎨' },
  music: { id: 'artCity', emoji: '🎵' },
  film: { id: 'artCity', emoji: '🎬' },
  history: { id: 'historyRealm', emoji: '🏛️' },
  writing: { id: 'languageIsland', emoji: '✍️' },
};

const ACTIVITY_FORMATS = [
  'videos',
  'summaries',
  'flashcards',
  'quizzes',
  'tutor',
  'audio',
  'games',
  'mindmaps',
] as const;
type ActivityFormat = (typeof ACTIVITY_FORMATS)[number];
const isActivityFormat = (f: string): f is ActivityFormat => (ACTIVITY_FORMATS as readonly string[]).includes(f);

/** Monday 1 January 2024: day i of the plan (Monday first) is this date plus i days. */
const MONDAY = new Date(2024, 0, 1);
const dayName = (i: number) =>
  formatDate(new Date(MONDAY.getFullYear(), MONDAY.getMonth(), MONDAY.getDate() + i), { weekday: 'short' });

function weeksUntil(month: string, now = new Date()) {
  const [y, m] = month.split('-').map(Number);
  return Math.max(1, Math.round((new Date(y, m - 1, 1).getTime() - now.getTime()) / (7 * 86_400_000)));
}

/**
 * Builds a starter weekly plan on the device from the student's choices, with every text in the
 * current language (pass the `t` from `useTranslation('personalize')` and rebuild when it changes).
 * Replace with the server's AI-generated plan once that endpoint exists.
 */
export function buildPlan(p: Personalization, t: TFunction<'personalize'>): LearningPlan {
  const subjects = p.subjects.length ? p.subjects : ['English Language', 'Mathematics'];
  const formats = p.formats.length ? p.formats : ['summaries', 'quizzes', 'flashcards'];
  const hasExam = p.examGoals.length > 0 && !p.examGoals.includes('none');
  const examOptions = EXAMS[learnerKey(p.learnerType)];

  // Six learning days rotate subjects; Sunday is a light recap so streaks stay achievable.
  const days: PlanDay[] = Array.from({ length: 7 }, (_, i) => {
    const day = dayName(i);
    if (i === 6) {
      return {
        day,
        subject: null,
        focus: t('plan.recap'),
        minutes: Math.max(5, Math.round(p.dailyMinutes / 2)),
        activity: t('plan.recapActivity'),
        rest: true,
      };
    }
    const format = formats[i % formats.length];
    const subject = subjects[i % subjects.length];
    return {
      day,
      subject,
      focus: subjectLabel(subject),
      minutes: p.dailyMinutes,
      activity: isActivityFormat(format) ? t(`plan.activities.${format}`) : t('plan.studySession'),
    };
  });

  const exam =
    hasExam && p.examMonth
      ? {
          label: examOptions.find((e) => e.id === p.examGoals[0])?.label ?? t('plan.yourExam'),
          month: p.examMonth,
          weeksLeft: weeksUntil(p.examMonth),
        }
      : null;

  const worldRef = p.interests.map((i) => WORLD_BY_INTEREST[i]).find(Boolean) ?? { id: 'spaceLab', emoji: '🪐' };
  const world = { name: t(`plan.worlds.${worldRef.id}`), emoji: worldRef.emoji };

  const [first, second] = subjects.map(subjectLabel);
  const milestones = [
    {
      week: 1,
      title: second
        ? t('plan.milestones.packsTwo', { first, second })
        : t('plan.milestones.packsOne', { subject: first }),
    },
    { week: 2, title: t('plan.milestones.streak') },
    { week: 3, title: t('plan.milestones.flashcards') },
    {
      week: 4,
      title: exam ? t('plan.milestones.mock', { exam: exam.label }) : t('plan.milestones.world'),
    },
  ];

  const headline = exam
    ? t('plan.headlineExam', { count: exam.weeksLeft, exam: exam.label })
    : p.goals.includes('skill') || p.goals.includes('career')
      ? t('plan.headlineSkills')
      : t('plan.headlineDefault');

  return {
    headline,
    weeklyMinutes: days.reduce((sum, d) => sum + d.minutes, 0),
    days,
    milestones,
    exam,
    formats: formats.map((f) => FORMATS.find((x) => x.id === f)?.label ?? f),
    startingWorld: world,
    firstLesson: { subject: subjects[0], title: t('plan.firstLesson', { subject: first }), minutes: 5 },
  };
}

export const interestLabels = (ids: string[]) =>
  ids.map((id) => INTERESTS.find((i) => i.id === id)).filter(Boolean) as typeof INTERESTS;
