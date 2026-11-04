import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { invalidateCatalog } from '../src/services/catalog.js';
import { useLessonDecks, type LessonDeck } from '../src/services/lesson-cards.js';
import { http } from './helpers.js';

const text = (en: string) => ({ en, fr: `${en} (fr)` });
const deck: LessonDeck = {
  id: 'l1',
  cards: Array.from({ length: 20 }, (_, k) => ({
    text: text(`Card ${k + 1} about respiration in the mitochondria.`),
    ...(k === 0 && { credit: { author: 'A. Photographer', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:X.jpg' } }),
  })),
  quiz: Array.from({ length: 5 }, (_, k) => ({
    question: text(`Question ${k + 1}?`),
    options: { en: ['A', 'B', 'C', 'D'], fr: ['A (fr)', 'B (fr)', 'C (fr)', 'D (fr)'] },
    correctIndex: 1,
    explanation: text('Because.'),
  })),
};

beforeAll(() => {
  useLessonDecks([deck]);
  invalidateCatalog();
});
afterAll(() => {
  useLessonDecks(null);
  invalidateCatalog();
});

describe('flashcard lessons', () => {
  it('marks lessons that have flashcards in the catalogue, with a cover and their real length', async () => {
    const lessons = (await http().get('/catalog').expect(200)).body.lessons as { id: string; format: string; cover?: string; cards?: number; minutes: number }[];
    const l1 = lessons.find((l) => l.id === 'l1')!;
    expect(l1).toMatchObject({ format: 'flashcards', cover: '/lessons/media/l1-1.webp', cards: 20 });
    // 20 cards of at least 4 seconds each, without narration.
    expect(l1.minutes).toBeGreaterThanOrEqual(1);
    // Lessons without cards keep their own format and no cover.
    expect(lessons.find((l) => l.id === 'l2')!.cover).toBeUndefined();
  });

  it('gives the cards and quiz in the reader’s language, with photo credits', async () => {
    const fr = (await http().get('/lessons/l1/cards').set('X-Language', 'fr').expect(200)).body.lesson;
    expect(fr.cards).toHaveLength(20);
    expect(fr.cards[0]).toMatchObject({ text: 'Card 1 about respiration in the mitochondria. (fr)', image: '/lessons/media/l1-1.webp', credit: { license: 'CC BY-SA 4.0' } });
    expect(fr.cards[1].credit).toBeUndefined();
    expect(fr.quiz[0]).toMatchObject({ question: 'Question 1? (fr)', options: ['A (fr)', 'B (fr)', 'C (fr)', 'D (fr)'], correctIndex: 1 });
    // A language without a translation falls back to English.
    const yo = (await http().get('/lessons/l1/cards').set('X-Language', 'yo').expect(200)).body.lesson;
    expect(yo.cards[0].text).toBe('Card 1 about respiration in the mitochondria.');
    await http().get('/lessons/l2/cards').expect(404);
    await http().get('/lessons/media/..%2F..%2Fpackage.json').expect(404);
  });
});
