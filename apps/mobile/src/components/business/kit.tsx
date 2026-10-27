import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Backdrop } from '@/components/lab/backdrop';
import { BOLD, GoldButton, Panel } from '@/components/lab/hud';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { Grade } from '@/lib/api';

/**
 * Building blocks shared by the Business District games: the screen (scene, scrolling panels and a
 * fixed action button), number steppers, choice lists, money statements and lesson cards.
 */
export const INK = '#1B1F3B';
export const PAPER = '#FBF7EE';
export const GREEN = '#1E9E6A';
export const RED = '#D64545';

export function GameScreen({ scene, children, action }: { scene: number; children: ReactNode; action: ReactNode }) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Backdrop source={scene} dim={0.55} />
      <ScrollView
        style={StyleSheet.absoluteFill}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={styles.bottom} pointerEvents="box-none">
        {action}
      </SafeAreaView>
    </View>
  );
}

/** A heading in small capitals. */
export function Eyebrow({ children, color = Colors.reward }: { children: ReactNode; color?: string }) {
  return <Text style={{ fontFamily: BOLD, fontSize: 12, letterSpacing: 1, color }}>{children}</Text>;
}

/** A light "paper" card (decisions, statements). */
export function Card({ children, style }: { children: ReactNode; style?: object }) {
  return (
    <Animated.View entering={FadeInDown} style={[styles.card, style]}>
      {children}
    </Animated.View>
  );
}

/** A header panel: title, subtitle and a row of numbers. */
export function Header({
  title,
  subtitle,
  stats,
}: {
  title: string;
  subtitle?: string;
  stats?: { label: string; value: string; color?: string }[];
}) {
  return (
    <Panel style={{ gap: 6 }}>
      <Text style={{ fontFamily: BOLD, fontSize: 16, color: '#fff' }}>{title}</Text>
      {!!subtitle && <Text style={{ color: Colors.reward, fontFamily: BOLD, fontSize: 12 }}>{subtitle}</Text>}
      {!!stats?.length && (
        <View style={styles.stats}>
          {stats.map((s) => (
            <View key={s.label} style={styles.stat}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{s.label}</Text>
              <Text style={{ color: s.color ?? '#fff', fontFamily: BOLD, fontSize: 15 }}>{s.value}</Text>
            </View>
          ))}
        </View>
      )}
    </Panel>
  );
}

/** − value + with an optional second, bigger step. */
export function Stepper({
  label,
  hint,
  value,
  onChange,
  step,
  big,
  min = 0,
  max = Infinity,
  format = String,
  warn,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
  big?: number;
  min?: number;
  max?: number;
  format?: (v: number) => string;
  warn?: boolean;
}) {
  const { t } = useTranslation('business');
  const set = (v: number) => onChange(Math.min(max, Math.max(min, Math.round(v * 100) / 100)));
  const button = (icon: 'remove' | 'add' | 'play-back' | 'play-forward', d: number, a11y: string) => (
    <Pressable
      onPress={() => set(value + d)}
      disabled={d < 0 ? value <= min : value >= max}
      accessibilityRole="button"
      accessibilityLabel={`${a11y}: ${label}`}
      hitSlop={6}
      style={({ pressed }) => [
        styles.stepBtn,
        (d < 0 ? value <= min : value >= max) && { opacity: 0.35 },
        pressed && { opacity: 0.7 },
      ]}>
      <Ionicons name={icon} size={icon.startsWith('play') ? 14 : 18} color={INK} />
    </Pressable>
  );
  return (
    <View style={styles.stepRow}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: BOLD, color: INK, fontSize: 14 }}>{label}</Text>
        {!!hint && <Text style={{ color: warn ? RED : '#5B6390', fontSize: 12 }}>{hint}</Text>}
      </View>
      {big !== undefined && button('play-back', -big, t('ui.less'))}
      {button('remove', -step, t('ui.less'))}
      <Text style={styles.stepValue}>{format(value)}</Text>
      {button('add', step, t('ui.more'))}
      {big !== undefined && button('play-forward', big, t('ui.more'))}
    </View>
  );
}

