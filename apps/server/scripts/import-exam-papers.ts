/**
 * Adds LICENSED real past papers (questions you have the rights to) to Past Questions, under their
 * years. Reads a CSV exported from a spreadsheet, one row per question:
 *
 *   exam,subject,year,n,topic,passage,question,a,b,c,d,e,answer,explanation
 *   jamb,physics,2019,1,Motion,,"A car accelerates…",2 m/s²,4 m/s²,6 m/s²,8 m/s²,,B,"a = Δv/t = …"
 *
 * - exam: jamb | waec | neco; subject: one of the Past Questions subjects (see src/data/exams.ts)
 * - topic: one of that subject's syllabus topics if possible (scores are broken down by topic)
 * - e is optional (5-option papers); answer is the letter of the right option
 * Each exam + subject + year becomes one paper file in data/exams/. Run from apps/server:
 *
 *   npx tsx scripts/import-exam-papers.ts papers.csv --credit "Licensed from <publisher>"
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { paperFormat, type Exam, type ExamSubject } from '../src/data/exams.js';
import { Paper, type Question } from '../src/services/exams.js';

const [file] = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && !all[i - 1]?.startsWith('--'));
const credit = process.argv.includes('--credit') ? process.argv[process.argv.indexOf('--credit') + 1] : undefined;
if (!file) throw new Error('Usage: npx tsx scripts/import-exam-papers.ts <file.csv> --credit "Licensed from …"');

/** A small CSV reader: commas, quoted fields with "" for a quote, and newlines inside quotes. */
function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') ((cell += '"'), i++);
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') (row.push(cell), (cell = ''));
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      if (row.some((x) => x.trim())) rows.push(row);
      ((row = []), (cell = ''));
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}

const [header, ...rows] = parseCsv(readFileSync(file, 'utf8').replace(/^﻿/, ''));
const col = (name: string) => {
  const i = header!.findIndex((h) => h.trim().toLowerCase() === name);
  if (i < 0 && !['passage', 'e', 'topic'].includes(name)) throw new Error(`The CSV needs a "${name}" column`);
  return i;
};
const at = Object.fromEntries(
  ['exam', 'subject', 'year', 'n', 'topic', 'passage', 'question', 'a', 'b', 'c', 'd', 'e', 'answer', 'explanation'].map((h) => [h, col(h)]),
);
const get = (r: string[], name: string) => (at[name]! >= 0 ? (r[at[name]!] ?? '').trim() : '');

const papers = new Map<string, { exam: Exam; subject: ExamSubject; year: number; questions: Question[] }>();
rows.forEach((r, line) => {
  const exam = get(r, 'exam').toLowerCase() as Exam;
  const subject = get(r, 'subject').toLowerCase() as ExamSubject;
  const year = Number(get(r, 'year'));
  const key = `${exam}-${subject}-${year}`;
  const options = ['a', 'b', 'c', 'd', 'e'].map((k) => get(r, k)).filter(Boolean);
  const answer = 'abcde'.indexOf(get(r, 'answer').toLowerCase());
  if (answer < 0) throw new Error(`Row ${line + 2}: answer must be a letter A–E`);
  const p = papers.get(key) ?? { exam, subject, year, questions: [] };
  p.questions.push({
    n: Number(get(r, 'n')) || p.questions.length + 1,
    topic: get(r, 'topic') || 'General',
    ...(get(r, 'passage') && { passage: get(r, 'passage') }),
    q: get(r, 'question'),
    options,
    answer,
    explanation: get(r, 'explanation') || 'See the marking scheme.',
  });
  papers.set(key, p);
});

const OUT = join(import.meta.dirname, '../data/exams');
for (const [id, p] of papers) {
  const questions = p.questions.sort((a, b) => a.n - b.n);
  // Parse checks every field (exam, subject, options, answers) before anything is written.
  const paper = Paper.parse({
    id,
    exam: p.exam,
    subject: p.subject,
    year: p.year,
    number: null,
    source: 'licensed',
    ...(credit && { credit }),
    minutes: paperFormat(p.exam, p.subject).minutes,
    questions,
  });
  writeFileSync(join(OUT, `${id}.json`), JSON.stringify(paper, null, 1));
  console.log(`saved ${id}: ${questions.length} questions`);
}
