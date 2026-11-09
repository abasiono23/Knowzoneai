import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { useCountries } from '../src/services/books.js';
import { searchWords } from '../src/services/search-all.js';
import { useSubjectVideos } from '../src/services/subject-videos.js';
import { useSummaries, type SummaryLibrary } from '../src/services/summaries.js';
import { http } from './helpers.js';

const text = (title: string, keyword: string) => ({
  title,
  short: `${title} in brief`,
  keywords: [keyword],
  sections: [{ heading: 'The idea', text: `All about ${title}.` }],
  keyPoints: [`Remember ${title}.`],
});
const library: SummaryLibrary = {
  id: 'mathematics',
  name: { en: 'Mathematics', fr: 'Mathématiques' },
  overview: { en: text('All of maths', 'numbers'), fr: text('Toutes les maths', 'nombres') },
  topics: [
    {
      id: 'quadratics',
      stage: 'upper',
      text: { en: text('Quadratic equations', 'zyloparabola'), fr: text('Équations du second degré', 'parabole') },
    },
  ],
};
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
  name: id,
  updated: '2026-11-06',
  levels: [{ id: 'ss1', stage: 'upper' }],
  streams: [],
  subjects: [{ id: 'mathematics', name: 'Mathematics', levels: ['ss1'], streams: null }],
  books,
});

beforeAll(() => {
  useSummaries([library]);
  useSubjectVideos([
    {
      id: 'mathematics',
      topics: [
        {
          id: 'quadratics',
          flashcards: [],
          videos: [{ youtubeId: 'aaaaaaaaaa1', title: 'Solving a zyloparabola', channel: 'A Channel', seconds: 300 }],
        },
      ],
    },
  ]);
  useCountries([
    country('ng', [
      book('algebra-one', 'Zylophonics One'),
      book('ng-free', 'Zylophonics For Nigeria', { free: true, countryOnly: true, readUrl: 'https://example.com/read' }),
    ]),
    country('gh', [book('algebra-one', 'Zylophonics One')]),
  ] as never);
});
afterAll(() => {
  useSummaries(null);
  useSubjectVideos(null);
  useCountries(null);
});

describe('searching everything', () => {
  it('finds summaries by title and keyword, and links to the right one', async () => {
    const { body } = await http().get('/search/all?q=zyloparabola').expect(200);
    expect(body.summaries).toEqual([
      expect.objectContaining({ library: 'mathematics', id: 'quadratics', title: 'Quadratic equations' }),
    ]);
    expect(body.summaries[0].keywords).toBeUndefined();
  });

  it('finds videos with the topic they belong to', async () => {
    const { body } = await http().get('/search/all?q=zyloparabola').expect(200);
    expect(body.videos).toEqual([
      expect.objectContaining({ kind: 'shelf', youtubeId: 'aaaaaaaaaa1', library: 'mathematics', topic: 'quadratics' }),
    ]);
  });

  it('answers in the reader’s language, and English words still find it', async () => {
    const { body } = await http().get('/search/all?q=quadratic').set('X-Language', 'fr').expect(200);
    expect(body.summaries[0].title).toBe('Équations du second degré');
  });

  it('ignores words that only say what kind of thing is wanted', async () => {
    expect(searchWords('video on zyloparabola')).toEqual(['zyloparabola']);
    expect(searchWords('summary')).toEqual(['summary']);
    const { body } = await http().get('/search/all?q=summary%20of%20zyloparabola').expect(200);
    expect(body.summaries).toHaveLength(1);
  });

  it('lists a book once, and keeps a country’s free book to that country', async () => {
    const elsewhere = await http().get('/search/all?q=zylophonics&country=gh').expect(200);
    expect(elsewhere.body.books.map((b: { id: string }) => b.id)).toEqual(['algebra-one']);
    const home = await http().get('/search/all?q=zylophonics&country=ng').expect(200);
    expect(home.body.books.map((b: { id: string }) => b.id).sort()).toEqual(['algebra-one', 'ng-free']);
    expect(home.body.books[0].id).toBe('ng-free');
  });

  it('finds nothing for a word that matches nothing', async () => {
    const { body } = await http().get('/search/all?q=zzzzqq').expect(200);
    expect(body).toMatchObject({ videos: [], summaries: [], books: [] });
  });
});
