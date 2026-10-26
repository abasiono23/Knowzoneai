import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import type { LanguageId } from '@/i18n';
import { useLanguage } from '@/i18n/provider';

import { api, type ServerCatalog } from './api';
import { applyCatalog, bundledCatalog } from './catalog';
import { USE_MOCKS } from './config';
import { storage } from './storage';

const cacheKey = (lang: LanguageId) => `knowzone.catalog.${lang}`;

/** Changes whenever the catalogue's contents change, so screens can redraw with the new text. */
const VersionContext = createContext('');

/**
 * Keeps the lesson catalogue in the app's language. On a language change it switches at once to
 * the translation bundled with the app, then to the last copy downloaded from the server, then
 * to a fresh download (skipped when the server says nothing changed). Mock mode stays on the
 * bundled copy.
 */
export function CatalogProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const [shown, setShown] = useState(() => {
    // Before the first render, so no screen ever shows the wrong language.
    applyCatalog(bundledCatalog(language));
    return { language, version: 'bundled' };
  });
  // Language changed: switch to the bundled translation in this same render.
  if (shown.language !== language) {
    applyCatalog(bundledCatalog(language));
    setShown({ language, version: 'bundled' });
  }

  useEffect(() => {
    if (USE_MOCKS) return;
    let cancelled = false;
    const show = (c: ServerCatalog) => {
      if (cancelled) return;
      applyCatalog(c);
      setShown({ language, version: c.version });
    };
    (async () => {
      let cached: ServerCatalog | null = null;
      try {
        const raw = await storage.get(cacheKey(language));
        cached = raw ? (JSON.parse(raw) as ServerCatalog) : null;
      } catch {
        // A damaged cache is ignored and replaced below.
      }
      if (cached?.lessons?.length) show(cached);
      try {
        const fresh = await api.getCatalog(language, cached?.version);
        if ('unchanged' in fresh) return;
        show(fresh);
        await storage.set(cacheKey(language), JSON.stringify(fresh));
      } catch {
        // Offline: keep the bundled or cached copy.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [language]);

  return <VersionContext.Provider value={`${shown.language}:${shown.version}`}>{children}</VersionContext.Provider>;
}

export const useCatalogVersion = () => useContext(VersionContext);
