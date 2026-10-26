import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Polyline, RadialGradient, Stop } from 'react-native-svg';

import { BOLD, GoldButton, KoraTip, Panel, PANEL } from '@/components/lab/hud';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { Body, GameOutcome, GravityRun } from '@/lib/api';
import { coverMap } from '@/lib/games/lab';
import { BOARD, fly, GOAL_R, planetRadius, placementOk } from '@/lib/games/gravity';
import { PLANETS, SPACE_SCENES } from '@/lib/games/space';
import type { SpaceGame } from '@/lib/games/use-lab-run';

const FIXED_ART = ['mars', 'moon', 'mercury'];
const MOVABLE_ART = ['jupiter', 'neptune'];
/** Shown as a planet's size on screen (its pull reaches further than this). */
const looks = (mass: number) => planetRadius(mass) * 2.3;

/**
 * Gravity Master: drag planets onto the board (and choose how heavy they are) so their pull bends
 * the comet into the portal. The first part of the path is drawn; the server flies the rest.
 */
export function GravityBoard({ g, run }: { g: SpaceGame; run: GravityRun }) {
  const { t } = useTranslation('space');
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [i, setI] = useState(() => Math.min(run.at, run.puzzles.length - 1));
  const p = run.puzzles[i]!;
  const [placed, setPlaced] = useState<(Body | null)[]>(() => p.movable.map(() => null));
  const [selected, setSelected] = useState(0);
  const [flight, setFlight] = useState<{ path: [number, number][]; shown: number } | null>(null);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const drag = useRef<{ k: number; dx: number; dy: number } | null>(null);

  // The board fits between the top panels and the controls.
  const top = 150;
  const bottom = 270;
  const scale = Math.max(1, Math.min((size.w - 24) / BOARD.w, (size.h - top - bottom) / BOARD.h));
  const ox = (size.w - BOARD.w * scale) / 2;
  const oy = top + Math.max(0, (size.h - top - bottom - BOARD.h * scale) / 2);
  const sx = (x: number) => ox + x * scale;
  const sy = (y: number) => oy + y * scale;
  // Planets wait here until you drag them onto the board.
  const trayY = size.h - 228;
  const trayX = (k: number) => size.w / 2 + (k - (p.movable.length - 1) / 2) * 90;

  const onBoard = placed.flatMap((b) => (b ? [b] : []));
  const bad = placed.map(
    (b, k) => !!b && !placementOk(b, [...p.fixed, ...onBoard.filter((o) => o !== placed[k])], p.launch, p.goal),
  );
  const ready = placed.every((b) => b) && !bad.some(Boolean);
  const preview = fly(p.launch, [...p.fixed, ...onBoard], p.goal, 3, run.preview);

  // The comet flies along the full path, then the server says how it went.
  useEffect(() => {
    if (!flight || flight.shown >= flight.path.length) return;
    // Functional update: a frame queued just before the flight was cleared must not bring it back.
    const id = requestAnimationFrame(() =>
      setFlight((f) => f && { ...f, shown: Math.min(f.path.length, f.shown + 2) }),
    );
    return () => cancelAnimationFrame(id);
  }, [flight]);

  const launch = async () => {
    if (!ready || flight) return;
    const planets = placed as Body[];
    const path = fly(p.launch, [...p.fixed, ...planets], p.goal, 2).path;
    setMessage(null);
    setFlight({ path, shown: 1 });
    const res = await g.answer({ step: i, placements: planets });
    // Let the comet finish its flight before the verdict.
    setTimeout(
      () => {
        setFlight(null);
        if (!res) return;
        const o = res.outcome;
        g.buzz(o.correct ? 'success' : 'error');
        if (o.correct) setOutcome(o);
        else
          setMessage(o.end === 'invalid' ? t('gravity.blocked') : t(`gravity.${o.end ?? 'time'}` as 'gravity.crash'));
      },
      Math.max(300, (path.length / 2) * 16),
    );
  };
  const giveUp = async () => {
    const res = await g.answer({ step: i, timeout: true });
    if (res) setOutcome(res.outcome);
  };
  const next = () => {
    if (run.status !== 'playing' || run.at >= run.puzzles.length) {
      void g.finish();
      return;
    }
    const n = run.at;
    setI(n);
    setPlaced(run.puzzles[n]!.movable.map(() => null));
    setSelected(0);
    setOutcome(null);
    setMessage(null);
  };

  // Dragging planets (from the tray or on the board).
  const where = (k: number): [number, number] => {
    const b = placed[k];
    return b ? [sx(b.x), sy(b.y)] : [trayX(k), trayY];
  };
  const grab = (e: GestureResponderEvent) => {
    if (flight || outcome) return false;
    const { pageX, pageY } = e.nativeEvent;
    const k = placed.findIndex((_, n) => {
      const [x, y] = where(n);
      return Math.hypot(pageX - x, pageY - y) < 44;
    });
    if (k < 0) return false;
    const [x, y] = where(k);
    drag.current = { k, dx: x - pageX, dy: y - pageY };
    setSelected(k);
    return true;
  };
  const move = (e: GestureResponderEvent) => {
    const d = drag.current;
    if (!d) return;
    const x = (e.nativeEvent.pageX + d.dx - ox) / scale;
    const y = (e.nativeEvent.pageY + d.dy - oy) / scale;
    const mass = placed[d.k]?.mass ?? p.movable[d.k]![Math.floor((p.movable[d.k]!.length - 1) / 2)]!;
    const inside = x > -0.05 && x < BOARD.w + 0.05 && y > -0.05 && y < BOARD.h + 0.05;
    setPlaced(
      placed.map((b, n) =>
        n === d.k
          ? inside
            ? { x: Math.min(BOARD.w, Math.max(0, x)), y: Math.min(BOARD.h, Math.max(0, y)), mass }
            : null
          : b,
      ),
    );
  };

  const map = coverMap(size.w, size.h);
  const pts = (path: [number, number][]) => path.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ');
  const comet = flight ? flight.path[Math.min(flight.shown, flight.path.length) - 1]! : null;
  const solution = outcome && !outcome.correct ? outcome.solution : undefined;

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      onStartShouldSetResponder={grab}
      onResponderMove={move}
      onResponderRelease={() => (drag.current = null)}
      onResponderTerminate={() => (drag.current = null)}>
      {size.w > 0 && (
        <View style={[StyleSheet.absoluteFill, { userSelect: 'none' }]} pointerEvents="none">
          <Image
            source={SPACE_SCENES.space}
            style={{ position: 'absolute', left: map.ox, top: map.oy, width: map.dw, height: map.dh }}
            contentFit="cover"
            accessible={false}
          />
          <View
            pointerEvents="none"
            style={[styles.board, { left: ox, top: oy, width: BOARD.w * scale, height: BOARD.h * scale }]}
          />
          <Svg width={size.w} height={size.h} style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id="comet" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#FFF4D6" />
                <Stop offset="0.5" stopColor="#FFB547" />
                <Stop offset="1" stopColor="#FF7A2B" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            {/* Where each planet's pull is strong. */}
            {[...p.fixed, ...onBoard].map((b, n) => (
              <Circle
                key={`ring-${n}`}
                cx={sx(b.x)}
                cy={sy(b.y)}
                r={(0.09 + 0.045 * b.mass) * scale}
                stroke="rgba(124,92,255,0.45)"
                strokeWidth={1.5}
                strokeDasharray="4 6"
                fill="rgba(124,92,255,0.06)"
              />
            ))}
            {!flight && !outcome && (
              <Polyline
                points={pts(preview.path)}
                stroke="rgba(255,255,255,0.75)"
                strokeWidth={2.5}
                strokeDasharray="2 7"
                strokeLinecap="round"
                fill="none"
              />
            )}
            {flight && (
              <Polyline
                points={pts(flight.path.slice(0, flight.shown))}
                stroke="rgba(255,181,71,0.8)"
                strokeWidth={3}
                fill="none"
              />
            )}
            {comet && <Circle cx={sx(comet[0])} cy={sy(comet[1])} r={14} fill="url(#comet)" />}
            {!flight && <Circle cx={sx(p.launch.x)} cy={sy(p.launch.y)} r={12} fill="url(#comet)" />}
            {solution?.map((b, n) => (
              <Circle
                key={`sol-${n}`}
                cx={sx(b.x)}
                cy={sy(b.y)}
                r={(looks(b.mass) / 2) * scale}
                stroke={Colors.success}
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="rgba(45,212,191,0.15)"
              />
            ))}
          </Svg>
          <Portal x={sx(p.goal.x)} y={sy(p.goal.y)} r={GOAL_R * scale * 1.3} />
          {p.fixed.map((b, n) => (
            <PlanetImage
              key={`fixed-${n}`}
              art={FIXED_ART[n % FIXED_ART.length]!}
              x={sx(b.x)}
              y={sy(b.y)}
              d={looks(b.mass) * scale}
            />
          ))}
          {p.movable.map((_, k) => {
            const [x, y] = where(k);
            const b = placed[k];
            return (
              <View key={`move-${k}`} pointerEvents="none">
                <PlanetImage
                  art={MOVABLE_ART[k % MOVABLE_ART.length]!}
                  x={x}
                  y={y}
                  d={looks(b?.mass ?? 2) * scale}
                  ring={bad[k] ? Colors.danger : selected === k ? Colors.reward : undefined}
                />
              </View>
            );
          })}
        </View>
      )}

      <SafeAreaView edges={['top']} style={styles.top} pointerEvents="box-none">
        <Panel style={{ marginTop: 56, gap: 2 }}>
          <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 14 }}>
            {t('gravity.objective', { n: i + 1, total: run.puzzles.length })}
          </Text>
          <Text style={{ color: 'rgba(235,238,255,0.85)', fontSize: 12 }}>
            {p.movable.length > 1 ? t('gravity.placeMany') : t('gravity.place')} ·{' '}
            {t('gravity.tries', { count: run.puzzles[i]!.tries })}
          </Text>
        </Panel>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.bottom} pointerEvents="box-none">
        {outcome ? (
          <Animated.View entering={FadeInDown}>
            <Panel style={{ gap: Spacing.sm, borderColor: outcome.correct ? Colors.success : Colors.reward }}>
              <Text style={{ fontFamily: BOLD, fontSize: 17, color: outcome.correct ? Colors.success : '#fff' }}>
                {outcome.correct ? t('gravity.hit', { points: outcome.points }) : t('gravity.solution')}
              </Text>
              <GoldButton title={t('gravity.next')} icon="arrow-forward" onPress={next} />
            </Panel>
          </Animated.View>
        ) : (
          <View style={{ gap: Spacing.sm }}>
            <View style={styles.trayRow} pointerEvents="box-none">
              {p.movable[selected]!.length > 1 && placed[selected] && (
                <View style={styles.masses}>
                  <Text style={{ color: '#fff', fontSize: 12, fontFamily: BOLD }}>{t('gravity.mass')}</Text>
                  {p.movable[selected]!.map((m) => (
                    <Pressable
                      key={m}
                      disabled={!!flight}
                      onPress={() => setPlaced(placed.map((b, n) => (n === selected && b ? { ...b, mass: m } : b)))}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: placed[selected]?.mass === m }}
                      style={[styles.mass, placed[selected]?.mass === m && styles.massOn]}>
                      <Text style={{ color: '#fff', fontSize: 12 }}>
                        {t(`gravity.masses.${m}` as 'gravity.masses.1')}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
            {message ? (
              <KoraTip text={message} />
            ) : bad.some(Boolean) ? (
              <KoraTip text={t('gravity.blocked')} />
            ) : (
              <KoraTip text={t('gravity.tip')} />
            )}
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <Pressable
                onPress={() => {
                  setPlaced(p.movable.map(() => null));
                  setMessage(null);
                }}
                disabled={!!flight}
                accessibilityRole="button"
                style={styles.secondary}>
                <Text style={{ fontFamily: BOLD, color: '#fff' }}>{t('gravity.reset')}</Text>
              </Pressable>
              {run.puzzles[i]!.tries >= 3 && (
                <Pressable
                  onPress={() => void giveUp()}
                  disabled={!!flight || g.busy}
                  accessibilityRole="button"
                  style={styles.secondary}>
                  <Text style={{ fontFamily: BOLD, color: '#fff' }}>{t('gravity.skip')}</Text>
                </Pressable>
              )}
              <View style={{ flex: 1 }}>
                <GoldButton
                  title={t('gravity.launch')}
                  icon="rocket"
                  disabled={!ready || !!flight || g.busy}
                  onPress={() => void launch()}
                />
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

function PlanetImage({ art, x, y, d, ring }: { art: string; x: number; y: number; d: number; ring?: string }) {
  const a = PLANETS[art]!;
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: x - (d * a.aspect) / 2, top: y - d / 2, width: d * a.aspect, height: d }}>
      <Image source={a.src} style={{ width: d * a.aspect, height: d }} contentFit="contain" accessible={false} />
      {!!ring && (
        <View
          style={[
            styles.ring,
            { borderColor: ring, borderRadius: d, left: (d * a.aspect - d) / 2 - 4, width: d + 8, height: d + 8 },
          ]}
        />
      )}
    </View>
  );
}

/** The goal: a slowly turning ring of light. */
function Portal({ x, y, r }: { x: number; y: number; r: number }) {
  const spin = useSharedValue(0);
  useEffect(() => {
    spin.set(withRepeat(withTiming(360, { duration: 4000, easing: Easing.linear }), -1));
  }, [spin]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r }, style]}>
      <Svg width={2 * r} height={2 * r}>
        <Circle
          cx={r}
          cy={r}
          r={r - 2}
          stroke="#2DD4BF"
          strokeWidth={3}
          strokeDasharray="10 6"
          fill="rgba(45,212,191,0.12)"
        />
        <Circle cx={r} cy={r} r={r * 0.55} stroke="#9FF5E8" strokeWidth={2} fill="none" />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  board: {
    position: 'absolute',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(124,92,255,0.35)',
    backgroundColor: 'rgba(8,10,30,0.25)',
  },
  top: { position: 'absolute', left: Spacing.md, right: Spacing.md, top: 0 },
  bottom: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: Spacing.sm },
  trayRow: { minHeight: 36, alignItems: 'center' },
  masses: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 6, borderRadius: 999, backgroundColor: PANEL },
  mass: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  massOn: { borderColor: Colors.reward, backgroundColor: 'rgba(255,200,87,0.2)' },
  secondary: {
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,92,255,0.35)',
  },
  ring: { position: 'absolute', top: -4, borderWidth: 2.5 },
});
