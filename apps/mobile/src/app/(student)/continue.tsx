import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { LessonCard } from '@/components/content/lesson-card';
import { MaterialCard } from '@/components/materials/material-card';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { getLesson } from '@/lib/catalog';
import { useLibrary } from '@/lib/library-store';
import { dueCards, useMaterials } from '@/lib/studio/store';

/** Screen 41: everything in progress, lessons and AI study packs. */
export default function ContinueLearningScreen() {
  const { recent, progress } = useLibrary();
  const { t } = useTranslation('home');
  const { materials } = useMaterials();

  const lessons = recent
    .map((r) => getLesson(r.id))
    .filter((l): l is NonNullable<typeof l> => !!l && (progress[l.id] ?? 0) > 0 && (progress[l.id] ?? 0) < 1);
  // Packs still being studied: not ready yet, or flashcards not all mastered.
  const openPacks = materials.filter((m) => m.status !== 'ready' || dueCards(m).mastered < dueCards(m).total);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('continue.eyebrow')} title={t('continue.title')} />
      {lessons.length === 0 && openPacks.length === 0 ? (
        <EmptyState
          icon="play-circle"
          title={t('continue.emptyTitle')}
          body={t('continue.emptyBody')}
          action={{ label: t('lists.exploreLessons'), onPress: () => router.navigate('/explore') }}
        />
      ) : (
        <>
          {lessons.length > 0 && (
            <View style={{ gap: Spacing.xs }}>
              <Text variant="label" color={Colors.textMuted}>
                {t('lists.lessons')}
              </Text>
              {lessons.map((l) => (
                <LessonCard
                  key={l.id}
                  lesson={l}
                  progress={progress[l.id]}
                  meta={t('continue.progressMeta', {
                    percent: formatNumber(progress[l.id] ?? 0, { style: 'percent' }),
                    minutes: l.minutes,
                  })}
                />
              ))}
            </View>
          )}
          {openPacks.length > 0 && (
            <View style={{ gap: Spacing.sm }}>
              <Text variant="label" color={Colors.textMuted}>
                {t('continue.packs')}
              </Text>
              {openPacks.map((m) => (
                <MaterialCard key={m.id} m={m} />
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}
