import { config } from '../config.js';
import { prisma } from '../db.js';

/**
 * Settings superadmins can change without a new deploy. Kept in memory because they're read in places that
 * can't wait for the database, and refreshed every minute. If the table can't be read, the last known values
 * stay, and before the first read everything works as it does without settings.
 */
const Defaults = { aiEnabled: true, supportEmail: null as string | null };
export type AppSettings = typeof Defaults;

let current: AppSettings = { ...Defaults };

export const appSettings = () => current;

/** Where new help requests are emailed: the one set in the dashboard, or the server's. */
export const supportInbox = () => current.supportEmail ?? config.SUPPORT_EMAIL ?? '';

export async function refreshAppSettings() {
  const rows = await prisma.appSetting.findMany();
  const saved = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  current = { ...Defaults, ...(saved as Partial<AppSettings>) };
}

export async function saveAppSettings(changes: Partial<AppSettings>, by: string) {
  await prisma.$transaction(
    Object.entries(changes).map(([key, value]) =>
      prisma.appSetting.upsert({
        where: { key },
        create: { key, value: value as never, updatedBy: by },
        update: { value: value as never, updatedBy: by },
      }),
    ),
  );
  current = { ...current, ...changes };
}
