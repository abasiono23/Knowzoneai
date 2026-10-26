import { useEffect } from 'react';
import { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

/** Gentle up-and-down bob that makes illustrations feel alive. */
export function useFloat(amplitude = 8, duration = 2400, delay = 0) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [t, duration, delay]);
  return useAnimatedStyle(() => ({ transform: [{ translateY: (t.value - 0.5) * 2 * amplitude }] }));
}

/** Soft breathing scale, used for glows and the level ring. */
export function usePulse(min = 0.92, max = 1.08, duration = 1800) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [t, duration]);
  return useAnimatedStyle(() => ({ transform: [{ scale: min + (max - min) * t.value }] }));
}
