import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { TutorErrorState } from '@/components/tutor/error-state';
import { Button, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { DAILY_ID, getLevel } from '@/lib/world/levels';
import { useWorld } from '@/lib/world/store';
import type { Level, World } from '@/lib/world/types';

import { levelHref } from './world-ui';

export type LoadedLevel = Level & { world: World };

/** Loads [levelId]; sends first-timers to the tutorial and blocks locked levels. */
export function LevelRoute({
  children,
  skipTutorial,
  allowLocked,
}: {
  children: (l: LoadedLevel) => ReactNode;
  skipTutorial?: boolean;
  /** Practice modes (friend battles, results pages) may open any level. */
  allowLocked?: boolean;
}) {
  const { t } = useTranslation('world');
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  const { ready, tutorialDone, isLevelUnlocked, isWorldUnlocked } = useWorld();
  const level = getLevel(levelId);
  if (!ready) return null;
  if (!level)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <TutorErrorState kind="missing" title={t('levelRoute.notFound')} onBack={() => router.replace('/play')} />
      </Screen>
    );
  if (!skipTutorial && !tutorialDone)
    return <Redirect href={{ pathname: '/world/tutorial', params: { next: levelHref(level) as string } }} />;
  const open = allowLocked || level.id === DAILY_ID || (isWorldUnlocked(level.world) && isLevelUnlocked(level));
  if (!open)
    return (
      <AuthScreen
        center
        title={t('levelRoute.locked')}
        subtitle={
          isWorldUnlocked(level.world)
            ? t('levelRoute.clearPrevious', { number: level.number - 1, world: level.world.name })
            : t('levelRoute.collectStars', { count: level.world.unlockStars, world: level.world.name })
        }
        hero={
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="lock-closed" size={56} color={Colors.textMuted} />
          </View>
        }
        footer={
          <Button title={t('levelRoute.backToMap')} onPress={() => router.replace(`/world/${level.worldId}/levels` as Href)} />
        }>
        <Text variant="small" color={Colors.textMuted} center>
          {t('levelRoute.earnStars')}
        </Text>
      </AuthScreen>
    );
  return <>{children(level)}</>;
}
