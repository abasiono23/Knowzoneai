import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Polyline, Rect, Text as SvgText } from 'react-native-svg';

import { W } from '@/components/games/ui';

import type { SubjectGameId } from './contract';

const FONT = 'Manrope_800ExtraBold';
const INK: string = W.ink;

/** Each subject game's accent: small marks only (cover, level badge), never a whole screen. */
export const SUBJECT_ACCENT: Record<SubjectGameId, string> = {
  // Chemistry
  'mixture-lab': '#0F8F7E',
  'element-quest': '#6A45FF',
  'molecule-builder': '#1C7FC0',
  'reaction-rush': '#D2436A',
  'mystery-substance': '#C27C0E',
  // Business
  'startup-tycoon': '#6A45FF',
  'budget-master': '#0F8F7E',
  'market-master': '#C27C0E',
  'profit-quest': '#1C7FC0',
  'market-simulator': '#D2436A',
  // History
  'time-machine': '#6A45FF',
  'lost-civilization': '#C27C0E',
  'africa-explorer': '#0F8F7E',
  // Space
  'galaxy-defender': '#6A45FF',
  'asteroid-survival': '#D2436A',
  'rocket-builder': '#1C7FC0',
  'gravity-master': '#0F8F7E',
  'solar-explorer': '#C27C0E',
  // Tech
  'code-runner': '#1C7FC0',
  'cyber-defender': '#D2436A',
  'robot-rescue': '#0F8F7E',
  'binary-breaker': '#6A45FF',
  'circuit-master': '#C27C0E',
};

/**
 * A subject game's cover, drawn in code like a textbook figure (a flask, a pie chart, a timeline, an orbit,
 * a circuit) on a soft square in the game's accent. Decorative: the game's name is always written next to it.
 */
export function SubjectCover({ game, size = 64 }: { game: SubjectGameId; size?: number }) {
  const accent = SUBJECT_ACCENT[game] ?? W.focus;
  const draw = DRAW[game];
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, borderRadius: size * 0.22, overflow: 'hidden' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Rect x={0} y={0} width={100} height={100} fill={accent} opacity={0.1} />
        {draw ? draw(accent) : <Circle cx={50} cy={50} r={20} fill={accent} />}
      </Svg>
    </View>
  );
}

