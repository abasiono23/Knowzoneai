/**
 * Finds covers for books in data/books/secondary.json that have none: Open Library by ISBN (no key
 * needed), then Google Books (GOOGLE_BOOKS_API_KEY or BOOKS_API, or YOUTUBE_API_KEY when it's allowed to use the
 * Books API). A cover is only taken on a strong match (same ISBN, or the same title with a matching
 * publisher or author), so a different book's cover never slips in. Run after books-merge.
 *
 *   npx tsx scripts/books-covers.ts
 */
import 'dotenv/config';

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { Book } from '../src/services/books.js';

const file = resolve(import.meta.dirname, '../data/books/secondary.json');
const data = JSON.parse(readFileSync(file, 'utf8')) as { updated: string; books: Book[] };
const key = process.env.GOOGLE_BOOKS_API_KEY || process.env.BOOKS_API || process.env.YOUTUBE_API_KEY;

const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['the', 'for', 'and', 'schools', 'school', 'secondary', 'senior', 'junior', 'book'].includes(w));
/** Share of the title's words that the candidate title also has. */
const overlap = (a: string, b: string) => {
  const A = words(a);
  const B = new Set(words(b));
  return A.length ? A.filter((w) => B.has(w)).length / A.length : 0;
};
/** Volume numbers must agree ("…Schools 1" is not "…Schools 2"). */
const volume = (s: string) => s.match(/\b(?:book\s*)?([1-3])\b(?!\d)/i)?.[1] ?? null;

async function openLibrary(isbn: string) {
  const url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
  const res = await fetch(url, { method: 'HEAD' }).catch(() => null);
  return res?.ok ? url : null;
}

async function google(b: Book) {
  if (!key) return null;
  const q = b.isbn ? `isbn:${b.isbn}` : `intitle:"${b.title.replace(/"/g, '')}"`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5&key=${key}`;
  // Google Books often answers "temporarily unavailable": wait and try again a few times.
  let res = await fetch(url);
  for (let tries = 1; (res.status === 429 || res.status >= 500) && tries <= 5; tries++) {
    await new Promise((r) => setTimeout(r, 2000 * tries));
    res = await fetch(url);
  }
  if (!res.ok) throw new Error(`Google Books ${res.status}: ${(await res.text()).slice(0, 160)}`);
  const items =
    (
      (await res.json()) as {
        items?: {
          id: string;
          volumeInfo: {
            title?: string;
            subtitle?: string;
            authors?: string[];
            publisher?: string;
            imageLinks?: { thumbnail?: string };
            industryIdentifiers?: { identifier: string }[];
          };
        }[];
      }
    ).items ?? [];
  for (const it of items) {
    const v = it.volumeInfo;
    if (!v.imageLinks?.thumbnail) continue;
    const sameIsbn = !!b.isbn && (v.industryIdentifiers ?? []).some((x) => x.identifier.replace(/-/g, '') === b.isbn!.replace(/-/g, ''));
    const title = `${v.title ?? ''} ${v.subtitle ?? ''}`;
    const sameTitle = overlap(b.title, title) >= 0.85 && overlap(title, b.title) >= 0.6 && volume(b.title) === volume(title);
    const samePublisher = !!v.publisher && overlap(b.publisher, v.publisher) >= 0.5;
    const sameAuthor = b.authors.some((a) => (v.authors ?? []).some((x) => x.toLowerCase().includes(a.split(/\s+/).pop()!.toLowerCase())));
    if (sameIsbn || (sameTitle && (samePublisher || sameAuthor)))
      return { cover: v.imageLinks.thumbnail.replace(/^http:/, 'https:').replace('&edge=curl', ''), googleId: it.id };
  }
  return null;
}

let ol = 0;
let gb = 0;
let googleError: string | null = null;
for (const b of data.books.filter((x) => !x.cover)) {
  if (b.isbn) {
    const url = await openLibrary(b.isbn);
    if (url) {
      b.cover = url;
      ol++;
      continue;
    }
  }
  if (key && !googleError) {
    try {
      const found = await google(b);
      if (found) {
        b.cover = found.cover;
        b.sources = [...new Set([...b.sources, `https://books.google.com/books?id=${found.googleId}`])];
        gb++;
      }
    } catch (e) {
      googleError = (e as Error).message;
    }
    await new Promise((r) => setTimeout(r, 120));
  }
}
writeFileSync(file, JSON.stringify(data, null, 1));
console.log(`Covers added: ${ol} from Open Library, ${gb} from Google Books.`);
console.log(`Still without a cover: ${data.books.filter((x) => !x.cover).length} of ${data.books.length}.`);
if (!key) console.log('No Google key: set GOOGLE_BOOKS_API_KEY (or allow YOUTUBE_API_KEY to use the Books API).');
if (googleError) console.log(`Google Books stopped: ${googleError}`);
