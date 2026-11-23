import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { W } from '@/components/games/ui';
import type { WorldId } from '@/lib/world/types';

/** Each world's accent: small marks only (cover, progress, level badges), never a whole screen. */
export const WORLD_ACCENT: Record<WorldId, string> = {
  space: '#2F55C8',
  math: '#6A45FF',
  nature: '#0E8A5F',
  language: '#C2502A',
  history: '#9A6A12',
  code: '#0F7A82',
  art: '#C0306A',
};

const FONT = 'Manrope_800ExtraBold';

/**
 * A world's cover, drawn in code like a textbook figure: an orbit, a graph, a double helix, letterforms,
 * a timeline, code brackets, a colour wheel. Decorative; the world's name is always written next to it.
 * `locked` draws it in grey.
 */
export function WorldCover({ world, size = 64, locked }: { world: WorldId; size?: number; locked?: boolean }) {
  const accent = locked ? W.muted : WORLD_ACCENT[world];
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, borderRadius: size * 0.22, overflow: 'hidden' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Rect x={0} y={0} width={100} height={100} fill={accent} opacity={locked ? 0.08 : 0.1} />
        <G opacity={locked ? 0.55 : 1}>{DRAW[world](accent)}</G>
      </Svg>
    </View>
  );
}

const DRAW: Record<WorldId, (a: string) => ReactNode> = {
  // A planet's orbit around a star, with the planet on it.
  space: (a) => (
    <>
      <Ellipse cx={50} cy={52} rx={36} ry={16} fill="none" stroke={W.ink} strokeWidth={2} transform="rotate(-18 50 52)" />
      <Circle cx={50} cy={52} r={11} fill={a} />
      <Circle cx={80} cy={38} r={5.5} fill={W.ink} />
      <Circle cx={22} cy={24} r={1.6} fill={W.ink} />
      <Circle cx={78} cy={78} r={1.6} fill={W.ink} />
      <Circle cx={30} cy={80} r={1.2} fill={W.ink} />
    </>
  ),
  // Axes and a parabola through marked points.
  math: (a) => (
    <>
      <Line x1={18} y1={80} x2={84} y2={80} stroke={W.ink} strokeWidth={2} />
      <Line x1={24} y1={86} x2={24} y2={16} stroke={W.ink} strokeWidth={2} />
      <Path d="M30 22 Q52 118 76 22" fill="none" stroke={a} strokeWidth={4} strokeLinecap="round" />
      <Circle cx={53} cy={70} r={4} fill={W.ink} />
      <Circle cx={36} cy={42} r={3} fill="#fff" stroke={W.ink} strokeWidth={2} />
      <Circle cx={70} cy={42} r={3} fill="#fff" stroke={W.ink} strokeWidth={2} />
    </>
  ),
  // A double helix with its base pairs.
  nature: (a) => (
    <>
      {[26, 36, 46, 56, 66, 76].map((y, k) => {
        const w = Math.abs(Math.sin(((y - 18) / 64) * Math.PI * 1.5)) * 22;
        return <Line key={y} x1={50 - w} y1={y} x2={50 + w} y2={y} stroke={k % 2 ? a : W.ink} strokeWidth={2.5} strokeLinecap="round" />;
      })}
      <Path d="M28 18 C72 34 72 50 50 58 C28 66 28 80 72 86" fill="none" stroke={W.ink} strokeWidth={3} strokeLinecap="round" />
      <Path d="M72 18 C28 34 28 50 50 58 C72 66 72 80 28 86" fill="none" stroke={a} strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  // Letterforms on a baseline, with an accent mark.
  language: (a) => (
    <>
      <SvgText x={50} y={66} fontSize={46} fontFamily={FONT} fontWeight="800" fill={W.ink} textAnchor="middle">
        Aa
      </SvgText>
      <Line x1={18} y1={74} x2={82} y2={74} stroke={a} strokeWidth={3} strokeLinecap="round" />
      <Path d="M66 22 l6 -8 M74 22 l6 -8" stroke={a} strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  // A timeline with dated marks and a column.
  history: (a) => (
    <>
      <Rect x={40} y={18} width={20} height={6} rx={1.5} fill={W.ink} />
      {[43, 49, 55].map((x) => (
        <Rect key={x} x={x - 1.6} y={26} width={3.2} height={30} fill={W.ink} />
      ))}
      <Rect x={38} y={56} width={24} height={5} rx={1.5} fill={W.ink} />
      <Line x1={12} y1={76} x2={88} y2={76} stroke={W.ink} strokeWidth={2} />
      {[22, 50, 78].map((x, k) => (
        <Circle key={x} cx={x} cy={76} r={k === 1 ? 5 : 3.5} fill={k === 1 ? a : '#fff'} stroke={k === 1 ? a : W.ink} strokeWidth={2} />
      ))}
    </>
  ),
  // Code brackets around a few lines of code.
  code: (a) => (
    <>
      <Path d="M30 30 L16 50 L30 70" fill="none" stroke={W.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M70 30 L84 50 L70 70" fill="none" stroke={W.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <Rect x={38} y={36} width={22} height={5} rx={2.5} fill={a} />
      <Rect x={44} y={48} width={18} height={5} rx={2.5} fill={W.ink} opacity={0.75} />
      <Rect x={44} y={60} width={12} height={5} rx={2.5} fill={a} opacity={0.6} />
    </>
  ),
  // Three overlapping colour circles (a colour model) on a canvas edge.
  art: (a) => (
    <>
      <Circle cx={40} cy={42} r={17} fill={a} opacity={0.85} />
      <Circle cx={60} cy={42} r={17} fill="#E2A100" opacity={0.75} />
      <Circle cx={50} cy={60} r={17} fill="#2F55C8" opacity={0.65} />
      <Line x1={18} y1={86} x2={82} y2={86} stroke={W.ink} strokeWidth={2} />
    </>
  ),
};
