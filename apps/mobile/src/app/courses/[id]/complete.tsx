import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { CourseRoute } from '@/components/courses/course-route';
import { LessonRow } from '@/components/courses/lesson-row';
import { Celebration } from '@/components/onboarding/celebration';
import { SuccessBadge } from '@/components/onboarding/success-badge';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { useCourses } from '@/lib/courses/store';
import { allLessons, formatDuration, lessonKey, PASS_MARK, type Course } from '@/lib/courses/types';

/** Screen 124: course completion, or what's left if a lesson or quiz is still open. */
export default function CourseCompleteScreen() {
  return <CourseRoute>{(c) => <Complete course={c} />}</CourseRoute>;
}

function Complete({ course }: { course: Course }) {
  const { t } = useTranslation('courses');
  const { progressOf, minutes, done, ratings } = useCourses();
  const p = progressOf(course);

  if (!p.complete) {
    const remaining = allLessons(course)
      .map((l, i) => ({ l, i }))
      .filter(({ l }) => !done[lessonKey(course.id, l.id)]);
    return (
      <AuthScreen
        title={t('complete.almostTitle')}
        subtitle={t('complete.almostBody', { count: remaining.length, title: course.title })}
        footer={
          <Button
            title={t('certificate.backToCourse')}
            variant="secondary"
            onPress={() => router.replace(`/courses/${course.id}`)}
          />
        }>
        <Card style={{ padding: Spacing.xs, gap: 2 }}>
          {remaining.map(({ l, i }, k) => (
            <LessonRow key={l.id} course={course} lesson={l} number={i + 1} upNext={k === 0} />
          ))}
        </Card>
        {remaining.some(({ l }) => l.kind === 'quiz') && (
          <Text variant="small" color={Colors.textMuted} center>
            {t('complete.quizNote', { pass: Math.round(PASS_MARK * 100) })}
          </Text>
        )}
      </AuthScreen>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AuthScreen
        back={false}
        center
        hero={<SuccessBadge icon="trophy" colors={['#FFC857', '#FF9F43']} />}
        title={t('complete.title')}
        subtitle={t('complete.body', { title: course.title })}
        footer={
          <>
            <Button
              title={t('complete.viewCertificate')}
              icon="ribbon"
              onPress={() => router.replace(`/courses/${course.id}/certificate`)}
            />
            {!ratings[course.id] && (
              <Button
                variant="secondary"
                title={t('details.rateCourse')}
                icon="star-outline"
                onPress={() => router.push(`/courses/${course.id}/rate`)}
              />
            )}
            <Button
              variant="ghost"
              title={t('complete.findNext')}
              onPress={() => router.replace(`/courses/${course.id}/related`)}
            />
          </>
        }>
        <Animated.View entering={FadeInDown.delay(300)} style={styles.stats}>
          {[
            { id: 'lessons', icon: 'checkmark-done' as const, v: formatNumber(p.total), l: t('complete.lessons') },
            {
              id: 'studied',
              icon: 'time' as const,
              v: formatDuration(minutes[course.id] ?? 0),
              l: t('complete.studied'),
            },
            {
              id: 'quiz',
              icon: 'trophy' as const,
              v: p.average === null ? '—' : `${Math.round(p.average * 100)}%`,
              l: t('complete.quizAvg'),
            },
          ].map((s) => (
            <Card key={s.id} style={styles.stat}>
              <Ionicons name={s.icon} size={18} color={Colors.reward} />
              <Text variant="heading">{s.v}</Text>
              <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                {s.l}
              </Text>
            </Card>
          ))}
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(450)}>
          <Card style={styles.xp}>
            <Ionicons name="flash" size={18} color={Colors.reward} />
            <Text variant="small" style={{ flex: 1 }}>
              {t('complete.saved')}
            </Text>
          </Card>
        </Animated.View>
      </AuthScreen>
      <Celebration />
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: Spacing.xs },
  stat: { flex: 1, alignItems: 'center', gap: 2, padding: Spacing.sm },
  xp: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderColor: Colors.reward + '44' },
});
