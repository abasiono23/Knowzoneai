import { router } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

import { api } from '../api';
import { useSession } from '../session';

/**
 * Checks there are enough AI credits before starting a generation. If not, opens the
 * usage-limit screen (216) and returns false. Credits are only charged once a generation succeeds.
 */
export function useCreditGate() {
  const { user } = useSession();
  return useCallback(
    (credits: number, what: 'study pack' | 'video') => {
      if ((user?.aiCredits ?? 0) >= credits) return true;
      router.push({ pathname: '/billing/limit', params: { need: String(credits), what } });
      return false;
    },
    [user?.aiCredits],
  );
}

/** Charges credits for a finished generation. Stable across renders, safe to call from timers. */
export function useCreditSpender() {
  const { setUser } = useSession();
  const ref = useRef(setUser);
  useEffect(() => {
    ref.current = setUser;
  }, [setUser]);
  return useCallback((credits: number, reason: string) => {
    if (credits <= 0) return;
    api
      .spendCredits(credits, reason)
      .then(({ user }) => ref.current(user))
      .catch(() => {
        /* The gate already checked the balance; a race here is settled by the server. */
      });
  }, []);
}
