import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Trans, useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { AppleButton, GoogleButton, OrDivider, showAppleSignIn } from '@/components/auth/social-buttons';
import { LogoMark } from '@/components/brand/logo';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';
import { WELCOME_CREDITS } from '@/lib/config';

const PERKS: { icon: keyof typeof Ionicons.glyphMap; color: string; key: 'credits' | 'rewards' | 'sync' }[] = [
  { icon: 'flash', color: Palette.gold400, key: 'credits' },
  { icon: 'trophy', color: Palette.teal400, key: 'rewards' },
  { icon: 'phone-portrait', color: Palette.sky400, key: 'sync' },
];

export default function GetStartedScreen() {
  const { t } = useTranslation('auth');
  return (
    <AuthScreen
      hero={<LogoMark size={64} />}
      title={t('getStarted.title')}
      subtitle={t('getStarted.subtitle')}
      footer={
        <>
          <GoogleButton onPress={() => router.push({ pathname: '/social', params: { provider: 'google' } })} />
          {showAppleSignIn && (
            <AppleButton onPress={() => router.push({ pathname: '/social', params: { provider: 'apple' } })} />
          )}
          <OrDivider />
          <Button
            variant="secondary"
            icon="mail"
            title={t('getStarted.continueWithEmail')}
            onPress={() => router.push('/sign-up')}
          />
          <Text variant="small" color={Colors.textSecondary} center style={{ marginTop: Spacing.xs }}>
            <Trans
              t={t}
              i18nKey="shared.haveAccount"
              components={{
                link: (
                  <Text
                    variant="small"
                    color={Colors.primary}
                    onPress={() => router.push('/login')}
                    accessibilityRole="link"
                  />
                ),
              }}
            />
          </Text>
          <Text variant="small" color={Colors.textMuted} center style={{ fontSize: 12 }}>
            <Trans
              t={t}
              i18nKey="getStarted.legal"
              components={{
                terms: <Text variant="small" style={styles.legal} onPress={() => router.push('/legal/terms')} />,
                privacy: <Text variant="small" style={styles.legal} onPress={() => router.push('/legal/privacy')} />,
              }}
            />
          </Text>
        </>
      }>
      <Card style={{ gap: Spacing.md }}>
        {PERKS.map((p) => (
          <View key={p.key} style={styles.perk}>
            <View style={[styles.perkIcon, { backgroundColor: p.color + '22' }]}>
              <Ionicons name={p.icon} size={20} color={p.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">
                {p.key === 'credits'
                  ? t('getStarted.perks.credits.title', { count: WELCOME_CREDITS })
                  : t(`getStarted.perks.${p.key}.title`)}
              </Text>
              <Text variant="small" color={Colors.textSecondary}>
                {t(`getStarted.perks.${p.key}.body`)}
              </Text>
            </View>
          </View>
        ))}
      </Card>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  perk: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  perkIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  legal: { fontSize: 12, color: Colors.textSecondary, textDecorationLine: 'underline' },
});
