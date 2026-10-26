import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The Word Clash dictionary: the public-domain ENABLE word list (2–8 letters), with offensive words
 * removed. It lives in apps/server/data/english-words.txt and is loaded once, on first use.
 */
let words: Set<string> | null = null;
let list: string[] = [];

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
  }
  return words;
}

export const isWord = (word: string) => load().has(word.toUpperCase());

/** Every dictionary word of at least `min` letters that can be made from the rack's letters. */
export function wordsFromRack(rack: string[], min = 3) {
  load();
  const have = counts(rack.join(''));
  return list.filter((w) => w.length >= min && w.length <= rack.length && fits(counts(w), have));
}

export function counts(word: string) {
  const c: Record<string, number> = {};
  for (const ch of word) c[ch] = (c[ch] ?? 0) + 1;
  return c;
}

export const fits = (need: Record<string, number>, have: Record<string, number>) => Object.entries(need).every(([ch, n]) => (have[ch] ?? 0) >= n);
