import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  type SharedValue,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { Glassware } from '@/lib/api';

const ARect = Animated.createAnimatedComponent(Rect);
const ACircle = Animated.createAnimatedComponent(Circle);
const AEllipse = Animated.createAnimatedComponent(Ellipse);

/** Outline and inside of each piece of glassware, in a 100 × 160 box. */
const SHAPES: Record<Glassware, { outline: string; inside: string; top: number; bottom: number }> = {
  tube: {
    outline: 'M38 6 H62 V138 A12 12 0 0 1 38 138 Z',
    inside: 'M40 8 H60 V138 A10 10 0 0 1 40 138 Z',
    top: 8,
    bottom: 148,
  },
  beaker: {
    outline: 'M14 18 H86 V150 Q86 156 80 156 H20 Q14 156 14 150 Z',
    inside: 'M16 20 H84 V150 Q84 154 80 154 H20 Q16 154 16 150 Z',
    top: 20,
    bottom: 154,
  },
  flask: {
    outline: 'M40 6 H60 V54 L92 146 Q94 156 84 156 H16 Q6 156 8 146 L40 54 Z',
    inside: 'M42 8 H58 V55 L90 146 Q91 154 84 154 H16 Q9 154 10 146 L42 55 Z',
    top: 8,
    bottom: 154,
  },
};

/**
 * A piece of glassware with liquid that fills (0–1), changes colour, and can show a precipitate,
 * gas bubbles or a coating, like the real reaction.
 */
export function Glass({
  kind,
  height,
  level,
  from,
  to,
  reacted,
  precipitate,
  gas,
  coating,
}: {
  kind: Glassware;
  height: number;
  /** How full (0–1). */
  level: number;
  /** Liquid colour before the reaction. */
  from: string;
  /** Liquid colour after it. */
  to: string;
  reacted: boolean;
  precipitate?: string;
  gas?: boolean;
  coating?: string;
}) {
  const shape = SHAPES[kind];
  const fill = useSharedValue(0);
  const react = useSharedValue(0);
  const bubble = useSharedValue(0);

  useEffect(() => {
    fill.set(withTiming(level, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [fill, level]);
  useEffect(() => {
    react.set(reacted ? withDelay(300, withTiming(1, { duration: 1800 })) : withTiming(0, { duration: 200 }));
  }, [react, reacted]);
  useEffect(() => {
    bubble.set(gas && reacted ? withRepeat(withTiming(1, { duration: 1100, easing: Easing.linear }), -1) : 0);
  }, [bubble, gas, reacted]);

  const span = shape.bottom - shape.top;
  const liquidProps = useAnimatedProps(() => {
    const h = span * fill.get() * 0.82;
    return { y: shape.bottom - h, height: h };
  });
  // The new colour fades in over the old one (numbers animate reliably on every platform).
  const reactedLiquid = useAnimatedProps(() => {
    const h = span * fill.get() * 0.82;
    return { y: shape.bottom - h, height: h, opacity: 0.9 * react.get() };
  });
  const sediment = useAnimatedProps(() => ({ opacity: react.get(), ry: 10 * react.get() }));
  const cloud = useAnimatedProps(() => ({ opacity: precipitate ? 0.35 * (1 - Math.abs(react.get() - 0.5) * 2) : 0 }));
  const cx = 50;

  return (
    <View style={{ width: (height * 100) / 160, height }}>
      <Svg width="100%" height="100%" viewBox="0 0 100 160">
        <Defs>
          <ClipPath id={`in-${kind}`}>
            <Path d={shape.inside} />
          </ClipPath>
          <LinearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.35" />
            <Stop offset="0.3" stopColor="#FFFFFF" stopOpacity="0.06" />
            <Stop offset="0.85" stopColor="#FFFFFF" stopOpacity="0.04" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.3" />
          </LinearGradient>
        </Defs>
        <G clipPath={`url(#in-${kind})`}>
          <ARect x={0} width={100} fill={from} animatedProps={liquidProps} opacity={0.88} />
          <ARect x={0} width={100} fill={to} animatedProps={reactedLiquid} />
          {!!precipitate && <ARect x={0} y={0} width={100} height={160} fill={precipitate} animatedProps={cloud} />}
          {!!precipitate && (
            <AEllipse cx={cx} cy={shape.bottom - 4} rx={46} fill={precipitate} animatedProps={sediment} />
          )}
          {!!coating && <AEllipse cx={cx} cy={shape.bottom - 30} rx={6} fill={coating} animatedProps={sediment} />}
          {[0, 1, 2, 3].map((k) => (
            <Bubble
              key={k}
              k={k}
              cx={cx - 12 + k * 8}
              bottom={shape.bottom}
              span={span}
              fill={fill}
              bubble={bubble}
              on={!!gas && reacted}
            />
          ))}
        </G>
        <Path d={shape.inside} fill="url(#glass)" />
        <Path d={shape.outline} fill="none" stroke="rgba(235,242,255,0.85)" strokeWidth={2.2} />
      </Svg>
    </View>
  );
}

/** One rising gas bubble (a quarter of the cycle apart from the next). */
function Bubble({
  k,
  cx,
  bottom,
  span,
  fill,
  bubble,
  on,
}: {
  k: number;
  cx: number;
  bottom: number;
  span: number;
  fill: SharedValue<number>;
  bubble: SharedValue<number>;
  on: boolean;
}) {
  const props = useAnimatedProps(() => {
    const t = (bubble.get() + k / 4) % 1;
    const h = span * fill.get() * 0.82;
    return { cy: bottom - 6 - t * Math.max(0, h - 10), opacity: on ? 1 - t * 0.6 : 0 };
  });
  return <ACircle cx={cx} r={2.6} fill="#FFFFFF" animatedProps={props} />;
}
