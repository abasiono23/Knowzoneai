import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { GameOutcome, MixtureLabRun } from '@/lib/api';
import { sub } from '@/lib/games/lab';
import type { LabGame } from '@/lib/games/use-lab-run';

import { Glass } from '../glass';
import { BOLD, Choice, GoldButton, Panel } from '../hud';
import type { CoverMap } from '../station';

/** Whitish colours count as "colourless" when choosing the starting colour of a mixture. */
const isClear = (hex: string) =>
  parseInt(hex.slice(1, 3), 16) > 225 && parseInt(hex.slice(3, 5), 16) > 225 && parseInt(hex.slice(5, 7), 16) > 225;

/**
 * Chemical Mixture Lab at the workbench: pour the two reagents on your list into your glassware,
 * watch the reaction, then say what formed. The experiment stays on the bench until you move on.
 */
export function MixtureBench({
  g,
  run,
  map,
  carrying,
  poured,
  onPoured,
  onNext,
}: {
  g: LabGame;
  run: MixtureLabRun;
  map: CoverMap;
  /** Glassware and reagents in the inventory. */
  carrying: { glassware: string[]; reagents: string[] };
  /** Reagents poured into the glass so far (chosen from the inventory bar). */
  poured: string[];
  onPoured: (ids: string[]) => void;
  /** Move to the next experiment (clears the bench and inventory). */
  onNext: () => void;
}) {
  const { t } = useTranslation('lab');
  const [i] = useState(() => Math.min(run.at, run.experiments.length - 1));
  const e = run.experiments[i]!;
  const [choice, setChoice] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [done, setDone] = useState(false);
  const reagent = (id: string) => run.shelf.find((r) => r.id === id);
  const hasGlass = carrying.glassware.includes(e.glassware);
  const right = poured.length === 2 && e.needs.every((id) => poured.includes(id));
  const wrongMix = poured.length === 2 && !right;
  const colours = poured.map((id) => reagent(id)?.colour ?? '#EAF4FF');
  const start = colours.find((c) => !isClear(c)) ?? colours[0] ?? '#EAF4FF';

  const submit = async () => {
    if (!choice) return;
    const res = await g.answer({ step: i, reagents: poured, choice });
    if (!res) return;
    setOutcome(res.outcome);
    setDone(res.done);
    g.buzz(res.outcome.correct ? 'success' : 'error');
  };

  const glassH = 0.3 * map.dh;
  return (
    <>
      <View
        style={[styles.glass, { left: map.x(0.5) - (glassH * 100) / 160 / 2, top: map.y(0.66) - glassH }]}
        pointerEvents="none">
        {hasGlass ? (
          <Glass
            kind={e.glassware}
            height={glassH}
            level={poured.length === 0 ? 0 : poured.length === 1 ? 0.45 : 0.8}
            from={start}
            to={right ? e.observation.liquid : start}
            reacted={right}
            precipitate={right ? e.observation.precipitate : undefined}
            gas={right && e.observation.gas}
            coating={right ? e.observation.coating : undefined}
          />
        ) : null}
      </View>
      <SafeAreaView
        edges={['bottom']}
        style={[styles.bottom, { bottom: poured.length < 2 && !outcome ? 96 : 12 }]}
        pointerEvents="box-none">
        <ScrollView style={{ maxHeight: map.dh * 0.5 }} contentContainerStyle={{ gap: Spacing.sm }}>
          {!hasGlass ? (
            <Panel>
              <Text style={styles.text}>{t('mixture.needGlass', { glass: t(`glassware.${e.glassware}`) })}</Text>
            </Panel>
          ) : poured.length < 2 ? (
            <Panel>
              <Text style={styles.text}>
                {carrying.reagents.length ? t('mixture.pour') : t('mixture.needReagents')}
              </Text>
            </Panel>
          ) : wrongMix && !outcome ? (
            <Panel style={{ gap: Spacing.sm }}>
              <Text style={styles.text}>{t('mixture.wrongMix')}</Text>
              <GoldButton title={t('mixture.empty')} icon="trash" onPress={() => onPoured([])} />
            </Panel>
          ) : !outcome ? (
            <Animated.View entering={FadeIn.delay(1600)} style={{ gap: Spacing.sm }}>
              <Panel>
                <Text style={{ color: Colors.reward, fontFamily: BOLD, fontSize: 12 }}>{t('mixture.observation')}</Text>
                <Text style={[styles.text, { fontFamily: BOLD }]}>{e.observation.text}</Text>
              </Panel>
              <Panel style={{ gap: Spacing.sm }}>
                <Text style={{ fontFamily: BOLD, fontSize: 17, color: Colors.reward }}>{e.question}</Text>
                <View style={styles.options}>
                  {e.options.map((o) => (
                    <Choice key={o} label={o} state={choice === o ? 'selected' : 'idle'} onPress={() => setChoice(o)} />
                  ))}
                </View>
                <GoldButton
                  title={t('mixture.submit')}
                  icon="checkmark"
                  disabled={!choice || g.busy}
                  onPress={() => void submit()}
                />
              </Panel>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown}>
              <Panel style={{ gap: Spacing.sm, borderColor: outcome.correct ? Colors.success : Colors.danger }}>
                <Text style={{ fontFamily: BOLD, fontSize: 18, color: outcome.correct ? Colors.success : '#FF8FA6' }}>
                  {outcome.correct ? t('mixture.right') : t('mixture.wrong', { answer: String(outcome.answer ?? '') })}
                </Text>
                {!!outcome.equation && <Text style={[styles.text, { fontFamily: BOLD }]}>{sub(outcome.equation)}</Text>}
                <GoldButton
                  title={done ? t('result.see') : t('mixture.next')}
                  icon="arrow-forward"
                  onPress={() => {
                    if (done) void g.finish();
                    else onNext();
                  }}
                />
              </Panel>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  glass: { position: 'absolute' },
  bottom: { position: 'absolute', left: Spacing.md, right: Spacing.md },
  text: { fontSize: 15, color: '#fff' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
