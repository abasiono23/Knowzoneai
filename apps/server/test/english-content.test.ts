import { describe, expect, it } from 'vitest';

import { americanSpelling, blocked, blockedIn, clueGivesAway, inDictionary, stemOf } from '../src/data/english/checks.js';
import { HUNT_THEMES, HUNTS } from '../src/data/english/hunts.js';
import { SENTENCES } from '../src/data/english/sentences.js';
import { VOCAB } from '../src/data/english/vocab.js';
import { isWord } from '../src/services/games/dictionary.js';

/** The graded content of the word games (written by scripts/word-games-content.ts). No database needed. */
const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const GRID = [0, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11];
const TOPICS = [
  'presentSimple',
  'pastTense',
  'questions',
  'prepositions',
  'passiveConditionals',
  'presentPerfect',
  'relativeClauses',
  'reportedSpeech',
  'mixedConditionals',
  'inversion',
];
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

describe('the content checks themselves', () => {
  it('find words in the dictionary, British forms included, and catch clues that give the word away', () => {
    expect(inDictionary('HOUSE')).toBe(true);
    expect(inDictionary('PUSILLANIMOUS')).toBe(true);
    expect(inDictionary('COLOUR')).toBe(true);
    expect(inDictionary('ORGANISE')).toBe(true);
    expect(inDictionary('QZXWV')).toBe(false);
    expect(americanSpelling('COLOR')).toBe(true);
    expect(americanSpelling('REALIZE')).toBe(true);
    expect(americanSpelling('SIZE')).toBe(false);
    expect(americanSpelling('LITERAL')).toBe(false);
    expect(stemOf('RESILIENT')).toBe('RESILI');
    expect(clueGivesAway('HOUSE', 'Where houses stand')).toBe(true);
    expect(clueGivesAway('ANNOYANCE', 'Something that annoys you')).toBe(true);
    expect(clueGivesAway('RAIN', 'Rainy weather')).toBe(true);
    expect(clueGivesAway('ACQUIESCE', 'To accept something without protest')).toBe(false);
    expect(blocked('FUCKING')).toBe(true);
    expect(blocked('ASSET')).toBe(false);
  });
});

describe('vocabulary (Hidden Letters, Spellcaster, Word Clash racks)', () => {
  it('has ten levels with at least 150 words each', () => {
    for (const l of LEVELS) expect(VOCAB[l]?.length ?? 0, `level ${l}`).toBeGreaterThanOrEqual(150);
  });

  it('uses dictionary words in British spelling, never offensive, never twice', () => {
    const seen = new Map<string, number>();
    for (const l of LEVELS)
      for (const { word, clue } of VOCAB[l]!) {
        expect(word).toMatch(/^[A-Z]{4,14}$/);
        expect(inDictionary(word), word).toBe(true);
        expect(americanSpelling(word), word).toBe(false);
        expect(blocked(word), word).toBe(false);
        expect(blockedIn(clue), clue).toBeNull();
        expect(seen.get(word), `${word} on levels ${seen.get(word)} and ${l}`).toBeUndefined();
        seen.set(word, l);
      }
  });

  it('has clues that never contain the word, its stem or a form of it', () => {
    for (const l of LEVELS)
      for (const { word, clue } of VOCAB[l]!) {
        expect(clue.toUpperCase()).not.toContain(word);
        expect(clueGivesAway(word, clue), `${word}: ${clue}`).toBe(false);
        expect(clue.length).toBeLessThanOrEqual(90);
      }
  });

  it('suits the games: Spellcaster words (up to 12 letters) and Word Clash seeds (5–7 letters in its dictionary) on every level', () => {
    for (const l of LEVELS) {
      const words = VOCAB[l]!.map((v) => v.word);
      expect(words.filter((w) => w.length <= 12).length, `level ${l}`).toBeGreaterThanOrEqual(120);
      expect(words.filter((w) => w.length >= 5 && w.length <= 7 && isWord(w)).length, `level ${l}`).toBeGreaterThanOrEqual(20);
    }
  });

  it('gets harder level by level', () => {
    const rating = LEVELS.map((l) => mean(VOCAB[l]!.map((v) => v.difficulty ?? 0)));
    // The checker model's rating on the ladder: strictly rising, and close to the level itself.
    for (let i = 1; i < rating.length; i++) expect(rating[i]!, `level ${i + 1}`).toBeGreaterThan(rating[i - 1]!);
    rating.forEach((r, i) => expect(Math.abs(r - (i + 1)), `level ${i + 1}`).toBeLessThanOrEqual(0.8));
    for (const l of LEVELS) for (const v of VOCAB[l]!) expect(Math.abs((v.difficulty ?? 0) - l), v.word).toBeLessThanOrEqual(1);
    // A signal that needs no model: rarer words are longer and have fewer relatives in the dictionary
    // (HOUSE has HOUSED, HOUSES, HOUSING, HOUSEHOLD…). Level 1 < 4 < 7 < 10 on both.
    const length = LEVELS.map((l) => mean(VOCAB[l]!.map((v) => v.word.length)));
    expect(length[0]!).toBeLessThan(length[3]!);
    expect(length[3]!).toBeLessThan(length[6]!);
    expect(length[0]!).toBeLessThan(length[9]!);
  });
});

