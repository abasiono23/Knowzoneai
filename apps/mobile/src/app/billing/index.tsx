import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '@/components/ui/gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { CurrencyToggle, FeatureList, PeriodToggle, PlanBadge, TrustRow } from '@/components/billing/billing-ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useCheckout } from '@/lib/billing/checkout';
import { PERIOD, PLANS, money, perMonth, priceOf, type PaidPlan, type PlanId } from '@/lib/billing/plans';
import { useBilling } from '@/lib/billing/use-billing';
import { useSession } from '@/lib/session';

/** Screen 198: pricing. Free, Plus and Pro side by side with a billing-period switch. */
export default function PricingScreen() {
  const { t } = useTranslation('billing');
  const { user } = useSession();
  const { billing } = useBilling();
  const checkout = useCheckout();
  const current: PlanId = user?.plan ?? 'FREE';
  const sub = billing?.subscription;
  const period = checkout.period;

  const choose = (plan: PaidPlan) => {
    checkout.set({ plan, period });
    router.push('/billing/checkout');
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('pricing.eyebrow')} title={t('pricing.title')} />
      <Text variant="body" color={Colors.textSecondary}>
        {t('pricing.intro')}
      </Text>

      {sub && sub.status !== 'expired' && (
        <Pressable onPress={() => router.push('/billing/manage')} accessibilityRole="button">
          <Card style={styles.currentBanner}>
            <PlanBadge plan={sub.plan} />
            <Text variant="small" style={{ flex: 1 }}>
              {sub.status === 'cancelled' ? t('pricing.bannerCancelled') : t('pricing.bannerActive')}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Card>
        </Pressable>
      )}

      <PeriodToggle value={period} onChange={(p) => checkout.set({ period: p })} />
      <CurrencyToggle />

      {(['PLUS', 'PRO'] as PaidPlan[]).map((plan) => {
        const p = PLANS[plan];
        const isCurrent = current === plan && sub?.period === period;
        return (
          <View key={plan} style={plan === 'PLUS' && styles.popularWrap}>
            {plan === 'PLUS' && (
              <View style={styles.popular}>
                <Ionicons name="star" size={12} color={Colors.onBright} />
                <Text variant="label" color={Colors.onBright} style={{ fontSize: 11 }}>
                  {t('pricing.mostPopular')}
                </Text>
              </View>
            )}
            <Card style={[styles.plan, plan === 'PLUS' && { borderColor: Colors.primary }]}>
              <LinearGradient colors={p.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.planHead}>
                <View style={{ flex: 1 }}>
                  <Text variant="heading">{p.name}</Text>
                  <Text variant="small" color="rgba(255,255,255,0.85)">
                    {p.tagline}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="title">{money(priceOf(plan, period, checkout.currency), checkout.currency)}</Text>
                  <Text variant="small" color="rgba(255,255,255,0.85)">
                    {PERIOD[period].short}
                  </Text>
                </View>
              </LinearGradient>
              <View style={{ padding: Spacing.md, gap: Spacing.md }}>
                {period !== 'month' && (
                  <Text variant="small" color={Colors.success}>
                    {t('pricing.perMonthNote', {
                      price: money(perMonth(plan, period, checkout.currency), checkout.currency),
                      note: PERIOD[period].note,
                    })}
                  </Text>
                )}
                <FeatureList features={p.features.slice(0, 5)} />
                <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                  <Button
                    variant="secondary"
                    title={t('pricing.details')}
                    onPress={() => router.push({ pathname: '/billing/plan/[plan]', params: { plan } })}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title={
                      isCurrent
                        ? t('pricing.currentPlan')
                        : current === plan
                          ? t('pricing.switchPeriod')
                          : plan === 'PLUS'
                            ? t('actions.getPlus')
                            : t('actions.getPro')
                    }
                    disabled={isCurrent}
                    onPress={() => choose(plan)}
                    style={{ flex: 2 }}
                  />
                </View>
              </View>
            </Card>
          </View>
        );
      })}

      <Pressable
        onPress={() => router.push({ pathname: '/billing/plan/[plan]', params: { plan: 'FREE' } })}
        accessibilityRole="button">
        <Card style={styles.free}>
          <PlanBadge plan="FREE" />
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{PLANS.FREE.name}</Text>
            <Text variant="small" color={Colors.textSecondary}>
              {current === 'FREE'
                ? t('pricing.freeCurrent', { price: money(0, checkout.currency) })
                : t('pricing.freeNoCard', { price: money(0, checkout.currency) })}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </Card>
      </Pressable>

      <Button
        variant="secondary"
        title={t('pricing.compareAll')}
        icon="grid-outline"
        onPress={() => router.push('/billing/compare')}
      />
      <TrustRow />

      <View style={styles.links}>
        <Text variant="small" color={Colors.primary} onPress={() => router.push('/billing/promo')}>
          {t('pricing.havePromo')}
        </Text>
        {Platform.OS !== 'web' && (
          <Text variant="small" color={Colors.primary} onPress={() => router.push('/billing/restore')}>
            {t('actions.restore')}
          </Text>
        )}
        <Text variant="small" color={Colors.primary} onPress={() => router.push('/billing/support')}>
          {t('actions.paymentHelp')}
        </Text>
      </View>
      <Text variant="small" color={Colors.textMuted} center style={{ fontSize: 12 }}>
        {t('pricing.footer')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  currentBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  popularWrap: { paddingTop: 10 },
  popular: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.reward,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  plan: { padding: 0, overflow: 'hidden' },
  planHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingTop: Spacing.lg,
  },
  free: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  links: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: Spacing.lg },
});
