import { request } from '@/lib/api';

/** The dashboard's search across videos, summaries, books, reels, courses, past questions and Future skills. */
export type SearchVideo = {
  youtubeId: string;
  title: string;
  channel: string;
  seconds: number;
  where: string;
  subject?: string;
} & (
  | { kind: 'shelf'; library: string; topic: string }
  | { kind: 'skill'; skill: string }
  | { kind: 'course'; courseId: string; lessonId: string }
);
export type SearchSummary = { library: string; libraryName: string; id: string; title: string; short: string };
export type SearchBook = {
  id: string;
  title: string;
  authors: string[];
  cover: string | null;
  free: boolean;
  readUrl: string | null;
  shelf: string;
};
export type SearchResults = {
  videos: SearchVideo[];
  summaries: SearchSummary[];
  books: SearchBook[];
  reels: { id: string; subject: string; text: string }[];
  courses: { id: string; title: string; subject: string }[];
  exams: { exam: 'jamb' | 'waec' | 'neco'; subject: string }[];
  skills: { id: string; name: string; tagline: string }[];
};

export const NO_RESULTS: SearchResults = {
  videos: [],
  summaries: [],
  books: [],
  reels: [],
  courses: [],
  exams: [],
  skills: [],
};

export const searchAll = (q: string, country?: string) =>
  request<SearchResults>(`/search/all?q=${encodeURIComponent(q)}${country ? `&country=${country}` : ''}`);
