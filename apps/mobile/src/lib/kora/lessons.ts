import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { WEB_URL } from '@/lib/config';
import type { ExamId } from '@/lib/exams';
import { examsForRegion } from '@/lib/region';
import { storage } from '@/lib/storage';

/**
 * Lessons with Kora: three-minute lessons a cartoon Kora teaches live in the app. Each lesson is a
 * few static files on the web app's address (made by apps/server/scripts/kora-lessons.ts and kept in
 * apps/mobile/public/kora-lessons/): the narration, its word times, her mouth at every frame, and
 * what the board shows. The web app reads them from its own address; the phone app from WEB_URL.
 */
const BASE = `${Platform.OS === 'web' ? '' : WEB_URL}/kora-lessons`;

/** Where a lesson's file lives (its narration, a board picture). */
export const lessonAsset = (lessonId: string, file: string) => `${BASE}/${lessonId}/${file}`;

export type KoraLessonCard = {
  id: string;
  title: string;
  subject: string;
  /** "SAT", "GCSE", "JAMB · WAEC", "Cybersecurity", "Study skills": names, never translated. */
  label: string;
  group: 'cyber' | 'skills' | 'exam';
  /** The exams it is written for; none means it is for everyone. */
  exams: ExamId[];
  language: string;
  seconds: number;
};

export type BoardItemKind = 'text' | 'term' | 'formula' | 'step' | 'wrong' | 'right' | 'tip' | 'image' | 'clip' | 'question';
export type BoardItem = { at: number; kind: BoardItemKind; text: string; detail?: string; src?: string; /** Who made a picture, and its licence. */ credit?: string };
export type BoardScene = { at: number; heading: string; items: BoardItem[] };
export type LessonLine = {
  /** Its section. */
  s: number;
  /** When Kora starts and stops saying it. */
  a: number;
  b: number;
  text: string;
  /** The start of each word of `text`. */
  w: number[];
};

export type KoraLesson = Omit<KoraLessonCard, 'group'> & {
  duration: number;
  audio: string;
  sections: { id: string; title: string; start: number; end: number }[];
  lines: LessonLine[];
  scenes: BoardScene[];
  /** The quick check: the lesson stops at `at` for `seconds` (or until the student taps). */
  check: { at: number; seconds: number; question: string; answer: string };
  fps: number;
  /** One digit per frame: Kora's mouth shape (lib/kora/mouth.ts), and how loud her voice is, 0 to 9. */
  mouth: string;
  level: string;
  credits: { title: string; author: string; licence: string; source: string }[];
};

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

let index: Promise<KoraLessonCard[]> | null = null;
/** Every lesson. Asked for once; a failure is forgotten so the next screen tries again. */
export function loadKoraLessons(): Promise<KoraLessonCard[]> {
  index ??= getJson<{ lessons: KoraLessonCard[] }>(`${BASE}/index.json`)
    .then((r) => r.lessons)
    .catch((e) => {
      index = null;
      throw e;
    });
  return index;
}

export const loadKoraLesson = (id: string) => getJson<KoraLesson>(lessonAsset(id, 'lesson.json'));

/**
 * The lessons for a student's region: the ones for everyone (cybersecurity, study skills) and the
 * ones written for an exam their country sits (SAT in the US, GCSE in the UK, JAMB and WAEC in
 * Nigeria, WAEC in the other West African member countries). Their exam's lessons come first.
 */
export function lessonsForRegion(lessons: KoraLessonCard[], region: string): KoraLessonCard[] {
  const own = examsForRegion(region);
  const mine = lessons.filter((l) => l.exams.length === 0 || l.exams.some((e) => own.includes(e)));
  return [...mine.filter((l) => l.exams.length > 0), ...mine.filter((l) => l.exams.length === 0)];
}

/** "3 min" style length, rounded to the nearest half minute's whole number. */
export const lessonMinutes = (seconds: number) => Math.max(1, Math.round(seconds / 60));

// ─── Watched lessons (kept on this device) ───────────────────────────────────────

const WATCHED_KEY = 'knowzone.kora.watched';
let watched: Set<string> | null = null;
const listeners = new Set<() => void>();

async function readWatched() {
  if (watched) return watched;
  let ids: string[] = [];
  try {
    const raw = await storage.get(WATCHED_KEY);
    if (raw) ids = JSON.parse(raw) as string[];
  } catch {
    // Nothing saved yet, or not readable: start empty.
  }
  watched ??= new Set(ids);
  return watched;
}

export async function markLessonWatched(id: string) {
  const set = await readWatched();
  if (set.has(id)) return;
  set.add(id);
  listeners.forEach((l) => l());
  storage.set(WATCHED_KEY, JSON.stringify([...set])).catch(() => {});
}

/** The ids of the lessons this student has watched to the end. */
export function useWatchedLessons(): Set<string> {
  const [, redraw] = useState(0);
  useEffect(() => {
    const on = () => redraw((n) => n + 1);
    listeners.add(on);
    readWatched().then(on);
    return () => {
      listeners.delete(on);
    };
  }, []);
  return watched ?? new Set();
}

/** The lessons for a region, loaded; `null` while loading, and an empty list if they can't be reached. */
export function useKoraLessons(region: string): KoraLessonCard[] | null {
  const [lessons, setLessons] = useState<KoraLessonCard[] | null>(null);
  useEffect(() => {
    let live = true;
    loadKoraLessons()
      .then((all) => live && setLessons(lessonsForRegion(all, region)))
      .catch(() => live && setLessons([]));
    return () => {
      live = false;
    };
  }, [region]);
  return lessons;
}
