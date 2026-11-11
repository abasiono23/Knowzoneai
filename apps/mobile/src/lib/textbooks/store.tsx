import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { ApiError } from '../api';
import { USE_MOCKS } from '../config';
import { useSession } from '../session';
import { storage } from '../storage';
import { demoFind, demoTopics } from './demo';
import * as remote from './remote';
import type { FoundTopic, Textbook } from './types';

const KEY = 'knowzone.textbooks';
/** Same id rules as study packs: the app makes the id and the server keeps it. */
const uid = () => Math.random().toString(36).slice(2, 10);
/** How often to check on books being read (real mode). */
const POLL_MS = 2500;

export type PickedPdf = { uri: string; name: string; size: number; mimeType?: string };

type Textbooks = {
  textbooks: Textbook[];
  ready: boolean;
  /** Starts an upload and returns the new book's id. */
  upload: (file: PickedPdf, title?: string) => string;
  retry: (id: string) => void;
  remove: (id: string) => void;
  /** Where a typed topic is in the book, or null when the book doesn't cover it. */
  find: (id: string, topic: string) => Promise<FoundTopic | null>;
};

const Ctx = createContext<Textbooks | null>(null);

/** What failed for a book the server never accepted (upload refused or interrupted). */
function uploadError(e: unknown): Textbook['error'] {
  const err = e as ApiError;
  if (err.reason === 'no-credits') return { code: 'no-credits', retryable: false };
  if (err.status === 413) return { code: 'file-too-large', retryable: false };
  if (err.status === 0 || (err.status ?? 500) >= 500) return { code: 'upload-failed', retryable: true };
  return { code: err.reason ?? 'upload-failed', retryable: false };
}

/**
 * Textbooks uploaded as PDFs. Real mode: the file is uploaded (with progress), the server reads it
 * and lists its topics while the app checks in every few seconds, and the list of books is kept on
 * the account (this device keeps a copy). Mock mode: a demo reader lists topics on the device.
 */
