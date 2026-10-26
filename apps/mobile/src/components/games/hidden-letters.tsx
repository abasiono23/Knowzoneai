import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { GameOutcome, HiddenLettersRun } from '@/lib/api';

import { GameShell, useGame, type Game } from './shell';
import {
  CoinPill,
  FONT,
  GlossyTile,
  GradientButton,
  HeartsRow,
  KoraBubble,
  PointsPop,
  SoftButton,
  TimerRing,
  TopBar,
  useCountdown,
} from './ui';

/** Hidden Letters: fill the gaps in a word from its clue before the ring runs out. */
export function HiddenLetters({ level }: { level: number }) {
  const g = useGame<HiddenLettersRun>('hidden-letters', level);
  return (
    <GameShell g={g} step={{ n: (g.run?.at ?? 0) + 1, total: g.run?.steps.length ?? 8 }}>
      {(run) => <Board key={run.id} g={g} run={run} />}
    </GameShell>
  );
}

function Board({ g, run }: { g: Game<HiddenLettersRun>; run: HiddenLettersRun }) {
  const [i, setI] = useState(0);
  const [filled, setFilled] = useState<Record<number, string>>({});
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const { t } = useTranslation('games');
  const { width } = useWindowDimensions();
  const step = run.steps[Math.min(i, run.steps.length - 1)]!;
  const open = step.tiles.map((ch, k) => (ch === null ? k : -1)).filter((k) => k >= 0);
  const full = open.every((k) => filled[k]);
  const answered = !!outcome;
  const [started] = useState(() => Date.now());
  const [stepStart, setStepStart] = useState(started);
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const submit = async (timeout = false) => {
    if (answered || g.busy) return;
    const res = await g.answer({
      step: step.id,
      ...(timeout ? { timeout: true } : { letters: open.map((k) => filled[k] ?? '') }),
      ms: Date.now() - stepStart,
    });
    if (!res) return;
    setOutcome(res.outcome);
    g.buzz(res.outcome.correct ? 'success' : 'error');
    if (!res.outcome.correct)
      shake.set(
        withSequence(
          withTiming(-12, { duration: 50 }),
          withTiming(12, { duration: 50 }),
          withTiming(-6, { duration: 50 }),
          withTiming(0, { duration: 50 }),
        ),
      );
    setTimeout(
      () => {
        if (res.done) {
          void g.finish();
          return;
        }
        setOutcome(null);
        setFilled({});
        setI(i + 1);
        setStepStart(Date.now());
      },
      res.outcome.correct ? 1300 : 2200,
    );
  };

  const left = useCountdown(
    step.seconds,
    !answered && !g.paused && run.status === 'playing',
    () => void submit(true),
    i,
  );

  const place = (letter: string) => {
    if (answered) return;
    const k = open.find((x) => !filled[x]);
    if (k === undefined) return;
    g.buzz('tap');
    setFilled({ ...filled, [k]: letter });
  };
  const hint = async () => {
    const h = await g.hint(step.id);
    if (h) {
      const next = { ...filled };
      delete next[h.index];
      setFilled(next);
    }
  };

  // Tiles shrink to fit long words on one or two rows.
  const avail = Math.min(width, 560) - Spacing.md * 2;
  const perRow = step.length <= 7 ? step.length : Math.ceil(step.length / 2);
  const size = Math.max(40, Math.min(66, Math.floor((avail - (perRow - 1) * 8) / perRow)));
  const tone = (k: number) => (outcome ? (outcome.correct ? 'teal' : open.includes(k) ? 'red' : 'violet') : 'violet');
  const letterAt = (k: number) => (outcome && !outcome.correct ? outcome.word?.[k] : (step.tiles[k] ?? filled[k]));

  return (
    <View style={{ flex: 1 }}>
      <TopBar
        onPause={() => g.setPaused(true)}
        label={t('ui.level', { game: t('english.hidden-letters.name').toUpperCase(), level: run.level })}
        right={<CoinPill />}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.statusRow}>
          <HeartsRow left={run.hearts} size={20} />
          <TimerRing seconds={left} total={step.seconds} size={100} />
          <View style={styles.streak} accessibilityLabel={t('hidden.streakA11y', { count: run.streak })}>
            <Ionicons name="flame" size={26} color={run.streak > 0 ? '#FF9F43' : 'rgba(255,255,255,0.25)'} />
            <Text
              style={{ fontFamily: FONT, fontSize: 16, color: run.streak > 0 ? '#FFC857' : 'rgba(255,255,255,0.35)' }}>
              {t('hidden.streak', { count: run.streak })}
            </Text>
          </View>
        </View>

        <Animated.View key={step.id} entering={FadeInDown} style={[styles.word, shakeStyle]}>
          {step.tiles.map((_, k) => {
            const ch = letterAt(k);
            const isOpen = open.includes(k);
            return (
              <GlossyTile
                key={k}
                size={size}
                tone={ch ? tone(k) : 'empty'}
                letter={ch ?? undefined}
                onPress={
                  isOpen && filled[k] && !answered
                    ? () => setFilled(Object.fromEntries(Object.entries(filled).filter(([x]) => Number(x) !== k)))
                    : undefined
                }
                accessibilityLabel={
                  ch ? t('hidden.filledA11y', { letter: ch }) : t('hidden.blankA11y', { n: open.indexOf(k) + 1 })
                }
              />
            );
          })}
        </Animated.View>
        <View style={{ height: 40, alignItems: 'center', justifyContent: 'center' }}>
          {outcome?.correct ? (
            <PointsPop value={t('ui.points', { count: outcome.points })} />
          ) : outcome ? (
            <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 16, color: '#FF8FA6' }}>
              {t('hidden.wrong', { word: outcome.word })}
            </Text>
          ) : null}
        </View>

        <LinearGradient colors={['#B7A3FF', '#8F72F7']} style={styles.clue}>
          <Text style={styles.clueText}>{step.clue}</Text>
        </LinearGradient>

        <View style={styles.choicesRow}>
          <View style={styles.choices}>
            {step.choices.map((ch) => (
              <GlossyTile
                key={ch}
                letter={ch}
                size={64}
                onPress={() => place(ch)}
                accessibilityLabel={t('hidden.letterA11y', { letter: ch })}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <KoraBubble
          text={outcome?.correct ? t('hidden.correct') : !outcome && open.length ? t('ui.hint') : undefined}
          size={96}
          style={styles.kora}
        />
        <View style={styles.actions}>
          <SoftButton
            icon="bulb"
            onPress={hint}
            disabled={answered || open.length === 0}
            accessibilityLabel={t('ui.hintA11y', { cost: run.hintCost })}
            trailing={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontFamily: FONT, fontSize: 18, color: '#fff' }}>{run.hintCost}</Text>
                <View style={styles.coin}>
                  <Text style={{ fontFamily: FONT, fontSize: 10, color: '#7A4B00' }}>K</Text>
                </View>
              </View>
            }
          />
          <GradientButton
            title={t('ui.check')}
            onPress={() => void submit()}
            disabled={!full || answered}
            busy={g.busy && !answered}
            style={{ flex: 1 }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: Spacing.md, gap: Spacing.md, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 140 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streak: { width: 72, alignItems: 'center', gap: 2 },
  word: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  clue: { borderRadius: 24, paddingVertical: Spacing.lg, paddingHorizontal: Spacing.md, alignItems: 'center' },
  clueText: { fontFamily: FONT, fontSize: 20, lineHeight: 28, color: '#1E145A', textAlign: 'center' },
  choicesRow: { alignItems: 'flex-start' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: 4 * 64 + 3 * 12 },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  kora: { position: 'absolute', right: Spacing.sm, bottom: 72 },
  actions: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  coin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.reward,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
