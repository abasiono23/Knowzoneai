import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { LessonCard } from '@/components/content/lesson-card';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { getLesson } from '@/lib/catalog';
import { useLibrary } from '@/lib/library-store';

type Bucket = 'today' | 'yesterday' | 'thisWeek' | 'earlier';

function bucket(at: number): Bucket {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (at >= start.getTime()) return 'today';
  if (at >= start.getTime() - 86_400_000) return 'yesterday';
  if (at >= start.getTime() - 6 * 86_400_000) return 'thisWeek';
  return 'earlier';
}

/** Screen 42: lessons opened recently, grouped by day. */
export default function RecentlyViewedScreen() {
  const { recent, progress } = useLibrary();
  const { t } = useTranslation('home');
  const groups = new Map<Bucket, typeof recent>();
  const bucketLabel = (b: Bucket) =>
    b === 'today'
      ? t('time.today', { ns: 'common' })
      : b === 'yesterday'
        ? t('time.yesterday', { ns: 'common' })
        : t(`recent.${b}`);
  recent.forEach((r) => groups.set(bucket(r.at), [...(groups.get(bucket(r.at)) ?? []), r]));

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('recent.eyebrow')} title={t('recent.title')} />
      {recent.length === 0 ? (
        <EmptyState
          icon="time"
          title={t('recent.emptyTitle')}
          body={t('recent.emptyBody')}
          action={{ label: t('lists.exploreLessons'), onPress: () => router.navigate('/explore') }}
        />
      ) : (
        [...groups.entries()].map(([label, items]) => (
          <View key={label} style={{ gap: Spacing.xs }}>
            <Text variant="label" color={Colors.textMuted}>
              {bucketLabel(label).toUpperCase()}
            </Text>
            {items.map((r) => {
              const l = getLesson(r.id);
              return l ? <LessonCard key={r.id} lesson={l} progress={progress[l.id]} /> : null;
            })}
          </View>
        ))
      )}
    </Screen>
  );
}
