import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOutUp, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';
import { KORA_IMAGE } from '@/lib/games/english';
import { useSession } from '@/lib/session';

/** The deep navy-to-violet background every word game uses. */
export const GAME_BG = ['#0B0F2A', '#1C1668', '#2B1F8F'] as const;
export const FONT = 'Manrope_800ExtraBold';

export function GameBackground({ children }: { children: ReactNode }) {
  return (
    <LinearGradient colors={GAME_BG} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ flex: 1 }}>
      {STARS.map(([x, y, s], i) => (
        <View
          key={i}
          pointerEvents="none"
          style={[styles.star, { left: `${x}%`, top: `${y}%`, width: s, height: s }]}
        />
      ))}
      {children}
    </LinearGradient>
  );
}
const STARS: [number, number, number][] = [
  [8, 12, 2],
  [22, 30, 3],
  [78, 8, 2],
  [90, 26, 3],
  [60, 18, 2],
  [12, 60, 2],
  [85, 52, 2],
  [40, 44, 2],
  [70, 72, 3],
  [28, 86, 2],
  [92, 90, 2],
];

/** Gold coin with the "K", and the learner's balance. */
export function CoinPill() {
  const { user } = useSession();
  return (
    <View style={styles.coinPill} accessibilityLabel={`${user?.coins ?? 0}`}>
      <View style={styles.coin}>
        <Text style={{ fontFamily: FONT, fontSize: 12, color: '#7A4B00' }}>K</Text>
      </View>
      <Text style={{ fontFamily: FONT, fontSize: 16, color: Colors.reward }}>{user?.coins ?? 0}</Text>
    </View>
  );
}

export function HeartsRow({ left, total = 3, size = 22 }: { left: number; total?: number; size?: number }) {
  const { t } = useTranslation('games');
  return (
    <View style={{ flexDirection: 'row', gap: 4 }} accessibilityLabel={t('ui.heartsLeft', { count: left })}>
      {Array.from({ length: total }, (_, i) => (
        <Ionicons key={i} name="heart" size={size} color={i < left ? '#FF5A9A' : 'rgba(255,255,255,0.18)'} />
      ))}
    </View>
  );
}

/** Round pause button, a centred label, and a slot on the right (coins, hearts). */
export function TopBar({
  onPause,
  label,
  center,
  right,
  pauseColor = '#5B3FE0',
}: {
  onPause: () => void;
  label?: string;
  center?: ReactNode;
  right?: ReactNode;
  pauseColor?: string;
}) {
  const { t } = useTranslation('world');
  return (
    <SafeAreaView edges={['top']} style={styles.topBar}>
      <Pressable
        onPress={onPause}
        accessibilityRole="button"
        accessibilityLabel={t('hud.pause')}
        hitSlop={10}
        style={({ pressed }) => [
          styles.pause,
          { backgroundColor: pauseColor },
          pressed && { transform: [{ scale: 0.94 }] },
        ]}>
        <Ionicons name="pause" size={22} color="#fff" />
      </Pressable>
      <View style={{ flex: 1, alignItems: 'center' }}>
        {label && (
          <Text numberOfLines={2} style={styles.topLabel}>
            {label}
          </Text>
        )}
        {center}
      </View>
      <View style={{ minWidth: 48, alignItems: 'flex-end' }}>{right}</View>
    </SafeAreaView>
  );
}

type TileTone = 'violet' | 'gold' | 'teal' | 'red' | 'empty' | 'dim';
const TONES: Record<Exclude<TileTone, 'empty'>, { colors: [string, string]; edge: string; text: string }> = {
  violet: { colors: ['#8A6BFF', '#5B3FE0'], edge: '#3A239E', text: '#FFFFFF' },
  gold: { colors: ['#FFD978', '#F5A623'], edge: '#B86F0A', text: '#5A2E00' },
  teal: { colors: ['#5EEAD4', '#14B8A6'], edge: '#0B7A6E', text: '#FFFFFF' },
  red: { colors: ['#FF8FA6', '#FF4D6D'], edge: '#B3243F', text: '#FFFFFF' },
  dim: { colors: ['#2E2878', '#231E5E'], edge: '#16123F', text: 'rgba(255,255,255,0.35)' },
};

