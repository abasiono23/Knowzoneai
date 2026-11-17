import { Image } from 'expo-image';
import { memo, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import Svg, { Ellipse, G, Path } from 'react-native-svg';

import { MOUTH_COLORS as C, REST, VISEMES, mixShapes, mouthPaths, openBy, type MouthShape } from '@/lib/kora/mouth';

/**
 * Cartoon Kora. Three body poses (cut-outs with the mouth left blank), a closed-eyes patch for each,
 * and a mouth drawn here as vectors so it can follow her voice: the kit is in assets/kora, made by
 * apps/server/.kora-lessons/kit/compose.py. All measurements are pixels of the 864 × 1152 pictures.
 */
export type KoraPose = 'rest' | 'explain' | 'point';

/** The web has no native animation driver. */
const USE_NATIVE = Platform.OS !== 'web';
const W = 864;
const H = 1152;
const KIT: Record<KoraPose, { body: number; blink: number; mouth: [number, number, number]; eyes: [number, number, number, number] }> = {
  rest: {
    body: require('@/assets/kora/rest.webp'),
    blink: require('@/assets/kora/rest-blink.webp'),
    mouth: [429, 455, 0],
    eyes: [290, 286, 570, 366],
  },
  explain: {
    body: require('@/assets/kora/explain.webp'),
    blink: require('@/assets/kora/explain-blink.webp'),
    mouth: [437, 436, -5],
    eyes: [286, 276, 570, 370],
  },
  point: {
    body: require('@/assets/kora/point.webp'),
    blink: require('@/assets/kora/point-blink.webp'),
    mouth: [419, 447, -3],
    eyes: [274, 284, 554, 366],
  },
};
const POSES = Object.keys(KIT) as KoraPose[];

/** What the mouth should be doing right now: a shape from the mouth set, and how loud the voice is (0 to 1). */
export type MouthNow = () => { viseme: number; level: number };

type Props = {
  pose: KoraPose;
  /** Asked every frame while `speaking`; without it the mouth rests. */
  mouth?: MouthNow;
  speaking?: boolean;
  /** Width in points; the height follows (3:4). */
  width: number;
};

export function KoraAvatar({ pose, mouth, speaking = false, width }: Props) {
  const height = (width * H) / W;
  // A pose changes in a single frame, with a small settle. Two poses are never on screen together:
  // fading between different arm positions would show both pairs of hands at once.
  const [settle] = useState(() => new Animated.Value(1));
  const [breath] = useState(() => new Animated.Value(0));
  const [blink, setBlink] = useState(false);
  const current = useRef(pose);

  useEffect(() => {
    if (pose === current.current) return;
    current.current = pose;
    settle.setValue(0.985);
    Animated.timing(settle, { toValue: 1, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE }).start();
  }, [pose, settle]);

  // Slow breathing, so she is never a still picture.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: USE_NATIVE }),
        Animated.timing(breath, { toValue: 0, duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: USE_NATIVE }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breath]);

  // Blinks every few seconds, sometimes twice.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let live = true;
    const wait = () => {
      timer = setTimeout(
        () => {
          if (!live) return;
          setBlink(true);
          timer = setTimeout(() => {
            if (!live) return;
            setBlink(false);
            wait();
          }, 130);
        },
        Math.random() < 0.18 ? 320 : 2200 + Math.random() * 3200,
      );
    };
    wait();
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <Animated.View
      style={{
        width,
        height,
        transform: [{ translateY: breath.interpolate({ inputRange: [0, 1], outputRange: [0, -width * 0.006] }) }, { scale: settle }],
      }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      {POSES.map((p) => (
        // Every pose stays mounted, so a change never waits for a picture; only the current one is visible.
        <View key={p} style={[StyleSheet.absoluteFill, { opacity: p === pose ? 1 : 0 }]}>
          <Layer pose={p} width={width} blink={blink} mouth={p === pose ? mouth : undefined} speaking={speaking && p === pose} />
        </View>
      ))}
    </Animated.View>
  );
}

const Layer = memo(function Layer({ pose, width, blink, mouth, speaking }: { pose: KoraPose; width: number; blink: boolean; mouth?: MouthNow; speaking: boolean }) {
  const kit = KIT[pose];
  const k = width / W;
  const [x0, y0, x1, y1] = kit.eyes;
  return (
    <View style={StyleSheet.absoluteFill}>
      <Image source={kit.body} style={StyleSheet.absoluteFill} contentFit="fill" transition={0} />
      <Image
        source={kit.blink}
        style={{ position: 'absolute', left: x0 * k, top: y0 * k, width: (x1 - x0) * k, height: (y1 - y0) * k, opacity: blink ? 1 : 0 }}
        contentFit="fill"
        transition={0}
      />
      <Mouth at={kit.mouth} now={mouth} speaking={speaking} />
    </View>
  );
});

const same = (a: MouthShape, b: MouthShape) =>
  Math.abs(a.w - b.w) + Math.abs(a.bot - b.bot) + Math.abs(a.top - b.top) + Math.abs(a.lift - b.lift) + Math.abs(a.ll - b.ll) < 0.6;

/**
 * The mouth. Each frame it asks what shape the voice needs and glides part of the way there, so the
 * lips move rather than snap; loud syllables open wider. It redraws only while the shape is changing.
 */
function Mouth({ at, now, speaking }: { at: [number, number, number]; now?: MouthNow; speaking: boolean }) {
  const [shape, setShape] = useState<MouthShape>(VISEMES[REST]);
  const current = useRef(shape);
  const nowRef = useRef(now);
  useEffect(() => {
    nowRef.current = now;
  }, [now]);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const tick = (time: number) => {
      raf = requestAnimationFrame(tick);
      // About 30 pictures a second is as fast as lips need.
      if (time - last < 30) return;
      const dt = Math.min(100, time - last || 33);
      last = time;
      const want = speaking && nowRef.current ? nowRef.current() : { viseme: REST, level: 0 };
      const base = VISEMES[want.viseme] ?? VISEMES[REST];
      const target = openBy(base, 0.72 + want.level * 0.5);
      // Closing for M, B and P must be quick enough to be seen; everything else eases.
      const speed = want.viseme === 1 ? 0.85 : 1 - Math.exp(-dt / 38);
      const next = mixShapes(current.current, target, speed);
      if (same(next, current.current)) return;
      current.current = same(next, target) ? target : next;
      setShape(current.current);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speaking]);

  const p = mouthPaths(shape);
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${W} ${H}`} pointerEvents="none">
      <G transform={`translate(${at[0]} ${at[1]}) rotate(${at[2]})`}>
        {p.inside && <Path d={p.inside} fill={C.inside} />}
        {p.tongue && <Path d={p.tongue} fill={C.tongue} />}
        {p.upperTeeth && <Path d={p.upperTeeth} fill={C.teeth} />}
        {p.lowerTeeth && <Path d={p.lowerTeeth} fill={C.teeth} />}
        <Path d={p.upperLip} fill={C.upperLip} />
        <Path d={p.lowerLip} fill={C.lowerLip} stroke={C.line} strokeWidth={2.6} strokeLinejoin="round" />
        {p.shine.map((s, i) => (
          <Ellipse key={i} cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} fill={C.shine} />
        ))}
        <Path d={p.line} fill="none" stroke={C.line} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}
