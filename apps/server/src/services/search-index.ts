import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { allCountries, allCourseBooks, WORLD } from './books.js';
import { EMBED_DIMS, EMBED_MODEL, embeddingCost, embedTexts, quantise } from './embeddings.js';
import { allPapers } from './exams.js';
import { allSummaryCards, summaryFor } from './summaries.js';

/**
 * The smart-search index: one vector for every piece of content Knowzone ships (each section of every
 * summary, every practice question, every book), so a search or a tutor question finds what it *means*,
 * not only the words it shares.
 *
 * It lives in `data/search/`, one JSON file per source file (`notes.biology.json` beside
 * `data/summaries/biology.json`, `questions.jamb-biology-p1.json`, `books.ng.json`), and ships with the
 * server exactly like the content it indexes: no table, no migration, nothing to load after a deploy, and
 * the same index in tests, on a laptop and on Render. Each item keeps a hash of its text, so
 * `scripts/search-index.ts` only pays to embed what is new or changed.
 *
 * Only vectors are stored: titles, snippets and links are read from the content at search time, in the
 * reader's language, so hiding or editing content never leaves a stale result behind.
 */
export type SearchKind = 'notes' | 'questions' | 'books';
export const SEARCH_KINDS: SearchKind[] = ['notes', 'questions', 'books'];

export type IndexItem = { id: string; text: string };
type Stored = { id: string; hash: string; v: string };
type ShardFile = { model: string; dims: number; items: Stored[] };

// ─── What gets indexed ────────────────────────────────────────────────────────

/** `card` is a summary's title, short line, keywords and key points; a number is one of its sections. */
export const noteId = (library: string, topic: string, part: number | 'card') => `${library}|${topic}|${part}`;
export const questionId = (paper: string, n: number) => `${paper}|${n}`;
/** `shelf` is a country's code, or `courses` for university textbooks. */
export const bookId = (shelf: string, id: string) => `${shelf}|${id}`;
export const COURSE_SHELF = 'courses';

const words = (id: string) => id.replace(/-/g, ' ');

/**
 * Everything to index, by shard (the file it's stored in). English text: the embedding model is
 * multilingual, so one English vector serves all ten languages. Hidden content is indexed too and left
 * out when searching, so un-hiding it needs no rebuild.
 */
export function indexableItems(): Map<string, IndexItem[]> {
  const shards = new Map<string, IndexItem[]>();
  const add = (shard: string, item: IndexItem) => {
    const list = shards.get(shard) ?? [];
    list.push(item);
    shards.set(shard, list);
  };

  for (const card of allSummaryCards('en', true)) {
    const s = summaryFor(card.library, card.id, 'en', true);
    if (!s) continue;
    const head = `${s.libraryName}: ${s.title}`;
    add(`notes.${card.library}`, {
      id: noteId(card.library, card.id, 'card'),
      text: [head, s.short, s.keywords.join(', '), ...s.keyPoints.map((k) => `- ${k}`)].join('\n'),
    });
    s.sections.forEach((section, i) =>
      add(`notes.${card.library}`, {
        id: noteId(card.library, card.id, i),
        text: `${head}\n${section.heading}\n${section.text}`,
      }),
    );
  }

  for (const paper of allPapers())
    for (const q of paper.questions)
      add(`questions.${paper.id}`, {
        id: questionId(paper.id, q.n),
        text: [
          `${paper.exam.toUpperCase()} ${words(paper.subject)}: ${q.topic}`,
          // Enough of a passage to say what it's about; the question itself matters more.
          q.passage ? q.passage.slice(0, 600) : '',
          q.q,
          q.options.map((o, i) => `${'ABCDE'[i]}. ${o}`).join('\n'),
          `Answer: ${q.options[q.answer]}. ${q.explanation}`,
        ]
          .filter(Boolean)
          .join('\n'),
      });

  for (const c of allCountries().values()) {
    if (c.country === WORLD) continue;
    const subjectName = new Map(c.subjects.map((s) => [s.id, s.name]));
    for (const b of c.books)
      add(`books.${c.country}`, {
        id: bookId(c.country, b.id),
        text: [
          b.title,
          b.series ? `Series: ${b.series}` : '',
          b.authors.length ? `By ${b.authors.join(', ')}` : '',
          b.publisher ?? '',
          `Textbook for ${[...new Set(b.placements.map((p) => subjectName.get(p.subject) ?? words(p.subject)))].join(', ')} (${c.name})`,
          b.notes ?? '',
        ]
          .filter(Boolean)
          .join('\n'),
      });
  }
  for (const b of allCourseBooks())
    add(`books.${COURSE_SHELF}`, {
      id: bookId(COURSE_SHELF, b.id),
      text: [
        b.title,
        b.authors.length ? `By ${b.authors.join(', ')}` : '',
        b.publisher ?? '',
        `University textbook for ${[...new Set(b.placements.map((p) => words(p.course)))].join(', ')}`,
        b.notes ?? '',
      ]
        .filter(Boolean)
        .join('\n'),
    });

  return shards;
}

