import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { W } from '@/components/games/ui';
import { WORLD_ACCENT, WorldCover } from '@/components/world/world-cover';
import { Meter, STAR, Wallet, worldStyles } from '@/components/world/world-ui';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { WORLDS } from '@/lib/world/content';
import { WORLD_STARS } from '@/lib/world/levels';
import { useWorld } from '@/lib/world/store';

/** Every world of the adventure: what it covers, your stars in it, or what it takes to open. */
export default function WorldSelectScreen() {
  const { t } = useTranslation('world');
  const { width } = useWindowDimensions();
  const two = width >= 720;
  const { isWorldUnlocked, worldStars, totalStars, collected } = useWorld();

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow="KNOWZONE WORLD" title={t('select.title')} right={<Wallet compact />} />
      <Text style={[worldStyles.body, { marginTop: -8 }]}>{t('adv.selectIntro', { count: totalStars })}</Text>
      <View style={styles.grid}>
        {WORLDS.map((w, k) => {
          const open = isWorldUnlocked(w);
          const stars = worldStars(w.id);
          const need = Math.max(0, w.unlockStars - totalStars);
          return (
            <Animated.View key={w.id} entering={FadeIn.delay(k * 40).duration(200)} style={{ width: two ? '48.8%' : '100%' }}>
              <Pressable
                onPress={() => router.push(String(open ? `/world/${w.id}/levels` : `/world/unlock/${w.id}`) as Href)}
                accessibilityRole="button"
                accessibilityLabel={open ? t('adv.worldA11y', { name: w.name, stars, max: WORLD_STARS }) : t('adv.worldLockedA11y', { name: w.name, count: need })}
                style={({ pressed }) => [styles.card, pressed && { backgroundColor: W.page }]}>
                <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                  <WorldCover world={w.id} size={64} locked={!open} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.name, !open && { color: W.muted }]}>{w.name}</Text>
                    <Text style={worldStyles.small} numberOfLines={2}>
                      {w.tagline}
                    </Text>
                  </View>
                </View>
                <View style={styles.tags}>
                  {w.subjects.map((s) => (
                    <View key={s} style={styles.tag}>
                      <Text style={styles.tagText}>{s}</Text>
                    </View>
                  ))}
                </View>
                {open ? (
                  <View style={{ gap: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="star" size={13} color={STAR} />
                      <Text style={worldStyles.meta}>{t('adv.selectProgress', { stars, max: WORLD_STARS, collected: collected(w).length })}</Text>
                    </View>
                    <Meter value={stars / WORLD_STARS} color={WORLD_ACCENT[w.id]} />
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="lock-closed-outline" size={14} color={W.muted} />
                    <Text style={worldStyles.meta}>{t('adv.needMore', { count: need })}</Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  card: { gap: 12, padding: 16, borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  name: { fontFamily: Fonts.extrabold, fontSize: 18, color: W.ink, letterSpacing: -0.2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: W.given },
  tagText: { fontFamily: Fonts.semibold, fontSize: 12, color: W.inkSoft },
});
