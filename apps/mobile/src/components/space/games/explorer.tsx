import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LabHall } from '@/components/lab/hall';
import { BOLD, GoldButton, Panel } from '@/components/lab/hud';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { SolarExplorerRun } from '@/lib/api';
import { PLANET_ORDER, PLANETS, SPACE_SCENES, SPRITES, SURFACES, surfacePlace, type ScanSpot } from '@/lib/games/space';
import type { SpaceGame } from '@/lib/games/use-lab-run';

import { Backdrop } from '@/components/lab/backdrop';

import { QuestionCard } from '../question-card';

const SPOTS: ScanSpot[] = ['a', 'b', 'c'];

/**
 * Solar System Explorer: pick the next place on the map, fly there, walk around its surface and scan
 * three spots for discoveries, then answer mission control's questions.
 */
export function Explorer({ g, run, paused }: { g: SpaceGame; run: SolarExplorerRun; paused: boolean }) {
  const { t } = useTranslation('space');
  const firstOpen = Math.max(
    0,
    run.visits.findIndex((v) => v.questions.some((q) => !q.result)),
  );
  const [v, setV] = useState(firstOpen);
  const visit = run.visits[v]!;
  const started = visit.questions.some((q) => q.result);
  const [phase, setPhase] = useState<'map' | 'flying' | 'surface' | 'report'>(started ? 'report' : 'map');
  const [scanned, setScanned] = useState<ScanSpot[]>([]);
  const [fact, setFact] = useState<number | null>(null);
  const [q, setQ] = useState(() =>
    Math.max(
      0,
      visit.questions.findIndex((x) => !x.result),
    ),
  );

  useEffect(() => {
    if (phase !== 'flying') return;
    const id = setTimeout(() => setPhase('surface'), 1800);
    return () => clearTimeout(id);
  }, [phase]);

  const nextPlace = () => {
    if (run.status !== 'playing' || run.hearts <= 0 || v + 1 >= run.visits.length) {
      void g.finish();
      return;
    }
    setV(v + 1);
    setScanned([]);
    setFact(null);
    setQ(0);
    setPhase('map');
  };

  if (phase === 'map') return <SolarMap run={run} v={v} onFly={() => setPhase('flying')} />;
  if (phase === 'flying') return <Flight name={visit.name} />;

  const spotName = (s: ScanSpot) => t('explorer.spot', { n: SPOTS.indexOf(s) + 1 });
  const allScanned = scanned.length === SPOTS.length;
  const question = visit.questions[q]!;

  return (
    <View style={StyleSheet.absoluteFill}>
      {phase === 'surface' ? (
        <LabHall<ScanSpot>
          key={visit.id}
          place={surfacePlace(visit.id)}
          ns="space"
          names={{ a: spotName('a'), b: spotName('b'), c: spotName('c') }}
          openLabel={t('explorer.scan')}
          badges={Object.fromEntries(scanned.map((s) => [s, '✓']))}
          goal={SPOTS.find((s) => !scanned.includes(s)) ?? null}
          paused={paused || fact !== null}
          topReserve={210}
          onOpen={(s) => {
            if (scanned.includes(s)) return;
            g.buzz('success');
            setScanned([...scanned, s]);
            setFact(scanned.length);
          }}
        />
      ) : (
        <Backdrop source={SURFACES[visit.id] ?? SURFACES.moon!} />
      )}

      <SafeAreaView edges={['top']} style={styles.top} pointerEvents="none">
        <Panel style={{ marginTop: 56, gap: 4 }}>
          <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 14 }}>
            {t('explorer.objective', { n: v + 1, total: run.visits.length, name: visit.name })}
          </Text>
          <Text style={{ color: Colors.reward, fontSize: 12, fontFamily: BOLD }}>
            {t('explorer.mission', { mission: visit.mission })}
          </Text>
          <View style={styles.scanRow}>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${(scanned.length / SPOTS.length) * 100}%` }]} />
            </View>
            <Text style={{ color: '#fff', fontSize: 11 }}>
              {t('explorer.scanner', { done: scanned.length, total: SPOTS.length })}
            </Text>
          </View>
        </Panel>
      </SafeAreaView>

      {phase === 'surface' && fact !== null && (
        <View style={styles.middle} pointerEvents="box-none">
          <Animated.View entering={ZoomIn.springify()}>
            <Panel style={{ gap: Spacing.sm, borderColor: '#2DD4BF' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="scan" size={18} color="#2DD4BF" />
                <Text style={{ fontFamily: BOLD, color: '#2DD4BF', fontSize: 12, letterSpacing: 1 }}>
                  {t('explorer.discovery')}
                </Text>
              </View>
              <Text style={{ color: '#fff', fontSize: 16, lineHeight: 22 }}>{visit.facts[fact]}</Text>
              <GoldButton
                title={allScanned ? t('explorer.report') : t('ui.next')}
                icon={allScanned ? 'document-text' : 'arrow-forward'}
                onPress={() => {
                  setFact(null);
                  if (allScanned) setPhase('report');
                }}
              />
            </Panel>
          </Animated.View>
        </View>
      )}

      {phase === 'report' && (
        <SafeAreaView edges={['bottom']} style={styles.bottom} pointerEvents="box-none">
          <QuestionCard
            key={question.id}
            label={`${t('explorer.report').toUpperCase()} · ${t('explorer.question', { n: q + 1, total: visit.questions.length })}`}
            q={question.q}
            options={question.options}
            onAnswer={async (choice) => {
              const res = await g.answer(
                choice === null ? { step: question.id, timeout: true } : { step: question.id, choice },
              );
              if (!res) return null;
              g.buzz(res.outcome.correct ? 'success' : 'error');
              return res.outcome;
            }}
            nextLabel={
              q + 1 < visit.questions.length
                ? t('ui.next')
                : v + 1 < run.visits.length
                  ? t('explorer.backToMap')
                  : undefined
            }
            onNext={() => {
              if (run.status !== 'playing' || run.hearts <= 0) void g.finish();
              else if (q + 1 < visit.questions.length) setQ(q + 1);
              else nextPlace();
            }}
          />
        </SafeAreaView>
      )}
    </View>
  );
}

/** The hologram map in the observatory: the planets, with the next stop glowing. */
function SolarMap({ run, v, onFly }: { run: SolarExplorerRun; v: number; onFly: () => void }) {
  const { t } = useTranslation('space');
  const visit = run.visits[v]!;
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.set(withRepeat(withSequence(withTiming(1.15, { duration: 700 }), withTiming(1, { duration: 700 })), -1));
  }, [pulse]);
  const glow = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const done = new Set(run.visits.slice(0, v).map((x) => x.planet));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Backdrop source={SPACE_SCENES.observatory} dim={0.35} />
      <SafeAreaView edges={['top', 'bottom']} style={styles.mapWrap} pointerEvents="box-none">
        <View style={{ height: 56 }} />
        <Animated.View entering={FadeIn} style={styles.holo}>
          <Text style={{ fontFamily: BOLD, color: '#9FF5E8', fontSize: 12, letterSpacing: 2, textAlign: 'center' }}>
            {t('explorer.map')}
          </Text>
          <View style={styles.sunRow}>
            <Image
              source={PLANETS.sun!.src}
              style={{ width: 54, height: 54 }}
              contentFit="contain"
              accessible={false}
            />
          </View>
          <View style={styles.grid}>
            {PLANET_ORDER.map((id) => {
              const target = id === visit.planet;
              const art = PLANETS[id]!;
              const d = id === 'jupiter' || id === 'saturn' ? 54 : 40;
              return (
                <View key={id} style={styles.cell}>
                  <Animated.View style={target ? glow : undefined}>
                    <Image
                      source={art.src}
                      style={{ width: d * art.aspect, height: d, opacity: target || done.has(id) ? 1 : 0.55 }}
                      contentFit="contain"
                      accessible={false}
                    />
                  </Animated.View>
                  {target && <View style={styles.targetRing} />}
                  {done.has(id) && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={Colors.success}
                      style={{ position: 'absolute', top: 0, right: 8 }}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </Animated.View>
        <View style={{ flex: 1 }} />
        <Animated.View entering={FadeInDown}>
          <Panel style={{ gap: Spacing.sm }}>
            <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 18 }}>{visit.name}</Text>
            <Text style={{ color: Colors.reward, fontFamily: BOLD }}>
              {t('explorer.mission', { mission: visit.mission })}
            </Text>
            <GoldButton title={t('explorer.flyTo', { name: visit.name })} icon="rocket" onPress={onFly} />
          </Panel>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

/** A short flight between the stars. */
function Flight({ name }: { name: string }) {
  const { t } = useTranslation('space');
  const y = useSharedValue(0);
  useEffect(() => {
    y.set(withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.quad) }));
  }, [y]);
  const ship = useAnimatedStyle(() => ({ transform: [{ translateY: -y.value * 420 }, { scale: 1 - y.value * 0.6 }] }));
  return (
    <View style={StyleSheet.absoluteFill}>
      <Backdrop source={SPACE_SCENES.space} />
      <View style={styles.flight}>
        <Animated.View style={ship}>
          <Image
            source={SPRITES.ship.src}
            style={{ width: 120, height: 120 / SPRITES.ship.aspect }}
            contentFit="contain"
            accessible={false}
          />
        </Animated.View>
        <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 18, marginTop: Spacing.lg }}>
          {t('explorer.flying', { name })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', left: Spacing.md, right: Spacing.md, top: 0 },
  bottom: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: Spacing.md },
  middle: { position: 'absolute', left: Spacing.md, right: Spacing.md, top: 0, bottom: 0, justifyContent: 'center' },
  scanRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: '#2DD4BF' },
  mapWrap: { flex: 1, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  holo: {
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.5)',
    backgroundColor: 'rgba(10,40,60,0.55)',
  },
  sunRow: { alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', rowGap: 12 },
  cell: { width: '25%', height: 64, alignItems: 'center', justifyContent: 'center' },
  targetRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.reward,
  },
  flight: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 160 },
});
