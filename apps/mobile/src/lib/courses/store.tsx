import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import i18n from '../../i18n';
import type { User } from '../api';
import { USE_MOCKS } from '../config';
import { useRewards } from '../rewards/store';
import { useSession } from '../session';
import { storage } from '../storage';
import type { Question } from '../studio/types';
import { applyCourses, getCourse } from './catalog';
import * as remote from './remote';
import {
  allLessons,
  lessonKey,
  PASS_MARK,
  type Certificate,
  type Course,
  type CourseAttempt,
  type CourseLesson,
  type CourseRating,
  type LessonNote,
} from './types';

const KEY = 'knowzone.courses';
const CATALOG_KEY = 'knowzone.courses.catalog';
const uid = () => Math.random().toString(36).slice(2, 10);
const localId = () => `local-${uid()}`;

type Persisted = {
  enrolled: Record<string, number>;
  /** lessonKey → completed at. Quiz lessons only count once passed. */
  done: Record<string, number>;
  /** courseId → last opened lesson. */
  last: Record<string, string>;
  attempts: Record<string, CourseAttempt[]>;
  notes: Record<string, LessonNote[]>;
  ratings: Record<string, CourseRating>;
  certificates: Record<string, Certificate>;
  saved: string[];
  minutes: Record<string, number>;
};
const EMPTY: Persisted = {
  enrolled: {},
  done: {},
  last: {},
  attempts: {},
  notes: {},
  ratings: {},
  certificates: {},
  saved: [],
  minutes: {},
};

export type CourseProgress = {
  done: number;
  total: number;
  pct: number;
  complete: boolean;
  /** First unfinished lesson, in course order. */
  next?: CourseLesson;
  /** Best score on each quiz lesson that has been attempted, 0–1. */
  quizScores: { lesson: CourseLesson; best: number; attempts: number }[];
  average: number | null;
};

export type LoadState = 'loading' | 'ready' | 'error';

type Courses = Persisted & {
  ready: boolean;
  /** Changes when the course list changes (real mode loads it from the server). */
  catalogVersion: string;
  /** Real mode: fetches a lesson's content (reading, video, quiz…) the first time it's opened. */
  loadLesson: (courseId: string, lessonId: string) => Promise<LoadState>;
  enroll: (courseId: string) => void;
  toggleSave: (courseId: string) => void;
  open: (courseId: string, lessonId: string) => void;
  complete: (courseId: string, lessonId: string) => void;
  recordAttempt: (
    courseId: string,
    lessonId: string,
    questions: Question[],
    answers: number[],
    seconds: number,
  ) => string;
  addNote: (courseId: string, lessonId: string, text: string, quote?: string) => void;
  editNote: (courseId: string, lessonId: string, noteId: string, text: string) => void;
  deleteNote: (courseId: string, lessonId: string, noteId: string) => void;
  rate: (courseId: string, rating: Omit<CourseRating, 'at'>) => void;
  progressOf: (course: Course) => CourseProgress;
  isDone: (courseId: string, lessonId: string) => boolean;
};

const Ctx = createContext<Courses | null>(null);

function progressFrom(s: Persisted, course: Course): CourseProgress {
  const lessons = allLessons(course);
  const done = lessons.filter((l) => s.done[lessonKey(course.id, l.id)]).length;
  const quizScores = lessons
    .filter((l) => l.kind === 'quiz' && s.attempts[lessonKey(course.id, l.id)]?.length)
    .map((l) => {
      const list = s.attempts[lessonKey(course.id, l.id)];
      return { lesson: l, best: Math.max(...list.map((a) => a.score / a.total)), attempts: list.length };
    });
  return {
    done,
    total: lessons.length,
    pct: lessons.length ? done / lessons.length : 0,
    complete: done === lessons.length && lessons.length > 0,
    next: lessons.find((l) => !s.done[lessonKey(course.id, l.id)]),
    quizScores,
    average: quizScores.length ? quizScores.reduce((n, q) => n + q.best, 0) / quizScores.length : null,
  };
}

/**
 * Courses and the learner's progress in them. Real mode: the catalogue (built from open textbooks)
 * and lesson content come from the server, which also keeps progress, marks quizzes, awards XP and
 * issues certificates; this device keeps a copy. Mock mode: the built-in demo courses, all on the device.
 */
