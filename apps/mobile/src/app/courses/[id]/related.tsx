import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { CourseCard } from '@/components/courses/course-card';
import { CourseRoute } from '@/components/courses/course-route';
import { Button, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { categoryOf, coursesBy, relatedCourses } from '@/lib/courses/catalog';
import { getInstructor } from '@/lib/courses/instructors';
import type { Course } from '@/lib/courses/types';

/** Screen 127: courses related to this one. */
export default function RelatedCoursesScreen() {
  return <CourseRoute>{(c) => <Related course={c} />}</CourseRoute>;
}

function Related({ course }: { course: Course }) {
  const { t } = useTranslation('courses');
  const all = relatedCourses(course, 20);
  const same = all.filter((c) => categoryOf(c) === categoryOf(course));
  const other = all.filter((c) => categoryOf(c) !== categoryOf(course));
  const instructor = getInstructor(course.instructorId);
  const byInstructor = coursesBy(course.instructorId).filter((c) => c.id !== course.id);

  const section = (title: string, list: Course[]) =>
    list.length > 0 && (
      <View style={{ gap: Spacing.md }}>
        <Text variant="label" color={Colors.textMuted}>
          {title}
        </Text>
        {list.map((c) => (
          <CourseCard key={c.id} course={c} variant="row" />
        ))}
      </View>
    );

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('related.eyebrow')} title={t('related.title', { title: course.title })} />
      {section(
        t('related.same'),
        same.filter((c) => !byInstructor.includes(c)),
      )}
      {instructor && section(t('related.moreFrom', { name: instructor.name.toUpperCase() }), byInstructor)}
      {section(
        t('related.alsoTook'),
        other.filter((c) => !byInstructor.includes(c)),
      )}
      <Button
        variant="secondary"
        icon="grid"
        title={t('related.browseAll')}
        onPress={() => router.push('/courses')}
      />
    </Screen>
  );
}
