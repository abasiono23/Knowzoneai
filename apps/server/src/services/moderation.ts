import { openaiClient } from './ai.js';

/**
 * Whether text people post for others to read (reel comments, study room chat) should be blocked.
 * OpenAI's moderation endpoint is free and catches harassment, hate, sexual content, self-harm and
 * violence; anything it flags isn't posted.
 */
export async function flagged(text: string) {
  const check = await openaiClient().moderations.create({ model: 'omni-moderation-latest', input: text });
  return check.results.some((r) => r.flagged);
}
