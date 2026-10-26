import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { GameOutcome, LabTest, MysterySubstanceRun } from '@/lib/api';
import { sub, TEST_ART } from '@/lib/games/lab';
import type { LabGame } from '@/lib/games/use-lab-run';

import { Glass } from '../glass';
import { BOLD, Choice, GoldButton, ItemPicture, Panel } from '../hud';
import type { CoverMap } from '../station';

const LIQUID: [RegExp, string][] = [
  [/^Blue/i, '#3BA4F6'],
  [/green/i, '#B9DDB0'],
  [/yellow-brown/i, '#D99A2B'],
];
const liquidOf = (appearance: string) => LIQUID.find(([re]) => re.test(appearance))?.[1] ?? '#EAF4FF';
/** Reagent tests are dropper bottles with the formula on them. */
const TEST_LABEL: Partial<Record<LabTest, string>> = { agno3: 'AgNO3', naoh: 'NaOH', bacl2: 'BaCl2' };

/**
 * Mystery Substance at the workbench: run tests on the unknown liquid (each result goes in your
 * notebook), then identify it. Using fewer tests scores more.
 */
export function MysteryBench({ g, run, map }: { g: LabGame; run: MysterySubstanceRun; map: CoverMap }) {
  const { t } = useTranslation('lab');
  const [i, setI] = useState(() => Math.min(run.at, run.cases.length - 1));
  const c = run.cases[i]!;
  const [choice, setChoice] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [done, setDone] = useState(false);
  const ran = Object.keys(c.results) as LabTest[];

  const runTest = async (test: LabTest) => {
    if (outcome || ran.includes(test) || g.busy) return;
    g.buzz('tap');
    await g.answer({ step: i, test });
  };
  const identify = async () => {
    if (!choice) return;
    const res = await g.answer({ step: i, choice });
    if (!res) return;
    setOutcome(res.outcome);
    setDone(res.done);
    g.buzz(res.outcome.correct ? 'success' : 'error');
  };

  const tubeH = 0.18 * map.dh;
  return (
    <>
      <View
        style={{ position: 'absolute', left: map.x(0.5) - (tubeH * 100) / 160 / 2, top: map.y(0.42) - tubeH }}
        pointerEvents="none">
        <Glass
          kind="tube"
          height={tubeH}
          level={0.7}
          from={liquidOf(c.appearance)}
          to={liquidOf(c.appearance)}
          reacted={false}
        />
        <View style={styles.question}>
          <Text style={{ fontFamily: BOLD, fontSize: 30, color: '#fff' }}>?</Text>
        </View>
      </View>
      <SafeAreaView edges={['bottom']} style={styles.bottom} pointerEvents="box-none">
        <ScrollView contentContainerStyle={{ gap: Spacing.sm }} style={{ maxHeight: 520 }}>
          <Panel style={{ gap: 4 }}>
            <Text style={{ fontFamily: BOLD, color: Colors.reward, fontSize: 12 }}>{t('mystery.notebook')}</Text>
            <Text style={{ color: '#fff' }}>• {c.appearance}</Text>
            {ran.map((test) => (
              <Animated.Text key={test} entering={FadeInRight} style={{ color: '#fff' }}>
                • {t(`mystery.tests.${test}`)}:{' '}
                <Text style={{ fontFamily: BOLD, color: '#fff' }}>{c.results[test]}</Text>
              </Animated.Text>
            ))}
          </Panel>
          {!outcome && (
            <View style={styles.kit}>
              {run.tests.map((test) => {
                const used = ran.includes(test);
                return (
                  <Pressable
                    key={test}
                    disabled={used}
                    onPress={() => void runTest(test)}
                    accessibilityRole="button"
                    accessibilityLabel={t('mystery.run', { test: t(`mystery.tests.${test}`) })}
                    style={[styles.test, used && { opacity: 0.35 }]}>
                    <ItemPicture art={TEST_ART[test]} height={44} label={TEST_LABEL[test]} />
                    <Text numberOfLines={1} style={{ fontSize: 11, color: '#fff' }}>
                      {TEST_LABEL[test] ? sub(TEST_LABEL[test]!) : t(`mystery.tests.${test}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          {outcome ? (
            <Animated.View entering={FadeInDown}>
              <Panel style={{ gap: Spacing.sm, borderColor: outcome.correct ? Colors.success : Colors.danger }}>
                <Text style={{ fontFamily: BOLD, fontSize: 18, color: outcome.correct ? Colors.success : '#FF8FA6' }}>
                  {outcome.correct
                    ? t('mystery.right', { points: outcome.points })
                    : t('mystery.wrong', { answer: String(outcome.answer ?? '') })}
                </Text>
                <GoldButton
                  title={done ? t('result.see') : t('mystery.next')}
                  icon="arrow-forward"
                  onPress={() => {
                    if (done) void g.finish();
                    else {
                      setOutcome(null);
                      setChoice(null);
                      setI(i + 1);
                    }
                  }}
                />
              </Panel>
            </Animated.View>
          ) : (
            <Panel style={{ gap: Spacing.sm }}>
              <Text style={{ fontFamily: BOLD, color: Colors.reward }}>{t('mystery.which')}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {c.suspects.map((s) => (
                  <Choice key={s} label={s} state={choice === s ? 'selected' : 'idle'} onPress={() => setChoice(s)} />
                ))}
              </View>
              <GoldButton
                title={t('mystery.identify')}
                icon="search"
                disabled={!choice || g.busy}
                onPress={() => void identify()}
              />
            </Panel>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  question: { position: 'absolute', top: '35%', left: 0, right: 0, alignItems: 'center' },
  bottom: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: 12 },
  kit: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  test: {
    width: 72,
    alignItems: 'center',
    gap: 2,
    padding: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(14,18,44,0.82)',
  },
});
