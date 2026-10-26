import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/world/avatar';
import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { ClashTile, GameOutcome, WordClashRun } from '@/lib/api';
import { useSession } from '@/lib/session';
import { useWorld } from '@/lib/world/store';

import { GameShell, useGame, type Game } from './shell';
import {
  CoinPill,
  FONT,
  GlossyTile,
  GradientButton,
  HeartsRow,
  KoraBubble,
  PointsPop,
  TopBar,
  useCountdown,
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
      shake.set(
        withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(0, { duration: 50 }),
        ),
      );
      const typed = word.map((p) => p.tile.letter).join('');
      setMessage(
        o.reason === 'too-short'
          ? t('clash.tooShort')
          : o.reason === 'letters'
            ? t('clash.letters')
            : t('clash.notAWord', { word: typed }),
      );
      if (res.done) void g.finish();
      return;
    }
    g.buzz(o.correct ? 'success' : 'tap');
    setOutcome(o);
    setMessage(t('clash.theyScored', { name: opponentName, count: o.opponentPoints ?? 0 }));
    if (res.done && run.hearts <= 0) void g.finish();
  };

  const left = useCountdown(
    round.seconds,
    !roundOver && !g.paused && run.status === 'playing',
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
  const shuffle = () => setOrder([...order].sort(() => Math.random() - 0.5));

  const avail = Math.min(width, 560) - Spacing.md * 2;
  const rackSize = Math.min(58, Math.floor((avail - 6 * 8) / 7));
  // After a word is played, the board shows the server's scoring (rare letters count double).
  const boardTiles =
    outcome?.correct && outcome.letters
      ? outcome.letters.map((l) => {
          const rare = 'JKQXZ'.includes(l.ch);
          return { letter: l.ch, points: rare ? l.points / 2 : l.points, rare };
        })
      : word.map((p) => p.tile);
  const boardSize = Math.min(
    78,
    Math.floor((avail - 32 - (Math.max(boardTiles.length, 4) - 1) * 8) / Math.max(boardTiles.length, 4)),
  );

  return (
    <View style={{ flex: 1 }}>
      <TopBar
        onPause={() => g.setPaused(true)}
        pauseColor="#FF4D6D"
        center={<HeartsRow left={run.hearts} size={26} />}
        right={<CoinPill />}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.versus}>
          <Player name={t('clash.you')} score={run.score} me />
          <View style={{ alignItems: 'center', gap: 6, flex: 1 }}>
            <Text style={styles.vs}>{t('clash.vs')}</Text>
            <Text style={styles.round}>
              {t('clash.round', { n: Math.min(i + 1, run.rounds.length), total: run.rounds.length })}
            </Text>
            <View style={styles.timerTrack}>
              <LinearGradient
                colors={left <= 10 ? ['#FF5A7A', '#FF9F43'] : ['#14C8B4', '#4CC9FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: '100%', width: `${(left / round.seconds) * 100}%`, borderRadius: 999 }}
              />
            </View>
          </View>
          <Player
            name={opponentName}
            score={theirTotal}
            photo={run.opponent?.photo}
            bot={run.opponent?.kind === 'bot'}
          />
        </View>

        <View style={styles.boardPanel}>
          <Animated.View style={[styles.boardRow, shakeStyle]}>
            {boardTiles.length ? (
              boardTiles.map((tile, k) => (
                <Animated.View key={`${k}-${tile.letter}`} entering={FadeInDown.duration(160)}>
                  <GlossyTile
                    letter={tile.letter}
                    points={tile.points}
                    tone={outcome && !outcome.correct ? 'dim' : 'gold'}
                    size={boardSize}
                    badge={tile.rare ? t('clash.rare') : undefined}
                    onPress={!roundOver ? () => setWord(word.filter((_, j) => j !== k)) : undefined}
                    accessibilityLabel={t('clash.tileA11y', { letter: tile.letter, points: tile.points })}
                  />
                </Animated.View>
              ))
            ) : (
              <Text style={styles.placeholder}>{roundOver ? t('clash.noWord') : t('clash.kora')}</Text>
            )}
          </Animated.View>
          <View style={{ height: 46, alignItems: 'center', justifyContent: 'center' }}>
            {outcome?.correct && <PointsPop value={t('ui.points', { count: outcome.points })} size={38} />}
          </View>
          {roundOver && outcome?.best?.word && (
            <Text color={Colors.textSecondary} center>
              {t('clash.best', { word: outcome.best.word, points: outcome.best.points })}
            </Text>
          )}
        </View>

        <View style={styles.rack}>
          {order.map((k) => {
            const tile = round.rack[k]!;
            return (
              <GlossyTile
                key={k}
                letter={tile.letter}
                points={tile.points}
                tone={used.has(k) || roundOver ? 'dim' : 'gold'}
                size={rackSize}
                badge={tile.rare && !used.has(k) ? t('clash.rare') : undefined}
                onPress={() => tap(k)}
                accessibilityLabel={t('clash.tileA11y', { letter: tile.letter, points: tile.points })}
              />
            );
          })}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <KoraBubble
          text={message ?? (run.opponent?.kind === 'bot' && i === 0 && !word.length ? t('clash.koraRival') : undefined)}
          size={96}
          side="right"
          style={styles.kora}
        />
        <View style={styles.actions}>
          {!roundOver && (
            <Pressable
              onPress={shuffle}
              accessibilityRole="button"
              accessibilityLabel={t('clash.shuffle')}
              style={({ pressed }) => [styles.shuffle, pressed && { transform: [{ rotate: '-30deg' }] }]}>
              <Ionicons name="refresh" size={28} color="#fff" />
            </Pressable>
          )}
          {roundOver ? (
            <GradientButton
              title={last ? t('clash.results') : t('clash.nextRound')}
              icon="arrow-forward"
              onPress={next}
              busy={g.busy}
              style={{ flex: 1 }}
            />
          ) : (
            <GradientButton
              title={t('clash.playWord')}
              onPress={() => void play()}
              disabled={word.length < 3}
              busy={g.busy}
              colors={['#B04CFF', '#7C5CFF']}
              style={{ flex: 1 }}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

function Player({
  name,
  score,
  me,
  photo,
  bot,
}: {
  name: string;
  score: number;
  me?: boolean;
  photo?: string;
  bot?: boolean;
}) {
  const { avatar } = useWorld();
  const { user } = useSession();
  const myPhoto = user?.photo?.kind === 'photo' ? user.photo.uri : undefined;
  return (
    <View style={{ alignItems: 'center', gap: 4, width: 104 }}>
      <LinearGradient colors={me ? ['#B04CFF', '#7C5CFF'] : ['#4CC9FF', '#2563EB']} style={styles.avatarRing}>
        <View style={styles.avatarInner}>
          {me && avatar ? (
            <Avatar config={avatar} size={84} />
          ) : me && myPhoto ? (
            <Image source={{ uri: myPhoto }} style={{ width: 84, height: 84 }} />
          ) : photo ? (
            <Image source={{ uri: photo }} style={{ width: 84, height: 84 }} />
          ) : bot ? (
            <Ionicons name="hardware-chip" size={42} color="#fff" />
          ) : (
            <Text style={{ fontFamily: FONT, fontSize: 32, color: '#fff' }}>
              {(me ? user?.name : name)?.[0]?.toUpperCase() ?? '?'}
            </Text>
          )}
        </View>
      </LinearGradient>
      <Text
        numberOfLines={2}
        style={{ fontFamily: FONT, fontSize: name.length > 10 ? 14 : 18, color: '#fff', textAlign: 'center' }}>
        {name}
      </Text>
      <Text style={{ fontFamily: FONT, fontSize: 22, color: 'rgba(235,232,255,0.85)' }}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: Spacing.md, gap: Spacing.md, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 150 },
  versus: { flexDirection: 'row', alignItems: 'center' },
  vs: { fontFamily: FONT, fontSize: 48, color: '#FFC857', textShadowColor: '#FF9F43', textShadowRadius: 12 },
  round: { fontFamily: FONT, fontSize: 14, color: '#6FA8FF', letterSpacing: 0.5 },
  timerTrack: {
    width: '100%',
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(10,8,40,0.6)',
    overflow: 'hidden',
  },
  avatarRing: { width: 96, height: 96, borderRadius: 48, padding: 4 },
  avatarInner: {
    flex: 1,
    borderRadius: 44,
    overflow: 'hidden',
    backgroundColor: '#2A1E8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardPanel: {
    minHeight: 200,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(16,12,60,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(160,140,255,0.18)',
  },
  boardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
    minHeight: 90,
    alignItems: 'center',
  },
  placeholder: { fontFamily: 'Manrope_700Bold', fontSize: 16, color: 'rgba(235,232,255,0.6)', textAlign: 'center' },
  rack: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  kora: { position: 'absolute', right: Spacing.sm, bottom: 72 },
  actions: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', paddingRight: 0 },
  shuffle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5B3FE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
