import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Reel } from '../data/facts.js';

/**
 * "Did you know?" reels: each one fun fact explained in 5 cards, with a picture and English narration
 * per card. Files in data/facts/ (made by scripts/fun-facts.ts), shipped with the server.
 */
function folder() {
  // Works from src/ (tsx, tests) and from dist/src/ (built server), whatever the working folder.
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 6; i++) {
    const d = join(dir, 'data', 'facts');
    if (existsSync(d)) return d;
    dir = dirname(dir);
  }
  return null;
}
export const reelsFolder = folder;

let reels: Reel[] | null = null;

/** Reels whose every card has a picture (a reel still being made isn't shown). */
export function allReels(): Reel[] {
  if (reels) return reels;
  const dir = folder();
  const file = dir && join(dir, 'reels.json');
  const list: Reel[] = file && existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
  reels = list.filter((r) => r.cards.length >= 4 && r.cards.every((_, k) => existsSync(join(dir!, 'img', `${r.id}-${k + 1}.webp`))));
  return reels;
}

/** Tests can put reels in without files. */
export function useReels(list: Reel[] | null) {
  reels = list;
}

export const reelById = (id: string) => allReels().find((r) => r.id === id);

/** A different order for each learner each day, so the feed feels fresh. */
export function feedOrder<T extends { id: string }>(list: T[], seed: string) {
  const day = new Date().toISOString().slice(0, 10);
  const key = (id: string) => createHash('sha256').update(`${seed}:${day}:${id}`).digest().readUInt32LE(0);
  return [...list].sort((a, b) => key(a.id) - key(b.id));
}

/** A card's words in the learner's language (English when a translation is missing). */
export const cardText = (text: Partial<Record<string, string>>, lang: string) => text[lang] ?? text.en ?? '';
