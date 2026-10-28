/**
 * Writes the "Did you know?" reels (the dashboard's Flashcards feed) into data/facts/.
 *
 *  1. facts.json: surprising facts by subject, written by OpenAI and kept only if a second,
 *     independent pass confirms they're accurate (popular "facts" are often myths).
 *  2. reels.json: for REELS facts per subject, a short video of 5 cards explaining that one fact
 *     (the hook, three cards explaining it, a takeaway). The whole reel is checked again, translated
 *     into the other 9 languages, and each card gets a realistic picture (img/<reel>-<n>.webp) and
 *     English narration (audio/<reel>-<n>.mp3).
 *
 * Everything is saved as it's made, so a re-run only does what's missing. Run from apps/server:
 *
 *   npx tsx scripts/fun-facts.ts                    # 5 reels per subject
 *   npx tsx scripts/fun-facts.ts --reels 8 --budget 5
 *   npx tsx scripts/fun-facts.ts --no-translate     # pictures and narration first, translations later
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { zodTextFormat } from 'openai/helpers/zod';
import sharp from 'sharp';
import { z } from 'zod';

import { config } from '../src/config.js';
import { FACT_SUBJECTS, type Fact, type FactSubject, type Reel } from '../src/data/facts.js';
import { mp3Seconds } from '../src/lib/mp3.js';
import { openaiClient } from '../src/services/ai.js';

const args = process.argv.slice(2);
const flag = (name: string) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined);
const PER = Number(flag('facts') ?? 10);
const REELS = Number(flag('reels') ?? 5);
const BUDGET = Number(flag('budget') ?? 4);

const OUT = join(import.meta.dirname, '../data/facts');
const IMG = join(OUT, 'img');
const AUDIO = join(OUT, 'audio');
mkdirSync(IMG, { recursive: true });
mkdirSync(AUDIO, { recursive: true });
const FACTS = join(OUT, 'facts.json');
const REELS_FILE = join(OUT, 'reels.json');
const SPEND = join(OUT, '.spend.json');
const facts: Fact[] = existsSync(FACTS) ? JSON.parse(readFileSync(FACTS, 'utf8')) : [];
const reels: Reel[] = existsSync(REELS_FILE) ? JSON.parse(readFileSync(REELS_FILE, 'utf8')) : [];
let spent = existsSync(SPEND) ? (JSON.parse(readFileSync(SPEND, 'utf8')) as { usd: number }).usd : 0;
const save = () => {
  writeFileSync(FACTS, JSON.stringify(facts, null, 1));
  writeFileSync(REELS_FILE, JSON.stringify(reels, null, 1));
  writeFileSync(SPEND, JSON.stringify({ usd: Math.round(spent * 10000) / 10000 }));
};
// gpt-5-mini per million tokens; gpt-image-1-mini low quality portrait per picture; mini TTS per minute.
const PRICE = { input: 0.25, output: 2, image: 0.006, voicePerMinute: 0.015 };
const charge = (u?: { input_tokens: number; output_tokens: number }) => {
  if (u) spent += (u.input_tokens * PRICE.input + u.output_tokens * PRICE.output) / 1e6;
  if (spent > BUDGET) throw new Error(`Budget of $${BUDGET} reached`);
};
const slug = (s: string) => s.replace(/\W+/g, '-');

const LANGS = {
  pcm: 'Nigerian Pidgin',
  yo: 'Yoruba (with full tone marks)',
  ig: 'Igbo',
  ha: 'Hausa',
  fr: 'French',
  ar: 'Arabic',
  sw: 'Swahili',
  pt: 'European Portuguese',
  es: 'Spanish',
} as const;

const Written = z.object({ facts: z.array(z.object({ fact: z.string(), detail: z.string(), picture: z.string() })) });
const Checked = z.object({ results: z.array(z.object({ n: z.number().int(), verdict: z.enum(['true', 'false', 'unsure']) })) });
const Cards = z.object({ cards: z.array(z.object({ text: z.string(), picture: z.string() })).length(5) });
const Translated = z.object({ reels: z.array(z.object({ n: z.number().int(), cards: z.array(z.string()) })) });

async function write(subject: FactSubject, count: number, avoid: string[]) {
  const res = await openaiClient().responses.parse({
    model: config.OPENAI_MODEL_GENERATE,
    reasoning: { effort: 'low' },
    input: [
      `Write ${count} surprising, true "Did you know?" facts about ${subject} for curious secondary-school students (aged 12–18) around the world, including Africa.`,
      'Each "fact" is one punchy sentence (at most 140 characters) that starts with "Did you know" and makes people say "wow". Each "detail" (2–3 short sentences) explains why or how it is true, simply.',
      'Only well-established facts that textbooks and reliable sources agree on: no myths, no "fun facts" that are actually false (e.g. no "we only use 10% of our brain", no "goldfish have 3-second memories"), no exaggerated numbers. Prefer facts that connect to what students learn in class.',
      '"picture" describes a realistic photo (or photo-real scientific image) that shows the fact, with no text, numbers or labels in it, and no recognisable real people.',
      avoid.length ? `Do not repeat these: ${avoid.join(' | ')}` : '',
    ].join('\n'),
    text: { format: zodTextFormat(Written, 'facts') },
  });
  charge(res.usage);
  return res.output_parsed?.facts ?? [];
}

/** An independent check: only statements it confirms are true pass. */
async function check(list: string[]) {
  const res = await openaiClient().responses.parse({
    model: config.OPENAI_MODEL_GENERATE,
    reasoning: { effort: 'medium' },
    input: `You are fact-checking short educational texts before students see them. For each, answer "true" only if everything in it is accurate as stated (numbers included) according to well-established sources; "false" if anything is wrong, a myth or exaggerated; "unsure" if it is disputed or you can't be confident.\n\n${list.map((t, i) => `${i + 1}. ${t}`).join('\n\n')}`,
    text: { format: zodTextFormat(Checked, 'fact_check') },
  });
  charge(res.usage);
  const ok = new Map((res.output_parsed?.results ?? []).map((r) => [r.n, r.verdict]));
  return list.map((_, i) => ok.get(i + 1) === 'true');
}

