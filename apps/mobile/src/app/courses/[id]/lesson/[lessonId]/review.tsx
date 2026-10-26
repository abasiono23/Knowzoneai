import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { LessonRoute } from '@/components/courses/course-route';
import { ChoiceChip } from '@/components/personalize/choice-chip';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { optionLabel, quizFor, type LessonRef } from '@/lib/courses/catalog';
import { useCourses } from '@/lib/courses/store';
import { lessonKey } from '@/lib/courses/types';

/** Screen 122: every question with your answer, the right answer and why. */
export default function ReviewAnswersScreen() {
  return <LessonRoute>{(ref) => <Review lessonRef={ref} />}</LessonRoute>;
}

function Review({ lessonRef }: { lessonRef: LessonRef }) {
  const { t } = useTranslation('courses');
  const { a } = useLocalSearchParams<{ a?: string }>();
  const { course, lesson } = lessonRef;
  const { attempts } = useCourses();
  const list = attempts[lessonKey(course.id, lesson.id)] ?? [];
  const attempt = list.find((x) => x.id === a) ?? list[list.length - 1];
  const questions = quizFor(lesson);
  const [onlyWrong, setOnlyWrong] = useState(() => !!attempt && attempt.score < attempt.total);

  if (!attempt)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('review.eyebrow')} />
        <EmptyState icon="help-circle" title={t('review.emptyTitle')} body={t('review.emptyBody')} />
      </Screen>
    );

  const rows = questions
    .map((q, k) => ({ q, k, mine: attempt.answers[k] }))
    .filter((r) => !onlyWrong || r.mine !== r.q.correctIndex);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        eyebrow={t('review.eyebrowScore', { score: attempt.score, total: attempt.total })}
        title={lesson.title}
      />
      <View style={styles.filters}>
        <ChoiceChip
          label={t('review.all', { count: questions.length })}
          selected={!onlyWrong}
          onPress={() => setOnlyWrong(false)}
        />
        <ChoiceChip
          label={t('review.incorrect', { count: attempt.total - attempt.score })}
          selected={onlyWrong}
          onPress={() => setOnlyWrong(true)}
        />
      </View>
      {rows.length === 0 ? (
        <EmptyState icon="checkmark-done" title={t('review.noMistakes')} body={t('review.noMistakesBody')} />
      ) : (
        rows.map(({ q, k, mine }) => {
          const ok = mine === q.correctIndex;
          return (
            <Card
              key={q.id}
              style={{ gap: Spacing.sm, borderColor: ok ? Colors.success + '44' : Colors.danger + '44' }}>
              <View style={styles.head}>
                <Ionicons
                  name={ok ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={ok ? Colors.success : Colors.danger}
                />
                <Text variant="label" color={Colors.textMuted} style={{ flex: 1 }}>
                  {t('review.questionHeader', { number: k + 1, concept: q.concept.toUpperCase() })}
                </Text>
              </View>
              <Text variant="bodyStrong">{q.question}</Text>
              {q.options.map((_, j) => {
                const isRight = j === q.correctIndex;
                const isMine = j === mine;
                if (!isRight && !isMine) return null;
                return (
                  <View key={j} style={[styles.ans, isRight ? styles.right : styles.wrong]}>
                    <Text variant="label" color={isRight ? Colors.success : Colors.danger} style={{ width: 92 }}>
                      {isRight && isMine
                        ? t('review.yourAnswerRight')
                        : isRight
                          ? t('review.correct')
                          : t('review.yourAnswer')}
                    </Text>
                    <Text variant="small" style={{ flex: 1 }}>
                      {optionLabel(q, j)}
                    </Text>
                  </View>
                );
              })}
              <View style={styles.why}>
                <Ionicons name="bulb-outline" size={16} color={Colors.reward} />
                <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
                  {q.explanation}
                </Text>
              </View>
            </Card>
          );
        })
      )}
      <Button
        title={t('overview.retakeQuiz')}
        icon="refresh"
        onPress={() => router.replace(`/courses/${course.id}/lesson/${lesson.id}/quiz`)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: Spacing.xs },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  ans: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  right: { backgroundColor: Colors.successSoft, borderColor: Colors.success + '55' },
  wrong: { backgroundColor: Colors.dangerSoft, borderColor: Colors.danger + '55' },
  why: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'flex-start' },
});
