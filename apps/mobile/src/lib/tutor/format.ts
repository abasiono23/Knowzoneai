import i18n from '@/i18n';
import { subjectByEnglishName, subjectName } from '@/lib/catalog';

/** Short relative time in the current language ("5m ago"). Call it at render time. */
export function timeAgoMs(at: number, now = Date.now()) {
  const m = Math.round((now - at) / 60_000);
  if (m < 1) return i18n.t('tutor:time.justNow');
  if (m < 60) return i18n.t('tutor:time.minutesAgo', { count: m });
  const h = Math.floor(m / 60);
  if (h < 24) return i18n.t('tutor:time.hoursAgo', { count: h });
  const d = Math.floor(h / 24);
  return d === 1 ? i18n.t('common:time.yesterday') : i18n.t('tutor:time.daysAgo', { count: d });
}

export type DayBucket = 'today' | 'yesterday' | 'week' | 'earlier';

/** Which history group a time falls in. Translate the id with `dayBucketLabel` for display. */
export function dayBucket(at: number, now = new Date()): DayBucket {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (at >= start.getTime()) return 'today';
  if (at >= start.getTime() - 86_400_000) return 'yesterday';
  if (at >= start.getTime() - 6 * 86_400_000) return 'week';
  return 'earlier';
}

export function dayBucketLabel(bucket: DayBucket) {
  switch (bucket) {
    case 'today':
      return i18n.t('common:time.today');
    case 'yesterday':
      return i18n.t('common:time.yesterday');
    case 'week':
      return i18n.t('tutor:time.thisWeek');
    default:
      return i18n.t('tutor:time.earlier');
  }
}

/**
 * Display name for a stored conversation/answer subject. The stored English name stays unchanged
 * (it is matched and saved); only the label is translated.
 */
export function subjectLabel(name: string) {
  if (name === 'General') return i18n.t('tutor:subjects.general');
  const s = subjectByEnglishName(name);
  return s ? subjectName(s, i18n.getFixedT(null, 'home')) : name;
}

/** Display title for a stored conversation title ("New conversation" is the untitled placeholder). */
export function conversationTitle(title: string) {
  return title === 'New conversation' ? i18n.t('tutor:shared.newConversation') : title;
}

/** Display name for a stored notebook (a subject name or the built-in "Exam revision"). */
export function notebookLabel(name: string) {
  return name === 'Exam revision' ? i18n.t('tutor:saveNote.examRevision') : subjectLabel(name);
}
