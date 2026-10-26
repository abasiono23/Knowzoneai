import { prisma } from '../db.js';
import type { Category as DbCategory, Lesson as DbLesson, Subject as DbSubject } from '../generated/prisma/client.js';
import { type LanguageId } from './personalization.js';

/** API shapes match the app's catalogue types, so the app can swap its built-in copy for these. */
export type Category = { id: string; name: string; icon: string; color: string };
export type Subject = {
  id: string;
  name: string;
  emoji: string;
  category: string;
  colors: [string, string];
  description: string;
  topics: string[];
};
export type Lesson = {
  id: string;
  title: string;
  subjectId: string;
  topic: string;
  format: string;
  minutes: number;
  level: string;
  views: number;
  rating: number;
  trend: number;
  summary: string;
  keyPoints: string[];
  exams: string[];
};
export type Catalog = { version: string; language: LanguageId; categories: Category[]; subjects: Subject[]; lessons: Lesson[] };

type Raw = { categories: DbCategory[]; subjects: DbSubject[]; lessons: DbLesson[]; loadedAt: number };

const TTL = 60_000;
let raw: Raw | null = null;
const localized = new Map<LanguageId, Catalog>();

/** The catalogue is small and read constantly, so it's cached in memory and refreshed every minute. */
async function load(): Promise<Raw> {
  if (raw && Date.now() - raw.loadedAt < TTL) return raw;
  const [categories, subjects, lessons] = await Promise.all([
    prisma.category.findMany({ orderBy: { position: 'asc' } }),
    prisma.subject.findMany({ orderBy: { position: 'asc' } }),
    prisma.lesson.findMany({ where: { published: true }, orderBy: { createdAt: 'asc' } }),
  ]);
  raw = { categories, subjects, lessons, loadedAt: Date.now() };
  localized.clear();
  return raw;
}

/** Drops the cache (after seeding or edits, and in tests). */
export function invalidateCatalog() {
  raw = null;
  localized.clear();
}

type I18n = Record<string, Record<string, unknown> | undefined>;
/** A translated field, falling back to English when a language doesn't have it yet. */
function pick<T>(i18n: unknown, lang: LanguageId, field: string, fallback: T): T {
  const v = (i18n as I18n)?.[lang]?.[field];
  if (Array.isArray(fallback)) return (Array.isArray(v) && v.length === fallback.length ? v : fallback) as T;
  return (typeof v === 'string' && v ? v : fallback) as T;
}

/** The whole catalogue in one language. */
export async function catalogFor(lang: LanguageId): Promise<Catalog> {
  const r = await load();
  const cached = localized.get(lang);
  if (cached) return cached;
  const catalog: Catalog = {
    version: `${r.loadedAt}`,
    language: lang,
    categories: r.categories.map((c) => ({
      id: c.id,
      name: pick(c.i18n, lang, 'name', c.name),
      icon: c.icon,
      color: c.color,
    })),
    subjects: r.subjects.map((s) => ({
      id: s.id,
      name: pick(s.i18n, lang, 'name', s.name),
      emoji: s.emoji,
      category: s.categoryId,
      colors: [s.colors[0], s.colors[1]] as [string, string],
      description: pick(s.i18n, lang, 'description', s.description),
      topics: pick(s.i18n, lang, 'topics', s.topics),
    })),
    lessons: r.lessons.map((l) => ({
      id: l.id,
      title: pick(l.i18n, lang, 'title', l.title),
      subjectId: l.subjectId,
      topic: pick(l.i18n, lang, 'topic', l.topic),
      format: l.format,
      minutes: l.minutes,
      level: l.level,
      views: l.views,
      rating: Math.round(l.rating * 10) / 10,
      trend: l.trend,
      summary: pick(l.i18n, lang, 'summary', l.summary),
      keyPoints: pick(l.i18n, lang, 'keyPoints', l.keyPoints),
      exams: l.exams,
    })),
  };
  localized.set(lang, catalog);
  return catalog;
}

export function trendingIn(c: Catalog, subjectId?: string, limit = 20) {
  return c.lessons
    .filter((l) => !subjectId || l.subjectId === subjectId)
    .sort((a, b) => b.trend - a.trend || b.views - a.views)
    .slice(0, limit);
}

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

/**
 * Searches subjects, topics and lessons in the learner's language and in English (students often
 * type English terms), ignoring accents and tone marks. Every word must match.
 */
