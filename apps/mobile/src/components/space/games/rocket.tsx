import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BOLD, GoldButton, Panel, PANEL } from '@/components/lab/hud';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { EngineId, GameOutcome, RocketBuilderRun, RocketDesign, TankId } from '@/lib/api';
import { coverMap } from '@/lib/games/lab';
import { num, ROCKET, SPACE_SCENES } from '@/lib/games/space';
import type { SpaceGame } from '@/lib/games/use-lab-run';

import { QuestionCard } from '../question-card';

/** Tank heights, in rocket diameters. */
const TANK_HEIGHT: Record<TankId, number> = { small: 2.2, medium: 3.4, large: 5 };
const ENGINE_ORDER: EngineId[] = ['spark', 'nova', 'titan', 'ion'];
const TANK_ORDER: TankId[] = ['small', 'medium', 'large'];
/** Side panels' widths, and the launch bar's height. */
const LEFT_W = 104;
const RIGHT_W = 118;
const BAR_H = 76;

/** The same numbers the server works out (Δv from the rocket equation). */
function statsOf(run: RocketBuilderRun, payload: number, d: { engine: EngineId | null; tanks: TankId[] }) {
  const { engines, tanks, fins, g } = run.parts;
  const e = d.engine ? engines[d.engine] : null;
  const tankDry = d.tanks.reduce((s, x) => s + tanks[x].dry, 0);
  const fuel = d.tanks.reduce((s, x) => s + tanks[x].fuel, 0);
  const dry = payload + fins.mass + (e?.mass ?? 0) + tankDry;
  const mass = dry + fuel;
  return {
    mass,
    weight: mass * g,
    thrust: e?.thrust ?? 0,
    dv: e && fuel > 0 ? e.isp * g * Math.log(mass / dry) : 0,
    cost: (e?.cost ?? 0) + fins.cost + d.tanks.reduce((s, x) => s + tanks[x].cost, 0),
  };
}

/** A section's height in rocket diameters (drawn so its body matches the rocket's width). */
const unitsOf = (art: { aspect: number; body: number }) => 1 / (art.body * art.aspect);

/**
 * Rocket Builder in the workshop: choose an engine and stack fuel tanks under the payload on the
 * launch tower, watch the physics readouts, and launch. The server checks the flight; then a question
 * about your rocket. Laid out like the approved design: readouts left, parts right, the rocket between.
 */
