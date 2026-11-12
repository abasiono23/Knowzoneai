/**
 * Textbooks: university course lists (/textbooks/course/…), secondary school lists by country and
 * subject (/textbooks/ng/biology), and one page per book (/textbooks/<book>).
 *
 * Only free, legally readable books link to a copy. For the others these pages link to nothing.
 */
import { COURSE_LEVELS, EXAMS, EXAM_SUBJECTS, levelName } from '../lib/data.mjs';
import { APP, ORIGIN, PATHS, chips, clip, esc, list, page, pageTitle, plural, safeUrl, section, tiles } from '../lib/html.mjs';

const ROOT = PATHS.books;
const HUB = { name: 'Textbooks', path: ROOT };
const HOME = { name: 'Home', path: '/' };
/** How a country reads in a sentence ("Biology textbooks in the UK"). */
const SHORT = { uk: 'the UK' };
const LEVEL_ORDER = Object.keys(COURSE_LEVELS);
/** Which country subjects go with a summary library whose id differs from theirs. */
const SUBJECT_ALIASES = {
  'further-maths': ['further-mathematics'],
  accounting: ['accounting', 'financial-accounting'],
  biology: ['biology', 'life-sciences'],
  literature: ['literature', 'english-literature'],
  'computer-studies': ['computer-studies', 'computing', 'computer-science', 'ict', 'information-technology'],
  'agricultural-science': ['agricultural-science', 'agriculture'],
};

/** The same closing band on every textbook page: the app's own-textbook feature. */
const CTA = {
  title: 'Have your own copy as a PDF?',
  text: 'Turn it into flashcards and video summaries in Knowzone: add your textbook and study it chapter by chapter.',
  href: APP.textbook,
  label: 'Add your textbook in the app',
};

const edition = (e) => (!e ? '' : /edition|\bed\b/i.test(e) ? e : `${e} edition`);
const by = (b, max = 3) => (b.authors?.length ? (b.authors.length > max ? `${b.authors.slice(0, max).join(', ')} and others` : list(b.authors)) : '');
const imprint = (b) => [edition(b.edition), b.publisher, b.year].filter(Boolean).join(', ');
const hue = (id) => [...id].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 360, 7);

/** The cover, or a drawn one with the title on it. */
function cover(b, large) {
  const [w, h] = large ? [200, 300] : [56, 84];
  const src = safeUrl(b.cover);
  return src
    ? `<img class="kz-cover" src="${esc(src)}" alt="${large ? `Cover of ${esc(b.title)}` : ''}" width="${w}" height="${h}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`
    : `<span class="kz-cover kz-drawn" style="--hue: ${hue(b.id)}" aria-hidden="true"><span>${esc(clip(b.title, large ? 70 : 28))}</span></span>`;
}

/** One book in a list. `levels` is text ("First year · Later years"). */
function row(b, levels) {
  return `<li class="kz-book">
            <a href="${ROOT}/${b.slug}" tabindex="-1" aria-hidden="true">${cover(b, false)}</a>
            <div>
              <a class="kz-book-title" href="${ROOT}/${b.slug}">${esc(b.title)}</a>
              ${[by(b), imprint(b)].filter(Boolean).map((f) => `<span>${esc(f)}</span>`).join('')}
              <span class="kz-book-tags">${b.free ? '<em class="kz-free">Free to read</em>' : ''}${levels ? `<em>${esc(levels)}</em>` : ''}</span>
            </div>
          </li>`;
}
const rows = (items) => `<ul class="kz-books">${items.join('\n          ')}</ul>`;

const courseLevels = (levels) => LEVEL_ORDER.filter((l) => levels.includes(l)).map((l) => COURSE_LEVELS[l]).join(' · ');
/** "SS 1 to SS 3" for a run of classes, else each one. */
function schoolLevels(c, levels) {
  const all = c.levels.map((l) => l.id);
  const own = all.filter((l) => levels.includes(l));
  const name = (id) => levelName(id, c.levels.find((l) => l.id === id)?.name);
  const run = own.length > 2 && own.every((l, i) => i === 0 || all.indexOf(l) === all.indexOf(own[i - 1]) + 1);
  return run ? `${name(own[0])} to ${name(own.at(-1))}` : own.map(name).join(', ');
}

