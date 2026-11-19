/**
 * Writes the graded content of the English word games (src/data/english/vocab.ts, sentences.ts and
 * hunts.ts) for the ten-level ladder, with open models on Vultr Serverless Inference:
 *
 *   - a writer (deepseek-v4.1-flash-1017) proposes words with clues, sentences with a trap word, and
 *     Word Hunter themes with their words;
 *   - a checker (qwen3.8-27b), a different model, checks every item: is the clue right and unambiguous,
 *     how hard is the word on the ladder, is anything offensive or only known in one country; is the
 *     sentence right, on its grammar point, with a trap that is really wrong and every right word order;
 *   - an auditor (glm-5.3-flash), a third model, reads a sample of what the checker passed.
 *
 * Code checks every item before any model sees it (dictionary, spelling, clue gives the word away,
 * repeats across levels, offensive words: src/data/english/checks.ts). Every candidate and verdict is
 * kept in .word-games/ as it's made, so a stopped run carries on where it stopped. Money is counted in
 * .word-games/spend.json across runs; --budget is the most ever spent (default $6). Run from apps/server:
 *
 *   npx tsx scripts/word-games-content.ts                        # everything, then writes the data files
 *   npx tsx scripts/word-games-content.ts --stages vocab --levels 8,9,10
 *   npx tsx scripts/word-games-content.ts --stages build         # only rewrite the data files
 *   npx tsx scripts/word-games-content.ts --stages stats         # what the checks turned away
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { z } from 'zod';

import { americanSpelling, blocked, blockedIn, clueGivesAway, inDictionary } from '../src/data/english/checks.js';
import { HUNT_THEMES } from '../src/data/english/hunts.js';
import { SENTENCES as OLD_SENTENCES } from '../src/data/english/sentences.js';
import { VOCAB as OLD_VOCAB } from '../src/data/english/vocab.js';
import { random } from '../src/services/games/english.js';
import { config } from '../src/config.js';
import { parseModelJson, vultrConfigured, vultrCost, type VultrUsage } from '../src/services/vultr.js';

const VULTR_BASE = 'https://api.vultrinference.com/v1';

const args = process.argv.slice(2);
const flag = (name: string) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined);
const LEVELS = (flag('levels') ?? '1,2,3,4,5,6,7,8,9,10').split(',').map(Number);
const STAGES = (flag('stages') ?? 'vocab,sentences,hunts,build,stats').split(',');
const BUDGET = Number(flag('budget') ?? 6);
const CALLS = Number(flag('calls') ?? 6);
const VOCAB_TARGET = Number(flag('vocab') ?? 165);
const SENTENCE_TARGET = Number(flag('sentences') ?? 36);
const THEME_TARGET = Number(flag('themes') ?? 50);
const VOCAB_ROUNDS = Number(flag('vocab-rounds') ?? 16);
const HUNT_ROUNDS = Number(flag('hunt-rounds') ?? 6);
const WRITER = 'deepseek-v4.1-flash-1017';
const CHECKER = 'qwen3.8-27b';
const AUDITOR = 'glm-5.3-flash';

const WORK = resolve(import.meta.dirname, '../.word-games');
const DATA = resolve(import.meta.dirname, '../src/data/english');
mkdirSync(WORK, { recursive: true });
const SPEND = join(WORK, 'spend.json');

// ─── Money ────────────────────────────────────────────────────────────────────

type Ledger = { vultrUsd: number; calls: number; byModel: Record<string, number> };
const ledger = (): Ledger => (existsSync(SPEND) ? (JSON.parse(readFileSync(SPEND, 'utf8')) as Ledger) : { vultrUsd: 0, calls: 0, byModel: {} });
let money = ledger();
function charge(model: string, usd: number) {
  money.vultrUsd = Math.round((money.vultrUsd + usd) * 1e6) / 1e6;
  money.calls++;
  money.byModel[model] = Math.round(((money.byModel[model] ?? 0) + usd) * 1e6) / 1e6;
  writeFileSync(SPEND, JSON.stringify(money, null, 1));
}
class OutOfMoney extends Error {}
/** Calls in flight can each add a few cents, so stop with a little left. */
const RESERVE = 0.2;
const canSpend = () => money.vultrUsd < BUDGET - RESERVE;

// ─── Calls ────────────────────────────────────────────────────────────────────

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
/** Waits for every job (so none is still writing files), then throws the first failure. */
async function settled(jobs: Promise<unknown>[]) {
  const results = await Promise.allSettled(jobs);
  const failed = results.find((r) => r.status === 'rejected');
  if (failed) throw (failed as PromiseRejectedResult).reason;
}
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** One line per call in .word-games/calls.jsonl: tokens, cost and what went wrong. */
function note(model: string, prompt: string, usage: VultrUsage | undefined, usd: number, attempts: number, error?: string) {
  const line = { at: new Date().toISOString(), model, task: prompt.slice(0, 60), ...usage, usd: Math.round(usd * 1e6) / 1e6, attempts, ...(error && { error }) };
  appendFileSync(join(WORK, 'calls.jsonl'), `${JSON.stringify(line)}\n`);
}

/**
 * vultrJson with the models' thinking turned off. A trial run showed both the writer and the checker
 * thinking for 20,000+ tokens per batch (and often running out before the JSON), which would have spent
 * the whole budget on a fraction of the content. vultrChat has no way to pass chat_template_kwargs, so
 * this one request is made here; prices and JSON parsing still come from services/vultr.ts. Checks that
 * need reasoning ask for a short written `why` in the JSON instead.
 */
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
      return { data: parsed.data, attempts: attempt, usage, costUsd };
    } catch (e) {
      problem = e instanceof Error ? e.message : String(e);
      messages.push({ role: 'assistant', content: text.slice(0, 6000) }, { role: 'user', content: `That answer can't be used: ${problem.slice(0, 1500)}\nSend the whole JSON object again, corrected. JSON only.` });
    }
  }
  throw Object.assign(new Error(`The model's JSON was wrong twice: ${problem.slice(0, 300)}`), { usage, costUsd });
}

