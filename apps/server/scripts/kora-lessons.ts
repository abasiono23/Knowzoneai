/**
 * Makes the Lessons with Kora: three-minute lessons that a cartoon Kora teaches live in the app (her
 * mouth is drawn by the app and follows her voice; nothing here is a rendered video). Open models on
 * Vultr Serverless Inference do the work; OpenAI is not used.
 *
 * For every topic in scripts/kora-lessons-topics.ts:
 *
 *  1. script    the writer drafts what Kora says (hook, explanation, worked example, quick check with a
 *               pause, common mistakes, recap, one tip); a different model checks the facts and the
 *               teaching and sends back a corrected script
 *  2. board     the writer lays out what appears on the board beside her, tied to the line she is saying
 *               (headings, key terms, formulas, steps, pictures); the reviewer checks it against the script
 *  3. voice     each line is spoken in Kora's voice (qwen3-tts, cloned from data/kora-lessons/voice-ref.wav),
 *               joined into one narration, and every word is timed by aligner-1; a line the aligner isn't
 *               sure it heard is spoken again
 *  4. pictures  real, credited pictures from Wikimedia Commons where one fits, else a drawn one
 *  5. build     word times become mouth shapes (scripts/kora-lessons-visemes.ts), the narration becomes a
 *               small mp3, and everything is written to apps/mobile/public/kora-lessons/<id>/
 *               (lesson.json, voice.mp3, pictures), with index.json listing the lessons
 *
 * Every step is saved in the work folder (apps/server/.kora-lessons/<id>/) as it's made, so a re-run only
 * does what's missing; delete a step's file to make it again. Every paid call goes to
 * .kora-lessons/spend.jsonl, and the job stops before the total would pass the cap.
 *
 * Run from apps/server (needs ffmpeg: on the PATH, or its path in KORA_FFMPEG):
 *
 *   npx tsx scripts/kora-lessons.ts                          # every lesson, every step
 *   npx tsx scripts/kora-lessons.ts --only phishing,passwords
 *   npx tsx scripts/kora-lessons.ts --steps script,board     # stop after these steps
 *   npx tsx scripts/kora-lessons.ts --steps build            # rebuild the app files from what's saved
 *   npx tsx scripts/kora-lessons.ts --cap 38 --parallel 4 --lessons 3
 */
import { execFileSync } from 'node:child_process';
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import sharp from 'sharp';
import { z } from 'zod';

import { config } from '../src/config.js';
import { parseModelJson, vultrCost } from '../src/services/vultr.js';
import { TOPICS, type Topic } from './kora-lessons-topics.js';
import { FPS, loudness, mouthTimeline, type TimedWord } from './kora-lessons-visemes.js';

const args = process.argv.slice(2);
const flag = (name: string) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined);

const SERVER = resolve(import.meta.dirname, '..');
const WORK = resolve(flag('work') ?? join(SERVER, '.kora-lessons'));
const OUT = resolve(flag('out') ?? join(SERVER, '../mobile/public/kora-lessons'));
const WRITER = flag('writer') ?? 'deepseek-v4.1-flash-1017';
const REVIEWER = flag('reviewer') ?? 'glm-5.3';
const VOICE_MODEL = 'qwen3-tts-12hz-1.7b';
const CAP = Number(flag('cap') ?? 38);
const PARALLEL = Number(flag('parallel') ?? 4);
const LESSONS_AT_ONCE = Number(flag('lessons') ?? 3);
const ONLY = flag('only')?.split(',').filter(Boolean);
const STEPS = (flag('steps') ?? 'script,board,voice,pictures,build').split(',');
const KEY = config.VULTR_INFERENCE_API_KEY;
if (!KEY) throw new Error('not-configured: set VULTR_INFERENCE_API_KEY in apps/server/.env');
const API = 'https://api.vultrinference.com/v1';
const AUTH = { Authorization: `Bearer ${KEY}` };
const scrub = (s: string) => s.split(KEY).join('[key]').slice(0, 400);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
mkdirSync(WORK, { recursive: true });
mkdirSync(OUT, { recursive: true });

// ─── Money ────────────────────────────────────────────────────────────────────

const LEDGER = join(WORK, 'spend.jsonl');
let spent = existsSync(LEDGER)
  ? readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean).reduce((a, l) => a + (JSON.parse(l).cost as number), 0)
  : 0;
function spend(what: string, model: string, cost: number, note = '') {
  spent += cost;
  appendFileSync(LEDGER, JSON.stringify({ at: new Date().toISOString(), what, model, cost, note }) + '\n');
}
/** Call before a paid request: refuses one that could take the total past the cap. */
function budget(next: number) {
  if (spent + next > CAP) throw new Error(`Budget stop: spent $${spent.toFixed(2)} of $${CAP}`);
}

// ─── Vultr ────────────────────────────────────────────────────────────────────

/** fetch that rides out a dropped connection, a busy model or a server error. */
async function call(path: string, init: RequestInit, tries = 6): Promise<Response> {
  let last = '';
  for (let attempt = 0; attempt < tries; attempt++) {
    if (attempt) await sleep(2500 * attempt);
    let res: Response;
    try {
      res = await fetch(path.startsWith('http') ? path : API + path, { ...init, signal: AbortSignal.timeout(420_000) });
    } catch (e) {
      last = e instanceof Error ? e.message : String(e);
      continue;
    }
    if (res.status === 429 || res.status >= 500) {
      last = `HTTP ${res.status}`;
      await sleep((Number(res.headers.get('retry-after')) || 6) * 1000);
      continue;
    }
    if (!res.ok) throw new Error(`${path} ${res.status}: ${scrub(await res.text().catch(() => ''))}`);
    return res;
  }
  throw new Error(`${path} didn't answer (${scrub(last)})`);
}

/**
 * One chat answer as JSON, checked against a schema; a wrong shape goes back to the model with what was
 * wrong. These are thinking models: without a limit on the thinking, the reviewer spends its whole
 * allowance on it and answers nothing, so every call says how hard to think.
 */
