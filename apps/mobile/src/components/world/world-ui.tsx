import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressBar, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';
import { useSession } from '@/lib/session';
import type { Level } from '@/lib/world/types';

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
    <View style={{ flexDirection: 'row', gap: 2 }} accessibilityLabel={t('hud.stars', { value, max })}>
      {Array.from({ length: max }, (_, i) =>
        animate && i < value ? (
          <Animated.View key={i} entering={ZoomIn.delay(250 + i * 220).springify()}>
            <Ionicons name="star" size={size} color={Colors.reward} />
          </Animated.View>
        ) : (
          <Ionicons
            key={i}
            name={i < value ? 'star' : 'star-outline'}
            size={size}
            color={i < value ? Colors.reward : 'rgba(255,255,255,0.3)'}
          />
        ),
      )}
    </View>
  );
}

export function Hearts({ left, total = 3 }: { left: number; total?: number }) {
  const { t } = useTranslation('world');
  return (
    <View style={{ flexDirection: 'row', gap: 2 }} accessibilityLabel={t('hud.hearts', { left, total })}>
      {Array.from({ length: total }, (_, i) => (
        <Ionicons
          key={i}
          name={i < left ? 'heart' : 'heart-outline'}
          size={18}
          color={i < left ? Colors.danger : 'rgba(255,255,255,0.3)'}
        />
      ))}
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
      style={styles.wallet}
      accessibilityRole="button"
      accessibilityLabel={t('hud.wallet', { count: user.coins, level: user.level })}>
      <View style={styles.pill}>
        <View style={styles.coin}>
          <Text style={{ fontSize: 10, color: '#7A4B00', fontFamily: 'Manrope_800ExtraBold' }}>K</Text>
        </View>
        <Text variant="bodyStrong" style={{ fontSize: 14 }}>
          {user.coins}
        </Text>
      </View>
      {!compact && (
        <View style={styles.pill}>
          <Ionicons name="flash" size={14} color={Colors.primary} />
          <Text variant="bodyStrong" style={{ fontSize: 14 }}>
            {t('hud.levelShort', { level: user.level })}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/** Top bar for game screens: pause, progress, and slots for hearts / score / timer. */
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
        <Pressable
          onPress={onPause}
          accessibilityRole="button"
          accessibilityLabel={t('hud.pause')}
          hitSlop={10}
          style={styles.pause}>
          <Ionicons name="pause" size={18} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar progress={progress} height={8} colors={Gradients.reward} />
        </View>
        {right}
      </View>
      {(left || timer !== undefined) && (
        <View style={[styles.hudRow, { justifyContent: 'space-between' }]}>
          {left ?? <View />}
          {timer !== undefined && (
            <View
              style={[styles.timer, timer <= 5 && { borderColor: Colors.danger }]}
              accessibilityLabel={t('hud.secondsLeft', { count: timer })}>
              <Ionicons name="time" size={14} color={timer <= 5 ? Colors.danger : Colors.textSecondary} />
              <Text
                variant="bodyStrong"
                color={timer <= 5 ? Colors.danger : Colors.text}
                style={{ fontVariant: ['tabular-nums'], fontSize: 14 }}>
                {t('hud.seconds', { count: timer })}
              </Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

/** Answer button with idle / right / wrong / dimmed / removed states. */
export function AnswerButton({
  label,
  index,
  state,
  onPress,
  disabled,
}: {
  label: string;
  index: number;
  state: 'idle' | 'right' | 'wrong' | 'dim' | 'removed';
  onPress: () => void;
  disabled?: boolean;
}) {
  const removed = state === 'removed';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || removed}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || removed }}
      style={({ pressed }) => [
        styles.answer,
        state === 'right' && styles.right,
        state === 'wrong' && styles.wrong,
        (state === 'dim' || removed) && { opacity: removed ? 0.25 : 0.5 },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}>
      <View
        style={[
          styles.letter,
          state === 'right' && { backgroundColor: Colors.success },
          state === 'wrong' && { backgroundColor: Colors.danger },
        ]}>
        {state === 'right' || state === 'wrong' ? (
          <Ionicons name={state === 'right' ? 'checkmark' : 'close'} size={15} color="#fff" />
        ) : (
          <Text variant="label">{String.fromCharCode(65 + index)}</Text>
        )}
      </View>
      <Text style={[{ flex: 1 }, removed && { textDecorationLine: 'line-through' }]}>{label}</Text>
    </Pressable>
  );
}

/** Kora, the AI helper: a friendly speech bubble. */
export function Kora({ children, mood = 'idle' }: { children: ReactNode; mood?: 'idle' | 'happy' | 'thinking' }) {
  const { t } = useTranslation('world');
  return (
    <View style={styles.kora}>
      <View
        style={[
          styles.koraFace,
          mood === 'happy' && { borderColor: Colors.success },
          mood === 'thinking' && { borderColor: Colors.reward },
        ]}>
        <Text style={{ fontSize: 22 }}>🦉</Text>
      </View>
      <View style={styles.bubble}>
        <Text variant="label" color={Colors.primary} style={{ fontSize: 10 }}>
          {t('kora.label')}
        </Text>
        {typeof children === 'string' ? <Text variant="small">{children}</Text> : children}
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
      hitSlop={10}
      style={styles.pause}>
      <Ionicons name="chevron-back" size={20} color={Colors.text} style={flip} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wallet: { flexDirection: 'row', gap: 6 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  coin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.reward,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hud: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xs, gap: Spacing.xs },
  hudRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.xs },
  pause: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  answer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    borderBottomWidth: 4,
  },
  right: { borderColor: Colors.success, backgroundColor: Colors.successSoft },
  wrong: { borderColor: Colors.danger, backgroundColor: Colors.dangerSoft },
  letter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kora: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  koraFace: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    flex: 1,
    gap: 2,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderTopLeftRadius: 4,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
