import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import {
  Action,
  Card,
  Eyebrow,
  GameScreen,
  GradeBadge,
  GREEN,
  Header,
  kit,
  Lesson,
  Meter,
  Options,
  RED,
  SplitBar,
  Statement,
  Stepper,
} from '@/components/business/kit';
import { BOLD } from '@/components/lab/hud';
import { Text } from '@/components/ui';
import type { BudgetKey, BudgetMasterRun } from '@/lib/api';
import { BUSINESS_SCENES, money } from '@/lib/games/business';
import type { BusinessGame } from '@/lib/games/use-lab-run';

const NEEDS = '#4C7BF3';
const WANTS = '#F2A93B';
const SAVE = '#1E9E6A';

/**
 * Budget Master: plan a month's pay. Bills come first; then food, wants, the emergency fund, a
 * savings goal and extra debt payments must use every dollar. Then something happens.
 */
export function BudgetMaster({ g, run }: { g: BusinessGame; run: BudgetMasterRun }) {
  const [i, setI] = useState(() => Math.min(run.at, run.income.length - 1));
  const next = () => {
    if (run.status !== 'playing' || run.hearts <= 0 || run.at >= run.income.length) void g.finish();
    else setI(run.at);
  };
  return <Month key={i} g={g} run={run} i={i} onNext={next} />;
}

