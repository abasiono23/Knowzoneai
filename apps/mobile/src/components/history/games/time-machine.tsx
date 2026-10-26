import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { Backdrop } from '@/components/lab/backdrop';
import { LabHall } from '@/components/lab/hall';
import { BOLD, Panel } from '@/components/lab/hud';
import { QuestionCard } from '@/components/space/question-card';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { TimeMachineRun } from '@/lib/api';
import { ERA_SCENES, eraPlace, type EraSpot } from '@/lib/games/history';
import type { HistoryGame } from '@/lib/games/use-lab-run';

import { OrderCard } from '../order-card';

const SPOTS: EraSpot[] = ['a', 'b'];

/**
 * History Time Machine: travel to each era in turn (earliest first), walk around the scene, and solve
 * the challenge waiting at each marked spot.
 */
export function TimeMachine({ g, run, paused }: { g: HistoryGame; run: TimeMachineRun; paused: boolean }) {
  const { t } = useTranslation('history');
  const next = useTranslation('space').t('ui.next');
  const seeResults = useTranslation('lab').t('result.see');
  const [k, setK] = useState(() => Math.min(Math.floor(run.at / 2), run.eras.length - 1));
  const era = run.eras[k]!;
  const answered = era.challenges.filter((c) => c.result).length;
  const [phase, setPhase] = useState<'travel' | 'walk' | 'challenge'>(() => (answered ? 'walk' : 'travel'));
  const [visited, setVisited] = useState<EraSpot[]>(() => SPOTS.slice(0, answered));

  useEffect(() => {
    if (phase !== 'travel') return;
    const id = setTimeout(() => setPhase('walk'), 2200);
    return () => clearTimeout(id);
  }, [phase]);

  // The challenge on screen stays put after it's answered (so its result shows), until Next.
  const [active, setActive] = useState<number | null>(null);
  const current =
    era.challenges.find((c) => c.id === active) ?? era.challenges.find((c) => !c.result) ?? era.challenges.at(-1)!;
  const last = k + 1 >= run.eras.length;
  const after = () => {
    const over = run.status !== 'playing' || run.hearts <= 0 || run.at >= run.total;
    if (visited.length < 2 && !over) {
      setPhase('walk');
      return;
    }
    if (over || last) {
      void g.finish();
      return;
    }
    setK(k + 1);
    setVisited([]);
    setPhase('travel');
  };
  const nextLabel = visited.length < 2 ? next : last ? seeResults : t('time.nextEra');

  if (phase === 'travel') return <Travel scene={ERA_SCENES[era.id] ?? ERA_SCENES.independence!} when={era.when} />;

  return (
    <View style={StyleSheet.absoluteFill}>
      <LabHall<EraSpot>
        key={era.id}
        place={eraPlace(era.id)}
        ns="history"
        names={{ a: era.spots[0], b: era.spots[1] }}
        openLabel={era.spots[visited.length] ?? era.spots[1]}
        badges={Object.fromEntries(visited.map((s) => [s, '✓']))}
        goal={SPOTS.find((s) => !visited.includes(s)) ?? null}
        paused={paused || phase !== 'walk'}
        topReserve={250}
        onOpen={(s) => {
          if (visited.includes(s) || visited.length >= 2) return;
          g.buzz('tap');
          setVisited([...visited, s]);
          setActive((era.challenges.find((c) => !c.result) ?? era.challenges.at(-1)!).id);
          setPhase('challenge');
        }}
      />

      <SafeAreaView edges={['top']} style={styles.top} pointerEvents="none">
        <Timeline eras={run.eras} at={k} />
        <Panel style={{ gap: 2 }}>
          <Text style={{ fontFamily: BOLD, color: Colors.reward, fontSize: 12 }}>
            {era.when} · {era.place}
          </Text>
          <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 15 }}>
            {t('time.objective', { n: k + 1, total: run.eras.length, title: era.title })}
          </Text>
          <Text style={{ color: 'rgba(235,238,255,0.9)', fontSize: 12 }}>{era.intro}</Text>
        </Panel>
      </SafeAreaView>

      {phase === 'challenge' && (
        <SafeAreaView edges={['bottom']} style={styles.bottom} pointerEvents="box-none">
          {current.type === 'order' ? (
            <OrderCard
              key={current.id}
              label={t('time.challenge', { n: (current.id % 2) + 1, total: 2 })}
              q={current.q}
              items={current.items}
              onAnswer={async (order) => {
                const res = await g.answer({ step: current.id, order });
                if (!res) return null;
                g.buzz(res.outcome.correct ? 'success' : 'error');
                return res.outcome;
              }}
              nextLabel={nextLabel}
              onNext={after}
            />
          ) : (
            <QuestionCard
              key={current.id}
              label={t('time.challenge', { n: (current.id % 2) + 1, total: 2 })}
              q={current.q}
              options={current.options}
              onAnswer={async (choice) => {
                const res = await g.answer(
                  choice === null ? { step: current.id, timeout: true } : { step: current.id, choice },
                );
                if (!res) return null;
                g.buzz(res.outcome.correct ? 'success' : 'error');
                return res.outcome;
              }}
              nextLabel={nextLabel}
              onNext={after}
            />
          )}
        </SafeAreaView>
      )}
    </View>
  );
}

