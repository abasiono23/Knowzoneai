import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Marker, Path, Polyline, Text as SvgText } from 'react-native-svg';

import { Feedback, FONT, PrimaryButton, SecondaryButton, W } from '@/components/games/ui';
import { defineGameFrame } from '@/components/lab/contract';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { Body, GameOutcome, GravityRun } from '@/lib/api';
import { useKeys } from '@/lib/games/english';
import { BOARD, fly, GOAL_R, placementOk, planetRadius } from '@/lib/games/gravity';
import type { SpaceGame } from '@/lib/games/use-lab-run';

import { Card, D, Eyebrow, LTR, ltr, Sheet, StepBar } from '../kit';

/** Board size on screen (the board is 1 wide and 1.5 tall in simulation units). */
const PX = 300;
const NUDGE = 0.02;

/**
 * Gravity Master: a comet flies across a field; place planets (and choose their mass) so that
 * gravity, pulling as 1/r², bends its path through the target ring. The predicted path is drawn for
 * a short way (shorter at higher levels); Launch flies the whole thing, which the server checks.
 * Planets are placed by tapping the board and nudged with the arrow buttons (or arrow keys).
 */
export function GravityBoard({ g, run }: { g: SpaceGame; run: GravityRun }) {
  const { t } = useTranslation('space');
  const total = run.puzzles.length;
  const [i, setI] = useState(() => Math.min(run.at, total - 1));
  const p = run.puzzles[i]!;
  const [placed, setPlaced] = useState<(Body | null)[]>(() => p.movable.map(() => null));
  const [sel, setSel] = useState(0);
  const [flight, setFlight] = useState<{ path: [number, number][]; shown: number } | null>(null);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const onBoard = placed.flatMap((b) => (b ? [b] : []));
  const bad = placed.map(
    (b, k) => !!b && !placementOk(b, [...p.fixed, ...onBoard.filter((o) => o !== placed[k])], p.launch, p.goal),
  );
  const ready = placed.every(Boolean) && !bad.some(Boolean);
  const preview = fly(p.launch, [...p.fixed, ...onBoard], p.goal, 3, run.preview);

  useEffect(() => {
    if (!flight || flight.shown >= flight.path.length) return;
    const id = requestAnimationFrame(() =>
      setFlight((f) => f && { ...f, shown: Math.min(f.path.length, f.shown + 3) }),
    );
    return () => cancelAnimationFrame(id);
  }, [flight]);

  const massOf = (k: number) => placed[k]?.mass ?? p.movable[k]![Math.floor((p.movable[k]!.length - 1) / 2)]!;
  const put = (k: number, x: number, y: number, mass = massOf(k)) => {
    if (flight || outcome) return;
    const cx = Math.min(BOARD.w, Math.max(0, x));
    const cy = Math.min(BOARD.h, Math.max(0, y));
    setPlaced(placed.map((b, n) => (n === k ? { x: cx, y: cy, mass } : b)));
    setMessage(null);
  };
  const nudge = (dx: number, dy: number) => {
    const b = placed[sel] ?? { x: 0.5, y: 0.75, mass: massOf(sel) };
    put(sel, b.x + dx, b.y + dy, b.mass);
  };

  const launch = async () => {
    if (!ready || flight || outcome) return;
    const planets = placed as Body[];
    const path = fly(p.launch, [...p.fixed, ...planets], p.goal, 2).path;
    setMessage(null);
    setFlight({ path, shown: 1 });
    const res = await g.answer({ step: i, placements: planets });
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
      Math.max(300, (path.length / 3) * 16),
    );
  };
  const giveUp = async () => {
    const res = await g.answer({ step: i, timeout: true });
    if (res) setOutcome(res.outcome);
  };
  const next = () => {
    if (run.status !== 'playing' || run.at >= total) return void g.finish();
    const n = run.at;
    setI(n);
    setPlaced(run.puzzles[n]!.movable.map(() => null));
    setSel(0);
    setOutcome(null);
    setMessage(null);
  };

  useKeys((key) => {
    if (key === 'ArrowLeft') nudge(-NUDGE, 0);
    else if (key === 'ArrowRight') nudge(NUDGE, 0);
    else if (key === 'ArrowUp') nudge(0, -NUDGE);
    else if (key === 'ArrowDown') nudge(0, NUDGE);
    else if (key === 'Enter') void (outcome ? next() : launch());
    else if (/^[1-3]$/.test(key) && p.movable[sel]!.includes(Number(key)))
      setPlaced(placed.map((b, n) => (n === sel && b ? { ...b, mass: Number(key) } : b)));
  });

  const solution = outcome && !outcome.correct ? (p.result?.solution ?? outcome.solution) : null;
  const shownPlanets = solution ?? onBoard;
  const H = PX * BOARD.h;
  const s = (v: number) => v * PX;
  return (
    <Sheet>
      <StepBar
        label={t('play.gravity.step', { n: i + 1, total })}
        n={i + 1}
        total={total}
        right={<Text style={styles.tries}>{t('gravity.tries', { count: p.tries })}</Text>}
      />
      <View style={{ alignItems: 'center' }}>
        <Pressable
          accessibilityRole="adjustable"
          accessibilityLabel={t('play.gravity.boardA11y', { n: sel + 1 })}
          onPress={(e) => put(sel, e.nativeEvent.locationX / PX, e.nativeEvent.locationY / PX)}
          style={[styles.board, LTR]}
          {...ltr}>
          <Svg width={PX} height={H} viewBox={`0 0 ${PX} ${H}`}>
            <Defs>
              <Marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <Path d="M0,0 L10,5 L0,10 Z" fill={D.ink} />
              </Marker>
            </Defs>
            {Array.from({ length: 11 }, (_, k) => (
              <Line key={`v${k}`} x1={k * 30} y1={0} x2={k * 30} y2={H} stroke={D.grid} />
            ))}
            {Array.from({ length: 16 }, (_, k) => (
              <Line key={`h${k}`} x1={0} y1={k * 30} x2={PX} y2={k * 30} stroke={D.grid} />
            ))}
            {/* Target ring */}
            <Circle
              cx={s(p.goal.x)}
              cy={s(p.goal.y)}
              r={s(GOAL_R)}
              fill="#E3F5F1"
              stroke={D.good}
              strokeWidth={2}
              strokeDasharray="4 3"
            />
            <Circle cx={s(p.goal.x)} cy={s(p.goal.y)} r={3} fill={D.good} />
            {/* Launch velocity */}
            <Line
              x1={s(p.launch.x)}
              y1={s(p.launch.y)}
              x2={s(p.launch.x + p.launch.vx * 0.22)}
              y2={s(p.launch.y + p.launch.vy * 0.22)}
              stroke={D.ink}
              strokeWidth={1.6}
              markerEnd="url(#arrow)"
            />
            <Circle cx={s(p.launch.x)} cy={s(p.launch.y)} r={5} fill={D.ink} />
            {/* Predicted path (part of it) */}
            {!flight && !outcome && (
              <Polyline
                points={preview.path.map(([x, y]) => `${s(x)},${s(y)}`).join(' ')}
                stroke={D.accent}
                strokeWidth={1.6}
                strokeDasharray="3 4"
                fill="none"
              />
            )}
            {flight && (
              <Polyline
                points={flight.path
                  .slice(0, flight.shown)
                  .map(([x, y]) => `${s(x)},${s(y)}`)
                  .join(' ')}
                stroke={D.accent}
                strokeWidth={2}
                fill="none"
              />
            )}
            {solution && (
              <Polyline
                points={fly(p.launch, [...p.fixed, ...solution], p.goal, 3)
                  .path.map(([x, y]) => `${s(x)},${s(y)}`)
                  .join(' ')}
                stroke={D.good}
                strokeWidth={1.6}
                fill="none"
              />
            )}
            {p.fixed.map((b, k) => (
              <G key={`f${k}`}>
                <Circle
                  cx={s(b.x)}
                  cy={s(b.y)}
                  r={s(planetRadius(b.mass))}
                  fill="#D9D7E3"
                  stroke={D.soft}
                  strokeWidth={1}
                />
                <SvgText
                  x={s(b.x)}
                  y={s(b.y) + 4}
                  fontSize={11}
                  fontFamily={Fonts.bold}
                  fill={D.ink}
                  textAnchor="middle">
                  {b.mass}
                </SvgText>
              </G>
            ))}
            {shownPlanets.map((b, k) => {
              const n = solution ? k : placed.indexOf(b);
              const isBad = !solution && bad[n];
              const isSel = !solution && n === sel;
              return (
                <G key={`m${k}`}>
                  {/* Pull falls off as 1/r²: rings at 2r and 3r show how fast it fades. */}
                  <Circle
                    cx={s(b.x)}
                    cy={s(b.y)}
                    r={s(planetRadius(b.mass)) * 2.2}
                    stroke={D.accent}
                    strokeOpacity={0.25}
                    fill="none"
                  />
                  <Circle
                    cx={s(b.x)}
                    cy={s(b.y)}
                    r={s(planetRadius(b.mass))}
                    fill={solution ? D.good : isBad ? D.bad : D.accent}
                    stroke={isSel ? D.ink : '#fff'}
                    strokeWidth={isSel ? 2.5 : 1.5}
                  />
                  <SvgText
                    x={s(b.x)}
                    y={s(b.y) + 4}
                    fontSize={11}
                    fontFamily={Fonts.bold}
                    fill="#fff"
                    textAnchor="middle">
                    {b.mass}
                  </SvgText>
                </G>
              );
            })}
            {flight && flight.shown > 0 && (
              <Circle
                cx={s(flight.path[Math.min(flight.shown, flight.path.length) - 1]![0])}
                cy={s(flight.path[Math.min(flight.shown, flight.path.length) - 1]![1])}
                r={4.5}
                fill={D.ink}
              />
            )}
          </Svg>
        </Pressable>
        <View style={[styles.legend, LTR]} {...ltr}>
          <Legend color={D.ink} text={t('play.gravity.comet')} />
          <Legend color={D.good} text={t('play.gravity.target')} ring />
          <Legend color={D.accent} text={t('play.gravity.yours')} />
          <Legend color="#D9D7E3" text={t('play.gravity.fixed')} />
        </View>
      </View>

      {!outcome && (
        <Card>
          <Eyebrow text={t('play.gravity.yourPlanets')} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {p.movable.map((masses, k) => (
              <Pressable
                key={k}
                onPress={() => setSel(k)}
                accessibilityRole="radio"
                accessibilityState={{ selected: sel === k }}
                accessibilityLabel={t('play.gravity.planetN', { n: k + 1 })}
                style={[styles.chip, sel === k && { borderColor: W.focus, backgroundColor: W.focusSoft }]}>
                <Text style={styles.chipText}>
                  {t('play.gravity.planetN', { n: k + 1 })} {placed[k] ? (bad[k] ? '✗' : '✓') : '·'}
                </Text>
              </Pressable>
            ))}
          </View>
          {p.movable[sel]!.length > 1 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.small}>{t('gravity.mass')}</Text>
              {p.movable[sel]!.map((m) => (
                <Pressable
                  key={m}
                  onPress={() =>
                    placed[sel]
                      ? setPlaced(placed.map((b, n) => (n === sel && b ? { ...b, mass: m } : b)))
                      : put(sel, 0.5, 0.75, m)
                  }
                  accessibilityRole="radio"
                  accessibilityState={{ selected: massOf(sel) === m }}
                  accessibilityLabel={`${t('gravity.mass')} ${m}: ${t(`gravity.masses.${m}` as 'gravity.masses.1')}`}
                  style={[styles.mass, massOf(sel) === m && { backgroundColor: W.ink }]}>
                  <Text style={{ fontFamily: FONT, color: massOf(sel) === m ? '#fff' : W.ink }}>{m}</Text>
                </Pressable>
              ))}
            </View>
          )}
          <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, LTR]} {...ltr}>
            <Text style={[styles.small, { flex: 1 }]}>
              {placed[sel] ? t('play.gravity.nudge') : t('play.gravity.tap')}
            </Text>
            {(
              [
                ['arrow-back', -NUDGE, 0, 'left'],
                ['arrow-up', 0, -NUDGE, 'up'],
                ['arrow-down', 0, NUDGE, 'down'],
                ['arrow-forward', NUDGE, 0, 'right'],
              ] as const
            ).map(([icon, dx, dy, dir]) => (
              <Pressable
                key={dir}
                onPress={() => nudge(dx, dy)}
                accessibilityRole="button"
                accessibilityLabel={t(`play.gravity.move.${dir}`)}
                style={styles.nudge}>
                <Ionicons name={icon} size={18} color={W.ink} />
              </Pressable>
            ))}
          </View>
          {bad.some(Boolean) && <Feedback tone="bad" title={t('gravity.blocked')} />}
        </Card>
      )}

      {!!message && <Feedback tone="bad" title={message} />}
      {outcome ? (
        <View style={{ gap: 10 }}>
          <Feedback
            tone={outcome.correct ? 'good' : 'info'}
            title={outcome.correct ? t('gravity.hit', { points: outcome.points }) : t('gravity.solution')}
          />
          <PrimaryButton
            title={run.at >= total ? t('play.finish') : t('gravity.next')}
            icon="arrow-forward"
            onPress={next}
          />
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          <PrimaryButton
            title={t('gravity.launch')}
            icon="rocket-outline"
            disabled={!ready || !!flight}
            busy={g.busy && !!flight}
            onPress={() => void launch()}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <SecondaryButton
              style={{ flex: 1 }}
              title={t('gravity.reset')}
              onPress={() => setPlaced(p.movable.map(() => null))}
              disabled={!!flight}
            />
            {p.tries >= 2 && (
              <SecondaryButton
                style={{ flex: 1 }}
                title={t('gravity.skip')}
                onPress={() => void giveUp()}
                disabled={!!flight}
              />
            )}
          </View>
        </View>
      )}
    </Sheet>
  );
}

