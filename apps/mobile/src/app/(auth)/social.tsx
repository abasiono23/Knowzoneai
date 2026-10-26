import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { GoogleG } from '@/components/auth/social-buttons';
import { LogoMark } from '@/components/brand/logo';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import i18n from '@/i18n';
import { errorText } from '@/i18n/errors';
import { auth } from '@/lib/auth';
import { useSession } from '@/lib/session';

const SHARED = [
  { icon: 'person-circle-outline', key: 'name' },
  { icon: 'mail-outline', key: 'email' },
  { icon: 'image-outline', key: 'photo' },
] as const;

/**
 * Hand-off screen while Google / Apple sign-in completes (Supabase OAuth; simulated in mock mode).
 * On the web the browser leaves for the provider and returns here to finish.
 */
export default function SocialSignInScreen() {
  const { provider = 'google' } = useLocalSearchParams<{ provider?: 'google' | 'apple' }>();
  const { t } = useTranslation('auth');
  const { signIn } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const name = provider === 'apple' ? 'Apple' : 'Google';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      try {
        // On the web, Google / Apple send the browser back here; finish that first.
        const back = attempt === 0 ? await auth.finishRedirect() : null;
        const res = back ?? (await auth.social(provider));
        if (res === 'redirecting' || cancelled) return;
        await signIn(res.token, res.user);
        if (!res.user.termsAccepted) router.replace('/terms');
        else if (!res.user.onboardingComplete) router.replace('/referral');
        // Fully onboarded users are routed into the app by the root guard.
      } catch (e) {
        // i18n.t rather than the hook's t, so a language change doesn't restart sign-in.
        if (!cancelled) setError(errorText(e, i18n.t('auth:social.failed', { provider: name })));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [provider, attempt, signIn, name]);

  return (
    <AuthScreen
      center
      backdrop="hero"
      footer={
        error ? (
          <>
            <Button title={t('actions.retry', { ns: 'common' })} onPress={() => setAttempt((a) => a + 1)} />
            <Button variant="secondary" title={t('social.useEmail')} onPress={() => router.replace('/sign-up')} />
          </>
        ) : null
      }>
      <View style={styles.handshake}>
        <View style={[styles.providerTile, provider === 'apple' ? styles.appleTile : styles.googleTile]}>
          {provider === 'apple' ? <Ionicons name="logo-apple" size={40} color="#fff" /> : <GoogleG size={40} />}
        </View>
        <Dots failed={!!error} />
        <LogoMark size={80} />
      </View>

      <View style={{ gap: Spacing.xs }}>
        <Text variant="title" center>
          {error ? t('social.errorTitle') : t('social.connecting', { provider: name })}
        </Text>
        <Text color={error ? Colors.danger : Colors.textSecondary} center>
          {error ?? t('social.hangTight')}
        </Text>
      </View>

      {!error && (
        <Animated.View entering={FadeIn.delay(300)}>
          <Card style={{ gap: Spacing.sm }}>
            <Text variant="label" color={Colors.textMuted}>
              {t('social.willReceive')}
            </Text>
            {SHARED.map((s) => (
              <View key={s.key} style={styles.sharedRow}>
                <Ionicons name={s.icon} size={18} color={Colors.textSecondary} />
                <Text variant="small">{t(`social.shared.${s.key}`)}</Text>
              </View>
            ))}
            <View style={styles.sharedRow}>
              <Ionicons name="shield-checkmark" size={18} color={Colors.success} />
              <Text variant="small" color={Colors.success}>
                {t('social.neverPost')}
              </Text>
            </View>
          </Card>
        </Animated.View>
      )}
    </AuthScreen>
  );
}

function Dots({ failed }: { failed: boolean }) {
  return (
    <View style={styles.dots}>
      {failed ? (
        <Ionicons name="close-circle" size={24} color={Colors.danger} />
      ) : (
        [0, 1, 2].map((i) => <Dot key={i} i={i} />)
      )}
    </View>
  );
}

function Dot({ i }: { i: number }) {
  const t = useSharedValue(0.3);
  useEffect(() => {
    t.value = withDelay(
      i * 180,
      withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })), -1),
    );
  }, [t, i]);
  return <DotView t={t} />;
}

function DotView({ t }: { t: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({ opacity: t.value, transform: [{ scale: 0.7 + t.value * 0.5 }] }));
  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  handshake: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  providerTile: { width: 80, height: 80, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  googleTile: { backgroundColor: '#fff' },
  appleTile: { backgroundColor: '#000', borderWidth: 1, borderColor: Colors.borderStrong },
  dots: { flexDirection: 'row', gap: 6, width: 48, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: Radius.pill, backgroundColor: Colors.primary },
  sharedRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
