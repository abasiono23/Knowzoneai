import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { HeroIcon } from '@/components/auth/hero-icon';
import { OtpInput } from '@/components/auth/otp-input';
import { Card, Text } from '@/components/ui';
import { Colors, Gradients, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { auth } from '@/lib/auth';
import { MOCK_CODE, USE_MOCKS } from '@/lib/config';
import { useSession } from '@/lib/session';

const RESEND_SECONDS = 30;

export default function VerifyEmailScreen() {
  const { t } = useTranslation('auth');
  const params = useLocalSearchParams<{ mode?: 'signup' | 'reset'; email?: string }>();
  const mode = params.mode === 'reset' ? 'reset' : 'signup';
  const { user, signIn, signOut } = useSession();
  const email = mode === 'reset' ? params.email : (user?.email ?? params.email);

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const verify = async (value: string) => {
    setBusy(true);
    setError(null);
    try {
      if (mode === 'reset') {
        const resetToken = await auth.verifyResetCode(email ?? '', value);
        router.replace({ pathname: '/reset-password', params: { token: resetToken } });
      } else {
        const res = await auth.verifySignUp(email ?? '', value);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        await signIn(res.token, res.user);
        router.replace('/verified');
      }
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setError(errorText(e, t('verifyEmail.failed')));
      setShakeKey((k) => k + 1);
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  const onChange = (value: string) => {
    setCode(value);
    if (error) setError(null);
    if (value.length === 6) verify(value);
  };

  const resend = async () => {
    setCooldown(RESEND_SECONDS);
    setResent(true);
    try {
      if (mode === 'reset') await auth.sendResetCode(email ?? '');
      else await auth.resendSignUp(email ?? '');
    } catch (e) {
      setError(errorText(e, t('verifyEmail.resendFailed')));
    }
  };

  const changeEmail = async () => {
    if (mode === 'reset') {
      router.back();
      return;
    }
    if (user) await signOut();
    router.replace('/sign-up');
  };

  return (
    <AuthScreen
      step={mode === 'signup' ? { current: 3, total: 4 } : undefined}
      back={mode === 'reset'}
      hero={<HeroIcon icon="mail-open" badge="sparkles" colors={Gradients.ai} />}
      title={mode === 'reset' ? t('verifyEmail.titleReset') : t('verifyEmail.titleSignup')}
      subtitle={
        <Trans
          t={t}
          i18nKey="verifyEmail.sentTo"
          values={{ email: email ?? t('verifyEmail.yourEmail') }}
          components={{ email: <Text variant="bodyStrong" color={Colors.text} /> }}
        />
      }>
      <OtpInput value={code} onChange={onChange} error={!!error} shakeKey={shakeKey} />

      <View style={styles.status}>
        {busy ? (
          <ActivityIndicator color={Colors.primary} />
        ) : error ? (
          <Text variant="small" color={Colors.danger} center>
            {error}
          </Text>
        ) : resent ? (
          <Text variant="small" color={Colors.success} center>
            {t('verifyEmail.resent')}
          </Text>
        ) : null}
      </View>

      <View style={styles.links}>
        <Pressable onPress={resend} disabled={cooldown > 0} hitSlop={10} accessibilityRole="button">
          <Text variant="bodyStrong" color={cooldown > 0 ? Colors.textMuted : Colors.primary}>
            {cooldown > 0
              ? t('verifyEmail.resendIn', { time: `0:${String(cooldown).padStart(2, '0')}` })
              : t('verifyEmail.resend')}
          </Text>
        </Pressable>
        <Pressable onPress={changeEmail} hitSlop={10} accessibilityRole="button">
          <Text variant="small" color={Colors.textSecondary}>
            <Trans
              t={t}
              i18nKey="verifyEmail.wrongEmail"
              components={{ link: <Text variant="small" color={Colors.primary} /> }}
            />
          </Text>
        </Pressable>
      </View>

      {USE_MOCKS && (
        <Card style={styles.demo}>
          <Text variant="small" color={Colors.reward} center>
            <Trans
              t={t}
              i18nKey="verifyEmail.demo"
              values={{ code: MOCK_CODE }}
              components={{ code: <Text variant="bodyStrong" color={Colors.reward} /> }}
            />
          </Text>
        </Card>
      )}
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  status: { minHeight: 24, justifyContent: 'center' },
  links: { alignItems: 'center', gap: Spacing.md },
  demo: { backgroundColor: Colors.rewardSoft, borderColor: Colors.reward, paddingVertical: Spacing.sm },
});
