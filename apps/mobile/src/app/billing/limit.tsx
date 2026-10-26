import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ResultHero } from '@/components/billing/billing-ui';
import { Button, Card, ProgressBar, Screen, Text } from '@/components/ui';
import { Colors, Gradients, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { useCheckout } from '@/lib/billing/checkout';
import { MONTHLY_CREDITS, PLANS, money, priceOf } from '@/lib/billing/plans';
import { fmtDate, useBilling } from '@/lib/billing/use-billing';
import { goBack } from '@/lib/navigation';
import { useSession } from '@/lib/session';

type Icon = keyof typeof Ionicons.glyphMap;

const WAYS: { icon: Icon; key: 'invite' | 'tutor' | 'saved'; href: Href }[] = [
  { icon: 'gift', key: 'invite', href: '/referrals/invite' },
  { icon: 'chatbubbles', key: 'tutor', href: '/tutor' },
  { icon: 'albums', key: 'saved', href: '/saved' },
];

/** Screen 216: AI usage limit reached. Not enough credits for a study pack or video. */
export default function UsageLimitScreen() {
  const { t } = useTranslation('billing');
  // `what` is 'study pack' or 'video' (set by useCreditGate).
  const { need: rawNeed, what = 'study pack' } = useLocalSearchParams<{ need?: string; what?: string }>();
  const { user } = useSession();
  const { billing } = useBilling();
  const checkout = useCheckout();
  if (!user) return null;
  const need = Math.max(1, Number(rawNeed) || 1);
  const have = user.aiCredits;
  const plan = user.plan;
  const sub = billing?.subscription;
  const next = plan === 'FREE' ? 'PLUS' : plan === 'PLUS' ? 'PRO' : null;

  return (
    <Screen withTabBar={false}>
      <ResultHero
        icon="flash"
        colors={Gradients.reward}
        title={t('limit.title')}
        body={t(what === 'video' ? 'limit.bodyVideo' : 'limit.bodyStudyPack', {
          count: need,
          have: formatNumber(have),
        })}
      />
      <Card style={{ gap: Spacing.xs }}>
        <View style={styles.between}>
          <Text variant="small" color={Colors.textSecondary}>
            {t('limit.balance')}
          </Text>
          <Text variant="bodyStrong">{t('limit.needed', { have: formatNumber(have), need: formatNumber(need) })}</Text>
        </View>
        <ProgressBar progress={have / need} colors={Gradients.reward} />
        {sub && sub.status !== 'expired' && sub.autoRenew && (
          <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
            {t('limit.renewalCredits', {
              credits: formatNumber(MONTHLY_CREDITS[sub.plan]),
              date: fmtDate(sub.currentPeriodEnd),
            })}
          </Text>
        )}
      </Card>

      {next && (
        <Card style={{ gap: Spacing.sm, borderColor: Colors.primary + '66' }}>
          <Text variant="label" color={Colors.primary}>
            {PLANS[next].name.toUpperCase()}
          </Text>
          <Text variant="heading">{t('limit.monthly', { count: MONTHLY_CREDITS[next] })}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {t('limit.about', {
              count: MONTHLY_CREDITS[next],
              price: money(priceOf(next, 'month', checkout.currency), checkout.currency),
            })}
          </Text>
          <Button
            title={next === 'PLUS' ? t('actions.getPlus') : t('actions.getPro')}
            icon="rocket"
            onPress={() => {
              checkout.set({ plan: next, period: 'month' });
              router.replace('/billing/checkout');
            }}
          />
        </Card>
      )}

      <Text variant="heading">{t('limit.keepFree')}</Text>
      {WAYS.map((f) => (
        <Pressable key={f.key} onPress={() => router.replace(f.href)} accessibilityRole="button">
          <Card style={styles.row}>
            <Ionicons name={f.icon} size={22} color={Colors.success} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{t(`limit.ways.${f.key}.title`)}</Text>
              <Text variant="small" color={Colors.textSecondary}>
                {t(`limit.ways.${f.key}.body`)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Card>
        </Pressable>
      ))}
      <Button variant="ghost" title={t('actions.back', { ns: 'common' })} onPress={() => goBack('/home')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  between: { flexDirection: 'row', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
