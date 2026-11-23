import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';

import { Feedback, FONT, PrimaryButton, SecondaryButton, W } from '@/components/games/ui';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { GameOutcome, MoleculeBuilderRun } from '@/lib/api';
import { useKeys } from '@/lib/games/english';
import type { LabGame } from '@/lib/games/use-lab-run';

import { defineGameFrame } from '../contract';
import { Board, Card, Chem, StepHeader } from './kit';

type Bond = [number, number, number];
type Mol = { atoms: string[]; bonds: Bond[] };

/** The ring colour of each element (the usual CPK colours, softened); the letter is always written. */
const RING: Record<string, string> = { H: '#9AA0AE', C: '#2B2F3A', O: '#D64545', N: '#3D63D6', Cl: '#2E9E4A', F: '#6CA83A', S: '#C9A000', Br: '#9A3B2E', I: '#6E3FA3', P: '#D9822B', B: '#C08A6A' };
const VALENCY_FALLBACK: Record<string, number> = { H: 1, C: 4, N: 3, O: 2, S: 2, F: 1, Cl: 1, Br: 1, I: 1, P: 3, B: 3 };

/**
 * A tidy drawing of a structure: a few hundred steps of a spring layout (bonds pull, atoms push apart),
 * started from the last positions so the drawing doesn't jump as you build. Hydrogens sit closer.
 */
function relax(mol: Mol, start: [number, number][], w: number, h: number): [number, number][] {
  const n = mol.atoms.length;
  const pos = mol.atoms.map((_, k): [number, number] => {
    if (start[k]) return [...start[k]!];
    const nb = mol.bonds.find(([a, b]) => (a === k && b < k) || (b === k && a < k));
    const anchor = nb ? start[nb[0] === k ? nb[1] : nb[0]] : undefined;
    const angle = k * 2.399; // golden angle: new atoms spread out
    return anchor ? [anchor[0] + Math.cos(angle) * 40, anchor[1] + Math.sin(angle) * 40] : [w / 2 + Math.cos(angle) * 60, h / 2 + Math.sin(angle) * 50];
  });
  const len = (a: number, b: number) => (mol.atoms[a] === 'H' || mol.atoms[b] === 'H' ? 46 : 64);
  for (let step = 0; step < 220; step++) {
    const force = pos.map(() => [0, 0]);
    for (let a = 0; a < n; a++)
      for (let b = a + 1; b < n; b++) {
        const dx = pos[b]![0] - pos[a]![0] || 0.01 * (b - a);
        const dy = pos[b]![1] - pos[a]![1] || 0.01;
        const d2 = Math.max(dx * dx + dy * dy, 36);
        const push = 2400 / d2;
        const d = Math.sqrt(d2);
        force[a]![0] -= (push * dx) / d;
        force[a]![1] -= (push * dy) / d;
        force[b]![0] += (push * dx) / d;
        force[b]![1] += (push * dy) / d;
      }
    for (const [a, b] of mol.bonds) {
      const dx = pos[b]![0] - pos[a]![0];
      const dy = pos[b]![1] - pos[a]![1];
      const d = Math.hypot(dx, dy) || 1;
      const pull = (d - len(a, b)) * 0.18;
      force[a]![0] += (pull * dx) / d;
      force[a]![1] += (pull * dy) / d;
      force[b]![0] -= (pull * dx) / d;
      force[b]![1] -= (pull * dy) / d;
    }
    const cool = 1 - step / 260;
    for (let k = 0; k < n; k++) {
      // A gentle pull to the middle keeps pieces on the board.
      force[k]![0] += (w / 2 - pos[k]![0]) * 0.01;
      force[k]![1] += (h / 2 - pos[k]![1]) * 0.01;
      const f = Math.hypot(force[k]![0], force[k]![1]);
      const cap = Math.min(f, 12 * cool) / (f || 1);
      pos[k]![0] = Math.min(w - 24, Math.max(24, pos[k]![0] + force[k]![0] * cap));
      pos[k]![1] = Math.min(h - 24, Math.max(24, pos[k]![1] + force[k]![1] * cap));
    }
  }
  return pos;
}

