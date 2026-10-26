import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { errorText } from '@/i18n/errors';
import { api, type QuestBoards } from '@/lib/api';
import { USE_MOCKS } from '@/lib/config';
import { useSession } from '@/lib/session';
import { useWorld } from '@/lib/world/store';

export type QuestReward = { kind: 'quest' | 'chest'; title?: string; xp: number; coins: number; item?: string };

/**
 * The learner's World Quests (kept on the server): loads on focus, claims quests and opens chests.
 * After a claim, `reward` holds what was won until the celebration is dismissed.
 */
export function useQuests() {
  const { setUser } = useSession();
  const { settings, refreshItems } = useWorld();
  const [boards, setBoards] = useState<QuestBoards | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reward, setReward] = useState<QuestReward | null>(null);

  const load = useCallback(() => {
    if (USE_MOCKS) return;
    api
      .getQuests()
      .then((b) => {
        setBoards(b);
        setError(null);
      })
      .catch((e) => setError(errorText(e)));
  }, []);
  useFocusEffect(load);

  const celebrate = useCallback(() => {
    if (settings.haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [settings.haptics]);

  const claim = useCallback(
    async (board: 'daily' | 'weekly', id: string, title: string) => {
      setBusy(true);
      try {
        const res = await api.claimQuest(board, id);
        setBoards(res.quests);
        setUser(res.user);
        setReward({ kind: 'quest', title, ...res.reward });
        celebrate();
      } catch (e) {
        setError(errorText(e));
      } finally {
        setBusy(false);
      }
    },
    [setUser, celebrate],
  );

  const openChest = useCallback(
    async (chest: 'daily' | 'journey', index = 0) => {
      setBusy(true);
      try {
        const res = await api.openQuestChest(chest, index);
        setBoards(res.quests);
        setUser(res.user);
        setReward({ kind: 'chest', ...res.reward });
        if (res.reward.item) refreshItems();
        celebrate();
      } catch (e) {
        setError(errorText(e));
      } finally {
        setBusy(false);
      }
    },
    [setUser, celebrate, refreshItems],
  );

  return { boards, error, setError, busy, load, claim, openChest, reward, dismiss: () => setReward(null) };
}
