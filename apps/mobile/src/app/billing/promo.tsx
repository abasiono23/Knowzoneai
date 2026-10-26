import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Fonts, NoWebOutline, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { api } from '@/lib/api';
import { useCheckout } from '@/lib/billing/checkout';
import { PERIOD, PLANS, money, promoLabel } from '@/lib/billing/plans';
import { USE_MOCKS } from '@/lib/config';
import { goBack } from '@/lib/navigation';

/** Screen 217: discount / promo code. Validates against the plan and period in checkout. */
export default function PromoCodeScreen() {
  const { t } = useTranslation('billing');
  const c = useCheckout();
  const [code, setCode] = useState(c.promo?.code ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const apply = async () => {
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const { promo } = await api.checkPromo(code, c.plan, c.period);
      c.set({ promo });
      setApplied(true);
    } catch (e) {
      setError(errorText(e, t('promo.error')));
    } finally {
      setBusy(false);
    }
  };

  // Back to checkout if it's open; from pricing or settings, carry on to it so the discount is visible.
  const done = () => router.dismissTo('/billing/checkout');

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('checkout.eyebrow')} title={t('promo.title')} />
      <Text variant="body" color={Colors.textSecondary}>
        {t('promo.intro', { plan: PLANS[c.plan].name, period: PERIOD[c.period].lower })}
      </Text>

      <View
        style={[styles.inputWrap, error && { borderColor: Colors.danger }, applied && { borderColor: Colors.success }]}>
        <Ionicons name="pricetag" size={20} color={applied ? Colors.success : Colors.primary} />
        <TextInput
          value={code}
          onChangeText={(text) => {
            setCode(text.toUpperCase());
            setError(null);
            setApplied(false);
          }}
          placeholder={t('promo.placeholder')}
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={24}
          onSubmitEditing={apply}
          accessibilityLabel={t('labels.promoCode')}
          style={styles.input}
        />
        {applied && <Ionicons name="checkmark-circle" size={22} color={Colors.success} />}
      </View>
      {error && (
        <Text variant="small" color={Colors.danger}>
          {error}
        </Text>
      )}

      {applied && c.promo ? (
        <>
          <Card style={[styles.applied]}>
            <Ionicons name="sparkles" size={22} color={Colors.success} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{promoLabel(c.promo, t)}</Text>
              <Text variant="small" color={Colors.textSecondary}>
                {t('promo.saving', { discount: money(c.discount, c.currency), total: money(c.total, c.currency) })}
              </Text>
            </View>
          </Card>
          <Button title={t('promo.continue')} onPress={done} />
        </>
      ) : (
        <Button title={t('promo.apply')} loading={busy} disabled={!code.trim()} onPress={apply} />
      )}

      {c.promo && (
        <Button
          variant="ghost"
          title={t('promo.remove', { code: c.promo.code })}
          onPress={() => {
            c.set({ promo: null });
            setCode('');
            setApplied(false);
            goBack('/billing');
          }}
        />
      )}
      <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
        {USE_MOCKS ? t('promo.noteDemo') : t('promo.note')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: Spacing.md,
    minHeight: 58,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontFamily: Fonts.extrabold,
    fontSize: 20,
    letterSpacing: 3,
    paddingVertical: Spacing.sm,
    ...NoWebOutline,
  },
  applied: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderColor: Colors.success + '66' },
});
