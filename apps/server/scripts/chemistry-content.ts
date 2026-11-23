/**
 * Writes and checks the chemistry lab content for the ten-level ladder with open models on Vultr
 * Serverless Inference (like scripts/word-games-content.ts):
 *
 *   - a writer (deepseek-v4.1-flash-1017) proposes Mixture Lab experiments, "what forms?" reactions for
 *     Reaction Rush, and Mystery Substance unknowns with their test results, for levels 6–10;
 *   - a checker (qwen3.8-27b), a different model, checks every item (and the hand-written periodic table,
 *     molecule targets, hard equations and a sample of the generated calculations);
 *   - an auditor (glm-5.3-flash), a third model, re-reads a sample of what the checker passed.
 *
 * Code checks come first and are final: formulas parse, equations balance (atoms and charge), reagent
 * ids exist, colours are colours, options are distinct, every unknown's results are complete, etc. Work
 * is kept in .chemistry-content/ as it's made (a stopped run carries on); spend.json has a hard cap
 * (--budget, default $3). Writes src/data/chemistry/generated.ts. Run from apps/server:
 *
 *   npx tsx scripts/chemistry-content.ts                       # everything
 *   npx tsx scripts/chemistry-content.ts --stages experiments,build
 *   npx tsx scripts/chemistry-content.ts --stages stats
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { z } from 'zod';

import { config } from '../src/config.js';
import { makeCalc } from '../src/data/chemistry/calc.js';
import { COMPLETIONS, HARD_EQUATIONS } from '../src/data/chemistry/equations.js';
import { EXPERIMENTS, REAGENTS } from '../src/data/chemistry/experiments.js';
import { balance, equationText, parseEquation, parseSpecies } from '../src/data/chemistry/formula.js';
import { MOLECULES } from '../src/data/chemistry/molecules.js';
import { PERIODIC } from '../src/data/chemistry/periodic.js';
import { fromSmiles, countsOf, hillFormula } from '../src/data/chemistry/structure.js';
import { BASIC_TESTS, MORE_TESTS, SUBSTANCES, TEST_TEXT, type TestId } from '../src/data/chemistry/substances.js';
import { random } from '../src/services/games/english.js';
import { parseModelJson, vultrCost, type VultrUsage } from '../src/services/vultr.js';

const VULTR_BASE = 'https://api.vultrinference.com/v1';
const args = process.argv.slice(2);
const flag = (name: string) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined);
const STAGES = (flag('stages') ?? 'periodic,molecules,equations,calcs,experiments,completions,substances,build,stats').split(',');
const LEVELS = (flag('levels') ?? '6,7,8,9,10').split(',').map(Number);
const BUDGET = Number(flag('budget') ?? 3);
const CALLS = Number(flag('calls') ?? 5);
const WRITER = 'deepseek-v4.1-flash-1017';
const CHECKER = 'qwen3.8-27b';
const AUDITOR = 'glm-5.3-flash';

const WORK = resolve(import.meta.dirname, '../.chemistry-content');
const DATA = resolve(import.meta.dirname, '../src/data/chemistry');
mkdirSync(WORK, { recursive: true });
const SPEND = join(WORK, 'spend.json');
const read = <T>(file: string, fallback: T): T => (existsSync(join(WORK, file)) ? (JSON.parse(readFileSync(join(WORK, file), 'utf8')) as T) : fallback);
const save = (file: string, data: unknown) => writeFileSync(join(WORK, file), JSON.stringify(data, null, 1));

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
  appendFileSync(join(WORK, 'calls.jsonl'), `${JSON.stringify({ at: new Date().toISOString(), model, task: task.slice(0, 60), ...usage, usd, ...(error && { error }) })}\n`);
}

type Completion = { choices?: { message?: { content?: string }; finish_reason?: string }[]; usage?: { prompt_tokens?: number; completion_tokens?: number } };
/** One JSON request with thinking off (see word-games-content.ts for why); a second try on bad JSON. */
async function ask<T>(model: string, prompt: string, schema: z.ZodType<T>, shape: string, temperature: number): Promise<T | null> {
  if (!canSpend()) throw new OutOfMoney();
  return slot(model, async () => {
    if (!canSpend()) throw new OutOfMoney();
    const messages = [{ role: 'user', content: `${prompt}\n\nAnswer with one JSON object and nothing else, in exactly this shape: ${shape}` }];
    const usage: VultrUsage = { inputTokens: 0, outputTokens: 0, reasoningTokens: 0 };
    let cost = 0;
    let problem = '';
    for (let attempt = 1; attempt <= 2; attempt++) {
      let data: Completion | null = null;
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
      if (!data) {
        note(model, prompt, usage, cost, 'no answer');
        charge(model, cost);
        return null;
      }
      const u = { inputTokens: data.usage?.prompt_tokens ?? 0, outputTokens: data.usage?.completion_tokens ?? 0 };
      usage.inputTokens += u.inputTokens;
      usage.outputTokens += u.outputTokens;
      cost += vultrCost(model, u);
      const text = data.choices?.[0]?.message?.content ?? '';
      try {
        if (data.choices?.[0]?.finish_reason === 'length') throw new Error('cut off; write it shorter');
        const parsed = schema.safeParse(parseModelJson(text));
        if (!parsed.success) throw new Error(parsed.error.issues.slice(0, 8).map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
        charge(model, cost);
        note(model, prompt, usage, cost);
        return parsed.data;
      } catch (e) {
        problem = e instanceof Error ? e.message : String(e);
        messages.push({ role: 'assistant', content: text.slice(0, 6000) }, { role: 'user', content: `That answer can't be used: ${problem.slice(0, 1500)}\nSend the whole JSON object again, corrected. JSON only.` });
      }
    }
    charge(model, cost);
    note(model, prompt, usage, cost, problem.slice(0, 200));
    return null;
  });
}

const LADDER = `The Knowzone chemistry ladder (learners worldwide, secondary school to postgraduate):
1–3 early secondary; 4–5 senior secondary (WAEC, GCSE, SAT); 6 A-level / AP; 7 harder A-level / first-year university;
8 second/third-year university; 9 upper university / IChO national rounds; 10 International Chemistry Olympiad / postgraduate.
Higher levels need MORE reasoning steps and subtler distinctions, not just rarer facts.`;

// ─── Verdicts ─────────────────────────────────────────────────────────────────

const Verdicts = z.object({ verdicts: z.array(z.object({ id: z.string(), ok: z.boolean(), level: z.number().int().min(1).max(10).optional(), why: z.string().max(400) })) });
const VERDICT_SHAPE = '{"verdicts":[{"id":"...","ok":true,"level":7,"why":"short reason; if not ok, exactly what is wrong"}]}';
type Verdict = z.infer<typeof Verdicts>['verdicts'][number];

async function check(kind: string, items: { id: string; text: string }[], model = CHECKER, extra = ''): Promise<Map<string, Verdict>> {
  const out = new Map<string, Verdict>();
  for (let i = 0; i < items.length; i += 10) {
    const batch = items.slice(i, i + 10);
    const res = await ask(
      model,
      `You are a strict chemistry examiner checking ${kind} for a chemistry game. ${LADDER}\n${extra}\nFor each item decide: is every fact, formula, colour and observation scientifically correct (standard textbook / IUPAC / CRC values)? Is the stated answer right and every other option clearly wrong? Mark ok=false for ANY error or ambiguity, and say exactly what. Also give the ladder level (1–10) the item really fits.\n\nItems:\n${batch.map((b) => `[${b.id}] ${b.text}`).join('\n\n')}`,
      Verdicts,
      VERDICT_SHAPE,
      0.1,
    );
    for (const v of res?.verdicts ?? []) out.set(v.id, v);
  }
  return out;
}

// ─── Hand-written data: checker only ──────────────────────────────────────────

async function checkPeriodic() {
  if (existsSync(join(WORK, 'periodic.json'))) return;
  const items = PERIODIC.filter((a) => a.number <= 86).map((a) => ({
    id: a.symbol,
    text: `${a.number} ${a.symbol} ${a.name}: atomic weight ${a.mass}; group ${a.group || 'f-block'}; period ${a.period}; ${a.category}; ${a.state} at 25 °C${a.en ? `; Pauling electronegativity ${a.en}` : ''}${a.ie1 ? `; first ionisation energy ${a.ie1} kJ/mol` : ''}${a.fact ? `; fact: "${a.fact}"` : ''}`,
  }));
  const verdicts = await check('rows of a periodic table', items, CHECKER, 'Allow small rounding differences (±1 in the last digit, ±1% for ionisation energies). Treat Zn, Cd, Hg as transition metals and Po as a post-transition metal (the game uses that convention).');
  save('periodic.json', [...verdicts.values()]);
}

async function checkMolecules() {
  if (existsSync(join(WORK, 'molecules.json'))) return;
  const items = Object.entries(MOLECULES).flatMap(([level, list]) =>
    list.map((m, k) => ({ id: `${level}-${k}`, text: `Level ${level}. ${m.task ? `Task: "${m.task}". ` : ''}Answer: ${m.name}, SMILES ${m.smiles}, formula ${hillFormula(countsOf(fromSmiles(m.smiles)))}` })),
  );
  const verdicts = await check('molecule-building targets (name, SMILES and, for reaction tasks, whether this is the correct major product)', items);
  save('molecules.json', [...verdicts.values()]);
}

async function checkEquations() {
  if (existsSync(join(WORK, 'equations.json'))) return;
  const items = Object.entries(HARD_EQUATIONS).flatMap(([level, list]) =>
    list.map(([a, b], k) => ({ id: `${level}-${k}`, text: `Level ${level}: ${equationText(a, b, balance(a, b)!)} (balanced by computer; check it is a real reaction that happens as written)` })),
  );
  const verdicts = await check('equations to balance', items);
  save('equations.json', [...verdicts.values()]);
}

async function checkCalcs() {
  if (existsSync(join(WORK, 'calcs.json'))) return;
  const items: { id: string; text: string }[] = [];
  for (let level = 3; level <= 10; level++)
    for (let k = 0; k < 5; k++) {
      const c = makeCalc(level, random(`audit:${level}:${k}`));
      items.push({ id: `${level}-${k}-${c.kind}`, text: `${c.prompt}\nAnswer: ${c.answer}. Other options: ${c.options.filter((o) => o !== c.answer).join('; ')}. Working: ${c.working}` });
    }
  const verdicts = await check('calculation questions (recompute each answer yourself, to 3 significant figures)', items);
  save('calcs.json', [...verdicts.values()]);
}

// ─── Mixture Lab experiments ──────────────────────────────────────────────────

const Hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/);
const NewReagent = z.object({ id: z.string().regex(/^[a-z0-9_-]{2,24}$/), name: z.string().min(3).max(80), formula: z.string().min(1).max(50), colour: Hex, bottle: z.enum(['clear', 'brown', 'dropper', 'solid']) });
const Experiment = z.object({
  id: z.string().regex(/^[a-z0-9-]{3,40}$/),
  title: z.string().min(5).max(70),
  reagents: z.tuple([z.string(), z.string()]),
  glassware: z.enum(['beaker', 'tube', 'flask']),
  observation: z.object({ liquid: Hex, precipitate: Hex.optional(), gas: z.boolean().optional(), coating: Hex.optional(), text: z.string().min(5).max(170) }),
  question: z.string().min(5).max(170),
  answer: z.string().min(1).max(140),
  wrong: z.array(z.string().min(1).max(140)).min(3).max(4),
  equation: z.string().min(3).max(160),
});
type Exp = z.infer<typeof Experiment>;
const ExpBatch = z.object({ reagents: z.array(NewReagent).max(20), experiments: z.array(Experiment).min(4).max(14) });
const EXP_SHAPE = '{"reagents":[{"id":"kscn","name":"Potassium thiocyanate solution","formula":"KSCN","colour":"#F4F7FB","bottle":"dropper"}],"experiments":[{"id":"fe3-scn","title":"...","reagents":["fecl3","kscn"],"glassware":"tube","observation":{"liquid":"#8B0000","precipitate":"#RRGGBB (optional)","gas":false,"coating":"#RRGGBB (optional)","text":"what the learner sees"},"question":"...","answer":"...","wrong":["...","...","..."],"equation":"Fe^3+ + SCN^- → [Fe(SCN)]^2+"}]}';