export function TextbooksProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  // One copy per account, so a shared device never shows someone else's books.
  const key = USE_MOCKS || !user ? KEY : `${KEY}.${user.id}`;
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [ready, setReady] = useState(false);
  const ref = useRef<Textbook[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>[]>>({});
  const failedOnce = useRef(new Set<string>());
  /** Real mode: books the server hasn't accepted yet, with what's needed to send them again. */
  const pending = useRef(new Map<string, { file: remote.UploadFile; title?: string }>());

  const commit = useCallback(
    (next: Textbook[]) => {
      ref.current = next;
      setTextbooks(next);
      storage.set(key, JSON.stringify(next));
    },
    [key],
  );
  const patch = useCallback(
    (id: string, fn: (b: Textbook) => Textbook) => commit(ref.current.map((b) => (b.id === id ? fn(b) : b))),
    [commit],
  );
  const replace = useCallback(
    (server: Textbook) => commit(ref.current.map((b) => (b.id === server.id ? server : b))),
    [commit],
  );

  // ─── Demo reader (mock mode) ───────────────────────────────────────────────

  const clearTimers = (id: string) => {
    (timers.current[id] ?? []).forEach(clearTimeout);
    delete timers.current[id];
  };
  const later = (id: string, ms: number, fn: () => void) => {
    timers.current[id] = [...(timers.current[id] ?? []), setTimeout(fn, ms)];
  };

  const runDemo = useCallback(
    (id: string) => {
      clearTimers(id);
      const b = ref.current.find((x) => x.id === id);
      if (!b) return;
      let t = 0;
      if (b.status === 'uploading') {
        for (let i = 1; i <= 10; i++) {
          t += 180;
          later(id, t, () => patch(id, (x) => ({ ...x, progress: i / 10 })));
        }
        t += 200;
        later(id, t, () => patch(id, (x) => ({ ...x, status: 'reading', progress: 1, error: undefined })));
      }
      t += 3500;
      later(id, t, () => {
        const cur = ref.current.find((x) => x.id === id);
        if (!cur) return;
        // Test hooks: "simulate fail" fails once (retryable); a file named like a scan has no text.
        if (/simulate fail/i.test(cur.fileName) && !failedOnce.current.has(id)) {
          failedOnce.current.add(id);
          patch(id, (x) => ({ ...x, status: 'failed', error: { code: 'ai-failed', retryable: true } }));
          return;
        }
        if (/scan/i.test(cur.fileName)) {
          patch(id, (x) => ({ ...x, status: 'failed', error: { code: 'scanned-book', retryable: false } }));
          return;
        }
        const { topics, pageCount } = demoTopics(cur.fileName);
        patch(id, (x) => ({ ...x, status: 'ready', topics, pageCount, error: undefined }));
        clearTimers(id);
      });
    },
    [patch],
  );

  // ─── Server (real mode) ────────────────────────────────────────────────────

  const send = useCallback(
    async (id: string) => {
      const input = pending.current.get(id);
      if (!input) return;
      patch(id, (x) => ({ ...x, status: 'uploading', progress: 0, error: undefined }));
      try {
        const server = await remote.create(id, input.file, input.title, (p) =>
          patch(id, (x) => ({ ...x, progress: p })),
        );
        pending.current.delete(id);
        // Deleted while uploading: the server copy goes too.
        if (!ref.current.some((b) => b.id === id)) remote.remove(id).catch(() => {});
        else replace(server);
      } catch (e) {
        patch(id, (x) => ({ ...x, status: 'failed', error: uploadError(e) }));
      }
    },
    [patch, replace],
  );

  /** Brings in the account's books, keeping any this device is still uploading. */
  const syncNow = useCallback(async () => {
    try {
      const server = await remote.list();
      const local = ref.current.filter((b) => pending.current.has(b.id));
      commit([...local, ...server.filter((b) => !pending.current.has(b.id))]);
    } catch {
      // Offline: keep the copy on this device.
    }
  }, [commit]);

  useEffect(() => {
    let cancelled = false;
    storage.get(key).then((raw) => {
      if (cancelled) return;
      let list: Textbook[] = [];
      try {
        list = raw ? JSON.parse(raw) : [];
      } catch {
        list = [];
      }
      if (!USE_MOCKS) {
        // Uploads cut off by closing the app can't resume (the picked file is gone): show them as failed.
        list = list.map((b) =>
          b.status === 'uploading' ? { ...b, status: 'failed', error: { code: 'upload-failed', retryable: false } } : b,
        );
      }
      commit(list);
      setReady(true);
      if (USE_MOCKS) list.filter((b) => b.status === 'uploading' || b.status === 'reading').forEach((b) => runDemo(b.id));
      else syncNow();
    });
    const all = timers.current;
    return () => {
      cancelled = true;
      Object.values(all).flat().forEach(clearTimeout);
    };
  }, [commit, key, runDemo, syncNow]);

  // While the server is reading a book, check in on it every few seconds.
  const reading = !USE_MOCKS && textbooks.some((b) => b.status === 'reading');
  useEffect(() => {
    if (!reading) return;
    const check = () =>
      ref.current
        .filter((b) => b.status === 'reading')
        .forEach((b) =>
          remote
            .get(b.id)
            .then((server) => {
              // Deleted meanwhile: don't bring it back.
              if (ref.current.some((x) => x.id === server.id)) replace(server);
            })
            .catch(() => {}),
        );
    const timer = setInterval(check, POLL_MS);
    return () => clearInterval(timer);
  }, [reading, replace]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const value: Textbooks = {
    textbooks,
    ready,
    upload: (file, title) => {
      const id = uid();
      const book: Textbook = {
        id,
        title: title?.trim() || file.name.replace(/\.pdf$/i, ''),
        fileName: file.name,
        pageCount: 0,
        status: 'uploading',
        progress: 0,
        size: file.size,
        topics: [],
        createdAt: Date.now(),
      };
      commit([book, ...ref.current]);
      if (USE_MOCKS) {
        runDemo(id);
        return id;
      }
      pending.current.set(id, { file: { uri: file.uri, name: file.name, mimeType: file.mimeType }, title: title?.trim() });
      send(id);
      return id;
    },
    retry: (id) => {
      if (USE_MOCKS) {
        patch(id, (x) => ({ ...x, status: 'reading', error: undefined }));
        runDemo(id);
        return;
      }
      if (pending.current.has(id)) {
        send(id);
        return;
      }
      patch(id, (x) => ({ ...x, status: 'reading', error: undefined }));
      remote
        .retry(id)
        .then(replace)
        .catch((e) => patch(id, (x) => ({ ...x, status: 'failed', error: uploadError(e) })));
    },
    remove: (id) => {
      clearTimers(id);
      commit(ref.current.filter((b) => b.id !== id));
      if (USE_MOCKS) return;
      // Not on the server yet: when the upload lands, `send` deletes it there.
      if (pending.current.has(id)) pending.current.delete(id);
      else remote.remove(id).catch(() => {});
    },
    find: async (id, topic) => {
      if (!USE_MOCKS) return remote.find(id, topic);
      await new Promise((r) => setTimeout(r, 600));
      return demoFind(ref.current.find((b) => b.id === id)?.topics ?? [], topic);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTextbooks() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTextbooks must be used inside TextbooksProvider');
  return ctx;
}

export function useTextbook(id?: string) {
  const { textbooks, ready } = useTextbooks();
  return { textbook: textbooks.find((b) => b.id === id), ready };
}
