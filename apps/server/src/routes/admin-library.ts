import { Router } from 'express';
import { z } from 'zod';

import { notFound } from '../lib/errors.js';
import { allCountries, allCourseBooks, WORLD } from '../services/books.js';
import { fold } from '../services/search-all.js';
import { hideContent, listHiddenContent, showContent, summaryKey } from '../services/content-hides.js';
import { allSkills } from '../services/skills.js';
import { allVideoPlaces, isGoneVideo, videoSetsReport } from '../services/subject-videos.js';
import { allSummaryCards, summaryFor, summaryLibrariesReport } from '../services/summaries.js';
import { allCourseVideos } from '../services/watch.js';

/**
 * The staff dashboard's Library: everything learners can open, to look through and to spot what's missing.
 * Mounted inside the admin router, behind its staff check. The content itself lives in data/ (and the
 * courses' lessons), so new items still arrive through the build scripts.
 */
export const adminLibraryRouter = Router();

const PAGE = 50;

const Query = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  q: z.string().trim().max(120).optional(),
  source: z.enum(['all', 'subject', 'skill', 'course']).default('all'),
  set: z.string().trim().max(60).optional(),
  country: z.string().trim().max(20).optional(),
  price: z.enum(['all', 'free', 'paid']).default('all'),
  cover: z.enum(['all', 'missing']).default('all'),
  library: z.string().trim().max(60).optional(),
  state: z.enum(['all', 'live', 'hidden']).default('all'),
});

/** Who hid what and why, to mark each row and to filter by. */
async function hiddenLookup(kind: string) {
  const rows = (await listHiddenContent()).filter((h) => h.kind === kind);
  const found = new Map(rows.map((h) => [h.itemId, { reason: h.reason, hiddenBy: h.hiddenBy, at: h.createdAt }]));
  return {
    of: (id: string) => found.get(id) ?? null,
    keep: (state: string, id: string) => state === 'all' || (state === 'hidden') === found.has(id),
  };
}

/** Keeps what has every word of the search, and cuts out one page. */
function page<T>(list: T[], q: string | undefined, hay: (x: T) => string, at: number) {
  const words = fold(q ?? '')
    .split(/\s+/)
    .filter(Boolean);
  const found = words.length
    ? list.filter((x) => {
        const text = fold(hay(x));
        return words.every((w) => text.includes(w));
      })
    : list;
  return { items: found.slice((at - 1) * PAGE, at * PAGE), total: found.length, pageSize: PAGE };
}

type VideoRow = {
  youtubeId: string;
  title: string;
  channel: string;
  seconds: number;
  gone: boolean;
  sources: ('subject' | 'skill' | 'course')[];
  sets: string[];
  places: string[];
};

/** Every video once, with everywhere it appears. */
async function videoRows() {
  const rows = new Map<string, VideoRow>();
  const add = (
    v: { youtubeId: string; title: string; channel: string; seconds: number },
    source: VideoRow['sources'][number],
    place: string,
    set?: string,
  ) => {
    const row =
      rows.get(v.youtubeId) ??
      ({
        youtubeId: v.youtubeId,
        title: v.title,
        channel: v.channel,
        seconds: v.seconds,
        gone: isGoneVideo(v.youtubeId),
        sources: [],
        sets: [],
        places: [],
      } satisfies VideoRow);
    if (!row.sources.includes(source)) row.sources.push(source);
    if (set && !row.sets.includes(set)) row.sets.push(set);
    if (!row.places.includes(place)) row.places.push(place);
    rows.set(v.youtubeId, row);
  };
  for (const v of allVideoPlaces()) add(v, 'subject', `${v.libraryName} · ${v.topicTitle}`, v.library);
  for (const s of allSkills()) for (const v of s.videos) add(v, 'skill', `Future skills · ${s.name.en ?? s.id}`);
  for (const v of await allCourseVideos()) add(v, 'course', `Course · ${v.course}`);
  return [...rows.values()];
}

