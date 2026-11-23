import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { G, Line, Path, Polyline, Rect, Text as SvgText } from 'react-native-svg';

import { Feedback, FONT, PrimaryButton, SecondaryButton, W } from '@/components/games/ui';
import { defineGameFrame } from '@/components/lab/contract';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { EngineId, GameOutcome, RocketBuilderRun, RocketDesign, RocketStage, TankId } from '@/lib/api';
import { num } from '@/lib/games/space';
import type { SpaceGame } from '@/lib/games/use-lab-run';

import { Card, D, Eyebrow, LTR, ltr, MONO, QuizStep, Sheet, StepBar } from '../kit';

type Parts = RocketBuilderRun['parts'];
type Mission = RocketBuilderRun['missions'][number];

/** The same numbers the server works out (data/space/rockets.ts), for the live readouts. */
function stats(parts: Parts, m: Mission, d: RocketDesign) {
  const stage = (s: RocketStage) => {
    const e = parts.engines[s.engine]!;
    return {
      dry: e.mass + s.tanks.reduce((n, t) => n + parts.tanks[t]!.dry, 0),
      fuel: s.tanks.reduce((n, t) => n + parts.tanks[t]!.fuel, 0),
      cost: e.cost + s.tanks.reduce((n, t) => n + parts.tanks[t]!.cost, 0),
      isp: e.isp,
      thrust: e.thrust,
    };
  };
  const lo = stage(d);
  const up = d.upper ? stage(d.upper) : null;
  const top = m.payload.mass + parts.fins.mass + (up ? up.dry + up.fuel : 0);
  const mass = top + lo.dry + lo.fuel;
  const dvOf = (isp: number, full: number, empty: number) =>
    full > empty ? isp * parts.g * Math.log(full / empty) : 0;
  const lowerDv = dvOf(lo.isp, mass, top + lo.dry);
  const upFull = up ? m.payload.mass + parts.fins.mass + up.dry + up.fuel : 0;
  const upperDv = up ? dvOf(up.isp, upFull, upFull - up.fuel) : 0;
  return {
    mass,
    twr: lo.thrust / (mass * parts.g),
    upperTwr: up ? up.thrust / (upFull * parts.g) : null,
    dv: lowerDv + upperDv,
    lowerDv,
    upperDv,
    cost: lo.cost + parts.fins.cost + (up?.cost ?? 0),
  };
}

/**
 * Rocket Builder: an engineering bench. Choose an engine and fuel tanks (and, from level 7, an upper
 * stage) and watch the readouts: lift-off thrust-to-weight, Δv from the rocket equation against the
 * mission's need, and cost against the budget. Launch is checked on the server; then a question about
 * your own rocket's numbers.
 */
