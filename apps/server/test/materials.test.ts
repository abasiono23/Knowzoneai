import { describe, expect, it, vi } from 'vitest';

import { prisma } from '../src/db.js';
import type { GenerateOptions, StudyContent } from '../src/services/study-ai.js';
import { http, signIn } from './helpers.js';

// OpenAI and YouTube are replaced with fakes; reading text and Word files, the background
// processing, credits and marking are real.
const ai = vi.hoisted(() => ({ fail: 0, calls: [] as { text: string; topic?: string; opts: GenerateOptions; language: string }[] }));

const CONTENT = (): StudyContent => ({
  summary: { tldr: 'Cells make energy in mitochondria.', overview: ['Respiration releases energy.'] },
  notes: [{ heading: 'Respiration', blocks: [{ type: 'p', text: 'Glucose + oxygen → energy' }] }],
  concepts: [{ term: 'ATP', definition: 'The energy currency of the cell' }],
  keyPoints: [{ text: 'Mitochondria are the powerhouse', importance: 'high' }],
  flashcards: [
    { id: 'card1', front: 'What makes ATP?', back: 'Mitochondria' },
    { id: 'card2', front: 'ATP stands for?', back: 'Adenosine triphosphate' },
  ],
  quiz: [
    { id: 'q1', type: 'mcq', question: 'Where is ATP made?', options: ['Nucleus', 'Mitochondria', 'Wall', 'Ribosome'], correctIndex: 1, explanation: '…', concept: 'Mitochondria', difficulty: 'easy' },
    { id: 'q2', type: 'tf', question: 'Plants respire.', options: ['True', 'False'], correctIndex: 0, explanation: '…', concept: 'Respiration', difficulty: 'medium' },
  ],
  mindMap: { center: 'Cells', branches: [{ label: 'Energy', color: '#9B82FF', children: ['ATP'] }] },
  readingMinutes: 3,
});

vi.mock('../src/services/study-ai.js', async (importOriginal) => {
  const real = await importOriginal<typeof import('../src/services/study-ai.js')>();
  return {
    ...real,
    readSource: vi.fn(async (userId: string, source: Parameters<typeof real.readSource>[1]) => {
      if (source.type === 'video') return { text: 'Captions about cells and energy '.repeat(10), title: 'Cells explained' };
      if (source.type === 'image') return { text: 'Photo notes about cells '.repeat(10) };
      return real.readSource(userId, source);
    }),
    generateStudyContent: vi.fn(async (_u: string, src: { text: string; topic?: string }, opts: GenerateOptions, language: string, onStage: (n: number) => Promise<unknown>) => {
      ai.calls.push({ text: src.text, topic: src.topic, opts, language });
      for (const s of [1, 2, 3, 4]) await onStage(s);
      if (ai.fail > 0) {
        ai.fail--;
        throw new Error('OpenAI timed out');
      }
      return { content: CONTENT(), title: 'How cells make energy', subject: 'Biology' };
    }),
    studyDiagram: vi.fn(async () => Buffer.from([0xff, 0xd8, 0xff, 0xd9])),
  };
});

const reset = () => {
  ai.fail = 0;
  ai.calls.length = 0;
};
const NOTES = 'Cells are the basic unit of life. Mitochondria release energy from glucose in respiration. '.repeat(4);

