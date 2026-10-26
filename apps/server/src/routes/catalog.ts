import { Router } from 'express';
import { z } from 'zod';

import { notFound } from '../lib/errors.js';
import { catalogFor, searchCatalog, trendingIn } from '../services/catalog.js';
import { requestLanguage } from '../services/language.js';
import { optionalAuth } from '../services/sessions.js';

export const catalogRouter = Router();

/**
 * The whole catalogue (categories, subjects, lessons) in the reader's language. It's small, so the
 * app downloads it once per language and runs Explore, Subject pages and lesson lists from it.
 * `version` changes when content changes; the app can send it back as ?since= to skip the download.
 */
catalogRouter.get('/catalog', optionalAuth, async (req, res) => {
  const catalog = await catalogFor(requestLanguage(req));
  if (req.query.since === catalog.version) {
    res.json({ version: catalog.version, unchanged: true });
    return;
  }
  res.set('Cache-Control', 'public, max-age=60').json(catalog);
});

catalogRouter.get('/subjects/:id', optionalAuth, async (req, res) => {
  const c = await catalogFor(requestLanguage(req));
  const subject = c.subjects.find((s) => s.id === req.params.id);
  if (!subject) throw notFound('Subject not found');
  res.json({
    subject,
    category: c.categories.find((x) => x.id === subject.category) ?? null,
    lessons: c.lessons.filter((l) => l.subjectId === subject.id),
  });
});

catalogRouter.get('/lessons/:id', optionalAuth, async (req, res) => {
  const c = await catalogFor(requestLanguage(req));
  const lesson = c.lessons.find((l) => l.id === req.params.id);
  if (!lesson) throw notFound('Lesson not found');
  res.json({ lesson, subject: c.subjects.find((s) => s.id === lesson.subjectId) ?? null });
});

const Trending = z.object({
  subject: z.string().max(60).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

catalogRouter.get('/trending', optionalAuth, async (req, res) => {
  const { subject, limit } = Trending.parse(req.query);
  res.json({ lessons: trendingIn(await catalogFor(requestLanguage(req)), subject, limit) });
});

const Search = z.object({ q: z.string().trim().max(100).default('') });

/** Search results (35, 36). Saving the query to the learner's history is a separate call. */
catalogRouter.get('/search', optionalAuth, async (req, res) => {
  const { q } = Search.parse(req.query);
  res.json({ query: q, ...(await searchCatalog(requestLanguage(req), q)) });
});
