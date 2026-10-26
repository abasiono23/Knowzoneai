import { Redirect, router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { TutorErrorState } from '@/components/tutor/error-state';
import { Screen, ScreenHeader } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useMaterial } from '@/lib/studio/store';
import type { Material, StudyContent } from '@/lib/studio/types';

/**
 * Loads the material from the route's [id]. Shows "not found", sends unfinished
 * materials to the status screen, and only renders children once content exists.
 */
export function ReadyMaterial({ children }: { children: (m: Material & { content: StudyContent }) => ReactNode }) {
  const { t } = useTranslation('study');
  const { id } = useLocalSearchParams<{ id: string }>();
  const { material, ready } = useMaterial(id);

  if (!ready) return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
  if (!material) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <TutorErrorState
          kind="missing"
          title={t('shared.notFoundTitle')}
          body={t('shared.notFoundBody')}
          onBack={() => router.replace('/study/library')}
        />
      </Screen>
    );
  }
  if (material.status !== 'ready' || !material.content) return <Redirect href={`/study/status/${material.id}`} />;
  return <>{children(material as Material & { content: StudyContent })}</>;
}
