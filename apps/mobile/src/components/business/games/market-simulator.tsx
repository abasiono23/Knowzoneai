import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import {
  Action,
  AnalystDesk,
  atDesk,
  LineChart,
  Card,
  Eyebrow,
  GameScreen,
  GREEN,
  Header,
  kit,
  Lesson,
  Options,
  RED,
  Stepper,
} from '@/components/business/kit';
import { BOLD } from '@/components/lab/hud';
import { Text } from '@/components/ui';
import type { MarketSimulatorRun } from '@/lib/api';
import { money, pct } from '@/lib/games/business';
import type { BusinessGame } from '@/lib/games/use-lab-run';
import { defineGameFrame } from '@/components/lab/contract';
import { t as i18nT } from 'i18next';

import { deskReview } from '../review';

/** Translation outside React (review lists for the results screen). */
const tr = i18nT as unknown as (key: string, options?: Record<string, unknown>) => string;

const RISK_COLOR = { low: GREEN, medium: '#C98A00', high: RED } as const;

/**
 * Market Simulator: practice investing. Each quarter: read the news, answer an investor question and
 * spread the portfolio across cash, bonds, an index fund and made-up companies. The server moves the
 * market and compares you with the whole market.
 */
export function MarketSimulator({ g, run, paused }: { g: BusinessGame; run: MarketSimulatorRun; paused?: boolean }) {
  const [i, setI] = useState(() => Math.min(run.at, run.quarters.length - 1));
  const [desk, setDesk] = useState(() => atDesk(run));
  const next = () => {
    if (run.status !== 'playing' || run.hearts <= 0) void g.finish();
    else if (run.at >= run.quarters.length) {
      if (run.analyst?.length) setDesk(true);
      else void g.finish();
    } else setI(run.at);
  };
  if (desk) return <AnalystDesk g={g} run={run} paused={paused} />;
  return <Quarter key={i} g={g} run={run} i={i} onNext={next} />;
}

/** The portfolio and the index fund, from the start to the last quarter played. */
function Growth({ run }: { run: MarketSimulatorRun }) {
  const { t } = useTranslation('business');
  const tx = t as unknown as (key: string, options?: Record<string, unknown>) => string;
  const done = run.quarters.flatMap((q) => (q.report ? [q.report] : []));
  if (!done.length) return null;
  const start = done[0]!.before;
  const mine = [start, ...done.map((r) => r.value)];
  const index = [start, ...done.map((r) => r.indexValue)];
  return (
    <Card>
      <LineChart
        title={tx('charts.portfolio')}
        labels={mine.map((_, k) => (k ? tx('charts.quarter', { n: k }) : '0'))}
        series={[
          { name: tx('charts.portfolio'), values: mine },
          { name: tx('charts.index'), values: index, dashed: true },
        ]}
        summary={`${tx('charts.portfolio')} ${money(mine.at(-1)!)}, ${tx('charts.index')} ${money(index.at(-1)!)}`}
      />
    </Card>
  );
}

