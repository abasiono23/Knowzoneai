/**
 * Collects candidate lessons for a subject's Videos tab with the YouTube Data API: the uploads of trusted
 * education channels (cheap: 1 quota unit per 50 videos), then a search for topics still short of videos
 * (100 units each, up to a budget). Writes a shortlist per topic for review. Nothing is downloaded.
 *
 *   npx tsx scripts/videos-harvest.ts <summaries folder> <output folder> [searchBudget]
 */
import 'dotenv/config';

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { LIBRARIES } from '../src/services/summaries.js';

const [summaries, out, budgetArg] = process.argv.slice(2);
if (!summaries || !out) throw new Error('Usage: videos-harvest <summaries folder> <output folder> [searchBudget]');
const key = process.env.YOUTUBE_API_KEY;
if (!key) throw new Error('YOUTUBE_API_KEY is not set');
mkdirSync(out, { recursive: true });

let units = 0;
let searchBudget = Number(budgetArg ?? 3000);

async function api<T>(path: string, params: Record<string, string>, cost = 1): Promise<T> {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/${path}?${new URLSearchParams({ ...params, key: key! })}`,
  );
  units += cost;
  if (!res.ok) throw new Error(`YouTube ${path} ${res.status}`);
  return (await res.json()) as T;
}

/** Channels by the subjects they teach. A handle that no longer resolves is logged and skipped. */
const CHANNELS: Record<string, string[]> = {
  khanacademy: ['mathematics', 'biology', 'chemistry', 'physics', 'economics', 'computer-studies'],
  crashcourse: ['biology', 'chemistry', 'physics', 'economics', 'computer-studies', 'geography', 'english'],
  fuseschool: ['mathematics', 'biology', 'chemistry', 'physics', 'computer-studies'],
  TEDEd: ['mathematics', 'biology', 'chemistry', 'physics', 'economics', 'geography', 'english'],
  CognitoEdu: ['mathematics', 'biology', 'chemistry', 'physics', 'geography', 'computer-studies'],
  FreeScienceLessons: ['biology', 'chemistry', 'physics'],
  ProfessorDaveExplains: ['biology', 'chemistry', 'physics', 'mathematics'],
  AmoebaSisters: ['biology'],
  bozemanscience: ['biology', 'chemistry', 'physics'],
  TylerDeWitt: ['chemistry'],
  TheOrganicChemistryTutor: ['mathematics', 'chemistry', 'physics'],
  mathantics: ['mathematics'],
  corbettmaths: ['mathematics'],
  misterwootube: ['mathematics'],
  MindsetLearn: ['mathematics', 'physics', 'chemistry', 'biology', 'geography', 'economics', 'business-studies'],
  EconplusDal: ['economics'],
  ACDCLeadership: ['economics'],
  MarginalRevolutionUniversity: ['economics'],
  tutor2u: ['economics', 'business-studies', 'geography'],
  twoteachers: ['business-studies'],
  AlanisBusinessAcademy: ['business-studies'],
  bbclearningenglish: ['english'],
  EnglishwithLucy: ['english'],
  mmmEnglish_Emma: ['english'],
  mrbruff: ['english'],
  craigndave: ['computer-studies'],
  computerphile: ['computer-studies'],
  cs50: ['computer-studies'],
  freecodecamp: ['computer-studies'],
  ComputerScienceLessons: ['computer-studies'],
  BBCTeach: ['geography', 'biology', 'english'],
  FAO: ['agricultural-science'],
  MrSinn: ['geography'],
};

type Video = {
  id: string;
  title: string;
  channel: string;
  description: string;
  seconds: number;
  views: number;
  language?: string;
  subjects: string[];
};

const isoSeconds = (iso: string) => {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return m ? Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) : 0;
};

const wanted = new Map<string, Set<string>>();
const addIds = (ids: string[], subjects: string[]) => {
  for (const id of ids) {
    const set = wanted.get(id) ?? new Set<string>();
    for (const s of subjects) set.add(s);
    wanted.set(id, set);
  }
};

async function uploads(handle: string, subjects: string[]) {
  const c = await api<{ items?: { contentDetails: { relatedPlaylists: { uploads: string } } }[] }>('channels', {
    part: 'contentDetails',
    forHandle: `@${handle}`,
  });
  const playlist = c.items?.[0]?.contentDetails.relatedPlaylists.uploads;
  if (!playlist) return console.log(`  @${handle}: not found`);
  let page: string | undefined;
  let count = 0;
  // 1000 videos a channel is plenty, and keeps the largest channels from using up the quota.
  for (let i = 0; i < 20; i++) {
    const r = await api<{ items?: { contentDetails: { videoId: string } }[]; nextPageToken?: string }>(
      'playlistItems',
      {
        part: 'contentDetails',
        playlistId: playlist,
        maxResults: '50',
        ...(page ? { pageToken: page } : {}),
      },
    );
    const ids = r.items?.map((x) => x.contentDetails.videoId) ?? [];
    addIds(ids, subjects);
    count += ids.length;
    page = r.nextPageToken;
    if (!page) break;
  }
  console.log(`  @${handle}: ${count}`);
}

/** Full details for ids not seen yet, keeping only public, embeddable lessons of a sensible length. */
async function details(known: Map<string, Video>) {
  const todo = [...wanted.keys()].filter((id) => !known.has(id));
  for (let i = 0; i < todo.length; i += 50) {
    const r = await api<{
      items?: {
        id: string;
        snippet: {
          title: string;
          channelTitle: string;
          description: string;
          defaultAudioLanguage?: string;
          defaultLanguage?: string;
        };
        contentDetails: { duration: string };
        statistics: { viewCount?: string };
        status: { embeddable: boolean; privacyStatus: string; madeForKids?: boolean };
      }[];
    }>('videos', {
      part: 'snippet,contentDetails,statistics,status',
      id: todo.slice(i, i + 50).join(','),
      maxResults: '50',
    });
    for (const v of r.items ?? []) {
      const seconds = isoSeconds(v.contentDetails.duration);
      if (!v.status.embeddable || v.status.privacyStatus !== 'public') continue;
      if (seconds < 90 || seconds > 45 * 60) continue;
      const language = v.snippet.defaultAudioLanguage ?? v.snippet.defaultLanguage;
      if (language && !language.toLowerCase().startsWith('en')) continue;
      known.set(v.id, {
        id: v.id,
        title: v.snippet.title,
        channel: v.snippet.channelTitle,
        description: v.snippet.description.slice(0, 220).replace(/\s+/g, ' '),
        seconds,
        views: Number(v.statistics.viewCount ?? 0),
        language,
        subjects: [...(wanted.get(v.id) ?? [])],
      });
    }
  }
}

type Topic = { id: string; stage: string; title: string; short: string; keywords: string[] };
const topicsFor = (lib: string): Topic[] =>
  (JSON.parse(readFileSync(join(summaries!, 'en', `${lib}.json`), 'utf8')) as { topics: Topic[] }).topics;

const STOP = new Set(
  'the and for with how what why from your their that this into are its all basic basics introduction intro part lesson lessons gcse igcse level video videos explained explanation learn learning understanding use using of to in on a an as is it by or at be'.split(
    ' ',
  ),
);
const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

function score(t: Topic, v: Video) {
  const title = new Set(words(v.title));
  const desc = new Set(words(v.description));
  let s = 0;
  for (const w of new Set(words(t.title))) if (title.has(w)) s += 3;
  for (const k of t.keywords) {
    const kw = words(k);
    if (!kw.length) continue;
    if (kw.every((w) => title.has(w))) s += kw.length > 1 ? 5 : 3;
    else if (kw.every((w) => desc.has(w))) s += 1;
  }
  return s;
}

const shortlist = (t: Topic, lib: string, all: Video[]) =>
  all
    .filter((v) => v.subjects.includes(lib))
    .map((v) => ({ v, s: score(t, v) }))
    .filter((x) => x.s >= 3)
    .sort((a, b) => b.s - a.s || b.v.views - a.v.views)
    .slice(0, 14)
    .map((x) => x.v);

const cacheFile = join(out, 'videos.json');
const known = new Map<string, Video>(
  existsSync(cacheFile) ? (JSON.parse(readFileSync(cacheFile, 'utf8')) as Video[]).map((v) => [v.id, v]) : [],
);
for (const v of known.values()) addIds([v.id], v.subjects);

if (!known.size) {
  console.log('Channels:');
  for (const [handle, subjects] of Object.entries(CHANNELS)) {
    try {
      await uploads(handle, subjects);
    } catch (e) {
      console.log(`  @${handle}: ${(e as Error).message}`);
    }
  }
}
await details(known);
writeFileSync(cacheFile, JSON.stringify([...known.values()]));
console.log(`${known.size} usable videos, ${units} units so far`);

// Topics still short of candidates get a search, including exam-style lessons from African teachers.
const short: { lib: string; t: Topic }[] = [];
for (const lib of LIBRARIES)
  for (const t of topicsFor(lib)) if (shortlist(t, lib, [...known.values()]).length < 4) short.push({ lib, t });
console.log(`${short.length} topics short of candidates`);

const NAMES: Record<string, string> = {
  english: 'English grammar',
  'computer-studies': 'computer science',
  'business-studies': 'business studies',
  'agricultural-science': 'agricultural science',
};
for (const { lib, t } of short) {
  if (searchBudget < 100) break;
  searchBudget -= 100;
  try {
    const r = await api<{ items?: { id: { videoId: string } }[] }>(
      'search',
      {
        part: 'id',
        q: `${t.title.split(':')[0]} ${NAMES[lib] ?? lib} lesson`,
        type: 'video',
        videoEmbeddable: 'true',
        safeSearch: 'strict',
        relevanceLanguage: 'en',
        maxResults: '12',
      },
      100,
    );
    addIds(r.items?.map((x) => x.id.videoId) ?? [], [lib]);
  } catch (e) {
    console.log(`search stopped: ${(e as Error).message}`);
    break;
  }
}
await details(known);
writeFileSync(cacheFile, JSON.stringify([...known.values()]));

for (const lib of LIBRARIES) {
  const all = [...known.values()];
  const topics = topicsFor(lib).map((t) => ({
    id: t.id,
    stage: t.stage,
    title: t.title,
    short: t.short,
    candidates: shortlist(t, lib, all).map(({ id, title, channel, seconds, views, description }) => ({
      id,
      title,
      channel,
      minutes: Math.round(seconds / 60),
      views,
      description,
    })),
  }));
  writeFileSync(join(out, `shortlist-${lib}.json`), JSON.stringify(topics, null, 1));
  console.log(
    `${lib}: ${topics.filter((t) => t.candidates.length >= 2).length}/${topics.length} topics have 2+ candidates`,
  );
}
console.log(`Done: ${units} quota units used`);
