import { request } from '@/lib/api';

/**
 * The Videos feed: the courses' YouTube videos one after another, like short videos, with search.
 * Likes and comments use the reel endpoints (ids are `yt-<YouTube id>`).
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
  lessonId: string;
  likes: number;
  comments: number;
  liked: boolean;
};
export type WatchFeed = {
  videos: WatchVideo[];
  total: number;
  next: number | null;
  subjects?: { id: string; videos: number }[];
};

export const watchApi = {
  feed: ({ q, subject, offset }: { q: string; subject?: string; offset: number }) =>
    request<WatchFeed>(
      `/watch?${new URLSearchParams({ q, offset: String(offset), ...(subject && { subject }) }).toString()}`,
    ),
};

/** YouTube's still for a video. */
export const thumbnail = (youtubeId: string) => `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

/** Where the video's course lesson opens. */
export const lessonHref = (v: Pick<WatchVideo, 'courseId' | 'lessonId'>) =>
  `/courses/${v.courseId}/lesson/${v.lessonId.split('/').slice(1).join('/')}`;
