import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { Platform, View } from 'react-native';

import '@/i18n';

import { AnimatedSplash } from '@/components/brand/animated-splash';
import { DesktopSidebar } from '@/components/navigation/desktop-sidebar';
import { useDesktop } from '@/lib/use-desktop';
import { TutorProvider } from '@/lib/tutor/store';
import { KoraPanel, WakeProvider } from '@/lib/whiteboard/wake';
import { ReminderSync } from '@/components/reminder-sync';
import { Colors } from '@/constants/theme';
import { CatalogProvider, useCatalogVersion } from '@/lib/catalog-provider';
import { SessionProvider, useSession } from '@/lib/session';
import { MaterialsProvider } from '@/lib/studio/store';
import { AppearanceProvider } from '@/lib/appearance';
import { CoursesProvider, useCourses } from '@/lib/courses/store';
import { LanguageProvider, useLanguage } from '@/i18n/provider';
import { RewardsProvider } from '@/lib/rewards/store';
import { SafetyProvider } from '@/lib/safety/store';
import { TextbooksProvider } from '@/lib/textbooks/store';
import { VideosProvider } from '@/lib/videos/store';
import { WorldProvider } from '@/lib/world/store';

SplashScreen.preventAutoHideAsync();

/**
 * Redraws every open screen when the language changes. The React Compiler caches rendered output,
 * so text built from fixed lists (option catalogs, plans, rewards) would otherwise keep the old
 * language. Navigation history is kept; only what's drawn on each screen is rebuilt. The same
 * happens when translated lesson content arrives from the server.
 */
function RedrawOnLanguageChange({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const catalog = useCatalogVersion();
  // Courses arrive from the server after start; screens built from the old list redraw too.
  const { catalogVersion: courses } = useCourses();
  return <Fragment key={`${language}|${catalog}|${courses}`}>{children}</Fragment>;
}

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.background,
    card: Colors.surface,
    primary: Colors.primary,
    text: Colors.text,
    border: Colors.border,
  },
};

/** The longest the app waits for its fonts before showing anyway. */
const FONT_WAIT_MS = 4000;

function RootNavigator() {
  const { user, loading } = useSession();
  const desktop = useDesktop();
  const [fontsDone, fontError] = useFonts({
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  // Fonts never hold the app back for long. In Safari (every iPhone browser) expo-font's load check fails,
  // or never answers, even though the fonts have arrived, and waiting for it left iPhones on the loading
  // screen for good. So the app goes ahead on an error or after a few seconds; the fonts still apply once
  // they're in, or the browser's own font stands in.
  const [fontWaitOver, setFontWaitOver] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setFontWaitOver(true), FONT_WAIT_MS);
    return () => clearTimeout(timer);
  }, []);
  const fontsLoaded = fontsDone || !!fontError || fontWaitOver;

  const { ready: languageReady } = useLanguage();

  // The native splash hands over to the animated one as soon as fonts are ready.
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);
  // The web version's loading screen (put in app.html by scripts/web-site.mjs) fades out once the fonts
  // and the student's language have arrived, so the app never flashes up in English first.
  useEffect(() => {
    if (!fontsLoaded || !languageReady) return;
    const boot = Platform.OS === 'web' && typeof document !== 'undefined' ? document.getElementById('kz-boot') : null;
    if (boot) {
      boot.style.opacity = '0';
      setTimeout(() => boot.remove(), 400);
    }
  }, [fontsLoaded, languageReady]);
  if (!fontsLoaded) return null;

  const inApp = !!user?.onboardingComplete;
  const teacher = user?.role === 'teacher';
  // A suspended account keeps only help, settings (data download, log out) and the status screen.
  const active = inApp && user?.restriction?.kind !== 'suspended';

  return (
    <>
      {/* Mount routes only once the session is known, so deep links aren't redirected by a guard that hasn't loaded yet. */}
      {!loading && (
        // On a computer the web version keeps a sidebar beside every screen. The Stack stays in the same
        // place in the tree either way, so resizing the window never resets navigation.
        // "Hey Kora" works on every page of the web version, for students who switch it on, and opens the
        // board beside the page (to the right on a computer, below on a phone).
        <TutorProvider enabled={active && !teacher}>
          <WakeProvider enabled={active && !teacher}>
            <View style={{ flex: 1, flexDirection: desktop ? 'row' : 'column' }}>
              {desktop && active && !teacher && <DesktopSidebar />}
              <View style={{ flex: 1 }}>
                <Stack
                  screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}
                  screenLayout={({ children }) => <RedrawOnLanguageChange>{children}</RedrawOnLanguageChange>}>
                  <Stack.Screen name="index" options={{ animation: 'none' }} />
                  <Stack.Screen name="legal" />
                  <Stack.Protected guard={active && !teacher}>
                    <Stack.Screen name="(student)" />
                    <Stack.Screen name="world" />
                    <Stack.Screen name="rewards" />
                    <Stack.Screen name="billing" />
                  </Stack.Protected>
                  <Stack.Protected guard={active && teacher}>
                    <Stack.Screen name="(teacher)" />
                  </Stack.Protected>
                  <Stack.Protected guard={active}>
                    <Stack.Screen name="study" />
                    <Stack.Screen name="videos" />
                    <Stack.Screen name="courses" />
                    <Stack.Screen name="exams" />
                    <Stack.Screen name="reels" />
                    <Stack.Screen name="rooms" />
                    <Stack.Screen name="books" />
                    <Stack.Screen name="referrals" />
                  </Stack.Protected>
                  <Stack.Protected guard={inApp}>
                    <Stack.Screen name="settings" />
                    <Stack.Screen name="help" />
                    <Stack.Screen name="account-status" />
                  </Stack.Protected>
                  <Stack.Protected guard={!inApp}>
                    <Stack.Screen name="(auth)" />
                  </Stack.Protected>
                </Stack>
              </View>
              <KoraPanel />
            </View>
          </WakeProvider>
        </TutorProvider>
      )}
      <AnimatedSplash ready={!loading} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={navTheme}>
      <AppearanceProvider>
        <SessionProvider>
          <RewardsProvider>
            <MaterialsProvider>
              <CoursesProvider>
                <WorldProvider>
                  <SafetyProvider>
                    <LanguageProvider>
                      <CatalogProvider>
                        {/* Inside the catalogue so built-in videos follow the language. */}
                        <VideosProvider>
                          <TextbooksProvider>
                            <ReminderSync />
                            <StatusBar style="light" />
                            <RootNavigator />
                          </TextbooksProvider>
                        </VideosProvider>
                      </CatalogProvider>
                    </LanguageProvider>
                  </SafetyProvider>
                </WorldProvider>
              </CoursesProvider>
            </MaterialsProvider>
          </RewardsProvider>
        </SessionProvider>
      </AppearanceProvider>
    </ThemeProvider>
  );
}
