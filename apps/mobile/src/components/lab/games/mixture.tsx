import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Feedback, PrimaryButton, SecondaryButton, W } from '@/components/games/ui';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { GameOutcome, MixtureLabRun } from '@/lib/api';
import { useKeys } from '@/lib/games/english';
import { sub, type CoverMap } from '@/lib/games/lab';
import type { LabGame } from '@/lib/games/use-lab-run';

import { defineGameFrame } from '../contract';
import { BottleChip, Board, Card, Chem, FadeInView, GlassFigure, optionIndex, Options, StepHeader } from './kit';

/** Whitish colours count as "colourless" when choosing the starting colour of a mixture. */
const isClear = (hex: string) =>
  parseInt(hex.slice(1, 3), 16) > 225 && parseInt(hex.slice(3, 5), 16) > 225 && parseInt(hex.slice(5, 7), 16) > 225;

/**
 * Chemical Mixture Lab at the bench: the glassware on your list, drawn like a textbook figure, takes the two
 * chemicals you pour in; watch what happens, then say what it shows. The frame's shelves and glassware tabs
 * fill `carrying` and pour into `poured`; without them, the bench offers the shelf itself.
 */
export function MixtureBench({
  g,
  run,
  carrying,
  poured: pouredProp,
  onPoured,
  onNext,
}: {
  g: LabGame;
  run: MixtureLabRun;
  map?: CoverMap;
  carrying?: { glassware: string[]; reagents: string[] };
  poured?: string[];
  onPoured?: (ids: string[]) => void;
  onNext?: () => void;
}) {
  const { t } = useTranslation('lab');
  const [i, setI] = useState(() => Math.min(run.at, run.experiments.length - 1));
  const e = run.experiments[i]!;
  const [own, setOwn] = useState<string[]>([]);
  const poured = pouredProp ?? own;
  const setPoured = (ids: string[]) => (onPoured ? onPoured(ids) : setOwn(ids));
  const [choice, setChoice] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<{ o: GameOutcome; done: boolean } | null>(null);
  const standalone = !carrying;
  const hasGlass = standalone || carrying.glassware.includes(e.glassware);
  const reagent = (id: string) => run.shelf.find((r) => r.id === id);
  const right = poured.length === 2 && e.needs.every((id) => poured.includes(id));
  const wrongMix = poured.length === 2 && !right;
  const colours = poured.map((id) => reagent(id)?.colour ?? '#EAF4FF');
  const start = colours.find((c) => !isClear(c)) ?? colours[0] ?? '#EAF4FF';

  const submit = async () => {
    if (!choice || outcome || g.busy) return;
    const res = await g.answer({ step: i, reagents: poured, choice });
    if (!res) return;
    setOutcome({ o: res.outcome, done: res.done });
    g.buzz(res.outcome.correct ? 'success' : 'error');
  };
  const next = () => {
    if (!outcome) return;
    if (outcome.done) return void g.finish();
    setOutcome(null);
    setChoice(null);
    setOwn([]);
    setI(i + 1);
    onNext?.();
  };
  useKeys((key) => {
    if (key === 'Enter') return outcome ? next() : void submit();
    if (right && !outcome) {
      const k = optionIndex(key);
      if (k >= 0 && k < e.options.length) setChoice(e.options[k]!);
    }
  });

  const seen = right ? t('chem.seenA11y', { text: e.observation.text }) : undefined;

  return (
    <Board
      footer={
        outcome ? (
          <>
            <Feedback
              tone={outcome.o.correct ? 'good' : 'bad'}
              title={outcome.o.correct ? t('chem.right') : t('chem.wrong')}
              detail={outcome.o.correct ? null : t('chem.answerWas', { answer: sub(String(outcome.o.answer ?? '')) })}
            />
            <PrimaryButton title={outcome.done ? t('result.see') : t('mixture.next')} icon="arrow-forward" onPress={next} />
          </>
        ) : right ? (
          <PrimaryButton title={t('chem.answer')} icon="checkmark" disabled={!choice} busy={g.busy} onPress={() => void submit()} />
        ) : wrongMix ? (
          <SecondaryButton title={t('mixture.empty')} icon="trash-outline" onPress={() => setPoured([])} />
        ) : undefined
      }>
      <StepHeader eyebrow={t('chem.step.mixture', { n: i + 1, total: run.experiments.length })} title={e.title} chem />

      <Card style={styles.bench}>
        <View style={{ alignItems: 'center', justifyContent: 'flex-end', minHeight: 190 }}>
          {hasGlass ? (
            <GlassFigure
              key={`${i}-${poured.length}-${right}`}
              kind={e.glassware}
              height={180}
              fill={poured.length === 0 ? 0 : poured.length === 1 ? 0.4 : 0.72}
              liquid={right ? e.observation.liquid : start}
              precipitate={right ? e.observation.precipitate : undefined}
              gas={right && e.observation.gas}
              coating={right ? e.observation.coating : undefined}
              label={seen}
            />
          ) : (
            <Text style={styles.note}>{t('mixture.needGlass', { glass: t(`glassware.${e.glassware}`) })}</Text>
          )}
          <View style={styles.benchTop} />
        </View>
        <View style={{ flex: 1, gap: 6, minWidth: 140 }}>
          <Text style={styles.eyebrow}>{t(`glassware.${e.glassware}`).toUpperCase()}</Text>
          {poured.length ? (
            poured.map((id) => (
              <Chem key={id} style={styles.pouredItem}>
                {`+ ${reagent(id)?.formula ?? id}`}
              </Chem>
            ))
          ) : (
            <Text style={styles.note}>{standalone ? t('chem.pickTwo') : t('mixture.pour')}</Text>
          )}
        </View>
      </Card>

      {standalone && poured.length < 2 && (
        <View style={styles.shelf}>
          {run.shelf.map((r) => (
            <View key={r.id} style={styles.shelfItem}>
              <BottleChip
                formula={r.formula}
                name={r.name}
                colour={r.colour}
                selected={poured.includes(r.id)}
                onPress={() => {
                  g.buzz('tap');
                  setPoured(poured.includes(r.id) ? poured.filter((x) => x !== r.id) : [...poured, r.id]);
                }}
              />
            </View>
          ))}
        </View>
      )}

      {wrongMix && !outcome && <Feedback tone="info" title={t('mixture.wrongMix')} />}

      {right && (
        <FadeInView style={{ gap: 12 }}>
          <Card>
            <Text style={styles.eyebrow}>{t('mixture.observation')}</Text>
            <Chem style={styles.observation}>{e.observation.text}</Chem>
          </Card>
          <Chem style={styles.question}>{e.question}</Chem>
          <Options
            options={e.options}
            disabled={!!outcome}
            onPick={setChoice}
            state={(o) => (outcome ? (o === outcome.o.answer ? 'correct' : o === choice ? 'wrong' : 'idle') : o === choice ? 'selected' : 'idle')}
          />
          {outcome && !!outcome.o.equation && (
            <Card>
              <Text style={styles.eyebrow}>{t('chem.equation').toUpperCase()}</Text>
              <Chem style={styles.observation}>{outcome.o.equation}</Chem>
            </Card>
          )}
        </FadeInView>
      )}
    </Board>
  );
}

