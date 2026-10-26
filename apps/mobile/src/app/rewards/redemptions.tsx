import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { Coin, RewardPreview } from '@/components/rewards/reward-ui';
import { Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { formatDate } from '@/i18n';
import { getReward, rewardName } from '@/lib/rewards/catalog';
import { useRewards } from '@/lib/rewards/store';

/** Screen 167: everything you've redeemed. */
export default function RedemptionHistoryScreen() {
  const { wallet, equipped } = useRewards();
  const { t } = useTranslation('rewards');
  const list = wallet?.redemptions ?? [];
  const spent = list.reduce((n, r) => n + r.cost, 0);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('redemptions.title')} />
      {list.length > 0 && (
        <Card style={styles.summary}>
          <View style={{ flex: 1 }}>
            <Text variant="heading">{list.length}</Text>
            <Text variant="small" color={Colors.textMuted}>
              {t('redemptions.count', { count: list.length })}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Coin size={16} />
              <Text variant="heading">{spent}</Text>
            </View>
            <Text variant="small" color={Colors.textMuted}>
              {t('redemptions.spent', { count: spent })}
            </Text>
          </View>
        </Card>
      )}
      {list.length === 0 ? (
        <EmptyState
          icon="gift-outline"
          title={wallet ? t('redemptions.empty') : t('status.loading', { ns: 'common' })}
          body={t('redemptions.emptyBody')}
          action={{ label: t('redemptions.browse'), onPress: () => router.push('/rewards/catalogue') }}
        />
      ) : (
        list.map((x) => {
          const r = getReward(x.rewardId);
          if (!r) return null;
          const on = equipped.frame === r.id || equipped.title === r.id;
          return (
            <Pressable
              key={x.id}
              onPress={() => router.push(`/rewards/${r.id}` as Href)}
              accessibilityRole="button"
              accessibilityLabel={t('redemptions.rowA11y', {
                name: rewardName(r),
                date: formatDate(x.at, { day: 'numeric', month: 'long', year: 'numeric' }),
              })}>
              <Card style={styles.row}>
                <RewardPreview reward={r} size={52} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="bodyStrong" numberOfLines={1}>
                    {rewardName(r)}
                  </Text>
                  <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                    {formatDate(x.at, { day: 'numeric', month: 'short', year: 'numeric' })} · {x.code}
                  </Text>
                  <View style={styles.status}>
                    <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                    <Text variant="small" color={Colors.success} style={{ fontSize: 11 }}>
                      {on ? t('redemptions.deliveredEquipped') : t('redemptions.delivered')}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Coin size={14} />
                  <Text variant="bodyStrong" color={Colors.textSecondary}>
                    −{x.cost}
                  </Text>
                </View>
              </Card>
            </Pressable>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', gap: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  status: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
