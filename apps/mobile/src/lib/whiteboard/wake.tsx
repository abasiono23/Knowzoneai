import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { KoraBoard } from '@/components/whiteboard/kora-board';
import { Colors, Radius, Spacing, TabBarHeight } from '@/constants/theme';
import { useLanguage } from '@/i18n/provider';
import { useDesktop } from '@/lib/use-desktop';

import { afterWake, canListen, isOpenBoard, listen } from './voice';

/**
 * "Hey Kora" on every page, on the web and in the phone app. A student switches it on (the browser or the
 * phone asks for the microphone that first time), and from then on saying "Hey Kora" anywhere opens the whiteboard, and
 * "Hey Kora, …" asks the question too. The board opens in a panel beside the page (below it on a phone),
 * so the student can still see the past question or lesson they're asking about. It stays on while the
 * student moves between pages, and is never saved: leaving the website (or reloading it, or closing the
 * app) switches it off, so every visit starts with it off. It pauses while the tab is hidden or the app is
 * in the background (the phone locked, another app open), and on the whiteboard, which listens for itself.
 */
type Wake = {
  /** Listening can work here (a browser or phone that supports it, for a signed-in student). */
  available: boolean;
  on: boolean;
  /** What the browser or phone is hearing, so students can see whether "Kora" came through. */
  heard: string;
  /** blocked, noMic, noService, network or language. */
  problem: string | null;
  setOn: (on: boolean) => void;
  /** The board panel, while it's open: a question to ask, or listening for one. */
  panel: Panel | null;
  closePanel: () => void;
};
type Panel = { n: number; question?: string; listen: boolean };

const WakeContext = createContext<Wake>({
  available: false,
  on: false,
  heard: '',
  problem: null,
  setOn: () => {},
  panel: null,
  closePanel: () => {},
});
export const useWake = () => useContext(WakeContext);

/** The message key for a listening problem. */
export { problemKey } from './voice';

export function WakeProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const available = enabled && canListen();
  const [on, setOnState] = useState(false);
  const [heard, setHeard] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const path = usePathname();
  const { language } = useLanguage();
  const [panel, setPanel] = useState<Panel | null>(null);
  // The board listens for itself, so "Hey Kora" here pauses while it's open.
  const onBoard = path === '/tutor/board' || !!panel;

  const setOn = (next: boolean) => {
    setProblem(null);
    setHeard('');
    setOnState(next);
  };

  // Paused while the tab or the app is in the background, to save data and battery (and phones don't
  // allow listening from the background anyway).
  useEffect(() => {
    if (Platform.OS !== 'web') {
      const sub = AppState.addEventListener('change', (state) => setVisible(state === 'active'));
      return () => sub.remove();
    }
    if (typeof document === 'undefined') return;
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
        const question = rest && !isOpenBoard(rest) ? rest : undefined;
        setPanel({ n: Date.now(), question, listen: !question });
      },
      onError: (code) => {
        setProblem(code);
        if (code !== 'network') setOnState(false);
      },
    });
    return () => l?.stop();
  }, [on, available, visible, onBoard, language]);

  // Signing out (or anything that turns this off for the account) closes the board too.
  if (!available && panel) setPanel(null);
  const value: Wake = {
    available,
    on: on && available,
    heard,
    problem,
    setOn,
    panel,
    closePanel: () => setPanel(null),
  };
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
  const { panel } = useWake();
  if (!on || desktop || panel || path === '/tutor/board') return null;
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

/**
 * The board opened by "Hey Kora", placed by the root layout beside the page: a column on the right on a
 * computer, the lower half of the screen on a phone. The page shrinks to make room, so nothing is hidden.
 */
export function KoraPanel() {
  const { panel, closePanel, on } = useWake();
  const desktop = useDesktop();
  const insets = useSafeAreaInsets();
  if (!panel) return null;
  return (
    <View style={desktop ? styles.side : [styles.below, { paddingBottom: insets.bottom }]}>
      <KoraBoard
        key={panel.n}
        question={panel.question}
        listenNow={panel.listen}
        listenFromStart={on}
        onClose={closePanel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  side: { width: 440, borderLeftWidth: 1, borderLeftColor: Colors.border, backgroundColor: Colors.background },
  below: { height: '50%', borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.background },
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
