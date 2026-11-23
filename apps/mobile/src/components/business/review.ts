import { t as i18nT } from 'i18next';

import type { ReviewItem } from '@/components/lab/contract';
import type { AnalystStep } from '@/lib/api';

/** Translation outside React (review lists for the results screen). */
const tr = i18nT as unknown as (key: string, options?: Record<string, unknown>) => string;

/** The analyst's desk questions of a finished run, for the results screen's review list. */
export function deskReview(run: { analyst?: AnalystStep[] }): ReviewItem[] {
  return (run.analyst ?? []).flatMap((q) =>
    q.result
      ? [
          {
            key: `desk${q.id}`,
            correct: q.result.correct,
            main: tr(`business:analyst.kinds.${q.kind}.name`),
            detail: q.result.correct ? q.result.answer : `${q.result.choice ?? '—'} → ${q.result.answer}`,
          },
        ]
      : [],
  );
}
