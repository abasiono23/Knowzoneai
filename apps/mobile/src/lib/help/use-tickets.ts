import { useCallback, useEffect, useState } from 'react';

import i18n, { formatDate } from '@/i18n';
import { errorText } from '@/i18n/errors';

import { api, type HelpTicket } from '../api';

/** The signed-in user's support tickets, bug reports, feedback, reports and appeals. */
export function useTickets() {
  const [tickets, setTickets] = useState<HelpTicket[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      api
        .getTickets()
        .then(({ tickets: t }) => {
          setTickets(t);
          setError(null);
        })
        .catch((e) => setError(errorText(e, i18n.t('help:tickets.loadError')))),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  /** Swap in an updated ticket after a reply or close. */
  const put = useCallback((t: HelpTicket) => setTickets((all) => (all ?? []).map((x) => (x.id === t.id ? t : x))), []);

  return { tickets, error, refresh: load, put };
}

/** How long ago something happened, in the current language. Ticket kinds and statuses are translated at
 * render time with t(`tickets.kind.${kind}`) and t(`tickets.status.${status}`). */
export function timeAgo(t: number, now: number) {
  const m = Math.round((now - t) / 60000);
  if (m < 1) return i18n.t('common:time.justNow');
  if (m < 60) return i18n.t('common:time.minutesAgo', { count: m });
  const h = Math.round(m / 60);
  if (h < 24) return i18n.t('common:time.hoursAgo', { count: h });
  return formatDate(t, { day: 'numeric', month: 'short' });
}
