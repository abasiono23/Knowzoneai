import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { type TextInputInstance } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { PasswordStrength } from '@/components/auth/password-strength';
import { TextField } from '@/components/auth/text-field';
import { CountryField } from '@/components/region-picker';
import { Button, Text } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { isValidEmail, signupDraft } from '@/lib/onboarding-flow';
import { guessedCountry } from '@/lib/region';

type Errors = Partial<Record<'name' | 'email' | 'password' | 'region', string>>;

export default function SignUpScreen() {
  const { t } = useTranslation('auth');
  const draft = signupDraft.get();
  const [name, setName] = useState(draft?.name ?? '');
  const [email, setEmail] = useState(draft?.email ?? '');
  const [password, setPassword] = useState('');
  // Where they study: starts on the device's country when it's one we list, and is theirs to change.
  const [region, setRegion] = useState<string | null>(() => draft?.region ?? guessedCountry());
  const [errors, setErrors] = useState<Errors>({});
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);

  const submit = () => {
    const next: Errors = {};
    if (!name.trim()) next.name = t('signUp.nameRequired');
    if (!isValidEmail(email)) next.email = t('validation.email');
    if (password.length < 8) next.password = t('validation.passwordMin');
    if (!region) next.region = t('regions.required', { ns: 'common' });
    setErrors(next);
    if (Object.keys(next).length || !region) return;

    // The account is created after the student accepts the terms on the next screen.
    signupDraft.set({ name: name.trim(), email: email.trim().toLowerCase(), password, region });
    router.push('/terms');
  };

  return (
    <AuthScreen
      step={{ current: 1, total: 4 }}
      title={t('signUp.title')}
      subtitle={t('signUp.subtitle')}
      footer={
        <>
          {/* No country, no account: the button waits for one. */}
          <Button title={t('actions.continue', { ns: 'common' })} onPress={submit} disabled={!region} />
          <Text variant="small" color={Colors.textSecondary} center>
            <Trans
              t={t}
              i18nKey="shared.haveAccount"
              components={{
                link: (
                  <Text
                    variant="small"
                    color={Colors.primary}
                    onPress={() => router.replace('/login')}
                    accessibilityRole="link"
                  />
                ),
              }}
            />
          </Text>
        </>
      }>
      <TextField
        label={t('signUp.firstName')}
        icon="person-outline"
        placeholder={t('signUp.firstNamePlaceholder')}
        value={name}
        onChangeText={setName}
        error={errors.name}
        autoComplete="given-name"
        textContentType="givenName"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
      />
      <TextField
        ref={emailRef}
        label={t('fields.email')}
        icon="mail-outline"
        placeholder={t('fields.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextField
        ref={passwordRef}
        label={t('fields.password')}
        icon="lock-closed-outline"
        placeholder={t('fields.newPasswordPlaceholder')}
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        password
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <PasswordStrength password={password} />
      <CountryField
        value={region}
        onChange={(code) => {
          setRegion(code);
          setErrors((e) => ({ ...e, region: undefined }));
        }}
        error={errors.region}
      />
    </AuthScreen>
  );
}
