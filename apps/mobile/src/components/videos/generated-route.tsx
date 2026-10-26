import { Redirect, router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { TutorErrorState } from '@/components/tutor/error-state';
import { Screen, ScreenHeader } from '@/components/ui';
import { useVideos } from '@/lib/videos/store';
import type { GeneratedVideo } from '@/lib/videos/types';

/** Loads a generated video by [id]; unfinished ones go to the progress screen. */
export function GeneratedRoute({
  children,
  allowUnfinished,
}: {
  children: (v: GeneratedVideo) => ReactNode;
  allowUnfinished?: boolean;
}) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('videos');
  const { generated, ready } = useVideos();
  const v = generated.find((x) => x.id === id);
  if (!ready) return null;
  if (!v) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <TutorErrorState
          kind="missing"
          title={t('route.notFoundTitle')}
          body={t('route.notFoundBody')}
          onBack={() => router.replace('/videos/mine')}
        />
      </Screen>
    );
  }
  if (!allowUnfinished && v.status !== 'ready') return <Redirect href={`/videos/generate/${v.id}`} />;
  return <>{children(v)}</>;
}
