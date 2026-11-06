import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { config } from '../src/config.js';
import { useCountries, useCourseBooks } from '../src/services/books.js';
import { useSkills } from '../src/services/skills.js';
import { useSubjectVideos } from '../src/services/subject-videos.js';
import { useSummaries, type SummaryLibrary } from '../src/services/summaries.js';
import { CONSENT, signIn } from './helpers.js';

const ADMIN = 'library-boss@example.com';
const before = config.ADMIN_EMAILS;
let boss: Awaited<ReturnType<typeof signIn>>;

const text = (title: string) => ({
  title,
  short: `${title} in brief`,
  keywords: ['key'],
  sections: [{ heading: 'The idea', text: `All about ${title}.` }],
  keyPoints: [`Remember ${title}.`],
});
const summaries: SummaryLibrary = {
  id: 'mathematics',
  name: { en: 'Mathematics' },
  overview: { en: text('All of maths'), fr: text('Toutes les maths') },
  topics: [{ id: 'quadratics', stage: 'upper', text: { en: text('Quadratic equations') } }],
};
const video = (youtubeId: string, title: string) => ({ youtubeId, title, channel: 'A Channel', seconds: 300 });
const book = (id: string, title: string, extra: object = {}) => ({
  id,
  title,
  series: null,
  authors: ['A. Writer'],
  publisher: 'A Press',
  free: false,
  placements: [{ subject: 'mathematics', levels: ['ss1'] }],
  sources: ['https://example.com/source'],
  ...extra,
});
const country = (id: string, books: object[]) => ({
  country: id,
  name: id.toUpperCase(),
  updated: '2026-11-06',
  levels: [{ id: 'ss1', stage: 'upper' }],
  streams: [],
  subjects: [
    { id: 'mathematics', name: 'Mathematics', levels: ['ss1'], streams: null },
    { id: 'music', name: 'Music', levels: ['ss1'], streams: null },
  ],
  books,
});

beforeAll(() => {
  useSummaries([summaries]);
  useSubjectVideos([
    {
      id: 'mathematics',
      topics: [
        {
          id: 'quadratics',
          flashcards: [],
          videos: [video('aaaaaaaaaa1', 'Solving a zyloparabola'), video('aaaaaaaaaa2', 'Graphs of curves')],
        },
      ],
    },
    {
      id: 'music',
      name: { en: 'Music' },
      topics: [
        {
          id: 'rhythm',
          stage: 'upper',
          title: { en: 'Rhythm' },
          flashcards: [],
          videos: [video('aaaaaaaaaa3', 'Keeping time')],
        },
      ],
    },
  ]);
  useCountries([
    country('ng', [
      book('zylo-one', 'Zylophonics One', {
        free: true,
        readUrl: 'https://example.com/read',
        cover: 'https://example.com/c.png',
      }),
      book('zylo-two', 'Zylophonics Two'),
    ]),
    country('gh', [
      book('zylo-one', 'Zylophonics One', {
        free: true,
        readUrl: 'https://example.com/read',
        cover: 'https://example.com/c.png',
      }),
    ]),
  ] as never);
  useCourseBooks([]);
  useSkills([]);
});
afterAll(() => {
  useSummaries(null);
  useSubjectVideos(null);
  useCountries(null);
  useCourseBooks(null);
  useSkills(null);
  config.ADMIN_EMAILS = before;
});
beforeEach(async () => {
  config.ADMIN_EMAILS = ADMIN;
  boss = await signIn({ email: ADMIN, metadata: { consent: CONSENT } });
});

describe('the library', () => {
  it('is for staff only', async () => {
    const learner = await signIn({ email: 'a-learner@example.com', metadata: { consent: CONSENT } });
    for (const part of ['videos', 'books', 'summaries', 'gaps', 'summaries/mathematics/quadratics'])
      await learner.as.get(`/admin/library/${part}`).expect(403);
  });

  it('lists videos with where they appear, and filters and searches them', async () => {
    const maths = await boss.as.get('/admin/library/videos?set=mathematics').expect(200);
    expect(maths.body.total).toBe(2);
    expect(maths.body.sets.map((s: { id: string }) => s.id)).toEqual(expect.arrayContaining(['mathematics', 'music']));
    const music = await boss.as.get('/admin/library/videos?set=music').expect(200);
    expect(music.body.items).toEqual([
      expect.objectContaining({
        youtubeId: 'aaaaaaaaaa3',
        places: ['Music · Rhythm'],
        sources: ['subject'],
        gone: false,
      }),
    ]);
    const found = await boss.as.get('/admin/library/videos?q=zyloparabola').expect(200);
    expect(found.body.items.map((v: { youtubeId: string }) => v.youtubeId)).toEqual(['aaaaaaaaaa1']);
  });

  it('lists a book once with all its countries, and filters by country, price and missing cover', async () => {
    const all = await boss.as.get('/admin/library/books').expect(200);
    expect(all.body.total).toBe(2);
    expect(all.body.items.find((b: { id: string }) => b.id === 'zylo-one').countries).toEqual(['ng', 'gh']);
    const ghana = await boss.as.get('/admin/library/books?country=gh').expect(200);
    expect(ghana.body.items.map((b: { id: string }) => b.id)).toEqual(['zylo-one']);
    const paid = await boss.as.get('/admin/library/books?price=paid').expect(200);
    expect(paid.body.items.map((b: { id: string }) => b.id)).toEqual(['zylo-two']);
    const noCover = await boss.as.get('/admin/library/books?cover=missing').expect(200);
    expect(noCover.body.items.map((b: { id: string }) => b.id)).toEqual(['zylo-two']);
  });

  it('lists summaries with their languages, and opens one to read', async () => {
    const { body } = await boss.as.get('/admin/library/summaries?library=mathematics').expect(200);
    expect(body.items).toEqual([
      expect.objectContaining({ id: 'overview', languages: ['en', 'fr'] }),
      expect.objectContaining({ id: 'quadratics', languages: ['en'] }),
    ]);
    const one = await boss.as.get('/admin/library/summaries/mathematics/overview?lang=fr').expect(200);
    expect(one.body.title).toBe('Toutes les maths');
    await boss.as.get('/admin/library/summaries/mathematics/nope').expect(404);
  });

  it('shows what’s thin or missing', async () => {
    const { body } = await boss.as.get('/admin/library/gaps').expect(200);
    expect(body.videos.find((s: { id: string }) => s.id === 'music')).toMatchObject({
      name: 'Music',
      topics: 1,
      videos: 1,
      thinTopics: ['Rhythm'],
    });
    const nigeria = body.books.countries.find((c: { id: string }) => c.id === 'ng');
    expect(nigeria).toMatchObject({ books: 2, free: 1, noCover: 1, emptySubjects: ['Music'] });
    expect(body.summaries[0]).toMatchObject({ id: 'mathematics', topics: 1 });
    expect(body.summaries[0].missing).toContainEqual({ language: 'fr', topics: 1 });
  });
});
