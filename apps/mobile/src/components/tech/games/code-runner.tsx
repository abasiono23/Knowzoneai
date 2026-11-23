import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { G, Path, Polyline, Rect } from 'react-native-svg';

import { Feedback, PrimaryButton, SecondaryButton, W } from '@/components/games/ui';
import { defineGameFrame } from '@/components/lab/contract';
import { Card, D, Eyebrow, LTR, ltr, MONO, Sheet, StepBar } from '@/components/space/kit';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { CodeOp, CodeRunnerRun, GameOutcome, GridCell } from '@/lib/api';
import { useKeys } from '@/lib/games/english';
import { blockCount, runProgram, type RunnerState } from '@/lib/games/tech';
import type { TechGame } from '@/lib/games/use-lab-run';

type Path_ = number[];
/** The list a path points at: [] is the program, [2] the body of the repeat at line 2, and so on. */
function listAt(ops: CodeOp[], path: Path_): CodeOp[] {
  let list = ops;
  for (const k of path) {
    const o = list[k];
    if (!o || o.op !== 'repeat') return list;
    list = o.body;
  }
  return list;
}
/** A copy of the program with the list at `path` changed. */
function editAt(ops: CodeOp[], path: Path_, change: (list: CodeOp[]) => CodeOp[]): CodeOp[] {
  if (!path.length) return change(ops);
  const [k, ...rest] = path;
  return ops.map((o, n) => (n === k && o.op === 'repeat' ? { ...o, body: editAt(o.body, rest, change) } : o));
}
/** The program as lines of code (Python-like), with each line's path. */
function lines(ops: CodeOp[], depth = 0, at: Path_ = []): { text: string; depth: number; path: Path_; op: CodeOp }[] {
  return ops.flatMap((o, k) => {
    const path = [...at, k];
    const text =
      o.op === 'repeat'
        ? `repeat ${o.times}:`
        : o.op === 'left'
          ? 'turn_left()'
          : o.op === 'right'
            ? 'turn_right()'
            : `${o.op}()`;
    return [{ text, depth, path, op: o }, ...(o.op === 'repeat' ? lines(o.body, depth + 1, path) : [])];
  });
}

/**
 * Code Runner: write a short program that walks the runner along the path to the flag. move() goes one
 * tile, jump() two (over a gap), turn_left() and turn_right() turn on the spot, and repeat n: runs the
 * lines inside it n times. The block limit means you must spot the pattern and loop it; from level 6
 * the pattern has a loop inside a loop. The program is shown as code, in a monospace face.
 */
