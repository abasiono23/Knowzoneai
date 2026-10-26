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
import { Fragment, useEffect, type ReactNode } from 'react';

import '@/i18n';

import { AnimatedSplash } from '@/components/brand/animated-splash';
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

function RootNavigator() {
  const { user, loading } = useSession();
  const [fontsLoaded] = useFonts({
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  // The native splash hands over to the animated one as soon as fonts are ready.
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);
  if (!fontsLoaded) return null;

  const inApp = !!user?.onboardingComplete;
  const teacher = user?.role === 'teacher';
  // A suspended account keeps only help, settings (data download, log out) and the status screen.
  const active = inApp && user?.restriction?.kind !== 'suspended';

  return (
    <>
      {/* Mount routes only once the session is known, so deep links aren't redirected by a guard that hasn't loaded yet. */}
      {!loading && (
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
                            <ReminderSync />
                            <StatusBar style="light" />
                            <RootNavigator />
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
