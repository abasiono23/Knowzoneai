/**
 * Writes the graded question content of the Space Academy and Tech Hub games for the ten-level ladder,
 * with open models on Vultr Serverless Inference (like scripts/word-games-content.ts):
 *
 *   - a writer (deepseek-v4.1-flash-1017) proposes Galaxy Defender science questions, Solar System
 *     Explorer questions about each place, and Cyber Defender cases (messages, passwords, situations,
 *     attacks, logs and code to judge);
 *   - a checker (qwen3.8-27b), a different model, solves every item without being told the answer and
 *     rates its level; an item passes only when the checker finds the same single right answer, the
 *     wrong options are really wrong, and the level is right;
 *   - an auditor (glm-5.3-flash), a third model, reads a sample of what the checker passed.
 *
 * Code checks each item first (four or five different options, lengths, no real brands or people, no
 * repeats). The physics calculations, binary, logic circuits and programs of the other games are made
 * and checked in code, not here. Candidates and verdicts are kept in .space-tech/ as they're made, so a
 * stopped run carries on. Money is counted in .space-tech/spend.json across runs; --budget is the most
 * ever spent (default $3). Run from apps/server:
 *
 *   npx tsx scripts/space-tech-content.ts                         # everything, then writes the data files
 *   npx tsx scripts/space-tech-content.ts --stages cyber --levels 9,10
 *   npx tsx scripts/space-tech-content.ts --stages build          # only rewrite the data files
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { z } from 'zod';

import { config } from '../src/config.js';
import { DESTINATIONS } from '../src/data/space/planets.js';
import { QUESTIONS } from '../src/data/space/questions.js';
import { CYBER } from '../src/data/tech/cyber.js';
import { random } from '../src/services/games/english.js';
import { parseModelJson, vultrConfigured, vultrCost, type VultrUsage } from '../src/services/vultr.js';

const VULTR_BASE = 'https://api.vultrinference.com/v1';

const args = process.argv.slice(2);
const flag = (name: string) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined);
const LEVELS = (flag('levels') ?? '1,2,3,4,5,6,7,8,9,10').split(',').map(Number);
const STAGES = (flag('stages') ?? 'defender,explorer,cyber,build').split(',');
const BUDGET = Number(flag('budget') ?? 3);
const CALLS = Number(flag('calls') ?? 6);
const WRITER = 'deepseek-v4.1-flash-1017';
const CHECKER = 'qwen3.8-27b';
const AUDITOR = 'glm-5.3-flash';

const WORK = resolve(import.meta.dirname, '../.space-tech');
const SPACE_DATA = resolve(import.meta.dirname, '../src/data/space');
const TECH_DATA = resolve(import.meta.dirname, '../src/data/tech');
mkdirSync(WORK, { recursive: true });
const SPEND = join(WORK, 'spend.json');

// ─── Money and calls (as in word-games-content.ts) ────────────────────────────

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
const RESERVE = 0.15;
const canSpend = () => money.vultrUsd < BUDGET - RESERVE;

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
async function settled(jobs: Promise<unknown>[]) {
  const results = await Promise.allSettled(jobs);
  const failed = results.find((r) => r.status === 'rejected');
  if (failed) throw (failed as PromiseRejectedResult).reason;
}
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

function note(model: string, prompt: string, usage: VultrUsage | undefined, usd: number, attempts: number, error?: string) {
  const line = { at: new Date().toISOString(), model, task: prompt.slice(0, 60), ...usage, usd: Math.round(usd * 1e6) / 1e6, attempts, ...(error && { error }) };
  appendFileSync(join(WORK, 'calls.jsonl'), `${JSON.stringify(line)}\n`);
}

type Completion = { choices?: { message?: { content?: string }; finish_reason?: string }[]; usage?: { prompt_tokens?: number; completion_tokens?: number } };
/** One JSON request with the model's thinking turned off (see word-games-content.ts for why). */
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

const read = <T>(file: string, fallback: T): T => (existsSync(join(WORK, file)) ? (JSON.parse(readFileSync(join(WORK, file), 'utf8')) as T) : fallback);
const save = (file: string, data: unknown) => writeFileSync(join(WORK, file), JSON.stringify(data, null, 1));

// ─── The ladder ───────────────────────────────────────────────────────────────

