import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';
import { PersonalizationProvider } from '@/lib/personalization-store';

export const unstable_settings = { anchor: 'learner-type' };

export default function PersonalizeLayout() {
  return (
    <PersonalizationProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: Colors.background },
        }}>
        <Stack.Screen name="plan" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="start" options={{ animation: 'fade', gestureEnabled: false }} />
      </Stack>
    </PersonalizationProvider>
  );
}
