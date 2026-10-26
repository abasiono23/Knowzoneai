import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';

export default function VideosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Colors.backgroundDeep },
      }}>
      <Stack.Screen name="index" options={{ animation: 'fade' }} />
      <Stack.Screen name="[id]/save" options={{ presentation: 'modal' }} />
      <Stack.Screen name="[id]/share" options={{ presentation: 'modal' }} />
      <Stack.Screen name="[id]/report" options={{ presentation: 'modal' }} />
      <Stack.Screen name="generate/[id]" options={{ animation: 'fade', gestureEnabled: false }} />
    </Stack>
  );
}
