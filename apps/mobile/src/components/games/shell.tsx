import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog, PauseMenu } from '@/components/world/overlays';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { EnglishGameId, GameRunPublic, GameSummary } from '@/lib/api';
import { CEFR, levelKey, MAX_LEVEL, OPEN_LEVELS, playHref, useGameRun, useRelaxed } from '@/lib/games/english';

import { GameCover } from './cover';
import { RulesSheet, useRulesSeen } from './how-to';
import { column, FONT, GameBackground, GameError, GameLoading, GameTopBar, PrimaryButton, SecondaryButton, W } from './ui';

/** A game run plus the pause, rules and leave/restart dialogs every game screen shares. Starts on mount. */
export function useGame<R extends GameRunPublic>(game: EnglishGameId, level: number) {
  const g = useGameRun<R>(game, level);
  const [paused, setPaused] = useState(false);
  const [confirm, setConfirm] = useState<'restart' | 'quit' | null>(null);
  const [asked, setRules] = useState<'help' | null>(null);
  const { seen, markSeen } = useRulesSeen(game);
  const { relaxed } = useRelaxed();
  const { start } = g;
  useEffect(() => {
    void start();
  }, [start]);
  // The rules come up before the first game of each kind, and from the "?" button.
  const rules = seen === false ? 'first' : asked;
  const closeRules = () => {
    if (seen === false) markSeen();
    setRules(null);
  };
  return {
    ...g,
    game,
    level,
    relaxed,
    // The clock stops while a dialog or the rules are open.
    paused: paused || !!rules || !!confirm,
    setPaused,
    confirm,
    setConfirm,
    rules,
    setRules,
    closeRules,
    menuOpen: paused,
  };
}
export type Game<R extends GameRunPublic> = ReturnType<typeof useGame<R>>;

/**
 * The frame around a game's board: the top bar, loading and errors, the rules, the pause menu and the
 * results at the end. `children` only renders once the run has loaded.
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
  const subtitle = t('ui.levelName', { level: g.level, name: t(`levels.names.${levelKey(g.level)}`) });
  if (!g.run) return g.error ? <GameError message={g.error} onRetry={g.start} /> : <GameLoading />;
  if (g.summary) return <ResultView g={g} summary={g.summary} />;
  return (
    <GameBackground>
      <GameTopBar
        title={name}
        subtitle={subtitle}
        onLeave={() => g.setConfirm('quit')}
        onHelp={() => g.setRules('help')}
        onPause={() => g.setPaused(true)}
      />
      {children(g.run)}
      {!!g.error && (
        <Pressable onPress={() => g.setError(null)} style={styles.toast} accessibilityRole="alert">
          <Ionicons name="cloud-offline-outline" size={18} color="#fff" />
          <Text style={{ flex: 1, color: '#fff', fontFamily: Fonts.semibold }}>{g.error}</Text>
          <Ionicons name="close" size={18} color="#fff" />
        </Pressable>
      )}
      <RulesSheet game={g.game} visible={!!g.rules} first={g.rules === 'first'} onClose={g.closeRules} />
      <PauseMenu
        visible={g.menuOpen && !g.confirm}
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

type ReviewItem = { key: string; correct: boolean; main: string; detail?: string };

/** What was in the run, to look back over: each word or sentence, right or wrong. */
function reviewOf(run: GameRunPublic, t: (k: string, o?: Record<string, unknown>) => string): ReviewItem[] {
  switch (run.game) {
    case 'hidden-letters':
      return run.steps.flatMap((s) =>
        s.result ? [{ key: String(s.id), correct: s.result.correct, main: s.result.word, detail: s.clue }] : [],
      );
    case 'spellcaster':
      return run.spells.flatMap((s) =>
        s.result ? [{ key: String(s.id), correct: s.result.correct, main: s.result.word, detail: s.prompt }] : [],
      );
    case 'sentence-master':
      return run.steps.flatMap((s) =>
        s.result ? [{ key: String(s.id), correct: s.result.correct, main: s.result.sentence }] : [],
      );
    case 'word-clash':
      return run.rounds.flatMap((r) =>
        r.result
          ? [
              {
                key: String(r.id),
                correct: r.result.correct,
                main: r.result.answer ? `${r.result.answer} · ${r.result.points}` : t('clash.noWord'),
                detail: t('clash.best', { word: r.result.best.word, points: r.result.best.points }),
              },
            ]
          : [],
      );
    case 'word-hunter':
      return run.words.map((w) => ({ key: w, correct: run.found.some((f) => f.word === w), main: w }));
    default:
      return [];
  }
}

