/**
 * Practice questions for JAMB, WAEC, NECO, the SAT, the ACT, AP exams, GCSE, A-level, KCSE and Matric,
 * by exam, subject, topic and paper.
 *
 * Honest wording matters here. These are practice papers Knowzone wrote, not papers from previous
 * years, so nothing on these pages calls them anything else. The JAMB, WAEC and NECO ones are in each
 * exam's objective format. The SAT ones follow the digital SAT's sections and timing but are multiple
 * choice only; the ACT ones follow its sections; the AP ones practise the multiple-choice section
 * only; the GCSE, A-level, KCSE and Matric ones are topic quizzes ("GCSE-style"), because those
 * exams are mostly written answers. Each of those exams' pages says so (EXAMS[exam].note).
 */
import { EXAMS, EXAM_SUBJECTS, notesSubject, practiceLabel } from '../lib/data.mjs';
import { APP, ORG, ORIGIN, PATHS, chips, clip, esc, list, page, pageTitle, paragraphs, plural, section, tiles } from '../lib/html.mjs';


const LETTERS = 'ABCDEFGH';
const ROOT = PATHS.practice;
const HUB = { name: 'Practice questions', path: ROOT };
const HOME = { name: 'Home', path: '/' };

const subjectPath = (g) => `${ROOT}/${g.exam}/${g.subject}`;
const label = practiceLabel;
/** "minutes in the exam" where the paper is in the exam's format; plain minutes where it isn't. */
const timing = (exam) => EXAMS[exam].timing ?? 'minutes in the exam';
/** What this exam's practice is and isn't, for the exams that need saying. */
const note = (exam) => (EXAMS[exam].note ? `<p class="kz-lead">${esc(EXAMS[exam].note)}</p>` : '');
const examNames = (exams) => list(exams.map((e) => EXAMS[e].label ?? EXAMS[e].name));

/** One question with its options; the answer and explanation open without any script. `from` is HTML. */
function question(q, { id, from } = {}) {
  return `<li class="kz-q"${id ? ` id="${id}"` : ''}>
            ${from ? `<p class="kz-q-from">${from}</p>` : ''}
            ${q.passage ? `<blockquote class="kz-passage">${paragraphs(q.passage)}</blockquote>` : ''}
            <div class="kz-q-text">${paragraphs(q.q)}</div>
            <ol class="kz-options" type="A">${q.options.map((o) => `<li>${esc(o)}</li>`).join('')}</ol>
            <details class="kz-answer">
              <summary>Show the answer</summary>
              <p><b>Answer: ${LETTERS[q.answer]}.</b> ${esc(q.options[q.answer])}</p>
              ${q.explanation ? paragraphs(q.explanation) : ''}
            </details>
          </li>`;
}

/** schema.org Quiz with its questions (the markup Google describes for practice problems). */
function quizLd({ name, url, g, about, questions }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name,
    url,
    inLanguage: 'en',
    isAccessibleForFree: true,
    about: { '@type': 'Thing', name: about },
    educationalAlignment: [
      { '@type': 'AlignmentObject', alignmentType: 'educationalSubject', targetName: EXAM_SUBJECTS[g.subject] },
      { '@type': 'AlignmentObject', alignmentType: 'educationalLevel', targetName: EXAMS[g.exam].full },
    ],
    provider: ORG,
    hasPart: questions.map((q) => ({
      '@type': 'Question',
      eduQuestionType: 'Multiple choice',
      learningResourceType: 'Practice problem',
      name: clip(q.q, 110),
      text: q.passage ? `${q.passage}\n\n${q.q}` : q.q,
      about: { '@type': 'Thing', name: q.topic },
      acceptedAnswer: {
        '@type': 'Answer',
        position: q.answer,
        text: q.options[q.answer],
        ...(q.explanation ? { answerExplanation: { '@type': 'Comment', text: q.explanation } } : {}),
      },
      suggestedAnswer: q.options.map((text, position) => ({ '@type': 'Answer', position, text })).filter((a) => a.position !== q.answer),
    })),
  };
}

