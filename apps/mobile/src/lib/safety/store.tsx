import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { api, type HelpTicket, type ReportableType, type Safety } from '../api';
import { useSession } from '../session';

type ReportInput = Parameters<typeof api.reportContent>[0];

type SafetyCtx = {
  safety: Safety;
  isBlocked: (playerId: string) => boolean;
  isHidden: (type: ReportableType, id: string) => boolean;
  report: (input: ReportInput) => Promise<HelpTicket>;
  block: (id: string, name: string) => Promise<void>;
  unblock: (id: string) => Promise<void>;
  unhide: (type: ReportableType, id: string) => Promise<void>;
};

const EMPTY: Safety = { blockedUsers: [], hidden: [] };
const Ctx = createContext<SafetyCtx | null>(null);

/** Blocked players and hidden content, synced with the server so they follow you across devices. */
export function SafetyProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const [safety, setSafety] = useState<Safety>(EMPTY);
  const userId = user && user.restriction?.kind !== 'suspended' ? user.id : null;

  useEffect(() => {
    if (!userId) return;
    api
      .getSafety()
      .then(({ safety: s }) => setSafety(s))
      .catch(() => {});
  }, [userId]);

  const report = useCallback(async (input: ReportInput) => {
    const { ticket, safety: s } = await api.reportContent(input);
    setSafety(s);
    return ticket;
  }, []);
  const block = useCallback(async (id: string, name: string) => setSafety((await api.blockUser(id, name)).safety), []);
  const unblock = useCallback(async (id: string) => setSafety((await api.unblockUser(id)).safety), []);
  const unhide = useCallback(
    async (type: ReportableType, id: string) => setSafety((await api.unhideContent(type, id)).safety),
    [],
  );

  const value = useMemo<SafetyCtx>(() => {
    const current = userId ? safety : EMPTY;
    const blocked = new Set(current.blockedUsers.map((b) => b.id));
    const hidden = new Set(current.hidden.map((h) => `${h.type}:${h.id}`));
    return {
      safety: current,
      isBlocked: (id) => blocked.has(id),
      isHidden: (type, id) => hidden.has(`${type}:${id}`),
      report,
      block,
      unblock,
      unhide,
    };
  }, [safety, userId, report, block, unblock, unhide]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSafety() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSafety must be used inside SafetyProvider');
  return ctx;
}

/** What a restricted account can't do (codes come from moderation). Labels: t(`accountStatus.limits.${id}`). */
export const LIMIT_IDS = ['leaderboards', 'battles', 'invites', 'sharing'] as const;
export type LimitId = (typeof LIMIT_IDS)[number];
export const isKnownLimit = (code: string): code is LimitId => (LIMIT_IDS as readonly string[]).includes(code);
export const restrictedFrom = (limits: string[] | undefined, what: string) => !!limits?.includes(what);
