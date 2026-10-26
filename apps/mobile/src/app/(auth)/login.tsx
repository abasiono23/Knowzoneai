import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Pressable, View, type TextInputInstance } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { AppleButton, GoogleButton, OrDivider, showAppleSignIn } from '@/components/auth/social-buttons';
import { TextField } from '@/components/auth/text-field';
import { LogoMark } from '@/components/brand/logo';
import { Button, Text } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { auth } from '@/lib/auth';
import { isValidEmail, nextOnboardingStep } from '@/lib/onboarding-flow';
import { useSession } from '@/lib/session';

export default function LoginScreen() {
  const { t } = useTranslation('auth');
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const passwordRef = useRef<TextInputInstance>(null);

  const submit = async () => {
    if (!isValidEmail(email) || !password) {
      setError(t('login.missingFields'));
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const clean = email.trim().toLowerCase();
      const res = await auth.logIn(clean, password);
      await signIn(res.token, res.user);
      if (!res.user.onboardingComplete) router.replace(nextOnboardingStep(res.user));
    } catch (e) {
      if ((e as { reason?: string }).reason === 'email-not-confirmed') {
        const clean = email.trim().toLowerCase();
        await auth.resendSignUp(clean).catch(() => {});
        router.push({ pathname: '/verify-email', params: { email: clean } });
        return;
      }
      setError(errorText(e, t('login.failed')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      hero={<LogoMark size={56} />}
      title={t('login.title')}
      subtitle={t('login.subtitle')}
      footer={
        <>
          <Button title={t('shared.logIn')} onPress={submit} loading={busy} />
          <OrDivider />
          <GoogleButton onPress={() => router.push({ pathname: '/social', params: { provider: 'google' } })} />
          {showAppleSignIn && (
            <AppleButton onPress={() => router.push({ pathname: '/social', params: { provider: 'apple' } })} />
          )}
          <Text variant="small" color={Colors.textSecondary} center>
            <Trans
              t={t}
              i18nKey="login.newHere"
              components={{
                link: (
                  <Text
                    variant="small"
                    color={Colors.primary}
                    onPress={() => router.replace('/get-started')}
                    accessibilityRole="link"
                  />
                ),
              }}
            />
          </Text>
        </>
      }>
      <TextField
        label={t('fields.email')}
        icon="mail-outline"
        placeholder={t('fields.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <View style={{ gap: 8 }}>
        <TextField
          ref={passwordRef}
          label={t('fields.password')}
          icon="lock-closed-outline"
          placeholder={t('login.passwordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          password
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
          error={error}
        />
        <Pressable
          onPress={() => router.push('/forgot-password')}
          hitSlop={10}
          style={{ alignSelf: 'flex-end' }}
          accessibilityRole="link">
          <Text variant="small" color={Colors.primary}>
            {t('login.forgot')}
          </Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}
