import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { HeroIcon } from '@/components/auth/hero-icon';
import { TextField } from '@/components/auth/text-field';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { api } from '@/lib/api';
import { REFERRAL_CREDITS, USE_MOCKS } from '@/lib/config';
import { useSession } from '@/lib/session';

export default function ReferralScreen() {
  const { t } = useTranslation('auth');
  const params = useLocalSearchParams<{ code?: string }>();
  const { user, setUser } = useSession();
  const [code, setCode] = useState((params.code ?? '').toUpperCase());
  const [inviter, setInviter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const emailPath = user?.authProvider === 'email';
  const step = emailPath ? { current: 4, total: 4 } : { current: 2, total: 2 };

  const apply = async () => {
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.validateReferral(clean);
      if (!res.valid) {
        router.push({ pathname: '/referral-invalid', params: { code: clean, reason: res.reason ?? 'not-found' } });
        return;
      }
      const applied = await api.applyReferral(clean);
      setUser(applied.user);
      setInviter(res.inviterName ?? t('referral.yourFriend'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e) {
      const reason = (e as { reason?: string }).reason;
      if (reason) router.push({ pathname: '/referral-invalid', params: { code: clean, reason } });
      else setError(errorText(e, t('referral.applyFailed')));
    } finally {
      setBusy(false);
    }
  };

  const finish = () => router.replace('/all-set');

  return (
    <AuthScreen
      step={step}
      back={false}
      hero={<HeroIcon icon="gift" colors={Gradients.reward} badge="people" />}
      title={t('referral.title')}
      subtitle={t('referral.subtitle', { count: REFERRAL_CREDITS })}
      footer={
        inviter ? (
          <Button title={t('actions.continue', { ns: 'common' })} icon="arrow-forward" onPress={finish} />
        ) : (
          <>
            <Button title={t('referral.apply')} onPress={apply} loading={busy} disabled={!code.trim()} />
            <Button variant="ghost" title={t('referral.noCode')} onPress={finish} />
          </>
        )
      }>
      {inviter ? (
        <Animated.View entering={FadeInDown.springify()}>
          <Card style={styles.success}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={22} color={Colors.backgroundDeep} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="bodyStrong">{t('referral.invitedBy', { name: inviter })}</Text>
              <Text variant="small" color={Colors.textSecondary}>
                {t('referral.bonus', { count: REFERRAL_CREDITS })}
              </Text>
            </View>
          </Card>
        </Animated.View>
      ) : (
        <>
          <TextField
            label={t('referral.codeLabel')}
            icon="ticket-outline"
            placeholder={t('referral.codePlaceholder', { code: 'ADA2026' })}
            value={code}
            onChangeText={(text) => {
              setCode(text.toUpperCase());
              setError(null);
            }}
            error={error}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={apply}
            style={styles.codeInput}
          />
          {USE_MOCKS && (
            <Text variant="small" color={Colors.textMuted}>
              <Trans
                t={t}
                i18nKey="referral.demo"
                values={{ code: 'ADA2026' }}
                components={{ code: <Text variant="small" color={Colors.reward} /> }}
              />
            </Text>
          )}
          <View style={styles.rules}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
            <Text variant="small" color={Colors.textMuted} style={{ flex: 1 }}>
              {t('referral.rules')}
            </Text>
          </View>
        </>
      )}
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  codeInput: { letterSpacing: 3, fontSize: 18 },
  success: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.rewardSoft,
    borderColor: Colors.reward,
  },
  successIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Colors.reward,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rules: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
});
