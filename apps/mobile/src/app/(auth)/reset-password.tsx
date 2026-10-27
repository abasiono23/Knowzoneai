import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type TextInputInstance } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { HeroIcon } from '@/components/auth/hero-icon';
import { PasswordStrength } from '@/components/auth/password-strength';
import { TextField } from '@/components/auth/text-field';
import { SuccessBadge } from '@/components/onboarding/success-badge';
import { Button, Text } from '@/components/ui';
import { Colors, Gradients, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { auth } from '@/lib/auth';

export default function ResetPasswordScreen() {
  const { t } = useTranslation('auth');
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const confirmRef = useRef<TextInputInstance>(null);

  const submit = async () => {
    const next: typeof errors = {};
    if (password.length < 8) next.password = t('validation.passwordMin');
    if (confirm !== password) next.confirm = t('resetPassword.mismatch');
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await auth.resetPassword(token, password);
      setDone(true);
    } catch (e) {
      setErrors({ form: errorText(e, t('resetPassword.failed')) });
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <AuthScreen
        center
        back={false}
        backdrop="reward"
        footer={
          <Button title={t('shared.backToLogIn')} icon="log-in-outline" onPress={() => router.dismissTo('/login')} />
        }>
        <SuccessBadge icon="lock-closed" colors={Gradients.ai} />
        <Animated.View entering={FadeInDown.delay(300)} style={{ gap: Spacing.xs }}>
          <Text variant="display" center>
            {t('resetPassword.doneTitle')}
          </Text>
          <Text color={Colors.textSecondary} center>
            {t('resetPassword.doneBody')}
          </Text>
        </Animated.View>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      hero={<HeroIcon icon="lock-open" colors={Gradients.mastery} />}
      title={t('resetPassword.title')}
      subtitle={t('resetPassword.subtitle')}
      footer={
        <>
          {errors.form && (
            <Text variant="small" color={Colors.danger} center>
              {errors.form}
            </Text>
          )}
          <Button title={t('resetPassword.update')} onPress={submit} loading={busy} />
        </>
      }>
      <TextField
        label={t('resetPassword.newPassword')}
        icon="lock-closed-outline"
        placeholder={t('fields.newPasswordPlaceholder')}
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        password
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
      />
      <PasswordStrength password={password} />
      <TextField
        ref={confirmRef}
        label={t('resetPassword.confirmPassword')}
        icon="checkmark-done-outline"
        placeholder={t('resetPassword.confirmPlaceholder')}
        value={confirm}
        onChangeText={setConfirm}
        error={errors.confirm}
        password
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
    </AuthScreen>
  );
}