/** Lists, links and names the other page types need. */
export function bookIndex({ books, countries }) {
  const reserved = new Set(['course', ...countries.map((c) => c.country)]);
  for (const b of books) if (reserved.has(b.slug)) throw new Error(`The book "${b.slug}" clashes with a section of ${ROOT}.`);

  const byCourse = new Map();
  const bySchool = new Map();
  for (const b of books)
    for (const u of b.uses) {
      const [map, key] = u.kind === 'course' ? [byCourse, u.course] : [bySchool, `${u.country}/${u.subject}`];
      if (!map.has(key)) map.set(key, []);
      map.get(key).push({ book: b, levels: u.levels });
    }
  // A course's books: free first, then first-year books, then by title (the app's order).
  for (const own of byCourse.values())
    own.sort((a, b) => Number(b.book.free) - Number(a.book.free) || Number(b.levels.includes('intro')) - Number(a.levels.includes('intro')) || a.book.title.localeCompare(b.book.title));
  for (const own of bySchool.values()) own.sort((a, b) => Number(b.book.free) - Number(a.book.free) || a.book.title.localeCompare(b.book.title));

  const country = (id) => countries.find((c) => c.country === id);
  const countryName = (c) => SHORT[c.country] ?? c.name;
  const subject = (c, id) => c.subjects.find((s) => s.id === id);
  const schoolPath = (cid, sid) => (bySchool.has(`${cid}/${sid}`) ? `${ROOT}/${cid}/${sid}` : null);
  return {
    books,
    countries,
    country,
    countryName,
    subject,
    row,
    courseLevels,
    courseBooks: (id) => byCourse.get(id) ?? [],
    schoolBooks: (cid, sid) => bySchool.get(`${cid}/${sid}`) ?? [],
    courseIds: [...byCourse.keys()],
    coursePath: (id) => (byCourse.has(id) ? `${ROOT}/course/${id}` : null),
    schoolPath,
    /** Each country's book list for a summary library's subject: [{ href, subject, country }]. */
    schoolLists: (library) =>
      countries.flatMap((c) => {
        const id = (SUBJECT_ALIASES[library] ?? [library]).find((s) => schoolPath(c.country, s));
        return id ? [{ href: schoolPath(c.country, id), subject: subject(c, id).name, country: countryName(c) }] : [];
      }),
    /** The summary library for a country's subject, if any. */
    libraryFor: (sid, libraries) => libraries.find((l) => !l.course && (l.id === sid || SUBJECT_ALIASES[l.id]?.includes(sid))),
  };
}

const itemList = (name, books) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  numberOfItems: books.length,
  itemListElement: books.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.title, url: `${ORIGIN}${ROOT}/${b.slug}` })),
});

