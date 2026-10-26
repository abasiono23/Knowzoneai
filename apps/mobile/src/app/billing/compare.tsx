import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { PlanBadge } from '@/components/billing/billing-ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { useCheckout } from '@/lib/billing/checkout';
import { PERIOD, TUTOR_DAILY, comparison, money, priceOf, type PlanId } from '@/lib/billing/plans';
import { useSession } from '@/lib/session';

const COLS: PlanId[] = ['FREE', 'PLUS', 'PRO'];

function Cell({ value, highlight }: { value: string | boolean; highlight?: boolean }) {
  if (value === true) return <Ionicons name="checkmark-circle" size={20} color={Colors.success} />;
  if (value === false) return <Ionicons name="remove" size={20} color={Colors.textMuted} />;
  return (
    <Text variant="small" center color={highlight ? Colors.text : Colors.textSecondary} style={{ fontSize: 12 }}>
      {value}
    </Text>
  );
}

/** Screen 201: plan comparison table. */
export default function CompareScreen() {
  const { t } = useTranslation('billing');
  const { user } = useSession();
  const checkout = useCheckout();
  const current = user?.plan ?? 'FREE';
  const period = checkout.period;

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('compare.eyebrow')} title={t('actions.comparePlans')} />
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <View style={[styles.row, styles.head]}>
          <View style={styles.label} />
          {COLS.map((c) => (
            <View key={c} style={[styles.col, c === 'PLUS' && styles.highlight]}>
              <PlanBadge plan={c} small />
              <Text variant="bodyStrong" style={{ fontSize: 13 }}>
                {c === 'FREE'
                  ? money(0, checkout.currency)
                  : money(priceOf(c, period, checkout.currency), checkout.currency)}
              </Text>
              <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
                {c === 'FREE' ? t('compare.forever') : PERIOD[period].short}
              </Text>
              {current === c && (
                <Text variant="label" color={Colors.success} style={{ fontSize: 9 }}>
                  {t('compare.current')}
                </Text>
              )}
            </View>
          ))}
        </View>
        {comparison(t).map((g) => (
          <View key={g.id}>
            <View style={styles.group}>
              <Text variant="label" color={Colors.textMuted}>
                {g.group.toLocaleUpperCase()}
              </Text>
            </View>
            {g.rows.map((r) => (
              <View key={r.id} style={styles.row}>
                <Text variant="small" style={[styles.label, { fontSize: 13 }]}>
                  {r.label}
                </Text>
                {r.values.map((v, i) => (
                  <View key={i} style={[styles.col, i === 1 && styles.highlight]}>
                    <Cell value={v} highlight={i > 0} />
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}
      </Card>
      <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
        {t('compare.footnote', { n: formatNumber(TUTOR_DAILY.PRO), period: PERIOD[period].lower })}
      </Text>
      {current !== 'PRO' && (
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {current === 'FREE' && (
            <Button
              title={t('actions.getPlus')}
              style={{ flex: 1 }}
              onPress={() => {
                checkout.set({ plan: 'PLUS' });
                router.push('/billing/checkout');
              }}
            />
          )}
          <Button
            variant={current === 'FREE' ? 'secondary' : 'primary'}
            title={t('actions.getPro')}
            style={{ flex: 1 }}
            onPress={() => {
              checkout.set({ plan: 'PRO' });
              router.push('/billing/checkout');
            }}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    minHeight: 48,
  },
  head: { borderTopWidth: 0, alignItems: 'stretch' },
  group: {
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.md,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  label: { flex: 1.6, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  col: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    gap: 2,
    alignSelf: 'stretch',
  },
  highlight: { backgroundColor: Colors.primarySoft },
});
