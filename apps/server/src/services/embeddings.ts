import { vultrCost, vultrLogModel } from './vultr.js';

/**
 * Text embeddings from Vultr Serverless Inference, for smart search (services/search-index.ts builds the
 * index, services/semantic-search.ts reads it). One model for everything: a query's vector only means
 * something next to vectors from the same model and size.
 *
 * `qwen3-embedding-4b` is multilingual, so a question in French or Hausa finds English notes. It makes
 * 2560 numbers per text; asking for 1024 (`dimensions`) keeps nearly all the quality at 40% of the size.
 * (Vultr's price list also names `bge-m3`, but the API doesn't serve it: "not found on any cluster".)
 */
export const EMBED_MODEL = 'qwen3-embedding-4b';
export const EMBED_DIMS = 1024;
const URL = 'https://api.vultrinference.com/v1/embeddings';

/**
 * Read from the environment each time (config.ts loads .env) so this file didn't have to wait for
 * config's VULTR_INFERENCE_API_KEY field; it can read `config.VULTR_INFERENCE_API_KEY` instead now.
 */
const apiKey = () => process.env.VULTR_INFERENCE_API_KEY || '';
/** Without a key there are no embeddings, and search stays keyword search. */
export const embeddingsConfigured = () => !!apiKey();

export const embeddingCost = (tokens: number) => vultrCost(EMBED_MODEL, { inputTokens: tokens, outputTokens: 0 });

/**
 * Qwen3's embeddings are trained with the task written before a query (and nothing before a document):
 * it's what lets a short question land next to a long note that answers it.
 */
const TASK = "Given a student's question or search, retrieve the study notes, practice questions and textbooks that help answer it";
export const asQuery = (q: string) => `Instruct: ${TASK}\nQuery: ${q}`;

/** Longer texts are cut: a section of notes is far shorter, and one huge input shouldn't fail a batch. */
const MAX_CHARS = 8000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Tests set the wait to 0 so retries don't sleep. */
export const embedTiming = { backoffMs: 1200 };

/** An error message that can't carry the key, whatever the API or the network layer put in it. */
function redact(text: string) {
  const key = apiKey();
  return (key ? text.split(key).join('[key]') : text).replace(/Bearer\s+\S+/gi, 'Bearer [key]').slice(0, 300);
}

type Reply = { data?: { index?: number; embedding?: number[] }[]; usage?: { prompt_tokens?: number; total_tokens?: number } };

/** Unit length, so a dot product between two vectors is their cosine. */
function normalise(v: number[]) {
  const out = new Float32Array(v.length);
  let sum = 0;
  for (const x of v) sum += x * x;
  const norm = Math.sqrt(sum) || 1;
  for (let i = 0; i < v.length; i++) out[i] = v[i]! / norm;
  return out;
}

/**
 * Embeds a batch of texts, in order. Retries when Vultr is busy (429), failing (5xx) or unreachable;
 * throws for anything else, and when there's no key.
 */
export async function embedTexts(
  texts: string[],
  options: { timeoutMs?: number; retries?: number } = {},
): Promise<{ vectors: Float32Array[]; tokens: number }> {
  const key = apiKey();
  if (!key) throw new Error('Embeddings need VULTR_INFERENCE_API_KEY');
  if (!texts.length) return { vectors: [], tokens: 0 };
  const { timeoutMs = 60_000, retries = 3 } = options;
  const body = JSON.stringify({ model: EMBED_MODEL, input: texts.map((t) => t.slice(0, MAX_CHARS)), dimensions: EMBED_DIMS });

  let last = 'no answer';
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt) await sleep(embedTiming.backoffMs * 2 ** (attempt - 1));
    let response: Response;
    try {
      response = await fetch(URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (e) {
      const cause = e instanceof Error && e.cause instanceof Error ? ` (${e.cause.message})` : '';
      last = redact(e instanceof Error ? `${e.name}: ${e.message}${cause}` : String(e));
      continue;
    }
    if (response.status === 429 || response.status >= 500) {
      last = `HTTP ${response.status}: ${redact(await response.text().catch(() => ''))}`;
      continue;
    }
    if (!response.ok)
      throw new Error(`Vultr refused the embedding request (HTTP ${response.status}): ${redact(await response.text().catch(() => ''))}`);
    let data: Reply;
    try {
      data = (await response.json()) as Reply;
    } catch {
      last = 'the answer wasn’t JSON';
      continue;
    }
    const rows = [...(data.data ?? [])].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    if (rows.length !== texts.length || rows.some((r) => r.embedding?.length !== EMBED_DIMS)) {
      last = `expected ${texts.length} vectors of ${EMBED_DIMS} numbers`;
      continue;
    }
    return {
      vectors: rows.map((r) => normalise(r.embedding!)),
      tokens: data.usage?.prompt_tokens ?? data.usage?.total_tokens ?? 0,
    };
  }
  throw new Error(`Vultr didn’t embed after ${retries + 1} tries (${last})`);
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Recent queries' vectors: people retype and refine the same searches, and each one is 4 KB. */
const recent = new Map<string, Float32Array>();
const REMEMBER = 500;
export const forgetQueries = () => recent.clear();

/**
 * The vector for what someone typed, or null when it can't be had (no key, Vultr slow or down): the
 * caller then carries on without smart search. Logged against the person when there is one.
 */
export async function embedQuery(query: string, userId?: string, feature = 'search_embed'): Promise<Float32Array | null> {
  const q = query.trim().replace(/\s+/g, ' ').slice(0, 1000);
  if (!q || !embeddingsConfigured()) return null;
  const known = recent.get(q);
  if (known) {
    // Moved to the end: the least recently used is the one dropped.
    recent.delete(q);
    recent.set(q, known);
    return known;
  }
  try {
    // Someone is waiting: one quick retry, and after five seconds in all, keyword search rather than a long pause.
    const { vectors, tokens } = await Promise.race([
      embedTexts([asQuery(q)], { timeoutMs: 3000, retries: 1 }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Vultr took too long')), 5000).unref()),
    ]);
    const vector = vectors[0]!;
    recent.set(q, vector);
    if (recent.size > REMEMBER) recent.delete(recent.keys().next().value!);
    if (userId) {
      // Loaded here so scripts that only write files never open the database.
      const { logUsage } = await import('./ai.js');
      await logUsage(userId, feature, vultrLogModel(EMBED_MODEL), { input_tokens: tokens, output_tokens: 0 }).catch(() => undefined);
    }
    return vector;
  } catch (e) {
    console.warn('Smart search fell back to keywords:', e instanceof Error ? e.message : e);
    return null;
  }
}

// ─── Storage ──────────────────────────────────────────────────────────────────

/**
 * A vector as one byte per number (4× smaller than floats, and search results barely move). Each vector
 * is scaled so its largest number is ±127; its length is worked out again when the index loads.
 */
export function quantise(v: Float32Array): Int8Array {
  let max = 0;
  for (const x of v) max = Math.max(max, Math.abs(x));
  const scale = max ? 127 / max : 0;
  const out = new Int8Array(v.length);
  for (let i = 0; i < v.length; i++) out[i] = Math.round(v[i]! * scale);
  return out;
}
