import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, View } from 'react-native';

import { ResultHero } from '@/components/billing/billing-ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { api } from '@/lib/api';
import { PLANS } from '@/lib/billing/plans';
import { fmtDate } from '@/lib/billing/use-billing';
import { useSession } from '@/lib/session';

type Result = { restored: true; plan: 'PLUS' | 'PRO'; until: number } | { restored: false };

/** Screen 212: restore purchases (for subscriptions bought through the App Store or Google Play). */
export default function RestorePurchasesScreen() {
  const { t } = useTranslation('billing');
  const { setUser } = useSession();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const store =
    Platform.OS === 'ios' ? 'App Store' : Platform.OS === 'android' ? 'Google Play' : t('restore.genericStore');

  const restore = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await api.restorePurchases();
      setUser(r.user);
      const sub = r.billing.subscription;
      setResult(
        r.restored && sub ? { restored: true, plan: sub.plan, until: sub.currentPeriodEnd } : { restored: false },
      );
    } catch (e) {
      setError(errorText(e, t('restore.unreachable')));
    } finally {
      setBusy(false);
    }
  };

  if (result?.restored)
    return (
      <Screen withTabBar={false}>
        <ResultHero
          icon="checkmark"
          colors={PLANS[result.plan].colors}
          title={t('restore.restoredTitle', { plan: PLANS[result.plan].name })}
          body={t('restore.restoredBody', { date: fmtDate(result.until) })}
        />
        <Button title={t('actions.continue', { ns: 'common' })} onPress={() => router.dismissTo('/billing/manage')} />
      </Screen>
    );

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('actions.restore')} />
      {result ? (
        <ResultHero
          icon="search"
          colors={Gradients.reward}
          title={t('restore.noneTitle')}
          body={t('restore.noneBody', { store })}
        />
      ) : (
        <ResultHero
          icon="cloud-download"
          colors={Gradients.ai}
          title={t('restore.introTitle')}
          body={t('restore.introBody', { store })}
        />
      )}
      <Card style={{ gap: Spacing.sm }}>
        {[t('restore.tips.signIn', { store }), t('restore.tips.linked'), t('restore.tips.family')].map((tip) => (
          <View key={tip} style={{ flexDirection: 'row', gap: Spacing.xs }}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.info} />
            <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
              {tip}
            </Text>
          </View>
        ))}
      </Card>
      {error && (
        <Text variant="small" color={Colors.danger} center>
          {error}
        </Text>
      )}
      <Button
        title={result ? t('actions.retry', { ns: 'common' }) : t('actions.restore')}
        icon="refresh"
        loading={busy}
        onPress={restore}
      />
      {result && (
        <Button
          variant="secondary"
          title={t('actions.contactSupport')}
          onPress={() => router.push('/billing/support')}
        />
      )}
    </Screen>
  );
}
