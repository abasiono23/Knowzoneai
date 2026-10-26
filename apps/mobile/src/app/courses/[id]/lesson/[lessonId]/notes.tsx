import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

import { EmptyState } from '@/components/content/empty-state';
import { LessonRoute } from '@/components/courses/course-route';
import { ChoiceChip } from '@/components/personalize/choice-chip';
import { ActionSheet, Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Fonts, NoWebOutline, Radius, Spacing } from '@/constants/theme';
import { formatDate } from '@/i18n';
import type { LessonRef } from '@/lib/courses/catalog';
import { useCourses } from '@/lib/courses/store';
import { allLessons, lessonKey, type LessonNote } from '@/lib/courses/types';

const ago = (at: number, now: number, t: TFunction<'common'>) => {
  const m = Math.round((now - at) / 60000);
  if (m < 1) return t('time.justNow');
  if (m < 60) return t('time.minutesAgo', { count: m });
  const h = Math.round(m / 60);
  if (h < 24) return t('time.hoursAgo', { count: h });
  return formatDate(at, { day: 'numeric', month: 'numeric', year: 'numeric' });
};

/** Screen 119: your notes for a lesson, or the whole course. */
export default function LessonNotesScreen() {
  return <LessonRoute>{(ref) => <Notes lessonRef={ref} />}</LessonRoute>;
}

function Notes({ lessonRef }: { lessonRef: LessonRef }) {
  const { t } = useTranslation('courses');
  const { t: tc } = useTranslation('common');
  const { course, lesson } = lessonRef;
  const { notes, addNote, editNote, deleteNote } = useCourses();
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState<{ id: string; lessonId: string } | null>(null);
  const [scope, setScope] = useState<'lesson' | 'course'>('lesson');
  const [menu, setMenu] = useState<(LessonNote & { lessonId: string }) | null>(null);
  const [now] = useState(() => Date.now());

  const lessons = allLessons(course);
  const groups = (scope === 'lesson' ? [lesson] : lessons)
    .map((l) => ({ l, items: notes[lessonKey(course.id, l.id)] ?? [] }))
    .filter((g) => g.items.length);
  const total = lessons.reduce((n, l) => n + (notes[lessonKey(course.id, l.id)]?.length ?? 0), 0);

  const save = () => {
    const text = draft.trim();
    if (!text) return;
    if (editing) editNote(course.id, editing.lessonId, editing.id, text);
    else addNote(course.id, lesson.id, text);
    setDraft('');
    setEditing(null);
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('notes.eyebrow')} title={lesson.title} />
      <Card style={{ gap: Spacing.sm }}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={editing ? t('notes.placeholderEdit') : t('notes.placeholderNew')}
          placeholderTextColor={Colors.textMuted}
          multiline
          style={styles.input}
          accessibilityLabel={editing ? t('notes.editA11y') : t('notes.newA11y')}
        />
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {editing && (
            <Button
              variant="ghost"
              title={tc('actions.cancel')}
              style={{ flex: 1 }}
              onPress={() => {
                setEditing(null);
                setDraft('');
              }}
            />
          )}
          <Button
            title={editing ? t('notes.saveChanges') : t('notes.add')}
            icon={editing ? 'checkmark' : 'add'}
            disabled={!draft.trim()}
            style={{ flex: 1 }}
            onPress={save}
          />
        </View>
      </Card>

      <View style={styles.filters}>
        <ChoiceChip label={t('notes.thisLesson')} selected={scope === 'lesson'} onPress={() => setScope('lesson')} />
        <ChoiceChip
          label={t('notes.wholeCourse', { count: total })}
          selected={scope === 'course'}
          onPress={() => setScope('course')}
        />
      </View>

      {groups.length === 0 ? (
        <EmptyState
          icon="create-outline"
          title={t('notes.emptyTitle')}
          body={t('notes.emptyBody')}
        />
      ) : (
        groups.map((g) => (
          <View key={g.l.id} style={{ gap: Spacing.xs }}>
            {scope === 'course' && (
              <Pressable onPress={() => router.push(`/courses/${course.id}/lesson/${g.l.id}`)} accessibilityRole="link">
                <Text variant="label" color={Colors.primary}>
                  {g.l.title.toUpperCase()} ›
                </Text>
              </Pressable>
            )}
            {g.items.map((n) => (
              <Animated.View key={n.id} entering={FadeInDown} layout={Layout}>
                <Card style={{ gap: Spacing.xs }}>
                  {n.quote && (
                    <View style={styles.quote}>
                      <Text
                        variant="small"
                        color={Colors.textSecondary}
                        style={{ fontStyle: 'italic' }}
                        numberOfLines={6}>
                        “{n.quote}”
                      </Text>
                    </View>
                  )}
                  {!!n.text && <Text>{n.text}</Text>}
                  <View style={styles.foot}>
                    <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                      {n.quote && !n.text ? t('notes.highlight', { time: ago(n.at, now, tc) }) : ago(n.at, now, tc)}
                    </Text>
                    <Pressable
                      onPress={() => setMenu({ ...n, lessonId: g.l.id })}
                      accessibilityRole="button"
                      accessibilityLabel={t('notes.options')}
                      hitSlop={10}>
                      <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textMuted} />
                    </Pressable>
                  </View>
                </Card>
              </Animated.View>
            ))}
          </View>
        ))
      )}

      <ActionSheet
        visible={!!menu}
        title={t('notes.sheetTitle')}
        onClose={() => setMenu(null)}
        options={
          menu
            ? [
                {
                  label: menu.text ? t('notes.edit') : t('notes.comment'),
                  icon: 'create-outline',
                  onPress: () => {
                    setEditing({ id: menu.id, lessonId: menu.lessonId });
                    setDraft(menu.text);
                    setMenu(null);
                  },
                },
                {
                  label: t('notes.delete'),
                  icon: 'trash-outline',
                  destructive: true,
                  onPress: () => {
                    deleteNote(course.id, menu.lessonId, menu.id);
                    setMenu(null);
                  },
                },
              ]
            : []
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    ...NoWebOutline,
    minHeight: 96,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'top',
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceRaised,
  },
  filters: { flexDirection: 'row', gap: Spacing.xs },
  quote: { borderLeftWidth: 3, borderLeftColor: Colors.primary, paddingLeft: Spacing.sm },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