// ─── Files ────────────────────────────────────────────────────────────────────

function shippedFolder() {
  // Works from src/ (tsx, tests) and dist/src/ (built server), whatever the working folder.
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 6; i++) {
    if (existsSync(join(dir, 'data', 'summaries'))) return join(dir, 'data', 'search');
    dir = dirname(dir);
  }
  return null;
}

let override: string | null | undefined;
/** Where the index is. Tests point it at a folder of their own (null: back to the shipped one). */
export function useSearchIndexFolder(dir: string | null) {
  override = dir ?? undefined;
  loaded.clear();
}
const folder = () => (override !== undefined ? override : shippedFolder());

const SHARD = /^(notes|questions|books)\.[a-z0-9-]+\.json$/;
const kindOf = (shard: string) => shard.slice(0, shard.indexOf('.')) as SearchKind;

/** The model and size are part of the hash: changing either re-embeds everything. */
const hashOf = (text: string) => createHash('sha256').update(`${EMBED_MODEL}:${EMBED_DIMS}:${text}`).digest('hex').slice(0, 20);

function readShard(file: string): Stored[] {
  try {
    const shard = JSON.parse(readFileSync(file, 'utf8')) as ShardFile;
    return shard.model === EMBED_MODEL && shard.dims === EMBED_DIMS && Array.isArray(shard.items) ? shard.items : [];
  } catch {
    return [];
  }
}

/** One item per line, so a change to one summary is a small diff, and written whole or not at all. */
function writeShard(file: string, items: Stored[]) {
  const lines = items.map((i) => JSON.stringify(i)).join(',\n');
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, `{"model":${JSON.stringify(EMBED_MODEL)},"dims":${EMBED_DIMS},"items":[\n${lines}\n]}\n`);
  renameSync(tmp, file);
}

// ─── Building ─────────────────────────────────────────────────────────────────

export type BuildReport = {
  /** Items in the index when the build stopped. */
  items: number;
  embedded: number;
  /** Already in the index with the same text. */
  kept: number;
  /** Dropped because their content is gone. */
  removed: number;
  /** Still without a vector (the build stopped at its budget). */
  waiting: number;
  tokens: number;
  costUsd: number;
  byKind: Record<SearchKind, number>;
};

/**
 * Brings the index up to date with the content: embeds what's new or changed, drops what's gone and
 * leaves the rest alone. Each shard is saved after every batch, so a build that stops (budget, network,
 * Ctrl-C) loses nothing and the next run carries on.
 */
