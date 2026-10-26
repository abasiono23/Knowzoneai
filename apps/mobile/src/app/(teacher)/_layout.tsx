import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';

export default function TeacherLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Colors.background },
      }}>
      <Stack.Screen name="(teach)" />
      <Stack.Screen name="class/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="assignment/new" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
