import { prisma } from '../db.js';
import { feedOrder } from './reels.js';

/**
 * The Videos feed: the YouTube videos chosen for the courses (one per chapter), shown like short
 * videos. They're read from the course lessons, so the monthly YouTube recheck (course-videos.ts)
 * keeps the feed up to date too. Each video's feed id is `yt-<YouTube id>`.
 */
export type WatchVideo = {
  id: string;
  youtubeId: string;
  title: string;
  channel: string;
  seconds: number;
  courseId: string;
  course: string;
  subject: string;
  chapter: string;
  /** The course lesson that plays this video, e.g. "physics/chapter-3-video". */
  lessonId: string;
};

const TTL = 10 * 60_000;

/** YouTube search results escape titles (Newton&#39;s laws); the feed shows plain text. */
const ENTITIES: Record<string, string> = { '&amp;': '&', '&#39;': '’', '&quot;': '"', '&lt;': '<', '&gt;': '>' };
export const plain = (s: string) => s.replace(/&(amp|#39|quot|lt|gt);/g, (m) => ENTITIES[m] ?? m);
let cache: { at: number; videos: WatchVideo[] } | null = null;

export async function watchVideos(): Promise<WatchVideo[]> {
  if (cache && Date.now() - cache.at < TTL) return cache.videos;
  const lessons = await prisma.courseLesson.findMany({
    where: { kind: 'video', course: { published: true } },
    orderBy: [{ courseId: 'asc' }, { position: 'asc' }],
    include: { course: { select: { title: true, subjectId: true } }, module: { select: { title: true } } },
  });
  const seen = new Set<string>();
  const videos: WatchVideo[] = [];
  for (const l of lessons) {
    const v = (l.content as { video?: { youtubeId?: string; title?: string; channel?: string; seconds?: number } }).video;
    if (!v?.youtubeId || seen.has(v.youtubeId)) continue;
    seen.add(v.youtubeId);
    videos.push({
      id: `yt-${v.youtubeId}`,
      youtubeId: v.youtubeId,
      title: plain(v.title ?? l.title),
      channel: plain(v.channel ?? ''),
      seconds: v.seconds ?? 0,
      courseId: l.courseId,
      course: l.course.title,
      subject: l.course.subjectId,
      chapter: l.module.title,
      lessonId: l.id,
    });
  }
  cache = { at: Date.now(), videos };
  return videos;
}

/** Tests and the course import start from a fresh list. */
export const forgetWatchVideos = () => {
  cache = null;
};

export const watchVideoById = async (id: string) => (await watchVideos()).find((v) => v.id === id);

/**
 * Search: every word must appear in the title, channel, course, chapter or subject. Videos whose
 * title has the words come first. Without a search, the order is shuffled per learner per day.
 */
export function searchVideos(videos: WatchVideo[], q: string, seed: string) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return feedOrder(videos, seed);
  const hay = (v: WatchVideo) => `${v.title} ${v.channel} ${v.course} ${v.chapter} ${v.subject}`.toLowerCase();
  const inTitle = (v: WatchVideo) => words.filter((w) => v.title.toLowerCase().includes(w)).length;
  return feedOrder(
    videos.filter((v) => words.every((w) => hay(v).includes(w))),
    seed,
  ).sort((a, b) => inTitle(b) - inTitle(a));
}