const NAMES = ['', 'Starter', 'Beginner', 'Elementary', 'Intermediate', 'Upper-intermediate', 'Advanced', 'Proficient', 'Expert', 'Master', 'Super hard'];
const LADDER = `The Knowzone game ladder (10 levels, learners worldwide from secondary school to master's students and adults):
1 Starter, 2 Beginner, 3 Elementary: early secondary school (ages 11–14).
4 Intermediate, 5 Upper-intermediate: senior secondary school exams (WAEC/NECO, GCSE, IGCSE, SAT).
6 Advanced, 7 Proficient: A-level, AP, IB Higher and first-year university.
8 Expert, 9 Master: upper undergraduate (years 2–4 of a degree in the subject).
10 Super hard: postgraduate or olympiad level; only a specialist gets it right.`;

const PHYSICS: Record<number, string> = {
  1: 'the Solar System, day and night, gravity as a pull, simple forces, SI units.',
  2: 'speed, energy types and transfers, mass vs weight, light and sound basics.',
  3: 'Newton’s three laws, friction, pressure, simple machines, the Moon’s phases, eclipses.',
  4: 'momentum, work, power, waves, the electromagnetic spectrum, electricity basics, the life of a star in outline.',
  5: 'exam physics: circular motion, satellites, energy conservation, refraction, radioactivity, the Big Bang evidence in outline.',
  6: 'A-level: gravitational fields and potential, Kepler’s laws, circular orbits, simple harmonic motion, black-body radiation, stellar spectra, the Doppler effect.',
  7: 'A-level/AP/first-year: escape speed, orbital energy, the Hertzsprung–Russell diagram, stellar evolution, special relativity basics, nuclear fusion in stars, cosmological redshift.',
  8: 'upper undergraduate: Lagrange points, tidal forces and locking, the vis-viva equation, Hohmann and gravity-assist manoeuvres, the proton–proton chain and CNO cycle, radiative vs convective transport, degeneracy pressure.',
  9: 'upper undergraduate: cosmology (Friedmann equations, CMB anisotropies, dark matter evidence, inflation), general relativity tests, neutron stars and pulsars, exoplanet detection methods, spectroscopy and line broadening.',
  10: 'postgraduate/olympiad: the Chandrasekhar and Tolman–Oppenheimer–Volkoff limits, the virial theorem, Jeans instability, the Eddington limit, synchrotron radiation, the Kozai–Lidov mechanism, gravitational-wave astronomy, nucleosynthesis details.',
};

// ─── Shared item checks ───────────────────────────────────────────────────────

/** Made-up brands only: these real ones may not appear in Cyber Defender. */
const REAL_BRANDS = /\b(google|gmail|microsoft|apple|icloud|amazon|paypal|facebook|meta|instagram|whatsapp|netflix|tiktok|twitter|linkedin|youtube|mtn|airtel|glo|jumia|opay|gtbank|access bank|zenith|first bank|uba|safaricom|m-pesa|visa|mastercard)\b/i;

type Choice = { q: string; answer: string; wrong: string[] };
/** The code checks every multiple-choice item passes: the reason it fails, or null. */
function choiceProblem(x: Choice, wrongCount: number): string | null {
  if (x.q.length < 12 || x.q.length > 420) return 'q-length';
  if (x.wrong.length !== wrongCount) return 'wrong-count';
  const all = [x.answer, ...x.wrong].map((s) => s.trim().toLowerCase());
  if (new Set(all).size !== all.length) return 'repeat-option';
  if ([x.answer, ...x.wrong].some((o) => !o.trim() || o.length > 110)) return 'option-length';
  if ([x.answer, ...x.wrong].some((o) => /all of the above|none of the above|both a and b/i.test(o))) return 'above';
  // The answer shouldn't stand out by being much longer than every wrong option.
  if (x.answer.length > 2.2 * Math.max(...x.wrong.map((w) => w.length)) && x.answer.length > 40) return 'long-answer';
  return null;
}
const normal = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

type Status = 'pending' | 'ok' | 'rejected';
type Item<T> = T & { status: Status; reason?: string; rating?: number; audit?: 'ok' | 'wrong'; level: number };

const Verdicts = z.object({
  items: z.array(
    z.object({
      i: z.number().int(),
      pick: z.string(),
      sure: z.boolean(),
      wrongAreWrong: z.boolean(),
      factsCorrect: z.boolean(),
      level: z.number().int().min(1).max(10),
      problem: z.string().nullish(),
    }),
  ),
});
const VERDICT_SHAPE =
  '{"items":[{"i":0,"pick":"the option text you think is right, copied exactly","sure":true,"wrongAreWrong":true,"factsCorrect":true,"level":6,"problem":"only when something is wrong"}]}';

