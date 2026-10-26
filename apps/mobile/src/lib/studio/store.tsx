import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import i18n from '@/i18n';

import { api, ApiError } from '../api';
import { useCreditSpender } from '../billing/credits';
import { USE_MOCKS } from '../config';
import { useSession } from '../session';
import { storage } from '../storage';
import { generate, suggestTitle } from './generator';
import * as remote from './remote';
import { STAGES, type Attempt, type GenerateOptions, type Material, type QuizSettings, type SourceType } from './types';

const KEY = 'knowzone.materials';
const uid = () => Math.random().toString(36).slice(2, 10);
const DAY = 86_400_000;
/** Leitner boxes: days until the next review. */
const BOX_DAYS = [0, 1, 3, 7, 16];
/** How often to check on packs being made (real mode). */
const POLL_MS = 2500;

export type NewMaterial = {
  type: SourceType;
  label: string;
  text?: string;
  topic?: string;
  url?: string;
  fileName?: string;
  size?: number;
  /** The picked file (real mode uploads it). */
  uri?: string;
  mimeType?: string;
  title?: string;
  options: GenerateOptions;
};

export type DrawResult = 'ok' | 'error' | 'no-credits' | 'unavailable';

type Materials = {
  materials: Material[];
  ready: boolean;
  create: (input: NewMaterial) => string;
  retry: (id: string) => void;
  cancel: (id: string) => void;
  update: (
    id: string,
    patch: Partial<Pick<Material, 'title' | 'subject' | 'folder' | 'tags' | 'saved' | 'offline'>>,
  ) => void;
  remove: (id: string) => void;
  recordAttempt: (id: string, attempt: Omit<Attempt, 'id' | 'createdAt'>) => Attempt;
  reviewCard: (id: string, cardId: string, knewIt: boolean) => void;
  /** Draws a diagram of the pack with AI (1 credit). */
  drawDiagram: (id: string) => Promise<DrawResult>;
  /** Diagrams need the server; the offline demo can't draw. */
  canDraw: boolean;
  folders: string[];
};

const Ctx = createContext<Materials | null>(null);

/** What failed for a pack the server never saw (upload refused or interrupted). */
function uploadError(e: unknown): Material['error'] {
  const err = e as ApiError;
  if (err.reason === 'no-credits') return { code: 'no-credits', retryable: false };
  if (err.status === 0 || (err.status ?? 500) >= 500) return { code: 'upload-failed', retryable: true };
  return { code: err.reason ?? 'upload-failed', retryable: false };
}

/**
 * Generated study materials. Real mode: files are uploaded (with progress), the server makes the
 * pack with OpenAI while the app checks in every few seconds, and the library, quiz results and
 * flashcard reviews are saved to the account (this device keeps a copy for offline study).
 * Mock mode: a demo pipeline makes packs on the device.
 */