/** One fact as a reel of 5 cards: the hook, three cards explaining it, a takeaway. */
async function cardsFor(f: Fact) {
  const res = await openaiClient().responses.parse({
    model: config.OPENAI_MODEL_GENERATE,
    reasoning: { effort: 'low' },
    input: [
      `Turn this fact into a short "Did you know?" video of exactly 5 cards for secondary-school students: ${f.text.en!.fact} (${f.text.en!.detail})`,
      'Card 1 is the hook: the fact itself as one punchy "Did you know…?" line. Cards 2–4 explain it step by step (how, why, a vivid comparison or everyday example). Card 5 is a memorable takeaway.',
      'Each "text" is at most 150 characters, simple and lively, and reads well aloud. Only accurate, well-established information, with exact numbers.',
      'Each "picture" describes a different realistic photo (or photo-real scientific image) for that card, with no text, numbers or labels in it and no recognisable real people.',
    ].join('\n'),
    text: { format: zodTextFormat(Cards, 'reel') },
  });
  charge(res.usage);
  return res.output_parsed?.cards ?? [];
}

async function translate(list: Reel[], lang: keyof typeof LANGS) {
  const res = await openaiClient().responses.parse({
    model: config.OPENAI_MODEL_GENERATE,
    reasoning: { effort: 'low' },
    input: `Translate the cards of these short "Did you know?" videos for secondary-school students into ${LANGS[lang]}. Keep each card short and lively, start card 1 with the natural way to say "Did you know" in that language, and keep numbers and units exact. Return the same number of cards for each video, in order.\n\n${JSON.stringify(list.map((r, i) => ({ n: i + 1, cards: r.cards.map((c) => c.text.en) })))}`,
    text: { format: zodTextFormat(Translated, 'translation') },
  });
  charge(res.usage);
  for (const t of res.output_parsed?.reels ?? []) {
    const r = list[t.n - 1];
    if (r && t.cards.length === r.cards.length) t.cards.forEach((text, k) => (r.cards[k]!.text[lang] = text));
  }
}

async function picture(file: string, prompt: string) {
  if (existsSync(file)) return;
  const res = await openaiClient().images.generate({
    model: config.OPENAI_MODEL_IMAGE,
    prompt: `${prompt} Realistic, vivid, high-detail photograph style, natural light, portrait composition with the subject in the upper two-thirds. No text, letters, numbers, labels, watermarks or logos.`,
    size: '1024x1536',
    quality: 'low',
    n: 1,
  });
  spent += PRICE.image;
  const b64 = res.data?.[0]?.b64_json;
  if (!b64) throw new Error('no picture');
  writeFileSync(file, await sharp(Buffer.from(b64, 'base64')).resize(720, 1080).webp({ quality: 72 }).toBuffer());
}

