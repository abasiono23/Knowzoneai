import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Feedback, FONT, PrimaryButton, TimerStat, useCountdown, W } from '@/components/games/ui';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { GameOutcome } from '@/lib/api';
import { useKeys, useRelaxed } from '@/lib/games/english';

/**
 * Pieces shared by the Museum of Time and the Business District games, in the word games' look: a
 * quiet light page with a centred column and a fixed action bar, multiple-choice and put-in-order
 * cards with a clock that respects the "Question timer" setting, and feedback with an icon and words.
 */

/** The game's page: a scrolling column (at most `width` wide) and a fixed bar of actions at the bottom. */
export function Board({ children, footer, width = 560 }: { children: ReactNode; footer?: ReactNode; width?: number }) {
  return (
    <View style={{ flex: 1, backgroundColor: W.page }}>
      <ScrollView contentContainerStyle={[styles.scroll, { maxWidth: width }]} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {!!footer && (
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <View style={[styles.footerInner, { maxWidth: width }]}>{footer}</View>
        </SafeAreaView>
      )}
    </View>
  );
}

/** A white card with a hairline border. */
export function Panel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={FadeInDown.duration(180)} style={[styles.panel, style]}>
      {children}
    </Animated.View>
  );
}

/** A heading in small capitals. */
export function Eyebrow({ children, color = W.muted }: { children: string; color?: string }) {
  return <Text style={[styles.eyebrow, { color }]}>{children.toUpperCase()}</Text>;
}

type Phase = { picked: string | null; outcome: GameOutcome | null };

/**
 * A multiple-choice question: pick, then check (the server says if it's right). With a clock when
 * `seconds` > 0 and the timer is on; when time runs out the question counts as wrong. After checking,
 * the right option is marked with a tick, a wrong pick with a cross, and `explain` may add the lesson.
 * On a computer, 1–6 pick and Enter checks or goes on.
 */
