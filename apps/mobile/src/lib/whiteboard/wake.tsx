import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Colors, Radius, Spacing, TabBarHeight } from '@/constants/theme';
import { useLanguage } from '@/i18n/provider';
import { useDesktop } from '@/lib/use-desktop';

import { afterWake, canListen, isOpenBoard, listen } from './voice';

/**
 * "Hey Kora" on every page of the web version. A student switches it on (the browser asks for the
 * microphone that first time), and from then on saying "Hey Kora" anywhere opens the whiteboard, and
 * "Hey Kora, …" asks the question too. It stays on while the student moves between pages, and is never
 * saved: leaving the website (or reloading it) switches it off, so every visit starts with it off.
 * It pauses while the tab is hidden, and on the whiteboard, which listens for itself.
 */
type Wake = {
  /** Listening can work here (a browser that supports it, for a signed-in student). */
  available: boolean;
  on: boolean;
  /** What the browser is hearing, so students can see whether "Kora" came through. */
  heard: string;
  /** blocked, noMic, network or language. */
  problem: string | null;
  setOn: (on: boolean) => void;
};

const WakeContext = createContext<Wake>({ available: false, on: false, heard: '', problem: null, setOn: () => {} });
export const useWake = () => useContext(WakeContext);

/** The message key for a listening problem. */
export const problemKey = (problem: string) =>
  problem === 'blocked'
    ? 'board.blocked'
    : problem === 'noMic'
      ? 'board.noMic'
      : problem === 'language'
        ? 'board.language'
        : 'board.network';

export function WakeProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const available = enabled && canListen();
  const [on, setOnState] = useState(false);
  const [heard, setHeard] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const path = usePathname();
  const { language } = useLanguage();
  const onBoard = path === '/tutor/board';

  const setOn = (next: boolean) => {
    setProblem(null);
    setHeard('');
    setOnState(next);
  };

  // Paused while the tab is in the background, to save data and battery.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const update = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    if (!on || !available || !visible || onBoard) return;
    const l = listen(language, {
      onPartial: (text) => {
        if (text) setHeard(text);
      },
      onFinal: (text) => {
        setHeard(text);
        const rest = afterWake(text);
        if (rest === null) return;
        setHeard('');
        // With a question the board asks it; with just "Hey Kora" it opens listening for one.
        router.push({ pathname: '/tutor/board', params: rest && !isOpenBoard(rest) ? { q: rest } : { listen: '1' } });
      },
      onError: (code) => {
        setProblem(code);
        if (code !== 'network') setOnState(false);
      },
    });
    return () => l?.stop();
  }, [on, available, visible, onBoard, language]);

  const value: Wake = { available, on: on && available, heard, problem, setOn };
  return (
    <WakeContext.Provider value={value}>
      {children}
      <ListeningPill />
    </WakeContext.Provider>
  );
}

/**
 * Where there's no sidebar (a phone or a narrow window), a small pill shows on every page while
 * Kora is listening, with a button to stop.
 */
function ListeningPill() {
  const { t } = useTranslation('tutor');
  const { on, heard, setOn } = useWake();
  const desktop = useDesktop();
  const path = usePathname();
  if (!on || desktop || path === '/tutor/board') return null;
  return (
    <View style={styles.pill} pointerEvents="box-none">
      <View style={styles.pillInner}>
        <Ionicons name="mic" size={16} color={Colors.danger} />
        <Text variant="small" numberOfLines={1} style={{ flexShrink: 1 }}>
          {heard ? t('board.heard', { text: heard }) : t('board.wakeOn')}
        </Text>
        <Pressable
          onPress={() => setOn(false)}
          accessibilityRole="button"
          accessibilityLabel={t('board.stop')}
          hitSlop={8}>
          <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Just above the tab bar, clear of page headings.
  pill: { position: 'absolute', bottom: TabBarHeight + Spacing.sm, left: 0, right: 0, alignItems: 'center' },
  pillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '92%',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.danger + '55',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
});
