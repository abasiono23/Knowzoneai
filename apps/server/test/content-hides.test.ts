import { afterAll, beforeAll, beforeEach, describe, expect, it, onTestFinished } from 'vitest';

import { config } from '../src/config.js';
import { prisma } from '../src/db.js';
import { booksFor, country, useCountries, useCourseBooks } from '../src/services/books.js';
import { refreshHiddenContent } from '../src/services/content-hides.js';
import { useSkills } from '../src/services/skills.js';
import { useSubjectVideos } from '../src/services/subject-videos.js';
import { useSummaries, type SummaryLibrary } from '../src/services/summaries.js';
import { forgetWatchVideos, watchVideos } from '../src/services/watch.js';
import { CONSENT, http, signIn } from './helpers.js';

const ADMIN = 'hide-boss@example.com';
const before = config.ADMIN_EMAILS;
let boss: Awaited<ReturnType<typeof signIn>>;

const text = (title: string) => ({
  title,
  short: `${title} in brief`,
  keywords: ['zyloword'],
  sections: [{ heading: 'The idea', text: `All about ${title}.` }],
  keyPoints: [`Remember ${title}.`],
});
const library: SummaryLibrary = {
  id: 'mathematics',
  name: { en: 'Mathematics' },
  overview: { en: text('All of maths') },
  topics: [{ id: 'quadratics', stage: 'upper', text: { en: text('Zyloword equations') } }],
};
const BAD = 'aaaaaaaaaa1';
const GOOD = 'aaaaaaaaaa2';
const video = (youtubeId: string) => ({
  youtubeId,
  title: `Zyloword ${youtubeId}`,
  channel: 'A Channel',
  seconds: 300,
});
const book = (id: string, extra: object = {}) => ({
  id,
  title: `Zyloword ${id}`,
  series: null,
  authors: ['A. Writer'],
  publisher: 'A Press',
  free: true,
  readUrl: 'https://example.com/read',
  placements: [{ subject: 'mathematics', levels: ['ss1'] }],
  sources: ['https://example.com/source'],
  ...extra,
});
const courseBook = (id: string) => ({ ...book(id), placements: [{ course: 'zylo-course', levels: ['intro'] }] });

const hide = (kind: string, id: string) =>
  boss.as.post('/admin/library/hide', { kind, id, title: `The ${id}`, reason: 'Not suitable' }).expect(200);
const search = async () => (await http().get('/search/all?q=zyloword&country=ng').expect(200)).body;
const ids = (list: { id?: string; youtubeId?: string }[]) => list.map((x) => x.youtubeId ?? x.id);

beforeAll(() => {
  useSummaries([library]);
  useSubjectVideos([
    { id: 'mathematics', topics: [{ id: 'quadratics', flashcards: [], videos: [video(BAD), video(GOOD)] }] },
  ]);
  useCountries([
    {
      country: 'ng',
      name: 'Nigeria',
      updated: '2026-11-06',
      levels: [{ id: 'ss1', stage: 'upper' }],
      streams: [],
      subjects: [{ id: 'mathematics', name: 'Mathematics', levels: ['ss1'], streams: null }],
      books: [book('bad-book'), book('good-book')],
    },
  ] as never);
  useCourseBooks([courseBook('bad-course-book'), courseBook('good-course-book')] as never);
  useSkills([
    {
      id: 'zylo-skill',
      name: { en: 'Zylo skill' },
      tagline: { en: 'Tag' },
      summary: { en: 'Sum' },
      videos: [
        { ...video(BAD), summary: { en: 'S' } },
        { ...video(GOOD), summary: { en: 'S' } },
      ],
    },
  ] as never);
});
afterAll(async () => {
  useSummaries(null);
  useSubjectVideos(null);
  useCountries(null);
  useCourseBooks(null);
  useSkills(null);
  config.ADMIN_EMAILS = before;
  await refreshHiddenContent();
});
beforeEach(async () => {
  config.ADMIN_EMAILS = ADMIN;
  await refreshHiddenContent(); // The tables are emptied before each test.
  boss = await signIn({ email: ADMIN, metadata: { consent: CONSENT } });
});