async function chatJson<T>(model: string, input: string, schema: z.ZodType<T>, what: string, temperature = 0.5): Promise<T> {
  let problem = '';
  for (let attempt = 0; attempt < 3; attempt++) {
    budget(0.1);
    const res = await call('/chat/completions', {
      method: 'POST',
      headers: { ...AUTH, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: problem ? `${input}

Your last answer was rejected: ${problem}
Return the corrected JSON only.` : input }],
        response_format: { type: 'json_object' },
        temperature,
        max_tokens: 20_000,
        reasoning: { effort: model === REVIEWER ? 'medium' : 'low' },
      }),
    });
    const r = (await res.json()) as {
      choices?: { message?: { content?: string | null }; finish_reason?: string }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number; cost?: number };
    };
    const usage = { inputTokens: r.usage?.prompt_tokens ?? 0, outputTokens: r.usage?.completion_tokens ?? 0 };
    spend('chat', model, r.usage?.cost ?? vultrCost(model, usage), `${what} ${usage.inputTokens}/${usage.outputTokens}`);
    try {
      const parsed = schema.safeParse(parseModelJson(r.choices?.[0]?.message?.content ?? ''));
      if (parsed.success) return parsed.data;
      problem = parsed.error.issues.slice(0, 8).map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    } catch (e) {
      problem = r.choices?.[0]?.finish_reason === 'length' ? 'it was cut off: answer more briefly' : e instanceof Error ? e.message : 'not JSON';
    }
    console.log(`  ${what}: answer rejected (${problem.slice(0, 160)})`);
  }
  throw new Error(`${what}: the model's answer never fitted (${problem})`);
}

// ─── Small helpers ────────────────────────────────────────────────────────────

const readJson = <T>(file: string): T => JSON.parse(readFileSync(file, 'utf8')) as T;
const saveJson = (file: string, value: unknown) => writeFileSync(file, JSON.stringify(value, null, 1));
const countWords = (lines: string[]) => lines.join(' ').split(/\s+/).filter(Boolean).length;

async function pool<T>(items: T[], size: number, work: (item: T, index: number) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        await work(items[i], i);
      }
    }),
  );
}

type Wav = { rate: number; samples: Float32Array };
function readWav(buf: Buffer): Wav {
  let p = 12;
  let fmt: { channels: number; rate: number; bits: number } | null = null;
  while (p + 8 <= buf.length) {
    const id = buf.toString('ascii', p, p + 4);
    let size = buf.readUInt32LE(p + 4);
    if (id === 'fmt ') fmt = { channels: buf.readUInt16LE(p + 10), rate: buf.readUInt32LE(p + 12), bits: buf.readUInt16LE(p + 22) };
    if (id === 'data' && fmt) {
      // A streamed file may not know its own length.
      if (size === 0xffffffff || p + 8 + size > buf.length) size = buf.length - p - 8;
      if (fmt.bits !== 16) throw new Error('Only 16-bit PCM is handled');
      const n = Math.floor(size / 2 / fmt.channels);
      const samples = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        let s = 0;
        for (let c = 0; c < fmt.channels; c++) s += buf.readInt16LE(p + 8 + (i * fmt.channels + c) * 2);
        samples[i] = s / fmt.channels / 32768;
      }
      return { rate: fmt.rate, samples };
    }
    p += 8 + size + (size % 2);
  }
  throw new Error('No audio data in WAV');
}
/** Cuts the silence off both ends, keeping a short pad. */
function trimWav({ rate, samples }: Wav, threshold = 0.012): Wav {
  const win = Math.round(rate * 0.01);
  const loud = (i: number) => {
    let m = 0;
    for (let j = i; j < Math.min(i + win, samples.length); j++) m = Math.max(m, Math.abs(samples[j]));
    return m > threshold;
  };
  let a = 0;
  while (a < samples.length && !loud(a)) a += win;
  let b = samples.length - win;
  while (b > a && !loud(b)) b -= win;
  a = Math.max(0, a - Math.round(0.04 * rate));
  b = Math.min(samples.length, b + win + Math.round(0.08 * rate));
  return { rate, samples: samples.slice(a, b) };
}
function writeWav({ rate, samples }: Wav) {
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + samples.length * 2, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32767))), 44 + i * 2);
  return buf;
}

// ─── 1. The script ────────────────────────────────────────────────────────────

const SECTION_IDS = ['hook', 'explain', 'explain2', 'example', 'check', 'answer', 'mistakes', 'recap'] as const;
const PAUSE_LINE = "Pause here and try it. I'll wait.";

const ScriptSchema = z.object({
  title: z.string().min(3).max(70),
  sections: z
    .array(z.object({ id: z.enum(SECTION_IDS), title: z.string().min(2).max(22), lines: z.array(z.string().min(3).max(260)).min(1).max(14) }))
    .min(6)
    .max(8),
});
type Script = z.infer<typeof ScriptSchema>;

const SPELLING: Record<Topic['spelling'], string> = {
  US: 'American English spelling and words (math, color, check your work). Examples from American school life.',
  UK: 'British English spelling (revise, colour, practise as a verb). Examples that students in Lagos, Accra, Nairobi or London would all know.',
  WA: 'British English spelling as used in Nigerian and West African schools. Examples from Nigerian and West African life (market, danfo bus, garden, NEPA light), names like Ada, Tunde, Kofi. The student is preparing for JAMB (UTME) and WAEC (WASSCE).',
};

function scriptBrief(t: Topic) {
  const tip = t.group === 'exam' ? '"Exam tip:"' : '"Top tip:"';
  return `You are writing the spoken script for a three-minute lesson: "${t.title}" (${t.subject}, ${t.label}).
The teacher is Kora, Knowzone's AI tutor: a warm, friendly young Nigerian woman, like a kind teacher who makes hard things feel simple. She speaks directly to one student ("you"). The students range from secondary school to adults learning on their own: never talk down, never sound childish.

WHAT THE LESSON MUST TEACH (get every fact, number and name right)
${t.brief}

HOW IT MUST SOUND
- Spoken English, not a textbook read aloud. Short sentences. One idea per sentence. Contractions are fine.
- ${SPELLING[t.spelling]}
- Warm but not childish. No slang, no "guys", no jokes that waste time, no filler like "let's dive in".
- Every sentence must be easy to say aloud. Write every number as words ("twenty-two point four", "six point zero two times ten to the power twenty-three", "x squared minus five x plus six equals zero", "H two O"). No digits, no symbols, no brackets, no slashes in the spoken text. Abbreviations only if they are said as they are written (JAMB, WAEC, SAT, GCSE, HTTPS, IP, DNS, CTF).
- Total 430 to 480 words of speech. This limit matters: the lesson is three minutes.

SECTIONS, in this order (use these ids exactly)
1 hook      - 35 to 55 words. An everyday puzzle or question the lesson answers. Kora says her name once ("I'm Kora").
2 explain   - the core idea, built step by step, key terms defined in plain words.
3 explain2  - optional second part of the explanation if the topic has two halves. Leave it out if not needed.
4 example   - one worked example, said step by step.
5 check     - one quick question the student can answer in their head or on paper in about ten seconds. The last line of this section must be exactly: "${PAUSE_LINE}"
6 answer    - the answer and the one-sentence reason.
7 mistakes  - two or three common mistakes and how to avoid each.
8 recap     - three short recap points, then one line beginning ${tip}, then a warm one-sentence sign-off that mentions Knowzone.

Return JSON only, in this shape:
{"title":"${t.title}","sections":[{"id":"hook","title":"<1 to 3 word label for the progress bar>","lines":["one caption-sized chunk Kora says in one breath: one or two short sentences, at most 26 words","..."]}]}`;
}

