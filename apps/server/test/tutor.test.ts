import { describe, expect, it, vi } from 'vitest';

import { prisma } from '../src/db.js';
import { AppError } from '../src/lib/errors.js';
import type { TutorAnswer, TutorInput } from '../src/services/tutor-ai.js';
import { http, signIn } from './helpers.js';

// OpenAI is replaced with fakes: the tests check everything around the model, for free.
const ai = vi.hoisted(() => ({
  fail: 0,
  notConfigured: false,
  inputs: [] as TutorInput[],
}));

const ANSWER = (subject = 'Chemistry'): TutorAnswer => ({
  summary: 'A mole is 6.02 × 10²³ particles.',
  body: [{ type: 'p', text: 'Think of a mole like a dozen, but much bigger.' }, { type: 'list', items: ['Avogadro'] }],
  keyTerms: [{ term: 'Mole', meaning: 'An amount of substance' }],
  steps: [{ title: 'Find the molar mass', detail: 'Add the atomic masses.' }],
  finalAnswer: '2 mol',
  examples: [{ title: 'Salt', scenario: 'A bag of salt', explanation: '…', level: 'Easy' }],
  commonMistakes: ['Mixing grams and moles'],
  followUps: ['What is molar mass?', 'Give me a harder one', 'Why 6.02 × 10²³?'],
  flashcards: [],
  quiz: [],
  subject,
  sources: [],
});

vi.mock('../src/services/tutor-ai.js', async (importOriginal) => {
  const real = await importOriginal<typeof import('../src/services/tutor-ai.js')>();
  return {
    ...real,
    tutorAnswer: vi.fn(async (userId: string, input: TutorInput) => {
      ai.inputs.push(input);
      if (ai.notConfigured) throw new AppError(503, 'AI features aren’t set up', 'not-configured');
      if (ai.fail > 0) {
        ai.fail--;
        throw new Error('OpenAI timed out');
      }
      // Counted like the real one.
      await prisma.usageEvent.create({
        data: { userId, feature: 'tutor_question', model: 'fake', inputTokens: 1, outputTokens: 1 },
      });
      return { ...ANSWER(), sources: input.sources ?? [] };
    }),
    answerFlashcards: vi.fn(async () => [
      { front: 'What is a mole?', back: '6.02 × 10²³ particles' },
      { front: 'Molar mass of water?', back: '18 g/mol' },
    ]),
    answerQuiz: vi.fn(async () => [
      { question: 'A mole contains…', options: ['6.02 × 10²³', '100', '12', '1'], correctIndex: 0, explanation: 'Avogadro' },
    ]),
    answerDiagram: vi.fn(async () => {
      if (ai.fail > 0) {
        ai.fail--;
        throw new Error('Image failed');
      }
      return Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
    }),
  };
});

const reset = () => {
  ai.fail = 0;
  ai.notConfigured = false;
  ai.inputs.length = 0;
};

