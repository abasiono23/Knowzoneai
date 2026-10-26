import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { levelHref, Stars, Wallet } from '@/components/world/world-ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { formatDate } from '@/i18n';
import { dailyLevel, dayKey } from '@/lib/world/levels';
import { useWorld } from '@/lib/world/store';

/** Hours and minutes until the next daily challenge. */
function untilMidnight(now: number) {
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const s = Math.max(0, Math.floor((end.getTime() - now) / 1000));
  return { hours: Math.floor(s / 3600), minutes: String(Math.floor((s % 3600) / 60)).padStart(2, '0') };
}

/** Screen 149: the daily challenge, with a gentle streak. */
export default function DailyChallengeScreen() {
  const { t } = useTranslation('world');
  const { dailyHistory, dailyDone, dailyStreak, freezes } = useWorld();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  const level = dailyLevel(dayKey(now));
  const today = dailyHistory[dayKey(now)];
  const week = Array.from({ length: 7 }, (_, k) => {
    const at = now - (6 - k) * 86400000;
    const key = dayKey(at);
    return { key, label: formatDate(at, { weekday: 'narrow' }), entry: dailyHistory[key], today: k === 6 };
  });
  const recent = Object.entries(dailyHistory)
    .filter(([, v]) => !v.frozen)
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .slice(0, 5);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('daily.title')} right={<Wallet compact />} />
      <LinearGradient
        colors={dailyDone ? ['#0E8F6E', '#2DD4BF'] : Gradients.reward}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}>
        <Animated.Text entering={ZoomIn.springify()} style={{ fontSize: 64, lineHeight: 76 }}>
          {dailyDone ? '✅' : '📅'}
        </Animated.Text>
        <Text variant="label" color="rgba(11,16,38,0.7)">
          {formatDate(now, { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
        </Text>
        <Text variant="title" color={Colors.backgroundDeep} center>
          {dailyDone ? t('daily.done') : t('daily.headline')}
        </Text>
        {dailyDone && today ? (
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Stars value={today.stars} size={24} />
            <Text variant="small" color="rgba(11,16,38,0.8)">
              {t('daily.doneBody', { count: today.score, ...untilMidnight(now) })}
            </Text>
          </View>
        ) : (
          <Text color="rgba(11,16,38,0.8)" center>
            {t('daily.body', {
              world: level.world.name,
              emoji: level.world.emoji,
              xp: level.xp,
              count: level.coins,
            })}
          </Text>
        )}
      </LinearGradient>

      {!dailyDone && (
        <Button title={t('daily.start')} icon="play" onPress={() => router.push(levelHref(level))} />
      )}

      <Card style={{ gap: Spacing.md }}>
        <View style={styles.between}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="flame" size={22} color="#FF9F43" />
            <Text variant="heading">{t('daily.streak', { count: dailyStreak })}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="snow" size={14} color={Colors.info} />
            <Text variant="small" color={Colors.textSecondary}>
              {t('daily.freezes', { count: freezes })}
            </Text>
          </View>
        </View>
        <View style={styles.week}>
          {week.map((d) => (
            <View key={d.key} style={{ alignItems: 'center', gap: 4 }}>
              <View
                style={[
                  styles.day,
                  d.entry && !d.entry.frozen && styles.dayDone,
                  d.entry?.frozen && styles.dayFrozen,
                  d.today && !d.entry && styles.dayToday,
                ]}>
                {d.entry ? (
                  <Ionicons
                    name={d.entry.frozen ? 'snow' : 'checkmark'}
                    size={16}
                    color={d.entry.frozen ? Colors.info : Colors.backgroundDeep}
                  />
                ) : null}
              </View>
              <Text variant="small" color={d.today ? Colors.text : Colors.textMuted} style={{ fontSize: 11 }}>
                {d.label}
              </Text>
            </View>
          ))}
        </View>
        <Text variant="small" color={Colors.textMuted}>
          {t('daily.freezeNote')}
        </Text>
      </Card>

      {recent.length > 0 && (
        <Card style={{ gap: Spacing.sm }}>
          <Text variant="heading">{t('daily.recent')}</Text>
          {recent.map(([key, v]) => (
            <View key={key} style={styles.between}>
              <Text variant="small">
                {formatDate(new Date(key + 'T12:00:00'), { weekday: 'short', day: 'numeric', month: 'short' })}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <Text variant="small" color={Colors.textMuted}>
                  {t('daily.points', { count: v.score })}
                </Text>
                <Stars value={v.stars} size={12} />
              </View>
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.xs, padding: Spacing.lg, borderRadius: Radius.xl },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDone: { backgroundColor: '#FF9F43' },
  dayFrozen: { backgroundColor: Colors.info + '33', borderWidth: 1, borderColor: Colors.info },
  dayToday: { borderWidth: 2, borderColor: '#FF9F43', borderStyle: 'dashed' },
});
