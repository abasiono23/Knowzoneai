import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Colors.background },
      }}>
      <Stack.Screen name="logout" options={{ presentation: 'transparentModal', animation: 'fade' }} />
      <Stack.Screen name="photo" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
