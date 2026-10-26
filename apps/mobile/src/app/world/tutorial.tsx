import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnswerButton, Hearts, Kora, Stars } from '@/components/world/world-ui';
import { Button, ProgressBar, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { useWorld } from '@/lib/world/store';

/** The practice question; its text comes from world:tutorial.sample. */
const SAMPLE = {
  options: ['mars', 'earth', 'jupiter', 'venus'] as const,
  correct: 1,
};
const RULES = [
  ['star', 'stars'],
  ['lock-open', 'unlock'],
  ['refresh', 'replay'],
  ['gift', 'collect'],
] as const;

const STEPS = ['answer', 'hearts', 'hint', 'stars'] as const;

/** Screen 138: an interactive tutorial with a practice question. */
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
    <SafeAreaView style={styles.wrap}>
      <View style={styles.top}>
        <Text variant="label" color={Colors.reward}>
          {t('tutorial.eyebrow', { step: step + 1, total: STEPS.length })}
        </Text>
        <Button variant="ghost" title={t('actions.skip', { ns: 'common' })} onPress={finish} style={{ paddingHorizontal: 0, minHeight: 0 }} />
      </View>
      <View style={{ paddingHorizontal: Spacing.md }}>
        <ProgressBar progress={(step + 1) / STEPS.length} height={6} colors={Gradients.reward} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Animated.View key={step} entering={FadeInRight.duration(250)} style={{ gap: Spacing.md }}>
          {s === 'answer' && (
            <>
              <Kora>{t('tutorial.answerIntro')}</Kora>
              <Text variant="title">{t('tutorial.sample.question')}</Text>
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
                  <Kora mood="happy">
                    {picked === SAMPLE.correct
                      ? t('tutorial.right')
                      : t('tutorial.wrong')}
                  </Kora>
                </Animated.View>
              )}
            </>
          )}
          {s === 'hearts' && (
            <>
              <View style={styles.demo}>
                <Hearts left={2} />
                <View style={styles.combo}>
                  <Text variant="label" color="#FF9F43">
                    {t('play.combo', { count: 3 })}
                  </Text>
                </View>
                <View style={styles.timer}>
                  <Ionicons name="time" size={14} color={Colors.textSecondary} />
                  <Text variant="bodyStrong">{t('hud.seconds', { count: 18 })}</Text>
                </View>
              </View>
              <Kora>
                {t('tutorial.hearts')}
              </Kora>
            </>
          )}
          {s === 'hint' && (
            <>
              <Text variant="title">{t('tutorial.sample.question')}</Text>
              {hinted && (
                <Animated.View entering={FadeIn}>
                  <Kora mood="happy">{t('tutorial.sample.hint')}</Kora>
                </Animated.View>
              )}
              <Button
                variant="secondary"
                icon="sparkles"
                title={hinted ? t('tutorial.nudged') : t('tutorial.askHint')}
                disabled={hinted}
                onPress={() => setHinted(true)}
              />
              <Kora>
                {t('tutorial.hintBody')}
              </Kora>
            </>
          )}
          {s === 'stars' && (
            <>
              <View style={[styles.demo, { flexDirection: 'column', gap: Spacing.sm }]}>
                <Stars value={3} size={44} animate />
                <Text variant="heading">{t('tutorial.starsTitle')}</Text>
              </View>
              {RULES.map(([icon, id]) => (
                <View key={id} style={styles.row}>
                  <Ionicons name={icon} size={18} color={Colors.reward} />
                  <Text style={{ flex: 1 }}>{t(`tutorial.rules.${id}`)}</Text>
                </View>
              ))}
            </>
          )}
        </Animated.View>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          title={step === STEPS.length - 1 ? t('tutorial.ready') : t('actions.next', { ns: 'common' })}
          icon={step === STEPS.length - 1 ? 'play' : 'arrow-forward'}
          disabled={s === 'answer' && picked === null}
          onPress={() => (step === STEPS.length - 1 ? finish() : setStep(step + 1))}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: Colors.background },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  body: { padding: Spacing.md, gap: Spacing.md, maxWidth: 720, width: '100%', alignSelf: 'center' },
  demo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  combo: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,159,67,0.15)',
  },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  row: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
});
