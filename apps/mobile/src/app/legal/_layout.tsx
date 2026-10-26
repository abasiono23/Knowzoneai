import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';

/** Legal pages are readable before signing in (from sign-up) and inside the app. */
export default function LegalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Colors.background },
      }}
    />
  );
}
