import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '@/components/ui/gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ProgressBar, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { FORMAT_META, formatLabel, formatViews, getSubject, levelLabel, subjectName, type Lesson } from '@/lib/catalog';
import { useLibrary } from '@/lib/library-store';

type Props = {
  lesson: Lesson;
  /** "tile" for horizontal rails, "row" for lists. */
  variant?: 'tile' | 'row';
  reason?: string;
  rank?: number;
  progress?: number;
  meta?: string;
};

export function LessonThumb({ lesson, size = 'md' }: { lesson: Lesson; size?: 'sm' | 'md' | 'lg' }) {
  const { t } = useTranslation('home');
  const subject = getSubject(lesson.subjectId);
  const f = FORMAT_META[lesson.format];
  const dims = size === 'lg' ? { height: 190 } : size === 'md' ? { height: 120 } : { width: 72, height: 72 };
  return (
    <LinearGradient
      colors={subject?.colors ?? ['#3B2DBF', '#7C5CFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.thumb, dims, size === 'sm' && { borderRadius: Radius.md }]}>
      <Text style={{ fontSize: size === 'sm' ? 26 : 40, lineHeight: size === 'sm' ? 32 : 48, opacity: 0.9 }}>
        {subject?.emoji}
      </Text>
      {size !== 'sm' && (
        <>
          <View style={styles.formatBadge}>
            <Ionicons name={f.icon} size={12} color={Colors.text} />
            <Text variant="label" style={{ fontSize: 10, lineHeight: 14 }}>
              {formatLabel(lesson.format, t).toUpperCase()}
            </Text>
          </View>
          <View style={styles.duration}>
            <Text variant="label" style={{ fontSize: 10, lineHeight: 14 }}>
              {t('lessonCard.minutesBadge', { count: lesson.minutes })}
            </Text>
          </View>
        </>
      )}
    </LinearGradient>
  );
}

export function LessonCard({ lesson, variant = 'row', reason, rank, progress, meta }: Props) {
  const { isSaved, toggleSave } = useLibrary();
  const { t } = useTranslation('home');
  const subject = getSubject(lesson.subjectId);
  const subjectLabel = subject ? subjectName(subject, t) : '';
  const saved = isSaved(lesson.id);
  const open = () => router.push(`/lesson/${lesson.id}`);

  if (variant === 'tile') {
    return (
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={lesson.title}
        style={({ pressed }) => [styles.tile, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
        <LessonThumb lesson={lesson} />
        <View style={{ gap: 4, padding: Spacing.sm }}>
          {reason && (
            <Text variant="label" color={Colors.success} numberOfLines={1} style={{ fontSize: 10 }}>
              {reason.toUpperCase()}
            </Text>
          )}
          <Text variant="bodyStrong" numberOfLines={2} style={{ fontSize: 15, lineHeight: 20 }}>
            {lesson.title}
          </Text>
          <Text variant="small" color={Colors.textSecondary} numberOfLines={1} style={{ fontSize: 12 }}>
            {t('lessonCard.tileMeta', { subject: subjectLabel, level: levelLabel(lesson.level, t) })}
          </Text>
          {progress !== undefined && progress > 0 && <ProgressBar progress={progress} height={4} />}
        </View>
      </Pressable>
    );
  }

  // The open area and the bookmark are siblings: a button inside a button is invalid on web.
  return (
    <View style={styles.row}>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={lesson.title}
        style={({ pressed }) => [styles.rowMain, pressed && { opacity: 0.75 }]}>
        {rank !== undefined && (
          <Text variant="title" color={rank <= 3 ? Colors.reward : Colors.textMuted} style={styles.rank}>
            {rank}
          </Text>
        )}
        <LessonThumb lesson={lesson} size="sm" />
        <View style={{ flex: 1, gap: 3 }}>
          {reason && (
            <Text variant="label" color={Colors.success} numberOfLines={1} style={{ fontSize: 10 }}>
              {reason.toUpperCase()}
            </Text>
          )}
          <Text variant="bodyStrong" numberOfLines={2} style={{ fontSize: 15, lineHeight: 20 }}>
            {lesson.title}
          </Text>
          <Text variant="small" color={Colors.textSecondary} numberOfLines={1} style={{ fontSize: 12 }}>
            {meta ??
              t('lessonCard.rowMeta', {
                subject: subjectLabel,
                format: formatLabel(lesson.format, t),
                minutes: lesson.minutes,
                views: formatViews(lesson.views),
              })}
          </Text>
          {progress !== undefined && progress > 0 && <ProgressBar progress={progress} height={4} />}
        </View>
      </Pressable>
      <Pressable
        onPress={() => toggleSave(lesson.id)}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={saved ? t('lesson.removeSaved') : t('actions.save', { ns: 'common' })}>
        <Ionicons
          name={saved ? 'bookmark' : 'bookmark-outline'}
          size={20}
          color={saved ? Colors.reward : Colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  thumb: { borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  formatBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  duration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  tile: {
    width: 200,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: Radius.md },
  rank: { width: 28, textAlign: 'center' },
});