const label = (x: number, y: number, text: string, size: number, fill: string = INK, anchor: 'middle' | 'start' = 'middle') => (
  <SvgText x={x} y={y} fontSize={size} fontFamily={FONT} fontWeight="800" fill={fill} textAnchor={anchor}>
    {text}
  </SvgText>
);
const shadow = (x: number, y: number, w: number) => <Rect x={x} y={y} width={w} height={4} rx={2} fill={INK} opacity={0.1} />;
const S = { stroke: INK, strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const DRAW: Partial<Record<SubjectGameId, (accent: string) => ReactNode>> = {
  // ── Chemistry ──
  // A conical flask, half full, with a graduation mark.
  'mixture-lab': (a) => (
    <G>
      <Path d="M30 78 L44 44 L44 22 L56 22 L56 44 L70 78 Z" fill={a} opacity={0.22} />
      <Path d="M35 66 L65 66 L70 78 L30 78 Z" fill={a} />
      <Path d="M30 78 L44 44 L44 22 L56 22 L56 44 L70 78 Z" fill="none" {...S} />
      <Line x1={41} y1={22} x2={59} y2={22} {...S} />
      <Line x1={54} y1={52} x2={60} y2={52} stroke={INK} strokeWidth={1.6} />
      {shadow(26, 84, 48)}
    </G>
  ),
  // A periodic-table cell.
  'element-quest': (a) => (
    <G>
      <Rect x={24} y={20} width={52} height={58} rx={6} fill="#fff" stroke={INK} strokeWidth={2.2} />
      <Rect x={24} y={20} width={52} height={10} rx={3} fill={a} />
      {label(31, 41, '26', 9, INK, 'start')}
      {label(50, 63, 'Fe', 24)}
      {label(50, 73, '55.85', 7, W.inkSoft)}
      {shadow(26, 84, 48)}
    </G>
  ),
  // Ball-and-stick water.
  'molecule-builder': (a) => (
    <G>
      <Line x1={50} y1={42} x2={28} y2={62} stroke={INK} strokeWidth={4} />
      <Line x1={50} y1={42} x2={72} y2={62} stroke={INK} strokeWidth={4} />
      <Circle cx={50} cy={42} r={14} fill={a} stroke={INK} strokeWidth={2} />
      <Circle cx={28} cy={64} r={9} fill="#fff" stroke={INK} strokeWidth={2} />
      <Circle cx={72} cy={64} r={9} fill="#fff" stroke={INK} strokeWidth={2} />
      {label(50, 46.5, 'O', 12, '#fff')}
      {shadow(26, 84, 48)}
    </G>
  ),
  // A balanced equation with a reaction arrow.
  'reaction-rush': (a) => (
    <G>
      <Rect x={12} y={30} width={76} height={40} rx={6} fill="#fff" stroke={W.lineStrong} strokeWidth={1.6} />
      {label(26, 55, '2H₂', 11)}
      {label(40, 55, '+', 11, W.muted)}
      {label(50, 55, 'O₂', 11)}
      <Line x1={60} y1={51} x2={70} y2={51} stroke={a} strokeWidth={2.6} strokeLinecap="round" />
      <Polygon points="70,47 75,51 70,55" fill={a} />
      {label(80, 66, '?', 12, a)}
      {shadow(26, 80, 48)}
    </G>
  ),
  // A test tube with an unknown, and a question mark label.
  'mystery-substance': (a) => (
    <G>
      <Path d="M42 18 L42 70 A8 8 0 0 0 58 70 L58 18" fill="#fff" {...S} />
      <Path d="M42 48 L58 48 L58 70 A8 8 0 0 1 42 70 Z" fill={a} />
      <Line x1={38} y1={18} x2={62} y2={18} {...S} />
      <Circle cx={74} cy={34} r={10} fill="#fff" stroke={a} strokeWidth={2.2} />
      {label(74, 39, '?', 13, a)}
      {shadow(30, 86, 40)}
    </G>
  ),

  // ── Business ──
  // A growth curve over bars.
  'startup-tycoon': (a) => (
    <G>
      <Line x1={20} y1={78} x2={82} y2={78} {...S} />
      <Line x1={20} y1={78} x2={20} y2={22} {...S} />
      {[0, 1, 2, 3].map((i) => (
        <Rect key={i} x={27 + i * 14} y={70 - i * 11} width={9} height={8 + i * 11} rx={1.5} fill={a} opacity={0.3 + i * 0.2} />
      ))}
      <Polyline points="26,66 40,60 54,46 68,36 80,22" fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
      <Polygon points="80,22 72,23 78,29" fill={INK} />
    </G>
  ),
  // A pie chart: a budget split into pots.
  'budget-master': (a) => (
    <G>
      <Circle cx={50} cy={50} r={28} fill="#fff" stroke={INK} strokeWidth={2.2} />
      <Path d="M50 50 L50 22 A28 28 0 0 1 76.6 58.7 Z" fill={a} />
      <Path d="M50 50 L76.6 58.7 A28 28 0 0 1 36 74.2 Z" fill={a} opacity={0.45} />
      <Line x1={50} y1={50} x2={50} y2={22} stroke={INK} strokeWidth={1.6} />
      <Line x1={50} y1={50} x2={76.6} y2={58.7} stroke={INK} strokeWidth={1.6} />
      <Line x1={50} y1={50} x2={36} y2={74.2} stroke={INK} strokeWidth={1.6} />
    </G>
  ),
  // Supply and demand crossing at the market price.
  'market-master': (a) => (
    <G>
      <Line x1={20} y1={80} x2={84} y2={80} {...S} />
      <Line x1={20} y1={80} x2={20} y2={18} {...S} />
      <Line x1={28} y1={26} x2={78} y2={72} stroke={a} strokeWidth={3} strokeLinecap="round" />
      <Line x1={28} y1={72} x2={78} y2={26} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <Line x1={20} y1={49} x2={53} y2={49} stroke={W.muted} strokeWidth={1.4} strokeDasharray="3 3" />
      <Circle cx={53} cy={49} r={4} fill="#fff" stroke={INK} strokeWidth={2} />
      {label(84, 30, 'S', 9, INK)}
      {label(84, 76, 'D', 9, a)}
    </G>
  ),
  // Revenue and cost lines with the break-even point.
  'profit-quest': (a) => (
    <G>
      <Line x1={18} y1={80} x2={84} y2={80} {...S} />
      <Line x1={18} y1={80} x2={18} y2={18} {...S} />
      <Polygon points="50,52 80,24 80,40" fill={a} opacity={0.25} />
      <Line x1={18} y1={80} x2={80} y2={24} stroke={a} strokeWidth={3} strokeLinecap="round" />
      <Line x1={18} y1={62} x2={80} y2={40} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <Circle cx={50.5} cy={51} r={4} fill="#fff" stroke={INK} strokeWidth={2} />
    </G>
  ),
  // Candlesticks.
  'market-simulator': (a) => (
    <G>
      <Line x1={14} y1={82} x2={86} y2={82} stroke={W.lineStrong} strokeWidth={1.6} />
      {[
        [24, 50, 66, 40, 74, true],
        [38, 44, 58, 36, 64, false],
        [52, 34, 50, 26, 56, true],
        [66, 38, 48, 30, 54, false],
        [80, 22, 40, 16, 46, true],
      ].map(([x, top, bottom, hi, lo, up], i) => (
        <G key={i}>
          <Line x1={x as number} y1={hi as number} x2={x as number} y2={lo as number} stroke={INK} strokeWidth={1.6} />
          <Rect
            x={(x as number) - 4.5}
            y={top as number}
            width={9}
            height={(bottom as number) - (top as number)}
            rx={1}
            fill={up ? a : '#fff'}
            stroke={INK}
            strokeWidth={1.6}
          />
        </G>
      ))}
    </G>
  ),

  // ── History ──
  // A timeline with dated marks.
  'time-machine': (a) => (
    <G>
      <Line x1={12} y1={56} x2={88} y2={56} {...S} />
      {[20, 38, 62, 80].map((x, i) => (
        <G key={x}>
          <Line x1={x} y1={50} x2={x} y2={62} stroke={INK} strokeWidth={2} />
          <Circle cx={x} cy={56} r={i === 2 ? 6 : 3.5} fill={i === 2 ? a : '#fff'} stroke={INK} strokeWidth={2} />
        </G>
      ))}
      <Rect x={44} y={24} width={36} height={16} rx={4} fill={a} />
      {label(62, 35.5, '1960', 9, '#fff')}
      <Line x1={62} y1={40} x2={62} y2={48} stroke={a} strokeWidth={2} />
      {label(20, 76, '3000', 7, W.muted)}
      {label(80, 76, '2000', 7, W.muted)}
    </G>
  ),
  // A dig section: soil layers and an amphora.
  'lost-civilization': (a) => (
    <G>
      <Rect x={10} y={30} width={80} height={14} fill={a} opacity={0.15} />
      <Rect x={10} y={44} width={80} height={16} fill={a} opacity={0.3} />
      <Rect x={10} y={60} width={80} height={22} fill={a} opacity={0.45} />
      <Path
        d="M44 50 Q38 60 44 72 L56 72 Q62 60 56 50 L54 46 L46 46 Z"
        fill="#fff"
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path d="M46 50 Q40 50 42 56 M54 50 Q60 50 58 56" fill="none" stroke={INK} strokeWidth={1.8} />
      <Line x1={10} y1={30} x2={90} y2={30} {...S} />
      <Line x1={18} y1={18} x2={28} y2={28} stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
    </G>
  ),
  // A compass rose on a map grid.
  'africa-explorer': (a) => (
    <G>
      {[25, 50, 75].map((v) => (
        <G key={v}>
          <Line x1={v} y1={10} x2={v} y2={90} stroke={W.lineStrong} strokeWidth={1} />
          <Line x1={10} y1={v} x2={90} y2={v} stroke={W.lineStrong} strokeWidth={1} />
        </G>
      ))}
      <Circle cx={50} cy={50} r={24} fill="#fff" stroke={INK} strokeWidth={2} />
      <Polygon points="50,24 55,50 50,46 45,50" fill={a} />
      <Polygon points="50,76 55,50 50,54 45,50" fill={INK} />
      <Polygon points="24,50 50,45 46,50 50,55" fill={W.lineStrong} />
      <Polygon points="76,50 50,45 54,50 50,55" fill={W.lineStrong} />
      {label(50, 20, 'N', 8, INK)}
    </G>
  ),

  // ── Space ──
  // A planet with an orbiting defence ring and a target.
  'galaxy-defender': (a) => (
    <G>
      <Circle cx={50} cy={50} r={30} fill="none" stroke={W.lineStrong} strokeWidth={1.6} strokeDasharray="4 4" />
      <Circle cx={50} cy={50} r={13} fill={a} />
      <Circle cx={78} cy={36} r={6} fill="none" stroke={INK} strokeWidth={2} />
      <Line x1={78} y1={26} x2={78} y2={46} stroke={INK} strokeWidth={1.6} />
      <Line x1={68} y1={36} x2={88} y2={36} stroke={INK} strokeWidth={1.6} />
      <Path d="M28 68 L22 74 M34 72 L30 80" stroke={INK} strokeWidth={2} strokeLinecap="round" />
    </G>
  ),
  // Asteroids with trajectories.
  'asteroid-survival': (a) => (
    <G>
      <Line x1={14} y1={20} x2={46} y2={46} stroke={W.muted} strokeWidth={1.4} strokeDasharray="3 3" />
      <Line x1={86} y1={26} x2={66} y2={60} stroke={W.muted} strokeWidth={1.4} strokeDasharray="3 3" />
      <Polygon points="44,40 56,38 62,48 56,58 44,58 38,50" fill={a} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <Polygon points="62,60 70,58 74,66 68,72 60,70" fill="#fff" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <Circle cx={30} cy={74} r={5} fill="#fff" stroke={INK} strokeWidth={2} />
    </G>
  ),
  // A two-stage rocket, drawn like a schematic.
  'rocket-builder': (a) => (
    <G>
      <Path d="M50 12 Q60 24 60 38 L40 38 Q40 24 50 12 Z" fill={a} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <Rect x={40} y={38} width={20} height={20} fill="#fff" stroke={INK} strokeWidth={2} />
      <Rect x={40} y={58} width={20} height={18} fill={a} opacity={0.35} stroke={INK} strokeWidth={2} />
      <Path d="M40 62 L30 78 L40 76 Z M60 62 L70 78 L60 76 Z" fill="#fff" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M44 76 L50 88 L56 76" fill="none" stroke={a} strokeWidth={2.4} strokeLinejoin="round" />
      <Line x1={36} y1={58} x2={64} y2={58} stroke={INK} strokeWidth={1.4} strokeDasharray="2 2" />
    </G>
  ),
  // A planet, an elliptical orbit and the force arrow on a moon.
  'gravity-master': (a) => (
    <G>
      <Ellipse cx={50} cy={52} rx={36} ry={20} fill="none" stroke={W.lineStrong} strokeWidth={1.6} />
      <Circle cx={42} cy={52} r={12} fill={a} />
      <Circle cx={80} cy={40} r={5} fill="#fff" stroke={INK} strokeWidth={2} />
      <Line x1={75} y1={42} x2={60} y2={47} stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
      <Polygon points="58,48 64,43 64,50" fill={INK} />
      {label(70, 34, 'F', 9, INK)}
    </G>
  ),
  // The Sun and three orbits.
  'solar-explorer': (a) => (
    <G>
      {[16, 26, 36].map((r) => (
        <Circle key={r} cx={22} cy={50} r={r + 14} fill="none" stroke={W.lineStrong} strokeWidth={1.4} />
      ))}
      <Circle cx={22} cy={50} r={13} fill={a} />
      <Circle cx={51} cy={42} r={3.5} fill={INK} />
      <Circle cx={60} cy={64} r={5} fill="#fff" stroke={INK} strokeWidth={2} />
      <Circle cx={71} cy={36} r={7} fill={a} opacity={0.5} stroke={INK} strokeWidth={2} />
    </G>
  ),

  // ── Tech ──
  // Lines of code with a cursor.
  'code-runner': (a) => (
    <G>
      <Rect x={14} y={20} width={72} height={60} rx={6} fill="#fff" stroke={INK} strokeWidth={2} />
      <Line x1={14} y1={32} x2={86} y2={32} stroke={W.line} strokeWidth={1.6} />
      <Circle cx={22} cy={26} r={2} fill={a} />
      <Circle cx={29} cy={26} r={2} fill={W.lineStrong} />
      <Rect x={22} y={40} width={28} height={5} rx={2.5} fill={a} />
      <Rect x={30} y={51} width={36} height={5} rx={2.5} fill={INK} opacity={0.75} />
      <Rect x={30} y={62} width={22} height={5} rx={2.5} fill={INK} opacity={0.4} />
      <Rect x={55} y={60} width={2.6} height={9} fill={a} />
    </G>
  ),
  // A shield with a padlock.
  'cyber-defender': (a) => (
    <G>
      <Path d="M50 14 L76 24 L76 46 Q76 70 50 84 Q24 70 24 46 L24 24 Z" fill={a} opacity={0.18} stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
      <Rect x={38} y={46} width={24} height={20} rx={3} fill={a} stroke={INK} strokeWidth={2} />
      <Path d="M43 46 L43 39 A7 7 0 0 1 57 39 L57 46" fill="none" stroke={INK} strokeWidth={2.4} />
      <Circle cx={50} cy={55} r={2.6} fill="#fff" />
    </G>
  ),
  // A grid with a planned path to the goal.
  'robot-rescue': (a) => (
    <G>
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <Rect key={`${r}${c}`} x={18 + c * 16} y={18 + r * 16} width={15} height={15} rx={2} fill="#fff" stroke={W.lineStrong} strokeWidth={1.2} />
        )),
      )}
      <Rect x={50} y={34} width={15} height={15} rx={2} fill={INK} opacity={0.75} />
      <Polyline points="25.5,73.5 25.5,41.5 41.5,41.5 41.5,25.5 73.5,25.5" fill="none" stroke={a} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <Rect x={19.5} y={67.5} width={12} height={12} rx={3} fill={a} />
      <Circle cx={73.5} cy={25.5} r={5} fill="#fff" stroke={a} strokeWidth={2.4} />
    </G>
  ),
  // Bits in cells.
  'binary-breaker': (a) => (
    <G>
      {['1', '0', '1', '1'].map((b, i) => (
        <G key={i}>
          <Rect x={13 + i * 19} y={34} width={17} height={22} rx={3} fill={b === '1' ? a : '#fff'} stroke={INK} strokeWidth={1.8} />
          {label(21.5 + i * 19, 50, b, 13, b === '1' ? '#fff' : INK)}
        </G>
      ))}
      {label(50, 74, '= 11', 11, INK)}
    </G>
  ),
  // A loop with a cell, a resistor and a lamp.
  'circuit-master': (a) => (
    <G>
      <Polyline points="20,41 20,30 38,30" fill="none" {...S} />
      <Polyline points="64,30 80,30 80,43" fill="none" {...S} />
      <Polyline points="80,61 80,72 20,72 20,51" fill="none" {...S} />
      <Line x1={11} y1={41} x2={29} y2={41} stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
      <Line x1={15} y1={51} x2={25} y2={51} stroke={INK} strokeWidth={3.6} strokeLinecap="round" />
      <Polyline points="38,30 42,24 48,36 54,24 60,36 64,30" fill="none" stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
      <Circle cx={80} cy={52} r={9} fill={a} stroke={INK} strokeWidth={2} />
      <Path d="M74 46 L86 58 M86 46 L74 58" stroke="#fff" strokeWidth={1.8} />
    </G>
  ),
};
