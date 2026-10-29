import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { BookBackground } from '@/components/brand/book-background';
import { ConfirmDialog } from '@/components/world/overlays';
import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { BOARD, BOARD_COLORS, roomsApi, type Stroke } from '@/lib/rooms';

const POLL_MS = 1500;
const WIDTHS = [4, 9, 18];
/** Points closer together than this (board units) are skipped, to keep strokes small. */
const STEP = 4;

const pathOf = (p: number[]) => {
  if (p.length < 2) return '';
  let d = `M${p[0]} ${p[1]}`;
  for (let i = 2; i < p.length; i += 2) d += ` L${p[i]} ${p[i + 1]}`;
  // A single tap still leaves a dot.
  return p.length === 2 ? `${d} L${p[0]! + 0.5} ${p[1]}` : d;
};

/**
 * The room's shared whiteboard: draw with a finger, and everyone in the room sees it within a second
 * or two. Undo takes back your own last stroke; the host can wipe the whole board.
 */
export default function Whiteboard() {
  const { t } = useTranslation('rooms');
  const { id } = useLocalSearchParams<{ id: string }>();
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [live, setLive] = useState<number[] | null>(null);
  const [color, setColor] = useState(BOARD_COLORS[0]!);
  const [width, setWidth] = useState(WIDTHS[1]!);
  const [board, setBoard] = useState({ w: 0, h: 0 });
  const [room, setRoom] = useState<{ name: string; host: boolean } | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const cursor = useRef({ last: 0, version: 0 });
  const drawing = useRef<number[]>([]);

  const pull = useCallback(
    async (full = false) => {
      try {
        const u = await roomsApi.board(id, full ? undefined : cursor.current.last, cursor.current.version);
        cursor.current = { last: u.last, version: u.version };
        setStrokes((old) =>
          u.full ? u.strokes : [...old, ...u.strokes.filter((s) => !old.some((o) => o.id === s.id))],
        );
        setNote(null);
      } catch (e) {
        setNote(errorText(e, t('loadFailed')));
      }
    },
    [id, t],
  );

  useFocusEffect(
    useCallback(() => {
      void pull(true);
      roomsApi
        .state(id)
        .then((s) => setRoom({ name: s.room.name, host: s.room.host }))
        .catch(() => {});
      const timer = setInterval(() => void pull(), POLL_MS);
      return () => clearInterval(timer);
    }, [id, pull]),
  );

  const send = useCallback(
    async (points: number[]) => {
      const temp: Stroke = { id: `local-${Date.now()}`, color, width, points, mine: true };
      setStrokes((s) => [...s, temp]);
      try {
        const { stroke } = await roomsApi.draw(id, { color, width, points });
        setStrokes((s) => {
          const rest = s.filter((x) => x.id !== temp.id);
          return rest.some((x) => x.id === stroke.id) ? rest : [...rest, stroke];
        });
      } catch (e) {
        setStrokes((s) => s.filter((x) => x.id !== temp.id));
        setNote(errorText(e));
      }
    },
    [id, color, width],
  );

  // Finger positions become board units, so every screen size shows the drawing the same way. The
  // board's position is taken when a stroke starts, so a finger sliding off the edge stays on it.
  const origin = useRef({ x: 0, y: 0 });
  const at = (e: GestureResponderEvent) => {
    const scale = board.w ? BOARD.width / board.w : 1;
    const x = (e.nativeEvent.pageX - origin.current.x) * scale;
    const y = (e.nativeEvent.pageY - origin.current.y) * scale;
    return [
      Math.round(Math.min(BOARD.width, Math.max(0, x))),
      Math.round(Math.min(BOARD.height, Math.max(0, y))),
    ] as const;
  };
  const start = (e: GestureResponderEvent) => {
    origin.current = {
      x: e.nativeEvent.pageX - e.nativeEvent.locationX,
      y: e.nativeEvent.pageY - e.nativeEvent.locationY,
    };
    drawing.current = [...at(e)];
    setLive([...drawing.current]);
  };
  const move = (e: GestureResponderEvent) => {
    const [x, y] = at(e);
    const p = drawing.current;
    if (!p.length || p.length >= 1200 || Math.hypot(x - p[p.length - 2]!, y - p[p.length - 1]!) < STEP) return;
    p.push(x, y);
    setLive([...p]);
  };
  const finish = () => {
    const points = drawing.current;
    drawing.current = [];
    setLive(null);
    if (points.length >= 2) void send(points);
  };

  const fit = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    const bw = Math.min(w, (h * BOARD.width) / BOARD.height);
    setBoard({ w: bw, h: (bw * BOARD.height) / BOARD.width });
  };

  const undo = () =>
    void roomsApi
      .undo(id)
      .then(() => pull(true))
      .catch((e) => setNote(errorText(e)));
  const clear = () => {
    setConfirm(false);
    void roomsApi
      .clearBoard(id)
      .then(() => pull(true))
      .catch((e) => setNote(errorText(e)));
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <BookBackground />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.top}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('title')}
            hitSlop={10}
            style={styles.round}>
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text variant="heading">{t('board.title')}</Text>
            {room && (
              <Text variant="small" color={Colors.textSecondary} numberOfLines={1}>
                {room.name}
              </Text>
            )}
          </View>
          <Pressable
            onPress={undo}
            accessibilityRole="button"
            accessibilityLabel={t('board.undo')}
            style={styles.round}>
            <Ionicons name="arrow-undo" size={20} color={Colors.text} />
          </Pressable>
          <Pressable
            onPress={() => setConfirm(true)}
            accessibilityRole="button"
            accessibilityLabel={room?.host ? t('board.clearAll') : t('board.clearMine')}
            style={styles.round}>
            <Ionicons name="trash-outline" size={20} color={Colors.danger} />
          </Pressable>
        </View>

        <View style={styles.area} onLayout={fit}>
          {board.w > 0 && (
            <View
              style={[styles.board, { width: board.w, height: board.h }]}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderTerminationRequest={() => false}
              onResponderGrant={start}
              onResponderMove={move}
              onResponderRelease={finish}
              onResponderTerminate={finish}>
              <Svg width={board.w} height={board.h} viewBox={`0 0 ${BOARD.width} ${BOARD.height}`} pointerEvents="none">
                {[...strokes, ...(live ? [{ id: 'live', color, width, points: live, mine: true }] : [])].map((s) => (
                  <Path
                    key={s.id}
                    d={pathOf(s.points)}
                    stroke={s.color}
                    strokeWidth={s.color === '#FFFFFF' ? s.width * 2.5 : s.width}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                ))}
              </Svg>
              {!strokes.length && !live && (
                <View style={styles.hint} pointerEvents="none">
                  <Ionicons name="brush" size={28} color={Colors.textMuted} />
                  <Text variant="small" color={Colors.textMuted} center>
                    {t('board.hint')}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {!!note && (
          <Text variant="small" color={Colors.danger} center>
            {note}
          </Text>
        )}
        <View style={styles.tools}>
          {BOARD_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              accessibilityRole="radio"
              accessibilityState={{ checked: color === c }}
              accessibilityLabel={c === '#FFFFFF' ? t('board.eraser') : t('board.color')}
              style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchOn]}>
              {c === '#FFFFFF' && <Ionicons name="remove-circle-outline" size={18} color={Colors.textMuted} />}
            </Pressable>
          ))}
          <View style={styles.divider} />
          {WIDTHS.map((w, i) => (
            <Pressable
              key={w}
              onPress={() => setWidth(w)}
              accessibilityRole="radio"
              accessibilityState={{ checked: width === w }}
              accessibilityLabel={t('board.size', { n: i + 1 })}
              style={[styles.size, width === w && styles.sizeOn]}>
              <View style={{ width: 4 + i * 5, height: 4 + i * 5, borderRadius: 10, backgroundColor: Colors.text }} />
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
      <ConfirmDialog
        visible={confirm}
        icon="trash-outline"
        destructive
        title={room?.host ? t('board.clearAll') : t('board.clearMine')}
        body={room?.host ? t('board.clearAllBody') : t('board.clearMineBody')}
        confirmLabel={t('board.clear')}
        cancelLabel={t('cancel')}
        onConfirm={clear}
        onCancel={() => setConfirm(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceRaised,
  },
  area: { flex: 1, alignItems: 'center', justifyContent: 'center', marginHorizontal: Spacing.md },
  board: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  hint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.xl,
  },
  tools: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  swatchOn: { borderWidth: 3, borderColor: Colors.primary, transform: [{ scale: 1.1 }] },
  divider: { width: 1, height: 26, backgroundColor: Colors.border, marginHorizontal: 2 },
  size: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  sizeOn: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
});
