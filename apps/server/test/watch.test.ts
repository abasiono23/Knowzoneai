import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { prisma } from '../src/db.js';
import { invalidateCourses } from '../src/routes/courses.js';
import { http, signIn } from './helpers.js';

// Comments are screened: anything containing "nasty" is flagged.
vi.mock('../src/services/ai.js', async (original) => ({
  ...(await original<typeof import('../src/services/ai.js')>()),
  openaiClient: () => ({
    moderations: { create: async ({ input }: { input: string }) => ({ results: [{ flagged: /nasty/i.test(input) }] }) },
  }),
}));

/** A course with one video per chapter; YouTube ids are 11 characters. */
async function course(id: string, subjectId: string, titles: string[]) {
  await prisma.course.create({
    data: {
      id,
      title: `${id[0]!.toUpperCase()}${id.slice(1)} course`,
      subtitle: '',
      subjectId,
      level: 'Beginner',
      emoji: '📘',
      colors: ['#000', '#fff'],
      description: '',
      outcomes: [],
      requirements: [],
      exams: [],
      tags: [],
      source: {},
      modules: { create: titles.map((_, i) => ({ id: `${id}/m${i}`, position: i, title: `Chapter ${i + 1}`, summary: '' })) },
    },
  });
  await prisma.courseLesson.createMany({
    data: titles.map((title, i) => ({
      id: `${id}/c${i}video`,
      courseId: id,
      moduleId: `${id}/m${i}`,
      position: 0,
      title: `Video: ${title}`,
      kind: 'video',
      minutes: 8,
      summary: '',
      content: { video: { youtubeId: `${id.slice(0, 3)}${String(i).padStart(8, '0')}`, title, channel: 'Khan Academy', seconds: 480 } },
    })),
  });
}

// Courses are reference data the test setup keeps, so these tests bring their own and clear them after.
beforeEach(async () => {
  await prisma.course.deleteMany();
  await course('physics', 'physics', ['Newton’s laws of motion', 'Work and energy', 'Waves and sound', 'Electric circuits', 'Light and optics', 'Gravity']);
  await course('biology', 'biology', ['Cell structure', 'Photosynthesis explained', 'DNA and genes', 'Evolution']);
  invalidateCourses();
});

afterAll(async () => {
  await prisma.course.deleteMany();
  invalidateCourses();
});

describe('Videos feed (YouTube)', () => {
  it('pages through every course video, signed in or not', async () => {
    const first = (await http().get('/watch').expect(200)).body;
    expect(first.total).toBe(10);
    expect(first.videos).toHaveLength(8);
    expect(first.next).toBe(8);
    expect(first.subjects).toEqual(
      expect.arrayContaining([
        { id: 'physics', videos: 6 },
        { id: 'biology', videos: 4 },
      ]),
    );
    expect(first.videos[0]).toMatchObject({ id: expect.stringMatching(/^yt-/), channel: 'Khan Academy', seconds: 480, likes: 0, liked: false });
    const second = (await http().get('/watch?offset=8').expect(200)).body;
    expect(second.videos).toHaveLength(2);
    expect(second.next).toBeNull();
    expect(second.subjects).toBeUndefined();
    // Every video once.
    expect(new Set([...first.videos, ...second.videos].map((v: { id: string }) => v.id)).size).toBe(10);
  });

  it('searches titles, courses and chapters, and filters by subject', async () => {
    const search = async (q: string) => (await http().get('/watch').query({ q }).expect(200)).body.videos.map((v: { title: string }) => v.title);
    expect(await search('photosynthesis')).toEqual(['Photosynthesis explained']);
    expect(await search('WAVES sound')).toEqual(['Waves and sound']);
    // "Biology course" matches all of that course's videos.
    expect(await search('biology')).toHaveLength(4);
    expect(await search('quantum')).toEqual([]);
    const bio = (await http().get('/watch?subject=biology').expect(200)).body;
    expect(bio.total).toBe(4);
    expect(bio.videos[0]).toMatchObject({ courseId: 'biology', course: 'Biology course', subject: 'biology', chapter: expect.stringMatching(/^Chapter/) });
  });

  it('likes and comments use the reel endpoints', async () => {
    const { as } = await signIn();
    const id = (await http().get('/watch?q=gravity').expect(200)).body.videos[0].id;
    expect((await as.post(`/me/reels/${id}/like`, { liked: true }).expect(200)).body).toEqual({ liked: true, likes: 1 });
    await as.post(`/me/reels/${id}/comments`, { text: 'This explained it so well!' }).expect(201);
    expect((await as.post(`/me/reels/${id}/comments`, { text: 'nasty' }).expect(422)).body.reason).toBe('blocked');
    const [v] = (await as.get('/watch?q=gravity').expect(200)).body.videos;
    expect(v).toMatchObject({ likes: 1, comments: 1, liked: true });
    expect((await http().get(`/reels/${id}/comments`).expect(200)).body.comments).toHaveLength(1);
    await as.post('/me/reels/yt-nope0000000/like', { liked: true }).expect(404);
  });

  it('plays videos from our player page, starting by themselves in the feed', async () => {
    const page = await http().get('/embed/youtube/phy00000000?autoplay=1').expect(200);
    expect(page.text).toContain('embed/phy00000000?playsinline=1&rel=0&modestbranding=1&autoplay=1');
    expect((await http().get('/embed/youtube/phy00000000').expect(200)).text).not.toContain('autoplay=1"');
  });
});
