import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  country,
  useCountries,
  useCourseBooks,
  type Book,
  type Country,
  type CourseBook,
} from '../src/services/books.js';
import { http } from './helpers.js';

const book = (id: string, free: boolean, placements: Book['placements'], extra: Partial<Book> = {}): Book => ({
  id,
  title: id.replace(/-/g, ' '),
  authors: ['A. Author'],
  publisher: free ? 'OpenStax' : 'Learn Africa',
  free,
  readUrl: free ? `https://openstax.org/details/books/${id}` : null,
  placements,
  sources: ['https://example.com/source'],
  ...extra,
});

const courseBook = (id: string, free: boolean): Omit<CourseBook, 'placements'> => {
  const { placements: _p, ...b } = book(id, free, [{ subject: 'x', levels: ['x'] }]);
  return b;
};

beforeAll(() => {
  // Nigeria's real classes, streams and subjects, with test books.
  const ng = country('ng')!;
  const uk: Country = {
    country: 'uk',
    name: 'United Kingdom',
    updated: '2026-11-01',
    levels: [
      { id: 'year7', stage: 'lower' },
      { id: 'year10', stage: 'upper' },
    ],
    streams: [{ id: 'gcse', name: 'GCSE', levels: ['year10'] }],
    subjects: [
      { id: 'science', name: 'Science', levels: ['year7'], streams: null },
      {
        id: 'chemistry',
        name: 'Chemistry',
        levels: ['year10'],
        streams: ['gcse'],
      },
    ],
    books: [
      book('chemistry-2e', true, [{ subject: 'chemistry', levels: ['year10'] }]),
      book('aqa-gcse-chemistry', false, [{ subject: 'chemistry', levels: ['year10'] }]),
      book('national-science-book', true, [{ subject: 'science', levels: ['year7'] }], { countryOnly: true }),
    ],
  };
  useCountries([
    {
      ...ng,
      books: [
        book('new-general-mathematics-jss-1', false, [{ subject: 'mathematics', levels: ['jss1'] }]),
        book('prealgebra-2e', true, [{ subject: 'mathematics', levels: ['jss1', 'jss2', 'jss3'] }]),
        book('modern-biology', false, [{ subject: 'biology', levels: ['ss1', 'ss2', 'ss3'] }]),
        book('chemistry-2e', true, [{ subject: 'chemistry', levels: ['ss1', 'ss2', 'ss3'] }]),
        book('comprehensive-economics', false, [{ subject: 'economics', levels: ['ss1', 'ss2', 'ss3'] }]),
      ],
    },
    uk,
  ]);
});
afterAll(() => useCountries(null));

const ids = (list: { id: string }[]) => list.map((s) => s.id);

