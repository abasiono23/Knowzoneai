import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameBack, Stars, Wallet } from '@/components/world/world-ui';
import { Button, ProgressBar, Text } from '@/components/ui';
import { Colors, Radius, Spacing, WorldGradients } from '@/constants/theme';
import { WORLDS } from '@/lib/world/content';
import { useWorld } from '@/lib/world/store';

/** Screen 132: pick a world, one big card at a time. */
export default function WorldSelectScreen() {
  const { t } = useTranslation('world');
  const { width } = useWindowDimensions();
  const pageW = Math.min(width, 560);
  const cardW = pageW - Spacing.lg * 2;
  const { isWorldUnlocked, worldStars, totalStars, collected } = useWorld();
  const [page, setPage] = useState(0);
  const world = WORLDS[page];
  const open = isWorldUnlocked(world);
  const stars = worldStars(world.id);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setPage(Math.max(0, Math.min(WORLDS.length - 1, Math.round(e.nativeEvent.contentOffset.x / (cardW + Spacing.sm)))));

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={[WorldGradients[world.id][0], Colors.backgroundDeep]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.top}>
          <GameBack />
          <Text variant="heading">{t('select.title')}</Text>
          <Wallet compact />
        </View>
        <ScrollView
          horizontal
          snapToInterval={cardW + Spacing.sm}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={32}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.sm }}
          style={{ flexGrow: 0, width: pageW, alignSelf: 'center' }}>
          {WORLDS.map((w) => {
            const ok = isWorldUnlocked(w);
            return (
              <LinearGradient
                key={w.id}
                colors={ok ? WorldGradients[w.id] : ['#2A3060', '#141A3E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.card, { width: cardW }]}>
                <Text style={[styles.emoji, !ok && { opacity: 0.3 }]}>{w.emoji}</Text>
                {!ok && (
                  <View style={styles.lock}>
                    <Ionicons name="lock-closed" size={14} color={Colors.text} />
                    <Text variant="label">{t('select.starsToUnlock', { count: w.unlockStars })}</Text>
                  </View>
                )}
                <Text variant="display" color="#fff" center>
                  {w.name}
                </Text>
                <Text color="rgba(255,255,255,0.85)" center>
                  {w.tagline}
                </Text>
                <View style={styles.subjects}>
                  {w.subjects.map((s) => (
                    <View key={s} style={styles.subject}>
                      <Text variant="small" style={{ fontSize: 12 }}>
                        {s}
                      </Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            );
          })}
        </ScrollView>
        <View style={styles.dots}>
          {WORLDS.map((w, k) => (
            <View key={w.id} style={[styles.dot, k === page && styles.dotOn]} />
          ))}
        </View>
        <View style={styles.info}>
          {open ? (
            <>
              <View style={styles.row}>
                <Stars value={Math.round((stars / 18) * 3)} size={18} />
                <Text variant="small" color={Colors.textSecondary}>
                  {t('select.progress', { stars, collected: collected(world).length })}
                </Text>
              </View>
              <ProgressBar progress={stars / 18} height={6} />
            </>
          ) : (
            <>
              <Text variant="small" color={Colors.textSecondary} center>
                {t('select.have', { have: totalStars, count: world.unlockStars })}
              </Text>
              <ProgressBar progress={totalStars / world.unlockStars} height={6} />
            </>
          )}
          <Button
            title={open ? t('select.enter', { world: world.name }) : t('select.locked')}
            icon={open ? 'enter' : 'lock-closed'}
            disabled={!open}
            onPress={() => router.push(`/world/${world.id}` as Href)}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  card: {
    height: 420,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  emoji: { fontSize: 110, lineHeight: 128 },
  lock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  subjects: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  subject: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: Spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.borderStrong },
  dotOn: { width: 22, backgroundColor: Colors.reward },
  info: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
    marginTop: 'auto',
    paddingBottom: Spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
});
