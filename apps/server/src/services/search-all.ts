import { EXAM_SUBJECTS, EXAMS } from '../data/exams.js';
import { allCountries, allCourseBooks, visibleBooks, WORLD } from './books.js';
import { cardText, allReels } from './reels.js';
import type { LanguageId } from './personalization.js';
import { allSkills } from './skills.js';
import { allVideoTopics, liveVideo } from './subject-videos.js';
import { allSummaryCards } from './summaries.js';
import { watchVideos } from './watch.js';

/**
 * The dashboard's search across everything else the student can open: videos, summaries, books,
 * reels, courses and Future skills. The app adds its own lessons, subjects and topics. Results are in
 * the reader's language, and English words still find them, because students sit exams in English.
 */
const LIMIT = 20;

export const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\p{M}⁦-⁩]/gu, '');

/** Words like "video" say what the student wants to find, not what it's about. */
const FILLER = new Set(
  'a an and about for in of on the to how what video videos summary summaries book books textbook textbooks lesson lessons'.split(
    ' ',
  ),
);

export function searchWords(query: string) {
  const all = fold(query).split(/\s+/).filter(Boolean);
  const real = all.filter((w) => !FILLER.has(w));
  return real.length ? real : all;
}

/** Keeps what matches every word, with matches in the title first. */
function find<T>(list: T[], words: string[], title: (x: T) => string, hay: (x: T) => string) {
  return list
    .filter((x) => {
      const text = fold(hay(x));
      return words.every((w) => text.includes(w));
    })
    .map((x) => {
      const t = fold(title(x));
      return { x, score: words.filter((w) => t.includes(w)).length };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, LIMIT)
    .map(({ x }) => x);
}

/** The first of each, so a book in many countries' lists is one result, and doesn't crowd out others. */
function once<T>(list: T[], key: (x: T) => string) {
  const seen = new Set<string>();
  return list.filter((x) => {
    const k = key(x);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export async function searchEverything(lang: LanguageId, query: string, country?: string) {
  const words = searchWords(query);
  const empty = { videos: [], summaries: [], books: [], reels: [], courses: [], exams: [], skills: [] };
  if (!words.length || words.join('').length < 2) return empty;

  const summaries = find(
    allSummaryCards(lang),
    words,
    (s) => s.title,
    (s) => `${s.title} ${s.short} ${s.libraryName} ${s.keywords.join(' ')} ${s.english}`,
  ).map(({ keywords: _k, english: _e, languages: _l, ...s }) => s);

  const course = await watchVideos();
  const skillVideos = allSkills().flatMap((s) => {
    const name = s.name[lang] ?? s.name.en ?? '';
    return s.videos.flatMap((v) => {
      const live = liveVideo(v);
      return live
        ? [
            {
              kind: 'skill' as const,
              youtubeId: live.youtubeId,
              title: live.title,
              channel: live.channel,
              seconds: live.seconds,
              where: name,
              skill: s.id,
            },
          ]
        : [];
    });
  });
  const shelfVideos = allVideoTopics(lang).flatMap((t) =>
    t.videos.map((v) => ({
      kind: 'shelf' as const,
      youtubeId: v.youtubeId,
      title: v.title,
      channel: v.channel,
      seconds: v.seconds,
      where: t.title,
      subject: t.libraryName,
      library: t.library,
      topic: t.id,
    })),
  );
  const courseVideos = course.map((v) => ({
    kind: 'course' as const,
    youtubeId: v.youtubeId,
    title: v.title,
    channel: v.channel,
    seconds: v.seconds,
    where: v.course,
    subject: v.subject,
    chapter: v.chapter,
    courseId: v.courseId,
    lessonId: v.lessonId,
  }));
  const videos = find(
    once([...shelfVideos, ...skillVideos, ...courseVideos], (v) => v.youtubeId),
    words,
    (v) => v.title,
    (v) => `${v.title} ${v.channel} ${v.where} ${'subject' in v ? v.subject : ''} ${'chapter' in v ? v.chapter : ''}`,
  );

  // A book that's free only for one country's curriculum stays with that country's students.
  const countries = [...allCountries().values()].filter((c) => c.country !== WORLD);
  const schoolBooks = countries.flatMap((c) =>
    visibleBooks(c.books)
      .filter((b) => !b.countryOnly || c.country === country)
      .map((b) => {
        const place = b.placements[0]!;
        return {
          id: b.id,
          title: b.title,
          authors: b.authors,
          cover: b.cover ?? null,
          free: b.free,
          readUrl: b.readUrl ?? null,
          mine: c.country === country,
          shelf: `/books/subject/${place.subject}?catalogue=${c.country}&level=${place.levels[0]}`,
          hay: `${b.title} ${b.authors.join(' ')} ${b.publisher ?? ''} ${b.placements.map((p) => p.subject).join(' ')}`,
        };
      }),
  );
  const courseBooks = visibleBooks(allCourseBooks()).map((b) => ({
    id: b.id,
    title: b.title,
    authors: b.authors,
    cover: b.cover ?? null,
    free: b.free,
    readUrl: b.readUrl ?? null,
    mine: false,
    shelf: `/books/subject/${b.placements[0]!.course}?stage=masters`,
    hay: `${b.title} ${b.authors.join(' ')} ${b.publisher ?? ''} ${b.placements.map((p) => p.course).join(' ')}`,
  }));
  const books = find(
    once(
      [...schoolBooks, ...courseBooks].sort(
        (a, b) => Number(b.mine) - Number(a.mine) || Number(b.free) - Number(a.free),
      ),
      (b) => fold(b.title),
    ),
    words,
    (b) => b.title,
    (b) => b.hay,
  ).map(({ hay: _h, mine: _m, ...b }) => b);

  const reels = find(
    allReels(),
    words,
    (r) => cardText(r.cards[0]!.text, lang),
    (r) => `${r.subject} ${r.cards.map((c) => `${cardText(c.text, lang)} ${c.text.en ?? ''}`).join(' ')}`,
  )
    .slice(0, 6)
    .map((r) => ({ id: r.id, subject: r.subject, text: cardText(r.cards[0]!.text, lang) }));

  const courseList = [
    ...new Map(course.map((v) => [v.courseId, { id: v.courseId, title: v.course, subject: v.subject }])).values(),
  ];
  const courses = find(
    courseList,
    words,
    (c) => c.title,
    (c) => `${c.title} ${c.subject}`,
  );

  const skills = find(
    allSkills().map((s) => ({
      id: s.id,
      name: s.name[lang] ?? s.name.en ?? '',
      tagline: s.tagline[lang] ?? s.tagline.en ?? '',
      english: `${s.name.en ?? ''} ${s.tagline.en ?? ''}`,
    })),
    words,
    (s) => s.name,
    (s) => `${s.name} ${s.tagline} ${s.english}`,
  ).map(({ english: _e, ...s }) => s);

  const exams = find(
    EXAMS.flatMap((exam) =>
      EXAM_SUBJECTS.map((subject) => ({
        exam: exam as string,
        subject: subject as string,
        title: `${exam.toUpperCase()} ${subject.replace(/-/g, ' ')}`,
      })),
    ),
    words,
    (e) => e.title,
    (e) => `${e.title} past questions`,
  ).map(({ exam, subject }) => ({ exam, subject }));

  return { videos, summaries, books, reels, courses, exams, skills };
}
