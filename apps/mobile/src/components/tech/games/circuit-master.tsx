import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { Feedback, PrimaryButton, SecondaryButton, W } from '@/components/games/ui';
import { defineGameFrame } from '@/components/lab/contract';
import { Card, D, Eyebrow, LTR, ltr, MONO, Sheet, StepBar } from '@/components/space/kit';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { CircuitMasterRun, GameOutcome, LogicGate } from '@/lib/api';
import { useKeys } from '@/lib/games/english';
import { evaluate, rowInputs } from '@/lib/games/tech';
import type { TechGame } from '@/lib/games/use-lab-run';

type Puzzle = CircuitMasterRun['puzzles'][number];
const GW = 46;
const GH = 34;
const COL = 96;

/** An ANSI (distinctive-shape) gate symbol with its output at (GW, GH/2). */
export function GateSymbol({
  gate,
  x,
  y,
  color = D.ink,
  fill = '#fff',
}: {
  gate: LogicGate | null;
  x: number;
  y: number;
  color?: string;
  fill?: string;
}) {
  const bubble = gate === 'NAND' || gate === 'NOR' || gate === 'NOT';
  const body = (() => {
    switch (gate) {
      case 'AND':
      case 'NAND':
        return `M0,0 H${GW / 2 - 4} A${GH / 2},${GH / 2} 0 0 1 ${GW / 2 - 4},${GH} H0 Z`;
      case 'OR':
      case 'NOR':
      case 'XOR':
        return `M0,0 Q14,${GH / 2} 0,${GH} Q${GW * 0.62},${GH} ${GW - 6},${GH / 2} Q${GW * 0.62},0 0,0 Z`;
      case 'NOT':
        return `M4,2 L${GW - 12},${GH / 2} L4,${GH - 2} Z`;
      default:
        return null;
    }
  })();
  return (
    <G x={x} y={y}>
      {gate === 'WIRE' ? (
        <Line x1={0} y1={GH / 2} x2={GW} y2={GH / 2} stroke={color} strokeWidth={2} />
      ) : body ? (
        <>
          <Path d={body} fill={fill} stroke={color} strokeWidth={1.8} />
          {gate === 'XOR' && <Path d={`M-6,0 Q8,${GH / 2} -6,${GH}`} fill="none" stroke={color} strokeWidth={1.8} />}
          {bubble ? (
            <>
              <Circle
                cx={gate === 'NOT' ? GW - 8 : GW - 2}
                cy={GH / 2}
                r={3.5}
                fill="#fff"
                stroke={color}
                strokeWidth={1.6}
              />
              {gate === 'NOT' && <Line x1={GW - 4} y1={GH / 2} x2={GW} y2={GH / 2} stroke={color} strokeWidth={1.6} />}
            </>
          ) : (
            gate !== 'AND' && <Line x1={GW - 6} y1={GH / 2} x2={GW} y2={GH / 2} stroke={color} strokeWidth={1.6} />
          )}
          {gate === 'AND' && <Line x1={GW - 4} y1={GH / 2} x2={GW} y2={GH / 2} stroke={color} strokeWidth={1.6} />}
        </>
      ) : (
        <>
          <Rect
            x={0}
            y={0}
            width={GW}
            height={GH}
            rx={6}
            fill={D.accentSoft}
            stroke={D.accent}
            strokeDasharray="4 3"
            strokeWidth={1.5}
          />
          <SvgText x={GW / 2} y={GH / 2 + 5} fontSize={14} fontFamily={Fonts.bold} fill={D.accent} textAnchor="middle">
            ?
          </SvgText>
        </>
      )}
    </G>
  );
}

