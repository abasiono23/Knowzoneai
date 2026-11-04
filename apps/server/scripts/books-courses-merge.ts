/**
 * Builds data/books/courses.json (university, polytechnic and college course books) from the course
 * research: one JSON file per group of faculties. Course ids are checked against the app's course list
 * (apps/mobile/src/lib/books.ts). Books without sources, with unknown courses, or free without an
 * official reading link are left out and listed. Free books the country files already have keep their
 * covers and downloads. Then run books-covers and books-downloads with "courses".
 *
 *   npx tsx scripts/books-courses-merge.ts <folder with courses-*.json>
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { COURSE_LEVELS, useCourseBooks, type Book, type CourseBook } from '../src/services/books.js';

const dir = process.argv[2];
if (!dir) throw new Error('Usage: npx tsx scripts/books-courses-merge.ts <research folder>');

const data = resolve(import.meta.dirname, '../data/books');
const app = readFileSync(resolve(import.meta.dirname, '../../mobile/src/lib/books.ts'), 'utf8');
const faculties = app.slice(app.indexOf('export const FACULTIES'), app.indexOf('export const coursesFor'));
// Every course (and master's-only course) in the app's faculties.
const courses = new Set(
  [...faculties.matchAll(/(?:courses|mastersOnly): \[([^\]]+)\]/g)].flatMap((m) =>
    [...m[1]!.matchAll(/'([a-z-]+)'/g)].map((x) => x[1]!),
  ),
);
const levels = new Set<string>(COURSE_LEVELS);

type Raw = Partial<Omit<CourseBook, 'placements'>> & {
  placements?: { course: string; levels: string[] }[];
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
const https = (u?: string | null) => (u ? u.replace(/^http:/, 'https:') : null);

// Free books we already have (covers, checked downloads), by title.
const known = new Map<string, Book>();
for (const f of readdirSync(data).filter((f) => /^[a-z]{2}\.json$/.test(f)))
  for (const b of (JSON.parse(readFileSync(join(data, f), 'utf8')) as { books: Book[] }).books)
    if (b.free && !known.has(slug(b.title))) known.set(slug(b.title), b);

const books = new Map<string, CourseBook>();
const dropped: string[] = [];

for (const f of readdirSync(dir).filter((f) => /^courses-.*\.json$/.test(f))) {
  for (const raw of (JSON.parse(readFileSync(join(dir, f), 'utf8')) as { books: Raw[] }).books) {
    const placements = (raw.placements ?? [])
      .filter((p) => courses.has(p.course))
      .map((p) => ({
        course: p.course,
        levels: [...new Set(p.levels.filter((l) => levels.has(l)))] as CourseBook['placements'][number]['levels'],
      }))
      .filter((p) => p.levels.length);
    const why = !raw.title
      ? 'no title'
      : !raw.publisher && !raw.authors?.length
        ? 'no publisher or authors'
        : !raw.sources?.length
          ? 'no sources'
          : raw.free && !raw.readUrl
            ? 'free but no reading link'
            : /CHECK BEFORE SHIPPING/i.test(raw.notes ?? '')
              ? 'licence not yet seen on its own page'
              : !placements.length
                ? `no known course (${(raw.placements ?? []).map((p) => p.course).join(', ')})`
                : null;
    if (why) {
      dropped.push(`${raw.title ?? '(untitled)'}: ${why}`);
      continue;
    }
    const key = `${slug(raw.title!)}|${slug(raw.publisher ?? raw.authors!.join(' '))}`;
    const existing = books.get(key);
    if (existing) {
      // The same book found for another course or group: one entry, more placements.
      for (const p of placements) {
        const same = existing.placements.find((x) => x.course === p.course);
        if (same) same.levels = [...new Set([...same.levels, ...p.levels])];
        else existing.placements.push(p);
      }
      existing.sources = [...new Set([...existing.sources, ...raw.sources!.map((s) => https(s)!)])];
      continue;
    }
    const have = raw.free ? known.get(slug(raw.title!)) : undefined;
    let id = slug(raw.title!);
    while ([...books.values()].some((b) => b.id === id))
      id = `${id}-${slug(raw.publisher ?? raw.authors![0]!).slice(0, 12)}`;
    const download = raw.free ? https(raw.downloadUrl) : null;
    books.set(key, {
      id,
      title: raw.title!.trim(),
      series: raw.series ?? null,
      authors: (raw.authors ?? []).map((a) => a.trim()).filter(Boolean),
      publisher: raw.publisher?.trim() || null,
      edition: raw.edition ?? null,
      year: raw.year ?? null,
      isbn: raw.isbn ?? null,
      cover: https(raw.cover) ?? have?.cover ?? null,
      free: !!raw.free,
      readUrl: raw.free ? https(raw.readUrl) : null,
      // Checked and sized by books-downloads.
      downloadUrl: have?.downloadUrl ?? download,
      downloadType: have?.downloadType ?? (download ? 'pdf' : null),
      downloadBytes: have?.downloadBytes ?? null,
      provider: raw.provider ?? null,
      license: raw.license ?? null,
      placements,
      sources: [...new Set(raw.sources!.map((s) => https(s)!))],
      notes: raw.notes ?? null,
    });
  }
}

const list = [...books.values()].sort((a, b) => a.id.localeCompare(b.id));
// The same checks the server makes when it loads the file.
useCourseBooks(list);
writeFileSync(
  join(data, 'courses.json'),
  JSON.stringify({ updated: new Date().toISOString().slice(0, 10), books: list }, null, 1),
);

console.log(`${list.length} course books (${list.filter((b) => b.free).length} free)`);
const none: string[] = [];
for (const c of courses) {
  const here = list.filter((b) => b.placements.some((p) => p.course === c));
  if (!here.length) none.push(c);
  else
    console.log(
      `  ${c.padEnd(32)} ${here.filter((b) => b.free).length} free, ${here.filter((b) => !b.free).length} paid`,
    );
}
if (none.length) console.log(`\nNo books yet (${none.length}): ${none.join(', ')}`);
if (dropped.length) console.log(`\nLeft out (${dropped.length}):\n  ${dropped.join('\n  ')}`);
