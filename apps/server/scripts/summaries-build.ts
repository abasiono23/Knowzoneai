/**
 * Builds data/summaries/<library>.json from the written files: <folder>/en/<library>.json holds the
 * topics in English, and <folder>/<language>/<library>.json holds the same ids translated. Fails if a
 * language, summary or section is missing, so nothing half-done reaches students.
 *
 * Yoruba, Igbo and Hausa go out only for the subjects listed in <folder>/ready.json, once proofread
 * ({ "yo": ["mathematics"], ... }). Until then readers of those languages get the English.
 *
 *   npx tsx scripts/summaries-build.ts <folder> [library...]
 *
 * University, polytechnic and college courses are English only for now, from <folder>/university/en/<course>.json
 * (topics with a `level` of intro, core or masters), into data/summaries/uni-<course>.json:
 *
 *   npx tsx scripts/summaries-build.ts <folder> --courses [course...]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { COURSES, LIBRARIES, OVERVIEW, courseLibrary, type SummaryLibrary } from '../src/services/summaries.js';

const [dir, ...only] = process.argv.slice(2);
if (!dir) throw new Error('Usage: npx tsx scripts/summaries-build.ts <folder> [library...]');

const REQUIRED = ['en', 'pcm', 'fr', 'ar', 'sw', 'pt', 'es'];
const WHEN_READY = ['yo', 'ig', 'ha'];
const MIN_TOPICS = 15;

type Text = SummaryLibrary['overview'][string];
type English = {
  id: string;
  name: string;
  overview: Text;
  topics: (Text & { id: string; stage: 'lower' | 'upper' })[];
};
type Translated = { name: string; overview: Text; topics: (Text & { id: string })[] };

const LRI = '\u2066';
const PDI = '\u2069';
/**
 * Keeps formulas and Latin terms left-to-right inside Arabic paragraphs. Without this, "10 − 4 = 6" can
 * display backwards. Text a translator has already marked is left alone, and keywords stay unmarked for search.
 */
function protectFormulas(line: string) {
  if (line.includes(LRI)) return line;
  // A line with no Arabic (code, a sum) stays whole, so its "if x:" or "+ 101" keeps its punctuation in place.
  if (line.includes('\n')) return line.split('\n').map(protectFormulas).join('\n');
  if (line.trim() && !/[\u0600-\u06FF]/.test(line) && !/^[\p{L}\d.,\s]+$/u.test(line)) return `${LRI}${line}${PDI}`;
  return line.replace(/[^\u0600-\u06FF\n]+/g, (run) => {
    // An operator next to Arabic text stays outside, so "label = 5 × 2" keeps its "=" beside the label.
    // A minus touching its number ("−5") is part of the number and stays in.
    const m = /^([\s.,;:!?)\]]*(?:[=×÷+−≈]\s+)?)(.*?)((?:\s+[=×÷+−≈])?[\s.,;:!?([]*)$/su.exec(run)!;
    const core = m[2]!;
    // A lone number or word already displays correctly.
    if (!core || /^[\p{L}\d.,]+$/u.test(core)) return run;
    return `${m[1]}${LRI}${core}${PDI}${m[3]}`;
  });
}

function forArabic(t: Text): Text {
  return {
    ...t,
    title: protectFormulas(t.title),
    short: protectFormulas(t.short),
    keyPoints: t.keyPoints.map(protectFormulas),
    sections: t.sections.map((x) => ({ heading: protectFormulas(x.heading), text: protectFormulas(x.text) })),
  };
}

const read = <T>(lang: string, id: string) => JSON.parse(readFileSync(join(dir!, lang, `${id}.json`), 'utf8')) as T;

/** A translation must have the same shape as the English, so no paragraph quietly goes missing. */
function sameShape(en: Text, t: Text | undefined, where: string) {
  if (!t) throw new Error(`${where}: missing`);
  for (const s of [t.title, t.short, ...t.keyPoints, ...t.sections.flatMap((x) => [x.heading, x.text])])
    if (!s?.trim()) throw new Error(`${where}: empty text`);
  if (t.sections.length !== en.sections.length) throw new Error(`${where}: ${t.sections.length} sections`);
  if (t.keyPoints.length !== en.keyPoints.length) throw new Error(`${where}: ${t.keyPoints.length} key points`);
  if (!t.keywords?.length) throw new Error(`${where}: no keywords`);
}