export function practicePages({ groups, libraries, notesFor, books }) {
  const out = [];
  const byExam = (exam) => groups.filter((g) => g.exam === exam);
  const shown = (g) => g.papers.reduce((n, p) => n + p.shown.length, 0);
  const total = groups.reduce((n, g) => n + shown(g), 0);
  const subjectTile = (g) => ({ href: subjectPath(g), title: EXAM_SUBJECTS[g.subject], text: `${plural(shown(g), 'question')} · ${plural(g.topics.length, 'topic')}` });
  /** Nigeria's book list for a subject, when there is one. */
  const COUNTRY = { ng: 'Nigeria', uk: 'United Kingdom', ke: 'Kenya', za: 'South Africa' };
  /** The book list for a subject in the exam's country, when there is one. */
  const bookList = (g) => {
    const country = EXAMS[g.exam].books;
    const subject = notesSubject(g);
    const href = country && subject && books.schoolPath(country, subject);
    return href ? { href, name: `${EXAM_SUBJECTS[g.subject]} textbooks (${COUNTRY[country]})` } : null;
  };
  const built = Object.keys(EXAMS).filter((exam) => byExam(exam).length);
  const appCta = {
    title: 'Sit a full timed paper',
    text: 'In the Knowzone app you can sit every paper against the clock, see your score by topic and ask Kora, the AI tutor, about any question.',
    href: APP.exams,
    label: 'Open exam practice in the app',
  };

  // ── The hub ──
  out.push({
    path: ROOT,
    html: page({
      path: ROOT,
      section: ROOT,
      title: pageTitle(`${examNames(built)} practice questions | Knowzone`, 'Exam practice questions with answers | Knowzone'),
      // With many exams the list of names is too long for a title or a description: the page's sections name them.
      description: `${total.toLocaleString('en')} free ${built.length > 5 ? 'exam' : examNames(built)} practice questions, each with its answer and a clear explanation, by exam, subject and topic${built.length > 5 ? `: ${built.map((e) => EXAMS[e].name).join(', ')}` : ''}.`,
      crumbs: [HOME, HUB],
      eyebrow: 'Free practice',
      h1: built.length > 5 ? 'Exam practice questions with answers' : `${examNames(built)} practice questions`,
      intro: `${total.toLocaleString('en')} practice questions with answers and explanations, by exam, subject and topic.`,
      wide: true,
      ogType: 'website',
      cta: appCta,
      body: [
        ...Object.keys(EXAMS)
          .filter((exam) => byExam(exam).length)
          .map((exam) =>
            section(
              `${EXAMS[exam].label ?? EXAMS[exam].full} practice questions`,
              `<p class="kz-lead"><a href="${ROOT}/${exam}">All ${EXAMS[exam].label ?? EXAMS[exam].name} subjects</a></p>${tiles(byExam(exam).map(subjectTile))}`,
            ),
          ),
      ].join('\n'),
    }),
  });

  // ── One exam ──
  for (const exam of Object.keys(EXAMS)) {
    const own = byExam(exam);
    if (!own.length) continue;
    const E = EXAMS[exam];
    const L = E.label ?? E.name;
    const path = `${ROOT}/${exam}`;
    const count = own.reduce((n, g) => n + shown(g), 0);
    const formats = [...new Set(own.map((g) => `${g.papers[0].questions.length} questions in ${g.papers[0].minutes} minutes`))];
    out.push({
      path,
      html: page({
        path,
        section: ROOT,
        title: pageTitle(`${L} practice questions and answers, by subject | Knowzone`, `${L} practice questions and answers | Knowzone`),
        description: `Free ${E.label ?? E.full} practice questions in ${list(own.map((g) => EXAM_SUBJECTS[g.subject]))}, with answers and explanations.`,
        crumbs: [HOME, HUB, { name: E.name, path }],
        eyebrow: E.full,
        h1: `${L} practice questions with answers`,
        intro: `${count.toLocaleString('en')} practice questions for ${E.about}, in ${plural(own.length, 'subject')}.`,
        wide: true,
        cta: { ...appCta, title: `Practise ${E.real ? E.name : (E.practise ?? `for the ${E.name}`)} in the app` },
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `${L} practice questions by subject`,
            itemListElement: own.map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: label(g), url: `${ORIGIN}${subjectPath(g)}` })),
          },
        ],
        body: [
          section(
            'Choose a subject',
            `<p class="kz-lead">Each ${E.real ? `${E.name} objective paper` : `${L} practice paper`} here has ${list(formats)}. Every question has its answer and an explanation.</p>${note(exam)}${tiles(own.map(subjectTile))}`,
          ),
          section('Other exams', chips(built.filter((e) => e !== exam).map((e) => ({ href: `${ROOT}/${e}`, name: `${EXAMS[e].label ?? EXAMS[e].name} practice questions` })))),
        ].join('\n'),
      }),
    });
  }

  for (const g of groups) {
    const E = EXAMS[g.exam];
    const S = EXAM_SUBJECTS[g.subject];
    const base = subjectPath(g);
    const crumbs = [HOME, HUB, { name: E.name, path: `${ROOT}/${g.exam}` }, { name: S, path: base }];
    const library = libraries.find((l) => l.id === notesSubject(g));
    const notesLink = library && { href: `${PATHS.learn}/${library.id}`, name: `${library.name} study notes` };
    // The same subject in the exams that share its syllabus (JAMB, WAEC and NECO); GCSE Biology isn't WAEC Biology.
    const sameSubject = groups.filter((o) => o.subject === g.subject && o.exam !== g.exam && E.family && EXAMS[o.exam].family === E.family);
    const paperPath = (p) => `${base}/paper-${p.number}`;
    const topicPath = (q) => `${base}/${g.topics.find((t) => t.name === q.topic)?.id ?? ''}`;
    const subjectCta = {
      title: `Practise ${label(g)} in the app`,
      text: 'Sit these papers against the clock, see which topics cost you marks, and ask Kora, the AI tutor, about any question.',
      href: APP.examSubject(g.exam, g.subject),
      label: `Open ${label(g)} in the app`,
    };

    // ── One subject ──
    out.push({
      path: base,
      html: page({
        path: base,
        section: ROOT,
        title: pageTitle(`${label(g)} practice questions with answers | Knowzone`, `${label(g)} practice questions | Knowzone`),
        description: `${plural(shown(g), `${label(g)} practice question`)} with answers and explanations, by topic: ${g.topics.map((t) => t.name).join(', ')}.`,
        crumbs,
        eyebrow: E.full,
        h1: `${label(g)} practice questions with answers and explanations`,
        intro: `${plural(shown(g), 'question')} on ${plural(g.topics.length, 'topic')}, each with its answer explained.`,
        wide: true,
        cta: subjectCta,
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `${label(g)} practice questions by topic`,
            itemListElement: g.topics.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, url: `${ORIGIN}${base}/${t.id}` })),
          },
        ],
        body: [
          section(
            'Practice papers',
            note(g.exam) +
              tiles(
              g.papers.map((p) => ({
                href: paperPath(p),
                title: `${label(g)} practice paper ${p.number}`,
                text: `${p.questions.length} questions · ${p.minutes} ${timing(g.exam)}`,
                tag: p.free ? `All ${p.questions.length} questions` : `First ${p.shown.length} of ${p.questions.length} questions`,
              })),
            ),
          ),
          section('Questions by topic', tiles(g.topics.map((t) => ({ href: `${base}/${t.id}`, title: t.name, text: plural(t.questions.length, 'question') })))),
          section(`More for ${S}`, chips([notesLink, bookList(g), ...sameSubject.map((o) => ({ href: subjectPath(o), name: `${label(o)} practice questions` }))].filter(Boolean))),
        ].join('\n'),
      }),
    });

    // ── One topic ──
    for (const [i, t] of g.topics.entries()) {
      const path = `${base}/${t.id}`;
      const notes = library ? notesFor(library, t.name) : [];
      const elsewhere = sameSubject.filter((o) => o.topics.some((x) => x.id === t.id));
      const prev = g.topics[i - 1];
      const next = g.topics[i + 1];
      const name = `${t.name}: ${label(g)} practice questions`;
      out.push({
        path,
        html: page({
          path,
          section: ROOT,
          title: pageTitle(`${name} | Knowzone`, name, `${t.name}: ${E.name} ${S} questions`, `${t.name}: ${label(g)}`, `${clip(t.name, 58 - label(g).length)}: ${label(g)}`),
          description: `${plural(t.questions.length, `${label(g)} practice question`)} on ${t.name}, with answers and explanations. For example: ${t.questions[0].q}`,
          crumbs: [...crumbs, { name: t.name, path }],
          eyebrow: label(g),
          h1: name,
          intro: `${plural(t.questions.length, 'practice question')} on ${t.name}, with the answer and an explanation for each.`,
          cta: {
            title: `More ${t.name} questions in the app`,
            text: `Practise ${label(g)} by topic, sit a timed paper, and ask Kora, the AI tutor, to explain ${t.name} step by step.`,
            href: APP.examSubject(g.exam, g.subject),
            label: `Open ${label(g)} in the app`,
          },
          jsonLd: [quizLd({ name, url: `${ORIGIN}${path}`, g, about: t.name, questions: t.questions })],
          body: [
            `        <ol class="kz-questions">
          ${t.questions.map((q) => question(q, { from: `From <a href="${paperPath(q.paper)}#q${q.n}">practice paper ${q.paper.number}, question ${q.n}</a>` })).join('\n          ')}
        </ol>`,
            notes.length
              ? section(`Study notes on ${t.name}`, chips(notes.map((n) => ({ href: `${PATHS.learn}/${library.id}/${n.id}`, name: n.title }))))
              : notesLink
                ? section('Study notes', chips([notesLink]))
                : '',
            section(
              `More ${label(g)} practice`,
              chips(
                [
                  prev && { href: `${base}/${prev.id}`, name: `← ${prev.name}` },
                  next && { href: `${base}/${next.id}`, name: `${next.name} →` },
                  { href: base, name: `All ${label(g)} topics` },
                  ...g.papers.map((p) => ({ href: paperPath(p), name: `Practice paper ${p.number}` })),
                  ...elsewhere.map((o) => ({ href: `${subjectPath(o)}/${t.id}`, name: `${t.name} for ${EXAMS[o.exam].name}` })),
                  bookList(g),
                ].filter(Boolean),
              ),
            ),
          ].join('\n'),
        }),
      });
    }

    // ── One paper ──
    for (const p of g.papers) {
      const path = paperPath(p);
      const name = `${label(g)} practice paper ${p.number}`;
      const hidden = p.questions.length - p.shown.length;
      out.push({
        path,
        html: page({
          path,
          section: ROOT,
          title: pageTitle(`${name} with answers | Knowzone`, `${name} | Knowzone`),
          description: p.free
            ? `A full ${label(g)} practice paper: ${p.questions.length} ${E.real ? 'questions in the real exam format' : 'multiple-choice questions'} (${p.minutes} minutes), each with its answer and explanation.`
            : `The first ${p.shown.length} questions of ${name}, with answers and explanations. The full ${p.questions.length}-question paper is in the Knowzone app.`,
          crumbs: [...crumbs, { name: `Practice paper ${p.number}`, path }],
          eyebrow: label(g),
          h1: p.free ? `${name}: questions and answers` : `${name}: the first ${p.shown.length} questions`,
          intro: `${p.questions.length} questions · ${p.minutes} ${timing(g.exam)}. ${p.free ? 'Try each question, then open its answer.' : `The first ${p.shown.length} are here; the rest are in the app.`}`,
          cta: {
            title: hidden > 0 ? `Sit all ${p.questions.length} questions in the app` : 'Sit this paper against the clock',
            text: `In the Knowzone app you can sit ${name} ${E.quiz ? 'against the clock' : (E.timed ?? 'timed like the real exam')}, see your score by topic and ask Kora, the AI tutor, about any question.`,
            href: APP.paper(p.id),
            label: 'Open this paper in the app',
          },
          jsonLd: [quizLd({ name, url: `${ORIGIN}${path}`, g, about: label(g), questions: p.shown })],
          body: [
            `        <ol class="kz-questions">
          ${p.shown.map((q) => question(q, { id: `q${q.n}`, from: `Question ${q.n} · <a href="${esc(topicPath(q))}">${esc(q.topic)}</a>` })).join('\n          ')}
        </ol>`,
            note(g.exam),
            hidden > 0
              ? `        <aside class="kz-callout">
          <h2>The other ${hidden} questions are in the app</h2>
          <p>This page shows the first ${p.shown.length} questions of ${esc(name)}. Sit the whole paper in the Knowzone app, with every answer explained.</p>
          <a class="btn" href="${APP.paper(p.id)}">Open this paper in the app →</a>
        </aside>`
              : '',
            section(
              `More ${label(g)} practice`,
              chips([...g.papers.filter((o) => o !== p).map((o) => ({ href: paperPath(o), name: `Practice paper ${o.number}` })), { href: base, name: `${label(g)} questions by topic` }, notesLink, bookList(g)].filter(Boolean)),
            ),
          ].join('\n'),
        }),
      });
    }
  }
  return out;
}
