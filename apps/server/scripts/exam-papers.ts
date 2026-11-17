/**
 * Writes AI practice papers for Past Questions (JAMB, WAEC, NECO) and exam practice (SAT, ACT, AP,
 * GCSE, A-level, KCSE, Matric) into
 * data/exams/, in each exam's format (see paperFormat) and spread across the subject's syllabus topics. Questions are original (never
 * copied from real papers); every one has a worked explanation. Each paper is saved the moment it's
 * finished, so a re-run only makes what's missing. Every question is solved again by a second, independent
 * AI pass that doesn't see the marked answer; only questions it agrees on are kept (papers made
 * before this check are checked and topped up on the next run). Run from apps/server:
 *
 *   npx tsx scripts/exam-papers.ts                       # 2 practice papers per exam and subject
 *   npx tsx scripts/exam-papers.ts --papers 3 --exams jamb --subjects physics,chemistry --budget 5
 *   npx tsx scripts/exam-papers.ts --exams sat,gcse --run-budget 6 --log usage.jsonl
 *   npx tsx scripts/exam-papers.ts --provider vultr --from 3 --papers 6      # papers 3–6 with open models on Vultr
 *   npx tsx scripts/exam-papers.ts --provider vultr --writer <model> --checker <model> --auditor <model> --out <folder>   # a trial
 *
 * --budget is the most ever spent on papers (all runs, kept in data/exams/.spend.json); --run-budget
 * is the most this run may spend; --log appends one line per AI call (tokens and cost) to a file.
 *
 * --provider vultr writes with open models on Vultr Serverless Inference (src/services/vultr.ts) instead
 * of OpenAI (the default). There the checker (the blind second solve) and the auditor must be different
 * models from the writer, so no model marks its own work. The auditor reads each finished question with
 * its answer and explanation next to the most similar questions already in the subject's papers, and
 * turns away wrong keys, wrong facts, off-syllabus questions and repeats. Vultr money is counted apart
 * from OpenAI's (default --budget 25); the run also stops when what is left to write would take it past
 * the budget. Questions that passed are kept in .exam-papers/ as they're made, so a stopped run picks
 * its half-made papers up again. --calls is how many requests each model gets at once.
 */
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

import { config } from '../src/config.js';
import { EXAM_SUBJECTS, EXAMS, hasSubject, paperFormat, syllabusOf, type Exam, type ExamSubject } from '../src/data/exams.js';
import { openaiClient } from '../src/services/ai.js';
import { citesLetter, usSpelling, wrongSpelling } from '../src/services/exam-spelling.js';
import { random } from '../src/services/games/english.js';
import { Paper, Question as QuestionSchema, type Question } from '../src/services/exams.js';
import { vultrConfigured, vultrJson } from '../src/services/vultr.js';

const args = process.argv.slice(2);
const flag = (name: string) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined);
const list = <T extends string>(name: string, all: readonly T[]) => (flag(name)?.split(',') as T[] | undefined) ?? [...all];
const PAPERS = Number(flag('papers') ?? 2);
/** The first paper number to make (papers before it are left alone). */
const FROM = Number(flag('from') ?? 1);
const VULTR = (flag('provider') ?? 'openai') === 'vultr';
if (!VULTR && (flag('provider') ?? 'openai') !== 'openai') throw new Error('--provider is openai or vultr');
// The Vultr models were chosen by trial (November 2026): see the notes above makePaper.
const WRITER = flag('writer') ?? (VULTR ? 'deepseek-v4.1-flash-1017' : config.OPENAI_MODEL_GENERATE);
const CHECKER = flag('checker') ?? (VULTR ? 'qwen3.8-27b' : config.OPENAI_MODEL_GENERATE);
const AUDITOR = flag('auditor') ?? (VULTR ? 'glm-5.3-flash' : undefined);
if (VULTR && (CHECKER === WRITER || AUDITOR === WRITER)) throw new Error('The checker and the auditor must be different models from the writer');
if (VULTR && !vultrConfigured()) throw new Error('not-configured: set VULTR_INFERENCE_API_KEY in apps/server/.env');
const CALLS = Number(flag('calls') ?? 4);
const BUDGET = Number(flag('budget') ?? (VULTR ? 25 : 4));
const RUN_BUDGET = Number(flag('run-budget') ?? Infinity);
const LOG = flag('log');
const PARALLEL = Number(flag('parallel') ?? 6);
const exams = list('exams', EXAMS);
const subjects = list('subjects', EXAM_SUBJECTS);

const DATA = resolve(import.meta.dirname, '../data/exams');
/** Where papers are saved: another folder for a trial. Money is always counted in data/exams. */
const OUT = resolve(flag('out') ?? DATA);
mkdirSync(OUT, { recursive: true });
/** Half-made papers, and each finished paper's numbers (how many questions were written and dropped). */
const WORK = OUT === DATA ? resolve(import.meta.dirname, '../.exam-papers') : join(OUT, '.work');
mkdirSync(WORK, { recursive: true });
const SPEND = join(DATA, '.spend.json');
/** A fair shuffle (sorting with a random comparator favours some positions). */
function shuffle<T>(r: () => number, list: readonly T[]) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}
/** OpenAI's total is `usd`, Vultr's `vultrUsd`: two providers, two budgets. */
type Ledger = { usd: number; vultrUsd?: number };
let lastLedger: Ledger = { usd: 0 };
function ledger(): Ledger {
  try {
    if (existsSync(SPEND)) lastLedger = JSON.parse(readFileSync(SPEND, 'utf8')) as Ledger;
  } catch {
    // Another run of this script is writing the file this instant: what it said a moment ago will do.
  }
  return lastLedger;
}
let spent = (VULTR ? ledger().vultrUsd : ledger().usd) ?? 0;
// gpt-5-mini list prices per million tokens.
const PRICE = { input: 0.25, output: 2 };
type Kind = 'write' | 'check' | 'audit';
/** What each paper has cost in this run. */
const costOf = new Map<string, number>();
/** What this run has spent (`spent` is everything, all runs). */
let spentHere = 0;

/** Adds one AI call's cost to the running total (saved at once, so a stopped run still counts). */
function charge(kind: Kind, id: string, model: string, u: { input_tokens: number; output_tokens: number } | undefined, cost?: number) {
  if (!u) return;
  const usd = cost ?? (u.input_tokens * PRICE.input + u.output_tokens * PRICE.output) / 1e6;
  costOf.set(id, (costOf.get(id) ?? 0) + usd);
  spentHere += usd;
  // Added to what the file says now: the other provider's total is in it, and another run of this
  // script (a trial beside the main run) may have spent since.
  const now = ledger();
  spent = ((VULTR ? now.vultrUsd : now.usd) ?? 0) + usd;
  const total = Math.round(spent * 1e6) / 1e6;
  writeFileSync(SPEND, JSON.stringify(VULTR ? { ...now, vultrUsd: total } : { ...now, usd: total }));
  if (LOG)
    appendFileSync(
      LOG,
      JSON.stringify({ at: new Date().toISOString(), id, kind, ...(VULTR && { model }), input: u.input_tokens, output: u.output_tokens, usd: Math.round(usd * 1e6) / 1e6 }) + '\n',
    );
}

