import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { column, FONT, GameBackground, PrimaryButton, SecondaryButton, W } from '@/components/games/ui';
import { LevelRoute, type LoadedLevel } from '@/components/world/level-route';
import { useLevelNames } from '@/components/world/play-frame';
import { WorldCover } from '@/components/world/world-cover';
import { Coin, levelHref, STAR } from '@/components/world/world-ui';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { levelKey } from '@/lib/games/english';
import { getWorld } from '@/lib/world/content';
import { useBank } from '@/lib/world/bank';
import { bankTier, DAILY_ID, describeMistake, levelsOf, MAX_LEVEL, OPEN_LEVELS } from '@/lib/world/levels';
import { ACHIEVEMENTS } from '@/lib/world/progress';
import { useWorld } from '@/lib/world/store';

/**
 * How the level went: the verdict and stars, score / right / best, rewards, anything newly unlocked or
 * won, what to do next, and a review of the questions you missed.
 */
export default function LevelResultsScreen() {
  return (
    <LevelRoute skipTutorial allowLocked>
      {(l) => <Results level={l} />}
    </LevelRoute>
  );
}

function Results({ level }: { level: LoadedLevel }) {
  const { t } = useTranslation('world');
  const { t: tg } = useTranslation('games');
  const p = useLocalSearchParams<{ run?: string; fresh?: string; unlocked?: string; ach?: string; rival?: string }>();
  const { lastRun, best, worldStars, isLevelUnlocked } = useWorld();
  const run = lastRun(level.id, p.run);
  const names = useLevelNames(level);
  const daily = level.id === DAILY_ID;
  // The level's questions, so the review below can show what was missed (it re-renders once loaded).
  useBank(level.worldId, bankTier(level));

  if (!run)
    return (
      <GameBackground>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 16 }}>
          <Text style={styles.title}>{t('results.none')}</Text>
          <PrimaryButton title={t('results.playLevel')} onPress={() => router.replace(levelHref(level))} />
        </SafeAreaView>
      </GameBackground>
    );

  const passed = run.stars > 0;
  const battle = level.kind === 'battle';
  const rival = p.rival ?? level.world.rival.name;
  const won = battle && run.correct > (run.rivalScore ?? 0);
  const draw = battle && run.correct === run.rivalScore;
  const next = !daily && level.number < MAX_LEVEL ? levelsOf(level.worldId)[level.number] : undefined;
  const canNext = !!next && passed && isLevelUnlocked(next);
  const acc = run.total ? Math.round((run.correct / run.total) * 100) : 0;
  const review = run.mistakes.map((id) => ({ id, m: describeMistake(id) })).filter((x) => !!x.m);
  const canPractise = (level.kind === 'mission' || level.kind === 'boss' || daily) && run.mistakes.length > 0;
  const bestScore = best[level.id]?.score ?? run.score;
  const newBest = !daily && run.score > 0 && run.score >= bestScore && (best[level.id]?.plays ?? 0) > 1;
  const headline = battle
    ? won
      ? t('results.won')
      : draw
        ? t('results.draw')
        : t('results.rivalWins', { rival })
    : passed
      ? run.stars === 3
        ? t('results.perfect')
        : t('results.cleared')
      : t('results.soClose');

  // What this run unlocked or won.
  const fresh = p.fresh === '1';
  const stars = worldStars(level.worldId);
  const found = fresh && !daily ? level.world.collectibles.filter((c) => c.atStars <= stars && c.atStars > stars - run.stars) : [];
  const achievements = fresh
    ? (p.ach ?? '')
        .split(',')
        .filter(Boolean)
        .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
        .filter((a) => !!a)
    : [];
  const worlds = fresh
    ? (p.unlocked ?? '')
        .split(',')
        .filter(Boolean)
        .map(getWorld)
        .filter((w) => !!w)
    : [];
  const replayTitle: string = battle && !passed ? t('battle.rematch') : tg('results.replay');
  const opened = fresh && canNext && next!.number > OPEN_LEVELS && run.firstClear;

  return (
    <GameBackground>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[column, styles.page]} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn.duration(200)} style={styles.head}>
            <WorldCover world={level.worldId} size={56} />
            <Text style={styles.eyebrow}>{`${names.title} · ${names.subtitle}`.toUpperCase()}</Text>
            <Text style={styles.title} accessibilityRole="header">
              {headline}
            </Text>
            <View style={styles.stars} accessible accessibilityLabel={t('hud.stars', { value: run.stars, max: 3 })}>
              {[0, 1, 2].map((i) => (
                <Animated.View key={i} entering={ZoomIn.delay(150 + i * 120).duration(220)}>
                  <Ionicons name={i < run.stars ? 'star' : 'star-outline'} size={34} color={i < run.stars ? STAR : W.lineStrong} />
                </Animated.View>
              ))}
            </View>
            {!passed && (
              <Text style={styles.note}>
                {battle ? t('results.failBattle') : level.kind === 'sprint' ? t('results.failSprint') : t('results.failMission')}
              </Text>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(220)} style={styles.card}>
            <Fact label={tg('results.score')} value={formatNumber(run.score)} big />
            {battle ? (
              <Fact label={`${t('battle.you')} – ${rival}`} value={`${run.correct} – ${run.rivalScore ?? 0}`} />
            ) : level.kind === 'sprint' ? (
              <Fact label={tg('results.right')} value={`${run.correct}/${run.total}`} />
            ) : (
              <Fact label={t('adv.accuracy')} value={`${acc}%`} />
            )}
            <Fact label={newBest ? tg('results.newBest') : tg('results.bestLabel')} value={formatNumber(Math.max(bestScore, run.score))} />
          </Animated.View>

          <View style={styles.rewards}>
            <View style={styles.reward}>
              <Ionicons name="flash" size={16} color={W.focus} />
              <Text style={styles.rewardText}>{t('results.xp', { xp: run.xp })}</Text>
            </View>
            <View style={styles.reward}>
              <Coin size={15} />
              <Text style={styles.rewardText}>{tg('results.coins', { count: run.coins })}</Text>
            </View>
          </View>
          {!daily && (best[level.id]?.plays ?? 0) > 1 && run.xp <= 5 && (
            <Text style={styles.note}>{t('results.replayNote', { stars: best[level.id]?.stars ?? 0 })}</Text>
          )}
          {daily && run.xp === 0 && <Text style={styles.note}>{t('results.dailyClaimed')}</Text>}
          {run.hintsUsed > 0 && <Text style={styles.note}>{t('adv.hintsNote', { count: run.hintsUsed })}</Text>}

          {(opened || found.length > 0 || achievements.length > 0 || worlds.length > 0) && (
            <View style={styles.list}>
              {opened && <Won icon="lock-open-outline" title={tg('results.unlocked', { level: next!.number })} detail={tg(`levels.names.${levelKey(next!.number)}`)} />}
              {worlds.map((w) => (
                <Won key={w.id} icon="map-outline" title={t('adv.worldOpened', { world: w.name })} detail={w.tagline} />
              ))}
              {found.map((c) => (
                <Won key={c.id} icon="ribbon-outline" title={t('adv.collectibleFound', { name: c.name })} detail={c.description} />
              ))}
              {achievements.map((a) => (
                <Won key={a.id} icon="medal-outline" title={t('adv.achievementWon', { name: a.name })} detail={a.description} />
              ))}
            </View>
          )}

          <View style={{ gap: 10 }}>
            {canNext && (
              <PrimaryButton
                title={`${tg('results.next')}: ${tg('ui.levelName', { level: next!.number, name: tg(`levels.names.${levelKey(next!.number)}`) })}`}
                icon="arrow-forward"
                onPress={() => router.replace(levelHref(next!))}
              />
            )}
            {canNext ? (
              <SecondaryButton title={tg('results.replay')} icon="refresh" onPress={() => router.replace(levelHref(level))} />
            ) : (
              <PrimaryButton title={replayTitle} icon="refresh" onPress={() => router.replace(levelHref(level))} />
            )}
            <Pressable
              onPress={() => router.replace(String(daily ? '/world/daily' : `/world/${level.worldId}/levels`) as Href)}
              accessibilityRole="button"
              style={styles.link}
              hitSlop={8}>
              <Text style={styles.linkText}>{daily ? t('results.backToDaily') : t('results.backTo', { world: level.world.name })}</Text>
            </Pressable>
          </View>

          {review.length > 0 && (
            <View style={{ gap: 8 }}>
              <Text style={styles.eyebrow}>{tg('results.review').toUpperCase()}</Text>
              <View style={styles.list}>
                {review.map(({ id, m }, k) => (
                  <View key={id} style={[styles.item, k > 0 && styles.itemLine]}>
                    <Ionicons name="close-circle" size={20} color={W.wrong} accessibilityLabel={tg('ui.wrong')} />
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={styles.itemMain}>{m!.prompt}</Text>
                      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start' }}>
                        <Ionicons name="checkmark-circle" size={16} color={W.correct} accessibilityLabel={tg('ui.correct')} />
                        <Text style={[styles.itemDetail, { color: W.correct, fontFamily: Fonts.bold, flex: 1 }]}>{m!.answer}</Text>
                      </View>
                      <Text style={styles.itemDetail}>{m!.why}</Text>
                    </View>
                  </View>
                ))}
              </View>
              {canPractise && (
                <SecondaryButton
                  title={t('results.practise')}
                  icon="school-outline"
                  onPress={() => router.push({ pathname: '/world/play/[levelId]', params: { levelId: level.id, review: '1' } })}
                />
              )}
            </View>
          )}
          {review.length === 0 && run.total > 0 && passed && (
            <View style={[styles.item, styles.list]}>
              <Ionicons name="checkmark-circle" size={20} color={W.correct} />
              <Text style={[styles.itemMain, { flex: 1 }]}>{t('adv.noMistakes')}</Text>
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
      <Text style={{ fontFamily: FONT, fontSize: big ? 30 : 22, color: W.ink, fontVariant: ['tabular-nums'] }}>{value}</Text>
      <Text style={{ fontFamily: Fonts.semibold, fontSize: 13, color: W.muted, textAlign: 'center' }} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

function Won({ icon, title, detail }: { icon: keyof typeof Ionicons.glyphMap; title: string; detail?: string }) {
  return (
    <View style={styles.item}>
      <Ionicons name={icon} size={20} color={W.ink} />
      <View style={{ flex: 1 }}>
        <Text style={styles.itemMain}>{title}</Text>
        {!!detail && <Text style={styles.itemDetail}>{detail}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, gap: 20, paddingBottom: 40 },
  head: { alignItems: 'center', gap: 8, paddingTop: 8 },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted, textAlign: 'center' },
  title: { fontFamily: FONT, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: W.ink, textAlign: 'center' },
  stars: { flexDirection: 'row', gap: 8, marginTop: 4 },
  card: { flexDirection: 'row', paddingVertical: 18, paddingHorizontal: 8, borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
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
  note: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: W.inkSoft, textAlign: 'center' },
  link: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 16, minHeight: 44, justifyContent: 'center' },
  linkText: { fontFamily: Fonts.bold, fontSize: 15, color: W.inkSoft, textDecorationLine: 'underline' },
  list: { borderRadius: 14, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  item: { flexDirection: 'row', gap: 10, padding: 12, alignItems: 'flex-start' },
  itemLine: { borderTopWidth: 1, borderTopColor: W.line },
  itemMain: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 21, color: W.ink },
  itemDetail: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: W.inkSoft },
});