/**
 * The checker answers each item blind (options shuffled, answer not marked), says whether the other
 * options are clearly wrong and whether every statement in it is true, and rates its level.
 */
async function blindCheck(subject: string, level: number, items: Choice[], extra: (i: number) => string = () => '') {
  const r = random(`blind:${subject}:${level}:${items.map((x) => x.q).join('|').slice(0, 200)}`);
  const list = items
    .map((x, i) => {
      const options = [x.answer, ...x.wrong].sort(() => r() - 0.5);
      return `${i}. ${extra(i)}${x.q}\n   Options: ${options.map((o) => `[${o}]`).join(' ')}`;
    })
    .join('\n');
  const prompt = `You are an expert examiner checking ${subject} questions for a learning game.

${LADDER}

The questions below are meant for level ${level} (${NAMES[level]}). Solve each one yourself, carefully. For each item give:
- pick: the one option you believe is correct (copy its text exactly).
- sure: true only if exactly one option is correct and you are confident of it.
- wrongAreWrong: true if every other option is clearly incorrect (not a defensible alternative answer).
- factsCorrect: true if every statement in the question and the options is accurate (numbers, names, dates, definitions).
- level: how hard the item really is on the ladder above.
- problem: a short note when something is wrong.

${list}`;
  return (await ask(CHECKER, prompt, Verdicts, VERDICT_SHAPE, 0.1))?.items ?? null;
}

const Audit = z.object({ items: z.array(z.object({ i: z.number().int(), ok: z.boolean(), reason: z.string().nullish() })) });
async function audit(subject: string, level: number, items: Choice[], extra: (i: number) => string = () => '') {
  const list = items.map((x, i) => `${i}. ${extra(i)}${x.q}\n   Right answer: ${x.answer}\n   Wrong options: ${x.wrong.join(' | ')}`).join('\n');
  const prompt = `You audit ${subject} questions in a learning game for learners worldwide.

${LADDER}

Each item is for level ${level}. Mark ok=false when the marked right answer is wrong or debatable, a wrong option is actually right, a fact is inaccurate, or the item is more than one level easier or harder than level ${level}. Otherwise ok=true. Be strict but fair.

${list}`;
  return (await ask(AUDITOR, prompt, Audit, '{"items":[{"i":0,"ok":true,"reason":"only when ok is false"}]}', 0.1))?.items ?? null;
}

/** Levels an item may be rated and still be used at a level. */
const fits = (rating: number, level: number) => (level <= 2 ? rating <= 3 : level >= 9 ? rating >= level - 2 : Math.abs(rating - level) <= 1);

/** Blind check then audit a batch; sets each item's status. */
async function judge<T extends Choice>(subject: string, level: number, batch: Item<T>[], extra?: (i: number) => string) {
  const verdicts = await blindCheck(subject, level, batch, extra);
  if (!verdicts) {
    for (const it of batch) Object.assign(it, { status: 'rejected', reason: 'checker-failed' });
    return;
  }
  const passed: Item<T>[] = [];
  batch.forEach((it, i) => {
    const v = verdicts.find((x) => x.i === i);
    let reason: string | null = null;
    if (!v) reason = 'checker-missing';
    else if (normal(v.pick) !== normal(it.answer)) reason = `checker-picked: ${v.pick.slice(0, 60)}`;
    else if (!v.sure) reason = 'not-sure';
    else if (!v.wrongAreWrong) reason = 'two-right';
    else if (!v.factsCorrect) reason = `facts: ${v.problem ?? ''}`.slice(0, 120);
    else if (!fits(v.level, level)) reason = `level-${v.level}`;
    if (v) it.rating = v.level;
    if (reason) Object.assign(it, { status: 'rejected', reason });
    else passed.push(it);
  });
  const r = random(`audit:${subject}:${level}:${passed.map((p) => p.q).join('|').slice(0, 200)}`);
  const sample = passed.filter(() => r() < 0.25);
  if (!sample.length && passed.length) sample.push(passed[0]!);
  const audits = sample.length ? await audit(subject, level, sample, extra && ((i) => extra(batch.indexOf(sample[i]!)))) : [];
  sample.forEach((it, i) => {
    const a = audits?.find((x) => x.i === i);
    if (a) it.audit = a.ok ? 'ok' : 'wrong';
  });
  for (const it of passed) {
    if (it.audit === 'wrong') Object.assign(it, { status: 'rejected', reason: 'audit' });
    else it.status = 'ok';
  }
}

