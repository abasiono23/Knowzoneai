import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';

export default function WorldLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Colors.backgroundDeep },
      }}>
      <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
      <Stack.Screen name="play/[levelId]" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="battle/[levelId]" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="minigame/[levelId]" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="puzzle/[levelId]" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="results/[levelId]" options={{ animation: 'fade' }} />
      <Stack.Screen name="complete/[levelId]" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="unlock/[worldId]" options={{ animation: 'fade' }} />
      <Stack.Screen name="english/[game]/play" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="chemistry/index" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="space/index" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="history/index" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="tech/index" options={{ animation: 'fade', gestureEnabled: false }} />
    </Stack>
  );
}
