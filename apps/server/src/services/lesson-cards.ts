import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { LanguageId } from './personalization.js';

/**
 * Flashcard lessons: Explore's lessons taught as about 20 cards (a real photo or a drawn illustration,
 * and the text in 10 languages), then a 5-question quiz. Built by scripts/lesson-build.ts into
 * data/lessons/ and shipped with the server. The app reads the cards aloud with the phone's voice.
 */
type Text = Partial<Record<LanguageId, string>>;
/** A photo's author, licence and page on Wikimedia Commons (illustrations have none). */
export type PhotoCredit = { author: string; license: string; url: string };
export type LessonCard = { text: Text; credit?: PhotoCredit; seconds?: number };
export type LessonQuestion = {
  question: Text;
  options: Partial<Record<LanguageId, string[]>>;
  correctIndex: number;
  explanation: Text;
};
export type LessonDeck = { id: string; cards: LessonCard[]; quiz: LessonQuestion[] };

function folder() {
  // Works from src/ (tsx, tests) and from dist/src/ (built server), whatever the working folder.
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 6; i++) {
    const d = join(dir, 'data', 'lessons');
    if (existsSync(d)) return d;
    dir = dirname(dir);
  }
  return null;
}
export const lessonCardsFolder = folder;

let decks: Map<string, LessonDeck> | null = null;

/** Decks whose every card has its picture (a lesson still being made keeps its old format). */
export function lessonDecks() {
  if (decks) return decks;
  const dir = folder();
  const file = dir && join(dir, 'cards.json');
  const list: LessonDeck[] = file && existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
  decks = new Map(
    list
      .filter(
        (d) =>
          d.cards.length > 0 &&
          d.quiz.length > 0 &&
          d.cards.every((_, k) => existsSync(join(dir!, 'img', `${d.id}-${k + 1}.webp`))),
      )
      .map((d) => [d.id, d]),
  );
  return decks;
}

/** Tests can put decks in without files. */
export function useLessonDecks(list: LessonDeck[] | null) {
  decks = list ? new Map(list.map((d) => [d.id, d])) : null;
}

const pick = (t: Text, lang: LanguageId) => t[lang] ?? t.en ?? '';
export const cardImage = (id: string, k: number) => `/lessons/media/${id}-${k + 1}.webp`;

/**
 * How long the deck plays, in whole minutes: each card's narration, or its reading time (as the app
 * times it: 3 seconds plus about 16 characters a second, at least 5 seconds).
 */
export const deckMinutes = (d: LessonDeck) =>
  Math.max(
    1,
    Math.round(
      d.cards.reduce((n, c) => n + (c.seconds ? c.seconds + 1 : Math.max(5, 3 + (c.text.en ?? '').length / 16)), 0) /
        60,
    ),
  );

/** A deck in one language. Narration is English, so it's sent only to English readers. */
export function deckFor(d: LessonDeck, lang: LanguageId) {
  return {
    id: d.id,
    cards: d.cards.map((c, k) => ({
      text: pick(c.text, lang),
      image: cardImage(d.id, k),
      ...(c.credit && { credit: c.credit }),
      ...(lang === 'en' && c.seconds && { audio: `/lessons/media/${d.id}-${k + 1}.mp3`, seconds: c.seconds }),
    })),
    quiz: d.quiz.map((q) => ({
      question: pick(q.question, lang),
      options: q.options[lang] ?? q.options.en ?? [],
      correctIndex: q.correctIndex,
      explanation: pick(q.explanation, lang),
    })),
  };
}
