import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '@/components/ui/gradient';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Coin, ProfileAvatar, RewardPreview, TitleChip } from '@/components/rewards/reward-ui';
import { Button, Card, ProgressBar, Screen, ScreenHeader, SectionHeader, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { useActivity } from '@/lib/rewards/activity';
import { formatNumber } from '@/i18n';
import { REWARDS, rewardName } from '@/lib/rewards/catalog';
import { CATEGORY_META, describeReason } from '@/lib/rewards/describe';
import { useRewards } from '@/lib/rewards/store';
import { useSession } from '@/lib/session';

/** Screen 155: rewards dashboard: coins, level, streak, daily reward and the catalogue. */
export default function RewardsDashboard() {
  const { user } = useSession();
  const { wallet } = useRewards();
  const { t } = useTranslation('rewards');
  const [now] = useState(() => Date.now());
  const activity = useActivity(now);
  if (!user) return null;
  const toNext = 250 - (user.xp % 250);
  const recent = (wallet?.transactions ?? []).slice(0, 4);
  const featured = REWARDS.filter((r) => r.kind !== 'avatar' || r.rarity !== 'common').slice(0, 6);
  const dailyReady = wallet && !wallet.daily.claimedToday;

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('dashboard.title')} />
      <LinearGradient
        colors={['#2A1B6B', '#6A45FF', '#B04CFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}>
        <View style={styles.heroTop}>
          <ProfileAvatar size={72} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="heading" color="#fff">
              {user.name.split(' ')[0]}
            </Text>
            <View style={{ alignSelf: 'flex-start' }}>
              <TitleChip />
            </View>
            <Text variant="small" color="rgba(255,255,255,0.8)">
              {t('dashboard.levelLine', { level: user.level, xp: toNext, next: user.level + 1 })}
            </Text>
            <ProgressBar progress={user.levelProgress} height={6} colors={Gradients.reward} />
          </View>
        </View>
        <Pressable
          onPress={() => router.push('/rewards/wallet')}
          accessibilityRole="button"
          accessibilityLabel={t('dashboard.balanceA11y', { count: user.coins })}
          style={styles.balance}>
          <Coin size={34} />
          <View style={{ flex: 1 }}>
            <Text variant="label" color="rgba(255,255,255,0.75)">
              {t('dashboard.balance')}
            </Text>
            <Text variant="display" color="#fff">
              {formatNumber(user.coins)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </Pressable>
      </LinearGradient>

      {dailyReady && (
        <Pressable
          onPress={() => router.push('/rewards/daily')}
          accessibilityRole="button"
          accessibilityLabel={t('dashboard.dailyA11y')}>
          <LinearGradient colors={Gradients.reward} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.daily}>
            <Text style={{ fontSize: 30 }}>🎁</Text>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong" color={Colors.onBright}>
                {t('dashboard.dailyReady')}
              </Text>
              <Text variant="small" color="rgba(11,16,38,0.75)">
                {t('dashboard.dailyDay', { day: wallet.daily.next + 1 })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.onBright} />
          </LinearGradient>
        </Pressable>
      )}

      <View style={styles.tiles}>
        {(
          [
            {
              icon: 'wallet',
              id: 'wallet',
              label: t('dashboard.tiles.wallet'),
              meta: t('units.coins', { ns: 'common', count: user.coins }),
              href: '/rewards/wallet',
              color: Colors.reward,
            },
            {
              icon: 'trending-up',
              id: 'level',
              label: t('dashboard.tiles.level'),
              meta: t('units.level', { ns: 'common', level: user.level }),
              href: '/rewards/level',
              color: Colors.primary,
            },
            {
              icon: 'flame',
              id: 'streak',
              label: t('dashboard.tiles.streak'),
              meta: t('time.days', { ns: 'common', count: activity.current }),
              href: '/rewards/streak',
              color: '#FF9F43',
            },
            {
              icon: 'medal',
              id: 'badges',
              label: t('dashboard.tiles.badges'),
              meta: t('actions.seeAll', { ns: 'common' }),
              href: '/rewards/badges',
              color: Colors.danger,
            },
            {
              icon: 'gift',
              id: 'daily',
              label: t('dashboard.tiles.daily'),
              meta: dailyReady ? t('dashboard.ready') : t('dashboard.claimed'),
              href: '/rewards/daily',
              color: Colors.success,
            },
            {
              icon: 'bulb',
              id: 'earn',
              label: t('dashboard.tiles.earn'),
              meta: t('dashboard.waysToEarn'),
              href: '/rewards/earn',
              color: Colors.info,
            },
          ] as const
        ).map((tile, k) => (
          <Animated.View key={tile.id} entering={FadeInDown.delay(k * 40)} style={styles.tileWrap}>
            <Pressable
              onPress={() => router.push(tile.href as Href)}
              accessibilityRole="button"
              accessibilityLabel={t('dashboard.tileA11y', { label: tile.label, meta: tile.meta })}
              style={({ pressed }) => [styles.tile, pressed && { opacity: 0.8 }]}>
              <View style={[styles.tileIcon, { backgroundColor: tile.color + '22' }]}>
                <Ionicons name={tile.icon} size={20} color={tile.color} />
              </View>
              <Text variant="bodyStrong" style={{ fontSize: 14 }}>
                {tile.label}
              </Text>
              <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
                {tile.meta}
              </Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>

      <View style={{ gap: Spacing.sm }}>
        <SectionHeader
          title={t('dashboard.spend')}
          action={t('dashboard.catalogue')}
          onAction={() => router.push('/rewards/catalogue')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: Spacing.sm, paddingRight: Spacing.md }}
          style={{ marginRight: -Spacing.md }}>
          {featured.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => router.push(`/rewards/${r.id}` as Href)}
              accessibilityRole="button"
              accessibilityLabel={t('dashboard.rewardA11y', { name: rewardName(r), count: r.price })}
              style={styles.reward}>
              <RewardPreview reward={r} size={72} />
              <Text variant="small" numberOfLines={1} style={{ fontFamily: 'Manrope_600SemiBold' }}>
                {rewardName(r)}
              </Text>
              <View style={styles.price}>
                <Coin size={14} />
                <Text variant="small" style={{ fontSize: 12 }}>
                  {r.price}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Card style={{ gap: Spacing.sm }}>
        <SectionHeader
          title={t('dashboard.recent')}
          action={t('dashboard.history')}
          onAction={() => router.push('/rewards/history')}
        />
        {recent.length === 0 && (
          <Text variant="small" color={Colors.textMuted}>
            {t('dashboard.noActivity')}
          </Text>
        )}
        {recent.map((txn) => {
          const d = describeReason(txn.reason);
          const m = CATEGORY_META[d.category];
          return (
            <View key={txn.id} style={styles.txn}>
              <View style={[styles.txnIcon, { backgroundColor: m.color + '22' }]}>
                <Ionicons name={m.icon} size={16} color={m.color} />
              </View>
              <Text variant="small" style={{ flex: 1 }} numberOfLines={1}>
                {d.label}
              </Text>
              <Text
                variant="bodyStrong"
                color={txn.coins < 0 ? Colors.danger : txn.coins > 0 ? Colors.success : Colors.textSecondary}
                style={{ fontSize: 14 }}>
                {txn.coins !== 0
                  ? `${txn.coins > 0 ? '+' : ''}${txn.coins}`
                  : `+${t('units.xp', { ns: 'common', count: txn.xp })}`}
              </Text>
            </View>
          );
        })}
      </Card>

      <Button
        variant="secondary"
        icon="receipt-outline"
        title={t('dashboard.myRedemptions')}
        onPress={() => router.push('/rewards/redemptions')}
      />
      <Text variant="small" color={Colors.textMuted} center>
        {t('coinsFootnote')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.md },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  balance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  daily: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.lg },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  tileWrap: { width: '31.5%', flexGrow: 1 },
  tile: {
    gap: 4,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tileIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  reward: {
    width: 128,
    alignItems: 'center',
    gap: 6,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  price: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  txn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  txnIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
