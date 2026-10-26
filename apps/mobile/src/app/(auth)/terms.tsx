import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { Checkbox } from '@/components/auth/checkbox';
import { HeroIcon } from '@/components/auth/hero-icon';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Gradients, Palette, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { api, type Consent } from '@/lib/api';
import { auth } from '@/lib/auth';
import { signupDraft } from '@/lib/onboarding-flow';
import { useSession } from '@/lib/session';

const PROMISES: { icon: keyof typeof Ionicons.glyphMap; color: string; key: 'notes' | 'data' | 'safety' }[] = [
  { icon: 'lock-closed', color: Palette.teal400, key: 'notes' },
  { icon: 'eye-off', color: Palette.purple300, key: 'data' },
  { icon: 'shield-checkmark', color: Palette.gold400, key: 'safety' },
];

export default function TermsScreen() {
  const { t } = useTranslation('auth');
  const { user, signIn, setUser } = useSession();
  const draft = signupDraft.get();
  const [consent, setConsent] = useState<Consent>({ terms: false, privacy: false, age: false, marketing: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const required = consent.terms && consent.privacy && consent.age;
  const allChecked = required && consent.marketing;
  const set = (key: keyof Consent) => (value: boolean) => setConsent((c) => ({ ...c, [key]: value }));

  const accept = async () => {
    setError(null);
    setBusy(true);
    try {
      if (user) {
        // Signed in with Google/Apple: record consent on the existing account.
        const res = await api.acceptConsent(consent);
        setUser(res.user);
        router.replace('/referral');
      } else if (draft) {
        const res = await auth.signUp({ ...draft, consent });
        signupDraft.clear();
        if (res.kind === 'verify') {
          router.replace({ pathname: '/verify-email', params: { email: res.email } });
        } else {
          await signIn(res.token, res.user);
          router.replace(res.user.emailVerified ? '/verified' : '/verify-email');
        }
      } else {
        router.replace('/sign-up');
      }
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  // Styled parts of the consent sentences (<link> and the required <req> marker).
  const parts = (url: string) => ({
    link: (
      <Text variant="small" color={Colors.primary} onPress={() => router.push(url as Href)} accessibilityRole="link" />
    ),
    req: <Text variant="small" color={Colors.danger} />,
  });

  return (
    <AuthScreen
      step={{ current: user ? 1 : 2, total: user ? 2 : 4 }}
      back={!user}
      hero={<HeroIcon icon="shield-checkmark" colors={Gradients.mastery} />}
      title={t('terms.title')}
      subtitle={t('terms.subtitle')}
      footer={
        <>
          {error && (
            <Text variant="small" color={Colors.danger} center>
              {error}
            </Text>
          )}
          <Button title={t('terms.agree')} onPress={accept} loading={busy} disabled={!required} />
        </>
      }>
      <View style={{ gap: Spacing.sm }}>
        {PROMISES.map((p) => (
          <View key={p.key} style={styles.promise}>
            <View style={[styles.promiseIcon, { backgroundColor: p.color + '22' }]}>
              <Ionicons name={p.icon} size={18} color={p.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{t(`terms.promises.${p.key}.title`)}</Text>
              <Text variant="small" color={Colors.textSecondary}>
                {t(`terms.promises.${p.key}.body`)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Card style={{ gap: Spacing.sm }}>
        <Checkbox
          label={t('terms.acceptAll')}
          checked={allChecked}
          onChange={(v) => setConsent({ terms: v, privacy: v, age: v, marketing: v })}>
          <Text variant="bodyStrong">{t('terms.acceptAll')}</Text>
        </Checkbox>
        <View style={styles.separator} />
        <Checkbox label={t('terms.termsA11y')} checked={consent.terms} onChange={set('terms')}>
          <Text variant="small">
            <Trans t={t} i18nKey="terms.termsText" components={parts('/legal/terms')} />
          </Text>
        </Checkbox>
        <Checkbox label={t('terms.privacyA11y')} checked={consent.privacy} onChange={set('privacy')}>
          <Text variant="small">
            <Trans t={t} i18nKey="terms.privacyText" components={parts('/legal/privacy')} />
          </Text>
        </Checkbox>
        <Checkbox label={t('terms.ageA11y')} checked={consent.age} onChange={set('age')}>
          <Text variant="small">
            <Trans t={t} i18nKey="terms.ageText" components={{ req: <Text variant="small" color={Colors.danger} /> }} />
          </Text>
        </Checkbox>
        <Checkbox label={t('terms.marketingA11y')} checked={consent.marketing} onChange={set('marketing')}>
          <Text variant="small" color={Colors.textSecondary}>
            {t('terms.marketingText')}
          </Text>
        </Checkbox>
      </Card>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  promise: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  promiseIcon: { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  separator: { height: 1, backgroundColor: Colors.border },
});
