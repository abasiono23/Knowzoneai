/**
 * Builds data/books/secondary.json from the textbook research (one JSON file per group: JSS, SS
 * science, SS arts and commercial, free books). Books without sources, with unknown subjects or
 * classes, or with a broken shape are left out and listed, so nothing unchecked reaches students.
 *
 *   npx tsx scripts/books-merge.ts <folder with the research JSON files>
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { CLASSES, SUBJECTS, type Book } from '../src/services/books.js';

const dir = process.argv[2];
if (!dir) throw new Error('Usage: npx tsx scripts/books-merge.ts <research folder>');

const known = new Set<string>(Object.values(SUBJECTS).flat());
const classes = new Set<string>(CLASSES);
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

type Raw = {
  title?: string;
  series?: string | null;
  authors?: string[];
  publisher?: string;
  edition?: string | null;
  year?: number | null;
  isbn?: string | null;
  classes?: string[];
  subjects?: { subject: string; classes: string[] }[];
  googleBooksId?: string | null;
  cover?: string | null;
  readUrl?: string | null;
  provider?: string | null;
  license?: string | null;
  sources?: string[];
  notes?: string | null;
};

const books = new Map<string, Book>();
const dropped: string[] = [];

function add(raw: Raw, placements: { subject: string; classes: string[] }[], free: boolean) {
  const why = !raw.title
    ? 'no title'
    : !raw.publisher
      ? 'no publisher'
      : !raw.sources?.length
        ? 'no sources'
        : free && !raw.readUrl
          ? 'free but no reading link'
          : null;
  const good = placements
    .filter((p) => known.has(p.subject))
    .map((p) => ({ subject: p.subject, classes: p.classes.filter((c) => classes.has(c)) as Book['placements'][number]['classes'] }))
    .filter((p) => p.classes.length);
  if (why || !good.length) {
    dropped.push(`${raw.title ?? '(untitled)'}: ${why ?? 'no known subject or class'}`);
    return;
  }
  const key = `${slug(raw.title!)}|${slug(raw.publisher!)}`;
  const existing = books.get(key);
  if (existing) {
    // The same book found for another subject or class: one entry, more placements.
    for (const p of good) {
      const same = existing.placements.find((x) => x.subject === p.subject);
      if (same) same.classes = [...new Set([...same.classes, ...p.classes])];
      else existing.placements.push(p);
    }
    existing.sources = [...new Set([...existing.sources, ...raw.sources!])];
    return;
  }
  let id = slug(raw.title!);
  while ([...books.values()].some((b) => b.id === id)) id = `${id}-${slug(raw.publisher!).slice(0, 12)}`;
  books.set(key, {
    id,
    title: raw.title!.trim(),
    series: raw.series ?? null,
    authors: (raw.authors ?? []).map((a) => a.trim()).filter(Boolean),
    publisher: raw.publisher!.trim(),
    edition: raw.edition ?? null,
    year: raw.year ?? null,
    isbn: raw.isbn ?? null,
    cover: https(raw.cover) ?? (raw.googleBooksId ? `https://books.google.com/books/content?id=${raw.googleBooksId}&printsec=frontcover&img=1&zoom=1` : null),
    free,
    readUrl: free ? https(raw.readUrl) : null,
    provider: raw.provider ?? null,
    license: raw.license ?? null,
    placements: good,
    sources: [...new Set(raw.sources!)],
    notes: raw.notes ?? null,
  });
}

for (const f of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const data = JSON.parse(readFileSync(join(dir, f), 'utf8')) as {
    subjects?: { subject: string; books: Raw[] }[];
    books?: Raw[];
  };
  for (const s of data.subjects ?? []) for (const b of s.books) add(b, [{ subject: s.subject, classes: b.classes ?? [] }], false);
  for (const b of data.books ?? []) add(b, b.subjects ?? [], true);
}

const out = resolve(import.meta.dirname, '../data/books');
mkdirSync(out, { recursive: true });
const list = [...books.values()].sort((a, b) => a.id.localeCompare(b.id));
writeFileSync(join(out, 'secondary.json'), JSON.stringify({ updated: new Date().toISOString().slice(0, 10), books: list }, null, 1));

const bySubject = new Map<string, { paid: number; free: number }>();
for (const b of list)
  for (const p of b.placements) {
    const n = bySubject.get(p.subject) ?? { paid: 0, free: 0 };
    n[b.free ? 'free' : 'paid']++;
    bySubject.set(p.subject, n);
  }
console.log(`${list.length} books (${list.filter((b) => b.free).length} free)`);
for (const s of known) console.log(`  ${s.padEnd(26)} ${bySubject.get(s)?.paid ?? 0} paid, ${bySubject.get(s)?.free ?? 0} free`);
if (dropped.length) console.log(`\nLeft out (${dropped.length}):\n  ${dropped.join('\n  ')}`);
