import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FONT, GameBackground, HeartsStat, PrimaryButton, SecondaryButton, Stat, W } from '@/components/games/ui';
import { AnswerButton, Kora, Stars } from '@/components/world/world-ui';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { useWorld } from '@/lib/world/store';

/** The practice question; its text comes from world:tutorial.sample. */
const SAMPLE = { options: ['mars', 'earth', 'jupiter', 'venus'] as const, correct: 1 };
const RULES = [
  ['star-outline', 'stars'],
  ['lock-open-outline', 'unlock'],
  ['refresh', 'replay'],
  ['ribbon-outline', 'collect'],
] as const;
const STEPS = ['answer', 'hearts', 'hint', 'stars'] as const;

/** A short, hands-on tutorial before the first level: answer, hearts and time, hints, stars. */
export default function GameTutorialScreen() {
  const { t } = useTranslation('world');
  const { next } = useLocalSearchParams<{ next?: string }>();
  const { finishTutorial } = useWorld();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [hinted, setHinted] = useState(false);
  const s = STEPS[step];

  const finish = () => {
    finishTutorial();
    if (next) router.replace(next as Href);
    else if (router.canGoBack()) router.back();
    else router.replace('/play');
  };

  return (
    <GameBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.top}>
          <Text style={styles.eyebrow}>{t('tutorial.eyebrow', { step: step + 1, total: STEPS.length }).toUpperCase()}</Text>
          <Pressable onPress={finish} accessibilityRole="button" style={styles.skip}>
            <Text style={styles.skipText}>{t('actions.skip', { ns: 'common' })}</Text>
          </Pressable>
        </View>
        <View style={styles.steps}>
          {STEPS.map((x, k) => (
            <View key={x} style={[styles.step, k <= step && { backgroundColor: W.ink }]} />
          ))}
        </View>
        <ScrollView contentContainerStyle={styles.body}>
          <Animated.View key={step} entering={FadeIn.duration(200)} style={{ gap: 14 }}>
            {s === 'answer' && (
              <>
                <Kora>{t('tutorial.answerIntro')}</Kora>
                <View style={styles.card}>
                  <Text style={styles.question}>{t('tutorial.sample.question')}</Text>
                </View>
                {SAMPLE.options.map((o, k) => (
                  <AnswerButton
                    key={o}
                    label={t(`tutorial.sample.${o}`)}
                    index={k}
                    disabled={picked !== null}
                    state={picked === null ? 'idle' : k === SAMPLE.correct ? 'right' : k === picked ? 'wrong' : 'dim'}
                    onPress={() => setPicked(k)}
                  />
                ))}
                {picked !== null && (
                  <Animated.View entering={FadeInDown}>
                    <Kora mood="happy">{picked === SAMPLE.correct ? t('tutorial.right') : t('tutorial.wrong')}</Kora>
                  </Animated.View>
                )}
              </>
            )}
            {s === 'hearts' && (
              <>
                <View style={[styles.card, styles.demo]}>
                  <HeartsStat left={2} />
                  <Stat icon="trending-up" text="×3" label={t('adv.streak', { count: 3 })} />
                  <Stat icon="time-outline" text="0:18" />
                </View>
                <Kora>{t('tutorial.hearts')}</Kora>
              </>
            )}
            {s === 'hint' && (
              <>
                <View style={styles.card}>
                  <Text style={styles.question}>{t('tutorial.sample.question')}</Text>
                </View>
                {hinted && (
                  <Animated.View entering={FadeIn}>
                    <Kora mood="happy">{t('tutorial.sample.hint')}</Kora>
                  </Animated.View>
                )}
                <SecondaryButton icon="bulb-outline" title={hinted ? t('tutorial.nudged') : t('adv.hint')} disabled={hinted} onPress={() => setHinted(true)} />
                <Kora>{t('adv.hintIntro')}</Kora>
              </>
            )}
            {s === 'stars' && (
              <>
                <View style={[styles.card, { alignItems: 'center', gap: 10 }]}>
                  <Stars value={3} size={40} animate />
                  <Text style={styles.question}>{t('tutorial.starsTitle')}</Text>
                </View>
                <View style={styles.card}>
                  {RULES.map(([icon, id]) => (
                    <View key={id} style={styles.row}>
                      <Ionicons name={icon} size={18} color={W.ink} />
                      <Text style={[styles.text, { flex: 1 }]}>{t(`tutorial.rules.${id}`)}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </Animated.View>
        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton
            title={step === STEPS.length - 1 ? t('tutorial.ready') : t('actions.next', { ns: 'common' })}
            icon="arrow-forward"
            disabled={s === 'answer' && picked === null}
            onPress={() => (step === STEPS.length - 1 ? finish() : setStep(step + 1))}
          />
        </View>
      </SafeAreaView>
    </GameBackground>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, minHeight: 52, maxWidth: 560, width: '100%', alignSelf: 'center' },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  skip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  skipText: { fontFamily: Fonts.bold, fontSize: 15, color: W.inkSoft },
  steps: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, maxWidth: 560, width: '100%', alignSelf: 'center' },
  step: { flex: 1, height: 4, borderRadius: 2, backgroundColor: W.line },
  body: { padding: 16, gap: 14, maxWidth: 560, width: '100%', alignSelf: 'center' },
  card: { padding: 16, gap: 10, borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  demo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  question: { fontFamily: FONT, fontSize: 19, lineHeight: 26, color: W.ink },
  text: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: W.ink },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center', minHeight: 32 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: W.line, backgroundColor: W.surface },
});
