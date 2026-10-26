import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { StepScreen } from '@/components/personalize/step-screen';
import { ToggleRow } from '@/components/personalize/toggle-row';
import { Card, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { REMINDER_TIMES, REMINDER_TYPES, toggleIn, WEEKDAYS } from '@/lib/personalization';
import { usePersonalization } from '@/lib/personalization-store';

// Monday-first display order; values stay JS weekday numbers (0 = Sunday).
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function RemindersScreen() {
  const { profile, update } = usePersonalization();
  const { t } = useTranslation('personalize');
  const dayNames = t('weekdays.long', { ns: 'common', returnObjects: true });
  const r = profile.reminders;
  const set = (patch: Partial<typeof r>) => update({ reminders: { ...r, ...patch } });

  return (
    <StepScreen
      step="reminders"
      title={t('reminders.title')}
      subtitle={t('reminders.subtitle')}
      canContinue={!r.enabled || (r.days.length > 0 && r.types.length > 0)}>
      <Card>
        <ToggleRow
          icon="notifications"
          label={t('reminders.toggle')}
          description={t('reminders.toggleHint')}
          value={r.enabled}
          onChange={(enabled) => set({ enabled })}
        />
      </Card>

      {r.enabled && (
        <Animated.View entering={FadeIn} style={{ gap: Spacing.md }}>
          <Text variant="heading">{t('reminders.bestTime')}</Text>
          <View style={styles.times}>
            {REMINDER_TIMES.map((o) => {
              const selected = r.time === o.time;
              return (
                <Pressable
                  key={o.time}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    set({ time: o.time });
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={t('reminders.timeA11y', { label: o.label, time: o.time })}
                  style={[styles.time, selected && styles.selected]}>
                  <Text style={{ fontSize: 22, lineHeight: 28 }}>{o.emoji}</Text>
                  <Text variant="bodyStrong">{o.time}</Text>
                  <Text variant="small" color={Colors.textSecondary} style={{ fontSize: 12 }}>
                    {o.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text variant="heading">{t('reminders.whichDays')}</Text>
          <View style={styles.days}>
            {DAY_ORDER.map((d) => {
              const on = r.days.includes(d);
              return (
                <Pressable
                  key={d}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    set({ days: toggleIn(r.days, d) });
                  }}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={dayNames[d]}
                  style={[styles.day, on && styles.dayOn]}>
                  <Text variant="bodyStrong" color={on ? Colors.textOnAccent : Colors.textSecondary}>
                    {WEEKDAYS[d]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text variant="heading">{t('reminders.remindAbout')}</Text>
          <Card style={{ gap: Spacing.xs }}>
            {REMINDER_TYPES.map((o) => (
              <ToggleRow
                key={o.id}
                icon={o.icon}
                label={o.label}
                description={o.description}
                value={r.types.includes(o.id)}
                onChange={() => set({ types: toggleIn(r.types, o.id) })}
              />
            ))}
          </Card>
        </Animated.View>
      )}
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  times: { flexDirection: 'row', gap: Spacing.xs },
  time: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  selected: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  dayOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
});