describe('asking the tutor', () => {
  it('creates the conversation on the first question and answers in the learner’s language', async () => {
    reset();
    const { as } = await signIn();
    await as.post('/me/personalization', { learnerType: 'school', language: 'fr' }).expect(200);
    const res = await as
      .post('/tutor/conversations/chat123/messages', {
        text: 'What is a mole in chemistry?',
        conversation: { mode: 'steps', level: 'beginner' },
      })
      .expect(201);
    expect(res.body.conversation).toMatchObject({ id: 'chat123', title: 'What is a mole in chemistry?', subject: 'Chemistry', mode: 'steps' });
    expect(res.body.question).toMatchObject({ role: 'user', text: 'What is a mole in chemistry?' });
    expect(res.body.reply).toMatchObject({ role: 'assistant', status: 'ok', replyTo: res.body.question.id });
    expect(res.body.reply.answer).toMatchObject({ summary: expect.any(String), flashcards: [], quiz: [] });
    expect(res.body.usage).toMatchObject({ limit: 10, used: 1, remaining: 9 });
    expect(ai.inputs[0]).toMatchObject({ mode: 'steps', level: 'beginner', language: 'fr', history: [] });

    // A follow-up (56) carries the earlier turn as history.
    await as.post('/tutor/conversations/chat123/messages', { text: 'Give me a harder one' }).expect(201);
    expect(ai.inputs[1].history.map((h) => h.role)).toEqual(['user', 'assistant']);
    expect(ai.inputs[1].history[1].content).toContain('6.02');

    const full = (await as.get('/tutor/conversations/chat123').expect(200)).body.conversation;
    expect(full.messages.map((m: { role: string }) => m.role)).toEqual(['user', 'assistant', 'user', 'assistant']);
    const list = (await as.get('/tutor/conversations').expect(200)).body.conversations;
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id: 'chat123', messageCount: 4 });
    expect(list[0].messages).toBeUndefined();
  });

  it('reads a photo or PDF page, stores it, and serves it by token only', async () => {
    reset();
    const { as, token } = await signIn();
    const res = await http()
      .post('/tutor/conversations/photo01/messages')
      .set('Authorization', `Bearer ${token}`)
      .field('text', '')
      .field('conversation', JSON.stringify({ mode: 'steps', context: { kind: 'image', label: 'Photo question' } }))
      .attach('file', Buffer.from([0xff, 0xd8, 0xff, 0xd9]), { filename: 'q.jpg', contentType: 'image/jpeg' })
      .expect(201);
    expect(ai.inputs[0].image?.mimeType).toBe('image/jpeg');
    expect(res.body.conversation.title).toBe('Question from q.jpg');
    const uri: string = res.body.question.attachment.uri;
    expect(res.body.question.attachment).toMatchObject({ kind: 'image', name: 'q.jpg' });
    expect(uri).toMatch(/^\/tutor\/files\/[\w-]{20,}$/);
    // Images load without a token (for <Image> tags); a wrong token finds nothing.
    const img = await http().get(uri).expect(200);
    expect(img.headers['content-type']).toBe('image/jpeg');
    await http().get('/tutor/files/not-a-real-token').expect(404);
    // Deleting the conversation deletes its files from the database too.
    await as.delete('/tutor/conversations/photo01').expect(200);
    await http().get(uri).expect(404);

    await http()
      .post('/tutor/conversations/pdf0001/messages')
      .set('Authorization', `Bearer ${token}`)
      .field('text', 'Explain question 3')
      .field('page', '4')
      .attach('file', Buffer.from('%PDF-1.4'), { filename: 'past-paper.pdf', contentType: 'application/pdf' })
      .expect(201);
    expect(ai.inputs[1].pdf).toMatchObject({ name: 'past-paper.pdf', page: 4 });
    expect(ai.inputs[1].sources).toEqual(['past-paper.pdf · p. 4']);

    await http()
      .post('/tutor/conversations/bad0001/messages')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('hi'), { filename: 'x.txt', contentType: 'text/plain' })
      .expect(415);
    await as.post('/tutor/conversations/empty01/messages', { text: '   ' }).expect(400);
  });

  it('grounds answers in the lesson a chat was started from', async () => {
    reset();
    const { as } = await signIn();
    await as
      .post('/tutor/conversations/lesson1/messages', {
        text: 'Explain this simply',
        conversation: { context: { kind: 'lesson', label: 'How cells make energy', refId: 'l1' } },
      })
      .expect(201);
    expect(ai.inputs[0].grounding).toContain('Mitochondria');
    expect(ai.inputs[0].sources).toEqual(['How cells make energy']);
  });

  it('grounds answers in a study pack: its source text, or its notes for a topic pack', async () => {
    reset();
    const { as, sub } = await signIn();
    await prisma.material.createMany({
      data: [
        { id: 'packtext', userId: sub, title: 'My notes', sourceType: 'text', sourceLabel: 'Pasted text', sourceText: 'Osmosis moves water across membranes.', options: {} },
        {
          id: 'packtopc', userId: sub, title: 'Algebra', sourceType: 'topic', sourceLabel: 'Algebra', options: {},
          content: { summary: { tldr: 'Algebra uses letters for numbers.', overview: [] }, keyPoints: [{ text: 'Balance both sides' }] },
        },
      ],
    });
    const ask = (id: string, refId: string) =>
      as.post(`/tutor/conversations/${id}/messages`, { text: 'Explain', conversation: { context: { kind: 'pack', label: 'Pack', refId } } }).expect(201);
    await ask('packchat1', 'packtext');
    expect(ai.inputs[0].grounding).toBe('Osmosis moves water across membranes.');
    await ask('packchat2', 'packtopc');
    expect(ai.inputs[1].grounding).toContain('Balance both sides');
    // Someone else's pack is never used.
    const other = await signIn({ email: 'tunde@example.com' });
    await other.as.post('/tutor/conversations/packchat3/messages', { text: 'x', conversation: { context: { kind: 'pack', label: 'P', refId: 'packtext' } } }).expect(201);
    expect(ai.inputs[2].grounding).toBeUndefined();
  });

  it('turns AI failures into a reply with Retry, without using up a question (61)', async () => {
    reset();
    const { as } = await signIn();
    ai.fail = 1;
    const res = await as.post('/tutor/conversations/retry01/messages', { text: 'Photosynthesis?' }).expect(201);
    expect(res.body.reply).toMatchObject({ status: 'error', error: { kind: 'server' } });
    expect(res.body.usage.used).toBe(0);

    const retried = await as.post(`/tutor/conversations/retry01/messages/${res.body.reply.id}/retry`).expect(200);
    expect(retried.body.reply).toMatchObject({ id: res.body.reply.id, status: 'ok' });
    expect(retried.body.reply.error).toBeUndefined();
    expect(retried.body.usage.used).toBe(1);
    // The conversation has one question and one (now good) answer.
    const msgs = (await as.get('/tutor/conversations/retry01')).body.conversation.messages;
    expect(msgs.map((m: { status?: string }) => m.status ?? 'q')).toEqual(['q', 'ok']);

    ai.notConfigured = true;
    const off = await as.post('/tutor/conversations/retry01/messages', { text: 'Again?' }).expect(201);
    expect(off.body.reply.error.message).toContain('isn’t set up');
  });

  it('stops at the daily allowance for the plan (60)', async () => {
    reset();
    const { as, sub } = await signIn();
    await prisma.usageEvent.createMany({
      data: Array.from({ length: 9 }, () => ({ userId: sub, feature: 'tutor_question', model: 'fake', inputTokens: 0, outputTokens: 0 })),
    });
    expect((await as.get('/tutor/usage').expect(200)).body.usage).toMatchObject({ limit: 10, used: 9, remaining: 1 });
    await as.post('/tutor/conversations/limit01/messages', { text: 'Last one' }).expect(201);
    const over = await as.post('/tutor/conversations/limit01/messages', { text: 'One more?' }).expect(429);
    expect(over.body.reason).toBe('tutor-limit');
    // Plus has a bigger allowance.
    await prisma.user.update({ where: { id: sub }, data: { plan: 'PLUS' } });
    expect((await as.get('/tutor/usage')).body.usage).toMatchObject({ limit: 100, remaining: 90 });
  });

  it('keeps conversations private, and pins and deletes them (50)', async () => {
    reset();
    const amara = await signIn();
    const tunde = await signIn({ email: 'tunde@example.com' });
    await amara.as.post('/tutor/conversations/mine001/messages', { text: 'Hi' }).expect(201);
    await tunde.as.get('/tutor/conversations/mine001').expect(404);
    await tunde.as.post('/tutor/conversations/mine001/messages', { text: 'Sneaky' }).expect(404);
    expect((await tunde.as.get('/tutor/conversations')).body.conversations).toEqual([]);

    const pinned = await amara.as.patch('/tutor/conversations/mine001', { pinned: true }).expect(200);
    expect(pinned.body.conversation.pinned).toBe(true);
    await amara.as.delete('/tutor/conversations/mine001').expect(200);
    await amara.as.get('/tutor/conversations/mine001').expect(404);
    expect(await prisma.tutorMessage.count({ where: { conversationId: 'mine001' } })).toBe(0);
    await amara.as.post('/tutor/conversations/bad id!/messages', { text: 'x' }).expect(400);
  });
});

