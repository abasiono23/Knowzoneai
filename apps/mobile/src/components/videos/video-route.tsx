import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { TutorErrorState } from '@/components/tutor/error-state';
import { Screen, ScreenHeader } from '@/components/ui';
import { useVideos } from '@/lib/videos/store';
import type { Video } from '@/lib/videos/types';

/** Loads the video from the route's [id] (catalogue or generated) and handles "not found". */
export function VideoRoute({ children }: { children: (v: Video) => ReactNode }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('videos');
  const { find, ready } = useVideos();
  const v = find(id);
  if (!ready) return null;
  if (!v || !v.scenes.length) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <TutorErrorState
          kind="missing"
          title={t('route.notAvailableTitle')}
          body={t('route.notAvailableBody')}
          onBack={() => router.replace('/videos')}
        />
      </Screen>
    );
  }
  return <>{children(v)}</>;
}
