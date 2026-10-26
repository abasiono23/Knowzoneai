/**
 * Staff tool for help requests and moderation (219–232). Run from apps/server:
 *
 *   npm run support -- list [open|waiting|resolved|all] [kind]   Requests, newest first (default: open)
 *   npm run support -- show KZ-123456                            The thread, details and who sent it
 *   npm run support -- reply KZ-123456 "Text" [--resolve]        Answer; the learner is notified in the app
 *   npm run support -- resolve KZ-123456                         Mark as solved
 *   npm run support -- restrict <email> "Reason" [--days 7] [--limits leaderboards,battles,invites,sharing]
 *   npm run support -- suspend <email> "Reason" [--days 7]       Without --days: until reviewed
 *   npm run support -- lift <email>                              Remove a restriction or suspension
 *   npm run support -- appeal KZ-123456 accept|reject "Text"     Decide an appeal (lifts the restriction if accepted)
 *   npm run support -- copyright [open|actioned|rejected]        Copyright notices
 *   npm run support -- copyright CR-123456 actioned|rejected     Record what was done
 *
 * Replies are signed with STAFF_NAME (or your computer's user name) in the team's records; learners
 * just see "Knowzone support".
 */
import { userInfo } from 'node:os';

import { prisma } from '../src/db.js';
import { Prisma } from '../src/generated/prisma/client.js';
import { restrictionOf, staffReply, type Restriction } from '../src/services/help.js';

const DAY = 86_400_000;
const staff = process.env.STAFF_NAME || userInfo().username;
const [command, ...rest] = process.argv.slice(2);
const flags = new Map<string, string>();
const args: string[] = [];
for (let i = 0; i < rest.length; i++) {
  const a = rest[i]!;
  if (a.startsWith('--')) flags.set(a.slice(2), rest[i + 1] && !rest[i + 1]!.startsWith('--') ? rest[++i]! : 'true');
  else args.push(a);
}
const fail = (msg: string): never => {
  console.error(msg);
  process.exit(1);
};
const when = (d: Date) => d.toISOString().slice(0, 16).replace('T', ' ');

async function userBy(who: string | undefined) {
  if (!who) fail('Give the learner’s email or user id');
  const user = await prisma.user.findFirst({ where: { OR: [{ email: who!.toLowerCase() }, { id: who! }] } });
  return user ?? fail(`No account for ${who}`);
}

