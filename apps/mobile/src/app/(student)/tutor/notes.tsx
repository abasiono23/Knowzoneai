import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { EmptyState } from '@/components/content/empty-state';
import { ChoiceChip } from '@/components/personalize/choice-chip';
import { AnswerBlocks } from '@/components/tutor/answer-blocks';
import { ActionSheet, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { notebookLabel, timeAgoMs } from '@/lib/tutor/format';
import { useTutor } from '@/lib/tutor/store';

/** My notes: everything saved from the tutor, by notebook. */
export default function NotesScreen() {
  const { t } = useTranslation('tutor');
  const { notes, decks, removeNote } = useTutor();
  const [notebook, setNotebook] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const books = [...new Set(notes.map((n) => n.notebook))];
  const shown = notebook ? notes.filter((n) => n.notebook === notebook) : notes;

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        eyebrow={t('notes.eyebrow', {
          notes: t('notes.notesCount', { count: notes.length }),
          decks: t('notes.decksCount', { count: decks.length }),
        })}
        eyebrowColor={Colors.reward}
        title={t('notes.title')}
      />
      {notes.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title={t('notes.emptyTitle')}
          body={t('notes.emptyBody')}
          action={{ label: t('shared.askTheTutor'), onPress: () => router.replace('/tutor') }}
        />
      ) : (
        <>
          {books.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.xs }}>
              <ChoiceChip label={t('shared.all')} selected={!notebook} onPress={() => setNotebook(null)} />
              {books.map((b) => (
                <ChoiceChip
                  key={b}
                  label={notebookLabel(b)}
                  selected={notebook === b}
                  onPress={() => setNotebook(notebook === b ? null : b)}
                />
              ))}
            </ScrollView>
          )}
          {shown.map((n) => (
            <Card key={n.id} style={{ gap: Spacing.xs }}>
              <View style={styles.head}>
                <Pressable
                  onPress={() => setOpen(open === n.id ? null : n.id)}
                  accessibilityRole="button"
                  style={{ flex: 1, gap: 2 }}>
                  <Text variant="label" color={Colors.reward} style={{ fontSize: 10 }}>
                    {t('notes.meta', {
                      notebook: notebookLabel(n.notebook),
                      time: timeAgoMs(n.createdAt),
                    }).toUpperCase()}
                  </Text>
                  <Text variant="bodyStrong">{n.title}</Text>
                  <Text variant="small" color={Colors.textSecondary} numberOfLines={open === n.id ? undefined : 2}>
                    {n.summary}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setMenu(n.id)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t('shared.optionsFor', { title: n.title })}>
                  <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textMuted} />
                </Pressable>
              </View>
              {open === n.id && (
                <Animated.View entering={FadeIn} style={{ gap: Spacing.xs }}>
                  <AnswerBlocks blocks={n.body} />
                  <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                    {n.source}
                  </Text>
                </Animated.View>
              )}
            </Card>
          ))}
        </>
      )}
      <ActionSheet
        visible={!!menu}
        onClose={() => setMenu(null)}
        options={
          menu
            ? [{ label: t('notes.deleteNote'), icon: 'trash', destructive: true, onPress: () => removeNote(menu) }]
            : []
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
});
