import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FONT, W } from '@/components/games/ui';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';
import { useSession } from '@/lib/session';
import type { Level } from '@/lib/world/types';

/**
 * Knowzone World's shared pieces, in the word games' look: a quiet light page, white cards with thin
 * borders, dark ink, and colour kept for meaning (gold stars, green right, red wrong) with an icon too.
 */
export const STAR = '#E2A100';

/** Where each kind of level is played. */
export function levelHref(level: Pick<Level, 'id' | 'kind'>): Href {
  const base =
    level.kind === 'battle'
      ? 'battle'
      : level.kind === 'sprint'
        ? 'minigame'
        : level.kind === 'puzzle'
          ? 'puzzle'
          : 'play';
  return `/world/${base}/${level.id}` as Href;
}

/** A world's own page (its level ladder). */
export const worldHref = (id: string) => `/world/${id}/levels` as Href;

export function Stars({
  value,
  size = 16,
  max = 3,
  animate,
}: {
  value: number;
  size?: number;
  max?: number;
  animate?: boolean;
}) {
  const { t } = useTranslation('world');
  return (
    <View style={{ flexDirection: 'row', gap: 2 }} accessible accessibilityLabel={t('hud.stars', { value, max })}>
      {Array.from({ length: max }, (_, i) =>
        animate && i < value ? (
          <Animated.View key={i} entering={ZoomIn.delay(150 + i * 120).duration(220)}>
            <Ionicons name="star" size={size} color={STAR} />
          </Animated.View>
        ) : (
          <Ionicons key={i} name={i < value ? 'star' : 'star-outline'} size={size} color={i < value ? STAR : W.lineStrong} />
        ),
      )}
    </View>
  );
}

export function Hearts({ left, total = 3 }: { left: number; total?: number }) {
  const { t } = useTranslation('world');
  return (
    <View style={{ flexDirection: 'row', gap: 2 }} accessible accessibilityLabel={t('hud.hearts', { left, total })}>
      {Array.from({ length: total }, (_, i) => (
        <Ionicons key={i} name={i < left ? 'heart' : 'heart-outline'} size={17} color={i < left ? W.wrong : W.muted} />
      ))}
    </View>
  );
}

/** The gold "K" coin. */
export function Coin({ size = 16 }: { size?: number }) {
  return (
    <View style={[styles.coin, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={{ fontSize: size * 0.6, color: '#5C3700', fontFamily: FONT }} allowFontScaling={false}>
        K
      </Text>
    </View>
  );
}

/** Coins and level from the account (the same wallet as the rest of the app). */
export function Wallet({ compact }: { compact?: boolean }) {
  const { user } = useSession();
  const { t } = useTranslation('world');
  if (!user) return null;
  return (
    <Pressable
      onPress={() => router.push('/rewards/wallet')}
      style={({ pressed }) => [styles.wallet, pressed && { opacity: 0.7 }]}
      accessibilityRole="button"
      accessibilityLabel={t('hud.wallet', { count: user.coins, level: user.level })}>
      <View style={styles.pill}>
        <Coin />
        <Text style={styles.pillText}>{user.coins}</Text>
      </View>
      {!compact && (
        <View style={styles.pill}>
          <Ionicons name="flash" size={14} color={W.focus} />
          <Text style={styles.pillText}>{t('hud.levelShort', { level: user.level })}</Text>
        </View>
      )}
    </Pressable>
  );
}

/** A slim progress line (questions done, stars won). */
export function Meter({ value, color = W.ink, height = 4 }: { value: number; color?: string; height?: number }) {
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: W.line, overflow: 'hidden' }}>
      <View style={{ height: '100%', width: `${Math.max(0, Math.min(1, value)) * 100}%`, backgroundColor: color }} />
    </View>
  );
}

