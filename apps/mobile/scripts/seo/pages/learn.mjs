/**
 * Study notes: Knowzone's written summaries, a whole-course overview and one page per topic, for
 * school subjects and university courses.
 */
import { EXAMS, STAGES } from '../lib/data.mjs';
import { APP, ORG, ORIGIN, PATHS, chips, esc, list, page, pageTitle, paragraphs, plural, section, tiles } from '../lib/html.mjs';

const ROOT = PATHS.learn;
const HUB = { name: 'Study notes', path: ROOT };
const HOME = { name: 'Home', path: '/' };
const STAGE_ORDER = ['lower', 'upper', 'intro', 'core', 'masters'];
const LEVEL = { lower: 'Junior secondary school', upper: 'Senior secondary school', intro: 'University, first year', core: 'University', masters: 'Master’s degree' };

const sections = (text) => text.sections.map((s) => `        <section class="kz-section kz-text">\n          <h2>${esc(s.heading)}</h2>\n          ${paragraphs(s.text)}\n        </section>`).join('\n');
const keyPoints = (text) => (text.keyPoints?.length ? section('Key points', `<ul class="kz-points">${text.keyPoints.map((k) => `<li>${esc(k)}</li>`).join('')}</ul>`) : '');

export function learnPages({ libraries, groups, practiceFor, books, courses }) {
  const out = [];
  const school = libraries.filter((l) => !l.course);
  const uni = libraries.filter((l) => l.course);
  const subjectName = (l) => (l.course ? courses.name(l.course) : l.name);
  const count = libraries.reduce((n, l) => n + l.topics.length, 0);
  const tile = (l) => ({ href: `${ROOT}/${l.id}`, title: subjectName(l), text: plural(l.topics.length, 'topic') });

  // ── The hub ──
  out.push({
    path: ROOT,
    html: page({
      path: ROOT,
      section: ROOT,
      title: pageTitle('Free study notes for school and university | Knowzone'),
      description: `Clear study notes on ${count.toLocaleString('en')} topics: ${plural(school.length, 'secondary school subject')} and ${plural(uni.length, 'university course')}, each topic explained with its key points.`,
      crumbs: [HOME, HUB],
      eyebrow: 'Free study notes',
      h1: 'Study notes for school subjects and university courses',
      intro: `${count.toLocaleString('en')} topics explained in plain language, each with its key points.`,
      wide: true,
      ogType: 'website',
      cta: {
        title: 'Read, watch and quiz yourself in the app',
        text: 'The Knowzone app has these summaries with video lessons and flashcards, the school subjects in 10 languages, and Kora, the AI tutor, to explain anything again.',
        href: APP.books,
        label: 'Open your books in the app',
      },
      body: [
        section('School subjects', `<p class="kz-lead">For junior and senior secondary school, including WAEC, NECO and JAMB subjects.</p>${tiles(school.map(tile))}`, 'school'),
        section('University courses', `<p class="kz-lead">For university, polytechnic and college students, from first year to master’s.</p>${tiles(uni.map(tile))}`, 'university'),
      ].join('\n'),
    }),
  });

  for (const l of libraries) {
    const name = subjectName(l);
    const base = `${ROOT}/${l.id}`;
    const crumbs = [HOME, HUB, { name, path: base }];
    const stages = STAGE_ORDER.filter((s) => l.topics.some((t) => t.stage === s));
    const exams = groups.filter((g) => g.subject === l.id).map((g) => ({ href: `${PATHS.practice}/${g.exam}/${g.subject}`, name: `${EXAMS[g.exam].name} ${l.name} practice questions` }));
    const reading = l.course
      ? [courses.has(l.course) && { href: `${PATHS.courses}/${l.course}`, name: `${name} course guide` }, books.coursePath(l.course) && { href: books.coursePath(l.course), name: `${name} textbooks` }].filter(Boolean)
      : books.schoolLists(l.id).map((s) => ({ href: s.href, name: `${s.subject} textbooks (${s.country})` }));
    const inYourLanguage = l.course ? '' : ' in your language';

    // ── One subject or course ──
    out.push({
      path: base,
      html: page({
        path: base,
        section: ROOT,
        title: pageTitle(`${name} study notes: the whole course | Knowzone`, `${name} study notes | Knowzone`, `${name} study notes`),
        description: `${l.overview.short} Study notes on ${plural(l.topics.length, 'topic')}.`,
        crumbs,
        eyebrow: l.course ? 'University course' : 'School subject',
        h1: `${name} study notes: the whole course`,
        intro: l.overview.short,
        cta: {
          title: `Study ${name} in the app`,
          text: `Read this summary${inYourLanguage}, watch the video lessons, and ask Kora, the AI tutor, to explain any part again.`,
          href: APP.summary(l.id),
          label: 'Open this summary in the app',
        },
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'LearningResource',
            learningResourceType: 'Course summary',
            name: `${name} study notes`,
            description: l.overview.short,
            url: `${ORIGIN}${base}`,
            inLanguage: 'en',
            isAccessibleForFree: true,
            educationalLevel: l.course ? 'University' : 'Secondary school',
            keywords: l.overview.keywords?.join(', '),
            provider: ORG,
            hasPart: l.topics.map((t) => ({ '@type': 'LearningResource', name: t.title, url: `${ORIGIN}${base}/${t.id}` })),
          },
        ],
        body: [
          `        ${chips([{ href: '#topics', name: `Jump to the ${l.topics.length} topics` }])}`,
          sections(l.overview),
          keyPoints(l.overview),
          `        <section class="kz-section" id="topics">
          <h2>${esc(name)} topics</h2>
          ${stages.map((s) => `<h3>${esc(STAGES[s])}</h3>${tiles(l.topics.filter((t) => t.stage === s).map((t) => ({ href: `${base}/${t.id}`, title: t.title, text: t.short })))}`).join('\n          ')}
        </section>`,
          exams.length || reading.length ? section(`More for ${name}`, chips([...exams, ...reading])) : '',
        ].join('\n'),
      }),
    });

    // ── One topic ──
    for (const [i, t] of l.topics.entries()) {
      const path = `${base}/${t.id}`;
      const practice = practiceFor(l, t.id);
      const prev = l.topics[i - 1];
      const next = l.topics[i + 1];
      out.push({
        path,
        html: page({
          path,
          section: ROOT,
          title: pageTitle(`${t.title}: ${name} study notes | Knowzone`, `${t.title}: ${name} notes | Knowzone`, `${t.title}: ${name} notes`, `${t.title} (${name})`),
          description: `${t.short} ${name} study notes${t.sections.length > 1 ? `: ${list(t.sections.map((s) => s.heading))}` : ''}.`,
          crumbs: [...crumbs, { name: t.title, path }],
          eyebrow: `${name} · ${STAGES[t.stage]}`,
          h1: t.title,
          intro: t.short,
          cta: {
            title: 'Study this topic in the app',
            text: `Read “${t.title}”${inYourLanguage}, watch its video lessons, and ask Kora, the AI tutor, anything you’re unsure of.`,
            href: APP.summary(l.id, t.id),
            label: 'Open this topic in the app',
          },
          jsonLd: [
            {
              '@context': 'https://schema.org',
              '@type': 'LearningResource',
              learningResourceType: 'Study notes',
              name: t.title,
              description: t.short,
              url: `${ORIGIN}${path}`,
              inLanguage: 'en',
              isAccessibleForFree: true,
              educationalLevel: LEVEL[t.stage],
              about: { '@type': 'Thing', name },
              teaches: t.keyPoints,
              keywords: t.keywords?.join(', '),
              isPartOf: { '@type': 'LearningResource', name: `${name} study notes`, url: `${ORIGIN}${base}` },
              provider: ORG,
            },
          ],
          body: [
            sections(t),
            keyPoints(t),
            practice.length ? section('Practice questions on this topic', chips(practice)) : '',
            section(
              `More ${name}`,
              chips(
                [
                  prev && { href: `${base}/${prev.id}`, name: `← ${prev.title}` },
                  next && { href: `${base}/${next.id}`, name: `${next.title} →` },
                  { href: `${base}#topics`, name: `All ${name} topics` },
                  ...(practice.length ? [] : exams),
                  ...reading.slice(0, 3),
                ].filter(Boolean),
              ),
            ),
          ].join('\n'),
        }),
      });
    }
  }
  return out;
}
