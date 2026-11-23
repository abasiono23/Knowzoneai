import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Feedback, FONT, PrimaryButton, Stat, StatusRow, TimerStat, useCountdown, W } from '@/components/games/ui';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { GameOutcome, ReactionRushRun } from '@/lib/api';
import { useKeys, useRelaxed } from '@/lib/games/english';
import { atomsOf, sub } from '@/lib/games/lab';
import type { LabGame } from '@/lib/games/use-lab-run';

import { defineGameFrame } from '../contract';
import type { CoverMap } from '../station';
import { Board, Card, Chem, optionIndex, Options, StepHeader } from './kit';

/** A species' charge from "Fe^3+" / "e^-" (0 when none). */
function chargeOf(species: string) {
  const m = /\^(\d*)([+-])$/.exec(species);
  return m ? (m[1] ? Number(m[1]) : 1) * (m[2] === '+' ? 1 : -1) : 0;
}
const atoms = (species: string) => (species === 'e^-' ? {} : atomsOf(species.split('^')[0]!.replace(/[[\]]/g, (b) => (b === '[' ? '(' : ')'))));

/**
 * Reaction Rush: balance equations (ionic ones too, from level 6), say what forms, and work out
 * calculations against the clock; right answers in a row build a combo. With "Question timer" off
 * (relaxed mode) there is no clock.
 */
