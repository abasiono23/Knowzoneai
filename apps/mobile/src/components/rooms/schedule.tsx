import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Chip, Sheet } from '@/components/rooms/ui';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { formatDate, formatTime } from '@/i18n';
import { when } from '@/lib/rooms';

/** Times people can pick: every half hour from 6:00 to 23:30. */
const SLOTS = Array.from({ length: 36 }, (_, i) => ({ h: 6 + Math.floor(i / 2), m: (i % 2) * 30 }));

/**
 * The host schedules the next focus session: a day this week, a time and a length. Members get a
 * notification now and a reminder shortly before; the session starts on its own.
 */
export function ScheduleSheet({
  visible,
  now,
  next,
  busy,
  onClose,
  onSchedule,
  onCancel,
}: {
  visible: boolean;
  now: number;
  next: { at: number; minutes: number } | null;
  busy: boolean;
  onClose: () => void;
  onSchedule: (at: number, minutes: 25 | 50) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation('rooms');
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<number | null>(null);
  const [minutes, setMinutes] = useState<25 | 50>(25);
  const today = new Date(now);
  const at = (d: number, s: number) =>
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + d, SLOTS[s]!.h, SLOTS[s]!.m).getTime();
  const open = (d: number, s: number) => at(d, s) > now + 2 * 60_000;
  const labels = { today: t('today'), tomorrow: t('tomorrow') };

  return (
    <Sheet visible={visible} title={t('schedule.title')} onClose={onClose}>
      {next && (
        <Card style={{ gap: Spacing.sm, backgroundColor: Colors.primarySoft }}>
          <Text variant="bodyStrong">
            📅 {t('schedule.next', { time: when(next.at, labels), minutes: next.minutes })}
          </Text>
          <Button title={t('schedule.cancel')} variant="secondary" icon="close-circle" onPress={onCancel} />
        </Card>
      )}
      <Text variant="small" color={Colors.textSecondary}>
        {t('schedule.about')}
      </Text>
      <Text variant="label" color={Colors.textSecondary}>
        {t('schedule.day')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {Array.from({ length: 7 }, (_, d) => (
          <Chip
            key={d}
            label={
              d === 0
                ? labels.today
                : d === 1
                  ? labels.tomorrow
                  : formatDate(at(d, 0), { weekday: 'short', day: 'numeric' })
            }
            on={day === d}
            onPress={() => {
              setDay(d);
              if (slot !== null && !open(d, slot)) setSlot(null);
            }}
          />
        ))}
      </ScrollView>
      <Text variant="label" color={Colors.textSecondary}>
        {t('schedule.time')}
      </Text>
      <ScrollView style={{ maxHeight: 180 }}>
        <View style={styles.wrap}>
          {SLOTS.map((_, s) => (
            <Chip
              key={s}
              label={formatTime(at(day, s))}
              on={slot === s}
              disabled={!open(day, s)}
              onPress={() => setSlot(s)}
            />
          ))}
        </View>
      </ScrollView>
      <Text variant="label" color={Colors.textSecondary}>
        {t('schedule.length')}
      </Text>
      <View style={styles.row}>
        {([25, 50] as const).map((m) => (
          <Chip key={m} label={t('schedule.minutes', { count: m })} on={minutes === m} onPress={() => setMinutes(m)} />
        ))}
      </View>
      <Button
        title={slot === null ? t('schedule.pick') : t('schedule.save', { time: when(at(day, slot), labels) })}
        icon="calendar"
        loading={busy}
        disabled={slot === null || !open(day, slot)}
        onPress={() => slot !== null && onSchedule(at(day, slot), minutes)}
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.xs },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
});
