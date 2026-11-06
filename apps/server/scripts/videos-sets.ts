/**
 * Video sets beyond the summaries' subjects, in three steps across days, because a YouTube search costs
 * 100 of the 10,000 daily quota units. Safe to run again: it carries on where it stopped.
 *
 *   npx tsx scripts/videos-sets.ts channels <folder>          uploads of trusted channels (cheap)
 *   npx tsx scripts/videos-sets.ts search <folder> <budget>   searches for topics not searched yet
 *   npx tsx scripts/videos-sets.ts shortlist <folder>         writes shortlist-<set>.json for review
 *   npx tsx scripts/videos-sets.ts build <folder>             writes data/videos from pick-<set>.json and subjects.json
 *
 * <folder> holds set-<id>.json (topics and searches) and channels.json ({ "handle": ["set", ...] }).
 */
import 'dotenv/config';

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const [step, dir, budgetArg] = process.argv.slice(2);
if (!step || !dir) throw new Error('Usage: videos-sets <channels|search|shortlist> <folder> [budget]');
const key = process.env.YOUTUBE_API_KEY;
if (!key) throw new Error('YOUTUBE_API_KEY is not set');

type Video = { id: string; title: string; channel: string; description: string; seconds: number; views: number };
type Topic = { id: string; stage: string; title: { en: string }; query: string };
type SetFile = { id: string; topics: Topic[] };

