import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

import { isHiddenContent, summaryKey } from './content-hides.js';
import type { LanguageId } from './personalization.js';

/**
 * Written summaries for a school subject (the Summaries tab on a subject's shelf): one long summary of
 * the whole course and many short ones, one per topic, in 10 languages. Syllabuses differ between
 * countries but these subjects share most topics, so one library serves every country. Written with
 * scripts/summaries-build.ts into data/summaries/<library>.json and shipped with the server.
 */
const Text = z.object({
  title: z.string().min(1),
  short: z.string().min(1),
  keywords: z.array(z.string()),
  sections: z.array(z.object({ heading: z.string().min(1), text: z.string().min(1) })).min(1),
  keyPoints: z.array(z.string().min(1)).min(1),
});
const Localised = z.record(z.string(), Text);
const Topic = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  stage: z.enum(['lower', 'upper']),
  text: Localised,
});
const Library = z.object({
  id: z.string().regex(/^[a-z-]+$/),
  name: z.record(z.string(), z.string()),
  overview: Localised,
  topics: z.array(Topic).min(1),
});
export type SummaryLibrary = z.infer<typeof Library>;

export const LIBRARIES = [
  'mathematics',
  'english',
  'biology',
  'chemistry',
  'physics',
  'economics',
  'geography',
  'business-studies',
  'computer-studies',
  'agricultural-science',
] as const;
export type LibraryId = (typeof LIBRARIES)[number];

const SCIENCE: LibraryId[] = ['biology', 'chemistry', 'physics'];
const COMPUTING: LibraryId[] = ['computer-studies'];
const AGRICULTURE: LibraryId[] = ['agricultural-science'];

/**
 * Which libraries a shelf subject reads. Countries name subjects differently, and some teach several
 * of these as one subject (South Africa's Physical Sciences, the UK's Combined Science).
 */
const FOR_SUBJECT: Record<string, LibraryId[]> = {
  mathematics: ['mathematics'],
  'core-mathematics': ['mathematics'],
  'technical-mathematics': ['mathematics'],
  'essential-mathematics': ['mathematics'],
  'mathematical-literacy': ['mathematics'],
  english: ['english'],
  'english-language': ['english'],
  biology: ['biology'],
  'biomedical-science': ['biology'],
  'life-sciences': ['biology'],
  chemistry: ['chemistry'],
  physics: ['physics'],
  'physical-sciences': ['physics', 'chemistry'],
  'technical-sciences': ['physics', 'chemistry'],
  science: SCIENCE,
  'combined-science': SCIENCE,
  'general-science': SCIENCE,
  'basic-science': SCIENCE,
  'integrated-science': SCIENCE,
  'natural-sciences': SCIENCE,
  economics: ['economics'],
  'economic-management-sciences': ['economics', 'business-studies'],
  geography: ['geography'],
  'business-studies': ['business-studies'],
  'business-management': ['business-studies'],
  'computer-studies': COMPUTING,
  'data-processing': COMPUTING,
  computing: COMPUTING,
  ict: COMPUTING,
  'computer-science': COMPUTING,
  'information-technology': COMPUTING,
  'computer-applications-technology': COMPUTING,
  'agricultural-science': AGRICULTURE,
  'marine-fisheries': AGRICULTURE,
  agriculture: AGRICULTURE,
  'agricultural-management-practices': AGRICULTURE,
};

function folder() {
  // Works from src/ (tsx, tests) and dist/src/ (built server), whatever the working folder.
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 6; i++) {
    const f = join(dir, 'data', 'summaries');
    if (existsSync(f)) return f;
    dir = dirname(dir);
  }
  return null;
}

const loaded = new Map<string, SummaryLibrary | null>();
/** A library, loaded the first time it's asked for. A malformed file fails: better than wrong notes. */
function library(id: string): SummaryLibrary | null {
  const known = loaded.get(id);
  if (known !== undefined) return known;
  const dir = folder();
  const f = dir && join(dir, `${id}.json`);
  const lib = f && existsSync(f) ? Library.parse(JSON.parse(readFileSync(f, 'utf8'))) : null;
  loaded.set(id, lib);
  return lib;
}

/** Tests can put libraries in without the files. */
export function useSummaries(list: SummaryLibrary[] | null) {
  loaded.clear();
  for (const lib of list ?? []) loaded.set(lib.id, lib);
}

