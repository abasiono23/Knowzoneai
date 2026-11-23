import { Redirect, useLocalSearchParams } from 'expo-router';

/**
 * The old "level complete" page: what it showed (rewards, collectibles, achievements, new worlds) is now
 * part of the results page, so links to it land there.
 */
export default function LevelCompleteScreen() {
  const p = useLocalSearchParams<{ levelId: string; run?: string; unlocked?: string; ach?: string }>();
  return (
    <Redirect
      href={{
        pathname: '/world/results/[levelId]',
        params: { levelId: p.levelId, run: p.run ?? '', fresh: '1', unlocked: p.unlocked ?? '', ach: p.ach ?? '' },
      }}
    />
  );
}
