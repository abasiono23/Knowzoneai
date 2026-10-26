import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Button, Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import type { Interaction } from '@/lib/courses/types';

/** Deterministic shuffle so the order is stable across renders (and never the original order). */
function shuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const j = Math.abs(h) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  if (out.length > 1 && out.every((x, i) => x === items[i])) out.push(out.shift()!);
  return out;
}

const buzz = (ok: boolean) =>
  Haptics.notificationAsync(
    ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
  ).catch(() => {});

const TONE = {
  right: { title: 'correct', icon: 'checkmark-circle', color: Colors.success, bg: Colors.successSoft },
  partial: { title: 'gotThere', icon: 'checkmark-circle-outline', color: Colors.reward, bg: Colors.rewardSoft },
  wrong: { title: 'notQuite', icon: 'close-circle', color: Colors.danger, bg: Colors.dangerSoft },
} as const;

/** right = first try, partial = solved after a retry, wrong = missed. */
function Feedback({ ok, partial, text }: { ok: boolean; partial?: boolean; text: string }) {
  const { t: tr } = useTranslation('courses');
  const t = TONE[ok ? 'right' : partial ? 'partial' : 'wrong'];
  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      style={[styles.feedback, { backgroundColor: t.bg, borderColor: t.color + '66' }]}>
      <Ionicons name={t.icon} size={20} color={t.color} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong" color={t.color}>
          {tr(`interaction.${t.title}`)}
        </Text>
        <Text variant="small">{text}</Text>
      </View>
    </Animated.View>
  );
}

type Props = { item: Interaction; seed: string; onDone: (firstTry: boolean) => void };

/** One self-checking activity. Calls onDone once, with whether it was right first time. */
export function InteractionView({ item, seed, onDone }: Props) {
  switch (item.kind) {
    case 'reveal':
      return <Reveal item={item} onDone={onDone} />;
    case 'choice':
      return (
        <Choice options={item.options} correctIndex={item.correctIndex} feedback={item.feedback} onDone={onDone} />
      );
    case 'fill':
      return <Fill item={item} onDone={onDone} />;
    case 'order':
      return <Order item={item} seed={seed} onDone={onDone} />;
    case 'match':
      return <Match item={item} seed={seed} onDone={onDone} />;
  }
}

function Reveal({ item, onDone }: { item: Extract<Interaction, { kind: 'reveal' }>; onDone: Props['onDone'] }) {
  const { t } = useTranslation('courses');
  const [shown, setShown] = useState(false);
  const [rated, setRated] = useState<boolean | null>(null);
  return (
    <View style={{ gap: Spacing.sm }}>
      {!shown ? (
        <>
          <View style={styles.think}>
            <Ionicons name="bulb-outline" size={22} color={Colors.reward} />
            <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
              {t('interaction.think')}
            </Text>
          </View>
          <Button variant="secondary" icon="eye" title={t('interaction.reveal')} onPress={() => setShown(true)} />
        </>
      ) : (
        <Animated.View entering={FadeIn.duration(300)} style={{ gap: Spacing.sm }}>
          <View style={styles.answer}>
            <Text variant="label" color={Colors.success}>
              {t('interaction.answer')}
            </Text>
            <Text>{item.answer}</Text>
          </View>
          {rated === null ? (
            <>
              <Text variant="small" color={Colors.textSecondary} center>
                {t('interaction.didYouGetIt')}
              </Text>
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                <Button
                  variant="secondary"
                  title={t('interaction.notYet')}
                  icon="refresh"
                  style={{ flex: 1 }}
                  onPress={() => (setRated(false), onDone(false))}
                />
                <Button
                  title={t('actions.gotIt', { ns: 'common' })}
                  icon="checkmark"
                  style={{ flex: 1 }}
                  onPress={() => (setRated(true), onDone(true))}
                />
              </View>
            </>
          ) : (
            <Text variant="small" color={rated ? Colors.success : Colors.textSecondary} center>
              {rated ? t('interaction.niceWork') : t('interaction.noProblem')}
            </Text>
          )}
        </Animated.View>
      )}
    </View>
  );
}

