import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { CourseCard } from '@/components/courses/course-card';
import { InstructorAvatar } from '@/components/courses/instructor-chip';
import { Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { formatViews } from '@/lib/catalog';
import { coursesBy } from '@/lib/courses/catalog';
import { getInstructor } from '@/lib/courses/instructors';
import { formatRating } from '@/lib/courses/types';

/** Screen 128: an instructor's profile and their courses. */
export default function InstructorScreen() {
  const { t } = useTranslation('courses');
  const { id } = useLocalSearchParams<{ id: string }>();
  const i = getInstructor(id);
  if (!i)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <EmptyState
          icon="person"
          title={t('instructor.notFound')}
          body={t('instructor.notFoundBody')}
          action={{ label: t('category.allCourses'), onPress: () => router.replace('/courses') }}
        />
      </Screen>
    );
  const courses = coursesBy(i.id);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('instructor.eyebrow')} />
      <LinearGradient
        colors={[i.colors[0] + '55', i.colors[1] + '11']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}>
        <InstructorAvatar instructor={i} size={88} />
        <View style={styles.nameRow}>
          <Text variant="title" center>
            {i.name}
          </Text>
          {i.verified && (
            <Ionicons
              name="checkmark-circle"
              size={22}
              color={Colors.info}
              accessibilityLabel={t('instructor.verified')}
            />
          )}
        </View>
        <Text color={Colors.textSecondary} center>
          {i.title}
        </Text>
        <View style={styles.loc}>
          <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
          <Text variant="small" color={Colors.textMuted}>
            {i.location}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.stats}>
        {[
          { id: 'students', v: formatViews(i.students), l: t('instructor.students') },
          { id: 'rating', v: formatRating(i.rating), l: t('instructor.rating'), icon: true },
          { id: 'courses', v: formatNumber(courses.length), l: t('instructor.courses', { count: courses.length }) },
          { id: 'years', v: formatNumber(i.years), l: t('instructor.years', { count: i.years }) },
        ].map((s) => (
          <Card key={s.id} style={styles.stat}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              {s.icon && <Ionicons name="star" size={13} color={Colors.reward} />}
              <Text variant="heading">{s.v}</Text>
            </View>
            <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }} center>
              {s.l}
            </Text>
          </Card>
        ))}
      </View>

      <View style={{ gap: Spacing.xs }}>
        <Text variant="heading">{t('instructor.about')}</Text>
        <Text color={Colors.textSecondary}>{i.bio}</Text>
      </View>

      <Card style={{ gap: Spacing.sm }}>
        {i.highlights.map((h) => (
          <View key={h} style={styles.hl}>
            <Ionicons name="ribbon-outline" size={18} color={Colors.primary} />
            <Text style={{ flex: 1 }}>{h}</Text>
          </View>
        ))}
      </Card>

      <View style={{ gap: Spacing.md }}>
        <Text variant="heading">{t('instructor.coursesBy', { name: i.name })}</Text>
        {courses.map((c) => (
          <CourseCard key={c.id} course={c} variant="row" />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xs,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  loc: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stats: { flexDirection: 'row', gap: Spacing.xs },
  stat: { flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: 4, paddingVertical: Spacing.sm },
  hl: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
});
