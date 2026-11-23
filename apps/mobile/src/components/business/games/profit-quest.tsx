import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Action,
  BarList,
  LineChart,
  DeskQuestion,
  Card,
  Eyebrow,
  GameScreen,
  GREEN,
  Header,
  kit,
  Lesson,
  Options,
  RED,
  Statement,
  Stepper,
} from '@/components/business/kit';
import { BOLD } from '@/components/lab/hud';
import { Text } from '@/components/ui';
import type { CalcKind, ProfitQuestRun } from '@/lib/api';
import { money } from '@/lib/games/business';
import type { BusinessGame } from '@/lib/games/use-lab-run';
import { defineGameFrame } from '@/components/lab/contract';
import { Board, QuizCard } from '@/components/history/quiz';
import { t as i18nT } from 'i18next';

/** Translation outside React (review lists for the results screen). */
const tr = i18nT as unknown as (key: string, options?: Record<string, unknown>) => string;

/** Answers that are counts of units, a percent, or money. */
const COUNTS: CalcKind[] = ['breakeven', 'machine'];

/**
 * Profit Quest: business maths challenges (contribution, break-even, profit, margin) alternate with
 * factory weeks where you set the price, how many to make and whether to invest.
 */
export function ProfitQuest({ g, run, paused }: { g: BusinessGame; run: ProfitQuestRun; paused?: boolean }) {
  const [i, setI] = useState(() => Math.min(run.at, run.steps.length - 1));
  const next = () => {
    if (run.status !== 'playing' || run.hearts <= 0 || run.at >= run.steps.length) void g.finish();
    else setI(run.at);
  };
  const type = run.steps[i]!.type;
  return type === 'week' ? (
    <Week key={i} g={g} run={run} i={i} onNext={next} />
  ) : (
    <Calc key={i} g={g} run={run} i={i} onNext={next} paused={paused} />
  );
}

function useHeader(run: ProfitQuestRun, i: number) {
  const { t } = useTranslation('business');
  const tx = t as unknown as (key: string, options?: Record<string, unknown>) => string;
  const product = tx(`profit.products.${run.product}`);
  return {
    product,
    header: (
      <Header
        title={t('profit.factory', { product })}
        subtitle={t('profit.step', { n: i + 1, total: run.steps.length })}
      />
    ),
  };
}

/** A business maths step: the factory's own sums, or (from Advanced) an analyst's question. */
function Calc({ g, run, i, onNext, paused }: { g: BusinessGame; run: ProfitQuestRun; i: number; onNext: () => void; paused?: boolean }) {
  const { t } = useTranslation('business');
  const tx = t as unknown as (key: string, options?: Record<string, unknown>) => string;
  const step = run.steps[i] as Exclude<ProfitQuestRun['steps'][number], { type: 'week' }>;
  const { product, header } = useHeader(run, i);
  const last = run.at >= run.steps.length || run.hearts <= 0;
  const send = async (choice: string | null) => {
    const res = await g.answer(choice === null ? { step: i, timeout: true } : { step: i, choice });
    if (res) g.buzz(res.outcome.correct ? 'success' : 'error');
    return res?.outcome ?? null;
  };
  if (step.type === 'analyst')
    return (
      <Board>
        {header}
        <DeskQuestion
          q={step}
          eyebrow={tx('analyst.eyebrow')}
          paused={paused}
          nextLabel={last ? t('ui.finish') : t('ui.next')}
          onAnswer={send}
          onNext={onNext}
        />
      </Board>
    );
  const show = (v: string) =>
    COUNTS.includes(step.calc) ? Number(v).toLocaleString('en-US') : step.calc === 'margin' ? t('profit.percent', { n: v }) : money(Number(v));
  const raw = (shown: string) => step.options.find((o) => show(o) === shown) ?? shown;
  const nums = Object.fromEntries(
    Object.entries(step.nums).map(([k, v]) => [k, k === 'units' ? v.toLocaleString('en-US') : money(v).slice(1)]),
  );
  const result = step.result;
  return (
    <Board>
      {header}
      <QuizCard
        eyebrow={t('profit.calcTitle')}
        q={tx(`profit.calc.${step.calc}`, { ...nums, product })}
        options={step.options.map(show)}
        seconds={step.seconds}
        paused={paused}
        ltr
        done={result ? { correct: result.correct, answer: show(result.answer), choice: result.choice ? show(result.choice) : null } : undefined}
        onAnswer={async (choice) => {
          const outcome = await send(choice === null ? null : raw(choice));
          return outcome && { ...outcome, answer: typeof outcome.answer === 'string' ? show(outcome.answer) : outcome.answer };
        }}
        onNext={onNext}
        nextLabel={last ? t('ui.finish') : t('ui.next')}
        explain={() => <Lesson text={tx(`profit.formula.${step.calc}`)} />}
      />
    </Board>
  );
}

