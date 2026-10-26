import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { clampWalk, coverMap, LAB_PLACE, nearestStation, studentHeight, type Place } from '@/lib/games/lab';

import { ActionButton, BOLD, PANEL } from './hud';
import { Joystick } from './joystick';

const SPEED_X = 0.26;
const SPEED_Y = 0.2;

/**
 * A walkable 2.5D place (the lab hall by default): walk with the joystick (or tap a station to walk
 * there), and open a station when you're next to it. The picture is wider than the phone, so the
 * view follows the student. Station names come from `stations.<id>` in the `ns` namespace.
 */
export function LabHall<S extends string = string>({
  place = LAB_PLACE as unknown as Place<S>,
  ns = 'lab',
  onOpen,
  badges,
  goal,
  paused,
  topReserve = 170,
  names,
  openLabel,
}: {
  place?: Place<S>;
  ns?: 'lab' | 'space' | 'history' | 'tech';
  onOpen: (station: S) => void;
  /** Small text under a station's name (stars, "Your list"…). */
  badges?: Partial<Record<S, string>>;
  /** Where the current task wants you to go (highlighted). */
  goal?: S | null;
  paused?: boolean;
  /** Space at the top taken by panels; labels stay below it. */
  topReserve?: number;
  /** Station names, when they aren't in the translations. */
  names?: Partial<Record<S, string>>;
  /** The action button's text next to a station ("Use the …" by default). */
  openLabel?: string;
}) {
  const { t } = useTranslation(ns);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [pos, setPos] = useState<[number, number]>(place.start);
  const posRef = useRef<[number, number]>(place.start);
  const [look, setLook] = useState<{ pose: 'back' | 'walk' | 'side'; flip: boolean }>({ pose: 'back', flip: false });
  const joy = useRef({ x: 0, y: 0 });
  const target = useRef<{ to: [number, number]; open: S } | null>(null);
  const placeRef = useRef(place);
  const onOpenRef = useRef(onOpen);
  useEffect(() => {
    onOpenRef.current = onOpen;
    placeRef.current = place;
  });

  // Movement loop: joystick first, otherwise walking to a tapped station.
  useEffect(() => {
    if (paused) return;
    let raf = 0;
    let last = Date.now();
    let stride = 0;
    const tick = () => {
      const now = Date.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const [x, y] = posRef.current;
      let vx = joy.current.x;
      let vy = joy.current.y;
      if (vx || vy) target.current = null;
      else if (target.current) {
        const [tx, ty] = target.current.to;
        const dx = tx - x;
        const dy = ty - y;
        const len = Math.hypot(dx, dy);
        if (len < 0.012) {
          const open = target.current.open;
          target.current = null;
          onOpenRef.current(open);
        } else {
          vx = dx / len;
          vy = dy / len;
        }
      }
      if (vx || vy) {
        stride += dt;
        const next = clampWalk(placeRef.current, x + vx * SPEED_X * dt, y + vy * SPEED_Y * dt);
        posRef.current = next;
        setPos(next);
        const sideways = Math.abs(vx) > Math.abs(vy) * 0.9 || vy > 0.3;
        setLook({
          pose: sideways ? 'side' : Math.floor(stride / 0.25) % 2 ? 'walk' : 'back',
          flip: sideways && vx > 0,
        });
      } else setLook((l) => (l.pose === 'back' && !l.flip ? l : { pose: 'back', flip: false }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  const [x, y] = pos;
  const base = coverMap(size.w, size.h);
  // Follow the student sideways when the picture is wider than the screen.
  const ox = base.dw > size.w ? Math.min(0, Math.max(size.w - base.dw, size.w / 2 - x * base.dw)) : base.ox;
  const map = { x: (fx: number) => ox + fx * base.dw, y: (fy: number) => base.oy + fy * base.dh };
  const near = nearestStation(place, x, y);
  const sprite = place.sprites[look.pose];
  const sh = studentHeight(place, y) * base.dh;
  const sw = sh * sprite.aspect;
  const nameOf = (id: S) => names?.[id] ?? t(`stations.${id}` as never);

  const walkTo = (id: S) => {
    target.current = { to: clampWalk(place, ...place.stations[id].stand), open: id };
  };

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {size.w > 0 && (
        <>
          <Image
            source={place.scene}
            style={{ position: 'absolute', left: ox, top: base.oy, width: base.dw, height: base.dh }}
            contentFit="cover"
            accessible={false}
          />
          <Image
            source={sprite.src}
            style={{
              position: 'absolute',
              left: map.x(x) - sw / 2,
              top: map.y(y) - sh,
              width: sw,
              height: sh,
              transform: [{ scaleX: look.flip ? -1 : 1 }],
            }}
            contentFit="contain"
            accessibilityLabel={t('hall.you')}
          />
          {labelSpots(place, map, size, topReserve).map(({ id, left, top }) => {
            const isGoal = goal === id;
            return (
              <Pressable
                key={id}
                onPress={() => walkTo(id)}
                accessibilityRole="button"
                accessibilityLabel={t('hall.walkTo', { station: nameOf(id) })}
                style={[styles.label, { left, top }, isGoal && styles.goal]}>
                <Ionicons
                  name={place.stations[id].icon as keyof typeof Ionicons.glyphMap}
                  size={14}
                  color={isGoal ? '#3A2600' : Colors.reward}
                />
                <View>
                  <Text
                    numberOfLines={1}
                    style={{ fontFamily: BOLD, fontSize: 12, color: isGoal ? '#3A2600' : '#fff' }}>
                    {nameOf(id)}
                  </Text>
                  {!!badges?.[id] && (
                    <Text
                      numberOfLines={1}
                      style={{ fontSize: 10, color: isGoal ? '#3A2600' : 'rgba(235,238,255,0.8)' }}>
                      {badges[id]}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </>
      )}
      <SafeAreaView edges={['bottom']} style={styles.controls} pointerEvents="box-none">
        <Joystick onMove={(v) => (joy.current = v)} />
        {near ? (
          <ActionButton
            icon="enter"
            label={openLabel ?? t('hall.open', { station: nameOf(near) })}
            onPress={() => onOpen(near)}
            gold={goal === near}
          />
        ) : (
          <View style={{ width: 92 }} />
        )}
      </SafeAreaView>
    </View>
  );
}

const LABEL_W = 140;
const LABEL_H = 44;

/**
 * Where each station's label goes: next to the station, kept on screen and below the top panels,
 * and moved down when it would cover another label.
 */
function labelSpots<S extends string>(
  place: Place<S>,
  map: { x: (f: number) => number; y: (f: number) => number },
  size: { w: number; h: number },
  topReserve: number,
) {
  const spots = (Object.keys(place.stations) as S[])
    .map((id) => {
      const [lx, ly] = place.stations[id].label;
      return {
        id,
        left: Math.min(size.w - LABEL_W - 8, Math.max(8, map.x(lx) - LABEL_W / 2)),
        top: Math.min(size.h - 260, Math.max(topReserve, map.y(ly) - LABEL_H / 2)),
      };
    })
    .sort((a, b) => a.top - b.top);
  const placed: typeof spots = [];
  for (const s of spots) {
    while (placed.some((p) => Math.abs(p.left - s.left) < LABEL_W && Math.abs(p.top - s.top) < LABEL_H + 4))
      s.top += LABEL_H + 6;
    placed.push(s);
  }
  return placed;
}

const styles = StyleSheet.create({
  label: {
    position: 'absolute',
    width: 140,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: PANEL,
    borderWidth: 1,
    borderColor: 'rgba(255,200,87,0.4)',
  },
  goal: { backgroundColor: Colors.reward, borderColor: '#fff' },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
});