/** A structural formula on a white canvas: bonds as lines (double and triple drawn as such), atoms as labelled circles. */
function Structure({
  mol,
  pos,
  size,
  picked,
  free,
  onAtom,
  label,
}: {
  mol: Mol;
  pos: [number, number][];
  size: { w: number; h: number };
  picked?: number | null;
  free?: number[];
  onAtom?: (k: number) => void;
  label: (k: number) => string;
}) {
  const r = 17;
  return (
    <View style={{ width: size.w, height: size.h }}>
      <Svg width={size.w} height={size.h}>
        {mol.bonds.map(([a, b, order], i) => {
          const [x1, y1] = pos[a]!;
          const [x2, y2] = pos[b]!;
          const d = Math.hypot(x2 - x1, y2 - y1) || 1;
          const nx = (-(y2 - y1) / d) * 5;
          const ny = ((x2 - x1) / d) * 5;
          const offsets = order === 1 ? [0] : order === 2 ? [-0.6, 0.6] : [-1.1, 0, 1.1];
          return (
            <G key={i}>
              {offsets.map((o) => (
                <Line key={o} x1={x1 + nx * o} y1={y1 + ny * o} x2={x2 + nx * o} y2={y2 + ny * o} stroke={W.ink} strokeWidth={2.2} strokeLinecap="round" />
              ))}
            </G>
          );
        })}
        {mol.atoms.map((el, k) => {
          const [x, y] = pos[k]!;
          const on = picked === k;
          return (
            <G key={k}>
              <Circle cx={x} cy={y} r={r} fill={on ? '#ECE7FF' : W.surface} stroke={on ? W.focus : RING[el] ?? W.ink} strokeWidth={on ? 3.5 : 2.2} />
              <SvgText x={x} y={y + 6} fontSize={el.length > 1 ? 14 : 16} fontWeight="800" fontFamily={FONT} fill={W.ink} textAnchor="middle">
                {el}
              </SvgText>
              {!!free && free[k]! !== 0 && (
                <G>
                  <Circle cx={x + 13} cy={y - 13} r={8} fill={free[k]! > 0 ? '#FFF3DC' : W.wrongSoft} stroke={free[k]! > 0 ? W.rare : W.wrong} strokeWidth={1.2} />
                  <SvgText x={x + 13} y={y - 9.5} fontSize={10} fontWeight="700" fill={free[k]! > 0 ? '#5C3700' : W.wrong} textAnchor="middle">
                    {free[k]! > 0 ? String(free[k]) : '!'}
                  </SvgText>
                </G>
              )}
            </G>
          );
        })}
      </Svg>
      {onAtom &&
        mol.atoms.map((el, k) => (
          <Pressable
            key={k}
            onPress={() => onAtom(k)}
            accessibilityRole="button"
            accessibilityState={{ selected: picked === k }}
            accessibilityLabel={label(k)}
            hitSlop={4}
            style={{ position: 'absolute', left: pos[k]![0] - 22, top: pos[k]![1] - 22, width: 44, height: 44, borderRadius: 22 }}
          />
        ))}
    </View>
  );
}

/**
 * Molecule Builder: add atoms from the tray, tap two atoms to bond them (tap the pair again for a double,
 * then a triple bond, then none), and check. The server checks the exact structure, so isomers count as
 * different molecules. From level 4 one tap fills the remaining bonds with hydrogens.
 */
