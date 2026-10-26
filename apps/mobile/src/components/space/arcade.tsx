import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { SPACE_SCENES, SPRITES } from '@/lib/games/space';

type Rock = {
  id: number;
  kind: 'asteroid1' | 'asteroid2' | 'enemy';
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  spin: number;
  phase: number;
};
type Shot = { id: number; x: number; y: number };
type Boom = { id: number; x: number; y: number; size: number; t: number };

/** Ship size as a share of the screen width. */
const SHIP = 0.17;

/**
 * The flying part of Galaxy Defender and Asteroid Survival: a ship you steer by dragging, asteroids
 * (and, in Defender, alien drones) to dodge, and lasers. It's all played here in the app; it only
 * decides how many times you were hit. What earns points is the questions, checked on the server.
 */
export function Arcade({
  mode,
  running,
  level,
  wave = 1,
  thrusters = 0,
  laser = 0,
  blast = 0,
  bossHp,
  onHit,
}: {
  mode: 'defender' | 'survival';
  running: boolean;
  level: number;
  /** Survival: later waves are busier. */
  wave?: number;
  /** Upgrade levels (Survival). */
  thrusters?: number;
  laser?: number;
  /** Increase it to fire the big beam at the boss (a right answer in Defender). */
  blast?: number;
  /** Defender: the boss's health, 0 to 1. */
  bossHp?: number;
  onHit?: () => void;
}) {
  const { t } = useTranslation('space');
  const [size, setSize] = useState({ w: 0, h: 0 });
  const world = useRef<World | null>(null);
  if (world.current == null) world.current = newWorld();
  const [view, setView] = useState<World>(newWorld);
  const props = useRef({ mode, level, wave, thrusters, laser, onHit, size });
  useEffect(() => {
    props.current = { mode, level, wave, thrusters, laser, onHit, size };
  });

  // A right answer fires the big beam.
  useEffect(() => {
    if (blast > 0 && world.current) world.current.beamUntil = world.current.time + 0.6;
  }, [blast]);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = Date.now();
    const tick = () => {
      const now = Date.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(world.current!, props.current, dt);
      setView(snapshot(world.current!));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const w = view;
  const W = size.w;
  const H = size.h;
  const shipW = SHIP * W;
  const shipH = shipW / SPRITES.ship.aspect;
  const flashing = w.time < w.safeUntil && Math.floor(w.time * 10) % 2 === 0;
  const bossW = Math.min(W * 0.5, 240);
  const bossH = bossW / SPRITES.boss.aspect;
  const beam = w.time < w.beamUntil;

  const steer = (e: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (!W) return;
    const x = Math.min(0.94, Math.max(0.06, e.nativeEvent.locationX / W));
    const y =
      props.current.mode === 'survival' ? Math.min(0.9, Math.max(0.35, e.nativeEvent.locationY / H - 0.08)) : 0.82;
    world.current!.target = { x, y };
  };

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={steer}
      onResponderMove={steer}
      accessibilityLabel={t('ui.drag')}>
      {W > 0 && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* The starfield scrolls down to give a feeling of flying forward. */}
          {[0, 1].map((k) => (
            <Image
              key={k}
              source={SPACE_SCENES.space}
              style={{ position: 'absolute', left: 0, width: W, height: H, top: ((w.scroll % H) + H * (k - 1)) | 0 }}
              contentFit="cover"
              accessible={false}
            />
          ))}
          {mode === 'defender' && bossHp !== undefined && bossHp > 0 && (
            <Image
              source={SPRITES.boss.src}
              style={{
                position: 'absolute',
                left: w.bossX * W - bossW / 2,
                top: 16 + Math.sin(w.time * 1.3) * 6,
                width: bossW,
                height: bossH,
                opacity: beam && Math.floor(w.time * 20) % 2 ? 0.5 : 1,
              }}
              contentFit="contain"
              accessible={false}
            />
          )}
          {beam && (
            <Svg
              style={{
                position: 'absolute',
                left: w.ship.x * W - 22,
                top: 16 + bossH * 0.6,
                width: 44,
                height: w.ship.y * H - 16 - bossH * 0.6,
              }}>
              <Defs>
                <LinearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor="#B04CFF" stopOpacity="0" />
                  <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="1" />
                  <Stop offset="1" stopColor="#B04CFF" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="44" height="100%" fill="url(#beam)" />
            </Svg>
          )}
          {w.shots.map((s) => (
            <View key={s.id} style={[styles.shot, { left: s.x * W - 2, top: s.y * H - 9 }]} />
          ))}
          {w.rocks.map((r) => {
            const art = SPRITES[r.kind];
            const rw = r.size * W;
            return (
              <Image
                key={r.id}
                source={art.src}
                style={{
                  position: 'absolute',
                  left: r.x * W - rw / 2,
                  top: r.y * H - rw / art.aspect / 2,
                  width: rw,
                  height: rw / art.aspect,
                  transform: [{ rotate: `${r.kind === 'enemy' ? 0 : r.rot}rad` }],
                }}
                contentFit="contain"
                accessible={false}
              />
            );
          })}
          {w.booms.map((b) => (
            <View
              key={b.id}
              style={[
                styles.boom,
                {
                  left: b.x * W - (b.size * W * (0.5 + b.t)) / 2,
                  top: b.y * H - (b.size * W * (0.5 + b.t)) / 2,
                  width: b.size * W * (0.5 + b.t),
                  height: b.size * W * (0.5 + b.t),
                  opacity: 1 - b.t,
                },
              ]}
            />
          ))}
          <Image
            source={SPRITES.ship.src}
            style={{
              position: 'absolute',
              left: w.ship.x * W - shipW / 2,
              top: w.ship.y * H - shipH / 2,
              width: shipW,
              height: shipH,
              opacity: flashing ? 0.3 : 1,
            }}
            contentFit="contain"
            accessibilityLabel={t('hall.you')}
          />
        </View>
      )}
    </View>
  );
}

