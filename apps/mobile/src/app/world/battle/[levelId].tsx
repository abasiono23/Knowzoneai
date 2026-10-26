import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInLeft, FadeInRight, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/world/avatar';
import { LevelRoute, type LoadedLevel } from '@/components/world/level-route';
import { ConfirmDialog, PauseMenu } from '@/components/world/overlays';
import { AnswerButton, GameHud, Kora } from '@/components/world/world-ui';
import { Button, Text } from '@/components/ui';
import { Colors, Radius, Spacing, WorldGradients } from '@/constants/theme';
import { DEFAULT_AVATAR } from '@/lib/world/avatar';
import { questionsFor, seeded } from '@/lib/world/levels';
import { useWorld } from '@/lib/world/store';

const SECONDS = 15;

/** Screen 140: quiz battle. Race a rival; correct answers win, speed breaks ties. */
export default function BattleScreen() {
  const { rival } = useLocalSearchParams<{ rival?: string }>();
  return <LevelRoute allowLocked={!!rival}>{(l) => <Battle key={l.id} level={l} />}</LevelRoute>;
}

function Battle({ level }: { level: LoadedLevel }) {
  const { t } = useTranslation('world');
  // A friend battle passes the friend's name; it's practice against a computer rival with their name.
  const { rival: friendName } = useLocalSearchParams<{ rival?: string }>();
  const { avatar, recordRun, settings } = useWorld();
  const friend = friendName ? { name: friendName, avatar: { ...DEFAULT_AVATAR, background: 'sunset' } } : undefined;
  const rivalName = friendName || level.world.rival.name;
  const [round, setRound] = useState(0);
  const questions = useMemo(() => questionsFor(level, round), [level, round]);
  // The rival's answers are decided up front: ~65% right, answering in 3–12 seconds.
  const rivalPlan = useMemo(() => {
    const r = seeded(`${level.id}-${rivalName}-${round}`);
    return questions.map(() => ({ right: r() < 0.65, at: 3 + Math.round(r() * 9) }));
  }, [questions, level.id, rivalName, round]);

  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [left, setLeft] = useState(SECONDS);
  const [me, setMe] = useState({ correct: 0, points: 0 });
  const [them, setThem] = useState({ correct: 0, points: 0 });
  const [wrong, setWrong] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);
  const [confirm, setConfirm] = useState<'restart' | 'quit' | null>(null);
  const startedAt = useRef(0);

  const q = questions[i];
  const plan = rivalPlan[i];
  const answered = picked !== null;
  const elapsed = SECONDS - left;
  const rivalLocked = answered || elapsed >= plan.at;
  const timed = settings.timer;

  const lock = (k: number) => {
    if (answered) return;
    const ok = k === q.correctIndex;
    setPicked(k);
    if (ok) setMe((m) => ({ correct: m.correct + 1, points: m.points + 100 + left * 10 }));
    else setWrong((w) => [...w, q.id]);
    if (plan.right)
      setThem((x) => ({ correct: x.correct + 1, points: x.points + 100 + Math.max(0, SECONDS - plan.at) * 10 }));
    if (settings.haptics)
      Haptics.notificationAsync(
        ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
      ).catch(() => {});
  };

  const lockRef = useRef(lock);
  useEffect(() => {
    lockRef.current = lock;
  });
  useEffect(() => {
    if (!started || answered || paused) return;
    const timer = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          if (timed) lockRef.current(-1);
          return timed ? 0 : 1;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, answered, paused, timed, i]);

  useEffect(() => {
    if (started) startedAt.current = Date.now();
  }, [started, round]);

  const next = () => {
    if (i < questions.length - 1) {
      setI(i + 1);
      setPicked(null);
      setLeft(SECONDS);
      return;
    }
    const run = recordRun({
      levelId: level.id,
      correct: me.correct,
      total: questions.length,
      score: me.points,
      seconds: Math.round((Date.now() - startedAt.current) / 1000),
      hintsUsed: 0,
      mistakes: wrong,
      rivalScore: them.correct,
      practice: !!friend,
    });
    router.replace({
      pathname: '/world/results/[levelId]',
      params: {
        levelId: level.id,
        run: run.id,
        fresh: '1',
        rival: rivalName,
        rivalPoints: String(them.points),
        unlocked: run.unlockedWorlds.join(','),
        ach: run.newAchievements.join(','),
      },
    });
  };

  const restart = () => {
    setConfirm(null);
    setPaused(false);
    setRound((r) => r + 1);
    setI(0);
    setPicked(null);
    setLeft(SECONDS);
    setMe({ correct: 0, points: 0 });
    setThem({ correct: 0, points: 0 });
    setWrong([]);
  };

  const myAvatar = avatar ?? DEFAULT_AVATAR;
  const colors = WorldGradients[level.worldId];

  if (!started) {
    return (
      <LinearGradient colors={[colors[0], '#2A0B1E', Colors.backgroundDeep]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.vsWrap}>
            <Text variant="label" color="rgba(255,255,255,0.8)">
              {t('battle.eyebrow', { world: level.world.name.toUpperCase() })}
            </Text>
            <View style={styles.vs}>
              <Animated.View entering={FadeInLeft.duration(500)} style={styles.fighter}>
                <Avatar config={myAvatar} size={110} ring={Colors.primary} />
                <Text variant="heading">{myAvatar.name || t('friends.you')}</Text>
              </Animated.View>
              <Animated.Text entering={ZoomIn.delay(400).springify()} style={styles.vsText}>
                {t('battle.vs')}
              </Animated.Text>
              <Animated.View entering={FadeInRight.duration(500)} style={styles.fighter}>
                {friend ? (
                  <Avatar config={friend.avatar} size={110} ring={Colors.danger} />
                ) : (
                  <View style={styles.rivalFace}>
                    <Text style={{ fontSize: 60 }}>{level.world.rival.emoji}</Text>
                  </View>
                )}
                <Text variant="heading">{rivalName}</Text>
              </Animated.View>
            </View>
            <Kora>{t('battle.intro', { count: questions.length, seconds: SECONDS, rival: rivalName })}</Kora>
          </View>
          <View style={styles.footerPad}>
            <Button title={t('battle.start')} icon="flash" onPress={() => setStarted(true)} />
            <Button variant="ghost" title={t('actions.notNow', { ns: 'common' })} onPress={() => router.back()} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const state = (k: number) => (!answered ? 'idle' : k === q.correctIndex ? 'right' : k === picked ? 'wrong' : 'dim');

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <GameHud
        onPause={() => setPaused(true)}
        progress={(i + (answered ? 1 : 0)) / questions.length}
        timer={timed ? left : undefined}
      />
      <View style={styles.scoreboard}>
        <View style={styles.side}>
          <Avatar config={myAvatar} size={44} ring={Colors.primary} />
          <View>
            <Text variant="label" color={Colors.primary}>
              {t('battle.you')}
            </Text>
            <Text variant="heading">{me.correct}</Text>
          </View>
        </View>
        <Text variant="label" color={Colors.textMuted}>
          {t('battle.questionShort', { n: i + 1, total: questions.length })}
        </Text>
        <View style={[styles.side, { flexDirection: 'row-reverse' }]}>
          {friend ? (
            <Avatar config={friend.avatar} size={44} ring={Colors.danger} />
          ) : (
            <View style={styles.rivalSmall}>
              <Text style={{ fontSize: 24 }}>{level.world.rival.emoji}</Text>
            </View>
          )}
          <View style={{ alignItems: 'flex-end' }}>
            <Text variant="label" color={Colors.danger}>
              {rivalName.toUpperCase()}
            </Text>
            <Text variant="heading">{them.correct}</Text>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Animated.View key={`${round}-${i}`} entering={FadeInRight.duration(240)} style={{ gap: Spacing.md }}>
          <Text variant="title" style={{ fontSize: 22, lineHeight: 30 }}>
            {q.question}
          </Text>
          {rivalLocked && !answered && (
            <Animated.View entering={FadeIn} style={styles.rivalLock}>
              <Ionicons name="lock-closed" size={14} color={Colors.danger} />
              <Text variant="small" color={Colors.danger}>
                {t('battle.rivalLocked', { rival: rivalName })}
              </Text>
            </Animated.View>
          )}
          <View style={{ gap: Spacing.xs }}>
            {q.options.map((o, k) => (
              <AnswerButton key={k} label={o} index={k} state={state(k)} onPress={() => lock(k)} disabled={answered} />
            ))}
          </View>
          {answered && (
            <Animated.View entering={FadeInDown} style={styles.result}>
              <View style={styles.resultRow}>
                <Text variant="small">{t('friends.you')}</Text>
                <Text variant="bodyStrong" color={picked === q.correctIndex ? Colors.success : Colors.danger}>
                  {picked === q.correctIndex
                    ? t('battle.correctLeft', { count: left })
                    : picked === -1
                      ? t('battle.outOfTime')
                      : t('battle.wrong')}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text variant="small">{rivalName}</Text>
                <Text variant="bodyStrong" color={plan.right ? Colors.success : Colors.danger}>
                  {plan.right ? t('battle.correctAt', { count: plan.at }) : t('battle.wrong')}
                </Text>
              </View>
              <Text variant="small" color={Colors.textSecondary}>
                {q.explanation}
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Button
          title={i === questions.length - 1 ? t('battle.finalScore') : t('battle.nextQuestion')}
          icon="arrow-forward"
          disabled={!answered}
          onPress={next}
        />
      </SafeAreaView>
      <PauseMenu
        visible={paused && !confirm}
        title={t('kinds.battle.label')}
        subtitle={t('battle.pauseSubtitle', { me: me.correct, them: them.correct, rival: rivalName })}
        onResume={() => setPaused(false)}
        onRestart={() => setConfirm('restart')}
        onQuit={() => setConfirm('quit')}
      />
      <ConfirmDialog
        visible={confirm === 'restart'}
        title={t('battle.restartTitle')}
        body={t('battle.restartBody', { rival: rivalName })}
        confirmLabel={t('battle.rematch')}
        onConfirm={restart}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        visible={confirm === 'quit'}
        icon="flag-outline"
        destructive
        title={t('battle.forfeitTitle')}
        body={t('battle.forfeitBody')}
        confirmLabel={t('battle.forfeit')}
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
  vsWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    padding: Spacing.lg,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  vs: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  fighter: { alignItems: 'center', gap: Spacing.xs, width: 120 },
  vsText: { fontFamily: 'Manrope_800ExtraBold', fontSize: 40, color: Colors.reward, fontStyle: 'italic' },
  rivalFace: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 3,
    borderColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rivalSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerPad: { padding: Spacing.md, gap: Spacing.xs, maxWidth: 560, width: '100%', alignSelf: 'center' },
  scoreboard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.md,
    padding: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  side: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  body: { padding: Spacing.md, gap: Spacing.md, maxWidth: 720, width: '100%', alignSelf: 'center' },
  rivalLock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.dangerSoft,
  },
  result: {
    gap: 6,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footer: {
    padding: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.backgroundDeep,
  },
});
