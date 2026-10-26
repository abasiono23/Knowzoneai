import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { LogoMark } from '@/components/brand/logo';
import { SoftGlow } from '@/components/brand/soft-glow';
import { Celebration } from '@/components/onboarding/celebration';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { api } from '@/lib/api';
import { useSession } from '@/lib/session';

export default function AllSetScreen() {
  const { t } = useTranslation('auth');
  const { user, setUser } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const starter: { icon: keyof typeof Ionicons.glyphMap; color: string; key: string; title: string; body: string }[] = [
    {
      icon: 'flash',
      color: Palette.gold400,
      key: 'credits',
      title: t('allSet.starter.credits.title', { count: user?.aiCredits ?? 5 }),
      body: t('allSet.starter.credits.body'),
    },
    {
      icon: 'ribbon',
      color: Palette.purple300,
      key: 'level',
      title: t('allSet.starter.level.title', { level: 1 }),
      body: t('allSet.starter.level.body'),
    },
    {
      icon: 'compass',
      color: Palette.teal400,
      key: 'plan',
      title: t('allSet.starter.plan.title'),
      body: t('allSet.starter.plan.body'),
    },
  ];

  // Skipping personalization still finishes onboarding, with default settings.
  const skip = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await api.completeOnboarding();
      // Flipping onboardingComplete moves the root guard into the app (Home).
      setUser(res.user);
    } catch (e) {
      setError(errorText(e));
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <AuthScreen
        center
        back={false}
        backdrop="reward"
        footer={
          <>
            {error && (
              <Text variant="small" color={Colors.danger} center>
                {error}
              </Text>
            )}
            <Button
              title={t('allSet.personalize')}
              icon="sparkles"
              onPress={() => router.push('/personalize/learner-type')}
              disabled={busy}
            />
            <Button
              variant="ghost"
              title={t('actions.skipForNow', { ns: 'common' })}
              onPress={skip}
              loading={busy}
              disabled={busy}
            />
          </>
        }>
        <View style={styles.markWrap}>
          <SoftGlow color={Palette.gold400} size={300} opacity={0.5} />
          <Animated.View entering={ZoomIn.springify().damping(10)}>
            <LogoMark size={104} />
          </Animated.View>
        </View>
        <Animated.View entering={FadeInDown.delay(250).duration(500)} style={{ gap: Spacing.xs }}>
          <Text variant="display" center>
            {user?.name ? t('allSet.titleNamed', { name: user.name }) : t('allSet.title')}
          </Text>
          <Text color={Colors.textSecondary} center>
            {t('allSet.subtitle')}
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(450).duration(500)}>
          <Card style={{ gap: Spacing.md }}>
            {starter.map((s) => (
              <View key={s.key} style={styles.row}>
                <View style={[styles.icon, { backgroundColor: s.color + '22' }]}>
                  <Ionicons name={s.icon} size={20} color={s.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong">{s.title}</Text>
                  <Text variant="small" color={Colors.textSecondary}>
                    {s.body}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </Animated.View>
      </AuthScreen>
      <Celebration />
    </View>
  );
}

const styles = StyleSheet.create({
  markWrap: { alignItems: 'center', justifyContent: 'center', height: 150 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  icon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
});
