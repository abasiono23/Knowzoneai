import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Divider, ResultHero, SummaryRow, methodLabel } from '@/components/billing/billing-ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useCheckout } from '@/lib/billing/checkout';
import { MONTHLY_CREDITS, PERIOD, PLANS } from '@/lib/billing/plans';
import { openStoreSubscriptions, storeManaged } from '@/lib/billing/store';
import { daysUntil, fmtDate, useBilling } from '@/lib/billing/use-billing';
import { goBack } from '@/lib/navigation';

/** Screen 215: renewal reminder. What happens when the current period ends, and what you can change. */
export default function RenewalReminderScreen() {
  const { t } = useTranslation('billing');
  const { billing, setBilling } = useBilling();
  const checkout = useCheckout();
  const [now] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const sub = billing?.subscription;

  if (!billing) return <Screen withTabBar={false}>{null}</Screen>;
  if (!sub || sub.status === 'expired')
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('eyebrow')} title={t('renewal.title')} />
        <Text color={Colors.textSecondary}>{t('renewal.nothing')}</Text>
        <Button title={t('actions.seePlans')} onPress={() => router.replace('/billing')} />
      </Screen>
    );

  const p = PLANS[sub.plan];
  const days = daysUntil(sub.currentPeriodEnd, now);
  const price = checkout.priceText(sub.plan, sub.period);
  // A Google Play subscription is cancelled and resumed in Google Play.
  const inStore = storeManaged(sub);
  const openStore = () => {
    openStoreSubscriptions(sub.plan);
  };
  const autoRenewing = sub.status === 'active' && sub.autoRenew;
  const method = methodLabel(sub.method, t);
  const date = fmtDate(sub.currentPeriodEnd);
  const title = autoRenewing
    ? days <= 1
      ? t('renewal.renewsTomorrow', { plan: p.name })
      : t('renewal.renewsIn', { plan: p.name, count: days })
    : days <= 1
      ? t('renewal.endsTomorrow', { plan: p.name })
      : t('renewal.endsIn', { plan: p.name, count: days });
  const renewManually = () => {
    checkout.set({ plan: sub.plan, period: sub.period, promo: null, method: null });
    router.push('/billing/checkout');
  };
  const resume = async () => {
    setBusy(true);
    try {
      setBilling((await api.resumeSubscription()).billing);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} />
      <ResultHero
        icon={autoRenewing ? 'calendar' : 'alarm'}
        colors={autoRenewing ? p.colors : Gradients.reward}
        title={title}
        body={
          autoRenewing
            ? t('renewal.bodyAuto', { price, method, date })
            : sub.status === 'cancelled'
              ? t('renewal.bodyCancelled', { date })
              : t('renewal.bodyManual', { method, date, plan: p.name })
        }
      />
      <Card style={{ gap: Spacing.sm }}>
        <SummaryRow
          label={t('labels.plan')}
          value={t('labels.planPeriod', { plan: p.name, period: PERIOD[sub.period].label })}
        />
        <SummaryRow label={autoRenewing ? t('labels.renewalDate') : t('labels.endsOn')} value={date} />
        <SummaryRow label={t('labels.paymentMethod')} value={method} />
        <Divider />
        <SummaryRow
          label={autoRenewing ? t('labels.nextCharge') : t('labels.toRenew')}
          value={price}
          strong
        />
        <Text variant="small" color={Colors.textMuted}>
          {t('renewal.includes', { count: MONTHLY_CREDITS[sub.plan] * PERIOD[sub.period].months })}
        </Text>
      </Card>

      {autoRenewing ? (
        <>
          <Button title={t('actions.gotIt', { ns: 'common' })} onPress={() => goBack('/billing/manage')} />
          <Button variant="secondary" title={t('renewal.changePlan')} onPress={() => router.push('/billing')} />
          <Button
            variant="ghost"
            title={t('renewal.turnOff')}
            onPress={inStore ? openStore : () => router.push('/billing/cancel')}
          />
        </>
      ) : sub.status === 'cancelled' && (sub.method.type === 'card' || inStore) ? (
        <>
          <Button
            title={t('actions.keepPlan', { plan: p.name })}
            icon={inStore ? 'open-outline' : 'refresh'}
            loading={busy}
            onPress={inStore ? openStore : resume}
          />
          <Button variant="ghost" title={t('renewal.letEnd')} onPress={() => goBack('/billing/manage')} />
        </>
      ) : (
        <>
          <Button
            title={t('renewal.renewNow', { price })}
            icon="refresh"
            onPress={renewManually}
          />
          <Button
            variant="ghost"
            title={t('actions.notNow', { ns: 'common' })}
            onPress={() => goBack('/billing/manage')}
          />
        </>
      )}
      <Text variant="small" color={Colors.textMuted} center style={{ fontSize: 12 }}>
        {t('renewal.earlyNote')}
      </Text>
    </Screen>
  );
}