function Month({ g, run, i, onNext }: { g: BusinessGame; run: BudgetMasterRun; i: number; onNext: () => void }) {
  const { t } = useTranslation('business');
  const tx = t as unknown as (key: string, options?: Record<string, unknown>) => string;
  const event = run.events[i]!;
  const report = event.report;
  const income = run.income[i]!;
  const [plan, setPlan] = useState<Record<BudgetKey, number>>(() => ({
    food: run.foodMin,
    fun: 0,
    clothes: 0,
    emergency: 0,
    goal: 0,
    debt: 0,
  }));
  const [choice, setChoice] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const e = `budget.events.${event.id}`;
  const goalName = tx(`budget.goals.${run.goal.id}`);

  const billTotal = Object.values(run.bills).reduce((a, b) => a + b, 0);
  const planned = run.keys.reduce((s, k) => s + plan[k], 0);
  const left = income - billTotal - planned;

  const submit = async () => {
    if (!choice) return setNote(t('ui.pick'));
    if (left !== 0) return setNote(t('ui.unbalanced'));
    setNote(null);
    const res = await g.answer({ step: i, plan: Object.fromEntries(run.keys.map((k) => [k, plan[k]])), choice });
    if (!res) return;
    if (res.outcome.retry)
      return setNote(
        t(res.outcome.end === 'unbalanced' ? 'ui.unbalanced' : res.outcome.end === 'choose' ? 'ui.pick' : 'ui.invalid'),
      );
    g.buzz(res.outcome.heartLost ? 'error' : 'success');
  };

  const header = (
    <Header
      title={t('budget.month', { n: i + 1, total: run.income.length })}
      subtitle={`${t('budget.income')}: ${money(income)}`}
      stats={[
        { label: t('budget.keys.emergency'), value: money(report?.emergency ?? run.wallet.emergency) },
        { label: goalName, value: `${money(report?.goal ?? run.wallet.goal)} / ${money(run.goal.amount)}` },
        ...(run.debtRate
          ? [{ label: t('budget.keys.debt'), value: money(report?.debt ?? run.wallet.debt), color: '#FFB4C2' }]
          : []),
      ]}
    />
  );

  if (report) {
    const last = run.at >= run.income.length || run.hearts <= 0;
    const check = (ok: boolean, text: string) => (
      <View key={text} style={kit.row}>
        <Ionicons name={ok ? 'checkmark-circle' : 'alert-circle'} size={18} color={ok ? GREEN : RED} />
        <Text style={[kit.body, { flex: 1 }]}>{text}</Text>
      </View>
    );
    return (
      <GameScreen
        scene={BUSINESS_SCENES.budget}
        action={
          <Action
            title={last ? t('ui.finish') : t('ui.next')}
            onPress={onNext}
            icon={last ? 'flag' : 'arrow-forward'}
          />
        }>
        {header}
        <Card>
          <Eyebrow color="#6A4BE0">{t('budget.report', { n: i + 1 })}</Eyebrow>
          {check(report.foodOk, report.foodOk ? t('budget.check.food') : t('budget.check.noFood'))}
          {check(report.savingRate >= 20, t('budget.check.saved', { pct: report.savingRate }))}
          {check(report.wantsRate <= 30, t('budget.check.wants', { pct: report.wantsRate }))}
          {report.card > 0 && check(false, t('budget.check.card', { amount: report.card }))}
          <Statement
            rows={[
              {
                label: t('budget.check.interest', { amount: report.interest }),
                value: money(-report.interest),
                hidden: !report.interest,
                color: RED,
              },
              {
                label: t('budget.check.debt', { amount: report.debt }),
                value: money(report.debt),
                hidden: !run.debtRate,
              },
              { label: t('budget.check.emergency', { amount: report.emergency }), value: money(report.emergency) },
              {
                label: t('budget.check.goal', { amount: report.goal, target: run.goal.amount }),
                value: money(report.goal),
                color: report.goal >= run.goal.amount ? GREEN : undefined,
              },
            ]}
          />
          <Text style={{ fontFamily: BOLD, color: GREEN }}>{t('ui.points', { points: report.points })}</Text>
        </Card>
        <Card>
          <GradeBadge grade={report.grade} />
          <Text style={kit.title}>{tx(`${e}.title`)}</Text>
          <Text style={kit.body}>{tx(`${e}.options.${report.choice}`)}</Text>
          {report.grade !== 'best' && (
            <Text style={[kit.small, { color: GREEN }]}>
              {t('ui.bestWas', { choice: tx(`${e}.options.${report.best[0]}`) })}
            </Text>
          )}
          <Lesson text={tx(`${e}.lesson`)} />
        </Card>
      </GameScreen>
    );
  }

  const needs = billTotal + plan.food;
  const wants = plan.fun + plan.clothes;
  const savings = plan.emergency + plan.goal + plan.debt;
  const share = (n: number) => Math.round((n / income) * 100);
  const hint = (k: BudgetKey) =>
    k === 'food'
      ? t('budget.keyHint.food', { min: run.foodMin })
      : k === 'emergency'
        ? t('budget.keyHint.emergency', { have: run.wallet.emergency, target: run.emergencyTarget })
        : k === 'goal'
          ? t('budget.keyHint.goal', { goal: goalName, have: run.wallet.goal, target: run.goal.amount })
          : k === 'debt'
            ? t('budget.keyHint.debt', { have: run.wallet.debt, rate: Math.round(run.debtRate * 1000) / 10 })
            : tx(`budget.keyHint.${k}`);
  const optionNote = (o: (typeof event.options)[number]) =>
    [
      o.cost ? tx(`budget.costFrom.${o.from ?? 'fun'}`, { amount: o.cost }) : null,
      o.income ? t('budget.gain', { amount: o.income }) : null,
      o.bill ? t('budget.newBill', { amount: o.bill }) : null,
    ]
      .filter(Boolean)
      .join(' · ');

  return (
    <GameScreen
      scene={BUSINESS_SCENES.budget}
      action={
        <Action title={t('budget.run')} onPress={() => void submit()} disabled={g.busy} icon="calendar" note={note} />
      }>
      {header}
      <Card>
        <Eyebrow color="#6A4BE0">{t('budget.event')}</Eyebrow>
        <Text style={kit.title}>{tx(`${e}.title`)}</Text>
        <Text style={kit.body}>{tx(`${e}.body`)}</Text>
        <Options
          options={event.options.map((o) => ({
            id: o.id,
            label: tx(`${e}.options.${o.id}`),
            note: optionNote(o) || undefined,
          }))}
          picked={choice}
          onPick={(id) => {
            setChoice(id);
            setNote(null);
          }}
        />
      </Card>
      <Card>
        <Eyebrow color="#6A4BE0">{t('budget.bills')}</Eyebrow>
        <Statement
          rows={[
            ...Object.entries(run.bills).map(([id, amount]) => ({
              label: tx(`budget.billNames.${id}`),
              value: money(amount),
            })),
            { label: t('budget.afterBills'), value: money(income - billTotal), total: true },
          ]}
        />
      </Card>
      <Card>
        <Eyebrow color="#6A4BE0">{t('budget.plan')}</Eyebrow>
        {run.keys.map((k) => (
          <Stepper
            key={k}
            label={t(`budget.keys.${k}`)}
            hint={hint(k)}
            warn={k === 'food' && plan.food < run.foodMin}
            value={plan[k]}
            onChange={(v) => setPlan((p) => ({ ...p, [k]: v }))}
            step={10}
            big={100}
            format={money}
          />
        ))}
        <View style={{ gap: 6 }}>
          <SplitBar
            parts={[
              { share: needs, color: NEEDS },
              { share: wants, color: WANTS },
              { share: savings, color: SAVE },
            ]}
          />
          <Text style={kit.small}>
            {t('budget.rule', { needs: share(needs), wants: share(wants), savings: share(savings) })}
          </Text>
          <Text style={kit.small}>{t('budget.ruleHint')}</Text>
        </View>
        <View style={kit.row}>
          <Text style={{ flex: 1, fontFamily: BOLD, color: left === 0 ? GREEN : RED }}>
            {left >= 0 ? t('ui.left', { amount: left }) : t('ui.over', { amount: -left })}
          </Text>
          {left > 0 && (
            <Pressable
              onPress={() => setPlan((p) => ({ ...p, goal: p.goal + left }))}
              accessibilityRole="button"
              style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#E3F6EC' }}>
              <Text style={{ color: GREEN, fontFamily: BOLD, fontSize: 12 }}>{t('budget.restToGoal')}</Text>
            </Pressable>
          )}
        </View>
        <Meter value={planned + billTotal} max={income} color={left === 0 ? GREEN : left < 0 ? RED : '#7C5CFF'} />
      </Card>
    </GameScreen>
  );
}