/** What a script must satisfy beyond its shape. Returns the problems, for the model to fix. */
function scriptProblems(s: Script): string[] {
  const out: string[] = [];
  const ids = s.sections.map((x) => x.id);
  for (const need of ['hook', 'explain', 'example', 'check', 'answer', 'mistakes', 'recap'] as const)
    if (!ids.includes(need)) out.push(`missing section "${need}"`);
  if (ids.join() !== [...ids].sort((a, b) => SECTION_IDS.indexOf(a) - SECTION_IDS.indexOf(b)).join()) out.push('sections are out of order');
  const lines = s.sections.flatMap((x) => x.lines);
  const words = countWords(lines);
  if (words < 400 || words > 510) out.push(`the script has ${words} words; it must have 430 to 480`);
  for (const l of lines) {
    if (/[0-9]/.test(l)) out.push(`digits in a spoken line (write numbers as words): "${l.slice(0, 60)}"`);
    if (/[=+×÷/()<>%$£₦²³√±→]/.test(l)) out.push(`symbols in a spoken line (say them in words): "${l.slice(0, 60)}"`);
    if (l.split(/\s+/).length > 30) out.push(`a line is over 26 words: "${l.slice(0, 60)}"`);
  }
  const check = s.sections.find((x) => x.id === 'check');
  if (check && check.lines.at(-1)?.trim() !== PAUSE_LINE) out.push(`the check section must end with exactly: "${PAUSE_LINE}"`);
  return out.slice(0, 10);
}

async function makeScript(t: Topic, dir: string): Promise<Script> {
  const file = join(dir, 'script.json');
  if (existsSync(file)) return readJson<Script>(file);
  const brief = scriptBrief(t);
  const draftFile = join(dir, 'script-draft.json');
  const draft = existsSync(draftFile) ? readJson<Script>(draftFile) : await chatJson(WRITER, brief, ScriptSchema, `${t.id} draft`, 0.7);
  saveJson(draftFile, draft);

  const Review = z.object({ issues: z.array(z.string()).max(30), script: ScriptSchema });
  const review = (script: Script, extra: string[]) => `You are a senior examiner and an experienced teacher of ${t.subject}${t.exams.length ? ` (${t.label})` : ''}, and a careful fact-checker. Below is the brief for a spoken three-minute lesson, then the draft script as JSON.

Check every sentence. Fix:
1. Anything that is wrong, loose, out of date or would lose marks: facts, definitions, numbers, sums, names, laws, the worked example and the quick check's answer. Work every calculation yourself.
2. Anything the brief requires that is missing, and anything that would confuse a learner, is hard to say aloud, or sounds like a textbook.
3. Anything that breaks the form: digits or symbols in spoken text, lines over 26 words, a missing section, a check section that does not end with exactly "${PAUSE_LINE}", a length outside 430 to 480 words.
${t.group === 'cyber' ? '4. Safety: remove anything that reads as instructions for attacking a system or person. Ideas and defences only; permission and the law are stressed.\n' : ''}${extra.length ? `\nKNOWN PROBLEMS TO FIX NOW:\n- ${extra.join('\n- ')}\n` : ''}
Keep Kora's warm voice. Keep the length between 430 and 480 words (count them). Do not add new topics.

Return JSON only: {"issues":["each problem you found and what you changed"],"script":{...the full corrected script in the same shape as the draft...}}

=== BRIEF ===
${brief}

=== DRAFT ===
${JSON.stringify(script)}`;

  let current = draft;
  const issues: string[] = [];
  for (let round = 0; round < 3; round++) {
    const extra = round ? scriptProblems(current) : [];
    const r = await chatJson(REVIEWER, review(current, extra), Review, `${t.id} review ${round + 1}`, 0.2);
    issues.push(...r.issues);
    current = r.script;
    if (!scriptProblems(current).length) break;
  }
  const left = scriptProblems(current);
  saveJson(join(dir, 'script-review.json'), { issues, left });
  if (left.some((p) => !p.startsWith('the script has'))) throw new Error(`${t.id}: script still has problems: ${left.join(' | ')}`);
  saveJson(file, current);
  return current;
}

// ─── 2. The board ─────────────────────────────────────────────────────────────

/**
 * What can go on the board. The designer uses all but "clip": a lesson has at most one short moving clip,
 * only where motion itself teaches, and a person adds it (a "clip" item in board.json, and clip.mp4 beside it).
 */
const ITEM_KINDS = ['text', 'term', 'formula', 'step', 'wrong', 'right', 'tip', 'image', 'clip'] as const;
const BoardSchema = z.object({
  scenes: z
    .array(
      z.object({
        line: z.number().int().min(0),
        heading: z.string().min(2).max(40),
        items: z
          .array(
            z.object({
              line: z.number().int().min(0),
              kind: z.enum(ITEM_KINDS),
              text: z.string().max(90).default(''),
              detail: z.string().max(110).optional(),
              image: z.string().max(30).optional(),
            }),
          )
          .min(1)
          .max(6),
      }),
    )
    .min(6)
    .max(16),
  images: z
    .array(z.object({ id: z.string().min(1).max(30), caption: z.string().max(70), wiki: z.string().max(120), ai: z.string().max(600) }))
    .max(2)
    .default([]),
  check: z.object({ question: z.string().min(8).max(190), answer: z.string().min(1).max(170) }),
});
type Board = z.infer<typeof BoardSchema>;

