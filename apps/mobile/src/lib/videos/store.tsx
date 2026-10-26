import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { api, ApiError } from '../api';
import { useCreditSpender } from '../billing/credits';
import { getLesson, getSubject, LESSONS } from '../catalog';
import { useCatalogVersion } from '../catalog-provider';
import { USE_MOCKS } from '../config';
import { useSession } from '../session';
import { storage } from '../storage';
import { generate } from '../studio/generator';
import { useMaterials } from '../studio/store';
import { DEFAULT_OPTIONS } from '../studio/types';
import { LENGTHS } from './options';
import * as remote from './remote';
import { scenesFromContent, scenesFromLesson } from './scenes';
import {
  GENERATION_STAGES,
  type GeneratedVideo,
  type GenerationErrorCode,
  type Video,
  type VideoSettings,
  type VideoSource,
} from './types';

const KEY = 'knowzone.videos';
const uid = () => Math.random().toString(36).slice(2, 10);
/** How often to check on videos being made (real mode). */
const POLL_MS = 3000;
/** Watch progress is sent to the server at most this often per video. */
const PROGRESS_EVERY_S = 10;

type Persisted = {
  generated: GeneratedVideo[];
  liked: string[];
  saved: Record<string, string>;
  collections: string[];
  offline: string[];
  progress: Record<string, number>;
  reports: { videoId: string; reason: string; details: string; at: number }[];
};
const EMPTY: Persisted = {
  generated: [],
  liked: [],
  saved: {},
  collections: ['Watch later', 'Exam revision'],
  offline: [],
  progress: {},
  reports: [],
};

export const DEFAULT_VIDEO_SETTINGS: VideoSettings = {
  length: '1m',
  voiceId: 'ada',
  styleId: 'galaxy',
  captions: true,
  captionStyle: 'karaoke',
  language: 'en',
};

/**
 * Knowzone Originals built on the device: one short explainer per catalogue video lesson, in the
 * app's language, read by the device voice. Real mode replaces each with the server's recorded,
 * illustrated version when it has one.
 */
function buildCatalog(): Video[] {
  return LESSONS.filter((l) => l.format === 'video').map((l, i) => ({
    id: `v-${l.id}`,
    title: l.title,
    subject: getSubject(l.subjectId)?.name ?? 'General',
    level: l.level,
    description: l.summary,
    creator: 'Knowzone Originals',
    scenes: scenesFromLesson(l),
    settings: {
      ...DEFAULT_VIDEO_SETTINGS,
      styleId: ['galaxy', 'blueprint', 'chalk', 'sunset', 'paper'][i % 5],
      voiceId: ['ada', 'tunde', 'grace', 'sam'][i % 4],
    },
    origin: 'catalog',
    lessonId: l.id,
    views: l.views,
    likes: Math.round(l.views * 0.08),
    createdAt: Date.now() - (i + 1) * 3 * 86_400_000,
  }));
}

type Videos = Persisted & {
  ready: boolean;
  catalog: Video[];
  find: (id: string) => Video | GeneratedVideo | undefined;
  generateVideo: (input: { title: string; source: VideoSource; settings: VideoSettings }) => string;
  retry: (id: string) => void;
  regenerate: (id: string, settings: VideoSettings) => void;
  /** Instant edits: script text, visual style and captions. Edited lines are re-recorded for free. */
  updateScenes: (id: string, scenes: Video['scenes'], settings?: VideoSettings) => void;
  removeGenerated: (id: string) => void;
  toggleLike: (id: string) => void;
  save: (id: string, collection: string, offline: boolean) => void;
  unsave: (id: string) => void;
  addCollection: (name: string) => void;
  report: (id: string, reason: string, details: string) => void;
  setProgress: (id: string, seconds: number) => void;
};

const Ctx = createContext<Videos | null>(null);

/** Why a video failed before the server took it on. */
function startError(e: unknown): GeneratedVideo['error'] {
  const err = e as ApiError;
  if (err.reason === 'no-credits') return { code: 'no-credits', retryable: false };
  if (err.status === 0 || (err.status ?? 500) >= 500) return { code: 'upload-failed', retryable: true };
  return { code: 'render-timeout', retryable: false };
}

/**
 * Short videos: the Originals feed plus the learner's generated explainers.
 * Real mode: the server writes, illustrates and narrates videos with OpenAI and keeps the library,
 * likes, saves, progress and reports; this device keeps a copy. Mock mode: a demo pipeline builds
 * videos on the device.
 */
