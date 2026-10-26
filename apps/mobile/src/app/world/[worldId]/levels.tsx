import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { GameBack, levelHref, Stars, Wallet } from '@/components/world/world-ui';
import { Button, Text } from '@/components/ui';
import { Colors, MaxContentWidth, Radius, Spacing, WorldGradients } from '@/constants/theme';
import { getWorld } from '@/lib/world/content';
import { levelsOf } from '@/lib/world/levels';
import { useWorld } from '@/lib/world/store';
import { KIND_INFO, type Level } from '@/lib/world/types';

const STEP = 128;
const XS = [0.5, 0.78, 0.5, 0.22, 0.5, 0.5];

/** Screen 137: the level path through a world. Tap a level to see it, then play. */
export default function LevelSelectScreen() {
  const { t } = useTranslation('world');
  const { worldId } = useLocalSearchParams<{ worldId: string }>();
  const world = getWorld(worldId);
  const { best, isLevelUnlocked, worldStars, settings } = useWorld();
  const { width } = useWindowDimensions();
  const w = Math.min(width, MaxContentWidth);
  const levels = world ? levelsOf(world.id) : [];
  const current = levels.find((l) => isLevelUnlocked(l) && !(best[l.id]?.stars ?? 0)) ?? levels[levels.length - 1];
  const [selected, setSelected] = useState<Level | undefined>(current);
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (!settings.reduceMotion) pulse.value = withRepeat(withTiming(1.12, { duration: 800 }), -1, true);
  }, [pulse, settings.reduceMotion]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  if (!world) return null;
  // The path winds down the world, ending at the boss.
  const pts = levels.map((l, k) => ({ l, x: XS[k] * w, y: k * STEP + 70 }));
  const height = levels.length * STEP + 40;
  const sel = selected && levels.find((l) => l.id === selected.id);
  const selOpen = sel && isLevelUnlocked(sel);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[WorldGradients[world.id][1] + 'AA', WorldGradients[world.id][0], Colors.backgroundDeep]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top']} style={styles.top}>
        <GameBack />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text variant="label" color="rgba(255,255,255,0.8)">
            {t('levels.stars', { stars: worldStars(world.id) })}
          </Text>
          <Text variant="heading">{world.name}</Text>
        </View>
        <Wallet compact />
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ height: height + 240, width: w, alignSelf: 'center' }}>
        <Svg width={w} height={height} style={StyleSheet.absoluteFill}>
          <Path
            d={pts
              .map((p, k) =>
                k === 0
                  ? `M${p.x} ${p.y}`
                  : `C${pts[k - 1].x} ${p.y - STEP / 2} ${p.x} ${pts[k - 1].y + STEP / 2} ${p.x} ${p.y}`,
              )
              .join(' ')}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray="1 18"
            fill="none"
          />
        </Svg>
        {pts.map(({ l, x, y }, k) => {
          const open = isLevelUnlocked(l);
          const stars = best[l.id]?.stars ?? 0;
          const info = KIND_INFO[l.kind];
          const isCurrent = l.id === current?.id && !stars;
          const size = l.kind === 'boss' ? 92 : 72;
          const node = (
            <Pressable
              onPress={() => setSelected(l)}
              accessibilityRole="button"
              accessibilityState={{ selected: selected?.id === l.id, disabled: !open }}
              accessibilityLabel={t('levels.nodeA11y', {
                number: l.number,
                title: l.title,
                kind: info.label,
                status: open ? t('levels.starsA11y', { count: stars }) : t('select.locked'),
              })}
              style={[
                styles.node,
                { width: size, height: size, borderRadius: size / 2 },
                open
                  ? { backgroundColor: info.color, borderColor: stars === 3 ? Colors.reward : 'rgba(255,255,255,0.6)' }
                  : styles.locked,
                selected?.id === l.id && { borderColor: '#fff', borderWidth: 4 },
              ]}>
              {open ? (
                l.kind === 'boss' ? (
                  <Text style={{ fontSize: 40 }}>{world.boss.emoji}</Text>
                ) : (
                  <>
                    <Ionicons name={info.icon} size={22} color={Colors.backgroundDeep} />
                    <Text variant="label" color={Colors.backgroundDeep}>
                      {l.number}
                    </Text>
                  </>
                )
              ) : (
                <Ionicons name="lock-closed" size={22} color={Colors.textMuted} />
              )}
            </Pressable>
          );
          return (
            <Animated.View
              key={l.id}
              entering={ZoomIn.delay(k * 60)}
              style={[styles.nodeWrap, { left: x - 60, top: y - size / 2 }]}>
              {isCurrent ? <Animated.View style={pulseStyle}>{node}</Animated.View> : node}
              <View style={styles.starRow}>{open && <Stars value={stars} size={14} />}</View>
            </Animated.View>
          );
        })}
      </ScrollView>
      {sel && (
        <Animated.View key={sel.id} entering={FadeInDown.duration(220)} style={styles.sheet}>
          <SafeAreaView edges={['bottom']} style={{ gap: Spacing.sm }}>
            <View style={styles.sheetRow}>
              <View style={[styles.kind, { backgroundColor: KIND_INFO[sel.kind].color + '22' }]}>
                <Ionicons name={KIND_INFO[sel.kind].icon} size={22} color={KIND_INFO[sel.kind].color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="label" color={KIND_INFO[sel.kind].color}>
                  {t('detail.levelKind', { number: sel.number, kind: KIND_INFO[sel.kind].label.toUpperCase() })}
                </Text>
                <Text variant="heading">{sel.kind === 'boss' ? world.boss.name : sel.title}</Text>
                <Text variant="small" color={Colors.textSecondary}>
                  {KIND_INFO[sel.kind].how}
                </Text>
              </View>
              <Stars value={best[sel.id]?.stars ?? 0} size={16} />
            </View>
            {selOpen ? (
              <Button
                title={best[sel.id] ? t('levels.playAgain') : t('levels.play')}
                icon="play"
                onPress={() => router.push(levelHref(sel))}
              />
            ) : (
              <Button
                variant="secondary"
                title={t('levels.clearToUnlock', { number: sel.number - 1 })}
                icon="lock-closed"
                disabled
              />
            )}
            <Text variant="small" color={Colors.textMuted} center style={{ fontSize: 12 }}>
              {best[sel.id]?.plays
                ? t('levels.rewardPlayed', { xp: sel.xp, count: sel.coins, plays: best[sel.id].plays })
                : t('levels.reward', { xp: sel.xp, count: sel.coins })}
            </Text>
          </SafeAreaView>
        </Animated.View>
      )}
      {!sel && (
        <View style={styles.sheet}>
          <Button title={t('levels.details')} variant="secondary" onPress={() => router.push(`/world/${world.id}` as Href)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  nodeWrap: { position: 'absolute', width: 120, alignItems: 'center', gap: 4 },
  node: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  locked: { backgroundColor: Colors.surfaceRaised, borderColor: Colors.borderStrong },
  starRow: { height: 16 },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.md,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderColor: Colors.borderStrong,
  },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  kind: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