const numbered = (s: Script) => {
  let n = 0;
  return s.sections.map((sec) => `[section ${sec.id}: ${sec.title}]\n${sec.lines.map((l) => `L${n++}: ${l}`).join('\n')}`).join('\n\n');
};

function boardBrief(t: Topic, s: Script) {
  return `You design what appears on the board beside the teacher in a three-minute lesson, "${t.title}" (${t.subject}, ${t.label}). The teacher's script is final; its lines are numbered below. The board is what a good teacher would write while saying those lines: few words, the key terms, the formula, the steps of the worked example.

RULES
- One or two scenes per section. A scene is one board screen: when it starts (at "line"), it replaces the one before. The first scene starts at line 0. Every section's first line starts a new scene.
- A scene has a heading (at most 32 characters) and 2 to 5 items. Each item appears when the teacher reaches its "line" (a line inside that scene), in order, so the board builds up as she talks. Put each item at the line where she says it, not before.
- Item kinds:
  "text"    a short point, at most 60 characters
  "term"    a key term: "text" is the term (at most 28 characters), "detail" its meaning (at most 75 characters)
  "formula" a formula, equation or line of working, at most 40 characters, with real symbols: × ÷ ² ³ √ ± → = % and digits
  "step"    one step of the worked example, at most 60 characters (digits and symbols, not words)
  "wrong"   a common mistake, at most 60 characters, and "right" the correct version, at most 60 characters (use in the mistakes section, in pairs)
  "tip"     the exam tip or top tip, at most 80 characters
  "image"   a picture: "image" is the id of an entry in "images", "text" is empty
- The board uses digits and symbols where the speech spells them out (speech: "x squared minus five x plus six"; board: "x² − 5x + 6 = 0"). ${t.spelling === 'US' ? 'American spelling.' : 'British spelling.'}
- Never put anything on the board that the script does not say or directly imply. Never contradict the script. Every number and formula must be exactly right.
- The check section (the quick question) gets exactly one scene with a single "text" item; the app shows the question itself from "check".
- The answer must not appear on the board before the answer section.
${
  t.pictures
    ? `- Pictures: at most 2 in the whole lesson, only where a real photograph or a standard diagram makes the idea clearer. For each, give in "images": an id, a caption (at most 50 characters), "wiki" (search words that would find it on Wikimedia Commons, e.g. "human heart diagram chambers"), and "ai" (a prompt for a clean illustration with NO words, letters or labels, used only if no real picture fits). A scene with a picture has at most 2 other items.`
    : `- No pictures in this lesson: leave "images" empty and use no "image" items.`
}
- "check": the quick question as it should be shown on the board (at most 150 characters, digits and symbols allowed), and its answer (at most 120 characters).

Return JSON only:
{"scenes":[{"line":0,"heading":"...","items":[{"line":0,"kind":"text","text":"..."},{"line":2,"kind":"term","text":"...","detail":"..."}]}],"images":[{"id":"...","caption":"...","wiki":"...","ai":"..."}],"check":{"question":"...","answer":"..."}}

=== SCRIPT ===
${numbered(s)}`;
}

/** Makes a board fit the script whatever the model returned: lines in range and in order, the limits kept. */
function tidyBoard(board: Board, s: Script, t: Topic): Board {
  const total = s.sections.reduce((a, x) => a + x.lines.length, 0);
  const sectionStart: number[] = [];
  let n = 0;
  for (const sec of s.sections) {
    sectionStart.push(n);
    n += sec.lines.length;
  }
  const sectionOf = (line: number) => sectionStart.findLastIndex((st) => line >= st);
  const checkIndex = s.sections.findIndex((x) => x.id === 'check');
  const images = t.pictures ? board.images : [];
  let scenes = board.scenes
    .map((sc) => ({ ...sc, line: Math.min(total - 1, sc.line) }))
    .sort((a, b) => a.line - b.line)
    .filter((sc, i, all) => i === 0 || sc.line !== all[i - 1].line)
    .filter((sc) => sectionOf(sc.line) !== checkIndex);
  // Every section opens a fresh board.
  for (const [i, st] of sectionStart.entries()) {
    if (i === checkIndex) continue;
    const first = scenes.find((sc) => sectionOf(sc.line) === i);
    if (first) first.line = st;
    else scenes.push({ line: st, heading: s.sections[i].title, items: [{ line: st, kind: 'text', text: s.sections[i].lines[0].slice(0, 60) }] });
  }
  scenes.sort((a, b) => a.line - b.line);
  scenes = scenes.map((sc, i) => {
    const end = Math.min(scenes[i + 1]?.line ?? total, sectionStart[sectionOf(sc.line) + 1] ?? total);
    const items = sc.items
      .filter((it) => (it.kind === 'image' ? images.some((im) => im.id === it.image) : it.text.trim()))
      .map((it) => ({ ...it, line: Math.max(sc.line, Math.min(end - 1, it.line)) }))
      .sort((a, b) => a.line - b.line)
      .slice(0, 5);
    return { ...sc, heading: sc.heading.slice(0, 40), items };
  });
  return { scenes: scenes.filter((sc) => sc.items.length), images, check: board.check };
}

async function makeBoard(t: Topic, s: Script, dir: string): Promise<Board> {
  const file = join(dir, 'board.json');
  if (existsSync(file)) return readJson<Board>(file);
  const brief = boardBrief(t, s);
  const draftFile = join(dir, 'board-draft.json');
  const draft = existsSync(draftFile) ? readJson<Board>(draftFile) : await chatJson(WRITER, brief, BoardSchema, `${t.id} board`, 0.4);
  saveJson(draftFile, draft);
  const Review = z.object({ issues: z.array(z.string()).max(30), board: BoardSchema });
  const r = await chatJson(
    REVIEWER,
    `You are a senior examiner of ${t.subject} checking the board for a short lesson before it is shown to students. Below are the rules the board was made to, with the teacher's final script, then the board as JSON.

Check every heading and item against the script. Fix:
1. Any fact, number, formula, symbol, unit, spelling or line of working that is wrong or disagrees with the script. Work every calculation yourself.
2. Anything on the board the script does not say or imply; the answer to the quick check appearing before the answer section; a "check" question or answer that does not match the script's.
3. Anything over its length limit, an item placed at a line where the teacher is not talking about it, or a mistakes section without "wrong" and "right" pairs.
Keep what is right exactly as it is.

Return JSON only: {"issues":["each problem you found and what you changed"],"board":{...the full corrected board in the same shape...}}

=== RULES AND SCRIPT ===
${brief}

=== BOARD ===
${JSON.stringify(draft)}`,
    Review,
    `${t.id} board review`,
    0.2,
  );
  saveJson(join(dir, 'board-review.json'), { issues: r.issues });
  const board = tidyBoard(r.board, s, t);
  saveJson(file, board);
  return board;
}

