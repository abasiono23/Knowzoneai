import { useCallback, useEffect, useState } from 'react';

import i18n from '@/i18n';
import { errorText } from '@/i18n/errors';

import { api, type ReferralInvalidReason, type ReferralOverview } from '../api';
import { useSession } from '../session';
import { storage } from '../storage';

const SENT_KEY = 'knowzone.invites-sent';

/** Loads the referral overview (and keeps the account's AI credits in sync with it). */
export function useReferrals() {
  const { setUser } = useSession();
  const [data, setData] = useState<ReferralOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    () =>
      api
        .getReferrals()
        .then(({ user, ...overview }) => {
          setData(overview);
          setUser(user);
          setError(null);
        })
        .catch((e) => setError(errorText(e, i18n.t('referrals:errors.load'))))
        .finally(() => setLoading(false)),
    [setUser],
  );

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    error,
    loading,
    refresh: () => {
      setLoading(true);
      return load();
    },
  };
}

/** How many invites were sent from this device, per channel (for the invite screen). */
export async function recordInviteSent(channel: string) {
  try {
    const raw = await storage.get(SENT_KEY);
    const counts: Record<string, number> = raw ? JSON.parse(raw) : {};
    counts[channel] = (counts[channel] ?? 0) + 1;
    await storage.set(SENT_KEY, JSON.stringify(counts));
    return counts;
  } catch {
    return {};
  }
}
export async function invitesSent(): Promise<Record<string, number>> {
  try {
    const raw = await storage.get(SENT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const INVALID_KEY = {
  'not-found': 'notFound',
  expired: 'expired',
  'own-code': 'ownCode',
  'already-referred': 'alreadyReferred',
  'not-new': 'notNew',
  'cap-reached': 'capReached',
} as const satisfies Record<ReferralInvalidReason, string>;

const INVALID_ICON: Record<ReferralInvalidReason, string> = {
  'not-found': 'search',
  expired: 'time',
  'own-code': 'person',
  'already-referred': 'checkmark-done',
  'not-new': 'school',
  'cap-reached': 'hourglass',
};

/**
 * Copy for an invite code that can't be used. `title` and `body` are read in the current
 * language each time they're accessed (`referrals:invalid.<reason>`), so read them while rendering.
 */
export const INVALID_COPY = Object.fromEntries(
  (Object.keys(INVALID_ICON) as ReferralInvalidReason[]).map((r) => [
    r,
    {
      icon: INVALID_ICON[r],
      get title() {
        return i18n.t(`referrals:invalid.${INVALID_KEY[r]}.title`);
      },
      get body() {
        return i18n.t(`referrals:invalid.${INVALID_KEY[r]}.body`);
      },
    },
  ]),
) as Record<ReferralInvalidReason, { readonly title: string; readonly body: string; icon: string }>;
