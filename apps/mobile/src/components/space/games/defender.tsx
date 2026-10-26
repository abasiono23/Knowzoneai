import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BOLD } from '@/components/lab/hud';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { GalaxyDefenderRun } from '@/lib/api';
import type { SpaceGame } from '@/lib/games/use-lab-run';

import { Arcade } from '../arcade';
import { QuestionCard } from '../question-card';

/** Seconds of flying before each question (the first comes sooner). */
const FLY_SECONDS = [3, 6];

/**
 * Galaxy Defender: fly and dodge, and every few seconds a science question comes in. A right
 * answer powers the big beam and hits the boss; a wrong one costs a heart.
 */
export function Defender({ g, run, paused }: { g: SpaceGame; run: GalaxyDefenderRun; paused: boolean }) {
  const { t } = useTranslation('space');
  const [i, setI] = useState(() => Math.min(run.at, run.questions.length - 1));
  const [phase, setPhase] = useState<'fly' | 'question'>('fly');
  const [blast, setBlast] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const q = run.questions[i]!;
  // The boss is beaten by right answers (about seven of eight empties its health bar).
  const bossHp = Math.max(0, 1 - run.correct / Math.max(1, run.total - 1));

  useEffect(() => {
    if (phase !== 'fly' || paused || run.status !== 'playing') return;
    const id = setTimeout(
      () => {
        setBanner(t('defender.incoming'));
        setPhase('question');
      },
      (i === 0 ? FLY_SECONDS[0]! : FLY_SECONDS[1]!) * 1000,
    );
    return () => clearTimeout(id);
  }, [phase, paused, i, run.status, t]);

  useEffect(() => {
    if (!flash) return;
    const id = setTimeout(() => setFlash(false), 250);
    return () => clearTimeout(id);
  }, [flash]);

  useEffect(() => {
    if (!banner) return;
    const id = setTimeout(() => setBanner(null), 1400);
    return () => clearTimeout(id);
  }, [banner]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <Arcade
        mode="defender"
        running={phase === 'fly' && !paused && run.status === 'playing'}
        level={run.level}
        blast={blast}
        bossHp={bossHp}
        onHit={() => {
          g.buzz('error');
          setFlash(true);
        }}
      />
      {flash && (
        <Animated.View entering={FadeIn.duration(60)} exiting={FadeOut} style={styles.hitFlash} pointerEvents="none" />
      )}

      <SafeAreaView edges={['top']} style={styles.hud} pointerEvents="none">
        <View style={styles.bossBar}>
          <Text style={{ fontFamily: BOLD, color: '#FF8FA6', fontSize: 12 }}>{t('defender.boss')}</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${bossHp * 100}%`, backgroundColor: '#FF5A7A' }]} />
          </View>
        </View>
        <View style={styles.power}>
          <View style={styles.powerTrack}>
            <View style={[styles.powerFill, { height: `${(Math.min(run.streak, 5) / 5) * 100}%` }]} />
          </View>
          <Text style={{ fontFamily: BOLD, color: Colors.reward, fontSize: 10 }}>{t('defender.power')}</Text>
        </View>
      </SafeAreaView>

      {!!banner && (
        <Animated.View entering={ZoomIn} exiting={FadeOut} style={styles.banner} pointerEvents="none">
          <Text style={{ fontFamily: BOLD, fontSize: 22, color: Colors.reward, textAlign: 'center' }}>{banner}</Text>
        </Animated.View>
      )}

      {phase === 'question' && (
        <SafeAreaView edges={['bottom']} style={styles.card} pointerEvents="box-none">
          <QuestionCard
            key={i}
            label={t('defender.objective', { n: i + 1, total: run.questions.length })}
            q={q.q}
            options={q.options}
            seconds={paused ? undefined : (run as GalaxyDefenderRun).seconds}
            onAnswer={async (choice) => {
              const res = await g.answer(choice === null ? { step: i, timeout: true } : { step: i, choice });
              if (!res) return null;
              g.buzz(res.outcome.correct ? 'success' : 'error');
              if (res.outcome.correct) setBlast((b) => b + 1);
              return res.outcome;
            }}
            rightText={(o) =>
              `${t('defender.powerUp')} +${o.points}${o.combo && o.combo > 1 ? ` · ${t('defender.combo', { count: o.combo })}` : ''}`
            }
            nextLabel={i + 1 >= run.questions.length || run.hearts <= 0 ? t('defender.defeated') : t('ui.next')}
            onNext={() => {
              if (run.status !== 'playing' || run.at >= run.questions.length || run.hearts <= 0) void g.finish();
              else {
                setI(run.at);
                setPhase('fly');
              }
            }}
          />
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hud: { position: 'absolute', left: Spacing.md, right: Spacing.md, top: 64, gap: 8 },
  bossBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  track: { flex: 1, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5 },
  power: { position: 'absolute', left: 0, top: 220, alignItems: 'center', gap: 4 },
  powerTrack: {
    width: 14,
    height: 140,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  powerFill: { width: 14, borderRadius: 7, backgroundColor: Colors.reward },
  banner: { position: 'absolute', left: 0, right: 0, top: '38%', alignItems: 'center' },
  card: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: Spacing.md },
  hitFlash: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255,90,122,0.25)' },
});
