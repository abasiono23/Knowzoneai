import { API_URL } from '@/lib/config';
import { post, request } from '@/lib/api';

/**
 * "Did you know?" reels (the dashboard's Flashcards): each reel is one fun fact explained in 5 cards,
 * with a picture and English narration per card. Likes and comments are kept on the server; comments
 * are screened before they appear.
 */
export type ReelCard = { text: string; image: string; audio?: string; seconds?: number };
export type Reel = {
  id: string;
  subject: string;
  cards: ReelCard[];
  likes: number;
  comments: number;
  liked: boolean;
};
export type ReelComment = {
  id: string;
  text: string;
  createdAt: number;
  mine: boolean;
  name: string | null;
  photo?: string;
};

/** Media paths from the server become full addresses. */
export const media = (path: string) => `${API_URL}${path}`;

export const reelsApi = {
  feed: () => request<{ reels: Reel[] }>('/reels'),
  like: (id: string, liked: boolean) => post<{ liked: boolean; likes: number }>(`/me/reels/${id}/like`, { liked }),
  comments: (id: string) => request<{ comments: ReelComment[] }>(`/reels/${id}/comments`),
  comment: (id: string, text: string) => post<{ comment: ReelComment }>(`/me/reels/${id}/comments`, { text }),
  remove: (commentId: string) => request<{ ok: true }>(`/me/reels/comments/${commentId}`, { method: 'DELETE' }),
  report: (commentId: string) => post<{ ok: true }>(`/me/reels/comments/${commentId}/report`),
};

/** Seconds a card stays on screen: its narration, or a reading time when there's none. */
export const cardSeconds = (c: ReelCard, narrated: boolean) =>
  Math.max(3.5, narrated && c.seconds ? c.seconds + 0.8 : 2 + c.text.length / 18);