function Week({ g, run, i, onNext }: { g: BusinessGame; run: ProfitQuestRun; i: number; onNext: () => void }) {
  const { t } = useTranslation('business');
  const tx = t as unknown as (key: string, options?: Record<string, unknown>) => string;
  const step = run.steps[i] as Extract<ProfitQuestRun['steps'][number], { type: 'week' }>;
  const report = step.report;
  const { header } = useHeader(run, i);
  const plant = run.plant;
  const [price, setPrice] = useState(() => step.research?.[0]?.price ?? run.step * 10);
  const [make, setMake] = useState(() => step.research?.[0]?.customers ?? 100);
  const [upgrade, setUpgrade] = useState('none');
  const [note, setNote] = useState<string | null>(null);

  const submit = async () => {
    setNote(null);
    const res = await g.answer({ step: i, plan: { price, make }, choice: upgrade });
    if (!res) return;
    if (res.outcome.retry) return setNote(t('ui.invalid'));
    g.buzz(res.outcome.heartLost ? 'error' : 'success');
  };

  if (report) {
    const last = run.at >= run.steps.length || run.hearts <= 0;
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
        <Card>
          <Eyebrow>{t('profit.report')}</Eyebrow>
          <BarList
            title={tx('charts.profit')}
            rows={[
              { label: tx('charts.revenue'), value: report.revenue },
              { label: tx('charts.costs'), value: -(report.cogs + report.fixed + report.storage) },
              { label: tx('charts.profit'), value: report.profit, strong: true },
            ]}
          />
          <Text style={kit.body}>
            {t('profit.line.demand', { wanted: report.wanted, sold: report.sold, stock: report.inventory })}
          </Text>
          <Statement
            rows={[
              { label: t('profit.line.revenue'), value: money(report.revenue) },
              { label: t('profit.line.cogs'), value: money(-report.cogs) },
              { label: t('profit.line.fixed'), value: money(-report.fixed) },
              { label: t('profit.line.storage'), value: money(-report.storage), hidden: !report.storage },
              {
                label: t('profit.line.profit'),
                value: money(report.profit),
                total: true,
                color: report.profit >= 0 ? GREEN : RED,
              },
            ]}
          />
          {report.inventory > 0 && <Text style={[kit.small, { color: RED }]}>{t('profit.line.over')}</Text>}
          {report.wanted > report.sold && <Text style={[kit.small, { color: RED }]}>{t('profit.line.under')}</Text>}
          <Text style={kit.small}>
            {t('profit.line.best', {
              price: money(report.bestPrice).slice(1),
              profit: report.bestProfit.toLocaleString('en-US'),
            })}
          </Text>
          <Text style={{ fontFamily: BOLD, color: GREEN }}>{t('ui.points', { points: report.points })}</Text>
          <Lesson text={t('profit.formula.breakeven')} />
        </Card>
      </GameScreen>
    );
  }

  const perUnit = price - plant.unit;
  const upgrades = [
    { id: 'none', owned: false },
    { id: 'machine', owned: plant.machine },
    { id: 'ads', owned: plant.ads },
  ].filter((u) => u.id === 'none' || !u.owned);
  return (
    <GameScreen
      action={
        <Action title={t('profit.run')} onPress={() => void submit()} disabled={g.busy} icon="play" note={note} />
      }>
      {header}
      <Card>
        <Eyebrow>{t('profit.week')}</Eyebrow>
        <Text style={kit.small}>
          {t('profit.numbers', {
            unit: money(plant.unit).slice(1),
            fixed: plant.fixed.toLocaleString('en-US'),
            stock: plant.inventory,
          })}
        </Text>
        {!!step.research?.length && <Eyebrow>{t('profit.research')}</Eyebrow>}
        {step.research?.map((r) => (
          <Text key={r.price} style={kit.body}>
            {t(r.about ? 'profit.researchAbout' : 'profit.researchRow', {
              price: money(r.price).slice(1),
              count: r.customers,
            })}
          </Text>
        ))}
      </Card>
      <Card>
        <Stepper
          label={t('profit.price')}
          value={price}
          onChange={setPrice}
          step={run.step}
          big={run.step * 5}
          min={run.step}
          max={run.maxPrice}
          format={money}
        />
        <Stepper label={t('profit.make')} value={make} onChange={setMake} step={10} big={50} min={0} max={5000} />
        <Text style={[kit.small, perUnit <= 0 && { color: RED }]}>
          {perUnit > 0 ? t('profit.breakEven', { count: Math.ceil(plant.fixed / perUnit) }) : t('profit.noBreakEven')}
        </Text>
      </Card>
      <Card>
        <BreakEven price={price} unit={plant.unit} fixed={plant.fixed} make={make} />
      </Card>
      {run.upgrades && (
        <Card>
          <Eyebrow>{t('profit.upgrades')}</Eyebrow>
          <Options
            options={upgrades.map((u) => ({
              id: u.id,
              label: tx(`profit.upgrade.${u.id}.title`),
              note: tx(`profit.upgrade.${u.id}.body`),
            }))}
            picked={upgrade}
            onPick={setUpgrade}
          />
          {(plant.machine || plant.ads) && (
            <Text style={kit.small}>
              {[plant.machine && t('profit.upgrade.machine.title'), plant.ads && t('profit.upgrade.ads.title')]
                .filter(Boolean)
                .join(', ')}
              : {t('profit.owned')}
            </Text>
          )}
        </Card>
      )}
    </GameScreen>
  );
}

