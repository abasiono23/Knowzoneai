import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

import { config } from '../config.js';
import type { LanguageId } from './personalization.js';
import { allSkills } from './skills.js';
import { librariesFor, libraryCards, type LibraryId, LIBRARIES } from './summaries.js';

/**
 * A school subject's Videos tab: YouTube lessons sorted by the same topics as its summaries, mixed with
 * Knowzone's flashcard lessons and "Did you know?" reels. Videos play in YouTube's own player and are
 * never downloaded. Chosen with scripts/videos-harvest.ts, built by scripts/videos-build.ts.
 */
const Video = z.object({
  youtubeId: z.string().regex(/^[\w-]{11}$/),
  title: z.string().min(1),
  channel: z.string().min(1),
  seconds: z.number().int().positive(),
});
const Topic = z.object({ id: z.string(), videos: z.array(Video), flashcards: z.array(z.string()) });
const Library = z.object({ id: z.string(), topics: z.array(Topic) });
export type VideoLibrary = z.infer<typeof Library>;
type Video = z.infer<typeof Video>;

/** The reels (data/facts) that belong with each subject. */
const REELS: Partial<Record<LibraryId, string[]>> = {
  biology: ['biology', 'human body', 'animals'],
  chemistry: ['chemistry'],
  physics: ['physics', 'space'],
  mathematics: ['mathematics'],
  geography: ['geography'],
  economics: ['economics and money'],
  english: ['languages and words'],
  'computer-studies': ['technology'],
};

function folder() {
  // Works from src/ (tsx, tests) and dist/src/ (built server), whatever the working folder.
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 6; i++) {
    const f = join(dir, 'data', 'videos');
    if (existsSync(f)) return f;
    dir = dirname(dir);
  }
  return null;
}

const loaded = new Map<string, VideoLibrary | null>();
function library(id: string): VideoLibrary | null {
  const known = loaded.get(id);
  if (known !== undefined) return known;
  const dir = folder();
  const f = dir && join(dir, `${id}.json`);
  const lib = f && existsSync(f) ? Library.parse(JSON.parse(readFileSync(f, 'utf8'))) : null;
  loaded.set(id, lib);
  return lib;
}

/** Tests can put libraries in without the files. */
export function useSubjectVideos(list: VideoLibrary[] | null) {
  loaded.clear();
  fresh.clear();
  refreshedAt = 0;
  for (const lib of list ?? []) loaded.set(lib.id, lib);
}

/**
 * YouTube's developer policies: data from the API must be refreshed within 30 days, and a video that's
 * gone must stop showing. Rechecks every chosen video, and Future skills', and keeps the answers here.
 * `null` means the video was deleted, made private or can no longer be embedded.
 */
const fresh = new Map<string, Pick<Video, 'title' | 'channel' | 'seconds'> | null>();
const REFRESH_AFTER = 25 * 86_400_000;
let refreshedAt = 0;

const isoSeconds = (iso: string) => {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return m ? Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) : 0;
};

export async function refreshSubjectVideos(now = Date.now()) {
  const key = config.YOUTUBE_API_KEY;
  if (!key || now - refreshedAt < REFRESH_AFTER) return;
  const ids = new Set<string>();
  for (const id of LIBRARIES) for (const t of library(id)?.topics ?? []) for (const v of t.videos) ids.add(v.youtubeId);
  for (const s of allSkills()) for (const v of s.videos) ids.add(v.youtubeId);
  const list = [...ids];
  for (let i = 0; i < list.length; i += 50) {
    const batch = list.slice(i, i + 50);
    const params = new URLSearchParams({
      part: 'snippet,contentDetails,status',
      id: batch.join(','),
      maxResults: '50',
      key,
    });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
    if (!res.ok) throw new Error(`YouTube ${res.status}`);
    const body = (await res.json()) as {
      items?: {
        id: string;
        snippet: { title: string; channelTitle: string };
        contentDetails: { duration: string };
        status: { embeddable: boolean; privacyStatus: string };
      }[];
    };
    const found = new Map(body.items?.map((v) => [v.id, v]) ?? []);
    for (const id of batch) {
      const v = found.get(id);
      fresh.set(
        id,
        v && v.status.embeddable && v.status.privacyStatus === 'public'
          ? { title: v.snippet.title, channel: v.snippet.channelTitle, seconds: isoSeconds(v.contentDetails.duration) }
          : null,
      );
    }
  }
  refreshedAt = now;
}

/** A video with its latest details from YouTube, or null if it's gone. */
export function liveVideo<T extends Video>(v: T): T | null {
  const f = fresh.get(v.youtubeId);
  if (f === null) return null;
  return f ? { ...v, ...f } : v;
}

const liveTopic = (t: VideoLibrary['topics'][number]) => ({
  ...t,
  videos: t.videos.map(liveVideo).filter((v): v is Video => !!v),
});

/**
 * What a shelf subject's Videos tab lists: its topics with videos and flashcard lessons, with those for
 * the student's stage first. Other topics stay, for revising and searching.
 */
export function videosFor(subject: string, stage: string | undefined, lang: LanguageId) {
  const libs = librariesFor(subject);
  const topics = libs.flatMap((id) => {
    const lib = library(id);
    if (!lib) return [];
    const { libraryName, topics: cards } = libraryCards(id, lang);
    return cards.flatMap((card) => {
      const t = lib.topics.find((x) => x.id === card.id);
      if (!t) return [];
      const { videos, flashcards } = liveTopic(t);
      if (!videos.length && !flashcards.length) return [];
      return [{ library: id, libraryName, ...card, yours: card.stage === stage, videos, flashcards }];
    });
  });
  return {
    reels: libs.flatMap((id) => REELS[id] ?? []),
    topics: [...topics.filter((t) => t.yours), ...topics.filter((t) => !t.yours)],
  };
}

/** One topic's videos, for the lesson screen's "next video". */
export function videoTopic(libraryId: string, topic: string, lang: LanguageId) {
  if (!(LIBRARIES as readonly string[]).includes(libraryId) && !loaded.has(libraryId)) return null;
  const t = library(libraryId)?.topics.find((x) => x.id === topic);
  if (!t) return null;
  const { libraryName, topics } = libraryCards(libraryId as LibraryId, lang);
  const card = topics.find((c) => c.id === topic);
  return { library: libraryId, libraryName, id: topic, title: card?.title ?? topic, videos: liveTopic(t).videos };
}
