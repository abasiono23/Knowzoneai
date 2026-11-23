import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polyline, Rect } from 'react-native-svg';

import { Feedback, PrimaryButton, SecondaryButton, W } from '@/components/games/ui';
import { defineGameFrame } from '@/components/lab/contract';
import { Card, D, Eyebrow, LTR, ltr, MONO, Sheet, StepBar } from '@/components/space/kit';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { GameOutcome, RobotCard, RobotRescueRun } from '@/lib/api';
import { useKeys } from '@/lib/games/english';
import { runRobot } from '@/lib/games/tech';
import type { TechGame } from '@/lib/games/use-lab-run';

type Dir = 'up' | 'right' | 'down' | 'left';
const ARROW: Record<Dir, keyof typeof Ionicons.glyphMap> = {
  up: 'arrow-up',
  right: 'arrow-forward',
  down: 'arrow-down',
  left: 'arrow-back',
};
const cardCode = (c: RobotCard) => ('op' in c ? `${c.op}()` : `move(${c.dir}, ${c.n})`);

/**
 * Robot Rescue: program a warehouse robot with a list of commands, move(direction, n), pick() and
 * drop(), to collect the parcel (and from level 3 deliver it to the pad) without hitting a wall.
 * Grids grow and the card limit tightens up the ladder; from level 8 only the shortest programme fits.
 */