export function MaterialsProvider({ children }: { children: ReactNode }) {
  const spendCredits = useCreditSpender();
  const { user, setUser } = useSession();
  // One copy per account, so a shared device never shows someone else's packs.
  const key = USE_MOCKS || !user ? KEY : `${KEY}.${user.id}`;
  const [materials, setMaterials] = useState<Material[]>([]);
  const [ready, setReady] = useState(false);
  const ref = useRef<Material[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>[]>>({});
  const failedOnce = useRef(new Set<string>());
  /** Real mode: packs the server hasn't accepted yet, with what's needed to send them again. */
  const pending = useRef(new Map<string, remote.Upload>());
  const lastSync = useRef(0);
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const commit = useCallback(
    (next: Material[]) => {
      ref.current = next;
      setMaterials(next);
      storage.set(key, JSON.stringify(next));
    },
    [key],
  );
  const patch = useCallback(
    (id: string, fn: (m: Material) => Material) =>
      commit(ref.current.map((m) => (m.id === id ? { ...fn(m), updatedAt: Date.now() } : m))),
    [commit],
  );
  const replace = useCallback(
    (server: Material) => commit(ref.current.map((m) => (m.id === server.id ? server : m))),
    [commit],
  );

  // ─── Demo pipeline (mock mode) ─────────────────────────────────────────────

  const clearTimers = (id: string) => {
    (timers.current[id] ?? []).forEach(clearTimeout);
    delete timers.current[id];
  };
  const later = (id: string, ms: number, fn: () => void) => {
    timers.current[id] = [...(timers.current[id] ?? []), setTimeout(fn, ms)];
  };

  const runPipeline = useCallback(
    (id: string) => {
      clearTimers(id);
      const m = ref.current.find((x) => x.id === id);
      if (!m) return;
      const isFile = ['pdf', 'doc', 'image'].includes(m.source.type);
      let t = 0;

      if (isFile && m.status !== 'processing') {
        patch(id, (x) => ({ ...x, status: 'uploading', progress: 0, stage: 0, error: undefined }));
        for (let i = 1; i <= 10; i++) {
          t += 220;
          later(id, t, () => patch(id, (x) => ({ ...x, progress: i / 10 })));
        }
      }
      t += 300;
      later(id, t, () => patch(id, (x) => ({ ...x, status: 'processing', stage: 0, progress: 1, error: undefined })));
      STAGES.forEach((_, i) => {
        t += 900;
        later(id, t, () => patch(id, (x) => ({ ...x, stage: Math.min(i + 1, STAGES.length - 1) })));
      });
      t += 500;
      later(id, t, () => {
        const cur = ref.current.find((x) => x.id === id);
        if (!cur) return;
        const raw = `${cur.source.text ?? ''} ${cur.source.label} ${cur.title}`;
        // Test hook: sources mentioning "simulate fail" fail on the first attempt.
        if (/simulate fail/i.test(raw) && !failedOnce.current.has(id)) {
          failedOnce.current.add(id);
          patch(id, (x) => ({
            ...x,
            status: 'failed',
            error: {
              title: i18n.t('study:errors.timeoutTitle'),
              message: i18n.t('study:errors.timeoutBody'),
              retryable: true,
            },
          }));
          return;
        }
        const { content, subject } = generate(
          {
            type: cur.source.type,
            text: cur.source.text,
            topic: cur.source.label,
            fileName: cur.source.fileName,
            title: cur.title,
          },
          cur.options,
        );
        // One AI credit per study pack, charged only when it's actually ready.
        spendCredits(1, `Study pack: ${cur.title}`);
        patch(id, (x) => ({
          ...x,
          status: 'ready',
          content,
          subject: x.subject === 'General' ? subject : x.subject,
          folder: x.folder || subject,
        }));
        clearTimers(id);
      });
    },
    [patch, spendCredits],
  );

  // ─── Server (real mode) ────────────────────────────────────────────────────

  /** Brings in packs changed on the server since the last sync and drops deleted ones. */
  const syncNow = useCallback(async () => {
    try {
      const r = await remote.sync(lastSync.current || undefined);
      const before = new Map(ref.current.map((m) => [m.id, m]));
      const changed = new Map(r.materials.map((m) => [m.id, m]));
      const local = ref.current.filter((m) => pending.current.has(m.id));
      const next = [...local, ...r.ids.filter((id) => !pending.current.has(id)).map((id) => changed.get(id) ?? before.get(id)).filter((m): m is Material => !!m)];
      lastSync.current = r.serverTime;
      storage.set(`${key}.sync`, String(r.serverTime));
      commit(next);
      // A pack just finished: the credit it used shows in the balance.
      if (r.materials.some((m) => m.status !== 'processing' && before.get(m.id)?.status === 'processing'))
        api.me().then((res) => setUser(res.user)).catch(() => {});
    } catch {
      // Offline: keep the copy on this device.
    }
  }, [commit, key, setUser]);

  const send = useCallback(
    async (id: string) => {
      const input = pending.current.get(id);
      if (!input) return;
      patch(id, (x) => ({ ...x, status: input.file ? 'uploading' : 'processing', progress: 0, stage: 0, error: undefined }));
      try {
        const server = await remote.create(id, input, (p) => patch(id, (x) => ({ ...x, progress: p })));
        pending.current.delete(id);
        // Deleted while uploading: the server copy goes too (its credit is returned).
        if (!ref.current.some((m) => m.id === id)) remote.remove(id).catch(() => {});
        else replace(server);
        api.me().then((res) => setUser(res.user)).catch(() => {});
      } catch (e) {
        patch(id, (x) => ({ ...x, status: 'failed', error: uploadError(e) }));
      }
    },
    [patch, replace, setUser],
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all([storage.get(key), storage.get(`${key}.sync`)]).then(([raw, synced]) => {
      if (cancelled) return;
      let list: Material[] = [];
      try {
        list = raw ? JSON.parse(raw) : [];
      } catch {
        list = [];
      }
      if (!USE_MOCKS) {
        // Uploads cut off by closing the app can't resume (the picked file is gone): show them as failed.
        list = list.map((m) =>
          m.status === 'uploading' ? { ...m, status: 'failed', error: { code: 'upload-failed', retryable: false } } : m,
        );
        lastSync.current = Number(synced) || 0;
      }
      commit(list);
      setReady(true);
      if (USE_MOCKS) {
        // Resume anything interrupted by closing the app.
        list.filter((m) => m.status === 'uploading' || m.status === 'processing').forEach((m) => runPipeline(m.id));
      } else syncNow();
    });
    const all = timers.current;
    return () => {
      cancelled = true;
      Object.values(all).flat().forEach(clearTimeout);
    };
  }, [commit, key, runPipeline, syncNow]);

  // While the server is making a pack, check in every few seconds.
  const processing = !USE_MOCKS && materials.some((m) => m.status === 'processing' && !pending.current.has(m.id));
  useEffect(() => {
    if (!processing) return;
    const timer = setInterval(syncNow, POLL_MS);
    return () => clearInterval(timer);
  }, [processing, syncNow]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const create: Materials['create'] = (input) => {
    const id = uid();
    const now = Date.now();
    const isFile = ['pdf', 'doc', 'image'].includes(input.type);
    const material: Material = {
      id,
      title: suggestTitle({ text: input.text, topic: input.topic, fileName: input.fileName, title: input.title }),
      subject: 'General',
      folder: '',
      tags: [],
      source: {
        type: input.type,
        label: input.topic || input.label,
        text: input.text,
        url: input.url,
        fileName: input.fileName,
        size: input.size,
      },
      options: input.options,
      status: isFile ? 'uploading' : 'processing',
      progress: 0,
      stage: 0,
      attempts: [],
      cards: {},
      saved: false,
      offline: false,
      createdAt: now,
      updatedAt: now,
    };
    commit([material, ...ref.current]);
    if (USE_MOCKS) {
      runPipeline(id);
      return id;
    }
    pending.current.set(id, {
      type: input.type,
      title: input.title,
      text: input.text,
      topic: input.topic,
      url: input.url,
      ...(isFile && input.uri && { file: { uri: input.uri, name: input.fileName ?? 'file', mimeType: input.mimeType } }),
      options: input.options,
    });
    send(id);
    return id;
  };

  const value: Materials = {
    materials,
    ready,
    create,
    retry: (id) => {
      if (USE_MOCKS) {
        patch(id, (x) => ({ ...x, status: 'processing', stage: 0, error: undefined }));
        runPipeline(id);
        return;
      }
      if (pending.current.has(id)) {
        send(id);
        return;
      }
      patch(id, (x) => ({ ...x, status: 'processing', stage: 0, error: undefined }));
      remote
        .retry(id)
        .then((server) => {
          replace(server);
          api.me().then((res) => setUser(res.user)).catch(() => {});
        })
        .catch((e) => patch(id, (x) => ({ ...x, status: 'failed', error: uploadError(e) })));
    },
    cancel: (id) => value.remove(id),
    update: (id, p) => {
      patch(id, (x) => ({ ...x, ...p }));
      if (!USE_MOCKS && !pending.current.has(id)) remote.update(id, p).catch(() => {});
    },
    remove: (id) => {
      clearTimers(id);
      commit(ref.current.filter((m) => m.id !== id));
      if (USE_MOCKS) return;
      // Not on the server yet: when the upload lands, `send` deletes it there.
      if (pending.current.has(id)) pending.current.delete(id);
      else remote.remove(id).then(() => api.me().then((r) => setUser(r.user))).catch(() => {});
    },
    recordAttempt: (id, a) => {
      const attempt: Attempt = { ...a, id: uid(), createdAt: Date.now() };
      patch(id, (x) => ({ ...x, attempts: [attempt, ...x.attempts] }));
      if (!USE_MOCKS) {
        // The server marks it and gives the XP; its copy replaces this one.
        remote
          .recordAttempt(id, { questionIds: a.questionIds, answers: a.answers, seconds: a.seconds, settings: a.settings })
          .then((r) => {
            patch(id, (x) => ({ ...x, attempts: x.attempts.map((y) => (y.id === attempt.id ? r.attempt : y)) }));
            setUser(r.user);
          })
          .catch(() => {});
      }
      return attempt;
    },
    reviewCard: (id, cardId, knewIt) => {
      patch(id, (x) => {
        const prev = x.cards[cardId] ?? { box: 0, dueAt: 0, reviews: 0 };
        const box = knewIt ? Math.min(prev.box + 1, BOX_DAYS.length - 1) : 0;
        return {
          ...x,
          cards: { ...x.cards, [cardId]: { box, reviews: prev.reviews + 1, dueAt: Date.now() + BOX_DAYS[box] * DAY } },
        };
      });
      if (!USE_MOCKS)
        remote
          .reviewCard(id, cardId, knewIt)
          .then(({ card }) => patch(id, (x) => ({ ...x, cards: { ...x.cards, [cardId]: card } })))
          .catch(() => {});
    },
    drawDiagram: async (id) => {
      if (USE_MOCKS) return 'unavailable';
      try {
        const { image, credits } = await remote.drawDiagram(id);
        patch(id, (x) => ({ ...x, image }));
        const u = userRef.current;
        if (u) setUser({ ...u, aiCredits: credits });
        return 'ok';
      } catch (e) {
        return (e as ApiError).reason === 'no-credits' ? 'no-credits' : 'error';
      }
    },
    canDraw: !USE_MOCKS,
    folders: [...new Set(materials.map((m) => m.folder).filter(Boolean))].sort(),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMaterials() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useMaterials must be used inside MaterialsProvider');
  return ctx;
}

export function useMaterial(id?: string) {
  const { materials, ready } = useMaterials();
  return { material: materials.find((m) => m.id === id), ready };
}

export const DEFAULT_QUIZ: QuizSettings = { count: 10, difficulty: 'mixed', types: ['mcq', 'tf'], timed: false };

/** Cards due now (never seen, or past their review date), then the rest. */
export function dueCards(m: Material) {
  const cards = m.content?.flashcards ?? [];
  const now = Date.now();
  const due = cards.filter((c) => (m.cards[c.id]?.dueAt ?? 0) <= now);
  return { due, total: cards.length, mastered: cards.filter((c) => (m.cards[c.id]?.box ?? 0) >= 3).length };
}
