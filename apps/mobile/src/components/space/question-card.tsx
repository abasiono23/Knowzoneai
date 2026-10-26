import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { BOLD, Choice, GoldButton, Panel } from '@/components/lab/hud';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { GameOutcome } from '@/lib/api';

/** Counts down from `seconds` while `running`; calls `onEnd` once at zero. */
function useCountdown(seconds: number | undefined, running: boolean, onEnd: () => void) {
  const [left, setLeft] = useState(seconds ?? 0);
  const onEndRef = useRef(onEnd);
  useEffect(() => {
    onEndRef.current = onEnd;
  });
  useEffect(() => {
    if (!seconds || !running) return;
    const started = Date.now();
    const id = setInterval(() => {
      const remaining = Math.max(0, seconds - (Date.now() - started) / 1000);
      setLeft(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        onEndRef.current();
      }
    }, 100);
    return () => clearInterval(id);
  }, [seconds, running]);
  return left;
}

/**
 * A multiple-choice card for the space games: tap an answer (checked on the server), see if it was
 * right, then go on. With `seconds`, a bar runs down and time-out counts as wrong.
 */
export function QuestionCard({
  label,
  q,
  options,
  seconds,
  onAnswer,
  onNext,
  nextLabel,
  rightText,
  extra,
}: {
  /** Small heading ("PHYSICS CHALLENGE", "Question 1 of 2"). */
  label?: string;
  q: string;
  options: string[];
  seconds?: number;
  /** Sends the choice (or a time-out) to the server. */
  onAnswer: (choice: string | null) => Promise<GameOutcome | null>;
  onNext: (outcome: GameOutcome) => void;
  nextLabel?: string;
  /** What to say when it's right (defaults to "Correct! +points"). */
  rightText?: (o: GameOutcome) => string;
  /** Shown under the result (an upgrade choice…); replaces the Next button when given. */
  extra?: (o: GameOutcome) => React.ReactNode;
}) {
  const { t } = useTranslation('space');
  const [picked, setPicked] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [sending, setSending] = useState(false);

  const send = async (choice: string | null) => {
    if (sending || outcome) return;
    setPicked(choice);
    setSending(true);
    const o = await onAnswer(choice);
    setSending(false);
    if (o) setOutcome(o);
    else setPicked(null);
  };
  const left = useCountdown(seconds, !outcome && !sending, () => void send(null));
  const answer = String(outcome?.answer ?? '');

  return (
    <Animated.View entering={FadeInUp.springify()}>
      <Panel style={{ gap: Spacing.sm, borderColor: 'rgba(124,92,255,0.6)' }}>
        {!!label && (
          <Text style={{ fontFamily: BOLD, fontSize: 12, color: Colors.reward, letterSpacing: 1 }}>{label}</Text>
        )}
        <Text style={{ fontFamily: BOLD, fontSize: 18, color: '#fff', lineHeight: 24 }}>{q}</Text>
        {!!seconds && !outcome && (
          <View style={styles.track} accessibilityLabel={t('ui.timeLeft', { count: Math.ceil(left) })}>
            <View
              style={[
                styles.fill,
                {
                  width: `${(left / seconds) * 100}%`,
                  backgroundColor: left < seconds * 0.3 ? Colors.danger : Colors.reward,
                },
              ]}
            />
          </View>
        )}
        <View style={styles.options}>
          {options.map((o) => (
            <View key={o} style={styles.option}>
              <Choice
                label={o}
                disabled={!!outcome || sending}
                onPress={() => void send(o)}
                state={
                  outcome
                    ? o === answer
                      ? 'right'
                      : o === picked
                        ? 'wrong'
                        : 'idle'
                    : o === picked
                      ? 'selected'
                      : 'idle'
                }
              />
            </View>
          ))}
        </View>
        {outcome && (
          <Animated.View entering={FadeInDown} style={{ gap: Spacing.sm }}>
            <Text style={{ fontFamily: BOLD, fontSize: 16, color: outcome.correct ? Colors.success : '#FF8FA6' }}>
              {outcome.correct
                ? (rightText?.(outcome) ?? t('ui.right', { points: outcome.points }))
                : picked
                  ? t('ui.wrong', { answer })
                  : t('ui.timeUp', { answer })}
            </Text>
            {extra ? (
              extra(outcome)
            ) : (
              <GoldButton title={nextLabel ?? t('ui.next')} icon="arrow-forward" onPress={() => onNext(outcome)} />
            )}
          </Animated.View>
        )}
      </Panel>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { flexGrow: 1, flexBasis: '45%' },
});