/** Items the checker rated too easy for a level, to show the writer what not to write. */
const tooEasy = (items: { q?: string; body?: string; reason?: string; level: number }[], level: number) => {
  const easy = items.filter((x) => /^level-\d/.test(x.reason ?? '') && Number(x.reason!.slice(6)) < level).slice(-6);
  return easy.length
    ? `\nThe checker rated these earlier attempts TOO EASY for level ${level}; go clearly harder (more steps of reasoning, finer distinctions, specialist knowledge):\n${easy.map((x) => `- ${(x.q ?? x.body ?? '').slice(0, 140)}`).join('\n')}`
    : '';
};

/** Options at a level: four up to level 7, five from level 8 (more distractors). */
const wrongCount = (level: number) => (level >= 8 ? 4 : 3);

// ─── Galaxy Defender: science questions ───────────────────────────────────────

type DItem = Item<Choice>;
const DEFENDER_TARGET: Record<number, number> = { 1: 22, 2: 22, 3: 22, 4: 24, 5: 24, 6: 30, 7: 30, 8: 30, 9: 30, 10: 30 };
const Written = z.object({ items: z.array(z.object({ q: z.string(), answer: z.string(), wrong: z.array(z.string()) })) });

async function defenderLevel(level: number) {
  const file = `defender-${level}.json`;
  const data = read<{ items: DItem[]; rounds: number }>(file, { items: [], rounds: 0 });
  // Pending items from a stopped run are checked again.
  for (const it of data.items) if (it.status === 'pending') it.status = 'rejected';
  const have = () => (QUESTIONS[level]?.length ?? 0) + data.items.filter((x) => x.status === 'ok').length;
  while (have() < DEFENDER_TARGET[level]! && data.rounds < (level >= 8 ? 12 : 6)) {
    data.rounds++;
    const avoid = [...(QUESTIONS[level] ?? []).map((x) => x.q), ...data.items.filter((x) => x.status === 'ok').map((x) => x.q)];
    const n = Math.min(12, DEFENDER_TARGET[level]! - have() + 4);
    const prompt = `You write multiple-choice questions for "Galaxy Defender", a physics and space-science quiz game.

${LADDER}

Write ${n} NEW questions for level ${level} (${NAMES[level]}) on: ${PHYSICS[level]}
Rules:
- Each has one correct answer and exactly ${wrongCount(level)} wrong options (the \"wrong\" array has ${wrongCount(level)} entries). Wrong options are plausible misconceptions a learner at this level might hold, but clearly wrong to an expert.
- Conceptual or one-step reasoning (no long calculations); facts must be accurate and current (IAU definitions, SI units, British spelling).
- Question at most 200 characters; options short (at most 80 characters), similar in length and style. Never "all/none of the above".
- Difficulty must really match level ${level}${level >= 8 ? ': a good undergraduate in physics should need to think' : ''}${level === 10 ? '; only a specialist or olympiad finalist gets it right' : ''}.
- Varied topics within the list; no two questions testing the same fact.
- Do not repeat these: ${avoid.slice(-40).join(' | ') || '(none)'}${tooEasy(data.items, level)}`;
    const written = await ask(WRITER, prompt, Written, `{"items":[{"q":"...","answer":"...","wrong":[${Array(wrongCount(level)).fill('"..."').join(',')}]}]}`, 0.8);
    const fresh: DItem[] = [];
    for (const w of written?.items ?? []) {
      const x = { q: w.q.trim(), answer: w.answer.trim(), wrong: w.wrong.map((s) => s.trim()) };
      const problem = choiceProblem(x, wrongCount(level)) ?? (avoid.some((a) => normal(a) === normal(x.q)) ? 'repeat' : null);
      fresh.push({ ...x, level, status: problem ? 'rejected' : 'pending', ...(problem && { reason: problem }) });
    }
    data.items.push(...fresh);
    save(file, data);
    const pending = fresh.filter((x) => x.status === 'pending');
    for (let i = 0; i < pending.length; i += 8) await judge('physics and space science', level, pending.slice(i, i + 8));
    save(file, data);
    console.log(`defender L${level}: ${have()} of ${DEFENDER_TARGET[level]}`);
  }
}

