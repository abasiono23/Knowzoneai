import type { TFunction } from 'i18next';
import * as Print from 'expo-print';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';

import { Divider, PaymentStatus, SummaryRow, methodLabel } from '@/components/billing/billing-ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { Payment, User } from '@/lib/api';
import { PERIOD, PLANS, money } from '@/lib/billing/plans';
import { fmtDate, useBilling } from '@/lib/billing/use-billing';
import { useSession } from '@/lib/session';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const vatOf = (amount: number) => (amount * 7.5) / 107.5;
const DAY = 86400000;

/** One line of the plan, e.g. "Knowzone Plus · Monthly", marked when it was a renewal. */
const itemLabel = (p: Payment, t: TFunction<'billing'>) => {
  const item = { plan: PLANS[p.plan].name, period: PERIOD[p.period].label };
  return p.renewal ? t('receipt.renewalItem', item) : t('labels.planPeriod', item);
};

function receiptHtml(p: Payment, user: User, t: TFunction<'billing'>) {
  const row = (l: string, v: string, strong = false) =>
    `<tr><td>${esc(l)}</td><td class="r${strong ? ' b' : ''}">${esc(v)}</td></tr>`;
  return `<html><head><meta charset="utf-8"><style>
    body{font-family:Arial,sans-serif;color:#0B1026;margin:48px}
    .brand{font-weight:800;letter-spacing:4px;color:#6A45FF;font-size:14px}
    h1{font-size:28px;margin:24px 0 4px}.muted{color:#666;font-size:13px}
    table{width:100%;border-collapse:collapse;margin-top:28px}td{padding:10px 0;border-bottom:1px solid #eee;font-size:14px}
    .r{text-align:right}.b{font-weight:800;font-size:18px}.status{display:inline-block;padding:4px 10px;border-radius:99px;background:#eee;font-size:12px;font-weight:700}
    </style></head><body>
    <div class="brand">KNOWZONE AI</div><h1>${esc(t('receipt.html.title'))}</h1>
    <div class="muted">${esc(p.reference)} · ${esc(fmtDate(p.at))}</div>
    <p class="muted">${esc(t('receipt.html.billedTo', { name: user.name, email: user.email }))}</p>
    <span class="status">${esc(t(`status.${p.status}`).toLocaleUpperCase())}</span>
    <table>
    ${row(t('labels.planPeriod', { plan: PLANS[p.plan].name, period: PERIOD[p.period].label }), money(p.amount + p.discount, p.currency))}
    ${p.discount ? row(t('labels.promoLine', { code: p.promo ?? '' }), `−${money(p.discount, p.currency)}`) : ''}
    ${row(t('labels.vat'), money(vatOf(p.amount), p.currency))}
    ${row(t('labels.total'), money(p.amount, p.currency), true)}
    ${row(t('labels.paidWith'), methodLabel(p.method, t))}
    ${row(t('labels.servicePeriod'), `${fmtDate(p.at)} – ${fmtDate(p.at + PERIOD[p.period].days * DAY)}`)}
    ${p.refundedAt ? row(t('labels.refundedOn'), fmtDate(p.refundedAt)) : ''}
    </table>
    <p class="muted" style="margin-top:32px">${esc(t('receipt.html.questions', { reference: p.reference }))}</p>
    </body></html>`;
}

/** Screen 211: receipt detail, with PDF download / share. */
export default function ReceiptScreen() {
  const { t } = useTranslation('billing');
  const { id } = useLocalSearchParams<{ id: string }>();
  const { billing } = useBilling();
  const { user } = useSession();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [now] = useState(() => Date.now());
  const p = billing?.payments.find((x) => x.id === id);

  if (!p || !user)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('receipt.eyebrow')} />
        {billing && <Text color={Colors.textSecondary}>{t('receipt.notFound')}</Text>}
      </Screen>
    );

  const download = async () => {
    setBusy(true);
    setErr(null);
    try {
      const html = receiptHtml(p, user, t);
      if (Platform.OS === 'web') await Print.printAsync({ html });
      else {
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync())
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: t('receipt.pdfTitle'),
            UTI: 'com.adobe.pdf',
          });
      }
    } catch {
      setErr(t('receipt.pdfError'));
    } finally {
      setBusy(false);
    }
  };

  const refundable = p.status === 'paid' && !p.renewal && now - p.at < 7 * DAY;

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('receipt.eyebrow')} title={p.reference} />
      <Card style={{ gap: Spacing.sm }}>
        <View style={styles.head}>
          <View style={{ flex: 1 }}>
            <Text variant="small" color={Colors.textSecondary}>
              {fmtDate(p.at)}
            </Text>
            <Text variant="display">{money(p.amount, p.currency)}</Text>
          </View>
          <PaymentStatus status={p.status} />
        </View>
        <Divider />
        <SummaryRow label={itemLabel(p, t)} value={money(p.amount + p.discount, p.currency)} />
        {!!p.discount && (
          <SummaryRow
            label={t('labels.promoLine', { code: p.promo ?? '' })}
            value={`−${money(p.discount, p.currency)}`}
            color={Colors.success}
          />
        )}
        <SummaryRow label={t('labels.vat')} value={money(vatOf(p.amount), p.currency)} />
        <Divider />
        <SummaryRow label={t('labels.total')} value={money(p.amount, p.currency)} strong />
      </Card>

      <Card style={{ gap: Spacing.sm }}>
        <SummaryRow label={t('labels.paidWith')} value={methodLabel(p.method, t)} />
        <SummaryRow
          label={t('labels.servicePeriod')}
          value={`${fmtDate(p.at)} –\n${fmtDate(p.at + PERIOD[p.period].days * DAY)}`}
        />
        <SummaryRow label={t('labels.billedTo')} value={user.email} />
        {p.refundedAt && (
          <SummaryRow label={t('labels.refundedOn')} value={fmtDate(p.refundedAt)} color={Colors.info} />
        )}
        {p.failureReason && (
          <Text variant="small" color={Colors.danger}>
            {p.failureReason}
          </Text>
        )}
      </Card>

      {p.status === 'pending' && (
        <Button
          title={t('receipt.finish')}
          onPress={() => router.push({ pathname: '/billing/pending', params: { id: p.id } })}
        />
      )}
      {(p.status === 'paid' || p.status === 'refunded') && (
        <Button
          title={Platform.OS === 'web' ? t('receipt.printPdf') : t('receipt.downloadPdf')}
          icon="download-outline"
          loading={busy}
          onPress={download}
        />
      )}
      {err && (
        <Text variant="small" color={Colors.danger} center>
          {err}
        </Text>
      )}
      <Button
        variant="secondary"
        title={refundable ? t('receipt.refund') : t('receipt.problem')}
        onPress={() =>
          router.push({
            pathname: '/billing/support',
            params: { topic: refundable ? 'refund' : 'other', payment: p.id },
          })
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
});
