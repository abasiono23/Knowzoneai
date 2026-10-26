export const DAY = 86_400_000;

/** Epoch milliseconds, the time format the app uses everywhere. */
export const ms = (d: Date | null | undefined) => (d ? d.getTime() : undefined);

/** YYYY-MM-DD in UTC. */
export const dayKey = (d: Date = new Date()) => d.toISOString().slice(0, 10);

/** A valid IANA time zone ("Africa/Lagos"), or undefined. */
export function validTimeZone(tz: unknown): string | undefined {
  if (typeof tz !== 'string' || !tz || tz.length > 64) return undefined;
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone: tz });
    return tz;
  } catch {
    return undefined;
  }
}

/**
 * YYYY-MM-DD in the learner's own time zone (sent by the app as X-Timezone), so streaks and daily
 * rewards roll over at their midnight. Lagos time when the app didn't say.
 */
export const localDayKey = (d: Date = new Date(), tz?: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: validTimeZone(tz) ?? 'Africa/Lagos', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

/** "2026-W44": the ISO week (Monday to Sunday) of a YYYY-MM-DD date. */
export function weekKey(day: string) {
  const d = new Date(`${day}T00:00:00Z`);
  const weekday = (d.getUTCDay() + 6) % 7; // Monday = 0
  const thursday = new Date(d.getTime() + (3 - weekday) * DAY);
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  const week = 1 + Math.floor((thursday.getTime() - yearStart.getTime()) / (7 * DAY));
  return `${thursday.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/**
 * The league week everyone shares (Lagos time, which has no daylight saving): its key, when it
 * started, and when it ends.
 */
export function leagueWeek(now = new Date()) {
  const day = localDayKey(now, 'Africa/Lagos');
  const d = new Date(`${day}T00:00:00Z`);
  const weekday = (d.getUTCDay() + 6) % 7;
  // Monday 00:00 in Lagos is Sunday 23:00 UTC.
  const start = new Date(d.getTime() - weekday * DAY - 3_600_000);
  return { key: weekKey(day), start, end: new Date(start.getTime() + 7 * DAY) };
}
