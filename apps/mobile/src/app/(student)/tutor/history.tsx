import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { ChoiceChip } from '@/components/personalize/choice-chip';
import { ActionSheet, Button, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Fonts, NoWebOutline, Radius, Spacing } from '@/constants/theme';
import {
  conversationTitle,
  dayBucket,
  dayBucketLabel,
  subjectLabel,
  timeAgoMs,
  type DayBucket,
} from '@/lib/tutor/format';
import { useTutor } from '@/lib/tutor/store';

/** Screen 50: every past conversation, searchable, filterable by subject, with pin and delete. */
export default function HistoryScreen() {
  const { t } = useTranslation('tutor');
  const { conversations, togglePin, remove } = useTutor();
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<{ id: string; title: string; pinned: boolean } | null>(null);
  const subjects = [...new Set(conversations.map((c) => c.subject))];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations
      .filter((c) => !subject || c.subject === subject)
      .filter(
        (c) =>
          !q ||
          conversationTitle(c.title).toLowerCase().includes(q) ||
          c.messages.some((m) => (m.role === 'user' ? m.text : (m.answer?.summary ?? '')).toLowerCase().includes(q)),
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [conversations, query, subject]);

  const pinned = filtered.filter((c) => c.pinned);
  const groups = new Map<DayBucket, typeof filtered>();
  filtered
    .filter((c) => !c.pinned)
    .forEach((c) => groups.set(dayBucket(c.updatedAt), [...(groups.get(dayBucket(c.updatedAt)) ?? []), c]));
  // Section keys stay stable ids; labels are translated for display.
  const sections: [string, string, typeof filtered][] = [
    ...(pinned.length ? [['pinned', t('history.pinned'), pinned] as [string, string, typeof filtered]] : []),
    ...[...groups.entries()].map(
      ([bucket, items]) => [bucket, dayBucketLabel(bucket), items] as [string, string, typeof filtered],
    ),
  ];

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('history.eyebrow', { count: conversations.length })} title={t('history.title')} />
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('history.search')}
          placeholderTextColor={Colors.textMuted}
          style={styles.input}
          accessibilityLabel={t('history.search')}
        />
      </View>
      {subjects.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.xs }}>
          <ChoiceChip label={t('shared.all')} selected={!subject} onPress={() => setSubject(null)} />
          {subjects.map((s) => (
            <ChoiceChip
              key={s}
              label={subjectLabel(s)}
              selected={subject === s}
              onPress={() => setSubject(subject === s ? null : s)}
            />
          ))}
        </ScrollView>
      )}

      {conversations.length === 0 ? (
        <EmptyState
          icon="chatbubbles"
          title={t('history.emptyTitle')}
          body={t('history.emptyBody')}
          action={{ label: t('history.askFirst'), onPress: () => router.replace('/tutor/new') }}
        />
      ) : filtered.length === 0 ? (
        <Text color={Colors.textSecondary} center>
          {t('history.noMatch', { query })}
        </Text>
      ) : (
        sections.map(([key, label, items]) => (
          <View key={key} style={{ gap: Spacing.xs }}>
            <Text variant="label" color={Colors.textMuted}>
              {label.toUpperCase()}
            </Text>
            {items.map((c) => {
              const lastAnswer = [...c.messages].reverse().find((m) => m.role === 'assistant' && m.answer);
              return (
                <View key={c.id}>
                  <Pressable
                    onPress={() => router.push(`/tutor/${c.id}`)}
                    onLongPress={() => setMenuFor(c)}
                    accessibilityRole="button"
                    accessibilityLabel={conversationTitle(c.title)}
                    accessibilityHint={t('history.longPress')}
                    style={({ pressed }) => [styles.item, pressed && { opacity: 0.8 }]}>
                    <View style={styles.icon}>
                      <Ionicons
                        name={c.pinned ? 'pin' : 'chatbubbles'}
                        size={18}
                        color={c.pinned ? Colors.reward : Colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text variant="bodyStrong" numberOfLines={1} style={{ paddingEnd: Spacing.lg }}>
                        {conversationTitle(c.title)}
                      </Text>
                      <Text variant="small" color={Colors.textSecondary} numberOfLines={1}>
                        {lastAnswer?.role === 'assistant' ? lastAnswer.answer?.summary : t('history.noAnswer')}
                      </Text>
                      <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                        {t('history.meta', {
                          subject: subjectLabel(c.subject),
                          count: c.messages.filter((m) => m.role === 'user').length,
                          time: timeAgoMs(c.updatedAt),
                        })}
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => setMenuFor(c)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={t('shared.optionsFor', { title: conversationTitle(c.title) })}
                    style={styles.more}>
                    <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textMuted} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))
      )}
      <ActionSheet
        visible={!!menuFor}
        title={menuFor ? conversationTitle(menuFor.title) : undefined}
        onClose={() => setMenuFor(null)}
        options={
          menuFor
            ? [
                {
                  label: menuFor.pinned ? t('shared.unpin') : t('shared.pin'),
                  icon: 'pin',
                  onPress: () => togglePin(menuFor.id),
                },
                {
                  label: t('shared.deleteConversation'),
                  icon: 'trash',
                  destructive: true,
                  onPress: () => remove(menuFor.id),
                },
              ]
            : []
        }
      />
      {conversations.length > 0 && (
        <Button
          variant="secondary"
          icon="add"
          title={t('shared.newConversation')}
          onPress={() => router.push('/tutor/new')}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 48,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: { ...NoWebOutline, flex: 1, color: Colors.text, fontFamily: Fonts.regular, fontSize: 16, paddingVertical: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  more: { position: 'absolute', top: Spacing.sm, end: Spacing.sm, padding: 6 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
