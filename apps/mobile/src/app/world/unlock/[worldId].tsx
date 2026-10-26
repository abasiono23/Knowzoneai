import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Celebration } from '@/components/onboarding/celebration';
import { Button, Text } from '@/components/ui';
import { Colors, Radius, Spacing, WorldGradients } from '@/constants/theme';
import { getWorld } from '@/lib/world/content';
import { useWorld } from '@/lib/world/store';

/** Screen 148: a new world unlocked. */
export default function UnlockWorldScreen() {
  const { t } = useTranslation('world');
  const { worldId } = useLocalSearchParams<{ worldId: string }>();
  const world = getWorld(worldId);
  const { markWorldSeen, isWorldUnlocked, totalStars } = useWorld();
  const open = !!world && isWorldUnlocked(world);
  useEffect(() => {
    if (world && open) markWorldSeen(world.id);
  }, [world, open, markWorldSeen]);

  if (!world)
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: Colors.background, padding: Spacing.lg, justifyContent: 'center' }}>
        <Button title={t('levelRoute.backToMap')} onPress={() => router.replace('/play')} />
      </SafeAreaView>
    );

  const colors = WorldGradients[world.id];
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={[colors[1], colors[0], Colors.backgroundDeep]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.wrap}>
        <Animated.Text entering={FadeIn.duration(600)} style={styles.kicker}>
          {open ? t('unlock.unlocked') : t('unlock.locked')}
        </Animated.Text>
        <Animated.View entering={ZoomIn.delay(200).springify().damping(9)} style={styles.portal}>
          <View style={styles.ring}>
            <Text style={{ fontSize: 88, lineHeight: 104 }}>{world.emoji}</Text>
          </View>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(500)} style={{ alignItems: 'center', gap: Spacing.xs }}>
          <Text variant="display" center>
            {world.name}
          </Text>
          <Text color="rgba(255,255,255,0.85)" center>
            {world.tagline}
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(700)} style={styles.story}>
          <Text center>
            {open ? world.story : t('unlock.collect', { count: world.unlockStars, have: totalStars })}
          </Text>
          <View style={styles.tags}>
            {world.subjects.map((s) => (
              <View key={s} style={styles.tag}>
                <Text variant="small" style={{ fontSize: 12 }}>
                  {s}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
        <View style={{ gap: Spacing.xs, marginTop: 'auto', alignSelf: 'stretch' }}>
          {open && (
            <Button
              title={t('select.enter', { world: world.name })}
              icon="enter"
              onPress={() => router.replace(`/world/${world.id}` as Href)}
            />
          )}
          <Button variant="ghost" title={t('levelRoute.backToMap')} onPress={() => router.replace('/play')} />
        </View>
      </SafeAreaView>
      {open && <Celebration />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.lg,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  kicker: {
    marginTop: Spacing.lg,
    color: Colors.reward,
    fontFamily: 'Manrope_800ExtraBold',
    letterSpacing: 3,
    fontSize: 13,
  },
  portal: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 4,
    borderColor: Colors.reward,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  story: {
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
