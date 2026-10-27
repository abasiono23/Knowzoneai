import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Action,
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
import { BUSINESS_SCENES, money } from '@/lib/games/business';
import type { BusinessGame } from '@/lib/games/use-lab-run';

/** Answers that are counts of units, a percent, or money. */
const COUNTS: CalcKind[] = ['breakeven', 'machine'];

/**
 * Profit Quest: business maths challenges (contribution, break-even, profit, margin) alternate with
 * factory weeks where you set the price, how many to make and whether to invest.
 */
export function ProfitQuest({ g, run }: { g: BusinessGame; run: ProfitQuestRun }) {
  const [i, setI] = useState(() => Math.min(run.at, run.steps.length - 1));
  const next = () => {
    if (run.status !== 'playing' || run.hearts <= 0 || run.at >= run.steps.length) void g.finish();
    else setI(run.at);
  };
  return run.steps[i]!.type === 'calc' ? (
    <Calc key={i} g={g} run={run} i={i} onNext={next} />
  ) : (
    <Week key={i} g={g} run={run} i={i} onNext={next} />
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

function Calc({ g, run, i, onNext }: { g: BusinessGame; run: ProfitQuestRun; i: number; onNext: () => void }) {
  const { t } = useTranslation('business');
  const tx = t as unknown as (key: string, options?: Record<string, unknown>) => string;
  const step = run.steps[i] as Extract<ProfitQuestRun['steps'][number], { type: 'calc' }>;
  const { product, header } = useHeader(run, i);
  const [picked, setPicked] = useState<string | null>(null);
  const result = step.result;
  const show = (v: string) =>
    COUNTS.includes(step.calc)
      ? Number(v).toLocaleString('en-US')
      : step.calc === 'margin'
        ? t('profit.percent', { n: v })
        : money(Number(v));
  const nums = Object.fromEntries(
    Object.entries(step.nums).map(([k, v]) => [k, k === 'units' ? v.toLocaleString('en-US') : money(v).slice(1)]),
  );

  const submit = async () => {
    if (!picked) return;
    const res = await g.answer({ step: i, choice: picked });
    if (res) g.buzz(res.outcome.correct ? 'success' : 'error');
  };
  const last = run.at >= run.steps.length || run.hearts <= 0;

  return (
    <GameScreen
      scene={BUSINESS_SCENES.factory}
      action={
        result ? (
          <Action
            title={last ? t('ui.finish') : t('ui.next')}
            onPress={onNext}
            icon={last ? 'flag' : 'arrow-forward'}
          />
        ) : (
          <Action title={t('ui.next')} onPress={() => void submit()} disabled={!picked || g.busy} icon="checkmark" />
        )
      }>
      {header}
      <Card>
        <Eyebrow color="#6A4BE0">{t('profit.calcTitle')}</Eyebrow>
        <Text style={kit.body}>{tx(`profit.calc.${step.calc}`, { ...nums, product })}</Text>
        <Options
          options={step.options.map((o) => ({ id: o, label: show(o) }))}
          picked={result?.choice ?? picked}
          onPick={setPicked}
          disabled={!!result}
          marks={
            result
              ? {
                  [result.answer]: 'right',
                  ...(result.choice && result.choice !== result.answer && { [result.choice]: 'wrong' }),
                }
              : undefined
          }
        />
        {result && (
          <>
            <Text style={{ fontFamily: BOLD, color: result.correct ? GREEN : RED }}>
              {result.correct
                ? t('profit.right', { points: result.points })
                : t('profit.wrong', { answer: show(result.answer) })}
            </Text>
            <Lesson text={tx(`profit.formula.${step.calc}`)} />
          </>
        )}
      </Card>
    </GameScreen>
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
        scene={BUSINESS_SCENES.factory}
        action={
          <Action
            title={last ? t('ui.finish') : t('ui.next')}
            onPress={onNext}
            icon={last ? 'flag' : 'arrow-forward'}
          />
        }>
        {header}
        <Card>
          <Eyebrow color="#6A4BE0">{t('profit.report')}</Eyebrow>
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
      scene={BUSINESS_SCENES.factory}
      action={
        <Action title={t('profit.run')} onPress={() => void submit()} disabled={g.busy} icon="play" note={note} />
      }>
      {header}
      <Card>
        <Eyebrow color="#6A4BE0">{t('profit.week')}</Eyebrow>
        <Text style={kit.small}>
          {t('profit.numbers', {
            unit: money(plant.unit).slice(1),
            fixed: plant.fixed.toLocaleString('en-US'),
            stock: plant.inventory,
          })}
        </Text>
        <Eyebrow color="#6A4BE0">{t('profit.research')}</Eyebrow>
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
      {run.upgrades && (
        <Card>
          <Eyebrow color="#6A4BE0">{t('profit.upgrades')}</Eyebrow>
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
