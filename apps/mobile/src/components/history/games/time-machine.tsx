import { t as i18nT } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { W } from '@/components/games/ui';
import { defineGameFrame } from '@/components/lab/contract';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { TimeMachineRun } from '@/lib/api';
import type { HistoryGame } from '@/lib/games/use-lab-run';

import { Board, Eyebrow, OrderList, Panel, QuizCard, quiz } from '../quiz';

/** Translation outside React (review lists for the results screen). */
const tr = i18nT as unknown as (key: string, options?: Record<string, unknown>) => string;

type Era = TimeMachineRun['eras'][number];

/**
 * Time Machine: a journey through real moments in history, earliest first. Each stop has a museum
 * label and two challenges (a question, or putting events in order). The journey is drawn as a
 * timeline across the top.
 */
export function TimeMachine({ g, run, paused }: { g: HistoryGame; run: TimeMachineRun; paused: boolean }) {
  const { t } = useTranslation('history');
  const tx = t as unknown as (k: string, o?: Record<string, unknown>) => string;
  const total = run.eras.length;
  const [at, setAt] = useState(() => Math.min(run.at, total * 2 - 1));
  const k = Math.floor(at / 2);
  const j = at % 2;
  const era = run.eras[k]!;
  const c = era.challenges[j]!;
  const over = run.status !== 'playing' || run.hearts <= 0;
  const last = at >= total * 2 - 1 || over;
  const next = () => (last || run.at >= total * 2 ? void g.finish() : setAt(at + 1));
  const nextLabel = last ? tx('quiz.finish') : j === 1 ? tx('quiz.nextStop') : tx('quiz.next');
  const eyebrow = tx('quiz.challenge', { n: j + 1 });
  const seconds = run.seconds ?? 0;

  return (
    <Board>
      <Timeline eras={run.eras} at={k} />
      <Placard era={era} n={k + 1} total={total} />
      {c.type === 'order' ? (
        <OrderList
          key={c.id}
          eyebrow={eyebrow}
          q={c.q}
          items={c.items}
          seconds={seconds * 2}
          paused={paused}
          done={c.result}
          onAnswer={async (order) => {
            const res = await g.answer(order ? { step: c.id, order } : { step: c.id, timeout: true });
            if (!res) return null;
            g.buzz(res.outcome.correct ? 'success' : 'error');
            return res.outcome;
          }}
          onNext={next}
          nextLabel={nextLabel}
        />
      ) : (
        <QuizCard
          key={c.id}
          eyebrow={eyebrow}
          q={c.q}
          options={c.options}
          seconds={seconds}
          paused={paused}
          done={c.result ? { correct: c.result.correct, answer: c.result.answer } : undefined}
          onAnswer={async (choice) => {
            const res = await g.answer(choice === null ? { step: c.id, timeout: true } : { step: c.id, choice });
            if (!res) return null;
            g.buzz(res.outcome.correct ? 'success' : 'error');
            return res.outcome;
          }}
          onNext={next}
          nextLabel={nextLabel}
        />
      )}
    </Board>
  );
}

/** The museum label of a stop: date and place, title, and what is happening. */
function Placard({ era, n, total }: { era: Era; n: number; total: number }) {
  const { t } = useTranslation('history');
  const tx = t as unknown as (k: string, o?: Record<string, unknown>) => string;
  return (
    <Panel style={styles.placard}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Eyebrow>{tx('quiz.stop', { n, total })}</Eyebrow>
        </View>
        <Text style={styles.when}>{era.when}</Text>
      </View>
      <Text style={quiz.title} accessibilityRole="header">
        {era.title}
      </Text>
      <Text style={styles.place}>{era.place}</Text>
      <View style={styles.rule} />
      <Text style={quiz.body}>{era.intro}</Text>
    </Panel>
  );
}

/**
 * The journey as a timeline: one mark per stop, evenly spaced (history spans thousands of years, so
 * the spacing is by order, not to scale), with its date; stops passed are filled, the current one ringed.
 */
