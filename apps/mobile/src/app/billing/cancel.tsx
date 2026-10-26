import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, TextInput, View } from 'react-native';

import { ChoiceRow, ResultHero, methodLabel } from '@/components/billing/billing-ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Fonts, NoWebOutline, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { api } from '@/lib/api';
import { useCheckout } from '@/lib/billing/checkout';
import { MONTHLY_CREDITS, PLANS, TUTOR_DAILY, money, perMonth } from '@/lib/billing/plans';
import { fmtDate, useBilling } from '@/lib/billing/use-billing';
import { goBack } from '@/lib/navigation';
import { useSession } from '@/lib/session';

/** `label` is sent to the server as the cancel reason and stays in English; `key` is what the screen shows. */
const REASONS = [
  { id: 'price', key: 'price', label: 'It’s too expensive' },
  { id: 'exams-done', key: 'examsDone', label: 'My exams are over' },
  { id: 'not-using', key: 'notUsing', label: 'I’m not using it enough' },
  { id: 'missing', key: 'missing', label: 'It’s missing something I need' },
  { id: 'other', key: 'other', label: 'Something else' },
] as const;

/** Screen 213: cancel subscription. Shows what changes, offers a cheaper option, asks why. */
export default function CancelSubscriptionScreen() {
  const { t } = useTranslation('billing');
  const { user } = useSession();
  const { billing } = useBilling();
  const checkout = useCheckout();
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sub = billing?.subscription;

  if (done)
    return (
      <Screen withTabBar={false}>
        <ResultHero
          icon="checkmark"
          colors={['#262E66', '#1A2150']}
          title={t('cancel.doneTitle')}
          body={t('cancel.doneBody', { date: fmtDate(done) })}
        />
        <Button title={t('actions.done', { ns: 'common' })} onPress={() => router.dismissTo('/billing/manage')} />
      </Screen>
    );

  if (!sub || sub.status !== 'active')
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('eyebrow')} title={t('cancel.title')} />
        {billing && (
          <Text color={Colors.textSecondary}>
            {sub?.status === 'cancelled' ? t('cancel.alreadyCancelled') : t('cancel.noActive')}
          </Text>
        )}
      </Screen>
    );

  const p = PLANS[sub.plan];
  const losing = [
    t('cancel.losing.tutor', { count: TUTOR_DAILY[sub.plan], free: TUTOR_DAILY.FREE }),
    t('cancel.losing.credits', { count: MONTHLY_CREDITS[sub.plan] }),
    t('cancel.losing.videos'),
    sub.plan === 'PRO' ? t('cancel.losing.papers') : t('cancel.losing.offline'),
  ];
  const store = methodLabel(sub.method, t);

  const cancel = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = REASONS.find((x) => x.id === reason)?.label ?? '';
      const { billing: b } = await api.cancelSubscription(note.trim() ? `${r}: ${note.trim()}` : r);
      setDone(b.subscription!.currentPeriodEnd);
    } catch (e) {
      setError(errorText(e, t('cancel.error')));
    } finally {
      setBusy(false);
    }
  };

  // A cheaper path for students who find it too expensive: a longer period or the smaller plan.
  const cheaper =
    sub.plan === 'PRO'
      ? {
          title: t('cancel.switchPlus', {
            price: money(perMonth('PLUS', 'month', checkout.currency), checkout.currency),
          }),
          plan: 'PLUS' as const,
          period: 'month' as const,
        }
      : sub.period === 'month'
        ? {
            title: t('cancel.payByTerm', {
              price: money(perMonth('PLUS', 'term', checkout.currency), checkout.currency),
            }),
            plan: 'PLUS' as const,
            period: 'term' as const,
          }
        : null;

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('cancel.title')} />
      <Text variant="body" color={Colors.textSecondary}>
        {t('cancel.intro', {
          name: user?.name.split(' ')[0] ?? '',
          plan: p.name,
          date: fmtDate(sub.currentPeriodEnd),
        })}
      </Text>

      <Card style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('cancel.loseTitle')}</Text>
        {losing.map((l) => (
          <View key={l} style={{ flexDirection: 'row', gap: Spacing.xs, alignItems: 'center' }}>
            <Ionicons name="close-circle" size={18} color={Colors.danger} />
            <Text variant="small" style={{ flex: 1 }}>
              {l}
            </Text>
          </View>
        ))}
        <View style={{ flexDirection: 'row', gap: Spacing.xs, alignItems: 'center' }}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
          <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
            {t('cancel.kept')}
          </Text>
        </View>
      </Card>

      {cheaper && sub.method.type !== 'store' && (
        <Card style={{ gap: Spacing.sm, borderColor: Colors.primary + '66' }}>
          <Text variant="bodyStrong">{t('cancel.payLess')}</Text>
          <Button
            variant="secondary"
            title={cheaper.title}
            onPress={() => {
              checkout.set({ plan: cheaper.plan, period: cheaper.period, promo: null });
              router.push('/billing/checkout');
            }}
          />
        </Card>
      )}

      <Text variant="heading">{t('cancel.why')}</Text>
      {REASONS.map((r) => (
        <ChoiceRow
          key={r.id}
          title={t(`cancel.reasons.${r.key}`)}
          selected={reason === r.id}
          onPress={() => setReason(r.id)}
        />
      ))}
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder={t('cancel.placeholder')}
        placeholderTextColor={Colors.textMuted}
        multiline
        maxLength={500}
        style={{
          minHeight: 80,
          backgroundColor: Colors.surface,
          borderRadius: Radius.md,
          borderWidth: 1,
          borderColor: Colors.border,
          padding: Spacing.md,
          color: Colors.text,
          fontFamily: Fonts.regular,
          fontSize: 15,
          textAlignVertical: 'top',
          ...NoWebOutline,
        }}
      />
      {error && (
        <Text variant="small" color={Colors.danger}>
          {error}
        </Text>
      )}
      <Button title={t('actions.keepPlan', { plan: p.name })} onPress={() => goBack('/billing/manage')} />
      {sub.method.type === 'store' ? (
        <>
          <Button
            variant="danger"
            title={t('cancel.cancelInStore', { store })}
            icon="open-outline"
            onPress={() =>
              Linking.openURL(
                Platform.OS === 'ios'
                  ? 'https://apps.apple.com/account/subscriptions'
                  : 'https://play.google.com/store/account/subscriptions',
              )
            }
          />
          <Text variant="small" color={Colors.textMuted} center style={{ fontSize: 12 }}>
            {t('cancel.storeNote', { store })}
          </Text>
        </>
      ) : (
        <Button variant="danger" title={t('cancel.title')} loading={busy} disabled={!reason} onPress={cancel} />
      )}
    </Screen>
  );
}