/** Top bar for older game screens: pause, progress, and slots for hearts / score / timer. */
export function GameHud({
  onPause,
  progress,
  left,
  right,
  timer,
}: {
  onPause: () => void;
  progress: number;
  left?: ReactNode;
  right?: ReactNode;
  timer?: number;
}) {
  const { t } = useTranslation('world');
  return (
    <SafeAreaView edges={['top']} style={styles.hud}>
      <View style={styles.hudRow}>
        <Pressable onPress={onPause} accessibilityRole="button" accessibilityLabel={t('hud.pause')} hitSlop={6} style={styles.round}>
          <Ionicons name="pause" size={18} color={W.ink} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Meter value={progress} height={6} />
        </View>
        {right}
      </View>
      {(left || timer !== undefined) && (
        <View style={[styles.hudRow, { justifyContent: 'space-between' }]}>
          {left ?? <View />}
          {timer !== undefined && (
            <View style={styles.pill} accessible accessibilityLabel={t('hud.secondsLeft', { count: timer })}>
              <Ionicons name={timer <= 5 ? 'alarm' : 'time-outline'} size={14} color={timer <= 5 ? W.wrong : W.ink} />
              <Text style={[styles.pillText, timer <= 5 && { color: W.wrong }]}>{t('hud.seconds', { count: timer })}</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

export type AnswerState = 'idle' | 'right' | 'wrong' | 'dim' | 'removed';

/**
 * An answer to choose: a letter key, the answer, and after answering a tick or a cross (never colour
 * alone). `keyHint` shows the keyboard key on the web.
 */
export function AnswerButton({
  label,
  index,
  state,
  onPress,
  disabled,
}: {
  label: string;
  index: number;
  state: AnswerState;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation('world');
  const removed = state === 'removed';
  const letter = String.fromCharCode(65 + index);
  const look =
    state === 'right'
      ? { bg: W.correctSoft, border: W.correct, badge: W.correct }
      : state === 'wrong'
        ? { bg: W.wrongSoft, border: W.wrong, badge: W.wrong }
        : { bg: W.surface, border: W.lineStrong, badge: W.given };
  const status = state === 'right' ? `. ${t('adv.a11y.rightAnswer')}` : state === 'wrong' ? `. ${t('adv.a11y.yourWrongAnswer')}` : removed ? `. ${t('adv.a11y.removed')}` : '';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || removed}
      accessibilityRole="button"
      accessibilityLabel={`${letter}: ${label}${status}`}
      accessibilityState={{ disabled: disabled || removed }}
      style={({ pressed }) => [
        styles.answer,
        { backgroundColor: look.bg, borderColor: look.border },
        state === 'dim' && { opacity: 0.55 },
        removed && { opacity: 0.35, borderStyle: 'dashed' },
        pressed && !disabled && { backgroundColor: W.key, transform: [{ scale: 0.99 }] },
      ]}>
      <View style={[styles.letter, { backgroundColor: look.badge }]}>
        {state === 'right' || state === 'wrong' ? (
          <Ionicons name={state === 'right' ? 'checkmark' : 'close'} size={16} color="#fff" />
        ) : (
          <Text style={styles.letterText} allowFontScaling={false}>
            {letter}
          </Text>
        )}
      </View>
      <Text style={[styles.answerText, removed && { textDecorationLine: 'line-through' }]}>{label}</Text>
    </Pressable>
  );
}

/** A note from Kora, the AI helper: a quiet card with a label (no mascot). */
export function Kora({ children, mood = 'idle' }: { children: ReactNode; mood?: 'idle' | 'happy' | 'thinking' }) {
  const { t } = useTranslation('world');
  return (
    <View style={[styles.note, mood === 'happy' && { borderColor: W.correct }]}>
      <Ionicons name={mood === 'happy' ? 'bulb' : 'sparkles-outline'} size={18} color={mood === 'happy' ? W.correct : W.focus} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.noteLabel}>{t('kora.label').toUpperCase()}</Text>
        {typeof children === 'string' ? <Text style={styles.noteText}>{children}</Text> : children}
      </View>
    </View>
  );
}

export function GameBack({ label }: { label?: string }) {
  const { t } = useTranslation('common');
  const flip = useFlipStyle();
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/play'))}
      accessibilityRole="button"
      accessibilityLabel={label ?? t('actions.back')}
      hitSlop={6}
      style={({ pressed }) => [styles.round, pressed && { backgroundColor: W.key }]}>
      <Ionicons name="chevron-back" size={20} color={W.ink} style={flip} />
    </Pressable>
  );
}

/** Small capitals over a section. */
export function Eyebrow({ children, color = W.muted }: { children: string; color?: string }) {
  return <Text style={[styles.eyebrow, { color }]}>{children.toUpperCase()}</Text>;
}

/** A section heading with an optional link on the right. */
export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.section} accessibilityRole="header">
        {title}
      </Text>
      {action && onAction && (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={10} style={{ minHeight: 44, justifyContent: 'center' }}>
          <Text style={styles.link}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

/** A white card with a thin border (a list: rows split by rules). */
export function Panel({ children, style, padded = true }: { children: ReactNode; style?: object; padded?: boolean }) {
  return <View style={[styles.panel, padded && { padding: 16 }, style]}>{children}</View>;
}

export const worldStyles = StyleSheet.create({
  title: { fontFamily: FONT, fontSize: 28, lineHeight: 34, letterSpacing: -0.6, color: W.ink },
  heading: { fontFamily: FONT, fontSize: 18, letterSpacing: -0.2, color: W.ink },
  body: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: W.inkSoft },
  strong: { fontFamily: Fonts.bold, fontSize: 15, color: W.ink },
  small: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18, color: W.inkSoft },
  meta: { fontFamily: Fonts.semibold, fontSize: 13, color: W.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, minHeight: 60 },
  rowLine: { borderTopWidth: 1, borderTopColor: W.line },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: W.lineStrong, marginHorizontal: 2 },
});

const styles = StyleSheet.create({
  wallet: { flexDirection: 'row', gap: 6 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    minHeight: 32,
    borderRadius: 999,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
  },
  pillText: { fontFamily: Fonts.bold, fontSize: 14, color: W.ink, fontVariant: ['tabular-nums'] },
  coin: { backgroundColor: '#FFC857', alignItems: 'center', justifyContent: 'center' },
  hud: { paddingHorizontal: 16, paddingBottom: 6, gap: 6, backgroundColor: W.surface, borderBottomWidth: 1, borderBottomColor: W.line },
  hudRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 6 },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  letter: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  letterText: { fontFamily: FONT, fontSize: 14, color: W.ink },
  answerText: { flex: 1, fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 22, color: W.ink },
  note: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
  },
  noteLabel: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  noteText: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: W.ink },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  section: { fontFamily: FONT, fontSize: 18, letterSpacing: -0.2, color: W.ink, flexShrink: 1 },
  link: { fontFamily: Fonts.bold, fontSize: 14, color: W.focus },
  panel: { borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line, overflow: 'hidden' },
});