function Timeline({ eras, at }: { eras: Era[]; at: number }) {
  const { t } = useTranslation('history');
  const tx = t as unknown as (k: string, o?: Record<string, unknown>) => string;
  const w = 340;
  const pad = 26;
  const x = (k: number) => (eras.length === 1 ? w / 2 : pad + ((w - 2 * pad) * k) / (eras.length - 1));
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={tx('timeline.a11y', { list: eras.map((e) => `${e.when} ${e.title}`).join('; ') })}
      style={styles.timeline}>
      <Svg width="100%" height={64} viewBox={`0 0 ${w} 64`}>
        <Line x1={8} x2={w - 8} y1={28} y2={28} stroke={W.lineStrong} strokeWidth={2} />
        <Path d={`M${w - 14},23 L${w - 6},28 L${w - 14},33`} stroke={W.lineStrong} strokeWidth={2} fill="none" />
        {/* Minor ticks: a ruler. */}
        {Array.from({ length: 33 }, (_, i) => (
          <Line key={i} x1={10 + i * 10} x2={10 + i * 10} y1={28} y2={i % 5 === 0 ? 34 : 31} stroke={W.line} strokeWidth={1} />
        ))}
        {eras.map((e, k) => (
          <G key={e.id}>
            {k < at && <Line x1={x(k)} x2={x(k + 1)} y1={28} y2={28} stroke={W.ink} strokeWidth={3} />}
            <Circle cx={x(k)} cy={28} r={k === at ? 9 : 6} fill={k <= at ? W.ink : W.surface} stroke={W.ink} strokeWidth={2} />
            {k === at && <Circle cx={x(k)} cy={28} r={13} fill="none" stroke={W.focus} strokeWidth={2} />}
            <SvgText x={x(k)} y={56} fontSize={11} fill={k === at ? W.ink : W.muted} textAnchor="middle" fontFamily={k === at ? Fonts.bold : Fonts.semibold}>
              {e.when.length > 12 ? `${e.when.slice(0, 11)}…` : e.when}
            </SvgText>
          </G>
        ))}
      </Svg>
    </View>
  );
}

/** The how-to example: two events in order on a little timeline. */
function HowTo() {
  return (
    <View style={{ gap: 8 }}>
      <Timeline
        eras={[
          { id: 'a', title: 'Ghana becomes independent', when: '1957', year: 1957, place: 'Accra', intro: '', challenges: [] },
          { id: 'b', title: 'The OAU is founded', when: '1963', year: 1963, place: 'Addis Ababa', intro: '', challenges: [] },
          { id: 'c', title: 'Moon landing', when: '1969', year: 1969, place: '', intro: '', challenges: [] },
        ]}
        at={1}
      />
    </View>
  );
}

defineGameFrame('time-machine', {
  HowTo,
  review: (r) => {
    const run = r as TimeMachineRun;
    return run.eras.flatMap((e) =>
      e.challenges.flatMap((c) =>
        c.result
          ? [
              {
                key: String(c.id),
                correct: c.result.correct,
                main: c.q,
                detail: `${tr('history:review.era', { title: e.title, when: e.when })}${
                  c.result.correct ? '' : ` · ${Array.isArray(c.result.answer) ? c.result.answer.join(' → ') : c.result.answer}`
                }`,
              },
            ]
          : [],
      ),
    );
  },
});

const styles = StyleSheet.create({
  timeline: { paddingVertical: 4, paddingHorizontal: 4, borderRadius: 14, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  placard: { borderLeftWidth: 4, borderLeftColor: W.ink, gap: 6 },
  when: { fontFamily: Fonts.extrabold, fontSize: 15, color: W.focus, fontVariant: ['tabular-nums'] },
  place: { fontFamily: Fonts.semibold, fontSize: 14, color: W.muted },
  rule: { height: 1, backgroundColor: W.line, marginVertical: 2 },
});