export function QuizCard({
  eyebrow,
  q,
  options,
  seconds = 0,
  paused,
  done,
  onAnswer,
  onNext,
  nextLabel,
  explain,
  ltr,
  children,
}: {
  eyebrow?: string;
  q: string;
  options: string[];
  seconds?: number;
  paused?: boolean;
  /** Already answered (coming back to a run): the result to show. */
  done?: { correct: boolean; answer: string; choice?: string | null };
  onAnswer: (choice: string | null) => Promise<GameOutcome | null>;
  onNext: () => void;
  nextLabel: string;
  /** Shown once answered (the method, the context). */
  explain?: (outcome: { correct: boolean; answer: string }) => ReactNode;
  /** Numbers and formulas: keep the options left to right in every language. */
  ltr?: boolean;
  /** Anything between the question and the options (a source, a table). */
  children?: ReactNode;
}) {
  const { t } = useTranslation('games');
  const th = useTranslation('history').t as unknown as (k: string) => string;
  const { relaxed } = useRelaxed();
  const [state, setState] = useState<Phase>(() => ({
    picked: done?.choice ?? null,
    outcome: done ? ({ correct: done.correct, points: 0, heartLost: !done.correct, answer: done.answer } as GameOutcome) : null,
  }));
  const [sending, setSending] = useState(false);
  const answered = !!state.outcome;
  const clock = seconds > 0 && !relaxed;
  const send = async (choice: string | null) => {
    if (answered || sending) return;
    setSending(true);
    const outcome = await onAnswer(choice);
    setSending(false);
    if (outcome) setState({ picked: choice, outcome });
  };
  const left = useCountdown(seconds, clock && !answered && !paused && !sending, () => void send(null), q);
  const right = typeof state.outcome?.answer === 'string' ? state.outcome.answer : (done?.answer ?? null);

  useKeys(
    (key) => {
      if (/^[1-6]$/.test(key) && !answered) {
        const o = options[Number(key) - 1];
        if (o) setState((s) => ({ ...s, picked: o }));
      } else if (key === 'Enter') {
        if (answered) onNext();
        else if (state.picked) void send(state.picked);
      }
    },
    !paused,
  );

  return (
    <View style={{ gap: 12 }}>
      <Panel style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flex: 1 }}>{!!eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}</View>
          {clock && !answered && <TimerStat seconds={left} relaxed={false} />}
        </View>
        <Text style={styles.q} accessibilityRole="header">
          {q}
        </Text>
        {children}
      </Panel>
      <View style={{ gap: 8 }} accessibilityRole="radiogroup">
        {options.map((o, k) => {
          const on = state.picked === o;
          const isRight = answered && o === right;
          const isWrong = answered && on && o !== right;
          const tone = isRight ? styles.right : isWrong ? styles.wrong : on ? styles.on : null;
          return (
            <Pressable
              key={o}
              disabled={answered}
              onPress={() => setState((s) => ({ ...s, picked: o }))}
              accessibilityRole="radio"
              accessibilityState={{ checked: on, disabled: answered }}
              accessibilityLabel={`${o}${isRight ? `, ${t('ui.correct')}` : isWrong ? `, ${t('ui.wrong')}` : ''}`}
              style={({ pressed }) => [styles.option, tone, pressed && !answered && { backgroundColor: W.key }]}>
              <View style={[styles.letter, on && !answered && { backgroundColor: W.ink, borderColor: W.ink }, isRight && styles.letterRight, isWrong && styles.letterWrong]}>
                {isRight || isWrong ? (
                  <Ionicons name={isRight ? 'checkmark' : 'close'} size={14} color="#fff" />
                ) : (
                  <Text style={[styles.letterText, on && { color: '#fff' }]}>{k + 1}</Text>
                )}
              </View>
              <Text style={[styles.optionText, ltr && (Platform.OS === 'web' ? { textAlign: 'left' } : { writingDirection: 'ltr', textAlign: 'left' })]}>{o}</Text>
            </Pressable>
          );
        })}
      </View>
      {answered && state.outcome && (
        <Animated.View entering={FadeIn.duration(160)} style={{ gap: 10 }}>
          <Feedback
            tone={state.outcome.correct ? 'good' : 'bad'}
            title={state.outcome.correct ? t('ui.correct') : state.picked === null ? th('quiz.timeUp') : t('ui.wrong')}
            detail={state.outcome.correct || !right ? null : right}
          />
          {explain?.({ correct: state.outcome.correct, answer: right ?? '' })}
        </Animated.View>
      )}
      <PrimaryButton
        title={answered ? nextLabel : t('ui.check')}
        icon={answered ? 'arrow-forward' : undefined}
        disabled={!answered && !state.picked}
        busy={sending}
        onPress={() => (answered ? onNext() : void send(state.picked))}
      />
    </View>
  );
}

/**
 * Put in order: move each line up or down (buttons, or arrow keys on a computer after choosing a
 * line), earliest first, then check. Afterwards the right order shows, with the dates when known and
 * each line marked right or wrong.
 */
