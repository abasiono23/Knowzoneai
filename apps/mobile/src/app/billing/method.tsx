import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';

import { ChoiceRow } from '@/components/billing/billing-ui';
import { Button, Card, Chip, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { PaymentMethodType } from '@/lib/api';
import { useCheckout } from '@/lib/billing/checkout';
import { USE_MOCKS } from '@/lib/config';
import { goBack } from '@/lib/navigation';

/** Banks with USSD payments through Flutterwave. */
const USSD_BANKS = ['GTBank', 'Access Bank', 'Zenith Bank', 'First Bank', 'UBA', 'Fidelity Bank'];
const STORE = Platform.OS === 'ios' ? 'App Store' : 'Google Play';

/** Screen 204: payment method selection. */
export default function PaymentMethodScreen() {
  const { t } = useTranslation('billing');
  const c = useCheckout();
  const [type, setType] = useState<PaymentMethodType>(c.method?.type ?? (Platform.OS === 'web' ? 'card' : 'store'));
  // Dollar payments are by card (or the app store); bank transfer and USSD are naira only.
  const naira = c.currency === 'NGN';
  const [bank, setBank] = useState(c.method?.type === 'ussd' ? c.method.label.replace(/^USSD · /, '') : USSD_BANKS[0]);

  const options: {
    type: PaymentMethodType;
    icon: 'card' | 'business' | 'keypad' | 'logo-apple-appstore' | 'logo-google-playstore';
    title: string;
    body: string;
  }[] = [
    Platform.OS === 'web'
      ? {
          type: 'card',
          icon: 'card',
          title: t('method.card.title'),
          body: t('method.card.body'),
        }
      : {
          type: 'store',
          icon: Platform.OS === 'ios' ? 'logo-apple-appstore' : 'logo-google-playstore',
          title: STORE,
          body: t('method.storeBody', { store: STORE }),
        },
    ...(naira
      ? ([
          {
            type: 'transfer',
            icon: 'business',
            title: t('method.transfer.title'),
            body: t('method.transfer.body'),
          },
          {
            type: 'ussd',
            icon: 'keypad',
            title: t('method.ussd.title'),
            body: t('method.ussd.body'),
          },
        ] as const)
      : []),
  ];

  const save = () => {
    // Stored and sent to the server in English; screens translate it with methodLabel().
    const label =
      type === 'card' ? 'Card' : type === 'store' ? STORE : type === 'transfer' ? 'Bank transfer' : `USSD · ${bank}`;
    c.set({ method: { type, label } });
    goBack('/billing/checkout');
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('checkout.eyebrow')} title={t('method.title')} />
      {options.map((o) => (
        <ChoiceRow
          key={o.type}
          icon={o.icon}
          title={o.title}
          body={o.body}
          selected={type === o.type}
          onPress={() => setType(o.type)}
        />
      ))}

      {!naira && (
        <Text variant="small" color={Colors.textMuted}>
          {t('currency.cardOnly')}
        </Text>
      )}

      {type === 'ussd' && (
        <Card style={{ gap: Spacing.sm }}>
          <Text variant="bodyStrong">{t('method.yourBank')}</Text>
          <View style={styles.chips}>
            {USSD_BANKS.map((b) => (
              <Chip key={b} label={b} selected={bank === b} onPress={() => setBank(b)} />
            ))}
          </View>
        </Card>
      )}

      {USE_MOCKS && (type === 'card' || type === 'store') && (
        <Card style={{ gap: Spacing.sm, borderStyle: 'dashed', borderColor: Colors.reward + '88' }}>
          <Text variant="label" color={Colors.reward}>
            {t('method.demoTitle')}
          </Text>
          <Text variant="small" color={Colors.textSecondary}>
            {t('method.demoBody')}
          </Text>
          <View style={styles.chips}>
            <Chip
              label={t('method.demoSuccess')}
              selected={c.outcome === 'success'}
              onPress={() => c.set({ outcome: 'success' })}
            />
            <Chip
              label={t('method.demoDeclined')}
              selected={c.outcome === 'declined'}
              onPress={() => c.set({ outcome: 'declined' })}
            />
          </View>
        </Card>
      )}

      <Button title={t('method.use')} onPress={save} />
      {Platform.OS === 'web' && (
        <Text variant="small" color={Colors.textMuted} center style={{ fontSize: 12 }}>
          {t('method.webNote')}
        </Text>
      )}
      {Platform.OS !== 'web' && (
        <Button variant="ghost" title={t('method.alreadyPaid')} onPress={() => router.push('/billing/restore')} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
});
