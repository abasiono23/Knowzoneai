import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { column, Feedback, FONT, PrimaryButton, Stat, TimerStat, useCountdown, W } from '@/components/games/ui';
import type { ReviewItem } from '@/components/lab/contract';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { ChoiceQuestion, GameOutcome } from '@/lib/api';
import { useKeys, useRelaxed } from '@/lib/games/english';

/**
 * The pieces the Space Academy and Tech Hub games share, in the word games' look (components/games/ui):
 * a light page, white cards with thin rules, dark ink, colour only for meaning (always with an icon or
 * words), monospace for numbers, code and data, and diagrams drawn like a textbook or a simulation.
 */
export const MONO = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
});

/** Diagram colours: ink lines on white, one accent for "you", and the word games' right/wrong colours. */
export const D = {
  grid: '#ECEAF3',
  axis: '#C6C3D6',
  ink: W.ink,
  soft: W.inkSoft,
  muted: W.muted,
  accent: W.focus,
  accentSoft: W.focusSoft,
  good: W.correct,
  bad: W.wrong,
  warm: '#B26A00',
  sky: '#2F6FDB',
} as const;

/**
 * A row that stays left to right in Arabic too (diagrams, bits, code, formulas). React Native Web
 * rejects `direction` in a style, so on the web the element gets dir="ltr" instead: use both,
 * `style={[..., LTR]} {...ltr} {...ltr}` (as components/brand/logo.tsx does).
 */
export const LTR = Platform.OS === 'web' ? null : ({ direction: 'ltr' } as const);
export const ltr = (Platform.OS === 'web' ? { dir: 'ltr' } : {}) as object;

/** The scrolling page every game sits on: a centred column, 520 wide at most. */
export function Sheet({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: W.page }}
      contentContainerStyle={[column, { padding: 16, gap: 14, paddingBottom: 40 }]}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Eyebrow({ text, style }: { text: string; style?: object }) {
  return <Text style={[styles.eyebrow, style]}>{text.toUpperCase()}</Text>;
}

/** "QUESTION 3 OF 10" with a thin bar of steps (done ones dark, the current one in the accent). */
export function StepBar({ label, n, total, right }: { label: string; n: number; total: number; right?: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Eyebrow text={label} />
        {right}
      </View>
      <View
        style={[styles.steps, LTR]}
        {...ltr}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[styles.step, i < n - 1 && { backgroundColor: W.ink }, i === n - 1 && { backgroundColor: W.focus }]}
          />
        ))}
      </View>
    </View>
  );
}

