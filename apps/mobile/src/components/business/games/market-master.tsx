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
  RED,
  Statement,
  Stepper,
} from '@/components/business/kit';
import { BOLD } from '@/components/lab/hud';
import { Text } from '@/components/ui';
import type { MarketMasterRun } from '@/lib/api';
import { BUSINESS_SCENES, money } from '@/lib/games/business';
import type { BusinessGame } from '@/lib/games/use-lab-run';

/**
 * Market Master: run a market stall day by day. Set a price and buy stock; the server works out how
 * many customers came at that price, what sold, what was wasted, and the best you could have done.
 */
export function MarketMaster({ g, run }: { g: BusinessGame; run: MarketMasterRun }) {
  const [i, setI] = useState(() => Math.min(run.at, run.days.length - 1));
  const next = () => {
    if (run.status !== 'playing' || run.hearts <= 0 || run.at >= run.days.length) void g.finish();
    else setI(run.at);
  };
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
      stats={[]}
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
    const last = run.at >= run.days.length || run.hearts <= 0;
    return (
      <GameScreen
        scene={BUSINESS_SCENES.market}
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
          <Eyebrow color="#6A4BE0">{t('market.report', { n: i + 1 })}</Eyebrow>
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
      scene={BUSINESS_SCENES.market}
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
        <Eyebrow color="#6A4BE0">{t('market.research')}</Eyebrow>
        {day.research ? (
          day.research.map((r) => (
            <Text key={r.price} style={kit.body}>
              {t('market.researchRow', { price: r.price.toFixed(2), count: r.customers })}
            </Text>
          ))
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
