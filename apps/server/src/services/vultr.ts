import type { z } from 'zod';

import { config } from '../config.js';
import { AppError } from '../lib/errors.js';

/**
 * Vultr Serverless Inference: open models behind an OpenAI-compatible API. Knowzone's second AI provider,
 * used for content written in bulk and stored in the backend (course summaries). OpenAI stays the provider
 * for what learners do live (services/ai.ts).
 */
const BASE = 'https://api.vultrinference.com/v1';

/** US dollars per million tokens, in and out. A model's thinking is billed as output. */
export const VULTR_PRICES: Record<string, { in: number; out: number }> = {
  'deepseek-v4.1-flash-1017': { in: 0.15, out: 0.6 },
  'qwen3.8-flash-next': { in: 0.1, out: 0.2 },
  'qwen3.8-27b': { in: 0.15, out: 1.0 },
  'glm-5.3-flash': { in: 0.1, out: 0.35 },
  'glm-5.3': { in: 0.75, out: 3.0 },
  'glm-5.2': { in: 0.75, out: 3.0 },
  'mimo-v2.6-pro': { in: 0.4, out: 0.8 },
  'mimo-v2.6-flash': { in: 0.1, out: 0.25 },
  'minimax-m3.1-flash': { in: 0.2, out: 0.9 },
  'bge-m3': { in: 0.05, out: 0 },
  'qwen3-embedding-4b': { in: 0.05, out: 0 },
};

/** How the usage log names a Vultr model, so its rows stand apart from OpenAI's ("vultr:glm-5.3"). */
export const VULTR_PREFIX = 'vultr:';
export const vultrLogModel = (model: string) => `${VULTR_PREFIX}${model}`;

export type VultrUsage = {
  inputTokens: number;
  /** Everything billed as output: the answer and the model's thinking. */
  outputTokens: number;
  /** The part of `outputTokens` spent thinking. */
  reasoningTokens: number;
};

/**
 * What a call cost in US dollars. Takes the model as Vultr names it or as the usage log does
 * ("vultr:…"). A model missing from the table costs 0 here: add it rather than guess.
 */
export function vultrCost(model: string, usage: Pick<VultrUsage, 'inputTokens' | 'outputTokens'>) {
  const price = VULTR_PRICES[model.startsWith(VULTR_PREFIX) ? model.slice(VULTR_PREFIX.length) : model];
  if (!price) return 0;
  return (usage.inputTokens * price.in + usage.outputTokens * price.out) / 1_000_000;
}

export const vultrConfigured = () => !!config.VULTR_INFERENCE_API_KEY;

type Message = { role: 'system' | 'user' | 'assistant'; content: string };

export type VultrChatOptions = {
  model: string;
  system?: string;
  /** The conversation so far, or `input` for a single user message. */
  messages?: Message[];
  input?: string;
  /** Asks for a JSON object back (`response_format: json_object`). */
  json?: boolean;
  maxTokens: number;
  temperature?: number;
  /** For one attempt. Long answers from thinking models take minutes. */
  timeoutMs?: number;
  /** Extra tries after a 429, a 5xx, a timeout or a dropped connection. */
  retries?: number;
  /** Writes the call to the usage log against this person, under this feature. */
  log?: { userId: string; feature: string };
};