let units = 0;
async function api<T>(path: string, params: Record<string, string>, cost = 1): Promise<T> {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/${path}?${new URLSearchParams({ ...params, key: key! })}`,
  );
  units += cost;
  if (!res.ok) throw new Error(`YouTube ${path} ${res.status}`);
  return (await res.json()) as T;
}
const load = <T>(name: string, empty: T): T =>
  existsSync(join(dir!, name)) ? (JSON.parse(readFileSync(join(dir!, name), 'utf8')) as T) : empty;
const save = (name: string, value: unknown) => writeFileSync(join(dir!, name), JSON.stringify(value));

const sets = readdirSync(dir)
  .filter((f) => /^set-.*\.json$/.test(f))
  .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as SetFile);

const videos = new Map(load<Video[]>('videos.json', []).map((v) => [v.id, v]));
/** Ids found for a whole set (channels) and for one topic (searches). */
const bySet = load<Record<string, string[]>>('by-set.json', {});
const byTopic = load<Record<string, string[]>>('by-topic.json', {});

const isoSeconds = (iso: string) => {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return m ? Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) : 0;
};

/** Details for new ids, keeping only public, embeddable lessons of a sensible length. */
async function details(ids: string[]) {
  const seen = load<string[]>('seen.json', []);
  const known = new Set(seen);
  const todo = [...new Set(ids)].filter((id) => !known.has(id));
  for (let i = 0; i < todo.length; i += 50) {
    const r = await api<{
      items?: {
        id: string;
        snippet: { title: string; channelTitle: string; description: string };
        contentDetails: { duration: string };
        statistics: { viewCount?: string };
        status: { embeddable: boolean; privacyStatus: string };
      }[];
    }>('videos', {
      part: 'snippet,contentDetails,statistics,status',
      id: todo.slice(i, i + 50).join(','),
      maxResults: '50',
    });
    for (const v of r.items ?? []) {
      const seconds = isoSeconds(v.contentDetails.duration);
      if (!v.status.embeddable || v.status.privacyStatus !== 'public' || seconds < 90 || seconds > 60 * 60) continue;
      videos.set(v.id, {
        id: v.id,
        title: v.snippet.title,
        channel: v.snippet.channelTitle,
        description: v.snippet.description.slice(0, 220).replace(/\s+/g, ' '),
        seconds,
        views: Number(v.statistics.viewCount ?? 0),
      });
    }
  }
  save('seen.json', [...seen, ...todo]);
  save('videos.json', [...videos.values()]);
}

const STOP = new Set(
  'the and for with how what why from your their that this into are its all basic basics introduction lesson lessons level video secondary school students of to in on a an as is it by or at be'.split(
    ' ',
  ),
);
const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

/** A set's channel videos that match a topic, best first. */
const channelMatches = (setId: string, t: Topic) => {
  const want = words(`${t.title.en} ${t.query}`);
  return (bySet[setId] ?? [])
    .flatMap((id) => videos.get(id) ?? [])
    .map((v) => {
      const title = new Set(words(v.title));
      return { v, score: want.filter((w) => title.has(w)).length };
    })
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score || b.v.views - a.v.views)
    .slice(0, 8)
    .map((x) => x.v);
};

if (step === 'channels') {
  const channels = load<Record<string, string[]>>('channels.json', {});
  const done = new Set(load<string[]>('channels-done.json', []));
  for (const [handle, forSets] of Object.entries(channels)) {
    if (done.has(handle)) continue;
    const c = await api<{ items?: { contentDetails: { relatedPlaylists: { uploads: string } } }[] }>('channels', {
      part: 'contentDetails',
      forHandle: `@${handle}`,
    });
    const playlist = c.items?.[0]?.contentDetails.relatedPlaylists.uploads;
    if (!playlist) {
      console.log(`@${handle}: not found`);
      done.add(handle);
      continue;
    }
    const ids: string[] = [];
    let page: string | undefined;
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
      ids.push(...(r.items?.map((x) => x.contentDetails.videoId) ?? []));
      page = r.nextPageToken;
      if (!page) break;
    }
    for (const s of forSets) bySet[s] = [...new Set([...(bySet[s] ?? []), ...ids])];
    await details(ids);
    done.add(handle);
    save('by-set.json', bySet);
    save('channels-done.json', [...done]);
    console.log(`@${handle}: ${ids.length}`);
  }
}

if (step === 'search') {
  let budget = Number(budgetArg ?? 0);
  // force-search.json: topics whose channel matches turned out to be only shared words.
  const force = new Set(
    load<string[]>('force-search.json', []).filter((k) => !load<string[]>('forced-done.json', []).includes(k)),
  );
  // Topics with the fewest channel matches first; those with plenty don't need a search.
  const left = sets
    .flatMap((s) => s.topics.map((t) => ({ set: s.id, t, have: channelMatches(s.id, t).length })))
    .filter((x) => force.has(`${x.set}/${x.t.id}`) || (!byTopic[`${x.set}/${x.t.id}`] && x.have < 5))
    .sort(
      (a, b) => Number(force.has(`${b.set}/${b.t.id}`)) - Number(force.has(`${a.set}/${a.t.id}`)) || a.have - b.have,
    );
  console.log(`${left.length} topics not searched yet`);
  try {
    for (const { set, t } of left) {
      if (budget < 100) break;
      budget -= 100;
      const r = await api<{ items?: { id: { videoId: string } }[] }>(
        'search',
        { part: 'id', q: t.query, type: 'video', videoEmbeddable: 'true', safeSearch: 'strict', maxResults: '12' },
        100,
      );
      const ids = r.items?.map((x) => x.id.videoId) ?? [];
      byTopic[`${set}/${t.id}`] = [...new Set([...ids, ...(byTopic[`${set}/${t.id}`] ?? [])])];
      if (force.has(`${set}/${t.id}`))
        save('forced-done.json', [...load<string[]>('forced-done.json', []), `${set}/${t.id}`]);
      await details(ids);
      save('by-topic.json', byTopic);
    }
  } catch (e) {
    console.log(`Stopped: ${(e as Error).message}. Run again after the quota resets.`);
  }
  console.log(`${left.filter((x) => !byTopic[`${x.set}/${x.t.id}`]).length} topics left to search`);
}

if (step === 'shortlist') {
  for (const s of sets) {
    const topics = s.topics.map((t) => {
      const found = (byTopic[`${s.id}/${t.id}`] ?? []).flatMap((id) => videos.get(id) ?? []);
      const fromChannels = channelMatches(s.id, t);
      const seen = new Set<string>();
      const candidates = [...fromChannels, ...found].filter((v) => !seen.has(v.id) && seen.add(v.id));
      return {
        id: t.id,
        stage: t.stage,
        title: t.title.en,
        candidates: candidates.map((v) => ({
          id: v.id,
          title: v.title,
          channel: v.channel,
          minutes: Math.round(v.seconds / 60),
          views: v.views,
          description: v.description,
        })),
      };
    });
    writeFileSync(join(dir, `shortlist-${s.id}.json`), JSON.stringify(topics, null, 1));
    console.log(
      `${s.id}: ${topics.filter((t) => t.candidates.length >= 2).length}/${topics.length} topics have 2+ candidates`,
    );
  }
}
if (step === 'build') {
  const ENTITIES: Record<string, string> = { '&amp;': '&', '&#39;': '’', '&quot;': '"', '&lt;': '<', '&gt;': '>' };
  const plain = (x: string) => x.replace(/&(amp|#39|quot|lt|gt);/g, (m) => ENTITIES[m] ?? m);
  const out = resolve(import.meta.dirname, '../data/videos');
  mkdirSync(out, { recursive: true });
  const built = new Set<string>();
  let total = 0;
  // held.json: sets picked but kept back until someone has checked them.
  const held = new Set(load<string[]>('held.json', []));
  for (const f of sets as (SetFile & { name: Record<string, string> })[]) {
    if (held.has(f.id)) continue;
    const file = join(dir, `pick-${f.id}.json`);
    if (!existsSync(file)) continue;
    const picks = JSON.parse(readFileSync(file, 'utf8')) as { topics: { id: string; videos: string[] }[] };
    const topics = f.topics.map((t) => {
      const chosen = picks.topics.find((x) => x.id === t.id)?.videos ?? [];
      return {
        id: t.id,
        stage: t.stage,
        title: t.title,
        flashcards: [],
        videos: [...new Set(chosen)].map((id) => {
          const v = videos.get(id);
          if (!v) throw new Error(`${f.id}/${t.id}: no video ${id}`);
          return { youtubeId: v.id, title: plain(v.title), channel: plain(v.channel), seconds: v.seconds };
        }),
      };
    });
    for (const x of picks.topics)
      if (!f.topics.some((t) => t.id === x.id)) throw new Error(`${f.id}: no topic ${x.id}`);
    writeFileSync(join(out, `${f.id}.json`), JSON.stringify({ id: f.id, name: f.name, topics }));
    built.add(f.id);
    const n = topics.reduce((a, t) => a + t.videos.length, 0);
    total += n;
    console.log(`${f.id}: ${n} videos in ${topics.filter((t) => t.videos.length).length}/${topics.length} topics`);
  }
  // subjects.json in the folder lists { set: [shelf subjects] }; the server reads { subject: [sets] }.
  const map = load<Record<string, string[]>>('subjects.json', {});
  const shelves: Record<string, string[]> = {};
  for (const [set, subjects] of Object.entries(map)) {
    if (!built.has(set)) continue;
    for (const subject of subjects) (shelves[subject] ??= []).push(set);
  }
  writeFileSync(join(out, 'subjects.json'), JSON.stringify(shelves, null, 1));
  console.log(`${built.size} sets, ${total} videos, ${Object.keys(shelves).length} subjects`);
}

console.log(`${units} quota units used`);
