import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { CourseCard } from '@/components/courses/course-card';
import { ChoiceChip } from '@/components/personalize/choice-chip';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { CATEGORIES, categoryName, formatViews, levelLabel, type Level } from '@/lib/catalog';
import { coursesInCategory } from '@/lib/courses/catalog';
import { courseMinutes } from '@/lib/courses/types';

/** Labels live in `courses:category.sorts`. */
const SORTS = ['popular', 'rated', 'short'] as const;
type Sort = (typeof SORTS)[number];

/** Screen 111: every course in one category, with level, exam and sort filters. */
export default function CourseCategoryScreen() {
  const { t } = useTranslation('courses');
  const { t: th } = useTranslation('home');
  const { id } = useLocalSearchParams<{ id: string }>();
  const cat = CATEGORIES.find((c) => c.id === id);
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [examOnly, setExamOnly] = useState(false);
  const [sort, setSort] = useState<Sort>('popular');

  const all = coursesInCategory(id);
  const list = all
    .filter((c) => level === 'all' || c.level === level)
    .filter((c) => !examOnly || !!c.exams?.length)
    .sort((a, b) =>
      sort === 'popular'
        ? b.learners - a.learners
        : sort === 'rated'
          ? b.rating - a.rating
          : courseMinutes(a) - courseMinutes(b),
    );
  const learners = all.reduce((n, c) => n + c.learners, 0);

  if (!cat)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <EmptyState
          icon="grid"
          title={t('category.notFound')}
          body={t('category.notFoundBody')}
          action={{ label: t('category.allCourses'), onPress: () => router.replace('/courses') }}
        />
      </Screen>
    );

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('category.eyebrow')} />
      <LinearGradient
        colors={[cat.color + '44', cat.color + '0A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}>
        <View style={[styles.icon, { backgroundColor: cat.color + '33' }]}>
          <Ionicons name={cat.icon} size={26} color={cat.color} />
        </View>
        <Text variant="title">{categoryName(cat, th)}</Text>
        <Text variant="small" color={Colors.textSecondary}>
          {t('counts.courses', { count: all.length })} ·{' '}
          {t('counts.learners', { count: learners, value: formatViews(learners) })}
        </Text>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: Spacing.xs }}
        style={{ marginRight: -Spacing.md }}>
        {(['all', 'Beginner', 'Intermediate', 'Advanced'] as const).map((l) => (
          <ChoiceChip
            key={l}
            label={l === 'all' ? t('category.allLevels') : levelLabel(l, th)}
            selected={level === l}
            onPress={() => setLevel(l)}
          />
        ))}
        <ChoiceChip
          label={t('category.examPrep')}
          emoji="🎯"
          selected={examOnly}
          onPress={() => setExamOnly(!examOnly)}
        />
      </ScrollView>
      <View style={styles.sortRow}>
        <Text variant="small" color={Colors.textMuted}>
          {t('category.sort')}
        </Text>
        {SORTS.map((s) => (
          <ChoiceChip key={s} label={t(`category.sorts.${s}`)} selected={sort === s} onPress={() => setSort(s)} />
        ))}
      </View>

      {list.length ? (
        <View style={{ gap: Spacing.md }}>
          {list.map((c) => (
            <CourseCard key={c.id} course={c} variant="row" />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="filter"
          title={all.length ? t('category.noMatch') : t('category.comingSoon')}
          body={all.length ? t('category.noMatchBody') : t('category.comingSoonBody')}
          action={
            all.length
              ? { label: t('category.clearFilters'), onPress: () => (setLevel('all'), setExamOnly(false)) }
              : undefined
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.xxs, borderWidth: 1, borderColor: Colors.border },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' },
});
