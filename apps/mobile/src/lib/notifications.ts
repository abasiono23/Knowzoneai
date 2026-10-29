import type { Ionicons } from '@expo/vector-icons';
import type { TFunction } from 'i18next';

import { formatDate, formatTime } from '@/i18n';
import type home from '@/i18n/locales/en/home';

import type { ServerNotification } from './api';
import { getLesson, getSubject, subjectName } from './catalog';

export type NotificationType = ServerNotification['type'];

type DemoId = keyof typeof home.notifications.items;
type TemplateId = keyof typeof home.notifications.templates;

/**
 * An inbox message. Text is never stored: server messages carry a `template` and its `params`,
 * demo messages (mock mode) a fixed `demo` id. notificationText(n, t) renders either in the
 * current language, so switching language also translates the inbox.
 */
export type AppNotification = {
  id: string;
  type: NotificationType;
  createdAt: number;
  read: boolean;
  href?: string;
  demo?: DemoId;
  template?: string;
  params?: Record<string, string | number>;
};

/** Show the label with t(`notifications.types.${type}`). */
export const TYPE_META: Record<NotificationType, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  streak: { icon: 'flame', color: '#FF5A7A' },
  reminder: { icon: 'alarm', color: '#9B82FF' },
  achievement: { icon: 'trophy', color: '#FFC857' },
  class: { icon: 'school', color: '#FF9F43' },
  content: { icon: 'sparkles', color: '#2DD4BF' },
  referral: { icon: 'gift', color: '#FFC857' },
  system: { icon: 'information-circle', color: '#4CC9FF' },
};

/** Demo inbox for mock mode, timed relative to now so it always looks fresh. */
const DEMO: { id: DemoId; type: NotificationType; minutesAgo: number; href: string }[] = [
  { id: 'n1', type: 'streak', minutesAgo: 12, href: '/lesson/l9' },
  { id: 'n2', type: 'content', minutesAgo: 95, href: '/lesson/l4' },
  { id: 'n3', type: 'achievement', minutesAgo: 60 * 5, href: '/profile' },
  { id: 'n4', type: 'reminder', minutesAgo: 60 * 20, href: '/lesson/l2' },
  { id: 'n5', type: 'referral', minutesAgo: 60 * 30, href: '/profile' },
  { id: 'n6', type: 'system', minutesAgo: 60 * 50, href: '/studio' },
];

export function demoInbox(readIds: string[], now = Date.now()): AppNotification[] {
  return DEMO.map((d) => ({
    id: d.id,
    demo: d.id,
    type: d.type,
    href: d.href,
    createdAt: now - d.minutesAgo * 60_000,
    read: readIds.includes(d.id),
  }));
}

export const fromServer = (n: ServerNotification): AppNotification => ({
  id: n.id,
  type: n.type,
  template: n.template,
  params: n.params,
  href: n.href ?? undefined,
  createdAt: n.createdAt,
  read: n.read,
});

const isTemplate = (x: string | undefined): x is TemplateId =>
  !!x &&
  [
    'welcome',
    'referralJoined',
    'referralConfirmed',
    'newLesson',
    'renewalReminder',
    'subscriptionExpired',
    'ticketReply',
    'generic',
  ].includes(x);

/** A notification's text in the current language. */
export function notificationText(n: AppNotification, t: TFunction<'home'>) {
  if (n.demo) {
    return {
      title: t(`notifications.items.${n.demo}.title`),
      body: t(`notifications.items.${n.demo}.body`),
      detail: t(`notifications.items.${n.demo}.detail`),
      cta: t(`notifications.items.${n.demo}.cta`),
    };
  }
  // Lessons and subjects are sent by id and named in the reader's language.
  const params: Record<string, string | number> = { ...n.params };
  const lesson = typeof params.lessonId === 'string' ? getLesson(params.lessonId) : undefined;
  if (lesson) params.lesson = lesson.title;
  const subject = typeof params.subjectId === 'string' ? getSubject(params.subjectId) : undefined;
  if (subject) params.subject = subjectName(subject, t);
  // Study room sessions: the time in the reader's language and time zone.
  if (typeof params.at === 'number')
    params.time = `${formatDate(params.at, { weekday: 'short', day: 'numeric', month: 'short' })}, ${formatTime(params.at)}`;
  const key = isTemplate(n.template) ? n.template : 'generic';
  return {
    title: t(`notifications.templates.${key}.title`, params),
    body: t(`notifications.templates.${key}.body`, params),
    detail: t(`notifications.templates.${key}.detail`, params),
    cta: t(`notifications.templates.${key}.cta`, params),
  };
}

export const minutesSince = (at: number, now = Date.now()) => Math.max(0, Math.floor((now - at) / 60_000));

export function timeAgo(minutes: number, t: TFunction<'home'>) {
  if (minutes < 1) return t('notifications.justNow');
  if (minutes < 60) return t('notifications.minutesAgo', { count: minutes });
  const h = Math.floor(minutes / 60);
  if (h < 24) return t('notifications.hoursAgo', { count: h });
  const d = Math.floor(h / 24);
  return d === 1 ? t('time.yesterday', { ns: 'common' }) : t('notifications.daysAgo', { count: d });
}
