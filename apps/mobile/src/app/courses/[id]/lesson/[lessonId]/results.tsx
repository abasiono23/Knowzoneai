import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { LessonRoute } from '@/components/courses/course-route';
import { continueAfter } from '@/components/courses/lesson-shell';
import { ProgressRing } from '@/components/courses/progress-ring';
import { Celebration } from '@/components/onboarding/celebration';
import { Button, Card, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Spacing } from '@/constants/theme';
import { quizFor, type LessonRef } from '@/lib/courses/catalog';
import { useCourses } from '@/lib/courses/store';
import { lessonKey, PASS_MARK } from '@/lib/courses/types';

/** Screen 121: quiz results, by concept, compared with earlier attempts. */
export default function QuizResultsScreen() {
  return <LessonRoute>{(ref) => <Results lessonRef={ref} />}</LessonRoute>;
}

function Results({ lessonRef }: { lessonRef: LessonRef }) {
  const { t } = useTranslation('courses');
  const { a } = useLocalSearchParams<{ a?: string }>();
  const { course, lesson } = lessonRef;
  const { attempts } = useCourses();
  const list = attempts[lessonKey(course.id, lesson.id)] ?? [];
  const attempt = list.find((x) => x.id === a) ?? list[list.length - 1];
  const questions = quizFor(lesson);
  const base = `/courses/${course.id}/lesson/${lesson.id}` as const;

  if (!attempt)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('results.eyebrow')} title={t('results.noAttempt')} />
        <Button title={t('results.take')} onPress={() => router.replace(`${base}/quiz`)} />
      </Screen>
    );

  const pct = attempt.score / attempt.total;
  const passed = pct >= PASS_MARK;
  const idx = list.findIndex((x) => x.id === attempt.id);
  const prev = idx > 0 ? list[idx - 1] : undefined;
  const delta = prev ? Math.round((pct - prev.score / prev.total) * 100) : null;
  const concepts = [...new Set(questions.map((q) => q.concept))].map((c) => {
    const qs = questions.map((q, k) => ({ q, k })).filter((x) => x.q.concept === c);
    const right = qs.filter((x) => attempt.answers[x.k] === x.q.correctIndex).length;
    return { c, right, total: qs.length };
  });
  const wrong = attempt.total - attempt.score;

  return (
    <View style={{ flex: 1 }}>
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('results.eyebrow')} title={lesson.title} />
        <Animated.View entering={ZoomIn.duration(400)} style={styles.ring}>
          <ProgressRing
            progress={pct}
            size={170}
            stroke={14}
            colors={passed ? [Colors.success, '#4CC9FF'] : [Colors.reward, Colors.danger]}>
            <Text variant="display">{Math.round(pct * 100)}%</Text>
            <Text variant="small" color={Colors.textMuted}>
              {t('results.scoreOf', { score: attempt.score, total: attempt.total })}
            </Text>
          </ProgressRing>
        </Animated.View>
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text variant="title" center>
            {passed ? (pct === 1 ? t('results.perfect') : t('results.passed')) : t('results.almost')}
          </Text>
          <Text color={Colors.textSecondary} center>
            {passed
              ? lessonRef.next
                ? t('results.passedNext')
                : t('results.passedLast')
              : t('results.failed', { pass: Math.round(PASS_MARK * 100) })}
          </Text>
        </View>

        <View style={styles.stats}>
          <Stat
            icon="time-outline"
            value={`${Math.floor(attempt.seconds / 60)}:${String(attempt.seconds % 60).padStart(2, '0')}`}
            label={t('results.time')}
          />
          <Stat icon="repeat" value={`${idx + 1}`} label={t('results.attempt', { count: idx + 1 })} />
          <Stat
            icon={delta === null ? 'remove' : delta >= 0 ? 'trending-up' : 'trending-down'}
            value={delta === null ? '—' : `${delta > 0 ? '+' : ''}${delta}%`}
            label={t('results.vsLast')}
            color={delta === null ? undefined : delta >= 0 ? Colors.success : Colors.danger}
          />
        </View>

        <Card style={{ gap: Spacing.sm }}>
          <Text variant="heading">{t('results.byTopic')}</Text>
          {concepts.map((c, k) => (
            <Animated.View key={c.c} entering={FadeInDown.delay(k * 60)} style={{ gap: 4 }}>
              <View style={styles.between}>
                <Text variant="small">{c.c}</Text>
                <Text variant="small" color={c.right === c.total ? Colors.success : Colors.textSecondary}>
                  {c.right}/{c.total}
                </Text>
              </View>
              <ProgressBar
                progress={c.right / c.total}
                height={6}
                colors={c.right === c.total ? Gradients.mastery : Gradients.streak}
              />
            </Animated.View>
          ))}
          {concepts.some((c) => c.right < c.total) && (
            <View style={styles.revise}>
              <Ionicons name="bulb" size={16} color={Colors.reward} />
              <Text variant="small" style={{ flex: 1 }}>
                {t('generated.revise', {
                  topics: concepts
                    .filter((c) => c.right < c.total)
                    .map((c) => c.c)
                    .join(', '),
                })}
              </Text>
            </View>
          )}
        </Card>

        <View style={{ gap: Spacing.sm }}>
          {passed ? (
            <Button
              title={lessonRef.next ? t('results.continue') : t('results.finish')}
              icon="arrow-forward"
              onPress={() => continueAfter(lessonRef)}
            />
          ) : (
            <Button
              title={t('actions.retry', { ns: 'common' })}
              icon="refresh"
              onPress={() => router.replace(`${base}/quiz`)}
            />
          )}
          <Button
            variant="secondary"
            icon="eye"
            title={wrong ? t('results.reviewWrong', { count: wrong }) : t('results.reviewAnswers')}
            onPress={() =>
              router.push({
                pathname: '/courses/[id]/lesson/[lessonId]/review',
                params: { id: course.id, lessonId: lesson.id, a: attempt.id },
              })
            }
          />
          {passed && pct < 1 && (
            <Button
              variant="ghost"
              icon="refresh"
              title={t('results.retakeHigher')}
              onPress={() => router.replace(`${base}/quiz`)}
            />
          )}
          {!passed && (
            <Button
              variant="ghost"
              icon="list"
              title={t('results.backToCurriculum')}
              onPress={() => router.replace(`/courses/${course.id}/curriculum`)}
            />
          )}
        </View>
      </Screen>
      {passed && <Celebration />}
    </View>
  );
}

function Stat({
  icon,
  value,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  color?: string;
}) {
  return (
    <Card style={styles.stat}>
      <Ionicons name={icon} size={18} color={color ?? Colors.primary} />
      <Text variant="heading" color={color}>
        {value}
      </Text>
      <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
        {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  ring: { alignItems: 'center', paddingTop: Spacing.sm },
  stats: { flexDirection: 'row', gap: Spacing.xs },
  stat: { flex: 1, alignItems: 'center', gap: 2, padding: Spacing.sm },
  between: { flexDirection: 'row', justifyContent: 'space-between' },
  revise: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', marginTop: 4 },
});