// ─── Calls ────────────────────────────────────────────────────────────────────

/** Vultr limits each model's requests at once, so each model has its own queue. */
const queues = new Map<string, { running: number; waiting: (() => void)[] }>();
async function slot<T>(model: string, work: () => Promise<T>): Promise<T> {
  if (!queues.has(model)) queues.set(model, { running: 0, waiting: [] });
  const q = queues.get(model)!;
  if (q.running >= CALLS) await new Promise<void>((r) => q.waiting.push(r));
  q.running++;
  try {
    return await work();
  } finally {
    q.running--;
    q.waiting.shift()?.();
  }
}
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Ask<T> = { kind: Kind; id: string; prompt: string; schema: z.ZodType<T>; name: string; effort: 'low' | 'medium'; shape: string };
/**
 * One request to a model, answered as JSON that fits `schema`. OpenAI enforces the schema itself; a
 * Vultr model is told the shape (`shape`) and asked again once if its answer doesn't fit. Null when the
 * answer couldn't be used: the caller treats that batch as empty.
 */
async function ask<T>({ kind, id, prompt, schema, name, effort, shape }: Ask<T>): Promise<T | null> {
  const model = kind === 'write' ? WRITER : kind === 'check' ? CHECKER : AUDITOR!;
  if (!VULTR) {
    const res = await openaiClient().responses.parse({ model, reasoning: { effort }, input: prompt, text: { format: zodTextFormat(schema, name) } });
    charge(kind, id, model, res.usage);
    return res.output_parsed ?? null;
  }
  const input = `${prompt}\n\nAnswer with one JSON object and nothing else, in exactly this shape: ${shape}`;
  for (let attempt = 0; ; attempt++) {
    try {
      const r = await slot(model, () =>
        vultrJson({ model, input, schema, maxTokens: 24000, timeoutMs: 420_000, retries: 4, ...(kind !== 'write' && { temperature: 0.2 }) }),
      );
      charge(kind, id, model, { input_tokens: r.usage.inputTokens, output_tokens: r.usage.outputTokens }, r.costUsd);
      return r.data;
    } catch (e) {
      const used = e as { usage?: { inputTokens: number; outputTokens: number }; costUsd?: number };
      if (used.usage) charge(kind, id, model, { input_tokens: used.usage.inputTokens, output_tokens: used.usage.outputTokens }, used.costUsd);
      const message = e instanceof Error ? e.message : String(e);
      // An answer that was wrong twice is an empty batch. Vultr busy or unreachable: wait and ask again.
      if (/JSON was wrong twice/.test(message)) return null;
      if (/didn’t answer after/.test(message) && attempt < 4) {
        await pause(20_000 * (attempt + 1));
        continue;
      }
      throw e;
    }
  }
}

const NAMES: Record<Exam, string> = {
  jamb: 'JAMB UTME (Unified Tertiary Matriculation Examination, computer-based)',
  waec: 'WAEC WASSCE (West African Senior School Certificate Examination), objective paper',
  neco: 'NECO SSCE (Senior School Certificate Examination), objective paper',
  sat: 'digital SAT (College Board)',
  act: 'ACT (the enhanced ACT, 2025)',
  ap: 'AP exam (College Board), multiple-choice section',
  gcse: 'GCSE (England, Wales and Northern Ireland; content common to AQA, Edexcel and OCR)',
  alevel: 'A-level (England, Wales and Northern Ireland; content common to AQA, Edexcel and OCR)',
  kcse: 'KCSE (Kenya Certificate of Secondary Education, KNEC)',
  nsc: 'National Senior Certificate (South Africa’s Matric, CAPS Grades 10–12)',
};
const SUBJECT_NAMES: Partial<Record<ExamSubject, string>> = {
  'reading-writing': 'Reading and Writing',
  math: 'Math',
  maths: 'Mathematics',
  'english-language': 'English Language',
  reading: 'Reading',
  science: 'Science',
  'calculus-ab': 'Calculus AB',
  'physics-1': 'Physics 1 (algebra-based)',
  'us-history': 'United States History',
  'physical-sciences': 'Physical Sciences',
  'life-sciences': 'Life Sciences',
};
const SSCE = (exam: Exam) => exam === 'jamb' || exam === 'waec' || exam === 'neco';
function subjectName(subject: ExamSubject, exam?: Exam) {
  if (subject === 'english') return exam && !SSCE(exam) ? 'English' : 'Use of English';
  if (subject === 'english-language' && exam === 'ap') return 'English Language and Composition';
  return SUBJECT_NAMES[subject] ?? subject;
}
/** "No pictures": the line every subject without a reading passage gets. */
const NO_PICTURES = 'There are no pictures, so describe any diagram, graph or table fully in words (or give a small table as plain text lines like "x | 1 | 2 | 3"). Set passage to null.';

