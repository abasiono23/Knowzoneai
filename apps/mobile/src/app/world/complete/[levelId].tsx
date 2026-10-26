import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LevelRoute, type LoadedLevel } from '@/components/world/level-route';
import { levelHref, Stars } from '@/components/world/world-ui';
import { Celebration } from '@/components/onboarding/celebration';
import { Button, Text } from '@/components/ui';
import { Colors, Radius, Spacing, WorldGradients } from '@/constants/theme';
import { getWorld } from '@/lib/world/content';
import { DAILY_ID, levelsOf } from '@/lib/world/levels';
import { ACHIEVEMENTS } from '@/lib/world/progress';
import { useWorld } from '@/lib/world/store';
import { KIND_INFO } from '@/lib/world/types';

/** Screen 147: level complete. Rewards, collectibles, achievements and what's unlocked next. */
export default function LevelCompleteScreen() {
  return (
    <LevelRoute skipTutorial allowLocked>
      {(l) => <Complete level={l} />}
    </LevelRoute>
  );
}

function Complete({ level }: { level: LoadedLevel }) {
  const { t } = useTranslation('world');
  const p = useLocalSearchParams<{ run?: string; unlocked?: string; ach?: string }>();
  const { lastRun, worldStars } = useWorld();
  const run = lastRun(level.id, p.run);
  const stars = worldStars(level.worldId);
  const found = run ? level.world.collectibles.filter((c) => c.atStars <= stars && c.atStars > stars - run.stars) : [];
  const achievements = (p.ach ?? '')
    .split(',')
    .filter(Boolean)
    .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
    .filter((a) => !!a);
  const unlocked = (p.unlocked ?? '')
    .split(',')
    .filter(Boolean)
    .map(getWorld)
    .filter((w) => !!w);
  const next = level.id !== DAILY_ID && level.number < 6 ? levelsOf(level.worldId)[level.number] : undefined;
  const mastered = level.kind === 'boss';
  const colors = WorldGradients[level.worldId];

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={[colors[0], colors[1] + '66', Colors.backgroundDeep]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.wrap}>
        <View style={styles.top}>
          <Animated.View entering={ZoomIn.springify()} style={styles.badge}>
            <Text style={{ fontSize: 56 }}>{mastered ? '👑' : level.world.emoji}</Text>
          </Animated.View>
          <Text variant="label" color="rgba(255,255,255,0.85)">
            {t('results.eyebrow', { world: level.world.name.toUpperCase(), number: level.number })}
          </Text>
          <Text variant="display" center>
            {mastered ? t('complete.conquered') : t('complete.title')}
          </Text>
          <Stars value={run?.stars ?? 0} size={34} animate />
          <View style={styles.pills}>
            <View style={styles.pill}>
              <Ionicons name="flash" size={16} color={Colors.primary} />
              <Text variant="bodyStrong">{t('results.xp', { xp: run?.xp ?? 0 })}</Text>
            </View>
            <View style={styles.pill}>
              <View style={styles.coin}>
                <Text style={{ fontSize: 10, color: '#7A4B00', fontFamily: 'Manrope_800ExtraBold' }}>K</Text>
              </View>
              <Text variant="bodyStrong">{t('play.gain', { count: run?.coins ?? 0 })}</Text>
            </View>
          </View>
        </View>

        <View style={{ gap: Spacing.sm }}>
          {found.map((c, k) => (
            <Animated.View key={c.id} entering={FadeInDown.delay(600 + k * 150)} style={styles.card}>
              <Text style={{ fontSize: 32 }}>{c.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text variant="label" color={Colors.reward}>
                  {t('complete.collectible')}
                </Text>
                <Text variant="bodyStrong">{c.name}</Text>
                <Text variant="small" color={Colors.textSecondary}>
                  {c.description}
                </Text>
              </View>
            </Animated.View>
          ))}
          {achievements.map((a, k) => (
            <Animated.View key={a.id} entering={FadeInDown.delay(750 + k * 150)} style={styles.card}>
              <View style={styles.achIcon}>
                <Ionicons name={a.icon} size={22} color={Colors.backgroundDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="label" color={Colors.success}>
                  {t('complete.achievement')}
                </Text>
                <Text variant="bodyStrong">{a.name}</Text>
                <Text variant="small" color={Colors.textSecondary}>
                  {a.grants ? t('complete.withItem', { description: a.description }) : a.description}
                </Text>
              </View>
            </Animated.View>
          ))}
          {next && !unlocked.length && (
            <Animated.View entering={FadeInDown.delay(900)} style={styles.card}>
              <View style={[styles.achIcon, { backgroundColor: KIND_INFO[next.kind].color }]}>
                <Ionicons name={KIND_INFO[next.kind].icon} size={22} color={Colors.backgroundDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="label" color={Colors.primary}>
                  {t('complete.unlockedLevel', { number: next.number })}
                </Text>
                <Text variant="bodyStrong">{next.title}</Text>
                <Text variant="small" color={Colors.textSecondary}>
                  {t('complete.kindBlurb', { kind: KIND_INFO[next.kind].label, blurb: next.blurb })}
                </Text>
              </View>
            </Animated.View>
          )}
        </View>

        <View style={{ gap: Spacing.xs, marginTop: 'auto' }}>
          {unlocked.length > 0 ? (
            <Button
              title={t('complete.newWorld')}
              icon="planet"
              onPress={() => router.replace(`/world/unlock/${unlocked[0].id}` as Href)}
            />
          ) : next ? (
            <Button title={t('detail.playLevel', { number: next.number })} icon="play" onPress={() => router.replace(levelHref(next))} />
          ) : (
            <Button title={t('complete.chooseWorld')} icon="map" onPress={() => router.replace('/world/select')} />
          )}
          <Button
            variant="ghost"
            title={t('levelRoute.backToMap')}
            onPress={() => router.replace(`/world/${level.worldId}/levels` as Href)}
          />
        </View>
      </SafeAreaView>
      <Celebration />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: Spacing.lg, gap: Spacing.lg, maxWidth: 560, width: '100%', alignSelf: 'center' },
  top: { alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.lg },
  badge: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 3,
    borderColor: Colors.reward,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pills: { flexDirection: 'row', gap: Spacing.sm },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  coin: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.reward,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(11,16,38,0.75)',
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  achIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
