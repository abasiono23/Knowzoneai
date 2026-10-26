import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { LessonCard } from '@/components/content/lesson-card';
import { SubjectTile } from '@/components/content/subject-tile';
import { SectionHeader, Screen, Text } from '@/components/ui';
import { CoursesRail } from '@/components/courses/courses-rail';
import { VideosBanner } from '@/components/videos/videos-banner';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { CATEGORIES, categoryName, LESSONS, SUBJECTS, trending } from '@/lib/catalog';

const COLLECTIONS = [
  {
    id: 'exam' as const,
    colors: ['#9C6B1E', '#FFC857'] as const,
    lessons: LESSONS.filter((l) => l.exams?.includes('JAMB')),
  },
  {
    id: 'quick' as const,
    colors: ['#0E8F6E', '#2DD4BF'] as const,
    lessons: LESSONS.filter((l) => l.minutes <= 5),
  },
  {
    id: 'future' as const,
    colors: ['#6A45FF', '#FF7A93'] as const,
    lessons: LESSONS.filter((l) => ['computer-science', 'ai-literacy', 'entrepreneurship'].includes(l.subjectId)),
  },
];

export default function ExploreScreen() {
  const { t } = useTranslation('home');
  return (
    <Screen>
      <View style={{ gap: Spacing.xxs }}>
        <Text variant="label" color={Colors.success}>
          {t('explore.eyebrow')}
        </Text>
        <Text variant="display">{t('explore.title')}</Text>
      </View>

      <Pressable
        onPress={() => router.push('/search')}
        accessibilityRole="search"
        accessibilityLabel={t('actions.search', { ns: 'common' })}
        style={styles.search}>
        <Ionicons name="search" size={20} color={Colors.textMuted} />
        <Text color={Colors.textMuted}>{t('search.placeholder')}</Text>
      </Pressable>

      <VideosBanner />

      <CoursesRail title={t('explore.courses')} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: Spacing.xs }}
        style={{ marginRight: -Spacing.md }}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => router.push({ pathname: '/subjects', params: { category: c.id } })}
            accessibilityRole="button"
            style={styles.category}>
            <Ionicons name={c.icon} size={16} color={c.color} />
            <Text variant="small" style={{ fontFamily: 'Manrope_600SemiBold' }}>
              {categoryName(c, t)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ gap: Spacing.sm }}>
        <SectionHeader
          title={t('explore.browseSubjects')}
          action={t('explore.allSubjects')}
          onAction={() => router.push('/subjects')}
        />
        <View style={styles.grid}>
          {SUBJECTS.slice(0, 6).map((s) => (
            <SubjectTile key={s.id} subject={s} />
          ))}
        </View>
      </View>

      <View style={{ gap: Spacing.xs }}>
        <SectionHeader
          title={t('explore.trendingNow')}
          action={t('actions.seeAll', { ns: 'common' })}
          onAction={() => router.push('/trending')}
        />
        {trending(undefined, 5).map((l, i) => (
          <LessonCard key={l.id} lesson={l} rank={i + 1} />
        ))}
      </View>

      {COLLECTIONS.map((c) => (
        <View key={c.id} style={{ gap: Spacing.sm }}>
          <LinearGradient colors={c.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.collection}>
            <Text variant="heading">{t(`explore.collections.${c.id}.title`)}</Text>
            <Text variant="small" color="rgba(255,255,255,0.9)">
              {t('explore.collectionMeta', {
                body: t(`explore.collections.${c.id}.body`),
                count: c.lessons.length,
              })}
            </Text>
          </LinearGradient>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: Spacing.sm }}
            style={{ marginRight: -Spacing.md }}>
            {c.lessons.slice(0, 8).map((l) => (
              <LessonCard key={l.id} lesson={l} variant="tile" />
            ))}
          </ScrollView>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 52,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  category: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  collection: { borderRadius: Radius.lg, padding: Spacing.md, gap: 2 },
});
