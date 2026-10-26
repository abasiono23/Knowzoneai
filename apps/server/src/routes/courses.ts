import { randomBytes } from 'node:crypto';

import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../db.js';
import type { Course, CourseLesson, CourseModule } from '../generated/prisma/client.js';
import { AppError, notFound } from '../lib/errors.js';
import { recordActivity, requestTimeZone } from '../services/progress.js';
import { confirmReferralIfEligible } from '../services/referrals.js';
import { me, optionalAuth, requireAuth } from '../services/sessions.js';
import { toPublicUser } from '../services/users.js';

export const coursesRouter = Router();

export const PASS_MARK = 0.6;
const LESSON_XP = 10;
const CERTIFICATE_XP = 100;
const CERTIFICATE_COINS = 50;

type Source = { book: string; authors: string; publisher: string; url: string; license: string; licenseUrl: string; attribution: string };
type Question = { id: string; correctIndex: number; options: string[] };

// ─── Catalogue (110–114, 127, 128) ────────────────────────────────────────────

type Outline = Course & { modules: (CourseModule & { lessons: Omit<CourseLesson, 'content'>[] })[] };
let cache: { at: number; body: unknown; version: string } | null = null;
const TTL = 5 * 60_000;

/** The course provider shown on the instructor screen: the textbook's publisher and authors. */
const instructorFor = (c: Course) => {
  const s = c.source as Source;
  return {
    id: `openstax-${c.id}`,
    name: 'OpenStax',
    title: `${s.book} · Rice University`,
    initials: 'OS',
    colors: c.colors,
    location: 'Houston, USA',
    bio: `${s.book} is a free, peer-reviewed textbook by ${s.authors}, published by OpenStax at Rice University. This course is adapted from it under the ${s.license} licence.`,
    highlights: ['Peer-reviewed open textbook', `Licence: ${s.license}`, `Authors: ${s.authors}`],
    years: new Date().getFullYear() - 2012,
    verified: true,
  };
};

/**
 * Every published course with its modules and lesson list (no lesson content), ratings and learner
 * counts, and the provider profiles. Cached for a few minutes; `version` lets the app skip unchanged
 * downloads.
 */
async function catalogue() {
  if (cache && Date.now() - cache.at < TTL) return cache;
  const [courses, ratings, stars, learners] = await Promise.all([
    prisma.course.findMany({
      where: { published: true },
      orderBy: { position: 'asc' },
      include: {
        modules: {
          orderBy: { position: 'asc' },
          include: { lessons: { orderBy: { position: 'asc' }, omit: { content: true } } },
        },
      },
    }) as Promise<Outline[]>,
    prisma.courseRating.groupBy({ by: ['courseId'], _avg: { stars: true }, _count: true }),
    prisma.courseRating.groupBy({ by: ['courseId', 'stars'], _count: true }),
    prisma.courseEnrollment.groupBy({ by: ['courseId'], _count: true }),
  ]);
  /** How many learners gave 1, 2, 3, 4 and 5 stars. */
  const breakdown = (courseId: string) =>
    [1, 2, 3, 4, 5].map((n) => stars.find((s) => s.courseId === courseId && s.stars === n)?._count ?? 0);
  const rating = new Map(ratings.map((r) => [r.courseId, r]));
  const learnerCount = new Map(learners.map((l) => [l.courseId, l._count]));
  const version = String(Math.max(0, ...courses.map((c) => c.updatedAt.getTime())));
  const body = {
    version,
    courses: courses.map((c) => ({
      id: c.id,
      title: c.title,
      subtitle: c.subtitle,
      subjectId: c.subjectId,
      level: c.level,
      instructorId: `openstax-${c.id}`,
      emoji: c.emoji,
      colors: c.colors,
      rating: Math.round((rating.get(c.id)?._avg.stars ?? 0) * 10) / 10,
      ratingCount: rating.get(c.id)?._count ?? 0,
      ratingBreakdown: breakdown(c.id),
      learners: learnerCount.get(c.id) ?? 0,
      description: c.description,
      outcomes: c.outcomes,
      requirements: c.requirements,
      exams: c.exams,
      tags: c.tags,
      featured: c.featured,
      updated: c.updatedAt.toISOString().slice(0, 10),
      source: c.source,
      modules: c.modules.map((m) => ({
        id: m.id.split('/').pop(),
        title: m.title,
        summary: m.summary,
        lessons: m.lessons.map((l) => ({
          id: l.id.split('/').pop(),
          title: l.title,
          kind: l.kind,
          minutes: l.minutes,
          summary: l.summary,
        })),
      })),
    })),
    instructors: courses.map((c) => ({
      ...instructorFor(c),
      students: learnerCount.get(c.id) ?? 0,
      rating: Math.round((rating.get(c.id)?._avg.stars ?? 0) * 10) / 10,
    })),
  };
  cache = { at: Date.now(), body, version };
  return cache;
}

