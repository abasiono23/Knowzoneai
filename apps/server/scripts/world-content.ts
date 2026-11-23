/**
 * Writes the question banks of the Knowzone World adventure (src/data/world/bank/<world>.ts): for each
 * of the seven worlds and each of the ten levels, multiple-choice questions, true-or-false statements
 * (the lightning round) and key terms with clues (the word puzzle), graded on the shared ladder from
 * early secondary school (level 1) to postgraduate / olympiad (level 10).
 *
 *   - a writer (deepseek-v4.1-flash-1017) proposes the items;
 *   - code checks every item first (shape, repeats, option lists, a term in its own clue, and for the
 *     maths world the correct option is recomputed from the arithmetic the writer gives);
 *   - a checker (qwen3.8-27b), a different model, verifies every answer and rates how hard it is;
 *   - an auditor (glm-5.3-flash), a third model, re-checks a sample of what the checker passed.
 *
 * Every candidate and verdict is kept in .world-content/ as it's made, so a stopped run carries on where
 * it stopped. Money is counted in .world-content/spend.json across runs; --budget is the most ever spent
 * (default $3). Run from apps/server:
 *
 *   npx tsx scripts/world-content.ts                         # everything, then writes the data files
 *   npx tsx scripts/world-content.ts --worlds math --levels 9,10
 *   npx tsx scripts/world-content.ts --stages build          # only rewrite the data files
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { z } from 'zod';

import { config } from '../src/config.js';
import { WORLD_IDS, WORLD_LADDER, type BankLevel, type WorldId } from '../src/data/world/types.js';
import { parseModelJson, vultrConfigured, vultrCost, type VultrUsage } from '../src/services/vultr.js';

const VULTR_BASE = 'https://api.vultrinference.com/v1';
const args = process.argv.slice(2);
const flag = (name: string) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined);
const WORLDS = (flag('worlds')?.split(',') ?? [...WORLD_IDS]) as WorldId[];
const LEVELS = (flag('levels') ?? '1,2,3,4,5,6,7,8,9,10').split(',').map(Number);
const STAGES = (flag('stages') ?? 'write,audit,build').split(',');
const BUDGET = Number(flag('budget') ?? 3);
const CALLS = Number(flag('calls') ?? 6);
const ROUNDS = Number(flag('rounds') ?? 3);
const WRITER = 'deepseek-v4.1-flash-1017';
const CHECKER = 'qwen3.8-27b';
const AUDITOR = 'glm-5.3-flash';
/** What each level needs once checked (the writer is asked for a little more). */
const NEED = { questions: 10, truths: 14, terms: 6 };

const WORK = resolve(import.meta.dirname, '../.world-content');
const DATA = resolve(import.meta.dirname, '../src/data/world/bank');
mkdirSync(WORK, { recursive: true });
mkdirSync(DATA, { recursive: true });
const SPEND = join(WORK, 'spend.json');

// ─── Money ────────────────────────────────────────────────────────────────────

type Ledger = { vultrUsd: number; calls: number; byModel: Record<string, number> };
let money: Ledger = existsSync(SPEND) ? JSON.parse(readFileSync(SPEND, 'utf8')) : { vultrUsd: 0, calls: 0, byModel: {} };
function charge(model: string, usd: number) {
  money.vultrUsd = Math.round((money.vultrUsd + usd) * 1e6) / 1e6;
  money.calls++;
  money.byModel[model] = Math.round(((money.byModel[model] ?? 0) + usd) * 1e6) / 1e6;
  writeFileSync(SPEND, JSON.stringify(money, null, 1));
}
class OutOfMoney extends Error {}
const canSpend = () => money.vultrUsd < BUDGET - 0.15;

// ─── Calls (thinking off, as in scripts/word-games-content.ts) ───────────────

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
type Completion = { choices?: { message?: { content?: string }; finish_reason?: string }[]; usage?: { prompt_tokens?: number; completion_tokens?: number } };