/** Who the paper is for and how the real exam asks: the lines of the prompt that differ by exam. */
function house(exam: Exam, subject: ExamSubject, count: number): string[] {
  if (exam === 'sat')
    return [
      `Write ${count} ORIGINAL four-option multiple-choice questions in the style of the ${NAMES.sat} ${subjectName(subject, exam)} section, for US high-school students.`,
      'Match the real test closely: the same question wording, length and difficulty mix (about a third easy, a third medium, a third hard). Use American English spelling and punctuation (color, center, analyze, math), US contexts and names from many backgrounds, dollars, and the units the SAT uses.',
      subject === 'math'
        ? 'These are the multiple-choice questions of the Math section (a calculator is allowed): a mix of plain algebra/geometry items and short word problems in real contexts. There are no pictures, so describe any figure, graph or table fully in words (or give a small table as plain text lines like "x | 1 | 2 | 3"). Set passage to null.'
        : [
            'Every question has its own short text in "passage" (25–150 words; for "Cross-text connections" give two short texts labelled "Text 1" and "Text 2"), drawn from literature-style fiction, history and social studies, the humanities, or science, followed by ONE question in the College Board\u2019s usual wording (for example "Which choice completes the text with the most logical and precise word or phrase?", "Which choice best states the main idea of the text?", "Which choice completes the text so that it conforms to the conventions of Standard English?", "Which choice completes the text with the most logical transition?").',
            'Show a blank in the passage as ______. For "Command of evidence (quantitative)" include a small data table in the passage as plain text lines (for example "Site | Samples | Percent with trait"). For "Rhetorical synthesis" the passage is the notes a student took, one per line starting with "•", and the question states the student\u2019s goal.',
            'All passages must be your own writing: never quote a real book, poem, speech or article, and never credit an invented finding to a real person or institution (use "a team of biologists", or invented names).',
          ].join(' '),
    ];
  if (exam === 'act')
    return [
      `Write ${count} ORIGINAL four-option multiple-choice questions in the style of the ${NAMES.act} ${subjectName(subject, exam)} test, for US high-school students.`,
      'Match the real test closely: the same question wording, length and difficulty mix (about a third easy, a third medium, a third hard). Use American English spelling and punctuation (color, center, analyze, math), US contexts and names from many backgrounds, dollars, and the units the ACT uses.',
      subject === 'math'
        ? `A calculator is allowed. A mix of plain algebra, geometry and trigonometry items and short word problems in real contexts. ${NO_PICTURES}`
        : subject === 'english'
          ? 'Every question has its own short text in "passage" (40–120 words, your own writing, like part of a student essay), with the portion being asked about written between square brackets, like "The committee [have decided] to meet." Most questions ask which alternative to the bracketed portion is best (one option may be "NO CHANGE", as on the real test); the others ask about the writing itself (whether to add or delete a sentence, where a sentence belongs, whether the text meets the writer’s goal).'
          : subject === 'reading'
            ? 'Write one original passage (250–400 words: literary narrative, social science, humanities or natural science; your own writing, never a real published text, and never credited to a real author) and put the same passage in "passage" for each of the 4–5 questions about it. Questions ask what the passage says and implies, how it is built and what words mean in context, in the ACT’s usual wording.'
            : 'Write one short original passage (120–250 words) that describes an experiment, a set of measurements, or two scientists’ conflicting viewpoints, with any results given as a small plain-text table (lines like "Trial | Temperature (°C) | Time (s)"), and put the same passage in "passage" for each of the 4–5 questions about it. Questions test reading the data, the design of the experiment and reasoning from the evidence, not recalled facts. The data are invented but must be physically plausible and consistent, and never credited to real scientists or institutions. There are no pictures.',
    ];
  if (exam === 'ap')
    return [
      `Write ${count} ORIGINAL four-option multiple-choice questions in the style of the multiple-choice section (Section I) of the AP ${subjectName(subject, exam)} exam (College Board), for US high-school students taking the AP course.`,
      'Match the real exam’s multiple-choice questions closely: the same wording, length and college-introductory difficulty (some straightforward, most needing reasoning). Use American English spelling and punctuation (color, center, analyze), and US contexts and names from many backgrounds where context helps.',
      subject === 'us-history'
        ? 'Real questions come in sets about a stimulus. Write a short original stimulus (60–140 words) in "passage": a historian’s interpretation in your own words (introduced like "A historian, writing in 2004:", with no real name, and a different year and point of view each time), a described primary source (such as "A political cartoon published in 1898 shows…", "A 1930s photograph shows…", "A map of 1820 shows…"), or a small data table as plain text lines; mix these kinds within the batch, and ask 2–4 questions on each stimulus, each with the same passage. Never quote, or invent words for, a real person or a real document. Questions test historical reasoning (causation, comparison, continuity and change, context) and every fact and date must be accurate.'
        : subject === 'english-language'
          ? 'Write one original nonfiction passage (200–350 words, like an essay, speech or article; your own writing, never a real text and never credited to a real author), with its sentences numbered like (1), (2), (3) so questions can point to them, and put the same passage in "passage" for each of the 4–5 questions about it. Reading questions ask about the writer’s rhetorical choices; writing questions (the "Thesis…" and "Revising…" topics) treat the passage as a student’s draft and ask which revision, addition or deletion best achieves a stated purpose.'
          : subject === 'calculus-ab'
            ? `Write calculus in plain text (f′(x), dy/dx, lim x→2, ∫ from 0 to 3 of x² dx, e^x, ln x). Most questions need no calculator; say so when one is expected. ${NO_PICTURES}`
            : `Many questions should be built on a short scenario, experiment or data set described in the question (as the exam’s science practices are), not on recall alone. ${NO_PICTURES}`,
    ];
  if (exam === 'alevel')
    return [
      `Write ${count} ORIGINAL four-option multiple-choice revision questions on A-level ${subjectName(subject, exam)} for students aged 16–18 in England, Wales and Northern Ireland, on subject content the AQA, Edexcel and OCR specifications share.`,
      'Real A-level papers are mostly written answers, so these are topic-revision questions, not copies of an exam format: test the understanding, calculations and common misconceptions the specifications cover at A-level standard (clearly beyond GCSE), with a mix of AS-level and full A-level difficulty. Use British English spelling (colour, metre, litre, organise, maths; but "sulfur", as the exam boards spell it), SI units, pounds (£) and British names and places from many backgrounds.',
      NO_PICTURES,
    ];
  if (exam === 'kcse' || exam === 'nsc') {
    const kenya = exam === 'kcse';
    return [
      kenya
        ? `Write ${count} ORIGINAL four-option multiple-choice revision questions on KCSE ${subjectName(subject, exam)} (Kenya Certificate of Secondary Education, Forms 1–4) for secondary-school students in Kenya, on the KICD syllabus that KNEC examines.`
        : `Write ${count} ORIGINAL four-option multiple-choice revision questions on ${subjectName(subject, exam)} for South Africa’s National Senior Certificate (Matric), on the CAPS curriculum for Grades 10–12.`,
      kenya
        ? 'Real KCSE papers are mostly structured and written answers, so these are topic-revision questions, not copies of an exam format: test the knowledge, calculations and common misconceptions the syllabus covers, with a mix of difficulty from Form 1 work to Form 4 work. Use British English spelling (colour, metre, litre, organise; "sulphur", as the Kenyan syllabus spells it), SI units, Kenyan shillings (KSh) and Kenyan names and places where context helps.'
        : 'Real NSC papers are mostly written answers, so these are topic-revision questions, not copies of an exam format: test the knowledge, calculations and common misconceptions the curriculum covers, mostly at Grade 12 standard with some Grade 10 and 11 work. Use British English spelling as South African English does (colour, metre, litre, organise, "sulphur"), SI units, rand (R) and South African names and places where context helps.',
      subject === 'english'
        ? 'For comprehension, write one short original passage (120–200 words) and put the same passage text in "passage" for each of the 3–5 questions about it; every other question has passage null. For pronunciation, write sounds with ordinary letters and quote the words; for stress questions write the words in their ordinary spelling and never mark the stress with capitals (no "beGIN").'
        : subject === 'accounting'
          ? 'Use South African accounting terms (debtors, creditors, VAT at 15%, SARS, shareholders’ equity) and make every figure consistent, with any ledger extract or list of balances given as plain text lines. There are no pictures. Set passage to null.'
          : NO_PICTURES,
    ];
  }
  if (exam === 'gcse')
    return [
      `Write ${count} ORIGINAL four-option multiple-choice revision questions on GCSE ${subjectName(subject, exam)} for students aged 14–16 in England, Wales and Northern Ireland, on subject content the AQA, Edexcel and OCR specifications share.`,
      'Real GCSE papers are mostly written answers, so these are topic-revision questions, not copies of an exam format: test the knowledge, calculations and common misconceptions that the specifications cover, with a mix of Foundation-tier and Higher-tier difficulty. Use British English spelling (colour, metre, litre, organise, maths; but "sulfur", as the exam boards spell it), SI units, pounds (£) and British names and places from many backgrounds.',
      subject === 'english-language'
        ? 'For reading topics, write one short original extract (80–180 words, fiction or non-fiction, your own writing, never a real published text) and put the same extract in "passage" for each of the 2–4 questions about it. Spelling, punctuation, grammar and writing questions have passage null.'
        : 'There are no pictures, so describe any diagram, graph or table fully in words (or give a small table as plain text lines). Set passage to null.',
    ];
  const english = subject === 'english';
  const literature = subject === 'literature';
  return [
    `Write ${count} ORIGINAL multiple-choice questions for a ${NAMES[exam]} paper in ${subjectName(subject, exam)}.`,
    'Match the real exam closely: the same style, length, wording and difficulty mix (mostly standard, some hard) as recent papers, set for Nigerian secondary-school leavers. Use Nigerian names, places and naira where context helps.',
    english
      ? 'For comprehension, write one short original passage (120–200 words) and put the same passage text in "passage" for each of the 3–5 questions about it; every other question has passage null. For oral English, write sounds with ordinary letters and quote the words (e.g. which word has the same vowel sound as the underlined "ea" in "heat"); for stress questions write the words in their ordinary spelling and never mark the stress with capitals (no "beGIN"), as the real papers do.'
      : literature
        ? 'Do not ask about prescribed set texts (they are copyrighted and change). For unseen poetry or prose, write a short original poem or extract in "passage" and ask 2–4 questions on it; other questions have passage null.'
        : 'Set passage to null.',
  ];
}

