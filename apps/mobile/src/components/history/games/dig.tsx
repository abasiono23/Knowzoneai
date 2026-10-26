import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Backdrop } from '@/components/lab/backdrop';
import { LabHall } from '@/components/lab/hall';
import { BOLD, GoldButton, Panel } from '@/components/lab/hud';
import { QuestionCard } from '@/components/space/question-card';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { LostCivilizationRun } from '@/lib/api';
import { ARTIFACTS, DIG_SCENES, digPlace, type DigSpot } from '@/lib/games/history';
import type { HistoryGame } from '@/lib/games/use-lab-run';

const SPOTS: DigSpot[] = ['a', 'b', 'c'];
/** Taps of the brush to uncover a find. */
const BRUSHES = 5;

type Dig = LostCivilizationRun['digs'][number];
const artOf = (dig: Dig, n: number) => {
  const f = dig.finds[n]!;
  return ARTIFACTS[f.art === 'hero' ? dig.art : f.art] ?? ARTIFACTS.pottery!;
};

/**
 * Lost Civilization: walk to the dig spots, brush away the soil to uncover three artifacts, read
 * their clues, then name the civilization (which unlocks its city) and answer a question about it.
 */
export function LostCivilization({ g, run, paused }: { g: HistoryGame; run: LostCivilizationRun; paused: boolean }) {
  const { t } = useTranslation('history');
  const next = useTranslation('space').t('ui.next');
  const seeResults = useTranslation('lab').t('result.see');
  const [k, setK] = useState(() => Math.min(Math.floor(run.at / 2), run.digs.length - 1));
  const dig = run.digs[k]!;
  const [dug, setDug] = useState<DigSpot[]>(() => (dig.mystery.result ? SPOTS : []));
  const [phase, setPhase] = useState<'walk' | 'digging' | 'found' | 'mystery' | 'follow'>(() =>
    dig.mystery.result ? 'follow' : 'walk',
  );
  const [brushed, setBrushed] = useState(0);
  const unlocked = run.digs.filter((d) => d.mystery.result?.correct).length;
  const n = dug.length; // the find being dug up now (or the last one found)

  const nextDig = () => {
    if (run.status !== 'playing' || run.hearts <= 0 || k + 1 >= run.digs.length) {
      void g.finish();
      return;
    }
    setK(k + 1);
    setDug([]);
    setBrushed(0);
    setPhase('walk');
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      {phase === 'walk' ? (
        <LabHall<DigSpot>
          key={dig.id}
          place={digPlace(dig.dig)}
          ns="history"
          names={{ a: t('dig.spot', { n: 1 }), b: t('dig.spot', { n: 2 }), c: t('dig.spot', { n: 3 }) }}
          openLabel={t('dig.dig')}
          badges={Object.fromEntries(dug.map((s) => [s, '✓']))}
          goal={SPOTS.find((s) => !dug.includes(s)) ?? null}
          paused={paused}
          topReserve={230}
          onOpen={(s) => {
            if (dug.includes(s)) return;
            g.buzz('tap');
            setDug([...dug, s]);
            setBrushed(0);
            setPhase('digging');
          }}
        />
      ) : (
        <Backdrop source={DIG_SCENES[dig.dig]} dim={0.35} />
      )}

      <SafeAreaView edges={['top']} style={styles.top} pointerEvents="none">
        <Panel style={{ gap: 4 }}>
          <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 15 }}>
            {t('dig.objective', { n: k + 1, total: run.digs.length })} ·{' '}
            {t('dig.finds', { done: phase === 'digging' ? n - 1 : n, total: 3 })}
          </Text>
          <Text style={{ color: Colors.reward, fontSize: 12, fontFamily: BOLD }}>
            {t('dig.cities', { count: unlocked, total: run.digs.length })}
          </Text>
          {/* The notebook: clues found so far. */}
          {dig.finds.slice(0, phase === 'digging' ? n - 1 : n).map((f) => (
            <Text key={f.name} style={{ color: 'rgba(235,238,255,0.9)', fontSize: 12 }}>
              • <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 12 }}>{f.name}:</Text> {f.clue}
            </Text>
          ))}
        </Panel>
      </SafeAreaView>

      {phase === 'digging' && (
        <View style={styles.middle}>
          <Pressable
            onPress={() => {
              g.buzz('tap');
              const b = brushed + 1;
              setBrushed(b);
              if (b >= BRUSHES) setPhase('found');
            }}
            accessibilityRole="button"
            accessibilityLabel={t('dig.digA11y')}
            style={styles.mound}>
            <Image source={artOf(dig, n - 1).src} style={styles.buried} contentFit="contain" accessible={false} />
            {/* Layers of soil that come away with each brush. */}
            {Array.from({ length: BRUSHES }, (_, j) => (
              <View
                key={j}
                pointerEvents="none"
                style={[
                  styles.soil,
                  {
                    opacity: j < BRUSHES - brushed ? 1 : 0,
                    bottom: j * 14,
                    width: 260 - j * 34,
                    height: 90 - j * 6,
                    backgroundColor: ['#7A4A26', '#8B5A2E', '#9C6A38', '#A97643', '#B5834F'][j],
                  },
                ]}
              />
            ))}
          </Pressable>
          <Animated.View entering={FadeIn} style={styles.hint}>
            <Ionicons name="brush" size={18} color={Colors.reward} />
            <Text style={{ color: '#fff', fontFamily: BOLD }}>{t('dig.tap')}</Text>
          </Animated.View>
        </View>
      )}

      {phase === 'found' && (
        <View style={styles.middle} pointerEvents="box-none">
          <Animated.View entering={ZoomIn.springify()} style={{ alignSelf: 'stretch' }}>
            <Panel style={{ gap: Spacing.sm, alignItems: 'center', borderColor: Colors.reward }}>
              <Text style={{ fontFamily: BOLD, color: Colors.reward, letterSpacing: 1, fontSize: 12 }}>
                {t('dig.found')}
              </Text>
              <Image
                source={artOf(dig, n - 1).src}
                style={{ height: 150, width: 150 * artOf(dig, n - 1).aspect }}
                contentFit="contain"
                accessibilityLabel={dig.finds[n - 1]!.name}
              />
              <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 18 }}>{dig.finds[n - 1]!.name}</Text>
              <Text style={{ color: 'rgba(235,238,255,0.9)', textAlign: 'center' }}>{dig.finds[n - 1]!.clue}</Text>
              <View style={{ alignSelf: 'stretch' }}>
                <GoldButton
                  title={n >= 3 ? t('dig.solve') : t('dig.collect')}
                  icon={n >= 3 ? 'search' : 'add-circle'}
                  onPress={() => setPhase(n >= 3 ? 'mystery' : 'walk')}
                />
              </View>
            </Panel>
          </Animated.View>
        </View>
      )}

      {(phase === 'mystery' || phase === 'follow') && (
        <SafeAreaView edges={['bottom']} style={styles.bottom} pointerEvents="box-none">
          <View style={styles.shelf}>
            {dig.finds.map((f, j) => (
              <Image
                key={f.name}
                source={artOf(dig, j).src}
                style={{ height: 64, width: 64 * artOf(dig, j).aspect }}
                contentFit="contain"
                accessibilityLabel={f.name}
              />
            ))}
          </View>
          {phase === 'mystery' ? (
            <QuestionCard
              key={dig.mystery.id}
              q={dig.mystery.q}
              options={dig.mystery.options}
              onAnswer={async (choice) => {
                const res = await g.answer(
                  choice === null ? { step: dig.mystery.id, timeout: true } : { step: dig.mystery.id, choice },
                );
                if (!res) return null;
                g.buzz(res.outcome.correct ? 'success' : 'error');
                return res.outcome;
              }}
              rightText={(o) => `${t('dig.unlocked')} +${o.points}`}
              extra={(o) => (
                <View style={{ gap: Spacing.sm }}>
                  {!!o.about && <Text style={{ color: 'rgba(235,238,255,0.9)' }}>{o.about}</Text>}
                  <GoldButton
                    title={next}
                    icon="arrow-forward"
                    onPress={() => (run.status !== 'playing' || run.hearts <= 0 ? void g.finish() : setPhase('follow'))}
                  />
                </View>
              )}
              onNext={() => setPhase('follow')}
            />
          ) : dig.followUp ? (
            <QuestionCard
              key={dig.followUp.id}
              q={dig.followUp.q}
              options={dig.followUp.options}
              onAnswer={async (choice) => {
                const res = await g.answer(
                  choice === null ? { step: dig.followUp!.id, timeout: true } : { step: dig.followUp!.id, choice },
                );
                if (!res) return null;
                g.buzz(res.outcome.correct ? 'success' : 'error');
                return res.outcome;
              }}
              nextLabel={k + 1 >= run.digs.length ? seeResults : t('dig.next')}
              onNext={nextDig}
            />
          ) : null}
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', left: Spacing.md, right: Spacing.md, top: 56 },
  bottom: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: Spacing.md, gap: Spacing.sm },
  middle: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingTop: 120,
  },
  mound: { width: 280, height: 220, alignItems: 'center', justifyContent: 'flex-end' },
  buried: { position: 'absolute', bottom: 20, width: 150, height: 150 },
  soil: {
    position: 'absolute',
    alignSelf: 'center',
    borderTopLeftRadius: 140,
    borderTopRightRadius: 140,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(14,18,44,0.82)',
  },
  shelf: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 14,
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(14,18,44,0.7)',
  },
});
