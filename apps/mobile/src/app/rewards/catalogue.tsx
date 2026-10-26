import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ChoiceChip } from '@/components/personalize/choice-chip';
import { Coin, RARITY, RewardPreview } from '@/components/rewards/reward-ui';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { blockerFor, KINDS, REWARDS, rewardName, type RewardKind } from '@/lib/rewards/catalog';
import { useRewards } from '@/lib/rewards/store';
import { useSession } from '@/lib/session';
import { dayKey } from '@/lib/world/levels';

const SORTS = ['featured', 'low', 'high'] as const;

/** Screen 163: the reward catalogue. */
export default function RewardCatalogueScreen() {
  const { user } = useSession();
  const { owns } = useRewards();
  const [kind, setKind] = useState<RewardKind | 'all'>('all');
  const [sort, setSort] = useState<(typeof SORTS)[number]>('featured');
  const { t } = useTranslation('rewards');
  const [affordable, setAffordable] = useState(false);
  if (!user) return null;
  const today = dayKey();
  const rank = { epic: 0, rare: 1, common: 2 };
  const list = REWARDS.filter((r) => kind === 'all' || r.kind === kind)
    .filter((r) => !affordable || r.price <= user.coins)
    .sort((a, b) =>
      sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : rank[a.rarity] - rank[b.rarity],
    );

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        eyebrow={t('eyebrow')}
        title={t('catalogue.title')}
        right={
          <View style={styles.balance}>
            <Coin size={18} />
            <Text variant="bodyStrong">{user.coins}</Text>
          </View>
        }
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: Spacing.xs }}
        style={{ marginRight: -Spacing.md }}>
        <ChoiceChip label={t('catalogue.all')} selected={kind === 'all'} onPress={() => setKind('all')} />
        {KINDS.map((k) => (
          <ChoiceChip key={k} label={t(`kinds.${k}`)} selected={kind === k} onPress={() => setKind(k)} />
        ))}
      </ScrollView>
      <View style={styles.sortRow}>
        {SORTS.map((s) => (
          <ChoiceChip key={s} label={t(`catalogue.sorts.${s}`)} selected={sort === s} onPress={() => setSort(s)} />
        ))}
        <ChoiceChip
          label={t('catalogue.affordable')}
          emoji="🪙"
          selected={affordable}
          onPress={() => setAffordable(!affordable)}
        />
      </View>
      {list.length === 0 && (
        <Text variant="small" color={Colors.textMuted} center>
          {t('catalogue.empty')}
        </Text>
      )}
      <View style={styles.grid}>
        {list.map((r, k) => {
          const owned = owns(r.id);
          const blocker = blockerFor(r, { coins: user.coins, level: user.level, owned, today });
          const tag =
            blocker === 'owned'
              ? { text: t('catalogue.tags.owned'), color: Colors.success }
              : blocker === 'expired'
                ? { text: t('catalogue.tags.ended'), color: Colors.textMuted }
                : blocker === 'not-yet'
                  ? { text: t('catalogue.tags.soon'), color: Colors.info }
                  : blocker === 'level'
                    ? { text: t('catalogue.tags.level', { level: r.minLevel }), color: Colors.primary }
                    : r.until
                      ? { text: t('catalogue.tags.limited'), color: Colors.danger }
                      : null;
          return (
            <Animated.View key={r.id} entering={FadeInDown.delay(Math.min(k, 10) * 30)} style={styles.cell}>
              <Pressable
                onPress={() => router.push(`/rewards/${r.id}` as Href)}
                accessibilityRole="button"
                accessibilityLabel={
                  tag
                    ? t('catalogue.cardTagA11y', { name: rewardName(r), count: r.price, tag: tag.text.toLowerCase() })
                    : t('catalogue.cardA11y', { name: rewardName(r), count: r.price })
                }
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
                <View style={[styles.rarity, { backgroundColor: RARITY[r.rarity] }]} />
                {tag && (
                  <View style={[styles.tag, { backgroundColor: tag.color + '33' }]}>
                    <Text variant="label" color={tag.color} style={{ fontSize: 9 }}>
                      {tag.text}
                    </Text>
                  </View>
                )}
                <View style={{ opacity: blocker === 'expired' ? 0.4 : 1 }}>
                  <RewardPreview reward={r} size={76} />
                </View>
                <Text
                  variant="small"
                  center
                  numberOfLines={2}
                  style={{ fontFamily: 'Manrope_600SemiBold', minHeight: 36 }}>
                  {rewardName(r)}
                </Text>
                <View style={styles.price}>
                  {blocker === 'owned' && !r.repeatable ? (
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  ) : (
                    <>
                      <Coin size={15} />
                      <Text
                        variant="bodyStrong"
                        color={user.coins >= r.price ? Colors.text : Colors.textMuted}
                        style={{ fontSize: 14 }}>
                        {r.price}
                      </Text>
                    </>
                  )}
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  balance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  cell: { width: '47%', flexGrow: 1, maxWidth: 240 },
  card: {
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  rarity: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  tag: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  price: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