/** Revenue and total costs against units made: where the lines cross is break-even. */
function BreakEven({ price, unit, fixed, make }: { price: number; unit: number; fixed: number; make: number }) {
  const { t } = useTranslation('business');
  const tx = t as unknown as (key: string, options?: Record<string, unknown>) => string;
  const be = price > unit ? Math.ceil(fixed / (price - unit)) : null;
  const top = Math.max(make, (be ?? make) * 1.6, 10);
  const qs = Array.from({ length: 6 }, (_, k) => Math.round((top * k) / 5));
  return (
    <LineChart
      title={tx('charts.breakEven')}
      labels={qs.map(String)}
      series={[
        { name: tx('charts.revenue'), values: qs.map((q) => q * price), color: '#2F6FD0' },
        { name: tx('charts.costs'), values: qs.map((q) => fixed + q * unit), color: '#16192E', dashed: true },
      ]}
      summary={be ? t('profit.breakEven', { count: be }) : t('profit.noBreakEven')}
    />
  );
}

function HowTo() {
  return <BreakEven price={40} unit={25} fixed={1500} make={120} />;
}

defineGameFrame('profit-quest', {
  HowTo,
  review: (r) => {
    const run = r as ProfitQuestRun;
    return run.steps.flatMap((s, k) => {
      if (s.type === 'week')
        return s.report
          ? [{ key: `w${k}`, correct: s.report.points >= 60, main: `${tr('business:charts.week', { n: k + 1 })} · ${money(s.report.profit)}` }]
          : [];
      if (!s.result) return [];
      const name = s.type === 'analyst' ? tr(`business:analyst.kinds.${s.kind}.name`) : tr('business:profit.calcTitle');
      return [{ key: `c${k}`, correct: s.result.correct, main: name as string, detail: s.result.answer }];
    });
  },
});
