import { Router } from 'express';
import { z } from 'zod';

import { notFound } from '../lib/errors.js';
import { country } from '../services/books.js';
import { catalogFor } from '../services/catalog.js';
import { requestLanguage } from '../services/language.js';
import { videoTopic, videosFor } from '../services/subject-videos.js';

/** Videos on a school subject's shelf. Public, like the shelves themselves. */
export const subjectVideosRouter = Router();

const Query = z.object({ level: z.string().optional() });

/** The subject's videos and flashcard lessons by topic, with the topics for the student's class first. */
subjectVideosRouter.get('/books/countries/:country/subjects/:subject/videos', async (req, res) => {
  const { level } = Query.parse(req.query);
  const stage = country(String(req.params.country)).levels.find((l) => l.id === level)?.stage;
  const lang = requestLanguage(req);
  const found = videosFor(String(req.params.subject), stage, lang);
  // Flashcard lessons come from the catalog, with their titles in the reader's language.
  const lessons = found.topics.some((t) => t.flashcards.length) ? (await catalogFor(lang)).lessons : [];
  res.json({
    ...found,
    topics: found.topics.map((t) => ({
      ...t,
      flashcards: t.flashcards.flatMap((id) => {
        const l = lessons.find((x) => x.id === id);
        return l ? [{ id, title: l.title, cover: l.cover }] : [];
      }),
    })),
  });
});

/** One topic's videos. */
subjectVideosRouter.get('/books/videos/:library/:topic', (req, res) => {
  const topic = videoTopic(String(req.params.library), String(req.params.topic), requestLanguage(req));
  if (!topic) throw notFound('Topic not found');
  res.json({ topic });
});
