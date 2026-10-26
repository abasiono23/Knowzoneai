import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/theme';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  colors?: readonly [string, string, ...string[]];
  size?: number;
};

/** Big animated success mark: badge pops in, rings ripple outward. */
export function SuccessBadge({ icon = 'checkmark', colors = ['#14C8B4', '#4CC9FF'], size = 120 }: Props) {
  const pop = useSharedValue(0);
  const ripple = useSharedValue(0);

  useEffect(() => {
    pop.value = withSpring(1, { damping: 9, stiffness: 140 });
    ripple.value = withDelay(250, withRepeat(withTiming(1, { duration: 2000, easing: Easing.out(Easing.quad) }), -1));
  }, [pop, ripple]);

  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const ringA = useAnimatedStyle(() => rippleFrame(ripple.value));
  const ringB = useAnimatedStyle(() => rippleFrame((ripple.value + 0.5) % 1));

  const ring = { width: size, height: size, borderRadius: size / 2, borderColor: colors[0] };

  return (
    <View style={[styles.wrap, { width: size * 2, height: size * 2 }]}>
      <Animated.View style={[styles.ring, ring, ringA]} />
      <Animated.View style={[styles.ring, ring, ringB]} />
      <Animated.View style={badgeStyle}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.badge, { width: size, height: size, borderRadius: size / 2, shadowColor: colors[0] }]}>
          <Ionicons name={icon} size={size * 0.5} color={Colors.textOnAccent} />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

function rippleFrame(t: number) {
  'worklet';
  return { opacity: 0.5 * (1 - t), transform: [{ scale: 1 + t * 0.9 }] };
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  ring: { position: 'absolute', borderWidth: 2 },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.6,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
});
