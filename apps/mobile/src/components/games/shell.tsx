import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog, PauseMenu } from '@/components/world/overlays';
import { Stars } from '@/components/world/world-ui';
import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { EnglishGameId, GameRunPublic, GameSummary } from '@/lib/api';
import { COVERS, MAX_LEVEL, playHref, useGameRun } from '@/lib/games/english';

import { FONT, GameBackground, GameError, GameLoading, GradientButton, KoraBubble } from './ui';

/** A game run plus the pause and leave/restart dialogs every game screen shares. Starts on mount. */
export function useGame<R extends GameRunPublic>(game: EnglishGameId, level: number) {
  const g = useGameRun<R>(game, level);
  const [paused, setPaused] = useState(false);
  const [confirm, setConfirm] = useState<'restart' | 'quit' | null>(null);
  const { start } = g;
  useEffect(() => {
    void start();
  }, [start]);
  return { ...g, game, level, paused, setPaused, confirm, setConfirm };
}
export type Game<R extends GameRunPublic> = ReturnType<typeof useGame<R>>;

/**
 * Loading, errors, the results at the end, and the pause menu around a game's board. `children`
 * only renders once the run has loaded.
 */
export function GameShell<R extends GameRunPublic>({
  g,
  step,
  children,
}: {
  g: Game<R>;
  /** "3 of 8" in the pause menu. */
  step: { n: number; total: number };
  /** Key the board by run id, so a new run starts with fresh state. */
  children: (run: R) => ReactNode;
}) {
  const { t } = useTranslation('games');
  const name = t(`english.${g.game}.name`);
  if (!g.run) return g.error ? <GameError message={g.error} onRetry={g.start} /> : <GameLoading />;
  if (g.summary)
    return <ResultView game={g.game} level={g.level} summary={g.summary} onReplay={() => void g.start()} />;
  return (
    <GameBackground>
      {children(g.run)}
      {!!g.error && (
        <Pressable onPress={() => g.setError(null)} style={styles.toast} accessibilityRole="alert">
          <Ionicons name="cloud-offline" size={18} color="#fff" />
          <Text style={{ flex: 1, color: '#fff' }}>{g.error}</Text>
          <Ionicons name="close" size={18} color="#fff" />
        </Pressable>
      )}
      <PauseMenu
        visible={g.paused && !g.confirm}
        title={name}
        subtitle={t('ui.pauseSubtitle', { level: g.level, n: step.n, total: step.total })}
        onResume={() => g.setPaused(false)}
        onRestart={() => g.setConfirm('restart')}
        onQuit={() => g.setConfirm('quit')}
      />
      <ConfirmDialog
        visible={g.confirm === 'restart'}
        title={t('ui.restartTitle')}
        body={t('ui.restartBody')}
        confirmLabel={t('ui.restart')}
        onConfirm={() => {
          g.setConfirm(null);
          g.setPaused(false);
          void g.start();
        }}
        onCancel={() => g.setConfirm(null)}
      />
      <ConfirmDialog
        visible={g.confirm === 'quit'}
        icon="exit-outline"
        destructive
        title={t('ui.quitTitle')}
        body={t('ui.quitBody')}
        confirmLabel={t('ui.quit')}
        onConfirm={() => {
          g.setConfirm(null);
          void g.quit();
        }}
        onCancel={() => g.setConfirm(null)}
      />
    </GameBackground>
  );
}

