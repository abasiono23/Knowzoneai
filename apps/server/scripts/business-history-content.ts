/**
 * Content for the Museum of Time (History) and the Business District on the ten-level ladder, written
 * and checked with open models on Vultr Serverless Inference, like scripts/word-games-content.ts:
 *
 *   - a writer (deepseek-v4.1-flash-1017) writes eras, civilizations, African countries and their
 *     graded questions, a timeline of dated events, and translations of the new Business words;
 *   - a checker (qwen3.8-27b), a different model, answers every question blind (it must pick the same
 *     answer, and say the question is clear and fair), dates every event blind (the years must agree),
 *     names each civilization from its finds, and places each country (within 3 degrees);
 *   - an auditor (glm-5.3-flash), a third model, reads a sample of what passed.
 *
 * Code checks everything before any model sees it: shapes and lengths, the answer not among the wrong
 * options or in the question, years that match their date text, eras whose dates agree with the
 * timeline, countries inside the map's outline of Africa, placeholders kept in translations. Every
 * candidate and verdict is kept in .business-history/ as it is made, so a stopped run carries on.
 * Money is counted in .business-history/spend.json across runs; --budget is the most ever spent ($3).
 * Run from apps/server:
 *
 *   npx tsx scripts/business-history-content.ts                     # everything
 *   npx tsx scripts/business-history-content.ts --stages eras,check  # some stages
 *   npx tsx scripts/business-history-content.ts --stages build       # only rewrite the data file
 *
 * Stages: eras, civs, countries, extras, events (writing), check (checker), audit, build (writes
 * src/data/history/more.ts), text (translations: apps/mobile/src/lib/games/{business,history}-text.ts).
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { z } from 'zod';

import { config } from '../src/config.js';
import { CIVILIZATIONS } from '../src/data/history/civilizations.js';
import { COUNTRIES } from '../src/data/history/countries.js';
import { ERAS } from '../src/data/history/eras.js';
import { parseModelJson, vultrCost, type VultrUsage } from '../src/services/vultr.js';

const VULTR_BASE = 'https://api.vultrinference.com/v1';
const args = process.argv.slice(2);
const flag = (name: string) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined);
const STAGES = (flag('stages') ?? 'eras,civs,countries,extras,events,check,audit,build').split(',');
const BUDGET = Number(flag('budget') ?? 3);
const CALLS = Number(flag('calls') ?? 6);
const WRITER = 'deepseek-v4.1-flash-1017';
const CHECKER = 'qwen3.8-27b';
const AUDITOR = 'glm-5.3-flash';

const WORK = resolve(import.meta.dirname, '../.business-history');
const DATA = resolve(import.meta.dirname, '../src/data/history');
const MOBILE = resolve(import.meta.dirname, '../../mobile/src');
mkdirSync(WORK, { recursive: true });
const SPEND = join(WORK, 'spend.json');

// ─── Money and calls ──────────────────────────────────────────────────────────

type Ledger = { vultrUsd: number; calls: number; byModel: Record<string, number> };
let money: Ledger = existsSync(SPEND) ? (JSON.parse(readFileSync(SPEND, 'utf8')) as Ledger) : { vultrUsd: 0, calls: 0, byModel: {} };
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
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
function note(model: string, task: string, usage: VultrUsage | undefined, usd: number, error?: string) {
  const line = { at: new Date().toISOString(), model, task: task.slice(0, 60), ...usage, usd: Math.round(usd * 1e6) / 1e6, ...(error && { error }) };
  appendFileSync(join(WORK, 'calls.jsonl'), `${JSON.stringify(line)}\n`);
}

type Completion = { choices?: { message?: { content?: string }; finish_reason?: string }[]; usage?: { prompt_tokens?: number; completion_tokens?: number } };
/** One JSON request with the model's thinking off (see word-games-content.ts for why). */
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
            max_tokens: 14000,
            temperature,
            response_format: { type: 'json_object' },
            chat_template_kwargs: model.startsWith('qwen') ? { enable_thinking: false } : { thinking: false },
          }),
          signal: AbortSignal.timeout(300_000),
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

/** One JSON request. Null when the answer was unusable (the batch is then skipped and tried next run). */
async function ask<T>(model: string, task: string, prompt: string, schema: z.ZodType<T>, shape: string, temperature: number): Promise<T | null> {
  if (!canSpend()) throw new OutOfMoney();
  const input = `${prompt}\n\nAnswer with one JSON object and nothing else, in exactly this shape: ${shape}`;
  try {
    const r = await slot(model, () => {
      if (!canSpend()) throw new OutOfMoney();
      return quickJson(model, input, schema, temperature);
    });
    charge(model, r.costUsd);
    note(model, task, r.usage, r.costUsd);
    return r.data;
  } catch (e) {
    if (e instanceof OutOfMoney) throw e;
    const used = e as { costUsd?: number; usage?: VultrUsage };
    if (used.costUsd) charge(model, used.costUsd);
    note(model, task, used.usage, used.costUsd ?? 0, (e instanceof Error ? e.message : String(e)).slice(0, 300));
    return null;
  }
}
async function settled(jobs: Promise<unknown>[]) {
  const results = await Promise.allSettled(jobs);
  const failed = results.find((r) => r.status === 'rejected');
  if (failed) throw (failed as PromiseRejectedResult).reason;
}

const read = <T>(file: string, fallback: T): T => (existsSync(join(WORK, file)) ? (JSON.parse(readFileSync(join(WORK, file), 'utf8')) as T) : fallback);
const save = (file: string, data: unknown) => writeFileSync(join(WORK, file), JSON.stringify(data, null, 1));

// ─── The ladder ───────────────────────────────────────────────────────────────

const LADDER = `The Knowzone history ladder (10 levels; learners worldwide from secondary school to master's degree and adults):
1 Starter: famous facts most 12-year-olds could know (who, what, where).
2 Beginner: well-known facts from early secondary school.
3 Elementary: simple causes and results; key people and places.
4 Intermediate: GCSE / WAEC level: causes, consequences, key dates.
5 Upper-intermediate: top GCSE / WAEC / SAT level: significance, change and continuity.
6 Advanced: A-level / AP: turning points, comparisons, specific evidence.
7 Proficient: first-year university: precise detail, how historians know (evidence, archaeology, archives).
8 Expert: upper university: historiography: which historian or school argued what, and the debates.
9 Master: specialist knowledge and evaluating kinds of primary sources (who made them, why, their limits).
10 Super hard: postgraduate / olympiad: source criticism (provenance, purpose, reliability, what a source can and cannot show), fine chronology, historiographical debates.`;

