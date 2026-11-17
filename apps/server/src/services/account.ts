import { z } from 'zod';

import { DEFAULT_REGION, isRegion } from '../data/exams.js';
import type { User } from '../generated/prisma/client.js';

/** A study region: an ISO 3166-1 alpha-2 country code ("ZZ" = another country). */
export const Region = z.string().regex(/^[A-Z]{2}$/, 'Use a two-letter country code');

const Reminder = z.object({
  id: z.string().max(40),
  label: z.string().max(40),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  days: z.array(z.number().int().min(0).max(6)).max(7),
  enabled: z.boolean(),
});

const Categories = z.object({
  reminders: z.boolean(),
  streak: z.boolean(),
  quests: z.boolean(),
  classes: z.boolean(),
  referrals: z.boolean(),
  news: z.boolean(),
});

export const AppSettings = z.object({
  notifications: z.object({
    push: z.boolean(),
    email: z.boolean(),
    categories: Categories,
    quietHours: z.object({
      enabled: z.boolean(),
      from: z.string().regex(/^\d{2}:\d{2}$/),
      to: z.string().regex(/^\d{2}:\d{2}$/),
    }),
  }),
  reminders: z.array(Reminder).max(4),
  appLanguage: z.string().max(10),
  /**
   * The country whose exams the learner prepares for. Chosen in onboarding, changed in Settings.
   * Settings saved before regions existed have none: those accounts are Nigeria, as they always were.
   */
  region: Region.default(DEFAULT_REGION),
  privacy: z.object({
    profileVisibility: z.enum(['everyone', 'school', 'private']),
    personalisedRecommendations: z.boolean(),
    usageAnalytics: z.boolean(),
    /** Off by default: we never train AI on a student's work without opt-in. */
    improveAi: z.boolean(),
  }),
});
export type AppSettings = z.infer<typeof AppSettings>;

/** A partial update: top-level keys replace, notifications and privacy merge one level deep. */
export const SettingsPatch = z.object({
  notifications: AppSettings.shape.notifications.partial().optional(),
  reminders: AppSettings.shape.reminders.optional(),
  appLanguage: AppSettings.shape.appLanguage.optional(),
  region: Region.optional(),
  privacy: AppSettings.shape.privacy.partial().optional(),
});

/**
 * The study region this account chose, or null if it never did. It lives in the settings: the whole
 * settings once any are saved, or just `{ region }` from the sign-up form until then. An onboarding
 * answer counts too.
 */
export function chosenRegion(user: Pick<User, 'settings' | 'personalization'>): string | null {
  const stored = (user.settings as { region?: unknown } | null)?.region;
  if (isRegion(stored)) return stored;
  const answered = (user.personalization as { region?: unknown } | null)?.region;
  return isRegion(answered) ? answered : null;
}

/** The learner's study region: the one they chose, else Nigeria (accounts from before regions). */
export const regionOf = (user: Pick<User, 'settings' | 'personalization'>): string => chosenRegion(user) ?? DEFAULT_REGION;

/** Whether the account has saved settings of its own (a region from the sign-up form alone isn't that). */
export const hasSettings = (user: Pick<User, 'settings'>) => AppSettings.safeParse(user.settings).success;

type PersonalizationReminders = { reminders?: { time?: string; days?: number[]; enabled?: boolean } };

/** Stored settings, or defaults seeded from onboarding answers (same defaults as the app). */
export function settingsOf(user: User): AppSettings {
  const stored = AppSettings.safeParse(user.settings);
  if (stored.success) return stored.data;
  const r = (user.personalization as PersonalizationReminders | null)?.reminders;
  return {
    notifications: {
      push: true,
      email: true,
      categories: { reminders: true, streak: true, quests: true, classes: true, referrals: true, news: false },
      quietHours: { enabled: true, from: '21:30', to: '07:00' },
    },
    reminders: [
      {
        id: 'r1',
        label: 'Daily study',
        time: r?.time ?? '16:00',
        days: r?.days?.length ? r.days : [1, 2, 3, 4, 5],
        enabled: r?.enabled ?? true,
      },
      { id: 'r2', label: 'Weekend revision', time: '10:00', days: [6], enabled: false },
    ],
    appLanguage: (user.personalization as { language?: string } | null)?.language ?? 'en',
    region: regionOf(user),
    privacy: { profileVisibility: 'school', personalisedRecommendations: true, usageAnalytics: true, improveAi: false },
  };
}

export function mergeSettings(current: AppSettings, patch: z.infer<typeof SettingsPatch>): AppSettings {
  return AppSettings.parse({
    ...current,
    ...patch,
    notifications: { ...current.notifications, ...patch.notifications },
    privacy: { ...current.privacy, ...patch.privacy },
  });
}

/** Sign-in methods as Supabase reports them in the access token (linking happens in the app via Supabase). */
export function connectionsOf(user: User) {
  const has = (p: string) => user.providers.includes(p) || user.authProvider === p;
  return {
    email: { address: user.email, verified: user.emailVerified, hasPassword: has('email') },
    google: has('google') ? { email: user.email } : null,
    apple: has('apple') ? { email: user.email } : null,
  };
}

const Photo = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('avatar') }),
  z.object({ kind: z.literal('initials'), color: z.string().regex(/^#[0-9a-f]{6}$/i) }),
  z.object({ kind: z.literal('photo'), uri: z.string().max(2048) }),
]);

export const ProfilePatch = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(40).optional(),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .refine((u) => u === '' || /^[a-z0-9_]{3,20}$/.test(u), 'Usernames are 3–20 letters, numbers or underscores')
    .optional(),
  school: z.string().trim().max(80).optional(),
  grade: z.string().trim().max(40).optional(),
  bio: z.string().trim().max(160, 'Keep your bio under 160 characters').optional(),
  photo: Photo.optional(),
});
