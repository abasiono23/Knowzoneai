import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

import { ChoiceRow, PaymentStatus, ResultHero, methodLabel } from '@/components/billing/billing-ui';
import { Button, Card, Chip, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Fonts, Gradients, NoWebOutline, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { api, type SupportTicket } from '@/lib/api';
import { PLANS, money } from '@/lib/billing/plans';
import { fmtDate, useBilling } from '@/lib/billing/use-billing';
import { useSession } from '@/lib/session';

type Topic = SupportTicket['topic'];
type Icon = keyof typeof Ionicons.glyphMap;

const TOPICS: { id: Topic; icon: Icon; key: 'refund' | 'doubleCharge' | 'notActivated' | 'other' }[] = [
  { id: 'refund', icon: 'return-up-back', key: 'refund' },
  { id: 'double-charge', icon: 'copy', key: 'doubleCharge' },
  { id: 'not-activated', icon: 'alert-circle', key: 'notActivated' },
  { id: 'other', icon: 'chatbubble-ellipses', key: 'other' },
];

const FAQ = ['refundTime', 'failedMoney', 'transfer'] as const;
const QUICK = ['changedMind', 'mistake', 'notExpected'] as const;

/** Screen 218: refund and payment support. */
export default function BillingSupportScreen() {
  const { t } = useTranslation('billing');
  const params = useLocalSearchParams<{ topic?: Topic; payment?: string }>();
  const { setUser } = useSession();
  const { billing, setBilling } = useBilling();
  const [topic, setTopic] = useState<Topic | null>(params.topic ?? null);
  const [paymentId, setPaymentId] = useState<string | undefined>(params.payment || undefined);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);

  const payments = (billing?.payments ?? []).slice(0, 6);
  const needsPayment = topic === 'refund' || topic === 'double-charge';
  const canSend = !!topic && (!needsPayment || !!paymentId) && (topic !== 'other' || message.trim().length >= 10);
  const topicTitle = (id: Topic) => {
    const found = TOPICS.find((x) => x.id === id);
    return found ? t(`support.topics.${found.key}.title`) : t('support.request');
  };

  const send = async () => {
    if (!topic) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api.contactBillingSupport({ topic, paymentId, message: message.trim() });
      setUser(r.user);
      setBilling(r.billing);
      setTicket(r.ticket);
    } catch (e) {
      setError(errorText(e, t('support.error')));
    } finally {
      setBusy(false);
    }
  };

  if (ticket)
    return (
      <Screen withTabBar={false}>
        <ResultHero
          icon={ticket.status === 'resolved' ? 'checkmark' : 'mail'}
          colors={ticket.status === 'resolved' ? Gradients.mastery : Gradients.ai}
          title={ticket.status === 'resolved' ? t('support.approved') : t('support.received')}
          body={ticket.resolution ?? t('support.replySoon')}>
          <Text variant="label" color={Colors.textMuted}>
            {t('support.reference', { id: ticket.id })}
          </Text>
        </ResultHero>
        {ticket.status === 'resolved' && ticket.topic === 'refund' && (
          <Card>
            <Text variant="small" color={Colors.textSecondary}>
              {t('support.refundedNote')}
            </Text>
          </Card>
        )}
        <Button title={t('actions.done', { ns: 'common' })} onPress={() => router.dismissTo('/billing/manage')} />
      </Screen>
    );

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('actions.paymentHelp')} />

      <Text variant="heading">{t('support.what')}</Text>
      {TOPICS.map((tp) => (
        <ChoiceRow
          key={tp.id}
          icon={tp.icon}
          title={t(`support.topics.${tp.key}.title`)}
          body={t(`support.topics.${tp.key}.body`)}
          selected={topic === tp.id}
          onPress={() => setTopic(tp.id)}
        />
      ))}

      {topic && topic !== 'other' && (
        <View style={{ gap: Spacing.xs }}>
          <Text variant="heading">{t('support.which')}</Text>
          {payments.length === 0 ? (
            <Text variant="small" color={Colors.textSecondary}>
              {t('support.noPayments')}
            </Text>
          ) : (
            payments.map((p) => (
              <ChoiceRow
                key={p.id}
                title={`${money(p.amount, p.currency)} · ${PLANS[p.plan].name}`}
                body={`${fmtDate(p.at)} · ${methodLabel(p.method, t)} · ${p.reference}`}
                selected={paymentId === p.id}
                onPress={() => setPaymentId(p.id)}
                right={<PaymentStatus status={p.status} />}
              />
            ))
          )}
        </View>
      )}

      {topic && (
        <>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={topic === 'other' ? t('support.placeholderOther') : t('support.placeholderOptional')}
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={1000}
            accessibilityLabel={t('support.messageA11y')}
            style={styles.input}
          />
          {topic === 'refund' && (
            <View style={styles.chips}>
              {QUICK.map((q) => {
                const m = t(`support.quick.${q}`);
                return <Chip key={q} label={m} selected={message === m} onPress={() => setMessage(m)} />;
              })}
            </View>
          )}
          {error && (
            <Text variant="small" color={Colors.danger}>
              {error}
            </Text>
          )}
          <Button title={t('support.send')} icon="send" loading={busy} disabled={!canSend} onPress={send} />
        </>
      )}

      {!!billing?.tickets.length && (
        <View style={{ gap: Spacing.xs }}>
          <Text variant="heading">{t('support.yours')}</Text>
          {billing.tickets.map((tk) => (
            <Card key={tk.id} style={{ gap: 4 }}>
              <View style={styles.between}>
                <Text variant="bodyStrong">{topicTitle(tk.topic)}</Text>
                <Text
                  variant="label"
                  color={tk.status === 'resolved' ? Colors.success : Colors.reward}
                  style={{ fontSize: 11 }}>
                  {tk.status === 'resolved' ? t('support.resolved') : t('support.open')}
                </Text>
              </View>
              <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                {tk.id} · {fmtDate(tk.at)}
              </Text>
              {tk.resolution && (
                <Text variant="small" color={Colors.textSecondary}>
                  {tk.resolution}
                </Text>
              )}
            </Card>
          ))}
        </View>
      )}

      <View style={{ gap: Spacing.xs }}>
        <Text variant="heading">{t('support.common')}</Text>
        {FAQ.map((f) => (
          <Card key={f} style={{ gap: 4 }}>
            <Text variant="bodyStrong">{t(`support.faq.${f}.q`)}</Text>
            <Text variant="small" color={Colors.textSecondary}>
              {t(`support.faq.${f}.a`)}
            </Text>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 96,
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
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
