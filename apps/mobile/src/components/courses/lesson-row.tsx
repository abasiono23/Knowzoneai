import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';
import { useCourses } from '@/lib/courses/store';
import { KIND_META, type Course, type CourseLesson } from '@/lib/courses/types';

/** One lesson in a curriculum: kind, title, length and whether it's done or up next. */
export function LessonRow({
  course,
  lesson,
  number,
  upNext,
}: {
  course: Course;
  lesson: CourseLesson;
  number: number;
  upNext?: boolean;
}) {
  const { t } = useTranslation('courses');
  const flip = useFlipStyle();
  const { isDone } = useCourses();
  const done = isDone(course.id, lesson.id);
  const k = KIND_META[lesson.kind];
  const a11y = {
    number,
    title: lesson.title,
    kind: k.label,
    duration: t('duration.minutesLong', { count: lesson.minutes }),
  };
  return (
    <Pressable
      onPress={() => router.push(`/courses/${course.id}/lesson/${lesson.id}`)}
      accessibilityRole="button"
      accessibilityLabel={
        done ? t('lessonRow.a11yDone', a11y) : upNext ? t('lessonRow.a11yUpNext', a11y) : t('lessonRow.a11y', a11y)
      }
      style={({ pressed }) => [styles.row, upNext && styles.next, pressed && { opacity: 0.8 }]}>
      <View style={[styles.status, done && { backgroundColor: Colors.success, borderColor: Colors.success }]}>
        {done ? (
          <Ionicons name="checkmark" size={14} color={Colors.backgroundDeep} />
        ) : (
          <Text variant="label" color={upNext ? Colors.primary : Colors.textMuted} style={{ fontSize: 11 }}>
            {number}
          </Text>
        )}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong" style={{ fontSize: 15 }} color={done ? Colors.textSecondary : Colors.text}>
          {lesson.title}
        </Text>
        <View style={styles.meta}>
          <Ionicons name={k.icon} size={12} color={k.color} />
          <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
            {k.label} · {t('duration.minutes', { count: lesson.minutes })}
          </Text>
          {upNext && (
            <Text variant="label" color={Colors.primary} style={{ fontSize: 10, marginLeft: 4 }}>
              {t('lessonRow.upNext')}
            </Text>
          )}
        </View>
      </View>
      <Ionicons
        name={upNext ? 'play-circle' : 'chevron-forward'}
        size={upNext ? 26 : 16}
        color={upNext ? Colors.primary : Colors.textMuted}
        style={upNext ? undefined : flip}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
  },
  next: { backgroundColor: Colors.primarySoft },
  status: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
