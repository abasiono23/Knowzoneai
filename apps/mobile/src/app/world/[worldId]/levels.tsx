import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, type Href, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { FONT, PrimaryButton, W } from '@/components/games/ui';
import { WORLD_ACCENT, WorldCover } from '@/components/world/world-cover';
import { levelHref, Meter, STAR, Wallet, worldStyles } from '@/components/world/world-ui';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';
import { levelKey } from '@/lib/games/english';
import { getWorld } from '@/lib/world/content';
import { levelsOf, MAX_LEVEL, OPEN_LEVELS, WORLD_STARS } from '@/lib/world/levels';
import { useWorld } from '@/lib/world/store';
import type { Level, World } from '@/lib/world/types';

/**
 * One world of the adventure: its progress, the ten-level ladder from Starter to Super hard, and the
 * collectibles its stars unlock. (It lives at /world/<id>/levels, since some world ids are also the
 * names of other games' pages.)
 */
export default function WorldScreen() {
  const { worldId } = useLocalSearchParams<{ worldId: string }>();
  const world = getWorld(worldId);
  const { isWorldUnlocked, ready } = useWorld();
  if (!world) return <Redirect href="/world/select" />;
  if (ready && !isWorldUnlocked(world)) return <Redirect href={`/world/unlock/${world.id}` as Href} />;
  return <WorldPage world={world} />;
}

