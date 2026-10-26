import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import i18n from '../../i18n';
import { api, type WorldAvatar, type WorldProfile } from '../api';
import { USE_MOCKS } from '../config';
import { useCourses } from '../courses/store';
import { useSession } from '../session';
import { useRewards } from '../rewards/store';
import { storage } from '../storage';
import { WORLDS } from './content';
import { ALL_LEVELS, DAILY_ID, dayKey, getLevel, levelsOf, rewardFor, starsFor } from './levels';
import { ACHIEVEMENTS, addCounts, weekKey, ZERO, type Counts, type Facts, type Quest } from './progress';
import {
  DEFAULT_SETTINGS,
  type AvatarConfig,
  type GameSettings,
  type Level,
  type Run,
  type ShopItem,
  type World,
  type WorldId,
} from './types';

const KEY = 'knowzone.world';
const uid = () => Math.random().toString(36).slice(2, 10);

type Best = { stars: number; score: number; plays: number; clearedAt?: number };

type Persisted = {
  onboarded: boolean;
  tutorialDone: boolean;
  avatar: AvatarConfig | null;
  owned: string[];
  /** Legacy count from before the shared reward ledger; new freezes come from redemptions. */
  freezes: number;
  freezesUsed: number;
  best: Record<string, Best>;
  runs: Run[];
  mistakes: Record<string, string[]>;
  lifetime: Counts;
  sprintBest: number;
  day: { key: string; counts: Counts };
  week: { key: string; counts: Counts };
  claimed: Record<string, number>;
  achieved: Record<string, number>;
  dailyHistory: Record<string, { stars: number; score: number; frozen?: boolean }>;
  seenWorlds: WorldId[];
  settings: GameSettings;
};

const EMPTY: Persisted = {
  onboarded: false,
  tutorialDone: false,
  avatar: null,
  owned: [],
  freezes: 0,
  freezesUsed: 0,
  best: {},
  runs: [],
  mistakes: {},
  lifetime: ZERO,
  sprintBest: 0,
  day: { key: '', counts: ZERO },
  week: { key: '', counts: ZERO },
  claimed: {},
  achieved: {},
  dailyHistory: {},
  seenWorlds: ['space', 'math'],
  settings: DEFAULT_SETTINGS,
};

/** What a game screen reports when a play ends; the store works out stars and rewards. */
export type RunInput = {
  levelId: string;
  correct: number;
  total: number;
  score: number;
  seconds: number;
  hintsUsed: number;
  mistakes: string[];
  failed?: boolean;
  reveals?: number;
  wrongTries?: number;
  rivalScore?: number;
  wordsSolved?: number;
  /** Friend battles: practice that never changes level progress. */
  practice?: boolean;
};

export type RunResult = Run & { newAchievements: string[]; unlockedWorlds: WorldId[] };

type WorldStore = Persisted & {
  ready: boolean;
  totalStars: number;
  facts: Facts;
  isWorldUnlocked: (w: World) => boolean;
  isLevelUnlocked: (l: Level) => boolean;
  worldStars: (id: WorldId) => number;
  collected: (w: World) => string[];
  questProgress: (q: Quest, weekly: boolean) => { value: number; done: boolean; claimed: boolean };
  dailyDone: boolean;
  dailyStreak: number;
  finishOnboarding: () => void;
  finishTutorial: () => void;
  saveAvatar: (a: AvatarConfig) => void;
  equip: (item: ShopItem | null, slot: ShopItem['slot']) => void;
  buy: (item: ShopItem) => Promise<string | null>;
  recordRun: (input: RunInput) => RunResult;
  claimQuest: (q: Quest, weekly: boolean) => void;
  markWorldSeen: (id: WorldId) => void;
  updateSettings: (patch: Partial<GameSettings>) => void;
  reset: () => void;
  lastRun: (levelId: string, runId?: string) => Run | undefined;
  /** Reloads won items from the server (after a chest gives one). */
  refreshItems: () => void;
};

const Ctx = createContext<WorldStore | null>(null);

const starsTotal = (best: Record<string, Best>) => ALL_LEVELS.reduce((n, l) => n + (best[l.id]?.stars ?? 0), 0);
const starsIn = (best: Record<string, Best>, id: WorldId) =>
  levelsOf(id).reduce((n, l) => n + (best[l.id]?.stars ?? 0), 0);

function streakOf(history: Record<string, unknown>, today = Date.now()) {
  let n = 0;
  for (let d = 0; d < 400; d++) {
    const key = dayKey(today - d * 86400000);
    if (history[key]) n++;
    else if (d > 0) break; // today not done yet doesn't break the streak
  }
  return n;
}

