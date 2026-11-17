import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { config } from '../src/config.js';
import { prisma } from '../src/db.js';
import { parseModelJson, vultrChat, vultrCost, vultrJson, vultrTiming } from '../src/services/vultr.js';

const KEY = 'test-vultr-key-123';
const realFetch = globalThis.fetch;
const realKey = config.VULTR_INFERENCE_API_KEY;
const realBackoff = vultrTiming.backoffMs;

type Call = { url: string; headers: Record<string, string>; body: Record<string, unknown> };
let calls: Call[] = [];
/** Answers each request with the next reply in the list: [status, body] or an error to throw. */
function replies(...list: ([number, unknown] | Error)[]) {
  calls = [];
  globalThis.fetch = vi.fn(async (url: unknown, init?: RequestInit) => {
    calls.push({ url: String(url), headers: init!.headers as Record<string, string>, body: JSON.parse(String(init!.body)) });
    const reply = list[calls.length - 1];
    if (!reply) throw new Error('fetch called more often than the test expects');
    if (reply instanceof Error) throw reply;
    const [status, body] = reply;
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });
  }) as typeof fetch;
}
const answer = (content: string, usage = { prompt_tokens: 1000, completion_tokens: 500, completion_tokens_details: { reasoning_tokens: 200 } }, finish = 'stop') => ({
  choices: [{ message: { role: 'assistant', content }, finish_reason: finish }],
  usage,
});

beforeAll(() => {
  config.VULTR_INFERENCE_API_KEY = KEY;
  vultrTiming.backoffMs = 0;
});
afterEach(() => {
  globalThis.fetch = realFetch;
});
afterAll(() => {
  config.VULTR_INFERENCE_API_KEY = realKey;
  vultrTiming.backoffMs = realBackoff;
});

describe('vultrChat', () => {
  it('sends an OpenAI-style chat request and returns the text, tokens and cost', async () => {
    replies([200, answer('Accra')]);
    const r = await vultrChat({ model: 'deepseek-v4.1-flash-1017', system: 'Be brief.', input: 'Capital of Ghana?', maxTokens: 50, temperature: 0.2 });
    expect(r.text).toBe('Accra');
    expect(r.usage).toEqual({ inputTokens: 1000, outputTokens: 500, reasoningTokens: 200 });
    // 1,000 in at $0.15 a million and 500 out (thinking included) at $0.60 a million.
    expect(r.costUsd).toBeCloseTo(0.00015 + 0.0003, 10);
    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toBe('https://api.vultrinference.com/v1/chat/completions');
    expect(calls[0]!.headers.Authorization).toBe(`Bearer ${KEY}`);
    expect(calls[0]!.body).toEqual({
      model: 'deepseek-v4.1-flash-1017',
      messages: [
        { role: 'system', content: 'Be brief.' },
        { role: 'user', content: 'Capital of Ghana?' },
      ],
      max_tokens: 50,
      temperature: 0.2,
    });
  });

  it('asks for a JSON object when told to', async () => {
    replies([200, answer('{}')]);
    await vultrChat({ model: 'glm-5.3', messages: [{ role: 'user', content: 'Hi' }], json: true, maxTokens: 10 });
    expect(calls[0]!.body.response_format).toEqual({ type: 'json_object' });
  });

  it('tries again after a 429 and a 5xx, then answers', async () => {
    replies([429, 'slow down'], [503, 'busy'], [200, answer('ok')]);
    const r = await vultrChat({ model: 'glm-5.3', input: 'Hi', maxTokens: 10 });
    expect(r.text).toBe('ok');
    expect(calls).toHaveLength(3);
  });

  it('tries again after a timeout or a dropped connection', async () => {
    replies(new DOMException('The operation timed out', 'TimeoutError'), [200, answer('ok')]);
    expect((await vultrChat({ model: 'glm-5.3', input: 'Hi', maxTokens: 10 })).text).toBe('ok');
    expect(calls).toHaveLength(2);
  });

  it('gives up after two retries, without the key in the error', async () => {
    replies([500, `bad key ${KEY}`], [500, 'x'], [500, `Authorization: Bearer ${KEY}`]);
    const error = await vultrChat({ model: 'glm-5.3', input: 'Hi', maxTokens: 10 }).catch((e) => e);
    expect(calls).toHaveLength(3);
    expect(error).toMatchObject({ status: 502, reason: 'ai-failed' });
    expect(error.message).not.toContain(KEY);
  });

  it('doesn’t retry a request Vultr refuses, and keeps the key out of the error', async () => {
    replies([401, { error: `Invalid key ${KEY}` }]);
    const error = await vultrChat({ model: 'glm-5.3', input: 'Hi', maxTokens: 10 }).catch((e) => e);
    expect(calls).toHaveLength(1);
    expect(error.status).toBe(502);
    expect(error.message).toContain('401');
    expect(error.message).not.toContain(KEY);
  });

  it('answers not-configured without a key, and calls nobody', async () => {
    replies();
    config.VULTR_INFERENCE_API_KEY = '';
    try {
      await expect(vultrChat({ model: 'glm-5.3', input: 'Hi', maxTokens: 10 })).rejects.toMatchObject({ status: 503, reason: 'not-configured' });
      expect(calls).toHaveLength(0);
    } finally {
      config.VULTR_INFERENCE_API_KEY = KEY;
    }
  });

  it('writes the call to the usage log under the Vultr model', async () => {
    const user = await prisma.user.create({ data: { id: 'vultr-user', email: 'vultr@example.com', name: 'Ada', referralCode: 'VULTR1' } });
    replies([200, answer('ok')]);
    await vultrChat({ model: 'mimo-v2.6-pro', input: 'Hi', maxTokens: 10, log: { userId: user.id, feature: 'course_summary' } });
    const rows = await prisma.usageEvent.findMany({ where: { userId: user.id } });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ feature: 'course_summary', model: 'vultr:mimo-v2.6-pro', inputTokens: 1000, outputTokens: 500 });
    // The log's model name prices the same as Vultr's.
    expect(vultrCost(rows[0]!.model, rows[0]!)).toBeCloseTo(0.0004 + 0.0004, 10);
  });
});

