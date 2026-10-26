import type { Question, QuizSettings } from './types';

/** Deterministic question selection so the preview, play and results screens agree. */
export function pickQuestions(pool: Question[], s: QuizSettings, seed: number) {
  const filtered = pool.filter(
    (q) =>
      s.types.includes(q.type) &&
      (s.difficulty === 'mixed' ||
        q.difficulty === s.difficulty ||
        (s.difficulty === 'hard' && q.difficulty === 'medium')),
  );
  const source = filtered.length ? filtered : pool.filter((q) => s.types.includes(q.type));
  return source
    .map((q, i) => ({ q, k: Math.sin(seed * 12.9898 + i * 78.233) }))
    .sort((a, b) => a.k - b.k)
    .map((o) => o.q)
    .slice(0, s.count);
}

export const toParams = (s: QuizSettings, seed: number) => ({
  count: String(s.count),
  difficulty: s.difficulty,
  types: s.types.join(','),
  timed: s.timed ? '1' : '0',
  seed: String(seed),
});

export function fromParams(p: Record<string, string | undefined>): { settings: QuizSettings; seed: number } {
  return {
    settings: {
      count: Number(p.count) || 10,
      difficulty: (p.difficulty as QuizSettings['difficulty']) || 'mixed',
      types: (p.types ? p.types.split(',') : ['mcq', 'tf']) as QuizSettings['types'],
      timed: p.timed === '1',
    },
    seed: Number(p.seed) || 1,
  };
}

export const SECONDS_PER_QUESTION = 30;
