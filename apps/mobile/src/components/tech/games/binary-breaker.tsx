import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Backdrop } from '@/components/lab/backdrop';
import { BOLD, Choice, GoldButton, Panel } from '@/components/lab/hud';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { BinaryBreakerRun, GameOutcome } from '@/lib/api';
import { TECH_SCENES } from '@/lib/games/tech';
import type { TechGame } from '@/lib/games/use-lab-run';

const value = (bits: number[]) => bits.reduce((n, b) => n * 2 + b, 0);

/**
 * Binary Breaker: open vaults by setting switches to a number, reading a binary number, decoding a
 * letter (ASCII) or adding two binary numbers. Place values are shown under every switch.
 */
export function BinaryBreaker({ g, run }: { g: TechGame; run: BinaryBreakerRun }) {
  const { t } = useTranslation('tech');
  const [i, setI] = useState(() => Math.min(run.at, run.vaults.length - 1));
  const v = run.vaults[i]!;
  const [bits, setBits] = useState<number[]>(() => Array(v.bits).fill(0));
  const [choice, setChoice] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const settable = v.type === 'set' || v.type === 'add';

  const unlock = async () => {
    const res = await g.answer(settable ? { step: i, bits } : { step: i, choice: choice ?? '' });
    if (!res) return;
    g.buzz(res.outcome.correct ? 'success' : 'error');
    setOutcome(res.outcome);
  };
  const next = () => {
    if (run.status !== 'playing' || run.hearts <= 0 || run.at >= run.vaults.length) {
      void g.finish();
      return;
    }
    const n = run.vaults[run.at]!;
    setI(run.at);
    setBits(Array(n.bits).fill(0));
    setChoice(null);
    setOutcome(null);
  };

  const shownBits = settable ? bits : (v.shown ?? []);
  return (
    <View style={StyleSheet.absoluteFill}>
      <Backdrop source={TECH_SCENES.vault} dim={0.3} />
      <SafeAreaView edges={['top']} style={styles.top} pointerEvents="none">
        <Panel style={{ gap: 2 }}>
          <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 14 }}>
            {t('binary.objective', { n: i + 1, total: run.vaults.length })}
          </Text>
          <Text style={{ color: Colors.reward, fontSize: 15, fontFamily: BOLD }}>
            {v.type === 'set'
              ? t('binary.set', { n: v.target })
              : v.type === 'add'
                ? t('binary.add')
                : v.type === 'read'
                  ? t('binary.read')
                  : t('binary.ascii')}
          </Text>
        </Panel>
      </SafeAreaView>

      <View style={styles.middle} pointerEvents="box-none">
        <Animated.View key={i} entering={ZoomIn.springify()} style={styles.lock}>
          {v.type === 'add' && (
            <>
              <BitRow bits={v.a ?? []} />
              <Text style={{ color: '#fff', fontFamily: BOLD, fontSize: 20 }}>+</Text>
              <BitRow bits={v.b ?? []} />
              <View style={styles.rule} />
            </>
          )}
          <View style={styles.row}>
            {shownBits.map((b, k) => {
              const place = 2 ** (shownBits.length - 1 - k);
              return (
                <View key={k} style={{ alignItems: 'center', gap: 4 }}>
                  <Pressable
                    disabled={!settable || !!outcome}
                    onPress={() => {
                      g.buzz('tap');
                      setBits(bits.map((x, j) => (j === k ? 1 - x : x)));
                    }}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: b === 1 }}
                    accessibilityLabel={t('binary.switchA11y', {
                      value: place,
                      state: b ? t('binary.on') : t('binary.off'),
                    })}
                    style={[styles.bit, b ? styles.bitOn : null]}>
                    <Text style={{ fontFamily: BOLD, fontSize: 20, color: b ? '#062B24' : '#9FF5E8' }}>{b}</Text>
                  </Pressable>
                  <Text style={styles.place}>{place}</Text>
                </View>
              );
            })}
          </View>
          {settable && <Text style={styles.value}>{t('binary.value', { n: value(bits) })}</Text>}
        </Animated.View>
      </View>

      <SafeAreaView edges={['bottom']} style={styles.bottom} pointerEvents="box-none">
        {outcome ? (
          <Animated.View entering={FadeInDown}>
            <Panel style={{ gap: Spacing.sm, borderColor: outcome.correct ? Colors.success : Colors.danger }}>
              <Text style={{ fontFamily: BOLD, fontSize: 17, color: outcome.correct ? Colors.success : '#FF8FA6' }}>
                {outcome.correct
                  ? t('binary.right', { points: outcome.points })
                  : t('binary.wrong', { answer: String(outcome.answer ?? '') })}
              </Text>
              <GoldButton title={t('binary.next')} icon="arrow-forward" onPress={next} />
            </Panel>
          </Animated.View>
        ) : (
          <Panel style={{ gap: Spacing.sm }}>
            {!settable && (
              <View style={styles.options}>
                {(v.options ?? []).map((o) => (
                  <View key={o} style={{ flexBasis: '45%', flexGrow: 1 }}>
                    <Choice label={o} state={choice === o ? 'selected' : 'idle'} onPress={() => setChoice(o)} />
                  </View>
                ))}
              </View>
            )}
            <GoldButton
              title={t('binary.unlock')}
              icon="lock-open"
              disabled={g.busy || (!settable && !choice)}
              onPress={() => void unlock()}
            />
          </Panel>
        )}
      </SafeAreaView>
    </View>
  );
}

function BitRow({ bits }: { bits: number[] }) {
  return (
    <View style={styles.row}>
      {bits.map((b, k) => (
        <View key={k} style={[styles.bit, styles.small, b ? styles.bitOn : null]}>
          <Text style={{ fontFamily: BOLD, fontSize: 15, color: b ? '#062B24' : '#9FF5E8' }}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', left: Spacing.md, right: Spacing.md, top: 56 },
  middle: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    top: 150,
    bottom: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: Spacing.md },
  lock: {
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 24,
    backgroundColor: 'rgba(6,20,30,0.85)',
    borderWidth: 2,
    borderColor: '#2DD4BF',
    boxShadow: '0 0 24px rgba(45,212,191,0.5)',
  },
  row: { flexDirection: 'row', gap: 4 },
  bit: {
    width: 38,
    height: 54,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2DD4BF',
    backgroundColor: 'rgba(45,212,191,0.08)',
  },
  small: { width: 30, height: 36 },
  bitOn: { backgroundColor: '#2DD4BF', boxShadow: '0 0 12px #2DD4BF' },
  place: { fontSize: 10, color: 'rgba(235,238,255,0.75)', fontFamily: BOLD },
  value: { fontFamily: BOLD, fontSize: 26, color: '#9FF5E8' },
  rule: { alignSelf: 'stretch', height: 2, backgroundColor: '#2DD4BF' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
