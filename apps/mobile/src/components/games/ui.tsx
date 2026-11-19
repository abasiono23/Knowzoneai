import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessibilityInfo,
  ActivityIndicator,
  I18nManager,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { Fonts, Palette } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';

/**
 * The word games' look: a quiet light page, white square tiles with crisp borders, dark ink, and colour
 * kept for meaning (green right, red wrong, purple for focus), always with an icon or words as well.
 */
export const W = {
  page: '#F6F5FA',
  surface: '#FFFFFF',
  ink: '#16192E',
  inkSoft: '#474C6B',
  muted: '#6E7391',
  line: '#E4E2EC',
  lineStrong: '#C6C3D6',
  key: '#E8E6F0',
  keyPressed: '#D6D3E3',
  given: '#EFEEF5',
  focus: Palette.purple600,
  focusSoft: 'rgba(106, 69, 255, 0.10)',
  correct: '#0E8C79',
  correctSoft: '#E3F5F1',
  wrong: '#C9354F',
  wrongSoft: '#FCE8EC',
  rare: '#B26A00',
  rareSoft: '#FFF3DC',
} as const;
export const FONT = Fonts.extrabold;

export function GameBackground({ children }: { children: ReactNode }) {
  return <View style={{ flex: 1, backgroundColor: W.page }}>{children}</View>;
}

/**
 * A row that runs left to right in every language: the puzzles are English, and Word Hunter counts its
 * cells from the left. In right-to-left languages a plain row is mirrored, so it is reversed back.
 */
export function ltrRow(): { flexDirection: 'row' | 'row-reverse' } {
  const rtl =
    Platform.OS === 'web'
      ? typeof document !== 'undefined' && document.documentElement.dir === 'rtl'
      : I18nManager.isRTL;
  return { flexDirection: rtl ? 'row-reverse' : 'row' };
}

/** Says something to screen readers (feedback that appears without a tap on it). */
export function announce(text: string) {
  AccessibilityInfo.announceForAccessibility(text);
}

/** A round icon button with a label for screen readers (44 pt, with extra room to tap). */
export function IconButton({
  icon,
  label,
  onPress,
  flip,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  flip?: boolean;
}) {
  const flipStyle = useFlipStyle();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [styles.iconButton, pressed && { backgroundColor: W.key }]}>
      <Ionicons name={icon} size={20} color={W.ink} style={flip ? flipStyle : undefined} />
    </Pressable>
  );
}

/** The bar over every game: leave, the game and level, how to play, and pause. */
export function GameTopBar({
  title,
  subtitle,
  onLeave,
  onHelp,
  onPause,
}: {
  title: string;
  subtitle: string;
  onLeave: () => void;
  onHelp: () => void;
  onPause: () => void;
}) {
  const { t } = useTranslation('games');
  return (
    <SafeAreaView edges={['top']} style={styles.topBar}>
      <View style={styles.topRow}>
        <IconButton icon="close" label={t('ui.leave')} onPress={onLeave} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.topTitle} numberOfLines={1} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.topSub} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <IconButton icon="help" label={t('ui.help')} onPress={onHelp} />
          <IconButton icon="pause" label={t('ui.pause')} onPress={onPause} />
        </View>
      </View>
    </SafeAreaView>
  );
}

/** A row of small facts under the top bar (progress, hearts, time), split by thin rules. */
export function StatusRow({ children }: { children: ReactNode }) {
  return <View style={styles.statusRow}>{children}</View>;
}

export function Stat({
  icon,
  text,
  label,
  tone = 'plain',
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  text: string;
  /** What a screen reader says, when the text alone isn't clear. */
  label?: string;
  tone?: 'plain' | 'alert' | 'good';
}) {
  const color = tone === 'alert' ? W.wrong : tone === 'good' ? W.correct : W.ink;
  return (
    <View style={styles.stat} accessible accessibilityLabel={label ?? text}>
      {icon && <Ionicons name={icon} size={16} color={color} />}
      <Text style={[styles.statText, { color }]}>{text}</Text>
    </View>
  );
}

