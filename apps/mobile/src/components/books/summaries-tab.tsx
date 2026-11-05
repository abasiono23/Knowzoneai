import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { booksApi, summariesUnderReview, type SummaryCard, type SummaryList } from '@/lib/books';

/** Ignores capitals and accents, so "resume" finds "résumé". */
const plain = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ًͯ-ٟ⁦-⁩]/g, '')
    .toLowerCase();

const matches = (c: SummaryCard, words: string[]) => {
  const hay = plain([c.title, c.short, c.libraryName, ...c.keywords].join(' '));
  return words.every((w) => hay.includes(w));
};

/** A subject's summaries: the whole course, then a topic for everything in it, all searchable. */
export function SummariesTab({ catalogue, subject, level }: { catalogue: string; subject: string; level: string }) {
  const { t, i18n } = useTranslation('books');
  const [list, setList] = useState<SummaryList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const load = useCallback(() => {
    booksApi
      .summaries(catalogue, subject, level)
      .then(setList)
      .catch((e) => setError(errorText(e, t('shelf.summaryLoadFailed'))));
  }, [catalogue, subject, level, t]);
  useEffect(load, [load]);

  const words = useMemo(() => plain(q).split(/\s+/).filter(Boolean), [q]);
  const courses = useMemo(() => list?.courses.filter((c) => matches(c, words)) ?? [], [list, words]);
  const topics = useMemo(() => list?.topics.filter((c) => matches(c, words)) ?? [], [list, words]);

  if (error)
    return (
      <View style={{ gap: Spacing.sm, alignItems: 'center' }}>
        <Text variant="small" color={Colors.textSecondary} center>
          {error}
        </Text>
        <Button
          title={t('shelf.retry')}
          variant="secondary"
          onPress={() => {
            setError(null);
            load();
          }}
        />
      </View>
    );
  if (!list) return <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.lg }} />;
  if (!list.topics.length)
    return (
      <Card style={styles.soon}>
        <Ionicons name="document-text" size={36} color={Colors.primary} />
        <Text variant="heading" center>
          {t('shelf.soon')}
        </Text>
        <Text variant="small" color={Colors.textSecondary} center>
          {t('shelf.soonSummaries')}
        </Text>
      </Card>
    );

  const showSubject = list.courses.length > 1;
  const yours = topics.filter((c) => c.yours);
  const more = topics.filter((c) => !c.yours);
  return (
    <>
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t('shelf.summarySearch')}
          placeholderTextColor={Colors.textMuted}
          accessibilityLabel={t('shelf.summarySearch')}
          style={styles.searchInput}
        />
      </View>

      {list.translated && summariesUnderReview(i18n.language) && (
        <Text variant="small" color={Colors.textSecondary}>
          {t('shelf.summaryReviewing')}
        </Text>
      )}

      {courses.length > 0 && (
        <View style={{ gap: Spacing.sm }}>
          <Text variant="label" color={Colors.primary}>
            {t('shelf.summaryCourse')}
          </Text>
          {courses.map((c) => (
            <Row key={c.library} card={c} course />
          ))}
        </View>
      )}
      {yours.length > 0 && (
        <View style={{ gap: Spacing.sm }}>
          <Text variant="label" color={Colors.success}>
            {t('shelf.summaryYours')}
          </Text>
          {yours.map((c) => (
            <Row key={`${c.library}/${c.id}`} card={c} showSubject={showSubject} />
          ))}
        </View>
      )}
      {more.length > 0 && (
        <View style={{ gap: Spacing.sm }}>
          <Text variant="label" color={Colors.textSecondary}>
            {yours.length > 0 || list.topics.some((c) => c.yours) ? t('shelf.summaryMore') : t('shelf.summaryTopics')}
          </Text>
          {more.map((c) => (
            <Row key={`${c.library}/${c.id}`} card={c} showSubject={showSubject} />
          ))}
        </View>
      )}
      {!courses.length && !topics.length && (
        <Text variant="small" color={Colors.textSecondary} center>
          {t('shelf.summaryNone')}
        </Text>
      )}
    </>
  );
}

function Row({ card, course, showSubject }: { card: SummaryCard; course?: boolean; showSubject?: boolean }) {
  return (
    <Pressable
      onPress={() => router.push(`/books/summary/${card.library}/${card.id ?? 'overview'}` as Href)}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, course && styles.course, pressed && { opacity: 0.8 }]}>
      <View style={{ flex: 1, gap: 3 }}>
        {showSubject && (
          <Text style={{ fontSize: 11, fontFamily: Fonts.bold }} color={Colors.primary}>
            {card.libraryName}
          </Text>
        )}
        <Text variant="bodyStrong">{card.title}</Text>
        <Text variant="small" color={Colors.textSecondary} numberOfLines={2}>
          {card.short}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} style={{ alignSelf: 'center' }} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  soon: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, minHeight: 46, fontFamily: Fonts.regular, fontSize: 15, color: Colors.text },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  course: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
});