/** Waits for background processing to finish. */
async function settled(as: Awaited<ReturnType<typeof signIn>>['as'], id: string) {
  for (let i = 0; i < 50; i++) {
    const { body } = await as.get(`/materials/${id}`).expect(200);
    if (body.material.status !== 'processing') return body.material;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error('still processing');
}

const credits = async (id: string) => (await prisma.user.findUniqueOrThrow({ where: { id } })).aiCredits;

describe('making a study pack', () => {
  it('makes a pack from pasted text in the background, for 1 credit', async () => {
    reset();
    const { as, sub } = await signIn();
    await as.post('/me/personalization', { learnerType: 'school', language: 'ha' }).expect(200);
    const before = await credits(sub);
    const res = await as
      .post('/materials/pack0001', { type: 'text', text: NOTES, options: { depth: 'Quick', difficulty: 'Beginner', outputs: ['summary', 'flashcards', 'quiz'] } })
      .expect(202);
    expect(res.body.material).toMatchObject({ id: 'pack0001', status: 'processing', source: { type: 'text', label: 'Pasted text' } });
    expect(await credits(sub)).toBe(before - 1);

    const m = await settled(as, 'pack0001');
    expect(m).toMatchObject({ status: 'ready', stage: 4, title: 'How cells make energy', subject: 'Biology', folder: 'Biology' });
    expect(m.content.flashcards).toHaveLength(2);
    expect(m.options).toEqual({ depth: 'Quick', difficulty: 'Beginner', outputs: ['summary', 'flashcards', 'quiz'] });
    expect(ai.calls[0]).toMatchObject({ language: 'ha', opts: { depth: 'Quick' } });
    expect(ai.calls[0].text).toContain('Mitochondria');
    expect(await credits(sub)).toBe(before - 1);
    expect(await prisma.creditEntry.count({ where: { userId: sub, reason: 'spend' } })).toBe(1);
  });

  it('keeps a title the learner chose; uses a video’s title otherwise', async () => {
    reset();
    const { as } = await signIn();
    await as.post('/materials/mytitle1', { type: 'text', text: NOTES, title: 'My biology notes' }).expect(202);
    expect((await settled(as, 'mytitle1')).title).toBe('My biology notes');
    await as.post('/materials/video001', { type: 'video', url: 'https://youtu.be/UPBMG5EYydo' }).expect(202);
    const v = await settled(as, 'video001');
    expect(v).toMatchObject({ title: 'Cells explained', source: { type: 'video', url: 'https://youtu.be/UPBMG5EYydo' } });
    await as.post('/materials/topic001', { type: 'topic', topic: 'Photosynthesis' }).expect(202);
    await settled(as, 'topic001');
    expect(ai.calls.at(-1)).toMatchObject({ topic: 'Photosynthesis', text: '' });
  });

  it('uploads a photo, stores it in the database, and checks file types', async () => {
    reset();
    const { token } = await signIn();
    const up = (id: string) => http().post(`/materials/${id}`).set('Authorization', `Bearer ${token}`);
    await up('photo001')
      .field('type', 'image')
      .field('options', JSON.stringify({ depth: 'Standard' }))
      .attach('file', Buffer.from([0xff, 0xd8, 0xff, 0xd9]), { filename: 'notes.jpg', contentType: 'image/jpeg' })
      .expect(202);
    const file = await prisma.materialFile.findFirst({ where: { materialId: 'photo001' } });
    expect(file).toMatchObject({ kind: 'source', name: 'notes.jpg', mimeType: 'image/jpeg' });
    await up('olddoc01')
      .field('type', 'doc')
      .attach('file', Buffer.from('x'), { filename: 'notes.doc', contentType: 'application/msword' })
      .expect(415);
    await up('nofile01').field('type', 'pdf').expect(400);
  });

  it('fails unreadable files without charging, and retries failures (70)', async () => {
    reset();
    const { as, token, sub } = await signIn();
    const before = await credits(sub);
    // Not a real PDF: reading fails for good, and the credit comes back.
    await http()
      .post('/materials/badpdf01')
      .set('Authorization', `Bearer ${token}`)
      .field('type', 'pdf')
      .attach('file', Buffer.from('not a pdf'), { filename: 'notes.pdf', contentType: 'application/pdf' })
      .expect(202);
    const bad = await settled(as, 'badpdf01');
    expect(bad).toMatchObject({ status: 'failed', error: { code: 'unreadable-file', retryable: false } });
    expect(await credits(sub)).toBe(before);
    await as.post('/materials/badpdf01/retry').expect(409);

    ai.fail = 1;
    await as.post('/materials/retry001', { type: 'text', text: NOTES }).expect(202);
    expect(await settled(as, 'retry001')).toMatchObject({ status: 'failed', error: { code: 'ai-failed', retryable: true } });
    expect(await credits(sub)).toBe(before);
    await as.post('/materials/retry001/retry').expect(202);
    expect((await settled(as, 'retry001')).status).toBe('ready');
    expect(await credits(sub)).toBe(before - 1);
  });

  it('refuses with no credits, and checks the input', async () => {
    reset();
    const { as, sub } = await signIn();
    await as.post('/materials/short001', { type: 'text', text: 'Too short' }).expect(400);
    await as.post('/materials/vid00001', { type: 'video', url: 'https://vimeo.com/123' }).expect(400);
    await as.post('/materials/bad id!', { type: 'topic', topic: 'x' }).expect(400);
    await prisma.user.update({ where: { id: sub }, data: { aiCredits: 0 } });
    const broke = await as.post('/materials/nocred01', { type: 'topic', topic: 'Algebra' }).expect(402);
    expect(broke.body.reason).toBe('no-credits');
    expect(await prisma.material.count({ where: { userId: sub } })).toBe(0);
  });

  it('shows a pack interrupted by a restart as failed, with its credit back', async () => {
    reset();
    const { as, sub } = await signIn();
    const before = await credits(sub);
    await prisma.user.update({ where: { id: sub }, data: { aiCredits: { decrement: 1 } } });
    await prisma.material.create({
      data: {
        id: 'stuck001', userId: sub, title: 'Stuck', sourceType: 'topic', sourceLabel: 'Stuck', options: {},
        creditHeld: true, status: 'PROCESSING',
      },
    });
    await prisma.$executeRaw`UPDATE "Material" SET "updatedAt" = (now() at time zone 'utc') - interval '20 minutes' WHERE id = 'stuck001'`;
    const m = (await as.get('/materials/stuck001').expect(200)).body.material;
    expect(m).toMatchObject({ status: 'failed', error: { code: 'ai-failed', retryable: true } });
    expect(await credits(sub)).toBe(before);
  });
});

describe('the study library', () => {
  it('syncs only what changed, organises, and deletes (84–87)', async () => {
    reset();
    const { as, sub } = await signIn();
    await as.post('/materials/lib00001', { type: 'text', text: NOTES }).expect(202);
    await as.post('/materials/lib00002', { type: 'topic', topic: 'Algebra' }).expect(202);
    await settled(as, 'lib00001');
    await settled(as, 'lib00002');

    const first = (await as.get('/materials').expect(200)).body;
    expect(first.ids).toEqual(['lib00002', 'lib00001']);
    expect(first.materials).toHaveLength(2);
    // Changes in the second before a sync are sent again so none slip through; after that, quiet.
    await new Promise((r) => setTimeout(r, 1100));
    const quiet = (await as.get(`/materials?since=${first.serverTime}`).expect(200)).body;
    await new Promise((r) => setTimeout(r, 1100));
    expect((await as.get(`/materials?since=${quiet.serverTime}`)).body.materials).toEqual([]);

    const edited = await as
      .patch('/materials/lib00001', { title: 'Renamed', folder: 'Exams', tags: ['waec'], saved: true, offline: true })
      .expect(200);
    expect(edited.body.material).toMatchObject({ title: 'Renamed', folder: 'Exams', tags: ['waec'], saved: true, offline: true });
    const next = (await as.get(`/materials?since=${quiet.serverTime}`).expect(200)).body;
    expect(next.materials.map((m: { id: string }) => m.id)).toEqual(['lib00001']);

    await as.delete('/materials/lib00002').expect(200);
    expect((await as.get(`/materials?since=${next.serverTime}`)).body.ids).toEqual(['lib00001']);
    await as.get('/materials/lib00002').expect(404);

    const other = await signIn({ email: 'tunde@example.com' });
    await other.as.get('/materials/lib00001').expect(404);
    await other.as.patch('/materials/lib00001', { title: 'Mine now' }).expect(404);
    expect((await other.as.get('/materials')).body.ids).toEqual([]);
    expect(await prisma.material.count({ where: { userId: sub } })).toBe(1);
  });

  it('marks quizzes on the server and rewards them (78–81)', async () => {
    reset();
    const { as } = await signIn();
    await as.post('/materials/quiz0001', { type: 'text', text: NOTES }).expect(202);
    await settled(as, 'quiz0001');
    const settings = { count: 2, difficulty: 'mixed', types: ['mcq', 'tf'], timed: false };
    const res = await as
      .post('/materials/quiz0001/attempts', { questionIds: ['q1', 'q2'], answers: [1, 1], seconds: 40, settings })
      .expect(201);
    expect(res.body.attempt).toMatchObject({ score: 1, total: 2, answers: [1, 1], seconds: 40 });
    expect(res.body).toMatchObject({ xpEarned: 20, coinsEarned: 5 });
    expect(res.body.user.xp).toBeGreaterThan(0);
    const m = (await as.get('/materials/quiz0001')).body.material;
    expect(m.attempts).toHaveLength(1);
    expect(m.mastery).toBe(0.5);
    await as.post('/materials/quiz0001/attempts', { questionIds: ['nope'], answers: [0], settings }).expect(400);
    await as.post('/materials/quiz0001/attempts', { questionIds: ['q1'], answers: [0, 1], settings }).expect(400);
  });

  it('spaces flashcard reviews (76)', async () => {
    reset();
    const { as } = await signIn();
    await as.post('/materials/cards001', { type: 'text', text: NOTES }).expect(202);
    await settled(as, 'cards001');
    const knew = (await as.post('/materials/cards001/cards/card1/review', { knewIt: true }).expect(200)).body.card;
    expect(knew).toMatchObject({ box: 1, reviews: 1 });
    expect(knew.dueAt).toBeGreaterThan(Date.now() + 23 * 3_600_000);
    const missed = (await as.post('/materials/cards001/cards/card1/review', { knewIt: false }).expect(200)).body.card;
    expect(missed).toMatchObject({ box: 0, reviews: 2 });
    expect((await as.get('/materials/cards001')).body.material.cards.card1.reviews).toBe(2);
    await as.post('/materials/cards001/cards/nope/review', { knewIt: true }).expect(404);
  });

  it('draws a diagram for 1 credit, stored in the database, once', async () => {
    reset();
    const { as, sub } = await signIn();
    await as.post('/materials/diag0001', { type: 'text', text: NOTES }).expect(202);
    await settled(as, 'diag0001');
    const before = await credits(sub);
    const drawn = await as.post('/materials/diag0001/diagram').expect(200);
    expect(drawn.body).toMatchObject({ image: expect.stringMatching(/^\/materials\/files\//), credits: before - 1 });
    expect((await http().get(drawn.body.image).expect(200)).headers['content-type']).toBe('image/jpeg');
    expect((await as.post('/materials/diag0001/diagram').expect(200)).body.credits).toBe(before - 1);
    expect((await as.get('/materials/diag0001')).body.material.image).toBe(drawn.body.image);
    // Deleting the pack deletes the drawing.
    await as.delete('/materials/diag0001').expect(200);
    await http().get(drawn.body.image).expect(404);
  });
});
