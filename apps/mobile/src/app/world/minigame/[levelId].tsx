import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { announce, FONT, GameLoading, Stat, TimerStat, useCountdown, W } from '@/components/games/ui';
import { LevelRoute, type LoadedLevel } from '@/components/world/level-route';
import { LevelIntro, PlayFrame, usePlayState, type PlayLevel } from '@/components/world/play-frame';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { useKeys } from '@/lib/games/english';
import { useBank, type BankLevel } from '@/lib/world/bank';
import { rungOf, sprintDeck } from '@/lib/world/levels';
import { useWorld } from '@/lib/world/store';

/**
 * The lightning round: true or false, as many as you can before the clock runs out. Relaxed mode
 * doubles the clock rather than removing it (the race is the game). Keys: T / F or the arrows.
 */
export default function MiniGameScreen() {
  return <LevelRoute>{(l) => <Sprint key={l.id} level={l} />}</LevelRoute>;
}

function Sprint({ level }: { level: LoadedLevel }) {
  const bank = useBank(level.worldId, level.number);
  if (!bank) return <GameLoading />;
  return <SprintGame level={level} bank={bank} />;
}

function SprintGame({ level, bank }: { level: PlayLevel; bank: BankLevel }) {
  const { t } = useTranslation('world');
  const { recordRun } = useWorld();
  const s = usePlayState(level);
  const rung = rungOf(level);
  const duration = s.relaxed ? rung.seconds * 2 : rung.seconds;
  const [round, setRound] = useState(0);
  const deck = useMemo(() => sprintDeck(level, bank, round), [level, bank, round]);
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [last, setLast] = useState<null | { ok: boolean; n: number; why: string; answer: boolean; s: string }>(null);
  const done = useRef(false);
  const [ended, setEnded] = useState(false);
  const left = useCountdown(duration, s.started && !s.halted && !ended, () => setEnded(true), `sprint-${round}`);

  const card = deck[i % Math.max(1, deck.length)];
  const finished = ended || i >= deck.length;

  const latest = useRef({ right, wrong, i, left });
  useEffect(() => {
    latest.current = { right, wrong, i, left };
  });
  useEffect(() => {
    if (!finished || !s.started || done.current) return;
    done.current = true;
    const { right: r, wrong: w, i: n, left: l } = latest.current;
    const run = recordRun({ levelId: level.id, correct: r, total: n, score: r * 100, seconds: duration - l, hintsUsed: 0, mistakes: w });
    router.replace({
      pathname: '/world/results/[levelId]',
      params: { levelId: level.id, run: run.id, fresh: '1', unlocked: run.unlockedWorlds.join(','), ach: run.newAchievements.join(',') },
    });
  }, [finished, s.started, recordRun, level.id, duration]);

  const choose = (v: boolean) => {
    if (finished || s.halted || !card) return;
    const ok = v === card.answer;
    if (ok) {
      setRight((r) => r + 1);
      setStreak((x) => x + 1);
    } else {
      setWrong((w) => [...w, card.id]);
      setStreak(0);
    }
    setLast({ ok, n: i, why: card.why, answer: card.answer, s: card.s });
    announce(ok ? t('adv.status.right') : t('adv.status.wrong'));
    if (s.haptics) Haptics.impactAsync(ok ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setI(i + 1);
  };

  const restart = () => {
    done.current = false;
    setEnded(false);
    setRound((r) => r + 1);
    setI(0);
    setRight(0);
    setWrong([]);
    setStreak(0);
    setLast(null);
  };

  useKeys((key) => {
    if (!s.started || s.halted) return;
    if (key === 'T' || key === 'ArrowLeft') choose(true);
    if (key === 'F' || key === 'ArrowRight') choose(false);
  });

  if (!s.started) return <LevelIntro s={s} count={deck.length} />;
  if (!card) return null;

  return (
    <PlayFrame
      s={s}
      step={{ n: Math.min(i + 1, deck.length), total: deck.length }}
      onRestart={restart}
      status={
        <>
          <Stat icon="checkmark-circle-outline" text={String(right)} label={t('adv.rightCount', { count: right })} tone="good" />
          <Stat icon="close-circle-outline" text={String(wrong.length)} label={t('adv.wrongCount', { count: wrong.length })} />
          {streak >= 3 && <Stat icon="trending-up" text={`×${streak}`} label={t('adv.streak', { count: streak })} />}
          <TimerStat seconds={left} relaxed={false} />
        </>
      }
      footer={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Choice label={t('sprint.true')} keyName="T" icon="checkmark" onPress={() => choose(true)} />
          <Choice label={t('sprint.false')} keyName="F" icon="close" onPress={() => choose(false)} />
        </View>
      }>
      <Animated.View key={`${round}-${i}`} entering={FadeIn.duration(140)} style={styles.card}>
        <Text style={styles.eyebrow}>{t('adv.trueOrFalse').toUpperCase()}</Text>
        <Text style={styles.statement} accessibilityRole="header">
          {card.s}
        </Text>
      </Animated.View>
      {last && (
        <Animated.View key={last.n} entering={FadeIn.duration(140)} style={[styles.last, { backgroundColor: last.ok ? W.correctSoft : W.wrongSoft }]} accessibilityLiveRegion="polite">
          <Ionicons name={last.ok ? 'checkmark-circle' : 'close-circle'} size={20} color={last.ok ? W.correct : W.wrong} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.lastTitle, { color: last.ok ? W.correct : W.wrong }]}>
              {last.ok ? t('adv.status.right') : t('adv.lastWas', { answer: last.answer ? t('sprint.true') : t('sprint.false') })}
            </Text>
            {!last.ok && <Text style={[styles.lastWhy, { fontStyle: 'italic' }]}>{`“${last.s}”`}</Text>}
            {!last.ok && <Text style={styles.lastWhy}>{last.why}</Text>}
          </View>
        </Animated.View>
      )}
    </PlayFrame>
  );
}

function Choice({ label, keyName, icon, onPress }: { label: string; keyName: string; icon: 'checkmark' | 'close'; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.choice, pressed && { backgroundColor: W.keyPressed, transform: [{ scale: 0.98 }] }]}>
      <Ionicons name={icon} size={22} color={W.ink} />
      <Text style={styles.choiceText}>{label}</Text>
      {Platform.OS === 'web' && <Text style={styles.key}>{keyName}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10, padding: 22, minHeight: 180, justifyContent: 'center', borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  statement: { fontFamily: Fonts.bold, fontSize: 21, lineHeight: 29, color: W.ink },
  last: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: 12, alignItems: 'flex-start' },
  lastTitle: { fontFamily: Fonts.bold, fontSize: 14 },
  lastWhy: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: W.ink },
  choice: {
    flex: 1,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: W.key,
  },
  choiceText: { fontFamily: FONT, fontSize: 18, color: W.ink },
  key: { position: 'absolute', right: 10, bottom: 6, fontFamily: Fonts.bold, fontSize: 11, color: W.muted },
});