/** Hearts left: full and empty hearts are different shapes, and the number is said aloud. */
export function HeartsStat({ left, total = 3 }: { left: number; total?: number }) {
  const { t } = useTranslation('games');
  return (
    <View style={styles.stat} accessible accessibilityLabel={t('ui.heartsLeft', { count: left })}>
      {Array.from({ length: total }, (_, i) => (
        <Ionicons key={i} name={i < left ? 'heart' : 'heart-outline'} size={16} color={i < left ? W.wrong : W.muted} />
      ))}
    </View>
  );
}

/** Time left ("0:24"), or "No timer" in relaxed mode. Under ten seconds it turns red and its icon changes. */
export function TimerStat({ seconds, relaxed }: { seconds: number; relaxed: boolean }) {
  const { t } = useTranslation('games');
  if (relaxed) return <Stat icon="infinite" text={t('ui.relaxed')} />;
  const low = seconds <= 10;
  return (
    <Stat
      icon={low ? 'alarm' : 'time-outline'}
      text={`${Math.floor(Math.max(0, seconds) / 60)}:${String(Math.max(0, seconds) % 60).padStart(2, '0')}`}
      label={t('ui.secondsLeft', { count: seconds })}
      tone={low ? 'alert' : 'plain'}
    />
  );
}

export type TileState = 'empty' | 'active' | 'filled' | 'given' | 'correct' | 'wrong' | 'used' | 'rare';

/**
 * A square letter tile. Right and wrong tiles also carry a tick or a cross, so the answer never depends
 * on colour alone. `points` shows a letter's value in the corner (Word Clash).
 */
export function LetterTile({
  letter,
  size = 52,
  state = 'filled',
  points,
  onPress,
  label,
  style,
}: {
  letter?: string | null;
  size?: number;
  state?: TileState;
  points?: number;
  onPress?: () => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const look = TILE[state];
  const mark = state === 'correct' ? 'checkmark' : state === 'wrong' ? 'close' : null;
  const body = (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: Math.max(6, Math.round(size * 0.14)),
          backgroundColor: look.bg,
          borderColor: look.border,
          borderStyle: state === 'empty' ? 'dashed' : 'solid',
        },
      ]}>
      {!!letter && (
        <Text style={{ fontFamily: FONT, fontSize: size * 0.48, lineHeight: size * 0.6, color: look.ink }} allowFontScaling={false}>
          {letter}
        </Text>
      )}
      {points !== undefined && (
        <Text style={[styles.points, { color: look.ink, fontSize: Math.max(9, size * 0.2) }]} allowFontScaling={false}>
          {points}
        </Text>
      )}
      {mark && (
        <View style={[styles.mark, { backgroundColor: look.border }]}>
          <Ionicons name={mark} size={Math.max(10, size * 0.22)} color="#fff" />
        </View>
      )}
    </View>
  );
  if (!onPress)
    return (
      <View style={style} accessible={!!label} accessibilityLabel={label}>
        {body}
      </View>
    );
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label ?? letter ?? undefined}
      hitSlop={3}
      style={({ pressed }) => [style, pressed && { transform: [{ scale: 0.94 }] }]}>
      {body}
    </Pressable>
  );
}
const TILE: Record<TileState, { bg: string; border: string; ink: string }> = {
  empty: { bg: W.surface, border: W.lineStrong, ink: W.ink },
  active: { bg: W.focusSoft, border: W.focus, ink: W.ink },
  filled: { bg: W.surface, border: W.ink, ink: W.ink },
  given: { bg: W.given, border: W.line, ink: W.inkSoft },
  correct: { bg: W.correct, border: '#0A6B5D', ink: '#fff' },
  wrong: { bg: W.wrong, border: '#962539', ink: '#fff' },
  used: { bg: W.given, border: W.line, ink: '#B5B3C4' },
  rare: { bg: W.rareSoft, border: W.rare, ink: '#5C3700' },
};