/**
 * What a batch's reading passages are about. Left to themselves, batches written side by side all
 * reach for the same story (in trials, a market trader who learns to keep accounts, four times in one paper).
 */
const THEMES = [
  'a school science fair',
  'a football or athletics competition',
  'a flood or storm and how a town coped',
  'a traditional festival or ceremony',
  'a long journey by road, rail or boat',
  'a public-health campaign',
  'a young inventor or a new technology',
  'planting or harvest time on a farm',
  'a library, a book or learning to read',
  'wildlife and its conservation',
  'a dispute settled by elders or in court',
  'the history of a town, a building or a craft',
  'a musician, artist or writer at work',
  'a family moving to a new home',
  'an election or a community meeting',
  'a scientific discovery explained for general readers',
  'the sea, a river or fishing',
  'a debate about social media or mobile phones',
  'a hospital, a clinic or a nurse',
  'drought, rain and water supply',
  'a teacher who changed a student',
  'transport and traffic in a growing city',
  'food, cooking and a shared meal',
  'a sporting defeat and what it taught',
  'the night sky, space or astronomy',
  'an argument for or against a school rule',
  'a mystery or an unexpected discovery',
  'trade between two regions in the past',
  'electricity, solar power or fuel',
  'a friendship tested by a hard choice',
];
/** Subjects whose questions come with passages several questions share. */
const sharesPassages = (exam: Exam, subject: ExamSubject) =>
  subject === 'english' ? exam !== 'act' : subject === 'literature' || subject === 'english-language' || subject === 'reading';

const Batch = z.object({
  questions: z.array(
    z.object({
      topic: z.string(),
      passage: z.string().nullable(),
      question: z.string(),
      correct: z.string(),
      wrong: z.array(z.string()).length(3),
      explanation: z.string(),
    }),
  ),
});

