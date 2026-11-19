import * as Haptics from 'expo-haptics';
import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { errorText } from '@/i18n/errors';
import {
  api,
  type ChemGameId,
  type EnglishGameId,
  type GameAnswer,
  type GameOutcome,
  type GameRunPublic,
  type GameSummary,
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
/**
 * The level ladder (the server's services/games/english.ts has the same): ten levels from Starter (CEFR A1)
 * to Super hard. Levels up to OPEN_LEVELS are open to everyone; later ones open with a star on the level
 * before. Names: t(`games:levels.names.<key>`).
 */
export const MAX_LEVEL = 10;
export const OPEN_LEVELS = 4;
export const LEVEL_KEYS = [
  'starter',
  'beginner',
  'elementary',
  'intermediate',
  'upperIntermediate',
  'advanced',
  'proficient',
  'expert',
  'master',
  'superHard',
] as const;
export type LevelKey = (typeof LEVEL_KEYS)[number];
export const CEFR = ['A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'C2+', 'C2+', 'C2+'] as const;
export const levelKey = (level: number): LevelKey => LEVEL_KEYS[Math.min(MAX_LEVEL, Math.max(1, level)) - 1]!;

/** Kora the owl, used by the lab games (the word games have no mascot). */
export const KORA_IMAGE = require('@/assets/images/world/english/kora.webp');

/** Each game's accent: small marks only (cover, level badge), never a whole screen. */
export const GAME_ACCENT: Record<EnglishGameId, string> = {
  'hidden-letters': '#6A45FF',
  'word-clash': '#C27C0E',
  'word-hunter': '#0F8F7E',
  spellcaster: '#1C7FC0',
  'sentence-master': '#D2436A',
};

/** Whether the timer is off (relaxed mode): the world setting "Question timer", also in the pause menu. */
export function useRelaxed() {
  const { settings, updateSettings } = useWorld();
  return { relaxed: !settings.timer, setRelaxed: (relaxed: boolean) => updateSettings({ timer: !relaxed }) };
}

/**
 * Keys typed on a computer (the web app): letters, Enter, Backspace, Space and the arrows. Ignored while
 * the focus is in a text field, and with Ctrl, Cmd or Alt held. Does nothing on phones.
 */
export function useKeys(onKey: (key: string) => void, enabled = true) {
  const ref = useRef(onKey);
  useEffect(() => {
    ref.current = onKey;
  });
  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled || typeof window === 'undefined') return;
    const listener = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      if (/^[A-Z0-9 ]$/.test(key) || ['Enter', 'Backspace', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape'].includes(key)) {
        // Space and the arrows would scroll the page; Enter would press the focused button too.
        if (key === ' ' || key.startsWith('Arrow') || key === 'Enter') e.preventDefault();
        ref.current(key);
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [enabled]);
}

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
