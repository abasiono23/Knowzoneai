import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { Celebration } from '@/components/onboarding/celebration';
import { RewardRoute, type RewardState } from '@/components/rewards/reward-route';
import { Coin, RewardPreview } from '@/components/rewards/reward-ui';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { formatDate, formatTime } from '@/i18n';
import { rewardName } from '@/lib/rewards/catalog';
import { useRewards } from '@/lib/rewards/store';
import { useSession } from '@/lib/session';
import { getItem } from '@/lib/world/avatar';
import { useWorld } from '@/lib/world/store';

/** Screen 166: redemption confirmed. */
export default function RedemptionSuccessScreen() {
  return <RewardRoute>{(s) => <Success s={s} />}</RewardRoute>;
}

function Success({ s }: { s: RewardState }) {
  const { redemption: id } = useLocalSearchParams<{ redemption?: string }>();
  const { reward: r } = s;
  const { user } = useSession();
  const { wallet, equip } = useRewards();
  const { t } = useTranslation('rewards');
  const world = useWorld();
  const [worn, setWorn] = useState(false);
  const redemption = wallet?.redemptions.find((x) => x.id === id);
  const item = getItem(r.id);

  const wear = () => {
    if (r.kind === 'frame' || r.kind === 'title') equip(r.kind, r.id);
    else if (r.kind === 'avatar' && item) world.equip(item, item.slot);
    setWorn(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <AuthScreen
        back={false}
        center
        title={t('success.title')}
        subtitle={
          r.kind === 'boost'
            ? t('success.boostAdded', { name: rewardName(r) })
            : t('success.added', { name: rewardName(r) })
        }
        hero={
          <Animated.View entering={ZoomIn.springify().damping(10)} style={{ alignItems: 'center' }}>
            <RewardPreview reward={r} size={140} />
          </Animated.View>
        }
        footer={
          <>
            {r.kind !== 'boost' && (
              <Button
                title={worn ? t('success.equipped') : r.kind === 'avatar' ? t('success.wearNow') : t('detail.equip')}
                icon="checkmark"
                disabled={worn || (r.kind === 'avatar' && !world.avatar)}
                onPress={wear}
              />
            )}
            <Button
              variant="secondary"
              title={t('success.history')}
              icon="receipt-outline"
              onPress={() => router.replace('/rewards/redemptions')}
            />
            <Button
              variant="ghost"
              title={t('success.backToCatalogue')}
              onPress={() => router.replace('/rewards/catalogue')}
            />
          </>
        }>
        <Animated.View entering={FadeInDown.delay(300)}>
          <Card style={{ gap: Spacing.sm }}>
            <Row label={t('success.code')} value={redemption?.code ?? '…'} mono />
            <Row
              label={t('success.date')}
              value={
                redemption
                  ? `${formatDate(redemption.at, { day: 'numeric', month: 'numeric', year: 'numeric' })}, ${formatTime(redemption.at)}`
                  : '…'
              }
            />
            <View style={styles.row}>
              <Text variant="small" color={Colors.textSecondary}>
                {t('success.coinsLeft')}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Coin size={14} />
                <Text variant="bodyStrong">{user?.coins ?? 0}</Text>
              </View>
            </View>
          </Card>
        </Animated.View>
        {r.kind === 'avatar' && !world.avatar && (
          <Text variant="small" color={Colors.textMuted} center>
            {t('success.needAvatar')}
          </Text>
        )}
      </AuthScreen>
      <Celebration />
    </View>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.row}>
      <Text variant="small" color={Colors.textSecondary}>
        {label}
      </Text>
      <Text variant="bodyStrong" style={mono ? { letterSpacing: 1 } : undefined}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm },
});
