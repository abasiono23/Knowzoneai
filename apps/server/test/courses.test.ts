import { beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '../src/db.js';
import { invalidateCourses } from '../src/routes/courses.js';
import { http, signIn } from './helpers.js';

const QUIZ = [
  {
    id: 'q1',
    type: 'mcq',
    question: 'Unit of force?',
    options: ['Newton', 'Joule', 'Watt', 'Volt'],
    correctIndex: 0,
    explanation: '…',
    concept: 'Force',
    difficulty: 'easy',
  },
  {
    id: 'q2',
    type: 'tf',
    question: 'Speed is a vector.',
    options: ['True', 'False'],
    correctIndex: 1,
    explanation: '…',
    concept: 'Vectors',
    difficulty: 'easy',
  },
];

/** A small course: one chapter with a reading, a video and a quiz. */
async function seedCourse(id = 'physics') {
  await prisma.course.create({
    data: {
      id,
      title: 'Physics',
      subtitle: 'Motion and forces',
      subjectId: 'physics',
      level: 'Beginner',
      emoji: '⚛️',
      colors: ['#4CC9FF', '#3B2DBF'],
      description: 'A physics course.',
      outcomes: ['Motion'],
      requirements: [],
      exams: ['WAEC'],
      tags: ['motion'],
      source: {
        book: 'Physics',
        authors: 'A. Author',
        publisher: 'OpenStax, Rice University',
        url: 'https://openstax.org',
        license: 'CC BY 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
        attribution: 'Adapted from Physics…',
      },
      modules: { create: { id: `${id}/m1`, position: 0, title: 'Motion', summary: 'Distance and displacement' } },
    },
  });
  await prisma.courseLesson.createMany({
    data: [
      {
        id: `${id}/c1s1`,
        courseId: id,
        moduleId: `${id}/m1`,
        position: 0,
        title: 'Displacement',
        kind: 'reading',
        minutes: 6,
        summary: 'Define displacement',
        content: { reading: [{ heading: 'Defining motion', blocks: [{ type: 'p', text: 'Kinematics…' }] }] },
      },
      {
        id: `${id}/c1video`,
        courseId: id,
        moduleId: `${id}/m1`,
        position: 1,
        title: 'Video: Motion',
        kind: 'video',
        minutes: 8,
        summary: 'A video',
        content: { video: { youtubeId: 'abc123def45', title: 'Motion', channel: 'Khan Academy', seconds: 480 } },
      },
      {
        id: `${id}/c1quiz`,
        courseId: id,
        moduleId: `${id}/m1`,
        position: 2,
        title: 'Quiz: Motion',
        kind: 'quiz',
        minutes: 4,
        summary: '2 questions',
        content: { quiz: QUIZ },
      },
    ],
  });
  invalidateCourses();
}

beforeEach(async () => {
  await prisma.course.deleteMany();
  invalidateCourses();
});

describe('course catalogue', () => {
  it('lists courses with their outline and source, and serves lesson content (110–118, 128)', async () => {
    await seedCourse();
    const { body } = await http().get('/courses').expect(200);
    expect(body.courses).toHaveLength(1);
    const c = body.courses[0];
    expect(c).toMatchObject({ id: 'physics', instructorId: 'openstax-physics', rating: 0, ratingCount: 0, learners: 0, source: { license: 'CC BY 4.0' } });
    expect(c.modules[0]).toMatchObject({ id: 'm1', title: 'Motion' });
    expect(c.modules[0].lessons.map((l: { id: string; kind: string }) => `${l.id}:${l.kind}`)).toEqual(['c1s1:reading', 'c1video:video', 'c1quiz:quiz']);
    expect(c.modules[0].lessons[0].content).toBeUndefined();
    expect(body.instructors[0]).toMatchObject({ id: 'openstax-physics', name: 'OpenStax', verified: true });
    expect((await http().get(`/courses?since=${body.version}`).expect(200)).body).toEqual({ version: body.version, unchanged: true });

    const lesson = await http().get('/courses/physics/lessons/c1video').expect(200);
    expect(lesson.body.content.video).toMatchObject({ youtubeId: 'abc123def45' });
    await http().get('/courses/physics/lessons/nope').expect(404);
  });
});

describe('learning a course', () => {
  it('tracks lessons, marks quizzes on the server and issues a certificate at the end (114–125)', async () => {
    await seedCourse();
    const { as, sub } = await signIn();
    await as.post('/me/courses/physics/open', { lessonId: 'c1s1' }).expect(200);
    const first = await as.post('/me/courses/physics/lessons/c1s1/complete').expect(200);
    expect(first.body.certificate).toBeNull();
    expect(first.body.user.xp).toBeGreaterThan(0);
    // Finishing twice gives nothing more.
    expect((await as.post('/me/courses/physics/lessons/c1s1/complete').expect(200)).body.user).toBeUndefined();
    await as.post('/me/courses/physics/lessons/c1quiz/complete').expect(400);
    await as.post('/me/courses/physics/lessons/c1video/complete').expect(200);

    // A failed quiz is recorded but doesn't finish the lesson.
    const failed = await as.post('/me/courses/physics/lessons/c1quiz/attempts', { answers: [1, 0], seconds: 30 }).expect(201);
    expect(failed.body).toMatchObject({ passed: false, certificate: null, attempt: { score: 0, total: 2 } });
    await as.post('/me/courses/physics/lessons/c1quiz/attempts', { answers: [0] }).expect(400);

    const passed = await as.post('/me/courses/physics/lessons/c1quiz/attempts', { answers: [0, 1], seconds: 40 }).expect(201);
    expect(passed.body).toMatchObject({ passed: true, attempt: { score: 2 } });
    expect(passed.body.certificate).toMatchObject({ id: expect.stringMatching(/^KZ-PHY-[0-9A-F]{8}$/), name: 'Amara Okeke', score: 1 });

    const p = (await as.get('/me/courses').expect(200)).body;
    expect(p.enrolled.physics).toEqual(expect.any(Number));
    expect(Object.keys(p.done).sort()).toEqual(['physics/c1quiz', 'physics/c1s1', 'physics/c1video']);
    expect(p.last.physics).toBe('c1s1');
    expect(p.attempts['physics/c1quiz']).toHaveLength(2);
    expect(p.minutes.physics).toBe(18);
    expect(p.certificates.physics.id).toBe(passed.body.certificate.id);

    // Anyone can verify it.
    const verify = await http().get(`/certificates/${passed.body.certificate.id}`).expect(200);
    expect(verify.body.certificate).toMatchObject({ name: 'Amara Okeke', course: 'Physics' });
    await http().get('/certificates/KZ-FAKE-0000').expect(404);
    expect(await prisma.certificate.count({ where: { userId: sub } })).toBe(1);
  });

  it('keeps notes, saves courses, and counts ratings and learners (119, 126)', async () => {
    await seedCourse();
    const { as } = await signIn();
    const note = await as.post('/me/courses/physics/lessons/c1s1/notes', { text: 'Displacement has direction', quote: 'Kinematics…' }).expect(201);
    await as.patch(`/me/courses/physics/notes/${note.body.note.id}`, { text: 'Displacement is a vector' }).expect(200);
    await as.put('/me/courses/physics/save', { saved: true }).expect(200);
    await as.put('/me/courses/physics/rating', { stars: 4, tags: ['Clear'], text: 'Good' }).expect(200);
    await as.put('/me/courses/physics/rating', { stars: 5 }).expect(200);
    await as.put('/me/courses/physics/rating', { stars: 6 }).expect(400);

    const p = (await as.get('/me/courses')).body;
    expect(p.notes['physics/c1s1'][0]).toMatchObject({ text: 'Displacement is a vector', quote: 'Kinematics…' });
    expect(p.saved).toEqual(['physics']);
    expect(p.ratings.physics.stars).toBe(5);
    const c = (await http().get('/courses')).body.courses[0];
    expect(c).toMatchObject({ rating: 5, ratingCount: 1, ratingBreakdown: [0, 0, 0, 0, 1], learners: 1 });

    const other = await signIn({ email: 'tunde@example.com' });
    await other.as.patch(`/me/courses/physics/notes/${note.body.note.id}`, { text: 'Mine now' }).expect(404);
    await as.delete(`/me/courses/physics/notes/${note.body.note.id}`).expect(200);
    expect((await as.get('/me/courses')).body.notes).toEqual({});
    await http().get('/me/courses').expect(401);
  });
});

describe('course video player page', () => {
  it('serves a YouTube player page that may frame YouTube and send its address; bad ids are refused', async () => {
    const res = await http().get('/embed/youtube/ZAqIoDhornk').expect(200);
    expect(res.type).toBe('text/html');
    expect(res.text).toContain('https://www.youtube-nocookie.com/embed/ZAqIoDhornk?');
    expect(res.headers['content-security-policy']).toContain('frame-src https://www.youtube-nocookie.com');
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    await http().get('/embed/youtube/not-a-video"><script>').expect(404);
  });
});
