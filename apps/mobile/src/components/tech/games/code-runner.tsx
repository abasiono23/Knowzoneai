import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Backdrop } from '@/components/lab/backdrop';
import { BOLD, GoldButton, Panel, PANEL } from '@/components/lab/hud';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { CodeOp, CodeRunnerRun, GameOutcome } from '@/lib/api';
import { blockCount, runProgram, TECH_SCENES, TECH_SPRITES, type RunnerState } from '@/lib/games/tech';
import type { TechGame } from '@/lib/games/use-lab-run';

type Simple = Exclude<CodeOp['op'], 'repeat'>;
const BLOCK_COLOR: Record<CodeOp['op'], string> = {
  move: '#2D9CDB',
  jump: '#7C5CFF',
  left: '#F2994A',
  right: '#F2994A',
  repeat: '#27AE60',
};
const ARROW = ['arrow-up', 'arrow-forward', 'arrow-down', 'arrow-back'] as const;

/**
 * Code Runner: build a program from blocks (move, jump, turn, repeat) to walk the runner along the
 * glowing path to the flag, within the block limit. The program runs here to animate and on the
 * server to decide. Failed runs can be retried; after three tries you may skip.
 */
export function CodeRunner({ g, run }: { g: TechGame; run: CodeRunnerRun }) {
  const { t } = useTranslation('tech');
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [i, setI] = useState(() => Math.min(run.at, run.puzzles.length - 1));
  const x = run.puzzles[i]!;
  const [ops, setOps] = useState<CodeOp[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [trail, setTrail] = useState<RunnerState[] | null>(null);
  const [shown, setShown] = useState(0);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const used = blockCount(ops);

  // Play the runner along its trail, one step at a time.
  useEffect(() => {
    if (!trail || shown >= trail.length - 1) return;
    const id = setTimeout(() => setShown((n) => n + 1), 300);
    return () => clearTimeout(id);
  }, [trail, shown]);

  const add = (op: CodeOp['op']) => {
    if (outcome || trail) return;
    g.buzz('tap');
    if (op === 'repeat') {
      setOps([...ops, { op: 'repeat', times: 2, body: [] }]);
      setOpen(ops.length);
      return;
    }
    if (open !== null && ops[open]?.op === 'repeat') {
      setOps(ops.map((o, k) => (k === open && o.op === 'repeat' ? { ...o, body: [...o.body, { op }] } : o)));
      return;
    }
    setOps([...ops, { op }]);
  };
  const remove = (k: number, inner?: number) => {
    if (outcome || trail) return;
    if (inner === undefined) {
      setOps(ops.filter((_, j) => j !== k));
      if (open === k) setOpen(null);
      else if (open !== null && open > k) setOpen(open - 1);
    } else
      setOps(
        ops.map((o, j) => (j === k && o.op === 'repeat' ? { ...o, body: o.body.filter((_, b) => b !== inner) } : o)),
      );
  };
  const times = (k: number, by: number) =>
    setOps(
      ops.map((o, j) => (j === k && o.op === 'repeat' ? { ...o, times: Math.min(9, Math.max(2, o.times + by)) } : o)),
    );

  const go = async () => {
    const sim = runProgram(ops, x);
    setMessage(null);
    setTrail(sim.trail);
    setShown(0);
    const res = await g.answer({ step: i, program: ops });
    // Wait for the runner to finish moving before the verdict.
    setTimeout(
      () => {
        if (!res) {
          setTrail(null);
          return;
        }
        const o = res.outcome;
        g.buzz(o.correct ? 'success' : 'error');
        if (o.correct) setOutcome(o);
        else {
          setTrail(null);
          setMessage(
            o.end === 'blocks'
              ? t('code.over')
              : o.end === 'fell' || o.end === 'short' || o.end === 'long'
                ? t(`code.${o.end as 'fell'}`)
                : t('code.invalid'),
          );
        }
      },
      sim.trail.length * 300 + 200,
    );
  };
  const giveUp = async () => {
    const res = await g.answer({ step: i, timeout: true });
    if (res) setOutcome(res.outcome);
  };
  const next = () => {
    if (run.status !== 'playing' || run.at >= run.puzzles.length) {
      void g.finish();
      return;
    }
    setI(run.at);
    setOps([]);
    setOpen(null);
    setTrail(null);
    setOutcome(null);
    setMessage(null);
  };

  // The board: the path's tiles scaled to fit the top half.
  const cols = Math.max(...x.tiles.map((c) => c[0])) + 1;
  const rows = Math.max(...x.tiles.map((c) => c[1])) + 1;
  const area = { top: 150, h: Math.max(160, size.h * 0.42 - 150), w: size.w - 2 * Spacing.md };
  const cell = Math.min(60, area.w / cols, area.h / rows);
  const ox = Spacing.md + (area.w - cols * cell) / 2;
  const oy = area.top + (area.h - rows * cell) / 2;
  const at = trail ? trail[Math.min(shown, trail.length - 1)]! : x.start;
  const gemsGot = trail ? runProgram(ops, x).gems : [];
  const solution = outcome && !outcome.correct ? x.result?.solution : undefined;

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      <Backdrop source={TECH_SCENES.code} dim={0.1} />
      {size.w > 0 && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {x.tiles.map(([cx, cy]) => (
            <View
              key={`${cx},${cy}`}
              style={[
                styles.tile,
                { left: ox + cx * cell + 2, top: oy + cy * cell + 2, width: cell - 4, height: cell - 4 },
              ]}
            />
          ))}
          {x.gems
            .filter(([gx, gy]) => !gemsGot.slice(0, shown).includes(`${gx},${gy}`))
            .map(([gx, gy]) => (
              <Image
                key={`gem${gx},${gy}`}
                source={TECH_SPRITES.gem.src}
                style={{
                  position: 'absolute',
                  left: ox + gx * cell + cell * 0.25,
                  top: oy + gy * cell + cell * 0.25,
                  width: cell * 0.5,
                  height: cell * 0.5,
                }}
                contentFit="contain"
                accessible={false}
              />
            ))}
          <Image
            source={TECH_SPRITES.flag.src}
            style={{
              position: 'absolute',
              left: ox + x.goal[0] * cell + cell * 0.15,
              top: oy + x.goal[1] * cell - cell * 0.2,
              width: cell * 0.7,
              height: cell,
            }}
            contentFit="contain"
            accessible={false}
          />
          <View
            style={{
              position: 'absolute',
              left: ox + at.x * cell,
              top: oy + at.y * cell - cell * 0.25,
              width: cell,
              height: cell,
              alignItems: 'center',
            }}>
            <Image
              source={TECH_SPRITES.runner.src}
              style={{ width: cell * 0.85, height: cell * 0.95 }}
              contentFit="contain"
              accessible={false}
            />
            <View style={styles.dir}>
              <Ionicons name={ARROW[at.dir]!} size={12} color="#fff" />
            </View>
          </View>
        </View>
      )}

      <SafeAreaView edges={['top']} style={styles.top} pointerEvents="none">
        <Panel style={{ gap: 2 }}>
          <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 14 }}>
            {t('code.objective', { n: i + 1, total: run.puzzles.length })}
          </Text>
          <Text style={{ color: used > x.maxBlocks ? '#FF8FA6' : Colors.reward, fontSize: 12, fontFamily: BOLD }}>
            {t('code.blocks', { used, max: x.maxBlocks })} · {t('ui.tries', { count: x.tries })}
          </Text>
        </Panel>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.bottom} pointerEvents="box-none">
        {outcome ? (
          <Animated.View entering={FadeInDown}>
            <Panel style={{ gap: Spacing.sm, borderColor: outcome.correct ? Colors.success : Colors.reward }}>
              <Text style={{ fontFamily: BOLD, fontSize: 17, color: outcome.correct ? Colors.success : '#fff' }}>
                {outcome.correct
                  ? `${t('code.goal', { points: outcome.points })}${outcome.gems ? ` · ${t('code.gems', { count: outcome.gems })}` : ''}`
                  : t('ui.solution')}
              </Text>
              {solution && <Program ops={solution} />}
              <GoldButton title={t('code.next')} icon="arrow-forward" onPress={next} />
            </Panel>
          </Animated.View>
        ) : (
          <Panel style={{ gap: Spacing.sm, padding: 10 }}>
            <Text style={styles.heading}>{t('code.program')}</Text>
            <ScrollView style={{ maxHeight: 150 }} contentContainerStyle={{ gap: 6 }}>
              {ops.length === 0 && (
                <Text style={{ color: 'rgba(235,238,255,0.6)', fontSize: 12 }}>{t('code.empty')}</Text>
              )}
              <View style={styles.wrap}>
                {ops.map((o, k) =>
                  o.op === 'repeat' ? (
                    <View key={k} style={[styles.repeat, open === k && { borderColor: Colors.reward }]}>
                      <View style={styles.repeatHead}>
                        <Pressable
                          onPress={() => setOpen(open === k ? null : k)}
                          accessibilityRole="button"
                          accessibilityState={{ expanded: open === k }}
                          style={{ flex: 1 }}>
                          <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 13 }}>
                            {t('code.times', { count: o.times })}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => times(k, -1)}
                          accessibilityRole="button"
                          accessibilityLabel={t('code.fewer')}
                          hitSlop={6}
                          style={styles.tiny}>
                          <Ionicons name="remove" size={14} color="#fff" />
                        </Pressable>
                        <Pressable
                          onPress={() => times(k, 1)}
                          accessibilityRole="button"
                          accessibilityLabel={t('code.more')}
                          hitSlop={6}
                          style={styles.tiny}>
                          <Ionicons name="add" size={14} color="#fff" />
                        </Pressable>
                        <Pressable
                          onPress={() => remove(k)}
                          accessibilityRole="button"
                          accessibilityLabel={t('code.remove', { block: t('code.op.repeat') })}
                          hitSlop={6}
                          style={styles.tiny}>
                          <Ionicons name="close" size={14} color="#fff" />
                        </Pressable>
                      </View>
                      <View style={styles.wrap}>
                        {o.body.map((b, j) => (
                          <Chip
                            key={j}
                            op={b.op as Simple}
                            onPress={() => remove(k, j)}
                            label={t('code.remove', { block: t(`code.op.${b.op}`) })}
                          />
                        ))}
                      </View>
                    </View>
                  ) : (
                    <Chip
                      key={k}
                      op={o.op}
                      onPress={() => remove(k)}
                      label={t('code.remove', { block: t(`code.op.${o.op}`) })}
                    />
                  ),
                )}
              </View>
            </ScrollView>
            <Text style={{ color: 'rgba(235,238,255,0.7)', fontSize: 11 }}>
              {open !== null ? t('code.inside') : t('code.hint')}
            </Text>
            <Text style={styles.heading}>{t('code.tray')}</Text>
            <View style={styles.wrap}>
              {x.ops.map((op) => (
                <Pressable
                  key={op}
                  onPress={() => add(op)}
                  disabled={!!trail || (op === 'repeat' && open !== null)}
                  accessibilityRole="button"
                  style={[
                    styles.block,
                    { backgroundColor: BLOCK_COLOR[op] },
                    op === 'repeat' && open !== null && { opacity: 0.4 },
                  ]}>
                  <Ionicons name="add" size={14} color="#fff" />
                  <Text style={styles.blockText}>{t(`code.op.${op}`)}</Text>
                </Pressable>
              ))}
            </View>
            {!!message && <Text style={{ color: '#FF8FA6', fontFamily: BOLD }}>{message}</Text>}
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <Pressable
                onPress={() => {
                  setOps([]);
                  setOpen(null);
                  setMessage(null);
                }}
                disabled={!!trail}
                accessibilityRole="button"
                style={styles.secondary}>
                <Text style={{ fontFamily: BOLD, color: '#fff' }}>{t('ui.clear')}</Text>
              </Pressable>
              {x.tries >= 3 && (
                <Pressable
                  onPress={() => void giveUp()}
                  disabled={!!trail || g.busy}
                  accessibilityRole="button"
                  style={styles.secondary}>
                  <Text style={{ fontFamily: BOLD, color: '#fff' }}>{t('ui.skip')}</Text>
                </Pressable>
              )}
              <View style={{ flex: 1 }}>
                <GoldButton
                  title={t('code.run')}
                  icon="play"
                  disabled={!ops.length || !!trail || g.busy}
                  onPress={() => void go()}
                />
              </View>
            </View>
          </Panel>
        )}
      </SafeAreaView>
    </View>
  );
}

