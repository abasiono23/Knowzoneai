import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { LessonThumb } from '@/components/content/lesson-card';
import { SearchBar } from '@/components/content/search-bar';
import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { Screen, SectionHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { search, subjectName, SUBJECTS, TRENDING_SEARCHES } from '@/lib/catalog';
import { useLibrary } from '@/lib/library-store';

/** Screen 35: global search with recent and trending searches and live suggestions. */
export default function SearchScreen() {
  const { searches, addSearch, clearSearches } = useLibrary();
  const { t } = useTranslation('home');
  const [q, setQ] = useState('');
  const live = useMemo(() => (q.trim().length > 1 ? search(q) : null), [q]);

  const submit = (query: string) => {
    addSearch(query);
    router.push({ pathname: '/search/results', params: { q: query } });
  };

  return (
    <Screen withTabBar={false}>
      <SearchBar value={q} onChangeText={setQ} onSubmit={submit} autoFocus />

      {live ? (
        <View style={{ gap: 2 }}>
          {live.subjects.slice(0, 3).map((s) => (
            <Suggestion
              key={s.id}
              icon="library"
              label={subjectName(s, t)}
              hint={t('search.subject')}
              onPress={() => router.push(`/subjects/${s.id}`)}
            />
          ))}
          {live.topics.slice(0, 3).map((x) => (
            <Suggestion
              key={x.subject.id + x.topic}
              icon="pricetag"
              label={x.topic}
              hint={subjectName(x.subject, t)}
              onPress={() => submit(x.topic)}
            />
          ))}
          {live.lessons.slice(0, 5).map((l) => (
            <Pressable
              key={l.id}
              onPress={() => router.push(`/lesson/${l.id}`)}
              accessibilityRole="button"
              style={styles.suggestion}>
              <LessonThumb lesson={l} size="sm" />
              <Text variant="bodyStrong" style={{ flex: 1 }} numberOfLines={2}>
                {l.title}
              </Text>
            </Pressable>
          ))}
          <Pressable onPress={() => submit(q.trim())} accessibilityRole="button" style={styles.seeAll}>
            <Ionicons name="search" size={18} color={Colors.primary} />
            <Text variant="bodyStrong" color={Colors.primary}>
              {t('search.seeAllFor', { query: q.trim() })}
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          {searches.length > 0 && (
            <View style={{ gap: Spacing.xs }}>
              <SectionHeader
                title={t('search.recent')}
                action={t('actions.clear', { ns: 'common' })}
                onAction={clearSearches}
              />
              {searches.map((s) => (
                <Suggestion key={s} icon="time-outline" label={s} onPress={() => submit(s)} />
              ))}
            </View>
          )}
          <View style={{ gap: Spacing.sm }}>
            <SectionHeader title={t('search.trending')} />
            <ChipWrap>
              {TRENDING_SEARCHES.map((x) => (
                <ChoiceChip key={x} label={x} emoji="🔥" selected={false} onPress={() => submit(x)} />
              ))}
            </ChipWrap>
          </View>
          <View style={{ gap: Spacing.sm }}>
            <SectionHeader
              title={t('search.jumpToSubject')}
              action={t('search.all')}
              onAction={() => router.push('/subjects')}
            />
            <ChipWrap>
              {SUBJECTS.slice(0, 8).map((s) => (
                <ChoiceChip
                  key={s.id}
                  label={subjectName(s, t)}
                  emoji={s.emoji}
                  selected={false}
                  onPress={() => router.push(`/subjects/${s.id}`)}
                />
              ))}
            </ChipWrap>
          </View>
        </>
      )}
    </Screen>
  );
}

function Suggestion({
  icon,
  label,
  hint,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.suggestion}>
      <View style={styles.suggestionIcon}>
        <Ionicons name={icon} size={18} color={Colors.textSecondary} />
      </View>
      <Text style={{ flex: 1 }}>{label}</Text>
      {hint && (
        <Text variant="small" color={Colors.textMuted}>
          {hint}
        </Text>
      )}
      <Ionicons
        name="arrow-up-outline"
        size={16}
        color={Colors.textMuted}
        style={{ transform: [{ rotate: '-45deg' }] }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  suggestion: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
});