export function RocketWorkshop({ g, run }: { g: SpaceGame; run: RocketBuilderRun }) {
  const { t } = useTranslation('space');
  const parts = run.parts;
  const total = run.missions.length;
  const [k, setK] = useState(() => Math.min(Math.floor(run.at / 2), total - 1));
  const m = run.missions[k]!;
  const engines = Object.keys(parts.engines) as EngineId[];
  const tanks = Object.keys(parts.tanks) as TankId[];
  const [lower, setLower] = useState<RocketStage>({
    engine: engines.includes('nova') ? 'nova' : engines[0]!,
    tanks: [],
  });
  const [upper, setUpper] = useState<RocketStage | null>(null);
  const [which, setWhich] = useState<'lower' | 'upper'>('lower');
  const [fail, setFail] = useState<GameOutcome | null>(null);
  const [flown, setFlown] = useState<GameOutcome | null>(null);

  const design: RocketDesign = { ...lower, ...(upper && { upper }) };
  const s = stats(parts, m, design);
  const minTwr = m.twr ?? 1;
  const upperMin = parts.upperTwr ?? 0.5;
  const built = m.design && m.stats;
  const step = built ? 2 * k + 1 : 2 * k;

  const editing = which === 'upper' && upper ? upper : lower;
  const setEditing = (st: RocketStage) => (which === 'upper' && upper ? setUpper(st) : setLower(st));
  const maxTanks = which === 'upper' ? (parts.maxUpperTanks ?? 3) : parts.maxTanks;
  const count = (id: TankId) => editing.tanks.filter((x) => x === id).length;
  const addTank = (id: TankId) =>
    editing.tanks.length < maxTanks && setEditing({ ...editing, tanks: [...editing.tanks, id] });
  const removeTank = (id: TankId) => {
    const at = editing.tanks.lastIndexOf(id);
    if (at >= 0) setEditing({ ...editing, tanks: editing.tanks.filter((_, n) => n !== at) });
  };

  const launch = async () => {
    setFail(null);
    const res = await g.answer({ step, engine: lower.engine, tanks: lower.tanks, ...(upper && { upper }) });
    if (!res) return;
    g.buzz(res.outcome.correct ? 'success' : 'error');
    if (res.outcome.correct) setFlown(res.outcome);
    else setFail(res.outcome);
  };
  const nextMission = () => {
    if (run.status !== 'playing' || run.at >= total * 2 || run.hearts <= 0) return void g.finish();
    setK(Math.floor(run.at / 2));
    setLower({ engine: lower.engine, tanks: [] });
    setUpper(null);
    setWhich('lower');
    setFail(null);
    setFlown(null);
  };

  const checks: { ok: boolean; label: string; value: string }[] = [
    { ok: s.twr >= minTwr && s.twr > 1, label: t('play.rocket.twr'), value: `${s.twr.toFixed(2)} ≥ ${minTwr}` },
    ...(s.upperTwr !== null
      ? [
          {
            ok: s.upperTwr >= upperMin,
            label: t('play.rocket.upperTwr'),
            value: `${s.upperTwr.toFixed(2)} ≥ ${upperMin}`,
          },
        ]
      : []),
    { ok: s.dv >= m.dv, label: t('rocket.readouts.dv'), value: `${num(s.dv)} / ${num(m.dv)} m/s` },
    { ok: s.cost <= m.budget, label: t('rocket.readouts.cost'), value: `${s.cost} / ${m.budget}` },
  ];

  return (
    <Sheet>
      <StepBar label={t('rocket.objective', { n: k + 1, total, title: m.title })} n={k + 1} total={total} />
      <Card>
        <Eyebrow text={t('play.rocket.brief')} />
        <View style={styles.brief}>
          <Brief label={t('play.rocket.target')} value={m.target} />
          <Brief label={t('play.rocket.payload')} value={`${num(m.payload.mass)} kg`} />
          <Brief label={t('play.rocket.needDv')} value={`${num(m.dv)} m/s`} />
          <Brief label={t('play.rocket.minTwr')} value={String(minTwr)} />
          <Brief label={t('play.rocket.budget')} value={String(m.budget)} />
        </View>
      </Card>

      {built ? (
        <>
          <Card style={{ alignItems: 'center' }}>
            <Ascent dv={m.stats!.dv} need={m.dv} />
            <Feedback
              tone="good"
              title={t('rocket.success', { target: m.target })}
              detail={`Δv ${num(m.stats!.dv)} m/s · TWR ${(m.stats!.twr ?? m.stats!.thrust / m.stats!.weight).toFixed(2)}`}
            />
          </Card>
          {m.question && (
            <QuizStep
              stepKey={`q${k}`}
              q={m.question.q}
              options={m.question.options}
              mono
              onAnswer={async (choice) => {
                const res = await g.answer(choice === null ? { step, timeout: true } : { step, choice });
                if (!res) return null;
                g.buzz(res.outcome.correct ? 'success' : 'error');
                return res.outcome;
              }}
              nextLabel={k + 1 >= total ? t('play.finish') : t('rocket.nextMission')}
              onNext={nextMission}
            />
          )}
        </>
      ) : (
        <>
          <View style={[styles.bench, LTR]} {...ltr}>
            <Card style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }}>
              <Schematic parts={parts} design={design} payload={m.payload.kind} />
            </Card>
            <View style={{ flex: 1, gap: 8 }}>
              {checks.map((c) => (
                <View
                  key={c.label}
                  style={[styles.check, { borderColor: c.ok ? W.correct : W.line }]}
                  accessible
                  accessibilityLabel={`${c.label}: ${c.value}. ${c.ok ? t('play.rocket.ok') : t('play.rocket.notYet')}`}>
                  <Ionicons
                    name={c.ok ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={c.ok ? W.correct : W.muted}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.checkLabel}>{c.label}</Text>
                    <Text style={styles.checkValue}>{c.value}</Text>
                  </View>
                </View>
              ))}
              <Text style={styles.small}>{t('play.rocket.mass', { mass: num(s.mass) })}</Text>
            </View>
          </View>

          {parts.staging && (
            <View style={styles.tabs} accessibilityRole="tablist">
              {(['lower', 'upper'] as const).map((st) => (
                <Pressable
                  key={st}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: which === st }}
                  onPress={() => {
                    if (st === 'upper' && !upper)
                      setUpper({ engine: engines.includes('vega') ? 'vega' : engines[0]!, tanks: [] });
                    setWhich(st);
                  }}
                  style={[styles.tab, which === st && styles.tabOn]}>
                  <Text style={[styles.tabText, which === st && { color: '#fff' }]}>
                    {st === 'lower'
                      ? t('play.rocket.lower')
                      : upper
                        ? t('play.rocket.upper')
                        : t('play.rocket.addUpper')}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <Card>
            <Eyebrow text={t('rocket.engines')} />
            {engines.map((id) => {
              const e = parts.engines[id]!;
              const on = editing.engine === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => setEditing({ ...editing, engine: id })}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  style={[styles.part, on && styles.partOn]}>
                  <Ionicons
                    name={on ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={on ? W.focus : W.muted}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.partName}>
                      {e.name}
                      {e.vacuum ? ` · ${t('play.rocket.vacuum')}` : ''}
                    </Text>
                    <Text
                      style={
                        styles.partSpec
                      }>{`${num(e.thrust / 1000)} kN · Isp ${e.isp} s · ${num(e.mass)} kg · ${t('play.rocket.cost', { cost: e.cost })}`}</Text>
                  </View>
                </Pressable>
              );
            })}
          </Card>
          <Card>
            <Eyebrow text={`${t('rocket.tanks')} · ${editing.tanks.length}/${maxTanks}`} />
            {tanks.map((id) => {
              const tk = parts.tanks[id]!;
              return (
                <View key={id} style={styles.part}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.partName}>{tk.name}</Text>
                    <Text
                      style={
                        styles.partSpec
                      }>{`${num(tk.fuel)} kg ${t('play.rocket.fuel')} · ${num(tk.dry)} kg ${t('play.rocket.empty')} · ${t('play.rocket.cost', { cost: tk.cost })}`}</Text>
                  </View>
                  <Pressable
                    onPress={() => removeTank(id)}
                    accessibilityRole="button"
                    accessibilityLabel={t('rocket.removeTank', { name: tk.name })}
                    style={styles.stepper}>
                    <Ionicons name="remove" size={18} color={W.ink} />
                  </Pressable>
                  <Text style={styles.count}>{count(id)}</Text>
                  <Pressable
                    onPress={() => addTank(id)}
                    disabled={editing.tanks.length >= maxTanks}
                    accessibilityRole="button"
                    accessibilityLabel={t('rocket.addTank', { name: tk.name })}
                    style={[styles.stepper, editing.tanks.length >= maxTanks && { opacity: 0.35 }]}>
                    <Ionicons name="add" size={18} color={W.ink} />
                  </Pressable>
                </View>
              );
            })}
            {which === 'upper' && upper && (
              <SecondaryButton
                title={t('play.rocket.removeUpper')}
                onPress={() => {
                  setUpper(null);
                  setWhich('lower');
                }}
              />
            )}
          </Card>
          {fail && (
            <Feedback tone="bad" title={t(`play.rocket.problems.${(fail.problem as string) ?? 'invalid'}` as never)} />
          )}
          <PrimaryButton
            title={t('rocket.launch')}
            icon="rocket-outline"
            busy={g.busy}
            disabled={!lower.tanks.length || (!!upper && !upper.tanks.length)}
            onPress={() => void launch()}
          />
        </>
      )}
      {flown && !m.question && <PrimaryButton title={t('rocket.nextMission')} onPress={nextMission} />}
    </Sheet>
  );
}

