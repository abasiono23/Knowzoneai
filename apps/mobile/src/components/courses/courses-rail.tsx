import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Rail } from '@/components/content/rail';
import { Card, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { formatDate } from '@/i18n';
import { useFlipStyle } from '@/i18n/provider';
import { COURSES, getCourse } from '@/lib/courses/catalog';
import { useCourses } from '@/lib/courses/store';

import { CourseCard } from './course-card';

/** Home/Explore entry to courses (110): your courses in progress first, then featured ones. */
export function CoursesRail({ title }: { title?: string }) {
  const { t } = useTranslation('courses');
  const { enrolled, progressOf } = useCourses();
  const mine = Object.keys(enrolled)
    .sort((a, b) => enrolled[b] - enrolled[a])
    .map(getCourse)
    .filter((c) => !!c && !progressOf(c).complete);
  const rest = COURSES.filter((c) => !enrolled[c.id]).sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  return (
    <Rail
      title={title ?? (mine.length ? t('rail.yourCourses') : t('rail.structured'))}
      onSeeAll={() => router.push('/courses')}>
      {[...mine, ...rest].slice(0, 6).map((c) => (
        <CourseCard key={c!.id} course={c!} />
      ))}
    </Rail>
  );
}

/** Earned certificates for the profile, with a link to browse courses. */
export function CertificatesCard() {
  const { t } = useTranslation('courses');
  const flip = useFlipStyle();
  const { certificates } = useCourses();
  const earned = Object.entries(certificates)
    .map(([id, cert]) => ({ course: getCourse(id), cert }))
    .filter((x) => !!x.course)
    .sort((a, b) => b.cert.issuedAt - a.cert.issuedAt);
  return (
    <Card style={{ gap: Spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
        <Ionicons name="ribbon" size={24} color={Colors.reward} />
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong">{t('certificatesCard.title')}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {earned.length ? t('certificatesCard.earned', { count: earned.length }) : t('certificatesCard.empty')}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/courses')}
          accessibilityRole="button"
          accessibilityLabel={t('certificatesCard.browse')}
          hitSlop={8}>
          <Text variant="small" color={Colors.primary}>
            {t('certificatesCard.link')}
          </Text>
        </Pressable>
      </View>
      {earned.map(({ course, cert }) => (
        <Pressable
          key={cert.id}
          onPress={() => router.push(`/courses/${course!.id}/certificate`)}
          accessibilityRole="button"
          accessibilityLabel={t('certificatesCard.a11y', { title: course!.title })}
          style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 4 }}>
          <Text style={{ fontSize: 22 }}>{course!.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text variant="small" numberOfLines={1} style={{ fontFamily: 'Manrope_600SemiBold' }}>
              {course!.title}
            </Text>
            <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
              {formatDate(cert.issuedAt, { day: 'numeric', month: 'numeric', year: 'numeric' })} · {cert.id}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={flip} />
        </Pressable>
      ))}
    </Card>
  );
}
