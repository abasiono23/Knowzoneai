import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The Word Clash dictionary: the public-domain ENABLE word list (2–8 letters), with offensive words
 * removed. It lives in apps/server/data/english-words.txt and is loaded once, on first use.
 */
let words: Set<string> | null = null;
let list: string[] = [];
/** Each word's letters as a bit mask (A = bit 0), to skip words that need a letter the rack hasn't got. */
let masks: Int32Array = new Int32Array(0);
const maskOf = (word: string) => {
  let m = 0;
  for (let i = 0; i < word.length; i++) m |= 1 << (word.charCodeAt(i) - 65);
  return m;
};

function locate() {
  // Works from src/ (tsx, tests) and from dist/src/ (built server), whatever the working folder.
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 6; i++) {
    const file = join(dir, 'data', 'english-words.txt');
    if (existsSync(file)) return file;
    dir = dirname(dir);
  }
  throw new Error('data/english-words.txt is missing');
}

function load() {
  if (!words) {
    list = readFileSync(locate(), 'utf8')
      .split('\n')
      .map((w) => w.trim().toUpperCase())
      .filter(Boolean);
    words = new Set(list);
    masks = Int32Array.from(list, maskOf);
  }
  return words;
}

export const isWord = (word: string) => load().has(word.toUpperCase());

/** Every dictionary word of at least `min` letters that can be made from the rack's letters. */
export function wordsFromRack(rack: string[], min = 3) {
  load();
  const have = counts(rack.join(''));
  const mask = maskOf(rack.join(''));
  return list.filter((w, i) => (masks[i]! & ~mask) === 0 && w.length >= min && w.length <= rack.length && fits(counts(w), have));
}

export function counts(word: string) {
  const c: Record<string, number> = {};
  for (const ch of word) c[ch] = (c[ch] ?? 0) + 1;
  return c;
}

export const fits = (need: Record<string, number>, have: Record<string, number>) => Object.entries(need).every(([ch, n]) => (have[ch] ?? 0) >= n);
