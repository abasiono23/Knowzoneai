import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from '@/components/ui/gradient';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { Celebration } from '@/components/onboarding/celebration';
import { Coin } from '@/components/rewards/reward-ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { DAILY_CYCLE } from '@/lib/rewards/catalog';
import { useRewards } from '@/lib/rewards/store';

function untilMidnight(now: number) {
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const m = Math.max(0, Math.floor((end.getTime() - now) / 60000));
  return { hours: Math.floor(m / 60), minutes: String(m % 60).padStart(2, '0') };
}

/** Screen 162: daily rewards: a seven-day cycle that pauses, never resets, if you miss a day. */
export default function DailyRewardsScreen() {
  const { wallet, claimDaily } = useRewards();
  const { t } = useTranslation('rewards');
  const [busy, setBusy] = useState(false);
  const [got, setGot] = useState<{ coins: number; xp: number; day: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  if (!wallet)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('eyebrow')} title={t('daily.title')} />
      </Screen>
    );
  const claimed = wallet.daily.claimedToday;
  // Before claiming, `next` is today's day. After, today's day is the previous one.
  const todayIndex = claimed ? (wallet.daily.next + 6) % 7 : wallet.daily.next;

  const claim = async () => {
    setBusy(true);
    setErr(null);
    const r = await claimDaily();
    setBusy(false);
    if (typeof r === 'string') return setErr(r);
    setGot(r);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('eyebrow')} title={t('daily.title')} />
        <LinearGradient
          colors={claimed ? ['#0E8F6E', '#2DD4BF'] : Gradients.reward}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          {got ? (
            <Animated.View entering={ZoomIn.springify()} style={{ alignItems: 'center', gap: Spacing.xs }}>
              <Coin size={72} />
              <Text style={styles.big}>+{got.coins}</Text>
              <Text variant="bodyStrong" color={Colors.onBright}>
                {t('daily.gotXp', { xp: got.xp })}
              </Text>
            </Animated.View>
          ) : (
            <>
              <Text style={{ fontSize: 64, lineHeight: 76 }}>{claimed ? '✅' : '🎁'}</Text>
              <Text variant="title" color={Colors.onBright} center>
                {claimed ? t('daily.claimedToday') : t('daily.ready', { day: todayIndex + 1 })}
              </Text>
            </>
          )}
          <Text variant="small" color="rgba(11,16,38,0.8)" center>
            {claimed ? t('daily.nextIn', { time: t('daily.duration', untilMidnight(now)) }) : t('daily.openHint')}
          </Text>
        </LinearGradient>

        <View style={styles.week}>
          {DAILY_CYCLE.map((r, k) => {
            const done = k < todayIndex || (claimed && k === todayIndex);
            const isToday = k === todayIndex;
            return (
              <View
                key={k}
                style={[
                  styles.day,
                  k === 6 && styles.day7,
                  done && styles.dayDone,
                  isToday && !claimed && styles.dayNow,
                ]}>
                <Text variant="label" color={isToday ? Colors.reward : Colors.textMuted} style={{ fontSize: 10 }}>
                  {t('daily.day', { day: k + 1 })}
                </Text>
                {done ? (
                  <Ionicons name="checkmark-circle" size={k === 6 ? 30 : 22} color={Colors.success} />
                ) : k === 6 ? (
                  <Text style={{ fontSize: 28 }}>💰</Text>
                ) : (
                  <Coin size={22} />
                )}
                <Text variant="bodyStrong" style={{ fontSize: 13 }}>
                  +{r.coins}
                </Text>
              </View>
            );
          })}
        </View>

        {err && (
          <Animated.View entering={FadeIn}>
            <Text variant="small" color={Colors.danger} center>
              {err}
            </Text>
          </Animated.View>
        )}
        {!claimed && <Button title={t('daily.open')} icon="gift" loading={busy} onPress={claim} />}

        <Card style={styles.note}>
          <Ionicons name="calendar" size={18} color={Colors.primary} />
          <Text variant="small" style={{ flex: 1 }}>
            {t('daily.note')}
          </Text>
        </Card>
      </Screen>
      {got && <Celebration />}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.sm, padding: Spacing.xl, borderRadius: Radius.xl },
  big: { fontFamily: 'Manrope_800ExtraBold', fontSize: 48, lineHeight: 56, color: Colors.onBright },
  week: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  day: {
    width: '22.5%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  day7: { width: '47%', borderColor: Colors.reward + '88' },
  dayDone: { backgroundColor: Colors.successSoft, borderColor: Colors.success + '66' },
  dayNow: { borderColor: Colors.reward, backgroundColor: Colors.rewardSoft },
  note: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
});