/** The end of a game: the verdict, stars, score and rewards, what was in it, and what to do next. */
export function ResultView<R extends GameRunPublic>({ g, summary: s }: { g: Game<R>; summary: GameSummary }) {
  const { t } = useTranslation('games');
  const { game, level } = g;
  const opp = s.opponent;
  const oppName = opp ? (opp.kind === 'bot' ? t('clash.practiceRival') : (opp.name ?? t('clash.learner'))) : '';
  const title = opp
    ? s.score > opp.total
      ? t('results.won')
      : s.score === opp.total
        ? t('results.draw')
        : t('results.lost', { name: oppName })
    : s.stars >= 3
      ? t('results.great')
      : s.stars > 0
        ? t('results.good')
        : t('results.tryAgain');
  const capped = s.stars > 0 && s.xp === 0 && s.coins === 0;
  const items = g.run ? reviewOf(g.run, t as never) : [];
  const right = items.filter((i) => i.correct).length;
  const canNext = level < MAX_LEVEL && s.nextLevelUnlocked;
  const next = levelKey(level + 1);
  return (
    <GameBackground>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[column, styles.result]} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn.duration(200)} style={styles.head}>
            <GameCover game={game} size={56} />
            <Text style={styles.eyebrow}>
              {`${t(`english.${game}.name`)} · ${t('ui.levelName', { level, name: t(`levels.names.${levelKey(level)}`) })}`.toUpperCase()}
            </Text>
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            <View style={styles.stars} accessible accessibilityLabel={t('results.stars', { count: s.stars })}>
              {[0, 1, 2].map((i) => (
                <Animated.View key={i} entering={ZoomIn.delay(150 + i * 120).duration(220)}>
                  <Ionicons name={i < s.stars ? 'star' : 'star-outline'} size={34} color={i < s.stars ? '#E2A100' : W.lineStrong} />
                </Animated.View>
              ))}
            </View>
            <Text style={styles.starsText}>{t('results.stars', { count: s.stars })}</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(250).duration(220)} style={styles.card}>
            <Fact label={t('results.score')} value={String(s.score)} big />
            {opp ? (
              <Fact label={oppName} value={String(opp.total)} />
            ) : (
              items.length > 0 && <Fact label={t('results.right')} value={`${right}/${items.length}`} />
            )}
            <Fact
              label={s.newBest && s.score > 0 ? t('results.newBest') : t('results.bestLabel')}
              value={String(Math.max(s.best.score, s.score))}
            />
          </Animated.View>

          {(s.xp > 0 || s.coins > 0) && (
            <View style={styles.rewards}>
              {s.xp > 0 && (
                <View style={styles.reward}>
                  <Ionicons name="flash" size={16} color={W.focus} />
                  <Text style={styles.rewardText}>{t('results.xp', { count: s.xp })}</Text>
                </View>
              )}
              {s.coins > 0 && (
                <View style={styles.reward}>
                  <Ionicons name="ellipse" size={14} color="#E2A100" />
                  <Text style={styles.rewardText}>{t('results.coins', { count: s.coins })}</Text>
                </View>
              )}
            </View>
          )}
          {capped && <Text style={styles.note}>{t('results.capped')}</Text>}
          {canNext && level + 1 > OPEN_LEVELS && s.stars > 0 && (
            <View style={styles.unlocked}>
              <Ionicons name="lock-open-outline" size={18} color={W.correct} />
              <Text style={{ fontFamily: Fonts.bold, color: W.correct }}>{t('results.unlocked', { level: level + 1 })}</Text>
            </View>
          )}

          <View style={{ gap: 10 }}>
            {canNext && (
              <PrimaryButton
                title={`${t('results.next')}: ${t(`levels.names.${next}`)} (${CEFR[level]})`}
                icon="arrow-forward"
                onPress={() => router.replace(playHref(game, level + 1))}
              />
            )}
            {canNext ? (
              <SecondaryButton title={t('results.replay')} icon="refresh" onPress={() => void g.start()} />
            ) : (
              <PrimaryButton title={t('results.replay')} icon="refresh" onPress={() => void g.start()} />
            )}
            <Pressable onPress={() => router.back()} accessibilityRole="button" style={styles.link} hitSlop={8}>
              <Text style={styles.linkText}>{t('results.back')}</Text>
            </Pressable>
          </View>

          {items.length > 0 && (
            <View style={{ gap: 8 }}>
              <Text style={styles.eyebrow}>{t('results.review').toUpperCase()}</Text>
              <View style={styles.list}>
                {items.map((item, k) => (
                  <View key={item.key} style={[styles.item, k > 0 && styles.itemLine]}>
                    <Ionicons
                      name={item.correct ? 'checkmark-circle' : 'close-circle'}
                      size={20}
                      color={item.correct ? W.correct : W.wrong}
                      accessibilityLabel={item.correct ? t('ui.correct') : t('ui.wrong')}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemMain}>{item.main}</Text>
                      {!!item.detail && <Text style={styles.itemDetail}>{item.detail}</Text>}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GameBackground>
  );
}

function Fact({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={{ fontFamily: FONT, fontSize: big ? 30 : 24, color: W.ink, fontVariant: ['tabular-nums'] }}>{value}</Text>
      <Text style={{ fontFamily: Fonts.semibold, fontSize: 13, color: W.muted, textAlign: 'center' }} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 110,
    maxWidth: 520,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: W.ink,
  },
  result: { padding: 20, gap: 20, paddingBottom: 40 },
  head: { alignItems: 'center', gap: 8, paddingTop: 8 },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted, textAlign: 'center' },
  title: { fontFamily: FONT, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: W.ink, textAlign: 'center' },
  stars: { flexDirection: 'row', gap: 8, marginTop: 4 },
  starsText: { fontFamily: Fonts.semibold, fontSize: 14, color: W.inkSoft },
  card: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
  },
  rewards: { flexDirection: 'row', justifyContent: 'center', gap: 10, flexWrap: 'wrap' },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
  },
  rewardText: { fontFamily: Fonts.bold, fontSize: 14, color: W.ink },
  note: { fontFamily: Fonts.regular, fontSize: 14, color: W.inkSoft, textAlign: 'center' },
  unlocked: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  link: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 16, minHeight: 44, justifyContent: 'center' },
  linkText: { fontFamily: Fonts.bold, fontSize: 15, color: W.inkSoft, textDecorationLine: 'underline' },
  list: { borderRadius: 14, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  item: { flexDirection: 'row', gap: 10, padding: 12, alignItems: 'flex-start' },
  itemLine: { borderTopWidth: 1, borderTopColor: W.line },
  itemMain: { fontFamily: Fonts.bold, fontSize: 15, color: W.ink, letterSpacing: 0.3 },
  itemDetail: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: W.inkSoft },
});
