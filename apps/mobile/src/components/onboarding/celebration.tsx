import { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { Palette } from '@/constants/theme';

const COLORS = [Palette.purple400, Palette.teal400, Palette.gold400, Palette.coral400, Palette.sky400, '#FFFFFF'];
const COUNT = 42;

/** Deterministic pseudo-random in [0, 1): keeps render pure while looking random. */
function rand(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

type Piece = { x: number; drift: number; size: number; color: string; delay: number; spin: number; round: boolean };

/** One-shot confetti burst for big moments (verification, onboarding complete). */
export function Celebration() {
  const { width, height } = useWindowDimensions();
  const progress = useSharedValue(0);

  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        x: (i / COUNT) * width + (rand(i, 1) - 0.5) * 40,
        drift: (rand(i, 2) - 0.5) * 120,
        size: 6 + rand(i, 3) * 8,
        color: COLORS[i % COLORS.length],
        delay: rand(i, 4) * 0.25,
        spin: (rand(i, 5) - 0.5) * 900,
        round: rand(i, 6) > 0.6,
      })),
    [width],
  );

  useEffect(() => {
    progress.value = withDelay(150, withTiming(1, { duration: 2800, easing: Easing.out(Easing.quad) }));
  }, [progress]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((p, i) => (
        <Confetto key={i} piece={p} progress={progress} height={height} />
      ))}
    </View>
  );
}

function Confetto({ piece, progress, height }: { piece: Piece; progress: SharedValue<number>; height: number }) {
  const style = useAnimatedStyle(() => {
    const t = Math.max(0, Math.min(1, (progress.value - piece.delay) / (1 - piece.delay)));
    return {
      opacity: t === 0 ? 0 : 1 - Math.max(0, t - 0.75) * 4,
      transform: [
        { translateX: piece.x + piece.drift * t },
        { translateY: -40 + t * (height * 0.9) },
        { rotate: `${piece.spin * t}deg` },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: piece.size,
          height: piece.round ? piece.size : piece.size * 0.45,
          borderRadius: piece.round ? piece.size / 2 : 2,
          backgroundColor: piece.color,
        },
        style,
      ]}
    />
  );
}
