import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { prisma } from '../src/db.js';
import { usePapers, type Paper } from '../src/services/exams.js';
import { http, signIn } from './helpers.js';

const question = (n: number, topic: string, answer: number) => ({
  n,
  topic,
  q: `Question ${n}?`,
  options: ['w', 'x', 'y', 'z'],
  answer,
  explanation: `Because ${n}.`,
});
const PAPERS: Paper[] = [
  {
    id: 'jamb-physics-p1',
    exam: 'jamb',
    subject: 'physics',
    year: null,
    number: 1,
    source: 'ai',
    minutes: 27,
    questions: [question(1, 'Motion', 0), question(2, 'Waves', 2), question(3, 'Waves', 1)],
  },
  { id: 'jamb-physics-p2', exam: 'jamb', subject: 'physics', year: null, number: 2, source: 'ai', minutes: 27, questions: [question(1, 'Motion', 3)] },
  {
    id: 'jamb-physics-2019',
    exam: 'jamb',
    subject: 'physics',
    year: 2019,
    number: null,
    source: 'licensed',
    credit: 'Licensed',
    minutes: 27,
    questions: [question(1, 'Motion', 1)],
  },
];

beforeAll(() => usePapers(PAPERS));
afterAll(() => usePapers(null));

describe('Past Questions', () => {
  it('lists exams and subjects with paper counts and years, signed in or not', async () => {
    const res = await http().get('/exams').expect(200);
    const physics = res.body.exams.find((e: { id: string }) => e.id === 'jamb').subjects.find((s: { id: string }) => s.id === 'physics');
    expect(physics).toEqual({ id: 'physics', papers: 3, years: [2019], questions: 5 });
    const list = await http().get('/exams/jamb/physics').expect(200);
    // Real years first, then practice papers in order; on Free only practice paper 1 is open.
    expect(list.body.papers.map((p: { id: string; locked: boolean }) => [p.id, p.locked])).toEqual([
      ['jamb-physics-2019', true],
      ['jamb-physics-p1', false],
      ['jamb-physics-p2', true],
    ]);
    expect(list.body.papers[0].questions).toBe(1);
    await http().get('/exams/jamb/cooking').expect(400);
  });

  it('opens the free sample, keeps the rest for Pro, marks a sitting and keeps the best score', async () => {
    const { as, user } = await signIn();
    const paper = (await as.get('/exams/papers/jamb-physics-p1').expect(200)).body.paper;
    expect(paper.questions).toHaveLength(3);
    expect(paper.questions[1]).toMatchObject({ answer: 2, explanation: 'Because 2.' });
    expect((await as.get('/exams/papers/jamb-physics-2019').expect(403)).body.reason).toBe('pro');
    await as.get('/exams/papers/nope').expect(404);

    const sat = await as.post('/exams/papers/jamb-physics-p1/attempts', { mode: 'timed', answers: [0, 1], seconds: 90 }).expect(201);
    expect(sat.body.attempt).toMatchObject({ score: 1, total: 3, mode: 'timed', seconds: 90 });
    // Weakest topic first: Waves 0/2, Motion 1/1.
    expect(sat.body.topics).toEqual([
      { topic: 'Waves', right: 0, total: 2 },
      { topic: 'Motion', right: 1, total: 1 },
    ]);
    await as.post('/exams/papers/jamb-physics-p1/attempts', { mode: 'practice', answers: [0, 2, 1], seconds: 60 }).expect(201);
    const list = (await as.get('/exams/jamb/physics').expect(200)).body.papers.find((p: { id: string }) => p.id === 'jamb-physics-p1');
    expect(list).toMatchObject({ best: 3, attempts: 2 });
    expect((await as.get('/me/exams/attempts?paper=jamb-physics-p1').expect(200)).body.attempts.map((a: { score: number }) => a.score)).toEqual([3, 1]);

    await prisma.user.update({ where: { id: user.id }, data: { plan: 'PRO' } });
    await as.get('/exams/papers/jamb-physics-2019').expect(200);
    await http().get('/exams/papers/jamb-physics-p1').expect(401);
  });
});