export function MoleculeDesk({ g, run }: { g: LabGame; run: MoleculeBuilderRun }) {
  const { t } = useTranslation('lab');
  const { width } = useWindowDimensions();
  const [i, setI] = useState(() => Math.min(run.at, run.molecules.length - 1));
  const mol = run.molecules[i]!;
  const [m, setM] = useState<Mol>({ atoms: [], bonds: [] });
  const [history, setHistory] = useState<Mol[]>([]);
  const [pos, setPos] = useState<[number, number][]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<{ o: GameOutcome; done: boolean } | null>(null);
  const size = { w: Math.min(width, 520) - 32, h: Math.min(360, Math.max(260, (Math.min(width, 520) - 32) * 0.75)) };
  const valency = (el: string) => run.valency[el] ?? VALENCY_FALLBACK[el] ?? 1;
  const used = m.atoms.map((_, k) => m.bonds.reduce((s, [a, b, o]) => s + (a === k || b === k ? o : 0), 0));
  const free = m.atoms.map((el, k) => valency(el) - used[k]!);

  const change = (next: Mol) => {
    setHistory([...history.slice(-30), m]);
    setM(next);
    setPos(relax(next, pos, size.w, size.h));
    setProblem(null);
  };
  const addAtom = (el: string) => {
    if (outcome || m.atoms.length >= 40) return;
    g.buzz('tap');
    const k = m.atoms.length;
    // Bond the new atom to the picked one when there's room: building chains is quick.
    const bond = picked !== null && free[picked]! > 0 ? [[picked, k, 1] as Bond] : [];
    change({ atoms: [...m.atoms, el], bonds: [...m.bonds, ...bond] });
    if (el !== 'H' && valency(el) > 1) setPicked(k);
  };
  const tapAtom = (k: number) => {
    if (outcome) return;
    if (picked === null) return setPicked(k);
    if (picked === k) return setPicked(null);
    const [a, b] = [Math.min(picked, k), Math.max(picked, k)];
    const at = m.bonds.findIndex(([x, y]) => x === a && y === b);
    const bonds: Bond[] =
      at < 0 ? [...m.bonds, [a, b, 1]] : m.bonds[at]![2] >= 3 ? m.bonds.filter((_, j) => j !== at) : m.bonds.map((bd, j) => (j === at ? [a, b, bd[2] + 1] : bd));
    g.buzz('tap');
    change({ atoms: m.atoms, bonds });
    setPicked(null);
  };
  const removeAtom = () => {
    if (picked === null) return;
    const k = picked;
    const atoms = m.atoms.filter((_, j) => j !== k);
    const bonds = m.bonds.filter(([a, b]) => a !== k && b !== k).map(([a, b, o]): Bond => [a > k ? a - 1 : a, b > k ? b - 1 : b, o]);
    setPos(pos.filter((_, j) => j !== k));
    setHistory([...history, m]);
    setM({ atoms, bonds });
    setPicked(null);
  };
  const fillHydrogens = () => {
    const atoms = [...m.atoms];
    const bonds = [...m.bonds];
    m.atoms.forEach((el, k) => {
      if (el === 'H') return;
      for (let f = 0; f < free[k]!; f++) {
        atoms.push('H');
        bonds.push([k, atoms.length - 1, 1]);
      }
    });
    if (atoms.length > 40) return;
    g.buzz('tap');
    change({ atoms, bonds });
    setPicked(null);
  };
  const undo = () => {
    const last = history.at(-1);
    if (!last) return;
    setHistory(history.slice(0, -1));
    setM(last);
    setPos(relax(last, pos.slice(0, last.atoms.length), size.w, size.h));
    setPicked(null);
  };
  const check = async (skip = false) => {
    if (outcome || g.busy) return;
    const res = await g.answer(skip ? { step: i, timeout: true } : { step: i, atoms: m.atoms, bonds: m.bonds });
    if (!res) return;
    if (res.outcome.retry) {
      g.buzz('error');
      setProblem(t(`chem.problems.${(res.outcome.problem ?? 'valency') as 'count'}`));
      if (res.done) void g.finish();
      return;
    }
    g.buzz(res.outcome.correct ? 'success' : 'tap');
    setOutcome({ o: res.outcome, done: res.done });
  };
  const next = () => {
    if (!outcome) return;
    if (outcome.done) return void g.finish();
    setOutcome(null);
    setM({ atoms: [], bonds: [] });
    setHistory([]);
    setPos([]);
    setPicked(null);
    setI(i + 1);
  };
  useKeys((key) => {
    if (key === 'Enter') return outcome ? next() : void check();
    if (key === 'Backspace') return undo();
    if (key === 'Escape') return setPicked(null);
    const el = mol.palette.find((p) => p.toUpperCase() === key);
    if (el && !outcome) addAtom(el);
  });

  // The answer, drawn the same way, once the step is over.
  const answerMol = run.molecules[i]?.result?.structure;
  const answerPos = useMemo(() => (answerMol ? relax(answerMol, [], size.w, 240) : []), [answerMol, size.w]);
  const heading = mol.task ?? (mol.name ? t('chem.buildName', { name: mol.name }) : '');

  return (
    <Board
      footer={
        outcome ? (
          <>
            <Feedback
              tone={outcome.o.correct ? 'good' : 'info'}
              title={outcome.o.correct ? t('chem.right') : t('chem.skipped')}
              detail={outcome.o.answer ? t('chem.moleculeWas', { name: String(outcome.o.answer) }) : null}
            />
            <PrimaryButton title={outcome.done ? t('result.see') : t('chem.next')} icon="arrow-forward" onPress={next} />
          </>
        ) : (
          <>
            {problem && <Feedback tone="bad" title={t('chem.wrong')} detail={problem} />}
            <View style={styles.row}>
              <SecondaryButton title={t('molecules.skip')} onPress={() => void check(true)} style={{ flex: 1 }} />
              <PrimaryButton title={t('molecules.check')} icon="checkmark" disabled={!m.atoms.length} busy={g.busy} onPress={() => void check()} style={{ flex: 2 }} />
            </View>
          </>
        )
      }>
      <StepHeader eyebrow={t('chem.step.molecule', { n: i + 1, total: run.molecules.length })} title={heading} chem />
      <View style={styles.row}>
        {!!mol.formula && <Chem style={styles.formula}>{mol.formula}</Chem>}
        {!mol.formula && !outcome && <Text style={styles.hint}>{t('chem.noFormula')}</Text>}
      </View>

      {outcome && answerMol ? (
        <Card style={{ alignItems: 'center' }}>
          <Text style={styles.eyebrow}>{t('chem.answer').toUpperCase()}</Text>
          <Structure mol={answerMol} pos={answerPos} size={{ w: size.w - 28, h: 240 }} label={(k) => answerMol.atoms[k]!} />
        </Card>
      ) : (
        <View style={styles.canvas}>
          <Structure
            mol={m}
            pos={pos}
            size={size}
            picked={picked}
            free={free}
            onAtom={tapAtom}
            label={(k) => t('molecules.atomA11y', { el: m.atoms[k], free: free[k] })}
          />
          {!m.atoms.length && (
            <View style={styles.empty} pointerEvents="none">
              <Ionicons name="git-network-outline" size={28} color={W.muted} />
              <Text style={styles.hint}>{t('molecules.empty')}</Text>
            </View>
          )}
        </View>
      )}

      {!outcome && (
        <>
          <View style={styles.tray} accessibilityLabel={t('chem.tray')}>
            {mol.palette.map((el) => (
              <Pressable
                key={el}
                onPress={() => addAtom(el)}
                accessibilityRole="button"
                accessibilityLabel={t('molecules.add', { el })}
                style={({ pressed }) => [styles.trayAtom, { borderColor: RING[el] ?? W.ink }, pressed && { backgroundColor: W.key }]}>
                <Text style={{ fontFamily: FONT, fontSize: 18, color: W.ink }}>{el}</Text>
                <Text style={styles.small}>{t('molecules.bonds', { count: valency(el) })}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.tools}>
            <Tool icon="arrow-undo" label={t('molecules.undo')} onPress={undo} disabled={!history.length} />
            <Tool icon="trash-outline" label={t('chem.remove')} onPress={removeAtom} disabled={picked === null} />
            <Tool icon="refresh" label={t('molecules.clear')} onPress={() => change({ atoms: [], bonds: [] })} disabled={!m.atoms.length} />
            {run.autoHydrogens !== false && (run.level ?? 1) >= 4 && (
              <Tool icon="add-circle-outline" label={t('chem.fillH')} onPress={fillHydrogens} disabled={!free.some((f, k) => f > 0 && m.atoms[k] !== 'H')} />
            )}
          </View>
          <Text style={styles.hint}>{picked !== null ? t('chem.pickedHint', { el: m.atoms[picked] }) : t('chem.bondHint')}</Text>
        </>
      )}
    </Board>
  );
}

function Tool({ icon, label, onPress, disabled }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [styles.tool, disabled && { opacity: 0.4 }, pressed && { backgroundColor: W.key }]}>
      <Ionicons name={icon} size={18} color={W.ink} />
      <Text style={styles.toolText}>{label}</Text>
    </Pressable>
  );
}

