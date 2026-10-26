import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';

export default function RewardsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Colors.background },
      }}>
      <Stack.Screen name="[rewardId]/redeem" options={{ presentation: 'modal' }} />
      <Stack.Screen name="[rewardId]/success" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="[rewardId]/unavailable" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