function Legend({ color, text, ring }: { color: string; text: string; ring?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: ring ? 'transparent' : color,
          borderWidth: ring ? 2 : 0,
          borderColor: color,
        }}
      />
      <Text style={{ fontFamily: Fonts.semibold, fontSize: 12, color: W.inkSoft }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: PX,
    height: PX * BOARD.h,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.lineStrong,
  },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 8 },
  tries: { fontFamily: Fonts.semibold, fontSize: 13, color: W.muted },
  chip: {
    minHeight: 44,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: W.line,
    backgroundColor: W.surface,
  },
  chipText: { fontFamily: Fonts.bold, fontSize: 14, color: W.ink },
  small: { fontFamily: Fonts.semibold, fontSize: 14, color: W.inkSoft },
  mass: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: W.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: W.key,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/** The worked example: the comet would pass above the ring; a planet below its path bends it down into the ring. */
function HowTo() {
  const { t } = useTranslation('space');
  return (
    <View
      style={[{ width: '100%', maxWidth: 280, aspectRatio: 260 / 140, alignSelf: 'center' }, LTR]}
      {...ltr}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Svg viewBox="0 0 260 140" width="100%" height="100%">
        <Circle cx={214} cy={98} r={14} fill="#E3F5F1" stroke={D.good} strokeWidth={2} strokeDasharray="4 3" />
        <Circle cx={214} cy={98} r={3} fill={D.good} />
        {/* Without the planet: straight on, over the ring. With it: pulled down into the ring. */}
        <Line x1={24} y1={40} x2={250} y2={40} stroke={D.axis} strokeWidth={1.4} strokeDasharray="4 4" />
        <Path d="M24,40 Q150,36 214,98" stroke={D.accent} strokeWidth={2} fill="none" />
        <Circle cx={132} cy={104} r={13} fill={D.accent} />
        <Line x1={132} y1={88} x2={132} y2={60} stroke={D.accent} strokeWidth={1} strokeDasharray="2 3" />
        <Circle cx={24} cy={40} r={5} fill={D.ink} />
        <SvgText fontFamily={Fonts.semibold} x={24} y={26} fontSize={10} fill={D.ink} textAnchor="middle">
          {t('play.gravity.comet')}
        </SvgText>
        <SvgText fontFamily={Fonts.semibold} x={214} y={128} fontSize={10} fill={D.good} textAnchor="middle">
          {t('play.gravity.target')}
        </SvgText>
        <SvgText fontFamily={Fonts.semibold} x={132} y={132} fontSize={10} fill={D.accent} textAnchor="middle">
          {t('play.gravity.planetN', { n: 1 })}
        </SvgText>
      </Svg>
    </View>
  );
}

defineGameFrame('gravity-master', {
  HowTo,
  hearts: false,
  review: (run) =>
    ((run as GravityRun).puzzles ?? []).flatMap((x) =>
      x.result
        ? [{ key: String(x.id), correct: x.result.correct, main: `#${x.id + 1}`, detail: `${x.result.points}` }]
        : [],
    ),
});
