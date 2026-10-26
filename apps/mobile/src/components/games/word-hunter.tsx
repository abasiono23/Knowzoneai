import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState, type ComponentRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, useWindowDimensions, View, type GestureResponderEvent } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import type { GridCell, WordHunterRun } from '@/lib/api';
import { clock } from '@/lib/games/english';

import { GameShell, useGame, type Game } from './shell';
import { FONT, KoraBubble, TopBar, useCountdown } from './ui';

/** Highlight colours for found words, in the order they're found. */
const MARKS = [
  ['#2DD4BF', '#14B8A6'],
  ['#E040FB', '#B04CFF'],
  ['#FFC857', '#FF9F43'],
  ['#4CC9FF', '#2563EB'],
  ['#FF7A93', '#FF4D6D'],
  ['#9B82FF', '#6A45FF'],
  ['#7CEBDD', '#2DD4BF'],
  ['#FFDE99', '#FFB627'],
] as const;

/** Word Hunter: drag across the grid to find every word before the clock runs out. */
export function WordHunter({ level }: { level: number }) {
  const g = useGame<WordHunterRun>('word-hunter', level);
  return (
    <GameShell g={g} step={{ n: g.run?.found.length ?? 0, total: g.run?.words.length ?? 6 }}>
      {(run) => <Board key={run.id} g={g} run={run} />}
    </GameShell>
  );
}

