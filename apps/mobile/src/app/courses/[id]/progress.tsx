import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { CourseRoute } from '@/components/courses/course-route';
import { ProgressRing } from '@/components/courses/progress-ring';
import { Button, Card, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { formatDate } from '@/i18n';
import { useCourses } from '@/lib/courses/store';
import { courseMinutes, formatDuration, KIND_META, lessonKey, PASS_MARK, type Course } from '@/lib/courses/types';

/** Screen 123: how far through a course you are, module by module, with quiz scores. */
export default function CourseProgressScreen() {
  return <CourseRoute>{(c) => <Progress course={c} />}</CourseRoute>;
}

function Progress({ course }: { course: Course }) {
  const { t } = useTranslation('courses');
  const { progressOf, done, enrolled, minutes, certificates } = useCourses();
  const p = progressOf(course);
  const spent = minutes[course.id] ?? 0;
  const left = Math.max(0, courseMinutes(course) - spent);
  const cert = certificates[course.id];

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('progress.eyebrow')} title={course.title} />
      <Card style={styles.hero}>
        <ProgressRing progress={p.pct} size={132} stroke={12}>
          <Text variant="title">{Math.round(p.pct * 100)}%</Text>
          <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
            {t('progress.complete')}
          </Text>
        </ProgressRing>
        <View style={{ flex: 1, gap: Spacing.sm }}>
          <Metric icon="checkmark-done" value={`${p.done}/${p.total}`} label={t('progress.lessonsDone')} />
          <Metric icon="time" value={formatDuration(spent)} label={t('progress.studied')} />
          <Metric
            icon="trophy"
            value={p.average === null ? '—' : `${Math.round(p.average * 100)}%`}
            label={t('progress.quizAverage')}
          />
        </View>
      </Card>

      {p.complete ? (
        <Card style={[styles.next, { borderColor: Colors.success + '66' }]}>
          <Ionicons name="ribbon" size={26} color={Colors.reward} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{t('progress.courseComplete')}</Text>
            <Text variant="small" color={Colors.textSecondary}>
              {cert ? t('progress.certificateId', { id: cert.id }) : t('progress.certificateReady')}
            </Text>
          </View>
          <Button title={t('progress.view')} onPress={() => router.push(`/courses/${course.id}/certificate`)} />
        </Card>
      ) : (
        p.next && (
          <Pressable
            onPress={() => router.push(`/courses/${course.id}/lesson/${p.next!.id}`)}
            accessibilityRole="button"
            accessibilityLabel={t('progress.upNextA11y', { title: p.next.title })}>
            <Card style={styles.next}>
              <View style={[styles.kind, { backgroundColor: KIND_META[p.next.kind].color + '22' }]}>
                <Ionicons name={KIND_META[p.next.kind].icon} size={20} color={KIND_META[p.next.kind].color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="label" color={Colors.primary}>
                  {t('progress.upNext', { minutes: p.next.minutes })}
                </Text>
                <Text variant="bodyStrong">{p.next.title}</Text>
                <Text variant="small" color={Colors.textMuted}>
                  {t('progress.left', { duration: formatDuration(left) })}
                </Text>
              </View>
              <Ionicons name="play-circle" size={30} color={Colors.primary} />
            </Card>
          </Pressable>
        )
      )}

      <Card style={{ gap: Spacing.md }}>
        <Text variant="heading">{t('progress.modules')}</Text>
        {course.modules.map((m, i) => {
          const n = m.lessons.filter((l) => done[lessonKey(course.id, l.id)]).length;
          return (
            <View key={m.id} style={{ gap: 6 }}>
              <View style={styles.between}>
                <Text variant="small" style={{ flex: 1 }} numberOfLines={1}>
                  {i + 1}. {m.title}
                </Text>
                <Text variant="small" color={n === m.lessons.length ? Colors.success : Colors.textMuted}>
                  {n === m.lessons.length ? t('progress.done') : `${n}/${m.lessons.length}`}
                </Text>
              </View>
              <ProgressBar
                progress={n / m.lessons.length}
                height={6}
                colors={n === m.lessons.length ? Gradients.mastery : Gradients.ai}
              />
            </View>
          );
        })}
      </Card>

      <Card style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('progress.quizScores')}</Text>
        {course.modules
          .flatMap((m) => m.lessons)
          .filter((l) => l.kind === 'quiz')
          .map((l) => {
            const q = p.quizScores.find((x) => x.lesson.id === l.id);
            const passed = !!q && q.best >= PASS_MARK;
            return (
              <Pressable
                key={l.id}
                onPress={() => router.push(`/courses/${course.id}/lesson/${l.id}`)}
                accessibilityRole="button"
                accessibilityLabel={
                  q
                    ? t('progress.quizBestA11y', { title: l.title, pct: Math.round(q.best * 100) })
                    : t('progress.quizNoneA11y', { title: l.title })
                }
                style={styles.quiz}>
                <Ionicons
                  name={passed ? 'checkmark-circle' : q ? 'alert-circle' : 'ellipse-outline'}
                  size={20}
                  color={passed ? Colors.success : q ? Colors.reward : Colors.textMuted}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="small">{l.title}</Text>
                  <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
                    {q
                      ? passed
                        ? t('progress.attempts', { count: q.attempts })
                        : t('progress.attemptsNotPassed', { count: q.attempts })
                      : t('progress.notAttempted')}
                  </Text>
                </View>
                <Text variant="bodyStrong" color={passed ? Colors.success : q ? Colors.reward : Colors.textMuted}>
                  {q ? `${Math.round(q.best * 100)}%` : '—'}
                </Text>
              </Pressable>
            );
          })}
      </Card>

      {enrolled[course.id] && (
        <Text variant="small" color={Colors.textMuted} center>
          {t('progress.enrolled', {
            date: formatDate(enrolled[course.id], { day: 'numeric', month: 'numeric', year: 'numeric' }),
          })}
        </Text>
      )}
    </Screen>
  );
}

function Metric({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  return (
    <View style={styles.metric}>
      <Ionicons name={icon} size={16} color={Colors.primary} />
      <Text variant="bodyStrong">{value}</Text>
      <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  next: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  kind: { width: 44, height: 44, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  between: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  quiz: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 4 },
});