export const invalidateCourses = () => {
  cache = null;
};

coursesRouter.get('/courses', optionalAuth, async (req, res) => {
  const c = await catalogue();
  if (req.query.since === c.version) {
    res.json({ version: c.version, unchanged: true });
    return;
  }
  res.set('Cache-Control', 'public, max-age=60').json(c.body);
});

/** One lesson's content (115–120): reading, video, activities, quiz, key points and resources. */
coursesRouter.get('/courses/:id/lessons/:lessonId', optionalAuth, async (req, res) => {
  const l = await prisma.courseLesson.findUnique({ where: { id: `${req.params.id}/${req.params.lessonId}` } });
  if (!l) throw notFound('Lesson not found');
  res.set('Cache-Control', 'public, max-age=300').json({ content: l.content });
});

/** Anyone can check a certificate is real (125). */
coursesRouter.get('/certificates/:id', async (req, res) => {
  const cert = await prisma.certificate.findUnique({ where: { id: String(req.params.id) } });
  if (!cert) throw notFound('Certificate not found');
  const course = await prisma.course.findUnique({ where: { id: cert.courseId }, select: { title: true } });
  res.json({
    certificate: { id: cert.id, name: cert.name, course: course?.title ?? cert.courseId, score: cert.score, issuedAt: cert.issuedAt.getTime() },
  });
});

// ─── The learner's progress (114–126) ─────────────────────────────────────────

coursesRouter.use(['/me/courses', '/me/courses/*rest'], requireAuth);

const ms = (d: Date) => d.getTime();

/** Everything the course store keeps: enrolments, finished lessons, quiz attempts, notes, ratings, certificates. */
async function progressOf(userId: string) {
  const [enrolments, done, attempts, notes, ratings, certificates] = await Promise.all([
    prisma.courseEnrollment.findMany({ where: { userId } }),
    prisma.lessonCompletion.findMany({ where: { userId } }),
    prisma.courseQuizAttempt.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
    prisma.courseNote.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.courseRating.findMany({ where: { userId } }),
    prisma.certificate.findMany({ where: { userId } }),
  ]);
  const group = <T,>(rows: T[], key: (r: T) => string) =>
    rows.reduce<Record<string, T[]>>((acc, r) => ((acc[key(r)] ??= []).push(r), acc), {});
  return {
    enrolled: Object.fromEntries(enrolments.map((e) => [e.courseId, ms(e.enrolledAt)])),
    done: Object.fromEntries(done.map((d) => [d.lessonId, ms(d.completedAt)])),
    last: Object.fromEntries(enrolments.filter((e) => e.lastLessonId).map((e) => [e.courseId, e.lastLessonId!])),
    attempts: Object.fromEntries(
      Object.entries(group(attempts, (a) => a.lessonId)).map(([k, list]) => [
        k,
        list.map((a) => ({ id: a.id, at: ms(a.createdAt), answers: a.answers, score: a.score, total: a.total, seconds: a.seconds })),
      ]),
    ),
    notes: Object.fromEntries(
      Object.entries(group(notes, (n) => n.lessonId)).map(([k, list]) => [
        k,
        list.map((n) => ({ id: n.id, text: n.text, at: ms(n.updatedAt), ...(n.quote && { quote: n.quote }) })),
      ]),
    ),
    ratings: Object.fromEntries(ratings.map((r) => [r.courseId, { stars: r.stars, tags: r.tags, text: r.text, at: ms(r.updatedAt) }])),
    certificates: Object.fromEntries(
      certificates.map((c) => [c.courseId, { id: c.id, issuedAt: ms(c.issuedAt), name: c.name, score: c.score }]),
    ),
    saved: enrolments.filter((e) => e.saved).map((e) => e.courseId),
    minutes: Object.fromEntries(enrolments.map((e) => [e.courseId, e.minutes])),
  };
}

