import { describe, expect, it } from 'vitest';

import { prisma } from '../src/db.js';
import { http, signIn } from './helpers.js';

describe('catalogue', () => {
  it('serves the catalogue in the requested language, falling back to English', async () => {
    const en = await http().get('/catalog').expect(200);
    expect(en.body).toMatchObject({ language: 'en' });
    expect(en.body.categories).toHaveLength(6);
    expect(en.body.subjects).toHaveLength(17);
    expect(en.body.lessons).toHaveLength(32);

    const fr = await http().get('/catalog').set('X-Language', 'fr').expect(200);
    expect(fr.body.subjects.find((s: { id: string }) => s.id === 'mathematics').name).toBe('Mathématiques');
    const ar = await http().get('/catalog?lang=ar').expect(200);
    expect(ar.body.lessons.find((l: { id: string }) => l.id === 'l1').title).toBe('كيف تنتج الخلايا الطاقة');
    // Ids, formats and numbers never change between languages.
    expect(ar.body.lessons.map((l: { id: string; format: string }) => l.id + l.format)).toEqual(
      en.body.lessons.map((l: { id: string; format: string }) => l.id + l.format),
    );
    // Unknown languages get English.
    expect((await http().get('/catalog?lang=xx').expect(200)).body.language).toBe('en');
  });

  it('skips the download when the app already has this version', async () => {
    const { body } = await http().get('/catalog').expect(200);
    expect((await http().get(`/catalog?since=${body.version}`).expect(200)).body).toEqual({ version: body.version, unchanged: true });
  });

  it('uses the signed-in learner’s app language when the app sends none', async () => {
    const { as } = await signIn();
    await as.post('/me/settings', { appLanguage: 'yo' }).expect(200);
    const { body } = await as.get('/catalog').expect(200);
    expect(body.language).toBe('yo');
  });

  it('serves subject and lesson pages', async () => {
    const { body } = await http().get('/subjects/chemistry?lang=fr').expect(200);
    expect(body.category.id).toBe(body.subject.category);
    expect(body.lessons.length).toBeGreaterThan(0);
    expect(body.lessons.every((l: { subjectId: string }) => l.subjectId === 'chemistry')).toBe(true);
    await http().get('/subjects/nope').expect(404);
    expect((await http().get('/lessons/l1').expect(200)).body.subject.id).toBeTruthy();
    await http().get('/lessons/nope').expect(404);
  });

  it('lists trending lessons, optionally for one subject', async () => {
    const { body } = await http().get('/trending?limit=5').expect(200);
    expect(body.lessons).toHaveLength(5);
    const trends = body.lessons.map((l: { trend: number }) => l.trend);
    expect(trends).toEqual([...trends].sort((a, b) => b - a));
    const chem = await http().get('/trending?subject=chemistry').expect(200);
    expect(chem.body.lessons.every((l: { subjectId: string }) => l.subjectId === 'chemistry')).toBe(true);
  });
});

describe('search', () => {
  it('finds subjects, topics and lessons; every word must match', async () => {
    const { body } = await http().get('/search?q=mole').expect(200);
    expect(body.topics).toContainEqual({ subjectId: 'chemistry', topic: 'Mole concept' });
    expect(body.lessons.length).toBeGreaterThan(0);
    expect((await http().get('/search?q=mole%20zzzz').expect(200)).body.lessons).toEqual([]);
    expect((await http().get('/search?q=').expect(200)).body).toEqual({ query: '', subjects: [], topics: [], lessons: [] });
  });

  it('matches translated text without accents, and English terms in any language', async () => {
    const accentless = await http().get('/search?q=mathematiques&lang=fr').expect(200);
    expect(accentless.body.subjects.map((s: { id: string }) => s.id)).toContain('mathematics');
    const english = await http().get('/search?q=mathematics&lang=fr').expect(200);
    expect(english.body.subjects[0].name).toBe('Mathématiques');
  });

  it('keeps a short recent-search history per learner', async () => {
    const { as } = await signIn();
    for (const q of ['mole', 'algebra', 'Mole']) await as.post('/me/searches', { query: q }).expect(200);
    expect((await as.get('/me/library').expect(200)).body.searches).toEqual(['Mole', 'algebra']);
    for (let i = 0; i < 10; i++) await as.post('/me/searches', { query: `q${i}` });
    expect((await as.get('/me/library')).body.searches).toHaveLength(8);
    await as.delete('/me/searches').expect(200);
    expect((await as.get('/me/library')).body.searches).toEqual([]);
    await http().post('/me/searches').send({ query: 'x' }).expect(401);
  });
});

