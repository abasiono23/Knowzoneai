import { Router } from 'express';
import { z } from 'zod';

import { notFound } from '../lib/errors.js';
import { booksFor, CLASSES, STREAMS, subjectsFor } from '../services/books.js';

/**
 * "Check out your books" (secondary school): the subjects for a class and stream, with how many
 * textbooks each has, and a subject's textbooks. Public: the list is the same for everyone.
 */
export const booksRouter = Router();

const Query = z.object({ class: z.enum(CLASSES), stream: z.enum(STREAMS).optional() });

booksRouter.get('/books/secondary', (req, res) => {
  const q = Query.parse(req.query);
  res.json({
    subjects: subjectsFor(q.class, q.stream).map((id) => {
      const list = booksFor(id, q.class);
      return { id, books: list.length, free: list.filter((b) => b.free).length };
    }),
  });
});

booksRouter.get('/books/secondary/:subject', (req, res) => {
  const q = Query.parse(req.query);
  const subject = String(req.params.subject);
  if (!subjectsFor(q.class).includes(subject)) throw notFound('Subject not found');
  res.json({
    subject,
    books: booksFor(subject, q.class).map(({ sources: _sources, notes: _notes, placements, ...b }) => ({
      ...b,
      classes: placements.find((p) => p.subject === subject)!.classes,
    })),
  });
});