// ─── Solar System Explorer: questions about each place ────────────────────────

type EItem = Item<Choice & { place: string }>;
/** Questions per place at each level from 6 (the old questions cover levels 1–5). */
const PER_PLACE = 4;

function placeInfo(id: string) {
  const d = DESTINATIONS.find((x) => x.id === id)!;
  const n = d.data;
  const numbers = [`radius ${n.radius} km`, n.gravity && `surface gravity ${n.gravity} m/s²`, `goes round: ${n.around}`, n.period && `period ${n.period.join(' ')}`, n.distance && `distance ${n.distance.join(' ')}`];
  return { name: d.name, data: `${d.facts.join(' ')} (${numbers.filter(Boolean).join('; ')})` };
}

async function explorerLevel(level: number) {
  if (level < 6) return;
  const file = `explorer-${level}.json`;
  const data = read<{ items: EItem[]; rounds: Record<string, number> }>(file, { items: [], rounds: {} });
  for (const it of data.items) if (it.status === 'pending') it.status = 'rejected';
  const places = DESTINATIONS.filter((d) => d.level <= level).map((d) => d.id);
  await settled(
    places.map(async (place) => {
      const ok = () => data.items.filter((x) => x.place === place && x.status === 'ok').length;
      while (ok() < PER_PLACE && (data.rounds[place] ?? 0) < 3) {
        data.rounds[place] = (data.rounds[place] ?? 0) + 1;
        const info = placeInfo(place);
        const avoid = data.items.filter((x) => x.place === place).map((x) => x.q);
        const prompt = `You write multiple-choice questions for "Solar System Explorer", a game where a probe visits places in the Solar System and the player answers mission questions about each place.

${LADDER}

Place: ${info.name}. Known data: ${info.data}
Write ${PER_PLACE + 2} NEW questions about ${info.name} for level ${level} (${NAMES[level]}), at the depth of: ${PHYSICS[level]}
Rules:
- About this place and the physics or planetary science that explains it (orbits, tides, gravity, atmospheres, interiors, missions, how we know). Accurate, current facts only (NASA/ESA data); if unsure of a number, ask about the reasoning instead.
- One correct answer and exactly ${wrongCount(level)} wrong options that are plausible but clearly wrong to an expert. Short options (at most 80 characters), similar in length. Never "all/none of the above".
- Each question at most 220 characters, understandable on its own (name the place).
- Do not repeat: ${avoid.join(' | ') || '(none)'}`;
        const written = await ask(WRITER, prompt, Written, `{"items":[{"q":"...","answer":"...","wrong":[${Array(wrongCount(level)).fill('"..."').join(',')}]}]}`, 0.8);
        const fresh: EItem[] = [];
        for (const w of written?.items ?? []) {
          const x = { q: w.q.trim(), answer: w.answer.trim(), wrong: w.wrong.map((s) => s.trim()) };
          const problem = choiceProblem(x, wrongCount(level)) ?? (avoid.some((a) => normal(a) === normal(x.q)) ? 'repeat' : null);
          fresh.push({ ...x, place, level, status: problem ? 'rejected' : 'pending', ...(problem && { reason: problem }) });
        }
        data.items.push(...fresh);
        save(file, data);
        await judge('planetary science and space exploration', level, fresh.filter((x) => x.status === 'pending'), () => `[About ${info.name}] `);
        save(file, data);
      }
    }),
  );
  console.log(`explorer L${level}: ${data.items.filter((x) => x.status === 'ok').length} questions`);
}

// ─── Cyber Defender ───────────────────────────────────────────────────────────

/**
 * Kinds by level. email/sms: phishing or safe; password: weak or strong; situation: risky or safe;
 * attack: name the attack from a description, a log or code; fix: the best defence for a case.
 */
