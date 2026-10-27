import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Stars } from '@/components/world/world-ui';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { GameLevel, GameSummary } from '@/lib/api';
import { coverMap, SCENES, type StationId } from '@/lib/games/lab';

import { BOLD, Coins, GoldButton, Panel, PANEL, RoundButton } from './hud';

export type CoverMap = ReturnType<typeof coverMap>;

/** A station close-up: its picture fills the screen; `children` places things on it. */
export function StationView({
  id,
  scene,
  title,
  backLabel,
  onBack,
  top,
  children,
}: {
  id?: StationId;
  /** Another place's picture and name (the chemistry station's by default). */
  scene?: number;
  title?: string;
  backLabel?: string;
  onBack: () => void;
  /** Hearts, objective… under the top bar. */
  top?: ReactNode;
  children: (map: CoverMap) => ReactNode;
}) {
  const { t } = useTranslation('lab');
  const [size, setSize] = useState({ w: 0, h: 0 });
  const map = coverMap(size.w, size.h);
  return (
    <Animated.View entering={FadeIn.duration(250)} style={[StyleSheet.absoluteFill, { backgroundColor: '#0B0F2A' }]}>
      <View
        style={StyleSheet.absoluteFill}
        onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        {size.w > 0 && (
          <>
            <Image
              source={scene ?? SCENES[id!]}
              style={{ position: 'absolute', left: map.ox, top: map.oy, width: map.dw, height: map.dh }}
              contentFit="cover"
              accessible={false}
            />
            {children(map)}
          </>
        )}
      </View>
      <SafeAreaView edges={['top']} pointerEvents="box-none" style={styles.top}>
        <View style={styles.bar} pointerEvents="box-none">
          <RoundButton icon="arrow-back" label={backLabel ?? t('station.back')} onPress={onBack} />
          <View style={styles.title}>
            <Text style={{ fontFamily: BOLD, fontSize: 14, color: '#fff' }}>{title ?? t(`stations.${id!}`)}</Text>
          </View>
          <Coins />
        </View>
        {top}
      </SafeAreaView>
    </Animated.View>
  );
}

