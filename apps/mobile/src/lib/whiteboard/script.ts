import type { TutorAnswer } from '@/lib/tutor/types';

/** One line Kora writes on the board, in a marker colour, and what she says while writing it. */
export type BoardLine = {
  kind: 'question' | 'heading' | 'text' | 'formula' | 'step' | 'answer';
  text: string;
  /** What Kora says aloud. Empty to write without speaking. */
  say: string;
};

/** Board markers, like a classroom: blue for the question, black for working, green for steps, red for the answer. */
export const MARKERS: Record<BoardLine['kind'], string> = {
  question: '#1f5fd1',
  heading: '#1b1740',
  text: '#1b1740',
  formula: '#1b1740',
  step: '#178a4c',
  answer: '#d6293b',
};

const MAX_STEPS = 8;

/**
 * Turns a tutor answer into board lines: the question, the short answer in words, any formula, the
 * steps (each a heading and its working), then the final answer boxed in red.
 */
export function boardScript(
  question: string,
  a: TutorAnswer,
  words: { step: (n: number) => string; answer: string },
): BoardLine[] {
  const lines: BoardLine[] = [{ kind: 'question', text: question, say: '' }];
  lines.push({ kind: 'text', text: a.summary, say: a.summary });
  for (const b of a.body) if (b.type === 'formula') lines.push({ kind: 'formula', text: b.text, say: '' });
  a.steps.slice(0, MAX_STEPS).forEach((s, i) => {
    lines.push({ kind: 'step', text: `${words.step(i + 1)}: ${s.title}`, say: s.title });
    if (s.formula) lines.push({ kind: 'formula', text: s.formula, say: '' });
    lines.push({ kind: 'text', text: s.detail, say: s.detail });
  });
  if (a.finalAnswer) lines.push({ kind: 'answer', text: a.finalAnswer, say: `${words.answer} ${a.finalAnswer}` });
  return lines.filter((l) => l.text.trim());
}

/** How long a line takes to write: quick enough to keep up with the voice, slow enough to watch. */
export const writeMs = (text: string) => Math.min(4200, Math.max(500, text.length * 38));