const LEVEL_FOCUS: Record<number, string> = {
  6: 'A-level inorganic and organic tests: transition-metal hydroxides with NaOH and NH3 (and excess), halide ions with AgNO3 then NH3, sulfate/carbonate tests, ammonium with NaOH, alkenes with bromine water, carbonyls with 2,4-DNPH, aldehydes with Tollens or Fehling.',
  7: 'Harder A-level / first-year: complex ions and ligand exchange (Cu2+ with excess NH3 or conc. HCl, Co2+ with conc. HCl), Fe3+ with SCN-, Fe2+ and MnO4-, dichromate with primary/secondary/tertiary alcohols, iodoform, phenol with FeCl3 and bromine water, thiosulfate with iodine.',
  8: 'University qualitative inorganic: amphoteric hydroxides (Zn, Al, Pb, Cr), disproportionation (Cu+ in acid), halogen displacement with a hydrocarbon layer colour, Cr(III) to chromate with H2O2/OH-, Mn2+ oxidation, nitrite/nitrate tests, Lucas test.',
  9: 'Upper university: selective precipitation, redox titration endpoints, coordination chemistry colours (d-d), Prussian blue, Ni with dimethylglyoxime, Ag halide solubility in NH3/thiosulfate, Benedict vs Tollens, ninhydrin, biuret.',
  10: 'Olympiad: multi-step inferences where the observation must be explained by a specific species or equilibrium: e.g. which complex ion forms, why a precipitate redissolves, which oxidation state results, interpreting colour changes of indicators in titrations of mixtures.',
};

