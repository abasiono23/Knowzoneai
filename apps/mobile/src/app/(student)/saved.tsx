import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { LessonCard } from '@/components/content/lesson-card';
import { ChoiceChip } from '@/components/personalize/choice-chip';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { formatLabel, getLesson, type Format } from '@/lib/catalog';
import { useLibrary } from '@/lib/library-store';

/** Screen 43: bookmarked lessons with format filters. */
export default function SavedScreen() {
  const { saved, progress } = useLibrary();
  const { t } = useTranslation('home');
  const [format, setFormat] = useState<Format | null>(null);
  const lessons = saved.map(getLesson).filter((l): l is NonNullable<typeof l> => !!l);
  const shown = format ? lessons.filter((l) => l.format === format) : lessons;
  const formats = [...new Set(lessons.map((l) => l.format))];

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('saved.eyebrow')} eyebrowColor={Colors.reward} title={t('saved.title')} />
      {lessons.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title={t('saved.emptyTitle')}
          body={t('saved.emptyBody')}
          action={{ label: t('saved.findLessons'), onPress: () => router.navigate('/explore') }}
        />
      ) : (
        <>
          {formats.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.xs }}>
              <ChoiceChip
                label={t('saved.all', { count: lessons.length })}
                selected={!format}
                onPress={() => setFormat(null)}
              />
              {formats.map((f) => (
                <ChoiceChip
                  key={f}
                  label={formatLabel(f, t)}
                  selected={format === f}
                  onPress={() => setFormat(format === f ? null : f)}
                />
              ))}
            </ScrollView>
          )}
          <View style={{ gap: 2 }}>
            {shown.map((l) => (
              <LessonCard key={l.id} lesson={l} progress={progress[l.id]} />
            ))}
          </View>
          <Text variant="small" color={Colors.textMuted} center>
            {t('saved.removeHint')}
          </Text>
        </>
      )}
    </Screen>
  );
}
