import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { TutorErrorState } from '@/components/tutor/error-state';
import { Screen, ScreenHeader } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { findLesson, getCourse, type LessonRef } from '@/lib/courses/catalog';
import { useCourses, type LoadState } from '@/lib/courses/store';
import type { Course } from '@/lib/courses/types';

function Missing({ what }: { what: 'course' | 'lesson' }) {
  const { t } = useTranslation('courses');
  return (
    <Screen withTabBar={false}>
      <ScreenHeader />
      <TutorErrorState
        kind="missing"
        title={what === 'course' ? t('route.courseNotFound') : t('route.lessonNotFound')}
        body={t('route.missingBody')}
        onBack={() => router.replace('/courses')}
      />
    </Screen>
  );
}

/** Loads the course from the [id] segment. */
export function CourseRoute({ children }: { children: (c: Course) => ReactNode }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ready } = useCourses();
  const course = getCourse(id);
  if (!ready) return null;
  if (!course) return <Missing what="course" />;
  return <>{children(course)}</>;
}

/** Loads the course lesson from the [id] and [lessonId] segments, fetching its content the first time. */
export function LessonRoute({ children }: { children: (ref: LessonRef) => ReactNode }) {
  const { id, lessonId } = useLocalSearchParams<{ id: string; lessonId: string }>();
  const { ready, loadLesson } = useCourses();
  const { t } = useTranslation('courses');
  const ref = findLesson(id, lessonId);
  const [content, setContent] = useState<LoadState>(ref?.lesson.content ? 'ready' : 'loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!ref || ref.lesson.content) return;
    let live = true;
    loadLesson(id, lessonId).then((s) => live && setContent(s));
    return () => {
      live = false;
    };
    // `ref` is found again each render; the lesson ids and retries are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, lessonId, attempt, loadLesson]);

  if (!ready) return null;
  if (!ref) return <Missing what="lesson" />;
  if (!ref.lesson.content && content !== 'ready') {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        {content === 'error' ? (
          <TutorErrorState
            kind="network"
            title={t('route.loadFailed')}
            onRetry={() => {
              setContent('loading');
              setAttempt((n) => n + 1);
            }}
            onBack={() => router.back()}
          />
        ) : (
          <View style={{ paddingVertical: 80, alignItems: 'center' }} accessibilityLabel={t('route.loading')}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}
      </Screen>
    );
  }
  return <>{children(ref)}</>;
}
