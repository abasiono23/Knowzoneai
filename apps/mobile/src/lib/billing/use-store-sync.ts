import { useEffect } from 'react';

import { api } from '../api';
import { useSession } from '../session';
import { STORE_PURCHASES, STORE_UI, ownedPurchases } from './store';

/**
 * Picks up a store purchase the app never got to confirm (it was closed or went offline right after
 * paying): anything the store still lists as undelivered is sent to the server when the billing
 * screens open. Google's own notification normally unlocks the plan before this ever runs.
 */
export function useStoreSync() {
  const { user, setUser } = useSession();
  const userId = user?.id;
  useEffect(() => {
    if (!STORE_UI || !STORE_PURCHASES || !userId) return;
    let stale = false;
    (async () => {
      try {
        const waiting = (await ownedPurchases()).filter((p) => !p.acknowledged);
        if (!waiting.length) return;
        const r = await api.restoreGooglePurchases(
          waiting.map(({ purchaseToken, productId, packageName }) => ({ purchaseToken, productId, packageName })),
        );
        if (!stale) setUser(r.user);
      } catch {
        // No store, no connection, or not this account's purchase: nothing to do here.
      }
    })();
    return () => {
      stale = true;
    };
  }, [userId, setUser]);
}
