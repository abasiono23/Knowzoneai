import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, Line, RadialGradient, Stop, Circle } from 'react-native-svg';

import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { GameOutcome, MoleculeBuilderRun } from '@/lib/api';
import { ATOM_COLORS } from '@/lib/games/lab';
import type { LabGame } from '@/lib/games/use-lab-run';

import { BOLD, GoldButton, Panel } from '../hud';

type Bond = [number, number, number];

/** A glossy model-kit ball. */
function Atom({ el, size, ring, free }: { el: string; size: number; ring?: boolean; free?: number }) {
  const [light, dark] = ATOM_COLORS[el] ?? ['#BBBBBB', '#666666'];
  const id = `atom-${el}`;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="35%" cy="30%" r="70%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
            <Stop offset="0.25" stopColor={light} />
            <Stop offset="1" stopColor={dark} />
          </RadialGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 3}
          fill={`url(#${id})`}
          stroke={ring ? Colors.reward : 'rgba(0,0,0,0.3)'}
          strokeWidth={ring ? 3 : 1}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.atomLabel}>
          <Text
            style={{
              fontFamily: BOLD,
              fontSize: size * 0.32,
              color: el === 'H' || el === 'S' || el === 'F' ? '#1D2340' : '#fff',
            }}>
            {el}
          </Text>
        </View>
      </View>
      {free !== undefined && free > 0 && (
        <View style={styles.free}>
          <Text style={{ fontFamily: BOLD, fontSize: 10, color: '#3A2600' }}>{free}</Text>
        </View>
      )}
    </View>
  );
}

/** Where atom k sits on the board: the first in the middle, then rings around it. */
function spot(k: number, n: number, cx: number, cy: number, r: number): [number, number] {
  if (k === 0) return [cx, cy];
  const inner = Math.min(n - 1, 6);
  if (k <= inner) {
    const a = ((k - 1) / inner) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  }
  const outer = n - 1 - inner;
  const a = ((k - 1 - inner) / outer) * Math.PI * 2 - Math.PI / 2 + Math.PI / outer;
  return [cx + Math.cos(a) * r * 1.85, cy + Math.sin(a) * r * 1.85];
}

/**
 * Molecule Builder at the model-kit desk: add atoms from the tray, tap two atoms to bond them (tap
 * the pair again for a double, then a triple bond), and check the molecule.
 */
