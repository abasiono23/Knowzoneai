import { post, request, type User } from '../api';
import type { Certificate, Course, CourseAttempt, CourseRating, Instructor, LessonContent, LessonNote } from './types';

/** The courses API (real mode): the catalogue, lesson content and the learner's progress. */

export type Catalog = { version: string; courses: Course[]; instructors: Instructor[] };

export const catalog = (since?: string) =>
  request<Catalog | { version: string; unchanged: true }>(`/courses${since ? `?since=${encodeURIComponent(since)}` : ''}`);

export const lesson = async (courseId: string, lessonId: string) =>
  (await request<{ content: LessonContent }>(`/courses/${courseId}/lessons/${lessonId}`)).content;

export type Progress = {
  enrolled: Record<string, number>;
  done: Record<string, number>;
  last: Record<string, string>;
  attempts: Record<string, CourseAttempt[]>;
  notes: Record<string, LessonNote[]>;
  ratings: Record<string, CourseRating>;
  certificates: Record<string, Certificate>;
  saved: string[];
  minutes: Record<string, number>;
};
export const progress = () => request<Progress>('/me/courses');

export const enroll = (courseId: string) => post(`/me/courses/${courseId}/enroll`);
export const save = (courseId: string, saved: boolean) =>
  request(`/me/courses/${courseId}/save`, { method: 'PUT', body: JSON.stringify({ saved }) });
export const open = (courseId: string, lessonId: string) => post(`/me/courses/${courseId}/open`, { lessonId });

type Finished = { certificate: Certificate | null; user?: User };
export const complete = (courseId: string, lessonId: string) =>
  post<Finished>(`/me/courses/${courseId}/lessons/${lessonId}/complete`);
export const attempt = (courseId: string, lessonId: string, answers: number[], seconds: number) =>
  post<Finished & { attempt: CourseAttempt; passed: boolean }>(`/me/courses/${courseId}/lessons/${lessonId}/attempts`, {
    answers,
    seconds,
  });

export const addNote = (courseId: string, lessonId: string, text: string, quote?: string) =>
  post<{ note: LessonNote }>(`/me/courses/${courseId}/lessons/${lessonId}/notes`, { text, ...(quote && { quote }) });
export const editNote = (courseId: string, noteId: string, text: string) =>
  request(`/me/courses/${courseId}/notes/${noteId}`, { method: 'PATCH', body: JSON.stringify({ text }) });
export const deleteNote = (courseId: string, noteId: string) =>
  request(`/me/courses/${courseId}/notes/${noteId}`, { method: 'DELETE' });
export const rate = (courseId: string, r: Omit<CourseRating, 'at'>) =>
  request(`/me/courses/${courseId}/rating`, { method: 'PUT', body: JSON.stringify(r) });