function Brief({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ minWidth: '30%', flexGrow: 1 }}>
      <Text style={styles.small}>{label}</Text>
      <Text style={{ fontFamily: MONO, fontSize: 15, color: W.ink }}>{value}</Text>
    </View>
  );
}

/** A side-on schematic of the stack: fairing or capsule, upper stage, tanks, engine bell. */
function Schematic({ parts, design, payload }: { parts: Parts; design: RocketDesign; payload: 'nose' | 'capsule' }) {
  const w = 34;
  const x0 = 40;
  const tankH = (id: TankId) => ({ small: 14, medium: 22, large: 34, xl: 52 })[id];
  const blocks: { y: number; h: number; kind: string; id?: string }[] = [];
  let y = 8;
  blocks.push({ y, h: 26, kind: payload });
  y += 26;
  const stage = (s: RocketStage, upper: boolean) => {
    for (const id of s.tanks) {
      blocks.push({ y, h: tankH(id), kind: upper ? 'utank' : 'tank', id });
      y += tankH(id);
    }
    blocks.push({ y, h: 16, kind: parts.engines[s.engine]?.vacuum ? 'vbell' : 'bell', id: s.engine });
    y += 16;
    if (upper) {
      blocks.push({ y, h: 4, kind: 'sep' });
      y += 4;
    }
  };
  if (design.upper) stage(design.upper, true);
  stage(design, false);
  const H = Math.max(140, y + 10);
  return (
    <Svg width={110} height={Math.min(320, H)} viewBox={`0 0 120 ${H}`}>
      {blocks.map((b, i) => {
        if (b.kind === 'nose')
          return (
            <Path
              key={i}
              d={`M${x0},${b.y + b.h} L${x0 + w / 2},${b.y} L${x0 + w},${b.y + b.h} Z`}
              fill="#fff"
              stroke={D.ink}
            />
          );
        if (b.kind === 'capsule')
          return (
            <Path
              key={i}
              d={`M${x0 + 4},${b.y + b.h} L${x0 + 10},${b.y + 2} L${x0 + w - 10},${b.y + 2} L${x0 + w - 4},${b.y + b.h} Z`}
              fill="#fff"
              stroke={D.ink}
            />
          );
        if (b.kind === 'tank' || b.kind === 'utank')
          return (
            <G key={i}>
              <Rect
                x={x0}
                y={b.y}
                width={w}
                height={b.h}
                fill={b.kind === 'utank' ? '#EFEAFE' : '#F4F3F8'}
                stroke={D.ink}
              />
              <SvgText fontFamily={Fonts.semibold} x={x0 + w + 6} y={b.y + b.h / 2 + 3} fontSize={8} fill={D.muted}>
                {b.id}
              </SvgText>
            </G>
          );
        if (b.kind === 'sep')
          return (
            <Line
              key={i}
              x1={x0 - 4}
              y1={b.y + 2}
              x2={x0 + w + 4}
              y2={b.y + 2}
              stroke={D.accent}
              strokeDasharray="3 2"
            />
          );
        const wide = b.kind === 'vbell' ? 30 : 22;
        return (
          <G key={i}>
            <Path
              d={`M${x0 + w / 2 - 6},${b.y} L${x0 + w / 2 + 6},${b.y} L${x0 + w / 2 + wide / 2},${b.y + b.h} L${x0 + w / 2 - wide / 2},${b.y + b.h} Z`}
              fill="#D9D7E3"
              stroke={D.ink}
            />
            <SvgText fontFamily={Fonts.semibold} x={x0 - 6} y={b.y + 11} fontSize={8} fill={D.muted} textAnchor="end">
              {b.id}
            </SvgText>
          </G>
        );
      })}
      {!design.tanks.length && (
        <SvgText fontFamily={Fonts.semibold} x={60} y={H - 6} fontSize={9} fill={D.muted} textAnchor="middle">
          + fuel
        </SvgText>
      )}
    </Svg>
  );
}

