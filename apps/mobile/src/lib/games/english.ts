import * as Haptics from 'expo-haptics';
import { router, type Href } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { errorText } from '@/i18n/errors';
import {
  api,
  type ChemGameId,
  type EnglishGameId,
  type GameAnswer,
  type GameOutcome,
  type GameRunPublic,
  type GameSummary,
  type SpellcasterRun,
} from '@/lib/api';
import { useSession } from '@/lib/session';
import { useWorld } from '@/lib/world/store';

/** The five English games, in the order the hub shows them. Names and text: t(`games:english.<id>.*`). */
export const ENGLISH_GAMES: EnglishGameId[] = [
  'hidden-letters',
  'word-clash',
  'word-hunter',
  'spellcaster',
  'sentence-master',
];
export const MAX_LEVEL = 5;

/** Art made with OpenAI (apps/server/scripts/world-art.ts, english-*). */
export const COVERS: Record<EnglishGameId, number> = {
  'hidden-letters': require('@/assets/images/world/english/cover-hidden-letters.webp'),
  'word-clash': require('@/assets/images/world/english/cover-word-clash.webp'),
  'word-hunter': require('@/assets/images/world/english/cover-word-hunter.webp'),
  spellcaster: require('@/assets/images/world/english/cover-spellcaster.webp'),
  'sentence-master': require('@/assets/images/world/english/cover-sentence-master.webp'),
};
export const KORA_IMAGE = require('@/assets/images/world/english/kora.webp');
export const WIZARD_IMAGE = require('@/assets/images/world/english/wizard.webp');
type Monster = SpellcasterRun['monster'];
export const MONSTERS: Monster[] = ['slime', 'crystal', 'ember', 'frost', 'shadow'];
export const MONSTER_IMAGES: Record<Monster, number> = {
  slime: require('@/assets/images/world/english/monster-slime.webp'),
  crystal: require('@/assets/images/world/english/monster-crystal.webp'),
  ember: require('@/assets/images/world/english/monster-ember.webp'),
  frost: require('@/assets/images/world/english/monster-frost.webp'),
  shadow: require('@/assets/images/world/english/monster-shadow.webp'),
};
export const ARENA_IMAGES: Record<Monster, number> = {
  slime: require('@/assets/images/world/english/arena-slime.webp'),
  crystal: require('@/assets/images/world/english/arena-crystal.webp'),
  ember: require('@/assets/images/world/english/arena-ember.webp'),
  frost: require('@/assets/images/world/english/arena-frost.webp'),
  shadow: require('@/assets/images/world/english/arena-shadow.webp'),
};

/** Each game's accent colours (cards, buttons). */
export const GAME_COLORS: Record<EnglishGameId, readonly [string, string]> = {
  'hidden-letters': ['#7C5CFF', '#B04CFF'],
  'word-clash': ['#FF9F43', '#FFC857'],
  'word-hunter': ['#2DD4BF', '#4CC9FF'],
  spellcaster: ['#B04CFF', '#FF5A7A'],
  'sentence-master': ['#FF5A7A', '#B04CFF'],
};

export const gameHref = (game: EnglishGameId): Href => `/world/english/${game}` as Href;
export const playHref = (game: EnglishGameId, level: number): Href =>
  `/world/english/${game}/play?level=${level}` as Href;

/** "0:45" */
export const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.max(0, seconds) % 60).padStart(2, '0')}`;

/**
 * One play of a game, talking to the server: start, answer, hint, finish and quit. Errors are kept
 * as text to show; `stale` answers (a double tap) are ignored and the run resyncs from the server.
 */
export function useGameRun<R extends GameRunPublic>(game: EnglishGameId | ChemGameId, level: number) {
  const { setUser } = useSession();
  const { settings } = useWorld();
  const [run, setRun] = useState<R | null>(null);
  const [summary, setSummary] = useState<GameSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const runRef = useRef<R | null>(null);
  const keep = useCallback((r: GameRunPublic) => {
    runRef.current = r as R;
    setRun(r as R);
  }, []);

  const buzz = useCallback(
    (kind: 'success' | 'error' | 'tap') => {
      if (!settings.haptics) return;
      const done =
        kind === 'tap'
          ? Haptics.selectionAsync()
          : Haptics.notificationAsync(
              kind === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
            );
      done.catch(() => {});
    },
    [settings.haptics],
  );

  const start = useCallback(async () => {
    setBusy(true);
    setError(null);
    setSummary(null);
    try {
      keep((await api.startGame(game, level)).run);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }, [game, level, keep]);

  const answer = useCallback(
    async (a: GameAnswer): Promise<{ outcome: GameOutcome; done: boolean } | null> => {
      const current = runRef.current;
      if (!current) return null;
      setBusy(true);
      try {
        const res = await api.answerGame(current.id, a);
        keep(res.run);
        return { outcome: res.outcome, done: res.done };
      } catch (e) {
        if ((e as { reason?: string }).reason !== 'stale') setError(errorText(e));
        return null;
      } finally {
        setBusy(false);
      }
    },
    [keep],
  );

  const hint = useCallback(
    async (step: number) => {
      const current = runRef.current;
      if (!current) return null;
      try {
        const res = await api.gameHint(current.id, step);
        keep(res.run);
        setUser(res.user);
        return res.hint;
      } catch (e) {
        setError(errorText(e));
        return null;
      }
    },
    [setUser, keep],
  );

  const finish = useCallback(
    async (secondsLeft?: number) => {
      const current = runRef.current;
      if (!current) return;
      setBusy(true);
      try {
        const res = await api.finishGame(current.id, secondsLeft);
        keep(res.run);
        setSummary(res.summary);
        setUser(res.user);
      } catch (e) {
        setError(errorText(e));
      } finally {
        setBusy(false);
      }
    },
    [setUser, keep],
  );

  const quit = useCallback(async () => {
    const current = runRef.current;
    if (current?.status === 'playing') await api.quitGame(current.id).catch(() => {});
    router.back();
  }, []);

  return { run, summary, error, setError, busy, start, answer, hint, finish, quit, buzz };
}
