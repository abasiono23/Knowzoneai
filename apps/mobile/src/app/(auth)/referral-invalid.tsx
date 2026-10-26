import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { HeroIcon } from '@/components/auth/hero-icon';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { ReferralInvalidReason } from '@/lib/api';
import { USE_MOCKS } from '@/lib/config';

const ICONS: Record<ReferralInvalidReason, keyof typeof Ionicons.glyphMap> = {
  'not-found': 'search',
  expired: 'time',
  'own-code': 'person',
  'already-referred': 'checkmark-done',
  'not-new': 'school',
  'cap-reached': 'hourglass',
};

/** Screen 176: an invite code that can't be used, and what to do next. */
export default function InvalidReferralScreen() {
  const { code, reason } = useLocalSearchParams<{ code?: string; reason?: ReferralInvalidReason }>();
  const { t } = useTranslation('auth');
  const r: ReferralInvalidReason = reason && reason in ICONS ? reason : 'not-found';
  const retry = r === 'not-found' || r === 'expired';

  return (
    <AuthScreen
      hero={<HeroIcon icon={ICONS[r]} colors={[Colors.danger, '#FF9F43']} badge="close" />}
      title={t(`referralInvalid.reasons.${r}.title`)}
      subtitle={t(`referralInvalid.reasons.${r}.body`)}
      footer={
        <>
          {retry ? (
            <Button title={t('referralInvalid.tryAnother')} icon="create-outline" onPress={() => router.back()} />
          ) : null}
          <Button
            variant={retry ? 'ghost' : 'primary'}
            title={t('referralInvalid.continueWithout')}
            onPress={() => router.replace('/all-set')}
          />
        </>
      }>
      {!!code && (
        <Card style={styles.code}>
          <Ionicons name="ticket-outline" size={20} color={Colors.textMuted} />
          <Text
            variant="heading"
            style={{ letterSpacing: 2, textDecorationLine: r === 'expired' ? 'line-through' : 'none' }}>
            {String(code).toUpperCase()}
          </Text>
        </Card>
      )}
      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
        <Text variant="small" color={Colors.textMuted} style={{ flex: 1 }}>
          {t('referralInvalid.note')}
        </Text>
      </View>
      {USE_MOCKS && (
        <Text variant="small" color={Colors.textMuted}>
          {t('referralInvalid.demo', { valid: 'ADA2026', expired: 'KZ2025' })}
        </Text>
      )}
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  code: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  note: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'flex-start' },
});