async function writeExperiments(level: number) {
  const file = `experiments-${level}.json`;
  const have = read<{ reagents: z.infer<typeof NewReagent>[]; items: (Exp & { status: string; why?: string; audit?: string })[]; rounds: number }>(file, { reagents: [], items: [], rounds: 0 });
  const known = () => new Map([...REAGENTS, ...allNewReagents(), ...have.reagents].map((r) => [r.id, r]));
  while (have.items.filter((x) => x.status === 'ok').length < 10 && have.rounds < 3) {
    have.rounds++;
    const shelf = [...known().values()].map((r) => `${r.id} (${r.name})`).join(', ');
    const res = await ask(
      WRITER,
      `Write 12 chemistry experiments for level ${level} of a lab game. ${LADDER}\nFocus for level ${level}: ${LEVEL_FOCUS[level]}\nEach mixes exactly two reagents (ids from the shelf, or new reagents you define in "reagents" with a lowercase id) in a beaker, test tube or conical flask, describes exactly what a student sees (colours as hex codes for the drawing: liquid colour after mixing, precipitate colour if any, gas bubbles, coating), asks one question whose answer needs the level's reasoning, gives the right answer and 3 wrong but plausible options (same style and length), Keep every text short (observation under 100 characters, options under 80). And an equation (use "→", charges like Fe^3+, complexes in square brackets like [Cu(NH3)4(H2O)2]^2+, digits plain, balanced) or, for indicator tests, one short sentence. Titles must not give the answer away. Avoid these existing titles: ${[...Object.values(EXPERIMENTS).flat(), ...have.items].map((e) => e.title).join('; ')}.\nShelf: ${shelf}`,
      ExpBatch,
      EXP_SHAPE,
      0.8,
    );
    if (!res) continue;
    for (const r of res.reagents) if (!known().has(r.id) && codeOkReagent(r)) have.reagents.push(r);
    for (const e of have.items.filter((x) => x.status === 'pending')) {
      const problem = codeProblemExperiment(e, known());
      if (problem) Object.assign(e, { status: 'rejected', why: `code: ${problem}` });
    }
    for (const e of res.experiments) {
      if (have.items.some((x) => x.id === e.id || x.title === e.title)) continue;
      const problem = codeProblemExperiment(e, known());
      have.items.push({ ...e, status: problem ? 'rejected' : 'pending', ...(problem && { why: `code: ${problem}` }) });
    }
    save(file, have);
    const pending = have.items.filter((x) => x.status === 'pending');
    const verdicts = await check(
      'lab experiments',
      pending.map((e) => {
        const names = e.reagents.map((id) => known().get(id)?.name ?? id).join(' + ');
        return { id: e.id, text: `Level ${level}. "${e.title}": ${names} in a ${e.glassware}. Seen: ${e.observation.text} (liquid ${e.observation.liquid}${e.observation.precipitate ? `, precipitate ${e.observation.precipitate}` : ''}${e.observation.gas ? ', gas' : ''}). Q: ${e.question} Answer: ${e.answer}. Wrong options: ${e.wrong.join('; ')}. Equation: ${e.equation}` };
      }),
    );
    for (const e of pending) {
      const v = verdicts.get(e.id);
      if (!v) continue;
      e.status = v.ok && (v.level ?? level) >= level - 3 ? 'ok' : 'rejected';
      e.why = v.why;
    }
    save(file, have);
  }
}
function allNewReagents() {
  const out: z.infer<typeof NewReagent>[] = [];
  for (const level of [6, 7, 8, 9, 10]) for (const r of read<{ reagents: z.infer<typeof NewReagent>[] }>(`experiments-${level}.json`, { reagents: [] }).reagents) if (!out.some((x) => x.id === r.id)) out.push(r);
  return out;
}
function codeOkReagent(r: z.infer<typeof NewReagent>) {
  if (/indicator|reagent|solution of|starch|phenol|ethanol|propan|alcohol|aldehyde|ketone|glucose|DNPH|Tollens|Fehling|Benedict|dimethylglyoxime|ninhydrin|biuret/i.test(r.name)) return true;
  try {
    parseSpecies(r.formula.replace(/\s/g, ''));
    return true;
  } catch {
    return false;
  }
}
function codeProblemExperiment(e: Exp, shelf: Map<string, { id: string }>) {
  if (e.reagents[0] === e.reagents[1]) return 'same reagent twice';
  if (!e.reagents.every((id) => shelf.has(id))) return `unknown reagent ${e.reagents.join(',')}`;
  const options = [e.answer, ...e.wrong].map((o) => o.trim().toLowerCase());
  if (new Set(options).size !== options.length) return 'repeated option';
  if (e.title.toLowerCase().includes(e.answer.toLowerCase())) return 'title gives the answer';
  for (const part of e.equation.split(/;|\bthen\b/)) {
    if (!/→/.test(part)) continue;
    const p = parseEquation(part.trim().replace(/\s*\((aq|s|l|g|excess|conc\.?|dilute)\)/g, ''));
    if (!p) return `equation does not parse: ${part}`;
    if (!balancedAny(p)) return `equation not balanced: ${part}`;
  }
  return null;
}
/** Atoms and charge balance with the written coefficients (not necessarily the smallest). */
function balancedAny(p: { reactants: string[]; products: string[]; coefficients: number[] }) {
  const total: Record<string, number> = {};
  [...p.reactants, ...p.products].forEach((s, k) => {
    const sign = k < p.reactants.length ? 1 : -1;
    const { atoms, charge } = parseSpecies(s);
    for (const [el, n] of Object.entries(atoms)) total[el] = (total[el] ?? 0) + sign * n * p.coefficients[k]!;
    total['^'] = (total['^'] ?? 0) + sign * charge * p.coefficients[k]!;
  });
  return Object.values(total).every((v) => v === 0);
}

