import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Divider, ResultHero } from '@/components/billing/billing-ui';
import { Button, Card, Screen, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { money } from '@/lib/billing/plans';
import { useBilling } from '@/lib/billing/use-billing';
import { USE_MOCKS } from '@/lib/config';
import { useSession } from '@/lib/session';

/** `copyValue` is what goes on the clipboard when it differs from the shown (formatted) value. */
function CopyLine({
  label,
  value,
  copyValue,
  big,
}: {
  label: string;
  value: string;
  copyValue?: string;
  big?: boolean;
}) {
  const { t } = useTranslation('billing');
  const [copied, setCopied] = useState(false);
  return (
    <Pressable
      onPress={() =>
        Clipboard.setStringAsync(copyValue ?? value.replace(/[₦,]/g, '')).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
      }
      accessibilityRole="button"
      accessibilityLabel={t('pending.copyA11y', { label, value })}
      style={styles.copyLine}>
      <View style={{ flex: 1 }}>
        <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
          {label}
        </Text>
        <Text variant={big ? 'title' : 'bodyStrong'} style={big ? { letterSpacing: 2 } : undefined}>
          {value}
        </Text>
      </View>
      <View style={styles.copy}>
        <Ionicons
          name={copied ? 'checkmark' : 'copy-outline'}
          size={16}
          color={copied ? Colors.success : Colors.primary}
        />
        <Text variant="label" color={copied ? Colors.success : Colors.primary} style={{ fontSize: 11 }}>
          {copied ? t('pending.copied') : t('pending.copy')}
        </Text>
      </View>
    </Pressable>
  );
}

/** Screen 208: payment pending. Bank-transfer or USSD details, a countdown, and a check once paid. */
export default function PaymentPendingScreen() {
  const { t } = useTranslation('billing');
  const { id } = useLocalSearchParams<{ id: string }>();
  const { billing } = useBilling();
  const { setUser } = useSession();
  const [now, setNow] = useState(() => Date.now());
  const [checking, setChecking] = useState(false);
  const [notYet, setNotYet] = useState(false);
  const payment = billing?.payments.find((p) => p.id === id);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Back from Flutterwave's payment page: ask the server straight away (and every few seconds until settled).
  const card = !!payment && payment.status === 'pending' && !payment.transfer && !payment.ussd;
  useEffect(() => {
    if (!card) return;
    let live = true;
    const run = async () => {
      try {
        const { payment: p, user } = await api.confirmPayment(id);
        if (!live) return;
        setUser(user);
        if (p.status === 'paid') router.replace({ pathname: '/billing/success', params: { id: p.id } });
        else if (p.status === 'failed') router.replace({ pathname: '/billing/failed', params: { id: p.id } });
      } catch {
        // Offline for a moment: the next check tries again.
      }
    };
    run();
    const timer = setInterval(run, 5000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [card, id, setUser]);

  if (!payment) return <Screen withTabBar={false}>{null}</Screen>;
  const expiresAt = payment.transfer?.expiresAt ?? payment.ussd?.expiresAt ?? now;
  const left = Math.max(0, expiresAt - now);
  const mins = Math.floor(left / 60000);
  const secs = Math.floor((left % 60000) / 1000);

  const check = async () => {
    setChecking(true);
    setNotYet(false);
    try {
      const { payment: p, user } = await api.confirmPayment(payment.id);
      setUser(user);
      if (p.status === 'paid') router.replace({ pathname: '/billing/success', params: { id: p.id } });
      else if (p.status === 'failed') router.replace({ pathname: '/billing/failed', params: { id: p.id } });
      else setNotYet(true);
    } catch {
      setNotYet(true);
    } finally {
      setChecking(false);
    }
  };

  if (card)
    return (
      <Screen withTabBar={false}>
        <ResultHero icon="card" colors={Gradients.reward} title={t('pending.titleCard')} body={t('pending.cardBody')} />
        {notYet && (
          <Card style={{ flexDirection: 'row', gap: Spacing.sm, borderColor: Colors.reward + '88' }}>
            <Ionicons name="hourglass" size={20} color={Colors.reward} />
            <Text variant="small" style={{ flex: 1 }}>
              {t('pending.cardNotYet')}
            </Text>
          </Card>
        )}
        <Button title={t('pending.sent')} icon="refresh" loading={checking} onPress={check} />
        {payment.checkoutUrl && (
          <Button
            variant="secondary"
            title={t('pending.reopen')}
            icon="card"
            onPress={() => Linking.openURL(payment.checkoutUrl!)}
          />
        )}
        <Button variant="ghost" title={t('pending.later')} onPress={() => router.replace('/billing/manage')} />
      </Screen>
    );

  return (
    <Screen withTabBar={false}>
      <ResultHero
        icon="time"
        colors={Gradients.reward}
        title={payment.transfer ? t('pending.titleTransfer') : t('pending.titleUssd')}
        body={
          left > 0 ? t('pending.expiresIn', { time: `${mins}:${String(secs).padStart(2, '0')}` }) : t('pending.expired')
        }
      />

      {payment.transfer && (
        <Card style={{ gap: Spacing.sm }}>
          <CopyLine
            label={t('pending.amount')}
            value={money(payment.amount, payment.currency)}
            copyValue={String(Math.round(payment.amount))}
            big
          />
          <Divider />
          <CopyLine label={t('pending.accountNumber')} value={payment.transfer.accountNumber} big />
          <Divider />
          <View>
            <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
              {t('pending.bankAccountName')}
            </Text>
            <Text variant="bodyStrong">
              {payment.transfer.bank} · {payment.transfer.accountName}
            </Text>
          </View>
        </Card>
      )}

      {payment.ussd && (
        <Card style={{ gap: Spacing.sm }}>
          <CopyLine label={t('pending.ussdCode', { bank: payment.ussd.bank })} value={payment.ussd.code} big />
          <Text variant="small" color={Colors.textSecondary}>
            {t('pending.ussdBody', { bank: payment.ussd.bank, amount: money(payment.amount, payment.currency) })}
          </Text>
          {Platform.OS !== 'web' && (
            <Button
              variant="secondary"
              title={t('pending.dialNow')}
              icon="call"
              onPress={() => Linking.openURL(`tel:${encodeURIComponent(payment.ussd!.code)}`)}
            />
          )}
        </Card>
      )}

      {notYet && (
        <Card style={{ flexDirection: 'row', gap: Spacing.sm, borderColor: Colors.reward + '88' }}>
          <Ionicons name="hourglass" size={20} color={Colors.reward} />
          <Text variant="small" style={{ flex: 1 }}>
            {t('pending.notYet')}
          </Text>
        </Card>
      )}

      <Button title={t('pending.sent')} icon="checkmark-done" loading={checking} onPress={check} />
      <Button
        variant="secondary"
        title={t('pending.payAnother')}
        onPress={() => {
          router.dismissTo('/billing/checkout');
          router.push('/billing/method');
        }}
      />
      <Button variant="ghost" title={t('pending.later')} onPress={() => router.replace('/billing/manage')} />
      <View style={styles.note}>
        <Text variant="small" color={Colors.textMuted} center style={{ fontSize: 12 }}>
          {USE_MOCKS ? t('pending.demoNote') : t('pending.safetyNote')}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  copyLine: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  copy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primarySoft,
  },
  note: { paddingHorizontal: Spacing.md },
});