describe('making things from an answer', () => {
  async function answered() {
    const user = await signIn();
    const res = await user.as.post('/tutor/conversations/make001/messages', { text: 'What is a mole?' }).expect(201);
    return { ...user, replyId: res.body.reply.id as string };
  }

  it('makes flashcards and a quiz once, then keeps them with the answer (58, 59)', async () => {
    reset();
    const { as, replyId } = await answered();
    const cards = await as.post(`/tutor/messages/${replyId}/flashcards`).expect(200);
    expect(cards.body.flashcards).toHaveLength(2);
    const quiz = await as.post(`/tutor/messages/${replyId}/quiz`).expect(200);
    expect(quiz.body.quiz[0].correctIndex).toBe(0);
    const { answerFlashcards } = await import('../src/services/tutor-ai.js');
    await as.post(`/tutor/messages/${replyId}/flashcards`).expect(200);
    expect(answerFlashcards).toHaveBeenCalledTimes(1);
    const msg = (await as.get('/tutor/conversations/make001')).body.conversation.messages[1];
    expect(msg.answer.flashcards).toHaveLength(2);
    expect(msg.answer.quiz).toHaveLength(1);

    const other = await signIn({ email: 'tunde@example.com' });
    await other.as.post(`/tutor/messages/${replyId}/quiz`).expect(404);
  });

  it('draws a diagram for 1 AI credit, refunds failures, and refuses with no credits', async () => {
    reset();
    const { as, sub, replyId } = await answered();
    const before = (await prisma.user.findUniqueOrThrow({ where: { id: sub } })).aiCredits;

    ai.fail = 1;
    await as.post(`/tutor/messages/${replyId}/diagram`).expect(500);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: sub } })).aiCredits).toBe(before);

    const drawn = await as.post(`/tutor/messages/${replyId}/diagram`).expect(200);
    expect(drawn.body).toMatchObject({ image: expect.stringMatching(/^\/tutor\/files\//), credits: before - 1 });
    expect((await http().get(drawn.body.image).expect(200)).headers['content-type']).toBe('image/jpeg');
    expect(await prisma.creditEntry.count({ where: { userId: sub, reason: 'spend' } })).toBe(1);
    // Asking again shows the same drawing for free.
    expect((await as.post(`/tutor/messages/${replyId}/diagram`).expect(200)).body.credits).toBe(before - 1);
    const msg = (await as.get('/tutor/conversations/make001')).body.conversation.messages[1];
    expect(msg.image).toBe(drawn.body.image);

    const second = await as.post('/tutor/conversations/make001/messages', { text: 'And molar mass?' }).expect(201);
    await prisma.user.update({ where: { id: sub }, data: { aiCredits: 0 } });
    const broke = await as.post(`/tutor/messages/${second.body.reply.id}/diagram`).expect(402);
    expect(broke.body.reason).toBe('no-credits');
  });

  it('saves answers to notes and cards to decks (57)', async () => {
    reset();
    const { as } = await signIn();
    const note = await as
      .post('/tutor/notes', {
        title: 'Moles',
        notebook: 'Chemistry',
        tags: ['waec'],
        summary: 'A mole is…',
        body: [{ type: 'p', text: 'Like a dozen' }, { type: 'list', items: ['Avogadro'] }],
        source: 'AI tutor',
      })
      .expect(201);
    expect(note.body.note).toMatchObject({ title: 'Moles', notebook: 'Chemistry', createdAt: expect.any(Number) });
    expect(note.body.note.userId).toBeUndefined();
    await as.post('/tutor/notes', { title: '', notebook: 'x' }).expect(400);
    await as.post('/tutor/decks', { name: 'Moles', subject: 'Chemistry', cards: [{ front: 'Q', back: 'A' }] }).expect(201);
    await as.post('/tutor/decks', { name: 'Empty', cards: [] }).expect(400);
    const all = (await as.get('/tutor/notes').expect(200)).body;
    expect(all.notes).toHaveLength(1);
    expect(all.decks[0].cards).toEqual([{ front: 'Q', back: 'A' }]);
    await as.delete(`/tutor/notes/${note.body.note.id}`).expect(200);
    expect((await as.get('/tutor/notes')).body.notes).toEqual([]);
    await http().get('/tutor/notes').expect(401);
  });
});
