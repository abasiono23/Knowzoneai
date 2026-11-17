import { Router } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { z } from 'zod';

import { createReadStream, existsSync } from 'node:fs';
import { join } from 'node:path';

import { isRegion } from '../data/exams.js';
import { notFound } from '../lib/errors.js';
import { catalogFor, searchCatalog, trendingIn } from '../services/catalog.js';
import { searchEverything } from '../services/search-all.js';
import { SEARCH_KINDS, type SearchKind } from '../services/search-index.js';
import { smartSearch } from '../services/semantic-search.js';
import { deckFor, lessonCardsFolder, lessonDecks } from '../services/lesson-cards.js';
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

/** A flashcard lesson's cards and end-of-lesson quiz, in the reader's language. */
catalogRouter.get('/lessons/:id/cards', optionalAuth, (req, res) => {
  const deck = lessonDecks().get(String(req.params.id));
  if (!deck) throw notFound('This lesson has no flashcards yet');
  res.json({ lesson: deckFor(deck, requestLanguage(req)) });
});

/** A card's picture or narration. */
catalogRouter.get('/lessons/media/:file', (req, res) => {
  const file = String(req.params.file);
  const m = file.match(/^([a-z0-9-]+)-(\d{1,2})\.(webp|mp3)$/);
  const dir = lessonCardsFolder();
  if (!m || !dir) throw notFound('Not found');
  const path = join(dir, m[3] === 'webp' ? 'img' : 'audio', file);
  if (!existsSync(path)) throw notFound('Not found');
  res.set({
    'Content-Type': m[3] === 'webp' ? 'image/webp' : 'audio/mpeg',
    'Cache-Control': 'public, max-age=604800, immutable',
    // The app on the web loads these from another origin.
    'Cross-Origin-Resource-Policy': 'cross-origin',
  });
  createReadStream(path).pipe(res);
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
/** The dashboard's search: everything beyond lessons, subjects and topics. */
catalogRouter.get('/search/all', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.slice(0, 80) : '';
  const country = typeof req.query.country === 'string' ? req.query.country : undefined;
  const region = typeof req.query.region === 'string' && isRegion(req.query.region) ? req.query.region : undefined;
  res.json(await searchEverything(requestLanguage(req), q, country, region));
});

// Each smart search asks Vultr for one embedding: cheap, but not free, and open to people not signed in.
const smartLimiter = rateLimit({
  windowMs: 60_000,
  limit: 40,
  keyGenerator: (req) => req.userId ?? ipKeyGenerator(req.ip ?? ''),
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'Slow down a little — try again in a minute.', reason: 'rate-limited' },
});

const Smart = z.object({
  q: z.string().trim().max(200).default(''),
  /** `notes,questions,books`, or any of them. All three when left out. */
  kinds: z
    .string()
    .optional()
    .transform((k) => (k ?? '').split(',').filter((x): x is SearchKind => (SEARCH_KINDS as string[]).includes(x))),
  limit: z.coerce.number().int().min(1).max(30).default(12),
  country: z.string().max(10).optional(),
});

/**
 * Smart search: notes, practice questions and books by meaning as well as by words, best first, each
 * with the app link that opens it. `semantic` is false when only words were used (no index or key yet).
 */
catalogRouter.get('/search/semantic', optionalAuth, smartLimiter, async (req, res) => {
  const { q, kinds, limit, country } = Smart.parse(req.query);
  const region = typeof req.query.region === 'string' && isRegion(req.query.region) ? req.query.region : undefined;
  const found = await smartSearch({ q, kinds, limit, country, region, lang: requestLanguage(req), userId: req.user?.id });
  res.json({ query: q, ...found });
});

catalogRouter.get('/search', optionalAuth, async (req, res) => {
  const { q } = Search.parse(req.query);
  res.json({ query: q, ...(await searchCatalog(requestLanguage(req), q)) });
});