/** Choose a game and level at a station. */
export function GamePicker<G extends string>({
  games,
  levelsOf,
  busy,
  onStart,
  ns = 'lab',
}: {
  games: G[];
  levelsOf: (game: G) => GameLevel[];
  busy?: boolean;
  onStart: (game: G, level: number) => void;
  /** Where the games' names and how-to texts are (`games.<id>.name`). */
  ns?: 'lab' | 'space' | 'history' | 'tech' | 'business';
}) {
  const { t } = useTranslation('lab');
  const tn = useTranslation(ns).t;
  const [choice, setChoice] = useState<{ game: G; level: number } | null>(null);
  return (
    <SafeAreaView edges={['bottom']} style={styles.pickerWrap} pointerEvents="box-none">
      <ScrollView style={{ maxHeight: 460 }} contentContainerStyle={{ gap: Spacing.sm }}>
        {games.map((game) => {
          const levels = levelsOf(game);
          const next =
            levels.find((l) => l.unlocked && !l.bestStars)?.level ??
            [...levels].reverse().find((l) => l.unlocked)?.level ??
            1;
          const level = choice?.game === game ? choice.level : next;
          return (
            <Animated.View key={game} entering={FadeInDown}>
              <Panel style={{ gap: Spacing.xs }}>
                <Text style={{ fontFamily: BOLD, fontSize: 18, color: '#fff' }}>
                  {tn(`games.${game}.name` as never)}
                </Text>
                <Text style={{ fontSize: 13, color: 'rgba(235,238,255,0.85)' }}>
                  {tn(`games.${game}.how` as never)}
                </Text>
                <View style={styles.levels}>
                  {(levels.length
                    ? levels
                    : [1, 2, 3, 4, 5].map((l) => ({
                        level: l,
                        unlocked: l === 1,
                        bestStars: 0,
                        bestScore: 0,
                        plays: 0,
                      }))
                  ).map((l) => {
                    const on = level === l.level;
                    return (
                      <Pressable
                        key={l.level}
                        disabled={!l.unlocked}
                        onPress={() => setChoice({ game, level: l.level })}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: on, disabled: !l.unlocked }}
                        accessibilityLabel={t('picker.level', { level: l.level })}
                        style={[
                          styles.level,
                          on && { borderColor: Colors.reward, backgroundColor: 'rgba(255,200,87,0.15)' },
                          !l.unlocked && { opacity: 0.4 },
                        ]}>
                        {l.unlocked ? (
                          <Text style={{ fontFamily: BOLD, color: '#fff' }}>{l.level}</Text>
                        ) : (
                          <Ionicons name="lock-closed" size={14} color="#fff" />
                        )}
                        <Stars value={l.bestStars} size={9} />
                      </Pressable>
                    );
                  })}
                </View>
                <GoldButton
                  title={t('picker.start', { level })}
                  icon="play"
                  disabled={busy}
                  onPress={() => onStart(game, level)}
                />
              </Panel>
            </Animated.View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

/** End of a lab game: stars, score and rewards. */
export function LabResult({
  game,
  level,
  summary,
  onNext,
  onReplay,
  onBack,
  ns = 'lab',
}: {
  game: string;
  level: number;
  summary: GameSummary;
  onNext: () => void;
  onReplay: () => void;
  onBack: () => void;
  ns?: 'lab' | 'space' | 'history' | 'tech' | 'business';
}) {
  const { t } = useTranslation(ns);
  const tg = useTranslation('games').t;
  const s = summary;
  return (
    <Animated.View entering={FadeIn} style={[StyleSheet.absoluteFill, styles.resultBg]}>
      <SafeAreaView style={styles.result}>
        <Animated.View entering={ZoomIn.springify()} style={{ alignItems: 'center', gap: Spacing.sm }}>
          <Text style={{ fontFamily: BOLD, fontSize: 14, color: Colors.reward, letterSpacing: 1 }}>
            {String(t(`games.${game}.name` as never)).toUpperCase()}
          </Text>
          <Text style={{ fontFamily: BOLD, fontSize: 30, color: '#fff', textAlign: 'center' }}>
            {s.stars >= 3 ? tg('results.great') : s.stars > 0 ? tg('results.good') : tg('results.tryAgain')}
          </Text>
          <Stars value={s.stars} size={44} animate />
        </Animated.View>
        <Panel style={{ alignSelf: 'stretch', alignItems: 'center', gap: 2 }}>
          <Text style={{ color: 'rgba(235,238,255,0.8)' }}>{tg('results.score')}</Text>
          <Text style={{ fontFamily: BOLD, fontSize: 42, color: '#fff' }}>{s.score}</Text>
          <Text style={{ color: s.newBest && s.score > 0 ? Colors.reward : 'rgba(235,238,255,0.7)' }}>
            {s.newBest && s.score > 0 ? tg('results.newBest') : tg('results.best', { score: s.best.score })}
          </Text>
        </Panel>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {s.xp > 0 && (
            <View style={styles.reward}>
              <Ionicons name="flash" size={16} color={Colors.primary} />
              <Text style={{ fontFamily: BOLD, color: '#fff' }}>{tg('results.xp', { count: s.xp })}</Text>
            </View>
          )}
          {s.coins > 0 && (
            <View style={styles.reward}>
              <Text style={{ fontFamily: BOLD, color: Colors.reward }}>{tg('results.coins', { count: s.coins })}</Text>
            </View>
          )}
        </View>
        {s.stars > 0 && s.xp === 0 && s.coins === 0 && (
          <Text style={{ color: 'rgba(235,238,255,0.8)', textAlign: 'center' }}>{tg('results.capped')}</Text>
        )}
        {s.nextLevelUnlocked && (
          <Text style={{ fontFamily: BOLD, color: Colors.success }}>
            {tg('results.unlocked', { level: level + 1 })}
          </Text>
        )}
        <View style={{ flex: 1 }} />
        <View style={{ alignSelf: 'stretch', gap: Spacing.sm }}>
          {s.nextLevelUnlocked && level < 5 && (
            <GoldButton title={tg('results.next')} icon="arrow-forward" onPress={onNext} />
          )}
          <Pressable onPress={onReplay} accessibilityRole="button" style={styles.secondary}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={{ fontFamily: BOLD, color: '#fff' }}>{tg('results.replay')}</Text>
          </Pressable>
          <Pressable onPress={onBack} accessibilityRole="button" style={{ alignSelf: 'center', padding: Spacing.sm }}>
            <Text style={{ color: 'rgba(235,238,255,0.8)' }}>{t('result.back')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', left: 0, right: 0, top: 0, paddingHorizontal: Spacing.md, gap: Spacing.sm },
  bar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.xs },
  title: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 999, backgroundColor: PANEL },
  pickerWrap: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: Spacing.md },
  levels: { flexDirection: 'row', gap: 6, marginVertical: 4 },
  level: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  resultBg: { backgroundColor: 'rgba(8,10,30,0.92)' },
  result: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: PANEL,
  },
  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 999,
    backgroundColor: 'rgba(124,92,255,0.35)',
  },
});
