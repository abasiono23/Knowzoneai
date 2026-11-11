import { Router, type NextFunction, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { z } from 'zod';

import { prisma } from '../db.js';
import { Prisma, type Textbook } from '../generated/prisma/client.js';
import { AppError, notFound } from '../lib/errors.js';
import { me, requireAuth } from '../services/sessions.js';
import { findTopic, listTopics, readTextbook, TextbookError, type Bookmark, type Topic } from '../services/textbooks.js';

export const textbooksRouter = Router();
textbooksRouter.use(['/textbooks', '/textbooks/*rest'], requireAuth);

/** A book still "reading" this long after its last update was interrupted (e.g. a server restart). */
const STALE_MS = 15 * 60_000;
/** Textbooks are big. */
const MAX_FILE = 60 * 1024 * 1024;

// Each upload costs one AI call: a per-minute cap, like study packs.
const aiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 6,
  keyGenerator: (req) => req.userId ?? 'anon',
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'Slow down a little — try again in a minute.', reason: 'rate-limited' },
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_FILE } });
/** The PDF, with a clear answer (not a 500) when it's over the size limit. */
const uploadPdf = (req: Request, res: Response, next: NextFunction) =>
  upload.single('file')(req, res, (err?: unknown) =>
    next(
      (err as { code?: string } | undefined)?.code === 'LIMIT_FILE_SIZE'
        ? new AppError(413, 'That PDF is too big — textbooks up to 60 MB work', 'file-too-large')
        : err,
    ),
  );

// ─── Shapes the app reads ─────────────────────────────────────────────────────

