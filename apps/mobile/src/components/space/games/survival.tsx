import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BOLD, PANEL } from '@/components/lab/hud';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { AsteroidSurvivalRun } from '@/lib/api';
import type { SpaceGame } from '@/lib/games/use-lab-run';

import { Arcade } from '../arcade';
import { QuestionCard } from '../question-card';

type Upgrade = 'shield' | 'thrusters' | 'laser';
const UPGRADE_ICON: Record<Upgrade, keyof typeof Ionicons.glyphMap> = {
  shield: 'shield-half',
  thrusters: 'flame',
  laser: 'flash',
};
const MAX_UPGRADE = 3;

/**
 * Asteroid Survival: survive a wave of asteroids (your hull takes 3 hits, more with shield
 * upgrades), then solve a physics problem. A right answer earns an upgrade; getting through a wave
 * without hits scores a little more.
 */
export function Survival({ g, run, paused }: { g: SpaceGame; run: AsteroidSurvivalRun; paused: boolean }) {
  const { t } = useTranslation('space');
  const [i, setI] = useState(() => Math.min(run.at, run.challenges.length - 1));
  const [phase, setPhase] = useState<'wave' | 'challenge'>('wave');
  const [hits, setHits] = useState(0);
  const [upgrades, setUpgrades] = useState<Record<Upgrade, number>>({ shield: 0, thrusters: 0, laser: 0 });
  const waveSeconds = 14 + run.level;
  const [left, setLeft] = useState(waveSeconds);
  const leftRef = useRef(waveSeconds);
  const [flash, setFlash] = useState(false);
  const hull = 3 + upgrades.shield;
  const c = run.challenges[i]!;

  // The wave clock (it stops while paused and carries on after).
  useEffect(() => {
    if (phase !== 'wave' || paused || run.status !== 'playing') return;
    const started = Date.now();
    const from = leftRef.current;
    const id = setInterval(() => {
      const remaining = Math.max(0, from - (Date.now() - started) / 1000);
      leftRef.current = remaining;
      setLeft(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        setPhase('challenge');
      }
    }, 200);
    return () => clearInterval(id);
  }, [phase, paused, run.status]);

  useEffect(() => {
    if (!flash) return;
    const id = setTimeout(() => setFlash(false), 250);
    return () => clearTimeout(id);
  }, [flash]);

  const nextWave = () => {
    if (run.status !== 'playing' || run.at >= run.challenges.length || run.hearts <= 0) {
      void g.finish();
      return;
    }
    setI(run.at);
    setHits(0);
    leftRef.current = waveSeconds;
    setLeft(waveSeconds);
    setPhase('wave');
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <Arcade
        mode="survival"
        running={phase === 'wave' && !paused && run.status === 'playing'}
        level={run.level}
        wave={i + 1}
        thrusters={upgrades.thrusters}
        laser={upgrades.laser}
        onHit={() => {
          g.buzz('error');
          setFlash(true);
          setHits(hits + 1);
          if (hits + 1 >= hull) setPhase('challenge');
        }}
      />
      {flash && (
        <Animated.View entering={FadeIn.duration(60)} exiting={FadeOut} style={styles.hitFlash} pointerEvents="none" />
      )}

      <SafeAreaView edges={['top']} style={styles.hud} pointerEvents="none">
        <View style={styles.row}>
          <View>
            <Text style={{ fontFamily: BOLD, fontSize: 24, color: '#fff' }}>{t('survival.wave', { n: i + 1 })}</Text>
            <Text
              style={{
                fontFamily: BOLD,
                fontSize: 16,
                color: Colors.reward,
              }}>{`0:${String(Math.ceil(left)).padStart(2, '0')}`}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Text style={{ fontSize: 11, color: 'rgba(235,238,255,0.8)' }}>{t('survival.hull')}</Text>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {Array.from({ length: hull }, (_, k) => (
                <View key={k} style={[styles.pip, k < hull - hits ? { backgroundColor: '#2DD4BF' } : null]} />
              ))}
            </View>
          </View>
        </View>
        <View style={[styles.row, { justifyContent: 'flex-start', gap: 8 }]}>
          {(Object.keys(UPGRADE_ICON) as Upgrade[]).map((u) => (
            <View key={u} style={styles.upgrade}>
              <Ionicons
                name={UPGRADE_ICON[u]}
                size={14}
                color={upgrades[u] ? Colors.reward : 'rgba(255,255,255,0.5)'}
              />
              <Text style={{ fontSize: 11, color: '#fff' }}>{t(`survival.upgrades.${u}`)}</Text>
              <Text style={{ fontFamily: BOLD, fontSize: 11, color: Colors.reward }}>{upgrades[u]}</Text>
            </View>
          ))}
        </View>
      </SafeAreaView>

      {phase === 'challenge' && (
        <SafeAreaView edges={['bottom']} style={styles.card} pointerEvents="box-none">
          <Animated.Text entering={ZoomIn} style={styles.status}>
            {hits >= hull ? t('survival.destroyed') : t('survival.survived')}
          </Animated.Text>
          <QuestionCard
            key={i}
            label={t('survival.challenge')}
            q={c.q}
            options={c.options}
            seconds={paused ? undefined : run.seconds}
            onAnswer={async (choice) => {
              const res = await g.answer(
                choice === null ? { step: i, timeout: true, hits } : { step: i, choice, hits },
              );
              if (!res) return null;
              g.buzz(res.outcome.correct ? 'success' : 'error');
              return res.outcome;
            }}
            extra={(o) =>
              o.correct && run.status === 'playing' && run.at < run.challenges.length && run.hearts > 0 ? (
                <View style={{ gap: 6 }}>
                  <Text style={{ fontFamily: BOLD, color: '#fff' }}>{t('survival.choose')}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {(Object.keys(UPGRADE_ICON) as Upgrade[]).map((u) => {
                      const maxed = upgrades[u] >= MAX_UPGRADE;
                      return (
                        <Pressable
                          key={u}
                          disabled={maxed}
                          onPress={() => {
                            setUpgrades({ ...upgrades, [u]: upgrades[u] + 1 });
                            nextWave();
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`${t(`survival.upgrades.${u}`)}: ${t(`survival.upgradeHow.${u}`)}`}
                          style={({ pressed }) => [
                            styles.pick,
                            maxed && { opacity: 0.4 },
                            pressed && { opacity: 0.8 },
                          ]}>
                          <Ionicons name={UPGRADE_ICON[u]} size={26} color={Colors.reward} />
                          <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 13 }}>
                            {t(`survival.upgrades.${u}`)}
                          </Text>
                          <Text style={{ color: 'rgba(235,238,255,0.8)', fontSize: 11, textAlign: 'center' }}>
                            {t(`survival.upgradeHow.${u}`)}
                          </Text>
                          <Text style={{ fontFamily: BOLD, color: Colors.reward, fontSize: 11 }}>
                            {t('survival.level', { level: upgrades[u] + 1 })}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <Pressable onPress={nextWave} accessibilityRole="button" style={styles.next}>
                  <Text style={{ fontFamily: BOLD, color: '#3A2600', fontSize: 16 }}>{t('ui.next')}</Text>
                  <Ionicons name="arrow-forward" size={18} color="#3A2600" />
                </Pressable>
              )
            }
            onNext={nextWave}
          />
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hud: { position: 'absolute', left: Spacing.md, right: Spacing.md, top: 64, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8 },
  pip: { width: 18, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.18)' },
  upgrade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: PANEL,
  },
  card: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: Spacing.md, gap: Spacing.sm },
  status: {
    fontFamily: BOLD,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowRadius: 6,
  },
  pick: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,200,87,0.5)',
    backgroundColor: 'rgba(124,92,255,0.25)',
  },
  next: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 999,
    backgroundColor: Colors.reward,
  },
  hitFlash: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255,90,122,0.25)' },
});
