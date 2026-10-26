import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { ReadyMaterial } from '@/components/materials/ready-material';
import { Celebration } from '@/components/onboarding/celebration';
import { SuccessBadge } from '@/components/onboarding/success-badge';
import { Button, ProgressBar, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { percentLabel } from '@/lib/studio/labels';
import { dueCards, useMaterials } from '@/lib/studio/store';
import type { Card, Material, StudyContent } from '@/lib/studio/types';

/** Screen 76: flashcard study mode with spaced repetition. */
export default function StudyModeScreen() {
  return <ReadyMaterial>{(m) => <Session m={m} />}</ReadyMaterial>;
}

function Session({ m }: { m: Material & { content: StudyContent } }) {
  const { t } = useTranslation('study');
  const { reviewCard } = useMaterials();
  // Fix the session's cards when it starts: due cards, or the whole deck if nothing is due.
  const deck = useMemo<Card[]>(() => {
    const { due } = dueCards(m);
    return due.length ? due : m.content.flashcards;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m.id]);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [again, setAgain] = useState<Card[]>([]);
  const turn = useSharedValue(0);

  useEffect(() => {
    turn.value = withTiming(flipped ? 1 : 0, { duration: 260 });
  }, [flipped, turn]);
  const front = useAnimatedStyle(() => ({
    opacity: 1 - turn.value,
    transform: [{ perspective: 800 }, { rotateY: `${turn.value * 180}deg` }],
  }));
  const back = useAnimatedStyle(() => ({
    opacity: turn.value,
    transform: [{ perspective: 800 }, { rotateY: `${(turn.value - 1) * 180}deg` }],
  }));

  const done = i >= deck.length;
  const card = deck[i];

  const answer = (knewIt: boolean) => {
    Haptics.impactAsync(knewIt ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium).catch(
      () => {},
    );
    reviewCard(m.id, card.id, knewIt);
    if (knewIt) setKnown((k) => k + 1);
    else setAgain((a) => [...a, card]);
    setFlipped(false);
    setTimeout(() => setI((n) => n + 1), 120);
  };

  if (done) {
    const pct = deck.length ? known / deck.length : 0;
    return (
      <View style={{ flex: 1 }}>
        <AuthScreen
          center
          back={false}
          backdrop="reward"
          footer={
            <>
              <Button title={t('shared.backToPack')} onPress={() => router.back()} />
              <Button
                variant="ghost"
                title={t('session.takeQuiz')}
                onPress={() => router.replace(`/study/${m.id}/quiz-setup`)}
              />
            </>
          }>
          <SuccessBadge icon="albums" colors={Gradients.reward} />
          <Text variant="display" center>
            {t('session.done')}
          </Text>
          <Text color={Colors.textSecondary} center>
            {t('session.knew', { known, count: deck.length, percent: percentLabel(pct, t) })}{' '}
            {again.length ? t('session.comeBack', { count: again.length }) : t('session.nextReview')}
          </Text>
          <Text variant="bodyStrong" color={Colors.reward} center>
            {t('session.xp', { count: known * 2 + 5 })}
          </Text>
        </AuthScreen>
        {pct >= 0.7 && <Celebration />}
      </View>
    );
  }

  return (
    <AuthScreen
      hero={
        <View style={{ gap: 6 }}>
          <View style={styles.rowBetween}>
            <Text variant="small" color={Colors.textSecondary}>
              {t('session.progress', { number: i + 1, total: deck.length })}
            </Text>
            <Text variant="small" color={Colors.success}>
              {t('session.known', { count: known })}
            </Text>
          </View>
          <ProgressBar progress={i / deck.length} height={6} />
        </View>
      }
      footer={
        flipped ? (
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <Button
              variant="secondary"
              title={t('session.notYet')}
              icon="refresh"
              onPress={() => answer(false)}
              style={{ flex: 1 }}
            />
            <Button title={t('session.knewIt')} icon="checkmark" onPress={() => answer(true)} style={{ flex: 1 }} />
          </View>
        ) : (
          <Button title={t('session.showAnswer')} icon="eye" onPress={() => setFlipped(true)} />
        )
      }>
      <Pressable
        onPress={() => setFlipped((f) => !f)}
        accessibilityRole="button"
        accessibilityLabel={flipped ? card.back : card.front}
        accessibilityHint={t('session.flipHint')}>
        <View style={styles.stage}>
          <Animated.View style={[StyleSheet.absoluteFill, front]}>
            <LinearGradient colors={Gradients.ai} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
              <Text variant="label" color="rgba(255,255,255,0.8)">
                {t('session.question')}
              </Text>
              <Text variant="title" center>
                {card.front}
              </Text>
              <Text variant="small" color="rgba(255,255,255,0.8)">
                {t('session.thinkHint')}
              </Text>
            </LinearGradient>
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, back]}>
            <LinearGradient colors={Gradients.mastery} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
              <Text variant="label" color="rgba(255,255,255,0.8)">
                {t('session.answer')}
              </Text>
              <Text variant="title" center>
                {card.back}
              </Text>
            </LinearGradient>
          </Animated.View>
        </View>
      </Pressable>
      <Text variant="small" color={Colors.textMuted} center>
        {t('session.honest')}
      </Text>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stage: { height: 340 },
  card: {
    flex: 1,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backfaceVisibility: 'hidden',
  },
});
