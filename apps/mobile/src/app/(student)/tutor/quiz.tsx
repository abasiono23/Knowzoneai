import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from '@/components/ui/gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { Celebration } from '@/components/onboarding/celebration';
import { TutorErrorState } from '@/components/tutor/error-state';
import { MakingState, useMadeFromAnswer } from '@/components/tutor/making';
import { Button, Card, ProgressBar, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { useAnswer, useTutor } from '@/lib/tutor/store';

/** Screen 59: turn an answer into a quick quiz, take it, and see what to revisit. */
export default function ToQuizScreen() {
  const { t } = useTranslation('tutor');
  const { c, m } = useLocalSearchParams<{ c: string; m: string }>();
  const { conv, answer } = useAnswer(c, m);
  const { send } = useTutor();
  const [phase, setPhase] = useState<'preview' | 'play' | 'done'>('preview');
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const made = useMadeFromAnswer('quiz', c, m, !!answer?.quiz.length);

  if (conv && answer && (made.making || made.failed)) {
    return (
      <AuthScreen>
        <MakingState kind="quiz" failed={made.failed} onRetry={made.retry} onBack={() => router.back()} />
      </AuthScreen>
    );
  }

  if (!conv || !answer || answer.quiz.length === 0) {
    return (
      <AuthScreen>
        <TutorErrorState kind="missing" title={t('quiz.empty')} onBack={() => router.back()} />
      </AuthScreen>
    );
  }

  const qs = answer.quiz;
  const q = qs[i];

  if (phase === 'preview') {
    return (
      <AuthScreen
        title={t('quiz.title')}
        subtitle={t('quiz.subtitle', { count: qs.length })}
        footer={<Button title={t('quiz.start')} icon="play" onPress={() => setPhase('play')} />}>
        {qs.map((x, n) => (
          <Card key={x.question} style={styles.previewRow}>
            <View style={styles.num}>
              <Text variant="label">{n + 1}</Text>
            </View>
            <Text style={{ flex: 1 }}>{x.question}</Text>
          </Card>
        ))}
        <Text variant="small" color={Colors.textMuted} center>
          {t('quiz.explainsAll')}
        </Text>
      </AuthScreen>
    );
  }

  if (phase === 'done') {
    const pct = score / qs.length;
    return (
      <View style={{ flex: 1 }}>
        <AuthScreen
          center
          back={false}
          backdrop={pct >= 0.7 ? 'reward' : 'default'}
          footer={
            <>
              {missed.length > 0 && (
                <Button
                  title={t('quiz.explainMissed')}
                  icon="chatbubbles"
                  onPress={async () => {
                    router.back();
                    await send(conv.id, t('quiz.missedPrompt', { questions: missed.join('; ') }));
                  }}
                />
              )}
              <Button
                variant="secondary"
                title={t('quiz.retake')}
                onPress={() => {
                  setPhase('play');
                  setI(0);
                  setScore(0);
                  setMissed([]);
                  setPicked(null);
                }}
              />
              <Button variant="ghost" title={t('shared.backToChat')} onPress={() => router.back()} />
            </>
          }>
          <LinearGradient colors={pct >= 0.7 ? Gradients.mastery : Gradients.ai} style={styles.result}>
            <Text variant="label" color="rgba(255,255,255,0.85)">
              {t('quiz.yourScore')}
            </Text>
            <Text variant="display">{t('quiz.score', { score, total: qs.length })}</Text>
            <Text variant="bodyStrong" color={Colors.reward}>
              {t('quiz.xp', { count: 10 + score * 10 })}
            </Text>
          </LinearGradient>
          <Text variant="title" center>
            {pct === 1 ? t('quiz.perfect') : pct >= 0.7 ? t('quiz.great') : t('quiz.goodEffort')}
          </Text>
        </AuthScreen>
        {pct >= 0.7 && <Celebration />}
      </View>
    );
  }

  const revealed = picked !== null;
  const choose = (n: number) => {
    if (revealed) return;
    setPicked(n);
    const right = n === q.correctIndex;
    Haptics.notificationAsync(
      right ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
    ).catch(() => {});
    if (right) setScore((s) => s + 1);
    else setMissed((ms) => [...ms, q.question]);
  };
  const next = () => {
    setPicked(null);
    if (i + 1 < qs.length) setI(i + 1);
    else setPhase('done');
  };

  return (
    <AuthScreen
      title={q.question}
      hero={
        <View style={{ gap: 6 }}>
          <Text variant="small" color={Colors.textSecondary}>
            {t('quiz.progress', { current: i + 1, total: qs.length })}
          </Text>
          <ProgressBar progress={(i + (revealed ? 1 : 0)) / qs.length} height={6} />
        </View>
      }
      footer={
        revealed ? (
          <Button title={i + 1 < qs.length ? t('quiz.nextQuestion') : t('quiz.seeResults')} onPress={next} />
        ) : undefined
      }>
      {q.options.map((opt, n) => {
        const correct = revealed && n === q.correctIndex;
        const wrong = revealed && n === picked && n !== q.correctIndex;
        return (
          <Pressable
            key={opt}
            onPress={() => choose(n)}
            accessibilityRole="button"
            accessibilityLabel={opt}
            style={[styles.option, correct && styles.correct, wrong && styles.wrong]}>
            <View
              style={[
                styles.letter,
                correct && { backgroundColor: Colors.success },
                wrong && { backgroundColor: Colors.danger },
              ]}>
              <Text variant="label">{String.fromCharCode(65 + n)}</Text>
            </View>
            <Text style={{ flex: 1 }}>{opt}</Text>
            {correct && <Ionicons name="checkmark-circle" size={22} color={Colors.success} />}
            {wrong && <Ionicons name="close-circle" size={22} color={Colors.danger} />}
          </Pressable>
        );
      })}
      {revealed && (
        <Animated.View entering={FadeInDown}>
          <Card style={{ gap: 4 }}>
            <Text variant="bodyStrong" color={picked === q.correctIndex ? Colors.success : Colors.reward}>
              {picked === q.correctIndex ? t('quiz.correct') : t('quiz.notQuite')}
            </Text>
            <Text color={Colors.textSecondary}>{q.explanation}</Text>
          </Card>
        </Animated.View>
      )}
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  num: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  correct: { borderColor: Colors.success, backgroundColor: Colors.successSoft },
  wrong: { borderColor: Colors.danger, backgroundColor: Colors.dangerSoft },
  letter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  result: { alignItems: 'center', gap: Spacing.xs, padding: Spacing.lg, borderRadius: Radius.xl, alignSelf: 'stretch' },
});
