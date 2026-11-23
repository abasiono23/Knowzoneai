import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { ClueCard, Feedback, GameLoading, HeartsStat, PrimaryButton, SecondaryButton, Stat, TimerStat, useCountdown, W } from '@/components/games/ui';
import { LevelRoute, type LoadedLevel } from '@/components/world/level-route';
import { LevelIntro, PlayFrame, usePlayState, type PlayLevel } from '@/components/world/play-frame';
import { AnswerButton, type AnswerState } from '@/components/world/world-ui';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { useKeys } from '@/lib/games/english';
import { useBank, type BankQuestion } from '@/lib/world/bank';
import { bankTier, DAILY_ID, questionsFor, rungOf } from '@/lib/world/levels';
import { useWorld } from '@/lib/world/store';

/**
 * Quizzes: the quiz levels, the final test (level 10), the daily challenge and `?review=1`, which
 * replays the questions you got wrong (no hearts, no clock).
 */
export default function GameplayScreen() {
  return <LevelRoute>{(l) => <Quiz key={l.id} level={l} />}</LevelRoute>;
}

function Quiz({ level }: { level: LoadedLevel }) {
  const bank = useBank(level.worldId, bankTier(level));
  const { review } = useLocalSearchParams<{ review?: string }>();
  const { mistakes } = useWorld();
  if (!bank) return <GameLoading />;
  if (review === '1') {
    const wrong = new Set((mistakes[level.id] ?? []).map((id) => id.replace(/-tf$/, '')));
    return <QuizGame level={level} pool={bank.questions.filter((q) => wrong.has(q.id))} reviewing />;
  }
  return <QuizGame level={level} pool={bank.questions} />;
}

