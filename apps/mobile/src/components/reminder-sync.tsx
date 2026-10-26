import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useLanguage } from '@/i18n/provider';
import { api } from '@/lib/api';
import { remindersSupported, syncReminders } from '@/lib/reminders';
import { useSession } from '@/lib/session';

/**
 * Keeps the phone's scheduled study reminders in step with the account's settings: after sign-in,
 * whenever the app comes back to the foreground, and when the language changes (so the
 * reminder text is in the right language). Renders nothing.
 */
export function ReminderSync() {
  const { user } = useSession();
  const { language } = useLanguage();
  const userId = user?.id;

  useEffect(() => {
    if (!userId || !remindersSupported()) return;
    const sync = () =>
      api
        .getSettings()
        .then(({ settings }) => syncReminders(settings))
        .catch(() => {});
    sync();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && sync());
    return () => sub.remove();
  }, [userId, language]);

  return null;
}
