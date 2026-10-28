/**
 * Writes AI practice papers for Past Questions (JAMB, WAEC, NECO) into data/exams/, in each exam's
 * objective format and spread across the subject's syllabus topics. Questions are original (never
 * copied from real papers); every one has a worked explanation. Each paper is saved the moment it's
 * finished, so a re-run only makes what's missing. Every question is solved again by a second, independent
 * AI pass that doesn't see the marked answer; only questions it agrees on are kept (papers made
 * before this check are checked and topped up on the next run). Run from apps/server:
 *
 *   npx tsx scripts/exam-papers.ts                       # 2 practice papers per exam and subject
 *   npx tsx scripts/exam-papers.ts --papers 3 --exams jamb --subjects physics,chemistry --budget 5
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

import { config } from '../src/config.js';
import { EXAM_SUBJECTS, EXAMS, paperFormat, SYLLABUS, type Exam, type ExamSubject } from '../src/data/exams.js';
import { openaiClient } from '../src/services/ai.js';
import { random } from '../src/services/games/english.js';
import { Paper, type Question } from '../src/services/exams.js';

const args = process.argv.slice(2);
const flag = (name: string) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined);
const list = <T extends string>(name: string, all: readonly T[]) => (flag(name)?.split(',') as T[] | undefined) ?? [...all];
const PAPERS = Number(flag('papers') ?? 2);
const BUDGET = Number(flag('budget') ?? 4);
const PARALLEL = Number(flag('parallel') ?? 6);
const exams = list('exams', EXAMS);
const subjects = list('subjects', EXAM_SUBJECTS);

const OUT = join(import.meta.dirname, '../data/exams');
mkdirSync(OUT, { recursive: true });
const SPEND = join(OUT, '.spend.json');
/** A fair shuffle (sorting with a random comparator favours some positions). */
function shuffle<T>(r: () => number, list: readonly T[]) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}
let spent = existsSync(SPEND) ? (JSON.parse(readFileSync(SPEND, 'utf8')) as { usd: number }).usd : 0;
// gpt-5-mini list prices per million tokens.
const PRICE = { input: 0.25, output: 2 };

const NAMES: Record<Exam, string> = {
  jamb: 'JAMB UTME (Unified Tertiary Matriculation Examination, computer-based)',
  waec: 'WAEC WASSCE (West African Senior School Certificate Examination), objective paper',
  neco: 'NECO SSCE (Senior School Certificate Examination), objective paper',
};

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

async function batch(exam: Exam, subject: ExamSubject, topics: string[], count: number, avoid: string[]) {
  const english = subject === 'english';
  const literature = subject === 'literature';
  const prompt = [
    `Write ${count} ORIGINAL multiple-choice questions for a ${NAMES[exam]} paper in ${subject === 'english' ? 'Use of English' : subject}.`,
    `Cover these syllabus topics, roughly evenly, and set "topic" to exactly one of them: ${topics.join('; ')}.`,
    'Match the real exam closely: the same style, length, wording and difficulty mix (mostly standard, some hard) as recent papers, set for Nigerian secondary-school leavers. Use Nigerian names, places and naira where context helps.',
    'Never copy or closely paraphrase a question from any real past paper: write new ones.',
    'Each question has exactly one correct option ("correct") and three plausible wrong options ("wrong") that reflect real mistakes students make. No "all of the above", "none of the above" or "both A and B" options, and no option letters in the text.',
    'Mathematics and science: plain text with Unicode symbols (x², √, π, ×, ÷, ≤, →, H₂O), never LaTeX; give units; make sure the numbers work out exactly.',
    english
      ? 'For comprehension, write one short original passage (120–200 words) and put the same passage text in "passage" for each of the 3–5 questions about it; every other question has passage null. For oral English, write sounds with ordinary letters and quote the words (e.g. which word has the same vowel sound as the underlined "ea" in "heat"); for stress questions give the words in plain lower case (never mark the stress with capitals), as the real papers do.'
      : literature
        ? 'Do not ask about prescribed set texts (they are copyrighted and change). For unseen poetry or prose, write a short original poem or extract in "passage" and ask 2–4 questions on it; other questions have passage null.'
        : 'Set passage to null.',
    'The explanation (2–4 sentences) says why the answer is right and, where useful, why a tempting wrong option is wrong, with the working for calculations. Solve every question yourself before writing it, and check the "correct" option really is correct.',
    'Exactly one option may be defensible: if two options could be argued (e.g. two words with the same sound), rewrite the question. If you find a mistake while writing, fix the question itself: never leave corrections, doubts or notes in the explanation.',
    avoid.length ? `Do not repeat these questions already in the paper: ${avoid.slice(-25).join(' | ')}` : '',
  ]
    .filter(Boolean)
    .join('\n');
  const res = await openaiClient().responses.parse({
    model: config.OPENAI_MODEL_GENERATE,
    reasoning: { effort: 'low' },
    input: prompt,
    text: { format: zodTextFormat(Batch, 'exam_questions') },
  });
  const u = res.usage;
  if (u) spent += (u.input_tokens * PRICE.input + u.output_tokens * PRICE.output) / 1e6;
  writeFileSync(SPEND, JSON.stringify({ usd: Math.round(spent * 10000) / 10000 }));
  return res.output_parsed?.questions ?? [];
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
async function verified(exam: Exam, subject: ExamSubject, qs: Question[]) {
  const keep: boolean[] = [];
  for (let i = 0; i < qs.length; i += 10) {
    const part = qs.slice(i, i + 10);
    const text = part
      .map((q, j) => `${j + 1}. ${q.passage ? `[Passage: ${q.passage}]\n` : ''}${q.q}\n${q.options.map((o, k) => `   ${k}) ${o}`).join('\n')}`)
      .join('\n\n');
    const res = await openaiClient().responses.parse({
      model: config.OPENAI_MODEL_GENERATE,
      reasoning: { effort: 'medium' },
      input: `You are checking ${NAMES[exam]} ${subject} multiple-choice questions before students see them. Solve each one carefully and independently (work it out fully). For each question number, give "answer" = the index (0–3) of the single correct option, or -1 if no option is correct, more than one option is correct, or the question is ambiguous or flawed.

${text}`,
      text: { format: zodTextFormat(Check, 'exam_check') },
    });
    const u = res.usage;
    if (u) spent += (u.input_tokens * PRICE.input + u.output_tokens * PRICE.output) / 1e6;
    writeFileSync(SPEND, JSON.stringify({ usd: Math.round(spent * 10000) / 10000 }));
    const got = new Map((res.output_parsed?.results ?? []).map((x) => [x.n, x.answer]));
    part.forEach((q, j) => keep.push(got.get(j + 1) === q.answer && !DOUBT.test(q.explanation)));
  }
  return qs.filter((_, i) => keep[i]);
}