// ─── Reaction Rush completions ────────────────────────────────────────────────

const Comp = z.object({ id: z.string().regex(/^[a-z0-9-]{3,40}$/), reactants: z.string().min(3).max(90), answer: z.string().min(1).max(90), wrong: z.array(z.string().min(1).max(90)).min(3).max(3), why: z.string().max(200) });
type CompT = z.infer<typeof Comp>;
const COMP_SHAPE = '{"items":[{"id":"cu-nh3-excess","reactants":"Cu^2+ + NH3 (excess) →","answer":"[Cu(NH3)4(H2O)2]^2+","wrong":["Cu(OH)2","[CuCl4]^2-","Cu + NH4^+"],"why":"one line"}]}';
const COMP_FOCUS: Record<number, string> = {
  6: 'A-level: organic functional-group reactions (alkenes + HBr/Br2/H2O, alcohol oxidation, esterification, nucleophilic substitution), precipitation and acid–base ionic equations.',
  7: 'harder A-level: complex ions and ligand exchange, redox products (MnO4-, Cr2O7^2-), carbonyl chemistry (NaBH4, HCN, Tollens), amines and amides, benzene electrophilic substitution.',
  8: 'university: mechanism-based products (E1 vs E2, Zaitsev vs Hofmann, SN1 rearrangements), Grignard additions, aldol, Diels–Alder, d-block redox and disproportionation.',
  9: 'upper university: regioselectivity and stereochemistry-free outcomes of named reactions (Friedel–Crafts, Cannizzaro, Wittig, Claisen, Hofmann rearrangement, Beckmann), main-group chemistry (XeF6 hydrolysis, interhalogens, boranes).',
  10: 'olympiad: products of multi-step or unusual reactions where the obvious answer is a trap (pinacol rearrangement, carbocation shifts, ozonolysis fragments, disproportionation in base, comproportionation).',
};
async function writeCompletions(level: number) {
  const file = `completions-${level}.json`;
  const have = read<{ items: (CompT & { status: string; check?: string })[]; rounds: number }>(file, { items: [], rounds: 0 });
  while (have.items.filter((x) => x.status === 'ok').length < 10 && have.rounds < 3) {
    have.rounds++;
    const res = await ask(
      WRITER,
      `Write 14 "what forms?" items for level ${level} of a chemistry game. ${LADDER}\nFocus: ${COMP_FOCUS[level]}\nEach: the reactants and conditions ending with "→" (plain digits, charges like Fe^3+, organic compounds by formula like CH3CH2OH or by IUPAC name when clearer), the right product(s) (main organic product, or the ionic product), and 3 wrong but tempting answers in the same style (a real trap at this level). Products written like the reactants; if more than one product, join with " + ". Avoid: ${[...Object.values(COMPLETIONS).flat(), ...have.items].map((c) => c.reactants).join(' | ')}`,
      z.object({ items: z.array(Comp).min(4).max(16) }),
      COMP_SHAPE,
      0.8,
    );
    if (!res) continue;
    for (const c of res.items) {
      if (have.items.some((x) => x.id === c.id || x.reactants === c.reactants)) continue;
      const options = [c.answer, ...c.wrong].map((o) => o.trim().toLowerCase());
      const problem = new Set(options).size !== 4 ? 'repeated option' : null;
      have.items.push({ ...c, status: problem ? 'rejected' : 'pending', ...(problem && { check: problem }) });
    }
    const pending = have.items.filter((x) => x.status === 'pending');
    const verdicts = await check('"what forms?" reaction questions', pending.map((c) => ({ id: c.id, text: `Level ${level}. ${c.reactants} ?  Answer: ${c.answer}. Wrong options: ${c.wrong.join('; ')}. (${c.why})` })));
    for (const c of pending) {
      const v = verdicts.get(c.id);
      if (!v) continue;
      c.status = v.ok && (v.level ?? level) >= level - 3 ? 'ok' : 'rejected';
      c.check = v.why;
    }
    save(file, have);
  }
}

