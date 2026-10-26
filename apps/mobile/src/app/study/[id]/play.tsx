import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { ReadyMaterial } from '@/components/materials/ready-material';
import { Button, Card, ProgressBar, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { quizTypeLabel } from '@/lib/studio/labels';
import { fromParams, pickQuestions, SECONDS_PER_QUESTION } from '@/lib/studio/quiz';
import { useMaterials } from '@/lib/studio/store';
import type { Material, QuizSettings, StudyContent } from '@/lib/studio/types';

/** Screen 79: one quiz question at a time, with instant feedback and an optional timer. */
export default function QuizPlayScreen() {
  const params = useLocalSearchParams<Record<string, string>>();
  const { settings, seed } = fromParams(params);
  return <ReadyMaterial>{(m) => <Play m={m} settings={settings} seed={seed} />}</ReadyMaterial>;
}

function Play({
  m,
  settings,
  seed,
}: {
  m: Material & { content: StudyContent };
  settings: QuizSettings;
  seed: number;
}) {
  const { t } = useTranslation('study');
  const { recordAttempt } = useMaterials();
  const qs = useMemo(() => pickQuestions(m.content.quiz, settings, seed), [m.content.quiz, settings, seed]);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [left, setLeft] = useState(SECONDS_PER_QUESTION);
  const started = useRef(0);
  useEffect(() => {
    started.current = Date.now();
  }, []);
  const q = qs[i];
  const revealed = picked !== null || (settings.timed && left <= 0);

  // Countdown for timed quizzes; running out counts as no answer.
  useEffect(() => {
    if (!settings.timed || revealed) return;
    const timer = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [settings.timed, revealed, left]);

  if (!q) return null;

  const choose = (n: number) => {
    if (revealed) return;
    setPicked(n);
    Haptics.notificationAsync(
      n === q.correctIndex ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
    ).catch(() => {});
  };

  const next = () => {
    const all = [...answers, picked];
    if (i + 1 < qs.length) {
      setAnswers(all);
      setPicked(null);
      setLeft(SECONDS_PER_QUESTION);
      setI(i + 1);
      return;
    }
    const score = all.filter((a, n) => a === qs[n].correctIndex).length;
    const attempt = recordAttempt(m.id, {
      questionIds: qs.map((x) => x.id),
      answers: all,
      score,
      total: qs.length,
      seconds: Math.round((Date.now() - started.current) / 1000),
      settings,
    });
    router.replace({ pathname: '/study/[id]/results', params: { id: m.id, a: attempt.id } });
  };

  return (
    <AuthScreen
      back
      hero={
        <View style={{ gap: 6 }}>
          <View style={styles.rowBetween}>
            <Text variant="small" color={Colors.textSecondary}>
              {t('play.progress', { number: i + 1, total: qs.length, type: quizTypeLabel(q.type, t) })}
            </Text>
            {settings.timed && (
              <View style={[styles.timer, left <= 5 && { backgroundColor: Colors.dangerSoft }]}>
                <Ionicons name="timer" size={14} color={left <= 5 ? Colors.danger : Colors.text} />
                <Text variant="label" color={left <= 5 ? Colors.danger : Colors.text}>
                  {t('quiz.seconds', { count: Math.max(0, left) })}
                </Text>
              </View>
            )}
          </View>
          <ProgressBar progress={(i + (revealed ? 1 : 0)) / qs.length} height={6} colors={Gradients.ai} />
        </View>
      }
      title={q.question}
      footer={
        revealed ? (
          <Button title={i + 1 < qs.length ? t('play.next') : t('play.seeResults')} onPress={next} />
        ) : undefined
      }>
      {q.options.map((opt, n) => {
        const correct = revealed && n === q.correctIndex;
        const wrong = revealed && n === picked && n !== q.correctIndex;
        return (
          <Pressable
            key={`${q.id}-${n}`}
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
              <Text variant="label">
                {q.type === 'tf'
                  ? n === 0
                    ? t('play.letterTrue')
                    : t('play.letterFalse')
                  : String.fromCharCode(65 + n)}
              </Text>
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
              {picked === null ? t('play.timeUp') : picked === q.correctIndex ? t('play.correct') : t('play.notQuite')}
            </Text>
            <Text color={Colors.textSecondary}>{q.explanation}</Text>
          </Card>
        </Animated.View>
      )}
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceRaised,
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
});