async function quickJson<T>(model: string, input: string, schema: z.ZodType<T>, temperature: number) {
  const usage: VultrUsage = { inputTokens: 0, outputTokens: 0, reasoningTokens: 0 };
  let costUsd = 0;
  const messages: { role: string; content: string }[] = [{ role: 'user', content: input }];
  let problem = '';
  for (let attempt = 1; attempt <= 2; attempt++) {
    let data = null as Completion | null;
    for (let tries = 0; tries < 5 && !data; tries++) {
      if (tries) await pause(3000 * 2 ** tries);
      try {
        const res = await fetch(`${VULTR_BASE}/chat/completions`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${config.VULTR_INFERENCE_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: 12000,
            temperature,
            response_format: { type: 'json_object' },
            chat_template_kwargs: model.startsWith('qwen') ? { enable_thinking: false } : { thinking: false },
          }),
          signal: AbortSignal.timeout(240_000),
        });
        if (res.status === 429 || res.status >= 500) continue;
        if (!res.ok) throw new Error(`Vultr refused the request (HTTP ${res.status})`);
        data = (await res.json()) as Completion;
      } catch (e) {
        if (e instanceof Error && /refused/.test(e.message)) throw e;
      }
    }
    if (!data) throw new Error('Vultr didn’t answer after 5 tries');
    const u = { inputTokens: data.usage?.prompt_tokens ?? 0, outputTokens: data.usage?.completion_tokens ?? 0 };
    usage.inputTokens += u.inputTokens;
    usage.outputTokens += u.outputTokens;
    costUsd += vultrCost(model, u);
    const choice = data.choices?.[0];
    const text = choice?.message?.content ?? '';
    try {
      if (choice?.finish_reason === 'length') throw new Error('The answer was cut off before the JSON ended; write it shorter');
      const parsed = schema.safeParse(parseModelJson(text));
      if (!parsed.success) throw new Error(parsed.error.issues.slice(0, 8).map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
      return { data: parsed.data, usage, costUsd };
    } catch (e) {
      problem = e instanceof Error ? e.message : String(e);
      messages.push({ role: 'assistant', content: text.slice(0, 6000) }, { role: 'user', content: `That answer can't be used: ${problem.slice(0, 1500)}\nSend the whole JSON object again, corrected. JSON only.` });
    }
  }
  throw Object.assign(new Error(`The model's JSON was wrong twice: ${problem.slice(0, 300)}`), { usage, costUsd });
}

async function ask<T>(model: string, prompt: string, schema: z.ZodType<T>, shape: string, temperature: number): Promise<T | null> {
  if (!canSpend()) throw new OutOfMoney();
  const input = `${prompt}\n\nAnswer with one JSON object and nothing else, in exactly this shape: ${shape}`;
  for (let attempt = 0; ; attempt++) {
    try {
      const r = await slot(model, () => {
        if (!canSpend()) throw new OutOfMoney();
        return quickJson(model, input, schema, temperature);
      });
      charge(model, r.costUsd);
      appendFileSync(join(WORK, 'calls.jsonl'), `${JSON.stringify({ at: new Date().toISOString(), model, task: prompt.slice(0, 70), ...r.usage, usd: r.costUsd })}\n`);
      return r.data;
    } catch (e) {
      if (e instanceof OutOfMoney) throw e;
      const used = e as { costUsd?: number };
      if (used.costUsd) charge(model, used.costUsd);
      const message = e instanceof Error ? e.message : String(e);
      appendFileSync(join(WORK, 'calls.jsonl'), `${JSON.stringify({ at: new Date().toISOString(), model, error: message.slice(0, 300) })}\n`);
      if (/JSON was wrong twice/.test(message)) return null;
      if (/didn’t answer after/.test(message) && attempt < 3) {
        await pause(20_000 * (attempt + 1));
        continue;
      }
      throw e;
    }
  }
}

