/**
 * Builds data/books/<country>.json from a country's textbook research: its classes, streams and
 * subjects, the prescribed books, the free books we already have (matched by title from the other
 * country files, so covers and downloads carry over) and that country's own free books. Books without
 * sources, with unknown subjects or classes, or with a broken shape are left out and listed, so
 * nothing unchecked reaches students. The result is checked the same way the server checks it.
 *
 *   npx tsx scripts/books-merge.ts <research file, e.g. country-gh.json>
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { useCountries, type Book, type Country } from '../src/services/books.js';

const file = process.argv[2];
if (!file) throw new Error('Usage: npx tsx scripts/books-merge.ts <research file>');

type Placement = { subject: string; levels: string[] };
type Raw = {
  title?: string;
  series?: string | null;
  authors?: string[];
  publisher?: string;
  edition?: string | null;
  year?: number | null;
  isbn?: string | null;
  cover?: string | null;
  provider?: string | null;
  license?: string | null;
  readUrl?: string | null;
  downloadUrl?: string | null;
  placements?: Placement[];
  sources?: string[];
  notes?: string | null;
};
type Research = {
  country: string;
  name: string;
  levels: { id: string; name?: string; stage: 'lower' | 'upper' }[];
  streams: { id: string; name: string; levels: string[] }[];
  subjects: { id: string; name: string; levels: string[]; streams: string[] | null }[];
  books?: Raw[];
  freeBooks?: { title: string; placements: Placement[] }[];
  newFreeBooks?: Raw[];
};

const research = JSON.parse(readFileSync(file, 'utf8')) as Research;
const dir = resolve(import.meta.dirname, '../data/books');
const levels = new Set(research.levels.map((l) => l.id));
const subjects = new Set(research.subjects.map((s) => s.id));

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
const sameTitle = (a: string, b: string) => slug(a) === slug(b);

/** Only this country's subjects and classes. */
const keep = (placements: Placement[] = []) =>
  placements
    .filter((p) => subjects.has(p.subject))
    .map((p) => ({ subject: p.subject, levels: [...new Set(p.levels.filter((l) => levels.has(l)))] }))
    .filter((p) => p.levels.length);

const books = new Map<string, Book>();
const dropped: string[] = [];

function add(book: Omit<Book, 'id'> & { id?: string }) {
  const key = `${slug(book.title)}|${slug(book.publisher ?? book.authors.join(' '))}`;
  const existing = books.get(key);
  if (existing) {
    // The same book found for another subject or class: one entry, more placements.
    for (const p of book.placements) {
      const same = existing.placements.find((x) => x.subject === p.subject);
      if (same) same.levels = [...new Set([...same.levels, ...p.levels])];
      else existing.placements.push(p);
    }
    existing.sources = [...new Set([...existing.sources, ...book.sources])];
    return;
  }
  let id = book.id ?? slug(book.title);
  while ([...books.values()].some((b) => b.id === id)) id = `${id}-${slug(book.publisher ?? book.authors[0] ?? 'book').slice(0, 12)}`;
  books.set(key, { ...book, id });
}

function fromRaw(raw: Raw, free: boolean) {
  const why = !raw.title
    ? 'no title'
    : !raw.publisher && !raw.authors?.length
      ? 'no publisher or authors'
      : !raw.sources?.length
        ? 'no sources'
        : free && !raw.readUrl
          ? 'free but no reading link'
          : null;
  const placements = keep(raw.placements);
  if (why || !placements.length) return void dropped.push(`${raw.title ?? '(untitled)'}: ${why ?? 'no known subject or class'}`);
  const download = free ? https(raw.downloadUrl) : null;
  add({
    title: raw.title!.trim(),
    series: raw.series ?? null,
    authors: (raw.authors ?? []).map((a) => a.trim()).filter(Boolean),
    publisher: raw.publisher?.trim() || null,
    edition: raw.edition ?? null,
    year: raw.year ?? null,
    isbn: raw.isbn ?? null,
    cover: https(raw.cover),
    free,
    readUrl: free ? https(raw.readUrl) : null,
    // Checked and sized by books-downloads.
    downloadUrl: download,
    downloadType: download ? 'pdf' : null,
    downloadBytes: null,
    provider: raw.provider ?? null,
    license: raw.license ?? null,
    // A country's own free books (national platforms, local curricula) stay with that country.
    ...(free && { countryOnly: true }),
    placements,
    sources: [...new Set(raw.sources!.map((s) => https(s)!))],
    notes: raw.notes ?? null,
  });
}

for (const b of research.books ?? []) fromRaw(b, false);
for (const b of research.newFreeBooks ?? []) fromRaw(b, true);

// Free books we already have: copied from the other countries' files with this country's placements.
const others = readdirSync(dir)
  .filter((f) => /^[a-z]{2}\.json$/.test(f) && f !== `${research.country}.json`)
  .flatMap((f) => (JSON.parse(readFileSync(join(dir, f), 'utf8')) as Country).books.filter((b) => b.free && !b.countryOnly));
for (const f of research.freeBooks ?? []) {
  const known = others.find((b) => sameTitle(b.title, f.title));
  const placements = keep(f.placements);
  if (!known || !placements.length) {
    dropped.push(`${f.title}: ${known ? 'no known subject or class' : 'not in the free books we have'}`);
    continue;
  }
  add({ ...known, placements });
}

const country: Country = {
  country: research.country,
  name: research.name,
  updated: new Date().toISOString().slice(0, 10),
  levels: research.levels.map(({ id, name, stage }) => ({ id, ...(name && { name }), stage })),
  streams: research.streams,
  subjects: research.subjects.map((s) => ({ ...s, levels: s.levels.filter((l) => levels.has(l)) })),
  books: [...books.values()].sort((a, b) => a.id.localeCompare(b.id)),
};
// The same checks the server makes when it loads the file.
useCountries([country]);
writeFileSync(join(dir, `${research.country}.json`), JSON.stringify(country, null, 1));

console.log(`${research.name}: ${country.books.length} books (${country.books.filter((b) => b.free).length} free)`);
for (const s of country.subjects) {
  const list = country.books.filter((b) => b.placements.some((p) => p.subject === s.id));
  console.log(`  ${s.id.padEnd(34)} ${list.filter((b) => !b.free).length} paid, ${list.filter((b) => b.free).length} free`);
}
if (dropped.length) console.log(`\nLeft out (${dropped.length}):\n  ${dropped.join('\n  ')}`);