type World = {
  ship: { x: number; y: number };
  target: { x: number; y: number };
  rocks: Rock[];
  shots: Shot[];
  booms: Boom[];
  nextId: number;
  spawn: number;
  fire: number;
  safeUntil: number;
  scroll: number;
  beamUntil: number;
  bossX: number;
  time: number;
};

const newWorld = (): World => ({
  ship: { x: 0.5, y: 0.82 },
  target: { x: 0.5, y: 0.82 },
  rocks: [],
  shots: [],
  booms: [],
  nextId: 1,
  spawn: 0,
  fire: 0,
  safeUntil: 0,
  scroll: 0,
  beamUntil: 0,
  bossX: 0.5,
  time: 0,
});

/** A copy of the world to draw (the loop keeps changing the original). */
const snapshot = (w: World): World => ({
  ...w,
  ship: { ...w.ship },
  rocks: w.rocks.map((r) => ({ ...r })),
  shots: w.shots.map((x) => ({ ...x })),
  booms: w.booms.map((b) => ({ ...b })),
});

/** One frame of the world: move, spawn, shoot and collide. */
function step(
  w: World,
  p: {
    mode: 'defender' | 'survival';
    level: number;
    wave: number;
    thrusters: number;
    laser: number;
    onHit?: () => void;
    size: { w: number; h: number };
  },
  dt: number,
) {
  const aspect = p.size.h / Math.max(1, p.size.w);
  w.time += dt;
  w.scroll += dt * 60;
  w.bossX = 0.5 + Math.sin(w.time * 0.7) * 0.22;

  // The ship glides towards your finger.
  const follow = Math.min(1, dt * (7 + 3 * p.thrusters));
  w.ship.x += (w.target.x - w.ship.x) * follow;
  w.ship.y += (w.target.y - w.ship.y) * follow;

  // New asteroids (and drones): more and faster with level and wave.
  const busy = p.level + (p.mode === 'survival' ? p.wave * 0.8 : 0);
  w.spawn -= dt;
  if (w.spawn <= 0) {
    w.spawn = Math.max(0.28, 1.25 - busy * 0.11) * (0.7 + Math.random() * 0.6);
    const enemy = p.mode === 'defender' && Math.random() < 0.35;
    const fromSide = p.mode === 'survival' && p.wave >= 3 && Math.random() < 0.25;
    const speed = (0.16 + busy * 0.025) * (0.8 + Math.random() * 0.5);
    w.rocks.push({
      id: w.nextId++,
      kind: enemy ? 'enemy' : Math.random() < 0.5 ? 'asteroid1' : 'asteroid2',
      x: fromSide ? (Math.random() < 0.5 ? -0.1 : 1.1) : 0.08 + Math.random() * 0.84,
      y: fromSide ? 0.2 + Math.random() * 0.3 : -0.08,
      vx: fromSide ? 0.12 * (Math.random() < 0.5 ? 1 : -1) : (Math.random() - 0.5) * 0.08,
      vy: speed,
      size: enemy ? 0.13 : 0.08 + Math.random() * 0.1,
      rot: Math.random() * 6,
      spin: (Math.random() - 0.5) * 3,
      phase: Math.random() * 6,
    });
    const last = w.rocks.at(-1)!;
    if (fromSide && last.x > 1) last.vx = -Math.abs(last.vx);
    if (fromSide && last.x < 0) last.vx = Math.abs(last.vx);
  }

  // Lasers: always in Defender; in Survival once the laser is upgraded.
  const rate = p.mode === 'defender' ? 0.28 : p.laser > 0 ? 0.9 - p.laser * 0.2 : 0;
  if (rate) {
    w.fire -= dt;
    if (w.fire <= 0) {
      w.fire = rate;
      w.shots.push({ id: w.nextId++, x: w.ship.x, y: w.ship.y - 0.05 });
    }
  }
  for (const s of w.shots) s.y -= dt * 1.1;
  w.shots = w.shots.filter((s) => s.y > -0.05);

  for (const r of w.rocks) {
    r.y += r.vy * dt;
    r.x += (r.kind === 'enemy' ? Math.sin(w.time * 2 + r.phase) * 0.18 : r.vx) * dt;
    r.rot += r.spin * dt;
  }

  // Lasers hit rocks and drones.
  const hitRadius = (r: Rock) => r.size * 0.42;
  w.rocks = w.rocks.filter((r) => {
    const shot = w.shots.find((s) => Math.hypot(s.x - r.x, (s.y - r.y) * aspect) < hitRadius(r));
    if (!shot) return true;
    w.shots = w.shots.filter((s) => s !== shot);
    w.booms.push({ id: w.nextId++, x: r.x, y: r.y, size: r.size, t: 0 });
    return false;
  });

  // Something hits the ship (then a moment of safety).
  if (w.time > w.safeUntil) {
    const hit = w.rocks.find((r) => Math.hypot(r.x - w.ship.x, (r.y - w.ship.y) * aspect) < hitRadius(r) + SHIP * 0.33);
    if (hit) {
      w.safeUntil = w.time + 1.2;
      w.rocks = w.rocks.filter((r) => r !== hit);
      w.booms.push({ id: w.nextId++, x: hit.x, y: hit.y, size: hit.size * 1.4, t: 0 });
      p.onHit?.();
    }
  }
  w.rocks = w.rocks.filter((r) => r.y < 1.15 && r.x > -0.2 && r.x < 1.2);
  for (const b of w.booms) b.t += dt * 2.2;
  w.booms = w.booms.filter((b) => b.t < 1);
}

const styles = StyleSheet.create({
  shot: {
    position: 'absolute',
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#E3B5FF',
    boxShadow: '0 0 8px #B04CFF',
  },
  boom: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,170,60,0.7)',
    borderWidth: 2,
    borderColor: 'rgba(255,240,200,0.9)',
  },
});
