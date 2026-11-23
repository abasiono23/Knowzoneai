import { Ionicons } from '@expo/vector-icons';
import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, { Easing, FadeIn, useAnimatedProps, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';

import { column, FONT, W } from '@/components/games/ui';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { Glassware } from '@/lib/api';
import { sub } from '@/lib/games/lab';

/**
 * Shared pieces of the five chemistry games, in the word games' look (components/games/ui): a light page,
 * dark ink, colour only for meaning (always with an icon or words), and chemistry drawn like a textbook.
 */

/** Chemistry text: subscripts and charges drawn properly, always left to right (formulas don't mirror). */
export function Chem({ children, style, numberOfLines }: { children: string; style?: StyleProp<TextStyle>; numberOfLines?: number }) {
  return (
    <Text style={[{ writingDirection: 'ltr' }, style]} numberOfLines={numberOfLines}>
      {sub(children)}
    </Text>
  );
}

/** The scrolling play area: a centred column on the light page. */
export function Board({ children, footer, wide }: { children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[column, wide && { maxWidth: 1000 }, styles.board]} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {footer && <View style={[column, styles.footer]}>{footer}</View>}
    </View>
  );
}

/** "EXPERIMENT 2 OF 3" over a title. */
export function StepHeader({ eyebrow, title, chem }: { eyebrow: string; title?: string | null; chem?: boolean }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
      {!!title && (chem ? <Chem style={styles.title}>{title}</Chem> : <Text style={styles.title}>{title}</Text>)}
    </View>
  );
}

/** A white card with a thin border. */
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export type OptionState = 'idle' | 'selected' | 'correct' | 'wrong' | 'missed';
const LETTERS = 'ABCDEF';

/**
 * Answers to choose from: a row each, with a letter (A, B, C… also typed on a keyboard), and a tick or
 * a cross once answered, so right and wrong never rest on colour alone.
 */