// ─── 3. The voice ─────────────────────────────────────────────────────────────

const REF_AUDIO = join(SERVER, 'data/kora-lessons/voice-ref.wav');
/** What the reference clip says: the cloning model needs its words as well as its sound. */
const REF_TEXT =
  'Have you ever put salt on slices of cucumber? Wait ten minutes, and they are sitting in a little puddle of water. Nobody poured that water in. So where did it come from? Today, I will show you. It is called osmosis, and once you see it, you will spot it everywhere.';
let refs: unknown[] | null = null;
const references = () =>
  (refs ??= [
    { type: 'input_audio', input_audio: { data: readFileSync(REF_AUDIO).toString('base64'), format: 'wav' } },
    { type: 'text', text: REF_TEXT },
  ]);

/** Spellings for the voice only, where it would say a word wrongly (captions keep the real spelling). */
const SAY: [RegExp, string][] = [
  [/\bHTTPS\b/g, 'H T T P S'],
  [/\bHTTP\b/g, 'H T T P'],
  [/\bSAT\b/g, 'S A T'],
  [/\bGCSE\b/g, 'G C S E'],
  [/\bUTME\b/g, 'U T M E'],
  [/\bWASSCE\b/g, 'wass-see'],
  [/\bDNS\b/g, 'D N S'],
  [/\bTLS\b/g, 'T L S'],
  [/\bCTFs\b/g, 'C T Fs'],
  [/\bCTF\b/g, 'C T F'],
  [/\bSOC\b/g, 'sock'],
  [/\bGRC\b/g, 'G R C'],
  [/\bCEH\b/g, 'C E H'],
  [/\bOSCP\b/g, 'O S C P'],
  [/\bCISSP\b/g, 'C I S S P'],
  [/\bISC2\b/gi, 'I S C squared'],
  [/\bUSB\b/g, 'U S B'],
  [/\bATP\b/g, 'A T P'],
  [/\bNADP\b/g, 'N A D P'],
  [/\bIP\b/g, 'I P'],
  [/\bIT\b/g, 'I T'],
  [/\bUK\b/g, 'U K'],
  [/\bUS\b/g, 'U S'],
  [/\bWAEC\b/g, 'Way-ek'],
  [/\bJAMB\b/g, 'Jamb'],
  [/\bNECO\b/g, 'Neeko'],
  [/\bCaesar\b/g, 'Seezer'],
  [/\bHypotonic\b/gi, 'High-po-tonic'],
];

async function speak(text: string, seed: number): Promise<Buffer> {
  budget(0.02);
  const input = SAY.reduce((t, [a, b]) => t.replace(a, b), text);
  const res = await call('/audio/speech', {
    method: 'POST',
    headers: { ...AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: VOICE_MODEL, voice: 'clone', input_references: references(), language: 'English', input, response_format: 'wav', seed }),
  });
  const buf = Buffer.from(await res.arrayBuffer());
  const secs = Number(res.headers.get('x-usage-seconds') ?? 0);
  spend('speech', VOICE_MODEL, Number(res.headers.get('x-usage-cost') ?? secs * 0.00028), `${secs}s`);
  return buf;
}

/** One line's clip: tried again while its pace says words were skipped or repeated. */
async function speakLine(text: string, file: string, seed: number) {
  let best: { buf: Buffer; off: number } | null = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    const buf = await speak(text, seed + attempt * 1000);
    let pace = 0;
    try {
      const clip = trimWav(readWav(buf));
      pace = text.length / (clip.samples.length / clip.rate);
    } catch {
      continue;
    }
    const off = Math.abs(Math.log(pace / 15.5));
    if (!best || off < best.off) best = { buf, off };
    if ((pace > 11 && pace < 19.5) || text.length < 34) break;
  }
  if (!best) throw new Error(`No usable clip for "${text.slice(0, 40)}"`);
  writeFileSync(file, best.buf);
}

type Aligned = {
  duration: number;
  lines: { index: number; start: number; end: number; score: number; certain: boolean }[];
  words: { line: number; text: string; start: number; end: number; score: number }[];
  unaligned?: unknown[];
};
type LineTime = { section: number; text: string; start: number; end: number };
type Narration = { rate: number; duration: number; lines: LineTime[]; sections: { start: number; end: number }[]; pauseAt: number };

const LEAD = 0.5; // before her first word
const GAP = 0.3; // between lines
const SECTION_GAP = 0.85;
const TAIL = 0.6;

