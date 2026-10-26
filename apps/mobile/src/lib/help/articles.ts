import type { Ionicons } from '@expo/vector-icons';
import type { TFunction } from 'i18next';

import type en from '@/i18n/locales/en/help';

import { MONTHLY_CREDITS, TUTOR_DAILY } from '../billing/plans';
import { REFERRAL_CREDITS, WELCOME_CREDITS } from '../config';

type Icon = keyof typeof Ionicons.glyphMap;

export type HelpCategoryId =
  'start' | 'ai' | 'videos' | 'courses' | 'world' | 'account' | 'payments' | 'safety' | 'teachers';

/** Help topics. Titles are translated at render time: t(`faq.categories.${id}`). */
export const HELP_CATEGORIES: {
  id: HelpCategoryId;
  icon: Icon;
  color: string;
  audience?: 'learner' | 'teacher';
}[] = [
  { id: 'start', icon: 'rocket', color: '#7C5CFF' },
  { id: 'ai', icon: 'sparkles', color: '#B04CFF' },
  { id: 'videos', icon: 'play-circle', color: '#4CC9FF' },
  { id: 'courses', icon: 'school', color: '#2DD4BF' },
  { id: 'world', icon: 'planet', color: '#FFC857', audience: 'learner' },
  { id: 'account', icon: 'person-circle', color: '#A6ADD6' },
  { id: 'payments', icon: 'card', color: '#FF9F43', audience: 'learner' },
  { id: 'safety', icon: 'shield-checkmark', color: '#FF5A7A' },
  { id: 'teachers', icon: 'easel', color: '#14C8B4', audience: 'teacher' },
];

export type FaqId = keyof typeof en.faq.items;
export type FaqEntry = { id: FaqId; category: HelpCategoryId; popular?: boolean };
/** A help article with its question and answer in the current language. */
export type Faq = FaqEntry & { q: string; a: string };

/**
 * Help articles. The questions and answers live in the `help` namespace (faq.items.<id>); answers describe
 * how the app works today, so keep them in step with the product.
 */
export const FAQ_ENTRIES: FaqEntry[] = [
  // Getting started
  { id: 'what-is', category: 'start' },
  { id: 'first-pack', category: 'start', popular: true },
  { id: 'streaks', category: 'start' },
  // AI
  { id: 'credits', category: 'ai', popular: true },
  { id: 'tutor-limit', category: 'ai' },
  { id: 'ai-wrong', category: 'ai', popular: true },
  { id: 'ai-data', category: 'ai' },
  // Videos
  { id: 'video-length', category: 'videos' },
  { id: 'video-failed', category: 'videos' },
  // Courses
  { id: 'certificate', category: 'courses' },
  { id: 'course-progress', category: 'courses' },
  // World
  { id: 'coins', category: 'world' },
  { id: 'leaderboard-privacy', category: 'world' },
  // Account
  { id: 'password', category: 'account', popular: true },
  { id: 'export', category: 'account' },
  { id: 'delete', category: 'account' },
  // Payments
  { id: 'refund', category: 'payments', popular: true },
  { id: 'cancel', category: 'payments' },
  { id: 'transfer', category: 'payments' },
  // Safety
  { id: 'report', category: 'safety', popular: true },
  { id: 'block', category: 'safety' },
  { id: 'danger', category: 'safety' },
  // Teachers
  { id: 'class-code', category: 'teachers' },
  { id: 'class-reports', category: 'teachers' },
];

/** Numbers the answers mention, so they stay in step with plans and config. */
const FAQ_VALUES = {
  welcome: WELCOME_CREDITS,
  referral: REFERRAL_CREDITS,
  plusMonthly: MONTHLY_CREDITS.PLUS,
  tutorFree: TUTOR_DAILY.FREE,
  tutorPlus: TUTOR_DAILY.PLUS,
  tutorPro: TUTOR_DAILY.PRO,
};

/** The articles with their text in the current language. Call at render time with the `help` t. */
export const localizeFaqs = (t: TFunction<'help'>, list: FaqEntry[] = FAQ_ENTRIES): Faq[] =>
  list.map((f) => ({ ...f, q: t(`faq.items.${f.id}.q`), a: t(`faq.items.${f.id}.a`, FAQ_VALUES) }));

/** Ranks articles by how well their (translated) question and answer match the search words. */
export const searchFaqs = (q: string, list: Faq[]) => {
  const words = q
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1);
  if (!words.length) return list;
  return list
    .map((f) => {
      const hay = `${f.q} ${f.a}`.toLowerCase();
      const score = words.reduce((s, w) => s + (f.q.toLowerCase().includes(w) ? 3 : hay.includes(w) ? 1 : 0), 0);
      return { f, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.f);
};
