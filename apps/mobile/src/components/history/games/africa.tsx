import { Ionicons } from '@expo/vector-icons';
import { t as i18nT } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Line, Polygon, Polyline, Text as SvgText } from 'react-native-svg';

import { Feedback, PrimaryButton, SecondaryButton, TimerStat, useCountdown, W } from '@/components/games/ui';
import { defineGameFrame } from '@/components/lab/contract';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { AfricaExplorerRun, GameOutcome } from '@/lib/api';
import { useRelaxed } from '@/lib/games/english';
import { AFRICA, LAKE_VICTORIA, MADAGASCAR, mapProjection, RIVERS } from '@/lib/games/history';
import type { HistoryGame } from '@/lib/games/use-lab-run';

import { Board, Eyebrow, Panel, QuizCard, quiz } from '../quiz';

/** Translation outside React (review lists for the results screen). */
const tr = i18nT as unknown as (key: string, options?: Record<string, unknown>) => string;

const SEA = '#E4EEF5';
const LAND = '#F3EDE0';
const COAST = '#7A6A50';
const RIVER = '#6C9CC2';
const LETTERS = ['A', 'B', 'C', 'D'];

type Stop = AfricaExplorerRun['stops'][number];

/**
 * Africa Explorer: find each country on an atlas map of Africa (tap to place a pin, or choose one of
 * four lettered markers instead), then read about its landmark and answer a question. The server
 * checks where the pin is.
 */
export function AfricaExplorer({ g, run, paused }: { g: HistoryGame; run: AfricaExplorerRun; paused?: boolean }) {
  const { t } = useTranslation('history');
  const tx = t as unknown as (k: string, o?: Record<string, unknown>) => string;
  const total = run.stops.length;
  const [k, setK] = useState(() => Math.min(Math.floor(run.at / 2), total - 1));
  const stop = run.stops[k]!;
  const over = run.status !== 'playing' || run.hearts <= 0;
  const last = k + 1 >= total || over;
  const stamped = run.stops.filter((s) => s.question?.result).length;
  const next = () => (last ? void g.finish() : setK(k + 1));

  return (
    <Board width={640}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Eyebrow>{tx('quiz.stop', { n: k + 1, total })}</Eyebrow>
        </View>
        <Passport stops={run.stops} done={stamped} />
      </View>
      {stop.find ? (
        <Visit key={`v${stop.id}`} g={g} run={run} stop={stop} paused={!!paused} onNext={next} last={last} />
      ) : (
        <Find key={`f${stop.id}`} g={g} run={run} stop={stop} k={k} paused={!!paused} />
      )}
    </Board>
  );
}

