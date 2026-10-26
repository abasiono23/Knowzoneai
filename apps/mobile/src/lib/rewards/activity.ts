import { useCourses } from '../courses/store';
import { useSession } from '../session';
import { dayKey } from '../world/levels';
import { useWorld } from '../world/store';
import { useRewards } from './store';

const DAY = 86400000;

function runs(days: Set<string>, today: number) {
  // Current streak: today counts if active, but a not-yet-active today doesn't break it.
  let current = 0;
  for (let d = days.has(dayKey(today)) ? 0 : 1; d < 1000 && days.has(dayKey(today - d * DAY)); d++) current++;
  const sorted = [...days].sort();
  let longest = 0;
  let run = 0;
  let prev = '';
  for (const k of sorted) {
    run = prev && dayKey(new Date(prev + 'T12:00:00').getTime() + DAY) === k ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = k;
  }
  return { current, longest };
}

/**
 * Days you learned on: anything that earned XP, daily challenges, course lessons, plus the
 * account's own streak count. Frozen days keep a streak alive without counting as active.
 */
export function useActivity(now: number) {
  const { user } = useSession();
  const { wallet } = useRewards();
  const { dailyHistory } = useWorld();
  const { done } = useCourses();
  const active = new Set<string>();
  const frozen = new Set<string>();
  wallet?.transactions.filter((t) => t.xp > 0 && t.reason !== 'opening').forEach((t) => active.add(dayKey(t.at)));
  Object.entries(dailyHistory).forEach(([k, v]) => (v.frozen ? frozen.add(k) : active.add(k)));
  Object.values(done).forEach((t) => active.add(dayKey(t)));
  // The server's streak counts days before this device had any history.
  for (let d = 1; d <= (user?.streak ?? 0); d++) active.add(dayKey(now - d * DAY));
  frozen.forEach((k) => active.delete(k));
  const both = new Set([...active, ...frozen]);
  const { current, longest } = runs(both, now);
  return { active, frozen, current, longest, total: active.size, today: active.has(dayKey(now)) };
}
