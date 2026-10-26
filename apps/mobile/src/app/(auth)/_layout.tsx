import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';

export const unstable_settings = { anchor: 'welcome' };

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Colors.background },
      }}>
      <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      <Stack.Screen name="get-started" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="social" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="verified" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="referral" options={{ gestureEnabled: false }} />
      <Stack.Screen name="all-set" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="personalize" options={{ animation: 'fade' }} />
    </Stack>
  );
}
