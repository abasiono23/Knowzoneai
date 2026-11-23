import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Feedback, FONT, PrimaryButton, W } from '@/components/games/ui';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { GameOutcome, LabTest, MysterySubstanceRun } from '@/lib/api';
import { useKeys } from '@/lib/games/english';
import type { CoverMap } from '@/lib/games/lab';
import type { LabGame } from '@/lib/games/use-lab-run';

import { defineGameFrame } from '../contract';
import { Board, Card, Chem, FadeInView, GlassFigure, optionIndex, Options, StepHeader } from './kit';

const LIQUID: [RegExp, string][] = [
  [/^Blue|pale blue/i, '#9FD3FA'],
  [/green/i, '#CFE8C6'],
  [/yellow|brown/i, '#E9C88A'],
  [/purple|violet/i, '#C9A6E0'],
  [/pink/i, '#F4C6D7'],
];
const liquidOf = (appearance: string) => LIQUID.find(([re]) => re.test(appearance))?.[1] ?? '#EEF5FC';

/**
 * Mystery Substance: an unknown in a test tube. Run tests (each result goes in your notebook), then say
 * which suspect it is. Fewer tests score more; from level 8 you may only run a few tests per unknown.
 */
export function MysteryBench({ g, run }: { g: LabGame; run: MysterySubstanceRun; map?: CoverMap }) {
  const { t } = useTranslation('lab');
  const [i, setI] = useState(() => Math.min(run.at, run.cases.length - 1));
  const c = run.cases[i]!;
  const [choice, setChoice] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<{ o: GameOutcome; done: boolean } | null>(null);
  const ran = Object.keys(c.results) as LabTest[];
  const max = run.maxTests ?? 0;
  const out = !!max && ran.length >= max;

  const runTest = async (test: LabTest) => {
    if (outcome || ran.includes(test) || out || g.busy) return;
    g.buzz('tap');
    await g.answer({ step: i, test });
  };
  const identify = async () => {
    if (!choice || outcome || g.busy) return;
    const res = await g.answer({ step: i, choice });
    if (!res) return;
    setOutcome({ o: res.outcome, done: res.done });
    g.buzz(res.outcome.correct ? 'success' : 'error');
  };
  const next = () => {
    if (!outcome) return;
    if (outcome.done) return void g.finish();
    setOutcome(null);
    setChoice(null);
    setI(i + 1);
  };
  useKeys((key) => {
    if (key === 'Enter') return outcome ? next() : void identify();
    const k = optionIndex(key);
    if (!outcome && k >= 0 && k < c.suspects.length) setChoice(c.suspects[k]!);
  });

  return (
    <Board
      footer={
        outcome ? (
          <>
            <Feedback
              tone={outcome.o.correct ? 'good' : 'bad'}
              title={outcome.o.correct ? t('chem.solved', { points: outcome.o.points }) : t('chem.wrong')}
              detail={outcome.o.correct ? null : t('chem.answerWas', { answer: String(outcome.o.answer ?? '') })}
            />
            <PrimaryButton title={outcome.done ? t('result.see') : t('mystery.next')} icon="arrow-forward" onPress={next} />
          </>
        ) : (
          <PrimaryButton title={t('mystery.identify')} icon="search" disabled={!choice} busy={g.busy} onPress={() => void identify()} />
        )
      }>
      <StepHeader eyebrow={t('chem.step.mystery', { n: i + 1, total: run.cases.length })} title={t('mystery.which')} />

      <Card style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
        <GlassFigure kind="tube" height={110} fill={0.62} liquid={liquidOf(c.appearance)} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.eyebrow}>{t('chem.unknown').toUpperCase()}</Text>
          <Text style={styles.appearance}>{c.appearance}</Text>
          {!!max && (
            <View style={styles.budget} accessible accessibilityLabel={t('chem.testsLeft', { count: max - ran.length, max })}>
              {Array.from({ length: max }, (_, k) => (
                <Ionicons key={k} name={k < ran.length ? 'flask' : 'flask-outline'} size={16} color={k < ran.length ? W.muted : W.ink} />
              ))}
              <Text style={styles.budgetText}>{t('chem.testsLeft', { count: max - ran.length, max })}</Text>
            </View>
          )}
        </View>
      </Card>

      <View style={{ gap: 8 }}>
        <Text style={styles.eyebrow}>{t('chem.tests').toUpperCase()}</Text>
        <View style={styles.tests}>
          {run.tests.map((test) => {
            const used = ran.includes(test);
            const disabled = !!outcome || used || out;
            return (
              <Pressable
                key={test}
                disabled={disabled}
                onPress={() => void runTest(test)}
                accessibilityRole="button"
                accessibilityState={{ disabled }}
                accessibilityLabel={used ? `${t(`mystery.tests.${test}`)}: ${c.results[test]}` : t('mystery.run', { test: t(`mystery.tests.${test}`) })}
                style={({ pressed }) => [styles.test, used && styles.testUsed, disabled && !used && { opacity: 0.4 }, pressed && { backgroundColor: W.key }]}>
                <Ionicons name={used ? 'checkmark-circle' : 'flask-outline'} size={16} color={used ? W.correct : W.ink} />
                <Chem style={styles.testText} numberOfLines={2}>
                  {t(`mystery.tests.${test}`)}
                </Chem>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Card>
        <Text style={styles.eyebrow}>{t('mystery.notebook')}</Text>
        {ran.length ? (
          ran.map((test) => (
            <FadeInView key={test} style={styles.noteRow}>
              <Chem style={styles.noteTest}>{t(`mystery.tests.${test}`)}</Chem>
              <Chem style={styles.noteResult}>{c.results[test] ?? ''}</Chem>
            </FadeInView>
          ))
        ) : (
          <Text style={styles.hint}>{t('chem.notebookEmpty')}</Text>
        )}
        {outcome &&
          c.result?.all &&
          (Object.entries(c.result.all) as [LabTest, string][])
            .filter(([test]) => !ran.includes(test))
            .map(([test, r]) => (
              <View key={test} style={[styles.noteRow, { opacity: 0.7 }]}>
                <Chem style={styles.noteTest}>{t(`mystery.tests.${test}`)}</Chem>
                <Chem style={styles.noteResult}>{r}</Chem>
              </View>
            ))}
      </Card>

      <Text style={styles.eyebrow}>{t('chem.suspects').toUpperCase()}</Text>
      <Options
        options={c.suspects}
        disabled={!!outcome}
        onPick={setChoice}
        state={(o) => (outcome ? (o === outcome.o.answer ? 'correct' : o === choice ? 'wrong' : 'idle') : o === choice ? 'selected' : 'idle')}
      />
    </Board>
  );
}

function HowTo() {
  const { t } = useTranslation('lab');
  return (
    <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center', justifyContent: 'center' }}>
      <GlassFigure kind="tube" height={110} fill={0.62} />
      <View style={{ gap: 4, flexShrink: 1 }}>
        <Text style={{ fontFamily: Fonts.semibold, fontSize: 14, color: W.inkSoft }}>{t('mystery.tests.litmus')} → Blue litmus turns red</Text>
        <Text style={{ fontFamily: Fonts.semibold, fontSize: 14, color: W.inkSoft }}>{t('mystery.tests.mg')} → Fizzes; gas pops</Text>
        <Text style={{ fontFamily: FONT, fontSize: 15, color: W.correct }}>Dilute hydrochloric acid</Text>
      </View>
    </View>
  );
}

defineGameFrame('mystery-substance', {
  HowTo,
  review: (run) =>
    (run as MysterySubstanceRun).cases.map((c) => ({
      key: String(c.id),
      correct: !!c.result?.correct,
      main: c.appearance,
      detail: c.result?.answer,
    })),
});

const styles = StyleSheet.create({
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  appearance: { fontFamily: Fonts.bold, fontSize: 17, lineHeight: 23, color: W.ink },
  budget: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  budgetText: { fontFamily: Fonts.semibold, fontSize: 13, color: W.inkSoft, marginLeft: 4 },
  tests: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  test: { minHeight: 44, flexBasis: 150, flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, borderColor: W.lineStrong, backgroundColor: W.surface },
  testUsed: { borderColor: W.correct, backgroundColor: W.correctSoft },
  testText: { flex: 1, fontFamily: Fonts.semibold, fontSize: 14, color: W.ink },
  noteRow: { flexDirection: 'row', gap: 10, paddingVertical: 6, borderTopWidth: 1, borderTopColor: W.line },
  noteTest: { width: 130, fontFamily: Fonts.bold, fontSize: 14, color: W.ink },
  noteResult: { flex: 1, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: W.ink },
  hint: { fontFamily: Fonts.regular, fontSize: 14, color: W.inkSoft },
});