const CYBER_KINDS: Record<number, string[]> = {
  1: ['email', 'sms', 'password', 'situation'],
  2: ['email', 'sms', 'password', 'situation'],
  3: ['email', 'sms', 'password', 'situation'],
  4: ['email', 'sms', 'password', 'situation'],
  5: ['email', 'sms', 'situation', 'attack'],
  6: ['email', 'situation', 'attack', 'fix'],
  7: ['email', 'attack', 'fix'],
  8: ['attack', 'fix'],
  9: ['attack', 'fix'],
  10: ['attack', 'fix'],
};
const CYBER_TOPICS: Record<number, string> = {
  1: 'obvious scams, prize messages, sharing passwords, very short passwords, strangers online.',
  2: 'fake delivery fees, look-alike addresses, short links, password reuse, public Wi-Fi basics.',
  3: 'CEO gift-card scams, attachments, app permissions, two-step verification, updates.',
  4: 'spoofed sender names, double extensions (.pdf.exe), passphrases, backups, QR-code scams.',
  5: 'spear phishing, SIM swap, malware types (ransomware, keyloggers, trojans), and naming basic attacks (phishing, brute force, man-in-the-middle, DDoS).',
  6: 'business email compromise, OAuth consent phishing, typosquatted domains; attacks: SQL injection, cross-site scripting, credential stuffing, password spraying; defences: MFA, least privilege, patching, input validation.',
  7: 'MFA-fatigue push bombing, session hijacking, CSRF, insecure direct object references, open S3-style buckets, dependency typosquatting; defences: parameterised queries, output encoding, CSRF tokens, phishing-resistant MFA.',
  8: 'server-side request forgery, XML external entities, insecure deserialisation, path traversal, JWT "none"/algorithm confusion, DNS rebinding, clickjacking, Kerberoasting, pass-the-hash; read short log lines and code snippets.',
  9: 'supply-chain attacks, CI/CD secret leaks, cloud IAM privilege escalation, container escape, prototype pollution, race conditions (TOCTOU), timing side channels, HTTP request smuggling; defences in depth, zero trust.',
  10: 'advanced: padding-oracle attacks, nonce reuse in AES-GCM, ECDSA nonce leaks, Rowhammer, speculative-execution side channels, BGP hijacking, SAML signature wrapping, OAuth PKCE downgrades, kernel use-after-free exploitation and mitigations (ASLR, CFI, stack canaries).',
};

const CyberWritten = z.object({
  items: z.array(
    z.object({
      kind: z.enum(['email', 'sms', 'password', 'situation', 'attack', 'fix']),
      from: z.string().nullish(),
      subject: z.string().nullish(),
      body: z.string(),
      link: z.string().nullish(),
      code: z.string().nullish(),
      question: z.string().nullish(),
      answer: z.string(),
      wrong: z.array(z.string()).nullish(),
      why: z.string(),
    }),
  ),
});
type CItem = Item<Choice & z.infer<typeof CyberWritten>['items'][number] & { id: string }>;
const CYBER_TARGET: Record<number, number> = { 1: 16, 2: 16, 3: 16, 4: 16, 5: 18, 6: 18, 7: 18, 8: 18, 9: 18, 10: 18 };
const VERDICTS: Record<string, [string, string]> = { email: ['phishing', 'safe'], sms: ['phishing', 'safe'], password: ['weak', 'strong'], situation: ['risky', 'safe'] };

/** A Cyber item as a multiple-choice question for the checker. */
function cyberChoice(x: Omit<CItem, 'q' | 'wrong' | 'status' | 'level' | 'id'> & { wrong?: string[] | null }): Choice {
  const parts = [
    x.from && `From: ${x.from}`,
    x.subject && `Subject: ${x.subject}`,
    x.body,
    x.link && `Link: ${x.link}`,
    x.code && `Code/log:\n${x.code}`,
    x.question ?? (x.kind === 'password' ? 'Is this password weak or strong?' : x.kind === 'situation' ? 'Is this risky or safe?' : x.kind === 'attack' || x.kind === 'fix' ? '' : 'Is this phishing or safe?'),
  ].filter(Boolean);
  const verdicts = VERDICTS[x.kind];
  return { q: parts.join('\n'), answer: x.answer, wrong: verdicts ? verdicts.filter((v) => v !== x.answer) : (x.wrong ?? []) };
}