function Choice({
  options,
  correctIndex,
  feedback,
  onDone,
}: {
  options: string[];
  correctIndex: number;
  feedback: string;
  onDone: Props['onDone'];
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    buzz(i === correctIndex);
    onDone(i === correctIndex);
  };
  return (
    <View style={{ gap: Spacing.xs }}>
      {options.map((o, i) => {
        const state = picked === null ? 'idle' : i === correctIndex ? 'right' : i === picked ? 'wrong' : 'dim';
        return (
          <Pressable
            key={i}
            onPress={() => pick(i)}
            disabled={picked !== null}
            accessibilityRole="button"
            accessibilityState={{ selected: picked === i }}
            accessibilityLabel={o}
            style={[
              styles.option,
              state === 'right' && styles.right,
              state === 'wrong' && styles.wrong,
              state === 'dim' && { opacity: 0.5 },
            ]}>
            <View
              style={[
                styles.letter,
                state === 'right' && { backgroundColor: Colors.success },
                state === 'wrong' && { backgroundColor: Colors.danger },
              ]}>
              {state === 'right' || state === 'wrong' ? (
                <Ionicons name={state === 'right' ? 'checkmark' : 'close'} size={14} color="#fff" />
              ) : (
                <Text variant="label">{String.fromCharCode(65 + i)}</Text>
              )}
            </View>
            <Text style={{ flex: 1 }}>{o}</Text>
          </Pressable>
        );
      })}
      {picked !== null && <Feedback ok={picked === correctIndex} text={feedback} />}
    </View>
  );
}

function Fill({ item, onDone }: { item: Extract<Interaction, { kind: 'fill' }>; onDone: Props['onDone'] }) {
  const [picked, setPicked] = useState<number | null>(null);
  const ok = picked === item.correctIndex;
  return (
    <View style={{ gap: Spacing.md }}>
      <View style={styles.sentence}>
        <Text style={styles.sentenceText}>
          {item.before}{' '}
          <Text
            style={[
              styles.sentenceText,
              styles.blank,
              picked !== null && {
                color: ok ? Colors.success : Colors.danger,
                borderBottomColor: ok ? Colors.success : Colors.danger,
              },
            ]}>
            {picked === null ? '        ' : item.options[picked]}
          </Text>{' '}
          {item.after}
        </Text>
      </View>
      <View style={styles.chips}>
        {item.options.map((o, i) => (
          <Pressable
            key={o}
            disabled={picked !== null}
            onPress={() => {
              setPicked(i);
              buzz(i === item.correctIndex);
              onDone(i === item.correctIndex);
            }}
            accessibilityRole="button"
            accessibilityLabel={o}
            style={[
              styles.chip,
              picked !== null && i === item.correctIndex && styles.right,
              picked === i && !ok && styles.wrong,
              picked !== null && i !== picked && i !== item.correctIndex && { opacity: 0.4 },
            ]}>
            <Text style={{ fontFamily: Fonts.semibold }}>{o}</Text>
          </Pressable>
        ))}
      </View>
      {picked !== null && <Feedback ok={ok} text={item.feedback} />}
    </View>
  );
}