/** Joins the line clips into one narration and says where every line landed. */
function joinClips(s: Script, voiceDir: string): { wav: Wav; narration: Narration } {
  let rate = 0;
  let t = LEAD;
  let n = 0;
  const parts: { at: number; samples: Float32Array }[] = [];
  const lines: LineTime[] = [];
  const sections: { start: number; end: number }[] = [];
  let pauseAt = 0;
  for (const [si, sec] of s.sections.entries()) {
    const start = si === 0 ? 0 : t - SECTION_GAP / 2;
    for (const [i, text] of sec.lines.entries()) {
      const clip = trimWav(readWav(readFileSync(join(voiceDir, `${n++}.wav`))));
      rate ||= clip.rate;
      if (clip.rate !== rate) throw new Error('Mixed sample rates');
      // Fade the ends so joins never click.
      const f = Math.round(rate * 0.012);
      for (let k = 0; k < f && k < clip.samples.length; k++) {
        clip.samples[k] *= k / f;
        clip.samples[clip.samples.length - 1 - k] *= k / f;
      }
      const seconds = clip.samples.length / rate;
      parts.push({ at: t, samples: clip.samples });
      lines.push({ section: si, text, start: +t.toFixed(3), end: +(t + seconds).toFixed(3) });
      t += seconds + (i === sec.lines.length - 1 ? 0 : GAP + (/\?$/.test(text) ? 0.15 : 0));
    }
    if (sec.id === 'check') pauseAt = +(t + 0.25).toFixed(3);
    t += SECTION_GAP;
    sections.push({ start: +start.toFixed(3), end: +(t - SECTION_GAP / 2).toFixed(3) });
  }
  const duration = t - SECTION_GAP + TAIL;
  sections[sections.length - 1].end = +duration.toFixed(3);
  const all = new Float32Array(Math.ceil(duration * rate));
  for (const p of parts) all.set(p.samples, Math.round(p.at * rate));
  // A steady level: peak at about -1.5 dB.
  let peak = 0;
  for (const v of all) peak = Math.max(peak, Math.abs(v));
  for (let i = 0; i < all.length; i++) all[i] *= 0.84 / (peak || 1);
  return { wav: { rate, samples: all }, narration: { rate, duration: +duration.toFixed(3), lines, sections, pauseAt } };
}

async function align(wav: Buffer, lines: string[], seconds: number): Promise<Aligned> {
  budget(0.02);
  const form = new FormData();
  form.set('model', 'aligner-1');
  form.set('mode', 'speech');
  form.set('text', lines.join('\n'));
  form.set('file', new Blob([new Uint8Array(wav)], { type: 'audio/wav' }), 'narration.wav');
  const res = await call('/audio/alignments', { method: 'POST', headers: AUTH, body: form });
  const al = (await res.json()) as Aligned & { usage?: { cost?: number } };
  spend('align', 'aligner-1', al.usage?.cost ?? seconds * 0.0000333, `${seconds.toFixed(0)}s`);
  return al;
}

async function makeVoice(t: Topic, s: Script, dir: string): Promise<{ narration: Narration; aligned: Aligned }> {
  const voiceDir = join(dir, 'voice');
  mkdirSync(voiceDir, { recursive: true });
  const texts = s.sections.flatMap((x) => x.lines);
  const scriptKey = JSON.stringify(texts);
  const keyFile = join(voiceDir, 'lines.json');
  // A changed script changes its clips: only the lines that differ are spoken again.
  const before = existsSync(keyFile) ? readJson<string[]>(keyFile) : [];
  const stale = texts.map((text, i) => before[i] !== text || !existsSync(join(voiceDir, `${i}.wav`)));
  await pool(texts, PARALLEL, async (text, i) => {
    if (stale[i]) await speakLine(text, join(voiceDir, `${i}.wav`), 100 + i);
  });
  saveJson(keyFile, texts);

  const alignFile = join(dir, 'alignment.json');
  let aligned = existsSync(alignFile) && !stale.some(Boolean) ? readJson<Aligned & { key?: string }>(alignFile) : null;
  if (aligned && (aligned as { key?: string }).key !== scriptKey) aligned = null;
  let joined = joinClips(s, voiceDir);
  for (let round = 0; !aligned && round < 3; round++) {
    const al = await align(writeWav(joined.wav), texts, joined.narration.duration);
    // A line the aligner isn't sure it heard was probably misread: say it again with another seed.
    const doubtful = al.lines.filter((l) => !l.certain || l.score < 0.55).map((l) => l.index);
    if (!doubtful.length || round === 2) {
      aligned = al;
      if (doubtful.length) console.log(`  ${t.id}: ${doubtful.length} line(s) the aligner is still unsure of: ${doubtful.join(', ')}`);
      break;
    }
    console.log(`  ${t.id}: saying ${doubtful.length} doubtful line(s) again (${doubtful.join(', ')})`);
    await pool(doubtful, PARALLEL, async (i) => speakLine(texts[i], join(voiceDir, `${i}.wav`), 5000 + round * 777 + i));
    joined = joinClips(s, voiceDir);
  }
  saveJson(alignFile, { ...aligned, key: scriptKey });
  writeFileSync(join(dir, 'narration.wav'), writeWav(joined.wav));
  saveJson(join(dir, 'narration.json'), joined.narration);
  return { narration: joined.narration, aligned: aligned! };
}

// ─── 4. Pictures ──────────────────────────────────────────────────────────────

type Credit = { file: string; title: string; author: string; licence: string; source: string };
const UA = { 'User-Agent': 'lesson-builder/1.0 (educational use)' };
const strip = (s: string | undefined) => (s ?? '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const FREE = /^(cc0|cc[ -]by([ -]sa)?[ -]?[0-9.]*|public domain|pd\b|no restrictions)/i;

async function commons(params: Record<string, string>) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ action: 'query', format: 'json', prop: 'imageinfo', iiprop: 'url|extmetadata|size|mime', iiurlwidth: '960', ...params });
  return (await (await call(url, { headers: UA }, 3)).json()) as {
    query?: { pages?: Record<string, { title: string; imageinfo?: { thumburl: string; descriptionurl: string; width: number; height: number; mime: string; extmetadata: Record<string, { value: string }> }[] }> };
  };
}