export function MoleculeDesk({ g, run }: { g: LabGame; run: MoleculeBuilderRun }) {
  const { t } = useTranslation('lab');
  const { width } = useWindowDimensions();
  const [i, setI] = useState(() => Math.min(run.at, run.molecules.length - 1));
  const mol = run.molecules[i]!;
  const [atoms, setAtoms] = useState<string[]>([]);
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [done, setDone] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const board = Math.min(width, 520) - Spacing.md * 2;
  const bh = Math.min(board, 330);
  const atomSize = atoms.length > 7 ? 40 : 50;
  const pos = atoms.map((_, k) => spot(k, atoms.length, board / 2, bh / 2, Math.min(board, bh) * 0.27));
  const used = atoms.map((_, k) => bonds.reduce((s, [a, b, o]) => s + (a === k || b === k ? o : 0), 0));

  const tapAtom = (k: number) => {
    if (outcome) return;
    setProblem(null);
    if (picked === null) return setPicked(k);
    if (picked === k) return setPicked(null);
    const [a, b] = [Math.min(picked, k), Math.max(picked, k)];
    const existing = bonds.findIndex(([x, y]) => x === a && y === b);
    if (existing < 0) setBonds([...bonds, [a, b, 1]]);
    else {
      const order = bonds[existing]![2];
      setBonds(
        order >= 3
          ? bonds.filter((_, i) => i !== existing)
          : bonds.map((bd, i) => (i === existing ? [a, b, order + 1] : bd)),
      );
    }
    g.buzz('tap');
    setPicked(null);
  };
  const addAtom = (el: string) => {
    if (outcome || atoms.length >= 12) return;
    g.buzz('tap');
    setAtoms([...atoms, el]);
  };
  const undo = () => {
    const last = atoms.length - 1;
    if (last < 0) return;
    setAtoms(atoms.slice(0, -1));
    setBonds(bonds.filter(([a, b]) => a !== last && b !== last));
    setPicked(null);
  };
  const reset = () => {
    setAtoms([]);
    setBonds([]);
    setPicked(null);
    setProblem(null);
  };
  const check = async (skip = false) => {
    const res = await g.answer(skip ? { step: i, timeout: true } : { step: i, atoms, bonds });
    if (!res) return;
    if (res.outcome.retry) {
      g.buzz('error');
      setProblem(t(`molecules.problems.${(res.outcome.problem ?? 'valency') as 'count' | 'valency' | 'disconnected'}`));
      if (res.done) void g.finish();
      return;
    }
    g.buzz(res.outcome.correct ? 'success' : 'tap');
    setOutcome(res.outcome);
    setDone(res.done);
  };

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={[styles.board, { width: board, height: bh }]}>
        <Svg width={board} height={bh} style={StyleSheet.absoluteFill}>
          {bonds.map(([a, b, order], i) => {
            const [x1, y1] = pos[a]!;
            const [x2, y2] = pos[b]!;
            const len = Math.hypot(x2 - x1, y2 - y1) || 1;
            const nx = (-(y2 - y1) / len) * 6;
            const ny = ((x2 - x1) / len) * 6;
            const offsets = order === 1 ? [0] : order === 2 ? [-0.5, 0.5] : [-1, 0, 1];
            return offsets.map((o) => (
              <Line
                key={`${i}-${o}`}
                x1={x1 + nx * o}
                y1={y1 + ny * o}
                x2={x2 + nx * o}
                y2={y2 + ny * o}
                stroke="#E8ECF5"
                strokeWidth={5}
                strokeLinecap="round"
              />
            ));
          })}
        </Svg>
        {atoms.map((el, k) => (
          <Animated.View
            key={k}
            entering={ZoomIn.springify()}
            style={{ position: 'absolute', left: pos[k]![0] - atomSize / 2, top: pos[k]![1] - atomSize / 2 }}>
            <Pressable
              onPress={() => tapAtom(k)}
              accessibilityRole="button"
              accessibilityLabel={t('molecules.atomA11y', { el, free: (run.valency[el] ?? 0) - used[k]! })}>
              <Atom el={el} size={atomSize} ring={picked === k} free={(run.valency[el] ?? 0) - used[k]!} />
            </Pressable>
          </Animated.View>
        ))}
        {!atoms.length && <Text style={styles.empty}>{t('molecules.empty')}</Text>}
      </View>

      <SafeAreaView edges={['bottom']} style={{ gap: Spacing.sm }} pointerEvents="box-none">
        {problem && (
          <Panel style={{ borderColor: Colors.danger }}>
            <Text style={{ color: '#FF8FA6', fontFamily: BOLD }}>{problem}</Text>
          </Panel>
        )}
        {outcome ? (
          <Animated.View entering={FadeInDown}>
            <Panel style={{ gap: Spacing.sm, borderColor: outcome.correct ? Colors.success : Colors.textMuted }}>
              <Text style={{ fontFamily: BOLD, fontSize: 18, color: outcome.correct ? Colors.success : '#fff' }}>
                {outcome.correct ? t('molecules.right', { name: mol.name }) : t('molecules.skipped')}
              </Text>
              <GoldButton
                title={done ? t('result.see') : t('molecules.next')}
                icon="arrow-forward"
                onPress={() => {
                  if (done) void g.finish();
                  else {
                    setOutcome(null);
                    reset();
                    setI(i + 1);
                  }
                }}
              />
            </Panel>
          </Animated.View>
        ) : (
          <>
            <Panel style={styles.tray}>
              {mol.palette.map((el) => (
                <Pressable
                  key={el}
                  onPress={() => addAtom(el)}
                  accessibilityRole="button"
                  accessibilityLabel={t('molecules.add', { el })}>
                  <Atom el={el} size={48} />
                  <Text style={{ textAlign: 'center', fontSize: 10, color: 'rgba(235,238,255,0.8)' }}>
                    {t('molecules.bonds', { count: run.valency[el] ?? 0 })}
                  </Text>
                </Pressable>
              ))}
            </Panel>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <Pressable onPress={undo} accessibilityRole="button" style={styles.small}>
                <Text style={{ color: '#fff' }}>{t('molecules.undo')}</Text>
              </Pressable>
              <Pressable onPress={reset} accessibilityRole="button" style={styles.small}>
                <Text style={{ color: '#fff' }}>{t('molecules.clear')}</Text>
              </Pressable>
              <Pressable onPress={() => void check(true)} accessibilityRole="button" style={styles.small}>
                <Text style={{ color: 'rgba(235,238,255,0.8)' }}>{t('molecules.skip')}</Text>
              </Pressable>
              <View style={{ flex: 1 }}>
                <GoldButton
                  title={t('molecules.check')}
                  icon="checkmark"
                  disabled={!atoms.length || g.busy}
                  onPress={() => void check()}
                />
              </View>
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    bottom: 12,
    top: 190,
    justifyContent: 'space-between',
  },
  board: {
    alignSelf: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(14,18,44,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  empty: { position: 'absolute', top: '45%', left: 0, right: 0, textAlign: 'center', color: 'rgba(235,238,255,0.75)' },
  atomLabel: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  free: {
    position: 'absolute',
    right: -2,
    top: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.reward,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tray: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  small: {
    height: 54,
    paddingHorizontal: 12,
    borderRadius: 999,
    justifyContent: 'center',
    backgroundColor: 'rgba(14,18,44,0.82)',
  },
});
