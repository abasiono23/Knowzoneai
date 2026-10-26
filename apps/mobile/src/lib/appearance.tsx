import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { ReducedMotionConfig, ReduceMotion } from 'react-native-reanimated';

import { storage } from './storage';

const KEY = 'knowzone.appearance';

/** Device-level display preferences (they don't sync between devices on purpose). */
export type Appearance = { textScale: number; reduceMotion: boolean };
const DEFAULTS: Appearance = { textScale: 1, reduceMotion: false };

/** Text sizes; `key` is translated where shown: t(`appearance.textSizes.${key}`, { ns: 'settings' }). */
export const TEXT_SCALES = [
  { value: 0.9, key: 'small' },
  { value: 1, key: 'default' },
  { value: 1.15, key: 'large' },
  { value: 1.3, key: 'extraLarge' },
] as const;

const Ctx = createContext<{ appearance: Appearance; update: (patch: Partial<Appearance>) => void }>({
  appearance: DEFAULTS,
  update: () => {},
});

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance] = useState(DEFAULTS);
  useEffect(() => {
    storage.get(KEY).then((raw) => {
      try {
        if (raw) setAppearance({ ...DEFAULTS, ...JSON.parse(raw) });
      } catch {
        /* keep defaults */
      }
    });
  }, []);
  const update = useCallback((patch: Partial<Appearance>) => {
    setAppearance((a) => {
      const next = { ...a, ...patch };
      storage.set(KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  return (
    <Ctx.Provider value={{ appearance, update }}>
      {appearance.reduceMotion && <ReducedMotionConfig mode={ReduceMotion.Always} />}
      {children}
    </Ctx.Provider>
  );
}

export const useAppearance = () => useContext(Ctx);
export const useTextScale = () => useContext(Ctx).appearance.textScale;