const RULES = `Rules for every question:
- Facts must be correct and widely accepted by historians; where historians disagree, ask about the debate itself and name the historian or school accurately (no invented books, quotes, people or numbers).
- No invented primary-source quotations. Source questions describe a kind of source (e.g. "a colonial officer's report", "an oral tradition recorded in 1900") and ask about its use or limits.
- Exactly one correct answer; three wrong options that are plausible, of the same kind and similar length, but clearly wrong to an expert.
- No "all/none of the above", no trick wording, no negatives like "Which is NOT", and the answer must not appear in the question.
- British spelling. q at most 170 characters, each option at most 70.
- Respectful, neutral wording about every people, religion and country.`;

type LQ = { q: string; answer: string; wrong: string[]; level: number };
const LQ_SHAPE = '{"q":"…","answer":"…","wrong":["…","…","…"],"level":4}';
const lqSchema = z.object({
  q: z.string().min(10).max(220),
  answer: z.string().min(1).max(90),
  wrong: z.array(z.string().min(1).max(90)).length(3),
  level: z.number().int().min(1).max(10),
});

/** Code checks on a question before any model sees it. */
function questionProblem(x: LQ) {
  const all = [x.answer, ...x.wrong].map((s) => s.trim().toLowerCase());
  if (new Set(all).size !== 4) return 'repeated option';
  if (x.q.length > 200) return 'question too long';
  if (all.some((s) => /all of the above|none of the above/.test(s))) return 'all/none of the above';
  if (/\bNOT\b/.test(x.q) || /\bwhich\b[^?]*\bnot\b/i.test(x.q)) return 'negative question';
  if (x.answer.length > 8 && x.q.toLowerCase().includes(x.answer.toLowerCase())) return 'answer in question';
  return null;
}

/** The year in a date text: "c. 2560 BC" → −2560, "AD 330" → 330, "1960" → 1960. */
export function yearOf(when: string): number | null {
  const m = when.replace(/,/g, '').match(/(\d{1,4})\s*(BCE|BC|CE|AD)?/i);
  if (!m) return null;
  const n = Number(m[1]);
  return /BC/i.test(m[2] ?? '') ? -n : n;
}