async function cyberLevel(level: number) {
  const file = `cyber-${level}.json`;
  const data = read<{ items: CItem[]; rounds: number }>(file, { items: [], rounds: 0 });
  for (const it of data.items) if (it.status === 'pending') it.status = 'rejected';
  const oldHere = CYBER.filter((c) => c.level === level).length;
  const have = () => oldHere + data.items.filter((x) => x.status === 'ok').length;
  while (have() < CYBER_TARGET[level]! && data.rounds < 12) {
    data.rounds++;
    const avoid = [...CYBER.map((c) => c.body), ...data.items.filter((x) => x.status !== 'rejected').map((x) => x.body)];
    const n = Math.min(10, CYBER_TARGET[level]! - have() + 3);
    const kinds = CYBER_KINDS[level]!;
    const prompt = `You write cases for "Cyber Defender", a cyber-security game. The player reads a case and gives a verdict.

${LADDER}

Write ${n} NEW cases for level ${level} (${NAMES[level]}) on: ${CYBER_TOPICS[level]}
Use these kinds, mixed: ${kinds.join(', ')}.
- email: from (an address), subject, body (at most 300 characters), optional link; answer "phishing" or "safe". About a third safe. Safe ones must look genuinely safe (right domain, nothing asked).
- sms: from, body, optional link; answer "phishing" or "safe".
- password: body is the password itself; answer "weak" or "strong" (strong = long and unpredictable, e.g. a 4+ random-word passphrase or 14+ random characters).
- situation: body describes what someone is about to do (at most 260 characters); answer "risky" or "safe".
- attack: body describes what happened${level >= 8 ? ', usually with a short log line or code snippet in "code" (at most 6 lines, realistic syntax)' : ''}; question is "Which attack is this?" (or similar); answer is the attack's standard name; wrong has exactly ${wrongCount(level)} other real attack names that a learner might confuse with it.
- fix: body describes a weakness or incident${level >= 8 ? ', optionally with "code"' : ''}; question asks for the best defence; answer is the defence; wrong has exactly ${wrongCount(level)} plausible but weaker or irrelevant defences.
Rules: all organisations, people, domains and apps are MADE UP (never real brands such as Google, Microsoft, Apple, PayPal, banks or phone networks); domains end in realistic TLDs; no real personal data. "why" explains the verdict in one or two sentences (at most 260 characters) and names the warning sign or the reason. Use British spelling. Every case must have exactly one defensible answer.
Use ONLY the kinds listed above. For attack and fix cases \"wrong\" must have exactly ${wrongCount(level)} options.
Do not repeat or closely copy these: ${avoid.slice(-30).map((b) => b.slice(0, 80)).join(' | ')}${tooEasy(data.items, level)}`;
    const written = await ask(
      WRITER,
      prompt,
      CyberWritten,
      '{"items":[{"kind":"attack","from":null,"subject":null,"body":"...","link":null,"code":null,"question":"Which attack is this?","answer":"...","wrong":["..."],"why":"..."}]}',
      0.8,
    );
    const fresh: CItem[] = [];
    for (const w of written?.items ?? []) {
      const base = { ...w, body: w.body.trim(), answer: w.answer.trim(), why: w.why.trim(), wrong: w.wrong?.map((s) => s.trim()) ?? null };
      const choice = cyberChoice(base);
      const item = { ...base, ...choice, id: `l${level}-${data.items.length + fresh.length}`, level } as CItem;
      let problem: string | null = null;
      if (!kinds.includes(w.kind)) problem = 'kind';
      else if (VERDICTS[w.kind] && !VERDICTS[w.kind]!.includes(base.answer)) problem = 'verdict';
      else if (!VERDICTS[w.kind] && (!w.question || choiceProblem({ q: w.question, answer: base.answer, wrong: base.wrong ?? [] }, wrongCount(level)))) problem = 'options';
      else if (REAL_BRANDS.test([w.from, w.subject, w.body, w.link, w.code].join(' '))) problem = 'real-brand';
      else if (base.body.length > 340 || base.why.length > 300 || (w.code?.split('\n').length ?? 0) > 8) problem = 'length';
      else if (avoid.some((a) => normal(a) === normal(base.body))) problem = 'repeat';
      fresh.push({ ...item, status: problem ? 'rejected' : 'pending', ...(problem && { reason: problem }) });
    }
    data.items.push(...fresh);
    save(file, data);
    const pending = fresh.filter((x) => x.status === 'pending');
    for (let i = 0; i < pending.length; i += 8) await judge('cyber security', level, pending.slice(i, i + 8));
    save(file, data);
    console.log(`cyber L${level}: ${have()} of ${CYBER_TARGET[level]}`);
  }
}

// ─── Writing the data files ───────────────────────────────────────────────────

const lit = (v: unknown) => JSON.stringify(v);
const HEAD = (what: string) => `/**
 * ${what}
 * Written by scripts/space-tech-content.ts (writer deepseek-v4.1-flash-1017, every item solved blind by
 * qwen3.8-27b, a sample audited by glm-5.3-flash). Do not edit by hand: change the script and rebuild.
 */
`;