async function main() {
  switch (command) {
    case 'list': {
      const status = args[0] ?? 'open';
      const tickets = await prisma.helpTicket.findMany({
        where: { ...(status !== 'all' && { status }), ...(args[1] && { kind: args[1] }) },
        orderBy: { updatedAt: 'desc' },
        take: 50,
        include: { user: { select: { email: true } } },
      });
      if (!tickets.length) console.log('Nothing here.');
      for (const t of tickets) console.log(`${t.id}  ${t.kind.padEnd(9)} ${t.status.padEnd(8)} ${when(t.updatedAt)}  ${t.user.email}  ${t.subject}`);
      break;
    }
    case 'show': {
      const t = await prisma.helpTicket.findUnique({
        where: { id: args[0] ?? '' },
        include: { messages: { orderBy: { createdAt: 'asc' } }, user: { select: { id: true, email: true, name: true, plan: true, restriction: true } } },
      });
      if (!t) fail('No such request');
      console.log(`${t!.id} · ${t!.kind}${t!.topic ? ` · ${t!.topic}` : ''} · ${t!.status}\n${t!.subject}`);
      console.log(`From ${t!.user.name} <${t!.user.email}> · ${t!.user.plan} · user ${t!.user.id}`);
      if (t!.user.restriction) console.log(`Restriction: ${JSON.stringify(t!.user.restriction)}`);
      const meta = Object.entries(t!.meta as Record<string, string>);
      if (meta.length) console.log(`\n${meta.map(([k, v]) => `  ${k}: ${v}`).join('\n')}`);
      for (const m of t!.messages)
        console.log(
          `\n[${when(m.createdAt)}] ${m.from === 'me' ? 'Learner' : `Support${m.staff ? ` (${m.staff})` : m.template ? ' (automatic)' : ''}`}\n${m.text}`,
        );
      break;
    }
    case 'reply': {
      const [id, text] = args;
      if (!id || !text) fail('Usage: reply KZ-123456 "Text" [--resolve]');
      await staffReply(id!, text!, { staff, resolve: flags.has('resolve') });
      console.log(`Replied to ${id}${flags.has('resolve') ? ' and marked it solved' : ''}. The learner has been notified.`);
      break;
    }
    case 'resolve': {
      await prisma.helpTicket.update({ where: { id: args[0] ?? '' }, data: { status: 'resolved' } });
      console.log(`${args[0]} marked solved.`);
      break;
    }
    case 'restrict':
    case 'suspend': {
      const user = await userBy(args[0]);
      const reason = args[1] ?? fail('Give a reason the learner will see');
      const days = flags.has('days') ? Number(flags.get('days')) : undefined;
      if (days !== undefined && !(days > 0)) fail('--days must be a positive number');
      const restriction: Restriction = {
        kind: command === 'suspend' ? 'suspended' : 'restricted',
        reason: reason!,
        at: Date.now(),
        ...(days && { until: Date.now() + days * DAY }),
        ...(command === 'restrict' && { limits: (flags.get('limits') ?? 'leaderboards,battles,invites,sharing').split(',').map((s) => s.trim()) }),
      };
      await prisma.user.update({ where: { id: user.id }, data: { restriction } });
      console.log(`${user.email} is now ${restriction.kind}${days ? ` for ${days} days` : ' until reviewed'}.`);
      break;
    }
    case 'lift': {
      const user = await userBy(args[0]);
      await prisma.user.update({ where: { id: user.id }, data: { restriction: Prisma.DbNull } });
      console.log(`${user.email} is back in good standing.`);
      break;
    }
    case 'appeal': {
      const [id, decision, text] = args;
      if (!id || !['accept', 'reject'].includes(decision ?? '') || !text) fail('Usage: appeal KZ-123456 accept|reject "Text"');
      const t = await prisma.helpTicket.findUnique({ where: { id: id! }, include: { user: true } });
      if (!t || t.kind !== 'appeal') fail('That isn’t an appeal');
      const r = restrictionOf(t!.user);
      if (decision === 'accept' || !r) await prisma.user.update({ where: { id: t!.userId }, data: { restriction: Prisma.DbNull } });
      else
        await prisma.user.update({
          where: { id: t!.userId },
          data: { restriction: { ...r, appeal: { ...(r.appeal ?? { ticketId: id!, at: Date.now() }), status: 'rejected' } } },
        });
      await staffReply(id!, text!, { staff, resolve: true });
      console.log(`Appeal ${decision === 'accept' ? 'accepted: restriction lifted' : 'rejected'}. The learner has been notified.`);
      break;
    }
    case 'copyright': {
      if (args[0]?.startsWith('CR-')) {
        if (!['actioned', 'rejected'].includes(args[1] ?? '')) fail('Usage: copyright CR-123456 actioned|rejected');
        await prisma.copyrightNotice.update({ where: { reference: args[0] }, data: { status: args[1] } });
        console.log(`${args[0]} marked ${args[1]}.`);
        break;
      }
      const notices = await prisma.copyrightNotice.findMany({ where: { status: args[0] ?? 'open' }, orderBy: { createdAt: 'desc' }, take: 50 });
      if (!notices.length) console.log('Nothing here.');
      for (const n of notices)
        console.log(
          `${n.reference}  ${when(n.createdAt)}  ${n.name} <${n.email}>${n.organisation ? ` (${n.organisation})` : ''}\n  Work: ${n.work}\n  Where: ${n.location}\n`,
        );
      break;
    }
    default:
      console.log('Commands: list, show, reply, resolve, restrict, suspend, lift, appeal, copyright. See scripts/support.ts.');
  }
}

await main();
await prisma.$disconnect();
