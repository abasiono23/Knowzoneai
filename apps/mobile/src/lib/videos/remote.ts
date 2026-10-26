import { post, request } from '../api';
import { API_URL } from '../config';
import type { GeneratedVideo, Scene, Video, VideoSettings, VideoSource } from './types';

/** The short-video API (real mode). Narration and pictures are server files; the app plays them. */

const full = (path?: string) => (path?.startsWith('/') ? `${API_URL}${path}` : path);
const withFiles = <T extends Video>(v: T): T => ({
  ...v,
  scenes: v.scenes.map((s) => ({ ...s, audio: full(s.audio), image: full(s.image) })),
});

/** Knowzone Originals in the app's language (ids are v-<lessonId>). */
export const originals = async () =>
  (await request<{ videos: Video[] }>('/videos/originals')).videos.map(withFiles);

export const get = async (id: string) =>
  withFiles((await request<{ video: GeneratedVideo }>(`/videos/${id}`)).video);

/** Generated videos changed since the last sync, and the ids of all of them (to drop deleted ones). */
export async function syncMine(since?: number) {
  const r = await request<{ videos: GeneratedVideo[]; ids: string[]; serverTime: number }>(
    `/videos/mine${since ? `?since=${since}` : ''}`,
  );
  return { ...r, videos: r.videos.map(withFiles) };
}

export const create = async (id: string, input: { title: string; source: VideoSource; settings: VideoSettings }) =>
  withFiles((await post<{ video: GeneratedVideo }>(`/videos/mine/${id}`, input)).video);
export const retry = async (id: string) =>
  withFiles((await post<{ video: GeneratedVideo }>(`/videos/mine/${id}/retry`)).video);
export const regenerate = async (id: string, settings: VideoSettings) =>
  withFiles((await post<{ video: GeneratedVideo }>(`/videos/mine/${id}/regenerate`, { settings })).video);

/** Instant edits; edited narration lines come back re-recorded. */
export async function edit(id: string, scenes: Scene[], settings: VideoSettings) {
  const r = await request<{ video: GeneratedVideo }>(`/videos/mine/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      scenes: scenes.map((s) => ({
        id: s.id,
        heading: s.heading,
        caption: s.caption,
        ...(s.body !== undefined && { body: s.body }),
        ...(s.bullets && { bullets: s.bullets }),
      })),
      settings: { styleId: settings.styleId, captions: settings.captions, captionStyle: settings.captionStyle },
    }),
  });
  return withFiles(r.video);
}

export const remove = (id: string) => request(`/videos/mine/${id}`, { method: 'DELETE' });

export type VideoState = {
  liked: string[];
  saved: Record<string, string>;
  collections: string[];
  offline: string[];
  progress: Record<string, number>;
};
export const state = () => request<VideoState>('/me/videos');
export const like = (id: string, liked: boolean) => post(`/me/videos/${id}/like`, { liked });
export const save = (id: string, collection: string, offline: boolean) =>
  request(`/me/videos/${id}/save`, { method: 'PUT', body: JSON.stringify({ collection, offline }) });
export const unsave = (id: string) => request(`/me/videos/${id}/save`, { method: 'DELETE' });
export const addCollection = (name: string) => post('/me/video-collections', { name });
export const progress = (id: string, seconds: number) =>
  request(`/me/videos/${id}/progress`, { method: 'PUT', body: JSON.stringify({ seconds }) });
export const report = (id: string, reason: string, details: string) =>
  post(`/me/videos/${id}/report`, { reason, details });
