import { Ionicons } from '@expo/vector-icons';
import { useRef, useState, type ComponentRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View, type GestureResponderEvent } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { GridCell, WordHunterRun } from '@/lib/api';
import { useKeys } from '@/lib/games/english';

import { GameShell, useGame, type Game } from './shell';
import { column, Feedback, FONT, ltrRow, PrimaryButton, Stat, StatusRow, TimerStat, useCountdown, W } from './ui';

/** Marks for found words, in the order they're found: soft and see-through, so the letters stay readable. */
const MARKS = ['rgba(14,140,121,0.28)', 'rgba(106,69,255,0.24)', 'rgba(194,124,14,0.28)', 'rgba(28,127,192,0.26)', 'rgba(210,67,106,0.24)'];

/** Word Hunter: find every listed word in the grid, by dragging across it or tapping its two ends. */
export function WordHunter({ level }: { level: number }) {
  const g = useGame<WordHunterRun>('word-hunter', level);
  return (
    <GameShell g={g} step={{ n: g.run?.found.length ?? 0, total: g.run?.words.length ?? 6 }}>
      {(run) => <Board key={run.id} g={g} run={run} />}
    </GameShell>
  );
}

/** Which way words may run at each level (games:hunter.directions.<n>). */
const DIRECTION_NOTE = ['1', '2', '2', '3', '3', '4', '5', '5', '5', '5'] as const;

