/**
 * Builds the flashcard lessons (data/lessons/cards.json and img/) from the written lessons: one JSON
 * file per lesson (lesson-<id>.json) with ~20 cards in 10 languages, each with a real photo from
 * Wikimedia Commons or a drawn SVG illustration, and a 5-question quiz. Free: no AI service is used.
 *
 * Each photo is checked again here (it exists, is a JPEG or PNG, big enough, and freely licensed:
 * CC0, CC BY, CC BY-SA or public domain), downloaded, cropped to a 2:3 portrait and credited.
 * SVG illustrations are rendered to the same size. A lesson with any card that fails is left out
 * and listed. Run from apps/server:
 *
 *   npx tsx scripts/lesson-build.ts data/lessons/source
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import sharp from 'sharp';

import type { LessonDeck } from '../src/services/lesson-cards.js';

const dir = process.argv[2];
if (!dir) throw new Error('Usage: npx tsx scripts/lesson-build.ts <folder with lesson-*.json>');

const OUT = join(import.meta.dirname, '../data/lessons');
const IMG = join(OUT, 'img');
mkdirSync(IMG, { recursive: true });
const FILE = join(OUT, 'cards.json');
const decks: LessonDeck[] = existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : [];

const LANGS = ['en', 'pcm', 'yo', 'ig', 'ha', 'fr', 'ar', 'sw', 'pt', 'es'] as const;
const HEADERS = { 'User-Agent': 'KnowzoneAI/1.0 (https://knowzoneai.com; educational app; info@knowzoneai.com)' };
const REUSABLE = /^(cc0|cc[ -]by(-sa)?([ -][\d.]+)?|public domain|pd)/i;
const W = 720;
const H = 1080;

type Written = {
  id: string;
  cards: { text: Record<string, string>; image: { commons?: string; svg?: string } }[];
  quiz: {
    question: Record<string, string>;
    options: Record<string, string[]>;
    correctIndex: number;
    explanation: Record<string, string>;
  }[];
};

const plain = (html: string) =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

/** A Commons file's download link and credit, if it's a freely licensed JPEG or PNG big enough to use. */
async function commons(title: string) {
  const name = title.startsWith('File:') ? title : `File:${title}`;
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    titles: name,
    prop: 'imageinfo',
    iiprop: 'url|mime|size|extmetadata',
    iiurlwidth: '1400',
    iiextmetadatafilter: 'LicenseShortName|Artist',
  });
  let res: Response | null = null;
  // Slow connections time out now and then: try a few times.
  for (let tries = 0; tries < 4 && !res?.ok; tries++) {
    if (tries) await new Promise((r) => setTimeout(r, 3000 * tries));
    res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(45_000),
    }).catch(() => null);
  }
  if (!res?.ok) throw new Error(`Commons ${res?.status ?? 'unreachable'}`);
  const body = (await res.json()) as {
    query?: {
      pages?: Record<
        string,
        {
          missing?: string;
          imageinfo?: {
            thumburl: string;
            mime: string;
            width: number;
            height: number;
            descriptionurl: string;
            extmetadata?: Record<string, { value: string }>;
          }[];
        }
      >;
    };
  };
  const page = Object.values(body.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!info || page?.missing !== undefined) throw new Error('not found');
  const license = plain(info.extmetadata?.LicenseShortName?.value ?? '');
  if (!/^image\/(jpeg|png)$/.test(info.mime)) throw new Error(`not a photo (${info.mime})`);
  if (info.width < 600 || info.height < 400) throw new Error(`too small (${info.width}×${info.height})`);
  if (!REUSABLE.test(license)) throw new Error(`licence not reusable (${license || 'none'})`);
  const author = plain(info.extmetadata?.Artist?.value ?? '').slice(0, 80) || 'Wikimedia Commons';
  return { url: info.thumburl, credit: { author, license, url: info.descriptionurl } };
}

async function download(url: string) {
  for (let tries = 0; tries < 4; tries++) {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(90_000) }).catch(() => null);
    if (res?.ok) return Buffer.from(await res.arrayBuffer());
    // Wikimedia asks automated clients to slow down when they're too quick.
    await new Promise((r) => setTimeout(r, 2000 * (tries + 1)));
  }
  throw new Error('download failed');
}

const failed: string[] = [];
for (const f of readdirSync(dir).filter((f) => /^lesson-[a-z0-9]+\.json$/.test(f))) {
  const w = JSON.parse(readFileSync(join(dir, f), 'utf8')) as Written;
  const problems: string[] = [];
  // Every text in every language, and a sound quiz.
  w.cards.forEach((c, k) => LANGS.forEach((l) => !c.text[l]?.trim() && problems.push(`card ${k + 1}: no ${l} text`)));
  w.quiz.forEach((q, k) =>
    LANGS.forEach((l) => {
      if (!q.question[l]?.trim() || !q.explanation[l]?.trim()) problems.push(`question ${k + 1}: no ${l} text`);
      if (q.options[l]?.length !== 4) problems.push(`question ${k + 1}: ${l} needs 4 options`);
    }),
  );
  if (w.quiz.some((q) => q.correctIndex < 0 || q.correctIndex > 3)) problems.push('a quiz answer is out of range');

  const credits: (LessonDeck['cards'][number]['credit'] | undefined)[] = [];
  for (const [k, c] of w.cards.entries()) {
    const file = join(IMG, `${w.id}-${k + 1}.webp`);
    try {
      if (c.image.svg) {
        await sharp(Buffer.from(c.image.svg), { density: 96 })
          .resize(W, H, { fit: 'cover' })
          .webp({ quality: 82 })
          .toFile(file);
        credits.push(undefined);
      } else if (c.image.commons) {
        const photo = await commons(c.image.commons);
        // Already downloaded on an earlier run (the licence and credit are still checked above).
        if (existsSync(file)) {
          credits.push(photo.credit);
          continue;
        }
        await sharp(await download(photo.url))
          .rotate()
          .resize(W, H, { fit: 'cover', position: 'attention' })
          .webp({ quality: 78 })
          .toFile(file);
        credits.push(photo.credit);
      } else throw new Error('no image');
    } catch (e) {
      problems.push(`card ${k + 1} picture: ${(e as Error).message}`);
    }
  }
  if (problems.length) {
    failed.push(`${w.id}:\n    ${problems.slice(0, 12).join('\n    ')}`);
    continue;
  }
  const deck: LessonDeck = {
    id: w.id,
    cards: w.cards.map((c, k) => ({ text: c.text, ...(credits[k] && { credit: credits[k] }) })),
    quiz: w.quiz,
  };
  const at = decks.findIndex((d) => d.id === w.id);
  if (at >= 0) decks[at] = deck;
  else decks.push(deck);
  writeFileSync(FILE, JSON.stringify(decks, null, 1));
  console.log(
    `${w.id}: ${deck.cards.length} cards (${credits.filter(Boolean).length} photos), ${deck.quiz.length} questions`,
  );
}
if (failed.length) console.log(`\nLeft out, to fix and run again:\n  ${failed.join('\n  ')}`);
