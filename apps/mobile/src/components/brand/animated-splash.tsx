import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Text } from '@/components/ui';
import { Colors } from '@/constants/theme';

import { Backdrop } from './backdrop';
import { LogoMark, Wordmark } from './logo';

const MIN_VISIBLE_MS = 1600;

/**
 * In-app splash that continues seamlessly from the native splash (same navy +
 * mark): the mark springs in, the wordmark and tagline rise, then it fades away
 * once the app is ready.
 */
export function AnimatedSplash({ ready }: { ready: boolean }) {
  const { t } = useTranslation('auth');
  const [visible, setVisible] = useState(true);
  const [minElapsed, setMinElapsed] = useState(false);
  const mark = useSharedValue(0);
  const text = useSharedValue(0);
  const exit = useSharedValue(1);

  useEffect(() => {
    mark.value = withSequence(withSpring(1.08, { damping: 10, stiffness: 120 }), withSpring(1));
    text.value = withDelay(450, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
    const timer = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [mark, text]);

  useEffect(() => {
    if (ready && minElapsed) {
      exit.value = withTiming(0, { duration: 450 }, (finished) => {
        if (finished) scheduleOnRN(setVisible, false);
      });
    }
  }, [ready, minElapsed, exit]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: exit.value }));
  const markStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.6 + 0.4 * mark.value }],
    opacity: Math.min(1, mark.value * 1.5),
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: text.value,
    transform: [{ translateY: (1 - text.value) * 16 }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.container, containerStyle]}
      pointerEvents={ready ? 'none' : 'auto'}>
      <Backdrop variant="hero" />
      <View style={styles.center}>
        <Animated.View style={markStyle}>
          <LogoMark size={128} />
        </Animated.View>
        <Animated.View style={[styles.text, textStyle]}>
          <Wordmark fontSize={30} />
          <Text variant="body" color={Colors.textSecondary} center>
            {t('splash.tagline')}
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { zIndex: 100, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  text: { alignItems: 'center', gap: 8 },
});