/** Stamps collected, as small marks (the count is also written out). */
function Passport({ stops, done }: { stops: Stop[]; done: number }) {
  const { t } = useTranslation('history');
  const tx = t as unknown as (k: string, o?: Record<string, unknown>) => string;
  return (
    <View style={styles.passport} accessible accessibilityLabel={tx('atlas.passport', { done, total: stops.length })}>
      {stops.map((s) => (
        <Ionicons key={s.id} name={s.question?.result ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={s.question?.result ? W.correct : W.lineStrong} />
      ))}
    </View>
  );
}

/** Finding the country: a pin on the map, or one of four markers. */
function Find({ g, run, stop, k, paused }: { g: HistoryGame; run: AfricaExplorerRun; stop: Stop; k: number; paused: boolean }) {
  const { t } = useTranslation('history');
  const tx = t as unknown as (k: string, o?: Record<string, unknown>) => string;
  const { relaxed } = useRelaxed();
  const [mode, setMode] = useState<'map' | 'markers'>('map');
  const [pin, setPin] = useState<[number, number] | null>(null);
  const [sending, setSending] = useState(false);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const seconds = (run.seconds ?? 0) * 2;
  const clock = seconds > 0 && !relaxed;
  const check = async (point: [number, number] | null) => {
    if (sending || outcome) return;
    setSending(true);
    const res = await g.answer(point ? { step: 2 * k, point } : { step: 2 * k, timeout: true });
    setSending(false);
    if (!res) return;
    g.buzz(res.outcome.correct ? 'success' : 'error');
    setOutcome(res.outcome);
  };
  const left = useCountdown(seconds, clock && !outcome && !paused && !sending, () => void check(null), stop.id);
  const at = (outcome as { at?: [number, number] } | null)?.at ?? null;

  return (
    <>
      <Panel style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[quiz.title, { flex: 1 }]} accessibilityRole="header">
            {tx('atlas.find', { name: stop.name })}
          </Text>
          {clock && !outcome && <TimerStat seconds={left} relaxed={false} />}
        </View>
        {!!stop.region && <Text style={quiz.small}>{tx('atlas.hint', { region: stop.region })}</Text>}
        <Text style={quiz.small}>{mode === 'map' ? tx('atlas.tap') : tx('atlas.markerHint', { name: stop.name })}</Text>
      </Panel>
      <AtlasMap
        pin={mode === 'map' ? pin : null}
        onTap={mode === 'map' && !outcome ? setPin : undefined}
        markers={mode === 'markers' ? stop.choices : undefined}
        picked={mode === 'markers' ? pin : null}
        answer={at}
        visited={run.stops.flatMap((s) => (s.find && s.id !== stop.id ? [s.find.at] : []))}
      />
      {mode === 'markers' && !outcome && (
        <View style={styles.markerRow}>
          {(stop.choices ?? []).map((p, i) => {
            const on = pin?.[0] === p[0] && pin?.[1] === p[1];
            return (
              <Pressable
                key={i}
                onPress={() => setPin(p)}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={tx('atlas.marker', { letter: LETTERS[i] })}
                style={[styles.marker, on && { backgroundColor: W.ink, borderColor: W.ink }]}>
                <Text style={[styles.markerText, on && { color: '#fff' }]}>{LETTERS[i]}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
      {outcome && (
        <Feedback tone={outcome.correct ? 'good' : 'bad'} title={outcome.correct ? tx('atlas.found') : (tr('games:ui.wrong') as string)} detail={outcome.correct ? null : tx('atlas.missed', { name: stop.name })} />
      )}
      {!outcome && (
        <View style={{ gap: 10 }}>
          <PrimaryButton title={tx('atlas.check')} disabled={!pin} busy={sending} onPress={() => void check(pin)} />
          {!!stop.choices?.length && (
            <SecondaryButton
              title={mode === 'map' ? tx('atlas.markers') : tx('atlas.useMap')}
              icon={mode === 'map' ? 'list-outline' : 'map-outline'}
              onPress={() => {
                setPin(null);
                setMode(mode === 'map' ? 'markers' : 'map');
              }}
            />
          )}
        </View>
      )}
    </>
  );
}

/** After finding it: the landmark, two facts, and a question. */
function Visit({ g, run, stop, paused, onNext, last }: { g: HistoryGame; run: AfricaExplorerRun; stop: Stop; paused: boolean; onNext: () => void; last: boolean }) {
  const { t } = useTranslation('history');
  const tx = t as unknown as (k: string, o?: Record<string, unknown>) => string;
  const q = stop.question!;
  return (
    <>
      <Feedback
        tone={stop.find!.correct ? 'good' : 'bad'}
        title={stop.find!.correct ? tx('atlas.found') : (tr('games:ui.wrong') as string)}
        detail={stop.find!.correct ? null : tx('atlas.missed', { name: stop.name })}
      />
      <Animated.View entering={FadeIn.duration(180)}>
        <AtlasMap answer={stop.find!.at} visited={run.stops.flatMap((s) => (s.find && s.id !== stop.id ? [s.find.at] : []))} small />
      </Animated.View>
      <Panel style={{ gap: 8 }}>
        <Eyebrow>{tx('atlas.landmark')}</Eyebrow>
        <Text style={quiz.title}>{`${stop.landmark} · ${stop.name}`}</Text>
        <Eyebrow>{tx('atlas.facts')}</Eyebrow>
        {(stop.facts ?? []).map((f) => (
          <View key={f} style={{ flexDirection: 'row', gap: 8 }}>
            <Ionicons name="bookmark-outline" size={16} color={W.inkSoft} style={{ marginTop: 3 }} />
            <Text style={[quiz.body, { flex: 1 }]}>{f}</Text>
          </View>
        ))}
      </Panel>
      <QuizCard
        key={q.id}
        eyebrow={stop.name}
        q={q.q}
        options={q.options}
        seconds={run.seconds ?? 0}
        paused={paused}
        done={q.result ? { correct: q.result.correct, answer: q.result.answer } : undefined}
        onAnswer={async (choice) => {
          const res = await g.answer(choice === null ? { step: q.id, timeout: true } : { step: q.id, choice });
          if (!res) return null;
          g.buzz(res.outcome.correct ? 'success' : 'error');
          return res.outcome;
        }}
        onNext={onNext}
        nextLabel={last ? tx('quiz.finish') : tx('quiz.nextStop')}
      />
    </>
  );
}

/**
 * The atlas: pale sea, parchment land, rivers and Lake Victoria, a graticule every 10 degrees with the
 * Equator and tropics labelled, your pin, the lettered markers, and the right place once answered.
 */
function AtlasMap({
  pin,
  onTap,
  markers,
  picked,
  answer,
  visited = [],
  small,
}: {
  pin?: [number, number] | null;
  onTap?: (p: [number, number]) => void;
  markers?: [number, number][];
  picked?: [number, number] | null;
  answer?: [number, number] | null;
  visited?: [number, number][];
  small?: boolean;
}) {
  const { t } = useTranslation('history');
  const tx = t as unknown as (k: string, o?: Record<string, unknown>) => string;
  const [w, setW] = useState(0);
  const h = Math.round(Math.min(w * 1.02, small ? 260 : 520));
  const proj = mapProjection(w, h);
  const pts = (list: [number, number][]) => list.map(([lon, lat]) => `${proj.x(lon).toFixed(1)},${proj.y(lat).toFixed(1)}`).join(' ');
  const tap = (e: GestureResponderEvent) => {
    if (!onTap) return;
    onTap(proj.toLonLat(e.nativeEvent.locationX, e.nativeEvent.locationY));
  };
  const lines = [-30, -20, -10, 0, 10, 20, 30];
  const meridians = [-10, 0, 10, 20, 30, 40, 50];
  return (
    <View style={styles.map} onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))}>
      {w > 0 && (
        <Pressable
          onPress={tap}
          disabled={!onTap}
          accessibilityRole={onTap ? 'button' : 'image'}
          accessibilityLabel={tx('atlas.mapA11y')}
          style={{ width: w, height: h }}>
          <Svg width={w} height={h} pointerEvents="none">
            <Polygon points={`0,0 ${w},0 ${w},${h} 0,${h}`} fill={SEA} />
            {lines.map((lat) => (
              <G key={`lat${lat}`}>
                <Line x1={0} x2={w} y1={proj.y(lat)} y2={proj.y(lat)} stroke="#C9D8E4" strokeWidth={lat === 0 ? 1.4 : 0.8} strokeDasharray={lat === 0 ? undefined : '3 4'} />
                {!small && (
                  <SvgText x={4} y={proj.y(lat) - 3} fontSize={9} fill="#7D93A6" fontFamily={Fonts.semibold}>
                    {lat === 0 ? '0° Equator' : `${Math.abs(lat)}°${lat > 0 ? 'N' : 'S'}`}
                  </SvgText>
                )}
              </G>
            ))}
            {meridians.map((lon) => (
              <Line key={`lon${lon}`} x1={proj.x(lon)} x2={proj.x(lon)} y1={0} y2={h} stroke="#C9D8E4" strokeWidth={0.8} strokeDasharray="3 4" />
            ))}
            <Polygon points={pts(AFRICA)} fill={LAND} stroke={COAST} strokeWidth={1.4} strokeLinejoin="round" />
            <Polygon points={pts(MADAGASCAR)} fill={LAND} stroke={COAST} strokeWidth={1.4} strokeLinejoin="round" />
            {RIVERS.map((r, j) => (
              <Polyline key={j} points={pts(r)} stroke={RIVER} strokeWidth={1.4} fill="none" strokeLinejoin="round" strokeLinecap="round" />
            ))}
            <Ellipse cx={proj.x(LAKE_VICTORIA.at[0])} cy={proj.y(LAKE_VICTORIA.at[1])} rx={LAKE_VICTORIA.rx * proj.scale} ry={LAKE_VICTORIA.ry * proj.scale} fill={RIVER} />
            {visited.map((p, i) => (
              <Circle key={`v${i}`} cx={proj.x(p[0])} cy={proj.y(p[1])} r={4} fill={W.inkSoft} opacity={0.5} />
            ))}
            {markers?.map((p, i) => {
              const on = picked?.[0] === p[0] && picked?.[1] === p[1];
              return (
                <G key={`m${i}`}>
                  <Circle cx={proj.x(p[0])} cy={proj.y(p[1])} r={11} fill={on ? W.ink : W.surface} stroke={W.ink} strokeWidth={1.6} />
                  <SvgText x={proj.x(p[0])} y={proj.y(p[1]) + 4} fontSize={11} fill={on ? '#fff' : W.ink} textAnchor="middle" fontFamily={Fonts.bold}>
                    {LETTERS[i]}
                  </SvgText>
                </G>
              );
            })}
            {answer && (
              <G>
                <Circle cx={proj.x(answer[0])} cy={proj.y(answer[1])} r={14} fill={W.correct} opacity={0.18} />
                <Circle cx={proj.x(answer[0])} cy={proj.y(answer[1])} r={6} fill={W.correct} stroke="#fff" strokeWidth={2} />
              </G>
            )}
            {pin && (
              <G>
                <Line x1={proj.x(pin[0])} x2={proj.x(pin[0])} y1={proj.y(pin[1])} y2={proj.y(pin[1]) - 18} stroke={W.ink} strokeWidth={2} />
                <Circle cx={proj.x(pin[0])} cy={proj.y(pin[1]) - 20} r={6} fill={W.wrong} stroke={W.ink} strokeWidth={1.5} />
                <Circle cx={proj.x(pin[0])} cy={proj.y(pin[1])} r={2} fill={W.ink} />
              </G>
            )}
          </Svg>
        </Pressable>
      )}
    </View>
  );
}

/** The how-to example: Nigeria found, on a small map. */
function HowTo() {
  return <AtlasMap answer={[8.7, 9.1]} pin={[8.2, 9.6]} small />;
}

defineGameFrame('africa-explorer', {
  HowTo,
  review: (r) => {
    const run = r as AfricaExplorerRun;
    return run.stops.flatMap((s) => [
      ...(s.find ? [{ key: `m${s.id}`, correct: s.find.correct, main: s.name, detail: s.landmark }] : []),
      ...(s.question?.result ? [{ key: `q${s.id}`, correct: s.question.result.correct, main: s.question.q, detail: s.question.result.answer }] : []),
    ]);
  },
});

const styles = StyleSheet.create({
  map: { width: '100%', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: W.line, backgroundColor: SEA },
  passport: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  markerRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  marker: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: W.lineStrong,
    backgroundColor: W.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: { fontFamily: Fonts.extrabold, fontSize: 18, color: W.ink },
});
