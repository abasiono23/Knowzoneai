import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  Action,
  Card,
  Eyebrow,
  GameScreen,
  GradeBadge,
  Header,
  INK,
  kit,
  Lesson,
  Options,
  RED,
  GREEN,
  Statement,
  Stepper,
} from '@/components/business/kit';
import { BOLD } from '@/components/lab/hud';
import { Text } from '@/components/ui';
import { Colors } from '@/constants/theme';
import type { StaffRole, StartupTycoonRun } from '@/lib/api';
import { BUSINESS_SCENES, money } from '@/lib/games/business';
import type { BusinessGame } from '@/lib/games/use-lab-run';

const ROLES: StaffRole[] = ['maker', 'seller', 'support'];
const MARKETING = [0, 300, 600, 1200];

/**
 * Startup Tycoon: run a company month by month. Each month: a management decision, your team and
 * marketing; the server runs the month and sends back a profit and loss statement.
 */
export function StartupTycoon({ g, run }: { g: BusinessGame; run: StartupTycoonRun }) {
  const [i, setI] = useState(() => Math.min(run.at, run.months - 1));
  const next = () => {
    if (run.status !== 'playing' || run.hearts <= 0 || run.at >= run.months || run.firm.bankrupt) void g.finish();
    else setI(run.at);
  };
  return <Month key={i} g={g} run={run} i={i} onNext={next} />;
}

