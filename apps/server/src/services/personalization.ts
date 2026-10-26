import { z } from 'zod';

import type { User } from '../generated/prisma/client.js';
import { settingsOf, type AppSettings } from './account.js';

/** Languages Knowzone teaches in (screen 27). Ids match the app's LANGUAGES list. */
export const LANGUAGES = {
  en: 'English',
  pcm: 'Nigerian Pidgin',
  yo: 'Yoruba',
  ig: 'Igbo',
  ha: 'Hausa',
  fr: 'French',
  ar: 'Arabic',
  sw: 'Swahili',
  pt: 'Portuguese',
  es: 'Spanish',
} as const;
export type LanguageId = keyof typeof LANGUAGES;
const LANGUAGE_IDS = Object.keys(LANGUAGES) as [LanguageId, ...LanguageId[]];

const Id = z.string().trim().min(1).max(40);
const Ids = (max: number) => z.array(Id).max(max).default([]);
const Time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a time like 19:00');

/**
 * Onboarding answers (screens 18–29). Ids are checked for shape rather than against fixed lists,
 * so the app can add options without a server release; anything unknown is dropped.
 */
export const Personalization = z.object({
  learnerType: z.enum(['school', 'university', 'exam', 'professional', 'lifelong', 'teacher']).nullable().default(null),
  ageGroup: Id.nullable().default(null),
  educationLevel: Id.nullable().default(null),
  track: Id.nullable().default(null),
  institution: z.string().trim().max(120).default(''),
  examGoals: Ids(10),
  /** YYYY-MM of the main exam. */
  examMonth: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
    .nullable()
    .default(null),
  subjects: z.array(z.string().trim().min(1).max(60)).max(30).default([]),
  interests: Ids(20),
  goals: Ids(10),
  formats: Ids(10),
  language: z.enum(LANGUAGE_IDS).default('en'),
  dailyMinutes: z.number().int().min(5).max(240).default(15),
  reminders: z
    .object({
      enabled: z.boolean(),
      time: Time,
      days: z.array(z.number().int().min(0).max(6)).max(7),
      types: Ids(6),
    })
    .default({ enabled: true, time: '19:00', days: [0, 1, 2, 3, 4, 5, 6], types: ['daily', 'streak'] }),
  // Teacher / tutor answers
  teacherRole: Id.nullable().default(null),
  teachLevels: Ids(10),
  teacherGoals: Ids(10),
  firstClass: z
    .object({ name: z.string().trim().min(1).max(60), subject: z.string().trim().max(60), level: z.string().trim().max(40) })
    .nullable()
    .default(null),
});
export type Personalization = z.infer<typeof Personalization>;

export const learningLanguageOf = (user: Pick<User, 'personalization'>): LanguageId => {
  const lang = (user.personalization as { language?: string } | null)?.language;
  return lang && lang in LANGUAGES ? (lang as LanguageId) : 'en';
};

/**
 * Keeps settings in step with onboarding answers: the first reminder follows the chosen time and
 * days, notification categories follow the chosen reminder types, and a first-time app language
 * follows the learning language.
 */
export function settingsFromPersonalization(user: User, p: Personalization): AppSettings {
  const current = settingsOf(user);
  const [first, ...rest] = current.reminders;
  const firstReminder = {
    ...(first ?? { id: 'r1', label: 'Daily study' }),
    time: p.reminders.time,
    days: p.reminders.days.length ? p.reminders.days : [1, 2, 3, 4, 5],
    enabled: p.reminders.enabled,
  };
  const types = new Set(p.reminders.types);
  return {
    ...current,
    reminders: [firstReminder, ...rest],
    appLanguage: user.settings ? current.appLanguage : p.language,
    notifications: {
      ...current.notifications,
      categories: {
        ...current.notifications.categories,
        reminders: p.reminders.enabled && (types.has('daily') || types.has('revision')),
        streak: p.reminders.enabled && types.has('streak'),
      },
    },
  };
}

/**
 * Prompt instruction for the student's learning language. Quiz questions stay in English when the
 * student studies for English-language exams, so practice matches the real paper.
 */
export function languageInstruction(language: LanguageId) {
  if (language === 'en') return 'Write in clear, simple English.';
  const name = LANGUAGES[language];
  return [
    `Write summaries, explanations, key concepts and flashcards in ${name}.`,
    'Keep formulas, units, scientific names and exam names (WAEC, JAMB…) in their standard form.',
    'Write quiz questions and options in English, because the student’s exams are in English; write the answer explanations in ' +
      `${name}.`,
    language === 'pcm' ? 'Use friendly, natural Nigerian Pidgin, not broken English.' : '',
  ]
    .filter(Boolean)
    .join(' ');
}
