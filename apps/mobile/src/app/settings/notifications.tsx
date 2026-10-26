import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { ChoiceChip } from '@/components/personalize/choice-chip';
import { SettingsLink, SettingsSection, SettingsToggle } from '@/components/settings/rows';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { AppSettings, NotificationCategory } from '@/lib/api';
import { useSession } from '@/lib/session';
import { useSettings } from '@/lib/settings';

/** Labels are translated at render: notifications.categories.<id>.label / .hint. */
const CATEGORIES: {
  id: NotificationCategory;
  icon: 'alarm' | 'flame' | 'flag' | 'people' | 'gift' | 'megaphone';
  teacher?: boolean;
}[] = [
  { id: 'reminders', icon: 'alarm' },
  { id: 'streak', icon: 'flame' },
  { id: 'quests', icon: 'flag' },
  { id: 'classes', icon: 'people', teacher: true },
  { id: 'referrals', icon: 'gift' },
  { id: 'news', icon: 'megaphone', teacher: true },
];
const FROM = ['20:00', '21:00', '21:30', '22:00'];
const TO = ['06:00', '07:00', '08:00'];

/** Screen 190: notification settings. */
export default function NotificationSettingsScreen() {
  const { user } = useSession();
  const { settings, save, error } = useSettings();
  const { t } = useTranslation('settings');
  if (!settings || !user)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('eyebrow')} title={t('notifications.title')} />
        <Text variant="small" color={error ? Colors.danger : Colors.textMuted}>
          {error ?? t('status.loading', { ns: 'common' })}
        </Text>
      </Screen>
    );
  const n = settings.notifications;
  const set = (patch: Partial<AppSettings['notifications']>) => save({ notifications: { ...n, ...patch } });
  const cats = CATEGORIES.filter((c) => user.role !== 'teacher' || c.teacher);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('notifications.title')} />
      <SettingsSection title={t('notifications.channels')}>
        <SettingsToggle
          icon="notifications"
          label={t('notifications.push')}
          hint={t('notifications.pushHint')}
          value={n.push}
          onChange={(push) => set({ push })}
        />
        <SettingsToggle
          icon="mail"
          label={t('notifications.email')}
          hint={user.email}
          value={n.email}
          onChange={(email) => set({ email })}
          last
        />
      </SettingsSection>

      <SettingsSection
        title={t('notifications.whatToSend')}
        footer={!n.push && !n.email ? t('notifications.allOff') : undefined}>
        {cats.map((c, k) => (
          <SettingsToggle
            key={c.id}
            icon={c.icon}
            label={t(`notifications.categories.${c.id}.label`)}
            hint={t(`notifications.categories.${c.id}.hint`)}
            value={n.categories[c.id]}
            disabled={!n.push && !n.email}
            color={Colors.reward}
            onChange={(v) => set({ categories: { ...n.categories, [c.id]: v } })}
            last={k === cats.length - 1}
          />
        ))}
      </SettingsSection>

      <SettingsSection title={t('notifications.quietHours')} footer={t('notifications.quietFooter')}>
        <SettingsToggle
          icon="moon"
          label={t('notifications.quietHours')}
          hint={
            n.quietHours.enabled
              ? t('notifications.quietRange', { from: n.quietHours.from, to: n.quietHours.to })
              : t('home.off')
          }
          value={n.quietHours.enabled}
          onChange={(enabled) => set({ quietHours: { ...n.quietHours, enabled } })}
          last={!n.quietHours.enabled}
        />
        {n.quietHours.enabled && (
          <View style={styles.times}>
            <Text variant="small" color={Colors.textMuted}>
              {t('notifications.from')}
            </Text>
            <View style={styles.chips}>
              {FROM.map((h) => (
                <ChoiceChip
                  key={h}
                  label={h}
                  selected={n.quietHours.from === h}
                  onPress={() => set({ quietHours: { ...n.quietHours, from: h } })}
                />
              ))}
            </View>
            <Text variant="small" color={Colors.textMuted}>
              {t('notifications.until')}
            </Text>
            <View style={styles.chips}>
              {TO.map((h) => (
                <ChoiceChip
                  key={h}
                  label={h}
                  selected={n.quietHours.to === h}
                  onPress={() => set({ quietHours: { ...n.quietHours, to: h } })}
                />
              ))}
            </View>
          </View>
        )}
      </SettingsSection>

      {user.role !== 'teacher' && (
        <SettingsSection>
          <SettingsLink
            icon="alarm-outline"
            label={t('home.reminders')}
            value={t('home.activeCount', { count: settings.reminders.filter((r) => r.enabled).length })}
            onPress={() => router.push('/settings/reminders')}
            last
          />
        </SettingsSection>
      )}
      {error && (
        <Text variant="small" color={Colors.danger}>
          {error}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  times: { gap: Spacing.xs, padding: Spacing.md, paddingTop: 0 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
});
