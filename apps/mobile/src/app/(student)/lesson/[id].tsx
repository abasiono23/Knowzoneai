import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { EmptyState } from '@/components/content/empty-state';
import { LessonCard, LessonThumb } from '@/components/content/lesson-card';
import { Button, Card, IconButton, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import {
  FORMAT_META,
  formatLabel,
  formatViews,
  getLesson,
  getSubject,
  lessonsFor,
  levelLabel,
  subjectName,
} from '@/lib/catalog';
import { COURSES } from '@/lib/courses/catalog';
import { allLessons } from '@/lib/courses/types';
import { useLibrary } from '@/lib/library-store';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { markViewed, isSaved, toggleSave, progress, setProgress } = useLibrary();
  const { t } = useTranslation('home');
  const [done, setDone] = useState(false);
  const lesson = getLesson(id);

  // Opening a lesson counts as viewing it (Recently viewed) and starts progress.
  useEffect(() => {
    if (!lesson) return;
    markViewed(lesson.id);
    setProgress(lesson.id, 0.1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  if (!lesson) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <EmptyState icon="document" title={t('lesson.notFoundTitle')} body={t('lesson.notFoundBody')} />
      </Screen>
    );
  }

  const subject = getSubject(lesson.subjectId);
  const subjectLabel = subject ? subjectName(subject, t) : undefined;
  const course = COURSES.find((c) => allLessons(c).some((l) => l.catalogId === lesson.id));
  const f = FORMAT_META[lesson.format];
  const p = done ? 1 : (progress[lesson.id] ?? 0);
  const related = lessonsFor(lesson.subjectId)
    .filter((l) => l.id !== lesson.id)
    .slice(0, 3);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        eyebrow={subjectLabel?.toUpperCase()}
        right={
          <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
            <IconButton
              icon="share-social-outline"
              label={t('actions.share', { ns: 'common' })}
              onPress={() => Share.share({ message: t('lesson.shareMessage', { title: lesson.title }) })}
            />
            <IconButton
              icon={isSaved(lesson.id) ? 'bookmark' : 'bookmark-outline'}
              label={isSaved(lesson.id) ? t('lesson.removeSaved') : t('actions.save', { ns: 'common' })}
              onPress={() => toggleSave(lesson.id)}
            />
          </View>
        }
      />

      <LessonThumb lesson={lesson} size="lg" />

      <View style={{ gap: Spacing.xs }}>
        <Text variant="title">{lesson.title}</Text>
        <View style={styles.meta}>
          <Meta icon={f.icon} text={formatLabel(lesson.format, t)} color={f.color} />
          <Meta icon="time-outline" text={t('time.minutes', { ns: 'common', count: lesson.minutes })} />
          <Meta icon="bar-chart-outline" text={levelLabel(lesson.level, t)} />
          <Meta icon="people-outline" text={formatViews(lesson.views)} />
          <Meta
            icon="star"
            text={formatNumber(lesson.rating, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            color={Colors.reward}
          />
        </View>
        {lesson.exams && (
          <View style={styles.meta}>
            {lesson.exams.map((e) => (
              <View key={e} style={styles.exam}>
                <Text variant="label" color={Colors.reward} style={{ fontSize: 10 }}>
                  {e}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {p > 0 && (
        <View style={{ gap: 6 }}>
          <View style={styles.rowBetween}>
            <Text variant="small" color={Colors.textSecondary}>
              {t('lesson.progress')}
            </Text>
            <Text variant="small" color={p >= 1 ? Colors.success : Colors.text}>
              {p >= 1 ? t('lesson.completed') : formatNumber(p, { style: 'percent' })}
            </Text>
          </View>
          <ProgressBar progress={p} height={6} />
        </View>
      )}

      <Text color={Colors.textSecondary}>{lesson.summary}</Text>

      <Card style={{ gap: Spacing.sm }}>
        <Text variant="label" color={Colors.primary}>
          {t('lesson.whatYoullLearn')}
        </Text>
        {lesson.keyPoints.map((k) => (
          <View key={k} style={styles.point}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={{ flex: 1 }}>{k}</Text>
          </View>
        ))}
      </Card>

      {done ? (
        <Animated.View entering={FadeInDown}>
          <Card style={styles.complete}>
            <Ionicons name="trophy" size={24} color={Colors.reward} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{t('lesson.completeTitle')}</Text>
              <Text variant="small" color={Colors.textSecondary}>
                {t('lesson.completeBody')}
              </Text>
            </View>
          </Card>
        </Animated.View>
      ) : (
        <Button
          title={t(`lesson.start.${lesson.format}`)}
          icon={f.icon}
          onPress={() => {
            if (lesson.format === 'video') return router.push(`/videos/v-${lesson.id}`);
            setProgress(lesson.id, 1);
            setDone(true);
          }}
        />
      )}
      <Button
        variant="secondary"
        icon="chatbubbles"
        title={t('lesson.askTutor')}
        // The chat is grounded in this lesson.
        onPress={() => router.push({ pathname: '/tutor/new', params: { lesson: lesson.id } })}
      />
      {course && (
        <Pressable
          onPress={() => router.push(`/courses/${course.id}`)}
          accessibilityRole="button"
          accessibilityLabel={t('lesson.partOfCourseLabel', { title: course.title })}>
          <Card style={styles.course}>
            <Text style={{ fontSize: 28 }}>{course.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text variant="label" color={Colors.primary}>
                {t('lesson.partOfCourse')}
              </Text>
              <Text variant="bodyStrong">{course.title}</Text>
              <Text variant="small" color={Colors.textSecondary}>
                {t('lesson.courseBody')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Card>
        </Pressable>
      )}

      {related.length > 0 && (
        <View style={{ gap: Spacing.xs }}>
          <Pressable
            onPress={() => subject && router.push(`/subjects/${subject.id}`)}
            accessibilityRole="button"
            style={styles.rowBetween}>
            <Text variant="heading">{t('lesson.moreIn', { subject: subjectLabel })}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Pressable>
          {related.map((l) => (
            <LessonCard key={l.id} lesson={l} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function Meta({
  icon,
  text,
  color = Colors.textSecondary,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  color?: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={14} color={color} />
      <Text variant="small" color={Colors.textSecondary}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  course: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderColor: Colors.primary + '44' },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  exam: { backgroundColor: Colors.rewardSoft, borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  point: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'flex-start' },
  complete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderColor: Colors.reward,
    backgroundColor: Colors.rewardSoft,
  },
});