export function RobotRescue({ g, run }: { g: TechGame; run: RobotRescueRun }) {
  const { t } = useTranslation('tech');
  const total = run.puzzles.length;
  const [i, setI] = useState(() => Math.min(run.at, total - 1));
  const p = run.puzzles[i]!;
  const [cards, setCards] = useState<RobotCard[]>([]);
  const [trail, setTrail] = useState<{ steps: { x: number; y: number; carrying: boolean }[]; shown: number } | null>(
    null,
  );
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!trail || trail.shown >= trail.steps.length) return;
    const id = setTimeout(() => setTrail((tr) => tr && { ...tr, shown: tr.shown + 1 }), 180);
    return () => clearTimeout(id);
  }, [trail]);

  const addMove = (dir: Dir) => {
    if (outcome || trail) return;
    const last = cards.at(-1);
    // The same direction again adds a step to the last command.
    if (last && 'dir' in last && last.dir === dir && last.n < 9)
      setCards([...cards.slice(0, -1), { dir, n: last.n + 1 }]);
    else if (cards.length < p.maxCards) setCards([...cards, { dir, n: 1 }]);
    setMessage(null);
  };
  const addOp = (op: 'pick' | 'drop') =>
    !outcome && !trail && cards.length < p.maxCards && setCards([...cards, { op }]);
  const go = async () => {
    if (!cards.length || outcome || trail) return;
    setMessage(null);
    const local = runRobot(cards, p);
    setTrail({ steps: local.trail, shown: 1 });
    const res = await g.answer({ step: i, cards });
    setTimeout(
      () => {
        setTrail(null);
        if (!res) return;
        const o = res.outcome;
        g.buzz(o.correct ? 'success' : 'error');
        if (o.correct) setOutcome(o);
        else
          setMessage(
            o.end === 'cards'
              ? t('robot.tooMany')
              : t(`play.robot.${o.end === 'bump' || o.end === 'missed' ? o.end : 'short'}`),
          );
      },
      local.trail.length * 180 + 200,
    );
  };
  const giveUp = async () => {
    const res = await g.answer({ step: i, timeout: true });
    if (res) setOutcome(res.outcome);
  };
  const next = () => {
    if (run.status !== 'playing' || run.at >= total) return void g.finish();
    setI(run.at);
    setCards([]);
    setOutcome(null);
    setMessage(null);
  };
  useKeys((key) => {
    const dirs: Record<string, Dir> = { ArrowUp: 'up', ArrowRight: 'right', ArrowDown: 'down', ArrowLeft: 'left' };
    if (dirs[key]) addMove(dirs[key]!);
    else if (key === 'P') addOp('pick');
    else if (key === 'D' && p.home) addOp('drop');
    else if (key === 'Backspace') setCards(cards.slice(0, -1));
    else if (key === 'Enter') void (outcome ? next() : go());
  });

  const now = trail
    ? trail.steps[Math.min(trail.shown, trail.steps.length) - 1]!
    : { x: p.robot[0], y: p.robot[1], carrying: false };
  return (
    <Sheet>
      <StepBar
        label={p.home ? t('play.robot.stepHome', { n: i + 1, total }) : t('play.robot.step', { n: i + 1, total })}
        n={i + 1}
        total={total}
        right={
          <Text style={[styles.count, cards.length > p.maxCards && { color: W.wrong }]}>
            {t('robot.cards', { used: cards.length, max: p.maxCards })}
          </Text>
        }
      />
      <Card style={{ alignItems: 'center', padding: 10 }}>
        <Warehouse p={p} at={now} path={trail?.steps.slice(0, trail.shown)} />
        <View style={[styles.legend, LTR]} {...ltr}>
          <Key icon="navigate" color={D.accent} text={t('play.robot.robot')} />
          <Key icon="cube-outline" color={D.warm} text={t('play.robot.parcel')} />
          {!!p.home && <Key icon="square-outline" color={D.good} text={t('play.robot.pad')} />}
          <Key icon="square" color="#C6C3D6" text={t('play.robot.wall')} />
        </View>
      </Card>
      <Card>
        <Eyebrow text={t('play.robot.program')} />
        <View style={[styles.editor, LTR]} {...ltr}>
          {cards.length ? (
            cards.map((c, k) => (
              <Pressable
                key={k}
                disabled={!!outcome || !!trail}
                onPress={() => setCards(cards.filter((_, n) => n !== k))}
                accessibilityRole="button"
                accessibilityLabel={`${cardCode(c)}. ${t('robot.remove')}`}
                style={styles.line}>
                <Text style={styles.lineNo}>{String(k + 1).padStart(2, ' ')}</Text>
                <Text style={styles.code}>{cardCode(c)}</Text>
                {!outcome && <Ionicons name="close" size={14} color={W.muted} />}
              </Pressable>
            ))
          ) : (
            <Text style={[styles.code, { color: W.muted, padding: 10 }]}>{t('play.robot.empty')}</Text>
          )}
        </View>
        {!outcome && (
          <>
            <Text style={styles.hint}>{t('play.robot.hint')}</Text>
            <View style={[styles.pad, LTR]} {...ltr}>
              {(['left', 'up', 'down', 'right'] as Dir[]).map((d) => (
                <Pressable
                  key={d}
                  onPress={() => addMove(d)}
                  accessibilityRole="button"
                  accessibilityLabel={t(`robot.dirs.${d}`)}
                  style={styles.arrow}>
                  <Ionicons name={ARROW[d]} size={20} color={W.ink} />
                </Pressable>
              ))}
              <Pressable
                onPress={() => addOp('pick')}
                accessibilityRole="button"
                accessibilityLabel={t('robot.pick')}
                style={styles.op}>
                <Text style={styles.opText}>pick()</Text>
              </Pressable>
              {!!p.home && (
                <Pressable
                  onPress={() => addOp('drop')}
                  accessibilityRole="button"
                  accessibilityLabel={t('robot.drop')}
                  style={styles.op}>
                  <Text style={styles.opText}>drop()</Text>
                </Pressable>
              )}
            </View>
          </>
        )}
      </Card>
      {!!message && <Feedback tone="bad" title={message} />}
      {outcome ? (
        <View style={{ gap: 10 }}>
          <Feedback
            tone={outcome.correct ? 'good' : 'info'}
            title={outcome.correct ? t('play.robot.saved', { points: outcome.points }) : t('play.robot.skipped')}
            detail={outcome.correct ? t('robot.best', { count: p.best }) : null}
          />
          <PrimaryButton
            title={run.at >= total ? t('play.finish') : t('robot.next')}
            icon="arrow-forward"
            onPress={next}
          />
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          <PrimaryButton
            title={t('play.robot.run')}
            icon="play"
            disabled={!cards.length || !!trail}
            busy={!!trail}
            onPress={() => void go()}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <SecondaryButton
              style={{ flex: 1 }}
              title={t('play.code.clear')}
              onPress={() => setCards([])}
              disabled={!!trail}
            />
            {p.tries >= 3 && (
              <SecondaryButton style={{ flex: 1 }} title={t('play.code.giveUp')} onPress={() => void giveUp()} />
            )}
          </View>
        </View>
      )}
    </Sheet>
  );
}

function Key({ icon, color, text }: { icon: keyof typeof Ionicons.glyphMap; color: string; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={13} color={color} />
      <Text style={{ fontFamily: Fonts.semibold, fontSize: 12, color: W.inkSoft }}>{text}</Text>
    </View>
  );
}

