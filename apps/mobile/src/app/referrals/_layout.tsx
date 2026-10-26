import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';

export default function ReferralsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Colors.background },
      }}>
      <Stack.Screen name="terms" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
