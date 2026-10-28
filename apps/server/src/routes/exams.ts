import { Router } from 'express';
import { z } from 'zod';

import { EXAM_SUBJECTS, EXAMS, SYLLABUS } from '../data/exams.js';
import { prisma } from '../db.js';
import { AppError, notFound } from '../lib/errors.js';
import { allPapers, canOpen, paperById, papersFor, type Paper } from '../services/exams.js';
import { me, optionalAuth, requireAuth } from '../services/sessions.js';

/**
 * Past Questions (JAMB, WAEC, NECO): browse by exam, subject and paper; open a paper to study it,
 * practise or sit it timed; scores are kept per paper. Papers are files (see services/exams.ts).
 */
export const examsRouter = Router();

const Exam = z.enum(EXAMS);
const Subject = z.enum(EXAM_SUBJECTS);

/** A paper as a list item (no questions). */
const summary = (p: Paper, plan: 'FREE' | 'PLUS' | 'PRO' | undefined) => ({
  id: p.id,
  exam: p.exam,
  subject: p.subject,
  year: p.year,
  number: p.number,
  source: p.source,
  ...(p.credit && { credit: p.credit }),
  minutes: p.minutes,
  questions: p.questions.length,
  locked: !canOpen(plan, p),
});

/** Every exam's subjects with how many papers and which years each has. */
examsRouter.get('/exams', optionalAuth, (_req, res) => {
  const papers = allPapers();
  res.json({
    exams: EXAMS.map((exam) => ({
      id: exam,
      subjects: EXAM_SUBJECTS.map((subject) => {
        const list = papers.filter((p) => p.exam === exam && p.subject === subject);
        return {
          id: subject,
          papers: list.length,
          years: [...new Set(list.flatMap((p) => (p.year ? [p.year] : [])))].sort((a, b) => b - a),
          questions: list.reduce((s, p) => s + p.questions.length, 0),
        };
      }),
    })),
  });
});

examsRouter.use(['/exams/papers', '/exams/papers/*rest', '/me/exams', '/me/exams/*rest'], requireAuth);

function openable(req: Parameters<typeof me>[0], id: string) {
  const user = me(req);
  const p = paperById(id);
  if (!p) throw notFound('Paper not found');
  if (!canOpen(user.plan, p)) throw new AppError(403, 'This paper is part of Knowzone Pro.', 'pro');
  return p;
}

/** The whole paper: every question, its answer and the explanation (study mode shows them all). */
examsRouter.get('/exams/papers/:id', (req, res) => {
  const p = openable(req, String(req.params.id));
  res.json({ paper: { ...summary(p, me(req).plan), questions: p.questions } });
});

/** Hand in a practice or timed sitting: the server marks it and keeps the score. */
examsRouter.post('/exams/papers/:id/attempts', async (req, res) => {
  const p = openable(req, String(req.params.id));
  const body = z
    .object({
      mode: z.enum(['practice', 'timed']),
      answers: z.array(z.number().int().min(-1).max(4)).max(150),
      seconds: z
        .number()
        .int()
        .min(0)
        .max(6 * 3600),
    })
    .parse(req.body);
  const answers = p.questions.map((_, i) => body.answers[i] ?? -1);
  const right = p.questions.map((q, i) => answers[i] === q.answer);
  const score = right.filter(Boolean).length;
  const attempt = await prisma.examAttempt.create({
    data: { userId: me(req).id, paperId: p.id, mode: body.mode, answers, score, total: p.questions.length, seconds: body.seconds },
  });
  // How each syllabus topic went, weakest first.
  const topics = [...new Set(p.questions.map((q) => q.topic))]
    .map((topic) => {
      const idx = p.questions.flatMap((q, i) => (q.topic === topic ? [i] : []));
      return { topic, right: idx.filter((i) => right[i]).length, total: idx.length };
    })
    .sort((a, b) => a.right / a.total - b.right / b.total);
  res.status(201).json({
    attempt: {
      id: attempt.id,
      paperId: p.id,
      mode: attempt.mode,
      score,
      total: attempt.total,
      seconds: attempt.seconds,
      createdAt: attempt.createdAt.getTime(),
    },
    topics,
  });
});

/** The learner's sittings of one paper, newest first. */
examsRouter.get('/me/exams/attempts', async (req, res) => {
  const paperId = z.string().max(80).parse(req.query.paper);
  const rows = await prisma.examAttempt.findMany({ where: { userId: me(req).id, paperId }, orderBy: { createdAt: 'desc' }, take: 20 });
  res.json({
    attempts: rows.map((a) => ({
      id: a.id,
      paperId: a.paperId,
      mode: a.mode,
      score: a.score,
      total: a.total,
      seconds: a.seconds,
      createdAt: a.createdAt.getTime(),
    })),
  });
});

// Last, so /exams/papers/… isn't read as an exam and subject.
/** One subject's papers, with the learner's best score and attempts on each. */
examsRouter.get('/exams/:exam/:subject', optionalAuth, async (req, res) => {
  const exam = Exam.parse(req.params.exam);
  const subject = Subject.parse(req.params.subject);
  const list = papersFor(exam, subject);
  const attempts = req.user
    ? await prisma.examAttempt.groupBy({
        by: ['paperId'],
        where: { userId: req.user.id, paperId: { in: list.map((p) => p.id) } },
        _max: { score: true },
        _count: { _all: true },
      })
    : [];
  res.json({
    exam,
    subject,
    topics: SYLLABUS[subject],
    papers: list.map((p) => {
      const a = attempts.find((x) => x.paperId === p.id);
      return { ...summary(p, req.user?.plan), best: a?._max.score ?? null, attempts: a?._count._all ?? 0 };
    }),
  });
});