/** A glossy 3D letter tile (violet, gold, teal, red), or an empty dashed slot. */
export function GlossyTile({
  letter,
  size = 54,
  tone = 'violet',
  points,
  badge,
  round,
  onPress,
  accessibilityLabel,
  style,
}: {
  letter?: string;
  size?: number;
  tone?: TileTone;
  points?: number;
  badge?: string;
  round?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const radius = round ? size / 2 : Math.round(size * 0.24);
  const body =
    tone === 'empty' ? (
      <View style={[styles.emptySlot, { width: size, height: size, borderRadius: radius }]} />
    ) : (
      <View style={[{ width: size, height: size + 5, borderRadius: radius, backgroundColor: TONES[tone].edge }]}>
        <LinearGradient
          colors={TONES[tone].colors}
          style={{
            width: size,
            height: size,
            borderRadius: radius,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
          <View style={[styles.gloss, { borderTopLeftRadius: radius, borderTopRightRadius: radius }]} />
          {!!letter && (
            <Text style={{ fontFamily: FONT, fontSize: size * 0.5, lineHeight: size * 0.62, color: TONES[tone].text }}>
              {letter}
            </Text>
          )}
          {points !== undefined && (
            <Text style={[styles.points, { color: TONES[tone].text, fontSize: Math.max(9, size * 0.2) }]}>
              {points}
            </Text>
          )}
        </LinearGradient>
        {!!badge && (
          <View style={styles.badge}>
            <Text style={{ fontFamily: FONT, fontSize: 9, color: '#5A2E00' }}>{badge}</Text>
          </View>
        )}
      </View>
    );
  if (!onPress) return <View style={style}>{body}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? letter}
      hitSlop={4}
      style={({ pressed }) => [style, pressed && { transform: [{ scale: 0.92 }, { translateY: 2 }] }]}>
      {body}
    </Pressable>
  );
}

/** The big pill button with a magenta-violet gradient and a soft glow. */
export function GradientButton({
  title,
  icon,
  onPress,
  disabled,
  busy,
  colors = ['#E040FB', '#8B5CF6'],
  style,
  height = 60,
}: {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  colors?: readonly [string, string];
  style?: StyleProp<ViewStyle>;
  height?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || busy }}
      style={({ pressed }) => [{ opacity: disabled ? 0.45 : 1 }, pressed && { transform: [{ scale: 0.97 }] }, style]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradientButton, { height, shadowColor: colors[0] }]}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={22} color="#fff" />}
            <Text style={{ fontFamily: FONT, fontSize: height > 52 ? 22 : 17, color: '#fff' }}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

/** A darker, quieter pill (Hint, Clear). */
export function SoftButton({
  title,
  icon,
  onPress,
  disabled,
  trailing,
  style,
  accessibilityLabel,
}: {
  title?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      style={({ pressed }) => [
        styles.softButton,
        disabled && { opacity: 0.45 },
        pressed && { transform: [{ scale: 0.96 }] },
        style,
      ]}>
      {icon && <Ionicons name={icon} size={22} color={Colors.reward} />}
      {!!title && <Text style={{ fontFamily: FONT, fontSize: 17, color: '#fff' }}>{title}</Text>}
      {trailing}
    </Pressable>
  );
}

/** Kora the owl with an optional speech bubble. */
export function KoraBubble({
  text,
  size = 92,
  side = 'left',
  style,
}: {
  text?: string;
  size?: number;
  side?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[{ flexDirection: side === 'left' ? 'row' : 'row-reverse', alignItems: 'flex-end', gap: 4 }, style]}
      pointerEvents="none">
      {!!text && (
        <Animated.View
          key={text}
          entering={FadeIn.duration(250)}
          style={[styles.speech, side === 'left' ? { borderBottomRightRadius: 4 } : { borderBottomLeftRadius: 4 }]}>
          <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 15, color: '#2A1E6E' }}>{text}</Text>
        </Animated.View>
      )}
      <Image source={KORA_IMAGE} style={{ width: size, height: size }} contentFit="contain" accessible={false} />
    </View>
  );
}

/** Circular gold countdown ring with the time in the middle. */
export function TimerRing({ seconds, total, size = 96 }: { seconds: number; total: number; size?: number }) {
  const { t } = useTranslation('games');
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const share = total ? Math.max(0, seconds) / total : 0;
  const low = seconds <= 5;
  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessibilityLabel={t('ui.secondsLeft', { count: seconds })}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,200,87,0.18)" strokeWidth={stroke} fill="#120D3A" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={low ? Colors.danger : Colors.reward}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - share)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text
        style={{
          fontFamily: FONT,
          fontSize: size * 0.3,
          color: low ? Colors.danger : '#fff',
          fontVariant: ['tabular-nums'],
        }}>
        {`${Math.floor(Math.max(0, seconds) / 60)}:${String(Math.max(0, seconds) % 60).padStart(2, '0')}`}
      </Text>
    </View>
  );
}

