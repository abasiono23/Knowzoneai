import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { api } from './api';
import { USE_MOCKS } from './config';
import { demoInbox, fromServer, type AppNotification } from './notifications';
import type { Personalization } from './personalization';
import { useSession } from './session';
import { storage } from './storage';

const KEY = 'knowzone.library';

type LibraryState = {
  saved: string[];
  recent: { id: string; at: number }[];
  progress: Record<string, number>;
  searches: string[];
  /** Mock mode only; in real mode the server keeps read state on each notification. */
  readNotifications: string[];
};

const EMPTY: LibraryState = { saved: [], recent: [], progress: {}, searches: [], readNotifications: [] };

// Demo history so Continue learning / Recently viewed have something to show in mock mode.
const DEMO: LibraryState = {
  saved: ['l4', 'l26'],
  recent: [
    { id: 'l10', at: Date.now() - 3_600_000 },
    { id: 'l2', at: Date.now() - 20 * 3_600_000 },
    { id: 'l7', at: Date.now() - 2 * 86_400_000 },
    { id: 'l14', at: Date.now() - 3 * 86_400_000 },
  ],
  progress: { l10: 0.6, l2: 0.35, l7: 0.8 },
  searches: ['mole concept', 'quadratic'],
  readNotifications: ['n5', 'n6'],
};

type Library = Omit<LibraryState, 'readNotifications'> & {
  personalization: Personalization | null;
  notifications: AppNotification[];
  unreadCount: number;
  isSaved: (id: string) => boolean;
  toggleSave: (id: string) => void;
  markViewed: (id: string) => void;
  setProgress: (id: string, value: number) => void;
  addSearch: (q: string) => void;
  clearSearches: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  refreshNotifications: () => void;
};

const Ctx = createContext<Library | null>(null);

/** Server calls made after an optimistic local change; a failure keeps the local change for this visit. */
const sync = (call: () => Promise<unknown>) => {
  if (!USE_MOCKS) call().catch(() => {});
};

/**
 * Student-side library: saved, recently viewed, progress, searches and the notifications inbox.
 * Changes show at once and are kept on the device; signed-in (real mode) they're also saved to the
 * account, which is loaded on start so the library follows the learner across devices.
 */
export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  // One copy per account, so a shared device never shows someone else's history.
  const key = USE_MOCKS || !user ? KEY : `${KEY}.${user.id}`;
  const [state, setState] = useState<LibraryState>(EMPTY);
  const [personalization, setPersonalization] = useState<Personalization | null>(null);
  const [inbox, setInbox] = useState<AppNotification[]>([]);

  const loadNotifications = useCallback(() => {
    if (USE_MOCKS) return;
    api
      .getNotifications()
      .then((r) => setInbox(r.items.map(fromServer)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    storage.get(key).then((raw) => {
      if (raw) {
        try {
          setState({ ...EMPTY, ...JSON.parse(raw) });
        } catch {
          // Fall through to a fresh library.
        }
      } else if (USE_MOCKS) setState(DEMO);
      if (!USE_MOCKS) {
        api
          .getLibrary()
          .then((server) => {
            const next = { ...EMPTY, ...server };
            setState(next);
            storage.set(key, JSON.stringify(next));
          })
          .catch(() => {});
      }
    });
    loadNotifications();
    api
      .getPersonalization()
      .then((r) => setPersonalization(r.personalization))
      .catch(() => {});
  }, [key, loadNotifications]);

  const mutate = useCallback(
    (fn: (s: LibraryState) => LibraryState) => {
      setState((s) => {
        const next = fn(s);
        storage.set(key, JSON.stringify(next));
        return next;
      });
    },
    [key],
  );

  const notifications = USE_MOCKS ? demoInbox(state.readNotifications) : inbox;
  const { readNotifications: _read, ...library } = state;

  const value: Library = {
    ...library,
    personalization,
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    isSaved: (id) => state.saved.includes(id),
    toggleSave: (id) => {
      const saved = state.saved.includes(id);
      mutate((s) => ({ ...s, saved: saved ? s.saved.filter((x) => x !== id) : [id, ...s.saved] }));
      sync(() => (saved ? api.unsaveLesson(id) : api.saveLesson(id)));
    },
    markViewed: (id) => {
      mutate((s) => ({ ...s, recent: [{ id, at: Date.now() }, ...s.recent.filter((r) => r.id !== id)].slice(0, 30) }));
      sync(() => api.viewLesson(id));
    },
    setProgress: (id, v) => {
      mutate((s) => ({ ...s, progress: { ...s.progress, [id]: Math.max(s.progress[id] ?? 0, v) } }));
      sync(() => api.setLessonProgress(id, v));
    },
    addSearch: (q) => {
      const query = q.trim();
      if (!query) return;
      const lower = query.toLowerCase();
      mutate((s) => ({ ...s, searches: [query, ...s.searches.filter((x) => x.toLowerCase() !== lower)].slice(0, 8) }));
      sync(() => api.addSearch(query));
    },
    clearSearches: () => {
      mutate((s) => ({ ...s, searches: [] }));
      sync(() => api.clearSearches());
    },
    markRead: (id) => {
      if (USE_MOCKS) {
        mutate((s) =>
          s.readNotifications.includes(id) ? s : { ...s, readNotifications: [...s.readNotifications, id] },
        );
        return;
      }
      setInbox((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
      sync(() => api.markNotificationRead(id));
    },
    markAllRead: () => {
      if (USE_MOCKS) {
        mutate((s) => ({ ...s, readNotifications: notifications.map((n) => n.id) }));
        return;
      }
      setInbox((list) => list.map((n) => ({ ...n, read: true })));
      sync(() => api.markAllNotificationsRead());
    },
    refreshNotifications: loadNotifications,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLibrary() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLibrary must be used inside LibraryProvider');
  return ctx;
}