async function batch(exam: Exam, subject: ExamSubject, topics: string[], count: number, avoid: string[], id: string, themes: string[] = []) {
  const [first, ...rest] = house(exam, subject, count);
  const prompt = [
    first,
    `Cover these syllabus topics, roughly evenly, and set "topic" to exactly one of them: ${topics.join('; ')}.`,
    ...rest,
    themes.length
      ? `Where this batch has a passage, poem or extract, build it around ${themes.join(', or around ')} (a different one for each passage), and vary the kind of writing (narrative, descriptive, explanatory, argumentative).`
      : '',
    'Never copy or closely paraphrase a question from any real past paper: write new ones.',
    'Each question has exactly one correct option ("correct") and three plausible wrong options ("wrong") that reflect real mistakes students make. No "all of the above", "none of the above" or "both A and B" options, and no option letters in the text.',
    'The options are shuffled afterwards, so the explanation must never point at an option by letter or position ("A", "option B", "(C)", "the first choice"): quote or describe what the option says instead.',
    'Mathematics and science: plain text with Unicode symbols (x², √, π, ×, ÷, ≤, →, H₂O), never LaTeX; give units; make sure the numbers work out exactly.',
    'The explanation (2–4 sentences) says why the answer is right and, where useful, why a tempting wrong option is wrong, with the working for calculations. Solve every question yourself before writing it, and check the "correct" option really is correct.',
    'Exactly one option may be defensible: if two options could be argued (e.g. two words with the same sound), rewrite the question. If you find a mistake while writing, fix the question itself: never leave corrections, doubts or notes in the explanation.',
    avoid.length
      ? VULTR
        ? `These questions are already in this subject’s papers. Do not repeat them or reword them: ask about other facts, cases, skills and numbers. ${avoid.join(' | ')}`
        : `Do not repeat these questions already in the paper: ${avoid.slice(-25).join(' | ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
  const res = await ask({
    kind: 'write',
    id,
    prompt,
    schema: Batch,
    name: 'exam_questions',
    effort: 'low',
    shape: `{"questions":[{"topic":"one of the topics, exactly as written above","passage":null,"question":"…","correct":"the right option","wrong":["…","…","…"],"explanation":"…"}]} with ${count} questions ("passage" is a string wherever the instructions ask for one)`,
  });
  return res?.questions ?? [];
}

/** Explanations that second-guess themselves ("recompute", "the option given as correct is wrong"…). */
const DOUBT =
  /\bwait\b|re-?calc|re-?compute|re-?calculat|recheck|incorrect key|given as correct|marked correct|mistake in (the|this) (question|option)|\(\?|\?\s*\(|note:|actually|however,? .{0,40}also (correct|has)|both .{0,30} (are|is) correct/i;

/** A word with its stress marked in capitals, like "beGIN" or "HAppy". */
export const markedStress = (o: string) => /\b[a-z]+[A-Z]{2,}|\b[A-Z]{2,}[a-z]+\b/.test(o);

const Check = z.object({ results: z.array(z.object({ n: z.number().int(), answer: z.number().int() })) });

/**
 * A second, independent check: the model solves each question without seeing the marked answer. Only
 * questions it answers the same way (and finds exactly one right option for) are kept.
 */
async function verified(exam: Exam, subject: ExamSubject, qs: Question[], id: string) {
  const keep: boolean[] = [];
  for (let i = 0; i < qs.length; i += 10) {
    const part = qs.slice(i, i + 10);
    const text = part
      .map((q, j) => `${j + 1}. ${q.passage ? `[Passage: ${q.passage}]\n` : ''}${q.q}\n${q.options.map((o, k) => `   ${k}) ${o}`).join('\n')}`)
      .join('\n\n');
    const res = await ask({
      kind: 'check',
      id,
      schema: Check,
      name: 'exam_check',
      effort: 'medium',
      shape: `{"results":[{"n":1,"answer":0}]} with one entry for each of the ${part.length} questions`,
      prompt: `You are checking ${NAMES[exam]} ${subjectName(subject, exam)} multiple-choice questions before students see them. Solve each one carefully and independently (work it out fully). For each question number, give "answer" = the index (0–3) of the single correct option, or -1 if no option is correct, more than one option is correct, or the question is ambiguous or flawed.

${text}`,
    });
    const got = new Map((res?.results ?? []).map((x) => [x.n, x.answer]));
    part.forEach((q, j) => keep.push(got.get(j + 1) === q.answer && !DOUBT.test(q.explanation)));
  }
  return qs.filter((_, i) => keep[i]);
}

/** A batch the AI service refused counts as an empty one; anything else still stops the paper. */
const refused = (id: string) => (e: Error) => {
  if (!/flagged|usage policy/i.test(e.message)) throw e;
  console.warn(`  ${id}: a batch was refused, trying other topics`);
  return [] as never[];
};

// ─── Rules a question must pass before any AI checks it ───────────────────────

const plain = (s: string) => s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
/** The syllabus topic a writer meant, however it capitalised or punctuated it. */
const onSyllabus = (syllabus: string[], topic: string) => syllabus.find((t) => plain(t) === plain(topic));

const CATCH_ALL = /^(?:all|none|both|neither|any) of (?:the|these)\b|^(?:both|all) (?:of )?the above|^(?:a|i+) and (?:b|i+)\b|\b(?:all|none) of the above\b/i;
const LABELLED = /^\(?[A-Da-d][).:]\s/;
const MARKUP = /\\(?:frac|sqrt|times|text|left|right|cdot|div|pi|theta|leq|geq|[([])|\$[^$\d\s][^$]*\$|\*\*|^#{1,4} /m;
/** A picture the page can't show. */
const PICTURE = /\b(?:diagram|figure|picture|image|illustration) (?:above|below|shown|given)\b|\b(?:shown|given|labelled|labeled) in the (?:diagram|figure|picture|image)\b|\bin the (?:diagram|figure|picture) (?:above|below)\b/i;

type Written = z.infer<typeof Batch>['questions'][number];
/** What is wrong with a question as written (a short name, counted in the paper's numbers), or null. */
function flaw(exam: Exam, subject: ExamSubject, g: Written, options: string[]): string | null {
  if (new Set(options.map((o) => o.toLowerCase())).size !== 4 || options.some((o) => !o)) return 'options';
  if (options.some((o) => CATCH_ALL.test(o) || LABELLED.test(o))) return 'options';
  // Stress shown in capitals ("beGIN") gives the answer away.
  if (subject === 'english' && options.some(markedStress)) return 'stress';
  const all = [g.passage ?? '', g.question, ...options, g.explanation].join(' ');
  // SAT papers are in American English and GCSE ones in British English.
  if (wrongSpelling(exam, all)) return 'spelling';
  // The options are about to be shuffled, so an explanation that names one by letter would point at another.
  if (citesLetter(exam, g.explanation)) return 'letter';
  // Second thoughts, and labels left in from a rewrite ("(REVISED) Solve the system…").
  if (DOUBT.test(g.explanation) || /\((?:revised|corrected|updated|rewritten)\)/i.test(`${g.question} ${g.explanation}`)) return 'doubt';
  if (MARKUP.test(all)) return 'markup';
  if (PICTURE.test(`${g.passage ?? ''} ${g.question}`)) return 'picture';
  return null;
}

// ─── Repeats ──────────────────────────────────────────────────────────────────

/** JAMB, WAEC and NECO share subjects and syllabuses (and students), so their papers mustn't repeat each other either. */
const family = (exam: Exam) => (SSCE(exam) ? 'ssce' : exam);
const STOP = new Set(
  'a an the of in on at to is are was were be been by for and or as it its that this which what who whom with from not does do did has have had will would can could should may might if than then into each these those their there following best most choice text'.split(
    ' ',
  ),
);
/** The words, numbers and word pairs of a text: what two questions are compared by. */
function features(text: string) {
  const words = (text.toLowerCase().match(/\p{L}+|\d+(?:[.,]\d+)*|[²³√π%]/gu) ?? []).map((w) => (w.length > 4 ? w.replace(/(?:es|s)$/, '') : w)).filter((w) => !STOP.has(w));
  const bag = new Map<string, number>();
  for (const w of [...words, ...words.slice(1).map((w, i) => `${words[i]} ${w}`)]) bag.set(w, (bag.get(w) ?? 0) + 1);
  return bag;
}
type Known = { paper: string; topic: string; stem: string; q: string; answer: string; bag: Map<string, number> };

/**
 * Every question a subject already has (saved papers and half-made ones), to keep new ones from
 * repeating them. `nearest` finds the look-alikes by shared words, rare words counting most: questions
 * that are nearly word for word the same are dropped at once, and the auditor reads the rest side by
 * side with the new question to say whether it asks the same thing in other words.
 */
class Pool {
  private known: Known[] = [];
  private seen = new Map<string, number>();
  constructor(private exam: Exam, private subject: ExamSubject) {}
  private entry(paper: string, q: Question): Known {
    // SAT Reading and Writing questions all share a few stems: there the text is the question.
    const own = this.exam === 'sat' && this.subject === 'reading-writing' && q.passage;
    const answer = q.options[q.answer] ?? '';
    return { paper, topic: q.topic, stem: (own ? q.passage! : q.q).replace(/\s+/g, ' ').slice(0, 100), q: q.q, answer, bag: features(`${own ? q.passage : ''} ${q.q} ${answer}`) };
  }
  add(paper: string, q: Question) {
    const e = this.entry(paper, q);
    this.known.push(e);
    for (const w of e.bag.keys()) this.seen.set(w, (this.seen.get(w) ?? 0) + 1);
  }
  private weight = (w: string) => Math.log(1 + this.known.length / (1 + (this.seen.get(w) ?? 0)));
  private size(bag: Map<string, number>) {
    let s = 0;
    for (const [w, n] of bag) s += (n * this.weight(w)) ** 2;
    return Math.sqrt(s) || 1;
  }
  /**
   * The questions most like this one, most alike first: `alike` is 1 for the same words, 0 for none shared.
   * `not` leaves a paper's own questions out; `also` adds questions that aren't in the pool yet.
   */
  nearest(q: Question, count = 4, { not, also = [] }: { not?: string; also?: Question[] } = {}) {
    const mine = this.entry('', q).bag;
    const size = this.size(mine);
    return [...this.known.filter((e) => e.paper !== not), ...also.map((o) => this.entry('', o))]
      .map((e) => {
        let s = 0;
        for (const [w, n] of mine) if (e.bag.has(w)) s += n * e.bag.get(w)! * this.weight(w) ** 2;
        return { ...e, alike: s / (size * this.size(e.bag)) };
      })
      .sort((a, b) => b.alike - a.alike)
      .slice(0, count);
  }
  /** Short reminders of what's already been asked on these topics, newest last, for the writer. */
  asked(topics: string[], most: number) {
    return this.known
      .filter((e) => topics.includes(e.topic))
      .slice(-most)
      .map((e) => e.stem);
  }
  /** Every pair of questions from different papers that look alike, most alike first. */
  pairs(least: number) {
    const all = this.known;
    const out: { alike: number; a: Known; b: Known }[] = [];
    const sizes = all.map((e) => this.size(e.bag));
    for (let i = 0; i < all.length; i++)
      for (let j = i + 1; j < all.length; j++) {
        let s = 0;
        for (const [w, n] of all[i]!.bag) if (all[j]!.bag.has(w)) s += n * all[j]!.bag.get(w)! * this.weight(w) ** 2;
        const alike = s / (sizes[i]! * sizes[j]!);
        if (alike >= least) out.push({ alike, a: all[i]!, b: all[j]! });
      }
    return out.sort((x, y) => y.alike - x.alike);
  }
}
/** Nearly word for word the same as a question the subject already has. */
const SAME = 0.8;
/** Alike enough for the auditor to read the two side by side. */
const ALIKE = 0.22;

const paperFiles = (dir: string) => (existsSync(dir) ? readdirSync(dir).filter((x) => x.endsWith('.json') && !x.startsWith('.')) : []);
const partialFile = (id: string) => join(WORK, `${id}.json`);
const partial = (id: string): Question[] => (existsSync(partialFile(id)) ? z.array(QuestionSchema).parse(JSON.parse(readFileSync(partialFile(id), 'utf8'))) : []);
const pools = new Map<string, Pool>();
function poolOf(exam: Exam, subject: ExamSubject) {
  const key = `${family(exam)}:${subject}`;
  if (pools.has(key)) return pools.get(key)!;
  const pool = new Pool(exam, subject);
  const saved = new Set<string>();
  // A trial folder's papers are read with the real ones, so a trial can't repeat what students already have.
  for (const dir of new Set([DATA, OUT]))
    for (const f of paperFiles(dir)) {
      const paper = Paper.parse(JSON.parse(readFileSync(join(dir, f), 'utf8')));
      if (family(paper.exam) !== family(exam) || paper.subject !== subject || saved.has(paper.id)) continue;
      saved.add(paper.id);
      for (const q of paper.questions) pool.add(paper.id, q);
    }
  // Half-made papers' questions count too (their own paper picks them up when it carries on).
  for (const f of paperFiles(WORK)) {
    const id = f.replace(/\.json$/, '');
    const m = /^([a-z]+)-(.+)-p\d+$/.exec(id);
    if (!m || saved.has(id) || m[2] !== subject || !EXAMS.includes(m[1] as Exam) || family(m[1] as Exam) !== family(exam)) continue;
    for (const q of partial(id)) pool.add(id, q);
  }
  pools.set(key, pool);
  return pool;
}

// ─── The audit ────────────────────────────────────────────────────────────────

const Audit = z.object({
  results: z.array(z.object({ n: z.number().int(), ok: z.boolean(), repeat: z.boolean().nullish(), problem: z.string().nullish() })),
});

/**
 * The last check, by a model that didn't write the questions: it sees each question with its marked
 * answer and explanation, and the questions already in the subject's papers that look most like it.
 * Returns the questions it passed, and how many it turned away as wrong and as repeats.
 */
async function audited(exam: Exam, subject: ExamSubject, qs: Question[], id: string, pool: Pool, own = false) {
  const verdicts = await Promise.all(
    Array.from({ length: Math.ceil(qs.length / 10) }, async (_, b) => {
      const part = qs.slice(b * 10, b * 10 + 10);
      const text = part
        .map((q, j) => {
          // Next to the subject's other papers, and the questions before it in this lot (two batches written at once can ask the same thing).
          const alike = pool.nearest(q, 4, own ? { not: id } : { also: qs.slice(0, b * 10 + j) }).filter((e) => e.alike >= ALIKE);
          return [
            `${j + 1}. [Syllabus topic: ${q.topic}]`,
            q.passage ? `[Passage: ${q.passage}]` : '',
            q.q,
            ...q.options.map((o, k) => `   ${k}) ${o}`),
            `Marked correct: ${q.answer}) ${q.options[q.answer]}`,
            `Explanation: ${q.explanation}`,
            alike.length ? `Similar questions already published:\n${alike.map((e) => `   - ${e.q.replace(/\s+/g, ' ').slice(0, 300)} (answer: ${e.answer.slice(0, 120)})`).join('\n')}` : '',
          ]
            .filter(Boolean)
            .join('\n');
        })
        .join('\n\n');
      const res = await ask({
        kind: 'audit',
        id,
        schema: Audit,
        name: 'exam_audit',
        effort: 'medium',
        shape: `{"results":[{"n":1,"ok":true,"repeat":false,"problem":""}]} with one entry for each of the ${part.length} questions`,
        prompt: `You are the final reviewer of ${NAMES[exam]} ${subjectName(subject, exam)} multiple-choice practice questions before they are published to students. Each question below comes with the option marked as correct, its explanation and, where there are any, similar questions that are already published.

