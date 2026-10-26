import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LevelRoute, type LoadedLevel } from '@/components/world/level-route';
import { ConfirmDialog, PauseMenu } from '@/components/world/overlays';
import { GameHud, Kora } from '@/components/world/world-ui';
import { Button, Text } from '@/components/ui';
import { Colors, Radius, Spacing, WorldGradients } from '@/constants/theme';
import { scrambled, wordsFor } from '@/lib/world/levels';
import { useWorld } from '@/lib/world/store';

type Tile = { id: number; ch: string };

/** Screen 142: puzzle challenge. Unscramble the key words from their clues. */
export default function PuzzleScreen() {
  return <LevelRoute>{(l) => <Puzzle key={l.id} level={l} />}</LevelRoute>;
}

function Puzzle({ level }: { level: LoadedLevel }) {
  const { t } = useTranslation('world');
  const { recordRun, settings } = useWorld();
  const [round, setRound] = useState(0);
  const puzzle = useMemo(() => wordsFor(level, round), [level, round]);
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const word = puzzle[i];
  const tiles = useMemo<Tile[]>(
    () => scrambled(word.word, `${word.id}-${round}`).map((ch, k) => ({ id: k, ch })),
    [word, round],
  );
  const [placed, setPlaced] = useState<(Tile | null)[]>(() => Array(word.word.length).fill(null));
  const [locked, setLocked] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [wrongTries, setWrongTries] = useState(0);
  const [reveals, setReveals] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);
  const [confirm, setConfirm] = useState<'restart' | 'quit' | null>(null);
  const startedAt = useRef(0);
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const buzz = (tile: Haptics.NotificationFeedbackType) =>
    settings.haptics && Haptics.notificationAsync(tile).catch(() => {});

  const usedIds = placed.filter(Boolean).map((tile) => tile!.id);
  const attempt = placed.map((tile) => tile?.ch ?? '').join('');
  const full = placed.every(Boolean);

  const check = (next: (Tile | null)[]) => {
    if (!next.every(Boolean)) return;
    const guess = next.map((tile) => tile!.ch).join('');
    if (guess === word.word) {
      setSolved(true);
      buzz(Haptics.NotificationFeedbackType.Success);
    } else {
      setWrongTries((n) => n + 1);
      if (!missed.includes(word.id)) setMissed((m) => [...m, word.id]);
      buzz(Haptics.NotificationFeedbackType.Error);
      shake.set(
        withSequence(
          withTiming(-12, { duration: 50 }),
          withTiming(12, { duration: 50 }),
          withTiming(-6, { duration: 50 }),
          withTiming(0, { duration: 50 }),
        ),
      );
    }
  };

  const place = (tile: Tile) => {
    if (solved) return;
    const slot = placed.findIndex((p) => !p);
    if (slot < 0) return;
    const next = placed.map((p, k) => (k === slot ? tile : p));
    setPlaced(next);
    check(next);
  };
  const unplace = (k: number) => {
    if (solved || locked.includes(k)) return;
    setPlaced((p) => p.map((x, j) => (j === k ? null : x)));
  };
  const reveal = () => {
    // Fix the first wrong or empty slot with the right letter.
    const k = word.word.split('').findIndex((ch, j) => placed[j]?.ch !== ch);
    if (k < 0) return;
    const free = tiles.find(
      (tile) => tile.ch === word.word[k] && !placed.some((p, j) => p?.id === tile.id && j !== k && word.word[j] === p.ch),
    );
    if (!free) return;
    const next = placed.map((p, j) => (j === k ? free : p?.id === free.id ? null : p));
    setPlaced(next);
    setLocked((l) => [...l, k]);
    setReveals((r) => r + 1);
    if (!missed.includes(word.id)) setMissed((m) => [...m, word.id]);
    check(next);
  };

  const nextWord = () => {
    if (i === puzzle.length - 1) {
      const run = recordRun({
        levelId: level.id,
        correct: puzzle.length,
        total: puzzle.length,
        score: Math.max(0, puzzle.length * 150 - wrongTries * 20 - reveals * 50),
        seconds: Math.round((Date.now() - startedAt.current) / 1000),
        hintsUsed: reveals,
        mistakes: missed,
        reveals,
        wrongTries,
        wordsSolved: puzzle.length,
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
      return;
    }
    const n = puzzle[i + 1];
    setI(i + 1);
    setPlaced(Array(n.word.length).fill(null));
    setLocked([]);
    setSolved(false);
  };

  const restart = () => {
    setConfirm(null);
    setPaused(false);
    const first = wordsFor(level, round + 1)[0];
    setRound((r) => r + 1);
    setI(0);
    setPlaced(Array(first.word.length).fill(null));
    setLocked([]);
    setSolved(false);
    setWrongTries(0);
    setReveals(0);
    setMissed([]);
  };

  const colors = WorldGradients[level.worldId];

  if (!started)
    return (
      <LinearGradient colors={[colors[0], Colors.backgroundDeep]} style={{ flex: 1 }}>
        <SafeAreaView style={styles.intro}>
          <Animated.View entering={ZoomIn.springify()} style={styles.icon}>
            <Ionicons name="extension-puzzle" size={60} color={Colors.success} />
          </Animated.View>
          <Text variant="label" color="rgba(255,255,255,0.8)">
            {t('puzzle.eyebrow', { world: level.world.name.toUpperCase() })}
          </Text>
          <Text variant="display" center>
            {level.title}
          </Text>
          <Kora>{t('puzzle.intro')}</Kora>
          <View style={{ alignSelf: 'stretch', gap: Spacing.xs, marginTop: 'auto' }}>
            <Button
              title={t('puzzle.start')}
              icon="play"
              onPress={() => {
                startedAt.current = Date.now();
                setStarted(true);
              }}
            />
            <Button variant="ghost" title={t('actions.notNow', { ns: 'common' })} onPress={() => router.back()} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );

  const wrongFull = full && !solved;
  const big = word.word.length <= 7;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <LinearGradient colors={[colors[0] + '55', 'transparent']} style={StyleSheet.absoluteFill} pointerEvents="none" />
      <GameHud
        onPause={() => setPaused(true)}
        progress={(i + (solved ? 1 : 0)) / puzzle.length}
        left={
          <Text variant="label" color={Colors.textMuted}>
            {t('puzzle.wordOf', { n: i + 1, total: puzzle.length })}
          </Text>
        }
      />
      <View style={styles.body}>
        <Animated.View key={`${round}-${i}`} entering={FadeInDown} style={styles.clue}>
          <Text variant="label" color={Colors.success}>
            {t('puzzle.clue')}
          </Text>
          <Text variant="title" center style={{ fontSize: 22, lineHeight: 30 }}>
            {word.clue}
          </Text>
          <Text variant="small" color={Colors.textMuted}>
            {t('puzzle.letters', { count: word.word.length })}
          </Text>
        </Animated.View>

        <Animated.View style={[styles.slots, shakeStyle]}>
          {placed.map((tile, k) => (
            <Pressable
              key={k}
              onPress={() => unplace(k)}
              accessibilityRole="button"
              accessibilityLabel={
                tile
                  ? t('puzzle.slotA11y', { letter: tile.ch, position: k + 1 })
                  : t('puzzle.emptyA11y', { position: k + 1 })
              }
              style={[
                styles.slot,
                big && styles.slotBig,
                tile && styles.slotFilled,
                solved && styles.slotRight,
                wrongFull && styles.slotWrong,
                locked.includes(k) && !solved && { borderColor: Colors.reward },
              ]}>
              <Text style={[styles.letter, big && { fontSize: 24 }]}>{tile?.ch ?? ''}</Text>
            </Pressable>
          ))}
        </Animated.View>
        {wrongFull && (
          <Text variant="small" color={Colors.danger} center>
            {t('puzzle.notQuite')}
          </Text>
        )}
        {solved && (
          <Animated.View entering={ZoomIn} style={styles.solved}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text variant="bodyStrong" color={Colors.success}>
              {t('puzzle.solved', { word: word.word })}
            </Text>
          </Animated.View>
        )}

        {!solved && (
          <View style={styles.tiles}>
            {tiles.map((tile) => {
              const used = usedIds.includes(tile.id);
              return (
                <Pressable
                  key={tile.id}
                  onPress={() => place(tile)}
                  disabled={used}
                  accessibilityRole="button"
                  accessibilityLabel={t('puzzle.letterA11y', { letter: tile.ch })}
                  style={({ pressed }) => [
                    styles.tile,
                    used && styles.tileUsed,
                    pressed && { transform: [{ scale: 0.92 }] },
                  ]}>
                  <Text style={[styles.letter, used && { opacity: 0 }]}>{tile.ch}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {solved ? (
          <Button
            title={i === puzzle.length - 1 ? t('puzzle.finish') : t('puzzle.nextWord')}
            icon="arrow-forward"
            onPress={nextWord}
          />
        ) : (
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <Button
              variant="secondary"
              title={t('actions.clear', { ns: 'common' })}
              icon="backspace-outline"
              style={{ flex: 1 }}
              disabled={!attempt}
              onPress={() => setPlaced((p) => p.map((x, k) => (locked.includes(k) ? x : null)))}
            />
            <Button
              variant="secondary"
              title={t('puzzle.reveal')}
              icon="sparkles"
              style={{ flex: 1.4 }}
              onPress={reveal}
            />
          </View>
        )}
      </SafeAreaView>
      <PauseMenu
        visible={paused && !confirm}
        title={level.title}
        subtitle={t('puzzle.pauseSubtitle', { n: i + 1, total: puzzle.length })}
        onResume={() => setPaused(false)}
        onRestart={() => setConfirm('restart')}
        onQuit={() => setConfirm('quit')}
      />
      <ConfirmDialog
        visible={confirm === 'restart'}
        title={t('puzzle.restartTitle')}
        body={t('puzzle.restartBody')}
        confirmLabel={t('game.restart')}
        onConfirm={restart}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        visible={confirm === 'quit'}
        icon="exit-outline"
        destructive
        title={t('puzzle.quitTitle')}
        body={t('puzzle.quitBody')}
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
  icon: {
    marginTop: Spacing.xl,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.lg,
    justifyContent: 'center',
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  clue: {
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  slots: { flexDirection: 'row', justifyContent: 'center', gap: 6, flexWrap: 'wrap' },
  slot: {
    width: 36,
    height: 46,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotBig: { width: 42, height: 52 },
  slotFilled: { borderStyle: 'solid', backgroundColor: Colors.surfaceRaised },
  slotRight: { borderColor: Colors.success, backgroundColor: Colors.successSoft },
  slotWrong: { borderColor: Colors.danger, backgroundColor: Colors.dangerSoft },
  letter: { fontFamily: 'Manrope_800ExtraBold', fontSize: 20, color: Colors.text },
  solved: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.xs },
  tile: {
    width: 48,
    height: 54,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    borderBottomWidth: 5,
    borderBottomColor: '#4B2FCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileUsed: { backgroundColor: Colors.surface, borderBottomColor: Colors.surface },
  footer: {
    padding: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.backgroundDeep,
  },
});
