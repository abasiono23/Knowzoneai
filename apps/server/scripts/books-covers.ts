/**
 * Finds covers for books in data/books/<country or courses>.json that have none: Open Library by ISBN or
 * by title and author (no key needed), then Google Books (GOOGLE_BOOKS_API_KEY or BOOKS_API, or YOUTUBE_API_KEY when it's allowed to use the
 * Books API). A cover is only taken on a strong match (same ISBN, or the same title with a matching
 * publisher or author), so a different book's cover never slips in. Run after books-merge.
 *
 *   npx tsx scripts/books-covers.ts [country, e.g. ng]
 */
import 'dotenv/config';

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { Book } from '../src/services/books.js';

const file = resolve(import.meta.dirname, `../data/books/${process.argv[2] ?? 'ng'}.json`);
const data = JSON.parse(readFileSync(file, 'utf8')) as { updated: string; books: Book[] };
const key = process.env.GOOGLE_BOOKS_API_KEY || process.env.BOOKS_API || process.env.YOUTUBE_API_KEY;

const words = (s: string | null) =>
  (s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['the', 'for', 'and', 'schools', 'school', 'secondary', 'senior', 'junior', 'book'].includes(w));
/** Share of the title's words that the candidate title also has. */
const overlap = (a: string | null, b: string) => {
  const A = words(a);
  const B = new Set(words(b));
  return A.length ? A.filter((w) => B.has(w)).length / A.length : 0;
};
/** Volume numbers must agree ("…Schools 1" is not "…Schools 2"). */
const volume = (s: string) => s.match(/\b(?:book\s*)?([1-3])\b(?!\d)/i)?.[1] ?? null;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Open Library's search, about one request a second as they ask. Its covers by id aren't rate limited. */
async function openLibrarySearch(params: Record<string, string>) {
  await sleep(1100);
  const url = `https://openlibrary.org/search.json?${new URLSearchParams({ ...params, limit: '5', fields: 'title,subtitle,author_name,publisher,cover_i,key' })}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'KnowzoneBooks/1.0' } }).catch(() => null);
  if (!res?.ok) return [];
  return ((await res.json()) as { docs?: { title?: string; subtitle?: string; author_name?: string[]; publisher?: string[]; cover_i?: number; key?: string }[] }).docs ?? [];
}
const coverById = (id: number) => `https://covers.openlibrary.org/b/id/${id}-L.jpg`;

async function openLibrary(b: Book) {
  if (b.isbn) {
    const doc = (await openLibrarySearch({ isbn: b.isbn.replace(/-/g, '') })).find((d) => d.cover_i);
    if (doc?.cover_i) return { cover: coverById(doc.cover_i), key: doc.key };
  }
  // Without a known author or publisher to compare, a title match isn't enough.
  if (!b.authors.length && !b.publisher) return null;
  for (const d of await openLibrarySearch({ title: b.title.slice(0, 120) })) {
    if (!d.cover_i) continue;
    const title = `${d.title ?? ''} ${d.subtitle ?? ''}`;
    const sameTitle = overlap(b.title, title) >= 0.85 && overlap(title, b.title) >= 0.6 && volume(b.title) === volume(title);
    const samePublisher = (d.publisher ?? []).some((x) => overlap(b.publisher, x) >= 0.5);
    const sameAuthor = b.authors.some((a) => (d.author_name ?? []).some((x) => x.toLowerCase().includes(a.split(/\s+/).pop()!.toLowerCase())));
    if (sameTitle && (samePublisher || sameAuthor)) return { cover: coverById(d.cover_i), key: d.key };
  }
  return null;
}

async function google(b: Book) {
  if (!key) return null;
  const q = b.isbn ? `isbn:${b.isbn}` : `intitle:"${b.title.replace(/"/g, '')}"`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5&key=${key}`;
  // Google Books often answers "temporarily unavailable": wait and try again a few times.
  const get = () => fetch(url).catch(() => null);
  let res = await get();
  for (let tries = 1; (!res || res.status === 429 || res.status >= 500) && tries <= 5; tries++) {
    await new Promise((r) => setTimeout(r, 2000 * tries));
    res = await get();
  }
  // A network failure that won't clear only costs this book; a refusal (such as the daily quota) stops the search.
  if (!res) return null;
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
let done = 0;
const save = () => writeFileSync(file, JSON.stringify(data, null, 1));
for (const b of data.books.filter((x) => !x.cover)) {
  if (++done % 25 === 0) save(); // A long run keeps what it found if it's stopped.
  const open = await openLibrary(b);
  if (open) {
    b.cover = open.cover;
    if (open.key) b.sources = [...new Set([...b.sources, `https://openlibrary.org${open.key}`])];
    ol++;
    continue;
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
save();
console.log(`Covers added: ${ol} from Open Library, ${gb} from Google Books.`);
console.log(`Still without a cover: ${data.books.filter((x) => !x.cover).length} of ${data.books.length}.`);
if (!key) console.log('No Google key: set GOOGLE_BOOKS_API_KEY (or allow YOUTUBE_API_KEY to use the Books API).');
if (googleError) console.log(`Google Books stopped: ${googleError}`);
