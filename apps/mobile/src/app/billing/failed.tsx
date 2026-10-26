import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ResultHero } from '@/components/billing/billing-ui';
import { Button, Card, Screen, Text } from '@/components/ui';
import { Colors, Gradients, Spacing } from '@/constants/theme';
import { useCheckout } from '@/lib/billing/checkout';
import { money } from '@/lib/billing/plans';
import { useBilling } from '@/lib/billing/use-billing';

const TIPS = ['balance', 'limit', 'other'] as const;

/** Screen 207: payment failed. Nothing was charged; offers retry, another method or help. */
export default function PaymentFailedScreen() {
  const { t } = useTranslation('billing');
  const { id, message } = useLocalSearchParams<{ id?: string; message?: string }>();
  const { billing } = useBilling();
  const c = useCheckout();
  const payment = id ? billing?.payments.find((p) => p.id === id) : undefined;
  const reason = payment?.failureReason ?? message ?? t('failed.defaultReason');

  return (
    <Screen withTabBar={false}>
      <ResultHero icon="close" colors={Gradients.streak} title={t('failed.title')} body={reason} />
      <Card style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', borderColor: Colors.success + '55' }}>
        <Ionicons name="shield-checkmark" size={22} color={Colors.success} />
        <Text variant="small" style={{ flex: 1 }}>
          {payment
            ? t('failed.notChargedAmount', { amount: money(payment.amount, payment.currency) })
            : t('failed.notCharged')}
        </Text>
      </Card>
      <Card style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('failed.tipsTitle')}</Text>
        {TIPS.map((tip) => (
          <View key={tip} style={{ flexDirection: 'row', gap: Spacing.xs }}>
            <Ionicons name="bulb-outline" size={18} color={Colors.reward} />
            <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
              {t(`failed.tips.${tip}`)}
            </Text>
          </View>
        ))}
      </Card>
      <Button
        title={t('actions.retry', { ns: 'common' })}
        icon="refresh"
        onPress={() => router.replace('/billing/processing')}
        disabled={!c.method}
      />
      <Button
        variant="secondary"
        title={t('failed.anotherMethod')}
        onPress={() => {
          router.dismissTo('/billing/checkout');
          router.push('/billing/method');
        }}
      />
      <Button
        variant="ghost"
        title={t('actions.contactSupport')}
        onPress={() => router.push({ pathname: '/billing/support', params: { topic: 'other', payment: id ?? '' } })}
      />
    </Screen>
  );
}
