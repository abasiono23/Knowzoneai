import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { useCountries } from '../src/services/books.js';
import { refreshSubjectVideos, useSubjectVideos, type VideoLibrary } from '../src/services/subject-videos.js';
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
const summaries = (id: string, name: string): SummaryLibrary => ({
  id,
  name: { en: name, fr: `${name} (fr)` },
  overview: both(`All of ${name}`),
  topics: [
    { id: 'first', stage: 'lower', text: both(`${name} basics`) },
    { id: 'second', stage: 'upper', text: both(`${name} advanced`) },
    { id: 'third', stage: 'upper', text: both(`${name} extra`) },
  ],
});
const video = (n: number) => ({ youtubeId: `aaaaaaaaaa${n}`, title: `Video ${n}`, channel: 'A Channel', seconds: 300 });
const videos = (id: string): VideoLibrary => ({
  id,
  topics: [
    { id: 'first', videos: [video(1)], flashcards: ['l10'] },
    { id: 'second', videos: [video(2), video(3)], flashcards: [] },
    { id: 'third', videos: [], flashcards: [] },
  ],
});

const country = {
  country: 'ng',
  name: 'Nigeria',
  updated: '2026-11-06',
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
  useSummaries([summaries('mathematics', 'Mathematics'), summaries('biology', 'Biology')]);
  useSubjectVideos([videos('mathematics'), videos('biology')]);
});
afterEach(() => vi.unstubAllGlobals());
afterAll(() => {
  useCountries(null);
  useSummaries(null);
  useSubjectVideos(null);
});

describe('subject videos', () => {
  it('sorts by topic, with the student’s class first, and leaves out empty topics', async () => {
    const { body } = await http().get('/books/countries/ng/subjects/mathematics/videos?level=ss1').expect(200);
    expect(body.topics.map((t: { id: string; yours: boolean }) => [t.id, t.yours])).toEqual([
      ['second', true],
      ['first', false],
    ]);
    expect(body.topics[1]).toMatchObject({ title: 'Mathematics basics' });
    expect(Array.isArray(body.topics[1].flashcards)).toBe(true);
    expect(body.reels).toEqual(['mathematics']);
  });

  it('serves a subject under another name, with its reels, in the reader’s language', async () => {
    const { body } = await http()
      .get('/books/countries/ng/subjects/life-sciences/videos?level=jss1')
      .set('X-Language', 'fr')
      .expect(200);
    expect(body.topics[0]).toMatchObject({ title: 'Biology basics (fr)', libraryName: 'Biology (fr)', yours: true });
    expect(body.reels).toEqual(['biology', 'human body', 'animals']);
  });

  it('has nothing for other subjects', async () => {
    const { body } = await http().get('/books/countries/ng/subjects/yoruba/videos?level=ss1').expect(200);
    expect(body).toEqual({ reels: [], topics: [] });
  });

  it('opens one topic', async () => {
    const { body } = await http().get('/books/videos/mathematics/second').expect(200);
    expect(body.topic.videos.map((v: { youtubeId: string }) => v.youtubeId)).toEqual(['aaaaaaaaaa2', 'aaaaaaaaaa3']);
    await http().get('/books/videos/mathematics/nope').expect(404);
    await http().get('/books/videos/..%2Fsecret/first').expect(404);
  });

  it('drops a video YouTube has removed and refreshes the rest', async () => {
    const { config } = await import('../src/config.js');
    const key = config.YOUTUBE_API_KEY;
    (config as { YOUTUBE_API_KEY?: string }).YOUTUBE_API_KEY = 'test-key';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'aaaaaaaaaa2',
              snippet: { title: 'New title', channelTitle: 'New channel' },
              contentDetails: { duration: 'PT10M' },
              status: { embeddable: true, privacyStatus: 'public' },
            },
          ],
        }),
      })),
    );
    await refreshSubjectVideos(Date.now());
    (config as { YOUTUBE_API_KEY?: string }).YOUTUBE_API_KEY = key;
    vi.unstubAllGlobals();
    const { body } = await http().get('/books/videos/mathematics/second').expect(200);
    expect(body.topic.videos).toEqual([
      { youtubeId: 'aaaaaaaaaa2', title: 'New title', channel: 'New channel', seconds: 600 },
    ]);
  });
});