function pick<T>(t: Record<string, T>, lang: LanguageId): T {
  return (t[lang] ?? t.en)!;
}

const card = ({ title, short, keywords }: z.infer<typeof Text>) => ({ title, short, keywords });
const hiddenSummary = (library: string, topic: string) => isHiddenContent('summary', summaryKey(library, topic));

/**
 * What a shelf subject's Summaries tab lists: its course summaries, then every topic with the ones for
 * the student's stage (lower or upper secondary) first. Other topics stay, for revising and searching.
 */
export function summariesFor(subject: string, stage: string | undefined, lang: LanguageId) {
  const libs = (FOR_SUBJECT[subject] ?? []).map(library).filter((l): l is SummaryLibrary => !!l);
  const topics = libs.flatMap((lib) =>
    lib.topics
      .filter((t) => !hiddenSummary(lib.id, t.id))
      .map((t) => ({
        library: lib.id,
        libraryName: pick(lib.name, lang),
        id: t.id,
        stage: t.stage,
        yours: t.stage === stage,
        ...card(pick(t.text, lang)),
      })),
  );
  return {
    /** False when this language's translation isn't out yet and the text is English. */
    translated: libs.some((lib) => !!lib.overview[lang]),
    courses: libs
      .filter((lib) => !hiddenSummary(lib.id, OVERVIEW))
      .map((lib) => ({
        library: lib.id,
        libraryName: pick(lib.name, lang),
        ...card(pick(lib.overview, lang)),
      })),
    topics: [...topics.filter((t) => t.yours), ...topics.filter((t) => !t.yours)],
  };
}

/** The libraries a shelf subject reads, whatever its country calls it. */
export const librariesFor = (subject: string): LibraryId[] => FOR_SUBJECT[subject] ?? [];

/** A library's name and topics in one language, for the Videos tab. */
export function libraryCards(id: LibraryId, lang: LanguageId) {
  const lib = library(id);
  return {
    libraryName: lib ? pick(lib.name, lang) : id,
    topics: (lib?.topics ?? []).map((t) => ({ id: t.id, stage: t.stage, title: pick(t.text, lang).title })),
  };
}

export const OVERVIEW = 'overview';

/** Every summary in one language, with its English words for search. */
export function allSummaryCards(lang: LanguageId, staff = false) {
  const cards = LIBRARIES.flatMap((id) => {
    const lib = library(id);
    if (!lib) return [];
    const libraryName = pick(lib.name, lang);
    const one = (topic: string, text: Record<string, z.infer<typeof Text>>) => {
      const t = pick(text, lang);
      const en = text.en;
      return {
        library: id,
        libraryName,
        id: topic,
        title: t.title,
        short: t.short,
        keywords: t.keywords,
        english: en ? `${en.title} ${en.keywords.join(' ')}` : '',
        languages: Object.keys(text),
      };
    };
    return [one(OVERVIEW, lib.overview), ...lib.topics.map((t) => one(t.id, t.text))];
  });
  return staff ? cards : cards.filter((c) => !hiddenSummary(c.library, c.id));
}

/** How far each library's translations have got, for the staff dashboard. */
export function summaryLibrariesReport() {
  return LIBRARIES.flatMap((id) => {
    const lib = library(id);
    if (!lib) return [];
    const missing = ['en', 'pcm', 'yo', 'ig', 'ha', 'fr', 'ar', 'sw', 'pt', 'es']
      .map((language) => ({ language, topics: lib.topics.filter((t) => !t.text[language]).length }))
      .filter((m) => m.topics > 0);
    return [{ id, name: pick(lib.name, 'en'), topics: lib.topics.length, missing }];
  });
}

/** One summary to read, in one language. `overview` is the whole course. */
export function summaryFor(libraryId: string, topic: string, lang: LanguageId, staff = false) {
  if (!staff && hiddenSummary(libraryId, topic)) return null;
  const lib = (LIBRARIES as readonly string[]).includes(libraryId) || loaded.has(libraryId) ? library(libraryId) : null;
  if (!lib) return null;
  const text = topic === OVERVIEW ? lib.overview : lib.topics.find((t) => t.id === topic)?.text;
  if (!text) return null;
  return {
    library: lib.id,
    libraryName: pick(lib.name, lang),
    id: topic,
    translated: !!text[lang],
    ...pick(text, lang),
  };
}
