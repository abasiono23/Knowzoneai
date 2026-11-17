/**
 * Writes the summaries of university, polytechnic and college courses (data/summaries/uni-<course>.json)
 * with open models on Vultr Serverless Inference (src/services/vultr.ts). OpenAI is not used.
 *
 * For every course in the app's list (apps/mobile/src/lib/books.ts) that has no summary yet:
 *
 *  1. plan      the writer lists the course's topics (first year, later years, master's)
 *  2. write     the writer writes the whole-course overview and each topic, in English
 *  3. review    a different model checks every summary's facts, sums and names, lists what is wrong
 *               and sends back a corrected text; what it couldn't confirm is kept for a person to read
 *  4. translate (only with --langs) each summary into other app languages, same shape as the English
 *  5. build     the file is checked against the schema the server loads it with, then saved
 *
 * Every step is saved in the work folder as it's made, so a re-run only does what's missing, and a
 * finished course (its file exists) is skipped. Each call's tokens and cost go to <work>/usage.jsonl;
 * the job stops when the total reaches the cap, or when the courses still to write would take it past.
 *
 * Run from apps/server:
 *
 *   npx tsx scripts/course-summaries.ts                         # every course without a summary
 *   npx tsx scripts/course-summaries.ts --only pharmacy,mba     # these courses
 *   npx tsx scripts/course-summaries.ts --only pharmacy --langs fr,sw --redo   # add languages to a finished course
 *   npx tsx scripts/course-summaries.ts --cap 40 --parallel 16 --writer <model> --reviewer <model> --translator <model>
 *   npx tsx scripts/course-summaries.ts --work <folder> --out <folder> --topics 4   # a trial: few topics, another folder
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { z } from 'zod';

import { OVERVIEW, SummaryLibrarySchema, SummaryTextSchema, courseLibrary, type SummaryLibrary } from '../src/services/summaries.js';
import { vultrConfigured, vultrJson, type VultrUsage } from '../src/services/vultr.js';

const args = process.argv.slice(2);
const flag = (name: string) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined);
const has = (name: string) => args.includes(`--${name}`);

const SERVER = resolve(import.meta.dirname, '..');
const MOBILE = resolve(SERVER, '../mobile');
const WORK = resolve(flag('work') ?? join(SERVER, '.course-summaries'));
const OUT = resolve(flag('out') ?? join(SERVER, 'data/summaries'));
// Chosen by trial (November 2026): on the same topics and the same reviewer, deepseek's drafts had about a
// tenth of the serious errors of mimo-v2.6-pro's at the same cost; glm-5.3-flash found as many planted and
// real errors as dearer reviewers at under half the price. mimo is fast and cheap for translation.
const WRITER = flag('writer') ?? 'deepseek-v4.1-flash-1017';
const REVIEWER = flag('reviewer') ?? 'glm-5.3-flash';
const TRANSLATOR = flag('translator') ?? 'mimo-v2.6-pro';
const CAP = Number(flag('cap') ?? 40);
const PARALLEL = Number(flag('parallel') ?? 16);
const COURSES_AT_ONCE = Number(flag('courses') ?? 4);
const ONLY = flag('only')?.split(',').filter(Boolean);
const LANGS = (flag('langs') ?? '').split(',').filter(Boolean);
const TRIAL_TOPICS = flag('topics') ? Number(flag('topics')) : null;
const REDO = has('redo');

if (REVIEWER === WRITER) throw new Error('The reviewer must be a different model from the writer');
if (!vultrConfigured()) throw new Error('not-configured: set VULTR_INFERENCE_API_KEY in apps/server/.env');

const LANGUAGE_NAMES: Record<string, string> = {
  pcm: 'Nigerian Pidgin (Naijá), as written in BBC News Pidgin',
  yo: 'Yoruba, in standard orthography with every tone mark and under-dot',
  ig: 'Igbo, in standard (Ọnwụ) orthography with its dotted vowels',
  ha: 'Hausa, in standard boko orthography with its hooked letters (ɓ, ɗ, ƙ, ʼy)',
  fr: 'French',
  ar: 'Modern Standard Arabic',
  sw: 'Swahili',
  pt: 'Portuguese',
  es: 'Spanish',
};

// ─── The app's course list ────────────────────────────────────────────────────

type Faculty = { id: string; courses: string[]; mastersOnly?: string[] };
function appCourses() {
  const lib = readFileSync(join(MOBILE, 'src/lib/books.ts'), 'utf8');
  const from = lib.indexOf('= [', lib.indexOf('export const FACULTIES'));
  const to = lib.indexOf('\n];', from);
  // Our own source file: an array literal of plain strings.
  const faculties = new Function(`return ${lib.slice(from + 2, to + 2)}`)() as Faculty[];
  const locale = readFileSync(join(MOBILE, 'src/i18n/locales/en/books.ts'), 'utf8');
  const block = locale.slice(locale.indexOf('\n  courses: {'));
  const names: Record<string, string> = {};
  for (const m of block.slice(0, block.indexOf('\n  },')).matchAll(/^\s+'?([a-z-]+)'?: '((?:[^'\\]|\\.)+)',?$/gm))
    names[m[1]!] = m[2]!.replace(/\\'/g, '’');
  return faculties.flatMap((f) =>
    [...f.courses.map((id) => ({ id, mastersOnly: false })), ...(f.mastersOnly ?? []).map((id) => ({ id, mastersOnly: true }))].map((c) => {
      if (!names[c.id]) throw new Error(`${c.id}: the app has no name for this course`);
      return { ...c, name: names[c.id]!, faculty: f.id };
    }),
  );
}
type Course = ReturnType<typeof appCourses>[number];

// ─── Money ────────────────────────────────────────────────────────────────────

mkdirSync(WORK, { recursive: true });
const LEDGER = join(WORK, 'usage.jsonl');
type Spend = { at: string; course: string; step: string; model: string; cost: number } & VultrUsage;
const ledger = (): Spend[] =>
  existsSync(LEDGER)
    ? readFileSync(LEDGER, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((l) => JSON.parse(l) as Spend)
    : [];
let spent = ledger().reduce((n, s) => n + s.cost, 0);
const startedAt = spent;
class OverBudget extends Error {}
let stopped: string | null = null;

/** This run's spend on writing and on reviewing, and the summaries each finished: what one more costs, retries included. */
const run = { write: { cost: 0, done: 0 }, review: { cost: 0, done: 0 } };
function record(course: string, step: string, model: string, usage: VultrUsage, cost: number) {
  spent += cost;
  if (step === 'review') run.review.cost += cost;
  else if (!step.startsWith('translate')) run.write.cost += cost;
  appendFileSync(LEDGER, `${JSON.stringify({ at: new Date().toISOString(), course, step, model, ...usage, cost } satisfies Spend)}\n`);
}

