import { post, request } from '@/lib/api';

/**
 * Past Questions (JAMB, WAEC, NECO). Papers come from the server: AI practice papers in each exam's
 * format (numbered, never given a year) and licensed real papers under the year they were set.
 */
export type ExamId = 'jamb' | 'waec' | 'neco';
export const EXAM_IDS: ExamId[] = ['jamb', 'waec', 'neco'];
export type ExamSubjectId =
  | 'english'
  | 'mathematics'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'economics'
  | 'government'
  | 'literature'
  | 'geography'
  | 'commerce';

export const SUBJECT_ICONS: Record<ExamSubjectId, { icon: string; color: string }> = {
  english: { icon: 'text', color: '#4CC9FF' },
  mathematics: { icon: 'calculator', color: '#9B82FF' },
  physics: { icon: 'magnet', color: '#FF9F43' },
  chemistry: { icon: 'flask', color: '#2DD4BF' },
  biology: { icon: 'leaf', color: '#7CE38B' },
  economics: { icon: 'trending-up', color: '#FFC857' },
  government: { icon: 'business', color: '#FF7A93' },
  literature: { icon: 'book', color: '#E79BFF' },
  geography: { icon: 'earth', color: '#5AD1A0' },
  commerce: { icon: 'cart', color: '#FFB86B' },
};

export type ExamsOverview = {
  exams: {
    id: ExamId;
    subjects: { id: ExamSubjectId; papers: number; years: number[]; questions: number }[];
  }[];
};
export type PaperSummary = {
  id: string;
  exam: ExamId;
  subject: ExamSubjectId;
  year: number | null;
  number: number | null;
  source: 'ai' | 'licensed';
  credit?: string;
  minutes: number;
  questions: number;
  locked: boolean;
  best?: number | null;
  attempts?: number;
};
export type ExamQuestion = {
  n: number;
  topic: string;
  passage?: string;
  q: string;
  options: string[];
  answer: number;
  explanation: string;
};
export type Paper = Omit<PaperSummary, 'questions'> & { questions: ExamQuestion[] };
export type ExamAttempt = {
  id: string;
  paperId: string;
  mode: 'practice' | 'timed';
  score: number;
  total: number;
  seconds: number;
  createdAt: number;
};
export type TopicScore = { topic: string; right: number; total: number };

export const examsApi = {
  overview: () => request<ExamsOverview>('/exams'),
  papers: (exam: ExamId, subject: ExamSubjectId) =>
    request<{ exam: ExamId; subject: ExamSubjectId; topics: string[]; papers: PaperSummary[] }>(
      `/exams/${exam}/${subject}`,
    ),
  paper: (id: string) => request<{ paper: Paper }>(`/exams/papers/${encodeURIComponent(id)}`),
  submit: (id: string, mode: 'practice' | 'timed', answers: number[], seconds: number) =>
    post<{ attempt: ExamAttempt; topics: TopicScore[] }>(`/exams/papers/${encodeURIComponent(id)}/attempts`, {
      mode,
      answers,
      seconds,
    }),
  attempts: (paperId: string) =>
    request<{ attempts: ExamAttempt[] }>(`/me/exams/attempts?paper=${encodeURIComponent(paperId)}`),
};

const papers = new Map<string, Paper>();
/** A paper, fetched once per app session (study, practice and timed screens share it). */
export async function loadPaper(id: string) {
  const cached = papers.get(id);
  if (cached) return cached;
  const { paper } = await examsApi.paper(id);
  papers.set(id, paper);
  return paper;
}

const SUPER: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '+': '⁺' };
/** Exam text for display: powers written with a caret (10^8, s^-1, x^(2)) become superscripts (10⁸, s⁻¹, x²). */
export const pretty = (text: string) =>
  text.replace(/\^\(?([+-]?\d+)\)?/g, (_, n: string) => [...n].map((c) => SUPER[c] ?? c).join(''));

export const LETTERS = 'ABCDE';
/** "1:05:09" or "27:00". */
export function clock(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`;
}
