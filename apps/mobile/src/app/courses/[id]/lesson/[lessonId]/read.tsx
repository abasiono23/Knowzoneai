import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { CodeBlock, FigureBlock, NoteBlock } from '@/components/content/rich-blocks';
import { LessonRoute } from '@/components/courses/course-route';
import { SourceCard } from '@/components/courses/source-card';
import { CompleteButton, LessonShell } from '@/components/courses/lesson-shell';
import { Card, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { keyPointsFor, readingFor, type LessonRef } from '@/lib/courses/catalog';
import { useCourses } from '@/lib/courses/store';
import { blockText, type Block } from '@/lib/tutor/types';

const SIZES = [0.9, 1, 1.15, 1.3];

/** Screen 115: a reading lesson. Long-press any paragraph to save it to your notes. */
export default function ReadingLessonScreen() {
  return <LessonRoute>{(ref) => <Reading lessonRef={ref} />}</LessonRoute>;
}

function Reading({ lessonRef }: { lessonRef: LessonRef }) {
  const { t } = useTranslation('courses');
  const { course, lesson } = lessonRef;
  const { addNote } = useCourses();
  const [size, setSize] = useState(1);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const scale = SIZES[size];
  const sections = readingFor(lesson);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const max = contentSize.height - layoutMeasurement.height;
    setProgress(max <= 0 ? 1 : Math.min(1, Math.max(0, contentOffset.y / max)));
  };

  const save = (text: string) => {
    addNote(course.id, lesson.id, '', text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setToast(t('read.saved'));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 1800);
  };

  return (
    <LessonShell
      lessonRef={lessonRef}
      progress={progress}
      onScroll={onScroll}
      footer={
        <>
          {toast && (
            <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.toast} pointerEvents="none">
              <Ionicons name="bookmark" size={14} color={Colors.text} />
              <Text variant="small">{toast}</Text>
            </Animated.View>
          )}
          <CompleteButton lessonRef={lessonRef} />
        </>
      }>
      <View style={styles.tools}>
        <View style={styles.readMeta}>
          <Ionicons name="book-outline" size={14} color={Colors.textMuted} />
          <Text variant="small" color={Colors.textMuted}>
            {t('read.minRead', { count: lesson.minutes })}
          </Text>
        </View>
        <Pressable
          onPress={() => setSize((s) => Math.max(0, s - 1))}
          disabled={size === 0}
          accessibilityRole="button"
          accessibilityLabel={t('read.smaller')}
          style={[styles.sizeBtn, size === 0 && { opacity: 0.4 }]}>
          <Text variant="small">A−</Text>
        </Pressable>
        <Pressable
          onPress={() => setSize((s) => Math.min(SIZES.length - 1, s + 1))}
          disabled={size === SIZES.length - 1}
          accessibilityRole="button"
          accessibilityLabel={t('read.larger')}
          style={[styles.sizeBtn, size === SIZES.length - 1 && { opacity: 0.4 }]}>
          <Text variant="bodyStrong">A+</Text>
        </Pressable>
      </View>

      <Text variant="display" style={{ fontSize: 28 * scale, lineHeight: 34 * scale }}>
        {lesson.title}
      </Text>
      <Text color={Colors.textSecondary} style={{ fontSize: 16 * scale, lineHeight: 24 * scale }}>
        {lesson.summary}
      </Text>
      <View style={styles.hint}>
        <Ionicons name="hand-left-outline" size={14} color={Colors.textMuted} />
        <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
          {t('read.hint')}
        </Text>
      </View>

      {sections.map((s, i) => (
        <View key={i} style={{ gap: Spacing.sm }}>
          <Text variant="heading" style={{ fontSize: 20 * scale, lineHeight: 26 * scale, marginTop: Spacing.sm }}>
            {s.heading}
          </Text>
          {s.blocks.map((b, j) => (
            <ReadingBlock key={j} block={b} scale={scale} onSave={save} />
          ))}
        </View>
      ))}

      <Card style={styles.recap}>
        <Text variant="label" color={Colors.success}>
          {t('read.keyPoints')}
        </Text>
        {keyPointsFor(lesson).map((k) => (
          <View key={k} style={styles.point}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={{ flex: 1, fontSize: 15 * scale, lineHeight: 22 * scale }}>{k}</Text>
          </View>
        ))}
      </Card>
      {lessonRef.course.source && <SourceCard source={lessonRef.course.source} compact />}
    </LessonShell>
  );
}

function ReadingBlock({ block: b, scale, onSave }: { block: Block; scale: number; onSave: (text: string) => void }) {
  const { t } = useTranslation('courses');
  const body = { fontSize: 17 * scale, lineHeight: 28 * scale };
  const text = blockText(b);
  const press = {
    onLongPress: () => onSave(text),
    delayLongPress: 400,
    accessibilityHint: t('read.longPressHint'),
  };
  switch (b.type) {
    case 'h':
      return (
        <Text variant="heading" style={{ fontSize: 18 * scale, lineHeight: 24 * scale }}>
          {b.text}
        </Text>
      );
    case 'list':
      return (
        <Pressable {...press} style={{ gap: Spacing.xs }}>
          {b.items.map((item, k) => (
            <View key={k} style={styles.bullet}>
              <View style={[styles.dot, { marginTop: 11 * scale }]} />
              <Text style={[{ flex: 1 }, body]}>{item}</Text>
            </View>
          ))}
        </Pressable>
      );
    case 'formula':
      return (
        <Pressable {...press} style={styles.formula}>
          <Text style={[styles.formulaText, { fontSize: 18 * scale, lineHeight: 26 * scale }]}>{b.text}</Text>
        </Pressable>
      );
    case 'tip':
    case 'warning': {
      const tipKind = b.type === 'tip';
      return (
        <Pressable
          {...press}
          style={[
            styles.callout,
            tipKind
              ? { backgroundColor: Colors.successSoft, borderColor: Colors.success + '55' }
              : { backgroundColor: Colors.rewardSoft, borderColor: Colors.reward + '55' },
          ]}>
          <Ionicons name={tipKind ? 'bulb' : 'warning'} size={18} color={tipKind ? Colors.success : Colors.reward} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="label" color={tipKind ? Colors.success : Colors.reward}>
              {tipKind ? t('read.examTip') : t('read.watchOut')}
            </Text>
            <Text style={{ fontSize: 15 * scale, lineHeight: 22 * scale }}>{b.text}</Text>
          </View>
        </Pressable>
      );
    }
    case 'note':
      return (
        <Pressable {...press}>
          <NoteBlock title={b.title} text={b.text} scale={scale} />
        </Pressable>
      );
    case 'code':
      return <CodeBlock text={b.text} scale={scale} />;
    case 'image':
      return <FigureBlock src={b.src} caption={b.caption} alt={b.alt} scale={scale} />;
    default:
      return (
        <Pressable {...press}>
          <Text style={body}>{b.text}</Text>
        </Pressable>
      );
  }
}

const styles = StyleSheet.create({
  tools: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  readMeta: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  sizeBtn: {
    minWidth: 40,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bullet: { flexDirection: 'row', gap: Spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  formula: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  formulaText: { fontFamily: 'Manrope_700Bold', textAlign: 'center' },
  callout: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
  recap: { gap: Spacing.sm, borderColor: Colors.success + '44', marginTop: Spacing.sm },
  point: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'flex-start' },
  toast: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
});
