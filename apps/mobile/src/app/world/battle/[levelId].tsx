import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { FONT, Feedback, GameLoading, PrimaryButton, Stat, TimerStat, useCountdown, W } from '@/components/games/ui';
import { Avatar } from '@/components/world/avatar';
import { LevelRoute, type LoadedLevel } from '@/components/world/level-route';
import { LevelIntro, PlayFrame, usePlayState, type PlayLevel } from '@/components/world/play-frame';
import { AnswerButton, type AnswerState } from '@/components/world/world-ui';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { useKeys } from '@/lib/games/english';
import { useBank, type BankQuestion } from '@/lib/world/bank';
import { questionsFor, rungOf, seeded } from '@/lib/world/levels';
import { useWorld } from '@/lib/world/store';

/**
 * Duels: race a practice rival through the same questions. Right answers win; speed adds points. The
 * rival's answers are decided up front, from the level's rung: stronger and faster higher up the ladder.
 * With the timer off you have all the time you need, and the rival waits for you.
 */
export default function BattleScreen() {
  const { rival } = useLocalSearchParams<{ rival?: string }>();
  return <LevelRoute allowLocked={!!rival}>{(l) => <Duel key={l.id} level={l} />}</LevelRoute>;
}

function Duel({ level }: { level: LoadedLevel }) {
  const bank = useBank(level.worldId, level.number);
  if (!bank) return <GameLoading />;
  return <DuelGame level={level} pool={bank.questions} />;
}

/** Two letters for a rival's badge. */
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

function DuelGame({ level, pool }: { level: PlayLevel; pool: BankQuestion[] }) {
  const { t } = useTranslation('world');
  const { t: tg } = useTranslation('games');
  // A friend battle passes the friend's name: practice against a rival with their name.
  const { rival: friendName } = useLocalSearchParams<{ rival?: string }>();
  const { avatar, recordRun } = useWorld();
  const s = usePlayState(level);
  const rung = rungOf(level);
  const strength = useMemo(() => rung.rival ?? { right: 0.65, fastest: 4, slowest: 12 }, [rung]);
  const rivalName = friendName || level.world.rival.name;
  const seconds = rung.seconds || 20;
  const timed = !s.relaxed;
  const [round, setRound] = useState(0);
  const questions = useMemo(() => questionsFor(level, { questions: pool, truths: [], terms: [] }, round), [level, pool, round]);
  const plan = useMemo(() => {
    const r = seeded(`${level.id}-${rivalName}-${round}`);
    return questions.map(() => ({ right: r() < strength.right, at: strength.fastest + Math.round(r() * (strength.slowest - strength.fastest)) }));
  }, [questions, level.id, rivalName, round, strength]);

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [me, setMe] = useState({ correct: 0, points: 0 });
  const [them, setThem] = useState({ correct: 0, points: 0 });
  const [wrong, setWrong] = useState<string[]>([]);
  const startedAt = useRef(0);

  const q = questions[i];
  const p = plan[i];
  const answered = picked !== null;

  const lock = (k: number) => {
    if (answered || !q || s.halted) return;
    const ok = k === q.answer;
    setPicked(k);
    if (ok) setMe((m) => ({ correct: m.correct + 1, points: m.points + 100 + (timed ? left : Math.round(seconds / 2)) * 5 }));
    else setWrong((w) => [...w, q.id]);
    if (p.right) setThem((x) => ({ correct: x.correct + 1, points: x.points + 100 + Math.max(0, seconds - p.at) * 5 }));
    if (s.haptics)
      Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
  };

  const left = useCountdown(seconds, s.started && timed && !answered && !s.halted, () => lock(-1), `${round}-${i}`);
  // Without the timer the rival still "answers", but only shows it once you do.
  const rivalDone = timed ? seconds - left >= p?.at : false;

  useEffect(() => {
    if (s.started) startedAt.current = Date.now();
  }, [s.started, round]);

  const next = () => {
    if (i < questions.length - 1) {
      setI(i + 1);
      setPicked(null);
      return;
    }
    const run = recordRun({
      levelId: level.id,
      correct: me.correct,
      total: questions.length,
      score: me.points,
      seconds: Math.round((Date.now() - startedAt.current) / 1000),
      hintsUsed: 0,
      mistakes: wrong,
      rivalScore: them.correct,
      practice: !!friendName,
    });
    router.replace({
      pathname: '/world/results/[levelId]',
      params: {
        levelId: level.id,
        run: run.id,
        fresh: '1',
        rival: rivalName,
        rivalPoints: String(them.points),
        unlocked: run.unlockedWorlds.join(','),
        ach: run.newAchievements.join(','),
      },
    });
  };

  const restart = () => {
    setRound((r) => r + 1);
    setI(0);
    setPicked(null);
    setMe({ correct: 0, points: 0 });
    setThem({ correct: 0, points: 0 });
    setWrong([]);
  };

  useKeys(
    (key) => {
      if (!s.started || s.halted) return;
      if (answered) {
        if (key === 'Enter' || key === ' ') next();
        return;
      }
      const n = /^[1-5]$/.test(key) ? Number(key) - 1 : /^[A-E]$/.test(key) ? key.charCodeAt(0) - 65 : -1;
      if (q && n >= 0 && n < q.options.length) lock(n);
    },
    !!q,
  );

  if (!s.started)
    return (
      <LevelIntro
        s={s}
        count={questions.length}
        extra={
          <View style={styles.versus}>
            <Side name={avatar?.name || t('battle.you')} avatar={avatar} />
            <Text style={styles.vs}>{t('adv.vs')}</Text>
            <Side name={rivalName} />
          </View>
        }
      />
    );
  if (!q) return null;

  const stateOf = (k: number): AnswerState => (!answered ? 'idle' : k === q.answer ? 'right' : k === picked ? 'wrong' : 'dim');

  return (
    <PlayFrame
      s={s}
      step={{ n: i + 1, total: questions.length }}
      onRestart={restart}
      status={
        <>
          <Stat icon="list-outline" text={`${i + 1}/${questions.length}`} label={t('play.questionOf', { n: i + 1, total: questions.length })} />
          <Stat
            icon="people-outline"
            text={`${me.correct} – ${them.correct}`}
            label={t('battle.pauseSubtitle', { me: me.correct, them: them.correct, rival: rivalName })}
          />
          <TimerStat seconds={left} relaxed={!timed} />
        </>
      }
      footer={answered ? <PrimaryButton title={i === questions.length - 1 ? t('play.finish') : tg('ui.next')} icon="arrow-forward" onPress={next} /> : undefined}>
      <View style={styles.board}>
        <Player label={t('battle.you')} score={me.correct} points={me.points} mine />
        <Player label={rivalName} score={them.correct} points={them.points} status={answered ? (p.right ? 'right' : 'wrong') : rivalDone ? 'locked' : 'thinking'} />
      </View>
      <Animated.View key={`${round}-${i}`} entering={FadeIn.duration(180)} style={{ gap: 14 }}>
        <View style={styles.qCard}>
          <Text style={styles.eyebrow}>{t('play.questionOf', { n: i + 1, total: questions.length }).toUpperCase()}</Text>
          <Text style={styles.question} accessibilityRole="header">
            {q.q}
          </Text>
        </View>
        <View style={{ gap: 8 }}>
          {q.options.map((o, k) => (
            <AnswerButton key={k} label={o} index={k} state={stateOf(k)} onPress={() => lock(k)} disabled={answered || s.halted} />
          ))}
        </View>
        {answered && (
          <Animated.View entering={FadeInDown.duration(200)} style={{ gap: 8 }}>
            <Feedback
              tone={picked === q.answer ? 'good' : 'bad'}
              title={picked === q.answer ? tg('ui.correct') : picked === -1 ? t('play.timesUp') : tg('ui.wrong')}
              detail={`${picked === q.answer ? '' : `${t('adv.answerWas', { answer: q.options[q.answer] })} `}${p.right ? t('adv.rivalRight', { rival: rivalName }) : t('adv.rivalWrong', { rival: rivalName })}`}
            />
            <Text style={styles.why}>{q.why}</Text>
          </Animated.View>
        )}
      </Animated.View>
    </PlayFrame>
  );
}