async function narrate(file: string, text: string) {
  const res = await openaiClient().audio.speech.create({
    model: config.OPENAI_MODEL_TTS,
    voice: 'coral',
    input: text,
    instructions: 'An upbeat, curious young presenter sharing an amazing fact with students: warm, lively, clear, a natural pace.',
    response_format: 'mp3',
  });
  const mp3 = Buffer.from(await res.arrayBuffer());
  writeFileSync(file, mp3);
  const seconds = Math.round(mp3Seconds(mp3) * 10) / 10;
  spent += (seconds / 60) * PRICE.voicePerMinute;
  return seconds;
}

/** Runs jobs a few at a time; a failure is logged and retried on the next run. */
async function inBatches<T>(list: T[], size: number, job: (x: T) => Promise<void>, label: string) {
  for (let i = 0; i < list.length; i += size) {
    await Promise.all(list.slice(i, i + size).map((x) => job(x).catch((e: Error) => console.warn(`  ${label}: ${e.message}`))));
    save();
    console.log(`${label} ${Math.min(i + size, list.length)}/${list.length} · $${spent.toFixed(3)}`);
  }
}

// 1. Facts in English, checked.
for (const subject of FACT_SUBJECTS) {
  for (let tries = 0; facts.filter((f) => f.subject === subject).length < PER && tries < 4; tries++) {
    const have = facts.filter((f) => f.subject === subject);
    const fresh = await write(
      subject,
      PER - have.length + 3,
      have.map((f) => f.text.en!.fact),
    );
    const ok = await check(fresh.map((f) => `${f.fact} ${f.detail}`));
    for (const g of fresh.filter((_, i) => ok[i]).slice(0, PER - have.length)) {
      facts.push({
        id: `${slug(subject)}-${String(have.length + 1).padStart(2, '0')}`,
        subject,
        picture: g.picture,
        text: { en: { fact: g.fact, detail: g.detail } },
      });
      have.push(facts.at(-1)!);
    }
    save();
    console.log(`${subject}: ${have.length} facts · $${spent.toFixed(3)}`);
  }
}

// 2. Reels: the first REELS facts of each subject, each explained in 5 cards, checked.
for (const subject of FACT_SUBJECTS) {
  for (const f of facts.filter((x) => x.subject === subject).slice(0, REELS * 2)) {
    if (reels.filter((r) => r.subject === subject).length >= REELS) break;
    if (reels.some((r) => r.fact === f.id)) continue;
    for (let tries = 0; tries < 2; tries++) {
      const cards = await cardsFor(f);
      if (cards.length !== 5 || !(await check([cards.map((c) => c.text).join(' ')]))[0]) continue;
      reels.push({ id: f.id, subject, fact: f.id, cards: cards.map((c) => ({ text: { en: c.text }, picture: c.picture })) });
      break;
    }
    save();
  }
  console.log(`${subject}: ${reels.filter((r) => r.subject === subject).length} reels · $${spent.toFixed(3)}`);
}

// 3. Translations, 6 reels at a time (--no-translate skips them for now).
for (const lang of args.includes('--no-translate') ? [] : (Object.keys(LANGS) as (keyof typeof LANGS)[])) {
  const todo = reels.filter((r) => r.cards.some((c) => !c.text[lang]));
  for (let i = 0; i < todo.length; i += 6) {
    await translate(todo.slice(i, i + 6), lang).catch((e: Error) => console.warn(`  ${lang}: ${e.message}`));
    save();
  }
  if (todo.length) console.log(`translated into ${lang} · $${spent.toFixed(3)}`);
}

// 4. A picture for every card, then 5. English narration for every card.
const cards = reels.flatMap((r) => r.cards.map((c, k) => ({ r, c, name: `${r.id}-${k + 1}` })));
await inBatches(
  cards.filter((x) => !existsSync(join(IMG, `${x.name}.webp`))),
  4,
  (x) => picture(join(IMG, `${x.name}.webp`), x.c.picture),
  'pictures',
);
await inBatches(
  cards.filter((x) => !x.c.seconds || !existsSync(join(AUDIO, `${x.name}.mp3`))),
  4,
  async (x) => {
    x.c.seconds = await narrate(join(AUDIO, `${x.name}.mp3`), x.c.text.en!);
  },
  'narration',
);
console.log(`Done: ${reels.length} reels, ${cards.length} cards. Spent $${spent.toFixed(3)}.`);