export function RushBoard({ g, run, paused }: { g: LabGame; run: ReactionRushRun; map?: CoverMap; paused?: boolean }) {
  const { t } = useTranslation('lab');
  const { relaxed } = useRelaxed();
  const at = Math.min(run.at, run.tasks.length - 1);
  const task = run.tasks[at]!;
  const species = task.type === 'balance' ? [...task.reactants, ...task.products] : [];
  const [coeffs, setCoeffs] = useState<number[]>(() => species.map(() => 1));
  const [choice, setChoice] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<{ o: GameOutcome; done: boolean } | null>(null);
  const [combo, setCombo] = useState(0);
  const finished = run.at >= run.tasks.length;
  const left = useCountdown(run.seconds, !relaxed && !paused && !finished && run.status === 'playing', () => void g.finish(0), run.id);

  const advance = (done: boolean) => {
    if (done) return void g.finish(relaxed ? undefined : left);
    setOutcome(null);
    setChoice(null);
    const n = run.tasks[at + 1];
    setCoeffs(n?.type === 'balance' ? [...n.reactants, ...n.products].map(() => 1) : []);
  };
  const submit = async (picked?: string) => {
    if (outcome || g.busy) return;
    const c = picked ?? choice;
    if (task.type !== 'balance' && !c) return;
    const res = await g.answer(task.type === 'balance' ? { step: at, coefficients: coeffs } : { step: at, choice: c! });
    if (!res) return;
    setOutcome({ o: res.outcome, done: res.done });
    setCombo(res.outcome.combo ?? 0);
    g.buzz(res.outcome.correct ? 'success' : 'error');
    // Right answers move on by themselves; wrong ones wait so the answer (and working) can be read.
    if (res.outcome.correct) setTimeout(() => advance(res.done), 900);
  };
  const bump = (k: number, d: number) => !outcome && setCoeffs(coeffs.map((c, j) => (j === k ? Math.min(30, Math.max(1, c + d)) : c)));

  useKeys((key) => {
    if (key === 'Enter') return outcome ? (!outcome.o.correct ? advance(outcome.done) : undefined) : void submit();
    if (task.type !== 'balance' && !outcome) {
      const k = optionIndex(key);
      if (k >= 0 && k < task.options.length) setChoice(task.options[k]!);
    }
  });

  // Live count of each element (and the charge) on both sides.
  const tally =
    task.type === 'balance'
      ? (() => {
          const side = (list: string[], offset: number) => {
            const out: Record<string, number> = {};
            list.forEach((f, k) => {
              for (const [el, n] of Object.entries(atoms(f))) out[el] = (out[el] ?? 0) + n * (coeffs[offset + k] ?? 1);
              out['±'] = (out['±'] ?? 0) + chargeOf(f) * (coeffs[offset + k] ?? 1);
            });
            return out;
          };
          const l = side(task.reactants, 0);
          const r = side(task.products, task.reactants.length);
          const ionic = species.some((s) => chargeOf(s) !== 0);
          return [...new Set([...Object.keys(l), ...Object.keys(r)])]
            .filter((el) => el !== '±' || ionic)
            .map((el) => ({ el, l: l[el] ?? 0, r: r[el] ?? 0 }));
        })()
      : [];
  const answer = outcome?.o.answer;

  return (
    <View style={{ flex: 1 }}>
      <StatusRow>
        <TimerStat seconds={left} relaxed={relaxed} />
        <Stat icon="trophy-outline" text={t('chem.points', { count: run.score })} />
        {combo > 1 ? <Stat icon="flame" text={`×${combo}`} label={t('chem.combo', { count: combo })} tone="good" /> : <View />}
      </StatusRow>
      <Board
        footer={
          outcome && !outcome.o.correct ? (
            <>
              <Feedback
                tone="bad"
                title={t('chem.wrong')}
                detail={
                  task.type === 'balance'
                    ? t('chem.balancedIs', { equation: sub(eq(task.reactants, task.products, answer as number[])) })
                    : t('chem.answerWas', { answer: sub(String(answer)) })
                }
              />
              <PrimaryButton title={outcome.done ? t('result.see') : t('chem.next')} icon="arrow-forward" onPress={() => advance(outcome.done)} />
            </>
          ) : outcome ? (
            <Feedback tone="good" title={t('chem.right')} detail={t('chem.plusPoints', { count: outcome.o.points })} />
          ) : (
            <PrimaryButton
              title={task.type === 'balance' ? t('rush.submit') : t('chem.answer')}
              icon="checkmark"
              disabled={task.type !== 'balance' && !choice}
              busy={g.busy}
              onPress={() => void submit()}
            />
          )
        }>
        <StepHeader
          eyebrow={`${t(`chem.rush.${task.type}`)} · ${t('chem.step.rush', { n: at + 1, total: run.tasks.length })}`}
        />
        {task.type === 'balance' ? (
          <>
            <Card style={{ paddingVertical: 18 }}>
              <View style={styles.equation}>
                {species.map((f, k) => (
                  <View key={k} style={styles.term}>
                    {k === task.reactants.length && <Text style={styles.arrow}>→</Text>}
                    {k > 0 && k !== task.reactants.length && <Text style={styles.plus}>+</Text>}
                    <View style={styles.stepper}>
                      <Pressable onPress={() => bump(k, 1)} accessibilityRole="button" accessibilityLabel={t('rush.more', { formula: sub(f) })} style={styles.stepBtn} hitSlop={2}>
                        <Ionicons name="add" size={18} color={W.ink} />
                      </Pressable>
                      <Text
                        style={[styles.coeff, outcome && { color: outcome.o.correct ? W.correct : W.wrong }]}
                        accessibilityLabel={t('chem.coefficientA11y', { formula: sub(f), count: coeffs[k] })}>
                        {coeffs[k]}
                      </Text>
                      <Pressable onPress={() => bump(k, -1)} accessibilityRole="button" accessibilityLabel={t('rush.less', { formula: sub(f) })} style={styles.stepBtn} hitSlop={2}>
                        <Ionicons name="remove" size={18} color={W.ink} />
                      </Pressable>
                    </View>
                    <Chem style={styles.species}>{f}</Chem>
                  </View>
                ))}
              </View>
            </Card>
            <Card>
              <Text style={styles.eyebrow}>{t('chem.tally').toUpperCase()}</Text>
              <View style={styles.tally}>
                {tally.map(({ el, l, r }) => (
                  <View
                    key={el}
                    style={[styles.tallyItem, { borderColor: l === r ? W.correct : W.lineStrong }]}
                    accessible
                    accessibilityLabel={el === '±' ? t('chem.chargeA11y', { left: l, right: r }) : t('rush.tallyA11y', { el, left: l, right: r })}>
                    <Text style={styles.tallyEl}>{el === '±' ? t('chem.charge') : el}</Text>
                    <Text style={styles.tallyNum}>
                      {l} | {r}
                    </Text>
                    <Ionicons name={l === r ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={l === r ? W.correct : W.muted} />
                  </View>
                ))}
              </View>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <Chem style={styles.prompt}>{task.type === 'complete' ? `${task.reactants} ?` : task.prompt}</Chem>
            </Card>
            <Options
              options={task.options}
              disabled={!!outcome}
              onPick={(o) => setChoice(o)}
              state={(o) => (outcome ? (o === answer ? 'correct' : o === choice ? 'wrong' : 'idle') : o === choice ? 'selected' : 'idle')}
            />
            {outcome && !outcome.o.correct && !!outcome.o.working && (
              <Card>
                <Text style={styles.eyebrow}>{t('chem.working').toUpperCase()}</Text>
                <Chem style={styles.working}>{outcome.o.working}</Chem>
              </Card>
            )}
          </>
        )}
      </Board>
    </View>
  );
}

const eq = (reactants: string[], products: string[], c: number[] = []) => {
  const side = (list: string[], o: number) => list.map((s, k) => `${(c[o + k] ?? 1) === 1 ? '' : c[o + k]}${s}`).join(' + ');
  return `${side(reactants, 0)} → ${side(products, reactants.length)}`;
};

function HowTo() {
  return (
    <View style={{ gap: 8, alignItems: 'center' }}>
      <Chem style={{ fontFamily: FONT, fontSize: 20, color: W.ink }}>2H2 + O2 → 2H2O</Chem>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[
          ['H', '4 | 4'],
          ['O', '2 | 2'],
        ].map(([el, n]) => (
          <View key={el} style={[styles.tallyItem, { borderColor: W.correct }]}>
            <Text style={styles.tallyEl}>{el}</Text>
            <Text style={styles.tallyNum}>{n}</Text>
            <Ionicons name="checkmark-circle" size={16} color={W.correct} />
          </View>
        ))}
      </View>
    </View>
  );
}

