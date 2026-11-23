import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { ClueCard, Feedback, GameLoading, Key, LetterTile, ltrRow, PrimaryButton, SecondaryButton, Stat, W } from '@/components/games/ui';
import { LevelRoute, type LoadedLevel } from '@/components/world/level-route';
import { LevelIntro, PlayFrame, usePlayState, type PlayLevel } from '@/components/world/play-frame';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { useKeys } from '@/lib/games/english';
import { useBank, type BankLevel } from '@/lib/world/bank';
import { rungOf, scrambled, wordsFor } from '@/lib/world/levels';
import { useWorld } from '@/lib/world/store';

type Tile = { id: number; ch: string };

/**
 * The word puzzle: spell each key term from its clue with the letters given. Tap or type letters,
 * Backspace takes one back. Higher levels have longer terms and fewer letters you may reveal.
 */
export default function PuzzleScreen() {
  return <LevelRoute>{(l) => <Puzzle key={l.id} level={l} />}</LevelRoute>;
}

function Puzzle({ level }: { level: LoadedLevel }) {
  const bank = useBank(level.worldId, level.number);
  if (!bank) return <GameLoading />;
  return <PuzzleGame level={level} bank={bank} />;
}

function PuzzleGame({ level, bank }: { level: PlayLevel; bank: BankLevel }) {
  const { t } = useTranslation('world');
  const { t: tg } = useTranslation('games');
  const { recordRun } = useWorld();
  const s = usePlayState(level);
  const rung = rungOf(level);
  const { width } = useWindowDimensions();
  const [round, setRound] = useState(0);
  const words = useMemo(() => wordsFor(level, bank, round), [level, bank, round]);
  const [i, setI] = useState(0);
  const word = words[i];
  const tiles = useMemo<Tile[]>(() => (word ? scrambled(word.word, `${word.id}-${round}`).map((ch, k) => ({ id: k, ch })) : []), [word, round]);
  // The slots, reset whenever the word changes (kept with the word they belong to).
  const slotKey = `${round}-${i}`;
  const [slots, setSlots] = useState<{ key: string; placed: (Tile | null)[] }>({ key: '', placed: [] });
  const placed = slots.key === slotKey ? slots.placed : Array<Tile | null>(word?.word.length ?? 0).fill(null);
  const setPlaced = (next: (Tile | null)[]) => setSlots({ key: slotKey, placed: next });
  const [locked, setLocked] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [wrongTries, setWrongTries] = useState(0);
  const [reveals, setReveals] = useState(0);
  const [wordReveals, setWordReveals] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [bad, setBad] = useState(false);
  const startedAt = useRef(0);
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  useEffect(() => {
    if (s.started) startedAt.current = Date.now();
  }, [s.started, round]);

  if (!s.started) return <LevelIntro s={s} count={words.length} />;
  if (!word || placed.length !== word.word.length) return <GameLoading />;

  const used = new Set(placed.filter(Boolean).map((x) => x!.id));
  const maxReveals = rung.reveals ?? 1;
  const size = Math.max(28, Math.min(48, Math.floor((Math.min(width, 520) - 32 - (word.word.length - 1) * 5) / word.word.length)));
  const buzz = (type: Haptics.NotificationFeedbackType) => s.haptics && Haptics.notificationAsync(type).catch(() => {});

  const check = (next: (Tile | null)[]) => {
    if (!next.every(Boolean)) return;
    if (next.map((x) => x!.ch).join('') === word.word) {
      setSolved(true);
      setBad(false);
      buzz(Haptics.NotificationFeedbackType.Success);
    } else {
      setBad(true);
      setWrongTries((n) => n + 1);
      if (!missed.includes(word.id)) setMissed((m) => [...m, word.id]);
      buzz(Haptics.NotificationFeedbackType.Error);
      shake.set(withSequence(withTiming(-10, { duration: 50 }), withTiming(10, { duration: 50 }), withTiming(0, { duration: 50 })));
    }
  };
  const place = (tile: Tile) => {
    if (solved || s.halted || used.has(tile.id)) return;
    const slot = placed.findIndex((p) => !p);
    if (slot < 0) return;
    const next = placed.map((p, k) => (k === slot ? tile : p));
    setPlaced(next);
    check(next);
  };
  const typeLetter = (ch: string) => {
    const tile = tiles.find((x) => x.ch === ch && !used.has(x.id));
    if (tile) place(tile);
  };
  const back = () => {
    if (solved) return;
    for (let k = placed.length - 1; k >= 0; k--)
      if (placed[k] && !locked.includes(k)) {
        setPlaced(placed.map((p, j) => (j === k ? null : p)));
        setBad(false);
        return;
      }
  };
  const unplace = (k: number) => {
    if (solved || locked.includes(k)) return;
    setPlaced(placed.map((x, j) => (j === k ? null : x)));
    setBad(false);
  };
  const reveal = () => {
    if (wordReveals >= maxReveals) return;
    const k = word.word.split('').findIndex((ch, j) => placed[j]?.ch !== ch);
    if (k < 0) return;
    const free = tiles.find((x) => x.ch === word.word[k] && !placed.some((p, j) => p?.id === x.id && word.word[j] === p.ch));
    if (!free) return;
    const next = placed.map((p, j) => (j === k ? free : p?.id === free.id ? null : p));
    setPlaced(next);
    setLocked((l) => [...l, k]);
    setReveals((r) => r + 1);
    setWordReveals((r) => r + 1);
    if (!missed.includes(word.id)) setMissed((m) => [...m, word.id]);
    check(next);
  };
  const nextWord = () => {
    if (i === words.length - 1) {
      const run = recordRun({
        levelId: level.id,
        correct: words.length,
        total: words.length,
        score: Math.max(0, words.length * 150 - wrongTries * 20 - reveals * 50),
        seconds: Math.round((Date.now() - startedAt.current) / 1000),
        hintsUsed: reveals,
        mistakes: missed,
        reveals,
        wrongTries,
        wordsSolved: words.length,
      });
      router.replace({
        pathname: '/world/results/[levelId]',
        params: { levelId: level.id, run: run.id, fresh: '1', unlocked: run.unlockedWorlds.join(','), ach: run.newAchievements.join(',') },
      });
      return;
    }
    setI(i + 1);
    setLocked([]);
    setSolved(false);
    setBad(false);
    setWordReveals(0);
  };
  const restart = () => {
    setRound((r) => r + 1);
    setI(0);
    setLocked([]);
    setSolved(false);
    setWrongTries(0);
    setReveals(0);
    setWordReveals(0);
    setMissed([]);
    setBad(false);
  };

  return (
    <>
      <PuzzleKeys
        enabled={!s.halted}
        onKey={(key) => {
          if (solved) {
            if (key === 'Enter' || key === ' ') nextWord();
          } else if (key === 'Backspace') back();
          else if (/^[A-Z]$/.test(key)) typeLetter(key);
        }}
      />
      <PlayFrame
        s={s}
        step={{ n: i + 1, total: words.length }}
        onRestart={restart}
        status={
          <>
            <Stat icon="text-outline" text={tg('ui.wordOf', { n: i + 1, total: words.length })} />
            <Stat icon="eye-outline" text={`${maxReveals - wordReveals}`} label={t('adv.revealsLeft', { count: maxReveals - wordReveals })} />
            <Stat icon="close-circle-outline" text={String(wrongTries)} label={t('adv.wrongCount', { count: wrongTries })} />
          </>
        }
        footer={
          solved ? (
            <PrimaryButton title={i === words.length - 1 ? t('puzzle.finish') : t('puzzle.nextWord')} icon="arrow-forward" onPress={nextWord} />
          ) : (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <SecondaryButton
                title={t('adv.reveal', { count: maxReveals - wordReveals })}
                icon="eye-outline"
                disabled={wordReveals >= maxReveals}
                style={{ flex: 1 }}
                onPress={reveal}
              />
              <Key icon="backspace-outline" accessibilityLabel={tg('ui.delete')} onPress={back} width={72} height={52} />
            </View>
          )
        }>
        <ClueCard label={`${t('puzzle.clue')} · ${t('puzzle.letters', { count: word.word.length })}`} text={word.clue} />
        <Animated.View style={[ltrRow(), styles.slots, shakeStyle]}>
          {placed.map((p, k) => (
            <LetterTile
              key={k}
              letter={p?.ch ?? null}
              size={size}
              state={solved ? 'correct' : locked.includes(k) ? 'given' : bad && p ? 'wrong' : p ? 'filled' : placed.findIndex((x) => !x) === k ? 'active' : 'empty'}
              onPress={p ? () => unplace(k) : undefined}
              label={p ? t('puzzle.slotA11y', { letter: p.ch, position: k + 1 }) : t('puzzle.emptyA11y', { position: k + 1 })}
            />
          ))}
        </Animated.View>
        {solved ? (
          <Animated.View entering={FadeIn.duration(180)}>
            <Feedback tone="good" title={tg('ui.correct')} detail={t('puzzle.solved', { word: word.word })} />
          </Animated.View>
        ) : bad ? (
          <Feedback tone="bad" title={tg('ui.wrong')} detail={t('puzzle.notQuite')} />
        ) : null}
        {!solved && (
          <View style={[ltrRow(), styles.bank]}>
            {tiles.map((tile) => (
              <LetterTile
                key={tile.id}
                letter={tile.ch}
                size={Math.min(52, Math.max(40, size))}
                state={used.has(tile.id) ? 'used' : 'filled'}
                onPress={used.has(tile.id) ? undefined : () => place(tile)}
                label={t('puzzle.letterA11y', { letter: tile.ch })}
              />
            ))}
          </View>
        )}
        <Text style={styles.note}>{t('adv.puzzleNote')}</Text>
      </PlayFrame>
    </>
  );
}

/** Keyboard play on the web (a component, so the hook runs on every render of the board). */
function PuzzleKeys({ onKey, enabled }: { onKey: (key: string) => void; enabled: boolean }) {
  useKeys(onKey, enabled);
  return null;
}

const styles = StyleSheet.create({
  slots: { gap: 5, justifyContent: 'center', flexWrap: 'wrap', paddingVertical: 6 },
  bank: { gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  note: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18, color: W.muted, textAlign: 'center' },
});
