import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/content/empty-state';
import { Screen, ScreenHeader } from '@/components/ui';
import { blockerFor, getReward, type Blocker, type Reward } from '@/lib/rewards/catalog';
import { useRewards } from '@/lib/rewards/store';
import { useSession } from '@/lib/session';
import { dayKey } from '@/lib/world/levels';

export type RewardState = {
  reward: Reward;
  blocker: Blocker | null;
  owned: boolean;
  count: number;
  coins: number;
  level: number;
};

/** Loads [rewardId] and works out whether it can be redeemed right now. */
export function RewardRoute({ children }: { children: (s: RewardState) => ReactNode }) {
  const { rewardId } = useLocalSearchParams<{ rewardId: string }>();
  const { user } = useSession();
  const { owns, countOf } = useRewards();
  const { t } = useTranslation('rewards');
  const reward = getReward(rewardId);
  if (!user) return null;
  if (!reward)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <EmptyState
          icon="gift-outline"
          title={t('route.notFound')}
          body={t('route.notFoundBody')}
          action={{ label: t('redemptions.browse'), onPress: () => router.replace('/rewards/catalogue') }}
        />
      </Screen>
    );
  const owned = owns(reward.id);
  const blocker = blockerFor(reward, { coins: user.coins, level: user.level, owned, today: dayKey() });
  return <>{children({ reward, blocker, owned, count: countOf(reward.id), coins: user.coins, level: user.level })}</>;
}