function Quarter({ g, run, i, onNext }: { g: BusinessGame; run: MarketSimulatorRun; i: number; onNext: () => void }) {
  const { t } = useTranslation('business');
  const tx = t as unknown as (key: string, options?: Record<string, unknown>) => string;
  const options = (id: string) =>
    t(`invest.quiz.${id}.options` as 'invest.quiz.share.options', { returnObjects: true }) as unknown as string[];
  const quarter = run.quarters[i]!;
  const report = quarter.report;
  const before = i > 0 ? run.quarters[i - 1]!.report : undefined;
  const [weights, setWeights] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      run.assets.map((a) => [a, before ? Math.round((before.weights[a] ?? 0) * 100) : a === 'cash' ? 100 : 0]),
    ),
  );
  const [answer, setAnswer] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const name = (a: string) => tx(`invest.assets.${a}.name`);
  const q = `invest.quiz.${quarter.quiz.id}`;

  const submit = async () => {
    if (answer === null) return setNote(t('ui.pick'));
    if (total !== 100) return setNote(t('invest.totalHint'));
    setNote(null);
    const res = await g.answer({
      step: i,
      plan: Object.fromEntries(Object.entries(weights).filter(([, v]) => v > 0)),
      choice: answer,
    });
    if (!res) return;
    if (res.outcome.retry) return setNote(t(res.outcome.end === 'unbalanced' ? 'invest.totalHint' : 'ui.invalid'));
    g.buzz(res.outcome.correct ? 'success' : 'error');
  };

  const header = (
    <Header
      title={t('invest.quarter', { n: i + 1, total: run.quarters.length })}
      subtitle={t('invest.practice')}
      stats={[
        {
          label: t('invest.portfolio'),
          value: money(run.value),
          tone: run.value >= run.index ? ('good' as const) : ('bad' as const),
        },
        { label: name('index'), value: money(run.index) },
      ]}
    />
  );
  const news = (
    <Card>
      <Eyebrow>{t('invest.news')}</Eyebrow>
      {quarter.news.map((n) => (
        <View key={n} style={kit.row}>
          <Ionicons name="newspaper-outline" size={16} color="#474C6B" />
          <Text style={[kit.body, { flex: 1 }]}>{tx(`invest.newsItems.${n}`)}</Text>
        </View>
      ))}
    </Card>
  );

  if (report) {
    const last = (run.at >= run.quarters.length && !run.analyst?.length) || run.hearts <= 0;
    const held = run.assets.filter((a) => (report.weights[a] ?? 0) > 0);
    return (
      <GameScreen
        action={
          <Action
            title={last ? t('ui.finish') : t('ui.next')}
            onPress={onNext}
            icon={last ? 'flag' : 'arrow-forward'}
          />
        }>
        {header}
        <Growth run={run} />
        {news}
        <Card>
          <Eyebrow>{t('invest.report', { n: i + 1 })}</Eyebrow>
          {run.assets.map((a) => (
            <View key={a} style={kit.row}>
              <Text style={[kit.body, { flex: 1, fontFamily: held.includes(a) ? BOLD : undefined }]}>
                {name(a)}
                {held.includes(a) ? ` · ${Math.round(report.weights[a]! * 100)}%` : ''}
              </Text>
              <Text style={{ fontFamily: BOLD, color: report.returns[a]! >= 0 ? GREEN : RED }}>
                {pct(report.returns[a]!)}
              </Text>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: '#DDD6C6' }} />
          <Text style={[kit.body, { fontFamily: BOLD, color: report.ret >= report.index ? GREEN : RED }]}>
            {t('invest.yourReturn', { pct: pct(report.ret) })}
          </Text>
          <Text style={kit.body}>{t('invest.indexReturn', { pct: pct(report.index) })}</Text>
          {report.fees > 0 && <Text style={kit.small}>{t('invest.fees', { pct: pct(-report.fees) })}</Text>}
          <Text style={kit.body}>{t('invest.value', { value: report.value.toLocaleString('en-US') })}</Text>
          {report.concentrated && <Text style={[kit.small, { color: RED }]}>{t('invest.concentrated')}</Text>}
          <Text style={{ fontFamily: BOLD, color: GREEN }}>{t('ui.points', { points: report.points })}</Text>
        </Card>
        <Card>
          <Eyebrow>{t('invest.quizTitle')}</Eyebrow>
          <Text style={kit.title}>{tx(`${q}.q`)}</Text>
          <Options
            options={options(quarter.quiz.id).map((label, k) => ({ id: String(k), label }))}
            picked={null}
            onPick={() => {}}
            disabled
            marks={{
              ...(report.choice && report.choice !== report.answer && { [report.choice]: 'wrong' as const }),
              [report.answer]: 'right',
            }}
          />
          <Lesson text={tx(`${q}.why`)} />
        </Card>
      </GameScreen>
    );
  }

  return (
    <GameScreen
      action={
        <Action
          title={t('invest.run')}
          onPress={() => void submit()}
          disabled={g.busy}
          icon="trending-up"
          note={note}
        />
      }>
      {header}
      <Growth run={run} />
      {news}
      <Card>
        <Eyebrow>{t('invest.quizTitle')}</Eyebrow>
        <Text style={kit.title}>{tx(`${q}.q`)}</Text>
        <Options
          options={options(quarter.quiz.id).map((label, k) => ({ id: String(k), label }))}
          picked={answer}
          onPick={(id) => {
            setAnswer(id);
            setNote(null);
          }}
        />
      </Card>
      <Card>
        <Eyebrow>{t('invest.allocate', { value: run.value.toLocaleString('en-US') })}</Eyebrow>
        {run.assets.map((a) => {
          const stock = run.stocks.find((s) => s.id === a);
          const risk = stock?.risk ?? (a === 'index' ? 'medium' : 'low');
          return (
            <Stepper
              key={a}
              label={name(a)}
              hint={`${tx(`invest.assets.${a}.body`)} · ${t(`invest.risk.${risk}`)}`}
              warn={!!stock && run.limit !== null && weights[a]! > run.limit}
              value={weights[a]!}
              onChange={(v) => setWeights((w) => ({ ...w, [a]: v }))}
              step={10}
              min={0}
              max={100}
              format={(v) => `${v}%`}
            />
          );
        })}
        <Text style={{ fontFamily: BOLD, color: total === 100 ? GREEN : RED }}>
          {t('invest.total', { pct: total })}
        </Text>
        {run.limit !== null && <Text style={kit.small}>{t('invest.limit', { pct: run.limit })}</Text>}
        {run.fees && <Text style={kit.small}>{t('invest.feesNote')}</Text>}
        <View style={kit.row}>
          {(['low', 'medium', 'high'] as const).map((r) => (
            <View key={r} style={kit.row}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: RISK_COLOR[r] }} />
              <Text style={kit.small}>{t(`invest.risk.${r}`)}</Text>
            </View>
          ))}
        </View>
      </Card>
    </GameScreen>
  );
}

function HowTo() {
  const { t } = useTranslation('business');
  const tx = t as unknown as (key: string) => string;
  return (
    <LineChart
      title={tx('charts.portfolio')}
      labels={['0', '1', '2', '3']}
      series={[
        { name: tx('charts.portfolio'), values: [10000, 10250, 10120, 10480] },
        { name: tx('charts.index'), values: [10000, 10180, 10210, 10390], dashed: true },
      ]}
      summary="$10,480 vs $10,390"
    />
  );
}

defineGameFrame('market-simulator', {
  HowTo,
  review: (r) => {
    const run = r as MarketSimulatorRun;
    return [
      ...run.quarters.flatMap((q, k) =>
        q.report
          ? [
              {
                key: `q${k}`,
                correct: q.report.right,
                main: `${tr('business:charts.quarter', { n: k + 1 })} · ${pct(q.report.ret)}`,
                detail: tr(`business:invest.quiz.${q.quiz.id}.q`),
              },
            ]
          : [],
      ),
      ...deskReview(run),
    ];
  },
});
