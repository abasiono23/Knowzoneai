import { request } from '@/lib/api';
import { API_URL } from '@/lib/config';

/**
 * Flashcard lessons: a lesson taught as about 20 cards (a real photo or a drawn illustration and a
 * short text each), then a 5-question quiz. Made on the server; the catalogue marks which lessons
 * have them. The phone reads the cards aloud in languages it has a voice for.
 */
export type PhotoCredit = { author: string; license: string; url: string };
export type LessonCardItem = { text: string; image: string; credit?: PhotoCredit; audio?: string; seconds?: number };
export type LessonQuestion = { question: string; options: string[]; correctIndex: number; explanation: string };
export type LessonDeck = { id: string; cards: LessonCardItem[]; quiz: LessonQuestion[] };

/** Media paths from the server become full addresses. */
export const lessonMedia = (path: string) => `${API_URL}${path}`;

export const lessonCardsApi = {
  get: (id: string) => request<{ lesson: LessonDeck }>(`/lessons/${id}/cards`),
};

/** Milliseconds a card stays on screen: its narration, or a reading time when there's none. */
export const cardMs = (c: LessonCardItem, narrated: boolean) =>
  1000 * Math.max(5, narrated && c.seconds ? c.seconds + 1 : 3 + c.text.length / 16);

/** The phone's text-to-speech language for each app language (none for Yoruba, Igbo and Hausa). */
export const SPEECH_LANGUAGE: Partial<Record<string, string>> = {
  en: 'en-GB',
  pcm: 'en-NG',
  fr: 'fr-FR',
  ar: 'ar-SA',
  sw: 'sw-KE',
  pt: 'pt-PT',
  es: 'es-ES',
};