/** A keyboard key or a letter to choose: light grey, dark letter, a clear pressed state. */
export function Key({
  label,
  onPress,
  disabled,
  icon,
  width,
  height = 54,
  accessibilityLabel,
  sub,
  tone = 'plain',
}: {
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  width?: number;
  height?: number;
  accessibilityLabel?: string;
  /** A small note in the corner (a letter's points). */
  sub?: string;
  tone?: 'plain' | 'rare' | 'accent';
}) {
  const flip = useFlipStyle();
  const bg = tone === 'rare' ? W.rareSoft : tone === 'accent' ? W.ink : W.key;
  const ink = tone === 'accent' ? '#fff' : tone === 'rare' ? '#5C3700' : W.ink;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.key,
        { height, backgroundColor: bg, opacity: disabled ? 0.35 : 1 },
        tone === 'rare' && { borderWidth: 1.5, borderColor: W.rare },
        width ? { width } : { flex: 1 },
        pressed && { backgroundColor: tone === 'plain' ? W.keyPressed : bg, transform: [{ scale: 0.96 }] },
      ]}>
      {icon ? (
        <Ionicons name={icon} size={22} color={ink} style={icon === 'backspace-outline' ? flip : undefined} />
      ) : (
        <Text style={{ fontFamily: FONT, fontSize: 20, color: ink }} allowFontScaling={false}>
          {label}
        </Text>
      )}
      {!!sub && <Text style={[styles.keySub, { color: ink }]}>{sub}</Text>}
    </Pressable>
  );
}

/** The main action: a dark pill with white words. */
export function PrimaryButton({
  title,
  onPress,
  disabled,
  busy,
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}) {
  const flip = useFlipStyle();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!(disabled || busy), busy: !!busy }}
      style={({ pressed }) => [
        styles.primary,
        disabled && { backgroundColor: '#B9B7C8' },
        pressed && { backgroundColor: '#2A2E4A' },
        style,
      ]}>
      {busy ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <Text style={styles.primaryText}>{title}</Text>
          {icon && <Ionicons name={icon} size={18} color="#fff" style={icon === 'arrow-forward' ? flip : undefined} />}
        </>
      )}
    </Pressable>
  );
}

/** A quieter action: white with a dark outline. */
export function SecondaryButton({
  title,
  onPress,
  disabled,
  icon,
  style,
  accessibilityLabel,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.secondary,
        disabled && { opacity: 0.4 },
        pressed && { backgroundColor: W.key },
        style,
      ]}>
      {icon && <Ionicons name={icon} size={18} color={W.ink} />}
      <Text style={styles.secondaryText}>{title}</Text>
    </Pressable>
  );
}

/**
 * What happened, right after an answer: an icon, a short word and a detail line, read out to screen
 * readers as it appears.
 */
export function Feedback({
  tone,
  title,
  detail,
  trailing,
}: {
  tone: 'good' | 'bad' | 'info';
  title: string;
  detail?: string | null;
  trailing?: ReactNode;
}) {
  useEffect(() => {
    announce(detail ? `${title}. ${detail}` : title);
  }, [title, detail]);
  const look =
    tone === 'good'
      ? { bg: W.correctSoft, ink: W.correct, icon: 'checkmark-circle' as const }
      : tone === 'bad'
        ? { bg: W.wrongSoft, ink: W.wrong, icon: 'close-circle' as const }
        : { bg: W.given, ink: W.inkSoft, icon: 'information-circle' as const };
  return (
    <Animated.View
      entering={FadeIn.duration(160)}
      accessibilityLiveRegion="polite"
      style={[styles.feedback, { backgroundColor: look.bg }]}>
      <Ionicons name={look.icon} size={22} color={look.ink} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: Fonts.bold, fontSize: 15, color: look.ink }}>{title}</Text>
        {!!detail && <Text style={{ fontFamily: Fonts.semibold, fontSize: 15, color: W.ink }}>{detail}</Text>}
      </View>
      {trailing}
    </Animated.View>
  );
}

