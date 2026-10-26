import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse, Polygon, Polyline } from 'react-native-svg';

import { Backdrop } from '@/components/lab/backdrop';
import { BOLD, GoldButton, Panel } from '@/components/lab/hud';
import { QuestionCard } from '@/components/space/question-card';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { AfricaExplorerRun, GameOutcome } from '@/lib/api';
import {
  AFRICA,
  EXPLORER,
  LAKE_VICTORIA,
  LANDMARKS,
  MADAGASCAR,
  mapProjection,
  MUSEUM_SCENES,
  RIVERS,
} from '@/lib/games/history';
import type { HistoryGame } from '@/lib/games/use-lab-run';

/** Where the map sits: below the top panels, above the bottom panel. */
const MAP_TOP = 210;
const MAP_BOTTOM = 150;

/**
 * Africa Explorer: find each country on the map of Africa (the server checks where you tapped), then
 * visit its landmark, learn two facts, answer a question, and get a passport stamp.
 */
export function AfricaExplorer({ g, run }: { g: HistoryGame; run: AfricaExplorerRun }) {
  const { t } = useTranslation('history');
  const seeResults = useTranslation('lab').t('result.see');
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [k, setK] = useState(() => Math.min(Math.floor(run.at / 2), run.stops.length - 1));
  const stop = run.stops[k]!;
  const [phase, setPhase] = useState<'find' | 'landmark' | 'question'>(() => (stop.find ? 'question' : 'find'));
  const [pin, setPin] = useState<[number, number] | null>(null);
  const [found, setFound] = useState<GameOutcome | null>(null);

  const mapW = size.w - 2 * Spacing.md;
  const mapH = size.h - MAP_TOP - MAP_BOTTOM;
  const proj = mapProjection(mapW, mapH);
  const pts = (list: [number, number][]) => list.map(([lon, lat]) => `${proj.x(lon)},${proj.y(lat)}`).join(' ');

  const tap = (e: GestureResponderEvent) => {
    if (found) return;
    g.buzz('tap');
    setPin(proj.toLonLat(e.nativeEvent.pageX - Spacing.md, e.nativeEvent.pageY - MAP_TOP));
  };
  const check = async () => {
    if (!pin) return;
    const res = await g.answer({ step: 2 * k, point: pin });
    if (!res) return;
    g.buzz(res.outcome.correct ? 'success' : 'error');
    setFound(res.outcome);
  };
  const nextStop = () => {
    if (run.status !== 'playing' || run.hearts <= 0 || k + 1 >= run.stops.length) {
      void g.finish();
      return;
    }
    setK(k + 1);
    setPin(null);
    setFound(null);
    setPhase('find');
  };
  const stamped = run.stops.filter((s) => s.question?.result);

  const passport = (
    <View style={styles.passport}>
      <Text style={{ fontFamily: BOLD, fontSize: 10, color: Colors.reward, letterSpacing: 1 }}>
        {t('africa.passport')}
      </Text>
      <View style={{ flexDirection: 'row', gap: 6, flex: 1, justifyContent: 'flex-end' }}>
        {run.stops.map((s) => {
          const done = !!s.question?.result;
          return (
            <View
              key={s.id}
              style={[styles.stamp, done && styles.stampDone]}
              accessibilityLabel={done ? t('africa.stamp', { name: s.name }) : undefined}>
              {done ? (
                <Text numberOfLines={1} style={{ fontFamily: BOLD, fontSize: 8, color: '#7A2E2E' }}>
                  {s.name.toUpperCase()}
                </Text>
              ) : (
                <Ionicons name="ellipse-outline" size={14} color="rgba(255,255,255,0.35)" />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );

  if (phase === 'find')
    return (
      <View
        style={StyleSheet.absoluteFill}
        onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        <Backdrop source={MUSEUM_SCENES.sea} dim={0} />
        {size.w > 0 && (
          <Pressable
            onPress={tap}
            accessibilityRole="button"
            accessibilityLabel={t('africa.mapA11y')}
            style={{ position: 'absolute', left: Spacing.md, top: MAP_TOP, width: mapW, height: mapH }}>
            <Svg width={mapW} height={mapH} pointerEvents="none">
              <Polygon points={pts(AFRICA)} fill="#E8C98A" stroke="#7A5A2E" strokeWidth={2} strokeLinejoin="round" />
              <Polygon
                points={pts(MADAGASCAR)}
                fill="#E8C98A"
                stroke="#7A5A2E"
                strokeWidth={2}
                strokeLinejoin="round"
              />
              {RIVERS.map((r, j) => (
                <Polyline
                  key={j}
                  points={pts(r)}
                  stroke="#3E8FC4"
                  strokeWidth={2}
                  fill="none"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ))}
              <Ellipse
                cx={proj.x(LAKE_VICTORIA.at[0])}
                cy={proj.y(LAKE_VICTORIA.at[1])}
                rx={LAKE_VICTORIA.rx * proj.scale}
                ry={LAKE_VICTORIA.ry * proj.scale}
                fill="#3E8FC4"
              />
              {stamped.map(
                (s) =>
                  s.find && (
                    <Circle
                      key={s.id}
                      cx={proj.x(s.find.at[0])}
                      cy={proj.y(s.find.at[1])}
                      r={6}
                      fill={Colors.success}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ),
              )}
              {found?.at && (
                <Circle
                  cx={proj.x(found.at[0])}
                  cy={proj.y(found.at[1])}
                  r={18}
                  fill="rgba(255,200,87,0.35)"
                  stroke={Colors.reward}
                  strokeWidth={3}
                />
              )}
            </Svg>
            {pin && (
              <Animated.View
                entering={ZoomIn}
                pointerEvents="none"
                style={[styles.pin, { left: proj.x(pin[0]) - 14, top: proj.y(pin[1]) - 30 }]}>
                <Ionicons
                  name="location"
                  size={30}
                  color={found ? (found.correct ? Colors.success : Colors.danger) : '#B04CFF'}
                />
              </Animated.View>
            )}
          </Pressable>
        )}

        <SafeAreaView edges={['top']} style={styles.top} pointerEvents="none">
          {passport}
          <Panel style={{ gap: 2 }}>
            <Text style={{ fontFamily: BOLD, color: Colors.reward, fontSize: 12 }}>
              {t('africa.objective', { n: k + 1, total: run.stops.length })}
            </Text>
            <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 18 }}>
              {t('africa.find', { name: stop.name })}
            </Text>
            {!!stop.region && (
              <Text style={{ color: 'rgba(235,238,255,0.85)', fontSize: 12 }}>
                {t('africa.hint', { region: stop.region })}
              </Text>
            )}
          </Panel>
        </SafeAreaView>

        <SafeAreaView edges={['bottom']} style={styles.bottom} pointerEvents="box-none">
          {found ? (
            <Animated.View entering={FadeInDown}>
              <Panel style={{ gap: Spacing.sm, borderColor: found.correct ? Colors.success : Colors.danger }}>
                <Text style={{ fontFamily: BOLD, fontSize: 16, color: found.correct ? Colors.success : '#FF8FA6' }}>
                  {found.correct
                    ? t('africa.found', { points: found.points })
                    : t('africa.missed', { name: stop.name })}
                </Text>
                <GoldButton
                  title={
                    run.hearts <= 0 || run.status !== 'playing'
                      ? seeResults
                      : t('africa.visit', { landmark: run.stops[k]!.landmark ?? stop.name })
                  }
                  icon="airplane"
                  onPress={() => (run.hearts <= 0 || run.status !== 'playing' ? void g.finish() : setPhase('landmark'))}
                />
              </Panel>
            </Animated.View>
          ) : (
            <Panel style={{ gap: Spacing.sm }}>
              <Text style={{ color: 'rgba(235,238,255,0.9)', fontSize: 13 }}>{t('africa.tap')}</Text>
              <GoldButton
                title={t('africa.check')}
                icon="checkmark"
                disabled={!pin || g.busy}
                onPress={() => void check()}
              />
            </Panel>
          )}
        </SafeAreaView>
      </View>
    );

  // At the landmark: the explorer stands in front of it.
  return (
    <View style={StyleSheet.absoluteFill}>
      <Backdrop source={LANDMARKS[stop.art ?? ''] ?? MUSEUM_SCENES.sea} dim={0.1} />
      <Animated.View entering={FadeIn.delay(200)} style={styles.explorer} pointerEvents="none">
        <Image
          source={EXPLORER.front.src}
          style={{ height: 300, width: 300 * EXPLORER.front.aspect }}
          contentFit="contain"
          accessible={false}
        />
      </Animated.View>
      <SafeAreaView edges={['top']} style={styles.top} pointerEvents="none">
        {passport}
        <Panel style={{ gap: 2 }}>
          <Text style={{ fontFamily: BOLD, color: Colors.reward, fontSize: 12 }}>{stop.name}</Text>
          <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 18 }}>{stop.landmark}</Text>
        </Panel>
      </SafeAreaView>
      <SafeAreaView edges={['bottom']} style={styles.bottom} pointerEvents="box-none">
        {phase === 'landmark' ? (
          <Animated.View entering={FadeInDown}>
            <Panel style={{ gap: Spacing.sm }}>
              <Text style={{ fontFamily: BOLD, fontSize: 12, color: '#2DD4BF', letterSpacing: 1 }}>
                {t('africa.facts')}
              </Text>
              {stop.facts?.map((f) => (
                <Text key={f} style={{ color: '#fff', fontSize: 14, lineHeight: 20 }}>
                  • {f}
                </Text>
              ))}
              <GoldButton title={t('africa.question')} icon="help-circle" onPress={() => setPhase('question')} />
            </Panel>
          </Animated.View>
        ) : (
          stop.question && (
            <QuestionCard
              key={stop.question.id}
              label={t('africa.question')}
              q={stop.question.q}
              options={stop.question.options}
              onAnswer={async (choice) => {
                const res = await g.answer(
                  choice === null ? { step: stop.question!.id, timeout: true } : { step: stop.question!.id, choice },
                );
                if (!res) return null;
                g.buzz(res.outcome.correct ? 'success' : 'error');
                return res.outcome;
              }}
              nextLabel={k + 1 >= run.stops.length ? seeResults : t('africa.next')}
              onNext={nextStop}
            />
          )
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', left: Spacing.md, right: Spacing.md, top: 56, gap: Spacing.sm },
  bottom: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: Spacing.md },
  pin: { position: 'absolute' },
  passport: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(14,18,44,0.82)',
  },
  stamp: {
    width: 52,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  stampDone: {
    borderColor: '#B23A3A',
    borderWidth: 2,
    backgroundColor: 'rgba(255,230,200,0.9)',
    transform: [{ rotate: '-6deg' }],
  },
  explorer: { position: 'absolute', left: 0, right: 0, bottom: 230, alignItems: 'center' },
});
