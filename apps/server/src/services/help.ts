import { randomInt } from 'node:crypto';

import { config } from '../config.js';
import { prisma } from '../db.js';
import { Prisma, type HelpMessage, type HelpTicket, type User } from '../generated/prisma/client.js';
import { sendEmail } from './mailer.js';
import { notify } from './notifications.js';

export type TicketKind = 'support' | 'bug' | 'feedback' | 'report' | 'copyright' | 'appeal';

/**
 * The automatic first reply to each kind of request. Learners see the app's translation
 * (help:ticket.acks.<kind>); this English text is for staff and the data export.
 */
export const ACK: Record<TicketKind, string> = {
  support: 'Thanks for getting in touch. A member of the Knowzone team will reply here, usually within 1 working day.',
  bug: 'Thanks for the report. Our engineers review every bug. We’ll update this ticket if we need more details or once it’s fixed.',
  feedback: 'Thank you! Every suggestion is read by the product team. We don’t reply to each one, but it shapes what we build.',
  report: 'Thanks for helping keep Knowzone safe. A moderator reviews reports within 24 hours. The person you reported isn’t told who reported them.',
  copyright: 'We’ve received your notice and will review it within 3 working days.',
  appeal: 'We’ve received your appeal. A different moderator from the one who made the decision will review it within 3 working days.',
};

/** Requests a learner can open in an hour; reports and appeals count too. Stops floods, not real use. */
export const TICKETS_PER_HOUR = 10;

const shortId = (prefix: string) => `${prefix}-${randomInt(100000, 1000000)}`;

type TicketWithMessages = HelpTicket & { messages: HelpMessage[] };

export function toPublicTicket(t: TicketWithMessages) {
  return {
    id: t.id,
    kind: t.kind,
    ...(t.topic && { topic: t.topic }),
    subject: t.subject,
    status: t.status,
    createdAt: t.createdAt.getTime(),
    updatedAt: t.updatedAt.getTime(),
    meta: t.meta as Record<string, string>,
    messages: t.messages.map((m) => ({
      id: m.id,
      at: m.createdAt.getTime(),
      from: m.from,
      text: m.text,
      ...(m.template && { template: m.template }),
    })),
  };
}

export const withMessages = { messages: { orderBy: { createdAt: 'asc' } } } as const;

/**
 * Opens a request with the learner's message and the automatic reply, and tells the support inbox
 * (SUPPORT_EMAIL) about anything a person needs to act on. Feedback is filed as resolved.
 */
export async function openTicket(
  user: Pick<User, 'id' | 'email' | 'name'>,
  t: { kind: TicketKind; topic?: string; subject: string; message: string; meta?: Record<string, string> },
  db: Prisma.TransactionClient = prisma,
) {
  const now = Date.now();
  for (let attempt = 0; ; attempt++) {
    try {
      const ticket = await db.helpTicket.create({
        data: {
          id: shortId('KZ'),
          userId: user.id,
          kind: t.kind,
          topic: t.topic ?? null,
          subject: t.subject,
          status: t.kind === 'feedback' ? 'resolved' : 'open',
          meta: t.meta ?? {},
          messages: {
            create: [
              { from: 'me', text: t.message, createdAt: new Date(now) },
              { from: 'support', text: ACK[t.kind], template: 'ack', createdAt: new Date(now + 1) },
            ],
          },
        },
        include: withMessages,
      });
      if (t.kind !== 'feedback') void alertTeam(ticket, user);
      return ticket;
    } catch (e) {
      // Six random digits: on the rare clash, draw again.
      if (attempt < 5 && e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') continue;
      throw e;
    }
  }
}

/** Emails the support inbox about a new request. Never fails the learner's request. */
async function alertTeam(ticket: TicketWithMessages, user: Pick<User, 'id' | 'email' | 'name'>) {
  if (!config.SUPPORT_EMAIL) return;
  const meta = Object.entries(ticket.meta as Record<string, string>)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  await sendEmail({
    to: config.SUPPORT_EMAIL,
    subject: `[${ticket.kind}] ${ticket.id}: ${ticket.subject}`,
    text: `From ${user.name} <${user.email}> (user ${user.id})\n\n${ticket.messages[0]?.text ?? ''}${meta ? `\n\n${meta}` : ''}\n\nReply with: npm run support -- reply ${ticket.id} "…"`,
  }).catch((e) => console.error('Support alert failed:', e));
}

export async function ticketsThisHour(userId: string) {
  return prisma.helpTicket.count({ where: { userId, createdAt: { gt: new Date(Date.now() - 60 * 60_000) } } });
}

/** A staff reply: the learner gets it in the thread and a notification. */
export async function staffReply(ticketId: string, text: string, opts: { staff: string; resolve?: boolean }) {
  const ticket = await prisma.helpTicket.update({
    where: { id: ticketId },
    data: {
      status: opts.resolve ? 'resolved' : 'waiting',
      messages: { create: { from: 'support', text, staff: opts.staff } },
    },
    include: withMessages,
  });
  await notify(ticket.userId, { type: 'system', template: 'ticketReply', params: { id: ticket.id }, href: `/help/ticket/${ticket.id}` });
  return ticket;
}

export const newCopyrightReference = () => shortId('CR');

// ─── Account restrictions (232) ───────────────────────────────────────────────

export type Restriction = {
  kind: 'restricted' | 'suspended';
  reason: string;
  at: number;
  until?: number;
  limits?: string[];
  appeal?: { ticketId: string; at: number; status: 'pending' | 'rejected' };
};

export const restrictionOf = (u: Pick<User, 'restriction'>) => (u.restriction as Restriction | null) ?? null;

/**
 * Paths a suspended account can still use: its status, appeal, help, settings, devices, data download,
 * account deletion and sign-out.
 */
export function allowedWhileSuspended(path: string) {
  return (
    path === '/me' ||
    path.startsWith('/me/help/') ||
    path.startsWith('/auth/') ||
    ['/me/logout', '/me/appeal', '/me/export', '/me/export/email', '/me/settings', '/me/sessions', '/me/sessions/revoke', '/me/delete'].includes(path)
  );
}
