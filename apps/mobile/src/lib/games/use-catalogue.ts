import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { errorText } from '@/i18n/errors';
import { api, type EnglishGameId, type GamesCatalogue } from '@/lib/api';
import { USE_MOCKS } from '@/lib/config';
import i18n from '@/i18n';

/** Levels, stars and today's rewards for the English games; refreshed whenever the screen shows. */
export function useGamesCatalogue() {
  const [data, setData] = useState<GamesCatalogue | null>(null);
  const [error, setError] = useState<string | null>(null);
  useFocusEffect(
    useCallback(() => {
      let live = true;
      if (USE_MOCKS) {
        // Answers are checked on the server, so word games aren't part of the offline demo.
        setError(i18n.t('games:hub.offline'));
        return;
      }
      api
        .getEnglishGames()
        .then((d) => {
          if (!live) return;
          setData(d);
          setError(null);
        })
        .catch((e) => live && setError(errorText(e, i18n.t('games:hub.offline'))));
      return () => {
        live = false;
      };
    }, []),
  );
  const levelsOf = (game: EnglishGameId) => data?.games.find((g) => g.id === game)?.levels ?? [];
  return { data, error, levelsOf };
}

/** The level to suggest: the first unlocked one without stars, else the highest unlocked. */
export function suggestedLevel(levels: { level: number; unlocked: boolean; bestStars: number }[]) {
  return (levels.find((l) => l.unlocked && !l.bestStars) ?? [...levels].reverse().find((l) => l.unlocked))?.level ?? 1;
}