export function CoursesProvider({ children }: { children: ReactNode }) {
  const { user, setUser } = useSession();
  const { grant } = useRewards();
  // One copy per account, so a shared device never shows someone else's progress.
  const key = USE_MOCKS || !user ? KEY : `${KEY}.${user.id}`;
  const [state, setState] = useState<Persisted>(EMPTY);
  const [ready, setReady] = useState(false);
  const [catalogVersion, setCatalogVersion] = useState(USE_MOCKS ? 'demo' : '');
  const ref = useRef<Persisted>(EMPTY);
  const nameRef = useRef(user?.name);
  const loading = useRef(new Map<string, Promise<LoadState>>());
  useEffect(() => {
    nameRef.current = user?.name;
  }, [user?.name]);

  const commit = useCallback(
    (next: Persisted) => {
      ref.current = next;
      setState(next);
      storage.set(key, JSON.stringify(next));
    },
    [key],
  );

  // The course list (real mode): the copy on this device first, then the server's if it changed.
  useEffect(() => {
    if (USE_MOCKS) return;
    let live = true;
    (async () => {
      let cached: remote.Catalog | null = null;
      try {
        const raw = await storage.get(CATALOG_KEY);
        cached = raw ? (JSON.parse(raw) as remote.Catalog) : null;
      } catch {
        // A damaged copy is replaced below.
      }
      if (cached?.courses && live) {
        applyCourses(cached.courses, cached.instructors);
        setCatalogVersion(cached.version);
      } else applyCourses([], []);
      try {
        const fresh = await remote.catalog(cached?.version);
        if (!live || 'unchanged' in fresh) return;
        applyCourses(fresh.courses, fresh.instructors);
        setCatalogVersion(fresh.version);
        storage.set(CATALOG_KEY, JSON.stringify(fresh));
      } catch {
        // Offline: keep the copy on this device.
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    let live = true;
    storage.get(key).then((raw) => {
      let saved = EMPTY;
      try {
        saved = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
      } catch {
        saved = EMPTY;
      }
      if (!live) return;
      ref.current = saved;
      setState(saved);
      setReady(true);
      if (!USE_MOCKS)
        remote
          .progress()
          .then((p) => live && commit({ ...EMPTY, ...p }))
          .catch(() => {});
    });
    return () => {
      live = false;
    };
  }, [commit, key]);

  const loadLesson: Courses['loadLesson'] = useCallback(async (courseId, lessonId) => {
    const lesson = getCourse(courseId) && allLessons(getCourse(courseId)!).find((l) => l.id === lessonId);
    if (!lesson) return 'error';
    if (USE_MOCKS || lesson.content) return 'ready';
    const k = lessonKey(courseId, lessonId);
    const cacheKey = `${CATALOG_KEY}.lesson.${k}`;
    if (!loading.current.has(k))
      loading.current.set(
        k,
        (async (): Promise<LoadState> => {
          try {
            lesson.content = await remote.lesson(courseId, lessonId);
            storage.set(cacheKey, JSON.stringify(lesson.content));
            return 'ready';
          } catch {
            // Offline: a copy saved on an earlier visit.
            const raw = await storage.get(cacheKey).catch(() => null);
            if (raw) {
              lesson.content = JSON.parse(raw);
              return 'ready';
            }
            loading.current.delete(k);
            return 'error';
          }
        })(),
      );
    return loading.current.get(k)!;
  }, []);

  /** Marks a lesson done, credits study time and issues the certificate when the course is finished. */
  const markDone = useCallback((s: Persisted, courseId: string, lessonId: string): Persisted => {
    const key = lessonKey(courseId, lessonId);
    const course = getCourse(courseId);
    if (s.done[key] || !course) return s;
    const lesson = allLessons(course).find((l) => l.id === lessonId);
    let next: Persisted = {
      ...s,
      enrolled: s.enrolled[courseId] ? s.enrolled : { ...s.enrolled, [courseId]: Date.now() },
      done: { ...s.done, [key]: Date.now() },
      minutes: { ...s.minutes, [courseId]: (s.minutes[courseId] ?? 0) + (lesson?.minutes ?? 0) },
    };
    const p = progressFrom(next, course);
    // Real mode: only the server issues certificates (it checks every lesson and quiz).
    if (USE_MOCKS && p.complete && !next.certificates[courseId]) {
      next = {
        ...next,
        certificates: {
          ...next.certificates,
          [courseId]: {
            id: `KZ-${courseId.slice(0, 3).toUpperCase()}-${uid().toUpperCase()}`,
            issuedAt: Date.now(),
            name: nameRef.current ?? i18n.t('courses:certificate.defaultName'),
            score: p.average ?? 1,
          },
        },
      };
    }
    return next;
  }, []);

  /** Learning earns too: XP per lesson, and a coin bonus with every certificate (the server's job in real mode). */
  const settle = (before: Persisted, next: Persisted, courseId: string, lessonId: string) => {
    if (!USE_MOCKS) return;
    const key = lessonKey(courseId, lessonId);
    if (next.done[key] && !before.done[key]) grant(10, 0, `course-lesson:${key}`);
    if (next.certificates[courseId] && !before.certificates[courseId]) grant(100, 50, `course:${courseId}`);
  };

  /** The server's answer to a finished lesson: new XP and coins, and the certificate if that was the last one. */
  const finished = (courseId: string, r: { certificate: Certificate | null; user?: User }) => {
    if (r.user) setUser(r.user);
    if (r.certificate) commit({ ...ref.current, certificates: { ...ref.current.certificates, [courseId]: r.certificate } });
  };

  const sync = (call: () => Promise<unknown>) => {
    if (!USE_MOCKS) call().catch(() => {});
  };

  const mutateNotes = (courseId: string, lessonId: string, fn: (n: LessonNote[]) => LessonNote[]) => {
    const key = lessonKey(courseId, lessonId);
    commit({ ...ref.current, notes: { ...ref.current.notes, [key]: fn(ref.current.notes[key] ?? []) } });
  };

  const value: Courses = {
    ...state,
    ready,
    catalogVersion,
    loadLesson,
    enroll: (courseId) => {
      if (ref.current.enrolled[courseId]) return;
      commit({ ...ref.current, enrolled: { ...ref.current.enrolled, [courseId]: Date.now() } });
      sync(() => remote.enroll(courseId));
    },
    toggleSave: (courseId) => {
      const saved = !ref.current.saved.includes(courseId);
      commit({
        ...ref.current,
        saved: saved ? [...ref.current.saved, courseId] : ref.current.saved.filter((x) => x !== courseId),
      });
      sync(() => remote.save(courseId, saved));
    },
    open: (courseId, lessonId) => {
      const s = ref.current;
      if (s.last[courseId] === lessonId && s.enrolled[courseId]) return;
      commit({
        ...s,
        last: { ...s.last, [courseId]: lessonId },
        enrolled: s.enrolled[courseId] ? s.enrolled : { ...s.enrolled, [courseId]: Date.now() },
      });
      sync(() => remote.open(courseId, lessonId));
    },
    complete: (courseId, lessonId) => {
      const before = ref.current;
      const next = markDone(before, courseId, lessonId);
      if (next === before) return;
      commit(next);
      settle(before, next, courseId, lessonId);
      if (!USE_MOCKS)
        remote
          .complete(courseId, lessonId)
          .then((r) => finished(courseId, r))
          .catch(() => {});
    },
    recordAttempt: (courseId, lessonId, questions, answers, seconds) => {
      const key = lessonKey(courseId, lessonId);
      const score = questions.filter((q, i) => answers[i] === q.correctIndex).length;
      const attempt: CourseAttempt = { id: uid(), at: Date.now(), answers, score, total: questions.length, seconds };
      let next: Persisted = {
        ...ref.current,
        attempts: { ...ref.current.attempts, [key]: [...(ref.current.attempts[key] ?? []), attempt] },
      };
      const before = ref.current;
      if (score / questions.length >= PASS_MARK) next = markDone(next, courseId, lessonId);
      commit(next);
      settle(before, next, courseId, lessonId);
      if (!USE_MOCKS)
        // The server marks it too (its result is what counts) and awards the XP.
        remote
          .attempt(courseId, lessonId, answers, seconds)
          .then((r) => {
            commit({
              ...ref.current,
              attempts: {
                ...ref.current.attempts,
                [key]: (ref.current.attempts[key] ?? []).map((a) => (a.id === attempt.id ? r.attempt : a)),
              },
            });
            finished(courseId, r);
          })
          .catch(() => {});
      return attempt.id;
    },
    addNote: (courseId, lessonId, text, quote) => {
      const note: LessonNote = { id: USE_MOCKS ? uid() : localId(), text, quote, at: Date.now() };
      mutateNotes(courseId, lessonId, (n) => [note, ...n]);
      if (!USE_MOCKS)
        remote
          .addNote(courseId, lessonId, text, quote)
          .then((r) => mutateNotes(courseId, lessonId, (n) => n.map((x) => (x.id === note.id ? r.note : x))))
          .catch(() => {});
    },
    editNote: (courseId, lessonId, noteId, text) => {
      mutateNotes(courseId, lessonId, (n) => n.map((x) => (x.id === noteId ? { ...x, text, at: Date.now() } : x)));
      if (!noteId.startsWith('local-')) sync(() => remote.editNote(courseId, noteId, text));
    },
    deleteNote: (courseId, lessonId, noteId) => {
      mutateNotes(courseId, lessonId, (n) => n.filter((x) => x.id !== noteId));
      if (!noteId.startsWith('local-')) sync(() => remote.deleteNote(courseId, noteId));
    },
    rate: (courseId, rating) => {
      commit({ ...ref.current, ratings: { ...ref.current.ratings, [courseId]: { ...rating, at: Date.now() } } });
      sync(() => remote.rate(courseId, rating));
    },
    progressOf: (course) => progressFrom(state, course),
    isDone: (courseId, lessonId) => !!state.done[lessonKey(courseId, lessonId)],
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCourses() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCourses must be used inside CoursesProvider');
  return ctx;
}
