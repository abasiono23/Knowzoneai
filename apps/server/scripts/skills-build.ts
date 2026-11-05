/**
 * Builds data/skills/skills.json (Future skills) from the chosen videos' details (picked.json, from the
 * YouTube Data API) and the written summaries (skill-<subject>.json). Fails if a subject has too few
 * lessons, or a language or summary is missing, so nothing half-done reaches students.
 *
 *   npx tsx scripts/skills-build.ts <folder with picked.json and skill-*.json>
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import type { Skill } from '../src/services/skills.js';

const dir = process.argv[2];
if (!dir) throw new Error('Usage: npx tsx scripts/skills-build.ts <folder>');

const ORDER = ['coding', 'ui-ux', 'cybersecurity', 'ai-prompting', 'data-science'];
const LANGS = ['en', 'pcm', 'yo', 'ig', 'ha', 'fr', 'ar', 'sw', 'pt', 'es'];
const read = <T>(name: string) => JSON.parse(readFileSync(join(dir, name), 'utf8')) as T;

type Picked = { id: string; title: string; channel: string; seconds: number };
type Written = Pick<Skill, 'id' | 'name' | 'tagline' | 'summary'> & {
  videos: { id: string; summary: Record<string, string> }[];
};

const picked = read<Record<string, Picked[]>>('picked.json');
const full = (t: Record<string, string>, where: string) => {
  for (const l of LANGS) if (!t[l]?.trim()) throw new Error(`${where}: no ${l}`);
};

const skills: Skill[] = ORDER.map((id) => {
  const w = read<Written>(`skill-${id}.json`);
  full(w.name, `${id} name`);
  full(w.tagline, `${id} tagline`);
  full(w.summary, `${id} summary`);
  const videos = picked[id]!.map((v) => {
    const s = w.videos.find((x) => x.id === v.id);
    if (!s) throw new Error(`${id}: no summary for ${v.id}`);
    full(s.summary, `${id} ${v.id}`);
    return { youtubeId: v.id, title: v.title, channel: v.channel, seconds: v.seconds, summary: s.summary };
  });
  if (videos.length < 5) throw new Error(`${id}: only ${videos.length} lessons`);
  console.log(`${id}: ${videos.length} lessons`);
  return { id, name: w.name, tagline: w.tagline, summary: w.summary, videos };
});

const out = resolve(import.meta.dirname, '../data/skills');
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'skills.json'), JSON.stringify(skills, null, 1));