// ─── Calls: a few at a time, never past the cap ───────────────────────────────

/** Vultr limits each model's requests at once ("Too many concurrent requests for this model"), so each has its own queue. */
const queues = new Map<string, { running: number; waiting: (() => void)[] }>();
async function slot<T>(model: string, work: () => Promise<T>): Promise<T> {
  if (!queues.has(model)) queues.set(model, { running: 0, waiting: [] });
  const q = queues.get(model)!;
  if (q.running >= PARALLEL) await new Promise<void>((r) => q.waiting.push(r));
  q.running++;
  try {
    return await work();
  } finally {
    q.running--;
    q.waiting.shift()?.();
  }
}
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Vultr busy or unreachable, as opposed to an answer that was wrong. */
const transport = (e: unknown) => e instanceof Error && /didn’t answer after/.test(e.message);

type Ask<T> = { course: string; step: string; model: string; system: string; input: string; schema: z.ZodType<T>; check?: (d: T) => string | null; maxTokens: number; temperature?: number };
/** One JSON answer, tried up to three times (each try lets the model correct itself once). */
async function ask<T>(a: Ask<T>): Promise<T> {
  let last: unknown;
  let busy = 0;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (stopped) throw new OverBudget(stopped);
    if (spent >= CAP) {
      stopped = `the $${CAP} cap is reached ($${spent.toFixed(2)} spent)`;
      throw new OverBudget(stopped);
    }
    try {
      const r = await slot(a.model, () =>
        vultrJson({ model: a.model, system: a.system, input: a.input, schema: a.schema, check: a.check, maxTokens: a.maxTokens, temperature: a.temperature, timeoutMs: 300_000 }),
      );
      record(a.course, a.step, a.model, r.usage, r.costUsd);
      return r.data;
    } catch (e) {
      const paid = e as { usage?: VultrUsage; costUsd?: number };
      if (paid.usage) record(a.course, a.step, a.model, paid.usage, paid.costUsd ?? 0);
      last = e;
      // A busy model costs nothing to wait for: up to ten waits that don't count as tries.
      if (transport(e) && busy++ < 10) {
        await pause(20_000 + Math.random() * 20_000);
        attempt--;
      }
    }
  }
  throw last;
}

// ─── What a summary must look like ────────────────────────────────────────────

type Text = z.infer<typeof SummaryTextSchema>;
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const bodyWords = (t: Text) => t.sections.reduce((n, s) => n + words(s.text), 0);
const everyString = (t: Text) => [t.title, t.short, ...t.keywords, ...t.keyPoints, ...t.sections.flatMap((s) => [s.heading, s.text])];