const readyFile = join(dir, 'ready.json');
const ready = (existsSync(readyFile) ? JSON.parse(readFileSync(readyFile, 'utf8')) : {}) as Record<string, string[]>;

const out = resolve(import.meta.dirname, '../data/summaries');
mkdirSync(out, { recursive: true });

type Course = { id: string; name: string; overview: Text; topics: (Text & { id: string; level: string })[] };
const LEVELS = ['intro', 'core', 'masters'];
const courses = only[0] === '--courses' ? only.slice(1) : null;

for (const course of courses ? (courses.length ? courses : COURSES) : []) {
  if (!(COURSES as readonly string[]).includes(course)) throw new Error(`${course}: not in COURSES`);
  const file = join(dir, 'university', 'en', `${course}.json`);
  if (!existsSync(file)) {
    console.log(`${course}: not written yet`);
    continue;
  }
  const en = JSON.parse(readFileSync(file, 'utf8')) as Course;
  if (en.id !== course) throw new Error(`${course}: the file says ${en.id}`);
  if (en.topics.length < MIN_TOPICS) throw new Error(`${course}: only ${en.topics.length} topics`);
  if (new Set(en.topics.map((t) => t.id)).size !== en.topics.length) throw new Error(`${course}: repeated topic id`);
  if (en.topics.some((t) => t.id === OVERVIEW)) throw new Error(`${course}: a topic can't be called ${OVERVIEW}`);
  if (!en.name?.trim()) throw new Error(`${course}: no name`);
  sameShape(en.overview, en.overview, `${course} overview`);
  const lib: SummaryLibrary = {
    id: courseLibrary(course),
    name: { en: en.name },
    overview: { en: en.overview },
    topics: en.topics.map(({ id, level, title, short, keywords, sections, keyPoints }) => {
      if (!LEVELS.includes(level)) throw new Error(`${course} ${id}: level ${level}`);
      const text = { title, short, keywords, sections, keyPoints };
      sameShape(text, text, `${course} ${id}`);
      return { id, stage: level as 'intro' | 'core' | 'masters', text: { en: text } };
    }),
  };
  writeFileSync(join(out, `${lib.id}.json`), JSON.stringify(lib));
  console.log(`${lib.id}: ${lib.topics.length} topics in English`);
}

for (const id of courses ? [] : only.length ? only : LIBRARIES) {
  if (!existsSync(join(dir, 'en', `${id}.json`))) {
    console.log(`${id}: not written yet`);
    continue;
  }
  const en = read<English>('en', id);
  if (en.id !== id) throw new Error(`${id}: the file says ${en.id}`);
  if (en.topics.length < MIN_TOPICS) throw new Error(`${id}: only ${en.topics.length} topics`);
  if (new Set(en.topics.map((t) => t.id)).size !== en.topics.length) throw new Error(`${id}: repeated topic id`);
  if (en.topics.some((t) => t.id === OVERVIEW)) throw new Error(`${id}: a topic can't be called ${OVERVIEW}`);

  const name: Record<string, string> = {};
  const overview: Record<string, Text> = {};
  const texts = en.topics.map(() => ({}) as Record<string, Text>);
  const langs = [...REQUIRED, ...WHEN_READY.filter((l) => ready[l]?.includes(id))];
  for (const lang of langs) {
    const t = lang === 'en' ? en : read<Translated>(lang, id);
    if (!t.name?.trim()) throw new Error(`${id} ${lang}: no name`);
    name[lang] = t.name;
    sameShape(en.overview, t.overview, `${id} ${lang} overview`);
    overview[lang] = lang === 'ar' ? forArabic(t.overview) : t.overview;
    en.topics.forEach((topic, i) => {
      const found = t.topics.find((x) => x.id === topic.id);
      sameShape(topic, found, `${id} ${lang} ${topic.id}`);
      const { title, short, keywords, sections, keyPoints } = found!;
      const text = { title, short, keywords, sections, keyPoints };
      texts[i]![lang] = lang === 'ar' ? forArabic(text) : text;
    });
  }
  const lib: SummaryLibrary = {
    id,
    name,
    overview,
    topics: en.topics.map((t, i) => ({ id: t.id, stage: t.stage, text: texts[i]! })),
  };
  writeFileSync(join(out, `${id}.json`), JSON.stringify(lib));
  console.log(`${id}: ${lib.topics.length} topics in ${langs.length} languages (${langs.join(', ')})`);
}
