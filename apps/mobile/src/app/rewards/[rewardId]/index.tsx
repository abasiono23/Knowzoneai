import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { RewardRoute, type RewardState } from '@/components/rewards/reward-route';
import { Coin, RARITY, RewardPreview, TitleChip } from '@/components/rewards/reward-ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatDate } from '@/i18n';
import { rewardDescription, rewardName } from '@/lib/rewards/catalog';
import { useRewards } from '@/lib/rewards/store';
import { getItem } from '@/lib/world/avatar';
import { useWorld } from '@/lib/world/store';

const fmt = (iso: string) => formatDate(new Date(iso + 'T12:00:00'), { day: 'numeric', month: 'long' });

/** Screen 164: one reward: preview, price, requirements and what you can do with it. */
export default function RewardDetailScreen() {
  return <RewardRoute>{(s) => <Detail s={s} />}</RewardRoute>;
}

function Detail({ s }: { s: RewardState }) {
  const { reward: r, blocker, owned, count, coins, level } = s;
  const { equipped, equip } = useRewards();
  const { t } = useTranslation('rewards');
  const world = useWorld();
  const item = getItem(r.id);
  const isEquipped =
    r.kind === 'frame'
      ? equipped.frame === r.id
      : r.kind === 'title'
        ? equipped.title === r.id
        : r.kind === 'avatar' &&
          !!world.avatar &&
          [world.avatar.hat, world.avatar.glasses, world.avatar.outfit, world.avatar.background].includes(r.id);

  const toggleEquip = () => {
    if (r.kind === 'frame' || r.kind === 'title') equip(r.kind, isEquipped ? null : r.id);
    else if (r.kind === 'avatar' && item) world.equip(isEquipped ? null : item, item.slot);
  };

  const reqs: { ok: boolean; text: string }[] = [
    { ok: coins >= r.price || (owned && !r.repeatable), text: t('detail.reqCoins', { price: r.price, coins }) },
    ...(r.minLevel ? [{ ok: level >= r.minLevel, text: t('detail.reqLevel', { min: r.minLevel, level }) }] : []),
    ...(r.from && r.until
      ? [
          {
            ok: blocker !== 'expired' && blocker !== 'not-yet',
            text: t('detail.reqDates', { from: fmt(r.from), until: fmt(r.until) }),
          },
        ]
      : []),
  ];

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t(`kinds.${r.kind}`).toUpperCase()} />
      <LinearGradient colors={[RARITY[r.rarity] + '44', Colors.surface]} style={styles.hero}>
        <Animated.View entering={ZoomIn.springify()}>
          <RewardPreview reward={r} size={150} />
        </Animated.View>
        {r.kind === 'title' && <TitleChip titleId={r.id} />}
        <View style={[styles.rarity, { borderColor: RARITY[r.rarity] }]}>
          <Text variant="label" color={RARITY[r.rarity]}>
            {t(`rarity.${r.rarity}`)}
          </Text>
        </View>
        <Text variant="title" center>
          {rewardName(r)}
        </Text>
        <Text color={Colors.textSecondary} center>
          {rewardDescription(r)}
        </Text>
        <View style={styles.price}>
          <Coin size={26} />
          <Text variant="display" style={{ fontSize: 30 }}>
            {r.price}
          </Text>
        </View>
      </LinearGradient>

      <Card style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('detail.requirements')}</Text>
        {reqs.map((q) => (
          <View key={q.text} style={styles.req}>
            <Ionicons
              name={q.ok ? 'checkmark-circle' : 'close-circle'}
              size={18}
              color={q.ok ? Colors.success : Colors.danger}
            />
            <Text variant="small" style={{ flex: 1 }}>
              {q.text}
            </Text>
          </View>
        ))}
        {r.repeatable && count > 0 && (
          <Text variant="small" color={Colors.textMuted}>
            {t('detail.redeemedTimes', { count })}
          </Text>
        )}
      </Card>

      {owned && !r.repeatable ? (
        <>
          <Card style={styles.owned}>
            <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
            <Text variant="bodyStrong" style={{ flex: 1 }}>
              {t('detail.owned')}
            </Text>
          </Card>
          <Button
            title={isEquipped ? t('detail.unequip') : r.kind === 'avatar' ? t('detail.wear') : t('detail.equip')}
            icon={isEquipped ? 'remove-circle-outline' : 'checkmark'}
            variant={isEquipped ? 'secondary' : 'primary'}
            onPress={toggleEquip}
          />
        </>
      ) : blocker ? (
        <Button
          variant="secondary"
          icon="information-circle"
          title={
            blocker === 'insufficient'
              ? t('detail.needMore', { count: r.price - coins })
              : blocker === 'level'
                ? t('detail.unlocksAt', { level: r.minLevel })
                : blocker === 'expired'
                  ? t('detail.noLonger')
                  : t('detail.notYet')
          }
          onPress={() =>
            router.push({ pathname: '/rewards/[rewardId]/unavailable', params: { rewardId: r.id, reason: blocker } })
          }
        />
      ) : (
        <Button
          title={t('detail.redeemFor', { count: r.price })}
          icon="bag-handle"
          onPress={() => router.push(`/rewards/${r.id}/redeem` as Href)}
        />
      )}
      <Text variant="small" color={Colors.textMuted} center>
        {t('detail.cosmetic')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rarity: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.pill, borderWidth: 1 },
  price: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  req: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  owned: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderColor: Colors.success + '66' },
});