// ─── Mystery Substance unknowns ──────────────────────────────────────────────

const ALL_TESTS = [...BASIC_TESTS, ...MORE_TESTS] as TestId[];
const Results = z.object(Object.fromEntries(ALL_TESTS.map((t) => [t, z.string().min(2).max(70)])) as Record<TestId, z.ZodString>);
const Sub = z.object({ id: z.string().regex(/^[a-z0-9-]{2,30}$/), name: z.string().min(3).max(60), appearance: z.string().min(3).max(60), level: z.number().int().min(6).max(10), results: Results });
type SubT = z.infer<typeof Sub>;
const TESTS_TEXT = ALL_TESTS.map((t) => `${t}: ${TEST_TEXT[t]}`).join('; ');
const SUB_SHAPE = `{"items":[{"id":"ethanal","name":"Ethanal","appearance":"Colourless liquid with a fruity smell","level":8,"results":{${ALL_TESTS.map((t) => `"${t}":"short result"`).join(',')}}}]}`;

async function writeSubstances() {
  const file = 'substances.json';
  const have = read<{ items: (SubT & { status: string; check?: string })[]; fills: Record<string, { results: Partial<Record<TestId, string>>; status: string; check?: string }>; rounds: number }>(file, { items: [], fills: {}, rounds: 0 });
  // 1. The existing unknowns need results for the new tests.
  for (const s of SUBSTANCES) {
    if (have.fills[s.id]) continue;
    const res = await ask(
      WRITER,
      `A chemistry game identifies unknown liquids. For "${s.name}" (${s.appearance}) give the result a student sees for each test, short (under 60 characters), "No visible change" when nothing happens. Tests: ${MORE_TESTS.map((t) => `${t}: ${TEST_TEXT[t]}`).join('; ')}. Known results for comparison: ${JSON.stringify(s.results)}`,
      z.object({ results: z.object(Object.fromEntries(MORE_TESTS.map((t) => [t, z.string().min(2).max(70)])) as Record<string, z.ZodString>) }),
      `{"results":{${MORE_TESTS.map((t) => `"${t}":"..."`).join(',')}}}`,
      0.3,
    );
    if (res) have.fills[s.id] = { results: res.results as Partial<Record<TestId, string>>, status: 'pending' };
    save(file, have);
  }
  const pendingFills = Object.entries(have.fills).filter(([, f]) => f.status === 'pending');
  const fv = await check(
    'test results for known solutions (each line: one substance and what each test shows)',
    pendingFills.map(([id, f]) => ({ id, text: `${SUBSTANCES.find((s) => s.id === id)!.name}: ${Object.entries(f.results).map(([t, r]) => `${t} (${TEST_TEXT[t as TestId]}) → ${r}`).join('; ')}` })),
  );
  for (const [id, f] of pendingFills) {
    const v = fv.get(id);
    if (v) {
      f.status = v.ok ? 'ok' : 'rejected';
      f.check = v.why;
    }
  }
  save(file, have);
  // 2. New unknowns for levels 6–10.
  while (have.items.filter((x) => x.status === 'ok').length < 22 && have.rounds < 4) {
    have.rounds++;
    const res = await ask(
      WRITER,
      `Write 10 unknown substances (solutions or pure liquids a university teaching lab would use) for a "mystery substance" game, levels 6–10. ${LADDER}\nPick sets that are hard to tell apart (e.g. FeSO4 vs FeCl3 vs Fe2(SO4)3; ethanal vs propanone vs ethanol vs propan-2-ol; methanoic vs ethanoic acid; phenol vs cyclohexanol; ZnSO4 vs Al2(SO4)3 vs MgSO4; KBr vs KI vs KCl; Na2SO3 vs Na2SO4 vs Na2CO3; hexene vs hexane; glucose vs sucrose). For each give EVERY test result, short (under 60 characters), "No visible change" if nothing happens. Tests: ${TESTS_TEXT}. Already used: ${[...SUBSTANCES, ...have.items].map((s) => s.name).join('; ')}`,
      z.object({ items: z.array(Sub).min(3).max(12) }),
      SUB_SHAPE,
      0.7,
    );
    if (!res) continue;
    for (const s of res.items) if (!have.items.some((x) => x.id === s.id || x.name === s.name) && !SUBSTANCES.some((x) => x.id === s.id)) have.items.push({ ...s, status: 'pending' });
    const pending = have.items.filter((x) => x.status === 'pending');
    const verdicts = await check(
      'unknown substances and their test results',
      pending.map((s) => ({ id: s.id, text: `${s.name} (${s.appearance}): ${Object.entries(s.results).map(([t, r]) => `${t} (${TEST_TEXT[t as TestId]}) → ${r}`).join('; ')}` })),
    );
    for (const s of pending) {
      const v = verdicts.get(s.id);
      if (!v) continue;
      s.status = v.ok ? 'ok' : 'rejected';
      s.check = v.why;
    }
    save(file, have);
  }
}

