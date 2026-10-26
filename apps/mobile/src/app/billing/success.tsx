import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Divider, ResultHero, SummaryRow, methodLabel } from '@/components/billing/billing-ui';
import { Button, Card, Screen, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { MONTHLY_CREDITS, PERIOD, PLANS, money } from '@/lib/billing/plans';
import { fmtDate, useBilling } from '@/lib/billing/use-billing';

/** Screen 206: payment successful. */
export default function PaymentSuccessScreen() {
  const { t } = useTranslation('billing');
  const { id } = useLocalSearchParams<{ id: string }>();
  const { billing } = useBilling();
  const payment = billing?.payments.find((p) => p.id === id);
  const sub = billing?.subscription;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  if (!payment) return <Screen withTabBar={false}>{null}</Screen>;
  const plan = PLANS[payment.plan];
  const credits = MONTHLY_CREDITS[payment.plan] * PERIOD[payment.period].months;

  return (
    <Screen withTabBar={false}>
      <ResultHero
        icon="checkmark"
        colors={plan.colors}
        title={t('success.title', { plan: plan.name })}
        body={t('success.body', { count: credits, plan: plan.name.replace('Knowzone ', '') })}
      />
      <Card style={{ gap: Spacing.sm }}>
        <SummaryRow label={t('labels.amountPaid')} value={money(payment.amount, payment.currency)} strong />
        <Divider />
        <SummaryRow
          label={t('labels.plan')}
          value={t('labels.planPeriod', { plan: plan.name, period: PERIOD[payment.period].label })}
        />
        <SummaryRow label={t('labels.paidWith')} value={methodLabel(payment.method, t)} />
        {sub && (
          <SummaryRow
            label={sub.autoRenew ? t('labels.renewsOn') : t('labels.activeUntil')}
            value={fmtDate(sub.currentPeriodEnd)}
          />
        )}
        <SummaryRow label={t('labels.reference')} value={payment.reference} />
      </Card>
      <Text variant="small" color={Colors.textMuted} center>
        {t('success.note')}
      </Text>
      <Button title={t('success.start')} icon="sparkles" onPress={() => router.dismissTo('/home')} />
      <Button
        variant="secondary"
        title={t('success.viewReceipt')}
        onPress={() => router.push({ pathname: '/billing/receipt/[id]', params: { id: payment.id } })}
      />
    </Screen>
  );
}
