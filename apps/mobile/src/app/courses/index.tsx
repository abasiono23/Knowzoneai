import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { Rail } from '@/components/content/rail';
import { CourseCard } from '@/components/courses/course-card';
import { Button, Card, ProgressBar, Screen, ScreenHeader, SectionHeader, Text } from '@/components/ui';
import { Colors, Fonts, NoWebOutline, Radius, Spacing } from '@/constants/theme';
import { CATEGORIES, categoryName } from '@/lib/catalog';
import { COURSES, coursesInCategory, getCourse, searchCourses } from '@/lib/courses/catalog';
import { useCourses } from '@/lib/courses/store';
import { allLessons, KIND_META } from '@/lib/courses/types';

/** Screen 110: the course catalogue. */
export default function CourseCatalogue() {
  const { t } = useTranslation('courses');
  const { t: th } = useTranslation('home');
  const { enrolled, saved, last, progressOf } = useCourses();
  const [query, setQuery] = useState('');
  const results = searchCourses(query);

  const mine = Object.keys(enrolled)
    .sort((a, b) => enrolled[b] - enrolled[a])
    .map(getCourse)
    .filter((c) => !!c);
  const inProgress = mine.filter((c) => !progressOf(c).complete);
  const resume = inProgress[0];
  const resumeProgress = resume ? progressOf(resume) : null;
  const resumeLesson = resume
    ? (allLessons(resume).find((l) => l.id === last[resume.id] && !progressOf(resume).complete) ?? resumeProgress?.next)
    : undefined;
  const savedCourses = saved.map(getCourse).filter((c) => !!c);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('catalogue.eyebrow', { count: COURSES.length })} title={t('catalogue.title')} />
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('catalogue.searchPlaceholder')}
          placeholderTextColor={Colors.textMuted}
          style={styles.input}
          accessibilityLabel={t('catalogue.searchA11y')}
          returnKeyType="search"
        />
        {!!query && (
          <Pressable
            onPress={() => setQuery('')}
            accessibilityRole="button"
            accessibilityLabel={t('catalogue.clearSearch')}
            hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>

      {query.trim() ? (
        results.length ? (
          <View style={{ gap: Spacing.md }}>
            <Text variant="small" color={Colors.textSecondary}>
              {t('catalogue.results', { count: results.length, query: query.trim() })}
            </Text>
            {results.map((c) => (
              <CourseCard key={c.id} course={c} variant="row" />
            ))}
          </View>
        ) : (
          <EmptyState icon="search" title={t('catalogue.noResults')} body={t('catalogue.noResultsBody')} />
        )
      ) : (
        <>
          {resume && resumeProgress && resumeLesson && (
            <Card style={styles.resume}>
              <Text variant="label" color={Colors.success}>
                {t('catalogue.continueLabel')}
              </Text>
              <Text variant="heading">{resume.title}</Text>
              <View style={styles.resumeRow}>
                <Ionicons
                  name={KIND_META[resumeLesson.kind].icon}
                  size={14}
                  color={KIND_META[resumeLesson.kind].color}
                />
                <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }} numberOfLines={1}>
                  {t('catalogue.next', {
                    title: resumeLesson.title,
                    duration: t('duration.minutes', { count: resumeLesson.minutes }),
                  })}
                </Text>
              </View>
              <ProgressBar progress={resumeProgress.pct} height={6} />
              <Button
                title={t('catalogue.resume')}
                icon="play"
                onPress={() => router.push(`/courses/${resume.id}/lesson/${resumeLesson.id}`)}
              />
            </Card>
          )}

          <View style={{ gap: Spacing.sm }}>
            <SectionHeader title={t('catalogue.featured')} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: Spacing.sm, paddingRight: Spacing.md }}
              style={{ marginRight: -Spacing.md }}>
              {COURSES.filter((c) => c.featured).map((c) => (
                <CourseCard key={c.id} course={c} variant="hero" />
              ))}
            </ScrollView>
          </View>

          <View style={{ gap: Spacing.sm }}>
            <SectionHeader title={t('catalogue.browseByCategory')} />
            <View style={styles.cats}>
              {CATEGORIES.map((cat) => {
                const n = coursesInCategory(cat.id).length;
                const name = categoryName(cat, th);
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => router.push(`/courses/category/${cat.id}`)}
                    accessibilityRole="button"
                    accessibilityLabel={t('catalogue.categoryA11y', { name, count: n })}
                    style={({ pressed }) => [styles.cat, pressed && { opacity: 0.8 }]}>
                    <View style={[styles.catIcon, { backgroundColor: cat.color + '22' }]}>
                      <Ionicons name={cat.icon} size={18} color={cat.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="small" numberOfLines={1} style={{ fontFamily: Fonts.semibold }}>
                        {name}
                      </Text>
                      <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
                        {t('counts.courses', { count: n })}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {inProgress.length > 1 && (
            <Rail title={t('catalogue.yourCourses')}>
              {inProgress.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </Rail>
          )}

          {savedCourses.length > 0 && (
            <Rail title={t('catalogue.saved')}>
              {savedCourses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </Rail>
          )}

          {CATEGORIES.map((cat) => {
            const list = coursesInCategory(cat.id);
            if (!list.length) return null;
            return (
              <Rail
                key={cat.id}
                title={categoryName(cat, th)}
                onSeeAll={() => router.push(`/courses/category/${cat.id}`)}>
                {list.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </Rail>
            );
          })}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    height: 48,
  },
  input: { ...NoWebOutline, flex: 1, color: Colors.text, fontFamily: Fonts.regular, fontSize: 15 },
  resume: { gap: Spacing.xs, borderColor: Colors.success + '55' },
  resumeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cats: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  cat: {
    width: '48.5%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