function Order({
  item,
  seed,
  onDone,
}: {
  item: Extract<Interaction, { kind: 'order' }>;
  seed: string;
  onDone: Props['onDone'];
}) {
  const { t } = useTranslation('courses');
  const pool = useMemo(() => shuffle(item.items, seed), [item.items, seed]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [tries, setTries] = useState(0);
  const [finished, setFinished] = useState(false);
  const [firstOk, setFirstOk] = useState(false);
  const full = placed.length === item.items.length;

  const check = () => {
    const ok = placed.every((x, i) => x === item.items[i]);
    setChecked(ok);
    setTries((t) => t + 1);
    buzz(ok);
    if (ok) {
      setFinished(true);
      setFirstOk(tries === 0);
      onDone(tries === 0);
    }
  };
  const showAnswer = () => {
    setPlaced(item.items);
    setChecked(true);
    setFinished(true);
    onDone(false);
  };

  return (
    <View style={{ gap: Spacing.md }}>
      <View style={styles.slots}>
        {item.items.map((_, i) => {
          const v = placed[i];
          const wrong = checked === false && v !== undefined && v !== item.items[i];
          const right = checked !== null && v === item.items[i];
          return (
            <Pressable
              key={i}
              disabled={!v || finished}
              onPress={() => {
                setChecked(null);
                setPlaced((p) => p.filter((x) => x !== v));
              }}
              accessibilityRole="button"
              accessibilityLabel={
                v
                  ? t('interaction.position', { number: i + 1, item: v })
                  : t('interaction.positionEmpty', { number: i + 1 })
              }
              style={[styles.slot, v && styles.slotFilled, right && styles.right, wrong && styles.wrong]}>
              <Text variant="label" color={Colors.textMuted} style={{ width: 18 }}>
                {i + 1}
              </Text>
              <Text style={{ flex: 1 }} color={v ? Colors.text : Colors.textMuted}>
                {v ?? t('interaction.tapItem')}
              </Text>
              {v && !finished && <Ionicons name="close" size={16} color={Colors.textMuted} />}
            </Pressable>
          );
        })}
      </View>
      {!finished && (
        <View style={styles.chips}>
          {pool
            .filter((x) => !placed.includes(x))
            .map((x) => (
              <Animated.View key={x} entering={ZoomIn.duration(180)}>
                <Pressable
                  onPress={() => {
                    setChecked(null);
                    setPlaced((p) => [...p, x]);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t('interaction.place', { item: x })}
                  style={styles.chip}>
                  <Text style={{ fontFamily: Fonts.semibold }}>{x}</Text>
                </Pressable>
              </Animated.View>
            ))}
        </View>
      )}
      {!finished && full && <Button title={t('interaction.checkOrder')} icon="checkmark" onPress={check} />}
      {checked === false && !finished && (
        <View style={{ gap: Spacing.xs }}>
          <Text variant="small" color={Colors.danger} center>
            {t('interaction.wrongPlace')}
          </Text>
          {tries >= 2 && <Button variant="ghost" title={t('interaction.showAnswer')} onPress={showAnswer} />}
        </View>
      )}
      {finished && <Feedback ok={firstOk} partial text={item.feedback} />}
    </View>
  );
}

function Match({
  item,
  seed,
  onDone,
}: {
  item: Extract<Interaction, { kind: 'match' }>;
  seed: string;
  onDone: Props['onDone'];
}) {
  const { t } = useTranslation('courses');
  const rights = useMemo(
    () =>
      shuffle(
        item.pairs.map((p) => p[1]),
        seed,
      ),
    [item.pairs, seed],
  );
  const [left, setLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [miss, setMiss] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const finished = matched.length === item.pairs.length;

  const tryPair = (right: string) => {
    if (!left) return;
    const ok = item.pairs.some(([l, r]) => l === left && r === right);
    buzz(ok);
    if (ok) {
      const next = [...matched, left];
      setMatched(next);
      setLeft(null);
      setMiss(null);
      if (next.length === item.pairs.length) onDone(mistakes === 0);
    } else {
      setMistakes((m) => m + 1);
      setMiss(right);
    }
  };
  const isMatchedRight = (r: string) => item.pairs.some(([l, rr]) => rr === r && matched.includes(l));

  return (
    <View style={{ gap: Spacing.md }}>
      <Text variant="small" color={Colors.textSecondary}>
        {t('interaction.matchHint')}
      </Text>
      <View style={styles.match}>
        <View style={styles.col}>
          {item.pairs.map(([l]) => {
            const done = matched.includes(l);
            return (
              <Pressable
                key={l}
                disabled={done}
                onPress={() => (setLeft(l), setMiss(null))}
                accessibilityRole="button"
                accessibilityState={{ selected: left === l, disabled: done }}
                accessibilityLabel={l}
                style={[styles.card, left === l && styles.cardOn, done && styles.right]}>
                <Text variant="small" style={{ fontFamily: Fonts.bold }}>
                  {l}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.col}>
          {rights.map((r) => {
            const done = isMatchedRight(r);
            return (
              <Pressable
                key={r}
                disabled={done || !left}
                onPress={() => tryPair(r)}
                accessibilityRole="button"
                accessibilityLabel={r}
                style={[styles.card, done && styles.right, miss === r && styles.wrong]}>
                <Text variant="small">{r}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      {finished && (
        <Feedback
          ok={mistakes === 0}
          partial
          text={
            mistakes ? t('interaction.wrongPairings', { count: mistakes, feedback: item.feedback }) : item.feedback
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  think: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.rewardSoft,
  },
  answer: {
    gap: 4,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.successSoft,
    borderWidth: 1,
    borderColor: Colors.success + '55',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  letter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: { borderColor: Colors.success, backgroundColor: Colors.successSoft },
  wrong: { borderColor: Colors.danger, backgroundColor: Colors.dangerSoft },
  feedback: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
  sentence: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sentenceText: { fontSize: 20, lineHeight: 34, fontFamily: Fonts.semibold, color: Colors.text },
  blank: {
    color: Colors.primary,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    textDecorationLine: 'underline',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
  },
  slots: { gap: Spacing.xs },
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: 50,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.borderStrong,
  },
  slotFilled: { borderStyle: 'solid', backgroundColor: Colors.surface },
  match: { flexDirection: 'row', gap: Spacing.sm },
  col: { flex: 1, gap: Spacing.xs },
  card: {
    minHeight: 64,
    justifyContent: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cardOn: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
});
