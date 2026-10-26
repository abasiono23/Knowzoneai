import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ProgressBar, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import type { LessonRef } from '@/lib/courses/catalog';
import { useCourses } from '@/lib/courses/store';
import { allLessons, lessonKey } from '@/lib/courses/types';

/** After finishing a lesson: the next lesson's overview, or the course completion screen. */
export function continueAfter(ref: LessonRef) {
  if (ref.next) router.replace(`/courses/${ref.course.id}/lesson/${ref.next.id}`);
  else router.replace(`/courses/${ref.course.id}/complete`);
}

/** Marks the lesson complete and moves on. */
export function CompleteButton({
  lessonRef,
  disabled,
  title,
}: {
  lessonRef: LessonRef;
  disabled?: boolean;
  title?: string;
}) {
  const { t } = useTranslation('courses');
  const { complete, isDone } = useCourses();
  const done = isDone(lessonRef.course.id, lessonRef.lesson.id);
  return (
    <Button
      title={
        title ??
        (done
          ? lessonRef.next
            ? t('lessonShell.nextLesson')
            : t('lessonShell.finishCourse')
          : t('lessonShell.completeContinue'))
      }
      icon={done ? 'arrow-forward' : 'checkmark-circle'}
      disabled={disabled}
      onPress={() => {
        if (!done) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          complete(lessonRef.course.id, lessonRef.lesson.id);
        }
        continueAfter(lessonRef);
      }}
    />
  );
}

type Props = {
  lessonRef: LessonRef;
  children: ReactNode;
  footer?: ReactNode;
  /** 0–1 progress through this lesson (e.g. reading position or activity step). */
  progress?: number;
  scroll?: boolean;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  dark?: boolean;
};

/** Frame for every lesson player: close, position in course, notes shortcut, progress and a pinned footer. */
export function LessonShell({ lessonRef, children, footer, progress, scroll = true, onScroll, dark }: Props) {
  const { t } = useTranslation('courses');
  const { notes } = useCourses();
  const { course, lesson, index } = lessonRef;
  const total = allLessons(course).length;
  const noteCount = notes[lessonKey(course.id, lesson.id)]?.length ?? 0;
  return (
    <View style={[styles.fill, { backgroundColor: dark ? Colors.backgroundDeep : Colors.background }]}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <View style={styles.top}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace(`/courses/${course.id}`))}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t('lessonShell.close')}
            style={styles.round}>
            <Ionicons name="close" size={20} color={Colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text variant="label" color={Colors.textMuted} numberOfLines={1}>
              {t('lessonShell.position', { number: index + 1, total, course: course.title.toUpperCase() })}
            </Text>
            <Text variant="bodyStrong" numberOfLines={1}>
              {lesson.title}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push(`/courses/${course.id}/lesson/${lesson.id}/notes`)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={
              noteCount ? t('lessonShell.notesCount', { count: noteCount }) : t('lessonShell.notes')
            }
            style={styles.round}>
            <Ionicons name="create-outline" size={19} color={Colors.text} />
            {noteCount > 0 && (
              <View style={styles.dot}>
                <Text style={{ fontSize: 9, color: '#fff', fontFamily: 'Manrope_800ExtraBold' }}>{noteCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
        {progress !== undefined && (
          <View style={{ paddingHorizontal: Spacing.md, paddingBottom: Spacing.xs }}>
            <ProgressBar progress={progress} height={4} colors={Gradients.ai} />
          </View>
        )}
        {scroll ? (
          <ScrollView
            style={styles.fill}
            contentContainerStyle={styles.content}
            onScroll={onScroll}
            scrollEventThrottle={64}
            keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : (
          <View style={styles.fill}>{children}</View>
        )}
        {footer && <View style={styles.footer}>{footer}</View>}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.backgroundDeep,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
  },
});
