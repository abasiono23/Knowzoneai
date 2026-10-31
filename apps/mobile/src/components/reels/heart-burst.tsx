import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, type GestureResponderEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export type Heart = { id: number; x: number; y: number; tilt: number };

/** When a tap happened (for spotting a double tap). Only called from tap handlers. */
export const tapTime = () => Date.now();

/** A heart where the finger tapped, tilted a little at random. */
export const heartAt = (e: GestureResponderEvent): Heart => ({
  id: Date.now() + Math.random(),
  x: e.nativeEvent.pageX,
  y: e.nativeEvent.pageY,
  tilt: Math.round(Math.random() * 30 - 15),
});

/** The heart that pops up where you double-tapped to like, floats up and fades. */
export function HeartBurst({ heart }: { heart: Heart }) {
  const scale = useSharedValue(0);
  const rise = useSharedValue(0);
  const fade = useSharedValue(1);
  useEffect(() => {
    scale.set(withSequence(withSpring(1.25, { damping: 6, stiffness: 260 }), withTiming(1, { duration: 120 })));
    rise.set(withDelay(350, withTiming(-90, { duration: 550, easing: Easing.out(Easing.quad) })));
    fade.set(withDelay(450, withTiming(0, { duration: 450 })));
  }, [scale, rise, fade]);
  const style = useAnimatedStyle(() => ({
    opacity: fade.get(),
    transform: [{ translateY: rise.get() }, { scale: scale.get() }, { rotate: `${heart.tilt}deg` }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[styles.heart, { left: heart.x - 50, top: heart.y - 50 }, style]}>
      <Ionicons name="heart" size={100} color="#FF4D6D" style={styles.shadow} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  heart: { position: 'absolute', width: 100, height: 100, zIndex: 20 },
  shadow: { textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 12 },
});
