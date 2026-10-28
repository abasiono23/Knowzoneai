import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

import { EXAM_SUBJECTS, EXAMS, paperFormat, type Exam, type ExamSubject } from '../data/exams.js';

/**
 * Past Questions papers. Each paper is one JSON file in `data/exams/` (shipped with the server, so no
 * database import is needed): AI practice papers made by `scripts/exam-papers.ts`, and licensed real
 * papers added by `scripts/import-exam-papers.ts`. Practice papers have no year; only licensed papers
 * carry the year they were set.
 */
export const Question = z.object({
  n: z.number().int().min(1),
  topic: z.string().min(1).max(120),
  /** A passage the question is about (comprehension, unseen poetry or prose), shown above it. */
  passage: z.string().max(4000).optional(),
  q: z.string().min(1).max(1200),
  options: z.array(z.string().min(1).max(400)).min(4).max(5),
  answer: z.number().int().min(0).max(4),
  explanation: z.string().min(1).max(2000),
});
export type Question = z.infer<typeof Question>;

export const Paper = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    exam: z.enum(EXAMS),
    subject: z.enum(EXAM_SUBJECTS),
    /** The year a licensed paper was set; practice papers have none. */
    year: z.number().int().min(1980).max(2100).nullable(),
    /** Practice papers are numbered 1, 2, 3… per exam and subject. */
    number: z.number().int().min(1).nullable(),
    source: z.enum(['ai', 'licensed']),
    /** Licensed papers: who the rights came from (shown on the paper). */
    credit: z.string().max(200).optional(),
    minutes: z.number().int().min(5).max(240),
    questions: z.array(Question).min(1).max(150),
  })
  .refine((p) => p.questions.every((q) => q.answer < q.options.length), 'An answer points past its options')
  .refine(
    (p) => (p.source === 'licensed' ? p.year !== null : p.year === null && p.number !== null),
    'Practice papers are numbered; licensed papers have a year',
  );
export type Paper = z.infer<typeof Paper>;

function folder() {
  // Works from src/ (tsx, tests) and from dist/src/ (built server), whatever the working folder.
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 6; i++) {
    const d = join(dir, 'data', 'exams');
    if (existsSync(d)) return d;
    dir = dirname(dir);
  }
  return null;
}

let papers: Paper[] | null = null;

/** Every paper, loaded once. A malformed file stops the server: better than serving a broken paper. */
export function allPapers(): Paper[] {
  if (papers) return papers;
  const dir = folder();
  papers = dir
    ? readdirSync(dir)
        .filter((f) => f.endsWith('.json') && !f.startsWith('.'))
        .map((f) => {
          const parsed = Paper.safeParse(JSON.parse(readFileSync(join(dir, f), 'utf8')));
          if (!parsed.success) throw new Error(`data/exams/${f}: ${parsed.error.issues[0]?.message}`);
          return parsed.data;
        })
    : [];
  return papers;
}

/** Tests can put papers in without files. */
export function usePapers(list: Paper[] | null) {
  papers = list;
}

export const paperById = (id: string) => allPapers().find((p) => p.id === id);

/** Newest real years first, then practice papers in order. */
export function papersFor(exam: Exam, subject: ExamSubject) {
  return allPapers()
    .filter((p) => p.exam === exam && p.subject === subject)
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || (a.number ?? 0) - (b.number ?? 0));
}

/**
 * Who may open a paper. Pro opens everything; on Free and Plus, each subject's first practice paper
 * is the free sample (as the plans say: samples on Free and Plus, full papers on Pro).
 */
export function canOpen(plan: 'FREE' | 'PLUS' | 'PRO' | undefined, p: Paper) {
  return plan === 'PRO' || (p.source === 'ai' && p.number === 1);
}

export { paperFormat };