export async function buildSearchIndex(
  options: {
    /** Texts per request. */
    batch?: number;
    /** Wait between requests, to stay inside Vultr's rate limit. */
    pauseMs?: number;
    /** Stop before spending more than this. */
    maxUsd?: number;
    /** Only say what a build would do. */
    dryRun?: boolean;
    /** Work on these shards alone (`notes.biology`, `questions.jamb-biology-p1`…) and leave the rest as they are. */
    only?: (shard: string) => boolean;
    onProgress?: (line: string) => void;
  } = {},
): Promise<BuildReport> {
  const { batch = 32, pauseMs = 0, maxUsd = 5, dryRun = false, only = () => true, onProgress } = options;
  const dir = folder();
  if (!dir) throw new Error('No data folder to keep the search index in');
  if (!dryRun) mkdirSync(dir, { recursive: true });

  const shards = new Map([...indexableItems()].filter(([shard]) => only(shard)));
  const report: BuildReport = {
    items: 0,
    embedded: 0,
    kept: 0,
    removed: 0,
    waiting: 0,
    tokens: 0,
    costUsd: 0,
    byKind: { notes: 0, questions: 0, books: 0 },
  };

  // Shards whose source file is gone.
  for (const f of existsSync(dir) ? readdirSync(dir) : []) {
    const shard = f.replace(/\.json$/, '');
    if (!SHARD.test(f) || shards.has(shard) || !only(shard)) continue;
    report.removed += readShard(join(dir, f)).length;
    if (!dryRun) rmSync(join(dir, f));
  }

  let stopped = false;
  for (const [shard, items] of shards) {
    const file = join(dir, `${shard}.json`);
    const before = readShard(file);
    const old = new Map(before.map((s) => [s.id, s]));
    const wanted = items.map((item) => ({ ...item, hash: hashOf(item.text) }));
    const have = new Map<string, Stored>();
    for (const w of wanted) {
      const o = old.get(w.id);
      if (o && o.hash === w.hash) have.set(w.id, o);
    }
    const todo = wanted.filter((w) => !have.has(w.id));
    report.kept += have.size;
    const wantedIds = new Set(wanted.map((w) => w.id));
    report.removed += before.filter((s) => !wantedIds.has(s.id)).length;

    // In the content's order, so a rebuild of unchanged content writes the same file.
    const save = () => {
      const now = wanted.flatMap((w) => have.get(w.id) ?? []);
      const same = now.length === before.length && now.every((s, i) => s === before[i]);
      if (!dryRun && !same) writeShard(file, now);
    };

    let done = 0;
    while (done < todo.length && !stopped && !dryRun) {
      if (report.costUsd >= maxUsd) {
        stopped = true;
        break;
      }
      const part = todo.slice(done, done + batch);
      const { vectors, tokens } = await embedTexts(part.map((p) => p.text));
      part.forEach((p, i) =>
        have.set(p.id, { id: p.id, hash: p.hash, v: Buffer.from(quantise(vectors[i]!).buffer).toString('base64') }),
      );
      done += part.length;
      report.embedded += part.length;
      report.tokens += tokens;
      report.costUsd = embeddingCost(report.tokens);
      save();
      if (pauseMs) await new Promise((r) => setTimeout(r, pauseMs));
    }
    if (!todo.length || dryRun) save();
    report.waiting += todo.length - done;
    report.items += have.size;
    report.byKind[kindOf(shard)] += have.size;
    if (todo.length)
      onProgress?.(
        `${shard}: ${dryRun ? `${todo.length} to embed` : `embedded ${done} of ${todo.length}`}, ${have.size - done} unchanged ($${report.costUsd.toFixed(4)} so far)`,
      );
  }
  loaded.clear();
  return report;
}

// ─── Reading ──────────────────────────────────────────────────────────────────

/** A kind's vectors side by side in one block of memory: 1 KB an item, and fast to scan. */
export type KindIndex = { ids: string[]; vectors: Int8Array; norms: Float32Array };

const loaded = new Map<SearchKind, KindIndex>();

/** A kind's index, read from its files the first time it's searched. Empty when nothing is built. */
export function searchIndex(kind: SearchKind): KindIndex {
  const known = loaded.get(kind);
  if (known) return known;
  const dir = folder();
  const stored =
    dir && existsSync(dir)
      ? readdirSync(dir)
          .filter((f) => SHARD.test(f) && f.startsWith(`${kind}.`))
          .sort()
          .flatMap((f) => readShard(join(dir, f)))
      : [];
  const ids: string[] = [];
  const vectors = new Int8Array(stored.length * EMBED_DIMS);
  const norms = new Float32Array(stored.length);
  for (const s of stored) {
    const bytes = Buffer.from(s.v, 'base64');
    if (bytes.length !== EMBED_DIMS) continue;
    const at = ids.length * EMBED_DIMS;
    let sum = 0;
    for (let j = 0; j < EMBED_DIMS; j++) {
      const x = (bytes[j]! << 24) >> 24;
      vectors[at + j] = x;
      sum += x * x;
    }
    norms[ids.length] = Math.sqrt(sum) || 1;
    ids.push(s.id);
  }
  const index = { ids, vectors: vectors.subarray(0, ids.length * EMBED_DIMS), norms };
  loaded.set(kind, index);
  return index;
}

/** The items closest in meaning to a query's vector (which is unit length), best first. */
export function nearest(kind: SearchKind, query: Float32Array, limit: number, floor = 0) {
  const { ids, vectors, norms } = searchIndex(kind);
  const hits: { id: string; score: number }[] = [];
  for (let i = 0; i < ids.length; i++) {
    const at = i * EMBED_DIMS;
    let dot = 0;
    for (let j = 0; j < EMBED_DIMS; j++) dot += query[j]! * vectors[at + j]!;
    const score = dot / norms[i]!;
    if (score >= floor) hits.push({ id: ids[i]!, score });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
