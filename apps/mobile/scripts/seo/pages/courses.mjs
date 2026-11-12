/**
 * Course guides: one page per university course. What you study comes from Knowzone's own course
 * summary where there is one; otherwise from the textbooks set for the course, and the page says so.
 */
import { COURSE_LEVELS, STAGES } from '../lib/data.mjs';
import { APP, ORG, ORIGIN, PATHS, chips, esc, list, page, pageTitle, plural, section, tiles } from '../lib/html.mjs';

const ROOT = PATHS.courses;
const HUB = { name: 'Course guides', path: ROOT };
const HOME = { name: 'Home', path: '/' };
const LEVELS = Object.keys(COURSE_LEVELS);

export function coursePages({ index, courses, libraries }) {
  const out = [];
  const ids = courses.all;
  const library = (id) => libraries.find((l) => l.course === id);
  const inFaculty = new Set(courses.faculties.flatMap((f) => f.courses));
  const faculties = [
    ...courses.faculties.map((f) => ({ name: f.name, courses: f.courses.filter((c) => ids.includes(c)) })),
    { name: 'Other courses', courses: ids.filter((c) => !inFaculty.has(c)) },
  ].filter((f) => f.courses.length);
  const tag = (id) => [library(id) && 'Course summary', index.courseBooks(id).length && plural(index.courseBooks(id).length, 'book')].filter(Boolean).join(' · ');
  const booksCta = {
    title: 'Get your course’s books ready in the app',
    text: 'Tell Knowzone your course and level and it lines up your books. Add your own textbook to turn it into flashcards and video summaries.',
    href: APP.books,
    label: 'Open your books in the app',
  };

  // ── The hub ──
  out.push({
    path: ROOT,
    html: page({
      path: ROOT,
      section: null,
      title: pageTitle('University course guides: what you study and read | Knowzone'),
      description: `Guides to ${ids.length} university courses: what you study at each stage and the textbooks to read, with the free ones first.`,
      crumbs: [HOME, HUB],
      eyebrow: 'University, polytechnic and college',
      h1: 'University course guides',
      intro: `What you study in ${ids.length} courses and the textbooks for each, from first year to master’s.`,
      wide: true,
      ogType: 'website',
      cta: booksCta,
      body: faculties.map((f) => section(f.name, tiles(f.courses.map((c) => ({ href: `${ROOT}/${c}`, title: courses.name(c), text: tag(c) }))))).join('\n'),
    }),
  });

  // ── One course ──
  for (const id of ids) {
    const name = courses.name(id);
    const path = `${ROOT}/${id}`;
    const l = library(id);
    const own = index.courseBooks(id);
    const freeCount = own.filter((r) => r.book.free).length;
    const faculty = courses.faculties.find((f) => f.courses.includes(id));
    const others = (faculty?.courses ?? []).filter((c) => c !== id && ids.includes(c));
    const levels = LEVELS.filter((lv) => own.some((r) => r.levels.includes(lv)));
    const description = l
      ? `${l.overview.short} ${plural(l.topics.length, 'topic')}${own.length ? ` and ${plural(own.length, 'textbook')}` : ''}.`
      : `A guide to studying ${name} at university: what the course covers at each stage, from its ${plural(own.length, 'textbook')}${freeCount ? ` (${freeCount} free to read online)` : ''}.`;

    const study = l
      ? `        <section class="kz-section">
          <h2>What you study in ${esc(name)}</h2>
          <p class="kz-lead">${esc(l.overview.short)} <a href="${PATHS.learn}/${l.id}">Read the whole course summary</a>.</p>
          ${['intro', 'core', 'masters']
            .filter((s) => l.topics.some((t) => t.stage === s))
            .map((s) => `<h3>${esc(STAGES[s])}</h3>${tiles(l.topics.filter((t) => t.stage === s).map((t) => ({ href: `${PATHS.learn}/${l.id}/${t.id}`, title: t.title, text: t.short })))}`)
            .join('\n          ')}
        </section>`
      : `        <section class="kz-section">
          <h2>What you study in ${esc(name)}</h2>
          <p class="kz-lead">Knowzone hasn’t written its own summary of ${esc(name)} yet. The textbooks set for the course show what it covers at each stage.</p>
          ${levels
            .map((lv) => {
              const at = own.filter((r) => r.levels.includes(lv));
              return `<h3>${esc(COURSE_LEVELS[lv])}</h3><ul class="kz-points">${at
                .slice(0, 8)
                .map((r) => `<li><a href="${PATHS.books}/${r.book.slug}">${esc(r.book.title)}</a></li>`)
                .join('')}</ul>${at.length > 8 ? `<p class="kz-small">And ${at.length - 8} more in the <a href="${index.coursePath(id)}">${esc(name)} textbook list</a>.</p>` : ''}`;
            })
            .join('\n          ')}
        </section>`;

    out.push({
      path,
      html: page({
        path,
        section: null,
        title: pageTitle(`${name} course guide: what you study | Knowzone`, `${name} course guide | Knowzone`, `${name} course guide`),
        description,
        crumbs: [HOME, HUB, { name, path }],
        eyebrow: faculty ? faculty.name : 'University course',
        h1: `${name}: what you study and what to read`,
        intro: l ? l.overview.short : `A guide to ${name} at university, polytechnic or college${own.length ? `, with ${plural(own.length, 'textbook')}` : ''}.`,
        wide: !!l,
        cta: l
          ? {
              title: `Study ${name} in the app`,
              text: 'Read the course summaries, watch video lessons, and ask Kora, the AI tutor, to explain anything step by step.',
              href: APP.summary(l.id),
              label: `Open ${name} in the app`,
            }
          : { ...booksCta, title: `Studying ${name}?` },
        jsonLd: [
          l
            ? {
                '@context': 'https://schema.org',
                '@type': 'Course',
                name,
                description: l.overview.short,
                url: `${ORIGIN}${path}`,
                inLanguage: 'en',
                isAccessibleForFree: true,
                educationalLevel: 'University',
                provider: ORG,
                syllabusSections: l.topics.map((t) => ({ '@type': 'Syllabus', name: t.title, description: t.short, url: `${ORIGIN}${PATHS.learn}/${l.id}/${t.id}` })),
              }
            : {
                '@context': 'https://schema.org',
                '@type': 'LearningResource',
                learningResourceType: 'Reading list',
                name: `${name} course guide`,
                description,
                url: `${ORIGIN}${path}`,
                inLanguage: 'en',
                isAccessibleForFree: true,
                educationalLevel: 'University',
                about: { '@type': 'Thing', name },
                provider: ORG,
              },
        ],
        body: [
          study,
          own.length
            ? section(
                `${name} textbooks`,
                `<p class="kz-lead">${plural(own.length, 'textbook')}${freeCount ? `, ${freeCount} free to read online` : ''}${levels.length ? `, for ${list(levels.map((lv) => COURSE_LEVELS[lv].toLowerCase()))}` : ''}.</p>
          <ul class="kz-books">${own.slice(0, 6).map((r) => index.row(r.book, index.courseLevels(r.levels))).join('\n          ')}</ul>
          <p><a class="btn outline" href="${index.coursePath(id)}">All ${own.length} ${esc(name)} textbooks →</a></p>`,
              )
            : '',
          others.length ? section(`Other ${faculty.name} courses`, chips(others.map((c) => ({ href: `${ROOT}/${c}`, name: courses.name(c) })))) : '',
        ].join('\n'),
      }),
    });
  }
  return out;
}