const CHECKED = join(OUT, '.checked.json');
const checked = new Set<string>(existsSync(CHECKED) ? (JSON.parse(readFileSync(CHECKED, 'utf8')) as string[]) : []);

async function makePaper(exam: Exam, subject: ExamSubject, number: number) {
  const id = `${exam}-${subject}-p${number}`;
  const file = join(OUT, `${id}.json`);
  if (checked.has(id)) return;
  const { questions: target, minutes } = paperFormat(exam, subject);
  const r = random(id);
  // Topics in a fresh order for each paper, so different papers lean on different topics.
  const topics = shuffle(r, SYLLABUS[subject]);
  // A paper made before checking existed: check its questions first, then fill the gaps.
  let out: Question[] = existsSync(file) ? await verified(exam, subject, Paper.parse(JSON.parse(readFileSync(file, 'utf8'))).questions) : [];
  const before = out.length;
  let k = 0;
  for (let tries = 0; out.length < target && tries < 30; tries++) {
    if (spent >= BUDGET) throw new Error(`Budget of $${BUDGET} reached`);
    const want = Math.min(10, target - out.length);
    const slice = Array.from({ length: Math.min(4, topics.length) }, (_, j) => topics[(k + j) % topics.length]!);
    k += slice.length;
    const got = await batch(
      exam,
      subject,
      slice,
      want,
      out.map((q) => q.q.slice(0, 80)),
    );
    const fresh: Question[] = [];
    for (const g of got) {
      const options = [g.correct, ...g.wrong].map((o) => o.trim());
      if (new Set(options.map((o) => o.toLowerCase())).size !== 4 || options.some((o) => !o)) continue;
      // Stress shown in capitals ("beGIN") gives the answer away.
      if (options.some(markedStress)) continue;
      // Shuffle so the right answer isn't always first.
      const order = shuffle(r, [0, 1, 2, 3]);
      fresh.push({
        n: 0,
        topic: SYLLABUS[subject].includes(g.topic) ? g.topic : slice[0]!,
        ...(g.passage?.trim() && { passage: g.passage.trim() }),
        q: g.question.trim(),
        options: order.map((i) => options[i]!),
        answer: order.indexOf(0),
        explanation: g.explanation.trim(),
      });
    }
    out = [...out, ...(await verified(exam, subject, fresh))].slice(0, target);
  }
  if (out.length < target) throw new Error(`${id}: only ${out.length} of ${target} questions passed the check`);
  const paper = Paper.parse({ id, exam, subject, year: null, number, source: 'ai', minutes, questions: out.map((q, i) => ({ ...q, n: i + 1 })) });
  writeFileSync(file, JSON.stringify(paper, null, 1));
  checked.add(id);
  writeFileSync(CHECKED, JSON.stringify([...checked].sort()));
  console.log(`saved ${id} (${out.length} questions${before ? `, ${before} old ones passed the check` : ''}) · spent so far $${spent.toFixed(3)}`);
}

// --sweep: drop questions that slipped past older versions of these rules, so their papers are refilled.
if (args.includes('--sweep'))
  for (const f of readdirSync(OUT).filter((x) => x.endsWith('.json') && !x.startsWith('.'))) {
    const paper = Paper.parse(JSON.parse(readFileSync(join(OUT, f), 'utf8')));
    if (paper.source !== 'ai') continue;
    const good = paper.questions.filter((q) => !DOUBT.test(q.explanation) && !q.options.some(markedStress));
    if (good.length === paper.questions.length) continue;
    console.log(`sweep ${paper.id}: removing ${paper.questions.length - good.length}`);
    writeFileSync(join(OUT, f), JSON.stringify({ ...paper, questions: good.map((q, i) => ({ ...q, n: i + 1 })) }, null, 1));
    checked.delete(paper.id);
  }
writeFileSync(CHECKED, JSON.stringify([...checked].sort()));

const jobs = exams.flatMap((exam) => subjects.flatMap((subject) => Array.from({ length: PAPERS }, (_, i) => () => makePaper(exam, subject, i + 1))));
let next = 0;
let failed = 0;
await Promise.all(
  Array.from({ length: PARALLEL }, async () => {
    while (next < jobs.length) {
      const job = jobs[next++]!;
      await job().catch((e: Error) => {
        failed++;
        console.warn('  failed:', e.message);
      });
    }
  }),
);
console.log(`Done. Spent $${spent.toFixed(3)} in total.${failed ? ` ${failed} papers failed; run again to retry them.` : ''}`);