/** A gravity-turn ascent: altitude against downrange, rising to the orbit line. */
function Ascent({ dv, need }: { dv: number; need: number }) {
  const W2 = 300;
  const H = 120;
  const pts = Array.from({ length: 40 }, (_, i) => {
    const x = i / 39;
    return [20 + x * (W2 - 40), H - 16 - (H - 40) * Math.sin((x * Math.PI) / 2) ** 0.7] as const;
  });
  return (
    <View
      style={[{ width: '100%', aspectRatio: W2 / H }, LTR]}
      {...ltr}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Svg viewBox={`0 0 ${W2} ${H}`} width="100%" height="100%">
        <Line x1={20} y1={H - 16} x2={W2 - 10} y2={H - 16} stroke={D.axis} />
        <Line x1={20} y1={H - 16} x2={20} y2={10} stroke={D.axis} />
        <Line x1={20} y1={24} x2={W2 - 10} y2={24} stroke={D.good} strokeDasharray="4 4" />
        <Polyline points={pts.map(([x, y]) => `${x},${y}`).join(' ')} stroke={D.accent} strokeWidth={2} fill="none" />
        <SvgText fontFamily={Fonts.semibold} x={W2 - 12} y={20} fontSize={9} fill={D.good} textAnchor="end">
          {`Δv ${num(dv)} ≥ ${num(need)} m/s`}
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  brief: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bench: { flexDirection: 'row', gap: 12, alignItems: 'stretch' },
  check: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: W.surface,
  },
  checkLabel: { fontFamily: Fonts.semibold, fontSize: 12, color: W.inkSoft },
  checkValue: { fontFamily: MONO, fontSize: 13, color: W.ink },
  small: { fontFamily: Fonts.semibold, fontSize: 13, color: W.inkSoft },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: W.ink,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: W.surface,
  },
  tabOn: { backgroundColor: W.ink },
  tabText: { fontFamily: Fonts.bold, fontSize: 14, color: W.ink },
  part: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: W.line,
  },
  partOn: { borderColor: W.focus, backgroundColor: W.focusSoft },
  partName: { fontFamily: Fonts.bold, fontSize: 15, color: W.ink },
  partSpec: { fontFamily: MONO, fontSize: 12, color: W.inkSoft },
  stepper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: W.key,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: { fontFamily: FONT, fontSize: 16, color: W.ink, minWidth: 18, textAlign: 'center' },
});