/** The house style of the summaries already written: plain text, typographic apostrophes, no dashes as commas. */
function tidy(t: Text): Text {
  const fix = (s: string) =>
    s
      .replace(/\r/g, '')
      .replace(/(\p{L})'(\p{L})/gu, '$1’$2')
      .replace(/(\p{L})s' /gu, '$1s’ ')
      .replace(/\s+—\s+/g, ', ')
      .replace(/—/g, ', ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  return {
    title: fix(t.title),
    short: fix(t.short),
    keywords: t.keywords.map((k) => fix(k)).filter(Boolean),
    sections: t.sections.map((s) => ({ heading: fix(s.heading), text: fix(s.text) })),
    keyPoints: t.keyPoints.map(fix),
  };
}

function formatProblem(t: Text): string | null {
  for (const s of everyString(t)) {
    if (/\*\*|```|^#{1,4} |\\\(|\\frac|\\text|\$\$/m.test(s)) return 'Plain text only: no Markdown, no LaTeX, no code fences. Write formulas with ordinary characters such as × ÷ ² √.';
    if (/^\s*[-•*] /m.test(s)) return 'No bullet characters: put each list item on its own line, with no dash or dot in front.';
  }
  return null;
}

function topicProblem(t: Text): string | null {
  const n = bodyWords(t);
  if (t.sections.length < 3 || t.sections.length > 4) return `Write 3 or 4 sections (there are ${t.sections.length}).`;
  // The summaries written before these run to about 310 words. The writer runs long, so it is asked for
  // fewer than are accepted: asking again costs more than a slightly longer summary is worth.
  if (n < 230) return `The sections have ${n} words in all; write 260 to 320.`;
  if (n > 460) return `The sections have ${n} words in all, which is too long. Cut to 260 to 320 words.`;
  if (t.keyPoints.length < 5 || t.keyPoints.length > 6) return `Give 5 or 6 key points (there are ${t.keyPoints.length}).`;
  if (t.keywords.length < 6 || t.keywords.length > 10) return `Give 8 to 10 keywords (there are ${t.keywords.length}).`;
  if (t.short.length > 170) return 'Make "short" one sentence of at most 120 characters.';
  return formatProblem(t);
}

function overviewProblem(t: Text): string | null {
  const n = bodyWords(t);
  if (t.sections.length < 5 || t.sections.length > 6) return `Write 5 or 6 sections (there are ${t.sections.length}).`;
  if (n < 480) return `The sections have ${n} words in all; write 570 to 700.`;
  if (n > 900) return `The sections have ${n} words in all, which is too long. Cut to 570 to 700 words.`;
  if (t.keyPoints.length < 5 || t.keyPoints.length > 6) return `Give 5 or 6 key points (there are ${t.keyPoints.length}).`;
  if (t.keywords.length < 6 || t.keywords.length > 10) return `Give 8 to 10 keywords (there are ${t.keywords.length}).`;
  if (t.short.length > 170) return 'Make "short" one sentence of at most 120 characters.';
  return formatProblem(t);
}

const Plan = z.object({
  topics: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(60),
        stage: z.enum(['intro', 'core', 'masters']),
        title: z.string().min(3).max(110),
        covers: z.string().min(20).max(400),
      }),
    )
    .min(15),
});
type Plan = z.infer<typeof Plan>;

const Review = z.object({
  issues: z.array(
    z.object({
      where: z.string(),
      problem: z.string(),
      fix: z.string(),
      severity: z.enum(['high', 'medium', 'low']),
    }),
  ),
  /** Claims the reviewer could not confirm either way and left in. */
  unsure: z.array(z.string()),
  corrected: SummaryTextSchema.nullable(),
});
type Review = z.infer<typeof Review> & { failed?: boolean };

// ─── Examples from the summaries already written ──────────────────────────────

const EXAMPLES: Record<string, [string, string]> = {
  health: ['medicine', 'nursing'],
  engineering: ['civil-engineering', 'computer-science'],
  environmental: ['civil-engineering', 'business-administration'],
  sciences: ['civil-engineering', 'computer-science'],
  computing: ['computer-science', 'civil-engineering'],
  law: ['law', 'political-science'],
  management: ['accounting', 'business-administration'],
  social: ['economics', 'political-science'],
  arts: ['mass-communication', 'political-science'],
  education: ['mass-communication', 'nursing'],
  agriculture: ['economics', 'nursing'],
};
const existing = new Map<string, SummaryLibrary>();
function example(course: string) {
  if (!existing.has(course))
    existing.set(course, SummaryLibrarySchema.parse(JSON.parse(readFileSync(join(SERVER, 'data/summaries', `uni-${course}.json`), 'utf8'))));
  return existing.get(course)!;
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

const HOUSE = `You write study notes for Knowzone, a learning app for university, polytechnic and college students. Most readers are in Nigeria and elsewhere in Africa; many are elsewhere in the world. Readers range from first-year students to master's students and people studying on their own.

Accuracy rules. These matter more than anything else:
- State only what standard textbooks and official sources agree on. If you are not sure of a fact, leave it out or say plainly that it varies.
- Never invent a statistic, date, name, case, statute, section number, standard number, quotation or reference. Name a law, case, standard, body or person only if you are sure it exists and you are sure of the detail you give.
- Figures that change (prices, rates, populations, fees, pass marks, years of study, regulations) differ by country and year: say so and tell the reader to check the current official source, instead of giving a number you cannot be sure of.
- Whenever a rule, law, institution or qualification belongs to one country, name the country. Do not present one country's practice as universal.
- Where schools of thought disagree, set out each view fairly and leave the choice to the reader. Stay neutral on politics, religion and ethnicity.
- In worked examples, do the arithmetic carefully and check it. Wrong numbers are worse than no example.

Voice:
- Plain English for readers who may use English as a second language: short sentences, common words, each technical term explained the first time it appears. British spelling.
- Teach. Explain why, not only what. Use a concrete example where it helps: a short worked calculation for quantitative topics, or a small case with an African setting and names for others. The content must still be useful to a student anywhere.
- Honest and calm. No hype, no filler, no "in today's world", no addressing the reader as "dear student".

Format:
- Plain text only. No Markdown, no LaTeX, no bullet characters, no em dashes. Write formulas with ordinary characters (× ÷ − ² ³ √ π Σ).
- Inside a section's text, write two or three short paragraphs separated by a blank line, not one block. Put list items or the lines of a calculation on their own lines.
- Answer with one JSON object and nothing else.`;

function notesFor(c: Course) {
  const notes: string[] = [];
  if (c.faculty === 'health')
    notes.push('This is a health course. Teach concepts to students: this is not medical advice. Do not give drug doses. Clinical guidelines change and differ between countries, so point to the current national or World Health Organization guidance rather than quoting a protocol.');
  if (c.faculty === 'law')
    notes.push('This is a law course. The notes are for learning and are not legal advice. Law changes and belongs to a country: name the country for every rule, cite a statute or case only when you are sure of it, and tell readers to check the current text.');
  if (c.id === 'islamic-law' || c.id === 'religious-studies')
    notes.push('Describe beliefs, sources and schools of thought respectfully and neutrally, as an academic subject. Where traditions or schools differ, say so without ruling between them.');
  if (['yoruba', 'igbo', 'hausa', 'arabic', 'french'].includes(c.id))
    notes.push(`This is the degree in the ${c.name} language, its linguistics, literature and culture. The notes are in English. Give a word or phrase in ${c.name} only when you are certain of its spelling, including every tone mark, diacritic or special letter; otherwise explain in English.`);
  if (c.id === 'english') notes.push('This is the degree in English language and literature in English, including African literature.');
  if (c.id.startsWith('education-'))
    notes.push(`This is a teacher-education degree (for example B.Sc.(Ed) or B.Ed in Nigeria): about half is how to teach (educational psychology, curriculum, methods of teaching the subject, assessment, teaching practice) and about half is the subject itself, ${c.name.replace('Education ', '')}. Cover both.`);
  if (c.mastersOnly)
    notes.push(`${c.name} is a master's programme. Every topic's stage is "masters". Assume a reader with a first degree, sometimes in another field: start each topic from its foundations, then reach master's depth.`);
  if (c.faculty === 'environmental' || c.faculty === 'engineering')
    notes.push('Design codes, standards and professional registration differ between countries (for example COREN in Nigeria): name the country, and do not quote clause numbers or limits from a code unless you are sure of them.');
  return notes.length ? `\nAbout this course:\n${notes.map((n) => `- ${n}`).join('\n')}\n` : '';
}

const planLine = (t: { id: string; stage: string; title: string }) => `${t.id} | ${t.stage} | ${t.title}`;

function planPrompt(c: Course) {
  const [a, b] = EXAMPLES[c.faculty]!.map(example) as [SummaryLibrary, SummaryLibrary];
  const show = (l: SummaryLibrary) => `${l.name.en} (${l.topics.length} topics):\n${l.topics.map((t) => planLine({ id: t.id, stage: t.stage, title: t.text.en!.title })).join('\n')}`;
  return `Plan the study notes for the course "${c.name}" as taught at universities, polytechnics and colleges (course id: ${c.id}).
${notesFor(c)}
List the topics a student meets, in teaching order, the way a good department's curriculum and the standard textbooks set them out. Each topic becomes one summary of about 300 words, so make each one a real, teachable unit: not too wide ("Chemistry") and not a fragment.

${
  c.mastersOnly
    ? 'Give 22 to 28 topics, all with stage "masters".'
    : `Give 24 to 30 topics:
- stage "intro": 8 to 10 topics for the first year (foundations, including the mathematics, science or methods the course rests on)
- stage "core": 13 to 20 topics for the later undergraduate years (the main body of the course, its applied areas, professional practice or ethics, and research methods or the final project if there is nothing more specific to say)
- stage "masters": 3 or 4 topics at master's level (advanced theory, research methods for a dissertation, a specialist frontier)`
}

For each topic give:
- "id": a short lowercase id with hyphens (letters and digits only), unique in the course, never "overview"
- "stage"
- "title": a clear title, as a textbook chapter would have
- "covers": one or two sentences listing exactly what the summary must teach, so that no two topics repeat each other

Two courses already planned, to show the level of detail and the spread (id | stage | title):

${show(a)}

${show(b)}

Answer as {"topics":[{"id":"…","stage":"intro","title":"…","covers":"…"}]}`;
}

const SHAPE = `{"title":"…","short":"…","keywords":["…"],"sections":[{"heading":"…","text":"…"}],"keyPoints":["…"]}`;

function overviewPrompt(c: Course, plan: Plan) {
  const [a] = EXAMPLES[c.faculty]!.map(example) as [SummaryLibrary, SummaryLibrary];
  return `Write the whole-course summary for "${c.name}": the page a student reads first to see what the course is, how it is organised and how to study it.
${notesFor(c)}
The course's topics, already planned (id | stage | title):
${plan.topics.map(planLine).join('\n')}

Write:
- "title": "${c.name}: the whole course"
- "short": one sentence, at most 120 characters, saying what this page covers
- "keywords": 8 to 10 terms a student might search for (the course, its degrees and main areas)
- "sections": 5 or 6 sections, 570 to 700 words in all (never more than 720), in this order:
  ${c.faculty === 'health' || c.faculty === 'law' ? '"Read this first" may come first, for the caution these notes need; then ' : ''}what the subject is; how the ${c.mastersOnly ? 'programme' : 'degree'} is usually organised (length and awards differ by country and institution: say so, give the common patterns in Nigeria and one or two other countries only where you are sure, and tell readers to check their own handbook); the main areas in teaching order (matching the topics above); how to study it; common mistakes students make
- "keyPoints": 5 or 6 single sentences worth remembering

An example of the level and voice, from the ${a.name.en} course:
${JSON.stringify(a.overview.en)}

Answer as ${SHAPE}`;
}

function topicPrompt(c: Course, plan: Plan, topic: Plan['topics'][number]) {
  const [a, b] = EXAMPLES[c.faculty]!.map(example) as [SummaryLibrary, SummaryLibrary];
  // A later-years topic from each: one with worked numbers where the family has them.
  const sample = (l: SummaryLibrary) => l.topics[Math.min(9, l.topics.length - 1)]!.text.en!;
  const level = { intro: 'first-year', core: 'later undergraduate years', masters: 'master’s level' }[topic.stage];
  return `Write one summary for the course "${c.name}".
${notesFor(c)}
Topic: ${topic.title}
Stage: ${level}
It must teach: ${topic.covers}

The other topics in this course have their own summaries, so do not teach their content here (id | stage | title):
${plan.topics.filter((t) => t.id !== topic.id).map(planLine).join('\n')}

Write:
- "title": "${topic.title}" (you may improve the wording)
- "short": one sentence, at most 120 characters, listing what the summary covers
- "keywords": 8 to 10 terms a student might search for (lowercase unless a name or abbreviation)
- "sections": 3 or 4 sections with short headings (1 to 4 words), 260 to 320 words in all (a hard limit: shorter than the examples below if need be). Explain the ideas properly, define each term, and include a worked example with checked numbers if the topic is quantitative, or a small concrete case if it is not
- "keyPoints": 5 or 6 single sentences a student should remember; for quantitative topics include the key formulas

Two finished summaries from other courses, to show the level, length and voice:
${JSON.stringify(sample(a))}

${JSON.stringify(sample(b))}

Answer as ${SHAPE}`;
}

const REVIEW_SYSTEM = `You are an independent subject expert and fact-checker for Knowzone, a learning app for university students, mostly in Nigeria and elsewhere in Africa. Another writer produced a study summary. Your job is to find what is wrong with it and correct it. Be sceptical: assume there are errors until you have checked.

Check, one claim at a time:
- every fact, definition, date, name, classification and cause-and-effect statement
- every formula, unit and symbol; redo every calculation in a worked example yourself
- every law, case, standard, institution, qualification and regulator: does it exist, is the detail right, is it attributed to the right country, is it current?
- every number: is it right, and is it the kind of figure that changes by country or year and so should not be stated as fixed?
- anything presented as universal that is true only in some countries; anything one-sided where experts disagree
- anything unsafe (health topics must not give drug doses or advice for a reader's own case; law topics are not legal advice)
- definitions that are missing for terms a student would not know, and anything misleading by omission

Then answer with one JSON object:
{"issues":[{"where":"the words in question","problem":"what is wrong","fix":"what it should say","severity":"high|medium|low"}],"unsure":["a claim you could not confirm either way and left in"],"corrected":null or the whole corrected summary}

- "high": a wrong fact, formula, calculation or attribution, or something unsafe. "medium": misleading, outdated, overclaimed or country-specific without saying so. "low": wording.
- If there is any issue, "corrected" must be the complete summary with every issue fixed, in exactly the same JSON shape, with the same number of sections and the same paragraph breaks. Change only what needs changing; keep the plain voice and short sentences. If you cannot verify a detail, remove it or say that it varies, rather than leave a guess.
- Keep "corrected" within about 10% of the original length. This is a 300-word introduction for students, not a reference work: a standard textbook simplification that is right at this level is not an error, so do not load the text with qualifications, exceptions or specialist asides. Report a point only if a lecturer marking the summary would call it wrong, misleading or unsafe.
- If you find nothing to change, answer with "issues": [] and "corrected": null. Do not invent problems.
- The summary is plain text: no Markdown, no LaTeX, no bullet characters, no em dashes; paragraphs separated by a blank line.`;

function reviewPrompt(c: Course, what: string, text: Text) {
  return `Course: ${c.name} (university level). ${what}
${notesFor(c)}
The summary to check:
${JSON.stringify(text)}`;
}

function translatePrompt(lang: string, text: Text) {
  return `Translate this study summary from English into ${LANGUAGE_NAMES[lang]}.

- Translate everything a reader sees: title, short, keywords, every heading, every section's text and every key point. Keep exactly the same JSON shape, the same number of sections, paragraphs, lines and key points, in the same order.
- Write the way a good textbook in that language is written: natural, correct and clear, not word for word. Keep the meaning exact; add nothing and leave nothing out.
- Keep numbers, formulas, units, symbols, abbreviations and proper names (people, laws, cases, institutions, software) as they are. For a technical term with no settled word in the language, use the term educated speakers use, and give the English in brackets the first time.
- Plain text only, as in the English.

${JSON.stringify(text)}

Answer as ${SHAPE}`;
}

// ─── One course ───────────────────────────────────────────────────────────────

const read = <T>(file: string) => (existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as T) : null);
function save(file: string, data: unknown) {
  mkdirSync(resolve(file, '..'), { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 1));
}

/** A translation must have the same shape as the English, so no paragraph quietly goes missing. */
function sameShape(en: Text, t: Text): string | null {
  if (t.sections.length !== en.sections.length) return `There must be ${en.sections.length} sections (there are ${t.sections.length}).`;
  if (t.keyPoints.length !== en.keyPoints.length) return `There must be ${en.keyPoints.length} key points (there are ${t.keyPoints.length}).`;
  if (!t.keywords.length) return 'The keywords are missing.';
  for (const [i, s] of en.sections.entries()) {
    const ratio = t.sections[i]!.text.length / s.text.length;
    if (ratio < 0.45) return `Section ${i + 1} is much shorter than the English: translate all of it.`;
  }
  return formatProblem(t);
}

type Done = { course: string; topics: number; high: number; medium: number; low: number; changed: number; unreviewed: string[]; unsure: { topic: string; claim: string }[]; languages: string[] };

async function writeCourse(c: Course): Promise<Done> {
  const dir = join(WORK, c.id);
  const system = HOUSE;

  // 1. Plan.
  let plan = read<Plan>(join(dir, 'plan.json'));
  if (!plan) {
    plan = await ask({
      course: c.id,
      step: 'plan',
      model: WRITER,
      system,
      input: planPrompt(c),
      schema: Plan,
      maxTokens: 12_000,
      temperature: 0.4,
      check: (p) => {
        const ids = p.topics.map((t) => t.id);
        if (new Set(ids).size !== ids.length) return 'Two topics share an id.';
        if (ids.includes(OVERVIEW)) return `No topic may have the id "${OVERVIEW}".`;
        if (p.topics.length > 34) return `Too many topics (${p.topics.length}); give at most 32.`;
        const count = (s: string) => p.topics.filter((t) => t.stage === s).length;
        if (c.mastersOnly) return p.topics.every((t) => t.stage === 'masters') ? (p.topics.length < 20 ? 'Give 22 to 28 topics.' : null) : 'Every topic’s stage must be "masters".';
        if (p.topics.length < 22) return `Too few topics (${p.topics.length}); give 24 to 32.`;
        if (count('intro') < 6 || count('intro') > 11) return `Give 8 to 10 "intro" topics (there are ${count('intro')}).`;
        if (count('masters') < 3 || count('masters') > 6) return `Give 3 or 4 "masters" topics (there are ${count('masters')}).`;
        return null;
      },
    });
    // Teaching order within the three stages, as the app lists them.
    plan = { topics: ['intro', 'core', 'masters'].flatMap((s) => plan!.topics.filter((t) => t.stage === s)) };
    save(join(dir, 'plan.json'), plan);
  }
  const topics = TRIAL_TOPICS ? plan.topics.slice(0, TRIAL_TOPICS) : plan.topics;
  const items = [{ id: OVERVIEW, title: `${c.name}: the whole course` }, ...topics];

  const english = new Map<string, Text>();
  const reviews = new Map<string, Review>();
  await Promise.all(
    items.map(async (item) => {
      const isOverview = item.id === OVERVIEW;
      const problem = isOverview ? overviewProblem : topicProblem;
      // 2. Write.
      const draftFile = join(dir, 'draft', `${item.id}.json`);
      let draft = read<Text>(draftFile);
      if (!draft) {
        draft = tidy(
          await ask({
            course: c.id,
            step: isOverview ? 'overview' : 'topic',
            model: WRITER,
            system,
            input: isOverview ? overviewPrompt(c, plan!) : topicPrompt(c, plan!, item as Plan['topics'][number]),
            schema: SummaryTextSchema,
            check: (t) => problem(tidy(t)),
            maxTokens: 10_000,
            temperature: 0.5,
          }),
        );
        save(draftFile, draft);
        run.write.done++;
      }
      // 3. Review, by a different model.
      const reviewFile = join(dir, 'review', `${item.id}.json`);
      let review = read<Review>(reviewFile);
      if (!review) {
        try {
          review = await ask({
            course: c.id,
            step: 'review',
            model: REVIEWER,
            system: REVIEW_SYSTEM,
            input: reviewPrompt(c, isOverview ? 'This is the whole-course overview.' : `This is the summary of the topic "${item.title}".`, draft),
            schema: Review,
            // Room for a model that thinks before it answers.
            maxTokens: 20_000,
            temperature: 0.2,
            check: (r) => {
              if (r.issues.some((i) => i.severity !== 'low') && !r.corrected) return 'You listed issues but "corrected" is null: send the whole corrected summary.';
              if (!r.corrected) return null;
              const fixed = tidy(r.corrected);
              if (fixed.sections.length !== draft!.sections.length) return `Keep ${draft!.sections.length} sections in "corrected".`;
              if (bodyWords(fixed) < bodyWords(draft!) * 0.75) return '"corrected" is much shorter than the original: keep the length, fixing only what is wrong.';
              if (bodyWords(fixed) > bodyWords(draft!) * 1.15) return '"corrected" is much longer than the original: fix what is wrong without adding qualifications, and keep within 10% of the original length.';
              return formatProblem(fixed);
            },
          });
        } catch (e) {
          // Vultr being busy isn't a review: the course waits for a re-run rather than go out unchecked.
          if (e instanceof OverBudget || transport(e)) throw e;
          // The reviewer's answer was unusable three times. Kept as written, and named in the report so a person reads it.
          review = { issues: [], unsure: [], corrected: null, failed: true };
          console.warn(`  ${c.id}/${item.id}: the review failed (${e instanceof Error ? e.message.slice(0, 160) : e})`);
        }
        if (review.corrected) review.corrected = tidy(review.corrected);
        save(reviewFile, review);
        run.review.done++;
      }
      english.set(item.id, review.corrected ?? draft);
      reviews.set(item.id, review);
    }),
  );

  // 4. Translate (only the languages asked for). A language goes out only if every summary has it.
  const translated = new Map<string, Map<string, Text>>();
  for (const lang of LANGS) {
    if (!LANGUAGE_NAMES[lang]) throw new Error(`--langs: ${lang} isn't one of ${Object.keys(LANGUAGE_NAMES).join(', ')}`);
    const texts = new Map<string, Text>();
    const results = await Promise.allSettled(
      items.map(async (item) => {
        const file = join(dir, 'tr', lang, `${item.id}.json`);
        const en = english.get(item.id)!;
        let t = read<Text>(file);
        if (!t) {
          t = await ask({
            course: c.id,
            step: `translate:${lang}`,
            model: TRANSLATOR,
            system: 'You are a professional translator of university textbooks. You answer with one JSON object and nothing else.',
            input: translatePrompt(lang, en),
            schema: SummaryTextSchema,
            check: (x) => sameShape(en, x),
            maxTokens: 14_000,
            temperature: 0.3,
          });
          save(file, t);
        }
        texts.set(item.id, t);
      }),
    );
    const failed = results.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
    if (failed?.reason instanceof OverBudget) throw failed.reason;
    if (failed) console.warn(`  ${c.id}: ${lang} is incomplete and left out (${String(failed.reason?.message ?? failed.reason).slice(0, 160)})`);
    else translated.set(lang, texts);
  }
  const nameIn = new Map<string, string>();
  for (const lang of translated.keys()) nameIn.set(lang, translated.get(lang)!.get(OVERVIEW)!.title.split(/[:：]/)[0]!.trim());

  // 5. Build, check against the server's schema, save.
  const localised = (id: string) => Object.fromEntries([['en', english.get(id)!], ...[...translated].map(([lang, texts]) => [lang, texts.get(id)!])]);
  const lib = SummaryLibrarySchema.parse({
    id: courseLibrary(c.id),
    name: Object.fromEntries([['en', c.name], ...nameIn]),
    overview: localised(OVERVIEW),
    topics: topics.map((t) => ({ id: t.id, stage: t.stage, text: localised(t.id) })),
  } satisfies SummaryLibrary);
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, `${lib.id}.json`), JSON.stringify(lib));

  const all = [...reviews.values()].flatMap((r) => r.issues);
  const done: Done = {
    course: c.id,
    topics: topics.length,
    high: all.filter((i) => i.severity === 'high').length,
    medium: all.filter((i) => i.severity === 'medium').length,
    low: all.filter((i) => i.severity === 'low').length,
    changed: [...reviews.values()].filter((r) => r.corrected).length,
    unreviewed: [...reviews].filter(([, r]) => r.failed).map(([id]) => id),
    unsure: [...reviews].flatMap(([topic, r]) => r.unsure.map((claim) => ({ topic, claim }))),
    languages: ['en', ...translated.keys()],
  };
  save(join(dir, 'done.json'), done);
  return done;
}

// ─── The job ──────────────────────────────────────────────────────────────────

const all = appCourses();
for (const id of ONLY ?? []) if (!all.some((c) => c.id === id)) throw new Error(`${id}: not in the app's course list`);
const finished = (c: Course) => existsSync(join(OUT, `${courseLibrary(c.id)}.json`));
const todo = all.filter((c) => (ONLY ? ONLY.includes(c.id) : true) && (REDO || !finished(c)));
console.log(`${all.length} courses in the app; ${all.filter(finished).length} have a summary; ${todo.length} to write.`);
console.log(`Writer ${WRITER}, reviewer ${REVIEWER}${LANGS.length ? `, translator ${TRANSLATOR} (${LANGS.join(', ')})` : ''}. Spent so far $${spent.toFixed(2)} of $${CAP}.`);

const results: Done[] = [];
const failures: { course: string; error: string }[] = [];
let next = 0;
async function worker() {
  while (next < todo.length && !stopped) {
    const c = todo[next++]!;
    try {
      const done = await writeCourse(c);
      results.push(done);
      console.log(
        `${done.course}: ${done.topics} topics (${done.languages.join(', ')}); review changed ${done.changed}, issues ${done.high} high / ${done.medium} medium / ${done.low} low` +
          `${done.unreviewed.length ? `; ${done.unreviewed.length} unreviewed` : ''}. Total $${spent.toFixed(2)} [${results.length + failures.length}/${todo.length}]`,
      );
    } catch (e) {
      if (e instanceof OverBudget) return;
      failures.push({ course: c.id, error: e instanceof Error ? e.message.slice(0, 300) : String(e) });
      console.warn(`${c.id}: FAILED, left for a re-run (${failures.at(-1)!.error})`);
    }
    // Would the courses still to write take the job past the cap? Counted in summaries still to write and
    // to review (a course part-done only needs the rest), at what each has cost in this run.
    if (run.write.done >= 40 && run.review.done >= 40 && !stopped) {
      const perWrite = run.write.cost / run.write.done;
      const perReview = run.review.cost / run.review.done;
      const saved = (c: Course, step: string) => (existsSync(join(WORK, c.id, step)) ? readdirSync(join(WORK, c.id, step)).length : 0);
      const sizes = results.map((r) => r.topics + 1);
      const usual = sizes.length ? sizes.reduce((a, b) => a + b, 0) / sizes.length : 31;
      const left = todo.filter((t) => !results.some((r) => r.course === t.id));
      const projected = left.reduce((n, t) => {
        const plan = read<Plan>(join(WORK, t.id, 'plan.json'));
        const size = plan ? plan.topics.length + 1 : usual;
        return n + Math.max(0, size - saved(t, 'draft')) * perWrite + Math.max(0, size - saved(t, 'review')) * perReview;
      }, spent);
      if (projected > CAP)
        stopped = `at $${perWrite.toFixed(4)} to write a summary and $${perReview.toFixed(4)} to review one, the ${left.length} courses still to finish would bring the total to $${projected.toFixed(2)}, past the $${CAP} cap`;
    }
  }
}
await Promise.all(Array.from({ length: Math.min(COURSES_AT_ONCE, todo.length) }, worker));

const byModel = new Map<string, { calls: number; input: number; output: number; cost: number }>();
for (const s of ledger()) {
  const m = byModel.get(s.model) ?? { calls: 0, input: 0, output: 0, cost: 0 };
  byModel.set(s.model, { calls: m.calls + 1, input: m.input + s.inputTokens, output: m.output + s.outputTokens, cost: m.cost + s.cost });
}
save(join(WORK, 'report.json'), { at: new Date().toISOString(), spent, cap: CAP, stopped, writer: WRITER, reviewer: REVIEWER, results, failures, byModel: Object.fromEntries(byModel) });

console.log(`\nWrote ${results.length} of ${todo.length} courses this run. ${all.filter(finished).length} of ${all.length} courses now have a summary.`);
for (const [model, m] of byModel) console.log(`  ${model}: ${m.calls} calls, ${m.input.toLocaleString('en')} tokens in, ${m.output.toLocaleString('en')} out, $${m.cost.toFixed(2)}`);
console.log(`Vultr total: $${spent.toFixed(2)} of $${CAP} ($${(spent - startedAt).toFixed(2)} this run). Usage log: ${LEDGER}`);
if (failures.length) console.log(`Failed, run again to retry: ${failures.map((f) => f.course).join(', ')}`);
if (stopped) {
  console.log(`STOPPED: ${stopped}.`);
  process.exitCode = 2;
}
