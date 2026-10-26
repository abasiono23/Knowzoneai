import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatDate } from '@/i18n';
import { useActivity } from '@/lib/rewards/activity';
import { dayKey } from '@/lib/world/levels';
import { useWorld } from '@/lib/world/store';

/** Screen 161: the streak calendar. */
export default function StreakCalendarScreen() {
  const [now] = useState(() => Date.now());
  const { active, frozen, current, longest, total, today } = useActivity(now);
  const { freezes } = useWorld();
  const { t } = useTranslation('rewards');
  // Calendar columns start on Monday; the shared list starts on Sunday.
  const short = t('weekdays.short', { ns: 'common', returnObjects: true });
  const weekdays = [...short.slice(1), short[0]];
  const [offset, setOffset] = useState(0);
  const base = new Date(now);
  const month = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  const daysIn = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const lead = (month.getDay() + 6) % 7;
  const cells = [
    ...Array(lead).fill(null),
    ...Array.from({ length: daysIn }, (_, k) => new Date(month.getFullYear(), month.getMonth(), k + 1)),
  ];
  const todayKey = dayKey(now);
  const activeThisMonth = cells.filter((d) => d && active.has(dayKey(d.getTime()))).length;

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('streak.title')} />
      <Card style={styles.hero}>
        <Text style={{ fontSize: 52, lineHeight: 60 }}>{current ? '🔥' : '🌱'}</Text>
        <View style={{ flex: 1 }}>
          <Text variant="display">{current}</Text>
          <Text color={Colors.textSecondary}>{t('streak.dayStreak', { count: current })}</Text>
          <Text variant="small" color={today ? Colors.success : Colors.reward}>
            {today ? t('streak.learnedToday') : current ? t('streak.keepGoing') : t('streak.start')}
          </Text>
        </View>
      </Card>
      <View style={styles.stats}>
        {[
          { v: longest, l: t('streak.longest') },
          { v: total, l: t('streak.daysLearned') },
          { v: freezes, l: t('streak.freezes') },
        ].map((s) => (
          <Card key={s.l} style={styles.stat}>
            <Text variant="heading">{s.v}</Text>
            <Text variant="small" color={Colors.textMuted} center style={{ fontSize: 11 }}>
              {s.l}
            </Text>
          </Card>
        ))}
      </View>

      <Card style={{ gap: Spacing.sm }}>
        <View style={styles.monthRow}>
          <Pressable
            onPress={() => setOffset(offset - 1)}
            accessibilityRole="button"
            accessibilityLabel={t('streak.prevMonth')}
            hitSlop={8}
            style={styles.nav}>
            <Ionicons name="chevron-back" size={18} color={Colors.text} />
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <Text variant="heading">{formatDate(month, { month: 'long', year: 'numeric' })}</Text>
            <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
              {t('streak.activeDays', { count: activeThisMonth })}
            </Text>
          </View>
          <Pressable
            onPress={() => setOffset(Math.min(0, offset + 1))}
            disabled={offset >= 0}
            accessibilityRole="button"
            accessibilityLabel={t('streak.nextMonth')}
            hitSlop={8}
            style={[styles.nav, offset >= 0 && { opacity: 0.3 }]}>
            <Ionicons name="chevron-forward" size={18} color={Colors.text} />
          </Pressable>
        </View>
        <View style={styles.grid}>
          {weekdays.map((w, k) => (
            <Text key={k} variant="label" color={Colors.textMuted} style={styles.weekday}>
              {w}
            </Text>
          ))}
          {cells.map((d, k) => {
            if (!d) return <View key={`e${k}`} style={styles.cell} />;
            const key = dayKey(d.getTime());
            const on = active.has(key);
            const ice = frozen.has(key);
            const isToday = key === todayKey;
            const future = key > todayKey;
            return (
              <View
                key={key}
                style={styles.cell}
                accessible
                accessibilityLabel={
                  on
                    ? t('streak.dayLearned', { date: dateLabel(d) })
                    : ice
                      ? t('streak.dayFrozen', { date: dateLabel(d) })
                      : dateLabel(d)
                }>
                <View style={[styles.day, on && styles.on, ice && styles.ice, isToday && !on && styles.today]}>
                  {ice ? (
                    <Ionicons name="snow" size={14} color={Colors.info} />
                  ) : (
                    <Text
                      variant="small"
                      color={on ? Colors.backgroundDeep : future ? Colors.textMuted + '66' : Colors.textSecondary}
                      style={{ fontSize: 13, fontFamily: on ? 'Manrope_800ExtraBold' : undefined }}>
                      {d.getDate()}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.legend}>
          <Legend color="#FF9F43" label={t('streak.learned')} />
          <Legend color={Colors.info} label={t('streak.freezeUsed')} />
          <Legend color={Colors.reward} label={t('streak.today')} ring />
        </View>
      </Card>

      <Card style={styles.note}>
        <Ionicons name="heart" size={18} color={Colors.danger} />
        <Text variant="small" style={{ flex: 1 }}>
          {t('streak.note')}
        </Text>
      </Card>
      <Button
        variant="secondary"
        icon="snow"
        title={t('streak.getFreeze')}
        onPress={() => router.push('/rewards/boost-freeze')}
      />
    </Screen>
  );
}

const dateLabel = (d: Date) => formatDate(d, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

function Legend({ color, label, ring }: { color: string; label: string; ring?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View
        style={[
          { width: 12, height: 12, borderRadius: 6 },
          ring ? { borderWidth: 2, borderColor: color } : { backgroundColor: color },
        ]}
      />
      <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stats: { flexDirection: 'row', gap: Spacing.xs },
  stat: { flex: 1, alignItems: 'center', gap: 2, padding: Spacing.sm },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nav: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: `${100 / 7}%`, textAlign: 'center', paddingBottom: 4 },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 3 },
  day: { flex: 1, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  on: { backgroundColor: '#FF9F43' },
  ice: { backgroundColor: Colors.info + '22', borderWidth: 1, borderColor: Colors.info },
  today: { borderWidth: 2, borderColor: Colors.reward },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md },
  note: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
});
