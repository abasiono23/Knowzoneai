import { View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { W } from '@/components/games/ui';

const INK = W.ink;
const FILL = '#EFE7D6';

/**
 * A find drawn like a catalogue illustration: ink outlines on a parchment tone. Decorative (the find's
 * name and clue are always written beside it). `art` is the kind the server sends.
 */
export function Artefact({ art, size = 64 }: { art: string; size?: number }) {
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants" style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Rect x={1} y={1} width={62} height={62} rx={10} fill="#F7F2E7" stroke={W.line} />
        <G stroke={INK} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" fill={FILL}>
          {DRAW[art] ?? DRAW.pottery}
        </G>
      </Svg>
    </View>
  );
}

const DRAW: Record<string, React.ReactNode> = {
  // A sculpted head (terracotta or bronze).
  hero: (
    <G>
      <Path d="M32 12 C22 12 18 20 18 29 C18 40 24 48 32 48 C40 48 46 40 46 29 C46 20 42 12 32 12 Z" />
      <Path d="M24 27 L29 25 L29 29 Z M40 27 L35 25 L35 29 Z" fill={INK} />
      <Path d="M32 30 L30 37 L34 37" fill="none" />
      <Path d="M27 41 Q32 44 37 41" fill="none" />
      <Path d="M24 48 L22 54 L42 54 L40 48" />
    </G>
  ),
  figure: (
    <G>
      <Circle cx={32} cy={16} r={6} />
      <Path d="M24 26 Q32 22 40 26 L38 44 L26 44 Z" />
      <Path d="M27 44 L26 54 M37 44 L38 54" fill="none" />
      <Path d="M22 54 L42 54" fill="none" />
    </G>
  ),
  pottery: (
    <G>
      <Path d="M24 12 L40 12 L38 18 C48 24 48 42 40 50 L24 50 C16 42 16 24 26 18 Z" />
      <Path d="M21 30 L43 30 M20 36 L44 36" fill="none" />
      <Path d="M24 33 L28 30 L32 33 L36 30 L40 33" fill="none" />
    </G>
  ),
  beads: (
    <G>
      <Path d="M12 18 Q32 52 52 18" fill="none" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const t = i / 6;
        const x = 12 + 40 * t;
        const y = 18 + 4 * 34 * t * (1 - t) * 0.95;
        return <Ellipse key={i} cx={x} cy={y} rx={4} ry={3.2} />;
      })}
    </G>
  ),
  jewellery: (
    <G>
      <Circle cx={32} cy={32} r={14} fill="none" strokeWidth={4} stroke={INK} />
      <Circle cx={32} cy={18} r={4} />
    </G>
  ),
  tool: (
    <G>
      <Path d="M20 50 L40 18" fill="none" strokeWidth={3} />
      <Path d="M34 14 C42 10 50 14 50 20 L40 26 Z" />
    </G>
  ),
  weapon: (
    <G>
      <Path d="M32 8 L37 22 L34 22 L34 48 L30 48 L30 22 L27 22 Z" />
      <Path d="M24 48 L40 48 M32 48 L32 56" fill="none" />
    </G>
  ),
  tablet: (
    <G>
      <Rect x={16} y={12} width={32} height={40} rx={4} />
      {[20, 26, 32, 38, 44].map((y) => (
        <Path key={y} d={`M21 ${y} l3 2 l3 -2 l3 2 M33 ${y} l4 0 M39 ${y} l3 2`} fill="none" strokeWidth={1.4} />
      ))}
    </G>
  ),
  coin: (
    <G>
      <Circle cx={32} cy={32} r={18} />
      <Circle cx={32} cy={32} r={13} fill="none" strokeWidth={1.2} />
      <Path d="M28 26 Q32 22 36 26 L36 36 Q32 40 28 36 Z" fill="none" />
    </G>
  ),
  mask: (
    <G>
      <Path d="M18 16 Q32 8 46 16 L44 38 Q32 56 20 38 Z" />
      <Ellipse cx={26} cy={28} rx={4} ry={2.5} fill={INK} />
      <Ellipse cx={38} cy={28} rx={4} ry={2.5} fill={INK} />
      <Path d="M28 42 Q32 45 36 42" fill="none" />
      <Path d="M22 20 L28 22 M42 20 L36 22" fill="none" />
    </G>
  ),
  building: (
    <G>
      <Path d="M12 22 L32 10 L52 22 Z" />
      <Rect x={14} y={22} width={36} height={4} />
      {[17, 25, 33, 41].map((x) => (
        <Rect key={x} x={x} y={26} width={5} height={20} />
      ))}
      <Rect x={12} y={46} width={40} height={5} />
    </G>
  ),
  textile: (
    <G>
      <Rect x={14} y={14} width={36} height={36} rx={2} />
      {[20, 26, 32, 38, 44].map((v) => (
        <G key={v}>
          <Line x1={v} y1={14} x2={v} y2={50} strokeWidth={1} />
          <Line x1={14} y1={v} x2={50} y2={v} strokeWidth={1} />
        </G>
      ))}
      <Path d="M20 32 L32 20 L44 32 L32 44 Z" fill="none" strokeWidth={2} />
    </G>
  ),
  bone: (
    <G>
      <Path d="M18 22 a5 5 0 1 1 6 -6 L40 36 a5 5 0 1 1 6 6 a5 5 0 1 1 -6 6 L24 28 a5 5 0 1 1 -6 -6 Z" transform="rotate(10 32 32)" />
    </G>
  ),
};
