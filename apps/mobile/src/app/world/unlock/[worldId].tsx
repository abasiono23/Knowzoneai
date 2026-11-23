import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { column, FONT, GameBackground, PrimaryButton, W } from '@/components/games/ui';
import { WORLD_ACCENT, WorldCover } from '@/components/world/world-cover';
import { GameBack, Meter, STAR, worldHref } from '@/components/world/world-ui';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { getWorld } from '@/lib/world/content';
import { useWorld } from '@/lib/world/store';

/** A world just unlocked (a short welcome), or still locked (how many stars it takes). */
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
      <GameBackground>
        <SafeAreaView style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
          <PrimaryButton title={t('levelRoute.backToMap')} onPress={() => router.replace('/play')} />
        </SafeAreaView>
      </GameBackground>
    );

  const need = Math.max(0, world.unlockStars - totalStars);
  return (
    <GameBackground>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <View style={[column, { paddingHorizontal: 16, paddingTop: 8 }]}>
          <GameBack />
        </View>
        <ScrollView contentContainerStyle={[column, styles.page]}>
          <Animated.View entering={FadeIn.duration(220)} style={{ alignItems: 'center', gap: 12 }}>
            <WorldCover world={world.id} size={112} locked={!open} />
            <View style={[styles.kicker, open && { backgroundColor: W.correctSoft }]}>
              <Ionicons name={open ? 'lock-open-outline' : 'lock-closed-outline'} size={14} color={open ? W.correct : W.inkSoft} />
              <Text style={[styles.kickerText, open && { color: W.correct }]}>{open ? t('adv.unlocked') : t('adv.locked')}</Text>
            </View>
            <Text style={styles.title} accessibilityRole="header">
              {world.name}
            </Text>
            <Text style={styles.body}>{world.tagline}</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).duration(220)} style={styles.card}>
            {open ? (
              <Text style={styles.body}>{world.story}</Text>
            ) : (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="star" size={16} color={STAR} />
                  <Text style={styles.strong}>{t('adv.starsProgress', { have: Math.min(totalStars, world.unlockStars), need: world.unlockStars })}</Text>
                </View>
                <Meter value={totalStars / world.unlockStars} color={WORLD_ACCENT[world.id]} />
                <Text style={styles.body}>{t('adv.needMore', { count: need })}</Text>
              </>
            )}
            <View style={styles.tags}>
              {world.subjects.map((s) => (
                <View key={s} style={styles.tag}>
                  <Text style={styles.tagText}>{s}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <View style={{ gap: 10 }}>
            {open ? (
              <PrimaryButton title={t('select.enter', { world: world.name })} icon="arrow-forward" onPress={() => router.replace(worldHref(world.id))} />
            ) : (
              <PrimaryButton title={t('adv.seeAllWorlds')} icon="map-outline" onPress={() => router.replace('/world/select')} />
            )}
            <Pressable onPress={() => router.replace('/play')} accessibilityRole="button" style={styles.link}>
              <Text style={styles.linkText}>{t('levelRoute.backToMap')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GameBackground>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, gap: 20, paddingBottom: 40 },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: W.given },
  kickerText: { fontFamily: Fonts.bold, fontSize: 12, letterSpacing: 0.8, color: W.inkSoft },
  title: { fontFamily: FONT, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: W.ink, textAlign: 'center' },
  body: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: W.inkSoft, textAlign: 'center' },
  strong: { fontFamily: Fonts.bold, fontSize: 15, color: W.ink },
  card: { gap: 12, padding: 16, borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: W.given },
  tagText: { fontFamily: Fonts.semibold, fontSize: 12, color: W.inkSoft },
  link: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 16, minHeight: 44, justifyContent: 'center' },
  linkText: { fontFamily: Fonts.bold, fontSize: 15, color: W.inkSoft, textDecorationLine: 'underline' },
});
