import { prisma } from '../db.js';
import { gamesUpkeep } from '../routes/games.js';
import { billingUpkeep } from './billing.js';
import { refreshCourseVideos } from './course-videos.js';
import { expireReferrals } from './referrals.js';
import { roomReminders } from './study-rooms.js';
import { deleteAuthUser } from './supabase.js';

/**
 * Permanently removes accounts whose 14-day deletion grace period has passed: the app profile
 * and all its data, then the Supabase sign-in record.
 */
export async function purgeDeletedAccounts(now = new Date()) {
  const due = await prisma.user.findMany({ where: { deleteAt: { lte: now } }, select: { id: true } });
  for (const { id } of due) {
    await prisma.user.delete({ where: { id } });
    if (!(await deleteAuthUser(id))) console.warn(`Account ${id} deleted, but its Supabase sign-in remains: set SUPABASE_SECRET_KEY to remove it.`);
  }
  if (due.length) console.log(`Deleted ${due.length} account(s) after their grace period`);
  return due.length;
}

/** Removes sessions that were revoked over a week ago. */
export async function cleanUp(now = new Date()) {
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  await prisma.session.deleteMany({ where: { revokedAt: { lt: weekAgo } } });
}

/** In-process scheduler. Fine for one server; move to a queue (BullMQ on Redis) when scaling out. */
export function startJobs() {
  const run = () =>
    Promise.all([purgeDeletedAccounts(), cleanUp(), refreshCourseVideos(), expireReferrals(), billingUpkeep(), gamesUpkeep()]).catch((e) =>
      console.error('Scheduled job failed', e),
    );
  run();
  // Study room reminders need minute accuracy.
  setInterval(() => void roomReminders().catch((e) => console.error('Room reminders failed', e)), 60_000);
  return setInterval(run, 60 * 60_000);
}