/** The run's eras as dots on a line, the current one glowing. */
function Timeline({ eras, at }: { eras: TimeMachineRun['eras']; at: number }) {
  return (
    <View style={styles.timeline}>
      <View style={styles.line} />
      {eras.map((e, k) => (
        <View key={e.id} style={{ alignItems: 'center', flex: 1 }}>
          <View style={[styles.dot, k < at && { backgroundColor: Colors.success }, k === at && styles.dotOn]} />
          <Text
            numberOfLines={1}
            style={{ fontSize: 11, fontFamily: BOLD, color: k === at ? Colors.reward : 'rgba(235,238,255,0.75)' }}>
            {e.when}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Through the portal: the era appears behind a swirl of light. */
function Travel({ scene, when }: { scene: number; when: string }) {
  const { t } = useTranslation('history');
  const spin = useSharedValue(0);
  const open = useSharedValue(0);
  useEffect(() => {
    spin.set(withRepeat(withTiming(360, { duration: 1400, easing: Easing.linear }), -1));
    open.set(withTiming(1, { duration: 2000, easing: Easing.in(Easing.quad) }));
  }, [spin, open]);
  const swirl = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }, { scale: 0.6 + open.value * 3 }],
    opacity: 1 - open.value * 0.85,
  }));
  const veil = useAnimatedStyle(() => ({ opacity: 1 - open.value }));
  return (
    <View style={StyleSheet.absoluteFill}>
      <Backdrop source={scene} />
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#1A0E3A' }, veil]} />
      <View style={styles.center} pointerEvents="none">
        <Animated.View style={swirl}>
          <Svg width={260} height={260}>
            {[120, 95, 70, 45, 22].map((r, k) => (
              <Circle
                key={r}
                cx={130}
                cy={130}
                r={r}
                stroke={k % 2 ? '#B04CFF' : '#FFC857'}
                strokeWidth={6 - k}
                strokeDasharray={`${20 + k * 6} ${14 + k * 4}`}
                fill="none"
              />
            ))}
          </Svg>
        </Animated.View>
      </View>
      <Animated.View entering={FadeIn.delay(200)} style={styles.travelText} pointerEvents="none">
        <Animated.Text
          entering={ZoomIn}
          style={{
            fontFamily: BOLD,
            fontSize: 24,
            color: '#fff',
            textAlign: 'center',
            textShadowColor: '#000',
            textShadowRadius: 8,
          }}>
          {t('time.travelling', { when })}
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', left: Spacing.md, right: Spacing.md, top: 56, gap: Spacing.sm },
  bottom: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: Spacing.md },
  timeline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(14,18,44,0.82)',
  },
  line: {
    position: 'absolute',
    left: '15%',
    right: '15%',
    top: 12,
    height: 2,
    backgroundColor: 'rgba(255,200,87,0.4)',
  },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.35)', marginBottom: 2 },
  dotOn: { backgroundColor: Colors.reward, boxShadow: '0 0 8px #FFC857' },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  travelText: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: 160 },
});
