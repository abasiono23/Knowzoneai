import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { W } from '@/components/games/ui';
import { defineGameFrame } from '@/components/lab/contract';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { SolarExplorerRun } from '@/lib/api';
import type { SpaceGame } from '@/lib/games/use-lab-run';

import { Card, choiceReview, D, DataRows, Eyebrow, LTR, ltr, QuizStep, Sheet, StepBar, useAdvance } from '../kit';

/** Mean distance from the Sun in AU, for the map (log scale). */
const AU: Record<string, number> = {
  sun: 0,
  mercury: 0.387,
  venus: 0.723,
  earth: 1,
  bennu: 1.13,
  mars: 1.52,
  ceres: 2.77,
  jupiter: 5.2,
  saturn: 9.58,
  uranus: 19.2,
  neptune: 30.1,
  pluto: 39.5,
  arrokoth: 44.6,
};
const MAP_PLANETS = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
/** Radius on the map: log scale so Mercury and Neptune both fit. */
const ring = (au: number) => (au <= 0 ? 0 : 12 + 21 * Math.log2(1 + au * 2.2));
/** A fixed angle per body so the map is the same every time (not real positions on a date). */
const angleOf = (id: string) =>
  ((id.split('').reduce((n, ch) => n + ch.charCodeAt(0), 0) * 47) % 360) * (Math.PI / 180);

/**
 * Solar System Explorer: a probe tours places on a map of the Solar System (orbits drawn to a log
 * scale). At each stop the probe's readout gives the real numbers, then two mission questions.
 */