// ─── The ladder ───────────────────────────────────────────────────────────────

const SUBJECT: Record<WorldId, string> = {
  space: 'Space and physics: the solar system, stars, galaxies and cosmology, gravity and orbits, light and the electromagnetic spectrum, forces and motion, energy, Earth and its place in space, spaceflight.',
  math: 'Mathematics: number and arithmetic, fractions and percentages, algebra, geometry and trigonometry, statistics and probability, sequences, functions, calculus, linear algebra, number theory and proof.',
  nature: 'Biology and the living world: cells, the human body and health, plants, animals, ecology, genetics, evolution, microbiology, biochemistry, agriculture.',
  language: 'English language and literature: grammar, punctuation, word meaning and word origins, figures of speech, literary forms and terms, famous works and writers from every continent (including African, Asian and Caribbean literature), and linguistics at the higher levels.',
  history: 'History and government: world history from ancient civilisations to today on every continent (Africa, Asia, the Americas, Europe, Oceania), empires and trade, revolutions, colonialism and independence movements, the world wars, systems of government, law and civic ideas.',
  code: 'Computer science and AI: how computers work, binary and data, algorithms, programming ideas, data structures, the internet and networks, cybersecurity, databases, operating systems, artificial intelligence and machine learning, and computability and complexity at the higher levels.',
  art: 'Art, design and music: colour theory, the elements and principles of design, art movements and artists from every continent, architecture, photography, typography and graphic design, music theory and music history.',
};

const NAMES = ['', 'Starter', 'Beginner', 'Elementary', 'Intermediate', 'Upper-intermediate', 'Advanced', 'Proficient', 'Expert', 'Master', 'Super hard'];
const DEPTH: Record<number, string> = {
  1: 'first year of secondary school (age 11–12): one basic fact or idea per question, plain words.',
  2: 'early secondary school (age 12–13): basic facts and simple ideas, a step above level 1.',
  3: 'lower secondary / junior secondary exams (age 13–15, like BECE or KS3): facts plus simple understanding.',
  4: 'senior secondary core (GCSE / WAEC core): apply a concept, short one- or two-step reasoning.',
  5: 'top grades of GCSE / WAEC / SAT: two-step reasoning, careful reading, common misconceptions as wrong options.',
  6: 'A-level / AP / IB Higher Level: multi-step reasoning, precise terms, plausible wrong options.',
  7: 'first-year university: deeper concepts, calculations or analysis in several steps, subtle distractors.',
  8: 'second- and third-year university (specialist): specialist knowledge and multi-step problems a strong undergraduate can solve.',
  9: 'final-year undergraduate and master’s level: advanced, specialist and quantitative; distractors are the answers of someone who almost understands.',
  10: 'postgraduate / olympiad-hard ("Super hard"): questions that stump most graduates in the field; olympiad-style reasoning, rare specialist facts, tricky edge cases. Still exactly one correct answer, checkable from standard sources.',
};
const OPTIONS = (level: number) => WORLD_LADDER[level - 1]!.options;
const TERM_LEN = (level: number): [number, number] => (level <= 3 ? [4, 9] : level <= 7 ? [5, 12] : [7, 14]);

// ─── Items ────────────────────────────────────────────────────────────────────

type Status = 'pending' | 'ok' | 'rejected';
type Q = { q: string; options: string[]; answer: number; why: string; hint: string; calc?: string | null; status: Status; reason?: string; rating?: number; audit?: 'ok' | 'wrong' };
type T = { s: string; answer: boolean; why: string; status: Status; reason?: string; rating?: number; audit?: 'ok' | 'wrong' };
type Term = { word: string; clue: string; status: Status; reason?: string; rating?: number };
type LevelFile = { questions: Q[]; truths: T[]; terms: Term[]; rounds: number };