coursesRouter.get('/me/courses', async (req, res) => {
  res.json(await progressOf(me(req).id));
});

async function ownCourse(id: string) {
  const c = await prisma.course.findUnique({ where: { id }, select: { id: true } });
  if (!c) throw notFound('Course not found');
  return c.id;
}

const enrol = (userId: string, courseId: string) =>
  prisma.courseEnrollment.upsert({ where: { userId_courseId: { userId, courseId } }, create: { userId, courseId }, update: {} });

coursesRouter.post('/me/courses/:id/enroll', async (req, res) => {
  await enrol(me(req).id, await ownCourse(String(req.params.id)));
  res.json({ ok: true });
});

coursesRouter.put('/me/courses/:id/save', async (req, res) => {
  const userId = me(req).id;
  const courseId = await ownCourse(String(req.params.id));
  const { saved } = z.object({ saved: z.boolean() }).parse(req.body);
  await prisma.courseEnrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId, saved },
    update: { saved },
  });
  res.json({ saved });
});

/** Opening a lesson (114) enrols the learner and remembers where they are. */
coursesRouter.post('/me/courses/:id/open', async (req, res) => {
  const userId = me(req).id;
  const courseId = await ownCourse(String(req.params.id));
  const { lessonId } = z.object({ lessonId: z.string().max(60) }).parse(req.body);
  await prisma.courseEnrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId, lastLessonId: lessonId },
    update: { lastLessonId: lessonId },
  });
  res.json({ ok: true });
});

/**
 * Marks a lesson done (10 XP) and, when it's the course's last, issues the certificate (125):
 * every lesson done and every quiz passed. Returns what changed.
 */
async function finishLesson(userId: string, courseId: string, lessonId: string, minutes: number) {
  const key = `${courseId}/${lessonId}`;
  const created = await prisma.lessonCompletion
    .create({ data: { userId, courseId, lessonId: key } })
    .then(() => true)
    .catch(() => false); // Already done.
  if (!created) return { certificate: null, xp: 0, coins: 0 };
  await prisma.courseEnrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId, minutes },
    update: { minutes: { increment: minutes } },
  });
  let xp = LESSON_XP;
  let coins = 0;

  const [total, done] = await Promise.all([
    prisma.courseLesson.count({ where: { courseId } }),
    prisma.lessonCompletion.count({ where: { userId, courseId } }),
  ]);
  let certificate = null;
  if (total > 0 && done >= total && !(await prisma.certificate.findUnique({ where: { userId_courseId: { userId, courseId } } }))) {
    const quizzes = await prisma.courseLesson.findMany({ where: { courseId, kind: 'quiz' }, select: { id: true } });
    const attempts = await prisma.courseQuizAttempt.findMany({ where: { userId, courseId } });
    const best = quizzes.map((q) => Math.max(0, ...attempts.filter((a) => a.lessonId === q.id).map((a) => a.score / a.total)));
    const score = best.length ? best.reduce((n, b) => n + b, 0) / best.length : 1;
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true } });
    const c = await prisma.certificate
      .create({
        data: { id: `KZ-${courseId.slice(0, 3).toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}`, userId, courseId, name: user.name, score },
      })
      .catch(() => null);
    if (c) {
      certificate = { id: c.id, issuedAt: ms(c.issuedAt), name: c.name, score: c.score };
      xp += CERTIFICATE_XP;
      coins += CERTIFICATE_COINS;
    }
  }
  return { certificate, xp, coins };
}

async function lessonOf(courseId: string, lessonId: string) {
  const l = await prisma.courseLesson.findUnique({ where: { id: `${courseId}/${lessonId}` } });
  if (!l) throw notFound('Lesson not found');
  return l;
}

/** Finishing a reading, video or interactive lesson. Quizzes are finished by passing them. */
coursesRouter.post('/me/courses/:id/lessons/:lessonId/complete', async (req, res) => {
  const userId = me(req).id;
  const courseId = String(req.params.id);
  const lesson = await lessonOf(courseId, String(req.params.lessonId));
  if (lesson.kind === 'quiz') throw new AppError(400, 'Pass the quiz to finish this lesson', 'quiz');
  const out = await finishLesson(userId, courseId, String(req.params.lessonId), lesson.minutes);
  const user = out.xp
    ? await recordActivity(userId, { xp: out.xp, coins: out.coins, minutes: lesson.minutes }, { reason: out.certificate ? `course:${courseId}` : `course-lesson:${courseId}/${req.params.lessonId}`, tz: requestTimeZone(req) })
    : null;
  if (out.xp) await confirmReferralIfEligible(userId);
  res.json({ certificate: out.certificate, ...(user && { user: toPublicUser(user) }) });
});

