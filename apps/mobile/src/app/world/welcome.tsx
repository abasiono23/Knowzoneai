import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useSession } from '@/lib/session';
import { useWorld } from '@/lib/world/store';

/** Made with OpenAI (apps/server/scripts/world-art.ts): a student riding a laptop past the seven worlds. */
const WELCOME_HERO = require('@/assets/images/world/welcome-hero.webp');

/** Screen 129: welcome to Knowzone World. A student flies past the seven worlds. */
export default function WorldWelcomeScreen() {
  const { t } = useTranslation('world');
  const { user } = useSession();
  const { settings } = useWorld();
  const float = useSharedValue(0);
  useEffect(() => {
    if (settings.reduceMotion) return;
    float.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [float, settings.reduceMotion]);
  const bob = useAnimatedStyle(() => ({ transform: [{ translateY: -10 * float.value }] }));

  return (
    <LinearGradient colors={['#1B1150', '#3B2DBF', Colors.backgroundDeep]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.wrap}>
        <Animated.View entering={ZoomIn.springify()} style={[styles.art, bob]}>
          <Image source={WELCOME_HERO} style={StyleSheet.absoluteFill} contentFit="contain" accessible={false} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(500)} style={{ gap: Spacing.sm, alignItems: 'center' }}>
          <Text variant="label" color={Colors.reward}>
            {user ? t('welcome.eyebrowName', { name: user.name.split(' ')[0].toUpperCase() }) : t('welcome.eyebrow')}
          </Text>
          <Text variant="display" center>
            {t('welcome.title')}
          </Text>
          <Text color="rgba(255,255,255,0.85)" center>
            {t('welcome.body')}
          </Text>
        </Animated.View>
        <View style={{ alignSelf: 'stretch', gap: Spacing.xs, marginTop: 'auto' }}>
          <Button title={t('welcome.go')} icon="rocket" onPress={() => router.replace('/world/intro')} />
          <Button variant="ghost" title={t('welcome.later')} onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.lg,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  art: { width: '100%', maxWidth: 340, aspectRatio: 1, marginTop: Spacing.md },
});
