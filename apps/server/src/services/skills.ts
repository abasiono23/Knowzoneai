import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

import type { LanguageId } from './personalization.js';
import { liveVideo } from './subject-videos.js';

/**
 * Future skills (Explore): coding, UI/UX design, cybersecurity, AI prompting and data science. Each is
 * a set of YouTube lessons that play in YouTube's own player, with a written summary in 10 languages.
 * Built by scripts/skills-build.ts into data/skills/skills.json and shipped with the server.
 */
const Text = z.record(z.string(), z.string());
const Video = z.object({
  youtubeId: z.string().regex(/^[\w-]{11}$/),
  title: z.string().min(1),
  channel: z.string().min(1),
  seconds: z.number().int().positive(),
  summary: Text,
});
const Skill = z.object({
  id: z.string().regex(/^[a-z-]+$/),
  name: Text,
  tagline: Text,
  summary: Text,
  videos: z.array(Video).min(5),
});
export type Skill = z.infer<typeof Skill>;

function file() {
  // Works from src/ (tsx, tests) and dist/src/ (built server), whatever the working folder.
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 6; i++) {
    const f = join(dir, 'data', 'skills', 'skills.json');
    if (existsSync(f)) return f;
    dir = dirname(dir);
  }
  return null;
}

let skills: Skill[] | null = null;
/** Every subject, loaded once. A malformed file stops the server: better than showing wrong lessons. */
export function allSkills(): Skill[] {
  if (skills) return skills;
  const f = file();
  skills = f ? z.array(Skill).parse(JSON.parse(readFileSync(f, 'utf8'))) : [];
  return skills;
}

/** Tests can put subjects in without the file. */
export function useSkills(list: Skill[] | null) {
  skills = list;
}

const pick = (t: Record<string, string>, lang: LanguageId) => t[lang] ?? t.en ?? '';

/** The subjects' cards, in one language. */
export const skillCards = (lang: LanguageId) =>
  allSkills().map((s) => ({
    id: s.id,
    name: pick(s.name, lang),
    tagline: pick(s.tagline, lang),
    lessons: s.videos.length,
  }));

/** A subject and its lessons, in one language. Video titles stay as their creators wrote them. */
export function skillFor(id: string, lang: LanguageId) {
  const s = allSkills().find((x) => x.id === id);
  if (!s) return null;
  return {
    id: s.id,
    name: pick(s.name, lang),
    summary: pick(s.summary, lang),
    videos: s.videos.flatMap((v) => {
      const live = liveVideo(v);
      return live ? [{ ...live, summary: pick(v.summary, lang) }] : [];
    }),
  };
}
