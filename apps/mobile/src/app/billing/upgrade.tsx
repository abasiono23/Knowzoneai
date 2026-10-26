import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { FeatureList, TrustRow } from '@/components/billing/billing-ui';
import { Button, Screen, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useCheckout } from '@/lib/billing/checkout';
import { PLANS, money, priceOf } from '@/lib/billing/plans';
import { goBack } from '@/lib/navigation';

type Icon = keyof typeof Ionicons.glyphMap;
type ReasonKey = 'tutor' | 'videoLength' | 'credits' | 'default';

/** Route `reason` values (unchanged) and the strings they show. */
const REASONS: Record<string, { icon: Icon; key: ReasonKey }> = {
  tutor: { icon: 'chatbubbles', key: 'tutor' },
  'video-length': { icon: 'videocam', key: 'videoLength' },
  credits: { icon: 'flash', key: 'credits' },
  default: { icon: 'rocket', key: 'default' },
};

/** Screen 202: upgrade prompt, shown when a student taps something that needs Plus. */
export default function UpgradePromptScreen() {
  const { t } = useTranslation('billing');
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const r = REASONS[reason ?? ''] ?? REASONS.default;
  const checkout = useCheckout();

  return (
    <Screen withTabBar={false}>
      <View style={styles.close}>
        <Button variant="ghost" title={t('actions.notNow', { ns: 'common' })} onPress={() => goBack('/home')} />
      </View>
      <View style={{ alignItems: 'center', gap: Spacing.sm }}>
        <LinearGradient colors={PLANS.PLUS.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.icon}>
          <Ionicons name={r.icon} size={40} color={Colors.textOnAccent} />
        </LinearGradient>
        {/* Brand name, not translated. */}
        <Text variant="label" color={Colors.primary}>
          {PLANS.PLUS.name.toUpperCase()}
        </Text>
        <Text variant="title" center>
          {t(`upgrade.reasons.${r.key}.title`)}
        </Text>
        <Text variant="body" color={Colors.textSecondary} center>
          {t(`upgrade.reasons.${r.key}.body`)}
        </Text>
      </View>
      <View style={styles.card}>
        <FeatureList features={PLANS.PLUS.features.slice(0, 5)} color={Colors.primary} />
      </View>
      <Button
        title={t('upgrade.getPlus', { price: money(priceOf('PLUS', 'month', checkout.currency), checkout.currency) })}
        icon="rocket"
        onPress={() => {
          checkout.set({ plan: 'PLUS', period: 'month' });
          router.replace('/billing/checkout');
        }}
      />
      <Button variant="secondary" title={t('actions.seeAllPlans')} onPress={() => router.replace('/billing')} />
      <TrustRow />
    </Screen>
  );
}

const styles = StyleSheet.create({
  close: { alignItems: 'flex-end' },
  icon: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '55',
    padding: Spacing.md,
  },
});
