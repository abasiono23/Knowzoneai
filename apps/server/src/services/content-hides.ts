import { prisma } from '../db.js';

/**
 * Videos, books and summaries staff have taken out of the app for everyone. The content itself lives in
 * files and course lessons, which stay as they are, so a hide lasts through the monthly YouTube recheck and
 * new builds, and can be undone. Kept in memory because the lists that read it are synchronous, and refreshed
 * every minute. If the table can't be read, the last known list stays and the app keeps running.
 */
export type HiddenKind = 'video' | 'book' | 'summary';

let hidden = new Set<string>();
const key = (kind: HiddenKind, id: string) => `${kind}:${id}`;

export const isHiddenContent = (kind: HiddenKind, id: string) => hidden.has(key(kind, id));

/** A summary's id: its library and topic. */
export const summaryKey = (library: string, topic: string) => `${library}/${topic}`;

export async function refreshHiddenContent() {
  const rows = await prisma.hiddenContent.findMany({ select: { kind: true, itemId: true } });
  hidden = new Set(rows.map((r) => key(r.kind as HiddenKind, r.itemId)));
}

export async function hideContent(input: { kind: HiddenKind; id: string; title: string; reason: string; by: string }) {
  const data = { title: input.title, reason: input.reason, hiddenBy: input.by };
  await prisma.hiddenContent.upsert({
    where: { kind_itemId: { kind: input.kind, itemId: input.id } },
    create: { kind: input.kind, itemId: input.id, ...data },
    update: data,
  });
  hidden.add(key(input.kind, input.id));
}

export async function showContent(kind: HiddenKind, id: string) {
  await prisma.hiddenContent.deleteMany({ where: { kind, itemId: id } });
  hidden.delete(key(kind, id));
}

export const listHiddenContent = () => prisma.hiddenContent.findMany({ orderBy: { createdAt: 'desc' } });
