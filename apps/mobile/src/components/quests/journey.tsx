import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Polyline } from 'react-native-svg';

import { BOLD, GoldButton, Panel } from '@/components/lab/hud';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { QuestBoards } from '@/lib/api';
import { MAP_ASPECT, MAP_SPOTS, QUEST_ART, questRoute } from '@/lib/quests/art';

import { useQuestTitle } from './quest-ui';

type Journey = QuestBoards['journey'];

/**
 * The weekly journey: a golden path across the map of Knowzone World, one step at a time, ending
 * at the weekly chest. Done steps are flagged; the current one glows.
 */
export function JourneyMap({
  journey,
  onOpenChest,
  busy,
}: {
  journey: Journey;
  onOpenChest: () => void;
  busy?: boolean;
}) {
  const { t } = useTranslation('quests');
  const titleOf = useQuestTitle();
  const [size, setSize] = useState({ w: 0, h: 0 });
  // The map picture, as large as fits, centred.
  const h = Math.min(size.h, size.w / MAP_ASPECT);
  const w = h * MAP_ASPECT;
  const ox = (size.w - w) / 2;
  const seen: Record<string, number> = {};
  // A place visited twice gets its second marker a little to the side.
  const points = journey.steps.map((s) => {
    const spot = MAP_SPOTS[s.place === 'any' ? 'chest' : s.place];
    const n = (seen[s.place] = (seen[s.place] ?? 0) + 1) - 1;
    return [ox + (spot[0] + n * 0.09) * w, (spot[1] + n * 0.05) * h] as [number, number];
  });
  const chest: [number, number] = [ox + MAP_SPOTS.chest[0] * w, MAP_SPOTS.chest[1] * h];
  const route = [...points, chest];
  const doneUpTo = Math.min(journey.at, journey.steps.length);
  const pts = (list: [number, number][]) => list.map(([x, y]) => `${x},${y}`).join(' ');
  const current = journey.steps[journey.at];
  const goTo = current && questRoute(current);

  return (
    <View style={{ flex: 1, gap: Spacing.sm }}>
      <View
        style={{ flex: 1 }}
        onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        {size.w > 0 && (
          <>
            <Image
              source={QUEST_ART.map}
              style={{ position: 'absolute', left: ox, top: 0, width: w, height: h, borderRadius: 18 }}
              contentFit="cover"
              accessible={false}
            />
            <Svg width={size.w} height={size.h} style={StyleSheet.absoluteFill} pointerEvents="none">
              <Polyline
                points={pts(route)}
                stroke="rgba(255,240,200,0.55)"
                strokeWidth={3}
                strokeDasharray="2 9"
                strokeLinecap="round"
                fill="none"
              />
              <Polyline
                points={pts(route.slice(0, doneUpTo + 1))}
                stroke={Colors.reward}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
            {journey.steps.map((s, i) => {
              const [x, y] = points[i]!;
              const done = i < journey.at;
              return (
                <View
                  key={i}
                  accessible
                  accessibilityLabel={t('journey.stepA11y', {
                    n: i + 1,
                    title: titleOf(s),
                    state: done
                      ? t('journey.stateDone')
                      : s.current
                        ? t('journey.stateCurrent')
                        : t('journey.stateLater'),
                  })}
                  style={[
                    styles.marker,
                    { left: x - 17, top: y - 17 },
                    done && styles.markerDone,
                    s.current && styles.markerNow,
                  ]}>
                  {done ? (
                    <Ionicons name="flag" size={16} color="#3A2600" />
                  ) : (
                    <Text style={{ fontFamily: BOLD, color: s.current ? '#3A2600' : '#fff' }}>{i + 1}</Text>
                  )}
                </View>
              );
            })}
          </>
        )}
      </View>

      <Animated.View entering={FadeInDown}>
        <Panel style={{ gap: Spacing.sm }}>
          {current ? (
            <>
              <Text style={{ fontFamily: BOLD, color: Colors.reward, fontSize: 12 }}>
                {t('journey.step', { n: journey.at + 1, total: journey.steps.length })}
              </Text>
              <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 17 }}>{titleOf(current)}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${Math.min(1, current.progress / current.target) * 100}%` }]} />
                </View>
                <Text style={{ color: '#fff', fontSize: 12 }}>
                  {t('progress', { progress: current.progress, target: current.target })}
                </Text>
                {goTo && (
                  <Pressable
                    onPress={() => router.push(goTo)}
                    accessibilityRole="button"
                    accessibilityLabel={t('goTo', { place: t(`places.${current.place}`) })}
                    style={styles.go}>
                    <Text style={{ fontFamily: BOLD, color: '#3A2600' }}>{t('go')}</Text>
                  </Pressable>
                )}
              </View>
              <Text style={{ color: 'rgba(235,238,255,0.7)', fontSize: 11 }}>{t('journey.locked')}</Text>
            </>
          ) : journey.chest.claimed ? (
            <Text style={{ fontFamily: BOLD, color: Colors.success, fontSize: 16, textAlign: 'center' }}>
              {t('journey.done')}
            </Text>
          ) : (
            <GoldButton title={t('journey.openChest')} icon="gift" disabled={busy} onPress={onOpenChest} />
          )}
        </Panel>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  marker: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14,18,44,0.85)',
    borderWidth: 2,
    borderColor: 'rgba(255,240,200,0.7)',
  },
  markerDone: { backgroundColor: Colors.reward, borderColor: '#FFF1B8' },
  markerNow: { backgroundColor: '#FFE8A3', borderColor: '#fff', boxShadow: '0 0 14px #FFC857' },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: Colors.reward },
  go: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.reward },
});
