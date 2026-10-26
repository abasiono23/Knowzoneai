import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import i18n from '@/i18n';

import type { AppSettings } from './api';

/** Identifiers we own, so syncing never touches other notifications. */
const PREFIX = 'kz-reminder-';
const CHANNEL = 'reminders';

let configured = false;
function configure() {
  if (configured || Platform.OS === 'web') return;
  configured = true;
  // Show reminders even when the app is open.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android')
    Notifications.setNotificationChannelAsync(CHANNEL, {
      name: i18n.t('common:reminders.channel'),
      // eslint-disable-next-line import/namespace -- exported by expo-notifications; the import plugin can't see it
      importance: Notifications.AndroidImportance.DEFAULT,
    }).catch(() => {});
}

export const remindersSupported = () => Platform.OS !== 'web';

/** Asks for permission (only call after the person turns reminders on). */
export async function requestReminderPermission() {
  if (!remindersSupported()) return false;
  configure();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** True when a time falls inside quiet hours (which may wrap past midnight). */
export function inQuietHours(time: string, quiet: AppSettings['notifications']['quietHours']) {
  if (!quiet.enabled) return false;
  const t = minutesOf(time);
  const from = minutesOf(quiet.from);
  const to = minutesOf(quiet.to);
  return from <= to ? t >= from && t < to : t >= from || t < to;
}

/**
 * Makes the phone's scheduled reminders match the settings: one weekly notification per enabled
 * reminder and day, in the current language, skipping quiet hours. Never prompts for permission.
 * Returns how many were scheduled, or why none were.
 */
export async function syncReminders(settings: AppSettings): Promise<number | 'unsupported' | 'no-permission'> {
  if (!remindersSupported()) return 'unsupported';
  configure();
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
  const n = settings.notifications;
  if (!n.push || !n.categories.reminders) return 0;
  if (!(await Notifications.getPermissionsAsync()).granted) return 'no-permission';

  let count = 0;
  for (const r of settings.reminders) {
    if (!r.enabled || inQuietHours(r.time, n.quietHours)) continue;
    const [hour, minute] = r.time.split(':').map(Number);
    for (const day of r.days) {
      await Notifications.scheduleNotificationAsync({
        identifier: `${PREFIX}${r.id}-${day}`,
        content: {
          title: i18n.t('common:reminders.title'),
          body: i18n.t('common:reminders.body'),
          data: { url: '/home' },
        },
        // Expo weekdays run 1 (Sunday) to 7; ours run 0 (Sunday) to 6.
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: day + 1,
          hour,
          minute,
          channelId: CHANNEL,
        },
      });
      count++;
    }
  }
  return count;
}
