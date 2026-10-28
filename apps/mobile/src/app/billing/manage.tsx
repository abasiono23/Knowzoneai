import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '@/components/ui/gradient';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { PlanBadge, methodLabel } from '@/components/billing/billing-ui';
import { SettingsLink, SettingsSection } from '@/components/settings/rows';
import { Button, Card, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { api } from '@/lib/api';
import { useCheckout } from '@/lib/billing/checkout';
import { MONTHLY_CREDITS, PERIOD, PLANS, money, priceOf } from '@/lib/billing/plans';
import { daysUntil, fmtDate, useBilling } from '@/lib/billing/use-billing';
import { useSession } from '@/lib/session';

/** Screen 209: subscription management. */
export default function ManageSubscriptionScreen() {
  const { t } = useTranslation('billing');
  const { user } = useSession();
  const { currency } = useCheckout();
  const { billing, error, setBilling } = useBilling();
  const [now] = useState(() => Date.now());
  const [resuming, setResuming] = useState(false);
  const go = (href: Href) => () => router.push(href);

  if (!billing || !user)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('eyebrow')} title={t('manage.title')} />
        {error && <Text color={Colors.danger}>{error}</Text>}
      </Screen>
    );

  const sub = billing.subscription;
  const live = sub && sub.status !== 'expired' ? sub : null;
  const pending = billing.payments.find(
    (p) => p.status === 'pending' && (p.transfer?.expiresAt ?? p.ussd?.expiresAt ?? 0) > now,
  );
  const days = live ? daysUntil(live.currentPeriodEnd, now) : 0;
  const ending = live && (live.status === 'cancelled' || !live.autoRenew);

  const resume = async () => {
    setResuming(true);
    try {
      const { billing: b } = await api.resumeSubscription();
      setBilling(b);
    } finally {
      setResuming(false);
    }
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('manage.title')} />

      {live ? (
        <LinearGradient
          colors={PLANS[live.plan].colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Text variant="label" color="rgba(255,255,255,0.85)">
                {t('manage.yourPlan')}
              </Text>
              <Text variant="title">{PLANS[live.plan].name}</Text>
            </View>
            <View style={styles.statusPill}>
              <View
                style={[styles.dot, { backgroundColor: live.status === 'active' ? Colors.success : Colors.reward }]}
              />
              <Text variant="label" style={{ fontSize: 11 }}>
                {live.status === 'active' ? t('manage.active') : t('manage.cancelled')}
              </Text>
            </View>
          </View>
          <Text variant="body">
            {t('manage.priceLine', {
              price: money(priceOf(live.plan, live.period, currency), currency),
              period: PERIOD[live.period].short,
              method: methodLabel(live.method, t),
            })}
          </Text>
          <View style={{ gap: 6 }}>
            <ProgressBar
              progress={Math.min(1, days / PERIOD[live.period].days)}
              height={8}
              colors={['#FFFFFF', 'rgba(255,255,255,0.7)']}
            />
            <Text variant="small" color="rgba(255,255,255,0.9)">
              {t(
                live.status === 'cancelled'
                  ? 'manage.endsOn'
                  : live.autoRenew
                    ? 'manage.renewsOn'
                    : 'manage.activeUntil',
                { date: fmtDate(live.currentPeriodEnd), count: days },
              )}
            </Text>
          </View>
        </LinearGradient>
      ) : (
        <Card style={{ gap: Spacing.sm }}>
          <View style={styles.heroTop}>
            <PlanBadge plan="FREE" />
            <Text variant="heading" style={{ flex: 1 }}>
              {t('manage.onFree')}
            </Text>
          </View>
          <Text variant="small" color={Colors.textSecondary}>
            {sub?.status === 'expired'
              ? t('manage.expiredBody', { plan: PLANS[sub.plan].name, date: fmtDate(sub.currentPeriodEnd) })
              : t('manage.freeBody')}
          </Text>
          <Button
            title={
              sub?.status === 'expired' ? t('manage.renew', { plan: PLANS[sub.plan].name }) : t('actions.seePlans')
            }
            icon="rocket"
            onPress={go(sub?.status === 'expired' ? '/billing/expired' : '/billing')}
          />
        </Card>
      )}

      {pending && (
        <Pressable
          onPress={go({ pathname: '/billing/pending', params: { id: pending.id } })}
          accessibilityRole="button">
          <Card style={[styles.alert, { borderColor: Colors.reward + '88' }]}>
            <Ionicons name="time" size={22} color={Colors.reward} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{t('manage.pendingTitle')}</Text>
              <Text variant="small" color={Colors.textSecondary}>
                {t('manage.pendingBody', {
                  amount: money(pending.amount, pending.currency),
                  method: methodLabel(pending.method, t).toLocaleLowerCase(),
                })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Card>
        </Pressable>
      )}

      {live && days <= 7 && (
        <Pressable onPress={go('/billing/renewal')} accessibilityRole="button">
          <Card style={[styles.alert, { borderColor: Colors.info + '88' }]}>
            <Ionicons name="notifications" size={22} color={Colors.info} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">
                {ending
                  ? days <= 1
                    ? t('manage.endsTomorrow')
                    : t('manage.endsIn', { count: days })
                  : days <= 1
                    ? t('manage.renewingTomorrow')
                    : t('manage.renewingIn', { count: days })}
              </Text>
              <Text variant="small" color={Colors.textSecondary}>
                {t('manage.seeNext')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Card>
        </Pressable>
      )}

      {live?.status === 'cancelled' && (
        <Card style={{ gap: Spacing.sm }}>
          <Text variant="small">
            {t('manage.cancelledNote', { plan: PLANS[live.plan].name, date: fmtDate(live.currentPeriodEnd) })}
          </Text>
          <Button title={t('manage.keepMyPlan')} icon="refresh" loading={resuming} onPress={resume} />
        </Card>
      )}

      <Card style={styles.credits}>
        <Ionicons name="flash" size={22} color={Colors.primary} />
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong">{t('units.credits', { ns: 'common', count: user.aiCredits })}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {live
              ? t('manage.creditsMonthly', {
                  credits: formatNumber(MONTHLY_CREDITS[live.plan]),
                  plan: PLANS[live.plan].name,
                })
              : t('manage.earnMore')}
          </Text>
        </View>
        <Text variant="small" color={Colors.primary} onPress={go('/referrals/history')}>
          {t('manage.history')}
        </Text>
      </Card>

      <SettingsSection title={t('manage.sectionPlan')}>
        <SettingsLink
          icon="swap-horizontal"
          label={live ? t('manage.changePlan') : t('actions.seePlans')}
          onPress={go('/billing')}
        />
        <SettingsLink icon="grid-outline" label={t('actions.comparePlans')} onPress={go('/billing/compare')} />
        <SettingsLink icon="pricetag-outline" label={t('labels.promoCode')} onPress={go('/billing/promo')} last />
      </SettingsSection>

      <SettingsSection title={t('manage.sectionPayments')}>
        <SettingsLink
          icon="receipt-outline"
          label={t('history.title')}
          value={billing.payments.length ? formatNumber(billing.payments.length) : undefined}
          onPress={go('/billing/history')}
          color={Colors.info}
        />
        {Platform.OS !== 'web' && (
          <SettingsLink
            icon="cloud-download-outline"
            label={t('actions.restore')}
            onPress={go('/billing/restore')}
            color={Colors.info}
          />
        )}
        <SettingsLink
          icon="help-buoy-outline"
          label={t('manage.refunds')}
          onPress={go('/billing/support')}
          color={Colors.info}
          last={live?.status !== 'active'}
        />
        {live?.status === 'active' && (
          <SettingsLink
            icon="close-circle-outline"
            label={t('manage.cancel')}
            onPress={go('/billing/cancel')}
            danger
            last
          />
        )}
      </SettingsSection>
      {live?.method.type === 'store' && (
        <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
          {t('manage.storeNote', { store: live.method.label })}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.sm },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  alert: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  credits: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
