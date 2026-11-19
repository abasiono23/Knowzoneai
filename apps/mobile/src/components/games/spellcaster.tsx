import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { GameOutcome, SpellcasterRun } from '@/lib/api';
import { useKeys } from '@/lib/games/english';

import { GameShell, useGame, type Game } from './shell';
import {
  ClueCard,
  column,
  Feedback,
  HeartsStat,
  Key,
  LetterTile,
  ltrRow,
  PrimaryButton,
  Stat,
  StatusRow,
  TimerStat,
  useCountdown,
  W,
} from './ui';

/**
 * Spellcaster: spell the word a clue describes from a set of letters (with a few extra ones). Right
 * words score towards the level's target; reach it to clear the level.
 */
export function Spellcaster({ level }: { level: number }) {
  const g = useGame<SpellcasterRun>('spellcaster', level);
  return (
    <GameShell g={g} step={{ n: (g.run?.at ?? 0) + 1, total: g.run?.spells.length ?? 9 }}>
      {(run) => <Board key={run.id} g={g} run={run} />}
    </GameShell>
  );
}

function Board({ g, run }: { g: Game<SpellcasterRun>; run: SpellcasterRun }) {
  const { t } = useTranslation('games');
  const { width } = useWindowDimensions();
  const [i, setI] = useState(0);
  const spell = run.spells[Math.min(i, run.spells.length - 1)]!;
  const [picked, setPicked] = useState<number[]>([]);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [done, setDone] = useState(false);
  const [spellStart, setSpellStart] = useState(() => Date.now());
  const answered = !!outcome;
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const advance = (finished: boolean) => {
    if (finished) {
      void g.finish();
      return;
    }
    setOutcome(null);
    setPicked([]);
    setI((n) => n + 1);
    setSpellStart(Date.now());
  };

  const cast = async (timeout = false) => {
    if (answered || g.busy) return;
    const res = await g.answer({
      step: spell.id,
      ...(timeout ? { timeout: true } : { word: picked.map((k) => spell.stones[k]).join('') }),
      ms: Date.now() - spellStart,
    });
    if (!res) return;
    setOutcome(res.outcome);
    setDone(res.done);
    if (res.outcome.correct) {
      g.buzz('success');
      setTimeout(() => advance(res.done), res.done ? 1400 : 1100);
    } else {
      g.buzz('error');
      shake.set(withSequence(withTiming(-8, { duration: 50 }), withTiming(8, { duration: 50 }), withTiming(0, { duration: 50 })));
    }
  };

  const left = useCountdown(spell.seconds, !g.relaxed && !answered && !g.paused && run.status === 'playing', () => void cast(true), i);

  const pick = (k: number) => {
    if (answered || picked.includes(k) || picked.length >= spell.length) return;
    g.buzz('tap');
    setPicked([...picked, k]);
  };
  useKeys(
    (key) => {
      if (answered) {
        if (key === 'Enter' && !outcome?.correct) advance(done);
        return;
      }
      if (key === 'Enter') {
        if (picked.length === spell.length) void cast();
      } else if (key === 'Backspace') setPicked(picked.slice(0, -1));
      else {
        const k = spell.stones.findIndex((ch, x) => ch === key && !picked.includes(x));
        if (k >= 0) pick(k);
      }
    },
    !g.paused,
  );

  const avail = Math.min(width, 520) - 32;
  const slotSize = Math.max(30, Math.min(52, Math.floor((avail - (spell.length - 1) * 6) / spell.length)));
  const perRow = Math.min(spell.stones.length, 8);
  const keyW = Math.min(60, Math.floor((avail - (perRow - 1) * 8) / perRow));
  const slots = Array.from({ length: spell.length }, (_, k) =>
    outcome && !outcome.correct ? outcome.word?.[k] : spell.stones[picked[k]!],
  );
  const scored = run.maxHp - Math.max(0, run.hp);
  const share = run.maxHp ? Math.min(1, scored / run.maxHp) : 0;

  return (
    <View style={{ flex: 1 }}>
      <StatusRow>
        <Stat text={t('ui.wordOf', { n: Math.min(i + 1, run.spells.length), total: run.spells.length })} />
        <HeartsStat left={run.hearts} />
        <TimerStat seconds={left} relaxed={g.relaxed} />
      </StatusRow>
      <ScrollView contentContainerStyle={[column, styles.body]} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 6 }} accessible accessibilityLabel={t('spell.progressA11y', { score: scored, max: run.maxHp })}>
          <View style={styles.targetRow}>
            <Text style={styles.targetLabel}>{t('spell.target', { max: run.maxHp })}</Text>
            <Text style={styles.targetValue}>{run.hp > 0 ? t('spell.toGo', { count: run.hp }) : t('spell.cleared')}</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${share * 100}%` }]} />
          </View>
        </View>

        <Animated.View key={spell.id} entering={FadeIn.duration(180)} style={{ gap: 18 }}>
          <ClueCard label={t('spell.spell')} text={spell.prompt} />
          <Animated.View style={[styles.slots, ltrRow(), shakeStyle]}>
            {slots.map((ch, k) => (
              <LetterTile
                key={k}
                letter={ch}
                size={slotSize}
                state={outcome ? (outcome.correct ? 'correct' : 'wrong') : ch ? 'filled' : k === picked.length ? 'active' : 'empty'}
                onPress={!answered && picked[k] !== undefined ? () => setPicked(picked.filter((_, j) => j !== k)) : undefined}
                label={t('spell.slotA11y', { n: k + 1, letter: ch ?? '' })}
              />
            ))}
          </Animated.View>
        </Animated.View>

        <View style={{ minHeight: 64 }}>
          {outcome &&
            (outcome.correct ? (
              <Feedback
                tone="good"
                title={t('ui.correct')}
                detail={`${t('ui.points', { count: outcome.damage ?? outcome.points })}${outcome.fast ? ` · ${t('spell.fast')}` : ''}`}
              />
            ) : (
              <Feedback tone="bad" title={t('ui.wrong')} detail={t('spell.miss', { word: outcome.word })} />
            ))}
        </View>

        <View style={[styles.stones, ltrRow()]}>
          {spell.stones.map((ch, k) => (
            <Key
              key={k}
              label={ch}
              width={keyW}
              disabled={picked.includes(k) || answered}
              onPress={() => pick(k)}
              accessibilityLabel={t('spell.stoneA11y', { letter: ch })}
            />
          ))}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {answered && !outcome?.correct ? (
          <PrimaryButton title={done ? t('clash.results') : t('ui.next')} icon="arrow-forward" onPress={() => advance(done)} />
        ) : (
          <View style={styles.actions}>
            <Key
              icon="backspace-outline"
              onPress={() => setPicked(picked.slice(0, -1))}
              width={56}
              height={52}
              accessibilityLabel={t('ui.delete')}
              disabled={answered || !picked.length}
            />
            <PrimaryButton
              title={t('ui.check')}
              onPress={() => void cast()}
              disabled={picked.length !== spell.length || answered}
              busy={g.busy && !answered}
              style={{ flex: 1 }}
            />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, gap: 18, paddingBottom: 32 },
  targetRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  targetLabel: { fontFamily: Fonts.semibold, fontSize: 13, color: W.muted },
  targetValue: { fontFamily: Fonts.bold, fontSize: 13, color: W.ink },
  track: { height: 6, borderRadius: 3, backgroundColor: W.line, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3, backgroundColor: W.correct },
  slots: { flexDirection: 'row', justifyContent: 'center', gap: 6, flexWrap: 'wrap' },
  stones: { flexDirection: 'row', justifyContent: 'center', gap: 8, flexWrap: 'wrap' },
  footer: { ...column, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
});
