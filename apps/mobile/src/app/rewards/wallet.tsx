import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Coin } from '@/components/rewards/reward-ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatDate, formatNumber } from '@/i18n';
import { CATEGORY_META, describeReason, type TxnCategory } from '@/lib/rewards/describe';
import { useRewards } from '@/lib/rewards/store';
import { useSession } from '@/lib/session';
import { dayKey } from '@/lib/world/levels';

const DAY = 86400000;

/** Screen 156: the coin wallet: balance, this week's flow and where coins came from. */
export default function CoinWalletScreen() {
  const { user } = useSession();
  const { wallet, loading, error, refresh } = useRewards();
  const { t } = useTranslation('rewards');
  const [now] = useState(() => Date.now());
  if (!user) return null;
  const txns = (wallet?.transactions ?? []).filter((x) => x.reason !== 'opening');
  const week = txns.filter((x) => now - x.at < 7 * DAY);
  const earned = week.filter((x) => x.coins > 0).reduce((n, x) => n + x.coins, 0);
  const spent = -week.filter((x) => x.coins < 0).reduce((n, x) => n + x.coins, 0);
  const days = Array.from({ length: 7 }, (_, k) => {
    const at = now - (6 - k) * DAY;
    const key = dayKey(at);
    const coins = txns.filter((x) => x.coins > 0 && dayKey(x.at) === key).reduce((n, x) => n + x.coins, 0);
    return { key, label: formatDate(at, { weekday: 'narrow' }), coins, today: k === 6 };
  });
  const max = Math.max(20, ...days.map((d) => d.coins));
  const byCategory = Object.entries(
    txns
      .filter((x) => x.coins > 0)
      .reduce<Record<string, number>>((acc, x) => {
        const c = describeReason(x.reason).category;
        acc[c] = (acc[c] ?? 0) + x.coins;
        return acc;
      }, {}),
  ).sort(([, a], [, b]) => b - a);
  const totalEarned = byCategory.reduce((n, [, v]) => n + v, 0);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('wallet.title')} />
      <LinearGradient colors={['#9C6B1E', '#FFC857']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <View style={styles.cardTop}>
          <Text variant="label" color="rgba(11,16,38,0.7)">
            {t('wallet.coins')}
          </Text>
          <Coin size={30} />
        </View>
        <Text style={styles.balance}>{formatNumber(user.coins)}</Text>
        <View style={styles.flow}>
          <View style={{ flex: 1 }}>
            <Text variant="label" color="rgba(11,16,38,0.65)">
              {t('wallet.earnedWeek')}
            </Text>
            <Text variant="heading" color={Colors.backgroundDeep}>
              +{earned}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="label" color="rgba(11,16,38,0.65)">
              {t('wallet.spentWeek')}
            </Text>
            <Text variant="heading" color={Colors.backgroundDeep}>
              {spent ? `−${spent}` : 0}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {error && (
        <Card style={{ gap: Spacing.xs }}>
          <Text variant="small" color={Colors.danger}>
            {error}
          </Text>
          <Button
            variant="secondary"
            title={t('actions.retry', { ns: 'common' })}
            loading={loading}
            onPress={refresh}
          />
        </Card>
      )}

      <Card style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('wallet.last7')}</Text>
        <View
          style={styles.chart}
          accessible
          accessibilityLabel={t('wallet.chartA11y', { values: days.map((d) => d.coins).join(', ') })}>
          {days.map((d, k) => (
            <View key={d.key} style={styles.col}>
              <Text variant="small" color={Colors.textMuted} style={{ fontSize: 10 }}>
                {d.coins || ''}
              </Text>
              <View style={styles.track}>
                <Animated.View
                  entering={FadeInUp.delay(k * 50)}
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(4, (d.coins / max) * 100)}%`,
                      backgroundColor: d.coins ? Colors.reward : Colors.surfaceRaised,
                    },
                  ]}
                />
              </View>
              <Text variant="small" color={d.today ? Colors.text : Colors.textMuted} style={{ fontSize: 11 }}>
                {d.label}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {byCategory.length > 0 && (
        <Card style={{ gap: Spacing.sm }}>
          <Text variant="heading">{t('wallet.sources')}</Text>
          <View style={styles.stack}>
            {byCategory.map(([c, v]) => (
              <View key={c} style={{ flex: v, backgroundColor: CATEGORY_META[c as TxnCategory].color }} />
            ))}
          </View>
          {byCategory.map(([c, v]) => {
            const m = CATEGORY_META[c as TxnCategory];
            return (
              <View key={c} style={styles.legend}>
                <View style={[styles.dot, { backgroundColor: m.color }]} />
                <Text variant="small" style={{ flex: 1 }}>
                  {t(`categories.${c as TxnCategory}`)}
                </Text>
                <Text variant="small" color={Colors.textSecondary}>
                  {v} · {Math.round((v / totalEarned) * 100)}%
                </Text>
              </View>
            );
          })}
        </Card>
      )}

      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
        <Button
          variant="secondary"
          icon="list"
          title={t('wallet.history')}
          style={{ flex: 1 }}
          onPress={() => router.push('/rewards/history')}
        />
        <Button
          variant="secondary"
          icon="bulb"
          title={t('wallet.earnMore')}
          style={{ flex: 1 }}
          onPress={() => router.push('/rewards/earn')}
        />
      </View>
      <Button icon="bag-handle" title={t('wallet.browse')} onPress={() => router.push('/rewards/catalogue')} />

      <Card style={styles.credits}>
        <Ionicons name="flash" size={20} color={Colors.primary} />
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong">{t('wallet.credits', { credits: user.aiCredits })}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {t('wallet.creditsNote')}
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.xs },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balance: { fontFamily: 'Manrope_800ExtraBold', fontSize: 48, lineHeight: 56, color: Colors.backgroundDeep },
  flow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(11,16,38,0.15)',
  },
  chart: { flexDirection: 'row', height: 140, gap: Spacing.xs, alignItems: 'flex-end' },
  col: { flex: 1, alignItems: 'center', gap: 4, height: '100%' },
  track: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 6 },
  stack: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', gap: 2 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  dot: { width: 10, height: 10, borderRadius: 5 },
  credits: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
});
