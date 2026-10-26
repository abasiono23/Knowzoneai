import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';

export default function StudyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Colors.background },
      }}>
      <Stack.Screen name="status/[id]" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="[id]/export" options={{ presentation: 'modal' }} />
      <Stack.Screen name="[id]/save" options={{ presentation: 'modal' }} />
      <Stack.Screen name="[id]/edit" options={{ presentation: 'modal' }} />
      <Stack.Screen name="[id]/delete" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
