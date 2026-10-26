import { Ionicons } from '@expo/vector-icons';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

import { ChoiceChip } from '@/components/personalize/choice-chip';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { Reminder } from '@/lib/api';
import { REMINDER_TIMES } from '@/lib/personalization';
import { useSettings } from '@/lib/settings';

const TIMES = [...REMINDER_TIMES.map((t) => t.time), '06:30', '10:00', '13:00', '18:00', '20:00'].sort();
const MAX = 4;

/** Built-in reminder names (stored as English) shown in the current language. */
const LABEL_KEYS: Record<string, 'dailyStudy' | 'studyTime'> = {
  'Daily study': 'dailyStudy',
  'Study time': 'studyTime',
};
const DEFAULT_LABEL = 'Study time';

function labelOf(t: TFunction<'settings'>, r: Reminder) {
  const key = LABEL_KEYS[r.label];
  return key ? t(`reminders.labels.${key}`) : r.label;
}

function summary(t: TFunction<'settings'>, r: Reminder) {
  const d = [...r.days].sort();
  const names = t('weekdays.medium', { ns: 'common', returnObjects: true });
  const days =
    d.length === 7
      ? t('reminders.everyDay')
      : d.join() === '1,2,3,4,5'
        ? t('reminders.weekdays')
        : d.join() === '0,6'
          ? t('reminders.weekends')
          : d.map((x) => names[x]).join(t('reminders.listSeparator'));
  return t('reminders.summary', { days, time: r.time });
}

/** Screen 191: reminder schedule. */
export default function ReminderScheduleScreen() {
  const { settings, save, error } = useSettings();
  const { t } = useTranslation('settings');
  if (!settings)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('eyebrow')} title={t('reminders.shortTitle')} />
        <Text variant="small" color={error ? Colors.danger : Colors.textMuted}>
          {error ?? t('status.loading', { ns: 'common' })}
        </Text>
      </Screen>
    );
  const list = settings.reminders;
  const update = (id: string, patch: Partial<Reminder>) =>
    save({ reminders: list.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  const add = () =>
    save({
      reminders: [
        ...list,
        {
          id: `r${Date.now().toString(36)}`,
          label: DEFAULT_LABEL,
          time: '19:00',
          days: [1, 2, 3, 4, 5],
          enabled: true,
        },
      ],
    });
  const off = !settings.notifications.push || !settings.notifications.categories.reminders;

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('reminders.title')} />
      <Text color={Colors.textSecondary}>{t('reminders.intro')}</Text>
      {off && (
        <Card style={styles.warn}>
          <Ionicons name="notifications-off" size={18} color={Colors.reward} />
          <Text variant="small" style={{ flex: 1 }}>
            {t('reminders.off')}
          </Text>
        </Card>
      )}
      {list.map((r) => (
        <Animated.View key={r.id} entering={FadeInDown} layout={Layout}>
          <Card style={[{ gap: Spacing.sm }, !r.enabled && { opacity: 0.6 }]}>
            <View style={styles.head}>
              <Ionicons name="alarm" size={22} color={r.enabled ? Colors.reward : Colors.textMuted} />
              <View style={{ flex: 1 }}>
                <Text variant="heading">{r.time}</Text>
                <Text variant="small" color={Colors.textSecondary}>
                  {t('reminders.meta', { label: labelOf(t, r), summary: summary(t, r) })}
                </Text>
              </View>
              <Switch
                value={r.enabled}
                onValueChange={(enabled) => update(r.id, { enabled })}
                trackColor={{ true: Colors.primary, false: Colors.surfaceRaised }}
                thumbColor="#fff"
                accessibilityLabel={t('reminders.toggleA11y', { label: labelOf(t, r) })}
              />
            </View>
            {r.enabled && (
              <>
                <View style={styles.days}>
                  {t('weekdays.short', { ns: 'common', returnObjects: true }).map((d, k) => {
                    const on = r.days.includes(k);
                    return (
                      <Pressable
                        key={k}
                        onPress={() => update(r.id, { days: on ? r.days.filter((x) => x !== k) : [...r.days, k] })}
                        disabled={on && r.days.length === 1}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: on }}
                        accessibilityLabel={t('weekdays.long', { ns: 'common', returnObjects: true })[k]}
                        style={[styles.day, on && styles.dayOn]}>
                        <Text variant="label" color={on ? Colors.backgroundDeep : Colors.textSecondary}>
                          {d}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.chips}>
                  {TIMES.map((time) => (
                    <ChoiceChip
                      key={time}
                      label={time}
                      selected={r.time === time}
                      onPress={() => update(r.id, { time })}
                    />
                  ))}
                </View>
                {list.length > 1 && (
                  <Pressable
                    onPress={() => save({ reminders: list.filter((x) => x.id !== r.id) })}
                    accessibilityRole="button"
                    accessibilityLabel={t('reminders.deleteA11y', { label: labelOf(t, r) })}
                    style={styles.del}>
                    <Ionicons name="trash-outline" size={14} color={Colors.danger} />
                    <Text variant="small" color={Colors.danger}>
                      {t('reminders.delete')}
                    </Text>
                  </Pressable>
                )}
              </>
            )}
          </Card>
        </Animated.View>
      ))}
      {list.length < MAX && <Button variant="secondary" icon="add" title={t('reminders.add')} onPress={add} />}
      <Text variant="small" color={Colors.textMuted}>
        {t('reminders.note')}
      </Text>
      {error && (
        <Text variant="small" color={Colors.danger}>
          {error}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  warn: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', borderColor: Colors.reward + '66' },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOn: { backgroundColor: Colors.reward },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  del: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    padding: 4,
    borderRadius: Radius.sm,
  },
});
