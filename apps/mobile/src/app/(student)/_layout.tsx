import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';
import { LibraryProvider } from '@/lib/library-store';
import { TutorProvider } from '@/lib/tutor/store';

export default function StudentLayout() {
  return (
    <LibraryProvider>
      <TutorProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: Colors.background },
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="create"
            options={{
              presentation: 'transparentModal',
              animation: 'fade',
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
          <Stack.Screen name="search/index" options={{ animation: 'fade' }} />
          <Stack.Screen name="tutor/save-note" options={{ presentation: 'modal' }} />
          <Stack.Screen name="tutor/limit" options={{ presentation: 'modal' }} />
        </Stack>
      </TutorProvider>
    </LibraryProvider>
  );
}
