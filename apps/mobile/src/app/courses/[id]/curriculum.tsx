import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { CourseRoute } from '@/components/courses/course-route';
import { LessonRow } from '@/components/courses/lesson-row';
import { Card, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useCourses } from '@/lib/courses/store';
import { allLessons, courseMinutes, formatDuration, lessonKey, type Course } from '@/lib/courses/types';

/** Screen 113: all modules and lessons, with what's done and what's next. */
export default function CurriculumScreen() {
  return <CourseRoute>{(c) => <Curriculum course={c} />}</CourseRoute>;
}

function Curriculum({ course }: { course: Course }) {
  const { t } = useTranslation('courses');
  const { done, enrolled, progressOf } = useCourses();
  const p = progressOf(course);
  const nextModule = course.modules.findIndex((m) => m.lessons.some((l) => l.id === p.next?.id));
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(course.modules.map((m, i) => [m.id, i === Math.max(0, nextModule)])),
  );
  const starts = course.modules.map((_, i) => course.modules.slice(0, i).reduce((n, m) => n + m.lessons.length, 0));

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('curriculum.eyebrow')} title={course.title} />
      <Text variant="small" color={Colors.textSecondary}>
        {[
          t('counts.modules', { count: course.modules.length }),
          t('counts.lessons', { count: allLessons(course).length }),
          formatDuration(courseMinutes(course)),
          ...(enrolled[course.id] ? [t('curriculum.done', { count: p.done })] : []),
        ].join(' · ')}
      </Text>
      {course.modules.map((m, mi) => {
        const doneHere = m.lessons.filter((l) => done[lessonKey(course.id, l.id)]).length;
        const isOpen = open[m.id];
        const start = starts[mi];
        return (
          <Card key={m.id} style={{ padding: 0, overflow: 'hidden' }}>
            <Pressable
              onPress={() => setOpen((o) => ({ ...o, [m.id]: !o[m.id] }))}
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
              accessibilityLabel={t('curriculum.moduleA11y', {
                number: mi + 1,
                title: m.title,
                done: doneHere,
                total: m.lessons.length,
              })}
              style={styles.head}>
              <View style={[styles.num, doneHere === m.lessons.length && { backgroundColor: Colors.success }]}>
                {doneHere === m.lessons.length ? (
                  <Ionicons name="checkmark" size={16} color={Colors.onBright} />
                ) : (
                  <Text variant="label">{mi + 1}</Text>
                )}
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="label" color={Colors.textMuted}>
                  {t('curriculum.moduleMeta', {
                    number: mi + 1,
                    minutes: m.lessons.reduce((n, l) => n + l.minutes, 0),
                  })}
                </Text>
                <Text variant="heading" style={{ fontSize: 17 }}>
                  {m.title}
                </Text>
                <Text variant="small" color={Colors.textSecondary}>
                  {m.summary}
                </Text>
                <View style={{ marginTop: 4 }}>
                  <ProgressBar progress={doneHere / m.lessons.length} height={4} />
                </View>
              </View>
              <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textMuted} />
            </Pressable>
            {isOpen && (
              <View style={styles.lessons}>
                {m.lessons.map((l, i) => (
                  <LessonRow
                    key={l.id}
                    course={course}
                    lesson={l}
                    number={start + i + 1}
                    upNext={!!enrolled[course.id] && p.next?.id === l.id}
                  />
                ))}
              </View>
            )}
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start', padding: Spacing.md },
  num: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessons: {
    paddingHorizontal: Spacing.xs,
    paddingBottom: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 2,
  },
});