function build() {
  const defender: Record<number, Choice[]> = {};
  for (let l = 1; l <= 10; l++)
    defender[l] = read<{ items: DItem[] }>(`defender-${l}.json`, { items: [] }).items.filter((x) => x.status === 'ok').map(({ q, answer, wrong }) => ({ q, answer, wrong }));
  writeFileSync(
    join(SPACE_DATA, 'questions-ladder.ts'),
    `${HEAD('Galaxy Defender questions added for the ten-level ladder (levels 6–10 have five options).')}export type LadderQuestion = { q: string; answer: string; wrong: string[] };

export const MORE_QUESTIONS: Record<number, LadderQuestion[]> = {
${Object.entries(defender)
  .map(([l, xs]) => `  ${l}: [\n${xs.map((x) => `    ${lit(x)},`).join('\n')}\n  ],`)
  .join('\n')}
};
`,
  );
  const explorer: { place: string; level: number; q: string; answer: string; wrong: string[] }[] = [];
  for (let l = 6; l <= 10; l++)
    for (const x of read<{ items: EItem[] }>(`explorer-${l}.json`, { items: [] }).items.filter((it) => it.status === 'ok'))
      explorer.push({ place: x.place, level: l, q: x.q, answer: x.answer, wrong: x.wrong });
  writeFileSync(
    join(SPACE_DATA, 'explorer-ladder.ts'),
    `${HEAD('Solar System Explorer questions for levels 6–10, by place.')}export type PlaceQuestion = { place: string; level: number; q: string; answer: string; wrong: string[] };

export const PLACE_QUESTIONS: PlaceQuestion[] = [
${explorer.map((x) => `  ${lit(x)},`).join('\n')}
];
`,
  );
  const cyber: unknown[] = [];
  for (let l = 1; l <= 10; l++)
    for (const x of read<{ items: CItem[] }>(`cyber-${l}.json`, { items: [] }).items.filter((it) => it.status === 'ok')) {
      const verdict = !!VERDICTS[x.kind];
      cyber.push({
        id: x.id,
        kind: x.kind,
        level: l,
        ...(x.from && { from: x.from }),
        ...(x.subject && { subject: x.subject }),
        body: x.body,
        ...(x.link && { link: x.link }),
        ...(x.code && { code: x.code }),
        ...(!verdict && { question: x.question, options: [x.answer, ...(x.wrong ?? [])] }),
        answer: x.answer,
        why: x.why,
      });
    }
  writeFileSync(
    join(TECH_DATA, 'cyber-ladder.ts'),
    `${HEAD('Cyber Defender cases added for the ten-level ladder. Attack and defence cases list their options (the first is right; the game shuffles them).')}import type { CyberItem } from './cyber.js';

export const MORE_CYBER: CyberItem[] = [
${cyber.map((x) => `  ${lit(x)},`).join('\n')}
];
`,
  );
  console.log(`built: defender ${Object.values(defender).flat().length}, explorer ${explorer.length}, cyber ${cyber.length}`);
}

// ─── Run ──────────────────────────────────────────────────────────────────────

async function main() {
  const generating = STAGES.some((s) => ['defender', 'explorer', 'cyber'].includes(s));
  if (generating && !vultrConfigured()) throw new Error('not-configured: set VULTR_INFERENCE_API_KEY in apps/server/.env');
  console.log(`Budget $${BUDGET}, spent so far $${money.vultrUsd.toFixed(4)}`);
  try {
    const jobs: Promise<unknown>[] = [];
    if (STAGES.includes('defender')) jobs.push(settled(LEVELS.map((l) => defenderLevel(l))));
    if (STAGES.includes('explorer')) jobs.push(settled(LEVELS.map((l) => explorerLevel(l))));
    if (STAGES.includes('cyber')) jobs.push(settled(LEVELS.map((l) => cyberLevel(l))));
    await settled(jobs);
  } catch (e) {
    if (!(e instanceof OutOfMoney)) throw e;
    console.warn(`Stopped at the budget ($${money.vultrUsd.toFixed(4)} of $${BUDGET}); a rerun with a higher --budget carries on.`);
  }
  money = ledger();
  console.log(`Spent $${money.vultrUsd.toFixed(4)} in ${money.calls} calls`);
  if (STAGES.includes('build')) build();
}

await main();
