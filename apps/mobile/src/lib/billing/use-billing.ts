import { useCallback, useEffect, useState } from 'react';

import i18n, { formatDate } from '../../i18n';
import { errorText } from '../../i18n/errors';
import { api, type Billing } from '../api';
import { useSession } from '../session';

/** Loads subscription, payments and support tickets, keeping the account (plan, credits) in sync. */
export function useBilling() {
  const { setUser } = useSession();
  const [billing, setBilling] = useState<Billing | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      api
        .getBilling()
        .then(({ billing: b, user }) => {
          setBilling(b);
          setUser(user);
          setError(null);
        })
        .catch((e) => setError(errorText(e, i18n.t('billing:errors.load')))),
    [setUser],
  );

  useEffect(() => {
    load();
  }, [load]);

  return { billing, error, refresh: load, setBilling };
}

/** A long date ("4 March 2026") in the current language. */
export const fmtDate = (t: number) => formatDate(t, { day: 'numeric', month: 'long', year: 'numeric' });
export const daysUntil = (t: number, now: number) => Math.max(0, Math.ceil((t - now) / 86400000));