export function Options({
  options,
  state,
  onPick,
  disabled,
  chem = true,
}: {
  options: string[];
  state: (option: string) => OptionState;
  onPick: (option: string) => void;
  disabled?: boolean;
  chem?: boolean;
}) {
  const { t } = useTranslation('games');
  return (
    <View style={{ gap: 8 }} accessibilityRole="radiogroup">
      {options.map((o, i) => {
        const s = state(o);
        const look = OPTION[s];
        return (
          <Pressable
            key={o}
            onPress={() => onPick(o)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ selected: s === 'selected', disabled: !!disabled }}
            accessibilityLabel={`${LETTERS[i]}: ${sub(o)}${s === 'correct' ? `, ${t('ui.correct')}` : s === 'wrong' ? `, ${t('ui.wrong')}` : ''}`}
            style={({ pressed }) => [styles.option, { backgroundColor: look.bg, borderColor: look.border }, pressed && !disabled && { transform: [{ scale: 0.985 }] }]}>
            <View style={[styles.letter, { borderColor: look.ink, backgroundColor: s === 'selected' ? W.ink : 'transparent' }]}>
              <Text style={{ fontFamily: FONT, fontSize: 13, color: s === 'selected' ? '#fff' : look.ink }}>{LETTERS[i]}</Text>
            </View>
            {chem ? <Chem style={[styles.optionText, { color: look.ink }]}>{o}</Chem> : <Text style={[styles.optionText, { color: look.ink }]}>{o}</Text>}
            {(s === 'correct' || s === 'wrong' || s === 'missed') && (
              <Ionicons name={s === 'wrong' ? 'close-circle' : 'checkmark-circle'} size={22} color={s === 'wrong' ? W.wrong : W.correct} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
const OPTION: Record<OptionState, { bg: string; border: string; ink: string }> = {
  idle: { bg: W.surface, border: W.line, ink: W.ink },
  selected: { bg: W.focusSoft, border: W.focus, ink: W.ink },
  correct: { bg: W.correctSoft, border: W.correct, ink: W.ink },
  wrong: { bg: W.wrongSoft, border: W.wrong, ink: W.ink },
  missed: { bg: W.surface, border: W.correct, ink: W.ink },
};
/** Letter or number keys to options: "A"/"1" → 0. */
export const optionIndex = (key: string) => {
  if (/^[1-6]$/.test(key)) return Number(key) - 1;
  const k = LETTERS.indexOf(key);
  return k;
};

/** A small rounded tag (a fact, a count). */
export function Tag({ text, icon, tone = 'plain' }: { text: string; icon?: keyof typeof Ionicons.glyphMap; tone?: 'plain' | 'good' | 'bad' }) {
  const color = tone === 'good' ? W.correct : tone === 'bad' ? W.wrong : W.inkSoft;
  return (
    <View style={[styles.tag, tone !== 'plain' && { borderColor: color }]}>
      {icon && <Ionicons name={icon} size={13} color={color} />}
      <Text style={{ fontFamily: Fonts.semibold, fontSize: 13, color }}>{text}</Text>
    </View>
  );
}

// ─── Glassware, drawn like a textbook figure ─────────────────────────────────

/** Outline and the liquid's inside of each piece of glassware, in a 100 × 160 box. */
const GLASS: Record<Glassware, { outline: string; inside: string; top: number; bottom: number }> = {
  tube: { outline: 'M36 4 H64 M38 4 V136 A12 12 0 0 0 62 136 V4', inside: 'M39 6 H61 V136 A11 11 0 0 1 39 136 Z', top: 6, bottom: 147 },
  beaker: { outline: 'M10 10 Q14 12 16 16 V148 Q16 154 22 154 H78 Q84 154 84 148 V16 Q86 12 90 10', inside: 'M17 16 H83 V148 Q83 153 78 153 H22 Q17 153 17 148 Z', top: 16, bottom: 153 },
  flask: { outline: 'M38 4 H62 M41 4 V52 L10 142 Q7 154 20 154 H80 Q93 154 90 142 L59 52 V4', inside: 'M42 6 H58 V53 L89 143 Q91 152 80 152 H20 Q9 152 11 143 L42 53 Z', top: 6, bottom: 152 },
};

const ACircle = Animated.createAnimatedComponent(Circle);

function Bubble({ x, delay, bottom, top }: { x: number; delay: number; bottom: number; top: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    const id = setTimeout(() => {
      t.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }), -1, false);
    }, delay);
    return () => clearTimeout(id);
  }, [t, delay]);
  const props = useAnimatedProps(() => ({ cy: bottom - (bottom - top) * t.value, opacity: 1 - t.value * 0.8 }));
  return <ACircle cx={x} r={2.6} fill="none" stroke={W.inkSoft} strokeWidth={1.2} animatedProps={props} />;
}

/**
 * A beaker, test tube or conical flask with its contents: the liquid's colour, a precipitate settled at
 * the bottom, bubbles of gas, a coating on a solid. Decorative: the words beside it say what's seen.
 */
export function GlassFigure({
  kind,
  height = 180,
  fill = 0,
  liquid = '#EAF4FF',
  precipitate,
  gas,
  coating,
  label,
}: {
  kind: Glassware;
  height?: number;
  /** 0–1 of the glass. */
  fill?: number;
  liquid?: string;
  precipitate?: string;
  gas?: boolean;
  coating?: string;
  label?: string;
}) {
  const g = GLASS[kind];
  const level = g.bottom - (g.bottom - g.top) * Math.min(0.92, fill);
  const width = (height * 100) / 160;
  const id = `clip-${kind}`;
  return (
    <View accessible={!!label} accessibilityLabel={label} importantForAccessibility={label ? 'yes' : 'no-hide-descendants'} style={{ width, height }}>
      <Svg width={width} height={height} viewBox="0 0 100 160">
        <Defs>
          <ClipPath id={id}>
            <Path d={g.inside} />
          </ClipPath>
        </Defs>
        <G clipPath={`url(#${id})`}>
          {fill > 0 && <Rect x={0} y={level} width={100} height={160 - level} fill={liquid} opacity={0.85} />}
          {fill > 0 && <Line x1={0} y1={level} x2={100} y2={level} stroke={W.inkSoft} strokeWidth={1} opacity={0.6} />}
          {fill > 0 && precipitate && <Rect x={0} y={g.bottom - 18} width={100} height={20} fill={precipitate} />}
          {fill > 0 && precipitate &&
            [20, 34, 48, 62, 76].map((x, k) => <Circle key={k} cx={x} cy={g.bottom - 18} r={3} fill={precipitate} />)}
          {fill > 0 && coating && <Rect x={44} y={level + 10} width={12} height={g.bottom - level - 14} rx={3} fill={coating} stroke={W.ink} strokeWidth={0.8} />}
        </G>
        {fill > 0 && gas && [32, 50, 66, 42, 58].map((x, k) => <Bubble key={k} x={kind === 'tube' ? 44 + (k % 3) * 6 : x} delay={k * 260} bottom={g.bottom - 6} top={level + 4} />)}
        <Path d={g.outline} fill="none" stroke={W.ink} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        {kind === 'beaker' && [60, 90, 120].map((y) => <Line key={y} x1={17} y1={y} x2={27} y2={y} stroke={W.inkSoft} strokeWidth={1.2} />)}
      </Svg>
    </View>
  );
}

/** A reagent bottle label: the formula in a tidy box (used on shelves and in examples). */
export function BottleChip({ formula, name, colour, selected, onPress }: { formula: string; name: string; colour: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={name}
      style={({ pressed }) => [styles.bottle, selected && { borderColor: W.focus, backgroundColor: W.focusSoft }, pressed && { backgroundColor: W.key }]}>
      <View style={[styles.swatch, { backgroundColor: colour }]} />
      <View style={{ flex: 1 }}>
        <Chem style={{ fontFamily: FONT, fontSize: 15, color: W.ink }} numberOfLines={1}>
          {formula}
        </Chem>
        <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: W.muted }} numberOfLines={2}>
          {name}
        </Text>
      </View>
      {selected && <Ionicons name="checkmark-circle" size={18} color={W.focus} />}
    </Pressable>
  );
}

export function FadeInView({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={FadeIn.duration(180)} style={style}>
      {children}
    </Animated.View>
  );
}

export const styles = StyleSheet.create({
  board: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24, gap: 14 },
  footer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, gap: 10, borderTopWidth: 1, borderTopColor: W.line, backgroundColor: W.page },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  title: { fontFamily: FONT, fontSize: 20, lineHeight: 27, color: W.ink, letterSpacing: -0.2 },
  card: { padding: 14, borderRadius: 14, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line, gap: 8 },
  option: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 },
  letter: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  optionText: { flex: 1, fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 22 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: W.line, backgroundColor: W.surface },
  bottle: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, borderWidth: 1.5, borderColor: W.line, backgroundColor: W.surface },
  swatch: { width: 14, height: 34, borderRadius: 4, borderWidth: 1, borderColor: W.lineStrong },
});