/** How-to example: ethene, C=C with four hydrogens. */
function HowTo() {
  const mol: Mol = { atoms: ['C', 'C', 'H', 'H', 'H', 'H'], bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [1, 4, 1], [1, 5, 1]] };
  const pos: [number, number][] = [[95, 60], [165, 60], [55, 25], [55, 95], [205, 25], [205, 95]];
  return (
    <View style={{ alignItems: 'center' }}>
      <Structure mol={mol} pos={pos} size={{ w: 260, h: 120 }} label={(k) => mol.atoms[k]!} />
      <Chem style={{ fontFamily: FONT, fontSize: 15, color: W.ink }}>C2H4</Chem>
    </View>
  );
}

defineGameFrame('molecule-builder', {
  HowTo,
  review: (run) =>
    (run as MoleculeBuilderRun).molecules.map((m) => ({
      key: String(m.id),
      correct: !!m.result?.correct,
      main: m.task ?? m.name ?? '',
      detail: m.result ? `${m.name ?? ''}${m.formula ? ` (${m.formula})` : ''}` : undefined,
    })),
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  formula: { fontFamily: FONT, fontSize: 18, color: W.inkSoft },
  canvas: { borderRadius: 16, borderWidth: 1, borderColor: W.line, backgroundColor: W.surface, alignSelf: 'center', overflow: 'hidden' },
  empty: { position: 'absolute', left: 24, right: 24, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 8 },
  hint: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: W.inkSoft, textAlign: 'center' },
  tray: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  trayAtom: { width: 64, height: 64, borderRadius: 32, borderWidth: 2.5, backgroundColor: W.surface, alignItems: 'center', justifyContent: 'center' },
  small: { fontFamily: Fonts.semibold, fontSize: 10, color: W.muted },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  tool: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: W.line, backgroundColor: W.surface },
  toolText: { fontFamily: Fonts.semibold, fontSize: 14, color: W.ink },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
});
