import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';

export default function CoursesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Colors.background },
      }}>
      <Stack.Screen name="[id]/rate" options={{ presentation: 'modal' }} />
      <Stack.Screen name="[id]/complete" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="[id]/lesson/[lessonId]/notes" options={{ presentation: 'modal' }} />
      <Stack.Screen name="[id]/lesson/[lessonId]/resources" options={{ presentation: 'modal' }} />
      <Stack.Screen name="[id]/lesson/[lessonId]/results" options={{ animation: 'fade' }} />
    </Stack>
  );
}
