import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Platform, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Polygon, Rect } from 'react-native-svg';

import { Text } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { regionFlag } from '@/lib/region';

/**
 * A country's flag for the study-region list. Phones draw flag emoji; Windows browsers show two
 * letters instead ("NG"), so on the web the flags of the listed countries are drawn here, small and
 * simplified (no coats of arms or birds), with nothing to download. 60 × 40 units each.
 */
const W = 60;
const H = 40;

/** A five-pointed star, point up. */
function star(cx: number, cy: number, r: number, points = 5) {
  const inner = r * (points === 5 ? 0.382 : 0.5);
  return Array.from({ length: points * 2 }, (_, i) => {
    const a = (Math.PI * i) / points - Math.PI / 2;
    const d = i % 2 ? inner : r;
    return `${(cx + d * Math.cos(a)).toFixed(2)},${(cy + d * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
}
const stripesH = (colors: string[]) =>
  colors.map((c, i) => (
    <Rect key={i} x={0} y={(H / colors.length) * i} width={W} height={H / colors.length + 0.2} fill={c} />
  ));
const stripesV = (colors: string[]) =>
  colors.map((c, i) => (
    <Rect key={i} x={(W / colors.length) * i} y={0} width={W / colors.length + 0.2} height={H} fill={c} />
  ));

/** The Union Jack on a 60 × 40 field (also Australia's canton, at half size). */
const unionJack = (
  <>
    <Rect width={W} height={H} fill="#012169" />
    <Path d="M0 0 L60 40 M60 0 L0 40" stroke="#fff" strokeWidth={8} />
    <Path d="M0 0 L60 40 M60 0 L0 40" stroke="#C8102E" strokeWidth={3} />
    <Path d="M30 0 V40 M0 20 H60" stroke="#fff" strokeWidth={13} />
    <Path d="M30 0 V40 M0 20 H60" stroke="#C8102E" strokeWidth={8} />
  </>
);

const FLAGS: Record<string, ReactNode> = {
  NG: stripesV(['#008751', '#fff', '#008751']),
  GH: (
    <>
      {stripesH(['#CE1126', '#FCD116', '#006B3F'])}
      <Polygon points={star(30, 20, 6.5)} fill="#000" />
    </>
  ),
  SL: stripesH(['#1EB53A', '#fff', '#0072C6']),
  LR: (
    <>
      {stripesH(Array.from({ length: 11 }, (_, i) => (i % 2 ? '#fff' : '#BF0A30')))}
      <Rect width={20} height={(H / 11) * 5} fill="#002868" />
      <Polygon points={star(10, 9.1, 6)} fill="#fff" />
    </>
  ),
  GM: (
    <>
      <Rect width={W} height={H} fill="#fff" />
      <Rect width={W} height={13.3} fill="#CE1126" />
      <Rect y={15.5} width={W} height={9} fill="#0C1C8C" />
      <Rect y={26.7} width={W} height={13.3} fill="#3A7728" />
    </>
  ),
  CM: (
    <>
      {stripesV(['#007A5E', '#CE1126', '#FCD116'])}
      <Polygon points={star(30, 20, 5.5)} fill="#FCD116" />
    </>
  ),
  KE: (
    <>
      <Rect width={W} height={H} fill="#fff" />
      <Rect width={W} height={12} fill="#000" />
      <Rect y={14} width={W} height={12} fill="#BB0000" />
      <Rect y={28} width={W} height={12} fill="#006600" />
      <Ellipse cx={30} cy={20} rx={5.5} ry={10} fill="#BB0000" stroke="#fff" strokeWidth={1.2} />
      <Path d="M26.3 13 A5.5 10 0 0 0 26.3 27 Z M33.7 13 A5.5 10 0 0 1 33.7 27 Z" fill="#000" />
    </>
  ),
  RW: (
    <>
      <Rect width={W} height={20} fill="#00A1DE" />
      <Rect y={20} width={W} height={10} fill="#FAD201" />
      <Rect y={30} width={W} height={10} fill="#20603D" />
      <Circle cx={47} cy={10} r={4.5} fill="#FAD201" />
    </>
  ),
  ZA: (
    <>
      <Rect width={W} height={20} fill="#E03C31" />
      <Rect y={20} width={W} height={20} fill="#001489" />
      <Path d="M0 0 L24 20 L0 40 M24 20 H60" stroke="#fff" strokeWidth={14} fill="none" />
      <Path d="M0 0 L24 20 L0 40 M24 20 H60" stroke="#007749" strokeWidth={8.5} fill="none" />
      <Polygon points="0,6.5 16,20 0,33.5" fill="#FFB81C" />
      <Polygon points="0,10.5 11.5,20 0,29.5" fill="#000" />
    </>
  ),
  TZ: (
    <>
      <Polygon points="0,0 60,0 0,40" fill="#1EB53A" />
      <Polygon points="60,0 60,40 0,40" fill="#00A3DD" />
      <Path d="M-4 42.7 L64 -2.7" stroke="#FCD116" strokeWidth={15} />
      <Path d="M-4 42.7 L64 -2.7" stroke="#000" strokeWidth={10} />
    </>
  ),
  UG: (
    <>
      {stripesH(['#000', '#FCDC04', '#D90000', '#000', '#FCDC04', '#D90000'])}
      <Circle cx={30} cy={20} r={6.5} fill="#fff" />
      <Circle cx={30} cy={20} r={2.6} fill="#9CA69C" />
    </>
  ),
  ZM: (
    <>
      <Rect width={W} height={H} fill="#198A00" />
      <Rect x={39} y={14} width={7} height={26} fill="#DE2010" />
      <Rect x={46} y={14} width={7} height={26} fill="#000" />
      <Rect x={53} y={14} width={7} height={26} fill="#EF7D00" />
      <Ellipse cx={49.5} cy={8} rx={5} ry={2.2} fill="#EF7D00" />
    </>
  ),
  ZW: (
    <>
      {stripesH(['#006400', '#FFD200', '#D40000', '#000', '#D40000', '#FFD200', '#006400'])}
      <Polygon points="0,0 27,20 0,40" fill="#fff" stroke="#000" strokeWidth={1.5} />
      <Polygon points={star(9, 20, 6)} fill="#D40000" />
    </>
  ),
  US: (
    <>
      {stripesH(Array.from({ length: 13 }, (_, i) => (i % 2 ? '#fff' : '#B22234')))}
      <Rect width={26} height={(H / 13) * 7} fill="#3C3B6E" />
      {Array.from({ length: 20 }, (_, i) => (
        <Circle key={i} cx={3.2 + (i % 5) * 4.9} cy={3 + Math.floor(i / 5) * 5.2} r={1} fill="#fff" />
      ))}
    </>
  ),
  GB: unionJack,
  CA: (
    <>
      <Rect width={W} height={H} fill="#fff" />
      <Rect width={15} height={H} fill="#D80621" />
      <Rect x={45} width={15} height={H} fill="#D80621" />
      <Polygon
        points="30,7 32.5,12 35.5,11 34.5,17 38.5,14.5 39.5,17.5 43,18 39,23.5 40,25.5 31,26.5 31.2,33 28.8,33 29,26.5 20,25.5 21,23.5 17,18 20.5,17.5 21.5,14.5 25.5,17 24.5,11 27.5,12"
        fill="#D80621"
      />
    </>
  ),
  IN: (
    <>
      {stripesH(['#FF9933', '#fff', '#138808'])}
      <Circle cx={30} cy={20} r={5} fill="none" stroke="#000080" strokeWidth={1.2} />
      <Circle cx={30} cy={20} r={1.2} fill="#000080" />
    </>
  ),
  AU: (
    <>
      <Rect width={W} height={H} fill="#00008B" />
      <G scale={0.5}>{unionJack}</G>
      <Polygon points={star(15, 30, 5.5, 7)} fill="#fff" />
      {[
        [45, 7, 2.6],
        [53, 16, 2.6],
        [45, 33, 2.6],
        [38, 19, 2.6],
        [48.5, 23, 1.3],
      ].map(([x, y, r], i) => (
        <Polygon key={i} points={star(x!, y!, r!, 7)} fill="#fff" />
      ))}
    </>
  ),
  IE: stripesV(['#169B62', '#fff', '#FF883E']),
};

/** `size` is the flag's height; it is half as wide again. */
export function Flag({ code, size = 22 }: { code: string; size?: number }) {
  const width = size * 1.5;
  const drawn = FLAGS[code];
  if (!drawn)
    return (
      <Ionicons name="earth" size={size + 2} color={Colors.textSecondary} style={{ width, textAlign: 'center' }} />
    );
  if (Platform.OS !== 'web')
    return (
      <Text style={{ fontSize: size, lineHeight: size + 8, width: width + 4, textAlign: 'center' }}>
        {regionFlag(code)}
      </Text>
    );
  return (
    <View
      style={{
        width,
        height: size,
        borderRadius: 3,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: Colors.border,
      }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {drawn}
      </Svg>
    </View>
  );
}
