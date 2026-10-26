import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { Colors } from '@/constants/theme';

/** Circular progress with a gradient stroke and anything in the middle. */
export function ProgressRing({
  progress,
  size = 140,
  stroke = 12,
  colors = [Colors.success, '#4CC9FF'],
  children,
}: {
  progress: number;
  size?: number;
  stroke?: number;
  colors?: readonly [string, string];
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors[0]} />
            <Stop offset="1" stopColor={colors[1]} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={Colors.surfaceRaised} strokeWidth={stroke} fill="none" />
        {pct > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="url(#ring)"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${c * pct} ${c}`}
          />
        )}
      </Svg>
      {children}
    </View>
  );
}