export function bookPages({ index, courses, libraries, groups }) {
  const out = [];
  const { books, countries } = index;
  const free = (own) => own.filter((r) => r.book.free).length;
  const freeTotal = books.filter((b) => b.free).length;

  // ── The hub ──
  const inFaculty = new Set(courses.faculties.flatMap((f) => f.courses));
  const faculties = [
    ...courses.faculties.map((f) => ({ name: f.name, courses: f.courses.filter((c) => index.coursePath(c)) })),
    { name: 'Other courses', courses: index.courseIds.filter((c) => !inFaculty.has(c)).sort() },
  ].filter((f) => f.courses.length);
  out.push({
    path: ROOT,
    html: page({
      path: ROOT,
      section: ROOT,
      title: pageTitle('Textbooks for school and university courses | Knowzone'),
      description: `${books.length.toLocaleString('en')} textbooks for ${index.courseIds.length} university courses and for secondary schools in ${list(countries.map((c) => index.countryName(c)))}. ${freeTotal} are free to read online.`,
      crumbs: [HOME, HUB],
      eyebrow: 'Textbooks',
      h1: 'Find the textbooks for your course or class',
      intro: `${books.length.toLocaleString('en')} textbooks, checked against official lists and university reading lists. ${freeTotal.toLocaleString('en')} are free to read online.`,
      wide: true,
      ogType: 'website',
      cta: CTA,
      body: [
        `        <section class="kz-section" id="university">
          <h2>University course textbooks</h2>
          <p class="kz-lead">For university, polytechnic and college courses, from first year to master’s. Free, openly licensed textbooks come first.</p>
          ${faculties.map((f) => `<h3>${esc(f.name)}</h3>${chips(f.courses.map((c) => ({ href: index.coursePath(c), name: `${courses.name(c)} (${index.courseBooks(c).length})` })))}`).join('\n          ')}
        </section>`,
        section(
          'Secondary school textbooks by country',
          tiles(
            countries.map((c) => ({
              href: `${ROOT}/${c.country}`,
              title: c.name,
              text: `${plural(c.subjects.filter((s) => index.schoolPath(c.country, s.id)).length, 'subject')} · ${plural(new Set(c.books.map((b) => b.id)).size, 'book')}`,
            })),
          ),
          'school',
        ),
      ].join('\n'),
    }),
  });

  // ── One university course's books ──
  for (const id of index.courseIds) {
    const name = courses.name(id);
    const path = index.coursePath(id);
    const own = index.courseBooks(id);
    const group = (items) => rows(items.map((r) => row(r.book, courseLevels(r.levels))));
    const freeOnes = own.filter((r) => r.book.free);
    const paid = own.filter((r) => !r.book.free);
    const faculty = courses.faculties.find((f) => f.courses.includes(id));
    const library = libraries.find((l) => l.course === id);
    out.push({
      path,
      html: page({
        path,
        section: ROOT,
        title: pageTitle(`${name} textbooks: free and standard | Knowzone`, `${name} textbooks | Knowzone`, `${name} textbooks`),
        description: `${plural(own.length, `${name} textbook`)} for university students${freeOnes.length ? `, ${freeOnes.length} free to read online` : ''}: ${own.slice(0, 4).map((r) => r.book.title).join('; ')}.`,
        crumbs: [HOME, HUB, { name, path }],
        eyebrow: 'University course',
        h1: `${name} textbooks`,
        intro: `${plural(own.length, 'textbook')} for ${name} students${freeOnes.length ? `, ${freeOnes.length} of them free to read online` : ''}.`,
        cta: CTA,
        jsonLd: [itemList(`${name} textbooks`, own.map((r) => r.book))],
        body: [
          freeOnes.length ? section(`Free to read online (${freeOnes.length})`, `<p class="kz-lead">Openly licensed, or published free by their owners. Each book’s page links to the official copy.</p>${group(freeOnes)}`) : '',
          paid.length ? section(`Standard textbooks (${paid.length})`, `<p class="kz-lead">Standard textbooks from university reading lists. Knowzone doesn’t host or link to copies of these.</p>${group(paid)}`) : '',
          section(
            `More for ${name}`,
            chips(
              [
                courses.has(id) && { href: `${PATHS.courses}/${id}`, name: `${name} course guide` },
                library && { href: `${PATHS.learn}/${library.id}`, name: `${name} study notes` },
                ...(faculty?.courses ?? []).filter((c) => c !== id && index.coursePath(c)).slice(0, 8).map((c) => ({ href: index.coursePath(c), name: `${courses.name(c)} textbooks` })),
                { href: `${ROOT}#university`, name: 'All courses' },
              ].filter(Boolean),
            ),
          ),
        ].join('\n'),
      }),
    });
  }

  // ── A country, and one of its subjects ──
  for (const c of countries) {
    const place = index.countryName(c);
    const subjects = c.subjects.filter((s) => index.schoolPath(c.country, s.id));
    const cPath = `${ROOT}/${c.country}`;
    const classes = `${levelName(c.levels[0].id, c.levels[0].name)} to ${levelName(c.levels.at(-1).id, c.levels.at(-1).name)}`;
    out.push({
      path: cPath,
      html: page({
        path: cPath,
        section: ROOT,
        title: pageTitle(`Secondary school textbooks in ${place}, by subject | Knowzone`, `Secondary school textbooks in ${place} | Knowzone`),
        description: `Textbooks for secondary school in ${place}, by subject: ${subjects.slice(0, 8).map((s) => s.name).join(', ')} and more. Free ones link to the official copy.`,
        crumbs: [HOME, HUB, { name: c.name, path: cPath }],
        eyebrow: 'Secondary school',
        h1: `Secondary school textbooks in ${place}`,
        intro: `Textbooks for ${plural(subjects.length, 'subject')}, from ${classes}.`,
        wide: true,
        cta: CTA,
        body: [
          section(
            'Choose a subject',
            tiles(
              subjects.map((s) => {
                const own = index.schoolBooks(c.country, s.id);
                return { href: `${cPath}/${s.id}`, title: s.name, text: `${plural(own.length, 'book')}${free(own) ? ` · ${free(own)} free` : ''}` };
              }),
            ),
          ),
          section('Other countries', chips(countries.filter((o) => o !== c).map((o) => ({ href: `${ROOT}/${o.country}`, name: `Textbooks in ${index.countryName(o)}` })))),
        ].join('\n'),
      }),
    });

    for (const s of subjects) {
      const path = `${cPath}/${s.id}`;
      const own = index.schoolBooks(c.country, s.id);
      const library = index.libraryFor(s.id, libraries);
      const exams = c.country === 'ng' && EXAM_SUBJECTS[s.id] ? groups.filter((g) => g.subject === s.id) : [];
      const elsewhere = countries.filter((o) => o !== c && index.schoolPath(o.country, s.id));
      out.push({
        path,
        html: page({
          path,
          section: ROOT,
          title: pageTitle(`${s.name} textbooks for secondary school in ${place} | Knowzone`, `${s.name} textbooks in ${place} | Knowzone`, `${s.name} textbooks in ${place}`, `${s.name} textbooks (${c.country.toUpperCase()})`),
          description: `${plural(own.length, `${s.name} textbook`)} for secondary school in ${place} (${schoolLevels(c, s.levels)})${free(own) ? `, ${free(own)} free to read online` : ''}: ${own.slice(0, 3).map((r) => r.book.title).join('; ')}.`,
          crumbs: [HOME, HUB, { name: c.name, path: cPath }, { name: s.name, path }],
          eyebrow: `${c.name} · secondary school`,
          h1: `${s.name} textbooks in ${place}`,
          intro: `${plural(own.length, 'textbook')} for ${s.name}, ${schoolLevels(c, s.levels)}${free(own) ? `. ${free(own)} free to read online` : ''}.`,
          cta: CTA,
          jsonLd: [itemList(`${s.name} textbooks in ${place}`, own.map((r) => r.book))],
          body: [
            `        ${rows(own.map((r) => row(r.book, schoolLevels(c, r.levels))))}`,
            section(
              `More for ${s.name}`,
              chips(
                [
                  library && { href: `${PATHS.learn}/${library.id}`, name: `${library.name} study notes` },
                  ...exams.map((g) => ({ href: `${PATHS.practice}/${g.exam}/${g.subject}`, name: `${EXAMS[g.exam].name} ${EXAM_SUBJECTS[g.subject]} practice questions` })),
                  ...elsewhere.map((o) => ({ href: `${ROOT}/${o.country}/${s.id}`, name: `${index.subject(o, s.id).name} textbooks in ${index.countryName(o)}` })),
                  { href: cPath, name: `All subjects in ${place}` },
                ].filter(Boolean),
              ),
            ),
          ].join('\n'),
        }),
      });
    }
  }

  // ── One book ──
  for (const b of books) {
    const path = `${ROOT}/${b.slug}`;
    const author = b.authors?.[0];
    const courseUses = b.uses.filter((u) => u.kind === 'course');
    const schoolUses = b.uses.filter((u) => u.kind === 'school' && index.schoolPath(u.country, u.subject));
    const schoolName = (u) => `${index.subject(index.country(u.country), u.subject).name} in ${index.countryName(index.country(u.country))}`;
    const usedFor = [...courseUses.map((u) => courses.name(u.course)), ...new Set(schoolUses.map(schoolName))];
    const read = b.free ? safeUrl(b.readUrl) : null;
    const download = b.free ? safeUrl(b.downloadUrl) : null;
    const size = b.downloadBytes ? `, ${b.downloadBytes > 1e6 ? `${Math.round(b.downloadBytes / 1e6)} MB` : `${Math.max(1, Math.round(b.downloadBytes / 1e3))} KB`}` : '';
    const facts = [
      [b.authors?.length > 1 ? 'Authors' : 'Author', by(b, 8)],
      ['Series', b.series],
      ['Edition', edition(b.edition)],
      ['Publisher', b.publisher],
      ['Year', b.year],
      ['ISBN', b.isbn],
      ['Licence', b.free ? b.license : null],
    ].filter(([, v]) => v);
    // Other books for the same course or subject.
    const first = courseUses[0] ?? schoolUses[0] ?? b.uses[0];
    const siblings = (first.kind === 'course' ? index.courseBooks(first.course) : index.schoolBooks(first.country, first.subject)).filter((r) => r.book !== b).slice(0, 6);
    const siblingsOf = first.kind === 'course' ? courses.name(first.course) : (index.subject(index.country(first.country), first.subject)?.name ?? first.subject);

    out.push({
      path,
      lastmod: true,
      html: page({
        path,
        section: ROOT,
        image: b.cover,
        ogType: 'book',
        title: pageTitle(
          author && b.edition && `${b.title} (${edition(b.edition)}) by ${author} | Knowzone`,
          author && `${b.title} by ${author} | Knowzone`,
          `${b.title} | Knowzone`,
          b.publisher && `${b.title} (${b.publisher}) | Knowzone`,
          author && `${b.title} by ${author}`,
          b.publisher && `${b.title} (${b.publisher})`,
          b.title,
        ),
        description: [
          `${b.title}${by(b, 2) ? ` by ${by(b, 2)}` : ''}${imprint(b) ? ` (${imprint(b)})` : ''}.`,
          b.free ? `Free to read online${b.license && b.license.length < 24 ? ` (${b.license})` : ''}.` : '',
          usedFor.length ? `Used for ${list(usedFor.slice(0, 3))}${usedFor.length > 3 ? ' and more' : ''}.` : '',
        ]
          .filter(Boolean)
          .join(' '),
        crumbs: [HOME, HUB, first.kind === 'course' ? { name: courses.name(first.course), path: index.coursePath(first.course) } : { name: index.country(first.country).name, path: `${ROOT}/${first.country}` }, { name: b.title, path }],
        eyebrow: b.free ? 'Free textbook' : 'Textbook',
        h1: b.title,
        intro: [by(b) && `By ${by(b)}`, imprint(b)].filter(Boolean).join(' · '),
        cta: CTA,
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'Book',
            name: b.title,
            url: `${ORIGIN}${path}`,
            ...(b.authors?.length ? { author: b.authors.map((a) => ({ '@type': 'Person', name: a })) } : {}),
            ...(b.publisher ? { publisher: { '@type': 'Organization', name: b.publisher } } : {}),
            ...(b.edition ? { bookEdition: b.edition } : {}),
            ...(b.year ? { datePublished: String(b.year) } : {}),
            ...(b.isbn ? { isbn: b.isbn } : {}),
            ...(safeUrl(b.cover) ? { image: b.cover } : {}),
            ...(b.free ? { isAccessibleForFree: true } : {}),
            ...(read ? { potentialAction: { '@type': 'ReadAction', target: read } } : {}),
            ...(usedFor.length ? { about: usedFor.slice(0, 8).map((name) => ({ '@type': 'Thing', name })) } : {}),
          },
        ],
        body: [
          `        <div class="kz-bookpage">
          <div>${cover(b, true)}</div>
          <div>
            <dl class="kz-facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
            ${
              read
                ? `<p class="kz-read"><a class="btn" href="${esc(read)}" rel="noopener">Read it free${b.provider ? ` at ${esc(clip(b.provider, 40))}` : ''} →</a>${
                    download && download !== read ? `<a class="btn outline" href="${esc(download)}" rel="noopener">Download${b.downloadType ? ` (${esc(b.downloadType.toUpperCase())}${size})` : ''}</a>` : ''
                  }</p>
            <p class="kz-small">This link goes to the official free copy, not to Knowzone.</p>`
                : b.free
                  ? '<p class="kz-small">This book is published free by its owner.</p>'
                  : '<p class="kz-small">Knowzone doesn’t host or link to copies of this book. Look for it at your school or university library, a bookshop or the publisher.</p>'
            }
          </div>
        </div>`,
          // The book list's notes are the team's research notes (where a book was found, "already in the app"), not text for students.
          courseUses.length || schoolUses.length
            ? section(
                'Who uses it',
                `<ul class="kz-uses">${[
                  ...courseUses.map(
                    (u) =>
                      `<li><a href="${index.coursePath(u.course)}">${esc(courses.name(u.course))} textbooks</a> <span>${esc(courseLevels(u.levels))}</span>${
                        courses.has(u.course) ? ` · <a href="${PATHS.courses}/${u.course}">course guide</a>` : ''
                      }</li>`,
                  ),
                  ...schoolUses.map((u) => `<li><a href="${ROOT}/${u.country}/${u.subject}">${esc(schoolName(u))}</a> <span>${esc(schoolLevels(index.country(u.country), u.levels))}</span></li>`),
                ].join('')}</ul>`,
              )
            : '',
          siblings.length ? section(`More textbooks for ${siblingsOf}`, rows(siblings.map((r) => row(r.book)))) : '',
        ].join('\n'),
      }),
    });
  }
  return out;
}
