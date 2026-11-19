import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Polygon, Rect, Text as SvgText } from 'react-native-svg';

import type { EnglishGameId } from '@/lib/api';
import { GAME_ACCENT } from '@/lib/games/english';

import { W } from './ui';

const FONT = 'Manrope_800ExtraBold';

/**
 * A word game's cover, drawn in code: the game's own pieces (tiles, a grid, a honeycomb, word chips) on a
 * soft square in its accent. Decorative; the game's name is always written next to it.
 */
export function GameCover({ game, size = 64 }: { game: EnglishGameId; size?: number }) {
  const accent = GAME_ACCENT[game];
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, borderRadius: size * 0.22, overflow: 'hidden' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Rect x={0} y={0} width={100} height={100} fill={accent} opacity={0.1} />
        {DRAW[game](accent)}
      </Svg>
    </View>
  );
}

const tile = (x: number, y: number, s: number, letter: string, opts: { fill?: string; ink?: string; stroke?: string } = {}) => (
  <G key={`${x}-${y}-${letter}`}>
    <Rect x={x} y={y} width={s} height={s} rx={s * 0.16} fill={opts.fill ?? '#fff'} stroke={opts.stroke ?? W.lineStrong} strokeWidth={1.6} />
    {!!letter && (
      <SvgText x={x + s / 2} y={y + s * 0.7} fontSize={s * 0.56} fontFamily={FONT} fontWeight="800" fill={opts.ink ?? W.ink} textAnchor="middle">
        {letter}
      </SvgText>
    )}
  </G>
);

const DRAW: Record<EnglishGameId, (accent: string) => ReactNode> = {
  // A word with one letter missing.
  'hidden-letters': (accent) => (
    <G>
      {tile(5, 34, 20, 'W')}
      {tile(28, 34, 20, 'O')}
      <Rect x={51} y={34} width={20} height={20} rx={3.2} fill={accent} opacity={0.14} />
      <Rect x={51} y={34} width={20} height={20} rx={3.2} fill="none" stroke={accent} strokeWidth={2.2} />
      <Line x1={56} y1={48.5} x2={66} y2={48.5} stroke={accent} strokeWidth={2.6} strokeLinecap="round" />
      {tile(74, 34, 20, 'D')}
      <Rect x={18} y={66} width={64} height={4} rx={2} fill={W.ink} opacity={0.12} />
    </G>
  ),
  // Letter tiles with their points; the rare letter counts double.
  'word-clash': (accent) => (
    <G>
      <G transform="rotate(-8 30 50)">{tile(16, 34, 26, 'Q', { fill: accent, ink: '#fff', stroke: accent })}</G>
      <G transform="rotate(4 52 52)">{tile(39, 38, 26, 'U')}</G>
      <G transform="rotate(10 76 50)">{tile(62, 33, 26, 'I')}</G>
      <SvgText x={37} y={56} fontSize={7} fontFamily={FONT} fill="#fff" textAnchor="middle" transform="rotate(-8 30 50)">
        10
      </SvgText>
      <Rect x={24} y={72} width={52} height={4} rx={2} fill={W.ink} opacity={0.12} />
    </G>
  ),
  // A letter grid with one word marked across it.
  'word-hunter': (accent) => {
    const letters = ['S', 'T', 'A', 'R', 'E', 'O', 'R', 'B', 'I', 'L', 'U', 'N', 'K', 'M', 'O', 'S'];
    return (
      <G>
        <Rect x={16} y={21} width={74} height={15} rx={7.5} fill={accent} opacity={0.22} transform="rotate(45 22 28)" />
        {letters.map((ch, i) => (
          <SvgText
            key={i}
            x={22 + (i % 4) * 19}
            y={32 + Math.floor(i / 4) * 19}
            fontSize={12}
            fontFamily={FONT}
            fill={i % 5 === 0 ? accent : W.ink}
            textAnchor="middle">
            {ch}
          </SvgText>
        ))}
      </G>
    );
  },
  // Letters to spell with, around a centre letter.
  spellcaster: (accent) => {
    const hex = (cx: number, cy: number, r: number) =>
      Array.from({ length: 6 }, (_, k) => {
        const a = (Math.PI / 3) * k;
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      }).join(' ');
    const r = 12;
    const cells: [number, number, string][] = [
      [50, 50, 'L'],
      [50, 50 - r * 1.75, 'S'],
      [50, 50 + r * 1.75, 'E'],
      [50 - r * 1.52, 50 - r * 0.87, 'P'],
      [50 + r * 1.52, 50 - r * 0.87, 'A'],
      [50 - r * 1.52, 50 + r * 0.87, 'C'],
      [50 + r * 1.52, 50 + r * 0.87, 'T'],
    ];
    return (
      <G>
        {cells.map(([cx, cy, ch], i) => (
          <G key={ch}>
            <Polygon points={hex(cx, cy, r - 1)} fill={i ? '#fff' : accent} stroke={i ? W.lineStrong : accent} strokeWidth={1.4} />
            <SvgText x={cx} y={cy + 4} fontSize={11} fontFamily={FONT} fill={i ? W.ink : '#fff'} textAnchor="middle">
              {ch}
            </SvgText>
          </G>
        ))}
      </G>
    );
  },
  // A sentence built from word chips, one still to place.
  'sentence-master': (accent) => (
    <G>
      <Rect x={14} y={28} width={22} height={13} rx={4} fill="#fff" stroke={W.lineStrong} strokeWidth={1.4} />
      <Rect x={40} y={28} width={30} height={13} rx={4} fill="#fff" stroke={W.lineStrong} strokeWidth={1.4} />
      <Rect x={74} y={28} width={13} height={13} rx={4} fill="#fff" stroke={W.lineStrong} strokeWidth={1.4} />
      <Rect x={14} y={46} width={34} height={13} rx={4} fill={accent} />
      <Rect x={52} y={46} width={20} height={13} rx={4} fill="none" stroke={accent} strokeWidth={1.6} strokeDasharray="3 2.5" />
      <Rect x={14} y={67} width={56} height={4} rx={2} fill={W.ink} opacity={0.12} />
      <Rect x={14} y={76} width={38} height={4} rx={2} fill={W.ink} opacity={0.12} />
    </G>
  ),
};