export function RocketWorkshop({ g, run }: { g: SpaceGame; run: RocketBuilderRun }) {
  const { t } = useTranslation('space');
  const insets = useSafeAreaInsets();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [cardBottom, setCardBottom] = useState(150);
  const [k, setK] = useState(() => Math.min(Math.floor(run.at / 2), run.missions.length - 1));
  const [stage, setStage] = useState<'build' | 'flying' | 'report' | 'question'>(() =>
    run.at % 2 ? 'question' : 'build',
  );
  const [engine, setEngine] = useState<EngineId | null>(null);
  const [tanks, setTanks] = useState<TankId[]>([]);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [flame, setFlame] = useState(false);
  const m = run.missions[k]!;
  const s = statsOf(run, m.payload.mass, { engine, tanks });
  const lifts = s.thrust > s.weight;

  const rise = useSharedValue(0);
  const jiggle = useSharedValue(0);
  const rocketStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: rise.value }, { translateX: jiggle.value }],
  }));
  const flicker = useSharedValue(1);
  const plumeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: flicker.value }, { scaleX: 2 - flicker.value }],
  }));
  const smoke = useSharedValue(0);
  const smokeStyle = useAnimatedStyle(() => ({
    opacity: smoke.value,
    transform: [{ scale: 0.6 + smoke.value * 0.6 }],
  }));

  const afterFlight = (o: GameOutcome) => {
    setFlame(false);
    smoke.set(withTiming(0, { duration: 1200 }));
    setOutcome(o);
    setStage('report');
  };

  const launch = async () => {
    if (!engine || stage !== 'build') return;
    const res = await g.answer({ step: 2 * k, engine, tanks });
    if (!res) return;
    const o = res.outcome;
    setStage('flying');
    const problem = o.problem;
    if (problem === 'budget' || problem === 'no-fuel' || problem === 'invalid') {
      g.buzz('error');
      afterFlight(o);
      return;
    }
    setFlame(true);
    smoke.set(withTiming(1, { duration: 900 }));
    flicker.set(withRepeat(withSequence(withTiming(1.12, { duration: 70 }), withTiming(0.9, { duration: 70 })), -1));
    jiggle.set(
      withRepeat(withSequence(withTiming(-1.5, { duration: 40 }), withTiming(1.5, { duration: 40 })), 24, true),
    );
    const done = () => {
      g.buzz(o.correct ? 'success' : 'error');
      afterFlight(o);
    };
    if (o.correct)
      rise.set(
        withSequence(
          withTiming(0, { duration: 900 }),
          withTiming(-size.h * 1.6, { duration: 2200, easing: Easing.in(Easing.quad) }, () => runOnJS(done)()),
        ),
      );
    else if (problem === 'not-enough')
      rise.set(
        withSequence(
          withTiming(0, { duration: 800 }),
          withTiming(-size.h * 0.3, { duration: 1300, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 1000, easing: Easing.in(Easing.quad) }, () => runOnJS(done)()),
        ),
      );
    else rise.set(withTiming(0, { duration: 1900 }, () => runOnJS(done)()));
  };

  const resetRocket = () => {
    rise.set(0);
    jiggle.set(0);
    flicker.set(1);
    smoke.set(0);
  };
  const afterReport = () => {
    resetRocket();
    if (!outcome?.correct) {
      // A failed launch: fix the rocket and try again (or the game is over).
      setOutcome(null);
      if (run.hearts <= 0 || run.status !== 'playing') void g.finish();
      else setStage('build');
      return;
    }
    setOutcome(null);
    setStage('question');
  };
  const nextMission = () => {
    if (run.status !== 'playing' || run.at >= run.total || run.hearts <= 0) {
      void g.finish();
      return;
    }
    setK(Math.floor(run.at / 2));
    setEngine(null);
    setTanks([]);
    setStage('build');
    resetRocket();
  };

  // ── The rocket: as tall as the space between the mission card and the launch bar allows ──
  const map = coverMap(size.w, size.h);
  const shown: RocketDesign | { engine: EngineId | null; tanks: TankId[] } =
    stage === 'question' && m.design ? m.design : { engine, tanks };
  const nose = ROCKET[m.payload.kind];
  const engineArt = shown.engine ? ROCKET[shown.engine] : null;
  const units =
    unitsOf(nose) + shown.tanks.reduce((n, x) => n + TANK_HEIGHT[x], 0) + (engineArt ? unitsOf(engineArt) : 0);
  const padY = size.h - BAR_H - insets.bottom - 8;
  const room = padY - cardBottom - 16;
  // Fit the height, keep the widest section between the side panels, and never thinner than a pencil.
  const between = size.w - 2 * Spacing.md - 2 * Math.max(LEFT_W, RIGHT_W) - 12;
  const widest = Math.max(1 / nose.body, engineArt ? 1 / engineArt.body : 1);
  const W = Math.max(16, Math.min(64, room / Math.max(units, 5), between / widest));
  const plumeW = W * 1.5;

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {size.w > 0 && (
        <Image
          source={SPACE_SCENES.workshop}
          style={{ position: 'absolute', left: map.ox, top: map.oy, width: map.dw, height: map.dh }}
          contentFit="cover"
          accessible={false}
        />
      )}

      {size.w > 0 && (
        <>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.smoke,
              {
                left: size.w / 2 - size.w * 0.6,
                width: size.w * 1.2,
                height: (size.w * 1.2) / ROCKET.smoke.aspect,
                top: padY - ((size.w * 1.2) / ROCKET.smoke.aspect) * 0.75,
              },
              smokeStyle,
            ]}>
            <Image source={ROCKET.smoke.src} style={StyleSheet.absoluteFill} contentFit="contain" accessible={false} />
          </Animated.View>
          <Animated.View
            style={[styles.stack, { left: size.w / 2 - 80, width: 160, bottom: size.h - padY }, rocketStyle]}
            pointerEvents="box-none">
            <Image
              source={nose.src}
              style={{ width: W / nose.body, height: W / nose.body / nose.aspect }}
              contentFit="contain"
              accessibilityLabel={m.payload.name}
            />
            {shown.tanks.map((x, n) => (
              <Pressable
                key={`${x}-${n}`}
                disabled={stage !== 'build'}
                onPress={() => setTanks(tanks.filter((_, j) => j !== n))}
                accessibilityRole="button"
                accessibilityLabel={t('rocket.removeTank', { name: run.parts.tanks[x].name })}>
                <Image
                  source={ROCKET.tank.src}
                  style={{ width: W, height: W * TANK_HEIGHT[x] }}
                  contentFit="fill"
                  accessible={false}
                />
              </Pressable>
            ))}
            {engineArt && shown.engine && (
              <View style={{ alignItems: 'center' }}>
                <Image
                  source={engineArt.src}
                  style={{ width: W / engineArt.body, height: W / engineArt.body / engineArt.aspect }}
                  contentFit="contain"
                  accessibilityLabel={run.parts.engines[shown.engine].name}
                />
                {flame && (
                  <Animated.View
                    style={[
                      styles.plume,
                      { width: plumeW, height: plumeW / ROCKET.plume.aspect, marginLeft: -plumeW / 2 },
                      plumeStyle,
                    ]}>
                    <Image
                      source={ROCKET.plume.src}
                      style={StyleSheet.absoluteFill}
                      contentFit="fill"
                      accessible={false}
                    />
                  </Animated.View>
                )}
              </View>
            )}
          </Animated.View>
          {stage === 'build' && !engine && (
            <View style={[styles.hint, { top: padY - 70 }]} pointerEvents="none">
              <Text style={{ color: '#fff', fontSize: 12, textAlign: 'center' }}>{t('rocket.empty')}</Text>
            </View>
          )}
        </>
      )}

      <SafeAreaView edges={['top']} style={styles.top} pointerEvents="box-none">
        <View onLayout={(e) => setCardBottom(e.nativeEvent.layout.y + e.nativeEvent.layout.height + insets.top)}>
          <Panel style={{ gap: 2, marginTop: 56 }}>
            <Text style={{ fontFamily: BOLD, fontSize: 14, color: '#fff' }}>
              {t('rocket.objective', { n: k + 1, total: run.missions.length, title: m.title })}
            </Text>
            <Text style={{ fontSize: 12, color: 'rgba(235,238,255,0.9)' }}>
              {t('rocket.target', { target: m.target })} ·{' '}
              {t('rocket.payload', { name: m.payload.name, mass: num(m.payload.mass) })}
            </Text>
          </Panel>
        </View>
      </SafeAreaView>

      {(stage === 'build' || stage === 'flying') && (
        <>
          {/* Readouts on the left, like a mission-control screen. */}
          <View style={[styles.side, { left: Spacing.md, width: LEFT_W, top: cardBottom + 10 }]} pointerEvents="none">
            <Panel style={styles.sidePanel}>
              <Readout label={t('rocket.readouts.mass')} value={`${num(s.mass)} kg`} />
              <Readout label={t('rocket.readouts.weight')} value={`${num(Math.round(s.weight))} N`} />
              <Readout
                label={t('rocket.readouts.thrust')}
                value={`${num(s.thrust)} N`}
                tone={engine ? (lifts ? 'good' : 'bad') : undefined}
              />
              <Readout
                label={t('rocket.readouts.dv')}
                value={`${num(Math.round(s.dv))} m/s`}
                sub={t('rocket.readouts.need', { value: `${num(m.dv)} m/s` })}
                tone={engine && tanks.length ? (s.dv >= m.dv ? 'good' : 'bad') : undefined}
              />
              <Readout
                label={t('rocket.readouts.cost')}
                value={String(s.cost)}
                sub={t('rocket.readouts.budget', { value: m.budget })}
                tone={s.cost > m.budget ? 'bad' : 'good'}
              />
              {!!engine && (
                <View style={{ flexDirection: 'row', gap: 4, alignItems: 'flex-start' }}>
                  <Ionicons
                    name={lifts ? 'checkmark-circle' : 'close-circle'}
                    size={14}
                    color={lifts ? Colors.success : '#FF8FA6'}
                  />
                  <Text style={{ flex: 1, fontSize: 10, fontFamily: BOLD, color: lifts ? Colors.success : '#FF8FA6' }}>
                    {lifts ? t('rocket.liftOff') : t('rocket.tooHeavy')}
                  </Text>
                </View>
              )}
            </Panel>
          </View>

          {/* Parts on the right. */}
          <View
            style={[
              styles.side,
              { right: Spacing.md, width: RIGHT_W, top: cardBottom + 10, bottom: BAR_H + insets.bottom + 12 },
            ]}
            pointerEvents="box-none">
            <Panel style={[styles.sidePanel, { flexShrink: 1 }]}>
              <ScrollView contentContainerStyle={{ gap: 5 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.heading}>{t('rocket.engines')}</Text>
                {ENGINE_ORDER.map((id) => {
                  const e = run.parts.engines[id];
                  const on = engine === id;
                  return (
                    <Pressable
                      key={id}
                      disabled={stage !== 'build'}
                      onPress={() => setEngine(id)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: on }}
                      style={[styles.part, on && styles.partOn]}>
                      <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 12 }}>{e.name}</Text>
                      <Text style={styles.partText}>
                        {t('rocket.engineCard', { thrust: num(e.thrust / 1000), isp: e.isp })}
                      </Text>
                      <Text style={styles.partText}>{t('rocket.partInfo', { mass: num(e.mass), cost: e.cost })}</Text>
                    </Pressable>
                  );
                })}
                <Text style={[styles.heading, { marginTop: 4 }]}>
                  {t('rocket.tanks')} · {tanks.length}/{run.parts.maxTanks}
                </Text>
                {TANK_ORDER.map((id) => {
                  const x = run.parts.tanks[id];
                  const full = tanks.length >= run.parts.maxTanks;
                  return (
                    <Pressable
                      key={id}
                      disabled={full || stage !== 'build'}
                      onPress={() => setTanks([...tanks, id])}
                      accessibilityRole="button"
                      accessibilityLabel={t('rocket.addTank', { name: x.name })}
                      style={[styles.part, full && { opacity: 0.45 }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <Ionicons name="add-circle" size={14} color={Colors.reward} />
                        <Text
                          numberOfLines={1}
                          style={{ flexShrink: 1, fontFamily: BOLD, color: '#fff', fontSize: 11 }}>
                          {x.name}
                        </Text>
                      </View>
                      <Text style={styles.partText}>{t('rocket.tankInfo', { fuel: num(x.fuel), cost: x.cost })}</Text>
                    </Pressable>
                  );
                })}
                {tanks.length > 0 && (
                  <Text style={{ fontSize: 10, color: 'rgba(235,238,255,0.7)' }}>{t('rocket.remove')}</Text>
                )}
              </ScrollView>
            </Panel>
          </View>
        </>
      )}

      <SafeAreaView edges={['bottom']} style={styles.bottom} pointerEvents="box-none">
        {stage === 'question' && m.question ? (
          <QuestionCard
            key={k}
            label={t('rocket.question')}
            q={m.question.q}
            options={m.question.options}
            onAnswer={async (choice) => {
              const res = await g.answer(
                choice === null ? { step: 2 * k + 1, timeout: true } : { step: 2 * k + 1, choice },
              );
              if (!res) return null;
              g.buzz(res.outcome.correct ? 'success' : 'error');
              return res.outcome;
            }}
            nextLabel={k + 1 >= run.missions.length ? undefined : t('rocket.nextMission')}
            onNext={nextMission}
          />
        ) : stage === 'report' && outcome ? (
          <Animated.View entering={FadeInDown}>
            <Panel style={{ gap: Spacing.sm, borderColor: outcome.correct ? Colors.success : Colors.danger }}>
              <Text style={{ fontFamily: BOLD, fontSize: 17, color: outcome.correct ? Colors.success : '#FF8FA6' }}>
                {outcome.correct
                  ? `${t('rocket.success', { target: m.target })} +${outcome.points}`
                  : t(`rocket.problems.${outcome.problem as 'budget'}`)}
              </Text>
              <GoldButton title={t('ui.next')} icon="arrow-forward" onPress={afterReport} />
            </Panel>
          </Animated.View>
        ) : (
          <GoldButton
            title={stage === 'flying' ? t('rocket.launching') : t('rocket.launch')}
            icon="rocket"
            disabled={!engine || stage !== 'build' || g.busy}
            onPress={() => void launch()}
          />
        )}
      </SafeAreaView>
      {stage === 'flying' && <Animated.View entering={FadeIn} style={styles.glow} pointerEvents="none" />}
    </View>
  );
}

