import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform } from 'react-native';

import { api } from '@/lib/api';
import { EMPTY_PROFILE } from '@/lib/personalization';
import { useSession } from '@/lib/session';

import i18n, {
  chosenLanguage,
  currentLanguage,
  isLanguage,
  restoreLanguage,
  setLanguage,
  type LanguageId,
} from './index';
import { isRtl } from './languages';

type Ctx = {
  language: LanguageId;
  /** Switches the whole app and, when signed in, the account's app and learning language. */
  changeLanguage: (lang: LanguageId) => Promise<void>;
};

const LanguageContext = createContext<Ctx | null>(null);

/** Holds the one language setting that drives every screen and the AI's explanations. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const { i18n: instance } = useTranslation();
  const [language, setState] = useState<LanguageId>(currentLanguage());

  // Follow i18next, so every screen re-renders in the new language.
  useEffect(() => {
    const onChange = (lng: string) => isLanguage(lng) && setState(lng);
    instance.on('languageChanged', onChange);
    restoreLanguage().then(setState);
    return () => instance.off('languageChanged', onChange);
  }, [instance]);

  // After sign-in: a language picked on this device (e.g. on the welcome screen) is the latest choice,
  // so it's saved to the account. Otherwise the account's language follows the person to this device.
  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const [{ settings }, chosen] = await Promise.all([api.getSettings(), chosenLanguage()]);
      if (chosen) {
        if (settings.appLanguage !== chosen) await api.saveSettings({ appLanguage: chosen });
      } else if (isLanguage(settings.appLanguage) && settings.appLanguage !== currentLanguage()) {
        await setLanguage(settings.appLanguage);
      }
    })().catch(() => {});
  }, [userId]);

  const changeLanguage = useCallback(
    async (lang: LanguageId) => {
      const needsRestart = await setLanguage(lang);
      if (userId) {
        // Best effort: the choice already applies on this device even if the network is down.
        await api.saveSettings({ appLanguage: lang }).catch(() => {});
        await api
          .getPersonalization()
          .then(({ personalization }) =>
            personalization && personalization.language !== lang
              ? api.savePersonalization({ ...EMPTY_PROFILE, ...personalization, language: lang })
              : undefined,
          )
          .catch(() => {});
      }
      if (needsRestart && Platform.OS !== 'web')
        Alert.alert(i18n.t('common:language.restartTitle'), i18n.t('common:language.restartBody'));
    },
    [userId],
  );

  return <LanguageContext.Provider value={{ language, changeLanguage }}>{children}</LanguageContext.Provider>;
}

/** True when the current language reads right to left (Arabic). Use it to mirror arrows and chevrons. */
export function useIsRtl() {
  return isRtl(useLanguage().language);
}

/** Style that mirrors a directional icon (back/forward arrows, chevrons) in right-to-left languages. */
export function useFlipStyle() {
  return useIsRtl() ? { transform: [{ scaleX: -1 }] } : undefined;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
