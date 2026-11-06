import { Router, type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';

import { config } from '../config.js';
import { prisma } from '../db.js';
import { AppError, forbidden, notFound } from '../lib/errors.js';
import { appSettings, saveAppSettings, supportInbox } from '../services/app-settings.js';
import { listStaff, ownerEmails, recordAction } from '../services/staff.js';

/**
 * The staff dashboard's Settings, for superadmins: the team, what can be changed without a deploy, which
 * services are set up, and the record of what staff did. Mounted inside the admin router, behind its check.
 */
export const adminSettingsRouter = Router();

function onlySuperadmins(_req: Request, res: Response, next: NextFunction) {
  if (res.locals.staffRole !== 'superadmin') throw forbidden('Only a superadmin can do this');
  next();
}

adminSettingsRouter.use('/admin/settings', onlySuperadmins);

/* ---------- The team ---------- */

adminSettingsRouter.get('/admin/settings/team', async (_req, res) => {
  res.json({ items: await listStaff() });
});

const Member = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  role: z.enum(['admin', 'superadmin']),
});

/** Adds someone, or changes their role. They sign in with the Knowzone account for that email. */
adminSettingsRouter.post('/admin/settings/team', async (req, res) => {
  const { email, role } = Member.parse(req.body);
  if (ownerEmails().includes(email)) throw new AppError(400, 'This person’s access is set on the server', 'invalid');
  if (email === req.user!.email.toLowerCase()) throw new AppError(400, 'You can’t change your own role', 'invalid');
  await prisma.staffMember.upsert({
    where: { email },
    create: { email, role, addedBy: req.user!.email },
    update: { role },
  });
  await recordAction(req.user!.email, `made ${role}`, email);
  res.json({ ok: true });
});

adminSettingsRouter.delete('/admin/settings/team/:email', async (req, res) => {
  const email = String(req.params.email).toLowerCase();
  if (ownerEmails().includes(email)) throw new AppError(400, 'This person’s access is set on the server', 'invalid');
  if (email === req.user!.email.toLowerCase()) throw new AppError(400, 'You can’t remove yourself', 'invalid');
  const { count } = await prisma.staffMember.deleteMany({ where: { email } });
  if (!count) throw notFound('That person isn’t on the team');
  await recordAction(req.user!.email, 'removed from the team', email);
  res.json({ ok: true });
});

/* ---------- Settings ---------- */

/** Whether each service is set up. Only yes or no: the values themselves never leave the server. */
const services = () => [
  { name: 'AI (OpenAI)', ready: !!config.OPENAI_API_KEY },
  { name: 'YouTube video checks', ready: !!config.YOUTUBE_API_KEY },
  { name: 'Payments (Flutterwave)', ready: !!config.FLW_SECRET_KEY && !!config.FLW_SECRET_HASH },
  { name: 'Email', ready: !!config.RESEND_API_KEY || (!!config.SMTP_USER && !!config.SMTP_PASS) },
  { name: 'Deleting sign-ins with accounts', ready: !!config.SUPABASE_SECRET_KEY },
];

const settingsNow = () => ({
  ...appSettings(),
  supportInbox: supportInbox(),
  appUrl: config.APP_URL,
  services: services(),
});

adminSettingsRouter.get('/admin/settings', (_req, res) => {
  res.json(settingsNow());
});

const Changes = z
  .object({
    aiEnabled: z.boolean(),
    supportEmail: z.union([z.literal(''), z.string().trim().toLowerCase().email().max(200)]),
  })
  .partial();

adminSettingsRouter.put('/admin/settings', async (req, res) => {
  const { aiEnabled, supportEmail } = Changes.parse(req.body);
  await saveAppSettings(
    {
      ...(aiEnabled !== undefined && { aiEnabled }),
      // Empty goes back to the address set on the server.
      ...(supportEmail !== undefined && { supportEmail: supportEmail || null }),
    },
    req.user!.email,
  );
  if (aiEnabled !== undefined)
    await recordAction(req.user!.email, aiEnabled ? 'turned on' : 'turned off', 'AI features');
  if (supportEmail !== undefined)
    await recordAction(req.user!.email, 'changed the support inbox to', supportEmail || 'the server’s');
  res.json(settingsNow());
});

/* ---------- What staff did ---------- */

const PAGE = 50;
const Paging = z.object({ page: z.coerce.number().int().min(1).max(10_000).default(1) });

adminSettingsRouter.get('/admin/settings/activity', async (req, res) => {
  const { page } = Paging.parse(req.query);
  const [items, total] = await Promise.all([
    prisma.adminAction.findMany({ orderBy: { createdAt: 'desc' }, skip: (page - 1) * PAGE, take: PAGE }),
    prisma.adminAction.count(),
  ]);
  res.json({ items, total, pageSize: PAGE });
});
