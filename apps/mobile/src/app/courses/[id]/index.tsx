import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CourseCard, CourseCover, Stars } from '@/components/courses/course-card';
import { CourseRoute } from '@/components/courses/course-route';
import { InstructorChip } from '@/components/courses/instructor-chip';
import { SourceCard } from '@/components/courses/source-card';
import { LessonRow } from '@/components/courses/lesson-row';
import { Button, Card, ProgressBar, SectionHeader, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { useFlipStyle } from '@/i18n/provider';
import { formatViews, getSubject, levelLabel, subjectName } from '@/lib/catalog';
import { relatedCourses } from '@/lib/courses/catalog';
import { getInstructor } from '@/lib/courses/instructors';
import { useCourses } from '@/lib/courses/store';
import {
  allLessons,
  courseMinutes,
  formatDuration,
  formatRating,
  KIND_META,
  type Course,
  type LessonKind,
} from '@/lib/courses/types';

/** Screen 112: everything about a course, with enrol / resume pinned at the bottom. */
export default function CourseDetailsScreen() {
  return <CourseRoute>{(c) => <Details course={c} />}</CourseRoute>;
}

function Details({ course }: { course: Course }) {
  const { t } = useTranslation('courses');
  const { t: th } = useTranslation('home');
  const flip = useFlipStyle();
  const subject = getSubject(course.subjectId);
  const { enrolled, enroll, saved, toggleSave, progressOf, ratings, last, certificates } = useCourses();
  const instructor = getInstructor(course.instructorId);
  const lessons = allLessons(course);
  const isEnrolled = !!enrolled[course.id];
  const p = progressOf(course);
  const isSaved = saved.includes(course.id);
  const resume = lessons.find((l) => l.id === last[course.id] && !p.complete) ?? p.next ?? lessons[0];
  const kinds = (Object.keys(KIND_META) as LessonKind[])
    .map((k) => ({ k, n: lessons.filter((l) => l.kind === k).length }))
    .filter((x) => x.n);
  const mine = ratings[course.id];

  const start = () => {
    enroll(course.id);
    router.push(`/courses/${course.id}/lesson/${resume.id}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <CourseCover course={course} height={260}>
          <SafeAreaView edges={['top']} style={styles.topBar}>
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/courses'))}
              accessibilityRole="button"
              accessibilityLabel={t('actions.goBack', { ns: 'common' })}
              style={styles.round}>
              <Ionicons name="chevron-back" size={22} color="#fff" style={flip} />
            </Pressable>
            <Pressable
              onPress={() => toggleSave(course.id)}
              accessibilityRole="button"
              accessibilityLabel={isSaved ? t('details.unsave') : t('details.save')}
              style={styles.round}>
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={isSaved ? Colors.reward : '#fff'}
              />
            </Pressable>
          </SafeAreaView>
        </CourseCover>

        <View style={styles.body}>
          <View style={{ gap: Spacing.xs }}>
            <Text variant="label" color={Colors.primary}>
              {(subject ? subjectName(subject, th) : '').toUpperCase()} · {levelLabel(course.level, th).toUpperCase()}
              {course.exams ? ` · ${course.exams.join(' / ')}` : ''}
            </Text>
            <Text variant="display" style={{ fontSize: 28, lineHeight: 34 }}>
              {course.title}
            </Text>
            <Text color={Colors.textSecondary}>{course.subtitle}</Text>
            <Pressable
              onPress={() => router.push(`/courses/${course.id}/rate`)}
              accessibilityRole="button"
              accessibilityLabel={t('details.ratingA11y', {
                rating: formatRating(course.rating),
                count: course.ratingCount,
              })}
              style={styles.ratingRow}>
              <Text variant="bodyStrong" color={Colors.reward}>
                {formatRating(course.rating)}
              </Text>
              <Stars value={course.rating} size={14} />
              <Text variant="small" color={Colors.textMuted}>
                ({t('counts.ratings', { count: course.ratingCount, value: formatViews(course.ratingCount) })}) ·{' '}
                {t('counts.learners', { count: course.learners, value: formatViews(course.learners) })}
              </Text>
            </Pressable>
          </View>

          <View style={styles.stats}>
            {[
              {
                id: 'total',
                icon: 'time-outline' as const,
                value: formatDuration(courseMinutes(course)),
                label: t('details.stats.total'),
              },
              {
                id: 'lessons',
                icon: 'layers-outline' as const,
                value: formatNumber(lessons.length),
                label: t('details.stats.lessons', { count: lessons.length }),
              },
              {
                id: 'certificate',
                icon: 'ribbon-outline' as const,
                value: t('details.stats.certificateValue'),
                label: t('details.stats.certificate'),
              },
              {
                id: 'paced',
                icon: 'phone-portrait-outline' as const,
                value: t('details.stats.self'),
                label: t('details.stats.paced'),
              },
            ].map((s) => (
              <View key={s.id} style={styles.stat}>
                <Ionicons name={s.icon} size={18} color={Colors.primary} />
                <Text variant="bodyStrong">{s.value}</Text>
                <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          {isEnrolled && (
            <Pressable
              onPress={() => router.push(`/courses/${course.id}/progress`)}
              accessibilityRole="button"
              accessibilityLabel={t('details.yourProgress')}>
              <Card style={{ gap: Spacing.xs }}>
                <View style={styles.between}>
                  <Text variant="bodyStrong">{p.complete ? t('details.completed') : t('details.yourProgress')}</Text>
                  <Text variant="small" color={Colors.primary}>
                    {t('details.pctDetails', { pct: Math.round(p.pct * 100) })}
                  </Text>
                </View>
                <ProgressBar progress={p.pct} height={8} colors={p.complete ? Gradients.mastery : Gradients.ai} />
                <Text variant="small" color={Colors.textSecondary}>
                  {p.average !== null
                    ? t('details.progressSummaryQuiz', {
                        done: p.done,
                        total: p.total,
                        pct: Math.round(p.average * 100),
                      })
                    : t('details.progressSummary', { done: p.done, total: p.total })}
                </Text>
              </Card>
            </Pressable>
          )}

          {instructor && (
            <Card>
              <InstructorChip instructor={instructor} />
            </Card>
          )}

          <View style={{ gap: Spacing.sm }}>
            <Text variant="heading">{t('details.about')}</Text>
            <Text color={Colors.textSecondary}>{course.description}</Text>
          </View>

          <Card style={{ gap: Spacing.sm }}>
            <Text variant="heading">{t('details.learn')}</Text>
            {course.outcomes.map((o) => (
              <View key={o} style={styles.check}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={{ flex: 1 }}>{o}</Text>
              </View>
            ))}
          </Card>

          <View style={{ gap: Spacing.xs }}>
            <SectionHeader
              title={t('details.curriculum')}
              action={t('actions.seeAll', { ns: 'common' })}
              onAction={() => router.push(`/courses/${course.id}/curriculum`)}
            />
            <Text variant="small" color={Colors.textSecondary}>
              {[
                t('counts.modules', { count: course.modules.length }),
                ...kinds.map((k) => t(`kindCounts.${k.k}`, { count: k.n })),
              ].join(' · ')}
            </Text>
            <Card style={{ padding: Spacing.xs, gap: 2 }}>
              {course.modules[0].lessons.map((l, i) => (
                <LessonRow
                  key={l.id}
                  course={course}
                  lesson={l}
                  number={i + 1}
                  upNext={isEnrolled && p.next?.id === l.id}
                />
              ))}
              <Pressable
                onPress={() => router.push(`/courses/${course.id}/curriculum`)}
                accessibilityRole="button"
                accessibilityLabel={t('details.showFull')}
                style={styles.more}>
                <Text variant="small" color={Colors.primary}>
                  {t('details.moreLessons', {
                    count: lessons.length - course.modules[0].lessons.length,
                    modules: t('counts.modules', { count: course.modules.length - 1 }),
                  })}
                </Text>
              </Pressable>
            </Card>
          </View>

          {course.source && <SourceCard source={course.source} />}

          <View style={{ gap: Spacing.xs }}>
            <Text variant="heading">{t('details.requirements')}</Text>
            {course.requirements.map((r) => (
              <Text key={r} color={Colors.textSecondary}>
                • {r}
              </Text>
            ))}
          </View>

          <Card style={{ gap: Spacing.sm }}>
            <View style={styles.between}>
              <Text variant="heading">{t('details.reviews')}</Text>
              <Text variant="small" color={Colors.textMuted}>
                {t('counts.ratings', { count: course.ratingCount, value: formatViews(course.ratingCount) })}
              </Text>
            </View>
            {[5, 4, 3, 2, 1].map((s) => {
              // Real ratings when the server sends them; the demo courses keep their sample spread.
              const share = course.ratingBreakdown
                ? course.ratingCount
                  ? course.ratingBreakdown[s - 1] / course.ratingCount
                  : 0
                : s === 5
                  ? 0.78
                  : s === 4
                    ? 0.16
                    : s === 3
                      ? 0.04
                      : 0.01;
              return (
                <View key={s} style={styles.bar}>
                  <Text variant="small" color={Colors.textSecondary} style={{ width: 14 }}>
                    {s}
                  </Text>
                  <Ionicons name="star" size={11} color={Colors.reward} />
                  <View style={{ flex: 1 }}>
                    <ProgressBar progress={share} height={6} colors={Gradients.reward} />
                  </View>
                  <Text
                    variant="small"
                    color={Colors.textMuted}
                    style={{ width: 34, textAlign: 'right', fontSize: 12 }}>
                    {Math.round(share * 100)}%
                  </Text>
                </View>
              );
            })}
            {mine ? (
              <View style={styles.mine}>
                <Stars value={mine.stars} size={14} />
                <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }} numberOfLines={2}>
                  {mine.text ? t('details.yourReviewText', { text: mine.text }) : t('details.yourReview')}
                </Text>
              </View>
            ) : null}
            <Button
              variant="secondary"
              icon="star-outline"
              title={mine ? t('details.editReview') : t('details.rateCourse')}
              onPress={() => router.push(`/courses/${course.id}/rate`)}
            />
          </Card>

          <View style={{ gap: Spacing.sm }}>
            <SectionHeader
              title={t('details.related')}
              action={t('actions.seeAll', { ns: 'common' })}
              onAction={() => router.push(`/courses/${course.id}/related`)}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: Spacing.sm, paddingRight: Spacing.md }}
              style={{ marginRight: -Spacing.md }}>
              {relatedCourses(course, 4).map((r) => (
                <CourseCard key={r.id} course={r} />
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {p.complete ? (
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <Button
              variant="secondary"
              title={t('details.review')}
              icon="refresh"
              style={{ flex: 1 }}
              onPress={() => router.push(`/courses/${course.id}/curriculum`)}
            />
            <Button
              title={certificates[course.id] ? t('details.certificate') : t('details.finish')}
              icon="ribbon"
              style={{ flex: 1.4 }}
              onPress={() => router.push(`/courses/${course.id}/certificate`)}
            />
          </View>
        ) : (
          <>
            {isEnrolled && (
              <Text variant="small" color={Colors.textSecondary} center numberOfLines={1}>
                {t('details.next', { title: resume.title })}
              </Text>
            )}
            <Button
              title={isEnrolled ? t('details.continue') : t('details.enrol')}
              icon={isEnrolled ? 'play' : 'school'}
              onPress={start}
            />
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  round: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: Spacing.md, gap: Spacing.lg, maxWidth: 720, width: '100%', alignSelf: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  stats: { flexDirection: 'row', gap: Spacing.xs },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  check: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'flex-start' },
  more: { padding: Spacing.sm, alignItems: 'center' },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceRaised,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: 6,
    backgroundColor: Colors.backgroundDeep,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