defineGameFrame('reaction-rush', {
  HowTo,
  hearts: false,
  review: (run) =>
    (run as ReactionRushRun).tasks.map((tk) => ({
      key: String(tk.id),
      correct: !!tk.result?.correct,
      main: sub(tk.type === 'balance' ? eq(tk.reactants, tk.products) : tk.type === 'complete' ? `${tk.reactants} ?` : tk.prompt),
      detail: tk.result
        ? sub(tk.type === 'balance' ? eq(tk.reactants, tk.products, tk.result.answer) : String(tk.result.answer))
        : undefined,
    })),
});

const styles = StyleSheet.create({
  equation: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', rowGap: 12, columnGap: 6 },
  term: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  arrow: { fontFamily: FONT, fontSize: 22, color: W.ink, marginHorizontal: 4 },
  plus: { fontFamily: FONT, fontSize: 20, color: W.inkSoft },
  stepper: { alignItems: 'center', borderRadius: 10, borderWidth: 1.5, borderColor: W.lineStrong, backgroundColor: W.page },
  stepBtn: { width: 44, height: 32, alignItems: 'center', justifyContent: 'center' },
  coeff: { fontFamily: FONT, fontSize: 20, color: W.focus, minWidth: 28, textAlign: 'center' },
  species: { fontFamily: FONT, fontSize: 22, color: W.ink },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  tally: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tallyItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, minHeight: 36, borderRadius: 10, borderWidth: 1.5, backgroundColor: W.surface },
  tallyEl: { fontFamily: FONT, fontSize: 14, color: W.ink },
  tallyNum: { fontFamily: Fonts.semibold, fontSize: 14, color: W.inkSoft, fontVariant: ['tabular-nums'] },
  prompt: { fontFamily: Fonts.semibold, fontSize: 18, lineHeight: 27, color: W.ink },
  working: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: W.ink },
});
