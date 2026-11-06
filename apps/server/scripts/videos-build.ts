/**
 * Builds data/videos/<library>.json from the chosen videos (pick-<library>.json) and the details the
 * harvest collected (videos.json). Fails on a video or topic that doesn't exist, so a mistyped id can't
 * reach students. Titles and channels come from YouTube, so they're rechecked monthly on the server.
 *
 *   npx tsx scripts/videos-build.ts <videos folder> <summaries folder> [library...]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import type { VideoLibrary } from '../src/services/subject-videos.js';
import { LIBRARIES } from '../src/services/summaries.js';

const [dir, summaries, ...only] = process.argv.slice(2);
if (!dir || !summaries) throw new Error('Usage: videos-build <videos folder> <summaries folder> [library...]');

type Raw = { id: string; title: string; channel: string; seconds: number };
const ENTITIES: Record<string, string> = { '&amp;': '&', '&#39;': '’', '&quot;': '"', '&lt;': '<', '&gt;': '>' };
const plain = (s: string) => s.replace(/&(amp|#39|quot|lt|gt);/g, (m) => ENTITIES[m] ?? m);

const all = new Map((JSON.parse(readFileSync(join(dir, 'videos.json'), 'utf8')) as Raw[]).map((v) => [v.id, v]));
const lessons = new Set(
  (JSON.parse(readFileSync(join(dir, 'flashcard-lessons.json'), 'utf8')) as { id: string }[]).map((l) => l.id),
);

const out = resolve(import.meta.dirname, '../data/videos');
mkdirSync(out, { recursive: true });

let total = 0;
for (const id of only.length ? only : LIBRARIES) {
  const file = join(dir, `pick-${id}.json`);
  if (!existsSync(file)) {
    console.log(`${id}: not picked yet`);
    continue;
  }
  const picks = JSON.parse(readFileSync(file, 'utf8')) as {
    topics: { id: string; videos: string[]; flashcards: string[] }[];
  };
  const known = new Set(
    (JSON.parse(readFileSync(join(summaries, 'en', `${id}.json`), 'utf8')) as { topics: { id: string }[] }).topics.map(
      (t) => t.id,
    ),
  );
  const lib: VideoLibrary = {
    id,
    topics: picks.topics.map((t) => {
      if (!known.has(t.id)) throw new Error(`${id}: no topic ${t.id}`);
      for (const l of t.flashcards ?? []) if (!lessons.has(l)) throw new Error(`${id}/${t.id}: no lesson ${l}`);
      return {
        id: t.id,
        flashcards: t.flashcards ?? [],
        videos: [...new Set(t.videos)].map((v) => {
          const raw = all.get(v);
          if (!raw) throw new Error(`${id}/${t.id}: no video ${v}`);
          return { youtubeId: raw.id, title: plain(raw.title), channel: plain(raw.channel), seconds: raw.seconds };
        }),
      };
    }),
  };
  writeFileSync(join(out, `${id}.json`), JSON.stringify(lib));
  const videos = lib.topics.reduce((n, t) => n + t.videos.length, 0);
  total += videos;
  console.log(`${id}: ${videos} videos in ${lib.topics.filter((t) => t.videos.length).length}/${known.size} topics`);
}
console.log(`${total} videos`);
