import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '@/components/ui/gradient';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { Screen, Text } from '@/components/ui';
import { Colors, Gradients, Spacing } from '@/constants/theme';

/** The spinning lock with a checklist of steps, shown while a payment or store purchase is under way. */
export function ProcessingView({
  title,
  body,
  steps,
  step,
}: {
  title: string;
  body: string;
  steps: string[];
  step: number;
}) {
  const spin = useSharedValue(0);
  useEffect(() => {
    spin.set(withRepeat(withTiming(1, { duration: 1100, easing: Easing.linear }), -1));
  }, [spin]);
  const ring = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.get() * 360}deg` }] }));

  return (
    <Screen withTabBar={false} scroll={false}>
      <View style={styles.center}>
        <View style={styles.spinner}>
          <Animated.View style={[StyleSheet.absoluteFill, ring]}>
            <LinearGradient colors={Gradients.aiGlow} style={styles.ring} />
          </Animated.View>
          <View style={styles.inner}>
            <Ionicons name="lock-closed" size={32} color={Colors.text} />
          </View>
        </View>
        <Text variant="title" center>
          {title}
        </Text>
        <Text variant="body" color={Colors.textSecondary} center>
          {body}
        </Text>
        <View style={{ gap: Spacing.sm, alignSelf: 'stretch', paddingHorizontal: Spacing.lg }}>
          {steps.map((s, i) => (
            <View key={s} style={styles.step}>
              <Ionicons
                name={i < step ? 'checkmark-circle' : i === step ? 'ellipse' : 'ellipse-outline'}
                size={18}
                color={i < step ? Colors.success : i === step ? Colors.primary : Colors.textMuted}
              />
              <Text variant="small" color={i <= step ? Colors.text : Colors.textMuted}>
                {s}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  spinner: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  ring: { flex: 1, borderRadius: 60 },
  inner: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
});
