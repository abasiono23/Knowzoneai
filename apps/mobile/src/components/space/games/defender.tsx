import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { defineGameFrame } from '@/components/lab/contract';
import { Fonts } from '@/constants/theme';
import type { GalaxyDefenderRun } from '@/lib/api';
import type { SpaceGame } from '@/lib/games/use-lab-run';

import { Card, choiceReview, D, Eyebrow, LTR, ltr, QuizStep, Sheet, StepBar, useAdvance } from '../kit';

/**
 * Galaxy Defender: objects are falling towards Earth on straight-line (hyperbolic, far from Earth)
 * paths. Each right answer fires a deflection burn: that object's path bends away and it misses;
 * a wrong answer lets it through (and costs a heart). Turn-based: nothing moves until you answer.
 */
export function Defender({ g, run, paused }: { g: SpaceGame; run: GalaxyDefenderRun; paused: boolean }) {
  const { t } = useTranslation('space');
  const total = run.questions.length;
  const { i, next, over } = useAdvance(run, total, g.finish);
  const q = run.questions[i]!;
  return (
    <Sheet>
      <StepBar label={t('play.defender.step', { n: i + 1, total })} n={i + 1} total={total} />
      <Card style={{ padding: 8, alignItems: 'center' }}>
        <DefenceMap run={run} current={i} />
        <Eyebrow
          text={t('play.defender.status', { saved: run.questions.filter((x) => x.result?.correct).length, total })}
        />
      </Card>
      <QuizStep
        stepKey={q.id}
        q={q.q}
        options={q.options}
        seconds={run.seconds}
        paused={paused}
        onAnswer={async (choice) => {
          const res = await g.answer(choice === null ? { step: i, timeout: true } : { step: i, choice });
          if (!res) return null;
          g.buzz(res.outcome.correct ? 'success' : 'error');
          return res.outcome;
        }}
        rightDetail={(o) =>
          o.combo && o.combo > 1 ? t('play.combo', { count: o.combo }) : t('play.defender.deflected')
        }
        nextLabel={over ? t('play.finish') : undefined}
        onNext={next}
      />
    </Sheet>
  );
}

/** The plot: Earth, the Moon's orbit for scale, and one incoming path per question. */
function DefenceMap({ run, current }: { run: GalaxyDefenderRun; current: number }) {
  const { t } = useTranslation('space');
  const n = run.questions.length;
  const S = 300;
  const c = S / 2;
  const earth = 22;
  const label = t('play.defender.mapA11y', {
    saved: run.questions.filter((x) => x.result?.correct).length,
    hit: run.questions.filter((x) => x.result && !x.result.correct).length,
    left: run.questions.filter((x) => !x.result).length,
  });
  return (
    <View
      style={[{ width: '100%', maxWidth: 360, aspectRatio: 1 }, LTR]}
      {...ltr}
      accessible
      accessibilityLabel={label}>
      <Svg viewBox={`0 0 ${S} ${S}`} width="100%" height="100%">
        {/* Range rings every 40 units, like a radar plot. */}
        {[40, 80, 120].map((r) => (
          <Circle key={r} cx={c} cy={c} r={r} stroke={D.grid} strokeWidth={1} fill="none" />
        ))}
        <Line x1={c - 140} y1={c} x2={c + 140} y2={c} stroke={D.grid} />
        <Line x1={c} y1={c - 140} x2={c} y2={c + 140} stroke={D.grid} />
        <Circle cx={c} cy={c} r={100} stroke={D.axis} strokeDasharray="2 4" fill="none" />
        <SvgText fontFamily={Fonts.semibold} x={c + 72} y={c - 74} fontSize={9} fill={D.muted}>
          {t('play.defender.moonOrbit')}
        </SvgText>
        {run.questions.map((x, k) => {
          // Paths come in from all round the edge, aimed just off the centre.
          const a = (k / n) * Math.PI * 2 - Math.PI / 2 + 0.3;
          const sx = c + 145 * Math.cos(a);
          const sy = c + 145 * Math.sin(a);
          const miss = 9 * (k % 2 ? 1 : -1);
          const px = -Math.sin(a) * miss;
          const py = Math.cos(a) * miss;
          const ex = c + px + (earth + 4) * Math.cos(a);
          const ey = c + py + (earth + 4) * Math.sin(a);
          const done = x.result;
          const now = k === current && !done;
          if (done?.correct) {
            // Deflected: the path bends away at about 60 units out.
            const bx = c + 62 * Math.cos(a) + px;
            const by = c + 62 * Math.sin(a) + py;
            const turn = a + (k % 2 ? 1 : -1) * 1.15;
            const fx = bx - 70 * Math.cos(turn);
            const fy = by - 70 * Math.sin(turn);
            return (
              <G key={x.id}>
                <Path
                  d={`M${sx},${sy} L${bx},${by} Q${bx - 20 * Math.cos(a)},${by - 20 * Math.sin(a)} ${fx},${fy}`}
                  stroke={D.good}
                  strokeWidth={1.8}
                  fill="none"
                />
                <Circle cx={fx} cy={fy} r={3.5} fill={D.good} />
              </G>
            );
          }
          if (done) {
            return (
              <G key={x.id}>
                <Line x1={sx} y1={sy} x2={ex} y2={ey} stroke={D.bad} strokeWidth={1.8} />
                <Path
                  d={`M${ex - 4},${ey - 4} L${ex + 4},${ey + 4} M${ex + 4},${ey - 4} L${ex - 4},${ey + 4}`}
                  stroke={D.bad}
                  strokeWidth={2}
                />
              </G>
            );
          }
          return (
            <G key={x.id}>
              <Line
                x1={sx}
                y1={sy}
                x2={ex}
                y2={ey}
                stroke={now ? D.accent : D.axis}
                strokeWidth={now ? 2 : 1.2}
                strokeDasharray="4 4"
              />
              <Circle cx={sx} cy={sy} r={now ? 6 : 4} fill={now ? D.accent : D.soft} />
              {now && <Circle cx={sx} cy={sy} r={11} stroke={D.accent} strokeWidth={1.2} fill="none" />}
            </G>
          );
        })}
        <Circle cx={c} cy={c} r={earth + 5} fill="#E4EEFC" />
        <Circle cx={c} cy={c} r={earth} fill={D.sky} />
        <Path d={`M${c - 12},${c - 8} q8,-6 14,0 q4,6 -4,10 q-8,2 -10,-10 Z`} fill="#3E9A6A" opacity={0.85} />
        <SvgText fontFamily={Fonts.semibold} x={c} y={c + earth + 16} fontSize={10} fill={D.soft} textAnchor="middle">
          {t('play.defender.earth')}
        </SvgText>
      </Svg>
    </View>
  );
}

defineGameFrame('galaxy-defender', { review: (run) => choiceReview((run as GalaxyDefenderRun).questions ?? []) });