describe('books by country', () => {
  it('gives a country’s classes and the streams to choose in each', async () => {
    const { body } = await http().get('/books/countries/ng').expect(200);
    expect(ids(body.levels)).toEqual(['jss1', 'jss2', 'jss3', 'ss1', 'ss2', 'ss3']);
    expect(body.levels[0]).toMatchObject({ stage: 'lower', streams: [] });
    expect(ids(body.levels[4].streams)).toEqual(['science', 'arts', 'commercial']);
    // A country without its own books yet gets the worldwide free books.
    expect((await http().get('/books/countries/zz').expect(200)).body.country).toBe('world');
  });

  it('lists the subjects for a class and stream, with book counts', async () => {
    const jss = (await http().get('/books/countries/ng/shelves?level=jss1').expect(200)).body.subjects;
    expect(jss).toHaveLength(19);
    expect(jss.find((s: { id: string }) => s.id === 'mathematics')).toEqual({
      id: 'mathematics',
      name: 'Mathematics',
      books: 2,
      free: 1,
    });

    const science = ids(
      (await http().get('/books/countries/ng/shelves?level=ss2&stream=science').expect(200)).body.subjects,
    );
    expect(science.slice(0, 4)).toEqual(['english', 'mathematics', 'civic-education', 'data-processing']);
    expect(science).toContain('biology');
    expect(science).not.toContain('commerce');
    const commercial = ids(
      (await http().get('/books/countries/ng/shelves?level=ss2&stream=commercial').expect(200)).body.subjects,
    );
    expect(commercial).toContain('commerce');
    expect(commercial).not.toContain('physics');
    await http().get('/books/countries/ng/shelves?level=ss9').expect(404);
  });

  it('shows a subject’s books for a class, free ones first, without the research notes', async () => {
    const { body } = await http().get('/books/countries/ng/subjects/mathematics?level=jss1').expect(200);
    expect(body.books.map((b: { id: string; free: boolean }) => [b.id, b.free])).toEqual([
      ['prealgebra-2e', true],
      ['new-general-mathematics-jss-1', false],
    ]);
    expect(body.books[0]).toMatchObject({
      readUrl: expect.stringContaining('openstax.org'),
      levels: ['jss1', 'jss2', 'jss3'],
    });
    expect(body.books[0].sources).toBeUndefined();
    await http().get('/books/countries/ng/subjects/physics?level=jss1').expect(404);
  });

  it('keeps the first app version’s Nigeria paths working', async () => {
    const jss = (await http().get('/books/secondary?class=jss2').expect(200)).body.subjects;
    expect(jss.find((s: { id: string }) => s.id === 'mathematics')).toMatchObject({ books: 1, free: 1 });
    const { body } = await http().get('/books/secondary/mathematics?class=jss1').expect(200);
    expect(body.books[0].classes).toEqual(['jss1', 'jss2', 'jss3']);
  });

  it('gives other countries the free books from everywhere, once each', async () => {
    const { body } = await http().get('/books/countries/world').expect(200);
    expect(ids(body.levels)).toEqual(['lower', 'upper']);
    const upper = (await http().get('/books/countries/world/shelves?level=upper').expect(200)).body.subjects;
    expect(upper).toEqual([{ id: 'chemistry', name: 'Chemistry', books: 1, free: 1 }]);
    const lower = ids((await http().get('/books/countries/world/shelves?level=lower').expect(200)).body.subjects);
    // A country's own national books stay with that country; paid books never appear.
    expect(lower).toEqual(['mathematics']);
    const chem = (await http().get('/books/countries/world/subjects/chemistry?level=upper').expect(200)).body.books;
    expect(chem.map((b: { id: string }) => b.id)).toEqual(['chemistry-2e']);
  });
});

describe('course books', () => {
  beforeAll(() =>
    useCourseBooks([
      {
        ...courseBook('biology-2e', true),
        placements: [
          { course: 'biology', levels: ['intro'] },
          { course: 'medicine', levels: ['intro'] },
        ],
      },
      {
        ...courseBook('molecular-biology-of-the-cell', false),
        placements: [{ course: 'biology', levels: ['core', 'masters'] }],
      },
      {
        ...courseBook('campbell-biology', false),
        placements: [{ course: 'biology', levels: ['intro'] }],
      },
      {
        ...courseBook('research-methods-for-biologists', true),
        placements: [{ course: 'biology', levels: ['masters'] }],
      },
    ]),
  );
  afterAll(() => useCourseBooks(null));

  it('lists a course’s books: free first, then the ones for the student’s stage', async () => {
    const first = (await http().get('/books/courses/biology?stage=undergraduate').expect(200)).body;
    expect(first.books.map((b: { id: string }) => b.id)).toEqual([
      'biology-2e',
      'research-methods-for-biologists',
      'campbell-biology',
      'molecular-biology-of-the-cell',
    ]);
    expect(first.free).toBe(2);
    expect(first.books[0]).toMatchObject({ levels: ['intro'] });
    expect(first.books[0].sources).toBeUndefined();
    const masters = (await http().get('/books/courses/biology?stage=masters').expect(200)).body;
    expect(masters.books.map((b: { id: string }) => b.id).slice(0, 3)).toEqual([
      'research-methods-for-biologists',
      'biology-2e',
      'molecular-biology-of-the-cell',
    ]);
    // One book, two courses, each with its own levels.
    expect((await http().get('/books/courses/medicine').expect(200)).body.books).toHaveLength(1);
    // A course the student typed in has no books yet.
    expect((await http().get('/books/courses/climate-policy').expect(200)).body).toEqual({
      course: 'climate-policy',
      books: [],
      free: 0,
    });
  });
});