For each question number give:
- "ok": true only if ALL of this holds: (1) the marked option is correct and is the only option that can be defended (work every calculation through yourself); (2) every fact, figure, date, name and calculation in the question, the options and the explanation is right and up to date; (3) the explanation argues for the marked option, with no leftover doubts or corrections, and never points at an option by letter or position; (4) the question is clear and complete, and can be answered without a picture or anything else that is missing; (5) it belongs to its syllabus topic and suits the level and style of this exam; (6) it is written in ${usSpelling(exam) ? 'American English' : SSCE(exam) ? 'standard British English as used in Nigerian schools' : 'British English'} without language errors. Otherwise false.
- "repeat": true if the question asks essentially the same thing as one of the similar published questions listed under it: the same fact, the same word, the same passage, or the same problem with the wording or numbers barely changed. Another question on the same topic, or the same kind of calculation with different numbers and a different context, is not a repeat.
- "problem": one short sentence saying what is wrong, or "" when there is nothing.

Be strict about real errors, but do not turn a sound question away over a matter of taste.

${text}`,
      });
      const got = new Map((res?.results ?? []).map((x) => [x.n, x]));
      // No verdict is not a pass.
      return part.map((_, j) => got.get(j + 1) ?? { n: j + 1, ok: false, repeat: false, problem: 'no verdict' });
    }),
  );
  const flat = verdicts.flat();
  return {
    kept: qs.filter((_, i) => flat[i]!.ok && !flat[i]!.repeat),
    wrong: flat.filter((v) => !v.ok).length,
    repeats: flat.filter((v) => v.ok && v.repeat).length,
    problems: flat.flatMap((v, i) => (v.ok && !v.repeat ? [] : [`${v.repeat ? 'repeat' : 'wrong'}: ${qs[i]!.q.replace(/\s+/g, ' ').slice(0, 90)} → ${v.problem ?? ''}`])),
  };
}

// ─── One paper ────────────────────────────────────────────────────────────────

const CHECKED = join(OUT, '.checked.json');
const checked = new Set<string>(existsSync(CHECKED) ? (JSON.parse(readFileSync(CHECKED, 'utf8')) as string[]) : []);
/** Set when the budget can't cover what is left: no new paper starts, and the run ends with this message. */
let halted: string | null = null;
/** Questions accepted in this run (the cost of one more is this run's spend over these). */
let accepted = 0;
/** Questions still to be accepted before every paper asked for is whole. */
let remaining = 0;

/**
 * The Vultr models (trial of November 2026, on JAMB Biology and SAT Math, read against the gpt-5-mini papers):
 * deepseek-v4.1-flash-1017 writes: its questions were accurate and closer to the real papers' short, direct
 * style than gpt-5-mini's, at about 3 cents a paper. qwen3.8-27b solves blind and glm-5.3-flash audits:
 * with the key moved to a wrong option in 21 of 84 questions, each caught all 21 and passed the other 63.
 */
async function makePaper(exam: Exam, subject: ExamSubject, number: number) {
  const id = `${exam}-${subject}-p${number}`;
  const file = join(OUT, `${id}.json`);
  if (checked.has(id)) return;
  const { questions: target, minutes } = paperFormat(exam, subject);
  const r = random(id);
  // Topics in a fresh order for each paper, so different papers lean on different topics.
  const syllabus = syllabusOf(exam, subject);
  const topics = shuffle(r, syllabus);
  const pool = poolOf(exam, subject);
  const themes = sharesPassages(exam, subject) ? shuffle(r, THEMES) : [];
  let theme = 0;
  const drops: Record<string, number> = {};
  const drop = (why: string, n = 1) => n && (drops[why] = (drops[why] ?? 0) + n);
  let written = 0;
  // A paper made before checking existed: check its questions first, then fill the gaps. A paper this
  // script was stopped in the middle of: carry on from the questions that had already passed.
  let out: Question[] = existsSync(file) ? await verified(exam, subject, Paper.parse(JSON.parse(readFileSync(file, 'utf8'))).questions, id) : partial(id);
  const before = out.length;
  let k = 0;
  for (let tries = 0; out.length < target && tries < (VULTR ? 14 : 30); tries++) {
    if (halted) throw new Error(halted);
    if (spent >= BUDGET) throw new Error(`Budget of $${BUDGET} reached`);
    if (spentHere >= RUN_BUDGET) throw new Error(`This run’s budget of $${RUN_BUDGET} reached`);
    const need = target - out.length;
    // Vultr: several batches at once, with some to spare for the ones the checks will turn away.
    const batches = VULTR ? Math.min(6, Math.ceil((need * 1.3) / 10)) : 1;
    const got = await Promise.all(
      Array.from({ length: batches }, async () => {
        const slice = Array.from({ length: Math.min(4, topics.length) }, (_, j) => topics[(k + j) % topics.length]!);
        k += slice.length;
        const avoid = VULTR ? [...new Set([...pool.asked(slice, 45), ...out.slice(-15).map((q) => q.q.slice(0, 100))])] : out.map((q) => q.q.slice(0, 80));
        // Now and then the AI service turns a batch away (its prompt filter misfires on harmless questions):
        // that batch is skipped and the next one, on other topics, carries on.
        // Two themes a batch, each used once in a paper before any comes round again.
        const about = themes.length ? [themes[theme++ % themes.length]!, themes[theme++ % themes.length]!] : [];
        const list = await batch(exam, subject, slice, VULTR ? Math.min(10, Math.max(6, need + 2)) : Math.min(10, need), avoid, id, about).catch(refused(id));
        return { slice, list };
      }),
    );
    let fresh: Question[] = [];
    for (const { slice, list } of got)
      for (const g of list) {
        written++;
        const options = [g.correct, ...g.wrong].map((o) => o.trim());
        const wrong = flaw(exam, subject, g, options);
        if (wrong) {
          drop(wrong);
          continue;
        }
        // A Vultr writer must name one of the syllabus topics; a made-up topic is a sign the question strayed.
        const topic = onSyllabus(syllabus, g.topic) ?? (VULTR ? null : slice[0]!);
        if (!topic) {
          drop('topic');
          continue;
        }
        // Shuffle so the right answer isn't always first.
        const order = shuffle(r, [0, 1, 2, 3]);
        const q = QuestionSchema.safeParse({
          n: 1,
          topic,
          ...(g.passage?.trim() && { passage: g.passage.trim() }),
          q: g.question.trim(),
          options: order.map((i) => options[i]!),
          answer: order.indexOf(0),
          explanation: g.explanation.trim(),
        });
        // Too long for the app's limits (or empty).
        if (!q.success) {
          drop('length');
          continue;
        }
        // Nearly word for word a question the subject already has, or one written a moment ago in this round.
        if (pool.nearest(q.data, 1)[0]?.alike! >= SAME || fresh.some((f) => f.q === q.data.q && f.passage === q.data.passage)) {
          drop('repeat');
          continue;
        }
        fresh.push(q.data);
      }
    const solved = await verified(exam, subject, fresh, id).catch(refused(id));
    drop('solve', fresh.length - solved.length);
    fresh = solved;
    if (AUDITOR && fresh.length) {
      const audit = await audited(exam, subject, fresh, id, pool);
      drop('audit', audit.wrong);
      drop('audit-repeat', audit.repeats);
      if (LOG) for (const p of audit.problems) appendFileSync(LOG, JSON.stringify({ at: new Date().toISOString(), id, kind: 'turned-away', problem: p }) + '\n');
      fresh = audit.kept;
    }
    for (const q of fresh) {
      if (out.length >= target) {
        drop('spare');
        continue;
      }
      // Asked again here: another paper of the subject may have taken the same question meanwhile.
      if (pool.nearest(q, 1)[0]?.alike! >= SAME) {
        drop('repeat');
        continue;
      }
      pool.add(id, q);
      out.push(q);
      accepted++;
      remaining--;
    }
    if (out.length > before) writeFileSync(partialFile(id), JSON.stringify(out));
    // What is left to write, at what this run's questions have cost so far.
    if (VULTR && accepted >= 150 && !halted) {
      const projected = spent + (spentHere / accepted) * Math.max(0, remaining);
      if (projected > BUDGET)
        halted = `Stopped: at $${(spentHere / accepted).toFixed(4)} a question, the ${remaining} questions left would bring the total to $${projected.toFixed(2)}, past the budget of $${BUDGET}`;
    }
  }
  if (out.length < target) throw new Error(`${id}: only ${out.length} of ${target} questions passed the check`);
  const paper = Paper.parse({ id, exam, subject, year: null, number, source: 'ai', minutes, questions: out.map((q, i) => ({ ...q, n: i + 1 })) });
  writeFileSync(file, JSON.stringify(paper, null, 1));
  checked.add(id);
  // With whatever another run has finished meanwhile.
  try {
    if (existsSync(CHECKED)) for (const other of JSON.parse(readFileSync(CHECKED, 'utf8')) as string[]) checked.add(other);
  } catch {
    // Being written by that other run this instant; its papers are picked up at the next save.
  }
  writeFileSync(CHECKED, JSON.stringify([...checked].sort()));
  appendFileSync(
    join(WORK, 'papers.jsonl'),
    JSON.stringify({ at: new Date().toISOString(), id, provider: VULTR ? 'vultr' : 'openai', writer: WRITER, checker: CHECKER, auditor: AUDITOR ?? null, questions: out.length, carried: before, written, drops, usd: Math.round((costOf.get(id) ?? 0) * 10000) / 10000 }) + '\n',
  );
  console.log(
    `saved ${id} (${out.length} questions${before ? `, ${before} carried over` : ''}; ${written} written, dropped ${Object.entries(drops).map(([w, n]) => `${n} ${w}`).join(', ') || 'none'}) · spent so far $${spent.toFixed(3)}`,
  );
}

// --sweep: drop questions that slipped past older versions of these rules, so their papers are refilled.
if (args.includes('--sweep'))
  for (const f of paperFiles(OUT)) {
    const paper = Paper.parse(JSON.parse(readFileSync(join(OUT, f), 'utf8')));
    if (paper.source !== 'ai' || !exams.includes(paper.exam)) continue;
    const good = paper.questions.filter(
      (q) =>
        !DOUBT.test(q.explanation) &&
        !q.options.some(markedStress) &&
        !citesLetter(paper.exam, q.explanation) &&
        !wrongSpelling(paper.exam, [q.passage ?? '', q.q, ...q.options, q.explanation].join(' ')),
    );
    if (good.length === paper.questions.length) continue;
    console.log(`sweep ${paper.id}: removing ${paper.questions.length - good.length}`);
    writeFileSync(join(OUT, f), JSON.stringify({ ...paper, questions: good.map((q, i) => ({ ...q, n: i + 1 })) }, null, 1));
    checked.delete(paper.id);
  }
writeFileSync(CHECKED, JSON.stringify([...checked].sort()));

// --recheck: the blind solve and the audit again on saved papers, listing what they'd turn away (nothing is written or changed).
if (args.includes('--recheck')) {
  for (const f of paperFiles(OUT)) {
    const paper = Paper.parse(JSON.parse(readFileSync(join(OUT, f), 'utf8')));
    if (!exams.includes(paper.exam) || !subjects.includes(paper.subject) || (paper.number ?? 0) < FROM) continue;
    const solved = new Set(await verified(paper.exam, paper.subject, paper.questions, paper.id));
    const audit = AUDITOR ? await audited(paper.exam, paper.subject, paper.questions, paper.id, poolOf(paper.exam, paper.subject), true) : null;
    const passed = new Set(audit?.kept ?? paper.questions);
    const numbers = (list: Question[]) => list.map((q) => q.n).join(', ') || 'none';
    console.log(`${paper.id}: the second solve disagrees on ${numbers(paper.questions.filter((q) => !solved.has(q)))}; the audit turns away ${numbers(paper.questions.filter((q) => !passed.has(q)))}`);
    for (const p of audit?.problems ?? []) console.log(`   ${p}`);
  }
  console.log(`Spent $${spentHere.toFixed(3)}.`);
  process.exit(0);
}

// --repeats: lists the questions in different papers of a subject that look most alike (nothing is written or changed).
if (args.includes('--repeats')) {
  const least = Number(flag('repeats')) || 0.5;
  for (const exam of exams)
    for (const subject of subjects.filter((s) => hasSubject(exam, s))) {
      if (family(exam) === 'ssce' && exam !== exams.find((e) => family(e) === 'ssce')) continue;
      const pairs = poolOf(exam, subject)
        .pairs(least)
        .filter((p) => p.a.paper !== p.b.paper);
      console.log(`\n${family(exam)} ${subject}: ${pairs.length} pairs at ${least} or more`);
      for (const p of pairs.slice(0, Number(flag('show') ?? 12)))
        console.log(`  ${p.alike.toFixed(2)}  ${p.a.paper}: ${p.a.stem} → ${p.a.answer.slice(0, 50)}\n        ${p.b.paper}: ${p.b.stem} → ${p.b.answer.slice(0, 50)}`);
    }
  process.exit(0);
}

const todo = exams
  .flatMap((exam) =>
    subjects
      .filter((subject) => hasSubject(exam, subject))
      .flatMap((subject) => Array.from({ length: Math.max(0, PAPERS - FROM + 1) }, (_, i) => ({ exam, subject, number: FROM + i }))),
  )
  // Vultr runs papers side by side: one number at a time across the subjects, so two papers of a subject rarely write at once.
  .sort((a, b) => (VULTR ? a.number - b.number : 0));
remaining = todo
  .filter((j) => !checked.has(`${j.exam}-${j.subject}-p${j.number}`))
  .reduce((n, j) => n + paperFormat(j.exam, j.subject).questions - (VULTR ? partial(`${j.exam}-${j.subject}-p${j.number}`).length : 0), 0);
if (VULTR) console.log(`Vultr: writer ${WRITER}, checker ${CHECKER}, auditor ${AUDITOR}. ${remaining} questions to make; spent so far $${spent.toFixed(3)} of $${BUDGET}.`);
const jobs = todo.map((j) => () => makePaper(j.exam, j.subject, j.number));
let next = 0;
let failed = 0;
await Promise.all(
  Array.from({ length: PARALLEL }, async () => {
    while (next < jobs.length && !halted) {
      const job = jobs[next++]!;
      await job().catch((e: Error) => {
        failed++;
        if (e.message !== halted) console.warn('  failed:', e.message);
      });
    }
  }),
);
if (halted) console.warn(halted);
console.log(`Done. Spent $${spentHere.toFixed(3)} in this run, $${spent.toFixed(3)} in total.${failed ? ` ${failed} papers failed; run again to retry them.` : ''}`);