/** A streak freeze quietly covers a missed day, so one busy day doesn't wipe a streak. */
function withFreeze(s: Persisted, available: number): Persisted {
  const yesterday = dayKey(Date.now() - 86400000);
  const before = dayKey(Date.now() - 2 * 86400000);
  if (available <= 0 || s.dailyHistory[yesterday] || !s.dailyHistory[before]) return s;
  return {
    ...s,
    dailyHistory: { ...s.dailyHistory, [yesterday]: { stars: 0, score: 0, frozen: true } },
    freezesUsed: s.freezesUsed + 1,
  };
}

/** Rolls the day/week counters over when the period changes. */
function rolled(s: Persisted): Persisted {
  const dk = dayKey();
  const wk = weekKey();
  if (s.day.key === dk && s.week.key === wk) return s;
  return {
    ...s,
    day: s.day.key === dk ? s.day : { key: dk, counts: ZERO },
    week: s.week.key === wk ? s.week : { key: wk, counts: ZERO },
  };
}

/** Achievement items the server accepts from the app (cosmetic only). */
const ACHIEVEMENT_ITEMS = ACHIEVEMENTS.map((a) => a.grants).filter((g): g is string => !!g);
const toServer = (a: AvatarConfig): WorldAvatar => ({ ...a, name: a.name ?? '' });

