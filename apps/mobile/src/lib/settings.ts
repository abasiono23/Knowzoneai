import { useCallback, useEffect, useState } from 'react';

import i18n from '@/i18n';
import { errorText } from '@/i18n/errors';

import { api, type AppSettings } from './api';
import { requestReminderPermission, syncReminders } from './reminders';

/** Server-side preferences (notifications, reminders, app language, privacy), saved as you change them. */
export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let live = true;
    api
      .getSettings()
      .then(({ settings: s }) => live && setSettings(s))
      .catch((e) => live && setError(errorText(e, i18n.t('settings:errors.load'))));
    return () => {
      live = false;
    };
  }, []);

  const save = useCallback(
    async (patch: Partial<AppSettings>) => {
      const before = settings;
      if (before) setSettings({ ...before, ...patch });
      setSaving(true);
      try {
        const { settings: s } = await api.saveSettings(patch);
        setSettings(s);
        setError(null);
        if (patch.reminders || patch.notifications) {
          // Turning reminders on is the moment to ask for notification permission; then reschedule.
          const wantsReminders = s.notifications.push && s.reminders.some((r) => r.enabled);
          if (wantsReminders) await requestReminderPermission();
          await syncReminders(s).catch(() => {});
        }
      } catch (e) {
        setSettings(before);
        setError(errorText(e, i18n.t('settings:errors.save')));
      } finally {
        setSaving(false);
      }
    },
    [settings],
  );

  return { settings, error, saving, save };
}
