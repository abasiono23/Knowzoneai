import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import i18n from '@/i18n';
import { errorText } from '@/i18n/errors';

import { api, type Redemption, type Wallet } from '../api';
import { USE_MOCKS } from '../config';
import { useSession } from '../session';
import { storage } from '../storage';
import { applyRules, getReward } from './catalog';

const KEY = 'knowzone.rewards';
const XP_PER_LEVEL = 250;

type Equipped = { frame: string | null; title: string | null };

export type RedeemResult = { ok: true; redemption: Redemption } | { ok: false; status: number; message: string };

type Rewards = {
  wallet: Wallet | null;
  loading: boolean;
  error: string | null;
  equipped: Equipped;
  refresh: () => Promise<void>;
  /** Earn (or spend, with negative coins) and record it in the ledger. */
  grant: (xp: number, coins: number, reason: string) => void;
  redeem: (rewardId: string) => Promise<RedeemResult>;
  claimDaily: () => Promise<{ coins: number; xp: number; day: number } | string>;
  owns: (rewardId: string) => boolean;
  countOf: (rewardId: string) => number;
  equip: (slot: keyof Equipped, rewardId: string | null) => void;
};

const Ctx = createContext<Rewards | null>(null);

export function RewardsProvider({ children }: { children: ReactNode }) {
  const { user, setUser } = useSession();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [equipped, setEquipped] = useState<Equipped>({ frame: null, title: null });
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    storage.get(KEY).then((raw) => {
      try {
        if (raw) setEquipped({ frame: null, title: null, ...JSON.parse(raw) });
      } catch {
        /* keep defaults */
      }
    });
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { wallet: w } = await api.getWallet();
      setWallet(w);
      setError(null);
    } catch (e) {
      setError(errorText(e, i18n.t('rewards:errors.loadWallet')));
    } finally {
      setLoading(false);
    }
  }, []);

  // Real mode: the server's prices and rules for the catalogue.
  const [, setRulesVersion] = useState(0);
  useEffect(() => {
    if (USE_MOCKS) return;
    api
      .getRewardRules()
      .then(({ rules, daily }) => {
        applyRules(rules, daily);
        setRulesVersion((n) => n + 1);
      })
      .catch(() => {});
  }, []);

  // Load the wallet whenever someone signs in; signed-out users simply see no wallet.
  const signedIn = !!user;
  useEffect(() => {
    if (!signedIn) return;
    let live = true;
    api
      .getWallet()
      .then(({ wallet: w }) => live && setWallet(w))
      .catch((e) => live && setError(errorText(e, i18n.t('rewards:errors.loadWallet'))));
    return () => {
      live = false;
    };
  }, [signedIn]);

  const grant = useCallback(
    (xp: number, coins: number, reason: string) => {
      const u = userRef.current;
      if (!u || (!xp && !coins)) return;
      const nextXp = u.xp + xp;
      setUser({
        ...u,
        xp: nextXp,
        coins: u.coins + coins,
        level: Math.floor(nextXp / XP_PER_LEVEL) + 1,
        levelProgress: (nextXp % XP_PER_LEVEL) / XP_PER_LEVEL,
      });
      api
        .grantRewards({ xp, coins, reason })
        .then(({ user: fresh }) => {
          setUser(fresh);
          refresh();
        })
        .catch(() => setUser(u));
    },
    [setUser, refresh],
  );

  const value: Rewards = {
    wallet: signedIn ? wallet : null,
    loading,
    error,
    equipped,
    refresh,
    grant,
    redeem: async (rewardId) => {
      try {
        const { user: fresh, redemption } = await api.redeem(rewardId);
        setUser(fresh);
        await refresh();
        return { ok: true, redemption };
      } catch (e) {
        const status = (e as { status?: number }).status ?? 0;
        return { ok: false, status, message: errorText(e) };
      }
    },
    claimDaily: async () => {
      try {
        const { user: fresh, reward } = await api.claimDailyReward();
        setUser(fresh);
        await refresh();
        return reward;
      } catch (e) {
        return errorText(e, i18n.t('rewards:errors.claim'));
      }
    },
    owns: (id) => !!wallet?.redemptions.some((r) => r.rewardId === id),
    countOf: (id) => wallet?.redemptions.filter((r) => r.rewardId === id).length ?? 0,
    equip: (slot, rewardId) => {
      if (rewardId && getReward(rewardId)?.kind !== slot) return;
      const next = { ...equipped, [slot]: rewardId };
      setEquipped(next);
      storage.set(KEY, JSON.stringify(next));
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRewards() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useRewards must be used inside RewardsProvider');
  return ctx;
}
