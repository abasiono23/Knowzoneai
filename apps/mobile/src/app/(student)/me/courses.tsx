import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { CourseCard } from '@/components/courses/course-card';
import { ChoiceChip } from '@/components/personalize/choice-chip';
import { Button, Screen, ScreenHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { getCourse } from '@/lib/courses/catalog';
import { useCourses } from '@/lib/courses/store';

/** Tab ids; labels are translated at render: myCourses.tabs.<id>. */
const TABS = ['progress', 'done', 'saved'] as const;

/** Screen 181: my courses. */
export default function MyCoursesScreen() {
  const { enrolled, saved, progressOf } = useCourses();
  const { t } = useTranslation('settings');
  const [tab, setTab] = useState<(typeof TABS)[number]>('progress');
  const mine = Object.keys(enrolled)
    .sort((a, b) => enrolled[b] - enrolled[a])
    .map(getCourse)
    .filter((c) => !!c);
  const lists = {
    progress: mine.filter((c) => !progressOf(c).complete),
    done: mine.filter((c) => progressOf(c).complete),
    saved: saved.map(getCourse).filter((c) => !!c && !enrolled[c.id]),
  };
  const list = lists[tab];

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('me.eyebrow')} title={t('myCourses.title')} />
      <View style={{ flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' }}>
        {TABS.map((id) => (
          <ChoiceChip
            key={id}
            label={t('myCourses.tabCount', { label: t(`myCourses.tabs.${id}`), count: lists[id].length })}
            selected={tab === id}
            onPress={() => setTab(id)}
          />
        ))}
      </View>
      {list.length === 0 ? (
        <EmptyState
          icon="school-outline"
          title={t(`myCourses.empty.${tab}`)}
          body={tab === 'done' ? t('myCourses.emptyDoneBody') : t('myCourses.emptyBody')}
          action={{ label: t('myCourses.browse'), onPress: () => router.push('/courses') }}
        />
      ) : (
        <View style={{ gap: Spacing.md }}>
          {list.map((c) => (
            <CourseCard key={c!.id} course={c!} variant="row" />
          ))}
        </View>
      )}
      {list.length > 0 && (
        <Button
          variant="secondary"
          icon="add"
          title={t('myCourses.findAnother')}
          onPress={() => router.push('/courses')}
        />
      )}
    </Screen>
  );
}
