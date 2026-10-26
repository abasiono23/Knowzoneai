import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { RewardRoute, type RewardState } from '@/components/rewards/reward-route';
import { Coin, RewardPreview } from '@/components/rewards/reward-ui';
import { Button, Card, ProgressBar, Text } from '@/components/ui';
import { Colors, Gradients, Spacing } from '@/constants/theme';
import { formatDate } from '@/i18n';
import { REWARDS, rewardName, type Blocker } from '@/lib/rewards/catalog';
import { WAYS_TO_EARN } from '@/lib/rewards/describe';

const fmt = (iso: string) => formatDate(new Date(iso + 'T12:00:00'), { day: 'numeric', month: 'long' });

/** Screen 168: why a reward can't be redeemed (not enough coins, level, out of season, already owned). */
export default function RewardUnavailableScreen() {
  return <RewardRoute>{(s) => <Unavailable s={s} />}</RewardRoute>;
}

function Unavailable({ s }: { s: RewardState }) {
  const p = useLocalSearchParams<{ reason?: string; message?: string }>();
  const { reward: r, coins, level } = s;
  const { t } = useTranslation('rewards');
  const name = rewardName(r);
  const reason = (p.reason as Blocker) ?? s.blocker ?? 'insufficient';
  const need = Math.max(0, r.price - coins);
  const alternatives = REWARDS.filter((x) => x.id !== r.id && x.kind === r.kind && x.price <= coins && !x.until).slice(
    0,
    3,
  );

  const copy: Record<Blocker, { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }> = {
    insufficient: {
      icon: 'wallet-outline',
      title: t('unavailable.insufficientTitle'),
      body: t('unavailable.insufficientBody', { name, price: r.price, need }),
    },
    level: {
      icon: 'lock-closed-outline',
      title: t('unavailable.levelTitle', { level: r.minLevel }),
      body: t('unavailable.levelBody', { level, name }),
    },
    expired: {
      icon: 'time-outline',
      title: t('unavailable.expiredTitle'),
      body: r.until
        ? t('unavailable.expiredUntil', { name, date: fmt(r.until) })
        : t('unavailable.expiredBody', { name }),
    },
    'not-yet': {
      icon: 'hourglass-outline',
      title: t('unavailable.notYetTitle'),
      body: r.from ? t('unavailable.notYetFrom', { name, date: fmt(r.from) }) : t('unavailable.notYetBody', { name }),
    },
    owned: {
      icon: 'checkmark-circle-outline',
      title: t('unavailable.ownedTitle'),
      body: t('unavailable.ownedBody', { name }),
    },
  };
  const c = copy[reason] ?? copy.insufficient;

  return (
    <AuthScreen
      title={c.title}
      subtitle={p.message && reason !== 'insufficient' ? p.message : c.body}
      hero={
        <View style={styles.hero}>
          <View style={{ opacity: 0.45 }}>
            <RewardPreview reward={r} size={110} />
          </View>
          <View style={styles.badge}>
            <Ionicons name={c.icon} size={22} color={Colors.text} />
          </View>
        </View>
      }
      footer={
        <>
          {reason === 'insufficient' && (
            <Button title={t('unavailable.waysToEarn')} icon="bulb" onPress={() => router.replace('/rewards/earn')} />
          )}
          {reason === 'level' && (
            <Button
              title={t('unavailable.howLevels')}
              icon="trending-up"
              onPress={() => router.replace('/rewards/level')}
            />
          )}
          {reason === 'owned' && (
            <Button
              title={t('unavailable.viewRedemptions')}
              icon="receipt-outline"
              onPress={() => router.replace('/rewards/redemptions')}
            />
          )}
          <Button
            variant={reason === 'expired' || reason === 'not-yet' ? 'primary' : 'secondary'}
            title={t('success.backToCatalogue')}
            onPress={() => router.replace('/rewards/catalogue')}
          />
        </>
      }>
      {reason === 'insufficient' && (
        <Card style={{ gap: Spacing.sm }}>
          <View style={styles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Coin size={18} />
              <Text variant="bodyStrong">
                {coins} / {r.price}
              </Text>
            </View>
            <Text variant="small" color={Colors.textMuted}>
              {t('unavailable.percent', { percent: Math.round((coins / r.price) * 100) })}
            </Text>
          </View>
          <ProgressBar progress={coins / r.price} height={8} colors={Gradients.reward} />
          <Text variant="small" color={Colors.textSecondary}>
            {t('unavailable.quickest', {
              list: WAYS_TO_EARN.slice(0, 3)
                .map((w) => t(`earn.ways.${w.id}.title`).toLowerCase())
                .join(', '),
            })}
          </Text>
        </Card>
      )}
      {alternatives.length > 0 && reason !== 'owned' && (
        <View style={{ gap: Spacing.xs }}>
          <Text variant="label" color={Colors.textMuted}>
            {t('unavailable.canGetNow')}
          </Text>
          {alternatives.map((a) => (
            <Card key={a.id} style={styles.alt}>
              <RewardPreview reward={a} size={44} />
              <Text variant="small" style={{ flex: 1, fontFamily: 'Manrope_600SemiBold' }}>
                {rewardName(a)}
              </Text>
              <Button
                variant="secondary"
                title={`${a.price}`}
                icon="bag-handle"
                style={{ minWidth: 86 }}
                onPress={() => router.replace(`/rewards/${a.id}` as Href)}
              />
            </Card>
          ))}
        </View>
      )}
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    bottom: -4,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 2,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alt: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
});