describe('sentences (Sentence Master)', () => {
  it('has ten levels, each on its grammar point, with at least 30 sentences', () => {
    LEVELS.forEach((l, i) => {
      expect(SENTENCES[l]?.topic).toBe(TOPICS[i]);
      expect(SENTENCES[l]!.sentences.length, `level ${l}`).toBeGreaterThanOrEqual(30);
    });
  });

  it('has traps that are not in the sentence and other orders that use the same words', () => {
    for (const l of LEVELS)
      for (const s of SENTENCES[l]!.sentences) {
        expect(s.words.map((w) => w.toLowerCase())).not.toContain(s.trap.toLowerCase());
        expect(s.words.length).toBeGreaterThanOrEqual(3);
        for (const w of s.words) expect(w, s.words.join(' ')).toMatch(/^[A-Za-z0-9'-]+$/);
        for (const o of s.also ?? []) expect([...o].sort()).toEqual([...s.words].sort());
        expect(blockedIn(s.words.join(' '))).toBeNull();
      }
  });

  it('grows longer with the level', () => {
    const length = LEVELS.map((l) => mean(SENTENCES[l]!.sentences.map((s) => s.words.length)));
    for (let i = 5; i < length.length; i++) expect(length[i]!, `level ${i + 1}`).toBeGreaterThan(length[i - 5]!);
    expect(length[9]!).toBeGreaterThan(length[0]! * 1.8);
  });
});

describe('Word Hunter themes', () => {
  it('keeps the original 16 themes', () => {
    expect(HUNT_THEMES).toHaveLength(16);
  });

  it('has ten levels with at least 48 themes, each with 10 or more words that fit the grid', () => {
    const ids = new Set<string>();
    for (const l of LEVELS) {
      const themes = HUNTS[l] ?? [];
      expect(themes.length, `level ${l}`).toBeGreaterThanOrEqual(48);
      for (const t of themes) {
        expect(ids.has(t.id), t.id).toBe(false);
        ids.add(t.id);
        expect(t.title.length).toBeGreaterThan(1);
        expect(t.words.length, t.id).toBeGreaterThanOrEqual(10);
        expect(new Set(t.words).size).toBe(t.words.length);
        for (const w of t.words) {
          expect(w).toMatch(/^[A-Z]+$/);
          expect(w.length).toBeGreaterThanOrEqual(3);
          expect(w.length, `${t.id} ${w}`).toBeLessThanOrEqual(GRID[l]!);
          expect(inDictionary(w), w).toBe(true);
          expect(blocked(w), w).toBe(false);
          // No word hidden inside another of the same theme.
          expect(t.words.filter((x) => x !== w && x.includes(w)), `${t.id} ${w}`).toEqual([]);
        }
      }
    }
  });

  it('has longer words on higher levels', () => {
    const length = LEVELS.map((l) => mean(HUNTS[l]!.flatMap((t) => t.words.map((w) => w.length))));
    expect(length[0]!).toBeLessThan(length[4]!);
    expect(length[4]!).toBeLessThan(length[9]!);
  });
});
