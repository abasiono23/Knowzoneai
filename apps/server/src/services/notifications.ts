import { prisma } from '../db.js';
import { Prisma } from '../generated/prisma/client.js';

export type NotificationType = 'streak' | 'reminder' | 'achievement' | 'class' | 'content' | 'referral' | 'system';

/**
 * Template names the app knows how to show (home:notifications.templates.*). The text isn't stored:
 * the app renders template + params in the reader's language, so switching language updates the inbox.
 */
export type Template =
  | 'welcome'
  | 'referralJoined'
  | 'referralConfirmed'
  | 'newLesson'
  | 'renewalReminder'
  | 'subscriptionExpired'
  | 'ticketReply'
  | 'friendRequest'
  | 'friendAccepted';

export async function notify(
  userId: string,
  n: { type: NotificationType; template: Template; params?: Record<string, string | number>; href?: string },
  db: Prisma.TransactionClient = prisma,
) {
  return db.notification.create({
    data: { userId, type: n.type, template: n.template, params: n.params ?? {}, href: n.href ?? null },
  });
}

/** The shape the app receives. */
export function toPublicNotification(n: {
  id: string;
  type: string;
  template: string;
  params: Prisma.JsonValue;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: n.id,
    type: n.type,
    template: n.template,
    params: (n.params ?? {}) as Record<string, string | number>,
    href: n.href,
    read: !!n.readAt,
    createdAt: n.createdAt.getTime(),
  };
}
