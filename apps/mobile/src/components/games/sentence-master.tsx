import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { GameOutcome, SentenceMasterRun } from '@/lib/api';
import { useKeys } from '@/lib/games/english';

import { GameShell, useGame, type Game } from './shell';
import { column, Feedback, Key, ltrRow, PrimaryButton, SecondaryButton, Stat, StatusRow, W } from './ui';

/** Sentence Master: put the words in order to build a correct sentence (one word is a trap). */
export function SentenceMaster({ level }: { level: number }) {
  const g = useGame<SentenceMasterRun>('sentence-master', level);
  return (
    <GameShell g={g} step={{ n: (g.run?.at ?? 0) + 1, total: g.run?.steps.length ?? 8 }}>
      {(run) => <Board key={run.id} g={g} run={run} />}
    </GameShell>
  );
}

function Board({ g, run }: { g: Game<SentenceMasterRun>; run: SentenceMasterRun }) {
  const { t } = useTranslation('games');
  const [i, setI] = useState(0);
  const step = run.steps[Math.min(i, run.steps.length - 1)]!;
  /** Chip indexes in the order they were placed. */
  const [placed, setPlaced] = useState<number[]>([]);
  /** How many of the first words came from hints (can't be removed). */
  const [locked, setLocked] = useState(0);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [done, setDone] = useState(false);
  const answered = !!outcome;
  const right = run.steps.filter((s) => s.result?.correct).length;
  const last = i >= run.steps.length - 1;
  const keyboard = Platform.OS === 'web';

  const check = async () => {
    if (answered || g.busy || placed.length !== step.slots) return;
    const res = await g.answer({ step: step.id, words: placed.map((k) => step.chips[k]!) });
    if (!res) return;
    setOutcome(res.outcome);
    setDone(res.done);
    g.buzz(res.outcome.correct ? 'success' : 'error');
  };
  const next = () => {
    if (done || last) {
      void g.finish();
      return;
    }
    setI(i + 1);
    setPlaced([]);
    setLocked(0);
    setOutcome(null);
  };
  const hint = async () => {
    const h = await g.hint(step.id);
    if (!h?.word) return;
    // Hints reveal the sentence from the start: keep the words already revealed, clear the rest.
    const keep = placed.slice(0, locked);
    const used = new Set(keep);
    const chip = step.chips.findIndex((w, k) => w === h.word && !used.has(k));
    if (chip < 0) return;
    setPlaced([...keep, chip]);
    setLocked(h.index + 1);
  };
  const add = (k: number) => {
    if (answered || placed.includes(k) || placed.length >= step.slots) return;
    g.buzz('tap');
    setPlaced([...placed, k]);
  };
  const removeLast = () => {
    if (!answered && placed.length > locked) setPlaced(placed.slice(0, -1));
  };

  useKeys(
    (key) => {
      if (answered) {
        if (key === 'Enter') next();
        return;
      }
      if (key === 'Enter') void check();
      else if (key === 'Backspace') removeLast();
      else if (/^[1-9]$/.test(key)) add(Number(key) - 1);
    },
    !g.paused,
  );

  const topic = t(`sentence.topics.${run.topic}`, { defaultValue: run.topic });

  return (
    <View style={{ flex: 1 }}>
      <StatusRow>
        <Stat text={t('sentence.of', { n: Math.min(i + 1, run.steps.length), total: run.steps.length })} />
        <Stat icon="checkmark-done" text={`${right}/${run.steps.length}`} label={t('sentence.progressA11y', { count: right, total: run.steps.length })} />
      </StatusRow>
      <ScrollView contentContainerStyle={[column, styles.body]} showsVerticalScrollIndicator={false}>
        <View style={styles.topic}>
          <Text style={styles.eyebrow}>{t('sentence.grammar', { topic }).toUpperCase()}</Text>
          <Text style={styles.tip}>{t(`sentence.tips.${run.topic}`, { defaultValue: '' })}</Text>
        </View>

        <Animated.View
          key={step.id}
          entering={FadeIn.duration(180)}
          style={[
            styles.track,
            outcome && { borderColor: outcome.correct ? W.correct : W.wrong, borderWidth: 2 },
          ]}
          accessibilityLabel={placed.length ? placed.map((k) => step.chips[k]).join(' ') : t('sentence.placeholder')}>
          {placed.length ? (
            <View style={[styles.trackWords, ltrRow()]}>
              {placed.map((k, j) => (
                <Pressable
                  key={`${k}-${j}`}
                  disabled={answered || j < locked}
                  onPress={() => setPlaced(placed.filter((_, x) => x !== j))}
                  accessibilityRole="button"
                  accessibilityLabel={t('sentence.placedA11y', { word: step.chips[k] })}
                  hitSlop={4}>
                  <Text style={[styles.trackWord, j < locked && { color: W.focus }]}>
                    {step.chips[k]}
                    {j === placed.length - 1 && placed.length === step.slots ? step.end : ''}
                  </Text>
                </Pressable>
              ))}
              {!answered && placed.length < step.slots && <View style={styles.caret} />}
            </View>
          ) : (
            <Text style={styles.placeholder}>{t('sentence.placeholder')}</Text>
          )}
        </Animated.View>

        <View style={{ minHeight: 64 }}>
          {outcome &&
            (outcome.correct ? (
              <Feedback tone="good" title={t('sentence.correct')} detail={t('ui.points', { count: outcome.points })} />
            ) : (
              <Feedback tone="bad" title={t('sentence.wrong')} detail={outcome.sentence} />
            ))}
        </View>

        <View style={[styles.chips, ltrRow()]}>
          {step.chips.map((w, k) => {
            const used = placed.includes(k);
            return (
              <Pressable
                key={k}
                disabled={answered || used || placed.length >= step.slots}
                onPress={() => add(k)}
                accessibilityRole="button"
                accessibilityLabel={t('sentence.chipA11y', { word: w })}
                accessibilityState={{ disabled: answered || used }}
                style={({ pressed }) => [styles.chip, used && styles.chipUsed, pressed && { backgroundColor: W.keyPressed }]}>
                {keyboard && k < 9 && <Text style={styles.chipKey}>{k + 1}</Text>}
                <Text style={[styles.chipText, used && { color: 'transparent' }]}>{w}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {answered ? (
          <PrimaryButton title={done || last ? t('clash.results') : t('ui.next')} icon="arrow-forward" onPress={next} busy={g.busy} />
        ) : (
          <View style={styles.actions}>
            <SecondaryButton
              title={t('ui.hintCost', { cost: run.hintCost })}
              icon="bulb-outline"
              onPress={hint}
              accessibilityLabel={t('ui.hintA11y', { cost: run.hintCost })}
              style={{ paddingHorizontal: 16 }}
            />
            <Key icon="backspace-outline" onPress={removeLast} width={56} height={52} accessibilityLabel={t('ui.delete')} disabled={placed.length <= locked} />
            <PrimaryButton
              title={t('ui.check')}
              onPress={() => void check()}
              disabled={placed.length !== step.slots}
              busy={g.busy}
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
  topic: { gap: 4 },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  tip: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: W.inkSoft },
  track: {
    minHeight: 112,
    borderRadius: 14,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
  },
  trackWords: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 8, rowGap: 6, alignItems: 'center' },
  trackWord: { fontFamily: Fonts.bold, fontSize: 22, lineHeight: 30, color: W.ink },
  caret: { width: 2, height: 26, backgroundColor: W.focus },
  placeholder: { fontFamily: Fonts.regular, fontSize: 16, color: W.muted, textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: W.key,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipUsed: { backgroundColor: 'transparent', borderWidth: 1.5, borderStyle: 'dashed', borderColor: W.lineStrong },
  chipKey: { position: 'absolute', top: 2, left: 5, fontFamily: Fonts.bold, fontSize: 9, color: W.muted },
  chipText: { fontFamily: Fonts.bold, fontSize: 18, color: W.ink },
  footer: { ...column, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
});
