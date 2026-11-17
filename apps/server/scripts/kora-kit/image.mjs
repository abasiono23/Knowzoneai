// Makes one picture with minimax-h3 on Vultr, for Kora's kit. Never prints the key; the cost goes to the lessons' ledger.
//   node image.mjs base 864x1152 base.txt --seed=21              a new character
//   node image.mjs t-point 864x1152 point.txt base.png --seed=3  a pose of the same character (base.png is the reference)
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const key = readFileSync(join(HERE, '../../.env'), 'utf8').match(/^VULTR_INFERENCE_API_KEY=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, '');
if (!key) throw new Error('Set VULTR_INFERENCE_API_KEY in apps/server/.env');
const [name, size, promptFile, ...rest] = process.argv.slice(2);
const refs = rest.filter((a) => !a.startsWith('--'));
const seed = rest.find((a) => a.startsWith('--seed='))?.slice(7);
const body = { model: 'minimax-h3', prompt: readFileSync(join(HERE, promptFile), 'utf8').trim(), size, response_format: 'b64_json' };
if (seed) body.seed = Number(seed);
if (refs.length) body.images = refs.map((f) => ({ image_url: { url: 'data:image/png;base64,' + readFileSync(join(HERE, f)).toString('base64') } }));
const res = await fetch(`https://api.vultrinference.com/v1/images/${refs.length ? 'edits' : 'generations'}`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).split(key).join('[key]').slice(0, 300)}`);
const j = await res.json();
writeFileSync(join(HERE, `${name}.png`), Buffer.from(j.data[0].b64_json, 'base64'));
appendFileSync(join(HERE, '../../.kora-lessons/spend.jsonl'), JSON.stringify({ at: new Date().toISOString(), what: 'image', model: 'minimax-h3', cost: j.usage?.cost ?? 0.05, note: name }) + '\n');
console.log('made', `${name}.png`, 'cost', j.usage?.cost);
