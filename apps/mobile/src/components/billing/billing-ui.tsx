import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '@/components/ui/gradient';
import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { Payment, PaymentMethodInfo } from '@/lib/api';
import { useCheckout } from '@/lib/billing/checkout';
import {
  CURRENCIES,
  PERIOD,
  PLANS,
  savingVsMonthly,
  type BillingPeriod,
  type Currency,
  type Feature,
  type PlanId,
} from '@/lib/billing/plans';

type Icon = keyof typeof Ionicons.glyphMap;

/** Monthly / Term / Yearly switch, with the saving on longer periods. */
export function PeriodToggle({ value, onChange }: { value: BillingPeriod; onChange: (p: BillingPeriod) => void }) {
  const { t } = useTranslation('billing');
  const { currency } = useCheckout();
  return (
    <View style={styles.toggle} accessibilityRole="radiogroup">
      {(Object.keys(PERIOD) as BillingPeriod[]).map((p) => {
        const on = p === value;
        const save = savingVsMonthly('PLUS', p, currency);
        return (
          <Pressable
            key={p}
            onPress={() => onChange(p)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            accessibilityLabel={
              save ? t('toggle.saveA11y', { period: PERIOD[p].label, percent: save }) : PERIOD[p].label
            }
            style={[styles.toggleItem, on && styles.toggleOn]}>
            <Text variant="bodyStrong" style={{ fontSize: 14 }} color={on ? Colors.text : Colors.textSecondary}>
              {PERIOD[p].label}
            </Text>
            {save > 0 && (
              <Text variant="label" style={{ fontSize: 10 }} color={on ? Colors.success : Colors.textMuted}>
                {t('toggle.save', { percent: save })}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

/** Naira / US dollars switch. Remembered on this device; dollar payments are by card. */
export function CurrencyToggle() {
  const { t } = useTranslation('billing');
  const { currency, set } = useCheckout();
  return (
    <View style={styles.currencyRow}>
      <Text variant="small" color={Colors.textSecondary}>
        {t('currency.label')}
      </Text>
      <View
        style={[styles.toggle, { flex: 1 }]}
        accessibilityRole="radiogroup"
        accessibilityLabel={t('currency.label')}>
        {CURRENCIES.map((c: Currency) => {
          const on = c === currency;
          return (
            <Pressable
              key={c}
              onPress={() => set({ currency: c })}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              style={[styles.toggleItem, { justifyContent: 'center' }, on && styles.toggleOn]}>
              <Text variant="bodyStrong" style={{ fontSize: 13 }} color={on ? Colors.text : Colors.textSecondary}>
                {t(`currency.${c}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Small gradient pill naming a plan. */
export function PlanBadge({ plan, small }: { plan: PlanId; small?: boolean }) {
  const { t } = useTranslation('billing');
  return (
    <LinearGradient
      colors={PLANS[plan].colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.badge, small && { paddingHorizontal: 8, paddingVertical: 2 }]}>
      <Text variant="label" style={small ? { fontSize: 10 } : undefined}>
        {plan === 'FREE' ? t('plans.freeBadge') : plan}
      </Text>
    </LinearGradient>
  );
}

export function FeatureList({ features, color = Colors.success }: { features: Feature[]; color?: string }) {
  return (
    <View style={{ gap: Spacing.xs }}>
      {features.map((f) => (
        <View key={f.text} style={styles.feature}>
          <View style={[styles.featureIcon, { backgroundColor: color + '22' }]}>
            <Ionicons name={f.icon} size={14} color={color} />
          </View>
          <Text variant="small" style={{ flex: 1 }}>
            {f.text}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Label / value line for summaries and receipts. */
export function SummaryRow({
  label,
  value,
  strong,
  color,
  hint,
}: {
  label: string;
  value: string;
  strong?: boolean;
  color?: string;
  hint?: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <View style={{ flex: 1 }}>
        <Text variant={strong ? 'bodyStrong' : 'small'} color={strong ? Colors.text : Colors.textSecondary}>
          {label}
        </Text>
        {hint && (
          <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
            {hint}
          </Text>
        )}
      </View>
      <Text variant={strong ? 'heading' : 'bodyStrong'} color={color ?? Colors.text} style={{ textAlign: 'right' }}>
        {value}
      </Text>
    </View>
  );
}

export const Divider = () => <View style={styles.divider} />;

const STATUS: Record<Payment['status'], { color: string; icon: Icon }> = {
  paid: { color: Colors.success, icon: 'checkmark-circle' },
  pending: { color: Colors.reward, icon: 'time' },
  failed: { color: Colors.danger, icon: 'close-circle' },
  refunded: { color: Colors.info, icon: 'return-up-back' },
};

export function PaymentStatus({ status }: { status: Payment['status'] }) {
  const { t } = useTranslation('billing');
  const s = STATUS[status];
  return (
    <View style={[styles.status, { backgroundColor: s.color + '22' }]}>
      <Ionicons name={s.icon} size={12} color={s.color} />
      <Text variant="label" color={s.color} style={{ fontSize: 11 }}>
        {t(`status.${status}`).toLocaleUpperCase()}
      </Text>
    </View>
  );
}

export const METHOD_ICON: Record<Payment['method']['type'], Icon> = {
  card: 'card',
  transfer: 'business',
  ussd: 'keypad',
  store: 'logo-apple-appstore',
};

/**
 * A payment method's name in the current language. The stored `label` (sent to and returned by the
 * server) stays in English; store names (App Store, Google Play) and unknown labels are shown as they are.
 */
export function methodLabel(m: PaymentMethodInfo, t: TFunction<'billing'>) {
  if (m.type === 'card') return t('methods.card');
  if (m.type === 'transfer' && m.label === 'Bank transfer') return t('methods.transfer');
  if (m.type === 'ussd' && m.label.startsWith('USSD · ')) return t('methods.ussd', { bank: m.label.slice(7) });
  return m.label;
}

/** Big round icon at the top of result screens (success, failed, pending, expired…). */
export function ResultHero({
  icon,
  colors,
  title,
  body,
  children,
}: {
  icon: Icon;
  colors: readonly [string, string];
  title: string;
  body?: string;
  children?: ReactNode;
}) {
  return (
    <View style={{ alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.lg }}>
      <View style={[styles.heroGlow, { backgroundColor: colors[0] + '33' }]}>
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroIcon}>
          <Ionicons name={icon} size={44} color={Colors.textOnAccent} />
        </LinearGradient>
      </View>
      <Text variant="title" center>
        {title}
      </Text>
      {body && (
        <Text variant="body" color={Colors.textSecondary} center>
          {body}
        </Text>
      )}
      {children}
    </View>
  );
}

/** Trust strip shown under prices and on checkout. */
export function TrustRow() {
  const { t } = useTranslation('billing');
  const items: { icon: Icon; text: string }[] = [
    { icon: 'lock-closed', text: t('trust.secure') },
    { icon: 'refresh', text: t('trust.cancel') },
    { icon: 'return-up-back', text: t('trust.refund') },
  ];
  return (
    <View style={styles.trust}>
      {items.map((i) => (
        <View key={i.text} style={styles.trustItem}>
          <Ionicons name={i.icon} size={14} color={Colors.textMuted} />
          <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
            {i.text}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Tappable card row used for choices (payment methods, cancel reasons, topics). */
export function ChoiceRow({
  icon,
  title,
  body,
  selected,
  onPress,
  right,
  color = Colors.primary,
}: {
  icon?: Icon;
  title: string;
  body?: string;
  selected?: boolean;
  onPress: () => void;
  right?: ReactNode;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={body ? `${title}. ${body}` : title}>
      {({ pressed }) => (
        <Card
          style={[
            styles.choice,
            selected && { borderColor: color, backgroundColor: color + '14' },
            pressed && { opacity: 0.85 },
          ]}>
          {icon && (
            <View style={[styles.choiceIcon, { backgroundColor: color + '22' }]}>
              <Ionicons name={icon} size={20} color={color} />
            </View>
          )}
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="bodyStrong">{title}</Text>
            {body && (
              <Text variant="small" color={Colors.textSecondary}>
                {body}
              </Text>
            )}
          </View>
          {right ?? (
            <Ionicons
              name={selected ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={selected ? color : Colors.textMuted}
            />
          )}
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
    gap: 4,
  },
  toggleItem: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: Radius.sm, minHeight: 48 },
  toggleOn: { backgroundColor: Colors.primarySoft, borderWidth: 1, borderColor: Colors.primary },
  currencyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.pill, alignSelf: 'flex-start' },
  feature: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  featureIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  divider: { height: 1, backgroundColor: Colors.border },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  heroGlow: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  heroIcon: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center' },
  trust: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: Spacing.md },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  choiceIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
