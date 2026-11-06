import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

import { isHiddenContent } from './content-hides.js';

/**
 * Textbooks for "Check out your books", secondary school first. Each country has its own file,
 * `data/books/<country>.json` (shipped with the server, so it can be corrected without an app
 * update): its classes, streams (science/arts/commercial, pathways, exam routes), the subjects each
 * student takes, and each subject's textbooks: the prescribed ones (paid, bought later in the app) and
 * free, legally readable full textbooks. Every book carries the sources it was checked against.
 *
 * Students from a country we haven't covered yet get "world": the free books from every country,
 * by lower (about 11–14) and upper (about 15–18) secondary.
 */
export const WORLD = 'world';

const Id = z.string().regex(/^[a-z0-9-]+$/);

const Book = z.object({
  id: Id,
  title: z.string().min(1),
  series: z.string().nullable().optional(),
  authors: z.array(z.string()),
  /** Unknown for some official list entries (e.g. set texts in any edition): then there are authors. */
  publisher: z.string().min(1).nullable(),
  edition: z.string().nullable().optional(),
  year: z.number().int().nullable().optional(),
  isbn: z.string().nullable().optional(),
  cover: z.string().url().nullable().optional(),
  /** Free books are read in the app; the others are bought in the app later. */
  free: z.boolean(),
  readUrl: z.string().url().nullable().optional(),
  /** The official file to save in the app for offline reading (free books), and its size. */
  downloadUrl: z.string().url().nullable().optional(),
  downloadType: z.enum(['pdf', 'html']).nullable().optional(),
  downloadBytes: z.number().int().nullable().optional(),
  provider: z.string().nullable().optional(),
  license: z.string().nullable().optional(),
  /** Free only for this country's curriculum (e.g. a national platform's books): left out of "world". */
  countryOnly: z.boolean().optional(),
  /** Which subjects and classes the book is for. */
  placements: z.array(z.object({ subject: Id, levels: z.array(Id).min(1) })).min(1),
  sources: z.array(z.string().url()).min(1),
  notes: z.string().nullable().optional(),
});
export type Book = z.infer<typeof Book>;

const Country = z
  .object({
    country: Id,
    name: z.string(),
    updated: z.string(),
    /** Classes in order. "lower" is junior secondary, "upper" senior secondary. */
    levels: z
      .array(
        z.object({
          id: Id,
          name: z.string().optional(),
          stage: z.enum(['lower', 'upper']),
        }),
      )
      .min(1),
    /** Choices students make (science/arts/commercial, pathways, exam routes), and from which class. */
    streams: z.array(z.object({ id: Id, name: z.string(), levels: z.array(Id).min(1) })),
    /** `streams: null`: everyone in those classes takes it. Otherwise only those streams (in classes that have streams). */
    subjects: z.array(
      z.object({
        id: Id,
        name: z.string(),
        levels: z.array(Id).min(1),
        streams: z.array(Id).nullable(),
      }),
    ),
    books: z.array(Book),
  })
  .superRefine((c, ctx) => {
    // Every class, stream and subject a book or subject names must exist: a typo would hide books.
    const levels = new Set(c.levels.map((l) => l.id));
    const streams = new Set(c.streams.map((s) => s.id));
    const subjects = new Set(c.subjects.map((s) => s.id));
    const bad = (message: string) => ctx.addIssue({ code: 'custom', message: `${c.country}: ${message}` });
    for (const s of c.streams)
      for (const l of s.levels) if (!levels.has(l)) bad(`stream ${s.id} has unknown class ${l}`);
    for (const s of c.subjects) {
      for (const l of s.levels) if (!levels.has(l)) bad(`subject ${s.id} has unknown class ${l}`);
      for (const st of s.streams ?? []) if (!streams.has(st)) bad(`subject ${s.id} has unknown stream ${st}`);
    }
    for (const b of c.books) {
      if (!b.publisher && !b.authors.length) bad(`book ${b.id} has neither publisher nor authors`);
      for (const p of b.placements) {
        if (!subjects.has(p.subject)) bad(`book ${b.id} has unknown subject ${p.subject}`);
        for (const l of p.levels) if (!levels.has(l)) bad(`book ${b.id} has unknown class ${l}`);
      }
    }
  });
export type Country = z.infer<typeof Country>;

function folder() {
  // Works from src/ (tsx, tests) and dist/src/ (built server), whatever the working folder.
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 6; i++) {
    const f = join(dir, 'data', 'books');
    if (existsSync(f)) return f;
    dir = dirname(dir);
  }
  return null;
}

let countries: Map<string, Country> | null = null;
/** Every country, loaded once. A malformed file stops the server: better than showing wrong books. */
export function allCountries(): Map<string, Country> {
  if (countries) return countries;
  const dir = folder();
  const list = dir
    ? readdirSync(dir)
        .filter((f) => /^[a-z]{2}\.json$/.test(f))
        .map((f) => Country.parse(JSON.parse(readFileSync(join(dir, f), 'utf8'))))
    : [];
  countries = new Map(list.map((c) => [c.country, c]));
  countries.set(WORLD, world(list));
  return countries;
}

/** Tests can put countries in without the files. */
export function useCountries(list: Country[] | null) {
  countries = list ? new Map([...list.map((c) => [c.country, Country.parse(c)] as const), [WORLD, world(list)]]) : null;
}

