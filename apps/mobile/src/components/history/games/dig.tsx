import { Ionicons } from '@expo/vector-icons';
import { t as i18nT } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { SecondaryButton, W } from '@/components/games/ui';
import { defineGameFrame } from '@/components/lab/contract';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { LostCivilizationRun } from '@/lib/api';
import type { HistoryGame } from '@/lib/games/use-lab-run';

import { Artefact } from '../artefact';
import { Board, Eyebrow, Panel, QuizCard, quiz } from '../quiz';

/** Translation outside React (review lists for the results screen). */
const tr = i18nT as unknown as (key: string, options?: Record<string, unknown>) => string;

type Dig = LostCivilizationRun['digs'][number];
const COLS = 4;
const ROWS = 3;

/** Which squares of the trench hide the finds (the same for a dig every time, spread across it). */
function hidingPlaces(dig: Dig) {
  let h = 0;
  for (const ch of `${dig.art}${dig.id}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const squares = Array.from({ length: COLS * ROWS }, (_, i) => i);
  const out: number[] = [];
  while (out.length < dig.finds.length) {
    h = (h * 1103515245 + 12345) >>> 0;
    const s = squares[h % squares.length]!;
    if (!out.includes(s)) out.push(s);
  }
  return out;
}

/**
 * Lost Civilisation: an excavation. Uncover the squares of a trench (each is a button) to find the
 * artefacts, read their clues, name the civilisation that made them, then answer a question about it.
 */
export function LostCivilization({ g, run, paused }: { g: HistoryGame; run: LostCivilizationRun; paused: boolean }) {
  const { t } = useTranslation('history');
  const tx = t as unknown as (k: string, o?: Record<string, unknown>) => string;
  const total = run.digs.length;
  const [k, setK] = useState(() => Math.min(Math.floor(run.at / 2), total - 1));
  const dig = run.digs[k]!;
  const hidden = hidingPlaces(dig);
  const [open, setOpen] = useState<number[]>(() => (dig.mystery.result ? Array.from({ length: COLS * ROWS }, (_, i) => i) : []));
  const [phase, setPhase] = useState<'dig' | 'name' | 'follow'>(() => (dig.followUp?.result || dig.mystery.result ? 'follow' : 'dig'));
  const found = hidden.filter((s) => open.includes(s)).length;
  const allFound = found === dig.finds.length;
  const over = run.status !== 'playing' || run.hearts <= 0;
  const lastDig = k + 1 >= total || over;
  const seconds = run.seconds ?? 0;

  const nextDig = () => {
    if (lastDig) return void g.finish();
    setK(k + 1);
    setOpen([]);
    setPhase('dig');
  };
  const uncover = (s: number) => {
    if (open.includes(s)) return;
    g.buzz(hidden.includes(s) ? 'success' : 'tap');
    setOpen([...open, s]);
  };

  return (
    <Board>
      <View style={{ gap: 4 }}>
        <Eyebrow>{tx('excavation.trench', { n: k + 1, total })}</Eyebrow>
        <Text style={quiz.small}>{phase === 'dig' ? tx('excavation.uncover') : tx('excavation.found', { done: found, total: dig.finds.length })}</Text>
      </View>

      <Panel style={{ gap: 12 }}>
        <View style={styles.trench} accessibilityRole="grid">
          {Array.from({ length: ROWS }, (_, r) => (
            <View key={r} style={styles.trenchRow}>
              {Array.from({ length: COLS }, (_, c) => {
                const s = r * COLS + c;
                const isOpen = open.includes(s);
                const find = hidden.indexOf(s);
                const f = find >= 0 ? dig.finds[find] : null;
                return (
                  <Pressable
                    key={s}
                    onPress={() => uncover(s)}
                    disabled={isOpen || phase !== 'dig'}
                    accessibilityRole="button"
                    accessibilityLabel={
                      isOpen ? (f ? tx('excavation.foundA11y', { n: s + 1, name: f.name }) : tx('excavation.empty', { n: s + 1 })) : tx('excavation.square', { n: s + 1 })
                    }
                    style={({ pressed }) => [styles.square, isOpen && styles.squareOpen, pressed && { opacity: 0.8 }]}>
                    {isOpen ? (
                      f ? (
                        <Animated.View entering={ZoomIn.duration(200)}>
                          <Artefact art={f.art} size={44} />
                        </Animated.View>
                      ) : (
                        <View style={styles.soil} />
                      )
                    ) : (
                      <Text style={styles.grid}>{`${String.fromCharCode(65 + r)}${c + 1}`}</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
        {phase === 'dig' && !allFound && <SecondaryButton title={tx('excavation.digAll')} icon="layers-outline" onPress={() => setOpen(Array.from({ length: COLS * ROWS }, (_, i) => i))} />}
      </Panel>

      {found > 0 && (
        <View style={{ gap: 8 }}>
          <Eyebrow>{tx('excavation.finds')}</Eyebrow>
          {hidden.map((s, i) =>
            open.includes(s) ? (
              <Animated.View key={s} entering={FadeIn.duration(180)} style={styles.find}>
                <Artefact art={dig.finds[i]!.art} size={56} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.findName}>{dig.finds[i]!.name}</Text>
                  <Text style={quiz.small}>{dig.finds[i]!.clue}</Text>
                </View>
              </Animated.View>
            ) : null,
          )}
        </View>
      )}

      {phase === 'dig' && allFound && (
        <Pressable onPress={() => setPhase('name')} accessibilityRole="button" style={styles.cta}>
          <Text style={styles.ctaText}>{tx('excavation.identify')}</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>
      )}

      {phase !== 'dig' && (
        <QuizCard
          key={dig.mystery.id}
          eyebrow={tx('excavation.identify')}
          q={tx('excavation.who')}
          options={dig.mystery.options}
          seconds={seconds}
          paused={paused || phase !== 'name'}
          done={dig.mystery.result ? { correct: dig.mystery.result.correct, answer: dig.mystery.result.answer } : undefined}
          onAnswer={async (choice) => {
            const res = await g.answer(choice === null ? { step: dig.mystery.id, timeout: true } : { step: dig.mystery.id, choice });
            if (!res) return null;
            g.buzz(res.outcome.correct ? 'success' : 'error');
            return res.outcome;
          }}
          explain={() =>
            dig.mystery.result?.about ? (
              <Panel>
                <Eyebrow>{tx('excavation.about')}</Eyebrow>
                <Text style={quiz.body}>{dig.mystery.result.about}</Text>
              </Panel>
            ) : null
          }
          onNext={() => (over ? void g.finish() : setPhase('follow'))}
          nextLabel={tx('quiz.next')}
        />
      )}

      {phase === 'follow' && dig.followUp && (
        <QuizCard
          key={dig.followUp.id}
          eyebrow={dig.mystery.result?.answer ?? ''}
          q={dig.followUp.q}
          options={dig.followUp.options}
          seconds={seconds}
          paused={paused}
          done={dig.followUp.result ? { correct: dig.followUp.result.correct, answer: dig.followUp.result.answer } : undefined}
          onAnswer={async (choice) => {
            const res = await g.answer(choice === null ? { step: dig.followUp!.id, timeout: true } : { step: dig.followUp!.id, choice });
            if (!res) return null;
            g.buzz(res.outcome.correct ? 'success' : 'error');
            return res.outcome;
          }}
          onNext={nextDig}
          nextLabel={lastDig ? tx('quiz.finish') : tx('quiz.next')}
        />
      )}
    </Board>
  );
}

/** The how-to example: a find with its clue. */
function HowTo() {
  return (
    <View style={styles.find}>
      <Artefact art="hero" size={56} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.findName}>Clay head</Text>
        <Text style={quiz.small}>Fired clay, with triangular eyes and pierced pupils; more than 2,000 years old.</Text>
      </View>
    </View>
  );
}

defineGameFrame('lost-civilization', {
  HowTo,
  review: (r) => {
    const run = r as LostCivilizationRun;
    return run.digs.flatMap((d) => [
      ...(d.mystery.result
        ? [
            {
              key: `n${d.id}`,
              correct: d.mystery.result.correct,
              main: d.mystery.result.answer,
              detail: d.finds.map((f) => f.name).join(' · '),
            },
          ]
        : []),
      ...(d.followUp?.result
        ? [{ key: `f${d.id}`, correct: d.followUp.result.correct, main: d.followUp.q, detail: tr('games:ui.correct') + `: ${d.followUp.result.answer}` }]
        : []),
    ]);
  },
});

const styles = StyleSheet.create({
  trench: { gap: 4, padding: 4, borderRadius: 10, backgroundColor: '#8C6A45' },
  trenchRow: { flexDirection: 'row', gap: 4 },
  square: {
    flex: 1,
    aspectRatio: 1,
    minHeight: 48,
    maxHeight: 96,
    borderRadius: 6,
    backgroundColor: '#C9A87A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareOpen: { backgroundColor: '#E9DCC3' },
  soil: { width: 18, height: 2, borderRadius: 1, backgroundColor: '#B49A72' },
  grid: { fontFamily: Fonts.bold, fontSize: 11, color: '#6B5236' },
  find: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 12, borderRadius: 12, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  findName: { fontFamily: Fonts.bold, fontSize: 15, color: W.ink },
  cta: {
    minHeight: 52,
    borderRadius: 999,
    backgroundColor: W.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: { fontFamily: Fonts.bold, fontSize: 16, color: '#fff' },
});