function Readout({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'good' | 'bad' }) {
  return (
    <View style={styles.readout}>
      <Text numberOfLines={1} style={{ fontSize: 9, color: 'rgba(235,238,255,0.7)' }}>
        {label}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          fontFamily: BOLD,
          fontSize: 13,
          color: tone === 'good' ? Colors.success : tone === 'bad' ? '#FF8FA6' : '#fff',
        }}>
        {value}
      </Text>
      {!!sub && (
        <Text numberOfLines={1} style={{ fontSize: 9, color: 'rgba(235,238,255,0.7)' }}>
          {sub}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', left: Spacing.md, right: Spacing.md, top: 0 },
  bottom: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: Spacing.sm },
  stack: { position: 'absolute', alignItems: 'center' },
  plume: { position: 'absolute', top: '96%', left: '50%', transformOrigin: 'top' },
  smoke: { position: 'absolute' },
  hint: {
    position: 'absolute',
    alignSelf: 'center',
    left: '30%',
    right: '30%',
    padding: 6,
    borderRadius: 10,
    backgroundColor: PANEL,
  },
  side: { position: 'absolute' },
  sidePanel: { padding: 8, gap: 6 },
  readout: { paddingVertical: 4, paddingHorizontal: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.06)' },
  heading: { fontFamily: BOLD, fontSize: 10, color: Colors.reward, letterSpacing: 1 },
  part: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  partOn: { borderColor: Colors.reward, backgroundColor: 'rgba(255,200,87,0.15)' },
  partText: { fontSize: 10, color: 'rgba(235,238,255,0.85)' },
  glow: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 160, backgroundColor: 'rgba(255,150,60,0.08)' },
});
