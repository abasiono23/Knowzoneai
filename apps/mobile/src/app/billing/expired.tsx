import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ResultHero } from '@/components/billing/billing-ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { useCheckout } from '@/lib/billing/checkout';
import { MONTHLY_CREDITS, PERIOD, PLANS, TUTOR_DAILY, money, priceOf } from '@/lib/billing/plans';
import { fmtDate, useBilling } from '@/lib/billing/use-billing';
import { useSession } from '@/lib/session';

/** Screen 214: subscription expired. */
export default function SubscriptionExpiredScreen() {
  const { t } = useTranslation('billing');
  const { user } = useSession();
  const { billing } = useBilling();
  const checkout = useCheckout();
  const sub = billing?.subscription;

  if (!billing || !user) return <Screen withTabBar={false}>{null}</Screen>;
  if (!sub || sub.status !== 'expired')
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('eyebrow')} title={t('manage.title')} />
        <Text color={Colors.textSecondary}>
          {sub ? t('expired.stillActive', { plan: PLANS[sub.plan].name }) : t('expired.noSub')}
        </Text>
        <Button title={t('expired.manage')} onPress={() => router.replace('/billing/manage')} />
      </Screen>
    );

  const p = PLANS[sub.plan];
  const changes = [
    {
      icon: 'chatbubbles' as const,
      text: t('expired.changes.tutor', {
        free: formatNumber(TUTOR_DAILY.FREE),
        was: formatNumber(TUTOR_DAILY[sub.plan]),
      }),
    },
    {
      icon: 'flash' as const,
      text: t('expired.changes.credits', {
        was: formatNumber(MONTHLY_CREDITS[sub.plan]),
        have: formatNumber(user.aiCredits),
      }),
    },
    { icon: 'videocam' as const, text: t('expired.changes.videos') },
  ];

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} />
      <ResultHero
        icon="hourglass"
        colors={['#262E66', '#4A3FA0']}
        title={t('expired.title', { plan: p.name })}
        body={t('expired.body', { date: fmtDate(sub.currentPeriodEnd) })}
      />
      <Card style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('expired.changedTitle')}</Text>
        {changes.map((c) => (
          <View key={c.icon} style={{ flexDirection: 'row', gap: Spacing.xs, alignItems: 'center' }}>
            <Ionicons name={c.icon} size={18} color={Colors.textMuted} />
            <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
              {c.text}
            </Text>
          </View>
        ))}
        <View style={{ flexDirection: 'row', gap: Spacing.xs, alignItems: 'center' }}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
          <Text variant="small" style={{ flex: 1 }}>
            {t('expired.kept')}
          </Text>
        </View>
      </Card>
      <Button
        title={t('expired.renew', {
          price: money(priceOf(sub.plan, sub.period, checkout.currency), checkout.currency),
          period: PERIOD[sub.period].short,
        })}
        icon="refresh"
        onPress={() => {
          checkout.set({ plan: sub.plan, period: sub.period, promo: null });
          router.push('/billing/checkout');
        }}
      />
      <Button variant="secondary" title={t('actions.seeAllPlans')} onPress={() => router.push('/billing')} />
      <Button variant="ghost" title={t('expired.continueFree')} onPress={() => router.dismissTo('/home')} />
    </Screen>
  );
}