const fileOf = (w: WorldId, l: number) => join(WORK, `${w}-${l}.json`);
const load = (w: WorldId, l: number): LevelFile => (existsSync(fileOf(w, l)) ? JSON.parse(readFileSync(fileOf(w, l), 'utf8')) : { questions: [], truths: [], terms: [], rounds: 0 });
const store = (w: WorldId, l: number, f: LevelFile) => writeFileSync(fileOf(w, l), JSON.stringify(f, null, 1));
const okCount = (f: LevelFile) => ({
  questions: f.questions.filter((x) => x.status === 'ok').length,
  truths: f.truths.filter((x) => x.status === 'ok').length,
  terms: f.terms.filter((x) => x.status === 'ok').length,
});
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
/** Options are compared on their exact text (symbols matter: λ and λ² are different answers). */
const optionKey = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

/** Evaluates plain arithmetic ("(3/4)*120", "Math.sqrt(2)") or returns null for anything else. */
export function evalArithmetic(expr: string): number | null {
  const src = expr.replace(/\^/g, '**').replace(/\bpi\b/gi, 'Math.PI');
  if (!/^[\d\s+\-*/().,%e]*$/i.test(src.replace(/Math\.(sqrt|PI|log10|log|exp|sin|cos|tan|abs|pow|floor|ceil|E)/g, ''))) return null;
  try {
    const v = Function(`"use strict"; return (${src.replace(/(\d),(\d{3})/g, '$1$2')});`)() as unknown;
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}
/** The number an option states ("12 cm", "1,250", "-3.5"), when it is just a number. */
export function numberIn(option: string): number | null {
  const m = option.replace(/,(\d{3})/g, '$1').match(/^\s*(-?\d+(?:\.\d+)?)(?:\s*[a-zA-Z°%²³/]*)?\s*$/);
  return m ? Number(m[1]) : null;
}

function questionProblem(level: number, x: { q: string; options: string[]; answer: number; why: string; hint: string; calc?: string | null }, world: WorldId): string | null {
  if (x.options.length !== OPTIONS(level)) return 'option-count';
  if (x.answer < 0 || x.answer >= x.options.length) return 'answer-index';
  if (new Set(x.options.map(optionKey)).size !== x.options.length) return 'repeated-option';
  if (x.options.some((o) => /all of the above|none of the above|both a and b/i.test(o))) return 'above-option';
  if (x.q.length < 12 || x.q.length > 420 || x.options.some((o) => !o.trim() || o.length > 140)) return 'length';
  if (x.why.length < 10 || x.hint.length < 5) return 'explanation';
  if (world === 'math' && x.calc) {
    const v = evalArithmetic(x.calc);
    const stated = numberIn(x.options[x.answer]);
    if (v !== null && stated !== null && Math.abs(v - stated) > Math.max(1e-6, Math.abs(v) * 0.005)) return 'calc-mismatch';
  }
  return null;
}
function termProblem(level: number, word: string, clue: string): string | null {
  if (!/^[A-Z]+$/.test(word)) return 'format';
  const [lo, hi] = TERM_LEN(level);
  if (word.length < lo || word.length > hi) return 'length';
  if (clue.toUpperCase().includes(word.slice(0, Math.max(4, word.length - 2)))) return 'gives-away';
  if (clue.length < 8 || clue.length > 120) return 'clue-form';
  return null;
}

// ─── Writing ──────────────────────────────────────────────────────────────────

const Write = z.object({
  questions: z.array(z.object({ q: z.string(), options: z.array(z.string()), answer: z.number().int(), why: z.string(), hint: z.string(), calc: z.string().nullish() })),
  truths: z.array(z.object({ s: z.string(), answer: z.boolean(), why: z.string() })),
  terms: z.array(z.object({ word: z.string(), clue: z.string() })),
});
const WRITE_SHAPE = (level: number) =>
  `{"questions":[{"q":"the question","options":[${Array.from({ length: OPTIONS(level) }, (_, k) => `"option ${k + 1}"`).join(',')}],"answer":0,"why":"one or two sentences: why the answer is right","hint":"a nudge that doesn't give the answer away","calc":"maths world only: arithmetic giving the correct option's number, else null"}],"truths":[{"s":"a statement","answer":true,"why":"one sentence"}],"terms":[{"word":"TERM","clue":"a short clue"}]}`;

async function write(world: WorldId, level: number, f: LevelFile, avoid: string[]) {
  const want = okCount(f);
  const nq = Math.max(0, NEED.questions + 3 - want.questions);
  const nt = Math.max(0, NEED.truths + 4 - want.truths);
  const nw = Math.max(0, NEED.terms + 3 - want.terms);
  if (!nq && !nt && !nw) return;
  const [lo, hi] = TERM_LEN(level);
  const prompt = `You write questions for Knowzone World, a learning game played worldwide by secondary-school pupils, university students and adult learners. British spelling. Facts must be correct and checkable in standard textbooks; no trick wording; examples from many countries, not only one.

Subject: ${SUBJECT[world]}
Level ${level} of 10 (${NAMES[level]}): ${DEPTH[level]}
The levels run from 1 (first year of secondary school) to 10 (postgraduate / olympiad). Write for level ${level} exactly: not easier.${level >= 6 ? ' Questions here need real reasoning or specialist knowledge, not one-line recall.' : ''}

Write:
- ${nq} multiple-choice questions, each with exactly ${OPTIONS(level)} options and exactly ONE correct option ("answer" is its 0-based index). Wrong options must be plausible (common mistakes), never silly. No "all/none of the above". Vary where the correct option sits. Keep options short.${world === 'math' ? ' When the correct option is a number, "calc" is a plain arithmetic expression (JavaScript syntax, Math.sqrt allowed) whose value is that number, e.g. "(3/4)*120"; otherwise null.' : ' "calc" is null.'}
- ${nt} true-or-false statements, about half true and half false. A false one must be clearly false to someone who knows the subject (change one key fact), never a matter of opinion.
- ${nw} key terms of the subject at this level: one word, capital letters A–Z only, ${lo}–${hi} letters, no spaces or hyphens, with a clue of 4 to 14 words that points only at that term and doesn't contain it.
Cover different topics of the subject.${avoid.length ? `\nDon't repeat these (already used):\n${avoid.slice(-60).join('\n')}` : ''}`;
  const out = await ask(WRITER, prompt, Write, WRITE_SHAPE(level), 0.8);
  if (!out) return;
  const seen = new Set([...avoid.map(norm), ...f.questions.map((x) => norm(x.q)), ...f.truths.map((x) => norm(x.s)), ...f.terms.map((x) => norm(x.word))]);
  for (const x of out.questions.slice(0, nq + 2)) {
    const reason = seen.has(norm(x.q)) ? 'repeat' : questionProblem(level, x, world);
    seen.add(norm(x.q));
    f.questions.push({ ...x, status: reason ? 'rejected' : 'pending', ...(reason && { reason }) });
  }
  for (const x of out.truths.slice(0, nt + 2)) {
    const reason = seen.has(norm(x.s)) ? 'repeat' : x.s.length < 12 || x.s.length > 260 ? 'length' : null;
    seen.add(norm(x.s));
    f.truths.push({ ...x, status: reason ? 'rejected' : 'pending', ...(reason && { reason }) });
  }
  for (const x of out.terms.slice(0, nw + 2)) {
    const word = x.word.trim().toUpperCase();
    const reason = seen.has(norm(word)) ? 'repeat' : termProblem(level, word, x.clue);
    seen.add(norm(word));
    f.terms.push({ word, clue: x.clue.trim(), status: reason ? 'rejected' : 'pending', ...(reason && { reason }) });
  }
  f.rounds++;
}

// ─── Checking ─────────────────────────────────────────────────────────────────

const Check = z.object({
  questions: z.array(z.object({ i: z.number().int(), correct: z.boolean(), onlyOne: z.boolean(), clear: z.boolean(), level: z.number().int().min(1).max(10) })),
  truths: z.array(z.object({ i: z.number().int(), correct: z.boolean(), clear: z.boolean(), level: z.number().int().min(1).max(10) })),
  terms: z.array(z.object({ i: z.number().int(), correct: z.boolean(), level: z.number().int().min(1).max(10) })),
});
const CHECK_SHAPE =
  '{"questions":[{"i":0,"correct":true,"onlyOne":true,"clear":true,"level":5}],"truths":[{"i":0,"correct":true,"clear":true,"level":5}],"terms":[{"i":0,"correct":true,"level":5}]}';

/**
 * Lowest checker rating kept at each level. The checker rates content lower than its level (a trial run
 * rated real master's-level algebra 6–7), so the floor sits a few steps under the level; lower levels
 * also have a ceiling, so a level-2 question isn't university work.
 */
const floor = (level: number, kind: 'q' | 't' | 'w') =>
  Math.max(1, level - (level <= 3 ? 9 : level <= 5 ? 2 : level <= 7 ? 3 : 4) - (kind === 'q' ? 0 : 1));
const ceiling = (level: number) => (level <= 3 ? level + 3 : 10);

async function check(world: WorldId, level: number, f: LevelFile) {
  const qs = f.questions.map((x, i) => ({ x, i })).filter(({ x }) => x.status === 'pending');
  const ts = f.truths.map((x, i) => ({ x, i })).filter(({ x }) => x.status === 'pending');
  const ws = f.terms.map((x, i) => ({ x, i })).filter(({ x }) => x.status === 'pending');
  if (!qs.length && !ts.length && !ws.length) return;
  const L = 'ABCDE';
  const prompt = `You are a strict examiner checking a learning game's content for factual accuracy. Subject: ${SUBJECT[world]}
The game has a 1–10 difficulty ladder: 1 = first year of secondary school, 4 = GCSE/WAEC core, 6 = A-level/AP, 7 = first-year university, 8 = upper university, 9 = master's, 10 = postgraduate/olympiad. These items were written for level ${level}.

Work each one out yourself before judging. For each item:
- questions: correct = the option marked ✓ is right; onlyOne = no other option is also right or defensible; clear = the wording is unambiguous.
- truths: correct = the stated TRUE/FALSE is right; clear = it isn't a matter of opinion or wording.
- terms: correct = the clue accurately points at the term and at no other common term of the same length.
- level: how hard the item really is on the 1–10 ladder (be honest; most textbook recall is level 1–4).

QUESTIONS
${qs.map(({ x, i }) => `${i}. ${x.q}\n${x.options.map((o, k) => `   ${L[k]}) ${o}${k === x.answer ? ' ✓' : ''}`).join('\n')}`).join('\n')}

TRUTHS
${ts.map(({ x, i }) => `${i}. [${x.answer ? 'TRUE' : 'FALSE'}] ${x.s}`).join('\n')}

TERMS
${ws.map(({ x, i }) => `${i}. ${x.word} (${x.word.length} letters): ${x.clue}`).join('\n')}`;
  const out = await ask(CHECKER, prompt, Check, CHECK_SHAPE, 0.1);
  if (!out) return;
  const too = (rating: number, kind: 'q' | 't' | 'w') => (rating < floor(level, kind) ? 'too-easy' : rating > ceiling(level) ? 'too-hard' : null);
  for (const v of out.questions) {
    const x = f.questions[v.i];
    if (!x || x.status !== 'pending') continue;
    x.rating = v.level;
    const reason = !v.correct ? 'wrong' : !v.onlyOne ? 'ambiguous' : !v.clear ? 'unclear' : too(v.level, 'q');
    x.status = reason ? 'rejected' : 'ok';
    if (reason) x.reason = reason;
  }
  for (const v of out.truths) {
    const x = f.truths[v.i];
    if (!x || x.status !== 'pending') continue;
    x.rating = v.level;
    const reason = !v.correct ? 'wrong' : !v.clear ? 'unclear' : too(v.level, 't');
    x.status = reason ? 'rejected' : 'ok';
    if (reason) x.reason = reason;
  }
  for (const v of out.terms) {
    const x = f.terms[v.i];
    if (!x || x.status !== 'pending') continue;
    x.rating = v.level;
    const reason = !v.correct ? 'wrong' : too(v.level, 'w');
    x.status = reason ? 'rejected' : 'ok';
    if (reason) x.reason = reason;
  }
  // Anything the checker skipped is checked again next round.
}

// ─── Audit (a third model re-checks a sample of passed items) ────────────────

const Audit = z.object({ items: z.array(z.object({ i: z.number().int(), ok: z.boolean(), reason: z.string().nullish() })) });
async function audit(world: WorldId, level: number, f: LevelFile) {
  const qs = f.questions.map((x, i) => ({ x, i })).filter(({ x }) => x.status === 'ok' && !x.audit);
  const ts = f.truths.map((x, i) => ({ x, i })).filter(({ x }) => x.status === 'ok' && !x.audit);
  // Every question at levels 8–10 (where models slip most), a third of them below.
  const pickQ = level >= 8 ? qs : qs.filter((_, k) => k % 3 === 0);
  const pickT = ts.filter((_, k) => k % 4 === 0);
  if (!pickQ.length && !pickT.length) return;
  const L = 'ABCDE';
  const lines = [
    ...pickQ.map(({ x, i }) => `q${i}. ${x.q}\n${x.options.map((o, k) => `   ${L[k]}) ${o}${k === x.answer ? ' ✓' : ''}`).join('\n')}`),
    ...pickT.map(({ x, i }) => `t${i}. [${x.answer ? 'TRUE' : 'FALSE'}] ${x.s}`),
  ];
  const ids = [...pickQ.map(({ i }) => ({ kind: 'q' as const, i })), ...pickT.map(({ i }) => ({ kind: 't' as const, i }))];
  const prompt = `You audit a learning game (subject: ${SUBJECT[world]}). Each item shows the answer the game will accept (✓ for multiple choice, TRUE/FALSE for statements). Work each out yourself. Mark ok=false if the accepted answer is wrong, another option is also right, or the item is ambiguous. Number the items 0..${ids.length - 1} in the order given.

${lines.map((l, k) => `[${k}] ${l}`).join('\n')}`;
  const out = await ask(AUDITOR, prompt, Audit, '{"items":[{"i":0,"ok":true,"reason":"only when ok is false"}]}', 0.1);
  if (!out) return;
  for (const v of out.items) {
    const id = ids[v.i];
    if (!id) continue;
    const x = id.kind === 'q' ? f.questions[id.i] : f.truths[id.i];
    x.audit = v.ok ? 'ok' : 'wrong';
    if (!v.ok) {
      x.status = 'rejected';
      x.reason = `audit: ${(v.reason ?? '').slice(0, 160)}`;
    }
  }
}

