import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { LessonCard } from '@/components/content/lesson-card';
import { SearchBar } from '@/components/content/search-bar';
import { SubjectTile } from '@/components/content/subject-tile';
import { ChoiceChip } from '@/components/personalize/choice-chip';
import { BookResult, TextResult, VideoResult } from '@/components/search/everything';
import { Card, Screen, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatLabel, FORMAT_META, search, subjectName, type Format } from '@/lib/catalog';
import { catalogueFor, useBooksProfile } from '@/lib/books';
import { useLibrary } from '@/lib/library-store';
import { NO_RESULTS, searchAll, type SearchResults } from '@/lib/search-all';

const TABS = ['all', 'videos', 'summaries', 'books', 'lessons', 'more', 'subjects', 'topics'] as const;

/** Screen 36: search results with type tabs and format filters. */
export default function SearchResultsScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const { addSearch } = useLibrary();
  const { t } = useTranslation('home');
  const { t: tExams } = useTranslation('exams');
  const [input, setInput] = useState(params.q ?? '');
  const [q, setQ] = useState(params.q ?? '');
  const [tab, setTab] = useState<(typeof TABS)[number]>('all');
  const [format, setFormat] = useState<Format | null>(null);

  const results = useMemo(() => search(q), [q]);
  const { profile } = useBooksProfile();
  const country = profile?.country ? catalogueFor(profile.country) : undefined;
  // Everything beyond lessons comes from the server. If it can't be reached, the lessons still show.
  const [found, setFound] = useState<{ q: string; results: SearchResults } | null>(null);
  useEffect(() => {
    let stale = false;
    searchAll(q, country)
      .then((r) => !stale && setFound({ q, results: r }))
      .catch(() => !stale && setFound({ q, results: NO_RESULTS }));
    return () => {
      stale = true;
    };
  }, [q, country]);
  const all = found?.q === q ? found.results : null;
  const more = all ? all.courses.length + all.exams.length + all.reels.length + all.skills.length : 0;
  const lessons = format ? results.lessons.filter((l) => l.format === format) : results.lessons;
  const total =
    results.lessons.length +
    results.subjects.length +
    results.topics.length +
    (all ? all.videos.length + all.summaries.length + all.books.length + more : 0);
  const counts = {
    all: total,
    videos: all?.videos.length ?? 0,
    summaries: all?.summaries.length ?? 0,
    books: all?.books.length ?? 0,
    more,
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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {TABS.map((id) => (
          <Pressable
            key={id}
            onPress={() => setTab(id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === id }}
            style={[styles.tab, tab === id && styles.tabOn]}>
            <Text variant="small" color={tab === id ? Colors.text : Colors.textSecondary}>
              {t(`results.tabs.${id}`)}{' '}
              <Text variant="small" color={tab === id ? Colors.text : Colors.textMuted}>
                {counts[id]}
              </Text>
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {total === 0 && !all ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.lg }} />
      ) : total === 0 ? (
        <EmptyState
          icon="search"
          title={t('results.noResults', { query: q })}
          body={t('results.noResultsBody')}
          action={{ label: t('results.openStudio'), onPress: () => router.push('/studio') }}
        />
      ) : (
        <>
          {all && (tab === 'all' || tab === 'videos') && all.videos.length > 0 && (
            <View style={{ gap: Spacing.sm }}>
              <Text variant="label" color={Colors.textMuted}>
                {t('results.videos')}
              </Text>
              {(tab === 'all' ? all.videos.slice(0, 4) : all.videos).map((v) => (
                <VideoResult key={v.youtubeId} video={v} />
              ))}
            </View>
          )}

          {all && (tab === 'all' || tab === 'summaries') && all.summaries.length > 0 && (
            <View style={{ gap: Spacing.xs }}>
              <Text variant="label" color={Colors.textMuted}>
                {t('results.summaries')}
              </Text>
              {(tab === 'all' ? all.summaries.slice(0, 4) : all.summaries).map((s) => (
                <TextResult
                  key={`${s.library}/${s.id}`}
                  icon="document-text"
                  title={s.title}
                  body={`${s.libraryName} · ${s.short}`}
                  onPress={() => router.push(`/books/summary/${s.library}/${s.id}` as Href)}
                />
              ))}
            </View>
          )}

          {all && (tab === 'all' || tab === 'books') && all.books.length > 0 && (
            <View style={{ gap: Spacing.sm }}>
              <Text variant="label" color={Colors.textMuted}>
                {t('results.books')}
              </Text>
              {(tab === 'all' ? all.books.slice(0, 4) : all.books).map((b) => (
                <BookResult key={b.id} book={b} />
              ))}
            </View>
          )}

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
          {all && (tab === 'all' || tab === 'more') && more > 0 && (
            <View style={{ gap: Spacing.xs }}>
              <Text variant="label" color={Colors.textMuted}>
                {t('results.more')}
              </Text>
              {all.skills.map((s) => (
                <TextResult
                  key={s.id}
                  icon="rocket"
                  title={s.name}
                  body={s.tagline}
                  onPress={() => router.push(`/skills/${s.id}` as Href)}
                />
              ))}
              {all.courses.map((c) => (
                <TextResult
                  key={c.id}
                  icon="school"
                  title={c.title}
                  onPress={() => router.push(`/courses/${c.id}` as Href)}
                />
              ))}
              {all.exams.map((e) => (
                <TextResult
                  key={`${e.exam}/${e.subject}`}
                  icon="reader"
                  title={`${tExams(`exams.${e.exam}.name`)} · ${tExams(`subjects.${e.subject}` as never)}`}
                  body={t('results.pastQuestions')}
                  onPress={() => router.push(`/exams/${e.exam}/${e.subject}` as Href)}
                />
              ))}
              {all.reels.map((r) => (
                <TextResult
                  key={r.id}
                  icon="bulb"
                  title={r.text}
                  onPress={() => router.push({ pathname: '/reels', params: { subject: r.subject } } as unknown as Href)}
                />
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
