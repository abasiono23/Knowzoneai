import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { RewardRoute, type RewardState } from '@/components/rewards/reward-route';
import { Coin, RewardPreview } from '@/components/rewards/reward-ui';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { rewardDescription, rewardName } from '@/lib/rewards/catalog';
import { useRewards } from '@/lib/rewards/store';

const REASON: Record<number, string> = { 402: 'insufficient', 403: 'level', 409: 'owned', 410: 'expired' };

/** Screen 165: confirm a redemption, with the balance before and after. */
export default function RedeemScreen() {
  return <RewardRoute>{(s) => <Redeem s={s} />}</RewardRoute>;
}

function Redeem({ s }: { s: RewardState }) {
  const { reward: r, blocker, coins } = s;
  const { redeem } = useRewards();
  const { t } = useTranslation('rewards');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (blocker && !busy)
    return (
      <Redirect href={{ pathname: '/rewards/[rewardId]/unavailable', params: { rewardId: r.id, reason: blocker } }} />
    );

  const confirm = async () => {
    setBusy(true);
    setError(null);
    const res = await redeem(r.id);
    if (res.ok) {
      router.replace({
        pathname: '/rewards/[rewardId]/success',
        params: { rewardId: r.id, redemption: res.redemption.id },
      });
      return;
    }
    setBusy(false);
    if (REASON[res.status])
      router.replace({
        pathname: '/rewards/[rewardId]/unavailable',
        params: { rewardId: r.id, reason: REASON[res.status], message: res.message },
      });
    else setError(res.message);
  };

  return (
    <AuthScreen
      title={t('redeem.title')}
      subtitle={t('redeem.subtitle')}
      footer={
        <>
          {error && (
            <Text variant="small" color={Colors.danger} center>
              {error}
            </Text>
          )}
          <Button
            title={t('detail.redeemFor', { count: r.price })}
            icon="checkmark-circle"
            loading={busy}
            onPress={confirm}
          />
          <Button
            variant="ghost"
            title={t('actions.cancel', { ns: 'common' })}
            disabled={busy}
            onPress={() => router.back()}
          />
        </>
      }>
      <Card style={styles.item}>
        <RewardPreview reward={r} size={72} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="heading">{rewardName(r)}</Text>
          <Text variant="small" color={Colors.textSecondary} numberOfLines={2}>
            {rewardDescription(r)}
          </Text>
        </View>
      </Card>
      <Card style={{ gap: Spacing.sm }}>
        <Row label={t('redeem.balance')} value={coins} />
        <Row label={t('redeem.cost')} value={-r.price} />
        <View style={styles.divider} />
        <Row label={t('redeem.after')} value={coins - r.price} strong />
      </Card>
      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
        <Text variant="small" color={Colors.textMuted} style={{ flex: 1 }}>
          {r.repeatable ? t('redeem.boostNote') : t('redeem.keepNote')}
        </Text>
      </View>
    </AuthScreen>
  );
}

function Row({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text variant={strong ? 'bodyStrong' : 'body'} color={strong ? Colors.text : Colors.textSecondary}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Coin size={16} />
        <Text variant={strong ? 'heading' : 'bodyStrong'} color={value < 0 ? Colors.danger : Colors.text}>
          {value < 0 ? `−${Math.abs(value)}` : value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  divider: { height: 1, backgroundColor: Colors.border },
  note: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'flex-start' },
});
