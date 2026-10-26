import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

import { LessonRoute } from '@/components/courses/course-route';
import { LessonShell } from '@/components/courses/lesson-shell';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { optionLabel, quizFor, type LessonRef } from '@/lib/courses/catalog';
import { useCourses } from '@/lib/courses/store';
import { lessonKey, PASS_MARK } from '@/lib/courses/types';

/** Screen 120: a lesson quiz, one question at a time with instant feedback. */
export default function LessonQuizScreen() {
  return <LessonRoute>{(ref) => <Quiz lessonRef={ref} />}</LessonRoute>;
}

function Quiz({ lessonRef }: { lessonRef: LessonRef }) {
  const { t } = useTranslation('courses');
  const { course, lesson } = lessonRef;
  const { attempts, recordAttempt } = useCourses();
  const questions = quizFor(lesson);
  const past = attempts[lessonKey(course.id, lesson.id)] ?? [];
  const best = past.length ? Math.max(...past.map((a) => a.score / a.total)) : null;
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const startedAt = useRef(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!started) return;
    startedAt.current = Date.now();
    const tick = setInterval(() => setElapsed(Math.round((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(tick);
  }, [started]);

  if (!started) {
    return (
      <LessonShell
        lessonRef={lessonRef}
        footer={
          <Button
            title={past.length ? t('actions.retry', { ns: 'common' }) : t('quiz.start')}
            icon="play"
            onPress={() => setStarted(true)}
          />
        }>
        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <Ionicons name="help-circle" size={40} color={Colors.danger} />
          </View>
          <Text variant="title" center>
            {lesson.title}
          </Text>
          <Text color={Colors.textSecondary} center>
            {lesson.summary}
          </Text>
        </View>
        <View style={styles.facts}>
          {[
            { id: 'questions', icon: 'list' as const, v: `${questions.length}`, l: t('quiz.questions') },
            { id: 'pass', icon: 'trophy' as const, v: `${Math.round(PASS_MARK * 100)}%`, l: t('quiz.toPass') },
            { id: 'minutes', icon: 'time' as const, v: `~${lesson.minutes}`, l: t('quiz.minutes') },
          ].map((f) => (
            <View key={f.id} style={styles.fact}>
              <Ionicons name={f.icon} size={18} color={Colors.primary} />
              <Text variant="heading">{f.v}</Text>
              <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                {f.l}
              </Text>
            </View>
          ))}
        </View>
        {best !== null && (
          <Card style={styles.best}>
            <Ionicons name="ribbon" size={20} color={best >= PASS_MARK ? Colors.success : Colors.reward} />
            <Text style={{ flex: 1 }}>
              {best >= PASS_MARK
                ? t('quiz.bestPassed', { pct: Math.round(best * 100), count: past.length })
                : t('quiz.best', { pct: Math.round(best * 100), count: past.length })}
            </Text>
          </Card>
        )}
        <Text variant="small" color={Colors.textMuted} center>
          {t('quiz.explainHint')}
        </Text>
      </LessonShell>
    );
  }

  const q = questions[i];
  const picked = answers[i];
  const answered = picked !== undefined;
  const last = i === questions.length - 1;
  const ok = picked === q.correctIndex;

  const choose = (k: number) => {
    if (answered) return;
    Haptics.notificationAsync(
      k === q.correctIndex ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
    ).catch(() => {});
    setAnswers((a) => Object.assign([...a], { [i]: k }));
  };
  const finish = () => {
    const id = recordAttempt(course.id, lesson.id, questions, answers, elapsed);
    router.replace({
      pathname: '/courses/[id]/lesson/[lessonId]/results',
      params: { id: course.id, lessonId: lesson.id, a: id },
    });
  };

  return (
    <LessonShell
      lessonRef={lessonRef}
      progress={(i + (answered ? 1 : 0)) / questions.length}
      footer={
        <Button
          title={last ? t('quiz.seeResults') : t('quiz.nextQuestion')}
          icon={last ? 'trophy' : 'arrow-forward'}
          disabled={!answered}
          onPress={() => (last ? finish() : setI(i + 1))}
        />
      }>
      <View style={styles.qHead}>
        <Text variant="label" color={Colors.textMuted}>
          {t('quiz.header', { number: i + 1, total: questions.length, concept: q.concept.toUpperCase() })}
        </Text>
        <View style={styles.timer}>
          <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
          <Text variant="small" color={Colors.textMuted} style={{ fontVariant: ['tabular-nums'] }}>
            {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
          </Text>
        </View>
      </View>
      <Animated.View key={i} entering={FadeInRight.duration(240)} style={{ gap: Spacing.md }}>
        {q.type === 'tf' && (
          <Text variant="label" color={Colors.primary}>
            {t('quiz.trueOrFalse')}
          </Text>
        )}
        <Text variant="title" style={{ fontSize: 22, lineHeight: 30 }}>
          {q.question}
        </Text>
        <View style={{ gap: Spacing.xs }}>
          {q.options.map((_, k) => {
            const o = optionLabel(q, k);
            const state = !answered ? 'idle' : k === q.correctIndex ? 'right' : k === picked ? 'wrong' : 'dim';
            return (
              <Pressable
                key={k}
                onPress={() => choose(k)}
                disabled={answered}
                accessibilityRole="button"
                accessibilityState={{ selected: picked === k }}
                accessibilityLabel={o}
                style={[
                  styles.option,
                  state === 'right' && styles.right,
                  state === 'wrong' && styles.wrong,
                  state === 'dim' && { opacity: 0.45 },
                ]}>
                <View
                  style={[
                    styles.letter,
                    state === 'right' && { backgroundColor: Colors.success },
                    state === 'wrong' && { backgroundColor: Colors.danger },
                  ]}>
                  {state === 'right' || state === 'wrong' ? (
                    <Ionicons name={state === 'right' ? 'checkmark' : 'close'} size={14} color="#fff" />
                  ) : (
                    <Text variant="label">{String.fromCharCode(65 + k)}</Text>
                  )}
                </View>
                <Text style={{ flex: 1 }}>{o}</Text>
              </Pressable>
            );
          })}
        </View>
        {answered && (
          <Animated.View
            entering={FadeInDown.duration(250)}
            style={[
              styles.explain,
              ok
                ? { borderColor: Colors.success + '66', backgroundColor: Colors.successSoft }
                : { borderColor: Colors.danger + '66', backgroundColor: Colors.dangerSoft },
            ]}>
            <Text variant="bodyStrong" color={ok ? Colors.success : Colors.danger}>
              {ok ? t('quiz.correct') : t('quiz.answerIs', { answer: optionLabel(q, q.correctIndex) })}
            </Text>
            <Text variant="small">{q.explanation}</Text>
          </Animated.View>
        )}
      </Animated.View>
    </LessonShell>
  );
}

const styles = StyleSheet.create({
  intro: { alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.md },
  introIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  facts: { flexDirection: 'row', gap: Spacing.xs },
  fact: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  best: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  qHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
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
  letter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: { borderColor: Colors.success, backgroundColor: Colors.successSoft },
  wrong: { borderColor: Colors.danger, backgroundColor: Colors.dangerSoft },
  explain: { gap: 4, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
});
