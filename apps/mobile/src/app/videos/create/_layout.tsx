import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';
import { VideoDraftProvider } from '@/lib/videos/draft';

export default function CreateVideoLayout() {
  return (
    <VideoDraftProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: Colors.background },
        }}
      />
    </VideoDraftProvider>
  );
}