/** Where every input, slot and the bulb sit: one column per depth, spread evenly down each column. */
function layout(p: Puzzle) {
  const depth: Record<string, number> = Object.fromEntries(p.inputs.map((n) => [n, 0]));
  for (const s of p.slots) depth[s.id] = 1 + Math.max(...s.from.map((f) => depth[f] ?? 0));
  const cols = Math.max(...Object.values(depth));
  const byCol: string[][] = Array.from({ length: cols + 1 }, () => []);
  for (const [id, d] of Object.entries(depth)) byCol[d]!.push(id);
  const H = Math.max(160, Math.max(...byCol.map((c) => c.length)) * 64 + 20);
  const pos: Record<string, { x: number; y: number }> = {};
  byCol.forEach((ids, d) =>
    ids.forEach((id, k) => (pos[id] = { x: 24 + d * COL, y: ((k + 0.5) * H) / ids.length - GH / 2 })),
  );
  return { pos, W: 24 + (cols + 1) * COL + 40, H };
}

/**
 * Circuit Master: choose a gate for every empty slot so the bulb follows the truth table. Gates are
 * drawn with their standard symbols; the table lists every input combination. On the easier levels
 * the bulb's current output shows for each row as you build.
 */
export function CircuitMaster({ g, run }: { g: TechGame; run: CircuitMasterRun }) {
  const { t } = useTranslation('tech');
  const total = run.puzzles.length;
  const [i, setI] = useState(() => Math.min(run.at, total - 1));
  const p = run.puzzles[i]!;
  const [gates, setGates] = useState<Record<string, LogicGate>>({});
  const [sel, setSel] = useState(p.slots[0]!.id);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [wrongRows, setWrongRows] = useState<number[]>([]);
  const [boxW, setBoxW] = useState(0);
  const slot = p.slots.find((s) => s.id === sel)!;
  const choices: LogicGate[] = slot.kind === 'unary' ? ['NOT', 'WIRE'] : p.gates.filter((x) => x !== 'NOT');
  const rows = 2 ** p.inputs.length;
  const preview = p.preview !== false;
  const now = Array.from({ length: rows }, (_, r) => evaluate(rowInputs(p.inputs, r), p.slots, gates)[p.out] ?? 0);
  const complete = p.slots.every((s) => gates[s.id]);
  const shown = outcome?.correct === false && p.result?.solution ? p.result.solution : gates;

  const choose = (gate: LogicGate) => {
    if (outcome) return;
    setGates({ ...gates, [sel]: gate });
    setWrongRows([]);
    // Move on to the next empty slot.
    const nextEmpty = p.slots.find((s) => s.id !== sel && !gates[s.id]);
    if (nextEmpty) setSel(nextEmpty.id);
  };
  const test = async () => {
    if (!complete || outcome) return;
    const res = await g.answer({ step: i, gates });
    if (!res) return;
    g.buzz(res.outcome.correct ? 'success' : 'error');
    if (res.outcome.correct || !res.outcome.retry) setOutcome(res.outcome);
    else setWrongRows(res.outcome.wrongRows ?? []);
  };
  const giveUp = async () => {
    const res = await g.answer({ step: i, timeout: true });
    if (res) setOutcome(res.outcome);
  };
  const next = () => {
    if (run.status !== 'playing' || run.at >= total) return void g.finish();
    const n = run.at;
    setI(n);
    setGates({});
    setSel(run.puzzles[n]!.slots[0]!.id);
    setOutcome(null);
    setWrongRows([]);
  };
  useKeys((key) => {
    if (key === 'Enter') return void (outcome ? next() : test());
    const k = Number(key) - 1;
    if (k >= 0 && k < choices.length) choose(choices[k]!);
  });

  const { pos, W: SW, H } = layout(p);
  const out = pos[p.out]!;
  // The whole circuit shrinks to fit the card (big circuits on a phone), never cut off at the edge.
  const scale = boxW > 0 ? Math.min(1, boxW / SW) : 1;
  return (
    <Sheet>
      <StepBar
        label={t('play.circuit.step', { n: i + 1, total })}
        n={i + 1}
        total={total}
        right={<Text style={styles.small}>{t('play.circuit.tries', { count: p.tries })}</Text>}
      />
      <Card style={{ padding: 8 }}>
        <View
          onLayout={(e) => setBoxW(e.nativeEvent.layout.width)}
          style={[{ alignItems: 'center' }, LTR]}
          {...ltr}>
          <Svg width={SW * scale} height={H * scale} viewBox={`0 0 ${SW} ${H}`}>
            {/* Wires: from each source's output to the gate's input pins. */}
            {p.slots.map((s) =>
              s.from.map((f, k) => {
                const a = pos[f]!;
                const b = pos[s.id]!;
                const ax = p.inputs.includes(f) ? a.x + 22 : a.x + GW;
                const ay = a.y + GH / 2;
                const by = b.y + (s.from.length === 1 ? GH / 2 : k === 0 ? 9 : GH - 9);
                const mid = b.x - 14 - k * 6;
                return (
                  <Path
                    key={`${s.id}${k}`}
                    d={`M${ax},${ay} H${mid} V${by} H${b.x + (s.kind === 'binary' ? 4 : 2)}`}
                    stroke={D.soft}
                    strokeWidth={1.5}
                    fill="none"
                  />
                );
              }),
            )}
            {p.inputs.map((n) => (
              <G key={n}>
                <Circle
                  cx={pos[n]!.x + 10}
                  cy={pos[n]!.y + GH / 2}
                  r={12}
                  fill="#fff"
                  stroke={D.ink}
                  strokeWidth={1.6}
                />
                <SvgText
                  x={pos[n]!.x + 10}
                  y={pos[n]!.y + GH / 2 + 5}
                  fontSize={13}
                  fontFamily={Fonts.bold}
                  fill={D.ink}
                  textAnchor="middle">
                  {n}
                </SvgText>
              </G>
            ))}
            {p.slots.map((s) => (
              <G key={s.id}>
                {s.id === sel && !outcome && (
                  <Rect
                    x={pos[s.id]!.x - 10}
                    y={pos[s.id]!.y - 6}
                    width={GW + 18}
                    height={GH + 12}
                    rx={8}
                    fill="none"
                    stroke={D.accent}
                    strokeWidth={2}
                  />
                )}
                <GateSymbol
                  gate={shown[s.id] ?? null}
                  x={pos[s.id]!.x}
                  y={pos[s.id]!.y}
                  color={outcome?.correct === false ? D.good : D.ink}
                />
                {shown[s.id] && shown[s.id] !== 'WIRE' && (
                  <SvgText
                    x={pos[s.id]!.x + GW / 2 - 4}
                    y={pos[s.id]!.y + GH + 13}
                    fontSize={9}
                    fontFamily={MONO}
                    fill={D.muted}
                    textAnchor="middle">
                    {shown[s.id]}
                  </SvgText>
                )}
              </G>
            ))}
            {/* The bulb (output) */}
            <Line
              x1={out.x + GW}
              y1={out.y + GH / 2}
              x2={out.x + GW + 18}
              y2={out.y + GH / 2}
              stroke={D.soft}
              strokeWidth={1.5}
            />
            <Circle
              cx={out.x + GW + 30}
              cy={out.y + GH / 2}
              r={12}
              fill={outcome?.correct ? '#FFE9A8' : '#fff'}
              stroke={D.ink}
              strokeWidth={1.6}
            />
            <Path
              d={`M${out.x + GW + 24},${out.y + GH / 2 - 5} L${out.x + GW + 36},${out.y + GH / 2 + 5} M${out.x + GW + 36},${out.y + GH / 2 - 5} L${out.x + GW + 24},${out.y + GH / 2 + 5}`}
              stroke={D.ink}
              strokeWidth={1.2}
            />
            <SvgText
              fontFamily={Fonts.semibold}
              x={out.x + GW + 30}
              y={out.y + GH / 2 + 26}
              fontSize={9}
              fill={D.muted}
              textAnchor="middle">
              Q
            </SvgText>
          </Svg>
        </View>
      </Card>

      {!outcome && (
        <Card>
          <Eyebrow text={t('play.circuit.choose', { slot: p.slots.indexOf(slot) + 1 })} />
          <View style={styles.palette}>
            {p.slots.length > 1 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, width: '100%' }}>
                {p.slots.map((s, k) => (
                  <Pressable
                    key={s.id}
                    onPress={() => setSel(s.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: s.id === sel }}
                    accessibilityLabel={t('play.circuit.slotA11y', { n: k + 1, gate: gates[s.id] ?? '?' })}
                    style={[styles.slotChip, s.id === sel && { borderColor: W.focus, backgroundColor: W.focusSoft }]}>
                    <Text style={styles.slotText}>{`${k + 1}: ${gates[s.id] ?? '?'}`}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            {choices.map((gate, k) => (
              <Pressable
                key={gate}
                onPress={() => choose(gate)}
                accessibilityRole="button"
                accessibilityLabel={t('play.circuit.gateA11y', { gate: t(`play.circuit.gates.${gate}`), key: k + 1 })}
                style={[styles.gate, gates[sel] === gate && { borderColor: W.ink, backgroundColor: W.key }]}>
                <Svg width={58} height={40} viewBox="-8 -3 62 40">
                  <GateSymbol gate={gate} x={0} y={0} />
                </Svg>
                <Text style={styles.gateName}>{t(`play.circuit.gates.${gate}`)}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      )}

      <Card>
        <Eyebrow text={t('play.circuit.table')} />
        <View style={[styles.table, LTR]} {...ltr} accessibilityRole="none">
          <View style={[styles.tr, styles.th]}>
            {p.inputs.map((n) => (
              <Text key={n} style={styles.td}>
                {n}
              </Text>
            ))}
            <Text style={[styles.td, styles.want]}>{t('play.circuit.want')}</Text>
            {preview && <Text style={[styles.td, styles.want]}>{t('play.circuit.now')}</Text>}
          </View>
          {Array.from({ length: rows }, (_, r) => {
            const ins = rowInputs(p.inputs, r);
            const ok = now[r] === p.target[r];
            const flagged = wrongRows.includes(r);
            return (
              <View
                key={r}
                style={[styles.tr, flagged && { backgroundColor: W.wrongSoft }]}
                accessible
                accessibilityLabel={`${p.inputs.map((n) => `${n} ${ins[n]}`).join(', ')}: ${t('play.circuit.want')} ${p.target[r]}${preview ? `, ${t('play.circuit.now')} ${now[r]}` : ''}`}>
                {p.inputs.map((n) => (
                  <Text key={n} style={styles.td}>
                    {ins[n]}
                  </Text>
                ))}
                <Text style={[styles.td, styles.want]}>{p.target[r]}</Text>
                {preview && (
                  <View style={[styles.tdBox, { flexDirection: 'row', gap: 4 }]}>
                    <Text style={styles.tdText}>{complete ? now[r] : '·'}</Text>
                    {complete && (
                      <Ionicons name={ok ? 'checkmark' : 'close'} size={14} color={ok ? W.correct : W.wrong} />
                    )}
                  </View>
                )}
                {flagged && !preview && <Ionicons name="close" size={14} color={W.wrong} />}
              </View>
            );
          })}
        </View>
      </Card>

      {wrongRows.length > 0 && <Feedback tone="bad" title={t('play.circuit.wrong', { count: wrongRows.length })} />}
      {outcome ? (
        <View style={{ gap: 10 }}>
          <Feedback
            tone={outcome.correct ? 'good' : 'info'}
            title={outcome.correct ? t('play.circuit.lit', { points: outcome.points }) : t('play.circuit.solution')}
          />
          <PrimaryButton
            title={run.at >= total ? t('play.finish') : t('play.circuit.next')}
            icon="arrow-forward"
            onPress={next}
          />
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          <PrimaryButton
            title={t('play.circuit.test')}
            icon="flash-outline"
            disabled={!complete}
            busy={g.busy}
            onPress={() => void test()}
          />
          {p.tries >= 3 && <SecondaryButton title={t('play.circuit.giveUp')} onPress={() => void giveUp()} />}
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  small: { fontFamily: Fonts.semibold, fontSize: 13, color: W.muted },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotChip: {
    minHeight: 36,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: W.line,
  },
  slotText: { fontFamily: MONO, fontSize: 13, color: W.ink },
  gate: {
    width: 92,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: W.line,
    backgroundColor: W.surface,
  },
  gateName: { fontFamily: MONO, fontSize: 12, color: W.ink },
  table: { borderWidth: 1, borderColor: W.line, borderRadius: 10, overflow: 'hidden' },
  tr: { flexDirection: 'row', alignItems: 'center', minHeight: 32, borderTopWidth: 1, borderTopColor: W.line },
  th: { backgroundColor: '#F1F0F6', borderTopWidth: 0 },
  td: { flex: 1, textAlign: 'center', fontFamily: MONO, fontSize: 14, color: W.ink },
  tdBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tdText: { fontFamily: MONO, fontSize: 14, color: W.ink },
  want: { fontFamily: Fonts.bold },
});

/** The worked example: an AND gate gives 1 only on the row where A and B are both 1. */
function HowTo() {
  const rows = [
    [0, 0, 0],
    [0, 1, 0],
    [1, 0, 0],
    [1, 1, 1],
  ];
  const y = (k: number) => (k ? 50 : 22);
  return (
    <View
      style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }, LTR]}
      {...ltr}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Svg width={150} height={72} viewBox="0 0 150 72">
        {['A', 'B'].map((n, k) => (
          <G key={n}>
            <SvgText x={4} y={y(k) + 4} fontSize={12} fontFamily={Fonts.bold} fill={D.ink}>
              {n}
            </SvgText>
            <SvgText x={20} y={y(k) + 4} fontSize={12} fontFamily={MONO} fill={D.good}>
              1
            </SvgText>
            <Line x1={32} y1={y(k)} x2={50} y2={y(k)} stroke={D.good} strokeWidth={2} />
            <Line x1={50} y1={y(k)} x2={50} y2={k ? 44 : 28} stroke={D.good} strokeWidth={2} />
            <Line x1={50} y1={k ? 44 : 28} x2={56} y2={k ? 44 : 28} stroke={D.good} strokeWidth={2} />
          </G>
        ))}
        <GateSymbol gate="AND" x={56} y={19} color={D.good} />
        <Line x1={56 + GW} y1={36} x2={120} y2={36} stroke={D.good} strokeWidth={2} />
        <Circle cx={130} cy={36} r={10} fill={D.good} />
        <SvgText x={130} y={40} fontSize={12} fontFamily={MONO} fill="#fff" textAnchor="middle">
          1
        </SvgText>
      </Svg>
      <View style={{ gap: 2 }}>
        <Text style={{ fontFamily: MONO, fontSize: 13, color: W.muted }}>A B  Q</Text>
        {rows.map((r) => (
          <Text key={r.join('')} style={{ fontFamily: MONO, fontSize: 13, color: r[2] ? W.correct : W.ink }}>
            {`${r[0]} ${r[1]}  ${r[2]}`}
          </Text>
        ))}
      </View>
    </View>
  );
}

defineGameFrame('circuit-master', {
  HowTo,
  hearts: false,
  review: (run) =>
    ((run as CircuitMasterRun).puzzles ?? []).flatMap((x) =>
      x.result
        ? [
            {
              key: String(x.id),
              correct: x.result.correct,
              main: `${x.inputs.join(', ')} → Q: ${x.target.join('')}`,
              detail: Object.values(x.result.solution).join(' · '),
            },
          ]
        : [],
    ),
});
