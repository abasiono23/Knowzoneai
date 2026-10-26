import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { LevelRoute, type LoadedLevel } from '@/components/world/level-route';
import { levelHref, Stars } from '@/components/world/world-ui';
import { Button, Card, Screen, Text } from '@/components/ui';
import { Colors, Radius, Spacing, WorldGradients } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { DAILY_ID, describeMistake, getLevel, levelsOf } from '@/lib/world/levels';
import { useWorld } from '@/lib/world/store';

/** Screen 146: how the level went, with your mistakes to revisit. */
export default function LevelResultsScreen() {
  return (
    <LevelRoute skipTutorial allowLocked>
      {(l) => <Results level={l} />}
    </LevelRoute>
  );
}

function Results({ level }: { level: LoadedLevel }) {
  const { t } = useTranslation('world');
  const p = useLocalSearchParams<{
    run?: string;
    fresh?: string;
    unlocked?: string;
    ach?: string;
    rival?: string;
    rivalPoints?: string;
  }>();
  const { lastRun, best } = useWorld();
  const run = lastRun(level.id, p.run);
  const daily = level.id === DAILY_ID;

  if (!run)
    return (
      <Screen withTabBar={false}>
        <Text variant="title">{t('results.none')}</Text>
        <Button title={t('results.playLevel')} onPress={() => router.replace(levelHref(level))} />
      </Screen>
    );

  const passed = run.stars > 0;
  const battle = level.kind === 'battle';
  const won = battle && run.correct > (run.rivalScore ?? 0);
  const draw = battle && run.correct === run.rivalScore;
  const nextLevel = !daily && level.number < 6 ? getLevel(levelsOf(level.worldId)[level.number].id) : undefined;
  const acc = run.total ? Math.round((run.correct / run.total) * 100) : 0;
  const mistakes = run.mistakes.map((id) => ({ id, m: describeMistake(id) })).filter((x) => !!x.m);
  const canReview = (level.kind === 'mission' || level.kind === 'boss' || daily) && run.mistakes.length > 0;
  const showComplete = p.fresh === '1' && run.firstClear;
  const headline = battle
    ? won
      ? t('results.won')
      : draw
        ? t('results.draw')
        : t('results.rivalWins', { rival: p.rival ?? level.world.rival.name })
    : passed
      ? run.stars === 3
        ? t('results.perfect')
        : level.kind === 'boss'
          ? t('results.bossDefeated', { boss: level.world.boss.name })
          : t('results.cleared')
      : level.kind === 'boss'
        ? t('results.bossWins', { boss: level.world.boss.name })
        : t('results.soClose');

  const colors = WorldGradients[level.worldId];
  return (
    <Screen withTabBar={false}>
      <LinearGradient colors={[passed ? colors[0] : '#3A1F2E', Colors.surface]} style={styles.hero}>
        <Text variant="label" color="rgba(255,255,255,0.8)">
          {daily
            ? t('play.dailyEyebrow')
            : t('results.eyebrow', { world: level.world.name.toUpperCase(), number: level.number })}
        </Text>
        <Animated.View entering={ZoomIn.duration(400)}>
          <Text style={styles.emoji}>
            {passed ? (battle ? '🏆' : run.stars === 3 ? '🌟' : '🎉') : battle ? '⚔️' : '💪'}
          </Text>
        </Animated.View>
        <Text variant="title" center>
          {headline}
        </Text>
        <Stars value={run.stars} size={38} animate />
        {battle && (
          <View style={styles.vs}>
            <View style={styles.vsSide}>
              <Text variant="label" color={Colors.primary}>
                {t('battle.you')}
              </Text>
              <Text variant="display">{run.correct}</Text>
            </View>
            <Text variant="heading" color={Colors.textMuted}>
              –
            </Text>
            <View style={styles.vsSide}>
              <Text variant="label" color={Colors.danger}>
                {(p.rival ?? level.world.rival.name).toUpperCase()}
              </Text>
              <Text variant="display">{run.rivalScore ?? 0}</Text>
            </View>
          </View>
        )}
        {!passed && (
          <Text variant="small" color={Colors.textSecondary} center>
            {battle
              ? t('results.failBattle')
              : level.kind === 'sprint'
                ? t('results.failSprint')
                : t('results.failMission')}
          </Text>
        )}
      </LinearGradient>

      <View style={styles.stats}>
        <Stat icon="trophy" label={t('results.score')} value={formatNumber(run.score)} />
        <Stat
          icon="checkmark-done"
          label={level.kind === 'sprint' ? t('results.right') : t('results.accuracy')}
          value={level.kind === 'sprint' ? formatNumber(run.correct) : t('results.percent', { value: acc })}
        />
        <Stat
          icon="time"
          label={t('results.time')}
          value={`${Math.floor(run.seconds / 60)}:${String(run.seconds % 60).padStart(2, '0')}`}
        />
      </View>

      <Card style={styles.rewards}>
        <Text variant="label" color={Colors.textMuted}>
          {t('results.rewards')}
        </Text>
        <View style={styles.rewardRow}>
          <Animated.View entering={FadeInDown.delay(500)} style={styles.reward}>
            <Ionicons name="flash" size={18} color={Colors.primary} />
            <Text variant="heading">{t('results.xp', { xp: run.xp })}</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(650)} style={styles.reward}>
            <View style={styles.coin}>
              <Text style={{ fontSize: 11, color: '#7A4B00', fontFamily: 'Manrope_800ExtraBold' }}>K</Text>
            </View>
            <Text variant="heading">{t('play.gain', { count: run.coins })}</Text>
          </Animated.View>
        </View>
        {!daily && (best[level.id]?.plays ?? 0) > 1 && run.xp <= 5 && (
          <Text variant="small" color={Colors.textMuted}>
            {t('results.replayNote', { stars: best[level.id]?.stars ?? 0 })}
          </Text>
        )}
        {daily && run.xp === 0 && (
          <Text variant="small" color={Colors.textMuted}>
            {t('results.dailyClaimed')}
          </Text>
        )}
        {run.hintsUsed > 0 && (
          <Text variant="small" color={Colors.textMuted}>
            {t('results.hintsUsed', { count: run.hintsUsed })}
          </Text>
        )}
      </Card>

      {mistakes.length > 0 && (
        <Card style={{ gap: Spacing.sm }}>
          <Text variant="heading">{t('results.mistakes')}</Text>
          {mistakes.slice(0, 8).map(({ id, m }) => (
            <View key={id} style={styles.mistake}>
              <Text variant="small" style={{ fontFamily: 'Manrope_600SemiBold' }}>
                {m!.prompt}
              </Text>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                <Text variant="small" color={Colors.success} style={{ flex: 1 }}>
                  {m!.answer}
                </Text>
              </View>
              <Text variant="small" color={Colors.textSecondary} style={{ fontSize: 12 }}>
                {m!.why}
              </Text>
            </View>
          ))}
          {canReview && (
            <Button
              variant="secondary"
              icon="school"
              title={t('results.practise')}
              onPress={() =>
                router.push({ pathname: '/world/play/[levelId]', params: { levelId: level.id, review: '1' } })
              }
            />
          )}
        </Card>
      )}

      <View style={{ gap: Spacing.sm }}>
        {showComplete ? (
          <Button
            title={t('results.collect')}
            icon="gift"
            onPress={() =>
              router.replace({
                pathname: '/world/complete/[levelId]',
                params: { levelId: level.id, run: run.id, unlocked: p.unlocked ?? '', ach: p.ach ?? '' },
              })
            }
          />
        ) : passed && nextLevel ? (
          <Button
            title={t('results.next', { title: nextLevel.title })}
            icon="arrow-forward"
            onPress={() => router.replace(levelHref(nextLevel))}
          />
        ) : null}
        <Button
          variant={passed ? 'secondary' : 'primary'}
          icon="refresh"
          title={
            passed
              ? t('levels.playAgain')
              : battle
                ? t('battle.rematch')
                : t('actions.retry', { ns: 'common' })
          }
          onPress={() => router.replace(levelHref(level))}
        />
        <Button
          variant="ghost"
          title={daily ? t('results.backToDaily') : t('results.backTo', { world: level.world.name })}
          onPress={() => router.replace((daily ? '/world/daily' : `/world/${level.worldId}/levels`) as Href)}
        />
      </View>
    </Screen>
  );
}

function Stat({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <Card style={styles.stat}>
      <Ionicons name={icon} size={18} color={Colors.reward} />
      <Text variant="heading">{value}</Text>
      <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
        {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emoji: { fontSize: 64, lineHeight: 76 },
  vs: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  vsSide: { alignItems: 'center' },
  stats: { flexDirection: 'row', gap: Spacing.xs },
  stat: { flex: 1, alignItems: 'center', gap: 2, padding: Spacing.sm },
  rewards: { gap: Spacing.sm },
  rewardRow: { flexDirection: 'row', gap: Spacing.sm },
  reward: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceRaised,
  },
  coin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.reward,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mistake: { gap: 3, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
});