adminLibraryRouter.get('/admin/library/videos', async (req, res) => {
  const q = Query.parse(req.query);
  const rows = await videoRows();
  const sets = [...new Map(allVideoPlaces().map((v) => [v.library, v.libraryName])).entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const hidden = await hiddenLookup('video');
  const chosen = rows
    .filter(
      (r) =>
        (q.source === 'all' || r.sources.includes(q.source)) &&
        (!q.set || q.set === 'all' || r.sets.includes(q.set)) &&
        hidden.keep(q.state, r.youtubeId),
    )
    .map((r) => ({ ...r, hidden: hidden.of(r.youtubeId) }));
  res.json({
    ...page(chosen, q.q, (r) => `${r.title} ${r.channel} ${r.youtubeId} ${r.places.join(' ')}`, q.page),
    sets,
  });
});

/** Every book once, with the countries and subjects (or courses) it's on. */
function bookRows() {
  const rows = new Map<
    string,
    {
      id: string;
      title: string;
      authors: string[];
      publisher: string | null;
      cover: string | null;
      free: boolean;
      readUrl: string | null;
      license: string | null;
      countries: string[];
      subjects: string[];
    }
  >();
  const add = (
    b: {
      id: string;
      title: string;
      authors: string[];
      publisher: string | null;
      cover?: string | null | undefined;
      free: boolean;
      readUrl?: string | null | undefined;
      license?: string | null | undefined;
    },
    place: string,
    subjects: string[],
  ) => {
    const row = rows.get(b.id) ?? {
      id: b.id,
      title: b.title,
      authors: b.authors,
      publisher: b.publisher,
      cover: b.cover ?? null,
      free: b.free,
      readUrl: b.readUrl ?? null,
      license: b.license ?? null,
      countries: [],
      subjects: [],
    };
    if (!row.countries.includes(place)) row.countries.push(place);
    row.subjects = [...new Set([...row.subjects, ...subjects])];
    rows.set(b.id, row);
  };
  for (const c of allCountries().values()) {
    if (c.country === WORLD) continue;
    for (const b of c.books)
      add(
        b,
        c.country,
        b.placements.map((p) => p.subject),
      );
  }
  for (const b of allCourseBooks())
    add(
      b,
      'courses',
      b.placements.map((p) => p.course),
    );
  return [...rows.values()];
}

adminLibraryRouter.get('/admin/library/books', async (req, res) => {
  const q = Query.parse(req.query);
  const countries = [...allCountries().values()]
    .filter((c) => c.country !== WORLD)
    .map((c) => ({ id: c.country, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const hidden = await hiddenLookup('book');
  const chosen = bookRows()
    .filter(
      (b) =>
        (!q.country || q.country === 'all' || b.countries.includes(q.country)) &&
        (q.price === 'all' || b.free === (q.price === 'free')) &&
        (q.cover === 'all' || !b.cover) &&
        hidden.keep(q.state, b.id),
    )
    .map((b) => ({ ...b, hidden: hidden.of(b.id) }));
  res.json({
    ...page(
      chosen,
      q.q,
      (b) => `${b.title} ${b.authors.join(' ')} ${b.publisher ?? ''} ${b.subjects.join(' ')} ${b.id}`,
      q.page,
    ),
    countries,
  });
});

adminLibraryRouter.get('/admin/library/summaries', async (req, res) => {
  const q = Query.parse(req.query);
  const cards = allSummaryCards('en', true);
  const hidden = await hiddenLookup('summary');
  const libraries = [...new Map(cards.map((c) => [c.library, c.libraryName])).entries()].map(([id, name]) => ({
    id,
    name,
  }));
  const chosen = cards
    .filter(
      (c) =>
        (!q.library || q.library === 'all' || c.library === q.library) &&
        hidden.keep(q.state, summaryKey(c.library, c.id)),
    )
    .map(({ library, libraryName, id, title, short, languages }) => ({
      hidden: hidden.of(summaryKey(library, id)),
      library,
      libraryName,
      id,
      title,
      short,
      languages,
    }));
  res.json({ ...page(chosen, q.q, (c) => `${c.title} ${c.short} ${c.libraryName}`, q.page), libraries });
});

const Lang = z.object({ lang: z.enum(['en', 'pcm', 'yo', 'ig', 'ha', 'fr', 'ar', 'sw', 'pt', 'es']).default('en') });

adminLibraryRouter.get('/admin/library/summaries/:library/:topic', (req, res) => {
  const summary = summaryFor(String(req.params.library), String(req.params.topic), Lang.parse(req.query).lang, true);
  if (!summary) throw notFound('No such summary');
  res.json(summary);
});

const Hide = z.object({
  kind: z.enum(['video', 'book', 'summary']),
  id: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(300),
  reason: z.string().trim().min(3).max(300),
});

/** Takes something out of the app for everyone. Nothing is deleted, and showing it again is one click. */
adminLibraryRouter.post('/admin/library/hide', async (req, res) => {
  const { kind, id, title, reason } = Hide.parse(req.body);
  await hideContent({ kind, id, title, reason, by: req.user!.email });
  console.info(`[admin] ${req.user!.email} hid ${kind} ${id}: ${reason}`);
  res.json({ ok: true });
});

const Unhide = Hide.pick({ kind: true, id: true });

adminLibraryRouter.post('/admin/library/unhide', async (req, res) => {
  const { kind, id } = Unhide.parse(req.body);
  await showContent(kind, id);
  console.info(`[admin] ${req.user!.email} showed ${kind} ${id} again`);
  res.json({ ok: true });
});

adminLibraryRouter.get('/admin/library/hidden', async (_req, res) => {
  res.json({ items: await listHiddenContent() });
});

/** What's thin or missing, so the next round of work goes where it's needed. */
adminLibraryRouter.get('/admin/library/gaps', (_req, res) => {
  const countries = [...allCountries().values()]
    .filter((c) => c.country !== WORLD)
    .map((c) => {
      const shelved = new Set(c.books.flatMap((b) => b.placements.map((p) => p.subject)));
      return {
        id: c.country,
        name: c.name,
        books: c.books.length,
        free: c.books.filter((b) => b.free).length,
        noCover: c.books.filter((b) => !b.cover).length,
        emptySubjects: c.subjects.filter((s) => !shelved.has(s.id)).map((s) => s.name),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  const courses = allCourseBooks();
  res.json({
    videos: videoSetsReport().sort((a, b) => b.thinTopics.length - a.thinTopics.length),
    summaries: summaryLibrariesReport(),
    books: {
      countries,
      courses: {
        books: courses.length,
        free: courses.filter((b) => b.free).length,
        noCover: courses.filter((b) => !b.cover).length,
      },
    },
  });
});
