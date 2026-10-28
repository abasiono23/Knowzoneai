import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { BookBackground } from '@/components/brand/book-background';
import { Palette } from '@/constants/theme';

type Glow = { color: string; x: number; y: number; r: number; opacity: number };

const PRESETS: Record<'default' | 'hero' | 'reward', Glow[]> = {
  default: [
    { color: Palette.purple500, x: 0.1, y: 0.0, r: 0.6, opacity: 0.35 },
    { color: Palette.teal500, x: 1.0, y: 0.9, r: 0.55, opacity: 0.18 },
  ],
  hero: [
    { color: Palette.purple500, x: 0.5, y: 0.28, r: 0.7, opacity: 0.5 },
    { color: Palette.teal500, x: 0.95, y: 0.95, r: 0.6, opacity: 0.22 },
    { color: '#B04CFF', x: 0.0, y: 0.7, r: 0.5, opacity: 0.18 },
  ],
  reward: [
    { color: Palette.gold400, x: 0.5, y: 0.25, r: 0.6, opacity: 0.28 },
    { color: Palette.purple500, x: 0.0, y: 0.9, r: 0.6, opacity: 0.3 },
    { color: Palette.teal500, x: 1.0, y: 0.6, r: 0.5, opacity: 0.18 },
  ],
};

/** The book background with soft colour glows: the signature Knowzone background. */
export function Backdrop({ variant = 'default' }: { variant?: keyof typeof PRESETS }) {
  const glows = PRESETS[variant];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <BookBackground />
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          {glows.map((g, i) => (
            <RadialGradient
              key={i}
              id={`glow-${variant}-${i}`}
              cx={g.x}
              cy={g.y}
              r={g.r}
              gradientUnits="objectBoundingBox">
              <Stop offset="0" stopColor={g.color} stopOpacity={g.opacity * 0.4} />
              <Stop offset="1" stopColor={g.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {glows.map((_, i) => (
          <Rect key={i} width="100%" height="100%" fill={`url(#glow-${variant}-${i})`} />
        ))}
      </Svg>
    </View>
  );
}
