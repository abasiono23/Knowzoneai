import { allCountries, allCourseBooks, visibleBooks } from './books.js';
import { embedQuery } from './embeddings.js';
import { paperById, allPapers } from './exams.js';
import type { LanguageId } from './personalization.js';
import { fold, searchEverything, searchWords } from './search-all.js';
import { COURSE_SHELF, nearest, searchIndex, type SearchKind } from './search-index.js';
import { OVERVIEW, summaryFor } from './summaries.js';

/**
 * Smart search: finds notes, practice questions and books by what a search means ("why is the sky blue"
 * finds the notes on scattering of light), mixed with the keyword search so exact names still come first.
 * Without an index or a Vultr key, or when Vultr is slow, it is the keyword search alone.
 */
type Found = { id: string; title: string; snippet: string; link: string };
export type SmartNote = Found & { kind: 'note'; library: string; libraryName: string; topic: string; short: string };
export type SmartQuestion = Found & { kind: 'question'; paper: string; n: number; exam: string; subject: string; topic: string };
export type SmartBook = Found & {
  kind: 'book';
  book: { id: string; title: string; authors: string[]; cover: string | null; free: boolean; readUrl: string | null; shelf: string };
};
export type SmartItem = SmartNote | SmartQuestion | SmartBook;

/**
 * How alike a query and an item must be (cosine, 0 to 1) to count at all, and to be handed to the tutor.
 * Measured on Knowzone's content with qwen3-embedding-4b: a note that answers the question scores
 * 0.55–0.75, something loosely related 0.4–0.5, and "hello, how are you" still reaches 0.45 against
 * some note. So search takes what's above 0.42 and near its best match, and the tutor, where a wrong
 * link looks careless, only what's above 0.5.
 */
const FLOOR = 0.42;
const TUTOR_FLOOR = 0.5;
/** A practice paper is linked under a tutor answer only for a question this close. */
const PAPER_LINK_FLOOR = 0.55;
/** Search results this far below the best match are noise, even above the floor. */
const WINDOW = 0.2;
/** Reciprocal rank fusion's constant: the usual 60. */
const K = 60;

const clip = (s: string, n: number) => {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
};
const words = (id: string) => id.replace(/-/g, ' ');

// ─── From an index id to something to show ────────────────────────────────────

/** A summary, with the section that matched as its snippet. Null when it's hidden or gone. */
function note(library: string, topic: string, part: string | undefined, lang: LanguageId): SmartNote | null {
  const s = summaryFor(library, topic, lang);
  if (!s) return null;
  const section = part !== undefined && part !== 'card' ? s.sections[Number(part)] : undefined;
  return {
    kind: 'note',
    id: `${library}/${topic}`,
    title: s.title,
    snippet: clip(section ? `${section.heading}: ${section.text}` : s.short, 180),
    link: `/books/summary/${library}/${topic}`,
    library,
    libraryName: s.libraryName,
    topic,
    short: s.short,
  };
}

function question(paperId: string, n: number): SmartQuestion | null {
  const paper = paperById(paperId);
  const q = paper?.questions.find((x) => x.n === n);
  if (!paper || !q) return null;
  return {
    kind: 'question',
    id: `${paperId}/${n}`,
    title: clip(q.q, 160),
    snippet: `${paper.exam.toUpperCase()} ${words(paper.subject)} · ${q.topic}`,
    link: `/exams/paper/${paperId}`,
    paper: paperId,
    n,
    exam: paper.exam,
    subject: paper.subject,
    topic: q.topic,
  };
}

/** A book as the keyword search shows it. One country's own books stay with that country's students. */
function book(shelf: string, id: string, country?: string): SmartBook | null {
  if (shelf === COURSE_SHELF) {
    const b = visibleBooks(allCourseBooks()).find((x) => x.id === id);
    if (!b) return null;
    const link = `/books/subject/${b.placements[0]!.course}?stage=masters`;
    return {
      kind: 'book',
      id: b.id,
      title: b.title,
      snippet: clip([b.authors.join(', '), b.notes ?? ''].filter(Boolean).join(' · '), 180),
      link,
      book: { id: b.id, title: b.title, authors: b.authors, cover: b.cover ?? null, free: b.free, readUrl: b.readUrl ?? null, shelf: link },
    };
  }
  const c = allCountries().get(shelf);
  const b = c && visibleBooks(c.books).find((x) => x.id === id);
  if (!c || !b || (b.countryOnly && c.country !== country)) return null;
  const place = b.placements[0]!;
  const link = `/books/subject/${place.subject}?catalogue=${c.country}&level=${place.levels[0]}`;
  return {
    kind: 'book',
    id: b.id,
    title: b.title,
    snippet: clip([b.authors.join(', '), b.publisher ?? '', b.notes ?? ''].filter(Boolean).join(' · '), 180),
    link,
    book: { id: b.id, title: b.title, authors: b.authors, cover: b.cover ?? null, free: b.free, readUrl: b.readUrl ?? null, shelf: link },
  };
}

