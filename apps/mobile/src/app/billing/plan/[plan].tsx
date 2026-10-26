import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { FeatureList, PeriodToggle, TrustRow } from '@/components/billing/billing-ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useCheckout } from '@/lib/billing/checkout';
import {
  MONTHLY_CREDITS,
  PERIOD,
  PLANS,
  TUTOR_DAILY,
  money,
  perMonth,
  priceOf,
  type PaidPlan,
  type PlanId,
} from '@/lib/billing/plans';
import { useSession } from '@/lib/session';

const FREE_LIMITS = ['tutor', 'video', 'offline', 'exams'] as const;

const FAQ = {
  PLUS: [
    { q: 'plan.faq.PLUS.creditsQ', a: 'plan.faq.PLUS.creditsA' },
    { q: 'plan.faq.PLUS.cancelQ', a: 'plan.faq.PLUS.cancelA' },
    { q: 'plan.faq.PLUS.refundQ', a: 'plan.faq.PLUS.refundA' },
  ],
  PRO: [
    { q: 'plan.faq.PRO.whoQ', a: 'plan.faq.PRO.whoA' },
    { q: 'plan.faq.PRO.fairQ', a: 'plan.faq.PRO.fairA' },
    { q: 'plan.faq.PRO.switchQ', a: 'plan.faq.PRO.switchA' },
  ],
} as const satisfies Record<PaidPlan, readonly { q: string; a: string }[]>;

/** Screens 199 and 200: Free plan details and Premium (Plus / Pro) plan details. */
export default function PlanDetailScreen() {
  const { t } = useTranslation('billing');
  const { plan: raw } = useLocalSearchParams<{ plan: string }>();
  const plan: PlanId = raw === 'PLUS' || raw === 'PRO' ? raw : 'FREE';
  const { user } = useSession();
  const checkout = useCheckout();
  const p = PLANS[plan];
  const current = (user?.plan ?? 'FREE') === plan;

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('plan.eyebrow')} title={p.name} />
      <LinearGradient colors={p.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Ionicons
          name={plan === 'FREE' ? 'leaf' : plan === 'PLUS' ? 'rocket' : 'trophy'}
          size={36}
          color={Colors.textOnAccent}
        />
        <Text variant="title">{p.name}</Text>
        <Text variant="body" color="rgba(255,255,255,0.9)">
          {p.tagline}
        </Text>
        {plan === 'FREE' ? (
          <Text variant="display">{money(0, checkout.currency)}</Text>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
            <Text variant="display">{money(priceOf(plan, checkout.period, checkout.currency), checkout.currency)}</Text>
            <Text variant="body" style={{ paddingBottom: 4 }}>
              {PERIOD[checkout.period].short}
            </Text>
          </View>
        )}
        {current && (
          <View style={styles.current}>
            <Text variant="label">{t('plan.yourCurrent')}</Text>
          </View>
        )}
      </LinearGradient>

      {plan !== 'FREE' && (
        <>
          <PeriodToggle value={checkout.period} onChange={(period) => checkout.set({ period })} />
          {checkout.period !== 'month' && (
            <Text variant="small" color={Colors.success} center>
              {t('plan.perMonthNote', {
                price: money(perMonth(plan, checkout.period, checkout.currency), checkout.currency),
                note: PERIOD[checkout.period].note,
              })}
            </Text>
          )}
        </>
      )}

      <Card style={{ gap: Spacing.sm }}>
        <Text variant="heading">{plan === 'FREE' ? t('plan.includedFree') : t('plan.included')}</Text>
        <FeatureList features={p.features} color={plan === 'FREE' ? Colors.success : Colors.primary} />
      </Card>

      {plan === 'FREE' ? (
        <>
          <Card style={{ gap: Spacing.sm }}>
            <Text variant="heading">{t('plan.limitsTitle')}</Text>
            {FREE_LIMITS.map((l) => (
              <View key={l} style={styles.limit}>
                <Ionicons name="remove-circle-outline" size={18} color={Colors.textMuted} />
                <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
                  {l === 'tutor' ? t('plan.limits.tutor', { count: TUTOR_DAILY.FREE }) : t(`plan.limits.${l}`)}
                </Text>
              </View>
            ))}
            <Text variant="small" color={Colors.textMuted}>
              {t('plan.limitsNote')}
            </Text>
          </Card>
          <Button
            title={t('plan.seePlus')}
            icon="rocket"
            onPress={() => router.push({ pathname: '/billing/plan/[plan]', params: { plan: 'PLUS' } })}
          />
          {current && (
            <Text variant="small" color={Colors.textMuted} center>
              {t('plan.onFree')}
            </Text>
          )}
        </>
      ) : (
        <>
          <View style={{ gap: Spacing.sm }}>
            <Text variant="heading">{t('plan.goodToKnow')}</Text>
            {FAQ[plan].map((f) => (
              <Card key={f.q} style={{ gap: 4 }}>
                <Text variant="bodyStrong">{t(f.q)}</Text>
                <Text variant="small" color={Colors.textSecondary}>
                  {t(f.a, {
                    credits: MONTHLY_CREDITS.PLUS,
                    questions: TUTOR_DAILY.PRO,
                  })}
                </Text>
              </Card>
            ))}
          </View>
          <Button
            title={t(plan === 'PLUS' ? 'plan.continuePlus' : 'plan.continuePro', {
              price: money(priceOf(plan, checkout.period, checkout.currency), checkout.currency),
            })}
            onPress={() => {
              checkout.set({ plan });
              router.push('/billing/checkout');
            }}
          />
          <TrustRow />
        </>
      )}
      <Button variant="ghost" title={t('plan.compareAll')} onPress={() => router.push('/billing/compare')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.xs, alignItems: 'flex-start' },
  current: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    marginTop: Spacing.xs,
  },
  limit: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
});
