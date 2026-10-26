import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { ProgressBar, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatViews, getSubject, levelLabel, subjectName } from '@/lib/catalog';
import { getInstructor } from '@/lib/courses/instructors';
import { useCourses } from '@/lib/courses/store';
import { allLessons, courseMinutes, formatDuration, formatRating, type Course } from '@/lib/courses/types';

/** Gradient cover with the course emoji and a soft ring pattern. */
export function CourseCover({
  course,
  height = 140,
  width,
  children,
}: {
  course: Course;
  height?: number;
  width?: number;
  children?: ReactNode;
}) {
  const big = height >= 180;
  return (
    <LinearGradient
      colors={course.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.cover, { height, width }]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
        <Circle
          cx="88%"
          cy="18%"
          r={height * 0.55}
          stroke="#FFFFFF"
          strokeOpacity={0.12}
          strokeWidth={1.5}
          fill="none"
        />
        <Circle
          cx="88%"
          cy="18%"
          r={height * 0.35}
          stroke="#FFFFFF"
          strokeOpacity={0.16}
          strokeWidth={1.5}
          fill="none"
        />
        <Circle cx="8%" cy="110%" r={height * 0.45} fill="#FFFFFF" fillOpacity={0.07} />
      </Svg>
      <Text style={{ fontSize: big ? 64 : 42, lineHeight: big ? 76 : 52 }}>{course.emoji}</Text>
      {children}
    </LinearGradient>
  );
}

export function Stars({ value, size = 12 }: { value: number; size?: number }) {
  const { t } = useTranslation('courses');
  return (
    <View style={{ flexDirection: 'row', gap: 1 }} accessibilityLabel={t('card.stars', { value: formatRating(value) })}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={value >= i - 0.25 ? 'star' : value >= i - 0.75 ? 'star-half' : 'star-outline'}
          size={size}
          color={Colors.reward}
        />
      ))}
    </View>
  );
}

function Meta({ course }: { course: Course }) {
  const { t } = useTranslation('courses');
  return (
    <View style={styles.meta}>
      <Ionicons name="star" size={12} color={Colors.reward} />
      <Text variant="small" style={styles.metaText}>
        {formatRating(course.rating)}
      </Text>
      <Text variant="small" color={Colors.textMuted} style={styles.metaText}>
        · {t('counts.learners', { count: course.learners, value: formatViews(course.learners) })} ·{' '}
        {formatDuration(courseMinutes(course))}
      </Text>
    </View>
  );
}

type Variant = 'tile' | 'row' | 'hero';

/** A course in a rail (tile), a list (row) or the featured carousel (hero). Shows progress once enrolled. */
export function CourseCard({ course, variant = 'tile' }: { course: Course; variant?: Variant }) {
  const { t } = useTranslation('courses');
  const { t: th } = useTranslation('home');
  const { enrolled, progressOf } = useCourses();
  const p = enrolled[course.id] ? progressOf(course) : null;
  const instructor = getInstructor(course.instructorId);
  const go = () => router.push(`/courses/${course.id}`);
  const level = levelLabel(course.level, th);
  const subject = getSubject(course.subjectId);
  const label = t('card.a11y', {
    title: course.title,
    level,
    status: p
      ? t('card.pctComplete', { pct: Math.round(p.pct * 100) })
      : t('counts.lessons', { count: allLessons(course).length }),
  });

  if (variant === 'row') {
    return (
      <Pressable
        onPress={go}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        <CourseCover course={course} height={92} width={112} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="bodyStrong" numberOfLines={2}>
            {course.title}
          </Text>
          <Text variant="small" color={Colors.textSecondary} numberOfLines={1} style={{ fontSize: 12 }}>
            {instructor?.name} · {level}
          </Text>
          {p ? (
            <View style={{ gap: 4 }}>
              <ProgressBar progress={p.pct} height={5} />
              <Text variant="small" color={p.complete ? Colors.success : Colors.textMuted} style={{ fontSize: 11 }}>
                {p.complete ? t('card.completed') : t('card.lessonsOf', { done: p.done, total: p.total })}
              </Text>
            </View>
          ) : (
            <Meta course={course} />
          )}
        </View>
      </Pressable>
    );
  }

  if (variant === 'hero') {
    return (
      <Pressable
        onPress={go}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [styles.hero, pressed && styles.pressed]}>
        <CourseCover course={course} height={200}>
          <View style={styles.heroBadges}>
            {course.featured && (
              <View style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.35)' }]}>
                <Ionicons name="sparkles" size={11} color={Colors.reward} />
                <Text variant="label" style={{ fontSize: 10 }}>
                  {t('card.featured')}
                </Text>
              </View>
            )}
            {course.exams?.[0] && (
              <View style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.35)' }]}>
                <Text variant="label" style={{ fontSize: 10 }}>
                  {course.exams.join(' · ')}
                </Text>
              </View>
            )}
          </View>
        </CourseCover>
        <View style={{ padding: Spacing.md, gap: 4 }}>
          <Text variant="heading" numberOfLines={2}>
            {course.title}
          </Text>
          <Text variant="small" color={Colors.textSecondary} numberOfLines={2}>
            {course.subtitle}
          </Text>
          {p ? <ProgressBar progress={p.pct} height={5} /> : <Meta course={course} />}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={go}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
      <CourseCover course={course} height={120} />
      <View style={{ padding: Spacing.sm, gap: 4, flex: 1 }}>
        <Text variant="label" color={Colors.textMuted} style={{ fontSize: 10 }}>
          {(subject ? subjectName(subject, th) : '').toUpperCase()} · {level.toUpperCase()}
        </Text>
        <Text variant="bodyStrong" numberOfLines={2} style={{ fontSize: 15, lineHeight: 21 }}>
          {course.title}
        </Text>
        <View style={{ flex: 1 }} />
        {p ? (
          <View style={{ gap: 4 }}>
            <ProgressBar progress={p.pct} height={5} />
            <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
              {p.complete ? t('card.completed') : t('card.pctComplete', { pct: Math.round(p.pct * 100) })}
            </Text>
          </View>
        ) : (
          <Meta course={course} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cover: { borderRadius: Radius.md, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  tile: {
    width: 220,
    minHeight: 250,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  hero: {
    width: 300,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  heroBadges: { position: 'absolute', top: Spacing.sm, left: Spacing.sm, flexDirection: 'row', gap: 6 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 3, flexWrap: 'wrap' },
  metaText: { fontSize: 12 },
});