export function WorldProvider({ children }: { children: ReactNode }) {
  const { certificates } = useCourses();
  const { grant, redeem, wallet, countOf } = useRewards();
  const { user } = useSession();
  const [state, setState] = useState<Persisted>(EMPTY);
  const [ready, setReady] = useState(false);
  /** The learner's World profile on the server (avatar and items others see), once loaded. */
  const [server, setServer] = useState<WorldProfile | null>(null);
  const ref = useRef<Persisted>(EMPTY);
  const certRef = useRef(0);
  useEffect(() => {
    certRef.current = Object.keys(certificates).length;
  }, [certificates]);

  const commit = useCallback((next: Persisted) => {
    ref.current = next;
    setState(next);
    storage.set(KEY, JSON.stringify(next));
  }, []);

  useEffect(() => {
    storage.get(KEY).then((raw) => {
      let saved = EMPTY;
      try {
        saved = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
        saved.settings = { ...DEFAULT_SETTINGS, ...saved.settings };
      } catch {
        saved = EMPTY;
      }
      ref.current = rolled(saved);
      setState(ref.current);
      setReady(true);
    });
  }, []);

  const factsOf = useCallback((s: Persisted, certificateCount: number): Facts => {
    const totalStars = starsTotal(s.best);
    return {
      ...s.lifetime,
      totalStars,
      perfectLevels: ALL_LEVELS.filter((l) => s.best[l.id]?.stars === 3).length,
      worldsUnlocked: WORLDS.filter((w) => totalStars >= w.unlockStars).length,
      worldsMastered: WORLDS.filter((w) => starsIn(s.best, w.id) === 18).length,
      dailyStreak: streakOf(s.dailyHistory),
      sprintBest: s.sprintBest,
      collectibles: WORLDS.reduce(
        (n, w) => n + w.collectibles.filter((c) => starsIn(s.best, w.id) >= c.atStars).length,
        0,
      ),
      itemsOwned: s.owned.length,
      certificates: certificateCount,
    };
  }, []);

  /** Records newly reached achievements and grants their earned-only cosmetics. */
  const withAchievements = useCallback(
    (s: Persisted): { next: Persisted; fresh: string[] } => {
      const f = factsOf(s, certRef.current);
      const fresh = ACHIEVEMENTS.filter((a) => !s.achieved[a.id] && a.value(f) >= a.target);
      if (!fresh.length) return { next: s, fresh: [] };
      const grants = fresh.map((a) => a.grants).filter((g): g is string => !!g && !s.owned.includes(g));
      return {
        next: {
          ...s,
          achieved: { ...s.achieved, ...Object.fromEntries(fresh.map((a) => [a.id, Date.now()])) },
          owned: [...s.owned, ...grants],
        },
        fresh: fresh.map((a) => a.id),
      };
    },
    [factsOf],
  );

  // The server keeps the avatar (others see it on leagues and friends) and won items. On first sync a
  // phone that already had an avatar sends it up; after that the server's copy wins.
  const userId = user?.id;
  useEffect(() => {
    if (!ready || !userId || USE_MOCKS) return;
    let live = true;
    (async () => {
      try {
        let profile = await api.getWorldProfile();
        const local = ref.current;
        const mine = local.owned.filter((id) => ACHIEVEMENT_ITEMS.includes(id) && !profile.owned.includes(id));
        if (mine.length) profile = await api.reportWorldItems(mine);
        if (profile.avatar) {
          if (live) commit({ ...ref.current, avatar: profile.avatar as AvatarConfig });
        } else if (local.avatar) {
          const owned = new Set([...profile.owned, ...local.owned]);
          // Anything the server doesn't know you own is left off rather than lost.
          const sendable = {
            ...local.avatar,
            hat: local.avatar.hat && owned.has(local.avatar.hat) ? local.avatar.hat : undefined,
            glasses: local.avatar.glasses && owned.has(local.avatar.glasses) ? local.avatar.glasses : undefined,
          };
          profile = await api.saveWorldAvatar(toServer(sendable)).catch(() => profile);
        }
        if (live) setServer(profile);
      } catch {
        // Offline: the phone's copy is used until the next try.
      }
    })();
    return () => {
      live = false;
    };
  }, [ready, userId, commit]);

  /** Sends the avatar to the server (best effort; the phone keeps it either way). */
  const pushAvatar = useCallback(
    (a: AvatarConfig) => {
      if (!userId || USE_MOCKS) return;
      api
        .saveWorldAvatar(toServer(a))
        .then(setServer)
        .catch(() => {});
    },
    [userId],
  );

  // Certificates come from courses: re-check achievements when one is earned.
  useEffect(() => {
    if (!ready) return;
    const { next, fresh } = withAchievements(ref.current);
    if (fresh.length) commit(next);
  }, [ready, certificates, withAchievements, commit]);

  // Freezes: legacy count + ones redeemed from the reward catalogue, minus ones already used.
  const freezesBought = countOf('boost-freeze');
  useEffect(() => {
    if (!ready || !wallet) return;
    const cur = ref.current;
    const next = withFreeze(cur, cur.freezes + freezesBought - cur.freezesUsed);
    if (next !== cur) commit(next);
  }, [ready, wallet, freezesBought, commit]);
  const redeemedAvatar = (wallet?.redemptions ?? []).map((r) => r.rewardId).filter((id) => !id.startsWith('boost'));

  const totalStars = starsTotal(state.best);
  const facts = factsOf(state, Object.keys(certificates).length);
  const s = rolled(state);

  const value: WorldStore = {
    ...state,
    owned: [...new Set([...state.owned, ...redeemedAvatar, ...(server?.owned ?? [])])],
    freezes: Math.max(0, state.freezes + freezesBought - state.freezesUsed),
    ready,
    totalStars,
    facts,
    isWorldUnlocked: (w) => totalStars >= w.unlockStars,
    isLevelUnlocked: (l) => l.number === 1 || (state.best[`${l.worldId}-${l.number - 1}`]?.stars ?? 0) > 0,
    worldStars: (id) => starsIn(state.best, id),
    collected: (w) => w.collectibles.filter((c) => starsIn(state.best, w.id) >= c.atStars).map((c) => c.id),
    questProgress: (q, weekly) => {
      const period = weekly ? s.week : s.day;
      const v = Math.min(q.target, period.counts[q.key]);
      return { value: v, done: v >= q.target, claimed: !!state.claimed[`${period.key}:${q.id}`] };
    },
    dailyDone: !!state.dailyHistory[dayKey()],
    dailyStreak: streakOf(state.dailyHistory),
    finishOnboarding: () => commit({ ...ref.current, onboarded: true }),
    finishTutorial: () => commit({ ...ref.current, tutorialDone: true }),
    saveAvatar: (a) => {
      commit({ ...ref.current, avatar: a });
      pushAvatar(a);
    },
    equip: (item, slot) => {
      const a = ref.current.avatar;
      if (!a) return;
      const next = { ...a };
      if (slot === 'hat') next.hat = item?.id;
      else if (slot === 'glasses') next.glasses = item?.id;
      else if (slot === 'outfit') next.outfit = item?.id ?? '#7C5CFF';
      else if (slot === 'background') next.background = item?.id ?? 'violet';
      commit({ ...ref.current, avatar: next });
      pushAvatar(next);
    },
    buy: async (item) => {
      if (item.earnedBy) return i18n.t('world:shop.earnBy', { how: item.earnedBy });
      const result = await redeem(item.id);
      if (!result.ok) return result.message;
      const { next, fresh } = withAchievements(ref.current);
      if (fresh.length) commit(next);
      return null;
    },
    recordRun: (input) => {
      const level = getLevel(input.levelId)!;
      let cur = rolled(ref.current);
      const prev = cur.best[level.id];
      const stars = starsFor(level.kind, {
        correct: input.correct,
        total: input.total,
        failed: input.failed,
        reveals: input.reveals,
        mistakes: input.wrongTries,
        rival: input.rivalScore,
      });
      const isDaily = level.id === DAILY_ID;
      const practice = !!input.practice;
      const alreadyDaily = isDaily && !!cur.dailyHistory[dayKey()];
      const reward = practice
        ? { xp: stars > 0 ? 10 : 5, coins: 0 }
        : alreadyDaily
          ? { xp: 0, coins: 0 }
          : rewardFor(level, stars, prev?.stars ?? 0);
      const starsGained = isDaily || practice ? 0 : Math.max(0, stars - (prev?.stars ?? 0));
      const run: Run = {
        id: uid(),
        levelId: level.id,
        at: Date.now(),
        stars,
        score: input.score,
        correct: input.correct,
        total: input.total,
        seconds: input.seconds,
        hintsUsed: input.hintsUsed,
        mistakes: input.mistakes,
        xp: reward.xp,
        coins: reward.coins,
        firstClear: !isDaily && !practice && stars > 0 && !prev?.clearedAt,
        rivalScore: input.rivalScore,
      };
      const delta: Partial<Counts> = {
        levels: stars > 0 && !practice ? 1 : 0,
        correct: input.correct,
        stars: starsGained,
        battlesWon: level.kind === 'battle' && stars > 0 && input.correct > (input.rivalScore ?? 0) ? 1 : 0,
        bosses: level.kind === 'boss' && !practice && stars > 0 && !(prev?.stars ?? 0) ? 1 : 0,
        words: input.wordsSolved ?? 0,
        daily: isDaily && !alreadyDaily && stars > 0 ? 1 : 0,
        xp: reward.xp,
      };
      const starsBefore = starsTotal(cur.best);
      cur = {
        ...cur,
        best:
          isDaily || practice
            ? cur.best
            : {
                ...cur.best,
                [level.id]: {
                  stars: Math.max(stars, prev?.stars ?? 0),
                  score: Math.max(input.score, prev?.score ?? 0),
                  plays: (prev?.plays ?? 0) + 1,
                  clearedAt: prev?.clearedAt ?? (stars > 0 ? Date.now() : undefined),
                },
              },
        runs: [run, ...cur.runs].slice(0, 60),
        mistakes: { ...cur.mistakes, [level.id]: input.mistakes },
        lifetime: addCounts(cur.lifetime, delta),
        sprintBest: level.kind === 'sprint' ? Math.max(cur.sprintBest, input.correct) : cur.sprintBest,
        day: { ...cur.day, counts: addCounts(cur.day.counts, delta) },
        week: { ...cur.week, counts: addCounts(cur.week.counts, delta) },
        dailyHistory:
          isDaily && stars > 0 && !alreadyDaily
            ? { ...cur.dailyHistory, [dayKey()]: { stars, score: input.score } }
            : cur.dailyHistory,
      };
      const starsAfter = starsTotal(cur.best);
      const unlockedWorlds = WORLDS.filter((w) => w.unlockStars > starsBefore && w.unlockStars <= starsAfter).map(
        (w) => w.id,
      );
      const { next, fresh } = withAchievements(cur);
      commit(next);
      grant(reward.xp, reward.coins, `game:${level.id}`);
      return { ...run, newAchievements: fresh, unlockedWorlds };
    },
    claimQuest: (q, weekly) => {
      const cur = rolled(ref.current);
      const period = weekly ? cur.week : cur.day;
      const key = `${period.key}:${q.id}`;
      if (cur.claimed[key] || period.counts[q.key] < q.target) return;
      commit({ ...cur, claimed: { ...cur.claimed, [key]: Date.now() } });
      grant(q.xp, q.coins, `quest:${q.id}`);
    },
    markWorldSeen: (id) => {
      if (ref.current.seenWorlds.includes(id)) return;
      commit({ ...ref.current, seenWorlds: [...ref.current.seenWorlds, id] });
    },
    updateSettings: (patch) => {
      commit({ ...ref.current, settings: { ...ref.current.settings, ...patch } });
      // Leaderboard choices are kept on the server, where leagues are worked out.
      const world = {
        ...('leaderboard' in patch && { onLeaderboards: !!patch.leaderboard }),
        ...('anonymous' in patch && { anonymous: !!patch.anonymous }),
      };
      if (Object.keys(world).length && userId && !USE_MOCKS)
        api
          .setWorldSettings(world)
          .then(setServer)
          .catch(() => {});
    },
    reset: () =>
      commit({
        ...EMPTY,
        onboarded: true,
        tutorialDone: true,
        avatar: ref.current.avatar,
        owned: ref.current.owned,
        settings: ref.current.settings,
      }),
    refreshItems: () => {
      if (!userId || USE_MOCKS) return;
      api
        .getWorldProfile()
        .then(setServer)
        .catch(() => {});
    },
    lastRun: (levelId, runId) => state.runs.find((r) => r.levelId === levelId && (!runId || r.id === runId)),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorld() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useWorld must be used inside WorldProvider');
  return ctx;
}
