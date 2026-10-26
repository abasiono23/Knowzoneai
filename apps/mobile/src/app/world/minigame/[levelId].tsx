import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LevelRoute, type LoadedLevel } from '@/components/world/level-route';
import { ConfirmDialog, PauseMenu } from '@/components/world/overlays';
import { GameHud, Kora } from '@/components/world/world-ui';
import { Button, Text } from '@/components/ui';
import { Colors, Radius, Spacing, WorldGradients } from '@/constants/theme';
import { SPRINT_SECONDS, sprintDeck } from '@/lib/world/levels';
import { useWorld } from '@/lib/world/store';

/** Screen 141: the lightning-round mini-game. True or false, as many as you can before time runs out. */
export default function MiniGameScreen() {
  return <LevelRoute>{(l) => <Sprint key={l.id} level={l} />}</LevelRoute>;
}

function Sprint({ level }: { level: LoadedLevel }) {
  const { t } = useTranslation('world');
  const { recordRun, settings } = useWorld();
  // Relaxed mode doubles the clock instead of removing it: the race is the game.
  const duration = settings.timer ? SPRINT_SECONDS : SPRINT_SECONDS * 2;
  const [round, setRound] = useState(0);
  const deck = useMemo(() => sprintDeck(level, round), [level, round]);
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(duration);
  const [right, setRight] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [flash, setFlash] = useState<null | { ok: boolean; n: number }>(null);
  const [paused, setPaused] = useState(false);
  const [confirm, setConfirm] = useState<'restart' | 'quit' | null>(null);
  const done = useRef(false);

  const card = deck[i % deck.length];
  const finished = left <= 0 || i >= deck.length;

  useEffect(() => {
    if (!started || paused || finished) return;
    const timer = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [started, paused, finished]);

  const latest = useRef({ right, wrong, i });
  useEffect(() => {
    latest.current = { right, wrong, i };
  });
  useEffect(() => {
    if (!finished || !started || done.current) return;
    done.current = true;
    const { right: r, wrong: w, i: n } = latest.current;
    const run = recordRun({
      levelId: level.id,
      correct: r,
      total: n,
      score: r * 100,
      seconds: duration - left,
      hintsUsed: 0,
      mistakes: w,
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
  }, [finished, started, recordRun, level.id, duration, left]);

  const choose = (v: boolean) => {
    if (finished || paused) return;
    const ok = v === card.answer;
    if (ok) {
      setRight((r) => r + 1);
      setStreak((s) => s + 1);
    } else {
      setWrong((w) => [...w, card.id]);
      setStreak(0);
    }
    setFlash({ ok, n: i });
    if (settings.haptics)
      Haptics.impactAsync(ok ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setI(i + 1);
  };

  const restart = () => {
    setConfirm(null);
    setPaused(false);
    setRound((r) => r + 1);
    setI(0);
    setLeft(duration);
    setRight(0);
    setWrong([]);
    setStreak(0);
    setFlash(null);
  };

  const colors = WorldGradients[level.worldId];

  if (!started)
    return (
      <LinearGradient colors={[colors[0], Colors.backgroundDeep]} style={{ flex: 1 }}>
        <SafeAreaView style={styles.intro}>
          <Animated.View entering={ZoomIn.springify()} style={styles.boltWrap}>
            <Ionicons name="flash" size={64} color={Colors.reward} />
          </Animated.View>
          <Text variant="label" color="rgba(255,255,255,0.8)">
            {t('sprint.eyebrow', { world: level.world.name.toUpperCase() })}
          </Text>
          <Text variant="display" center>
            {level.title}
          </Text>
          <Kora>{t('sprint.intro', { count: duration })}</Kora>
          <View style={{ alignSelf: 'stretch', gap: Spacing.xs, marginTop: 'auto' }}>
            <Button title={t('sprint.go')} icon="flash" onPress={() => setStarted(true)} />
            <Button variant="ghost" title={t('actions.notNow', { ns: 'common' })} onPress={() => router.back()} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <LinearGradient colors={[colors[0] + '55', 'transparent']} style={StyleSheet.absoluteFill} pointerEvents="none" />
      <GameHud
        onPause={() => setPaused(true)}
        progress={1 - left / duration}
        timer={left}
        left={
          <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
            <View style={styles.tally}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text variant="bodyStrong">{right}</Text>
            </View>
            <View style={styles.tally}>
              <Ionicons name="close-circle" size={16} color={Colors.danger} />
              <Text variant="bodyStrong">{wrong.length}</Text>
            </View>
            {streak >= 3 && (
              <Animated.View key={streak} entering={ZoomIn}>
                <Text variant="label" color="#FF9F43">
                  {t('sprint.inARow', { count: streak })}
                </Text>
              </Animated.View>
            )}
          </View>
        }
      />
      <View style={styles.stage}>
        {flash && (
          <Animated.View
            key={flash.n}
            entering={FadeIn.duration(80)}
            exiting={FadeOut.duration(300)}
            style={styles.flash}>
            <Ionicons
              name={flash.ok ? 'checkmark-circle' : 'close-circle'}
              size={28}
              color={flash.ok ? Colors.success : Colors.danger}
            />
          </Animated.View>
        )}
        {card && (
          <Animated.View key={i} entering={ZoomIn.duration(180)} style={styles.card}>
            <Text variant="label" color={Colors.textMuted}>
              {t('sprint.statement', { n: i + 1 })}
            </Text>
            <Text variant="title" center style={{ fontSize: 24, lineHeight: 32 }}>
              {card.statement}
            </Text>
          </Animated.View>
        )}
      </View>
      <SafeAreaView edges={['bottom']} style={styles.buttons}>
        <Pressable
          onPress={() => choose(false)}
          accessibilityRole="button"
          accessibilityLabel={t('sprint.false')}
          style={({ pressed }) => [styles.tf, styles.false, pressed && { transform: [{ scale: 0.96 }] }]}>
          <Ionicons name="close" size={30} color="#fff" />
          <Text variant="heading" color="#fff">
            {t('sprint.falseButton')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => choose(true)}
          accessibilityRole="button"
          accessibilityLabel={t('sprint.true')}
          style={({ pressed }) => [styles.tf, styles.true, pressed && { transform: [{ scale: 0.96 }] }]}>
          <Ionicons name="checkmark" size={30} color="#fff" />
          <Text variant="heading" color="#fff">
            {t('sprint.trueButton')}
          </Text>
        </Pressable>
      </SafeAreaView>
      <PauseMenu
        visible={paused && !confirm}
        title={level.title}
        subtitle={t('sprint.pauseSubtitle', { right, count: left })}
        onResume={() => setPaused(false)}
        onRestart={() => setConfirm('restart')}
        onQuit={() => setConfirm('quit')}
      />
      <ConfirmDialog
        visible={confirm === 'restart'}
        title={t('sprint.restartTitle')}
        body={t('sprint.restartBody')}
        confirmLabel={t('game.restart')}
        onConfirm={restart}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        visible={confirm === 'quit'}
        icon="exit-outline"
        destructive
        title={t('sprint.quitTitle')}
        body={t('sprint.quitBody')}
        confirmLabel={t('sprint.quit')}
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
  intro: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  boltWrap: {
    marginTop: Spacing.xl,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tally: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stage: { flex: 1, padding: Spacing.lg, justifyContent: 'center', maxWidth: 720, width: '100%', alignSelf: 'center' },
  flash: { position: 'absolute', top: Spacing.lg, alignSelf: 'center' },
  card: {
    gap: Spacing.md,
    alignItems: 'center',
    padding: Spacing.xl,
    minHeight: 220,
    justifyContent: 'center',
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  tf: {
    flex: 1,
    height: 110,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderBottomWidth: 6,
  },
  false: { backgroundColor: '#E2445F', borderBottomColor: '#A32640' },
  true: { backgroundColor: '#14B39B', borderBottomColor: '#0B7A69' },
});
