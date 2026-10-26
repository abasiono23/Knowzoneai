import OpenAI from 'openai';

import { config } from '../config.js';
import { prisma } from '../db.js';
import { AppError } from '../lib/errors.js';

let client: OpenAI | null = null;
/** The OpenAI client, or a 503 the app can explain when no key is configured. */
export function openaiClient() {
  if (!config.OPENAI_API_KEY)
    throw new AppError(503, 'AI features aren’t set up on this server yet', 'not-configured');
  return (client ??= new OpenAI({ apiKey: config.OPENAI_API_KEY }));
}

/** Every AI call is logged with its tokens, for cost tracking and the tutor's daily allowance. */
export async function logUsage(userId: string, feature: string, model: string, usage?: OpenAI.Responses.ResponseUsage) {
  await prisma.usageEvent.create({
    data: {
      userId,
      feature,
      model,
      inputTokens: usage?.input_tokens ?? 0,
      outputTokens: usage?.output_tokens ?? 0,
    },
  });
}

/** Transcribes a photo of notes or a textbook page. */
export async function extractTextFromImage(userId: string, image: Buffer, mimeType: string) {
  const model = config.OPENAI_MODEL_GENERATE;
  const response = await openaiClient().responses.create({
    model,
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: 'Transcribe all study content in this photo of notes or a textbook page. Preserve headings, lists and equations. Output only the transcription.',
          },
          { type: 'input_image', image_url: `data:${mimeType};base64,${image.toString('base64')}`, detail: 'high' },
        ],
      },
    ],
  });
  await logUsage(userId, 'snap_to_study', model, response.usage);
  return response.output_text;
}