/** Free books from every country, by lower and upper secondary. A book in several countries appears once. */
function world(list: Country[]): Country {
  const books = new Map<string, Book>();
  const subjects = new Map<string, { id: string; name: string; levels: Set<string> }>();
  for (const c of list) {
    const stage = new Map(c.levels.map((l) => [l.id, l.stage]));
    for (const b of c.books) {
      if (!b.free || b.countryOnly) continue;
      const key = b.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
      const placements = b.placements.map((p) => ({
        subject: p.subject,
        levels: [...new Set(p.levels.map((l) => stage.get(l)!))],
      }));
      const seen = books.get(key);
      if (seen)
        for (const p of placements) {
          const same = seen.placements.find((q) => q.subject === p.subject);
          if (same) same.levels = [...new Set([...same.levels, ...p.levels])];
          else seen.placements.push(p);
        }
      else books.set(key, { ...b, placements });
      for (const p of placements) {
        const s = subjects.get(p.subject) ?? {
          id: p.subject,
          name: c.subjects.find((x) => x.id === p.subject)!.name,
          levels: new Set<string>(),
        };
        p.levels.forEach((l) => s.levels.add(l));
        subjects.set(p.subject, s);
      }
    }
  }
  const order = ['lower', 'upper'];
  return {
    country: WORLD,
    name: 'Worldwide',
    updated:
      list
        .map((c) => c.updated)
        .sort()
        .at(-1) ?? '',
    levels: [
      { id: 'lower', stage: 'lower' },
      { id: 'upper', stage: 'upper' },
    ],
    streams: [],
    subjects: [...subjects.values()]
      .map((s) => ({
        id: s.id,
        name: s.name,
        levels: order.filter((l) => s.levels.has(l)),
        streams: null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    books: [...books.values()],
  };
}

/** A country's books; countries without their own yet get the worldwide free books. */
export const visibleBooks = <T extends { id: string }>(books: T[]) =>
  books.filter((b) => !isHiddenContent('book', b.id));

export const country = (id: string) => allCountries().get(id) ?? allCountries().get(WORLD)!;

/** The streams a student in this class can choose from. */
export const streamsFor = (c: Country, level: string) => c.streams.filter((s) => s.levels.includes(level));

/**
 * The subjects a student takes. With no stream chosen yet (or a class without streams), every
 * subject in the class. Subjects everyone takes come first.
 */
export function subjectsFor(c: Country, level: string, stream?: string) {
  const choosing = streamsFor(c, level).length > 0;
  const core = (s: Country['subjects'][number]) => !choosing || !s.streams;
  return c.subjects
    .filter((s) => s.levels.includes(level) && (!stream || core(s) || s.streams!.includes(stream)))
    .sort((a, b) => Number(core(b)) - Number(core(a)));
}

// ─── University, polytechnic and college courses ──────────────────────────────

/** First year (and ND, NCE), later years (and HND), master's. */
export const COURSE_LEVELS = ['intro', 'core', 'masters'] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

const CourseBook = Book.omit({ placements: true, countryOnly: true }).extend({
  placements: z.array(z.object({ course: Id, levels: z.array(z.enum(COURSE_LEVELS)).min(1) })).min(1),
});
export type CourseBook = z.infer<typeof CourseBook>;
const CourseCatalogue = z.object({
  updated: z.string(),
  books: z.array(CourseBook),
});

let courseBooks: CourseBook[] | null = null;
/**
 * Course textbooks (`data/books/courses.json`): the same for every country. Free, openly licensed
 * university textbooks, and the standard prescribed ones (bought in the app later).
 */
export function allCourseBooks(): CourseBook[] {
  if (courseBooks) return courseBooks;
  const dir = folder();
  const f = dir && join(dir, 'courses.json');
  courseBooks = f && existsSync(f) ? CourseCatalogue.parse(JSON.parse(readFileSync(f, 'utf8'))).books : [];
  return courseBooks;
}

/** Tests can put course books in without the file. */
export function useCourseBooks(list: CourseBook[] | null) {
  courseBooks = list && CourseCatalogue.parse({ updated: '', books: list }).books;
}

/** Which books come first for each kind of student. */
const FIRST: Record<string, CourseLevel> = {
  undergraduate: 'intro',
  polytechnic: 'intro',
  college: 'intro',
  independent: 'intro',
  masters: 'masters',
};

/** A course's books: free first, then the ones for the student's stage, then by title. */
export function courseBooksFor(course: string, stage?: string) {
  const first = FIRST[stage ?? ''] ?? 'intro';
  const levels = (b: CourseBook) => b.placements.find((p) => p.course === course)!.levels;
  return visibleBooks(allCourseBooks())
    .filter((b) => b.placements.some((p) => p.course === course))
    .sort(
      (a, b) =>
        Number(b.free) - Number(a.free) ||
        Number(levels(b).includes(first)) - Number(levels(a).includes(first)) ||
        a.title.localeCompare(b.title),
    )
    .map((b) => ({ book: b, levels: levels(b) }));
}

/** A subject's books for a class: free ones first, then by title. */
export const booksFor = (c: Country, subject: string, level: string) =>
  visibleBooks(c.books)
    .filter((b) => b.placements.some((p) => p.subject === subject && p.levels.includes(level)))
    .sort((a, b) => Number(b.free) - Number(a.free) || a.title.localeCompare(b.title));