function QuizGame({ level, pool, reviewing }: { level: PlayLevel; pool: BankQuestion[]; reviewing?: boolean }) {
  const { t } = useTranslation('world');
  const { t: tg } = useTranslation('games');
  const { recordRun } = useWorld();
  const s = usePlayState(level);
  const daily = level.id === DAILY_ID;
  const rung = rungOf(daily ? { number: level.tier ?? 4 } : level);
  const hearts0 = reviewing ? 0 : rung.hearts || 3;
  const hintLevel = daily || reviewing ? 2 : rung.hints;
  const [round, setRound] = useState(0);
  const questions = useMemo(
    () => (reviewing ? pool : questionsFor(level, { questions: pool, truths: [], terms: [] }, round)),
    [level, pool, round, reviewing],
  );
  const timed = !s.relaxed && !reviewing;

  const [i, setI] = useState(0);
  const [hearts, setHearts] = useState(hearts0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gain, setGain] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [hint, setHint] = useState(false);
  const [removed, setRemoved] = useState<number[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const startedAt = useRef(0);

  const q = questions[i];
  const answered = picked !== null;
  const over = !reviewing && hearts <= 0;
  const buzz = (type: Haptics.NotificationFeedbackType) => s.haptics && Haptics.notificationAsync(type).catch(() => {});

  const answer = (k: number) => {
    if (answered || !q || s.halted) return;
    const ok = k === q.answer;
    setPicked(k);
    if (ok) {
      const mult = removed.length ? 0.5 : hint ? 0.75 : 1;
      const speed = timed ? Math.round((left / rung.seconds) * 50) : 25;
      const pts = Math.round((100 + speed + Math.min(streak, 5) * 10) * mult);
      setGain(pts);
      setScore((x) => x + pts);
      setCorrect((c) => c + 1);
      setStreak((c) => c + 1);
      buzz(Haptics.NotificationFeedbackType.Success);
    } else {
      setGain(0);
      setStreak(0);
      setWrong((w) => [...w, q.id]);
      if (!reviewing) setHearts((h) => h - 1);
      buzz(Haptics.NotificationFeedbackType.Error);
    }
  };

  const left = useCountdown(rung.seconds, s.started && timed && !answered && !s.halted && !over, () => answer(-1), `${round}-${i}`);

  useEffect(() => {
    if (s.started) startedAt.current = Date.now();
  }, [s.started, round]);

  const finish = () => {
    if (reviewing) return router.back();
    const run = recordRun({
      levelId: level.id,
      correct,
      total: questions.length,
      score,
      seconds: Math.round((Date.now() - startedAt.current) / 1000),
      hintsUsed,
      mistakes: wrong,
      failed: hearts <= 0,
    });
    router.replace({
      pathname: '/world/results/[levelId]',
      params: { levelId: level.id, run: run.id, fresh: '1', unlocked: run.unlockedWorlds.join(','), ach: run.newAchievements.join(',') },
    });
  };

  const next = () => {
    if (over || i === questions.length - 1) return finish();
    setI(i + 1);
    setPicked(null);
    setHint(false);
    setRemoved([]);
  };

  const restart = () => {
    setRound((r) => r + 1);
    setI(0);
    setHearts(hearts0);
    setPicked(null);
    setCorrect(0);
    setScore(0);
    setStreak(0);
    setWrong([]);
    setHint(false);
    setRemoved([]);
    setHintsUsed(0);
  };

  useKeys(
    (key) => {
      if (!s.started || s.halted) return;
      if (answered) {
        if (key === 'Enter' || key === ' ') next();
        return;
      }
      const n = /^[1-5]$/.test(key) ? Number(key) - 1 : /^[A-E]$/.test(key) ? key.charCodeAt(0) - 65 : -1;
      if (q && n >= 0 && n < q.options.length && !removed.includes(n)) answer(n);
    },
    !!q,
  );

  if (!s.started) return <LevelIntro s={s} count={questions.length} />;

  if (!q)
    return (
      <PlayFrame s={s} step={{ n: 1, total: 1 }} status={null} onRestart={restart}>
        <View style={{ gap: 16, paddingTop: 24 }}>
          <Text style={styles.question}>{t('play.nothingToReview')}</Text>
          <PrimaryButton title={t('actions.back', { ns: 'common' })} onPress={() => router.back()} />
        </View>
      </PlayFrame>
    );

  const stateOf = (k: number): AnswerState =>
    removed.includes(k) ? 'removed' : !answered ? 'idle' : k === q.answer ? 'right' : k === picked ? 'wrong' : 'dim';

  return (
    <PlayFrame
      s={s}
      step={{ n: i + 1, total: questions.length }}
      onRestart={restart}
      status={
        <>
          <Stat icon="list-outline" text={`${i + 1}/${questions.length}`} label={t('play.questionOf', { n: i + 1, total: questions.length })} />
          {reviewing ? <Stat icon="refresh" text={t('play.practising')} /> : <HeartsStat left={hearts} total={hearts0} />}
          <Stat icon="trophy-outline" text={String(score)} label={t('play.scoreA11y', { score })} />
          {!reviewing && <TimerStat seconds={left} relaxed={!timed} />}
        </>
      }
      footer={
        answered ? (
          <PrimaryButton
            title={over ? t('play.seeResults') : i === questions.length - 1 ? (reviewing ? t('play.donePractising') : t('play.finish')) : tg('ui.next')}
            icon="arrow-forward"
            onPress={next}
          />
        ) : hintLevel > 0 ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <SecondaryButton
              title={t('adv.hint')}
              icon="bulb-outline"
              disabled={hint}
              style={{ flex: 1 }}
              accessibilityLabel={t('adv.hintA11y')}
              onPress={() => {
                setHint(true);
                setHintsUsed((n) => n + 1);
              }}
            />
            {hintLevel >= 2 && (
              <SecondaryButton
                title="50:50"
                icon="git-compare-outline"
                disabled={removed.length > 0}
                style={{ flex: 1 }}
                accessibilityLabel={t('adv.fiftyA11y')}
                onPress={() => {
                  const wrongOnes = q.options.map((_, k) => k).filter((k) => k !== q.answer);
                  setRemoved(wrongOnes.slice(0, Math.max(1, q.options.length - 2)));
                  setHintsUsed((n) => n + 1);
                }}
              />
            )}
          </View>
        ) : (
          <Text style={styles.noHints}>{t('adv.noHints')}</Text>
        )
      }>
      <Animated.View key={`${round}-${i}`} entering={FadeIn.duration(180)} style={{ gap: 14 }}>
        <View style={styles.qCard}>
          <Text style={styles.eyebrow}>{t('play.questionOf', { n: i + 1, total: questions.length }).toUpperCase()}</Text>
          <Text style={styles.question} accessibilityRole="header">
            {q.q}
          </Text>
        </View>
        {hint && !answered && (
          <Animated.View entering={FadeIn}>
            <ClueCard label={t('adv.hint').toUpperCase()} text={q.hint} />
          </Animated.View>
        )}
        <View style={{ gap: 8 }}>
          {q.options.map((o, k) => (
            <AnswerButton key={k} label={o} index={k} state={stateOf(k)} onPress={() => answer(k)} disabled={answered || s.halted} />
          ))}
        </View>
        {answered && (
          <Animated.View entering={FadeInDown.duration(200)} style={{ gap: 8 }}>
            <Feedback
              tone={picked === q.answer ? 'good' : 'bad'}
              title={picked === q.answer ? tg('ui.correct') : picked === -1 ? t('play.timesUp') : tg('ui.wrong')}
              detail={picked === q.answer ? null : t('adv.answerWas', { answer: q.options[q.answer] })}
              trailing={gain > 0 ? <Text style={styles.gain}>{tg('ui.points', { count: gain })}</Text> : undefined}
            />
            <Text style={styles.why}>{q.why}</Text>
          </Animated.View>
        )}
      </Animated.View>
      {!answered && Platform.OS === 'web' && (
        <Pressable onPress={() => s.setHelp(true)} accessibilityRole="button" style={styles.keysNote}>
          <Text style={styles.keysText}>{t('adv.keysShort')}</Text>
        </Pressable>
      )}
    </PlayFrame>
  );
}

const styles = StyleSheet.create({
  qCard: { gap: 8, padding: 18, borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  question: { fontFamily: Fonts.bold, fontSize: 19, lineHeight: 27, color: W.ink },
  gain: { fontFamily: Fonts.bold, fontSize: 15, color: W.correct },
  why: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: W.inkSoft, paddingHorizontal: 4 },
  noHints: { fontFamily: Fonts.semibold, fontSize: 14, color: W.muted, textAlign: 'center', paddingVertical: 14 },
  keysNote: { alignSelf: 'center', minHeight: 32, justifyContent: 'center' },
  keysText: { fontFamily: Fonts.regular, fontSize: 12, color: W.muted, textAlign: 'center' },
});
