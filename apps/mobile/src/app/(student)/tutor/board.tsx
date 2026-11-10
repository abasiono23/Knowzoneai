import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookBackground } from '@/components/brand/book-background';
import { KoraBoard } from '@/components/whiteboard/kora-board';
import { useWake } from '@/lib/whiteboard/wake';

/**
 * Kora's whiteboard as a full page, opened from the tutor. ("Hey Kora" on other pages opens it in a
 * panel beside the page instead, so the student can still see what they're asking about.)
 */
export default function KoraBoardPage() {
  // `q`: a question said on the tutor page. `listen`: opened by "Hey Kora", so listen for the question.
  const { q, listen } = useLocalSearchParams<{ q?: string; listen?: string }>();
  const wake = useWake();
  const asked = useCallback(() => router.setParams({ q: undefined }), []);
  return (
    <View style={{ flex: 1 }}>
      <BookBackground />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <KoraBoard question={q} listenNow={listen === '1'} listenFromStart={wake.on} onAsked={asked} />
      </SafeAreaView>
    </View>
  );
}
