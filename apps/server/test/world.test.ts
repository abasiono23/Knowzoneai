import { describe, expect, it, vi } from 'vitest';

import { TEMPLATES, type QuestEvent } from '../src/data/quests.js';
import { prisma } from '../src/db.js';
import { leagueWeek } from '../src/lib/time.js';
import { GROUP_SIZE, joinLeague } from '../src/services/leagues.js';
import { recordActivity } from '../src/services/progress.js';
import { recordQuestEvent } from '../src/services/quests.js';
import { http, signIn } from './helpers.js';

vi.mock('../src/services/games/help-ai.js', () => ({ ASK_COST: 10, askKora: vi.fn(async () => 'hint') }));

const AVATAR = { skin: '#A0612F', hair: 'afro', hairColor: '#1B1B1B', eyes: 'round', mouth: 'smile', outfit: '#7C5CFF', background: 'violet', name: '' };
type Row = { id: string; me: boolean; name: string | null; xp: number; rank: number };

/** A learner with XP earned this week (and optionally a school / privacy setting). */
async function learner(name: string, xp: number, extra: { school?: string; privacy?: 'everyone' | 'school' | 'private' } = {}) {
  const s = await signIn({
    metadata: { name, consent: { terms: true, privacy: true, age: true, marketing: false } },
    email: `${name.split(' ')[0]!.toLowerCase()}${Math.random()}@example.com`,
  });
  if (extra.school) await prisma.user.update({ where: { id: s.sub }, data: { school: extra.school } });
  if (extra.privacy) await s.as.post('/me/settings', { privacy: { profileVisibility: extra.privacy } }).expect(200);
  if (xp) await recordActivity(s.sub, { xp, coins: 0, minutes: 1 });
  return s;
}

describe('avatar and items on the server', () => {
  it('saves an avatar made of free parts, refuses items you don’t own, and accepts bought ones', async () => {
    const { as, sub } = await signIn();
    expect((await as.get('/me/world').expect(200)).body).toMatchObject({ avatar: null, owned: [], onLeaderboards: true });
    await as.put('/me/world/avatar', { avatar: AVATAR }).expect(200);
    expect((await as.put('/me/world/avatar', { avatar: { ...AVATAR, hat: 'hat-cap' } }).expect(403)).body.reason).toBe('not-owned');
    await as.put('/me/world/avatar', { avatar: { ...AVATAR, background: 'gold' } }).expect(403);
    await prisma.redemption.create({ data: { userId: sub, rewardId: 'hat-cap', cost: 40, code: `T-${sub}` } });
    const saved = (await as.put('/me/world/avatar', { avatar: { ...AVATAR, hat: 'hat-cap' } }).expect(200)).body;
    expect(saved.avatar.hat).toBe('hat-cap');
    expect(saved.owned).toContain('hat-cap');
  });

  it('accepts achievement items from the app, but quest items only come from chests', async () => {
    const { as } = await signIn();
    expect((await as.post('/me/world/earned', { items: ['hat-crown'] }).expect(200)).body.owned).toContain('hat-crown');
    await as.post('/me/world/earned', { items: ['hat-explorer'] }).expect(400);
  });

  it('the weekly journey chest gives an explorer hat', async () => {
    const { as, sub } = await signIn();
    const board = (await as.get('/me/quests').expect(200)).body;
    for (const step of board.journey.steps as { id: string }[]) {
      const t = TEMPLATES.find((x) => x.id === step.id)!;
      const ev: QuestEvent = {
        subject: t.place === 'any' ? 'english' : t.place,
        game: t.game ?? 'hidden-letters',
        level: 1,
        stars: 3,
        results: Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i, { correct: true }])),
      };
      // Some steps need two games ("play 2 word games").
      await recordQuestEvent(sub, ev);
      await recordQuestEvent(sub, ev);
    }
    const opened = (await as.post('/me/quests/chest', { chest: 'journey' }).expect(200)).body;
    expect(opened.reward.item).toBe('hat-explorer');
    expect((await as.get('/me/world').expect(200)).body.owned).toContain('hat-explorer');
    await as.put('/me/world/avatar', { avatar: { ...AVATAR, hat: 'hat-explorer' } }).expect(200);
  });
});

