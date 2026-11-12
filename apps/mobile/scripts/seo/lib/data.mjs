/**
 * Reads Knowzone's content from the server's data files (read only): practice papers, summaries,
 * book lists, and the course names the app uses.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { LANG, slug } from './html.mjs';

const MOBILE = resolve(import.meta.dirname, '../../..');
const SERVER = resolve(MOBILE, '../server/data');
if (!existsSync(SERVER)) throw new Error(`Knowzone's data wasn't found at ${SERVER}. The build needs the whole repository, not only apps/mobile.`);

const json = (...parts) => JSON.parse(readFileSync(resolve(SERVER, ...parts), 'utf8'));
/** The text in this build's language, or English. */
export const pick = (localised) => localised?.[LANG] ?? localised?.en;

// ─── Practice papers ──────────────────────────────────────────────────────────

/** Same order and names as apps/server/src/data/exams.ts and the app's exam screens. */
export const EXAMS = {
  jamb: { name: 'JAMB', full: 'JAMB UTME', about: 'the computer-based Unified Tertiary Matriculation Examination' },
  waec: { name: 'WAEC', full: 'WAEC WASSCE', about: 'the West African Senior School Certificate Examination' },
  neco: { name: 'NECO', full: 'NECO SSCE', about: 'the Senior School Certificate Examination' },
};
export const EXAM_SUBJECTS = {
  english: 'English Language',
  mathematics: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  economics: 'Economics',
  government: 'Government',
  literature: 'Literature in English',
  geography: 'Geography',
  commerce: 'Commerce',
};
/** Questions of a paid paper that anyone may see. */
export const PREVIEW = 10;

/**
 * Papers by exam and subject. Each paper gets `shown`: the questions these pages may show (all of a
 * subject's first paper, which is free in the app; the first few of the others). Topic pages are made
 * from `shown` only, so nothing behind the paywall appears anywhere.
 */
export function loadPapers() {
  const papers = readdirSync(resolve(SERVER, 'exams'))
    .filter((f) => /^[a-z]+-[a-z-]+-p\d+\.json$/.test(f))
    .map((f) => json('exams', f))
    .filter((p) => EXAMS[p.exam] && EXAM_SUBJECTS[p.subject] && Array.isArray(p.questions));
  for (const p of papers) {
    p.questions = p.questions
      .filter((q) => q.q && Array.isArray(q.options) && q.options.length > 1 && q.options[q.answer] !== undefined)
      .sort((a, b) => a.n - b.n);
    // The same rule as the server's canOpen() for people on the free plan.
    p.free = p.source === 'ai' && p.number === 1;
    p.shown = p.free ? p.questions : p.questions.slice(0, PREVIEW);
  }
  const groups = [];
  for (const exam of Object.keys(EXAMS))
    for (const subject of Object.keys(EXAM_SUBJECTS)) {
      const own = papers.filter((p) => p.exam === exam && p.subject === subject).sort((a, b) => a.number - b.number);
      if (!own.length) continue;
      // Topics, in the order they first appear, with the questions that may be shown.
      const topics = new Map();
      for (const p of own)
        for (const q of p.shown) {
          const id = slug(q.topic);
          if (!id || /^paper-\d+$/.test(id)) continue;
          if (!topics.has(id)) topics.set(id, { id, name: q.topic, questions: [] });
          topics.get(id).questions.push({ ...q, paper: p });
        }
      groups.push({ exam, subject, papers: own, topics: [...topics.values()] });
    }
  return groups;
}

// ─── Summaries ────────────────────────────────────────────────────────────────

export const STAGES = { lower: 'Junior secondary', upper: 'Senior secondary', intro: 'First year', core: 'Later years', masters: 'Master’s' };