/** End of a game: stars, score, rewards, and what to do next. */
export function ResultView({
  game,
  level,
  summary,
  onReplay,
}: {
  game: EnglishGameId;
  level: number;
  summary: GameSummary;
  onReplay: () => void;
}) {
  const { t } = useTranslation('games');
  const s = summary;
  const title = s.stars >= 3 ? t('results.great') : s.stars > 0 ? t('results.good') : t('results.tryAgain');
  const opp = s.opponent;
  const oppName = opp ? (opp.kind === 'bot' ? t('clash.practiceRival') : (opp.name ?? t('clash.learner'))) : '';
  const verdict =
    opp &&
    (s.score > opp.total
      ? t('results.won')
      : s.score === opp.total
        ? t('results.draw')
        : t('results.lost', { name: oppName }));
  const capped = s.stars > 0 && s.xp === 0 && s.coins === 0;
  return (
    <GameBackground>
      <SafeAreaView style={styles.result}>
        <Animated.View entering={ZoomIn.springify()} style={styles.cover}>
          <Image source={COVERS[game]} style={{ width: 120, height: 120 }} contentFit="contain" accessible={false} />
        </Animated.View>
        <Text style={styles.resultTitle}>{verdict ?? title}</Text>
        <Stars value={s.stars} size={44} animate />
        <Animated.View entering={FadeInDown.delay(400)} style={styles.scoreCard}>
          <Text variant="label" color={Colors.textSecondary}>
            {t('results.score')}
          </Text>
          <Text style={{ fontFamily: FONT, fontSize: 44, color: '#fff' }}>{s.score}</Text>
          {opp && (
            <Text color={Colors.textSecondary} center>
              {t('results.versus', { you: s.score, them: opp.total, name: oppName })}
            </Text>
          )}
          {s.newBest && s.score > 0 ? (
            <Text style={{ fontFamily: FONT, color: Colors.reward }}>{t('results.newBest')}</Text>
          ) : (
            <Text color={Colors.textMuted}>{t('results.best', { score: s.best.score })}</Text>
          )}
        </Animated.View>
        <Animated.View entering={FadeIn.delay(700)} style={styles.rewards}>
          {s.xp > 0 && (
            <View style={styles.reward}>
              <Ionicons name="flash" size={18} color={Colors.primary} />
              <Text style={{ fontFamily: FONT, color: '#fff' }}>{t('results.xp', { count: s.xp })}</Text>
            </View>
          )}
          {s.coins > 0 && (
            <View style={styles.reward}>
              <View style={styles.coin}>
                <Text style={{ fontFamily: FONT, fontSize: 10, color: '#7A4B00' }}>K</Text>
              </View>
              <Text style={{ fontFamily: FONT, color: Colors.reward }}>{t('results.coins', { count: s.coins })}</Text>
            </View>
          )}
        </Animated.View>
        {capped && (
          <Text color={Colors.textSecondary} center>
            {t('results.capped')}
          </Text>
        )}
        {s.nextLevelUnlocked && (
          <Text style={{ fontFamily: 'Manrope_700Bold', color: Colors.success }} center>
            {t('results.unlocked', { level: level + 1 })}
          </Text>
        )}
        <View style={{ flex: 1 }} />
        <KoraBubble size={72} style={{ alignSelf: 'flex-end' }} />
        <View style={{ alignSelf: 'stretch', gap: Spacing.sm }}>
          {s.nextLevelUnlocked && level < MAX_LEVEL && (
            <GradientButton
              title={t('results.next')}
              icon="arrow-forward"
              onPress={() => router.replace(playHref(game, level + 1))}
            />
          )}
          <GradientButton
            title={t('results.replay')}
            icon="refresh"
            colors={s.nextLevelUnlocked ? ['#3A2DA8', '#3A2DA8'] : undefined}
            onPress={onReplay}
            height={54}
          />
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            style={{ alignSelf: 'center', padding: Spacing.sm }}>
            <Text color={Colors.textSecondary}>{t('results.back')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </GameBackground>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    top: 110,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,90,122,0.92)',
  },
  result: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  cover: { marginTop: Spacing.md },
  resultTitle: { fontFamily: FONT, fontSize: 30, color: '#fff', textAlign: 'center' },
  scoreCard: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 2,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(91,63,224,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(160,140,255,0.3)',
  },
  rewards: { flexDirection: 'row', gap: Spacing.sm },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(10,8,40,0.55)',
  },
  coin: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.reward,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
