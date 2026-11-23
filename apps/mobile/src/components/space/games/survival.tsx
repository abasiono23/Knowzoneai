import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { W } from '@/components/games/ui';
import { defineGameFrame } from '@/components/lab/contract';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { AsteroidSurvivalRun } from '@/lib/api';
import type { SpaceGame } from '@/lib/games/use-lab-run';

import {
  Card,
  choiceReview,
  CodeBlock,
  D,
  DataRows,
  LTR,
  ltr,
  QuizStep,
  Sheet,
  StepBar,
  useAdvance,
  useTween,
} from '../kit';

/**
 * Asteroid Survival: an asteroid is on a collision course. Each calculation you get right is a
 * correction burn that pushes its closest approach further from Earth; each wrong one lets it close in.
 * Turn-based, with the world's question timer (or none).
 */
export function Survival({ g, run, paused }: { g: SpaceGame; run: AsteroidSurvivalRun; paused: boolean }) {
  const { t } = useTranslation('space');
  const total = run.challenges.length;
  const { i, next, over } = useAdvance(run, total, g.finish);
  const c = run.challenges[i]!;
  return (
    <Sheet>
      <StepBar label={t('play.survival.step', { n: i + 1, total })} n={i + 1} total={total} />
      <Card style={{ padding: 8 }}>
        <Approach run={run} />
      </Card>
      <QuizStep
        stepKey={c.id}
        q={c.q}
        options={c.options}
        seconds={run.seconds}
        paused={paused}
        mono
        before={
          <View style={{ gap: 10 }}>
            {!!c.given?.length && <DataRows rows={c.given.map((x) => splitGiven(x, t('play.survival.data')))} />}
            {!!c.hint && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="bulb-outline" size={16} color={W.inkSoft} />
                <View style={{ flex: 1 }}>
                  <CodeBlock text={c.hint} label={t('play.survival.formula')} />
                </View>
              </View>
            )}
          </View>
        }
        onAnswer={async (choice) => {
          const res = await g.answer(choice === null ? { step: i, timeout: true } : { step: i, choice });
          if (!res) return null;
          g.buzz(res.outcome.correct ? 'success' : 'error');
          return res.outcome;
        }}
        rightDetail={(o) =>
          o.combo && o.combo > 1
            ? `${t('play.survival.burn')} · ${t('play.combo', { count: o.combo })}`
            : t('play.survival.burn')
        }
        nextLabel={over ? t('play.finish') : undefined}
        onNext={next}
      />
    </Sheet>
  );
}

/** "G = 6.67 × 10⁻¹¹ N·m²/kg²" → ["G", "6.67 × 10⁻¹¹ N·m²/kg²"]; anything without "=" is a formula row. */
function splitGiven(x: string, fallback: string): [string, string] {
  const k = x.indexOf(' = ');
  return k > 0 && k < 40 ? [x.slice(0, k), x.slice(k + 3)] : [fallback, x];
}

/**
 * Closest approach plot: Earth on the left, the asteroid's predicted path as a hyperbola-like curve;
 * its miss distance grows with each right answer and shrinks with each wrong one.
 */
function Approach({ run }: { run: AsteroidSurvivalRun }) {
  const { t } = useTranslation('space');
  const right = run.challenges.filter((x) => x.result?.correct).length;
  const wrong = run.challenges.filter((x) => x.result && !x.result.correct).length;
  // Miss distance in Earth radii: starts on a hit course (0.6), each burn adds, each miss takes away.
  const target = Math.max(0, 0.6 + right * (6 / run.challenges.length) - wrong * 0.4);
  const miss = useTween(target);
  const safe = miss >= 3;
  const Wd = 320;
  const H = 150;
  const ex = 70;
  const ey = 80;
  const R = 16;
  const passY = ey - R * (1 + miss) * 0.9;
  const path = `M ${Wd - 10} 12 Q ${ex + 40} ${passY + 4} ${ex - 2} ${passY} T 10 ${Math.max(10, passY - 30)}`;
  return (
    <View
      style={[{ width: '100%', aspectRatio: Wd / H }, LTR]}
      {...ltr}
      accessible
      accessibilityLabel={t('play.survival.a11y', { miss: miss.toFixed(1) })}>
      <Svg viewBox={`0 0 ${Wd} ${H}`} width="100%" height="100%">
        {Array.from({ length: 9 }, (_, k) => (
          <Line key={k} x1={k * 40} y1={0} x2={k * 40} y2={H} stroke={D.grid} />
        ))}
        {Array.from({ length: 4 }, (_, k) => (
          <Line key={`h${k}`} x1={0} y1={k * 40 + 10} x2={Wd} y2={k * 40 + 10} stroke={D.grid} />
        ))}
        {/* The danger zone: inside about 3 Earth radii counts as a hit. */}
        <Circle cx={ex} cy={ey} r={R * 3} fill="#FCE8EC" opacity={0.6} />
        <Circle cx={ex} cy={ey} r={R} fill={D.sky} />
        <Path
          d={path}
          stroke={safe ? D.good : D.bad}
          strokeWidth={2}
          fill="none"
          strokeDasharray={safe ? undefined : '5 4'}
        />
        <G>
          <Circle cx={Wd - 10} cy={12} r={5} fill={D.soft} />
        </G>
        <Line x1={ex} y1={ey} x2={ex} y2={passY} stroke={D.ink} strokeWidth={1} />
        <Rect x={ex + 6} y={(ey + passY) / 2 - 9} width={96} height={18} rx={4} fill="#fff" stroke={D.axis} />
        <SvgText
          x={ex + 54}
          y={(ey + passY) / 2 + 4}
          fontSize={10}
          fontFamily={Fonts.bold}
          fill={safe ? D.good : D.bad}
          textAnchor="middle">
          {t('play.survival.miss', { value: miss.toFixed(1) })}
        </SvgText>
      </Svg>
      <Text
        style={{
          position: 'absolute',
          right: 8,
          bottom: 4,
          fontFamily: Fonts.bold,
          fontSize: 12,
          color: safe ? W.correct : W.wrong,
        }}>
        {safe ? `✓ ${t('play.survival.safe')}` : `! ${t('play.survival.danger')}`}
      </Text>
    </View>
  );
}

defineGameFrame('asteroid-survival', { review: (run) => choiceReview((run as AsteroidSurvivalRun).challenges ?? []) });
