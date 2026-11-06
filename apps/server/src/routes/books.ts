import { Router, type Response } from 'express';
import { z } from 'zod';

import { notFound } from '../lib/errors.js';
import {
  allCountries,
  booksFor,
  country,
  courseBooksFor,
  streamsFor,
  subjectsFor,
  visibleBooks,
  type Country,
} from '../services/books.js';

/**
 * "Check out your books" (secondary school): a country's classes and streams (for the questions),
 * the subjects for a class and stream with how many textbooks each has, and a subject's textbooks.
 * Public: the lists are the same for everyone.
 */
export const booksRouter = Router();

const Query = z.object({ level: z.string(), stream: z.string().optional() });

function shelves(res: Response, c: Country, level: string, stream?: string) {
  if (!c.levels.some((l) => l.id === level)) throw notFound('Class not found');
  res.json({
    subjects: subjectsFor(c, level, stream).map((s) => {
      const list = booksFor(c, s.id, level);
      return {
        id: s.id,
        name: s.name,
        books: list.length,
        free: list.filter((b) => b.free).length,
      };
    }),
  });
}

function subject(res: Response, c: Country, id: string, level: string) {
  const s = c.subjects.find((x) => x.id === id && x.levels.includes(level));
  if (!s) throw notFound('Subject not found');
  const books = booksFor(c, id, level).map(({ sources: _s, notes: _n, countryOnly: _c, placements, ...b }) => ({
    ...b,
    levels: placements.find((p) => p.subject === id)!.levels,
  }));
  // `classes`: what app versions before countries read.
  res.json({
    subject: id,
    name: s.name,
    books: books.map((b) => ({ ...b, classes: b.levels })),
  });
}

/** Which countries have their own books, and how many. */
booksRouter.get('/books/countries', (_req, res) => {
  res.json({
    countries: [...allCountries().values()].map((c) => {
      const books = visibleBooks(c.books);
      return { id: c.country, name: c.name, books: books.length, free: books.filter((b) => b.free).length };
    }),
  });
});

/** A country's classes, and the streams students choose from in each. */
booksRouter.get('/books/countries/:country', (req, res) => {
  const c = country(String(req.params.country));
  res.json({
    country: c.country,
    name: c.name,
    levels: c.levels.map((l) => ({
      ...l,
      streams: streamsFor(c, l.id).map(({ id, name }) => ({ id, name })),
    })),
  });
});

// The first app versions (Nigeria only) used ?class= and these paths.
const Legacy = z.object({ class: z.string(), stream: z.string().optional() });
booksRouter.get('/books/secondary', (req, res) => {
  const q = Legacy.parse(req.query);
  shelves(res, country('ng'), q.class, q.stream);
});
booksRouter.get('/books/secondary/:subject', (req, res) => {
  subject(res, country('ng'), String(req.params.subject), Legacy.parse(req.query).class);
});

booksRouter.get('/books/countries/:country/shelves', (req, res) => {
  const q = Query.parse(req.query);
  shelves(res, country(String(req.params.country)), q.level, q.stream);
});
booksRouter.get('/books/countries/:country/subjects/:subject', (req, res) => {
  subject(res, country(String(req.params.country)), String(req.params.subject), Query.parse(req.query).level);
});

/**
 * A university, polytechnic or college course's textbooks (the same in every country), ordered for
 * the student's stage. Unknown courses (typed in by the student) simply have none yet.
 */
const CourseQuery = z.object({ stage: z.string().optional() });
booksRouter.get('/books/courses/:course', (req, res) => {
  const course = String(req.params.course);
  const books = courseBooksFor(course, CourseQuery.parse(req.query).stage).map(
    ({ book: { sources: _s, notes: _n, placements: _p, ...b }, levels }) => ({
      ...b,
      levels,
    }),
  );
  res.json({ course, books, free: books.filter((b) => b.free).length });
});