export function OrderList({
  eyebrow,
  q,
  items,
  seconds = 0,
  paused,
  done,
  onAnswer,
  onNext,
  nextLabel,
}: {
  eyebrow?: string;
  q: string;
  items: string[];
  seconds?: number;
  paused?: boolean;
  done?: { correct: boolean; answer: string[]; years?: number[] };
  onAnswer: (order: string[] | null) => Promise<GameOutcome | null>;
  onNext: () => void;
  nextLabel: string;
}) {
  const th = useTranslation('history').t as unknown as (k: string, o?: Record<string, unknown>) => string;
  const { relaxed } = useRelaxed();
  const [order, setOrder] = useState(items);
  const [focus, setFocus] = useState(0);
  const [outcome, setOutcome] = useState<{ correct: boolean; answer: string[]; years?: number[] } | null>(done ?? null);
  const [sending, setSending] = useState(false);
  const clock = seconds > 0 && !relaxed;
  const send = async (given: string[] | null) => {
    if (outcome || sending) return;
    setSending(true);
    const res = await onAnswer(given);
    setSending(false);
    if (res) setOutcome({ correct: res.correct, answer: (res.answer as string[]) ?? [], years: (res as { years?: number[] }).years });
  };
  const left = useCountdown(seconds, clock && !outcome && !paused && !sending, () => void send(null), q);
  const move = (k: number, by: -1 | 1) => {
    const j = k + by;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[k], next[j]] = [next[j]!, next[k]!];
    setOrder(next);
    setFocus(j);
  };
  useKeys(
    (key) => {
      if (outcome) return key === 'Enter' && onNext();
      if (key === 'ArrowUp') move(focus, -1);
      else if (key === 'ArrowDown') move(focus, 1);
      else if (/^[1-9]$/.test(key) && Number(key) <= order.length) setFocus(Number(key) - 1);
      else if (key === 'Enter') void send(order);
    },
    !paused,
  );
  const shown = outcome?.answer.length ? outcome.answer : order;

  return (
    <View style={{ gap: 12 }}>
      <Panel style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flex: 1 }}>{!!eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}</View>
          {clock && !outcome && <TimerStat seconds={left} relaxed={false} />}
        </View>
        <Text style={styles.q} accessibilityRole="header">
          {q}
        </Text>
        {Platform.OS === 'web' && !outcome && <Text style={styles.small}>{th('order.keys')}</Text>}
      </Panel>
      <View style={styles.orderList}>
        <View style={styles.rail} />
        {shown.map((item, k) => {
          const mine = order.indexOf(item);
          const ok = outcome ? order[k] === item : null;
          return (
            <Animated.View key={item} layout={LinearTransition.duration(160)} style={styles.orderRow}>
              <View style={[styles.node, ok === true && styles.letterRight, ok === false && styles.letterWrong, !outcome && focus === k && { borderColor: W.focus }]}>
                {ok === null ? (
                  <Text style={styles.letterText}>{k + 1}</Text>
                ) : (
                  <Ionicons name={ok ? 'checkmark' : 'close'} size={14} color="#fff" />
                )}
              </View>
              <Pressable
                onPress={() => setFocus(k)}
                disabled={!!outcome}
                accessibilityLabel={`${k + 1}. ${item}${outcome && outcome.years?.[k] !== undefined ? `, ${yearText(outcome.years[k]!, th)}` : ''}`}
                style={[styles.orderCard, !outcome && focus === k && { borderColor: W.focus, backgroundColor: W.focusSoft }]}>
                <Text style={styles.orderText}>{item}</Text>
                {outcome && outcome.years?.[k] !== undefined && <Text style={styles.year}>{yearText(outcome.years[k]!, th)}</Text>}
                {outcome && ok === false && mine >= 0 && <Text style={styles.small}>{th('order.youHad', { n: mine + 1 })}</Text>}
              </Pressable>
              {!outcome && (
                <View style={{ gap: 4 }}>
                  <Pressable
                    onPress={() => move(k, -1)}
                    disabled={k === 0}
                    accessibilityRole="button"
                    accessibilityLabel={th('time.order.up', { item })}
                    hitSlop={4}
                    style={[styles.move, k === 0 && { opacity: 0.3 }]}>
                    <Ionicons name="chevron-up" size={18} color={W.ink} />
                  </Pressable>
                  <Pressable
                    onPress={() => move(k, 1)}
                    disabled={k === shown.length - 1}
                    accessibilityRole="button"
                    accessibilityLabel={th('time.order.down', { item })}
                    hitSlop={4}
                    style={[styles.move, k === shown.length - 1 && { opacity: 0.3 }]}>
                    <Ionicons name="chevron-down" size={18} color={W.ink} />
                  </Pressable>
                </View>
              )}
            </Animated.View>
          );
        })}
      </View>
      {outcome && (
        <Feedback tone={outcome.correct ? 'good' : 'bad'} title={outcome.correct ? th('time.order.right', { points: 100 }) : th('time.order.wrong')} />
      )}
      <PrimaryButton
        title={outcome ? nextLabel : th('time.order.check')}
        icon={outcome ? 'arrow-forward' : undefined}
        busy={sending}
        onPress={() => (outcome ? onNext() : void send(order))}
      />
    </View>
  );
}