/** The outline of Africa the app draws (apps/mobile/src/lib/games/history.ts), read from its source. */
function outline(name: string): [number, number][] {
  const src = readFileSync(join(MOBILE, 'lib/games/history.ts'), 'utf8');
  const block = src.slice(src.indexOf(`export const ${name}`));
  const body = block.slice(block.indexOf('= [') + 2, block.indexOf('];') + 1);
  return JSON.parse(body.replace(/,\s*\]$/, ']')) as [number, number][];
}
function inPolygon([x, y]: [number, number], poly: [number, number][]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!;
    const [xj, yj] = poly[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const inAfrica = (p: [number, number]) => inPolygon(p, outline('AFRICA')) || inPolygon(p, outline('MADAGASCAR'));

// ─── What to write ────────────────────────────────────────────────────────────

type Region = 'africa' | 'americas' | 'asia' | 'europe' | 'middle-east' | 'world';
const NEW_ERAS: { id: string; topic: string; region: Region; level: number }[] = [
  { id: 'kush', topic: 'The Kingdom of Kush at Meroë and its pyramids (c. 300 BC, Sudan)', region: 'africa', level: 2 },
  { id: 'aksum', topic: 'King Ezana makes the Kingdom of Aksum Christian (c. AD 330, Ethiopia)', region: 'africa', level: 3 },
  { id: 'ghana-empire', topic: 'The Ghana Empire (Wagadu) and the trans-Saharan gold trade (c. 1050, Koumbi Saleh)', region: 'africa', level: 3 },
  { id: 'great-zimbabwe', topic: 'Great Zimbabwe at its height (c. 1350)', region: 'africa', level: 2 },
  { id: 'kilwa', topic: 'Kilwa and the Swahili coast when Ibn Battuta visits (1331)', region: 'africa', level: 4 },
  { id: 'timbuktu', topic: 'Timbuktu as a centre of learning under Askia Muhammad of Songhai (c. 1500)', region: 'africa', level: 3 },
  { id: 'kongo', topic: 'King Afonso I of Kongo writes to the king of Portugal about the slave trade (1526)', region: 'africa', level: 6 },
  { id: 'middle-passage', topic: 'The Atlantic slave trade at its peak: Ouidah and the Middle Passage (c. 1780)', region: 'africa', level: 2 },
  { id: 'zulu', topic: 'Shaka builds the Zulu kingdom (c. 1820)', region: 'africa', level: 4 },
  { id: 'berlin-conference', topic: 'The Berlin Conference and the Scramble for Africa (1884)', region: 'africa', level: 3 },
  { id: 'adwa', topic: 'Ethiopia defeats Italy at the Battle of Adwa (1896)', region: 'africa', level: 3 },
  { id: 'maji-maji', topic: 'The Maji Maji rebellion against German rule (1905, Tanganyika)', region: 'africa', level: 6 },
  { id: 'aba-women', topic: 'The Aba Women’s War against colonial taxation (1929, south-eastern Nigeria)', region: 'africa', level: 5 },
  { id: 'mau-mau', topic: 'The Mau Mau uprising and the Emergency in Kenya (1952)', region: 'africa', level: 5 },
  { id: 'ghana-independence', topic: 'Ghana becomes independent under Kwame Nkrumah (1957, Accra)', region: 'africa', level: 2 },
  { id: 'oau', topic: 'The Organisation of African Unity is founded (1963, Addis Ababa)', region: 'africa', level: 4 },
  { id: 'soweto', topic: 'The Soweto uprising of students against apartheid education (1976)', region: 'africa', level: 5 },
  { id: 'mandela', topic: 'South Africa’s first democratic election; Nelson Mandela becomes president (1994)', region: 'africa', level: 1 },
  { id: 'maya', topic: 'The Classic Maya city of Tikal (c. AD 700, Guatemala)', region: 'americas', level: 3 },
  { id: 'inca', topic: 'The Inca Empire and Machu Picchu (c. 1450, Peru)', region: 'americas', level: 2 },
  { id: 'columbus', topic: 'Columbus reaches the Caribbean and the Columbian Exchange begins (1492)', region: 'americas', level: 1 },
  { id: 'tenochtitlan', topic: 'The fall of Tenochtitlan, the Aztec capital (1521)', region: 'americas', level: 3 },
  { id: 'us-independence', topic: 'The American Declaration of Independence (1776, Philadelphia)', region: 'americas', level: 1 },
  { id: 'haiti', topic: 'The Haitian Revolution begins (1791, Saint-Domingue)', region: 'americas', level: 3 },
  { id: 'civil-rights', topic: 'The March on Washington and the US civil rights movement (1963)', region: 'americas', level: 2 },
  { id: 'moon', topic: 'Apollo 11 lands on the Moon (1969)', region: 'world', level: 1 },
  { id: 'sumer', topic: 'Sumerian city-states and the first cuneiform writing (c. 3000 BC, Uruk, Iraq)', region: 'middle-east', level: 2 },
  { id: 'indus', topic: 'Mohenjo-daro and the Indus Valley civilisation (c. 2500 BC, Pakistan)', region: 'asia', level: 3 },
  { id: 'athens', topic: 'Democracy in classical Athens under Pericles (c. 450 BC)', region: 'europe', level: 1 },
  { id: 'qin', topic: 'Qin Shi Huang unites China and the terracotta army (221 BC)', region: 'asia', level: 2 },
  { id: 'rome', topic: 'Augustus becomes the first Roman emperor (27 BC)', region: 'europe', level: 1 },
  { id: 'baghdad', topic: 'The House of Wisdom in Abbasid Baghdad (c. AD 830)', region: 'middle-east', level: 4 },
  { id: 'mongols', topic: 'Genghis Khan founds the Mongol Empire (1206)', region: 'asia', level: 2 },
  { id: 'black-death', topic: 'The Black Death reaches Europe (1347)', region: 'europe', level: 2 },
  { id: 'zheng-he', topic: 'Zheng He’s treasure fleet sails from Ming China, later reaching East Africa (1405)', region: 'asia', level: 5 },
  { id: 'printing', topic: 'Gutenberg’s printing press (c. 1450, Mainz)', region: 'europe', level: 2 },
  { id: 'reformation', topic: 'Martin Luther’s Ninety-five Theses and the Reformation (1517)', region: 'europe', level: 4 },
  { id: 'mughal', topic: 'Akbar rules the Mughal Empire (c. 1580, India)', region: 'asia', level: 4 },
  { id: 'industrial', topic: 'The Industrial Revolution: steam power and factories in Britain (c. 1785)', region: 'europe', level: 2 },
  { id: 'french-revolution', topic: 'The storming of the Bastille and the French Revolution (1789)', region: 'europe', level: 1 },
  { id: 'meiji', topic: 'The Meiji Restoration modernises Japan (1868)', region: 'asia', level: 5 },
  { id: 'ww1', topic: 'The First World War begins (1914)', region: 'world', level: 1 },
  { id: 'russian-revolution', topic: 'The Russian Revolution (1917, Petrograd)', region: 'europe', level: 3 },
  { id: 'depression', topic: 'The Wall Street Crash and the Great Depression (1929)', region: 'americas', level: 3 },
  { id: 'ww2', topic: 'The Second World War (1939)', region: 'world', level: 1 },
  { id: 'un', topic: 'The United Nations is founded (1945, San Francisco)', region: 'world', level: 3 },
  { id: 'india-independence', topic: 'Indian independence and partition (1947)', region: 'asia', level: 2 },
  { id: 'prc', topic: 'Mao Zedong proclaims the People’s Republic of China (1949)', region: 'asia', level: 4 },
  { id: 'berlin-wall', topic: 'The fall of the Berlin Wall (1989)', region: 'europe', level: 1 },
];

const NEW_CIVS: { id: string; topic: string; region: Region; level: number }[] = [
  { id: 'djenne', topic: 'Djenné-Djenno, the ancient city on the inland Niger delta (Mali)', region: 'africa', level: 5 },
  { id: 'swahili', topic: 'The Swahili coast city-states such as Kilwa Kisiwani (Tanzania)', region: 'africa', level: 4 },
  { id: 'mapungubwe', topic: 'The kingdom of Mapungubwe (South Africa)', region: 'africa', level: 6 },
  { id: 'garamantes', topic: 'The Garamantes of the Fezzan (Libya)', region: 'africa', level: 8 },
  { id: 'carthage', topic: 'Carthage, the Phoenician city in North Africa (Tunisia)', region: 'africa', level: 3 },
  { id: 'lalibela', topic: 'The Zagwe dynasty and the rock-hewn churches of Lalibela (Ethiopia)', region: 'africa', level: 5 },
  { id: 'sumer', topic: 'The Sumerians of Mesopotamia (Iraq)', region: 'middle-east', level: 2 },
  { id: 'indus', topic: 'The Indus Valley (Harappan) civilisation (Pakistan and India)', region: 'asia', level: 3 },
  { id: 'shang', topic: 'The Shang dynasty of China', region: 'asia', level: 5 },
  { id: 'olmec', topic: 'The Olmec of the Gulf Coast of Mexico', region: 'americas', level: 6 },
  { id: 'maya', topic: 'The Maya of Mesoamerica', region: 'americas', level: 2 },
  { id: 'inca', topic: 'The Inca of the Andes', region: 'americas', level: 2 },
  { id: 'aztec', topic: 'The Aztecs (Mexica) of central Mexico', region: 'americas', level: 2 },
  { id: 'minoan', topic: 'The Minoans of Crete', region: 'europe', level: 6 },
  { id: 'khmer', topic: 'The Khmer Empire and Angkor (Cambodia)', region: 'asia', level: 4 },
  { id: 'cahokia', topic: 'Cahokia and the Mississippian culture (North America)', region: 'americas', level: 7 },
  { id: 'rapanui', topic: 'The Rapa Nui of Easter Island', region: 'world', level: 4 },
  { id: 'moche', topic: 'The Moche of northern Peru', region: 'americas', level: 8 },
  { id: 'hittite', topic: 'The Hittites of Anatolia (Turkey)', region: 'middle-east', level: 7 },
  { id: 'achaemenid', topic: 'The Achaemenid Persian Empire (Iran)', region: 'middle-east', level: 4 },
  { id: 'norse', topic: 'The Norse (Vikings) of Scandinavia', region: 'europe', level: 3 },
];

const NEW_COUNTRIES: { id: string; name: string; level: number }[] = (
  [
    ['algeria', 'Algeria', 2], ['cameroon', 'Cameroon', 2], ['zimbabwe', 'Zimbabwe', 2], ['angola', 'Angola', 3], ['sudan', 'Sudan', 3],
    ['libya', 'Libya', 3], ['tunisia', 'Tunisia', 3], ['mozambique', 'Mozambique', 3], ['ivorycoast', 'Côte d’Ivoire', 3], ['niger', 'Niger', 4],
    ['chad', 'Chad', 4], ['somalia', 'Somalia', 4], ['rwanda', 'Rwanda', 5], ['malawi', 'Malawi', 5], ['mauritania', 'Mauritania', 5],
    ['burkinafaso', 'Burkina Faso', 5], ['benin', 'Benin', 5], ['liberia', 'Liberia', 5], ['togo', 'Togo', 6], ['guinea', 'Guinea', 6],
    ['sierraleone', 'Sierra Leone', 6], ['gabon', 'Gabon', 6], ['congo', 'Republic of the Congo', 6], ['car', 'Central African Republic', 6],
    ['southsudan', 'South Sudan', 7], ['eritrea', 'Eritrea', 7], ['lesotho', 'Lesotho', 7], ['djibouti', 'Djibouti', 8], ['eswatini', 'Eswatini', 8],
    ['burundi', 'Burundi', 8], ['gambia', 'The Gambia', 8], ['guineabissau', 'Guinea-Bissau', 9], ['eqguinea', 'Equatorial Guinea', 9],
  ] as [string, string, number][]
).map(([id, name, level]) => ({ id, name, level }));

/** The levels to write questions for, from an item's first level up to 10. */
function spread(first: number, count: number) {
  return Array.from({ length: count }, (_, k) => Math.round(first + ((10 - first) * k) / Math.max(1, count - 1)));
}
const levelsText = (levels: number[]) => levels.map((l, k) => `question ${k + 1}: level ${l}`).join('; ');

// ─── Work files ───────────────────────────────────────────────────────────────

type Status = 'pending' | 'ok' | 'rejected';
type QItem = LQ & { id: string; owner: string; status: Status; reason?: string; checkerLevel?: number; audit?: 'ok' | 'wrong' };
type EraItem = { id: string; region: Region; level: number; title: string; when: string; year: number; place: string; intro: string; status: Status; reason?: string; checkerYear?: number };
type Find = { name: string; clue: string; art: string; subtle: boolean };
type CivItem = { id: string; region: Region; level: number; name: string; about: string; dig: 'savanna' | 'desert' | 'stone'; finds: Find[]; status: Status; reason?: string };
type CountryItem = { id: string; name: string; level: number; region: string; at: [number, number]; area: number; landmark: string; facts: [string, string]; status: Status; reason?: string; checkerAt?: [number, number] };
type EventItem = { text: string; year: number; level: number; region: Region; status: Status; reason?: string; checkerYear?: number };

const questions = read<QItem[]>('questions.json', []);
const eras = read<EraItem[]>('eras.json', []);
const civs = read<CivItem[]>('civs.json', []);
const countries = read<CountryItem[]>('countries.json', []);
const events = read<EventItem[]>('events.json', []);
const saveAll = () => {
  save('questions.json', questions);
  save('eras.json', eras);
  save('civs.json', civs);
  save('countries.json', countries);
  save('events.json', events);
};
function addQuestions(owner: string, list: LQ[], levels: number[], tag = '') {
  list.forEach((x, k) => {
    const item: QItem = { ...x, level: levels[k] ?? x.level, id: `${owner}#${tag}${k}`, owner, status: 'pending' };
    const problem = questionProblem(item);
    if (problem) Object.assign(item, { status: 'rejected', reason: problem });
    questions.push(item);
  });
}
function batches<T>(list: T[], size: number) {
  const out: T[][] = [];
  for (let k = 0; k < list.length; k += size) out.push(list.slice(k, k + size));
  return out;
}

// ─── Writing ──────────────────────────────────────────────────────────────────

async function writeEras() {
  const todo = NEW_ERAS.filter((e) => !eras.some((x) => x.id === e.id));
  const schema = z.object({
    eras: z.array(
      z.object({
        id: z.string(),
        title: z.string().max(60),
        when: z.string().max(20),
        year: z.number().int(),
        place: z.string().max(60),
        intro: z.string().max(260),
        questions: z.array(lqSchema).min(8),
      }),
    ),
  });
  await settled(
    batches(todo, 2).map(async (batch) => {
      const out = await ask(
        WRITER,
        `eras ${batch.map((e) => e.id).join(',')}`,
        `You write a history game ("the time machine visits real moments in history") for learners worldwide.\n${LADDER}\n${RULES}\n\nFor each moment below write: id (as given), title (at most 40 characters), when (the date as shown to players, e.g. "c. 2500 BC", "AD 330", "1789"), year (that same year as an integer, negative for BC), place (city or area, and the country today), intro (one or two present-tense sentences, at most 200 characters, as if arriving there), and exactly 10 questions about this moment and its wider history, one per level as listed.\n\n${batch.map((e) => `- id "${e.id}": ${e.topic}. Levels: ${levelsText(spread(e.level, 10))}`).join('\n')}`,
        schema,
        `{"eras":[{"id":"…","title":"…","when":"…","year":1789,"place":"…","intro":"…","questions":[${LQ_SHAPE}, …]}]}`,
        0.6,
      );
      for (const e of out?.eras ?? []) {
        const spec = batch.find((b) => b.id === e.id);
        if (!spec || eras.some((x) => x.id === e.id)) continue;
        const item: EraItem = { id: e.id, region: spec.region, level: spec.level, title: e.title, when: e.when, year: e.year, place: e.place, intro: e.intro, status: 'pending' };
        if (yearOf(e.when) !== e.year) Object.assign(item, { status: 'rejected', reason: `when "${e.when}" ≠ year ${e.year}` });
        eras.push(item);
        addQuestions(`era:${e.id}`, e.questions.slice(0, 10), spread(spec.level, 10));
      }
      saveAll();
    }),
  );
}

const ARTS = ['pottery', 'beads', 'tool', 'tablet', 'coin', 'figure', 'mask', 'weapon', 'building', 'jewellery', 'textile', 'bone'] as const;
async function writeCivs() {
  const todo = NEW_CIVS.filter((c) => !civs.some((x) => x.id === c.id));
  const schema = z.object({
    civs: z.array(
      z.object({
        id: z.string(),
        name: z.string().max(50),
        about: z.string().max(130),
        dig: z.enum(['savanna', 'desert', 'stone']),
        finds: z.array(z.object({ name: z.string().max(40), clue: z.string().max(180), art: z.enum(ARTS), subtle: z.boolean() })).length(4),
        questions: z.array(lqSchema).min(8),
      }),
    ),
  });
  await settled(
    batches(todo, 2).map(async (batch) => {
      const out = await ask(
        WRITER,
        `civs ${batch.map((e) => e.id).join(',')}`,
        `You write an archaeology game: players dig up real artefacts, read clues and name the civilisation that made them.\n${LADDER}\n${RULES}\n\nFor each civilisation below write: id (as given), name (e.g. "The Maya"), about (where and when, at most 100 characters, e.g. "Southern Mexico and Central America, about 2000 BC to AD 1500."), dig (the site look: savanna, desert or stone), finds: exactly 4 real kinds of artefact or feature found there, each with name (at most 30 characters, never naming the civilisation or its places), clue (one sentence of real evidence, at most 160 characters, never naming the civilisation, its rulers or its cities), art (one of ${ARTS.join(', ')}), subtle (false for the 2 clearest clues, true for 2 harder ones only an expert would recognise). Then exactly 10 questions about the civilisation, one per level as listed.\n\n${batch.map((c) => `- id "${c.id}": ${c.topic}. Levels: ${levelsText(spread(1, 10))}`).join('\n')}`,
        schema,
        `{"civs":[{"id":"…","name":"…","about":"…","dig":"stone","finds":[{"name":"…","clue":"…","art":"pottery","subtle":false}, …],"questions":[${LQ_SHAPE}, …]}]}`,
        0.6,
      );
      for (const c of out?.civs ?? []) {
        const spec = batch.find((b) => b.id === c.id);
        if (!spec || civs.some((x) => x.id === c.id)) continue;
        const words = c.name.replace(/^the\s+/i, '').toLowerCase().split(/[\s()]+/).filter((w) => w.length > 3);
        const leak = c.finds.find((f) => words.some((w) => `${f.name} ${f.clue}`.toLowerCase().includes(w)));
        civs.push({ id: c.id, region: spec.region, level: spec.level, name: c.name, about: c.about, dig: c.dig, finds: c.finds, status: leak ? 'rejected' : 'pending', ...(leak && { reason: `a find names it: ${leak.name}` }) });
        addQuestions(`civ:${c.id}`, c.questions.slice(0, 10), spread(1, 10));
      }
      saveAll();
    }),
  );
}

async function writeCountries() {
  const todo = NEW_COUNTRIES.filter((c) => !countries.some((x) => x.id === c.id));
  const schema = z.object({
    countries: z.array(
      z.object({
        id: z.string(),
        region: z.enum(['North Africa', 'West Africa', 'East Africa', 'Central Africa', 'Southern Africa']),
        at: z.tuple([z.number(), z.number()]),
        area: z.number().positive(),
        landmark: z.string().max(50),
        facts: z.tuple([z.string().max(160), z.string().max(160)]),
        questions: z.array(lqSchema).min(5),
      }),
    ),
  });
  await settled(
    batches(todo, 3).map(async (batch) => {
      const out = await ask(
        WRITER,
        `countries ${batch.map((e) => e.id).join(',')}`,
        `You write a geography and history game: players find African countries on a map, visit a landmark and answer questions.\n${LADDER}\n${RULES}\n\nFor each country write: id (as given), region (UN-style: North, West, East, Central or Southern Africa), at ([longitude, latitude] of the middle of the country, one decimal), area (in km²), landmark (a famous real landmark, at most 40 characters), facts (two true, interesting facts, each at most 140 characters, about its geography, history or culture), and exactly 5 questions mixing geography and history, one per level as listed.\n\n${batch.map((c) => `- id "${c.id}": ${c.name}. Levels: ${levelsText(spread(c.level, 5))}`).join('\n')}`,
        schema,
        `{"countries":[{"id":"…","region":"West Africa","at":[8.7,9.1],"area":923768,"landmark":"…","facts":["…","…"],"questions":[${LQ_SHAPE}, …]}]}`,
        0.5,
      );
      for (const c of out?.countries ?? []) {
        const spec = batch.find((b) => b.id === c.id);
        if (!spec || countries.some((x) => x.id === c.id)) continue;
        const inside = inAfrica(c.at);
        countries.push({ id: c.id, name: spec.name, level: spec.level, region: c.region, at: c.at, area: c.area, landmark: c.landmark, facts: c.facts, status: inside ? 'pending' : 'rejected', ...(!inside && { reason: `centre ${c.at.join(',')} is outside the map of Africa` }) });
        addQuestions(`country:${c.id}`, c.questions.slice(0, 5), spread(spec.level, 5));
      }
      saveAll();
    }),
  );
}

/** Upper-level questions for the eras, civilisations and countries the games already had. */
async function writeExtras() {
  const owners = [
    ...ERAS.map((e) => ({ owner: `era:${e.id}`, what: `the moment "${e.title}" (${e.when}, ${e.place}): ${e.intro}`, levels: [5, 6, 7, 8, 9, 10] })),
    ...CIVILIZATIONS.map((c) => ({ owner: `civ:${c.id}`, what: `${c.name} (${c.about})`, levels: [4, 5, 6, 7, 8, 9, 10] })),
    ...COUNTRIES.map((c) => ({ owner: `country:${c.id}`, what: `the African country ${c.name} (its geography and history)`, levels: [5, 6, 7, 8, 9, 10] })),
  ].filter((o) => !questions.some((q) => q.id.startsWith(`${o.owner}#x`)));
  const schema = z.object({ items: z.array(z.object({ owner: z.string(), questions: z.array(lqSchema).min(4) })) });
  await settled(
    batches(owners, 3).map(async (batch) => {
      const out = await ask(
        WRITER,
        `extras ${batch.map((o) => o.owner).join(',')}`,
        `You write harder questions for a history game whose easy questions already exist.\n${LADDER}\n${RULES}\n\nFor each topic below write questions, one per level as listed (owner as given).\n\n${batch.map((o) => `- owner "${o.owner}": ${o.what}. Levels: ${levelsText(o.levels)}`).join('\n')}`,
        schema,
        `{"items":[{"owner":"…","questions":[${LQ_SHAPE}, …]}]}`,
        0.6,
      );
      for (const it of out?.items ?? []) {
        const spec = batch.find((b) => b.owner === it.owner);
        if (spec) addQuestions(spec.owner, it.questions.slice(0, spec.levels.length), spec.levels, 'x');
      }
      saveAll();
    }),
  );
}

const EVENT_GROUPS: { region: Region; span: string; count: number }[] = [
  { region: 'africa', span: 'ancient Africa to AD 1500 (Egypt, Kush, Aksum, Nok, Ghana, Mali, Songhai, Great Zimbabwe, Swahili coast, Ife, Benin)', count: 22 },
  { region: 'africa', span: 'Africa 1500–1900 (kingdoms, the Atlantic slave trade and abolition, jihads, the Scramble for Africa)', count: 22 },
  { region: 'africa', span: 'Africa 1900–2000 (colonial rule, resistance, independence across every region, apartheid and its end)', count: 24 },
  { region: 'africa', span: 'Nigeria from 1800 to 2000 (Sokoto, colonial Lagos, amalgamation, independence, civil war, capitals, democracy)', count: 14 },
  { region: 'world', span: 'the ancient world to AD 600 outside Africa (Mesopotamia, India, China, Greece, Rome, the Americas)', count: 20 },
  { region: 'world', span: 'the world from 600 to 1700 outside Africa (Islamic caliphates, China, Mongols, Europe, the Americas, India, Japan)', count: 22 },
  { region: 'world', span: 'the world from 1700 to 1914 outside Africa (revolutions, industrialisation, empires, abolition)', count: 20 },
  { region: 'world', span: 'the world from 1914 to 2000 outside Africa (world wars, decolonisation in Asia, Cold War, science)', count: 24 },
];
async function writeEvents() {
  const schema = z.object({ events: z.array(z.object({ text: z.string().min(8).max(80), year: z.number().int(), level: z.number().int().min(1).max(10) })) });
  const done = read<string[]>('event-groups.json', []);
  await settled(
    EVENT_GROUPS.filter((g) => !done.includes(g.span)).map(async (g) => {
      const out = await ask(
        WRITER,
        `events ${g.span.slice(0, 30)}`,
        `You write the timeline for a history game where players put events in order. ${LADDER}\n\nWrite ${g.count} real events from ${g.span}. Each: text (present tense, at most 70 characters, e.g. "Nigeria becomes independent", without the year), year (integer, negative for BC; the generally accepted year; for ancient events the usual approximate year), level (1–10: how well known the event is on the ladder; spread them from 1 to 10). Only events with a single well-established year; no ongoing periods.`,
        schema,
        '{"events":[{"text":"…","year":1960,"level":1}, …]}',
        0.6,
      );
      if (!out) return;
      for (const e of out.events)
        if (!events.some((x) => x.text.toLowerCase() === e.text.toLowerCase())) events.push({ ...e, region: g.region, status: 'pending' });
      done.push(g.span);
      save('event-groups.json', done);
      saveAll();
    }),
  );
}

// ─── Checking ─────────────────────────────────────────────────────────────────

const LETTERS = ['A', 'B', 'C', 'D'];
/** Blind: the checker answers each question; it must pick the writer's answer and find it clear. */
async function checkQuestions() {
  const todo = questions.filter((q) => q.status === 'pending');
  const schema = z.object({
    items: z.array(z.object({ id: z.string(), pick: z.string(), clear: z.boolean(), level: z.number().int().min(1).max(10), problem: z.string().optional() })),
  });
  let n = 0;
  await settled(
    batches(todo, 14).map(async (batch) => {
      const shown = batch.map((q, k) => {
        const options = [q.answer, ...q.wrong].sort((a, b) => (a < b ? -1 : 1));
        return { id: `q${k}`, item: q, options, right: LETTERS[options.indexOf(q.answer)]! };
      });
      const topic = (q: QItem) => {
        const [kind, id] = q.owner.split(':');
        return `${kind} ${id}`;
      };
      const out = await ask(
        CHECKER,
        `check ${batch[0]!.id}`,
        `You are a careful history examiner. Answer each multiple-choice question yourself (pick A–D). Then say whether it is clear and fair (clear: false if more than one option could be right, the marked facts are disputed or wrong, or it is confusing), rate its level on this ladder, and name any problem briefly.\n${LADDER}\n\n${shown
          .map((s) => `${s.id} (${topic(s.item)}): ${s.item.q}\n${s.options.map((o, k) => `  ${LETTERS[k]}. ${o}`).join('\n')}`)
          .join('\n\n')}`,
        schema,
        '{"items":[{"id":"q0","pick":"B","clear":true,"level":5,"problem":""}, …]}',
        0.1,
      );
      if (!out) return;
      for (const s of shown) {
        const v = out.items.find((x) => x.id === s.id);
        if (!v) continue;
        const q = s.item;
        q.checkerLevel = v.level;
        if (v.pick.trim().toUpperCase().slice(0, 1) !== s.right) Object.assign(q, { status: 'rejected', reason: `checker picked ${v.pick}${v.problem ? `: ${v.problem}` : ''}` });
        else if (!v.clear) Object.assign(q, { status: 'rejected', reason: `unclear: ${v.problem ?? ''}` });
        else q.status = 'ok';
      }
      if (++n % 5 === 0) console.log(`checked ${n} batches, $${money.vultrUsd.toFixed(3)}`);
      saveAll();
    }),
  );
}

/** Blind dates: eras and events must get the same year from the checker (ancient ones within a margin). */
const sameYear = (a: number, b: number) => (a >= 1000 ? a === b : Math.abs(a - b) <= Math.max(30, Math.abs(a) * 0.04));
async function checkDates() {
  const todo = [...eras.filter((e) => e.status === 'pending').map((e) => ({ key: `era:${e.id}`, text: `${e.title} (${e.place})`, year: e.year })), ...events.filter((e) => e.status === 'pending').map((e) => ({ key: `event:${e.text}`, text: e.text, year: e.year }))];
  const schema = z.object({ items: z.array(z.object({ id: z.string(), year: z.number().int(), sure: z.boolean() })) });
  await settled(
    batches(todo, 30).map(async (batch) => {
      const out = await ask(
        CHECKER,
        `dates ${batch[0]!.key.slice(0, 30)}`,
        `For each historical event give the year it happened (an integer; negative for BC; for ancient events the usual approximate year) and whether you are sure.\n\n${batch.map((b, k) => `e${k}: ${b.text}`).join('\n')}`,
        schema,
        '{"items":[{"id":"e0","year":1960,"sure":true}, …]}',
        0,
      );
      if (!out) return;
      batch.forEach((b, k) => {
        const v = out.items.find((x) => x.id === `e${k}`);
        if (!v) return;
        const target = b.key.startsWith('era:') ? eras.find((e) => `era:${e.id}` === b.key)! : events.find((e) => `event:${e.text}` === b.key)!;
        target.checkerYear = v.year;
        if (!v.sure || !sameYear(b.year, v.year)) Object.assign(target, { status: 'rejected', reason: `checker dates it ${v.year}${v.sure ? '' : ' (unsure)'}` });
        else target.status = 'ok';
      });
      saveAll();
    }),
  );
}

/** Civilisations: named blind from their finds; countries: placed blind within 3 degrees. */
async function checkPlaces() {
  const pendingCivs = civs.filter((c) => c.status === 'pending');
  if (pendingCivs.length) {
    const names = [...new Set([...civs.map((c) => c.name), ...CIVILIZATIONS.map((c) => c.name)])];
    const schema = z.object({ items: z.array(z.object({ id: z.string(), name: z.string(), problem: z.string().optional() })) });
    await settled(
      batches(pendingCivs, 6).map(async (batch) => {
        const out = await ask(
          CHECKER,
          `civs ${batch[0]!.id}`,
          `An archaeology game. For each dig, read the finds and say which civilisation (choose exactly one name from the list) made them. Mention any find whose clue is factually wrong.\nNames: ${names.join('; ')}\n\n${batch.map((c, k) => `d${k}: ${c.finds.map((f) => `${f.name}: ${f.clue}`).join(' | ')}`).join('\n')}`,
          schema,
          '{"items":[{"id":"d0","name":"…","problem":""}, …]}',
          0,
        );
        if (!out) return;
        batch.forEach((c, k) => {
          const v = out.items.find((x) => x.id === `d${k}`);
          if (!v) return;
          if (v.name.trim().toLowerCase() !== c.name.toLowerCase()) Object.assign(c, { status: 'rejected', reason: `checker named it ${v.name}` });
          else if (v.problem && v.problem.length > 3) Object.assign(c, { status: 'rejected', reason: `clue problem: ${v.problem}` });
          else c.status = 'ok';
        });
        saveAll();
      }),
    );
  }
  const pendingCountries = countries.filter((c) => c.status === 'pending');
  if (pendingCountries.length) {
    const schema = z.object({ items: z.array(z.object({ id: z.string(), at: z.tuple([z.number(), z.number()]), factsTrue: z.boolean(), landmarkThere: z.boolean() })) });
    const out = await ask(
      CHECKER,
      'countries',
      `For each African country give the [longitude, latitude] of its middle (one decimal), whether both facts are true, and whether the landmark is in that country.\n\n${pendingCountries.map((c, k) => `c${k}: ${c.name}. Landmark: ${c.landmark}. Facts: ${c.facts.join(' | ')}`).join('\n')}`,
      schema,
      '{"items":[{"id":"c0","at":[8.7,9.1],"factsTrue":true,"landmarkThere":true}, …]}',
      0,
    );
    pendingCountries.forEach((c, k) => {
      const v = out?.items.find((x) => x.id === `c${k}`);
      if (!v) return;
      c.checkerAt = v.at;
      const far = Math.hypot(v.at[0] - c.at[0], v.at[1] - c.at[1]);
      if (far > 3) Object.assign(c, { status: 'rejected', reason: `checker places it at ${v.at.join(',')}` });
      else if (!v.factsTrue || !v.landmarkThere) Object.assign(c, { status: 'rejected', reason: 'facts or landmark doubted' });
      else c.status = 'ok';
    });
    saveAll();
  }
}

/** A third model reads a sample of what passed; anything it calls wrong is dropped. */
async function audit() {
  const passed = questions.filter((q) => q.status === 'ok' && !q.audit);
  const sample = passed.filter((_, k) => k % 6 === 0).slice(0, 90);
  const schema = z.object({ items: z.array(z.object({ id: z.string(), verdict: z.enum(['ok', 'wrong']), why: z.string().optional() })) });
  await settled(
    batches(sample, 15).map(async (batch) => {
      const out = await ask(
        AUDITOR,
        `audit ${batch[0]!.id}`,
        `Audit these history quiz questions. For each, is the marked answer correct, the only correct option, and the question fair? Reply ok or wrong (with a short why).\n\n${batch.map((q, k) => `a${k}: ${q.q}\n  Marked answer: ${q.answer}\n  Other options: ${q.wrong.join(' | ')}`).join('\n\n')}`,
        schema,
        '{"items":[{"id":"a0","verdict":"ok","why":""}, …]}',
        0,
      );
      if (!out) return;
      batch.forEach((q, k) => {
        const v = out.items.find((x) => x.id === `a${k}`);
        if (!v) return;
        q.audit = v.verdict;
        if (v.verdict === 'wrong') Object.assign(q, { status: 'rejected', reason: `auditor: ${v.why ?? ''}` });
      });
      saveAll();
    }),
  );
  const audited = questions.filter((q) => q.audit);
  console.log(`audit: ${audited.filter((q) => q.audit === 'wrong').length} of ${audited.length} sampled questions called wrong`);
}

// ─── Building the data file ───────────────────────────────────────────────────

function build() {
  const ok = (owner: string) =>
    questions
      .filter((q) => q.owner === owner && q.status === 'ok')
      // The final level is between the writer's slot and the checker's rating.
      .map((q) => ({ q: q.q, answer: q.answer, wrong: q.wrong as [string, string, string], level: Math.max(1, Math.min(10, Math.round((q.level + (q.checkerLevel ?? q.level)) / 2))) }));
  const moreEras = eras
    .filter((e) => e.status === 'ok' && ok(`era:${e.id}`).length >= 5)
    .map((e) => ({ id: e.id, title: e.title, when: e.when, year: e.year, place: e.place, region: e.region, intro: e.intro, level: e.level, questions: ok(`era:${e.id}`) }));
  const moreCivs = civs
    .filter((c) => c.status === 'ok' && ok(`civ:${c.id}`).length >= 5)
    .map((c) => ({ id: c.id, name: c.name, dig: c.dig, region: c.region, level: c.level, about: c.about, finds: c.finds, questions: ok(`civ:${c.id}`) }));
  const moreCountries = countries
    .filter((c) => c.status === 'ok' && ok(`country:${c.id}`).length >= 3)
    .map((c) => ({
      id: c.id,
      name: c.name,
      region: c.region,
      at: c.at,
      // A tap within about the country's own size finds it (at least 1.2°, at most 6°).
      radius: Math.round(Math.min(6, Math.max(1.2, (Math.sqrt(c.area / Math.PI) / 111) * 0.9)) * 10) / 10,
      level: c.level,
      landmark: c.landmark,
      facts: c.facts,
      questions: ok(`country:${c.id}`),
    }));
  const extras = Object.fromEntries(
    [...ERAS.map((e) => `era:${e.id}`), ...CIVILIZATIONS.map((c) => `civ:${c.id}`), ...COUNTRIES.map((c) => `country:${c.id}`)].map((owner) => [owner, ok(owner)]),
  );
  const moreEvents = events
    .filter((e) => e.status === 'ok')
    .sort((a, b) => a.year - b.year)
    .map((e) => ({ text: e.text, year: e.year, level: e.level, region: e.region }));
  const header = `/**
 * Generated by scripts/business-history-content.ts (do not edit by hand; edit the script or its work
 * files in .business-history/ and run --stages build). Written by ${WRITER}, every question answered
 * blind by ${CHECKER} (kept only when it chose the same answer and found it clear), dates and places
 * checked blind, a sample audited by ${AUDITOR}.
 */
import type { Era, Civilization, Country, LeveledQuestion, TimelineEvent } from './levels.js';

`;
  const body = [
    `export const MORE_ERAS: Era[] = ${JSON.stringify(moreEras, null, 1)};`,
    `export const MORE_CIVILIZATIONS: Civilization[] = ${JSON.stringify(moreCivs, null, 1)};`,
    `export const MORE_COUNTRIES: Country[] = ${JSON.stringify(moreCountries, null, 1)};`,
    `/** Upper-level questions for the eras, civilisations and countries written by hand. */`,
    `export const EXTRA_QUESTIONS: Record<string, LeveledQuestion[]> = ${JSON.stringify(extras, null, 1)};`,
    `export const MORE_EVENTS: TimelineEvent[] = ${JSON.stringify(moreEvents, null, 1)};`,
  ].join('\n\n');
  writeFileSync(join(DATA, 'more.ts'), `${header}${body}\n`);
  const count = (s: Status) => questions.filter((q) => q.status === s).length;
  console.log(
    `built: ${moreEras.length} eras, ${moreCivs.length} civilisations, ${moreCountries.length} countries, ${moreEvents.length} events; questions ok ${count('ok')}, rejected ${count('rejected')}, pending ${count('pending')}`,
  );
}

// ─── Translations of the new app words ────────────────────────────────────────

const LANGS: Record<string, string> = {
  pcm: 'Nigerian Pidgin',
  yo: 'Yoruba (with tone marks)',
  ig: 'Igbo (with diacritics)',
  ha: 'Hausa',
  fr: 'French',
  ar: 'Modern Standard Arabic',
  sw: 'Swahili',
  pt: 'Portuguese',
  es: 'Spanish',
};
type Tree = { [k: string]: string | Tree };
function flatten(t: Tree, prefix = '', out: Record<string, string> = {}) {
  for (const [k, v] of Object.entries(t)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out[key] = v;
    else flatten(v, key, out);
  }
  return out;
}
function unflatten(flat: Record<string, string>) {
  const out: Tree = {};
  for (const [key, v] of Object.entries(flat)) {
    const parts = key.split('.');
    let at = out;
    for (const p of parts.slice(0, -1)) at = (at[p] ??= {}) as Tree;
    at[parts.at(-1)!] = v;
  }
  return out;
}
const tokens = (s: string) => [...s.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]).sort().join(',');

async function translate(name: 'business' | 'history') {
  const file = join(MOBILE, `lib/games/${name}-text.en.ts`);
  if (!existsSync(file)) return console.log(`no ${name}-text.en.ts yet`);
  const en = flatten((await import(pathToFileURL(file).href)).default as Tree);
  const store = read<Record<string, Record<string, string>>>(`text-${name}.json`, {});
  const schema = z.object({ strings: z.record(z.string(), z.string()) });
  await settled(
    Object.entries(LANGS).map(async ([lang, language]) => {
      const have = (store[lang] ??= {});
      // Keys new or changed in English since the last run (the English is kept to notice changes).
      const todo = Object.keys(en).filter((k) => !have[k] || have[`__en.${k}`] !== en[k]);
      for (const part of batches(todo, 45)) {
        const out = await ask(
          WRITER,
          `text ${name} ${lang}`,
          `Translate these strings of a learning app's business and history games from English into ${language}, for secondary-school to university learners. Keep {{placeholders}} exactly as they are, keep maths symbols, formulas and abbreviations (NPV, WACC, CAPM, HHI, EBITDA, LTV, CAC, P/E, DCF, σ) unchanged, keep "$" amounts, and keep it short like the English. Return the same keys.\n\n${JSON.stringify(Object.fromEntries(part.map((k) => [k, en[k]!])), null, 1)}`,
          schema,
          '{"strings":{"key":"translation", …}}',
          0.2,
        );
        for (const k of part) {
          const v = out?.strings[k];
          if (v && tokens(v) === tokens(en[k]!)) {
            have[k] = v;
            have[`__en.${k}`] = en[k]!;
          }
        }
        save(`text-${name}.json`, store);
      }
    }),
  );
  const languages = Object.fromEntries(
    Object.keys(LANGS).map((lang) => [
      lang,
      unflatten(Object.fromEntries(Object.keys(en).map((k) => [k, store[lang]?.[k] ?? en[k]!]))),
    ]),
  );
  const missing = Object.keys(LANGS).map((l) => `${l}: ${Object.keys(en).filter((k) => !store[l]?.[k]).length}`).join(', ');
  const Name = name[0]!.toUpperCase() + name.slice(1);
  writeFileSync(
    join(MOBILE, `lib/games/${name}-text.ts`),
    `/**
 * The ${Name} words added with the ten-level ladder, in every language, added to the "${name}"
 * namespace at start-up (so components use the usual t()). English is ${name}-text.en.ts; the others are
 * generated from it by apps/server/scripts/business-history-content.ts --stages text (placeholders
 * checked in code). Do not edit the translations here by hand: edit the English and run the stage.
 */
import i18n from 'i18next';

import en from './${name}-text.en';

export const ${name.toUpperCase()}_TEXT = { en, ...${JSON.stringify(languages, null, 1)} } as const;

let added = false;
/** Adds the words to i18next once (deep-merged into the namespace, so nothing else is replaced). */
export function add${Name}Text() {
  if (added) return;
  added = true;
  for (const [lang, words] of Object.entries(${name.toUpperCase()}_TEXT)) i18n.addResourceBundle(lang, '${name}', words, true, false);
}
add${Name}Text();
`,
  );
  console.log(`${name} text written; untranslated keys per language: ${missing}`);
}

/**
 * The checker reads every translated string beside its English and names the ones that are wrong
 * (meaning changed, wrong language, broken maths); those are dropped so the next `text` run redoes them.
 */
async function checkText(name: 'business' | 'history') {
  const file = join(MOBILE, `lib/games/${name}-text.en.ts`);
  const en = flatten((await import(pathToFileURL(file).href)).default as Tree);
  const store = read<Record<string, Record<string, string>>>(`text-${name}.json`, {});
  const checked = read<Record<string, string[]>>(`text-checked-${name}.json`, {});
  const schema = z.object({ bad: z.array(z.object({ key: z.string(), why: z.string() })) });
  let dropped = 0;
  await settled(
    Object.entries(LANGS).map(async ([lang, language]) => {
      const have = store[lang] ?? {};
      const todo = Object.keys(en).filter((k) => have[k] && !(checked[lang] ?? []).includes(`${k}=${have[k]}`));
      for (const part of batches(todo, 40)) {
        const out = await ask(
          CHECKER,
          `textcheck ${name} ${lang}`,
          `You check translations of a learning app from English into ${language}. List only the strings whose translation is wrong: meaning changed, a number, formula or abbreviation changed, untranslated English left in a full sentence, or not ${language}. Small style choices are fine.\n\n${part
            .map((k) => `${k}\n  EN: ${en[k]}\n  ${lang.toUpperCase()}: ${have[k]}`)
            .join('\n')}`,
          schema,
          '{"bad":[{"key":"…","why":"…"}]}',
          0,
        );
        if (!out) continue;
        for (const k of part) {
          if (out.bad.some((b) => b.key === k)) {
            delete have[k];
            delete have[`__en.${k}`];
            dropped++;
          } else (checked[lang] ??= []).push(`${k}=${have[k]}`);
        }
        save(`text-${name}.json`, store);
        save(`text-checked-${name}.json`, checked);
      }
    }),
  );
  console.log(`${name}: checker dropped ${dropped} translations for redoing`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const STEPS: Record<string, () => Promise<unknown> | unknown> = {
  eras: writeEras,
  civs: writeCivs,
  countries: writeCountries,
  extras: writeExtras,
  events: writeEvents,
  check: async () => {
    await checkDates();
    await checkPlaces();
    await checkQuestions();
  },
  audit,
  build,
  text: async () => {
    await translate('business');
    await translate('history');
  },
  textcheck: async () => {
    await checkText('business');
    await checkText('history');
  },
};
try {
  for (const stage of STAGES) {
    console.log(`— ${stage}`);
    await STEPS[stage]!();
  }
} catch (e) {
  if (e instanceof OutOfMoney) console.log(`Stopped: spent $${money.vultrUsd.toFixed(3)} of $${BUDGET}.`);
  else throw e;
} finally {
  saveAll();
  console.log(`Vultr spend so far: $${money.vultrUsd.toFixed(4)} in ${money.calls} calls`, money.byModel);
}