export async function searchCatalog(lang: LanguageId, query: string) {
  const words = fold(query.trim()).split(/\s+/).filter(Boolean);
  if (!words.length) return { subjects: [], topics: [], lessons: [] };
  const [c, en] = await Promise.all([catalogFor(lang), lang === 'en' ? null : catalogFor('en')]);
  const enSubject = new Map(en?.subjects.map((s) => [s.id, s]));
  const enLesson = new Map(en?.lessons.map((l) => [l.id, l]));
  const hit = (...texts: (string | undefined)[]) => {
    const hay = fold(texts.filter(Boolean).join(' '));
    return words.every((w) => hay.includes(w));
  };
  const subjectName = new Map(c.subjects.map((s) => [s.id, s.name]));
  return {
    subjects: c.subjects.filter((s) => hit(s.name, s.description, enSubject.get(s.id)?.name)),
    topics: c.subjects.flatMap((s) =>
      s.topics
        .map((topic, i) => ({ topic, english: enSubject.get(s.id)?.topics[i] }))
        .filter((t) => hit(t.topic, t.english))
        .map((t) => ({ subjectId: s.id, topic: t.topic })),
    ),
    lessons: c.lessons
      .filter((l) => {
        const e = enLesson.get(l.id);
        return hit(l.title, l.topic, l.summary, subjectName.get(l.subjectId), l.exams.join(' '), e?.title, e?.topic);
      })
      .sort((a, b) => b.views - a.views),
  };
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export type Reason =
  | { kind: 'popular' }
  | { kind: 'interest'; interest: string }
  | { kind: 'studies'; subjectId: string }
  | { kind: 'exam'; exam: string };

const FORMAT_FROM_PREF: Record<string, string> = {
  videos: 'video',
  summaries: 'summary',
  quizzes: 'quiz',
  flashcards: 'flashcards',
  audio: 'audio',
};

const SUBJECTS_FOR_INTEREST: Record<string, string[]> = {
  coding: ['computer-science'],
  ai: ['ai-literacy', 'computer-science'],
  space: ['physics'],
  health: ['biology'],
  nature: ['biology', 'geography'],
  environment: ['geography', 'biology'],
  business: ['entrepreneurship', 'economics'],
  money: ['economics', 'accounting'],
  history: ['history', 'government'],
  writing: ['english', 'literature'],
  puzzles: ['mathematics', 'further-maths'],
};

/** Personalization exam ids → the exam tags lessons carry. */
const EXAM_TAGS: Record<string, string> = {
  waec: 'WAEC',
  neco: 'NECO',
  jamb: 'JAMB',
  'post-utme': 'JAMB',
  bece: 'BECE',
  gce: 'WAEC',
  igcse: 'IGCSE',
  sat: 'SAT',
};

type Profile = { subjects?: string[]; interests?: string[]; formats?: string[]; examGoals?: string[] } | null;

/** Maps a stored subject name (English, from personalization) to a catalogue subject. */
function matchSubject(subjects: Subject[], name: string) {
  const n = name.toLowerCase();
  return subjects.find(
    (s) => s.name.toLowerCase() === n || n.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(n),
  );
}

/**
 * Scores lessons against the learner's answers and history and explains each pick: their subjects
 * count most, then their exams, then interests, then preferred formats and what's trending.
 * Finished lessons are skipped; started ones are nudged down (they appear in Continue learning).
 */
export async function recommend(lang: LanguageId, profile: Profile, progress: Map<string, number>, limit = 12) {
  const [c, en] = await Promise.all([catalogFor(lang), catalogFor('en')]);
  const mySubjects = new Set(
    (profile?.subjects ?? []).map((s) => matchSubject(en.subjects, s)?.id).filter(Boolean) as string[],
  );
  const interestSubjects = new Map<string, string>();
  for (const i of profile?.interests ?? []) for (const s of SUBJECTS_FOR_INTEREST[i] ?? []) interestSubjects.set(s, i);
  const formats = new Set((profile?.formats ?? []).map((f) => FORMAT_FROM_PREF[f]).filter(Boolean));
  const exams = new Set((profile?.examGoals ?? []).map((e) => EXAM_TAGS[e]).filter(Boolean));

  return c.lessons
    .filter((l) => (progress.get(l.id) ?? 0) < 1)
    .map((lesson) => {
      let score = lesson.trend / 25;
      let reason: Reason = { kind: 'popular' };
      if (interestSubjects.has(lesson.subjectId)) {
        score += 2;
        reason = { kind: 'interest', interest: interestSubjects.get(lesson.subjectId)! };
      }
      if (mySubjects.has(lesson.subjectId)) {
        score += 4;
        reason = { kind: 'studies', subjectId: lesson.subjectId };
      }
      const exam = lesson.exams.find((e) => exams.has(e));
      if (exam) {
        score += 3;
        reason = { kind: 'exam', exam };
      }
      if (formats.has(lesson.format)) score += 1;
      if ((progress.get(lesson.id) ?? 0) > 0) score -= 2;
      return { lesson, reason, score: Math.round(score * 100) / 100 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
