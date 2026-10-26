import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import type { GameOutcome, SpellcasterRun } from '@/lib/api';
import { ARENA_IMAGES, MONSTER_IMAGES, WIZARD_IMAGE } from '@/lib/games/english';

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

/** Spellcaster: spell the word from its clue to cast a spell at the world's guardian. */
export function Spellcaster({ level }: { level: number }) {
  const g = useGame<SpellcasterRun>('spellcaster', level);
  return (
    <GameShell g={g} step={{ n: (g.run?.at ?? 0) + 1, total: g.run?.spells.length ?? 9 }}>
      {(run) => <Board key={run.id} g={g} run={run} />}
    </GameShell>
  );
}

function Board({ g, run }: { g: Game<SpellcasterRun>; run: SpellcasterRun }) {
  const { t } = useTranslation('games');
  const { width, height } = useWindowDimensions();
  const [i, setI] = useState(0);
  const spell = run.spells[Math.min(i, run.spells.length - 1)]!;
  const [picked, setPicked] = useState<number[]>([]);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [spellStart, setSpellStart] = useState(() => Date.now());
  const answered = !!outcome;
  const guardian = t(`spell.worlds.${run.monster}.name`);
  const defeated = run.hp <= 0;

  const sceneW = Math.min(width, 560);
  const sceneH = Math.max(300, Math.min(height * 0.42, 420));
  const fire = useSharedValue(0);
  const hit = useSharedValue(0);
  const lunge = useSharedValue(0);
  const fireStyle = useAnimatedStyle(() => ({
    opacity: fire.value > 0 && fire.value < 1 ? 1 : 0,
    transform: [{ translateX: fire.value * sceneW * 0.42 }, { scale: 0.7 + fire.value * 0.5 }],
  }));
  const monsterStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: hit.value * 10 - lunge.value * sceneW * 0.25 }],
  }));

  const cast = async (timeout = false) => {
    if (answered || g.busy) return;
    const res = await g.answer({
      step: spell.id,
      ...(timeout ? { timeout: true } : { word: picked.map((k) => spell.stones[k]).join('') }),
      ms: Date.now() - spellStart,
    });
    if (!res) return;
    setOutcome(res.outcome);
    if (res.outcome.correct) {
      g.buzz('success');
      fire.set(0);
      fire.set(withTiming(1, { duration: 520 }));
      hit.set(
        withSequence(
          withTiming(0, { duration: 480 }),
          withTiming(1, { duration: 60 }),
          withTiming(-1, { duration: 60 }),
          withTiming(0, { duration: 60 }),
        ),
      );
    } else {
      g.buzz('error');
      lunge.set(withSequence(withTiming(1, { duration: 220 }), withTiming(0, { duration: 260 })));
    }
    setTimeout(
      () => {
        if (res.done) {
          void g.finish();
          return;
        }
        setOutcome(null);
        setPicked([]);
        setI(i + 1);
        setSpellStart(Date.now());
      },
      res.done ? 1800 : res.outcome.correct ? 1300 : 2200,
    );
  };

  const left = useCountdown(
    spell.seconds,
    !answered && !g.paused && run.status === 'playing',
    () => void cast(true),
    i,
  );

  const slots = Array.from({ length: spell.length }, (_, k) =>
    outcome && !outcome.correct ? outcome.word?.[k] : spell.stones[picked[k]!],
  );
  // The spell book sits inside two paddings and a border.
  const avail = Math.min(width, 560) - Spacing.md * 4 - 6;
  const stones = spell.stones.length;
  const stoneSize = Math.max(34, Math.min(58, Math.floor((avail - (stones - 1) * 8) / stones)));
  const slotSize = Math.max(34, Math.min(64, Math.floor((avail - (spell.length - 1) * 6) / spell.length)));

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: sceneH, width: '100%' }}>
        <Image
          source={ARENA_IMAGES[run.monster]}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          accessible={false}
        />
        <LinearGradient colors={['transparent', '#1C1668']} style={styles.sceneFade} pointerEvents="none" />
        <TopBar
          onPause={() => g.setPaused(true)}
          right={
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <CoinPill />
              <HeartsRow left={run.hearts} size={20} />
            </View>
          }
        />
        <View style={[styles.stage, { width: sceneW }]}>
          <Image
            source={WIZARD_IMAGE}
            style={[styles.wizard, { width: sceneW * 0.36, height: sceneW * 0.36 }]}
            contentFit="contain"
            accessible={false}
          />
          <Animated.View
            style={[styles.fireball, fireStyle, { left: sceneW * 0.28, bottom: sceneW * 0.2 }]}
            pointerEvents="none">
            <LinearGradient colors={['#FFF3B0', '#FF9F43', '#FF4D6D']} style={styles.fireCore} />
          </Animated.View>
          <View style={[styles.monsterWrap, { width: sceneW * 0.42 }]}>
            <View
              style={styles.hpTrack}
              accessibilityLabel={t('spell.hpA11y', { name: guardian, hp: run.hp, max: run.maxHp })}>
              <LinearGradient
                colors={['#FF4D6D', '#FF7A93']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: '100%', width: `${(run.hp / run.maxHp) * 100}%`, borderRadius: 999 }}
              />
            </View>
            <Text numberOfLines={1} style={styles.guardian}>
              {guardian}
            </Text>
            {!defeated ? (
              <Animated.View style={monsterStyle}>
                <Image
                  source={MONSTER_IMAGES[run.monster]}
                  style={{ width: sceneW * 0.38, height: sceneW * 0.38 }}
                  contentFit="contain"
                  accessible={false}
                />
              </Animated.View>
            ) : (
              <Animated.Text entering={ZoomIn.springify()} style={styles.defeated}>
                {t('spell.defeated', { name: guardian })}
              </Animated.Text>
            )}
          </View>
          <View style={styles.damage} pointerEvents="none">
            {outcome?.correct && <PointsPop value={`-${outcome.damage}`} color="#FF5A7A" size={40} />}
          </View>
        </View>
        {outcome && !outcome.correct && (
          <Animated.View entering={FadeIn.duration(120)} exiting={FadeOut} style={styles.hurt} pointerEvents="none" />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.timer}>
          <View style={[styles.timerFill, { width: `${(left / spell.seconds) * 100}%` }]} />
        </View>
        <View style={styles.book}>
          <Text style={styles.spellLabel}>{t('spell.spell')}</Text>
          <Text style={styles.prompt}>{spell.prompt}</Text>
          <View style={styles.slots}>
            {slots.map((ch, k) => (
              <GlossyTile
                key={k}
                letter={ch}
                size={slotSize}
                tone={ch ? (outcome ? (outcome.correct ? 'gold' : 'red') : 'gold') : 'empty'}
                onPress={
                  !answered && picked[k] !== undefined ? () => setPicked(picked.filter((_, j) => j !== k)) : undefined
                }
                accessibilityLabel={t('spell.slotA11y', { n: k + 1, letter: ch ?? '' })}
              />
            ))}
          </View>
          {outcome && (
            <Text
              style={{
                fontFamily: FONT,
                fontSize: 16,
                color: outcome.correct ? '#7CEBDD' : '#FF8FA6',
                textAlign: 'center',
              }}>
              {outcome.correct
                ? outcome.fast
                  ? t('spell.fast')
                  : t('spell.hit')
                : t('spell.miss', { word: outcome.word })}
            </Text>
          )}
          <View style={styles.stones}>
            {spell.stones.map((ch, k) => (
              <GlossyTile
                key={k}
                letter={ch}
                round
                size={stoneSize}
                tone={picked.includes(k) || answered ? 'dim' : 'teal'}
                onPress={() => {
                  if (answered || picked.includes(k) || picked.length >= spell.length) return;
                  g.buzz('tap');
                  setPicked([...picked, k]);
                }}
                accessibilityLabel={t('spell.stoneA11y', { letter: ch })}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <KoraBubble
          text={!answered && i === 0 && !picked.length ? t('spell.kora') : undefined}
          size={84}
          style={styles.kora}
        />
        <GradientButton
          title={t('spell.cast')}
          icon="sparkles"
          onPress={() => void cast()}
          disabled={picked.length !== spell.length || answered}
          busy={g.busy && !answered}
          style={{ marginRight: 80 }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  sceneFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 70 },
  stage: {
    flex: 1,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  wizard: { marginBottom: 4 },
  fireball: { position: 'absolute', width: 54, height: 54 },
  fireCore: { flex: 1, borderRadius: 27, shadowColor: '#FF9F43', shadowOpacity: 0.9, shadowRadius: 18, elevation: 10 },
  monsterWrap: { alignItems: 'center', gap: 4 },
  hpTrack: {
    width: '86%',
    height: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(10,8,40,0.7)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  guardian: { fontFamily: FONT, fontSize: 13, color: '#fff', textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 },
  defeated: { fontFamily: FONT, fontSize: 20, color: '#FFC857', textAlign: 'center', marginBottom: 40 },
  damage: { position: 'absolute', right: '22%', top: '52%' },
  hurt: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,77,109,0.25)' },
  body: { padding: Spacing.md, gap: Spacing.sm, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 120 },
  timer: { height: 8, borderRadius: 999, backgroundColor: 'rgba(10,8,40,0.6)', overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: 999, backgroundColor: '#2DD4BF' },
  book: {
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 28,
    backgroundColor: 'rgba(58,32,140,0.85)',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  spellLabel: { fontFamily: FONT, fontSize: 30, color: '#FFE3B8', textAlign: 'center' },
  prompt: { fontFamily: 'Manrope_700Bold', fontSize: 19, lineHeight: 26, color: '#FFE3B8', textAlign: 'center' },
  slots: { flexDirection: 'row', justifyContent: 'center', gap: 6, flexWrap: 'wrap', marginVertical: 4 },
  stones: { flexDirection: 'row', justifyContent: 'center', gap: 8, flexWrap: 'wrap' },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  kora: { position: 'absolute', right: Spacing.xs, bottom: 0 },
});
