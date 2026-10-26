import { createContext, useContext, useState, type ReactNode } from 'react';

import { DEFAULT_VIDEO_SETTINGS } from './store';
import type { VideoSettings, VideoSource } from './types';

type Draft = {
  title: string;
  source: VideoSource | null;
  settings: VideoSettings;
};
type Ctx = Draft & {
  set: (patch: Partial<Draft>) => void;
  setSettings: (patch: Partial<VideoSettings>) => void;
  reset: () => void;
};

const DraftCtx = createContext<Ctx | null>(null);
const EMPTY: Draft = {
  title: '',
  source: null,
  settings: DEFAULT_VIDEO_SETTINGS,
};

/** Choices made across the "generate a video" steps (99–103). */
export function VideoDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  return (
    <DraftCtx.Provider
      value={{
        ...draft,
        set: (patch) => setDraft((d) => ({ ...d, ...patch })),
        setSettings: (patch) => setDraft((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
        reset: () => setDraft(EMPTY),
      }}>
      {children}
    </DraftCtx.Provider>
  );
}

export function useVideoDraft() {
  const ctx = useContext(DraftCtx);
  if (!ctx) throw new Error('useVideoDraft must be used inside VideoDraftProvider');
  return ctx;
}
