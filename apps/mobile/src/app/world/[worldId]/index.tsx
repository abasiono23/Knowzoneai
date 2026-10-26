import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router, useLocalSearchParams, type Href } from 'expo-router';
import { Trans, useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { ProgressRing } from '@/components/courses/progress-ring';
import { levelHref, Stars, Wallet } from '@/components/world/world-ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing, WorldGradients } from '@/constants/theme';
import { getWorld } from '@/lib/world/content';
import { levelsOf } from '@/lib/world/levels';
import { useWorld } from '@/lib/world/store';
import { KIND_INFO } from '@/lib/world/types';

/** Screen 133: one world: its story, progress, levels, boss and collectibles. */
export default function WorldDetailScreen() {
  const { t } = useTranslation('world');
  const { t: tg } = useTranslation('games');
  const { worldId } = useLocalSearchParams<{ worldId: string }>();
  const world = getWorld(worldId);
  const { best, worldStars, collected, isWorldUnlocked, isLevelUnlocked } = useWorld();
  if (!world)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader title={t('detail.notFound')} />
        <Button title={t('levelRoute.backToMap')} onPress={() => router.replace('/play')} />
      </Screen>
    );
  if (!isWorldUnlocked(world)) return <Redirect href={`/world/unlock/${world.id}` as Href} />;
  const levels = levelsOf(world.id);
  const stars = worldStars(world.id);
  const next =
    levels.find((l) => !(best[l.id]?.stars ?? 0) && isLevelUnlocked(l)) ??
    levels.find((l) => (best[l.id]?.stars ?? 0) < 3);
  const have = collected(world);
  const bossBeaten = (best[`${world.id}-6`]?.stars ?? 0) > 0;
  const colors = WorldGradients[world.id];

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('detail.eyebrow')} right={<Wallet compact />} />
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Animated.Text entering={ZoomIn.springify()} style={styles.emoji}>
          {world.emoji}
        </Animated.Text>
        <Text variant="display" color="#fff" center>
          {world.name}
        </Text>
        <Text color="rgba(255,255,255,0.9)" center>
          {world.story}
        </Text>
      </LinearGradient>

      <Card style={styles.progress}>
        <ProgressRing progress={stars / 18} size={96} stroke={9} colors={[Colors.reward, '#FF9F43']}>
          <Text variant="heading">{stars}</Text>
          <Text variant="small" color={Colors.textMuted} style={{ fontSize: 10 }}>
            {t('detail.ofStars')}
          </Text>
        </ProgressRing>
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="bodyStrong">
            {stars === 18 ? t('detail.mastered') : bossBeaten ? t('detail.bossDefeated') : t('detail.progress')}
          </Text>
          <Text variant="small" color={Colors.textSecondary}>
            {t('detail.summary', {
              cleared: levels.filter((l) => (best[l.id]?.stars ?? 0) > 0).length,
              collected: have.length,
            })}
          </Text>
          {next && (
            <Button
              title={
                best[next.id]
                  ? t('detail.improve', { number: next.number })
                  : t('detail.playLevel', { number: next.number })
              }
              icon="play"
              onPress={() => router.push(levelHref(next))}
            />
          )}
        </View>
      </Card>

      {world.id === 'language' && (
        <Button
          variant="secondary"
          icon="game-controller"
          title={tg('hub.entryTitle')}
          onPress={() => router.push('/world/english' as Href)}
        />
      )}

      <Button
        variant="secondary"
        icon="map"
        title={t('detail.openMap')}
        onPress={() => router.push(`/world/${world.id}/levels` as Href)}
      />

      <View style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('detail.levels')}</Text>
        {levels.map((l) => {
          const k = KIND_INFO[l.kind];
          const b = best[l.id];
          const unlocked = isLevelUnlocked(l);
          return (
            <Card key={l.id} style={[styles.level, !unlocked && { opacity: 0.5 }]}>
              <View style={[styles.levelIcon, { backgroundColor: k.color + '22' }]}>
                <Ionicons
                  name={unlocked ? k.icon : 'lock-closed'}
                  size={20}
                  color={unlocked ? k.color : Colors.textMuted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="label" color={Colors.textMuted}>
                  {t('detail.levelKind', { number: l.number, kind: k.label.toUpperCase() })}
                </Text>
                <Text variant="bodyStrong">{l.kind === 'boss' ? world.boss.name : l.title}</Text>
              </View>
              <Stars value={b?.stars ?? 0} size={14} />
            </Card>
          );
        })}
      </View>

      <Card style={[styles.boss, bossBeaten && { borderColor: Colors.success + '66' }]}>
        <Text style={{ fontSize: 44 }}>{world.boss.emoji}</Text>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="label" color={bossBeaten ? Colors.success : Colors.danger}>
            {bossBeaten ? t('detail.bossDefeatedBadge') : t('detail.finalBoss')}
          </Text>
          <Text variant="bodyStrong">{world.boss.name}</Text>
          <Text variant="small" color={Colors.textSecondary} style={{ fontStyle: 'italic' }}>
            {t('detail.quote', { text: world.boss.taunt })}
          </Text>
        </View>
      </Card>

      <View style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('inventory.collectibles')}</Text>
        <View style={styles.collect}>
          {world.collectibles.map((c) => {
            const got = have.includes(c.id);
            return (
              <View key={c.id} style={[styles.item, got && styles.got]}>
                <Text style={{ fontSize: 30, opacity: got ? 1 : 0.2 }}>{got ? c.emoji : '❔'}</Text>
                <Text
                  variant="small"
                  center
                  numberOfLines={2}
                  style={{ fontSize: 11 }}
                  color={got ? Colors.text : Colors.textMuted}>
                  {got ? c.name : t('detail.starsNeeded', { count: c.atStars })}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <Card style={styles.rival}>
        <Text style={{ fontSize: 30 }}>{world.rival.emoji}</Text>
        <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
          <Trans
            t={t}
            i18nKey="detail.rival"
            values={{ name: world.rival.name }}
            components={{ b: <Text variant="small" style={{ fontFamily: 'Manrope_700Bold' }} /> }}
          />
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.xs, padding: Spacing.lg, borderRadius: Radius.xl },
  emoji: { fontSize: 80, lineHeight: 96 },
  progress: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  level: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  levelIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  boss: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderColor: Colors.danger + '55' },
  collect: { flexDirection: 'row', gap: Spacing.xs },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  got: { borderColor: Colors.reward + '88', backgroundColor: Colors.rewardSoft },
  rival: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