function Board({ g, run }: { g: Game<WordHunterRun>; run: WordHunterRun }) {
  const { t } = useTranslation('games');
  const { width } = useWindowDimensions();
  const [drag, setDrag] = useState<{ from: GridCell; to: GridCell } | null>(null);
  const [lastFound, setLastFound] = useState<string | null>(null);
  const [miss, setMiss] = useState(false);
  const gridRef = useRef<ComponentRef<typeof View>>(null);
  const origin = useRef({ x: 0, y: 0 });
  const done = run.found.length === run.words.length;

  const left = useCountdown(
    run.seconds,
    !done && !g.paused && run.status === 'playing',
    () => void g.finish(0),
    run.id,
  );

  const pad = 10;
  const gap = 6;
  const panel = Math.min(width, 520) - Spacing.md * 2;
  const cell = Math.floor((panel - pad * 2 - gap * (run.size - 1)) / run.size);
  const step = cell + gap;

  const cellAt = (page: { x: number; y: number }): GridCell => {
    const x = page.x - origin.current.x - pad;
    const y = page.y - origin.current.y - pad;
    const clamp = (v: number) => Math.max(0, Math.min(run.size - 1, Math.floor(v / step)));
    return [clamp(y), clamp(x)];
  };
  // Snap the finger to the nearest of the eight straight directions.
  const snap = (from: GridCell, to: GridCell): GridCell => {
    const dr = to[0] - from[0];
    const dc = to[1] - from[1];
    if (!dr && !dc) return from;
    const angle = Math.round(Math.atan2(dr, dc) / (Math.PI / 4)) * (Math.PI / 4);
    const sr = Math.round(Math.sin(angle));
    const sc = Math.round(Math.cos(angle));
    let len = Math.max(Math.abs(dr), Math.abs(dc));
    while (len > 0) {
      const r = from[0] + sr * len;
      const c = from[1] + sc * len;
      if (r >= 0 && c >= 0 && r < run.size && c < run.size) return [r, c];
      len--;
    }
    return from;
  };

  const submit = async (from: GridCell, to: GridCell) => {
    if (from[0] === to[0] && from[1] === to[1]) return;
    const res = await g.answer({ from, to });
    if (!res) return;
    if (res.outcome.correct) {
      g.buzz('success');
      setLastFound(res.outcome.word ?? null);
      setMiss(false);
      if (res.done) void g.finish(left);
    } else {
      g.buzz('error');
      setMiss(true);
    }
  };

  // Touch handling with React Native's responder props (works the same on phones and the web).
  // The grid's position is measured when a drag starts (it scrolls); until that answer arrives,
  // moves are only remembered, and a very quick drag is completed once it does.
  const touch = useRef({ start: { x: 0, y: 0 }, last: { x: 0, y: 0 }, measuring: false, released: false });
  const current = () => {
    const from = cellAt(touch.current.start);
    return { from, to: snap(from, cellAt(touch.current.last)) };
  };
  const pageOf = (e: GestureResponderEvent) => ({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
  const grant = (e: GestureResponderEvent) => {
    touch.current = { start: pageOf(e), last: pageOf(e), measuring: true, released: false };
    gridRef.current?.measureInWindow((x: number, y: number) => {
      origin.current = { x, y };
      touch.current.measuring = false;
      const d = current();
      if (touch.current.released) {
        setDrag(null);
        void submit(d.from, d.to);
      } else setDrag(d);
    });
  };
  const move = (e: GestureResponderEvent) => {
    touch.current.last = pageOf(e);
    if (!touch.current.measuring) setDrag(current());
  };
  const release = () => {
    if (touch.current.measuring) {
      touch.current.released = true;
      return;
    }
    const d = current();
    setDrag(null);
    void submit(d.from, d.to);
  };

  const capsule = (from: GridCell, to: GridCell, colors: readonly [string, string], key: string, live?: boolean) => {
    const x1 = pad + from[1] * step + cell / 2;
    const y1 = pad + from[0] * step + cell / 2;
    const x2 = pad + to[1] * step + cell / 2;
    const y2 = pad + to[0] * step + cell / 2;
    const length = Math.hypot(x2 - x1, y2 - y1) + cell * 0.92;
    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    return (
      <View
        key={key}
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: (x1 + x2) / 2 - length / 2,
          top: (y1 + y2) / 2 - cell * 0.44,
          width: length,
          height: cell * 0.88,
          transform: [{ rotate: `${angle}deg` }],
        }}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.capsule, { borderRadius: cell * 0.44, opacity: live ? 0.55 : 0.6 }]}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <TopBar
        onPause={() => g.setPaused(true)}
        right={
          <View style={styles.scorePill}>
            <Ionicons name="flash" size={16} color="#fff" />
            <Text style={{ fontFamily: FONT, fontSize: 16, color: '#fff' }}>{run.score}</Text>
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.body} scrollEnabled={!drag} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('hunter.title')}</Text>
        <Text style={styles.theme}>
          {t('hunter.theme', { theme: t(`hunter.themes.${run.theme}`, { defaultValue: run.theme }) })}
        </Text>

        <LinearGradient
          colors={left <= 10 ? ['#FF4D6D', '#FF7A93'] : ['#FF9F43', '#E040FB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.timerBar}>
          <View style={[styles.timerFill, { width: `${(1 - left / run.seconds) * 100}%` }]} />
          <Text style={styles.timerText}>{clock(left)}</Text>
          <Text style={styles.foundText}>
            {t('hunter.found', { found: run.found.length, total: run.words.length })}
          </Text>
        </LinearGradient>

        <View
          ref={gridRef}
          style={[styles.panel, { width: panel }]}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
          onResponderGrant={grant}
          onResponderMove={move}
          onResponderRelease={release}
          onResponderTerminate={() => setDrag(null)}>
          {run.grid.map((row, r) => (
            <View key={r} style={{ flexDirection: 'row', gap }}>
              {row.map((letter, c) => (
                <View
                  key={c}
                  style={[styles.cell, { width: cell, height: cell, borderRadius: Math.round(cell * 0.24) }]}
                  accessibilityLabel={t('hunter.cellA11y', { row: r + 1, col: c + 1, letter })}>
                  <Text style={{ fontFamily: FONT, fontSize: cell * 0.48, color: '#fff' }}>{letter}</Text>
                </View>
              ))}
            </View>
          ))}
          {/* Found words (and the current drag) lie across the letters, see-through. */}
          {run.found.map((f, k) => capsule(f.cells[0]!, f.cells.at(-1)!, MARKS[k % MARKS.length]!, f.word))}
          {drag && capsule(drag.from, drag.to, ['#9B82FF', '#7C5CFF'], 'drag', true)}
        </View>
        {miss && <Text style={styles.miss}>{t('hunter.kora')}</Text>}

        <View style={styles.words}>
          {run.words.map((w) => {
            const k = run.found.findIndex((f) => f.word === w);
            const found = k >= 0;
            return found ? (
              <Animated.View key={w} entering={ZoomIn.springify()} style={styles.chipWrap}>
                <LinearGradient
                  colors={MARKS[k % MARKS.length]!}
                  style={styles.chip}
                  accessibilityLabel={t('hunter.wordA11y', { word: w })}>
                  <Text style={[styles.chipText, { color: '#fff' }]}>{w}</Text>
                </LinearGradient>
              </Animated.View>
            ) : (
              <View
                key={w}
                style={[styles.chip, styles.chipTodo, styles.chipWrap]}
                accessibilityLabel={t('hunter.wordTodoA11y', { word: w })}>
                <Text style={styles.chipText}>{w}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
      <SafeAreaView edges={['bottom']} pointerEvents="none" style={styles.koraWrap}>
        <KoraBubble text={done ? t('hunter.allFound') : (lastFound ?? undefined)} size={104} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: Spacing.md,
    gap: Spacing.md,
    alignItems: 'center',
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 140,
  },
  title: { fontFamily: FONT, fontSize: 44, lineHeight: 48, color: '#F1EEFF', textAlign: 'center', letterSpacing: 1 },
  theme: { fontFamily: 'Manrope_700Bold', fontSize: 15, color: 'rgba(235,232,255,0.7)', marginTop: -8 },
  timerBar: {
    alignSelf: 'stretch',
    height: 52,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  timerFill: { position: 'absolute', right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(16,12,60,0.55)' },
  timerText: { fontFamily: FONT, fontSize: 24, color: '#fff', flex: 1, textAlign: 'center' },
  foundText: { fontFamily: FONT, fontSize: 15, color: '#fff' },
  panel: {
    userSelect: 'none',
    padding: 10,
    gap: 6,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(124,92,255,0.6)',
    backgroundColor: 'rgba(20,14,80,0.5)',
  },
  cell: {
    userSelect: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3A2DA8',
    borderBottomWidth: 3,
    borderBottomColor: '#251B7A',
  },
  capsule: { flex: 1 },
  miss: { fontFamily: 'Manrope_700Bold', color: 'rgba(235,232,255,0.7)', textAlign: 'center' },
  words: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignSelf: 'stretch', paddingRight: 96 },
  chipWrap: { width: '47%' },
  chip: { borderRadius: 999, paddingVertical: 12, alignItems: 'center' },
  chipTodo: { backgroundColor: '#2E2A9A' },
  chipText: { fontFamily: FONT, fontSize: 18, color: 'rgba(235,232,255,0.9)', letterSpacing: 1 },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FF9F43',
  },
  koraWrap: { position: 'absolute', right: Spacing.sm, bottom: 0 },
});