// ─── Audit and build ──────────────────────────────────────────────────────────

async function audit() {
  if (existsSync(join(WORK, 'audit.json'))) return;
  const r = random('audit');
  const take = <T>(list: T[], n: number) => [...list].sort(() => r() - 0.5).slice(0, n);
  const exps = LEVELS.flatMap((l) => read<{ items: (Exp & { status: string })[] }>(`experiments-${l}.json`, { items: [] }).items.filter((x) => x.status === 'ok').map((e) => ({ id: `e:${e.id}`, text: `${e.title}: ${e.reagents.join(' + ')}. Seen: ${e.observation.text}. Q: ${e.question} A: ${e.answer} (not ${e.wrong.join('; ')}). ${e.equation}` })));
  const comps = LEVELS.flatMap((l) => read<{ items: (CompT & { status: string })[] }>(`completions-${l}.json`, { items: [] }).items.filter((x) => x.status === 'ok').map((c) => ({ id: `c:${c.id}`, text: `${c.reactants} ? A: ${c.answer} (not ${c.wrong.join('; ')})` })));
  const subs = read<{ items: (SubT & { status: string })[] }>('substances.json', { items: [] }).items.filter((x) => x.status === 'ok').map((s) => ({ id: `s:${s.id}`, text: `${s.name}: ${Object.entries(s.results).map(([t, v]) => `${t} → ${v}`).join('; ')}` }));
  const sample = [...take(exps, 12), ...take(comps, 12), ...take(subs, 6)];
  const verdicts = await check('items another examiner already passed (a second opinion)', sample, AUDITOR);
  save('audit.json', [...verdicts.values()]);
}