/** A clue or prompt: the label in small capitals over the text. */
export function ClueCard({ label, text }: { label: string; text: string }) {
  return (
    <View style={styles.clue}>
      <Text style={styles.eyebrow}>{label}</Text>
      <Text style={styles.clueText}>{text}</Text>
    </View>
  );
}

/** Coins next to a hint's price. */
export function CoinCost({ cost }: { cost: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View style={styles.coin}>
        <Text style={{ fontFamily: FONT, fontSize: 9, color: '#5C3700' }} allowFontScaling={false}>
          K
        </Text>
      </View>
      <Text style={{ fontFamily: Fonts.bold, fontSize: 14, color: W.ink }}>{cost}</Text>
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

/** The content column of a game screen: centred, at most 520 wide. */
export const column = { width: '100%', maxWidth: 520, alignSelf: 'center' } as const;

export function GameLoading() {
  const { t } = useTranslation('games');
  return (
    <GameBackground>
      <View style={styles.center} accessibilityLiveRegion="polite">
        <ActivityIndicator color={W.ink} />
        <Text style={{ fontFamily: Fonts.semibold, color: W.inkSoft, marginTop: 12 }}>{t('ui.loading')}</Text>
      </View>
    </GameBackground>
  );
}

export function GameError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useTranslation('games');
  return (
    <GameBackground>
      <SafeAreaView style={[styles.center, { padding: 24, gap: 16 }]}>
        <Ionicons name="cloud-offline-outline" size={36} color={W.muted} />
        <Text style={{ fontFamily: Fonts.semibold, fontSize: 16, color: W.ink, textAlign: 'center', maxWidth: 420 }}>
          {message}
        </Text>
        <View style={{ width: '100%', maxWidth: 360, gap: 10 }}>
          <PrimaryButton title={t('ui.retry')} icon="refresh" onPress={onRetry} />
          <SecondaryButton
            title={t('results.back')}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/world/english' as Href))}
          />
        </View>
      </SafeAreaView>
    </GameBackground>
  );
}

export const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: { backgroundColor: W.surface, borderBottomWidth: 1, borderBottomColor: W.line },
  topRow: {
    ...column,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  topTitle: { fontFamily: FONT, fontSize: 17, color: W.ink, letterSpacing: -0.2 },
  topSub: { fontFamily: Fonts.semibold, fontSize: 13, color: W.muted },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: W.line,
    backgroundColor: W.surface,
  },
  statusRow: {
    ...column,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 6,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 24 },
  statText: { fontFamily: Fonts.bold, fontSize: 14, fontVariant: ['tabular-nums'] },
  tile: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  points: { position: 'absolute', right: 4, bottom: 2, fontFamily: Fonts.bold },
  mark: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: W.page,
  },
  key: { minWidth: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  keySub: { position: 'absolute', right: 5, bottom: 3, fontFamily: Fonts.bold, fontSize: 10 },
  primary: {
    minHeight: 52,
    paddingHorizontal: 24,
    borderRadius: 999,
    backgroundColor: W.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: { fontFamily: Fonts.bold, fontSize: 16, color: '#fff', textAlign: 'center' },
  secondary: {
    minHeight: 52,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: W.ink,
    backgroundColor: W.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryText: { fontFamily: Fonts.bold, fontSize: 16, color: W.ink, textAlign: 'center' },
  feedback: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12 },
  clue: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
    gap: 6,
  },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  clueText: { fontFamily: Fonts.semibold, fontSize: 18, lineHeight: 26, color: W.ink },
  coin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Palette.gold400,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

