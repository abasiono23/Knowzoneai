import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { METHOD_ICON, PaymentStatus, methodLabel } from '@/components/billing/billing-ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { CURRENCIES, PERIOD, PLANS, money } from '@/lib/billing/plans';
import { fmtDate, useBilling } from '@/lib/billing/use-billing';

/** Screen 210: billing history. */
export default function BillingHistoryScreen() {
  const { t } = useTranslation('billing');
  const { billing, error } = useBilling();
  const payments = billing?.payments ?? [];
  // Naira and dollar payments are totalled separately ("₦9,000 + $4.99").
  const paidTotal =
    CURRENCIES.map((c) => {
      const sum = payments.filter((p) => p.status === 'paid' && p.currency === c).reduce((s, p) => s + p.amount, 0);
      return sum ? money(sum, c) : '';
    })
      .filter(Boolean)
      .join(' + ') || money(0, payments[0]?.currency ?? 'NGN');

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('history.title')} />
      {error && <Text color={Colors.danger}>{error}</Text>}

      {billing && payments.length === 0 && (
        <Card style={{ alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl }}>
          <Ionicons name="receipt-outline" size={36} color={Colors.textMuted} />
          <Text variant="heading">{t('history.emptyTitle')}</Text>
          <Text variant="small" color={Colors.textSecondary} center>
            {t('history.emptyBody')}
          </Text>
          <Button title={t('actions.seePlans')} onPress={() => router.push('/billing')} />
        </Card>
      )}

      {payments.length > 0 && (
        <Card style={styles.total}>
          <View style={{ flex: 1 }}>
            <Text variant="small" color={Colors.textSecondary}>
              {t('history.totalPaid')}
            </Text>
            <Text variant="title">{paidTotal}</Text>
          </View>
          <Text variant="small" color={Colors.textMuted}>
            {t('history.count', { count: payments.length })}
          </Text>
        </Card>
      )}

      {payments.map((p) => {
        const item = { plan: PLANS[p.plan].name, period: PERIOD[p.period].label };
        return (
          <Pressable
            key={p.id}
            onPress={() => router.push({ pathname: '/billing/receipt/[id]', params: { id: p.id } })}
            accessibilityRole="button"
            accessibilityLabel={t('history.rowA11y', {
              plan: PLANS[p.plan].name,
              amount: money(p.amount, p.currency),
              status: t(`status.${p.status}`),
              date: fmtDate(p.at),
            })}>
            {({ pressed }) => (
              <Card style={[styles.row, pressed && { opacity: 0.85 }]}>
                <View style={styles.icon}>
                  <Ionicons name={METHOD_ICON[p.method.type]} size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="bodyStrong">
                    {p.renewal ? t('history.renewalItem', item) : t('labels.planPeriod', item)}
                  </Text>
                  <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                    {fmtDate(p.at)} · {methodLabel(p.method, t)}
                  </Text>
                  <PaymentStatus status={p.status} />
                </View>
                <Text
                  variant="bodyStrong"
                  color={p.status === 'paid' ? Colors.text : Colors.textMuted}
                  style={p.status === 'failed' || p.status === 'refunded' ? styles.struck : undefined}>
                  {money(p.amount, p.currency)}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </Card>
            )}
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  total: { flexDirection: 'row', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  struck: { textDecorationLine: 'line-through' },
});
