import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState } from 'react';

import { errorText } from '@/i18n/errors';
import {
  api,
  type ChemGameId,
  type GameAnswer,
  type GameOutcome,
  type GameSummary,
  type HistoryGameId,
  type HistoryRun,
  type LabRun,
  type SpaceGameId,
  type SpaceRun,
  type TechGameId,
  type TechRun,
  type BusinessGameId,
  type BusinessRun,
} from '@/lib/api';
import { useSession } from '@/lib/session';
import { useWorld } from '@/lib/world/store';

/**
 * One lab game at a time, chosen while walking around (the chemistry lab, the Space Academy):
 * start, answer, ask Kora, finish and quit. Every answer is checked on the server.
 */
export function useLabRun<R extends LabRun | SpaceRun | HistoryRun | TechRun | BusinessRun = LabRun>() {
  const { setUser } = useSession();
  const { settings } = useWorld();
  const [run, setRun] = useState<R | null>(null);
  const [summary, setSummary] = useState<GameSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const runRef = useRef<R | null>(null);
  const keep = useCallback((r: R | null) => {
    runRef.current = r;
    setRun(r);
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

  const start = useCallback(
    async (
      game: R extends SpaceRun
        ? SpaceGameId
        : R extends HistoryRun
          ? HistoryGameId
          : R extends TechRun
            ? TechGameId
            : R extends BusinessRun
              ? BusinessGameId
              : ChemGameId,
      level: number,
    ) => {
      setBusy(true);
      setError(null);
      setSummary(null);
      try {
        keep((await api.startGame(game, level)).run as R);
        return true;
      } catch (e) {
        setError(errorText(e));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [keep],
  );

  const answer = useCallback(
    async (a: GameAnswer): Promise<{ outcome: GameOutcome; done: boolean } | null> => {
      const current = runRef.current;
      if (!current) return null;
      setBusy(true);
      try {
        const res = await api.answerGame(current.id, a);
        keep(res.run as R);
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

  const ask = useCallback(
    async (question: string) => {
      const current = runRef.current;
      if (!current) return null;
      try {
        const res = await api.askKora(current.id, question);
        setUser(res.user);
        return res.reply;
      } catch (e) {
        setError(errorText(e));
        return null;
      }
    },
    [setUser],
  );

  const finish = useCallback(
    async (secondsLeft?: number) => {
      const current = runRef.current;
      if (!current) return;
      setBusy(true);
      try {
        const res = await api.finishGame(current.id, secondsLeft);
        keep(res.run as R);
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

  /** Leave the current game (no rewards) and go back to walking around. */
  const quit = useCallback(async () => {
    const current = runRef.current;
    if (current?.status === 'playing') await api.quitGame(current.id).catch(() => {});
    keep(null);
    setSummary(null);
  }, [keep]);

  const close = useCallback(() => {
    keep(null);
    setSummary(null);
  }, [keep]);

  return { run, summary, error, setError, busy, start, answer, ask, finish, quit, close, buzz };
}
export type LabGame = ReturnType<typeof useLabRun<LabRun>>;
export type SpaceGame = ReturnType<typeof useLabRun<SpaceRun>>;
export type HistoryGame = ReturnType<typeof useLabRun<HistoryRun>>;
export type TechGame = ReturnType<typeof useLabRun<TechRun>>;
export type BusinessGame = ReturnType<typeof useLabRun<BusinessRun>>;