function Month({ g, run, i, onNext }: { g: BusinessGame; run: StartupTycoonRun; i: number; onNext: () => void }) {
  const { t } = useTranslation('business');
  const tx = t as unknown as (key: string, options?: Record<string, unknown>) => string;
  const dilemma = run.dilemmas[i]!;
  const report = dilemma.report;
  const firm = run.firm;
  const [staff, setStaff] = useState<Record<StaffRole, number>>(() => ({ ...firm.staff }));
  const [marketing, setMarketing] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const d = `startup.dilemmas.${dilemma.id}`;

  const payroll = ROLES.reduce((s, r) => s + staff[r] * run.salary[r], 0);
  const hiring = ROLES.reduce((s, r) => s + Math.max(0, staff[r] - firm.staff[r]) * run.salary[r] * 0.3, 0);

  const submit = async () => {
    if (!choice) return setNote(t('ui.pick'));
    setNote(null);
    const res = await g.answer({ step: i, plan: { ...staff, marketing }, choice });
    if (!res) return;
    if (res.outcome.retry) return setNote(t(res.outcome.end === 'choose' ? 'ui.pick' : 'ui.invalid'));
    g.buzz(res.outcome.heartLost ? 'error' : 'success');
  };

  const header = (
    <Header
      title={tx(`startup.companies.${run.company}`)}
      subtitle={`${t('startup.month', { n: i + 1, total: run.months })} · ${t('startup.goal', { goal: money(run.goal).slice(1) })}`}
      stats={[
        { label: t('startup.value'), value: money(firm.value), color: firm.value >= run.goal ? '#7CF0B8' : '#fff' },
        { label: t('startup.cash'), value: money(firm.cash), color: firm.cash < 0 ? '#FF8FA6' : '#fff' },
        { label: t('startup.morale'), value: `${firm.morale}%` },
        { label: t('startup.rep'), value: `${firm.rep}%` },
      ]}
    />
  );

  if (report) {
    const turnedAway = report.demand - report.capacity;
    const ops =
      report.overload > 0
        ? t('startup.ops.overload')
        : turnedAway > report.demand * 0.05
          ? t('startup.ops.turnedAway', { count: turnedAway })
          : report.capacity > report.demand * 1.2
            ? t('startup.ops.idle')
            : t('startup.ops.balanced');
    const last = run.at >= run.months || run.firm.bankrupt || run.hearts <= 0;
    return (
      <GameScreen
        scene={BUSINESS_SCENES.startup}
        action={
          <Action
            title={last ? t('ui.finish') : t('ui.next')}
            onPress={onNext}
            icon={last ? 'flag' : 'arrow-forward'}
          />
        }>
        {header}
        <Card>
          <Eyebrow color="#6A4BE0">{t('startup.report', { n: i + 1 })}</Eyebrow>
          <Text style={kit.body}>
            {t('startup.ops.line', { demand: report.demand, capacity: report.capacity, sold: report.sold })}
          </Text>
          {report.order > 0 && <Text style={kit.small}>{t('startup.ops.order', { count: report.order })}</Text>}
          <Text style={[kit.small, { color: report.overload > 0 || turnedAway > 0 ? RED : '#5B6390' }]}>{ops}</Text>
          {report.demand > report.market * 0.75 && <Text style={kit.small}>{t('startup.ops.saturated')}</Text>}
          <Statement
            rows={[
              { label: t('startup.statement.revenue'), value: money(report.revenue) },
              { label: t('startup.statement.cogs'), value: money(-report.cogs) },
              { label: t('startup.statement.gross', { pct: report.margin }), value: money(report.gross), total: true },
              { label: t('startup.statement.payroll'), value: money(-report.payroll) },
              { label: t('startup.statement.rent'), value: money(-report.rent) },
              { label: t('startup.statement.marketing'), value: money(-report.marketing), hidden: !report.marketing },
              { label: t('startup.statement.other'), value: money(-report.other), hidden: !report.other },
              { label: t('startup.statement.loan'), value: money(-report.loan), hidden: !report.loan },
              {
                label: t('startup.statement.net'),
                value: money(report.net),
                total: true,
                color: report.net >= 0 ? GREEN : RED,
              },
              { label: t('startup.statement.cash'), value: money(report.cash) },
            ]}
          />
          {report.runway !== null && (
            <Text style={[kit.small, { color: RED }]}>{t('startup.statement.runway', { count: report.runway })}</Text>
          )}
        </Card>
        <Card>
          <GradeBadge grade={report.grade} />
          <Text style={kit.title}>{tx(`${d}.title`)}</Text>
          <Text style={kit.body}>{tx(`${d}.options.${report.choice}`)}</Text>
          {report.grade !== 'best' && (
            <Text style={[kit.small, { color: GREEN }]}>
              {t('ui.bestWas', { choice: tx(`${d}.options.${report.best[0]}`) })}
            </Text>
          )}
          <Lesson text={tx(`${d}.lesson`)} />
        </Card>
        {run.firm.bankrupt && (
          <Card>
            <Text style={[kit.body, { color: RED, fontFamily: BOLD }]}>{t('startup.bankrupt')}</Text>
          </Card>
        )}
      </GameScreen>
    );
  }

  return (
    <GameScreen
      scene={BUSINESS_SCENES.startup}
      action={
        <Action title={t('startup.run')} onPress={() => void submit()} disabled={g.busy} icon="play" note={note} />
      }>
      {header}
      <Card>
        <Eyebrow color="#6A4BE0">{t('startup.decision')}</Eyebrow>
        <Text style={kit.title}>{tx(`${d}.title`)}</Text>
        <Text style={kit.body}>{tx(`${d}.body`)}</Text>
        <Options
          options={dilemma.options.map((o) => ({ id: o, label: tx(`${d}.options.${o}`) }))}
          picked={choice}
          onPick={(id) => {
            setChoice(id);
            setNote(null);
          }}
        />
      </Card>
      <Card>
        <Eyebrow color="#6A4BE0">{t('startup.team')}</Eyebrow>
        {ROLES.map((r) => (
          <View key={r} style={{ gap: 2 }}>
            <Stepper
              label={t(`startup.roles.${r}`)}
              hint={`${tx(`startup.roleHint.${r}`, {
                n: r === 'maker' ? run.perMaker : run.perSeller,
                sale: tx(`startup.sale.${run.company}`),
              })} · ${t('startup.salary', { amount: run.salary[r].toLocaleString('en-US') })}`}
              value={staff[r]}
              onChange={(v) => setStaff((s) => ({ ...s, [r]: v }))}
              step={1}
              min={Math.max(0, firm.staff[r] - 2)}
              max={Math.min(8, firm.staff[r] + 2)}
            />
          </View>
        ))}
        <Text style={kit.small}>{t('startup.payroll', { amount: payroll.toLocaleString('en-US') })}</Text>
        {hiring > 0 && (
          <Text style={kit.small}>{t('startup.hireCost', { amount: Math.round(hiring).toLocaleString('en-US') })}</Text>
        )}
      </Card>
      <Card>
        <Eyebrow color="#6A4BE0">{t('startup.marketing')}</Eyebrow>
        <View style={styles.segments}>
          {MARKETING.map((m) => (
            <Pressable
              key={m}
              onPress={() => setMarketing(m)}
              accessibilityRole="radio"
              accessibilityState={{ checked: marketing === m }}
              style={[styles.segment, marketing === m && styles.segmentOn]}>
              <Text style={{ fontFamily: BOLD, color: marketing === m ? '#fff' : INK }}>
                {m ? money(m) : t('startup.none')}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  segments: { flexDirection: 'row', gap: 6 },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E3DDF2',
    backgroundColor: '#fff',
  },
  segmentOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
});