function Board({ g, run }: { g: Game<WordHunterRun>; run: WordHunterRun }) {
  const { t } = useTranslation('games');
  const { width } = useWindowDimensions();
  const [drag, setDrag] = useState<{ from: GridCell; to: GridCell } | null>(null);
  /** The first end chosen by a tap (or Enter), waiting for the second. */
  const [anchor, setAnchor] = useState<GridCell | null>(null);
  const [cursor, setCursor] = useState<GridCell>([0, 0]);
  const [note, setNote] = useState<{ tone: 'good' | 'bad'; text: string } | null>(null);
  const gridRef = useRef<ComponentRef<typeof View>>(null);
  const origin = useRef({ x: 0, y: 0 });
  const done = run.found.length === run.words.length;

  const left = useCountdown(run.seconds, !g.relaxed && !done && !g.paused && run.status === 'playing', () => void g.finish(0), run.id);

  const pad = 8;
  const gap = 4;
  // Cells fill the column on phones, up to 52 points on wide screens.
  const cell = Math.min(52, Math.floor((Math.min(width, 520) - 32 - pad * 2 - gap * (run.size - 1)) / run.size));
  const panel = cell * run.size + gap * (run.size - 1) + pad * 2;
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
  const same = (a: GridCell, b: GridCell) => a[0] === b[0] && a[1] === b[1];

  const submit = async (from: GridCell, to: GridCell) => {
    if (same(from, to)) return;
    const res = await g.answer({ from, to });
    if (!res) return;
    if (res.outcome.correct) {
      g.buzz('success');
      setNote({ tone: 'good', text: t('hunter.foundWord', { word: res.outcome.word }) });
      if (res.done) void g.finish(g.relaxed ? 0 : left);
    } else {
      g.buzz('error');
      setNote({ tone: 'bad', text: t('hunter.kora') });
    }
  };

  /** A tap (or Enter): the first one marks a start, the second the end of a word. */
  const choose = (c: GridCell) => {
    if (done) return;
    if (!anchor) {
      g.buzz('tap');
      setAnchor(c);
      setNote(null);
      return;
    }
    const a = anchor;
    setAnchor(null);
    if (same(a, c)) return;
    void submit(a, snap(a, c));
  };

  // Dragging with React Native's responder props (the same on phones and the web). The grid's place is
  // measured when a drag starts (the page scrolls); a very quick drag is finished once that answer arrives.
  const touch = useRef({ start: { x: 0, y: 0 }, last: { x: 0, y: 0 }, measuring: false, released: false });
  const current = () => {
    const from = cellAt(touch.current.start);
    return { from, to: snap(from, cellAt(touch.current.last)) };
  };
  const pageOf = (e: GestureResponderEvent) => ({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
  const end = () => {
    const d = current();
    setDrag(null);
    if (same(d.from, d.to)) choose(d.from);
    else {
      setAnchor(null);
      void submit(d.from, d.to);
    }
  };
  const grant = (e: GestureResponderEvent) => {
    touch.current = { start: pageOf(e), last: pageOf(e), measuring: true, released: false };
    gridRef.current?.measureInWindow((x: number, y: number) => {
      origin.current = { x, y };
      touch.current.measuring = false;
      if (touch.current.released) end();
      else setDrag(current());
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
    end();
  };

  useKeys(
    (key) => {
      const moves: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      const m = moves[key];
      if (m) setCursor(([r, c]) => [Math.max(0, Math.min(run.size - 1, r + m[0])), Math.max(0, Math.min(run.size - 1, c + m[1]))]);
      else if (key === 'Enter' || key === ' ') choose(cursor);
      else if (key === 'Escape') setAnchor(null);
    },
    !g.paused,
  );

  const capsule = (from: GridCell, to: GridCell, color: string, key: string, live?: boolean) => {
    const x1 = pad + from[1] * step + cell / 2;
    const y1 = pad + from[0] * step + cell / 2;
    const x2 = pad + to[1] * step + cell / 2;
    const y2 = pad + to[0] * step + cell / 2;
    const length = Math.hypot(x2 - x1, y2 - y1) + cell * 0.86;
    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    return (
      <View
        key={key}
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: (x1 + x2) / 2 - length / 2,
          top: (y1 + y2) / 2 - cell * 0.43,
          width: length,
          height: cell * 0.86,
          borderRadius: cell * 0.43,
          backgroundColor: color,
          borderWidth: live ? 2 : 0,
          borderColor: W.focus,
          transform: [{ rotate: `${angle}deg` }],
        }}
      />
    );
  };
  const themeName = t(`hunter.themes.${run.theme}`, { defaultValue: run.themeTitle ?? run.theme });
  const keyboard = Platform.OS === 'web';

  return (
    <View style={{ flex: 1 }}>
      <StatusRow>
        <Stat icon="pricetag-outline" text={themeName} label={t('hunter.theme', { theme: themeName })} />
        <Stat text={t('hunter.found', { found: run.found.length, total: run.words.length })} />
        <TimerStat seconds={left} relaxed={g.relaxed} />
      </StatusRow>
      <ScrollView contentContainerStyle={[column, styles.body]} scrollEnabled={!drag} showsVerticalScrollIndicator={false}>
        <Text style={styles.hint}>{t(`hunter.directions.${DIRECTION_NOTE[Math.min(9, run.level - 1)]}`)}</Text>
        <View
          ref={gridRef}
          style={[styles.panel, { width: panel, padding: pad, gap }]}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
          onResponderGrant={grant}
          onResponderMove={move}
          onResponderRelease={release}
          onResponderTerminate={() => setDrag(null)}>
          {run.grid.map((row, r) => (
            <View key={r} style={[ltrRow(), { gap }]}>
              {row.map((letter, c) => {
                const isAnchor = !!anchor && same(anchor, [r, c]);
                const isCursor = keyboard && same(cursor, [r, c]);
                return (
                  <View
                    key={c}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={t('hunter.cellA11y', { row: r + 1, col: c + 1, letter })}
                    accessibilityState={{ selected: isAnchor }}
                    accessibilityActions={[{ name: 'activate' }]}
                    onAccessibilityAction={() => choose([r, c])}
                    style={[
                      styles.cell,
                      { width: cell, height: cell, borderRadius: Math.round(cell * 0.18) },
                      isAnchor && { backgroundColor: W.focus, borderColor: W.focus },
                      isCursor && !isAnchor && { borderColor: W.focus, borderWidth: 2 },
                    ]}>
                    <Text
                      allowFontScaling={false}
                      style={{ fontFamily: FONT, fontSize: cell * 0.46, color: isAnchor ? '#fff' : W.ink }}>
                      {letter}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
          {run.found.map((f, k) => capsule(f.cells[0]!, f.cells.at(-1)!, MARKS[k % MARKS.length]!, f.word))}
          {drag && capsule(drag.from, drag.to, 'rgba(106,69,255,0.14)', 'drag', true)}
        </View>
        <View style={{ minHeight: 52 }}>
          {anchor ? (
            <Feedback tone="info" title={t('hunter.start', { letter: run.grid[anchor[0]]![anchor[1]] })} />
          ) : done ? (
            <Feedback tone="good" title={t('hunter.allFound')} />
          ) : (
            note && <Feedback tone={note.tone} title={note.text} />
          )}
        </View>

        <View style={[styles.words, ltrRow()]}>
          {run.words.map((w) => {
            const found = run.found.some((f) => f.word === w);
            return (
              <Animated.View
                key={w}
                entering={FadeIn}
                style={[styles.chip, found && styles.chipFound]}
                accessible
                accessibilityLabel={found ? t('hunter.wordA11y', { word: w }) : t('hunter.wordTodoA11y', { word: w })}>
                {found && <Ionicons name="checkmark" size={14} color={W.correct} />}
                <Text style={[styles.chipText, found && { color: W.muted, textDecorationLine: 'line-through' }]}>{w}</Text>
              </Animated.View>
            );
          })}
        </View>
        {keyboard && <Text style={styles.hint}>{t('hunter.keyHint')}</Text>}
      </ScrollView>
      {done && (
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <PrimaryButton title={t('clash.results')} icon="arrow-forward" onPress={() => void g.finish(g.relaxed ? 0 : left)} busy={g.busy} />
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, gap: 14, alignItems: 'center', paddingBottom: 32 },
  hint: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: W.inkSoft, textAlign: 'center' },
  panel: {
    userSelect: 'none',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: W.line,
    backgroundColor: W.surface,
  },
  cell: {
    userSelect: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: W.page,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  words: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', alignSelf: 'stretch' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: W.lineStrong,
    backgroundColor: W.surface,
  },
  chipFound: { backgroundColor: W.correctSoft, borderColor: 'transparent' },
  chipText: { fontFamily: Fonts.bold, fontSize: 14, letterSpacing: 0.8, color: W.ink },
  footer: { ...column, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
});