function Warehouse({
  p,
  at,
  path,
}: {
  p: RobotRescueRun['puzzles'][number];
  at: { x: number; y: number; carrying: boolean };
  path?: { x: number; y: number }[];
}) {
  const { t } = useTranslation('tech');
  const C = Math.min(42, Math.floor(320 / p.w));
  const c = (v: number) => v * C + C / 2;
  const blocked = new Set(p.blocked.map((b) => b.join(',')));
  return (
    <View
      style={LTR}
      {...ltr}
      accessible
      accessibilityLabel={t('play.robot.gridA11y', {
        w: p.w,
        h: p.h,
        rx: p.robot[0] + 1,
        ry: p.robot[1] + 1,
        px: p.kitten[0] + 1,
        py: p.kitten[1] + 1,
      })}>
      <Svg width={p.w * C} height={p.h * C}>
        {Array.from({ length: p.h }, (_, y) =>
          Array.from({ length: p.w }, (_, x) =>
            blocked.has(`${x},${y}`) ? (
              <G key={`${x},${y}`}>
                <Rect x={x * C + 1} y={y * C + 1} width={C - 2} height={C - 2} fill="#D9D7E3" />
                <Line x1={x * C + 1} y1={y * C + C - 1} x2={x * C + C - 1} y2={y * C + 1} stroke="#B9B7C8" />
              </G>
            ) : (
              <Rect
                key={`${x},${y}`}
                x={x * C + 1}
                y={y * C + 1}
                width={C - 2}
                height={C - 2}
                fill="#fff"
                stroke={D.grid}
              />
            ),
          ),
        )}
        {p.home && (
          <Rect
            x={p.home[0] * C + 4}
            y={p.home[1] * C + 4}
            width={C - 8}
            height={C - 8}
            fill="#E3F5F1"
            stroke={D.good}
            strokeWidth={2}
            strokeDasharray="4 3"
          />
        )}
        {!at.carrying && (
          <Rect
            x={p.kitten[0] * C + C * 0.28}
            y={p.kitten[1] * C + C * 0.28}
            width={C * 0.44}
            height={C * 0.44}
            rx={2}
            fill="#FFF3DC"
            stroke={D.warm}
            strokeWidth={1.8}
          />
        )}
        {path && path.length > 1 && (
          <Polyline
            points={path.map((s) => `${c(s.x)},${c(s.y)}`).join(' ')}
            stroke={D.accent}
            strokeWidth={2}
            fill="none"
          />
        )}
        <Circle cx={c(at.x)} cy={c(at.y)} r={C * 0.32} fill={D.accent} />
        {at.carrying && (
          <Rect
            x={c(at.x) - C * 0.13}
            y={c(at.y) - C * 0.13}
            width={C * 0.26}
            height={C * 0.26}
            fill="#FFF3DC"
            stroke={D.warm}
          />
        )}
        <Path d={`M${c(at.x) - 3},${c(at.y) - C * 0.32 - 4} h6`} stroke={D.accent} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  count: { fontFamily: Fonts.bold, fontSize: 13, color: W.inkSoft },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 8 },
  editor: { borderRadius: 10, backgroundColor: '#F1F0F6', borderWidth: 1, borderColor: W.line, paddingVertical: 4 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 36, paddingHorizontal: 10 },
  lineNo: { fontFamily: MONO, fontSize: 13, color: W.muted },
  code: { flex: 1, fontFamily: MONO, fontSize: 15, color: W.ink },
  hint: { fontFamily: Fonts.regular, fontSize: 13, color: W.inkSoft },
  pad: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  arrow: {
    width: 52,
    height: 48,
    borderRadius: 10,
    backgroundColor: W.key,
    alignItems: 'center',
    justifyContent: 'center',
  },
  op: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: W.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opText: { fontFamily: MONO, fontSize: 14, color: W.ink },
});

/** The worked example: right 3, down 2 (round the crate), then pick up the parcel. */
const EXAMPLE: RobotRescueRun['puzzles'][number] = {
  id: 0,
  w: 4,
  h: 3,
  blocked: [[1, 1]],
  kinds: ['crate'],
  robot: [0, 0],
  kitten: [3, 2],
  best: 3,
  maxCards: 3,
  tries: 0,
};
function HowTo() {
  return (
    <View style={{ gap: 10, alignItems: 'center' }}>
      <Warehouse
        p={EXAMPLE}
        at={{ x: 3, y: 2, carrying: true }}
        path={[
          { x: 0, y: 0 },
          { x: 3, y: 0 },
          { x: 3, y: 2 },
        ]}
      />
      <Text
        style={[{ fontFamily: MONO, fontSize: 13, color: W.ink }, LTR]}
        {...ltr}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        move(right, 3) · move(down, 2) · pick()
      </Text>
    </View>
  );
}

defineGameFrame('robot-rescue', {
  HowTo,
  hearts: false,
  review: (run) =>
    ((run as RobotRescueRun).puzzles ?? []).flatMap((x) =>
      x.result
        ? [{ key: String(x.id), correct: x.result.correct, main: `${x.w}×${x.h}`, detail: `${x.result.points}` }]
        : [],
    ),
});