function HowTo() {
  return (
    <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', justifyContent: 'center' }}>
      <GlassFigure kind="tube" height={130} fill={0.7} liquid="#9FD3FA" precipitate="#4AA3E8" />
      <View style={{ gap: 4 }}>
        <Chem style={{ fontFamily: Fonts.bold, fontSize: 15, color: W.ink }}>CuSO4 + NaOH</Chem>
        <Text style={{ fontFamily: Fonts.regular, fontSize: 14, color: W.inkSoft }}>→</Text>
        <Chem style={{ fontFamily: Fonts.bold, fontSize: 15, color: W.correct }}>Cu(OH)2</Chem>
      </View>
    </View>
  );
}

defineGameFrame('mixture-lab', {
  HowTo,
  review: (run) =>
    (run as MixtureLabRun).experiments.map((e) => ({
      key: String(e.id),
      correct: !!e.result?.correct,
      main: e.title,
      detail: e.result ? sub(e.result.answer) : undefined,
    })),
});

const styles = StyleSheet.create({
  bench: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' },
  benchTop: { width: 150, height: 4, borderRadius: 2, backgroundColor: W.lineStrong, marginTop: 2 },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  note: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: W.inkSoft },
  pouredItem: { fontFamily: Fonts.bold, fontSize: 16, color: W.ink },
  shelf: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  shelfItem: { flexBasis: 220, flexGrow: 1 },
  observation: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 23, color: W.ink },
  question: { fontFamily: Fonts.bold, fontSize: 17, lineHeight: 24, color: W.ink },
});
