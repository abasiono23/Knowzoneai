import { config } from '../config.js';
import { prisma } from '../db.js';
import { Prisma } from '../generated/prisma/client.js';
import { invalidateCourses } from '../routes/courses.js';

/** YouTube's developer policies: data from the API (titles, channels…) must be refreshed within 30 days. */
const REFRESH_AFTER = 25 * 86_400_000;

type Video = { youtubeId: string; title: string; channel: string; seconds: number; checkedAt?: number };

const seconds = (iso: string) => {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return m ? Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) : 0;
};

/**
 * Rechecks course videos with YouTube: refreshes their title, channel and length, and removes lessons
 * whose video was deleted, made private or can no longer be embedded. 50 videos per request (1 quota unit).
 */
export async function refreshCourseVideos(now = Date.now()) {
  const key = config.YOUTUBE_API_KEY;
  if (!key) return { checked: 0, removed: 0 };
  const lessons = (await prisma.courseLesson.findMany({ where: { kind: 'video' }, select: { id: true, content: true } })).filter(
    (l) => now - ((l.content as { video?: Video }).video?.checkedAt ?? 0) > REFRESH_AFTER,
  );
  let removed = 0;
  for (let i = 0; i < lessons.length; i += 50) {
    const batch = lessons.slice(i, i + 50);
    const ids = batch.map((l) => (l.content as { video: Video }).video.youtubeId);
    const url = `https://www.googleapis.com/youtube/v3/videos?${new URLSearchParams({ part: 'snippet,contentDetails,status', id: ids.join(','), key })}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`YouTube ${res.status}`);
    const found = new Map(
      ((await res.json()) as {
        items?: {
          id: string;
          snippet: { title: string; channelTitle: string };
          contentDetails: { duration: string };
          status: { embeddable: boolean; privacyStatus: string };
        }[];
      }).items?.map((v) => [v.id, v]) ?? [],
    );
    for (const l of batch) {
      const content = l.content as { video: Video } & Record<string, unknown>;
      const v = found.get(content.video.youtubeId);
      if (!v || !v.status.embeddable || v.status.privacyStatus !== 'public') {
        await prisma.courseLesson.delete({ where: { id: l.id } });
        removed++;
        continue;
      }
      const video: Video = {
        youtubeId: v.id,
        title: v.snippet.title,
        channel: v.snippet.channelTitle,
        seconds: seconds(v.contentDetails.duration),
        checkedAt: now,
      };
      await prisma.courseLesson.update({
        where: { id: l.id },
        data: {
          summary: `${video.title} · ${video.channel}`,
          content: {
            ...content,
            video,
            resources: [{ id: 'youtube', kind: 'link', title: 'Watch on YouTube', meta: video.channel, body: `https://www.youtube.com/watch?v=${video.youtubeId}` }],
          } as Prisma.InputJsonValue,
        },
      });
    }
  }
  if (lessons.length) {
    invalidateCourses();
    console.log(`Course videos: rechecked ${lessons.length}, removed ${removed} no longer available`);
  }
  return { checked: lessons.length, removed };
}