/** What one result is, whichever search found it: a summary once (not once per section), a book once per title. */
const keyOf = (item: SmartItem) => (item.kind === 'book' ? `book:${fold(item.title)}` : `${item.kind}:${item.id}`);

// ─── The two searches ─────────────────────────────────────────────────────────

type Ranked = { item: SmartItem; score: number };

/** By meaning: each kind's nearest items, as results, best first across kinds. */
function byMeaning(vector: Float32Array, kinds: SearchKind[], lang: LanguageId, country: string | undefined, floor: number) {
  const out = new Map<string, Ranked>();
  const keep = (item: SmartItem | null, score: number) => {
    if (!item) return;
    const key = keyOf(item);
    // The best-matching section speaks for its summary; a student's own country's copy of a book for the book.
    if (!out.has(key)) out.set(key, { item, score });
  };
  if (kinds.includes('notes'))
    for (const hit of nearest('notes', vector, 60, floor)) {
      const [library, topic, part] = hit.id.split('|');
      keep(note(library!, topic!, part, lang), hit.score);
    }
  if (kinds.includes('questions'))
    for (const hit of nearest('questions', vector, 30, floor)) {
      const [paper, n] = hit.id.split('|');
      keep(question(paper!, Number(n)), hit.score);
    }
  if (kinds.includes('books')) {
    const hits = nearest('books', vector, 40, floor).map((hit) => {
      const [shelf, id] = hit.id.split('|');
      return { shelf: shelf!, id: id!, score: hit.score };
    });
    for (const hit of hits) {
      const item = book(hit.shelf, hit.id, country);
      const known = item && out.get(keyOf(item));
      // A book on several countries' lists opens on the student's own shelf.
      if (item && known && hit.shelf === country) known.item = item;
      else keep(item, hit.score);
    }
  }
  const ranked = [...out.values()].sort((a, b) => b.score - a.score);
  const best = ranked[0]?.score ?? 0;
  return ranked.filter((r) => r.score >= best - WINDOW);
}

/** By words, one list per kind, as the dashboard's search ranks them. */
async function byWords(q: string, kinds: SearchKind[], lang: LanguageId, country?: string, region?: string) {
  const lists: SmartItem[][] = [];
  const found = kinds.includes('notes') || kinds.includes('books') ? await searchEverything(lang, q, country, region) : null;
  if (found && kinds.includes('notes'))
    lists.push(found.summaries.flatMap((s) => note(s.library, s.id, undefined, lang) ?? []));
  if (found && kinds.includes('books'))
    lists.push(
      found.books.map((b) => ({
        kind: 'book' as const,
        id: b.id,
        title: b.title,
        snippet: b.authors.join(', '),
        link: b.shelf,
        book: b,
      })),
    );
  if (kinds.includes('questions')) {
    const want = searchWords(q);
    if (want.length && want.join('').length >= 2) {
      const hits: { item: SmartQuestion; inQuestion: number }[] = [];
      for (const paper of allPapers())
        for (const x of paper.questions) {
          const text = fold(`${x.q} ${x.topic} ${x.options.join(' ')} ${paper.exam} ${words(paper.subject)}`);
          if (!want.every((w) => text.includes(w))) continue;
          const item = question(paper.id, x.n);
          const stem = fold(`${x.q} ${x.topic}`);
          if (item) hits.push({ item, inQuestion: want.filter((w) => stem.includes(w)).length });
        }
      lists.push(
        hits
          .sort((a, b) => b.inQuestion - a.inQuestion)
          .slice(0, 20)
          .map((h) => h.item),
      );
    }
  }
  return lists;
}

export type SmartSearchInput = {
  q: string;
  kinds?: SearchKind[];
  lang: LanguageId;
  limit?: number;
  /** The student's books catalogue (a country code), as `/search/all` takes it. */
  country?: string;
  region?: string;
  /** Who is searching, for the usage log. */
  userId?: string;
};

/** Whether there is anything to search by meaning. */
export const hasSearchIndex = (kinds: SearchKind[]) => kinds.some((k) => searchIndex(k).ids.length > 0);

/**
 * The search. `semantic` says whether meaning was used, or only words (no key, no index, Vultr down).
 * The two rankings are mixed by reciprocal rank fusion: a result both searches like comes first, and a
 * book or topic named exactly is never buried by something merely related.
 */
