import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { ClashTile, GameOutcome, WordClashRun } from '@/lib/api';
import { useKeys } from '@/lib/games/english';
import { useSession } from '@/lib/session';

import { GameShell, useGame, type Game } from './shell';
import {
  column,
  Feedback,
  FONT,
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

/** Word Clash: five rounds of making the best word from seven tiles, against another learner. */
export function WordClash({ level }: { level: number }) {
  const g = useGame<WordClashRun>('word-clash', level);
  return (
    <GameShell g={g} step={{ n: Math.min((g.run?.at ?? 0) + 1, 5), total: g.run?.rounds.length ?? 5 }}>
      {(run) => <Board key={run.id} g={g} run={run} />}
    </GameShell>
  );
}

type Placed = { tile: ClashTile; from: number };

function Board({ g, run }: { g: Game<WordClashRun>; run: WordClashRun }) {
  const { t } = useTranslation('games');
  const { width } = useWindowDimensions();
  const [i, setI] = useState(0);
  const round = run.rounds[Math.min(i, run.rounds.length - 1)]!;
  const [order, setOrder] = useState(() => round.rack.map((_, k) => k));
  const [word, setWord] = useState<Placed[]>([]);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [roundStart, setRoundStart] = useState(() => Date.now());
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const roundOver = !!outcome && !outcome.retry;
  const last = i >= run.rounds.length - 1;

  const opponentName =
    run.opponent?.kind === 'bot' ? t('clash.practiceRival') : (run.opponent?.name ?? t('clash.learner'));
  const theirTotal = run.rounds.reduce((s, r) => s + (r.result?.opponent ?? 0), 0);

  const play = async (timeout = false) => {
    if (roundOver || g.busy) return;
    const res = await g.answer({
      step: round.id,
      ...(timeout ? { timeout: true } : { word: word.map((p) => p.tile.letter).join('') }),
      ms: Date.now() - roundStart,
    });
    if (!res) return;
    const o = res.outcome;
    if (o.retry) {
      g.buzz('error');
      shake.set(withSequence(withTiming(-8, { duration: 50 }), withTiming(8, { duration: 50 }), withTiming(0, { duration: 50 })));
      const typed = word.map((p) => p.tile.letter).join('');
      setMessage(
        o.reason === 'too-short' ? t('clash.tooShort') : o.reason === 'letters' ? t('clash.letters') : t('clash.notAWord', { word: typed }),
      );
      if (res.done) void g.finish();
      return;
    }
    g.buzz(o.correct ? 'success' : 'tap');
    setOutcome(o);
    setMessage(null);
    if (res.done && run.hearts <= 0) void g.finish();
  };

  const left = useCountdown(
    round.seconds,
    !g.relaxed && !roundOver && !g.paused && run.status === 'playing',
    () => void play(true),
    i,
  );

  const next = () => {
    if (last) {
      void g.finish();
      return;
    }
    const n = run.rounds[i + 1]!;
    setI(i + 1);
    setOrder(n.rack.map((_, k) => k));
    setWord([]);
    setOutcome(null);
    setMessage(null);
    setRoundStart(Date.now());
  };

  const used = new Set(word.map((p) => p.from));
  const tap = (k: number) => {
    if (roundOver || used.has(k)) return;
    g.buzz('tap');
    setMessage(null);
    setWord([...word, { tile: round.rack[k]!, from: k }]);
  };
  const shuffle = () => {
    const next = [...order];
    for (let a = next.length - 1; a > 0; a--) {
      const b = Math.floor(Math.random() * (a + 1));
      [next[a], next[b]] = [next[b]!, next[a]!];
    }
    setOrder(next);
  };

  useKeys(
    (key) => {
      if (roundOver) {
        if (key === 'Enter') next();
        return;
      }
      if (key === 'Enter') {
        if (word.length >= 3) void play();
      } else if (key === 'Backspace') setWord(word.slice(0, -1));
      else if (key === ' ') shuffle();
      else {
        const k = order.find((x) => !used.has(x) && round.rack[x]!.letter === key);
        if (k !== undefined) tap(k);
      }
    },
    !g.paused,
  );

  const avail = Math.min(width, 520) - 32;
  const keyW = Math.min(64, Math.floor((avail - 6 * 6) / 7));
  // After a word is played, the board shows the server's scoring (rare letters count double).
  const boardTiles =
    outcome?.correct && outcome.letters
      ? outcome.letters.map((l) => {
          const rare = 'JKQXZ'.includes(l.ch);
          return { letter: l.ch, points: rare ? l.points / 2 : l.points, rare };
        })
      : word.map((p) => p.tile);
  const slot = Math.min(56, Math.floor((avail - 6 * 6) / 7));
  const typed = word.map((p) => p.tile.letter).join('');

  return (
    <View style={{ flex: 1 }}>
      <StatusRow>
        <Stat text={t('clash.round', { n: Math.min(i + 1, run.rounds.length), total: run.rounds.length })} />
        <HeartsStat left={run.hearts} />
        <TimerStat seconds={left} relaxed={g.relaxed} />
      </StatusRow>
      <ScrollView contentContainerStyle={[column, styles.body]} showsVerticalScrollIndicator={false}>
        <View style={styles.score} accessible accessibilityLabel={t('results.versus', { you: run.score, them: theirTotal, name: opponentName })}>
          <Player name={t('clash.you')} score={run.score} me />
          <Text style={styles.dash}>–</Text>
          <Player name={opponentName} score={theirTotal} photo={run.opponent?.photo} bot={run.opponent?.kind === 'bot'} />
        </View>
        {run.opponent?.kind === 'bot' && i === 0 && !word.length && !outcome && (
          <Text style={styles.note}>{t('clash.koraRival')}</Text>
        )}

        <Animated.View style={[styles.board, ltrRow(), shakeStyle]} accessibilityLabel={typed || t('clash.kora')}>
          {Array.from({ length: Math.max(7, boardTiles.length) }, (_, k) => {
            const tile = boardTiles[k];
            if (!tile) return <LetterTile key={k} size={slot} state="empty" />;
            return (
              <Animated.View key={`${k}-${tile.letter}`} entering={FadeIn.duration(120)}>
                <LetterTile
                  letter={tile.letter}
                  points={tile.points}
                  size={slot}
                  state={outcome?.correct ? 'correct' : tile.rare ? 'rare' : 'filled'}
                  onPress={!roundOver ? () => setWord(word.filter((_, j) => j !== k)) : undefined}
                  label={t('clash.tileA11y', { letter: tile.letter, points: tile.points })}
                />
              </Animated.View>
            );
          })}
        </Animated.View>
        {!word.length && !roundOver && <Text style={styles.note}>{t('clash.kora')}</Text>}

        <View style={{ minHeight: 64, gap: 8 }}>
          {message && <Feedback tone="bad" title={t('ui.wrong')} detail={message} />}
          {roundOver && outcome && (
            <Feedback
              tone={outcome.correct ? 'good' : 'info'}
              title={outcome.correct ? t('ui.points', { count: outcome.points }) : t('clash.noWord')}
              detail={[
                t('clash.theyScored', { name: opponentName, count: outcome.opponentPoints ?? 0 }),
                outcome.best?.word ? t('clash.best', { word: outcome.best.word, points: outcome.best.points }) : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            />
          )}
        </View>

        <View style={[styles.rack, ltrRow()]}>
          {order.map((k) => {
            const tile = round.rack[k]!;
            return (
              <Key
                key={k}
                label={tile.letter}
                sub={String(tile.points)}
                tone={tile.rare ? 'rare' : 'plain'}
                width={keyW}
                height={keyW + 4}
                disabled={used.has(k) || roundOver}
                onPress={() => tap(k)}
                accessibilityLabel={t('clash.tileA11y', { letter: tile.letter, points: tile.points }) + (tile.rare ? `, ${t('clash.rareA11y')}` : '')}
              />
            );
          })}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {roundOver ? (
          <PrimaryButton title={last ? t('clash.results') : t('clash.nextRound')} icon="arrow-forward" onPress={next} busy={g.busy} />
        ) : (
          <View style={styles.actions}>
            <Key icon="shuffle" onPress={shuffle} width={56} height={52} accessibilityLabel={t('clash.shuffle')} />
            <Key icon="backspace-outline" onPress={() => setWord(word.slice(0, -1))} width={56} height={52} accessibilityLabel={t('ui.delete')} disabled={!word.length} />
            <PrimaryButton title={t('clash.playWord')} onPress={() => void play()} disabled={word.length < 3} busy={g.busy} style={{ flex: 1 }} />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

function Player({ name, score, me, photo, bot }: { name: string; score: number; me?: boolean; photo?: string; bot?: boolean }) {
  const { user } = useSession();
  const myPhoto = user?.photo?.kind === 'photo' ? user.photo.uri : undefined;
  const pic = me ? myPhoto : photo;
  return (
    <View style={[styles.player, !me && { flexDirection: 'row-reverse' }]}>
      <View style={styles.avatar}>
        {pic ? (
          <Image source={{ uri: pic }} style={{ width: 36, height: 36 }} accessible={false} />
        ) : bot ? (
          <Ionicons name="hardware-chip-outline" size={18} color={W.ink} />
        ) : (
          <Text style={{ fontFamily: FONT, fontSize: 15, color: W.ink }}>{(me ? user?.name : name)?.[0]?.toUpperCase() ?? '?'}</Text>
        )}
      </View>
      <View style={{ flexShrink: 1, alignItems: me ? 'flex-start' : 'flex-end' }}>
        <Text numberOfLines={1} style={{ fontFamily: Fonts.semibold, fontSize: 13, color: W.muted }}>
          {name}
        </Text>
        <Text style={{ fontFamily: FONT, fontSize: 24, color: W.ink, fontVariant: ['tabular-nums'] }}>{score}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, gap: 16, paddingBottom: 32 },
  score: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
  },
  player: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: W.key,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dash: { fontFamily: FONT, fontSize: 20, color: W.lineStrong, paddingHorizontal: 8 },
  note: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: W.inkSoft, textAlign: 'center' },
  board: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 6, paddingVertical: 6 },
  rack: { flexDirection: 'row', justifyContent: 'center', gap: 6, flexWrap: 'wrap' },
  footer: { ...column, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
});
