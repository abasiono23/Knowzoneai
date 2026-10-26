import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { EMPTY_PROFILE, type Personalization } from './personalization';
import { storage } from './storage';

const KEY = 'knowzone.personalization';

type Store = {
  profile: Personalization;
  ready: boolean;
  update: (patch: Partial<Personalization>) => void;
  reset: () => void;
};

const Ctx = createContext<Store | null>(null);

/** Holds the personalization draft and saves it on the device so students can resume. */
export function PersonalizationProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Personalization>(EMPTY_PROFILE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    storage.get(KEY).then((raw) => {
      if (raw) {
        try {
          setProfile({ ...EMPTY_PROFILE, ...JSON.parse(raw) });
        } catch {
          // Corrupt draft: start fresh.
        }
      }
      setReady(true);
    });
  }, []);

  const update = useCallback((patch: Partial<Personalization>) => {
    setProfile((p) => {
      const next = { ...p, ...patch };
      storage.set(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    storage.remove(KEY);
    setProfile(EMPTY_PROFILE);
  }, []);

  return <Ctx.Provider value={{ profile, ready, update, reset }}>{children}</Ctx.Provider>;
}

export function usePersonalization() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePersonalization must be used inside PersonalizationProvider');
  return ctx;
}