/** Label–value rows; values in monospace (numbers and units line up). */
export function DataRows({ rows }: { rows: [string, string][] }) {
  return (
    <View style={styles.rows}>
      {rows.map(([label, value], i) => (
        <View
          key={label + i}
          style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: W.line }]}
          accessible
          accessibilityLabel={`${label}: ${value}`}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={[styles.rowValue, LTR]} {...ltr}>
            {value}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** A block of code, a log line or a formula: monospace on a pale panel, left to right, scrolls sideways. */
export function CodeBlock({ text, label }: { text: string; label?: string }) {
  return (
    <View style={styles.code} accessible accessibilityLabel={label ? `${label}: ${text}` : text}>
      {!!label && <Text style={[styles.eyebrow, { marginBottom: 6 }]}>{label.toUpperCase()}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={[styles.codeText, LTR]} {...ltr} selectable>
          {text}
        </Text>
      </ScrollView>
    </View>
  );
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
type OptionState = 'idle' | 'picked' | 'right' | 'wrong' | 'faded';

/** Answer options as full-width rows with a letter key; right and wrong carry an icon as well as colour. */
export function OptionList({
  options,
  picked,
  answer,
  disabled,
  onPick,
  mono,
}: {
  options: string[];
  picked: string | null;
  answer?: string | null;
  disabled?: boolean;
  onPick: (o: string) => void;
  mono?: boolean;
}) {
  const { t } = useTranslation('games');
  return (
    <View style={{ gap: 8 }} accessibilityRole="radiogroup">
      {options.map((o, i) => {
        const state: OptionState = answer
          ? o === answer
            ? 'right'
            : o === picked
              ? 'wrong'
              : 'faded'
          : o === picked
            ? 'picked'
            : 'idle';
        const look = OPTION[state];
        return (
          <Pressable
            key={o}
            disabled={disabled || !!answer}
            onPress={() => onPick(o)}
            accessibilityRole="radio"
            accessibilityState={{ selected: o === picked, disabled: disabled || !!answer }}
            accessibilityLabel={`${LETTERS[i]}. ${o}${state === 'right' ? `. ${t('ui.correct')}` : state === 'wrong' ? `. ${t('ui.wrong')}` : ''}`}
            style={({ pressed }) => [
              styles.option,
              { backgroundColor: look.bg, borderColor: look.border, opacity: state === 'faded' ? 0.55 : 1 },
              pressed && { transform: [{ scale: 0.985 }] },
            ]}>
            <View style={[styles.optionKey, { borderColor: look.ink }]}>
              {state === 'right' || state === 'wrong' ? (
                <Ionicons name={state === 'right' ? 'checkmark' : 'close'} size={15} color={look.ink} />
              ) : (
                <Text style={{ fontFamily: FONT, fontSize: 12, color: look.ink }}>{LETTERS[i]}</Text>
              )}
            </View>
            <Text style={[styles.optionText, { color: look.ink }, mono && { fontFamily: MONO, fontSize: 15 }]}>
              {o}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
const OPTION: Record<OptionState, { bg: string; border: string; ink: string }> = {
  idle: { bg: W.surface, border: W.line, ink: W.ink },
  picked: { bg: W.focusSoft, border: W.focus, ink: W.ink },
  right: { bg: W.correctSoft, border: W.correct, ink: '#075E52' },
  wrong: { bg: W.wrongSoft, border: W.wrong, ink: '#8A1F33' },
  faded: { bg: W.surface, border: W.line, ink: W.inkSoft },
};

/**
 * One multiple-choice step: the question (and anything drawn above it), a clock unless the learner
 * chose "No timer", the options (A–E on a keyboard), what happened, and Continue (Enter).
 * The server decides; `onAnswer` sends the choice (null when the time ran out).
 */
export function QuizStep({
  stepKey,
  q,
  options,
  seconds,
  paused,
  onAnswer,
  onNext,
  nextLabel,
  rightDetail,
  before,
  after,
  mono,
}: {
  stepKey: string | number;
  q: string;
  options: string[];
  /** Seconds to answer; none = no clock. */
  seconds?: number;
  paused?: boolean;
  onAnswer: (choice: string | null) => Promise<GameOutcome | null>;
  onNext: () => void;
  nextLabel?: string;
  rightDetail?: (o: GameOutcome) => string | null;
  /** Shown between the question and the options (data, a hint). */
  before?: ReactNode;
  /** Shown after the answer (an explanation). */
  after?: (o: GameOutcome) => ReactNode;
  mono?: boolean;
}) {
  const { t } = useTranslation('games');
  const ts = useTranslation('space').t;
  const { relaxed } = useRelaxed();
  const [picked, setPicked] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [sending, setSending] = useState(false);
  const timed = !!seconds && !relaxed;
  const send = async (choice: string | null) => {
    if (sending || outcome) return;
    setPicked(choice);
    setSending(true);
    const o = await onAnswer(choice);
    setSending(false);
    if (o) setOutcome(o);
    else setPicked(null);
  };
  const left = useCountdown(seconds ?? 0, timed && !paused && !outcome && !sending, () => void send(null), stepKey);
  useKeys((key) => {
    if (outcome) {
      if (key === 'Enter' || key === ' ') onNext();
      return;
    }
    const i = LETTERS.indexOf(key) >= 0 ? LETTERS.indexOf(key) : Number(key) - 1;
    if (i >= 0 && i < options.length) void send(options[i]!);
  }, !paused);
  const answer = outcome ? String(outcome.answer ?? '') : null;
  return (
    <Animated.View key={stepKey} entering={FadeIn.duration(180)} style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        {timed && !outcome ? (
          <TimerStat seconds={left} relaxed={false} />
        ) : !seconds || relaxed ? (
          <Stat icon="infinite" text={t('ui.relaxed')} />
        ) : null}
      </View>
      <Card>
        <Text style={styles.question} accessibilityRole="header">
          {q}
        </Text>
      </Card>
      {before}
      <OptionList
        options={options}
        picked={picked}
        answer={answer}
        disabled={sending || paused}
        onPick={(o) => void send(o)}
        mono={mono}
      />
      {outcome && (
        <Animated.View entering={FadeInDown.duration(180)} style={{ gap: 12 }}>
          <Feedback
            tone={outcome.correct ? 'good' : 'bad'}
            title={
              outcome.correct
                ? `${t('ui.correct')} · ${t('ui.points', { count: outcome.points })}`
                : picked
                  ? t('ui.wrong')
                  : ts('kit.timeUp')
            }
            detail={outcome.correct ? (rightDetail?.(outcome) ?? null) : ts('kit.answerWas', { answer })}
          />
          {after?.(outcome)}
          <PrimaryButton title={nextLabel ?? t('ui.next')} icon="arrow-forward" onPress={onNext} />
        </Animated.View>
      )}
    </Animated.View>
  );
}

/** Results-screen review lines for a list of answered multiple-choice questions. */
export function choiceReview(
  questions: ChoiceQuestion[],
  detail?: (q: ChoiceQuestion) => string | undefined,
): ReviewItem[] {
  return questions.flatMap((x) =>
    x.result
      ? [{ key: String(x.id), correct: x.result.correct, main: x.q, detail: detail?.(x) ?? x.result.answer }]
      : [],
  );
}

/** Moves on from a finished step: the next step, or the end of the run (the frame shows the results). */
export function useAdvance(
  run: { at: number; status: string; hearts: number },
  total: number,
  finish: () => Promise<void> | void,
) {
  const [i, setI] = useState(() => Math.min(run.at, total - 1));
  const over = run.status !== 'playing' || run.at >= total || run.hearts <= 0;
  const next = () => {
    if (over) void finish();
    else setI(run.at);
  };
  return { i, next, over, setI };
}

/** Haptic-free motion helper: a value that eases to `target` over `ms` (for simple diagram animation). */
export function useTween(target: number, ms = 600) {
  const [v, setV] = useState(target);
  useEffect(() => {
    const from = v;
    const t0 = Date.now();
    let raf = 0;
    const tick = () => {
      const k = Math.min(1, (Date.now() - t0) / ms);
      setV(from + (target - from) * (1 - (1 - k) ** 3));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, ms]);
  return v;
}

export const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 14, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line, gap: 10 },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  steps: { flexDirection: 'row', gap: 4 },
  step: { flex: 1, height: 4, borderRadius: 2, backgroundColor: W.lineStrong },
  rows: { borderRadius: 12, borderWidth: 1, borderColor: W.line, backgroundColor: W.surface },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  rowLabel: { flex: 1, fontFamily: Fonts.semibold, fontSize: 14, color: W.inkSoft },
  rowValue: { fontFamily: MONO, fontSize: 14, color: W.ink, textAlign: 'right' },
  code: { padding: 12, borderRadius: 10, backgroundColor: '#F1F0F6', borderWidth: 1, borderColor: W.line },
  codeText: { fontFamily: MONO, fontSize: 14, lineHeight: 21, color: W.ink },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  optionKey: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { flex: 1, fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 22 },
  question: { fontFamily: Fonts.bold, fontSize: 18, lineHeight: 26, color: W.ink },
});
