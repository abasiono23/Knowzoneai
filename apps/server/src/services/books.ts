import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

/**
 * Textbooks for "Check out your books". Secondary school first (JSS 1 to SS 3): each subject's
 * prescribed textbooks (paid, bought later in the app) and free, openly licensed full textbooks
 * (read online). The list lives in `data/books/secondary.json`, shipped with the server, so it can
 * be corrected without an app update. Every book carries the sources it was checked against.
 */
export const CLASSES = ['jss1', 'jss2', 'jss3', 'ss1', 'ss2', 'ss3'] as const;
export const STREAMS = ['science', 'arts', 'commercial'] as const;
export type SchoolClass = (typeof CLASSES)[number];
export type Stream = (typeof STREAMS)[number];

/** Which subjects each student sees. */
export const SUBJECTS = {
  jss: [
    'english',
    'mathematics',
    'basic-science',
    'basic-technology',
    'social-studies',
    'civic-education',
    'business-studies',
    'agricultural-science',
    'home-economics',
    'computer-studies',
    'cultural-creative-arts',
    'physical-health-education',
    'history',
    'crs',
    'irs',
    'french',
    'yoruba',
    'igbo',
    'hausa',
  ],
  ssCore: ['english', 'mathematics', 'civic-education', 'data-processing'],
  science: ['physics', 'chemistry', 'biology', 'further-mathematics', 'agricultural-science', 'geography', 'technical-drawing'],
  arts: ['literature', 'government', 'history', 'crs', 'irs', 'economics', 'geography', 'fine-arts', 'french', 'yoruba', 'igbo', 'hausa'],
  commercial: ['economics', 'commerce', 'financial-accounting', 'office-practice', 'marketing', 'government', 'geography'],
} as const;

export const subjectsFor = (schoolClass: SchoolClass, stream?: Stream): string[] => {
  if (schoolClass.startsWith('jss')) return [...SUBJECTS.jss];
  return [...SUBJECTS.ssCore, ...(stream ? SUBJECTS[stream] : [...SUBJECTS.science, ...SUBJECTS.arts, ...SUBJECTS.commercial])].filter(
    (s, i, all) => all.indexOf(s) === i,
  );
};

const Book = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  series: z.string().nullable().optional(),
  authors: z.array(z.string()),
  publisher: z.string().min(1),
  edition: z.string().nullable().optional(),
  year: z.number().int().nullable().optional(),
  isbn: z.string().nullable().optional(),
  cover: z.string().url().nullable().optional(),
  /** Free, openly licensed books are read online; the others are bought in the app later. */
  free: z.boolean(),
  readUrl: z.string().url().nullable().optional(),
  /** The official file to save in the app for offline reading (free books), and its size. */
  downloadUrl: z.string().url().nullable().optional(),
  downloadType: z.enum(['pdf', 'html']).nullable().optional(),
  downloadBytes: z.number().int().nullable().optional(),
  provider: z.string().nullable().optional(),
  license: z.string().nullable().optional(),
  /** Which subjects and classes the book is for. */
  placements: z.array(z.object({ subject: z.string(), classes: z.array(z.enum(CLASSES)).min(1) })).min(1),
  sources: z.array(z.string().url()).min(1),
  notes: z.string().nullable().optional(),
});
export type Book = z.infer<typeof Book>;
const Catalogue = z.object({ updated: z.string(), books: z.array(Book) });

function file() {
  // Works from src/ (tsx, tests) and dist/src/ (built server), whatever the working folder.
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 6; i++) {
    const f = join(dir, 'data', 'books', 'secondary.json');
    if (existsSync(f)) return f;
    dir = dirname(dir);
  }
  return null;
}

let books: Book[] | null = null;
/** Every book, loaded once. A malformed file stops the server: better than showing wrong books. */
export function allBooks(): Book[] {
  if (books) return books;
  const f = file();
  books = f ? Catalogue.parse(JSON.parse(readFileSync(f, 'utf8'))).books : [];
  return books;
}

/** Tests can put books in without the file. */
export function useBooks(list: Book[] | null) {
  books = list;
}

/** A subject's books for a class: free ones first, then by title. */
export const booksFor = (subject: string, schoolClass: SchoolClass) =>
  allBooks()
    .filter((b) => b.placements.some((p) => p.subject === subject && p.classes.includes(schoolClass)))
    .sort((a, b) => Number(b.free) - Number(a.free) || a.title.localeCompare(b.title));