/** The worked example: thrust up, weight down, and their ratio; above 1 the rocket lifts off. */
function HowTo() {
  return (
    <View
      style={[{ width: '100%', maxWidth: 280, aspectRatio: 280 / 150, alignSelf: 'center' }, LTR]}
      {...ltr}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Svg viewBox="0 0 280 150" width="100%" height="100%">
        <Line x1={10} y1={138} x2={110} y2={138} stroke={D.axis} />
        {/* The rocket: nose, tank, engine bell. */}
        <Path d="M50,22 Q60,6 70,22 Z" fill="#fff" stroke={D.ink} strokeWidth={1.6} />
        <Rect x={50} y={22} width={20} height={70} fill="#fff" stroke={D.ink} strokeWidth={1.6} />
        <Path d="M54,92 H66 L70,104 H50 Z" fill={D.soft} />
        {/* Thrust (up, from the engine) and weight (down, from the centre of mass). */}
        <Line x1={28} y1={104} x2={28} y2={34} stroke={D.good} strokeWidth={2.4} />
        <Path d="M22,42 L28,30 L34,42 Z" fill={D.good} />
        <Line x1={92} y1={58} x2={92} y2={122} stroke={D.bad} strokeWidth={2.4} />
        <Path d="M86,114 L92,126 L98,114 Z" fill={D.bad} />
        <SvgText fontFamily={MONO} x={22} y={22} fontSize={11} fill={D.good} textAnchor="middle">
          80 kN
        </SvgText>
        <SvgText fontFamily={MONO} x={100} y={140} fontSize={11} fill={D.bad}>
          49 kN
        </SvgText>
        <SvgText fontFamily={MONO} x={128} y={56} fontSize={11} fill={D.soft}>
          5 000 kg × 9.8 m/s²
        </SvgText>
        <SvgText fontFamily={MONO} x={128} y={74} fontSize={11} fill={D.soft}>
          = 49 000 N
        </SvgText>
        <SvgText fontFamily={Fonts.bold} x={128} y={102} fontSize={13} fill={D.ink}>
          TWR = 80 ÷ 49 = 1.63
        </SvgText>
        <SvgText fontFamily={Fonts.bold} x={128} y={122} fontSize={13} fill={D.good}>
          1.63 &gt; 1 ✓
        </SvgText>
      </Svg>
    </View>
  );
}

defineGameFrame('rocket-builder', {
  HowTo,
  review: (run) =>
    ((run as RocketBuilderRun).missions ?? []).flatMap((m) =>
      m.result
        ? [
            {
              key: String(m.id),
              correct: m.result.correct,
              main: m.title,
              detail: m.question?.q ? `${m.question.q} → ${m.result.answer ?? ''}` : undefined,
            },
          ]
        : [],
    ),
});