/** A list of options to pick one from. */
export function Options({
  options,
  picked,
  onPick,
  disabled,
  marks,
}: {
  options: { id: string; label: string; note?: string }[];
  picked: string | null;
  onPick: (id: string) => void;
  disabled?: boolean;
  /** After answering: which options were right or wrong. */
  marks?: Record<string, 'right' | 'wrong'>;
}) {
  return (
    <View style={{ gap: 8 }}>
      {options.map((o) => {
        const on = picked === o.id;
        const mark = marks?.[o.id];
        return (
          <Pressable
            key={o.id}
            onPress={() => onPick(o.id)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ checked: on, disabled }}
            style={({ pressed }) => [
              styles.option,
              on && styles.optionOn,
              mark === 'right' && { borderColor: GREEN, backgroundColor: '#E3F6EC' },
              mark === 'wrong' && { borderColor: RED, backgroundColor: '#FBE6E6' },
              pressed && { opacity: 0.85 },
            ]}>
            <Ionicons
              name={
                mark === 'right'
                  ? 'checkmark-circle'
                  : mark === 'wrong'
                    ? 'close-circle'
                    : on
                      ? 'radio-button-on'
                      : 'radio-button-off'
              }
              size={20}
              color={mark === 'right' ? GREEN : mark === 'wrong' ? RED : on ? Colors.primary : '#8A91B8'}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: INK, fontSize: 14, lineHeight: 19 }}>{o.label}</Text>
              {!!o.note && <Text style={{ color: '#5B6390', fontSize: 12 }}>{o.note}</Text>}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/** A small statement: label on the left, amount on the right; totals in bold. */
export function Statement({
  rows,
}: {
  rows: { label: string; value: string; total?: boolean; color?: string; hidden?: boolean }[];
}) {
  return (
    <View style={{ gap: 4 }}>
      {rows
        .filter((r) => !r.hidden)
        .map((r) => (
          <View key={r.label} style={[styles.line, r.total && styles.total]}>
            <Text style={{ flex: 1, color: INK, fontSize: 13, fontFamily: r.total ? BOLD : undefined }}>{r.label}</Text>
            <Text style={{ color: r.color ?? INK, fontSize: 14, fontFamily: BOLD }}>{r.value}</Text>
          </View>
        ))}
    </View>
  );
}

/** How good a decision was. */
export function GradeBadge({ grade }: { grade: Grade }) {
  const { t } = useTranslation('business');
  const color = grade === 'best' ? GREEN : grade === 'ok' ? '#C98A00' : RED;
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Ionicons
        name={grade === 'best' ? 'trophy' : grade === 'ok' ? 'thumbs-up' : 'alert-circle'}
        size={14}
        color="#fff"
      />
      <Text style={{ color: '#fff', fontFamily: BOLD, fontSize: 12 }}>
        {t(grade === 'best' ? 'ui.best' : grade === 'ok' ? 'ui.fair' : 'ui.poor')}
      </Text>
    </View>
  );
}

/** The business idea behind a turn. */
export function Lesson({ text }: { text: string }) {
  const { t } = useTranslation('business');
  return (
    <View style={styles.lesson}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Ionicons name="school" size={16} color="#6A4BE0" />
        <Eyebrow color="#6A4BE0">{t('ui.lesson')}</Eyebrow>
      </View>
      <Text style={{ color: INK, fontSize: 14, lineHeight: 20 }}>{text}</Text>
    </View>
  );
}

/** A bar of three parts (e.g. needs, wants, savings). */
export function SplitBar({ parts }: { parts: { share: number; color: string }[] }) {
  return (
    <View style={styles.split}>
      {parts.map((p, i) => (
        <View key={i} style={{ flex: Math.max(0, p.share), backgroundColor: p.color }} />
      ))}
    </View>
  );
}

/** Progress towards a target. */
export function Meter({ value, max, color = GREEN }: { value: number; max: number; color?: string }) {
  const share = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <View style={styles.meter}>
      <View style={{ width: `${share * 100}%`, height: '100%', backgroundColor: color, borderRadius: 4 }} />
    </View>
  );
}

/** The fixed button at the bottom, with an optional warning above it. */
export function Action({
  title,
  onPress,
  disabled,
  icon = 'arrow-forward',
  note,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  note?: string | null;
}) {
  return (
    <View style={{ gap: 6 }}>
      {!!note && (
        <Panel style={{ paddingVertical: 6 }}>
          <Text style={{ color: '#FFB4C2', fontSize: 12, textAlign: 'center' }}>{note}</Text>
        </Panel>
      )}
      <GoldButton title={title} icon={icon} onPress={onPress} disabled={disabled} />
    </View>
  );
}

export const kit = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  body: { color: INK, fontSize: 14, lineHeight: 20 },
  small: { color: '#5B6390', fontSize: 12, lineHeight: 17 },
  title: { fontFamily: BOLD, color: INK, fontSize: 17 },
});

const styles = StyleSheet.create({
  scroll: { paddingTop: 112, paddingBottom: 140, paddingHorizontal: Spacing.md, gap: Spacing.sm },
  bottom: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: Spacing.md },
  card: {
    gap: 10,
    padding: Spacing.md,
    borderRadius: 18,
    backgroundColor: PAPER,
    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
  },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: {
    flexGrow: 1,
    minWidth: 70,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8E2F8',
  },
  stepValue: { minWidth: 58, textAlign: 'center', fontFamily: BOLD, color: INK, fontSize: 15 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E3DDF2',
    backgroundColor: '#fff',
  },
  optionOn: { borderColor: Colors.primary, backgroundColor: '#F1ECFF' },
  line: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  total: { borderTopWidth: 1, borderTopColor: '#DDD6C6', paddingTop: 6, marginTop: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  lesson: { gap: 6, padding: 12, borderRadius: 14, backgroundColor: '#EFEAFF' },
  split: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', backgroundColor: '#E8E2F8' },
  meter: { height: 8, borderRadius: 4, backgroundColor: '#E8E2F8', overflow: 'hidden' },
});
