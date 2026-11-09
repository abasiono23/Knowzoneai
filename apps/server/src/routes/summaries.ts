import { Router } from 'express';
import { z } from 'zod';

import { notFound } from '../lib/errors.js';
import { country } from '../services/books.js';
import { requestLanguage } from '../services/language.js';
import { courseSummaries, summariesFor, summaryFor } from '../services/summaries.js';

/** Summaries on a school subject's shelf. Public, like the shelves themselves. */
export const summariesRouter = Router();

const Query = z.object({ level: z.string().optional() });

/** The subject's course summary and topic list, with the topics for the student's class first. */
summariesRouter.get('/books/countries/:country/subjects/:subject/summaries', (req, res) => {
  const { level } = Query.parse(req.query);
  const stage = country(String(req.params.country)).levels.find((l) => l.id === level)?.stage;
  res.json(summariesFor(String(req.params.subject), stage, requestLanguage(req)));
});

/** A university, polytechnic or college course's summary and topic list, with the student's stage first. */
const CourseQuery = z.object({ stage: z.string().max(20).optional() });
summariesRouter.get('/books/courses/:course/summaries', (req, res) => {
  const { stage } = CourseQuery.parse(req.query);
  res.json(courseSummaries(String(req.params.course), stage, requestLanguage(req)));
});

const One = z.object({ lang: z.literal('en').optional() });

/** One summary to read. `?lang=en` is the Read in English button on translations still being reviewed. */
summariesRouter.get('/books/summaries/:library/:topic', (req, res) => {
  const { lang } = One.parse(req.query);
  const summary = summaryFor(String(req.params.library), String(req.params.topic), lang ?? requestLanguage(req));
  if (!summary) throw notFound('Summary not found');
  res.json({ summary });
});