async function findPicture(t: Topic, want: Board['images'][number], dir: string): Promise<Credit | null> {
  const j = await commons({ generator: 'search', gsrnamespace: '6', gsrsearch: `${want.wiki} filetype:bitmap|drawing`, gsrlimit: '14' });
  const found = Object.values(j.query?.pages ?? {})
    .map((p) => ({ title: p.title, info: p.imageinfo?.[0] }))
    .filter((p) => p.info && FREE.test(strip(p.info.extmetadata.LicenseShortName?.value)) && p.info.width >= 500 && p.info.width / p.info.height > 0.7 && p.info.width / p.info.height < 2.4)
    .slice(0, 10);
  if (!found.length) return null;
  const Pick = z.object({ pick: z.number().int().min(-1).max(found.length - 1), why: z.string().max(300) });
  const r = await chatJson(
    WRITER,
    `A three-minute lesson, "${t.title}" (${t.subject}, ${t.label}), needs one picture for its board: "${want.caption}" (searched as "${want.wiki}"). Below are candidate files from Wikimedia Commons with their descriptions. Choose the one that is accurate for the lesson, clear at a small size, and in English or without words (a diagram labelled in another language is no good; so is a cluttered one, or a photo of the wrong thing). If none is right, answer -1: a wrong picture is worse than none.

${found.map((p, i) => `${i}: ${p.title} (${p.info!.width}×${p.info!.height}) ${strip(p.info!.extmetadata.ImageDescription?.value).slice(0, 220)}`).join('\n')}

Return JSON only: {"pick": <number or -1>, "why": "<one sentence>"}`,
    Pick,
    `${t.id} picture ${want.id}`,
    0.1,
  );
  if (r.pick < 0) return null;
  const p = found[r.pick];
  const res = await call(p.info!.thumburl, { headers: UA }, 3);
  const file = `${want.id}.webp`;
  await sharp(Buffer.from(await res.arrayBuffer())).flatten({ background: '#ffffff' }).resize({ width: 880, height: 620, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toFile(join(dir, file));
  return { file, title: p.title.replace(/^File:/, ''), author: strip(p.info!.extmetadata.Artist?.value).slice(0, 80) || 'Unknown', licence: strip(p.info!.extmetadata.LicenseShortName?.value), source: p.info!.descriptionurl };
}

async function drawPicture(want: Board['images'][number], dir: string): Promise<Credit> {
  budget(0.03);
  const res = await call('/images/generations', {
    method: 'POST',
    headers: { ...AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'z-image-turbo', prompt: `${want.ai} Clean modern educational illustration, flat colours, white background. Absolutely no text, no letters, no numbers, no labels.`, size: '1024x704', response_format: 'b64_json' }),
  });
  const j = (await res.json()) as { data: { b64_json?: string; url?: string }[]; usage?: { cost?: number } };
  const d = j.data[0];
  const buf = d.b64_json ? Buffer.from(d.b64_json, 'base64') : Buffer.from(await (await call(d.url!, {})).arrayBuffer());
  spend('image', 'z-image-turbo', j.usage?.cost ?? 0.0145, want.id);
  const file = `${want.id}.webp`;
  await sharp(buf).resize({ width: 880 }).webp({ quality: 78 }).toFile(join(dir, file));
  return { file, title: want.caption, author: 'Drawn by AI for Knowzone', licence: 'Knowzone', source: '' };
}

async function makePictures(t: Topic, board: Board, dir: string): Promise<Credit[]> {
  const picDir = join(dir, 'pictures');
  mkdirSync(picDir, { recursive: true });
  const file = join(picDir, 'credits.json');
  const credits = existsSync(file) ? readJson<Credit[]>(file) : [];
  for (const want of board.images) {
    const have = credits.find((c) => c.file === `${want.id}.webp`);
    if (have && existsSync(join(picDir, have.file))) continue;
    let credit: Credit | null = null;
    try {
      credit = await findPicture(t, want, picDir);
    } catch (e) {
      console.log(`  ${t.id}: Wikimedia search failed for ${want.id} (${e instanceof Error ? e.message.slice(0, 80) : e})`);
    }
    credit ??= await drawPicture(want, picDir);
    credits.push(credit);
    saveJson(file, credits);
  }
  return credits.filter((c) => board.images.some((w) => `${w.id}.webp` === c.file) && existsSync(join(picDir, c.file)));
}

// ─── 5. The app's files ───────────────────────────────────────────────────────

function ffmpeg() {
  const named = process.env.KORA_FFMPEG;
  if (named && existsSync(named)) return named;
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return 'ffmpeg';
  } catch {
    throw new Error('ffmpeg not found: put it on the PATH or set KORA_FFMPEG to its path');
  }
}

/** The credit shown under a picture: who made it and its licence, as its licence asks. */
const creditLine = (c: Credit) => (c.source ? `${c.author.split(/[,(]/)[0].trim()} · ${c.licence} · Wikimedia Commons` : 'AI illustration');

export type LessonFile = ReturnType<typeof lessonFile>;

function lessonFile(t: Topic, s: Script, board: Board, narration: Narration, aligned: Aligned, credits: Credit[], level: Float32Array, hasClip: boolean) {
  const texts = s.sections.flatMap((x) => x.lines);
  // Caption words carry the aligner's time where it timed every word of the line, else an even spread.
  const timed: TimedWord[] = [];
  const lines = narration.lines.map((l, i) => {
    const tokens = l.text.split(/\s+/).filter(Boolean);
    const heard = aligned.words.filter((w) => w.line === i);
    let spans: [number, number][];
    if (heard.length === tokens.length && heard.every((w) => w.end >= w.start)) {
      spans = heard.map((w) => [Math.max(l.start, Math.min(w.start, l.end)), Math.max(l.start, Math.min(w.end, l.end + 0.1))]);
    } else {
      const chars = tokens.reduce((a, w) => a + w.length + 1, 0);
      let at = l.start;
      spans = tokens.map((w) => {
        const d = ((w.length + 1) / chars) * (l.end - l.start);
        at += d;
        return [at - d, at - d * 0.15];
      });
    }
    // The aligner ends a word where its last sound fades; in running speech the mouth carries on into the next word.
    tokens.forEach((w, k) => {
      const next = spans[k + 1]?.[0];
      const end = next !== undefined && next - spans[k][1] < 0.3 ? next : Math.min(l.end, spans[k][1] + 0.08);
      timed.push({ text: w, start: spans[k][0], end: Math.max(end, spans[k][0] + 0.05) });
    });
    return { s: l.section, a: l.start, b: l.end, text: l.text, w: spans.map((x) => +x[0].toFixed(2)) };
  });
  const lineStart = (n: number) => narration.lines[Math.min(n, narration.lines.length - 1)].start;
  const checkIndex = s.sections.findIndex((x) => x.id === 'check');
  const picture = (id?: string) => credits.find((c) => c.file === `${id}.webp`);
  type Item = { at: number; kind: (typeof ITEM_KINDS)[number] | 'question'; text: string; detail?: string; src?: string; credit?: string };
  const scenes: { at: number; heading: string; items: Item[] }[] = board.scenes
    .map((sc) => ({
      at: +Math.max(0, lineStart(sc.line) - 0.25).toFixed(2),
      heading: sc.heading,
      items: sc.items
        .filter((it) => (it.kind === 'image' ? picture(it.image) : it.kind === 'clip' ? hasClip : true))
        .map((it) => ({
          at: +Math.max(0, lineStart(it.line) - 0.1).toFixed(2),
          kind: it.kind,
          text: it.text,
          ...(it.detail ? { detail: it.detail } : {}),
          ...(it.kind === 'image' ? { src: picture(it.image)!.file, text: board.images.find((im) => im.id === it.image)?.caption ?? '', credit: creditLine(picture(it.image)!) } : {}),
          ...(it.kind === 'clip' ? { src: 'clip.mp4' } : {}),
        })),
    }))
    .filter((sc) => sc.items.length);
  // The quick check has the board to itself.
  scenes.push({ at: +narration.sections[checkIndex].start.toFixed(2), heading: s.sections[checkIndex].title, items: [{ at: +narration.sections[checkIndex].start.toFixed(2), kind: 'question', text: board.check.question }] });
  scenes.sort((a, b) => a.at - b.at);
  const frames = level.length;
  return {
    id: t.id,
    title: t.title,
    subject: t.subject,
    label: t.label,
    exams: t.exams,
    language: 'en',
    seconds: Math.round(narration.duration),
    duration: narration.duration,
    audio: 'voice.mp3',
    words: countWords(texts),
    sections: s.sections.map((sec, i) => ({ id: sec.id, title: sec.title, start: narration.sections[i].start, end: narration.sections[i].end })),
    lines,
    scenes,
    check: { at: narration.pauseAt, seconds: 10, question: board.check.question, answer: board.check.answer },
    /** Kora's mouth and the loudness of her voice, one digit per frame. */
    fps: FPS,
    mouth: mouthTimeline(timed, level),
    level: Array.from({ length: frames }, (_, f) => Math.min(9, Math.round(level[f] * 9))).join(''),
    credits: credits.map(({ file, ...c }) => c),
    voice: `${VOICE_MODEL} (cloned voice)`,
  };
}

