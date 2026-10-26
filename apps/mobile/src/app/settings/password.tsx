import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { HeroIcon } from '@/components/auth/hero-icon';
import { PasswordStrength } from '@/components/auth/password-strength';
import { TextField } from '@/components/auth/text-field';
import { SuccessBadge } from '@/components/onboarding/success-badge';
import { Button, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { goBack } from '@/lib/navigation';
import { auth } from '@/lib/auth';
import { useSession } from '@/lib/session';

/** Screen 187: change password (or add one, for Google / Apple accounts). */
export default function ChangePasswordScreen() {
  const { user } = useSession();
  const { t } = useTranslation('settings');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  if (!user) return null;
  const social = user.authProvider !== 'email';
  const mismatch = !!confirm && confirm !== next;
  const strong = next.length >= 8 && /[a-z]/i.test(next) && /\d/.test(next);
  const ready = strong && confirm === next && (social || !!current);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await auth.changePassword(current, next);
      setDone(true);
    } catch (e) {
      setError(errorText(e, t('password.error')));
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <AuthScreen
        center
        hero={<SuccessBadge icon="key" />}
        title={social ? t('password.addedTitle') : t('password.changedTitle')}
        subtitle={social ? t('password.addedBody') : t('password.changedBody')}
        footer={<Button title={t('actions.done', { ns: 'common' })} onPress={() => goBack()} />}
      />
    );

  return (
    <AuthScreen
      hero={<HeroIcon icon="key" />}
      title={social ? t('password.addTitle') : t('password.changeTitle')}
      subtitle={
        social
          ? t('password.addSubtitle', {
              provider: user.authProvider === 'google' ? 'Google' : 'Apple',
              email: user.email,
            })
          : t('password.changeSubtitle')
      }
      footer={
        <>
          {error && (
            <Animated.View entering={FadeIn}>
              <Text variant="small" color={Colors.danger} center>
                {error}
              </Text>
            </Animated.View>
          )}
          <Button
            title={social ? t('password.add') : t('password.update')}
            loading={busy}
            disabled={!ready}
            onPress={submit}
          />
        </>
      }>
      {!social && (
        <TextField
          label={t('password.current')}
          icon="lock-closed-outline"
          password
          value={current}
          onChangeText={setCurrent}
          autoComplete="current-password"
        />
      )}
      <View style={{ gap: Spacing.xs }}>
        <TextField
          label={t('password.new')}
          icon="key-outline"
          password
          value={next}
          onChangeText={setNext}
          autoComplete="new-password"
          hint={t('password.newHint')}
        />
        <PasswordStrength password={next} />
      </View>
      <TextField
        label={t('password.confirm')}
        icon="checkmark-done-outline"
        password
        value={confirm}
        onChangeText={setConfirm}
        error={mismatch ? t('password.mismatch') : null}
        autoComplete="new-password"
      />
      {!social && (
        <Text variant="small" color={Colors.textMuted} style={styles.note}>
          {t('password.forgot')}
        </Text>
      )}
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  note: { marginTop: Spacing.xs },
});
