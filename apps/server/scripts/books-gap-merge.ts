/**
 * Adds researched books to data/books without rebuilding the catalogues, so existing covers and downloads stay.
 * Each research file is { courses: [book], countries: { <country>: [book] }, gaps: [] }. A book is left out, and
 * listed, when it has no source, has an unknown class or subject, or repeats a title already on that catalogue.
 * "Free" needs an https reading link; without one the book is listed as paid. Only openly licensed books keep a
 * download link, so everything else is read on its owner's site. Then run books-covers for the new books.
 *
 *   npx tsx scripts/books-gap-merge.ts <research file...> [--skip=<file of titles, one per line>] [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { useCountries, useCourseBooks, type Book, type Country, type CourseBook } from '../src/services/books.js';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const skipFile = args.find((a) => a.startsWith('--skip='))?.slice(7);
const files = args.filter((a) => !a.startsWith('--'));
if (!files.length) throw new Error('Usage: books-gap-merge <research file...> [--skip=<titles>] [--dry]');

const data = resolve(import.meta.dirname, '../data/books');
const load = <T>(name: string) => JSON.parse(readFileSync(`${data}/${name}.json`, 'utf8')) as T;
const folded = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
const slug = (s: string) => folded(s).replace(/ /g, '-').slice(0, 60).replace(/-$/, '');
const skip = new Set(
  skipFile
    ? readFileSync(skipFile, 'utf8')
        .split(/\r?\n/)
        .map(folded)
        .filter(Boolean)
    : [],
);

type Raw = Partial<Book> & { title: string; placements: never[]; notes?: string | null };
const OPEN = /\b(cc|creative commons|public domain|gfdl|open licen[cs]e)\b/i;

function clean<T>(raw: Raw, placements: T[]) {
  const https = (u?: string | null) => (u && /^https:\/\//.test(u) ? u : null);
  const readUrl = https(raw.readUrl);
  const free = !!raw.free && !!readUrl;
  const open = free && OPEN.test(raw.license ?? '') && !/no open|not open|all rights reserved/i.test(raw.license ?? '');
  return {
    id: slug(raw.title),
    title: raw.title.trim(),
    series: raw.series ?? null,
    authors: (raw.authors ?? []).filter(Boolean),
    publisher: raw.publisher || null,
    edition: raw.edition ?? null,
    year: raw.year ?? null,
    isbn: raw.isbn ? raw.isbn.replace(/[^0-9Xx]/g, '') : null,
    free,
    readUrl: free ? readUrl : null,
    downloadUrl: open ? https(raw.downloadUrl) : null,
    provider: free ? (raw.provider ?? null) : null,
    license: free ? (raw.license ?? null) : null,
    placements,
    sources: raw.sources ?? [],
    notes: raw.notes ?? null,
  };
}

const left: string[] = [];
const refuse = (where: string, title: string, why: string) => left.push(`${where}: ${title} (${why})`);
const counts: Record<string, number> = {};

const research = files.map(
  (f) => JSON.parse(readFileSync(resolve(f), 'utf8')) as { courses?: Raw[]; countries?: Record<string, Raw[]> },
);

// Courses
const catalogue = load<{ updated: string; books: CourseBook[] }>('courses');
const known = new Set(catalogue.books.map((b) => folded(b.title)));
const ids = new Set(catalogue.books.map((b) => b.id));
for (const raw of research.flatMap((r) => r.courses ?? [])) {
  const title = folded(raw.title);
  if (skip.has(title)) {
    refuse('courses', raw.title, 'on the skip list');
    continue;
  }
  if (!raw.sources?.length) {
    refuse('courses', raw.title, 'no source');
    continue;
  }
  const existing = catalogue.books.find((b) => folded(b.title) === title && known.has(title));
  if (existing) {
    // Already on the list: only add the new courses to it.
    for (const p of raw.placements as unknown as CourseBook['placements'])
      if (!existing.placements.some((q) => q.course === p.course)) existing.placements.push(p);
    continue;
  }
  const book = clean(raw, raw.placements as unknown as CourseBook['placements']) as unknown as CourseBook;
  if (ids.has(book.id)) book.id = `${book.id}-${slug(raw.authors?.[0] ?? 'x').slice(0, 12)}`;
  ids.add(book.id);
  known.add(title);
  catalogue.books.push(book);
  counts.courses = (counts.courses ?? 0) + 1;
}
useCourseBooks(catalogue.books);
useCourseBooks(null);

// Countries
const changed = new Map<string, Country>();
for (const r of research) {
  for (const [id, list] of Object.entries(r.countries ?? {})) {
    const c = changed.get(id) ?? load<Country>(id);
    changed.set(id, c);
    const levels = new Set(c.levels.map((l) => l.id));
    const subjects = new Set(c.subjects.map((s) => s.id));
    for (const raw of list) {
      const title = folded(raw.title);
      if (skip.has(title)) {
        refuse(id, raw.title, 'on the skip list');
        continue;
      }
      if (!raw.sources?.length) {
        refuse(id, raw.title, 'no source');
        continue;
      }
      const placements = (raw.placements as unknown as Book['placements']).filter(
        (p) => subjects.has(p.subject) && p.levels.every((l) => levels.has(l)),
      );
      if (!placements.length) {
        refuse(id, raw.title, 'unknown subject or class');
        continue;
      }
      const existing = c.books.find((b) => folded(b.title) === title);
      if (existing) {
        for (const p of placements)
          if (!existing.placements.some((q) => q.subject === p.subject)) existing.placements.push(p);
        continue;
      }
      const book = clean(raw, placements) as unknown as Book;
      if (c.books.some((b) => b.id === book.id)) book.id = `${book.id}-${slug(raw.authors?.[0] ?? 'x').slice(0, 12)}`;
      c.books.push(book);
      counts[id] = (counts[id] ?? 0) + 1;
    }
  }
}
// The server's own check: a bad file throws here, before anything is saved.
useCountries([...changed.values()]);
useCountries(null);

const today = new Date().toISOString().slice(0, 10);
console.log('Added:', counts);
if (left.length) console.log(`Left out ${left.length}:\n  ${left.join('\n  ')}`);
if (dry) {
  console.log('Dry run: nothing saved.');
} else {
  catalogue.updated = today;
  writeFileSync(`${data}/courses.json`, JSON.stringify(catalogue, null, 1));
  for (const [id, c] of changed) writeFileSync(`${data}/${id}.json`, JSON.stringify({ ...c, updated: today }, null, 1));
}
