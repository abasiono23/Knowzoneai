import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { useCountries } from '../src/services/books.js';
import { useSummaries, type SummaryLibrary } from '../src/services/summaries.js';
import { http } from './helpers.js';

const text = (title: string) => ({
  title,
  short: `${title} in brief`,
  keywords: [title.toLowerCase()],
  sections: [{ heading: 'The idea', text: `All about ${title}.` }],
  keyPoints: [`Remember ${title}.`],
});
const both = (title: string) => ({ en: text(title), fr: text(`${title} (fr)`) });
const lib = (id: string, name: string): SummaryLibrary => ({
  id,
  name: { en: name, fr: `${name} (fr)` },
  overview: both(`All of ${name}`),
  topics: [
    { id: 'first', stage: 'lower', text: both(`${name} basics`) },
    { id: 'second', stage: 'upper', text: both(`${name} advanced`) },
  ],
});

const country = {
  country: 'ng',
  name: 'Nigeria',
  updated: '2026-11-05',
  levels: [
    { id: 'jss1', stage: 'lower' },
    { id: 'ss1', stage: 'upper' },
  ],
  streams: [],
  subjects: [],
  books: [],
};

beforeAll(() => {
  useCountries([country] as never);
  useSummaries([lib('mathematics', 'Mathematics'), lib('physics', 'Physics'), lib('chemistry', 'Chemistry')]);
});
afterAll(() => {
  useCountries(null);
  useSummaries(null);
});

describe('subject summaries', () => {
  it('lists the course summary and puts the topics for the student’s class first', async () => {
    const { body } = await http().get('/books/countries/ng/subjects/mathematics/summaries?level=ss1').expect(200);
    expect(body.courses.map((c: { title: string }) => c.title)).toEqual(['All of Mathematics']);
    expect(body.topics.map((t: { id: string; yours: boolean }) => [t.id, t.yours])).toEqual([
      ['second', true],
      ['first', false],
    ]);
  });

  it('joins libraries for a subject that teaches them together, under another name', async () => {
    const { body } = await http().get('/books/countries/ng/subjects/physical-sciences/summaries?level=ss1').expect(200);
    expect(body.courses.map((c: { library: string }) => c.library)).toEqual(['physics', 'chemistry']);
    expect(body.topics).toHaveLength(4);
  });

  it('answers in the reader’s language', async () => {
    const { body } = await http()
      .get('/books/countries/ng/subjects/mathematics/summaries?level=jss1')
      .set('X-Language', 'fr')
      .expect(200);
    expect(body.topics[0]).toMatchObject({
      title: 'Mathematics basics (fr)',
      libraryName: 'Mathematics (fr)',
      yours: true,
    });
  });

  it('can show the English of a translation, for the Read in English button', async () => {
    const { body } = await http()
      .get('/books/summaries/mathematics/second?lang=en')
      .set('X-Language', 'fr')
      .expect(200);
    expect(body.summary.title).toBe('Mathematics advanced');
  });

  it('says when the text is English because the translation is not out yet', async () => {
    const { body } = await http().get('/books/summaries/mathematics/second').set('X-Language', 'yo').expect(200);
    expect(body.summary).toMatchObject({ title: 'Mathematics advanced', translated: false });
    const list = await http()
      .get('/books/countries/ng/subjects/mathematics/summaries?level=ss1')
      .set('X-Language', 'yo')
      .expect(200);
    expect(list.body.translated).toBe(false);
  });

  it('has nothing yet for other subjects', async () => {
    const { body } = await http().get('/books/countries/ng/subjects/yoruba/summaries?level=ss1').expect(200);
    expect(body).toEqual({ translated: false, courses: [], topics: [] });
  });

  it('opens one summary, or the whole course', async () => {
    const topic = await http().get('/books/summaries/mathematics/second').expect(200);
    expect(topic.body.summary).toMatchObject({
      title: 'Mathematics advanced',
      keyPoints: ['Remember Mathematics advanced.'],
    });
    const course = await http().get('/books/summaries/mathematics/overview').expect(200);
    expect(course.body.summary.title).toBe('All of Mathematics');
    await http().get('/books/summaries/mathematics/nope').expect(404);
    await http().get('/books/summaries/..%2Fsecret/overview').expect(404);
  });
});