export function Explorer({ g, run, paused }: { g: SpaceGame; run: SolarExplorerRun; paused: boolean }) {
  const { t } = useTranslation('space');
  const all = run.visits.flatMap((v) => v.questions);
  const total = all.length;
  const { i, next, over } = useAdvance(run, total, g.finish);
  let k = 0;
  const visitIndex = run.visits.findIndex((v) => v.questions.some(() => k++ === i));
  const visit = run.visits[Math.max(0, visitIndex)]!;
  const q = all[i]!;
  const nInVisit = visit.questions.findIndex((x) => x.id === q.id);
  const d = visit.data;
  const unit = (u: 'h' | 'd' | 'y') => t(`play.explorer.units.${u}`);
  const rows: [string, string][] = d
    ? [
        [t('play.explorer.radius'), `${d.radius.toLocaleString('en-US').replace(/,/g, ' ')} km`],
        ...(d.gravity !== undefined ? ([[t('play.explorer.gravity'), `${d.gravity} m/s²`]] as [string, string][]) : []),
        [t('play.explorer.around'), t(`play.explorer.bodies.${d.around}` as never, { defaultValue: d.around })],
        ...(d.period
          ? ([[t('play.explorer.period'), `${d.period[0]} ${unit(d.period[1])}`]] as [string, string][])
          : []),
        ...(d.distance
          ? ([
              [
                t('play.explorer.distance'),
                `${d.distance[0].toLocaleString('en-US').replace(/,/g, ' ')} ${d.distance[1]}`,
              ],
            ] as [string, string][])
          : []),
      ]
    : [];
  return (
    <Sheet>
      <StepBar
        label={t('play.explorer.step', { n: Math.max(0, visitIndex) + 1, total: run.visits.length, name: visit.name })}
        n={i + 1}
        total={total}
      />
      <Card style={{ padding: 8, alignItems: 'center' }}>
        <Orrery run={run} current={Math.max(0, visitIndex)} />
      </Card>
      {nInVisit === 0 && (
        <Card>
          <Eyebrow text={t('play.explorer.readout')} />
          <Text style={{ fontFamily: Fonts.extrabold, fontSize: 22, color: W.ink }}>{visit.name}</Text>
          <Text style={{ fontFamily: Fonts.semibold, fontSize: 14, color: W.inkSoft }}>
            {t('play.explorer.mission', { mission: visit.mission })}
          </Text>
          {rows.length > 0 && <DataRows rows={rows} />}
          <View style={{ gap: 6 }}>
            {visit.facts.map((f) => (
              <View key={f} style={{ flexDirection: 'row', gap: 8 }}>
                <Ionicons name="ellipse" size={6} color={W.inkSoft} style={{ marginTop: 8 }} />
                <Text style={{ flex: 1, fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: W.ink }}>
                  {f}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      )}
      <QuizStep
        stepKey={q.id}
        q={q.q}
        options={q.options}
        paused={paused}
        onAnswer={async (choice) => {
          const res = await g.answer(choice === null ? { step: i, timeout: true } : { step: i, choice });
          if (!res) return null;
          g.buzz(res.outcome.correct ? 'success' : 'error');
          return res.outcome;
        }}
        nextLabel={
          over ? t('play.finish') : nInVisit === visit.questions.length - 1 ? t('play.explorer.fly') : undefined
        }
        onNext={next}
      />
    </Sheet>
  );
}

function Orrery({ run, current }: { run: SolarExplorerRun; current: number }) {
  const { t } = useTranslation('space');
  const S = 320;
  const c = S / 2;
  const pos = (id: string, around?: string) => {
    const base = around && around !== 'sun' && around !== 'galaxy' ? around : id;
    const r = ring(AU[base] ?? 1);
    const a = angleOf(base);
    return [c + r * Math.cos(a), c + r * Math.sin(a)] as const;
  };
  const stops = run.visits.map((v) => pos(v.id, v.data?.around));
  return (
    <View
      style={[{ width: '100%', maxWidth: 380, aspectRatio: 1 }, LTR]}
      {...ltr}
      accessible
      accessibilityLabel={t('play.explorer.mapA11y', { names: run.visits.map((v) => v.name).join(', ') })}>
      <Svg viewBox={`0 0 ${S} ${S}`} width="100%" height="100%">
        {MAP_PLANETS.map((p) => (
          <Circle key={p} cx={c} cy={c} r={ring(AU[p]!)} stroke={D.grid} strokeWidth={1.2} fill="none" />
        ))}
        <Circle cx={c} cy={c} r={ring(2.77)} stroke={D.grid} strokeDasharray="1 3" fill="none" />
        <Circle cx={c} cy={c} r={9} fill="#F2B233" />
        {MAP_PLANETS.map((p) => {
          const [x, y] = pos(p);
          return (
            <G key={p}>
              <Circle cx={x} cy={y} r={p === 'jupiter' || p === 'saturn' ? 5 : 3.5} fill={D.soft} />
              <SvgText fontFamily={Fonts.semibold} x={x + 7} y={y + 3} fontSize={8.5} fill={D.muted}>
                {t(`play.explorer.bodies.${p}` as never)}
              </SvgText>
            </G>
          );
        })}
        {/* The route: Earth, then each stop in order. */}
        <Path
          d={`M ${pos('earth')[0]} ${pos('earth')[1]} ${stops.map(([x, y]) => `L ${x} ${y}`).join(' ')}`}
          stroke={D.accent}
          strokeWidth={1.4}
          strokeDasharray="4 4"
          fill="none"
          opacity={0.7}
        />
        {run.visits.map((v, k) => {
          const [x, y] = stops[k]!;
          const done = v.questions.every((q) => q.result);
          const now = k === current;
          return (
            <G key={v.id}>
              <Circle
                cx={x}
                cy={y}
                r={now ? 9 : 7}
                fill="#fff"
                stroke={now ? D.accent : done ? D.good : D.ink}
                strokeWidth={2}
              />
              <SvgText
                x={x}
                y={y + 3.5}
                fontSize={9}
                fontFamily={Fonts.bold}
                fill={now ? D.accent : done ? D.good : D.ink}
                textAnchor="middle">
                {k + 1}
              </SvgText>
              {now && (
                <SvgText x={x} y={y - 13} fontSize={10} fontFamily={Fonts.bold} fill={D.accent} textAnchor={x > S - 50 ? "end" : x < 50 ? "start" : "middle"}>
                  {v.name}
                </SvgText>
              )}
            </G>
          );
        })}
        <Line x1={12} y1={S - 14} x2={60} y2={S - 14} stroke={D.axis} />
        <SvgText fontFamily={Fonts.semibold} x={12} y={S - 20} fontSize={8} fill={D.muted}>
          {t('play.explorer.logScale')}
        </SvgText>
      </Svg>
    </View>
  );
}

defineGameFrame('solar-explorer', {
  review: (run) => choiceReview(((run as SolarExplorerRun).visits ?? []).flatMap((v) => v.questions)),
});
