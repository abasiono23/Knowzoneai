import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { api, ApiError, setSuspendedHandler, TOKEN_KEY, type User } from './api';
import { auth, isRecovering } from './auth';
import { USE_MOCKS } from './config';
import { storage } from './storage';
import { supabase } from './supabase';

type Session = {
  user: User | null;
  loading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user } = await api.me();
      setUser(user);
    } catch (e) {
      if (USE_MOCKS) await storage.remove(TOKEN_KEY);
      // A rejected session ends; a network blip leaves the Supabase session to retry later.
      else if ((e as ApiError).status === 401) await auth.signOut();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setSuspendedHandler(() => void refresh());
    return () => setSuspendedHandler(null);
  }, [refresh]);

  useEffect(() => {
    if (USE_MOCKS) {
      (async () => {
        if (await storage.get(TOKEN_KEY)) await refresh();
        setLoading(false);
      })();
      return;
    }
    // Real mode: Supabase owns the session. Load the profile when there is one.
    supabase.auth
      .getSession()
      .then(({ data }) => (data.session && !isRecovering() ? refresh() : undefined))
      .finally(() => setLoading(false));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // A password-reset session stays hidden until the new password is saved.
      if (isRecovering()) return;
      if (!session || event === 'SIGNED_OUT') setUser(null);
      // Don't await Supabase calls inside this callback (it can deadlock the client); defer instead.
      else if (event === 'SIGNED_IN') setTimeout(() => void refresh(), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  /** Mock mode stores the token; with Supabase the session is already held by the Supabase client. */
  const signIn = useCallback(async (token: string, user: User) => {
    if (token) await storage.set(TOKEN_KEY, token);
    setUser(user);
  }, []);

  const signOut = useCallback(async () => {
    // Best effort: a dead connection shouldn't stop someone signing out of this device.
    await api.logout().catch(() => {});
    await storage.remove(TOKEN_KEY);
    await auth.signOut().catch(() => {});
    setUser(null);
  }, []);

  return (
    <SessionContext.Provider value={{ user, loading, signIn, signOut, setUser, refresh }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
