import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { GameOutcome, HiddenLettersRun } from '@/lib/api';
import { useKeys } from '@/lib/games/english';

import { GameShell, useGame, type Game } from './shell';
import {
  ClueCard,
  column,
  Feedback,
  HeartsStat,
  Key,
  LetterTile,
  ltrRow,
  PrimaryButton,
  SecondaryButton,
  Stat,
  StatusRow,
  TimerStat,
  useCountdown,
} from './ui';

/** Hidden Letters: fill the gaps in a word from its clue. */
export function HiddenLetters({ level }: { level: number }) {
  const g = useGame<HiddenLettersRun>('hidden-letters', level);
  return (
    <GameShell g={g} step={{ n: (g.run?.at ?? 0) + 1, total: g.run?.steps.length ?? 8 }}>
      {(run) => <Board key={run.id} g={g} run={run} />}
    </GameShell>
  );
}

function Board({ g, run }: { g: Game<HiddenLettersRun>; run: HiddenLettersRun }) {
  const { t } = useTranslation('games');
  const { width } = useWindowDimensions();
  const [i, setI] = useState(0);
  const [filled, setFilled] = useState<Record<number, string>>({});
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [done, setDone] = useState(false);
  const step = run.steps[Math.min(i, run.steps.length - 1)]!;
  const open = step.tiles.map((ch, k) => (ch === null ? k : -1)).filter((k) => k >= 0);
  const full = open.every((k) => filled[k]);
  const answered = !!outcome;
  const [stepStart, setStepStart] = useState(() => Date.now());
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const nextBlank = open.find((k) => !filled[k]);

  const advance = (finished: boolean) => {
    if (finished) {
      void g.finish();
      return;
    }
    setOutcome(null);
    setFilled({});
    setI((n) => n + 1);
    setStepStart(Date.now());
  };

  const submit = async (timeout = false) => {
    if (answered || g.busy) return;
    const res = await g.answer({
      step: step.id,
      ...(timeout ? { timeout: true } : { letters: open.map((k) => filled[k] ?? '') }),
      ms: Date.now() - stepStart,
    });
    if (!res) return;
    setOutcome(res.outcome);
    setDone(res.done);
    g.buzz(res.outcome.correct ? 'success' : 'error');
    if (!res.outcome.correct)
      shake.set(
        withSequence(
          withTiming(-8, { duration: 50 }),
          withTiming(8, { duration: 50 }),
          withTiming(-4, { duration: 50 }),
          withTiming(0, { duration: 50 }),
        ),
      );
    // Right answers move on by themselves; after a wrong one, the learner reads the word and continues.
    else setTimeout(() => advance(res.done), 1100);
  };

  const left = useCountdown(
    step.seconds,
    !g.relaxed && !answered && !g.paused && run.status === 'playing',
    () => void submit(true),
    i,
  );

  const place = (letter: string) => {
    if (answered || nextBlank === undefined) return;
    g.buzz('tap');
    setFilled({ ...filled, [nextBlank]: letter });
  };
  const removeLast = () => {
    if (answered) return;
    const last = [...open].reverse().find((k) => filled[k]);
    if (last === undefined) return;
    const next = { ...filled };
    delete next[last];
    setFilled(next);
  };
  const hint = async () => {
    const h = await g.hint(step.id);
    if (h) {
      const next = { ...filled };
      delete next[h.index];
      setFilled(next);
    }
  };

  useKeys(
    (key) => {
      if (answered) {
        if (key === 'Enter' && !outcome?.correct) advance(done);
        return;
      }
      if (key === 'Enter') {
        if (full) void submit();
      } else if (key === 'Backspace') removeLast();
      else if (step.choices.includes(key)) place(key);
    },
    !g.paused,
  );

  // Tiles shrink to fit long words on one line, then wrap.
  const avail = Math.min(width, 520) - 32;
  // One row when the word fits at a readable size, else two.
  const oneRow = Math.floor((avail - (step.length - 1) * 6) / step.length) >= 36;
  const perRow = oneRow ? step.length : Math.ceil(step.length / 2);
  const size = Math.max(34, Math.min(58, Math.floor((avail - (perRow - 1) * 6) / perRow)));
  const cols = step.choices.length > 8 ? 6 : 4;
  const keyW = Math.min(76, Math.floor((avail - (cols - 1) * 8) / cols));
  const stateOf = (k: number) => {
    const isOpen = open.includes(k);
    if (outcome) return outcome.correct ? 'correct' : isOpen ? 'wrong' : 'given';
    if (!isOpen) return 'given';
    if (filled[k]) return 'filled';
    return k === nextBlank ? 'active' : 'empty';
  };
  const letterAt = (k: number) => (outcome && !outcome.correct ? outcome.word?.[k] : (step.tiles[k] ?? filled[k]));

  return (
    <View style={{ flex: 1 }}>
      <StatusRow>
        <Stat text={t('ui.wordOf', { n: Math.min(i + 1, run.steps.length), total: run.steps.length })} />
        <HeartsStat left={run.hearts} />
        <Stat
          icon="flame-outline"
          text={t('hidden.streak', { count: run.streak })}
          label={t('hidden.streakA11y', { count: run.streak })}
          tone={run.streak > 1 ? 'good' : 'plain'}
        />
        <TimerStat seconds={left} relaxed={g.relaxed} />
      </StatusRow>
      <ScrollView contentContainerStyle={[column, styles.body]} showsVerticalScrollIndicator={false}>
        <Animated.View key={step.id} entering={FadeIn.duration(180)} style={{ gap: 20 }}>
          <ClueCard label={t('hidden.clue')} text={step.clue} />
          <Animated.View style={[styles.word, ltrRow(), shakeStyle]}>
            {step.tiles.map((_, k) => {
              const ch = letterAt(k);
              const isOpen = open.includes(k);
              return (
                <LetterTile
                  key={k}
                  size={size}
                  state={stateOf(k)}
                  letter={ch ?? undefined}
                  onPress={
                    isOpen && filled[k] && !answered
                      ? () => setFilled(Object.fromEntries(Object.entries(filled).filter(([x]) => Number(x) !== k)))
                      : undefined
                  }
                  label={
                    ch ? (isOpen && !answered ? t('hidden.filledA11y', { letter: ch }) : ch) : t('hidden.blankA11y', { n: open.indexOf(k) + 1 })
                  }
                />
              );
            })}
          </Animated.View>
        </Animated.View>

        <View style={{ minHeight: 64 }}>
          {outcome &&
            (outcome.correct ? (
              <Feedback tone="good" title={t('ui.correct')} detail={t('ui.points', { count: outcome.points })} />
            ) : (
              <Feedback tone="bad" title={t('ui.wrong')} detail={t('hidden.wrong', { word: outcome.word })} />
            ))}
        </View>

        <View style={[styles.keys, ltrRow()]}>
          {step.choices.map((ch) => (
            <Key
              key={ch}
              label={ch}
              width={keyW}
              onPress={() => place(ch)}
              disabled={answered || nextBlank === undefined}
              accessibilityLabel={t('hidden.letterA11y', { letter: ch })}
            />
          ))}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {answered && !outcome?.correct ? (
          <PrimaryButton title={done ? t('clash.results') : t('ui.next')} icon="arrow-forward" onPress={() => advance(done)} />
        ) : (
          <View style={styles.actions}>
            <SecondaryButton
              title={t('ui.hintCost', { cost: run.hintCost })}
              icon="bulb-outline"
              onPress={hint}
              disabled={answered || open.length === 0}
              accessibilityLabel={t('ui.hintA11y', { cost: run.hintCost })}
              style={{ paddingHorizontal: 16 }}
            />
            <Key icon="backspace-outline" onPress={removeLast} width={56} height={52} accessibilityLabel={t('ui.delete')} disabled={answered} />
            <PrimaryButton
              title={t('ui.check')}
              onPress={() => void submit()}
              disabled={!full || answered}
              busy={g.busy && !answered}
              style={{ flex: 1 }}
            />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, gap: 16, paddingBottom: 32 },
  word: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, paddingVertical: 4 },
  keys: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  footer: { ...column, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
});
