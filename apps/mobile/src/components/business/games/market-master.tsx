import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Action,
  AnalystDesk,
  atDesk,
  BarList,
  DemandChart,
  Card,
  Eyebrow,
  GameScreen,
  GREEN,
  Header,
  kit,
  Lesson,
  RED,
  Statement,
  Stepper,
} from '@/components/business/kit';
import { BOLD } from '@/components/lab/hud';
import { Text } from '@/components/ui';
import type { MarketMasterRun } from '@/lib/api';
import { money } from '@/lib/games/business';
import type { BusinessGame } from '@/lib/games/use-lab-run';
import { defineGameFrame } from '@/components/lab/contract';
import { t as i18nT } from 'i18next';

import { deskReview } from '../review';

/** Translation outside React (review lists for the results screen). */
const tr = i18nT as unknown as (key: string, options?: Record<string, unknown>) => string;

/**
 * Market Master: run a market stall day by day. Set a price and buy stock; the server works out how
 * many customers came at that price, what sold, what was wasted, and the best you could have done.
 */
export function MarketMaster({ g, run, paused }: { g: BusinessGame; run: MarketMasterRun; paused?: boolean }) {
  const [i, setI] = useState(() => Math.min(run.at, run.days.length - 1));
  const [desk, setDesk] = useState(() => atDesk(run));
  const next = () => {
    if (run.status !== 'playing' || run.hearts <= 0) void g.finish();
    else if (run.at >= run.days.length) {
      if (run.analyst?.length) setDesk(true);
      else void g.finish();
    } else setI(run.at);
  };
  if (desk) return <AnalystDesk g={g} run={run} paused={paused} />;
  return <Day key={i} g={g} run={run} i={i} onNext={next} />;
}

