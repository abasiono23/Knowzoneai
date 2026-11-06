import { config } from '../config.js';
import { prisma } from '../db.js';

/**
 * Who runs the staff dashboard. Emails in ADMIN_EMAILS are superadmins and can only be changed on the server,
 * so nobody can be locked out from inside the dashboard. Superadmins add everyone else, as admins or
 * superadmins. Admins use the dashboard; only superadmins open Settings. The list is read on every request,
 * so removing someone takes effect at once.
 */
export type StaffRole = 'admin' | 'superadmin';

export const ownerEmails = () =>
  config.ADMIN_EMAILS.split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export async function staffRole(email: string): Promise<StaffRole | null> {
  const address = email.toLowerCase();
  if (ownerEmails().includes(address)) return 'superadmin';
  const member = await prisma.staffMember.findUnique({ where: { email: address } });
  return member ? (member.role as StaffRole) : null;
}

export async function listStaff() {
  const owners = ownerEmails();
  const members = await prisma.staffMember.findMany({ orderBy: { createdAt: 'asc' } });
  return [
    ...owners.map((email) => ({ email, role: 'superadmin' as StaffRole, owner: true, addedBy: null, createdAt: null })),
    ...members
      .filter((m) => !owners.includes(m.email))
      .map((m) => ({
        email: m.email,
        role: m.role as StaffRole,
        owner: false,
        addedBy: m.addedBy,
        createdAt: m.createdAt,
      })),
  ];
}

/** A lasting record of every change made in the dashboard, also in the server log. */
export async function recordAction(actor: string, action: string, target: string) {
  console.info(`[admin] ${actor} ${action} ${target}`);
  await prisma.adminAction
    .create({ data: { actor, action, target: target.slice(0, 300) } })
    .catch((e) => console.error('Couldn’t record a staff action', e));
}
