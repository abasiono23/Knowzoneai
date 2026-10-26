import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { GameOutcome, SentenceMasterRun } from '@/lib/api';

import { GameShell, useGame, type Game } from './shell';
import { CoinPill, FONT, GradientButton, KoraBubble, PointsPop, SoftButton, TopBar } from './ui';

const CHIP_COLORS = [
  ['#3B82F6', '#2563EB'],
  ['#7C5CFF', '#5B3FE0'],
  ['#14B8A6', '#0E9488'],
  ['#3B82F6', '#4F46E5'],
  ['#8B5CF6', '#6D28D9'],
] as const;

/** Sentence Master: tap the words in order to build a correct sentence (one word is a trap). */
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

  const check = async () => {
    if (answered || g.busy) return;
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

  return (
    <View style={{ flex: 1 }}>
      <TopBar
        onPause={() => g.setPaused(true)}
        label={t('sentence.grammar', { topic: t(`sentence.topics.${run.topic}`) })}
        right={<CoinPill />}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.progressRow}>
          <LinearGradient
            colors={['#B04CFF', '#5B3FE0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progress}
            accessibilityLabel={t('sentence.progressA11y', { count: right, total: run.steps.length })}>
            {[4, 6, 8].map((need) => (
              <Ionicons key={need} name="star" size={30} color={right >= need ? '#FFC857' : 'rgba(30,20,90,0.7)'} />
            ))}
          </LinearGradient>
        </View>

        <Animated.View
          key={step.id}
          entering={FadeInDown}
          style={[styles.track, outcome && { borderColor: outcome.correct ? Colors.success : '#FF7A93' }]}>
          {placed.length ? (
            <View style={styles.trackWords}>
              {placed.map((k, j) => (
                <Pressable
                  key={`${k}-${j}`}
                  disabled={answered || j < locked}
                  onPress={() => setPlaced(placed.filter((_, x) => x !== j))}
                  accessibilityRole="button"
                  accessibilityLabel={t('sentence.placedA11y', { word: step.chips[k] })}>
                  <Text style={[styles.trackWord, j < locked && { color: Colors.reward }]}>
                    {step.chips[k]}
                    {j === placed.length - 1 && placed.length === step.slots ? step.end : ''}
                  </Text>
                </Pressable>
              ))}
              {!answered && placed.length < step.slots && <View style={styles.nextSlot} />}
            </View>
          ) : (
            <Text style={styles.placeholder}>{t('sentence.placeholder')}</Text>
          )}
        </Animated.View>

        {outcome && (
          <Animated.View entering={ZoomIn.springify()} style={{ alignItems: 'center', gap: 4 }}>
            {outcome.correct ? (
              <>
                <Text style={{ fontFamily: FONT, fontSize: 20, color: Colors.success }}>{t('sentence.correct')}</Text>
                <PointsPop value={t('ui.points', { count: outcome.points })} />
              </>
            ) : (
              <View style={styles.answer}>
                <Text style={{ fontFamily: 'Manrope_700Bold', color: '#FF8FA6' }}>{t('sentence.wrong')}</Text>
                <Text style={{ fontFamily: FONT, fontSize: 19, color: '#fff', textAlign: 'center' }}>
                  {outcome.sentence}
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        <View style={styles.chips}>
          {step.chips.map((w, k) => {
            const used = placed.includes(k);
            if (used) return <View key={k} style={[styles.chip, styles.chipUsed, { minWidth: 30 + w.length * 13 }]} />;
            const colors = CHIP_COLORS[k % CHIP_COLORS.length]!;
            return (
              <Pressable
                key={k}
                disabled={answered || placed.length >= step.slots}
                onPress={() => {
                  g.buzz('tap');
                  setPlaced([...placed, k]);
                }}
                accessibilityRole="button"
                accessibilityLabel={t('sentence.chipA11y', { word: w })}
                style={({ pressed }) => [pressed && { transform: [{ scale: 0.95 }] }]}>
                <View style={[styles.chipEdge, { backgroundColor: colors[1] }]}>
                  <LinearGradient colors={colors} style={styles.chip}>
                    <Text style={styles.chipText}>{w}</Text>
                  </LinearGradient>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.tipRow}>
          <KoraBubble text={t(`sentence.tips.${run.topic}`)} size={110} />
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {answered ? (
          <GradientButton
            title={done || last ? t('clash.results') : t('ui.next')}
            icon="arrow-forward"
            onPress={next}
            busy={g.busy}
            colors={['#FF5A9A', '#B04CFF']}
          />
        ) : (
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <SoftButton
              icon="bulb"
              onPress={hint}
              accessibilityLabel={t('ui.hintA11y', { cost: run.hintCost })}
              trailing={<Text style={{ fontFamily: FONT, fontSize: 17, color: '#fff' }}>{run.hintCost}</Text>}
            />
            <GradientButton
              title={t('ui.check')}
              onPress={() => void check()}
              disabled={placed.length !== step.slots}
              busy={g.busy}
              colors={['#FF5A9A', '#B04CFF']}
              style={{ flex: 1 }}
            />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: Spacing.md, gap: Spacing.md, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 120 },
  progressRow: { alignItems: 'center' },
  progress: { flexDirection: 'row', gap: 18, paddingHorizontal: 28, paddingVertical: 10, borderRadius: 999 },
  track: {
    minHeight: 110,
    borderRadius: 28,
    padding: Spacing.md,
    justifyContent: 'center',
    backgroundColor: 'rgba(16,12,60,0.6)',
    borderWidth: 2,
    borderColor: 'rgba(124,92,255,0.5)',
  },
  trackWords: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  trackWord: { fontFamily: FONT, fontSize: 28, color: '#F1EEFF' },
  nextSlot: {
    width: 70,
    height: 36,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(160,140,255,0.6)',
  },
  placeholder: { fontFamily: 'Manrope_700Bold', fontSize: 17, color: 'rgba(235,232,255,0.55)', textAlign: 'center' },
  answer: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 4,
    padding: Spacing.sm,
    borderRadius: 18,
    backgroundColor: 'rgba(255,90,122,0.12)',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  chipEdge: { borderRadius: 18, paddingBottom: 5 },
  chip: { height: 58, borderRadius: 18, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  chipUsed: { borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(160,140,255,0.45)', marginBottom: 5 },
  chipText: { fontFamily: FONT, fontSize: 24, color: '#fff' },
  tipRow: { alignItems: 'flex-end', marginTop: Spacing.sm },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
});