function Day({ g, run, i, onNext }: { g: BusinessGame; run: MarketMasterRun; i: number; onNext: () => void }) {
  const { t } = useTranslation('business');
  const tx = t as unknown as (key: string, options?: Record<string, unknown>) => string;
  const day = run.days[i]!;
  const report = day.report;
  const yesterday = i > 0 ? run.days[i - 1]!.report : undefined;
  const [price, setPrice] = useState(() => yesterday?.price ?? Math.round((run.maxPrice * 0.5) / 0.25) * 0.25);
  const [stock, setStock] = useState(() => yesterday?.stock ?? 50);
  const [note, setNote] = useState<string | null>(null);
  const product = tx(`market.products.${run.product}`);

  const submit = async () => {
    setNote(null);
    const res = await g.answer({ step: i, plan: { price, stock } });
    if (!res) return;
    if (res.outcome.retry) return setNote(t('ui.invalid'));
    g.buzz(res.outcome.heartLost ? 'error' : 'success');
  };

  const header = (
    <Header
      title={`${product} · ${t('market.day', { n: i + 1, total: run.days.length })}`}
      subtitle={t('market.costEach', { cost: day.cost.toFixed(2) })}
      stats={[
        { label: t('market.price'), value: money(report?.price ?? price) },
        ...(run.days.some((d) => d.report)
          ? [{ label: tx('charts.profit'), value: money(run.days.reduce((s, d) => s + (d.report?.profit ?? 0), 0)) }]
          : []),
      ]}
    />
  );
  const dayCard = (
    <Card>
      <Text style={kit.title}>{tx(`market.days.${day.id}.title`)}</Text>
      <Text style={kit.body}>{tx(`market.days.${day.id}.body`)}</Text>
      <Text style={kit.small}>{t('market.fee', { fee: run.fee })}</Text>
      {day.rival !== null && (
        <Text style={[kit.small, { color: RED }]}>{t('market.rival', { price: day.rival.toFixed(2) })}</Text>
      )}
    </Card>
  );

  if (report) {
    const last = (run.at >= run.days.length && !run.analyst?.length) || run.hearts <= 0;
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
        {dayCard}
        <Card>
          <Eyebrow>{t('market.report', { n: i + 1 })}</Eyebrow>
          <BarList
            title={tx('charts.customers')}
            format={(n) => String(Math.round(n))}
            rows={[
              { label: tx('charts.demand'), value: report.wanted },
              { label: t('market.stock'), value: report.stock },
              { label: tx('charts.units'), value: report.sold, strong: true },
            ]}
          />
          <Text style={kit.body}>{t('market.line.wanted', { count: report.wanted })}</Text>
          <Text style={kit.body}>{t('market.line.sold', { count: report.sold })}</Text>
          {report.wasted > 0 && (
            <Text style={[kit.small, { color: RED }]}>{t('market.line.wasted', { count: report.wasted })}</Text>
          )}
          {report.missed > 0 && (
            <Text style={[kit.small, { color: RED }]}>{t('market.line.missed', { count: report.missed })}</Text>
          )}
          <Statement
            rows={[
              { label: t('market.line.revenue'), value: money(report.revenue) },
              { label: t('market.line.stock'), value: money(-report.stockCost) },
              { label: t('market.line.fee'), value: money(-report.fee) },
              {
                label: t('market.line.profit'),
                value: money(report.profit),
                total: true,
                color: report.profit >= 0 ? GREEN : RED,
              },
            ]}
          />
          <Text style={kit.small}>
            {t('market.line.best', {
              price: report.bestPrice.toFixed(2),
              count: report.bestStock,
              profit: report.bestProfit.toFixed(2),
            })}
          </Text>
          <Text style={{ fontFamily: BOLD, color: GREEN }}>{t('ui.points', { points: report.points })}</Text>
          <Lesson text={tx(`market.ideas.${report.idea}`)} />
        </Card>
      </GameScreen>
    );
  }

  return (
    <GameScreen
      action={
        <Action
          title={t('market.open')}
          onPress={() => void submit()}
          disabled={g.busy || stock <= 0}
          icon="storefront"
          note={note}
        />
      }>
      {header}
      {dayCard}
      <Card>
        <Eyebrow>{t('market.research')}</Eyebrow>
        {day.research ? (
          <>
            <DemandChart
              title={tx('charts.demand')}
              points={day.research}
              price={price}
              maxPrice={run.maxPrice}
              summary={day.research.map((r) => t('market.researchRow', { price: r.price.toFixed(2), count: r.customers })).join(', ')}
            />
            {day.research.map((r) => (
              <Text key={r.price} style={kit.small}>
                {t('market.researchRow', { price: r.price.toFixed(2), count: r.customers })}
              </Text>
            ))}
          </>
        ) : (
          <Text style={kit.small}>{t('market.noResearch')}</Text>
        )}
        {yesterday && (
          <Text style={kit.small}>
            {t('market.yesterday', { price: yesterday.price.toFixed(2), wanted: yesterday.wanted })}
          </Text>
        )}
      </Card>
      <Card>
        <Stepper
          label={t('market.price')}
          value={price}
          onChange={setPrice}
          step={0.25}
          big={1}
          min={0.25}
          max={run.maxPrice}
          format={(v) => money(v)}
        />
        <Stepper label={t('market.stock')} value={stock} onChange={setStock} step={5} big={25} min={0} max={600} />
        <Text style={kit.small}>
          {t('market.preview', {
            revenue: (price * stock).toFixed(2),
            profit: (price * stock - day.cost * stock - run.fee).toFixed(2),
          })}
        </Text>
      </Card>
    </GameScreen>
  );
}

/** The how-to-play example: research points and a price on the demand line. */
function HowTo() {
  const { t } = useTranslation('business');
  return (
    <DemandChart
      title={(t as unknown as (k: string) => string)('charts.demand')}
      points={[
        { price: 1, customers: 90 },
        { price: 2, customers: 60 },
        { price: 3, customers: 30 },
      ]}
      price={1.5}
      maxPrice={4}
      summary="$1: 90, $2: 60, $3: 30"
    />
  );
}

defineGameFrame('market-master', {
  HowTo,
  review: (r) => {
    const run = r as MarketMasterRun;
    return [
      ...run.days.flatMap((d, k) =>
        d.report
          ? [
              {
                key: `d${k}`,
                correct: d.report.points >= 60,
                main: `${tr('business:market.day', { n: k + 1, total: run.days.length })} · ${money(d.report.profit)}`,
                detail: tr('business:market.line.best', {
                  price: d.report.bestPrice.toFixed(2),
                  count: d.report.bestStock,
                  profit: d.report.bestProfit.toFixed(2),
                }),
              },
            ]
          : [],
      ),
      ...deskReview(run),
    ];
  },
});
