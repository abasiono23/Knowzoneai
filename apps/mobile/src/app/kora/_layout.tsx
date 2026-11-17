import { Stack } from 'expo-router';

/** Lessons with Kora: the list, and the lesson player. */
export default function KoraLessonsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" options={{ animation: 'fade', contentStyle: { backgroundColor: '#160A4D' } }} />
    </Stack>
  );
}