describe('library', () => {
  it('records views, progress and saves', async () => {
    const { as, sub } = await signIn();
    const before = (await prisma.lesson.findUniqueOrThrow({ where: { id: 'l2' } })).views;
    await as.post('/me/lessons/l2/view').expect(200);
    await as.post('/me/lessons/l2/view').expect(200);
    // Only the first view by a learner counts towards popularity.
    expect((await prisma.lesson.findUniqueOrThrow({ where: { id: 'l2' } })).views).toBe(before + 1);
    await as.post('/me/lessons/l7/view').expect(200);

    await as.put('/me/lessons/l2/progress', { progress: 0.6 }).expect(200);
    // Progress never goes backwards.
    expect((await as.put('/me/lessons/l2/progress', { progress: 0.2 }).expect(200)).body).toEqual({ progress: 0.6, completed: false });
    await as.put('/me/lessons/l2/progress', { progress: 2 }).expect(400);

    await as.put('/me/saved/l4').expect(200);
    await as.put('/me/saved/l4').expect(200);
    await as.put('/me/saved/l26').expect(200);
    await as.delete('/me/saved/l26').expect(200);
    await as.put('/me/saved/nope').expect(404);

    const lib = (await as.get('/me/library').expect(200)).body;
    expect(lib.saved).toEqual(['l4']);
    expect(lib.recent.map((r: { id: string }) => r.id)).toEqual(['l2', 'l7']);
    expect(lib.progress).toEqual({ l2: 0.6 });
    expect(await prisma.lessonProgress.count({ where: { userId: sub } })).toBe(2);
    await as.post('/me/lessons/nope/view').expect(404);
  });

  it('finishing a first lesson confirms a pending invite and tells the inviter', async () => {
    const ada = await signIn({ email: 'ada.home@example.com', metadata: { name: 'Ada Bello', consent: { terms: true, privacy: true, age: true } } });
    const amara = await signIn();
    await amara.as.post('/me/referral', { code: ada.user.referralCode }).expect(200);
    const joined = (await ada.as.get('/me/notifications').expect(200)).body.items;
    expect(joined[0]).toMatchObject({ template: 'referralJoined', params: { friend: 'Amara O.', credits: 5 }, read: false });

    await amara.as.put('/me/lessons/l1/progress', { progress: 1 }).expect(200);
    expect((await prisma.referral.findUniqueOrThrow({ where: { inviteeId: amara.sub } })).status).toBe('confirmed');
    const confirmed = (await ada.as.get('/me/notifications')).body.items[0];
    expect(confirmed).toMatchObject({ template: 'referralConfirmed', params: { friend: 'Amara O.', credits: 5 }, href: '/rewards/wallet' });
  });
});

describe('recommendations and home', () => {
  const PROFILE = { learnerType: 'exam', subjects: ['Chemistry'], examGoals: ['jamb'], interests: ['space'], formats: ['quizzes'] };

  it('recommends from the learner’s subjects and exams, explaining why', async () => {
    const { as } = await signIn();
    await as.post('/me/personalization', PROFILE).expect(200);
    const { body } = await as.get('/me/recommendations?limit=5').expect(200);
    expect(body.items).toHaveLength(5);
    expect(['studies', 'exam']).toContain(body.items[0].reason.kind);
    const top = body.items[0];
    expect(top.lesson.subjectId === 'chemistry' || top.lesson.exams.includes('JAMB')).toBe(true);
    const scores = body.items.map((i: { score: number }) => i.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it('leaves finished lessons out', async () => {
    const { as } = await signIn();
    await as.post('/me/personalization', PROFILE).expect(200);
    const first = (await as.get('/me/recommendations')).body.items[0].lesson.id;
    await as.put(`/me/lessons/${first}/progress`, { progress: 1 }).expect(200);
    const ids = (await as.get('/me/recommendations')).body.items.map((i: { lesson: { id: string } }) => i.lesson.id);
    expect(ids).not.toContain(first);
  });

  it('builds the Home dashboard in one request', async () => {
    const { as } = await signIn();
    await as.post('/me/lessons/l3/view');
    await as.put('/me/lessons/l3/progress', { progress: 0.4 });
    await as.put('/me/saved/l5');
    const { body } = await as.get('/me/home').set('X-Language', 'fr').expect(200);
    expect(body.continueLearning).toHaveLength(1);
    expect(body.continueLearning[0]).toMatchObject({ lesson: { id: 'l3' }, progress: 0.4 });
    expect(body.recommended.length).toBeGreaterThan(0);
    expect(body.trending).toHaveLength(8);
    expect(body.savedCount).toBe(1);
    // A new account starts with the welcome message.
    expect(body.notifications.unread).toBe(1);
    expect(body.notifications.latest[0]).toMatchObject({ template: 'welcome', params: { name: 'Amara' } });
    await http().get('/me/home').expect(401);
  });
});

describe('notifications', () => {
  it('lists, opens, and marks notifications read, only for their owner', async () => {
    const amara = await signIn();
    const other = await signIn({ email: 'tunde@example.com' });
    const list = (await amara.as.get('/me/notifications').expect(200)).body;
    expect(list).toMatchObject({ unread: 1, hasMore: false });
    const id = list.items[0].id;

    await other.as.get(`/me/notifications/${id}`).expect(404);
    expect((await other.as.post(`/me/notifications/${id}/read`)).body.changed).toBe(0);

    const opened = (await amara.as.get(`/me/notifications/${id}`).expect(200)).body.notification;
    expect(opened).toMatchObject({ id, read: true, template: 'welcome', href: '/recommended' });
    expect((await amara.as.get('/me/notifications')).body.unread).toBe(0);

    await prisma.notification.createMany({
      data: [1, 2, 3].map((i) => ({ userId: amara.sub, type: 'content', template: 'newLesson', params: { subject: 'x', lesson: `${i}` } })),
    });
    expect((await amara.as.get('/me/notifications')).body.unread).toBe(3);
    await amara.as.post('/me/notifications/read-all').expect(200);
    expect((await amara.as.get('/me/notifications')).body.unread).toBe(0);
    // The other person's inbox is untouched.
    expect((await other.as.get('/me/notifications')).body.unread).toBe(1);

    const page = (await amara.as.get('/me/notifications?limit=2').expect(200)).body;
    expect(page).toMatchObject({ hasMore: true });
    const next = (await amara.as.get(`/me/notifications?limit=2&before=${page.items[1].createdAt}`)).body;
    expect(next.items.length).toBeGreaterThan(0);

    await amara.as.delete(`/me/notifications/${id}`).expect(200);
    await amara.as.get(`/me/notifications/${id}`).expect(404);
  });
});