function Chip({ op, onPress, label }: { op: Simple; onPress: () => void; label: string }) {
  const { t } = useTranslation('tech');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.block, { backgroundColor: BLOCK_COLOR[op] }]}>
      <Text style={styles.blockText}>{t(`code.op.${op}`)}</Text>
    </Pressable>
  );
}

/** A program shown read-only (the solution after skipping). */
function Program({ ops }: { ops: CodeOp[] }) {
  const { t } = useTranslation('tech');
  return (
    <View style={styles.wrap}>
      {ops.map((o, k) =>
        o.op === 'repeat' ? (
          <View key={k} style={styles.repeat}>
            <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 13 }}>{t('code.times', { count: o.times })}</Text>
            <View style={styles.wrap}>
              {o.body.map((b, j) => (
                <View key={j} style={[styles.block, { backgroundColor: BLOCK_COLOR[b.op] }]}>
                  <Text style={styles.blockText}>{t(`code.op.${b.op}`)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View key={k} style={[styles.block, { backgroundColor: BLOCK_COLOR[o.op] }]}>
            <Text style={styles.blockText}>{t(`code.op.${o.op}`)}</Text>
          </View>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', left: Spacing.md, right: Spacing.md, top: 56 },
  bottom: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: Spacing.sm },
  tile: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2DD4BF',
    backgroundColor: 'rgba(45,212,191,0.18)',
    boxShadow: '0 0 10px rgba(45,212,191,0.6)',
  },
  dir: {
    position: 'absolute',
    bottom: -4,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#7C5CFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: { fontFamily: BOLD, fontSize: 10, color: Colors.reward, letterSpacing: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'flex-start' },
  block: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  blockText: { fontFamily: BOLD, color: '#fff', fontSize: 13 },
  repeat: {
    gap: 6,
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#27AE60',
    backgroundColor: 'rgba(39,174,96,0.15)',
    minWidth: 140,
  },
  repeatHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tiny: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PANEL,
  },
  secondary: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,92,255,0.35)',
  },
});
