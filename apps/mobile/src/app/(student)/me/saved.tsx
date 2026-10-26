import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { LessonCard } from '@/components/content/lesson-card';
import { MaterialCard } from '@/components/materials/material-card';
import { ChoiceChip } from '@/components/personalize/choice-chip';
import { Screen, ScreenHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { getLesson } from '@/lib/catalog';
import { useLibrary } from '@/lib/library-store';
import { useMaterials } from '@/lib/studio/store';

/** Tab ids; labels are translated at render: saved.tabs.<id>. */
const TABS = ['packs', 'lessons', 'offline'] as const;

/** Screen 183: my saved materials: study packs and bookmarked lessons. */
export default function MySavedScreen() {
  const lib = useLibrary();
  const { materials } = useMaterials();
  const { t } = useTranslation('settings');
  const [tab, setTab] = useState<(typeof TABS)[number]>('packs');
  const packs = materials.filter((m) => m.status === 'ready' && m.saved);
  const offline = materials.filter((m) => m.status === 'ready' && m.offline);
  const lessons = lib.saved.map(getLesson).filter((l) => !!l);
  const counts = { packs: packs.length, lessons: lessons.length, offline: offline.length };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('me.eyebrow')} title={t('saved.title')} />
      <View style={{ flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' }}>
        {TABS.map((id) => (
          <ChoiceChip
            key={id}
            label={t('myCourses.tabCount', { label: t(`saved.tabs.${id}`), count: counts[id] })}
            selected={tab === id}
            onPress={() => setTab(id)}
          />
        ))}
      </View>
      {tab === 'lessons' ? (
        lessons.length ? (
          <View style={{ gap: Spacing.sm }}>
            {lessons.map((l) => (
              <LessonCard key={l!.id} lesson={l!} progress={lib.progress[l!.id]} />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="bookmark-outline"
            title={t('saved.noLessons')}
            body={t('saved.noLessonsBody')}
            action={{ label: t('saved.explore'), onPress: () => router.push('/explore') }}
          />
        )
      ) : (tab === 'packs' ? packs : offline).length ? (
        <View style={{ gap: Spacing.sm }}>
          {(tab === 'packs' ? packs : offline).map((m) => (
            <MaterialCard key={m.id} m={m} />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="layers-outline"
          title={tab === 'offline' ? t('saved.noOffline') : t('saved.noPacks')}
          body={tab === 'offline' ? t('saved.noOfflineBody') : t('saved.noPacksBody')}
          action={{ label: t('saved.openLibrary'), onPress: () => router.push('/study/library') }}
        />
      )}
    </Screen>
  );
}