describe('hiding content', () => {
  it('is for staff only, and needs a reason', async () => {
    const learner = await signIn({ email: 'hide-learner@example.com', metadata: { consent: CONSENT } });
    await learner.as.post('/admin/library/hide', { kind: 'video', id: BAD, title: 'x', reason: 'Because' }).expect(403);
    await boss.as.post('/admin/library/hide', { kind: 'video', id: BAD, title: 'x', reason: '' }).expect(400);
    await boss.as.post('/admin/library/hide', { kind: 'nonsense', id: BAD, title: 'x', reason: 'Because' }).expect(400);
  });

  it('takes a video out of its subject, Future skills and search, and puts it back', async () => {
    await hide('video', BAD);
    const shelf = await http().get('/books/videos/mathematics/quadratics').expect(200);
    expect(ids(shelf.body.topic.videos)).toEqual([GOOD]);
    const skill = await http().get('/skills/zylo-skill').expect(200);
    expect(ids(skill.body.skill.videos)).toEqual([GOOD]);
    expect(ids((await search()).videos)).not.toContain(BAD);

    await boss.as.post('/admin/library/unhide', { kind: 'video', id: BAD }).expect(200);
    const back = await http().get('/books/videos/mathematics/quadratics').expect(200);
    expect(ids(back.body.topic.videos)).toEqual([BAD, GOOD]);
  });

  it('takes a video out of the Videos feed and its course lesson', async () => {
    const id = 'zzzzzzzzzz1';
    await prisma.course.deleteMany({ where: { id: 'zylo' } });
    await prisma.course.create({
      data: {
        id: 'zylo',
        title: 'Zylo course',
        subtitle: '',
        subjectId: 'physics',
        level: 'Beginner',
        emoji: '📘',
        colors: ['#000', '#fff'],
        description: '',
        outcomes: [],
        requirements: [],
        exams: [],
        tags: [],
        source: {},
        modules: { create: { id: 'zylo/m0', position: 0, title: 'Chapter 1', summary: '' } },
        lessons: {
          create: {
            id: 'zylo/c0video',
            moduleId: 'zylo/m0',
            position: 0,
            title: 'Video',
            kind: 'video',
            minutes: 8,
            summary: '',
            content: { video: video(id), keyPoints: ['Stays'] },
          },
        },
      },
    });
    onTestFinished(async () => {
      await prisma.course.deleteMany({ where: { id: 'zylo' } });
      forgetWatchVideos();
    });
    const url = '/courses/zylo/lessons/c0video';
    expect((await http().get(url).expect(200)).body.content.video.youtubeId).toBe(id);
    forgetWatchVideos();
    expect((await watchVideos()).map((v) => v.youtubeId)).toContain(id);

    await hide('video', id!);
    const after = await http().get(url).expect(200);
    expect(after.body.content.video).toBeUndefined();
    expect(after.body.content.keyPoints).toEqual(['Stays']);
    expect((await watchVideos()).map((v) => v.youtubeId)).not.toContain(id);
    await boss.as.post('/admin/library/unhide', { kind: 'video', id }).expect(200);
    expect((await http().get(url).expect(200)).body.content.video.youtubeId).toBe(id);
  });

  it('takes a book off its shelf, the counts and search', async () => {
    await hide('book', 'bad-book');
    await hide('book', 'bad-course-book');
    expect(booksFor(country('ng'), 'mathematics', 'ss1').map((b) => b.id)).toEqual(['good-book']);
    const shelves = await http().get('/books/countries/ng/shelves?level=ss1').expect(200);
    expect(shelves.body.subjects[0]).toMatchObject({ books: 1, free: 1 });
    const countries = await http().get('/books/countries').expect(200);
    expect(countries.body.countries.find((c: { id: string }) => c.id === 'ng')).toMatchObject({ books: 1, free: 1 });
    const course = await http().get('/books/courses/zylo-course').expect(200);
    expect(ids(course.body.books)).toEqual(['good-course-book']);
    const found = ids((await search()).books);
    expect(found).not.toContain('bad-book');
    expect(found).not.toContain('bad-course-book');
    expect(found).toContain('good-book');
  });

  it('takes a summary out of its tab, reading and search, and the video page stops linking to it', async () => {
    await hide('summary', 'mathematics/quadratics');
    const tab = await http().get('/books/countries/ng/subjects/mathematics/summaries').expect(200);
    expect(tab.body.topics).toEqual([]);
    await http().get('/books/summaries/mathematics/quadratics').expect(404);
    expect((await search()).summaries.map((s: { id: string }) => s.id)).not.toContain('quadratics');
    const topic = await http().get('/books/videos/mathematics/quadratics').expect(200);
    expect(topic.body.topic.hasSummary).toBe(false);
  });

  it('staff still see it, marked as hidden with the reason, and can filter to it', async () => {
    await hide('book', 'bad-book');
    const { body } = await boss.as.get('/admin/library/books?country=ng').expect(200);
    expect(body.items.find((b: { id: string }) => b.id === 'bad-book').hidden).toMatchObject({
      reason: 'Not suitable',
      hiddenBy: ADMIN,
    });
    expect(body.items.find((b: { id: string }) => b.id === 'good-book').hidden).toBeNull();
    const only = await boss.as.get('/admin/library/books?country=ng&state=hidden').expect(200);
    expect(ids(only.body.items)).toEqual(['bad-book']);
    const list = await boss.as.get('/admin/library/hidden').expect(200);
    expect(list.body.items).toEqual([
      expect.objectContaining({ kind: 'book', itemId: 'bad-book', title: 'The bad-book' }),
    ]);
  });

  it('survives a restart', async () => {
    await hide('book', 'bad-book');
    await refreshHiddenContent();
    expect(booksFor(country('ng'), 'mathematics', 'ss1').map((b) => b.id)).toEqual(['good-book']);
  });
});