/** Summary libraries: school subjects, and university courses (ids starting "uni-"). */
export function loadLibraries() {
  return readdirSync(resolve(SERVER, 'summaries'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => json('summaries', f))
    .filter((l) => pick(l.overview) && l.topics?.length)
    .map((l) => ({
      id: l.id,
      course: l.id.startsWith('uni-') ? l.id.slice(4) : null,
      name: pick(l.name),
      overview: pick(l.overview),
      topics: l.topics.filter((t) => pick(t.text) && t.id !== 'overview').map((t) => ({ id: t.id, stage: t.stage, ...pick(t.text) })),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ─── Books ────────────────────────────────────────────────────────────────────

export const COURSE_LEVELS = { intro: 'First year', core: 'Later years', masters: 'Master’s' };

/** "ss2" → "SS 2", "grade10" → "Grade 10"; else the name the list gives. */
export function levelName(id, name) {
  if (name) return name;
  const m = id.match(/^(jss|ss|jhs|shs|grade|year|form|nd|hnd|nce)(\d+)$/);
  if (!m) return id;
  const word = { grade: 'Grade', year: 'Year', form: 'Form' }[m[1]] ?? m[1].toUpperCase();
  return `${word} ${m[2]}`;
}

const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * Every book once. The same book appears in several lists (a free textbook used in five countries
 * and at university) and sometimes twice under different ids: entries with the same id, the same
 * ISBN, or the same title and first author are one work and get one page, with all their uses.
 */
export function loadBooks() {
  const countries = readdirSync(resolve(SERVER, 'books'))
    .filter((f) => /^[a-z]{2}\.json$/.test(f))
    .map((f) => json('books', f))
    .sort((a, b) => a.name.localeCompare(b.name));
  const catalogue = json('books', 'courses.json');

  const entries = [];
  for (const b of catalogue.books) entries.push({ ...b, uses: b.placements.map((p) => ({ kind: 'course', course: p.course, levels: p.levels })) });
  for (const c of countries)
    for (const b of c.books)
      entries.push({ ...b, uses: b.placements.map((p) => ({ kind: 'school', country: c.country, subject: p.subject, levels: p.levels })) });

  // Group the entries that are the same work.
  const group = new Map();
  const works = [];
  for (const e of entries) {
    const keys = [`id:${e.id}`];
    if (e.isbn) keys.push(`isbn:${e.isbn.replace(/[^0-9x]/gi, '')}`);
    if (e.authors?.[0]) keys.push(`work:${norm(e.title)}|${norm(e.authors[0])}`);
    const found = [...new Set(keys.map((k) => group.get(k)).filter(Boolean))];
    const work = found[0] ?? { entries: [] };
    if (!found.length) works.push(work);
    // An entry that links two groups joins them.
    for (const other of found.slice(1)) {
      work.entries.push(...other.entries);
      works.splice(works.indexOf(other), 1);
      for (const [k, w] of group) if (w === other) group.set(k, work);
    }
    work.entries.push(e);
    for (const k of keys) group.set(k, work);
  }

  const slugs = new Set();
  const books = works.map(({ entries: same }) => {
    // The fullest entry leads: a free one you can read, then one with a cover, an ISBN, the shortest id.
    const score = (e) => (e.free && e.readUrl ? 8 : 0) + (e.cover ? 4 : 0) + (e.isbn ? 2 : 0) + (e.notes ? 1 : 0);
    const [main, ...rest] = [...same].sort((a, b) => score(b) - score(a) || a.id.length - b.id.length || a.id.localeCompare(b.id));
    const book = { ...main };
    for (const field of ['authors', 'publisher', 'edition', 'year', 'isbn', 'cover', 'series', 'notes'])
      if (book[field] == null || book[field].length === 0) book[field] = rest.map((e) => e[field]).find((v) => v != null && v.length !== 0) ?? null;
    // Uses, merged: one line per course, and per country and subject.
    const uses = new Map();
    for (const u of same.flatMap((e) => e.uses)) {
      const key = u.kind === 'course' ? `course/${u.course}` : `${u.country}/${u.subject}`;
      const seen = uses.get(key);
      if (seen) seen.levels = [...new Set([...seen.levels, ...u.levels])];
      else uses.set(key, { ...u, levels: [...u.levels] });
    }
    book.uses = [...uses.values()];
    delete book.placements;
    // The page address: the id, tidied (a shortened id can end in a dash).
    book.slug = slug(book.id);
    if (!book.slug || slugs.has(book.slug)) throw new Error(`Two books would share the address "${book.slug}" (${book.id})`);
    slugs.add(book.slug);
    return book;
  });
  return { books, countries, updated: catalogue.updated, entries: entries.length };
}

// ─── Courses (names and faculties, from the app) ──────────────────────────────

/** The `{ … }` or `[ … ]` that ends `marker` in a source file, as a value. They hold only plain text. */
function literal(source, marker) {
  const at = source.indexOf(marker);
  if (at < 0) return null;
  const start = at + marker.length - 1;
  const [open, close] = source[start] === '[' ? ['[', ']'] : ['{', '}'];
  let depth = 0;
  let quote = null;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
    } else if (ch === "'" || ch === '"' || ch === '`') quote = ch;
    else if (ch === open) depth++;
    else if (ch === close && --depth === 0) return new Function(`return (${source.slice(start, i + 1)});`)();
  }
  return null;
}

const titleCase = (id) => id.replace(/(^|-)([a-z])/g, (_, dash, ch) => (dash ? ' ' : '') + ch.toUpperCase());

/**
 * The app's course list: faculties with their courses, and each course's name. Read from the app's
 * own files so these pages and the app use the same names; a course the app doesn't name gets its id
 * in title case.
 */
export function loadCourses() {
  let names = {};
  let facultyNames = {};
  let faculties = [];
  try {
    const locale = readFileSync(resolve(MOBILE, 'src/i18n/locales/en/books.ts'), 'utf8');
    names = literal(locale, '\n  courses: {') ?? {};
    facultyNames = literal(locale, '\n  faculties: {') ?? {};
    const lib = readFileSync(resolve(MOBILE, 'src/lib/books.ts'), 'utf8');
    const decl = lib.slice(lib.indexOf('export const FACULTIES'));
    faculties = literal(decl, '= [') ?? [];
  } catch (e) {
    console.warn(`seo: couldn't read the app's course names (${e.message}); using ids`);
  }
  if (!Object.keys(names).length || !faculties.length) console.warn('seo: the app’s course list came back empty; using ids');
  return {
    name: (id) => names[id] ?? titleCase(id),
    named: (id) => id in names,
    faculties: faculties.map((f) => ({ id: f.id, name: facultyNames[f.id] ?? titleCase(f.id), courses: [...f.courses, ...(f.mastersOnly ?? [])] })),
  };
}
