import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { LessonCard } from '@/components/content/lesson-card';
import { SearchBar } from '@/components/content/search-bar';
import { SubjectTile } from '@/components/content/subject-tile';
import { ChoiceChip } from '@/components/personalize/choice-chip';
import { Card, Screen, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatLabel, FORMAT_META, search, subjectName, type Format } from '@/lib/catalog';
import { useLibrary } from '@/lib/library-store';

const TABS = ['all', 'lessons', 'subjects', 'topics'] as const;

/** Screen 36: search results with type tabs and format filters. */
export default function SearchResultsScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const { addSearch } = useLibrary();
  const { t } = useTranslation('home');
  const [input, setInput] = useState(params.q ?? '');
  const [q, setQ] = useState(params.q ?? '');
  const [tab, setTab] = useState<(typeof TABS)[number]>('all');
  const [format, setFormat] = useState<Format | null>(null);

  const results = useMemo(() => search(q), [q]);
  const lessons = format ? results.lessons.filter((l) => l.format === format) : results.lessons;
  const total = results.lessons.length + results.subjects.length + results.topics.length;
  const counts = {
    all: total,
    lessons: results.lessons.length,
    subjects: results.subjects.length,
    topics: results.topics.length,
  };

  const submit = (query: string) => {
    addSearch(query);
    setQ(query);
  };

  return (
    <Screen withTabBar={false}>
      <SearchBar value={input} onChangeText={setInput} onSubmit={submit} />

      <View style={styles.tabs}>
        {TABS.map((id) => (
          <Pressable
            key={id}
            onPress={() => setTab(id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === id }}
            style={[styles.tab, tab === id && styles.tabOn]}>
            <Text variant="small" color={tab === id ? Colors.text : Colors.textSecondary}>
              {t(`results.tabs.${id}`)}{' '}
              <Text variant="small" color={Colors.textMuted}>
                {counts[id]}
              </Text>
            </Text>
          </Pressable>
        ))}
      </View>

      {total === 0 ? (
        <EmptyState
          icon="search"
          title={t('results.noResults', { query: q })}
          body={t('results.noResultsBody')}
          action={{ label: t('results.openStudio'), onPress: () => router.push('/studio') }}
        />
      ) : (
        <>
          {(tab === 'all' || tab === 'lessons') && results.lessons.length > 0 && (
            <View style={{ gap: Spacing.xs }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.xs }}>
                <ChoiceChip label={t('results.allFormats')} selected={!format} onPress={() => setFormat(null)} />
                {(Object.keys(FORMAT_META) as Format[]).map((f) => (
                  <ChoiceChip
                    key={f}
                    label={formatLabel(f, t)}
                    selected={format === f}
                    onPress={() => setFormat(format === f ? null : f)}
                  />
                ))}
              </ScrollView>
              <Text variant="label" color={Colors.textMuted}>
                {t('lists.lessons')}
              </Text>
              {lessons.length === 0 ? (
                <Text color={Colors.textSecondary}>{format && t(`results.noFormatMatch.${format}`)}</Text>
              ) : (
                (tab === 'all' ? lessons.slice(0, 5) : lessons).map((l) => <LessonCard key={l.id} lesson={l} />)
              )}
            </View>
          )}

          {(tab === 'all' || tab === 'subjects') && results.subjects.length > 0 && (
            <View style={{ gap: Spacing.sm }}>
              <Text variant="label" color={Colors.textMuted}>
                {t('results.subjects')}
              </Text>
              <View style={styles.grid}>
                {results.subjects.map((s) => (
                  <SubjectTile key={s.id} subject={s} />
                ))}
              </View>
            </View>
          )}

          {(tab === 'all' || tab === 'topics') && results.topics.length > 0 && (
            <View style={{ gap: Spacing.sm }}>
              <Text variant="label" color={Colors.textMuted}>
                {t('results.topics')}
              </Text>
              {results.topics.map((x) => (
                <Pressable
                  key={x.subject.id + x.topic}
                  onPress={() =>
                    router.push({ pathname: '/subjects/[id]', params: { id: x.subject.id, topic: x.topic } })
                  }
                  accessibilityRole="button">
                  <Card style={styles.topic}>
                    <Text style={{ fontSize: 22 }}>{x.subject.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyStrong">{x.topic}</Text>
                      <Text variant="small" color={Colors.textSecondary}>
                        {subjectName(x.subject, t)}
                      </Text>
                    </View>
                  </Card>
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: Spacing.xs },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  topic: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
