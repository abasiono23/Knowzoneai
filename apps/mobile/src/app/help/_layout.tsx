import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';

export default function HelpLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Colors.background },
      }}>
      <Stack.Screen name="report" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
