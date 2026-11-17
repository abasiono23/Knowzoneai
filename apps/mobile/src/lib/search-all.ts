import { request } from '@/lib/api';
import type { ExamId } from '@/lib/exams';

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
  exams: { exam: ExamId; subject: string }[];
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

/** `region` is the student's study region: their own exams are found by subject, others only by name. */
export const searchAll = (q: string, country?: string, region?: string) =>
  request<SearchResults>(
    `/search/all?q=${encodeURIComponent(q)}${country ? `&country=${country}` : ''}${region ? `&region=${region}` : ''}`,
  );

// ─── Smart search ─────────────────────────────────────────────────────────────

/** What smart search finds: by meaning as well as by words, best first, each with the screen that opens it. */
type SmartFound = { id: string; title: string; snippet: string; link: string };
export type SmartNote = SmartFound & { kind: 'note'; library: string; libraryName: string; topic: string; short: string };
export type SmartQuestion = SmartFound & { kind: 'question'; paper: string; n: number; exam: string; subject: string; topic: string };
export type SmartBook = SmartFound & { kind: 'book'; book: SearchBook };
export type SmartItem = SmartNote | SmartQuestion | SmartBook;

/** Notes, practice questions and books for a search. `semantic` is false when the server only matched words. */
export const searchSmart = (q: string, country?: string, region?: string) =>
  request<{ semantic: boolean; items: SmartItem[] }>(
    `/search/semantic?q=${encodeURIComponent(q)}&limit=30${country ? `&country=${country}` : ''}${region ? `&region=${region}` : ''}`,
  );

/**
 * The search results with smart search's finds put in: its summaries and books first, in its order (it
 * has already weighed the word matches), then whatever else the word search found. Practice questions
 * are smart search's alone.
 */
export function withSmart(all: SearchResults, smart: SmartItem[] | null) {
  if (!smart?.length) return { ...all, questions: [] as SmartQuestion[] };
  const notes = smart.filter((x): x is SmartNote => x.kind === 'note');
  const books = smart.filter((x): x is SmartBook => x.kind === 'book');
  const noteKeys = new Set(notes.map((n) => `${n.library}/${n.topic}`));
  const bookTitles = new Set(books.map((b) => b.title.toLowerCase()));
  return {
    ...all,
    summaries: [
      ...notes.map((n) => ({ library: n.library, libraryName: n.libraryName, id: n.topic, title: n.title, short: n.short })),
      ...all.summaries.filter((s) => !noteKeys.has(`${s.library}/${s.id}`)),
    ],
    books: [...books.map((b) => b.book), ...all.books.filter((b) => !bookTitles.has(b.title.toLowerCase()))],
    questions: smart.filter((x): x is SmartQuestion => x.kind === 'question'),
  };
}
