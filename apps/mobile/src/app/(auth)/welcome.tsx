import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { Trans, useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Backdrop } from '@/components/brand/backdrop';
import { LanguageButton } from '@/components/language-picker';
import { LogoMark, Wordmark } from '@/components/brand/logo';
import { SoftGlow } from '@/components/brand/soft-glow';
import { useFloat } from '@/components/onboarding/use-float';
import { Button, Text } from '@/components/ui';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';
import { nextOnboardingStep } from '@/lib/onboarding-flow';
import { useSession } from '@/lib/session';

const HIGHLIGHTS: { icon: keyof typeof Ionicons.glyphMap; key: 'summaries' | 'quizzes' | 'tutor'; color: string }[] = [
  { icon: 'flash', key: 'summaries', color: Palette.gold400 },
  { icon: 'help-circle', key: 'quizzes', color: Palette.teal400 },
  { icon: 'chatbubbles', key: 'tutor', color: Palette.purple300 },
];

export default function WelcomeScreen() {
  const { user } = useSession();
  const { t } = useTranslation('auth');
  const float = useFloat(10, 3200);

  // A student who signed up but didn't finish onboarding resumes where they left off.
  if (user && !user.onboardingComplete) return <Redirect href={nextOnboardingStep(user)} />;

  return (
    <View style={styles.fill}>
      <Backdrop variant="hero" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <LanguageButton />
        </View>
        <View style={styles.hero}>
          <Animated.View entering={ZoomIn.springify().damping(11)} style={styles.markWrap}>
            <SoftGlow color={Palette.purple500} size={340} opacity={0.7} />
            <Animated.View style={float}>
              <LogoMark size={132} />
            </Animated.View>
          </Animated.View>
          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            style={{ alignItems: 'center', gap: Spacing.md }}>
            <Wordmark fontSize={34} />
            <Text variant="display" center style={styles.headline}>
              <Trans
                t={t}
                i18nKey="welcome.headline"
                components={{ highlight: <Text variant="display" color={Palette.teal400} /> }}
              />
            </Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.highlights}>
            {HIGHLIGHTS.map((h) => (
              <View key={h.key} style={styles.highlight}>
                <Ionicons name={h.icon} size={14} color={h.color} />
                <Text variant="label" style={{ letterSpacing: 0.1 }}>
                  {t(`welcome.highlights.${h.key}`)}
                </Text>
              </View>
            ))}
          </Animated.View>
        </View>

        <Animated.View entering={FadeInUp.delay(550).duration(600)} style={styles.actions}>
          <Button title={t('welcome.getStarted')} onPress={() => router.push('/onboarding')} />
          <Button variant="secondary" title={t('welcome.haveAccount')} onPress={() => router.push('/login')} />
          <Text variant="small" color={Colors.textMuted} center>
            {t('welcome.socialProof')}
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: Spacing.lg, width: '100%', maxWidth: 480, alignSelf: 'center' },
  top: { paddingTop: Spacing.sm, alignItems: 'flex-end' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
  markWrap: { alignItems: 'center', justifyContent: 'center', width: 180, height: 180 },
  headline: { fontSize: 28, lineHeight: 36 },
  highlights: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.xs },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(26, 33, 80, 0.7)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actions: { gap: Spacing.sm, paddingBottom: Spacing.md },
});
