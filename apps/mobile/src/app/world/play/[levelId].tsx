import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LevelRoute, type LoadedLevel } from '@/components/world/level-route';
import { ConfirmDialog, HintSheet, PauseMenu } from '@/components/world/overlays';
import { AnswerButton, GameHud, Hearts, Kora } from '@/components/world/world-ui';
import { Button, ProgressBar, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing, WorldGradients } from '@/constants/theme';
import { WORLDS } from '@/lib/world/content';
import { DAILY_ID, HEARTS, QUESTION_SECONDS, questionsFor } from '@/lib/world/levels';
import { useWorld } from '@/lib/world/store';
import { KIND_INFO } from '@/lib/world/types';

/** Screen 139: gameplay for missions, boss levels and the daily challenge. `?review=1` replays your mistakes. */
export default function GameplayScreen() {
  return <LevelRoute>{(l) => <Game key={l.id} level={l} />}</LevelRoute>;
}

function Game({ level }: { level: LoadedLevel }) {
  const { t } = useTranslation('world');
  const { review } = useLocalSearchParams<{ review?: string }>();
  const reviewing = review === '1';
  const { recordRun, settings, mistakes: pastMistakes } = useWorld();
  const [round, setRound] = useState(0);
  const questions = useMemo(() => {
    const qs = questionsFor(level, round);
    if (!reviewing) return qs;
    const wrong = new Set(pastMistakes[level.id] ?? []);
    return WORLDS.flatMap((w) => w.questions).filter((q) => wrong.has(q.id));
  }, [level, round, reviewing, pastMistakes]);
  const boss = level.kind === 'boss';
  const daily = level.id === DAILY_ID;
  const timed = settings.timer && !reviewing;

  const [started, setStarted] = useState(reviewing);
  const [i, setI] = useState(0);
  const [hearts, setHearts] = useState(HEARTS);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gain, setGain] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [hints, setHints] = useState({ nudge: false, fifty: false });
  const [hintsUsed, setHintsUsed] = useState(0);
  const [removed, setRemoved] = useState<number[]>([]);
  const [left, setLeft] = useState(QUESTION_SECONDS);
  const [paused, setPaused] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [confirm, setConfirm] = useState<'restart' | 'quit' | null>(null);
  const startedAt = useRef(0);
  const shake = useSharedValue(0);
  const bossStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const q = questions[i];
  const answered = picked !== null;
  const over = hearts <= 0 && !reviewing;
  const buzz = (type: Haptics.NotificationFeedbackType) =>
    settings.haptics && Haptics.notificationAsync(type).catch(() => {});

  const answer = (k: number) => {
    if (answered || !q) return;
    const ok = k === q.correctIndex;
    setPicked(k);
    if (ok) {
      const mult = hints.fifty ? 0.5 : hints.nudge ? 0.75 : 1;
      const speed = timed ? Math.round((left / QUESTION_SECONDS) * 50) : 25;
      const pts = Math.round((100 + speed + Math.min(combo, 5) * 10) * mult);
      setGain(pts);
      setScore((s) => s + pts);
      setCorrect((c) => c + 1);
      setCombo((c) => c + 1);
      buzz(Haptics.NotificationFeedbackType.Success);
      if (boss)
        shake.set(
          withSequence(
            withTiming(-10, { duration: 60 }),
            withTiming(10, { duration: 60 }),
            withTiming(0, { duration: 60 }),
          ),
        );
    } else {
      setGain(0);
      setCombo(0);
      setWrong((w) => [...w, q.id]);
      if (!reviewing) setHearts((h) => h - 1);
      buzz(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Question clock: runs only while a question is live and the game isn't paused.
  const answerRef = useRef(answer);
  useEffect(() => {
    answerRef.current = answer;
  });
  useEffect(() => {
    if (!started || answered || paused || hintOpen || !timed || over) return;
    const timer = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          answerRef.current(-1);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, answered, paused, hintOpen, timed, over, i]);

  useEffect(() => {
    if (started) startedAt.current = Date.now();
  }, [started, round]);

  const finish = (final?: { hearts: number }) => {
    if (reviewing) return router.back();
    const run = recordRun({
      levelId: level.id,
      correct,
      total: questions.length,
      score,
      seconds: Math.round((Date.now() - startedAt.current) / 1000),
      hintsUsed,
      mistakes: wrong,
      failed: (final?.hearts ?? hearts) <= 0,
    });
    router.replace({
      pathname: '/world/results/[levelId]',
      params: {
        levelId: level.id,
        run: run.id,
        fresh: '1',
        unlocked: run.unlockedWorlds.join(','),
        ach: run.newAchievements.join(','),
      },
    });
  };

  const next = () => {
    if (over || i === questions.length - 1) return finish();
    setI(i + 1);
    setPicked(null);
    setHints({ nudge: false, fifty: false });
    setRemoved([]);
    setLeft(QUESTION_SECONDS);
  };

  const restart = () => {
    setConfirm(null);
    setPaused(false);
    setRound((r) => r + 1);
    setI(0);
    setHearts(HEARTS);
    setPicked(null);
    setCorrect(0);
    setScore(0);
    setCombo(0);
    setWrong([]);
    setHints({ nudge: false, fifty: false });
    setHintsUsed(0);
    setRemoved([]);
    setLeft(QUESTION_SECONDS);
  };

  const colors = daily ? Gradients.reward : WorldGradients[level.worldId];

  if (!started) {
    const info = KIND_INFO[level.kind];
    return (
      <LinearGradient colors={[colors[0], Colors.backgroundDeep]} style={{ flex: 1 }}>
        <SafeAreaView style={styles.introWrap}>
          <ScrollView contentContainerStyle={styles.intro}>
            <Animated.Text entering={ZoomIn.duration(400)} style={styles.bigEmoji}>
              {boss ? level.world.boss.emoji : daily ? '📅' : level.world.emoji}
            </Animated.Text>
            <Text variant="label" color="rgba(255,255,255,0.8)" center>
              {daily
                ? t('play.dailyEyebrow')
                : t('play.eyebrow', {
                    world: level.world.name.toUpperCase(),
                    number: level.number,
                    kind: info.label.toUpperCase(),
                  })}
            </Text>
            <Text variant="display" center>
              {boss ? level.world.boss.name : level.title}
            </Text>
            <Animated.View entering={FadeInDown.delay(200)} style={{ alignSelf: 'stretch' }}>
              <Kora>
                {boss
                  ? t('detail.quote', { text: level.world.boss.taunt })
                  : daily
                    ? t('play.dailyIntro')
                    : level.number === 1
                      ? level.world.story
                      : level.blurb}
              </Kora>
            </Animated.View>
            <View style={styles.rules}>
              {[
                { id: 'questions', icon: 'help-circle' as const, text: t('play.questions', { count: questions.length }) },
                { id: 'hearts', icon: 'heart' as const, text: t('play.hearts', { count: HEARTS }) },
                {
                  id: 'timer',
                  icon: 'time' as const,
                  text: timed ? t('play.secondsEach', { count: QUESTION_SECONDS }) : t('play.noTimer'),
                },
                { id: 'helper', icon: 'bulb' as const, text: t('play.aiHelper') },
              ].map((r) => (
                <View key={r.id} style={styles.rule}>
                  <Ionicons name={r.icon} size={16} color={Colors.reward} />
                  <Text variant="small">{r.text}</Text>
                </View>
              ))}
            </View>
            <Text variant="small" color={Colors.textSecondary} center>
              {t('levels.reward', { xp: level.xp, count: level.coins })}
            </Text>
          </ScrollView>
          <View style={styles.introFooter}>
            <Button title={boss ? t('play.fight') : t('play.start')} icon="play" onPress={() => setStarted(true)} />
            <Button variant="ghost" title={t('actions.notNow', { ns: 'common' })} onPress={() => router.back()} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!q) {
    return (
      <SafeAreaView
        style={[
          styles.introWrap,
          { justifyContent: 'center', padding: Spacing.lg, gap: Spacing.md, backgroundColor: Colors.background },
        ]}>
        <Text variant="title" center>
          {t('play.nothingToReview')}
        </Text>
        <Button title={t('actions.back', { ns: 'common' })} onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const optionState = (k: number) =>
    removed.includes(k)
      ? 'removed'
      : !answered
        ? 'idle'
        : k === q.correctIndex
          ? 'right'
          : k === picked
            ? 'wrong'
            : 'dim';

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <LinearGradient colors={[colors[0] + '66', 'transparent']} style={StyleSheet.absoluteFill} pointerEvents="none" />
      <GameHud
        onPause={() => setPaused(true)}
        progress={(i + (answered ? 1 : 0)) / questions.length}
        right={
          <View style={styles.score} accessibilityLabel={t('play.scoreA11y', { score })}>
            <Ionicons name="trophy" size={14} color={Colors.reward} />
            <Text variant="bodyStrong" style={{ fontSize: 14 }}>
              {score}
            </Text>
          </View>
        }
        left={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            {reviewing ? (
              <Text variant="label" color={Colors.reward}>
                {t('play.practising')}
              </Text>
            ) : (
              <Hearts left={hearts} />
            )}
            {combo >= 2 && (
              <Animated.View key={combo} entering={ZoomIn} style={styles.combo}>
                <Ionicons name="flame" size={13} color="#FF9F43" />
                <Text variant="label" color="#FF9F43">
                  {t('play.comboShort', { count: combo })}
                </Text>
              </Animated.View>
            )}
          </View>
        }
        timer={timed ? left : undefined}
      />

      <ScrollView contentContainerStyle={styles.body}>
        {boss && (
          <View style={styles.boss}>
            <Animated.Text style={[styles.bossEmoji, bossStyle]}>{level.world.boss.emoji}</Animated.Text>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="label" color={Colors.danger}>
                {level.world.boss.name.toUpperCase()}
              </Text>
              <ProgressBar progress={1 - correct / questions.length} height={10} colors={[Colors.danger, '#FF9F43']} />
            </View>
          </View>
        )}
        <Animated.View key={`${round}-${i}`} entering={FadeInRight.duration(260)} style={{ gap: Spacing.md }}>
          <Text variant="label" color={Colors.textMuted}>
            {q.hard
              ? t('play.questionOfTricky', { n: i + 1, total: questions.length })
              : t('play.questionOf', { n: i + 1, total: questions.length })}
          </Text>
          <Text variant="title" style={{ fontSize: 22, lineHeight: 30 }}>
            {q.question}
          </Text>
          {hints.nudge && !answered && (
            <Animated.View entering={FadeIn}>
              <Kora mood="happy">{q.hint}</Kora>
            </Animated.View>
          )}
          <View style={{ gap: Spacing.xs }}>
            {q.options.map((o, k) => (
              <AnswerButton
                key={k}
                label={o}
                index={k}
                state={optionState(k)}
                onPress={() => answer(k)}
                disabled={answered}
              />
            ))}
          </View>
          {answered && (
            <Animated.View
              entering={FadeInDown.duration(250)}
              style={[styles.feedback, picked === q.correctIndex ? styles.good : styles.bad]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text variant="bodyStrong" color={picked === q.correctIndex ? Colors.success : Colors.danger}>
                  {picked === q.correctIndex ? t('play.correct') : picked === -1 ? t('play.timesUp') : t('play.wrong')}
                </Text>
                {gain > 0 && (
                  <Animated.View entering={ZoomIn}>
                    <Text variant="bodyStrong" color={Colors.reward}>
                      {t('play.gain', { count: gain })}
                    </Text>
                  </Animated.View>
                )}
              </View>
              {picked !== q.correctIndex && (
                <Text variant="small">
                  <Trans
                    t={t}
                    i18nKey="play.answer"
                    values={{ answer: q.options[q.correctIndex] }}
                    components={{ b: <Text variant="small" style={{ fontFamily: 'Manrope_700Bold' }} /> }}
                  />
                </Text>
              )}
              <Text variant="small" color={Colors.textSecondary}>
                {q.explanation}
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {answered ? (
          <Button
            title={
              over
                ? t('play.seeResults')
                : i === questions.length - 1
                  ? reviewing
                    ? t('play.donePractising')
                    : t('play.finish')
                  : t('actions.continue', { ns: 'common' })
            }
            icon="arrow-forward"
            onPress={next}
          />
        ) : (
          <Button
            variant="secondary"
            title={hints.nudge || hints.fifty ? t('play.moreHelp') : t('tutorial.askHint')}
            icon="sparkles"
            onPress={() => setHintOpen(true)}
          />
        )}
      </SafeAreaView>

      <HintSheet
        visible={hintOpen}
        question={q}
        used={hints}
        onClose={() => setHintOpen(false)}
        onNudge={() => {
          if (!hints.nudge) setHintsUsed((n) => n + 1);
          setHints((h) => ({ ...h, nudge: true }));
        }}
        onFiftyFifty={() => {
          const wrongOnes = q.options.map((_, k) => k).filter((k) => k !== q.correctIndex);
          setRemoved(wrongOnes.slice(0, 2));
          setHints((h) => ({ ...h, fifty: true }));
          setHintsUsed((n) => n + 1);
          setHintOpen(false);
        }}
      />
      <PauseMenu
        visible={paused && !confirm}
        title={daily ? t('levelPlan.daily.title') : level.title}
        subtitle={t('play.pauseSubtitle', { n: i + 1, total: questions.length, count: score })}
        onResume={() => setPaused(false)}
        onRestart={() => setConfirm('restart')}
        onQuit={() => setConfirm('quit')}
      />
      <ConfirmDialog
        visible={confirm === 'restart'}
        title={t('game.restartTitle')}
        body={t('game.restartBody')}
        confirmLabel={t('game.restart')}
        onConfirm={restart}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        visible={confirm === 'quit'}
        icon="exit-outline"
        destructive
        title={t('game.quitTitle')}
        body={t('game.quitBody')}
        confirmLabel={t('pause.quit')}
        onConfirm={() => {
          setConfirm(null);
          router.back();
        }}
        onCancel={() => setConfirm(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  introWrap: { flex: 1 },
  intro: {
    padding: Spacing.lg,
    gap: Spacing.md,
    alignItems: 'center',
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  bigEmoji: { fontSize: 96, lineHeight: 112, marginTop: Spacing.lg },
  rules: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, justifyContent: 'center' },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  introFooter: { padding: Spacing.md, gap: Spacing.xs, maxWidth: 560, width: '100%', alignSelf: 'center' },
  score: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  combo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,159,67,0.15)',
  },
  body: { padding: Spacing.md, gap: Spacing.md, maxWidth: 720, width: '100%', alignSelf: 'center' },
  boss: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.dangerSoft,
    borderWidth: 1,
    borderColor: Colors.danger + '55',
  },
  bossEmoji: { fontSize: 40 },
  feedback: { gap: 4, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
  good: { backgroundColor: Colors.successSoft, borderColor: Colors.success + '66' },
  bad: { backgroundColor: Colors.dangerSoft, borderColor: Colors.danger + '66' },
  footer: {
    padding: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.backgroundDeep,
  },
});