// ─── Build ────────────────────────────────────────────────────────────────────

/** Deterministic shuffle, so the correct option isn't always where the writer put it. */
function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function build(world: WorldId) {
  const levels: Record<number, BankLevel> = {};
  for (let l = 1; l <= 10; l++) {
    const f = load(world, l);
    const r = rng(`${world}-${l}`);
    // From level 4 up, a long list keeps its hardest items (by the checker's rating), so a level never
    // leans on its easiest questions; lower levels keep everything.
    const hardest = <X extends { rating?: number }>(list: X[], max: number) =>
      l < 4 || list.length <= max ? list : [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, max);
    levels[l] = {
      questions: hardest(f.questions.filter((x) => x.status === 'ok'), 16)
        .map((x, k) => {
          const order = x.options.map((_, j) => j).sort(() => r() - 0.5);
          return { id: `${world}-L${l}-q${k + 1}`, q: x.q.trim(), options: order.map((j) => x.options[j].trim()), answer: order.indexOf(x.answer), why: x.why.trim(), hint: x.hint.trim() };
        }),
      truths: hardest(f.truths.filter((x) => x.status === 'ok'), 24).map((x, k) => ({ id: `${world}-L${l}-t${k + 1}`, s: x.s.trim(), answer: x.answer, why: x.why.trim() })),
      terms: f.terms.filter((x) => x.status === 'ok').map((x, k) => ({ id: `${world}-L${l}-w${k + 1}`, word: x.word, clue: x.clue.trim() })),
    };
  }
  const name = `${world.toUpperCase()}_BANK`;
  writeFileSync(
    join(DATA, `${world}.ts`),
    `// Written by scripts/world-content.ts (writer ${WRITER}, checker ${CHECKER}, auditor ${AUDITOR}). Don't edit by hand.\nimport type { WorldBank } from '../types.js';\n\nexport const ${name}: WorldBank = ${JSON.stringify(levels, null, 1)};\n`,
  );
  return Object.values(levels).map((b) => `${b.questions.length}/${b.truths.length}/${b.terms.length}`).join(' ');
}