function WorldPage({ world }: { world: World }) {
  const { t } = useTranslation('world');
  const { t: tg } = useTranslation('games');
  const { best, worldStars, collected, isLevelUnlocked, markWorldSeen } = useWorld();
  const levels = levelsOf(world.id);
  const stars = worldStars(world.id);
  const cleared = levels.filter((l) => (best[l.id]?.stars ?? 0) > 0).length;
  const have = collected(world);
  const next =
    levels.find((l) => !(best[l.id]?.stars ?? 0) && isLevelUnlocked(l)) ?? levels.find((l) => (best[l.id]?.stars ?? 0) < 3) ?? levels[0];
  const accent = WORLD_ACCENT[world.id];
  useEffect(() => markWorldSeen(world.id), [world.id, markWorldSeen]);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('adv.eyebrow')} right={<Wallet compact />} />
      <Animated.View entering={FadeIn.duration(200)} style={styles.hero}>
        <WorldCover world={world.id} size={76} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={worldStyles.title} accessibilityRole="header">
            {world.name}
          </Text>
          <Text style={worldStyles.body}>{world.subjects.join(' · ')}</Text>
        </View>
      </Animated.View>
      <Text style={worldStyles.body}>{world.tagline}</Text>

      <View style={styles.card}>
        <View style={styles.stats}>
          <Stat icon="star" color={STAR} value={`${stars}/${WORLD_STARS}`} label={t('adv.statStars')} />
          <Stat icon="checkmark-circle-outline" value={`${cleared}/${MAX_LEVEL}`} label={t('adv.statLevels')} />
          <Stat icon="ribbon-outline" value={`${have.length}/${world.collectibles.length}`} label={t('inventory.collectibles')} />
        </View>
        <Meter value={stars / WORLD_STARS} color={accent} />
        <PrimaryButton
          title={`${best[next.id] ? t('detail.improve', { number: next.number }) : t('detail.playLevel', { number: next.number })} · ${tg(`levels.names.${levelKey(next.number)}`)}`}
          icon="arrow-forward"
          onPress={() => router.push(levelHref(next))}
        />
        {world.id === 'language' && (
          <Pressable onPress={() => router.push('/world/english' as Href)} accessibilityRole="button" style={styles.inline}>
            <Ionicons name="text-outline" size={18} color={W.ink} />
            <Text style={[worldStyles.strong, { flex: 1 }]}>{tg('hub.entryTitle')}</Text>
            <Ionicons name="chevron-forward" size={16} color={W.muted} />
          </Pressable>
        )}
      </View>

      <View style={{ gap: 10 }}>
        <Text style={worldStyles.heading}>{t('adv.ladder')}</Text>
        <Text style={worldStyles.small}>{tg('levels.openNote', { open: OPEN_LEVELS })}</Text>
        <View style={styles.list}>
          {levels.map((l, k) => (
            <LevelRow key={l.id} level={l} first={k === 0} accent={accent} stars={best[l.id]?.stars ?? 0} open={isLevelUnlocked(l)} />
          ))}
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={worldStyles.heading}>{t('inventory.collectibles')}</Text>
        <View style={styles.list}>
          {world.collectibles.map((c, k) => {
            const got = have.includes(c.id);
            return (
              <View key={c.id} style={[worldStyles.row, k > 0 && worldStyles.rowLine]} accessible accessibilityLabel={got ? `${c.name}. ${c.description}` : t('adv.collectibleAt', { count: c.atStars })}>
                <View style={[styles.medal, got && { backgroundColor: accent, borderColor: accent }]}>
                  <Ionicons name={got ? 'ribbon' : 'lock-closed-outline'} size={16} color={got ? '#fff' : W.muted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[worldStyles.strong, !got && { color: W.muted }]}>{got ? c.name : t('adv.collectibleLocked')}</Text>
                  <Text style={worldStyles.small}>{got ? c.description : t('adv.collectibleAt', { count: c.atStars })}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

function Stat({ icon, value, label, color = W.ink }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string; color?: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }} accessible accessibilityLabel={`${label}: ${value}`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
        <Ionicons name={icon} size={16} color={color} />
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={worldStyles.meta}>{label}</Text>
    </View>
  );
}

function LevelRow({ level, first, accent, stars, open }: { level: Level; first: boolean; accent: string; stars: number; open: boolean }) {
  const { t } = useTranslation('world');
  const { t: tg } = useTranslation('games');
  const flip = useFlipStyle();
  const name = tg(`levels.names.${levelKey(level.number)}`);
  const kind = t(`adv.kinds.${level.kind}.name`);
  const status = open ? t('levels.starsA11y', { count: stars }) : tg('levels.locked', { level: level.number - 1 });
  return (
    <Pressable
      disabled={!open}
      onPress={() => router.push(levelHref(level))}
      accessibilityRole="button"
      accessibilityLabel={`${tg('levels.level', { level: level.number })}: ${name}, ${kind}. ${t(`adv.stage.${level.number}` as 'adv.stage.1')}. ${status}`}
      accessibilityState={{ disabled: !open }}
      style={({ pressed }) => [worldStyles.row, !first && worldStyles.rowLine, { minHeight: 68 }, pressed && { backgroundColor: W.page }]}>
      <View style={[styles.badge, stars > 0 && { backgroundColor: accent, borderColor: accent }, !open && { borderColor: W.line }]}>
        <Text style={[styles.badgeText, stars > 0 && { color: '#fff' }, !open && { color: W.muted }]}>{level.number}</Text>
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Text style={[styles.levelName, !open && { color: W.muted }]}>{name}</Text>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{kind}</Text>
          </View>
        </View>
        <Text style={worldStyles.small}>{open ? t(`adv.stage.${level.number}` as 'adv.stage.1') : tg('levels.locked', { level: level.number - 1 })}</Text>
      </View>
      {open ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ flexDirection: 'row', gap: 2 }}>
            {[0, 1, 2].map((i) => (
              <Ionicons key={i} name={i < stars ? 'star' : 'star-outline'} size={15} color={i < stars ? STAR : W.lineStrong} />
            ))}
          </View>
          <Ionicons name="chevron-forward" size={16} color={W.muted} style={flip} />
        </View>
      ) : (
        <Ionicons name="lock-closed-outline" size={18} color={W.muted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  card: { gap: 14, padding: 16, borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  stats: { flexDirection: 'row' },
  statValue: { fontFamily: FONT, fontSize: 18, color: W.ink, fontVariant: ['tabular-nums'] },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, paddingTop: 4, borderTopWidth: 1, borderTopColor: W.line },
  list: { borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line, overflow: 'hidden' },
  badge: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: W.ink, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: FONT, fontSize: 14, color: W.ink },
  levelName: { fontFamily: Fonts.bold, fontSize: 15, color: W.ink },
  tag: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, backgroundColor: W.given },
  tagText: { fontFamily: Fonts.bold, fontSize: 11, color: W.inkSoft, letterSpacing: 0.3 },
  medal: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: W.line, alignItems: 'center', justifyContent: 'center' },
});