/** "1960", "AD 330", "c. 500 BC" style years for the revealed timeline. */
export function yearText(year: number, t: (k: string, o?: Record<string, unknown>) => string) {
  return year < 0 ? t('order.bc', { year: -year }) : year < 1000 ? t('order.ad', { year }) : String(year);
}

/** The status at the top of a game: a row of small facts. */
export function Facts({ items }: { items: { label: string; value: string; tone?: 'good' | 'bad' }[] }) {
  return (
    <View style={styles.facts}>
      {items.map((f) => (
        <View key={f.label} style={styles.fact} accessible accessibilityLabel={`${f.label}: ${f.value}`}>
          <Text style={[styles.factValue, f.tone === 'good' && { color: W.correct }, f.tone === 'bad' && { color: W.wrong }]} numberOfLines={1}>
            {f.value}
          </Text>
          <Text style={styles.factLabel} numberOfLines={2}>
            {f.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Calls `onDone` when the clock-free intro of a step should end (for short reveals). */
export function useAfter(ms: number, onDone: () => void, run: boolean) {
  useEffect(() => {
    if (!run) return;
    const id = setTimeout(onDone, ms);
    return () => clearTimeout(id);
  }, [ms, onDone, run]);
}

export const quiz = StyleSheet.create({
  body: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: W.ink },
  small: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18, color: W.inkSoft },
  title: { fontFamily: FONT, fontSize: 20, lineHeight: 26, letterSpacing: -0.3, color: W.ink },
});

const styles = StyleSheet.create({
  scroll: { width: '100%', alignSelf: 'center', padding: 16, paddingBottom: 32, gap: 14 },
  footer: { borderTopWidth: 1, borderTopColor: W.line, backgroundColor: W.surface },
  footerInner: { width: '100%', alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  panel: { padding: 16, borderRadius: 14, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line, gap: 8 },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2 },
  q: { fontFamily: Fonts.bold, fontSize: 17, lineHeight: 24, color: W.ink },
  small: quiz.small,
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: W.line,
    backgroundColor: W.surface,
  },
  on: { borderColor: W.ink },
  right: { borderColor: W.correct, backgroundColor: W.correctSoft },
  wrong: { borderColor: W.wrong, backgroundColor: W.wrongSoft },
  letter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: W.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterRight: { backgroundColor: W.correct, borderColor: W.correct },
  letterWrong: { backgroundColor: W.wrong, borderColor: W.wrong },
  letterText: { fontFamily: Fonts.bold, fontSize: 12, color: W.inkSoft },
  optionText: { flex: 1, fontFamily: Fonts.semibold, fontSize: 15, lineHeight: 21, color: W.ink },
  orderList: { gap: 8, position: 'relative' },
  rail: { position: 'absolute', left: 12, top: 14, bottom: 14, width: 2, backgroundColor: W.line },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  node: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: W.lineStrong,
    backgroundColor: W.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderCard: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: W.line,
    backgroundColor: W.surface,
    gap: 2,
  },
  orderText: { fontFamily: Fonts.semibold, fontSize: 15, lineHeight: 20, color: W.ink },
  year: { fontFamily: FONT, fontSize: 13, color: W.focus, fontVariant: ['tabular-nums'] },
  move: {
    width: 44,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: W.line,
    backgroundColor: W.surface,
  },
  facts: {
    flexDirection: 'row',
    borderRadius: 14,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
    paddingVertical: 12,
  },
  fact: { flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: 4 },
  factValue: { fontFamily: FONT, fontSize: 18, color: W.ink, fontVariant: ['tabular-nums'] },
  factLabel: { fontFamily: Fonts.semibold, fontSize: 12, color: W.muted, textAlign: 'center' },
});
