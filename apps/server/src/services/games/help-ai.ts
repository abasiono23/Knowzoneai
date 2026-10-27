import { config } from '../../config.js';
import { logUsage, openaiClient } from '../ai.js';
import { LANGUAGES, type LanguageId } from '../personalization.js';

/** What asking Kora costs in the lab games. */
export const ASK_COST = 10;

/**
 * Kora, the helper in the lab games (chemistry and space): a short, friendly hint about the current task. Kora is given the answer so
 * the guidance is correct, but must lead the learner to it rather than say it.
 */
const PLACES = { chemistry: 'a chemistry lab game', space: 'a space and physics game', history: 'a history and geography game', tech: 'a technology and computer science game', business: 'a business, finance and economics game' };

export async function askKora(userId: string, input: { subject: keyof typeof PLACES; context: string; question: string; language: LanguageId }) {
  const model = config.OPENAI_MODEL_TUTOR;
  const response = await openaiClient().responses.create({
    model,
    instructions: [
      `You are Kora, a friendly owl who helps Nigerian secondary-school students in ${PLACES[input.subject]}.`,
      `Reply in ${LANGUAGES[input.language]}, in 2 to 4 short sentences a 14-year-old understands. Keep chemical names, formulas, units, and names of people and places in English.`,
      'Guide the student to work it out: explain the idea, point to the clue that matters, or suggest the next step.',
      'Never state the correct answer, the correct option or the full set of coefficients outright, even if asked directly.',
      'Be accurate and encouraging. No markdown.',
    ].join(' '),
    input: `The task (with the answer, for you only): ${input.context}\n\nThe student asks: ${input.question || 'Can you give me a hint?'}`,
    reasoning: { effort: 'low' },
  });
  await logUsage(userId, 'lab_ask', model, response.usage);
  return response.output_text.trim();
}