async function build(t: Topic, s: Script, board: Board, narration: Narration, aligned: Aligned, credits: Credit[], dir: string) {
  const out = join(OUT, t.id);
  mkdirSync(out, { recursive: true });
  const wav = readWav(readFileSync(join(dir, 'narration.wav')));
  const hasClip = existsSync(join(dir, 'clip.mp4'));
  if (hasClip) copyFileSync(join(dir, 'clip.mp4'), join(out, 'clip.mp4'));
  const lesson = lessonFile(t, s, board, narration, aligned, credits, loudness(wav.samples, wav.rate), hasClip);
  execFileSync(ffmpeg(), ['-y', '-loglevel', 'error', '-i', join(dir, 'narration.wav'), '-ac', '1', '-ar', '24000', '-codec:a', 'libmp3lame', '-b:a', '48k', join(out, 'voice.mp3')]);
  for (const c of credits) copyFileSync(join(dir, 'pictures', c.file), join(out, c.file));
  writeFileSync(join(out, 'lesson.json'), JSON.stringify(lesson));
  return lesson;
}

/** index.json: the list the app shows, in the topics' order, for the lessons that are built. */
function writeIndex() {
  const lessons = TOPICS.filter((t) => existsSync(join(OUT, t.id, 'lesson.json'))).map((t) => {
    const l = readJson<LessonFile>(join(OUT, t.id, 'lesson.json'));
    return { id: l.id, title: l.title, subject: l.subject, label: l.label, group: t.group, exams: l.exams, language: l.language, seconds: l.seconds };
  });
  writeFileSync(join(OUT, 'index.json'), JSON.stringify({ version: 1, lessons }));
  let bytes = 0;
  for (const d of readdirSync(OUT, { withFileTypes: true }))
    if (d.isDirectory()) for (const f of readdirSync(join(OUT, d.name))) bytes += statSync(join(OUT, d.name, f)).size;
  console.log(`index.json: ${lessons.length} lessons, ${(bytes / 1e6).toFixed(1)} MB in all`);
}

// ─── Run ──────────────────────────────────────────────────────────────────────

const topics = TOPICS.filter((t) => !ONLY || ONLY.includes(t.id));
const failed: string[] = [];
await pool(topics, LESSONS_AT_ONCE, async (t) => {
  const dir = join(WORK, t.id);
  mkdirSync(dir, { recursive: true });
  try {
    const has = (step: string) => STEPS.includes(step);
    const need = (file: string) => {
      if (!existsSync(join(dir, file))) throw new Error(`no ${file} yet: run the earlier steps`);
    };
    if (!has('script')) need('script.json');
    const script = await makeScript(t, dir);
    if (!has('board') && !has('voice') && !has('pictures') && !has('build')) return console.log(`${t.id}: script ${countWords(script.sections.flatMap((x) => x.lines))} words`);
    if (!has('board')) need('board.json');
    const board = await makeBoard(t, script, dir);
    if (!has('voice') && !has('pictures') && !has('build')) return console.log(`${t.id}: board ${board.scenes.length} scenes`);
    let voice: { narration: Narration; aligned: Aligned } | null = null;
    if (has('voice')) voice = await makeVoice(t, script, dir);
    const credits = has('pictures') ? await makePictures(t, board, dir) : existsSync(join(dir, 'pictures/credits.json')) ? readJson<Credit[]>(join(dir, 'pictures/credits.json')) : [];
    if (!has('build')) return console.log(`${t.id}: done to ${STEPS.at(-1)}`);
    if (!voice) {
      need('narration.json');
      voice = { narration: readJson<Narration>(join(dir, 'narration.json')), aligned: readJson<Aligned>(join(dir, 'alignment.json')) };
    }
    const lesson = await build(t, script, board, voice.narration, voice.aligned, credits.filter((c) => board.images.some((w) => `${w.id}.webp` === c.file)), dir);
    console.log(`${t.id}: ${lesson.words} words, ${Math.floor(lesson.seconds / 60)}:${String(lesson.seconds % 60).padStart(2, '0')}, ${lesson.scenes.length} scenes, ${lesson.credits.length} pictures · spent $${spent.toFixed(2)}`);
  } catch (e) {
    failed.push(t.id);
    console.log(`${t.id}: FAILED ${e instanceof Error ? scrub(e.message) : e}`);
  }
});
if (STEPS.includes('build')) writeIndex();
console.log(`spent $${spent.toFixed(3)} of $${CAP}${failed.length ? ` · failed: ${failed.join(', ')}` : ''}`);
