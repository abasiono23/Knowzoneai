/**
 * Finds the official download for each free book in data/books/secondary.json, so students can save
 * it in the app and read offline: OpenStax PDFs (from OpenStax's own catalogue), Pressbooks PDF
 * exports, single-page books (Gutenberg, Standard Ebooks) and PDFs linked from the book's own page.
 * Records the size, so the app can say how big a download is. Run after books-merge.
 *
 *   npx tsx scripts/books-downloads.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { Book } from '../src/services/books.js';

const file = resolve(import.meta.dirname, '../data/books/secondary.json');
const data = JSON.parse(readFileSync(file, 'utf8')) as { updated: string; books: Book[] };
/** The biggest book students can save in the app (100 MB). */
const MAX_BYTES = 100e6;
const HEADERS = { 'User-Agent': 'KnowzoneAI/1.0 (https://knowzone-api.onrender.com; educational app)' };

/** Follows the link and checks it really is a file of that type; returns its size. */
async function check(url: string, type: 'pdf' | 'html') {
  const res = await fetch(url, { method: 'HEAD', headers: HEADERS, redirect: 'follow' }).catch(() => null);
  if (!res?.ok) return null;
  const kind = res.headers.get('content-type') ?? '';
  if (type === 'pdf' && !kind.includes('pdf')) return null;
  if (type === 'html' && !kind.includes('html')) return null;
  return { url: res.url || url, bytes: Number(res.headers.get('content-length')) || null };
}

// OpenStax's catalogue: each book's PDF.
const openstax = new Map<string, string>();
const cms = await fetch(
  'https://openstax.org/apps/cms/api/v2/pages/?type=books.Book&fields=slug,pdf_url,high_resolution_pdf_url&limit=250',
  { headers: HEADERS },
).then((r) => r.json() as Promise<{ items: { meta: { slug: string }; pdf_url?: string; high_resolution_pdf_url?: string }[] }>);
for (const b of cms.items) {
  const pdf = b.pdf_url || b.high_resolution_pdf_url;
  if (pdf) openstax.set(b.meta.slug, pdf);
}

let found = 0;
for (const b of data.books.filter((x) => x.free && x.readUrl)) {
  const read = b.readUrl!;
  let result: { url: string; bytes: number | null; type: 'pdf' | 'html' } | null = null;
  const slug = read.match(/openstax\.org\/books\/([^/]+)/)?.[1];
  if (slug && openstax.has(slug)) {
    const ok = await check(openstax.get(slug)!, 'pdf');
    if (ok) result = { ...ok, type: 'pdf' };
  } else if (/gutenberg\.org\/cache\/epub\/.*\.html$|standardebooks\.org\/.*\/single-page$/.test(read)) {
    const ok = await check(read, 'html');
    if (ok) result = { ...ok, type: 'html' };
  } else if (/pressbooks|opentextbc\.ca/.test(read)) {
    const root = read.match(/^https:\/\/[^/]+\/[^/]+\//)?.[0] ?? read;
    const ok = await check(`${root}open/download?type=pdf`, 'pdf');
    if (ok) result = { ...ok, type: 'pdf' };
  } else {
    // Any PDF the book's own page links to, if it names this book.
    const html = await fetch(read, { headers: HEADERS })
      .then((r) => r.text())
      .catch(() => '');
    const links = [...html.matchAll(/href="([^"]+\.pdf)"/gi)].map((m) => new URL(m[1]!, read).href);
    for (const link of links.slice(0, 5)) {
      const ok = await check(link, 'pdf');
      if (ok) {
        result = { ...ok, type: 'pdf' };
        break;
      }
    }
  }
  // Very big files cost students too much data and won't open on most phones: those are read online.
  if (result?.bytes && result.bytes > MAX_BYTES) result = null;
  b.downloadUrl = result?.url ?? null;
  b.downloadType = result?.type ?? null;
  b.downloadBytes = result?.bytes ?? null;
  if (result) found++;
  console.log(`${result ? '✓' : '·'} ${b.title.slice(0, 50).padEnd(50)} ${result ? `${result.type} ${result.bytes ? `${(result.bytes / 1e6).toFixed(1)} MB` : '?'}` : 'read online only'}`);
}
writeFileSync(file, JSON.stringify(data, null, 1));
console.log(`\n${found} of ${data.books.filter((x) => x.free).length} free books can be downloaded.`);
