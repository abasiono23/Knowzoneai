import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { LessonRoute } from '@/components/courses/course-route';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';
import { objectivesFor, resourcesFor, type LessonRef } from '@/lib/courses/catalog';
import { useCourses } from '@/lib/courses/store';
import { allLessons, KIND_META, lessonKey, PASS_MARK, type LessonKind } from '@/lib/courses/types';

const PLAYER: Record<LessonKind, string> = {
  reading: 'read',
  video: 'video',
  interactive: 'interactive',
  quiz: 'quiz',
};

/** Screen 114: what a lesson covers, before you start it. */
export default function LessonOverviewScreen() {
  return <LessonRoute>{(ref) => <Overview lessonRef={ref} />}</LessonRoute>;
}

function Overview({ lessonRef }: { lessonRef: LessonRef }) {
  const { t } = useTranslation('courses');
  const { course, module, moduleIndex, lesson, index, prev, next } = lessonRef;
  const { open, isDone, notes, attempts } = useCourses();
  const k = KIND_META[lesson.kind];
  const done = isDone(course.id, lesson.id);
  const key = lessonKey(course.id, lesson.id);
  const noteCount = notes[key]?.length ?? 0;
  const tries = attempts[key] ?? [];
  const best = tries.length ? Math.max(...tries.map((a) => a.score / a.total)) : null;
  const base = `/courses/${course.id}/lesson/${lesson.id}`;

  useEffect(() => {
    open(course.id, lesson.id);
  }, [open, course.id, lesson.id]);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('overview.eyebrow', { number: moduleIndex + 1, title: module.title.toUpperCase() })} />
      <Animated.View entering={FadeInDown.duration(300)} style={[styles.hero, { borderColor: k.color + '55' }]}>
        <View style={[styles.kindIcon, { backgroundColor: k.color + '22' }]}>
          <Ionicons name={k.icon} size={28} color={k.color} />
        </View>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: k.color + '22' }]}>
            <Text variant="label" color={k.color} style={{ fontSize: 11 }}>
              {k.label.toUpperCase()}
            </Text>
          </View>
          <Text variant="small" color={Colors.textMuted}>
            {t('overview.position', {
              number: index + 1,
              total: allLessons(course).length,
              duration: t('duration.minutes', { count: lesson.minutes }),
            })}
          </Text>
        </View>
        <Text variant="title">{lesson.title}</Text>
        <Text color={Colors.textSecondary}>{lesson.summary}</Text>
        {done && (
          <View style={styles.done}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text variant="small" color={Colors.success}>
              {best !== null ? t('overview.completedBest', { pct: Math.round(best * 100) }) : t('overview.completed')}
            </Text>
          </View>
        )}
        {!done && lesson.kind === 'quiz' && (
          <Text variant="small" color={Colors.textMuted}>
            {best !== null
              ? t('overview.passHintBest', { pass: Math.round(PASS_MARK * 100), pct: Math.round(best * 100) })
              : t('overview.passHint', { pass: Math.round(PASS_MARK * 100) })}
          </Text>
        )}
      </Animated.View>

      <Card style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('overview.inThisLesson')}</Text>
        {objectivesFor(lesson).map((o) => (
          <View key={o} style={styles.obj}>
            <Ionicons name="flag-outline" size={16} color={Colors.primary} style={{ marginTop: 3 }} />
            <Text style={{ flex: 1 }}>{o}</Text>
          </View>
        ))}
      </Card>

      <Button
        title={done ? t(`overview.review.${lesson.kind}`) : k.verb}
        icon={k.icon}
        onPress={() => router.push(`${base}/${PLAYER[lesson.kind]}` as Href)}
      />

      <View style={styles.tools}>
        <Tool
          icon="folder-open-outline"
          label={t('overview.resources')}
          meta={t('overview.files', { count: resourcesFor(course, lesson).length })}
          onPress={() => router.push(`${base}/resources` as Href)}
        />
        <Tool
          icon="create-outline"
          label={t('overview.notes')}
          meta={noteCount ? t('overview.notesCount', { count: noteCount }) : t('overview.addNote')}
          onPress={() => router.push(`${base}/notes` as Href)}
        />
      </View>

      <View style={styles.nav}>
        {prev ? (
          <NavLink
            dir="prev"
            title={prev.title}
            onPress={() => router.replace(`/courses/${course.id}/lesson/${prev.id}`)}
          />
        ) : (
          <View style={{ flex: 1 }} />
        )}
        {next ? (
          <NavLink
            dir="next"
            title={next.title}
            onPress={() => router.replace(`/courses/${course.id}/lesson/${next.id}`)}
          />
        ) : (
          <View style={{ flex: 1 }} />
        )}
      </View>
      <Button
        variant="ghost"
        icon="list"
        title={t('overview.curriculum')}
        onPress={() => router.push(`/courses/${course.id}/curriculum`)}
      />
    </Screen>
  );
}

function Tool({
  icon,
  label,
  meta,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  meta: string;
  onPress: () => void;
}) {
  const { t } = useTranslation('courses');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('overview.toolA11y', { label, meta })}
      style={({ pressed }) => [styles.tool, pressed && { opacity: 0.8 }]}>
      <Ionicons name={icon} size={22} color={Colors.primary} />
      <Text variant="bodyStrong">{label}</Text>
      <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
        {meta}
      </Text>
    </Pressable>
  );
}

function NavLink({ dir, title, onPress }: { dir: 'prev' | 'next'; title: string; onPress: () => void }) {
  const { t } = useTranslation('courses');
  const flip = useFlipStyle();
  const next = dir === 'next';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={next ? t('overview.nextA11y', { title }) : t('overview.previousA11y', { title })}
      style={[styles.navLink, next && { alignItems: 'flex-end' }]}>
      <View style={{ flexDirection: next ? 'row-reverse' : 'row', alignItems: 'center', gap: 2 }}>
        <Ionicons name={next ? 'chevron-forward' : 'chevron-back'} size={14} color={Colors.textMuted} style={flip} />
        <Text variant="label" color={Colors.textMuted}>
          {next ? t('overview.next') : t('overview.previous')}
        </Text>
      </View>
      <Text variant="small" numberOfLines={2} style={{ textAlign: next ? 'right' : 'left' }}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: Spacing.xs,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
  },
  kindIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  badges: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill },
  done: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  obj: { flexDirection: 'row', gap: Spacing.xs },
  tools: { flexDirection: 'row', gap: Spacing.sm },
  tool: {
    flex: 1,
    gap: 2,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nav: { flexDirection: 'row', gap: Spacing.sm },
  navLink: {
    flex: 1,
    gap: 2,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