// ─── Run ──────────────────────────────────────────────────────────────────────

async function main() {
  if (STAGES.some((s) => s !== 'build') && !vultrConfigured()) throw new Error('VULTR_INFERENCE_API_KEY is not set');
  const jobs: Promise<void>[] = [];
  for (const world of WORLDS) {
    jobs.push(
      (async () => {
        // A world's levels run in order, so later levels can avoid earlier items.
        for (const level of LEVELS) {
          const f = load(world, level);
          if (STAGES.includes('rescore')) {
            // Items turned away only for being too easy, under an older floor, come back if they now pass.
            for (const [list, kind] of [[f.questions, 'q'], [f.truths, 't'], [f.terms, 'w']] as const)
              for (const x of list as { status: Status; reason?: string; rating?: number }[])
                if (x.reason === 'too-easy' && x.rating !== undefined && x.rating >= floor(level, kind) && x.rating <= ceiling(level)) {
                  x.status = 'ok';
                  delete x.reason;
                }
            store(world, level, f);
          }
          if (STAGES.includes('write')) {
            const avoid: string[] = [];
            for (let l = 1; l <= 10; l++) if (l !== level) for (const x of load(world, l).questions) if (x.status === 'ok') avoid.push(x.q.slice(0, 90));
            for (let round = 0; round < ROUNDS; round++) {
              const c = okCount(f);
              if (c.questions >= NEED.questions && c.truths >= NEED.truths && c.terms >= NEED.terms) break;
              await write(world, level, f, avoid);
              store(world, level, f);
              await check(world, level, f);
              store(world, level, f);
            }
            await check(world, level, f);
            store(world, level, f);
          }
          if (STAGES.includes('audit')) {
            await audit(world, level, f);
            store(world, level, f);
          }
          const c = okCount(f);
          console.log(`${world} L${level}: ${c.questions} questions, ${c.truths} truths, ${c.terms} terms · $${money.vultrUsd.toFixed(3)}`);
        }
      })(),
    );
  }
  const results = await Promise.allSettled(jobs);
  for (const r of results) if (r.status === 'rejected') console.log('stopped:', r.reason instanceof Error ? r.reason.message : r.reason);
  if (STAGES.includes('build')) for (const world of WORLD_IDS) console.log(`built ${world}: ${build(world)}`);
  console.log(`Vultr spend so far: $${money.vultrUsd.toFixed(4)} in ${money.calls} calls`, money.byModel);
}

if (process.argv[1]?.endsWith('world-content.ts')) void main();
