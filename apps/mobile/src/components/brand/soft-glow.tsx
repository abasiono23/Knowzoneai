import { useId } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { usePulse } from '../onboarding/use-float';

type Props = { color: string; size?: number; opacity?: number; style?: StyleProp<ViewStyle>; pulse?: boolean };

/** Soft, feathered light behind hero elements (a radial gradient, not a hard disc). */
export function SoftGlow({ color, size = 280, opacity = 0.55, style, pulse = true }: Props) {
  const id = useId().replace(/:/g, '');
  const breathe = usePulse(0.92, 1.08, 2800);
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', width: size, height: size }, style, pulse && breathe]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={`g${id}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset="0.45" stopColor={color} stopOpacity={opacity * 0.4} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#g${id})`} />
      </Svg>
    </Animated.View>
  );
}