export type VultrChatResult = {
  text: string;
  model: string;
  /** `length` means the answer was cut off at `maxTokens`. */
  finishReason: string;
  usage: VultrUsage;
  costUsd: number;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Tests set this to 0 so retries don't wait. */
export const vultrTiming = { backoffMs: 1500 };

/** An error message that can't carry the key, whatever the API or the network layer put in it. */
function redact(text: string) {
  const key = config.VULTR_INFERENCE_API_KEY;
  const clean = key ? text.split(key).join('[key]') : text;
  return clean.replace(/Bearer\s+\S+/gi, 'Bearer [key]').slice(0, 400);
}

type Completion = {
  choices?: { message?: { content?: string | null }; finish_reason?: string }[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    completion_tokens_details?: { reasoning_tokens?: number };
  };
};

/**
 * One chat completion. Retries twice, waiting longer each time, when Vultr is busy (429), failing (5xx)
 * or silent; other errors are the caller's to fix and fail at once. Answers 503 'not-configured' without a key.
 */
export async function vultrChat(options: VultrChatOptions): Promise<VultrChatResult> {
  if (!config.VULTR_INFERENCE_API_KEY)
    throw new AppError(503, 'Vultr inference isn’t set up on this server yet', 'not-configured');
  const { model, system, input, json, maxTokens, temperature, timeoutMs = 120_000, retries = 2, log } = options;
  const messages: Message[] = [
    ...(system ? [{ role: 'system' as const, content: system }] : []),
    ...(options.messages ?? []),
    ...(input !== undefined ? [{ role: 'user' as const, content: input }] : []),
  ];
  if (!messages.some((m) => m.role === 'user')) throw new Error('vultrChat needs messages or input');
  const body = JSON.stringify({
    model,
    messages,
    max_tokens: maxTokens,
    ...(temperature !== undefined ? { temperature } : {}),
    ...(json ? { response_format: { type: 'json_object' } } : {}),
  });

  let last = 'no answer';
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt) await sleep(vultrTiming.backoffMs * 2 ** (attempt - 1));
    let response: Response;
    try {
      response = await fetch(`${BASE}/chat/completions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.VULTR_INFERENCE_API_KEY}`, 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (e) {
      last = redact(e instanceof Error ? `${e.name}: ${e.message}` : String(e));
      continue;
    }
    if (response.status === 429 || response.status >= 500) {
      last = `HTTP ${response.status}: ${redact(await response.text().catch(() => ''))}`;
      // Vultr limits how many requests a model takes at once; a busy model needs longer than a failing one.
      const wait = Number(response.headers.get('retry-after'));
      if (attempt < retries && response.status === 429)
        await sleep(wait > 0 ? Math.min(wait * 1000, 60_000) : vultrTiming.backoffMs * 4 * (1 + Math.random()));
      continue;
    }
    if (!response.ok)
      throw new AppError(502, `Vultr refused the request (HTTP ${response.status}): ${redact(await response.text().catch(() => ''))}`, 'ai-failed');

    let data: Completion;
    try {
      data = (await response.json()) as Completion;
    } catch {
      last = 'the answer wasn’t JSON';
      continue;
    }
    const usage: VultrUsage = {
      inputTokens: data.usage?.prompt_tokens ?? 0,
      outputTokens: data.usage?.completion_tokens ?? 0,
      reasoningTokens: data.usage?.completion_tokens_details?.reasoning_tokens ?? 0,
    };
    if (log) {
      // Loaded here so scripts that only write files never open the database.
      const { logUsage } = await import('./ai.js');
      await logUsage(log.userId, log.feature, vultrLogModel(model), {
        input_tokens: usage.inputTokens,
        output_tokens: usage.outputTokens,
      });
    }
    const choice = data.choices?.[0];
    return {
      text: choice?.message?.content ?? '',
      model,
      finishReason: choice?.finish_reason ?? 'stop',
      usage,
      costUsd: vultrCost(model, usage),
    };
  }
  throw new AppError(502, `Vultr didn’t answer after ${retries + 1} tries (${last})`, 'ai-failed');
}

/** The JSON in a model's answer: open models sometimes wrap it in a code fence or a sentence. */
export function parseModelJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start < 0 || end <= start) throw new Error('The answer has no JSON object in it');
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

const problems = (e: z.ZodError) =>
  e.issues
    .slice(0, 12)
    .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('; ');

export type VultrJsonResult<T> = {
  data: T;
  /** 1, or 2 when the first answer was wrong and the model was asked again. */
  attempts: number;
  /** Both calls' tokens and cost when there were two. */
  usage: VultrUsage;
  costUsd: number;
};

/**
 * A chat completion whose answer must be JSON that fits `schema`. Open models break formats more often
 * than OpenAI's, so a wrong answer goes back to the model once, with what was wrong, before this gives up.
 * `check` adds rules a schema can't say (return the problem, or null).
 */
export async function vultrJson<T>(
  options: Omit<VultrChatOptions, 'json'> & { schema: z.ZodType<T>; check?: (data: T) => string | null },
): Promise<VultrJsonResult<T>> {
  const { schema, check, ...chat } = options;
  const usage: VultrUsage = { inputTokens: 0, outputTokens: 0, reasoningTokens: 0 };
  let costUsd = 0;
  const base: Message[] = [
    ...(chat.messages ?? []),
    ...(chat.input !== undefined ? [{ role: 'user' as const, content: chat.input }] : []),
  ];
  let messages = base;
  let problem = '';
  for (let attempt = 1; attempt <= 2; attempt++) {
    const r = await vultrChat({ ...chat, input: undefined, messages, json: true });
    usage.inputTokens += r.usage.inputTokens;
    usage.outputTokens += r.usage.outputTokens;
    usage.reasoningTokens += r.usage.reasoningTokens;
    costUsd += r.costUsd;
    try {
      if (r.finishReason === 'length') throw new Error('The answer was cut off before the JSON ended; write it shorter');
      const parsed = schema.safeParse(parseModelJson(r.text));
      if (!parsed.success) throw new Error(problems(parsed.error));
      const wrong = check?.(parsed.data);
      if (wrong) throw new Error(wrong);
      return { data: parsed.data, attempts: attempt, usage, costUsd };
    } catch (e) {
      problem = e instanceof Error ? e.message : String(e);
      messages = [
        ...base,
        // A cut-off or huge answer isn't worth sending back whole.
        { role: 'assistant', content: r.text.slice(0, 6000) },
        {
          role: 'user',
          content: `That answer can't be used: ${problem.slice(0, 1500)}\nSend the whole JSON object again, corrected. JSON only, no other text.`,
        },
      ];
    }
  }
  const error = new AppError(502, `The model's JSON was wrong twice: ${problem.slice(0, 300)}`, 'ai-failed');
  // The tokens were still spent; a job keeping a budget needs them.
  throw Object.assign(error, { usage, costUsd });
}