/**
 * A per-second countdown from `total` that restarts whenever `key` changes (a new step), runs while
 * `running`, and calls onEnd once at zero.
 */
export function useCountdown(total: number, running: boolean, onEnd: () => void, key: string | number) {
  const [state, setState] = useState({ key, left: total });
  if (state.key !== key) setState({ key, left: total });
  const endRef = useRef(onEnd);
  useEffect(() => {
    endRef.current = onEnd;
  });
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setState((s) => {
        if (s.left <= 1) {
          clearInterval(id);
          setTimeout(() => endRef.current(), 0);
          return { ...s, left: 0 };
        }
        return { ...s, left: s.left - 1 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, key]);
  return state.key === key ? state.left : total;
}

/** "+42" floating up in gold. */
export function PointsPop({
  value,
  color = Colors.reward,
  size = 34,
}: {
  value: string | null;
  color?: string;
  size?: number;
}) {
  if (!value) return null;
  return (
    <Animated.View key={value} entering={ZoomIn.springify()} exiting={FadeOutUp} pointerEvents="none">
      <Text
        style={{ fontFamily: FONT, fontSize: size, color, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 6 }}>
        {value}
      </Text>
    </Animated.View>
  );
}

/** A short coloured message under the board (right, wrong, tips). */
export function Feedback({ text, tone }: { text: string | null; tone: 'good' | 'bad' | 'info' }) {
  if (!text) return null;
  const color = tone === 'good' ? Colors.success : tone === 'bad' ? '#FF7A93' : Colors.textSecondary;
  return (
    <Animated.View entering={FadeInDown.duration(200)} style={{ alignItems: 'center' }}>
      <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 16, color, textAlign: 'center' }}>{text}</Text>
    </Animated.View>
  );
}

export function GameLoading() {
  const { t } = useTranslation('games');
  return (
    <GameBackground>
      <View style={styles.center}>
        <KoraBubble text={t('ui.loading')} size={110} />
        <ActivityIndicator color={Colors.reward} style={{ marginTop: Spacing.lg }} />
      </View>
    </GameBackground>
  );
}

export function GameError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useTranslation('games');
  const flip = useFlipStyle();
  return (
    <GameBackground>
      <SafeAreaView style={[styles.center, { padding: Spacing.lg, gap: Spacing.lg }]}>
        <KoraBubble text={message} size={110} />
        <GradientButton title={t('ui.retry')} icon="refresh" onPress={onRetry} style={{ alignSelf: 'stretch' }} />
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/world/english' as Href))}
          accessibilityRole="button"
          hitSlop={10}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="chevron-back" size={18} color={Colors.textSecondary} style={flip} />
          <Text color={Colors.textSecondary}>{t('results.back')}</Text>
        </Pressable>
      </SafeAreaView>
    </GameBackground>
  );
}
export const styles = StyleSheet.create({
  star: { position: 'absolute', borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.45)' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
  },
  pause: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C5CFF',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  topLabel: {
    fontFamily: FONT,
    fontSize: 14,
    letterSpacing: 1.2,
    color: 'rgba(235,232,255,0.92)',
    textAlign: 'center',
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(10,8,40,0.55)',
  },
  coin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.reward,
    borderWidth: 2,
    borderColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlot: {
    borderWidth: 2.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(160,140,255,0.7)',
    backgroundColor: 'rgba(124,92,255,0.14)',
  },
  gloss: { position: 'absolute', top: 0, left: 0, right: 0, height: '42%', backgroundColor: 'rgba(255,255,255,0.18)' },
  points: { position: 'absolute', right: 5, bottom: 3, fontFamily: FONT },
  badge: {
    position: 'absolute',
    top: -7,
    right: -7,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: '#FFE9A8',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: 999,
    paddingHorizontal: Spacing.lg,
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  softButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 60,
    paddingHorizontal: Spacing.lg,
    borderRadius: 999,
    backgroundColor: '#3A2DA8',
    borderWidth: 1,
    borderColor: 'rgba(160,140,255,0.35)',
  },
  speech: {
    maxWidth: 220,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#D9CCFF',
    marginBottom: 30,
  },
});