function Side({ name, avatar }: { name: string; avatar?: ReturnType<typeof useWorld>['avatar'] }) {
  return (
    <View style={{ alignItems: 'center', gap: 6, flex: 1 }}>
      {avatar ? (
        <Avatar config={avatar} size={56} />
      ) : (
        <View style={styles.mono}>
          <Text style={styles.monoText}>{initials(name)}</Text>
        </View>
      )}
      <Text style={styles.sideName} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

function Player({
  label,
  score,
  points,
  mine,
  status,
}: {
  label: string;
  score: number;
  points: number;
  mine?: boolean;
  status?: 'thinking' | 'locked' | 'right' | 'wrong';
}) {
  const { t } = useTranslation('world');
  const icon =
    status === 'right' ? 'checkmark-circle' : status === 'wrong' ? 'close-circle' : status === 'locked' ? 'lock-closed' : 'ellipsis-horizontal';
  const color = status === 'right' ? W.correct : status === 'wrong' ? W.wrong : W.muted;
  const statusText =
    status === 'right' ? t('adv.status.right') : status === 'wrong' ? t('adv.status.wrong') : status === 'locked' ? t('adv.status.answered') : t('adv.status.thinking');
  return (
    <View style={[styles.player, mine && { borderColor: W.ink }]} accessible accessibilityLabel={`${label}: ${score}. ${status ? statusText : ''}`}>
      <Text style={styles.playerName} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.playerScore}>{score}</Text>
      {status ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name={icon} size={14} color={color} />
          <Text style={[styles.playerMeta, { color }]}>{statusText}</Text>
        </View>
      ) : (
        <Text style={styles.playerMeta}>{t('adv.points', { count: points })}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  versus: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 4 },
  vs: { fontFamily: FONT, fontSize: 14, color: W.muted },
  mono: { width: 56, height: 56, borderRadius: 28, backgroundColor: W.ink, alignItems: 'center', justifyContent: 'center' },
  monoText: { fontFamily: FONT, fontSize: 18, color: '#fff' },
  sideName: { fontFamily: Fonts.bold, fontSize: 14, color: W.ink, maxWidth: 140 },
  board: { flexDirection: 'row', gap: 10 },
  player: { flex: 1, padding: 12, borderRadius: 14, backgroundColor: W.surface, borderWidth: 1.5, borderColor: W.line, gap: 2 },
  playerName: { fontFamily: Fonts.bold, fontSize: 13, color: W.inkSoft },
  playerScore: { fontFamily: FONT, fontSize: 26, color: W.ink, fontVariant: ['tabular-nums'] },
  playerMeta: { fontFamily: Fonts.semibold, fontSize: 12, color: W.muted },
  qCard: { gap: 8, padding: 18, borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  question: { fontFamily: Fonts.bold, fontSize: 19, lineHeight: 27, color: W.ink },
  why: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: W.inkSoft, paddingHorizontal: 4 },
});