/** Everything but the page texts, which can be megabytes. */
const select = {
  id: true,
  userId: true,
  title: true,
  fileName: true,
  pageCount: true,
  status: true,
  error: true,
  topics: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TextbookSelect;
type Summary = Omit<Textbook, 'pages'>;

function toPublicTextbook(t: Summary) {
  return {
    id: t.id,
    title: t.title,
    fileName: t.fileName,
    pageCount: t.pageCount,
    status: t.status,
    ...(t.error && { error: t.error as { code: string; retryable: boolean } }),
    topics: t.topics as Topic[],
    createdAt: t.createdAt.getTime(),
  };
}

async function ownTextbook(id: string, userId: string) {
  const t = await prisma.textbook.findFirst({ where: { id, userId }, select });
  if (!t) throw notFound('Textbook not found');
  return failIfStale(t);
}

// ─── Processing ───────────────────────────────────────────────────────────────

async function fail(id: string, code: TextbookError['code'], retryable: boolean) {
  await prisma.textbook.updateMany({ where: { id }, data: { status: 'failed', error: { code, retryable } } });
}

/**
 * A reading interrupted by a restart is shown as failed instead of spinning forever. The PDF isn't
 * kept, so it can only be retried if its pages were already read; otherwise the app asks for it again.
 */
async function failIfStale(t: Summary): Promise<Summary> {
  if (t.status !== 'reading' || Date.now() - t.updatedAt.getTime() < STALE_MS) return t;
  await fail(t.id, 'ai-failed', t.pageCount > 0);
  return prisma.textbook.findUniqueOrThrow({ where: { id: t.id }, select });
}

/**
 * Reads every page (when the PDF is given) and lists the topics. Runs after the request has been
 * answered; the app follows along by polling. A retry has no file: it lists the stored pages again.
 */
export async function processTextbook(id: string, file?: Buffer) {
  try {
    let book = await prisma.textbook.findUnique({ where: { id } });
    if (!book) return;
    let bookmarks: Bookmark[] = [];
    if (file) {
      const read = await readTextbook(file);
      bookmarks = read.bookmarks;
      // Deleted while it was being read: nothing to save.
      const saved = await prisma.textbook.updateMany({ where: { id }, data: { pages: read.pages, pageCount: read.pages.length } });
      if (!saved.count) return;
      book = { ...book, pages: read.pages };
    }
    if (!book.pages.length) throw new TextbookError('unreadable-file', false);
    const topics = await listTopics(book.userId, book.title, book.pages, bookmarks);
    await prisma.textbook.updateMany({ where: { id }, data: { status: 'ready', topics, error: Prisma.DbNull } });
  } catch (err) {
    if (err instanceof TextbookError) return fail(id, err.code, err.retryable);
    console.error('Textbook failed', id, err);
    return fail(id, 'ai-failed', true);
  }
}

const startProcessing = (id: string, file?: Buffer) => {
  processTextbook(id, file).catch((e) => console.error('Textbook crashed', id, e));
};

// ─── Routes ───────────────────────────────────────────────────────────────────

const TextbookId = z.string().regex(/^[A-Za-z0-9_-]{6,40}$/, 'Invalid id');
const Create = z.object({ title: z.string().trim().max(120).optional() });

/**
 * Upload a textbook: multipart with `file` (a PDF) and an optional `title`. Answers 202 at once;
 * the pages are read and the topics listed in the background. Poll GET /textbooks/:id.
 */
textbooksRouter.post('/textbooks/:id', aiLimiter, uploadPdf, async (req, res) => {
  const user = me(req);
  const id = TextbookId.parse(req.params.id);
  const input = Create.parse(req.body);
  if (await prisma.textbook.findUnique({ where: { id }, select: { id: true } }))
    throw new AppError(409, 'This textbook already exists', 'exists');
  const file = req.file;
  if (!file) throw new AppError(400, 'Choose a PDF to upload', 'invalid');
  if (file.mimetype !== 'application/pdf' && !/\.pdf$/i.test(file.originalname))
    throw new AppError(415, 'Upload the textbook as a PDF', 'unsupported-file');
  const fileName = file.originalname.slice(0, 120);
  const created = await prisma.textbook.create({
    data: { id, userId: user.id, title: input.title || fileName.replace(/\.pdf$/i, '').trim() || 'Textbook', fileName },
    select,
  });
  // Only the page texts are kept: the file lives just long enough to be read.
  startProcessing(id, file.buffer);
  res.status(202).json({ textbook: toPublicTextbook(created) });
});

/** My textbooks, newest first, without their page texts. */
textbooksRouter.get('/textbooks', async (req, res) => {
  const books = await prisma.textbook.findMany({ where: { userId: me(req).id }, orderBy: { createdAt: 'desc' }, select });
  const fresh = await Promise.all(books.map(failIfStale));
  res.json({ textbooks: fresh.map(toPublicTextbook) });
});

textbooksRouter.get('/textbooks/:id', async (req, res) => {
  res.json({ textbook: toPublicTextbook(await ownTextbook(String(req.params.id), me(req).id)) });
});

/** Lists the topics again after a failure. Needs the pages: if reading failed, the PDF must be uploaded again. */
textbooksRouter.post('/textbooks/:id/retry', aiLimiter, async (req, res) => {
  const t = await ownTextbook(String(req.params.id), me(req).id);
  if (t.status !== 'failed') throw new AppError(409, 'This textbook can’t be retried', 'not-retryable');
  if (!t.pageCount) throw new AppError(409, 'Upload the PDF again to try once more', 'reupload');
  const updated = await prisma.textbook.update({ where: { id: t.id }, data: { status: 'reading', error: Prisma.DbNull }, select });
  startProcessing(t.id);
  res.status(202).json({ textbook: toPublicTextbook(updated) });
});

textbooksRouter.delete('/textbooks/:id', async (req, res) => {
  await prisma.textbook.deleteMany({ where: { id: String(req.params.id), userId: me(req).id } });
  res.json({ ok: true });
});

const Find = z.object({ topic: z.string().trim().min(1).max(200) });

/** Where a topic is in the book (a listed one, or one the learner typed), so the app can say "Found on pages 45–52". */
textbooksRouter.get('/textbooks/:id/find', async (req, res) => {
  const { topic } = Find.parse(req.query);
  const book = await prisma.textbook.findFirst({ where: { id: String(req.params.id), userId: me(req).id } });
  if (!book) throw notFound('Textbook not found');
  if (!book.pages.length) throw new AppError(409, 'This textbook is still being read', 'not-ready');
  const found = findTopic({ pages: book.pages, topics: book.topics as Topic[] }, topic);
  if (!found) throw new AppError(404, 'That topic wasn’t found in this textbook', 'topic-not-found');
  res.json({ topic: found });
});
