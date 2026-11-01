import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { useBooks, type Book } from '../src/services/books.js';
import { http } from './helpers.js';

const book = (id: string, free: boolean, placements: Book['placements']): Book => ({
  id,
  title: id.replace(/-/g, ' '),
  authors: ['A. Author'],
  publisher: free ? 'OpenStax' : 'Learn Africa',
  free,
  readUrl: free ? `https://openstax.org/details/books/${id}` : null,
  placements,
  sources: ['https://example.com/source'],
});

beforeAll(() =>
  useBooks([
    book('new-general-mathematics-jss-1', false, [{ subject: 'mathematics', classes: ['jss1'] }]),
    book('prealgebra-2e', true, [{ subject: 'mathematics', classes: ['jss1', 'jss2', 'jss3'] }]),
    book('modern-biology', false, [{ subject: 'biology', classes: ['ss1', 'ss2', 'ss3'] }]),
    book('chemistry-2e', true, [{ subject: 'chemistry', classes: ['ss1', 'ss2', 'ss3'] }]),
    book('comprehensive-economics', false, [{ subject: 'economics', classes: ['ss1', 'ss2', 'ss3'] }]),
  ]),
);
afterAll(() => useBooks(null));

describe('secondary school books', () => {
  it('lists the subjects for a class and stream, with book counts', async () => {
    const jss = (await http().get('/books/secondary?class=jss1').expect(200)).body.subjects;
    expect(jss).toHaveLength(19);
    expect(jss.find((s: { id: string }) => s.id === 'mathematics')).toEqual({ id: 'mathematics', books: 2, free: 1 });
    // JSS 2 has only the free book (the paid one is the JSS 1 volume).
    expect((await http().get('/books/secondary?class=jss2').expect(200)).body.subjects[1]).toEqual({ id: 'mathematics', books: 1, free: 1 });

    const science = (await http().get('/books/secondary?class=ss2&stream=science').expect(200)).body.subjects.map((s: { id: string }) => s.id);
    expect(science.slice(0, 4)).toEqual(['english', 'mathematics', 'civic-education', 'data-processing']);
    expect(science).toContain('biology');
    expect(science).not.toContain('commerce');
    const commercial = (await http().get('/books/secondary?class=ss2&stream=commercial').expect(200)).body.subjects.map((s: { id: string }) => s.id);
    expect(commercial).toContain('commerce');
    expect(commercial).not.toContain('physics');
    await http().get('/books/secondary?class=ss9').expect(400);
  });

  it('shows a subject’s books for a class, free ones first, without the research notes', async () => {
    const { body } = await http().get('/books/secondary/mathematics?class=jss1').expect(200);
    expect(body.books.map((b: { id: string; free: boolean }) => [b.id, b.free])).toEqual([
      ['prealgebra-2e', true],
      ['new-general-mathematics-jss-1', false],
    ]);
    expect(body.books[0]).toMatchObject({ readUrl: expect.stringContaining('openstax.org'), classes: ['jss1', 'jss2', 'jss3'] });
    expect(body.books[0].sources).toBeUndefined();
    await http().get('/books/secondary/physics?class=jss1').expect(404);
  });
});