describe('weekly leagues', () => {
  it('you join when you earn XP; until then you are not in a league', async () => {
    const quiet = await learner('Quiet Q', 0);
    expect((await quiet.as.get('/me/leagues').expect(200)).body).toMatchObject({ joined: false, tier: 'bronze', rows: [] });
    const a = await learner('Ada Obi', 120, { privacy: 'everyone' });
    const b = await learner('Bola Ade', 80, { privacy: 'everyone' });
    const view = (await a.as.get('/me/leagues').expect(200)).body;
    expect(view).toMatchObject({ joined: true, tier: 'bronze', promote: 5, demote: 0 });
    expect(view.rows.map((r: Row) => [r.name, r.xp, r.rank])).toEqual([
      ['Ada O.', 120, 1],
      ['Bola A.', 80, 2],
    ]);
    expect(view.rows[0].me).toBe(true);
    expect((await b.as.get('/me/leagues').expect(200)).body.rows[0].name).toBe('Ada O.');
  });

  it('groups hold 30; the next learner starts a new group', async () => {
    const week = leagueWeek();
    const filler = await Promise.all(Array.from({ length: GROUP_SIZE }, (_, i) => learner(`Filler ${i}`, 0)));
    await prisma.leagueMember.createMany({ data: filler.map((f) => ({ userId: f.sub, week: week.key, tier: 0, group: `${week.key}:0:1` })) });
    const late = await learner('Late Comer', 50);
    const m = await prisma.leagueMember.findUniqueOrThrow({ where: { userId_week: { userId: late.sub, week: week.key } } });
    expect(m.group).toBe(`${week.key}:0:2`);
  });

  it('the top 5 last week move up a tier; those who earned nothing move down', async () => {
    const now = new Date();
    const last = leagueWeek(new Date(leagueWeek(now).start.getTime() - 1));
    const top = await learner('Top Tunde', 0);
    const idle = await learner('Idle Ife', 0);
    await prisma.leagueMember.createMany({
      data: [
        { userId: top.sub, week: last.key, tier: 1, group: `${last.key}:1:1` },
        { userId: idle.sub, week: last.key, tier: 1, group: `${last.key}:1:1` },
      ],
    });
    await prisma.coinTransaction.create({
      data: { userId: top.sub, xp: 300, coins: 0, reason: 'test', createdAt: new Date(last.start.getTime() + 3_600_000) },
    });
    await recordActivity(top.sub, { xp: 10, coins: 0, minutes: 1 });
    await recordActivity(idle.sub, { xp: 10, coins: 0, minutes: 1 });
    expect((await top.as.get('/me/leagues').expect(200)).body.tier).toBe('gold');
    expect((await idle.as.get('/me/leagues').expect(200)).body.tier).toBe('bronze');
    expect(await joinLeague(top.sub)).toMatchObject({ tier: 2 });
  });

  it('respects privacy, blocking and “hide me from leaderboards”', async () => {
    const viewer = await learner('Vic View', 50, { school: 'Kings College' });
    const priv = await learner('Pri Vate', 40, { privacy: 'private' });
    const mate = await learner('Sam Mate', 30, { privacy: 'school', school: 'kings college' });
    const hidden = await learner('Hid Den', 20, { privacy: 'everyone' });
    const blocker = await learner('Blo Cker', 10, { privacy: 'everyone' });
    await hidden.as.patch('/me/world/settings', { onLeaderboards: false }).expect(200);
    const anon = await learner('Ano Nymous', 15, { privacy: 'everyone' });
    await anon.as.patch('/me/world/settings', { anonymous: true }).expect(200);
    await blocker.as.post('/me/safety/block', { id: viewer.sub, name: 'Vic' }).expect(200);
    const rows: Row[] = (await viewer.as.get('/me/leagues').expect(200)).body.rows;
    const byId = (id: string) => rows.find((r) => r.id === id);
    expect(byId(priv.sub)).toMatchObject({ name: null, xp: 40 });
    expect(byId(mate.sub)?.name).toBe('Sam M.');
    expect(byId(hidden.sub)).toBeUndefined();
    expect(byId(blocker.sub)).toBeUndefined();
    expect(byId(anon.sub)).toMatchObject({ name: null, avatar: null, xp: 15 });
    // The school board: classmates only.
    const school = (await viewer.as.get('/me/leagues/school').expect(200)).body;
    expect(school.rows.map((r: Row) => r.id).sort()).toEqual([viewer.sub, mate.sub].sort());
    // Hidden learners still see themselves.
    expect((await hidden.as.get('/me/leagues').expect(200)).body.rows.some((r: Row) => r.me)).toBe(true);
  });
});

describe('friends', () => {
  it('adds a friend by code; they accept; a private friend’s name shows to friends', async () => {
    const a = await learner('Amaka Eze', 0);
    const b = await learner('Bayo Lawal', 0, { privacy: 'private' });
    const code = (await b.as.get('/me/friends').expect(200)).body.code;
    expect((await a.as.post('/me/friends', { code }).expect(201)).body.outgoing).toHaveLength(1);
    await a.as.post('/me/friends', { code }).expect(409);
    const note = await prisma.notification.findFirst({ where: { userId: b.sub, template: 'friendRequest' } });
    expect(note?.params).toMatchObject({ name: 'Amaka' });
    const incoming = (await b.as.get('/me/friends').expect(200)).body.incoming;
    expect(incoming[0]).toMatchObject({ id: a.sub, name: 'Amaka E.' });
    const after = (await b.as.post(`/me/friends/${incoming[0].requestId}/accept`).expect(200)).body;
    expect(after.friends.map((f: Row) => f.id)).toEqual([a.sub]);
    expect((await a.as.get('/me/friends').expect(200)).body.friends[0]).toMatchObject({ id: b.sub, name: 'Bayo L.' });
    // Removing works from either side.
    expect((await a.as.delete(`/me/friends/${b.sub}`).expect(200)).body.friends).toEqual([]);
    expect((await b.as.get('/me/friends').expect(200)).body.friends).toEqual([]);
  });

  it('a request back accepts; you can’t add yourself or unknown codes; blocking ends a friendship', async () => {
    const a = await learner('Chidi Okafor', 0);
    const b = await learner('Dupe Ajayi', 0);
    const codeA = (await a.as.get('/me/friends').expect(200)).body.code;
    const codeB = (await b.as.get('/me/friends').expect(200)).body.code;
    await a.as.post('/me/friends', { code: codeA }).expect(400);
    await a.as.post('/me/friends', { code: 'NOPE-NOPE' }).expect(404);
    await a.as.post('/me/friends', { code: codeB }).expect(201);
    expect((await b.as.post('/me/friends', { code: codeA }).expect(200)).body.friends).toHaveLength(1);
    await a.as.post('/me/safety/block', { id: b.sub, name: 'Dupe' }).expect(200);
    expect((await b.as.get('/me/friends').expect(200)).body.friends).toEqual([]);
    await b.as.post('/me/friends', { code: codeA }).expect(404);
    await http().get('/me/friends').expect(401);
  });
});