export function VideosProvider({ children }: { children: ReactNode }) {
  const { materials } = useMaterials();
  const spendCredits = useCreditSpender();
  const { user, setUser } = useSession();
  // Rebuilt when the language (or the server's catalogue) changes, so titles follow the language.
  const catalogVersion = useCatalogVersion();
  const [serverOriginals, setServerOriginals] = useState<Video[]>([]);
  const catalog = useMemo(() => {
    const local = buildCatalog();
    if (!serverOriginals.length) return local;
    const server = new Map(serverOriginals.map((v) => [v.id, v]));
    return [...local.map((v) => server.get(v.id) ?? v), ...serverOriginals.filter((v) => !local.some((l) => l.id === v.id))];
    // eslint-disable-next-line react-hooks/exhaustive-deps -- catalogVersion: LESSONS changes in place
  }, [catalogVersion, serverOriginals]);
  // One copy per account, so a shared device never shows someone else's videos.
  const key = USE_MOCKS || !user ? KEY : `${KEY}.${user.id}`;
  const [state, setState] = useState<Persisted>(EMPTY);
  const [ready, setReady] = useState(false);
  const ref = useRef<Persisted>(EMPTY);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>[]>>({});
  const failedOnce = useRef(new Set<string>());
  /** Real mode: videos the server hasn't accepted yet, with what's needed to send them again. */
  const pending = useRef(new Map<string, { title: string; source: VideoSource; settings: VideoSettings }>());
  const lastSync = useRef(0);
  const sentProgress = useRef<Record<string, number>>({});
  const materialsRef = useRef(materials);
  useEffect(() => {
    materialsRef.current = materials;
  }, [materials]);

  const commit = useCallback(
    (next: Persisted) => {
      ref.current = next;
      setState(next);
      storage.set(key, JSON.stringify(next));
    },
    [key],
  );
  const patchVideo = useCallback(
    (id: string, fn: (v: GeneratedVideo) => GeneratedVideo) =>
      commit({
        ...ref.current,
        generated: ref.current.generated.map((v) => (v.id === id ? fn(v) : v)),
      }),
    [commit],
  );
  const replaceVideo = useCallback((server: GeneratedVideo) => patchVideo(server.id, () => server), [patchVideo]);
  const refreshUser = useCallback(() => {
    api
      .me()
      .then((r) => setUser(r.user))
      .catch(() => {});
  }, [setUser]);

  // ─── Demo pipeline (mock mode) ─────────────────────────────────────────────

  const build = useCallback(
    (
      v: GeneratedVideo,
    ): Pick<GeneratedVideo, 'scenes' | 'subject' | 'description'> | { error: string; code: GenerationErrorCode } => {
      const src = v.source!;
      if (src.kind === 'lesson') {
        const lesson = getLesson(src.lessonId);
        if (!lesson) return { error: 'That lesson is no longer available.', code: 'lesson-missing' };
        return {
          scenes: scenesFromLesson(lesson),
          subject: getSubject(lesson.subjectId)?.name ?? 'General',
          description: lesson.summary,
        };
      }
      if (src.kind === 'material') {
        const m = materialsRef.current.find((x) => x.id === src.materialId);
        if (!m?.content)
          return {
            error: 'We couldn’t find that study pack. It may have been deleted.',
            code: 'material-missing',
          };
        return {
          scenes: scenesFromContent(v.title, m.content, v.settings.length),
          subject: m.subject,
          description: m.content.summary.tldr,
        };
      }
      const g = generate(
        src.kind === 'topic'
          ? { type: 'topic', topic: src.topic, title: v.title }
          : { type: 'text', text: src.text, title: v.title },
        {
          ...DEFAULT_OPTIONS,
          depth: v.settings.length === '5m' ? 'Deep' : v.settings.length === '30s' ? 'Quick' : 'Standard',
        },
      );
      return {
        scenes: scenesFromContent(v.title, g.content, v.settings.length),
        subject: g.subject,
        description: g.content.summary.tldr,
      };
    },
    [],
  );

  const run = useCallback(
    (id: string) => {
      (timers.current[id] ?? []).forEach(clearTimeout);
      timers.current[id] = [];
      GENERATION_STAGES.forEach((_, i) => {
        timers.current[id].push(
          setTimeout(() => patchVideo(id, (v) => ({ ...v, status: 'generating', stage: i, error: undefined })), i * 1100),
        );
      });
      timers.current[id].push(
        setTimeout(
          () => {
            const v = ref.current.generated.find((x) => x.id === id);
            if (!v) return;
            const label = v.source?.kind === 'topic' ? v.source.topic : v.title;
            // Test hook: titles or topics mentioning "simulate fail" fail on the first attempt.
            if (/simulate fail/i.test(label) && !failedOnce.current.has(id)) {
              failedOnce.current.add(id);
              patchVideo(id, (x) => ({
                ...x,
                status: 'failed',
                error: {
                  title: 'Your video couldn’t be rendered',
                  message: 'Our video service ran out of time while recording the narration. No credits were used.',
                  reasons: ['Our servers were busy', 'Long scripts sometimes time out. Try a shorter length.'],
                  code: 'render-timeout',
                },
              }));
              return;
            }
            const out = build(v);
            if ('error' in out) {
              patchVideo(id, (x) => ({
                ...x,
                status: 'failed',
                error: { title: 'We couldn’t make this video', message: out.error, reasons: ['Try a different source'], code: out.code },
              }));
              return;
            }
            // Credits are charged on success: the length's cost for a new video, 1 for a re-narration.
            spendCredits(v.revision > 1 ? 1 : (LENGTHS.find((l) => l.id === v.settings.length)?.credits ?? 1), `Video: ${v.title}`);
            patchVideo(id, (x) => ({ ...x, ...out, status: 'ready', stage: GENERATION_STAGES.length - 1 }));
          },
          GENERATION_STAGES.length * 1100 + 500,
        ),
      );
    },
    [build, patchVideo, spendCredits],
  );

  // ─── Server (real mode) ────────────────────────────────────────────────────

  /** Brings in generated videos changed on the server and drops deleted ones. */
  const syncMine = useCallback(async () => {
    try {
      const r = await remote.syncMine(lastSync.current || undefined);
      const before = new Map(ref.current.generated.map((v) => [v.id, v]));
      const changed = new Map(r.videos.map((v) => [v.id, v]));
      const local = ref.current.generated.filter((v) => pending.current.has(v.id));
      lastSync.current = r.serverTime;
      storage.set(`${key}.sync`, String(r.serverTime));
      commit({
        ...ref.current,
        generated: [
          ...local,
          ...r.ids
            .filter((id) => !pending.current.has(id))
            .map((id) => changed.get(id) ?? before.get(id))
            .filter((v): v is GeneratedVideo => !!v),
        ],
      });
      // A video just finished: the credits it used show in the balance.
      if (r.videos.some((v) => v.status !== 'generating' && before.get(v.id)?.status === 'generating')) refreshUser();
    } catch {
      // Offline: keep the copy on this device.
    }
  }, [commit, key, refreshUser]);

  const send = useCallback(
    async (id: string) => {
      const input = pending.current.get(id);
      if (!input) return;
      patchVideo(id, (v) => ({ ...v, status: 'generating', stage: 0, error: undefined }));
      try {
        const server = await remote.create(id, input);
        pending.current.delete(id);
        if (!ref.current.generated.some((v) => v.id === id)) remote.remove(id).catch(() => {});
        else replaceVideo(server);
        refreshUser();
      } catch (e) {
        patchVideo(id, (v) => ({ ...v, status: 'failed', error: startError(e) }));
      }
    },
    [patchVideo, replaceVideo, refreshUser],
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all([storage.get(key), storage.get(`${key}.sync`)]).then(([raw, synced]) => {
      if (cancelled) return;
      let saved = EMPTY;
      try {
        saved = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
      } catch {
        saved = EMPTY;
      }
      commit(saved);
      setReady(true);
      if (USE_MOCKS) {
        saved.generated.filter((v) => v.status === 'generating').forEach((v) => run(v.id));
        return;
      }
      lastSync.current = Number(synced) || 0;
      syncMine();
      remote
        .state()
        .then((s) => !cancelled && commit({ ...ref.current, ...s }))
        .catch(() => {});
    });
    const all = timers.current;
    return () => {
      cancelled = true;
      Object.values(all).flat().forEach(clearTimeout);
    };
  }, [commit, key, run, syncMine]);

  // The server's recorded Originals, in the app's language.
  useEffect(() => {
    if (USE_MOCKS) return;
    let live = true;
    remote
      .originals()
      .then((list) => live && setServerOriginals(list))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [catalogVersion]);

  // While the server is making a video, check in every few seconds.
  const generating = !USE_MOCKS && state.generated.some((v) => v.status === 'generating' && !pending.current.has(v.id));
  useEffect(() => {
    if (!generating) return;
    const timer = setInterval(syncMine, POLL_MS);
    return () => clearInterval(timer);
  }, [generating, syncMine]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const sync = (call: () => Promise<unknown>) => {
    if (!USE_MOCKS) call().catch(() => {});
  };

  const value: Videos = {
    ...state,
    ready,
    catalog,
    find: (id) => catalog.find((v) => v.id === id) ?? state.generated.find((v) => v.id === id),
    generateVideo: ({ title, source, settings }) => {
      const id = uid();
      const video: GeneratedVideo = {
        id,
        title,
        subject: 'General',
        level: 'Your level',
        description: '',
        creator: 'You',
        scenes: [],
        settings,
        origin: 'generated',
        source,
        views: 0,
        likes: 0,
        createdAt: Date.now(),
        status: 'generating',
        stage: 0,
        revision: 1,
      };
      commit({ ...ref.current, generated: [video, ...ref.current.generated] });
      if (USE_MOCKS) run(id);
      else {
        pending.current.set(id, { title, source, settings });
        send(id);
      }
      return id;
    },
    retry: (id) => {
      patchVideo(id, (v) => ({ ...v, status: 'generating', stage: 0, error: undefined }));
      if (USE_MOCKS) return run(id);
      if (pending.current.has(id)) return void send(id);
      remote
        .retry(id)
        .then((v) => {
          replaceVideo(v);
          refreshUser();
        })
        .catch((e) => patchVideo(id, (v) => ({ ...v, status: 'failed', error: startError(e) })));
    },
    regenerate: (id, settings) => {
      patchVideo(id, (v) => ({ ...v, settings, status: 'generating', stage: 0, error: undefined, revision: v.revision + 1 }));
      if (USE_MOCKS) return run(id);
      remote
        .regenerate(id, settings)
        .then((v) => {
          replaceVideo(v);
          refreshUser();
        })
        .catch((e) => patchVideo(id, (v) => ({ ...v, status: 'failed', error: startError(e) })));
    },
    updateScenes: (id, scenes, settings) => {
      const prev = ref.current.generated.find((v) => v.id === id);
      patchVideo(id, (v) => ({
        ...v,
        settings: settings ?? v.settings,
        scenes: scenes.map((s, i) => {
          const edited = s.caption !== prev?.scenes[i]?.caption;
          return {
            ...s,
            // An edited line is read by the device voice until its new recording arrives.
            ...(edited && { audio: undefined, seconds: Math.max(4, Math.round(s.caption.split(/\s+/).length / 2.4)) }),
          };
        }),
        revision: v.revision + 1,
      }));
      if (!USE_MOCKS)
        remote
          .edit(id, scenes, settings ?? prev!.settings)
          .then(replaceVideo)
          .catch(() => {});
    },
    removeGenerated: (id) => {
      (timers.current[id] ?? []).forEach(clearTimeout);
      commit({ ...ref.current, generated: ref.current.generated.filter((v) => v.id !== id) });
      if (USE_MOCKS) return;
      if (pending.current.has(id)) pending.current.delete(id);
      else
        remote
          .remove(id)
          .then(refreshUser)
          .catch(() => {});
    },
    toggleLike: (id) => {
      const liked = !ref.current.liked.includes(id);
      commit({ ...ref.current, liked: liked ? [...ref.current.liked, id] : ref.current.liked.filter((x) => x !== id) });
      sync(() => remote.like(id, liked));
    },
    save: (id, collection, offline) => {
      commit({
        ...ref.current,
        saved: { ...ref.current.saved, [id]: collection },
        collections: ref.current.collections.includes(collection)
          ? ref.current.collections
          : [...ref.current.collections, collection],
        offline: offline ? [...new Set([...ref.current.offline, id])] : ref.current.offline.filter((x) => x !== id),
      });
      sync(() => remote.save(id, collection, offline));
    },
    unsave: (id) => {
      const { [id]: _drop, ...rest } = ref.current.saved;
      commit({ ...ref.current, saved: rest, offline: ref.current.offline.filter((x) => x !== id) });
      sync(() => remote.unsave(id));
    },
    addCollection: (name) => {
      commit({ ...ref.current, collections: [...new Set([...ref.current.collections, name])] });
      sync(() => remote.addCollection(name));
    },
    report: (id, reason, details) => {
      commit({ ...ref.current, reports: [...ref.current.reports, { videoId: id, reason, details, at: Date.now() }] });
      sync(() => remote.report(id, reason, details));
    },
    setProgress: (id, seconds) => {
      if (ref.current.progress[id] === seconds) return;
      ref.current = { ...ref.current, progress: { ...ref.current.progress, [id]: seconds } };
      setState(ref.current);
      // Resume points are saved on the device right away and on the server every few seconds.
      if (Math.abs(seconds - (sentProgress.current[id] ?? -PROGRESS_EVERY_S)) >= PROGRESS_EVERY_S || seconds === 0) {
        sentProgress.current[id] = seconds;
        storage.set(key, JSON.stringify(ref.current));
        sync(() => remote.progress(id, seconds));
      }
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVideos() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useVideos must be used inside VideosProvider');
  return ctx;
}

export function relatedTo(v: Video, all: Video[], limit = 6) {
  return all
    .filter((x) => x.id !== v.id)
    .map((x) => ({
      x,
      score: (x.subject === v.subject ? 3 : 0) + (x.level === v.level ? 1 : 0) + x.views / 100_000,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((o) => o.x);
}