export function CodeRunner({ g, run }: { g: TechGame; run: CodeRunnerRun }) {
  const { t } = useTranslation('tech');
  const total = run.puzzles.length;
  const [i, setI] = useState(() => Math.min(run.at, total - 1));
  const p = run.puzzles[i]!;
  const [program, setProgram] = useState<CodeOp[]>([]);
  const [target, setTarget] = useState<Path_>([]);
  const [trail, setTrail] = useState<{ steps: RunnerState[]; shown: number } | null>(null);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const used = blockCount(program);

  useEffect(() => {
    if (!trail || trail.shown >= trail.steps.length) return;
    const id = setTimeout(() => setTrail((tr) => tr && { ...tr, shown: tr.shown + 1 }), 220);
    return () => clearTimeout(id);
  }, [trail]);

  const add = (op: CodeOp['op']) => {
    if (outcome || trail) return;
    const o: CodeOp = op === 'repeat' ? { op, times: 2, body: [] } : { op };
    const list = listAt(program, target);
    setProgram(editAt(program, target, (l) => [...l, o]));
    setMessage(null);
    // A new repeat: further blocks go inside it.
    if (op === 'repeat') setTarget([...target, list.length]);
  };
  const removeLast = () => {
    const list = listAt(program, target);
    if (!list.length && target.length) {
      // An empty repeat: remove it and step out.
      const parent = target.slice(0, -1);
      const k = target.at(-1)!;
      setProgram(editAt(program, parent, (l) => l.filter((_, n) => n !== k)));
      setTarget(parent);
      return;
    }
    setProgram(editAt(program, target, (l) => l.slice(0, -1)));
  };
  const times = (path: Path_, d: number) =>
    setProgram(
      editAt(program, path.slice(0, -1), (l) =>
        l.map((o, n) =>
          n === path.at(-1) && o.op === 'repeat' ? { ...o, times: Math.min(9, Math.max(2, o.times + d)) } : o,
        ),
      ),
    );

  const runIt = async () => {
    if (!program.length || outcome || trail) return;
    setMessage(null);
    const local = runProgram(program, p);
    setTrail({ steps: local.trail, shown: 1 });
    const res = await g.answer({ step: i, program });
    setTimeout(
      () => {
        setTrail(null);
        if (!res) return;
        const o = res.outcome;
        g.buzz(o.correct ? 'success' : 'error');
        if (o.correct) setOutcome(o);
        else
          setMessage(
            o.end === 'blocks'
              ? t('code.over')
              : o.end === 'fell' || o.end === 'short' || o.end === 'long'
                ? t(`code.${o.end}`)
                : t('code.invalid'),
          );
      },
      local.trail.length * 220 + 200,
    );
  };
  const giveUp = async () => {
    const res = await g.answer({ step: i, timeout: true });
    if (res) setOutcome(res.outcome);
  };
  const next = () => {
    if (run.status !== 'playing' || run.at >= total) return void g.finish();
    setI(run.at);
    setProgram([]);
    setTarget([]);
    setOutcome(null);
    setMessage(null);
  };
  useKeys((key) => {
    if (key === 'Enter') return void (outcome ? next() : runIt());
    if (key === 'Backspace') return removeLast();
    const map: Record<string, CodeOp['op']> = { M: 'move', J: 'jump', L: 'left', R: 'right', P: 'repeat' };
    if (map[key] && p.ops.includes(map[key]!)) add(map[key]!);
  });

  const at = trail ? trail.steps[Math.min(trail.shown, trail.steps.length) - 1]! : p.start;
  const shownCode = outcome && !outcome.correct && p.result?.solution ? p.result.solution : program;
  return (
    <Sheet>
      <StepBar
        label={t('play.code.step', { n: i + 1, total })}
        n={i + 1}
        total={total}
        right={
          <Text style={[styles.count, used > p.maxBlocks && { color: W.wrong }]}>
            {t('code.blocks', { used, max: p.maxBlocks })}
          </Text>
        }
      />
      <Card style={{ alignItems: 'center', padding: 10 }}>
        <Grid tiles={p.tiles} gems={p.gems} goal={p.goal} runner={at} path={trail?.steps.slice(0, trail.shown)} />
      </Card>

      <Card>
        <Eyebrow text={t('play.code.program')} />
        <View style={[styles.editor, LTR]} {...ltr}>
          <Pressable
            onPress={() => setTarget([])}
            accessibilityRole="button"
            accessibilityLabel={t('play.code.mainA11y')}
            style={[styles.line, !target.length && !outcome && styles.lineOn]}>
            <Text style={styles.comment}>{t('play.code.main')}</Text>
          </Pressable>
          {lines(shownCode).map((l) => {
            const on = l.op.op === 'repeat' && target.join() === l.path.join() && !outcome;
            return (
              <View key={l.path.join('.')} style={[styles.line, on && styles.lineOn]}>
                <Pressable
                  style={{ flex: 1, minHeight: 36, justifyContent: 'center' }}
                  disabled={l.op.op !== 'repeat' || !!outcome}
                  onPress={() => setTarget(l.path)}
                  accessibilityRole={l.op.op === 'repeat' ? 'button' : 'text'}
                  accessibilityLabel={l.op.op === 'repeat' ? t('play.code.insideA11y', { count: l.op.times }) : l.text}>
                  <Text style={styles.code}>
                    <Text style={styles.gutter}>{'    '.repeat(l.depth)}</Text>
                    {l.text}
                  </Text>
                </Pressable>
                {l.op.op === 'repeat' && !outcome && (
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <Pressable
                      onPress={() => times(l.path, -1)}
                      accessibilityRole="button"
                      accessibilityLabel={t('code.fewer')}
                      style={styles.small}>
                      <Ionicons name="remove" size={16} color={W.ink} />
                    </Pressable>
                    <Pressable
                      onPress={() => times(l.path, 1)}
                      accessibilityRole="button"
                      accessibilityLabel={t('code.more')}
                      style={styles.small}>
                      <Ionicons name="add" size={16} color={W.ink} />
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
          {!shownCode.length && (
            <Text style={[styles.comment, { paddingHorizontal: 10, paddingBottom: 8 }]}>{t('code.empty')}</Text>
          )}
        </View>
        {!outcome && (
          <>
            <Text style={styles.hint}>{target.length ? t('play.code.addingInside') : t('play.code.adding')}</Text>
            <View style={styles.tray}>
              {p.ops.map((op) => (
                <Pressable
                  key={op}
                  onPress={() => add(op)}
                  accessibilityRole="button"
                  accessibilityLabel={t(`code.op.${op}`)}
                  style={styles.block}>
                  <Text style={styles.blockCode}>
                    {op === 'repeat'
                      ? 'repeat n:'
                      : op === 'left'
                        ? 'turn_left()'
                        : op === 'right'
                          ? 'turn_right()'
                          : `${op}()`}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                onPress={removeLast}
                accessibilityRole="button"
                accessibilityLabel={t('play.code.undo')}
                style={[styles.block, { backgroundColor: W.key }]}>
                <Ionicons name="backspace-outline" size={18} color={W.ink} />
              </Pressable>
            </View>
          </>
        )}
      </Card>

      {!!message && <Feedback tone="bad" title={message} />}
      {outcome ? (
        <View style={{ gap: 10 }}>
          <Feedback
            tone={outcome.correct ? 'good' : 'info'}
            title={outcome.correct ? t('code.goal', { points: outcome.points }) : t('play.code.solution')}
            detail={outcome.correct && outcome.gems ? t('code.gems', { count: outcome.gems }) : null}
          />
          <PrimaryButton
            title={run.at >= total ? t('play.finish') : t('code.next')}
            icon="arrow-forward"
            onPress={next}
          />
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          <PrimaryButton
            title={t('code.run')}
            icon="play"
            disabled={!program.length || !!trail}
            busy={!!trail}
            onPress={() => void runIt()}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <SecondaryButton
              style={{ flex: 1 }}
              title={t('play.code.clear')}
              onPress={() => {
                setProgram([]);
                setTarget([]);
              }}
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

/** The path of tiles from above: tiles, gaps (no tile), gems, the flag and the runner with its heading. */
export function Grid({
  tiles,
  gems,
  goal,
  runner,
  path,
}: {
  tiles: GridCell[];
  gems: GridCell[];
  goal: GridCell;
  runner: RunnerState;
  path?: RunnerState[];
}) {
  const { t } = useTranslation('tech');
  const cols = Math.max(...tiles.map((c) => c[0]), runner.x) + 1;
  const rows = Math.max(...tiles.map((c) => c[1]), runner.y) + 1;
  const C = Math.min(40, Math.floor(320 / Math.max(cols, rows)));
  const cx = (x: number) => x * C + C / 2;
  const heading = [0, 90, 180, 270][runner.dir]!;
  return (
    <View style={LTR} {...ltr} accessible accessibilityLabel={t('play.code.gridA11y', { cols, rows })}>
      <Svg width={cols * C} height={rows * C}>
        {Array.from({ length: rows }, (_, y) =>
          Array.from({ length: cols }, (_, x) => (
            <Rect
              key={`${x},${y}`}
              x={x * C + 1}
              y={y * C + 1}
              width={C - 2}
              height={C - 2}
              rx={3}
              fill={D.grid}
              opacity={0.5}
            />
          )),
        )}
        {tiles.map(([x, y]) => (
          <Rect
            key={`t${x},${y}`}
            x={x * C + 2}
            y={y * C + 2}
            width={C - 4}
            height={C - 4}
            rx={4}
            fill="#fff"
            stroke={D.axis}
          />
        ))}
        {gems.map(([x, y]) => (
          <Path
            key={`g${x},${y}`}
            d={`M${cx(x)},${cx(y) - C * 0.2} L${cx(x) + C * 0.16},${cx(y)} L${cx(x)},${cx(y) + C * 0.2} L${cx(x) - C * 0.16},${cx(y)} Z`}
            fill={D.warm}
          />
        ))}
        <Rect
          x={goal[0] * C + 6}
          y={goal[1] * C + 6}
          width={C - 12}
          height={C - 12}
          rx={3}
          fill="none"
          stroke={D.good}
          strokeWidth={2.5}
        />
        <Path
          d={`M${cx(goal[0]) - 3},${cx(goal[1]) + 7} V${cx(goal[1]) - 8} L${cx(goal[0]) + 7},${cx(goal[1]) - 4} L${cx(goal[0]) - 3},${cx(goal[1])}`}
          stroke={D.good}
          strokeWidth={2}
          fill={D.good}
        />
        {path && path.length > 1 && (
          <Polyline
            points={path.map((s) => `${cx(s.x)},${cx(s.y)}`).join(' ')}
            stroke={D.accent}
            strokeWidth={2}
            fill="none"
          />
        )}
        <G rotation={heading} origin={`${cx(runner.x)}, ${cx(runner.y)}`}>
          <Path
            d={`M${cx(runner.x)},${cx(runner.y) - C * 0.32} L${cx(runner.x) + C * 0.26},${cx(runner.y) + C * 0.24} L${cx(runner.x)},${cx(runner.y) + C * 0.12} L${cx(runner.x) - C * 0.26},${cx(runner.y) + C * 0.24} Z`}
            fill={D.accent}
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  count: { fontFamily: Fonts.bold, fontSize: 13, color: W.inkSoft },
  editor: { borderRadius: 10, backgroundColor: '#F1F0F6', borderWidth: 1, borderColor: W.line, paddingVertical: 4 },
  line: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, minHeight: 36 },
  lineOn: { backgroundColor: W.focusSoft },
  code: { fontFamily: MONO, fontSize: 15, color: W.ink },
  gutter: { fontFamily: MONO, color: W.muted },
  comment: { fontFamily: MONO, fontSize: 14, color: W.muted },
  small: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { fontFamily: Fonts.regular, fontSize: 13, color: W.inkSoft },
  tray: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  block: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: W.ink,
    backgroundColor: W.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockCode: { fontFamily: MONO, fontSize: 14, color: W.ink },
});

/** The worked example: three blocks in a loop instead of six in a row. */
function HowTo() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Text
        style={[{ fontFamily: MONO, fontSize: 14, lineHeight: 21, color: W.ink }, LTR]}
        {...ltr}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        {'repeat 3:\n    move()\n    turn_left()'}
      </Text>
      <Grid
        tiles={[
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 1],
        ]}
        gems={[]}
        goal={[0, 1]}
        runner={{ x: 0, y: 1, dir: 1 }}
        path={[
          { x: 1, y: 1, dir: 0 },
          { x: 1, y: 0, dir: 3 },
          { x: 0, y: 0, dir: 2 },
          { x: 0, y: 1, dir: 1 },
        ]}
      />
    </View>
  );
}

defineGameFrame('code-runner', {
  HowTo,
  hearts: false,
  review: (run) =>
    ((run as CodeRunnerRun).puzzles ?? []).flatMap((x) =>
      x.result
        ? [
            {
              key: String(x.id),
              correct: x.result.correct,
              main: `#${x.id + 1} · ${x.maxBlocks}`,
              detail: lines(x.result.solution)
                .map((l) => '  '.repeat(l.depth) + l.text)
                .join('\n'),
            },
          ]
        : [],
    ),
});