/** A third model re-reads EVERY passed item (the sample audit found 3 slips in 20); failures are dropped. */
async function fullAudit() {
  if (existsSync(join(WORK, 'fullaudit.json'))) return;
  const pass = (x: { status: string }) => x.status === 'ok' || x.status === 'lower';
  const items = [
    ...LEVELS.flatMap((l) => read<{ items: (Exp & { status: string })[] }>(`experiments-${l}.json`, { items: [] }).items.filter(pass).map((e) => ({ id: `e:${e.id}`, text: `"${e.title}": ${e.reagents.join(' + ')} in a ${e.glassware}. Seen: ${e.observation.text}. Q: ${e.question} A: ${e.answer} (wrong options: ${e.wrong.join('; ')}). ${e.equation}` }))),
    ...LEVELS.flatMap((l) => read<{ items: (CompT & { status: string })[] }>(`completions-${l}.json`, { items: [] }).items.filter(pass).map((c) => ({ id: `c:${c.id}`, text: `${c.reactants} ? A: ${c.answer} (wrong options: ${c.wrong.join('; ')})` }))),
    ...read<{ items: (SubT & { status: string })[] }>('substances.json', { items: [] }).items.filter(pass).map((x) => ({ id: `s:${x.id}`, text: `${x.name} (${x.appearance}): ${Object.entries(x.results).map(([t, v]) => `${t} (${TEST_TEXT[t as TestId]}) → ${v}`).join('; ')}` })),
    ...Object.entries(read<{ fills: Record<string, { results: Record<string, string>; status: string }> }>('substances.json', { fills: {} }).fills)
      .filter(([, f]) => f.status === 'ok')
      .map(([id, f]) => ({ id: `f:${id}`, text: `${SUBSTANCES.find((x) => x.id === id)!.name}: ${Object.entries(f.results).map(([t, v]) => `${t} (${TEST_TEXT[t as TestId]}) → ${v}`).join('; ')}` })),
  ];
  const verdicts = await check('items another examiner already passed (a second opinion: judge only correctness, not the level)', items, AUDITOR);
  save('fullaudit.json', [...verdicts.values()]);
}