/** One JSON request. Null when the answer was unusable twice (the batch is then skipped). */
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
      note(model, prompt, r.usage, r.costUsd, r.attempts);
      return r.data;
    } catch (e) {
      if (e instanceof OutOfMoney) throw e;
      const used = e as { costUsd?: number };
      if (used.costUsd) charge(model, used.costUsd);
      const message = e instanceof Error ? e.message : String(e);
      note(model, prompt, (e as { usage?: VultrUsage }).usage, used.costUsd ?? 0, 0, message.slice(0, 300));
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

const LADDER = `The Knowzone word-game ladder (10 levels; learners worldwide, from secondary school to adults; British spelling):
1 Starter (CEFR A1): the most common everyday words. e.g. HOUSE, WATER, HAPPY, CHAIR
2 Beginner (A1–A2): common words of daily life. e.g. GIANT, VILLAGE, KITCHEN, WINDOW
3 Elementary (A2): e.g. JOURNEY, BORROW, CAREFUL, DESERT
4 Intermediate (B1): e.g. ANXIOUS, ESTIMATE, GENEROUS, HARVEST
5 Upper-intermediate (B2): e.g. RELUCTANT, CONSEQUENCE, VIVID, INEVITABLE
6 Advanced (C1): e.g. RESILIENT, SCRUTINISE, ARCANE, DEARTH, CREDULOUS
7 Proficient (C2): e.g. ACQUIESCE, JUXTAPOSE, ACERBIC, PAUCITY, CACOPHONY
8 Expert (rare academic words an educated native reader meets in serious writing): e.g. LACONIC, OSTENTATIOUS, ADUMBRATE, ANTEDILUVIAN, PERFUNCTORY
9 Master (GRE-level and specialist words): e.g. LACHRYMOSE, PELLUCID, INELUCTABLE, OBSTREPEROUS, TENEBROUS
10 Super hard (very rare but real words that even well-read native speakers rarely know): e.g. PUSILLANIMOUS, SESQUIPEDALIAN, DEFENESTRATE, QUIDNUNC, TERGIVERSATE, BORBORYGMUS`;
const NAMES = ['', 'Starter', 'Beginner', 'Elementary', 'Intermediate', 'Upper-intermediate', 'Advanced', 'Proficient', 'Expert', 'Master', 'Super hard'];
/** What the writer is told about each level (the checker rates words lower than writers expect). */
const HOW_HARD: Record<number, string> = {
  1: 'the very first words a beginner learns (home, family, food, body, colours, school, simple verbs and adjectives).',
  2: 'common words of daily life, a step above the very first words.',
  3: 'everyday words an A2 learner is learning now, not easier.',
  4: 'B1 words: still everyday, but less basic (feelings, work, travel, nature, opinions).',
  5: 'B2 words a good upper-intermediate learner is learning now, not easier.',
  6: 'C1 words: educated but not rare (an educated adult knows them; a B2 learner does not).',
  7: 'C2 words: refined vocabulary of good writing that many educated adults know (like ACERBIC, PAUCITY, CORPULENT), not technical terms.',
  8: 'rare words of serious writing that many educated adults do NOT know (like LACONIC, OSTENTATIOUS, ANTEDILUVIAN, HIRSUTE). Words like ARCANE, COGENT, NADIR or DEARTH are only level 6 and ACERBIC or PAUCITY only level 7: go rarer.',
  9: 'GRE-level and specialist words that only keen readers know (like LACHRYMOSE, PELLUCID, INELUCTABLE, TENEBROUS). Words like LACONIC or ANTEDILUVIAN are only level 8: go rarer.',
  10: 'the rarest real words a word lover collects, which even well-read native speakers rarely know (like PUSILLANIMOUS, SESQUIPEDALIAN, DEFENESTRATE, QUIDNUNC, TERGIVERSATE, BORBORYGMUS, LOGORRHOEA, ABSQUATULATE). GRE words like OBSEQUIOUS or PELLUCID are too easy here.',
};
const maxLength = (level: number) => (level >= 9 ? 14 : 12);
/** Word Hunter grid size by level: hunt words fit inside it. */
const GRID = [0, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11];
/** The checker's rating a word may have at each level. */
const window = (level: number): [number, number] => (level === 1 ? [1, 2] : level === 10 ? [9, 10] : [level - 1, level + 1]);
const huntWindow = (level: number): [number, number] => (level <= 2 ? [1, level + 1] : level >= 8 ? [level - 3, 10] : [level - 2, level + 1]);
const inside = (n: number, [lo, hi]: [number, number]) => n >= lo && n <= hi;

const read = <T>(file: string, fallback: T): T => (existsSync(join(WORK, file)) ? (JSON.parse(readFileSync(join(WORK, file), 'utf8')) as T) : fallback);
const save = (file: string, data: unknown) => writeFileSync(join(WORK, file), JSON.stringify(data, null, 1));

// ─── Vocabulary ───────────────────────────────────────────────────────────────

type VItem = {
  word: string;
  clue: string;
  origin: 'existing' | 'writer';
  status: 'pending' | 'ok' | 'rejected';
  reason?: string;
  rating?: number;
  audit?: 'ok' | 'wrong';
  /** The clue was replaced by the checker's fix (the first clue is kept here). */
  retried?: boolean;
  firstClue?: string;
  /** Written for this level, then moved to the level the checker rated it. */
  movedFrom?: number;
};
const vocabFile = (level: number) => `vocab-${level}.json`;
type VFile = { items: VItem[]; rounds: number };
/** Each level's file, loaded once and shared, since checked words can move between levels. */
const vfiles = new Map<number, VFile>();
function vocabOf(level: number) {
  if (!vfiles.has(level)) vfiles.set(level, read<VFile>(vocabFile(level), { items: [], rounds: 0 }));
  return vfiles.get(level)!;
}
const vsave = (level: number) => save(vocabFile(level), vocabOf(level));
const vok = (level: number) => vocabOf(level).items.filter((it) => it.status === 'ok').length;
/** A level still taking words moved from another level (a little over its target). */
const room = (level: number) => vok(level) + vocabOf(level).items.filter((it) => it.status === 'pending').length < VOCAB_TARGET + 15;

/** Words taken by a level (passed or still waiting for the checker): no other level may use them. */
const claimed = new Map<string, number>();
function loadClaims() {
  for (let l = 1; l <= 10; l++) for (const it of vocabOf(l).items) if (it.status !== 'rejected') claimed.set(it.word, l);
}

/** Code checks on a word and its clue; the reason it fails, or null. */
function vocabProblem(level: number, word: string, clue: string): string | null {
  if (!/^[A-Z]+$/.test(word)) return 'format';
  if (word.length < 4 || word.length > maxLength(level)) return 'length';
  if (blocked(word) || blockedIn(clue)) return 'blocked';
  if (!inDictionary(word)) return 'dictionary';
  if (americanSpelling(word)) return 'american';
  if (clue.length < 6 || clue.length > 90 || clue.split(/\s+/).length > 14) return 'clue-form';
  if (clueGivesAway(word, clue)) return 'gives-away';
  if ((clue.match(/[A-Za-z]+/g) ?? []).some((t) => t.length > 4 && americanSpelling(t))) return 'american';
  return null;
}

const VCheck = z.object({
  items: z.array(
    z.object({
      i: z.number().int(),
      clueCorrect: z.boolean(),
      clueClear: z.boolean(),
      unambiguous: z.boolean(),
      level: z.number().int().min(1).max(10),
      offensive: z.boolean(),
      narrow: z.boolean(),
      betterClue: z.string().nullish(),
    }),
  ),
});
const VCHECK_SHAPE =
  '{"items":[{"i":0,"clueCorrect":true,"clueClear":true,"unambiguous":true,"level":4,"offensive":false,"narrow":false,"betterClue":"only when clueCorrect, clueClear or unambiguous is false"}]}';

async function checkVocab(level: number, items: VItem[]) {
  const list = items.map((it, i) => `${i}. ${it.word} (${it.word.length} letters) — clue: "${it.clue}"`).join('\n');
  const prompt = `You check words and clues for an English word game. The player sees the clue and the number of letters and must find the word.

${LADDER}

These items are meant for level ${level} (${NAMES[level]}). For each item judge:
- clueCorrect: the clue is a true, accurate description of the word's main meaning (a dictionary would agree).
- clueClear: the clue is short, neutral English that a learner at level ${level} can read${level >= 8 ? ' (at this level, B2–C1 words in clues are fine)' : ''}.
- unambiguous: a reader would land on this word; false if another common word of the SAME length fits the clue just as well.
- level: how hard the WORD itself is, on the 1–10 ladder above (judge the word honestly, ignoring the level it was written for).
- offensive: the word or clue is vulgar, a slur, sexual, or hurtful to any group.
- narrow: the word or clue only makes sense in one country or culture (a local brand, local slang, a dish only one country knows).
- betterClue: when clueCorrect, clueClear or unambiguous is false, a fixed clue (3 to 12 words, no full stop) that is correct, clear and points only at this word, never containing the word or a form of it.
The ladder is wide: be honest that rare words belong high up, and that a word most educated adults know is not above level 7.

${list}`;
  const answer = await ask(CHECKER, prompt, VCheck, VCHECK_SHAPE, 0.1);
  return answer?.items ?? null;
}

const Audit = z.object({ items: z.array(z.object({ i: z.number().int(), ok: z.boolean(), reason: z.string().nullish() })) });
const AUDIT_SHAPE = '{"items":[{"i":0,"ok":true,"reason":"only when ok is false"}]}';

async function auditVocab(level: number, items: VItem[]) {
  const list = items.map((it, i) => `${i}. ${it.word} — "${it.clue}"`).join('\n');
  const prompt = `You audit an English word game for learners worldwide (British spelling). Each line is a word and its clue, for level ${level} of this ladder:

${LADDER}

Mark ok=false when: the clue is wrong or misleading about the word's meaning, the clue fits a different word of the same length better, the word is not a real English word, the word is far easier or far harder than level ${level} (more than one level off), or anything is offensive. Otherwise ok=true. Be strict but fair.

${list}`;
  const answer = await ask(AUDITOR, prompt, Audit, AUDIT_SHAPE, 0.1);
  return answer?.items ?? null;
}

const VWrite = z.object({ items: z.array(z.object({ word: z.string(), clue: z.string() })) });

async function writeVocab(level: number, avoid: string[], n: number, letters: string[]) {
  const prompt = `You write content for an English word game used by learners worldwide (secondary school to adults). The player sees a short clue and the word's length, and must spell the word.

${LADDER}

Write ${n} NEW words for level ${level} (${NAMES[level]}), each with a clue.
Rules for words:
- Real, standard English words, one word, letters only (no hyphens, spaces, capitals of names, abbreviations). British spelling (colour, organise, centre).
- ${level <= 8 ? '4 to 12 letters' : '4 to 14 letters'}; at least a third of them 5 to 7 letters long.
- Exactly level ${level} difficulty: ${HOW_HARD[level]}
- A good mix of nouns, verbs and adjectives across many topics. No proper nouns, no plurals or -ing forms of words, nothing vulgar, nothing tied to one country.
- Every word starts with one of these letters: ${letters.join(', ')} (this keeps each batch new).
- Do not use any of these words: ${avoid.join(', ') || '(none)'}
Rules for clues:
- Short (3 to 12 words), accurate, neutral, written for a learner at level ${level}${level >= 8 ? ' (clues may use B2–C1 words)' : ' (simpler words than the answer)'}.
- Never contain the word, any form of it, or a word built on the same root.
- Point clearly at this word and not at a more common synonym of the same length.
- Clues start with a capital letter and have no full stop.`;
  const answer = await ask(WRITER, prompt, VWrite, '{"items":[{"word":"EXAMPLE","clue":"Short clue here"}]}', 0.9);
  return (answer?.items ?? []).map((it) => ({ word: it.word.trim().toUpperCase(), clue: it.clue.trim().replace(/\.$/, '') }));
}

/**
 * Checks a batch with the checker, then a sample of the passes with the auditor. A word the checker
 * rates for another level moves there when that level still takes words; a clue the checker fixed is
 * checked once more.
 */
async function judgeVocab(level: number, batch: VItem[], persist: () => void): Promise<void> {
  const verdicts = await checkVocab(level, batch);
  if (!verdicts) {
    for (const it of batch) Object.assign(it, { status: 'rejected', reason: 'checker-failed' });
    for (const it of batch) claimed.delete(it.word);
    persist();
    return;
  }
  const passed: VItem[] = [];
  const again: VItem[] = [];
  const moves: [VItem, number][] = [];
  batch.forEach((it, i) => {
    const v = verdicts.find((x) => x.i === i);
    let reason: string | null = null;
    if (!v) reason = 'checker-missing';
    else if (v.offensive) reason = 'offensive';
    else if (v.narrow) reason = 'narrow';
    else if (!v.clueCorrect) reason = 'clue-wrong';
    else if (!v.unambiguous) reason = 'ambiguous';
    else if (!v.clueClear) reason = 'clue-unclear';
    if (v) it.rating = v.level;
    // One more try with the checker's own clue, when it passes the code checks.
    const fixed = v?.betterClue?.trim().replace(/\.$/, '');
    if (reason && fixed && !it.retried && /^(clue|ambiguous)/.test(reason) && !vocabProblem(level, it.word, fixed)) {
      Object.assign(it, { clue: fixed, retried: true, firstClue: it.clue });
      again.push(it);
      return;
    }
    if (!reason && it.origin === 'writer' && !inside(v!.level, window(level))) {
      const to = Math.min(10, Math.max(1, v!.level));
      if (to !== level && room(to) && vocabProblem(to, it.word, it.clue) === null) {
        moves.push([it, to]);
        return;
      }
      reason = `level-${v!.level}`;
    }
    if (reason) Object.assign(it, { status: 'rejected', reason });
    else passed.push(it);
  });
  // Moved words are audited at their new level.
  for (const [it, to] of moves) {
    const from = vocabOf(level).items;
    if (from.includes(it)) from.splice(from.indexOf(it), 1);
    it.movedFrom = level;
    vocabOf(to).items.push(it);
    claimed.set(it.word, to);
  }
  const groups = new Map<number, VItem[]>([[level, passed]]);
  for (const [it, to] of moves) groups.set(to, [...(groups.get(to) ?? []), it]);
  for (const [l, group] of groups) {
    // About one in five passes goes to the auditor (at least one per batch).
    const r = random(`audit:${l}:${group.map((b) => b.word).join()}`);
    const sample = group.filter(() => r() < 0.2);
    if (!sample.length && group.length && l === level) sample.push(group[0]!);
    const audits = sample.length ? await auditVocab(l, sample) : [];
    sample.forEach((it, i) => {
      const a = audits?.find((x) => x.i === i);
      if (a) it.audit = a.ok ? 'ok' : 'wrong';
    });
    for (const it of group) {
      if (it.audit === 'wrong') Object.assign(it, { status: 'rejected', reason: 'audit' });
      else it.status = 'ok';
    }
    if (l !== level) vsave(l);
  }
  for (const it of batch) if (it.status === 'rejected') claimed.delete(it.word);
  persist();
  if (again.length) await judgeVocab(level, again, persist);
}

/** Words an earlier run turned away only for their level, moved to the level the checker gave them. */
function rescue() {
  // The checker failing says nothing about the word: those go back in the queue.
  for (let l = 1; l <= 10; l++)
    for (const it of vocabOf(l).items)
      if (it.status === 'rejected' && /^checker-/.test(it.reason ?? '') && !claimed.has(it.word)) {
        Object.assign(it, { status: 'pending' });
        delete it.reason;
        claimed.set(it.word, l);
      }
  for (let l = 1; l <= 10; l++)
    for (const it of [...vocabOf(l).items]) {
      const to = Number(/^level-(\d+)$/.exec(it.reason ?? '')?.[1] ?? 0);
      if (!to || it.status !== 'rejected' || claimed.has(it.word) || !room(to) || vocabProblem(to, it.word, it.clue)) continue;
      vocabOf(l).items.splice(vocabOf(l).items.indexOf(it), 1);
      Object.assign(it, { status: 'ok', movedFrom: l });
      delete it.reason;
      vocabOf(to).items.push(it);
      claimed.set(it.word, to);
    }
  for (let l = 1; l <= 10; l++) vsave(l);
}

/** The existing 150 words, rated and moved to the level their difficulty says. */
async function relevelExisting() {
  if (existsSync(join(WORK, 'relevel.json'))) return;
  const items: (VItem & { from: number })[] = Object.entries(OLD_VOCAB).flatMap(([l, words]) =>
    words.map((w) => ({ ...w, origin: 'existing' as const, status: 'pending' as const, from: Number(l) })),
  );
  for (const it of items) {
    const problem = vocabProblem(Math.max(9, it.from), it.word, it.clue);
    if (problem) Object.assign(it, { status: 'rejected', reason: problem });
  }
  const pending = items.filter((it) => it.status === 'pending');
  for (let i = 0; i < pending.length; i += 25) {
    const batch = pending.slice(i, i + 25);
    const from = batch[0]!.from;
    await judgeVocab(from, batch, () => undefined);
  }
  // Moved to its rated level (the old five levels ran from A1 to C2).
  const moved: Record<number, VItem[]> = {};
  for (const it of items) {
    const { from, ...item } = it;
    void from;
    const level = it.status === 'ok' ? Math.min(10, Math.max(1, it.rating ?? from)) : from;
    (moved[level] ??= []).push(item);
  }
  for (let l = 1; l <= 10; l++) {
    vocabOf(l).items.push(...(moved[l] ?? []));
    vsave(l);
  }
  save('relevel.json', items);
}

async function vocabLevel(level: number) {
  const file = vocabOf(level);
  const persist = () => vsave(level);
  const ok = () => vok(level);
  // Anything a stopped run left waiting for the checker.
  const waiting = file.items.filter((it) => it.status === 'pending');
  for (let i = 0; i < waiting.length; i += 25) await judgeVocab(level, waiting.slice(i, i + 25), persist);
  while (ok() < VOCAB_TARGET && file.rounds < VOCAB_ROUNDS) {
    file.rounds++;
    const near = [...claimed.entries()].filter(([, l]) => Math.abs(l - level) <= 2).map(([w]) => w);
    const tried = file.items.map((it) => it.word);
    const need = Math.min(60, Math.ceil((VOCAB_TARGET - ok()) * 1.6) + 5);
    // Each round asks for words starting with a few letters, so the writer doesn't offer the same words again.
    const r = random(`letters:${level}:${file.rounds}`);
    const letters = [...'ABCDEFGHIJLMNOPRSTUV'].sort(() => r() - 0.5).slice(0, 3);
    const starts = (w: string) => letters.includes(w[0]!);
    const avoid = [...new Set([...near, ...tried])].filter(starts);
    const written = await writeVocab(level, avoid, need, letters);
    const fresh: VItem[] = [];
    for (const w of written) {
      if (file.items.some((it) => it.word === w.word) || fresh.some((it) => it.word === w.word)) continue;
      const problem = claimed.has(w.word) ? 'duplicate' : vocabProblem(level, w.word, w.clue);
      const item: VItem = { ...w, origin: 'writer', status: problem ? 'rejected' : 'pending', ...(problem && { reason: problem }) };
      if (!problem) claimed.set(w.word, level);
      file.items.push(item);
      if (!problem) fresh.push(item);
    }
    persist();
    const batches: VItem[][] = [];
    for (let i = 0; i < fresh.length; i += 25) batches.push(fresh.slice(i, i + 25));
    await settled(batches.map((b) => judgeVocab(level, b, persist)));
    console.log(`vocab ${level}: round ${file.rounds}, ${ok()} passed ($${money.vultrUsd.toFixed(3)})`);
  }
}

// ─── Sentences ────────────────────────────────────────────────────────────────

const TOPICS = [
  '',
  'presentSimple',
  'pastTense',
  'questions',
  'prepositions',
  'passiveConditionals',
  'presentPerfect',
  'relativeClauses',
  'reportedSpeech',
  'mixedConditionals',
  'inversion',
] as const;
const TOPIC_TEXT: Record<number, string> = {
  1: 'the present simple: be, have, third-person -s, everyday facts and habits',
  2: 'the past simple: regular and irregular verbs, time words (yesterday, last week, ago)',
  3: 'questions: do/does/did questions, wh- questions, questions with be, can and other modals',
  4: 'prepositions of time and place and dependent prepositions (good at, interested in, depend on, since/for, at/on/in)',
  5: 'the passive (present, past, future, with modals) and zero, first and second conditionals',
  6: 'perfect tenses: present perfect simple and continuous versus past simple, past perfect, future perfect; for/since/yet/already/by the time',
  7: 'relative clauses: defining and non-defining, who/whom/whose/which/that/where/when, preposition + whom/which, reduced relative clauses',
  8: 'reported speech: backshift of tenses, reported questions (no question word order), reported commands, reporting verbs with their patterns (deny doing, insist on, accuse of, suggest that, urge to)',
  9: 'third and mixed conditionals, wish/if only with past and past perfect, were to, but for, otherwise, provided that',
  10: 'inversion after negative and limiting adverbials (Never have I, Not only did, Hardly had … when, No sooner had … than, Only after, Little did, Under no circumstances, Seldom, Rarely) and inverted conditionals (Had I known, Should you need, Were it not for)',
};
const SENTENCE_WORDS: [number, number][] = [[0, 0], [4, 7], [5, 8], [4, 9], [6, 10], [7, 12], [9, 14], [10, 16], [11, 17], [12, 18], [12, 20]];

/** Hand-written examples for the new grammar points. */
const EXAMPLES: Record<number, string[]> = {
  6: ['"By the time we arrived at the cinema, the film had already started." — trap "has"', '"She has been learning Japanese since she moved to Osaka." — trap "for"'],
  7: ['"The scientist whose research changed the field has finally retired." — trap "who"', '"The village where my grandmother grew up has no paved roads." — trap "which"'],
  8: ['"She asked me whether I had finished the report the day before." — trap "did"', '"The coach insisted on our training twice a week before the final." — trap "to"'],
  9: ['"If I had accepted the job in Nairobi, I would be living there now." — trap "will"', '"I wish I had listened to my teacher when she warned me about the exam." — trap "have"'],
  10: ['"Not only did she win the race, but she also broke the national record." — trap "won"', '"Had the engineers checked the bridge earlier, the accident would never have happened." — trap "If"'],
};

type SItem = {
  sentence: string;
  trap: string;
  also: string[];
  origin: 'existing' | 'writer';
  status: 'pending' | 'ok' | 'rejected';
  reason?: string;
  audit?: 'ok' | 'wrong';
};
const sentenceFile = (level: number) => `sentences-${level}.json`;
const wordsOf = (sentence: string) => sentence.replace(/[.?]$/, '').replace(/,/g, '').split(' ');
const norm = (sentence: string) => sentence.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
const sameBag = (a: string[], b: string[]) => a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|');

function sentenceProblem(level: number, s: SItem, seen: Set<string>): string | null {
  if (!/^[A-Z0-9][A-Za-z0-9',\- ]*[A-Za-z0-9'][.?]$/.test(s.sentence) || / {2}| ,|,,|,$/.test(s.sentence)) return 'format';
  const words = wordsOf(s.sentence);
  const [lo, hi] = SENTENCE_WORDS[level]!;
  if (words.length < lo || words.length > hi) return 'length';
  if (!/^[A-Za-z']+$/.test(s.trap)) return 'trap-form';
  if (words.some((w) => w.toLowerCase() === s.trap.toLowerCase())) return 'trap-in-sentence';
  if (blockedIn(s.sentence)) return 'blocked';
  if (words.some((w) => w.length > 4 && americanSpelling(w.replace(/'.*$/, '')))) return 'american';
  if (seen.has(norm(s.sentence))) return 'duplicate';
  return null;
}

const SWrite = z.object({ items: z.array(z.object({ sentence: z.string(), trap: z.string() })) });
async function writeSentences(level: number, examples: string[], avoid: string[], n: number) {
  const [lo, hi] = SENTENCE_WORDS[level]!;
  const prompt = `You write sentences for "Sentence Master", an English grammar game for learners worldwide (secondary school to adults). The player gets the sentence's words shuffled, plus one extra TRAP word, and must build the sentence, leaving the trap out.

Level ${level} of 10 (${NAMES[level]}). Grammar point: ${TOPIC_TEXT[level]}.
Write ${n} NEW sentences. Rules:
- Each sentence ${lo} to ${hi} words long, correct standard British English, natural, and clearly about the grammar point. ${level >= 6 ? 'Make them demanding: longer sentences, richer vocabulary, and traps that test fine distinctions.' : ''}
- The TRAP is one word that a learner might wrongly use instead of one of the sentence's words because of the grammar point (wrong tense, wrong form, wrong preposition, wrong relative pronoun, wrong auxiliary…). It must make the sentence wrong wherever it is put, must not be in the sentence, and is written with a capital letter only if it would start the sentence.
- Only ONE word order may be correct: avoid adverbs or phrases that could move to another place.
- Punctuation: only commas inside, and a full stop or question mark at the end. No quotation marks, colons, semicolons, brackets, dashes or exclamation marks. Contractions are fine (don't, I'd).
- Varied, neutral topics from around the world (study, work, science, travel, sport, nature, history, daily life); names from many cultures. Nothing violent, sexual, political or religious.
Examples of the style (sentence, trap):
${examples.join('\n')}
Do not repeat these sentences: ${avoid.slice(-60).join(' | ') || '(none)'}`;
  const answer = await ask(WRITER, prompt, SWrite, '{"items":[{"sentence":"The sentence here.","trap":"word"}]}', 0.9);
  return (answer?.items ?? []).map((it) => ({ sentence: it.sentence.trim().replace(/[’‘]/g, "'"), trap: it.trap.trim().replace(/[’‘]/g, "'") }));
}

const SCheck = z.object({
  items: z.array(
    z.object({
      i: z.number().int(),
      why: z.string().nullish(),
      correct: z.boolean(),
      natural: z.boolean(),
      onTopic: z.boolean(),
      trapWrong: z.boolean(),
      otherOrders: z.array(z.string()),
      suitable: z.boolean(),
      note: z.string().nullish(),
    }),
  ),
});
async function checkSentences(level: number, items: SItem[]) {
  const list = items.map((it, i) => `${i}. "${it.sentence}" — trap: "${it.trap}"`).join('\n');
  const prompt = `You check items for an English grammar game. The player gets the words of a sentence shuffled (commas and the end mark are not on the tiles) plus one extra trap word, and must build the sentence without the trap.
Level ${level} of 10; grammar point: ${TOPIC_TEXT[level]}.
For each item:
- correct: the sentence is grammatically correct standard British English with correct spelling.
- natural: a fluent speaker would say or write it; it makes sense.
- onTopic: it practises the grammar point.
- trapWrong: there is NO correct English sentence using the trap together with all but one of the sentence's words (the trap cannot replace any word correctly).
- otherOrders: every OTHER correct and natural ordering of exactly the sentence's words (same words, no trap), written as full sentences with punctuation; [] if there is none. Think about adverbs and phrases that can move.
- suitable: neutral and fine for learners worldwide (no violence, sex, politics, religion, stereotypes, or anything only one country would understand).

${list}`;
  const answer = await ask(CHECKER, prompt, SCheck, '{"items":[{"i":0,"why":"one or two sentences: try the trap in each likely slot, and look for other word orders","correct":true,"natural":true,"onTopic":true,"trapWrong":true,"otherOrders":[],"suitable":true,"note":"short reason when anything is false"}]}', 0.1);
  return answer?.items ?? null;
}

async function auditSentences(level: number, items: SItem[]) {
  const list = items.map((it, i) => `${i}. "${it.sentence}" — trap: "${it.trap}" — also accepted: ${it.also.length ? it.also.map((a) => `"${a}"`).join(', ') : 'none'}`).join('\n');
  const prompt = `You audit a British English grammar game (level ${level} of 10; grammar point: ${TOPIC_TEXT[level]}). The player orders the shuffled words of the sentence and must leave out the trap word. Mark ok=false when the sentence has any error, the trap could also make a correct sentence, an accepted order is wrong, an obvious correct order is missing, or the sentence is not suitable for learners worldwide.

${list}`;
  const answer = await ask(AUDITOR, prompt, Audit, AUDIT_SHAPE, 0.1);
  return answer?.items ?? null;
}

async function judgeSentences(level: number, batch: SItem[], persist: () => void) {
  const verdicts = await checkSentences(level, batch);
  const passed: SItem[] = [];
  batch.forEach((it, i) => {
    const v = verdicts?.find((x) => x.i === i);
    let reason: string | null = null;
    if (!v) reason = 'checker-missing';
    else if (!v.suitable) reason = 'unsuitable';
    else if (!v.correct) reason = 'incorrect';
    else if (!v.natural) reason = 'unnatural';
    else if (!v.trapWrong) reason = 'trap-also-right';
    else if (!v.onTopic && it.origin === 'writer') reason = 'off-topic';
    if (!reason && v) {
      const words = wordsOf(it.sentence);
      const orders = [...new Set(v.otherOrders.map((o) => o.trim()))].filter((o) => norm(o) !== norm(it.sentence));
      // Only true reorderings count (a checker sometimes rewrites the sentence instead).
      const real = orders.filter((o) => sameBag(wordsOf(o.replace(/[.?!]$/, '.')), words)).map((o) => o.replace(/[.?!]$/, '') + it.sentence.slice(-1));
      const also = [...new Set([...it.also, ...real])];
      if (also.length > 2) reason = 'many-orders';
      else it.also = also;
    }
    if (reason) Object.assign(it, { status: 'rejected', reason });
    else passed.push(it);
  });
  const r = random(`saudit:${level}:${batch.map((b) => b.sentence).join()}`);
  const sample = passed.filter(() => r() < 0.25);
  if (!sample.length && passed.length) sample.push(passed[0]!);
  const audits = sample.length ? await auditSentences(level, sample) : [];
  sample.forEach((it, i) => {
    const a = audits?.find((x) => x.i === i);
    if (a) it.audit = a.ok ? 'ok' : 'wrong';
  });
  for (const it of passed) {
    if (it.audit === 'wrong') Object.assign(it, { status: 'rejected', reason: 'audit' });
    else it.status = 'ok';
  }
  persist();
}

async function sentenceLevel(level: number, seen: Set<string>) {
  const file = read<{ items: SItem[]; rounds: number }>(sentenceFile(level), { items: [], rounds: 0 });
  const persist = () => save(sentenceFile(level), file);
  if (!file.rounds && !file.items.length && OLD_SENTENCES[level]) {
    for (const s of OLD_SENTENCES[level].sentences) {
      const sentence = s.text ?? `${s.words.join(' ')}${s.end}`;
      file.items.push({ sentence, trap: s.trap, also: (s.also ?? []).map((a) => `${a.join(' ')}${s.end}`), origin: 'existing', status: 'pending' });
    }
    // The old sentences are checked like new ones, but their length is kept as it was.
    persist();
  }
  for (const it of file.items)
    if (it.status === 'rejected' && /^checker-/.test(it.reason ?? '')) {
      it.status = 'pending';
      delete it.reason;
    }
  for (const it of file.items) if (it.status !== 'rejected') seen.add(norm(it.sentence));
  const ok = () => file.items.filter((it) => it.status === 'ok').length;
  const waiting = file.items.filter((it) => it.status === 'pending');
  for (let i = 0; i < waiting.length; i += 10) await judgeSentences(level, waiting.slice(i, i + 10), persist);
  const examples = [
    ...(OLD_SENTENCES[level]?.sentences ?? []).slice(0, 4).map((s) => `"${s.text ?? `${s.words.join(' ')}${s.end}`}" — trap "${s.trap}"`),
    ...(EXAMPLES[level] ?? []),
  ];
  while (ok() < SENTENCE_TARGET && file.rounds < 10) {
    file.rounds++;
    const need = Math.min(24, Math.ceil((SENTENCE_TARGET - ok()) * 1.5) + 3);
    const written = await writeSentences(level, examples, file.items.map((it) => it.sentence), need);
    const fresh: SItem[] = [];
    for (const w of written) {
      const item: SItem = { ...w, also: [], origin: 'writer', status: 'pending' };
      const problem = sentenceProblem(level, item, seen);
      seen.add(norm(item.sentence));
      if (problem) Object.assign(item, { status: 'rejected', reason: problem });
      else fresh.push(item);
      file.items.push(item);
    }
    persist();
    for (let i = 0; i < fresh.length; i += 10) await judgeSentences(level, fresh.slice(i, i + 10), persist);
    console.log(`sentences ${level}: round ${file.rounds}, ${ok()} passed ($${money.vultrUsd.toFixed(3)})`);
  }
}

// ─── Word Hunter themes ───────────────────────────────────────────────────────

type HWord = { w: string; status: 'pending' | 'ok' | 'rejected'; reason?: string; rating?: number };
type HTheme = { id: string; title: string; origin: 'existing' | 'writer'; status: 'pending' | 'ok' | 'rejected'; reason?: string; words: HWord[]; audited?: boolean };
const huntFile = (level: number) => `hunts-${level}.json`;
const huntsOf = (level: number) => read<{ themes: HTheme[]; rounds: number }>(huntFile(level), { themes: [], rounds: 0 });
const OLD_TITLES: Record<string, string> = {
  space: 'Space',
  animals: 'Animals',
  fruits: 'Fruits',
  school: 'School',
  weather: 'Weather',
  body: 'The body',
  jobs: 'Jobs',
  kitchen: 'Kitchen',
  sports: 'Sports',
  colours: 'Colours',
  computers: 'Computers',
  farm: 'Farm',
  music: 'Music',
  ocean: 'Ocean',
  transport: 'Transport',
  feelings: 'Feelings',
};
const themeIds = new Set<string>();

function huntWordProblem(level: number, w: string, theme: HTheme) {
  if (!/^[A-Z]+$/.test(w)) return 'format';
  if (w.length < 3 || w.length > GRID[level]!) return 'length';
  if (blocked(w)) return 'blocked';
  if (!inDictionary(w)) return 'dictionary';
  if (americanSpelling(w)) return 'american';
  if (theme.words.some((x) => x.w === w)) return 'duplicate';
  return null;
}

const HPropose = z.object({ themes: z.array(z.object({ id: z.string(), title: z.string() })) });
const HFill = z.object({ themes: z.array(z.object({ id: z.string(), words: z.array(z.string()) })) });

async function proposeThemes(level: number, n: number, avoid: string[]) {
  const prompt = `You plan "Word Hunter", a word-search game for English learners worldwide (secondary school to adults). Each puzzle has a theme and hides about 8 theme words in a letter grid.

${LADDER}

Propose ${n} NEW themes for level ${level} (${NAMES[level]}). ${level <= 3 ? 'Everyday topics a beginner knows.' : level <= 6 ? 'Broader topics from school subjects, work, society, science, the arts and nature.' : 'Specialised topics whose vocabulary is hard at this level: academic fields, crafts, sciences, the arts, rhetoric, law, architecture, natural history, and so on.'} Each theme must have at least 14 real single words at level ${level} difficulty of 3 to ${GRID[level]} letters. Themes must be neutral and global (no single country, no religion, politics, violence or sex).
id: short lower-case kebab-case (e.g. "deep-sea", "rhetoric"); title: a short English title (e.g. "The deep sea").
Do not use these themes again: ${avoid.join(', ')}`;
  const answer = await ask(WRITER, prompt, HPropose, '{"themes":[{"id":"deep-sea","title":"The deep sea"}]}', 0.9);
  return answer?.themes ?? [];
}

async function fillThemes(level: number, themes: HTheme[]) {
  const list = themes.map((t) => `- id "${t.id}", title "${t.title}"${t.words.length ? `; already has: ${t.words.map((w) => w.w).join(', ')}` : ''}`).join('\n');
  const prompt = `You write word lists for "Word Hunter", a word-search game for English learners worldwide.

${LADDER}

For each theme below, give 16 NEW words that clearly belong to the theme, for level ${level} (${NAMES[level]}): ${level === 1 ? 'very easy everyday words' : level <= 3 ? 'easy words, mostly at or near this level' : `words at about level ${level} difficulty (a few one or two levels easier are fine)`}.
Rules: single real English words, letters only, 3 to ${GRID[level]} letters, British spelling, no proper nouns, no words that only one country uses, nothing offensive, no word that contains another word of the same list (not both STAR and STARFISH).
${list}`;
  const answer = await ask(WRITER, prompt, HFill, '{"themes":[{"id":"deep-sea","words":["SQUID","ANGLERFISH"]}]}', 0.8);
  return answer?.themes ?? [];
}

const HCheck = z.object({
  themes: z.array(
    z.object({
      id: z.string(),
      suitable: z.boolean(),
      words: z.array(z.object({ w: z.string(), fits: z.boolean(), level: z.number().int().min(1).max(10), offensive: z.boolean() })),
    }),
  ),
});
async function checkThemes(level: number, themes: HTheme[]) {
  const list = themes.map((t) => `- "${t.id}" (${t.title}): ${t.words.filter((w) => w.status === 'pending').map((w) => w.w).join(', ')}`).join('\n');
  const prompt = `You check themed word lists for a word-search game for English learners worldwide (level ${level} of the ladder below).

${LADDER}

For each theme: suitable = the theme is neutral and makes sense to learners worldwide (no single country, religion, politics, violence or sex).
For each word: fits = it is a real English word that clearly belongs to the theme (a learner would agree); level = how hard the word is on the 1–10 ladder (judge honestly); offensive = vulgar, a slur or hurtful.

${list}`;
  const answer = await ask(
    CHECKER,
    prompt,
    HCheck,
    '{"themes":[{"id":"deep-sea","suitable":true,"words":[{"w":"SQUID","fits":true,"level":3,"offensive":false}]}]}',
    0.1,
  );
  return answer?.themes ?? null;
}

async function auditTheme(level: number, t: HTheme) {
  const ok = t.words.filter((w) => w.status === 'ok');
  const prompt = `You audit a word-search theme for English learners worldwide (level ${level} of 10). Theme: "${t.title}". For each word, ok=false if it is not a real English word, does not clearly belong to the theme, or is offensive.

${ok.map((w, i) => `${i}. ${w.w}`).join('\n')}`;
  const answer = await ask(AUDITOR, prompt, Audit, AUDIT_SHAPE, 0.1);
  answer?.items.forEach((a) => {
    const w = ok[a.i];
    if (w && !a.ok) Object.assign(w, { status: 'rejected', reason: 'audit' });
  });
}

function settleTheme(t: HTheme) {
  // A word inside another word of the theme would be found twice: keep the longer one.
  const ok = t.words.filter((w) => w.status === 'ok');
  for (const w of ok) if (ok.some((x) => x !== w && x.status === 'ok' && x.w.includes(w.w))) Object.assign(w, { status: 'rejected', reason: 'inside-another' });
  const n = t.words.filter((w) => w.status === 'ok').length;
  if (t.status !== 'rejected') t.status = n >= 10 ? 'ok' : 'pending';
}

async function huntLevel(level: number) {
  const file = huntsOf(level);
  const persist = () => save(huntFile(level), file);
  if (level === 1 && !file.themes.length) {
    for (const t of HUNT_THEMES) {
      const theme: HTheme = { id: t.id, title: OLD_TITLES[t.id] ?? t.id, origin: 'existing', status: 'pending', words: [] };
      for (const w of t.words) {
        const problem = huntWordProblem(level, w, theme);
        theme.words.push({ w, status: problem ? 'rejected' : 'pending', ...(problem && { reason: problem }) });
      }
      file.themes.push(theme);
    }
    persist();
  }
  const okThemes = () => file.themes.filter((t) => t.status === 'ok').length;
  while (okThemes() < THEME_TARGET && file.rounds < HUNT_ROUNDS) {
    file.rounds++;
    const open = file.themes.filter((t) => t.status === 'pending');
    const want = THEME_TARGET - okThemes() - open.length;
    if (want > 0) {
      const proposed = await proposeThemes(level, Math.min(40, Math.ceil(want * 1.3) + 2), [...themeIds]);
      for (const p of proposed) {
        const id = p.id.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        if (!id || themeIds.has(id) || blockedIn(p.title)) continue;
        themeIds.add(id);
        file.themes.push({ id, title: p.title.trim(), origin: 'writer', status: 'pending', words: [] });
      }
      persist();
    }
    // Fill, check and audit the open themes six at a time.
    const todo = file.themes.filter((t) => t.status === 'pending');
    const groups: HTheme[][] = [];
    for (let i = 0; i < todo.length; i += 6) groups.push(todo.slice(i, i + 6));
    await settled(
      groups.map(async (group) => {
        const filled = await fillThemes(level, group);
        for (const f of filled) {
          const t = group.find((g) => g.id === f.id);
          if (!t) continue;
          for (const raw of f.words) {
            const w = raw.trim().toUpperCase();
            const problem = huntWordProblem(level, w, t);
            if (problem === 'duplicate') continue;
            t.words.push({ w, status: problem ? 'rejected' : 'pending', ...(problem && { reason: problem }) });
          }
        }
        persist();
        const verdicts = await checkThemes(level, group);
        for (const t of group) {
          const v = verdicts?.find((x) => x.id === t.id);
          if (v && !v.suitable) Object.assign(t, { status: 'rejected', reason: 'unsuitable' });
          for (const w of t.words.filter((x) => x.status === 'pending')) {
            const vw = v?.words.find((x) => x.w.toUpperCase() === w.w);
            if (!vw) continue; // Asked again with the next round.
            w.rating = vw.level;
            const reason = vw.offensive ? 'offensive' : !vw.fits ? 'off-theme' : !inside(vw.level, huntWindow(level)) ? `level-${vw.level}` : null;
            Object.assign(w, reason ? { status: 'rejected', reason } : { status: 'ok' });
          }
          settleTheme(t);
          // A quarter of the finished themes get a second look.
          if (t.status === 'ok' && !t.audited && random(`haudit:${level}:${t.id}`)() < 0.25) {
            t.audited = true;
            await auditTheme(level, t);
            settleTheme(t);
          }
        }
        persist();
      }),
    );
    // A theme that stayed short after three fills is dropped.
    for (const t of file.themes) if (t.status === 'pending' && t.words.length >= 40) Object.assign(t, { status: 'rejected', reason: 'too-few-words' });
    persist();
    console.log(`hunts ${level}: round ${file.rounds}, ${okThemes()} themes ($${money.vultrUsd.toFixed(3)})`);
  }
}

// ─── Writing the data files ───────────────────────────────────────────────────

const q = (text: string) => `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

function build() {
  // Vocabulary: every passed word, once, at the level that passed it.
  const seen = new Set<string>();
  const vocabLines: string[] = [];
  for (let l = 1; l <= 10; l++) {
    const items = vocabOf(l)
      .items.filter((it) => it.status === 'ok' && !seen.has(it.word))
      .sort((a, b) => a.word.localeCompare(b.word));
    items.forEach((it) => seen.add(it.word));
    vocabLines.push(`  ${l}: [`, ...items.map((it) => `    { word: ${q(it.word)}, clue: ${q(it.clue)}, difficulty: ${it.rating} },`), '  ],');
    if (items.length < 150) console.warn(`vocab level ${l}: only ${items.length} words`);
  }
  writeFileSync(
    join(DATA, 'vocab.ts'),
    `/**
 * Vocabulary for Hidden Letters and Spellcaster (and Word Clash's racks), in British English, on the
 * ten-level ladder: 1 Starter (CEFR A1), 2 Beginner (A1–A2), 3 Elementary (A2), 4 Intermediate (B1),
 * 5 Upper-intermediate (B2), 6 Advanced (C1), 7 Proficient (C2), 8 Expert (rare academic words),
 * 9 Master (GRE and specialist words), 10 Super hard (very rare but real words).
 *
 * Written by scripts/word-games-content.ts: an AI writer, a second model checking every clue and rating
 * every word's difficulty, and a third auditing a sample. \`difficulty\` is that checker's rating on the
 * ladder (1–10). Clues never contain the word or a form of it, every word is in the dictionary and no
 * word is on two levels (all checked in test/english-content.test.ts). Edit by hand freely; the script's
 * build stage rewrites this file from its work folder, so rerun it only to regenerate.
 */
export type VocabWord = { word: string; clue: string; difficulty?: number };

export const VOCAB: Record<number, VocabWord[]> = {
${vocabLines.join('\n')}
};

export const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
`,
  );

  // Sentences.
  const sentenceBlocks: string[] = [];
  for (let l = 1; l <= 10; l++) {
    const items = read<{ items: SItem[] }>(sentenceFile(l), { items: [] }).items.filter((it) => it.status === 'ok');
    if (items.length < 30) console.warn(`sentences level ${l}: only ${items.length}`);
    const lines = items.map((it) => {
      const also = it.also.map((a) => `[${wordsOf(a).map(q).join(', ')}]`);
      return `      s(${q(it.sentence)}, ${q(it.trap)}${also.length ? `, { also: [${also.join(', ')}] }` : ''}),`;
    });
    sentenceBlocks.push(`  ${l}: {\n    topic: '${TOPICS[l]}',\n    sentences: [\n${lines.join('\n')}\n    ],\n  },`);
  }
  writeFileSync(
    join(DATA, 'sentences.ts'),
    `/**
 * Sentences for Sentence Master: one grammar point per level, from the present simple (level 1) to
 * inversion (level 10), with longer sentences and subtler traps as the levels rise. Each sentence has a
 * "trap" word, the mistake learners often make (for example "visits" in a past-tense sentence), mixed in
 * with the right words. \`also\` lists other correct word orders; \`text\` is the sentence with its
 * punctuation when that isn't just the words plus the final mark. Written and checked by
 * scripts/word-games-content.ts (the first five levels keep the original hand-written sentences).
 */
export type GrammarTopic =
  | 'presentSimple'
  | 'pastTense'
  | 'questions'
  | 'prepositions'
  | 'passiveConditionals'
  | 'presentPerfect'
  | 'relativeClauses'
  | 'reportedSpeech'
  | 'mixedConditionals'
  | 'inversion';

export type Sentence = { words: string[]; trap: string; end: '.' | '?'; also?: string[][]; text?: string };

const s = (sentence: string, trap: string, extra: Partial<Sentence> = {}): Sentence => {
  const end = sentence.endsWith('?') ? '?' : '.';
  const words = sentence.replace(/[.?]$/, '').replace(/,/g, '').split(' ');
  return { words, trap, end, ...(sentence.includes(',') && { text: sentence }), ...extra };
};

export const SENTENCES: Record<number, { topic: GrammarTopic; sentences: Sentence[] }> = {
${sentenceBlocks.join('\n')}
};
`,
  );

  // Word Hunter.
  const old = readFileSync(join(DATA, 'hunts.ts'), 'utf8');
  const legacy = old.slice(old.indexOf('export const HUNT_THEMES'), old.indexOf('];', old.indexOf('export const HUNT_THEMES')) + 2);
  const huntBlocks: string[] = [];
  for (let l = 1; l <= 10; l++) {
    const themes = huntsOf(l).themes.filter((t) => t.status === 'ok');
    if (themes.length < 48) console.warn(`hunts level ${l}: only ${themes.length} themes`);
    const lines = themes.map((t) => {
      const words = t.words.filter((w) => w.status === 'ok').map((w) => w.w);
      return `    { id: ${q(t.id)}, title: ${q(t.title)}, words: [${words.map(q).join(', ')}] },`;
    });
    huntBlocks.push(`  ${l}: [\n${lines.join('\n')}\n  ],`);
  }
  writeFileSync(
    join(DATA, 'hunts.ts'),
    `/**
 * Word Hunter themes. Each puzzle picks a theme and the words that fit the level's grid. Theme names
 * are shown through the app's translations (world:english.themes.<id>); the words stay in English.
 *
 * HUNT_THEMES is the original set of 16 themes. HUNTS holds the themes of each level of the ten-level
 * ladder, each with an English \`title\` (for themes the app has no translation for yet): words grow
 * harder with the level and fit its grid (6, 7, 7, 8, 8, 9, 9, 10, 10 and 11 letters wide). Written
 * and checked by scripts/word-games-content.ts.
 */
export type HuntTheme = { id: string; title: string; words: string[] };

${legacy}

export const HUNTS: Record<number, HuntTheme[]> = {
${huntBlocks.join('\n')}
};
`,
  );
  console.log('Wrote vocab.ts, sentences.ts and hunts.ts');
}

function stats() {
  const tally = (reasons: (string | undefined)[]) => {
    const c: Record<string, number> = {};
    for (const r of reasons) c[r ?? '?'] = (c[r ?? '?'] ?? 0) + 1;
    return Object.entries(c)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ${v}`)
      .join(', ');
  };
  const all = { v: [] as VItem[], s: [] as SItem[], h: [] as HWord[], t: [] as HTheme[] };
  for (let l = 1; l <= 10; l++) {
    const v = vocabOf(l).items;
    const s = read<{ items: SItem[] }>(sentenceFile(l), { items: [] }).items;
    const t = huntsOf(l).themes;
    all.v.push(...v);
    all.s.push(...s);
    all.t.push(...t);
    all.h.push(...t.flatMap((x) => x.words));
    const ok = v.filter((x) => x.status === 'ok');
    const avg = ok.reduce((a, x) => a + (x.rating ?? 0), 0) / (ok.length || 1);
    console.log(
      `L${l}: vocab ${ok.length}/${v.length} (avg rating ${avg.toFixed(2)}, avg length ${(ok.reduce((a, x) => a + x.word.length, 0) / (ok.length || 1)).toFixed(1)}), sentences ${s.filter((x) => x.status === 'ok').length}/${s.length}, themes ${t.filter((x) => x.status === 'ok').length}/${t.length}`,
    );
  }
  console.log(`vocab rejected (${all.v.filter((x) => x.status === 'rejected').length}/${all.v.length}): ${tally(all.v.filter((x) => x.status === 'rejected').map((x) => x.reason?.replace(/^level-\d+$/, 'level')))}`);
  console.log(`vocab audited ${all.v.filter((x) => x.audit).length}, audit failed ${all.v.filter((x) => x.audit === 'wrong').length}`);
  console.log(`sentences rejected (${all.s.filter((x) => x.status === 'rejected').length}/${all.s.length}): ${tally(all.s.filter((x) => x.status === 'rejected').map((x) => x.reason))}`);
  console.log(`sentences audited ${all.s.filter((x) => x.audit).length}, audit failed ${all.s.filter((x) => x.audit === 'wrong').length}`);
  console.log(`hunt words rejected (${all.h.filter((x) => x.status === 'rejected').length}/${all.h.length}): ${tally(all.h.filter((x) => x.status === 'rejected').map((x) => x.reason?.replace(/^level-\d+$/, 'level')))}`);
  console.log(`themes rejected: ${tally(all.t.filter((x) => x.status === 'rejected').map((x) => x.reason))}; audited ${all.t.filter((x) => x.audited).length}`);
  console.log(`spent $${ledger().vultrUsd.toFixed(4)} in ${ledger().calls} calls`, ledger().byModel);
}

// ─── Run ──────────────────────────────────────────────────────────────────────

async function main() {
  const generating = STAGES.some((s) => s === 'vocab' || s === 'sentences' || s === 'hunts');
  if (generating && !vultrConfigured()) throw new Error('not-configured: set VULTR_INFERENCE_API_KEY in apps/server/.env');
  console.log(`Budget $${BUDGET}, spent so far $${money.vultrUsd.toFixed(4)}`);
  try {
    // The three kinds of content are made side by side; each model's queue keeps Vultr's limits.
    const jobs: Promise<unknown>[] = [];
    if (STAGES.includes('vocab'))
      jobs.push(
        (async () => {
          await relevelExisting();
          loadClaims();
          rescue();
          await settled(LEVELS.map((l) => vocabLevel(l)));
        })(),
      );
    if (STAGES.includes('sentences')) {
      const seen = new Set<string>();
      jobs.push(settled(LEVELS.map((l) => sentenceLevel(l, seen))));
    }
    if (STAGES.includes('hunts')) {
      for (const id of Object.keys(OLD_TITLES)) themeIds.add(id);
      for (let l = 1; l <= 10; l++) for (const t of huntsOf(l).themes) themeIds.add(t.id);
      jobs.push(settled(LEVELS.map((l) => huntLevel(l))));
    }
    await settled(jobs);
  } catch (e) {
    if (!(e instanceof OutOfMoney)) throw e;
    console.warn(`Stopped at the budget ($${money.vultrUsd.toFixed(4)} of $${BUDGET}); a rerun with a higher --budget carries on.`);
  }
  money = ledger();
  if (STAGES.includes('build')) build();
  if (STAGES.includes('stats')) stats();
}

await main();
