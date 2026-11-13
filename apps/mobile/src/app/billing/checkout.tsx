import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import {
  CurrencyToggle,
  Divider,
  METHOD_ICON,
  PeriodToggle,
  PlanBadge,
  SummaryRow,
  TrustRow,
  methodLabel,
} from '@/components/billing/billing-ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useCheckout } from '@/lib/billing/checkout';
import { MONTHLY_CREDITS, PERIOD, PLANS, PROMOS, money, promoLabel } from '@/lib/billing/plans';
import { STORE_NAME, STORE_UI, storeManaged } from '@/lib/billing/store';
import { fmtDate, useBilling } from '@/lib/billing/use-billing';
import { useSession } from '@/lib/session';

/**
 * Screen 203: checkout. On the web: order summary, promo code and payment method before paying with
 * Flutterwave. On Android the plan is a Google Play subscription, so there is no method or promo to
 * choose: the price is Google Play's and the button opens its payment sheet.
 */
export default function CheckoutScreen() {
  const { t } = useTranslation('billing');
  const { user } = useSession();
  const c = useCheckout();
  const plan = PLANS[c.plan];
  const credits = MONTHLY_CREDITS[c.plan] * PERIOD[c.period].months;
  // Only app-store subscriptions renew by themselves; card, transfer and USSD payments are prepaid.
  const renews = STORE_UI || c.method?.type === 'store';
  const { billing } = useBilling();
  const [now] = useState(() => Date.now());
  const sub = billing?.subscription;
  const live = sub && sub.status !== 'expired' ? sub : null;
  // Mirrors the server: the same plan bought early is added after the current period. A store
  // subscription always starts (or switches) today.
  const from = !STORE_UI && live && live.plan === c.plan ? Math.max(now, live.currentPeriodEnd) : now;
  const until = fmtDate(from + PERIOD[c.period].days * 86400000);
  const switching = user?.plan === c.plan && from > now;
  const storePrice = c.priceText(c.plan, c.period);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('checkout.eyebrow')} title={t('checkout.title')} />

      <Card style={{ gap: Spacing.sm }}>
        <View style={styles.planRow}>
          <PlanBadge plan={c.plan} />
          <View style={{ flex: 1 }}>
            <Text variant="heading">{plan.name}</Text>
            <Text variant="small" color={Colors.textSecondary}>
              {c.period === 'month'
                ? t('checkout.credits', { count: credits, tagline: plan.tagline })
                : t('checkout.creditsPerMonth', {
                    count: credits,
                    monthly: MONTHLY_CREDITS[c.plan],
                    tagline: plan.tagline,
                  })}
            </Text>
          </View>
          <Text variant="small" color={Colors.primary} onPress={() => router.push('/billing')}>
            {t('checkout.change')}
          </Text>
        </View>
        <PeriodToggle
          value={c.period}
          onChange={(period) => {
            // A promo that doesn't fit the new period (e.g. monthly-only) is dropped rather than silently mischarged.
            const months = c.promo ? PROMOS[c.promo.code]?.months : undefined;
            c.set({ period, promo: months && !months.includes(period) ? null : c.promo });
          }}
        />
        {!STORE_UI && <CurrencyToggle />}
        {!STORE_UI && c.currency === 'USD' && (
          <Text variant="small" color={Colors.textMuted}>
            {t('currency.cardOnly')}
          </Text>
        )}
        {switching && (
          <Text variant="small" color={Colors.reward}>
            {t('checkout.switching', { plan: plan.name, period: PERIOD[c.period].lower })}
          </Text>
        )}
        {STORE_UI && live && !storeManaged(live) && (
          <Text variant="small" color={Colors.reward}>
            {t('store.replaces', {
              plan: PLANS[live.plan].name,
              date: fmtDate(live.currentPeriodEnd),
              store: STORE_NAME,
            })}
          </Text>
        )}
      </Card>

      {STORE_UI ? (
        <Card style={styles.line}>
          <Ionicons name={METHOD_ICON.store} size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{STORE_NAME}</Text>
            <Text variant="small" color={Colors.textSecondary}>
              {t('store.billed', { store: STORE_NAME })}
            </Text>
          </View>
        </Card>
      ) : (
        <>
          <Pressable
            onPress={() => router.push('/billing/promo')}
            accessibilityRole="button"
            accessibilityLabel={t('labels.promoCode')}>
            <Card style={styles.line}>
              <Ionicons name="pricetag" size={20} color={c.promo ? Colors.success : Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{c.promo ? c.promo.code : t('checkout.addPromo')}</Text>
                {c.promo && (
                  <Text variant="small" color={Colors.success}>
                    {promoLabel(c.promo, t)}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </Card>
          </Pressable>

          <Pressable
            onPress={() => router.push('/billing/method')}
            accessibilityRole="button"
            accessibilityLabel={t('labels.paymentMethod')}>
            <Card style={[styles.line, !c.method && { borderColor: Colors.primary }]}>
              <Ionicons name={c.method ? METHOD_ICON[c.method.type] : 'wallet'} size={20} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{c.method ? methodLabel(c.method, t) : t('checkout.chooseHow')}</Text>
                <Text variant="small" color={Colors.textSecondary}>
                  {c.method
                    ? renews
                      ? t('checkout.renews')
                      : t('checkout.oneOff')
                    : c.currency === 'USD'
                      ? t('method.card.title')
                      : Platform.OS === 'web'
                        ? t('checkout.methodsWeb')
                        : t('checkout.methodsApp')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </Card>
          </Pressable>
        </>
      )}

      {STORE_UI ? (
        <Card style={{ gap: Spacing.sm }}>
          {/* Google Play's price for this person's country: its currency, with tax already inside. */}
          <SummaryRow
            label={t('checkout.totalToday')}
            value={storePrice}
            strong
            hint={t(`checkout.then.${c.period}`, { price: storePrice, date: until })}
          />
        </Card>
      ) : (
        <Card style={{ gap: Spacing.sm }}>
          <SummaryRow
            label={t('labels.planPeriod', { plan: plan.name, period: PERIOD[c.period].label })}
            value={money(c.price, c.currency)}
          />
          {c.promo && (
            <SummaryRow
              label={t('checkout.promoLine', { code: c.promo.code, percent: c.promo.percent })}
              value={`−${money(c.discount, c.currency)}`}
              color={Colors.success}
            />
          )}
          <SummaryRow label={t('labels.vat')} value={money((c.total * 7.5) / 107.5, c.currency)} />
          <Divider />
          <SummaryRow
            label={t('checkout.totalToday')}
            value={money(c.total, c.currency)}
            strong
            hint={
              renews
                ? t(`checkout.then.${c.period}`, { price: money(c.price, c.currency), date: until })
                : t('checkout.accessUntil', { date: until })
            }
          />
        </Card>
      )}

      {STORE_UI ? (
        <Button
          title={t('store.subscribe', { price: storePrice })}
          icon="lock-closed"
          onPress={() => {
            c.set({ method: { type: 'store', label: STORE_NAME }, promo: null });
            router.push('/billing/processing');
          }}
        />
      ) : (
        <Button
          title={c.method ? t('checkout.pay', { amount: money(c.total, c.currency) }) : t('checkout.chooseMethod')}
          icon={c.method ? 'lock-closed' : undefined}
          onPress={() => router.push(c.method ? '/billing/processing' : '/billing/method')}
        />
      )}
      <TrustRow />
      <Text variant="small" color={Colors.textMuted} center style={{ fontSize: 12 }}>
        {STORE_UI
          ? t('store.terms', { store: STORE_NAME })
          : Platform.OS === 'web'
            ? t('checkout.termsWeb')
            : t('checkout.termsApp')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  planRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  line: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
