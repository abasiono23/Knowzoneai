import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import type { Reel } from '../src/data/facts.js';
import { prisma } from '../src/db.js';
import { useReels } from '../src/services/reels.js';
import { http, signIn } from './helpers.js';

// Moderation: anything containing "nasty" is flagged.
vi.mock('../src/services/ai.js', async (original) => ({
  ...(await original<typeof import('../src/services/ai.js')>()),
  openaiClient: () => ({
    moderations: { create: async ({ input }: { input: string }) => ({ results: [{ flagged: /nasty/i.test(input) }] }) },
  }),
}));

const card = (en: string, fr?: string) => ({ text: { en, ...(fr && { fr }) }, picture: 'p', seconds: 4.2 });
const REELS: Reel[] = [
  { id: 'space-01', subject: 'space', fact: 'space-01', cards: [card('Did you know…?', 'Le savais-tu…?'), card('b'), card('c'), card('d'), card('e')] },
  { id: 'biology-01', subject: 'biology', fact: 'biology-01', cards: [card('a'), card('b'), card('c'), card('d'), card('e')] },
];

beforeAll(() => useReels(REELS));
afterAll(() => useReels(null));

describe('Did you know? reels', () => {
  it('serves the feed in the learner’s language, with media links and counts', async () => {
    const res = await http().get('/reels').set('X-Language', 'fr').expect(200);
    expect(res.body.reels).toHaveLength(2);
    const space = res.body.reels.find((r: { id: string }) => r.id === 'space-01');
    expect(space.cards[0]).toMatchObject({ text: 'Le savais-tu…?', image: '/reels/media/space-01-1.webp', audio: '/reels/media/space-01-1.mp3', seconds: 4.2 });
    expect(space.cards[1].text).toBe('b');
    expect(space).toMatchObject({ likes: 0, comments: 0, liked: false });
    expect((await http().get('/reels?subject=biology').expect(200)).body.reels.map((r: { id: string }) => r.id)).toEqual(['biology-01']);
    await http().get('/reels/media/..%2F..%2Fpackage.json').expect(404);
  });

  it('likes, comments (moderated), reports and blocks', async () => {
    const a = await signIn({ email: 'a@example.com' });
    const b = await signIn({ email: 'b@example.com' });
    const first = await a.as.post('/me/reels/space-01/like', { liked: true });
    expect(first.status, JSON.stringify(first.body)).toBe(200);
    expect(first.body).toEqual({ liked: true, likes: 1 });
    await a.as.post('/me/reels/space-01/like', { liked: true }).expect(200);
    expect((await b.as.post('/me/reels/space-01/like', { liked: true }).expect(200)).body.likes).toBe(2);
    expect((await a.as.post('/me/reels/space-01/like', { liked: false }).expect(200)).body).toEqual({ liked: false, likes: 1 });
    await a.as.post('/me/reels/nope/like', { liked: true }).expect(404);

    expect((await a.as.post('/me/reels/space-01/comments', { text: 'That is nasty and rude' }).expect(422)).body.reason).toBe('blocked');
    const posted = (await a.as.post('/me/reels/space-01/comments', { text: 'Wow, I never knew!' }).expect(201)).body.comment;
    expect(posted).toMatchObject({ text: 'Wow, I never knew!', mine: true });
    const feed = (await b.as.get('/reels').expect(200)).body.reels.find((r: { id: string }) => r.id === 'space-01');
    expect(feed).toMatchObject({ likes: 1, comments: 1, liked: true });

    // Blocking hides the person's comments from you.
    await prisma.blockedUser.create({ data: { userId: b.user.id, blockedId: a.user.id, name: 'A' } });
    expect((await b.as.get('/reels/space-01/comments').expect(200)).body.comments).toEqual([]);
    expect((await http().get('/reels/space-01/comments').expect(200)).body.comments).toHaveLength(1);

    // Three reports hide a comment for everyone; you can't report your own.
    await a.as.post(`/me/reels/comments/${posted.id}/report`).expect(400);
    for (let i = 0; i < 3; i++) await (await signIn({ email: `r${i}@example.com` })).as.post(`/me/reels/comments/${posted.id}/report`).expect(200);
    expect((await http().get('/reels/space-01/comments').expect(200)).body.comments).toEqual([]);

    const mine = (await a.as.post('/me/reels/biology-01/comments', { text: 'Cool' }).expect(201)).body.comment;
    await b.as.delete(`/me/reels/comments/${mine.id}`).expect(404);
    await a.as.delete(`/me/reels/comments/${mine.id}`).expect(200);
    await http().post('/me/reels/space-01/like', { liked: true }).expect(401);
  });
});