function build() {
  const failedAudit = new Set([...read<Verdict[]>('audit.json', []), ...read<Verdict[]>('fullaudit.json', [])].filter((v) => !v.ok).map((v) => v.id.replace(/^[a-z]:(?=[a-z]:)/, '')));
  const experiments: Record<number, unknown[]> = {};
  const completions: Record<number, unknown[]> = {};
  for (const level of [6, 7, 8, 9, 10]) {
    // Items the checker passed but rated easier than written (status 'lower', see recover.cjs) go two levels down.
    const from = <T,>(kind: string, l: number, status: string) => (l > 10 ? [] : read<{ items: (T & { status: string })[] }>(`${kind}-${l}.json`, { items: [] }).items.filter((x) => x.status === status));
    const lowered = <T,>(kind: string) => from<T>(kind, level + 2, 'lower');
    experiments[level] = [...from<Exp>('experiments', level, 'ok'), ...lowered<Exp>('experiments')]
      .filter((e) => !failedAudit.has(`e:${e.id}`))
      .map(({ id, title, reagents, glassware, observation, question, answer, wrong, equation }) => ({ id, title, reagents, glassware, observation, question, answer, wrong, equation }));
    completions[level] = [...from<CompT>('completions', level, 'ok'), ...lowered<CompT>('completions')]
      .filter((c) => !failedAudit.has(`c:${c.id}`))
      .map(({ reactants, answer, wrong }) => ({ reactants, answer, wrong }));
  }
  const usedReagents = new Set(Object.values(experiments).flat().flatMap((e) => (e as Exp).reagents));
  const reagents = allNewReagents().filter((r) => usedReagents.has(r.id));
  const subFile = read<{ items: (SubT & { status: string })[]; fills: Record<string, { results: Partial<Record<TestId, string>>; status: string }> }>('substances.json', { items: [], fills: {} });
  const substances = subFile.items.filter((s) => s.status === 'ok' && !failedAudit.has(`s:${s.id}`)).map(({ id, name, appearance, level, results }) => ({ id, name, appearance, level, results }));
  const fills = Object.fromEntries(Object.entries(subFile.fills).filter(([id, f]) => f.status === 'ok' && !failedAudit.has(`f:${id}`)).map(([id, f]) => [id, f.results]));
  const body = `/**
 * Chemistry lab content for levels 6–10, written by scripts/chemistry-content.ts: proposed by one model,
 * checked by a second (and a sample by a third), after code checks (formulas parse, equations balance,
 * options distinct). Do not edit by hand; rerun the script. Generated ${new Date().toISOString().slice(0, 10)}.
 */
import type { Experiment, Reagent } from './experiments.js';
import type { Completion } from './equations.js';
import type { Substance, TestId } from './substances.js';

export const GEN_REAGENTS: Reagent[] = ${JSON.stringify(reagents, null, 1)};
export const GEN_EXPERIMENTS: Record<number, Experiment[]> = ${JSON.stringify(experiments, null, 1)} as unknown as Record<number, Experiment[]>;
export const GEN_COMPLETIONS: Record<number, Completion[]> = ${JSON.stringify(completions, null, 1)} as unknown as Record<number, Completion[]>;
export const GEN_SUBSTANCES: Substance[] = ${JSON.stringify(substances, null, 1)};
/** Results of the newer tests for the original unknowns. */
export const GEN_RESULTS: Record<string, Partial<Record<TestId, string>>> = ${JSON.stringify(fills, null, 1)};
`;
  writeFileSync(join(DATA, 'generated.ts'), body);
  console.log('wrote generated.ts', { reagents: reagents.length, experiments: Object.fromEntries(Object.entries(experiments).map(([k, v]) => [k, v.length])), completions: Object.fromEntries(Object.entries(completions).map(([k, v]) => [k, v.length])), substances: substances.length, fills: Object.keys(fills).length });
}

function stats() {
  const show = (name: string, list: { status: string; why?: string; check?: string }[]) =>
    console.log(name, { ok: list.filter((x) => x.status === 'ok').length, rejected: list.filter((x) => x.status === 'rejected').length, pending: list.filter((x) => x.status === 'pending').length });
  for (const l of LEVELS) {
    show(`experiments-${l}`, read<{ items: { status: string }[] }>(`experiments-${l}.json`, { items: [] }).items);
    show(`completions-${l}`, read<{ items: { status: string }[] }>(`completions-${l}.json`, { items: [] }).items);
  }
  show('substances', read<{ items: { status: string }[] }>('substances.json', { items: [] }).items);
  for (const f of ['periodic', 'molecules', 'equations', 'calcs', 'audit', 'fullaudit']) {
    const v = read<Verdict[]>(`${f}.json`, []);
    console.log(f, `${v.filter((x) => x.ok).length}/${v.length} ok`);
    for (const x of v.filter((y) => !y.ok)) console.log('   ✗', x.id, x.why);
  }
  console.log('spent', money);
}

async function main() {
  if (!config.VULTR_INFERENCE_API_KEY && STAGES.some((s) => !['build', 'stats'].includes(s))) throw new Error('VULTR_INFERENCE_API_KEY is not set');
  try {
    const jobs: Promise<unknown>[] = [];
    if (STAGES.includes('periodic')) jobs.push(checkPeriodic());
    if (STAGES.includes('molecules')) jobs.push(checkMolecules());
    if (STAGES.includes('equations')) jobs.push(checkEquations());
    if (STAGES.includes('calcs')) jobs.push(checkCalcs());
    if (STAGES.includes('experiments')) jobs.push(...LEVELS.map(writeExperiments));
    if (STAGES.includes('completions')) jobs.push(...LEVELS.map(writeCompletions));
    if (STAGES.includes('substances')) jobs.push(writeSubstances());
    const settled = await Promise.allSettled(jobs);
    for (const s of settled) if (s.status === 'rejected') console.log('job failed:', (s.reason as Error).message);
    if (STAGES.includes('audit') || STAGES.includes('build')) await audit();
    if (STAGES.includes('fullaudit')) await fullAudit();
  } catch (e) {
    if (!(e instanceof OutOfMoney)) throw e;
    console.log('Stopped: budget reached');
  }
  if (STAGES.includes('build')) build();
  if (STAGES.includes('stats')) stats();
  console.log('spent so far $', money.vultrUsd);
}
void main();