const Attempt = z.object({ answers: z.array(z.number().int().min(-1).max(10)).min(1).max(100), seconds: z.number().int().min(0).max(24 * 3600).default(0) });

/** A lesson quiz (120–122), marked by the server. Passing (60%) finishes the lesson. */
coursesRouter.post('/me/courses/:id/lessons/:lessonId/attempts', async (req, res) => {
  const userId = me(req).id;
  const courseId = String(req.params.id);
  const lessonId = String(req.params.lessonId);
  const lesson = await lessonOf(courseId, lessonId);
  const quiz = ((lesson.content as { quiz?: Question[] }).quiz ?? []) as Question[];
  if (lesson.kind !== 'quiz' || !quiz.length) throw new AppError(400, 'This lesson has no quiz', 'invalid');
  const { answers, seconds } = Attempt.parse(req.body);
  if (answers.length !== quiz.length) throw new AppError(400, 'One answer per question', 'invalid');
  const score = quiz.filter((q, i) => answers[i] === q.correctIndex).length;
  await enrol(userId, courseId);
  const attempt = await prisma.courseQuizAttempt.create({
    data: { userId, courseId, lessonId: lesson.id, answers, score, total: quiz.length, seconds },
  });
  const passed = score / quiz.length >= PASS_MARK;
  const out = passed ? await finishLesson(userId, courseId, lessonId, lesson.minutes) : { certificate: null, xp: 0, coins: 0 };
  const user = out.xp
    ? await recordActivity(
        userId,
        { xp: out.xp, coins: out.coins, minutes: Math.max(1, seconds / 60) },
        { reason: out.certificate ? `course:${courseId}` : `course-lesson:${courseId}/${lessonId}`, tz: requestTimeZone(req) },
      )
    : null;
  if (out.xp) await confirmReferralIfEligible(userId);
  res.status(201).json({
    attempt: { id: attempt.id, at: ms(attempt.createdAt), answers, score, total: quiz.length, seconds },
    passed,
    certificate: out.certificate,
    ...(user && { user: toPublicUser(user) }),
  });
});

// ─── Notes and ratings (119, 126) ─────────────────────────────────────────────

const NoteInput = z.object({ text: z.string().trim().min(1).max(5000), quote: z.string().max(1000).optional() });

coursesRouter.post('/me/courses/:id/lessons/:lessonId/notes', async (req, res) => {
  const courseId = String(req.params.id);
  const lesson = await lessonOf(courseId, String(req.params.lessonId));
  const { text, quote } = NoteInput.parse(req.body);
  const note = await prisma.courseNote.create({ data: { userId: me(req).id, courseId, lessonId: lesson.id, text, quote } });
  res.status(201).json({ note: { id: note.id, text, at: ms(note.updatedAt), ...(quote && { quote }) } });
});

coursesRouter.patch('/me/courses/:id/notes/:noteId', async (req, res) => {
  const { text } = NoteInput.pick({ text: true }).parse(req.body);
  const { count } = await prisma.courseNote.updateMany({ where: { id: String(req.params.noteId), userId: me(req).id }, data: { text } });
  if (!count) throw notFound('Note not found');
  res.json({ ok: true });
});

coursesRouter.delete('/me/courses/:id/notes/:noteId', async (req, res) => {
  await prisma.courseNote.deleteMany({ where: { id: String(req.params.noteId), userId: me(req).id } });
  res.json({ ok: true });
});

const RatingInput = z.object({
  stars: z.number().int().min(1).max(5),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  text: z.string().trim().max(2000).default(''),
});

/** Rating and feedback (126); one per learner per course, editable. */
coursesRouter.put('/me/courses/:id/rating', async (req, res) => {
  const userId = me(req).id;
  const courseId = await ownCourse(String(req.params.id));
  const input = RatingInput.parse(req.body);
  await prisma.courseRating.upsert({ where: { userId_courseId: { userId, courseId } }, create: { userId, courseId, ...input }, update: input });
  invalidateCourses();
  res.json({ ok: true });
});
