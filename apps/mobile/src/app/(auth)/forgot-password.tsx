import { router } from 'expo-router';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { AuthScreen } from '@/components/auth/auth-screen';
import { HeroIcon } from '@/components/auth/hero-icon';
import { TextField } from '@/components/auth/text-field';
import { Button, Text } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { auth } from '@/lib/auth';
import { isValidEmail } from '@/lib/onboarding-flow';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!isValidEmail(email)) {
      setError(t('forgotPassword.emailRequired'));
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const clean = email.trim().toLowerCase();
      await auth.sendResetCode(clean);
      router.push({ pathname: '/verify-email', params: { mode: 'reset', email: clean } });
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      hero={<HeroIcon icon="key" badge="help" />}
      title={t('forgotPassword.title')}
      subtitle={t('forgotPassword.subtitle')}
      footer={
        <>
          <Button title={t('forgotPassword.send')} icon="paper-plane" onPress={submit} loading={busy} />
          <Text variant="small" color={Colors.textSecondary} center>
            <Trans
              t={t}
              i18nKey="forgotPassword.remembered"
              components={{
                link: (
                  <Text variant="small" color={Colors.primary} onPress={() => router.back()} accessibilityRole="link" />
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
        error={error}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="send"
        onSubmitEditing={submit}
        autoFocus
      />
    </AuthScreen>
  );
}
