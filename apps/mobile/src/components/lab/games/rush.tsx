import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { useCountdown } from '@/components/games/ui';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { GameOutcome, ReactionRushRun } from '@/lib/api';
import { atomsOf, sub } from '@/lib/games/lab';
import type { LabGame } from '@/lib/games/use-lab-run';

import { BOLD, Choice, GoldButton, Panel } from '../hud';
import type { CoverMap } from '../station';

const INK = '#1D2340';

/**
 * Reaction Rush at the whiteboard: balance equations (and complete reactions) before the clock
 * runs out. Each right answer in a row adds to the combo.
 */
export function RushBoard({ g, run, map }: { g: LabGame; run: ReactionRushRun; map: CoverMap }) {
  const { t } = useTranslation('lab');
  const task = run.tasks[Math.min(run.at, run.tasks.length - 1)]!;
  const species = task.type === 'balance' ? [...task.reactants, ...task.products] : [];
  const [coeffs, setCoeffs] = useState<number[]>(() => species.map(() => 1));
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [combo, setCombo] = useState(0);
  const finished = run.at >= run.tasks.length;
  const left = useCountdown(run.seconds, !finished && run.status === 'playing', () => void g.finish(0), run.id);

  const next = (res: { outcome: GameOutcome; done: boolean }) => {
    setOutcome(res.outcome);
    setCombo(res.outcome.combo ?? 0);
    g.buzz(res.outcome.correct ? 'success' : 'error');
    setTimeout(() => {
      if (res.done) {
        void g.finish(left);
        return;
      }
      setOutcome(null);
      const n = run.tasks[run.at + 1];
      setCoeffs(n?.type === 'balance' ? [...n.reactants, ...n.products].map(() => 1) : []);
    }, 1100);
  };
  const submit = async (choice?: string) => {
    if (outcome || g.busy) return;
    const res = await g.answer(
      task.type === 'balance' ? { step: run.at, coefficients: coeffs } : { step: run.at, choice },
    );
    if (res) next(res);
  };

  // Live atom count on each side.
  const tally =
    task.type === 'balance'
      ? (() => {
          const side = (list: string[], offset: number) => {
            const out: Record<string, number> = {};
            list.forEach((f, k) => {
              for (const [el, n] of Object.entries(atomsOf(f)))
                out[el] = (out[el] ?? 0) + n * (coeffs[offset + k] ?? 1);
            });
            return out;
          };
          const l = side(task.reactants, 0);
          const r = side(task.products, task.reactants.length);
          return [...new Set([...Object.keys(l), ...Object.keys(r)])].map((el) => ({
            el,
            l: l[el] ?? 0,
            r: r[el] ?? 0,
          }));
        })()
      : [];

  const boardTop = map.y(0.2);
  const boardLeft = map.x(0.06);
  const boardWidth = map.x(0.94) - boardLeft;

  return (
    <>
      <View style={[styles.hud, { top: boardTop + 8 }]} pointerEvents="none">
        <View style={styles.timer}>
          <LinearGradient
            colors={left <= 10 ? ['#FF4D6D', '#FF9F43'] : ['#FFC857', '#FF7A3D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: '100%', width: `${(left / run.seconds) * 100}%`, borderRadius: 999 }}
          />
          <Text style={styles.time}>{`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`}</Text>
        </View>
        {combo > 1 && (
          <Animated.View key={combo} entering={ZoomIn} style={styles.combo}>
            <Ionicons name="flame" size={16} color="#FF9F43" />
            <Text style={{ fontFamily: BOLD, color: '#fff' }}>x{combo}</Text>
          </Animated.View>
        )}
        <View style={styles.combo}>
          <Text style={{ fontFamily: BOLD, color: Colors.reward }}>{run.score}</Text>
        </View>
      </View>

      <View style={[styles.board, { top: boardTop + 48, left: boardLeft + 8, width: boardWidth - 16 }]}>
        <Text style={{ fontFamily: BOLD, fontSize: 13, color: '#6E76A8' }}>
          {task.type === 'balance' ? t('rush.balance') : t('rush.complete')} ·{' '}
          {t('rush.taskOf', { n: Math.min(run.at + 1, run.tasks.length), total: run.tasks.length })}
        </Text>
        {task.type === 'balance' ? (
          <View style={styles.equation}>
            {species.map((f, k) => (
              <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                {k === task.reactants.length && <Text style={styles.ink}>→</Text>}
                {k > 0 && k !== task.reactants.length && <Text style={styles.ink}>+</Text>}
                <View style={{ alignItems: 'center' }}>
                  <Pressable
                    onPress={() => !outcome && setCoeffs(coeffs.map((c, j) => (j === k ? Math.min(20, c + 1) : c)))}
                    accessibilityRole="button"
                    accessibilityLabel={t('rush.more', { formula: f })}
                    hitSlop={6}>
                    <Ionicons name="chevron-up" size={18} color="#4B36D6" />
                  </Pressable>
                  <View
                    style={[
                      styles.coeff,
                      outcome && { borderColor: outcome.correct ? Colors.success : Colors.danger },
                    ]}>
                    <Text style={{ fontFamily: BOLD, fontSize: 20, color: '#4B36D6' }}>{coeffs[k]}</Text>
                  </View>
                  <Pressable
                    onPress={() => !outcome && setCoeffs(coeffs.map((c, j) => (j === k ? Math.max(1, c - 1) : c)))}
                    accessibilityRole="button"
                    accessibilityLabel={t('rush.less', { formula: f })}
                    hitSlop={6}>
                    <Ionicons name="chevron-down" size={18} color="#4B36D6" />
                  </Pressable>
                </View>
                <Text style={styles.ink}>{sub(f)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.ink, { fontSize: 26, marginVertical: Spacing.md }]}>{sub(task.reactants)} ?</Text>
        )}
        {outcome && (
          <Animated.View entering={FadeIn} style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: BOLD, fontSize: 20, color: outcome.correct ? '#0E9F6E' : '#D63151' }}>
              {outcome.correct ? t('rush.right', { points: outcome.points }) : t('rush.wrong')}
            </Text>
          </Animated.View>
        )}
      </View>

      <View style={[styles.below, { top: map.y(0.66) }]} pointerEvents="box-none">
        {task.type === 'balance' ? (
          <>
            <Panel style={styles.tally}>
              {tally.map(({ el, l, r }) => (
                <View
                  key={el}
                  style={styles.tallyRow}
                  accessibilityLabel={t('rush.tallyA11y', { el, left: l, right: r })}>
                  <Text style={{ fontFamily: BOLD, color: '#fff', width: 28 }}>{el}</Text>
                  <Text style={{ color: '#fff' }}>
                    {l} | {r}
                  </Text>
                  <Ionicons
                    name={l === r ? 'checkmark-circle' : 'close-circle'}
                    size={16}
                    color={l === r ? Colors.success : '#FF8FA6'}
                  />
                </View>
              ))}
            </Panel>
            <GoldButton
              title={t('rush.submit')}
              icon="scale"
              disabled={!!outcome || g.busy}
              onPress={() => void submit()}
            />
          </>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {task.options.map((o) => (
              <Choice key={o} label={o} disabled={!!outcome} onPress={() => void submit(o)} />
            ))}
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  hud: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timer: {
    flex: 1,
    height: 30,
    borderRadius: 999,
    backgroundColor: 'rgba(14,18,44,0.82)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  time: { position: 'absolute', alignSelf: 'center', fontFamily: BOLD, color: '#fff' },
  combo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 999,
    backgroundColor: 'rgba(14,18,44,0.82)',
  },
  board: { position: 'absolute', alignItems: 'center', gap: Spacing.xs, paddingTop: Spacing.sm },
  equation: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginVertical: Spacing.sm,
  },
  ink: { fontFamily: BOLD, fontSize: 24, color: INK },
  coeff: {
    minWidth: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#7C5CFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,92,255,0.08)',
  },
  below: { position: 'absolute', left: Spacing.md, right: Spacing.md, gap: Spacing.sm },
  tally: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, justifyContent: 'center' },
  tallyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