describe('vultrCost', () => {
  it('prices each model from the one table, and an unknown model at nothing', () => {
    const million = { inputTokens: 1_000_000, outputTokens: 1_000_000 };
    expect(vultrCost('glm-5.3', million)).toBeCloseTo(3.75, 10);
    expect(vultrCost('qwen3.8-flash-next', million)).toBeCloseTo(0.3, 10);
    expect(vultrCost('bge-m3', million)).toBeCloseTo(0.05, 10);
    expect(vultrCost('not-a-model', million)).toBe(0);
  });
});

describe('vultrJson', () => {
  const Capital = z.object({ capital: z.string(), population: z.number() });

  it('returns the JSON when it fits the schema, fenced or not', async () => {
    replies([200, answer('```json\n{"capital":"Accra","population":2500000}\n```')]);
    const r = await vultrJson({ model: 'glm-5.3', input: 'Ghana?', schema: Capital, maxTokens: 100 });
    expect(r.data).toEqual({ capital: 'Accra', population: 2500000 });
    expect(r.attempts).toBe(1);
    expect(calls[0]!.body.response_format).toEqual({ type: 'json_object' });
  });

  it('sends a wrong answer back once with what was wrong, and adds up both calls', async () => {
    replies([200, answer('{"capital":"Accra","population":"about 2.5 million"}')], [200, answer('{"capital":"Accra","population":2500000}')]);
    const r = await vultrJson({ model: 'deepseek-v4.1-flash-1017', system: 'JSON only.', input: 'Ghana?', schema: Capital, maxTokens: 100 });
    expect(r.attempts).toBe(2);
    expect(r.data.population).toBe(2500000);
    expect(r.usage).toEqual({ inputTokens: 2000, outputTokens: 1000, reasoningTokens: 400 });
    expect(r.costUsd).toBeCloseTo(2 * (0.00015 + 0.0003), 10);
    const second = calls[1]!.body.messages as { role: string; content: string }[];
    expect(second.map((m) => m.role)).toEqual(['system', 'user', 'assistant', 'user']);
    expect(second[2]!.content).toContain('about 2.5 million');
    expect(second[3]!.content).toContain('population');
  });

  it('applies rules a schema can’t say', async () => {
    replies([200, answer('{"capital":"accra","population":1}')], [200, answer('{"capital":"Accra","population":1}')]);
    const r = await vultrJson({
      model: 'glm-5.3',
      input: 'Ghana?',
      schema: Capital,
      maxTokens: 100,
      check: (d) => (/^[A-Z]/.test(d.capital) ? null : 'Start the capital with a capital letter.'),
    });
    expect(r.data.capital).toBe('Accra');
    expect((calls[1]!.body.messages as { content: string }[]).at(-1)!.content).toContain('capital letter');
  });

  it('treats an answer cut off at the token limit as wrong', async () => {
    replies([200, answer('{"capital":"Acc', undefined, 'length')], [200, answer('{"capital":"Accra","population":1}')]);
    const r = await vultrJson({ model: 'glm-5.3', input: 'Ghana?', schema: Capital, maxTokens: 5 });
    expect(r.attempts).toBe(2);
    expect((calls[1]!.body.messages as { content: string }[]).at(-1)!.content).toContain('cut off');
  });

  it('gives up after the second wrong answer, still reporting what was spent', async () => {
    replies([200, answer('not json at all')], [200, answer('{"capital":7}')]);
    const error = await vultrJson({ model: 'glm-5.3', input: 'Ghana?', schema: Capital, maxTokens: 100 }).catch((e) => e);
    expect(calls).toHaveLength(2);
    expect(error).toMatchObject({ status: 502, reason: 'ai-failed' });
    expect(error.usage).toEqual({ inputTokens: 2000, outputTokens: 1000, reasoningTokens: 400 });
    expect(error.costUsd).toBeGreaterThan(0);
  });
});

describe('parseModelJson', () => {
  it('finds the object inside a sentence', () => {
    expect(parseModelJson('Here it is: {"a":1} Hope that helps.')).toEqual({ a: 1 });
    expect(() => parseModelJson('no object here')).toThrow();
  });
});
