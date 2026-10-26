import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';

import { Backdrop } from '@/components/lab/backdrop';
import { BOLD, GoldButton, Panel, PANEL } from '@/components/lab/hud';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { CircuitMasterRun, GameOutcome, LogicGate } from '@/lib/api';
import { evaluate, rowInputs, TECH_SCENES } from '@/lib/games/tech';
import type { TechGame } from '@/lib/games/use-lab-run';

const POWER = '#FFD34D';
const OFF = 'rgba(160,170,210,0.55)';

/**
 * Circuit Master: put logic gates in the circuit's slots so the bulb lights exactly when the table
 * says. Flip the switches to try it; the server tests every combination.
 */
export function CircuitMaster({ g, run }: { g: TechGame; run: CircuitMasterRun }) {
  const { t } = useTranslation('tech');
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [i, setI] = useState(() => Math.min(run.at, run.puzzles.length - 1));
  const x = run.puzzles[i]!;
  const [chosen, setGates] = useState<Partial<Record<string, LogicGate>>>({});
  const [switches, setSwitches] = useState<Record<string, number>>(() =>
    Object.fromEntries(x.inputs.map((n) => [n, 0])),
  );
  const [slot, setSlot] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // After skipping, the circuit shows a solution.
  const gates: Partial<Record<string, LogicGate>> =
    outcome && !outcome.correct && x.result?.solution ? x.result.solution : chosen;
  const filled = x.slots.every((s) => gates[s.id]);
  const live = evaluate(switches, x.slots, gates);
  const row = x.inputs.reduce((n, name) => n * 2 + (switches[name] ?? 0), 0);
  // What the current gates give on every row (once every slot has a gate).
  const mine = filled ? x.target.map((_, r) => evaluate(rowInputs(x.inputs, r), x.slots, gates)[x.out]!) : null;

  // Layout: inputs on the left, slots by depth, the bulb on the right.
  const depth: Record<string, number> = Object.fromEntries(x.inputs.map((n) => [n, 0]));
  for (const s of x.slots) depth[s.id] = 1 + Math.max(...s.from.map((f) => depth[f] ?? 0));
  const maxDepth = Math.max(...x.slots.map((s) => depth[s.id]!));
  // The schematic fills the space between the top panel and the table and buttons.
  const board = { top: 150, h: Math.max(220, size.h - 150 - 280), w: size.w - 2 * Spacing.md };
  const colX = (d: number) => Spacing.md + 30 + (d * (board.w - 90)) / (maxDepth + 1);
  const at: Record<string, [number, number]> = {};
  x.inputs.forEach((n, k) => (at[n] = [colX(0), board.top + ((k + 0.5) * board.h) / x.inputs.length]));
  for (let d = 1; d <= maxDepth; d++) {
    const here = x.slots.filter((s) => depth[s.id] === d);
    here.forEach((s, k) => (at[s.id] = [colX(d), board.top + ((k + 0.5) * board.h) / here.length]));
  }
  const bulb: [number, number] = [Spacing.md + board.w - 30, at[x.out]![1]];
  const wires = [...x.slots.flatMap((s) => s.from.map((f) => [f, s.id] as const)), [x.out, 'bulb'] as const];
  const lit = live[x.out] === 1 && filled;

  const choices = (kind: 'binary' | 'unary'): LogicGate[] =>
    kind === 'unary' ? ['NOT', 'WIRE'] : x.gates.filter((gt) => gt !== 'NOT');
  const test = async () => {
    if (!filled) {
      setMessage(t('circuit.unfinished'));
      return;
    }
    const res = await g.answer({ step: i, gates: gates as Record<string, LogicGate> });
    if (!res) return;
    g.buzz(res.outcome.correct ? 'success' : 'error');
    if (res.outcome.correct) setOutcome(res.outcome);
    else setMessage(t('circuit.wrong'));
  };
  const giveUp = async () => {
    const res = await g.answer({ step: i, timeout: true });
    if (res) setOutcome(res.outcome);
  };
  const next = () => {
    if (run.status !== 'playing' || run.at >= run.puzzles.length) {
      void g.finish();
      return;
    }
    const n = run.puzzles[run.at]!;
    setI(run.at);
    setGates({});
    setSwitches(Object.fromEntries(n.inputs.map((name) => [name, 0])));
    setSlot(null);
    setOutcome(null);
    setMessage(null);
  };

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      <Backdrop source={TECH_SCENES.circuit} dim={0.35} />
      {size.w > 0 && (
        <>
          <Svg width={size.w} height={size.h} style={StyleSheet.absoluteFill} pointerEvents="none">
            {wires.map(([from, to], k) => {
              const [x1, y1] = at[from]!;
              const [x2, y2] = to === 'bulb' ? bulb : at[to]!;
              const on = (live[from] ?? 0) === 1;
              return (
                <Line
                  key={k}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={on ? POWER : OFF}
                  strokeWidth={on ? 5 : 3}
                  strokeLinecap="round"
                />
              );
            })}
          </Svg>
          {x.inputs.map((n) => (
            <Pressable
              key={n}
              onPress={() => setSwitches({ ...switches, [n]: 1 - (switches[n] ?? 0) })}
              accessibilityRole="switch"
              accessibilityState={{ checked: switches[n] === 1 }}
              accessibilityLabel={t('circuit.toggle', {
                name: n,
                state: switches[n] ? t('binary.on') : t('binary.off'),
              })}
              style={[
                styles.input,
                { left: at[n]![0] - 26, top: at[n]![1] - 26 },
                switches[n] ? styles.inputOn : null,
              ]}>
              <Text style={{ fontFamily: BOLD, color: switches[n] ? '#3A2600' : '#fff', fontSize: 16 }}>{n}</Text>
              <Text style={{ fontSize: 9, color: switches[n] ? '#3A2600' : '#fff' }}>{switches[n] ? 'ON' : 'OFF'}</Text>
            </Pressable>
          ))}
          {x.slots.map((s, k) => (
            <Pressable
              key={s.id}
              onPress={() => !outcome && setSlot(slot === s.id ? null : s.id)}
              accessibilityRole="button"
              accessibilityLabel={t('circuit.slotA11y', { n: k + 1, gate: gates[s.id] ?? t('circuit.empty') })}
              style={[
                styles.chip,
                { left: at[s.id]![0] - 34, top: at[s.id]![1] - 22 },
                slot === s.id && { borderColor: Colors.reward },
                !gates[s.id] && styles.empty,
              ]}>
              <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 13 }}>
                {gates[s.id] === 'WIRE' ? t('circuit.wire') : (gates[s.id] ?? '?')}
              </Text>
            </Pressable>
          ))}
          <View style={[styles.bulb, { left: bulb[0] - 24, top: bulb[1] - 28 }]} pointerEvents="none">
            <Ionicons name={lit ? 'bulb' : 'bulb-outline'} size={46} color={lit ? POWER : '#C9CEE8'} />
          </View>
        </>
      )}

      <SafeAreaView edges={['top']} style={styles.top} pointerEvents="none">
        <Panel style={{ gap: 2 }}>
          <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 14 }}>
            {t('circuit.objective', { n: i + 1, total: run.puzzles.length })} · {t('ui.tries', { count: x.tries })}
          </Text>
          <Text style={{ color: 'rgba(235,238,255,0.85)', fontSize: 12 }}>{t('circuit.goal')}</Text>
        </Panel>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.bottom} pointerEvents="box-none">
        <Panel style={{ gap: Spacing.sm, padding: 10 }}>
          {/* The truth table: what the bulb should do for each switch setting. */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
            {x.target.map((v, r) => {
              const ins = rowInputs(x.inputs, r);
              return (
                <View key={r} style={[styles.rowBox, r === row && { borderColor: Colors.reward }]}>
                  <Text style={{ color: 'rgba(235,238,255,0.8)', fontSize: 11 }}>
                    {x.inputs.map((n) => `${n}${ins[n]}`).join(' ')}
                  </Text>
                  <Text style={{ fontFamily: BOLD, color: v ? POWER : '#C9CEE8', fontSize: 12 }}>
                    {v ? t('circuit.onLabel') : t('circuit.offLabel')}
                  </Text>
                  {mine && (
                    <Text style={{ fontSize: 12, color: mine[r] === v ? Colors.success : Colors.danger }}>
                      {mine[r] === v ? '✓' : '✗'}
                    </Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
          {outcome ? (
            <Animated.View entering={FadeInDown} style={{ gap: Spacing.sm }}>
              <Text style={{ fontFamily: BOLD, fontSize: 17, color: outcome.correct ? Colors.success : '#fff' }}>
                {outcome.correct ? t('circuit.lit', { points: outcome.points }) : t('ui.solution')}
              </Text>
              <GoldButton title={t('circuit.next')} icon="arrow-forward" onPress={next} />
            </Animated.View>
          ) : (
            <>
              {slot && (
                <View style={{ gap: 6 }}>
                  <Text style={styles.heading}>{t('circuit.pickGate')}</Text>
                  <View style={styles.wrap}>
                    {choices(x.slots.find((s) => s.id === slot)!.kind).map((gt) => (
                      <Pressable
                        key={gt}
                        onPress={() => {
                          g.buzz('tap');
                          setGates({ ...gates, [slot]: gt });
                          setSlot(null);
                          setMessage(null);
                        }}
                        accessibilityRole="button"
                        style={[styles.gate, gates[slot] === gt && { borderColor: Colors.reward }]}>
                        <Text style={{ fontFamily: BOLD, color: '#fff' }}>
                          {gt === 'WIRE' ? t('circuit.wire') : gt}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
              {!!message && <Text style={{ color: '#FF8FA6', fontFamily: BOLD }}>{message}</Text>}
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                {x.tries >= 3 && (
                  <Pressable
                    onPress={() => void giveUp()}
                    disabled={g.busy}
                    accessibilityRole="button"
                    style={styles.secondary}>
                    <Text style={{ fontFamily: BOLD, color: '#fff' }}>{t('ui.skip')}</Text>
                  </Pressable>
                )}
                <View style={{ flex: 1 }}>
                  <GoldButton title={t('circuit.test')} icon="flash" disabled={g.busy} onPress={() => void test()} />
                </View>
              </View>
            </>
          )}
        </Panel>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', left: Spacing.md, right: Spacing.md, top: 56 },
  bottom: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: Spacing.sm },
  input: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A3366',
    borderWidth: 2,
    borderColor: '#5B6BC9',
  },
  inputOn: { backgroundColor: POWER, borderColor: '#FFF1B8' },
  chip: {
    position: 'absolute',
    width: 68,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2A52',
    borderWidth: 2,
    borderColor: '#7C5CFF',
  },
  empty: { borderStyle: 'dashed', backgroundColor: PANEL },
  bulb: { position: 'absolute', width: 48, height: 56, alignItems: 'center', justifyContent: 'center' },
  heading: { fontFamily: BOLD, fontSize: 10, color: Colors.reward, letterSpacing: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  gate: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1F2A52',
    borderWidth: 2,
    borderColor: '#5B6BC9',
  },
  rowBox: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  secondary: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,92,255,0.35)',
  },
});