export async function smartSearch(input: SmartSearchInput): Promise<{ semantic: boolean; items: SmartItem[] }> {
  const kinds = input.kinds?.length ? input.kinds : (['notes', 'questions', 'books'] as SearchKind[]);
  const limit = Math.min(Math.max(input.limit ?? 12, 1), 30);
  const q = input.q.trim();
  if (q.length < 2) return { semantic: false, items: [] };

  const [vector, lists] = await Promise.all([
    hasSearchIndex(kinds) ? embedQuery(q, input.userId) : null,
    byWords(q, kinds, input.lang, input.country, input.region),
  ]);
  const meaning = vector ? byMeaning(vector, kinds, input.lang, input.country, FLOOR).map((r) => r.item) : [];

  const fused = new Map<string, { item: SmartItem; score: number }>();
  for (const list of [meaning, ...lists])
    list.forEach((item, rank) => {
      const key = keyOf(item);
      const known = fused.get(key);
      // The meaning search's copy is kept: its snippet is the passage that matched.
      if (known) known.score += 1 / (K + rank + 1);
      else fused.set(key, { item, score: 1 / (K + rank + 1) });
    });
  return {
    semantic: !!vector,
    items: [...fused.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((r) => r.item),
  };
}

// ─── For the tutor ────────────────────────────────────────────────────────────

export type RelatedLink = { kind: 'note' | 'question'; title: string; link: string };
export type TutorReferences = {
  /** Passages from Knowzone's notes and practice questions, for the model to read. */
  material: string;
  /** 1–3 places in the app to read more, shown under the answer. */
  related: RelatedLink[];
};

/**
 * What Knowzone already teaches about a tutor question: the closest sections of notes and worked
 * practice questions (in the student's language where the notes have it), and links to them. Null when
 * nothing is close enough, or smart search isn't available: the tutor then answers exactly as before.
 */
export async function tutorReferences(questionText: string, lang: LanguageId, userId: string): Promise<TutorReferences | null> {
  const q = questionText.trim();
  if (q.length < 8 || !hasSearchIndex(['notes', 'questions'])) return null;
  const vector = await embedQuery(q, userId, 'tutor_embed');
  if (!vector) return null;

  const passages: string[] = [];
  const related: RelatedLink[] = [];
  const perTopic = new Map<string, number>();
  for (const hit of nearest('notes', vector, 12, TUTOR_FLOOR)) {
    const [library, topic, part] = hit.id.split('|') as [string, string, string];
    const s = summaryFor(library, topic, lang);
    if (!s) continue;
    const key = `${library}/${topic}`;
    const used = perTopic.get(key) ?? 0;
    // The whole-course overview repeats what the topics say better, and is too broad to be worth a link.
    if (topic === OVERVIEW) continue;
    if (!related.some((r) => r.link === `/books/summary/${library}/${topic}`))
      related.push({ kind: 'note', title: s.title, link: `/books/summary/${library}/${topic}` });
    if (passages.length >= 4 || used >= 2) continue;
    perTopic.set(key, used + 1);
    const section = part === 'card' ? undefined : s.sections[Number(part)];
    passages.push(
      section
        ? `[Notes] ${s.libraryName}: ${s.title} — ${section.heading}\n${clip(section.text, 1400)}`
        : `[Notes] ${s.libraryName}: ${s.title}\n${clip([s.short, ...s.keyPoints].join(' '), 1400)}`,
    );
  }

  let questions = 0;
  let paperLink: RelatedLink | undefined;
  for (const hit of nearest('questions', vector, 6, TUTOR_FLOOR)) {
    const [paperId, n] = hit.id.split('|') as [string, string];
    const paper = paperById(paperId);
    const x = paper?.questions.find((y) => y.n === Number(n));
    if (!paper || !x) continue;
    if (questions < 2) {
      questions++;
      passages.push(
        [
          `[Practice question] ${paper.exam.toUpperCase()} ${words(paper.subject)}: ${x.topic}`,
          clip(x.q, 600),
          x.options.map((o, i) => `${'ABCDE'[i]}. ${o}`).join('\n'),
          `Answer: ${'ABCDE'[x.answer]}. ${clip(x.explanation, 600)}`,
        ].join('\n'),
      );
    }
    // One practice paper at most, after the notes, and only for a question that's plainly on the same thing.
    if (hit.score >= PAPER_LINK_FLOOR && !paperLink)
      paperLink = {
        kind: 'question',
        title: `${paper.exam.toUpperCase()} ${words(paper.subject)} · ${x.topic}`,
        link: `/exams/paper/${paperId}`,
      };
  }
  if (!passages.length) return null;
  return {
    material: passages.join('\n\n'),
    related: [...related.slice(0, paperLink ? 2 : 3), ...(paperLink ? [paperLink] : [])],
  };
}
