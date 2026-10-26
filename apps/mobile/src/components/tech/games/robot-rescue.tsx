import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Backdrop } from '@/components/lab/backdrop';
import { BOLD, GoldButton, Panel } from '@/components/lab/hud';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { GameOutcome, RobotCard, RobotRescueRun } from '@/lib/api';
import { runRobot, TECH_SCENES, TECH_SPRITES } from '@/lib/games/tech';
import type { TechGame } from '@/lib/games/use-lab-run';

const ICON = { up: 'arrow-up', right: 'arrow-forward', down: 'arrow-down', left: 'arrow-back' } as const;

/**
 * Robot Rescue: program the robot with arrow cards (each card moves it N steps) to reach the kitten,
 * pick it up, and from level 3 bring it to the home pad and drop it. It stops at crates and water.
 */
export function RobotRescue({ g, run }: { g: TechGame; run: RobotRescueRun }) {
  const { t } = useTranslation('tech');
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [i, setI] = useState(() => Math.min(run.at, run.puzzles.length - 1));
  const x = run.puzzles[i]!;
  const [cards, setCards] = useState<RobotCard[]>([]);
  const [trail, setTrail] = useState<{ x: number; y: number; carrying: boolean }[] | null>(null);
  const [shown, setShown] = useState(0);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!trail || shown >= trail.length - 1) return;
    const id = setTimeout(() => setShown((n) => n + 1), 260);
    return () => clearTimeout(id);
  }, [trail, shown]);

  const addMove = (dir: 'up' | 'right' | 'down' | 'left') => {
    if (trail || outcome) return;
    g.buzz('tap');
    const last = cards.at(-1);
    // Tapping the same arrow again adds a step to the last card.
    if (last && 'dir' in last && last.dir === dir && last.n < 9)
      setCards([...cards.slice(0, -1), { dir, n: last.n + 1 }]);
    else if (cards.length < x.maxCards) setCards([...cards, { dir, n: 1 }]);
  };
  const addOp = (op: 'pick' | 'drop') => {
    if (trail || outcome || cards.length >= x.maxCards) return;
    g.buzz('tap');
    setCards([...cards, { op }]);
  };

  const go = async () => {
    const sim = runRobot(cards, x);
    setMessage(null);
    setTrail(sim.trail);
    setShown(0);
    const res = await g.answer({ step: i, cards });
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
            o.end === 'bump'
              ? t('robot.bump')
              : o.end === 'missed'
                ? t('robot.missed')
                : o.end === 'cards'
                  ? t('robot.tooMany')
                  : t('robot.short'),
          );
        }
      },
      sim.trail.length * 260 + 250,
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
    setCards([]);
    setTrail(null);
    setOutcome(null);
    setMessage(null);
  };

  // The board, as big as fits the top half.
  const area = { top: 150, h: Math.max(180, size.h * 0.48 - 150), w: size.w - 2 * Spacing.md };
  const cell = Math.min(64, area.w / x.w, area.h / x.h);
  const ox = Spacing.md + (area.w - x.w * cell) / 2;
  const oy = area.top + (area.h - x.h * cell) / 2;
  const pos = trail ? trail[Math.min(shown, trail.length - 1)]! : { x: x.robot[0], y: x.robot[1], carrying: false };
  const kittenWithRobot = pos.carrying;
  const blockedKind = (cx: number, cy: number) => {
    const k = x.blocked.findIndex(([bx, by]) => bx === cx && by === cy);
    return k < 0 ? null : (x.kinds[k] ?? 'crate');
  };

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      <Backdrop source={TECH_SCENES.robot} dim={0.25} />
      {size.w > 0 && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: x.h }, (_, cy) =>
            Array.from({ length: x.w }, (_, cx) => {
              const kind = blockedKind(cx, cy);
              const home = x.home && x.home[0] === cx && x.home[1] === cy;
              return (
                <View
                  key={`${cx},${cy}`}
                  style={[
                    styles.cell,
                    { left: ox + cx * cell, top: oy + cy * cell, width: cell - 2, height: cell - 2 },
                    kind === 'water' && styles.water,
                    home && styles.home,
                  ]}>
                  {kind === 'crate' && (
                    <Image
                      source={TECH_SPRITES.crate.src}
                      style={{ width: cell * 0.8, height: cell * 0.8 }}
                      contentFit="contain"
                      accessible={false}
                    />
                  )}
                  {home && <Ionicons name="home" size={cell * 0.4} color="#FFE8A3" />}
                </View>
              );
            }),
          )}
          {!kittenWithRobot && !(outcome?.correct && !x.home) && (
            <Image
              source={TECH_SPRITES.kitten.src}
              style={{
                position: 'absolute',
                left: ox + x.kitten[0] * cell + cell * 0.1,
                top: oy + x.kitten[1] * cell + cell * 0.05,
                width: cell * 0.8,
                height: cell * 0.85,
              }}
              contentFit="contain"
              accessible={false}
            />
          )}
          <View
            style={{
              position: 'absolute',
              left: ox + pos.x * cell,
              top: oy + pos.y * cell - cell * 0.15,
              width: cell,
              height: cell,
              alignItems: 'center',
            }}>
            <Image
              source={TECH_SPRITES.robot.src}
              style={{ width: cell * 0.85, height: cell * 0.95 }}
              contentFit="contain"
              accessible={false}
            />
            {kittenWithRobot && (
              <Image
                source={TECH_SPRITES.kitten.src}
                style={{ position: 'absolute', top: -cell * 0.3, width: cell * 0.5, height: cell * 0.5 }}
                contentFit="contain"
                accessible={false}
              />
            )}
          </View>
        </View>
      )}

      <SafeAreaView edges={['top']} style={styles.top} pointerEvents="none">
        <Panel style={{ gap: 2 }}>
          <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 14 }}>
            {x.home
              ? t('robot.objectiveHome', { n: i + 1, total: run.puzzles.length })
              : t('robot.objective', { n: i + 1, total: run.puzzles.length })}
          </Text>
          <Text style={{ color: Colors.reward, fontSize: 12, fontFamily: BOLD }}>
            {t('robot.cards', { used: cards.length, max: x.maxCards })} · {t('robot.best', { count: x.best })} ·{' '}
            {t('ui.tries', { count: x.tries })}
          </Text>
        </Panel>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.bottom} pointerEvents="box-none">
        {outcome ? (
          <Animated.View entering={FadeInDown}>
            <Panel style={{ gap: Spacing.sm, borderColor: outcome.correct ? Colors.success : Colors.reward }}>
              <Text style={{ fontFamily: BOLD, fontSize: 17, color: outcome.correct ? Colors.success : '#fff' }}>
                {outcome.correct ? t('robot.saved', { points: outcome.points }) : t('ui.solution')}
              </Text>
              {outcome.correct && cards.length <= x.best && (
                <Text style={{ color: Colors.reward, fontFamily: BOLD }}>{t('robot.shortest')}</Text>
              )}
              <GoldButton title={t('robot.next')} icon="arrow-forward" onPress={next} />
            </Panel>
          </Animated.View>
        ) : (
          <Panel style={{ gap: Spacing.sm, padding: 10 }}>
            <Text style={styles.heading}>{t('robot.program')}</Text>
            <View style={styles.wrap}>
              {cards.map((c, k) => (
                <Pressable
                  key={k}
                  onPress={() => !trail && setCards(cards.filter((_, j) => j !== k))}
                  accessibilityRole="button"
                  accessibilityLabel={`${'dir' in c ? t('robot.step', { dir: t(`robot.dirs.${c.dir}`), n: c.n }) : t(`robot.${c.op}`)}: ${t('robot.remove')}`}
                  style={[styles.card, 'op' in c && { backgroundColor: '#27AE60' }]}>
                  {'dir' in c ? (
                    <>
                      <Ionicons name={ICON[c.dir]} size={16} color="#fff" />
                      <Text style={styles.cardText}>{c.n}</Text>
                    </>
                  ) : (
                    <Text style={styles.cardText}>{t(`robot.${c.op}`)}</Text>
                  )}
                </Pressable>
              ))}
            </View>
            <Text style={{ color: 'rgba(235,238,255,0.7)', fontSize: 11 }}>{t('robot.hint')}</Text>
            <View style={[styles.wrap, { justifyContent: 'center' }]}>
              {(['up', 'left', 'down', 'right'] as const).map((d) => (
                <Pressable
                  key={d}
                  onPress={() => addMove(d)}
                  disabled={!!trail}
                  accessibilityRole="button"
                  accessibilityLabel={t(`robot.dirs.${d}`)}
                  style={styles.arrow}>
                  <Ionicons name={ICON[d]} size={22} color="#fff" />
                </Pressable>
              ))}
              <Pressable
                onPress={() => addOp('pick')}
                disabled={!!trail}
                accessibilityRole="button"
                style={[styles.arrow, styles.op]}>
                <Text style={styles.cardText}>{t('robot.pick')}</Text>
              </Pressable>
              {!!x.home && (
                <Pressable
                  onPress={() => addOp('drop')}
                  disabled={!!trail}
                  accessibilityRole="button"
                  style={[styles.arrow, styles.op]}>
                  <Text style={styles.cardText}>{t('robot.drop')}</Text>
                </Pressable>
              )}
            </View>
            {!!message && <Text style={{ color: '#FF8FA6', fontFamily: BOLD }}>{message}</Text>}
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <Pressable
                onPress={() => setCards([])}
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
                  title={t('robot.go')}
                  icon="rocket"
                  disabled={!cards.length || !!trail || g.busy}
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

const styles = StyleSheet.create({
  top: { position: 'absolute', left: Spacing.md, right: Spacing.md, top: 56 },
  bottom: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: Spacing.sm },
  cell: {
    position: 'absolute',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,145,180,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  water: { backgroundColor: 'rgba(43,120,214,0.85)', borderColor: '#7FC4FF' },
  home: { backgroundColor: 'rgba(255,200,87,0.35)', borderColor: Colors.reward, borderWidth: 2 },
  heading: { fontFamily: BOLD, fontSize: 10, color: Colors.reward, letterSpacing: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#2D9CDB',
  },
  cardText: { fontFamily: BOLD, color: '#fff', fontSize: 13 },
  arrow: {
    minWidth: 48,
    height: 44,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D9CDB',
  },
  op: { backgroundColor: '#27AE60' },
  secondary: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,92,255,0.35)',
  },
});
